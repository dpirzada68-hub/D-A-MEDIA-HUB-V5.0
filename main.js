(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
/* nav */
const nav=$('#nav'),burger=$('#burger');
const closeMenu=()=>{nav.classList.remove('open');burger.setAttribute('aria-expanded','false')};
burger.addEventListener('click',()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
$$('#menu a').forEach(a=>a.addEventListener('click',closeMenu));
const onS=()=>nav.classList.toggle('solid',scrollY>40);addEventListener('scroll',onS,{passive:true});onS();
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=$(a.getAttribute('href'));if(!t)return;e.preventDefault();t.scrollIntoView({behavior:RM?'auto':'smooth'})}));

/* loading screen (first open per session) + hero words (home) */
const h1=$('#h1'),intro=$('#intro');
const go=()=>{if(!h1)return;h1.classList.add('go');$('.hero-row')&&$('.hero-row').classList.add('go')};
if(h1)h1.innerHTML=h1.textContent.trim().split(' ').map((w,i)=>`<span class="w"><span style="transition-delay:${i*.07}s">${w}</span></span>`).join(' ');
if(intro&&!RM&&document.documentElement.classList.contains('intro-on')){
  const t0=performance.now(),MIN=2400;let loaded=document.readyState==='complete',done=false;
  addEventListener('load',()=>loaded=true);
  const pct=$('#pct'),bar=$('#pbar');let shown=0;
  const hide=()=>{if(done)return;done=true;intro.classList.add('out');setTimeout(go,500);setTimeout(()=>intro.remove(),1500)};
  (function tick(t){
    const el=t-t0,target=loaded?Math.min(100,(el/MIN)*100):Math.min(90,(el/MIN)*100);
    shown+=(target-shown)*.12;if(loaded&&el>=MIN)shown=100;
    const v=Math.min(100,Math.round(shown));pct.textContent=v;bar.style.setProperty('--p',shown/100);
    if(v>=100){setTimeout(hide,250);return}
    if(el>5000){hide();return}
    requestAnimationFrame(tick)})(t0);
}else{intro&&intro.remove();setTimeout(go,50)}

/* hero timeline canvas */
const cv=$('#tl');
if(cv){
  const cx=cv.getContext('2d'),tcEl=$('#tc');let W,H,tracks=[],base=0,seed=11;
  const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const build=()=>{const d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
    seed=11;tracks=[];const n=7,th=Math.max(30,Math.min(50,H/14)),gap=7,top=H*.13;
    for(let i=0;i<n;i++){let x=0;const clips=[];while(x<W*2.4){const w=70+rnd()*280;clips.push({x,w:w-4,a:.05+rnd()*.09,s:rnd()>.86});x+=w}
      tracks.push({y:top+i*(th+gap),h:th,len:x,clips,au:i>=5,sp:.5+i*.17,ph:rnd()*9})}};
  const draw=off=>{cx.clearRect(0,0,W,H);
    tracks.forEach(t=>{const o=off*t.sp;t.clips.forEach(c=>{const p=((c.x-o)%t.len+t.len)%t.len;
      for(const x of [p,p-t.len]){if(x>W||x+c.w<0)continue;
        cx.fillStyle=`rgba(255,255,255,${c.s?.3:c.a})`;cx.fillRect(x,t.y,c.w,t.h);
        cx.strokeStyle=c.s?'rgba(156,201,255,.6)':'rgba(255,255,255,.2)';cx.strokeRect(x+.5,t.y+.5,c.w-1,t.h-1);
        if(t.au){cx.fillStyle='rgba(255,255,255,.5)';for(let k=4;k<c.w-4;k+=3){const hh=(Math.abs(Math.sin((x+k)*.07+t.ph)*Math.sin((x+k)*.013))*.8+.1)*t.h*.8;cx.fillRect(x+k,t.y+(t.h-hh)/2,1.5,hh)}}}})});
    const f=Math.floor(off*.35),p2=n=>String(n).padStart(2,'0');
    tcEl.textContent=`00:${p2(Math.floor(f/1440)%60)}:${p2(Math.floor(f/24)%60)}:${p2(f%24)}`};
  build();addEventListener('resize',()=>{build();draw(base+scrollY*1.4)});
  if(RM)draw(0);else{let last=0;const loop=t=>{const dt=(t-last)/1000;last=t;if(scrollY<innerHeight*1.1){base+=dt*26;draw(base+scrollY*1.4)}requestAnimationFrame(loop)};requestAnimationFrame(loop)}
}

