/* Paradise Circuit: isolated scenery/route code; no changes to other worlds.
 * Static art is baked once at race start. Moving objects use the same road
 * projection and painter order as the cars. World layout is deterministic. */
const PARADISE_ISLANDS = ['LAGOON KEY','EMERALD ISLE','SUNSET AIRPORT','PORT AZURE','CORAL CAY'];
const PARADISE_PLANE_SEGMENT = 1590;
const paradiseArt = new Map();
let paradisePlane = { elapsed: null, start: null };
function paradiseSmooth(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
function paradiseHeight(i){
  const part=((i%700)+700)%700;
  // Low causeways, a gently lifted second crossing, and an elevated cable bridge.
  const island=Math.floor(((i%3500)+3500)%3500/700);
  if(part<350)return 0;
  const amplitude=[0,200,0,300,0][island];
  return amplitude*Math.sin((part-350)/350*Math.PI)**2;
}
function buildParadiseRoute(){
  return Array.from({length:3500},(_,i)=>{
    const island=Math.floor(i/700),p=i%700;
    // Straight runway approach and a straight, legible final run to the line.
    const bend=island===3?(p>=220&&p<350?-.18*Math.sin((p-220)/130*Math.PI)**2:0):island===2?(p<70?.12*Math.sin(p/70*Math.PI)**2:0):
      p<350?[.32,-.36,.0,.30,-.28][island]*Math.sin(p/350*Math.PI*2)**3:
      [0,.20,-.13,0,0][island]*Math.sin((p-350)/350*Math.PI)**2;
    return {curve:bend,hill:paradiseHeight(i+1)-paradiseHeight(i)};
  });
}
function buildParadiseScenery(){
  paradisePlane={elapsed:null,start:null};
  const add=(index,kind,x,size=1,extra={})=>{
    segments[index].paradiseScenes??=[];
    segments[index].paradiseScenes.push({kind,x,size,...extra});
  };
  for(let island=0;island<5;island++){
    const base=island*700;
    add(base+40,'sign',-1.65,1,{variant:island});
    // Irregular groves leave deliberate windows towards the water and landmarks.
    for(let j=0;j<19;j++){
      const p=55+j*14+(j*7%11),side=j%3===0?1:-1;
      if(island===2&&p>110&&p<235)continue;
      add(base+p,'palm',side*(1.7+(j*13%17)/18),.72+(j%4)*.12,{variant:j%3});
      if(island===1){add(base+p+3,'bush',side*2.3,1.25);add(base+p+5,'palm',-side*3.4,1.15,{variant:(j+1)%3});}
      if(j%4===0&&island!==2)add(base+p+6,'palm',-side*3.8,.95,{variant:(j+1)%3});
      if(j%3===0)add(base+p+7,'flowers',side*1.55,.65);
    }
    for(const [p,x,variant]of [[100,6,0],[230,8,1],[310,-7,2]])
      if(island!==2)add(base+p,'boat',x,.65,{variant,sea:true});
    // Approaching island silhouette sits on its actual island, visible off bridge.
    if(island===1)add(base+205,'waterfall',-3.7,1.7);
    if(island===4)add(base+50,'rock_arch',-3.0,1.3);
    for(let p=370;p<690;p+=16)add(base+p,'bridge_post',0,1,{variant:island});
    if(island===3){add(base+440,'bridge_tower',0,1);add(base+595,'bridge_tower',0,1);}
  }
  [[95,-2.1,0],[170,2.4,1],[250,-2.25,2]].forEach(([i,x,v])=>add(i,'hut',x,1,{variant:v}));
  add(200,'canoe',2.2,.8);add(285,'beach_bar',2.2,1.15);
  add(765,'rock',2.0,1.1);add(845,'rock',-1.9,.85);add(970,'rock',2.2,1.5);
  add(1535,'airport',5.2,1.45);add(1625,'tower',3.1,1.2);
  add(PARADISE_PLANE_SEGMENT,'plane',0,1);
  for(let j=0;j<6;j++)add(2150+j*29,'harbour',(j%2?-1:1)*(2.15+(j%2)*.4),1,{variant:j%3});
  add(2240,'beach_bar',2.3,1.2);add(2340,'lighthouse',-2.25,1.1);
  for(let j=0;j<4;j++)add(2855+j*55,'hut',6.1,.9,{variant:2,stilts:true,sea:true});
  add(2935,'canoe',-2.1,.85);add(3015,'beach_bar',-2.3,1.0);
  for(const seg of segments)for(const scene of seg.paradiseScenes||[])getParadiseArt(scene.kind,scene.variant||0);
}
function updateParadisePlane(dt){
  if(paradisePlane.elapsed===null&&player.z/150>=PARADISE_PLANE_SEGMENT-135&&player.z/150<PARADISE_PLANE_SEGMENT){
    paradisePlane.elapsed=0;paradisePlane.start=raceElapsed;
  }else if(paradisePlane.elapsed!==null){
    // A late turbo must not let the driver outrun the crossing spectacle.
    const approachPhase=(player.z/150-(PARADISE_PLANE_SEGMENT-135))/28.8;
    paradisePlane.elapsed=Math.max(paradisePlane.elapsed+dt,approachPhase);
  }
}
function paradisePlanePose(){
  const t=paradisePlane.elapsed;
  if(t===null||t>9)return null;
  // 747-class length ~70 m against the 20 m full road; four engine nacelles.
  // Crosses the roadway before the driver arrives; wheels meet runway to right.
  return {x:-18+t*5.5,height:Math.max(-9,470-t*125),landed:t>=3.832};
}
function collectParadiseSprites(seg,n,rx,p,clipY,getCleanSpriteFromPool){
  for(const item of seg.paradiseScenes||[]){
    const pose=item.kind==='plane'?paradisePlanePose():null;
    if(item.kind==='plane'&&!pose)continue;
    const s=getCleanSpriteFromPool();s.type='paradise';s.item=item;
    s.x=rx+(pose?pose.x:item.x)*p.w;
    s.y=p.y+(item.sea?95*p.scale*H/2:0);
    s.sc=p.w/200*item.size;
    if(pose)s.y-=pose.height*s.sc;
    s.depth=n;s.segIdx=seg.index;s.clipY=clipY;s.variant=item.variant||0;
  }
}
function drawParadiseSprite(s){
  const a=getParadiseArt(s.item.kind,s.variant);
  if(!a||s.sc<.012||s.x+(a.w-a.ox)*s.sc<0||s.x-a.ox*s.sc>W)return;
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,Math.min(H,s.clipY));ctx.clip();
  // A short distance fade avoids objects popping at the far draw boundary.
  ctx.globalAlpha*=1-paradiseSmooth((s.depth-160)/45);
  ctx.drawImage(a.canvas,s.x-a.ox*s.sc,s.y-a.oy*s.sc,a.w*s.sc,a.h*s.sc);
  ctx.restore();
}
function drawParadiseBackdrop(horizon,t){
  const water=ctx.createLinearGradient(0,horizon,0,H);
  water.addColorStop(0,'#568faa');water.addColorStop(.22,'#278caa');water.addColorStop(.65,'#24b5b6');water.addColorStop(1,'#43c8b8');
  ctx.fillStyle=water;ctx.fillRect(0,horizon,W,H-horizon);
  // A few distant landforms and sails; no full-screen moving texture layers.
  for(let j=0;j<7;j++){
    const period=W+260,x=((j*227-bgOffset*.11) % period+period)%period-130;
    const y=horizon+6+(j%3)*8,w=90+(j*29%100),h=16+(j*19%48);
    ctx.fillStyle=j%2?'#427d7e':'#4b8d8c';ctx.beginPath();ctx.moveTo(x-w,y);ctx.bezierCurveTo(x-w*.55,y-h*.12,x-w*.46,y-h*.91,x-w*.12,y-h);ctx.bezierCurveTo(x+w*.07,y-h*1.12,x+w*.22,y-h*.42,x+w*.4,y-h*.42);ctx.bezierCurveTo(x+w*.72,y-h*.48,x+w*.72,y-h*.08,x+w,y);ctx.fill();
    sceneLine([[x-w,y+1],[x+w,y+1]],'#8dd1c2',2);
  }
  for(let j=0;j<24;j++){
    const depth=(j+1)/25,y=horizon+(H-horizon)*depth*depth;
    const x=((j*137-bgOffset*(.1+depth*.16)+Math.sin(t*.00025+j)*5)%(W+150)+W+150)%(W+150)-75;
    ctx.fillStyle=j%3?'rgba(173,248,221,.18)':'rgba(255,223,179,.25)';
    ctx.fillRect(x,y,12+depth*65,1+depth);
  }
}
function paradiseShore(index,side){
  const p=((index%700)+700)%700;
  if(p>=350)return 1.1;
  const envelope=Math.sin(p/350*Math.PI)**.45;
  const airport=Math.floor(index/700)===2&&side>0?27*paradiseSmooth((p-90)/65)*(1-paradiseSmooth((p-235)/65)):0;
  return 1.1+airport+envelope*(4.4+Math.sin(p*.031+side)*.6+Math.sin(p*.087+side)*.22);
}
function drawParadiseRoad(x1,y1,w1,x2,y2,w2,sc1,sc2,index){
  const p=index%700,island=Math.floor(index/700),bridge=p>=350;
  const quad=(l1,r1,l2,r2,color,dy1=0,dy2=0)=>scenePoly([[x1+l1*w1,Math.ceil(y1-dy1)],[x2+l2*w2,Math.floor(y2-dy2)-1],[x2+r2*w2,Math.floor(y2-dy2)-1],[x1+r1*w1,Math.ceil(y1-dy1)]],color);
  if(!bridge){
    for(const side of[-1,1]){
      const a=paradiseShore(index,side),b=paradiseShore(index+1,side);
      // Shore, greenery and sand stay in the same road plane: no global sea projection changes.
      quad(side*1.05,side*(a+.3),side*1.05,side*(b+.3),'#7ad9c2');
      quad(side*1.03,side*a,side*1.03,side*b,'#e7cba0');
      if(a>2&&b>2)quad(side*1.7,side*(a-.45),side*1.7,side*(b-.45),island===1?'#2c7459':'#639666');
    }
    if(island===4&&[55,110,165,220].some(a=>p>=a-5&&p<=a)){
      quad(1.4,6.7,1.4,6.7,'#ad8f72');
      if(p%2===0)quad(1.4,6.7,1.4,6.7,'#c5a885');
    }
    // The runway crosses behind the road, perpendicular to our route, extending into airport grounds.
    if(island===2&&p>=175&&p<205){
      quad(1.18,24,1.18,24,'#697b81');
      if(p>=188&&p<191)for(let x=2;x<24;x+=3)quad(x,x+1.5,x,x+1.5,'#f1e7c9');
      if(p===176||p===203)quad(1.2,24,1.2,24,'#f7de9a');
    }
  }
  quad(-1.10,-1,-1.10,-1,bridge?'#b4c4bc':'#d8bc98');quad(1,1.10,1,1.10,bridge?'#b4c4bc':'#d8bc98');
  quad(-1,1,-1,1,'#465368');
  quad(-.975,-.955,-.975,-.955,'#f9e6c2');quad(.955,.975,.955,.975,'#f9e6c2');
  if(index%12<6)for(const lane of[-1/3,1/3])quad(lane-.008,lane+.008,lane-.008,lane+.008,'#efdfbc');
  if(index<3)for(let j=0;j<12;j++)quad(-1+j/6,-1+(j+1)/6,-1+j/6,-1+(j+1)/6,(j+index)%2?'#f7f1d2':'#333849');
  if(bridge){
    if(island===3){
      const height=i=>{const p=i%700;return Math.max(0,1-Math.abs(p-441)/72,1-Math.abs(p-596)/72)*566;};
      const h1=height(index),h2=height(index+1);
      if(h1||h2)for(const side of[-1,1]){
        sceneLine([[x1+side*1.05*w1,y1-h1*w1/200],[x2+side*1.05*w2,y2-h2*w2/200]],'#d2ebce',Math.max(.6,w2*.008));
        if(index%9===0)sceneLine([[x2+side*1.05*w2,y2-h2*w2/200],[x2+side*1.05*w2,y2-w2*.16]],'#9fc9ba',Math.max(.5,w2*.004));
      }
    }
    for(const side of[-1,1]){
      // Solid low parapet and continuous rail, projected without segment snapping.
      scenePoly([[x1+side*1.07*w1,y1],[x2+side*1.07*w2,y2],[x2+side*1.07*w2,y2-sc2*155*H/2],[x1+side*1.07*w1,y1-sc1*155*H/2]],['#afc9c2','#8eb9c0','#b8cfbc','#ccd6cc','#a6c6bc'][island]);
      quad(side*1.04,side*1.10,side*1.04,side*1.10,'#e7e0c3',sc1*155*H/2,sc2*155*H/2);
    }
  }
}
function getParadiseArt(kind,variant=0){
  if(!['palm','hut','harbour','boat','sign','bridge_post'].includes(kind))variant=0;
  const key=kind+':'+variant;if(paradiseArt.has(key))return paradiseArt.get(key);
  const sizes={palm:[250,350,125,349],flowers:[180,90,90,89],bush:[270,170,135,169],
    hut:[360,270,180,269],beach_bar:[420,250,210,249],harbour:[340,330,170,329],
    rock:[280,220,140,219],waterfall:[640,500,320,499],rock_arch:[440,360,220,359],
    boat:[260,220,130,210],canoe:[240,100,120,99],airport:[520,220,260,219],tower:[240,400,120,399],
    lighthouse:[220,400,110,399],sign:[260,180,130,179],bridge_post:[460,65,230,64],
    bridge_tower:[620,620,310,619],plane:[1480,430,740,405]};
  const [w,h,ox,oy]=sizes[kind]||[1,1,0,0],canvas=document.createElement('canvas');const raster=.65;canvas.width=Math.ceil(w*raster);canvas.height=Math.ceil(h*raster);
  const g=canvas.getContext('2d');g.scale(raster,raster);g.translate(ox,oy);
  const poly=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
  const rect=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const line=(pts,c,l=2)=>{g.strokeStyle=c;g.lineWidth=l;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();};
  const oval=(x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();};
  const label=(text,x,y,size,c)=>{g.font=`${size}px 'Gravity Pixel', monospace`;g.textAlign='center';g.fillStyle=c;g.fillText(text,x,y);};
  if(kind==='palm'){
    const lean=[26,-24,7][variant%3],top=-270-(variant%2)*35;
    poly([[-9,0],[6,0],[lean+3,top],[lean-7,top]],'#755e54');
    line([[3,-5],[lean-2,top]],'#e0ae80',3);
    for(let j=0;j<7;j++){
      const angle=j/6*Math.PI+Math.PI,ex=lean+Math.cos(angle)*110,ey=top+Math.sin(angle)*35+38;
      g.fillStyle=['#164f50','#27816b','#64bb86'][j%3];g.beginPath();g.moveTo(lean,top);g.quadraticCurveTo((lean+ex)*.5,top-55,ex,ey);g.quadraticCurveTo((lean+ex)*.5,top+5,lean,top);g.fill();
      line([[lean,top],[(lean+ex)*.5,top-12],[ex,ey]],'#85c694',1.2);
    }
    for(let j=0;j<3;j++)oval(lean-7+j*8,top+10,5,7,'#b49a60');
  }else if(kind==='bush'||kind==='flowers'){
    for(let j=0;j<17;j++){
      const x=Math.sin(j*4.1)*(kind==='bush'?98:65),y=-6-(j*23% (kind==='bush'?110:45));
      oval(x,y-9,18+j%4*3,12+j%3*4,j%2?'#30785a':'#5fa46e');poly([[x-5,y],[x-24,y-25],[x-4,y-15],[x+14,y-33],[x+10,y]],'#45916a');
      if(kind==='flowers'&&j%3===0)for(let k=0;k<4;k++)oval(x+Math.cos(k*1.57)*5,y-18+Math.sin(k*1.57)*5,5,5,k%2?'#ff608f':'#f5abd0');
    }
  }else if(kind==='hut'||kind==='beach_bar'){
    const bar=kind==='beach_bar',wide=bar?180:130;
    rect(-wide+15,-70,8,70,'#67534d');rect(wide-23,-70,8,70,'#67534d');
    rect(-wide,-75,wide*2,10,'#b49676');rect(-wide+10,-165,wide*2-20,90,['#eeab97','#80c8bf','#f0ca86'][variant%3]);
    poly([[-wide-12,-160],[0,-235],[wide+12,-160]],'#84664d');
    for(let j=0;j<11;j++)line([[-wide-12+j*(wide*2+24)/10,-160],[j*10-50,-205]],'#c69d6c',3);
    rect(-wide+27,-147,57,58,'#32576a');rect(wide-84,-147,57,58,'#32576a');
    rect(-18,-144,36,69,'#735a5d');
    if(bar){rect(-140,-102,280,15,'#d287a1');label('LAGOON CLUB',0,-177,19,'#ffe8a4');for(let j=0;j<5;j++){rect(-112+j*53,-123,6,20,['#53b8ac','#f3a5bd','#e3c970'][j%3]);rect(-115+j*53,-66,10,38,'#604e54');}}
    else{line([[-wide+4,-87],[wide-4,-87]],'#ecd5ac',3);for(let j=-3;j<=3;j++)rect(j*34,-89,3,17,'#ecd5ac');}
  }else if(kind==='harbour'){
    const c=['#eaaaaf','#8dc8b8','#dfc884'][variant%3];
    rect(-138,-235,276,235,c);poly([[-152,-235],[0,-298],[152,-235]],'#ac707c');
    rect(-132,-230,264,9,'#fce2bc');rect(-140,-16,280,16,'#d7af95');
    for(let j=0;j<4;j++){rect(-111+j*61,-207,40,60,'#487989');rect(-113+j*61,-211,44,6,'#fbe0ba');line([[-91+j*61,-205],[-91+j*61,-148]],'#dfcfa9',3);}
    rect(-115,-123,230,70,'#305d6b');
    for(let j=0;j<9;j++)rect(-135+j*30,-133,30,20,j%2?'#f4dcb9':['#c56483','#438d86','#9b728d'][variant%3]);
    label(['AZURE SAILS','CAFE CORAL','ISLAND RECORDS'][variant%3],0,-30,16,'#4b4e63');
  }else if(kind==='rock'||kind==='waterfall'||kind==='rock_arch'){
    if(kind==='rock_arch'){
      // The transparent opening remains genuinely open, with turquoise water behind.
      poly([[-204,0],[-186,-185],[-115,-307],[-25,-348],[118,-298],[196,-160],[211,0],[113,0],[100,-179],[54,-229],[-30,-237],[-92,-174],[-110,0]],'#7d8a7d');
      poly([[-186,-185],[-115,-307],[-25,-348],[118,-298],[49,-275],[-61,-267],[-119,-165],[-132,0],[-204,0]],'#a1ad93');
      for(let j=0;j<7;j++)oval(-110+j*33,-285-Math.sin(j)*16,25,12,'#468061');
    }else{
      const big=kind==='waterfall',r=big?300:120,ht=big?470:205;
      poly([[-r,0],[-r*.91,-ht*.38],[-r*.55,-ht*.83],[-r*.18,-ht],[r*.18,-ht*.89],[r*.41,-ht*.96],[r*.8,-ht*.52],[r,0]],'#486e68');
      poly([[-r,0],[-r*.55,-ht*.83],[-r*.18,-ht],[-r*.25,-ht*.5],[r*.1,0]],'#628574');
      for(let j=0;j<28;j++){const x=Math.sin(j*2.4)*r*.75,y=-30-j/28*ht*.85;oval(x,y,25+(j%3)*8,14,'#2e795b');}
      if(big){poly([[-31,-387],[19,-387],[11,-210],[34,-88],[4,-21],[-55,-28],[-29,-160]],'#70dacf');line([[-12,-381],[-8,-216],[8,-82],[-17,-23]],'#d1eee0',9);oval(-9,-18,66,13,'#ace7d2');}
    }
  }else if(kind==='boat'||kind==='canoe'){
    const canoe=kind==='canoe';
    poly([[-115,-24],[115,-24],[80,-3],[-71,-3]],variant%2?'#f5c6a4':'#eae5c6');
    line([[-110,-25],[108,-25]],'#e7889a',5);
    if(!canoe&&variant!==2){line([[-12,-25],[-12,-205]],'#ece3c9',3);poly([[-18,-196],[-18,-44],[-105,-44]],'#fff0d2');poly([[-5,-182],[87,-44],[-5,-44]],'#e6b8bf');}
    else if(!canoe){rect(-62,-62,115,35,'#eae5d6');rect(-52,-57,85,18,'#3b6c83');poly([[-60,-64],[-23,-93],[26,-88],[50,-64]],'#e5c8ae');}
    else{line([[-90,-43],[82,-3]],'#88675a',5);oval(-5,-46,8,8,'#a57760');rect(-11,-39,14,17,'#ed84a8');}
  }else if(kind==='airport'){
    rect(-245,-100,490,100,'#ddd4bb');rect(-245,-115,490,15,'#de9caa');
    rect(-220,-88,440,53,'#487988');for(let j=0;j<12;j++)rect(-218+j*39,-88,4,53,'#c8d4c0');
    poly([[-260,-115],[-190,-160],[206,-160],[260,-115]],'#8aa899');
    label('SUNSET AIR • 747',0,-177,26,'#ffeac0');
    for(let j=-2;j<=2;j++)rect(j*85-8,-25,16,25,'#a4a58f');
  }else if(kind==='tower'||kind==='lighthouse'){
    const airport=kind==='tower';
    poly([[-47,0],[-35,-290],[35,-290],[47,0]],airport?'#c4c5ad':'#eee0be');
    if(!airport)for(let j=0;j<3;j++)rect(-34,-85-j*80,68,25,'#e18f9c');
    rect(-72,-335,144,47,'#455f79');rect(-82,-344,164,10,'#e5d6b6');
    for(let j=-2;j<=2;j++)rect(j*25-2,-335,4,47,'#bce3d2');
    poly([[-85,-344],[0,-380],[85,-344]],airport?'#91aba1':'#d58fa4');
    rect(-80,-288,160,9,'#e3d6b7');rect(-11,-42,22,42,'#526b70');
  }else if(kind==='sign'){
    rect(-97,-121,7,121,'#89796b');rect(90,-121,7,121,'#89796b');
    rect(-122,-162,244,73,'#245968');rect(-117,-157,234,3,'#f9bfab');
    label(PARADISE_ISLANDS[variant],0,-128,18,'#ffe6b4');label(`${variant+1} / 5  •  PARADISE`,0,-105,11,'#7fe9ca');
  }else if(kind==='bridge_post'){
    for(const side of[-1,1]){rect(side*214-4,-55,8,55,['#aa8062','#d4dbbf','#abc5c1','#d4dbbf','#6fabc0'][variant]);rect(side*214-6,-58,12,6,variant===2?'#ffb971':'#f7e3b5');}
  }else if(kind==='bridge_tower'){
    for(const side of[-1,1]){
      poly([[side*210-15,0],[side*210-10,-566],[side*210+10,-566],[side*210+15,0]],'#eee0c0');
      for(let j=0;j<5;j++)line([[side*210,-535+j*35],[side*(215+j*18),-12]],'#a5d7cb',2);
    }
    rect(-226,-565,452,16,'#e6c79f');rect(-226,-549,452,5,'#f4aeb2');
  }else if(kind==='plane'){
    // Side-on 747 silhouette: raised forward deck, long nose, swept wings,
    // four separate engines, tail fin, and deployed main/nose landing gear.
    poly([[-625,-115],[-694,-339],[-623,-339],[-490,-122]],'#e27e9f');
    poly([[-670,-118],[-550,-196],[-501,-195],[-535,-108]],'#f1d2bf');
    poly([[-160,-102],[-430,-354],[-345,-354],[136,-115]],'#8cb4c4');
    for(const x of[-310,-183]){oval(x,-201,49,24,'#d2dcd4');oval(x+31,-202,18,21,'#3d566c');}
    poly([[-687,-115],[-605,-147],[289,-147],[390,-182],[537,-180],[636,-150],[714,-112],[720,-91],[679,-70],[-555,-70]],'#f4e4d4');
    poly([[-678,-115],[706,-115],[720,-91],[679,-70],[-555,-70]],'#c5bfc5');
    rect(-564,-126,1177,10,'#de719b');
    poly([[530,-167],[604,-152],[627,-139],[532,-139]],'#41647d');
    for(let j=0;j<43;j++)rect(-485+j*25,-142,10,7,'#446679');
    for(let j=0;j<8;j++)rect(315+j*25,-168,9,7,'#446679');
    poly([[-150,-106],[-432,22],[-283,21],[249,-88]],'#e5d9d0');
    for(const x of[-237,-76]){oval(x,-43,62,24,'#ebdad2');oval(x+43,-43,20,21,'#46627a');line([[x-22,-65],[x+18,-81]],'#6b8390',12);}
    for(const x of[-160,12,590]){rect(x,-73,7,45,'#535969');oval(x+3,-23,12,14,'#34394e');oval(x+24,-23,12,14,'#34394e');}
    poly([[-641,-301],[-627,-318],[-593,-278],[-607,-257]],'#fff1d1');
    label('PARADISE AIR',320,-90,29,'#6c697f');
  }
  const art={canvas,w,h,ox,oy};paradiseArt.set(key,art);return art;
}
