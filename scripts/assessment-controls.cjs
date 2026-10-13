// Real Chromium touch events exercise capture, independent fingers and keyboard input.
module.exports=async function runControls(browser,baseUrl){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  const record=(name,pass,actual)=>checks.push({name,pass,actual});
  try{
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>{
      showMainMenu();selectLevel(1);startRace();state='playing';opponents.length=0;
      for(const s of segments){s.curve=s.hillDelta=s.worldY=0;s.pylon=s.barrier=s.lightning=null;}
      player.z=100*SEGMENT_LENGTH;player.speed=3600;player.boosts=2;lastTime=1000;smoothedDt=1/60;
      window.controlTime=1000;document.getElementById('cntNum').classList.remove('pop');
      window.controlTick=(count=1)=>{const draw=render;render=()=>{};try{for(let n=0;n<count;n++){controlTime+=1000/60;loop(controlTime);}}finally{render=draw;}render(controlTime);};
      updateHUD(controlTime);render(controlTime);
    });
    const input=await page.context().newCDPSession(page);
    const touch=(type,points=[])=>input.send('Input.dispatchTouchEvent',{type,touchPoints:points});
    const left={id:1,x:60,y:280},right={id:1,x:300,y:280};
    const tick=n=>page.evaluate(n=>controlTick(n),n||1);
    const state=()=>page.evaluate(()=>({keys:{...keys},x:player.x,boosting:player.isBoosting,charges:player.boosts,active:turboButton.classList.contains('boosting'),leftOn:steerLeft.classList.contains('on'),rightOn:steerRight.classList.contains('on'),paused}));
    await touch('touchStart',[left]);await tick();let current=await state();
    record('upper-left-half-steers-car-and-arrow-only',current.keys.left&&current.x<0&&current.leftOn&&await page.evaluate(()=>getComputedStyle(steerLeft).backgroundColor==='rgba(0, 0, 0, 0)'),current);
    await touch('touchEnd');current=await state();record('touch-release-clears-steering',!current.keys.left&&!current.leftOn,current);
    const before=current.x;await touch('touchStart',[right]);await tick();current=await state();
    record('upper-right-half-steers-car',current.keys.right&&current.rightOn&&current.x>before,current);await touch('touchEnd');
    await touch('touchStart',[left]);await touch('touchMove',[right]);current=await state();
    record('finger-crossing-center-changes-side',!current.keys.left&&current.keys.right,current);await touch('touchEnd');
    await touch('touchStart',[left]);await page.keyboard.down('ArrowLeft');await touch('touchEnd');
    current=await state();record('pointer-release-keeps-held-keyboard-input',current.keys.left&&current.leftOn,current);
    await page.keyboard.up('ArrowLeft');
    const box=await page.locator('#turboButton').boundingBox(),button={id:2,x:box.x+box.width/2,y:box.y+box.height/2};
    await touch('touchStart',[left]);await touch('touchStart',[left,button]);await tick();current=await state();
    record('red-button-boosts-while-other-finger-steers',current.boosting&&current.charges===1&&current.keys.left&&!current.keys.right&&current.active,current);
    await page.screenshot({path:'/tmp/controls-turbo-active.png'});
    // CDP touchEnd names the released point; the other finger stays down.
    await touch('touchEnd',[button]);await tick();current=await state();
    record('turbo-feedback-persists-after-button-release',current.active&&current.boosting&&current.keys.left&&!current.keys.boost,current);
    await touch('touchEnd');await tick(90);current=await state();record('turbo-feedback-clears-when-boost-ends',!current.boosting&&!current.active,current);
    const scale=await page.locator('#boostContainer').boundingBox();
    await touch('touchStart',[{id:3,x:scale.x+scale.width/2,y:scale.y+scale.height/2}]);await tick();current=await state();
    record('original-meter-still-activates-turbo-without-steering',current.boosting&&current.charges===0&&!current.keys.left&&!current.keys.right,current);await touch('touchEnd');await tick(90);
    await touch('touchStart',[button]);await tick();current=await state();record('empty-button-does-not-give-free-turbo',!current.boosting&&current.charges===0,current);await touch('touchEnd');
    await page.evaluate(()=>{player.boosts=2;updateHUD(controlTime);});
    await page.locator('#turboButton').tap();await tick();current=await state();
    record('quick-tap-survives-between-simulation-frames',current.boosting&&current.charges===1&&!current.keys.boost,current);
    await tick(90);current=await state();record('one-tap-spends-only-one-charge',!current.boosting&&current.charges===1,current);
    await page.evaluate(()=>turboButton.click());await tick();current=await state();
    record('accessible-click-activation-triggers-turbo',current.boosting&&current.charges===0,current);await tick(90);
    await page.evaluate(()=>{player.boosts=1;updateHUD(controlTime);turboButton.focus();});
    await page.keyboard.down('Enter');await tick();current=await state();
    record('turbo-button-is-keyboard-operable',current.boosting&&current.charges===0&&!current.keys.left&&!current.keys.right,current);
    await page.keyboard.up('Enter');await tick(90);
    const arrow=await page.locator('#bL').boundingBox();
    await touch('touchStart',[{id:4,x:arrow.x+arrow.width/2,y:arrow.y+arrow.height/2}]);current=await state();
    record('bottom-arrows-remain-steering-targets',current.keys.left&&current.leftOn,current);await touch('touchEnd');
    await touch('touchStart',[left]);await touch('touchCancel');current=await state();record('touch-cancel-clears-steering',!current.keys.left&&!current.leftOn,current);
    await page.keyboard.down('ArrowRight');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));current=await state();
    record('focus-loss-clears-input-and-arrows',!current.keys.right&&!current.rightOn,current);await page.keyboard.up('ArrowRight');
    await page.locator('#pauseButton').tap();const frozen=await page.evaluate(()=>({z:player.z,time:currentLapTime}));await tick(60);
    const stopped=await page.evaluate(()=>({z:player.z,time:currentLapTime,paused,pressed:pauseButton.getAttribute('aria-pressed')}));
    record('top-pause-button-freezes-race',stopped.paused&&stopped.pressed==='true'&&stopped.z===frozen.z&&stopped.time===frozen.time,stopped);
    await page.locator('#resumeBtn').tap();await tick();current=await state();record('resume-does-not-restore-stale-input',!current.paused&&!current.keys.left&&!current.keys.right&&!current.keys.boost,current);
    await page.evaluate(()=>{startRace();controlTime+=1000/60;lastTime=controlTime;document.getElementById('cntNum').classList.remove('pop');});
    await page.locator('#pauseButton').tap();const countdown=await page.evaluate(()=>cntTimer);await tick(30);
    record('pause-also-freezes-start-countdown',await page.evaluate(before=>paused&&state==='countdown'&&cntTimer===before,countdown));await page.locator('#exitRaceBtn').tap();
    record('race-controls-hide-in-menu',await page.evaluate(()=>getComputedStyle(turboButton).visibility==='hidden'&&getComputedStyle(pauseButton).visibility==='hidden'&&!keys.left&&!keys.right&&!keys.boost));
    for(const [width,height]of[[320,640],[390,844],[480,800]]){
      await page.setViewportSize({width,height});
      // Wait for the resize handler before drawing; it clears the canvas.
      await page.waitForFunction(()=>W===wrap.clientWidth&&H===wrap.clientHeight,null,{polling:50});
      await page.evaluate(()=>{selectLevel(1);startRace();state='playing';player.speed=3600;player.boosts=2;opponents.length=0;document.getElementById('cntNum').classList.remove('pop');updateHUD(controlTime);render(controlTime);});
      const geometry=await page.evaluate(()=>{
        const pause=pauseButton.getBoundingClientRect(),turbo=turboButton.getBoundingClientRect(),bar=document.getElementById('boostBarWrap').getBoundingClientRect(),gauge=document.getElementById('turboGauge').getBoundingClientRect(),labels=[document.getElementById('lapVal'),document.getElementById('spdVal'),document.getElementById('progBar')].map(e=>e.getBoundingClientRect());
        const overlaps=r=>pause.left<r.right&&pause.right>r.left&&pause.top<r.bottom&&pause.bottom>r.top;
        const readable=[...document.querySelectorAll('.hb')].every(e=>e.scrollWidth<=e.clientWidth+1);
        const fontLoaded=document.fonts.check("20px 'Press Start 2P'");
        const rowsSeparate=document.getElementById('hud').getBoundingClientRect().bottom<document.getElementById('progBar').getBoundingClientRect().top;
        return{pause:{x:pause.x,y:pause.y,width:pause.width,height:pause.height},turbo:{x:turbo.x,y:turbo.y,width:turbo.width,height:turbo.height},readable,fontLoaded,rowsSeparate,lowered:Math.abs(gauge.top/innerHeight-(innerHeight<=720?.38:.48))<.001,clear:labels.every(r=>!overlaps(r)),fits:turbo.right<=innerWidth&&turbo.bottom<=innerHeight,thermometer:Math.abs(turbo.width/bar.width-2.2)<.01&&Math.abs(turbo.x+turbo.width/2-bar.x-bar.width/2)<.1&&turbo.top>=bar.bottom-2&&gauge.bottom>=turbo.bottom&&!document.getElementById('boostIcon')&&!turboButton.textContent.trim()};
      });
      record(`controls-fit-without-covering-top-values-${width}`,geometry.clear&&geometry.fits&&geometry.pause.width>=44&&geometry.thermometer&&geometry.lowered&&geometry.readable&&geometry.fontLoaded&&geometry.rowsSeparate,geometry);
      await page.screenshot({path:`/tmp/controls-layout-${width}.png`});
    }
    const times=await page.evaluate(()=>{
      player.lap=2;player.z=TRACK_LENGTH/2;lapTimes[0]=54320;bestLapTime=54320;currentLapTime=65430;updateHUD(controlTime);
      return{completed:document.getElementById('timeLap1').textContent,current:document.getElementById('timeLap2').textContent,best:document.getElementById('timeLap1').classList.contains('best'),active:document.getElementById('timeLap2').classList.contains('current'),progress:document.getElementById('racePercent').textContent};
    });
    record('hud-shows-compact-times-current-lap-best-and-progress',times.completed==='L1  00:54.32'&&times.current==='L2  01:05.43'&&times.best&&times.active&&times.progress==='50%',times);
    const mapHUD=await page.evaluate(()=>[1,2,3,4,5,6].map(level=>{
      selectLevel(level);startRace();state='playing';updateHUD(controlTime);
      return{level,energy:getComputedStyle(document.getElementById('energyBoard')).display!=='none',rows:[...document.querySelectorAll('.lapTime')].filter(e=>getComputedStyle(e).display!=='none').length};
    }));
    record('hud-adapts-to-single-lap-and-space-energy',mapHUD.every(s=>s.rows===(s.level===5?1:3)&&s.energy===(s.level===6)),mapHUD);
    return checks.map(c=>({...c,errors,pass:c.pass&&errors.length===0}));
  }finally{await page.close();}
};
