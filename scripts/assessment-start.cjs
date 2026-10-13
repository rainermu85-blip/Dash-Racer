// Check the built artwork URL and startup behavior under delayed/failed image loads.
module.exports=async function runStart(browser,baseUrl){
  const checks=[],errors=[],page=await browser.newPage({viewport:{width:390,height:844}});
  page.on('pageerror',e=>errors.push(e.message));
  let release;const imageHeld=new Promise(resolve=>{release=resolve;});
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.route('**/*.webp',async route=>{await imageHeld;await route.continue();});
  try{
    await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForTimeout(1800);
    const pending=await page.evaluate(()=>({ready:document.getElementById('introBox').classList.contains('show'),width:document.getElementById('introArt').naturalWidth,state}));
    checks.push({name:'start-waits-for-art-before-click-prompt',pass:!pending.ready&&pending.width===0&&pending.state==='intro',actual:pending});
    release();
    await page.waitForFunction(()=>document.getElementById('introArt').naturalWidth>0&&document.getElementById('introBox').classList.contains('show'),null,{polling:100});
    const loaded=await page.evaluate(()=>({width:introArt.naturalWidth,height:introArt.naturalHeight,url:introArt.currentSrc}));
    const prefix=new URL(baseUrl).pathname;
    checks.push({name:'start-art-loads-at-deployment-base',pass:loaded.width===1024&&loaded.height===1535&&new URL(loaded.url).pathname.startsWith(prefix+'assets/'),actual:loaded});
    await page.waitForTimeout(1100);
    await page.screenshot({path:'/tmp/dash-start-after.png'});
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
