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
   record('five-islands-and-five-halved-bridges',land.length===1750&&bridge.length===875&&new Set(land.map(s=>Math.floor(s.index/PARADISE_STRIDE))).size===5,{land:land.length,bridge:bridge.length});
   const end=segments.at(-1);record('loop-closes-at-same-height-and-slope',Math.abs(end.worldY+end.hillDelta)<1e-8&&Math.abs(end.curve)<1e-5&&Math.abs(end.hillDelta)<1e-5,{});
   // Drive with actual acceleration and steering. No position/speed overrides.
   let planeContact=null;const renderSprite=drawParadiseSprite;
   drawParadiseSprite=s=>{if(s.item.kind==='plane'){const a=getParadiseArt('plane');planeContact={width:Math.min(W,s.x+(a.w-a.ox)*s.sc)-Math.max(0,s.x-a.ox*s.sc),groundDelta:s.y-segments[s.segIdx].proj_y2,height:paradisePlanePose().height};}renderSprite(s);};
   const times=[0,0],islands=[0,0,0,0,0],planeSamples=[],diveVisibility=[];let lastLap=false,hideDive=false;
   const paintLife=drawParadiseLife;drawParadiseLife=s=>{if(!hideDive||s.item.kind!=='diving_rock')paintLife(s);};
   for(let f=0;f<12000&&!player.finished;f++){
    const home=paradiseLaneBlend(player.z)/3;const visibleX=getPlayerCollisionX();keys.left=visibleX>home+.04;keys.right=visibleX<home-.04;
    const i=Math.floor(player.z/150),onBridge=i%PARADISE_STRIDE>=350;times[onBridge?1:0]+=1/60;
    if(!onBridge)islands[Math.floor(i/PARADISE_STRIDE)]+=1/60;
    advanceRaceStep(1/60);lastLap||=lastLapElapsed!==null;
    const diveAge=paradiseDiveStart===null?-1:(raceElapsed-paradiseDiveStart)/1000;
    if(diveAge>=.55&&diveAge<2.4&&f%6===0){
      hideDive=false;render(raceElapsed);const image=ctx.getImageData(0,0,W,H).data,shot=C.toDataURL();
      hideDive=true;render(raceElapsed);const baseline=ctx.getImageData(0,0,W,H).data;hideDive=false;
      let changed=0;for(let i=0;i<image.length;i+=4)if(Math.max(Math.abs(image[i]-baseline[i]),Math.abs(image[i+1]-baseline[i+1]),Math.abs(image[i+2]-baseline[i+2]))>10)changed++;
      diveVisibility.push({age:diveAge,changed});
      if(changed>20&&diveAge>1.1&&diveAge<1.3)shots.push({name:'visible-cliff-dive',image:shot});
      if(changed>20&&diveAge>2.1&&diveAge<2.35)shots.push({name:'visible-dive-splash',image:shot});
    }
    if(paradisePlanePose()?.landed&&!planeContact){render(raceElapsed);shots.push({name:'jumbo-touchdown',image:C.toDataURL()});}
    if(f%15===0&&paradisePlane.elapsed!==null&&paradisePlane.elapsed<6)planeSamples.push({segment:player.z/150,...paradisePlanePose()});
   }
   drawParadiseSprite=renderSprite;drawParadiseLife=paintLife;
   const flight=diveVisibility.filter(s=>s.age<1.75),splash=diveVisibility.filter(s=>s.age>=1.8);
   record('cliff-dive-survives-foreground-occlusion',flight.filter(s=>s.changed>15).length>=6,{flight});
   record('dive-splash-is-visible-after-road-and-rails',splash.filter(s=>s.changed>10).length>=3,{splash});
   record('jumbo-touchdown-visible-on-runway',planeContact&&planeContact.width>80&&planeContact.height===0&&Math.abs(planeContact.groundDelta)<.01,planeContact);
   clearTimeout(resultTimer);resultTimer=null;
   record('normal-driving-finishes-in-90-to-100-seconds',player.finished&&raceElapsed>=90000&&raceElapsed<=100000,{seconds:raceElapsed/1000,times,islands});
   record('one-lap-finish-without-last-lap-banner',player.lap===2&&raceLapCount()===1&&player.finishTime>0&&!lastLap,{lap:player.lap,finish:player.finishTime,lastLap});
   const crossing=planeSamples.find(p=>p.x>=0),landing=planeSamples.find(p=>p.landed);
   record('jumbo-crosses-then-lands-before-driver-passes',crossing&&landing&&crossing.segment<landing.segment&&landing.segment<PARADISE_PLANE_SEGMENT&&crossing.height>0&&landing.height===0&&landing.x>4.8,{crossing,landing});
   selectLevel(7);startRace();state='playing';
   record('restart-resets-approach-event',paradisePlane.elapsed===null&&paradiseDiveStart===null,{});
   player.z=(PARADISE_PLANE_SEGMENT-204)*150;updateParadisePlane(1/60);const pose=paradisePlanePose();
   render(3000);render(9000);record('rendering-does-not-advance-plane-while-paused',JSON.stringify(pose)===JSON.stringify(paradisePlanePose()),{});
   selectLevel(7);startRace();state='playing';opponents=[];
   player.z=(PARADISE_PLANE_SEGMENT-207)*150;player.speed=4320;player.cleanSpeedBonus=.2;player.boosts=3;resetNormalPace(player);
   let fastCrossing=null,fastLanding=null;
   for(let f=0;f<1000&&player.z<PARADISE_PLANE_SEGMENT*150;f++){
    keys.boost=!player.isBoosting;keys.left=keys.right=false;advanceRaceStep(1/120);
    const p=paradisePlanePose();if(p&&p.x>=0&&!fastCrossing)fastCrossing=player.z/150;
    if(p?.landed&&!fastLanding)fastLanding=player.z/150;
   }
   record('late-turbo-still-sees-crossing-and-touchdown',fastCrossing>PARADISE_PLANE_SEGMENT-207&&fastLanding<PARADISE_PLANE_SEGMENT,{fastCrossing,fastLanding});
   player.isBoosting=false;player.boostTimer=0;keys.boost=false;
   // Actual screen bounds at a useful approach, not just scene metadata.
   const views=[['lagoon',95,48],['waterfall',905,840],['airport',1625,1550],['airport-gate',1472,1430],['airport-sign',1440,1397],['harbour',2218,2168],['fish-market',2130,2080],['boat-shed',2220,2160],['quay-crane',2275,2210],['port-fishing-boat',2305,2235],['coral-arch',2850,2780],['bridge',2540,2480],['market',145,90],['village',225,170],['regatta',480,400],['ferry',1895,1800],['volleyball',2990,2930],['sea-stack',1180,1110],['fishing-dock',195,135],['hangar',1450,1390],['clock-tower',2310,2250],['resort',2875,2815],['beach-stage',3070,3010]];
   const draw=drawParadiseSprite;let capture=null;
   drawParadiseSprite=s=>{if(capture&&s.segIdx===capture.index){const a=getParadiseArt(s.item.kind,s.variant);capture.bounds=[s.x-a.ox*s.sc,s.y-a.oy*s.sc,s.x+(a.w-a.ox)*s.sc,Math.min(s.y,s.clipY)];}draw(s);};
   try{for(const [name,authored,approach]of views){
    const index=paradiseIndex(authored),at=paradiseIndex(approach);
    player.z=(at+.3)*150;player.speed=4320;player.x=0;player.pitch=segments[at].hillDelta;player.fovOffset=0;player.lap=1;player.finished=false;curveCamera.look=0;for(let j=0;j<60;j++)updateCurveCamera(1/60);
    capture={index};render(4000);const b=capture.bounds,width=b?Math.min(W,b[2])-Math.max(0,b[0]):0,height=b?Math.min(H,b[3])-Math.max(0,b[1]):0;
    record('visible-landmark-'+name,width>25&&height>25,{width,height,index,at});shots.push({name,image:C.toDataURL()});
   }}finally{drawParadiseSprite=draw;}
   // The nearby volleyball animation advances with race time, not render time.
   player.z=(paradiseIndex(2930)+.3)*150;player.x=0;player.pitch=0;curveCamera.look=0;
   for(let j=0;j<60;j++)updateCurveCamera(1/60);
   const sample=()=>{const data=ctx.getImageData(0,Math.floor(H*.4),W,Math.floor(H*.3)).data;let hash=2166136261;for(let i=0;i<data.length;i++)hash=Math.imul(hash^data[i],16777619);return hash;};
   raceElapsed=1000;render(4000);const first=sample();render(4000);const paused=sample();
   raceElapsed=2000;render(4000);const animated=sample();
   record('beach-animation-uses-simulation-time',first===paused&&first!==animated,{first,paused,animated});
   // Verify the visible wheel and impact pool, not only the scene clock.
   for(const kind of['ferry','waterfall','diving_rock','quay_crane','boat_shed','fish_market']){
    const sc=kind==='ferry'?.45:kind==='boat_shed'?.5:.7,x=W/2,y=H*.8;
    const sprite={item:{kind},variant:0,x,y,sc,depth:30,clipY:H};
    if(kind==='diving_rock')paradiseDiveStart=0;
    const region=kind==='ferry'?[-5,-105,124,126]:kind==='diving_rock'?[-180,-200,220,220]:kind==='quay_crane'?[-180,-230,150,230]:kind==='boat_shed'?[-100,-80,200,80]:kind==='fish_market'?[-130,-60,260,60]:[-100,-55,200,55];
    const imageAt=time=>{
      raceElapsed=time;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#278caa';ctx.fillRect(0,0,W,H);
      drawParadiseSprite(sprite);
      const data=ctx.getImageData(Math.floor(x+region[0]*sc),Math.floor(y+region[1]*sc),Math.ceil(region[2]*sc),Math.ceil(region[3]*sc)).data;
      let hash=2166136261;for(let i=0;i<data.length;i++)hash=Math.imul(hash^data[i],16777619);
      ctx.restore();return hash;
    };
    const first=imageAt(1000),paused=imageAt(1000),moving=imageAt(1500);
    record(kind+'-detail-moves-and-freezes-with-simulation',first===paused&&first!==moving,{first,paused,moving});
    shots.push({name:kind+'-detail',image:C.toDataURL()});
   }
   // Both carriageways pass through the new arch; the pillars stop offroad cars.
   for(const [name,index]of[['rock-aperture',PARADISE_ARCH_SEGMENT],['airport-gate',PARADISE_GATE_SEGMENT]]){
    const passes=[];
    for(const lane of[-1,-1/3,1/3,1]){
     selectLevel(7);startRace();state='playing';opponents=[];paradiseTraffic=[];
     player.z=(index-30)*150;player.x=lane;player.speed=4320;player.cleanSpeedBonus=.2;resetNormalPace(player);
     let minimum=4320,steps=0;
     while(player.z<(index+10)*150&&steps++<500){
       const visibleX=getPlayerCollisionX();keys.left=visibleX>lane+.025;keys.right=visibleX<lane-.025;
       advanceRaceStep(1/120);minimum=Math.min(minimum,player.speed);
     }
     passes.push({lane,minimum,passed:player.z>(index+10)*150});
    }
    record('all-four-lanes-drive-through-'+name,passes.every(p=>p.passed&&p.minimum>4300),{passes});
   }
   selectLevel(7);startRace();state='playing';
   const archContacts=[];
   for(const car of[player,...opponents])for(const side of[-1,1]){
    car.z=PARADISE_ARCH_SEGMENT*150;car.x=side*1.7;car.speed=3600;car.wallHitCooldown=0;car.wallContactSide=0;
    applyRoadContact(1/60,side*2,car);archContacts.push({x:car.x,speed:car.speed});
   }
   record('arch-supports-bound-offroad-travel',archContacts.every(c=>Math.abs(c.x)<1.3&&c.speed<3600),{archContacts});
   // Sample unmarked central asphalt, away from car and lane markings.
   player.z=1180.3*150;player.x=0;player.pitch=0;curveCamera.look=0;opponents=[];render(4000);
   const colors=[];for(let y=505;y<600;y++)colors.push([...ctx.getImageData(W/2,y,1,1).data].slice(0,3));
   const jumps=colors.slice(1).map((c,i)=>Math.max(...c.map((v,k)=>Math.abs(v-colors[i][k]))));
   record('no-horizontal-asphalt-seams',Math.max(...jumps)<5,{largestRowJump:Math.max(...jumps)});
   let writes=0;const original={},proto=CanvasRenderingContext2D.prototype;
   for(const name of['fill','stroke','fillRect','clearRect','drawImage']){original[name]=proto[name];proto[name]=function(...args){if(this.canvas!==C)writes++;return original[name].apply(this,args);};}
   try{for(let f=0;f<50;f++){player.z=(f*50+.3)*150;player.pitch=segments[Math.floor(player.z/150)].hillDelta;render(5000+f*16);}}finally{for(const name of Object.keys(original))proto[name]=original[name];}
   const bytes=[...paradiseArt.values()].reduce((n,a)=>n+a.canvas.width*a.canvas.height*4,0);
   record('scenery-cache-stays-immutable-and-under-fourteen-mib',writes===0&&bytes<14*1048576,{writes,MiB:bytes/1048576,tiles:paradiseArt.size});
   const limits=getRoadLimits(400*150);record('bridge-parapets-stop-player-and-opponents',limits.left>1.2&&limits.left<1.3&&limits.right===limits.left,{limits});
   const contacts=[];
   for(const car of[player,...opponents]){car.z=400*150;car.x=1.5;car.speed=3600;car.wallHitCooldown=0;car.wallContactSide=0;applyRoadContact(1/60,2,car);contacts.push({x:car.x,speed:car.speed});}
   record('physical-contact-cannot-cross-parapet',contacts.every(c=>Math.abs(c.x-limits.right)<1e-8&&c.speed<3600),{contacts});
   // Full field: same AI, contact model, finish timestamps and menu return.
   let seed=1989;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
   selectLevel(7);startRace();state='playing';let frames=0;
   for(;frames<24000&&(!player.finished||opponents.some(c=>c.finishTime==null));frames++){
    const ahead=opponents.filter(c=>!racerFinished(c)&&c.z>player.z&&c.z-player.z<2400).sort((a,b)=>a.z-b.z)[0];
    const twoWay=paradiseLaneBlend(player.z),normal=ahead?(ahead.x>.05?-.6:.6):0;
    const target=normal*(1-twoWay)+(ahead?(ahead.x>.65?1/3:1):1/3)*twoWay;
    const visibleX=getPlayerCollisionX();keys.left=visibleX>target+.045;keys.right=visibleX<target-.045;advanceRaceStep(1/120);
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
