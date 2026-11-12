// Canvas render microbenchmark with readback, not measured display FPS.
// Run alone: other browser jobs distort timing, especially at 2x CPU.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'/usr/bin/chromium'});
 const page=await browser.newPage({viewport:{width:390,height:844}}),results=[];
 try{
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;localStorage.setItem('turboDash.playerTag','ACE');});
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:3007/Dash-Racer/');
  await page.evaluate(()=>document.fonts.ready);
  const session=await page.context().newCDPSession(page);
  for(const rate of[1,2]){
   await session.send('Emulation.setCPUThrottlingRate',{rate});
   results.push(await page.evaluate(rate=>{
    selectLevel(8);startRace();state='playing';
    for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';
    player.speed=4320;const result=[];
    for(const [section,index]of[['arrival',30],['service',530],['glass',1050],['launch',1600],['reactor',2180],['panorama',2670]]){
     player.z=index*150;player.pitch=segments[index].hillDelta;player.x=0;
     player.fovOffset=0;curveCamera.look=0;player.curveAheadSmooth=0;
     raceElapsed=index/28.8*1000;orbitalLaunchStart=section==='launch'?raceElapsed-1800:null;
     for(let i=0;i<30;i++){updateCurveCamera(1/60);render(raceElapsed);}
     const samples=[];
     for(let frame=0;frame<90;frame++){
      player.z+=72;raceElapsed+=1000/60;updateCurveCamera(1/60);
      const start=performance.now();render(raceElapsed);
      ctx.getImageData(0,0,1,1); // Force pending Canvas work to complete.
      samples.push(performance.now()-start);
     }
     samples.sort((a,b)=>a-b);
     result.push({section,median:samples[45],p95:samples[85],max:samples[89]});
    }
    return{rate,samples:result};
   },rate));
  }
 }finally{await browser.close();}
 const output=process.env.ASSESSMENT_DIR||'/tmp/orbital-profile';
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'orbital-profile.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results));
})().catch(error=>{console.error(error);process.exitCode=1;});
