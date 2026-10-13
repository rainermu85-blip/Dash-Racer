// Observe coastal landmarks and the rock opening through the real canvas.
module.exports = async function runCoast(browser, baseUrl) {
  const results = [];
  for (const viewport of [{ width:390,height:844 }, { width:480,height:800 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    try {
      await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
      await page.goto(baseUrl, { waitUntil:'domcontentloaded' });
      const checks = await page.evaluate(() => {
        const checks=[]; let ts=1000;
        const record=(name,pass,actual)=>checks.push({name:`coast-${W}-${name}`,pass,actual});
        const reset=(level=2,lap=1)=>{
          showMainMenu();selectLevel(level);startRace();state='playing';lastTime=ts;smoothedDt=1/60;
          document.getElementById('cntNum').classList.remove('pop');
          player.lap=lap;player.speed=4320;player.cleanSpeedBonus=.2;
          opponents.length=0;for(const s of segments)s.pylon=s.barrier=s.lightning=null;
          keys.left=keys.right=keys.boost=false;
        };
        // Advance the real simulation and its camera smoothing; only sampled frames
        // need rasterization. This keeps visibility checks inexpensive.
        const tick=()=>{keys.left=player.x>.035;keys.right=player.x<-.035;ts+=1000/60;
          const draw=render;render=()=>{};try{loop(ts);}finally{render=draw;}
        };
        const driveTo=index=>{for(let n=0;player.z<index*SEGMENT_LENGTH&&n<1000;n++)tick();};
        reset();
        const runIn=segments.slice(OCEAN_FINISH_STRAIGHT_START,SEGMENT_COUNT);
        const straightSeconds=runIn.length*SEGMENT_LENGTH/4320,normalSeconds=runIn.length*SEGMENT_LENGTH/3600;
        const endHeight=segments.at(-1).worldY+segments.at(-1).hillDelta;
        record('finish-has-two-to-three-seconds-straight-run-in',runIn.length===70&&runIn.every(s=>s.curve===0)&&straightSeconds>=2&&normalSeconds<=3&&Math.abs(endHeight-segments[0].worldY)<.001,{straightSeconds,normalSeconds,endHeight});
        player.z=1149.9*SEGMENT_LENGTH;tick();
        record('old-curved-finish-no-longer-awards-lap',player.lap===1&&!player.finished,{lap:player.lap,z:player.z/SEGMENT_LENGTH});
        driveTo(OCEAN_FINISH_STRAIGHT_START);const entered=ts;
        for(let n=0;player.lap===1&&n<240;n++)tick();
        record('new-line-records-lap-after-straight',player.lap===2&&!player.finished&&lapTimes[0]>0&&ts-entered>=2300&&ts-entered<=3000,{lap:player.lap,seconds:(ts-entered)/1000,time:lapTimes[0]});
        reset(2,3);player.z=(SEGMENT_COUNT-2)*SEGMENT_LENGTH;
        for(let n=0;!player.finished&&n<20;n++)tick();
        record('third-lap-finishes-at-new-line',player.finished&&player.lap===4&&lapTimes[2]>0&&player.z<SEGMENT_LENGTH,{lap:player.lap,finished:player.finished,time:lapTimes[2],z:player.z});
        reset();
        record('old-start-tree-removed-and-one-tree-after-tunnel',!segments.some(s=>s.sprite==='gnarled_tree')&&segments.filter(s=>s.sprite==='coastal_old_tree').length===1&&segments[OCEAN_OLD_TREE_INDEX].sprite==='coastal_old_tree'&&OCEAN_OLD_TREE_INDEX>OCEAN_ROCK_TUNNEL.end,{index:OCEAN_OLD_TREE_INDEX});
        const tunnel=segments.filter(s=>s.isTunnel);
        record('short-rock-opening',tunnel.length===36&&tunnel[0].index===506&&tunnel.at(-1).index===541&&tunnel.every(s=>!s.sprite),{start:tunnel[0]?.index,end:tunnel.at(-1)?.index,count:tunnel.length,seconds:tunnel.length*SEGMENT_LENGTH/4320});
        const limits=[505,506,541,542].map(i=>getRoadLimits(i*SEGMENT_LENGTH));
        record('walls-confine-only-rock-opening',limits[0].right===1.45&&limits[1].right===1.05&&limits[2].right===1.05&&limits[3].right===1.45&&limits.every(l=>l.left===1.05),limits);
        ctx.fillStyle='#ff00ff';ctx.fillRect(0,0,W,H);
        drawOceanRockPortal(W/2,650,45,70);
        const pixel=(x,y)=>[...ctx.getImageData(Math.round(x),y,1,1).data].slice(0,3).join(',');
        const opening=[-.85,0,.85].map(l=>pixel(W/2+l*45,612)),rock=pixel(W/2+90,612);
        record('natural-portal-keeps-all-three-lanes-open',opening.every(p=>p==='255,0,255')&&rock!=='255,0,255',{opening,rock});
        const paint=paintOceanPolygon;let points=[];const frames=[];
        paintOceanPolygon=(p,c,s)=>{points.push(...p);paint(p,c,s);};
        try {
          for(const index of[.00001,37.99999,290,505.99999,506,506.00001,524,541.99999,542,542.00001,780,OCEAN_PIER_INDEX-.00001,OCEAN_PIER_INDEX+.99999,OCEAN_PIER_CENTER-.00001,OCEAN_PIER_CENTER+.99999,OCEAN_PIER_INDEX+OCEAN_PIER_LENGTH-.00001,SEGMENT_COUNT-.00001]){
            player.z=index*SEGMENT_LENGTH;points=[];render(ts);
            const values=points.flatMap(p=>[p.x,p.y]);frames.push({index,finite:values.every(Number.isFinite),peak:values.reduce((max,n)=>Math.max(max,Math.abs(n)),0)});
          }
        } finally {paintOceanPolygon=paint;}
        record('cliffs-and-portals-project-safely',frames.every(f=>f.finite&&f.peak<100000),frames);
        const shell=drawOceanRockTunnelSegment;let shells=0;
        drawOceanRockTunnelSegment=(...args)=>{shells++;shell(...args);};
        try{player.z=495*SEGMENT_LENGTH;render(ts);}finally{drawOceanRockTunnelSegment=shell;}
        record('rock-tunnel-visible-on-approach',shells>0,{shells});
        const star=drawOceanShootingStar,starFrames=[];
        for(const [lap,index]of[[2,1210],[3,1175],[3,1195],[3,1210],[3,1230]]){
          reset(2,lap);player.z=(index-15)*SEGMENT_LENGTH;driveTo(index);
          const random=Math.random;
          try{
            Math.random=()=>.5;drawOceanShootingStar=()=>{};render(ts);const before=ctx.getImageData(0,0,W,Math.floor(H*.35)).data;
            drawOceanShootingStar=star;render(ts);const after=ctx.getImageData(0,0,W,Math.floor(H*.35)).data;
            let visible=0;for(let i=0;i<after.length;i+=4)if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2])visible++;
            starFrames.push({lap,index,visible});
          }finally{Math.random=random;drawOceanShootingStar=star;}
        }
        record('shooting-star-visible-only-on-final-straight',starFrames.slice(0,2).every(f=>f.visible===0)&&starFrames.slice(2).every(f=>f.visible>20),starFrames);
        reset();player.z=495*SEGMENT_LENGTH;const start=player.z;
        for(let n=0;n<140;n++)tick();
        record('normal-driving-through-opening-keeps-speed',player.z>542*SEGMENT_LENGTH&&player.speed>4319&&Math.abs(player.x)<.1,{distance:player.z-start,speed:player.speed,x:player.x});
        // Compare final frames with and without a landmark, excluding the DOM
        // turbo display. This catches objects clipped or hidden by nearer rocks.
        const impact=pier=>{
          const house=pier==='house',slices=oceanPierSlices;
          const draw=pier?drawOceanPier:drawBeachPartySprite, random=Math.random;
          try{
            Math.random=()=>.5;
            if(house)oceanPierSlices=slices.map(s=>s.filter(f=>!['house','roof','window'].includes(f.role)));
            else if(pier)drawOceanPier=()=>{};else drawBeachPartySprite=()=>{};
            render(ts);const before=ctx.getImageData(0,0,W,H).data;
            if(house)oceanPierSlices=slices;else if(pier)drawOceanPier=draw;else drawBeachPartySprite=draw;
            render(ts);const after=ctx.getImageData(0,0,W,H).data;
            const canvas=C.getBoundingClientRect(), board=document.getElementById('boostContainer').getBoundingClientRect();
            let visible=0;
            for(let i=0;i<after.length;i+=4){
              const x=(i/4)%W,y=Math.floor(i/4/W),sx=canvas.left+x*canvas.width/W,sy=canvas.top+y*canvas.height/H;
              if(sx>=board.left&&sx<=board.right&&sy>=board.top&&sy<=board.bottom)continue;
              if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2])visible++;
            }
            return visible;
          }finally{Math.random=random;oceanPierSlices=slices;if(pier)drawOceanPier=draw;else drawBeachPartySprite=draw;}
        };
        for(const [name,pier,lap,start,index] of [
          ['pier-day',true,1,OCEAN_PIER_INDEX-110,OCEAN_PIER_CENTER],['pier-night',true,3,OCEAN_PIER_INDEX-110,OCEAN_PIER_CENTER],
          ['party-day',false,1,0,OCEAN_PARTY_INDEX],['party-night',false,3,0,OCEAN_PARTY_INDEX]
        ]){
          reset(2,lap);player.z=start*SEGMENT_LENGTH;const samples=[];
          for(let target=Math.max(start,index-80);target<=index-5;target+=7){
            driveTo(target);samples.push({index:player.z/SEGMENT_LENGTH,visible:impact(pier),house:pier?impact('house'):undefined});
          }
          const visible=samples.filter(s=>s.visible>180),seconds=visible.length*7*SEGMENT_LENGTH/4320;
          record(`${name}-visible-during-normal-driving`,seconds>=1.4&&Math.max(...samples.map(s=>s.visible))>700,{seconds,samples});
          if(pier)record(`${name}-boathouse-readable`,samples.filter(s=>s.house>300).length>=2&&Math.max(...samples.map(s=>s.house))>800,samples.map(s=>({index:s.index,house:s.house})));
        }
        // The next occurrence of the beach is already in view before the line.
        // The old lap===3 switch replaced the daytime gathering only after crossing.
        reset(2,2);player.z=(SEGMENT_COUNT-70)*SEGMENT_LENGTH;driveTo(SEGMENT_COUNT-2);
        const illegal=drawIllegalBeachParty;let stages=0;
        drawIllegalBeachParty=(...args)=>{stages++;illegal(...args);};
        try{
          const before={lap:player.lap,z:player.z/SEGMENT_LENGTH,pixels:impact(false),stages};
          record('night-party-visible-before-third-lap',before.lap===2&&before.pixels>180&&before.stages>0,before);
          for(let n=0;player.lap===2&&n<12;n++)tick();
          stages=0;const after={lap:player.lap,z:player.z/SEGMENT_LENGTH,pixels:impact(false),stages};
          player.lap=4;player.z=1*SEGMENT_LENGTH;player.finished=true;
          stages=0;const finish={pixels:impact(false),stages};
          record('party-stays-night-across-line-and-finish',after.lap===3&&after.pixels>180&&after.stages>0&&finish.stages>0,{after,finish});
        }finally{drawIllegalBeachParty=illegal;}
        // Paint only terrain over an impossible background color. Probe both
        // asphalt and the recessed cliff toe at uphill/crest camera poses.
        const seams=[];
        for(const [start,target]of[[120,150.24],[120,199.2],[120,230.4],[210,256.32],[580,600.16],[580,646.24],[980,1035.36]]){
          reset();player.z=start*SEGMENT_LENGTH;driveTo(target);
          const draw=drawRoadSegment,calls=[];
          drawRoadSegment=(...args)=>{calls.push(args);draw(...args);};
          try{render(ts);}finally{drawRoadSegment=draw;}
          ctx.fillStyle='#ff00ff';ctx.fillRect(0,0,W,H);
          for(const args of calls)draw(...args);
          const pixels=ctx.getImageData(0,0,W,H).data;let probes=0,holes=0;
          for(const args of calls){
            const [x1,y1,w1,x2,y2,w2]=args;if(!args[13])continue;
            const low=Math.max(0,y2)+2,high=Math.min(H-20,y1)-2;if(high<=low)continue;
            const y=(low+high)/2,t=(y-y2)/(y1-y2),x=x2+(x1-x2)*t,w=w2+(w1-w2)*t;
            for(const lane of[-1.4,-1.3,-1.2,-1.15,-.9,-.6,0,.6,.9]){
              const px=Math.round(x+lane*w),py=Math.round(y);if(px<2||px>=W-2)continue;
              const offset=(py*W+px)*4;probes++;
              if(pixels[offset]>245&&pixels[offset+1]<10&&pixels[offset+2]>245)holes++;
            }
          }
          seams.push({target,probes,holes});
        }
        record('asphalt-and-cliff-toes-have-no-uphill-gaps',seams.every(s=>s.probes>30&&s.holes===0),seams);
        reset();const vegetationSamples=[];
        for(const index of[0,15,30,60,90,285]){
          player.z=index*SEGMENT_LENGTH;render(ts);
          const pixels=ctx.getImageData(0,0,Math.floor(W*.32),Math.floor(H*.65)).data;
          let green=0,pink=0;
          for(let n=0;n<pixels.length;n+=4){
            const r=pixels[n],g=pixels[n+1],b=pixels[n+2];
            if(g>60&&g>r*1.6&&g>b*1.25)green++;
            if(r>180&&g<85&&b>90&&b<210)pink++;
          }
          vegetationSamples.push({index,green,pink});
        }
        record('wild-green-patches-and-original-style-blooms-readable',vegetationSamples.filter(s=>s.green>600).length>=3&&vegetationSamples.some(s=>s.pink>250),vegetationSamples);
        // The boathouse floor must actually be covered by a deck, with
        // foundations extending below sea level. This catches floating huts.
        const parts=oceanPierSlices.flat(),house=parts.filter(f=>f.role==='house');
        const floor=Math.min(...house.flatMap(f=>f.points.map(p=>p[1])));
        const floorPoints=house.flatMap(f=>f.points.filter(p=>Math.abs(p[1]-floor)<.001));
        const decks=parts.filter(f=>f.role==='deck'&&f.points.every(p=>Math.abs(p[1]-floor)<.001));
        const covered=point=>decks.some(f=>{
          const xs=f.points.map(p=>p[0]),zs=f.points.map(p=>p[2]);
          return point[0]>=Math.min(...xs)-.001&&point[0]<=Math.max(...xs)+.001&&point[2]>=Math.min(...zs)-.001&&point[2]<=Math.max(...zs)+.001;
        });
        const supports=parts.filter(f=>f.role==='support'),boats=parts.filter(f=>f.role==='boat');
        record('house-rests-on-supported-deck-and-boats-touch-sea',floorPoints.length>0&&floorPoints.every(covered)&&supports.some(f=>f.points.some(p=>p[1]<0))&&supports.some(f=>f.points.some(p=>p[1]===floor))&&boats.some(f=>f.points.some(p=>p[1]<0)),{floor,houseFaces:house.length,supportFaces:supports.length,boatFaces:boats.length});
        record('pier-is-on-existing-long-straight',segments.slice(OCEAN_PIER_INDEX,OCEAN_PIER_INDEX+OCEAN_PIER_LENGTH).every(s=>s.curve===0),{start:OCEAN_PIER_INDEX,center:OCEAN_PIER_CENTER});
        // All four kinds occupy real beach segments, with no tunnel intrusion.
        const beach=segments.filter(s=>/^beach_(loungers|surfboards|cabanas|lifeguard)$/.test(s.sprite));
        record('beach-has-four-varied-grounded-scenes',new Set(beach.map(s=>s.sprite)).size===4&&beach.every(s=>!s.isTunnel&&s.spriteX>1.18&&s.spriteX<3.8),beach.map(s=>({index:s.index,type:s.sprite})));
        // These final-frame comparisons catch the crest clipping and water
        // overpainting which hid objects even though they were in the level data.
        reset();player.z=210*SEGMENT_LENGTH;driveTo(250);
        const boatDraw=drawOceanBoatSprite,random=Math.random;
        const pixelDifference=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;return n;};
        try{
          Math.random=()=>.5;render(ts);const full=ctx.getImageData(0,0,W,H).data;
          const fleet=[];
          for(const boat of OCEAN_BOATS_BY_SEGMENT.values())if(boat.bay==='crest-bay'){
            let width=0;drawOceanBoatSprite=(x,y,scale,b,night)=>{if(b===boat){width=scale*b.length;return;}boatDraw(x,y,scale,b,night);};
            render(ts);fleet.push({kind:boat.kind,width,pixels:pixelDifference(full,ctx.getImageData(0,0,W,H).data)});
          }
          record('crest-bay-eleven-distant-boats-visible',fleet.length===11&&fleet.every(b=>b.pixels>3&&b.width<W*.12),fleet);
        }finally{Math.random=random;drawOceanBoatSprite=boatDraw;}
        reset();driveTo(35);
        const personDraw=drawBeachPerson,partyDraw=drawBeachPartySprite;let inParty=false;const people=[];
        drawBeachPerson=(x,y,scale,pose,options)=>{if(inParty)people.push({pose,left:x-scale*(pose==='lying'?22.5:13)});personDraw(x,y,scale,pose,options);};
        drawBeachPartySprite=(...args)=>{inParty=true;try{partyDraw(...args);}finally{inParty=false;}};
        try{render(ts);}finally{drawBeachPerson=personDraw;drawBeachPartySprite=partyDraw;}
        const partySegment=segments[OCEAN_PARTY_INDEX],roadEdge=partySegment.proj_rx2+partySegment.proj_w2*1.18;
        record('party-people-are-completely-off-road',people.length===2&&people.every(p=>p.left>roadEdge),{roadEdge,people});
        // Moving across the screen must not change the surfer's wave phase.
        const surferFrame=x=>{
          ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);drawWindsurferSprite(x,300,1,10000,335);
          return ctx.getImageData(x-45,245,90,75).data;
        };
        const left=surferFrame(100),right=surferFrame(200);
        const translate=ctx.translate,heights=[];let first=true;
        ctx.translate=function(x,y){if(first){heights.push(y);first=false;}return translate.call(this,x,y);};
        try{for(let n=0;n<=360;n++){first=true;drawWindsurferSprite(100,300,1,n*1000/60,335);}}
        finally{ctx.translate=translate;}
        const step=Math.max(...heights.slice(1).map((y,i)=>Math.abs(y-heights[i]))),range=Math.max(...heights)-Math.min(...heights);
        record('surfers-drift-gently-with-stable-wave-phase',left.every((v,i)=>v===right[i])&&range<=.51&&step<.005,{samePhase:left.every((v,i)=>v===right[i]),range,step});
        reset();
        record('ocean-shark-encounter-removed',segments[335].seaSprite==='windsurfer'&&!segments.some(s=>s.seaSprite==='windsurfer_victim')&&typeof drawSharkAttackSprite==='undefined'&&typeof getOceanSharkCycle==='undefined',{surfer:segments[335].seaSprite});
        reset();player.z=520*SEGMENT_LENGTH;player.x=1.25;applyRoadContact(1/60,0);
        record('car-cannot-drive-through-right-rock-wall',player.x<=1.05+1e-9,{x:player.x,side:player.wallContactSide});
        for(const level of[1,3,4,5,6]){
          reset(level);
          record(`opening-does-not-leak-to-level-${level}`,oceanCliffProfiles.length===0&&oceanCliffVegetation.length===0&&oceanPierSlices.length===0&&!isOceanRockTunnel(520)&&!segments.some(s=>s.sprite==='ocean_pier'||s.sprite==='coastal_boulder'),{level,profiles:oceanCliffProfiles.length});
        }
        return checks;
      });
      results.push(...checks.map(r=>({...r,errors,pass:r.pass&&errors.length===0})));
    } finally {await page.close();}
  }
  return results;
};
