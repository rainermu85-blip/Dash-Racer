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
        const drawScenery = drawCoastScenery, deckOutline = coastOutsideDeck, projectDeck = coastDeckSlices;
        let outsideRoad, projected;
        coastDeckSlices = roads => (projected = projectDeck(roads));
        coastOutsideDeck = (roads, margin) => {
          const outline = deckOutline(roads, margin);
          if (margin === 1.02) outsideRoad = outline;
          return outline;
        };
        const checks = [];
        try {
          for (const [index, subject] of [[548,'towboat'],[579,'towboat'],[668,'towboat'],[695,'towboat'],
              [51,'land'],[197,'land'],[949,'land'],[1724,'land'],[1748,'land'],[2020,'land'],[2234,'land'],[2937,'land'],[2967,'land'],[3452,'land'],[3780,'land'],[3821,'land'],
              [3490,'sailboat'],[3497,'sailboat'],[3703,'sailboat'],[3717,'sailboat'],[3726,'sailboat']]) {
            player.z = (index + .35) * SEGMENT_LENGTH;
            player.x = 0;
            player.speed = 3900;
            player.pitch = segments[index].hillDelta;
            raceElapsed = index * 34;
            for (let i = 0; i < 30; i++) updateCurveCamera(1/60);
            drawCoastScenery = (sprite, ...options) => {
              const kind = sprite.item.kind;
              const tested = subject === 'land' ? kind !== 'cropPlane' && !coastIsBoat(kind) : subject === kind;
              if (!tested) drawScenery(sprite, ...options);
            };
            render(raceElapsed);
            const before = ctx.getImageData(0,0,W,H).data;
            drawCoastScenery = drawScenery;
            render(raceElapsed);
            const after = ctx.getImageData(0,0,W,H).data;
            maskCtx.clearRect(0,0,W,H);
            maskCtx.fill(outsideRoad,'evenodd');
            const outside = maskCtx.getImageData(0,0,W,H).data;
            let water, waterHorizon = Infinity;
            if (subject === 'sailboat') {
              const outline = new Path2D();
              for (const r of projected) {
                if (!r.isVisible || r.segIdx < COAST_PACIFIC_START) continue;
                const edge = r.segIdx >= COAST_PIER_START ? -COAST_PIER_DECK_EDGE : COAST_PACIFIC_SURF_EDGE;
                waterHorizon = Math.min(waterHorizon, r.y2);
                outline.moveTo(r.rx1 - 28*r.w1, r.y1);
                outline.lineTo(r.rx2 - 28*r.w2, r.y2);
                outline.lineTo(r.rx2 + edge*r.w2, r.y2);
                outline.lineTo(r.rx1 + edge*r.w1, r.y1);
                outline.closePath();
              }
              maskCtx.clearRect(0,0,W,H);
              maskCtx.fill(outline);
              water = maskCtx.getImageData(0,0,W,H).data;
            }
            let changed = 0, onRoad = 0, onBank = 0;
            for (let i = 0; i < before.length; i += 4) {
              const difference = Math.abs(before[i]-after[i]) + Math.abs(before[i+1]-after[i+1]) + Math.abs(before[i+2]-after[i+2]);
              if (difference < 20) continue;
              changed++;
              if (outside[i+3] === 0) onRoad++;
              if (water && Math.floor(i/(4*W)) >= Math.ceil(waterHorizon) && water[i+3] === 0) onBank++;
            }
            checks.push({index,subject,changed,onRoad,onBank});
          }
        } finally {
          drawCoastScenery = drawScenery;
          coastOutsideDeck = deckOutline;
          coastDeckSlices = projectDeck;
        }
        return checks;
      });
      const bridgeVisible = frames.some(f=>f.subject==='towboat'&&f.index<605&&f.changed>60)
        && frames.some(f=>f.subject==='towboat'&&f.index>605&&f.changed>60);
      const sailsVisible = frames.some(f=>f.subject==='sailboat'&&f.index<3600&&f.changed>60)
        && frames.some(f=>f.subject==='sailboat'&&f.index>=3722&&f.changed>60);
      results.push({
        name:'coast-to-coast-scenery-stays-off-the-road-'+viewport.width,
        pass: !errors.length && bridgeVisible && sailsVisible && frames.every(f=>f.onRoad===0&&f.onBank===0),
        actual: {frames,bridgeVisible,sailsVisible}, errors
      });
    } finally {
      await page.close();
    }
  }
  return results;
};
