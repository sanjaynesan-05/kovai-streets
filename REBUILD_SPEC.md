# Kovai Streets rebuild: design spec (phase R0)

This spec turns two inputs into one buildable plan:
- **The story:** `Kovai_Streets_Storyline_2.0.md`, 21 missions in 3 acts.
- **The map:** the concept map you supplied, the fictional city with Silver Lake, Silver Hill and eight districts.

Approve this spec (or mark changes) before any code is written.

## Decisions already made

| Topic | Decision |
|---|---|
| Engine | Keep the current engine. Replace the map, missions, place names and map UI. |
| Layout | Fully fictional, matching the concept map. No real Coimbatore road layout. |
| Size | City about 4 × 3 km inside the ring road, plus a band of farmland outside it. |
| Names | The concept map's names: Central Kovai, Old Kovai, Campus Nagar, Mill Estate, Hillcrest, Greenfield, Lakeview, East Junction, Silver Lake, Silver Hill. |
| Terrain | Silver Hill is real raised terrain, with a winding road up to the viewpoint and the quarry. |
| Saves | New save version. Old saves start the new story from the beginning (cash and owned weapons carry over). |
| Order | R0 spec → R1 city → R2 Silver Hill → R3 map UI → R4 Act 1 → R5 Act 2 → R6 Act 3 → R7 optional content → R8 voices, tests and docs. |

---

## 1. The city

**Coordinates:**
- Game metres, +x is east, −z is north. (0, 0) is the middle of the city, just north of Kovai Central station.
- The concept image was scaled so its ring road becomes about 4.0 × 2.9 km.
- The positions below are design targets; the generator may move things a little so roads meet cleanly.

### Main structure

| Feature | Position / extent | Notes |
|---|---|---|
| **Ring road** | Loop through about (−2000, 0), (−1500, −1300), (0, −1450), (1700, −1250), (2050, 0), (1700, 1350), (0, 1500), (−1600, 1200) | Four lanes, roundabouts where it meets the radial roads |
| **Outer highway** | Runs south-west → south → south-east outside the ring, about 300–500 m out | Two lanes, farmland on both sides, petrol bunks |
| **Railway** | Straight line from (−2600, −480) to (2600, 440), through Kovai Central | Double track. Level crossings on minor roads; bridges or underpasses on main roads |
| **Kovai Central station** | (200, 50), platforms along the track | Landmark and fast-travel point |
| **Silver Lake** | Centre (400, 860), about 1.2 km east–west × 0.5 km north–south, with a small island | Lakeside promenade on the south shore; the jetty is on the east shore |
| **Silver Hill** | Summit at about (100, −1700), outside the ring to the north, about 60–80 m high | Forested. Winding road from Hillcrest to the **viewpoint** at the top; the **quarry** is on the west slope |
| **Kovai Municipal Cricket Stadium** | (−830, 520) | Oval stadium |
| **Farmland band** | Outside the ring road to the edge of the map, about 600 m wide | Fields, scattered farmhouses, ponds, tree lines |

### Districts

| District | Centre | Character (look and life) | Landmarks / key places |
|---|---|---|---|
| **Central Kovai** | (200, −320) | Dense commercial core: 4–8 storey shops and offices, busiest traffic and crowds | Temple gopuram (200, −620); Town Hall Square; **Devarajan's office tower**; Royal Grand Hotel; hospital (−300, −330); railway station and mall complex beside Kovai Central |
| **Old Kovai** | (1140, −410) | Old town: narrow lanes, 2–3 storey houses, markets | Church (1140, −590); market street; hospital (930, −90); mosque on the east edge (1750, −400) |
| **Campus Nagar** | (−800, −780) | College town: campus buildings, hostels, tea stalls, students | College; sports ground (−480, −590) |
| **Mill Estate** | (−1410, 90) | Industrial: mill sheds, chimneys, warehouses, workers' housing | **Podanur Mill**; burned mill; police station (−1460, −140) |
| **East Junction** | (1570, 170) | Transport hub: bus terminus, workshops, lorries | **East Junction bus terminus**; **police station** (1400, −50); **communications facility** |
| **Hillcrest** | (450, −1150) | Wooded, sloping, bungalows and villas below Silver Hill | Road up to the viewpoint; **Ghat Wolves' walled compound** on the upper slope |
| **Lakeview** | (450, 1200) | Residential, south of the lake: apartments, street food | **Safehouse**; lake promenade; jetty road |
| **Greenfield** | (1810, 980) | Edge of the city, between the ring road and the farms: farmhouses, warehouses | **Thendral Builders warehouse (godown)**; meeting site from the Tail mission |

