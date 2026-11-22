# Kovai Streets 2.0: Foundation Report (save safety, refactor, critical bugs)

This report covers the approved foundation work: backup and baseline, save safety, the JavaScript refactor, the flyover fix and the two-wheeler passenger fix, followed by a full regression run. It uses the format in `TODO.TXT` §24.

- **Date:** 2026-11-22
- **Starting point:** commit `625607f`, tagged `pre-foundation-2026-11-22`
- **Not started yet (as instructed):** the Kovai Streets 2.0 expansion, including the dialogue and voiceover system.

---

## Results at a glance

| | Baseline (original code) | After the refactor (before fixes) | Final |
|---|---|---|---|
| Automated tests passing | 53 / 79 | 53 / 79 (identical results) | **86 / 86** |
| JavaScript errors | 0 | 0 | **0** |
| Flyover pass-under tests (15) | 0 pass | 0 pass | **15 pass** |
| Two-wheeler passenger tests (8) | 0 pass | 0 pass | **8 pass** |
| World build time (Chrome) | 4.0–6.2 s | 3.3 s | **2.9 s** |

The final run has 7 more tests than the baseline. These are the new save-safety unit tests.

---

## 1. Backup and baseline

- **Full copy of the project:** `C:\Users\sanja\Downloads\kovai-streets-backup-2026-11-22`
- **Git tag:** `pre-foundation-2026-11-22` on commit `625607f`
- **Automated regression suite:** `tools/regression-test.js`. It runs in the browser through the game's debug hook and has 9 groups: core, vehicles, world, missions, jobs, police, save and saveSafety, plus `all` to run everything. On the untouched code it passed 53 of 79. All 26 failures were the two known bugs, plus one newly found stunt-jump bug (section 5).

## 2. Save safety

**Root cause of the risk:** the old loader treated any unreadable save as "no save", and the next autosave overwrote it. There was also no versioning, backup or validation.

**What was implemented** (`js/progression.js`, the "saving" section):

- **Versioned format:**
  - Saves are now `{v:2, t, sum, data}`, where `sum` is a checksum of `data`.
  - Version-1 saves (the old flat format) are migrated on load through a migration table, ready for future versions.
- **Validation and sanitising:** every loaded value is type-checked and clamped (cash, armour, weapons, story progress, reel, jump and rampage IDs, garage vehicle types, outfit, tutorial step). A save missing its core fields counts as corrupt.
- **Never writing bad data:** each save is built, sanitised and read back before it's written. If that fails, nothing is written.
- **Last known-good backup:** before each write, the current save is copied to `kovaiSave1.bak`, but only if it's valid.
- **Corruption recovery:**
  - An unreadable save is copied to `kovaiSave1.corrupt` and never deleted.
  - The backup is loaded instead, and a notice appears on the start screen and in-game.
  - With no backup, a new game starts, with a notice explaining where the damaged copy was kept.
- **Newer-version protection:** a save from a newer game version isn't loaded or changed, and that session doesn't save.
- **Storage failures:** if the browser can't write (full or blocked), the existing save is left untouched and a warning is shown once.
- **New game / Delete save:**
  - New game keeps a copy of the replaced save in `kovaiSave1.prev`.
  - Delete save removes all four keys.

**Tests:** 8 scenarios with real page reloads, all passing:
- (A) v1 migration: nothing lost, including garage and outfit
- (B) tampered checksum with backup → backup restored, bad copy kept
- (C) unreadable save with no backup → new game, bad copy kept
- (D) newer version → untouched, saving disabled
- (E) invalid fields → treated as corrupt
- (F) storage write failure → old save untouched, warning shown
- (G) New game → `.prev` kept, then a clean start
- (H) sanitiser clamping

7 of these checks are now automated in the `saveSafety` test group. Scenario A was re-run on the final code.

## 3. JavaScript refactor

**Method:**
1. Every top-level statement (604) and shared name (661) was parsed with Node's built-in JavaScript parser (acorn).
2. For each statement, I computed the names it needs **when the page loads**. This follows functions it calls straight away and callbacks run immediately (like `forEach`), but not deferred callbacks such as `addEventListener` or `setTimeout`. Local variables and parameters were excluded.
3. Each proposed file layout was then checked:
   - functions must be declared in the same file or an earlier one;
   - `let`/`const` must come earlier in the new order.
4. The final layout introduces **zero** new load-order problems.

**Result:** `index.html` now holds only the page markup, `css/style.css` and the script tags. The game code is in 18 classic scripts in `js/`:

