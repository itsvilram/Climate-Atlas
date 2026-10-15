from unittest.mock import MagicMock

import pytest
from pymongo.errors import ConfigurationError, DuplicateKeyError, InvalidURI, OperationFailure, ServerSelectionTimeoutError

from app.config import Settings
from app.database import Database
from app.database_diagnostics import startup_failure_reason
from app.repositories.base import DatabaseUnavailable


@pytest.mark.parametrize('error,expected', [
    (InvalidURI('secret-canary'), 'invalid_uri'),
    (OperationFailure('secret-canary', code=18), 'authentication_failed'),
    (OperationFailure('secret-canary', code=13), 'permission_denied'),
    (OperationFailure('secret-canary', code=85), 'index_definition_conflict'),
    (DuplicateKeyError('secret-canary', code=11000), 'duplicate_index_data'),
    (ConfigurationError('secret-canary dnspython'), 'dns_dependency_or_configuration'),
    (ConfigurationError('secret-canary DNS'), 'dns_or_client_configuration'),
    (ServerSelectionTimeoutError('secret-canary CERTIFICATE_VERIFY_FAILED'), 'tls_certificate_verification'),
    (ServerSelectionTimeoutError('secret-canary TLSV1_ALERT_INTERNAL_ERROR'), 'tls_handshake'),
    (ServerSelectionTimeoutError('secret-canary unreachable'), 'server_selection_timeout'),
])
def test_only_closed_categories_are_returned(error, expected):
    assert startup_failure_reason(error) == expected


@pytest.mark.parametrize('stage', ['ping', 'indexes'])
def test_startup_log_identifies_stage_without_raw_exception_or_credentials(monkeypatch, caplog, stage):
    client = MagicMock()
    db = client.__getitem__.return_value
    if stage == 'ping':
        db.command.side_effect = OperationFailure('secret-canary', code=18)
        expected = 'authentication_failed'
    else:
        db.weather_years.create_index.side_effect = OperationFailure('secret-canary', code=13)
        expected = 'permission_denied'
    monkeypatch.setattr('app.database.MongoClient', MagicMock(return_value=client))
    with pytest.raises(DatabaseUnavailable):
        Database.connect(Settings(_env_file=None, mongodb_uri='mongodb://unused'))
    assert f'database_startup_failed stage={stage} reason={expected}' in caplog.text
    assert 'secret-canary' not in caplog.text
    assert 'mongodb://' not in caplog.text
    client.close.assert_called_once()
