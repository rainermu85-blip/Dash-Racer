// Anticipation tests plus real-track before/after images at identical positions.
module.exports=async function runCamera(browser,baseUrl){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
    await page.locator('#introScreen').evaluate(el=>el.style.transition='none');
    const checks=await page.evaluate(()=>{
      const checks=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
      selectLevel(1);startRace();state='playing';opponents.length=0;
      player.speed=4320;player.z=100*SEGMENT_LENGTH;
      const flatten=()=>{for(const s of segments)s.curve=s.hillDelta=s.worldY=0;};
      for(const side of[-1,1]){
        flatten();curveCamera.look=0;
        for(let i=124;i<200;i++)segments[i].curve=side*.4;
        // The bend starts outside the old twenty-segment window.
        for(let i=0;i<60;i++)updateCurveCamera(1/60);
        record(`looks-into-upcoming-bend-${side}`,curveCamera.look*side>.015&&Math.abs(curveCamera.look)<CAMERA_LOOK_LIMIT,{look:curveCamera.look});
      }
      flatten();segments.forEach(s=>s.curve=4);curveCamera.look=0;
      for(let i=0;i<300;i++)updateCurveCamera(1/60);
      record('sharp-bend-keeps-limited-view-offset',curveCamera.look<=CAMERA_LOOK_LIMIT&&curveCamera.look>CAMERA_LOOK_LIMIT-.001,{look:curveCamera.look});
      flatten();const previous=curveCamera.look;updateCurveCamera(1/60);
      const initialReturn=curveCamera.look;
      for(let i=0;i<120;i++)updateCurveCamera(1/60);
      record('returns-gradually-to-straight',initialReturn>previous*.9&&initialReturn<previous&&Math.abs(curveCamera.look)<.001,{previous,initialReturn,settled:curveCamera.look});
      segments.forEach(s=>s.curve=.15);
      const offsets=[];
      for(const fps of[30,60,120]){curveCamera.look=0;for(let i=0;i<fps;i++)updateCurveCamera(1/fps);offsets.push(curveCamera.look);}
      record('same-camera-smoothing-at-different-frame-rates',Math.max(...offsets)-Math.min(...offsets)<1e-8,{offsets});
      curveCamera.look=.1;paused=true;lastTime=1000;const draw=render;render=()=>{};loop(1016);render=draw;
      record('pause-freezes-camera',curveCamera.look===.1,{look:curveCamera.look});
      paused=false;startRace();record('restart-centers-camera',curveCamera.look===0);
      record('height-zoom-and-draw-distance-kept',CAMERA_HEIGHT===700&&CAMERA_DEPTH===.84&&DRAW_DISTANCE===300);
      return checks;
    });
    for(const level of[1,2,3,4,5,6]){
      const view=await page.evaluate(level=>{
        selectLevel(level);startRace();state='playing';opponents.length=0;player.speed=4320;
        let best=0,index=80;
        for(let i=50;i<SEGMENT_COUNT-80;i++){
          let total=0;for(let j=0;j<32;j++)total+=segments[i+j].curve;
          if(Math.abs(total)>best){best=Math.abs(total);index=i;}
        }
        player.z=index*SEGMENT_LENGTH;player.x=0;
        let nearCurve=0;for(let i=0;i<20;i++)nearCurve+=getSeg(player.z+i*SEGMENT_LENGTH).curve;
        player.curveAheadSmooth=nearCurve/20;
        document.getElementById('cntNum').classList.remove('pop');
        curveCamera.look=player.curveAheadSmooth*.35;updateHUD(1000);render(1000);
        return{index,oldLook:curveCamera.look,futureCenter:getSeg(player.z+player.speed*CAMERA_LOOK_SECONDS).proj_rx1};
      },level);
      await page.screenshot({path:`/tmp/camera-before-${level}.png`});
      const current=await page.evaluate(()=>{
        curveCamera.look=0;for(let i=0;i<90;i++)updateCurveCamera(1/60);
        render(1000);return{look:curveCamera.look,carX:playerLastScreenX,futureCenter:getSeg(player.z+player.speed*CAMERA_LOOK_SECONDS).proj_rx1};
      });
      await page.screenshot({path:`/tmp/camera-after-${level}.png`});
      checks.push({name:`rendered-curve-level-${level}`,pass:Number.isFinite(current.carX)&&Math.abs(current.look)<=.42&&current.carX>W_SAFE_LEFT&&current.carX<390-W_SAFE_LEFT,actual:{...view,...current}});
      checks.push({name:`upcoming-road-center-is-closer-to-view-center-level-${level}`,pass:Math.abs(current.futureCenter-195)<Math.abs(view.futureCenter-195),actual:{oldCenter:view.futureCenter,newCenter:current.futureCenter}});
    }
    return checks.map(c=>({...c,errors,pass:c.pass&&errors.length===0}));
  }finally{await page.close();}
};
const W_SAFE_LEFT=39;
