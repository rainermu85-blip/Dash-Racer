# Paradise Circuit

Seventh level under **Beyond the Neon**, one closed lap across five tropical
islands. The shortened route has 2,625 segments (393,750 world units): each
island keeps its 350 segments, each bridge now has 175 instead of 350. A clean,
normal-speed lap takes about **93 seconds**: 63 on islands and 30 on bridges.
This replaces the original 124-second, half-land/half-bridge layout following
feedback that the crossings dragged. Turbo and collisions change the time.

## Places

| Segments | Island | Principal scenes |
| --- | --- | --- |
| 0–349 | Lagoon Key | Verandah houses, fish dock, market, village, musicians and pedestrians |
| 525–874 | Emerald Isle | Dense forest corridor, waterfall with a clear sightline, trail hut and hikers |
| 1050–1399 | Sunset Airport | Open hangar with island-hopper, luggage tractor, terminal, jumbo landing, shuttle and travellers |
| 1575–1924 | Port Azure | Waterfront shops, hotel, clock tower, market, cafés, fishing dock and pedestrians |
| 2100–2449 | Coral Cay | Rock arch, beach resort, overwater huts, volleyball, parasailing and a music stage with dancers |

Each island is followed by a 175-segment bridge. Open lagoon rails, warm truss
ribs, the airport causeway and suspension towers distinguish the crossings.
Regatta boats, a ferry, limestone stacks, fishing boats, a windsurfer and dolphin
groups remain along them. Bridge props and cable anchors follow the compressed
layout; player and rival collision boundaries stay aligned with the parapets.

Landmark sightlines are kept open through the more varied island bends.
Architecture and pedestrians sit near the road in groups rather than being
scattered across open fields. Waterfall trees were moved out of the sightline;
the old bar that obscured the music stage was removed. Scene dimensions use the
road as their common scale. Human and equipment proportions stay distinct from
large vessels and the 747.

## Route character and full-course traffic

All five islands and all five bridges now have four lanes: two each way, with
white dividers and a drivable double-yellow centre line. The full road is one
third wider than the original three-lane version. Vehicle size is preserved;
parapets, bridge towers, road limits, offroad drag and roadside clearance use
the same width. Player and rivals start on their own carriageway with clear
longitudinal spacing. A `TWO WAY / KEEP RIGHT` sign introduces the layout.

The islands have different bend sequences and low crests:

- Lagoon Key: a long left coastal bend into a broader right bend and gentle rise.
- Emerald Isle: a turning approach, a clear waterfall window and an S-shaped exit.
- Sunset Airport: a clear, flat landing approach followed by a rising right exit.
- Port Azure: a waterfront straight followed by two opposing bends.
- Coral Cay: left/right/left resort sweeps, followed by a gently turning bridge
  and 85 flat, straight segments before the finish (about three seconds).

All crossings now bend. The second bridge changes direction; the suspension
bridge follows a shallow arc. Heights return to zero at the island joins; the
last bridge settles before the finish. Static scenery remains attached to its
road plane. Water objects use the common sea level rather than following a
bridge crest, and shoreline widths preserve the water clearance of boats and
stilt huts when the road widens.

There are 23 oncoming vehicles across the full lap, with sparse singles and
occasional small groups. The same five cached front/colour combinations are
reused, retaining the art budget. Traffic starts moving with race simulation
and follows fixed physical trajectories; there are no player-relative respawns
or speed gifts. The encounter distribution was tuned for visibility through the
new bends, including from the outer right lane. Departed vehicles are removed
only behind all unfinished racers. Player and AI use the same swept contacts,
impact costs and severity rules. A frontal opposing-traffic collision with at
least 20% body overlap now caps the racer at 60 HUD km/h (without speeding up
an already slower car). It cancels boost/recovery, resets the normal-speed
trajectory to the reduced speed and clears earned headroom. Pure edge scrapes
keep their milder proportional penalty. A scrape can escalate to a frontal hit
while the vehicles are still approaching; it cannot shield the racer via the
per-pair contact latch. Each pair receives at most one hard frontal impact.
Player and rivals use the same cap and speed conversion.

The racing AI prefers the two right lanes and can select a clear opposing lane
for a pass. Its lookahead scores predicted opposing traffic before committing.
Far-away opposing cars are rejected by longitudinal bounds before doing the
more expensive contact calculation.

