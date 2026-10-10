// Observe the chapter in a real browser. Manual frames keep approach, pause
// and lane containment repeatable; full races remain in assess-game.cjs.
module.exports = async function runChapter(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 480, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const results = await page.evaluate(() => {
      const checks = [];
      const record = (name, pass, actual) => checks.push({ name, pass, actual });
      let ts = 1000;
      const reset = level => {
        selectLevel(level); startRace(); state = 'playing'; lastTime = ts; smoothedDt = 1 / 60;
        keys.left = keys.right = keys.boost = false;
        document.getElementById('cntNum').classList.remove('pop');
      };
      const tick = count => { for (let i = 0; i < count; i++) { ts += 1000 / 60; loop(ts); } };
      showMainMenu();
      const menu = document.getElementById('overlay');
      const menuCards = [...menu.querySelectorAll('.level-card')];
      record('chapter-menu-six-levels', menuCards.length === 6 && menu.innerText.includes('NEON AFTERGLOW') && menuCards.slice(0, 4).map(b => b.id).join(',') === 'lvl1Btn,lvl2Btn,lvl3Btn,lvl4Btn', menuCards.map(b => b.textContent.trim()));
      for (const id of [3, 4, 5, 6, 1, 2]) {
        document.getElementById(`lvl${id}Btn`).click();
        const selected = [...menu.querySelectorAll('[aria-pressed="true"]')].map(b => b.id);
        record(`chapter-select-${id}`, currentLevel === id && selected.length === 1 && selected[0] === `lvl${id}Btn`, { level: currentLevel, selected });
      }
      for (const level of [3, 4]) {
        reset(level);
        const final = segments.at(-1);
        const closure = final.worldY + final.hillDelta - segments[0].worldY;
        record(`chapter-${level}-closed-route`, segments.length === 1200 && Math.abs(closure) < 1e-6 && Math.abs(segments[0].curve) < 1e-9 && Math.abs(segments[0].hillDelta) < 1e-9 && segments.every(s => Number.isFinite(s.worldY) && Number.isFinite(s.curve)), { segments: segments.length, closure });
        player.lap = 3; player.z = TRACK_LENGTH - 1; player.speed = player.maxSpeed; tick(1);
        record(`chapter-${level}-three-lap-finish`, player.finished && player.lap === 4 && lapTimes[2] > 0, { finished: player.finished, lap: player.lap, z: player.z });
      }
      const walls = [];
      for (const direction of [-1, 1]) {
        reset(4); opponents.length = 0; player.z = 650 * SEGMENT_LENGTH;
        player.x = direction * 0.87; player.speed = player.maxSpeed;
        player.boosts = 1; keys.boost = true;
        keys[direction < 0 ? 'left' : 'right'] = true; tick(100);
        walls.push({ direction, x: player.x, feedback: player.hitFlash > 0 || player.isSparking });
      }
      record('highway-divider-contains-boosted-car', walls.every(s => Math.abs(s.x) <= 0.88 && s.feedback), walls);
      reset(4); opponents.length = 0;
      const trafficBefore = highwayTraffic.map(car => ({ ...car })); tick(60);
      const travelled = highwayTraffic.map((car, i) => (trafficBefore[i].z - car.z + TRACK_LENGTH) % TRACK_LENGTH);
      record('highway-oncoming-moves-in-separated-lanes', highwayTraffic.length === 22 && new Set(highwayTraffic.map(car => car.x)).size === 3 && highwayTraffic.every((car, i) => HIGHWAY_ONCOMING_LANES.includes(car.x) && car.z >= 0 && car.z < TRACK_LENGTH && travelled[i] > 1700 && travelled[i] < 2600), { positions: highwayTraffic.slice(0, 4), travelled: travelled.slice(0, 4) });
      const approaches = [];
      for (const boosted of [false, true]) {
        reset(4); opponents.length = 0;
        player.z = 475 * SEGMENT_LENGTH - (boosted ? 11000 : 8500); player.speed = player.maxSpeed;
        if (boosted) { player.boosts = 1; keys.boost = true; }
        let triggerFrames = 0;
        do { tick(1); triggerFrames++; } while (!crossingEvents.has('1:475') && triggerFrames < 120);
        const start = crossingTrainPhase(475);
        const distanceAtTrigger = 475 * SEGMENT_LENGTH - player.z;
        tick(80);
        const during = crossingTrainPhase(475);
        const eventCount = crossingEvents.size;
        tick(240);
        approaches.push({ boosted, start, during, end: crossingTrainPhase(475), eventCount, triggerFrames, distanceAtTrigger });
      }
      record('highway-train-fires-on-approach-and-leaves', approaches.every(s => s.start !== null && s.start < 0.02 && s.during > 0.7 && s.during < 1 && s.end > 1 && s.eventCount === 1 && s.triggerFrames < 60 && s.distanceAtTrigger > 4000), approaches);
      reset(4); player.z = 475 * SEGMENT_LENGTH - 7000; player.speed = player.maxSpeed;
      updateChapterTraffic(0); updateChapterTraffic(0.8);
      record('highway-train-traversal-twice-as-fast', Math.abs(crossingTrainPhase(475) - 0.5) < 1e-9, { phaseAfterPointEightSeconds: crossingTrainPhase(475) });
      reset(4); player.z = 475 * SEGMENT_LENGTH - 7000; player.speed = player.maxSpeed; tick(30);
      const beforePause = { traffic: highwayTraffic.map(car => car.z), phase: crossingTrainPhase(475), time: chapterTime };
      togglePause(); tick(120);
      const pausedState = { traffic: highwayTraffic.map(car => car.z), phase: crossingTrainPhase(475), time: chapterTime };
      togglePause(); tick(30);
      record('highway-traffic-and-train-pause', JSON.stringify(beforePause) === JSON.stringify(pausedState) && chapterTime > pausedState.time && crossingTrainPhase(475) > pausedState.phase, { before: beforePause.time, paused: pausedState.time, resumed: chapterTime });
      reset(4); player.lap = 2; player.z = 475 * SEGMENT_LENGTH - 7000; player.speed = player.maxSpeed; tick(1);
      record('highway-train-repeats-next-lap', crossingEvents.has('2:475') && crossingTrainPhase(475) !== null, { keys: [...crossingEvents.keys()] });
      reset(4); opponents.length = 0; player.speed = player.maxSpeed;
      const flybys = [];
      for (const lap of [1, 2, 3]) {
        player.lap = lap; player.z = HIGHWAY_POLICE_TRIGGER * SEGMENT_LENGTH;
        updateChapterTraffic(0);
        const initialZ = highwayPolice.z;
        updateChapterTraffic(1);
        const moved = initialZ - highwayPolice.z;
        const x = highwayPolice.x;
        updateChapterTraffic(2);
        const departed = highwayPolice === null;
        updateChapterTraffic(1);
        flybys.push({ lap, moved, x, departed, respawned: highwayPolice !== null });
      }
      record('highway-police-fast-separated-once-per-lap', flybys.every(s => s.moved === 7200 && s.x === HIGHWAY_ONCOMING_LANES[2] && s.departed && !s.respawned) && highwayPoliceLaps.size === 3, flybys);
      reset(4); opponents.length = 0; player.z = HIGHWAY_POLICE_TRIGGER * SEGMENT_LENGTH; player.speed = player.maxSpeed; tick(1);
      const policeBeforePause = { z: highwayPolice.z, time: chapterTime, laps: [...highwayPoliceLaps] };
      togglePause(); tick(120);
      const policeAfterPause = { z: highwayPolice.z, time: chapterTime, laps: [...highwayPoliceLaps] };
      togglePause(); tick(1);
      record('highway-police-pause-freezes-motion-and-lights', JSON.stringify(policeBeforePause) === JSON.stringify(policeAfterPause) && highwayPolice.z < policeAfterPause.z && chapterTime > policeAfterPause.time, { before: policeBeforePause, paused: policeAfterPause });
      const oncoming = drawOncomingCar;
      const renderedPolice = [];
      drawOncomingCar = (...args) => { if (args[4]) renderedPolice.push({ x: args[0], y: args[1], time: args[5] }); return oncoming(...args); };
      try {
        render(ts);
        const approaching = renderedPolice.length;
        highwayPolice.z = getRaceDistance(player) - 900;
        renderedPolice.length = 0; render(ts);
        record('highway-police-rendered-on-approach-without-wraparound', approaching === 1 && renderedPolice.length === 0, { approaching, departed: renderedPolice.length });
      } finally { drawOncomingCar = oncoming; }
      const policePixels = time => {
        ctx.fillStyle = '#171222'; ctx.fillRect(0, 0, W, H);
        drawOncomingCar(W / 2, H / 2, 1, '#e1e5f2', false, time);
        const plain = ctx.getImageData(0, 0, W, H).data;
        ctx.fillStyle = '#171222'; ctx.fillRect(0, 0, W, H);
        drawOncomingCar(W / 2, H / 2, 1, '#e1e5f2', true, time);
        const lit = ctx.getImageData(0, 0, W, H).data;
        let outside = 0, red = 0, blue = 0;
        for (let i = 0; i < lit.length; i += 4) {
          if (lit[i] === plain[i] && lit[i + 1] === plain[i + 1] && lit[i + 2] === plain[i + 2]) continue;
          const x = (i / 4) % W - W / 2, y = Math.floor(i / 4 / W) - H / 2;
          if (Math.abs(x) > 68 || y < -78 || y > 67) outside++;
          if (lit[i] > plain[i] + 10 && lit[i] > lit[i + 2] * 1.3) red++;
          if (lit[i + 2] > plain[i + 2] + 10 && lit[i + 2] > lit[i] * 1.3) blue++;
        }
        return { outside, red, blue };
      };
      const redPhase = policePixels(80), bluePhase = policePixels(255);
      record('highway-police-lights-local-red-and-blue', redPhase.outside === 0 && bluePhase.outside === 0 && redPhase.red > bluePhase.red && bluePhase.blue > redPhase.blue, { redPhase, bluePhase });
      startRace();
      record('highway-restart-clears-police-laps', highwayPolice === null && highwayPoliceLaps.size === 0, { active: highwayPolice !== null, laps: highwayPoliceLaps.size });
      reset(3);
      record('hills-traffic-reset', highwayTraffic.length === 0 && crossingEvents.size === 0 && highwayPolice === null && highwayPoliceLaps.size === 0 && chapterTime === 0 && getRoadLimits(0).left === 1.45, { traffic: highwayTraffic.length, events: crossingEvents.size, limits: getRoadLimits(0) });
      for (const level of [5, 6]) {
        reset(level);
        record(`preserved-world-${level}`, level === 5 ? segments.length === 3075 && getDreamZone(1750) === 'dali' && getDreamWorld(SEGMENT_COUNT + 40) === 'underwater' : segments.length === 1350 && segments.some(s => s.pylon?.active) && getComputedStyle(document.getElementById('energyBoard')).display !== 'none', { count: segments.length, energy: getComputedStyle(document.getElementById('energyBoard')).display });
      }
      reset(3); showResult(1);
      record('result-has-six-level-cards', document.getElementById('overlay').querySelectorAll('.level-card').length === 6, { count: document.getElementById('overlay').querySelectorAll('.level-card').length });
      exitRace();
      record('exit-rebuilds-chapter-menu', state === 'intro' && Boolean(document.getElementById('startBtn')) && !document.getElementById('rb') && document.getElementById('overlay').querySelectorAll('.level-card').length === 6, { state, start: Boolean(document.getElementById('startBtn')) });
      return checks;
    });
    return results.map(result => ({ ...result, errors, pass: result.pass && errors.length === 0 }));
  } finally { await page.close(); }
};
