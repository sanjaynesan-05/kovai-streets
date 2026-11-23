"""Kovai Streets map step D1: landmark registry, geo -> game transform, and a position report.

Reads   tools/map/raw/landmarks.osm.json  (OpenStreetMap data, downloaded once with query.overpassql; (c) OpenStreetMap contributors, ODbL)
Writes  tools/map/landmarks.json          (registry: id, name, category, lat, lon, game x/z, OSM reference)
        tools/map/REPORT.md               (real direction and distance from Town Hall, target game position, current game position)

Run from anywhere:  python tools/map/build_registry.py
Re-download (only if the data needs refreshing):
  curl -A "kovai-streets-map-import/1.0" --data-urlencode data@tools/map/query.overpassql https://overpass-api.de/api/interpreter -o tools/map/raw/landmarks.osm.json
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))

# ---- the single geo -> game transform (step D3 ports this exact function to js) ----
ORIGIN = (10.99330, 76.96107)   # Victoria Town Hall: game (0, 0) after D2/D3
INNER_M, INNER_K, OUTER_K = 3000, 9, 25
# Within 3 km of Town Hall: 1 game unit = 9 m. Beyond that: 1 unit = 25 m, so Marudhamalai and the airport fit on the map.
# Directions from Town Hall are always kept; distances beyond 3 km are compressed. North is -z, east is +x.

def geo_to_game(lat, lon):
    east = (lon - ORIGIN[1]) * 111320 * math.cos(math.radians(ORIGIN[0]))
    north = (lat - ORIGIN[0]) * 110574
    r = math.hypot(east, north)
    if r == 0: return 0.0, 0.0
    g = r / INNER_K if r <= INNER_M else INNER_M / INNER_K + (r - INNER_M) / OUTER_K
    return round(east / r * g, 1), round(-north / r * g, 1)

# ---- registry: (id, name, category, OSM element or None, fictional) ----
LANDMARKS = [
    ("town_hall",        "Victoria Town Hall",              "civic",     "w553610273"),
    ("clock_tower",      "Clock Tower",                     "landmark",  "w405629514"),
    ("koniamman",        "Koniamman Temple",                "temple",    "n1474730775"),
    ("cbe_junction",     "Coimbatore Junction (railway)",   "transport", "r15903695"),
    ("gandhipuram_cbs",  "Gandhipuram Central Bus Stand",   "transport", "w506390719"),
    ("gandhipuram_tbs",  "Gandhipuram Town Bus Stand",      "transport", "w506390723"),
    ("ukkadam_bus",      "Ukkadam Bus Stand",               "transport", "w89913234"),
    ("singanallur_bus",  "Singanallur Bus Stand",           "transport", "w902447096"),
    ("ukkadam_lake",     "Ukkadam Lake (Periyakulam)",      "lake",      "w24711461"),
    ("singanallur_lake", "Singanallur Lake",                "lake",      "r6743775"),
    ("valankulam_lake",  "Valankulam Lake",                 "lake",      None),
    ("race_course",      "Race Course walking track",       "park",      "w329852736"),
    ("voc_park",         "VOC Park",                        "park",      "w66102328"),
    ("lakshmi_mills",    "Lakshmi Mills Junction",          "junction",  "w1272355392"),
    ("hope_college",     "Hope College Junction",           "junction",  None),
    ("airport",          "Coimbatore International Airport","transport", "w128979883"),
    ("marudhamalai",     "Marudhamalai Murugan Temple",     "temple",    "n6422909036"),
    ("big_bazaar_st",    "Big Bazaar Street",               "street",    None),
    ("town_hall_market", "Town Hall market",                "market",    "n1474518432"),
    ("rs_puram",         "R.S. Puram",                      "district",  "n330081172"),
    ("gandhipuram",      "Gandhipuram",                     "district",  "n295998158"),
    ("ukkadam",          "Ukkadam",                         "district",  "n803691379"),
    ("peelamedu",        "Peelamedu",                       "district",  "n368190944"),
    ("singanallur",      "Singanallur",                     "district",  "n802370000"),
    ("saibaba_colony",   "Saibaba Colony",                  "district",  "n4961511852"),
    ("vadavalli",        "Vadavalli",                       "district",  "n3623167774"),
    ("ramanathapuram",   "Ramanathapuram",                  "district",  "n803093962"),
    ("uppilipalayam",    "Uppilipalayam",                   "district",  "n2018109767"),
    ("podanur_jn",       "Podanur Junction (railway)",      "transport", "n5352514798"),
    ("podanur",          "Podanur",                         "district",  "n319536922"),
    ("perur",            "Perur",                           "district",  "n294521062"),
]
# Approximate positions for places OpenStreetMap has no named entry for. Marked "manual" in the report: check on a reference map.
MANUAL = {"valankulam_lake": (10.9935, 76.9705), "hope_college": (11.0265, 77.0175), "big_bazaar_st": (10.99418, 76.96516)}   # Big Bazaar Street: centre from OSM, but its direction in the game (north-south beside Town Hall) is a guess
FICTIONAL = ["Podanur pond (old lake block (8,9); the real Singanallur Lake is now at block (11,6))", "Kovai Reservoir and boat jetty (replaces the fictional coast, east edge)", "Podanur / Singanallur story mills (missions 1-7)",
             "Thendral Builders godown, Ukkadam (mission 10)", "Ghat Wolves hideout, Western Ghats (mission 13)", "Kovai Central mall (mission 14)"]

# Current game positions (after map step D3). Grid block (i,j) centre = ((i-4.5)*74, (j-4.5)*74); Town Hall block is (4,6).
BC = lambda i: (i - 4.5) * 74
CURRENT = {"town_hall": (BC(4), BC(6)), "gandhipuram_cbs": (BC(5), BC(2)), "gandhipuram_tbs": (BC(5), BC(2)), "race_course": (BC(7), BC(5)),
           "voc_park": (BC(6), BC(4)), "valankulam_lake": (BC(6), BC(6)), "koniamman": (-13, 104), "cbe_junction": (BC(5), BC(5)),
           "big_bazaar_st": (0, 111), "podanur_jn": (110, 757),
           "marudhamalai": (BC(-5), BC(2)), "town_hall_market": (BC(3), BC(6)), "ukkadam_lake": (BC(3), BC(8)), "singanallur_lake": (BC(11), BC(6)),
           "ukkadam_bus": (BC(4), BC(7)), "singanallur_bus": (BC(11), BC(5)), "airport": (BC(11), BC(3)), "clock_tower": (BC(4), BC(6) - 9),
           "rs_puram": (-169, -70), "gandhipuram": (44, -196), "ukkadam": (-16, 136), "peelamedu": (283, -187), "singanallur": (447, 36),
           "saibaba_colony": (-206, -216), "vadavalli": (-466, -138), "ramanathapuram": (312, 94), "uppilipalayam": (431, -33),
           "podanur": (213, 433), "perur": (-442, 259), "lakshmi_mills": (240, -109), "hope_college": (393, -145)}
# Still not at the real position, and why.
BLOCKED = {"podanur_jn": "the through railway line stays along the south edge, so the station is due south of the centre instead of south-east; Coimbatore Junction is a separate terminus at its real spot"}

COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]


def main():
    raw = json.load(open(os.path.join(HERE, "raw", "landmarks.osm.json"), encoding="utf-8"))
    pos = {}
    for e in raw["elements"]:
        c = e.get("center", e)
        if "lat" in c: pos[e["type"][0] + str(e["id"])] = (c["lat"], c["lon"])
    reg, rows = [], []
    th = geo_to_game(*pos["w553610273"])
    for lid, name, cat, ref in LANDMARKS:
        src = "osm" if ref and ref in pos else "manual"
        lat, lon = pos[ref] if src == "osm" else MANUAL[lid]
        x, z = geo_to_game(lat, lon)
        east = (lon - ORIGIN[1]) * 111320 * math.cos(math.radians(ORIGIN[0])); north = (lat - ORIGIN[0]) * 110574
        km, brg = math.hypot(east, north) / 1000, (math.degrees(math.atan2(east, north)) + 360) % 360
        reg.append({"id": lid, "name": name, "category": cat, "lat": round(lat, 5), "lon": round(lon, 5), "x": x, "z": z,
                    "source": src, "osm": ref if src == "osm" else None})
        cur = CURRENT.get(lid)
        # today's map has Town Hall at (-37, 111), so compare positions relative to each map's Town Hall
        if cur:
            cx, cz = cur[0] - BC(4), cur[1] - BC(6)
            off = math.hypot(cx - x, cz - z)
            curtxt = f"({cx:.0f}, {cz:.0f}) · off by {off:.0f}" + (" ✔" if off < 74 else " ✖ move")
        else: curtxt = "not on map yet"
        if lid in BLOCKED and "✖" in curtxt or (lid in BLOCKED and not cur): curtxt += f" · waiting: {BLOCKED[lid]}"
        rows.append(f"| {name} | {cat} | {src} | {km:.1f} km {COMPASS[round(brg / 45) % 8]} | ({x:.0f}, {z:.0f}) | {curtxt} |")
    json.dump({"_note": "Generated by build_registry.py. Data (c) OpenStreetMap contributors, ODbL 1.0. 'manual' entries are approximate.",
               "origin": ORIGIN, "landmarks": reg}, open(os.path.join(HERE, "landmarks.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    rep = ["# Map step D1: landmark report", "",
           "Generated by `tools/map/build_registry.py`. Map data © OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright).", "",
           "**Transform:** origin Victoria Town Hall = game (0, 0). Within 3 km: 1 unit = 9 m. Beyond 3 km: 1 unit = 25 m (compressed). North is −z, east is +x. "
           "Directions from Town Hall are exact; distances beyond 3 km are not.", "",
           "**Current position** is today's map, measured from today's Town Hall block. ✔ = within one block (74 units) of the target; ✖ = not at its real position yet (reason given).", "",
           "| Landmark | Category | Source | Real position from Town Hall | Target game (x, z) | Current game position |", "|---|---|---|---|---|---|", *rows, "",
           "## Needs manual checking", "",
           *[f"- **{n}**: no named OpenStreetMap entry; position is approximate." for i, n, c, r in LANDMARKS if i in MANUAL], "",
           "## Fictional locations (must not sit on a real landmark)", "", *[f"- {f}" for f in FICTIONAL], ""]
    open(os.path.join(HERE, "REPORT.md"), "w", encoding="utf-8").write("\n".join(rep))
    print(f"{len(reg)} landmarks ({sum(r['source'] == 'manual' for r in reg)} manual) -> landmarks.json, REPORT.md")


if __name__ == "__main__":
    main()
