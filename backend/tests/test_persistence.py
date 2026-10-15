from unittest.mock import MagicMock

import mongomock
import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr, ValidationError
from pymongo.errors import DuplicateKeyError, OperationFailure, ServerSelectionTimeoutError

from app.config import Settings
from app.database import Database, get_database
from app.main import create_app
from app.repositories.base import DatabaseUnavailable
from app.repositories.weather import WeatherIdentity, WEATHER_IDENTITY_FIELDS
from app.verify_database import verify
from app.verify_database import main as verify_main
from app.verify_database import failure_hint


@pytest.fixture
def database():
    db = Database(mongomock.MongoClient(tz_aware=True), "test", 1000)
    db.ensure_indexes()
    yield db
    db.close()


@pytest.fixture
def identity():
    return WeatherIdentity(region_id="delhi", coordinate_version="1", model="era5", year=1989, schema_version=1)


def test_round_trip_replacement_and_unique_indexes(database, identity):
    assert database.weather.get(identity) is None
    assert database.analyses.get("key") is None
    for revision in (1, 2):
        saved = database.weather.save(identity, {"revision": revision})
        assert saved == {**identity.model_dump(), "revision": revision}
        assert database.weather.get(identity) == saved
        saved = database.analyses.save("key", {"revision": revision})
        assert saved == {"analysis_key": "key", "revision": revision}
        assert database.analyses.get("key") == saved
    assert database.db.weather_years.count_documents({}) == 1
    assert database.db.analyses.count_documents({}) == 1
    for collection, key in [(database.db.weather_years, identity.model_dump()), (database.db.analyses, {"analysis_key": "key"})]:
        with pytest.raises(DuplicateKeyError):
            collection.insert_one(key)


@pytest.mark.parametrize("field,value", [
    ("region_id", "mumbai"), ("coordinate_version", "2"), ("model", "another-model"),
    ("year", 1990), ("schema_version", 2),
])
def test_each_identity_component_distinguishes_documents(database, identity, field, value):
    database.weather.save(identity, {"revision": 1})
    changed = WeatherIdentity.model_validate({**identity.model_dump(), field: value})
    assert database.weather.get(changed) is None
    database.weather.save(changed, {"revision": 2})
    assert database.db.weather_years.count_documents({}) == 2
    assert database.weather.get(identity)["revision"] == 1


def test_index_contract(database):
    weather = database.db.weather_years.index_information()["weather_identity_unique"]
    assert weather["unique"] is True
    assert weather["key"] == [(field, 1) for field in WEATHER_IDENTITY_FIELDS]
    assert database.db.analyses.index_information()["analysis_key_unique"]["unique"] is True


@pytest.mark.parametrize("payload", [{"_id": "bad"}, {"year": 2000}])
def test_payload_cannot_override_identity(database, identity, payload):
    with pytest.raises(ValueError):
        database.weather.save(identity, payload)
    with pytest.raises(ValueError):
        database.analyses.save("key", {"analysis_key": "another"})


def test_concurrent_upsert_duplicate_retries_without_inserting(database, identity, monkeypatch):
    database.weather.save(identity, {"revision": 1})
    original = database.db.weather_years.replace_one
    calls = []

    def replace(key, document, *, upsert):
        calls.append(upsert)
        if upsert:
            raise DuplicateKeyError("secret-canary")
        return original(key, document, upsert=False)

    monkeypatch.setattr(database.db.weather_years, "replace_one", replace)
    assert database.weather.save(identity, {"revision": 2})["revision"] == 2
    assert calls == [True, False]
    assert database.db.weather_years.count_documents({}) == 1


@pytest.mark.parametrize("method", ["find_one", "replace_one"])
def test_driver_failures_are_sanitized(database, identity, monkeypatch, method):
    def fail(*args, **kwargs):
        raise OperationFailure("mongodb://user:secret-canary@host")

    monkeypatch.setattr(database.db.weather_years, method, fail)
    with pytest.raises(DatabaseUnavailable) as error:
        if method == "find_one":
            database.weather.get(identity)
        else:
            database.weather.save(identity, {"revision": 1})
    assert "secret-canary" not in str(error.value)
    assert error.value.__suppress_context__ is True


def test_connect_options_reuse_and_cleanup(monkeypatch):
    client = MagicMock()
    factory = MagicMock(return_value=client)
    monkeypatch.setattr("app.database.MongoClient", factory)
    settings = Settings(_env_file=None, mongodb_uri=SecretStr("mongodb://user:secret-canary@host"))
    database = Database.connect(settings)
    factory.assert_called_once()
    options = factory.call_args.kwargs
    for name in ["serverSelectionTimeoutMS", "connectTimeoutMS", "socketTimeoutMS", "timeoutMS", "waitQueueTimeoutMS"]:
        assert options[name] == 5000
    assert options["maxPoolSize"] == 10
    assert options["w"] == "majority"
    assert options["readPreference"] == "primary"
    assert database.weather.collection is database.db.weather_years
    assert database.analyses.collection is database.db.analyses
    database.db.command.assert_called_once_with("ping")
    database.close()
    client.close.assert_called_once()
    assert "secret-canary" not in repr(settings)


