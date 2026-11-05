// Check world-space support for the actual artwork, then drive a complete lap.
module.exports=async function assessHillsNeighborhood(browser,baseUrl,output){
 const fs=require('node:fs'),path=require('node:path'),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  const checks=await page.evaluate(()=>{
   const checks=[],record=(name,pass,actual)=>checks.push({name,pass,actual});
   selectLevel(3);startRace();state='playing';opponents=[];
   const scenes=segments.flatMap(s=>(s.polishScenes||[]).filter(p=>p.estateLot).map(p=>({index:s.index,...p}))),lots=scenes.map(p=>p.estateLot);
   const unsupported=lots.filter(l=>Array.from({length:l.end-l.start+1},(_,j)=>segments[l.start+j]).some(s=>Math.max(s.worldY,s.worldY+s.hillDelta)>l.baseY));
   record('every-property-has-support-above-the-whole-slope',lots.length>40&&unsupported.length===0,{properties:lots.length,unsupported:unsupported.map(l=>l.id)});
   const overlaps=lots.filter((a,i)=>lots.some((b,j)=>j>i&&a.side===b.side&&a.start<b.end&&b.start<a.end));
   record('independent-plots-dont-overlap-on-the-same-side',overlaps.length===0,{overlaps:overlaps.map(l=>l.id)});
   const panorama=[...getHillsPanoramaLots(0),...getHillsPanoramaLots(1)];
   const corners=panorama.every(l=>l.leftBottom>=l.top&&l.rightBottom>=l.top&&l.half>145*l.scale*.8);
   const near=getHillsPanoramaLots(1),sectors=[0,1,2,3].map(i=>near.filter(p=>p.x>=i*BG_W/4&&p.x<(i+1)*BG_W/4).length);
   record('panorama-homes-have-wide-retaining-footings',corners,{homes:panorama.length});
   record('all-panorama-sectors-are-inhabited-with-villas',sectors.every(n=>n>=6)&&near.filter(l=>l.style===4).length/near.length<.4,{sectors,apartments:near.filter(l=>l.style===4).length,total:near.length});
   // Compare the far edge of each actual drawn terrace top with the drawn
   // building foot. These are produced by different projection paths.
   const poly=scenePoly,paint=drawHillsPropertySlice,art=drawPolishScene;
   let active=null,tops=new Map(),feet=new Map(),residual=[];
   scenePoly=(points,color,...rest)=>{if(active!==null&&['#60775c','#668365','#d6c2b0','#d9b5ad'].includes(color))tops.set(active,[...(tops.get(active)||[]),points[1][1]]);poly(points,color,...rest);};
   drawHillsPropertySlice=(...args)=>{active=args[6];try{paint(...args);}finally{active=null;}};
   drawPolishScene=s=>{const half=['hills_estate','hill_mansion'].includes(s.kind)?125:s.kind==='hotel'?214:s.kind==='hills_boutiques'?178:160;if(s.x+half*s.sc>=0&&s.x-half*s.sc<=W&&scenes.some(p=>p.index===s.segIdx&&p.kind===s.kind))feet.set(s.segIdx,s.y);art(s);};
   try{
    for(const i of[15,40,65,95,110,73,180,225,345,405,620,850,1000,1060]){
     player.z=(i+.35)*150;player.x=hillsDetourCenter(i);player.speed=4320;player.pitch=segments[i].hillDelta;curveCamera.look=0;
     for(let k=0;k<60;k++)updateCurveCamera(1/60);tops=new Map();feet=new Map();render(1000);
     for(const [id,y]of feet)if(tops.has(id))residual.push(Math.min(...tops.get(id).map(top=>Math.abs(y-top))));
    }
   }finally{scenePoly=poly;drawHillsPropertySlice=paint;drawPolishScene=art;}
   record('rendered-buildings-meet-their-projected-terraces',residual.length>=8&&residual.every(r=>r<1e-5),{samples:residual.length,maxError:Math.max(...residual)});
   record('pools-are-present-on-separate-front-terraces',lots.filter(l=>l.pool).length>=10,{pools:lots.filter(l=>l.pool).length});
   record('sunset-has-distinct-neighborhood-sections',new Set(scenes.map(s=>s.estateLot.district)).size>=5&&scenes.some(s=>s.kind==='hills_fountain')&&scenes.some(s=>s.kind==='hills_pergola')&&scenes.some(s=>s.kind==='tennis'),{districts:[...new Set(scenes.map(s=>s.estateLot.district))]});
   return checks;
  });
  // The prominent scenes must have a useful view before the driver passes.
  for(const [index,ahead,height]of[[48,40,215],[60,40,215],[72,38,215],[84,40,215],[96,38,215],[108,38,215],[135,40,315],[225,28,130],[345,26,185],[435,20,80],[490,28,475],[865,22,80],[930,34,475],[1000,28,150],[1060,34,475]]){
   const view=await page.evaluate(({index,ahead,height})=>{
    const i=index-ahead;player.z=(i+.3)*150;player.x=hillsDetourCenter(i);player.speed=4320;player.pitch=0;for(let j=0;j<20;j++)player.pitch+=segments[(i+j)%1200].hillDelta/20;curveCamera.look=0;for(let j=0;j<60;j++)updateCurveCamera(1/60);
    for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';
    const art=drawPolishScene;let drawn;drawPolishScene=s=>{if(s.segIdx===index&&s.kind!=='hills_estate')drawn={...s};art(s);};try{render(1000);}finally{drawPolishScene=art;}
    if(!drawn)return null;
    return{width:Math.min(W,drawn.x+160*drawn.sc)-Math.max(0,drawn.x-160*drawn.sc),height:Math.min(H,drawn.clipY,drawn.y)-Math.max(0,drawn.y-height*drawn.sc)};
   },{index,ahead,height});
   checks.push({name:`landmark-visible-before-passing-${index}`,pass:!!view&&view.width>50&&view.height>20,actual:view});
   fs.writeFileSync(path.join(output,`hills-landmark-${index}.png`),Buffer.from((await page.evaluate(()=>C.toDataURL())).split(',')[1],'base64'));
  }
  const drive=await page.evaluate(()=>{
   let seed=1989;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
   selectLevel(3);startRace();state='playing';opponents=[];player.speed=4320;player.cleanSpeedBonus=.2;resetNormalPace(player);lastTime=1000;smoothedDt=1/60;
   const targets=[20,45,70,95,120,145,200,320,405,490,540,620,740,820,930,1000,1100],shots=[];let ts=1000;
   for(let f=0;f<9000&&player.lap===1;f++){
    const contact=(player.z+getPlayerContactDistance())/150;
    let target=contact<523?0:contact<578?-.65:contact<625?-.15:contact>685&&contact<725?.15:0;
    if(contact<510||contact>780)for(let j=0;j<35;j++){const barrier=getSeg(player.z+getPlayerContactDistance()+j*150).barrier;if(barrier?.active&&!barrier.permanent){target=barrier.x>0?-.5:.5;break;}}
    keys.left=player.x>target+.035;keys.right=player.x<target-.035;ts+=1000/60;loop(ts);
    if(targets.length&&player.z/150>=targets[0])shots.push({index:targets.shift(),image:C.toDataURL()});
   }
   keys.left=keys.right=false;return{lap:player.lap,seconds:raceElapsed/1000,shots};
  });
  for(const shot of drive.shots)fs.writeFileSync(path.join(output,`hills-lap-${shot.index}.png`),Buffer.from(shot.image.split(',')[1],'base64'));
  checks.push({name:'whole-hills-lap-with-real-physics-and-steering',pass:drive.lap===2&&drive.shots.length===17,actual:{lap:drive.lap,seconds:drive.seconds,captured:drive.shots.map(s=>s.index)}});
  return checks.map(c=>({...c,errors,pass:c.pass&&!errors.length}));
 }finally{await page.close();}
};
