// Exercise new surfaces through the real physics, and measure scenery pixels in road views.
module.exports=async function runPolish(browser,baseUrl){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
  await page.evaluate(async()=>{await document.fonts.ready;document.getElementById('introScreen').style.display='none';});
  const checks=await page.evaluate(()=>{
   const checks=[],record=(name,pass,actual)=>checks.push({name,pass,actual});let time=1000;
   const reset=level=>{selectLevel(level);startRace();state='playing';lastTime=time;smoothedDt=1/60;opponents.length=0;keys.left=keys.right=keys.boost=false;for(const s of segments){s.pylon=s.barrier=s.lightning=null;s.curve=s.hillDelta=s.worldY=0;}player.pitch=player.x=0;};
   const tick=(seconds,fps=60)=>{const draw=render;render=()=>{};try{for(let n=0;n<Math.round(seconds*fps);n++){time+=1000/fps;loop(time);}}finally{render=draw;}};
   const random=Math.random;Math.random=()=>.25;
   try{
    const skids=[];
    for(const fps of[30,60,120])for(const patch of DREAM_ICE){
     reset(5);player.z=patch.start*SEGMENT_LENGTH-getPlayerContactDistance()-5;player.x=patch.x;player.speed=4320;player.cleanSpeedBonus=.2;smoothedDt=1/fps;
     tick(.2,fps);skids.push({fps,start:patch.start,x:player.x,timer:player.iceTimer});
     record(`ice-is-a-brief-loss-of-control-${fps}-${patch.start}`,player.iceTimer>0&&player.iceTimer<.62&&player.x<patch.x-.08,{x:player.x,timer:player.iceTimer});
     tick(.6,fps);record(`ice-control-returns-${fps}-${patch.start}`,player.iceTimer===0&&polishSteeringGrip(player)===1);
     reset(5);player.z=patch.start*SEGMENT_LENGTH-getPlayerContactDistance()-5;player.x=-patch.x;player.speed=4320;smoothedDt=1/fps;tick(.15,fps);
     record(`ice-leaves-other-half-passable-${fps}-${patch.start}`,player.iceTimer===0&&player.surfaceVisits.size===0);
    }
    record('ice-drift-consistent-across-frame-rates',DREAM_ICE.every(p=>{const xs=skids.filter(s=>s.start===p.start).map(s=>s.x);return Math.max(...xs)-Math.min(...xs)<.045;}),skids);
    Math.random=()=>.75;reset(5);player.z=DREAM_ICE[0].start*SEGMENT_LENGTH-getPlayerContactDistance()-5;player.x=DREAM_ICE[0].x;player.speed=4320;tick(.2);
    record('ice-can-break-out-to-the-right-too',player.x>DREAM_ICE[0].x+.08,{x:player.x});Math.random=()=>.25;
    reset(5);initOpponents();opponents.length=1;const opp=opponents[0],patch=DREAM_ICE[1];resetPolishCar(opp);opp.profile={...opp.profile,turboRate:0};opp.x=opp.baseX=opp.targetX=patch.x;opp.z=patch.start*SEGMENT_LENGTH-5;opp.speed=3600;player.z=opp.z-getPlayerContactDistance();player.x=patch.x;player.speed=3600;
    tick(.10);record('ice-affects-both-cars-without-consuming-patch',player.iceTimer>0&&opp.iceTimer>0,{player:player.iceTimer,opponent:opp.iceTimer});
    for(const patch of DREAM_PUDDLES){
     reset(5);player.z=patch.start*SEGMENT_LENGTH-getPlayerContactDistance()-5;player.x=patch.x;player.speed=4320;tick(.1);
     record(`clock-puddle-triggers-five-second-vision-${patch.start}`,player.dreamEffectTimer>4.8&&player.dreamEffectTimer<=5,{timer:player.dreamEffectTimer,type:player.dreamEffectType});
     const before=player.dreamEffectTimer;paused=true;tick(.5);paused=false;record(`vision-freezes-in-pause-${patch.start}`,player.dreamEffectTimer===before);
     tick(5.1);record(`vision-expires-${patch.start}`,player.dreamEffectTimer===0);
    }
    reset(5);initOpponents();opponents.length=1;const dreamOpp=opponents[0],clock=DREAM_PUDDLES[0];resetPolishCar(dreamOpp);dreamOpp.profile={...dreamOpp.profile,turboRate:0};dreamOpp.x=dreamOpp.baseX=dreamOpp.targetX=clock.x;dreamOpp.z=clock.start*SEGMENT_LENGTH-5;dreamOpp.speed=3600;player.z=dreamOpp.z-getPlayerContactDistance();player.x=clock.x;player.speed=3600;tick(.1);
    record('clock-vision-applies-to-both-cars',player.dreamEffectTimer>0&&dreamOpp.dreamEffectTimer>0,{player:player.dreamEffectTimer,opponent:dreamOpp.dreamEffectTimer});
    for(const index of[605,705]){
     reset(3);const obstacle=segments[index].parkedCar;player.z=index*SEGMENT_LENGTH-getPlayerContactDistance()-80;player.x=obstacle.x;player.speed=3600;tick(1/60);
     record(`parked-car-is-solid-${index}`,player.speed<2500&&player.collisionCooldown>0&&obstacle.active,{speed:player.speed,cooldown:player.collisionCooldown});
     reset(3);player.z=index*SEGMENT_LENGTH-getPlayerContactDistance()-80;player.x=-obstacle.x;player.speed=3600;tick(1/60);
     record(`parked-car-has-an-open-passing-side-${index}`,player.speed>3500&&player.collisionCooldown===0,{speed:player.speed});
    }
    for(const value of[.10,.50,.90]){
      Math.random=()=>value;reset(5);player.z=DREAM_PUDDLES[0].start*SEGMENT_LENGTH-getPlayerContactDistance()-5;player.x=DREAM_PUDDLES[0].x;player.speed=4320;tick(.05);
      record('random-clock-vision-'+value,player.dreamEffectTimer>0&&player.dreamEffectType===Math.floor(value*3),{type:player.dreamEffectType});
    }
    Math.random=()=>.25;
    reset(3);initOpponents();opponents.length=1;const parkedOpp=opponents[0];resetPolishCar(parkedOpp);parkedOpp.profile={...parkedOpp.profile,turboRate:0};parkedOpp.z=605*SEGMENT_LENGTH-80;parkedOpp.x=parkedOpp.baseX=parkedOpp.targetX=segments[605].parkedCar.x;parkedOpp.speed=3600;player.z=parkedOpp.z-9000;tick(1/60);
    record('opponents-also-collide-with-parked-cars',parkedOpp.speed<2500&&parkedOpp.collisionCooldown>0,{speed:parkedOpp.speed});
    reset(5);player.iceTimer=.4;player.dreamEffectTimer=4;startRace();record('restart-clears-new-effects',player.iceTimer===0&&player.dreamEffectTimer===0&&player.surfaceVisits.size===0);
   }finally{Math.random=random;}
   return checks;
  });
  const visuals=await page.evaluate(()=>{
   const checks=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
   const difference=(a,b)=>{let count=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])count++;return count;};
   const pixels=()=>ctx.getImageData(0,0,W,H).data;
   for(const [level,kind,index]of[[4,'substation',918],[5,'observatory',802],[5,'forest_deer',1005],[5,'reindeer_crossing',1215],[5,'deep_diver',2450],[3,'hotel',135],[3,'tennis',325],[3,'hill_mansion',490],[1,'neon_pyramid',140],[6,'asteroid_cluster',745]]){
    selectLevel(level);startRace();state='playing';opponents.length=0;player.speed=4320;player.pitch=0;chapterTime=5000;weatherParticles=[];
    const draw=drawPolishScene,random=Math.random;Math.random=()=>.5;const samples=[];
    try{for(const distance of[85,65,45,30,20,12]){
      player.z=(index-distance)*SEGMENT_LENGTH;curveCamera.look=0;for(let j=0;j<90;j++)updateCurveCamera(1/60);render(5000);const a=pixels();
      drawPolishScene=s=>{if(s.kind!==kind)draw(s);};render(5000);const b=pixels();drawPolishScene=draw;
      samples.push({distance,pixels:difference(a,b)});
    }}finally{drawPolishScene=draw;Math.random=random;}
    record(`scene-readable-in-road-view-${kind}`,samples.some(s=>s.pixels>200),samples);
   }
   selectLevel(6);startRace();state='playing';opponents.length=0;player.speed=4320;chapterTime=6000;weatherParticles=[];
   record('space-has-no-track-arches',!segments.some(s=>s.polishScenes?.some(p=>p.kind==='orbital_ring')));
   for(const [index,name]of[[300,'cruiser'],[1000,'giant']]){
    player.z=index*SEGMENT_LENGTH;curveCamera.look=0;for(let j=0;j<90;j++)updateCurveCamera(1/60);
    const draw=name==='cruiser'?drawSpaceBattlecruiser:drawSpaceGasGiant;
    render(6000);const before=pixels();
    try{if(name==='cruiser')drawSpaceBattlecruiser=()=>{};else drawSpaceGasGiant=()=>{};render(6000);}
    finally{if(name==='cruiser')drawSpaceBattlecruiser=draw;else drawSpaceGasGiant=draw;}
    const changed=difference(before,pixels());record(`space-${name}-visible-in-road-view`,changed>5000,{pixels:changed});
   }
   const hullDraw=drawNautilus,headings=[];
   try{drawNautilus=()=>{const m=ctx.getTransform();headings.push({center:m.e,bow:m.a*143+m.e,stern:m.a*-180+m.e});};drawNautilusPassage(2710,6000);drawNautilusPassage(2730,6000);}
   finally{drawNautilus=hullDraw;}
   record('nautilus-travels-bow-first',headings.length===2&&headings[1].center<headings[0].center&&headings.every(h=>h.bow<h.stern),headings);
   selectLevel(5);startRace();state='playing';opponents.length=0;player.speed=4320;player.z=2720*SEGMENT_LENGTH;chapterTime=6000;
   render(6000);const submarine=pixels(),submarineDraw=drawNautilusPassage;drawNautilusPassage=()=>{};render(6000);const withoutSubmarine=pixels();drawNautilusPassage=submarineDraw;
   record('nautilus-readable-during-crossing',difference(submarine,withoutSubmarine)>3000,{pixels:difference(submarine,withoutSubmarine)});
   selectLevel(5);startRace();state='playing';opponents.length=0;player.speed=4320;player.z=1750*SEGMENT_LENGTH;chapterTime=6000;
   const random=Math.random;Math.random=()=>.5;
   try{
    for(const type of[0,1,2]){
     player.dreamEffectTimer=0;render(6000);const before=pixels();player.dreamEffectTimer=4;player.dreamEffectType=type;render(6000);const after=pixels();
     record(`vision-${type}-strongly-changes-the-picture`,difference(before,after)>W*H*.08,{changed:difference(before,after),total:W*H});
    }
   }finally{Math.random=random;}
   return checks;
  });
  const placement=[];
  for(const width of[320,390,480]){
   await page.setViewportSize({width,height:844});
   placement.push(...await page.evaluate(()=>{
    Math.random=()=>.5;selectLevel(5);startRace();state='playing';opponents.length=0;player.speed=4320;weatherParticles=[];
    const checks=[],draw=drawPolishScene,surface=drawDreamSurfaces;
    try{for(const patch of DREAM_PUDDLES)for(const distance of[35,15]){
     const index=(patch.start+patch.end-1)/2;player.z=(index-distance)*SEGMENT_LENGTH;
     curveCamera.look=0;for(let j=0;j<90;j++)updateCurveCamera(1/60);
     let drip,center;const seams=[];
     drawPolishScene=s=>{if(s.kind==='dripping_clock'&&s.segIdx===index)drip={x:s.x+s.side*s.dripReach*s.sc,y:s.y};draw(s);};
     drawDreamSurfaces=(x1,y1,w1,x2,y2,w2,i)=>{if(i===index)center={x:x2+patch.x*w2,y:y2};if(i>patch.start+2&&i<patch.end-2)seams.push({x:x2+patch.x*w2,y:y2-.6});surface(x1,y1,w1,x2,y2,w2,i);};
     render(6000);
     const seamColors=seams.filter(p=>p.x>=1&&p.x<W-1&&p.y>=1&&p.y<H-1).map(p=>Array.from(ctx.getImageData(Math.round(p.x),Math.round(p.y),1,1).data).slice(0,3));
     checks.push({name:`clock-drips-into-puddle-center-${W}-${patch.start}-${distance}`,pass:!!drip&&!!center&&Math.hypot(drip.x-center.x,drip.y-center.y)<.01&&seamColors.every(c=>c[0]>150&&c[1]>125&&c[2]>110),actual:{drip,center,seamColors}});
    }}finally{drawPolishScene=draw;drawDreamSurfaces=surface;}
    // Compare each isolated sign with the same road view with its facade removed.
    // A facade must not paint over the billboard it stands behind.
    selectLevel(4);startRace();state='playing';opponents.length=0;weatherParticles=[];chapterTime=6000;
    const advert=drawFantasySign,facade=drawHighwayDistrictSegment,visibility=[];
    let target,enabled=true;
    drawFantasySign=(...a)=>{if(enabled&&a[3]===target)advert(...a);};
    const image=()=>ctx.getImageData(0,0,W,H).data;
    const changed=(a,b)=>{const mask=new Uint8Array(a.length/4);for(let i=0;i<a.length;i+=4)mask[i/4]=a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2];return mask;};
    try{for(const index of[46,142,270,974,1038,1102]){
      target=index;player.z=(index-35)*SEGMENT_LENGTH;curveCamera.look=0;for(let j=0;j<90;j++)updateCurveCamera(1/60);
      const masks=[];
      for(const walls of[()=>{},facade]){
        drawHighwayDistrictSegment=walls;enabled=true;render(6000);const on=image();enabled=false;render(6000);masks.push(changed(on,image()));
      }
      const expected=masks[0].reduce((a,b)=>a+b,0),visible=masks[1].reduce((n,p,i)=>n+(p&&masks[0][i]?1:0),0);
      visibility.push({index,expected,ratio:visible/expected});
    }}finally{drawFantasySign=advert;drawHighwayDistrictSegment=facade;}
    checks.push({name:`highway-facades-leave-signs-whole-${W}`,pass:visibility.every(s=>s.expected>100&&s.ratio>.97),actual:visibility});
    return checks;
   }));
  }
  await page.setViewportSize({width:390,height:844});
  for(const type of[0,1,2]){
   await page.evaluate(type=>{selectLevel(5);startRace();state='playing';player.z=1830*SEGMENT_LENGTH;player.speed=4320;chapterTime=6000;player.dreamEffectTimer=4;player.dreamEffectType=type;document.getElementById('cntNum').classList.remove('pop');updateHUD(6000);render(6000);},type);
   await page.screenshot({path:'/tmp/odyssey-filter-'+type+'.png'});
  }
  return [...checks,...visuals,...placement].map(c=>({...c,errors,pass:c.pass&&errors.length===0}));
 }finally{await page.close();}
};
