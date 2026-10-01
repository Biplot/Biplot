/*
 * Oficina BiPlot · interfaz
 * Cámara (arrastrar, rueda, pellizco, teclado), menú «Recorre la oficina» con el barrio y su buscador, recorrido guiado,
 * paneles, la oficina que se abre al entrar, la vista previa de cada local y la sala de cada empresa (salas.js, se carga
 * con el primer local), El Archivo, el chat de Plotty y los enlaces directos.
 * Todo lo que se puede hacer con el mouse en la escena también se puede hacer desde el menú con teclado.
 */
(function () {
  'use strict';

  var D = window.OFICINA_DATOS, E = window.Elenco;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var PERSONAL = {}; D.personal.concat(D.mascotas).forEach(function (p) { PERSONAL[p.id] = p; });
  var PROYECTOS = {}; D.proyectos.forEach(function (p) { PROYECTOS[p.id] = p; });
  var CASOS = {}; D.casos.forEach(function (c) { CASOS[c.id] = c; });
  var SALAS = D.salas;
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MEDIOS = 'media/salas/';

  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function guardar(k, v) { try { localStorage.setItem('oficina-' + k, v); } catch (e) { /* sin almacenamiento */ } }
  function leer(k) { try { return localStorage.getItem('oficina-' + k); } catch (e) { return null; } }
  function quieta() { return document.documentElement.classList.contains('oficina-quieta'); }
  // Para buscar sin importar tildes ni mayúsculas
  function normal(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /* ── Escena ── */
  var escenaEl = $('#escena'), svg = $('#svg-escena');
  var esc3 = window.Escena.construir(svg, { animado: !reducido });
  var raiz = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  raiz.id = 'escena-raiz';
  // Mueve todo lo dibujado a un grupo con id, para reutilizarlo en las vistas de los paneles con <use>.
  Array.prototype.slice.call(svg.childNodes).forEach(function (n) {
    if (n.nodeName === 'defs' || n.nodeName === 'title' || n.nodeName === 'desc') return;
    raiz.appendChild(n);
  });
  svg.appendChild(raiz);
  var L = esc3.limites, P = esc3.P, BARRIO = esc3.barrio;
  var capaResalte = svg.querySelector('.capa-resalte');

  /* ── El barrio: qué hay en cada calle ── */
  // En la calle principal están los proyectos con sala dibujada a mano (salas.js), el local libre y El Archivo.
  var ORDEN_PRINCIPAL = BARRIO ? BARRIO.principal.slice() : [];
  if (ORDEN_PRINCIPAL.indexOf('eleven') > -1) ORDEN_PRINCIPAL.splice(ORDEN_PRINCIPAL.indexOf('eleven') + 1, 0, 'pasaje');
  var CON_SALA = ORDEN_PRINCIPAL.filter(function (id) { return PROYECTOS[id] && !PROYECTOS[id].libre; });
  function tieneSala(id) { return CON_SALA.indexOf(id) > -1; }
  // El Archivo también tiene su sala propia: el museo de BiPlot (salas.archivo.salaPropia en datos.js). Se entra como a la
  // sala de un proyecto, pero no es un caso (no está en las listas de casos); entre las salas vecinas va al final.
  var MUSEO = SALAS.archivo && SALAS.archivo.salaPropia && ORDEN_PRINCIPAL.indexOf('archivo') > -1 ? { id: 'archivo', nombre: SALAS.archivo.nombre, cliente: SALAS.archivo.nombre,
    rubro: SALAS.archivo.sub, esencia: SALAS.archivo.esencia, salaPropia: SALAS.archivo.salaPropia, pines: [], puntos: [], enlaces: [], equipo: ['pepa'] } : null;
  function esMuseo(id) { return id === 'archivo' && !!MUSEO; }
  // BiPlot.TV, el canal de BiPlot (salas.tv.salaPropia en datos.js), en la plaza: todos los videos de BiPlot. No es un
  // local ni un caso: se toca como un lugar y se entra como a una sala; entre las salas vecinas va al final, después del museo.
  var CANAL = SALAS.tv && SALAS.tv.salaPropia && zonaPorId('tv') ? { id: 'tv', nombre: SALAS.tv.nombre, cliente: SALAS.tv.nombre,
    rubro: SALAS.tv.sub, esencia: SALAS.tv.esencia, salaPropia: SALAS.tv.salaPropia, pines: [], puntos: [], enlaces: [], equipo: ['aby', 'felipe'] } : null;
  function esCanal(id) { return id === 'tv' && !!CANAL; }
  function salaDe(id) { return esMuseo(id) ? MUSEO : esCanal(id) ? CANAL : PROYECTOS[id]; }
  // El local libre de la calle principal también tiene la suya: la sala de ventas de BiPlot (proyectos.libre.salaPropia
  // en datos.js). Tampoco es un caso; entre las salas vecinas va en su lugar de la calle, antes del museo.
  var VENTAS = !!(PROYECTOS.libre && PROYECTOS.libre.salaPropia && ORDEN_PRINCIPAL.indexOf('libre') > -1);
  function esVentas(id) { return id === 'libre' && VENTAS; }
  // Cómo se llama cada sala para quien no la ve
  function nombreSala(id) {
    var pr = salaDe(id);
    return esMuseo(id) ? pr.nombre + ', el museo de BiPlot' : esVentas(id) ? pr.nombre + ', la sala de ventas de BiPlot' : esCanal(id) ? pr.nombre + ', el canal de BiPlot' : 'La sala de ' + pr.nombre;
  }
  var VECINAS = CON_SALA.concat(VENTAS ? ['libre'] : [], MUSEO ? ['archivo'] : [], CANAL ? ['tv'] : []);
  var FASE_LOCAL = ['arriendo', 'diagnostico', 'obra', 'obra', 'obra', 'obra', 'obra', 'inauguracion', 'abierto', 'abierto'];
  function estadoDe(pr) {
    if (!pr || pr.libre) return 'libre';
    if (tieneSala(pr.id)) return 'abierto';
    var n = parseInt(String(pr.fase || 'E9').replace(/\D/g, ''), 10);
    return FASE_LOCAL[isNaN(n) ? 9 : Math.max(0, Math.min(9, n))];
  }
  var ESTADO_TXT = { arriendo: 'Se arrienda', diagnostico: 'En diagnóstico', obra: 'En obra', inauguracion: 'Inauguración', abierto: 'Abierto', libre: 'Disponible' };
  function faseDe(pr) { var f = String(pr.fase || ''); return D.fases.filter(function (x) { return x.id === f; })[0]; }
  // Nombre público de un caso: el suyo, o sólo su rubro si el cliente no se nombra
  function nombreCaso(pr) { return pr.permiso === 'rubro' ? String(pr.rubro || '').split(' · ').join(', ') : pr.nombre; }
  function chipCaso(pr) { return pr.corto || ESTADO_TXT[estadoDe(pr)]; }
  function calleDe(id) {
    if (ORDEN_PRINCIPAL.indexOf(id) > -1) return 'Calle principal';
    if (/^libre-/.test(id)) { var c = calleId(id.slice(6)); return c ? c.nombre : ''; }
    var z = zonaPorId(id); if (z && z.calle && z.calle !== 'principal') { var k = calleId(z.calle); return k ? k.nombre : ''; }
    return '';
  }
  function calleId(id) { return BARRIO ? BARRIO.calles.filter(function (c) { return c.id === id; })[0] : null; }
  function rubroTxt(id) { var o = D.plotty.preguntas[0].opciones.filter(function (x) { return x[0] === id; })[0]; return o ? o[1] : ''; }
  // Los casos de un rubro (los de la calle principal y los de su calle), para Plotty y El Archivo
  function casosDelRubro(rubro) { return D.proyectos.filter(function (p) { return !p.libre && p.calle === rubro && p.permiso !== 'archivo'; }); }

  /* ── Sprites de avatares (quietos): la cabeza y el torso de cada uno; las mascotas, enteras ── */
  var sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sprite.setAttribute('class', 'sprite-quieto'); sprite.setAttribute('aria-hidden', 'true');
  sprite.innerHTML = E.defs() + E.ids.concat(E.mascotas).map(function (id) {
    var a = E.alto[id], w = E.ancho[id], masc = E.mascotas.indexOf(id) > -1;
    var vb = masc ? [-w / 2 - 8, -a - 8 - (w - a) / 2 * (w > a ? 1 : 0), w + 16, Math.max(w, a) + 16] : [-66, -a - 4, 132, 132];
    return '<symbol id="av-' + id + '" viewBox="' + vb.map(Math.round).join(' ') + '">' + E.svg(id).replace('class="pj ', 'class="pj pj-retrato ') + '</symbol>';
  }).join('');
  document.body.appendChild(sprite);
  function avatar(id, clase) { return '<svg class="avatar ' + (clase || '') + '" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><use href="#av-' + id + '" width="100" height="100"/></svg>'; }

  /* ── Cámara ── */
  var cam = { x: (L.x0 + L.x1) / 2, y: (L.y0 + L.y1) / 2, z: 1 }, vuelo = null;
  function rect() { return svg.getBoundingClientRect(); }
  function margenes() {
    var r = rect(), m = { izq: 0, der: 0, arr: 0, aba: 0 };
    var nav = $('#recorrer'), panel = $('#panel');
    var ancho = window.innerWidth >= 900;
    if (ancho && nav && !nav.classList.contains('cerrado')) m.izq = nav.getBoundingClientRect().right - r.left + 8;
    if (panel && !panel.hidden) {
      var pr = panel.getBoundingClientRect();
      if (ancho) m.der = r.right - pr.left + 8; else m.aba = r.bottom - pr.top;
    }
    var guia = $('#guia'); if (guia && !guia.hidden && !m.aba) m.aba = r.bottom - guia.getBoundingClientRect().top + 8;
    var intro = $('#intro'); if (intro && !intro.hidden && !m.aba && window.innerWidth < 900) m.aba = r.bottom - intro.getBoundingClientRect().top + 8;
    return m;
  }
  function zAjuste() {
    var r = rect(), m = margenes();
    var w = Math.max(200, r.width - m.izq - m.der), h = Math.max(200, r.height - m.arr - m.aba);
    return Math.min(w / (L.x1 - L.x0), h / (L.y1 - L.y0));
  }
  function limitesZ() { var a = zAjuste(); return [a * 0.85, Math.max(4, a * 6)]; }
  function aplicar() {
    var r = rect(); if (!r.width) return;
    var lz = limitesZ(); cam.z = Math.max(lz[0], Math.min(lz[1], cam.z));
    var w = r.width / cam.z, h = r.height / cam.z;
    // Mantiene el barrio a la vista: el centro no se sale de los límites.
    cam.x = Math.max(L.x0, Math.min(L.x1, cam.x)); cam.y = Math.max(L.y0, Math.min(L.y1, cam.y));
    svg.setAttribute('viewBox', [cam.x - w / 2, cam.y - h / 2, w, h].map(function (n) { return Math.round(n * 100) / 100; }).join(' '));
    moverRotulo();
  }
  // Centro de cámara que deja el punto (sx, sy) al centro del área libre (descontando menú y panel).
  function centroPara(sx, sy, z) {
    var m = margenes();
    return { x: sx - (m.izq - m.der) / 2 / z, y: sy - (m.arr - m.aba) / 2 / z };
  }
  function volar(sx, sy, z, dur, fin) {
    var c = centroPara(sx, sy, z), desde = { x: cam.x, y: cam.y, z: cam.z }, t0 = performance.now();
    if (vuelo) cancelAnimationFrame(vuelo);
    if (reducido || dur === 0) { cam.x = c.x; cam.y = c.y; cam.z = z; aplicar(); if (fin) fin(); return; }
    dur = dur || 700;
    (function cuadro(t) {
      var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      // Interpola el zoom en escala logarítmica para que no "salte".
      cam.z = Math.exp(Math.log(desde.z) + (Math.log(z) - Math.log(desde.z)) * e);
      cam.x = desde.x + (c.x - desde.x) * e; cam.y = desde.y + (c.y - desde.y) * e;
      aplicar();
      if (k < 1) vuelo = requestAnimationFrame(cuadro); else { vuelo = null; if (fin) fin(); }
    })(t0);
  }
  function verTodo(dur) { var z = zAjuste(); volar((L.x0 + L.x1) / 2, (L.y0 + L.y1) / 2 + 10, z, dur); }
  function zPara(ventana) {
    var r = rect(), m = margenes(), lz = limitesZ();
    var w = Math.max(160, r.width - m.izq - m.der), h = Math.max(160, r.height - m.arr - m.aba);
    return Math.max(lz[0], Math.min(lz[1], Math.min(w / ventana, h / (ventana * .62))));
  }
  function zonaPorId(id) { return esc3.zonas.filter(function (z) { return z.id === id; })[0]; }
  function altoActor(a) { return a.z + E.alto[a.id] * window.Escena.ESCALA_ACTOR / 39; }
  function irA(obj, dur, fin) {
    if (obj.tipo === 'actor') {
      var a = esc3.actores[obj.id], p = P(a.x, a.y, a.z + 0.9);
      volar(p[0], p[1], Math.min(zPara(window.innerWidth < 700 ? 330 : 360), 2.3), dur, fin);
    } else if (obj.tipo === 'zona') {
      var zn = zonaPorId(obj.id); if (!zn) return;
      var q = P(zn.foco[0], zn.foco[1], zn.foco[2]);
      // Un local del barrio se abre al mirarlo: la cámara se acerca un poco más, para ver lo de adentro
      var ventana = zn.hq ? 1250 : zn.id === 'tv' ? 760 : zn.id === 'muro' || zn.id === 'recepcion' || zn.id === 'planos' ? 580 : zn.id === 'pasaje' ? 470 : zn.barrio ? 410 : 520;
      volar(q[0], q[1], zPara(obj.ventana || ventana), dur, fin);
    }
  }
  // Encuadra un grupo de lugares del barrio (una calle, los casos de un rubro)
  function irAGrupo(ids, dur) {
    var xs = [], ys = [];
    ids.forEach(function (id) {
      var zn = zonaPorId(id); if (!zn) return; var b = zn.caja;
      [[b[0], b[1], b[4]], [b[2], b[1], b[4]], [b[2], b[3], 0], [b[0], b[3], 0]].forEach(function (c) { var p = P(c[0], c[1], c[2]); xs.push(p[0]); ys.push(p[1]); });
    });
    if (!xs.length) return;
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    volar((x0 + x1) / 2, (y0 + y1) / 2, zPara(Math.max(470, (x1 - x0) * 1.25, (y1 - y0) * 2)), dur);
  }

  /* ── Resalte y rótulo ── */
  var resaltado = null;
  function resaltar(obj, extras) {
    resaltado = obj; capaResalte.innerHTML = '';
    if (!obj || obj.tipo === 'chat') { ocultarRotulo(); return; }
    var ns = 'http://www.w3.org/2000/svg';
    if (obj.tipo === 'zona') {
      [obj.id].concat(extras || []).forEach(function (id) {
        var zn = zonaPorId(id); if (!zn) return;
        // Un local abierto no se marca: abierto ya se distingue, y la marca le pasaría por encima a su gente
        if (id === localAbierto) return;
        var pg = document.createElementNS(ns, 'polygon'); pg.setAttribute('points', zn.silueta); pg.setAttribute('class', 'resalte');
        var pb = document.createElementNS(ns, 'polygon'); pb.setAttribute('points', zn.suelo); pb.setAttribute('class', 'resalte-suelo');
        capaResalte.appendChild(pb); capaResalte.appendChild(pg);
      });
      if (!zonaPorId(obj.id)) { ocultarRotulo(); return; }
    } else {
      var el = document.createElementNS(ns, 'ellipse'); el.setAttribute('class', 'resalte-actor'); el.setAttribute('rx', 30); el.setAttribute('ry', 13);
      capaResalte.appendChild(el);
    }
    moverRotulo();
  }
  var rotulo = $('#rotulo');
  function textoRotulo(obj) {
    if (obj.tipo === 'actor') { var p = PERSONAL[obj.id]; return '<b>' + esc(p.nombre) + '</b><span>' + esc(p.rol) + ' · ' + p.placa + '</span>'; }
    var zn = zonaPorId(obj.id), accion = 'Ver más', pr = PROYECTOS[obj.id];
    if (zn.hq) accion = 'Entrar a la oficina';
    else if (esVentas(obj.id)) accion = 'Ver la sala de ventas';
    else if (obj.id === 'libre' || zn.libre) accion = 'Conversar con Plotty';
    else if (tieneSala(obj.id)) accion = 'Ver el local y su sala';
    else if (pr) accion = ESTADO_TXT[estadoDe(pr)] + ' · Ver el local';
    else if (obj.id === 'archivo') accion = MUSEO ? 'El museo y todos los casos' : 'Ver todos los casos';
    else if (obj.id === 'tv') accion = 'El canal y sus videos';
    else if (obj.id === 'pasaje') accion = 'Ver el directorio';
    else if (obj.id === 'puerta-404') accion = 'No se abre';
    return '<b>' + esc(zn.nombre) + '</b><span>' + esc(accion) + '</span>';
  }
  function moverRotulo() {
    if (!resaltado || resaltado.tipo === 'chat' || enSala) return;
    var r = rect(), vb = svg.viewBox.baseVal, sx, sy;
    if (resaltado.tipo === 'actor') {
      var a = esc3.actores[resaltado.id], p0 = P(a.x, a.y, 0), p1 = P(a.x, a.y, altoActor(a) + 0.1);
      var el = capaResalte.querySelector('.resalte-actor'); if (el) { el.setAttribute('cx', p0[0]); el.setAttribute('cy', p0[1]); }
      sx = p1[0]; sy = p1[1];
    } else {
      var zn = zonaPorId(resaltado.id); if (!zn) return;
      // Sobre un local abierto el rótulo taparía lo de adentro (y el panel ya dice qué es)
      if (zn.id === localAbierto) { ocultarRotulo(); return; }
      var b = zn.caja, t = P((b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b[4] + .35);
      sx = t[0]; sy = t[1];
    }
    var cx = (sx - vb.x) * (r.width / vb.width), cy = (sy - vb.y) * (r.height / vb.height);
    if (!rotulo.hidden && rotulo.dataset.clave === resaltado.tipo + resaltado.id) { rotulo.style.transform = 'translate(' + Math.round(cx) + 'px,' + Math.round(cy) + 'px)'; return; }
    rotulo.innerHTML = '<div class="rotulo-caja">' + textoRotulo(resaltado) + '</div>'; rotulo.dataset.clave = resaltado.tipo + resaltado.id; rotulo.hidden = false;
    rotulo.style.transform = 'translate(' + Math.round(cx) + 'px,' + Math.round(cy) + 'px)';
  }
  function ocultarRotulo() { rotulo.hidden = true; rotulo.dataset.clave = ''; }
  // El rótulo sigue al actor que camina
  (function seguir() { if (resaltado && resaltado.tipo === 'actor') moverRotulo(); requestAnimationFrame(seguir); })();

  /* ── Entrada: arrastrar, rueda, pellizco, clic ── */
  var punteros = {}, arrastre = null;
  // Las siluetas de salas vecinas se traslapan (la cara de vidrio de una tapa el piso de la otra):
  // manda la sala cuyo piso está bajo el puntero; si no hay piso de sala ahí, la silueta tocada.
  function zonaEnPiso(clx, cly) {
    var r = rect(), vb = svg.viewBox.baseVal;
    var sx = vb.x + (clx - r.left) * vb.width / r.width, sy = vb.y + (cly - r.top) * vb.height / r.height;
    var x = (sx / 32 + sy / 16) / 2, y = (sy / 16 - sx / 32) / 2;
    var z = esc3.zonas.filter(function (zn) { var b = zn.caja; return zn.adentro && x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]; })[0];
    return z ? { tipo: 'zona', id: z.id } : null;
  }
  function objetoEn(el, clx, cly) {
    if (!el || !el.closest) return null;
    var a = el.closest('.actor'); if (a) return { tipo: 'actor', id: a.getAttribute('data-actor') };
    if (el.classList && el.classList.contains('zona-hit')) {
      var zn = zonaPorId(el.getAttribute('data-zona'));
      return (zn && zn.adentro && clx !== undefined && zonaEnPiso(clx, cly)) || { tipo: 'zona', id: el.getAttribute('data-zona') };
    }
    return null;
  }
  svg.addEventListener('pointerdown', function (e) {
    punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(punteros);
    if (ids.length === 1) arrastre = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, movio: false, obj: objetoEn(e.target, e.clientX, e.clientY) };
    else if (ids.length === 2) {
      var a = punteros[ids[0]], b = punteros[ids[1]];
      arrastre = { pellizco: true, d: Math.hypot(a.x - b.x, a.y - b.y), z: cam.z, movio: true };
    }
    if (vuelo) { cancelAnimationFrame(vuelo); vuelo = null; }
  });
  window.addEventListener('pointermove', function (e) {
    if (punteros[e.pointerId]) punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (!arrastre) {
      if (e.pointerType === 'mouse' && e.target && svg.contains(e.target) && !enSala) {
        var o = objetoEn(e.target, e.clientX, e.clientY);
        if (!o && resaltado && resaltado.origen === 'mouse') resaltar(null);
        else if (o && (!resaltado || resaltado.id !== o.id)) {
          o.origen = 'mouse'; resaltar(o);
          // Con el mouse encima de un local, lo de adentro se va cargando (así se abre al tiro)
          if (o.tipo === 'zona' && esLocal(zonaPorId(o.id))) conLocales();
        }
      }
      return;
    }
    if (arrastre.pellizco) {
      var ids = Object.keys(punteros); if (ids.length < 2) return;
      var a = punteros[ids[0]], b = punteros[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomEn((a.x + b.x) / 2, (a.y + b.y) / 2, arrastre.z * d / arrastre.d / cam.z);
      return;
    }
    var dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
    if (!arrastre.movio && Math.hypot(dx, dy) > 6) { arrastre.movio = true; escenaEl.classList.add('arrastrando'); }
    if (arrastre.movio) { cam.x = arrastre.cx - dx / cam.z; cam.y = arrastre.cy - dy / cam.z; aplicar(); }
  });
  function soltar(e) {
    delete punteros[e.pointerId];
    if (!arrastre) return;
    if (!arrastre.movio && arrastre.obj && e.type === 'pointerup') abrir(arrastre.obj, true);
    if (!Object.keys(punteros).length) { arrastre = null; escenaEl.classList.remove('arrastrando'); }
    else if (arrastre.pellizco) { var k = Object.keys(punteros)[0]; arrastre = { x: punteros[k].x, y: punteros[k].y, cx: cam.x, cy: cam.y, movio: true }; }
  }
  window.addEventListener('pointerup', soltar);
  window.addEventListener('pointercancel', soltar);
  function zoomEn(clx, cly, factor) {
    var r = rect(), lz = limitesZ(), z2 = Math.max(lz[0], Math.min(lz[1], cam.z * factor));
    var wx = cam.x + (clx - r.left - r.width / 2) / cam.z, wy = cam.y + (cly - r.top - r.height / 2) / cam.z;
    cam.z = z2; cam.x = wx - (clx - r.left - r.width / 2) / z2; cam.y = wy - (cly - r.top - r.height / 2) / z2;
    aplicar();
  }
  svg.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (vuelo) { cancelAnimationFrame(vuelo); vuelo = null; }
    var d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomEn(e.clientX, e.clientY, Math.exp(-d * (e.ctrlKey ? 0.01 : 0.0016)));
  }, { passive: false });
  escenaEl.addEventListener('keydown', function (e) {
    var paso = 90 / cam.z, r = rect(), usado = true;
    if (e.key === 'ArrowLeft') cam.x -= paso; else if (e.key === 'ArrowRight') cam.x += paso;
    else if (e.key === 'ArrowUp') cam.y -= paso; else if (e.key === 'ArrowDown') cam.y += paso;
    else if (e.key === '+' || e.key === '=') zoomEn(r.left + r.width / 2, r.top + r.height / 2, 1.25);
    else if (e.key === '-' || e.key === '_') zoomEn(r.left + r.width / 2, r.top + r.height / 2, 0.8);
    else if (e.key === '0') verTodo();
    else usado = false;
    if (usado) { e.preventDefault(); aplicar(); }
  });

  /* ── Controles ── */
  $('#controles').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var r = rect(), acc = b.getAttribute('data-accion');
    if (acc === 'tele') { abrirTele(null, b); return; }
    // En una sala propia, los mismos botones mueven su cámara
    if (propia && acc !== 'pausa') { propia.aMano = true; if (acc === 'todo') verSalaEntera(600); else zoomSalaCentro(acc === 'acercar' ? 1.35 : 0.74); return; }
    if (acc === 'acercar') zoomEn(r.left + r.width / 2, r.top + r.height / 2, 1.35);
    if (acc === 'alejar') zoomEn(r.left + r.width / 2, r.top + r.height / 2, 0.74);
    if (acc === 'todo') verTodo();
    if (acc === 'pausa') pausar(b.getAttribute('aria-pressed') !== 'true');
  });
  function pausar(si) {
    var b = $('#controles [data-accion="pausa"]');
    b.setAttribute('aria-pressed', si ? 'true' : 'false');
    b.querySelector('.txt').textContent = si ? 'Seguir' : 'Pausar';
    b.setAttribute('aria-label', si ? 'Reanudar la animación' : 'Pausar la animación');
    document.documentElement.classList.toggle('oficina-quieta', si);
    if (si || enSala) esc3.detener(); else esc3.iniciar();
    esc3.moverLocal(!si && !reducido && !enSala);
    if (vivaSala) vivaSala.mover(!si && !reducido);
    // En una sala propia la gente deja de hablar sola (sigue su turno al reanudar)
    if (propia && si) callarSolas();
    guardar('pausa', si ? '1' : '0');
  }

  /* ── Menú: recorre la oficina y el barrio ── */
  var ZONAS_OFICINA = ['recepcion', 'vitrina', 'diagnostico', 'planos', 'set', 'laboratorio', 'reuniones', 'estanteria', 'muro', 'puerta-404'];
  function subZona(id) { return id === 'vitrina' ? 'Casos para tu rubro' : SALAS[id].sub; }
  function nombreZona(id) { return id === 'vitrina' ? 'La vitrina' : SALAS[id].nombre; }
  // Un lugar del barrio en el menú y en el directorio: nombre, detalle, color y estado (para el filtro)
  function lugar(id) {
    var pr = PROYECTOS[id];
    if (id === 'pasaje') return { id: id, nombre: SALAS.pasaje.nombre, sub: SALAS.pasaje.sub, estado: 'lugar' };
    if (id === 'archivo') return { id: id, nombre: SALAS.archivo.nombre, sub: (MUSEO ? 'Museo de BiPlot · ' : '') + (BARRIO ? BARRIO.total : 0) + ' casos, por rubro', estado: 'lugar', color: '#7FD8CF' };
    if (id === 'libre' || /^libre-/.test(id)) return { id: id, nombre: PROYECTOS.libre.nombre, sub: 'Local disponible', estado: 'libre', color: '#7FD8CF', libre: true };
    if (id === 'tv' && CANAL) return { id: id, nombre: SALAS.tv.nombre, sub: SALAS.tv.sub + ' · ' + programasTv().length + ' videos', estado: 'lugar', color: '#17C3B2' };
    if (!pr) return null;
    return { id: id, nombre: nombreCaso(pr), sub: pr.permiso === 'rubro' ? 'Caso sin nombre' : pr.rubro, estado: estadoDe(pr), chip: chipCaso(pr), color: pr.acento };
  }
  function callesDelBarrio() {
    var g = [{ id: 'principal', nombre: 'Calle principal', ids: ORDEN_PRINCIPAL.concat(CANAL ? ['tv'] : []) }];
    if (BARRIO) BARRIO.calles.forEach(function (c) { g.push({ id: c.id, nombre: c.nombre, ids: c.casos.concat(['libre-' + c.id]) }); });
    return g;
  }
  // Se busca por nombre, rubro, estado y calle
  function itemLugar(l, calle) {
    var pr = PROYECTOS[l.id], rubro = pr && pr.calle ? rubroTxt(pr.calle) : '';
    return '<li data-estado="' + l.estado + '" data-busca="' + esc(normal([l.nombre, l.sub, l.chip, rubro, calle].join(' '))) + '"><button type="button" data-tipo="zona" data-id="' + esc(l.id) + '">' +
      (l.estado === 'lugar' && !l.color ? '<span class="punto lugar" aria-hidden="true"></span>' : '<span class="punto' + (l.libre ? ' libre' : '') + '" style="background:' + esc(l.color || '#35679A') + '" aria-hidden="true"></span>') +
      '<span class="mt"><b>' + esc(l.nombre) + '</b><span>' + esc(l.sub || '') + '</span></span>' + (l.chip ? '<span class="chip-mini">' + esc(l.chip) + '</span>' : '') + '</button></li>';
  }
  function construirMenu() {
    var h = '<h2 class="menu-t" id="recorrer-t">Recorre la oficina</h2>' +
      '<button type="button" class="menu-guia menu-oficina" data-oficina="1"><span class="ico" aria-hidden="true">' + icono('entrar') + '</span><span class="txt">Entrar a la oficina</span></button>' +
      '<button type="button" class="menu-guia" data-guia="1"><span class="ico" aria-hidden="true">' + icono('ruta') + '</span>Hacer el recorrido guiado</button>' +
      '<button type="button" class="menu-guia menu-chat" data-chat="1">' + avatar('plotty', 'mini') + 'Conversar con Plotty</button>' +
      (CANAL ? '<button type="button" class="menu-guia menu-tv" data-tipo="zona" data-id="tv"><span class="ico" aria-hidden="true">' + icono('tv') + '</span>Ver BiPlot.TV, el canal</button>' : '') +
      '<h3 class="menu-sub">El equipo</h3><ul class="menu-lista menu-personal">';
    E.ids.concat(E.mascotas).forEach(function (id) {
      var p = PERSONAL[id];
      h += '<li><button type="button" data-tipo="actor" data-id="' + id + '">' + avatar(id) + '<span class="mt"><b>' + esc(p.nombre) + '</b><span>' + esc(p.rol) + '</span></span><span class="placa-mini">' + p.placa + '</span></button></li>';
    });
    h += '</ul><h3 class="menu-sub">La oficina</h3><ul class="menu-lista">';
    ZONAS_OFICINA.forEach(function (id) { h += '<li><button type="button" data-tipo="zona" data-id="' + id + '"><span class="mt"><b>' + esc(nombreZona(id)) + '</b><span>' + esc(subZona(id)) + '</span></span></button></li>'; });
    h += '</ul>';
    if (BARRIO) {
      h += '<h3 class="menu-sub">El barrio</h3>' +
        '<div class="menu-busca"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input type="search" id="busca-barrio" placeholder="Busca un caso o un rubro" aria-label="Buscar en el barrio" autocomplete="off"></div>' +
        '<div class="menu-filtros" role="group" aria-label="Qué locales mostrar"><button type="button" data-filtro="todos" aria-pressed="true">Todos</button><button type="button" data-filtro="abierto" aria-pressed="false">Abiertos</button><button type="button" data-filtro="obra" aria-pressed="false">En obra</button></div>' +
        '<div class="menu-calles">' + callesDelBarrio().map(function (c) {
          return '<div class="menu-calle" data-calle="' + esc(c.id) + '"><h4>' + esc(c.nombre) + '</h4><ul class="menu-lista">' + c.ids.map(function (id) { var l = lugar(id); return l ? itemLugar(l, c.nombre) : ''; }).join('') + '</ul></div>';
        }).join('') + '</div><p class="menu-vacio" hidden>No hay locales con ese nombre. Prueba con el rubro, o pregúntale a Plotty.</p>';
    }
    $('#recorrer-cuerpo').innerHTML = h;
  }
  construirMenu();
  var menu = $('#recorrer'), filtroBarrio = 'todos';
  function filtrarBarrio() {
    var q = normal(($('#busca-barrio') || {}).value || '').trim(), hay = 0;
    menu.querySelectorAll('.menu-calle').forEach(function (g) {
      var visibles = 0;
      g.querySelectorAll('li').forEach(function (li) {
        var est = li.getAttribute('data-estado');
        var pasa = (filtroBarrio === 'todos' || est === filtroBarrio || (filtroBarrio === 'obra' && est === 'diagnostico') || (filtroBarrio === 'abierto' && est === 'inauguracion')) &&
          (!q || li.getAttribute('data-busca').indexOf(q) > -1);
        li.hidden = !pasa; if (pasa) visibles++;
      });
      g.hidden = !visibles; hay += visibles;
    });
    var v = menu.querySelector('.menu-vacio'); if (v) v.hidden = hay > 0;
  }
  menu.addEventListener('input', function (e) { if (e.target.id === 'busca-barrio') filtrarBarrio(); });
  menu.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.id === 'recorrer-toggle') { alternarMenu(); return; }
    if (b.hasAttribute('data-filtro')) {
      filtroBarrio = b.getAttribute('data-filtro');
      menu.querySelectorAll('[data-filtro]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      filtrarBarrio(); return;
    }
    if (window.innerWidth < 900) alternarMenu(false);
    if (b.hasAttribute('data-oficina')) { if (esc3.abierta()) salirOficina(); else entrarOficina({ boton: b }); return; }
    if (b.hasAttribute('data-guia')) { iniciarGuia(0); return; }
    if (b.hasAttribute('data-chat')) { abrir({ tipo: 'chat', id: 'plotty' }, false, b); return; }
    abrir({ tipo: b.getAttribute('data-tipo'), id: b.getAttribute('data-id') }, false, b);
  });
  // Al recorrer el menú con teclado, la cámara muestra dónde está cada cosa.
  var devolviendoFoco = false;
  menu.addEventListener('focusin', function (e) {
    var b = e.target.closest('button[data-id]'); if (!b || !b.matches(':focus-visible') || enSala || devolviendoFoco) return;
    var obj = { tipo: b.getAttribute('data-tipo'), id: b.getAttribute('data-id') };
    if (deAdentro(obj) !== esc3.abierta()) return;
    resaltar(obj); irA(obj);
  });
  function alternarMenu(abrirlo) {
    var cerrado = menu.classList.contains('cerrado');
    if (abrirlo === undefined) abrirlo = cerrado;
    var angosto = window.innerWidth < 900;
    if (abrirlo && angosto) { if (!panel.hidden) cerrarPanel(); if (!guia.hidden) { guia.hidden = true; resaltar(null); } cerrarIntro(); }
    menu.classList.toggle('cerrado', !abrirlo);
    $('#recorrer-toggle').setAttribute('aria-expanded', abrirlo ? 'true' : 'false');
    $('#recorrer-toggle span').textContent = abrirlo && angosto ? 'Cerrar' : 'Recorrer';
    if (!angosto) guardar('menu', abrirlo ? '1' : '0');
    if (enSala) acomodarSala();
  }

  /* ── Panel ── */
  var panel = $('#panel'), panelCuerpo = $('#panel-cuerpo'), invocador = null, abierto = null;
  function tituloPanel(obj) {
    if (obj.tipo === 'actor') return PERSONAL[obj.id].rol + ' · ' + PERSONAL[obj.id].placa;
    if (obj.tipo === 'chat') return 'Recepción · E0';
    if (obj.tipo === 'sala') return 'La sala · ' + calleDe(obj.id);
    var zn = zonaPorId(obj.id);
    if (zn && zn.libre || obj.id === 'libre') return 'Local disponible · ' + calleDe(obj.id);
    if (PROYECTOS[obj.id]) return 'Local · ' + calleDe(obj.id);
    return obj.id === 'vitrina' ? 'Recepción · La vitrina' : SALAS[obj.id].etiqueta;
  }
  // Lo de adentro (el equipo, Plotty, las salas de la oficina) se ve con la oficina abierta; lo del barrio, desde la calle
  function deAdentro(obj) { var zn = obj.tipo === 'zona' && zonaPorId(obj.id); return obj.tipo === 'actor' || obj.tipo === 'chat' || !!(zn && zn.adentro); }
  function abrir(obj, desdeEscena, boton) {
    if (obj.tipo === 'zona' && obj.id === 'oficina') { entrarOficina({ boton: boton }); return; }
    if (obj.tipo === 'zona' && !zonaPorId(obj.id)) return;
    if (enSala) salirSala({ sinCamara: true });
    if (deAdentro(obj)) { if (!esc3.abierta()) entrarOficina({ sinCamara: true }); }
    else if (esc3.abierta()) salirOficina({ sinCamara: true });
    // Los locales libres del barrio abren la conversación con Plotty
    var zn = obj.tipo === 'zona' ? zonaPorId(obj.id) : null;
    var chatLibre = zn && (zn.libre || obj.id === 'libre');
    // Un local del barrio se abre: se va el techo y se ve por dentro, con su gente
    if (esLocal(zn)) abrirLocal(zn.id); else cerrarLocal();
    detenerMedios();
    invocador = boton || document.activeElement;
    abierto = obj;
    panelCuerpo.innerHTML = obj.tipo === 'actor' ? htmlPersonaje(obj.id) : obj.tipo === 'chat' ? htmlChatPanel() : chatLibre ? htmlLibre(obj.id) : tieneSala(obj.id) ? htmlProyecto(PROYECTOS[obj.id]) : htmlZona(obj.id);
    panel.hidden = false; document.body.classList.add('panel-abierto'); panel.classList.remove('panel-sala');
    // Con un local abierto, en el celular el panel deja más espacio para verlo por dentro
    panel.classList.toggle('panel-local', esLocal(zn));
    $('#panel-nombre').textContent = tituloPanel(obj);
    $('#panel-cerrar').setAttribute('aria-label', 'Cerrar');
    panel.setAttribute('aria-label', obj.tipo === 'actor' ? PERSONAL[obj.id].nombre : obj.tipo === 'chat' ? 'Conversación con Plotty' : zn.nombre);
    panel.scrollTop = 0; panelCuerpo.scrollTop = 0;
    activarMedios();
    if (panelCuerpo.querySelector('.chat')) iniciarChat(panelCuerpo.querySelector('.chat'));
    if (panelCuerpo.querySelector('.archivo-busca')) iniciarArchivo();
    if (obj.tipo === 'actor') conIlustraciones(function () { pintarIlustracion(obj.id); });
    pintarVistas();
    if (obj.tipo === 'chat') resaltar({ tipo: 'actor', id: 'plotty' }); else resaltar(obj);
    requestAnimationFrame(function () { irA(obj.tipo === 'chat' ? { tipo: 'actor', id: 'plotty' } : obj); });
    var t = $('#panel-titulo'); if (t) t.focus({ preventScroll: true });
    cerrarIntro();
  }
  function cerrarPanel() {
    if (enSala) { salirSala(); return; }
    detenerMedios();
    cerrarLocal();
    panel.hidden = true; abierto = null; resaltar(null); document.body.classList.remove('panel-abierto');
    if (invocador && invocador.focus && document.contains(invocador)) invocador.focus({ preventScroll: true });
    aplicar();
  }
  $('#panel-cerrar').addEventListener('click', cerrarPanel);
  document.addEventListener('keydown', function (e) {
    // Con la tele prendida, el teclado es sólo de ella (también si el foco quedó afuera)
    if (rep.abierta) { if (!tele.contains(e.target)) teclaTele(e); return; }
    if (e.key !== 'Escape') return;
    if (window.innerWidth < 900 && !menu.classList.contains('cerrado')) { alternarMenu(false); $('#recorrer-toggle').focus(); return; }
    // En una sala propia, Escape cierra primero la tarjeta (o el recorrido); después, sale a la calle
    if (enSala) { if (propia && escapePropia()) return; salirSala(); return; }
    if (!panel.hidden) cerrarPanel();
    else if (!$('#guia').hidden) terminarGuia();
    else if (esc3.abierta()) salirOficina();
  });
  panelCuerpo.addEventListener('click', function (e) {
    var b = e.target.closest('[data-abrir]');
    if (b) { e.preventDefault(); var v = b.getAttribute('data-abrir').split(':'); abrir({ tipo: v[0], id: v[1] }, false, invocador); return; }
    var en = e.target.closest('[data-entrar]');
    if (en) { e.preventDefault(); entrarSala(en.getAttribute('data-entrar'), { boton: invocador }); return; }
    var g = e.target.closest('[data-grande]');
    if (g) { e.preventDefault(); abrirTele(g.getAttribute('data-grande'), g); return; }
    var pt = e.target.closest('[data-tele-prender]');
    if (pt) { e.preventDefault(); abrirTele(null, pt); return; }
    var ru = e.target.closest('[data-rubro]');
    if (ru) { e.preventDefault(); verRubro(ru.getAttribute('data-rubro'), true); return; }
    var pi = e.target.closest('[data-pin]');
    if (pi) { elegirPin(+pi.getAttribute('data-pin'), false); return; }
    var cp = e.target.closest('.copiar'); if (cp) { copiar(cp); return; }
    var co = e.target.closest('.compartir'); if (co) { compartir(co); return; }
    var go = e.target.closest('[data-golpe]');
    if (go) { var gs = SALAS['puerta-404'].golpes, out = panelCuerpo.querySelector('.golpe'); out.textContent = gs[golpes++ % gs.length]; }
  });
  var golpes = 0;

  function icono(n) {
    var I = {
      ruta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/></svg>',
      afuera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
      play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
      tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M8 3l4 4 4-4"/></svg>',
      calle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L9 4M20 20L15 4M12 6v2M12 11v2M12 16v2"/></svg>',
      compartir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/></svg>',
      entrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M4 12h11M11 8l4 4-4 4"/></svg>'
    };
    return I[n] || '';
  }
  function enlaceExterno(t, url) {
    var interno = /^(\.\.\/|casos\/)/.test(url);
    return '<a class="bp-btn" href="' + esc(url) + '"' + (interno ? '' : ' target="_blank" rel="noopener"') + '>' + esc(t) + (interno ? '' : '<span class="ico" aria-hidden="true">' + icono('afuera') + '</span><span class="sr">(se abre en otra pestaña)</span>') + '</a>';
  }
  function chipsEquipo(ids) {
    return '<ul class="equipo">' + ids.map(function (id) {
      var p = PERSONAL[id];
      return '<li><a href="#" data-abrir="actor:' + id + '">' + avatar(id) + '<span><b>' + esc(p.nombre) + '</b>' + esc(p.rol) + '</span></a></li>';
    }).join('') + '</ul>';
  }
  function botonChat(texto) { return '<button type="button" class="bp-btn primario" data-abrir="chat:plotty">' + avatar('plotty', 'mini') + esc(texto || 'Conversar con Plotty') + '</button>'; }
  // Vista de un lugar de la escena (reutiliza el dibujo con <use>)
  function vistaSala(id) {
    var zn = zonaPorId(id), b = zn.caja;
    var pts = [P(b[0], b[1], b[4] + .6), P(b[2], b[1], b[4] + .6), P(b[2], b[3], 0), P(b[0], b[3], 0), P(b[2], b[1], 0), P(b[0], b[1], 0)];
    var x0 = Math.min.apply(null, pts.map(function (p) { return p[0]; })) - 30, x1 = Math.max.apply(null, pts.map(function (p) { return p[0]; })) + 30;
    var y0 = Math.min.apply(null, pts.map(function (p) { return p[1]; })) - 20, y1 = Math.max.apply(null, pts.map(function (p) { return p[1]; })) + 20;
    var w = x1 - x0, h = w * 9 / 16, cy = (y0 + y1) / 2;
    return '<div class="media media-sala"><svg viewBox="' + [x0, cy - h / 2, w, h].map(Math.round).join(' ') + '" role="img" aria-label="Vista de ' + esc(zn.nombre) + '"><use href="#escena-raiz"/></svg></div>';
  }
  function htmlMedia(pr) {
    return '<div class="media"><video class="panel-video" muted loop playsinline preload="none" poster="' + esc(pr.media.poster) + '" data-src="' + esc(pr.media.h) + '" aria-label="Video de ' + esc(pr.nombre) + '"></video>' +
      '<button type="button" class="media-grande" data-grande="' + esc(pr.media.h) + '" data-grande-v="' + esc(pr.media.v || '') + '">' + icono('play') + 'Ver con sonido</button></div>';
  }
  function whatsapp(texto) { return 'https://wa.me/' + D.whatsapp + '?text=' + encodeURIComponent(texto); }

  /* ── Fichas: la ilustración se carga recién con la primera ficha ── */
  var ilusCargando = false, ilusEspera = [];
  function conIlustraciones(fn) {
    if (window.Ilustraciones) { fn(); return; }
    ilusEspera.push(fn); if (ilusCargando) return; ilusCargando = true;
    var s = document.createElement('script'); s.src = 'ilustraciones.js';
    s.onload = function () { ilusEspera.splice(0).forEach(function (f) { f(); }); };
    s.onerror = function () { ilusEspera = []; ilusCargando = false; };
    document.head.appendChild(s);
  }
  function pintarIlustracion(id) {
    var I = window.Ilustraciones && window.Ilustraciones[id], hueco = panelCuerpo.querySelector('.ficha-pj[data-id="' + id + '"]');
    if (!I || !hueco) return;
    var p = PERSONAL[id], nuevo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    nuevo.setAttribute('class', 'ficha-pj ficha-ilus' + (E.mascotas.indexOf(id) > -1 ? ' mascota' : ''));
    nuevo.setAttribute('viewBox', I.vb); nuevo.setAttribute('role', 'img'); nuevo.setAttribute('aria-label', p.nombre + ': ' + p.look);
    nuevo.innerHTML = I.svg;
    hueco.parentNode.replaceChild(nuevo, hueco);
  }
  function htmlPersonaje(id) {
    var p = PERSONAL[id], masc = E.mascotas.indexOf(id) > -1;
    var proys = D.proyectos.filter(function (pr) { return (pr.equipo || []).indexOf(id) > -1 && pr.permiso !== 'archivo'; });
    var fases = D.fases.filter(function (f) { return f.quien.indexOf(id) > -1; });
    var ahora = p.ahora[Math.floor(Math.random() * p.ahora.length)];
    var a = E.alto[id], w = E.ancho[id];
    var vb = masc ? [-w / 2 - 20, -a - 60, w + 40, a + 80] : [-140, -a - 16, 280, a + 30];
    var vive = p.vive && (zonaPorId(p.vive) || p.vive === 'estaciones') ? p.vive : null;
    return '<div class="ficha-hero"><svg class="ficha-pj" data-id="' + id + '" viewBox="' + vb.map(Math.round).join(' ') + '" role="img" aria-label="' + esc(p.nombre + ': ' + p.look) + '">' + E.svg(id) + '</svg>' +
      '<svg class="ficha-placa" viewBox="0 0 300 190" aria-hidden="true">' + E.placaTarjeta(p, true, { isoSimple: true }).replace(/class="pj pj-/g, 'class="pj pj-retrato pj-') + '</svg></div>' +
      '<p class="bp-etiqueta">' + esc(p.rol) + (p.fases.length ? ' · ' + p.fases.join(' · ') : ' · ' + esc(p.placa)) + '</p>' +
      '<h2 id="panel-titulo" tabindex="-1">' + esc(p.nombre) + '</h2>' +
      // Sin apellido, el apodo va solo (Felipe: «Le dicen Rodman»)
      (p.completo ? '<p class="completo">' + esc(p.completo) + (p.alias ? ' · le dicen ' + esc(p.alias) : '') + '</p>' : p.alias ? '<p class="completo">Le dicen ' + esc(p.alias) + '</p>' : '') +
      '<p class="lema">' + esc(p.lema) + '</p>' +
      '<p class="ahora"><span class="pulso" aria-hidden="true"></span>Ahora: ' + esc(ahora) + '</p>' +
      (id === 'plotty' ? '<div class="acciones">' + botonChat('Responder las tres preguntas') + '</div>' : '') +
      '<h3>Qué hace</h3><p>' + esc(p.resumen) + '</p>' +
      '<h3>' + (masc ? 'Sus tareas' : 'Cómo es') + '</h3><ul class="rasgos">' + p.rasgos.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
      '<blockquote class="frase">«' + esc(p.frase) + '»</blockquote>' +
      (fases.length ? '<h3>En el motor</h3><ul class="fases-mini">' + fases.map(function (f) { return '<li><span class="cod">' + f.id + '</span>' + esc(f.nombre) + '</li>'; }).join('') + '</ul>' : '') +
      (proys.length ? '<h3>Trabajó en</h3><ul class="chips">' + proys.map(function (pr) { return '<li><a href="#" data-abrir="zona:' + pr.id + '">' + esc(nombreCaso(pr)) + '</a></li>'; }).join('') + '</ul>' : '') +
      (p.de ? '<h3>Es la mascota de</h3>' + chipsEquipo([p.de]) : '') +
      (vive && vive !== 'estaciones' ? '<h3>Dónde está</h3><ul class="chips"><li><a href="#" data-abrir="zona:' + vive + '">' + esc(nombreZona(vive)) + '</a></li></ul>' : '') +
      '<p class="look"><b>Cómo ' + (p.genero === 'f' ? 'reconocerla' : 'reconocerlo') + ':</b> ' + esc(p.look) + '</p>';
  }

  function listaVitrina() {
    return '<ul class="vitrina">' + vitrinaIds.map(function (id) {
      var pr = PROYECTOS[id], c = CASOS[id];
      if (pr) return '<li><span class="punto" style="background:' + pr.acento + '" aria-hidden="true"></span><div><b>' + esc(pr.nombre) + '</b><span>' + esc(pr.rubro) + '</span><a href="#" data-abrir="zona:' + id + '">Ver el local</a></div></li>';
      if (c) return '<li><span class="num">' + c.num + '</span><div><b>' + esc(c.nombre) + '</b><span>' + esc(c.rubro) + ' · caso de referencia</span><a href="' + esc(c.demo) + '">Ver la demo</a> · <a href="' + esc(c.caso) + '">Leer el caso</a></div></li>';
      return '';
    }).join('') + '</ul>';
  }
  // El directorio: cada calle con sus locales (lo que muestra el tótem del pasaje)
  function htmlDirectorio() {
    return '<div class="directorio">' + callesDelBarrio().map(function (c) {
      return '<section><h3>' + esc(c.nombre) + '</h3><ul class="lugares">' + c.ids.filter(function (id) { return id !== 'pasaje'; }).map(function (id) {
        var l = lugar(id); if (!l) return '';
        return '<li><a href="#" data-abrir="zona:' + esc(id) + '"><span class="punto' + (l.libre ? ' libre' : '') + '" style="background:' + esc(l.color || '#35679A') + '" aria-hidden="true"></span><span class="mt"><b>' + esc(l.nombre) + '</b><span>' + esc(l.sub || '') + '</span></span>' + (l.chip ? '<span class="chip-mini">' + esc(l.chip) + '</span>' : '') + '</a></li>';
      }).join('') + '</ul></section>';
    }).join('') + '</div>';
  }
  // El Archivo: el museo de BiPlot (su sala propia) y el fichero, con todos los casos por rubro y su buscador. El fichero
  // va en el panel de la calle y en la tarjeta del fichero, dentro del museo (ahí, cada caso con sala lleva a su sala).
  function htmlFichero(h, enMuseo) {
    var grupos = D.plotty.preguntas[0].opciones.map(function (o) {
      var lista = D.proyectos.filter(function (p) { return !p.libre && p.calle === o[0]; });
      return lista.length ? '<section class="archivo-grupo"><' + h + '>' + esc(o[1]) + '</' + h + '><ul class="lugares">' + lista.map(function (p) {
        var st = p.permiso === 'archivo' ? 'Sólo en El Archivo' : chipCaso(p);
        var accion = p.permiso === 'archivo' ? '' : enMuseo && tieneSala(p.id) ? '<button type="button" class="ir-sala" data-sala-ir="' + esc(p.id) + '">Entrar a su sala</button>' :
          '<a href="#" data-abrir="zona:' + esc(p.id) + '">Ver el local</a>';
        return '<li data-busca="' + esc(normal(nombreCaso(p) + ' ' + p.rubro + ' ' + o[1])) + '"><span class="punto" style="background:' + esc(p.acento || '#35679A') + '" aria-hidden="true"></span><span class="mt"><b>' + esc(nombreCaso(p)) + '</b><span>' + esc(p.permiso === 'rubro' ? 'Caso sin nombre' : p.rubro) + ' · ' + esc(st) + '</span>' + accion + '</span></li>';
      }).join('') + '</ul></section>' : '';
    }).join('');
    return '<div class="menu-busca archivo-busca"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input type="search" placeholder="Busca por nombre o rubro" aria-label="Buscar en El Archivo" autocomplete="off"></div>' +
      '<div class="archivo-lista">' + grupos + '</div><p class="archivo-vacio nota" hidden>No hay casos con ese nombre o rubro.</p>';
  }
  function htmlArchivo() {
    var S = SALAS.archivo;
    return (MUSEO ? '<div class="media media-sala vista-sala" data-vista-sala="archivo" role="img" aria-label="El Archivo por dentro: el museo de BiPlot"></div>' : vistaSala('archivo')) +
      '<p class="bp-etiqueta">' + esc(S.etiqueta) + '</p><h2 id="panel-titulo" tabindex="-1">' + esc(S.titulo) + '</h2><p>' + esc(S.texto) + '</p>' +
      (MUSEO ? '<div class="acciones entrar-sala"><button type="button" class="bp-btn primario" data-entrar="archivo"><span class="ico" aria-hidden="true">' + icono('entrar') + '</span>Entrar al museo</button></div><h3>El fichero</h3>' : '') +
      htmlFichero(MUSEO ? 'h4' : 'h3', false) +
      '<p class="nota">Los casos de referencia del núcleo (negocios ilustrativos, no clientes) están en la estantería.</p>' + chipsEquipo(['pepa']);
  }
  // BiPlot.TV desde la calle: el canal por dentro, el botón para entrar, la tele (se prende ahí mismo) y la programación,
  // que se ve directo con sonido
  function htmlTv() {
    var S = SALAS.tv;
    return '<div class="media media-sala vista-sala" data-vista-sala="tv" role="img" aria-label="BiPlot.TV por dentro: el canal de BiPlot"></div>' +
      '<p class="bp-etiqueta">' + esc(S.etiqueta) + '</p><h2 id="panel-titulo" tabindex="-1">' + esc(S.titulo) + '</h2><p>' + esc(S.texto) + '</p>' +
      '<div class="acciones entrar-sala"><button type="button" class="bp-btn primario" data-entrar="tv"><span class="ico" aria-hidden="true">' + icono('entrar') + '</span>Entrar al canal</button>' +
      '<button type="button" class="bp-btn" data-tele-prender="1"><span class="ico" aria-hidden="true">' + icono('tv') + '</span>Prender la tele</button></div>' +
      '<h3>La programación</h3>' + htmlProgramas(programasTv(), false) + '<p class="nota">Cada video se abre en la tele del canal, con toda la programación: se cambia de canal sin salir. Sale en horizontal o en vertical, según tu pantalla.</p>' + chipsEquipo(['aby', 'felipe']);
  }
  // La programación de BiPlot.TV, en el orden de su cartelera: cada video con su pantalla, de qué es, su nombre y cuánto
  // dura. En la calle se ve directo con sonido; en el canal, cada uno abre su tarjeta (con el video y lo que cuenta)
  function programasTv() { var Z = SALAS.tv.salaPropia.zonas, c = Z.cartelera; return (c && c.programas || []).filter(function (id) { return Z[id] && videoDe(Z[id]); }); }
  function videoDe(d) { return typeof d.video === 'string' ? (PROYECTOS[d.video] || {}).media : d.video; }
  function htmlProgramas(ids, enCanal) {
    var Z = SALAS.tv.salaPropia.zonas;
    return '<ol class="programas">' + ids.map(function (id) {
      var d = Z[id], v = videoDe(d);
      var dato = enCanal ? 'data-zona-ir="' + esc(id) + '"' : 'data-grande="' + esc(v.h) + '" data-grande-v="' + esc(v.v || '') + '"';
      return '<li><button type="button" class="programa" ' + dato + '><img src="' + MEDIOS + '../tv/pantalla-' + esc(d.pantalla || id) + '.webp" alt="" width="160" height="90" loading="lazy">' +
        '<span class="programa-txt"><span class="ceja">' + esc(d.ceja) + '</span><b>' + esc(d.nombre) + '</b><span class="dur">' + esc(d.duracion || '') + '</span></span>' +
        '<span class="ico" aria-hidden="true">' + icono('play') + '</span>' + (enCanal ? '' : '<span class="sr"> (ver con sonido)</span>') + '</button></li>';
    }).join('') + '</ol>';
  }
  // El video de una tarjeta del canal: se ve sin sonido en la tarjeta (en pantallas grandes) y con sonido en grande
  function htmlVideoZona(d) {
    var v = videoDe(d); if (!v) return '';
    return '<div class="media tarjeta-video"><video class="panel-video" muted loop playsinline preload="none" poster="' + esc(v.poster) + '" data-src="' + esc(v.h) + '" aria-label="' + esc('Video: ' + d.nombre) + '"></video>' +
      '<button type="button" class="media-grande" data-grande="' + esc(v.h) + '" data-grande-v="' + esc(v.v || '') + '">' + icono('play') + 'Ver con sonido</button></div>';
  }
  // El buscador del fichero (en el panel o en la tarjeta del museo)
  function iniciarArchivo(caja) {
    caja = caja || panelCuerpo;
    var inp = caja.querySelector('.archivo-busca input');
    inp.addEventListener('input', function () {
      var q = normal(inp.value).trim(), hay = 0;
      caja.querySelectorAll('.archivo-grupo').forEach(function (g) {
        var n = 0; g.querySelectorAll('li').forEach(function (li) { var si = !q || li.getAttribute('data-busca').indexOf(q) > -1; li.hidden = !si; if (si) n++; });
        g.hidden = !n; hay += n;
      });
      caja.querySelector('.archivo-vacio').hidden = hay > 0;
    });
  }
  // La vista previa de un local con sala: el video (o la sala dibujada), qué hicimos y el botón para entrar a la sala
  function htmlProyecto(pr) {
    return (pr.media ? htmlMedia(pr) : '<div class="media media-sala vista-sala" data-vista-sala="' + esc(pr.id) + '" role="img" aria-label="La sala de ' + esc(pr.nombre) + ' por dentro"></div>') +
      '<p class="bp-etiqueta">' + esc(pr.rubro) + '</p>' +
      '<h2 id="panel-titulo" tabindex="-1">' + esc(pr.nombre) + '</h2>' +
      '<p class="lema">' + esc(pr.cliente) + ' · <span class="estado">' + esc(pr.corto || pr.estado) + '</span></p>' +
      '<p class="esencia">' + esc(pr.esencia) + '</p>' +
      '<div class="acciones entrar-sala"><button type="button" class="bp-btn primario" data-entrar="' + esc(pr.id) + '"><span class="ico" aria-hidden="true">' + icono('entrar') + '</span>Entrar a la sala</button></div>' +
      '<p>' + esc(pr.resumen) + '</p>' +
      '<ul class="puntos">' + pr.puntos.map(function (x) { return '<li><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</li>'; }).join('') + '</ul>' +
      (pr.enlaces.length ? '<div class="acciones">' + pr.enlaces.map(function (l) { return enlaceExterno(l.texto, l.url); }).join('') + '</div>' : '') +
      (pr.nota ? '<p class="nota">' + esc(pr.nota) + '</p>' : '') +
      '<h3>Quién trabajó aquí</h3>' + chipsEquipo(pr.equipo);
  }
  // Las vistas que se dibujan después de abrir el panel: la sala de un proyecto (salas.js) o el local por dentro (locales.js)
  function pintarVistas() {
    var vs = panelCuerpo.querySelector('[data-vista-sala]');
    if (vs) conSalas(function () {
      var S = window.Salas.salas[vs.getAttribute('data-vista-sala')]; if (!S || !document.contains(vs)) return;
      vs.innerHTML = '<svg viewBox="' + S.vb + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g class="quieto sin-pines">' + window.Escena.maquetaSvg(S, conMedios) + '</g></svg>';
    });
    var vl = panelCuerpo.querySelector('[data-vista-local]');
    if (vl) conLocales(function () {
      var a = adentroDe(vl.getAttribute('data-vista-local')); if (!a || !document.contains(vl)) return;
      // El cuadro: el local entero (con su letrero colgante), en 16:9
      var q = [P(0, 0, 2.3), P(4.6, 0, 2.3), P(4.6, 5.4, 0), P(0, 5.4, 0), P(0, 4.3, 0)];
      var x0 = Math.min.apply(null, q.map(function (c) { return c[0]; })) - 16, x1 = Math.max.apply(null, q.map(function (c) { return c[0]; })) + 16;
      var y0 = Math.min.apply(null, q.map(function (c) { return c[1]; })), y1 = Math.max.apply(null, q.map(function (c) { return c[1]; }));
      var w = x1 - x0, h = w * 9 / 16, cy = (y0 + y1) / 2;
      vl.innerHTML = '<svg viewBox="' + [x0, cy - h / 2, w, h].map(Math.round).join(' ') + '" aria-hidden="true"><g class="quieto">' + window.Escena.maquetaSvg(a.M, a.pintar) + '</g></svg>';
    });
  }
  function conMedios(s) { return s.replace(/§M§/g, MEDIOS); }

  /* ── Los locales del barrio se abren al tocarlos (locales.js): se va el techo y se ve lo de adentro ── */
  var localAbierto = null;
  function esLocal(zn) { return !!(zn && zn.barrio && !zn.hq && zn.id !== 'pasaje' && zn.id !== 'tv'); }
  // Lo de adentro de un local: el de la calle principal, o el de un caso según su plantilla o su estado (con su frente
  // y sus extras), con las marcas de su color y su nombre; los locales que se arriendan, vacíos
  function adentroDe(id) {
    var Lc = window.Locales, zn = zonaPorId(id); if (!Lc || !zn) return null;
    var pintar = function (o) { return function (s) { return window.Escena.pintar(s, o); }; };
    if (Lc.principal[id]) return { M: Lc.principal[id], pintar: conMedios };
    if (zn.libre) return { M: window.Escena.juntar([Lc.interior.arriendo, Lc.frente]), pintar: pintar({ color: '#7FD8CF', nombre: 'SE ARRIENDA' }) };
    var pr = PROYECTOS[id]; if (!pr) return null;
    var est = estadoDe(pr), partes = [est === 'abierto' || est === 'inauguracion' ? Lc.interior[pr.plantilla] || Lc.interior.basica : Lc.interior[est] || Lc.interior.basica, Lc.frente];
    if (est === 'inauguracion') partes.push(Lc.extra.inauguracion);
    if (est === 'abierto' && String(pr.fase || 'E9') === 'E9') partes.push(Lc.extra.placa90);
    var nombre = pr.permiso === 'rubro' ? String(pr.rubro || '').split(' · ')[0].split(',')[0].toUpperCase() : String(pr.letrero || pr.nombre || '').toUpperCase();
    return { M: window.Escena.juntar(partes), pintar: pintar({ color: pr.acento, nombre: nombre, lema: pr.lema, lineas: pr.lineas }) };
  }
  function abrirLocal(id) {
    if (localAbierto === id) return;
    cerrarLocal();
    localAbierto = id;
    conLocales(function () {
      if (localAbierto !== id) return;
      var a = adentroDe(id); if (!a) return;
      esc3.abrirLocal(id, a.M, { pintar: a.pintar, mover: !quieta() && !reducido });
    });
  }
  function cerrarLocal() { if (!localAbierto) return; localAbierto = null; esc3.cerrarLocal(); }
  // Un local con plantilla: su vista por dentro, en qué fase va y quién trabaja en él
  function htmlCaso(pr) {
    var est = estadoDe(pr), f = faseDe(pr);
    return '<div class="media media-sala vista-local" data-vista-local="' + esc(pr.id) + '" role="img" aria-label="' + esc(nombreCaso(pr)) + ' por dentro"></div>' + '<p class="bp-etiqueta">' + esc(pr.permiso === 'rubro' ? 'Caso sin nombre' : pr.rubro) + '</p>' +
      '<h2 id="panel-titulo" tabindex="-1">' + esc(nombreCaso(pr)) + '</h2>' +
      '<p class="lema">' + (pr.cliente && pr.permiso !== 'rubro' ? esc(pr.cliente) + ' · ' : '') + '<span class="estado">' + esc(ESTADO_TXT[est]) + '</span></p>' +
      (pr.esencia ? '<p class="esencia">' + esc(pr.esencia) + '</p>' : '') + (pr.resumen ? '<p>' + esc(pr.resumen) + '</p>' : '') +
      (f ? '<h3>En qué va</h3><ul class="fases-mini"><li><span class="cod">' + f.id + '</span>' + esc(f.nombre) + '</li></ul><p class="nota">' + esc(f.texto) + '</p>' : '') +
      (pr.puntos && pr.puntos.length ? '<ul class="puntos">' + pr.puntos.map(function (x) { return '<li><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</li>'; }).join('') + '</ul>' : '') +
      (pr.enlaces && pr.enlaces.length ? '<div class="acciones">' + pr.enlaces.map(function (l) { return enlaceExterno(l.texto, l.url); }).join('') + '</div>' : '') +
      (pr.equipo && pr.equipo.length ? '<h3>Quién trabaja aquí</h3>' + chipsEquipo(pr.equipo) : '') +
      '<div class="acciones"><a class="bp-cta" href="' + whatsapp('Hola BiPlot, vi ' + nombreCaso(pr) + ' en el barrio de la oficina y quiero agendar un diagnóstico.') + '" target="_blank" rel="noopener">Agenda tu diagnóstico<span class="sr"> (se abre WhatsApp en otra pestaña)</span></a></div>';
  }
  function htmlLibre(id) {
    var pr = PROYECTOS.libre, calle = calleDe(id), ventas = esVentas(id);
    // (el de la calle principal es la sala de ventas de BiPlot: se entra como a la sala de un proyecto)
    return (ventas ? '<div class="media media-sala vista-sala" data-vista-sala="libre" role="img" aria-label="La sala de ventas de BiPlot por dentro"></div>' : vistaSala(id)) +
      '<p class="bp-etiqueta">' + esc(pr.rubro) + (calle ? ' · ' + esc(calle) : '') + '</p>' +
      '<h2 id="panel-titulo" tabindex="-1">' + esc(pr.nombre) + '</h2>' +
      '<p class="lema">' + esc(pr.esencia) + '</p>' +
      (ventas ? '<div class="acciones entrar-sala"><button type="button" class="bp-btn primario" data-entrar="libre"><span class="ico" aria-hidden="true">' + icono('entrar') + '</span>Entrar a la sala de ventas</button></div>' : '') +
      '<p>' + esc(pr.resumen) + '</p>' + htmlChat();
  }

  function htmlZona(id) {
    if (PROYECTOS[id] && !tieneSala(id)) return htmlCaso(PROYECTOS[id]);
    var S = SALAS[id] || {}, cab = function () { return '<p class="bp-etiqueta">' + esc(S.etiqueta) + '</p><h2 id="panel-titulo" tabindex="-1">' + esc(S.titulo) + '</h2><p>' + esc(S.texto) + '</p>'; };
    var puntos = function () { return S.puntos ? '<ul class="puntos">' + S.puntos.map(function (x) { return '<li><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</li>'; }).join('') + '</ul>' : ''; };
    if (id === 'recepcion') {
      return '<div class="media"><video class="panel-video" muted loop playsinline preload="none" poster="../assets/casos/teaser-biplot-h.jpg" data-src="../assets/casos/teaser-biplot-h.mp4" aria-label="Teaser de BiPlot"></video>' +
        '<button type="button" class="media-grande" data-grande="../assets/casos/teaser-biplot-h.mp4" data-grande-v="../assets/casos/teaser-biplot-v.mp4">' + icono('play') + 'Ver con sonido</button></div>' +
        cab() + '<div class="acciones">' + botonChat() + '</div>' + chipsEquipo(['plotty', 'lupe']) +
        '<h3>Cómo moverte</h3><ul class="rasgos"><li>Arrastra para moverte y usa la rueda o los botones para acercarte.</li><li>Toca a alguien del equipo o una sala para ver más.</li><li>Afuera está la calle: toca un local para entrar a la sala de esa empresa.</li><li>Con teclado: el menú «Recorre la oficina», las flechas y las teclas + y −.</li></ul>';
    }
    if (id === 'vitrina') {
      return vistaSala('vitrina') + '<p class="bp-etiqueta">Recepción · La vitrina</p><h2 id="panel-titulo" tabindex="-1">' + (rubroElegido ? 'Casos para tu rubro' : 'Nuestros casos') + '</h2>' +
        '<p>' + (rubroElegido ? 'Plotty dejó aquí los tres casos más cercanos a tu rubro.' : 'Tres casos a la vista. Después de las tres preguntas, Plotty deja aquí los más cercanos a tu rubro.') + '</p>' +
        listaVitrina() + '<div class="acciones">' + botonChat(rubroElegido ? 'Volver a conversar con Plotty' : 'Conversar con Plotty') + '</div>';
    }
    if (id === 'diagnostico') {
      return vistaSala('diagnostico') + cab() +
        '<ol class="motor">' + D.fases.map(function (f) {
          return '<li><span class="cod">' + f.id + '</span><div><b>' + esc(f.nombre) + '</b><span>' + esc(f.texto) + '</span></div><span class="quien">' +
            f.quien.map(function (q) { return '<a href="#" data-abrir="actor:' + q + '" title="' + esc(PERSONAL[q].nombre) + '">' + avatar(q) + '<span class="sr">' + esc(PERSONAL[q].nombre) + '</span></a>'; }).join('') + '</span></li>';
        }).join('') + '</ol>' +
        '<p class="nota">En las reuniones te atiende una persona del equipo, con su nombre y su rol.</p>';
    }
    if (id === 'planos') return vistaSala('planos') + cab() + puntos() + chipsEquipo(['architect', 'engine', 'atlas']);
    if (id === 'set') return vistaSala('set') + cab() + chipsEquipo(['aby', 'felipe']);
    if (id === 'laboratorio') return vistaSala('laboratorio') + cab() + puntos() + chipsEquipo(['celda', 'lupe']);
    if (id === 'reuniones') return vistaSala('reuniones') + cab() + '<div class="acciones">' + botonChat('Agendar con Plotty') + '</div>';
    if (id === 'pasaje') return vistaSala('pasaje') + cab() + htmlDirectorio();
    if (id === 'archivo') return htmlArchivo();
    if (id === 'tv') return htmlTv();
    if (id === 'puerta-404') {
      return vistaSala('puerta-404') + cab() + '<div class="acciones"><button type="button" class="bp-btn" data-golpe="1">Golpear la puerta</button></div><p class="golpe" aria-live="polite"></p>';
    }
    if (id === 'estanteria') {
      return vistaSala('estanteria') + cab() +
        '<h3>Casos de referencia</h3><ul class="casos">' + D.casos.map(function (c) {
          return '<li><span class="num">' + c.num + '</span><div><b>' + esc(c.nombre) + '</b><span class="rubro">' + esc(c.rubro) + ' · ' + esc(c.camino) + '</span><p>' + esc(c.hallazgo) + '</p>' +
            '<p class="links"><a href="' + esc(c.demo) + '">Ver la demo</a> · <a href="' + esc(c.caso) + '">Leer el caso</a></p></div></li>';
        }).join('') + '</ul><p class="nota">Son negocios ilustrativos, armados sobre la operación real de empresas de ese tamaño. No son clientes.</p>' +
        '<h3>También en la estantería</h3><ul class="otros">' + D.estanteria.map(function (x) { return '<li>' + enlaceExterno(x.texto, x.url) + '<span>' + esc(x.detalle) + '</span></li>'; }).join('') + '</ul>' +
        chipsEquipo(['pepa']);
    }
    if (id === 'muro') {
      return cab() + '<ul class="muro">' + E.ids.map(function (i) { var p = PERSONAL[i]; return '<li><a href="#" data-abrir="actor:' + i + '">' + avatar(i) + '<b>' + esc(p.nombre) + '</b><span>' + esc(p.rol) + '</span><span class="placa-mini">' + p.placa + '</span></a></li>'; }).join('') + '</ul>';
    }
    return '';
  }

  /* ── La oficina: cerrada desde la calle; al entrar se abre (el techo se desvanece) y la cámara va adentro ── */
  var salirBtn = $('#salir-oficina');
  // Al cruzar la puerta se cierra el panel de lo que quedó al otro lado (sin mover el foco ni la cámara)
  function soltarPanel(deAca) {
    if (panel.hidden || !abierto || deAdentro(abierto) === deAca) return;
    detenerMedios(); panel.hidden = true; abierto = null; document.body.classList.remove('panel-abierto');
  }
  function entrarOficina(o) {
    o = o || {};
    if (enSala) salirSala({ sinCamara: true, sinHistoria: true });
    soltarPanel(true); cerrarLocal();
    var ya = esc3.abierta();
    esc3.oficina(true, !o.directo);
    document.body.classList.add('en-oficina'); salirBtn.hidden = false;
    marcarOficina();
    cerrarIntro();
    // La oficina tiene su dirección (#oficina): el botón «atrás» del navegador vuelve a la calle
    if (!ya && !o.sinHistoria && !desdeEnlace && location.hash !== '#oficina') {
      var nuestra = history.state && (history.state.sala || history.state.calle || history.state.oficina);
      history[nuestra ? 'replaceState' : 'pushState']({ oficina: true }, '', '#oficina');
    }
    // En escritorio se ve la oficina entera; en celular, la recepción de cerca
    if (!o.sinCamara) {
      resaltar(null);
      if (window.innerWidth < 700) { var p = P(16.2, 14.6, 0.8); volar(p[0], p[1], zPara(600), o.directo ? 0 : 800); }
      else irA({ tipo: 'zona', id: 'oficina' }, o.directo ? 0 : 800);
    }
  }
  function salirOficina(o) {
    o = o || {};
    if (!esc3.abierta()) return;
    if (!o.conPanel) soltarPanel(false);
    esc3.oficina(false, !o.directo);
    document.body.classList.remove('en-oficina'); salirBtn.hidden = true;
    marcarOficina();
    if (!o.sinHistoria && !desdeEnlace && location.hash === '#oficina') history.replaceState({ calle: true }, '', location.pathname + location.search);
    if (!o.sinCamara) { resaltar({ tipo: 'zona', id: 'oficina' }); encuadreCalle(o.directo ? 0 : 700); }
  }
  // El botón del menú dice lo que se puede hacer: entrar o salir
  function marcarOficina() {
    var b = menu && menu.querySelector('[data-oficina]'); if (!b) return;
    b.querySelector('.txt').textContent = esc3.abierta() ? 'Salir a la calle' : 'Entrar a la oficina';
  }
  salirBtn.addEventListener('click', function () { salirOficina(); escenaEl.focus({ preventScroll: true }); });

  /* ── La sala de cada empresa (salas.js): el local por dentro, un punto por módulo y el panel con todo lo real ── */
  var salaEl = $('#sala'), salaCaja = $('#sala-dibujo-caja'), enSala = null, pinActual = 0, vivaSala = null;
  // locales.js (los locales por dentro) se carga al abrir el primer local; salas.js, al entrar a una sala, después de
  // locales.js: cada uno define sólo los personajes que no definió el anterior
  var cargas = {};
  function cargar(archivo, global, fn) {
    if (window[global]) { fn(); return; }
    if (cargas[archivo]) { cargas[archivo].push(fn); return; }
    var espera = cargas[archivo] = [fn], s = document.createElement('script');
    s.src = archivo;
    s.onload = function () {
      delete cargas[archivo];
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      defs.setAttribute('class', 'sprite-quieto'); defs.setAttribute('aria-hidden', 'true');
      defs.innerHTML = '<defs>' + window[global].defs + '</defs>';
      document.body.appendChild(defs);
      espera.forEach(function (f) { f(); });
    };
    s.onerror = function () { delete cargas[archivo]; s.remove(); };
    document.head.appendChild(s);
  }
  function conLocales(fn) { cargar('locales.js', 'Locales', fn || function () {}); }
  function conSalas(fn) { if (window.Salas) fn(); else conLocales(function () { cargar('salas.js', 'Salas', fn); }); }
  function urlSala(id) { return 'https://biplot.cl/oficina/' + id + '/'; }
  function htmlSala(pr) {
    var pines = pr.pines || [], conImg = pines.some(function (p) { return p[3]; });
    return '<div class="sala-cab" style="--acento:' + esc(pr.acento) + '"><p class="bp-etiqueta">' + esc(pr.rubro) + '</p>' +
      '<h2 id="panel-titulo" tabindex="-1">' + esc(pr.nombre) + '</h2><p class="sala-cliente">' + esc(pr.cliente) + '</p><span class="chip">' + esc(pr.corto || pr.estado) + '</span></div>' +
      '<p class="esencia">' + esc(pr.esencia) + '</p>' +
      '<section class="sala-bloque sala-construimos" style="--acento:' + esc(pr.acento) + '"><h3>Lo que construimos</h3><div class="visor" aria-live="polite"></div>' +
      '<div class="tira' + (conImg ? '' : ' sin-img') + '" role="group" aria-label="Módulos de ' + esc(pr.nombre) + '">' + pines.map(function (p, i) {
        return '<button type="button" data-pin="' + (i + 1) + '" aria-pressed="false" aria-label="' + esc((i + 1) + '. ' + p[0] + ': ' + p[1]) + '">' + (p[3] ? '<img src="' + MEDIOS + esc(p[3]) + '.webp" alt="" loading="lazy" width="160" height="90">' : '') +
          '<span class="n">' + (i + 1) + '</span>' + (p[3] ? '' : '<span class="m">' + esc(p[0]) + '</span>') + '</button>';
      }).join('') + '</div>' + (pr.nota ? '<p class="nota">' + esc(pr.nota) + '</p>' : '') + '</section>' +
      '<section class="sala-bloque"><h3>Lo que resolvimos</h3><p>' + esc(pr.resumen) + '</p><ul class="puntos">' + pr.puntos.map(function (x) { return '<li><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</li>'; }).join('') + '</ul></section>' +
      (pr.media ? '<section class="sala-bloque"><h3>Míralo funcionar</h3>' + htmlMedia(pr) + '</section>' : '') +
      (pr.enlaces.length ? '<section class="sala-bloque"><h3>Visítalos</h3>' + pr.enlaces.map(function (l) {
        return '<a class="sala-enlace" style="--acento:' + esc(pr.acento) + '" href="' + esc(l.url) + '" target="_blank" rel="noopener"><span>' + esc(l.texto) + '<small>' + esc(l.url.replace(/^https?:\/\//, '')) + '</small></span><span class="ico" aria-hidden="true">' + icono('afuera') + '</span><span class="sr">(se abre en otra pestaña)</span></a>';
      }).join('') + '</section>' : '') +
      '<section class="sala-bloque"><h3>El equipo que lo hizo</h3>' + chipsEquipo(pr.equipo) + '</section>' +
      '<section class="sala-bloque"><h3>Resultados</h3><ol class="medicion"><li><b>Día 30</b><span>Pendiente</span></li><li><b>Día 60</b><span>Pendiente</span></li><li><b>Día 90</b><span>Pendiente</span></li></ol><p class="nota">' + esc(pr.medicion || '') + '</p></section>' +
      '<section class="sala-bloque sala-comparte"><h3>Comparte esta sala</h3><div class="enlace-copia"><code>' + esc(urlSala(pr.id).replace(/^https:\/\/|\/$/g, '')) + '</code><button type="button" class="copiar" data-url="' + esc(urlSala(pr.id)) + '">Copiar</button></div>' +
      (navigator.share ? '<button type="button" class="bp-btn compartir" data-url="' + esc(urlSala(pr.id)) + '"><span class="ico" aria-hidden="true">' + icono('compartir') + '</span>Compartir</button>' : '') +
      '<p class="nota">Abre la oficina directo en esta sala, y al pegarlo en un chat se ve su imagen.</p></section>' +
      '<div class="sala-final"><p>¿Tu negocio se parece a este?</p><div class="acciones"><a class="bp-cta" href="' + whatsapp('Hola BiPlot, vi la sala de ' + pr.nombre + ' en la oficina y quiero agendar un diagnóstico.') + '" target="_blank" rel="noopener">Agenda tu diagnóstico<span class="sr"> (se abre WhatsApp en otra pestaña)</span></a>' + botonChat() + '</div></div>';
  }
  // Deja el dibujo de la sala en el espacio libre: al lado del panel (escritorio) o arriba de él (celular)
  function acomodarSala() {
    if (!enSala) return;
    var m = margenes(), marco = $('#sala-marco');
    marco.style.left = m.izq + 'px'; marco.style.right = m.der + 'px'; marco.style.bottom = m.aba + 'px';
    if (propia) acomodarPropia();
  }
  function entrarSala(id, o) {
    o = o || {};
    var pr = salaDe(id); if (!pr) return;
    if (!guia.hidden) { guia.hidden = true; }
    cerrarIntro();
    if (esc3.abierta()) salirOficina({ sinCamara: true, sinHistoria: true });
    var ya = enSala;
    // La sala propia anterior (su tarjeta, su recorrido y sus burbujas) se cierra antes de pasar a otra
    terminarPropia();
    detenerMedios();
    // Cada sala tiene su dirección (#haru): el botón «atrás» del navegador vuelve a la calle. Si ya hay una entrada nuestra
    // en el historial (otra sala o la calle a la que se volvió), se reemplaza, para no llenarlo.
    if (!o.sinHistoria && location.hash !== '#' + id) {
      var nuestra = history.state && (history.state.sala || history.state.calle);
      history[ya || nuestra ? 'replaceState' : 'pushState']({ sala: id }, '', '#' + id);
    }
    enSala = id; invocador = o.boton || invocador || document.activeElement; abierto = { tipo: 'sala', id: id };
    document.body.classList.add('en-sala');
    // Una sala propia (salaPropia en datos.js) no lleva panel: la sala ocupa todo el espacio libre
    var conPropia = esPropia(id);
    document.body.classList.toggle('en-sala-propia', conPropia);
    resaltar({ tipo: 'zona', id: id }); ocultarRotulo();
    if (conPropia) {
      panelCuerpo.innerHTML = '';
      panel.hidden = true; panel.classList.remove('panel-sala', 'panel-local'); document.body.classList.remove('panel-abierto');
      $('#panel-cerrar').setAttribute('aria-label', 'Cerrar');
    } else {
      // El panel con todo lo de la empresa
      panelCuerpo.innerHTML = htmlSala(pr);
      panel.hidden = false; panel.classList.add('panel-sala'); panel.classList.remove('panel-local'); document.body.classList.add('panel-abierto');
      $('#panel-nombre').textContent = tituloPanel({ tipo: 'sala', id: id });
      $('#panel-cerrar').setAttribute('aria-label', 'Volver a la calle');
      panel.setAttribute('aria-label', 'La sala de ' + pr.nombre);
      panel.scrollTop = 0; panelCuerpo.scrollTop = 0;
    }
    // La calle queda detrás de la sala: su gente (también la del local abierto) se detiene mientras tanto
    esc3.detener(); esc3.moverLocal(false);
    var mostrar = function () {
      conSalas(function () {
        if (enSala !== id) return;
        pintarSala(id);
        salaEl.hidden = false; acomodarSala();
        requestAnimationFrame(function () { salaEl.classList.add('visible'); });
        if (propia) { mirarPropia(); return; }
        activarMedios();
        var t = $('#panel-titulo'); if (t) t.focus({ preventScroll: true });
      });
    };
    // La cámara entra al local y, al llegar, se abre la sala
    if (ya || o.directo) { mostrar(); return; }
    salaEl.classList.remove('visible');
    requestAnimationFrame(function () { irA({ tipo: 'zona', id: id, ventana: 300 }, 650, mostrar); });
  }
  function pintarSala(id) {
    var S = window.Salas.salas[id], pr = salaDe(id); if (!S) return;
    if (vivaSala) vivaSala.destruir();
    var conPropia = esPropia(id) && !!S.zonas;
    salaCaja.innerHTML = '<svg class="sala-svg" viewBox="' + S.vb + '" preserveAspectRatio="xMidYMid meet" role="group" aria-label="' + esc(nombreSala(id) + ': ' + pr.esencia) + '">' +
      // En una sala propia, lo que se toca brilla (un halo dorado difuso bajo el contorno punteado)
      (conPropia ? '<defs><filter id="sala-brillo" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="6"/></filter></defs>' : '') +
      '<g id="sala-dibujo" class="sala-dibujo' + (reducido ? ' quieto' : '') + '"></g></svg>';
    // La sala en capas, con quienes caminan entre los muebles (quietos con la animación pausada)
    vivaSala = window.Escena.maqueta(salaCaja.querySelector('#sala-dibujo'), S, { pintar: conMedios });
    vivaSala.mover(!quieta() && !reducido);
    if (conPropia) montarPropia(id, S);
    else if (esPropia(id)) {
      // Una sala propia cuyo dibujo todavía no trae zonas (salas.js sin regenerar) se ve como las demás, con su panel
      document.body.classList.remove('en-sala-propia');
      panelCuerpo.innerHTML = htmlSala(pr); panel.hidden = false; panel.classList.add('panel-sala'); document.body.classList.add('panel-abierto');
      $('#panel-nombre').textContent = tituloPanel({ tipo: 'sala', id: id }); $('#panel-cerrar').setAttribute('aria-label', 'Volver a la calle');
    }
    salaCaja.querySelectorAll('.pin').forEach(function (g) {
      var p = (pr.pines || [])[g.getAttribute('data-pin') - 1];
      g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
      g.setAttribute('aria-label', p ? g.getAttribute('data-pin') + '. ' + p[0] + ': ' + p[1] : 'Punto ' + g.getAttribute('data-pin'));
    });
    $('#sala-nombre').textContent = pr.nombre;
    // Las salas vecinas, en el orden de la calle (el museo, al final)
    var i = VECINAS.indexOf(id), ant = VECINAS[i - 1], sig = VECINAS[i + 1];
    var bA = $('#sala-ant'), bS = $('#sala-sig');
    bA.hidden = !ant; bS.hidden = !sig;
    if (ant) { bA.setAttribute('data-sala', ant); bA.querySelector('span').textContent = salaDe(ant).nombre; }
    if (sig) { bS.setAttribute('data-sala', sig); bS.querySelector('span').textContent = salaDe(sig).nombre; }
    if (!conPropia) elegirPin(1, false, true);
  }
  // Un punto de la sala: la pantalla real de ese módulo (o, si no hay, el rincón de la sala donde está)
  function elegirPin(n, mover, inicial) {
    var pr = PROYECTOS[enSala], p = pr && (pr.pines || [])[n - 1]; if (!p) return;
    pinActual = n;
    var visor = panelCuerpo.querySelector('.visor'); if (!visor) return;
    var S = window.Salas && window.Salas.salas[enSala], pin = S && S.pines.filter(function (x) { return x.n === n; })[0];
    visor.innerHTML = (p[3] ? '<img src="' + MEDIOS + esc(p[3]) + '.webp" alt="' + esc(pr.nombre + ': ' + p[1]) + '" width="1280" height="720">'
      : pin ? '<svg class="visor-sala" viewBox="' + [pin.x - 150, pin.y - 92, 300, 169].map(Math.round).join(' ') + '" role="img" aria-label="' + esc(p[0] + ' en la sala de ' + pr.nombre) + '"><use href="#sala-dibujo"/></svg>' : '') +
      '<div class="visor-txt"><span class="mod">' + esc(n + ' · ' + p[0]) + '</span><b>' + esc(p[1]) + '</b><span>' + esc(p[2]) + '</span></div>';
    panelCuerpo.querySelectorAll('.tira button').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-pin') === n ? 'true' : 'false'); });
    salaCaja.querySelectorAll('.pin').forEach(function (g) { g.classList.toggle('activo', +g.getAttribute('data-pin') === n); });
    if (mover) {
      var bloque = panelCuerpo.querySelector('.sala-construimos');
      if (bloque) panelCuerpo.scrollTo({ top: bloque.offsetTop - 12, behavior: reducido ? 'auto' : 'smooth' });
    }
    if (!inicial && !mover) { /* el foco queda en el botón de la tira */ }
  }
  function salirSala(o) {
    o = o || {};
    if (!enSala) return;
    var id = enSala;
    terminarPropia();
    enSala = null;
    if (vivaSala) { vivaSala.destruir(); vivaSala = null; }
    cerrarLocal();
    salaEl.classList.remove('visible'); salaEl.hidden = true; salaCaja.innerHTML = '';
    document.body.classList.remove('en-sala', 'en-sala-propia');
    detenerMedios();
    panel.hidden = true; panel.classList.remove('panel-sala'); abierto = null; document.body.classList.remove('panel-abierto');
    $('#panel-cerrar').setAttribute('aria-label', 'Cerrar');
    if (!o.sinHistoria && location.hash) history.replaceState({ calle: true }, '', location.pathname + location.search);
    if (!quieta()) esc3.iniciar();
    if (!o.sinCamara) {
      // Vuelve a la calle, un poco más lejos, con el local marcado
      resaltar({ tipo: 'zona', id: id });
      irA({ tipo: 'zona', id: id, ventana: 900 }, 650);
      var b = document.querySelector('#recorrer [data-id="' + id + '"]');
      devolviendoFoco = true;
      if (invocador && invocador.focus && document.contains(invocador) && invocador !== document.body) invocador.focus({ preventScroll: true });
      else if (b && !menu.classList.contains('cerrado')) b.focus({ preventScroll: true }); else escenaEl.focus({ preventScroll: true });
      devolviendoFoco = false;
    } else resaltar(null);
    aplicar();
  }
  $('#sala-volver').addEventListener('click', function () { salirSala(); });
  $('#sala-ant').addEventListener('click', function () { var s = this.getAttribute('data-sala'); if (s) entrarSala(s, { directo: true }); });
  $('#sala-sig').addEventListener('click', function () { var s = this.getAttribute('data-sala'); if (s) entrarSala(s, { directo: true }); });
  salaCaja.addEventListener('click', function (e) { var g = e.target.closest('.pin'); if (g) elegirPin(+g.getAttribute('data-pin'), true); });
  salaCaja.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var g = e.target.closest && e.target.closest('.pin'); if (!g) return;
    e.preventDefault(); elegirPin(+g.getAttribute('data-pin'), true);
  });

  /* ── La sala propia (salaPropia en datos.js: la de cada empresa de la calle principal y la del museo, El Archivo) ──
     La sala de la empresa como su propia sala de ventas, sin números ni panel: llena el espacio libre y se mueve y se
     acerca como la oficina (arrastrar, rueda, pellizco, flechas, + y −). Lo que se toca (sus zonas, en salas.js) se ilumina
     con su nombre y abre su tarjeta; la gente habla sola, de a una o de a dos; abajo va la barra de la empresa y BiPlot
     está en su rincón, con todo lo del proyecto. «Recorrer con una asesora» pasa zona por zona. Es el modelo para las
     demás salas: todo lo que es de la empresa (textos, colores, quién habla) sale de datos.js y de su dibujo. */
  var propia = null, capaSala = $('#sala-capa'), barraSala = $('#sala-barra'), tarjeta = $('#sala-tarjeta'), avisoSala = $('#sala-aviso'), frenteEl = $('#sala-frente');
  var toqueS = null, dedosS = {}, dichas = {};
  function esPropia(id) { var pr = salaDe(id); return !!(pr && pr.salaPropia); }
  // En celular la tarjeta es una hoja que sube desde abajo
  function hojaSala() { return window.innerWidth < 700; }
  function textoPropia(k, d) { return (propia.P.textos || {})[k] || d; }
  function puntosDe(s) { return String(s).split(' ').map(function (p) { return p.split(',').map(Number); }); }
  // El nombre de una zona para lectores de pantalla, sin repetirse: «Casa piloto: Un módulo de 6 m…», «Modelo: Un módulo»
  function nombreZonaSala(d) {
    var n = normal(d.nombre);
    if (d.titulo && n.indexOf(normal(d.titulo)) < 0) return d.nombre + ': ' + d.titulo;
    return d.ceja && n.indexOf(normal(d.ceja)) < 0 ? d.ceja + ': ' + d.nombre : d.nombre;
  }
  // Los colores de una empresa en variables de CSS (lo que no trae, queda como en oficina.css o como lo que la envuelve)
  function pintarColores(el, c) {
    c = c || {};
    [['--p-fondo', c.fondo], ['--p-fondo-2', c.fondo2], ['--p-tinta', c.tinta], ['--p-tinta-2', c.tinta2], ['--p-oro', c.oro], ['--p-ceja', c.ceja],
      ['--p-ceja-burbuja', c.cejaBurbuja], ['--p-borde', c.borde], ['--p-brillo', c.brillo], ['--p-sub', c.sub], ['--p-pie', c.pie], ['--p-velo', c.velo],
      ['--p-hover', c.hover], ['--p-btn-fondo', c.boton], ['--p-btn-tinta', c.botonTinta], ['--p-btn-punto', c.botonPunto]
    ].forEach(function (t) { if (t[1]) el.style.setProperty(t[0], t[1]); else el.style.removeProperty(t[0]); });
  }
  // Arma lo que va encima del dibujo: lo que se ilumina, las zonas y la gente que habla (botones de verdad, en el orden
  // de datos.js), la barra de la empresa y sus colores
  function montarPropia(id, S) {
    var pr = salaDe(id), PP = pr.salaPropia, svgS = salaCaja.querySelector('.sala-svg');
    var vb = S.vb.split(' ').map(Number);
    propia = { id: id, pr: pr, P: PP, S: S, svg: svgS, vb: vb, cam: { x: vb[0] + vb[2] / 2, y: vb[1] + vb[3] / 2, z: 1 }, zonas: {}, hablan: [],
      burbujas: [], tarjeta: null, frente: null, origenFrente: null, giro: null, origen: null, volver: null, aMano: false, recorrido: null, resalte: null, anillo: null, sobre: '', vuelo: null, latido: 0, turno: 0, reloj: null };
    dichas = {};
    // Los colores y la letra de la empresa (lo que no trae, queda como en oficina.css); la barra puede llevar los suyos
    var f = PP.fuente || {};
    // (la vista de frente vive fuera de la sala, sobre toda la página: lleva los mismos)
    pintarColores(salaEl, PP.colores); pintarColores(frenteEl, PP.colores); pintarColores(barraSala, PP.coloresBarra);
    [['--p-serif', f.familia], ['--p-peso', f.peso], ['--p-espacio', f.espacio], ['--p-caja', f.caja], ['--p-titulo-tam', f.titulo], ['--p-sub-letra', f.sub]
    ].forEach(function (t) { salaEl.style.setProperty(t[0], t[1] || ''); frenteEl.style.setProperty(t[0], t[1] || ''); });
    (S.zonas || []).forEach(function (z) { propia.zonas[z.id] = { z: z, pts: puntosDe(z.silueta), d: (PP.zonas || {})[z.id] }; });
    var h = '<g class="sala-resalte" aria-hidden="true"></g><g class="sala-anillo" aria-hidden="true"></g><g class="sala-toques">';
    Object.keys(PP.zonas || {}).forEach(function (zid) {
      var z = propia.zonas[zid], d = PP.zonas[zid]; if (!z) return;
      h += '<g class="zona-sala" data-zona="' + esc(zid) + '" role="button" tabindex="0" aria-haspopup="dialog" aria-controls="' + (z.z.frente ? 'sala-frente' : 'sala-tarjeta') + '" aria-expanded="false" aria-label="' +
        esc(nombreZonaSala(d)) + '"><polygon points="' + z.z.silueta + '"/></g>';
    });
    (PP.burbujas || []).forEach(function (b) {
      var g = S.gente && S.gente[b.quien]; if (!g) return;
      propia.hablan.push(b);
      var w = Math.max(26, g[2] * 0.46);
      h += '<g class="quien-sala" data-quien="' + esc(b.quien) + '" role="button" tabindex="0" aria-label="' + esc(b.nombre + ' dice: «' + b.texto + '»') + '">' +
        '<rect x="' + (g[0] - w / 2) + '" y="' + (g[1] - g[2]) + '" width="' + w + '" height="' + (g[2] + 6) + '"/></g>';
    });
    svgS.insertAdjacentHTML('beforeend', h + '</g>');
    // La sala es una región que se recorre con teclado
    salaCaja.setAttribute('tabindex', '0'); salaCaja.setAttribute('role', 'region'); salaCaja.setAttribute('aria-roledescription', 'sala interactiva');
    salaCaja.setAttribute('aria-label', nombreSala(id) + '. Arrastra o usa las flechas para moverte, + y − para acercarte y 0 para ver toda la sala. Toca o elige lo que quieras conocer.');
    capaSala.innerHTML = '<div class="sala-etiqueta" hidden></div>';
    barraSala.innerHTML = htmlBarraPropia(); barraSala.hidden = false; barraSala.classList.remove('recorriendo');
    barraSala.setAttribute('aria-label', pr.cliente || pr.nombre);
    $('#controles [data-accion="todo"]').setAttribute('aria-label', 'Ver toda la sala');
  }
  // Al abrirse la sala (ya con su tamaño): el encuadre inicial, el foco y el turno de las burbujas
  function mirarPropia() {
    if (!propia) return;
    acomodarPropia();
    encuadreInicialSala();
    salaCaja.focus({ preventScroll: true });
    clearTimeout(propia.reloj); propia.reloj = setTimeout(turnoBurbujas, 1200);
  }
  function terminarPropia() {
    if (!propia) return;
    var yo = propia;
    if (yo.recorrido) terminarRecorrido(true);
    cerrarFrente(true); cerrarTarjeta(true);
    clearTimeout(yo.reloj); if (yo.vuelo) cancelAnimationFrame(yo.vuelo); if (yo.latido) cancelAnimationFrame(yo.latido);
    propia = null; toqueS = null; dedosS = {};
    capaSala.innerHTML = ''; avisoSala.textContent = '';
    barraSala.hidden = true; barraSala.innerHTML = ''; barraSala.classList.remove('recorriendo'); pintarColores(barraSala, null);
    ['tabindex', 'role', 'aria-roledescription', 'aria-label'].forEach(function (a) { salaCaja.removeAttribute(a); });
    salaCaja.classList.remove('sobre', 'arrastrando');
    document.body.classList.remove('sala-hoja'); document.body.style.removeProperty('--alto-barra');
    $('#controles [data-accion="todo"]').setAttribute('aria-label', 'Ver toda la oficina');
  }
  // Escape: primero la vista de frente o la tarjeta, después el recorrido (y recién entonces se sale de la sala)
  function escapePropia() {
    if (propia.frente) { cerrarFrente(); return true; }
    if (propia.tarjeta) { cerrarTarjeta(); return true; }
    if (propia.recorrido) { terminarRecorrido(); return true; }
    return false;
  }
  function acomodarPropia() {
    // Con el menú cerrado (en escritorio) su botón queda arriba a la izquierda: «Volver a la calle» se corre a su lado
    var marco = $('#sala-marco'), rm = marco.getBoundingClientRect(), izq = 16, rt = $('#recorrer-toggle').getBoundingClientRect();
    if (window.innerWidth >= 900 && menu.classList.contains('cerrado') && rt.width) izq = Math.max(16, Math.round(rt.right - rm.left + 10));
    marco.style.setProperty('--volver-izq', izq + 'px');
    // En escritorio la barra (al centro) no llega a los controles de la cámara, abajo a la derecha; en celular van encima
    var rc = $('#controles').getBoundingClientRect();
    barraSala.style.maxWidth = window.innerWidth >= 900 && rc.width ? Math.max(300, Math.floor(2 * (rc.left - 14 - (rm.left + rm.width / 2)))) + 'px' : '';
    document.body.style.setProperty('--alto-barra', (barraSala.hidden ? 0 : barraSala.offsetHeight) + 'px');
    if (propia.tarjeta) { tarjeta.classList.toggle('hoja', hojaSala()); document.body.classList.toggle('sala-hoja', hojaSala()); }
    aplicarSala();
  }

  // ── La cámara de la sala (en coordenadas del dibujo, como la de la oficina) ──
  function tamSala() { return { w: salaCaja.clientWidth, h: salaCaja.clientHeight }; }
  // El área libre: sin los botones de arriba ni la barra de abajo
  function libreSala() {
    var t = tamSala(), abajo = barraSala.hidden ? 16 : t.h - barraSala.offsetTop + 14;
    return { x0: 12, y0: 70, x1: t.w - 12, y1: Math.max(140, t.h - abajo) };
  }
  // Hasta dónde llega una tarjeta por la derecha: en escritorio, hasta los controles de la cámara
  function derSala() {
    var t = tamSala(); if (window.innerWidth < 900) return t.w - 16;
    var rc = $('#controles').getBoundingClientRect(), rk = salaCaja.getBoundingClientRect();
    return rc.width ? Math.min(t.w - 16, rc.left - rk.left - 12) : t.w - 76;
  }
  function ajusteSala() { var l = libreSala(), vb = propia.vb; return Math.min((l.x1 - l.x0) / vb[2], (l.y1 - l.y0) / vb[3]); }
  function limitesSala() { var a = ajusteSala(); return [a * 0.8, Math.max(2.4, a * 6)]; }
  function aplicarSala() {
    if (!propia) return;
    var t = tamSala(); if (!t.w || !t.h) return;
    var c = propia.cam, lz = limitesSala(), vb = propia.vb;
    c.z = Math.max(lz[0], Math.min(lz[1], c.z));
    // El centro no se aleja de la sala (con un margen, para dejar una zona al lado de su tarjeta)
    c.x = Math.max(vb[0] - vb[2] * 0.25, Math.min(vb[0] + vb[2] * 1.25, c.x)); c.y = Math.max(vb[1] - vb[3] * 0.25, Math.min(vb[1] + vb[3] * 1.25, c.y));
    var w = t.w / c.z, h = t.h / c.z;
    propia.svg.setAttribute('viewBox', [c.x - w / 2, c.y - h / 2, w, h].map(function (n) { return Math.round(n * 100) / 100; }).join(' '));
    reubicarSala();
  }
  // Centro de cámara que deja el punto (px, py) del dibujo al medio del área libre l
  function centroSala(px, py, z, l) { var t = tamSala(); l = l || libreSala(); return { x: px - ((l.x0 + l.x1) / 2 - t.w / 2) / z, y: py - ((l.y0 + l.y1) / 2 - t.h / 2) / z }; }
  // Lleva la cámara a { x, y, z } (su centro y su acercamiento), con una curva suave; sin animación, al tiro
  function camaraA(c, dur, fin) {
    var yo = propia, cam = yo.cam, desde = { x: cam.x, y: cam.y, z: cam.z }, t0 = performance.now();
    if (yo.vuelo) { cancelAnimationFrame(yo.vuelo); yo.vuelo = null; }
    if (reducido || !dur) { cam.x = c.x; cam.y = c.y; cam.z = c.z; aplicarSala(); if (fin) fin(); return; }
    (function cuadro(t) {
      if (propia !== yo) return;
      var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      cam.z = Math.exp(Math.log(desde.z) + (Math.log(c.z) - Math.log(desde.z)) * e);
      cam.x = desde.x + (c.x - desde.x) * e; cam.y = desde.y + (c.y - desde.y) * e;
      aplicarSala();
      if (k < 1) yo.vuelo = requestAnimationFrame(cuadro); else { yo.vuelo = null; if (fin) fin(); }
    })(t0);
  }
  function volarSala(px, py, z, dur, fin, l) { var c = centroSala(px, py, z, l); camaraA({ x: c.x, y: c.y, z: z }, dur, fin); }
  // Encuadra un rectángulo del dibujo [x0, y0, x1, y1] en el área libre (o en o.libre), con aire alrededor
  function encuadrarSala(caja, dur, o) {
    o = o || {};
    var l = o.libre || libreSala(), lz = limitesSala(), aire = o.aire || 0.84;
    var z = Math.min((l.x1 - l.x0) * aire / Math.max(40, caja[2] - caja[0]), (l.y1 - l.y0) * aire / Math.max(40, caja[3] - caja[1]), o.zMax || 2.2);
    volarSala((caja[0] + caja[2]) / 2, (caja[1] + caja[3]) / 2, Math.max(lz[0], Math.min(lz[1], z)), dur, o.fin, l);
  }
  function verSalaEntera(dur) { var vb = propia.vb; encuadrarSala([vb[0], vb[1], vb[0] + vb[2], vb[1] + vb[3]], dur, { aire: 1 }); }
  // Se entra viendo la sala entera; en celular, la entrada de cerca
  function encuadreInicialSala() {
    var e = propia.S.lugares && propia.S.lugares.entrada;
    if (hojaSala() && e) encuadrarSala([e[0] - 230, e[1] - 190, e[0] + 230, e[1] + 110], 0, { aire: 1 });
    else verSalaEntera(0);
  }
  function zoomSala(clx, cly, factor) {
    var r = salaCaja.getBoundingClientRect(), c = propia.cam, lz = limitesSala(), z2 = Math.max(lz[0], Math.min(lz[1], c.z * factor));
    if (propia.vuelo) { cancelAnimationFrame(propia.vuelo); propia.vuelo = null; }
    var wx = c.x + (clx - r.left - r.width / 2) / c.z, wy = c.y + (cly - r.top - r.height / 2) / c.z;
    c.z = z2; c.x = wx - (clx - r.left - r.width / 2) / z2; c.y = wy - (cly - r.top - r.height / 2) / z2;
    aplicarSala();
  }
  function zoomSalaCentro(factor) { var r = salaCaja.getBoundingClientRect(); zoomSala(r.left + r.width / 2, r.top + r.height / 2, factor); }
  // Del dibujo a la caja de la sala (px) y de la pantalla al dibujo
  function aCaja(px, py) { var vb = propia.svg.viewBox.baseVal, t = tamSala(); return [(px - vb.x) * t.w / vb.width, (py - vb.y) * t.h / vb.height]; }
  function aDibujoSala(clx, cly) { var r = salaCaja.getBoundingClientRect(), vb = propia.svg.viewBox.baseVal; return [vb.x + (clx - r.left) * vb.width / r.width, vb.y + (cly - r.top) * vb.height / r.height]; }
  // Una caja del dibujo que junta varias zonas
  function cajaDe(ids) {
    var c = null;
    ids.forEach(function (id) { var z = propia.zonas[id]; if (!z) return; var b = z.z.caja; c = c ? [Math.min(c[0], b[0]), Math.min(c[1], b[1]), Math.max(c[2], b[2]), Math.max(c[3], b[3])] : b.slice(); });
    return c;
  }

  // ── Qué hay bajo el dedo: la gente que habla manda sobre las zonas; entre zonas, la de adelante ──
  function posQuien(id) {
    var g = propia.S.gente && propia.S.gente[id]; if (!g) return null;
    var w = vivaSala && vivaSala.gente.filter(function (q) { return q.c.id === id; })[0];
    if (w) { var p = window.Escena.P(w.x, w.y, 0); return [p[0], p[1], g[2]]; }
    return g;
  }
  function quienEn(px, py) {
    var mejor = null, pie = -Infinity;
    propia.hablan.forEach(function (b) {
      var p = posQuien(b.quien); if (!p) return;
      var w = Math.max(26, p[2] * 0.46);
      if (px >= p[0] - w / 2 && px <= p[0] + w / 2 && py >= p[1] - p[2] && py <= p[1] + 6 && p[1] > pie) { mejor = b; pie = p[1]; }
    });
    return mejor;
  }
  function dentroDe(x, y, pts) {
    var c = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) { var a = pts[i], b = pts[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; }
    return c;
  }
  function zonaEn(px, py) {
    var mejor = null;
    Object.keys(propia.zonas).forEach(function (id) { var z = propia.zonas[id]; if (z.d && dentroDe(px, py, z.pts) && (!mejor || z.z.prof > mejor.z.prof)) mejor = z; });
    return mejor;
  }

  // ── Lo que se ilumina: el contorno punteado dorado, con su brillo, y el nombre de la zona ──
  function resaltarZona(id, extras) {
    if (!propia) return;
    var g = propia.svg.querySelector('.sala-resalte'), s = '';
    propia.resalte = id || null;
    [id].concat(extras || []).forEach(function (zid) {
      var z = zid && propia.zonas[zid]; if (!z) return;
      z.z.suelo.forEach(function (p) { s += '<polygon class="resalte-brillo" points="' + p + '"/><polygon class="resalte-linea" points="' + p + '"/>'; });
    });
    g.innerHTML = s;
    var et = capaSala.querySelector('.sala-etiqueta'), z0 = id && propia.zonas[id];
    if (et) { et.hidden = !(z0 && z0.d); if (z0 && z0.d) et.textContent = z0.d.nombre; }
    ubicarEtiqueta();
  }
  function ubicarEtiqueta() {
    var et = capaSala.querySelector('.sala-etiqueta'), l = propia.resalte && propia.S.lugares && propia.S.lugares[propia.resalte];
    if (!et || et.hidden || !l) return;
    var a = aCaja(l[0], l[1]);
    et.style.transform = 'translate(' + Math.round(a[0]) + 'px,' + Math.round(a[1]) + 'px) translate(-50%, -50%)';
    // Si alguien habla encima del nombre, manda lo que dice (el nombre vuelve cuando se calla)
    var r = et.getBoundingClientRect();
    et.classList.toggle('tapada', propia.burbujas.some(function (x) { var q = x.el.getBoundingClientRect(); return r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom; }));
  }
  // Un anillo dorado bajo los pies de quien se toca o se elige
  function anillo(id) { if (!propia) return; propia.anillo = id || null; ubicarAnillo(); }
  function ubicarAnillo() {
    var g = propia.svg.querySelector('.sala-anillo'), p = propia.anillo && posQuien(propia.anillo);
    g.innerHTML = p ? '<ellipse class="anillo-quien" cx="' + Math.round(p[0]) + '" cy="' + Math.round(p[1]) + '" rx="' + Math.round(p[2] * 0.3) + '" ry="' + Math.round(p[2] * 0.12) + '"/>' : '';
  }
  function marcarZona(id, si) { var g = id && propia.svg.querySelector('.zona-sala[data-zona="' + id + '"]'); if (g) g.setAttribute('aria-expanded', si ? 'true' : 'false'); }
  function anunciar(t) { avisoSala.textContent = ''; setTimeout(function () { avisoSala.textContent = t; }, 40); }

  // ── La gente habla: una burbuja sobre la cabeza, que sigue a quien camina ──
  function burbujaDe(id) { return propia.hablan.filter(function (b) { return b.quien === id; })[0]; }
  // o: { sola (turno automático), foco (hasta que se va el foco), fija (el recorrido), guia, dura, anunciar }
  function hablarSala(b, o) {
    o = o || {};
    var ya = propia.burbujas.filter(function (x) { return x.quien === b.quien; })[0];
    if (ya) {
      // Ya lo está diciendo: se alarga (y deja de ser «sola» si alguien la eligió)
      if (ya.texto === b.texto) {
        ya.sola = ya.sola && !!o.sola; ya.foco = ya.foco || !!o.foco; ya.fija = ya.fija || !!o.fija;
        ya.hasta = ya.fija || ya.foco ? Infinity : Math.max(ya.hasta, performance.now() + (o.dura || 6000));
        if (o.anunciar) anunciar((b.nombre ? b.nombre + ': ' : '') + b.texto);
        return ya;
      }
      callarSala(ya, true);
    }
    var el = document.createElement('div');
    el.className = 'burbuja' + (b.biplot ? ' bp' : '') + (o.guia ? ' de-guia' : '') + (!b.rol && b.texto.length < 24 ? ' corta' : '');
    el.innerHTML = (b.rol ? '<small>' + esc(b.rol) + '</small>' : '') + '<span>' + esc(b.texto) + '</span>';
    capaSala.appendChild(el);
    var x = { quien: b.quien, texto: b.texto, el: el, sola: !!o.sola, fija: !!o.fija, foco: !!o.foco, hasta: o.fija || o.foco ? Infinity : performance.now() + (o.dura || 6000) };
    propia.burbujas.push(x);
    ubicarBurbuja(x);
    if (reducido) el.classList.add('visible'); else requestAnimationFrame(function () { el.classList.add('visible'); });
    if (o.anunciar) anunciar((b.nombre ? b.nombre + ': ' : '') + b.texto);
    pedirLatido();
    return x;
  }
  function callarSala(x, ya) {
    var i = propia.burbujas.indexOf(x); if (i > -1) propia.burbujas.splice(i, 1);
    if (ya || reducido) { x.el.remove(); return; }
    x.el.classList.remove('visible'); setTimeout(function () { x.el.remove(); }, 420);
  }
  function callarSolas() { if (propia) propia.burbujas.slice().forEach(function (x) { if (x.sola) callarSala(x); }); }
  function callarDe(id, soloFoco) { propia.burbujas.slice().forEach(function (x) { if (x.quien === id && (!soloFoco || x.foco)) callarSala(x); }); }
  function ubicarBurbuja(x) {
    var p = posQuien(x.quien); if (!p) return;
    var a = aCaja(p[0], p[1] - p[2] + 4), t = tamSala(), el = x.el, w = el.offsetWidth, h = el.offsetHeight;
    var izq = Math.max(8, Math.min(t.w - w - 8, a[0] - w / 2)), arr = a[1] - h - 12, alta = arr < 8;
    if (alta) arr = 8;
    el.style.transform = 'translate(' + Math.round(izq) + 'px,' + Math.round(arr) + 'px)';
    el.style.setProperty('--cola', Math.round(Math.max(16, Math.min(w - 16, a[0] - izq))) + 'px');
    el.classList.toggle('sin-cola', alta);
    el.classList.toggle('fuera', a[0] < -20 || a[0] > t.w + 20 || a[1] < -20 || a[1] > t.h + 60);
  }
  // Mientras hay burbujas, cada cuadro las acompaña (a quien camina y a la cámara) y apaga las que ya dijeron lo suyo
  function latirSala() {
    if (!propia) return;
    propia.latido = 0;
    var ahora = performance.now();
    propia.burbujas.slice().forEach(function (x) { if (ahora > x.hasta) callarSala(x); });
    reubicarSala();
    if (propia.burbujas.length) propia.latido = requestAnimationFrame(latirSala);
  }
  function pedirLatido() { if (propia && !propia.latido) propia.latido = requestAnimationFrame(latirSala); }
  function reubicarSala() {
    if (!propia) return;
    propia.burbujas.forEach(ubicarBurbuja);
    ubicarEtiqueta(); ubicarAnillo();
    if (propia.tarjeta && !tarjeta.classList.contains('hoja')) ubicarTarjeta();
  }
  // Cada tanto habla alguien que está a la vista: nunca más de dos a la vez, y nunca con la animación detenida
  function aLaVista(id) {
    var p = posQuien(id); if (!p) return false;
    var a = aCaja(p[0], p[1] - p[2]), l = libreSala();
    return a[0] > l.x0 + 40 && a[0] < l.x1 - 40 && a[1] > l.y0 + 70 && a[1] < l.y1 - 20;
  }
  function seTapan(x) {
    var r = x.el.getBoundingClientRect();
    return propia.burbujas.some(function (y) { if (y === x) return false; var q = y.el.getBoundingClientRect(); return r.left < q.right + 6 && q.left < r.right + 6 && r.top < q.bottom + 6 && q.top < r.bottom + 6; });
  }
  function turnoBurbujas() {
    if (!propia) return;
    propia.reloj = setTimeout(turnoBurbujas, 3400);
    if (reducido || quieta() || document.hidden || propia.tarjeta || propia.frente || propia.recorrido || propia.burbujas.length >= 2) return;
    var n = propia.hablan.length;
    for (var k = 0; k < n; k++) {
      var b = propia.hablan[(propia.turno + k) % n];
      if (propia.burbujas.some(function (x) { return x.quien === b.quien; }) || !aLaVista(b.quien)) continue;
      var x = hablarSala(b, { sola: true, dura: 5600 });
      if (seTapan(x)) { callarSala(x, true); continue; }
      // Cada frase se anuncia una vez por visita (después sólo se ve)
      if (!dichas[b.quien]) { dichas[b.quien] = true; anunciar((b.nombre ? b.nombre + ': ' : '') + b.texto); }
      propia.turno = (propia.turno + k + 1) % n;
      return;
    }
  }

  // ── Las tarjetas: junto a lo que se tocó (en celular, una hoja desde abajo) ──
  var CERRAR_T = '<button type="button" class="tarjeta-cerrar" aria-label="Cerrar"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></span></button>';
  function nombreModulo(t) { return String(t).replace(/^\s*\d+\s*·\s*/, ''); }
  function whatsappPropia() { var PP = propia.P; return 'https://wa.me/' + String(PP.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(PP.mensaje || ''); }
  // Los botones de la empresa (negro y dorado): diseñar (el cotizador), recorrer con una asesora y, si hay WhatsApp de la
  // empresa, hablar con una asesora. Nunca el WhatsApp de BiPlot en la sala de una empresa: sólo en la de BiPlot (el museo),
  // con { cta: true }. Los que son objetos llevan a otra parte: { sala } a la sala de ese caso, { zona } a otra tarjeta de la
  // sala, { hq } a BiPlot HQ, { url } a otra página (en otra pestaña), { chat } a la conversación con Plotty y { tele }
  // prende la tele de BiPlot.TV.
  function botonesPropia(lista) {
    var PP = propia.P, h = '', conTele = lista.some(function (b) { return b && b.tele; });
    lista.forEach(function (b) {
      if (b === 'disenar' && PP.disenar) h += '<a class="sp-btn negro" href="' + esc(PP.disenar.url) + '" target="_blank" rel="noopener">' + esc(PP.disenar.texto) + '<span class="sr"> (se abre en otra pestaña)</span></a>';
      // (sin cotizador ni tele, como en el museo, el recorrido es el botón principal)
      if (b === 'recorrer' && (PP.recorrido || []).length) h += '<button type="button" class="sp-btn ' + (PP.disenar || conTele ? 'borde' : 'negro') + '" data-recorrer="1">' + esc(textoPropia('recorrer', 'Recorrer con una asesora')) + '</button>';
      if (b === 'hablar' && PP.whatsapp) h += '<a class="sp-btn borde" href="' + esc(whatsappPropia()) + '" target="_blank" rel="noopener">' + esc(textoPropia('hablar', 'Hablar con una asesora')) + '<span class="sr"> (se abre WhatsApp en otra pestaña)</span></a>';
      if (!b || typeof b !== 'object') return;
      if (b.sala && salaDe(b.sala)) h += '<button type="button" class="sp-btn negro" data-sala-ir="' + esc(b.sala) + '">' + esc(b.texto || 'Entrar a su sala') + '</button>';
      if (b.zona) h += '<button type="button" class="sp-btn borde" data-zona-ir="' + esc(b.zona) + '">' + esc(b.texto) + '</button>';
      if (b.hq) h += '<button type="button" class="sp-btn negro" data-hq="1">' + esc(b.texto || 'Pasar a BiPlot HQ') + '</button>';
      if (b.url) h += '<a class="sp-btn borde" href="' + esc(b.url) + '" target="_blank" rel="noopener">' + esc(b.texto) + '<span class="sr"> (se abre en otra pestaña)</span></a>';
      if (b.cta) h += '<a class="bp-cta" href="' + esc(whatsapp(esVentas(propia.id) ? 'Hola BiPlot, vengo de la sala de ventas de la oficina y quiero agendar un diagnóstico.' : 'Hola BiPlot, vi ' + propia.pr.nombre + ' en la oficina y quiero agendar un diagnóstico.')) + '" target="_blank" rel="noopener">Agenda tu diagnóstico<span class="sr"> (se abre WhatsApp en otra pestaña)</span></a>';
      if (b.chat) h += '<button type="button" class="sp-btn borde" data-abrir="chat:plotty">' + esc(b.texto || 'Conversar con Plotty') + '</button>';
      if (b.tele) h += '<button type="button" class="sp-btn negro" data-tele-prender="1">' + esc(b.texto || 'Prender la tele') + '</button>';
    });
    return h;
  }
  function htmlBarraPropia() {
    var PP = propia.P, m = PP.marca || {};
    return '<p class="sp-marca"><span class="sp-logo" aria-hidden="true">' + esc(m.nombre || propia.pr.cliente) + '</span>' + (m.sub ? '<span class="sp-sub" aria-hidden="true">' + esc(m.sub) + '</span>' : '') +
      '<span class="sr">' + esc(propia.pr.cliente + (m.sub ? ', ' + m.sub : '')) + '</span></p><span class="sp-sep" aria-hidden="true"></span>' +
      (m.texto ? '<p class="sp-txt">' + esc(m.texto) + '</p>' : '') + '<div class="sp-acciones">' + botonesPropia(PP.barra || ['disenar', 'recorrer', 'hablar']) + '</div>';
  }
  // Lo que puede traer además una tarjeta del museo: las diez fases con quién lleva cada una, una línea de tiempo y el fichero
  // Las diez fases del motor, con quién lleva cada una; con atlas, además Atlas, que no tiene una fase: ve las diez a la vez
  function htmlFases(atlas) {
    var A = atlas && PERSONAL.atlas;
    return '<ol class="tarjeta-fases">' + D.fases.map(function (f) {
      var nombres = f.quien.map(function (q) { return PERSONAL[q].nombre; }).join(' y ');
      return '<li><span class="cod">' + esc(f.id) + '</span><b>' + esc(f.nombre) + '</b><span class="quien" aria-label="' + esc(nombres) + '" role="img">' + f.quien.map(function (q) { return avatar(q); }).join('') + '</span></li>';
    }).join('') + (A ? '<li class="fase-360"><span class="cod">' + esc(A.placa) + '</span><b>' + esc(A.nombre) + ' ve las diez a la vez</b><span class="quien" aria-label="' + esc(A.nombre) + '" role="img">' + avatar('atlas') + '</span></li>' : '') + '</ol>';
  }
  function htmlHitos(h) {
    return '<ol class="tarjeta-fases tarjeta-hitos">' + h.map(function (x) { return '<li><span class="cod">' + esc(x[0]) + '</span><b>' + esc(x[1]) + '<span>' + esc(x[2] || '') + '</span></b></li>'; }).join('') + '</ol>';
  }
  // Una foto que se abre en grande (y completa) al tocarla
  var ICONO_VER = '<span class="ver-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></span>';
  function botonFoto(src, alt, dato) {
    return '<button type="button" class="ver-foto" ' + dato + ' aria-label="' + esc('Ver en grande: ' + alt) + '"><img src="' + esc(src) + '" alt="" width="1280" height="720">' + ICONO_VER + '</button>';
  }
  function htmlTarjetaZona(d) {
    // La imagen es de la sala o, en el museo, del caso de esa pieza (con su nombre y su módulo)
    var pr = (d.caso && salaDe(d.caso)) || propia.pr, pin = d.imagen && (pr.pines || []).filter(function (p) { return p[3] === d.imagen; })[0];
    return CERRAR_T + '<div class="tarjeta-cuerpo"><p class="ceja">' + esc(d.ceja || d.nombre) + '</p><h3 id="sala-tarjeta-t" tabindex="-1">' + esc(d.titulo) + '</h3>' +
      (d.imagen ? '<figure class="tarjeta-img">' + botonFoto(MEDIOS + d.imagen + '.webp', pr.nombre + (pin ? ', ' + nombreModulo(pin[0]) + ': ' + pin[1] : ''), 'data-ver-foto') +
        '<figcaption>' + esc(piePantalla(pr, d.imagen)) + '</figcaption></figure>' : '') +
      (d.video ? htmlVideoZona(d) : '') +
      (d.texto ? '<p>' + esc(d.texto) + '</p>' : '') +
      (d.chips && d.chips.length ? '<ul class="tarjeta-chips">' + d.chips.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') +
      (d.fases ? htmlFases(d.atlas) : '') + (d.hitos ? htmlHitos(d.hitos) : '') + (d.fichero ? '<div class="tarjeta-fichero">' + htmlFichero('h4', true) + '</div>' : '') +
      (d.programas ? '<div class="tarjeta-programas">' + htmlProgramas(programasTv(), true) + '</div>' : '') +
      (d.enlace || (d.botones && d.botones.length) ? '<div class="tarjeta-botones">' + (d.enlace ? '<a class="sp-btn negro" href="' + esc(d.enlace.url) + '" target="_blank" rel="noopener">' +
        esc(d.enlace.texto) + '<span class="sr"> (se abre en otra pestaña)</span></a>' : '') + botonesPropia(d.botones || []) + '</div>' : '') + '</div>';
  }
  // La tarjeta de BiPlot, en su rincón: todo lo que hicimos (lo mismo que el panel de las demás salas)
  function htmlTarjetaBiplot(pr) {
    var pines = pr.pines || [];
    return CERRAR_T + '<div class="tarjeta-cuerpo"><p class="ceja">' + esc((pr.salaPropia && pr.salaPropia.cejaBiplot) || 'Hecho con BiPlot') + '</p>' +
      '<h3 id="sala-tarjeta-t" tabindex="-1">' + esc(pr.nombre) + ' <span class="chip">' + esc(pr.corto || pr.estado) + '</span></h3>' +
      '<p class="tarjeta-sub">' + esc(pr.cliente) + ' · ' + esc(pr.rubro) + '</p><p>' + esc(pr.resumen) + '</p>' +
      '<div class="tarjeta-botones"><button type="button" class="bp-btn primario" data-hq="1"><span class="ico" aria-hidden="true">' + icono('entrar') + '</span>Pasar a BiPlot HQ</button></div>' +
      (pines.length ? '<section class="tarjeta-bloque" style="--acento:#17C3B2"><h4>Lo que construimos</h4><div class="visor" aria-live="polite"></div>' +
        '<div class="tira-bp" role="group" aria-label="' + esc('Pantallas de ' + pr.nombre) + '">' + pines.map(function (p, i) {
          return '<button type="button" data-pantalla="' + i + '" aria-pressed="false">' + (p[3] ? '<img src="' + MEDIOS + esc(p[3]) + '.webp" alt="" loading="lazy" width="160" height="90">' : '') + '<span>' + esc(nombreModulo(p[0])) + '</span></button>';
        }).join('') + '</div>' + (pr.nota ? '<p class="nota">' + esc(pr.nota) + '</p>' : '') + '</section>' : '') +
      (pr.media ? '<section class="tarjeta-bloque"><h4>Míralo funcionar</h4>' + htmlMedia(pr) + '</section>' : '') +
      '<section class="tarjeta-bloque"><h4>Lo que resolvimos</h4><ul class="puntos">' + pr.puntos.map(function (x) { return '<li><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</li>'; }).join('') + '</ul></section>' +
      (pr.enlaces.length ? '<section class="tarjeta-bloque"><h4>Visítalos</h4>' + pr.enlaces.map(function (l) {
        return '<a class="sala-enlace" style="--acento:#17C3B2" href="' + esc(l.url) + '" target="_blank" rel="noopener"><span>' + esc(l.texto) + '<small>' + esc(l.url.replace(/^https?:\/\//, '')) + '</small></span><span class="ico" aria-hidden="true">' + icono('afuera') + '</span><span class="sr">(se abre en otra pestaña)</span></a>';
      }).join('') + '</section>' : '') +
      '<section class="tarjeta-bloque"><h4>El equipo que lo hizo</h4>' + chipsEquipo(pr.equipo) + '</section>' +
      '<section class="tarjeta-bloque"><h4>Resultados</h4><ol class="medicion"><li><b>Día 30</b><span>Pendiente</span></li><li><b>Día 60</b><span>Pendiente</span></li><li><b>Día 90</b><span>Pendiente</span></li></ol><p class="nota">' + esc(pr.medicion || '') + '</p></section>' +
      '<section class="tarjeta-bloque sala-comparte"><h4>Comparte esta sala</h4><div class="enlace-copia"><code>' + esc(urlSala(pr.id).replace(/^https:\/\/|\/$/g, '')) + '</code><button type="button" class="copiar" data-url="' + esc(urlSala(pr.id)) + '">Copiar</button></div>' +
      (navigator.share ? '<button type="button" class="bp-btn compartir" data-url="' + esc(urlSala(pr.id)) + '"><span class="ico" aria-hidden="true">' + icono('compartir') + '</span>Compartir</button>' : '') +
      '<p class="nota">Abre la oficina directo en esta sala, y al pegarlo en un chat se ve su imagen.</p></section>' +
      '<div class="sala-final"><p>¿Tu negocio se parece a este?</p><div class="acciones"><a class="bp-cta" href="' + whatsapp('Hola BiPlot, vi la sala de ' + pr.nombre + ' en la oficina y quiero agendar un diagnóstico.') + '" target="_blank" rel="noopener">Agenda tu diagnóstico<span class="sr"> (se abre WhatsApp en otra pestaña)</span></a>' + botonChat() + '</div></div></div>';
  }
  // Una pantalla real de la tira de la tarjeta de BiPlot
  function elegirPantalla(i) {
    var pr = propia.pr, p = (pr.pines || [])[i], v = tarjeta.querySelector('.visor'); if (!p || !v) return;
    v.innerHTML = (p[3] ? botonFoto(MEDIOS + p[3] + '.webp', pr.nombre + ', ' + nombreModulo(p[0]) + ': ' + p[1], 'data-ver-pantalla="' + i + '"') : '') +
      '<div class="visor-txt"><span class="mod">' + esc(nombreModulo(p[0])) + '</span><b>' + esc(p[1]) + '</b><span>' + esc(p[2]) + '</span></div>';
    tarjeta.querySelectorAll('[data-pantalla]').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-pantalla') === i ? 'true' : 'false'); });
  }
  function abrirTarjeta(id, o) {
    o = o || {};
    var z = propia && propia.zonas[id]; if (!z || !z.d) return;
    // Lo que es una imagen se abre de frente
    if (z.z.frente) { abrirFrente(id, o); return; }
    if (propia.frente) cerrarFrente(true);
    if (propia.recorrido) terminarRecorrido(true);
    var antes = propia.tarjeta, c0 = propia.cam;
    if (antes) { detenerMedios(tarjeta); marcarZona(antes, false); }
    // (al cerrarla, la cámara vuelve a donde estaba, si nadie la movió a mano mientras tanto)
    else { propia.origen = o.desde || document.activeElement; propia.volver = { x: c0.x, y: c0.y, z: c0.z }; propia.aMano = false; }
    propia.tarjeta = id;
    callarSolas(); anillo(null);
    var hoja = hojaSala(), d = z.d;
    tarjeta.className = 'sala-tarjeta ' + (d.biplot ? 'bp' : 'empresa') + (hoja ? ' hoja' : '');
    tarjeta.innerHTML = d.biplot ? htmlTarjetaBiplot(propia.pr) : htmlTarjetaZona(d);
    if (d.fichero) iniciarArchivo(tarjeta);
    tarjeta.hidden = false;
    document.body.classList.toggle('sala-hoja', hoja);
    marcarZona(id, true);
    resaltarZona(id);
    if (d.biplot) { elegirPantalla(0); activarMedios(tarjeta); }
    else if (d.video) activarMedios(tarjeta);
    // La cámara deja la zona al lado de la tarjeta (en celular, arriba de la hoja); la tarjeta aparece al llegar
    var l = libreSala(), t = tamSala();
    if (hoja) l.y1 = Math.max(l.y0 + 120, t.h - tarjeta.offsetHeight - 10);
    else l.x1 = Math.max(l.x0 + 160, derSala() - tarjeta.offsetWidth - 40);
    ubicarTarjeta();
    encuadrarSala(z.z.caja, 650, { libre: l, zMax: hoja ? 1.6 : 2.0, aire: 0.8, fin: function () { if (propia && propia.tarjeta === id) { ubicarTarjeta(); tarjeta.classList.add('visible'); } } });
    var h = tarjeta.querySelector('#sala-tarjeta-t'); if (h) h.focus({ preventScroll: true });
  }
  function ubicarTarjeta() {
    if (!propia || !propia.tarjeta || tarjeta.classList.contains('hoja')) { tarjeta.style.transform = ''; tarjeta.style.maxHeight = ''; return; }
    var c = propia.zonas[propia.tarjeta].z.caja, a = aCaja(c[0], c[1]), b = aCaja(c[2], c[3]), l = libreSala();
    // Entre los botones de arriba y la barra de abajo (si no cabe, se desplaza por dentro)
    tarjeta.style.maxHeight = Math.max(220, l.y1 - 72) + 'px';
    var cw = tarjeta.offsetWidth, ch = tarjeta.offsetHeight, der = derSala();
    var x = b[0] + 24; if (x + cw > der) x = a[0] - 24 - cw;
    x = Math.max(16, Math.min(der - cw, x));
    var y = Math.max(72, Math.min(l.y1 - ch, (a[1] + b[1]) / 2 - ch / 2));
    tarjeta.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  }
  function cerrarTarjeta(sinFoco) {
    if (!propia || !propia.tarjeta) return false;
    var id = propia.tarjeta, o = propia.origen, v = propia.volver;
    propia.tarjeta = null; propia.origen = null; propia.volver = null;
    detenerMedios(tarjeta);
    tarjeta.hidden = true; tarjeta.classList.remove('visible', 'hoja'); tarjeta.innerHTML = ''; tarjeta.style.transform = '';
    document.body.classList.remove('sala-hoja');
    marcarZona(id, false);
    resaltarZona(null);
    // La cámara vuelve a como estaba antes de la tarjeta (si nadie la movió a mano)
    if (v && !propia.aMano) camaraA(v, 550);
    if (!sinFoco) { if (o && o !== document.body && salaEl.contains(o)) o.focus({ preventScroll: true }); else salaCaja.focus({ preventScroll: true }); }
    return true;
  }
  // Lo que hacen los botones de una tarjeta (y de la vista de frente)
  function accionSala(b, e) {
    if (b.hasAttribute('data-recorrer')) { e.preventDefault(); iniciarRecorrido(0); return; }
    if (b.hasAttribute('data-pantalla')) { elegirPantalla(+b.getAttribute('data-pantalla')); return; }
    if (b.hasAttribute('data-ver-foto')) { e.preventDefault(); verFoto(propia.frente || propia.tarjeta); return; }
    if (b.hasAttribute('data-ver-pantalla')) { e.preventDefault(); verPantalla(+b.getAttribute('data-ver-pantalla')); return; }
    if (b.hasAttribute('data-hq')) { e.preventDefault(); entrarOficina({ boton: $('#recorrer-toggle') }); return; }
    if (b.hasAttribute('data-sala-ir')) { e.preventDefault(); entrarSala(b.getAttribute('data-sala-ir'), { directo: true }); return; }
    if (b.hasAttribute('data-zona-ir')) { e.preventDefault(); abrirTarjeta(b.getAttribute('data-zona-ir'), { desde: b }); return; }
    if (b.hasAttribute('data-abrir')) { e.preventDefault(); var v = b.getAttribute('data-abrir').split(':'); abrir({ tipo: v[0], id: v[1] }, false, $('#recorrer-toggle')); return; }
    if (b.hasAttribute('data-grande')) { e.preventDefault(); abrirTele(b.getAttribute('data-grande'), b); return; }
    if (b.hasAttribute('data-tele-prender')) { e.preventDefault(); abrirTele(null, b); return; }
    if (b.classList.contains('copiar')) { copiar(b); return; }
    if (b.classList.contains('compartir')) compartir(b);
  }
  tarjeta.addEventListener('click', function (e) {
    var b = e.target.closest('button, a'); if (!b || !propia) return;
    if (b.classList.contains('tarjeta-cerrar')) { cerrarTarjeta(); return; }
    accionSala(b, e);
  });

  // ── La vista de frente: lo que es una imagen (un mural, una pizarra, un cartel, una pantalla) se abre derecho y en
  // grande, con la sala oscurecida detrás; debajo (al lado, si la imagen es angosta) va lo que cuenta su tarjeta ──
  var CERRAR_F = '<button type="button" class="frente-cerrar" data-frente-cerrar aria-label="Cerrar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  // El texto alternativo de una pantalla real: el caso, su módulo y lo que muestra (como en la tarjeta)
  function altPantalla(pr, img) {
    var pin = img && (pr.pines || []).filter(function (p) { return p[3] === img; })[0];
    return pr.nombre + (pin ? ', ' + nombreModulo(pin[0]) + ': ' + pin[1] : '');
  }
  // (su pie: de qué sala y de qué módulo es, con datos de ejemplo)
  function piePantalla(pr, img) {
    var pin = img && (pr.pines || []).filter(function (p) { return p[3] === img; })[0];
    return pr.nombre + (pin ? ' · ' + nombreModulo(pin[0]) : '') + ' · datos de ejemplo';
  }
  // (la imagen va siempre completa: un cartel chico no se agranda más de 3,2 veces y lo muy apaisado, como la línea de tiempo,
  // en celular trae además sus fechas en texto, debajo. Una pantalla real lleva su pie; los botones van antes de la lista de fases)
  // Los botones de la vitrina en 3D: girarla a un lado o al otro y pausar su giro (también se arrastra)
  var MANDOS_3D = '<div class="v3d-mandos"><button type="button" data-v3d="izq" aria-label="Girar a la izquierda"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7H4V2"/><path d="M4.5 7A8 8 0 1 1 4 13"/></svg></button>' +
    '<button type="button" data-v3d="pausa" aria-pressed="false">Pausar el giro</button>' +
    '<button type="button" data-v3d="der" aria-label="Girar a la derecha"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 7h5V2"/><path d="M19.5 7A8 8 0 1 0 20 13"/></svg></button>' +
    '<span class="v3d-ayuda" aria-hidden="true">o arrástrala para girarla</span></div>';
  function htmlFrente(f, d, o) {
    o = o || {};
    var an = f.ancho || 1280, al = f.alto || 720, prop = an / al, nombre = d.titulo || d.nombre || '';
    var pr = (d.caso && salaDe(d.caso)) || propia.pr, pin = f.img && (pr.pines || []).filter(function (x) { return x[3] === f.img; })[0];
    var pie = f.pie || (pin ? pr.nombre + ' · ' + nombreModulo(pin[0]) + ' · datos de ejemplo' : '');
    var dib = f.modelo ? '<svg class="v3d" viewBox="' + f.modelo.vb.join(' ') + '" role="img" aria-label="' + esc((d.nombre || nombre) + ', en su vitrina, girando') + '"></svg>'
      : f.img ? '<img src="' + MEDIOS + esc(f.img) + '.webp" alt="' + esc(f.alt || altPantalla(pr, f.img)) + '" width="' + an + '" height="' + al + '">'
      : '<svg viewBox="0 0 ' + an + ' ' + al + '" role="img" aria-label="' + esc(d.nombre || nombre) + '">' + conMedios(f.svg) + '</svg>';
    var img = d.imagen && d.imagen !== f.img ? '<figure class="tarjeta-img">' + botonFoto(MEDIOS + d.imagen + '.webp', altPantalla(pr, d.imagen), 'data-ver-foto') +
      '<figcaption>' + esc(piePantalla(pr, d.imagen)) + '</figcaption></figure>' : '';
    return '<div class="frente-velo" data-frente-cerrar></div>' + CERRAR_F +
      '<div class="frente-caja' + (prop > 3 ? ' ancha' : prop < 2 ? ' lado' : '') + (f.modelo ? ' con-mandos' : '') + '" style="--frente-prop:' + prop.toFixed(3) + ';--frente-max:' + Math.round(an * 3.2) + 'px' +
      (f.fondo ? ';--frente-fondo:' + esc(f.fondo) : '') + '">' +
      '<figure class="frente-lamina"><div class="frente-marco' + (f.modelo ? ' v3d-marco' : '') + '">' + dib + '</div>' + (pie ? '<figcaption class="frente-pie">' + esc(pie) + '</figcaption>' : '') +
      (f.modelo ? MANDOS_3D : '') + '</figure>' +
      '<div class="frente-texto' + (img ? ' con-img' : '') + (o.bp ? ' bp' : '') + '"><div class="frente-cuerpo"><p class="ceja">' + esc(d.ceja || d.nombre || '') + '</p><h3 id="sala-frente-t" tabindex="-1">' + esc(nombre) + '</h3>' +
      (d.texto ? '<p>' + esc(d.texto) + '</p>' : '') +
      (d.chips && d.chips.length ? '<ul class="tarjeta-chips">' + d.chips.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') +
      (d.enlace || (d.botones && d.botones.length) ? '<div class="tarjeta-botones">' + (d.enlace ? '<a class="sp-btn negro" href="' + esc(d.enlace.url) + '" target="_blank" rel="noopener">' +
        esc(d.enlace.texto) + '<span class="sr"> (se abre en otra pestaña)</span></a>' : '') + botonesPropia(d.botones || []) + '</div>' : '') +
      (d.fases ? htmlFases(d.atlas) : '') + (d.hitos ? '<div class="frente-lista">' + htmlHitos(d.hitos) + '</div>' : '') + '</div>' + img + '</div></div>';
  }
  function abrirFrente(id, o) {
    o = o || {};
    var z = propia && propia.zonas[id], fr = o.frente || (z && z.z.frente); if (!z || !fr) return;
    // (el recorrido sigue detrás: al cerrarla se vuelve a la misma parada; si había una tarjeta, se cierra y el foco vuelve a lo que la abrió)
    var desde = o.desde || document.activeElement;
    if (propia.tarjeta) { if (propia.origen) desde = propia.origen; cerrarTarjeta(true); }
    if (propia.frente) marcarZona(propia.frente, false); else propia.origenFrente = desde;
    propia.frente = id; propia.frenteT = Date.now();
    callarSolas(); anillo(null);
    if (propia.giro) { propia.giro.detener(); propia.giro = null; }
    frenteEl.innerHTML = htmlFrente(fr, o.datos || z.d || {}, o);
    if (fr.modelo && window.Vitrina3D) {
      propia.giro = window.Vitrina3D.montar(frenteEl.querySelector('.v3d'), fr.modelo, { quieta: reducido || quieta(), medios: conMedios });
      if (propia.giro.pausada()) marcarGiro(true);
    }
    frenteEl.hidden = false;
    document.body.classList.add('con-frente');
    marcarZona(id, true); resaltarZona(id);
    requestAnimationFrame(function () { if (propia && propia.frente === id) frenteEl.classList.add('visible'); });
    var h = frenteEl.querySelector('#sala-frente-t'); if (h) h.focus({ preventScroll: true });
  }
  // La foto (pantalla real) de una tarjeta o de la vista de frente, en grande y completa, con los textos de su zona
  function verFoto(id) {
    var z = id && propia.zonas[id], d = z && z.d; if (!d || !d.imagen) return;
    abrirFrente(id, { frente: { img: d.imagen, ancho: 1280, alto: 720 } });
  }
  // Una pantalla del rincón de BiPlot, en grande: su módulo, lo que muestra y para qué
  function verPantalla(i) {
    var pr = propia.pr, p = (pr.pines || [])[i]; if (!p || !p[3] || !propia.tarjeta) return;
    abrirFrente(propia.tarjeta, { frente: { img: p[3], ancho: 1280, alto: 720, alt: pr.nombre + ', ' + nombreModulo(p[0]) + ': ' + p[1] },
      datos: { ceja: pr.nombre + ' · ' + nombreModulo(p[0]), titulo: p[1], texto: p[2] }, bp: true });
  }
  // El botón de pausa dice lo que hará
  function marcarGiro(pausado) {
    var b = frenteEl.querySelector('[data-v3d="pausa"]'); if (!b) return;
    b.setAttribute('aria-pressed', pausado ? 'true' : 'false'); b.textContent = pausado ? 'Seguir girando' : 'Pausar el giro';
  }
  function cerrarFrente(sinFoco) {
    if (!propia || !propia.frente) return false;
    var id = propia.frente, o = propia.origenFrente;
    if (propia.giro) { propia.giro.detener(); propia.giro = null; }
    propia.frente = null; propia.origenFrente = null;
    frenteEl.hidden = true; frenteEl.classList.remove('visible'); frenteEl.innerHTML = '';
    document.body.classList.remove('con-frente');
    marcarZona(id, false);
    // Lo marcado vuelve a ser lo de la parada del recorrido, si hay uno
    var r = propia.recorrido, p = r && r.i >= 0 && propia.P.recorrido[r.i];
    if (p) resaltarZona(p.zona, p.ver); else resaltarZona(null);
    if (!sinFoco) { if (o && o !== document.body && salaEl.contains(o)) o.focus({ preventScroll: true }); else salaCaja.focus({ preventScroll: true }); }
    return true;
  }
  frenteEl.addEventListener('click', function (e) {
    if (!propia || !propia.frente) return;
    // (en el celular, el clic que sigue al toque que la abrió no la cierra ni aprieta un botón)
    if (e.detail && Date.now() - propia.frenteT < 350) { e.preventDefault(); return; }
    if (e.target.closest('[data-frente-cerrar]')) { cerrarFrente(); return; }
    var b = e.target.closest('button, a'); if (!b) return;
    if (b.hasAttribute('data-ver-foto')) { verFoto(propia.frente); return; }
    if (b.hasAttribute('data-v3d')) {
      var g = propia.giro, a = b.getAttribute('data-v3d'); if (!g) return;
      if (a === 'pausa') { g.pausar(!g.pausada()); marcarGiro(g.pausada()); } else g.girar(a === 'izq' ? -Math.PI / 6 : Math.PI / 6);
      return;
    }
    // Lo que lleva a otra parte de la oficina cierra antes la vista de frente (lo que se abre en otra pestaña la deja)
    if (b.tagName === 'A' && b.target === '_blank') return;
    var o = propia.origenFrente;
    cerrarFrente(true);
    if (b.hasAttribute('data-zona-ir')) { e.preventDefault(); abrirTarjeta(b.getAttribute('data-zona-ir'), { desde: o }); return; }
    accionSala(b, e);
  });
  // Mientras está abierta, el foco se queda en ella (también si un clic en la imagen lo soltó)
  frenteEl.addEventListener('mousedown', function (e) { if (propia && propia.frente && Date.now() - propia.frenteT < 350) e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !propia || !propia.frente || rep.abierta) return;
    var f = Array.prototype.slice.call(frenteEl.querySelectorAll('button, a[href], [tabindex="0"]')).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
  });
  document.addEventListener('focusin', function (e) {
    // (la tele, si se prende desde la vista de frente, queda encima y se lleva el foco)
    if (propia && propia.frente && !rep.abierta && !frenteEl.contains(e.target)) { var h = frenteEl.querySelector('#sala-frente-t'); if (h) h.focus({ preventScroll: true }); }
  });

  // ── «Recorrer con una asesora»: la cámara va zona por zona y la asesora se para al lado de cada una ──
  function htmlBarraRecorrido() {
    return '<div class="sp-rec"><p class="sp-rec-n"><span>' + esc(textoPropia('recorrido', 'Recorrido con una asesora')) + '</span> · <span data-rec="n"></span></p><p class="sp-rec-t" data-rec="t"></p></div>' +
      '<div class="sp-acciones"><button type="button" class="sp-btn borde" data-rec="ant">Anterior</button><button type="button" class="sp-btn borde" data-rec="mas">Ver más</button>' +
      '<button type="button" class="sp-btn negro" data-rec="sig">Siguiente</button></div>' +
      '<button type="button" class="sp-cerrar" data-rec="fin" aria-label="Terminar el recorrido"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  }
  function iniciarRecorrido(i) {
    if (!propia || !(propia.P.recorrido || []).length) return;
    // (se callan todos, también quien se acaba de tocar, para que nadie tape lo que dice quien guía)
    cerrarFrente(true); cerrarTarjeta(true); propia.burbujas.slice().forEach(function (x) { callarSala(x); }); anillo(null);
    propia.recorrido = { i: -1 };
    barraSala.classList.add('recorriendo'); barraSala.innerHTML = htmlBarraRecorrido();
    acomodarPropia();
    pasoRecorrido(i || 0);
    var s = barraSala.querySelector('[data-rec="sig"]'); if (s) s.focus({ preventScroll: true });
  }
  function pasoRecorrido(i) {
    var R = propia.P.recorrido; i = Math.max(0, Math.min(R.length - 1, i));
    var p = R[i], z = propia.zonas[p.zona], quien = propia.P.guia, yo = propia;
    propia.recorrido.i = i;
    barraSala.querySelector('[data-rec="n"]').textContent = (i + 1) + ' de ' + R.length;
    barraSala.querySelector('[data-rec="t"]').textContent = p.titulo;
    barraSala.querySelector('[data-rec="ant"]').disabled = i === 0;
    barraSala.querySelector('[data-rec="sig"]').textContent = i === R.length - 1 ? 'Terminar' : 'Siguiente';
    resaltarZona(p.zona, p.ver);
    anunciar((i + 1) + ' de ' + R.length + '. ' + p.titulo + '. ' + p.texto);
    var decirlo = function () { if (propia !== yo || !yo.recorrido || yo.recorrido.i !== i) return; hablarSala({ quien: quien, rol: textoPropia('guia', ''), texto: p.texto }, { fija: true, guia: true }); };
    if (quien) callarDe(quien);
    // La asesora se para junto a la zona, mirándola (con un fundido; sin animación, al tiro)
    var g = z && z.z.guia, w = g && quien && vivaSala && vivaSala.gente.filter(function (q) { return q.c.id === quien; })[0];
    var caja = cajaDe([p.zona].concat(p.ver || [])) || propia.zonas[p.zona].z.caja;
    if (w) {
      var pie = window.Escena.P(g[0], g[1], 0), alto = propia.S.gente[quien][2], lg = propia.S.lugares[p.zona] || pie;
      caja = [Math.min(caja[0], pie[0] - 60), Math.min(caja[1], pie[1] - alto - 90), Math.max(caja[2], pie[0] + 60), Math.max(caja[3], pie[1] + 10)];
      // (si mientras tanto se pasó a otra parada o se terminó el recorrido, de ella se encarga la otra parada o el final)
      var llevar = function () { if (propia !== yo || !yo.recorrido || yo.recorrido.i !== i) return; vivaSala.llevar(quien, g[0], g[1], lg[0] >= pie[0]); w.g.classList.remove('salta'); decirlo(); };
      if (reducido) llevar(); else { w.g.classList.add('salta'); setTimeout(llevar, 240); }
    } else setTimeout(decirlo, reducido ? 0 : 240);
    encuadrarSala(caja, 900, { zMax: 1.8 });
  }
  function terminarRecorrido(sinFoco) {
    if (!propia || !propia.recorrido) return;
    var quien = propia.P.guia;
    propia.recorrido = null;
    // La asesora vuelve a su ruta (y se ve, si estaba a medio fundido)
    if (quien) { callarDe(quien); var w = vivaSala && vivaSala.llevar(quien); if (w) w.g.classList.remove('salta'); }
    resaltarZona(null);
    barraSala.classList.remove('recorriendo'); barraSala.innerHTML = htmlBarraPropia();
    acomodarPropia();
    if (!sinFoco) { var b = barraSala.querySelector('[data-recorrer]'); if (b) b.focus({ preventScroll: true }); }
  }
  barraSala.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !propia) return;
    if (b.hasAttribute('data-recorrer')) { iniciarRecorrido(0); return; }
    if (b.hasAttribute('data-zona-ir')) { abrirTarjeta(b.getAttribute('data-zona-ir'), { desde: b }); return; }
    var a = b.getAttribute('data-rec'); if (!a || !propia.recorrido) return;
    var i = propia.recorrido.i, R = propia.P.recorrido;
    if (a === 'ant') pasoRecorrido(i - 1);
    else if (a === 'sig') { if (i >= R.length - 1) terminarRecorrido(); else pasoRecorrido(i + 1); }
    else if (a === 'mas') abrirTarjeta(R[i].zona, { desde: barraSala.querySelector('[data-rec="mas"]') });
    else if (a === 'fin') terminarRecorrido();
  });

  // ── Tocar, arrastrar, pellizcar, la rueda y el teclado, sobre la sala ──
  function tocarSala(clx, cly) {
    var d = aDibujoSala(clx, cly), q = quienEn(d[0], d[1]);
    if (q) { anillo(q.quien); hablarSala(q, { anunciar: true }); return; }
    var z = zonaEn(d[0], d[1]);
    if (z) { abrirTarjeta(z.z.id); return; }
    if (propia.tarjeta) cerrarTarjeta(true);
  }
  function sobreSala(clx, cly) {
    var d = aDibujoSala(clx, cly), q = quienEn(d[0], d[1]), z = q ? null : zonaEn(d[0], d[1]), clave = q ? 'q' + q.quien : z ? 'z' + z.z.id : '';
    salaCaja.classList.toggle('sobre', !!clave);
    if (clave === propia.sobre) return;
    propia.sobre = clave;
    anillo(q ? q.quien : null);
    // Con una tarjeta o el recorrido abiertos, lo marcado es lo suyo
    if (!propia.tarjeta && !propia.frente && !propia.recorrido) resaltarZona(z ? z.z.id : null);
  }
  salaCaja.addEventListener('pointerdown', function (e) {
    if (!propia) return;
    dedosS[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(dedosS);
    if (ids.length === 1) toqueS = { x: e.clientX, y: e.clientY, cx: propia.cam.x, cy: propia.cam.y, movio: false };
    else if (ids.length === 2) { var a = dedosS[ids[0]], b = dedosS[ids[1]]; toqueS = { pellizco: true, d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: propia.cam.z, movio: true }; }
    if (propia.vuelo) { cancelAnimationFrame(propia.vuelo); propia.vuelo = null; }
  });
  window.addEventListener('pointermove', function (e) {
    if (!propia) return;
    if (dedosS[e.pointerId]) dedosS[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (!toqueS) { if (e.pointerType === 'mouse' && salaCaja.contains(e.target)) sobreSala(e.clientX, e.clientY); return; }
    if (toqueS.pellizco) {
      var ids = Object.keys(dedosS); if (ids.length < 2) return;
      var a = dedosS[ids[0]], b = dedosS[ids[1]];
      propia.aMano = true; zoomSala((a.x + b.x) / 2, (a.y + b.y) / 2, toqueS.z * Math.hypot(a.x - b.x, a.y - b.y) / toqueS.d / propia.cam.z);
      return;
    }
    var dx = e.clientX - toqueS.x, dy = e.clientY - toqueS.y;
    if (!toqueS.movio && Math.hypot(dx, dy) > 6) { toqueS.movio = true; propia.aMano = true; salaCaja.classList.add('arrastrando'); }
    if (toqueS.movio) { propia.cam.x = toqueS.cx - dx / propia.cam.z; propia.cam.y = toqueS.cy - dy / propia.cam.z; aplicarSala(); }
  });
  function soltarSala(e) {
    if (!dedosS[e.pointerId]) return;
    delete dedosS[e.pointerId];
    if (!toqueS || !propia) { toqueS = null; return; }
    if (!toqueS.movio && e.type === 'pointerup') tocarSala(e.clientX, e.clientY);
    if (!Object.keys(dedosS).length) { toqueS = null; salaCaja.classList.remove('arrastrando'); }
    else if (toqueS.pellizco) { var k = Object.keys(dedosS)[0]; toqueS = { x: dedosS[k].x, y: dedosS[k].y, cx: propia.cam.x, cy: propia.cam.y, movio: true }; }
  }
  window.addEventListener('pointerup', soltarSala);
  window.addEventListener('pointercancel', soltarSala);
  salaCaja.addEventListener('pointerleave', function (e) { if (propia && e.pointerType === 'mouse' && !toqueS) { propia.sobre = ''; salaCaja.classList.remove('sobre'); anillo(null); if (!propia.tarjeta && !propia.frente && !propia.recorrido) resaltarZona(null); } });
  salaCaja.addEventListener('wheel', function (e) {
    if (!propia) return;
    e.preventDefault();
    var d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    propia.aMano = true; zoomSala(e.clientX, e.clientY, Math.exp(-d * (e.ctrlKey ? 0.01 : 0.0016)));
  }, { passive: false });
  salaCaja.addEventListener('keydown', function (e) {
    if (!propia) return;
    var z = e.target.closest && e.target.closest('.zona-sala'), q = e.target.closest && e.target.closest('.quien-sala');
    if ((e.key === 'Enter' || e.key === ' ') && (z || q)) {
      e.preventDefault();
      if (z) abrirTarjeta(z.getAttribute('data-zona'), { desde: z }); else hablarSala(burbujaDe(q.getAttribute('data-quien')), { foco: true });
      return;
    }
    var paso = 90 / propia.cam.z, usado = true;
    if (e.key === 'ArrowLeft') propia.cam.x -= paso; else if (e.key === 'ArrowRight') propia.cam.x += paso;
    else if (e.key === 'ArrowUp') propia.cam.y -= paso; else if (e.key === 'ArrowDown') propia.cam.y += paso;
    else if (e.key === '+' || e.key === '=') zoomSalaCentro(1.25);
    else if (e.key === '-' || e.key === '_') zoomSalaCentro(0.8);
    else if (e.key === '0') verSalaEntera(500);
    else usado = false;
    if (usado) { e.preventDefault(); propia.aMano = true; if (propia.vuelo) { cancelAnimationFrame(propia.vuelo); propia.vuelo = null; } aplicarSala(); }
  });
  // Con teclado: la zona elegida se ilumina (y la cámara la busca si quedó fuera); quien habla dice lo suyo
  salaCaja.addEventListener('focusin', function (e) {
    if (!propia) return;
    var z = e.target.closest && e.target.closest('.zona-sala'), q = e.target.closest && e.target.closest('.quien-sala');
    if (z) {
      var id = z.getAttribute('data-zona'), l = propia.S.lugares[id];
      if (!propia.tarjeta && !propia.frente && !propia.recorrido) resaltarZona(id);
      if (l) { var a = aCaja(l[0], l[1]), f = libreSala(); if (a[0] < f.x0 || a[0] > f.x1 || a[1] < f.y0 || a[1] > f.y1) volarSala(l[0], l[1], propia.cam.z, 450); }
    }
    if (q) { var b = burbujaDe(q.getAttribute('data-quien')); if (b) { anillo(b.quien); hablarSala(b, { foco: true }); } }
  });
  salaCaja.addEventListener('focusout', function (e) {
    if (!propia) return;
    var z = e.target.closest && e.target.closest('.zona-sala'), q = e.target.closest && e.target.closest('.quien-sala');
    if (q) { anillo(null); callarDe(q.getAttribute('data-quien'), true); }
    if (z && !propia.tarjeta && !propia.frente && !propia.recorrido) resaltarZona(null);
  });
  // La burbuja de BiPlot lleva a su tarjeta; en el museo (que es todo de BiPlot, sin rincón aparte), al recorrido con Pepa
  capaSala.addEventListener('click', function (e) {
    if (!propia || !e.target.closest('.burbuja.bp')) return;
    var bp = Object.keys(propia.zonas).filter(function (id) { return propia.zonas[id].d && propia.zonas[id].d.biplot; })[0];
    if (bp) abrirTarjeta(bp); else if (!propia.recorrido) iniciarRecorrido(0);
  });

  function copiar(btn) {
    var url = btn.getAttribute('data-url'), code = btn.parentNode.querySelector('code');
    function listo() { btn.textContent = 'Copiado'; setTimeout(function () { btn.textContent = 'Copiar'; }, 1600); }
    function seleccionar() { var r = document.createRange(); r.selectNodeContents(code); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
    try { navigator.clipboard.writeText(url).then(listo, seleccionar); } catch (e) { seleccionar(); }
  }
  function compartir(btn) {
    var pr = salaDe(enSala);
    try { navigator.share({ title: pr.nombre + ' · La oficina de BiPlot', text: pr.esencia, url: btn.getAttribute('data-url') }).catch(function () {}); } catch (e) { /* sin compartir */ }
  }

  /* ── El chat de Plotty: tres preguntas, los casos de tu rubro y un camino ── */
  var C = D.plotty, rubroElegido = leer('rubro'), vitrinaIds = D.vitrina.porDefecto.slice();
  if (rubroElegido && D.vitrina.rubros[rubroElegido]) { vitrinaIds = D.vitrina.rubros[rubroElegido].slice(); esc3.vitrina(vitrinaIds, 'PARA TU RUBRO'); } else rubroElegido = null;
  function htmlChat() {
    return '<section class="chat" aria-label="Conversación con Plotty"><div class="chat-cab">' + avatar('plotty', 'chat-av') + '<div><b>Plotty</b><span>Recepción · E0</span></div><span class="antena" aria-hidden="true"></span></div>' +
      '<ol class="chat-mensajes" aria-live="polite"></ol><div class="chat-opciones" role="group" aria-label="Tus respuestas"></div></section>';
  }
  function htmlChatPanel() {
    return '<p class="bp-etiqueta">Recepción · E0</p><h2 id="panel-titulo" tabindex="-1">Tres preguntas</h2><p class="lema">' + esc(PERSONAL.plotty.frase) + '</p>' + htmlChat();
  }
  // La cámara va a los casos del rubro: los de la calle principal y, si existe, la calle de ese rubro.
  // Sin casos de ese rubro, al local libre. Devuelve los casos que mostró.
  function verRubro(rubro, cerrar) {
    if (esc3.abierta()) salirOficina({ sinCamara: true, conPanel: true });
    var ids = casosDelRubro(rubro).map(function (p) { return p.id; }).filter(function (id) { return zonaPorId(id); });
    var calle = calleId(rubro);
    if (calle) ids = ids.concat(['libre-' + rubro]);
    if (cerrar && !panel.hidden) cerrarPanel();
    var marcar = ids.length ? ids : ['libre'];
    resaltar({ tipo: 'zona', id: marcar[0] }, marcar.slice(1));
    irAGrupo(marcar, 900);
    return ids.filter(function (id) { return PROYECTOS[id]; });
  }
  function iniciarChat(caja) {
    var lista = caja.querySelector('.chat-mensajes'), opciones = caja.querySelector('.chat-opciones'), resp = {}, paso = 0;
    function decir(txt, quien) {
      var li = document.createElement('li'); li.className = 'msg ' + (quien || 'plotty'); li.textContent = txt;
      lista.appendChild(li); li.scrollIntoView({ block: 'nearest', behavior: reducido ? 'auto' : 'smooth' });
    }
    function preguntar() {
      var q = C.preguntas[paso];
      decir(q.texto);
      opciones.innerHTML = q.opciones.map(function (o) { return '<button type="button" data-v="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('');
      var b = opciones.querySelector('button'); if (b && paso > 0) b.focus({ preventScroll: true });
    }
    function etiqueta(q, v) { var o = C.preguntas.filter(function (x) { return x.id === q; })[0].opciones.filter(function (x) { return x[0] === v; })[0]; return o ? o[1] : v; }
    function minus(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
    function terminar() {
      opciones.innerHTML = '';
      var califica = C.noCalifican.indexOf(resp.horas) === -1;
      caja.classList.toggle('califica', califica);
      decir(califica ? C.califica : C.noCalifica);
      rubroElegido = resp.rubro; guardar('rubro', resp.rubro);
      vitrinaIds = (D.vitrina.rubros[resp.rubro] || D.vitrina.porDefecto).slice();
      esc3.vitrina(vitrinaIds, 'PARA TU RUBRO');
      decir(C.vitrina);
      var msj = C.mensaje.replace('{rubro}', minus(etiqueta('rubro', resp.rubro))).replace('{donde}', minus(etiqueta('donde', resp.donde))).replace('{horas}', minus(etiqueta('horas', resp.horas)));
      var fin = document.createElement('div'); fin.className = 'chat-fin';
      fin.innerHTML = '<a class="bp-cta" href="' + whatsapp(msj) + '" target="_blank" rel="noopener">Agenda tu diagnóstico<span class="sr"> (se abre WhatsApp en otra pestaña)</span></a>' +
        '<button type="button" class="bp-btn" data-rubro="' + esc(resp.rubro) + '"><span class="ico" aria-hidden="true">' + icono('calle') + '</span>Ver casos como el tuyo</button>' +
        '<button type="button" class="bp-btn" data-abrir="zona:vitrina">Ver la vitrina</button><button type="button" class="bp-btn chat-otra">Empezar de nuevo</button>';
      caja.appendChild(fin);
      fin.querySelector('.bp-cta').focus({ preventScroll: true });
      fin.querySelector('.chat-otra').addEventListener('click', function () { fin.remove(); lista.innerHTML = ''; caja.classList.remove('califica'); resp = {}; paso = 0; decir(C.saludo); preguntar(); });
    }
    opciones.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b) return;
      var q = C.preguntas[paso]; resp[q.id] = b.getAttribute('data-v');
      decir(b.textContent, 'tu');
      // Con el rubro, la cámara va a los casos como el tuyo
      if (q.id === 'rubro' && BARRIO) {
        var casos = verRubro(resp.rubro, false);
        decir(casos.length ? C.rubroCasos.replace('{casos}', casos.map(function (id) { return nombreCaso(PROYECTOS[id]); }).join(', ')) : C.rubroSinCasos);
      }
      paso++;
      if (paso < C.preguntas.length) preguntar(); else terminar();
    });
    decir(C.saludo); preguntar();
  }

  /* ── Videos ── */
  // (caja: dónde está el video; por defecto, el panel. La tarjeta de BiPlot de una sala propia también trae uno)
  function activarMedios(caja) {
    var v = (caja || panelCuerpo).querySelector('video.panel-video'); if (!v) return;
    v.src = v.getAttribute('data-src');
    var auto = !reducido && window.innerWidth >= 900 && !(navigator.connection && navigator.connection.saveData);
    if (auto) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.setAttribute('controls', '');
  }
  function detenerMedios(caja) { var v = (caja || panelCuerpo).querySelector('video'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); } }

  /* ── La tele de BiPlot.TV: todo «Ver con sonido» de la oficina se ve aquí ── */
  // Se prende en el video que se tocó, con toda la programación a mano (la cartelera de BiPlot.TV, en datos.js): se cambia
  // de canal con CH ▲▼, con los números o con la guía, y en el celular deslizando. Entre canal y canal, un golpe de
  // estática con el número del que entra (con movimiento reducido o la oficina en pausa, el corte es directo). Al terminar,
  // Felipe anuncia el siguiente con su frase del recorrido y a los cinco segundos pasa solo. Marca lo visto, retoma donde
  // quedaste y termina en el último canal, «Tu proyecto» (el cierre de la cartelera), con «Agenda tu diagnóstico».
  // En el computador es un televisor con su control remoto; en el celular (y en una tablet parada), la pantalla entera con
  // una barra abajo, y el video en vertical si el celular está parado.
  var tele = $('#tele'), CANALES = null, repV = null, nieve = null;
  var rep = { i: 0, abierta: false, desde: null, sigue: null, osd: null, cambio: null, pintado: -1, vert: false, fondo: [], vistos: [] };
  var TELE_CEL = window.matchMedia('(max-width: 699px), (max-height: 560px), (orientation: portrait) and (max-width: 1024px)');
  var IT = {
    pausa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/></svg>',
    sonido: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mudo: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    arriba: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    abajo: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    izq: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    der: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    visto: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    apagar: '<svg viewBox="0 0 24 24"><path d="M12 3.5v8M7.2 6.6a7.2 7.2 0 1 0 9.6 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    guia: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };
  function dosCifras(n) { return (n < 10 ? '0' : '') + n; }
  function minutos(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + dosCifras(s % 60); }
  function leerJson(k) { try { return JSON.parse(leer(k) || 'null'); } catch (e) { return null; } }
  function guardarJson(k, v) { guardar(k, JSON.stringify(v)); }
  // Los canales: la programación, en el orden de la cartelera, con lo que dice Felipe de cada video en su recorrido; al
  // final, el cierre de la cartelera (tu proyecto)
  function canalesTele() {
    var P = SALAS.tv.salaPropia, Z = P.zonas, R = {};
    (P.recorrido || []).forEach(function (p) { R[p.zona] = p.texto; });
    var C = programasTv().map(function (id, k) {
      var d = Z[id], v = videoDe(d);
      return { id: id, n: k + 1, nombre: d.nombre, ceja: d.ceja, dur: d.duracion || '', mini: MEDIOS + '../tv/pantalla-' + (d.pantalla || id) + '.webp',
        h: v.h, v: v.v || v.h, poster: v.poster, botones: d.botones || [], relato: R[id] || '' };
    });
    var F = Z.cartelera && Z.cartelera.cierre;
    if (F) C.push({ id: 'tuproyecto', n: C.length + 1, tu: true, nombre: F.nombre, ceja: F.ceja, titulo: F.titulo, texto: F.texto, dur: '', relato: F.relato || '' });
    return C;
  }
  function teleCelular() { return TELE_CEL.matches; }
  function teleVertical() { return teleCelular() && window.innerHeight > window.innerWidth; }
  function fuenteTele(c) { return teleVertical() ? c.v : c.h; }
  function canalTele() { return CANALES[rep.i]; }
  // Los botones de cada video: los de su tarjeta del canal (su sala, BiPlot HQ, la conversación con Plotty o una página)
  function botonesTele(c) {
    var conSala = c.botones.some(function (b) { return b.sala && salaDe(b.sala); });
    return c.botones.map(function (b, k) {
      var cls = 'bp-btn chico' + ((b.sala && salaDe(b.sala)) || (!conSala && k === c.botones.length - 1) ? ' primario' : '');
      if (b.url) return '<a class="' + cls + '" href="' + esc(b.url) + '" target="_blank" rel="noopener">' + esc(b.texto) + '<span class="ico" aria-hidden="true">' + icono('afuera') + '</span><span class="sr">(se abre en otra pestaña)</span></a>';
      if (b.sala && salaDe(b.sala)) return '<button type="button" class="' + cls + '" data-tele-sala="' + esc(b.sala) + '">' + esc(b.texto || 'Entrar a su sala') + '</button>';
      if (b.hq) return '<button type="button" class="' + cls + '" data-tele-hq="1">' + esc(b.texto || 'Pasar a BiPlot HQ') + '</button>';
      if (b.chat) return '<button type="button" class="' + cls + '" data-tele-chat="1">' + esc(b.texto || 'Conversar con Plotty') + '</button>';
      return '';
    }).join('');
  }
  function htmlTele() {
    var F = CANALES[CANALES.length - 1], felipe = PERSONAL.felipe;
    var teclas = CANALES.map(function (c, k) {
      return '<button type="button" class="tele-tecla' + (c.tu ? ' es-tu' : '') + '" data-canal="' + k + '" aria-label="' + esc('Canal ' + c.n + ': ' + c.nombre) + '">' + c.n + '</button>';
    }).join('');
    var guia = CANALES.map(function (c, k) {
      return '<li><button type="button" class="tele-fila" data-canal="' + k + '"><span class="tele-fila-n">' + dosCifras(c.n) + '</span>' +
        (c.tu ? '<span class="tele-ajuste" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' : '<img src="' + esc(c.mini) + '" alt="" width="160" height="90" loading="lazy">') +
        '<span class="tele-fila-txt"><small>' + esc(c.ceja) + '</small><b>' + esc(c.nombre) + '</b></span><span class="tele-fila-dur">' + esc(c.tu ? '—' : c.dur) + '</span>' +
        '<span class="tele-visto" aria-hidden="true">' + IT.visto + '</span><span class="sr tele-sr-visto"> (ya lo viste)</span></button></li>';
    }).join('');
    return '<div class="tele-velo"></div>' +
      '<button type="button" class="tele-cerrar" data-tele="cerrar" aria-label="Apagar la tele">' + IT.cerrar + '</button>' +
      '<p class="sr" aria-live="polite" data-t="anuncio"></p>' +
      '<div class="tele-escena">' +
        '<div class="tele-caja">' +
          '<svg class="tele-antena" viewBox="0 0 140 56" aria-hidden="true"><path d="M70 54L26 12M70 54L114 12"/><circle cx="26" cy="12" r="8"/><circle cx="114" cy="12" r="8"/></svg>' +
          '<div class="tele-pantalla">' +
            '<video class="tele-video" playsinline preload="metadata"></video>' +
            '<div class="tele-nieve" aria-hidden="true"><b></b></div>' +
            '<div class="tele-osd" aria-hidden="true"><b class="tele-osd-n"><small>CH</small><span data-t="n"></span></b><span class="tele-osd-txt"><span class="tele-ceja" data-t="ceja"></span><b data-t="nombre"></b><span class="tele-hora" data-t="hora"></span></span></div>' +
            (F.tu ? '<div class="tele-carta" hidden><div class="tele-barras" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
              '<div class="tele-carta-caja"><p class="tele-ceja">Canal ' + dosCifras(F.n) + ' · ' + esc(F.nombre) + '</p><h3>' + esc(F.titulo) + '</h3><p>' + esc(F.texto) + '</p>' +
              '<div class="tele-carta-botones"><a class="bp-cta" href="' + esc(whatsapp('Hola BiPlot, vi ' + SALAS.tv.nombre + ' en la oficina y quiero agendar un diagnóstico.')) + '" target="_blank" rel="noopener">Agenda tu diagnóstico<span class="sr"> (se abre WhatsApp en otra pestaña)</span></a>' +
              '<button type="button" class="bp-btn" data-tele="inicio">Volver al canal 01</button></div></div></div>' : '') +
            '<div class="tele-sigue" role="status" hidden><div class="tele-sigue-cab"><span class="tele-ceja">A continuación · <b data-s="n"></b></span>' +
              '<span class="tele-cuenta" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5"/><circle class="tele-cuenta-v" cx="18" cy="18" r="15.5"/></svg><b data-s="cuenta"></b></span></div>' +
              '<div class="tele-sigue-prog"><img data-s="mini" alt="" width="160" height="90"><span><b data-s="nombre"></b><small data-s="ceja"></small></span></div>' +
              '<p class="tele-relato">' + avatar('felipe') + '<span><small>' + esc(felipe.nombre + ' · ' + felipe.rol) + '</small><q data-s="relato"></q></span></p>' +
              '<div class="tele-sigue-botones"><button type="button" class="bp-btn chico primario" data-tele="ya"><span class="ico" aria-hidden="true">' + icono('play') + '</span>Ver ahora</button>' +
              '<button type="button" class="bp-btn chico" data-tele="quedar">Quedarme aquí</button></div></div>' +
            '<div class="tele-retoma" role="status" hidden><span>Seguimos donde quedaste, en el <b data-r="t"></b></span><button type="button" class="bp-btn chico" data-tele="principio">Desde el principio</button></div>' +
            '<div class="tele-guia" hidden><div class="tele-guia-cab"><p class="tele-ceja">Guía de programación</p><button type="button" class="bp-btn chico" data-tele="guia">Cerrar la guía</button></div>' +
              '<ol aria-label="Los canales de BiPlot.TV">' + guia + '</ol></div>' +
            '<div class="tele-linea" aria-hidden="true"><i data-t="avance"></i></div>' +
          '</div>' +
          '<div class="tele-bisel"><span class="tele-led" aria-hidden="true"></span><span class="tele-marca" aria-hidden="true">BiPlot<b>.TV</b></span><div class="tele-botones" data-t="botones"></div></div>' +
        '</div>' +
        '<div class="tele-control" role="group" aria-label="Control remoto">' +
          '<div class="tele-c-arriba"><button type="button" class="tele-redondo" data-tele="cerrar" aria-label="Apagar la tele">' + IT.apagar + '</button>' +
            '<span class="tele-ir" aria-hidden="true"></span><button type="button" class="tele-redondo" data-tele="mudo"></button></div>' +
          '<div class="tele-cruz">' +
            '<button type="button" class="tele-cruz-b arr" data-tele="sig" aria-label="Canal siguiente">' + IT.arriba + '<small aria-hidden="true">CH</small></button>' +
            '<button type="button" class="tele-cruz-b izq" data-tele="atras" aria-label="Retroceder 10 segundos">' + IT.izq + '</button>' +
            '<button type="button" class="tele-cruz-ok" data-tele="play" data-foco></button>' +
            '<button type="button" class="tele-cruz-b der" data-tele="adelante" aria-label="Adelantar 10 segundos">' + IT.der + '</button>' +
            '<button type="button" class="tele-cruz-b aba" data-tele="ant" aria-label="Canal anterior"><small aria-hidden="true">CH</small>' + IT.abajo + '</button>' +
          '</div>' +
          '<div class="tele-teclado">' + teclas + '<button type="button" class="tele-tecla tele-tecla-guia" data-tele="guia" aria-label="Guía de programación" aria-expanded="false">' + IT.guia + '<small aria-hidden="true">GUÍA</small></button></div>' +
          '<p class="tele-marca tele-c-pie" aria-hidden="true">BiPlot<b>.TV</b></p>' +
        '</div>' +
        // En el celular, los botones del video van sobre la barra: canal anterior, el canal (abre la guía) y canal siguiente
        '<div class="tele-botones tele-botones-cel" data-t="botones"></div>' +
        '<div class="tele-mando"><button type="button" class="tele-redondo" data-tele="ant" aria-label="Canal anterior">' + IT.abajo + '</button>' +
          '<button type="button" class="tele-mando-canal" data-tele="guia" data-foco aria-expanded="false"><b data-t="n"></b><span><small data-t="ceja"></small><span data-t="nombre"></span></span>' + IT.guia + '<span class="sr"> (guía de programación)</span></button>' +
          '<button type="button" class="tele-redondo" data-tele="sig" aria-label="Canal siguiente">' + IT.arriba + '</button></div>' +
      '</div>' +
      '<p class="tele-ayuda" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> cambia de canal · <kbd>1</kbd>…<kbd>' + Math.min(9, CANALES.length) + '</kbd> · <kbd>Espacio</kbd> pausa · <kbd>Esc</kbd> apaga</p>' +
      '<p class="tele-desliza" aria-hidden="true">' + IT.arriba + 'Desliza para cambiar de canal</p>';
  }
  function construirTele() {
    CANALES = canalesTele();
    rep.vistos = leerJson('tv-vistos') || [];
    tele.innerHTML = htmlTele();
    repV = tele.querySelector('.tele-video');
    ['play', 'pause', 'volumechange'].forEach(function (ev) { repV.addEventListener(ev, function () { pintarTele(); if (ev === 'pause') mostrarOsd(); }); });
    repV.addEventListener('timeupdate', avanceTele);
    repV.addEventListener('loadedmetadata', avanceTele);
    repV.addEventListener('ended', function () { marcarVisto(canalTele()); mostrarSigue(); });
    // Un clic (o un toque) en el video lo pausa; al mover el mouse sobre la pantalla aparece el canal
    repV.addEventListener('click', function () { alternarTele(); mostrarOsd(); });
    var pantalla = tele.querySelector('.tele-pantalla'), p0 = null;
    pantalla.addEventListener('mousemove', function () { if (rep.abierta) mostrarOsd(); });
    // En el celular, deslizar hacia arriba sube de canal (como los reels) y hacia abajo lo baja
    pantalla.addEventListener('touchstart', function (e) { var t = e.touches[0]; p0 = { x: t.clientX, y: t.clientY }; }, { passive: true });
    pantalla.addEventListener('touchend', function (e) {
      if (!p0 || !tele.querySelector('.tele-guia').hidden) { p0 = null; return; }
      var t = e.changedTouches[0], dx = t.clientX - p0.x, dy = t.clientY - p0.y; p0 = null;
      if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx)) irCanal(rep.i + (dy < 0 ? 1 : -1));
    }, { passive: true });
    // La línea de abajo de la pantalla también adelanta (con el mouse)
    tele.querySelector('.tele-linea').addEventListener('click', function (e) {
      if (canalTele().tu || !repV.duration) return;
      var r = this.getBoundingClientRect(); repV.currentTime = repV.duration * Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    });
    tele.addEventListener('click', clicTele);
    tele.addEventListener('keydown', teclaTele);
    // Al girar el celular, el video cambia al formato que calza, en el mismo segundo
    window.addEventListener('resize', function () {
      if (!rep.abierta || canalTele().tu || teleVertical() === rep.vert) return;
      var t = repV.currentTime, andando = !repV.paused;
      rep.vert = teleVertical(); repV.src = fuenteTele(canalTele()); repV.currentTime = t;
      if (andando) { var p = repV.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }
  // Se prende en el video que se tocó (src); sin video («Prender la tele»), en el último canal que se vio, donde quedó, o en el 01
  function abrirTele(src, desde) {
    if (!CANALES) construirTele();
    var k = -1, punto = leerJson('tv-punto');
    if (src) CANALES.forEach(function (c, j) { if (k < 0 && !c.tu && (c.h === src || c.v === src)) k = j; });
    else if (punto) CANALES.forEach(function (c, j) { if (c.id === punto.id) k = j; });
    if (k < 0) k = 0;
    rep.desde = desde || document.activeElement; rep.abierta = true;
    tele.hidden = false; document.body.classList.add('tele-prendida');
    // Los videos sin sonido de las tarjetas se detienen mientras tanto
    rep.fondo = Array.prototype.filter.call(document.querySelectorAll('video.panel-video'), function (v) { return !v.paused; });
    rep.fondo.forEach(function (v) { v.pause(); });
    var c = CANALES[k], t = punto && punto.id === c.id && punto.t > 5 ? punto.t : 0;
    irCanal(k, { directo: true, t: t });
    if (t) retomarTele(t);
    // En el celular parado, la primera vez: «Desliza para cambiar de canal»
    if (teleVertical() && !leer('tv-desliza')) { tele.classList.add('ver-desliza'); guardar('tv-desliza', '1'); setTimeout(function () { tele.classList.remove('ver-desliza'); }, 2600); }
    var f = Array.prototype.filter.call(tele.querySelectorAll('[data-foco]'), function (x) { return x.offsetParent !== null; })[0];
    if (f) f.focus({ preventScroll: true });
  }
  function cerrarTele(sinFoco) {
    if (!rep.abierta) return;
    pararSigue(); alternarGuia(false); clearTimeout(rep.cambio); tele.classList.remove('cambiando');
    // Si quedó a la mitad, la próxima vez sigue desde ahí
    var c = canalTele(), t = repV.currentTime, d = repV.duration;
    guardarJson('tv-punto', !c.tu && t > 5 && d && t < d - 5 ? { id: c.id, t: Math.floor(t) } : null);
    repV.pause(); repV.removeAttribute('src'); repV.load();
    if (document.fullscreenElement && tele.contains(document.fullscreenElement)) document.exitFullscreen().catch(function () {});
    tele.hidden = true; rep.abierta = false; document.body.classList.remove('tele-prendida');
    rep.fondo.forEach(function (v) { if (document.contains(v)) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } });
    rep.fondo = [];
    if (!sinFoco && rep.desde && document.contains(rep.desde)) rep.desde.focus({ preventScroll: true });
    rep.desde = null;
  }
  function irCanal(k, o) {
    o = o || {};
    var N = CANALES.length; k = (k % N + N) % N;
    pararSigue(); ocultarTele('.tele-retoma'); alternarGuia(false); tele.classList.remove('ver-desliza');
    rep.i = k;
    var c = CANALES[k], poner = function () {
      tele.classList.toggle('en-tu', !!c.tu);
      var carta = tele.querySelector('.tele-carta'); if (carta) carta.hidden = !c.tu;
      if (c.tu) { repV.pause(); repV.removeAttribute('src'); repV.removeAttribute('poster'); repV.load(); }
      else {
        rep.vert = teleVertical(); repV.poster = c.poster || ''; repV.src = fuenteTele(c);
        if (o.t) repV.currentTime = o.t;
        var p = repV.play(); if (p && p.catch) p.catch(function () {});
      }
      pintarTele(); avanceTele(); mostrarOsd();
    };
    clearTimeout(rep.cambio);
    if (o.directo || reducido || quieta()) { tele.classList.remove('cambiando'); poner(); return; }
    // Un tercio de segundo de estática, con el número del canal que entra
    var nv = tele.querySelector('.tele-nieve');
    nv.style.backgroundImage = 'url(' + nieveTele() + ')'; nv.querySelector('b').textContent = dosCifras(c.n);
    tele.classList.add('cambiando'); repV.pause();
    rep.cambio = setTimeout(function () { poner(); rep.cambio = setTimeout(function () { tele.classList.remove('cambiando'); }, 260); }, 220);
  }
  function nieveTele() {
    if (nieve) return nieve;
    var cv = document.createElement('canvas'); cv.width = 192; cv.height = 108;
    var x = cv.getContext('2d'), im = x.createImageData(192, 108);
    for (var k = 0; k < im.data.length; k += 4) { var g = Math.random() * 255 | 0; im.data[k] = g; im.data[k + 1] = Math.min(255, g + 6); im.data[k + 2] = Math.min(255, g + 14); im.data[k + 3] = 255; }
    x.putImageData(im, 0, 0); nieve = cv.toDataURL(); return nieve;
  }
  function alternarTele() { if (canalTele().tu) return; if (repV.paused) { var p = repV.play(); if (p && p.catch) p.catch(function () {}); } else repV.pause(); }
  function saltarTele(s) { if (canalTele().tu || !repV.duration) return; repV.currentTime = Math.max(0, Math.min(repV.duration - .2, repV.currentTime + s)); mostrarOsd(); }
  function completaTele() {
    var el = tele.querySelector('.tele-pantalla');
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    else if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
  }
  function ocultarTele(s) { var e = tele.querySelector(s); if (e) e.hidden = true; }
  function retomarTele(t) {
    var r = tele.querySelector('.tele-retoma'); r.querySelector('[data-r="t"]').textContent = minutos(t); r.hidden = false;
    clearTimeout(r.t); r.t = setTimeout(function () { r.hidden = true; }, 6000);
  }
  function marcarVisto(c) { if (c && !c.tu && rep.vistos.indexOf(c.id) < 0) { rep.vistos.push(c.id); guardarJson('tv-vistos', rep.vistos); pintarTele(); } }
  // Al terminar: el siguiente, anunciado por Felipe, con cinco segundos para quedarse
  function mostrarSigue() {
    var s = CANALES[(rep.i + 1) % CANALES.length], el = tele.querySelector('.tele-sigue'), n = 5;
    el.querySelector('[data-s="n"]').textContent = dosCifras(s.n);
    el.querySelector('[data-s="nombre"]').textContent = s.nombre;
    el.querySelector('[data-s="ceja"]').textContent = s.ceja + (s.dur ? ' · ' + s.dur : '');
    var im = el.querySelector('[data-s="mini"]'); im.hidden = !!s.tu; if (!s.tu) im.src = s.mini;
    el.classList.toggle('es-tu', !!s.tu);
    el.querySelector('[data-s="relato"]').textContent = s.relato; el.querySelector('.tele-relato').hidden = !s.relato;
    var cu = el.querySelector('[data-s="cuenta"]'); cu.textContent = n;
    el.hidden = false; tele.classList.add('siguiendo');
    el.classList.remove('corre'); void el.offsetWidth; if (!reducido && !quieta()) el.classList.add('corre');
    clearInterval(rep.sigue);
    rep.sigue = setInterval(function () { n--; cu.textContent = Math.max(n, 0); if (n <= 0) irCanal(rep.i + 1); }, 1000);
  }
  function pararSigue() { clearInterval(rep.sigue); rep.sigue = null; ocultarTele('.tele-sigue'); tele.classList.remove('siguiendo'); }
  // El cartel con el número y el nombre, como en la tele: se esconde solo (y se queda con el video en pausa)
  function mostrarOsd() {
    tele.classList.add('con-osd'); clearTimeout(rep.osd);
    rep.osd = setTimeout(function () { if (!repV.paused) tele.classList.remove('con-osd'); }, 3500);
  }
  function alternarGuia(si) {
    var g = tele.querySelector('.tele-guia'); if (!g) return;
    var antes = !g.hidden; si = si == null ? !antes : si;
    g.hidden = !si; tele.classList.toggle('con-guia', si);
    tele.querySelectorAll('[aria-expanded]').forEach(function (b) { b.setAttribute('aria-expanded', si ? 'true' : 'false'); });
    if (si) { var a = g.querySelector('.tele-fila.actual') || g.querySelector('.tele-fila'); if (a) a.focus({ preventScroll: true }); }
    else if (antes && g.contains(document.activeElement)) {
      var b = Array.prototype.filter.call(tele.querySelectorAll('[aria-expanded]'), function (x) { return x.offsetParent !== null; })[0]; if (b) b.focus({ preventScroll: true });
    }
  }
  function pintarTele() {
    if (!CANALES) return;
    var c = canalTele();
    // Los textos y los botones del video, sólo al cambiar de canal (así no se pierde el foco al pausar)
    if (rep.pintado !== rep.i) {
      rep.pintado = rep.i;
      tele.querySelectorAll('[data-t]').forEach(function (e) {
        var k = e.getAttribute('data-t');
        if (k === 'n') e.textContent = dosCifras(c.n);
        else if (k === 'nombre') e.textContent = c.nombre;
        else if (k === 'ceja') e.textContent = c.ceja;
        else if (k === 'botones') e.innerHTML = c.tu ? '' : botonesTele(c);
        else if (k === 'anuncio') e.textContent = 'Canal ' + dosCifras(c.n) + ': ' + c.nombre;
      });
    }
    tele.querySelectorAll('[data-canal]').forEach(function (b) {
      var k = +b.getAttribute('data-canal');
      b.classList.toggle('actual', k === rep.i);
      b.classList.toggle('visto', rep.vistos.indexOf(CANALES[k].id) > -1);
      if (k === rep.i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    tele.querySelectorAll('[data-tele="play"]').forEach(function (b) { b.innerHTML = repV.paused ? icono('play') : IT.pausa; b.setAttribute('aria-label', repV.paused ? 'Reproducir' : 'Pausar'); });
    tele.querySelectorAll('[data-tele="mudo"]').forEach(function (b) { b.innerHTML = repV.muted ? IT.mudo : IT.sonido; b.setAttribute('aria-label', repV.muted ? 'Activar el sonido' : 'Silenciar'); });
    tele.classList.toggle('pausada', repV.paused);
  }
  function avanceTele() {
    var c = canalTele(), d = repV.duration || 0, t = repV.currentTime || 0, f = c.tu || !d ? 0 : t / d;
    tele.querySelector('[data-t="avance"]').style.transform = 'scaleX(' + f + ')';
    tele.querySelector('[data-t="hora"]').textContent = c.tu ? '' : minutos(t) + ' / ' + (d ? minutos(d) : c.dur);
    if (f > .9) marcarVisto(c);
  }
  function clicTele(e) {
    // Un clic fuera de la tele (en lo oscuro) la apaga
    if (e.target === tele || e.target.classList.contains('tele-velo') || e.target.classList.contains('tele-escena')) { cerrarTele(); return; }
    var b = e.target.closest('[data-tele], [data-canal], [data-tele-sala], [data-tele-hq], [data-tele-chat]'); if (!b || !tele.contains(b)) return;
    if (b.hasAttribute('data-canal')) { irCanal(+b.getAttribute('data-canal')); return; }
    // Los botones del video llevan a otra parte: la tele se apaga y se va para allá
    if (b.hasAttribute('data-tele-sala')) { e.preventDefault(); cerrarTele(true); entrarSala(b.getAttribute('data-tele-sala'), { directo: true }); return; }
    if (b.hasAttribute('data-tele-hq')) { e.preventDefault(); cerrarTele(true); entrarOficina({ boton: $('#recorrer-toggle') }); return; }
    if (b.hasAttribute('data-tele-chat')) { e.preventDefault(); cerrarTele(true); abrir({ tipo: 'chat', id: 'plotty' }, false, $('#recorrer-toggle')); return; }
    var a = b.getAttribute('data-tele');
    if (a === 'cerrar') cerrarTele();
    else if (a === 'sig') irCanal(rep.i + 1);
    else if (a === 'ant') irCanal(rep.i - 1);
    else if (a === 'play') { alternarTele(); mostrarOsd(); }
    else if (a === 'mudo') repV.muted = !repV.muted;
    else if (a === 'atras') saltarTele(-10);
    else if (a === 'adelante') saltarTele(10);
    else if (a === 'guia') alternarGuia();
    else if (a === 'ya') irCanal(rep.i + 1);
    else if (a === 'quedar') pararSigue();
    else if (a === 'inicio') irCanal(0);
    else if (a === 'principio') { ocultarTele('.tele-retoma'); repV.currentTime = 0; }
  }
  // Mientras está prendida, el teclado es sólo de la tele
  function teclaTele(e) {
    e.stopPropagation();
    var k = e.key, g = tele.querySelector('.tele-guia'), enGuia = !g.hidden && g.contains(e.target);
    if (k === 'Escape') { e.preventDefault(); if (!g.hidden) alternarGuia(false); else cerrarTele(); return; }
    if (k === 'Tab') {
      var f = Array.prototype.filter.call(tele.querySelectorAll('button, a[href]'), function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // En la guía, las flechas recorren los canales
    if (enGuia && /^Arrow/.test(k)) {
      var filas = Array.prototype.slice.call(g.querySelectorAll('.tele-fila')), j = filas.indexOf(document.activeElement);
      if (j > -1) { e.preventDefault(); filas[(j + (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : -1) + filas.length) % filas.length].focus(); }
      return;
    }
    if (/^[1-9]$/.test(k) && +k <= CANALES.length) { e.preventDefault(); irCanal(+k - 1); return; }
    if (k === ' ' && /^(BUTTON|A)$/.test(e.target.tagName)) return;
    if (k === ' ' || k === 'k' || k === 'K') { e.preventDefault(); alternarTele(); mostrarOsd(); return; }
    if (k === 'm' || k === 'M') { e.preventDefault(); repV.muted = !repV.muted; return; }
    if (k === 'f' || k === 'F') { e.preventDefault(); completaTele(); return; }
    if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); irCanal(rep.i + 1); return; }
    if (k === 'ArrowDown' || k === 'PageDown') { e.preventDefault(); irCanal(rep.i - 1); return; }
    if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); saltarTele(k === 'ArrowRight' ? 10 : -10); }
  }
  // Si el foco se escapa (un clic en otra parte), vuelve a la tele
  document.addEventListener('focusin', function (e) {
    if (!rep.abierta || tele.contains(e.target)) return;
    var f = Array.prototype.filter.call(tele.querySelectorAll('[data-foco]'), function (x) { return x.offsetParent !== null; })[0]; if (f) f.focus({ preventScroll: true });
  });

  // Dónde está la tele: siempre a mano, en toda la oficina. (Prototipo de dos formas, para elegir: ?tele=a, un botón,
  // arriba en el computador y junto a los controles en el celular; ?tele=b, la mini tele: una tele chiquita con el canal
  // en vivo, sin sonido, que cambia de canal sola y se prende en el canal que muestra)
  var HALLA = (/[?&]tele=([ab])/.exec(location.search) || [0, 'b'])[1];
  document.documentElement.classList.add('halla-' + HALLA);
  var mini = $('#mini-tele'), miniK = 0;
  function construirMini() {
    if (!mini || !CANAL) return;
    var C = canalesTele().filter(function (c) { return !c.tu; }), punto = leerJson('tv-punto');
    C.forEach(function (c, k) { if (punto && punto.id === c.id) miniK = k; });
    mini.querySelector('.mini-tele-pantalla').insertAdjacentHTML('afterbegin', C.map(function (c, k) {
      return '<img src="' + esc(c.mini) + '" alt="" width="160" height="90" loading="lazy" data-canal="' + esc(c.h) + '"' + (k === miniK ? ' class="ver"' : '') + '>';
    }).join(''));
    mini.querySelector('.mini-tele-n').textContent = dosCifras(miniK + 1);
    mini.addEventListener('click', function () { var v = mini.querySelector('.mini-tele-pantalla img.ver'); abrirTele(v ? v.getAttribute('data-canal') : null, mini); });
    setTimeout(zapMini, 4500);
  }
  // Cada 4,5 segundos, un golpe de estática y el canal que sigue (quieta con movimiento reducido o la oficina en pausa)
  function zapMini() {
    setTimeout(zapMini, 4500);
    if (document.hidden || rep.abierta || quieta() || !mini.offsetParent) return;
    var im = mini.querySelectorAll('.mini-tele-pantalla img'); if (im.length < 2) return;
    miniK = (miniK + 1) % im.length;
    mini.querySelector('.mini-tele-nieve').style.backgroundImage = 'url(' + nieveTele() + ')';
    mini.classList.add('zapea');
    setTimeout(function () {
      Array.prototype.forEach.call(im, function (x, k) { x.classList.toggle('ver', k === miniK); });
      mini.querySelector('.mini-tele-n').textContent = dosCifras(miniK + 1);
    }, 150);
    setTimeout(function () { mini.classList.remove('zapea'); }, 330);
  }
  construirMini();
  $('#barra-tele').addEventListener('click', function () { abrirTele(null, this); });

  /* ── Recorrido guiado: lo guía Atlas, que ve todo desde arriba ── */
  var GUIA = [
    ['zona', 'oficina', 'BiPlot HQ', 'Desde la calle, la oficina se ve cerrada, con su isotipo en el techo. Adentro está el equipo que hace cada sistema: entremos.'],
    ['zona', 'recepcion', 'Recepción', 'Entras y te recibe Plotty. Tres preguntas y te dice por dónde partir.'],
    ['zona', 'diagnostico', 'Sala de diagnóstico', 'Lupe hace el diagnóstico: el proceso real, los dolores en horas y pesos, y la línea base contra la que se mide todo.'],
    ['zona', 'planos', 'Planos y máquinas', 'The Architect traza el mapa y The Engine lo convierte en sistemas. Una sola mesa, de punta a punta.'],
    ['actor', 'celda', 'Celda · Datos y métricas', 'Abre tus planillas, encuentra lo que no cuadra y deja los datos listos.'],
    ['actor', 'grilla', 'Grilla · Diseño', 'Dibuja la maqueta antes de construir, para que la pruebes con tu equipo.'],
    ['actor', 'bucle', 'Bucle · Desarrollo', 'Construye por rebanadas: entregas cortas que funcionan solas.'],
    ['actor', 'tamandua', 'Tamandúa · Validación', 'Prueba todo en cuatro pantallas y con cada perfil antes de que llegue a ti.'],
    ['actor', 'faro', 'Faro · Puesta en marcha', 'Sube cada entrega a producción y enseña a usarla.'],
    ['zona', 'laboratorio', 'Laboratorio de métricas', 'A los 30, 60 y 90 días se mide contra la línea base. Si no bajó, se dice.'],
    ['zona', 'estanteria', 'Estantería del núcleo', 'Pepa guarda aquí lo que sirve para el próximo. También están los casos de referencia.'],
    ['zona', 'set', 'El set', 'Aquí graban Aby, la corresponsal, y Felipe, el rostro. Las dos caras reales de la oficina.'],
    ['zona', 'pasaje', 'El pasaje', 'Por aquí se sale a la calle: un local por proyecto, con su nombre y su logo en el techo. Toca uno para abrirlo, ver qué hicimos y entrar a su sala.'],
    ['zona', 'nuhome', 'Nu Home 360', 'Casas modulares: del primer contacto a la entrega, en una sola plataforma.'],
    ['zona', 'fundos', 'Fundos 360', 'Venta de parcelas: el terreno sobre la mesa y el ciclo de venta completo.'],
    ['zona', 'haru', 'Haru 360', 'Una barra de sushi con ventas, cocina, delivery y caja en un solo sistema.'],
    ['zona', 'eleven', 'Eleven 360', 'Un gimnasio que suma socios y no los suelta.'],
    ['zona', 'rumbo', 'Rumbo', 'Nuestra app para ordenar lo personal, un día a la vez.'],
    ['zona', 'archivo', 'El Archivo', 'El museo de BiPlot: del papel a hoy, con una pieza de cada desarrollo. Y el fichero, con todos los casos por rubro.'],
    ['zona', 'tv', 'BiPlot.TV', 'El canal de BiPlot: los capítulos animados, la oficina y los casos, en video. Hoy se estrena «Un bocado a la vez».'],
    ['zona', 'libre', 'Tu proyecto aquí', 'Este local está esperando el próximo proyecto. ¿Conversamos?']
  ].filter(function (g) { return g[0] === 'actor' || zonaPorId(g[1]); });
  var guia = $('#guia'), pasoGuia = 0;
  $('#guia-atlas').innerHTML = avatar('atlas');
  function iniciarGuia(i) {
    if (enSala) salirSala({ sinCamara: true });
    if (!panel.hidden) { detenerMedios(); panel.hidden = true; document.body.classList.remove('panel-abierto'); }
    cerrarIntro();
    guia.hidden = false; mostrarPaso(i || 0);
    $('#guia-sig').focus({ preventScroll: true });
  }
  function mostrarPaso(i) {
    pasoGuia = Math.max(0, Math.min(GUIA.length - 1, i));
    var g = GUIA[pasoGuia], obj = { tipo: g[0], id: g[1] };
    // Cada parada se ve desde donde está: adentro, con la oficina abierta; en la calle, con la oficina cerrada
    if (deAdentro(obj)) { if (!esc3.abierta()) entrarOficina({ sinCamara: true, sinHistoria: true }); }
    else if (esc3.abierta()) salirOficina({ sinCamara: true, sinHistoria: true });
    $('#guia-n').textContent = (pasoGuia + 1) + ' de ' + GUIA.length;
    $('#guia-t').textContent = g[2];
    $('#guia-txt').textContent = g[3];
    $('#guia-ant').disabled = pasoGuia === 0;
    $('#guia-sig').textContent = pasoGuia === GUIA.length - 1 ? 'Conversar con Plotty' : 'Siguiente';
    $('#guia-mas').textContent = g[1] === 'oficina' ? 'Entrar' : tieneSala(g[1]) ? 'Ver el local' : 'Ver más';
    // En la parada de un local, el local se abre (y el de la parada anterior se cierra)
    if (obj.tipo === 'zona' && esLocal(zonaPorId(obj.id))) abrirLocal(obj.id); else cerrarLocal();
    resaltar(obj);
    requestAnimationFrame(function () { irA(obj, 900); });
  }
  function terminarGuia() { guia.hidden = true; cerrarLocal(); resaltar(null); verTodo(); }
  $('#guia-ant').addEventListener('click', function () { mostrarPaso(pasoGuia - 1); });
  $('#guia-sig').addEventListener('click', function () {
    if (pasoGuia === GUIA.length - 1) { guia.hidden = true; abrir({ tipo: 'chat', id: 'plotty' }, false, $('#recorrer-toggle')); }
    else mostrarPaso(pasoGuia + 1);
  });
  $('#guia-mas').addEventListener('click', function () { var g = GUIA[pasoGuia]; guia.hidden = true; abrir({ tipo: g[0], id: g[1] }, false, $('#recorrer-toggle')); });
  $('#guia-salir').addEventListener('click', terminarGuia);

  /* ── Bienvenida ── */
  var intro = $('#intro');
  function cerrarIntro() { if (!intro.hidden) { intro.hidden = true; guardar('visto', '1'); } }
  $('#intro-oficina').addEventListener('click', function () { entrarOficina({ boton: $('#intro-oficina') }); escenaEl.focus({ preventScroll: true }); });
  $('#intro-guia').addEventListener('click', function () { iniciarGuia(0); });
  $('#intro-libre').addEventListener('click', function () { cerrarIntro(); encuadreInicial(true); escenaEl.focus({ preventScroll: true }); });
  if (leer('visto') === '1') intro.hidden = true;

  /* ── Inicio ── */
  if (window.innerWidth < 900 || leer('menu') === '0') alternarMenu(false);
  window.addEventListener('resize', function () { aplicar(); acomodarSala(); });
  if (leer('pausa') === '1' || reducido) pausar(true); else esc3.iniciar();
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) esc3.detener(); else if (!quieta() && !enSala) esc3.iniciar();
  });
  // Encuadre de la calle: la oficina cerrada y el barrio en escritorio; la entrada de la oficina y sus locales en celular.
  function encuadreCalle(dur) {
    if (window.innerWidth < 700) { var p = P(19.5, 21.5, 1.4); volar(p[0], p[1], zPara(760), dur); }
    else verTodo(dur);
  }
  function encuadreInicial(animar) { encuadreCalle(animar ? 600 : 0); }
  requestAnimationFrame(function () { encuadreInicial(false); document.documentElement.classList.add('lista'); });
  // Enlaces directos: oficina/#haru (la sala), #oficina (adentro), #lupe, #archivo, #calle-salud o #conversar.
  // biplot.cl/oficina/haru/ trae aquí. Lo que abre un enlace no suma pasos al historial.
  var desdeEnlace = false;
  function desdeHash() {
    desdeEnlace = true;
    try { irAlHash(decodeURIComponent(location.hash.replace('#', '')), !document.documentElement.classList.contains('navegado')); } finally { desdeEnlace = false; }
  }
  function irAlHash(h, primera) {
    if (!h) { if (enSala) salirSala({ sinHistoria: true }); if (esc3.abierta()) salirOficina({ sinHistoria: true }); return; }
    if (h === enSala) return;
    if (tieneSala(h) || esMuseo(h) || esVentas(h) || esCanal(h)) { entrarSala(h, { sinHistoria: true, directo: primera }); return; }
    if (enSala) salirSala({ sinHistoria: true, sinCamara: true });
    if (h === 'oficina' || h === 'planta-baja') { entrarOficina({ sinHistoria: true, directo: primera }); return; }
    if (h === 'conversar') { abrir({ tipo: 'chat', id: 'plotty' }); return; }
    if (h === 'piso-1' || h === 'calle' || h === 'barrio') { salirOficina({ sinHistoria: true, sinCamara: true }); resaltar({ tipo: 'zona', id: 'pasaje' }); irAGrupo(ORDEN_PRINCIPAL, 0); return; }
    if (/^calle-/.test(h) && calleId(h.slice(6))) { salirOficina({ sinHistoria: true, sinCamara: true }); var c = calleId(h.slice(6)); irAGrupo(c.casos.concat(['libre-' + c.id]), 0); return; }
    if (PERSONAL[h]) abrir({ tipo: 'actor', id: h }); else if (zonaPorId(h)) abrir({ tipo: 'zona', id: h });
  }
  setTimeout(function () { desdeHash(); document.documentElement.classList.add('navegado'); }, 60);
  window.addEventListener('popstate', desdeHash);
  window.addEventListener('hashchange', desdeHash);
})();
