// Serve both repository and build as plain static files. Exercise the live RAF
// loop and UI across level switches, rather than calling startRace in isolation.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const output=process.env.ASSESSMENT_DIR||'/tmp/dash-level-loading';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'/usr/bin/chromium'}),results=[];
 try{
  for(const hosting of['repository-root','production-build']){
   const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),errors=[],missing=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>localStorage.setItem('turboDash.playerTag','ACE'));
   const prefix='/Dash-Racer/',origin='http://static-game.test';
   await page.route(origin+'/**',async route=>{
    const url=new URL(route.request().url()),relative=url.pathname.startsWith(prefix)?url.pathname.slice(prefix.length):url.pathname.slice(1);
    const file=path.join(root,hosting==='production-build'?'dist':'',relative||'index.html');
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf'};
    try{await route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'application/octet-stream'});}
    catch{missing.push(url.pathname);await route.fulfill({status:404,body:'Not found',contentType:'text/html'});}
   });
   try{
    await page.goto(origin+prefix);await page.locator('#introBox.show').tap();
    await page.evaluate(()=>{window.__frames=0;const original=render;render=function(...args){__frames++;return original(...args);};});
    for(const id of[7,1,2,3,4,5,6,7]){
     const before=await page.evaluate(()=>__frames);
     await page.locator('#lvl'+id+'Btn').tap();
     await page.waitForTimeout(250); // Menu preview must not kill the frame loop.
     await page.locator('#startBtn').tap();await page.waitForFunction(()=>state==='playing',{},{timeout:12000});
     await page.waitForTimeout(150);
     const actual=await page.evaluate(()=>({level:currentLevel,state,z:player.z,frames:__frames,segments:SEGMENT_COUNT,lap:document.getElementById('lapVal').textContent}));
     if(id===7||id===1)await page.screenshot({path:path.join(output,`${hosting}-level-${id}.png`)});
     await page.locator('#pauseButton').click();
     await page.locator('#exitRaceBtn').tap();
     const menu=await page.locator('#startBtn').isVisible();
     const pass=actual.level===id&&actual.state==='playing'&&actual.z>0&&actual.frames>before+10&&menu&&!errors.length&&!missing.length;
     const row={hosting,id,pass,actual,errors:[...errors],missing:[...missing]};results.push(row);console.log(JSON.stringify(row));
    }
   }catch(error){const row={hosting,pass:false,error:error.message,errors,missing};results.push(row);console.log(JSON.stringify(row));}
   finally{await page.close();}
  }
 }finally{await browser.close();fs.writeFileSync(path.join(output,'level-loading.json'),JSON.stringify(results,null,2));}
 if(results.some(r=>!r.pass))process.exitCode=1;
})();
