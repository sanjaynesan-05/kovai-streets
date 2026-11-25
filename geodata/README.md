# Real-geography Coimbatore world (in progress)

Kovai Streets is replacing its grid city with real Coimbatore geography at 1:1 scale. This folder holds the map data; `tools/geo/` holds the scripts that process it. The game never downloads map data while it runs.

**Decisions (from the project owner):**
- Replace the grid world in place. Done in G7: the real map is the only world.
- First playable area: a 6 × 6 km central pilot. It grows outward later, towards the full Coimbatore planning area.
- Scale 1:1, with one transform for everything (`tools/geo/geo.py`).
- Data: OpenStreetMap only for now. Elevation data (Copernicus DEM) and the official planning documents need separate approval before they are downloaded.

## Folders

| Path | Contents |
|---|---|
| `raw/osm/` | OpenStreetMap downloads, kept unchanged |
| `processed/kovai/` | **What the game loads (since R1):** the fictional city of the rebuild, from `tools/geo/build_kovai.py` (designed main roads, generated district streets and buildings, landmarks with models, trees), 500 m chunks |
| `processed/city/` | Before R1: the compact fictional city (3.2 × 3.2 km core) from `build_city.py`, same file format as the pilot, with its `chunks/` and `graph_pilot.json` |
| `processed/pilot/` | Game-ready data for the 6 × 6 km pilot area, in game metres (the source for the city) |
| `processed/pilot/chunks/` | The pilot split into 1 × 1 km chunks (`c_<i>_<j>.json`, plus `index.json`) for streaming |
| `processed/pilot/graph_pilot.json` | Road graph trimmed to the pilot rectangle, for traffic AI and GPS |
| `validation/` | Generated reports |
| `../tools/geo/` | `geo.py` (the transform), `build_pilot.py` (processing), the `.overpassql` download queries |

To rebuild the processed data (Python 3, no extra packages):

```
python tools/geo/build_pilot.py    # raw OSM -> processed pilot data + validation report
python tools/geo/chunk_pilot.py    # processed data -> 1 km chunks + trimmed road graph
python tools/geo/check_chunks.py   # checks the chunks reassemble with no gaps or losses

# the city the game uses (bash; on Windows set KS_DATASET=city first)
python tools/geo/build_city.py                     # pilot -> compact city: main roads kept, streets and buildings generated
KS_DATASET=city python tools/geo/chunk_pilot.py
KS_DATASET=city python tools/geo/check_chunks.py
KS_DATASET=city python tools/geo/place_sites.py    # mission sites -> js/geosites_data.js

# the fictional city the game uses since rebuild step R1 (REBUILD_SPEC.md)
python tools/geo/build_kovai.py
KS_DATASET=kovai python tools/geo/chunk_pilot.py
KS_DATASET=kovai python tools/geo/check_chunks.py
KS_DATASET=kovai python tools/geo/place_sites.py
```

**Chunks:** chunk (i, j) covers x from i × 1000 to (i + 1) × 1000 m, and z from j × 1000 to (j + 1) × 1000 m. The pilot rectangle is x −1527…4554 and z −4271…1662, which is 6.08 × 5.93 km in 49 chunks; the largest chunk is about 400 KB. Roads, paths, railways and waterways are cut exactly at chunk borders, so neighbouring pieces share their end points. Lakes and landuse are clipped to each chunk. A building is kept whole, in the chunk that contains its centre.

## Source manifest

| Dataset | Provider | Downloaded | Licence | CRS | Extent | Resolution | Processing |
|---|---|---|---|---|---|---|---|
| Pilot features: roads, railways, water, landuse, parks, signals, stations | OpenStreetMap via the Overpass API (overpass-api.de) | 2026-11-23 (OSM data as of 2026-11-23 09:56 UTC) | ODbL 1.0, © OpenStreetMap contributors | WGS84 (EPSG:4326) | lat 10.978–11.032, lon 76.947–77.003; whole ways that cross the box are included | Vector, node positions to 1e-7° | Projected to UTM 43N, origin moved to Victoria Town Hall, sorted into roads, paths, rail, water and landuse, road graph built (`build_pilot.py`) |
| Pilot buildings | OpenStreetMap via the Overpass API | 2026-11-23 | ODbL 1.0 | WGS84 | same box | Vector footprints | Projected; height from `height` or `building:levels` × 3.2 m where tagged (404 of 30,686) |
| Landmark points | OpenStreetMap via the Overpass API (`tools/map/`) | 2026-11-23 | ODbL 1.0 | WGS84 | Coimbatore city area | Points or way centres | 3 entries are manual estimates and are marked `approximate` |

