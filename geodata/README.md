# Real-geography Coimbatore world (in progress)

Kovai Streets is replacing its grid city with real Coimbatore geography at 1:1 scale. This folder holds the map data; `tools/geo/` holds the scripts that process it. The game never downloads map data while it runs.

**Decisions (from the project owner):**
- Replace the grid world in place. The game will be partly playable while this work is in progress.
- First playable area: a 6 × 6 km central pilot. It grows outward later, towards the full Coimbatore planning area.
- Scale 1:1, with one transform for everything (`tools/geo/geo.py`).
- Data: OpenStreetMap only for now. Elevation data (Copernicus DEM) and the official planning documents need separate approval before they are downloaded.

## Folders

| Path | Contents |
|---|---|
| `raw/osm/` | OpenStreetMap downloads, kept unchanged |
| `processed/pilot/` | Game-ready data for the pilot area, in game metres |
| `processed/pilot/chunks/` | The pilot split into 1 × 1 km chunks (`c_<i>_<j>.json`, plus `index.json`) for streaming |
| `processed/pilot/graph_pilot.json` | Road graph trimmed to the pilot rectangle, for traffic AI and GPS |
| `validation/` | Generated reports |
| `../tools/geo/` | `geo.py` (the transform), `build_pilot.py` (processing), the `.overpassql` download queries |

To rebuild the processed data (Python 3, no extra packages):

```
python tools/geo/build_pilot.py    # raw OSM -> processed pilot data + validation report
python tools/geo/chunk_pilot.py    # processed data -> 1 km chunks + trimmed road graph
python tools/geo/check_chunks.py   # checks the chunks reassemble with no gaps or losses
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
| G4 | Traffic AI on the road graph: lane following, junctions, one-way streets, signals; pedestrians on sidewalks and footways | Cars drive for 10 minutes without getting stuck; obey one-way streets | |
| G5 | Minimap and GPS from the same data; route along the graph; police, wanted level and spawning on the new roads | GPS never routes through buildings or water | |
| G6 | Missions: re-place all 14 story missions, jobs, shops, safehouse, hangouts and collectibles on real streets (fictional sites marked fictional and kept off real landmarks) | Regression suite passes; old saves load | |
| G7 | Remove the old grid world; validation and performance reports | Reports written; your playtest notes resolved | |
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
