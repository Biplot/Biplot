/*
 * Oficina BiPlot · la vitrina en 3D (El Archivo)
 * Hace girar una vitrina grabada al generar los dibujos (_herramientas/dibujos/barrio/salas-propias/vitrina3d.mjs): su
 * pedestal, su vidrio y la pieza del centro. En cada cuadro rota el modelo sobre su eje, lo proyecta como la sala (la
 * misma isométrica: al abrirse se ve igual que en la sala), ordena sus caras de atrás hacia adelante y sombrea cada una
 * según hacia dónde mira: clara hacia la luz (la cara de la izquierda en la sala), en su tono de perfil y más oscura de
 * espaldas. Lo dibujado sobre un plano (la hoja de la libreta, una pantalla) gira con él y, de espaldas, muestra su
 * revés. Gira sola; con «reducir movimiento» o la oficina en pausa queda quieta, y siempre se puede girar a mano.
 *
 * Vitrina3D.montar(svg, modelo, { quieta, medios }) → { girar(delta), pausar(si), pausada(), detener() }
 */
(function () {
  'use strict';
  var TW = 32, TH = 16, ZH = 39, VZ = 2 * TH / ZH;   // se mira desde (1, 1, VZ): lo de mayor x + y + VZ·z va adelante
  var NS = 'http://www.w3.org/2000/svg', VUELTA = 20;   // segundos por vuelta
  var OSCURO = [6, 21, 37], BLANCO = [255, 255, 255];

  function rgb(c) { var m = /^#([0-9a-f]{6})$/i.exec(c || ''); if (!m) return null; var n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mezcla(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]; }
  function css(p) { return 'rgb(' + Math.round(p[0]) + ',' + Math.round(p[1]) + ',' + Math.round(p[2]) + ')'; }
  // Una cara de costado, según a (cuánto mira hacia la luz, +y): clara hacia la luz, su tono de perfil, oscura de espaldas
  function tono(l, r, a) { return a >= 0 ? mezcla(r, l, a) : mezcla(r, OSCURO, -a * 0.3); }
  function nuevo(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function cruz(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
  function unidad(v) { var n = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / n, v[1] / n, v[2] / n]; }
  function suma(a, b, t) { return [a[0] + b[0] * t, a[1] + b[1] * t, a[2] + b[2] * t]; }

  // Las piezas del modelo, como caras, planos con su dibujo, líneas y figuras
  function armar(M) {
    var caras = [];
    var lisas = [];
    function cara(pts, n, color, lisa) { var c = { tipo: 'cara', pts: pts, n: n, color: color }; caras.push(c); if (lisa) lisas.push(c); }
    (M.cajas || []).forEach(function (c) {
      var x = c[0], y = c[1], z = c[2], w = c[3], d = c[4], h = c[5], t = rgb(c[6]) || [200, 200, 200];
      var l = rgb(c[7]) || mezcla(t, OSCURO, 0.22), r = rgb(c[8]) || mezcla(t, OSCURO, 0.42), lado = { l: l, r: r };
      var z1 = z + h, X = x + w, Y = y + d;
      cara([[x, y, z1], [X, y, z1], [X, Y, z1], [x, Y, z1]], [0, 0, 1], t, true);
      cara([[x, Y, z], [X, Y, z], [X, Y, z1], [x, Y, z1]], [0, 1, 0], lado, true);
      cara([[x, y, z], [X, y, z], [X, y, z1], [x, y, z1]], [0, -1, 0], lado, true);
      cara([[X, y, z], [X, Y, z], [X, Y, z1], [X, y, z1]], [1, 0, 0], lado, true);
      cara([[x, y, z], [x, Y, z], [x, Y, z1], [x, y, z1]], [-1, 0, 0], lado, true);
    });
    (M.cils || []).forEach(function (c) {
      var x = c[0], y = c[1], z = c[2], r = c[3], h = c[4], arriba = rgb(c[5]) || [230, 230, 230], ld = rgb(c[6]) || arriba;
      var lado = { l: mezcla(ld, BLANCO, 0.14), r: ld }, N = 20, tapa = [];
      for (var i = 0; i < N; i++) {
        var a0 = i / N * 2 * Math.PI, a1 = (i + 1) / N * 2 * Math.PI, am = (a0 + a1) / 2;
        var p0 = [x + r * Math.cos(a0), y + r * Math.sin(a0)], p1 = [x + r * Math.cos(a1), y + r * Math.sin(a1)];
        cara([[p0[0], p0[1], z], [p1[0], p1[1], z], [p1[0], p1[1], z + h], [p0[0], p0[1], z + h]], [Math.cos(am), Math.sin(am), 0], lado);
        tapa.push([p0[0], p0[1], z + h]);
      }
      cara(tapa, [0, 0, 1], arriba);
    });
    (M.polys || []).forEach(function (q) {
      caras.push({ tipo: 'vidrio', pts: q.pts, attr: q.attr });
    });
    (M.planos || []).forEach(function (p) {
      var c = { tipo: 'plano', o: p.o, u: p.u, v: p.v, a: p.a, h: p.h, svg: p.svg, dorso: p.dorso, piso: p.suelo && p.o[2] < 0.05, n: unidad(cruz(p.u, p.v)) };
      c.padre = sobre(c, lisas);
      caras.push(c);
    });
    (M.lineas || []).forEach(function (l) { caras.push({ tipo: 'linea', pts: l.p, c: l.c, w: l.w }); });
    (M.figuras || []).forEach(function (f) { caras.push({ tipo: 'figura', o: f.o, h: f.h, ax: f.ax, ay: f.ay, svg: f.svg }); });
    return caras;
  }

  // Lo dibujado sobre una cara (la cédula, la pantalla de un monitor, las ventanas de la casa) va siempre justo después de
  // esa cara: la misma orientación, a menos de dos centésimas de ella y dentro de sus bordes
  function sobre(p, lisas) {
    var esq = [p.o, suma(p.o, p.u, 1), suma(p.o, p.v, 1), suma(suma(p.o, p.u, 1), p.v, 1)];
    for (var i = 0; i < lisas.length; i++) {
      var f = lisas[i], n = f.n, q = f.pts[0];
      if (n[0] * p.n[0] + n[1] * p.n[1] + n[2] * p.n[2] < 0.98) continue;
      if (Math.abs((p.o[0] - q[0]) * n[0] + (p.o[1] - q[1]) * n[1] + (p.o[2] - q[2]) * n[2]) > 0.02) continue;
      var dentro = esq.every(function (e) {
        return [0, 1, 2].every(function (k) { var vs = f.pts.map(function (r) { return r[k]; }); return e[k] >= Math.min.apply(null, vs) - 0.02 && e[k] <= Math.max.apply(null, vs) + 0.02; });
      });
      if (dentro) return f;
    }
    return null;
  }

  function montar(svg, M, o) {
    o = o || {};
    var medios = o.medios || function (s) { return s; };
    var caras = armar(M);
    // La sombra en el piso (no gira) y lo que traen los dibujos (sus degradados)
    svg.appendChild(nuevo('defs', {})).innerHTML = (M.defs || '') +
      '<radialGradient id="v3d-sombra"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".7" stop-color="#000" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>';
    svg.appendChild(nuevo('ellipse', { cx: 0, cy: 3, rx: 46, ry: 23, fill: 'url(#v3d-sombra)' }));
    var capa = svg.appendChild(nuevo('g', { class: 'v3d-capa' }));
    caras.forEach(function (c) {
      // (cada cara lleva un filo de su mismo color, para que no se vean rendijas entre caras vecinas)
      if (c.tipo === 'cara') c.el = nuevo('polygon', { 'stroke-width': '.35', 'stroke-linejoin': 'round' });
      else if (c.tipo === 'vidrio') {
        c.el = nuevo('polygon', {});
        (c.attr.match(/[\w-]+="[^"]*"/g) || []).forEach(function (kv) { var i = kv.indexOf('='); c.el.setAttribute(kv.slice(0, i), kv.slice(i + 2, -1)); });
        if (c.el.getAttribute('stroke')) { c.el.setAttribute('vector-effect', 'non-scaling-stroke'); c.el.setAttribute('stroke-width', '1.2'); }
      } else if (c.tipo === 'plano') {
        c.el = nuevo('g', {});
        c.cara = c.el.appendChild(nuevo('g', {})); c.cara.innerHTML = medios(c.svg);
        if (c.dorso) c.reves = c.el.appendChild(nuevo('polygon', { fill: c.dorso, stroke: c.dorso, 'stroke-width': '.35' }));
      } else if (c.tipo === 'linea') c.el = nuevo('path', { fill: 'none', stroke: c.c, 'stroke-width': c.w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      else { c.el = nuevo('g', {}); c.el.innerHTML = medios(c.svg); }
      capa.appendChild(c.el);
    });

    var th = o.angulo || 0, dibujado = null, orden = [];
    function dibujar() {
      if (th === dibujado) return;
      dibujado = th;
      var co = Math.cos(th), si = Math.sin(th);
      function rot(p) { return [p[0] * co - p[1] * si, p[0] * si + p[1] * co, p[2]]; }
      function pr(p) { return [(p[0] - p[1]) * TW, (p[0] + p[1]) * TH - p[2] * ZH]; }
      function prof(p) { return p[0] + p[1] + VZ * p[2]; }
      function puntos(ps) { return ps.map(function (p) { var q = pr(p); return q[0].toFixed(2) + ',' + q[1].toFixed(2); }).join(' '); }
      function medio(ps) { var d = 0; ps.forEach(function (p) { d += prof(p); }); return d / ps.length; }
      var vis = [];
      caras.forEach(function (c) {
        var ps, n, d;
        if (c.tipo === 'cara') {
          n = rot(c.n);
          if (n[0] + n[1] + VZ * n[2] <= 0.001) { c.el.style.display = 'none'; c.vis = false; return; }
          ps = c.pts.map(rot);
          var col = c.color.l ? css(tono(c.color.l, c.color.r, n[1])) : css(c.color);
          c.el.setAttribute('points', puntos(ps)); c.el.setAttribute('fill', col); c.el.setAttribute('stroke', col);
          d = c.d = medio(ps); c.vis = true;
        } else if (c.tipo === 'vidrio') {
          ps = c.pts.map(rot); c.el.setAttribute('points', puntos(ps)); d = medio(ps);
        } else if (c.tipo === 'plano') {
          var o0 = rot(c.o), u = rot(c.u), v = rot(c.v), nn = rot(c.n), frente = nn[0] + nn[1] + VZ * nn[2] > 0.001;
          ps = [o0, suma(o0, u, 1), suma(suma(o0, u, 1), v, 1), suma(o0, v, 1)];
          if (frente || c.piso) {
            var p0 = pr(o0), pu = pr(suma(o0, u, 1)), pv = pr(suma(o0, v, 1));
            c.cara.setAttribute('transform', 'matrix(' + [(pu[0] - p0[0]) / c.a, (pu[1] - p0[1]) / c.a, (pv[0] - p0[0]) / c.h, (pv[1] - p0[1]) / c.h, p0[0], p0[1]].map(function (x) { return x.toFixed(4); }).join(',') + ')');
            c.cara.style.display = '';
            if (c.reves) c.reves.style.display = 'none';
          } else if (c.reves) {
            c.cara.style.display = 'none'; c.reves.style.display = ''; c.reves.setAttribute('points', puntos(ps));
          } else { c.el.style.display = 'none'; return; }
          // (el piso va siempre al fondo; lo que está sobre una cara, justo después de ella)
          d = c.piso ? -99 : c.padre && c.padre.vis ? c.padre.d + 0.0005 : medio(ps) + 0.002;
        } else if (c.tipo === 'linea') {
          ps = c.pts.map(rot);
          c.el.setAttribute('d', ps.map(function (p, i) { var q = pr(p); return (i ? 'L' : 'M') + q[0].toFixed(2) + ' ' + q[1].toFixed(2); }).join(''));
          d = medio(ps) + 0.001;
        } else {
          // La figura va siempre de frente: al darse vuelta se ve de espaldas (espejada), con un giro breve de perfil
          var pie = rot(c.o), q = pr(pie), s = c.h * ZH / c.ay, g = Math.cos(th), e = (g < 0 ? -1 : 1) * Math.pow(Math.abs(g), 0.3);
          c.el.setAttribute('transform', 'translate(' + q[0].toFixed(2) + ' ' + q[1].toFixed(2) + ') scale(' + (s * e).toFixed(4) + ' ' + s.toFixed(4) + ') translate(' + (-c.ax) + ' ' + (-c.ay) + ')');
          d = prof(pie) + 0.05;
        }
        c.el.style.display = '';
        vis.push([d, c.el]);
      });
      vis.sort(function (a, b) { return a[0] - b[0]; });
      var nuevoOrden = vis.map(function (x) { return x[1]; }), cambia = nuevoOrden.length !== orden.length;
      for (var i = 0; !cambia && i < orden.length; i++) if (orden[i] !== nuevoOrden[i]) cambia = true;
      if (cambia) { nuevoOrden.forEach(function (el) { capa.appendChild(el); }); orden = nuevoOrden; }
    }

    // Gira sola (una vuelta cada VUELTA segundos); a mano, arrastrando o con girar(); pausa aparte
    var gira = !o.quieta, ultimo = 0, raf = 0, arrastre = null, reanudar = 0, vivo = true;
    function cuadro(t) {
      if (!vivo) return;
      raf = requestAnimationFrame(cuadro);
      if (ultimo && gira && !arrastre && t > reanudar) th -= 2 * Math.PI / VUELTA * Math.min(0.05, (t - ultimo) / 1000);
      ultimo = t;
      dibujar();
    }
    dibujar();
    raf = requestAnimationFrame(cuadro);
    svg.addEventListener('pointerdown', function (e) {
      arrastre = { x: e.clientX, th: th, id: e.pointerId };
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      svg.classList.add('arrastrando');
    });
    function soltar(e) { if (!arrastre || e.pointerId !== arrastre.id) return; arrastre = null; reanudar = performance.now() + 1500; svg.classList.remove('arrastrando'); }
    svg.addEventListener('pointermove', function (e) { if (arrastre && e.pointerId === arrastre.id) th = arrastre.th - (e.clientX - arrastre.x) * 0.012; });
    svg.addEventListener('pointerup', soltar);
    svg.addEventListener('pointercancel', soltar);
    return {
      girar: function (delta) { th -= delta; reanudar = performance.now() + 1500; },
      pausar: function (si) { gira = !si; },
      pausada: function () { return !gira; },
      angulo: function () { return th; },
      detener: function () { vivo = false; cancelAnimationFrame(raf); }
    };
  }

  window.Vitrina3D = { montar: montar };
})();
