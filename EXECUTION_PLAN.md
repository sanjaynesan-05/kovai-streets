# Kovai Streets 2.0: Execution Plan (from here on)

This plan covers what remains of `TODO.TXT` after commit `d517648`. Each phase lists:
- **Goal:** what the phase is for.
- **Scope:** what gets built.
- **Verify:** concrete checks that prove the phase is finished.
- **Decide first:** questions only you can answer, settled before the phase starts.

Phases are kept small, so each one is a single focused change followed by one commit.

**Working rules for every phase** (from `CLAUDE.md`):
- **Before:** answer the phase's "Decide first" questions, then tag git (`pre-<phase>`).
- **During:** make surgical changes in the existing `js/` files, or one new file if the phase is a new system. No speculative features.
- **After:** run the automated suite once (`tools/regression-test.js`, groups `all` and `act2`), add tests only for the phase's own "Verify" items, update `GAME_CONTENT.md` and the README if content changed, then commit.

---

## Already done

| | |
|---|---|
| Foundation | Save safety (v3 with backup and recovery), code split into `js/`, local server, regression suite |
| Critical bugs | Flyover underpass, two-wheeler pillion, stunt-jump launch |
| Story | Act 1 (missions 1–6), Act 2 "Threads of Kovai" (missions 7–14), open ending |
| Presentation | Cinematic main menu |
| Voice (Phase G) | Tamil-first voice system: 83 lines voiced in Tamil and English (AI4Bharat Indic Parler-TTS), Tamil subtitles with small English, voice/subtitle/dialogue-volume settings |

---

## Phase A: Act 3 opener, "The Vault Job" (heist system)  *← next*

**Goal:** a heist that feels different from ordinary missions. Planning choices change how the heist itself plays out.

**Scope:**
1. **Heist board:** a new screen opened at the safehouse, using the same overlay style as the menu. It shows the target, the intel collected, and the choices: crew, approach and getaway vehicle.
2. **Prep missions (2–3 short ones, which reuse Act 2 mechanics):**
   - Scout the vault site: photograph entrances (the investigation mechanic).
   - Get the gear: a delivery-style job.
   - Optionally, acquire a getaway vehicle (park it in the garage).
3. **Crew:** availability follows Act 2 flags. Kathir is the driver if forgiven, Bhaskar gives intel if ally or coerced, Selvi gives the building layout if her trust is 2+, Paramasivam provides contacts. Plus one new character: a security specialist.
4. **Approach:**
   - **Stealth:** reuse the guard cones and cameras. Fewer police later.
   - **Loud:** a combat wave plus an immediate 3-star wanted level.
5. **Execution:** entry → disable security → vault timer → loot (files plus cash) → escape to a drop point. Outcome changes with the choices: skipped prep adds complications, and a missing crew member removes help.
6. **Ending:** the files reveal `KOVAI — PHASE 01 — COMPLETED` and `NEXT LOCATION — PENDING`. The Architect stays hidden.
7. **Save:** extend `PROG` with an `a3` object (save v4 migration).

**Verify:**
- Both approaches complete.
- Every crew combination reaches the ending.
- Skipped prep produces a visible complication.
- Heist progress survives save and reload.
- v3 saves migrate to v4.

**Decide first:**
- Where is the vault: a new building in the city, or somewhere in the hills?
- The specialist's name.
- The cash payout size.
- Is the heist repeatable?

---

## Phase B: Gang territory AI (TODO §10)  *✓ built, needs your playtest*

**Status:** built in `js/actors.js` with fixed values: territory 30 m, warning 16 m, attack after 6 s inside, cooldown 60 s, 3 reinforcements after 2 kills. New lines `gang_warn_1`, `gang_warn_2`, `gang_attack` (speaker `gang`) need voices: `python tools/voice/generate.py --lang both --speaker gang`.

**Goal:** gangs stop attacking on sight.

