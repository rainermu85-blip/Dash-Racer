// Check the built artwork URL and startup behavior under delayed/failed image loads.
module.exports=async function runStart(browser,baseUrl){
  const checks=[],errors=[],page=await browser.newPage({viewport:{width:390,height:844}});
  page.on('pageerror',e=>errors.push(e.message));
  let release;const imageHeld=new Promise(resolve=>{release=resolve;});
  await page.addInitScript(()=>{
    window.requestAnimationFrame=()=>0;
    const decode=HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode=async function(...args){
      await decode.apply(this,args);
      if(this.id==='introArt')window.introDecodedAt=performance.now();
    };
  });
  await page.route('**/*.webp',async route=>{await imageHeld;await route.continue();});
  try{
    await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForTimeout(1800);
    const pending=await page.evaluate(()=>({ready:document.getElementById('introBox').classList.contains('show'),width:document.getElementById('introArt').naturalWidth,state}));
    checks.push({name:'start-waits-for-art-before-click-prompt',pass:!pending.ready&&pending.width===0&&pending.state==='intro',actual:pending});
    release();
    await page.waitForFunction(()=>window.introDecodedAt>0,null,{polling:20});
    await page.waitForTimeout(700);
    const hidden=await page.evaluate(()=>({ready:introBox.classList.contains('show'),opacity:getComputedStyle(introBox).opacity}));
    checks.push({name:'start-gives-artwork-time-before-fading-prompt',pass:!hidden.ready&&hidden.opacity==='0',actual:hidden});
    await page.waitForFunction(()=>document.getElementById('introArt').naturalWidth>0&&document.getElementById('introBox').classList.contains('show'),null,{polling:100});
    const fade=await page.evaluate(()=>({elapsed:performance.now()-introDecodedAt,duration:getComputedStyle(introBox).transitionDuration}));
    checks.push({name:'start-prompt-delayed-1-5-seconds-with-quick-fade',pass:fade.elapsed>=1490&&fade.elapsed<1900&&fade.duration==='0.25s',actual:fade});
    const loaded=await page.evaluate(()=>({width:introArt.naturalWidth,height:introArt.naturalHeight,url:introArt.currentSrc}));
    const prefix=new URL(baseUrl).pathname;
    checks.push({name:'start-art-loads-at-deployment-base',pass:loaded.width===1024&&loaded.height===1535&&new URL(loaded.url).pathname.startsWith(prefix+'assets/'),actual:loaded});
    await page.waitForTimeout(300);
    await page.screenshot({path:'/tmp/dash-start-after.png'});
    for(const viewport of[{width:320,height:640},{width:480,height:800}]){
      await page.setViewportSize(viewport);
      const position=await page.evaluate(()=>{
        const art=introArt.getBoundingClientRect(),box=introBox.getBoundingClientRect();
        const artHeight=Math.min(art.height,art.width*introArt.naturalHeight/introArt.naturalWidth);
        const relativeY=(box.y+box.height/2-art.y-(art.height-artHeight)/2)/artHeight;
        return{relativeY,left:box.left,right:box.right};
      });
      checks.push({name:`start-prompt-on-car-at-${viewport.width}`,pass:position.relativeY>.62&&position.relativeY<.70&&position.left>=0&&position.right<=viewport.width,actual:position});
      await page.screenshot({path:`/tmp/dash-start-${viewport.width}.png`});
    }
    await page.locator('#introBox').click();
    const menu=await page.evaluate(()=>document.getElementById('introScreen').classList.contains('hide')&&!document.getElementById('overlay').classList.contains('hide'));
    checks.push({name:'start-click-opens-level-menu',pass:menu});
    await page.unroute('**/*.webp');
    await page.route('**/*.webp',route=>route.abort());
    await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>introArt.naturalWidth>0&&document.getElementById('introBox').classList.contains('show'),null,{polling:100});
    const fallback=await page.evaluate(()=>({width:introArt.naturalWidth,url:introArt.currentSrc}));
    checks.push({name:'start-falls-back-to-original-artwork',pass:fallback.width===1024&&new URL(fallback.url).pathname===prefix+'Welcome.png',actual:fallback});
    return checks.map(c=>({...c,errors,pass:c.pass&&errors.length===0}));
  }finally{release();await page.close();}
};
