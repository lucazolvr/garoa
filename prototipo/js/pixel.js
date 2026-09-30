(function(){
if(window.PX)return;
const P={void:'#07061a',ink:'#0e0d24',night:'#161538',deep:'#221f4e',slate:'#302d68',dusk:'#46457f',haze:'#6c6ba6',fog:'#9e9fc9',white:'#f6f0e2',paper:'#ebdfc2',paper2:'#d0bf99',paper3:'#9e8a66',cork:'#9b6b3d',cork2:'#6a4628',amber:'#ffb43a',amberL:'#ffdd7e',amberD:'#c26f1f',red:'#e2433b',redD:'#8c1e2d',teal:'#4fd1c5',moss:'#284a47',leaf:'#3b6e4f',skin1:'#f0c196',skin2:'#c88a5c',skin3:'#865236'};
const SH={};[[P.amberL,P.amber],[P.amber,P.amberD],[P.amberD,P.cork2],[P.red,P.redD],[P.redD,P.deep],[P.cork,P.cork2],[P.cork2,P.void],[P.paper,P.paper2],[P.paper2,P.paper3],[P.paper3,P.cork2],[P.white,P.paper2],[P.fog,P.haze],[P.haze,P.dusk],[P.dusk,P.slate],[P.slate,P.deep],[P.deep,P.night],[P.night,P.ink],[P.ink,P.void],[P.void,P.void],[P.teal,P.moss],[P.moss,P.night],[P.leaf,P.moss],[P.skin1,P.skin2],[P.skin2,P.skin3],[P.skin3,P.cork2]].forEach(([a,b])=>SH[a]=b);
const LT={[P.slate]:P.dusk,[P.dusk]:P.haze,[P.haze]:P.fog,[P.cork2]:P.cork,[P.deep]:P.slate,[P.moss]:P.leaf,[P.redD]:P.red,[P.cork]:P.paper3,[P.paper3]:P.paper2};
const sh=c=>SH[c]||c;
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return{c,g,r:(col,x,y,w=1,h=1)=>{g.fillStyle=col;g.fillRect(x|0,y|0,w,h);},url:()=>c.toDataURL()};}
const B4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const dith=(x,y,t)=>B4[((y%4)+4)%4][((x%4)+4)%4]/16<t;
const K={k:P.void,i:P.ink,n:P.night,d:P.deep,s:P.slate,u:P.dusk,h:P.haze,f:P.fog,w:P.white,p:P.paper,'2':P.paper2,'3':P.paper3,c:P.cork,C:P.cork2,a:P.amber,L:P.amberL,D:P.amberD,r:P.red,R:P.redD,t:P.teal,m:P.moss};
function spr(rows,map){map=Object.assign({},K,map||{});const h=rows.length,w=Math.max(...rows.map(r=>r.length));const z=cv(w,h);rows.forEach((row,y)=>{[...row].forEach((ch,x)=>{if(ch!=='.'&&map[ch])z.r(map[ch],x,y);});});return z.url();}
const lum=h=>{const n=parseInt(h.slice(1),16);return (n>>16)*.3+((n>>8)&255)*.59+(n&255)*.11;};
function rimSpr(rows,map,skip){map=Object.assign({},K,map||{});const h=rows.length,w=Math.max(...rows.map(r=>r.length));const z=cv(w,h);rows.forEach((row,y)=>{let f=-1;for(let x=1;x<row.length;x++){if(row[x]!=='.'&&row[x]!=='k'){if(row[x-1]==='k')f=x;break;}}[...row].forEach((ch,x)=>{if(ch==='.'||!map[ch])return;let col=map[ch];if(x===f&&!(skip||'').includes(ch))col=lum(col)>120?P.amberL:P.amberD;z.r(col,x,y);});});return z.url();}
function circ(z,cx,cy,r,col){for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++){if((x-cx)**2+(y-cy)**2<=r*r+0.5)z.r(col,x,y);}}
function ring(z,cx,cy,r,col){for(let y=Math.floor(cy-r-1);y<=cy+r+1;y++)for(let x=Math.floor(cx-r-1);x<=cx+r+1;x++){const d=Math.hypot(x-cx,y-cy);if(Math.abs(d-r)<0.55)z.r(col,x,y);}}
function line(z,x0,y0,x1,y1,col){x0|=0;y0|=0;x1|=0;y1|=0;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(;;){z.r(col,x0,y0);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}

const ICONS={
lupa:["...kkkk.....","..kaLLak....",".kLhwwhDk...","kaLwhhhuDk..","kLhwhhuuDk..","kahhhuuusk..","kahhuuussk..",".kDuusssDk..","..kkDDDkkck.","......kkcCck",".......kcCck","........kkk."],
digital:["...2ppppp...","..p.....p...",".p..pppp..2.",".p.p....p.2.","p.p..pp..p.2","p.p.p..p.2.2","p.p.p.p..2.2","p.p.p.2.2..2","p...p.2.2.2.",".p.2..2.2.2.",".2...2..2...","..2.2..2...."],
pegada:["......kkk...",".....kwp2k..",".....kp23k..","......kkk...","......k2k...","......kkk...",".kkk........","kwp2k.......","kp23k.......",".kkk........",".k2k........",".kkk........"],
chave:["...kkkkk....","..kLaaaDk...",".kLakkkaDk..",".kak...kDk..",".kaDkkkDDk..","..kDDDDDk...","....kaDk....","....kaDkk...","....kaDaDk..","....kaDkk...","....kaDaDk..","....kkkkk..."],
carta:["............","kkkkkkkkkkkk","kk22222222kk","kpk222222k2k","kppk2222kp2k","kpppkrrkpp2k","kppppRrppp2k","kpppppppp22k","k3pppppp222k","k3333333333k","kkkkkkkkkkkk","............"],
relogio:["...kkkkkk...","..kLaaaaDk..",".kLwppkp2Dk.","kLwpppkpp2Dk","kapppkkpp2Dk","kappppkkrrDk","kapppppp22Dk","kap3pppp22Dk",".kDpp222p2k.",".kDD2222DDk.","..kkDDDDkk..","...kkkkkk..."],
xicara:["...h..h.....","....f..f....","...f..f.....","............","kkkkkkkkk...","kCcCCCCCk...","kwpppppp2kk.","kwpppppp2k.k",".kppppp22kk.","..kkkkkkk...","k3pp222233k.",".kkkkkkkkk.."],
recibo:[".kkkkkkkkkk.",".kwppppppp2k",".kp333333p2k",".kpppppppp2k",".kp3333ppp2k",".kpppppppp2k",".kpppRRRpp2k",".kppRpppRp2k",".kpppRRRpp2k",".kpppppppp2k",".kpkppkppkpk",".k.kk.kk.kk."],
distintivo:["kkkkkkkkkkkk","kLLLLLLLLLak","kLaaaakaaaDk","kLaaakkkaaDk","kLkkkkkkkkDk","kLakkkkkkaDk","kLaakkkkaaDk","kLakkaakkaDk",".kLaaaaaaDk.","..kLaaaaDk..","...kLaaDk...","....kkkk...."],
alerta:[".....kk.....","....kLrk....","....krRk....","...kLwwRk...","...krwwRk...","..kLrwwrRk..","..krrwwrRk..",".kLrrwwrrRk.",".krrrrrrrRk.","kLrrrwwrrrRk","kRRRRRRRRRRk","kkkkkkkkkkkk"]
};
const dshadow=rows=>{const W=Math.max(...rows.map(r=>r.length)),o=rows.map(r=>[...r.padEnd(W,'.')]);for(let y=1;y<rows.length;y++)for(let x=1;x<W;x++){const q=rows[y-1][x-1];if(o[y][x]==='.'&&q&&q!=='.'&&q!=='k')o[y][x]='k';}return o.map(r=>r.join(''));};
ICONS.digital=dshadow(ICONS.digital);
const SYM={'!':["..ss..","..ss..","..ss..","..ss..","......","..ss.."],'?':[".ssss.","s...ss","...ss.","..ss..","......","..ss.."],'v':["......",".....s","....ss","s..ss.","ssss..",".ss..."]};
// alfinete: cabeça redonda 12px com bisel, símbolo, haste de metal e sombra no chão (12×18)
function marker(sym,c,L,D,s){
 const head=["...kkkkkk...","..kLLccccck.",".kLccccccDk.","kLccccccccDk","kLccccccccDk","kLccccccccDk","kLccccccccDk","kLccccccccDk","kcccccccccDk",".kcccccccDDk.".slice(0,12),"..kDDDDDDk..","...kkkkkk..."];
 const o=head.map(r=>[...r]);SYM[sym].forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='s')o[j+3][i+3]='s';}));
 o[2][3]='w';o[3][2]='w';
 const rows=o.map(r=>r.join('')).concat(["....kfhk....",".....fk.....",".....fk.....",".....hk.....","....iiii....","............"]);
 return spr(rows,{c,L,D,s,f:P.fog,h:P.haze,w:P.white,i:P.void});}
