// Controlled situations exercise the real planner, steering and contacts.
// Full-course driving is in assessment-racecraft-play.cjs; these are not manual playtests.
module.exports=async function runRacecraft(browser,baseUrl){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
  const checks=await page.evaluate(()=>{
   const checks=[],record=(name,pass,actual)=>checks.push({name,pass,actual});const draw=render,random=Math.random;
   let time=1000,rate=60;render=()=>{};Math.random=()=>.5;
   const reset=(level=1,fps=60)=>{
    selectLevel(level);startRace();state='playing';lastTime=time;smoothedDt=1/fps;rate=fps;panelStarts=[];
    keys.left=keys.right=keys.boost=false;player.z=300*SEGMENT_LENGTH;player.x=0;player.speed=4320;player.cleanSpeedBonus=.2;
    for(const s of segments){s.curve=s.hillDelta=s.worldY=0;s.pylon=s.barrier=s.lightning=s.parkedCar=null;}
    opponents.forEach(o=>{o.cleanSpeedBonus=.2;o.speed=o.maxSpeed*1.2;o.profile={...o.profile,form:0};
      o.surfaceVisits=new Set([...DREAM_ICE.map(p=>'ice'+p.start),...DREAM_PUDDLES.map(p=>'clock'+p.start)]);});
   };
   const tick=(seconds,onStep)=>{for(let i=0;i<Math.round(seconds*rate);i++){time+=1000/rate;loop(time);onStep?.();}};
   const gap=o=>racePosition(o)-racePosition(player);
   try{
    reset();record('slipstream-state-and-functions-removed',[player,...opponents].every(c=>!Object.keys(c).some(k=>/^draft/i.test(k)))&&typeof DRAFT==='undefined'&&typeof drawDraftCorona==='undefined'&&typeof draftAudio==='undefined');
    for(const [level,fps]of [[1,30],[1,60],[1,120],[2,60],[3,60],[4,60],[5,60],[6,60]]){
     reset(level,fps);const fast=opponents[2];opponents=[fast];fast.x=fast.baseX=fast.targetX=0;fast.z=racePosition(player)-600;Math.random=()=>0;tryOpponentTurbo(fast,1/60);Math.random=()=>.5;
     let passed=false,max=0,changes=0,last=fast.targetX,contact=false;
     tick(15,()=>{passed||=gap(fast)>300;max=Math.max(max,fast.speed);contact||=player.collisionCooldown>0;if(Math.abs(fast.targetX-last)>.2){changes++;last=fast.targetX;}});
     record(`leader-can-be-passed-level-${level}-${fps}`,passed&&gap(fast)>300&&!contact&&max<=5940.01&&!('boosts' in fast),{passed,gap:gap(fast),max,contact,changes});
     record(`no-immediate-slowdown-after-pass-${level}-${fps}`,fast.speed>fast.maxSpeed*1.18&&changes<6,{speed:fast.speed,changes});
    }
    reset();player.z=100*SEGMENT_LENGTH;
    const slow=opponents[0],fast=opponents[2];opponents=[slow,fast];
    slow.profile={...slow.profile,pace:.96,lane:0};slow.maxSpeed=3600*.96;slow.speed=slow.maxSpeed*1.2;slow.x=slow.targetX=slow.baseX=0;slow.z=400*SEGMENT_LENGTH;
    fast.x=fast.targetX=fast.baseX=0;fast.z=slow.z-700;let maneuver=false,contact=false;
    tick(10,()=>{maneuver||=fast.maneuver==='pass';contact||=fast.collisionCooldown>0;});
    record('ai-passes-ai-away-from-player',maneuver&&racePosition(fast)>racePosition(slow)+200&&!contact,{maneuver,contact,gap:racePosition(fast)-racePosition(slow)});
    reset();player.z=0;
    const pairs=[opponents[0],opponents[1],opponents[2],opponents[3]];opponents=pairs;
    pairs.forEach((o,i)=>{o.z=(i<2?400:500)*SEGMENT_LENGTH+(i%2?0:-600);o.x=o.targetX=o.baseX=0;o.speed=i%2?3800:4400;});
    for(const o of pairs)planOpponent(o,raceSnapshot());
    record('independent-simultaneous-overtakes',pairs[0].maneuver==='pass'&&pairs[2].maneuver==='pass',{modes:pairs.map(o=>o.maneuver),lanes:pairs.map(o=>o.targetX)});
    reset();const follower=opponents[0];follower.x=follower.targetX=0;follower.z=racePosition(player)-500;
    opponents.slice(1).forEach((o,i)=>{o.z=follower.z+400;o.x=o.targetX=[-.6,-.2,.2,.6][i];o.speed=3300;});
    player.z=0;const initial=follower.speed;tick(.5);
    record('blocked-driver-lifts-instead-of-phasing-through',follower.speed<initial&&Number.isFinite(follower.x),{before:initial,after:follower.speed,mode:follower.maneuver});
    reset();player.z=0;const crossing=opponents[0],obstruction=opponents[1];opponents=[crossing,obstruction];
    crossing.z=400*SEGMENT_LENGTH;crossing.x=crossing.targetX=-.6;crossing.speed=8000;
    obstruction.z=crossing.z+1000;obstruction.x=obstruction.targetX=0;obstruction.speed=1000;
    const crossingChoice=evaluateRaceLane(crossing,.6,raceSnapshot(),roadPreview(crossing,crossing.profile));planOpponent(crossing,raceSnapshot());
    record('fast-closing-crossing-path-is-rejected',crossingChoice.blocked&&crossing.targetX<0,{blocked:crossingChoice.blocked,target:crossing.targetX});
    reset();const lone=opponents[0];opponents=[lone];player.z=0;lone.z=300*SEGMENT_LENGTH;lone.x=lone.targetX=lone.baseX=.55;
    segments[315].barrier={active:true,x:.55,state:'idle',timer:0};tick(1.5);
    record('plans-around-barrier',segments[315].barrier.state==='idle'&&Math.abs(lone.x-.55)>.45&&lone.collisionCooldown===0,{x:lone.x,speed:lone.speed});
    for(const [level,type]of[[1,'lightning'],[6,'pylon']]){
     reset(level);const collector=opponents[0];opponents=[collector];player.z=0;
     collector.z=300*SEGMENT_LENGTH;collector.x=collector.targetX=collector.baseX=.55;
     for(let i=301;i<=305;i++)segments[i][type]={active:true,x:.55};
     const withItems=roadPreview(collector,collector.profile);tick(.3);
     record(`ai-leaves-${type}-for-player`,Array.from({length:5},(_,i)=>segments[301+i][type].active).every(Boolean)&&!('boosts' in collector)&&!collector.isBoosting&&withItems.objects.length===0,{x:collector.x,active:segments[301][type].active});
    }
    reset();opponents=[];player.x=.55;player.z=300*SEGMENT_LENGTH-getPlayerContactDistance()-5;segments[300].lightning={active:true,x:.55};tick(.1);
    record('player-still-collects-turbo',player.boosts===1&&!segments[300].lightning.active);
    tick(1.6);record('player-pickup-still-respawns',segments[300].lightning.active&&player.boosts===1);
    reset();const randomCar=opponents[0];opponents=[randomCar];randomCar.z=player.z+1000;
    Math.random=()=>.0014;tryOpponentTurbo(randomCar,1/60);
    record('tuned-0.15-percent-trigger-and-1.5-second-duration',randomCar.isBoosting&&randomCar.boostTimer===1.5&&!('boosts' in randomCar),{timer:randomCar.boostTimer});
    Math.random=()=>.5;tick(1.4);record('random-turbo-lasts-at-least-1.4-seconds',randomCar.isBoosting);
    tick(.15);record('random-turbo-ends-after-1.5-seconds',!randomCar.isBoosting);
    randomCar.z=player.z+1000;Math.random=()=>.0016;tryOpponentTurbo(randomCar,1/60);record('tuned-probability-upper-bound',!randomCar.isBoosting);
    for(const distance of[-4000,-3999,3999,4000]){
     randomCar.z=player.z+distance;randomCar.isBoosting=false;Math.random=()=>0;tryOpponentTurbo(randomCar,1/60);
     record(`original-distance-window-${distance}`,randomCar.isBoosting===(Math.abs(distance)<4000));
    }
    randomCar.z=player.z+1000;
    for(const flag of['isBoosting','isChevronBoosting','collisionCooldown','finished']){
     randomCar.isBoosting=randomCar.isChevronBoosting=randomCar.finished=false;randomCar.collisionCooldown=0;randomCar.boostTimer=.4;
     randomCar[flag]=flag==='collisionCooldown'?.2:true;tryOpponentTurbo(randomCar,1/60);
     record(`no-random-retrigger-during-${flag}`,randomCar.boostTimer===.4&&(flag==='isBoosting'||!randomCar.isBoosting));
    }
    randomCar.finished=false;randomCar.collisionCooldown=0;randomCar.isBoosting=false;randomCar.isChevronBoosting=false;
    player.z=TRACK_LENGTH-500;randomCar.z=500;randomCar.lap=2;tryOpponentTurbo(randomCar,1/60);
    record('turbo-range-crosses-lap-seam',randomCar.isBoosting);
    randomCar.isBoosting=false;randomCar.lap=1;tryOpponentTurbo(randomCar,1/60);
    record('lapped-car-is-not-treated-as-close-rival',!randomCar.isBoosting);
    // Independent one-second windows sample starts, without physics or rendering
    // randomness changing the sequence. This catches a doubled substep chance.
    const expected=1-Math.pow(.9985,60),samples=[];
    for(const fps of[30,60,120]){
     let seed=1989;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
     randomCar.z=player.z-1000;let count=0;
     for(let trial=0;trial<5000;trial++){
      randomCar.isBoosting=false;
      for(let f=0;f<fps&&!randomCar.isBoosting;f++)tryOpponentTurbo(randomCar,1/fps);
      count+=randomCar.isBoosting?1:0;
     }
     samples.push(count/5000);
     record(`same-tuned-frequency-${fps}fps`,Math.abs(count/5000-expected)<.02,{observed:count/5000,expected});
    }
    record('framerate-distribution-within-two-percentage-points',Math.max(...samples)-Math.min(...samples)<.02,{samples});
    Math.random=()=>.5;
    const references=[];
    for(const speed of [4320,5940,8316]){reset();const o=opponents[0];opponents=[o];o.z=racePosition(player)-30000;player.speed=speed;references.push(updateOpponentRacecraft(o,.1,raceSnapshot()));}
    record('recovery-does-not-copy-player-turbo',Math.max(...references)-Math.min(...references)<.001,{references});
    reset();const o=opponents[0];opponents=[o];o.z=racePosition(player)-60000;
    const target=updateOpponentRacecraft(o,.1,raceSnapshot()),natural=o.maxSpeed*1.2;
    record('recovery-capped-at-two-percent',Math.abs(target/natural-1.02)<1e-6,{target,natural});
    reset();const a=opponents[0],b=opponents[1];opponents=[a,b];a.x=b.x=0;a.z=300*SEGMENT_LENGTH;b.z=a.z+80;a.speed=5940;b.speed=1000;
    const before=[{x:a.x,z:a.z-40},{x:b.x,z:b.z-10}];checkOpponentPairContacts(before,1/120);
    record('ai-contact-has-penalty-and-separation',a.speed<5940&&a.cleanSpeedBonus===0&&b.z-a.z>=90&&a.collisionCooldown>0,{speed:a.speed,gap:b.z-a.z});
    reset();tick(.5);const pausedState=JSON.stringify(opponents);togglePause();tick(2);record('pause-freezes-entire-ai',JSON.stringify(opponents)===pausedState);togglePause();
    startRace();record('restart-clears-tactics-and-resources',opponents.every(o=>!o.passTarget&&!('boosts' in o)&&!o.isBoosting&&Object.keys(o.chevronDecisions).length===0&&o.maneuver==='cruise'&&o.raceAge===0)&&opponentContacts.size===0&&respawningPickups.size===0);
    reset();opponents.forEach(o=>{o.z=player.z+30000+o.oppIdx*12000;});tick(2);record('all-drivers-remain-finite',opponents.every(o=>Number.isFinite(o.x)&&Number.isFinite(o.speed)&&Number.isFinite(o.z)));
   }finally{render=draw;Math.random=random;}
   return checks;
  });
  return checks.map(c=>({...c,pass:c.pass&&errors.length===0,errors}));
 }finally{await page.close();}
};
