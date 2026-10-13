// Reproduce Pages-style subdirectory hosting without a reachable font directory.
// Test both the source HTML and the production build in an actual browser.
const fs=require('node:fs');
const path=require('node:path');
module.exports=async function runFonts(browser){
  const results=[];
  for(const [name,filename]of[['source','index.html'],['build','dist/index.html']]){
    const html=fs.readFileSync(path.join(__dirname,'..',filename),'utf8');
    const page=await browser.newPage({viewport:{width:320,height:640}});
    const fontRequests=[],errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    try{
      await page.route('**/*',route=>{
        const request=route.request(),url=new URL(request.url());
        if(request.resourceType()==='font')fontRequests.push(url.pathname);
        if(url.pathname==='/Dash-Racer/')return route.fulfill({status:200,contentType:'text/html',body:html});
        // No font files: either a branch-based publish or a missing asset must work.
        return route.fulfill({status:404,body:'Not found'});
      });
      await page.goto('http://127.0.0.1:43219/Dash-Racer/',{waitUntil:'domcontentloaded'});
      const actual=await page.evaluate(async()=>{
        await document.fonts.load("12px 'Gravity Pixel'");
        await document.fonts.load("700 20px 'Gravity Pixel'");
        await document.fonts.ready;
        showMainMenu();selectLevel(1);startRace();state='playing';player.speed=4320;
        lapTimes=[49720,48330,0];player.lap=3;currentLapTime=21950;bestLapTime=48330;
        document.getElementById('cntNum').classList.remove('pop');updateHUD(1000);render(1000);
        return{faces:[...document.fonts].filter(f=>f.family.replace(/['"]/g,'')==='Gravity Pixel').map(f=>({weight:f.weight,status:f.status})),family:getComputedStyle(document.getElementById('placeVal')).fontFamily,timeSize:getComputedStyle(document.getElementById('timeLap1')).fontSize};
      });
      await page.screenshot({path:`/tmp/fonts-pages-${name}.png`});
      results.push({name:`gravity-fonts-load-in-${name}-on-pages-without-font-assets`,pass:fontRequests.length===0&&actual.faces.length===2&&actual.faces.every(f=>f.status==='loaded')&&actual.timeSize==='12px'&&errors.length===0,actual,fontRequests,errors});
    }catch(e){results.push({name:`gravity-fonts-load-in-${name}-on-pages-without-font-assets`,pass:false,error:e.message,fontRequests,errors});}
    finally{await page.close();}
  }
  return results;
};
