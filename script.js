/*
 * MEY FASHION — Living Wardrobe v2.
 * Lightweight animation engine with requestAnimationFrame, damped springs,
 * velocity preservation, drag momentum, and WAAPI image morphs.
 * No framework/CDN needed: index.html also works when opened locally/offline.
 * Prices are catalogue estimates; all orders confirmed via WhatsApp.
 */
'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const PHONE = '6283897581501';
const ASSET = 'assets/products/';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = [
  { price:89000,id:'spider',slug:'spider',name:'Spider Pink',type:'CROP TEE / STREETWEAR',tag:'Y2K STREETWEAR',group:'crop',blurb:'Crop tee putih dengan grafis spider pink dan list sporty di lengan. Playful dan edgy, cocok dipadukan dengan rok atau celana cargo.',label:'SIGNATURE STREET' },
  { price:139000,id:'hoodie',slug:'hoodie',name:'Orbit Hoodie',type:'CROPPED HOODIE / CASUAL',tag:'THE DAILY EDIT',group:'outer',blurb:'Hoodie crop putih dengan aksen hitam di lengan, lengkap dengan inner hitam bertali pita. Santai, nyaman, dan tetap terlihat rapi.',label:'COMFORT FIRST' },
  { price:99000,id:'angel',slug:'angel',name:'Archive Angel',type:'OFF-SHOULDER / Y2K',tag:'Y2K GIRL ENERGY',group:'crop',blurb:'Atasan off-shoulder krem-hitam dengan grafis bintang, kupu-kupu, dan pita bergaya gothic. Satu potongan yang langsung jadi pusat perhatian.',label:'COOL GIRL PICKS' },
  { price:85000,id:'sage',slug:'sage',name:'Sage Bloom',type:'CARDIGAN / KNITWEAR',tag:'THE SOFT EDIT',group:'knit',blurb:'Cardigan rajut hijau sage dengan lengan puff, kancing krem, dan bordir bunga kecil di dada. Manis, lembut, dan mudah dipadukan.',label:'SOFT & SWEET' },
  { price:149000,id:'noir',slug:'noir',name:'Midnight Muse',type:'LAYERED TOP / GRUNGE',tag:'DARK ROMANCE',group:'outer',blurb:'Crop top abu muda berlapis inner lengan panjang hitam, dengan detail buckle, grafis grunge, dan aksen rantai. Untuk kamu yang berani tampil beda.',label:'BOLD & CONFIDENT' },
  { price:95000,id:'pink',slug:'pink',name:'Pink Haze',type:'CROP SHIRT / PASTEL',tag:'PINK LOVE CLUB',group:'crop',blurb:'Kemeja crop putih dengan detail pink pastel, motif bintang, dan saku di dada. Soft streetwear yang pas dipakai sehari-hari.',label:'SWEET REVOLUTION' }
];
const rupiah=n=>'Rp '+Number(n).toLocaleString('id-ID');
const photo=(p,view='front') => `${ASSET}${p.slug}-${view}.webp`;
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const hero=$('.hero'),scene=$('#scene'),rack=$('#rackItems'),specs=$('#specs');
const rail=$('#railWrap'),label=$('#floatingLabel');
let chosen=0, focused=false, view='front', activeSize='M', qty=1;
let bagOpen=false, blockedClicksUntil=0, lastUserAction=Date.now();
let dragged=0, dragging=false, dragStartX=0, dragStartY=0, pointerId=null;
let rafID=0, lastFrame=0, stageW=0, stageH=0, pieceW=0, swipeStep=0;
let focusSerial=0, toastTimer=0, autoTimer=0, autoModelTimer=0;
let savedBag=[];
try{const data=JSON.parse(localStorage.getItem('mey-fashion-bag-v2')||'[]');if(Array.isArray(data))savedBag=data.filter(x=>items.some(p=>p.id===x.id)&&Number.isInteger(x.count)&&x.count>0&&x.count<999)}catch(_){}
const garments=[];

