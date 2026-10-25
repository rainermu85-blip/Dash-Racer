// Real Hills rendering: move the CAMERA across road boundaries as well as
// opponents. The old traffic fixture only moved opponents across those edges.
module.exports=async function assessHillsStability(browser,baseUrl,output){
  const fs=require('node:fs'),path=require('node:path'),checks=[];
  for(const viewport of[{width:390,height:844},{width:1000,height:700}]){
    const page=await browser.newPage({viewport}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try{
      await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
      await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
      await page.evaluate(()=>document.fonts.ready);
      const data=await page.evaluate(()=>{
        const result=[],record=(name,pass,actual)=>result.push({name,pass,actual});
        selectLevel(3);startRace();state='playing';
        for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';
        player.x=0;player.speed=4320;player.fovOffset=0;curveCamera.look=0;
        const car=opponents[0];opponents=[car];car.x=.3;car.isBoosting=false;
        const originalCar=drawCarSprite,originalScene=drawPolishScene;
        let anchor,estates=new Map();
        drawCarSprite=(...args)=>{if(!args[4])anchor={x:args[0],y:args[1],scale:args[2]};originalCar(...args);};
        drawPolishScene=s=>{if(s.kind==='hills_estate'&&s.sc>=.025&&s.x+160*s.sc>=0&&s.x-160*s.sc<=W)estates.set(s.segIdx,{x:s.x,y:s.y,scale:s.sc});originalScene(s);};
        const jumps=[];
        try{
          for(const lap of[1,2,3])for(const index of[73,200,350,490,522,554,580,600,650,700,740,850,1000,1199]){
            player.lap=lap;player.pitch=segments[index].hillDelta;
            const frames=[];
            for(const delta of[-.001,.001]){
              player.z=index*SEGMENT_LENGTH+delta;car.z=player.z+1500;car.lap=lap;
              if(car.z>=TRACK_LENGTH){car.z-=TRACK_LENGTH;car.lap++;}
              anchor=null;estates=new Map();render(1000);
              frames.push({anchor,estates});
            }
            const [a,b]=frames;
            if(!a.anchor||!b.anchor){jumps.push({lap,index,missing:true});continue;}
            const delta=(x,y)=>Math.max(Math.abs(x.x-y.x),Math.abs(x.y-y.y));
            const scenery=[...a.estates].filter(([i])=>b.estates.has(i)).map(([i,p])=>delta(p,b.estates.get(i)));
            jumps.push({lap,index,car:delta(a.anchor,b.anchor),scenery:Math.max(0,...scenery)});
          }
          record(`camera-crossings-cars-and-estates-${W}`,jumps.every(j=>!j.missing&&j.car<.01&&j.scenery<.01),{boundaries:jumps.length,maxCarJump:Math.max(...jumps.map(j=>j.car||0)),maxEstateJump:Math.max(...jumps.map(j=>j.scenery||0)),outliers:jumps.filter(j=>j.scenery>=.01)});
          // The paired endpoints of a frame are the same at the lap seam.
          const frames=[];
          for(const after of[false,true]){
            player.z=after?.001:TRACK_LENGTH-.001;player.lap=after?2:1;player.pitch=0;
            car.z=after?1500.001:1499.999;car.lap=2;anchor=null;render(1000);frames.push(anchor);
          }
          record(`camera-lap-seam-${W}`,frames.every(Boolean)&&Math.abs(frames[0].x-frames[1].x)<.01&&Math.abs(frames[0].y-frames[1].y)<.01,{frames});
          // Keep the contact calculation aligned with the newly continuous
          // bend at several camera fractions on the actual Hills route.
          const gaps=[];
          player.x=.1;player.steerLean=0;curveCamera.look=.1;
          for(const index of[200,580,700,850])for(const fraction of[.05,.5,.95]){
            player.z=(index+fraction)*SEGMENT_LENGTH;player.pitch=segments[index].hillDelta;player.lap=car.lap=1;
            car.z=player.z+getPlayerContactDistance();car.x=getPlayerCollisionX()+getCarCollisionRange(player,car)+.001;
            anchor=null;render(1000);
            if(!anchor){gaps.push(Infinity);continue;}
            const pose=getPlayerRenderPose(),p=getCarGeometry(pose.x,pose.y,pose.scale,true),o=getCarGeometry(anchor.x,anchor.y,anchor.scale,false);
            gaps.push(anchor.x-o.bw*.475-pose.x-p.bw*.475);
          }
          record(`hills-contact-edges-follow-rendered-cars-${W}`,gaps.every(g=>g>=-4&&g<8),{gaps});
        }finally{drawCarSprite=originalCar;drawPolishScene=originalScene;}
        const plots=segments.flatMap(s=>(s.polishScenes||[]).filter(p=>p.kind==='hills_estate'));
        record(`villas-modernism-and-apartment-cap-${W}`,plots.some(p=>p.estateStyle===5)&&plots.filter(p=>p.estateStyle===4).length/plots.length<=.4&&!plots.some(p=>p.estateGrand&&p.estateStyle===4),{plots:plots.length,apartments:plots.filter(p=>p.estateStyle===4).length,modernVillas:plots.filter(p=>[1,5].includes(p.estateStyle)).length});
        // A real uphill view used to show a pale road/wall band across the sky.
        if(W===390){
          player.z=530.5*SEGMENT_LENGTH;player.pitch=segments[530].hillDelta;player.x=hillsDetourCenter(530);opponents=[];curveCamera.look=0;bgOffset=0;
          for(let i=0;i<60;i++)updateCurveCamera(1/60);render(1000);
          const top=Math.floor(H*.5+player.pitch*1.5)-29;
          const data=ctx.getImageData(25,top,330,20).data;let pale=0;
          for(let k=0;k<data.length;k+=4)if(data[k]>180&&data[k+1]>155&&data[k+2]>130)pale++;
          record('uphill-has-no-floating-return-road',pale<8,{palePixels:pale});
        }
        // An offscreen road slice cannot paint a bar over the panorama.
        ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#52334f';ctx.fillRect(0,0,W,H);
        drawChapterRoad(-4000,360,150,-3500,300,140,false,false,700);
        const untouched=ctx.getImageData(0,300,W,62).data;let changed=0;
        for(let k=0;k<untouched.length;k+=4)if(untouched[k]!==82||untouched[k+1]!==51||untouched[k+2]!==79)changed++;
        record(`offscreen-terrain-cannot-draw-screen-bars-${W}`,changed===0,{changedPixels:changed});
        // Asphalt joins must stay the same color, including antialias rounding.
        ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#52334f';ctx.fillRect(0,0,W,H);
        for(let i=0;i<24;i++)drawChapterRoad(W/2,210+i*12,150,W/2,198+i*12,150,i%2,false,100+i);
        const colors=ctx.getImageData(Math.floor(W/2)-25,212,1,260).data;
        const range=[0,1,2].map(c=>{const a=Array.from({length:260},(_,j)=>colors[j*4+c]);return Math.max(...a)-Math.min(...a);});
        record(`asphalt-without-transverse-seams-${W}`,range.every(x=>x<=2),{channelRange:range});
        return result;
      });
      checks.push(...data.map(c=>({...c,errors,pass:c.pass&&!errors.length})));
      // An actual physics run; after setup only steering keys are set. Save
      // consecutive frames through the dogleg and moving traffic for review.
      const shots=await page.evaluate(()=>{
        let seed=1989;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
        selectLevel(3);startRace();state='playing';
        for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';
        player.z=450*150;player.speed=4320;player.cleanSpeedBonus=.2;resetNormalPace(player);lastTime=1000;smoothedDt=1/60;
        opponents.forEach((o,i)=>{o.z=(456+i*5)*150;o.speed=4200;});
        const shots=[],targets=[490,530,555,580,620,650,700,750,800];let ts=1000;
        for(let f=0;f<2100&&targets.length;f++){
          const contact=(player.z+getPlayerContactDistance())/150;
          const target=contact<523?0:contact<578?-.65:contact<625?-.15:contact>685&&contact<725?.15:0;
          keys.left=player.x>target+.035;keys.right=player.x<target-.035;ts+=1000/60;loop(ts);
          if(player.z/150>=targets[0])shots.push({index:targets.shift(),image:C.toDataURL()});
        }
        keys.left=keys.right=false;return shots;
      });
      for(const shot of shots)fs.writeFileSync(path.join(output,`hills-moving-${viewport.width}-${shot.index}.png`),Buffer.from(shot.image.split(',')[1],'base64'));
      checks.push({name:`physics-drive-visual-coverage-${viewport.width}`,pass:shots.length===9&&!errors.length,actual:{captured:shots.map(s=>s.index)},errors});
    }finally{await page.close();}
  }
  return checks;
};
