// Real Sunset Hills geometry and physics: key-only escape vs missed exit,
// plus AI routing, persistent closure and portrait/landscape visual evidence.
module.exports=async function assessDetour(browser,baseUrl,output){
 const fs=require('node:fs'),path=require('node:path'),results=[];
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
  const checks=await page.evaluate(()=>{
   const result=[],record=(name,pass,actual)=>result.push({name,pass,actual});
   const draw=render,hit=hitBarrier;render=()=>{};let hits=[],ts=1000;
   hitBarrier=(car,barrier)=>{if(barrier.permanent&&car.collisionCooldown<=0)hits.push({player:car===player,x:car.x,z:car.z/SEGMENT_LENGTH,before:car.speed});hit(car,barrier);};
   const reset=(fps,x=0,boost=false)=>{
    let seed=1989;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    selectLevel(3);startRace();state='playing';lastTime=ts;smoothedDt=1/fps;
    player.z=500*SEGMENT_LENGTH;player.x=x;player.speed=4320;player.cleanSpeedBonus=.2;resetNormalPace(player);
    if(boost)player.speed=5940;
    player.isBoosting=boost;player.boostTimer=1.2;hits=[];keys.left=keys.right=keys.boost=false;
   };
   try{
    for(const fps of[30,60,120])for(const boost of[false,true])for(const startX of[-.6,0,.65]){
     reset(fps,startX,boost);opponents=[];let minSpeed=player.speed,maxWall=0,frames=0;
     for(;frames<fps*8&&player.z<594*SEGMENT_LENGTH;frames++){
      const i=(player.z+getPlayerContactDistance())/SEGMENT_LENGTH;
      // React at the advance sign; only steering input changes after setup.
      const target=i<523?startX:i<578?-.65:hillsDetourCenter(i);
      keys.left=player.x>target+.02;keys.right=player.x<target-.02;
      ts+=1000/fps;loop(ts);minSpeed=Math.min(minSpeed,player.speed);maxWall=Math.max(maxWall,Math.abs(player.wallContactSide));
     }
     record(`left-exit-${fps}-${boost?'turbo':'cruise'}-lane-${startX}`,hits.length===0&&maxWall===0&&player.z>=594*SEGMENT_LENGTH&&minSpeed>3900,{hits,minSpeed,maxWall,seconds:frames/fps,x:player.x});
    }
    for(const fps of[30,60,120]){
     reset(fps,0);opponents=[];
     for(let f=0;f<fps*4&&hits.length===0;f++){ts+=1000/fps;loop(ts);}
     record(`missed-exit-has-heavy-collision-${fps}`,hits.length>0&&player.speed<2000&&segments[554].barrier.state==='idle',{hits,speed:player.speed});
    }
    // Same closed-road obstacle remains available to all cars and all laps.
    reset(60);const barrier=segments[554].barrier;
    for(const car of[player,...opponents]){car.speed=4320;car.collisionCooldown=0;hitBarrier(car,barrier);}
    record('closure-survives-every-driver',hits.length===6&&barrier.active&&barrier.state==='idle'&&[player,...opponents].every(c=>c.speed<1500),{hits:hits.length,state:barrier.state});
    const left=barrier.x-barrier.visualHalfWidth,right=barrier.x+barrier.visualHalfWidth;
    const probe=x=>getTrackContacts({x,z:554*150-1},{x,z:555*150+1},['barrier']).length>0;
    record('visible-closure-and-collision-agree',probe(left)&&probe(right)&&!probe(left-.14)&&!probe(right+.14),{left,right,contactRadius:barrier.halfWidth-barrier.visualHalfWidth});
    reset(60);player.z=400*SEGMENT_LENGTH;
    opponents.forEach((o,i)=>{o.z=(500-i*3)*SEGMENT_LENGTH;o.x=o.targetX=[.65,0,-.6,.65,0][i];o.speed=4320;o.cleanSpeedBonus=.2;});
    for(let f=0;f<60*10;f++){ts+=1000/60;loop(ts);}
    record('all-ai-use-left-exit',hits.every(h=>h.player)&&opponents.every(o=>o.z>590*SEGMENT_LENGTH),{hits,cars:opponents.map(o=>({z:o.z/150,x:o.x,speed:o.speed}))});
    reset(60);const closure=segments[554].barrier;
    selectLevel(4);startRace();record('detour-is-sunset-only',!segments.some(s=>s.barrier?.permanent)&&hillsDetourCenter(554)===0);
    selectLevel(3);startRace();record('restart-restores-closure',segments[554].barrier!==closure&&segments[554].barrier.state==='idle');
   }finally{render=draw;hitBarrier=hit;}
   return result;
  });
  results.push(...checks);
  for(const viewport of[{width:390,height:844},{width:1000,height:700}]){
   await page.setViewportSize(viewport);
   await page.evaluate(()=>{selectLevel(3);startRace();state='playing';opponents=[];introScreen.style.display='none';document.getElementById('overlay').classList.add('hide');});
   await page.evaluate(()=>document.fonts.ready);
   for(const index of[490,510,530,543,555,580]){
    const frame=await page.evaluate(index=>{player.z=index*150;player.x=index<525?0:-.65;player.speed=4320;player.pitch=segments[index].hillDelta;curveCamera.look=0;updateCurveCamera(.3);chapterTime=1600;render(1600);return ctx.canvas.toDataURL();},index);
    fs.writeFileSync(path.join(output,`detour-${viewport.width}-${index}.png`),Buffer.from(frame.split(',')[1],'base64'));
   }
  }
  return results.map(r=>({...r,pass:r.pass&&errors.length===0,errors}));
 }finally{await page.close();}
};
