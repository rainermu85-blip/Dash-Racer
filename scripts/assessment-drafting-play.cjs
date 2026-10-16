// Drive real starting grids with left/right inputs. Cars, courses, hazards and
// pace remain unchanged. Wait with the earned corona, then pull fully clear.
module.exports=async function runDraftingPlay(browser,baseUrl){
 const results=[];
 const cases=[...[1,2,3,4,5,6].map(level=>({level,holdOffset:0})),{level:4,holdOffset:-.3},{level:4,holdOffset:.3}];
 for(const {level,holdOffset} of cases){
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:60000});
   await page.evaluate(async()=>{await document.fonts.ready;introScreen.style.display='none';});
   const actual=await page.evaluate(({level,holdOffset})=>{
    const random=Math.random,draw=render;let seed=1989+level;
    Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    selectLevel(level);startRace();state='playing';cntNum.style.display='none';
    let time=1000;lastTime=time;smoothedDt=1/60;render=()=>{};
    let target=null,ready=null,trigger=null,wideHold=0,maxSpeed=0,kept=0,previous=0,passed=false,endedOnContact=false;
    const attempts=[],aiTriggers=[];let frames=0,earlyRelease=false;
    const chooseExit=leader=>{
     const width=getDraftDimensions().width,center=leader.x;
     const options=[center-width-.1,center+width+.1].map(x=>clamp(x,-.8,.8)).filter(x=>Math.abs(x-center)>width+.03);
     const risk=lane=>opponents.reduce((cost,o)=>{
      if(o===leader)return cost;
      const gap=getDraftPosition(o).z-getDraftPosition(player).z;
      for(const t of[0,.25,.5,1,1.5,2]){
       const x=player.x+(lane-player.x)*Math.min(1,t/.2),z=gap+(o.speed-player.maxSpeed*(1+player.cleanSpeedBonus)*1.1)*t;
       cost+=Math.exp(-Math.pow(z/240,2)-Math.pow((o.x-x)/.28,2));
      }
      return cost;
     },0);
     return options.sort((a,b)=>risk(a)-risk(b))[0]??null;
    };
    try{
     for(;frames<60*75;frames++){
      const now=frames/60,here=getDraftPosition(player);
      if(ready&&!player.draftReady&&!trigger){ready=null;target=null;wideHold=0;}
      if(!trigger){
       const ahead=opponents.filter(o=>getDraftPosition(o).z>here.z+COLLISION_Z_RANGE).sort((a,b)=>getDraftPosition(a).z-getDraftPosition(b).z);
       if(player.draftTarget)target=player.draftTarget;
       else if(!target||getDraftPosition(target).z<=here.z+COLLISION_Z_RANGE)target=ahead[0];
      }
      let destination=target?target.x+holdOffset*getDraftDimensions().width:0;
      if(ready&&now-ready.time>=.6&&ready.destination!==null)destination=ready.destination;
      if(trigger)destination=ready.destination;
      const error=destination-player.x;keys.left=error<-.015;keys.right=error>.015;keys.boost=false;
      const aiBefore=opponents.map(o=>o.draftTimer),source=player.draftTarget;
      time+=1000/60;loop(time);
      opponents.forEach((o,i)=>{if(o.draftTimer>aiBefore[i]+.1)aiTriggers.push({index:i,time:now});});
      if(!trigger&&player.draftCharge>0&&player.draftTarget){
       const offset=Math.abs(player.x-player.draftTarget.x)/getDraftDimensions().width;
       if(offset>.2&&offset<=.4+1e-9)wideHold+=1/60;
      }else if(!trigger&&!player.draftReady&&player.draftTimer===0)wideHold=0;
      if(player.draftReady&&!ready){
       target=player.draftTarget;
       ready={time:now,normal:player.maxSpeed*(1+player.cleanSpeedBonus),wideHold,destination:chooseExit(target),waited:0,partial:0};
      }
      if(player.draftReady&&ready){
       if(now-ready.time<.6)ready.waited+=1/60;
       const offset=Math.abs(player.x-player.draftTarget.x)/getDraftDimensions().width;
       if(offset>.4&&offset<1)ready.partial+=1/60;
       if(player.draftTimer!==0)earlyRelease=true;
      }
      if(!trigger&&player.draftTimer>previous+.1){
       const leader=source??target,offset=Math.abs(player.x-leader.x)/getDraftDimensions().width;
       if(offset<1-1e-7)earlyRelease=true;
       trigger={time:now,normal:player.maxSpeed*(1+player.cleanSpeedBonus),offset,wideHold:ready?.wideHold??0,waited:ready?.waited??0,partial:ready?.partial??0};
       target=leader;
      }
      if(trigger&&previous>0&&player.draftTimer===0&&now-trigger.time<1.98){
       endedOnContact=player.collisionCooldown>0||player.wallHitCooldown>0||player.parkedContact!=null||Math.abs(player.x)>=.94;
      }
      previous=player.draftTimer;
      if(trigger){
       maxSpeed=Math.max(maxSpeed,player.speed);if(player.draftTimer>0)kept+=1/60;
       if(now-trigger.time>2.1){
        passed=getDraftPosition(target).z<getDraftPosition(player).z-COLLISION_Z_RANGE;
        attempts.push({trigger,kept,maxSpeed,passed,endedOnContact});
        if((kept>1.95||endedOnContact)&&maxSpeed>trigger.normal*1.08&&passed&&trigger.waited>.5&&(!holdOffset||trigger.wideHold>1.5))break;
        target=ready=trigger=null;wideHold=maxSpeed=kept=previous=0;endedOnContact=false;
       }
      }
     }
    }finally{render=draw;Math.random=random;keys.left=keys.right=false;}
    render(time);
    return {level,holdOffset,trigger,maxSpeed,kept,passed,endedOnContact,earlyRelease,attempts,aiTriggers,seconds:frames/60,timer:player.draftTimer};
   },{level,holdOffset});
   results.push({name:`draft-normal-race-${level}-ready-clear-and-pass${holdOffset?`-offset-${holdOffset}`:''}`,pass:!!actual.trigger&&!actual.earlyRelease&&actual.trigger.waited>.5&&actual.trigger.offset>=1-1e-7&&(!holdOffset||actual.trigger.wideHold>1.5)&&(actual.kept>1.95||actual.endedOnContact)&&actual.passed&&actual.maxSpeed>actual.trigger.normal*1.08&&actual.timer===0&&errors.length===0,actual,errors});
  }finally{await page.close();}
 }
 results.push({name:'draft-normal-ai-also-arms-and-clears',pass:results.some(r=>r.actual.aiTriggers.length>0),actual:results.flatMap(r=>r.actual.aiTriggers.map(a=>({level:r.actual.level,...a})))});
 return results;
};
