"""Explicit opt-in Atlas smoke check. Never prints configuration or driver errors.

Run: python -m app.verify_database (from backend, or after editable install).
Writes only UUID-labelled verification records; removes those exact records.
"""

from uuid import uuid4

from pydantic import ValidationError
from pymongo import timeout
from pymongo.errors import ConfigurationError, DuplicateKeyError, InvalidURI, OperationFailure, PyMongoError, ServerSelectionTimeoutError

from .config import Settings
from .database import Database
from .repositories.base import DatabaseUnavailable
from .repositories.weather import WeatherIdentity


def verify(database: Database) -> None:
    token = "b02-verification-" + uuid4().hex
    weather_id = WeatherIdentity(
        region_id="delhi", coordinate_version=token, model="era5", year=1990, schema_version=1,
    )
    weather_filter = weather_id.model_dump()
    analysis_filter = {"analysis_key": token}
    try:
        assert database.weather.get(weather_id) is None
        assert database.analyses.get(token) is None
        for revision in (1, 2):
            # These are tagged persistence fixtures, not normalized weather or results.
            assert database.weather.save(weather_id, {"verification_only": True, "revision": revision})["revision"] == revision
            assert database.analyses.save(token, {"verification_only": True, "revision": revision})["revision"] == revision
        assert database.weather.get(weather_id)["revision"] == 2
        assert database.analyses.get(token)["revision"] == 2
        with timeout(database.timeout_ms / 1000):
            for collection, identity in (
                (database.db.weather_years, weather_filter),
                (database.db.analyses, analysis_filter),
            ):
                assert collection.count_documents(identity) == 1
                try:
                    collection.insert_one(dict(identity))
                except DuplicateKeyError:
                    pass
                else:
                    raise AssertionError("Unique index did not reject a duplicate")
    finally:
        with timeout(database.timeout_ms / 1000):
            database.db.weather_years.delete_one(weather_filter)
            database.db.analyses.delete_one(analysis_filter)


def failure_hint(error: Exception) -> str:
    """Inspect causes internally; return only fixed, credential-free guidance."""
    current = error
    while current is not None:
        if isinstance(current, InvalidURI):
            if "escaped" in str(current) or "RFC 3986" in str(current):
                return "The URI username or password contains characters that must be URL-encoded. Encode only the credential components, not the whole URI."
            return "The connection URI format is invalid. Check the Atlas URI and URL-encoded credentials."
        if isinstance(current, OperationFailure):
            if current.code == 18:
                return "Atlas authentication failed. Check the database username/password and auth database."
            if current.code == 13:
                return "Atlas denied an operation. Check the user's readWrite role on the application database."
        if isinstance(current, ConfigurationError):
            return "MongoDB configuration or SRV/DNS lookup failed. Check the Atlas hostname and DNS connectivity."
        if isinstance(current, ServerSelectionTimeoutError):
            message = str(current).lower()
            if "tlsv1_alert_internal_error" in message:
                return "Atlas returned a TLS internal-error alert. Check that Atlas Network Access allows this machine's current public IP, then retry."
            if "certificate_verify_failed" in message or "certificate verify failed" in message:
                return "MongoDB certificate verification failed. Check trusted CA certificates and network TLS interception; keep certificate validation enabled."
            if any(marker in message for marker in ("ssl", "tls", "certificate")):
                return "MongoDB TLS negotiation failed. Check network/security interception, trusted certificates, and Atlas network access; keep certificate validation enabled."
            return "No MongoDB server became reachable within the timeout. Check the Atlas IP allowlist, cluster availability, firewall, and TLS connectivity."
        current = current.__context__
    return "Check local configuration, Atlas access, and permissions."


def main() -> int:
    database = None
    try:
        settings = Settings()
        if settings.mongodb_uri is None:
            print("NOT RUN: configure MONGODB_URI in backend/.env first.")
            return 2
        database = Database.connect(settings)
        verify(database)
        print("PASS: database ping, repository write/read, upsert, unique indexes, and verification-record cleanup.")
        return 0
    except (DatabaseUnavailable, PyMongoError, ValidationError, ValueError, OSError, AssertionError) as error:
        print("FAIL: database verification failed. " + failure_hint(error) + " No connection details are printed.")
        return 1
    finally:
        if database is not None:
            database.close()


if __name__ == "__main__":
    raise SystemExit(main())