const MINI=["...kkkk...","..kHHHhk..","..kBBBBk..","kkHHHHHhkk",".khhhhhhk.",".kSkSSkSk.","..kSSssk..",".kLCWTCck.","kLCCTTCcck","kSCCCkCcSk",".kLCCkCck.",".kPPkPpk..",".kOOkOOk.."];
function mini(o){const H=o.hat||o.hairC;return rimSpr(MINI,{H,h:sh(H),B:o.band||sh(H),S:o.skin,s:sh(o.skin),C:o.coat,c:sh(o.coat),L:LT[o.coat]||o.coat,W:o.shirt,T:o.tie||o.shirt,P:P.deep,p:P.night,O:P.void},'SsO');}

function portrait(o,N){
 const s=N/32,G=new Array(N*N).fill(null);
 const el=(u,v,cx,cy,rx,ry)=>((u-cx)/rx)**2+((v-cy)/ry)**2<=1;
 const inR=(x,y,a,b,c,d)=>{const x0=Math.floor(a*s),y0=Math.floor(b*s);return x>=x0&&x<Math.max(x0+1,Math.floor(c*s))&&y>=y0&&y<Math.max(y0+1,Math.floor(d*s));};
 const sd=(x,y,u,base,cx,e)=>{const d=u-cx;return d>e+.05?sh(base):d>e?(dith(x,y,.5)?sh(base):base):base;};
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const u=(x+.5)/N,v=(y+.5)/N;let c=null;
  if(v>.6&&v<=.8&&Math.abs(u-.5)<.075)c=sh(o.skin);
  if(o.hair==='long'&&el(u,v,.5,.52,.24,.3)&&v>.32&&v<.8)c=o.hairC;
  const sw=.2+(v-.76)*1.3,op=(v-.76)*.5+.04;
  if(v>.76&&Math.abs(u-.5)<Math.min(sw,.47)){c=sd(x,y,u,o.coat,.5,.1);
   if(Math.abs(u-.5)<op)c=o.shirt;
   if(Math.abs(Math.abs(u-.5)-op)<.02)c=sh(o.coat);
   if(o.tie&&v>.8&&Math.abs(u-.5)<.03+(v-.8)*.12)c=o.tie;}
  if(el(u,v,.5,.47,.165,.2))c=sd(x,y,u,o.skin,.5,.07);
  if(el(u,v,.335,.5,.03,.045))c=o.skin;if(el(u,v,.665,.5,.03,.045))c=sh(o.skin);
  if(o.hair!=='bald'&&el(u,v,.5,.39,.18,.14)&&v<.36+(Math.abs(u-.5)>.13?.09:0))c=o.hairC;
  if(o.hair==='bun'&&el(u,v,.5,.21,.085,.075))c=o.hairC;
  if(o.hair==='bald'&&el(u,v,.5,.43,.178,.12)&&Math.abs(u-.5)>.13&&v<.49)c=o.hairC;
  if(inR(x,y,12,13,15,14)||inR(x,y,17,13,20,14))c=o.brow||P.void;
  if(inR(x,y,13,15,15,16)||inR(x,y,17,15,19,16))c=P.void;
  if(inR(x,y,16,16,17,18))c=sh(o.skin);
  if(inR(x,y,14,19,18,20))c=o.mouth||sh(sh(o.skin));
  if(o.stache&&inR(x,y,13,18,19,19))c=o.hairC;
  if(o.glasses&&((inR(x,y,12,14,16,17)&&!inR(x,y,13,15,15,16))||(inR(x,y,16,14,20,17)&&!inR(x,y,17,15,19,16))))c=o.glassC||P.void;
  if(o.earring&&inR(x,y,10,18,11,19))c=P.amber;
  if(o.hat){if(el(u,v,.5,.3,.31,.045))c=sd(x,y,u,o.hat,.5,.14);
   if(u>.33&&u<.67&&v>.12&&v<.3&&!(v<.16&&Math.abs(u-.5)>.13))c=sd(x,y,u,o.hat,.5,.08);
   if(u>.33&&u<.67&&v>.25&&v<.29)c=o.band||P.void;}
  G[y*N+x]=c;}
 const z=cv(N,N);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;let c=G[i];
  if(c){if(c===o.skin&&x>0&&!G[i-1])c=P.amberL;z.r(c,x,y);continue;}
  const nb=(x>0&&G[i-1])||(x<N-1&&G[i+1])||(y>0&&G[i-N])||(y<N-1&&G[i+N]);
  if(nb){z.r(P.void,x,y);continue;}
  if(o.bg===false)continue;
  const u=(x+.5)/N,v=(y+.5)/N;let b=o.bgC||P.night;
  if(v>.55&&dith(x,y,(v-.55)*1.6))b=sh(b);
  const d=Math.hypot(u-.12,v-.14);if(d<.32&&dith(x,y,(1-d/.32)*.4))b=o.glow||P.slate;
  z.r(b,x,y);}
 return z.url();}

const CH={
 irene:{skin:P.skin1,hair:'long',hairC:P.cork2,coat:P.redD,shirt:P.paper,earring:1,mouth:P.red},
 caio:{skin:P.skin2,hair:'short',hairC:P.void,coat:P.slate,shirt:P.paper,tie:P.red,stache:1,glasses:1},
 lucia:{skin:P.skin3,hair:'bun',hairC:P.fog,brow:P.haze,coat:P.dusk,shirt:P.white,mouth:P.redD},
 rui:{skin:P.skin2,hair:'short',hairC:P.void,hat:P.ink,band:P.red,coat:P.deep,shirt:P.paper2,tie:P.amber},
 otavio:{skin:P.skin1,hair:'bald',hairC:P.fog,brow:P.haze,glasses:1,stache:1,coat:P.paper3,shirt:P.paper,tie:P.redD},
 vega:{skin:P.skin2,hair:'long',hairC:P.void,hat:P.slate,band:P.amber,coat:P.paper3,shirt:P.paper2,mouth:P.redD},
 ana:{skin:P.skin1,hair:'short',hairC:P.amberD,glasses:1,coat:P.teal,shirt:P.paper},
 caju:{skin:P.skin3,hair:'short',hairC:P.void,hat:P.cork,band:P.void,coat:P.cork2,shirt:P.paper,tie:P.red},
 nevoeiro:{skin:P.skin1,hair:'short',hairC:P.fog,brow:P.haze,hat:P.haze,coat:P.haze,shirt:P.white},
 moreira:{skin:P.skin2,hair:'short',hairC:P.void,stache:1,hat:P.void,band:P.slate,coat:P.slate,shirt:P.paper,tie:P.void}
};

