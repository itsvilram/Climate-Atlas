"""Opt-in B03 real-provider/Atlas smoke check. Retains real weather cache records."""

from pydantic import ValidationError

from .config import Settings
from .database import Database
from .repositories.base import DatabaseUnavailable
from .services.weather import WeatherService
from .services.weather_data import InvalidWeatherPayload, identity_for, valid_cached
from .services.weather_provider import ProviderUnavailable, WeatherOperationTimeout
from .regions import REGIONS
from .verify_database import failure_hint


def main() -> int:
    database = service = None
    try:
        config = Settings()
        if config.mongodb_uri is None:
            print("NOT RUN: configure MONGODB_URI in backend/.env first.")
            return 2
        database = Database.connect(config)
        service = WeatherService(database.weather, config)
        first = service.operation("delhi").load_year(2020)
        assert valid_cached(first.document, REGIONS[0], 2020)
        assert "2020-02-29" in first.document["dates"]
        assert first.document["quality"]["coverage"] >= 0.95
        print(f"Delhi 2020: {first.cache_status}; {first.document['quality']['valid_days']}/366 valid days.")
        service.close()
        service = None
        database.close()
        database = None
        # Reconnect to verify persisted state survives a fresh client/service.
        database = Database.connect(config)
        service = WeatherService(database.weather, config)
        operation = service.operation("delhi")
        repeated = operation.load_year(2020)
        assert repeated.cache_status == "hit"
        assert service.provider.request_count == 0
        assert repeated.document["revision"] == first.document["revision"]
        added = operation.load_year(2021)
        assert service.provider.request_count <= 1
        assert added.document["quality"]["coverage"] >= 0.95
        assert database.weather.get(identity_for(REGIONS[0], 2021)) == added.document
        print(f"Overlap 2020/2021: reused 2020; 2021 {added.cache_status}; provider requests {service.provider.request_count}.")
        print("PASS: real yearly data persisted/read back, leap calendar retained, and overlap cache reused after reconnect.")
        print("Attribution: weather data by Open-Meteo (https://open-meteo.com/), ERA5; CC BY 4.0. Calendar normalized; invalid/missing values remain null.")
        return 0
    except (DatabaseUnavailable, InvalidWeatherPayload, ProviderUnavailable, WeatherOperationTimeout, ValidationError, ValueError, AssertionError) as error:
        if isinstance(error, DatabaseUnavailable):
            hint = failure_hint(error)
        elif isinstance(error, InvalidWeatherPayload):
            hint = "Provider or stored weather failed validation."
        elif isinstance(error, WeatherOperationTimeout):
            hint = "Weather operation time budget exceeded."
        elif isinstance(error, ProviderUnavailable):
            hint = "Historical weather provider unavailable or rate limited."
        else:
            hint = "Weather verification or configuration check failed."
        print("FAIL: " + hint + " No credentials are printed.")
        return 1
    finally:
        if service is not None:
            service.close()
        if database is not None:
            database.close()


if __name__ == "__main__":
    raise SystemExit(main())