**Not downloaded yet (needs approval):**

| Dataset | Why it's needed |
|---|---|
| Copernicus DEM GLO-30 | Elevation. This is a surface model that includes buildings and trees, so it needs filtering to get the ground level |
| Coimbatore Master Plan 2041 | Land use and the official planning area boundary. Mostly published as PDF maps, so it needs manual tracing |

## Coordinate system

| | |
|---|---|
| Projection | WGS84 / UTM zone 43N (EPSG:32643). It covers 72°E–78°E, which includes all of Coimbatore |
| Origin | Victoria Town Hall (10.99330 N, 76.96107 E) = game (0, 0) |
| Axes | +x east, −z north, +y up |
| Scale | 1 game unit = 1 metre |
| Vertical datum | Not defined yet. The pilot is flat until elevation data is approved |
| Check | Town Hall to Gandhipuram Central Bus Stand: 2,390 m on the projection; about 2,389 m on the ellipsoid. UTM's scale factor here is about 1.0002 |

## Plan (one or more sessions each)

| Step | Work | Verify | Status |
|---|---|---|---|
| G0 | Audit of the current engine (see below), data download, transform, processing, validation report | `validation/pilot_report.md` | ✓ |
| G1 | Chunking: clip the pilot to 1 × 1 km chunks, split roads at chunk edges, assign buildings by centre | Chunk files reassemble without gaps (`check_chunks.py`: line lengths, border joins, areas, every building exactly once, graph) | ✓ |
| G2 | New world renderer (`js/geoworld.js`, open `index.html?world=geo`): ground, road ribbons with widths, centre lines, flyovers on piers, lakes, railway, landuse colours, 3D buildings; chunk streaming (full detail within 1.6 km, roads and ground to 2.7 km); minimap from the same data | All 49 chunks build without errors (Node smoke test, 425k triangles in total). Needs your check: no gaps at chunk borders while driving; frame time on your machine | built, needs your test |
| G3 | Collision on real geometry: each building footprint becomes axis-aligned strips (1.5 m rows, merged), loaded and removed with its chunk; flyover/bridge decks you can drive on and under; solid pillars; real lake shapes for swimming and boats; bullets and line of sight walk only the grid cells a ray crosses | Node checks: 49 chunks, 0 errors; every collider and deck removed again on unload; 99.35% of sample points within about 1 m of the footprint; new ray code identical to the old one on 20,000 random rays. Needs your check: no walking or driving through buildings; drive over and under a flyover | built, needs your test |
| G4 | Traffic on the real road graph (`js/geonav.js`): left-lane waypoints along graph edges, one-way streets respected, bigger and straighter roads preferred at junctions, U-turns only at dead ends, red lights at the 36 signalled junctions (east-west and north-south take turns, 18 s each, with signal heads near the player); the grid AI's steering, braking, unsticking and respawning are reused. Pedestrians walk road sidewalks, keep to their side and walk round corners | Node route simulation, 200 cars and 200 pedestrians for 10 minutes: 0 broken connections in about 22,000 junction choices; about 64 dead ends (pilot edge or one-way ends; the car respawns); 0.04% of pedestrian steps jump more than 3 m. Needs your check: traffic flow, stopping at signals, no cars stuck in buildings | built, needs your test |
| G5 | Route finding (A*) on the road graph (`js/geonav.js`): driving follows one-way rules (falls back to ignoring them if a place is unreachable), on foot and police use both directions; routes snap to the main road network when an end is on a cut-off fragment. GPS: click the big map (M) to set or clear a destination; purple route on the minimap and big map, distance in the HUD, re-routes when you leave the route; follows the mission marker when there is one. Map: the whole pilot's roads, lakes and land use from the start, plus OSM hospitals (134), police stations (15) and bus stands (10). Police spawn on real roads, follow road routes when more than 40 m away, roadblocks at real junctions ahead | Node check, 300 random routes each: on foot 300/300 found, driving 287/300 with one-way rules (the rest fall back); 0% of route samples in water, 0.016% inside a building footprint (where OSM draws a road through a building); slowest route 21 ms. Needs your check: GPS line follows streets; police reach you by road | built, needs your test |
| G6 | Missions and places on real streets: `tools/geo/place_sites.py` picks real spots for the fictional sites (three mills, mall, godown, police station, safehouse, Ghat Wolves compound, quarry yard, lakeside jetty on Ukkadam Lake), at least 40 m plus the site radius from any real landmark or POI, out of water, beside a road; only anonymous buildings inside are cleared (`validation/sites_report.md`). `js/geosites.js` W() moves every grid-world mission position (whole sites move as one piece, the jetty turned a quarter turn). All 14 story missions, the job types (deliveries, fares, races, chases, gang and boss jobs, emergency runs to a real hospital), rampages, gang hangouts, film reels, stunt ramps, friends, gun shop and safehouse use real streets. Hill and reservoir scenes use fictional substitutes (quarry yard, walled compound, lakeside jetty); 6 dialogue lines reworded | Node checks: 85 converted mission positions land inside the pilot and outside standing buildings (water only where intended: jetty and boats); mission 8 tail 4.5 km with all three stops; mission 14 escape 3.7 km by road; 48/50 races get all 7 checkpoints; 0/100 job points, 0/18 reels and 0/7 hangouts inside a building; all 26 scripts load together without name clashes. Needs your playtest of every mission | built, needs your test |
| G7 | The grid world is removed; the real map is the only world (about 480 lines and 67 KB of grid-only code deleted; the game code is long lines, so that is about 15 % of it). Real flyovers get parapets; deck heights no longer dip at chunk borders; map data is revalidated on load and failed chunk downloads retry. The regression suite was rewritten for the real map (real flyover, underpass, pillar, parapet, quiet test road, preloading along routes) | Headless Chrome: **100 / 100 tests pass, 0 page errors**. Reports: `validation/g7_validation.md`, `validation/g7_performance.md`. Still needs your playtest and real-device frame rates | ✓ |
| G7b | A compact fictional city based on central Coimbatore (`tools/geo/build_city.py`): the 3.2 × 3.2 km core (x −1250…1950, z −2650…550) from Gandhipuram to Town Hall and Ukkadam. Real main roads, flyovers, railway, lakes, parks and landmarks are kept; the small OpenStreetMap streets are replaced by generated side streets every 80–120 m, square to the main road they leave, with cross streets about every 85 m and a second level off long streets; every frontage is filled with buildings (commercial and taller on main roads and near the centres). Buildings also line the outer side of edge roads, and `backdrop.json` (real buildings as plain boxes and the lakes in a 700 m band around the city) fills the view past the edge. Paved footpaths on every street; corner shops; parked buses at the bus stands. Street furniture keeps off every road surface, away from junctions and out from under flyovers; flyover pillars never stand on a crossing street. 260 pedestrians and 56 vehicles (Medium) kept within about 200–300 m of the player; sunrise/sunset colours, clouds and haze | Chunks pass `check_chunks.py`; regression suite | ✓ |
| G8+ | Grow beyond the pilot towards the planning area; elevation (after approval) | Per area | |

