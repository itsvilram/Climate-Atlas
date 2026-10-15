"""Shared bounded, safe persistence operations."""

from collections.abc import Mapping
from typing import Any

from pymongo import timeout
from pymongo.errors import DuplicateKeyError, PyMongoError


class DatabaseUnavailable(Exception):
    def __init__(self):
        super().__init__("Database is unavailable.")


class DocumentRepository:
    def __init__(self, collection, timeout_ms: int):
        self.collection = collection
        self.timeout_seconds = timeout_ms / 1000

    def _get(self, identity: Mapping[str, Any]) -> dict | None:
        try:
            with timeout(self.timeout_seconds):
                return self.collection.find_one(dict(identity), {"_id": 0})
        except PyMongoError:
            raise DatabaseUnavailable() from None

    def _save(self, identity: Mapping[str, Any], payload: Mapping[str, Any]) -> dict:
        if "_id" in payload or set(identity).intersection(payload):
            raise ValueError("Payload must not override document identity or _id.")
        document = {**payload, **identity}
        try:
            with timeout(self.timeout_seconds):
                try:
                    self.collection.replace_one(dict(identity), document, upsert=True)
                except DuplicateKeyError:
                    # A concurrent insert may win the unique-key race. Retry once,
                    # updating that identity only; never create a second record.
                    self.collection.replace_one(dict(identity), document, upsert=False)
                saved = self.collection.find_one(dict(identity), {"_id": 0})
                if saved is None:
                    raise DatabaseUnavailable()
                return saved
        except PyMongoError:
            raise DatabaseUnavailable() from None