`paradise-traffic` now drives a whole lap in each right lane, checks traffic on
every island and bridge, measures clear oncoming visibility, tests frontal and
grazing impacts for player and AI, demonstrates passing two abreast and
returning, and checks the start grid, restart and other-level isolation. The
`paradise` suite also checks full-race results, Jumbo timing, landmark views,
road seams and immutable art caching. New evidence files begin with
`paradise-full` (older `paradise-traffic` files describe the harbour-only trial).

## Jumbo and rendering

The former side-on airplane was replaced with a cached, low-poly three-quarter
view. Fuselage sections, swept wings, four engines, raised forward cabin, windows,
tailplane and landing gear share a perspective transform and depth ordering.
The lowest visible point anchors at the runway, and landing height clamps to
zero. The previous negative landing height caused the gear to sink below the
ground and be clipped. A small local shadow reinforces touchdown.

The event starts 205 segments before the crossing. The jet crosses left to right
and touches down while still visibly ahead of the driver. A progress floor keeps
late boosts from outrunning the sequence. Simulation time controls the landing,
so pausing freezes it and restarting resets it. This is a choreographed event,
not an aircraft physics simulation.

Static scenery, including the aircraft mesh, is rasterized once at race setup.
New large buildings use a reduced raster resolution. The scenery cache is about
12.64 MiB of logical RGBA pixels, under a 13 MiB budget; this excludes shared game
assets and browser/GPU overhead. Static tiles crop their source image at the ground/crest rather than installing
a separate canvas clipping mask for each tree and facade. There are no per-frame
texture writes. Small
vector animations move people, water, birds and the volleyball. Draw distance
stays bounded to 210 road segments. Other levels and the camera are unchanged.

The route and all Paradise code are inline in `index.html` for both plain
repository-root hosting and the Vite build. The first release's separate public
script was missing under repository-root hosting; selecting Paradise threw and
froze the render loop. Keep this level self-contained to prevent that regression.

## Validation

Build: `npm run build -- --base=/Dash-Racer/`.

- `scripts/assess-game.cjs paradise`: actual full lap and six-car race, route
  lengths, loop seam, finish/results, parapet contacts, normal and late-boost
  aircraft landing, visible touchdown, landmark approach bounds, asphalt seams,
  paused animation, cache immutability and other levels' lap counts. Screenshots
  supplement checks; bounding-box checks alone do not prove unoccluded scenery.
- `scripts/assessment-level-loading.cjs`: real UI/RAF starts, driving, pause and
  exit through all seven levels for both source-root and production hosting.
- `scripts/profile-paradise.cjs`: native RAF at 390×844 with 2× CPU throttling in
  forest, airport, town and bridge sections. Run without other browser tests.
  These are short cloud Chromium samples, not physical Brave/phone measurements.

Evidence: `docs/evidence/paradise-rework.json`, `paradise-rework-loading.json`
and `paradise-rework-profile.json`. Previous evidence files describe earlier
layouts and are retained for comparison.

Before the traffic trial, the 2×-throttled samples measured median frame intervals near 16.7 ms in
six sections and 33.3 ms in the harbour; 95th-percentile intervals were about
33.4 ms, with no sampled intervals over 50 ms. Render work at the 95th percentile
ranged from 8.5 to 12.9 ms. The richer scenes have a measurable cost; these
results do not establish steady 60 fps on phones. Both the initial and optimized
profiles are retained in the evidence file.

The full-course version's native-CPU Chromium sample kept median frame intervals
near 16.7 ms and 95th-percentile intervals at 16.7–16.8 ms in all seven sampled
sections, with no intervals over 50 ms. 95th-percentile render work ranged from
2.8 to 8.5 ms. See `paradise-full-profile.json`; this is still a short cloud
sample rather than a guarantee for phones.

The 60-km/h change is covered by `paradise-head-on.json`: normal/turbo/offset
frontal hits, unchanged grazing cost, equal player/rival damage, scrape-to-front
escalation, no accidental acceleration below the cap, cleared recovery state,
and a driven encounter followed by normal acceleration from 60 km/h. A complete
six-racer regression is in `paradise-head-on-race.json`; an additional live-UI
start/countdown/visible-tachometer check is in `paradise-head-on-ui.json`.