@pytest.mark.parametrize("failure_stage", ["ping", "index"])
def test_failed_startup_closes_client_without_leaking(monkeypatch, failure_stage):
    client = MagicMock()
    db = client.__getitem__.return_value
    if failure_stage == "ping":
        db.command.side_effect = ServerSelectionTimeoutError("secret-canary")
    else:
        db.weather_years.create_index.side_effect = OperationFailure("secret-canary")
    monkeypatch.setattr("app.database.MongoClient", MagicMock(return_value=client))
    with pytest.raises(DatabaseUnavailable) as error:
        Database.connect(Settings(_env_file=None, mongodb_uri="mongodb://user:secret-canary@host"))
    client.close.assert_called_once()
    assert "secret-canary" not in str(error.value)


def test_lifespan_creates_one_database_and_closes_it(monkeypatch, database):
    connect = MagicMock(return_value=database)
    close = MagicMock()
    monkeypatch.setattr(Database, "connect", connect)
    monkeypatch.setattr(database, "close", close)
    app = create_app(Settings(_env_file=None, mongodb_uri="mongodb://unused"))
    with TestClient(app) as client:
        assert app.state.database is database
        assert client.get("/api/v1/health").json() == {"status": "ok"}
        assert client.get("/api/v1/regions").status_code == 200
        connect.assert_called_once()
        close.assert_not_called()
    close.assert_called_once()
    assert app.state.database is None


def test_database_unavailable_returns_safe_503():
    app = create_app(Settings(_env_file=None, mongodb_uri=None))

    @app.get("/test-database")
    def database_route():
        from starlette.requests import Request
        get_database(Request({"type": "http", "app": app}))

    with TestClient(app) as client:
        response = client.get("/test-database")
        assert response.status_code == 503
        assert response.json() == {"error": {"code": "database_unavailable", "message": "Database is unavailable. Please retry later."}}


@pytest.mark.parametrize("changes", [
    {"mongodb_timeout_ms": 0}, {"mongodb_timeout_ms": 60001},
    {"mongodb_max_pool_size": 0}, {"mongodb_db": "bad/name"},
])
def test_invalid_database_configuration(changes):
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **changes)


def test_smoke_check_logic_cleans_up_only_its_own_records(database, identity):
    database.weather.save(identity, {"keep": True})
    database.analyses.save("existing", {"keep": True})
    verify(database)
    assert database.db.weather_years.count_documents({}) == 1
    assert database.db.analyses.count_documents({}) == 1
    assert database.weather.get(identity)["keep"] is True
    assert database.analyses.get("existing")["keep"] is True


def test_malformed_uri_does_not_leak(capsys):
    with pytest.raises(DatabaseUnavailable) as error:
        Database.connect(Settings(_env_file=None, mongodb_uri="invalid://user:secret-canary@host"))
    assert "secret-canary" not in str(error.value)
    output = capsys.readouterr()
    assert "secret-canary" not in output.out + output.err


def test_real_driver_connection_failure_is_bounded_and_safe():
    import socket
    import time

    # Occupy a local port without listening; no external service is contacted.
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
        start = time.monotonic()
        with pytest.raises(DatabaseUnavailable) as error:
            Database.connect(Settings(
                _env_file=None, mongodb_uri=f"mongodb://127.0.0.1:{port}", mongodb_timeout_ms=100,
            ))
        assert time.monotonic() - start < 5
    assert str(error.value) == "Database is unavailable."


def test_verifier_missing_uri_and_failed_connection_are_safe(monkeypatch, capsys):
    monkeypatch.setattr("app.verify_database.Settings", lambda: Settings(_env_file=None, mongodb_uri=None))
    assert verify_main() == 2
    assert "NOT RUN" in capsys.readouterr().out
    monkeypatch.setattr("app.verify_database.Settings", lambda: Settings(_env_file=None, mongodb_uri="invalid://secret-canary"))
    assert verify_main() == 1
    output = capsys.readouterr()
    assert "FAIL" in output.out
    assert "secret-canary" not in output.out + output.err


@pytest.mark.parametrize("driver_message,expected", [
    ("secret-canary TLSV1_ALERT_INTERNAL_ERROR", "current public IP"),
    ("secret-canary CERTIFICATE_VERIFY_FAILED", "trusted CA certificates"),
    ("secret-canary SSL handshake failed", "TLS negotiation failed"),
    ("secret-canary connection refused", "No MongoDB server"),
])
def test_connection_failure_hints_never_echo_driver_details(driver_message, expected):
    hint = failure_hint(ServerSelectionTimeoutError(driver_message))
    assert expected in hint
    assert "secret-canary" not in hint