**Scope:**
- **State machine** per gang member: neutral → suspicious → warning → hostile → cooldown.
- **Territories:** the 7 existing hangouts get a radius.
- **Warnings:** a spoken warning in subtitles, using a line ID.
- **Escalation:** aiming at, hitting or shooting a member makes the whole group hostile. Reinforcements come after repeated attacks.
- **Memory:** hostility cools down after you leave.
- **Story missions keep their behaviour:** they set `aggro`/`passive` explicitly.

**Verify:**
- Walking through a territory gives a warning, not an attack.
- Provoking a member makes the group hostile.
- Leaving for about 60 s resets the group to neutral.
- Gang hostility never adds wanted stars.
- Act 1 and Act 2 mission tests still pass.

**Decide first:** should the warning distance and cooldown time be tunable, or are fixed values fine?

---

## Phase C: Police witnesses and search (TODO §11)  *✓ built, needs your playtest*

**Status:** built in `js/gameplay.js`. Killing a pedestrian or a cop is witnessed (police: stars at once; pedestrian: reports after 5 s unless stopped). Crimes against police cars and the helicopter still add stars directly, because the officers are the witnesses. Police cars search around your last known position; foot officers and the helicopter keep their old behaviour.

**Goal:** wanted stars come from witnessed crimes, and police search for you.

**Scope:**
- **Witnesses:** a crime only adds stars if a pedestrian or police officer can see it within about 40 m. A witness who sees it runs to "report" it, which adds a short delay.
- **Search:** police go to your last known position and search the area. Stars drop only while you're out of sight.
- **Keep:** the existing star tiers (foot officers, roadblocks, helicopter) and the Act 2 choice effects.

**Verify:**
- A crime with no witnesses gives no stars.
- A witnessed crime gives stars, after a delay if the witness reports.
- Police converge on the last known position.
- Existing police tests pass.

---

## Phase D: City population and traffic (TODO §12)

**Goal:** a busier city without slowing it down.

**Scope:**
- **District density table:** Gandhipuram is high, the outskirts low, the Ghats very low.
- **Spawning:** people and vehicles spawn near the player by district.
- **Throttling:** distant actors update less often.
- **Parked cars** on main streets.
- **Traffic signals** at about 6 major junctions, which AI cars obey.

**Verify:**
- Pedestrian and vehicle counts differ by district.
- Frame-time cost stays within 10% of the current baseline: measure in a foreground tab, which needs you.
- AI cars stop at red lights.
- Nothing piles up over 10 minutes of play.

**Decide first:** your target device. That decides the Low/Medium/High caps.

---

## Phase E: Meena and Divya storylines (TODO §6)

**Goal:** five missions each, using the existing stage framework.

**Scope:**
- **Meena:** racing, a rival crew, a stolen car, the final race. Uses the race and tail mechanics.
- **Divya:** investigation, a data trail, a facility infiltration, stopping a data breach. Uses the search and stealth mechanics, with no "magic hacking".
- **Rewards:** a special racing vehicle, unique clothing, armour upgrade, and a safehouse equipment item.

**Verify:**
- Each chain plays start to finish and needs friendship ≥ a threshold.
- The existing Kovai Racer and armour perks still work.
- Progress saves.

**Decide first:** friendship thresholds; whether chains unlock during Act 2 or after it.

---

## Phase F: Economy and lifestyle (TODO §9)

**Goal:** money has real uses.

**Scope, in this order** (each item can be committed on its own):
1. **Clothing shop:** buy outfits. This extends the 6 existing outfits.
2. **Vehicle dealership:** buy a vehicle, which is delivered to the garage.
3. **Garage upgrades:** engine, brakes, handling and paint, which change `VT`-derived values for that vehicle.
4. **Food stalls and restaurants:** health and small timed buffs.
5. **Properties:** 2–3 more save points.
6. **Businesses:** passive income, collected in person, with a balanced cap.

**Verify:**
- Every purchase changes the actual game state and survives a reload.
- Repeated interaction can't exploit purchases.
- Income respects its cap.

