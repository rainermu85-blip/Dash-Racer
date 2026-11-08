// Shared traffic/road physics, real controls around the complete circuit, and
// front-car art projected at the same footprint as the contact model.
module.exports=async function(browser,baseUrl,output){
 const fs=require('node:fs'),path=require('node:path'),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;});await page.goto(baseUrl);await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   const checks=[],shots=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
   const start=()=>{selectLevel(7);startRace();state='playing';for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';};
   start();const original=drawParadiseOncoming;let visible=new Map();
   drawParadiseOncoming=(x,y,sc,color,style)=>{
    const c=paradiseTraffic.filter(c=>!c.departed&&c.color===color&&c.z>player.z).sort((a,b)=>a.z-b.z)[0];
    if(c&&!visible.has(c.id)){
      const clip=segments[Math.floor(c.z/150)%SEGMENT_COUNT].clipY;
      if(Math.min(W,x+31*sc)-Math.max(0,x-31*sc)>8&&Math.min(y,clip)-Math.max(0,y-(style===1?73:49)*sc)>8)
        visible.set(c.id,(c.z-racePosition(player))/(player.speed+c.speed));
    }
    original(x,y,sc,color,style);
   };
   try{for(const lane of[1/3,1]){
    start();opponents=[];visible=new Map();let minimum=4320;
    const land=[0,0,0,0,0],bridges=[0,0,0,0,0],met=new Set(),saved=new Set();
    for(let f=0;f<15000&&!player.finished;f++){
      const x=getPlayerCollisionX();keys.left=x>lane+.04;keys.right=x<lane-.04;
      advanceRaceStep(1/120);if(raceElapsed>16000)minimum=Math.min(minimum,player.speed);
      for(const c of paradiseTraffic)if(!met.has(c.id)&&c.z<racePosition(player)){
        met.add(c.id);const island=Math.floor(player.z/150/PARADISE_STRIDE);
        (player.z/150%PARADISE_STRIDE<350?land:bridges)[island]++;
      }
      if(f%12===0)render(raceElapsed);
      const island=Math.floor(player.z/150/PARADISE_STRIDE),local=player.z/150%PARADISE_STRIDE;
      if(lane===1/3&&local>175&&!saved.has(island)){render(raceElapsed);saved.add(island);shots.push({name:'traffic-island-'+island,image:C.toDataURL()});}
    }
    clearTimeout(resultTimer);resultTimer=null;
    const hits=paradiseTraffic.reduce((n,c)=>n+c.hits.size,0);
    record('legal-lane-'+lane+'-retains-speed-for-complete-lap',minimum>4300&&hits===0&&player.finished,{minimum,hits,seconds:raceElapsed/1000});
    record('oncoming-sightlines-lane-'+lane,visible.size===paradiseTraffic.length&&Math.min(...visible.values())>1.8,{count:visible.size,leadSeconds:[...visible.values()]});
    if(lane===1/3)record('traffic-meets-driver-on-every-island-and-bridge',land.every(n=>n>0)&&bridges.every(n=>n>0),{land,bridges,met:met.size});
   }}finally{drawParadiseOncoming=original;}
   start();const geometry=[];
   for(let island=0;island<5;island++)for(const local of[175,435]){
    const index=island*PARADISE_STRIDE+local,width=paradiseRoadScale(index),limit=getRoadLimits(index*150),soft=roadSoftLimit(index*150);
    geometry.push({index,width,limit,soft});
   }
   record('four-lane-road-and-limits-for-all-islands-and-bridges',geometry.every(g=>g.width===4/3&&g.limit.right>1.2&&g.soft>1.25),{geometry});
   record('start-grid-clear-on-own-carriageway',player.x>0&&opponents.every(c=>c.x>0&&Math.abs(racePosition(c)-racePosition(player))>COLLISION_Z_RANGE),{});
   // Deliberately cross the entire longitudinal contact box in one step.
   const impact=(rival,edge)=>{
    start();paradiseTrafficActive=true;
    const car=rival?opponents[0]:player;opponents=rival?[car]:[];
    car.z=1700*150;car.x=-1/3;car.speed=4320;car.normalSpeed=4320;car.normalBaseSpeed=3600;car.cleanSpeedBonus=.2;car.finished=false;car.isBoosting=true;car.boostTimer=1;
    if(rival)player.z=1400*150;
    const x=rival?car.x:getPlayerCollisionX(),z=racePosition(car),traffic=paradiseTraffic[0];
    const width=getCarCollisionHalfWidth(car)+getCarCollisionHalfWidth(traffic);
    traffic.x=traffic.previousX=x+width*edge;traffic.previousZ=z+145;traffic.z=z-145;paradiseTraffic=[traffic];
    const p0={x:player.x,collisionX:getPlayerCollisionX(),z:racePosition(player)},o0=rival?[{x:car.x,z:racePosition(car)}]:[];
    checkParadiseTrafficContacts(p0,o0);const speed=car.speed;checkParadiseTrafficContacts(p0,o0);
    return{speed,afterRepeat:car.speed,hits:traffic.hits.size,boost:car.isBoosting};
   };
   const front=impact(false,0),graze=impact(false,.95),opponent=impact(true,0);
   record('swept-front-hit-has-single-strong-impact',front.hits===1&&front.speed>1500&&front.speed<2600&&front.afterRepeat===front.speed&&!front.boost,front);
   record('grazing-impact-is-much-milder',graze.speed>3900&&graze.speed>front.speed&&graze.boost,graze);
   record('same-impact-cost-for-rival-and-player',Math.abs(front.speed-opponent.speed)<.01&&opponent.hits===1,{front,opponent});
   start();paradiseTrafficActive=true;const car=opponents[0];car.z=1700*150;car.x=-1/3;car.targetX=-1/3;car.speed=4300;car.laneHold=0;
   paradiseTraffic=paradiseTraffic.slice(0,1);const incoming=paradiseTraffic[0];incoming.z=racePosition(car)+8000;incoming.x=-1/3;incoming.lane=-1/3;
   const road=roadPreview(car,car.profile),snapshot=raceSnapshot();
   const dangerous=evaluateRaceLane(car,-1/3,snapshot,road),safe=evaluateRaceLane(car,1,snapshot,road);planOpponent(car,snapshot);
   record('rivals-plan-away-from-oncoming-lane',safe.score>dangerous.score+10&&car.targetX>.1,{dangerous:dangerous.score,safe:safe.score,target:car.targetX});
   // Two rivals abreast: actually steer left, pass with one turbo, return right.
   start();paradiseTraffic=[];paradiseTrafficActive=true;opponents=opponents.slice(0,2);
   player.z=1670*150;player.x=1/3;player.speed=4320;player.cleanSpeedBonus=.2;player.boosts=1;resetNormalPace(player);
   for(let i=0;i<2;i++){const o=opponents[i];o.z=player.z+2200+i*70;o.x=o.targetX=i===0?1/3:1;o.speed=3600;resetNormalPace(o);}
   let wentLeft=false,returned=false,used=false;
   for(let f=0;f<2200&&!returned;f++){
    const passed=opponents.every(o=>racePosition(player)>racePosition(o)+350),target=passed?1/3:-.85;
    keys.left=player.x>target+.025;keys.right=player.x<target-.025;
    if(player.x<-.5&&!used){keys.boost=true;used=true;}
    advanceRaceStep(1/120);wentLeft||=getPlayerCollisionX()<-.4;
    returned=passed&&player.x>.25;
   }
   render(raceElapsed);shots.push({name:'returned-from-overtake',image:C.toDataURL()});
   record('player-can-pass-two-abreast-and-return',wentLeft&&returned&&used,{wentLeft,returned,used,index:player.z/150});
   start();record('restart-resets-traffic',!paradiseTrafficActive&&paradiseTraffic.length===23&&paradiseTraffic.every(c=>!c.hits.size&&!c.departed),{});
   for(const level of[1,2,3,4,5,6]){selectLevel(level);startRace();record('no-paradise-traffic-level-'+level,paradiseTraffic.length===0&&roadSoftLimit(1600*150)===.94,{});}
   return{checks,shots};
  });
  for(const shot of result.shots)fs.writeFileSync(path.join(output,shot.name+'.png'),Buffer.from(shot.image.split(',')[1],'base64'));
  return result.checks.map(c=>({...c,pass:c.pass&&!errors.length,errors}));
 }finally{await page.close();}
};
