// Drive from the normal starting grid using only left/right inputs. Keep real
// track geometry, AI profiles, lane changes, hazards and acceleration intact.
module.exports=async function runDraftingPlay(browser,baseUrl){
 const results=[];
 for(const {level,holdOffset} of [...[1,2,3,4,5,6].map(level=>({level,holdOffset:0})),{level:4,holdOffset:-.3},{level:4,holdOffset:.3}]){
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:60000});
   await page.evaluate(async()=>{await document.fonts.ready;introScreen.style.display='none';});
   const actual=await page.evaluate(({level,holdOffset})=>{
    // Seed randomness for reproducibility; do not replace any AI decisions.
    const random=Math.random,draw=render;let seed=1989+level;
    Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    selectLevel(level);startRace();state='playing';cntNum.style.display='none';
    let time=1000;lastTime=time;smoothedDt=1/60;render=()=>{};
    let target=null,trigger=null,maxCharge=0,maxSpeed=0,previous=0,destination=0,kept=0,passed=false,endedOnContact=false;const aiTriggers=[],attempts=[];let wideHold=0;
    let frames=0;
    try{
     for(;frames<60*60;frames++){
      const here=getDraftPosition(player);
      if(!trigger){
       const ahead=opponents.filter(o=>getDraftPosition(o).z>here.z+COLLISION_Z_RANGE)
         .sort((a,b)=>getDraftPosition(a).z-getDraftPosition(b).z);
       if(player.draftTarget)target=player.draftTarget;
       else if(!target||getDraftPosition(target).z<=here.z+COLLISION_Z_RANGE)target=ahead[0];
       const error=(target?target.x+holdOffset*getDraftDimensions().width:0)-player.x;
       keys.left=error<-.015;keys.right=error>.015;
      }else{
       // A driver can leave the wake and pass once the thin blue corona appears.
       const error=destination-player.x;
       keys.left=error<-.018;keys.right=error>.018;
      }
      keys.boost=false;const aiBefore=opponents.map(o=>o.draftTimer);
      time+=1000/60;loop(time);maxCharge=Math.max(maxCharge,player.draftCharge);
      opponents.forEach((o,i)=>{if(o.draftTimer>aiBefore[i]+.1)aiTriggers.push({index:i,time:frames/60});});
      if(!trigger&&player.draftCharge>0&&player.draftTarget){
       const offset=Math.abs(player.x-player.draftTarget.x)/getDraftDimensions().width;
       if(offset>.2&&offset<=.4+1e-9)wideHold+=1/60;
      }else if(!trigger&&player.draftTimer===0)wideHold=0;
      if(!trigger&&player.draftTimer>previous+.1){
       trigger={time:frames/60,x:player.x,normal:player.maxSpeed*(1+player.cleanSpeedBonus),speed:player.speed,leader:target?.oppIdx,wideHold};
       const options=[-.42,.42].map(side=>clamp(player.x+side,-.8,.8)).filter(x=>Math.abs(x-player.x)>.35);
       const risk=lane=>opponents.reduce((cost,o)=>{
        if(o===target)return cost;
        const gap=getDraftPosition(o).z-getDraftPosition(player).z;
        for(const t of[0,.25,.5,1,1.5,2]){
         const x=player.x+(lane-player.x)*Math.min(1,t/.18),z=gap+(o.speed-trigger.normal*1.1)*t;
         cost+=Math.exp(-Math.pow(z/240,2)-Math.pow((o.x-x)/.28,2));
        }
        return cost;
       },0);
       destination=options.sort((a,b)=>risk(a)-risk(b))[0];
      }
      if(trigger&&previous>0&&player.draftTimer===0&&frames/60-trigger.time<1.98){
       endedOnContact=player.collisionCooldown>0||player.wallHitCooldown>0||player.parkedContact!=null||Math.abs(player.x)>=.94;
      }
      previous=player.draftTimer;
      if(trigger){
       maxSpeed=Math.max(maxSpeed,player.speed);if(player.draftTimer>0)kept+=1/60;
       if(frames/60-trigger.time>2.1){
        passed=getDraftPosition(target).z<getDraftPosition(player).z-COLLISION_Z_RANGE;
        attempts.push({trigger,kept,maxSpeed,passed,endedOnContact});
        if((kept>1.95||endedOnContact)&&maxSpeed>trigger.normal*1.08&&passed)break;
        // Retry if this attempt never reached the bonus speed and passed a car.
        trigger=null;maxSpeed=kept=previous=0;target=null;endedOnContact=false;wideHold=0;
       }
      }
     }
    }finally{render=draw;Math.random=random;keys.left=keys.right=false;}
    render(time);
    return {level,holdOffset,trigger,maxCharge,maxSpeed,kept,passed,endedOnContact,attempts,aiTriggers,seconds:frames/60,timer:player.draftTimer};
   },{level,holdOffset});
   results.push({name:`draft-normal-race-${level}-follow-and-overtake${holdOffset?`-offset-${holdOffset}`:""}`,pass:!!actual.trigger&&(!holdOffset||actual.trigger.wideHold>1.5)&&(actual.kept>1.95||actual.endedOnContact)&&actual.passed&&actual.maxSpeed>actual.trigger.normal*1.08&&actual.timer===0&&errors.length===0,actual,errors});
  }finally{await page.close();}
 }
 results.push({name:'draft-normal-ai-also-triggers',pass:results.some(r=>r.actual.aiTriggers.length>0),actual:results.flatMap(r=>r.actual.aiTriggers.map(a=>({level:r.actual.level,...a})))});
 return results;
};
