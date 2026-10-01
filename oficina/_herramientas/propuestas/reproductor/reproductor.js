/*
 * Propuesta · El reproductor de BiPlot.TV, en tres versiones para elegir. Es una maqueta para las fotos: no está en la
 * oficina. capturas.mjs la pone sobre la oficina y toma el lugar del video en grande: cualquier «Ver con sonido» (y cada
 * programa de la vista previa del canal) la abre en ese video, con toda la programación a mano.
 *   remoto     El control remoto: se cambia de canal (del 1 al 8, CH ▲▼, y deslizando en el celular), con estática.
 *   control    La sala de control: el programa al aire, el que sigue y el muro de monitores; se elige qué sale al aire.
 *   historias  Como las historias de Instagram: se toca para pasar, con la programación en la barra de arriba.
 * Las tres siguen solas al terminar (Felipe anuncia el siguiente), marcan lo visto, retoman donde quedaste y terminan en
 * el canal 08, «Tu proyecto», que todavía no sale al aire: ahí va «Agenda tu diagnóstico».
 * La programación sale de datos.js (la cartelera de BiPlot.TV): un video nuevo es una línea más en sus programas.
 */
(function () {
  'use strict';
  var D = window.OFICINA_DATOS; if (!D || !D.salas || !D.salas.tv) return;
  var TV = D.salas.tv.salaPropia, Z = TV.zonas;
  var PROY = {}; D.proyectos.forEach(function (p) { PROY[p.id] = p; });
  var MODO = (/[?&]reproductor=(remoto|control|historias)\b/.exec(location.search) || [])[1] || window.REPRODUCTOR || 'remoto';
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function dos(n) { return (n < 10 ? '0' : '') + n; }
  function hora(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + dos(s % 60); }
  function leer(k, d) { try { var v = localStorage.getItem('oficina-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function guardar(k, v) { try { localStorage.setItem('oficina-' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  function videoDe(d) { return typeof d.video === 'string' ? (PROY[d.video] || {}).media : d.video; }

  // La programación, en el orden de la cartelera, con lo que Felipe dice de cada video en su recorrido (de ejemplo)
  var RELATO = {}; (TV.recorrido || []).forEach(function (p) { RELATO[p.zona] = p.texto; });
  var CANALES = (Z.cartelera.programas || []).filter(function (id) { return Z[id] && videoDe(Z[id]); }).map(function (id, k) {
    var d = Z[id], v = videoDe(d);
    return { id: id, n: k + 1, nombre: d.nombre, ceja: d.ceja, titulo: d.titulo, texto: d.texto, dur: d.duracion || '', mini: 'media/tv/pantalla-' + (d.pantalla || id) + '.webp',
      h: v.h, v: v.v || v.h, poster: v.poster, botones: d.botones || [], relato: RELATO[id] || '' };
  });
  // El último canal: tu proyecto, que todavía no sale al aire
  CANALES.push({ id: 'tuproyecto', n: CANALES.length + 1, tu: true, nombre: 'Tu proyecto', ceja: 'Próximamente', titulo: 'Este canal todavía no sale al aire',
    texto: 'Los capítulos cuentan cómo trabaja BiPlot, caso por caso. El próximo puede ser el tuyo: todo empieza con un diagnóstico, y la primera sesión es sin costo.',
    dur: '', relato: RELATO.camarin || '' });
  var N = CANALES.length;
  var CTA = 'https://wa.me/' + String(D.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent('Hola BiPlot, vi BiPlot.TV en la oficina y quiero agendar un diagnóstico.');

  var I = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" fill="currentColor"/></svg>',
    sonido: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mudo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    grande: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    arriba: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    abajo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    izq: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    der: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    atras: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.6 10A8 8 0 1 1 6 16.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="13" y="15.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="currentColor" font-family="Space Mono, monospace">10</text></svg>',
    adelante: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 5v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.4 10A8 8 0 1 0 18 16.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="11" y="15.5" font-size="7.5" font-weight="700" text-anchor="middle" fill="currentColor" font-family="Space Mono, monospace">10</text></svg>',
    visto: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    apagar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v8M7.2 6.6a7.2 7.2 0 1 0 9.6 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    guia: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    compartir: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" stroke="currentColor" stroke-width="2"/></svg>',
    tele: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 25L33 9M50 25L67 9" stroke="#7FD8CF" stroke-width="5" stroke-linecap="round"/><circle cx="33" cy="9" r="6" fill="#7FD8CF"/><circle cx="67" cy="9" r="6" fill="#7FD8CF"/><rect x="6" y="25" width="88" height="67" rx="17" fill="#0E2A47" stroke="#17C3B2" stroke-width="5"/><rect x="17" y="35" width="66" height="47" rx="9" fill="#0B1726"/><path d="M27 42V74H74" stroke="#3F6DA0" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="34" cy="65" r="4.8" fill="#17C3B2"/><circle cx="46" cy="56" r="4.8" fill="#17C3B2"/><circle cx="62" cy="44" r="6" fill="#FF6B4A"/></svg>'
  };
  function avatar(id) { return '<svg class="avatar" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><use href="#av-' + id + '" width="100" height="100"/></svg>'; }
  function marca() { return '<span class="rp-marca">BiPlot<b>.TV</b></span>'; }

  // Lo que cuenta cada video: sus botones (los de su tarjeta en datos.js)
  function botones(c) {
    if (c.tu) return '<a class="bp-cta" href="' + esc(CTA) + '" target="_blank" rel="noopener">Agenda tu diagnóstico<span class="sr"> (se abre WhatsApp en otra pestaña)</span></a>';
    return c.botones.map(function (b, k) {
      var cls = 'rp-b' + (k === c.botones.length - 1 || b.sala ? ' primario' : '');
      if (b.url) return '<a class="' + cls + '" href="' + esc(b.url) + '" target="_blank" rel="noopener">' + esc(b.texto) + '<span class="sr"> (se abre en otra pestaña)</span></a>';
      if (b.sala) return '<button type="button" class="' + cls + '" data-ir-sala="' + esc(b.sala) + '">' + esc(b.texto) + '</button>';
      if (b.hq) return '<button type="button" class="' + cls + '" data-ir-hq="1">' + esc(b.texto || 'Pasar a BiPlot HQ') + '</button>';
      if (b.chat) return '<button type="button" class="' + cls + '" data-ir-chat="1">' + esc(b.texto || 'Conversar con Plotty') + '</button>';
      return '';
    }).join('');
  }

  /* ── Lo común: el video, la programación, lo que sigue y el canal 08 ── */
  // «A continuación»: Felipe anuncia el siguiente y, si nadie lo para, pasa solo
  var HTML_SIGUE = '<div class="rp-sigue" hidden role="status">' +
    '<div class="rp-sigue-cab"><span class="rp-ceja">A continuación · <b data-s="n"></b></span>' +
      '<span class="rp-cuenta" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5"/><circle class="rp-cuenta-v" cx="18" cy="18" r="15.5"/></svg><b data-s="cuenta"></b></span></div>' +
    '<div class="rp-sigue-prog"><img data-s="mini" alt="" width="160" height="90"><span><b data-s="nombre"></b><small data-s="ceja"></small></span></div>' +
    '<p class="rp-relato">' + avatar('felipe') + '<span><small>Felipe · El rostro</small><q data-s="relato"></q></span></p>' +
    '<div class="rp-sigue-btns"><button type="button" class="rp-b primario" data-accion="ya">' + I.play + 'Ver ahora</button><button type="button" class="rp-b" data-accion="quedar">Quedarme aquí</button></div></div>';
  // El canal 08, con su carta de ajuste en los colores de la marca (el coral, sólo en el botón)
  var HTML_CARTA = '<div class="rp-carta" hidden><div class="rp-barras" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
    '<div class="rp-carta-caja"><p class="rp-ceja">Canal <span data-c="n"></span> · Tu proyecto</p><h3>Este canal todavía no sale al aire</h3>' +
    '<p>' + esc(CANALES[N - 1].texto) + '</p><div class="rp-carta-btns">' + botones(CANALES[N - 1]) +
    '<button type="button" class="rp-b" data-accion="inicio">Volver al canal 01</button></div></div></div>';
  var HTML_RETOMA = '<div class="rp-retoma" hidden role="status"><span>Seguimos donde quedaste, en el <b data-r="t"></b></span><button type="button" class="rp-b chico" data-accion="principio">Desde el principio</button></div>';

  // Lo que espera antes de pasar al siguiente (en historias, menos: ahí se pasa solo)
  var ESPERA = MODO === 'historias' ? 3 : 5;
  var raiz, vid, i = 0, abierto = false, desde = null, sigueT = null, osdT = null, vistos = leer('tv-vistos', []), punto = leer('tv-punto', null), vert = false;
  function canal() { return CANALES[i]; }
  function vertical() { return window.innerHeight > window.innerWidth && window.innerWidth < 900; }
  // (la sala de control siempre es 16:9: en el celular se ve arriba, con el muro debajo)
  function fuente(c) { return MODO !== 'control' && vertical() ? c.v : c.h; }
  function marcarVisto(c) { if (c && !c.tu && vistos.indexOf(c.id) < 0) { vistos.push(c.id); guardar('tv-vistos', vistos); pintar(); } }

  function abrir(k, o) {
    o = o || {};
    if (!raiz) construir();
    desde = o.desde || document.activeElement;
    abierto = true; raiz.hidden = false; document.documentElement.classList.add('rp-abierto');
    var c = CANALES[k] || CANALES[0], t = 0;
    // Si lo dejaste a la mitad, sigue desde ahí
    if (punto && punto.id === c.id && punto.t > 5) t = punto.t;
    ir(k, { sin: true, t: t });
    if (t) retomar(t);
    // En el celular, la primera vez: «Desliza para cambiar de canal»
    if (MODO === 'remoto' && vertical() && !leer('tv-desliza', false)) { raiz.classList.add('rp-ver-desliza'); guardar('tv-desliza', true); setTimeout(function () { raiz.classList.remove('rp-ver-desliza'); }, 2600); }
    var f = raiz.querySelector('[data-foco]'); if (f) f.focus({ preventScroll: true });
  }
  function cerrar() {
    if (!abierto) return;
    pararSigue(); vid.pause();
    var c = canal(); punto = !c.tu && vid.currentTime > 5 && vid.duration && vid.currentTime < vid.duration - 5 ? { id: c.id, t: Math.floor(vid.currentTime) } : null; guardar('tv-punto', punto);
    vid.removeAttribute('src'); vid.load();
    raiz.hidden = true; abierto = false; document.documentElement.classList.remove('rp-abierto');
    if (desde && document.contains(desde)) desde.focus({ preventScroll: true });
  }
  function ir(k, o) {
    o = o || {};
    k = (k % N + N) % N; var antes = i; i = k;
    pararSigue(); ocultar('.rp-retoma');
    var c = canal(), poner = function () {
      raiz.classList.toggle('rp-en-tu', !!c.tu);
      $$('[data-c="n"]', raiz).forEach(function (e) { e.textContent = dos(c.n); });
      if (c.tu) { vid.pause(); vid.removeAttribute('src'); vid.removeAttribute('poster'); vid.load(); }
      else {
        vert = vertical(); vid.poster = c.poster || ''; vid.src = fuente(c);
        if (o.t) vid.currentTime = o.t;
        var p = vid.play(); if (p && p.catch) p.catch(function () {});
      }
      $('.rp-carta', raiz).hidden = !c.tu;
      pintar(); mostrarOsd();
      if (MODOS[MODO].tras) MODOS[MODO].tras(antes, o);
    };
    if (o.sin || reducido || !MODOS[MODO].transicion) poner(); else MODOS[MODO].transicion(poner, c, antes);
  }
  function siguiente() { ir(i + 1); }
  function anterior() { ir(i - 1); }
  function alternar() { if (canal().tu) return; if (vid.paused) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); }
  function silenciar() { vid.muted = !vid.muted; pintar(); }
  function saltar(s) { if (!canal().tu && vid.duration) vid.currentTime = Math.max(0, Math.min(vid.duration - .2, vid.currentTime + s)); }
  function completa() {
    var el = $('.rp-pantalla', raiz) || raiz;
    if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
  }
  function ocultar(s) { var e = $(s, raiz); if (e) e.hidden = true; }
  function retomar(t) { var r = $('.rp-retoma', raiz); $('[data-r="t"]', r).textContent = hora(t); r.hidden = false; clearTimeout(r._t); r._t = setTimeout(function () { r.hidden = true; }, 6000); }

  // Al terminar: el siguiente, anunciado por Felipe, con cinco segundos para quedarse
  function mostrarSigue() {
    var s = CANALES[(i + 1) % N], el = $('.rp-sigue', raiz);
    $('[data-s="n"]', el).textContent = dos(s.n);
    $('[data-s="nombre"]', el).textContent = s.nombre;
    $('[data-s="ceja"]', el).textContent = s.ceja + (s.dur ? ' · ' + s.dur : '');
    var im = $('[data-s="mini"]', el); im.hidden = !!s.tu; if (!s.tu) im.src = s.mini;
    el.classList.toggle('es-tu', !!s.tu);
    $('[data-s="relato"]', el).textContent = s.relato;
    el.hidden = false; raiz.classList.add('rp-siguiendo');
    var n = ESPERA, cu = $('[data-s="cuenta"]', el);
    cu.textContent = n; el.style.setProperty('--espera', ESPERA + 's'); el.classList.remove('corre'); void el.offsetWidth; if (!reducido) el.classList.add('corre');
    clearInterval(sigueT);
    sigueT = setInterval(function () { n--; cu.textContent = Math.max(n, 0); if (n <= 0) { pararSigue(); siguiente(); } }, 1000);
  }
  function pararSigue() { clearInterval(sigueT); sigueT = null; if (raiz) { ocultar('.rp-sigue'); raiz.classList.remove('rp-siguiendo'); } }

  // El cartel con el número y el nombre (en el control remoto, como en la tele: se esconde solo)
  function mostrarOsd() {
    if (!raiz) return; raiz.classList.add('rp-osd-on'); clearTimeout(osdT);
    osdT = setTimeout(function () { if (!vid.paused) raiz.classList.remove('rp-osd-on'); }, 3500);
  }

  var pintado = -1;
  function pintar() {
    if (!raiz) return;
    var c = canal();
    // Los textos y los botones, sólo al cambiar de video (así no se pierde el foco al pausar)
    if (pintado !== i) {
      pintado = i;
      $$('[data-p]', raiz).forEach(function (e) {
        var k = e.getAttribute('data-p');
        if (k === 'n') e.textContent = dos(c.n);
        if (k === 'nombre') e.textContent = c.nombre;
        if (k === 'ceja') e.textContent = c.ceja;
        if (k === 'titulo') e.textContent = c.titulo;
        if (k === 'texto') e.textContent = c.texto;
        if (k === 'dur') e.textContent = c.dur;
        // (en el canal 08, «Agenda tu diagnóstico» va una sola vez: en la pantalla)
        if (k === 'botones') e.innerHTML = c.tu ? '' : botones(c);
      });
    }
    $$('[data-canal]', raiz).forEach(function (b) {
      var k = +b.getAttribute('data-canal'), C = CANALES[k];
      b.classList.toggle('actual', k === i);
      b.classList.toggle('visto', !!C && vistos.indexOf(C.id) > -1);
      if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
    $$('[data-accion="play"]', raiz).forEach(function (b) { b.innerHTML = vid.paused ? I.play : I.pausa; b.setAttribute('aria-label', vid.paused ? 'Reproducir' : 'Pausar'); });
    $$('[data-accion="mudo"]', raiz).forEach(function (b) { b.innerHTML = vid.muted ? I.mudo : I.sonido; b.setAttribute('aria-label', vid.muted ? 'Activar el sonido' : 'Silenciar'); });
    raiz.classList.toggle('rp-pausado', vid.paused);
    if (MODOS[MODO].pintar) MODOS[MODO].pintar(c);
  }
  function avance() {
    var c = canal(), d = vid.duration || 0, t = vid.currentTime || 0, f = d ? t / d : 0;
    $$('[data-p="avance"]', raiz).forEach(function (e) { e.style.transform = 'scaleX(' + (c.tu ? 0 : f) + ')'; });
    $$('[data-p="hora"]', raiz).forEach(function (e) { e.textContent = c.tu ? '' : hora(t) + ' / ' + (d ? hora(d) : c.dur); });
    if (MODOS[MODO].avance) MODOS[MODO].avance(f);
    if (f > .9) marcarVisto(c);
  }

  /* ── La primera versión: el control remoto ── */
  function htmlRemoto() {
    var teclas = CANALES.map(function (c, k) {
      return '<button type="button" class="rp-tecla' + (c.tu ? ' es-tu' : '') + '" data-canal="' + k + '" aria-label="' + esc('Canal ' + c.n + ': ' + c.nombre) + '">' + c.n + '</button>';
    }).join('');
    var guia = CANALES.map(function (c, k) {
      return '<li><button type="button" class="rp-fila" data-canal="' + k + '"><span class="rp-num-g">' + dos(c.n) + '</span>' +
        (c.tu ? '<span class="rp-mini-tu" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' : '<img src="' + esc(c.mini) + '" alt="" width="96" height="54" loading="lazy">') +
        '<span class="rp-fila-txt"><small>' + esc(c.ceja) + '</small><b>' + esc(c.nombre) + '</b></span><span class="rp-fila-dur">' + esc(c.tu ? '—' : c.dur) + '</span>' +
        '<span class="rp-fila-visto" aria-hidden="true">' + I.visto + '</span><span class="sr rp-sr-visto"> (ya lo viste)</span></button></li>';
    }).join('');
    return '<div class="rp-velo" data-accion="cerrar"></div>' +
      '<button type="button" class="rp-cerrar" data-accion="cerrar" aria-label="Cerrar BiPlot.TV">' + I.cerrar + '</button>' +
      '<div class="rp-escenario">' +
        '<div class="rp-tele">' +
          '<svg class="rp-antena" viewBox="0 0 140 56" aria-hidden="true"><path d="M70 54L26 12M70 54L114 12"/><circle cx="26" cy="12" r="8"/><circle cx="114" cy="12" r="8"/></svg>' +
          '<div class="rp-pantalla">' +
            '<video class="rp-video" playsinline preload="metadata"></video>' +
            '<div class="rp-nieve" aria-hidden="true"><b data-p="n"></b></div>' +
            '<div class="rp-osd" aria-live="polite"><b class="rp-osd-num"><small>CH</small><span data-p="n"></span></b><span class="rp-osd-txt"><span class="rp-ceja" data-p="ceja"></span><b data-p="nombre"></b><span class="rp-osd-hora" data-p="hora"></span></span></div>' +
            HTML_CARTA + HTML_SIGUE + HTML_RETOMA +
            '<div class="rp-guia" hidden><div class="rp-guia-cab"><p class="rp-ceja">Guía de programación</p><b>' + marca() + '</b><button type="button" class="rp-b chico" data-accion="guia">Cerrar la guía</button></div><ol>' + guia + '</ol></div>' +
            '<div class="rp-linea"><i data-p="avance"></i></div>' +
          '</div>' +
          '<div class="rp-bisel"><span class="rp-led" aria-hidden="true"></span>' + marca() + '<span class="rp-bisel-hora" data-p="hora"></span></div>' +
        '</div>' +
        '<div class="rp-control" role="group" aria-label="Control remoto">' +
          '<div class="rp-c-arriba"><button type="button" class="rp-redondo rp-apagar" data-accion="cerrar" aria-label="Apagar (cerrar BiPlot.TV)">' + I.apagar + '</button>' +
            '<span class="rp-ir" aria-hidden="true"></span>' +
            '<button type="button" class="rp-redondo" data-accion="mudo"></button></div>' +
          '<div class="rp-cruz">' +
            '<button type="button" class="rp-cruz-b arr" data-accion="sig" aria-label="Canal siguiente">' + I.arriba + '<small>CH</small></button>' +
            '<button type="button" class="rp-cruz-b izq" data-accion="atras" aria-label="Retroceder 10 segundos">' + I.izq + '</button>' +
            '<button type="button" class="rp-cruz-ok" data-accion="play" data-foco></button>' +
            '<button type="button" class="rp-cruz-b der" data-accion="adelante" aria-label="Adelantar 10 segundos">' + I.der + '</button>' +
            '<button type="button" class="rp-cruz-b aba" data-accion="ant" aria-label="Canal anterior"><small>CH</small>' + I.abajo + '</button>' +
          '</div>' +
          '<div class="rp-teclado">' + teclas + '<button type="button" class="rp-tecla rp-tecla-guia" data-accion="guia" aria-label="Guía de programación">' + I.guia + '<small>GUÍA</small></button></div>' +
          '<div class="rp-c-pie">' + marca() + '</div>' +
        '</div>' +
        // En el celular, el control es una barra: canal anterior, el canal (abre la guía) y canal siguiente
        '<div class="rp-mando"><button type="button" class="rp-redondo" data-accion="ant" aria-label="Canal anterior">' + I.abajo + '</button>' +
          '<button type="button" class="rp-mando-canal" data-accion="guia"><b data-p="n"></b><span><small data-p="ceja"></small><span data-p="nombre"></span></span>' + I.guia + '<span class="sr"> (guía de programación)</span></button>' +
          '<button type="button" class="rp-redondo" data-accion="sig" aria-label="Canal siguiente">' + I.arriba + '</button></div>' +
      '</div>' +
      '<p class="rp-ayuda" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> cambia de canal · <kbd>1</kbd>…<kbd>8</kbd> · <kbd>Espacio</kbd> pausa · <kbd>Esc</kbd> apaga</p>' +
      '<p class="rp-desliza" aria-hidden="true">' + I.arriba + 'Desliza para cambiar de canal</p>';
  }
  // Entre canal y canal, un golpe de estática con el número del que entra
  var nieve = null;
  function hacerNieve() {
    if (nieve) return nieve;
    var cv = document.createElement('canvas'); cv.width = 192; cv.height = 108;
    var x = cv.getContext('2d'), im = x.createImageData(192, 108);
    for (var k = 0; k < im.data.length; k += 4) { var g = Math.random() * 255 | 0; im.data[k] = g; im.data[k + 1] = g + 6 > 255 ? 255 : g + 6; im.data[k + 2] = g + 14 > 255 ? 255 : g + 14; im.data[k + 3] = 255; }
    x.putImageData(im, 0, 0); nieve = cv.toDataURL(); return nieve;
  }

  /* ── La segunda versión: la sala de control ── */
  function htmlControl() {
    var muro = CANALES.map(function (c, k) {
      return '<li><button type="button" class="rp-monitor-b" data-canal="' + k + '" aria-pressed="false">' +
        '<span class="rp-mon">' + (c.tu ? '<span class="rp-mini-tu" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="rp-sin">Sin señal</span>' : '<img src="' + esc(c.mini) + '" alt="" width="160" height="90" loading="lazy">') +
          '<span class="rp-mon-n">' + dos(c.n) + '</span><span class="rp-mon-tag" aria-hidden="true"></span><span class="rp-mon-visto" aria-hidden="true">' + I.visto + '</span></span>' +
        '<span class="rp-mon-txt"><b>' + esc(c.nombre) + '</b><small>' + esc(c.tu ? 'Próximamente' : c.dur) + '</small></span>' +
        '<span class="sr rp-sr-visto"> (ya lo viste)</span></button></li>';
    }).join('');
    return '<div class="rp-velo" data-accion="cerrar"></div>' +
      '<div class="rp-sala">' +
        '<header class="rp-cab"><p><span class="rp-tally" aria-hidden="true"></span>' + marca() + '<span class="rp-cab-sub">Sala de control</span></p>' +
          '<span class="rp-reloj" aria-hidden="true"></span>' +
          '<button type="button" class="rp-cerrar" data-accion="cerrar" aria-label="Salir de la sala de control">' + I.cerrar + '</button></header>' +
        '<div class="rp-pgm">' +
          '<div class="rp-pantalla rp-aire"><span class="rp-etq">Al aire</span>' +
            '<video class="rp-video" playsinline preload="metadata"></video>' +
            '<div class="rp-zocalo"><span class="rp-ceja" data-p="ceja"></span><b data-p="nombre"></b></div>' +
            HTML_CARTA + HTML_SIGUE + HTML_RETOMA +
          '</div>' +
          '<div class="rp-consola">' +
            '<button type="button" class="rp-redondo" data-accion="play" data-foco></button>' +
            '<button type="button" class="rp-redondo" data-accion="atras" aria-label="Retroceder 10 segundos">' + I.atras + '</button>' +
            '<span class="rp-barra" aria-hidden="true"><i data-p="avance"></i></span><span class="rp-hora" data-p="hora"></span>' +
            '<button type="button" class="rp-redondo" data-accion="mudo"></button>' +
            '<button type="button" class="rp-redondo" data-accion="completa" aria-label="Pantalla completa">' + I.grande + '</button>' +
            '<button type="button" class="rp-corte" data-accion="sig">Corte<small>al que sigue</small>' + I.der + '</button>' +
          '</div>' +
        '</div>' +
        '<aside class="rp-lado">' +
          '<div class="rp-previo-caja"><div class="rp-previo"><span class="rp-etq">Previo</span><img alt="" width="480" height="270" data-pv="mini"><span class="rp-previo-tu" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></div>' +
            '<p class="rp-previo-txt"><span class="rp-ceja" data-pv="cab">A continuación</span><b data-pv="nombre"></b><small data-pv="ceja"></small></p></div>' +
          '<div class="rp-info"><p class="rp-ceja" data-p="ceja"></p><h3 data-p="titulo"></h3><p class="rp-info-txt" data-p="texto"></p>' +
            '<div class="rp-info-btns" data-p="botones"></div>' +
            '<button type="button" class="rp-b chico rp-compartir" data-accion="compartir">' + I.compartir + 'Compartir este video</button></div>' +
        '</aside>' +
        '<div class="rp-muro"><p class="rp-ceja">El muro · toca un monitor y sale al aire</p><ol role="list">' + muro + '</ol></div>' +
      '</div>';
  }
  function reloj() { var r = raiz && $('.rp-reloj', raiz); if (!r) return; var d = new Date(); r.textContent = dos(d.getHours()) + ':' + dos(d.getMinutes()) + ':' + dos(d.getSeconds()); }
  // El monitor de previo muestra el que sigue, o el que estás por elegir (al pasar sobre el muro)
  function previo(k, eligiendo) {
    var c = CANALES[(k + N) % N], p = $('.rp-previo-caja', raiz); if (!p) return;
    var im = $('[data-pv="mini"]', p); im.hidden = !!c.tu; if (!c.tu) im.src = c.mini;
    p.classList.toggle('es-tu', !!c.tu); p.classList.toggle('eligiendo', !!eligiendo);
    $('[data-pv="cab"]', p).textContent = eligiendo ? 'Al tocarlo, sale al aire' : 'A continuación';
    $('[data-pv="nombre"]', p).textContent = dos(c.n) + ' · ' + c.nombre;
    $('[data-pv="ceja"]', p).textContent = c.ceja + (c.dur ? ' · ' + c.dur : '');
  }

  /* ── La tercera versión: historias ── */
  function htmlHistorias() {
    var seg = CANALES.map(function (c, k) { return '<button type="button" class="rp-seg" data-canal="' + k + '" aria-label="' + esc(c.n + ' de ' + N + ': ' + c.nombre) + '"><i><b></b></i></button>'; }).join('');
    var vecinos = [-2, -1, 1, 2].map(function (d) {
      return '<button type="button" class="rp-vecino" data-vecino="' + d + '" tabindex="-1" aria-hidden="true"><img alt="" width="480" height="270"><span class="rp-vecino-tu"><i></i><i></i><i></i><i></i><i></i></span>' +
        '<span class="rp-vecino-txt"><small></small><b></b></span></button>';
    }).join('');
    return '<div class="rp-velo"></div>' +
      '<header class="rp-hcab"><span class="rp-hlogo">' + I.tele + '</span>' + marca() + '<span class="rp-cab-sub">Toda la programación, una tras otra</span>' +
        '<button type="button" class="rp-cerrar" data-accion="cerrar" aria-label="Cerrar BiPlot.TV">' + I.cerrar + '</button></header>' +
      '<div class="rp-carrusel">' + vecinos +
        '<div class="rp-historia">' +
          '<div class="rp-pantalla">' +
            '<video class="rp-video" playsinline preload="metadata"></video>' +
            '<div class="rp-arriba"><div class="rp-segs" role="group" aria-label="La programación">' + seg + '</div>' +
              '<div class="rp-quien"><span class="rp-hlogo">' + I.tele + '</span><span class="rp-quien-txt"><b data-p="nombre"></b><small><span data-p="ceja"></span><span class="rp-quien-hora"> · <span data-p="hora"></span></span></small></span>' +
                '<button type="button" class="rp-redondo" data-accion="play" data-foco></button><button type="button" class="rp-redondo" data-accion="mudo"></button>' +
                '<button type="button" class="rp-redondo rp-cerrar-h" data-accion="cerrar" aria-label="Cerrar BiPlot.TV">' + I.cerrar + '</button></div></div>' +
            '<button type="button" class="rp-toque ant" data-accion="ant" aria-label="Video anterior"></button><button type="button" class="rp-toque sig" data-accion="sig" aria-label="Video siguiente"></button>' +
            HTML_CARTA + HTML_SIGUE + HTML_RETOMA +
          '</div>' +
          '<div class="rp-hpie"><p class="rp-hpie-txt"><span class="rp-ceja" data-p="ceja"></span><b data-p="titulo"></b></p><div class="rp-hbtns" data-p="botones"></div></div>' +
          '<button type="button" class="rp-flecha ant" data-accion="ant" aria-label="Video anterior">' + I.izq + '</button>' +
          '<button type="button" class="rp-flecha sig" data-accion="sig" aria-label="Video siguiente">' + I.der + '</button>' +
        '</div>' +
      '</div>' +
      '<p class="rp-ayuda" aria-hidden="true">Toca a la derecha para pasar · <kbd>←</kbd><kbd>→</kbd> · <kbd>Espacio</kbd> pausa · <kbd>Esc</kbd> cierra</p>';
  }
  function vecinos() {
    $$('.rp-vecino', raiz).forEach(function (b) {
      var d = +b.getAttribute('data-vecino'), c = CANALES[((i + d) % N + N) % N];
      b.classList.toggle('es-tu', !!c.tu);
      var im = $('img', b); im.hidden = !!c.tu; if (!c.tu) im.src = Math.abs(d) === 1 ? c.poster : c.mini;
      $('small', b).textContent = c.ceja; $('b', b).textContent = c.nombre;
    });
  }

  var MODOS = {
    remoto: {
      html: htmlRemoto,
      // La estática dura un tercio de segundo; con movimiento reducido, el corte es directo
      transicion: function (poner, c) {
        var nv = $('.rp-nieve', raiz); nv.style.backgroundImage = 'url(' + hacerNieve() + ')';
        $('b', nv).textContent = dos(c.n);
        raiz.classList.add('rp-cambiando'); vid.pause();
        setTimeout(function () { poner(); setTimeout(function () { if (!raiz.classList.contains('rp-fija')) raiz.classList.remove('rp-cambiando'); }, 260); }, 220);
      },
      tras: function () { var g = $('.rp-guia', raiz); if (g && !g.hidden && !raiz.classList.contains('rp-fija')) alternarGuia(false); }
    },
    control: {
      html: htmlControl,
      transicion: function (poner) { var a = $('.rp-aire', raiz); a.classList.add('rp-mezcla'); setTimeout(function () { poner(); a.classList.remove('rp-mezcla'); }, 240); },
      pintar: function () { previo(i + 1); }
    },
    historias: {
      html: htmlHistorias,
      transicion: function (poner) { var h = $('.rp-historia', raiz); h.classList.add('rp-pasa'); setTimeout(function () { poner(); h.classList.remove('rp-pasa'); }, 200); },
      pintar: function () {
        $$('.rp-seg', raiz).forEach(function (s, k) { s.classList.toggle('rp-ahora', k === i); if (k !== i) $('b', s).style.transform = 'scaleX(' + (k < i ? 1 : 0) + ')'; });
        vecinos();
      },
      avance: function (f) { var s = $$('.rp-seg', raiz)[i]; if (s) $('b', s).style.transform = 'scaleX(' + f + ')'; }
    }
  };

  function alternarGuia(si) {
    var g = $('.rp-guia', raiz); if (!g) return;
    si = si == null ? g.hidden : si; g.hidden = !si; raiz.classList.toggle('rp-con-guia', si);
    if (si) { var a = $('.rp-fila.actual', g) || $('.rp-fila', g); if (a) a.focus({ preventScroll: true }); }
  }

  function construir() {
    raiz = document.createElement('div');
    raiz.className = 'rp rp-m-' + MODO; raiz.id = 'rp'; raiz.hidden = true;
    raiz.setAttribute('role', 'dialog'); raiz.setAttribute('aria-modal', 'true'); raiz.setAttribute('aria-label', 'BiPlot.TV, el canal de BiPlot');
    raiz.innerHTML = MODOS[MODO].html();
    document.body.appendChild(raiz);
    vid = $('video.rp-video', raiz);
    ['play', 'pause', 'volumechange'].forEach(function (ev) { vid.addEventListener(ev, function () { pintar(); if (ev === 'pause') mostrarOsd(); }); });
    vid.addEventListener('timeupdate', avance);
    vid.addEventListener('loadedmetadata', avance);
    vid.addEventListener('ended', function () { marcarVisto(canal()); mostrarSigue(); });
    raiz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-accion], [data-canal], [data-vecino], [data-ir-sala], [data-ir-hq], [data-ir-chat]'); if (!b || !raiz.contains(b)) return;
      if (b.hasAttribute('data-canal')) { ir(+b.getAttribute('data-canal')); return; }
      if (b.hasAttribute('data-vecino')) { ir(i + +b.getAttribute('data-vecino')); return; }
      if (b.hasAttribute('data-ir-sala') || b.hasAttribute('data-ir-hq') || b.hasAttribute('data-ir-chat')) { cerrar(); return; }
      var a = b.getAttribute('data-accion');
      if (a === 'cerrar') cerrar();
      else if (a === 'sig') siguiente();
      else if (a === 'ant') anterior();
      else if (a === 'play') alternar();
      else if (a === 'mudo') silenciar();
      else if (a === 'atras') saltar(-10);
      else if (a === 'adelante') saltar(10);
      else if (a === 'completa') completa();
      else if (a === 'guia') alternarGuia();
      else if (a === 'ya') { pararSigue(); siguiente(); }
      else if (a === 'quedar') pararSigue();
      else if (a === 'inicio') ir(0);
      else if (a === 'principio') { ocultar('.rp-retoma'); vid.currentTime = 0; }
      else if (a === 'compartir') { var u = 'https://biplot.cl/oficina/tv/?ver=' + canal().id; if (navigator.share) navigator.share({ url: u }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(u).catch(function () {}); }
    });
    // Un clic en el video lo pausa (en el control remoto y en la sala de control)
    vid.addEventListener('click', function () { alternar(); mostrarOsd(); });
    // Pasar sobre un monitor del muro lo muestra en el previo
    $$('.rp-monitor-b', raiz).forEach(function (b) {
      b.addEventListener('mouseenter', function () { previo(+b.getAttribute('data-canal'), true); });
      b.addEventListener('focus', function () { previo(+b.getAttribute('data-canal'), true); });
      b.addEventListener('mouseleave', function () { previo(i + 1); });
      b.addEventListener('blur', function () { previo(i + 1); });
    });
    // En el celular: deslizar cambia de canal (control remoto) o de historia; hacia abajo, en historias, cierra
    var p0 = null, pant = $('.rp-pantalla', raiz);
    pant.addEventListener('touchstart', function (e) { var t = e.touches[0]; p0 = { x: t.clientX, y: t.clientY, t: Date.now() }; }, { passive: true });
    pant.addEventListener('touchend', function (e) {
      if (!p0) return; var t = e.changedTouches[0], dx = t.clientX - p0.x, dy = t.clientY - p0.y; p0 = null;
      if (MODO === 'remoto' && Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx)) { if (dy < 0) siguiente(); else anterior(); }
      if (MODO === 'historias') { if (dy > 80 && Math.abs(dy) > Math.abs(dx)) cerrar(); else if (Math.abs(dx) > 50) { if (dx < 0) siguiente(); else anterior(); } }
    }, { passive: true });
    window.addEventListener('resize', function () {
      // Al girar el celular cambia al formato que calza, en el mismo segundo
      if (!abierto || canal().tu || vertical() === vert) return;
      var t = vid.currentTime, sigue = !vid.paused; vert = vertical(); vid.src = fuente(canal()); vid.currentTime = t; if (sigue) vid.play().catch(function () {});
    });
    if (MODO === 'control') { reloj(); setInterval(reloj, 1000); }
  }

  // El teclado, mientras está abierto, es sólo del reproductor
  window.addEventListener('keydown', function (e) {
    if (!abierto) return;
    e.stopPropagation();
    var k = e.key, enBoton = /^(BUTTON|A)$/.test((e.target && e.target.tagName) || '');
    var parar = function () { e.preventDefault(); };
    if (k === 'Escape') { parar(); var g = $('.rp-guia', raiz); if (g && !g.hidden) alternarGuia(false); else cerrar(); return; }
    if (k === 'Tab') {
      var f = $$('button:not([hidden]):not([tabindex="-1"]), a[href]', raiz).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return; var pri = f[0], ult = f[f.length - 1];
      if (e.shiftKey && document.activeElement === pri) { parar(); ult.focus(); } else if (!e.shiftKey && document.activeElement === ult) { parar(); pri.focus(); }
      return;
    }
    if (/^[1-9]$/.test(k) && +k <= N) { parar(); ir(+k - 1); return; }
    if (k === ' ' && enBoton) return;
    if (k === ' ' || k === 'k') { parar(); alternar(); return; }
    if (k === 'm') { parar(); silenciar(); return; }
    if (k === 'f') { parar(); completa(); return; }
    var mov = MODO === 'historias' ? { ArrowRight: 1, ArrowLeft: -1 } : { ArrowUp: 1, ArrowDown: -1, PageUp: 1, PageDown: -1 };
    if (mov[k]) { parar(); ir(i + mov[k]); return; }
    if (MODO !== 'historias' && (k === 'ArrowRight' || k === 'ArrowLeft')) { parar(); saltar(k === 'ArrowRight' ? 10 : -10); }
  }, true);

  // Cualquier «Ver con sonido» de la oficina abre el reproductor en ese video
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-grande]'); if (!b) return;
    var h = b.getAttribute('data-grande'), k = -1;
    CANALES.forEach(function (c, j) { if (k < 0 && !c.tu && (c.h === h || c.v === h)) k = j; });
    e.preventDefault(); e.stopPropagation();
    abrir(k < 0 ? 0 : k, { desde: b });
  }, true);

  // Para las fotos (capturas.mjs)
  window.RP = { modo: MODO, canales: CANALES, abrir: abrir, cerrar: cerrar, ir: ir, guia: alternarGuia, sigue: mostrarSigue, parar: pararSigue, previo: previo,
    osd: function () { raiz.classList.add('rp-osd-on'); clearTimeout(osdT); }, congelar: function () { clearInterval(sigueT); },
    video: function () { return vid; }, raiz: function () { return raiz; }, retomar: retomar,
    vistos: function (l) { vistos = l.slice(); guardar('tv-vistos', vistos); pintar(); } };
})();