function stamp(z,rows,x,y,map){map=Object.assign({},K,map||{});rows.forEach((row,j)=>{[...row].forEach((ch,i)=>{if(ch!=='.'&&map[ch])z.r(map[ch],x+i,y+j);});});}
const mirror=rows=>rows.map(r=>[...r].reverse().join(''));
const CAR_R=["..kkkkk...",".kChhhCk..","kCCCCCCCkL","kCCCCCCCCL","Rkkkkkkkk.",".kk....kk."];
const CAR_D=[".kkkk.","kCCCCk","kChhCk","kCCCCk","kCCCCk","kChhCk","kCCCCk","LkkkkL"];
function city(){
 const W=256,H=208,z=cv(W,H),r=z.r,R=rng(17);
 const HR=[[44,8],[92,10],[148,8]],VR=[[60,8],[128,8],[196,8]],QY=169,WY=172;
 const inV=x=>VR.some(([vx,vw])=>x>vx-6&&x<vx+vw+6),inH=y=>HR.some(([hy,hh])=>y>hy-6&&y<hy+hh+6);
 for(let y=0;y<QY;y++)for(let x=0;x<W;x++)r(dith(x,y,.22)?P.deep:P.slate,x,y);
 HR.forEach(([y,h])=>{r(P.dusk,0,y-1,W,1);r(P.dusk,0,y+h,W,1);});
 VR.forEach(([x,w])=>{r(P.dusk,x-1,0,1,156);r(P.dusk,x+w,0,1,156);});
 const road=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)r(dith(xx,yy,.18)?P.ink:P.night,xx,yy);};
 HR.forEach(([y,h])=>road(0,y,W,h));VR.forEach(([x,w])=>road(x,0,w,156));
 HR.forEach(([y,h])=>{for(let x=0;x<W;x+=8)if(!inV(x)&&!inV(x+4)){if(h===10){r(P.amberD,x,y+4,5,1);r(P.amberD,x,y+5,5,1);}else r(P.amberD,x,y+(h>>1),4,1);}});
 VR.forEach(([x,w])=>{for(let y=0;y<156;y+=8)if(!inH(y)&&!inH(y+4))r(P.amberD,x+(w>>1),y,1,4);});
 VR.forEach(([vx,vw])=>HR.forEach(([hy,hh])=>{for(let i=0;i<hh;i+=2){r(P.haze,vx-6,hy+i,4,1);r(P.haze,vx+vw+2,hy+i,4,1);}if(hy<148)for(let i=0;i<vw;i+=2){r(P.haze,vx+i,hy-6,1,4);r(P.haze,vx+i,hy+hh+2,1,4);}}));
 r(P.paper3,0,QY,W,1);r(P.dusk,0,QY+1,W,2);for(let x=0;x<W;x+=4)r(P.slate,x+((x>>2)%2?2:0),QY+1,1,2);
 for(let y=WY;y<H;y++)for(let x=0;x<W;x++)r(dith(x,y,.35)?P.night:P.ink,x,y);
 r(P.void,0,WY,W,1);
 for(let k=0;k<170;k++){const x=R()*W|0,y=WY+3+(R()*(H-WY-3)|0);r(k%4?P.deep:P.dusk,x,y,2+(R()*3|0),1);}
 const lamps=[];
 HR.forEach(([y,h])=>{for(let x=14;x<W;x+=32){if(inV(x))continue;lamps.push([x,y-2]);if(y<148&&!inV(x+16))lamps.push([x+16,y+h+2]);}});
 VR.forEach(([x,w])=>{for(let y=22;y<148;y+=48){if(inH(y))continue;lamps.push([x-2,y]);if(!inH(y+24))lamps.push([x+w+1,y+24]);}});
 const prom=[];for(let x=6;x<W;x+=18){if(x>116&&x<148)continue;prom.push([x,166]);}
 const park=[[10,10],[48,32],[14,36]];
 [...lamps,...prom,...park].forEach(([lx,ly])=>{for(let y=ly-9;y<=ly+9;y++)for(let x=lx-9;x<=lx+9;x++){if(y>=QY)continue;const d=Math.hypot(x-lx,(y-ly)*1.2);if(d<9&&dith(x,y,(1-d/9)*.4))r(d<3?P.amber:d<6?P.amberD:P.cork2,x,y);}});
 // park
 for(let y=0;y<41;y++)for(let x=0;x<57;x++)r(dith(x,y,.3)?P.leaf:P.moss,x,y);
 r(P.paper3,0,20,57,3);r(P.paper3,27,0,3,41);r(P.cork2,0,23,57,1);r(P.cork2,30,0,1,41);
 circ(z,28,21,8,P.paper3);circ(z,28,21,7,P.paper2);circ(z,28,21,4.5,P.dusk);circ(z,28,21,3.5,P.teal);r(P.white,28,20,1,1);r(P.white,27,22,1,1);circ(z,29,22,1.4,P.fog);
 [[34,16],[20,27],[36,27]].forEach(([x,y])=>{r(P.cork,x,y,4,1);r(P.void,x,y+1,4,1);});
 r(P.void,0,40,57,1);for(let x=0;x<57;x+=3)r(P.haze,x,39,1,2);
 const tree=(x,y,au)=>{circ(z,x+2,y+2,3.6,P.void);circ(z,x,y,3.6,P.void);circ(z,x,y,3,au?P.amberD:P.moss);circ(z,x-1,y-1,1.8,au?P.amber:P.leaf);r(au?P.amberL:P.teal,x-2,y-2,1,1);r(sh(au?P.amberD:P.moss),x+1,y+2,2,1);};
 [[5,5],[13,4],[44,5],[52,11],[6,14],[50,30],[42,36],[8,33],[20,11],[38,12],[18,35],[52,20]].forEach(([x,y],i)=>tree(x,y,i%3===0));
 // gardens vila neblina
 for(let y=55;y<89;y++)for(let x=207;x<256;x++)r(dith(x,y,.3)?P.leaf:P.moss,x,y);
 r(P.paper3,229,57,3,32);
 // market floor
 for(let y=105;y<145;y++)for(let x=71;x<125;x++)r(dith(x,y,.25)?P.cork2:P.paper3,x,y);
 // piers, boats, bridge
 [18,50,88].forEach((px,i)=>{r(P.void,px+6,WY,1,24);for(let y=QY;y<WY+24;y++)r((y%2)?P.cork:P.cork2,px,y,6,1);r(P.void,px,WY+24,6,1);for(let y=WY+4;y<WY+24;y+=6){r(P.void,px-1,y,1,2);r(P.void,px+6,y,1,2);}
  if(i<2){const bx=px+9,by=WY+8+i*6;r(P.void,bx-1,by-1,12+i*4,6);r(i?P.redD:P.paper2,bx,by,10+i*4,4);r(P.cork2,bx+1,by+1,8+i*4,2);if(i){r(P.paper3,bx+4,by-2,6,3);r(P.amber,bx+5,by-1,1,1);r(P.amber,bx+7,by-1,1,1);}r(P.amberL,bx+2,by,1,1);}});
 r(P.void,141,156,3,H-156);r(P.dusk,123,156,1,H-156);r(P.dusk,140,156,1,H-156);road(124,156,16,H-156);
 for(let y=158;y<H;y+=8)r(P.amberD,131,y,1,4);
 for(let y=160;y<H;y+=10){r(P.void,122,y,2,2);r(P.void,140,y,2,2);}
 [180,198].forEach(ty=>{r(P.void,119,ty-3,27,10);r(P.slate,120,ty-2,24,8);r(P.dusk,120,ty-2,24,1);r(P.void,126,ty+1,12,5);r(P.haze,120,ty-4,3,3);r(P.haze,141,ty-4,3,3);r(P.amberL,121,ty-5,1,1);r(P.amberL,142,ty-5,1,1);r(P.amber,122,ty,2,2);r(P.amber,140,ty,2,2);r(P.void,144,ty,3,8);});
 const tx=160,ty=188;r(P.void,tx-1,ty-1,22,8);r(P.redD,tx,ty,20,6);r(P.void,tx,ty+5,20,1);r(P.cork2,tx+2,ty+1,16,3);r(P.paper2,tx+8,ty-3,8,5);r(P.paper3,tx+8,ty+1,8,1);r(P.amber,tx+9,ty-2,2,1);r(P.amber,tx+13,ty-2,2,1);r(P.void,tx+11,ty-6,2,3);r(P.amberL,tx+19,ty+1,1,1);
 for(let k=0;k<8;k++)r(P.haze,tx-3-k*3,ty+2+(k%2),2,1);
 // buildings
 const WALLS=[P.cork2,P.redD,P.slate,P.deep,P.paper3],ROOFS=[P.slate,P.dusk,P.deep,P.cork2,P.haze];
 const bld=(x,y,w,h,o={})=>{const fh=o.fh||Math.max(9,Math.min(16,Math.round(h*.42))),ry=y+h-fh,wc=o.wall||WALLS[R()*WALLS.length|0],rc=o.roof||ROOFS[R()*ROOFS.length|0],type=o.type||(R()<.45?'gable':'flat');
  r(P.void,x+w,y+2,2,h-1);r(P.void,x,y+h,w+2,1);
  if(type==='gable'){const mid=y+((ry-y)>>1);for(let yy=y;yy<ry;yy++){const c=yy<mid?sh(rc):rc;r(c,x,yy,w,1);if((yy-y)%2)for(let xx=x+((yy>>1)&1);xx<x+w;xx+=2)r(sh(c),xx,yy);}
   r(LT[rc]||P.fog,x,mid,w,1);r(P.void,x,y,w,1);r(P.void,x,y,1,ry-y);r(P.void,x+w-1,y,1,ry-y);
   if(w>10&&R()<.8){const cx=x+3+(R()*(w-8)|0);r(P.void,cx-1,y-1,4,4);r(P.redD,cx,y,2,3);r(P.ink,cx,y,2,1);}}
  else{r(rc,x,y,w,ry-y);r(LT[rc]||rc,x,y,w,1);r(LT[rc]||rc,x,y,1,ry-y);r(sh(rc),x+w-1,y,1,ry-y);if(w>8&&ry-y>6){r(sh(rc),x+1,y+1,w-2,1);r(sh(rc),x+1,y+1,1,ry-y-2);}
   const n=Math.max(1,Math.floor(w*(ry-y)/90));for(let k=0;k<n;k++){const t=R(),px=x+3+(R()*Math.max(1,w-7)|0),py=y+3+(R()*Math.max(1,ry-y-6)|0);
    if(t<.35){r(P.fog,px,py,3,2);r(P.haze,px,py+1,3,1);r(P.void,px,py+2,3,1);}else if(t<.6){r(P.amber,px,py,2,2);r(P.amberL,px,py,1,1);}else if(t<.8){circ(z,px+1.5,py+1.5,1.8,P.void);circ(z,px+1.5,py+1,1.5,P.paper3);r(P.paper2,px+1,py,1,1);}else{r(P.void,px,py,1,2);r(P.haze,px,py,1,1);}}}
  const trim=wc===P.paper3?P.paper2:wc===P.slate||wc===P.deep?P.haze:P.paper3;
  for(let yy=ry;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)r(((yy-ry)%3===2&&dith(xx,yy,.5))?sh(wc):wc,xx,yy);
  r(trim,x,ry,w,1);r(sh(wc),x,ry+1,w,1);r(sh(sh(wc)),x+w-1,ry,1,fh);
  const wl=o.wl||[[P.amber,P.amberL]],lit=o.lit??.55;
  for(let wy=ry+3;wy+2<=y+h-6;wy+=4)for(let wx=x+2;wx+2<=x+w-2;wx+=4){if(R()<lit){const c=wl[R()*wl.length|0];r(c[0],wx,wy,2,2);r(c[1],wx,wy,1,1);}else{r(P.ink,wx,wy,2,2);r(P.dusk,wx,wy,1,1);}r(sh(wc),wx,wy+2,2,1);}
  const dx=x+(w>>1)-1;r(P.void,dx-1,y+h-5,5,5);r(o.door||(R()<.6?P.amber:P.deep),dx,y+h-4,3,4);r(P.amberL,dx+1,y+h-4,1,1);
  if(w>14&&R()<.7){r(P.amberD,x+2,y+h-4,dx-x-4,2);r(P.amber,x+2,y+h-4,1,1);}
  return{x,y,w,h,ry};};
 bld(0,55,18,34,{type:'gable'});bld(19,55,19,34,{type:'gable'});bld(39,55,18,34,{type:'flat'});
 bld(71,0,19,41,{type:'gable'});
 const cine=bld(91,0,34,41,{fh:15,wall:P.deep,roof:P.dusk,type:'flat',lit:.2});
 for(let x=92;x<124;x++){r(x%2?P.amberL:P.amber,x,cine.ry+9,1,1);r(x%2?P.amber:P.amberL,x,cine.ry+11,1,1);}r(P.paper,93,cine.ry+10,30,1);r(P.red,94,cine.ry+12,4,2);r(P.teal,118,cine.ry+12,4,2);
 const glass=[[P.fog,P.white],[P.haze,P.fog],[P.amber,P.amberL]];
 bld(139,0,25,41,{fh:18,wall:P.slate,roof:P.dusk,type:'flat',wl:glass,lit:.6});bld(166,0,27,41,{fh:16,wall:P.deep,roof:P.slate,type:'flat',wl:glass,lit:.5});
 bld(207,0,16,41,{type:'gable'});bld(224,0,16,41,{type:'gable'});bld(241,0,15,41,{type:'gable'});
 const ho=bld(73,55,50,34,{fh:18,wall:P.redD,roof:P.slate,type:'flat',lit:.72});
 for(let x=92;x<104;x++)r(((x-92)>>1)%2?P.red:P.paper,x,ho.y+ho.h-7,1,3);r(P.void,92,ho.y+ho.h-4,12,1);
 bld(139,55,29,34,{fh:14,wall:P.paper3,roof:P.cork2,type:'gable'});bld(170,55,23,34,{fh:12,wall:P.deep,roof:P.slate,type:'flat',door:P.teal,wl:[[P.teal,P.white],[P.amber,P.amberL]]});
 bld(209,58,20,22,{fh:9,type:'gable',roof:P.redD,wall:P.paper3});bld(233,58,22,22,{fh:9,type:'gable',roof:P.slate,wall:P.cork2});
 [[212,85],[224,84],[240,85],[252,84]].forEach(([x,y],i)=>tree(x,y,i%2===1));
 [[0,105],[0,126]].forEach(([x,y])=>{const w=57,h=18,ry=y+11;r(P.void,x+w,y+2,2,h);r(P.void,x,y+h,w+2,1);for(let yy=y;yy<ry;yy++)for(let xx=x;xx<x+w;xx++)r(xx%2?P.slate:P.dusk,xx,yy);r(P.haze,x,y,w,1);
  for(let yy=ry;yy<y+h;yy++)r(P.cork2,x,yy,w,1);r(P.paper3,x,ry,w,1);[8,26,44].forEach(dx=>{r(P.void,x+dx,ry+2,8,5);r(P.haze,x+dx,ry+2,8,1);for(let k=1;k<8;k+=2)r(P.ink,x+dx+k,ry+3,1,4);});r(P.amber,x+5,ry+3,1,1);r(P.amber,x+22,ry+3,1,1);});
 const cols=[[P.red,P.paper],[P.teal,P.paper],[P.amber,P.paper],[P.redD,P.paper2]];
 [108,121,134].forEach((sy,j)=>[73,86,99,112].forEach((sx,i)=>{const [c1,c2]=cols[(i+j)%4];r(P.void,sx+10,sy+1,1,7);r(P.cork2,sx,sy+4,10,3);r(P.void,sx,sy+7,10,1);for(let k=0;k<10;k++)r(k%2?c1:c2,sx+k,sy,1,4);r(sh(c1),sx,sy+3,10,1);
  for(let k=0;k<4;k++)r([P.red,P.amber,P.leaf,P.amberL][(k+i)%4],sx+1+k*2,sy+4,1,1);}));
 for(let x=72;x<124;x++)if(x%3===0)r(x%6?P.amberL:P.amber,x,106+((x>>2)%2),1,1);
 [[74,142],[120,141],[88,143]].forEach(([x,y])=>{r(P.void,x,y,4,3);r(P.cork,x,y,3,2);});
 bld(139,105,36,40,{fh:14,wall:P.slate,roof:P.deep,type:'flat',lit:.8,wl:[[P.amber,P.amberL],[P.fog,P.white]]});r(P.haze,152,145,10,2);
 bld(177,105,16,40,{type:'gable'});bld(207,105,24,40,{type:'flat'});bld(232,105,24,40,{type:'gable'});
 for(let x=20;x<116;x+=14){r(P.void,x,160,4,4);r(P.cork,x,160,3,3);r(P.cork2,x+1,161,1,1);}
 for(let x=4;x<W;x+=9)if(x<118||x>146)r(P.void,x,QY-1,1,1);
 // cars
 const car=(rows,x,y,c,extra)=>stamp(z,rows,x,y,Object.assign({C:c,h:P.haze,L:P.amberL,R:P.red},extra||{}));
 const beamR=(x,y)=>{for(let i=0;i<9;i++)for(let j=-1-(i>>2);j<=1+(i>>2);j++)if(dith(x+i,y+j,.45-i*.04))r(P.amberD,x+i,y+j);};
 const beamL=(x,y)=>{for(let i=0;i<9;i++)for(let j=-1-(i>>2);j<=1+(i>>2);j++)if(dith(x-i,y+j,.45-i*.04))r(P.amberD,x-i,y+j);};
 beamR(30,99);car(CAR_R,20,96,P.paper3);beamR(190,99);car(CAR_R,180,96,P.red);
 beamL(211,95);car(mirror(CAR_R),212,93,P.teal);
 car(mirror(CAR_R),104,93,P.ink,{h:P.haze});r(P.red,108,93,1,1);r(P.teal,109,93,1,1);
 beamR(40,48);car(CAR_R,30,45,P.cork);
 car(CAR_D,197,58,P.amber);for(let i=0;i<7;i++)for(let j=-1;j<=6;j++)if(dith(197+j,66+i,.4-i*.05))r(P.amberD,197+j,66+i);
 car(CAR_R,150,149,P.ink);r(P.red,154,149,1,1);r(P.teal,155,149,1,1);beamR(240,152);car(CAR_R,230,149,P.paper3);
 // lamp posts
 [...lamps,...prom,...park].forEach(([lx,ly])=>{r(P.void,lx,ly-4,1,5);r(P.void,lx-1,ly,3,1);r(P.amber,lx,ly-5,1,1);r(P.amberL,lx,ly-6,1,1);});
 // water reflections
 const refl=[...prom.map(([x])=>x),121,142];refl.forEach(lx=>{for(let yy=WY+1;yy<WY+16;yy++)if(R()<1-(yy-WY)/16)r(yy<WY+6?P.amber:P.amberD,lx-1+(R()*3|0),yy,1+(R()*2|0),1);});
 for(let y=WY+2;y<H;y+=2)if(R()<.7)r(P.amberD,tx+9+(R()*6|0),y+8>H?y:y+8,1,1);
 for(let x=86;x<112;x++)r((x>>1)%2?P.amber:P.void,x,90,1,1);
 return z.url();}
