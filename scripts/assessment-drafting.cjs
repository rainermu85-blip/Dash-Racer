// Slipstream qualification, interruptions and contact cancellation in Chromium.
module.exports=async function runDrafting(browser,baseUrl){
 const results=[];
 for(const viewport of[{width:320,height:640},{width:390,height:844},{width:480,height:800}]){
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
   await page.evaluate(async()=>{await document.fonts.ready;introScreen.style.display='none';});
   const checks=await page.evaluate(()=>{
    const checks=[],record=(name,pass,actual)=>checks.push({name:`draft-${W}-${name}`,pass,actual});let time=1000;
    const random=Math.random,draw=render;Math.random=()=>.99;render=()=>{};
    const reset=(level=1,fps=60)=>{selectLevel(level);startRace();state='playing';lastTime=time;smoothedDt=1/fps;opponents.length=0;panelStarts=[];player.accel=900;player.z=300*SEGMENT_LENGTH;player.speed=3600;player.x=player.pitch=player.steerLean=0;curveCamera.look=0;cntNum.style.display='none';keys.left=keys.right=keys.boost=false;weatherParticles=[];for(const s of segments)s.curve=s.hillDelta=s.worldY=0;for(const s of segments)s.pylon=s.barrier=s.lightning=null;};
    const addCar=(x,z)=>{const car={x,baseX:x,targetX:x,z,lap:1,speed:3600,maxSpeed:3600,cleanSpeedBonus:0,color:'#ff4466',oppIdx:0,timeInLane:0,profile:{pace:1,accel:1,buildTime:1e9,turboRate:0},isBoosting:false,boostTimer:0,isChevronBoosting:false,chevronBoostTimer:0,chevronDecisions:{},energyBallsCollected:0,collisionCooldown:0,contactAxis:null,attackTimer:0,attackCooldown:999,chasing:false,racePace:3600,tailTime:0,attackLane:null,chaseLane:null};resetPolishCar(car);resetDraftCar(car);opponents.push(car);return car;};
    const leader=(gap=1.25,offset=0,follower=player)=>addCar(follower.x+offset,getDraftPosition(follower).z+(1+gap)*getDraftDimensions().length);
    const qualify=(seconds,fps=120)=>{for(let i=0;i<Math.round(seconds*fps);i++){const cars=[player,...opponents],before=prepareDraftStep(cars);updateDrafting(cars,before,1/fps);}};
    const prime=()=>{const cars=[player,...opponents];updateDrafting(cars,prepareDraftStep(cars),0);};
    const tick=(seconds,fps=60)=>{for(let n=0;n<Math.round(seconds*fps);n++){
      // Hold an isolated AI's chosen lane. Acceleration, boost, contacts and
      // slipstream timing still run through the normal game loop.
      for(const opp of opponents)opp.baseX=-Math.sin(opp.z*.0015+opp.color.charCodeAt(1))*.15;
      time+=1000/fps;loop(time);
    }};
    try{
     for(const fps of[30,60,120]){
      reset(1,fps);leader();prime();qualify(2.5-1/fps,fps);const early=player.draftTimer;qualify(1/fps,fps);
      record(`exact-two-and-a-half-seconds-${fps}`,early===0&&player.draftTimer===2,{early,timer:player.draftTimer});
      player.x=.7;opponents.length=0;qualify(1,fps);
      record(`can-leave-wake-after-trigger-${fps}`,Math.abs(player.draftTimer-1)<1e-8&&player.draftCharge===0,{timer:player.draftTimer});
      qualify(1,fps);record(`ends-after-two-seconds-${fps}`,player.draftTimer===0&&player.draftCharge===0);
     }
     for(const axis of['left','right','near','far']){
      reset();const lead=leader();prime();qualify(2.4);const before=player.draftCharge,size=getDraftDimensions(),valid={x:lead.x,z:lead.z};
      if(axis==='left'||axis==='right')lead.x=(axis==='left'?-1:1)*(size.width*.2+.00001);
      else lead.z=getDraftPosition(player).z+size.length*(axis==='near'?1.49999:3.00001);
      qualify(1/120);const cleared=player.draftCharge===0&&player.draftTimer===0;
      Object.assign(lead,valid);prime();qualify(.2);
      record(`one-physics-step-${axis}-resets-counter`,before>2.3&&cleared&&player.draftTimer===0&&player.draftCharge<.21,{before,cleared,charge:player.draftCharge});
     }
     for(const gap of[.5,2])for(const side of[-1,1]){
      reset();leader(gap,side*getDraftDimensions().width*.199);prime();qualify(2.5);
      record(`boundary-gap-${gap}-side-${side}`,player.draftTimer===2,{timer:player.draftTimer});
     }
     reset();const old=leader();prime();qualify(2.4);const next=leader(.8);qualify(1/120);
     record('closer-new-opponent-starts-over',player.draftTimer===0&&player.draftCharge===0&&player.draftTarget===next&&player.draftTarget!==old);
     reset();leader();prime();qualify(2);player.speed=0;qualify(1/120);
     record('being-stuck-resets-charge',player.draftCharge===0&&player.draftTimer===0);
     reset();leader();prime();qualify(2.4);paused=true;tick(.5);paused=false;
     record('pause-does-not-charge',player.draftTimer===0&&Math.abs(player.draftCharge-2.4)<1e-8);
     player.draftTimer=1.5;paused=true;tick(.5);paused=false;record('pause-does-not-consume-mini',player.draftTimer===1.5);
     startRace();record('restart-clears-all-draft-state',[player,...opponents].every(c=>c.draftTimer===0&&c.draftCharge===0&&c.draftTarget===null));
     // End-to-end on every course, without special course tuning.
     for(const level of[1,2,3,4,5,6]){
      reset(level);leader();tick(2.4);const early=player.draftTimer;tick(.2);
      record(`real-loop-qualifies-level-${level}`,early===0&&player.draftTimer>1.8,{early,timer:player.draftTimer,charge:player.draftCharge});
     }
     reset();player.z=TRACK_LENGTH-3500;leader();tick(2.6);
     record('charging-survives-leader-and-player-lap-wrap',player.lap===2&&opponents[0].lap===2&&player.draftTimer>1.8,{lap:player.lap,leaderLap:opponents[0].lap,timer:player.draftTimer});
     for(const targetType of['player','opponent']){
      reset();let follower;
      if(targetType==='player')follower=addCar(0,getDraftPosition(player).z-2.25*getDraftDimensions().length);
      else{player.x=.7;follower=addCar(0,player.z+2000);leader(1.25,0,follower);}
      tick(2.6);record(`real-ai-earns-mini-behind-${targetType}`,follower.draftTimer>1.8,{timer:follower.draftTimer,charge:follower.draftCharge});
     }
     for(const fps of[30,60,120]){
      reset(1,fps);player.cleanSpeedBonus=.2;player.speed=4320;player.boosts=2;player.draftTimer=2;
      tick(.4,fps);const speed=player.speed;tick(1.6,fps);
      record(`ten-percent-cap-with-soft-push-${fps}`,Math.abs(speed-4752)<.01&&player.boosts===2&&player.fovOffset===0&&!player.isBoosting&&!player.isChevronBoosting,{speed,timer:player.draftTimer,fov:player.fovOffset});
      record(`real-loop-mini-duration-${fps}`,player.draftTimer===0);
     }
     // Player and AI can follow one another, or another AI, under identical rules.
     for(const targetType of['player','opponent']){
      reset();const car=addCar(0,getDraftPosition(player).z-2.25*getDraftDimensions().length);
      if(targetType==='opponent'){player.x=.7;leader(1.25,0,car);}
      prime();qualify(2.5);
      record(`ai-earns-mini-behind-${targetType}`,car.draftTimer===2,{timer:car.draftTimer});
     }
     reset();player.x=.7;const boosted=addCar(0,player.z+3000);boosted.draftTimer=2;tick(.4);
     record('ai-gets-ten-percent-speed-too',Math.abs(boosted.speed-3960)<1,{speed:boosted.speed});
     reset();player.draftTimer=1;player.speed=3960;
     const bumper=addCar(COLLISION_X_RANGE-.001,getDraftPosition(player).z);bumper.draftTimer=1;bumper.speed=3960;
     const p=getDraftPosition(player),o=getDraftPosition(bumper);checkOpponentCollision(p,[o],1/120);
     record('gentlest-protected-car-touch-cancels-both',player.draftTimer===0&&bumper.draftTimer===0&&player.speed<=3600&&bumper.speed<=3600,{player:player.draftTimer,ai:bumper.draftTimer,speed:player.speed});
     reset();player.x=.7;const a=addCar(0,player.z+1000),b=addCar(.001,a.z+1);a.draftTimer=b.draftTimer=1;
     const before=new Map([player,a,b].map(c=>[c,getDraftPosition(c)]));checkDraftOpponentContacts(before);
     record('ai-to-ai-touch-cancels-both',a.draftTimer===0&&b.draftTimer===0);
     for(const level of[1,4,5]){
      reset(level);if(level===5)player.z=2500*SEGMENT_LENGTH;player.draftTimer=1;player.speed=3960;
      const limits=getRoadLimits(player.z);player.x=limits.right+.00001;player.wallHitCooldown=1;applyRoadContact(1/120,.0001);
      record(`tiny-protected-wall-touch-cancels-${level}`,player.draftTimer===0&&player.speed<=3600,{speed:player.speed});
     }
     for(const [level,type,cancels]of[[1,'pylon',true],[1,'barrier',true],[1,'lightning',false],[6,'pylon',false]]){
      reset(level);player.draftTimer=2;player.speed=3960;player.z=300*SEGMENT_LENGTH+30-getPlayerContactDistance();
      const obj={x:0,active:true,state:'idle',timer:0,blinkCount:0};segments[300][type]=obj;tick(1/60);
      record(`contact-${level}-${type}-${cancels?'cancels':'preserves'}`,cancels?player.draftTimer===0:player.draftTimer>1.9,{timer:player.draftTimer,active:obj.active});
     }
     reset(3);player.draftTimer=1;player.speed=3960;player.x=segments[605].parkedCar.x;player.z=605*SEGMENT_LENGTH-getPlayerContactDistance();tick(1/60);
     record('parked-car-cancels-even-a-mini',player.draftTimer===0);
     for(const big of['manual','chevron']){
      reset();player.draftTimer=1;player.speed=3960;player.boosts=1;
      if(big==='manual')keys.boost=true;else{player.isChevronBoosting=true;player.chevronBoostTimer=1;}
      tick(1/60);record(`${big}-takes-priority-without-stacking`,player.draftTimer===0&&(big==='manual'?player.isBoosting:player.isChevronBoosting));
     }
     reset();player.draftCharge=2;player.draftTimer=1;exitRace();record('exit-clears-charge-and-corona',player.draftCharge===0&&player.draftTimer===0&&player.draftTarget===null);
     reset();player.draftTimer=1;player.z=TRACK_LENGTH-1;tick(1/60); // normal lap 1->2 must not erase the bonus
     record('normal-lap-boundary-keeps-earned-mini',player.lap===2&&player.draftTimer>0);
     reset();player.draftTimer=1;player.lap=3;player.z=TRACK_LENGTH-1;tick(1/60);record('finish-removes-mini',player.finished&&player.draftTimer===0);clearTimeout(resultTimer);resultTimer=null;
    }finally{render=draw;Math.random=random;}
    // Pixels must be local to the car, while the camera and HUD remain steady.
    const pixels=()=>ctx.getImageData(0,0,W,H).data;
    reset();Math.random=()=>.5;player.speed=4320;render(6000);const plain=pixels();player.draftTimer=2;render(6000);const aura=pixels(),pose=getPlayerRenderPose(),g=getCarGeometry(pose.x,pose.y,pose.scale,true);
    let changed=0,outside=0,blue=0;
    for(let i=0;i<plain.length;i+=4)if(plain[i]!==aura[i]||plain[i+1]!==aura[i+1]||plain[i+2]!==aura[i+2]){changed++;const x=(i/4)%W,y=Math.floor(i/4/W);if(x<g.px-12||x>g.px+g.bw+12||y<g.py-12||y>g.py+g.bh+12)outside++;if(aura[i+2]-plain[i+2]>aura[i]-plain[i]&&aura[i+2]>plain[i+2])blue++;}
    record('corona-is-thin-blue-and-local',changed>150&&changed<W*H*.025&&outside===0&&blue>changed*.8,{changed,outside,blue});
    player.draftTimer=0;const lead=leader(.8);render(6000);const noAI=pixels();lead.draftTimer=1.5;render(6000);const withAI=pixels();let aiGlow=0;for(let i=0;i<noAI.length;i+=4)if(noAI[i]!==withAI[i]||noAI[i+1]!==withAI[i+1]||noAI[i+2]!==withAI[i+2])aiGlow++;
    record('opponent-corona-reaches-the-renderer',aiGlow>30,{pixels:aiGlow});Math.random=random;
    return checks;
   });
   results.push(...checks.map(c=>({...c,errors,pass:c.pass&&errors.length===0})));
   if(viewport.width===390){
    await page.mouse.click(12,20);await page.waitForFunction(()=>draftAudio?.context.state==='running');
    await page.evaluate(()=>{paused=false;state='playing';player.finished=false;player.draftTimer=0;player.draftCharge=1.25;updateDraftAudio();});await page.waitForTimeout(180);
    const charge=await page.evaluate(()=>draftAudio.gain.gain.value);
    await page.evaluate(()=>{paused=true;updateDraftAudio();});await page.waitForTimeout(200);const silent=await page.evaluate(()=>draftAudio.gain.gain.value);
    results.push({name:'draft-quiet-charge-audio-and-pause-silence',pass:charge>.002&&charge<.02&&silent<.0001,actual:{charge,silent},errors});
   }
  }finally{await page.close();}
 }
 return results;
};
