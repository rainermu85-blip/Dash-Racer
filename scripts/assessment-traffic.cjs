// Observe projected car anchors in a real canvas. These fixtures isolate
// rendering from AI, collisions and camera motion by moving both cars together.
module.exports = async function runTraffic(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 480, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const checks = await page.evaluate(() => {
      const results = [], record = (name, pass, actual) => results.push({ name, pass, actual });
      const originalDraw = drawCarSprite;
      let drawn = [];
      drawCarSprite = (...args) => {
        if (!args[4]) drawn.push({ x: args[0], y: args[1], scale: args[2] });
        return originalDraw(...args);
      };
      const reset = (level, flat) => {
        selectLevel(level); startRace(); state = 'playing';
        keys.left = keys.right = keys.boost = false;
        player.x = player.pitch = player.fovOffset = player.curveAheadSmooth = 0;
        player.z = 300 * SEGMENT_LENGTH + 30; player.lap = 1;
        opponents.length = 0;
        if (flat) for (const s of segments) s.worldY = s.hillDelta = s.curve = 0;
        opponents.push({ x: 0.35, z: player.z + 900, lap: 1, color: '#44ddff', isBoosting: false, isChevronBoosting: false });
      };
      const frame = () => { drawn = []; render(1000); return drawn[0]; };
      try {
        for (const fps of [30, 60, 120]) for (const gap of [900, 1500, 3200]) {
          reset(4, true);
          const anchors = [];
          for (let i = 0; i < fps; i++) {
            player.z = 300 * SEGMENT_LENGTH + 30 + i * 3600 / fps;
            opponents[0].z = player.z + gap;
            anchors.push(frame());
          }
          const spread = field => Math.max(...anchors.map(a => a?.[field] ?? Infinity)) - Math.min(...anchors.map(a => a?.[field] ?? -Infinity));
          const actual = { frames: anchors.length, xSpread: spread('x'), ySpread: spread('y'), scaleSpread: spread('scale') };
          record(`constant-relative-distance-${gap}-${fps}fps`, anchors.every(Boolean) && actual.xSpread < 1e-7 && actual.ySpread < 1e-7 && actual.scaleSpread < 1e-7, actual);
        }
        for (const level of [1, 2, 3, 4, 5, 6]) {
          reset(level, false);
          const crossings = [];
          for (const boundary of [308, 315, 320]) {
            opponents[0].z = boundary * SEGMENT_LENGTH - 0.001; const before = frame();
            opponents[0].z = boundary * SEGMENT_LENGTH + 0.001; const after = frame();
            crossings.push(before && after ? { dx: Math.abs(after.x - before.x), dy: Math.abs(after.y - before.y), ds: Math.abs(after.scale - before.scale) } : null);
          }
          record(`opponent-segment-boundaries-level-${level}`, crossings.every(s => s && s.dx < 0.01 && s.dy < 0.01 && s.ds < 0.001), crossings);
        }
        reset(4, true); player.z = TRACK_LENGTH - 600; opponents[0].lap = 2; opponents[0].z = 300;
        const beforeLap = frame();
        player.z = 30; player.lap = 2; opponents[0].z = 930;
        const afterLap = frame();
        record('opponent-continuous-across-player-lap-seam', beforeLap && afterLap && Math.abs(beforeLap.y - afterLap.y) < 1e-7 && Math.abs(beforeLap.scale - afterLap.scale) < 1e-7, { beforeLap, afterLap });
        reset(4, true); opponents[0].z = player.z - 20;
        record('passed-opponent-not-projected-ahead', !frame(), { carsDrawn: drawn.length });
      } finally { drawCarSprite = originalDraw; }
      return results;
    });
    return checks.map(check => ({ ...check, errors, pass: check.pass && errors.length === 0 }));
  } finally { await page.close(); }
};