const CHAR={
det:["................","......kkkk......",".....kGHHHk.....","....kGHHHHHk....","....kBBBBBBk....","..kkGHHHHHHhkk..",".kGGGHHHHHhhhhk.","..kkkkkkkkkkkk..","...kxxxxxxxxk...","...kSkSSSkSxk...","...kSSSSSxxxk...","....kSSSxxxk....","...kkkkxxkkkk...","..kLLkWTTWkcck..",".kLlCCkTTkCCcck.",".kLlCCCkkCCCcck.",".kLlCCCoCCCCcck.",".kYYYYYYYYYYYYk.",".kLlCCCoCCCCcck.","kSklCCCCkCCCckSk","..klCCCCkCCCck..","..kkkPPkkPPpkk..","....kPPk.kPpk...","...kOOfk.kOOfk.."],
pol:["................","................","......kkkk......",".....kUUUUk.....","....kUUaaUUk....","....kGUUUUUk....","...kkkkkkkkkk...","...kiiiiiiiik...","...kxxxxxxxxk...","...kSkSSSkSxk...","...kSSSSSxxxk...","....kSSSxxxk....","...kkkkxxkkkk...","..kUUUkWWkUUuk..",".kGUUUUkkUaUuuk.",".kGUUUUoUUUUuuk.",".kGUUUUoUUUUuuk.","kSkkkkkakkkkkkSk","..kPPPPkPPPppk..","..kPPPPkPPPppk..","..kPPPPkPPppk...","...kPPPkPPpk....","...kPPk.kPpk....","..kOOfk.kOOfk..."],
ban:["................","......kkkk......",".....kRRRRk.....","....kRRRRRRrk...","...kRRkkkkkRrk..","...kRkSSSSSkrk..","...kRkSkSkSkrk..","...kRkiiiiikrk..","....kRkiiikrk...","...kRRkkkkkRrk..","..kRRRwRRwRRRrk.",".kRRRRwRRwRRRrrk",".kRRRRRRRRRRRrrk",".kRRkkkkkkkkRrrk",".kRRkRRRRRRkRrrk",".kSRkkkkkkkkRrSk",".kkRRRRRRRRRRrkk","...kJJJJkJJJjk..","...kJJJJkJJJjk..","...kJJJkkJJjjk..","....kJJk.kJjk...","....kJJk.kJjk...","...kwwwk.kwwwk..","...kkkkk.kkkkk.."],
civ:["................","................",".....kkkkkk.....","....kHHGHHHk....","...kHGHHHHHhk...","...kHHHHHHhhk...","...kHxSSSSHhk...","...kSSSSSSSxk...","...kSkSSSkSxk...","...kSSSSSxxxk...","....kSSSSxxk....",".....kSxxk......","...kkkkxxkkkk...","..kLCkWTTWkCck..",".kLCCCkTTkCCcck.",".kLCCCCkkCCCcck.",".kLCCCCoCCCCcck.",".kLCCCCkCCCCcck.","kSkCCCCoCCCCckSk","..kkkkkkkkkkkk..","...kPPPkPPPpk...","...kPPPkPPppk...","...kPPk.kPpk....","..kOOfk.kOOfk..."]
};
const walk=rows=>rows.slice(0,-2).concat(["...kPPk..kPpk...","..kOOfk...kOOfk."]);
const lupa=rows=>{const a=rows.slice();a[16]=".kLlCCCoCCCCkkk.";a[17]=".kYYYYYYYYYYkwfk";a[18]=".kLlCCCoCCCSkffk";a[19]="kSklCCCCkCCCck..";return a;};
function charSpr(kind,o,pose){let rows=CHAR[kind];if(pose==='walk')rows=walk(rows);if(pose==='lupa')rows=lupa(rows);
 const S=o.skin,base={S,x:sh(S),s:sh(S),O:P.void,f:P.haze,i:P.ink,W:o.shirt||P.paper,T:o.tie||P.red};let m;
 if(kind==='pol')m={U:P.slate,u:P.deep,G:P.dusk,a:P.amber,P:P.slate,p:P.deep,o:P.amberD};
 else if(kind==='ban'){const R=o.coat||P.red;m={R,r:sh(R),w:P.paper,J:P.dusk,j:P.slate};}
 else{const H=o.hat||o.hairC,C=o.coat||P.slate,l=LT[C]||({[P.paper3]:P.paper2,[P.teal]:P.white})[C]||C;m={H,h:sh(H),G:LT[H]||H,B:o.band||P.void,C,c:sh(C),l,L:LT[l]||({[P.paper2]:P.paper})[l]||l,Y:sh(sh(C)),P:o.pants||P.deep,p:sh(o.pants||P.deep),o:kind==='civ'?P.void:sh(sh(C))};}
 return rimSpr(rows,Object.assign(base,m),'SxsOwf');}
