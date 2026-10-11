// Observe coastal landmarks and the rock opening through the real canvas.
module.exports = async function runCoast(browser, baseUrl) {
  const results = [];
  for (const viewport of [{ width:390,height:844 }, { width:480,height:800 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    try {
      await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
      await page.goto(baseUrl, { waitUntil:'domcontentloaded' });
      const checks = await page.evaluate(() => {
        const checks=[]; let ts=1000;
        const record=(name,pass,actual)=>checks.push({name:`coast-${W}-${name}`,pass,actual});
        const reset=(level=2,lap=1)=>{
          showMainMenu();selectLevel(level);startRace();state='playing';lastTime=ts;smoothedDt=1/60;
          document.getElementById('cntNum').classList.remove('pop');
          player.lap=lap;player.speed=4320;player.cleanSpeedBonus=.2;
          opponents.length=0;for(const s of segments)s.pylon=s.barrier=s.lightning=null;
          keys.left=keys.right=keys.boost=false;
        };
        const tick=()=>{keys.left=player.x>.035;keys.right=player.x<-.035;ts+=1000/60;loop(ts);};
        reset();
        const tunnel=segments.filter(s=>s.isTunnel);
        record('short-rock-opening',tunnel.length===36&&tunnel[0].index===506&&tunnel.at(-1).index===541&&tunnel.every(s=>!s.sprite),{start:tunnel[0]?.index,end:tunnel.at(-1)?.index,count:tunnel.length,seconds:tunnel.length*SEGMENT_LENGTH/4320});
        const limits=[505,506,541,542].map(i=>getRoadLimits(i*SEGMENT_LENGTH));
        record('walls-confine-only-rock-opening',limits[0].right===1.45&&limits[1].right===1.05&&limits[2].right===1.05&&limits[3].right===1.45&&limits.every(l=>l.left===1.05),limits);
        ctx.fillStyle='#ff00ff';ctx.fillRect(0,0,W,H);
        drawOceanRockPortal(W/2,650,45,70);
        const pixel=(x,y)=>[...ctx.getImageData(Math.round(x),y,1,1).data].slice(0,3).join(',');
        const opening=[-.85,0,.85].map(l=>pixel(W/2+l*45,612)),rock=pixel(W/2+90,612);
        record('natural-portal-keeps-all-three-lanes-open',opening.every(p=>p==='255,0,255')&&rock!=='255,0,255',{opening,rock});
        const paint=paintOceanPolygon;let points=[];const frames=[];
        paintOceanPolygon=(p,c,s)=>{points.push(...p);paint(p,c,s);};
        try {
          for(const index of[.00001,37.99999,290,505.99999,506,506.00001,524,541.99999,542,542.00001,780,1149.99999]){
            player.z=index*SEGMENT_LENGTH;points=[];render(ts);
            const values=points.flatMap(p=>[p.x,p.y]);frames.push({index,finite:values.every(Number.isFinite),peak:values.reduce((max,n)=>Math.max(max,Math.abs(n)),0)});
          }
        } finally {paintOceanPolygon=paint;}
        record('cliffs-and-portals-project-safely',frames.every(f=>f.finite&&f.peak<100000),frames);
        const shell=drawOceanRockTunnelSegment;let shells=0;
        drawOceanRockTunnelSegment=(...args)=>{shells++;shell(...args);};
        try{player.z=495*SEGMENT_LENGTH;render(ts);}finally{drawOceanRockTunnelSegment=shell;}
        record('rock-tunnel-visible-on-approach',shells>0,{shells});
        reset();player.z=495*SEGMENT_LENGTH;const start=player.z;
        for(let n=0;n<140;n++)tick();
        record('normal-driving-through-opening-keeps-speed',player.z>542*SEGMENT_LENGTH&&player.speed>4319&&Math.abs(player.x)<.1,{distance:player.z-start,speed:player.speed,x:player.x});
        // Compare final frames with and without a landmark, excluding the DOM
        // turbo display. This catches objects clipped or hidden by nearer rocks.
        const impact=pier=>{
          const draw=pier?drawOceanPier:drawBeachPartySprite, random=Math.random;
          try{
            Math.random=()=>.5;
            if(pier)drawOceanPier=()=>{};else drawBeachPartySprite=()=>{};
            render(ts);const before=ctx.getImageData(0,0,W,H).data;
            if(pier)drawOceanPier=draw;else drawBeachPartySprite=draw;
            render(ts);const after=ctx.getImageData(0,0,W,H).data;
            const canvas=C.getBoundingClientRect(), board=document.getElementById('boostContainer').getBoundingClientRect();
            let visible=0;
            for(let i=0;i<after.length;i+=4){
              const x=(i/4)%W,y=Math.floor(i/4/W),sx=canvas.left+x*canvas.width/W,sy=canvas.top+y*canvas.height/H;
              if(sx>=board.left&&sx<=board.right&&sy>=board.top&&sy<=board.bottom)continue;
              if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2])visible++;
            }
            return visible;
          }finally{Math.random=random;if(pier)drawOceanPier=draw;else drawBeachPartySprite=draw;}
        };
        for(const [name,pier,lap,start,index] of [
          ['pier-day',true,1,280,OCEAN_PIER_INDEX],['party-day',false,1,760,OCEAN_PARTY_INDEX],['party-night',false,3,760,OCEAN_PARTY_INDEX]
        ]){
          reset(2,lap);player.z=start*SEGMENT_LENGTH;const samples=[];
          for(const gap of[32,25,20,16,12]){
            for(let n=0;player.z<(index-gap)*SEGMENT_LENGTH&&n<600;n++)tick();
            samples.push({index:player.z/SEGMENT_LENGTH,visible:impact(pier)});
          }
          record(`${name}-visible-during-normal-driving`,samples.filter(s=>s.visible>150).length>=2&&Math.max(...samples.map(s=>s.visible))>700,samples);
        }
        reset();player.z=520*SEGMENT_LENGTH;player.x=1.25;applyRoadContact(1/60,0);
        record('car-cannot-drive-through-right-rock-wall',player.x<=1.05+1e-9,{x:player.x,side:player.wallContactSide});
        for(const level of[1,3,4,5,6]){
          reset(level);
          record(`opening-does-not-leak-to-level-${level}`,oceanCliffProfiles.length===0&&!isOceanRockTunnel(520)&&!segments.some(s=>s.sprite==='ocean_pier'||s.sprite==='coastal_boulder'),{level,profiles:oceanCliffProfiles.length});
        }
        return checks;
      });
      results.push(...checks.map(r=>({...r,errors,pass:r.pass&&errors.length===0})));
    } finally {await page.close();}
  }
  return results;
};
