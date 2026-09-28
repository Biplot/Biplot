/*
 * Oficina BiPlot · la visita guiada con Plotty, cuadro a cuadro
 * Todo lo que se ve en el segundo t sale de VIDEO.cuadro(t), sin relojes ni animaciones CSS: así cada cuadro se puede
 * grabar por separado (exportar-teaser.mjs --video visita) y cae justo con la música, que sale del mismo guion.
 * window.VIDEO = { listo: Promise, cuadro(t), total, formato, ancho, alto }
 * Los fondos son fotos grandes del barrio, la oficina, la calle y las salas (placas.html), en /__placas/.
 */
(function () {
  'use strict';

  var G = window.VISITA_GUION, IL = window.Ilustraciones, EL = window.Elenco, M = G.M;
  var q = new URLSearchParams(location.search), FORMATO = q.get('formato') === '16x9' ? '16x9' : '9x16';
  var V = FORMATO === '9x16', W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  var PLACAS_URL = q.get('placas') || '/__placas/';
  var lienzo = document.getElementById('lienzo');
  lienzo.style.width = W + 'px'; lienzo.style.height = H + 'px';

  /* ── Ayudas ── */
  function el(tag, cls, html, padre) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; (padre || lienzo).appendChild(e); return e; }
  function css(e, o) { for (var k in o) e.style[k] = o[k]; }
  function ver(e, si) { var d = si ? '' : 'none'; if (e.style.display !== d) e.style.display = d; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function prog(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function lerp(a, b, x) { return a + (b - a) * x; }
  function eOut(x) { return 1 - Math.pow(1 - x, 3); }
  function eIn(x) { return x * x * x; }
  function eInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eBack(x) { var c = 1.7; return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function f2(n) { return (Math.round(n * 100) / 100).toString(); }
  function azar(semilla) { var a = semilla >>> 0; return function () { a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // Aparece en [a, a + d] y se va en [b - s, b]
  function vida(t, a, d, b, s) { return eOut(prog(t, a, a + d)) * (1 - eIn(prog(t, b - s, b))); }

  /* ── Los dibujos: Plotty y el isotipo ── */
  document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<linearGradient id="bp-sq-t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c426d"/><stop offset="1" stop-color="#0d2642"/></linearGradient>' +
    '<symbol id="il-plotty" viewBox="' + IL.plotty.vb + '">' + IL.plotty.svg + '</symbol></defs></svg>');
  var VB_P = IL.plotty.vb.split(' ').map(Number), CAB_P = IL.plotty.cabeza.split(' ').map(Number);
  function iso(px) { return '<svg viewBox="0 0 100 100" width="' + px + '" height="' + px + '">' + EL.isotipo.replace(/url\(#bp-sq\)/g, 'url(#bp-sq-t)') + '</svg>'; }
  function palabra(hq) { return '<span class="palabra"><span class="bi">Bi</span><span class="plot">Plot</span>' + (hq ? '<span class="hq">HQ</span>' : '') + '</span>'; }

  /* ═════════ Los fondos y la cámara ═════════ */
  var escenario = el('div', 'capa');
  // (con su propio orden de capas: los fondos nunca tapan lo que va encima)
  var fondo = el('div', 'capa', '', escenario); css(fondo, { background: '#061525', zIndex: '0' });
  var NOMBRES = ['barrio', 'barrio-abierto', 'oficina', 'calle', 'calle-haru', 'calle-libre', 'sala-haru', 'sala-fundos', 'sala-nuhome'];
  var PL = null, IMG = {};
  NOMBRES.forEach(function (n) { var i = new Image(); i.alt = ''; i.className = 'plano'; i.dataset.placa = n; fondo.appendChild(i); IMG[n] = i; });
  // Deja el punto (x, y, z) del mundo en (cx, cy) de la pantalla, con k píxeles por unidad del dibujo
  function encuadrar(img, x, y, z, cx, cy, k) {
    var p = PL[img.dataset.placa], s = p.w / p.vb[2], sx = (x - y) * 32, sy = (x + y) * 16 - z * 39;
    var m = k / s, px = (sx - p.vb[0]) * s, py = (sy - p.vb[1]) * s;
    img.style.transform = 'translate(' + f2(cx - px * m) + 'px,' + f2(cy - py * m) + 'px) scale(' + (Math.round(m * 100000) / 100000) + ')';
  }
  // Una sala llena el cuadro, con un acercamiento lento (zoom) y un paneo (dx, en fracciones del ancho)
  function cubrir(img, zoom, dx) {
    var p = PL[img.dataset.placa], s = Math.max(W / p.w, H / p.h) * zoom;
    img.style.transform = 'translate(' + f2((W - p.w * s) / 2 + dx * W) + 'px,' + f2((H - p.h * s) / 2) + 'px) scale(' + (Math.round(s * 100000) / 100000) + ')';
  }

  // La cámara del mundo: [t, x, y, z, k]; dos claves en el mismo segundo son un corte
  var KH = V ? 1 : 0.8, ANCLA = V ? [W / 2, H * 0.47] : [W * 0.58, H * 0.5];
  var KF = [];
  function kf(t, x, y, z, k) { KF.push([t, x, y, z, k]); }
  (function () {
    kf(0, 12, 10, 2.4, 0.95); kf(G.techo, 12, 10, 1.8, 1.3); kf(G.entra, 12, 10, 1.3, 1.75);
    G.PARADAS.forEach(function (p, i) {
      var f = p.foco;
      if (i === 0) kf(p.t, f[0], f[1], f[2], p.k); else kf(p.t + 0.95, f[0], f[1], f[2], p.k);
      kf(p.t + 2 * G.COMPAS, f[0], f[1], f[2], p.k * 1.04);
    });
    // En la calle la cámara mira un poco más arriba (DZ): los locales quedan más abajo en el cuadro y se ve el barrio
    var DZ = V ? 3 : 2;
    kf(G.AFUERA + 1.1, 12, 10.5, 1.2, 1.25);
    kf(G.CALLE, 3.0, 22.3, 1 + DZ, 1.95); kf(G.CALLE + 4.6, 24.5, 22.3, 1 + DZ, 2.0);
    kf(M.local.t + 0.9, 11.85, 22.3, 1.0, 2.9); kf(M.sala.t, 11.85, 22.3, 1.0, 3.2); kf(M.sala.t + 0.45, 11.85, 23.2, 0.6, 5.6);
    kf(M.seguimos.t, 13.0, 22.3, 1 + DZ, 1.75); kf(M.seguimos.t + 2 * G.COMPAS, 21.0, 22.3, 1 + DZ, 1.85);
    kf(M.libre.t + 0.9, 33.15, 22.3, 1.0, 2.9); kf(M.cierre.t, 33.15, 22.3, 1.0, 3.25);
    kf(M.cierre.t, 12, 10, 1.2, 0.95); kf(G.total, 12, 10, 1.2, 1.08);
  })();
  function camara(t) {
    var i = 0; while (i < KF.length - 1 && KF[i + 1][0] <= t) i++;
    var a = KF[i], b = KF[Math.min(i + 1, KF.length - 1)];
    var u = b[0] > a[0] ? eInOut(prog(t, a[0], b[0])) : 1;
    return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), z: lerp(a[3], b[3], u), k: lerp(a[4], b[4], u) * KH };
  }
  // Dónde queda en pantalla un punto fijo con la cámara de t (para medir cuánto se mueve la imagen)
  function enPantalla(c) { return [((c.x - c.y) * 32) * c.k, ((c.x + c.y) * 16 - c.z * 39) * c.k]; }

  // Las tomas: qué fondo se ve desde cuándo, y cuánto demora en llegar (encima de la anterior)
  var TOMAS = [
    { placa: 'barrio', t: 0, entra: 0 },
    { placa: 'barrio-abierto', t: G.techo, entra: 0.9 },
    { placa: 'oficina', t: G.entra, entra: 0.8 },
    { placa: 'barrio', t: G.AFUERA + 0.5, entra: 0.8 },
    { placa: 'calle', t: G.CALLE - 0.6, entra: 0.6 },
    { placa: 'calle-haru', t: M.local.t + 1.0, entra: 0.8 },
    { placa: 'sala-haru', t: M.sala.t + 0.45, entra: 0.12, sala: true, dur: 1.45 },
    { placa: 'sala-fundos', t: M.sala.t + 1.9, entra: 0.12, sala: true, dur: 1.45 },
    { placa: 'sala-nuhome', t: M.sala.t + 3.35, entra: 0.12, sala: true, dur: 1.45 },
    { placa: 'sala-haru', t: M.enlace.t, entra: 0.35, sala: true, fondo: true, dur: 2 * G.COMPAS },
    { placa: 'calle', t: M.seguimos.t, entra: 0.3 },
    { placa: 'calle-libre', t: M.libre.t + 1.0, entra: 0.8 },
    { placa: 'barrio-abierto', t: M.cierre.t, entra: 0.25, cierre: true }
  ];
  var BASE = { oficina: 'barrio-abierto', calle: 'barrio', 'calle-haru': 'barrio', 'calle-libre': 'barrio' };
  function tomaEn(t) { var i = 0; while (i < TOMAS.length - 1 && TOMAS[i + 1].t <= t) i++; return i; }

  function fondos(t) {
    var i = tomaEn(t), T = TOMAS[i], A = i > 0 ? TOMAS[i - 1] : null, u = T.entra ? eInOut(prog(t, T.t, T.t + T.entra)) : 1;
    var c = camara(t), c0 = camara(Math.max(0, t - 1 / 30)), p1 = enPantalla(c), p0 = enPantalla(c0);
    var velocidad = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.abs(c.k - c0.k) / c.k * 900;
    var movido = clamp((velocidad - 6) * 0.12, 0, 7);
    var visibles = {};
    function pintar(placa, Tm, op, z) {
      var img = IMG[placa];
      img.style.opacity = f2(op); img.style.zIndex = z;
      if (Tm.sala) {
        var d = prog(t, Tm.t, Tm.t + Tm.dur);
        if (Tm.fondo) { cubrir(img, 1.06, 0); img.style.filter = 'blur(14px) brightness(.42) saturate(1.1)'; }
        else { cubrir(img, (V ? 1.0 : 1.1) - (V ? 0 : 0.1) * d + 0.08 * (1 - d), (V ? 0.16 - 0.32 * d : 0.03 - 0.06 * d)); img.style.filter = 'brightness(.98) saturate(1.08)'; }
      } else {
        encuadrar(img, c.x, c.y, c.z, ANCLA[0], ANCLA[1], c.k);
        var brillo = Tm.cierre ? 0.4 : 0.96, desenfoque = Tm.cierre ? 3 : movido;
        img.style.filter = 'brightness(' + brillo + ') saturate(1.1)' + (desenfoque > 0.2 ? ' blur(' + f2(desenfoque) + 'px)' : '');
      }
    }
    // Cada toma del mundo lleva debajo el barrio entero (más liviano), para que en los bordes de su foto siga el barrio
    var capas = [];
    function sumar(Tm, op) { if (BASE[Tm.placa]) capas.push([BASE[Tm.placa], Tm, op]); capas.push([Tm.placa, Tm, op]); }
    if (A && u < 1) sumar(A, 1);
    sumar(T, u);
    capas.forEach(function (k, z) { if (visibles[k[0]]) return; visibles[k[0]] = true; pintar(k[0], k[1], k[2], z + 1); });
    NOMBRES.forEach(function (n) { ver(IMG[n], !!visibles[n]); });
    return { c: c, velocidad: velocidad, vx: p1[0] - p0[0] };
  }

  /* ═════════ Velos, lugares, títulos y lo de cada momento ═════════ */
  var capaTextos = el('div', 'capa', '', escenario);
  var veloArriba = el('div', 'capa velo-arriba', '', capaTextos), veloAbajo = el('div', 'capa velo-abajo', '', capaTextos), veloLado = V ? null : el('div', 'capa velo-lado', '', capaTextos);
  css(veloArriba, { bottom: 'auto', height: (V ? 700 : 420) + 'px' });
  css(veloAbajo, { top: 'auto', height: (V ? 820 : 420) + 'px' });
  if (veloLado) css(veloLado, { right: 'auto', width: '1150px' });

  // La marca, en la entrada: «La oficina virtual de BiPlot» y BiPlot HQ
  var entrada = el('div', 'capa', '', capaTextos);
  var eCeja = el('div', 'ceja', 'La oficina virtual de BiPlot', entrada), eMarca = el('div', 'display', palabra(true), entrada);
  css(eCeja, V ? { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: '250px', fontSize: '26px' } : { position: 'absolute', left: '110px', top: '110px', fontSize: '26px' });
  css(eMarca, V ? { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: '300px', fontSize: '124px' } : { position: 'absolute', left: '104px', top: '160px', fontSize: '130px' });

  // El lugar de cada parada: su placa y su nombre
  var LUGARES = G.PARADAS.map(function (p) {
    var d = el('div', 'lugar', '<span class="placa">' + p.placa + '</span><span class="nombre">' + p.lugar + '</span>', capaTextos);
    css(d, V ? { left: '70px', top: '240px', width: '940px' } : { left: '110px', top: '96px', width: '1100px' });
    d.querySelector('.placa').style.fontSize = (V ? 28 : 30) + 'px';
    d.querySelector('.nombre').style.fontSize = (V ? (p.lugar.length > 22 ? 58 : 76) : 84) + 'px';
    return { p: p, d: d };
  });

  // Los títulos de afuera
  var TITULOS = ['calle', 'local', 'sala', 'enlace', 'seguimos', 'libre'].map(function (k) {
    var m = M[k], d = el('div', 'titulo', '<span>' + m.titulo[0] + '</span><span>' + m.titulo[1] + '</span>', capaTextos);
    css(d, V ? { left: '70px', top: '230px', width: '950px', fontSize: (k === 'libre' ? 120 : 82) + 'px' } : { left: '110px', top: '96px', width: '1060px', fontSize: (k === 'libre' ? 130 : 92) + 'px' });
    return { m: m, d: d, k: k };
  });

  // Las salas: una ficha por empresa
  var FICHAS = G.SALAS.map(function (s, i) {
    var d = el('div', 'ficha-sala', '<i></i>' + s.nombre + ' <em>· ' + s.rubro + '</em>', capaTextos);
    css(d, V ? { left: '70px', top: '470px', fontSize: '34px' } : { left: '110px', top: '330px', fontSize: '36px' });
    return { d: d, toma: TOMAS.filter(function (T) { return T.placa === 'sala-' + s.id && !T.fondo; })[0] };
  });

  // El teléfono con la sala de Haru y su enlace
  var tel = el('div', 'telefono', '<div class="pantalla"><img class="foto" alt=""><div class="barra"><span class="candado"></span><span>biplot.cl/oficina/<b>haru</b></span></div>' +
    '<div class="pie-tel"><span>Haru 360</span><span class="compartir">Compartir</span></div></div>', capaTextos);
  var TW = V ? 380 : 420, TH = V ? 700 : 840;
  css(tel, V ? { left: f2((W - TW) / 2) + 'px', top: '445px', width: TW + 'px', height: TH + 'px' } : { left: '1290px', top: '110px', width: TW + 'px', height: TH + 'px' });
  var telFoto = tel.querySelector('.foto'), telBarra = tel.querySelector('.barra'), telBoton = tel.querySelector('.compartir');
  telBarra.style.fontSize = (V ? 18 : 20) + 'px'; tel.querySelector('.pie-tel').style.fontSize = (V ? 23 : 26) + 'px'; telBoton.style.fontSize = (V ? 20 : 22) + 'px';
  // El enlace que sale del teléfono al tocar «Compartir», en grande para que se lea
  var enlace = el('div', 'enlace', '<i></i><span>biplot.cl/oficina/<b>haru</b></span>', capaTextos);
  css(enlace, V ? { left: '0', right: '0', margin: '0 auto', width: 'max-content', top: '1165px', fontSize: '36px' } : { left: '110px', top: '330px', fontSize: '40px' });

  // Lo que sigue después de la entrega
  var PUNTOS = M.seguimos.puntos.map(function (tx, i) {
    var d = el('div', 'punto', '<i></i>' + tx, capaTextos);
    css(d, V ? { left: '70px', top: (520 + i * 118) + 'px', fontSize: '40px' } : { left: '110px', top: (340 + i * 112) + 'px', fontSize: '40px' });
    return d;
  });

  // El cierre: la marca, la frase, la dirección y la invitación
  var cierre = el('div', 'capa', '', capaTextos);
  var cOnda = el('div', 'onda', '', cierre);
  var cMarca = el('div', 'marca', iso(V ? 210 : 170) + palabra(true), cierre), cLema = el('div', 'display', 'Tu proyecto, con local en el barrio.', cierre);
  var cUrl = el('div', 'display', 'biplot.cl/oficina', cierre), cCta = el('div', '', '<span class="cta">Agenda tu diagnóstico</span>', cierre);
  (function () {
    var pal = cMarca.querySelector('.palabra');
    if (V) { css(cMarca, { position: 'absolute', left: '0', right: '0', top: '420px', flexDirection: 'column', gap: '42px' }); pal.style.fontSize = '140px'; }
    else { css(cMarca, { position: 'absolute', left: '0', right: '0', top: '170px', gap: '40px' }); pal.style.fontSize = '150px'; }
    css(cLema, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 960 : 430) + 'px', fontSize: (V ? 54 : 60) + 'px', fontWeight: '600', color: '#E8EEF4' });
    css(cUrl, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 1050 : 520) + 'px', fontSize: '44px', color: '#7FD8CF', fontFamily: "'Space Mono', monospace" });
    css(cCta, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 1140 : 610) + 'px' });
    css(cCta.querySelector('.cta'), { fontSize: (V ? 40 : 38) + 'px', padding: '22px 52px' });
  })();

  /* ═════════ Plotty, el guía ═════════ */
  var PW = V ? 240 : 220, PH = PW * VB_P[3] / VB_P[2], PX = V ? 200 : 210, PY = V ? 1375 : 862;
  var plotty = el('div', 'plotty', '<svg viewBox="' + IL.plotty.vb + '"><use href="#il-plotty" width="' + VB_P[2] + '" height="' + VB_P[3] + '"/></svg>', escenario);
  css(plotty, { left: f2(PX - PW / 2) + 'px', top: f2(PY - PH / 2) + 'px', width: PW + 'px', height: f2(PH) + 'px' });
  var CARA_Y = (CAB_P[1] + CAB_P[3] / 2) / VB_P[3] * PH - PH / 2;   // la cara, respecto del centro
  var burbuja = el('div', 'burbuja', '<span class="dicho"></span><span class="cursor"></span><span class="falta" style="color:transparent"></span>', escenario);
  // (en vertical, lejos del borde derecho, donde Reels pone sus botones)
  var BW = V ? 600 : 760;
  css(burbuja, { left: (V ? 345 : 360) + 'px', width: 'max-content', maxWidth: BW + 'px', fontSize: '40px', padding: V ? '24px 30px' : '24px 32px' });
  var bDicho = burbuja.querySelector('.dicho'), bFalta = burbuja.querySelector('.falta'), bCursor = burbuja.querySelector('.cursor');
  // Las líneas de Plotty, con cuándo aparece la burbuja y cuándo se va
  var LINEAS = (function () {
    var l = [G.hola, G.muestro, G.pasa].map(function (x) { return { texto: x.linea, habla: x.habla }; });
    G.PARADAS.forEach(function (p) { l.push({ texto: p.linea, habla: p.habla }); });
    ['salida', 'calle', 'local', 'sala', 'enlace', 'seguimos', 'libre', 'cierre'].forEach(function (k) { l.push({ texto: M[k].linea, habla: M[k].habla }); });
    l.forEach(function (x) { x.desde = x.habla - 0.22; });
    l.forEach(function (x, i) { var sig = l[i + 1]; x.hasta = sig ? Math.min(sig.desde - 0.12, x.habla + x.texto.length / G.LETRAS + 3.2) : G.total - 0.5; });
    return l;
  })();

  function guia(t, mov) {
    // Llega volando desde la derecha y después flota; se inclina con la cámara y da un saltito al hablar
    var llega = eBack(prog(t, 0.3, 1.05)), vuela = 1 - llega;
    var x = PX + vuela * (W * 0.7) + Math.sin(t * 1.2) * 6, y = PY - vuela * (V ? 420 : 300) + Math.sin(t * 2.4) * 9;
    var incl = clamp(-mov.vx * 0.35, -11, 11) + vuela * 28;
    var salto = 0; LINEAS.forEach(function (l) { var u = prog(t, l.habla, l.habla + 0.32); if (u > 0 && u < 1) salto = Math.sin(Math.PI * u); });
    css(plotty, { transform: 'translate(' + f2(x - PX) + 'px,' + f2(y - PY - salto * 12) + 'px) rotate(' + f2(incl) + 'deg) scale(' + f2(1 + salto * 0.06) + ')', opacity: f2(clamp(prog(t, 0.3, 0.5) * 2, 0, 1)) });
    // La burbuja de la línea de ahora
    var L = null; LINEAS.forEach(function (l) { if (t >= l.desde && t < l.hasta) L = l; });
    ver(burbuja, !!L); if (!L) return;
    var n = clamp(Math.floor((t - L.habla) * G.LETRAS), 0, L.texto.length);
    if (burbuja.getAttribute('data-l') !== L.texto) { burbuja.setAttribute('data-l', L.texto); bDicho.textContent = ''; bFalta.textContent = L.texto; }
    if (bDicho.textContent.length !== n) { bDicho.textContent = L.texto.slice(0, n); bFalta.textContent = L.texto.slice(n); }
    bCursor.style.opacity = n < L.texto.length ? (Math.floor(t * 8) % 2 ? '1' : '.25') : '0';
    var a = prog(t, L.desde, L.desde + 0.22), b = prog(t, L.hasta - 0.2, L.hasta), alto = burbuja.offsetHeight;
    css(burbuja, { top: f2(y + CARA_Y - alto / 2 - salto * 12) + 'px', opacity: f2(clamp(a * 3, 0, 1) * (1 - b)), transform: 'scale(' + f2((0.6 + 0.4 * eBack(a)) * (1 - 0.08 * b)) + ')' });
  }

  /* ═════════ Cada cuadro ═════════ */
  function textos(t) {
    // La marca de la entrada
    var em = vida(t, G.muestro.t + 0.1, 0.5, G.techo + 0.6, 0.4); ver(entrada, em > 0);
    if (em > 0) { entrada.style.opacity = f2(em); eMarca.style.transform = 'translateY(' + f2((1 - eOut(prog(t, G.muestro.t + 0.1, G.muestro.t + 0.6))) * 26) + 'px)'; }
    // Los lugares de adentro
    LUGARES.forEach(function (L) {
      var p = L.p, o = vida(t, p.t + 0.55, 0.4, p.t + 2 * G.COMPAS - 0.15, 0.3); ver(L.d, o > 0); if (o <= 0) return;
      css(L.d, { opacity: f2(o), transform: 'translateX(' + f2((1 - eOut(prog(t, p.t + 0.55, p.t + 0.95))) * -34) + 'px)' });
    });
    // Los títulos de afuera
    TITULOS.forEach(function (T) {
      var a = T.m.t + 0.3, o = vida(t, a, 0.45, T.m.t + 2 * G.COMPAS - 0.1, 0.3); ver(T.d, o > 0); if (o <= 0) return;
      var e = eOut(prog(t, a, a + 0.5));
      css(T.d, { opacity: f2(o), transform: 'translateY(' + f2((1 - e) * 34) + 'px)', letterSpacing: f2((1 - e) * 0.03 - 0.035) + 'em' });
    });
    // Las fichas de las salas
    FICHAS.forEach(function (F) {
      var Tm = F.toma, o = vida(t, Tm.t + 0.15, 0.25, Tm.t + Tm.dur, 0.15); ver(F.d, o > 0); if (o <= 0) return;
      css(F.d, { opacity: f2(o), transform: 'translateX(' + f2((1 - eOut(prog(t, Tm.t + 0.15, Tm.t + 0.45))) * -30) + 'px)' });
    });
    // El teléfono con el enlace
    var te = M.enlace.t, ot = vida(t, te + 0.2, 0.1, M.seguimos.t, 0.25); ver(tel, ot > 0);
    if (ot > 0) {
      var sube = eBack(prog(t, te + 0.2, te + 0.8)), pulso = Math.sin(Math.PI * prog(t, te + 2.3, te + 2.65));
      css(tel, { opacity: f2(clamp(ot * 3, 0, 1)), transform: 'translateY(' + f2((1 - sube) * 380 + Math.sin(t * 1.6) * 6) + 'px) rotate(' + f2((1 - sube) * 6 - 1.5) + 'deg)' });
      var p = PL['sala-haru'], ph = TH - 36, pw = TW - 36, s = Math.max(pw / p.w, ph / p.h) * 1.02;
      css(telFoto, { transform: 'translate(' + f2((pw - p.w * s) / 2 - prog(t, te, te + 4.8) * 40) + 'px,' + f2((ph - p.h * s) / 2) + 'px) scale(' + s.toFixed(5) + ')' });
      telBoton.style.transform = 'scale(' + f2(1 + pulso * 0.14) + ')';
      telBoton.style.boxShadow = pulso > 0 ? '0 0 0 ' + f2(pulso * 12) + 'px rgba(23,195,178,.35)' : 'none';
    }
    var oe = vida(t, te + 2.45, 0.1, M.seguimos.t, 0.25); ver(enlace, oe > 0);
    if (oe > 0) {
      var sale = eBack(prog(t, te + 2.45, te + 2.95));
      css(enlace, { opacity: f2(clamp(oe * 3, 0, 1)), transform: 'translateY(' + f2((1 - sale) * (V ? -120 : 60)) + 'px) scale(' + f2(0.5 + 0.5 * sale) + ')' });
    }
    // Lo que sigue después de la entrega
    PUNTOS.forEach(function (d, i) {
      var a = M.seguimos.t + 0.95 + i * 0.45, o = vida(t, a, 0.35, M.libre.t - 0.05, 0.3); ver(d, o > 0); if (o <= 0) return;
      css(d, { opacity: f2(o), transform: 'translateX(' + f2((1 - eBack(prog(t, a, a + 0.45))) * (V ? 60 : 80)) + 'px)' });
    });
    // El cierre
    var tc = M.cierre.t, oc = t >= tc ? 1 : 0; ver(cierre, oc > 0);
    if (oc > 0) {
      var u = t - tc, e = eOut(prog(u, 0.05, 0.5)), sal = eIn(prog(t, G.total - 0.6, G.total));
      css(cMarca, { opacity: f2(clamp(prog(u, 0.05, 0.14) * 1.2, 0, 1) * (1 - sal)), transform: 'scale(' + f2(1.28 - 0.28 * e) + ')', filter: 'blur(' + f2((1 - e) * 6) + 'px)' });
      var l = eOut(prog(u, 1.2, 1.7)), w = eOut(prog(u, 2.4, 2.85)), b = eBack(prog(u, 2.65, 2.95));
      css(cLema, { opacity: f2(l * (1 - sal)), transform: 'translateY(' + f2((1 - l) * 24) + 'px)' });
      css(cUrl, { opacity: f2(w * (1 - sal)), transform: 'translateY(' + f2((1 - w) * 20) + 'px)' });
      css(cCta, { opacity: f2(clamp(b * 1.5, 0, 1) * (1 - sal)), transform: 'scale(' + f2(0.7 + 0.3 * b) + ')' });
      var o = prog(u, 0.05, 0.9), r = 60 + eOut(o) * (V ? 900 : 1100);
      css(cOnda, { display: o < 1 ? '' : 'none', width: f2(r * 2) + 'px', height: f2(r * 2) + 'px', left: f2(W / 2 - r) + 'px', top: f2((V ? 530 : 265) - r) + 'px', opacity: f2((1 - o) * 0.7), borderWidth: f2(8 * (1 - o) + 1) + 'px' });
    }
    // Los velos: más fuertes cuando hay algo que leer arriba
    var leer = 0;
    LUGARES.concat(TITULOS).forEach(function (x) { if (x.d.style.display !== 'none') leer = Math.max(leer, parseFloat(x.d.style.opacity || '0')); });
    if (entrada.style.display !== 'none') leer = Math.max(leer, em);
    veloArriba.style.opacity = f2(0.35 + 0.65 * leer);
    veloAbajo.style.opacity = f2(t < 0.4 ? 0 : 0.9);
    if (veloLado) veloLado.style.opacity = f2(0.25 + 0.6 * leer);
  }

  /* ── Luz, polvo, grano y destellos ── */
  var polvo = el('canvas'); polvo.id = 'polvo'; polvo.width = W; polvo.height = H; var pc = polvo.getContext('2d');
  var motas = (function () { var r = azar(77), a = []; for (var i = 0; i < 70; i++) a.push({ x: r() * W, y: r() * H, v: 10 + r() * 26, amp: 8 + r() * 26, f: 0.2 + r() * 0.5, s: 0.8 + r() * 2.4, al: 0.1 + r() * 0.4, fase: r() * 6.28 }); return a; })();
  el('div', 'capa vineta');
  var grano = el('canvas'); grano.id = 'grano'; grano.width = Math.round(W / 2); grano.height = Math.round(H / 2); css(grano, { width: W + 'px', height: H + 'px' });
  var gc = grano.getContext('2d'), tejas = [0, 1, 2, 3].map(function (n) {
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d'), img = x.createImageData(256, 256), r = azar(900 + n);
    for (var i = 0; i < img.data.length; i += 4) { var g = Math.floor(r() * 255); img.data[i] = img.data[i + 1] = img.data[i + 2] = g; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0); return c;
  });
  var destello = el('div', 'capa destello'), negro = el('div', 'capa negro');
  // [segundo, intensidad, duración]: el techo, el local que se abre, cada sala, la vuelta a la calle y el cierre
  var DESTELLOS = [[G.techo + 0.2, 0.3, 0.4], [M.local.t + 1.05, 0.28, 0.35], [M.sala.t + 0.45, 0.6, 0.3], [M.sala.t + 1.9, 0.35, 0.18], [M.sala.t + 3.35, 0.35, 0.18],
    [M.seguimos.t, 0.3, 0.25], [M.libre.t + 1.05, 0.28, 0.35], [M.cierre.t, 0.7, 0.35]];
  function efectos(t, cuadro) {
    var o = 0; DESTELLOS.forEach(function (d) { var u = t - d[0]; if (u >= 0 && u < d[2]) o = Math.max(o, d[1] * (1 - u / d[2])); });
    // La zambullida al local de Haru: todo se aclara justo antes de entrar a su sala
    o = Math.max(o, t < M.sala.t + 0.45 ? eIn(prog(t, M.sala.t + 0.1, M.sala.t + 0.45)) * 0.75 : 0);
    destello.style.opacity = f2(o);
    negro.style.opacity = f2(Math.max(1 - prog(t, 0, 0.45), prog(t, G.total - 0.5, G.total)));
    pc.clearRect(0, 0, W, H);
    motas.forEach(function (m) {
      var y = ((m.y - m.v * t) % (H + 100) + H + 100) % (H + 100) - 50, x = m.x + Math.sin(t * m.f + m.fase) * m.amp;
      pc.globalAlpha = m.al * 0.7; pc.fillStyle = '#DDF4F1'; pc.beginPath(); pc.arc(x, y, m.s, 0, 6.2832); pc.fill(); pc.globalAlpha = 1;
    });
    var r = azar(cuadro * 7 + 3), pat = gc.createPattern(tejas[cuadro % 4], 'repeat');
    gc.save(); gc.translate(-Math.floor(r() * 256), -Math.floor(r() * 256)); gc.fillStyle = pat; gc.fillRect(0, 0, grano.width + 256, grano.height + 256); gc.restore();
  }

  function cuadro(t) {
    t = clamp(t, 0, G.total);
    var mov = fondos(t);
    textos(t);
    guia(t, mov);
    efectos(t, Math.round(t * 30));
  }

  /* ── Listo: fuentes, placas y medidas ── */
  var listo = Promise.all([
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
    fetch(PLACAS_URL + 'placas.json').then(function (r) { return r.json(); }).then(function (j) {
      PL = j;
      var todas = NOMBRES.map(function (n) { return IMG[n]; }).concat([telFoto]);
      telFoto.dataset.placa = 'sala-haru';
      return Promise.all(todas.map(function (i) { i.src = PLACAS_URL + i.dataset.placa + '.jpg'; return i.decode ? i.decode().catch(function () {}) : new Promise(function (ok) { i.onload = i.onerror = ok; }); }));
    })
  ]).then(function () {
    return Promise.all(['700 100px "Space Grotesk"', '600 100px "Space Grotesk"', '700 40px "Space Mono"'].map(function (f) { return document.fonts.load(f); }));
  }).then(function () {
    cuadro(parseFloat(q.get('t') || '0'));
    document.documentElement.setAttribute('data-listo', '1');
  });

  window.VIDEO = { listo: listo, cuadro: cuadro, total: G.total, formato: FORMATO, ancho: W, alto: H };
})();
