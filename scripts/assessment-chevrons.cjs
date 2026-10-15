// Chevron contacts must follow the painted V, its screen projection and the visible car.
module.exports=async function runChevrons(browser,baseUrl){
 const results=[];
 for(const viewport of[{width:320,height:640},{width:390,height:844},{width:480,height:800}]){
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
   await page.evaluate(async()=>{await document.fonts.ready;introScreen.style.display='none';});
   const checks=await page.evaluate(()=>{
    const checks=[],record=(name,pass,actual)=>checks.push({name:`chevron-${W}-${name}`,pass,actual});let time=1000;
    const reset=(fps=60,flat=true)=>{selectLevel(6);startRace();state='playing';opponents.length=0;lastTime=time;smoothedDt=1/fps;keys.left=keys.right=keys.boost=false;cntNum.style.display='none';for(const s of segments){s.pylon=s.barrier=s.lightning=null;if(flat)s.curve=s.hillDelta=s.worldY=0;}player.pitch=player.steerLean=0;curveCamera.look=0;};
    const tick=fps=>{const draw=render;render=()=>{};try{time+=1000/fps;loop(time);}finally{render=draw;}};
    for(const fps of[30,60,120]){
     const runs=[];
     for(const panel of[0,1])for(const speed of[3600,8316]){
      reset(fps);player.x=panel%2?.5:-.5;player.z=(panelStarts[panel]-18)*SEGMENT_LENGTH;player.speed=speed;player.cleanSpeedBonus=.2;player.boosts=2;
      if(speed>5000){player.isChevronBoosting=true;player.chevronBoostTimer=10;player.fovOffset=-.56;}
      let hits=0,firstZ=null;const popup=spawnPopupText;spawnPopupText=(text,...a)=>{if(text==='CHAINED!'||text==='CHEVRON TURBO!'){hits++;firstZ??=player.z/SEGMENT_LENGTH;}popup(text,...a);};
      try{for(let n=0;n<300&&player.z<(panelStarts[panel]+8)*SEGMENT_LENGTH;n++)tick(fps);}finally{spawnPopupText=popup;}
      runs.push({panel,speed,hits,firstZ,charges:player.boosts,last:player.lastChevronPanelIdx});
     }
     record(`actual-loop-contacts-on-both-sides-${fps}`,runs.every(r=>r.hits===1&&r.firstZ<panelStarts[r.panel]&&r.charges===2&&r.last===r.panel),runs);
     reset(fps);player.x=.65;player.z=(panelStarts[0]-12)*SEGMENT_LENGTH;player.speed=4320;player.cleanSpeedBonus=.2;
     for(let n=0;n<200&&player.z<(panelStarts[0]+8)*SEGMENT_LENGTH;n++)tick(fps);
     record(`opposite-half-does-not-trigger-${fps}`,!player.isChevronBoosting&&player.lastChevronPanelIdx===-1);
    }
    reset();player.x=-.5;player.speed=4320;player.cleanSpeedBonus=.2;player.z=(panelStarts[0]-12)*SEGMENT_LENGTH;
    for(let n=0;n<200&&player.lastChevronPanelIdx<0;n++)tick(60);
    const firstLap=player.lastChevronPanelLap;player.lap=2;player.z=(panelStarts[0]-12)*SEGMENT_LENGTH;player.isChevronBoosting=false;player.chevronBoostTimer=0;player.fovOffset=0;
    for(let n=0;n<200&&player.lastChevronPanelLap!==2;n++)tick(60);
    record('same-panel-works-on-next-lap',firstLap===1&&player.lastChevronPanelLap===2&&player.isChevronBoosting);
    startRace();record('restart-clears-panel-contact',player.lastChevronPanelIdx===-1&&player.lastChevronPanelLap===0);
    // Independently rasterize the real pink paint (with the player hidden), then
    // compare the occupied car-width columns with the analytical overlap.
    // The vignette darkens the paint near the car, so identify its hue rather than full brightness.
    const measure=()=>{
      const overlap=getChevronOverlap;let ratio=0;
      getChevronOverlap=(shape,foot,clip)=>{const w=overlap(shape,foot,clip);ratio=Math.max(ratio,w/foot.width);return w;};
      try{getPlayerChevronContact();}finally{getChevronOverlap=overlap;}
      return ratio;
    };
    const random=Math.random;Math.random=()=>.5;
    try{for(const panel of[0,1,2,3,4,5,6]){
      reset(60,false);player.speed=0;player.cleanSpeedBonus=.2;
      let anchor=null;
      for(let offset=-32;offset<4&&!anchor;offset+=.5){
       player.z=(panelStarts[panel]+offset)*SEGMENT_LENGTH;
       player.pitch=Array.from({length:20},(_,j)=>getSeg(player.z+j*SEGMENT_LENGTH).hillDelta).reduce((a,b)=>a+b,0)/20;
       curveCamera.look=0;for(let j=0;j<70;j++)updateCurveCamera(1/60);
       for(let x=-.95;x<=.951;x+=.05){player.x=x;player.steerLean=0;if(measure()>.65){anchor={z:player.z,pitch:player.pitch,look:curveCamera.look};break;}}
      }
      if(!anchor){record(`visible-anchor-${panel}`,false);continue;}
      const candidates=[];
      for(let x=-.95;x<=.951;x+=.005){player.x=x;const ratio=measure();if(ratio>.24&&ratio<.42)candidates.push({x,ratio});}
      const below=candidates.filter(p=>p.ratio>.25&&p.ratio<.30).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x))[0];
      const above=candidates.filter(p=>p.ratio>.37&&p.ratio<.41).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x))[0];
      for(const [kind,sample]of[['below',below],['above',above]]){
       if(!sample){record(`${kind}-threshold-case-${panel}`,false,{anchor});continue;}
       player.x=sample.x;player.isChevronBoosting=false;player.fovOffset=0;
       const footprint=getPlayerChevronFootprint(),carDraw=drawCarSprite;drawCarSprite=(...args)=>{if(!args[4])carDraw(...args);};
       try{render(1000);}finally{drawCarSprite=carDraw;}
       const pixels=ctx.getImageData(0,0,W,H).data,left=Math.max(0,Math.ceil(footprint.left)),right=Math.min(W-1,Math.floor(footprint.right));let columns=0;
       for(let x=left;x<=right;x++){for(let y=Math.max(0,Math.ceil(footprint.top));y<=Math.min(H-1,Math.floor(footprint.bottom));y++){
        const i=(y*W+x)*4;if(pixels[i]>130&&pixels[i+1]<12&&pixels[i+2]>pixels[i]*.45&&pixels[i+2]<pixels[i]*.55){columns++;break;}
       }}
       const raster=columns/Math.max(1,right-left+1),hit=getPlayerChevronContact();
       tick(60);
       record(`painted-${kind}-one-third-${panel}`,kind==='above'?raster>1/3&&!!hit&&player.isChevronBoosting:raster<1/3&&!hit&&!player.isChevronBoosting,{ratio:sample.ratio,raster,x:sample.x,z:anchor.z/SEGMENT_LENGTH,hit});
       player.z=anchor.z;player.pitch=anchor.pitch;curveCamera.look=anchor.look;player.lastChevronPanelIdx=-1;player.lastChevronPanelLap=0;player.isChevronBoosting=false;player.chevronBoostTimer=0;
      }
    }}finally{Math.random=random;}
    return checks;
   });
   results.push(...checks.map(c=>({...c,errors,pass:c.pass&&errors.length===0})));
  }finally{await page.close();}
 }
 return results;
};