## Audit of the current engine (G0)

What has to change when the grid goes:

| System | Today | Real-geography replacement |
|---|---|---|
| World build | `world.js` builds a 20 × 20 grid of 74 m blocks, with block types placed by grid index | Chunks built from `processed/pilot/*.json` |
| Roads | Straight grid roads (`CELL`, `NB` in `core.js`) plus a few drawn stretches (`ROADS`) | Ribbons from OSM centre lines and widths |
| Collision | Axis-aligned boxes in a spatial hash (`addCollider`, `core.js`) | Same hash, filled from building footprints (rotated boxes or polygon tests) |
| Traffic AI | Lane waypoints on the grid (`laneWP`, `makeAI` in `vehicles.js`) | Waypoints along graph edges (`graph.json`) |
| Pedestrians | Walk around block edges (`pedBlocks`, `pedPos`) | Walk along sidewalks and footways |
| Police | Spawn and block roads on grid nodes | Spawn and block on graph nodes |
| Minimap | Draws the grid (`hud.js`) | Draws OSM roads, water and landuse |
| Missions | About 300 hard-coded coordinates in `missions.js`, `story2.js`, `progression.js` | Re-placed on real streets (G6) |
| Saves | No world positions stored | Nothing to migrate for positions |
| Rendering | three.js r128, merged static batches | Per-chunk merged batches, loaded and unloaded by distance |
