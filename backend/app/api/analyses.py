from fastapi import APIRouter, Request

from ..analysis_schemas import AnalysisResponse
from ..repositories.base import DatabaseUnavailable
from ..schemas import ErrorResponse, Selection

router = APIRouter(prefix="/api/v1")


@router.post("/analyses", response_model=AnalysisResponse,
             responses={status: {"model": ErrorResponse} for status in (403, 408, 413, 422, 429, 502, 503, 504)})
def analyze(selection: Selection, request: Request):
    service = getattr(request.app.state, "analysis", None)
    if service is None:
        raise DatabaseUnavailable()
    # Sync route: database, HTTP, and calculations stay off the async event loop.
    limits = request.app.state.request_limits
    result = service.analyze(selection, admit_cold=lambda: limits.cold(request.scope["client_identity"]),
                             request_deadline=request.scope["request_deadline"])
    request.scope["analysis_cache_status"] = result["source"]["analysis_cache_status"]
    return result
