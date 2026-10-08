// Controlled fixtures: real browser/canvas, manual 60 Hz frames, deliberate setup.
module.exports = async function runMechanics(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 480, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const checks = await page.evaluate(() => {
      const results = [];
      let ts = 1000;
      const record = (name, pass, actual) => results.push({ name, pass, actual });
      const tick = (count = 1) => {
        for (let i = 0; i < count; i++) { ts += 1000 / 60; loop(ts); }
      };
      const reset = (level = 1) => {
        selectLevel(level);
        startRace();
        state = 'playing'; lastTime = ts; smoothedDt = 1 / 60;
        keys.left = keys.right = keys.boost = false;
      };
      const contactDistance = () => {
        const scale = 1.64 * clamp(W / 1000, 0.85, 1);
        const horizon = ~~(H * 0.5) + player.pitch * 1.5;
        return (CAMERA_DEPTH + player.fovOffset) * CAMERA_HEIGHT * H / (2 * Math.max(100, H - 76 - 12 * scale - horizon));
      };
      const atItem = name => {
        const segment = segments.find(s => s[name]?.active);
        player.z = segment.index * SEGMENT_LENGTH + 30 - contactDistance();
        player.x = segment[name].x;
        player.speed = 0;
        return segment;
      };

      reset(); tick(60);
      record('auto-acceleration', player.speed > 0 && player.z > 0, { speed: player.speed, z: player.z });
      reset(); keys.boost = true; tick();
      record('no-charge-no-boost', !player.isBoosting && player.boosts === 0, { boosting: player.isBoosting, charges: player.boosts });
      reset(); let lightning = atItem('lightning'); tick();
      record('lightning-pickup', player.boosts === 1 && !lightning.lightning.active, { charges: player.boosts, active: lightning.lightning.active });
      player.z = 0; player.x = 0; keys.boost = true; tick();
      record('boost-consumes-charge', player.isBoosting && player.boosts === 0, { boosting: player.isBoosting, charges: player.boosts });
      tick(75);
      record('boost-expires', !player.isBoosting, { boosting: player.isBoosting });
      reset(); player.boosts = 3; lightning = atItem('lightning'); tick();
      record('boost-cap-three', player.boosts === 3, { charges: player.boosts });
      reset(); const barrier = atItem('barrier'); tick();
      record('barrier-hit', player.speed < 0 && player.collisionCooldown > 0 && barrier.barrier.state === 'blinking', { speed: player.speed, cooldown: player.collisionCooldown, barrier: barrier.barrier.state });
      reset(); player.speed = 3600; player.x = 1.2; tick();
      record('offroad-slows-car', player.speed < 3600, { speed: player.speed });
      reset(4);
      for (let i = 0; i < 5; i++) { atItem('pylon'); tick(); }
      record('five-energy-give-charge', player.energyBallsCollected === 0 && player.boosts === 1, { energy: player.energyBallsCollected, charges: player.boosts });
      reset(4); player.z = 180 * SEGMENT_LENGTH + 30; player.x = -0.5; player.speed = 0; tick();
      record('chevron-turbo', player.isChevronBoosting && player.boosts === 0, { turbo: player.isChevronBoosting, charges: player.boosts });
      reset(); player.z = TRACK_LENGTH - 1; player.speed = 3600; tick();
      record('lap-wrap', player.lap === 2 && player.z < TRACK_LENGTH && lapTimes[0] > 0, { lap: player.lap, z: player.z, times: [...lapTimes] });
      reset(3);
      const zones = [0, 450, 750, 1250, 1550, 2050, 2350].map(i => getLvl3Zone(i));
      record('level-three-zones', JSON.stringify(zones) === JSON.stringify(['steppe', 'tunnel', 'arctic', 'tunnel', 'dali', 'tunnel', 'underwater']), { zones, segments: segments.length });
      const finishIndices = [SEGMENT_COUNT - 1, SEGMENT_COUNT, segments.length - 1, SEGMENT_COUNT + 600];
      const finishWorlds = finishIndices.map(index => ({
        index, zone: getLvl3Zone(index), world: getLvl3World(index),
        tunnel: getTunnelStyle(index), weather: getLvl3WeatherFade(index),
      }));
      record('level-three-finish-world', finishWorlds.every(sample => sample.zone === 'underwater' && sample.world === 'underwater' && sample.tunnel === null && sample.weather === 1), finishWorlds);
      // Observe the painted sky gradient: moving foreground scenery makes a
      // single-pixel screenshot comparison unsuitable for this transition.
      const createGradient = ctx.createLinearGradient;
      const fillRect = ctx.fillRect;
      const palettes = new WeakMap();
      let paintedSky = [];
      ctx.createLinearGradient = function (...args) {
        const gradient = createGradient.apply(this, args);
        const stops = [];
        const addStop = gradient.addColorStop;
        gradient.addColorStop = function (offset, color) {
          stops.push([offset, color]);
          return addStop.call(this, offset, color);
        };
        palettes.set(gradient, stops);
        return gradient;
      };
      ctx.fillRect = function (x, y, width, height) {
        if (x === 0 && y === 0 && width === W && height === H && palettes.has(this.fillStyle)) {
          paintedSky = palettes.get(this.fillStyle);
        }
        return fillRect.call(this, x, y, width, height);
      };
      try {
        player.z = TRACK_LENGTH - 400; player.speed = player.maxSpeed;
        tick();
        const beforeFinish = { world: getLvl3World(Math.floor(player.z / SEGMENT_LENGTH)), sky: paintedSky };
        tick(120);
        const afterFinish = { world: getLvl3World(Math.floor(player.z / SEGMENT_LENGTH)), sky: paintedSky, finished: player.finished, z: player.z };
        record('level-three-rendered-finish', beforeFinish.world === 'underwater' && afterFinish.world === 'underwater' && afterFinish.finished && beforeFinish.sky.length > 0 && JSON.stringify(beforeFinish.sky) === JSON.stringify(afterFinish.sky), { beforeFinish, afterFinish });
      } finally {
        ctx.createLinearGradient = createGradient;
        ctx.fillRect = fillRect;
      }
      reset(); player.lap = 2; player.z = 0;
      opponents.forEach((opponent, i) => { opponent.lap = 1; opponent.z = i * 100; });
      opponents[0].lap = 2; opponents[0].z = 200;
      const rank = updateHUD(ts);
      record('ranking-uses-total-distance', rank === 2, { rank });
      return results;
    });
    if (errors.length) checks.push({ name: 'mechanics-runtime-errors', pass: false, errors });
    return checks;
  } finally {
    await page.close();
  }
};
