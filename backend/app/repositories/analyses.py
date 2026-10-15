"""Analysis persistence; result generation and cache policy belong to B07."""

from collections.abc import Mapping
from typing import Any

from .base import DocumentRepository
from .base import DatabaseUnavailable
from pymongo import timeout
from pymongo.errors import PyMongoError


class AnalysisRepository(DocumentRepository):
    @staticmethod
    def _identity(analysis_key: str) -> dict[str, str]:
        if not isinstance(analysis_key, str) or not analysis_key or len(analysis_key) > 200:
            raise ValueError("A non-empty analysis key of at most 200 characters is required.")
        return {"analysis_key": analysis_key}

    def get(self, analysis_key: str) -> dict | None:
        return self._get(self._identity(analysis_key))

    def save(self, analysis_key: str, payload: Mapping[str, Any]) -> dict:
        return self._save(self._identity(analysis_key), payload)

    def latest(self, selection_key: str) -> dict | None:
        try:
            with timeout(self.timeout_seconds):
                return self.collection.find_one(
                    {"cache_namespace": "analysis-v1", "selection_key": selection_key},
                    {"_id": 0}, sort=[("last_accessed_at", -1)],
                )
        except PyMongoError:
            raise DatabaseUnavailable() from None

    def prune(self, selection_key: str, analysis_key: str, pipeline_signature: str, maximum: int) -> None:
        """Remove obsolete app records only; never touch unrelated documents."""
        try:
            with timeout(self.timeout_seconds):
                namespace = {"cache_namespace": "analysis-v1"}
                self.collection.delete_many({**namespace, "pipeline_signature": {"$ne": pipeline_signature}})
                self.collection.delete_many({**namespace, "selection_key": selection_key, "analysis_key": {"$ne": analysis_key}})
                while True:
                    obsolete = list(self.collection.find(namespace, {"_id": 1})
                                    .sort([("last_accessed_at", -1), ("_id", -1)]).skip(maximum).limit(500))
                    if not obsolete:
                        break
                    self.collection.delete_many({**namespace, "_id": {"$in": [item["_id"] for item in obsolete]}})
        except PyMongoError:
            raise DatabaseUnavailable() from None
