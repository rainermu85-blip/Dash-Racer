// Native RAF sampling with CPU throttling. Run by itself, not beside other browser tests.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.BROWSER_PATH||'/usr/bin/chromium'}),p=await b.newPage({viewport:{width:390,height:844}});
await p.addInitScript(()=>{window.__raf=requestAnimationFrame.bind(window);requestAnimationFrame=()=>0;localStorage.setItem('turboDash.playerTag','ACE');});
await p.goto(process.env.BASE_URL||'http://127.0.0.1:3007/Dash-Racer/');await p.evaluate(()=>document.fonts.ready);
const cdp=await p.context().newCDPSession(p);const cpuRate=Number(process.env.CPU_RATE||2);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuRate});
const sections=(process.env.PROFILE_SECTIONS||'').split(',').filter(Boolean);
const results=await p.evaluate(async sections=>{
 selectLevel(7);startRace();state='playing';player.speed=4320;const samples=[];
 for(let [name,index]of[['lagoon',100],['airport-gate',1430],['thai-cove',1115],['jungle',790],['waterfall',840],['arch',2810],['airport',1490],['harbour',2140],['harbour-quay',2220],['harbour-exit',2340],['bridge',2490],['regatta',400],['ferry',1800],['dolphins',3250]].filter(([name])=>!sections.length||sections.includes(name))){
  index=paradiseIndex(index);initParadiseTraffic();paradiseTrafficActive=true;
  const elapsed=index/28.8+2.2;
  for(const car of paradiseTraffic){car.z-=car.speed*elapsed;car.departed=car.z<index*150-2000;}
  paradiseDiveStart=name==='thai-cove'?(index/28.8-1)*1000:null;
  player.z=index*150;player.x=1/3;player.pitch=segments[index].hillDelta;curveCamera.look=0;
  for(let i=0;i<60;i++)updateCurveCamera(1/60);
  const durations=[],frames=[];let previous;
  await new Promise(done=>{let f=0;const tick=ts=>{if(previous!==undefined&&f>10)frames.push(ts-previous);previous=ts;player.z=(index+f*.48)*150;if(paradiseTrafficActive)for(const car of paradiseTraffic)if(!car.departed)car.z-=car.speed/60;raceElapsed=(index/28.8+f/60)*1000;paradisePlane.elapsed=name.startsWith('airport')?Math.max(0,(player.z/150-(PARADISE_PLANE_SEGMENT-205))/28.8):null;const start=performance.now();render(ts);durations.push(performance.now()-start);if(++f<120)__raf(tick);else done();};__raf(tick);});
  frames.sort((a,b)=>a-b);durations.sort((a,b)=>a-b);samples.push({name,medianFrame:frames[Math.floor(frames.length*.5)],p95Frame:frames[Math.floor(frames.length*.95)],p95Render:durations[114],framesOver50ms:frames.filter(t=>t>50).length});
 }
 return{samples,sceneryMiB:[...paradiseArt.values()].reduce((n,a)=>n+a.canvas.width*a.canvas.height*4,0)/1048576};
},sections);console.log(JSON.stringify({cpuRate,...results},null,2));await b.close();})();
