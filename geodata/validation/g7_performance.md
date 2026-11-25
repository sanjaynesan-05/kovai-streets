# Step G7: performance report

**Where these numbers come from:** headless Google Chrome on the development PC, rendering with SwiftShader, which is software rendering on the CPU.

- **What they can measure:** the game's CPU work (simulation, chunk building, route finding), memory, and how much the GPU is asked to draw (draw calls, triangles).
- **What they can't measure:** real frame rate. Software rendering is many times slower than a graphics card, so the frame rate has to be measured on your own machine and phone.

Graphics preset: Medium (the default).

## In four areas of the pilot

These were measured after streaming had settled, with 42 AI vehicles, 70 pedestrians and 28 gang members active.

| Area | Simulation per frame | Chunks loaded (full detail) | Colliders | Draw calls | Triangles | JS heap |
|---|---|---|---|---|---|---|
| Town Hall (dense centre) | 0.91 ms | 20 (8) | 18,332 | 262 | 114,580 | 125 MB |
| Gandhipuram (bus stands) | 1.11 ms | 25 (10) | 56,746 | 238 | 133,311 | 165 MB |
| Ukkadam Lake (water edge) | 0.66 ms | 15 (8) | 17,750 | 82 | 29,736 | 168 MB |
| Peelamedu (north-east edge) | 0.90 ms | 15 (7) | 44,369 | 197 | 138,599 | 150 MB |

"Simulation per frame" is the CPU time for one game update (physics, AI, streaming bookkeeping), without drawing. A 60 fps budget is 16.7 ms.

## Other measurements

| Measurement | Result |
|---|---|
| Building one chunk at full detail (all 49 chunks) | Median 6 ms; 90 % within 21 ms; slowest 26 ms. At most one chunk is built per frame, so the worst case is a brief hitch |
| Start-up before map streaming begins | 39 ms (`init`); then the chunks and road graph download in the background |
| GPS route (100 random routes across the pilot) | 100 found; 1.5 ms on average; slowest 7 ms |
| Map data downloaded at start | 1.7 MB (road graph, roads, points of interest, landmarks, land use, water, chunk index); then about 125 KB per 1 km chunk on average (largest 407 KB) |

## What this means

- **CPU:** simulation stays around 1 ms per frame in every area tested, far inside the frame budget.
- **GPU load:** up to about 140,000 triangles and 260 draw calls. That's comfortable for a desktop graphics card. On phones it may be heavy in dense areas; the "Low" preset reduces traffic, pedestrians and shadows, but not yet map detail.
- **Colliders:** the count rises to about 57,000 with several full-detail chunks loaded. Collision checks only look at nearby 16 m cells, so this doesn't slow the simulation (see Gandhipuram, 1.11 ms).
- **Memory:** 125–170 MB of JavaScript heap.

## Still to measure on real devices

- Frames per second on your PC and on a phone, in Gandhipuram and Town Hall at night and in rain.
- Whether chunk loading causes visible stutters while driving fast along Avinashi Road or Trichy Road.
- Memory after 20–30 minutes of driving across the whole pilot.

## After step D7 (street life)

Lamps, parked cars, vendor carts and bus stops are added per chunk at full detail, drawn as a few instanced meshes per chunk.

| Area | Lamps / parked cars / carts / bus stops loaded | Draw calls | Triangles | Colliders |
|---|---|---|---|---|
| Gandhipuram (density 0.71) | 983 / 914 / 119 / 18 | 353 | 224,569 | 59,676 |
| Peelamedu edge (density 0.67) | 111 / 284 / 35 / 2 | 246 | 147,627 | 45,083 |

- **Traffic:** the target is 35 vehicles in Gandhipuram and 34 at the Peelamedu edge (the Medium preset base is 42), and there were 36–37 on the road.
- **Low preset:** no parked cars or carts, and half as many lamps. Use it on phones.
- **Bus stops:** generated every few hundred metres along trunk and primary roads. They are not real stop positions.

## After restoring building detail

Real buildings now use the grid world's detailed look: four facade styles with window textures that light up at night, ground-floor shopfronts, roof parapets, water tanks, stair rooms, AC units, dishes, balconies and shop awnings.

| Area | Draw calls | Triangles |
|---|---|---|
| Gandhipuram | 541 | 970,252 |

- **Applies to every graphics preset,** as requested: every player gets full building detail.
- **Cost:** this is about 4 times the triangles of the plain boxes. It's fine for a desktop graphics card, but heavy for phones. If phones struggle, the next step is a lower detail level for distant chunks.
