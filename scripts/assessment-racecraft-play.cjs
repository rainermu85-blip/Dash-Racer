// Automated key-only driving on unchanged courses. No speed, position, geometry
// or AI overrides after starting; rendering is skipped while fast-forwarding.
module.exports=async function runRacecraftPlay(browser,baseUrl,output){
 const fs=require('node:fs'),path=require('node:path'),results=[];
 const trials=[1989,2026,2001].flatMap(seed=>[1,2,3,4,5,6].map(level=>({level,seed,style:'tactical'})));
 trials.push({level:4,seed:1989,style:'conservative'});
 for(const trial of trials){
  const {level}=trial;
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
const data=await page.evaluate(({level,seedValue,style})=>{
let seed=seedValue;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);selectLevel(level);startRace();state='playing';let ts=1000;lastTime=ts;smoothedDt=1/60;const draw=render;render=()=>{};
let target=0,rank=6,leadChanges=0,lastLeader=0,playerBoosts=0,passes=0,lastOrder=[],contacts=0,pcontacts=0;const aiBoosts=[0,0,0,0,0],modes={},spreads=[],timeline=[];let f=0;
for(;f<60*360&&!player.finished;f++){
if(f%10===0){
 const physical=racePosition(player),speed=player.speed;const candidates=[-.65,-.32,0,.32,.65];let objects=[];let left=.72,right=.72;
 for(let n=0;n<20;n++){const seg=getSeg(player.z+getPlayerContactDistance()+n*SEGMENT_LENGTH),lim=getRoadLimits(player.z+getPlayerContactDistance()+n*SEGMENT_LENGTH);left=Math.min(left,lim.left-.15);right=Math.min(right,lim.right-.15);for(const k of ['barrier','parkedCar','lightning','pylon']){const o=seg[k];if(o&&(o.active||k==='parkedCar')){objects.push({x:o.x,type:k,n,width:k==='barrier'?(o.halfWidth??.45)+.05:.3});if(k==='lightning'||k==='pylon'&&level===6)candidates.push(o.x);}}}
const unique=[...new Set(candidates.map(x=>clamp(x,-left,right)))];
let best=-Infinity;for(const lane of unique){let score=-Math.abs(lane-target)*.6-Math.abs(lane-player.x)*.4;
for(const o of objects)if(Math.abs(lane-o.x)<o.width)score+=o.type==='lightning'?(player.boosts<3?3:0):o.type==='pylon'?(level===6?1.5:-.5):-12;
for(const other of opponents){const gap=racePosition(other)-physical,pred=gap-(speed-other.speed)*.5;if(gap>-150&&gap<2200&&Math.abs(other.x-lane)<.34)score-=6;if(Math.abs(pred)<200&&other.x>Math.min(lane,player.x)-.28&&other.x<Math.max(lane,player.x)+.28)score-=15;}
if(level===6){const idx=getSeg(player.z+getPlayerContactDistance()+8*SEGMENT_LENGTH).index;const i=panelStarts.findIndex(s=>idx>=s-12&&idx<s+6);if(i>=0&&Math.abs(lane-(i%2? .5:-.5))<.28)score+=3;}
if(score>best){best=score;target=lane;}}
}
keys.left=player.x>target+.018;keys.right=player.x<target-.018;
let curve=0;for(let n=0;n<20;n++)curve+=Math.abs(getSeg(player.z+n*SEGMENT_LENGTH).curve)/20;
const near=opponents.some(o=>racePosition(o)>racePosition(player)&&racePosition(o)-racePosition(player)<1200&&Math.abs(o.x-player.x)<.32);
keys.boost=style!=='conservative'&&player.boosts>0&&!player.isBoosting&&!player.isChevronBoosting&&!near&&curve<1.1&&Math.abs(player.x-target)<.12;
if(style==='conservative'){target=0;}
const boosts=opponents.map(o=>o.isBoosting),pboost=player.isBoosting,pc=player.collisionCooldown;ts+=1000/60;loop(ts);
if(player.isBoosting&&!pboost)playerBoosts++;if(player.collisionCooldown>pc)pcontacts++;
opponents.forEach((o,i)=>{if(o.isBoosting&&!boosts[i])aiBoosts[i]++;modes[o.maneuver]=(modes[o.maneuver]||0)+1;});
if(f%30===0){const order=[player,...opponents].map((c,i)=>({i,z:getRaceDistance(c)})).sort((a,b)=>b.z-a.z);rank=order.findIndex(c=>c.i===0)+1;if(lastLeader!==order[0].i){leadChanges++;lastLeader=order[0].i;}if(lastOrder.length){for(let i=0;i<5;i++)for(let j=i+1;j<6;j++)if(Math.sign(lastOrder.indexOf(i)-lastOrder.indexOf(j))!==Math.sign(order.findIndex(o=>o.i===i)-order.findIndex(o=>o.i===j)))passes++;}lastOrder=order.map(o=>o.i);spreads.push(order[0].z-order[5].z);}
if(f===2700){render=draw;introScreen.style.display='none';document.getElementById('overlay').classList.add('hide');draw(ts);window.racecraftFrame=ctx.canvas.toDataURL('image/png');render=()=>{};}
if(f%900===0)timeline.push({t:f/60,rank,gaps:opponents.map(o=>Math.round((getRaceDistance(o)-getRaceDistance(player))/4320*10)/10)});
}
render=draw;introScreen.style.display='none';document.getElementById('overlay').classList.add('hide');draw(ts);clearTimeout(resultTimer);
rank=getRaceStandings().indexOf(player)+1;
// Keep pace/balance measurements at the player's finish, as in earlier runs.
const fieldAtPlayerFinish={
 turboHistories:opponents.map(o=>({starts:[...o.randomTurboStarts],age:o.raceAge,readyAt:o.randomTurboReadyAt})),
 speed:opponents.map(o=>o.speed),gaps:opponents.map(o=>Math.round((getRaceDistance(o)-getRaceDistance(player))/4320*10)/10)
};
const completionDeadline=raceElapsed+360000;
while(opponents.some(o=>o.finishTime==null)&&raceElapsed<completionDeadline)advanceRaceStep(MAX_PHYSICS_STEP);
const classification=getRaceStandings().map(c=>({tag:c.driverTag,time:c.finishTime}));
const rankStable=getRaceStandings().indexOf(player)+1===rank;
const totalMatchesLaps=Math.abs(player.finishTime-lapTimes.reduce((a,b)=>a+b,0))<.001;
return{level,seconds:f/60,rank,classification,rankStable,totalMatchesLaps,finished:player.finished,leadChanges,passes,playerBoosts,aiBoosts,pcontacts,modes,timeline,spread:Math.round(spreads.reduce((a,b)=>a+b,0)/spreads.length),...fieldAtPlayerFinish};
},{level,seedValue:trial.seed,style:trial.style});
   const frame=await page.evaluate(()=>window.racecraftFrame);
   if(output&&frame)fs.writeFileSync(path.join(output,`racecraft-${level}-${trial.seed}-${trial.style}.png`),Buffer.from(frame.split(',')[1],'base64'));
   const boundedTurbos=data.turboHistories.every(h=>h.starts.length<=6&&h.starts.every((t,i)=>
    h.starts.filter(s=>s<=t&&t-s<30-1e-8).length<=2&&
    (i===h.starts.length-1||h.starts[i+1]-t>=1.2+(h.starts.slice(0,i).some(s=>t-s<30-1e-8)?18:6)-1e-6)));
   results.push({name:`full-field-${level}-${trial.seed}-${trial.style}`,pass:data.finished&&data.classification.every(c=>Number.isFinite(c.time))&&data.rankStable&&data.totalMatchesLaps&&data.passes>=4&&data.spread>1800&&data.speed.every(Number.isFinite)&&boundedTurbos&&errors.length===0,actual:data,errors});
  }finally{await page.close();}
 }
 const tactical=results.find(r=>r.name==='full-field-4-1989-tactical').actual;
 const conservative=results.find(r=>r.name==='full-field-4-1989-conservative').actual;
 results.push({name:'tactical-turbos-improve-race-time',pass:tactical.seconds<conservative.seconds,actual:{tactical:tactical.seconds,conservative:conservative.seconds}});
 const tacticalRuns=results.filter(r=>r.name.endsWith('-tactical')).map(r=>r.actual);
 const averageRank=tacticalRuns.reduce((sum,r)=>sum+r.rank,0)/tacticalRuns.length;
 results.push({name:'reference-driver-averages-second-to-third',pass:averageRank>=2&&averageRank<=3,actual:{averageRank,ranks:tacticalRuns.map(r=>({level:r.level,rank:r.rank}))}});
 return results;
};
