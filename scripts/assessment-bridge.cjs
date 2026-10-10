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
      let drawingRoad = null;
      const drawRoad = drawRoadSegment;
      drawRoadSegment = (...args) => { drawingRoad = args[12]; return drawRoad(...args); };
      const original = { begin: ctx.beginPath, move: ctx.moveTo, line: ctx.lineTo, stroke: ctx.stroke };
      ctx.beginPath = function () { path.length = 0; return original.begin.call(this); };
      ctx.moveTo = function (x, y) { path.push([x, y]); return original.move.call(this, x, y); };
      ctx.lineTo = function (x, y) { path.push([x, y]); return original.line.call(this, x, y); };
      ctx.stroke = function () {
        if (this.strokeStyle === 'rgba(33, 212, 253, 0.8)') strokes.push({ points: path.map(p => [...p]), width: this.lineWidth, road: drawingRoad });
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
        let count = 0, peak = 0, finite = true;
        for (let n = 890; n <= 1070; n++) {
          const geometry = view(n), coordinates = geometry.flatMap(s => s.points.flat());
          count += geometry.length; finite &&= coordinates.every(Number.isFinite);
          peak = coordinates.reduce((largest, value) => Math.max(largest, Math.abs(value)), peak);
        }
        record('bridge-near-plane-projections-remain-bounded', count > 0 && finite && peak < 100000,
          { frames: 181, cableStrokes: count, peakCoordinate: peak });
        const far = view(850), near = view(925);
        const widest = data => Math.max(...data.map(s => s.width));
        record('cables-thin-with-distance', far.length > 0 && near.length > 0 && widest(far) < widest(near),
          { farWidth: widest(far), nearWidth: widest(near) });
        const anchorErrors = [], projections = view(905);
        for (const [mast, anchor, road, pointIndex] of [[950, 958, 957, 1], [950, 942, 942, 0], [1030, 1048, 1047, 1], [1030, 1012, 1012, 0]]) {
          const segment = segments[road], scale = (CAMERA_DEPTH + player.fovOffset) / (anchor * SEGMENT_LENGTH - player.z);
          const center = pointIndex === 0 ? segment.proj_rx1 : segment.proj_rx2;
          const roadY = pointIndex === 0 ? segment.proj_y1 : segment.proj_y2;
          const roadW = pointIndex === 0 ? segment.proj_w1 : segment.proj_w2;
          for (const [side, index] of [[-1, pointIndex], [1, pointIndex + 2]]) {
            const x = center + side * roadW * 1.25, y = roadY - scale * BRIDGE_RAIL_HEIGHT * H / 2;
            const candidates = projections.filter(stroke => stroke.road === road && stroke.points[index]);
            anchorErrors.push(Math.min(...candidates.map(stroke => Math.hypot(stroke.points[index][0] - x, stroke.points[index][1] - y))));
          }
        }
        record('stays-attach-to-painted-rail-at-their-own-depth', anchorErrors.length === 8 && anchorErrors.every(error => error < 0.1), { errorsPixels: anchorErrors });
        const seamErrors = [];
        for (const boundary of [950, 958, 1030, 1048]) {
          const before = view(boundary - 0.00001), after = view(boundary + 0.00001);
          const visible = strokes => strokes.flatMap(s => s.points).filter(p => p[0] > 0 && p[0] < W && p[1] > 0 && p[1] < H);
          const a = visible(before), b = visible(after);
          seamErrors.push(...a.map(p => Math.min(...b.map(q => Math.hypot(p[0] - q[0], p[1] - q[1])))));
        }
        record('visible-cables-stay-continuous-at-segment-seams', seamErrors.length > 0 && seamErrors.every(error => error < 1),
          { points: seamErrors.length, worstJumpPixels: Math.max(...seamErrors) });
      } finally {
        ctx.beginPath = original.begin; ctx.moveTo = original.move; ctx.lineTo = original.line; ctx.stroke = original.stroke;
        drawRoadSegment = drawRoad;
      }
      return results;
    });
    return checks.map(check => ({ ...check, errors, pass: check.pass && errors.length === 0 }));
  } finally { await page.close(); }
};
