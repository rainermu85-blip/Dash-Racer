// Real one-way race integration, timed approach events and rendered occlusion.
module.exports=async function assessOrbital(browser,baseUrl,output){
 const fs=require('node:fs'),path=require('node:path'),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>requestAnimationFrame=()=>0);
  await page.goto(baseUrl);await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   const checks=[],shots=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
   const setup=()=>{selectLevel(8);startRace();state='playing';for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';};
   const stop=()=>{clearTimeout(resultTimer);clearTimeout(fieldCompletionTimer);resultTimer=fieldCompletionTimer=null;};
   const steer=useTurbo=>{
    const next=segments.find(s=>s.lightning?.active&&s.worldZ>=player.z&&s.worldZ<player.z+7500);
    const target=next?next.lightning.x:0,x=getPlayerCollisionX();keys.left=x>target+.025;keys.right=x<target-.025;
    keys.boost=useTurbo&&player.boosts>0&&!player.isBoosting;
   };
   setup();
   record('one-way-route-with-continuous-runout',isPointToPoint()&&raceLapCount()===1&&SEGMENT_COUNT===3080&&segments.length===3280,{segments:SEGMENT_COUNT,runout:segments.length-SEGMENT_COUNT});
   record('six-content-districts',ORBITAL_SECTIONS.length===6&&ORBITAL_SECTIONS.every(section=>section.key==='service'||segments.slice(section.start,section.end).filter(s=>s.orbitalItems?.length).length>=6),{districts:ORBITAL_SECTIONS.map(s=>({name:s.name,installations:segments.slice(s.start,s.end).reduce((n,t)=>n+(t.orbitalItems?.length||0),0)}))});
   for(const turbo of[false,true]){
    setup();opponents=[];let uses=0,wasBoosting=false,lastLap=false,wallFrames=0,visibleLaunch=0;const launch=[];
    const paint=drawOrbitalSprite;let shuttle=null;
    drawOrbitalSprite=s=>{if(s.item.kind==='shuttle'){const a=getOrbitalArt('shuttle');shuttle={left:s.x-a.ox*s.sc,right:s.x+(a.w-a.ox)*s.sc,top:s.y-a.oy*s.sc,bottom:s.y,clip:s.clipY,scale:s.sc};}paint(s);};
    for(let f=0;f<12000&&!player.finished;f++){
     steer(turbo);advanceRaceStep(1/60);if(player.isBoosting&&!wasBoosting)uses++;wasBoosting=player.isBoosting;lastLap||=lastLapElapsed!==null;wallFrames+=!!player.wallContactSide;
     const index=player.z/150;
     if(index>1550&&index<1760&&f%12===0){
      shuttle=null;render(raceElapsed);if(shuttle){const w=Math.min(W,shuttle.right)-Math.max(0,shuttle.left),h=Math.min(H,shuttle.clip,shuttle.bottom)-Math.max(0,shuttle.top);if(w>12&&h>8)visibleLaunch++;launch.push({index,age:orbitalLaunchPhase(),width:w,height:h});}
     }
    }
    drawOrbitalSprite=paint;stop();
    record(turbo?'clean-race-with-collected-turbos-about-105-seconds':'clean-race-without-turbo-about-109-seconds',player.finished&&raceElapsed>(turbo?102000:107000)&&raceElapsed<(turbo?108000:112000)&&wallFrames===0&&(!turbo||uses>=7),{seconds:raceElapsed/1000,turbos:uses,wallFrames});
    record('linear-finish-no-wrap-or-last-lap-'+turbo,player.z>=TRACK_LENGTH&&player.lap===2&&player.finishTime>0&&!lastLap&&lapTimes[1]===0,{z:player.z,finish:player.finishTime,lastLap});
    record('shuttle-visible-before-passing-'+turbo,visibleLaunch>=4&&launch.some(s=>s.age>1.35&&s.width>12&&s.height>8),{visibleSamples:visibleLaunch,samples:launch});
   }
   // Drive the shared field to actual crossings, including AI after the player.
   setup();let frames=0;
   for(;frames<18000&&[player,...opponents].some(c=>c.finishTime==null);frames++){steer(true);advanceRaceStep(1/60);}
   stop();updateHUD(0);const field=getRaceStandings();
   record('all-six-drivers-cross-with-real-times',field.length===6&&field.every(c=>c.finishTime>0&&c.z>=TRACK_LENGTH),{seconds:raceElapsed/1000,times:field.map(c=>({tag:c.driverTag,time:c.finishTime}))});
   state='result';renderScoreboard();
   record('scoreboard-and-continue',document.querySelectorAll('.results-table tbody tr').length===6&&document.querySelector('.result-course').textContent==='ORBITAL PASSAGE',{});
   document.getElementById('continueBtn').click();record('continue-returns-to-level-selection',state==='intro'&&!!document.getElementById('lvl8Btn'),{});
   setup();opponents=[];
   record('restart-resets-station-events',orbitalLaunchStart===null&&orbitalFlybyStart===null&&player.z===0,{});
   player.z=1555*150;updateOrbitalEvents();const start=orbitalLaunchStart,pose=JSON.stringify(orbitalShuttlePose());render(1000);render(9000);
   record('render-clock-does-not-animate-paused-launch',orbitalLaunchStart===start&&pose===JSON.stringify(orbitalShuttlePose()),{});
   for(const index of[500,1000,1800,2150,2700])for(const role of['player','ai'])for(const side of[-1,1]){
    const car=role==='player'?player:{...player};car.z=index*150;car.x=side*1.4;car.speed=4000;car.normalSpeed=4000;car.wallHitCooldown=0;car.wallContactSide=0;
    applyRoadContact(1/60,side*2,car);const limits=getRoadLimits(car.z);
    record(`solid-road-boundary-${role}-${index}-${side}`,car.x<=limits.right&&car.x>=-limits.left&&car.speed<4000&&car.wallContactSide===side,{x:car.x,speed:car.speed});
   }
   setup();opponents=[];player.speed=4320;
   const painted=new Set(),paint=drawOrbitalSprite;let suppress=false;
   drawOrbitalSprite=s=>{if(!suppress)paint(s);};
   const sceneSamples=[];
   for(const index of[0,45,175,260,450,650,905,980,1060,1140,1260,1410,1510,1600,1645,1705,1830,1990,2040,2200,2350,2440,2550,2620,2720,2850,2910,3015,3060]){
    player.z=(index+.2)*150;player.x=0;player.pitch=segments[index].hillDelta;player.fovOffset=0;player.curveAheadSmooth=0;curveCamera.look=0;
    raceElapsed=index/28.8*1000;orbitalLaunchStart=index>=1555?raceElapsed-(index-1555)/28.8*1000:null;orbitalFlybyStart=index>=2625?raceElapsed-(index-2625)/28.8*1000:null;
    for(let i=0;i<60;i++)updateCurveCamera(1/60);
    suppress=false;render(raceElapsed);const data=ctx.getImageData(0,0,W,H).data;
    shots.push({name:String(index),image:C.toDataURL()});suppress=true;render(raceElapsed);const baseline=ctx.getImageData(0,0,W,H).data;
    let changed=0;for(let i=0;i<data.length;i+=4)if(Math.max(Math.abs(data[i]-baseline[i]),Math.abs(data[i+1]-baseline[i+1]),Math.abs(data[i+2]-baseline[i+2]))>12)changed++;
    const section=orbitalProfile(index).key;if(changed>30)painted.add(section);sceneSamples.push({index,section,changed});
   }
   drawOrbitalSprite=()=>{};player.z=3060*150;player.x=0;player.pitch=0;player.fovOffset=0;curveCamera.look=0;render(0);
   const finishPixels=ctx.getImageData(0,0,W,H).data;let checkerPixels=0;
   for(let i=0;i<finishPixels.length;i+=4)if(finishPixels[i]===230&&finishPixels[i+1]===229&&finishPixels[i+2]===206)checkerPixels++;
   record('floor-finish-line-visible-with-batched-shell',checkerPixels>10,{pixels:checkerPixels});
   player.z=(ORBITAL_LENGTH+20)*150;render(0);shots.push({name:'runout',image:C.toDataURL()});
   record('finish-runout-stays-in-terminal',getSeg(player.z).index===ORBITAL_LENGTH+20&&orbitalProfile(getSeg(player.z).index).key==='panorama',{});
   drawOrbitalSprite=paint;
   record('landmarks-survive-wall-and-crest-occlusion',ORBITAL_SECTIONS.every(s=>painted.has(s.key)),{visibleDistricts:[...painted],samples:sceneSamples});
   // Actual continuous camera movement across slice boundaries, not just a
   // sequence of still pictures. Cars and scenery must remain attached.
   const anchor=drawCarSprite;let carAnchor;drawCarSprite=(...args)=>{if(!args[4])carAnchor={x:args[0],y:args[1]};anchor(...args);};initOpponents();opponents=opponents.slice(0,1);
   const jumps=[];
   for(const index of[180,450,650,980,1190,1550,1990,2240,2710]){
    const points=[];for(const delta of[-.001,.001]){player.z=index*150+delta;player.pitch=segments[index].hillDelta;opponents[0].z=index*150+1200;opponents[0].x=.3;carAnchor=null;render(0);points.push(carAnchor);}
    jumps.push(points.every(Boolean)?Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y):Infinity);
   }
   drawCarSprite=anchor;record('opponents-stable-at-segment-boundaries',jumps.every(n=>n<.02),{maximum:Math.max(...jumps)});
   const cache=[...orbitalArt.values()],bytes=cache.reduce((n,a)=>n+a.canvas.width*a.canvas.height*4,0);let writes=0;
   const fill=CanvasRenderingContext2D.prototype.fillRect;CanvasRenderingContext2D.prototype.fillRect=function(...args){if(orbitalArt.size&&[...orbitalArt.values()].some(a=>a.canvas===this.canvas))writes++;return fill.apply(this,args);};
   const before=orbitalArt.size;for(let i=0;i<10;i++)render(i*16);CanvasRenderingContext2D.prototype.fillRect=fill;
   record('bounded-static-art-cache',bytes<4*1024*1024&&orbitalArt.size===before&&writes===0,{MiB:bytes/1048576,tiles:before,writes});
   stop();return{checks,shots};
  });
  fs.mkdirSync(output,{recursive:true});for(const shot of result.shots)fs.writeFileSync(path.join(output,`orbital-${shot.name}.png`),Buffer.from(shot.image.split(',')[1],'base64'));
  return result.checks.map(c=>({...c,errors,pass:c.pass&&!errors.length}));
 }finally{await page.close();}
};
