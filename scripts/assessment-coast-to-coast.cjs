// Compare the rendered road with and without Coast to Coast scenery.
module.exports = async function runCoastToCoast(browser, baseUrl) {
  const results = [];
  for (const viewport of [{width:390,height:844}, {width:1280,height:800}]) {
    const page = await browser.newPage({viewport});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.addInitScript(() => {
        localStorage.setItem('turboDash.playerTag','ACE');
        requestAnimationFrame = () => 0;
      });
      await page.goto(baseUrl);
      const frames = await page.evaluate(() => {
        selectLevel(9);
        startRace();
        state = 'playing';
        opponents = [];
        const mask = document.createElement('canvas');
        mask.width = W;
        mask.height = H;
        const maskCtx = mask.getContext('2d',{willReadFrequently:true});
        const drawScenery = drawCoastScenery, deckOutline = coastOutsideDeck;
        let outsideRoad;
        coastOutsideDeck = (roads, margin) => {
          const outline = deckOutline(roads, margin);
          if (margin === 1.02) outsideRoad = outline;
          return outline;
        };
        const checks = [];
        try {
          for (const [index, subject] of [[548,'towboat'],[579,'towboat'],[668,'towboat'],[695,'towboat'],
              [949,'land'],[1724,'land'],[2020,'land'],[2234,'land'],[2937,'land'],[3452,'land'],[3780,'land']]) {
            player.z = (index + .35) * SEGMENT_LENGTH;
            player.x = 0;
            player.speed = 3900;
            player.pitch = segments[index].hillDelta;
            raceElapsed = index * 34;
            for (let i = 0; i < 30; i++) updateCurveCamera(1/60);
            drawCoastScenery = (sprite, clip) => {
              const kind = sprite.item.kind;
              const tested = subject === 'towboat' ? kind === 'towboat' : (kind !== 'cropPlane' && !coastIsBoat(kind));
              if (!tested) drawScenery(sprite, clip);
            };
            render(raceElapsed);
            const before = ctx.getImageData(0,0,W,H).data;
            drawCoastScenery = drawScenery;
            render(raceElapsed);
            const after = ctx.getImageData(0,0,W,H).data;
            maskCtx.clearRect(0,0,W,H);
            maskCtx.fill(outsideRoad,'evenodd');
            const outside = maskCtx.getImageData(0,0,W,H).data;
            let changed = 0, onRoad = 0;
            for (let i = 0; i < before.length; i += 4) {
              const difference = Math.abs(before[i]-after[i]) + Math.abs(before[i+1]-after[i+1]) + Math.abs(before[i+2]-after[i+2]);
              if (difference < 20) continue;
              changed++;
              if (outside[i+3] === 0) onRoad++;
            }
            checks.push({index,subject,changed,onRoad});
          }
        } finally {
          drawCoastScenery = drawScenery;
          coastOutsideDeck = deckOutline;
        }
        return checks;
      });
      const bridgeVisible = frames.some(f=>f.subject==='towboat'&&f.index<605&&f.changed>60)
        && frames.some(f=>f.subject==='towboat'&&f.index>605&&f.changed>60);
      results.push({
        name:'coast-to-coast-scenery-stays-off-the-road-'+viewport.width,
        pass: !errors.length && bridgeVisible && frames.every(f=>f.onRoad===0),
        actual: {frames,bridgeVisible}, errors
      });
    } finally {
      await page.close();
    }
  }
  return results;
};