| Load order | File | Responsibility |
|---|---|---|
| 1 | `core.js` | utilities, renderer, scene, lights, world constants, collision grid, geometry batching, mesh helpers, quality, settings store |
| 2 | `textures.js` | procedural textures and shared materials |
| 3 | `models.js` | character models, poses, clothing palettes, map icons |
| 4 | `vehicles.js` | vehicle types, spawning, traffic AI, meshes, physics, damage, passenger seats |
| 5 | `world.js` | roads, blocks, buildings, Ghats terrain, coast and water, landmarks, flyover |
| 6 | `environment.js` | street lamps, sky, day/night, weather, rain |
| 7 | `actors.js` | player state and weapons, pedestrians, gangs, wanderers |
| 8 | `combat.js` | shooting, melee, grenades, weapon wheel, rockets, effects, pickups, lock-on |
| 9 | `gameplay.js` | police and wanted level, shop and hospital, friends and conversations, cheats, respawn, police extras |
| 10 | `missions.js` | jobs, story stage framework, film reels, stunt jumps, rampages |
| 11 | `passengers.js` | *(new)* passengers riding with the player |
| 12 | `player.js` | on-foot movement, crouch/cover/vault, vehicle entry animation, camera |
| 13 | `hud.js` | HUD, minimap, city map, toasts, tutorial |
| 14 | `audio.js` | all sound |
| 15 | `input.js` | keyboard, mouse, pointer lock, pause/resume, touch |
| 16 | `progression.js` | Respect, save system, safehouse and garage, outfits, area gates |
| 17 | `ui.js` | pause menu progress and settings, tips, `file://` warning |
| 18 | `main.js` | per-frame update, main loop, initialisation, debug hook |

**Behaviour-neutral checks:**
- **Same code, same order:** joined together, the split files contain exactly the original code lines (only two section-header comments were dropped). Statement order is the original order within each responsibility.
- **Same behaviour:** the regression suite gave **identical results before and after the split** (53/79, same failures), with no JavaScript errors.

**Changes made during the split, all behaviour-neutral:**
- **No `return` at top level:** the "Three.js failed to load" check now uses `throw` instead of `return`, because top-level `return` isn't allowed outside a function.
- **`moveTo` renamed to `walkTo`:** the game's helper would otherwise replace the browser's `window.moveTo`. That was the only one of the 661 names that clashes with a browser built-in.
- **Key declaration split:** `const SAVE_KEY=…,SET_KEY=…` became two statements, so each could move to its own file.

**Why classic scripts, not ES modules:**
- The code assigns many shared variables from many places (`mission`, `wanted`, `rep`, `tod`…). ES-module imports are read-only, so modules would mean re-architecting that shared state, which the brief rules out.
- Classic scripts share one top-level scope, exactly like the old single closure.
- **One difference:** function names are now also visible as `window` properties. None of them clash with anything except the renamed `moveTo`.

## 4. Runtime: local server

- **One-click launcher:** `start-server.bat` (Windows) checks for Python, starts `python -m http.server 8000` and opens the browser.
- **Hosting-ready:** all paths are relative, so the folder can be hosted as-is (Netlify, GitHub Pages, itch.io).
- **`file://` warning:** opening `index.html` directly still runs the game, but the start screen shows a note pointing to the launcher.
- **README updated:** how to run, the new folder layout, saving, and the tests.

## 5. Critical bug fixes

### 5.1 Flyover collision (`js/world.js`, `buildFlyover`)

**Root cause:** for every 8 m slice where the deck was above 2.2 m, one collider (`addCollider(x,-hw,x+8,hw,lo-0.45,-1)`) filled the space **from the ground to just under the deck, across its full 13 m width**.

**Fix:**
- **Underside slab:** each slice gets a slab matching the underside of the visible 0.7 m deck (bottom = deck − 0.7, top = deck − 0.5). It blocks anything coming from below (people, bullets, the camera) and leaves the road underneath open. Its top sits 0.5 m below the driving surface, which is still the `SURF` height function, so a vehicle climbing the ramp never catches the next slice.
- **Under the ramp ends:** a solid blocker now exists only where the clearance is below `FLY_CLEAR = 3.6 m` (too low for any vehicle). Before, it covered the whole span.
- **Unchanged:** the pillars and side walls keep their colliders.

**Tested:**
- All three cross streets (x = 148, 222, 296):
  - walking, both directions (6 tests)
  - car, bus and motorbike (9 tests)
- Deck drivable from end to end, up and down both ramps.
- Deck solid from above.
- Pillar still blocks a pedestrian.
- Side wall keeps a car on the deck.
- Film reel #20 under the flyover is now collectable.

