(function(){
const g=document.getElementById('mediaGallery'),lb=document.getElementById('mgLb');if(!g||!lb)return;
const st=document.getElementById('mgStage'),cap=document.getElementById('mgCap');
const vids=[...g.querySelectorAll('video')];
const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting){v.play().catch(()=>{})}else v.pause()}),{threshold:.35});
vids.forEach(v=>io.observe(v));
function close(){lb.hidden=true;st.innerHTML='';document.body.style.overflow=''}
g.addEventListener('click',e=>{const b=e.target.closest('.mg-item');if(!b)return;
st.innerHTML=b.dataset.type==='vid'?`<video src="${b.dataset.src}" controls autoplay loop playsinline></video>`:`<img src="${b.dataset.src}" alt="">`;
cap.textContent=b.dataset.cap;lb.hidden=false;document.body.style.overflow='hidden'});
lb.addEventListener('click',e=>{if(e.target===lb||e.target.closest('.mg-x'))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lb.hidden)close()});
})();
