"""Representative city-centre points, not city-wide spatial averages.

Coordinates are fixed application configuration in decimal degrees (WGS84).
"""

from .schemas import Region

# Increment whenever representative coordinates change (part of weather identity).
REGION_COORDINATE_VERSION = "1"

REGIONS = (
    Region(id="delhi", name="Delhi", latitude=28.6139, longitude=77.2090, timezone="Asia/Kolkata"),
    Region(id="mumbai", name="Mumbai", latitude=19.0760, longitude=72.8777, timezone="Asia/Kolkata"),
    Region(id="bengaluru", name="Bengaluru", latitude=12.9716, longitude=77.5946, timezone="Asia/Kolkata"),
    Region(id="chennai", name="Chennai", latitude=13.0827, longitude=80.2707, timezone="Asia/Kolkata"),
    Region(id="hyderabad", name="Hyderabad", latitude=17.3850, longitude=78.4867, timezone="Asia/Kolkata"),
)