**Decide first:** price levels relative to mission rewards.

---

## Phase G: Dialogue and voice system (TODO §8)  *✓ done*

**Status:** done. All 83 story lines have Tamil and English recordings in `assets/voice/`, generated with `tools/voice/generate.py`. Still open:

- a native speaker should review the Tamil text;
- key lines (`m12_caught`, `m12_why`, `m14_*`) could be re-recorded by actors later;
- in-game check of every line by you.

New lines added in later phases need a line ID in `js/lines.js`, then a run of `generate.py` for both languages.

**Goal:** recordings can be added later without code changes.

**Scope:**
- **Playback:** play `assets/voice/<lang>/<lineId>.mp3` from a `manifest.json`.
- **Volume:** a dialogue volume setting, and the radio is lowered while someone speaks.
- **Fallback:** subtitles only when a recording is missing.
- **Optional:** the device's speech voice.
- **No external APIs.**

**Verify:**
- With an empty manifest, everything behaves as it does today.
- With one test file listed, that line plays and the subtitles match.

**Decide first:** the recording source (actors or a TTS service you choose).

---

## Phase H: Western Ghats environment (TODO §3)

**Goal:** a natural-looking forest.

**Scope:**
- 3–4 tree shapes.
- Clustered placement from a noise map instead of the current grid.
- Grass and bush patches, and rocks.
- Distance culling.

**Verify:**
- No grid pattern is visible.
- The frame-time budget is the same as in Phase D.
- The Low preset reduces density.

---

## Phase I: Characters (TODO §4)

**Goal:** distinct main characters, and support for custom faces later.

**Scope:**
- A separate head mesh with UVs, and a face texture slot.
- Distinct looks for Paramasivam, Kathir, Selvi, Bhaskar, Devarajan and Sundaram.
- Idle animations.

**Verify:**
- All NPCs still render.
- A test face texture appears on one character.
- The performance budget holds.

**Decide first:** any real photographs need the person's permission.

---

## Phase J: Presentation polish (TODO §13–19)

**Goal:** finish the UI and atmosphere items.

**Scope:**
- Map waypoints with route guidance and distance.
- Mission list and inventory screens.
- Cutscene camera shots for story beats, skippable.
- Weather states (cloudy, heavy rain, puddles).
- Effects and ambient volume sliders.
- Enterable safehouse interior.

**Verify:** each item is checked individually against its §23 checklist line in `TODO.TXT`.

---

## Phase K: Final pass (TODO §12 and §23)

**Goal:** a release-quality build.

**Scope:**
- The whole regression suite plus the §23 checklist.
- Save migration from v1 to the latest version.
- A manual playthrough by you on desktop and on a phone.
- Documentation refresh.

**Verify:** all tests pass, there are no console errors, and your playtest notes are resolved.

---

## Small backlog (fold into a nearby phase)

| Item | Phase |
|---|---|
| Phone and portrait menu layout check (needs a real device) | K |
| Act 2 difficulty tuning after your playtest | B |
| Emergency-run patient model, visible passengers in cars | I |
| Credits name (currently "The Kovai Streets developer") | Any (needs your input) |
| "Podanur mill" text vs the Singanallur district label | B |
| `msg.txt` and the new `CLAUDE.md` are untracked: decide whether to commit or ignore them | Now |

## Suggested order and size

| Order | Phase | Size |
|---|---|---|
| 1 | A: Heist (Act 3 opener) | Large |
| 2 | B: Gang AI | Built |
| 3 | C: Police witnesses | Built |
| 4 | D: Population and traffic | Large |
| 5 | E: Meena and Divya | Large |
| 6 | F: Economy | Large (6 sub-commits) |
| 7 | G: Voice system | Done |
| 8 | H: Ghats environment | Medium |
| 9 | I: Characters | Large |
| 10 | J: Presentation | Large |
| 11 | K: Final pass | Medium |