function scene(){
 const W=160,H=96,z=cv(W,H),r=z.r,R=rng(5);
 r(P.deep,0,0,W,70);
 for(let x=0;x<W;x+=8){r(P.night,x,0,1,70);for(let y=3;y<70;y+=6)r(P.slate,x+4,y,1,1);}
 for(let y=0;y<70;y++)for(let x=0;x<84;x++){const d=Math.hypot((x-31)*.9,y-40);if(d<30&&dith(x,y,(1-d/30)*.6))r(d<13?P.amberD:P.cork2,x,y);}
 r(P.void,3,12,18,22);r(P.cork,4,13,16,20);r(P.night,6,15,12,16);r(P.dusk,6,25,12,6);r(P.amberL,14,18,1,1);
 circ(z,76,24,8.5,P.void);circ(z,76,24,7.5,P.paper3);circ(z,76,24,6.5,P.paper);
 [[76,18],[76,30],[70,24],[82,24]].forEach(([x,y])=>r(P.void,x,y));
 line(z,76,24,72,21,P.void);line(z,76,24,81,25,P.void);r(P.red,76,24);
 r(P.void,90,3,64,1);
 r(P.void,100,8,44,46);r(P.paper3,101,9,42,44);r(P.night,103,11,38,40);
 [[103,34,7],[110,28,8],[118,38,6],[124,24,9],[133,32,8]].forEach(([x,y,w])=>{r(P.ink,x,y,w,51-y);for(let yy=y+2;yy<50;yy+=3)for(let xx=x+1;xx<x+w-1;xx+=2)if(R()<.25)r(P.amber,xx,yy);});
 circ(z,134,17,3,P.amberL);circ(z,135.5,16,2.4,P.night);
 r(P.teal,112,19,1,8);r(P.teal,113,19,1,1);r(P.teal,113,26,1,1);
 for(let k=0;k<60;k++){const x=103+Math.floor(R()*38),y=11+Math.floor(R()*38);r(P.haze,x,y,1,2);}
 r(P.paper3,121,11,2,40);r(P.paper3,103,30,38,2);
 r(P.paper2,97,53,50,2);r(P.void,97,55,50,1);
 r(P.redD,92,4,8,58);r(P.redD,144,4,8,58);for(let i=0;i<4;i++){r(P.deep,93+i*2,4,1,58);r(P.deep,145+i*2,4,1,58);}
 r(P.void,0,70,W,1);r(P.cork2,0,71,W,2);r(P.redD,0,73,W,23);
 for(let y=75;y<H;y+=5)for(let x=((y/5)%2?0:3);x<W;x+=6)r(P.deep,x,y,2,1);
 for(let y=73;y<H;y++){const t=(y-73)/22,xa=Math.floor(100-t*30),xb=Math.floor(144-t*30);for(let x=xa;x<xb;x++)if(dith(x,y,.3))r(P.dusk,x,y);}
 r(P.void,11,49,50,1);r(P.cork,12,50,48,3);r(P.cork2,14,53,44,18);r(P.void,14,53,44,1);r(P.void,17,58,18,1);r(P.void,17,64,18,1);r(P.amberD,25,60,2,1);r(P.amberD,25,66,2,1);r(P.void,57,53,1,18);
 r(P.void,25,47,10,2);r(P.void,29,40,2,7);for(let i=0;i<6;i++)r(P.amberD,27-i,34+i,6+2*i,1);r(P.amber,23,39,14,1);r(P.amberL,29,40,2,1);
 r(P.paper,38,47,11,3);r(P.paper2,40,46,9,1);r(P.paper3,39,48,7,1);
 r(P.paper,50,86,7,4);r(P.paper3,51,87,5,1);r(P.paper2,140,90,6,3);
 r(P.cork2,118,76,14,3);r(P.void,118,79,14,1);r(P.cork2,130,66,3,12);r(P.void,133,66,1,12);line(z,120,79,115,83,P.cork2);line(z,128,79,124,85,P.cork2);
 const C=P.white;ring(z,70,83,3.3,C);r(C,74,80,24,1);r(C,74,88,24,1);r(C,98,80,1,9);
 line(z,78,80,82,75,C);line(z,82,75,87,76,C);line(z,80,88,76,93,C);line(z,98,82,108,79,C);line(z,98,86,108,90,C);r(C,108,78,2,2);r(C,108,90,2,2);
 r(P.cork2,101,91,8,2);r(P.paper,104,89,2,2);r(P.paper,110,90,1,1);r(P.paper,100,93,1,1);
 for(let k=0;k<6;k++){const fx=139-k*6,fy=77+(k%2)*3;r(P.haze,fx,fy,2,1);r(P.haze,fx,fy+1,1,1);}
 return z.url();}

