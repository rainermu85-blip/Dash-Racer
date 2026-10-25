// Compare the actual rendered body edges with real swept collision outcomes.
// Flat fixtures isolate width; synthetic bends exercise the existing camera pan.
module.exports=async function runCarContacts(browser,baseUrl,output){
 const path=require('node:path'),checks=[];
 for(const viewport of[{width:320,height:640},{width:390,height:844},{width:480,height:800}]){
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
   const data=await page.evaluate(()=>{
    const result=[],draw=drawCarSprite,random=Math.random;let painted=[];
    Math.random=()=>.5;
    drawCarSprite=(...a)=>{painted.push(a);draw(...a);};
    const setup=(x,curve,look)=>{
     selectLevel(1);startRace();state='playing';
     for(const seg of segments){seg.curve=curve;seg.worldY=seg.hillDelta=0;seg.pylon=seg.barrier=seg.lightning=null;}
     for(const id of['introScreen','overlay','cntNum'])document.getElementById(id).style.display='none';
     player.x=x;player.z=45030;player.speed=3600;player.pitch=player.steerLean=player.fovOffset=0;curveCamera.look=look;
     opponents=opponents.slice(0,1);const car=opponents[0];car.z=player.z+getPlayerContactDistance();car.speed=3600;
     return car;
    };
    const edges=a=>{const g=getCarGeometry(a[0],a[1],a[2],a[4]);return{left:a[0]-.475*g.bw,right:a[0]+.475*g.bw};};
    const gap=()=>{
     painted=[];render(1000);const a=painted.find(a=>a[4]),b=painted.find(a=>!a[4]);
     if(!a||!b)return Infinity;
     const p=edges(a),o=edges(b);return a[0]<b[0]?o.left-p.right:p.left-o.right;
    };
    try{
     for(const [x,curve,look]of[[0,0,0],[.35,0,0],[-.35,0,0],[0,.7,.18],[0,-.7,-.18]])for(const side of[-1,1]){
      const car=setup(x,curve,look),width=getCarCollisionRange(player,car),center=getPlayerCollisionX();
      car.x=center+side*(width+.001);const outsideGap=gap();
      checkOpponentCollision({x:player.x,collisionX:center,z:racePosition(player)},[{x:car.x,z:car.z}],1/120);
      const clear=player.collisionCooldown===0&&car.contactAxis===null;
      car.x=center+side*(width-.001);
      checkOpponentCollision({x:player.x-side*.01,collisionX:center-side*.01,z:racePosition(player)},[{x:car.x,z:car.z}],1/120);
      const hit=player.collisionCooldown>0&&car.contactAxis==='x';
      const resolvedGap=gap(),separated=side*(car.x-getPlayerCollisionX())>=width-1e-5;
      result.push({name:`body-contact-${W}-${x}-${curve}-${side}`,pass:outsideGap>=-4&&outsideGap<8&&clear&&hit&&separated&&resolvedGap>=-4&&resolvedGap<8,
       actual:{outsideGap,resolvedGap,clear,hit,separated,roadUnits:width}});
     }
     setup(0,0,0);initOpponents();opponents=opponents.slice(0,2);
     const [a,b]=opponents,range=getCarCollisionRange(a,b);
     a.z=b.z=player.z+1500;a.x=-range/2;b.x=range/2;
     painted=[];render(1000);const cars=painted.filter(a=>!a[4]).sort((a,b)=>a[0]-b[0]);
     const pixelGap=edges(cars[1]).left-edges(cars[0]).right;
     result.push({name:`opponent-body-contact-${W}`,pass:pixelGap>=-4&&pixelGap<2,actual:{pixelGap,range}});
    }finally{drawCarSprite=draw;Math.random=random;clearTimeout(resultTimer);}
    return result;
   });
   checks.push(...data.map(c=>({...c,errors,pass:c.pass&&!errors.length})));
   await page.screenshot({path:path.join(output,`car-contact-${viewport.width}.png`)});
  }finally{await page.close();}
 }
 return checks;
};
