/* MEY FASHION V6 — animasi dari referensi Kebab Sumatera (wave, riak, split kata, marker, velocity) dan Amel UMKM (loader, runway text, Lenis). */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,rand=(a,b)=>a+Math.random()*(b-a);
const cur=$('#curtain');
if(!window.gsap||!window.ScrollTrigger){cur&&cur.remove();return}
gsap.registerPlugin(ScrollTrigger);document.documentElement.classList.add('mf-on');
const mk=(t,c)=>{const e=document.createElement(t);e.className=c;return e};

/* Smooth scroll (Lenis) */
let lenis=null;
if(window.Lenis&&!reduce){
  lenis=new Lenis({lerp:.1,wheelMultiplier:.95});document.documentElement.classList.add('lenis','lenis-smooth');
  lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=$(a.getAttribute('href'));if(!t)return;e.preventDefault();lenis.scrollTo(t,{offset:-70,duration:1.5})}));
  const orig=window.scrollTo.bind(window);
  window.scrollTo=function(a,b){if(a&&typeof a==='object'&&a.top!=null){lenis.scrollTo(a.top,{duration:1.2,immediate:a.behavior==='instant'});return}return orig(a,b)};
  new MutationObserver(()=>document.body.classList.contains('lock-scroll')?lenis.stop():lenis.start()).observe(document.body,{attributes:true,attributeFilter:['class']});
}

/* Pecah kata untuk judul */
function split(n,c){[...n.childNodes].forEach(k=>{if(k.nodeType===3){const f=document.createDocumentFragment();k.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(' '));return}const w=mk('span','w'),x=mk('span','wi');x.style.setProperty('--w',c.i++);x.textContent=t;w.appendChild(x);f.appendChild(w)});k.replaceWith(f)}else if(k.nodeType===1&&k.tagName!=='BR')split(k,c)})}
const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');sio.unobserve(e.target)}}),{threshold:.3});
$$('.section-title h2,.about-layout h2,.lookbook-text h2,.closer h2').forEach(h=>{split(h,{i:0});h.classList.add('sw');sio.observe(h)});
const h1=$('.hero h1');if(h1){split(h1,{i:0});h1.classList.add('sw')}

/* Muncul: tirai terbuka (kartu, galeri, langkah, FAQ) */
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting||e.boundingClientRect.top<0){e.target.classList.add('in');rio.unobserve(e.target)}}),{threshold:0,rootMargin:'0px 0px -4% 0px'});
function tagRv(){$$('.shop-card,.gallery-tile,.steps li,.trust-item,.contact-card,.faq details,.about-facts>div,.lookbook-features>div').forEach((el,i,all)=>{if(el._rv)return;el._rv=1;el.classList.add('rv');el.style.setProperty('--i',(i%4));rio.observe(el)})}
tagRv();[600,1800].forEach(t=>setTimeout(tagRv,t));

/* Gelombang per section + reaksi kecepatan scroll (ref kebab wave-pro) */
const rng=s=>()=>(s=s*16807%2147483647)/2147483647;
const smooth=p=>{let d=`M${p[0][0]} ${p[0][1]}`;for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;d+=`C${(b[0]+(c[0]-a[0])/6).toFixed(1)} ${(b[1]+(c[1]-a[1])/6).toFixed(1)} ${(c[0]-(e[0]-b[0])/6).toFixed(1)} ${(c[1]-(e[1]-b[1])/6).toFixed(1)} ${c[0]} ${c[1]}`}return d};
function layer(seed){const r=rng(seed*977+13),T=900,H=900,d=mk('div','wl-layer'),ph=r()*6,ph2=r()*6;d.setAttribute('aria-hidden','true');
  const band=(y,A,k)=>{const p=[];for(let x=-T;x<=3*T;x+=T/6){const t=x/T*Math.PI*2;p.push([x,y+Math.sin(t*k+ph)*A+Math.sin(t*2*k+ph2)*A*.35])}return smooth(p)+`L${3*T} ${H+300}L${-T} ${H+300}Z`};
  d.innerHTML=`<svg viewBox="0 0 1800 900" preserveAspectRatio="xMidYMid slice"><path class="wf a" d="${band(H*.22,120,1)}"/><path class="wf b" d="${band(H*.5,140,1)}"/><path class="wf c" d="${band(H*.78,110,2)}"/></svg>`;return d}
const hosts=$$('.collection-section,.gallery-section,.lookbook-section,.order-section,.about-section,.location-section,.closer');
hosts.forEach((h,i)=>{h._s=i+1;h.classList.add('mf-wave');h.prepend(layer(i+1))});
const vis=new Set(),vio=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target)),{rootMargin:'120px'});hosts.forEach(h=>vio.observe(h));
const strap=$('.moving-strap>div');let last=scrollY,sv=0;
(function tick(t){const y=scrollY;sv+=(Math.max(-1,Math.min(1,(y-last)/55))-sv)*.1;last=y;
  if(!reduce){vis.forEach(h=>{const sg=h._svg||(h._svg=$('.wl-layer svg',h));sg.style.transform=`translate3d(${(Math.sin(t/5200+h._s)*34-sv*60).toFixed(1)}px,${((h.offsetTop-y)*.05).toFixed(1)}px,0)`});
    if(strap&&Math.abs(sv)>.02){const an=strap.getAnimations()[0];an&&an.updatePlaybackRate(1+Math.abs(sv)*5)}}
  requestAnimationFrame(tick)})(0);

