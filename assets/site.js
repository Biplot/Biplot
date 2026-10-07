(() => {
  'use strict';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ MENÚ: sólido al bajar, sección actual y menú de celular ============ */
  (function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const solid = () => nav.classList.toggle('is-solid', window.scrollY > 40);
    solid();
    window.addEventListener('scroll', solid, { passive: true });

    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (toggle && menu) {
      const set = (open) => {
        menu.classList.toggle('open', open);
        nav.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar el menú' : 'Abrir el menú');
      };
      toggle.addEventListener('click', () => set(!menu.classList.contains('open')));
      menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) { set(false); toggle.focus(); } });
    }

    const links = [...nav.querySelectorAll('.nav-links a[href^="#"]')];
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove('is-current'));
        const a = byId.get(entry.target.id);
        if (a) a.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => io.observe(s));
  })();

  /* ============ PORTADA: pausar el movimiento del fondo ============ */
  (function initHeroPause() {
    const hero = document.getElementById('hero');
    const btn = document.getElementById('heroPause');
    if (!hero || !btn) return;
    btn.addEventListener('click', () => {
      const paused = hero.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', String(paused));
      btn.setAttribute('aria-label', paused ? 'Reanudar el movimiento de la portada' : 'Pausar el movimiento de la portada');
    });
  })();

  /* ============ FORMULARIOS: arman el mensaje y abren WhatsApp ============ */
  const WA_NUMBER = '56966275675';
  document.querySelectorAll('form[data-wa]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const val = (n) => { const el = form.elements.namedItem(n); return el && el.value ? el.value.trim() : ''; };
      const name = val('name'), email = val('email'), message = val('message');
      let text = 'Hola BiPlot 👋';
      if (name) text += ', soy ' + name;
      text += '. Quiero agendar un diagnóstico.';
      if (message) text += '\n\nMi proceso: ' + message;
      if (email) text += '\n\nMi correo: ' + email;
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      const ok = form.nextElementSibling;
      if (ok && ok.classList.contains('wa-ok')) { form.hidden = true; ok.hidden = false; }
    });
  });

  /* ============ CASOS: al pasar el cursor, la tarjeta muestra su video en silencio ============ */
  (function initCasePreviews() {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.case-card[data-preview]').forEach((card) => {
      const media = card.querySelector('.case-media');
      let vid = null;
      card.addEventListener('mouseenter', () => {
        if (!vid) {
          vid = document.createElement('video');
          vid.muted = true; vid.loop = true; vid.playsInline = true;
          vid.setAttribute('aria-hidden', 'true');
          vid.src = card.dataset.preview;
          media.insertBefore(vid, media.querySelector('.case-cap'));
          vid.addEventListener('playing', () => card.classList.add('is-playing'));
        }
        vid.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-playing');
        if (vid) { try { vid.pause(); } catch (e) {} }
      });
    });
  })();

  /* ============ SCROLL REVEALS ============ */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in'); revealIO.unobserve(entry.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .reveal-group').forEach(el => revealIO.observe(el));

  /* ============ METHOD STEPS (light dots on view) ============ */
  const methodSteps = [...document.querySelectorAll('[data-step]')];
  if (methodSteps.length) {
    const stepIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in'); });
    }, { threshold: 0.4 });
    methodSteps.forEach(s => stepIO.observe(s));
  }

  /* ============ METHOD: la curva del isotipo une los pasos (en escritorio) ============ */
  (function initMethodCurve() {
    const method = document.querySelector('.method');
    const svg = method && method.querySelector('.method-curva');
    if (!svg) return;
    const path = svg.querySelector('path');
    function draw() {
      const r = method.getBoundingClientRect();
      const pts = [...method.querySelectorAll('.method-step .dot')].map((d) => {
        const b = d.getBoundingClientRect();
        return [b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top];
      });
      svg.setAttribute('viewBox', `0 0 ${r.width.toFixed(1)} ${r.height.toFixed(1)}`);
      path.setAttribute('d', pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '));
    }
    draw();
    window.addEventListener('resize', draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { method.classList.add('in'); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(method);
  })();

  /* ============ FAQ ACCORDION ============ */
  document.querySelectorAll('[data-faq]').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('[data-faq].open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ============ BiPlot HQ: la visita guiada con Plotty ============ */
  // Vertical en pantallas angostas y horizontal en las demás; se descarga recién cuando la sección está a la vista,
  // se reproduce muda mientras se ve (salvo con "reducir movimiento") y se pausa al salir.
  (function initHQ() {
    const frame = document.getElementById('hqFrame');
    const vid = document.getElementById('hqVideo');
    if (!frame || !vid) return;
    const vertical = window.matchMedia('(max-width:700px)').matches;
    const src = vertical ? frame.dataset.srcV : frame.dataset.srcH;
    vid.poster = vertical ? frame.dataset.posterV : frame.dataset.posterH;
    const expand = frame.querySelector('.js-openvid');
    if (expand) expand.dataset.src = src;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let loaded = false;
    const load = () => { if (!loaded) { vid.src = src; loaded = true; } };
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { load(); if (!reduce || !vid.muted) vid.play().catch(() => {}); }
        else { try { vid.pause(); } catch (e) {} }
      });
    }, { threshold: 0.35 }).observe(frame);
    const sound = document.getElementById('hqSound');
    if (sound) sound.addEventListener('click', () => {
      load();
      vid.muted = !vid.muted;
      const on = !vid.muted;
      sound.classList.toggle('on', on);
      sound.setAttribute('aria-pressed', String(on));
      sound.setAttribute('aria-label', on ? 'Silenciar la visita' : 'Activar sonido de la visita');
      if (on) vid.play().catch(() => {});
    });
  })();

  /* ============ VISOR DE VIDEO (portada, casos y la visita) ============ */
  (function initLightbox() {
    const lb = document.getElementById('vlightbox');
    const lbVid = document.getElementById('vlightboxVideo');
    const lbClose = document.getElementById('vlightboxClose');
    if (!lb || !lbVid) return;
    function openLB(src) {
      if (!src) return;
      lbVid.src = src;
      lb.classList.add('open');
      lbVid.play().catch(() => {});
      document.body.style.overflow = 'hidden';
    }
    function closeLB() {
      lb.classList.remove('open');
      try { lbVid.pause(); } catch (e) {}
      lbVid.removeAttribute('src');
      lbVid.load();
      document.body.style.overflow = '';
    }
    document.querySelectorAll('.js-openvid').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); e.preventDefault();
        const vertical = btn.dataset.srcV && window.matchMedia('(max-width:700px) and (orientation:portrait)').matches;
        openLB(vertical ? btn.dataset.srcV : btn.dataset.src);
      });
    });
    if (lbClose) lbClose.addEventListener('click', closeLB);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLB(); });
  })();

  /* ============ PLOTLINE TEASER CAROUSEL ============ */
  (function initPlotlineCarousel() {
    const track = document.getElementById('plTrack');
    if (!track) return;
    const slides = [...track.querySelectorAll('.pl-slide')];
    const dotsWrap = document.getElementById('plDots');
    const prevBtn = document.getElementById('plPrev');
    const nextBtn = document.getElementById('plNext');
    const viewport = track.parentElement;
    let index = 0;
    const total = slides.length;
    const reduceMotionPl = matchMedia('(prefers-reduced-motion: reduce)').matches;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Ir a la época ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(dot);
    });
    const dots = [...dotsWrap.children];

    function goTo(i, userInitiated) {
      index = (i + total) % total;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
      slides.forEach((s, si) => s.classList.toggle('pl-active', si === index));
      if (userInitiated) restartAutoplay();
    }
    prevBtn.addEventListener('click', () => goTo(index - 1, true));
    nextBtn.addEventListener('click', () => goTo(index + 1, true));

    /* swipe */
    let startX = null;
    viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1), true);
      startX = null;
    }, { passive: true });

    /* keyboard, when the carousel has focus/hover */
    const carouselWrap = document.querySelector('.pl-carousel-wrap');
    carouselWrap.setAttribute('tabindex', '0');
    carouselWrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1, true); }
    });

    /* autoplay, paused on hover/focus, off entirely under reduced motion */
    let autoplayId = null;
    function startAutoplay() {
      if (reduceMotionPl) return;
      stopAutoplay();
      autoplayId = setInterval(() => goTo(index + 1, false), 5500);
    }
    function stopAutoplay() { if (autoplayId) { clearInterval(autoplayId); autoplayId = null; } }
    function restartAutoplay() { if (!reduceMotionPl) { stopAutoplay(); startAutoplay(); } }
    carouselWrap.addEventListener('mouseenter', stopAutoplay);
    carouselWrap.addEventListener('mouseleave', startAutoplay);
    carouselWrap.addEventListener('focusin', stopAutoplay);
    carouselWrap.addEventListener('focusout', startAutoplay);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopAutoplay(); else startAutoplay(); });

    const carouselIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) startAutoplay(); else stopAutoplay(); });
    }, { threshold: 0.3 });
    carouselIO.observe(carouselWrap);

    goTo(0, false);
  })();

  /* pause offscreen/hidden-tab animation loops */
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('paused', document.hidden);
  });
})();
