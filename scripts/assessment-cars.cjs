// Compare painted exhaust mouths with particle origins, then capture real road views.
module.exports=async function runCars(browser,baseUrl){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
    await page.evaluate(async()=>{
      await document.fonts.ready;
      for(const id of['introScreen','overlay','cntNum']){
        const el=document.getElementById(id);el.style.transition='none';el.style.display='none';
      }
    });
    const checks=await page.evaluate(()=>{
      const checks=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
      selectLevel(1);startRace();state='playing';
      for(const isPlayer of[true,false])for(const sc of[.18,.7,1.3])for(const lean of[-.12,0,.12]){
        ctx.resetTransform();ctx.clearRect(0,0,W,H);smokeParticles.length=0;
        const painted=[],arc=ctx.arc;
        ctx.arc=function(x,y,r,...rest){
          if(this.fillStyle==='#c4c2d4'){
            const p=new DOMPoint(x,y).matrixTransform(this.getTransform());painted.push({x:p.x,y:p.y,r});
          }
          return arc.call(this,x,y,r,...rest);
        };
        try{drawCarSprite(195,350,sc,'#00f0ff',isPlayer,lean);}
        finally{ctx.arc=arc;}
        const transform=ctx.getTransform();
        spawnExhaustSmoke(195,350,sc,isPlayer,lean);
        const maxOffset=painted.length===4&&smokeParticles.length===4?Math.max(...painted.map((p,i)=>Math.hypot(p.x-smokeParticles[i].x,p.y-smokeParticles[i].y))):Infinity;
        // Canvas matrices use finite precision; a thousandth of a pixel is invisible.
        const aligned=maxOffset<.001;
        const pairs=painted.length===4&&painted[1].x-painted[0].x<(painted[2].x-painted[1].x)/2&&painted[3].x-painted[2].x<(painted[2].x-painted[1].x)/2;
        record(`four-outlets-and-smoke-${isPlayer?'player':'opponent'}-${sc}-${lean}`,aligned&&pairs&&transform.isIdentity,{painted,maxOffset,aligned,pairs});
        if(lean===0&&sc===1.3){
          const g=getCarGeometry(195,350,sc,isPlayer);
          const visible=[.14,.86].every(fraction=>{
            const rgba=ctx.getImageData(g.px+g.bw*fraction,g.py+g.bh*.87,1,1).data;
            return rgba[3]===255&&rgba[0]<16&&rgba[1]<16&&rgba[2]<24;
          });
          record(`two-visible-rear-tires-${isPlayer?'player':'opponent'}`,visible);
        }
      }
      ctx.clearRect(0,0,W,H);smokeParticles.length=0;
      drawCarSprite(195,350,1.3,'#ffc521',true,.12,0,0,false,false,true);
      const ports=getCarExhausts(195,350,1.3,true,.12);
      record('chevron-particles-leave-real-rotated-outlets',smokeParticles.length>0&&smokeParticles.every(p=>ports.some(port=>Math.abs(p.x-port.x)<6&&Math.abs(p.y-port.y-port.radius)<1e-8))&&ctx.getTransform().isIdentity);
      return checks;
    });
    // Clean spread at the game's drawing scale, rather than generated concept art.
    await page.evaluate(()=>{
      for(const id of['hud','progBar','timeBoard','segmentBoard','turboGauge','pauseButton','btns','energyBoard','cntNum'])document.getElementById(id).style.display='none';
      ctx.fillStyle='#10091e';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#dfcdee';ctx.font="12px 'Gravity Pixel'";
      ctx.fillText('YOUR COUNTACH',W/2,100);drawCarSprite(W/2,275,1.5,'#ffc521',true);
      ctx.fillStyle='#dfcdee';ctx.fillText('THE RACING FIELD',W/2,380);
      opponents.forEach((o,i)=>drawCarSprite(i<3?65+i*130:130+(i-3)*130,i<3?505:650,.8,o.color,false));
      ctx.fillStyle='#dfcdee';ctx.fillText('BRAKING / TURBO',W/2,710);
      drawCarSprite(100,815,.85,'#ffc521',true,0,0,0,false,true);
      drawCarSprite(290,780,.85,'#ffc521',true,0,0,0,true);
    });
    await page.screenshot({path:'/tmp/countach-implemented.png'});
    for(const level of[1,2,3,4,5,6]){
      const actual=await page.evaluate(level=>{
        selectLevel(level);startRace();state='playing';player.z=120*SEGMENT_LENGTH;player.x=0;player.speed=4320;
        opponents.forEach((o,i)=>{o.z=player.z+getPlayerContactDistance()+650+i*320;o.lap=player.lap;o.x=[-.55,.55,0,-.5,.5][i];o.isBoosting=false;o.isChevronBoosting=false;});
        document.getElementById('cntNum').style.display='none';
        for(let i=0;i<60;i++)updateCurveCamera(1/60);
        render(1000);
        return{carX:playerLastScreenX,colors:opponents.map(o=>o.color)};
      },level);
      await page.screenshot({path:`/tmp/countach-road-${level}.png`});
      checks.push({name:`road-view-level-${level}`,pass:Number.isFinite(actual.carX)&&actual.carX>39&&actual.carX<351,actual});
    }
    await page.setViewportSize({width:320,height:640});
    await page.evaluate(()=>{selectLevel(4);startRace();state='playing';player.z=120*SEGMENT_LENGTH;keys.left=true;player.steerLean=-1;render(1000);});
    await page.screenshot({path:'/tmp/countach-road-320.png'});
    return checks.map(c=>({...c,errors,pass:c.pass&&errors.length===0}));
  }finally{await page.close();}
};