/* Runway text: tiga baris kata raksasa bergeser berlawanan arah saat scroll (ref amel) */
const lb=$('.lookbook-section');
if(lb){const W=['STREET · SOFT · Y2K · GRUNGE · SWEET · ','COZY · EDGY · MEY FASHION · NEW DROP · ','SWEET · Y2K · GRUNGE · SOFT · STREET · '],rw=mk('div','runway');rw.setAttribute('aria-hidden','true');
  rw.innerHTML=W.map(w=>`<p><span>${w.repeat(4)}</span></p>`).join('');lb.prepend(rw);
  if(!reduce)$$('p span',rw).forEach((s,i)=>gsap.fromTo(s,{xPercent:i%2?-40:0},{xPercent:i%2?0:-40,ease:'none',scrollTrigger:{trigger:lb,start:'top bottom',end:'bottom top',scrub:1}}));
  const im=$('.lookbook-visual img',lb);if(im&&!reduce)gsap.fromTo(im,{yPercent:6,scale:1.04},{yPercent:-6,scale:1,ease:'none',scrollTrigger:{trigger:lb,start:'top bottom',end:'bottom top',scrub:1}})}
$$('.about-facts b').forEach(b=>{const n=parseInt(b.textContent,10);if(!n||reduce)return;const o={v:0};b.textContent='0';ScrollTrigger.create({trigger:b,start:'top 90%',once:true,onEnter:()=>gsap.to(o,{v:n,duration:1.4,ease:'power2.out',onUpdate:()=>b.textContent=Math.round(o.v)})})});

/* Bintang melayang di penutup (ref amel: biji kopi naik) */
const cl=$('.closer');
if(cl&&!reduce)for(let i=0;i<10;i++){const s=mk('span','mf-star');s.textContent=i%3?'✦':'✧';s.style.cssText=`font-size:${rand(14,40)}px;left:${rand(2,96)}%;top:0;opacity:${rand(.25,.6)}`;cl.appendChild(s);
  gsap.fromTo(s,{y:()=>cl.clientHeight+60,rotation:rand(0,90)},{y:-80,x:`+=${rand(-50,50)}`,rotation:`+=${rand(-200,200)}`,duration:rand(8,15),delay:rand(0,8),repeat:-1,ease:'none'})}

/* Hero: kata raksasa, cincin putar, riak warna per look (ref kebab) */
const hero=$('.hero'),WORDS=['EDGY!','COZY!','Y2K!','SOFT!','GRUNGE!','SWEET!'],WASH=['#ff5fa2','#8d9bff','#e7c36a','#5fd6a0','#9a6bff','#ff8fbf'];
const grad=c=>`radial-gradient(ellipse 58% 72% at 50% 52%,${c} 0%,${c}00 72%)`;const wash=mk('div','hero-wash'),rip=mk('div','hero-ripple'),r1=mk('div','hero-ring'),r2=mk('div','hero-ring'),halo=mk('div','hero-halo'),word=mk('div','hero-word');
word.setAttribute('aria-hidden','true');$('.hero-grain').after(wash,rip,word);
const idx=()=>(typeof chosen==='number'?chosen:0),center=()=>{const g=typeof garments!=='undefined'&&garments[idx()];const hr=hero.getBoundingClientRect();if(!g)return{x:hr.width*.6,y:hr.height*.5,w:300};const r=g.el.getBoundingClientRect();return{x:r.left+r.width/2-hr.left,y:r.top+r.height/2-hr.top,w:Math.max(r.width,r.height)}};
let ww=0,lx=-9999,ly=0;
(function follow(){
  if(typeof garments!=='undefined'&&!document.hidden){const g=garments[idx()];
    if(g){const w=pieceW*g.s,cx=g.x+pieceW/2,cy=g.y+g.el.offsetHeight/2;
      if(Math.abs(cx-lx)>.4||Math.abs(cy-ly)>.4){lx=cx;ly=cy;const d=w*1.1;halo.style.width=halo.style.height=d+'px';halo.style.translate=`${cx-d/2}px ${cy-d/2}px`;
        if(!ww)ww=word.offsetWidth;word.style.translate=`${cx-ww/2}px ${Math.max(60,cy-w*.95)}px`}}}
  requestAnimationFrame(follow)})();
