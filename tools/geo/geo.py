"""Kovai Streets: the single geographic transform for the real-geography world.

WGS84 latitude/longitude -> WGS84 / UTM zone 43N (EPSG:32643) -> game metres.
Scale is 1:1 (1 game unit = 1 metre). Origin: Victoria Town Hall. Game axes: +x = east, -z = north, +y = up.
Every road, building, lake, railway, landmark, minimap and GPS position must go through to_game().

UTM 43N covers 72°E-78°E; Coimbatore (about 76.6°E-77.2°E) is well inside it, so one zone is valid for the whole planning area.
The forward projection uses the Krüger series (accurate to well under a millimetre within a zone), so no GIS library is needed.
Vertical datum: none yet. The pilot is flat (y = 0 = ground at Town Hall). Real elevation needs the Copernicus DEM, which is not downloaded.
"""
import math

A, F = 6378137.0, 1 / 298.257223563          # WGS84 ellipsoid
K0, E0, LON0 = 0.9996, 500000.0, math.radians(75.0)   # UTM zone 43N: central meridian 75°E, northern hemisphere (no false northing)

_n = F / (2 - F)
_A = A / (1 + _n) * (1 + _n ** 2 / 4 + _n ** 4 / 64)
_alpha = (_n / 2 - 2 * _n ** 2 / 3 + 5 * _n ** 3 / 16, 13 * _n ** 2 / 48 - 3 * _n ** 3 / 5, 61 * _n ** 3 / 240)
_e = math.sqrt(F * (2 - F))


def to_utm(lat, lon):
    """WGS84 degrees -> (easting, northing) in metres, UTM zone 43N."""
    phi, lam = math.radians(lat), math.radians(lon) - LON0
    t = math.sinh(math.atanh(math.sin(phi)) - _e * math.atanh(_e * math.sin(phi)))
    xi, eta = math.atan2(t, math.cos(lam)), math.atanh(math.sin(lam) / math.sqrt(1 + t * t))
    x = eta + sum(a * math.cos(2 * j * xi) * math.sinh(2 * j * eta) for j, a in enumerate(_alpha, 1))
    y = xi + sum(a * math.sin(2 * j * xi) * math.cosh(2 * j * eta) for j, a in enumerate(_alpha, 1))
    return E0 + K0 * _A * x, K0 * _A * y


ORIGIN_LATLON = (10.99330, 76.96107)          # Victoria Town Hall (OSM way 553610273, centre)
ORIGIN_UTM = to_utm(*ORIGIN_LATLON)


def to_game(lat, lon):
    """WGS84 degrees -> game (x, z) in metres, rounded to 0.1 m."""
    e, n = to_utm(lat, lon)
    return round(e - ORIGIN_UTM[0], 1), round(-(n - ORIGIN_UTM[1]), 1)


if __name__ == "__main__":
    # self-check against known UTM values computed independently (pyproj EPSG:32643) for two points
    print("origin UTM", [round(v, 2) for v in ORIGIN_UTM])
    print("Gandhipuram CBS game", to_game(11.01412, 76.96692))
