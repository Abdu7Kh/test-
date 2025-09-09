/* ============== MOBILE MENU TOGGLE ============== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMobile(){
  const open = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('no-scroll', open);
  if(open){
    mobileMenu.hidden = false;
    void mobileMenu.offsetWidth; // reflow
    mobileMenu.classList.add('show');
  }else{
    mobileMenu.classList.remove('show');
    setTimeout(()=>{ mobileMenu.hidden = true; }, 220);
  }
}
if (hamburger) hamburger.addEventListener('click', toggleMobile);

/* ============== MOBILE ACCORDION ============== */
document.querySelectorAll('.m-acc').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id = btn.dataset.acc;
    const panel = document.getElementById(id);
    const isHidden = panel.hasAttribute('hidden');
    document.querySelectorAll('.m-sub').forEach(p=>{ p.hidden = true; });
    panel.hidden = !isHidden;
  });
});

/* ============== DROPDOWN FOCUS (A11Y) ============== */
document.querySelectorAll('.dropdown').forEach(dd=>{
  const trigger = dd.querySelector('.drop__trigger');
  const menu = dd.querySelector('.drop__menu');
  trigger.addEventListener('focus', ()=> menu.style.opacity = 1);
  trigger.addEventListener('blur',  ()=> menu.style.opacity = null);
});

/* ============== REVEAL ON SCROLL ============== */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const d = e.target.dataset.delay || '0ms';
      e.target.style.setProperty('--reveal-delay', d);
      e.target.classList.add('show');
      io.unobserve(e.target);
    }
  });
},{ threshold: 0.12 });
document.querySelectorAll('.reveal, .exp__bullets li').forEach(el=> io.observe(el));

/* ============== ROTATING MARKETING TEXT ============== */
const rotatorEl = document.getElementById('rotator');
if (rotatorEl){
  const words = JSON.parse(rotatorEl.getAttribute('data-words'));
  let i = 0;
  setInterval(()=>{
    i = (i + 1) % words.length;
    rotatorEl.style.opacity = 0;
    setTimeout(()=>{ rotatorEl.textContent = words[i]; rotatorEl.style.opacity = 1; }, 180);
  }, 2200);
}

/* ============== HERO VIDEO (mute+play) ============== */
const video = document.getElementById('heroVideo');
if (video){
  video.muted = true;
  const attempt = video.play();
  if (attempt !== undefined) attempt.catch(()=>{});
}

/* ============== SMOOTH SCROLL + PAGE FADE ============== */
const pageFade = document.getElementById('pageFade');
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if(el){
      e.preventDefault();
      pageFade && pageFade.classList.add('in');
      setTimeout(()=>{
        el.scrollIntoView({behavior:'smooth', block:'start'});
        setTimeout(()=> pageFade && pageFade.classList.remove('in'), 500);
      }, 120);
      if (!mobileMenu.hidden) toggleMobile();
    }
  });
});

/* ============== RIPPLE EFFECTS ============== */
function addRipple(e){
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple-anim';
  ripple.style.left = (e.clientX - rect.left) + 'px';
  ripple.style.top  = (e.clientY - rect.top) + 'px';
  target.appendChild(ripple);
  ripple.addEventListener('animationend', ()=> ripple.remove());
}
['.btn','.navlink','.drop__item','.m-link','.m-sublink','.m-acc','.fab__main','.fab__item'].forEach(sel=>{
  document.querySelectorAll(sel).forEach(el=> el.addEventListener('pointerdown', addRipple));
});

/* ============== FAB CONTACT MENU ============== */
const fab = document.getElementById('fab');
const fabMain = document.getElementById('fabMain');
if (fabMain){
  fabMain.addEventListener('click', ()=>{
    const open = fab.classList.toggle('open');
    fabMain.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* ================================================================== */
/* ================== SERVICES: ORBIT (Desktop) ====================== */
/* ================================================================== */
function orbitDesktop(orbit){
  const items  = Array.from(orbit.querySelectorAll('.orbItem'));
  const spokes = Array.from(orbit.querySelectorAll('.spoke2'));
  const center = orbit.querySelector('.centerDisc2');
  const N = items.length;
  let rot = 0;
  let running = true;
  let rafId;

  orbit.classList.remove('stackMode');
  orbit.classList.add('orbitMode');

  function layout(){
    const rect = orbit.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);

    const card = items[0].querySelector('.card2');
    const nodeW = card.offsetWidth;
    const nodeH = card.offsetHeight || 160;
    const node   = Math.max(nodeW, nodeH);
    const margin = 24;

    const R = (size/2) - (node/2) - margin;
    const discR = center.offsetWidth / 2;
    const step = (2*Math.PI)/N;

    items.forEach((item, i)=>{
      const angle = rot + i*step - Math.PI/2;
      const deg = angle * 180 / Math.PI;

      // موضع البطاقة على المحيط
      item.style.transform =
        `translate(-50%,-50%) rotate(${deg}deg) translate(${R}px) rotate(${-deg}deg)`;

      // ✅ موضع الشعاع: بداية الخط من مركز الدائرة تمامًا
      const spoke = spokes[i];
      if (spoke){
        // .spoke2 لديها transform-origin:left center في CSS
        spoke.style.transform =
          `translateY(-50%) rotate(${deg}deg) translateX(${discR}px)`;
        spoke.style.width = (R - discR + node*0.5 - 8) + 'px';
      }
    });
  }

  function tick(){
    if(running){ rot += 0.0035; layout(); }
    rafId = requestAnimationFrame(tick);
  }

  function onEnter(){ running=false }
  function onLeave(){ running=true }
  orbit.addEventListener('mouseenter', onEnter);
  orbit.addEventListener('mouseleave', onLeave);
  window.addEventListener('resize', layout);

  layout();
  tick();

  // cleanup
  return ()=>{ cancelAnimationFrame(rafId); orbit.removeEventListener('mouseenter', onEnter); orbit.removeEventListener('mouseleave', onLeave); window.removeEventListener('resize', layout); };
}

/* ================================================================== */
/* ================== SERVICES: STACK (Mobile) ======================= */
/* ================================================================== */
function stackMobile(orbit){
  const items  = Array.from(orbit.querySelectorAll('.orbItem'));
  orbit.classList.remove('orbitMode');
  orbit.classList.add('stackMode');

  // تأثير ظهور على البطاقات عند التمرير
  items.forEach(it=>{
    const card = it.querySelector('.card2');
    card.classList.add('reveal');
    io.observe(card);
  });

  return ()=>{ orbit.classList.remove('stackMode'); items.forEach(it=> it.querySelector('.card2').classList.remove('reveal')); };
}

/* اختيار وضع الخدمات حسب المقاس */
function initOrbit(){
  const orbit = document.getElementById('orbit');
  if(!orbit) return;

  const mql = window.matchMedia('(max-width: 680px)');
  let destroy = ()=>{};
  function setup(){
    destroy();
    destroy = mql.matches ? stackMobile(orbit) : orbitDesktop(orbit);
  }
  setup();
  if (mql.addEventListener) mql.addEventListener('change', setup);
  else mql.addListener(setup);
}
document.addEventListener('DOMContentLoaded', initOrbit);

/* ============== REDUCED MOTION ============== */
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.querySelectorAll('.btn, .navlink, .drop__menu, .reveal').forEach(el=>{
    el.style.transitionDuration = '0s';
    el.style.animation = 'none';
  });
}
