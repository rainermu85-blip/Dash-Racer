// First-lap race integration, visible landmarks, approach-triggered landing and
// immutable scenery textures. Does not modify the production game state file.
module.exports=async function assessParadise(browser,baseUrl,output){
 const fs=require('node:fs'),path=require('node:path'),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>{window.__nativeRAF=requestAnimationFrame.bind(window);requestAnimationFrame=()=>0;});
  await page.goto(baseUrl);await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   selectLevel(7);startRace();state='playing';opponents=[];
   for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';
   const checks=[],shots=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
   const land=segments.filter(s=>!s.isBridge),bridge=segments.filter(s=>s.isBridge);
   record('five-equal-islands-half-the-route-on-bridges',land.length===1750&&bridge.length===1750&&new Set(land.map(s=>Math.floor(s.index/700))).size===5,{land:land.length,bridge:bridge.length});
   const end=segments.at(-1);record('loop-closes-at-same-height-and-slope',Math.abs(end.worldY+end.hillDelta)<1e-8&&Math.abs(end.curve)<1e-5&&Math.abs(end.hillDelta)<1e-5,{});
   // Drive with actual acceleration and steering. No position/speed overrides.
   const times=[0,0],islands=[0,0,0,0,0],planeSamples=[];let lastLap=false;
   for(let f=0;f<12000&&!player.finished;f++){
    keys.left=player.x>.025;keys.right=player.x<-.025;
    const i=Math.floor(player.z/150),onBridge=i%700>=350;times[onBridge?1:0]+=1/60;
    if(!onBridge)islands[Math.floor(i/700)]+=1/60;
    advanceRaceStep(1/60);lastLap||=lastLapElapsed!==null;
    if(f%15===0&&paradisePlane.elapsed!==null&&paradisePlane.elapsed<6)planeSamples.push({segment:player.z/150,...paradisePlanePose()});
   }
   clearTimeout(resultTimer);resultTimer=null;
   record('normal-driving-finishes-in-120-to-130-seconds',player.finished&&raceElapsed>=120000&&raceElapsed<=130000,{seconds:raceElapsed/1000,times,islands});
   record('one-lap-finish-without-last-lap-banner',player.lap===2&&raceLapCount()===1&&player.finishTime>0&&!lastLap,{lap:player.lap,finish:player.finishTime,lastLap});
   const crossing=planeSamples.find(p=>p.x>=0),landing=planeSamples.find(p=>p.landed);
   record('jumbo-crosses-then-lands-before-driver-passes',crossing&&landing&&crossing.segment<landing.segment&&landing.segment<1590&&crossing.height>0,{crossing,landing});
   selectLevel(7);startRace();state='playing';
   record('restart-resets-approach-event',paradisePlane.elapsed===null,{});
   player.z=1456*150;updateParadisePlane(1/60);const pose=paradisePlanePose();
   render(3000);render(9000);record('rendering-does-not-advance-plane-while-paused',JSON.stringify(pose)===JSON.stringify(paradisePlanePose()),{});
   selectLevel(7);startRace();state='playing';opponents=[];
   player.z=1453*150;player.speed=4320;player.cleanSpeedBonus=.2;player.boosts=3;resetNormalPace(player);
   let fastCrossing=null,fastLanding=null;
   for(let f=0;f<1000&&player.z<1590*150;f++){
    keys.boost=!player.isBoosting;keys.left=keys.right=false;advanceRaceStep(1/120);
    const p=paradisePlanePose();if(p&&p.x>=0&&!fastCrossing)fastCrossing=player.z/150;
    if(p?.landed&&!fastLanding)fastLanding=player.z/150;
   }
   record('late-turbo-still-sees-crossing-and-touchdown',fastCrossing>1453&&fastLanding<1590,{fastCrossing,fastLanding});
   player.isBoosting=false;player.boostTimer=0;keys.boost=false;
   // Actual screen bounds at a useful approach, not just scene metadata.
   const views=[['lagoon',95,48],['waterfall',905,840],['airport',1625,1550],['harbour',2208,2168],['coral-arch',2850,2780],['bridge',2540,2480]];
   const draw=drawParadiseSprite;let capture=null;
   drawParadiseSprite=s=>{if(capture&&s.segIdx===capture.index){const a=getParadiseArt(s.item.kind,s.variant);capture.bounds=[s.x-a.ox*s.sc,s.y-a.oy*s.sc,s.x+(a.w-a.ox)*s.sc,Math.min(s.y,s.clipY)];}draw(s);};
   try{for(const [name,index,at]of views){
    player.z=(at+.3)*150;player.speed=4320;player.x=0;player.pitch=segments[at].hillDelta;player.fovOffset=0;player.lap=1;player.finished=false;curveCamera.look=0;for(let j=0;j<60;j++)updateCurveCamera(1/60);
    capture={index};render(4000);const b=capture.bounds,width=b?Math.min(W,b[2])-Math.max(0,b[0]):0,height=b?Math.min(H,b[3])-Math.max(0,b[1]):0;
    record('visible-landmark-'+name,width>25&&height>25,{width,height,index,at});shots.push({name,image:C.toDataURL()});
   }}finally{drawParadiseSprite=draw;}
   // Sample unmarked central asphalt, away from car and lane markings.
   player.z=400.3*150;player.x=0;player.pitch=0;curveCamera.look=0;opponents=[];render(4000);
   const colors=[];for(let y=505;y<600;y++)colors.push([...ctx.getImageData(W/2,y,1,1).data].slice(0,3));
   const jumps=colors.slice(1).map((c,i)=>Math.max(...c.map((v,k)=>Math.abs(v-colors[i][k]))));
   record('no-horizontal-asphalt-seams',Math.max(...jumps)<5,{largestRowJump:Math.max(...jumps)});
   let writes=0;const original={},proto=CanvasRenderingContext2D.prototype;
   for(const name of['fill','stroke','fillRect','clearRect','drawImage']){original[name]=proto[name];proto[name]=function(...args){if(this.canvas!==C)writes++;return original[name].apply(this,args);};}
   try{for(let f=0;f<50;f++){player.z=(f*68+.3)*150;player.pitch=segments[Math.floor(player.z/150)].hillDelta;render(5000+f*16);}}finally{for(const name of Object.keys(original))proto[name]=original[name];}
   const bytes=[...paradiseArt.values()].reduce((n,a)=>n+a.canvas.width*a.canvas.height*4,0);
   record('scenery-cache-stays-immutable-and-under-six-mib',writes===0&&bytes<6*1048576,{writes,MiB:bytes/1048576,tiles:paradiseArt.size});
   const limits=getRoadLimits(400*150);record('bridge-parapets-stop-player-and-opponents',limits.left<1&&limits.right<1,{limits});
   const contacts=[];
   for(const car of[player,...opponents]){car.z=400*150;car.x=1.3;car.speed=3600;car.wallHitCooldown=0;car.wallContactSide=0;applyRoadContact(1/60,2,car);contacts.push({x:car.x,speed:car.speed});}
   record('physical-contact-cannot-cross-parapet',contacts.every(c=>c.x===.88&&c.speed<3600),{contacts});
   // Full field: same AI, contact model, finish timestamps and menu return.
   let seed=1989;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
   selectLevel(7);startRace();state='playing';let frames=0;
   for(;frames<24000&&(!player.finished||opponents.some(c=>c.finishTime==null));frames++){
    const ahead=opponents.filter(c=>!racerFinished(c)&&c.z>player.z&&c.z-player.z<2400).sort((a,b)=>a.z-b.z)[0];
    const target=ahead?(ahead.x>.05?-.6:.6):0;
    keys.left=player.x>target+.04;keys.right=player.x<target-.04;advanceRaceStep(1/120);
   }
   clearTimeout(resultTimer);resultTimer=null;updateHUD(0);
   record('six-racers-finish-single-lap-with-real-times',[player,...opponents].every(c=>c.finishTime>0&&c.lap>=2),{seconds:raceElapsed/1000,times:getRaceStandings().map(c=>({name:c.driverTag,time:c.finishTime}))});
   state='result';renderScoreboard();record('scoreboard-has-six-times-and-correct-level',document.querySelectorAll('.results-table tbody tr').length===6&&document.querySelector('.result-course').textContent==='PARADISE CIRCUIT',{});
   document.getElementById('continueBtn').click();record('continue-returns-to-level-selection',state==='intro'&&!!document.getElementById('lvl7Btn')&&!!document.getElementById('startBtn'),{});
   for(const level of LEVELS){selectLevel(level.id);record('lap-count-level-'+level.id,raceLapCount()===(level.id===5||level.id===7?1:3),{laps:raceLapCount()});}
   return{checks,shots};
  });
  for(const shot of result.shots)fs.writeFileSync(path.join(output,`paradise-${shot.name}.png`),Buffer.from(shot.image.split(',')[1],'base64'));
  return result.checks.map(c=>({...c,errors,pass:c.pass&&!errors.length}));
 }finally{await page.close();}
};
