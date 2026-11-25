// UI journeys use real browser input. Finish fixtures jump near the line;
// remaining opponents then finish using the unchanged racing physics.
module.exports = async function assessScoreboard(browser, baseUrl, output) {
  const fs = require('node:fs'), path = require('node:path'), results = [];
  async function run(name, test, options = {}) {
    if (process.env.ASSESSMENT_CASE && !name.includes(process.env.ASSESSMENT_CASE)) return;
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...options });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    try {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.locator('#introBox.show').waitFor();
      await page.locator('#introBox').tap();
      const actual = await test(page);
      results.push({ name, pass: actual.pass && !errors.length, actual, errors });
    } catch (e) {
      results.push({ name, pass: false, error: e.message, errors });
    } finally { await page.close(); }
    fs.writeFileSync(path.join(output, 'scoreboard-progress.json'), JSON.stringify(results, null, 2));
  }
  async function name(page, tag = 'A9X') {
    for (let i = 0; i < 3; i++) await page.locator('#driverChar' + i).fill(tag[i]);
    await page.locator('#saveDriverBtn').tap();
  }
  async function frame(page, filename) {
    await page.waitForTimeout(550); // Intro fades out over half a second.
    await page.screenshot({ path: path.join(output, filename + '.png') });
  }
  await run('first-run-name-validation-storage-options', async page => {
    const first = await page.evaluate(() => ({
      fields: document.querySelectorAll('.driver-char').length,
      underlined: [...document.querySelectorAll('.driver-char')].every(e => parseFloat(getComputedStyle(e).borderBottomWidth) >= 2),
      disabled: document.querySelector('#saveDriverBtn').disabled,
    }));
    await frame(page, 'driver-id-mobile');
    await page.locator('#driverChar0').fill('a');
    const advanced = await page.evaluate(() => document.activeElement.id === 'driverChar1');
    await page.locator('#driverChar1').fill('!');
    const rejected = await page.locator('#driverChar1').inputValue() === '' && await page.locator('#saveDriverBtn').isDisabled();
    await page.locator('#driverChar1').fill('7');
    await page.locator('#driverChar2').fill('z');
    await page.locator('#driverChar2').press('Enter');
    const saved = await page.evaluate(() => localStorage.getItem('turboDash.playerTag'));
    await page.reload();
    await page.locator('#introBox.show').waitFor();
    await page.locator('#introBox').tap();
    const returning = await page.locator('#startBtn').count() === 1 && await page.locator('#driverForm').count() === 0;
    await page.locator('#optionsBtn').tap();
    await page.locator('#driverChar0').evaluate(e => {
      const clipboardData = new DataTransfer(); clipboardData.setData('text', '!b?2-d99');
      e.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
    });
    const pasted = await page.locator('.driver-char').evaluateAll(es => es.map(e => e.value).join(''));
    await page.locator('#driverChar2').fill('');
    await page.locator('#driverChar2').press('Backspace');
    const backspace = await page.evaluate(() => document.activeElement.id === 'driverChar1' && document.getElementById('driverChar1').value === '');
    await name(page, 'ICE');
    await page.locator('#optionsBtn').tap();
    await page.locator('#driverChar0').fill('Z');
    await page.locator('#driverBackBtn').tap();
    const canceled = await page.evaluate(() => driverTag === 'ICE' && localStorage.getItem('turboDash.playerTag') === 'ICE');
    await frame(page, 'level-menu-mobile');
    return { pass: first.fields === 3 && first.underlined && first.disabled && advanced && rejected && saved === 'A7Z' && returning && pasted === 'B2D' && backspace && canceled, first, advanced, rejected, saved, returning, pasted, backspace, canceled };
  });
  await run('pause-options-freeze-race-and-keyboard-isolation', async page => {
    await name(page);
    await page.locator('#startBtn').tap();
    await page.waitForTimeout(400);
    const countdown = await page.evaluate(() => state === 'countdown' && raceElapsed === 0);
    await page.waitForFunction(() => state === 'playing');
    await page.keyboard.press('Escape');
    const before = await page.evaluate(() => ({ time: raceElapsed, z: player.z, x: player.x }));
    await page.locator('#pauseOptionsBtn').tap();
    const empty = await page.evaluate(() => !document.getElementById('driverForm') && !document.querySelector('#overlay input, #overlay select, #overlay textarea') && document.querySelectorAll('#overlay button').length === 1);
    await frame(page, 'pause-options-empty');
    await page.keyboard.press('w');
    await page.keyboard.press('a');
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(250);
    const after = await page.evaluate(() => ({ time: raceElapsed, z: player.z, x: player.x, paused, keys: { ...keys } }));
    await page.locator('#pauseOptionsBackBtn').tap();
    const returned = await page.evaluate(() => paused && !document.getElementById('pauseOverlay').classList.contains('hide') && driverTag === 'A9X' && player.driverTag === 'A9X' && localStorage.getItem('turboDash.playerTag') === 'A9X');
    await page.locator('#pauseOptionsBtn').tap();
    await page.keyboard.press('Escape');
    const escaped = await page.evaluate(() => paused && !driverNameContext && !document.getElementById('pauseOverlay').classList.contains('hide'));
    await page.locator('#resumeBtn').tap();
    await page.waitForTimeout(100);
    const resumed = await page.evaluate(t => !paused && raceElapsed > t, before.time);
    return { pass: countdown && empty && JSON.stringify(before) === JSON.stringify({ time: after.time, z: after.z, x: after.x }) && after.paused && !Object.values(after.keys).some(Boolean) && returned && escaped && resumed, countdown, empty, before, after, returned, escaped, resumed };
  });
  for (const level of [1, 2, 3, 4, 5, 6]) await run(`classification-all-drivers-level-${level}`, async page => {
    await name(page, 'ICE');
    await page.locator('#lvl' + level + 'Btn').tap();
    await page.locator('#startBtn').tap();
    await page.waitForFunction(() => state === 'playing');
    await page.evaluate(() => {
      // Coherent penultimate-lap times; crossing interpolation must add up.
      raceElapsed = 120000; playerLapStart = currentLevel === LEVEL_DREAM ? 0 : 80000;
      lapTimes = currentLevel === LEVEL_DREAM ? [0, 0, 0] : [40000, 40000, 0];
      bestLapTime = currentLevel === LEVEL_DREAM ? Infinity : 40000;
      player.lap = currentLevel === LEVEL_DREAM ? 1 : 3;
      player.z = TRACK_LENGTH - 1; player.x = 0; player.speed = player.maxSpeed;
      resetNormalPace(player);
      opponents.forEach((o, i) => {
        o.lap = currentLevel === LEVEL_DREAM ? 1 : 3;
        o.x = o.targetX = i % 2 ? -.5 : .5;
        if (i < 2) { o.z = TRACK_LENGTH + 1000 + i * 100; o.finishTime = 119000 + i * 200; }
        else { o.z = TRACK_LENGTH - (i - 1) * 2000; o.finishTime = null; }
      });
    });
    await page.locator('#continueBtn').waitFor({ timeout: 15000 });
    const actual = await page.evaluate(() => {
      const cars = getRaceStandings(), times = cars.map(c => c.finishTime);
      const rows = [...document.querySelectorAll('.results-table tbody tr')];
      const order = cars.map(c => c.driverTag).join(',');
      cars.forEach((c, i) => c.z = i * 100000); // Coasting cannot reorder a finished field.
      const stable = getRaceStandings().map(c => c.driverTag).join(',') === order;
      return { times, sorted: times.every((t, i) => !i || t >= times[i - 1]), stable,
        names: cars.map(c => c.driverTag), rows: rows.length,
        displayed: rows.map(r => r.querySelector('.result-time').textContent.trim()),
        exact: rows.every((r, i) => Number(r.dataset.finishMs) === times[i] && r.querySelector('.result-time').textContent.trim() === formatRaceTime(times[i])),
        own: document.querySelector('.is-player .result-driver').textContent,
        cups: [...document.querySelectorAll('.trophy-icon')].map(e => e.getAttribute('aria-label')),
        total: player.finishTime, sum: lapTimes.reduce((a, b) => a + b, 0), level: currentLevel,
        overflow: document.querySelector('.result-panel').scrollWidth > document.querySelector('.result-panel').clientWidth,
      };
    });
    await frame(page, 'results-level-' + level);
    await page.locator('#continueBtn').tap();
    const menu = await page.evaluate(() => state === 'intro' && !!document.getElementById('startBtn') && !document.querySelector('.results-table') && document.getElementById('lvl' + currentLevel + 'Btn').classList.contains('selected'));
    await page.locator('#startBtn').tap();
    const reset = await page.evaluate(() => state === 'countdown' && raceElapsed === 0 && player.finishTime == null && opponents.every(o => o.finishTime == null) && lapTimes.every(t => t === 0));
    return { pass: actual.rows === 6 && actual.times.every(Number.isFinite) && actual.sorted && actual.stable && actual.exact && actual.own === 'ICE' && new Set(actual.names).size === 6 && actual.cups.join(',') === 'Gold trophy,Silver trophy,Bronze trophy' && Math.abs(actual.total - actual.sum) < .001 && !actual.overflow && menu && reset, ...actual, menu, reset };
  });
  for (const viewport of [{ width: 320, height: 640 }, { width: 480, height: 360 }]) await run(`responsive-${viewport.width}x${viewport.height}`, async page => {
    await frame(page, 'driver-id-' + viewport.width + 'x' + viewport.height);
    await name(page);
    await page.evaluate(() => {
      startRace(); state = 'result'; raceElapsed = 135678; bestLapTime = 44000;
      [player, ...opponents].forEach((c, i) => c.finishTime = 135678 + i * 321);
      renderScoreboard();
    });
    await frame(page, 'results-' + viewport.width + 'x' + viewport.height);
    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.querySelector('.result-panel').scrollWidth <= document.querySelector('.result-panel').clientWidth && document.querySelector('.result-panel').getBoundingClientRect().top >= -1);
    let touchScroll = true;
    if (viewport.height < 500) {
      const input = await page.context().newCDPSession(page);
      await input.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 300, y: 300 }] });
      for (let y = 280; y >= 60; y -= 20) {
        await input.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 300, y }] });
        await page.waitForTimeout(20);
      }
      await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(200);
      touchScroll = await page.evaluate(() => document.getElementById('overlay').scrollTop > 50);
    }
    await page.locator('#continueBtn').tap(); // Must scroll into view on short screens.
    const continued = await page.locator('#startBtn').count() === 1;
    return { pass: noOverflow && touchScroll && continued, noOverflow, touchScroll, continued };
  }, { viewport });
  await run('finish-timer-exit-cannot-reopen-results', async page => {
    await name(page); await page.locator('#startBtn').tap();
    await page.waitForFunction(() => state === 'playing');
    await page.evaluate(() => { player.lap = 3; player.z = TRACK_LENGTH - 1; player.speed = player.maxSpeed; });
    await page.waitForFunction(() => player.finished);
    await page.keyboard.press('Escape');
    await page.locator('#exitRaceBtn').tap();
    await page.waitForTimeout(1700);
    const stable = await page.evaluate(() => state === 'intro' && !!document.getElementById('startBtn') && !document.querySelector('.result-panel'));
    await page.evaluate(() => {
      startRace(); state = 'playing'; player.lap = 3; player.z = TRACK_LENGTH - 1; player.speed = player.maxSpeed;
      advanceRaceStep(1 / 120); clearTimeout(resultTimer); showResult(); exitRace();
    });
    await page.waitForTimeout(200);
    const completionCanceled = await page.evaluate(() => state === 'intro' && !!document.getElementById('startBtn') && !document.querySelector('.result-panel'));
    return { pass: stable && completionCanceled, stable, completionCanceled };
  });
  await run('same-step-finish-order-is-independent-of-array-order', async page => {
    await name(page);
    const actual = await page.evaluate(() => {
      startRace(); state = 'playing'; paused = true;
      raceElapsed = 100000; playerLapStart = 80000; lapTimes = [40000, 40000, 0];
      for (const s of segments) { s.curve = 0; s.pylon = s.barrier = s.lightning = null; }
      player.lap = 3; player.z = TRACK_LENGTH - 15; player.x = 0;
      player.speed = player.maxSpeed; resetNormalPace(player);
      opponents.forEach((o, i) => {
        o.lap = 3; o.z = TRACK_LENGTH - (5 - i);
        o.x = o.targetX = (i - 2) * (getCarCollisionRange(opponents[0], opponents[1]) + .01);
        o.speed = o.maxSpeed; resetNormalPace(o);
      });
      advanceRaceStep(1 / 120);
      clearTimeout(resultTimer);
      const field = getRaceStandings();
      return { order: field.map(c => c === player ? 'player' : c.oppIdx),
        times: field.map(c => c.finishTime),
        allCrossed: field.every(c => c.finishTime > 100000 && c.finishTime < 100000 + 1000 / 120),
        sumMatches: Math.abs(player.finishTime - lapTimes.reduce((a, b) => a + b, 0)) < .001 };
    });
    return { pass: actual.order.join(',') === '4,3,2,1,0,player' && actual.allCrossed && actual.sumMatches && actual.times.every((t, i) => !i || t > actual.times[i - 1]), ...actual };
  });
  await run('highscores-scoring-contact-lead-and-clean-passes', async page => {
    await name(page);
    return page.evaluate(() => {
      startRace();
      // Collect real lightning contacts with two and then three charges.
      player.boosts = 2;
      for (const index of [50, 70]) {
        player.z = index * SEGMENT_LENGTH - getPlayerContactDistance() + 5;
        segments[index].lightning = { x: player.x, active: true };
        advanceRaceStep(MAX_PHYSICS_STEP);
      }
      const pickups = [raceScore.pickups, raceScore.overflow, player.boosts];
      // Four cars behind us, one close rival. No points for rocking side by side.
      const rival = opponents[0];
      opponents.forEach(o => { o.z = 0; });
      player.z = 20000;
      raceScore.leadMs = raceScore.passes = 0;
      raceScore.behind.fill(false);
      rival.z = player.z + 200;
      for (const delta of [-200, 200, -15, 15, -15, 15, -200, 200]) {
        const before = opponents.map(o => ({ z: o.z }));
        rival.z = player.z - delta;
        scoreRaceMovement(player.z, before, 0, 1);
      }
      const passes = raceScore.passes;
      raceScore.leadMs = 0;
      scoreRaceMovement(player.z, opponents.map(o => ({ z: o.z })), 0, 1);
      player.finishTime = 1250;
      scoreRaceMovement(player.z, opponents.map(o => ({ z: o.z })), 1000, 1);
      return { pass: pickups.join() === '1,1,3' && passes === 2 && raceScore.leadMs === 1250,
        pickups, passes, leadMs: raceScore.leadMs };
    });
  });
  await run('highscores-finish-all-courses-persist-top-five', async page => {
    await name(page, 'LAP');
    const courses = await page.evaluate(() => {
      const totals = [];
      for (const level of LEVELS) {
        selectLevel(level.id);
        startRace();
        const laps = raceLapCount();
        player.lap = laps;
        player.z = TRACK_LENGTH - 1 - (currentLevel === LEVEL_COAST ? getPlayerContactDistance() : 0);
        player.speed = player.maxSpeed;
        advanceRaceStep(MAX_PHYSICS_STEP);
        const first = raceScore.result;
        advanceRaceStep(MAX_PHYSICS_STEP);
        saveRaceScore(); // Completion and redraw must be idempotent.
        totals.push([level.id, first?.entry.tag, first?.placePoints, readCourseScores(level.id).length]);
        exitRace();
      }
      selectLevel(1);
      for (let i = 11; i <= 16; i++) {
        startRace();
        raceScore.pickups = i;
        player.finishTime = 10000 + i;
        saveRaceScore();
      }
      renderScoreboard();
      return totals;
    });
    const result = await page.locator('.score-total').innerText();
    await page.locator('#continueBtn').tap();
    await page.reload();
    await page.locator('#introBox.show').tap();
    await page.locator('#scoresBtn').tap();
    const read = () => page.locator('.highscores li').allTextContents();
    const firstBoard = await read();
    await page.locator('#scoresBackBtn').tap();
    await page.locator('#lvl9Btn').tap();
    await page.locator('#scoresBtn').tap();
    const coast = await read();
    const pass = courses.length === 9 && courses.every(([,tag,finish,count]) => tag === 'LAP' && finish === 600 && count === 1)
      && result === '2200 PTS' && firstBoard.length === 5
      && firstBoard.every((row,i) => row.endsWith('LAP' + (2200 - 100*i) + ' PTS'))
      && coast.length === 1 && coast[0].includes('LAP');
    return { pass, courses, result, firstBoard, coast };
  });
  // localStorage can be unavailable in a private/embedded browser.
  await run('blocked-storage-still-allows-name-and-play', async page => {
    await page.evaluate(() => Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); });
    await name(page, 'R3D');
    await page.locator('#startBtn').tap();
    const playable = await page.evaluate(() => state === 'countdown' && driverTag === 'R3D' && new Set([player, ...opponents].map(c => c.driverTag)).size === 6);
    const sessionBoard = await page.evaluate(() => {
      player.finishTime = 12345;
      saveRaceScore();
      exitRace();
      return readCourseScores(currentLevel).map(e => [e.tag,e.points]);
    });
    return { pass: playable && sessionBoard.length === 1 && sessionBoard[0].join() === 'R3D,600', playable, sessionBoard };
  });
  return results;
};
