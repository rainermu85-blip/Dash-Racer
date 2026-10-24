// Paired real-loop runs: turbo cannot change the underlying normal acceleration
// trajectory. Initial fixtures isolate equal engines from road/driver variation.
module.exports=async function assessNormalPace(browser,baseUrl){
 const page=await browser.newPage({viewport:{width:480,height:850}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
  const results=await page.evaluate(()=>{
   const out=[],record=(name,pass,actual)=>out.push({name,pass,actual}),draw=render,random=Math.random;
   let ts=1000;render=()=>{};Math.random=()=>.5;
   const setup=(role,start,fps,level=1)=>{
    selectLevel(level);startRace();state='playing';lastTime=ts;smoothedDt=1/fps;panelStarts=[];
    keys.left=keys.right=keys.boost=false;player.accel=900;player.z=0;
    for(const s of segments){s.curve=s.hillDelta=s.worldY=0;s.lightning=s.pylon=s.barrier=s.parkedCar=null;}
    let car=player;
    if(role==='ai'){
     car=opponents[0];opponents=[car];car.maxSpeed=3600;car.profile={...car.profile,pace:1,form:0,cornerLoss:0,lane:.55};car.raceForm=1;
    }else opponents=[];
    car.z=300*150;car.x=car.targetX=role==='ai'?.55:0;car.speed=start*3600/335;
    car.cleanSpeedBonus=Math.max(0,start/335-1);resetNormalPace(car);
    return car;
   };
   const run=(role,start,fps,kind,boosted,damage=null)=>{
    const car=setup(role,start,fps,kind==='chevron'?6:1),frames=[],activations=kind==='chain'?[.5,2.5]:[.5];
    let hit=false;
    for(let f=0;f<8*fps;f++){
     if(boosted&&activations.some(t=>f===Math.round(t*fps))){
      if(kind==='chevron'){car.isChevronBoosting=true;car.chevronBoostTimer=2;}
      else if(role==='player'){player.boosts++;keys.boost=true;}
      else{car.isBoosting=true;car.boostTimer=1.2;}
     }
     if(damage&&f===fps){
      if(damage==='offroad')car.x=car.targetX=1;
      else{const index=getSeg(car.z+(role==='player'?getPlayerContactDistance():0)).index;segments[index][damage]={active:true,x:car.x,state:'idle',timer:0,blinkCount:0};}
     }
     ts+=1000/fps;loop(ts);
     if(damage&&f>=fps)hit||=damage==='offroad'||car.cleanSpeedBonus===0||activeFlyingPylons.length>0;
     frames.push({speed:car.speed,normal:car.normalSpeed,bonus:car.cleanSpeedBonus,recovering:car.turboRecovery,boost:car.isBoosting||car.isChevronBoosting});
    }
    return{frames,hit};
   };
   try{
    for(const fps of[30,60,120])for(const role of['player','ai'])for(const start of[0,330,370,402])for(const kind of['normal','chevron']){
     const control=run(role,start,fps,kind,false).frames,boosted=run(role,start,fps,kind,true).frames;
     const error=Math.max(...boosted.map((p,i)=>Math.abs(p.normal-control[i].speed)));
     const bonusError=Math.max(...boosted.map((p,i)=>Math.abs(p.bonus-control[i].bonus)));
     const settled=boosted.slice(fps*5).every((p,i)=>!p.boost&&!p.recovering&&Math.abs(p.speed-control[fps*5+i].speed)<.01);
     record(`counterfactual-${role}-${kind}-${start}-${fps}fps`,error<.01&&bonusError<1e-7&&settled,{maxNormalError:error,maxBonusError:bonusError,settled,endKmh:boosted.at(-1).speed*335/3600});
    }
    for(const role of['player','ai']){
     const control=run(role,330,60,'chain',false).frames,boosted=run(role,330,60,'chain',true).frames;
     record(`chained-turbos-preserve-normal-progress-${role}`,boosted.every((p,i)=>Math.abs(p.normal-control[i].speed)<.01)&&Math.abs(boosted.at(-1).speed-control.at(-1).speed)<.01);
    }
    for(const role of['player','ai'])for(const fps of[30,60,120]){
     const p=run(role,330,fps,'normal',false).frames;
     const a=run(role==='ai'?'player':'ai',330,fps,'normal',false).frames;
     record(`same-engine-same-normal-pace-${role}-${fps}fps`,p.every((v,i)=>Math.abs(v.speed-a[i].speed)<.01&&Math.abs(v.bonus-a[i].bonus)<1e-7));
    }
    for(const damage of['pylon','barrier','offroad']){
     const control=run('player',370,60,'normal',false,damage),boosted=run('player',370,60,'normal',true,damage);
     const last=boosted.frames.at(-1),other=control.frames.at(-1);
     record(`turbo-does-not-heal-${damage}`,boosted.hit&&control.hit&&Math.abs(last.normal-other.speed)<.1&&Math.abs(last.speed-other.speed)<.1&&Math.abs(last.bonus-other.bonus)<1e-6,{normal:last.normal,control:other.speed,bonus:last.bonus,controlBonus:other.bonus});
    }
    // Responsibilities apply identically when the player is either car.
    for(const playerFront of[true,false])for(const hard of[false,true]){
     setup('player',400,60);initOpponents();const opp=opponents[0];opponents=[opp];
     const front=playerFront?player:opp,rear=playerFront?opp:player;
     front.x=rear.x=0;front.speed=400*3600/335;rear.speed=(hard?773.85:402)*3600/335;
     front.cleanSpeedBonus=400/335-1;rear.cleanSpeedBonus=.2;resetNormalPace(front);resetNormalPace(rear);
     front.isBoosting=hard;front.boostTimer=hard?1:0;rear.isChevronBoosting=hard;rear.chevronBoostTimer=hard?1:0;
     const center=getRaceDistance(player)+getPlayerContactDistance();opp.z=center+(playerFront?-89.95:89.95);
     const dt=1/120,before=front.speed,bonus=front.cleanSpeedBonus;
     checkOpponentCollision({x:0,z:center-player.speed*dt},[{x:0,z:opp.z-opp.speed*dt}],dt);
     record(`rear-victim-keeps-pace-${playerFront?'player':'ai'}-${hard?'hard':'mild'}`,front.speed>=before&&front.cleanSpeedBonus===bonus&&front.cleanSpeedCooldown===0&&front.isBoosting===hard&&rear.cleanSpeedBonus<.2&&(!hard||!rear.isChevronBoosting),{frontKmh:front.speed*335/3600,frontBonus:front.cleanSpeedBonus,rearBonus:rear.cleanSpeedBonus});
    }
    for(const frontIndex of[0,1])for(const hard of[false,true]){
     setup('player',400,60);initOpponents();opponents=opponents.slice(0,2);player.z=0;
     const front=opponents[frontIndex],rear=opponents[1-frontIndex];front.x=rear.x=0;front.z=500*150;rear.z=front.z-89.95;
     front.speed=400*3600/335;rear.speed=(hard?773.85:402)*3600/335;front.cleanSpeedBonus=400/335-1;rear.cleanSpeedBonus=.2;resetNormalPace(front);resetNormalPace(rear);
     front.isBoosting=hard;rear.isChevronBoosting=hard;
     const bonus=front.cleanSpeedBonus,dt=1/120;checkOpponentPairContacts(opponents.map(o=>({x:0,z:o.z-o.speed*dt})),dt);
     record(`ai-pair-protects-rear-victim-${frontIndex}-${hard?'hard':'mild'}`,front.cleanSpeedBonus===bonus&&front.speed>=400*3600/335&&rear.cleanSpeedBonus<.2&&front.cleanSpeedCooldown===0&&front.isBoosting===hard&&(!hard||!rear.isChevronBoosting));
    }
    const car=setup('player',330,60);player.boosts=1;keys.boost=true;for(let f=0;f<60;f++){ts+=1000/60;loop(ts);}
    const stateBefore=JSON.stringify({speed:car.speed,normal:car.normalSpeed,bonus:car.cleanSpeedBonus,timer:car.boostTimer});
    togglePause();for(let f=0;f<120;f++){ts+=1000/60;loop(ts);}
    record('pause-freezes-turbo-and-normal-reference',stateBefore===JSON.stringify({speed:car.speed,normal:car.normalSpeed,bonus:car.cleanSpeedBonus,timer:car.boostTimer}));togglePause();
    startRace();record('restart-clears-normal-reference',player.normalSpeed===0&&!player.turboRecovery&&player.cleanSpeedCooldown===0&&opponents.every(o=>o.normalSpeed===o.speed&&!o.turboRecovery&&o.cleanSpeedCooldown===0));
   }finally{render=draw;Math.random=random;}
   return out;
  });
  return results.map(r=>({...r,errors,pass:r.pass&&errors.length===0}));
 }finally{await page.close();}
};
