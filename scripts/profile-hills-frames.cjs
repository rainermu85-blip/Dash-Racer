// Controlled RAF/canvas comparison; run without concurrent browser tests.
const {chromium}=require('playwright'),{execFileSync}=require('node:child_process');
const baseUrl=process.env.BASE_URL||'http://127.0.0.1:3007/Dash-Racer/';
(async()=>{const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'/usr/bin/chromium'}),results=[];
for(const [version,ref]of[['pre-evening','fefa800'],['reported-stutter','8322173'],['fix',null]]){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{
  window.__nativeRAF=requestAnimationFrame.bind(window);requestAnimationFrame=()=>0;localStorage.setItem('turboDash.playerTag','ACE');
  window.__canvases=[];const create=document.createElement.bind(document);document.createElement=(tag,...args)=>{const e=create(tag,...args);if(tag==='canvas')__canvases.push(e);return e;};
  window.__writes=0;window.__images=0;window.__measure=false;
  for(const name of['drawImage','fillRect','clearRect','fill','stroke']){
   const fn=CanvasRenderingContext2D.prototype[name];CanvasRenderingContext2D.prototype[name]=function(...args){
    if(__measure){if(this.canvas!==window.__main)__writes++;else if(name==='drawImage')__images++;}return fn.apply(this,args);
   };
  }
 });
 if(ref){const source=execFileSync('git',['show',ref+':index.html'],{encoding:'utf8'});await page.route(baseUrl,r=>r.fulfill({contentType:'text/html',body:source}));}
 await page.goto(baseUrl);await page.evaluate(()=>document.fonts.ready);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:2});
 const data=await page.evaluate(async()=>{
  selectLevel(3);startRace();state='playing';opponents=[];window.__main=C;player.speed=4320;
  const samples=[];
  for(const lap of[1,3]){
   player.lap=lap;player.z=835*150;player.x=0;player.pitch=segments[835].hillDelta;curveCamera.look=0;
   for(let j=0;j<60;j++)updateCurveCamera(1/60);for(let j=0;j<5;j++)render(2000+j*16);
   __writes=0;__images=0;__measure=true;let previous=null;const times=[],renders=[];
   await new Promise(resolve=>{let frame=0;function tick(ts){
    if(previous!==null&&frame>8)times.push(ts-previous);previous=ts;
    player.z=(835+frame*.48)*150;const start=performance.now();render(ts);renders.push(performance.now()-start);
    if(++frame<120)__nativeRAF(tick);else resolve();
   }__nativeRAF(tick);});
   __measure=false;times.sort((a,b)=>a-b);renders.sort((a,b)=>a-b);
   samples.push({lap,medianFrameMs:times[Math.floor(times.length*.5)],p95FrameMs:times[Math.floor(times.length*.95)],over50ms:times.filter(t=>t>50).length,medianRenderMs:renders[60],p95RenderMs:renders[114],offscreenWrites:__writes,imageDrawsPerFrame:__images/120});
  }
  return{samples,canvasCount:__canvases.length,canvasMiB:__canvases.reduce((n,c)=>n+c.width*c.height*4,0)/1048576};
 });
 results.push({version,...data});await page.close();
}
console.log(JSON.stringify(results,null,2));await browser.close();})();