**Side effects fixed:**
- Traffic on those cross streets no longer jams.
- Film reel #20 can be collected, so 100% completion is possible again.

### 5.2 Two-wheeler passengers (`js/passengers.js` new; `js/vehicles.js`, `js/gameplay.js`, `js/actors.js`, `js/main.js`)

**Root cause:** riding with the player was modelled as "hide the character", whatever the vehicle (`f.inCar=true; h.g.visible=false`). Fare customers were hidden for the whole job, and there was no seat model or capacity.

**Fix:**
- **Seats per vehicle (`seatsOf`):**
  - Two-wheelers: 1 visible pillion seat, positioned per model (bike, cruiser, sports, scooter, retro, moped and bicycle carrier).
  - Other vehicles: 3 hidden seats (bus 20, tank 2), matching the previous behaviour.
- **One board/alight path for friends and fare customers:**
  - Passengers board within 8 m, or automatically if left more than 80 m behind.
  - When you get off, they step off on the other side of the vehicle, with rotation, arm pose and gun visibility restored.
  - If the vehicle changes or is wrecked, they get off rather than vanishing.
  - Sending a friend home also gets her off cleanly.
- **Drawing the rider:** every frame, after the vehicle moves, riders are placed using the vehicle's position, heading, lean and slope. They use the seated pose with hands on the rider's waist, sitting 0.4 m behind the rider so they don't clip.
- **Seat limits:**
  - On a full two-wheeler, extra friends follow on foot.
  - A paying fare customer takes the seat from a friend.
  - Fare customers now also walk with you when you're on foot, instead of being invisible.

**Tested:**
- Every two-wheeler type: passenger boards, stays visible for the whole ride while accelerating and turning, stays within 1.2 m of the bike, and gets off cleanly (7 tests).
- A fare customer rides pillion visibly (1 test).
- Visual check: screenshot of a pillion passenger on a scooter passing under the flyover.

### 5.3 Extra bug found by the baseline: stunt jumps (`js/missions.js`)

**Cause:** the ramp launched the car up to 1.6 m before its lip. In slow motion the ramp surface caught up with the car, it "landed" on its own ramp, and the jump counted as weak. Results depended on speed.

**Fix:** launch only at the lip (or just after leaving it), and start the jump at lip height.

**Tested:** the automated stunt-jump test passes.

---

## 6. Files

| File | Change |
|---|---|
| `index.html` | Now markup + 19 script tags + stylesheet link (was the whole game) |
| `css/style.css` | **New:** all styles (moved), plus save-notice and run-notice styles |
| `js/*.js` (18 files) | **New:** the game code, split by responsibility. Includes the save system, the flyover, stunt and passenger fixes, and `passengers.js` |
| `start-server.bat` | **New:** Windows local-server launcher |
| `tools/regression-test.js` | **New:** automated regression suite |
| `README.md` | Updated: running, folder layout, saving, tests, hosting ZIP contents, load time |
| `PHASE0_AUDIT.md`, `PHASE1_REPORT.md` | Audit and this report |

Nothing has been committed to git yet.

## 7. Known limitations and remaining issues

1. **Frame rate not measured:** automated tests run in a background Chrome tab, which is throttled to about 1 fps. Logic and correctness were verified by stepping the game, but real gameplay feel (handling at 60 fps, how the pillion looks in motion) should be played by a person.
2. **Crash ejection:** when a hard crash throws the rider off a two-wheeler, the passenger simply gets off. They aren't thrown.
3. **No visible car passengers:** passengers in cars, autos and buses are still hidden inside, as before. Showing them seated would be a future improvement.
4. **Emergency-run patient:** there is still no character model for the patient.
5. **Global function names:** these are now `window` properties (none clash). If third-party scripts are ever added, a namespace would be safer.
6. **Mid-mission saves:** progress partway through a mission still isn't saved, as before.
7. **Remaining audit findings:** instant gang aggression, no police witnesses, Ghats vegetation, character UVs and the invisible area gates are unchanged. They belong to later phases.

## 8. Recommended next step

The foundation is verified. Next comes the approved **dialogue and voiceover system** (Phase 7 of the brief):
- dialogue line IDs per character;
- English and Tamil subtitles with a language setting;
- dialogue volume, with radio ducking while someone speaks;
- an audio manifest and file-naming convention under `assets/voice/`;
- missing-audio fallback (subtitles only, or optional device speech);
- no generated recordings and no external APIs.

After that, follow the phase order in the audit.