**Other map icons from the concept:**
- **Petrol bunks:** about 8, on the ring road and the outer highway.
- **Fire station:** Central Kovai.
- **Parks:** Central Kovai, Lakeview, the lake island.
- **Food and drinks:** every district.
- **Viewpoint:** Silver Hill.

### Streets
- Each district gets streets in its own style, generated as in today's city but with its own layout rules:
  - **Old Kovai:** short, irregular, narrow lanes.
  - **Central Kovai:** a tight grid of shopping streets.
  - **Mill Estate:** wide yards.
  - **Hillcrest:** streets curving with the slope.
  - **Greenfield:** sparse farm roads.
- Radial main roads join the ring road to the centre.
- The flyover moves to the main road crossing the railway in Central Kovai (needed for the Act 2 finale chase).

### Performance targets (same as today)
- 500 m chunks, full detail within about 1 km.
- About 260 pedestrians and 56 vehicles on the Medium preset, kept near the player.
- Gandhipuram-level density at most in Central Kovai and Old Kovai.

---

## 2. Story missions → places

| # | Mission | Act | Type | Where |
|---|---|---|---|---|
| 01 | Smoke Over the Mills | 1 | Combat + tutorial | Mill Estate: Podanur Mill |
| 02 | The Courier | 1 | Surveillance + pursuit | Mill Estate roads → ring road |
| 03 | Burning Looms | 1 | Defence + combat | Mill Estate: a second mill |
| 04 | Silver Hill Deal | 1 | Stealth + boss | Silver Hill quarry |
| 05 | The Lake Shipment | 1 | Investigation + boat chase | Silver Lake jetty (east shore) |
| 06 | Silk Sundaram | 1 | Act finale | Old Kovai Mills: a large mill compound on the Mill Estate / Central Kovai edge, by the railway |
| 07 | Ashes and Ledgers | 2 | Investigation + stealth | Burned mill, Mill Estate |
| 08 | The Tail | 2 | Driving + surveillance | Central Kovai → East Junction → Greenfield |
| 09 | Workers' Voice | 2 | Escort + defence + choice | Town Hall Square, Central Kovai |
| 10 | Night at the Godown | 2 | Pure stealth | Thendral Builders warehouse, Greenfield |
| 11 | The Inspector's Price | 2 | Dialogue + moral choice | East Junction police station |
| 12 | Kathir's Secret | 2 | Investigation + chase + choice | Campus Nagar |
| 13 | Ghat Wolves | 2 | Rescue + combat + escape | Ghat Wolves' compound, Hillcrest |
| 14 | The Auction | 2 | Four-part finale | Kovai Central station and mall → flyover → Silver Lake jetty |
| 15 | The Blueprint | 3 | Investigation + reconnaissance | Devarajan's office tower, Central Kovai |
| 16 | Dead Frequency | 3 | Stealth + sabotage | Communications facility, East Junction |
| 17 | Wheels of Escape | 3 | Vehicle theft + driving | Mill Estate garage → Central Kovai |
| 18 | The Inside Man | 3 | Dialogue + social infiltration | Royal Grand Hotel, Central Kovai |
| 19 | The Vault Job | 3 | Five-stage heist | Devarajan's office tower |
| 20 | No Way Out | 3 | Combat + escape | Central Kovai → railway corridor → Lakeview |
| 21 | The Architect | 3 | Ending and cliffhanger | Lakeview safehouse |

**Characters:** the same as today, plus **Arjun Varadhan**, a security systems specialist, in Act 3.

**Paramasivam's base:** moves to the gate of Podanur Mill in Mill Estate. Act 3 starts at the Lakeview safehouse.

---

## 3. Systems: what exists and what is new

