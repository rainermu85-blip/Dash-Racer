// Rendered regressions: compare real cars/pickups with an unobscured reference,
// and count visible craft pixels after ALL walls/ceilings have been painted.
module.exports=async function assessOrbitalVisuals(browser,baseUrl,output){
 const fs=require('node:fs'),path=require('node:path'),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>requestAnimationFrame=()=>0);
  if(process.env.ORBITAL_SOURCE_REF){
   const ref=process.env.ORBITAL_SOURCE_REF;if(!/^[a-f0-9]{7,40}$/.test(ref))throw new Error('Expected a commit SHA');
   const source=require('node:child_process').execFileSync('git',['show',ref+':index.html']);
   await page.route(baseUrl,route=>route.fulfill({body:source,contentType:'text/html'}));
  }
  await page.goto(baseUrl);await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   const checks=[],shots=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
   const setup=()=>{selectLevel(8);startRace();state='playing';for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';};
   const stop=()=>{clearTimeout(resultTimer);clearTimeout(fieldCompletionTimer);resultTimer=fieldCompletionTimer=null;};
   const pixels=()=>ctx.getImageData(0,0,W,H);
   const ratio=(actual,reference,shaded,color,bounds)=>{
    const x0=Math.max(0,Math.floor(bounds.x0)),x1=Math.min(W,Math.ceil(bounds.x1)),y0=Math.max(0,Math.floor(bounds.y0)),y1=Math.min(H,Math.ceil(bounds.y1));
    let expected=0,visible=0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
     const i=(y*W+x)*4;
     if(reference.data[i]===color[0]&&reference.data[i+1]===color[1]&&reference.data[i+2]===color[2]){
      expected++;if(Math.max(Math.abs(actual.data[i]-shaded.data[i]),Math.abs(actual.data[i+1]-shaded.data[i+1]),Math.abs(actual.data[i+2]-shaded.data[i+2]))<=3)visible++;
     }
    }
    return{expected,visible,ratio:expected?visible/expected:0};
   };
   setup();const carPaint=drawCarSprite,boltPaint=drawLightningSprite;let carAnchor,boltAnchor;
   drawCarSprite=(...a)=>{if(!a[4])carAnchor=a;carPaint(...a);};
   drawLightningSprite=(...a)=>{boltAnchor=a;boltPaint(...a);};
   for(const index of[30,200,500,715,1050,1550,2225,2700]){
    setup();opponents=opponents.slice(0,1);for(const seg of segments)seg.lightning=null;
    player.z=(index+.35)*150;player.pitch=segments[index].hillDelta;player.speed=3600;player.x=0;player.fovOffset=0;
    player.curveAheadSmooth=0;curveCamera.look=0;opponents[0].z=(index+8.6)*150;opponents[0].x=.30;
    opponents[0].isBoosting=opponents[0].isChevronBoosting=false;
    segments[index+8].lightning={active:true,x:-.30};for(let i=0;i<60;i++)updateCurveCamera(1/60);
    carAnchor=boltAnchor=null;smokeParticles=[];render(0);const actual=pixels();
    if(!carAnchor||!boltAnchor){record('unobscured-car-and-bolt-'+index,false,{car:!!carAnchor,bolt:!!boltAnchor});continue;}
    const g=getCarGeometry(carAnchor[0],carAnchor[1],carAnchor[2],false);
    // Apply the game's bottom vignette once to the freshly painted reference.
    // Its opaque body pixels can then be compared after the same final shading.
    carPaint(...carAnchor);const carMask=pixels();ctx.fillStyle=vigGrad;ctx.fillRect(0,H*.65,W,H*.35);
    const car=ratio(actual,carMask,pixels(),[255,68,102],{x0:g.px,y0:g.py,x1:g.px+g.bw,y1:carAnchor[1]});
    ctx.putImageData(actual,0,0);boltPaint(...boltAnchor);
    const boltMask=pixels();ctx.fillStyle=vigGrad;ctx.fillRect(0,H*.65,W,H*.35);
    const [x,y,scale]=boltAnchor,bolt=ratio(actual,boltMask,pixels(),[255,224,102],{x0:x-35*scale,y0:y-65*scale,x1:x+35*scale,y1:y+5*scale});
    record('unobscured-car-and-bolt-'+index,car.expected>100&&car.ratio>.985&&bolt.expected>30&&bolt.ratio>.985,{car,bolt});
    ctx.putImageData(actual,0,0);
    shots.push({name:'alignment-'+index,image:C.toDataURL()});
   }
   drawCarSprite=carPaint;drawLightningSprite=boltPaint;
   const hasLanding=typeof orbitalLandingPose==='function';record('landing-event-exists',hasLanding,{});
   const scenePaint=drawOrbitalSprite;let hide=null;
   const matches=(item,kind)=>kind==='landing'?item.motion==='landing':item.kind===kind;
   drawOrbitalSprite=s=>{if(!hide||!matches(s.item,hide))scenePaint(s);};
   const visibleCraft=kind=>{
    smokeParticles=[];confettiParticles=[];activePopups=[];activeFlyingPylons=[];hide=null;render(raceElapsed);
    const actual=pixels();hide=kind;render(raceElapsed);const baseline=pixels();hide=null;
    let count=0;for(let i=0;i<actual.data.length;i+=4)if(Math.max(Math.abs(actual.data[i]-baseline.data[i]),Math.abs(actual.data[i+1]-baseline.data[i+1]),Math.abs(actual.data[i+2]-baseline.data[i+2]))>15)count++;
    return count;
   };
   const random=Math.random;Math.random=()=>.5;
   try{
    for(const turbo of[false,true]){
     setup();opponents=[];const landing=[],shuttle=[],courier=[],eva=[];
     for(let f=0;f<10000&&!player.finished;f++){
      const next=segments.find(s=>s.lightning?.active&&s.worldZ>=player.z&&s.worldZ<player.z+7500);
      const target=next?next.lightning.x:0,x=getPlayerCollisionX();keys.left=x>target+.025;keys.right=x<target-.025;
      keys.boost=turbo&&player.boosts>0&&!player.isBoosting;advanceRaceStep(1/60);const index=player.z/150;
      if(f%6===0){
       if(hasLanding&&index<190){
        const pose=orbitalLandingPose(),count=visibleCraft('landing');landing.push({index,time:raceElapsed/1000,pixels:count,...pose});
        if(!turbo&&count>100&&raceElapsed>2200&&raceElapsed<2400){hide=null;render(raceElapsed);shots.push({name:'landing-descent',image:C.toDataURL()});}
        if(!turbo&&count>100&&raceElapsed>5900&&raceElapsed<6100){hide=null;render(raceElapsed);shots.push({name:'landed-freighter',image:C.toDataURL()});}
       }
       if(index>1440&&index<1710){
        const count=visibleCraft('shuttle');shuttle.push({index,age:orbitalLaunchPhase(),pixels:count});
        if(!turbo&&count>100&&index>1620&&index<1624){hide=null;render(raceElapsed);shots.push({name:'shuttle-departure',image:C.toDataURL()});}
       }
       if(index>2510&&index<2780){
        const count=visibleCraft('courier');courier.push({index,pixels:count});
        if(!turbo&&count>100&&index>2680&&index<2684){hide=null;render(raceElapsed);shots.push({name:'courier-above-glass-roof',image:C.toDataURL()});}
       }
       if(index>1050&&index<1180&&f%18===0)eva.push({index,pixels:visibleCraft('eva')});
      }
     }
     stop();
     const onset=shuttle.find(s=>s.pixels>5),small=shuttle.filter(s=>s.pixels>5&&s.pixels<500),before=shuttle.filter(s=>s.age<0&&s.pixels>5),air=shuttle.filter(s=>s.age>1.35&&s.pixels>100);
     record('shuttle-enters-view-gradually-before-start-'+turbo,!!onset&&onset.pixels<150&&small.length>=5&&before.length>=5&&air.length>=5,{onset,smallFrames:small.length,beforeStart:before.length,airFrames:air.length,samples:shuttle});
     if(hasLanding)record('visible-descent-and-touchdown-'+turbo,landing.filter(s=>!s.landed&&s.height>10&&s.pixels>100).length>=20&&landing.filter(s=>s.landed&&s.pixels>100).length>=10,{samples:landing});
     record('courier-flies-over-transparent-roof-'+turbo,courier.filter(s=>s.pixels>100).length>=10,{samples:courier});
     record('spacewalker-visible-through-glass-'+turbo,eva.filter(s=>s.pixels>20).length>=3,{samples:eva});
    }
    if(hasLanding){
     setup();raceElapsed=2300;const pose=JSON.stringify(orbitalLandingPose());render(100);render(99999);
     record('landing-frozen-with-race-clock',pose===JSON.stringify(orbitalLandingPose()),{});
     startRace();record('restart-restores-airborne-approach',orbitalLandingPose().height===180&&!orbitalLandingPose().landed,{});stop();
    }
   }finally{Math.random=random;drawOrbitalSprite=scenePaint;}
   return{checks,shots};
  });
  fs.mkdirSync(output,{recursive:true});for(const shot of result.shots)fs.writeFileSync(path.join(output,`orbital-${shot.name}.png`),Buffer.from(shot.image.split(',')[1],'base64'));
  return result.checks.map(c=>({...c,errors,pass:c.pass&&errors.length===0}));
 }finally{await page.close();}
};
