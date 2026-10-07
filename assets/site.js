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

  /* ============ PORTADA: el video de fondo (de qué trata BiPlot) ============ */
  // Vertical en celular parado y horizontal en lo demás; con «reducir movimiento» queda el cuadro fijo.
  // Se pausa fuera de la vista y con el botón (que recuerda la pausa del usuario).
  (function initHeroVideo() {
    const vid = document.getElementById('heroVideo');
    const btn = document.getElementById('heroPause');
    if (!vid) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const vertical = matchMedia('(max-width:900px) and (orientation:portrait)').matches;
    // MP4 (H.264) donde se pueda; si no, el mismo video en WebM
    const mp4 = vid.canPlayType('video/mp4; codecs="avc1.640028"') !== '';
    const src = vertical ? vid.dataset.srcV : vid.dataset.srcH;
    vid.src = mp4 ? src : src.replace(/\.mp4$/, '.webm');
    vid.addEventListener('playing', () => vid.classList.add('is-playing'), { once: true });
    let pausedByUser = false;
    const play = () => { if (!pausedByUser) vid.play().catch(() => {}); };
    play();
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) play(); else { try { vid.pause(); } catch (e) {} } });
    }, { threshold: 0.1 }).observe(vid);
    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        pausedByUser = !pausedByUser;
        if (pausedByUser) vid.pause(); else play();
        const hero = document.getElementById('hero');
        if (hero) hero.classList.toggle('is-paused', pausedByUser);
        document.documentElement.classList.toggle('movimiento-pausado', pausedByUser);
        btn.setAttribute('aria-pressed', String(pausedByUser));
        btn.setAttribute('aria-label', pausedByUser ? 'Reanudar el video de la portada' : 'Pausar el video de la portada');
      });
    }
  })();

  /* ============ EL ELEFANTE DE RUMBO EN LA BARRA ============ */
  // Un guiño sin explicación: cruza la barra al llegar (una vez por visita), deja huellas, se sienta antes del botón y
  // dice «psst… ¿y tu día?». Al tocarlo, la página baja al aparte de Rumbo y el elefante de ahí celebra.
  (function initElefante() {
    const ele = document.getElementById('eleNav');
    const nav = document.getElementById('nav');
    if (!ele || !nav) return;
    const svg = ele.querySelector('.ele-svg');
    const burbuja = ele.querySelector('.ele-burbuja');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let yaCruzo = false;
    try { yaCruzo = sessionStorage.getItem('rumbo-ele') === '1'; } catch (e) {}
    const reaccion = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
    let burbujaT = null;
    const decir = (ms) => { burbuja.classList.add('ver'); clearTimeout(burbujaT); burbujaT = setTimeout(() => burbuja.classList.remove('ver'), ms); };
    // Dónde se sienta: antes del botón de agendar (o del botón del menú en pantallas angostas), con lugar para la burbuja
    function destino() {
      const ancla = [nav.querySelector('.nav-actions .btn-sm'), nav.querySelector('.nav-toggle')].find((x) => x && x.offsetParent);
      const r = nav.getBoundingClientRect();
      const borde = ancla ? ancla.getBoundingClientRect().left - r.left : r.width - 60;
      return Math.max(12, Math.round(borde - ele.offsetWidth - (innerWidth < 600 ? 140 : 190)));
    }
    let caminando = false;
    const sentar = (x) => { ele.classList.remove('caminando'); ele.style.setProperty('--ele-x', x + 'px'); };
    ele.hidden = false;
    if (yaCruzo || reduce) {
      sentar(destino());
    } else {
      const x0 = -70;
      sentar(x0);
      setTimeout(() => {
        const x1 = destino();
        const dur = Math.min(6, Math.max(3, (x1 - x0) / 240));
        caminando = true;
        ele.style.setProperty('--ele-dur', dur + 's');
        void ele.offsetWidth;
        ele.classList.add('caminando');
        ele.style.setProperty('--ele-x', x1 + 'px');
        let paso = 0;
        const huellas = setInterval(() => {
          const h = document.createElement('i');
          h.className = 'ele-huella';
          h.style.left = (ele.getBoundingClientRect().left - nav.getBoundingClientRect().left + 16) + 'px';
          h.style.bottom = (paso++ % 2 ? -31 : -36) + 'px';
          nav.appendChild(h);
          setTimeout(() => h.remove(), 2500);
        }, 210);
        setTimeout(() => {
          clearInterval(huellas);
          caminando = false;
          ele.classList.remove('caminando');
          reaccion(svg, 're-salta');
          setTimeout(() => decir(4200), 450);
          try { sessionStorage.setItem('rumbo-ele', '1'); } catch (e) {}
        }, dur * 1000);
      }, 1200);
    }
    let resizeT = null;
    window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (!caminando) sentar(destino()); }, 150); });
    ele.addEventListener('mouseenter', () => { reaccion(svg, 're-saluda'); decir(2600); });
    ele.addEventListener('focus', () => decir(2600));

    // Al llegar al aparte desde el elefante de la barra, el de ahí celebra
    const aparte = document.getElementById('aparteEle');
    if (!aparte) return;
    const aparteSvg = aparte.querySelector('.ele-svg');
    let pendiente = false;
    ele.addEventListener('click', () => { pendiente = true; });
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && pendiente) { pendiente = false; setTimeout(() => reaccion(aparteSvg, 're-festeja'), 300); }
      });
    }, { threshold: 0.6 }).observe(aparte);
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