/* counters */
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const el=e.target,tg=+el.dataset.n;if(RM){el.textContent=tg;return}
    const t0=performance.now();(function s(t){const p=Math.min((t-t0)/1500,1);el.textContent=Math.round(tg*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(s)})(t0)}),{threshold:.6});
  $$('[data-n]').forEach(el=>{if(!RM)el.textContent=0;io.observe(el)});
}

/* statement lights up as you read */
const st=$('#statement');
if(st&&!RM){
  st.innerHTML=st.textContent.split(' ').map(w=>`<span>${w}</span>`).join(' ');const sp=$$('span',st);
  const f=()=>{const r=st.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.78-r.top)/(r.height+innerHeight*.36)));sp.forEach((s,i)=>s.style.opacity=i/sp.length<p?1:.16)};
  addEventListener('scroll',f,{passive:true});f();
}

/* workflow playhead follows scroll */
const sec=$('#pipeline');
if(sec&&!RM){
  const stages=$$('.stage'),ph=$('#plh'),lbl=$('#pls'),lane=$('#lane');sec.classList.add('js-pin');
  const f=()=>{const r=lane.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.75-r.top)/(r.height+innerHeight*.3)));
    ph.style.left=(p*100)+'%';let a=0;stages.forEach((s,i)=>{const on=p>=i*.25+.005;s.classList.toggle('on',on);if(on)a=i});lbl.textContent=stages[a].dataset.title};
  addEventListener('scroll',f,{passive:true});f();
}

/* portfolio filters */
$$('.cat button').forEach(b=>b.addEventListener('click',()=>{
  $$('.cat button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  const k=b.dataset.f;$$('.work article').forEach(a=>a.hidden=!(k==='all'||a.dataset.cat===k))}));

/* thumbnails: thumbs/<id>.jpg first, then Drive's own frame; otherwise the brand placeholder stays */
$$('.poster').forEach(p=>{const id=p.dataset.play,srcs=[`thumb-${id}.jpg`,`https://drive.google.com/thumbnail?id=${id}&sz=w1280`];
  (function t(k){if(k>=srcs.length)return;const im=new Image();im.referrerPolicy='no-referrer';im.alt='';
    im.onload=()=>{if(im.naturalWidth<120)return t(k+1);p.prepend(im)};im.onerror=()=>t(k+1);im.src=srcs[k]})(0)});

/* video player: every Drive video plays inside the site */
const modal=$('#modal'),slot=$('#slot');let lastBtn=null;
function openV(id,title,btn){lastBtn=btn;$('#mt').textContent=title||'Video';const T=(title||'Video').replace(/"/g,'');
  const ifr=`<iframe src="https://drive.google.com/file/d/${id}/preview" allow="autoplay; fullscreen" allowfullscreen title="${T}"></iframe>`;
  slot.innerHTML=`<video src="https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t" controls autoplay playsinline preload="auto" style="width:100%;height:100%;background:#000"></video>`;
  const v=slot.firstChild;let done=false;const fb=()=>{if(done||!slot.contains(v))return;done=true;slot.innerHTML=ifr};
  v.addEventListener('error',fb);v.addEventListener('playing',()=>{done=true});setTimeout(()=>{if(v.readyState===0)fb()},7000);
  $('#mo').href=`https://drive.google.com/file/d/${id}/view`;
  modal.classList.add('open');document.body.style.overflow='hidden';requestAnimationFrame(()=>{modal.classList.add('show');$('#mx').focus()})}
function closeV(){modal.classList.remove('show');setTimeout(()=>{modal.classList.remove('open');slot.innerHTML='';document.body.style.overflow='';lastBtn&&lastBtn.focus()},250)}
$$('[data-play]').forEach(b=>b.addEventListener('click',()=>openV(b.dataset.play,b.dataset.title,b)));
$('#mx').addEventListener('click',closeV);modal.addEventListener('click',e=>{if(e.target===modal)closeV()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeV()});

/* inline players (video-editing / portfolio embeds) are same buttons; Google Form (action and entry ids unchanged) */
const form=$('#gform');
if(form){let sent=false;const ok=$('#ok');
  form.addEventListener('submit',()=>{sent=true;$('#send').textContent='Sending...'});
  $('#hidden_gform_iframe').addEventListener('load',()=>{if(!sent)return;form.classList.add('hide');ok.style.display='block';$('#send').textContent='Send message'});
  $('#again').addEventListener('click',()=>{form.reset();form.classList.remove('hide');ok.style.display='none';sent=false})}
})();
