// Exercise real acceleration and lane motion, rather than only the target-speed formula.
module.exports=async function runRacecraft(browser,baseUrl){
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
    const checks=await page.evaluate(()=>{
      const checks=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
      let time=1000,rate=60;const draw=render,random=Math.random;
      render=()=>{};Math.random=()=>.99;
      const reset=(level=1,fps=60,gap=-350)=>{
        selectLevel(level);startRace();state='playing';rate=fps;lastTime=time;smoothedDt=1/rate;
        panelStarts=[];keys.left=keys.right=keys.boost=false;
        for(const s of segments){s.curve=s.hillDelta=s.worldY=0;s.pylon=s.barrier=s.lightning=null;}
        player.z=300*SEGMENT_LENGTH;player.speed=4320;player.cleanSpeedBonus=CLEAN_SPEED_LIMIT;player.x=0;
        opponents.splice(1);const o=opponents[0];
        o.z=player.z+getPlayerContactDistance()+gap;o.x=o.baseX=o.targetX=.55;
        o.cleanSpeedBonus=CLEAN_SPEED_LIMIT;o.speed=o.maxSpeed*1.2;o.racePace=o.speed;
        o.attackCooldown=0;o.tailTime=.6;return o;
      };
      const tick=seconds=>{for(let i=0;i<Math.round(seconds*rate);i++){time+=1000/rate;loop(time);}};
      const gap=o=>getRaceDistance(o)-getRaceDistance(player)-getPlayerContactDistance();
      try{
        for(const [level,fps]of[[1,30],[1,60],[1,120],[2,60],[3,60],[4,60],[5,60],[6,60]]){
          const o=reset(level,fps);tick(1/rate);
          const started=o.attackTimer>0&&Math.abs(o.attackLane-player.x)>.4;
          let maxSpeed=o.speed,passed=false;
          for(let i=0;i<6*rate;i++){tick(1/rate);maxSpeed=Math.max(maxSpeed,o.speed);passed||=gap(o)>100;}
          record(`overtaking-chance-level-${level}-${fps}fps`,started&&passed&&maxSpeed>4320&&maxSpeed<=4320*1.04+.01&&player.speed===4320,
            {started,passed,maxSpeed,finalGap:gap(o),cooldown:o.attackCooldown,playerSpeed:player.speed});
          record(`attack-has-recovery-time-level-${level}-${fps}fps`,o.attackTimer===0&&o.attackCooldown>8,{cooldown:o.attackCooldown});
        }
        let o=reset(1,60,-6000);const initial=gap(o);tick(12);
        record('far-behind-driver-catches-up-without-teleport',gap(o)>initial&&o.speed>player.speed&&o.speed<=4320*1.018+.01,{initial,after:gap(o),speed:o.speed});
        o=reset();const second={...o,oppIdx:1,color:OPP_COLORS[1],x:-.55,baseX:-.55,targetX:-.55,profile:OPP_PROFILES[1],maxSpeed:3600*.87};
        opponents.push(second);tick(1/rate);
        record('only-one-opponent-attacks-at-once',opponents.filter(car=>car.attackTimer>0).length===1,{timers:opponents.map(car=>car.attackTimer)});
        o=reset();o.x=o.baseX=o.targetX=0;o.chasing=true;o.speed=o.racePace=4320;
        opponents.push({...o,oppIdx:1,z:player.z+getPlayerContactDistance()+100,x:-.55,baseX:-.55,targetX:-.55,attackCooldown:100,chasing:false});
        opponents.push({...o,oppIdx:2,z:player.z+getPlayerContactDistance()+100,x:.55,baseX:.55,targetX:.55,attackCooldown:100,chasing:false});
        const route=findPassingLane(o);tick(.25);
        record('blocked-lanes-do-not-trigger-an-attack',route===null&&o.attackTimer===0,{lane:route,timer:o.attackTimer,gap:gap(o)});
        o=reset();o.attackTimer=3;o.attackWindup=0;o.attackLane=.55;o.racePace=4320*1.04;
        const before=o.racePace,after=updateOpponentRacecraft(o,1/60,250,o.maxSpeed*1.2);
        record('passing-speed-fades-without-sudden-braking',after<before&&after>4320&&before-after<20&&o.attackCooldown>=14,{before,after,cooldown:o.attackCooldown});
        const references=[];
        for(const speed of[4320,5940,8316]){
          o=reset(1,60,-6000);player.speed=speed;player.isBoosting=speed===5940;player.isChevronBoosting=speed===8316;
          references.push(updateOpponentRacecraft(o,.5,-6000,o.maxSpeed*1.2));
        }
        record('rubberband-does-not-copy-player-turbo',Math.max(...references)-Math.min(...references)<1e-9,{references});
        o=reset();tick(.2);const pausedState=JSON.stringify({z:o.z,speed:o.speed,timer:o.attackTimer,cooldown:o.attackCooldown});
        togglePause();tick(2);record('pause-freezes-racecraft',pausedState===JSON.stringify({z:o.z,speed:o.speed,timer:o.attackTimer,cooldown:o.attackCooldown}));
        togglePause();startRace();record('restart-clears-attacks-and-catchup',opponents.every(car=>!car.chasing&&car.attackTimer===0&&car.attackCooldown>=8));
        o=reset();o.attackTimer=3;o.isBoosting=true;o.boostTimer=1;
        const turboSpeed=updateOpponentRacecraft(o,.1,-350,o.maxSpeed*1.65);
        record('turbo-replaces-assisted-attack',turboSpeed===o.maxSpeed*1.65&&o.attackTimer===0&&o.attackCooldown>0,{turboSpeed,cooldown:o.attackCooldown});
        o=reset();o.attackTimer=3;o.collisionCooldown=.3;
        const contactSpeed=updateOpponentRacecraft(o,.1,-350,o.maxSpeed);
        record('contacts-cancel-assisted-attack',contactSpeed===o.maxSpeed&&o.attackTimer===0&&!o.chasing);
      }finally{render=draw;Math.random=random;}
      return checks;
    });
    return checks.map(c=>({...c,errors,pass:c.pass&&errors.length===0}));
  }finally{await page.close();}
};
