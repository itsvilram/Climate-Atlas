"""Database-backed analysis orchestration, bounded cache, and process coalescing."""
from concurrent.futures import Future, TimeoutError as FutureTimeout
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
from threading import Lock
import time

from pydantic import ValidationError
from pymongo import timeout

from ..analysis_schemas import AnalysisResponse
from ..climate.events import MINIMUM_RUN_DAYS
from ..climate.insights import analyze_metrics
from ..climate.threshold import BASELINE_START_YEAR, BASELINE_END_YEAR, THRESHOLD_METHOD_VERSION, calculate_threshold
from ..regions import REGION_COORDINATE_VERSION
from .events import detect_with_context
from .weather_data import ATTRIBUTION, MODEL, SCHEMA_VERSION, SOURCE_MIN_YEAR, InvalidWeatherPayload
from .weather_provider import ProviderUnavailable, WeatherOperationTimeout
from .weather import required_years

METHOD_VERSION = "heatwave-analysis-v1"


def digest(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


PIPELINE_SIGNATURE = digest({"method": METHOD_VERSION, "threshold": THRESHOLD_METHOD_VERSION,
                             "baseline": [BASELINE_START_YEAR, BASELINE_END_YEAR], "minimum_run": MINIMUM_RUN_DAYS,
                             "coordinate_version": REGION_COORDINATE_VERSION, "model": MODEL, "schema": SCHEMA_VERSION})


class AnalysisLimit(Exception):
    def __init__(self, code="analysis_busy"):
        self.code = code
        super().__init__("Analysis capacity or output limit reached.")


class AnalysisDataUnavailable(Exception):
    pass


def public_event(event: dict) -> dict:
    return {key: value for key, value in event.items() if key != "observed_days"}


class AnalysisService:
    def __init__(self, weather, repository, settings):
        self.weather, self.repository, self.settings = weather, repository, settings
        self._guard = Lock()
        self._weather_lock = Lock()
        self._inflight: dict[str, Future] = {}

    def analyze(self, selection, *, admit_cold=None, request_deadline=None) -> dict:
        request_key = digest(selection.model_dump())
        deadline = time.monotonic() + self.settings.weather_operation_timeout_seconds
        if request_deadline is not None:
            deadline = min(deadline, request_deadline)
        if time.monotonic() >= deadline:
            raise WeatherOperationTimeout()
        with self._guard:
            future = self._inflight.get(request_key)
            leader = future is None
            if leader:
                if len(self._inflight) >= self.settings.analysis_max_pending:
                    raise AnalysisLimit()
                future = Future()
                self._inflight[request_key] = future
        if not leader:
            try:
                result = deepcopy(future.result(timeout=max(0.001, deadline - time.monotonic())))
                result["source"]["analysis_cache_status"] = "coalesced"
                return self._bounded(result)
            except FutureTimeout:
                raise WeatherOperationTimeout() from None
        try:
            if not self._weather_lock.acquire(timeout=max(0.001, deadline - time.monotonic())):
                raise WeatherOperationTimeout()
            try:
                if time.monotonic() >= deadline:
                    raise WeatherOperationTimeout()
                admitted = False
                def admit_once():
                    nonlocal admitted
                    if not admitted and admit_cold is not None:
                        admit_cold()
                        admitted = True
                result = self._execute(selection, deadline, admit_once)
            finally:
                self._weather_lock.release()
            future.set_result(result)
            return deepcopy(result)
        except Exception as error:
            future.set_exception(error)
            raise
        finally:
            with self._guard:
                self._inflight.pop(request_key, None)

    @staticmethod
    def _manifest(operation):
        return {str(year): cached.document["revision"] for year, cached in sorted(operation.years.items())}

    def _bounded(self, result):
        response = AnalysisResponse.model_validate(result).model_dump(mode="json")
        if len(response["events"]) > self.settings.analysis_max_events:
            raise AnalysisLimit("analysis_output_limit")
        if len(json.dumps(response, separators=(",", ":"), allow_nan=False).encode()) > self.settings.analysis_max_response_bytes:
            raise AnalysisLimit("analysis_output_limit")
        return response

    def _current_metadata(self, result, operation, intrinsic_warnings, cache_status):
        result = deepcopy(result)
        warnings = set(intrinsic_warnings)
        for cached in operation.years.values():
            warnings.update(cached.warnings)
        result["data_quality"]["warnings"] = sorted(warnings)
        result["source"]["analysis_cache_status"] = cache_status
        result["source"]["weather_years"] = [
            {"year": year, "revision": cached.document["revision"],
             "fetched_at": cached.document["fetched_at"], "cache_status": cached.cache_status,
             "grid_coordinates": cached.document["grid_coordinates"], "timezone": cached.document["timezone"],
             "coverage": cached.document["quality"]["coverage"]}
            for year, cached in sorted(operation.years.items())
        ]
        return self._bounded(result)

    def _candidate(self, stored, operation, selection, selection_key):
        if not stored or stored.get("pipeline_signature") != PIPELINE_SIGNATURE:
            return None
        try:
            if digest(stored["result"]) != stored["result_hash"]:
                return None
            response = AnalysisResponse.model_validate(stored["result"])
            if response.region.model_dump() != operation.region.model_dump():
                return None
            if response.period.model_dump() != {key: value for key, value in selection.model_dump().items() if key != "region_id"}:
                return None
            intrinsic = stored["intrinsic_warnings"]
            if any(code in intrinsic for code in ("context_time_limit", "context_weather_unavailable")):
                return None  # Retry transiently incomplete boundary work.
            manifest = stored["source_revisions"]
            if not isinstance(manifest, dict) or len(manifest) > self.settings.weather_max_years:
                return None
            if any(manifest.get(year) != revision for year, revision in self._manifest(operation).items()):
                return None
            extra = {int(year) for year in manifest} - operation.years.keys()
            if any(year < SOURCE_MIN_YEAR or year > operation.maximum_year for year in extra):
                return None
            while extra:
                adjacent = next((year for year in sorted(extra) if year - 1 in operation.years or year + 1 in operation.years), None)
                if adjacent is None:
                    return None
                operation.load_year(adjacent)
                extra.remove(adjacent)
            if self._manifest(operation) != manifest:
                return None
            key = digest({"selection": selection_key, "revisions": manifest, "warnings": intrinsic})
            if key != stored["analysis_key"]:
                return None
            return self._current_metadata(response.model_dump(mode="json"), operation, intrinsic, "hit")
        except (KeyError, TypeError, ValueError, ValidationError, ProviderUnavailable, InvalidWeatherPayload):
            return None

    def _persist(self, key, payload, operation):
        payload = {**payload, "last_accessed_at": datetime.now(timezone.utc),
                   "result_hash": digest(payload["result"])}
        with timeout(operation.budget.remaining()):
            self.repository.save(key, payload)
            self.repository.prune(payload["selection_key"], key, PIPELINE_SIGNATURE, self.settings.analysis_max_cache_entries)
            saved = self.repository.get(key)
        if saved is None:
            from ..repositories.base import DatabaseUnavailable
            raise DatabaseUnavailable()
        return self._bounded(saved["result"])

    def _execute(self, selection, deadline, admit_cold):
        operation = self.weather.operation(selection.region_id)
        operation.cold_admission = admit_cold
        operation.budget.deadline = min(operation.budget.deadline, deadline)
        if selection.end_year > operation.maximum_year:
            raise AnalysisDataUnavailable()
        if len(required_years(selection, operation.maximum_year)) > self.settings.weather_max_years:
            raise AnalysisLimit("weather_context_limit")
        operation.load_selection(selection)  # Freshness BEFORE analysis reuse.
        selection_key = digest({"request": selection.model_dump(), "pipeline": PIPELINE_SIGNATURE,
                                "maximum_source_year": operation.maximum_year, "maximum_years": self.settings.weather_max_years})
        with timeout(operation.budget.remaining()):
            stored = self.repository.latest(selection_key)
        cached = self._candidate(stored, operation, selection, selection_key)
        if cached is not None:
            return self._persist(stored["analysis_key"], {**{k: v for k, v in stored.items() if k != "analysis_key"}, "result": cached}, operation)

        admit_cold()  # A new computation on fresh stored weather is also cold work.

        def observations():
            return ((day, value) for _, cached in sorted(operation.years.items())
                    for day, value in zip(cached.document["dates"], cached.document["temperature_2m_max"]))

        threshold = calculate_threshold(observations())
        detection = detect_with_context(operation, selection, threshold.threshold_celsius)
        metrics = analyze_metrics(observations(), detection.events, selection.start_year, selection.end_year,
                                  incomplete_years=detection.incomplete_years)
        intrinsic = sorted(set(detection.warnings) - {"stale_weather_data"})
        result = {
            "region": operation.region.model_dump(),
            "period": {key: value for key, value in selection.model_dump().items() if key != "region_id"},
            "methodology": {**threshold.methodology(), "method_version": METHOD_VERSION, "minimum_run_days": MINIMUM_RUN_DAYS},
            "summary": metrics["summary"], "annual_metrics": metrics["annual_metrics"],
            "trend": metrics["trend"], "events": [public_event(event.as_dict()) for event in detection.events],
            "insights": metrics["insights"],
            "data_quality": {"warnings": [], "incomplete_years": [row["year"] for row in metrics["annual_metrics"] if not row["complete"]],
                             "excluded_boundary_events": [public_event(event) for event in metrics["excluded_boundary_events"]],
                             "counting_metadata": metrics["counting_metadata"]},
            "source": {**ATTRIBUTION, "model": MODEL, "coordinate_version": REGION_COORDINATE_VERSION,
                       "weather_schema_version": SCHEMA_VERSION, "generated_at": datetime.now(timezone.utc),
                       "analysis_cache_status": "computed", "weather_years": []},
        }
        result = self._current_metadata(result, operation, intrinsic, "computed")
        manifest = self._manifest(operation)
        key = digest({"selection": selection_key, "revisions": manifest, "warnings": intrinsic})
        return self._persist(key, {"cache_namespace": "analysis-v1", "selection_key": selection_key,
                                  "pipeline_signature": PIPELINE_SIGNATURE, "source_revisions": manifest,
                                  "intrinsic_warnings": intrinsic, "created_at": datetime.now(timezone.utc), "result": result}, operation)
