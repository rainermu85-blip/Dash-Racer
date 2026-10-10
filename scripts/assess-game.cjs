// Read-only browser assessment. Install Playwright separately; see docs/assessment.md.
const { chromium } = require('playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const mode = process.argv[2] || 'edges';
if (!['edges', 'races', 'mechanics', 'collisions', 'chapter', 'pace', 'bridge', 'traffic', 'tunnel'].includes(mode)) {
  console.error('Usage: node scripts/assess-game.cjs [edges|races|mechanics|collisions|chapter|pace|bridge|traffic|tunnel]');
  process.exit(2);
}
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const output = process.env.ASSESSMENT_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'dash-racer-assessment-'));
fs.mkdirSync(output, { recursive: true });

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_PATH || undefined,
    headless: true,
    args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  });
  const results = [];

  async function run(name, fn, options = {}) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...options });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.locator('#introBox.show').waitFor();
      if (options.hasTouch === false) await page.locator('#introBox').click();
      else await page.locator('#introBox').tap();
      const result = await fn(page);
      results.push({ name, ...result, errors, pass: result.pass && errors.length === 0 });
    } catch (error) {
      results.push({ name, pass: false, error: error.message, errors });
    } finally {
      await page.close();
      fs.writeFileSync(path.join(output, `${mode}.json`), JSON.stringify(results, null, 2));
    }
    console.log(JSON.stringify(results.find(result => result.name === name)));
  }

  async function start(page) {
    await page.locator('#startBtn').tap();
    await page.waitForFunction(() => state === 'playing');
  }

  // Edge fixtures deliberately jump to the finish. The races mode never does.
  async function nearFinish(page) {
    await page.evaluate(() => {
      player.lap = currentLevel === 5 ? 1 : 3;
      player.z = TRACK_LENGTH - 1;
      player.speed = player.maxSpeed;
      player.x = 0;
    });
    await page.waitForFunction(() => player.finished);
  }

  try {
    if (mode === 'edges') {
      await run('finish-exit-pending-timer', async page => {
        await start(page);
        await nearFinish(page);
        await page.keyboard.press('Escape');
        await page.locator('#exitRaceBtn').tap();
        const immediate = await page.evaluate(() => state);
        await page.waitForTimeout(1800);
        const later = await page.evaluate(() => ({ state, menu: !!document.getElementById('startBtn') }));
        return { pass: later.state === 'intro' && later.menu, immediate, later };
      });
      await run('finish-restart-exit-main-menu', async page => {
        await start(page);
        await nearFinish(page);
        await page.waitForFunction(() => state === 'result');
        await page.locator('#rb').tap();
        await page.waitForFunction(() => state === 'playing');
        await page.keyboard.press('Escape');
        await page.locator('#exitRaceBtn').tap();
        const actual = await page.evaluate(() => ({
          state, menu: !!document.getElementById('startBtn'),
          resultVisible: document.getElementById('overlay').textContent.includes('RACE COMPLETED'),
        }));
        return { pass: actual.menu && !actual.resultVisible, actual };
      });
      await run('blur-does-not-pause', async page => {
        await start(page);
        await page.keyboard.down('ArrowRight');
        await page.evaluate(() => window.dispatchEvent(new Event('blur')));
        const before = await page.evaluate(() => ({ z: player.z, keys: { ...keys }, paused }));
        await page.waitForTimeout(500);
        const after = await page.evaluate(() => ({ z: player.z, paused }));
        return { pass: after.paused && before.z === after.z, before, after, kind: 'proposed-ux-requirement' };
      });
      await run('mobile-pause-control', async page => {
        await start(page);
        const visibleButtons = await page.locator('button:visible').allTextContents();
        return { pass: visibleButtons.some(text => /pause/i.test(text)), visibleButtons, kind: 'proposed-ux-requirement' };
      });
      await run('pause-freezes-progress-and-time', async page => {
        await start(page);
        await page.keyboard.press('Escape');
        const before = await page.evaluate(() => ({ z: player.z, t: currentLapTime }));
        await page.waitForTimeout(400);
        const after = await page.evaluate(() => ({ z: player.z, t: currentLapTime }));
        await page.locator('#resumeBtn').tap();
        await page.waitForTimeout(200);
        return { pass: before.z === after.z && before.t === after.t && await page.evaluate(() => !paused && currentLapTime > 0), before, after };
      });
      await run('level-switch-dream-to-space-restart', async page => {
        await page.locator('#lvl5Btn').tap();
        await start(page);
        await nearFinish(page);
        await page.waitForFunction(() => state === 'result');
        await page.locator('#lvl6Btn').tap();
        await page.locator('#rb').tap();
        await page.waitForFunction(() => state === 'playing');
        const actual = await page.evaluate(() => ({
          level: currentLevel, count: SEGMENT_COUNT, segments: segments.length,
          lap: player.lap, finished: player.finished, boosts: player.boosts,
          energy: player.energyBallsCollected, times: [...lapTimes],
          energyVisible: getComputedStyle(document.getElementById('energyBoard')).display !== 'none',
        }));
        return { pass: actual.level === 6 && actual.count === 1350 && actual.segments === 1350 && actual.lap === 1 && !actual.finished && actual.boosts === 0 && actual.energy === 0 && actual.times.every(t => t === 0) && actual.energyVisible, actual };
      });
    } else if (mode === 'races') {
      await Promise.all([1, 2, 3, 4, 5, 6].map(level => run(`full-race-${level}`, async page => {
        const failedRequests = [];
        page.on('requestfailed', request => failedRequests.push({ url: request.url().split('?')[0], failure: request.failure()?.errorText }));
        await page.locator(`#lvl${level}Btn`).click();
        await page.locator('#startBtn').click();
        const started = Date.now();
        const laps = [];
        let lastLap = 1;
        let lastLog = 0;
        while (Date.now() - started < 420000) {
          const actual = await page.evaluate(() => {
            // Feedback driver only generates steering key events. No physics overrides.
            const direction = player.x > 0.05 ? 'left' : player.x < -0.05 ? 'right' : null;
            for (const [name, key] of [['left', 'ArrowLeft'], ['right', 'ArrowRight']]) {
              if (keys[name] !== (direction === name)) {
                document.dispatchEvent(new KeyboardEvent(direction === name ? 'keydown' : 'keyup', { key, bubbles: true }));
              }
            }
            return { state, lap: player.lap, z: player.z, finished: player.finished,
              times: [...lapTimes], best: bestLapTime, rank: document.getElementById('placeVal').textContent,
              progress: document.getElementById('markerPlayer').style.left,
              opponents: opponents.map(o => ({ lap: o.lap, z: o.z, total: (o.lap - 1) * TRACK_LENGTH + o.z })) };
          });
          if (actual.lap !== lastLap) { laps.push(actual); lastLap = actual.lap; }
          if (Date.now() - lastLog > 30000) {
            lastLog = Date.now();
            console.log(`Level ${level}: ${Math.round((Date.now() - started) / 1000)}s, lap ${actual.lap}, state ${actual.state}`);
          }
          if (actual.state === 'result') {
            const maxLaps = level === 5 ? 1 : 3;
            const completed = actual.times.slice(0, maxLaps);
            await page.screenshot({ path: path.join(output, `result-${level}.png`) });
            const resultText = await page.locator('#overlay').innerText();
            return { pass: actual.finished && actual.lap === maxLaps + 1 && completed.every(t => Number.isFinite(t) && t > 0) && actual.best === Math.min(...completed) && actual.progress === '100%' && resultText.includes('RACE COMPLETED'), wallSeconds: (Date.now() - started) / 1000, actual, laps, resultText, failedRequests };
          }
          await page.waitForTimeout(100);
        }
        throw new Error('Race did not complete within 420 seconds');
      }, { viewport: { width: 480, height: 800 }, isMobile: false, hasTouch: false })));
    } else {
      // Fixed-frame mechanics fixtures live separately to make their scope explicit.
      const runMechanics = require(mode === 'tunnel' ? './assessment-tunnel.cjs' : mode === 'traffic' ? './assessment-traffic.cjs' : mode === 'bridge' ? './assessment-bridge.cjs' : mode === 'pace' ? './assessment-pace.cjs' : mode === 'chapter' ? './assessment-chapter.cjs' : mode === 'collisions' ? './assessment-collisions.cjs' : './assessment-mechanics.cjs');
      results.push(...await runMechanics(browser, baseUrl));
      fs.writeFileSync(path.join(output, `${mode}.json`), JSON.stringify(results, null, 2));
      for (const result of results) console.log(JSON.stringify(result));
    }
  } finally {
    await browser.close();
  }
  console.log(`${results.filter(r => r.pass).length} passed, ${results.filter(r => !r.pass).length} failed. Results: ${output}`);
  process.exitCode = results.length === 0 || results.some(r => !r.pass) ? 1 : 0;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