function cork(w,h){const z=cv(w,h),R=rng(21);z.r(P.cork,0,0,w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const t=R();if(t<.16)z.r(P.cork2,x,y);else if(t<.2)z.r(P.paper3,x,y);else if(t<.22)z.r(P.amberD,x,y);}return z.url();}
function cone(w,h,col){const z=cv(w,h);for(let y=0;y<h;y++){const t=y/h,half=(.14+t*.36)*w;for(let x=0;x<w;x++){if(Math.abs(x-w/2)<half&&dith(x,y,.42-t*.34))z.r(col||P.amberD,x,y);}}return z.url();}
function wear(w,h){const z=cv(w,h),R=rng(9);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(R()<.13)z.r(P.paper,x,y);return z.url();}
function dither(w,h,a,b,t){const z=cv(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)z.r(dith(x,y,t)?b:a,x,y);return z.url();}
function strings(W,H,segs){const z=cv(W,H);segs.forEach(([a,b,c,d])=>line(z,a,b+1,c,d+1,P.redD));segs.forEach(([a,b,c,d])=>line(z,a,b,c,d,P.red));return z.url();}
function rain(cn,W,H,n){if(!cn)return()=>{};cn.width=W;cn.height=H;const g=cn.getContext('2d'),R=rng(3);const ds=Array.from({length:n},()=>({x:R()*W,y:R()*H,s:1+R()*1.5}));let raf,f=0;
 const tick=()=>{raf=requestAnimationFrame(tick);if((f++)%3)return;g.clearRect(0,0,W,H);ds.forEach(d=>{d.y+=d.s*2;d.x-=d.s*.6;if(d.y>H){d.y=-3;d.x=R()*W*1.2;}if(d.x<0)d.x+=W;const x=d.x|0,y=d.y|0;g.fillStyle=P.fog;g.fillRect(x,y,1,2);g.fillStyle=P.haze;g.fillRect(x+1,y-1,1,1);});};
 tick();return()=>cancelAnimationFrame(raf);}


