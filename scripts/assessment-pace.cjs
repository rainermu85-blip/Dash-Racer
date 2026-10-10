// Gameplay regressions for earned speed. Empty, flat tracks isolate timing and
// contacts; the normal physics loop still handles acceleration and boost decay.
module.exports = async function runPace(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 480, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const checks = await page.evaluate(() => {
      const results = [], record = (name, pass, actual) => results.push({ name, pass, actual });
      let ts = 1000, fps = 60;
      const originalRender = render;
      // These checks exercise physics; rendered scenery is inspected separately.
      render = () => {};
      const reset = (level = 1, rate = 60) => {
        selectLevel(level); startRace(); state = 'playing'; opponents.length = 0;
        keys.left = keys.right = keys.boost = false;
        fps = rate; lastTime = ts; smoothedDt = 1 / fps;
        player.accel = 900; player.z = 300 * SEGMENT_LENGTH;
        for (const s of segments) {
          s.curve = s.hillDelta = s.worldY = 0;
          s.lightning = s.pylon = s.barrier = null;
        }
      };
      const tick = seconds => {
        for (let i = 0; i < Math.round(seconds * fps); i++) { ts += 1000 / fps; loop(ts); }
      };
      const earn = () => { player.speed = 3600; tick(10); };
      const opponentContact = (lateralClosing, speed) => {
        player.x = 0.01;
        const z = getRaceDistance(player) + getPlayerContactDistance();
        opponents.push({
          x: 0.245, z, speed, lap: player.lap, contactAxis: null,
          collisionCooldown: 0, contactSide: 0,
        });
        const dt = 1 / 120;
        checkOpponentCollision({ x: player.x - lateralClosing * dt, z }, [{ x: 0.245, z }], dt);
      };
      try {
        for (const rate of [30, 60, 120]) {
          reset(1, rate); tick(3);
          record(`initial-acceleration-unchanged-${rate}fps`, player.speed >= 3590 && player.speed <= 3601, { speed: player.speed });
          reset(1, rate); player.speed = 3600; tick(5);
          const halfway = player.speed; tick(5); const full = player.speed; tick(2);
          record(`ten-seconds-to-402-kmh-${rate}fps`, Math.abs(halfway - 3960) < 1 && Math.abs(full - 4320) < 1 && Math.abs(player.speed - 4320) < 1,
            { halfway, full, held: player.speed });
        }
        reset(); earn();
        const full = player.cleanSpeedBonus;
        opponentContact(0.12, player.speed);
        record('gentle-sideswipe-retains-part-of-bonus', player.cleanSpeedBonus > 0 && player.cleanSpeedBonus < full && player.speed > 3600 && player.speed < 4320,
          { speed: player.speed, bonus: player.cleanSpeedBonus });
        reset(); earn(); opponentContact(1.5, player.speed);
        record('substantial-contact-caps-at-335', player.cleanSpeedBonus === 0 && player.speed <= 3600 && player.speed > 0,
          { speed: player.speed, bonus: player.cleanSpeedBonus });
        reset(); earn(); player.speed = 1800; opponentContact(1.5, 1800);
        record('contact-never-raises-a-slower-speed', player.speed <= 1800 && player.cleanSpeedBonus === 0, { speed: player.speed });
        reset(); earn(); player.x = 1.46; applyRoadContact(0, 0.12);
        record('gentle-wall-touch-retains-bonus', player.cleanSpeedBonus > 0 && player.cleanSpeedBonus < full && player.speed > 3600,
          { speed: player.speed, bonus: player.cleanSpeedBonus });
        reset(); earn(); player.x = 1.46; applyRoadContact(0, 2);
        record('strong-wall-contact-resets-bonus', player.cleanSpeedBonus === 0 && player.speed <= 3600, { speed: player.speed });
        reset(); earn(); const barrier = { state: 'idle', timer: 0 };
        hitBarrier(player, barrier);
        record('hard-barrier-still-slows-below-baseline', player.speed < 1800 && player.cleanSpeedBonus === 0 && barrier.state === 'blinking', { speed: player.speed });
        for (const [level, multiplier, chevron] of [[1, 1.65, false], [6, 2.31, true]]) {
          reset(level); earn();
          if (chevron) { player.isChevronBoosting = true; player.chevronBoostTimer = 2; }
          else { player.boosts = 1; keys.boost = true; }
          tick(1);
          record(chevron ? 'chevron-top-speed-unchanged' : 'turbo-top-speed-unchanged',
            Math.abs(player.speed - 3600 * multiplier) < 1 && Math.abs(player.cleanSpeedBonus - full) < 1e-9,
            { speed: player.speed, bonus: player.cleanSpeedBonus });
          tick(0.3);
          if (!chevron) {
            const duringDecay = player.speed; tick(0.8);
            record('turbo-returns-smoothly-to-earned-speed', duringDecay > 4320 && duringDecay < 5940 && Math.abs(player.speed - 4320) < 1,
              { duringDecay, settled: player.speed });
          }
        }
        reset(); player.speed = 3600; tick(5);
        const bonus = player.cleanSpeedBonus;
        player.boosts = 1; keys.boost = true; tick(1);
        record('turbo-does-not-build-clean-driving-bonus', player.cleanSpeedBonus === bonus, { bonus, after: player.cleanSpeedBonus });
        reset(); earn(); player.speed = 900; player.x = 1.0; tick(3.1);
        record('prolonged-offroad-loses-bonus', player.cleanSpeedBonus === 0 && player.speed < 3600, { speed: player.speed, bonus: player.cleanSpeedBonus });
        for (const level of [1, 6]) {
          reset(level); earn();
          const bonus = player.cleanSpeedBonus;
          const index = Math.floor((player.z + getPlayerContactDistance()) / SEGMENT_LENGTH);
          segments[index].pylon = { active: true, x: 0 };
          tick(1 / 60);
          record(`pylon-keeps-earned-bonus-level-${level}`, !segments[index].pylon.active && Math.abs(player.cleanSpeedBonus - bonus) < 1e-9 && player.speed > 3600,
            { speed: player.speed, bonus: player.cleanSpeedBonus });
        }
        reset(); player.speed = 3600; tick(5);
        const before = { bonus: player.cleanSpeedBonus, speed: player.speed, z: player.z };
        togglePause(); tick(2);
        record('pause-freezes-earned-speed', JSON.stringify(before) === JSON.stringify({ bonus: player.cleanSpeedBonus, speed: player.speed, z: player.z }), before);
        togglePause(); startRace();
        record('restart-clears-earned-speed', player.cleanSpeedBonus === 0 && player.speed === 0, { bonus: player.cleanSpeedBonus, speed: player.speed });
      } finally { render = originalRender; }
      return results;
    });
    return checks.map(check => ({ ...check, errors, pass: check.pass && errors.length === 0 }));
  } finally { await page.close(); }
};
