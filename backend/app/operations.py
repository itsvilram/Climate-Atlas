"""ASGI admission/body limits and closed-field request logs; no raw inputs."""
import json
import logging
import time
from threading import Lock

import anyio
from starlette.responses import JSONResponse

from .limits import RateLimitExceeded

logger = logging.getLogger("climate.requests")


def configure_request_logging():
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter("%(message)s"))
        logger.addHandler(handler)


class BodyTooLarge(Exception):
    pass


class RequestBodyTimeout(Exception):
    pass


class OperationalMiddleware:
    def __init__(self, app, settings, limits):
        self.app, self.settings, self.limits = app, settings, limits
        self._active = 0
        self._guard = Lock()

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or not scope["path"].startswith("/api/v1/"):
            return await self.app(scope, receive, send)
        start = time.monotonic()
        scope["request_deadline"] = start + self.settings.weather_operation_timeout_seconds
        status, started, finished = 500, False, False
        admitted = False
        identity = self.limits.client_identity(scope)
        scope["client_identity"] = identity
        route = scope["path"] if scope["path"] in {"/api/v1/health", "/api/v1/regions", "/api/v1/analyses"} else "/api/v1/other"
        method = scope["method"] if scope["method"] in {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"} else "OTHER"

        async def tracked_send(message):
            nonlocal status, started, finished
            if message["type"] == "http.response.start":
                status, started = message["status"], True
            if message["type"] == "http.response.body" and not message.get("more_body", False):
                finished = True
            await send(message)

        async def reject(code, message, status_code, headers=None):
            await JSONResponse({"error": {"code": code, "message": message}}, status_code=status_code, headers=headers)(scope, receive, tracked_send)

        try:
            origins = [value.decode("latin-1") for key, value in scope["headers"] if key.lower() == b"origin"]
            if origins and (len(origins) != 1 or origins[0] not in self.settings.allowed_origins):
                return await reject("origin_not_allowed", "Request origin is not allowed.", 403)
            if method != "OPTIONS":
                self.limits.general(identity)
                with self._guard:
                    capacity = self._active < self.settings.request_max_concurrent
                    if capacity:
                        self._active += 1
                        admitted = True
                if not capacity:
                    return await reject("request_capacity", "Request capacity reached. Please retry later.", 503, {"Retry-After": "1"})
            lengths = [value for key, value in scope["headers"] if key.lower() == b"content-length"]
            if lengths:
                try:
                    if len(lengths) != 1 or not lengths[0].isdigit():
                        return await reject("invalid_input", "Invalid request framing.", 400)
                    if int(lengths[0]) > self.settings.request_max_body_bytes:
                        raise BodyTooLarge()
                except ValueError:
                    return await reject("invalid_input", "Invalid request framing.", 400)
            size = 0
            chunks = []
            body_deadline = start + min(10, self.settings.weather_operation_timeout_seconds)
            while True:
                remaining = body_deadline - time.monotonic()
                if remaining <= 0:
                    raise RequestBodyTimeout()
                try:
                    with anyio.fail_after(remaining):
                        message = await receive()
                except TimeoutError:
                    raise RequestBodyTimeout() from None
                if message["type"] == "http.request":
                    size += len(message.get("body", b""))
                    if size > self.settings.request_max_body_bytes:
                        raise BodyTooLarge()
                    if message.get("body"):
                        chunks.append(message["body"])
                    if not message.get("more_body", False):
                        break
                elif message["type"] == "http.disconnect":
                    return

            replayed = False
            async def bounded_receive():
                nonlocal replayed
                if not replayed:
                    replayed = True
                    return {"type": "http.request", "body": b"".join(chunks), "more_body": False}
                return await receive()

            await self.app(scope, bounded_receive, tracked_send)
        except RateLimitExceeded as error:
            await reject(error.code, "Request limit reached. Please retry later.", 429,
                         {"Retry-After": str(error.retry_after)})
        except BodyTooLarge:
            await reject("request_too_large", "Request body exceeds the configured limit.", 413)
        except RequestBodyTimeout:
            await reject("request_timeout", "Request body timed out.", 408)
        except Exception:
            # Do not rethrow raw exception text into server request logs.
            if not started:
                await reject("internal_error", "An unexpected error occurred.", 500)
            elif not finished:
                await tracked_send({"type": "http.response.body", "body": b"", "more_body": False})
        finally:
            if admitted:
                with self._guard:
                    self._active -= 1
            cache = scope.get("analysis_cache_status", "none")
            if cache not in {"computed", "hit", "coalesced", "none"}:
                cache = "none"
            logger.info(json.dumps({"route": route, "method": method, "status": status,
                                    "duration_ms": round((time.monotonic() - start) * 1000, 2), "cache": cache}))