let wordIdx=-1;
function setWord(i,first){if(i===wordIdx)return;wordIdx=i;word.textContent=WORDS[i]||'';word.style.webkitTextStroke='2px '+(WASH[i]||'#fff');ww=0;lx=-9999;
  if(!reduce)gsap.fromTo(word,{opacity:0,scale:.7,y:40},{opacity:1,scale:1,y:0,duration:.9,delay:first?.8:.45,ease:'back.out(1.8)'});else word.style.opacity=1}
function ripple(i){const c=center(),hr=hero.getBoundingClientRect(),R=Math.hypot(Math.max(c.x,hr.width-c.x),Math.max(c.y,hr.height-c.y))+40;
  rip.style.background=grad(WASH[i]);rip.animate([{clipPath:`circle(0px at ${c.x}px ${c.y}px)`},{clipPath:`circle(${R}px at ${c.x}px ${c.y}px)`}],{duration:1000,easing:'cubic-bezier(.7,0,.2,1)'}).finished.then(()=>{wash.style.background=grad(WASH[i]);rip.style.clipPath='circle(0 at 50% 50%)'}).catch(()=>{})}
const lc=$('#lookCount');
if(lc)new MutationObserver(()=>{const i=parseInt(lc.textContent,10)-1;if(i<0||i===wordIdx)return;if(!reduce)ripple(i);else wash.style.background=grad(WASH[i]);setWord(i)}).observe(lc,{childList:true,characterData:true,subtree:true});
wash.style.background=grad(WASH[0]);

/* Kursor cincin */
if(false){const ring=mk('div','');ring.id='cursorRing';document.body.appendChild(ring);
  addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;document.body.classList.add('has-ring');ring.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;
    const t=e.target.closest&&e.target.closest('a,button,.rack-piece,.shop-photo,.gallery-tile,summary');ring.classList.toggle('hov',!!t);ring.textContent=t&&t.closest('.rack-piece,.shop-photo,.gallery-tile')?'LIHAT':''},{passive:true})}

/* Loader: hitung 0-100, logo berguncang, bintang meledak, tirai terbelah (ref amel) */
function heroIn(){
  try{updateTargets(true)}catch(_){}
  h1&&h1.classList.add('in');setWord(idx(),true);
  gsap.from('.site-nav',{yPercent:-160,opacity:0,duration:1,ease:'power4.out',clearProps:'transform,opacity'});
  gsap.from('.hero-headline > :not(h1)',{y:30,opacity:0,duration:.9,stagger:.12,delay:.5,ease:'power3.out',clearProps:'transform,opacity'});
  gsap.from('.hero-floor-controls',{y:40,opacity:0,duration:.9,delay:.7,ease:'power3.out',clearProps:'transform,opacity'});
}
function burst(){const box=$('.cu-burst');for(let i=0;i<22;i++){const s=document.createElement('i');s.textContent=i%3?'✦':'✧';s.style.cssText=`font-size:${rand(16,44)}px;color:${['#ff9fc8','#fff2e4','#e2c68f','#ff6f9d'][i%4]}`;box.appendChild(s);
  gsap.timeline({onComplete:()=>s.remove()}).fromTo(s,{x:0,y:0,rotation:0,scale:.4},{x:rand(-.45,.45)*innerWidth,y:-rand(.15,.5)*innerHeight,rotation:rand(-300,300),scale:1,duration:.6,ease:'power2.out'}).to(s,{y:innerHeight*.7,opacity:0,rotation:'+=200',duration:1,ease:'power2.in'})}}
if(!cur){heroIn();return}
if(reduce){cur.remove();setWord(idx(),true);return}
lenis&&lenis.stop();
const num=$('#cuNum'),cnt={v:0};
gsap.from('.cu-logo',{scale:.4,opacity:0,y:60,duration:1,ease:'back.out(1.6)'});
const bob=gsap.to('.cu-logo',{y:-10,rotation:3,duration:1.1,yoyo:true,repeat:-1,ease:'sine.inOut'});
gsap.timeline({delay:.3}).to(cnt,{v:100,duration:2.2,ease:'power2.inOut',onUpdate:()=>num.firstChild.textContent=Math.round(cnt.v)}).add(()=>{
  bob.kill();
  gsap.timeline({onComplete:()=>{cur.remove();lenis&&lenis.start()}})
    .to('.cu-num,.cu-cap',{opacity:0,y:20,duration:.35})
    .to('.cu-logo',{y:0,rotation:-5,duration:.07,repeat:5,yoyo:true,ease:'sine.inOut'},0)
    .add(burst,'>')
    .to('.cu-core',{scale:1.2,opacity:0,duration:.45,ease:'power2.in'},'>-.05')
    .to('.cp-l',{xPercent:-101,duration:1.1,ease:'power4.inOut'},'<.1')
    .to('.cp-r',{xPercent:101,duration:1.1,ease:'power4.inOut'},'<')
    .add(heroIn,'-=.85')});
setTimeout(()=>{if(document.body.contains(cur)){cur.remove();lenis&&lenis.start()}},9000);
})();
