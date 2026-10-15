"""One pooled synchronous MongoClient per running service instance."""

from pymongo import ASCENDING, MongoClient, timeout
from pymongo.errors import PyMongoError
from fastapi import Request

from .config import Settings
from .repositories import AnalysisRepository, WeatherRepository
from .repositories.base import DatabaseUnavailable
from .repositories.weather import WEATHER_IDENTITY_FIELDS


class Database:
    def __init__(self, client, name: str, timeout_ms: int):
        self.client = client
        self.db = client[name]
        self.timeout_ms = timeout_ms
        self.weather = WeatherRepository(self.db.weather_years, timeout_ms)
        self.analyses = AnalysisRepository(self.db.analyses, timeout_ms)

    @classmethod
    def connect(cls, settings: Settings) -> "Database":
        if settings.mongodb_uri is None:
            raise DatabaseUnavailable()
        client = None
        try:
            client = MongoClient(
                settings.mongodb_uri.get_secret_value(),
                connect=False,
                serverSelectionTimeoutMS=settings.mongodb_timeout_ms,
                connectTimeoutMS=settings.mongodb_timeout_ms,
                socketTimeoutMS=settings.mongodb_timeout_ms,
                timeoutMS=settings.mongodb_timeout_ms,
                waitQueueTimeoutMS=settings.mongodb_timeout_ms,
                maxPoolSize=settings.mongodb_max_pool_size,
                tz_aware=True,
                w="majority",
                readPreference="primary",
            )
            database = cls(client, settings.mongodb_db, settings.mongodb_timeout_ms)
            with timeout(settings.mongodb_timeout_ms / 1000):
                database.db.command("ping")
                database.ensure_indexes()
            return database
        except (DatabaseUnavailable, PyMongoError, ValueError, OSError):
            if client is not None:
                client.close()
            # Do not preserve driver exception text or the connection string.
            raise DatabaseUnavailable() from None

    def ensure_indexes(self) -> None:
        try:
            with timeout(self.timeout_ms / 1000):
                self.db.weather_years.create_index(
                    [(field, ASCENDING) for field in WEATHER_IDENTITY_FIELDS],
                    unique=True, name="weather_identity_unique",
                )
                self.db.analyses.create_index(
                    [("analysis_key", ASCENDING)], unique=True, name="analysis_key_unique",
                )
                self.db.analyses.create_index(
                    [("selection_key", ASCENDING), ("last_accessed_at", -1)], name="analysis_selection_latest",
                )
        except PyMongoError:
            raise DatabaseUnavailable() from None

    def close(self) -> None:
        self.client.close()


def get_database(request: Request) -> Database:
    """Use in synchronous routes/dependencies so PyMongo stays off the event loop."""
    database = getattr(request.app.state, "database", None)
    if database is None:
        raise DatabaseUnavailable()
    return database
