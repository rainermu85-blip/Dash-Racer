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

Island sightlines are gentler so larger scenes can be seen on approach.
Architecture and pedestrians sit near the road in groups rather than being
scattered across open fields. Waterfall trees were moved out of the sightline;
the old bar that obscured the music stage was removed. Scene dimensions use the
road as their common scale. Human and equipment proportions stay distinct from
large vessels and the 747.

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
12 MiB of logical RGBA pixels, under a 13 MiB budget; this excludes shared game
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

The final 2×-throttled samples measured median frame intervals near 16.7 ms in
six sections and 33.3 ms in the harbour; 95th-percentile intervals were about
33.4 ms, with no sampled intervals over 50 ms. Render work at the 95th percentile
ranged from 8.5 to 12.9 ms. The richer scenes have a measurable cost; these
results do not establish steady 60 fps on phones. Both the initial and optimized
profiles are retained in the evidence file.
