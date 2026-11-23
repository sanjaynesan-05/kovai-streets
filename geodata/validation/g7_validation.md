# Step G7: validation report

The real-geography Coimbatore pilot is the game's only world. The pilot covers 6.08 × 5.93 km around Victoria Town Hall at 1:1 scale.

How this was tested:

- **Data checks:** scripts in `tools/geo/`.
- **Game run:** the full regression suite (`tools/regression-test.js`) in headless Chrome, driven over the DevTools protocol.

The results below are what was measured. They don't show that the map matches official surveys: everything is compared with OpenStreetMap, not with official maps or aerial imagery, and no person has inspected the junctions yet.

## Summary

| Check | Result | How |
|---|---|---|
| Regression suite (100 tests) | **100 / 100 pass, 0 page errors** | Headless Chrome, after the grid world was removed |
| Story missions | All 14 complete (Act 1: 6/6, Act 2: 8/8 plus 16 Act 2 branch, stealth, tail, escort and epilogue tests) | Regression groups `missions` and `act2` |
| Landmark positions | 0.0 m difference from OpenStreetMap (19 landmarks in the pilot; 2 are manual estimates, marked `approximate`) | `landmarks.json` against `tools/geo/geo.py` |
| Road positions | Roads are drawn on the OpenStreetMap centre lines with no offset | `build_pilot.py`, `geoworld.js` |
| Road network coverage | The graph holds 686 km of the 709 km of drivable road inside the pilot (96.8 %); the rest are fragments cut by the pilot edge | `graph_pilot.json` against `roads.json` |
| Junction connectivity | 7,783 junctions in 91 connected pieces; the largest holds 87.5 %. GPS snaps to the main network when a point is on a fragment | Graph analysis |
| Grade separation | Flyovers never join the road beneath them (junctions are matched per layer); you can drive over and under a real flyover | Tests `* under a real flyover`, `real flyover deck *` |
| One-way streets | 441 one-way roads are respected by traffic and by driving routes | `graph_pilot.json` directed edges |
| Chunk seams | All 49 chunks reassemble with no gaps, overlaps or lost buildings | `tools/geo/check_chunks.py` |
| Flyover heights at chunk borders | Fixed in G7: decks no longer dip where a flyover crosses a chunk border | Trace of a car on the 1,775 m Gandhipuram Flyover |
| Water | Lakes are the OpenStreetMap shapes; swimming and boats use them | `geoInWater` |
| Railway | Railway lines are the OpenStreetMap lines (95 pieces, 2 stations, 9 level crossings) | `rail.json` |
| GPS | 100 / 100 random routes found; on foot no route crosses water; 0.016 % of samples fall inside a building outline where OpenStreetMap draws a road through a building | Route checks in G5 and G7 |
| Mission positions | All 85 converted positions land inside the pilot and outside standing buildings; only the jetty and boats are on water, as intended | G6 check |
| Fictional sites | 11 fictional sites, each at least 40 m plus its radius from real landmarks and points of interest, out of water, beside a road | `sites_report.md` |
| Saves | Old saves load: saves store no world positions. Version 1 → 3 migration, version 2 → 3 with Act 2 defaults, checksum tamper, truncation, newer-version refusal and sanitising all pass | Regression groups `save`, `saveSafety`, `act2` |

## Not verified, or not done yet

| Item | Status |
|---|---|
| Comparison with official maps or aerial imagery | Not done. All positions come from OpenStreetMap; its accuracy in Coimbatore has not been checked |
| Manual inspection of major junctions | Not done. This needs a person to check the game against a map or a visit |
| Elevation | The pilot is flat. Real heights need the Copernicus DEM, which has not been downloaded |
| Coimbatore planning-area boundary and Master Plan 2041 land use | Not downloaded. Land use comes from OpenStreetMap only |
| Turn restrictions | Not in the extract |
| Area outside the 6 × 6 km pilot | Not built. The Western Ghats, Marudhamalai, Singanallur and the airport are outside the pilot |
| Approximate positions | Valankulam Lake and Hope College have no named OpenStreetMap entry; Big Bazaar Street's centre is from OpenStreetMap but its in-game direction is a guess |
| Tamil dialogue | 6 reworded lines (G6) and the original drafts need a native speaker's review |