function makePieces(){
  rack.innerHTML=items.map((p,index)=>`<button class="rack-piece" type="button" data-index="${index}" aria-label="${esc(p.name)}: lihat produk" style="--delay:${(-index*.48).toFixed(2)}s"><span class="image-wrap"><img class="piece-image" src="${photo(p)}" alt="Baju ${esc(p.name)} di gantungan" draggable="false" loading="${index<5?'eager':'lazy'}"></span></button>`).join('');
  $$('.rack-piece',rack).forEach((el,index)=>{
    const img=$('.piece-image',el);
    const state={el,img,index,x:0,y:-230,s:.7,r:0,yaw:0,o:0,z:1,vx:0,vy:0,vs:0,vr:0,vyaw:0,vo:0,tar:{x:0,y:0,s:1,r:0,yaw:0,o:1},primed:false};
    garments.push(state);
    el.addEventListener('click',e=>{
      if(Date.now()<blockedClicksUntil)return;
      markUser();
      if(focused){if(index!==chosen)focusProduct(index);return}
      if(index===chosen)openProduct(index);else selectProduct(index);
    });
  });
  $('#progressTrack').innerHTML=items.map((p,i)=>`<button type="button" aria-label="Pilih baju ${i+1}, ${esc(p.name)}" data-index="${i}" title="${esc(p.name)}"></button>`).join('');
  $$('#progressTrack button').forEach(b=>b.addEventListener('click',()=>focused?focusProduct(+b.dataset.index):selectProduct(+b.dataset.index)));
}
let railW=0,railTop=0,cs=1.2,s1=.7,s2=.56,step1=150,step2=110,cxC=0;
const IMG_RATIO=1;
function lerp(a,b,t){return a+(b-a)*t}
function geometry(){
  stageW=scene.clientWidth;stageH=scene.clientHeight;
  const mobile=innerWidth<=700,tablet=innerWidth<=980&&!mobile&&stageH>=stageW*1.1;
  pieceW=mobile?clamp(stageW*.42,133,174):tablet?clamp(stageW*.21,174,220):clamp(stageW*.17,190,248);
  /* rel jangan diubah-ubah lewat CSS: semua dihitung di sini */
  railW=stageW*(mobile?1.74:1.08);
  railTop=stageH*(mobile?.395:tablet?.44:.075);
  rail.style.width=railW+'px';rail.style.left=((stageW-railW)/2)+'px';rail.style.top=railTop+'px';
  cxC=stageW*.5;
  const hang=railTop+railW*157/1648*.85-5;
  const limit=mobile?(stageH<780?.66:.745):tablet?.76:.8;
  const availH=stageH*limit-hang;
  const wCap=stageW*(mobile?.62:tablet?.46:.3);
  cs=clamp(Math.min(availH/(pieceW*IMG_RATIO),wCap/pieceW),1.1,2.05);
  s1=Math.max(.6,cs*.5);s2=s1*.8;
  step1=pieceW*(cs+s1)/2*.9;step2=pieceW*(s1+s2)/2*.95;
  swipeStep=step1;
  garments.forEach(g=>{g.el.style.width=pieceW+'px'});
}
function railY(x){
  const railHeight=railW*157/1648;
  const u=clamp((x-stageW/2)/(railW/2),-1,1);
  return railTop+railHeight*(.18+.67*(1-u*u))-5;
}
function posX(d){const a=Math.abs(d),s=d<0?-1:1;return cxC+s*(a<=1?a*step1:step1+Math.min(a-1,1.6)*step2+Math.max(0,a-2.6)*step2)}
function scaleAt(a){return a<=1?lerp(cs,s1,a):a<=2?lerp(s1,s2,a-1):s2*(1-Math.min(a-2,1.5)*.22)}
function focusCoords(isModel){
  if(innerWidth<=700)return {x:stageW*.5-pieceW/2,y:stageH*.145,s:isModel?1.43:1.39,r:0,yaw:0,o:1};
  if(innerWidth<=980)return{x:stageW*.295-pieceW/2,y:stageH*.23,s:isModel?1.82:1.79,r:0,yaw:0,o:1};
  return{x:stageW*.34-pieceW/2,y:stageH*.24,s:isModel?2.03:1.85,r:0,yaw:0,o:1};
}
const mod=n=>((n%items.length)+items.length)%items.length;
const cyc=d=>{const n=items.length;return d-n*Math.round(d/n)};
let pos=0,posTarget=0,posV=0,heroSeen=true,mx=0,my=0,px=0,py=0,fling=0,dragLast=0,dragLastX=0,dragStartPos=0;
const KEYS=['x','y','s','r','yaw','o'];
function targetFor(g,d){
  const a=Math.min(Math.abs(d),3.5),cx=posX(d);
  if(focused){
    if(g.index===chosen)return focusCoords(view==='model');
    return{x:cx-pieceW/2+d*70,y:railY(cx)-65,s:.44,r:-d*14,yaw:d*20,o:0};
  }
  return{x:cx-pieceW/2,y:railY(cx),s:scaleAt(a),r:-d*2.4,yaw:d*3.2,o:a<=2?1:clamp(1-(a-2)/1.5,0,1)};
}
function syncLabels(){
  $('#lookCount').textContent=String(chosen+1).padStart(2,'0');
  $('#selectedName').textContent=items[chosen].name.toUpperCase();
  $$('#progressTrack button').forEach((b,i)=>{b.classList.toggle('current',i===chosen);b.setAttribute('aria-pressed',String(i===chosen))});
}
function updateTargets(initial=false){
  if(!stageW)geometry();
  posTarget=pos+cyc(chosen-pos);
  garments.forEach(g=>{
    const a=Math.abs(cyc(g.index-chosen)),on=a===0;
    g.el.classList.toggle('is-center',on&&!focused);
    g.el.classList.toggle('is-focus',on&&focused);
    g.el.setAttribute('aria-hidden',(focused?!on:a>=3)?'true':'false');
    g.el.tabIndex=focused?(on?0:-1):(a>=3?-1:0);
    g.el.style.pointerEvents=(focused&&!on)||(a>=3&&!focused)?'none':'auto';
    if(initial){const d=cyc(g.index-pos),q=targetFor(g,d);g.x=q.x;g.y=-340-a*30;g.s=q.s*.78;g.r=q.r-12;g.yaw=0;g.o=0;g.pd=d;g.sw=0;g.swv=0;g.wait=.25+a*.1}
  });
  syncLabels();kickRender();
}
/* Exact critically-damped spring: stable at any frame rate, keeps velocity when the target changes. */
function sp(g,k,t,w,dt){const v='v'+k,x=g[k]-t,j=g[v]+w*x,e=Math.exp(-w*dt);g[k]=t+(x+j*dt)*e;g[v]=(g[v]-j*w*dt)*e}
function renderFrame(time){
  const dt=lastFrame?clamp((time-lastFrame)/1000,.004,.033):.016;lastFrame=time;
  if(!dragging){
    if(reducedMotion){pos=posTarget;posV=0}
    else{const w=8,x=pos-posTarget,j=posV+w*x,e=Math.exp(-w*dt);pos=posTarget+(x+j*dt)*e;posV=(posV-j*w*dt)*e;if(Math.abs(pos-posTarget)<.0005&&Math.abs(posV)<.005){pos=posTarget;posV=0}}
  }
  const f=1-Math.exp(-dt*4);px+=(mx-px)*f;py+=(my-py)*f;
  hero.style.setProperty('--px',px.toFixed(3));hero.style.setProperty('--py',py.toFixed(3));
  const t=time/1000,w=focused?10:dragging?24:14;
  for(const g of garments){
    const d=cyc(g.index-pos),q=targetFor(g,d);
    if(Math.abs(d-g.pd)>3){for(const k of KEYS)if(k!=='o')g[k]=q[k];g.vx=g.vy=0}
    g.pd=d;
    if(g.wait>0)g.wait-=dt;
    else for(const k of KEYS){if(reducedMotion){g[k]=q[k]}else sp(g,k,q[k],k==='o'?11:w,dt)}
    /* hanging-cloth pendulum: swings against movement, overshoots, settles */
    const idle=focused||reducedMotion?0:Math.sin(t*.9+g.index*1.7)*.9;
    g.swv+=(-62*(g.sw-idle)-4.2*g.swv+g.vx*.34)*dt;g.sw=clamp(g.sw+g.swv*dt,-16,16);
    const sk=focused?0:clamp(g.vx*-.0035,-6,6);
    g.el.style.transform=`translate3d(${g.x.toFixed(1)}px,${g.y.toFixed(1)}px,0) rotate(${(g.r+g.sw).toFixed(2)}deg) rotateY(${g.yaw.toFixed(1)}deg) skewX(${sk.toFixed(2)}deg) scale(${g.s.toFixed(3)})`;
    g.el.style.opacity=clamp(g.o,0,1).toFixed(3);
    const z=focused&&g.index===chosen?12:10-Math.round(Math.abs(d));
    if(g.z!==z){g.z=z;g.el.style.zIndex=z}
  }
  rafID=heroSeen&&!document.hidden?requestAnimationFrame(renderFrame):0;if(!rafID)lastFrame=0;
}
function kickRender(){if(!rafID&&!document.hidden){lastFrame=0;rafID=requestAnimationFrame(renderFrame)}}
function markUser(){lastUserAction=Date.now()}
function selectProduct(index){
  if(focused){focusProduct(index);return}
  chosen=(index+items.length)%items.length;const priceNode=$('#focusPrice');if(priceNode)priceNode.textContent=rupiah(items[chosen].price);
  markUser();
  updateTargets();
  if(!reducedMotion){$('#selectedName').animate([{opacity:.15,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'cubic-bezier(.22,1,.36,1)'})}
}
async function morphImage(target,src,alt){
  const serial=++focusSerial;
  const old=target.getAttribute('src');
  if(old===src){target.alt=alt;return}
  /* Preload before folding the "fabric" around its vertical axis. */
  const cached=new Image();cached.src=src;
  try{await cached.decode()}catch(_){}
  if(serial!==focusSerial)return;
  if(reducedMotion){target.src=src;target.alt=alt;return}
  await target.animate([{transform:'rotateY(0deg) scale(1)',opacity:1},{transform:'rotateY(75deg) scale(.91)',opacity:0}],{duration:220,easing:'cubic-bezier(.6,.01,.8,.2)',fill:'forwards'}).finished.catch(()=>{});
  if(serial!==focusSerial){target.getAnimations().forEach(a=>a.cancel());return}
  target.src=src;target.alt=alt;
  target.getAnimations().forEach(a=>a.cancel());
  target.animate([{transform:'rotateY(-74deg) scale(.94)',opacity:0},{transform:'rotateY(9deg) scale(1.018)',opacity:1,offset:.82},{transform:'rotateY(0deg) scale(1)',opacity:1}],{duration:560,easing:'cubic-bezier(.19,1,.22,1)'});
}
function refreshDetails(){
  const p=items[chosen];
  $('#focusNumber').textContent=String(chosen+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
  $('#focusTag').textContent=p.type;
  $('#focusName').textContent=p.name;$('#focusPrice').textContent=rupiah(p.price);
  $('#focusDescription').textContent=p.blurb;
  $('#productWhatsApp').href=`https://wa.me/${PHONE}?text=${encodeURIComponent('Halo Mey Fashion! Saya ingin tanya harga, ukuran, dan stok '+p.name+'.')}`;
  $$('.view-tabs button').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view))});
  $('#qtyValue').textContent=qty;
  $$('#sizeButtons button').forEach(b=>b.classList.toggle('active',b.dataset.size===activeSize));
  $('#controlHint').textContent=focused?'PILIH TAMPILAN ATAU UKURAN':'KLIK BAJU ATAU GESER';
}
function openProduct(index,initialView='front'){
  clearTimeout(autoModelTimer);
  if(bagOpen)closeBag();
  chosen=(index+items.length)%items.length;const priceNode=$('#focusPrice');if(priceNode)priceNode.textContent=rupiah(items[chosen].price);
  focused=true;view=initialView;qty=1;activeSize='M';markUser();
  hero.dataset.state='detail';document.body.classList.add('detail-open');
  specs.setAttribute('aria-hidden','false');
  specs.style.visibility='visible';
  refreshDetails();
  const p=items[chosen];
  garments.forEach(g=>{if(g.index!==chosen)return;g.img.alt='Tampilan '+view+' dari '+p.name;});
  if(view!=='front')morphImage(garments[chosen].img,photo(p,view),'Model mengenakan '+p.name);
  updateTargets();
  const anim=specs.animate([{opacity:0,transform:'translate3d(50px,14px,0) scale(.96)'},{opacity:1,transform:'translate3d(0,0,0) scale(1)'}],{duration:reducedMotion?10:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
  anim.finished.then(()=>{specs.style.opacity='1';specs.style.transform='none';anim.cancel()}).catch(()=>{});
  label.setAttribute('aria-hidden','true');
  /* In the reference: the chosen garment becomes the model after the detail reveal. */
  if(initialView==='front'){
    const targetIndex=chosen;
    autoModelTimer=setTimeout(()=>{if(focused&&chosen===targetIndex&&view==='front')changeView('model')},1900);
  }
}
function closeProduct(){
  clearTimeout(autoModelTimer);
  if(!focused)return;
  ++focusSerial;focused=false;view='front';hero.dataset.state='browse';document.body.classList.remove('detail-open');markUser();
  specs.style.opacity='0';specs.style.transform='translate3d(42px,20px,0) scale(.97)';
  specs.style.visibility='hidden';specs.setAttribute('aria-hidden','true');
  garments.forEach(g=>{if(g.index===chosen){g.img.src=photo(items[chosen]);g.img.alt='Baju '+items[chosen].name+' digantung';g.img.getAnimations().forEach(a=>a.cancel())}});
  label.setAttribute('aria-hidden','false');
  updateTargets();
}
function focusProduct(index){
  clearTimeout(autoModelTimer);
  if(!focused){openProduct(index);return}
  const old=chosen;chosen=(index+items.length)%items.length;const priceNode=$('#focusPrice');if(priceNode)priceNode.textContent=rupiah(items[chosen].price);view='front';activeSize='M';qty=1;markUser();
  ++focusSerial;
  garments[old].img.getAnimations().forEach(a=>a.cancel());
  garments[old].img.src=photo(items[old]);
  garments[old].img.alt='Baju '+items[old].name;
  const p=items[chosen];garments[chosen].img.src=photo(p);garments[chosen].img.alt='Baju '+p.name;
  specs.animate([{opacity:.3,transform:'translateX(18px)'},{opacity:1,transform:'translateX(0)'}],{duration:340,easing:'ease-out'});
  refreshDetails();updateTargets();
  const targetIndex=chosen;
  autoModelTimer=setTimeout(()=>{if(focused&&chosen===targetIndex&&view==='front')changeView('model')},1750);
}
function changeView(newView){
  clearTimeout(autoModelTimer);
  if(!focused)return;
  view=newView;
  refreshDetails();
  updateTargets();
  const p=items[chosen];
  const alt=newView==='model'?'Model perempuan memakai '+p.name:'Baju '+p.name+', tampak '+(newView==='angle'?'miring':'depan');
  morphImage(garments[chosen].img,photo(p,newView),alt);
}
function startDrag(e){
  if(focused||e.button>0||e.target.closest('.specs'))return;
  pointerId=e.pointerId;dragStartX=e.clientX;dragStartY=e.clientY;dragging=false;dragStartPos=pos;dragLastX=e.clientX;dragLast=performance.now();fling=0;
}
function moveDrag(e){
  if(pointerId!==e.pointerId||focused)return;
  const dx=e.clientX-dragStartX,dy=e.clientY-dragStartY;
  if(!dragging&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)*.8){dragging=true;try{scene.setPointerCapture(pointerId)}catch(_){}hero.classList.add('is-dragging')}
  if(!dragging)return;
  const now=performance.now(),ms=Math.max(8,now-dragLast);
  fling=fling*.6+(-(e.clientX-dragLastX)/swipeStep/(ms/1000))*.4;dragLast=now;dragLastX=e.clientX;
  pos=dragStartPos-dx/swipeStep*1.1;posV=0;
  const c=mod(Math.round(pos));if(c!==chosen){chosen=c;syncLabels()}
  kickRender();
}
function endDrag(e){
  if(pointerId!==e.pointerId)return;
  pointerId=null;hero.classList.remove('is-dragging');
  if(dragging){
    dragging=false;blockedClicksUntil=Date.now()+280;
    const t=Math.round(pos+clamp(fling,-6,6)*.22);
    chosen=mod(t);posV=clamp(fling,-8,8);
    const pn=$('#focusPrice');if(pn)pn.textContent=rupiah(items[chosen].price);
    markUser();updateTargets();
  }
}
scene.addEventListener('pointerdown',startDrag);
scene.addEventListener('pointermove',moveDrag);
scene.addEventListener('pointerup',endDrag);
scene.addEventListener('pointercancel',e=>{if(pointerId===e.pointerId){pointerId=null;dragging=false;dragged=0;updateTargets()}});
let wheelUntil=0;
scene.addEventListener('wheel',e=>{
  if(focused||Math.abs(e.deltaX)<22||Math.abs(e.deltaX)<Math.abs(e.deltaY))return;
  if(Date.now()-wheelUntil<320)return;
  wheelUntil=Date.now();selectProduct(chosen+(e.deltaX>0?1:-1));
},{passive:true});
$('#prevPiece').addEventListener('click',()=>selectProduct(chosen-1));
$('#nextPiece').addEventListener('click',()=>selectProduct(chosen+1));
$('#openLook').addEventListener('click',()=>openProduct(chosen));
$('#exploreButton').addEventListener('click',()=>{selectProduct(chosen+1);$('#openLook').animate([{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:350})});
$('#demoButton').addEventListener('click',()=>openProduct(chosen,'model'));
$('#closeLook').addEventListener('click',closeProduct);
$('#focusPrev').addEventListener('click',()=>focusProduct(chosen-1));
$('#focusNext').addEventListener('click',()=>focusProduct(chosen+1));
$$('.view-tabs button').forEach(b=>b.addEventListener('click',()=>changeView(b.dataset.view)));
$$('#sizeButtons button').forEach(b=>b.addEventListener('click',()=>{activeSize=b.dataset.size;refreshDetails()}));
$('#qtyPlus').addEventListener('click',()=>{qty=clamp(qty+1,1,30);$('#qtyValue').textContent=qty});
$('#qtyMinus').addEventListener('click',()=>{qty=clamp(qty-1,1,30);$('#qtyValue').textContent=qty});

function saveBag(){try{localStorage.setItem('mey-fashion-bag-v2',JSON.stringify(savedBag))}catch(_){}}
function updateCount(){$('#bagCount').textContent=savedBag.reduce((sum,r)=>sum+r.count,0)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2700)}
$('#addToBag').addEventListener('click',()=>{
  const p=items[chosen];
  const line=savedBag.find(x=>x.id===p.id&&x.size===activeSize);
  if(line)line.count=clamp(line.count+qty,1,998);
  else savedBag.push({id:p.id,size:activeSize,count:qty});
  saveBag();updateCount();toast(p.name+' ditambahkan ke tas ✧');
  $('#addToBag').animate([{transform:'scale(.95)'},{transform:'scale(1)'}],{duration:260});
});
function renderBag(){
  const list=$('#bagLines');
  if(!savedBag.length){list.innerHTML='<div class="bag-empty"><span>✧</span><h3>Tasmu masih kosong.</h3><p>Geser gantungan, pilih outfit, lalu tambahkan ke tas kecilmu.</p></div>';$('#checkout').disabled=true;const totalEl=$('#bagTotal');if(totalEl)totalEl.textContent='Total: Rp 0';updateCount();return}
  $('#checkout').disabled=false;const total=savedBag.reduce((sum,r)=>sum+(items.find(x=>x.id===r.id)?.price||0)*r.count,0);const totalEl=$('#bagTotal');if(totalEl)totalEl.textContent='Total estimasi: '+rupiah(total);
  list.innerHTML=savedBag.map((line,i)=>{
    const p=items.find(x=>x.id===line.id);
    return `<div class="bag-row"><img src="${photo(p)}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><p>Ukuran ${esc(line.size)} · ${rupiah(p.price)} / pcs</p><div class="bag-row-buttons"><div class="bag-qty"><button type="button" data-line="${i}" data-action="minus" aria-label="Kurangi ${esc(p.name)}">−</button><span>${line.count}</span><button type="button" data-line="${i}" data-action="plus" aria-label="Tambah ${esc(p.name)}">+</button></div><button class="bag-remove" type="button" data-line="${i}" data-action="remove">Hapus</button></div></div></div>`;
  }).join('');updateCount();
}
$('#bagLines').addEventListener('click',e=>{
  const b=e.target.closest('button[data-action]');if(!b)return;
  const line=+b.dataset.line,action=b.dataset.action;
  if(!savedBag[line])return;
  if(action==='plus')savedBag[line].count=clamp(savedBag[line].count+1,1,998);
  if(action==='minus')savedBag[line].count--;
  if(action==='remove'||savedBag[line].count<1)savedBag.splice(line,1);
  saveBag();renderBag();
});
function openBag(){if(focused)closeProduct();bagOpen=true;const overlay=$('#screenOverlay'),bag=$('#bag');renderBag();overlay.hidden=false;requestAnimationFrame(()=>overlay.classList.add('show'));bag.classList.add('open');bag.setAttribute('aria-hidden','false');document.body.classList.add('lock-scroll');$('#cartClose').focus({preventScroll:true})}
function closeBag(){if(!bagOpen)return;bagOpen=false;const overlay=$('#screenOverlay'),bag=$('#bag');overlay.classList.remove('show');bag.classList.remove('open');bag.setAttribute('aria-hidden','true');document.body.classList.remove('lock-scroll');setTimeout(()=>{if(!bagOpen)overlay.hidden=true},360);$('#cartOpen').focus({preventScroll:true})}
$('#cartOpen').addEventListener('click',()=>bagOpen?closeBag():openBag());
$('#cartClose').addEventListener('click',closeBag);
$('#screenOverlay').addEventListener('click',closeBag);
$('#continueShopping').addEventListener('click',closeBag);
$('#checkout').addEventListener('click',()=>{
  if(!savedBag.length)return;
  const total=savedBag.reduce((s,r)=>s+items.find(x=>x.id===r.id).price*r.count,0);
  const msg='Halo Mey Fashion! 👋\nSaya tertarik memesan:\n\n'+savedBag.map((r,i)=>`${i+1}. ${items.find(x=>x.id===r.id).name}\n   Ukuran: ${r.size} · Jumlah: ${r.count} pcs`).join('\n')+'\n\nTotal estimasi: '+rupiah(total)+'\n\nBoleh dibantu konfirmasi harga, ukuran, stok, dan pemesanannya? Terima kasih!';
  window.open('https://wa.me/'+PHONE+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');
});

/* Catalogue: selecting a card zooms product into the SAME hero stage */
function makeCatalogue(){
  const sizes=['S','M','L','XL','FS'];
  $('#catalogueGrid').innerHTML=items.map((p,i)=>{
    const wa=`https://wa.me/${PHONE}?text=${encodeURIComponent('Halo Mey Fashion! Saya tertarik dengan '+p.name+'. Boleh tanya ukuran dan stoknya?')}`;
    return `<article class="shop-card" data-group="${p.group}"><button type="button" class="shop-photo" data-index="${i}" aria-label="Lihat detail ${esc(p.name)}"><span class="shop-badge">${esc(p.label)}</span><img src="${photo(p)}" alt="${esc(p.name)}" loading="lazy"><span class="shop-view">Lihat detail</span></button><div class="shop-body"><small class="shop-type">${esc(p.type)}</small><h3>${esc(p.name)}</h3><p class="shop-blurb">${esc(p.blurb)}</p><div class="shop-meta"><strong>${rupiah(p.price)}</strong><span class="shop-sizes" aria-label="Ukuran tersedia">${sizes.map(s=>`<i>${s}</i>`).join('')}</span></div><div class="shop-actions"><button type="button" class="shop-btn shop-btn-main" data-index="${i}">Lihat detail</button><a class="shop-btn shop-btn-wa" href="${wa}" target="_blank" rel="noopener noreferrer">Tanya admin</a></div></div></article>`;
  }).join('');
  $$('#catalogueGrid [data-index]').forEach(b=>b.addEventListener('click',()=>{
    const idx=+b.dataset.index;
    window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'});
    closeProduct();selectProduct(idx);
    setTimeout(()=>openProduct(idx),reducedMotion?80:650);
  }));
}
$$('#filters button').forEach(b=>b.addEventListener('click',()=>{
  $$('#filters button').forEach(x=>x.classList.toggle('chosen',x===b));
  $$('.shop-card').forEach(card=>card.hidden=b.dataset.filter!=='all'&&card.dataset.group!==b.dataset.filter);
}));

/* Nav and keyboard */
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(bagOpen)closeBag();else if(focused)closeProduct();return}
  if(bagOpen)return;
  if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
  if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
  if(window.scrollY>scene.clientHeight*.9)return;
  e.preventDefault();const n=chosen+(e.key==='ArrowLeft'?-1:1);
  if(focused)focusProduct(n);else selectProduct(n);
});
const navigation=$('#siteNav'),navLinks=$$('.desktop-nav a'),dock=$('.desktop-nav'),pill=$('#navPill'),bar=$('#navProgress');
const navSecs=navLinks.map(a=>$(a.getAttribute('href')));
const appTabs=$$('.app-tabs a');
let lastY=0,lastY2=0,spyIdx=0,navTick=false;
function movePill(a){if(!a||!pill)return;pill.style.width=a.offsetWidth+'px';pill.style.transform=`translateX(${a.offsetLeft}px)`;navLinks.forEach(x=>x.classList.toggle('nav-active',x===a));const sid=a.getAttribute('href').slice(1);appTabs.forEach(t=>{const on=(t.dataset.sec||'').split(' ').includes(sid);t.classList.toggle('tab-active',on);if(on)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current')})}
const max=()=>document.documentElement.scrollHeight-innerHeight;
function updateNav(){
  navTick=false;const y=scrollY;
  navigation.style.setProperty('--ny',Math.max(12,44-y)+'px');
  navigation.classList.toggle('sticky',y>30);
  document.body.classList.toggle('past-hero',y>Math.min(500,innerHeight*.6));
  if(Math.abs(y-lastY)>6){navigation.classList.toggle('tucked',y>lastY&&y>480&&innerWidth>860&&!bagOpen);lastY=y}
  if(innerWidth<=860){const down=y>lastY2;if(Math.abs(y-lastY2)>8){navigation.classList.toggle('compact',down&&y>140&&!bagOpen);lastY2=y}if(y<90)navigation.classList.remove('compact')}else navigation.classList.remove('compact');
  let i=0;navSecs.forEach((sec,k)=>{if(sec&&sec.getBoundingClientRect().top<innerHeight*.4)i=k});
  if(y>=max()-4)i=navLinks.length-1;
  if(i!==spyIdx){spyIdx=i;movePill(navLinks[i])}
  const mx2=max();bar.style.transform=`scaleX(${mx2>0?clamp(y/mx2,0,1):0})`;
}
window.addEventListener('scroll',()=>{if(!navTick){navTick=true;requestAnimationFrame(updateNav)}},{passive:true});
navLinks.forEach(a=>a.addEventListener('mouseenter',()=>movePill(a)));
dock.addEventListener('mouseleave',()=>movePill(navLinks[spyIdx]));
window.addEventListener('load',()=>{movePill(navLinks[spyIdx]);updateNav()});updateNav();

let resizeID=0;
window.addEventListener('resize',()=>{clearTimeout(resizeID);resizeID=setTimeout(()=>{geometry();updateTargets()},90)},{passive:true});
let hoverScene=false;
scene.addEventListener('mouseenter',()=>{hoverScene=true});
scene.addEventListener('mouseleave',()=>{hoverScene=false});
autoTimer=setInterval(()=>{if(document.hidden||focused||bagOpen||dragging||hoverScene)return;if(Date.now()-lastUserAction>12000)selectProduct((chosen+1)%items.length)},7200);
function init(){
  hero.dataset.state='browse';
  makePieces();geometry();updateTargets(true);makeCatalogue();updateCount();
  $('#year').textContent=new Date().getFullYear();
  const loader=$('#preloader');
  window.addEventListener('load',()=>{setTimeout(()=>loader.classList.add('loaded'),300)},{once:true});
  setTimeout(()=>loader.classList.add('loaded'),2100);
  if(reducedMotion)loader.classList.add('loaded');
}
init();

// V3 gallery: photos remain local and work offline.
(function(){const gallery=document.getElementById('galleryGrid');if(!gallery)return;gallery.innerHTML=items.slice(0,6).map((p,i)=>`<button class="gallery-tile" type="button" data-gallery="${i}" aria-label="Lihat ${esc(p.name)}"><img src="${photo(p,'model')}" alt="Inspirasi outfit ${esc(p.name)}" loading="lazy"><span>${esc(p.name)} <b>↗</b></span></button>`).join('');gallery.addEventListener('click',e=>{const b=e.target.closest('[data-gallery]');if(!b)return;const idx=+b.dataset.gallery;window.scrollTo({top:0,behavior:'smooth'});closeProduct();selectProduct(idx);setTimeout(()=>openProduct(idx),550)});})();

/* V4: hero parallax, pause offscreen, draggable collection rail */
new IntersectionObserver(([en])=>{heroSeen=en.isIntersecting;if(heroSeen)kickRender()}).observe(hero);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)kickRender()});
scene.addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
