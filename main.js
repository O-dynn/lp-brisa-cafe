/* ============================================================
   Cafeteria Brisa — main.js
   Organização por setores + compactação leve
   ============================================================ */
"use strict";

/* ============================ UTIL ============================ */
const $=(sel,ctx=document)=>ctx.querySelector(sel);
const $$=(sel,ctx=document)=>Array.from(ctx.querySelectorAll(sel));
const rafScroll=(fn)=>{let ticking=false;return(...a)=>{if(!ticking){requestAnimationFrame(()=>{fn(...a);ticking=false});ticking=true}}};
const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================ MENU MOBILE ============================ */
(()=>{const btn=$('#btnMenu'),nav=$('.menu'),body=document.body;if(!btn||!nav)return;
  const onDocClick=(e)=>{if(!nav.contains(e.target)&&e.target!==btn) close();};
  const onDocKey=(e)=>{if(e.key==='Escape') close();};
  const open=()=>{body.classList.add('menu-open');btn.setAttribute('aria-expanded','true');btn.setAttribute('aria-label','Fechar menu móvel');$('a',nav)?.focus({preventScroll:true});document.addEventListener('click',onDocClick,{capture:true});document.addEventListener('keydown',onDocKey)};
  const close=()=>{body.classList.remove('menu-open');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Abrir menu móvel');document.removeEventListener('click',onDocClick,{capture:true});document.removeEventListener('keydown',onDocKey)};
  const toggle=()=>body.classList.contains('menu-open')?close():open();
  btn.addEventListener('click',toggle);
  $$('.menu a').forEach(a=>a.addEventListener('click',close));
  const mq=matchMedia('(min-width:981px)'); mq.addEventListener?.('change',e=>{if(e.matches) close()});
})();

/* ============================ HEADER + VOLTAR AO TOPO ============================ */
(()=>{const header=$('.site-header'),btnTop=$('#btnTop');
  const onScroll=()=>{const y=scrollY||pageYOffset; if(header) header.classList.toggle('scrolled',y>10); if(btnTop) btnTop.classList.toggle('show',y>600);};
  addEventListener('scroll',rafScroll(onScroll),{passive:true}); onScroll();
  btnTop?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
})();

/* ============================ GALERIA (slider) ============================ */
(()=>{const viewport=$('#gViewport')||$('.g-viewport'),prev=$('.g-prev'),next=$('.g-next'); if(!viewport) return;
  const slides=$$('img',viewport); if(slides.length<=1){prev?.setAttribute('hidden','true'); next?.setAttribute('hidden','true'); return;}

  // Normalizações dos slides
  slides.forEach(el=>{el.style.flex='0 0 100%'; el.style.minWidth='100%'; try{ if(el.loading==='lazy') el.loading='eager'; }catch{}});
  const supportsMask=CSS.supports?.('mask-image','linear-gradient(#000,#000)')||CSS.supports?.('-webkit-mask-image','linear-gradient(#000,#000)');
  if(!supportsMask) viewport.classList.add('no-mask');

  // Acessibilidade
  viewport.setAttribute('role','group');
  viewport.setAttribute('aria-roledescription','carrossel de imagens');
  viewport.setAttribute('tabindex','0');

  let i=0, timer=null; const AUTOPLAY_MS=6000;
  const go=(n)=>{i=(n+slides.length)%slides.length; viewport.style.transform=`translateX(-${i*100}%)`;};
  const stop=()=>{if(timer){clearInterval(timer); timer=null;}};
  const start=()=>{if(prefersReduced) return; stop(); timer=setInterval(()=>go(i+1),AUTOPLAY_MS);};

  // Controles
  prev?.addEventListener('click',()=>{go(i-1); start()});
  next?.addEventListener('click',()=>{go(i+1); start()});

  // Teclado
  viewport.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(i-1);start()} if(e.key==='ArrowRight'){e.preventDefault();go(i+1);start()}});

  // Swipe (mobile)
  let touchX=null; const SWIPE_MIN=30;
  viewport.addEventListener('touchstart',e=>{touchX=e.touches?.[0]?.clientX??null},{passive:true});
  viewport.addEventListener('touchend',e=>{if(touchX==null) return; const dx=(e.changedTouches?.[0]?.clientX??touchX)-touchX; if(Math.abs(dx)>SWIPE_MIN){go(dx>0?i-1:i+1); start()} touchX=null},{passive:true});

  // Pausas inteligentes
  const gallery=viewport.closest('.gallery');
  gallery?.addEventListener('mouseenter',stop); gallery?.addEventListener('mouseleave',start);
  gallery?.addEventListener('focusin',stop);   gallery?.addEventListener('focusout',start);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());

  // Autoplay somente quando visível
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?start():stop()),{threshold:.35});
  if(gallery) io.observe(gallery);

  // Estado inicial
  go(0);
})();
