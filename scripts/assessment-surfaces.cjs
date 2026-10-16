// Surface edge contacts, stronger skids and depth-ordered marine parallax.
module.exports=async function runSurfaces(browser,baseUrl){
 const results=[];
 for(const viewport of[{width:320,height:640},{width:390,height:844},{width:480,height:800}]){
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
   await page.evaluate(async()=>{await document.fonts.ready;introScreen.style.display='none';});
   const checks=await page.evaluate(()=>{
    const checks=[],record=(name,pass,actual)=>checks.push({name:`surfaces-${W}-${name}`,pass,actual});let time=1000;
    const reset=(flat=true)=>{selectLevel(5);startRace();state='playing';lastTime=time;smoothedDt=1/60;opponents.length=0;keys.left=keys.right=keys.boost=false;cntNum.style.display='none';weatherParticles=[];for(const s of segments){s.pylon=s.barrier=s.lightning=null;if(flat)s.curve=s.hillDelta=s.worldY=0;}player.pitch=player.x=player.steerLean=0;curveCamera.look=0;};
    const tick=(seconds,fps=60)=>{const draw=render;render=()=>{};try{for(let n=0;n<Math.round(seconds*fps);n++){time+=1000/fps;loop(time);}}finally{render=draw;}};
    const random=Math.random;Math.random=()=>.25;
    try{
     // Compare actual painted surface columns, with the player hidden, to the
     // contact decision. Unlike a color threshold, this also survives the vignette.
     for(const [kind,patches]of[['ice',DREAM_ICE],['clock',DREAM_PUDDLES]])for(const patch of patches){
      reset(false);player.speed=0;let anchor=null;
      const measure=()=>{const foot=getPlayerChevronFootprint();return getPlayerSurfaceOverlap(patch,kind,foot,getPlayerRoadProjection(foot).projected);};
      for(let offset=-12;offset<3&&!anchor;offset+=.5){
       player.z=(patch.start+offset)*SEGMENT_LENGTH;
       player.pitch=Array.from({length:20},(_,j)=>getSeg(player.z+j*SEGMENT_LENGTH).hillDelta).reduce((a,b)=>a+b,0)/20;
       curveCamera.look=0;for(let j=0;j<80;j++)updateCurveCamera(1/60);
       for(let x=-1.1;x<=1.1;x+=.05){player.x=x;if(measure()>.5){anchor={z:player.z,pitch:player.pitch,look:curveCamera.look};break;}}
      }
      if(!anchor){record(`${kind}-${patch.start}-visible-anchor`,false);continue;}
      // Move fully into the footprint band; a subpixel leading edge cannot
      // be classified reliably by a raster oracle.
      player.z+=SEGMENT_LENGTH;anchor.z=player.z;
      const candidates=[];
      for(let x=-1.1;x<=1.101;x+=.0015){player.x=x;const ratio=measure();if(ratio>.025&&ratio<.08)candidates.push({x,ratio});}
      for(const above of[false,true]){
       const sample=candidates.filter(p=>above?p.ratio>.065&&p.ratio<.08:p.ratio>.025&&p.ratio<.035).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x))[0];
       if(!sample){record(`${kind}-${patch.start}-${above?'above':'below'}-sample`,false);continue;}
       player.x=sample.x;const foot=getPlayerChevronFootprint(),surface=drawDreamSurfaces,car=drawCarSprite;
       let before,after;
       drawCarSprite=(...a)=>{if(!a[4])car(...a);};
       try{drawDreamSurfaces=()=>{};render(6000);before=ctx.getImageData(0,0,W,H).data;drawDreamSurfaces=surface;render(6000);after=ctx.getImageData(0,0,W,H).data;}
       finally{drawDreamSurfaces=surface;drawCarSprite=car;}
       let painted=0;const left=Math.max(0,Math.ceil(foot.left)),right=Math.min(W-1,Math.floor(foot.right));
       for(let x=left;x<=right;x++)for(let y=Math.max(0,Math.ceil(foot.top));y<=Math.min(H-1,Math.floor(foot.bottom));y++){
        const i=(y*W+x)*4;if(Math.abs(after[i]-before[i])+Math.abs(after[i+1]-before[i+1])+Math.abs(after[i+2]-before[i+2])>18){painted++;break;}
       }
       const raster=painted/foot.width;
       checkPolishContacts(player,{x:player.x,z:player.z+getPlayerContactDistance()},{x:player.x,z:player.z+getPlayerContactDistance()});
       const triggered=kind==='ice'?player.iceTimer>0:player.dreamEffectTimer===5;
       record(`${kind}-${patch.start}-${above?'above':'below'}-five-percent`,triggered===above&&(above?raster>=.05:raster<.05),{ratio:sample.ratio,raster,triggered,x:sample.x});
       resetPolishCar(player);player.z=anchor.z;player.pitch=anchor.pitch;curveCamera.look=anchor.look;
      }
     }
     // Opponents use the same five percent of their own drawn width, swept
     // through the full movement, rather than a broad rectangular puddle box.
     reset();
     for(const [kind,patches]of[['ice',DREAM_ICE],['clock',DREAM_PUDDLES]])for(const patch of patches){
      const width=getOpponentSurfaceWidth(),z=(patch.start+patch.end+1)/2*SEGMENT_LENGTH,r=kind==='ice'?.485:.32;
      for(const fraction of[.04,.06]){
       const car={x:patch.x+r+width*(.5-fraction),z,finished:false};resetPolishCar(car);
       checkPolishContacts(car,{x:car.x,z},{x:car.x,z:z+1});
       const hit=kind==='ice'?car.iceTimer>0:car.dreamEffectTimer>0;
       record(`opponent-${kind}-${patch.start}-${fraction}`,hit===(fraction>.05),{hit,width});
      }
      if(kind==='clock'){
       const nearTip={x:patch.x+.28+width*.44,z:patch.start*SEGMENT_LENGTH+1};
       record(`clock-${patch.start}-taper-is-passable`,!sweepDreamSurface(nearTip,{...nearTip,z:nearTip.z+1},patch,kind,width));
       const from={x:patch.x+.32+width*.44,z:(patch.start-1)*SEGMENT_LENGTH},to={...from,z:(patch.end+2)*SEGMENT_LENGTH};
       record(`clock-${patch.start}-fast-edge-crossing-is-swept`,sweepDreamSurface(from,to,patch,kind,width));
      }
     }
     for(const fps of[30,60,120])for(const [kind,patches]of[['ice',DREAM_ICE],['clock',DREAM_PUDDLES]])for(const patch of patches){
      reset();Math.random=()=>.25;smoothedDt=1/fps;player.z=(patch.start-18)*SEGMENT_LENGTH;player.x=patch.x;
      player.speed=5940;player.isBoosting=true;player.boostTimer=10;player.fovOffset=-.4;
      for(let n=0;n<200&&!player.surfaceVisits.has(kind+patch.start);n++)tick(1/fps,fps);
      record(`${kind}-${patch.start}-turbo-crossing-${fps}`,player.surfaceVisits.has(kind+patch.start),{z:player.z/SEGMENT_LENGTH,timer:kind==='ice'?player.iceTimer:player.dreamEffectTimer});
     }
     const skids=[];
     for(const fps of[30,60,120])for(const direction of[-1,1]){
      reset();Math.random=()=>direction<0?.25:.75;smoothedDt=1/fps;
      const patch=DREAM_ICE[0];player.x=patch.x;player.z=patch.start*SEGMENT_LENGTH-getPlayerContactDistance()-5;player.speed=4320;player.cleanSpeedBonus=.2;
      for(let n=0;n<15&&player.iceTimer===0;n++)tick(1/fps,fps);
      const start=player.x;tick(.2,fps);const shift=player.x-start;tick(.35,fps);
      skids.push({fps,direction,shift,end:player.x,speed:player.speed,wall:player.wallContactSide});
      record(`ice-${fps}-${direction}-fast-random-breakout`,shift*direction>.45,{shift});
      record(`ice-${fps}-${direction}-control-recovers`,player.iceTimer===0&&polishSteeringGrip(player)===1);
      record(`ice-${fps}-${direction}-edge-or-lucky-inward`,direction<0?Math.abs(player.x)>=.94&&player.speed<3600:Math.abs(player.x)<.94,{x:player.x,speed:player.speed});
     }
     record('ice-displacement-frame-rate-consistent',[-1,1].every(d=>{const values=skids.filter(s=>s.direction===d).map(s=>s.shift);return Math.max(...values)-Math.min(...values)<.08;}),skids);
     for(const direction of[-1,1]){
      reset();Math.random=()=>direction<0?.25:.75;initOpponents();opponents.length=1;
      const opp=opponents[0],patch=DREAM_ICE[1];resetPolishCar(opp);opp.profile={...opp.profile,turboRate:0};
      opp.z=patch.start*SEGMENT_LENGTH-5;opp.x=opp.baseX=opp.targetX=patch.x;opp.speed=4320;
      player.z=opp.z-9000;player.speed=4320;player.cleanSpeedBonus=.2;
      let peak=opp.x;for(let n=0;n<34;n++){tick(1/60);peak=Math.max(peak,opp.x);}
      record(`opponent-ice-${direction}-same-strong-skid-and-limits`,opp.iceTimer===0&&(direction>0?peak>1.3&&peak<=1.45:Math.abs(opp.x)<.94),{peak,x:opp.x,speed:opp.speed});
     }
     Math.random=()=>.5;reset();
     const capture=index=>{
      player.z=index*SEGMENT_LENGTH;const calls={},saved={whale:drawWhale,manta:drawManta,shark:drawReefShark,fish:drawFishSchool,squid:drawSquid,sub:drawNautilusInWater};
      const collect=(name,draw)=>(x,...args)=>{(calls[name]??=[]).push(x);draw(x,...args);};
      drawWhale=collect('whale',saved.whale);drawManta=collect('manta',saved.manta);drawReefShark=collect('shark',saved.shark);drawFishSchool=collect('fish',saved.fish);drawSquid=collect('squid',saved.squid);drawNautilusInWater=collect('sub',saved.sub);
      try{render(6000);}finally{drawWhale=saved.whale;drawManta=saved.manta;drawReefShark=saved.shark;drawFishSchool=saved.fish;drawSquid=saved.squid;drawNautilusInWater=saved.sub;}
      return calls;
     };
     const wrapped=(a,b,span)=>((b-a+span*1.5)%span)-span*.5;
     for(const index of[2500,2700]){
      bgOffset=0;const a=capture(index);bgOffset=100;const b=capture(index);bgOffset=-100;const c=capture(index);
      const motion=Object.keys(a).map(name=>({name,right:wrapped(a[name][0],b[name][0],name==='sub'?W+440*Math.min(W,H)/460:W*3.2),left:wrapped(a[name][0],c[name][0],name==='sub'?W+440*Math.min(W,H)/460:W*3.2)}));
      record(`marine-${index}-all-animals-pan-with-turn-direction`,motion.every(m=>m.right<-10&&m.left>10),motion);
      record(`marine-${index}-depth-ordered`,Math.abs(motion.find(m=>m.name==='fish').right)>Math.abs(motion.find(m=>m.name==='whale').right)*2,motion);
      if(index===2500)record('large-squid-now-has-parallax',a.squid.length===3&&Math.abs(wrapped(a.squid[2],b.squid[2],W+440*Math.min(W,H)/460)+40)<.01);
     }
     const marineFrames=[];
     for(const fps of[30,60,120])for(const curve of[-.35,0,.35]){
      reset();for(const s of segments)s.curve=curve;player.z=2500*SEGMENT_LENGTH;player.speed=4320;player.cleanSpeedBonus=.2;smoothedDt=1/fps;tick(.1,fps);
      marineFrames.push({fps,curve,offset:bgOffset});
     }
     record('marine-pan-uses-signed-driving-curves',marineFrames.every(m=>m.curve===0?m.offset===0:m.offset*m.curve>0),marineFrames);
     selectLevel(3);startRace();
     record('estate-cars-have-distinct-models',segments[605].parkedCar.model==='suv'&&segments[705].parkedCar.model==='coupe');
     const countach=drawCarSprite,models=[];let lambos=0;drawCarSprite=()=>lambos++;const estate=drawEstateCar;drawEstateCar=(model,...args)=>{models.push(model);estate(model,...args);};
     try{for(const seed of[605,705])drawSunsetScene('parked_car',seed,0);for(const seed of[173,369,487,817,1055])drawSunsetScene('driveway_car',seed,0);}
     finally{drawCarSprite=countach;drawEstateCar=estate;}
     record('estate-props-use-three-logo-free-skins',lambos===0&&new Set(models).size===3,{models,lambos});
    }finally{Math.random=random;}
    return checks;
   });
   results.push(...checks.map(c=>({...c,errors,pass:c.pass&&errors.length===0})));
  }finally{await page.close();}
 }
 return results;
};