function live(cn,o){
 if(!cn)return()=>{};o=o||{};const M=o.map||window.MAPA_GAROA;
 if(!M){let s,dead=false;const t=setInterval(()=>{if(window.MAPA_GAROA){clearInterval(t);if(!dead)s=live(cn,o);}},50);return()=>{dead=true;clearInterval(t);s&&s();};}
 const LY=n=>M.layers.find(l=>l.name===n)||{},OBJ=(LY('objetos').objects||[]),RT=LY('rotas').objects||{};
 const W=1536,H=1024;cn.width=W;cn.height=H;let g=cn.getContext('2d');g.imageSmoothingEnabled=false;const R=rng(42);
 const oc=document.createElement('canvas');oc.width=160;oc.height=100;const og=oc.getContext('2d');og.imageSmoothingEnabled=false;
 const faded=(a,x,y,fn)=>{if(a<=0)return;if(a>=.99){fn();return;}const G=g;og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,160,100);og.setTransform(1,0,0,1,60-(x|0),40-(y|0));g=og;fn();g=G;G.globalAlpha=a;G.drawImage(oc,(x|0)-60,(y|0)-40);G.globalAlpha=1;};
 const edge=(v,a,b,inA,inB)=>Math.max(0,Math.min(1,inA?(v-(a-30))/30:1,inB?((b+30)-v)/30:1));
 const host=cn.parentElement;let wins=[],water=[];
 const img=new Image();img.onload=()=>{try{const t=document.createElement('canvas');t.width=W;t.height=H;const tg=t.getContext('2d');tg.drawImage(img,0,0,W,H);const d=tg.getImageData(0,0,W,H).data;const seen={};
  const br=(x,y)=>{const i=(y*W+x)*4;return d[i]>215&&d[i+1]>150&&d[i+2]<120;};
  for(let y=6;y<H-6;y+=3)for(let x=6;x<W-6;x+=3){const i=(y*W+x)*4,r=d[i],gg=d[i+1],b=d[i+2];
   if(br(x,y)){if(br(x-6,y)&&br(x+6,y))continue;const k=(x>>3)+'_'+(y>>3);if(!seen[k]){seen[k]=1;if(R()<.35)wins.push({x:x-2,y:y-2,off:R()<.12,t:R()*8});}}
   else if(b>60&&b>r+35&&b>gg+8&&r<80&&(y>870||(x>1390&&y<600&&y>150))&&R()<.06)water.push([x,y,R()*6.28]);}
 }catch(e){}};img.src=o.src;
 const lanes=RT.carros||[],vl=RT.carrosV||[];
 const CC=[P.red,P.paper3,P.teal,P.paper2,P.dusk,P.amber,P.night,P.redD,P.fog];
 const cars=lanes.flatMap(l=>Array.from({length:l.n},(_,i)=>({l,p:(i+R()*.6)/l.n,v:30+R()*26,c:CC[R()*CC.length|0],pol:R()<.14})));
 const vcars=vl.map(l=>({l,p:R(),v:26,c:CC[R()*CC.length|0]}));
 const walks=RT.pedestres||[];
 const PC=[P.cork,P.paper3,P.slate,P.redD,P.moss,P.cork2,P.dusk],HC=[P.void,P.cork2,P.ink,P.slate];
 const peds=Array.from({length:18},(_,i)=>({w:walks[i%walks.length],p:R(),v:(8+R()*8),d:R()<.5?1:-1,c:PC[R()*PC.length|0],h:HC[R()*HC.length|0],s:[P.skin1,P.skin2,P.skin3][R()*3|0]}));
 const drops=Array.from({length:240},()=>({x:R()*W,y:R()*H,e:R()*H,v:380+R()*160,sp:0}));
 const smoke=[],emit=[[1288,648],[1330,636],[1456,652]];let emT=0;
 const BT=RT.barco||{y:918,x0:-80,x1:1120,v:18},boat={x:BT.x0,y:BT.y,v:BT.v};
 const flick=[...host.querySelectorAll('[data-flicker]')].map(el=>({el,t:1+R()*6,f:0}));
 const bobs=[...host.querySelectorAll('[data-bob]')];
 const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w,h);};
 const carH=(x,y,d,c,pol,t)=>{x|=0;y|=0;g.globalAlpha=.16;for(let i=0;i<30;i+=3){const hh=3+(i>>2);F(P.amberL,d>0?x+24+i:x-3-i,y+6-(hh>>1),3,hh);}g.globalAlpha=1;
  F(P.void,x-1,y-1,26,14);F(c,x,y,24,12);g.globalAlpha=.4;F(P.void,x,y+9,24,3);F(P.void,x+6,y+2,11,7);g.globalAlpha=.3;F(P.white,x+1,y,22,1);g.globalAlpha=1;
  F(P.fog,d>0?x+17:x+6,y+3,2,5);F(P.haze,d>0?x+5:x+18,y+3,1,5);
  F(P.amberL,d>0?x+23:x,y+1,1,3);F(P.amberL,d>0?x+23:x,y+8,1,3);F(P.red,d>0?x:x+23,y+1,1,3);F(P.red,d>0?x:x+23,y+8,1,3);
  if(pol){const on=(t*5|0)%2;F(on?P.red:P.teal,x+9,y+4,3,3);F(on?P.teal:P.red,x+12,y+4,3,3);g.globalAlpha=.18;F(on?P.red:P.teal,x-8,y-8,40,28);g.globalAlpha=1;}};
 const carV=(x,y,d,c)=>{x|=0;y|=0;g.globalAlpha=.16;for(let i=0;i<30;i+=3){const ww=3+(i>>2);F(P.amberL,x+6-(ww>>1),d>0?y+24+i:y-3-i,ww,3);}g.globalAlpha=1;
  F(P.void,x-1,y-1,14,26);F(c,x,y,12,24);g.globalAlpha=.4;F(P.void,x+2,y+6,8,11);F(P.void,x+9,y,3,24);g.globalAlpha=1;F(P.fog,x+3,d>0?y+17:y+5,6,2);
  F(P.amberL,x+1,d>0?y+23:y,3,1);F(P.amberL,x+8,d>0?y+23:y,3,1);F(P.red,x+1,d>0?y:y+23,3,1);F(P.red,x+8,d>0?y:y+23,3,1);};
 const ped=(q,x,y,f)=>{x|=0;y|=0;g.globalAlpha=.45;F(P.void,x-1,y+13,10,2);g.globalAlpha=1;F(P.void,x,y-1,8,3);F(q.h,x+1,y-1,6,2);F(P.void,x-1,y+1,10,1);F(q.h,x,y+1,8,1);
  F(q.s,x+2,y+2,4,3);F(P.void,x+2,y+2,4,1);F(q.c,x+1,y+5,6,6);F(P.void,x+1,y+5,1,6);F(P.void,x+6,y+5,1,6);F(P.paper,x+3,y+5,2,1);
  F(P.night,x+2,y+11,f?2:1,f?3:2);F(P.night,x+5,y+11,f?1:2,f?2:3);};
 let last=performance.now(),acc=0,T=0,raf;
 const tick=(now)=>{raf=requestAnimationFrame(tick);let dt=Math.min(.1,(now-last)/1000);last=now;acc+=dt;if(acc<.05)return;dt=acc;acc=0;T+=dt;
  g.clearRect(0,0,W,H);
  // window flicker
  wins.forEach(w=>{w.t-=dt;if(w.t<=0){w.off=!w.off;w.t=w.off?1+R()*4:4+R()*14;}if(w.off){F('#1a1626',w.x,w.y,5,5);}});
  // water shimmer
  water.forEach(([x,y,ph])=>{const v=Math.sin(T*1.6+ph);if(v>.8){g.globalAlpha=(v-.8)*4;F('#8fa6e6',x+((T*4+ph*9)%6|0),y,3,1);g.globalAlpha=1;}});
  // camada objetos: sprites + recortes da arte, ordenados pela linha de base (pé)
  const Q=[];
  boat.x+=boat.v*dt;if(boat.x>BT.x1)boat.x=BT.x0;Q.push({b:boat.y+12,f:drawBoat});
  cars.forEach(c=>{const l=c.l,len=l.x1-l.x0;c.p=(c.p+c.v*dt/len)%1;const x=l.d>0?l.x0-30+c.p*(len+60):l.x1+30-c.p*(len+60);const a=edge(x+12,l.x0,l.x1,l.x0>0,l.x1<W);Q.push({b:l.y+12,sp:[x,l.y,24,12],f:()=>faded(a,x,l.y,()=>carH(x,l.y,l.d,c.c,c.pol,T))});});
  vcars.forEach(c=>{const l=c.l,len=l.y1-l.y0;c.p=(c.p+c.v*dt/len)%1;const y=l.d>0?l.y0+c.p*len:l.y1-c.p*len;const a=Math.min(1,(y-l.y0)/24,(l.y1-y)/24);Q.push({b:y+24,sp:[l.x,y,12,24],f:()=>faded(a,l.x,y,()=>carV(l.x,y,l.d,c.c))});});
  peds.forEach(q=>{const w=q.w,len=w.x1-w.x0;q.p=(q.p+q.v*dt/len)%1;const x=q.d>0?w.x0+q.p*len:w.x1-q.p*len;const a=edge(x,w.x0,w.x1,w.x0>0,w.x1<W);const fr=((T*4+q.p*50)|0)%2;Q.push({b:w.y+14,sp:[x,w.y,8,14],f:()=>faded(a,x,w.y,()=>ped(q,x,w.y,fr))});});
  if(img.complete&&img.naturalWidth)OBJ.forEach(ob=>Q.push({b:ob.base,f:()=>{ob.rects.forEach(([x,y,w,h])=>{g.drawImage(img,x,y,w,h,x,y,w,h);wins.forEach(v=>{if(v.off&&v.x>=x&&v.x<x+w&&v.y>=y&&v.y<y+h)F('#1a1626',v.x,v.y,5,5);});});}}));
  Q.sort((p,q)=>p.b-q.b).forEach(e=>e.f());
  tickFx(dt);
  if(host.getAttribute('data-camadas')==='1')debug(Q);
 };
 const drawBoat=()=>{const bx=boat.x|0,by=boat.y;for(let k=0;k<10;k++){g.globalAlpha=.5-k*.045;F(P.fog,bx-6-k*7,by+6+((k+(T*6|0))%3)-1,4,1);F(P.fog,bx-4-k*7,by+11-((k+(T*6|0))%3),3,1);}g.globalAlpha=1;
  F(P.void,bx-1,by-1,42,13);F(P.cork2,bx,by+4,40,7);F(P.redD,bx,by+8,40,3);F(P.paper2,bx+14,by-6,16,10);F(P.void,bx+14,by-6,16,1);F(P.amber,bx+17,by-3,3,2);F(P.amber,bx+23,by-3,3,2);F(P.void,bx+26,by-12,3,6);
  if((T*2|0)%2)F(P.amberL,bx+39,by+3,2,2);g.globalAlpha=.25;for(let k=0;k<5;k++)F(P.amber,bx+18+(k%2),by+13+k*3,3,1);g.globalAlpha=1;};
 const debug=Q=>{g.globalAlpha=.1;g.fillStyle='#ffffff';for(let x=0;x<W;x+=16)g.fillRect(x,0,1,H);for(let y=0;y<H;y+=16)g.fillRect(0,y,W,1);
  g.globalAlpha=.55;g.fillStyle='#ffb43a';lanes.forEach(l=>g.fillRect(l.x0,l.y+12,l.x1-l.x0,1));vl.forEach(l=>g.fillRect(l.x+6,l.y0,1,l.y1-l.y0));g.fillStyle='#e0d0ff';walks.forEach(w=>g.fillRect(w.x0,w.y+14,w.x1-w.x0,1));
  OBJ.forEach(ob=>{ob.rects.forEach(([x,y,w,h])=>{g.globalAlpha=.28;g.fillStyle='#4fd1c5';g.fillRect(x,y,w,h);g.globalAlpha=.9;g.strokeStyle='#4fd1c5';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);});const r0=ob.rects[ob.rects.length-1];g.fillStyle='#e2433b';g.fillRect(r0[0]-3,ob.base,r0[2]+6,2);});
  g.fillStyle='#ffdd7e';Q.forEach(e=>{if(e.sp){const[x,y,w,h]=e.sp;g.globalAlpha=.9;g.strokeStyle='#ffdd7e';g.strokeRect((x|0)+.5,(y|0)+.5,w,h);g.fillRect((x|0)-1,e.b-1,w+2,2);}});g.globalAlpha=1;};
 const tickFx=(dt)=>{
  // camada teto
  // police lights at station
  const on=(T*4|0)%2;[[726,560],[876,560]].forEach(([x,y],i)=>{const a=(on+i)%2;F(a?P.red:P.teal,x,y,5,3);F(a?P.teal:P.red,x+6,y,5,3);g.globalAlpha=.16;F(a?P.red:P.teal,x-14,y-12,40,28);g.globalAlpha=1;});
  // ferris wheel lights
  for(let i=0;i<12;i++){const a=T*.35+i*Math.PI/6;F(i%2?P.amberL:P.red,1482+Math.cos(a)*40-1,443+Math.sin(a)*40-1,3,3);}
  // spotlights
  [[1242,66,0],[1440,70,2.1]].forEach(([x,y,ph])=>{const a=Math.PI/2+Math.sin(T*.45+ph)*.75,L=300,s=.07;g.globalAlpha=.08;g.fillStyle=P.amberL;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a-s)*L,y+Math.sin(a-s)*L);g.lineTo(x+Math.cos(a+s)*L,y+Math.sin(a+s)*L);g.closePath();g.fill();g.globalAlpha=.9;F(P.white,x-2,y-2,4,4);g.globalAlpha=1;});
  // smoke
  emT-=dt;if(emT<=0){emT=.35;emit.forEach(([x,y])=>smoke.push({x:x+R()*6-3,y,a:0}));}
  for(let i=smoke.length-1;i>=0;i--){const m=smoke[i];m.a+=dt;m.y-=12*dt;m.x+=(4+Math.sin(m.a*2)*3)*dt;const sz=2+m.a*3|0;const al=.4*(1-m.a/3.2);if(al<=0){smoke.splice(i,1);continue;}g.globalAlpha=al;F('#7fd46a',m.x-sz/2,m.y-sz/2,sz*2,sz*2);g.globalAlpha=1;}
  // rain
  g.fillStyle='#b9bde6';drops.forEach(d=>{if(d.sp>0){d.sp-=dt;g.globalAlpha=.35;F('#b9bde6',d.x-2,d.e,5,1);g.globalAlpha=1;if(d.sp<=0){d.y=-10;d.x=R()*W*1.15;d.e=R()*H;}return;}
   d.y+=d.v*dt;d.x-=d.v*.22*dt;if(d.y>=d.e){d.sp=.12;return;}g.globalAlpha=.32;F('#b9bde6',d.x,d.y,1,4);F('#b9bde6',d.x-1,d.y+4,1,3);g.globalAlpha=1;});
  // neon flicker + marker bob
  flick.forEach(f=>{f.t-=dt;if(f.t<=0&&f.f<=0){f.f=.5;f.t=2+R()*7;}if(f.f>0){f.f-=dt;f.el.style.opacity=((f.f*20|0)%2)?'.25':'1';if(f.f<=0)f.el.style.opacity='1';}});
  const b=(T*2|0)%2;bobs.forEach((el,i)=>{el.style.transform='translateY('+(((i+ (T*2|0))%2)?-4:0)+'px)';});
 };
 raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);}
