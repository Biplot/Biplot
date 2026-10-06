/*
 * Oficina BiPlot · el teaser del equipo, cuadro a cuadro
 * Todo lo que se ve en el segundo t sale de TEASER.cuadro(t), sin relojes ni animaciones CSS: así cada cuadro se puede
 * grabar por separado (exportar-teaser.mjs) y cae justo con la música, que sale del mismo guion (guion.js).
 * window.TEASER = { listo: Promise, cuadro(t), total, formato, ancho, alto }
 * Los fondos son fotos grandes de la oficina y su barrio (placas.html), en /__placas/ (o en ?placas=<carpeta>).
 */
(function () {
  'use strict';

  var G = window.TEASER_GUION, D = window.OFICINA_DATOS, IL = window.Ilustraciones, EL = window.Elenco;
  var q = new URLSearchParams(location.search), FORMATO = q.get('formato') === '16x9' ? '16x9' : '9x16';
  var V = FORMATO === '9x16', W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  var PLACAS_URL = q.get('placas') || '/__placas/';
  var lienzo = document.getElementById('lienzo');
  lienzo.style.width = W + 'px'; lienzo.style.height = H + 'px'; lienzo.className = 'f-' + FORMATO;

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
  function eBack(x) { var c = 1.9; return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function f2(n) { return (Math.round(n * 100) / 100).toString(); }
  // Azar con semilla: cada cuadro sale igual cada vez que se dibuja
  function azar(semilla) { var a = semilla >>> 0; return function () { a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rgba(hex, a) { var h = hex.replace('#', ''); return 'rgba(' + parseInt(h.substr(0, 2), 16) + ',' + parseInt(h.substr(2, 2), 16) + ',' + parseInt(h.substr(4, 2), 16) + ',' + a + ')'; }

  /* ── Los dibujos: cada ilustración una vez (símbolo) y el isotipo ── */
  document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<linearGradient id="bp-sq-t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c426d"/><stop offset="1" stop-color="#0d2642"/></linearGradient>' +
    G.EQUIPO.map(function (p) { return '<symbol id="il-' + p.id + '" viewBox="' + IL[p.id].vb + '">' + IL[p.id].svg + '</symbol>'; }).join('') + '</defs></svg>');
  function vbDe(id) { return IL[id].vb.split(' ').map(Number); }
  function ilus(id) { var v = vbDe(id); return '<svg viewBox="' + IL[id].vb + '"><use href="#il-' + id + '" width="' + v[2] + '" height="' + v[3] + '"/></svg>'; }
  function cara(id, px) { var v = vbDe(id); return '<svg viewBox="' + IL[id].cabeza + '" width="' + px + '" height="' + px + '"><use href="#il-' + id + '" width="' + v[2] + '" height="' + v[3] + '"/></svg>'; }
  function iso(px) { return '<svg viewBox="0 0 100 100" width="' + px + '" height="' + px + '">' + EL.isotipo.replace(/url\(#bp-sq\)/g, 'url(#bp-sq-t)') + '</svg>'; }
  function palabra(hq) { return '<span class="palabra"><span class="bi">Bi</span><span class="plot">Plot</span>' + (hq ? '<span class="hq">HQ</span>' : '') + '</span>'; }
  var FLOTAN = { atlas: true, plotty: true };
  var POR_ID = {}; G.EQUIPO.forEach(function (p) { POR_ID[p.id] = p; });
  // La silueta de cada dibujo: dónde empieza y dónde termina su tinta en cada fila (en unidades del dibujo). Con ella la
  // burbuja no tapa una mano levantada y el elenco se reparte por lo que ocupa cada uno, no por su marco. Se mide una vez,
  // pintando el dibujo en un lienzo (como imagen, el SVG tiene que ser XML válido: se le quitan los atributos de nombre
  // inválido que el HTML deja pasar).
  var SILUETA = {};
  function medirSilueta(id) {
    var v = vbDe(id), e = 0.5, w = Math.round(v[2] * e), h = Math.round(v[3] * e), caja = document.createElement('div'), img = new Image();
    caja.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + IL[id].vb + '" width="' + w + '" height="' + h + '">' + IL[id].svg + '</svg>';
    Array.prototype.forEach.call(caja.querySelectorAll('*'), function (n) {
      Array.prototype.slice.call(n.attributes).forEach(function (a) { if (!/^[A-Za-z_][\w.:-]*$/.test(a.name)) n.removeAttribute(a.name); });
    });
    return new Promise(function (ok) {
      img.onload = img.onerror = ok;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(caja.firstChild));
    }).then(function () {
      var c = document.createElement('canvas'), x = c.getContext('2d'), izq = [], der = [];
      c.width = w; c.height = h;
      if (img.naturalWidth) x.drawImage(img, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data;
      for (var f = 0; f < h; f++) {
        var a = -1, b = -1;
        for (var k = 0; k < w; k++) if (d[(f * w + k) * 4 + 3] > 48) { if (a < 0) a = k; b = k; }
        izq.push(a < 0 ? Infinity : a / e); der.push(b < 0 ? -Infinity : (b + 1) / e);
      }
      SILUETA[id] = { e: e, izq: izq, der: der };
    });
  }
  // Hasta dónde llega la tinta del dibujo entre sus alturas y0 e y1 (lado -1: su borde izquierdo; 1: el derecho), o
  // ±Infinity si ahí no hay nada (o no se pudo medir)
  function borde(id, y0, y1, lado) {
    var s = SILUETA[id], r = lado < 0 ? Infinity : -Infinity;
    if (s) for (var f = Math.max(0, Math.floor(y0 * s.e)), n = Math.min(s.izq.length - 1, Math.ceil(y1 * s.e)); f <= n; f++) r = lado < 0 ? Math.min(r, s.izq[f]) : Math.max(r, s.der[f]);
    return r;
  }
  // Lo que ocupa el dibujo de lado a lado: [desde, hasta] en unidades del dibujo (sin silueta, su marco entero)
  function lados(id) {
    var v = vbDe(id), a = borde(id, 0, v[3], -1), b = borde(id, 0, v[3], 1);
    return isFinite(a) && isFinite(b) ? [a, b] : [0, v[2]];
  }

  /* ── Las placas: fotos grandes de la oficina, con su cámara ── */
  var PL = null, imagenes = [];
  function placa(nombre, padre) { var i = new Image(); i.alt = ''; i.className = 'plano'; i.dataset.placa = nombre; imagenes.push(i); (padre || lienzo).appendChild(i); return i; }
  // Deja el punto (x, y, z) del mundo en (cx, cy) de la pantalla, con k píxeles por unidad del dibujo
  function encuadrar(img, x, y, z, cx, cy, k) {
    var p = PL[img.dataset.placa], s = p.w / p.vb[2], sx = (x - y) * 32, sy = (x + y) * 16 - z * 39;
    var m = k / s, px = (sx - p.vb[0]) * s, py = (sy - p.vb[1]) * s;
    img.style.transform = 'translate(' + f2(cx - px * m) + 'px,' + f2(cy - py * m) + 'px) scale(' + (Math.round(m * 100000) / 100000) + ')';
  }

  /* ── El escenario (se sacude en los golpes) y lo que va encima de todo ── */
  var escenario = el('div', 'capa');
  var haces = document.createElement('div'); haces.className = 'capa';
  function capa(cls) { return el('div', 'capa ' + (cls || ''), '', escenario); }

  /* ═════════ 1. La intro: el problema, en cuatro frases ═════════ */
  var capaIntro = capa('grilla-fondo');
  // La planilla que no cuadra
  var planilla = el('div', 'capa', '', capaIntro), celdas = [];
  (function () {
    var r = azar(7), cols = V ? 6 : 11, filas = V ? 18 : 10, cw = 172, ch = 66;
    var x0 = (W - cols * cw) / 2, y0 = (H - filas * ch) / 2;
    for (var f = 0; f < filas; f++) for (var c = 0; c < cols; c++) {
      var d = el('div', 'celda', r() < 0.72 ? (Math.floor(r() * 900000) / 100).toLocaleString('es-CL', { minimumFractionDigits: 2 }) : '', planilla);
      css(d, { left: x0 + c * cw + 'px', top: y0 + f * ch + 'px', width: cw + 'px', height: ch + 'px', fontSize: '20px' });
      celdas.push({ d: d, mal: r() < 0.24 ? 2.6 + r() * 1.8 : -1 });
    }
    planilla.style.webkitMaskImage = planilla.style.maskImage = 'radial-gradient(ellipse ' + (V ? '70% 30%' : '45% 42%') + ' at 50% 50%, rgba(0,0,0,.08), #000 80%)';
  })();
  // Los chats que nadie ordena y la tarea de siempre, repetida
  var chats = el('div', 'capa', '', capaIntro), burbujasChat = [], tareas = [];
  (function () {
    var r = azar(11), n = V ? 12 : 10;
    for (var i = 0; i < n; i++) {
      var mio = i % 3 === 1, w = 250 + r() * 150;
      var d = el('div', 'chat' + (mio ? ' mio' : ''), '<i style="width:' + Math.round(55 + r() * 40) + '%"></i><i style="width:' + Math.round(35 + r() * 50) + '%"></i><b>' + (9 + Math.floor(i / 4)) + ':' + (10 + Math.floor(r() * 49)) + '</b>', chats);
      var izq = i % 2 === 0, x = izq ? 30 + r() * (V ? 60 : 220) : W - w - 30 - r() * (V ? 60 : 220);
      var y = V ? 150 + i * 132 + r() * 20 : 60 + (i >> 1) * 190 + r() * 40;
      css(d, { left: x + 'px', top: y + 'px', width: w + 'px', height: '96px' });
      burbujasChat.push({ d: d, t: 4.86 + i * 0.085, izq: izq });
    }
    for (var j = 0; j < 7; j++) {
      var tw = V ? 640 : 720, e2 = el('div', 'tarea', '<span></span>Copiar la planilla al sistema', chats);
      css(e2, { left: (W - tw) / 2 + 'px', width: tw + 'px', height: '80px', fontSize: '30px' });
      tareas.push({ d: e2, t: 6.05 + j * 0.13, j: j });
    }
  })();
  // Los puntos que se ordenan (como los del isotipo)
  var capaPuntos = el('div', 'capa', '', capaIntro), puntos = [];
  (function () {
    var r = azar(23), cols = V ? 8 : 14, filas = V ? 13 : 7, paso = V ? 118 : 118;
    var x0 = (W - (cols - 1) * paso) / 2, y0 = (H - (filas - 1) * paso) / 2;
    for (var f = 0; f < filas; f++) for (var c = 0; c < cols; c++) {
      var d = el('div', 'punto', '', capaPuntos);
      css(d, { width: '12px', height: '12px', marginLeft: '-6px', marginTop: '-6px' });
      puntos.push({ d: d, x0: r() * W, y0: r() * H, vx: (r() - 0.5) * 90, vy: (r() - 0.5) * 90, x1: x0 + c * paso, y1: y0 + f * paso, dl: r() * 0.3 });
    }
  })();
  var tarjetas = G.intro.map(function (c, i) {
    var d = el('div', 'tarjeta', '', capaIntro);
    var ls = c.lineas.map(function (l, j) {
      var fuerte = i === 3 && j === 1, p = el('p', 'linea' + (fuerte ? ' fuerte' : ''), l, d);
      p.style.fontSize = (fuerte ? (V ? 124 : 140) : (V ? 64 : 76)) + 'px';
      if (fuerte) p.style.marginTop = '14px';
      return p;
    });
    return { c: c, d: d, ls: ls };
  });

  function ajustarIntro() {
    ver(capaIntro, true);
    tarjetas.forEach(function (k) {
      ver(k.d, true);
      k.ls.forEach(function (p) {
        p.style.whiteSpace = 'nowrap'; p.style.display = 'inline-block';
        var max = parseFloat(p.style.fontSize), ancho = p.scrollWidth, cabe = W - 140;
        if (ancho > cabe) p.style.fontSize = Math.floor(max * cabe / ancho) + 'px';
        p.style.display = 'block';
      });
      ver(k.d, false);
    });
  }
  function intro(t) {
    var on = t < G.braam; ver(capaIntro, on); if (!on) return;
    tarjetas.forEach(function (k) {
      var c = k.c, vis = t >= c.t - 0.02 && t < c.fin + 0.02; ver(k.d, vis); if (!vis) return;
      k.ls.forEach(function (p, j) {
        var t0 = j > 0 && c.segunda ? c.segunda : c.t + j * 0.16;
        var a = eOut(prog(t, t0, t0 + 0.5)), b = eIn(prog(t, c.fin - 0.32, c.fin));
        css(p, { opacity: f2(a * (1 - b)), transform: 'translateY(' + f2((1 - a) * 30 - b * 16) + 'px) scale(' + f2(1 + b * 0.05) + ')',
          letterSpacing: f2((1 - a) * 0.09) + 'em', filter: 'blur(' + f2((1 - a) * 9 + b * 7) + 'px)' });
      });
    });
    // La planilla: se inclina, sube y se le prenden las celdas que no cuadran
    var c1 = G.intro[1], pv = t >= c1.t && t < c1.fin + 0.05; ver(planilla, pv);
    if (pv) {
      var u = t - c1.t;
      css(planilla, { opacity: f2(prog(t, c1.t, c1.t + 0.2) * (1 - prog(t, c1.fin - 0.28, c1.fin))), transform: 'perspective(1600px) rotateX(26deg) translateY(' + f2(-u * 70) + 'px) scale(1.18)' });
      celdas.forEach(function (k) { var m = k.mal > 0 && t >= k.mal; if (k.d.classList.contains('mal') !== m) k.d.classList.toggle('mal', m); });
    }
    // Los chats aparecen de a uno; después, la misma tarea una y otra vez
    var c2 = G.intro[2], cv = t >= c2.t && t < c2.fin + 0.05; ver(chats, cv);
    if (cv) {
      chats.style.opacity = f2(1 - prog(t, c2.fin - 0.28, c2.fin));
      burbujasChat.forEach(function (b) {
        var a = prog(t, b.t, b.t + 0.24), e = eBack(a), apaga = prog(t, 5.95, 6.25);
        css(b.d, { opacity: f2(clamp(a * 3, 0, 1) * (1 - apaga * 0.65)), transform: 'translateX(' + f2((1 - e) * (b.izq ? -60 : 60)) + 'px) scale(' + f2(0.7 + 0.3 * e) + ')' });
      });
      tareas.forEach(function (k) {
        var a = prog(t, k.t, k.t + 0.18), e = eBack(a), y = (V ? H * 0.7 : H * 0.72) - k.j * (V ? 26 : 22);
        css(k.d, { top: f2(y) + 'px', opacity: f2(clamp(a * 2.5, 0, 1) * (0.4 + 0.6 * (k.j / 6))), transform: 'translateY(' + f2((1 - e) * 60) + 'px) scale(' + f2(0.92 + 0.08 * e) + ')' });
      });
    }
    // Los puntos: sueltos cuando aparece «Alguien tenía que», en su lugar con «ordenarlo.»
    var c3 = G.intro[3], dv = t >= c3.t && t < G.braam; ver(capaPuntos, dv);
    if (dv) {
      var ord = G.intro[3].segunda, sale = prog(t, c3.fin - 0.25, c3.fin);
      puntos.forEach(function (k) {
        var a = eInOut(prog(t, ord + k.dl * 0.6, ord + 0.75 + k.dl)), s = t - c3.t;
        var x = lerp(k.x0 + k.vx * s, k.x1, a), y = lerp(k.y0 + k.vy * s, k.y1, a);
        css(k.d, { transform: 'translate(' + f2(x) + 'px,' + f2(y) + 'px) scale(' + f2(0.6 + 0.6 * a) + ')', opacity: f2((0.18 + 0.6 * a) * prog(t, c3.t, c3.t + 0.4) * (1 - sale)) });
      });
    }
  }

  /* ═════════ 2. La oficina: de noche, cerrada; se va el techo y aparece BiPlot HQ ═════════ */
  var capaEst = capa(); capaEst.style.background = '#061525';
  var estCerrado = placa('barrio', capaEst), estAbierto = placa('barrio-abierto', capaEst);
  var estVelo = el('div', 'capa', '', capaEst); estVelo.style.background = 'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(4,13,24,.72), rgba(4,13,24,.94))';
  var estNegro = el('div', 'capa', '', capaEst); estNegro.style.background = '#040D18';
  var estOnda = el('div', 'onda', '', capaEst);
  var estTitulo = el('div', 'capa', '', capaEst);
  var estRayo = el('div', 'rayo', '', capaEst);
  var tEtiqueta = el('div', 'etiqueta', 'La oficina', estTitulo), tMarca = el('div', 'marca', '', estTitulo), tConoce = el('div', 'display', 'Conoce al equipo.', estTitulo);
  (function () {
    var isoPx = V ? 230 : 190;
    tMarca.innerHTML = iso(isoPx) + palabra(true);
    var pal = tMarca.querySelector('.palabra');
    if (V) { css(tMarca, { position: 'absolute', left: '0', right: '0', top: '640px', flexDirection: 'column', gap: '46px' }); pal.style.fontSize = '150px'; }
    else { css(tMarca, { position: 'absolute', left: '0', right: '0', top: '380px', gap: '44px' }); pal.style.fontSize = '170px'; }
    css(tEtiqueta, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 560 : 300) + 'px', fontSize: '30px' });
    css(tConoce, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 1190 : 700) + 'px', fontSize: (V ? 56 : 60) + 'px', fontWeight: '600', color: '#DDF4F1' });
  })();
  var EST_K = V ? [1.55, 1.95] : [1.02, 1.36];

  function establecer(t) {
    var on = t >= G.braam && t < G.equipo + 0.02; ver(capaEst, on); if (!on) return;
    var u = prog(t, G.braam, G.equipo), k = lerp(EST_K[0], EST_K[1], eInOut(u)), sal = eIn(prog(t, G.equipo - 0.45, G.equipo));
    k *= 1 + sal * 0.6;
    var foco = V ? [10.6, 9.2, 3.0] : [12, 10, 1.6];
    encuadrar(estCerrado, foco[0], foco[1], foco[2], W / 2, H * 0.5, k);
    encuadrar(estAbierto, foco[0], foco[1], foco[2], W / 2, H * 0.5, k);
    estAbierto.style.opacity = f2(eInOut(prog(t, G.techo, G.techo + 0.9)));
    var brillo = 0.75 + 0.35 * prog(t, G.techo, G.techo + 0.9);
    estCerrado.style.filter = estAbierto.style.filter = 'brightness(' + f2(brillo) + ') saturate(1.1) blur(' + f2(sal * 10) + 'px)';
    estNegro.style.opacity = f2(1 - eOut(prog(t, G.braam, G.braam + 0.5)));
    // El título: se oscurece la oficina, golpe, onda y «Conoce al equipo»
    var tt = prog(t, G.titulo, G.titulo + 0.42);
    estVelo.style.opacity = f2(eOut(prog(t, G.titulo - 0.1, G.titulo + 0.25)) * 0.92);
    ver(estTitulo, t >= G.titulo);
    if (t >= G.titulo) {
      var e = eOut(tt), s = 1.32 - 0.32 * e;
      css(tMarca, { transform: 'scale(' + f2(s * (1 + sal * 0.25)) + ')', opacity: f2(clamp(tt * 5, 0, 1) * (1 - sal)), filter: 'blur(' + f2((1 - e) * 6 + sal * 8) + 'px)' });
      css(tEtiqueta, { opacity: f2(prog(t, G.titulo + 0.25, G.titulo + 0.6) * (1 - sal)), letterSpacing: f2(0.7 - 0.32 * eOut(prog(t, G.titulo + 0.25, G.titulo + 0.9))) + 'em' });
      var c = eOut(prog(t, G.conoce, G.conoce + 0.45));
      css(tConoce, { opacity: f2(c * (1 - sal)), transform: 'translateY(' + f2((1 - c) * 24) + 'px)' });
      var o = prog(t, G.titulo, G.titulo + 0.8), r = 60 + eOut(o) * (V ? 900 : 1100);
      css(estOnda, { display: o < 1 ? '' : 'none', width: f2(r * 2) + 'px', height: f2(r * 2) + 'px', left: f2(W / 2 - r) + 'px', top: f2(H * (V ? 0.42 : 0.47) - r) + 'px', opacity: f2((1 - o) * 0.8), borderWidth: f2(8 * (1 - o) + 1) + 'px' });
    } else estOnda.style.display = 'none';
    rayo(estRayo, t, G.titulo, V ? 0.535 : 0.47);
  }
  // El trazo de luz: una línea que se abre de lado a lado desde el centro y se apaga
  function rayo(e, t, t0, y) {
    var u = prog(t, t0, t0 + 0.7); if (u <= 0 || u >= 1) { e.style.display = 'none'; return; }
    css(e, { display: '', left: '0', width: W + 'px', top: f2(H * y - 3) + 'px', height: '6px', transform: 'scaleX(' + f2(eOut(clamp(u * 2.2, 0, 1))) + ')', opacity: f2(1 - eIn(u)),
      background: 'linear-gradient(90deg, transparent, rgba(127,216,207,.9) 35%, #fff 50%, rgba(127,216,207,.9) 65%, transparent)', boxShadow: '0 0 30px 6px rgba(23,195,178,.55)' });
  }

  /* ═════════ 3. El equipo, uno por uno ═════════ */
  var capaRev = capa();
  var NOMBRE_MAX = V ? 180 : 190, NOMBRE_ANCHO = V ? 960 : 900;
  // Las personas, todas a la misma escala: el marco de su dibujo (600 × 1260, con el suelo en y = 1240) mide ALTO en
  // pantalla y sus pies quedan en SUELO, así cada una tiene la altura que le da su dibujo. Atlas y Plotty flotan, de
  // ANCHO de ancho y centrados en FLOTA. La luz y el piso de cada uno miden lo mismo para todos (ANCHO).
  var ALTO = V ? 1144 : 971, SUELO = V ? 1667 : 1047, PIE = 1240 / 1260, ANCHO = V ? 660 : 560, FLOTA = V ? 1120 : 520;
  G.EQUIPO.forEach(function (p, i) {
    var d = el('div', 'personaje', '', capaRev), v = vbDe(p.id), cab = IL[p.id].cabeza.split(' ').map(Number), flota = FLOTAN[p.id];
    // En horizontal se turnan: uno a la derecha, el siguiente a la izquierda (en vertical, todos igual, para leer fácil)
    var izq = !V && i % 2 === 1;
    var fondo = placa('oficina', d);
    var velo = el('div', 'velo', '', d);
    var numero = el('div', 'numero', p.placa, d);
    var cono = el('div', 'cono', '', d), piso = el('div', 'piso', '', d);
    var figura = el('div', 'figura', ilus(p.id), d);
    var rotulo = el('div', 'rotulo', '<span class="placa">' + p.placa + '</span><span class="rol">' + p.rol + '</span>', d);
    var partes = p.nombre.match(/^(The) (.+)$/);
    var nombre = el('div', 'nombre display', partes ? '<span class="pre">' + partes[1] + '</span>' + partes[2] : p.nombre, d);
    var burbuja = el('div', 'burbuja', '<span class="dicho"></span><span class="cursor"></span><span class="falta" style="color:transparent"></span>', d);
    burbuja.querySelector('.falta').textContent = p.linea;
    // La figura: parada al fondo (o flotando, Atlas y Plotty), a un lado, con la cara (el recorte cabeza) en cx; la cara
    // manda dónde va la burbuja (ajustarBurbujas)
    var FW = flota ? ANCHO : ALTO * v[2] / v[3], FH = FW * v[3] / v[2], k = FW / v[2], cx = V ? 690 : izq ? 520 : 1400;
    var top = flota ? FLOTA - FH / 2 : SUELO - FH * PIE, izqFig = cx - (cab[0] + cab[2] / 2) * k;
    css(figura, { left: f2(izqFig) + 'px', top: f2(top) + 'px', width: f2(FW) + 'px', height: f2(FH) + 'px' });
    var caraX = cx, caraY = top + (cab[1] + cab[3] / 2) * k, radio = cab[2] / 2 * k;
    if (izq) burbuja.classList.add('cola-izq');
    css(burbuja, { fontSize: (V ? 42 : 46) + 'px', padding: V ? '30px 34px' : '32px 40px' });
    css(numero, V ? { right: '-40px', top: '430px', fontSize: '720px' } : izq ? { left: '-30px', top: '40px', fontSize: '680px' } : { right: '-30px', top: '40px', fontSize: '680px' });
    numero.style.webkitTextStroke = '3px ' + rgba(p.acento, 0.55);
    css(cono, { left: f2(cx - ANCHO * 0.75) + 'px', top: '-40px', width: f2(ANCHO * 1.5) + 'px', height: f2(top + FH + 80) + 'px',
      background: 'linear-gradient(to bottom, ' + rgba(p.acento, 0.42) + ', ' + rgba(p.acento, 0.06) + ' 70%, transparent)', clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)', mixBlendMode: 'screen', filter: 'blur(10px)' });
    var pisoY = flota ? top + FH + 120 : SUELO;
    css(piso, { left: f2(cx - ANCHO * 0.55) + 'px', top: f2(pisoY - 55) + 'px', width: f2(ANCHO * 1.1) + 'px', height: '110px', background: 'radial-gradient(ellipse at 50% 50%, ' + rgba(p.acento, 0.55) + ', transparent 70%)' });
    velo.style.background = 'radial-gradient(ellipse 55% 45% at ' + f2(cx / W * 100) + '% ' + f2(caraY / H * 100 + 12) + '%, ' + rgba(p.acento, 0.3) + ', transparent 70%), ' +
      'linear-gradient(to bottom, rgba(4,13,24,.9), rgba(4,13,24,.35) 38%, rgba(4,13,24,.5) 70%, rgba(4,13,24,.95))';
    var rot = rotulo.querySelector('.placa'), rol = rotulo.querySelector('.rol');
    rot.style.background = p.acento; rol.style.color = p.acento;
    rot.style.fontSize = rol.style.fontSize = (V ? 28 : 30) + 'px';
    if (V) { css(rotulo, { left: '60px', top: '258px' }); css(nombre, { left: '56px', top: '320px' }); }
    else if (izq) { css(rotulo, { left: '1000px', top: '640px' }); css(nombre, { left: '994px', top: '700px' }); }
    else { css(rotulo, { left: '140px', top: '640px' }); css(nombre, { left: '134px', top: '700px' }); }
    p.dom = { raiz: d, fondo: fondo, numero: numero, cono: cono, piso: piso, figura: figura, rotulo: rotulo, nombre: nombre, burbuja: burbuja,
      dicho: burbuja.querySelector('.dicho'), falta: burbuja.querySelector('.falta'), cursor: burbuja.querySelector('.cursor'), cx: cx, caraY: caraY, lado: izq ? -1 : 1,
      marco: { x: izqFig, y: top, k: k }, cara: { x: caraX, y: caraY, radio: radio } };
  });
  // El nombre, lo más grande que quepa
  function ajustarNombres() {
    ver(capaRev, true);
    G.EQUIPO.forEach(function (p) {
      var n = p.dom.nombre; ver(p.dom.raiz, true); n.style.fontSize = NOMBRE_MAX + 'px';
      var ancho = n.scrollWidth; if (ancho > NOMBRE_ANCHO) n.style.fontSize = Math.floor(NOMBRE_MAX * NOMBRE_ANCHO / ancho) + 'px';
      ver(p.dom.raiz, false);
    });
  }
  // Una burbuja junto a una cara: a su lado (lado -1, a la izquierda; 1, a la derecha), a `aire` del recorte de la cara y
  // con su borde de arriba en `top`; si en su franja el dibujo asoma más allá (una mano, un teléfono, un rotor), se corre
  // hasta dejarle `aire` también a esa tinta; si así necesita más renglones, busca más arriba o más abajo el lugar más
  // cercano donde necesite menos, siempre con la cola (a 50 px de su borde de arriba) apuntando al recorte de la cara.
  // ancho: el que tendría sin estorbos; entre: el espacio [desde, hasta] de la pantalla donde puede ir; tope: hasta dónde
  // puede bajar. Se mide con la frase entera.
  function ponerBurbuja(b, linea, id, marco, cara, lado, o) {
    var dicho = b.querySelector('.dicho'), falta = b.querySelector('.falta');
    function probar(top) {
      var borde0 = cara.x + lado * (cara.radio + o.aire), a, z;
      for (var vuelta = 0; vuelta < 6; vuelta++) {
        a = lado < 0 ? Math.max(o.entre[0], borde0 - o.ancho) : borde0; z = lado < 0 ? borde0 : Math.min(o.entre[1], borde0 + o.ancho);
        css(b, { left: f2(a) + 'px', width: f2(z - a) + 'px', top: f2(top) + 'px' });
        if (o.tope != null && top + b.offsetHeight > o.tope) { top = o.tope - b.offsetHeight; b.style.top = f2(top) + 'px'; }
        // (con holgura arriba y abajo: la figura se mece)
        var tinta = marco.x + borde(id, (top - 18 - marco.y) / marco.k, (top + b.offsetHeight + 18 - marco.y) / marco.k, lado) * marco.k;
        var nuevo = lado < 0 ? Math.min(borde0, tinta - o.aire) : Math.max(borde0, tinta + o.aire);
        if (Math.abs(nuevo - borde0) < 0.5) break;
        borde0 = nuevo;
      }
      return { a: a, z: z, top: top, ancho: z - a, alto: b.offsetHeight };
    }
    dicho.textContent = linea; falta.textContent = '';
    var mejor = probar(o.top), libre = probar(-1e4).alto;   // (lejos de todo: sus renglones sin estorbos)
    if (mejor.alto > libre + 1) {
      for (var dy = 10; dy <= 2 * cara.radio; dy += 10) [o.top - dy, o.top + dy].forEach(function (top) {
        var cola = top + 50;
        if (cola < cara.y - cara.radio + 20 || cola > cara.y + cara.radio - 20) return;
        var r = probar(top);
        if (r.alto < mejor.alto - 1) mejor = r;
      });
    }
    css(b, { left: f2(mejor.a) + 'px', width: f2(mejor.ancho) + 'px', top: f2(mejor.top) + 'px' });
    dicho.textContent = ''; falta.textContent = linea;
  }
  // Cada burbuja junto a su cara; en horizontal, con su frase entera, sin bajar hasta el rótulo
  function ajustarBurbujas() {
    ver(capaRev, true);
    G.EQUIPO.forEach(function (p) {
      var o = p.dom; ver(o.raiz, true);
      ponerBurbuja(o.burbuja, p.linea, p.id, o.marco, o.cara, o.lado < 0 ? 1 : -1,
        { aire: 46, top: o.cara.y - 70, ancho: V ? 500 : 700, entre: V ? [50, W - 50] : [140, W - 140], tope: V ? null : o.rotulo.offsetTop - 44 });
      ver(o.raiz, false);
    });
  }

  function revelacion(t) {
    var on = t >= G.equipo && t < G.motor; ver(capaRev, on);
    G.EQUIPO.forEach(function (p, i) {
      var u = t - p.t, act = on && u >= 0 && u < G.DURA; ver(p.dom.raiz, act); if (!act) return;
      var o = p.dom, sal = eIn(prog(u, G.DURA - 0.32, G.DURA)), f = p.fondo;
      // El fondo: su rincón de la oficina, desenfocado, con la cámara acercándose
      var k = (V ? 2.35 : 1.9) * (1 + 0.1 * (u / G.DURA)) * (1 + sal * 0.25);
      encuadrar(o.fondo, f[0], f[1], f[2], V ? W * 0.55 : W * (o.lado < 0 ? 0.38 : 0.62), H * 0.46, k);
      o.fondo.style.filter = 'blur(' + f2(8 + sal * 8) + 'px) brightness(' + f2(0.5 * (0.6 + 0.4 * prog(u, 0, 0.5))) + ') saturate(1.15)';
      // El número de su placa, enorme, detrás
      var nu = eOut(prog(u, 0.05, 0.6));
      css(o.numero, { opacity: f2(nu * 0.9 * (1 - sal)), transform: 'translateY(' + f2(-u * 22 + (1 - nu) * 60) + 'px) scale(' + f2(1.12 - 0.12 * nu) + ')' });
      // La luz se prende: primero la silueta con su borde de color, después el personaje
      var misterio = p.id === 'architect' || p.id === 'engine';
      var luz = misterio ? eOut(prog(u, 0.62, 0.95)) : eOut(prog(u, 0.22, 0.55)), parpadeo = u < 0.22 ? (Math.sin(u * 90) > 0 ? 0.7 : 0.25) : 1;
      var ruido = misterio && u > 0.18 && u < 0.72 ? (Math.floor(u * 26) % 4 === 1 ? 1 : 0) : 0;
      o.cono.style.opacity = f2(parpadeo * (0.55 + 0.45 * luz) * (1 - sal));
      o.piso.style.opacity = f2((0.4 + 0.6 * luz) * (1 - sal));
      var entra = eOut(prog(u, 0, 0.6)), flota = FLOTAN[p.id] ? Math.sin(u * 2.4) * 14 : Math.sin(u * 1.9) * 5;
      css(o.figura, { transform: 'translate(' + f2((1 - entra) * 70 * o.lado + ruido * (Math.floor(u * 40) % 2 ? 14 : -10)) + 'px,' + f2(flota) + 'px) scale(' + f2((1.07 - 0.07 * entra) * (1 + sal * 0.14)) + ')',
        filter: 'brightness(' + f2(0.04 + 0.96 * luz + ruido * 0.5) + ') drop-shadow(' + (ruido ? '9px 0 0 ' + rgba(p.acento, 0.8) + ') drop-shadow(-7px 0 0 rgba(255,255,255,.5)' : '0 0 ' + f2(26 - 10 * luz) + 'px ' + rgba(p.acento, 0.75)) + ') blur(' + f2(sal * 9) + 'px)',
        opacity: f2(1 - sal) });
      // Su placa y su rol; el nombre cae de golpe (con un temblor de color los primeros cuadros)
      var ro = eOut(prog(u, 0.2, 0.5));
      css(o.rotulo, { opacity: f2(ro * (1 - sal)), transform: 'translateX(' + f2(((1 - ro) * -40 - sal * 60) * o.lado) + 'px)' });
      var no = prog(u, 0.3, 0.46), ne = eOut(no), glitch = u > 0.3 && u < 0.46 ? 1 - no : 0;
      css(o.nombre, { opacity: f2(clamp(no * 4, 0, 1) * (1 - sal)), transform: 'translateX(' + f2(-sal * 80 * o.lado) + 'px) scale(' + f2(1.45 - 0.45 * ne) + ')', transformOrigin: '0 50%',
        letterSpacing: f2((1 - ne) * 0.16 - 0.02) + 'em',
        textShadow: glitch ? f2(10 * glitch) + 'px 0 ' + rgba(p.acento, 0.9) + ', ' + f2(-8 * glitch) + 'px 0 rgba(255,255,255,.6)' : '0 6px 40px rgba(0,0,0,.5)' });
      // La burbuja: aparece y su línea se va escribiendo, al ritmo de su voz
      var bu = prog(u, 1.0, 1.28), n = clamp(Math.floor((t - p.habla) * p.letras), 0, p.linea.length);
      css(o.burbuja, { opacity: f2(clamp(bu * 4, 0, 1) * (1 - sal)), transform: 'scale(' + f2((0.55 + 0.45 * eBack(bu)) * (1 - sal * 0.1)) + ') translateY(' + f2(-sal * 30) + 'px)' });
      if (o.dicho.textContent.length !== n) { o.dicho.textContent = p.linea.slice(0, n); o.falta.textContent = p.linea.slice(n); }
      o.cursor.style.opacity = n < p.linea.length ? (Math.floor(t * 8) % 2 ? '1' : '.25') : '0';
    });
  }

  /* ═════════ 4. El motor: diez fases, una por medio pulso ═════════ */
  var capaMot = capa('grilla-fondo'); capaMot.style.background = '#061525';
  var motFondo = placa('oficina', capaMot);
  var motVelo = el('div', 'capa', '', capaMot); motVelo.style.background = 'radial-gradient(ellipse at 50% 50%, rgba(4,13,24,.72), rgba(4,13,24,.93))';
  var motT1 = el('div', 'display', 'Diez fases.', capaMot), motT2 = el('div', 'display', 'Un solo motor.', capaMot);
  css(motT1, { position: 'absolute', left: '0', right: '0', textAlign: 'center', fontSize: (V ? 118 : 104) + 'px', top: (V ? 290 : 110) + 'px' });
  css(motT2, { position: 'absolute', left: '0', right: '0', textAlign: 'center', fontSize: (V ? 118 : 104) + 'px', top: (V ? 410 : 222) + 'px', color: '#17C3B2' });
  var hiloSvg = el('div', 'hilo', '', capaMot), fichas = [];
  (function () {
    var cols = V ? 2 : 5, fw = V ? 468 : 342, fh = V ? 150 : 178, gx = V ? 24 : 24, gy = V ? 26 : 34;
    var x0 = (W - (cols * fw + (cols - 1) * gx)) / 2, y0 = V ? 640 : 420, pts = [];
    D.fases.forEach(function (fa, i) {
      var c = i % cols, r = Math.floor(i / cols), x = x0 + c * (fw + gx), y = y0 + r * (fh + gy);
      var d = el('div', 'ficha-fase', '<span class="placa">' + fa.id + '</span><span class="fase">' + fa.nombre + '</span><span class="caras">' + fa.quien.map(function (id) { return cara(id, V ? 74 : 58); }).join('') + '</span>', capaMot);
      css(d, { left: x + 'px', top: y + 'px', width: fw + 'px', height: fh + 'px' });
      var pl = d.querySelector('.placa'); css(pl, V ? { fontSize: '30px', width: '86px', padding: '6px 0' } : { fontSize: '26px', width: '70px', padding: '5px 0' });
      d.querySelector('.fase').style.fontSize = (V ? 34 : 27) + 'px';
      if (!V) css(d, { gap: '12px', padding: '0 14px' });
      Array.prototype.forEach.call(d.querySelectorAll('.caras svg'), function (s, j) { if (j) s.style.marginLeft = '-18px'; });
      fichas.push({ d: d, t: G.motorPlacas + i * G.PULSO / 2 });
      pts.push([x + fw / 2, y + fh / 2]);
    });
    hiloSvg.innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><polyline points="' + pts.map(function (p) { return p.join(','); }).join(' ') +
      '" fill="none" stroke="#7FD8CF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 12px #17C3B2)"/></svg>';
  })();
  var hilo = hiloSvg.querySelector('polyline'), hiloLargo = 0;

  function motor(t) {
    var on = t >= G.motor && t < G.elenco + 0.02; ver(capaMot, on); if (!on) return;
    var u = t - G.motor, sal = eIn(prog(t, G.elenco - 0.35, G.elenco));
    encuadrar(motFondo, 12, 10, 1.0, W / 2, H / 2, (V ? 1.05 : 1.2) * (1 + u * 0.02));
    motFondo.style.filter = 'blur(10px) brightness(.55)';
    [[motT1, G.motor], [motT2, G.motor + G.PULSO]].forEach(function (a) {
      var e = eOut(prog(t, a[1], a[1] + 0.35)), g = t > a[1] && t < a[1] + 0.14;
      css(a[0], { opacity: f2(clamp(prog(t, a[1], a[1] + 0.08) * 1.5, 0, 1) * (1 - sal)), transform: 'scale(' + f2(1.3 - 0.3 * e + sal * 0.2) + ')', textShadow: g ? '9px 0 rgba(23,195,178,.9), -7px 0 rgba(255,255,255,.6)' : 'none' });
    });
    fichas.forEach(function (f, i) {
      var a = prog(t, f.t, f.t + 0.3), e = eBack(a), prendida = t >= f.t, pulso = prog(t, G.motor + 4.2, G.motor + 4.5);
      css(f.d, { opacity: f2((prendida ? 1 : 0.22 * prog(t, G.motor + 0.2, G.motor + 0.6)) * (1 - sal)), transform: 'scale(' + f2((prendida ? 0.82 + 0.18 * e : 0.96) * (1 + sal * 0.1) * (1 + Math.sin(pulso * Math.PI) * 0.05)) + ')',
        borderColor: prendida ? 'rgba(127,216,207,' + f2(0.35 + 0.6 * (1 - a)) + ')' : 'rgba(127,216,207,.15)',
        boxShadow: prendida ? '0 0 ' + f2(40 * (1 - a) + 16 + Math.sin(pulso * Math.PI) * 30) + 'px rgba(23,195,178,' + f2(0.25 + 0.45 * (1 - a)) + ')' : 'none' });
    });
    // El hilo del motor recorre las diez fases, en orden
    if (!hiloLargo) { hiloLargo = hilo.getTotalLength(); hilo.style.strokeDasharray = hiloLargo; }
    var h = eInOut(prog(t, G.motorPlacas + 9 * G.PULSO / 2 + 0.1, G.motor + 4.2));
    hilo.style.strokeDashoffset = f2(hiloLargo * (1 - h));
    hiloSvg.style.opacity = f2((h > 0 ? 0.85 : 0) * (1 - sal));
  }

  /* ═════════ 5. Todos juntos ═════════ */
  var capaEle = capa();
  var eleLuz = el('div', 'capa', '', capaEle);
  eleLuz.style.background = 'radial-gradient(ellipse 58% 40% at 50% ' + (V ? '58%' : '62%') + ', rgba(23,195,178,.5), transparent 70%), radial-gradient(ellipse 80% 30% at 50% 100%, rgba(127,216,207,.28), transparent 70%), #040D18';
  var eleGrupo = el('div', 'capa', '', capaEle);
  var eleTit = el('div', 'display', V ? 'Del diagnóstico<br>a la cosecha.' : 'Del diagnóstico a la cosecha.', capaEle);
  css(eleTit, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 260 : 80) + 'px', fontSize: (V ? 100 : 88) + 'px', lineHeight: '1.02' });
  // Atrás, de Lupe a Bucle; adelante, Tamandúa, Faro, Plotty, Pepa y Atlas (en vertical no caben los cinco: Plotty flota
  // entre las dos filas). Cada fila va centrada y con el mismo aire entre lo que ocupa cada figura (su silueta, no su
  // marco), sin tocarse. alto: el alto en pantalla del marco de las personas de la fila (las mascotas, en la misma
  // proporción que en su presentación); suelo: donde pisan; centro: a qué altura flota una fila de una mascota sola.
  // La cámara se acerca un 8 % (ELE_ZOOM) durante la toma: aun así nadie se sale del cuadro ni toca el título.
  var ORDEN = ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle', 'tamandua', 'faro', 'plotty', 'pepa', 'atlas'];   // el orden en que aparecen
  var FILAS = V ? [
    { ids: ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle'], alto: 409, suelo: 950 },
    { ids: ['plotty'], alto: 520, centro: 1118 },
    { ids: ['tamandua', 'faro', 'pepa', 'atlas'], alto: 520, suelo: 1675 }
  ] : [
    { ids: ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle'], alto: 370, suelo: 595 },
    { ids: ['tamandua', 'faro', 'plotty', 'pepa', 'atlas'], alto: 480, suelo: 1045 }
  ];
  var ELE_ZOOM = 1.08, ELE_ORIGEN = V ? 0.62 : 0.7, ELE_AIRE = [18, V ? 60 : 110], MASCOTA = ANCHO / ALTO;
  var figurasEle = [];
  FILAS.forEach(function (fila, n) {
    fila.ids.forEach(function (id) {
      var d = el('div', 'figura', ilus(id), eleGrupo); d.style.zIndex = n + 1;
      figurasEle.push({ d: d, id: id, acento: POR_ID[id].acento, fila: fila, k: ORDEN.indexOf(id) });
    });
  });
  function colocarElenco() {
    var mitad = (W / 2 - 40) / ELE_ZOOM;   // lo que cabe a cada lado del centro, con la cámara ya encima
    FILAS.forEach(function (fila) {
      var fs = figurasEle.filter(function (f) { return f.fila === fila; }), alto = fila.alto, suma = 0, aire = 0;
      for (var vuelta = 0; vuelta < 3; vuelta++) {
        suma = 0;
        fs.forEach(function (f) {
          var v = vbDe(f.id), fw = FLOTAN[f.id] ? alto * MASCOTA : alto * v[2] / v[3], k = fw / v[2], l = lados(f.id);
          f.caja = { w: fw, h: v[3] * k, x0: l[0] * k, x1: l[1] * k }; suma += f.caja.x1 - f.caja.x0;
        });
        aire = fs.length > 1 ? Math.min(ELE_AIRE[1], (2 * mitad - suma) / (fs.length - 1)) : 0;
        if (fs.length < 2 || aire >= ELE_AIRE[0]) break;
        alto *= (2 * mitad - ELE_AIRE[0] * (fs.length - 1)) / suma;   // no cabe: la fila entera, un poco más chica
      }
      var x = W / 2 - (suma + aire * (fs.length - 1)) / 2;
      fs.forEach(function (f) {
        var c = f.caja, top = FLOTAN[f.id] ? (fila.centro != null ? fila.centro : fila.suelo - alto * 0.62) - c.h / 2 : fila.suelo - c.h * PIE;
        css(f.d, { left: f2(x - c.x0) + 'px', top: f2(top) + 'px', width: f2(c.w) + 'px', height: f2(c.h) + 'px' });
        x += c.x1 - c.x0 + aire;
      });
    });
  }

  function elenco(t) {
    var on = t >= G.elenco && t < G.cierre; ver(capaEle, on); if (!on) return;
    var u = t - G.elenco, cam = 1 + (ELE_ZOOM - 1) * eInOut(prog(u, 0, 2.4));
    eleGrupo.style.transform = 'scale(' + f2(cam) + ')'; eleGrupo.style.transformOrigin = '50% ' + ELE_ORIGEN * 100 + '%';
    eleLuz.style.opacity = f2(0.6 + 0.4 * prog(u, 0, 0.5));
    figurasEle.forEach(function (f) {
      var a = eOut(prog(u, f.k * 0.055, f.k * 0.055 + 0.4)), luz = eOut(prog(u, 0.45 + f.k * 0.03, 0.8 + f.k * 0.03));
      css(f.d, { opacity: f2(clamp(a * 2, 0, 1)), transform: 'translateY(' + f2((1 - a) * 50 + (FLOTAN[f.id] ? Math.sin(u * 2.4 + f.k) * 8 : 0)) + 'px)',
        filter: 'brightness(' + f2(0.05 + 0.95 * luz) + ') drop-shadow(0 0 ' + f2(18 - 6 * luz) + 'px ' + rgba(f.acento, 0.7) + ')' });
    });
    var ti = eOut(prog(u, 0.35, 0.8));
    css(eleTit, { opacity: f2(ti), transform: 'translateY(' + f2((1 - ti) * 30) + 'px)', letterSpacing: f2((1 - ti) * 0.08 - 0.02) + 'em' });
  }

  /* ═════════ 6. El cierre: la marca, la invitación y la dirección ═════════ */
  var capaCie = capa(); capaCie.style.background = '#061525';
  var cieFondo = placa('oficina', capaCie);
  var cieVelo = el('div', 'capa', '', capaCie); cieVelo.style.background = 'radial-gradient(ellipse 65% 50% at 50% 45%, rgba(4,13,24,.55), rgba(4,13,24,.93))';
  var cieOnda = el('div', 'onda', '', capaCie);
  var cieRayo = el('div', 'rayo', '', capaCie);
  var cieB = el('div', 'capa', '', capaCie);
  var cEtiqueta = el('div', 'etiqueta', 'La oficina', cieB), cMarca = el('div', 'marca', iso(V ? 260 : 210) + palabra(true), cieB);
  var cLema = el('div', 'display', 'Pasa. La oficina está abierta.', cieB), cUrl = el('div', 'mono', 'biplot.cl/oficina', cieB), cCta = el('div', '', '<span class="cta">Agenda tu diagnóstico</span>', cieB);
  (function () {
    var pal = cMarca.querySelector('.palabra');
    if (V) { css(cMarca, { position: 'absolute', left: '0', right: '0', top: '560px', flexDirection: 'column', gap: '48px' }); pal.style.fontSize = '160px'; }
    else { css(cMarca, { position: 'absolute', left: '0', right: '0', top: '300px', gap: '46px' }); pal.style.fontSize = '176px'; }
    css(cEtiqueta, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 480 : 220) + 'px', fontSize: '30px' });
    css(cLema, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 1090 : 590) + 'px', fontSize: (V ? 58 : 62) + 'px', fontWeight: '600', color: '#E8EEF4' });
    css(cUrl, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 1210 : 690) + 'px', fontSize: (V ? 46 : 46) + 'px', color: '#7FD8CF' });
    css(cCta, { position: 'absolute', left: '0', right: '0', textAlign: 'center', top: (V ? 1330 : 790) + 'px' });
    css(cCta.querySelector('.cta'), { fontSize: (V ? 40 : 38) + 'px', padding: '22px 52px' });
  })();

  function cierre(t) {
    var on = t >= G.cierre && t < G.remate; ver(capaCie, on); if (!on) return;
    var u = t - G.cierre;
    encuadrar(cieFondo, 12, 10, 1.0, W / 2, H * 0.48, (V ? 0.85 : 1.35) * (1.18 - 0.18 * eOut(prog(u, 0, 6.5))));
    cieFondo.style.filter = 'brightness(.62) saturate(1.1) blur(' + f2(3 + 3 * (1 - prog(u, 0, 1))) + 'px)';
    var e = eOut(prog(u, 0.05, 0.5));
    css(cMarca, { opacity: f2(clamp(prog(u, 0.05, 0.12) * 1.2, 0, 1)), transform: 'scale(' + f2(1.3 - 0.3 * e) + ')', filter: 'blur(' + f2((1 - e) * 6) + 'px)' });
    css(cEtiqueta, { opacity: f2(prog(u, 0.35, 0.8)), letterSpacing: f2(0.7 - 0.32 * eOut(prog(u, 0.35, 1.0))) + 'em' });
    var l = eOut(prog(t, G.cierre + G.COMPAS / 2, G.cierre + G.COMPAS / 2 + 0.5));
    css(cLema, { opacity: f2(l), transform: 'translateY(' + f2((1 - l) * 26) + 'px)' });
    var w = eOut(prog(t, G.cierre + G.COMPAS, G.cierre + G.COMPAS + 0.45)), b = eBack(prog(t, G.cierre + G.COMPAS + 0.25, G.cierre + G.COMPAS + 0.55));
    css(cUrl, { opacity: f2(w), transform: 'translateY(' + f2((1 - w) * 20) + 'px)' });
    css(cCta, { opacity: f2(clamp(b * 1.5, 0, 1)), transform: 'scale(' + f2(0.7 + 0.3 * b) + ')' });
    var o = prog(u, 0.05, 0.9), r = 60 + eOut(o) * (V ? 950 : 1150);
    css(cieOnda, { display: o < 1 ? '' : 'none', width: f2(r * 2) + 'px', height: f2(r * 2) + 'px', left: f2(W / 2 - r) + 'px', top: f2(H * (V ? 0.36 : 0.37) - r) + 'px', opacity: f2((1 - o) * 0.8), borderWidth: f2(8 * (1 - o) + 1) + 'px' });
    rayo(cieRayo, t, G.cierre + 0.05, V ? 0.47 : 0.36);
  }

  /* ═════════ 7. El remate: Plotty ═════════ */
  var capaRem = capa();
  capaRem.style.background = '#040D18';
  var remLuz = el('div', 'capa', '', capaRem); remLuz.style.background = 'radial-gradient(ellipse 45% 32% at ' + (V ? '58% 60%' : '50% 60%') + ', rgba(23,195,178,.28), transparent 70%)';
  var remFig = el('div', 'figura', ilus('plotty'), capaRem);
  var remBur = el('div', 'burbuja', '<span class="dicho"></span><span class="cursor"></span><span class="falta" style="color:transparent"></span>', capaRem);
  // En vertical Plotty va más chico y a la derecha: su burbuja tiene que caber entera a su izquierda, sin tapar su mano
  var REM = (function () {
    var v = vbDe('plotty'), FW = V ? 480 : 520, FH = FW * v[3] / v[2], k = FW / v[2], cx = V ? 720 : 1180, cy = V ? 1180 : 600;
    css(remFig, { left: f2(cx - FW / 2) + 'px', top: f2(cy - FH / 2) + 'px', width: FW + 'px', height: f2(FH) + 'px' });
    var cab = IL.plotty.cabeza.split(' ').map(Number);
    css(remBur, { fontSize: (V ? 50 : 54) + 'px', padding: '30px 36px' });
    return { marco: { x: cx - FW / 2, y: cy - FH / 2, k: k }, cara: { x: cx - FW / 2 + (cab[0] + cab[2] / 2) * k, y: cy - FH / 2 + (cab[1] + cab[3] / 2) * k, radio: cab[2] / 2 * k } };
  })();
  function ajustarRemate() {
    ver(capaRem, true);
    ponerBurbuja(remBur, G.remateLinea, 'plotty', REM.marco, REM.cara, -1, { aire: 40, top: REM.cara.y - 90, ancho: V ? 470 : 560, entre: [V ? 50 : 140, W] });
    ver(capaRem, false);
  }
  var remDicho = remBur.querySelector('.dicho'), remFalta = remBur.querySelector('.falta'), remCursor = remBur.querySelector('.cursor');
  remFalta.textContent = G.remateLinea;

  function remate(t) {
    var on = t >= G.remate; ver(capaRem, on); if (!on) return;
    var u = t - G.remate, a = eBack(prog(u, 0.25, 0.7)), sal = prog(t, G.total - 0.45, G.total);
    css(remFig, { opacity: f2(clamp(prog(u, 0.25, 0.4) * 2, 0, 1)), transform: 'translateY(' + f2((1 - a) * 260 + Math.sin(u * 2.6) * 12) + 'px) scale(' + f2(0.8 + 0.2 * a) + ')',
      filter: 'drop-shadow(0 0 18px rgba(23,195,178,.6))' });
    remLuz.style.opacity = f2(prog(u, 0.2, 0.8));
    var bu = prog(t, G.remateHabla - 0.18, G.remateHabla + 0.1), n = clamp(Math.floor((t - G.remateHabla) * G.remateLetras), 0, G.remateLinea.length);
    css(remBur, { opacity: f2(clamp(bu * 4, 0, 1)), transform: 'scale(' + f2(0.55 + 0.45 * eBack(bu)) + ')' });
    if (remDicho.textContent.length !== n) { remDicho.textContent = G.remateLinea.slice(0, n); remFalta.textContent = G.remateLinea.slice(n); }
    remCursor.style.opacity = n < G.remateLinea.length ? (Math.floor(t * 8) % 2 ? '1' : '.25') : '0';
    capaRem.style.opacity = f2(1 - sal);
  }

  /* ═════════ Luz, polvo, grano y golpes (sobre todo) ═════════ */
  escenario.appendChild(haces);
  var HACES = [0, 1, 2].map(function (i) {
    var h = el('div', 'haz', '', haces);
    css(h, { left: f2(W * (0.22 + 0.28 * i) - (V ? 150 : 200)) + 'px', top: '-10%', width: (V ? 300 : 400) + 'px', height: '135%', filter: 'blur(18px)' });
    return h;
  });
  var polvo = el('canvas'); polvo.id = 'polvo'; polvo.width = W; polvo.height = H; var pc = polvo.getContext('2d');
  var motas = (function () {
    var r = azar(99), a = [];
    for (var i = 0; i < 110; i++) a.push({ x: r() * W, y: r() * H, v: 12 + r() * 34, amp: 8 + r() * 30, f: 0.2 + r() * 0.6, s: 0.8 + r() * 2.8, al: 0.12 + r() * 0.5, fase: r() * 6.28 });
    for (var j = 0; j < 12; j++) a.push({ x: r() * W, y: r() * H, v: 5 + r() * 12, amp: 30, f: 0.15, s: 22 + r() * 46, al: 0.05 + r() * 0.05, fase: r() * 6.28, bokeh: true });
    return a;
  })();
  el('div', 'capa vineta');
  var grano = el('canvas'); grano.id = 'grano'; grano.width = Math.round(W / 2); grano.height = Math.round(H / 2); css(grano, { width: W + 'px', height: H + 'px' });
  var gc = grano.getContext('2d'), tejas = [0, 1, 2, 3].map(function (n) {
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d'), img = x.createImageData(256, 256), r = azar(500 + n);
    for (var i = 0; i < img.data.length; i += 4) { var g = Math.floor(r() * 255); img.data[i] = img.data[i + 1] = img.data[i + 2] = g; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0); return c;
  });
  var destello = el('div', 'capa destello'), negro = el('div', 'capa negro');

  // Los golpes: [segundo, fuerza] para la sacudida y [segundo, intensidad, duración] para el destello
  var GOLPES = [[2.4, 0.3], [4.8, 0.3], [6.0, 0.18], [G.braam, 1], [G.titulo, 0.75]]
    .concat(G.EQUIPO.map(function (p) { return [p.t, 0.5]; })).concat([[G.motor, 0.5], [G.elenco, 0.6], [G.cierre, 1]]);
  var DESTELLOS = [[2.4, 0.18, 0.12], [4.8, 0.18, 0.12], [G.braam, 0.9, 0.22], [G.titulo, 0.55, 0.14]]
    .concat(G.EQUIPO.map(function (p) { return [p.t, 0.72, 0.13]; })).concat([[G.motor, 0.6, 0.13], [G.elenco, 0.75, 0.15], [G.cierre, 1, 0.35]]);
  function sacudida(t) {
    var x = 0, y = 0;
    GOLPES.forEach(function (g) { var u = t - g[0]; if (u >= 0 && u < 0.42) { var a = g[1] * Math.pow(1 - u / 0.42, 2) * 24 * (W / 1080); x += Math.sin(u * 93 + g[0] * 7) * a; y += Math.cos(u * 79 + g[0] * 3) * a * 0.7; } });
    return [x, y];
  }
  function brillo(t) {
    var o = 0;
    DESTELLOS.forEach(function (d) { var u = t - d[0]; if (u >= 0 && u < d[2]) o = Math.max(o, d[1] * (1 - u / d[2])); });
    // Antes del cierre, todo se va a blanco
    return Math.max(o, t < G.cierre ? eIn(prog(t, G.cierre - 0.4, G.cierre)) * 0.95 : 0);
  }
  function oscuro(t) {
    return Math.max(1 - prog(t, 0, 0.35), prog(t, G.braam - 0.2, G.braam) * (t < G.braam ? 1 : 0), prog(t, G.remate - 0.7, G.remate) * (t < G.remate ? 1 : 0), prog(t, G.total - 0.3, G.total));
  }
  // Cuánta luz y polvo hay en cada parte, y de qué color
  function ambiente(t) {
    if (t < G.braam) return { haces: 0, polvo: 0.55, color: '#7FD8CF' };
    if (t < G.equipo) return { haces: 0.45 * prog(t, G.braam, G.braam + 1), polvo: 0.9, color: '#7FD8CF' };
    if (t < G.motor) { var p = G.EQUIPO[Math.min(G.EQUIPO.length - 1, Math.floor((t - G.equipo) / G.DURA))]; return { haces: 0.5, polvo: 1, color: p.acento }; }
    if (t < G.cierre) return { haces: t < G.elenco ? 0.25 : 0.7, polvo: 0.9, color: '#7FD8CF' };
    if (t < G.remate) return { haces: 0.4, polvo: 0.9, color: '#7FD8CF' };
    return { haces: 0, polvo: 0.5, color: '#7FD8CF' };
  }

  function efectos(t, cuadro) {
    var s = sacudida(t); escenario.style.transform = 'translate(' + f2(s[0]) + 'px,' + f2(s[1]) + 'px)';
    destello.style.opacity = f2(brillo(t)); negro.style.opacity = f2(oscuro(t));
    var am = ambiente(t);
    HACES.forEach(function (h, i) {
      h.style.opacity = f2(am.haces * (0.55 + 0.45 * Math.sin(t * 0.7 + i * 2.1)));
      h.style.transform = 'rotate(' + f2((i - 1) * 16 + Math.sin(t * 0.35 + i) * 7) + 'deg)';
      h.style.background = 'linear-gradient(to bottom, ' + rgba(am.color, 0.22) + ', ' + rgba(am.color, 0.05) + ' 55%, transparent 85%)';
    });
    // El polvo en el aire (y algunas luces desenfocadas)
    pc.clearRect(0, 0, W, H);
    motas.forEach(function (m) {
      var y = ((m.y - m.v * t) % (H + 100) + H + 100) % (H + 100) - 50, x = m.x + Math.sin(t * m.f + m.fase) * m.amp;
      if (m.bokeh) {
        var g = pc.createRadialGradient(x, y, 0, x, y, m.s); g.addColorStop(0, rgba(am.color, m.al * am.polvo)); g.addColorStop(1, rgba(am.color, 0));
        pc.fillStyle = g; pc.beginPath(); pc.arc(x, y, m.s, 0, 6.2832); pc.fill();
      } else { pc.globalAlpha = m.al * am.polvo; pc.fillStyle = '#DDF4F1'; pc.beginPath(); pc.arc(x, y, m.s, 0, 6.2832); pc.fill(); pc.globalAlpha = 1; }
    });
    // El grano de película
    var r = azar(cuadro * 7 + 3), pat = gc.createPattern(tejas[cuadro % 4], 'repeat');
    gc.save(); gc.translate(-Math.floor(r() * 256), -Math.floor(r() * 256)); gc.fillStyle = pat; gc.fillRect(0, 0, grano.width + 256, grano.height + 256); gc.restore();
  }

  function cuadro(t) {
    t = clamp(t, 0, G.total);
    intro(t); establecer(t); revelacion(t); motor(t); elenco(t); cierre(t); remate(t);
    efectos(t, Math.round(t * 30));
  }

  /* ── Listo: fuentes, placas y medidas ── */
  var listo = Promise.all([
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
    fetch(PLACAS_URL + 'placas.json').then(function (r) { return r.json(); }).then(function (j) {
      PL = j;
      return Promise.all(imagenes.map(function (i) { i.src = PLACAS_URL + i.dataset.placa + '.jpg'; return i.decode ? i.decode().catch(function () {}) : new Promise(function (ok) { i.onload = i.onerror = ok; }); }));
    })
  ]).then(function () {
    return Promise.all(['700 100px "Space Grotesk"', '600 100px "Space Grotesk"', '700 40px "Space Mono"'].map(function (f) { return document.fonts.load(f); })
      .concat(G.EQUIPO.map(function (p) { return medirSilueta(p.id); })));
  }).then(function () {
    ajustarNombres(); ajustarBurbujas(); colocarElenco(); ajustarRemate(); ajustarIntro();
    cuadro(parseFloat(q.get('t') || '0'));
    document.documentElement.setAttribute('data-listo', '1');
  });

  window.TEASER = { listo: listo, cuadro: cuadro, total: G.total, formato: FORMATO, ancho: W, alto: H };
})();
