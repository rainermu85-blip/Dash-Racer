// Validate the visible progression, bounded animations and static cache reuse.
module.exports=async function assessHillsEvening(browser,baseUrl,output){
 const fs=require('node:fs'),path=require('node:path'),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   selectLevel(3);startRace();state='playing';opponents=[];
   for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';
   const checks=[],shots=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
   const position=(index,lap)=>{player.z=(index+.3)*SEGMENT_LENGTH;player.lap=lap;player.x=hillsDetourCenter(index);player.pitch=0;for(let j=0;j<20;j++)player.pitch+=segments[(index+j)%1200].hillDelta/20;curveCamera.look=0;for(let j=0;j<60;j++)updateCurveCamera(1/60);};
   const scenes=segments.flatMap(s=>(s.polishScenes||[]).map(p=>({index:s.index,...p})));
   record('landmarks-replace-existing-properties',scenes.some(s=>s.index===435&&s.kind==='pool_party')&&scenes.some(s=>s.index===930&&s.kind==='glass_villa')&&scenes.some(s=>s.index===1060&&s.kind==='film_set'),{landmarks:scenes.filter(s=>['pool_party','glass_villa','film_set'].includes(s.kind)).map(s=>[s.index,s.kind])});
   record('valley-view-keeps-an-open-foreground',!scenes.some(s=>s.index>=790&&s.index<=905&&s.x<0&&s.kind==='hills_estate'),{});
   let sunY;const paint=drawHillsLitImage;
   drawHillsLitImage=(img,...args)=>{if(img===sunCanvas)sunY=args[1]+sunCanvas.height/2;paint(img,...args);};
   const dusk=[];
   try{
    for(const lap of[1,2,3]){
     position(835,lap);render(2400);const sky=Array.from(ctx.getImageData(20,120,1,1).data);
     dusk.push({lap,...hillsEvening,sunY,sky});shots.push({name:`valley-lap-${lap}`,image:C.toDataURL()});
    }
   }finally{drawHillsLitImage=paint;}
   record('actual-render-sun-descends-and-sky-darkens',dusk[0].sunY<dusk[1].sunY&&dusk[1].sunY<dusk[2].sunY&&dusk[2].sky[0]+dusk[2].sky[1]<dusk[0].sky[0]+dusk[0].sky[1],dusk);
   record('blue-hour-and-lights-arrive-in-last-lap',dusk[0].night===0&&dusk[2].night>.9&&dusk[2].sunY>H*.5,dusk.map(d=>({lap:d.lap,night:d.night})));
   const seam=[];
   for(const lap of[1,2]){
    player.lap=lap;player.z=TRACK_LENGTH-.001;player.pitch=0;render(2400);const before={...hillsEvening};
    player.lap=lap+1;player.z=.001;render(2400);const after={...hillsEvening};
    seam.push(Math.max(...['progress','pink','night','phase'].map(k=>Math.abs(before[k]-after[k]))));
   }
   record('sunset-has-no-lighting-reset-at-lap-boundaries',seam.every(v=>v<1e-6),{seam});
   record('panorama-remains-seamless-and-sign-ridge-stays-put',Math.abs(sunsetRidgeHeight(0,1)-sunsetRidgeHeight(BG_W,1))<1e-5&&[154,200,300].every(x=>Math.abs(sunsetRidgeHeight(x,1)-(51+Math.sin(x/BG_W*Math.PI*4+1)*24+Math.cos(x/BG_W*Math.PI*6)*12))<.01),{});
   for(const lap of[1,3])for(const [name,index]of[['wedding',95],['party',415],['glass-villa',896],['film-set',1024]]){
    position(index,lap);chapterTime=3400;render(3400);shots.push({name:`${name}-lap-${lap}`,image:C.toDataURL()});
   }
   // Render each animated scene in isolation: all changed pixels must stay in
   // its local area. In particular, the set light cannot reach the street.
   for(const [kind,bounds]of[['film_set',[-178,-204,177,-58]],['pool_party',[-132,-120,150,-19]]]){
    const sample=t=>{ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2,H*.65);ctx.scale(.65,.65);drawHillsLifeScene(kind,t);ctx.restore();return ctx.getImageData(0,0,W,H).data;};
    hillsEvening=getHillsEvening(.85);const a=sample(0),b=sample(2900);let changed=0,outside=0;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
     const k=(y*W+x)*4;if(a[k]===b[k]&&a[k+1]===b[k+1]&&a[k+2]===b[k+2]&&a[k+3]===b[k+3])continue;
     changed++;const lx=(x-W/2)/.65,ly=(y-H*.65)/.65;if(lx<bounds[0]||lx>bounds[2]||ly<bounds[1]||ly>bounds[3])outside++;
    }
    record(`${kind}-animation-is-local`,changed>10&&outside===0,{changed,outside});
   }
   // Warm every lighting phase, then ensure changing time creates no canvases.
   for(const lap of[1,2,3]){position(415,lap);render(2400);}
   const create=document.createElement.bind(document);let canvases=0;
   document.createElement=(tag,...args)=>{if(tag==='canvas')canvases++;return create(tag,...args);};
   try{for(let frame=0;frame<30;frame++){position(415,1+frame%3);render(2400+frame*17);}}finally{document.createElement=create;}
   record('evening-reuses-cached-artwork-during-driving',canvases===0,{newCanvases:canvases});
   return{checks,shots};
  });
  for(const shot of result.shots)fs.writeFileSync(path.join(output,shot.name+'.png'),Buffer.from(shot.image.split(',')[1],'base64'));
  return result.checks.map(c=>({...c,errors,pass:c.pass&&!errors.length}));
 }finally{await page.close();}
};
