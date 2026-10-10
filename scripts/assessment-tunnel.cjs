// Exercise the new tunnel through the actual canvas and normal physics loop.
module.exports = async function runTunnel(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 480, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const checks = await page.evaluate(() => {
      const results = [], record = (name, pass, actual) => results.push({ name, pass, actual });
      let ts = 1000;
      const reset = level => {
        selectLevel(level); startRace(); state = 'playing'; opponents.length = 0;
        keys.left = keys.right = keys.boost = false; lastTime = ts; smoothedDt = 1 / 60;
        player.x = player.pitch = player.fovOffset = player.curveAheadSmooth = 0;
      };
      reset(4);
      const tunnel = segments.filter(s => s.isTunnel);
      record('highway-tunnel-in-middle-eight-seconds-at-cruising-speed', tunnel.length === 230 && tunnel[0].index === 490 && tunnel.at(-1).index === 719 && Math.abs(tunnel.length * SEGMENT_LENGTH / 4320 - 8) < 0.05, { count: tunnel.length, start: tunnel[0].index, end: tunnel.at(-1).index, seconds: tunnel.length * SEGMENT_LENGTH / 4320 });
      record('highway-street-scenery-excluded-from-tunnel', tunnel.every(s => !s.sprite) && segments.some(s => !s.isTunnel && s.sprite === 'fantasy_sign'), { tunnelScenery: tunnel.filter(s => s.sprite).length });

      const polygon = paintHighwayPolygon;
      let polygons = [];
      paintHighwayPolygon = (points, color, ...args) => { polygons.push({ points, color }); return polygon(points, color, ...args); };
      try {
        const fixture = index => {
          polygons = [];
          drawHighwayTunnelSegment(240, 600, 100, 242, 580, 90, 100 / (ROAD_WIDTH * W / 2), 90 / (ROAD_WIDTH * W / 2), index);
          return polygons;
        };
        const litSlice = fixture(492);
        const ceiling = litSlice.find(p => p.color === '#0c0c0d');
        const lights = litSlice.filter(p => p.color === '#fff0ad');
        const lampCenters = lights.map(p => (p.points[0].x + p.points[1].x) / 2);
        record('one-ceiling-covers-all-six-lanes', ceiling.points[0].x < 240 - 3.55 * 100 && ceiling.points[1].x > 240 + 100 && lights.length === 6 && lampCenters.filter(x => x < 240 - 1.45 * 100).length === 3 && lampCenters.filter(x => x > 240 - 100).length === 3, { ceiling: ceiling.points, lampCenters });
        const columnSlice = fixture(496);
        const columns = columnSlice.filter(p => p.color === '#d1ad68' || p.color === '#e0c084');
        record('massive-columns-only-on-divider', columns.length === 2 && columns.every(p => p.points.every(v => v.x >= 240 - 1.45 * 100 && v.x <= 240 - 1.06 * 100)) && columns[0].points[2].x - columns[0].points[0].x >= 30, columns);
        const gaps = [499, 505, 511].map(i => fixture(i).some(p => p.color === '#d1ad68'));
        record('column-gaps-preserve-view-of-oncoming-cars', gaps.every(present => !present), gaps);

        const frames = [];
        for (const z of [489.99999, 490, 490.00001, 550.3, 650.2, 719.99999, 720, 720.00001]) {
          player.z = z * SEGMENT_LENGTH; polygons = []; render(ts);
          const coords = polygons.flatMap(p => p.points.flatMap(v => [v.x, v.y]));
          frames.push({ z, finite: coords.every(Number.isFinite), peak: coords.reduce((m, v) => Math.max(m, Math.abs(v)), 0), shells: polygons.filter(p => p.color === '#0c0c0d').length });
        }
        record('portal-and-shell-projections-finite-at-camera-crossing', frames.every(f => f.finite && f.peak < 100000), frames);
        player.z = 480 * SEGMENT_LENGTH; polygons = []; render(ts);
        record('tunnel-shell-visible-before-entering', polygons.some(p => p.color === '#0c0c0d'), { shellSlices: polygons.filter(p => p.color === '#0c0c0d').length });
      } finally { paintHighwayPolygon = polygon; }

      // The facade must leave the entire common opening transparent.
      ctx.fillStyle = '#ff00ff'; ctx.fillRect(0, 0, W, H);
      drawHighwayTunnelPortal(240, 650, 40, 60, false);
      const pixel = (x, y) => [...ctx.getImageData(x, y, 1, 1).data].slice(0, 3).join(',');
      const opening = [-3.2,-2.5,-1.8,-2/3,0,2/3].map(lane => pixel(Math.round(240 + lane * 40), 620));
      const flanks = [pixel(40, 620), pixel(400, 620), pixel(240, 566)];
      record('urban-portal-leaves-six-lane-slot-open', opening.every(p => p === '255,0,255') && flanks.every(p => p !== '255,0,255'), { opening, flanks });

      reset(4);
      const limits = [489,490,600,719,720].map(index => getRoadLimits(index * SEGMENT_LENGTH));
      record('tunnel-keeps-highway-lane-boundaries', limits.every(l => l.left === 0.88 && l.right === 0.88), limits);
      player.z = HIGHWAY_TUNNEL.start * SEGMENT_LENGTH; player.speed = 4320; player.cleanSpeedBonus = 0.2;
      for (const s of segments) s.lightning = s.pylon = s.barrier = null;
      const started = player.z;
      for (let i = 0; i < 480; i++) {
        keys.left = player.x > 0.04; keys.right = player.x < -0.04;
        ts += 1000 / 60; loop(ts);
      }
      record('eight-second-through-drive-without-speed-penalty', player.z >= HIGHWAY_TUNNEL.end * SEGMENT_LENGTH && Math.abs(player.z - started - 4320 * 8) < 1 && player.speed === 4320 && player.cleanSpeedBonus === 0.2 && player.hitFlash === 0, { seconds: 8, segment: player.z / SEGMENT_LENGTH, speed: player.speed, bonus: player.cleanSpeedBonus, flash: player.hitFlash });
      for (const level of [1, 2, 3, 5, 6]) {
        reset(level);
        record(`highway-tunnel-does-not-leak-to-level-${level}`, !isHighwayTunnel(600) && (level === 5 || !segments.some(s => s.isTunnel)), { level, tunnelSegments: segments.filter(s => s.isTunnel).length });
      }
      return results;
    });
    return checks.map(check => ({ ...check, errors, pass: check.pass && errors.length === 0 }));
  } finally { await page.close(); }
};
