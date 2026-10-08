// Collision regressions in a real browser. Flat, empty fixtures isolate the
// contacts; the normal game loop handles acceleration, AI and collision response.
module.exports = async function runCollisions(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 480, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const checks = await page.evaluate(() => {
      const results = [];
      const record = (name, pass, actual) => results.push({ name, pass, actual });
      let ts = 1000, fps = 60;
      const tick = (count = 1) => {
        for (let i = 0; i < count; i++) { ts += 1000 / fps; loop(ts); }
      };
      const random = Math.random;
      // No random boosts/lane changes during controlled contact fixtures.
      Math.random = () => 0.5;
      const setup = (level = 1, frameRate = 60) => {
        selectLevel(level); startRace(); state = 'playing';
        opponents.length = 0;
        fps = frameRate; lastTime = ts; smoothedDt = 1 / fps;
        keys.left = keys.right = keys.boost = false;
        for (const segment of segments) {
          segment.curve = segment.hillDelta = segment.worldY = 0;
          segment.lightning = segment.pylon = segment.barrier = null;
        }
        player.accel = 0; player.z = 300 * SEGMENT_LENGTH;
        player.speed = player.maxSpeed;
      };
      const addOpponent = ({ x = 0, relZ = 100, speed = 0, baseX = x } = {}) => {
        const z = player.z + getPlayerContactDistance() + relZ;
        const opponent = {
          x, baseX, targetX: baseX, z, speed, maxSpeed: speed, lap: player.lap,
          color: '#44ddff', oppIdx: 0, timeInLane: 0,
          isBoosting: false, boostTimer: 0, isChevronBoosting: false,
          chevronBoostTimer: 0, energyBallsCollected: 0, chevronDecisions: {},
          collisionCooldown: 0, contactAxis: null, contactSide: 0,
        };
        if (currentLevel !== 3 && opponent.z >= TRACK_LENGTH) {
          opponent.z -= TRACK_LENGTH; opponent.lap++;
        }
        opponents.push(opponent);
        return opponent;
      };
      try {
        for (const frameRate of [30, 60, 120]) {
          for (const type of ['lightning', 'pylon', 'barrier']) {
            setup(4, frameRate);
            player.isChevronBoosting = true; player.chevronBoostTimer = 10;
            player.fovOffset = -0.56; player.speed = player.maxSpeed * 2.31;
            player.z = 300 * SEGMENT_LENGTH - 10 - getPlayerContactDistance();
            const start = player.z;
            const object = { x: 0, active: true, state: 'idle', timer: 0, blinkCount: 0 };
            segments[300][type] = object;
            tick();
            const pass = type === 'lightning' ? !object.active && player.boosts === 1
              : type === 'pylon' ? !object.active && player.energyBallsCollected === 1
              : object.state === 'blinking' && player.collisionCooldown > 0 && !player.isChevronBoosting && player.speed >= 0 && player.speed < player.maxSpeed;
            record(`${type}-at-chevron-speed-${frameRate}fps`, pass, {
              active: object.active, state: object.state, speed: player.speed,
              charges: player.boosts, energy: player.energyBallsCollected, travel: player.z - start,
            });
          }
        }

        const walls = [];
        for (const frameRate of [30, 60, 120]) {
          setup(3, frameRate); player.accel = 900;
          player.z = 2650 * SEGMENT_LENGTH; player.x = 0.8; keys.right = true;
          tick(frameRate);
          walls.push({ fps: frameRate, speed: player.speed, x: player.x });
        }
        const speeds = walls.map(sample => sample.speed);
        record('wall-friction-independent-of-frame-rate', walls.every(sample => sample.x === 0.8 && sample.speed > player.maxSpeed * 0.4 && sample.speed < player.maxSpeed * 0.7) && Math.max(...speeds) - Math.min(...speeds) < 1, walls);

        setup(3); player.z = 2650 * SEGMENT_LENGTH; player.x = 0.8; keys.right = true;
        tick(60); const rubbingSpeed = player.speed;
        keys.right = false; keys.left = true; tick(12);
        record('steering-away-releases-wall-drag', player.x < 0.75 && player.wallContactSide === 0 && Math.abs(player.speed - rubbingSpeed) < 1, { x: player.x, rubbingSpeed, releasedSpeed: player.speed });

        setup(); player.x = -0.31; keys.right = true;
        segments[300].lightning = { active: true, x: 0 };
        player.z += 30 - getPlayerContactDistance(); tick();
        record('lateral-pickup-entry', player.boosts === 1 && !segments[300].lightning.active, { x: player.x, charges: player.boosts });
        setup(); player.x = 0.31; keys.right = true;
        segments[300].lightning = { active: true, x: 0 };
        player.z += 30 - getPlayerContactDistance(); tick(4);
        record('near-miss-leaves-pickup', player.boosts === 0 && segments[300].lightning.active, { x: player.x, charges: player.boosts });

        const rears = [];
        for (const frameRate of [30, 60, 120]) {
          setup(1, frameRate); const opponent = addOpponent();
          tick(frameRate / 30);
          rears.push({ fps: frameRate, playerSpeed: player.speed, opponentSpeed: opponent.speed,
            gap: getRaceDistance(opponent) - getRaceDistance(player) - getPlayerContactDistance(), cooldown: player.collisionCooldown });
        }
        record('rear-end-transfers-speed-without-overlap', rears.every(sample => sample.playerSpeed > 1600 && sample.playerSpeed < 1900 && sample.opponentSpeed > 1600 && sample.gap >= 90 - 1e-6 && sample.cooldown > 0), rears);
        record('rear-end-similar-at-all-frame-rates', ['playerSpeed', 'opponentSpeed', 'gap'].every(field => Math.max(...rears.map(sample => sample[field])) - Math.min(...rears.map(sample => sample[field])) < 1), rears);

        setup(); const slowingFront = addOpponent(); tick();
        const impactCooldown = player.collisionCooldown;
        tick(6);
        record('protected-rear-contact-keeps-speeds-consistent', Math.abs(player.speed - slowingFront.speed) < 1 && player.speed > 0 && player.collisionCooldown < impactCooldown && player.collisionCooldown > 0, { speed: player.speed, opponentSpeed: slowingFront.speed, cooldown: player.collisionCooldown, impactCooldown });

        setup(); const gentle = addOpponent({ relZ: 91, speed: 3480 }); tick();
        const gentleLoss = player.maxSpeed - player.speed;
        record('gentle-rear-end-is-mild', gentleLoss > 0 && gentleLoss < 100 && gentle.speed > 3480, { loss: gentleLoss, opponentSpeed: gentle.speed });

        setup(); const side = addOpponent({ x: 0.25, relZ: 0, speed: player.speed });
        keys.right = true; tick();
        const sideLoss = player.maxSpeed - player.speed;
        record('sideswipe-is-milder-than-hard-rear-end', sideLoss > 0 && sideLoss < player.maxSpeed * 0.15 && side.x - player.x >= 0.24 - 1e-6 && side.contactAxis === 'x', { loss: sideLoss, gap: side.x - player.x, axis: side.contactAxis });
        const firstImpactSpeed = player.speed; tick(4);
        record('sustained-contact-does-not-repeat-impact', player.speed === firstImpactSpeed && player.collisionCooldown > 0, { firstImpactSpeed, speed: player.speed, cooldown: player.collisionCooldown });
        keys.right = false; keys.left = true; tick(24);
        // Align a fresh, equally fast opponent after separation to isolate
        // re-contact from the longitudinal gap created by the first sideswipe.
        side.speed = side.maxSpeed = player.speed;
        side.z = player.z + getPlayerContactDistance();
        const released = side.contactAxis === null && player.collisionCooldown === 0;
        keys.left = false; keys.right = true;
        for (let frame = 0; frame < 60 && player.speed === firstImpactSpeed; frame++) tick();
        record('separation-allows-a-new-impact', released && player.speed < firstImpactSpeed && side.contactAxis === 'x', { released, firstImpactSpeed, speed: player.speed, axis: side.contactAxis });

        setup(); player.steerLean = 1;
        const stationarySide = addOpponent({ x: 0.22, relZ: 0, speed: player.speed });
        stationarySide.baseX -= Math.sin(stationarySide.z * 0.0015 + stationarySide.color.charCodeAt(1)) * 0.15;
        tick();
        record('visual-lean-does-not-cause-impact', player.speed === player.maxSpeed && player.collisionCooldown === 0, { speed: player.speed, cooldown: player.collisionCooldown });

        setup(); player.speed = 1800;
        const fasterBehind = addOpponent({ relZ: -100, speed: 3600 }); tick(2);
        record('opponent-rear-end-pushes-player', player.speed > 2500 && fasterBehind.speed < 3000 && player.collisionCooldown > 0, { speed: player.speed, opponentSpeed: fasterBehind.speed });

        const pinned = [];
        for (const direction of [-1, 1]) {
          setup(3); player.z = 2820 * SEGMENT_LENGTH; player.x = direction * 0.799;
          const opponent = addOpponent({ x: direction * 0.5595, baseX: direction * 0.8, relZ: 0, speed: player.speed });
          tick();
          pinned.push({ direction, x: player.x, gap: Math.abs(player.x - opponent.x), cooldown: player.collisionCooldown });
        }
        record('opponent-push-respects-glass-and-separates-cars', pinned.every(sample => Math.abs(sample.x) <= 0.8 && sample.gap >= 0.24 - 1e-6 && sample.cooldown > 0), pinned);

        setup(); player.z = TRACK_LENGTH - 10 - getPlayerContactDistance();
        segments[0].lightning = { x: 0, active: true }; tick();
        record('pickup-across-lap-seam', player.boosts === 1 && !segments[0].lightning.active && player.lap === 1, { charges: player.boosts, lap: player.lap });

        setup(); player.z = TRACK_LENGTH - 40;
        const acrossSeam = addOpponent(); tick();
        record('opponent-contact-across-lap-seam', acrossSeam.lap === 2 && player.lap === 1 && player.collisionCooldown > 0 && player.z < TRACK_LENGTH, { playerLap: player.lap, opponentLap: acrossSeam.lap, speed: player.speed, z: player.z });

        setup(3); player.z = TRACK_LENGTH + 300 * SEGMENT_LENGTH - getPlayerContactDistance();
        segments[300].lightning = { x: 0, active: true }; player.finished = true;
        tick();
        record('point-to-point-runout-does-not-wrap-pickups', segments[300].lightning.active && player.boosts === 0, { active: segments[300].lightning.active, charges: player.boosts });

        setup(); player.lap = 3; player.z = TRACK_LENGTH - 40;
        addOpponent({ relZ: 91 }); tick();
        record('collision-at-line-does-not-award-premature-finish', !player.finished && player.lap === 3 && player.z < TRACK_LENGTH, { finished: player.finished, lap: player.lap, z: player.z });

        setup(); player.isBoosting = true; player.boostTimer = 5;
        player.fovOffset = -0.4; player.speed = player.maxSpeed * 1.65;
        addOpponent({ relZ: 91 }); tick();
        record('hard-rear-end-cancels-boost', !player.isBoosting && player.speed < player.maxSpeed && player.collisionCooldown > 0, { boosting: player.isBoosting, speed: player.speed });

        startRace();
        record('restart-clears-contact-state', player.wallContactSide === 0 && player.wallHitCooldown === 0 && player.collisionCooldown === 0 && opponents.every(opponent => opponent.contactAxis === null && opponent.collisionCooldown === 0), { wallContact: player.wallContactSide, wallCooldown: player.wallHitCooldown, cooldown: player.collisionCooldown });
      } finally {
        Math.random = random;
      }
      return results;
    });
    if (errors.length) checks.push({ name: 'collision-runtime-errors', pass: false, errors });
    return checks;
  } finally {
    await page.close();
  }
};
