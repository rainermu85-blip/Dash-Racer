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
      reset(); const barrier = atItem('barrier'); player.speed = player.maxSpeed; tick();
      record('barrier-hit', player.speed >= 0 && player.speed < player.maxSpeed * 0.5 && player.collisionCooldown > 0 && barrier.barrier.state === 'blinking', { speed: player.speed, cooldown: player.collisionCooldown, barrier: barrier.barrier.state });
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

      // The exit climbs over a crest. Glass ribs above the hidden road must
      // already be painted while the camera is still inside the opaque tunnel.
      reset(3); opponents.length = 0;
      player.z = 2330 * SEGMENT_LENGTH; player.pitch = 32;
      const drawRoad = drawRoadSegment;
      const curve = ctx.bezierCurveTo;
      const hiddenRoadArches = [];
      let drawingSegment = null;
      window.drawRoadSegment = (...args) => {
        drawingSegment = { index: args[12], roadVisible: args[13] };
        try { return drawRoad(...args); }
        finally { drawingSegment = null; }
      };
      ctx.bezierCurveTo = function (...args) {
        if (drawingSegment && drawingSegment.index >= 2350 && drawingSegment.index < 2400 && !drawingSegment.roadVisible) {
          hiddenRoadArches.push(drawingSegment.index);
        }
        return curve.apply(this, args);
      };
      try {
        render(ts);
        record('underwater-glass-visible-over-exit-crest', hiddenRoadArches.length > 0 && player.z < 2350 * SEGMENT_LENGTH, { cameraSegment: player.z / SEGMENT_LENGTH, hiddenRoadArches });
      } finally {
        window.drawRoadSegment = drawRoad;
        ctx.bezierCurveTo = curve;
      }

      // Observe the white checker cells and the finish label actually painted,
      // rather than merely checking a flag on the final segment.
      const paintedFinishes = [];
      for (const level of [1, 2, 3, 4]) {
        reset(level); opponents.length = 0;
        player.z = TRACK_LENGTH - 10 * SEGMENT_LENGTH;
        const drawStrip = trapezoid, drawLabel = ctx.fillText;
        let whiteCells = 0, finishLabels = 0;
        window.drawRoadSegment = (...args) => {
          drawingSegment = { index: args[12], roadVisible: args[13] };
          try { return drawRoad(...args); }
          finally { drawingSegment = null; }
        };
        window.trapezoid = (...args) => {
          if (drawingSegment?.index >= SEGMENT_COUNT - 2 && ctx.fillStyle === '#ffffff') whiteCells++;
          return drawStrip(...args);
        };
        ctx.fillText = function (text, ...args) {
          if (text === 'FINISH') finishLabels++;
          return drawLabel.call(this, text, ...args);
        };
        try {
          render(ts);
          paintedFinishes.push({ level, whiteCells, finishLabels });
        } finally {
          window.drawRoadSegment = drawRoad;
          window.trapezoid = drawStrip;
          ctx.fillText = drawLabel;
        }
      }
      record('all-levels-paint-checkered-finish', paintedFinishes.every(sample => sample.whiteCells >= 10), paintedFinishes);
      record('level-three-paints-finish-banner', paintedFinishes.find(sample => sample.level === 3).finishLabels === 1, paintedFinishes);

      const glassWall = 0.8;
      const wallContacts = [];
      for (const side of [-1, 1]) {
        for (const boosted of [false, true]) {
          reset(3); opponents.length = 0;
          player.z = 2650 * SEGMENT_LENGTH; player.x = side * 0.79;
          player.speed = player.maxSpeed; player.boosts = boosted ? 1 : 0;
          keys.left = side < 0; keys.right = side > 0; keys.boost = boosted;
          let furthest = 0, collisionFeedback = false;
          for (let frame = 0; frame < 60; frame++) {
            tick();
            furthest = Math.max(furthest, Math.abs(player.x));
            collisionFeedback ||= player.hitFlash > 0;
          }
          wallContacts.push({ side, boosted, furthest, collisionFeedback, speed: player.speed, speedLimit: player.maxSpeed * (boosted ? 1.65 : 1) });
        }
      }
      record('underwater-glass-walls-stop-steering-and-boost', wallContacts.every(sample => sample.furthest <= glassWall && sample.collisionFeedback && sample.speed < sample.speedLimit * 0.9), wallContacts);

      const entries = [];
      for (const side of [-1, 1]) {
        reset(3); opponents.length = 0;
        player.z = 2350 * SEGMENT_LENGTH - 1; player.x = side * 1.02;
        player.speed = player.maxSpeed; tick();
        entries.push({ side, zone: getLvl3Zone(Math.floor(player.z / SEGMENT_LENGTH)), x: player.x });
      }
      record('underwater-glass-walls-apply-on-entry', entries.every(sample => sample.zone === 'underwater' && Math.abs(sample.x) <= glassWall), entries);

      const pushes = [];
      for (const side of [-1, 1]) {
        reset(3);
        const opponent = opponents[0]; opponents.length = 1;
        player.z = 2820 * SEGMENT_LENGTH; player.x = side * 0.799;
        player.speed = player.maxSpeed;
        opponent.x = side * 0.5595;
        opponent.baseX = opponent.targetX = side * 0.8;
        opponent.z = player.z + contactDistance();
        opponent.speed = opponent.maxSpeed = player.speed;
        opponent.isBoosting = opponent.isChevronBoosting = false;
        tick();
        pushes.push({ side, x: player.x, cooldown: player.collisionCooldown });
      }
      record('underwater-glass-walls-contain-opponent-push', pushes.every(sample => Math.abs(sample.x) <= glassWall && sample.cooldown > 0), pushes);

      const runout = [];
      for (const side of [-1, 1]) {
        reset(3); opponents.length = 0;
        player.finished = true; player.z = TRACK_LENGTH + 10 * SEGMENT_LENGTH;
        player.x = side * 1.2; player.speed = player.maxSpeed; tick();
        runout.push({ side, x: player.x, finished: player.finished });
      }
      record('underwater-glass-walls-continue-after-finish', runout.every(sample => sample.finished && Math.abs(sample.x) <= glassWall), runout);

      const otherZones = [];
      for (const segment of [100, 1000, 1750, 2250]) {
        reset(3); opponents.length = 0;
        player.z = segment * SEGMENT_LENGTH; player.x = 1.02;
        player.speed = 0; tick();
        otherZones.push({ segment, x: player.x, zone: getLvl3Zone(segment), world: getLvl3World(segment) });
      }
      record('underwater-glass-walls-leave-other-zones-open', otherZones.every(sample => sample.x > 1), otherZones);

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
