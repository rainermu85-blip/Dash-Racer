// Check openings and near-plane stability using the actual canvas renderer.
module.exports = async function runPortals(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const checks = [];
    for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(viewport);
      checks.push(...await page.evaluate(() => {
        resize(); selectLevel(5); startRace(); state = 'playing'; opponents.length = 0;
        player.x = player.pitch = player.fovOffset = player.curveAheadSmooth = 0;
        player.isBoosting = player.isChevronBoosting = player.isSparking = false;
        player.hitFlash = 0; chapterTime = 4000;
        for (const s of segments) s.lightning = s.pylon = s.barrier = null;
        const results = [], record = (name, pass, actual) => results.push({ name: `${name}-${W}x${H}`, pass, actual });
        record('tundra-granite-pass-snowy-pines-sequence', getDreamWorld(0) === 'steppe' && !segments[449].isTunnel && segments[450].isTunnel && segments[749].isTunnel && !segments[750].isTunnel && getDreamZone(750) === 'arctic' && segments.slice(0,450).every(s => !s.sprite || ['rock','tundra_shrub'].includes(s.sprite)) && segments.slice(750,1250).some(s => s.sprite === 'tree'), { start: getDreamWorld(0), tunnelSegments: segments.filter(s => s.isTunnel).length, firstTunnel: DREAM_TUNNELS[0] });

        for (const kind of ['alpine','dali','sea']) {
          const marine = kind === 'sea', alpine = kind === 'alpine';
          const x = W / 2, y = H * 0.82, w = W / 13, h = H * 0.16;
          for (const exit of [false, true]) {
            ctx.fillStyle = '#ff00ff'; ctx.fillRect(0,0,W,H);
            drawDreamTunnelPortal(x,y,w,h,marine,exit,alpine);
            const pixel = (px,py) => [...ctx.getImageData(Math.round(px),Math.round(py),1,1).data].slice(0,3).join(',');
            const slots = [-0.95,-1/3,0,1/3,0.95].flatMap(lane => [0.1,0.5,0.8].map(height => pixel(x+lane*w,y-height*h)));
            const facade = [-2.4,2.4].map(lane => pixel(x+lane*w,y-h*0.5));
            facade.push(pixel(x,y-h*1.4));
            record(`${kind}-${exit ? 'exit' : 'entry'}-facade-keeps-road-open`, slots.every(p => p === '255,0,255') && facade.every(p => p !== '255,0,255'), { slots, facade });
          }
        }

        const original = paintDreamPolygon;
        let polygons = [];
        paintDreamPolygon = (points,...args) => { polygons.push(points); return original(points,...args); };
        try {
          const samples = [];
          for (const tunnel of DREAM_TUNNELS) for (const edge of [tunnel.start,tunnel.end]) for (const delta of [-0.00001,0,0.00001]) {
            player.z = (edge+delta)*SEGMENT_LENGTH; polygons = []; render(1000);
            const values = polygons.flatMap(p => p.flatMap(v => [v.x,v.y]));
            samples.push({ segment: edge+delta, finite: values.every(Number.isFinite), peak: values.reduce((m,v) => Math.max(m,Math.abs(v)),0) });
          }
          record('all-portal-crossings-have-bounded-projections', samples.every(s => s.finite && s.peak < 100000), samples);
          const approaching = [];
          for (const tunnel of DREAM_TUNNELS) {
            player.z = (tunnel.start-25)*SEGMENT_LENGTH; polygons = []; render(1000);
            approaching.push(polygons.length);
          }
          record('all-three-portals-draw-before-entry', approaching.every(n => n > 0), approaching);
        } finally { paintDreamPolygon = original; }

        const fingerprint = () => JSON.stringify({ x:player.x,z:player.z,speed:player.speed,bonus:player.cleanSpeedBonus,fov:player.fovOffset,boosts:player.boosts,limits:getRoadLimits(player.z),items:segments.filter(s => s.pylon || s.barrier || s.lightning).length });
        const snapshot = () => ctx.getImageData(0,0,W,H).data;
        const changed = (a,b) => { let n=0; for (let i=0;i<a.length;i+=4) if (a[i]!==b[i] || a[i+1]!==b[i+1] || a[i+2]!==b[i+2]) n++; return n; };
        for (const segment of [1322,2122]) {
          player.z=segment*SEGMENT_LENGTH; player.speed=4320; player.cleanSpeedBonus=0.2;
          const before=fingerprint(); chapterTime=1000; render(1000); const a=snapshot();
          render(1000); const b=snapshot(); chapterTime=9000; render(1000); const c=snapshot();
          record(`decoration-${segment}-stable-at-fixed-time`, changed(a,b)===0, { changedPixels:changed(a,b) });
          record(`decoration-${segment}-animates-without-mutating-driving`, changed(b,c)>0 && fingerprint()===before, { changedPixels:changed(b,c), drivingUnchanged:fingerprint()===before });
        }
        return results;
      }));
    }
    return checks.map(check => ({ ...check, errors, pass: check.pass && errors.length === 0 }));
  } finally { await page.close(); }
};
