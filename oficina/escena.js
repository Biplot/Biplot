/*
 * Oficina BiPlot · escena isométrica
 * Dibuja en un <svg> (proyección 2:1) la oficina con el equipo trabajando y, por delante, el barrio: la calle principal
 * con un local por proyecto, la plaza, El Archivo y una calle por rubro para los demás casos (barrio.js + datos.js).
 * Desde la calle, la oficina y los locales se ven cerrados, con su nombre y su logo en el techo; la oficina se abre al
 * entrar (oficina(true)) y recién ahí se dibuja y se anima el equipo, y un local se abre al tocarlo (abrirLocal): se va
 * el techo y se ve por dentro, con su gente. Ubica a la gente y la hace caminar, también entre los muebles de un local o
 * de una sala (maqueta). Sin librerías. La usan la oficina (oficina.js, con cámara e interfaz) y el kit de Instagram
 * (kit/, en modo quieto).
 *
 * Coordenadas del mundo: x hacia abajo a la derecha, y hacia abajo a la izquierda, z hacia arriba.
 * La oficina mide ANCHO × FONDO baldosas; el barrio queda a la derecha (x > 24) y por delante (y > 20), así que se
 * dibuja después. El orden de dibujo es por profundidad (x + y), en capas.
 *
 * Escena.construir(svg, { animado, medios }) → { zonas, actores, limites, P, vitrina(ids), barrio, oficina(abrir, animar),
 *   abierta(), iniciar(), detener(), abrirLocal(id, M, { pintar, mover }), cerrarLocal(animar), local(), moverLocal(si) }
 * Escena.maqueta(g, M, { pintar }) → { mover(si), destruir(), gente, llevar(id, x, y, der) }: un dibujo en capas
 *   (locales.js, salas.js) con su gente caminando (llevar deja a alguien parado en un punto, o lo devuelve a su ruta);
 *   Escena.maquetaSvg(M, pintar) lo da quieto, en texto; Escena.juntar(partes) junta varios en uno.
 */
