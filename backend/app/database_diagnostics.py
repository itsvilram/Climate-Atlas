"""Closed startup failure categories; never return driver messages or host details."""
import socket

from pymongo.errors import ConfigurationError, DuplicateKeyError, InvalidURI, OperationFailure, ServerSelectionTimeoutError


def startup_failure_reason(error: Exception) -> str:
    seen = set()
    current: BaseException | None = error
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        if isinstance(current, InvalidURI):
            return 'invalid_uri'
        if isinstance(current, OperationFailure):
            if current.code == 18:
                return 'authentication_failed'
            if current.code == 13:
                return 'permission_denied'
            if current.code in {85, 86}:
                return 'index_definition_conflict'
            if isinstance(current, DuplicateKeyError):
                return 'duplicate_index_data'
            return 'database_operation_failed'
        if isinstance(current, ConfigurationError):
            # Inspect only internally; emit a fixed category, never the message.
            if 'dnspython' in str(current).lower():
                return 'dns_dependency_or_configuration'
            return 'dns_or_client_configuration'
        if isinstance(current, ServerSelectionTimeoutError):
            message = str(current).lower()
            if 'certificate_verify_failed' in message or 'certificate verify failed' in message:
                return 'tls_certificate_verification'
            if any(word in message for word in ('ssl', 'tls', 'handshake')):
                return 'tls_handshake'
            return 'server_selection_timeout'
        if isinstance(current, socket.gaierror):
            return 'dns_resolution'
        if isinstance(current, (ValueError, OSError)):
            return 'configuration_or_network'
        current = current.__cause__ or current.__context__
    return 'database_unavailable'
