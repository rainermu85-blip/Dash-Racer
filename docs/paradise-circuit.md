# Paradise Circuit

A new seventh level, selected under **Beyond the Neon**, without replacing an
existing course. One closed 3,500-segment lap (525,000 world units) takes about
124 seconds with normal acceleration and clean driving, without turbo. The
existing car handling, rival profiles and finite AI turbo budget are retained.

## Route

| Segments | Island | Main scenery | Following bridge |
| --- | --- | --- | --- |
| 0–349 | Lagoon Key | Fishing village, market, musicians, beach bar | Open rails, sailing regatta and dolphins |
| 700–1049 | Emerald Isle | Dense groves, moving waterfall, trail hut and birds | Warm truss ribs, limestone stacks |
| 1400–1749 | Sunset Airport | Terminal, control tower, landing jumbo, luggage tractor and shuttle | Causeway with passing ferry |
| 2100–2449 | Port Azure | Waterfront shops, market, café guests, nets and fisherman | Suspension bridge, fishing boat and sailing yacht |
| 2800–3149 | Coral Cay | Rock arch, overwater huts, volleyball, beach guests and surf rack | Open rails, windsurfer and dolphins |

Each island and each connecting bridge contains 350 segments. The first island
includes acceleration from rest; the remaining islands take approximately
12.15 seconds at clean top speed. Full test drive: 62.98 seconds on land,
60.78 seconds on bridges. Boosts and mistakes naturally change those times.
The route joins at matching height, slope and curvature. Finish is a painted
road marking; there is no finish gate or last-lap announcement for this one-lap
race. All six racers get actual finish timestamps.

## Inhabited scenes and crossings

The second scenery pass groups people and props into places: the fishing village,
waterfront cafés and lagoon beach each have their own activities. Jungle canopy
clusters alternate sides irregularly. Small settlements and palms are grounded
on distant island silhouettes rather than cross-fading a floating skyline.

Each bridge retains its original length. Open lagoon rails, a warm truss pattern,
the airport causeway and the existing suspension towers give the crossings
separate identities. Regatta boats, a ferry, fishing boat, limestone stacks,
windsurfer and two dolphin groups create sights at different points along them.
Their scale is relative to the road; surf equipment and people stay much smaller
than vessels. Volleyball was moved to segment 2990 after the initial placement
failed the approach-visibility check. The beach bar follows at 3055.

Waterfall streaks, bird wings, volleyball, musicians and boat wakes use bounded
vector animation. Boat motion and beach animation follow race time and freeze
when paused. Dolphins jump as the car approaches. Static art is rasterized once;
these additions do not modify other levels, the camera or racer mechanics.

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
expanded scene cache uses about 9 MiB (budget: less than 10 MiB) of logical RGBA
pixels (excluding browser/GPU overhead and the game's shared assets). New scenery fades in at distance;
road draw distance is bounded to 210 segments.

## Validation

Build: `npm run build -- --base=/Dash-Racer/`.
Run `scripts/assess-game.cjs paradise` using the same Playwright environment as
other assessment modes. It drives a full normal-speed lap, then a complete
six-car race; checks single-lap results, loop joins, bridge contact, late-turbo
landing timing, landmark screen bounds, asphalt seams, cache immutability,
restart and unchanged lap counts for the other six levels. It saves screenshots
for visual review. Run `scoreboard` and `hills-stability` when integrating changes
to shared race or projection code.

`scripts/profile-paradise.cjs` samples native RAF in jungle, airport, harbour,
bridge, regatta, ferry and dolphin sections at 390×844 with 2× CPU throttling.
Run it alone. These are cloud
Chromium measurements, not a guarantee of performance on the player's phone.

`scripts/assessment-level-loading.cjs` serves the source and production build as
plain static sites, exercises all seven levels through browser UI clicks in one
session, and checks real countdown progress, vehicle movement, pause/exit and
missing scripts. This specifically covers switching away from Paradise after
its menu preview, the failure that the initial build-only assessment missed.

The expanded-scene profile measured median frame intervals of about 16.7 ms,
95th-percentile intervals of 33.4 ms, and no sampled intervals over 50 ms.
95th-percentile render work ranged from 6.9 to 11.2 ms. The earlier, emptier
version measured about 7.8–9 ms in its four sampled sections, so these additions
have a measurable cost. These short samples are not a whole-race device benchmark.
See `docs/evidence/paradise-life-profile.json` and `paradise-life.json`.