(function () {
  'use strict';

  var E = window.Elenco, C = E.C;
  var TW = 32, TH = 16, ZH = 39;          // medio ancho y medio alto de baldosa; px por unidad de altura
  var ANCHO = 24, FONDO = 20, ALTO_MURO = 3, ALTO_VIDRIO = 2.2;
  var ESCALA_ACTOR = 0.34;
  var NARANJO = '#F5883A';

  // Materiales (todos salen de la escala azul y cian de la marca)
  var M = {
    piso: '#163A60', pisoLinea: 'rgba(23,195,178,.09)', losaIzq: '#0E2A47', losaDer: '#091D33',
    muroX: '#10304F', muroY: '#15395E', muroTope: '#2A5A88', zocalo: '#0B2440',
    alfombra: '#1B4670', alfombra2: '#21507D',
    vidrio: 'rgba(127,216,207,.07)', vidrioBorde: 'rgba(127,216,207,.38)', marco: '#2F5F8C',
    mesa: '#D5E2EE', mesaIzq: '#8FA3B8', mesaDer: '#6B7A8C',
    oscuro: '#35679A', pantalla: '#0B2B45', planta: '#168A86', planta2: '#0A8A7E', maceta: '#C4D2E0'
  };

  function r1(n) { return Math.round(n * 10) / 10; }
  function P(x, y, z) { return [(x - y) * TW, (x + y) * TH - (z || 0) * ZH]; }
  function pts(a) { return a.map(function (p) { var q = P(p[0], p[1], p[2]); return r1(q[0]) + ',' + r1(q[1]); }).join(' '); }
  function poly(a, attr) { return '<polygon points="' + pts(a) + '" ' + (attr || '') + '/>'; }

  function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mezcla(a, b, t) {
    var x = hex2rgb(a), y = hex2rgb(b);
    return '#' + x.map(function (v, i) { return ('0' + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2); }).join('');
  }
  function sombreado(c, t) { return mezcla(c, '#061525', t); }

  // Caja con tres caras visibles: arriba, izquierda (+y) y derecha (+x).
  function caja(x, y, z, w, d, h, col, extra) {
    var t = col.t || col, l = col.l || sombreado(t, .22), r = col.r || sombreado(t, .42);
    return '<g ' + (extra || '') + '>' +
      poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], 'fill="' + l + '"') +
      poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], 'fill="' + r + '"') +
      poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], 'fill="' + t + '"') +
      '</g>';
  }

  // Planos verticales y horizontales para dibujar en 2D sobre la escena (100 unidades locales = 1 baldosa).
  function planoY(x0, y0, zTop) { var p = P(x0, y0, zTop); return 'matrix(' + TW / 100 + ',' + TH / 100 + ',0,' + ZH / 100 + ',' + r1(p[0]) + ',' + r1(p[1]) + ')'; }
  function planoX(x0, y0, zTop) { var p = P(x0, y0, zTop); return 'matrix(' + TW / 100 + ',' + (-TH / 100) + ',0,' + ZH / 100 + ',' + r1(p[0]) + ',' + r1(p[1]) + ')'; }
  function planoZ(x0, y0, z0) { var p = P(x0, y0, z0); return 'matrix(' + TW / 100 + ',' + TH / 100 + ',' + (-TW / 100) + ',' + TH / 100 + ',' + r1(p[0]) + ',' + r1(p[1]) + ')'; }
  function enPlano(tr, contenido, extra) { return '<g transform="' + tr + '" ' + (extra || '') + '>' + contenido + '</g>'; }

  function texto(x, y, t, tam, color, peso, extra) {
    return '<text x="' + x + '" y="' + y + '" font-family="Space Grotesk, sans-serif" font-weight="' + (peso || 600) + '" font-size="' + tam + '" fill="' + color + '" ' + (extra || '') + '>' + t + '</text>';
  }
  function mono(x, y, t, tam, color, extra) {
    return '<text x="' + x + '" y="' + y + '" font-family="Space Mono, monospace" font-weight="700" font-size="' + tam + '" fill="' + color + '" ' + (extra || '') + '>' + t + '</text>';
  }

  // Cilindro vertical visto en isométrico (centro en el piso, radio en baldosas).
  function cilindro(cx, cy, z, r, h, col, extra) {
    var p0 = P(cx, cy, z), p1 = P(cx, cy, z + h), rx = r1(r * TW * Math.SQRT2), ry = r1(r * TH * Math.SQRT2);
    var lado = col.l || sombreado(col.t || col, .3), tope = col.t || col;
    return '<g ' + (extra || '') + '><path d="M' + r1(p0[0] - rx) + ' ' + r1(p0[1]) + ' A' + rx + ' ' + ry + ' 0 0 0 ' + r1(p0[0] + rx) + ' ' + r1(p0[1]) +
      ' V' + r1(p1[1]) + ' H' + r1(p1[0] - rx) + ' Z" fill="' + lado + '"/>' +
      '<ellipse cx="' + r1(p1[0]) + '" cy="' + r1(p1[1]) + '" rx="' + rx + '" ry="' + ry + '" fill="' + tope + '"/></g>';
  }

  function planta(x, y, alto, z) {
    alto = alto || 1; z = z || 0;
    var b = P(x, y, z + 0.45 * Math.min(alto, 1)), s = '';
    s += cilindro(x, y, z, 0.28 * Math.min(alto, 1), 0.45 * Math.min(alto, 1), { t: M.maceta, l: '#8FA3B8' });
    var hojas = [[-14, -26, 10, 22, -24], [12, -28, 9, 21, 26], [0, -38, 9, 24, 0], [-22, -14, 8, 16, -52], [20, -14, 8, 16, 50]];
    s += '<g transform="translate(' + r1(b[0]) + ' ' + r1(b[1]) + ') scale(' + alto + ')">';
    hojas.forEach(function (h, i) {
      s += '<ellipse cx="' + h[0] + '" cy="' + h[1] + '" rx="' + h[2] + '" ry="' + h[3] + '" fill="' + (i % 2 ? M.planta2 : M.planta) + '" transform="rotate(' + h[4] + ' ' + h[0] + ' ' + h[1] + ')"/>';
    });
    s += '<ellipse cx="4" cy="-44" rx="6" ry="15" fill="' + C.cian + '" opacity=".8" transform="rotate(12 4 -44)"/></g>';
    return s;
  }

  function vidrio(x0, y0, x1, y1, h, extra) {
    // tramo de vidrio entre dos puntos del piso (recto en x o en y)
    return '<g ' + (extra || '') + '>' + poly([[x0, y0, 0], [x1, y1, 0], [x1, y1, h], [x0, y0, h]], 'fill="' + M.vidrio + '" stroke="' + M.vidrioBorde + '" stroke-width="1"') +
      '<polyline points="' + pts([[x0, y0, h], [x1, y1, h]]) + '" stroke="' + M.marco + '" stroke-width="3" fill="none"/>' +
      '<polyline points="' + pts([[x0, y0, 0.02], [x1, y1, 0.02]]) + '" stroke="' + M.marco + '" stroke-width="2.5" fill="none"/></g>';
  }

  // Tramos de vidrio de a una baldosa, para que el orden por profundidad no falle con muros largos.
  function tramos(agregar, x0, y0, x1, y1, h, puerta) {
    var largo = Math.abs(x1 - x0) + Math.abs(y1 - y0), n = Math.ceil(largo), dx = (x1 - x0) / largo, dy = (y1 - y0) / largo;
    for (var i = 0; i < n; i++) {
      var a = i, b = Math.min(i + 1, largo);
      if (puerta) {
        if (b <= puerta[0] || a >= puerta[1]) { /* tramo completo */ } else {
          if (a < puerta[0]) agregar(0, 0, vidrio(x0 + dx * a, y0 + dy * a, x0 + dx * puerta[0], y0 + dy * puerta[0], h), x0 + dx * (a + puerta[0]) / 2, y0 + dy * (a + puerta[0]) / 2);
          if (b > puerta[1]) agregar(0, 0, vidrio(x0 + dx * puerta[1], y0 + dy * puerta[1], x0 + dx * b, y0 + dy * b, h), x0 + dx * (puerta[1] + b) / 2, y0 + dy * (puerta[1] + b) / 2);
          continue;
        }
      }
      agregar(0, 0, vidrio(x0 + dx * a, y0 + dy * a, x0 + dx * b, y0 + dy * b, h), x0 + dx * (a + b) / 2, y0 + dy * (a + b) / 2);
    }
    if (puerta) {
      // dintel sobre la puerta
      var pa = [x0 + dx * puerta[0], y0 + dy * puerta[0]], pb = [x0 + dx * puerta[1], y0 + dy * puerta[1]];
      agregar(0, 0, '<polyline points="' + pts([[pa[0], pa[1], h], [pb[0], pb[1], h]]) + '" stroke="' + M.marco + '" stroke-width="3" fill="none"/>' +
        poly([[pa[0], pa[1], h - 0.18], [pb[0], pb[1], h - 0.18], [pb[0], pb[1], h], [pa[0], pa[1], h]], 'fill="' + M.vidrio + '" stroke="' + M.vidrioBorde + '" stroke-width="1"'), (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2);
    }
  }

  // Pantalla en un plano: marco, fondo y contenido en coordenadas locales (ancho × alto en centésimas).
  function pantallaY(xa, xb, y, zTop, zBot, contenido) {
    var w = (xb - xa) * 100, h = (zTop - zBot) * 100;
    return enPlano(planoY(xa, y, zTop), '<rect x="-4" y="-4" width="' + (w + 8) + '" height="' + (h + 8) + '" rx="4" fill="' + C.grafito + '"/>' +
      '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="' + M.pantalla + '"/>' + contenido(w, h));
  }
  function pantallaX(x, ya, yb, zTop, zBot, contenido) {
    // plano x = x, se dibuja de ya (izquierda en pantalla) a yb (derecha), con ya > yb
    var w = (ya - yb) * 100, h = (zTop - zBot) * 100;
    return enPlano(planoX(x, ya, zTop), '<rect x="-4" y="-4" width="' + (w + 8) + '" height="' + (h + 8) + '" rx="4" fill="' + C.grafito + '"/>' +
      '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="' + M.pantalla + '"/>' + contenido(w, h));
  }
  // Vidrio esmerilado: no deja ver lo que hay detrás.
  function esmerilado(x0, y0, x1, y1, h) {
    return poly([[x0, y0, 0], [x1, y1, 0], [x1, y1, h], [x0, y0, h]], 'fill="rgba(185,200,216,.5)" stroke="' + M.vidrioBorde + '" stroke-width="1"');
  }
  // Placa sobre la puerta de una sala (en el plano del frente).
  function placa(x, y, ancho, t, colores) {
    var s = '<rect x="0" y="0" width="' + ancho + '" height="34" rx="5" fill="' + C.a800 + '" stroke="' + colores[0] + '" stroke-width="2"/>', xx = 10;
    colores.forEach(function (c) { s += '<rect x="' + xx + '" y="10" width="14" height="14" rx="3" fill="' + c + '"/>'; xx += 18; });
    return enPlano(planoY(x, y, 2.55), s + texto(xx + 6, 24, t, 17, C.niebla, 600, 'letter-spacing="2.5"'));
  }

  /* ─────────── Contenidos de pantallas ─────────── */
  var PANTALLAS = {
    datos: function (w, h) {
      var s = '', cols = 8, filas = 5, cw = (w - 20) / cols, ch = (h - 34) / filas;
      s += texto(10, 20, 'datos_limpios.csv', 13, C.c300, 500);
      for (var c = 0; c < cols; c++) for (var r = 0; r < filas; r++) {
        s += '<rect x="' + (10 + c * cw) + '" y="' + (28 + r * ch) + '" width="' + (cw - 3) + '" height="' + (ch - 3) + '" fill="#123754"/>';
      }
      [[1, 1], [4, 0], [6, 3], [2, 4], [5, 2], [7, 1]].forEach(function (p, i) {
        s += '<rect class="dato-luz" style="animation-delay:' + (i * .6).toFixed(1) + 's" x="' + (10 + p[0] * cw) + '" y="' + (28 + p[1] * ch) + '" width="' + (cw - 3) + '" height="' + (ch - 3) + '" fill="' + C.cian + '"/>';
      });
      return s;
    },
    diseno: function (w, h) {
      var s = '<rect x="14" y="12" width="' + (w * .22) + '" height="' + (h - 24) + '" rx="8" fill="none" stroke="' + C.niebla + '" stroke-width="2.4"/>';
      s += '<rect x="22" y="' + (h * .3) + '" width="' + (w * .22 - 16) + '" height="10" rx="3" fill="' + C.cian + '"/>';
      s += '<path class="traza" d="M' + (w * .34) + ' ' + (h * .7) + ' L' + (w * .46) + ' ' + (h * .45) + ' L' + (w * .58) + ' ' + (h * .55) + ' L' + (w * .72) + ' ' + (h * .25) + '" stroke="' + C.cian + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
      for (var g = 1; g < 6; g++) s += '<path d="M' + (w * .3 + g * w * .11) + ' 10 V' + (h - 10) + '" stroke="#2A5A88" stroke-width="1" opacity=".7"/>';
      [C.cian, C.niebla, C.a600, C.c300].forEach(function (c, i) { s += '<circle cx="' + (w * .86) + '" cy="' + (18 + i * 20) + '" r="7" fill="' + c + '"/>'; });
      return s;
    },
    codigo: function (w, h) {
      var s = '', lineas = [[0, .5], [1, .34], [1, .6], [2, .28], [2, .44], [1, .3], [0, .22], [1, .5]];
      lineas.forEach(function (l, i) {
        s += '<rect class="codigo-linea" style="animation-delay:' + (i * .35).toFixed(2) + 's" x="' + (10 + l[0] * 14) + '" y="' + (10 + i * ((h - 14) / lineas.length)) + '" width="' + (l[1] * (w - 20)) + '" height="6" rx="3" fill="' + (i % 3 === 1 ? C.cian : C.a300) + '"/>';
      });
      return s;
    },
    qa: function (w, h) {
      var s = '', dev = [[.04, .2, .34, .62], [.42, .28, .26, .5], [.72, .3, .14, .46], [.9, .4, .07, .32]];
      dev.forEach(function (d, i) {
        s += '<rect x="' + (d[0] * w) + '" y="' + (d[1] * h) + '" width="' + (d[2] * w) + '" height="' + (d[3] * h) + '" rx="3" fill="#123754" stroke="' + C.a300 + '" stroke-width="2"/>' +
          '<path class="qa-ok" style="animation-delay:' + (i * .8) + 's" d="M' + ((d[0] + d[2] * .3) * w) + ' ' + ((d[1] + d[3] * .5) * h) + ' l' + (d[2] * w * .15) + ' ' + (d[2] * w * .15) + ' l' + (d[2] * w * .3) + ' -' + (d[2] * w * .3) + '" stroke="' + C.cian + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
      });
      return s;
    },
    despliegue: function (w, h) {
      var s = texto(8, 18, 'producción', 12, C.c300, 500);
      for (var i = 0; i < 3; i++) s += '<rect x="8" y="' + (28 + i * 14) + '" width="' + (w - 30) + '" height="7" rx="3" fill="' + C.a300 + '" opacity=".7"/><circle cx="' + (w - 12) + '" cy="' + (31.5 + i * 14) + '" r="4" fill="' + C.cian + '"/>';
      return s;
    },
    // Sala de máquinas: automatizaciones corriendo
    maquinas: function (w, h) {
      var s = mono(8, 16, 'AUTOMATIZACIONES', 9, C.c300);
      ['Facturas', 'Recordatorios', 'Respaldo', 'Reportes'].forEach(function (t, i) {
        s += '<circle class="' + (i === 1 ? 'led' : '') + '" cx="14" cy="' + (30 + i * 14) + '" r="4" fill="' + (i === 3 ? NARANJO : C.cian) + '"/>' + mono(24, 34 + i * 14, t, 9, C.a300);
      });
      return s;
    },
    // Laboratorio: horas al mes, antes y después
    metricas: function (w, h) {
      var s = texto(12, 22, 'HORAS AL MES', 14, C.niebla, 600, 'letter-spacing="2"') + mono(w - 150, 21, 'antes', 10, C.a300) + mono(w - 80, 21, 'después', 10, C.c300);
      var antes = [.82, .7, .9, .64, .78], despues = [.34, .3, .4, .22, .3], base = h - 16, alto = h - 50, bw = (w - 60) / 5;
      antes.forEach(function (v, i) {
        var x = 24 + i * bw;
        s += '<rect x="' + r1(x) + '" y="' + r1(base - v * alto) + '" width="' + r1(bw * .34) + '" height="' + r1(v * alto) + '" rx="2" fill="' + C.a300 + '" opacity=".75"/>' +
          '<rect class="barra-despues" style="animation-delay:' + (i * .25).toFixed(2) + 's" x="' + r1(x + bw * .4) + '" y="' + r1(base - despues[i] * alto) + '" width="' + r1(bw * .34) + '" height="' + r1(despues[i] * alto) + '" rx="2" fill="' + C.cian + '"/>';
      });
      return s + '<path d="M14 ' + (base - .7 * alto) + 'H' + (w - 14) + '" stroke="' + C.niebla + '" stroke-width="1.5" stroke-dasharray="5 5" opacity=".6"/>' + mono(w - 88, base - .7 * alto - 5, 'línea base', 9, C.niebla, 'opacity=".75"');
    }
  };

  /* ─────────── El barrio ─────────── */
  // Cómo se ve el local de un caso según su fase del motor (la marca el CRM; mientras tanto, datos.js)
  var FASE_LOCAL = ['arriendo', 'diagnostico', 'obra', 'obra', 'obra', 'obra', 'obra', 'inauguracion', 'abierto', 'abierto'];
  function estadoDeFase(f) { var n = parseInt(String(f || 'E9').replace(/\D/g, ''), 10); return FASE_LOCAL[isNaN(n) ? 9 : Math.max(0, Math.min(9, n))]; }
  // Oscurece (hacia #060606) o aclara (hacia el blanco) un color, igual que las plantillas al dibujarse
  function tonoHex(c, t, hacia) { return '#' + hex2rgb(c).map(function (v) { return ('0' + Math.round(v + (hacia - v) * t).toString(16)).slice(-2); }).join(''); }
  function escXml(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Reemplaza las marcas §…§ de una pieza del barrio (barrio.js) con el color, el nombre y los textos del caso
  function pintar(svg, o) {
    var n = o.nombre || '', largo = n.length, color = /^#[0-9a-f]{6}$/i.test(o.color || '') ? o.color : '#7FD8CF';
    return svg.replace(/§LOGO§/g, function () { return o.logo || ''; }).replace(/§M§/g, function () { return o.medios || ''; })
      .replace(/§C(?:\.([tc])(\d+))?§/g, function (_, tipo, pct) { return tipo ? tonoHex(color, pct / 100, tipo === 't' ? 6 : 255) : color; })
      .replace(/§NF:(\d+):(\d+):(\d+)§/g, function (_, a, b, c) { return largo <= 9 ? a : largo <= 12 ? b : c; })
      .replace(/§NTL:(\d+):(\d+)§/g, function (_, a, b) { var l = +(largo <= 12 ? a : b); return l ? 'textLength="' + l + '" lengthAdjust="spacingAndGlyphs"' : ''; })
      .replace(/§N§/g, function () { return escXml(n); }).replace(/§LEMA§/g, function () { return escXml(o.lema || 'Tu sistema, al día'); })
      .replace(/§L([123])§/g, function (_, i) { return escXml((o.lineas || ['Pedidos', 'Stock', 'Cobros'])[i - 1] || ''); })
      .replace(/§CALLE§/g, function () { return escXml(o.calle || ''); });
  }
  // Una pieza dibujada en su origen, llevada al punto (x, y) del piso: la proyección es lineal, basta trasladarla
  function en(x, y, svg) { var p = P(x, y, 0); return '<g transform="translate(' + r1(p[0]) + ' ' + r1(p[1]) + ')">' + svg + '</g>'; }
  var CB = { paseo: '#2A4560', paseoLinea: 'rgba(185,200,216,.09)', solera: '#4A6582', calle: '#18222F', calleLinea: 'rgba(233,238,244,.55)', losaIzq: '#0E2A47', losaDer: '#091D33' };
  function losaB(x0, y0, x1, y1, frente, derecha) {
    var s = poly([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], 'fill="' + CB.paseo + '"');
    if (frente) s += poly([[x0, y1, 0], [x1, y1, 0], [x1, y1, -0.4], [x0, y1, -0.4]], 'fill="' + CB.losaIzq + '"');
    if (derecha) s += poly([[x1, y0, 0], [x1, y1, 0], [x1, y1, -0.4], [x1, y0, -0.4]], 'fill="' + CB.losaDer + '"');
    return s;
  }
  function baldosas(x0, y0, x1, y1) {
    var l = '', x, y;
    for (x = x0 + 1; x < x1 - 0.01; x += 1) l += '<polyline points="' + pts([[x, y0, 0.007], [x, y1, 0.007]]) + '"/>';
    for (y = y0 + 1; y < y1 - 0.01; y += 1) l += '<polyline points="' + pts([[x0, y, 0.007], [x1, y, 0.007]]) + '"/>';
    return '<g stroke="' + CB.paseoLinea + '" stroke-width="1.2" fill="none">' + l + '</g>';
  }
  // Calzada a lo largo de x (de y0 a y0 + 2), con su solera y la línea al medio
  function calzadaX(x0, x1, y0) {
    var s = poly([[x0, y0, 0.008], [x1, y0, 0.008], [x1, y0 + 2, 0.008], [x0, y0 + 2, 0.008]], 'fill="' + CB.calle + '"') +
      poly([[x0, y0, 0.009], [x1, y0, 0.009], [x1, y0 + 0.14, 0.009], [x0, y0 + 0.14, 0.009]], 'fill="' + CB.solera + '"');
    for (var x = x0 + 0.6; x < x1 - 1; x += 2.4) s += poly([[x, y0 + 0.94, 0.01], [x + 1.2, y0 + 0.94, 0.01], [x + 1.2, y0 + 1.06, 0.01], [x, y0 + 1.06, 0.01]], 'fill="' + CB.calleLinea + '"');
    return s;
  }
  // La avenida que une las calles por rubro, a lo largo de y
  function avenida(x0, y0, y1) {
    var s = poly([[x0, y0, 0.008], [x0 + 2.6, y0, 0.008], [x0 + 2.6, y1, 0.008], [x0, y1, 0.008]], 'fill="' + CB.calle + '"');
    for (var y = y0 + 0.6; y < y1 - 1; y += 2.4) s += poly([[x0 + 1.24, y, 0.01], [x0 + 1.36, y, 0.01], [x0 + 1.36, y + 1.2, 0.01], [x0 + 1.24, y + 1.2, 0.01]], 'fill="' + CB.calleLinea + '"');
    return s;
  }
  // Nombre que muestra el local: el del caso o, si el caso no se nombra, su rubro
  function letreroDe(p) {
    if (p.permiso === 'rubro') return String(p.rubro || '').split(' · ')[0].split(',')[0].toUpperCase();
    return String(p.letrero || p.nombre || '').toUpperCase();
  }
  function nombreDe(p) { return p.permiso === 'rubro' ? String(p.rubro || '').split(' · ').join(', ') : p.nombre; }

  // Arma el barrio desde barrio.js (lo dibujado) y datos.js (los casos): la calle principal con los locales hechos a mano
  // y, por delante, una calle por rubro, en el orden en que llegó el primer caso de cada rubro. Cada calle termina con un
  // local que se arrienda y completa siete lotes.
  // El logo del techo de un caso: su archivo de logo (en la carpeta de medios) o el dibujo de su rubro
  function logoDe(p, B, medios) {
    if (p.logo && /^[\w.-]+\.(webp|png|svg|jpg)$/.test(p.logo)) return '<image href="' + medios + escXml(p.logo) + '" width="168" height="168"/>';
    return B.local.insignias[p.calle] || B.local.insignias.otro;
  }
  function armarBarrio(D, B, medios) {
    var G = B.geo, W = 4.6, FD = 4.3, proy = D.proyectos || [], nombres = (D.barrio && D.barrio.calles) || {};
    var enPrincipal = {}; B.principal.locales.forEach(function (l) { enPrincipal[l.id] = true; });
    var porId = {}; proy.forEach(function (p) { porId[p.id] = p; });
    var casos = proy.filter(function (p) { return !p.libre; });
    var calles = [], porCalle = {};
    casos.forEach(function (p) {
      if (enPrincipal[p.id] || p.permiso === 'archivo' || !p.calle) return;
      var c = porCalle[p.calle];
      if (!c) { c = porCalle[p.calle] = { id: p.calle, nombre: nombres[p.calle] || 'Calle ' + p.calle, casos: [] }; calles.push(c); }
      c.casos.push(p);
    });
    var n = casos.length, pisos = Math.max(1, Math.min(4, Math.ceil(n / 10)));
    var suelo = B.principal.suelo, filas = '', cajas = [B.principal.caja];
    var atras = B.principal.atras.replace(/§CASOS§/g, n + (n === 1 ? ' caso' : ' casos')).replace(/§NCASOS§/g, n + (n === 1 ? ' CASO' : ' CASOS')).replace(/§M§/g, medios);
    var zonas = B.principal.zonas.map(function (z) {
      var p = porId[z.id];
      var nombre = z.id === 'oficina' ? 'BiPlot HQ' : z.id === 'archivo' ? 'El Archivo' : z.id === 'pasaje' ? 'El pasaje' : z.id === 'tv' ? ((D.salas && D.salas.tv && D.salas.tv.nombre) || 'BiPlot.TV') : p ? p.nombre : z.id;
      return { id: z.id, nombre: nombre, caja: z.caja, foco: z.foco, zoom: 2.1, barrio: true, hq: !!z.hq, calle: z.hq ? '' : 'principal' };
    });
    var L = B.local, yFin = G.y1, xFin = G.x1;
    if (calles.length) suelo += losaB(G.avenida[0], 20, 0, G.y1, false, false);
    calles.forEach(function (c, r) {
      var Y = G.y1 + r * G.fila, slots = Math.max(7, c.casos.length + 1), X1 = Math.max(G.x1, 0.15 + slots * G.paso + 0.4), obj = [];
      xFin = Math.max(xFin, X1); yFin = Y + G.fila;
      c.x1 = X1; c.y = Y;
      suelo += losaB(G.avenida[0], Y, X1, Y + G.fila, true, true) + baldosas(-0.2, Y + FD + 0.15, X1, Y + 9) + calzadaX(G.avenida[1], X1, Y + 9);
      var locales = '';
      for (var j = 0; j < slots; j++) {
        var ox = 0.15 + j * G.paso, oy = Y + 0.15, p = c.casos[j];
        if (p || j === c.casos.length) {
          var libre = !p, estado = libre ? 'arriendo' : estadoDeFase(p.fase), id = libre ? 'libre-' + c.id : p.id;
          var o = libre ? { color: '#7FD8CF', nombre: 'SE ARRIENDA' } : { color: p.acento, nombre: letreroDe(p), logo: logoDe(p, B, medios) };
          locales += '<g class="local" data-local="' + escXml(id) + '">' + en(ox, oy, pintar(L.cerrado[estado], o)) + '</g>';
          suelo += en(ox, oy, pintar(L.suelo, o));
          zonas.push({ id: id, nombre: libre ? 'Tu proyecto aquí' : nombreDe(p), caja: [ox, oy, ox + W, oy + FD, 2.5], foco: [ox + W / 2, oy + FD / 2, 1.0], zoom: 2.1, barrio: true, calle: c.id, libre: libre });
        } else suelo += en(ox, oy, L.fantasma + (j === c.casos.length + 1 ? L.sitioLibre : ''));
      }
      // La vereda de la calle: faroles, árboles, el letrero con su nombre y gente de paso
      for (var xf = 3; xf < X1 - 1; xf += 9.4) { suelo += en(xf, Y + 8.65, B.fila.farolSuelo); obj.push([xf + Y + 8.65, en(xf, Y + 8.65, B.fila.farol)]); }
      for (var xa = 7.5; xa < X1 - 1; xa += 9.4) obj.push([xa + Y + 8.55, en(xa, Y + 8.55, B.fila.arbol)]);
      obj.push([Y + 9, en(0.45, Y + 8.55, pintar(B.fila.letrero, { calle: c.nombre.toUpperCase() }))]);
      // Una persona de paso por calle (el barrio se ve tranquilo y pesa menos)
      var gx = 6 + (r * 7.3) % 16, quien = B.dePaso[r % B.dePaso.length];
      obj.push([gx + Y + 6.2, en(gx, Y + 6.2, B.personas[quien][r % 2 ? 'i' : 'd'])]);
      obj.sort(function (a, b) { return a[0] - b[0]; });
      filas += '<g class="fila" data-calle="' + escXml(c.id) + '">' + locales + obj.map(function (o) { return o[1]; }).join('') + '</g>';
    });
    // La avenida y los límites en pantalla del barrio completo
    if (calles.length) {
      suelo += avenida(G.avenida[0], 20, yFin);
      var a = P(G.avenida[0], yFin, 0), b = P(xFin, yFin, -0.4), c = P(xFin, G.y1, 3);
      cajas.push({ x0: a[0] - 20, y0: B.principal.caja.y0, x1: Math.max(B.principal.caja.x1, c[0] + 20), y1: b[1] + 20 });
    }
    var caja = cajas.reduce(function (m, k) { return { x0: Math.min(m.x0, k.x0), y0: Math.min(m.y0, k.y0), x1: Math.max(m.x1, k.x1), y1: Math.max(m.y1, k.y1) }; });
    return {
      defs: B.defs, suelo: suelo, atras: atras, frente: B.principal.frente, hq: B.principal.hq.replace(/§M§/g, medios), filas: filas, zonas: zonas, caja: caja, pisos: pisos,
      calles: calles.map(function (c) { return { id: c.id, nombre: c.nombre, casos: c.casos.map(function (p) { return p.id; }), y: c.y }; }),
      principal: B.principal.locales.map(function (l) { return l.id; }), total: n
    };
  }

  /* ─────────── Maquetas con gente que camina ─────────── */
  // Un local abierto o la sala de una empresa (locales.js, salas.js). El dibujo viene en capas por profundidad: la capa i
  // lleva lo que está entre x + y = i·paso y (i + 1)·paso, de atrás hacia adelante (M.arriba va sobre todo). Quienes
  // caminan vienen aparte (M.caminan: su dibujo parado en el origen, su ruta [[x, y, espera], …] y su paso) y cada uno va
  // en la capa de donde está parado, así queda detrás o delante de los muebles, como el equipo en la oficina.
  var SVGNS = 'http://www.w3.org/2000/svg';
  function capaDe(M, x, y) { return Math.max(0, Math.min(M.capas.length - 1, Math.floor((x + y + 0.2) / (M.paso || 0.25)))); }
  // Hacia dónde mira quien camina desde la parada i: a la derecha si va hacia +x o hacia −y
  function haciaDerecha(ruta, i) { var a = ruta[i], b = ruta[(i + 1) % ruta.length]; return (b[0] - a[0]) - (b[1] - a[1]) >= 0; }
  // Junta varios dibujos en capas (el local de un caso: su plantilla, su frente y sus extras), capa por capa
  function juntar(partes) {
    var M = { paso: partes[0].paso, capas: [], arriba: '', caminan: [] };
    partes.forEach(function (p) {
      p.capas.forEach(function (s, i) { M.capas[i] = (M.capas[i] || '') + s; });
      M.arriba += p.arriba || ''; M.caminan = M.caminan.concat(p.caminan || []);
    });
    for (var i = 0; i < M.capas.length; i++) M.capas[i] = M.capas[i] || '';
    return M;
  }
  // Para imágenes fijas y vistas previas: cada quien en su primera parada
  function maquetaSvg(M, pintura) {
    pintura = pintura || function (s) { return s; };
    var extra = [];
    (M.caminan || []).forEach(function (c) {
      var x = c.ruta[0][0], y = c.ruta[0][1], k = capaDe(M, x, y), p = P(x, y, 0);
      extra[k] = (extra[k] || '') + '<g transform="translate(' + r1(p[0]) + ' ' + r1(p[1]) + ')' + (haciaDerecha(c.ruta, 0) ? '' : ' scale(-1 1)') + '">' + c.svg + '</g>';
    });
    return M.capas.map(function (s, i) { return pintura(s) + (extra[i] || ''); }).join('') + pintura(M.arriba || '');
  }
  // Todas las maquetas que se mueven comparten un solo cuadro por fotograma
  var vivas = [], latiendo = false, ultimoLatido = 0;
  function latir(t) {
    if (!vivas.length) { latiendo = false; return; }
    var dt = Math.min(0.05, (t - (ultimoLatido || t)) / 1000); ultimoLatido = t;
    vivas.forEach(function (v) { v.andar(dt); });
    requestAnimationFrame(latir);
  }
  // Monta M en el grupo g y devuelve { mover(si), destruir() }: mover(true) echa a andar a su gente (con la animación
  // pausada o el movimiento reducido no se llama y quedan en su primera parada). o.pintar cambia las marcas §…§.
  function maqueta(g, M, o) {
    o = o || {};
    var pintura = o.pintar || function (s) { return s; }, html = '';
    M.capas.forEach(function (s) { html += '<g>' + pintura(s) + '</g>'; });
    g.innerHTML = html + pintura(M.arriba || '');
    var capas = Array.prototype.slice.call(g.children, 0, M.capas.length);
    var gente = (M.caminan || []).map(function (c, n) {
      var el = document.createElementNS(SVGNS, 'g'); el.setAttribute('class', 'andante');
      el.innerHTML = '<g class="andante-dir"><g class="andante-paso">' + c.svg + '</g></g>';
      // Cada uno parte con una espera distinta, para que no se muevan todos a la vez
      var w = { c: c, g: el, dir: el.firstChild, x: c.ruta[0][0], y: c.ruta[0][1], i: 0, espera: (c.ruta[0][2] || 1) * (0.35 + 0.3 * n), der: null, capa: -1 };
      poner(w); mirar(w, haciaDerecha(c.ruta, 0));
      return w;
    });
    function poner(w) {
      var p = P(w.x, w.y, 0), k = capaDe(M, w.x, w.y);
      w.g.setAttribute('transform', 'translate(' + r1(p[0]) + ' ' + r1(p[1]) + ')');
      if (k !== w.capa) { capas[k].appendChild(w.g); w.capa = k; }
    }
    function mirar(w, der) { if (w.der === der) return; w.der = der; w.dir.setAttribute('transform', der ? '' : 'scale(-1 1)'); }
    // Camina hacia la parada que sigue; al llegar, espera lo que diga la ruta (si dice algo) y sigue
    function andar(dt) {
      gente.forEach(function (w) {
        if (w.fijo) return;
        if (w.espera > 0) { w.espera -= dt; if (w.espera <= 0) w.g.classList.add('camina'); return; }
        var r = w.c.ruta, sig = r[(w.i + 1) % r.length], dx = sig[0] - w.x, dy = sig[1] - w.y, dist = Math.sqrt(dx * dx + dy * dy), d = w.c.vel * dt;
        if (dist <= d) {
          w.x = sig[0]; w.y = sig[1]; w.i = (w.i + 1) % r.length;
          if (sig[2]) { w.espera = sig[2]; w.g.classList.remove('camina'); }
        } else {
          w.x += dx / dist * d; w.y += dy / dist * d;
          mirar(w, dx - dy >= 0); w.g.classList.add('camina');
        }
        poner(w);
      });
    }
    var v = { andar: andar };
    function mover(si) {
      var i = vivas.indexOf(v);
      if (si && i < 0) { vivas.push(v); if (!latiendo) { latiendo = true; ultimoLatido = 0; requestAnimationFrame(latir); } }
      else if (!si && i > -1) { vivas.splice(i, 1); gente.forEach(function (w) { w.g.classList.remove('camina'); }); }
    }
    // Lleva a quien camina (por su id) al punto (x, y) del piso y lo deja ahí, mirando a la derecha si der; sin punto,
    // lo devuelve a la parada de su ruta a la que iba, y sigue caminando. Lo usa el recorrido de una sala propia.
    function llevar(id, x, y, der) {
      var w = gente.filter(function (q) { return q.c.id === id; })[0]; if (!w) return null;
      if (x === undefined || x === null) { var p = w.c.ruta[(w.i + 1) % w.c.ruta.length]; w.fijo = false; w.x = p[0]; w.y = p[1]; w.i = (w.i + 1) % w.c.ruta.length; w.espera = p[2] || 1; }
      else { w.fijo = true; w.x = x; w.y = y; }
      w.g.classList.remove('camina'); poner(w);
      if (der !== undefined) mirar(w, der);
      return w;
    }
    return { mover: mover, destruir: function () { mover(false); g.innerHTML = ''; }, gente: gente, llevar: llevar };
  }

  /* ─────────── Construcción ─────────── */
  function construir(svg, opciones) {
    opciones = opciones || {};
    var animado = opciones.animado !== false;
    var NS = 'http://www.w3.org/2000/svg';
    var BUCKETS = (ANCHO + FONDO) * 2 + 8;
    var cubos = []; for (var i = 0; i < BUCKETS; i++) cubos.push('');
    var piso = '', muros = '', hits = '';

    function agregar(_a, _b, contenido, x, y) {
      var k = Math.max(0, Math.min(BUCKETS - 1, Math.floor((x + y) * 2)));
      cubos[k] += contenido;
    }
    function obj(x, y, contenido) { agregar(0, 0, contenido, x, y); }
    function sobre(x, y, z, contenido) { var p = P(x, y, z); obj(x, y + 0.01, '<g transform="translate(' + r1(p[0]) + ' ' + r1(p[1]) + ')">' + contenido + '</g>'); }

    /* Piso y losa */
    piso += poly([[0, 0, 0], [ANCHO, 0, 0], [ANCHO, FONDO, 0], [0, FONDO, 0]], 'fill="' + M.piso + '"');
    var lineas = '';
    for (var gx = 1; gx < ANCHO; gx++) lineas += '<polyline points="' + pts([[gx, 0, 0], [gx, FONDO, 0]]) + '"/>';
    for (var gy = 1; gy < FONDO; gy++) lineas += '<polyline points="' + pts([[0, gy, 0], [ANCHO, gy, 0]]) + '"/>';
    piso += '<g stroke="' + M.pisoLinea + '" stroke-width="1" fill="none">' + lineas + '</g>';
    piso += poly([[0, FONDO, 0], [ANCHO, FONDO, 0], [ANCHO, FONDO, -0.4], [0, FONDO, -0.4]], 'fill="' + M.losaIzq + '"');
    piso += poly([[ANCHO, 0, 0], [ANCHO, FONDO, 0], [ANCHO, FONDO, -0.4], [ANCHO, 0, -0.4]], 'fill="' + M.losaDer + '"');
    piso += '<polyline points="' + pts([[0, FONDO, 0], [ANCHO, FONDO, 0], [ANCHO, 0, 0]]) + '" stroke="rgba(127,216,207,.45)" stroke-width="1.5" fill="none"/>';

    // Luz en el piso bajo cada estación y sobre la mesa de dos
    [[8.8, 9.2, 2.2], [13.8, 9.2, 2.2], [8.8, 13.2, 2.2], [13.8, 13.2, 2.2], [21.4, 9.2, 2.4], [20.6, 16.8, 2.8], [2.7, 13.2, 2.2], [8.0, 2.45, 2.6], [18.0, 2.8, 1.8]].forEach(function (l) {
      var p = P(l[0], l[1], 0);
      piso += '<ellipse cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" rx="' + r1(l[2] * TW * 1.35) + '" ry="' + r1(l[2] * TH * 1.35) + '" fill="url(#luz-piso)"/>';
    });

    /* Alfombras de salas */
    function alfombra(x0, y0, x1, y1, color, borde) {
      piso += poly([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], 'fill="' + color + '"' + (borde ? ' stroke="' + borde + '" stroke-width="1.5"' : ''));
    }
    function lineaPiso(a, b, attr) { piso += '<polyline points="' + pts([a, b]) + '" fill="none" ' + attr + '/>'; }
    alfombra(0.1, 10.9, 5.3, 15.5, M.alfombra, 'rgba(23,195,178,.35)');
    alfombra(20.3, 17.7, 23.8, 19.8, '#17446F', 'rgba(23,195,178,.5)');
    piso += enPlano(planoZ(20.3, 17.7, 0), texto(70, 128, 'PASA', 62, 'rgba(242,244,247,.8)', 700, 'letter-spacing="10"'));
    // Planos (grilla cian) y máquinas (grafito con franjas naranjas), unidas por la línea de dos colores
    alfombra(4.12, 0.1, 8, 4.5, '#12506A');
    [4.9, 5.7, 6.5, 7.3].forEach(function (x) { lineaPiso([x, 0.1, 0.01], [x, 4.5, 0.01], 'stroke="rgba(127,216,207,.3)" stroke-width="1"'); });
    [1.0, 2.0, 3.0, 4.0].forEach(function (y) { lineaPiso([4.12, y, 0.01], [8, y, 0.01], 'stroke="rgba(127,216,207,.3)" stroke-width="1"'); });
    alfombra(8, 0.1, 11.88, 4.5, '#2C323B');
    [3.75, 4.15].forEach(function (y) { lineaPiso([8.3, y, 0.01], [11.6, y, 0.01], 'stroke="rgba(245,136,58,.45)" stroke-width="2"'); });
    lineaPiso([8, 0.15, 0.02], [8, 4.45, 0.02], 'stroke="url(#linea-dos)" stroke-width="3" stroke-dasharray="8 6"');
    // El set, el laboratorio y la sala de reuniones
    alfombra(12.12, 0.1, 15.88, 4.5, '#15324F');
    piso += enPlano(planoZ(13.5, 2.25, 0.01), '<path d="M0 0L50 50M50 0L0 50" stroke="' + C.cian + '" stroke-width="7" stroke-linecap="round"/>');
    alfombra(16.12, 0.1, 19.88, 4.5, M.alfombra2);
    alfombra(20.12, 0.1, 23.9, 4.5, '#1B4670');

    /* Muros de fondo */
    // muro izquierdo (plano x = 0) y muro derecho (plano y = 0)
    muros += poly([[0, 0, 0], [0, FONDO, 0], [0, FONDO, ALTO_MURO], [0, 0, ALTO_MURO]], 'fill="' + M.muroX + '"');
    muros += poly([[0, 0, 0], [ANCHO, 0, 0], [ANCHO, 0, ALTO_MURO], [0, 0, ALTO_MURO]], 'fill="' + M.muroY + '"');
    muros += poly([[0, 0, 0], [0, FONDO, 0], [0, FONDO, .14], [0, 0, .14]], 'fill="' + M.zocalo + '"');
    muros += poly([[0, 0, 0], [ANCHO, 0, 0], [ANCHO, 0, .14], [0, 0, .14]], 'fill="' + M.zocalo + '"');
    muros += poly([[-0.3, -0.3, ALTO_MURO], [ANCHO, -0.3, ALTO_MURO], [ANCHO, 0, ALTO_MURO], [0, 0, ALTO_MURO], [0, FONDO, ALTO_MURO], [-0.3, FONDO, ALTO_MURO]], 'fill="' + M.muroTope + '"');
    muros += poly([[-0.3, FONDO, -0.4], [0, FONDO, -0.4], [0, FONDO, ALTO_MURO], [-0.3, FONDO, ALTO_MURO]], 'fill="#1E4A75"');
    muros += poly([[ANCHO, -0.3, -0.4], [ANCHO, 0, -0.4], [ANCHO, 0, ALTO_MURO], [ANCHO, -0.3, ALTO_MURO]], 'fill="#0E2A47"');

    // Ventanas altas con la cordillera de noche
    function cordillera(w, h, semilla) {
      var s = '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="url(#cielo)"/>';
      var pp = ['0,' + h], x = 0, k = semilla;
      while (x < w) {
        k = (k * 9301 + 49297) % 233280; var alto = 18 + (k / 233280) * 40;
        pp.push(r1(x + 22) + ',' + r1(h - alto)); x += 44 + (k % 30);
        pp.push(r1(x) + ',' + r1(h - 10 - (k % 14)));
      }
      pp.push(w + ',' + h);
      s += '<polygon points="' + pp.join(' ') + '" fill="#0B2340"/>';
      for (var e = 0; e < w / 90; e++) { k = (k * 9301 + 49297) % 233280; s += '<circle cx="' + r1((e * 90 + k % 80)) + '" cy="' + r1(6 + k % 20) + '" r="1.6" fill="' + C.niebla + '" opacity=".7"/>'; }
      for (var m = 60; m < w; m += 150) s += '<rect x="' + m + '" y="0" width="5" height="' + h + '" fill="' + M.zocalo + '"/>';
      return s + '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="none" stroke="' + M.zocalo + '" stroke-width="5"/>';
    }
    muros += enPlano(planoX(0, 19.6, 2.8), cordillera(1920, 66, 7));
    muros += enPlano(planoY(0.4, 0, 2.8), cordillera(2320, 66, 3) + '<circle cx="1760" cy="24" r="11" fill="' + C.niebla + '" opacity=".9"/><circle cx="1765" cy="20" r="10" fill="#10304F" opacity=".9"/>');

    /* ── Café (esquina del fondo) ── */
    obj(1.5, 0.4, caja(0.3, 0.05, 0, 3.4, 0.75, 0.95, { t: M.mesa, l: '#6B7A8C', r: '#5B6B7F' }));
    obj(2.8, 0.4, caja(2.35, 0.12, 0.95, 0.7, 0.45, 0.6, C.grafito) + (function () { var p = P(2.9, 0.57, 1.35); return '<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="2.5" fill="' + C.cian + '"/>'; })());
    obj(1.4, 0.5, cilindro(1.2, 0.4, 0.95, 0.1, 0.18, { t: C.niebla, l: C.a300 }) + cilindro(1.55, 0.35, 0.95, 0.1, 0.18, { t: C.c300, l: C.c600 }));
    // reloj de pared con la hora de Chile
    muros += enPlano(planoY(1.0, 0, 2.0), '<circle cx="60" cy="42" r="36" fill="' + C.niebla + '" stroke="' + C.a800 + '" stroke-width="5"/>' +
      '<g id="reloj-horas"><line x1="60" y1="42" x2="60" y2="22" stroke="' + C.a800 + '" stroke-width="5" stroke-linecap="round"/></g>' +
      '<g id="reloj-min"><line x1="60" y1="42" x2="60" y2="12" stroke="' + C.c700 + '" stroke-width="3" stroke-linecap="round"/></g><circle cx="60" cy="42" r="4" fill="' + C.a800 + '"/>');
    obj(1.7, 2.7, cilindro(1.7, 2.7, 0, 0.08, 0.72, { t: C.a300, l: C.a500 }) + cilindro(1.7, 2.7, 0.72, 0.55, 0.06, { t: M.mesa, l: M.mesaDer }));
    obj(1.0, 3.2, cilindro(1.0, 3.2, 0, 0.22, 0.48, { t: C.a600, l: C.a700 }));
    obj(2.5, 3.1, cilindro(2.5, 3.1, 0, 0.22, 0.48, { t: C.a600, l: C.a700 }));
    obj(0.6, 3.9, planta(0.6, 3.9, 1.25));
    muros += enPlano(planoY(0.5, 0, 1.55), '<rect x="0" y="0" width="160" height="26" rx="4" fill="' + C.a800 + '"/>' + texto(14, 19, 'CAFÉ', 16, C.niebla, 600, 'letter-spacing="4"'));

    /* ── Planos y máquinas: una sola sala, con el vidrio abierto al medio ── */
    // El plano en la pizarra
    muros += enPlano(planoY(4.45, 0, 2.15), '<rect x="-6" y="-6" width="322" height="137" rx="6" fill="' + C.a200 + '"/><rect x="0" y="0" width="310" height="125" fill="' + C.niebla + '"/>' +
      mono(12, 22, 'EL PLANO', 13, C.a800, 'letter-spacing="3"') +
      '<g fill="none" stroke="' + C.a600 + '" stroke-width="3"><rect x="16" y="40" width="70" height="30" rx="5"/><rect x="118" y="40" width="70" height="30" rx="5"/><rect x="220" y="40" width="74" height="30" rx="5"/><rect x="118" y="86" width="70" height="28" rx="5"/>' +
      '<path d="M86 55H114M188 55H216M153 70V84"/></g><rect x="220" y="40" width="74" height="30" rx="5" fill="' + C.cian + '" opacity=".3"/>' +
      '<path d="M108 50l7 5-7 5M210 50l7 5-7 5" fill="' + C.a600 + '"/>' +
      mono(27, 60, 'PEDIDO', 10, C.a800) + mono(126, 60, 'APROBAR', 10, C.a800) + mono(229, 60, 'FACTURA', 10, C.a800) + mono(131, 105, 'STOCK', 10, C.a800));
    // El tubo del plano: cuando está listo, baja a las máquinas
    muros += enPlano(planoY(7.5, 0.03, 1.72), '<rect x="0" y="0" width="112" height="14" rx="7" fill="rgba(127,216,207,.18)" stroke="' + C.c300 + '" stroke-width="2"/>' +
      '<rect class="capsula' + (animado ? '' : ' quieto') + '" x="4" y="3" width="22" height="8" rx="4" fill="' + C.cian + '"/>');
    // Racks y la pantalla de las automatizaciones
    [8.6, 9.6].forEach(function (x) {
      var leds = '';
      for (var k = 0; k < 6; k++) leds += '<rect class="' + (k === 2 || k === 4 ? 'led' : '') + '" style="animation-delay:' + (k * .4).toFixed(1) + 's" x="0" y="' + (k * 18) + '" width="' + (k % 3 === 1 ? 40 : 60) + '" height="6" rx="2" fill="' + (k % 2 ? C.cian : NARANJO) + '"/>';
      obj(x + 0.4, 0.4, caja(x, 0.1, 0, 0.8, 0.55, 1.9, { t: '#3A424E', l: '#2A3038', r: '#1E232A' }) + enPlano(planoY(x + 0.1, 0.651, 1.7), leds));
    });
    muros += pantallaY(10.65, 11.75, 0, 1.95, 1.05, PANTALLAS.maquinas);
    // La mesa de dos: el plano en una punta, la tablet en la otra, y Atlas proyectando el mapa
    obj(10.8, 2.95, caja(5.2, 2.0, 0, 5.6, 0.9, 0.75, { t: M.mesa, l: M.mesaIzq, r: M.mesaDer }) +
      enPlano(planoZ(5.5, 2.12, 0.76), '<rect x="0" y="0" width="190" height="64" rx="4" fill="' + C.vidrio + '" stroke="' + C.cian + '" stroke-width="3"/>' +
        '<g fill="none" stroke="' + C.a700 + '" stroke-width="3"><rect x="14" y="16" width="36" height="18" rx="3"/><rect x="78" y="16" width="36" height="18" rx="3"/><rect x="142" y="16" width="36" height="18" rx="3"/><path d="M50 25H78M114 25H142M96 34V48H160"/></g>') +
      enPlano(planoZ(9.35, 2.18, 0.76), '<rect x="0" y="0" width="110" height="52" rx="6" fill="#1B222B"/><rect x="6" y="6" width="98" height="40" rx="3" fill="#0C3A48"/>' +
        '<path d="M14 34L32 20L50 28L68 12L92 22" stroke="' + NARANJO + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>') +
      '<polygon class="haz-atlas" points="' + pts([[6.3, 2.45, 1.72], [5.5, 2.76, 0.77], [7.4, 2.76, 0.77], [7.4, 2.12, 0.77]]) + '" fill="rgba(127,216,207,.16)"/>');
    tramos(agregar, 4, 0, 4, 4.6, ALTO_VIDRIO);
    tramos(agregar, 8, 0, 8, 1.3, ALTO_VIDRIO); tramos(agregar, 8, 3.3, 8, 4.6, ALTO_VIDRIO);
    tramos(agregar, 4, 4.6, 12, 4.6, ALTO_VIDRIO, [3.3, 4.7]);
    // la placa va después de la mesa en el orden de dibujo: está más cerca, sobre el vidrio del frente
    obj(10.6, 4.7, placa(6.2, 4.62, 360, 'PLANOS Y MÁQUINAS', [C.cian, NARANJO]));

    /* ── El set: donde graban Aby y Felipe ── */
    muros += enPlano(planoY(12.3, 0, 2.2), '<rect x="0" y="0" width="340" height="176" rx="6" fill="' + C.a800 + '" stroke="#2A5A88" stroke-width="4"/>' +
      (function () { var s = ''; for (var yy = 18; yy < 170; yy += 26) for (var xx = 18; xx < 330; xx += 26) s += '<circle cx="' + xx + '" cy="' + yy + '" r="1.6" fill="#2A5A88"/>'; return s; })() +
      '<g transform="translate(118 30) scale(.9)">' + E.isotipo + '</g>' +
      '<text x="170" y="150" text-anchor="middle" font-weight="700" font-size="24"><tspan font-family="Space Mono, monospace" fill="' + C.niebla + '" letter-spacing="-1">Bi</tspan><tspan font-family="Space Grotesk, sans-serif" fill="' + C.cian + '">Plot</tspan><tspan font-family="Space Grotesk, sans-serif" fill="' + C.a300 + '"> HQ</tspan></text>' +
      '<circle class="rec" cx="300" cy="24" r="6" fill="#E0524A"/>' + mono(266, 28, 'REC', 11, C.niebla));
    obj(12.9, 1.3, cilindro(12.9, 1.3, 0, 0.2, 0.52, { t: '#C9A27A', l: '#8B6A4E' }));
    (function () {
      // Aro de luz en su pedestal
      var b = P(15.2, 2.3, 0), t = P(15.2, 2.3, 1.5), s = '';
      s += '<line x1="' + r1(b[0]) + '" y1="' + r1(b[1]) + '" x2="' + r1(t[0]) + '" y2="' + r1(t[1]) + '" stroke="' + C.a300 + '" stroke-width="2.5"/>';
      [[-12, 5], [12, 5], [0, 9]].forEach(function (d) { s += '<line x1="' + r1(b[0]) + '" y1="' + r1(b[1] - 10) + '" x2="' + r1(b[0] + d[0]) + '" y2="' + r1(b[1] + d[1]) + '" stroke="' + C.a300 + '" stroke-width="2"/>'; });
      s += '<circle cx="' + r1(t[0]) + '" cy="' + r1(t[1] - 4) + '" r="34" fill="url(#halo-cian)"/><ellipse cx="' + r1(t[0]) + '" cy="' + r1(t[1] - 4) + '" rx="12" ry="16" fill="none" stroke="' + C.niebla + '" stroke-width="5"/>';
      obj(15.2, 2.3, s);
      // Cámara en su trípode, mirando a Aby y Felipe
      var c = P(14.9, 3.5, 1.05), cb = P(14.9, 3.5, 0);
      obj(14.9, 3.5, [[-11, 6], [9, 7], [-1, 11]].map(function (d) { return '<line x1="' + r1(c[0]) + '" y1="' + r1(c[1]) + '" x2="' + r1(cb[0] + d[0]) + '" y2="' + r1(cb[1] + d[1]) + '" stroke="' + C.a300 + '" stroke-width="2"/>'; }).join('') +
        caja(14.72, 3.38, 1.05, 0.36, 0.24, 0.22, { t: '#3A424E', l: '#2A3038', r: '#1E232A' }) + (function () { var q = P(14.8, 3.45, 1.3); return '<circle class="rec" cx="' + r1(q[0]) + '" cy="' + r1(q[1]) + '" r="2.6" fill="#E0524A"/>'; })());
    })();
    obj(15.5, 0.6, planta(15.5, 0.6, 0.9));
    tramos(agregar, 12, 0, 12, 4.6, ALTO_VIDRIO);
    tramos(agregar, 12, 4.6, 16, 4.6, ALTO_VIDRIO, [1.4, 2.6]);
    obj(14, 4.7, placa(12.45, 4.62, 310, 'EL SET', [C.c300]));

    /* ── Laboratorio de métricas: el antes y el después ── */
    muros += pantallaY(16.45, 19.55, 0, 2.05, 0.85, PANTALLAS.metricas);
    obj(18.6, 3.2, caja(17.4, 2.4, 0, 1.2, 0.8, 1.05, { t: M.mesa, l: M.mesaIzq, r: M.mesaDer }));
    sobre(17.85, 2.75, 1.05, '<path d="M-14 0 l14 7 l14 -7 l-14 -7 Z" fill="' + C.a300 + '"/><path d="M0 -7 l14 -7 v-16 l-14 7 Z" fill="' + C.grafito + '"/><path d="M2 -9 l10 -5 v-11 l-10 5 Z" fill="' + C.c700 + '"/>');
    sobre(18.35, 2.8, 1.05, '<circle cx="0" cy="-6" r="6.5" fill="' + C.niebla + '" stroke="' + C.a700 + '" stroke-width="2"/><path d="M0 -6V-10M0 -6L3 -4" stroke="' + C.a800 + '" stroke-width="1.6"/><rect x="-2" y="-15" width="4" height="3" fill="' + C.a700 + '"/>');
    obj(19.5, 3.95, planta(19.5, 3.95, 1));
    tramos(agregar, 16, 0, 16, 4.6, ALTO_VIDRIO);
    tramos(agregar, 16, 4.6, 20, 4.6, ALTO_VIDRIO, [1.4, 2.6]);
    obj(18, 4.7, placa(16.45, 4.62, 310, 'LABORATORIO', [C.cian]));

    /* ── Sala de reuniones: mesa redonda y la pantalla con el avance de la semana ── */
    tramos(agregar, 20, 0, 20, 4.6, ALTO_VIDRIO);
    muros += pantallaY(20.55, 23.45, 0, 1.95, 0.95, function (w, h) {
      var s = texto(12, 22, 'ESTA SEMANA', 13, C.niebla, 600, 'letter-spacing="2"');
      [['Diagnóstico', C.cian, .8], ['Plano', C.c300, .55], ['Máquinas', NARANJO, .35]].forEach(function (f, i) {
        s += mono(12, 46 + i * 20, f[0], 10, C.a300) + '<rect x="110" y="' + (38 + i * 20) + '" width="' + r1((w - 130) * f[2]) + '" height="9" rx="3" fill="' + f[1] + '"/>';
      });
      return s;
    });
    obj(22.1, 2.5, cilindro(22.1, 2.5, 0, 0.09, 0.72, { t: C.a300, l: C.a500 }) + cilindro(22.1, 2.5, 0.72, 0.8, 0.07, { t: M.mesa, l: M.mesaDer }) +
      (function () { var p = P(21.8, 2.4, 0.8); return '<path d="M' + r1(p[0] - 12) + ' ' + r1(p[1]) + ' l12 6 l12 -6 l-12 -6 Z" fill="' + C.niebla + '"/>'; })() +
      cilindro(22.55, 2.3, 0.79, 0.07, 0.12, { t: C.niebla, l: C.a300 }));
    [[21.0, 2.0], [21.2, 3.4], [23.3, 3.2]].forEach(function (c) { obj(c[0], c[1], cilindro(c[0], c[1], 0, 0.22, 0.46, { t: C.a600, l: C.a700 })); });
    obj(23.5, 0.6, planta(23.5, 0.6, 0.95));
    obj(22, 4.7, placa(20.45, 4.62, 280, 'REUNIONES', [C.cian]));

    /* ── Estantería del núcleo (muro izquierdo) ── */
    [[4.9, 6.7], [6.8, 8.6], [8.7, 10.5]].forEach(function (u, k) {
      obj(0.4, (u[0] + u[1]) / 2, caja(0.05, u[0], 0, 0.7, u[1] - u[0] - 0.08, 2.5, { t: '#2A5A88', l: '#17446F', r: '#0E2A47' }) +
        enPlano(planoX(0.75, u[1] - 0.08, 2.5), (function () {
          var w = (u[1] - u[0] - 0.08) * 100, s = '<rect x="0" y="0" width="' + w + '" height="250" fill="#0B2440"/>';
          for (var e = 1; e < 4; e++) s += '<rect x="0" y="' + (e * 62 - 6) + '" width="' + w + '" height="7" fill="#2A5A88"/>';
          var colores = [C.a300, C.c600, C.niebla, C.a600, C.c300, C.a200, C.cian, C.a500];
          for (var f = 0; f < 4; f++) {
            var x = 8, n = 0;
            while (x < w - 18 && n < 9) {
              var ancho = 10 + ((f * 7 + n * 5 + k * 3) % 3) * 4, altoL = 34 + ((f + n + k) % 3) * 6;
              if (k === 1 && f === 1 && n < 4) {
                s += '<rect x="' + x + '" y="' + (f * 62 + 50 - 44) + '" width="24" height="44" rx="2" fill="' + C.cian + '"/>' + mono(x + 12, f * 62 + 50 - 12, '0' + (n + 1), 11, C.a900, 'text-anchor="middle"');
                x += 28;
              } else {
                s += '<rect x="' + x + '" y="' + (f * 62 + 50 - altoL) + '" width="' + ancho + '" height="' + altoL + '" rx="1.5" fill="' + colores[(f * 3 + n + k) % colores.length] + '"/>';
                x += ancho + 3;
              }
              n++;
            }
          }
          return s;
        })()));
    });
    muros += enPlano(planoX(0.02, 10.4, 2.95), '<rect x="0" y="0" width="560" height="30" rx="5" fill="' + C.a800 + '"/>' + texto(16, 21, 'ESTANTERÍA DEL NÚCLEO', 16, C.c300, 600, 'letter-spacing="3"'));
    // escalera apoyada
    (function () {
      var a = P(1.35, 7.4, 0), b = P(0.8, 7.4, 2.5), c = P(1.35, 7.95, 0), d = P(0.8, 7.95, 2.5), s = '';
      s += '<line x1="' + r1(a[0]) + '" y1="' + r1(a[1]) + '" x2="' + r1(b[0]) + '" y2="' + r1(b[1]) + '" stroke="' + C.a300 + '" stroke-width="3"/>';
      s += '<line x1="' + r1(c[0]) + '" y1="' + r1(c[1]) + '" x2="' + r1(d[0]) + '" y2="' + r1(d[1]) + '" stroke="' + C.a300 + '" stroke-width="3"/>';
      for (var t = 0.15; t < 1; t += 0.17) s += '<line x1="' + r1(a[0] + (b[0] - a[0]) * t) + '" y1="' + r1(a[1] + (b[1] - a[1]) * t) + '" x2="' + r1(c[0] + (d[0] - c[0]) * t) + '" y2="' + r1(c[1] + (d[1] - c[1]) * t) + '" stroke="' + C.a300 + '" stroke-width="2"/>';
      obj(1.2, 7.7, s);
    })();
    // mesa de lectura con el Recetario abierto
    obj(3.3, 7.8, caja(2.4, 7.2, 0, 1.8, 1.2, 0.75, { t: M.mesa, l: M.mesaIzq, r: M.mesaDer }) +
      enPlano(planoZ(2.8, 7.5, 0.76), '<path d="M0 0 L50 -6 L50 44 L0 50 Z" fill="' + C.niebla + '"/><path d="M50 -6 L100 0 L100 50 L50 44 Z" fill="#EDF1F5"/>' +
        '<path d="M8 12 L42 8 M8 22 L42 18 M58 10 L92 14 M58 20 L92 24" stroke="' + C.a300 + '" stroke-width="3"/>') +
      (function () { var p = P(3.9, 7.4, 0.75); return '<line x1="' + r1(p[0]) + '" y1="' + r1(p[1]) + '" x2="' + r1(p[0] + 4) + '" y2="' + r1(p[1] - 24) + '" stroke="' + C.a300 + '" stroke-width="2.5"/><circle cx="' + r1(p[0] + 4) + '" cy="' + r1(p[1] - 20) + '" r="18" fill="url(#halo-cian)"/><path d="M' + r1(p[0] - 6) + ' ' + r1(p[1] - 20) + ' l10 -10 l8 8 Z" fill="' + C.c300 + '"/>'; })());
    obj(4.3, 5.1, planta(4.3, 5.1, 1.1));

    /* ── Sala E1 ── */
    muros += pantallaX(0, 15.0, 11.4, 2.05, 0.85, function (w, h) {
      var s = '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="' + C.niebla + '"/>' + texto(12, 24, 'EL MOTOR', 15, C.a800, 700, 'letter-spacing="3"');
      s += '<line x1="18" y1="' + (h * .6) + '" x2="' + (w - 18) + '" y2="' + (h * .6) + '" stroke="' + C.a300 + '" stroke-width="3"/>';
      for (var f = 0; f < 10; f++) {
        var x = 18 + f * (w - 36) / 9;
        s += '<circle cx="' + x + '" cy="' + (h * .6) + '" r="' + (f === 1 ? 9 : 6) + '" fill="' + (f === 1 ? C.cian : f === 9 ? C.c600 : C.a600) + '"/>' + mono(x, h * .6 + 26, 'E' + f, 11, C.a700, 'text-anchor="middle"');
      }
      s += '<rect x="' + (w * .55) + '" y="12" width="44" height="30" fill="' + C.c300 + '"/><rect x="' + (w * .72) + '" y="16" width="44" height="30" fill="' + C.a150 + '"/>';
      return s;
    });
    obj(2.6, 13.2, caja(1.4, 12.3, 0, 2.4, 1.8, 0.75, { t: M.mesa, l: M.mesaIzq, r: M.mesaDer }) +
      (function () { var p = P(2.2, 12.9, 0.76); return '<path d="M' + r1(p[0]) + ' ' + r1(p[1]) + ' l14 7 l14 -7 l-14 -7 Z" fill="' + C.a300 + '"/><path d="M' + r1(p[0] + 14) + ' ' + r1(p[1] - 7) + ' l14 -7 v-16 l-14 7 Z" fill="' + C.grafito + '"/>'; })() +
      cilindro(3.3, 13.6, 0.75, 0.08, 0.14, { t: C.niebla, l: C.a300 }));
    [[1.0, 12.8], [1.0, 13.7], [4.2, 12.8], [4.2, 13.7]].forEach(function (s) { obj(s[0], s[1], caja(s[0] - 0.22, s[1] - 0.22, 0, 0.44, 0.44, 0.45, { t: C.a600, l: C.a700, r: C.a800 })); });
    tramos(agregar, 0, 10.8, 5.4, 10.8, ALTO_VIDRIO);
    tramos(agregar, 5.4, 10.8, 5.4, 15.6, ALTO_VIDRIO, [1.8, 2.8]);

    /* ── Puerta 404: una caja cerrada, con una puerta que nunca se abre ── */
    (function () {
      var h = ALTO_VIDRIO + 0.1, s = caja(0.02, 15.62, 0, 5.38, 4.36, h, { t: '#12304F', l: '#0E2A47', r: '#153A5E' });
      // techo con franjas diagonales: la caja no deja ver qué hay adentro
      s += enPlano(planoZ(0.02, 15.62, h + 0.001), (function () {
        var W = 538, H = 436, l = '';
        for (var k = -H; k < W; k += 40) { var xa = Math.max(0, k), xb = Math.min(W, H + k); if (xb > xa) l += '<path d="M' + xa + ' ' + (xa - k) + 'L' + xb + ' ' + (xb - k) + '"/>'; }
        return '<g stroke="rgba(127,216,207,.07)" stroke-width="9">' + l + '</g>';
      })());
      // la puerta, con su placa y la luz que se escapa por abajo
      s += enPlano(planoX(5.405, 18.25, 1.9), '<rect x="0" y="0" width="100" height="190" rx="3" fill="#0B1726" stroke="#2A5A88" stroke-width="4"/>' +
        '<rect x="22" y="34" width="56" height="26" rx="4" fill="' + C.niebla + '"/>' + mono(50, 53, '404', 18, C.a800, 'text-anchor="middle"') +
        '<circle cx="80" cy="104" r="5" fill="' + C.a300 + '"/><rect class="luz-404" x="4" y="184" width="92" height="4" fill="' + C.c300 + '"/>');
      s += enPlano(planoX(5.405, 19.35, 2.3), '<rect x="0" y="0" width="210" height="30" rx="5" fill="' + C.a800 + '" stroke="' + C.cian + '" stroke-width="2"/>' + texto(14, 21, 'PUERTA 404', 16, C.niebla, 600, 'letter-spacing="3"'));
      obj(5.4, 20, s);
      piso += enPlano(planoZ(5.5, 17.25, 0.005), '<rect x="0" y="0" width="60" height="100" rx="6" fill="#0B2440" stroke="rgba(127,216,207,.35)" stroke-width="2"/>');
    })();

    /* ── Estaciones del equipo ── */
    function panel(xa, xb, y, contenido) {
      obj((xa + xb) / 2, y, caja(xa + 0.2, y - 0.08, 0, 0.12, 0.08, 0.4, C.a500) + caja(xb - 0.32, y - 0.08, 0, 0.12, 0.08, 0.4, C.a500) +
        caja(xa, y - 0.18, 0.4, xb - xa, 0.18, 1.8, { t: '#2A5A88', l: '#1D4468', r: '#123754' }) +
        pantallaY(xa + 0.12, xb - 0.12, y, 2.1, 0.52, contenido));
    }
    function escritorio(xa, ya, xb, yb) { obj((xa + xb) / 2, (ya + yb) / 2, caja(xa, ya, 0, xb - xa, yb - ya, 1.05, { t: M.mesa, l: M.mesaIzq, r: M.mesaDer })); }
    panel(7.2, 10.2, 7.15, PANTALLAS.datos); escritorio(7.4, 7.55, 9.6, 8.35);
    panel(12.2, 15.2, 7.15, PANTALLAS.diseno); escritorio(12.4, 7.55, 14.6, 8.35);
    panel(7.2, 10.2, 11.15, PANTALLAS.codigo); escritorio(7.4, 11.55, 9.6, 12.35);
    panel(12.2, 15.2, 11.15, PANTALLAS.qa); escritorio(12.4, 11.55, 14.6, 12.35);
    // cosas sobre los escritorios
    function sobre(x, y, z, contenido) { var p = P(x, y, z); obj(x, y + 0.01, '<g transform="translate(' + r1(p[0]) + ' ' + r1(p[1]) + ')">' + contenido + '</g>'); }
    sobre(8.2, 7.95, 1.05, '<path d="M-14 0 l14 7 l14 -7 l-14 -7 Z" fill="' + C.a300 + '"/><path d="M0 -7 l14 -7 v-16 l-14 7 Z" fill="' + C.grafito + '"/><path d="M2 -9 l10 -5 v-11 l-10 5 Z" fill="' + C.c700 + '"/>');
    sobre(9.1, 7.9, 1.05, '<path d="M-10 0 l10 5 l10 -5 l-10 -5 Z" fill="' + C.niebla + '"/><path d="M-6 0 l10 5 l6 -3 l-10 -5 Z" fill="' + C.niebla + '" transform="translate(2 -3)"/>');
    sobre(13.2, 7.95, 1.05, '<path d="M-18 0 l18 9 l18 -9 l-18 -9 Z" fill="' + C.grafito + '"/><path d="M-12 0 l12 6 l12 -6 l-12 -6 Z" fill="#123754"/><path d="M-6 1 l6 -8" stroke="' + C.cian + '" stroke-width="2"/>');
    sobre(14.1, 7.9, 1.05, '<circle cx="-6" cy="0" r="4" fill="' + C.cian + '"/><circle cx="3" cy="-2" r="4" fill="' + C.niebla + '"/><circle cx="11" cy="1" r="4" fill="' + C.a600 + '"/>');
    sobre(8.4, 11.95, 1.05, '<path d="M-20 0 l20 10 l20 -10 l-20 -10 Z" fill="' + C.grafito + '"/><path d="M-15 0 l15 7.5 l15 -7.5 l-15 -7.5 Z" fill="#2B2B2E"/>');
    sobre(9.2, 11.8, 1.05, '<rect x="-5" y="-12" width="10" height="12" rx="2" fill="' + C.niebla + '"/><rect x="-5" y="-8" width="10" height="3" fill="' + C.cian + '"/>');
    sobre(13.0, 11.95, 1.05, '<rect x="-8" y="-20" width="16" height="20" rx="4" fill="rgba(127,216,207,.3)" stroke="' + C.c300 + '" stroke-width="1.5"/><rect x="-9" y="-23" width="18" height="4" rx="1.5" fill="' + C.a300 + '"/>' +
      '<circle class="bicho" cx="-3" cy="-8" r="1.8" fill="' + C.a900 + '"/><circle class="bicho bicho-2" cx="3" cy="-12" r="1.8" fill="' + C.a900 + '"/><circle cx="1" cy="-5" r="1.6" fill="' + C.a900 + '"/>');
    sobre(14.0, 11.9, 1.05, '<path d="M-10 0 l10 5 l10 -5 l-10 -5 Z" fill="' + C.niebla + '"/><path d="M-6 -1 l3 2 l5 -4" stroke="' + C.c700 + '" stroke-width="1.6" fill="none"/>');
    obj(11.2, 9.9, planta(11.2, 9.9, 1));
    obj(11.9, 5.5, planta(11.9, 5.5, 1.1));
    obj(16.5, 5.6, planta(16.5, 5.6, 1.05));

    /* ── Despliegue: tubo a producción ── */
    obj(19.7, 7.55, caja(19.2, 7.2, 0, 1.0, 0.7, 1.0, { t: C.a600, l: C.a700, r: C.a800 }) + enPlano(planoY(19.28, 7.9, 1.55), '<rect x="0" y="0" width="84" height="50" rx="3" fill="' + C.grafito + '"/><g transform="translate(4 4)">' + PANTALLAS.despliegue(76, 42) + '</g>'));
    piso += enPlano(planoZ(21.4, 9.2, 0), '<circle cx="0" cy="0" r="120" fill="rgba(23,195,178,.1)" stroke="' + C.cian + '" stroke-width="3" opacity=".8"/><circle class="anillo" cx="0" cy="0" r="80" fill="none" stroke="' + C.cian + '" stroke-width="3"/>');
    (function () {
      var r = 0.55, b = P(21.4, 9.2, 0), t = P(21.4, 9.2, 3.7), rx = r1(r * TW * Math.SQRT2), ry = r1(r * TH * Math.SQRT2);
      var s = '<path d="M' + r1(b[0] - rx) + ' ' + r1(b[1]) + ' A' + rx + ' ' + ry + ' 0 0 0 ' + r1(b[0] + rx) + ' ' + r1(b[1]) + ' V' + r1(t[1]) + ' H' + r1(b[0] - rx) + ' Z" fill="rgba(127,216,207,.1)"/>';
      s += '<g class="paquete' + (animado ? '' : ' quieto') + '" id="paquete"><g transform="translate(' + r1(b[0]) + ' ' + r1(b[1] - 20) + ')"><path d="M-12 -6 l12 -6 l12 6 l-12 6 Z" fill="' + C.niebla + '"/><path d="M-12 -6 v12 l12 6 v-12 Z" fill="' + C.a200 + '"/><path d="M12 -6 v12 l-12 6 v-12 Z" fill="' + C.a300 + '"/><path d="M-6 -9 l12 6 v12" stroke="' + C.cian + '" stroke-width="3" fill="none"/></g></g>';
      s += '<line x1="' + r1(b[0] - rx) + '" y1="' + r1(b[1]) + '" x2="' + r1(b[0] - rx) + '" y2="' + r1(t[1]) + '" stroke="' + C.c300 + '" stroke-width="2" opacity=".7"/>' +
        '<line x1="' + r1(b[0] + rx) + '" y1="' + r1(b[1]) + '" x2="' + r1(b[0] + rx) + '" y2="' + r1(t[1]) + '" stroke="' + C.c300 + '" stroke-width="2" opacity=".7"/>' +
        '<ellipse cx="' + r1(t[0]) + '" cy="' + r1(t[1]) + '" rx="' + rx + '" ry="' + ry + '" fill="rgba(127,216,207,.18)" stroke="' + C.c300 + '" stroke-width="2"/>' +
        '<path d="M' + r1(b[0] - rx) + ' ' + r1(b[1]) + ' A' + rx + ' ' + ry + ' 0 0 0 ' + r1(b[0] + rx) + ' ' + r1(b[1]) + '" stroke="' + C.c300 + '" stroke-width="2" fill="none"/>';
      for (var k = 1; k < 4; k++) { var q = P(21.4, 9.2, k * 0.9); s += '<ellipse cx="' + r1(q[0]) + '" cy="' + r1(q[1]) + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + C.c300 + '" stroke-width="1" opacity=".35"/>'; }
      s += '<g transform="translate(' + r1(t[0]) + ' ' + r1(t[1] - 30) + ')"><rect x="-58" y="-14" width="116" height="24" rx="12" fill="' + C.a800 + '" stroke="' + C.cian + '" stroke-width="1.5"/>' +
        texto(0, 3, 'A PRODUCCIÓN', 10.5, C.c300, 600, 'text-anchor="middle" letter-spacing="1.5"') + '</g>';
      obj(21.4, 9.2, s);
    })();
    [[20.6, 11.4], [21.0, 11.9]].forEach(function (c) { obj(c[0], c[1], caja(c[0] - 0.25, c[1] - 0.25, 0, 0.5, 0.5, 0.45, { t: C.a150, l: C.a300, r: C.a400 }) + poly([[c[0] - 0.25, c[1], 0.451], [c[0] + 0.25, c[1], 0.451]], 'stroke="' + C.cian + '" stroke-width="3"')); });

    /* ── Muro del equipo ── */
    (function () {
      // Un tramo por integrante, cada uno con su retrato: así el orden por profundidad no tapa ninguno.
      var ids = E.ids, xa = 6.6, y = 16.25, paso = 0.8, D = window.OFICINA_DATOS, nombres = {};
      if (D) D.personal.forEach(function (p) { nombres[p.id] = p.nombre.replace(/^The /, ''); });
      ids.forEach(function (id, k) {
        var x = xa + k * paso, s = caja(x, y - 0.25, 0, paso, 0.25, 1.75, { t: '#2A5A88', l: '#1D4468', r: '#123754' });
        s += enPlano(planoY(x, y, 1.58), '<rect x="7" y="0" width="66" height="122" rx="6" fill="' + C.niebla + '"/>' +
          '<rect x="7" y="0" width="66" height="16" rx="6" fill="' + C.a800 + '"/><rect x="7" y="10" width="66" height="6" fill="' + C.a800 + '"/>' +
          '<g transform="translate(40 101) scale(.3)">' + E.svg(id).replace('class="pj ', 'class="pj pj-retrato ') + '</g>' +
          '<text x="40" y="116" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="10" fill="' + C.a800 + '">' + (nombres[id] || id) + '</text>');
        if (k === ids.length - 1) {
          s += enPlano(planoY(xa + 0.15, y, 2.1), '<rect x="0" y="0" width="210" height="30" rx="5" fill="' + C.a800 + '" stroke="' + C.cian + '" stroke-width="2"/>' +
            texto(14, 21, 'EL EQUIPO', 16, C.c300, 600, 'letter-spacing="3"'));
        }
        obj(x + paso / 2, y - 0.12, s);
      });
    })();

    /* ── Recepción ── */
    obj(20.6, 16.05, caja(18.6, 15.6, 0, 4.0, 0.9, 1.05, { t: M.mesa, l: '#17446F', r: '#0E2A47' }) +
      enPlano(planoY(18.6, 16.5, 0.8), '<rect x="0" y="0" width="400" height="8" fill="' + C.cian + '" opacity=".85"/>'));
    sobre(19.3, 15.95, 1.05, '<path d="M-6 0 a6 4 0 0 0 12 0 Z" fill="' + C.a300 + '"/><circle cx="0" cy="-4.5" r="5.5" fill="' + C.a200 + '"/><circle cx="0" cy="-10" r="1.8" fill="' + C.a300 + '"/>');
    sobre(21.9, 16.0, 1.05, '<path d="M-14 0 l14 7 l14 -7 l-14 -7 Z" fill="' + C.grafito + '"/><path d="M-10 0 l10 5 l10 -5 l-10 -5 Z" fill="' + C.c700 + '"/>');
    obj(22.35, 15.96, planta(22.35, 15.95, .55, 1.05));
    // La libreta del primer capítulo de «Seis décadas» (plotline.html), dejada en el mesón: la hoja con renglones, la
    // corrección en rojo, la línea trazada a mano, el timbre de diagnóstico pendiente y el clip. Aquí empieza la línea.
    obj(20.6, 16.07, enPlano(planoZ(20.12, 15.7, 1.05), '<g transform="rotate(-8 38 28)">' +
      '<rect x="0" y="0" width="76" height="56" rx="2" fill="#F4ECD8" stroke="#C9B994" stroke-width="1.4"/>' +
      '<rect x="8" y="11" width="44" height="3.2" rx="1.6" fill="#8C7D5E" opacity=".55"/><rect x="8" y="19" width="52" height="3.2" rx="1.6" fill="#8C7D5E" opacity=".55"/>' +
      '<rect x="8" y="27" width="34" height="3.2" rx="1.6" fill="#A4241A" opacity=".7"/><rect x="8" y="35" width="46" height="3.2" rx="1.6" fill="#8C7D5E" opacity=".55"/>' +
      '<path d="M8 47 C 20 47, 27 41, 39 43 S 57 47, 67 39" fill="none" stroke="#5A4A2E" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="62" cy="15" r="8.5" fill="none" stroke="#4C8C6E" stroke-width="2" opacity=".85"/><circle cx="62" cy="15" r="5" fill="none" stroke="#4C8C6E" stroke-width="1" opacity=".6"/>' +
      '<path d="M14 -5 v13 a3.2 3.2 0 0 0 6.4 0 v-11" fill="none" stroke="#A9B7C6" stroke-width="2" stroke-linecap="round"/></g>'));
    // tótem con el isotipo (sin deformar: mira de frente)
    (function () {
      var cx = 23.1, cy = 14.2;
      var s = cilindro(cx, cy, 0, 0.42, 2.7, { t: '#2A5A88', l: '#123754' });
      var p = P(cx, cy, 1.9);
      s += '<g transform="translate(' + r1(p[0] - 21) + ' ' + r1(p[1] - 30) + ') scale(.42)">' + E.isotipo + '</g>';
      s += '<text x="' + r1(p[0]) + '" y="' + r1(p[1] + 28) + '" text-anchor="middle" font-weight="700" font-size="12.5"><tspan font-family="Space Mono, monospace" fill="' + C.niebla + '" letter-spacing="-.7">Bi</tspan><tspan font-family="Space Grotesk, sans-serif" fill="' + C.cian + '">Plot</tspan></text>';
      obj(cx, cy, s);
    })();
    // sala de espera
    obj(16.4, 17.85, caja(15.2, 17.4, 0, 2.4, 0.9, 0.42, { t: C.a600, l: C.a700, r: C.a800 }) + caja(15.2, 17.4, 0.42, 2.4, 0.25, 0.55, { t: '#3F72A6', l: C.a700, r: C.a800 }) +
      caja(15.2, 17.4, 0.42, 0.22, 0.9, 0.25, { t: '#3F72A6', l: C.a700, r: C.a800 }) + caja(17.38, 17.4, 0.42, 0.22, 0.9, 0.25, { t: '#3F72A6', l: C.a700, r: C.a800 }));
    obj(16.4, 19.1, caja(15.7, 18.8, 0, 1.4, 0.6, 0.4, { t: M.mesa, l: M.mesaIzq, r: M.mesaDer }));
    obj(18.1, 19.4, planta(18.1, 19.4, 1.15));
    obj(14.6, 19.3, planta(14.6, 19.3, .95));
    obj(23.5, 12.6, planta(23.5, 12.6, 1.1));
    
    /* ── Vitrina de la recepción: tres casos para el rubro de quien visita ── */
    function contenidoVitrina(ids, titulo) {
      var D = window.OFICINA_DATOS || {}, lista = (D.proyectos || []).concat(D.casos || []);
      var s = '<rect x="0" y="0" width="206" height="64" rx="5" fill="' + C.a800 + '" stroke="' + C.cian + '" stroke-width="2"/>' + mono(10, 15, titulo || 'NUESTROS CASOS', 8, C.c300, 'letter-spacing="1.5"');
      ids.forEach(function (id, i) {
        var it = lista.filter(function (x) { return x.id === id; })[0]; if (!it) return;
        s += '<rect x="10" y="' + (22 + i * 13) + '" width="8" height="8" rx="2" fill="' + (it.acento || C.a300) + '"/>' + texto(24, 30 + i * 13, it.nombre, 10, C.niebla, 600);
      });
      return s;
    }
    (function () {
      var D = window.OFICINA_DATOS || {}, ids = (D.vitrina && D.vitrina.porDefecto) || [];
      var s = caja(16.3, 13.4, 0, 2.0, 0.7, 0.75, { t: '#2A5A88', l: '#17446F', r: '#0E2A47' });
      ids.forEach(function (id, i) {
        var x = 16.45 + i * 0.62, pr = (D.proyectos || []).filter(function (p) { return p.id === id; })[0];
        s += caja(x, 13.55, 0.75, 0.42, 0.36, 0.3, { t: '#EDF1F5', l: C.a200, r: C.a300 }) + '<polygon class="vit-' + i + '" points="' + pts([[x, 13.55, 1.051], [x + 0.42, 13.55, 1.051], [x + 0.42, 13.91, 1.051], [x, 13.91, 1.051]]) + '" fill="' + ((pr && pr.acento) || C.cian) + '"/>';
      });
      s += poly([[16.32, 14.08, 0.75], [18.28, 14.08, 0.75], [18.28, 14.08, 1.4], [16.32, 14.08, 1.4]], 'fill="rgba(127,216,207,.1)" stroke="' + M.vidrioBorde + '" stroke-width="1"') +
        poly([[18.28, 13.42, 0.75], [18.28, 14.08, 0.75], [18.28, 14.08, 1.4], [18.28, 13.42, 1.4]], 'fill="rgba(127,216,207,.07)" stroke="' + M.vidrioBorde + '" stroke-width="1"') +
        poly([[16.32, 13.42, 1.4], [18.28, 13.42, 1.4], [18.28, 14.08, 1.4], [16.32, 14.08, 1.4]], 'fill="rgba(127,216,207,.12)" stroke="' + M.marco + '" stroke-width="2"');
      s += enPlano(planoY(16.28, 13.42, 2.06), '<g class="vitrina-dinamica">' + contenidoVitrina(ids) + '</g>');
      obj(18.3, 14.1, s);
    })();


    /* ── Zonas interactivas de la planta baja ── */
    var zonas = [
      { id: 'recepcion', nombre: 'Recepción', caja: [18.0, 14.6, 24, 20, 2.6], foco: [20.8, 16.6, 1.0], zoom: 1.7 },
      { id: 'vitrina', nombre: 'La vitrina', caja: [16.2, 13.3, 18.4, 14.2, 2.4], foco: [17.3, 13.8, 1.2], zoom: 2.2 },
      { id: 'muro', nombre: 'Muro del equipo', caja: [6.6, 15.8, 15.4, 16.5, 2.0], foco: [11.0, 16.2, 1.0], zoom: 1.9 },
      { id: 'diagnostico', nombre: 'Sala de diagnóstico', caja: [0, 10.8, 5.4, 15.6, 2.2], foco: [2.7, 13.2, 0.8], zoom: 1.9 },
      { id: 'estanteria', nombre: 'Estantería del núcleo', caja: [0, 4.7, 4.6, 10.6, 2.6], foco: [1.8, 7.7, 1.2], zoom: 1.8 },
      { id: 'puerta-404', nombre: 'Puerta 404', caja: [0, 15.6, 5.4, 20, 2.3], foco: [3.2, 17.8, 1.0], zoom: 1.9 },
      { id: 'planos', nombre: 'Planos y máquinas', caja: [4, 0, 12, 4.6, 2.3], foco: [8, 2.3, 1.1], zoom: 1.8 },
      { id: 'set', nombre: 'El set', caja: [12, 0, 16, 4.6, 2.3], foco: [14, 2.3, 1.1], zoom: 2.1 },
      { id: 'laboratorio', nombre: 'Laboratorio de métricas', caja: [16, 0, 20, 4.6, 2.3], foco: [18, 2.3, 1.1], zoom: 2.1 },
      { id: 'reuniones', nombre: 'Sala de reuniones', caja: [20, 0, 24, 4.6, 2.3], foco: [22, 2.3, 1.0], zoom: 2.1 }
    ];
    function silueta(z) {
      var b = z.caja;
      z.silueta = pts([[b[0], b[1], b[4]], [b[2], b[1], b[4]], [b[2], b[1], 0], [b[2], b[3], 0], [b[0], b[3], 0], [b[0], b[3], b[4]]]);
      z.suelo = pts([[b[0], b[1], 0], [b[2], b[1], 0], [b[2], b[3], 0], [b[0], b[3], 0]]);
      return '<polygon class="zona-hit" data-zona="' + z.id + '" points="' + z.silueta + '"/>';
    }
    zonas.forEach(function (z) { z.adentro = true; hits += silueta(z); });

    /* ── El barrio: la oficina cerrada, la calle principal, la plaza y las calles por rubro (barrio.js + datos.js) ── */
    // Sus zonas se tocan en su propia capa, encima de todo: la oficina de adentro sólo se toca con la oficina abierta.
    var BR = window.Barrio ? armarBarrio(window.OFICINA_DATOS || {}, window.Barrio, opciones.medios || 'media/salas/') : null, hitsBarrio = '';
    if (BR) BR.zonas.forEach(function (z) {
      hitsBarrio += silueta(z); zonas.push(z);
      // El pasaje hasta la puerta también es la entrada a la oficina
      if (z.hq && window.Barrio.hq.entrada) { var e = window.Barrio.hq.entrada; hitsBarrio += '<polygon class="zona-hit" data-zona="oficina" points="' + pts([[e[0], e[1], e[4]], [e[2], e[1], e[4]], [e[2], e[1], 0], [e[2], e[3], 0], [e[0], e[3], 0], [e[0], e[3], e[4]]]) + '"/>'; }
    });

    /* ── Montaje del SVG ── */
    var defs = E.defs().replace('</defs>',
      '<radialGradient id="luz-piso"><stop offset="0" stop-color="#17C3B2" stop-opacity=".16"/><stop offset="1" stop-color="#17C3B2" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="halo-cian"><stop offset="0" stop-color="#17C3B2" stop-opacity=".45"/><stop offset="1" stop-color="#17C3B2" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#081A2E"/><stop offset="1" stop-color="#1A4670"/></linearGradient>' +
      '<linearGradient id="linea-dos" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#17C3B2"/><stop offset="1" stop-color="' + NARANJO + '"/></linearGradient>' +
      (BR ? BR.defs : '') + '</defs>');
    var html = defs + '<g class="piso piso-0"><g class="capa-piso">' + piso + '</g><g class="capa-muros">' + muros + '</g><g class="capa-hit">' + hits + '</g><g class="capa-obj">';
    for (var c = 0; c < BUCKETS; c++) html += '<g data-p="' + c + '">' + cubos[c] + '</g>';
    html += '</g></g>';
    // La oficina cerrada tapa el interior; el barrio va después: todo lo suyo está a la derecha (x > 24) o por delante (y > 20)
    if (BR) html += '<g class="hq-cerrada">' + BR.hq + '</g>' +
      '<g class="barrio' + (animado ? '' : ' quieto') + '"><g class="barrio-suelo">' + BR.suelo + '</g><g class="barrio-atras">' + BR.atras + '</g>' +
      '<g class="barrio-caminantes"></g><g class="barrio-frente">' + BR.frente + '</g><g class="barrio-filas">' + BR.filas + '</g></g>' +
      '<g class="capa-hit capa-hit-barrio">' + hitsBarrio + '</g>';
    html += '<g class="capa-resalte"></g>';
    svg.innerHTML = html;

    var capaObj = svg.querySelector('.capa-obj');
    if (BR) {
      // El Archivo: el edificio sube un piso cada diez casos (se deja sólo el que corresponde)
      Array.prototype.slice.call(svg.querySelectorAll('.local[data-pisos]')).forEach(function (g) { if (+g.getAttribute('data-pisos') !== BR.pisos) g.parentNode.removeChild(g); });
      // El directorio del pasaje: cada calle con sus locales abiertos
      var dir = svg.querySelector('.directorio-lista');
      if (dir) {
        var lineas = [['CALLE PRINCIPAL', BR.principal.length + ' locales']];
        BR.calles.forEach(function (c) { lineas.push([c.nombre.toUpperCase(), c.casos.length + (c.casos.length === 1 ? ' caso' : ' casos')]); });
        var yy = 46, out = '';
        lineas.slice(0, 6).forEach(function (l) {
          out += '<text x="12" y="' + yy + '" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="10" fill="' + C.niebla + '" textLength="' + Math.min(84, l[0].length * 6.4) + '" lengthAdjust="spacingAndGlyphs">' + escXml(l[0]) + '</text>' +
            '<text x="12" y="' + (yy + 12) + '" font-family="Space Mono, monospace" font-weight="700" font-size="8" fill="' + C.c300 + '">' + escXml(l[1]) + '</text>';
          yy += 26;
        });
        if (lineas.length > 6) out += '<text x="12" y="' + yy + '" font-family="Space Mono, monospace" font-weight="700" font-size="8" fill="' + C.a300 + '">y ' + (lineas.length - 6) + ' calles más</text>';
        dir.innerHTML = out;
      }
    }
    function cubo(x, y) { var k = Math.max(0, Math.min(BUCKETS - 1, Math.floor((x + y + 0.3) * 2))); return capaObj.children[k]; }

    /* ── Actores ── */
    var POS = {
      lupe: [18.2, 15.1], architect: [7.1, 1.5], celda: [10.4, 8.1], engine: [8.9, 1.5], grilla: [15.4, 8.1], bucle: [10.45, 12.05],
      tamandua: [15.4, 12.05], faro: [22.9, 10.3], pepa: [1.95, 6.3], aby: [13.8, 2.5], felipe: [13.35, 1.55], atlas: [6.3, 2.45], plotty: [20.4, 15.25]
    };
    // Hacia dónde mira cada uno al partir (true: a la derecha)
    var MIRA = { lupe: false, architect: true, celda: true, engine: false, grilla: true, bucle: true, tamandua: true, faro: false, pepa: true, aby: true, felipe: true, atlas: true, plotty: false };
    var RUTAS = {
      lupe: [[18.2, 15.1, 9], [18.0, 17.0], [6.3, 17.0], [6.3, 13.1], [4.5, 13.1, 7], [6.3, 13.1], [6.3, 17.0], [18.0, 17.0]],
      celda: [[10.4, 8.1, 12], [11.0, 6.3], [17.9, 6.3], [18.0, 3.35, 7], [17.9, 6.3], [11.0, 6.3]],
      tamandua: [[15.4, 12.05, 10], [16.0, 13.4], [11.2, 13.4, 3.5, 'toma'], [16.0, 13.4], [18.4, 11.6], [19.3, 11.55, 3.5, 'entrega'], [18.4, 11.6], [16.0, 13.4]],
      pepa: [[1.95, 6.3, 8], [2.0, 9.6], [6.6, 9.55], [10.7, 9.45, 3, 'recoge'], [6.6, 9.55], [2.0, 9.6]]
    };
    var actores = {};
    E.ids.concat(E.mascotas).forEach(function (id) {
      var g = document.createElementNS(NS, 'g'), z = (E.flota && E.flota[id]) || 0, alto = E.alto[id], sube = z * ZH / ESCALA_ACTOR;
      g.setAttribute('class', 'actor' + (z ? ' actor-flota' : ''));
      g.setAttribute('data-actor', id);
      g.innerHTML = (z ? '<ellipse class="actor-sombra" cx="0" cy="0" rx="62" ry="24" fill="#091D33" opacity=".32"/>' : '') +
        '<g class="actor-dir"><g class="actor-anda">' + (z ? '<g transform="translate(0 ' + r1(-sube) + ')">' + E.svg(id) + '</g>' : E.svg(id)) + '</g></g>' +
        '<rect class="actor-hit" x="-80" y="-' + r1(alto + sube + 10) + '" width="160" height="' + r1(alto + sube + 20) + '" rx="30"/>';
      var a = { id: id, g: g, x: POS[id][0], y: POS[id][1], z: z, ruta: RUTAS[id] || null, i: 0, espera: 0, der: true, cubo: null };
      actores[id] = a;
      ubicar(a);
      mirar(a, MIRA[id] !== false);
    });
    function ubicar(a) {
      var p = P(a.x, a.y, 0);
      a.g.setAttribute('transform', 'translate(' + r1(p[0]) + ' ' + r1(p[1]) + ') scale(' + ESCALA_ACTOR + ')');
      var k = cubo(a.x, a.y);
      if (k !== a.cubo) { k.appendChild(a.g); a.cubo = k; }
    }
    function mirar(a, der) { if (a.der === der) return; a.der = der; a.g.querySelector('.actor-dir').setAttribute('transform', der ? '' : 'scale(-1 1)'); }

    /* ── La gente que camina por la vereda de la calle principal (entre los locales y los faroles) ── */
    var caminantes = [];
    if (BR) {
      var capaCam = svg.querySelector('.barrio-caminantes'), GB = window.Barrio.geo, lista = window.Barrio.caminantes;
      lista.forEach(function (id, i) {
        var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'caminante');
        var w = { id: id, g: g, x: 4 + i * 13.5, y: GB.banda[0] + 0.2 + i * (GB.banda[1] - GB.banda[0] - 0.4) / Math.max(1, lista.length - 1), der: i % 2 === 0, vel: 0.55 + i * 0.14, espera: 1 + i * 2 };
        capaCam.appendChild(g); caminantes.push(w); vestir(w); ponerCaminante(w);
      });
    }
    function vestir(w) { w.g.innerHTML = '<g class="caminante-anda">' + window.Barrio.personas[w.id][w.der ? 'd' : 'i'] + '</g>'; }
    function ponerCaminante(w) { var p = P(w.x, w.y, 0); w.g.setAttribute('transform', 'translate(' + r1(p[0]) + ' ' + r1(p[1]) + ')'); }
    // Caminan de punta a punta; de vez en cuando se detienen a mirar una vitrina
    function andar(w, dt) {
      if (w.espera > 0) { w.espera -= dt; if (w.espera <= 0) w.g.classList.add('camina'); return; }
      w.x += (w.der ? 1 : -1) * w.vel * dt;
      var x1 = window.Barrio.geo.x1 - 0.8;
      if (w.x > x1 || w.x < 0.8) { w.x = Math.max(0.8, Math.min(x1, w.x)); w.der = !w.der; vestir(w); }
      else if (Math.random() < dt / 14) { w.espera = 1.5 + Math.random() * 2.5; w.g.classList.remove('camina'); }
      w.g.classList.add('camina');
      if (w.espera > 0) w.g.classList.remove('camina');
      ponerCaminante(w);
    }

    /* ── Animación: recorridos ── */
    var VEL = 1.25, corriendo = false, ultimo = 0, raf = 0;
    var eventos = { toma: function () {}, entrega: lanzar, recoge: function () {} };
    function lanzar() {
      var pq = svg.querySelector('#paquete'); if (!pq) return;
      pq.classList.remove('sube'); void pq.getBBox(); pq.classList.add('sube');
      var luz = actores.faro.g; luz.classList.add('destello'); setTimeout(function () { luz.classList.remove('destello'); }, 1600);
    }
    function paso(t) {
      if (!corriendo) return;
      var dt = Math.min(0.05, (t - (ultimo || t)) / 1000); ultimo = t;
      caminantes.forEach(function (w) { andar(w, dt); });
      // El equipo sólo se mueve con la oficina abierta (cerrada no se ve: no se dibuja)
      if (abierta) Object.keys(actores).forEach(function (id) {
        var a = actores[id]; if (!a.ruta) return;
        if (a.espera > 0) { a.espera -= dt; if (a.espera <= 0) a.g.classList.remove('parado'); return; }
        var sig = a.ruta[(a.i + 1) % a.ruta.length], dx = sig[0] - a.x, dy = sig[1] - a.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.02) {
          a.i = (a.i + 1) % a.ruta.length; a.x = sig[0]; a.y = sig[1];
          if (sig[2]) { a.espera = sig[2]; a.g.classList.remove('camina'); a.g.classList.add('parado'); if (sig[3] && eventos[sig[3]]) eventos[sig[3]](a); }
          ubicar(a); return;
        }
        var d = Math.min(dist, VEL * dt);
        a.x += dx / dist * d; a.y += dy / dist * d;
        mirar(a, (dx - dy) >= 0);
        a.g.classList.add('camina');
        ubicar(a);
      });
      raf = requestAnimationFrame(paso);
    }
    function iniciar() { if (corriendo) return; corriendo = true; ultimo = 0; raf = requestAnimationFrame(paso); }
    function detener() {
      corriendo = false; cancelAnimationFrame(raf);
      Object.keys(actores).forEach(function (id) { actores[id].g.classList.remove('camina'); });
      caminantes.forEach(function (w) { w.g.classList.remove('camina'); });
    }
    // Ruta: cada actor parte en su primer punto con su espera
    Object.keys(actores).forEach(function (id) { var a = actores[id]; if (a.ruta) a.espera = (a.ruta[0][2] || 0) * (0.3 + Math.random() * 0.5); });
    var lanzador = setInterval(function () { if (corriendo && abierta) lanzar(); }, 14000);

    // Reloj con la hora de Chile
    function reloj() {
      var h = 10, m = 10;
      try {
        var partes = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
        partes.forEach(function (p) { if (p.type === 'hour') h = +p.value; if (p.type === 'minute') m = +p.value; });
      } catch (e) { /* sin Intl: queda en 10:10 */ }
      var hh = svg.querySelector('#reloj-horas'), mm = svg.querySelector('#reloj-min');
      if (hh) hh.setAttribute('transform', 'rotate(' + ((h % 12) * 30 + m / 2) + ' 60 42)');
      if (mm) mm.setAttribute('transform', 'rotate(' + (m * 6) + ' 60 42)');
    }
    reloj(); var relojInt = setInterval(reloj, 30000);

    // Límites de la vista: la oficina y, si está, el barrio completo
    var limites = { x0: -680, y0: -150, x1: 800, y1: 735 };
    if (BR) limites = { x0: Math.min(limites.x0, BR.caja.x0), y0: Math.min(limites.y0, BR.caja.y0), x1: Math.max(limites.x1, BR.caja.x1), y1: Math.max(limites.y1, BR.caja.y1) };
    svg.setAttribute('viewBox', [limites.x0, limites.y0, limites.x1 - limites.x0, limites.y1 - limites.y0].join(' '));

    // La oficina se ve cerrada desde la calle y se abre al entrar: el techo se desvanece, el barrio queda en penumbra y el
    // interior (el equipo, las salas) recién ahí se dibuja y se anima. Sin barrio, la oficina queda siempre abierta.
    var piso0 = svg.querySelector('.piso-0'), hqG = svg.querySelector('.hq-cerrada'), barrioG = svg.querySelector('.barrio'), hitsB = svg.querySelector('.capa-hit-barrio');
    var abierta = !BR, cierre = 0, DUR = animado ? 550 : 0;
    [hqG, barrioG].forEach(function (g) { if (g && DUR) g.style.transition = 'opacity ' + DUR + 'ms ease'; });
    // o.penumbra === false: la calle no se oscurece (el kit muestra la oficina abierta con su barrio)
    function oficina(abrir, animar, o) {
      if (!BR) return true;
      abrir = !!abrir; o = o || {};
      var dur = animar === false ? 0 : DUR;
      clearTimeout(cierre);
      if (abrir) {
        piso0.style.display = '';
        if (dur) void piso0.getBoundingClientRect();
        hqG.style.opacity = '0'; hqG.style.pointerEvents = 'none'; barrioG.style.opacity = o.penumbra === false ? '' : '.12'; hitsB.style.display = 'none';
        svg.classList.add('oficina-abierta');
        if (!dur) hqG.style.visibility = 'hidden'; else cierre = setTimeout(function () { hqG.style.visibility = 'hidden'; }, dur);
      } else {
        hqG.style.visibility = ''; hqG.style.pointerEvents = '';
        if (dur) void hqG.getBoundingClientRect();
        hqG.style.opacity = '1'; barrioG.style.opacity = ''; hitsB.style.display = '';
        svg.classList.remove('oficina-abierta');
        var ocultar = function () { piso0.style.display = 'none'; Object.keys(actores).forEach(function (id) { actores[id].g.classList.remove('camina'); }); };
        if (!dur) ocultar(); else cierre = setTimeout(ocultar, dur);
      }
      abierta = abrir;
      return abierta;
    }
    if (BR) oficina(false, false);

    // Un local de la calle se abre al tocarlo: el local cerrado (con su techo) se desvanece y en su lugar se ve por dentro,
    // con su gente (M: el local por dentro, de locales.js; o.pintar cambia las marcas §…§ de cada caso). Queda en el mismo
    // lugar del dibujo que el local cerrado, así la vereda lo sigue tapando como corresponde; el vecino de la derecha, que
    // queda por delante y taparía la mitad de adentro, se vuelve transparente mientras tanto.
    var abiertoL = null, medios = opciones.medios || 'media/salas/';
    function localCerrado(id) {
      var ls = svg.querySelectorAll('.barrio .local[data-local]');
      for (var i = 0; i < ls.length; i++) if (ls[i].getAttribute('data-local') === id) return ls[i];
      return null;
    }
    function abrirLocal(id, M, o) {
      o = o || {};
      if (abiertoL && abiertoL.id === id) return abiertoL.viva;
      cerrarLocal();
      var cerr = localCerrado(id), z = zonas.filter(function (zn) { return zn.id === id && zn.barrio; })[0];
      if (!cerr || !z || !M) return null;
      var p = P(z.caja[0], z.caja[1], 0), g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'local-abierto'); g.setAttribute('data-abierto', id);
      g.setAttribute('transform', 'translate(' + r1(p[0]) + ' ' + r1(p[1]) + ')');
      cerr.parentNode.insertBefore(g, cerr.nextSibling);
      var n = BR.total, pintura = function (s) {
        return (o.pintar ? o.pintar(s) : s).replace(/§CASOS§/g, n + (n === 1 ? ' caso' : ' casos')).replace(/§M§/g, medios);
      };
      var viva = maqueta(g, M, { pintar: pintura }), dur = o.animar === false ? 0 : DUR;
      var zv = zonas.filter(function (zn) { return zn.barrio && zn.caja[1] === z.caja[1] && zn.caja[0] > z.caja[0] && zn.caja[0] - z.caja[0] < 5; })[0], vecino = zv && localCerrado(zv.id);
      if (dur) {
        g.style.opacity = '0'; g.style.transition = cerr.style.transition = 'opacity ' + dur + 'ms ease';
        if (vecino) vecino.style.transition = 'opacity ' + dur + 'ms ease';
        void g.getBoundingClientRect();
      }
      g.style.opacity = ''; cerr.style.opacity = '0'; if (vecino) vecino.style.opacity = '.18';
      abiertoL = { id: id, g: g, cerr: cerr, vecino: vecino, viva: viva, t: setTimeout(function () { cerr.style.visibility = 'hidden'; }, dur) };
      if (o.mover) viva.mover(true);
      return viva;
    }
    // Vuelve el techo: el local cerrado aparece y lo de adentro se desvanece y se desmonta
    function cerrarLocal(animar) {
      var a = abiertoL; if (!a) return;
      abiertoL = null; clearTimeout(a.t); a.viva.mover(false);
      var dur = animar === false ? 0 : DUR;
      a.cerr.style.visibility = '';
      if (dur) void a.cerr.getBoundingClientRect();
      a.cerr.style.opacity = ''; a.g.style.opacity = '0'; if (a.vecino) a.vecino.style.opacity = '';
      var quitar = function () { a.viva.destruir(); if (a.g.parentNode) a.g.parentNode.removeChild(a.g); };
      if (dur) setTimeout(quitar, dur); else quitar();
    }
    // La vitrina muestra otros tres casos (los que elige Plotty según el rubro)
    function cambiarVitrina(ids, titulo) {
      var D = window.OFICINA_DATOS || {}, lista = (D.proyectos || []).concat(D.casos || []);
      var g = svg.querySelector('.vitrina-dinamica'); if (g) g.innerHTML = contenidoVitrina(ids, titulo);
      ids.forEach(function (id, i) {
        var it = lista.filter(function (x) { return x.id === id; })[0], pg = svg.querySelector('.vit-' + i);
        if (pg) pg.setAttribute('fill', (it && it.acento) || C.cian);
      });
    }

    return {
      zonas: zonas, actores: actores, limites: limites, P: P, iniciar: iniciar, detener: detener, lanzar: lanzar, vitrina: cambiarVitrina,
      barrio: BR ? { calles: BR.calles, principal: BR.principal, total: BR.total } : null, caminantes: caminantes,
      oficina: oficina, abierta: function () { return abierta; },
      abrirLocal: abrirLocal, cerrarLocal: cerrarLocal, local: function () { return abiertoL ? abiertoL.id : null; },
      moverLocal: function (si) { if (abiertoL) abiertoL.viva.mover(si); },
      destruir: function () { detener(); cerrarLocal(false); clearInterval(lanzador); clearInterval(relojInt); },
      corriendo: function () { return corriendo; }
    };
  }

  function hexA(hex, a) { var c = hex2rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  window.Escena = { construir: construir, P: P, ESCALA_ACTOR: ESCALA_ACTOR, pintar: pintar, maqueta: maqueta, maquetaSvg: maquetaSvg, juntar: juntar };
})();
