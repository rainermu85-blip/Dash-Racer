// Observe actual cable drawing through the camera plane. Temporarily hiding the
// other mast isolates the stays belonging to a tower the player just passed.
module.exports = async function runBridge(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 480, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const checks = await page.evaluate(() => {
      selectLevel(1); startRace(); state = 'playing'; opponents.length = 0;
      const results = [], record = (name, pass, actual) => results.push({ name, pass, actual });
      const strokes = [], path = [];
      const original = { begin: ctx.beginPath, move: ctx.moveTo, line: ctx.lineTo, stroke: ctx.stroke };
      ctx.beginPath = function () { path.length = 0; return original.begin.call(this); };
      ctx.moveTo = function (x, y) { path.push([x, y]); return original.move.call(this, x, y); };
      ctx.lineTo = function (x, y) { path.push([x, y]); return original.line.call(this, x, y); };
      ctx.stroke = function () {
        if (this.strokeStyle === 'rgba(33, 212, 253, 0.8)') strokes.push({ points: path.map(p => [...p]), width: this.lineWidth });
        return original.stroke.call(this);
      };
      const view = segment => {
        strokes.length = 0; player.z = segment * SEGMENT_LENGTH; render(5000);
        return strokes.map(s => ({ ...s, points: s.points.map(p => [...p]) }));
      };
      try {
        for (const [mast, other] of [[950, 1030], [1030, 950]]) {
          segments[other].isPillar = false;
          const before = view(mast - 1), after = view(mast + 1), departed = view(mast + 29);
          record(`stays-survive-camera-passing-mast-${mast}`, before.length > 0 && after.length > 0 && departed.length === 0,
            { before: before.length, after: after.length, departed: departed.length });
          segments[other].isPillar = true;
        }
        const geometry = [];
        for (let n = 890; n <= 1070; n++) geometry.push(...view(n));
        const coordinates = geometry.flatMap(s => s.points.flat());
        const peak = Math.max(...coordinates.map(Math.abs));
        record('bridge-near-plane-projections-remain-bounded', geometry.length > 0 && coordinates.every(Number.isFinite) && peak < 100000,
          { frames: 181, cableStrokes: geometry.length, peakCoordinate: peak });
        const far = view(850), near = view(925);
        const widest = data => Math.max(...data.map(s => s.width));
        record('cables-thin-with-distance', far.length > 0 && near.length > 0 && widest(far) < widest(near),
          { farWidth: widest(far), nearWidth: widest(near) });
      } finally {
        ctx.beginPath = original.begin; ctx.moveTo = original.move; ctx.lineTo = original.line; ctx.stroke = original.stroke;
      }
      return results;
    });
    return checks.map(check => ({ ...check, errors, pass: check.pass && errors.length === 0 }));
  } finally { await page.close(); }
};