let cache;
function get(){if(cache)return cache;
 const icons={};for(const k in ICONS)icons[k]=spr(ICONS[k]);
 const mk={novo:marker('!',P.amber,P.amberL,P.amberD,P.void),andamento:marker('?',P.teal,P.white,P.moss,P.void),resolvido:marker('v',P.fog,P.white,P.haze,P.void),alerta:marker('!',P.red,P.amberL,P.redD,P.white)};
 const pt={},pt64={},mn={};for(const k in CH){pt[k]=portrait(CH[k],32);mn[k]=mini(CH[k]);}
 ['rui','vega','irene','caio'].forEach(k=>pt64[k]=portrait(CH[k],64));
 const ch={det:charSpr('det',CH.vega),detWalk:charSpr('det',CH.vega,'walk'),detLupa:charSpr('det',CH.vega,'lupa'),detBrown:charSpr('det',{skin:P.skin2,hat:P.cork2,band:P.void,coat:P.cork}),detAna:charSpr('det',{skin:P.skin1,hat:P.moss,band:P.teal,coat:P.teal}),pol:charSpr('pol',{skin:P.skin2}),polWalk:charSpr('pol',{skin:P.skin3},'walk'),ban:charSpr('ban',{skin:P.skin1}),banDark:charSpr('ban',{skin:P.skin3,coat:P.deep}),civ:charSpr('civ',CH.otavio.skin?{skin:P.skin1,hairC:P.cork2,coat:P.slate,tie:P.red}:{}),civ2:charSpr('civ',{skin:P.skin3,hairC:P.void,coat:P.moss,shirt:P.paper2,tie:P.amber})};
 cache={icons,mk,pt,pt64,mini:mn,ch,city:city(),scene:scene(),cork:cork(64,64),cone:cone(90,110),wear:wear(100,40),
  dNight:dither(4,4,P.void,P.night,.25),dPaper:dither(4,4,P.paper,P.paper2,.12)};
 return cache;}
window.PX={P,get,rain,strings,live};
})();
