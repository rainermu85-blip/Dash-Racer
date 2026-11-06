# Paradise Circuit — first playable version

A new seventh level, selected under **Beyond the Neon**, without replacing an
existing course. One closed 3,500-segment lap (525,000 world units) takes about
124 seconds with normal acceleration and clean driving, without turbo. The
existing car handling, rival profiles and finite AI turbo budget are retained.

## Route

| Segments | Island | Main scenery | Following bridge |
| --- | --- | --- | --- |
| 0–349 | Lagoon Key | Stilt huts, palms, canoes, beach bar | Low lagoon crossing |
| 700–1049 | Emerald Isle | Dense palm groves, volcanic rock, waterfall | Gentle elevated curve |
| 1400–1749 | Sunset Airport | Terminal, control tower, perpendicular runway, landing jumbo | Low open-water causeway |
| 2100–2449 | Port Azure | Pastel waterfront shops, café, lighthouse, sailing boats | Tall suspension crossing |
| 2800–3149 | Coral Cay | Rock arch, overwater huts and wooden access piers | Straight return towards start/finish |

Each island and each connecting bridge contains 350 segments. The first island
includes acceleration from rest; the remaining islands take approximately
12.15 seconds at clean top speed. Full test drive: 62.98 seconds on land,
60.78 seconds on bridges. Boosts and mistakes naturally change those times.
The route joins at matching height, slope and curvature. Finish is a painted
road marking; there is no finish gate or last-lap announcement for this one-lap
race. All six racers get actual finish timestamps.

## Rendering and landing

The route, scenery and artwork are included in `index.html` with the existing
game script. Both direct repository-root hosting and the Vite build therefore
load the same self-contained code. No separate Paradise script request is needed.
The first release's separate public script existed at the expected URL only in
the Vite build; direct root hosting returned 404, then selecting Paradise threw
and stopped the render loop. This dependency was removed after reproducing both
the failed start and the frozen subsequent level switches.

Land and shoreline slices share the road plane, against a continuous turquoise
sea backdrop. The airport island widens underneath its runway. The new level
uses continuous near clipping and fractional curve integration, including the
same correction in the collision projection. Parapets bound both player and
opponents at ±0.88. Existing levels retain their boundaries and artwork.

A raised-deck four-engine airliner approaches nose first from the left. Its
approximately 70 m body is scaled against the roughly 20 m full roadway.
The approach is triggered by the player, pauses with the simulation and resets
on restart. A progress floor accelerates the sequence when the player fires
late turbos, so the crossing and touchdown remain ahead of the car. This is a
choreographed sight, not an aircraft physics simulation. It lands on the runway
on the right, before the player passes the crossing.

Artwork is cached once at race construction, at a bounded raster resolution.
There are no repeated full-screen texture updates or lighting variants. The
scene cache uses less than 6 MiB of logical RGBA pixels (excluding browser/GPU
overhead and the game's shared assets). New scenery fades in at distance;
road draw distance is bounded to 210 segments.

## Validation

Build: `npm run build -- --base=/Dash-Racer/`.
Run `scripts/assess-game.cjs paradise` using the same Playwright environment as
other assessment modes. It drives a full normal-speed lap, then a complete
six-car race; checks single-lap results, loop joins, bridge contact, late-turbo
landing timing, landmark screen bounds, asphalt seams, cache immutability,
restart and unchanged lap counts for the other six levels. It saves screenshots
for visual review. Also run `scoreboard` and `hills-stability` after integration.

`scripts/profile-paradise.cjs` samples native RAF in jungle, airport, harbour and
bridge sections at 390×844 with 2× CPU throttling. Run it alone. These are cloud
Chromium measurements, not a guarantee of performance on the player's phone.

`scripts/assessment-level-loading.cjs` serves the source and production build as
plain static sites, exercises all seven levels through browser UI clicks in one
session, and checks real countdown progress, vehicle movement, pause/exit and
missing scripts. This specifically covers switching away from Paradise after
its menu preview, the failure that the initial build-only assessment missed.