| System | Status today | Work needed |
|---|---|---|
| Combat, bosses, waves | Exists | Bosses that **move between cover** and **try to escape** (missions 04, 06) |
| Stealth: vision cones, crouch, silent takedowns, cameras, alarm | Exists (mission 10) | Flashlight patrols (07); generator distraction (04); entry route choice (main gate / roof / back) |
| Vehicle tail with suspicion meter | Exists (mission 08) | Traffic signals that raise suspicion; spotting the target among others (02) |
| Photographs | Exists (missions 08, 10) | Reused in 04, 05, 15 |
| Escort with a health bar | Exists (mission 09) | Escorting a group of workers |
| Choices with lasting flags | Exists (missions 11, 12) | Persuade option (11), associate choice (18), capture or kill Malai Rajan (13) |
| Boats, boat chase | Exists | **Disable the boat or recover the cargo** choice (05) |
| Wanted level, police, roadblocks | Exists | Checkpoints that depend on the Bhaskar choice (20) |
| **Evidence board** | New | Photos, documents, recordings; connecting clues opens missions and reveals. At the safehouse and from the pause menu |
| **Talk / interrogate** | New (only one-way briefs today) | Short conversation choices with NPCs: workers, fisherman, fleeing attacker |
| **Rescue / free captives** | Partly (freeing trapped workers in 09) | Reused in 01, 06, 13 |
| **Recording conversations** | New | Hold position within range while a meeting plays (08) |
| **Hacking puzzle** | New | A short timed puzzle (16, 19) |
| **Heist board** | New | Crew, approach and vehicle choices at the safehouse; prep status (19) |
| **Social infiltration** | New | Blend in at the hotel, a talk-your-way-past check (18) |
| **Relationship trust** | Partly (Selvi trust) | Trust for Selvi, Kathir, Bhaskar and the workers; shown on the evidence board |
| **Terrain height** | New (R2) | Everything that assumes flat ground: driving, people, traffic, collisions, missions on the hill |
| **Random world events** | New (R7) | The 10 events in the storyline doc |
| **Character side missions** | New (R7) | 3 each for Paramasivam, Kathir, Selvi and Bhaskar |
| **District activities** | Partly (jobs, rampages, stunt jumps, film reels exist) | Restyled per district (R7) |

---

## 4. Voice and text

- Every spoken line in Acts 1–3 is new or reworded: about 250–350 lines in Tamil and English.
- I write the lines in `js/lines.js`; you regenerate the audio with `tools/voice/generate.py` (AI4Bharat TTS), as before.
- Until the audio exists, subtitles show and missions play silently.
- Tamil text stays a draft for a native speaker to review.

---

## 5. Phases and how each is checked

| Phase | Done when |
|---|---|
| **R0** Spec | You approve this document |
| **R1** City ✓ (2026-11-26; details in `EXECUTION_PLAN.md`) | Top-down plan matches the concept map; every district reads differently at street level; traffic, pedestrians and GPS work on the new roads; regression suite passes, with tests moved to new places |
| **R2** Silver Hill ✓ (2026-11-26) | Car, bike and bus climb to the viewpoint and come down; pedestrians and traffic follow slopes; nothing floats or sinks; collisions hold on slopes |
| **R3** Map and HUD ✓ (2026-11-26) | Full map matches the concept's style and legend; minimap matches |
| **R4** Act 1 | Every mission in the storyline doc playable end to end, including its optional objective; tests for each mission |
| **R5** Act 2 | The same, plus the evidence board, and every choice path reaches the finale |
| **R6** Act 3 | Both heist approaches finish; every crew combination reaches the ending |
| **R7** Optional content | 12 side missions, district activities and 10 random events |
| **R8** Finish | Voice lines written, docs updated, full regression suite and performance check |

**Old code that goes:** the real-Coimbatore pipeline output (`geodata/processed/city`) and the real place names. The OpenStreetMap pipeline stays in `tools/geo/` in case it's wanted later.

---

## 6. Open questions (answer any time before the phase that needs them)

1. **R1:** Should real Coimbatore flavour remain in names of shops, streets and buses (e.g. "Avinashi Road" as a street name), or should every name be fictional?
2. **R4:** Does the protagonist get a name, or stay "thambi"?
3. **R6:** How much does the Vault Job pay, and can it be replayed?
4. **R7:** Which random events matter most, if not all 10 can be done at once?
