"""Service foundation: health, city configuration, and safe errors."""

from http import HTTPStatus
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException
from starlette.concurrency import run_in_threadpool

from .config import Settings
from .database import Database
from .repositories.base import DatabaseUnavailable
from .services.weather import WeatherService
from .services.analysis import AnalysisService, AnalysisLimit, AnalysisDataUnavailable
from .services.weather_data import InvalidWeatherPayload
from .services.weather_provider import ProviderUnavailable, ProviderRateLimited, WeatherOperationTimeout
from .climate.threshold import InsufficientBaselineData
from .api.analyses import router as analyses_router
from .limits import RequestLimits
from .operations import OperationalMiddleware, configure_request_logging
from .regions import REGIONS
from .schemas import ErrorBody, ErrorResponse, HealthResponse, RegionsResponse, ValidationDetail


def error_response(status: int, code: str, message: str, details=None) -> JSONResponse:
    body = ErrorResponse(error=ErrorBody(code=code, message=message, details=details))
    return JSONResponse(status_code=status, content=body.model_dump(exclude_none=True))


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings if settings is not None else Settings()
    configure_request_logging()
    @asynccontextmanager
    async def lifespan(application: FastAPI):
        application.state.database = None
        application.state.weather = None
        application.state.analysis = None
        if settings.mongodb_uri is not None:
            application.state.database = await run_in_threadpool(Database.connect, settings)
        try:
            if application.state.database is not None:
                application.state.weather = WeatherService(application.state.database.weather, settings)
                application.state.analysis = AnalysisService(application.state.weather, application.state.database.analyses, settings)
            yield
        finally:
            application.state.analysis = None
            try:
                if application.state.weather is not None:
                    await run_in_threadpool(application.state.weather.close)
            finally:
                application.state.weather = None
                if application.state.database is not None:
                    await run_in_threadpool(application.state.database.close)
                    application.state.database = None

    application = FastAPI(title="Climate Hazard Trend Analyzer", version="0.1.0", lifespan=lifespan)
    application.state.request_limits = RequestLimits(settings)
    application.add_middleware(OperationalMiddleware, settings=settings, limits=application.state.request_limits)
    if settings.allowed_origins:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=settings.allowed_origins,
            allow_credentials=False,
            allow_methods=["GET", "POST"],
            allow_headers=["Content-Type"],
            expose_headers=["Retry-After"],
        )

    @application.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError):
        # Never echo submitted values, request bodies, or exception context.
        details = [
            ValidationDetail(
                field=".".join(str(part) if isinstance(part, int) or part in {
                    "body", "query", "path", "region_id", "start_year", "end_year", "hazard"
                } else "field" for part in item["loc"]),
                code=item["type"],
                message="Invalid value for this field.",
            )
            for item in exc.errors()
        ]
        return error_response(422, "invalid_input", "Request validation failed.", details)

    @application.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException):
        try:
            message = HTTPStatus(exc.status_code).phrase
        except ValueError:
            message = "HTTP request failed."
        response = error_response(exc.status_code, "http_error", message)
        response.headers.update(exc.headers or {})
        return response

    @application.exception_handler(Exception)
    async def unexpected_error(request: Request, exc: Exception):
        return error_response(500, "internal_error", "An unexpected error occurred.")

    @application.exception_handler(DatabaseUnavailable)
    async def database_error(request: Request, exc: DatabaseUnavailable):
        return error_response(503, "database_unavailable", "Database is unavailable. Please retry later.")

    @application.exception_handler(InsufficientBaselineData)
    async def insufficient_baseline(request: Request, exc: InsufficientBaselineData):
        return error_response(422, exc.code, str(exc))

    @application.exception_handler(InvalidWeatherPayload)
    async def invalid_weather(request: Request, exc: InvalidWeatherPayload):
        return error_response(502, "invalid_weather_data", "Historical weather data failed validation.")

    @application.exception_handler(ProviderUnavailable)
    async def provider_failure(request: Request, exc: ProviderUnavailable):
        if isinstance(exc, ProviderRateLimited):
            response = error_response(429, "provider_rate_limited", "Weather provider is rate limited. Please retry later.")
            if hasattr(exc, "retry_after"):
                response.headers["Retry-After"] = str(exc.retry_after)
            return response
        return error_response(502, "provider_unavailable", "Historical weather provider is unavailable.")

    @application.exception_handler(WeatherOperationTimeout)
    async def weather_timeout(request: Request, exc: WeatherOperationTimeout):
        return error_response(504, "operation_timeout", "Analysis exceeded its time budget. Please retry later.")

    @application.exception_handler(AnalysisLimit)
    async def analysis_limit(request: Request, exc: AnalysisLimit):
        return error_response(503, exc.code, "Analysis capacity or output limit reached. Try a smaller range or retry later.")

    @application.exception_handler(AnalysisDataUnavailable)
    async def selected_data_unavailable(request: Request, exc: AnalysisDataUnavailable):
        return error_response(422, "insufficient_weather_data", "Selected complete calendar years are not yet available from the weather source.")

    application.include_router(analyses_router)

    @application.get("/api/v1/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse()

    @application.get("/api/v1/regions", response_model=RegionsResponse)
    def regions() -> RegionsResponse:
        return RegionsResponse(regions=REGIONS)

    return application


app = create_app()
