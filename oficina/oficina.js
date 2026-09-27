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
      var ventana = zn.hq ? 1250 : zn.id === 'muro' || zn.id === 'recepcion' || zn.id === 'planos' ? 580 : zn.barrio ? 470 : 520;
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
    else if (obj.id === 'libre' || zn.libre) accion = 'Conversar con Plotty';
    else if (tieneSala(obj.id)) accion = 'Ver el local y su sala';
    else if (pr) accion = ESTADO_TXT[estadoDe(pr)] + ' · Ver el local';
    else if (obj.id === 'archivo') accion = 'Ver todos los casos';
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
        else if (o && (!resaltado || resaltado.id !== o.id)) { o.origen = 'mouse'; resaltar(o); }
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
    if (id === 'archivo') return { id: id, nombre: SALAS.archivo.nombre, sub: (BARRIO ? BARRIO.total : 0) + ' casos, por rubro', estado: 'lugar', color: '#7FD8CF' };
    if (id === 'libre' || /^libre-/.test(id)) return { id: id, nombre: PROYECTOS.libre.nombre, sub: 'Local disponible', estado: 'libre', color: '#7FD8CF', libre: true };
    if (!pr) return null;
    return { id: id, nombre: nombreCaso(pr), sub: pr.permiso === 'rubro' ? 'Caso sin nombre' : pr.rubro, estado: estadoDe(pr), chip: chipCaso(pr), color: pr.acento };
  }
  function callesDelBarrio() {
    var g = [{ id: 'principal', nombre: 'Calle principal', ids: ORDEN_PRINCIPAL }];
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
    detenerMedios();
    invocador = boton || document.activeElement;
    abierto = obj;
    panelCuerpo.innerHTML = obj.tipo === 'actor' ? htmlPersonaje(obj.id) : obj.tipo === 'chat' ? htmlChatPanel() : chatLibre ? htmlLibre(obj.id) : tieneSala(obj.id) ? htmlProyecto(PROYECTOS[obj.id]) : htmlZona(obj.id);
    panel.hidden = false; document.body.classList.add('panel-abierto'); panel.classList.remove('panel-sala');
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
    panel.hidden = true; abierto = null; resaltar(null); document.body.classList.remove('panel-abierto');
    if (invocador && invocador.focus && document.contains(invocador)) invocador.focus({ preventScroll: true });
    aplicar();
  }
  $('#panel-cerrar').addEventListener('click', cerrarPanel);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (window.innerWidth < 900 && !menu.classList.contains('cerrado')) { alternarMenu(false); $('#recorrer-toggle').focus(); return; }
    if ($('#lightbox') && !$('#lightbox').hidden) { cerrarLightbox(); return; }
    if (enSala) { salirSala(); return; }
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
    if (g) { e.preventDefault(); abrirLightbox(g.getAttribute('data-grande'), g.getAttribute('data-grande-v')); return; }
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
      (p.completo ? '<p class="completo">' + esc(p.completo) + (p.alias ? ' · le dicen ' + esc(p.alias) : '') + '</p>' : '') +
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
  // El Archivo: todos los casos, por rubro, con buscador
  function htmlArchivo() {
    var S = SALAS.archivo, grupos = D.plotty.preguntas[0].opciones.map(function (o) {
      var lista = D.proyectos.filter(function (p) { return !p.libre && p.calle === o[0]; });
      return lista.length ? '<section class="archivo-grupo"><h3>' + esc(o[1]) + '</h3><ul class="lugares">' + lista.map(function (p) {
        var st = p.permiso === 'archivo' ? 'Sólo en El Archivo' : chipCaso(p);
        var accion = p.permiso === 'archivo' ? '' : '<a href="#" data-abrir="zona:' + esc(p.id) + '">Ver el local</a>';
        return '<li data-busca="' + esc(normal(nombreCaso(p) + ' ' + p.rubro + ' ' + o[1])) + '"><span class="punto" style="background:' + esc(p.acento || '#35679A') + '" aria-hidden="true"></span><span class="mt"><b>' + esc(nombreCaso(p)) + '</b><span>' + esc(p.permiso === 'rubro' ? 'Caso sin nombre' : p.rubro) + ' · ' + esc(st) + '</span>' + accion + '</span></li>';
      }).join('') + '</ul></section>' : '';
    }).join('');
    return vistaSala('archivo') + '<p class="bp-etiqueta">' + esc(S.etiqueta) + '</p><h2 id="panel-titulo" tabindex="-1">' + esc(S.titulo) + '</h2><p>' + esc(S.texto) + '</p>' +
      '<div class="menu-busca archivo-busca"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input type="search" placeholder="Busca por nombre o rubro" aria-label="Buscar en El Archivo" autocomplete="off"></div>' +
      '<div class="archivo-lista">' + grupos + '</div><p class="archivo-vacio nota" hidden>No hay casos con ese nombre o rubro.</p>' +
      '<p class="nota">Los casos de referencia del núcleo (negocios ilustrativos, no clientes) están en la estantería.</p>' + chipsEquipo(['pepa']);
  }
  function iniciarArchivo() {
    var inp = panelCuerpo.querySelector('.archivo-busca input');
    inp.addEventListener('input', function () {
      var q = normal(inp.value).trim(), hay = 0;
      panelCuerpo.querySelectorAll('.archivo-grupo').forEach(function (g) {
        var n = 0; g.querySelectorAll('li').forEach(function (li) { var si = !q || li.getAttribute('data-busca').indexOf(q) > -1; li.hidden = !si; if (si) n++; });
        g.hidden = !n; hay += n;
      });
      panelCuerpo.querySelector('.archivo-vacio').hidden = hay > 0;
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
      vs.innerHTML = '<svg viewBox="' + S.vb + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g class="quieto sin-pines">' + S.svg.replace(/§M§/g, MEDIOS) + '</g></svg>';
    });
    var vl = panelCuerpo.querySelector('[data-vista-local]');
    if (vl) conLocales(function () {
      var pr = PROYECTOS[vl.getAttribute('data-vista-local')], Lc = window.Locales; if (!pr || !document.contains(vl)) return;
      var est = estadoDe(pr), adentro = est === 'abierto' || est === 'inauguracion' ? Lc.interior[pr.plantilla] || Lc.interior.basica : Lc.interior[est] || Lc.interior.basica;
      adentro += Lc.frente + (est === 'inauguracion' ? Lc.extra.inauguracion : '') + (est === 'abierto' && String(pr.fase || 'E9') === 'E9' ? Lc.extra.placa90 : '');
      var o = { color: pr.acento, nombre: pr.permiso === 'rubro' ? String(pr.rubro || '').split(' · ')[0].split(',')[0].toUpperCase() : String(pr.letrero || pr.nombre || '').toUpperCase(), lema: pr.lema, lineas: pr.lineas };
      // El cuadro: el local entero (con su letrero colgante), en 16:9
      var q = [P(0, 0, 2.3), P(4.6, 0, 2.3), P(4.6, 5.4, 0), P(0, 5.4, 0), P(0, 4.3, 0)];
      var x0 = Math.min.apply(null, q.map(function (c) { return c[0]; })) - 16, x1 = Math.max.apply(null, q.map(function (c) { return c[0]; })) + 16;
      var y0 = Math.min.apply(null, q.map(function (c) { return c[1]; })), y1 = Math.max.apply(null, q.map(function (c) { return c[1]; }));
      var w = x1 - x0, h = w * 9 / 16, cy = (y0 + y1) / 2;
      vl.innerHTML = '<svg viewBox="' + [x0, cy - h / 2, w, h].map(Math.round).join(' ') + '" aria-hidden="true"><g class="quieto">' + window.Escena.pintar(adentro, o) + '</g></svg>';
    });
  }
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
    var pr = PROYECTOS.libre, calle = calleDe(id);
    return vistaSala(id) + '<p class="bp-etiqueta">' + esc(pr.rubro) + (calle ? ' · ' + esc(calle) : '') + '</p>' +
      '<h2 id="panel-titulo" tabindex="-1">' + esc(pr.nombre) + '</h2>' +
      '<p class="lema">' + esc(pr.esencia) + '</p><p>' + esc(pr.resumen) + '</p>' + htmlChat();
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
    if (id === 'set') return vistaSala('set') + cab() + chipsEquipo(['aby']);
    if (id === 'laboratorio') return vistaSala('laboratorio') + cab() + puntos() + chipsEquipo(['celda', 'lupe']);
    if (id === 'reuniones') return vistaSala('reuniones') + cab() + '<div class="acciones">' + botonChat('Agendar con Plotty') + '</div>';
    if (id === 'pasaje') return vistaSala('pasaje') + cab() + htmlDirectorio();
    if (id === 'archivo') return htmlArchivo();
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
    soltarPanel(true);
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
  var salaEl = $('#sala'), salaCaja = $('#sala-dibujo-caja'), enSala = null, pinActual = 0;
  var salasCargando = false, salasEspera = [];
  function conSalas(fn) {
    if (window.Salas) { fn(); return; }
    salasEspera.push(fn); if (salasCargando) return; salasCargando = true;
    var s = document.createElement('script'); s.src = 'salas.js';
    s.onload = function () {
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      defs.setAttribute('class', 'sprite-quieto'); defs.setAttribute('aria-hidden', 'true');
      defs.innerHTML = '<defs>' + window.Salas.defs + '</defs>';
      document.body.appendChild(defs);
      salasEspera.splice(0).forEach(function (f) { f(); });
    };
    s.onerror = function () { salasEspera = []; salasCargando = false; };
    document.head.appendChild(s);
  }
  var localesCargando = false, localesEspera = [];
  function conLocales(fn) {
    if (window.Locales) { fn(); return; }
    localesEspera.push(fn); if (localesCargando) return; localesCargando = true;
    conSalas(function () {
      var s = document.createElement('script'); s.src = 'locales.js';
      s.onload = function () {
        var defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        defs.setAttribute('class', 'sprite-quieto'); defs.setAttribute('aria-hidden', 'true');
        defs.innerHTML = '<defs>' + window.Locales.defs + '</defs>';
        document.body.appendChild(defs);
        localesEspera.splice(0).forEach(function (f) { f(); });
      };
      s.onerror = function () { localesEspera = []; localesCargando = false; };
      document.head.appendChild(s);
    });
  }
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
  }
  function entrarSala(id, o) {
    o = o || {};
    var pr = PROYECTOS[id]; if (!pr) return;
    if (!guia.hidden) { guia.hidden = true; }
    cerrarIntro();
    if (esc3.abierta()) salirOficina({ sinCamara: true, sinHistoria: true });
    var ya = enSala;
    detenerMedios();
    // Cada sala tiene su dirección (#haru): el botón «atrás» del navegador vuelve a la calle. Si ya hay una entrada nuestra
    // en el historial (otra sala o la calle a la que se volvió), se reemplaza, para no llenarlo.
    if (!o.sinHistoria && location.hash !== '#' + id) {
      var nuestra = history.state && (history.state.sala || history.state.calle);
      history[ya || nuestra ? 'replaceState' : 'pushState']({ sala: id }, '', '#' + id);
    }
    enSala = id; invocador = o.boton || invocador || document.activeElement; abierto = { tipo: 'sala', id: id };
    document.body.classList.add('en-sala');
    resaltar({ tipo: 'zona', id: id }); ocultarRotulo();
    // El panel con todo lo de la empresa
    panelCuerpo.innerHTML = htmlSala(pr);
    panel.hidden = false; panel.classList.add('panel-sala'); document.body.classList.add('panel-abierto');
    $('#panel-nombre').textContent = tituloPanel({ tipo: 'sala', id: id });
    $('#panel-cerrar').setAttribute('aria-label', 'Volver a la calle');
    panel.setAttribute('aria-label', 'La sala de ' + pr.nombre);
    panel.scrollTop = 0; panelCuerpo.scrollTop = 0;
    esc3.detener();
    var mostrar = function () {
      conSalas(function () {
        if (enSala !== id) return;
        pintarSala(id);
        salaEl.hidden = false; acomodarSala();
        requestAnimationFrame(function () { salaEl.classList.add('visible'); });
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
    var S = window.Salas.salas[id], pr = PROYECTOS[id]; if (!S) return;
    salaCaja.innerHTML = '<svg class="sala-svg" viewBox="' + S.vb + '" preserveAspectRatio="xMidYMid meet" role="group" aria-label="La sala de ' + esc(pr.nombre) + ': ' + esc(pr.esencia) + '">' +
      '<g id="sala-dibujo" class="sala-dibujo' + (reducido ? ' quieto' : '') + '">' + S.svg.replace(/§M§/g, MEDIOS) + '</g></svg>';
    salaCaja.querySelectorAll('.pin').forEach(function (g) {
      var p = (pr.pines || [])[g.getAttribute('data-pin') - 1];
      g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
      g.setAttribute('aria-label', p ? g.getAttribute('data-pin') + '. ' + p[0] + ': ' + p[1] : 'Punto ' + g.getAttribute('data-pin'));
    });
    $('#sala-nombre').textContent = pr.nombre;
    // Las salas vecinas, en el orden de la calle
    var i = CON_SALA.indexOf(id), ant = CON_SALA[i - 1], sig = CON_SALA[i + 1];
    var bA = $('#sala-ant'), bS = $('#sala-sig');
    bA.hidden = !ant; bS.hidden = !sig;
    if (ant) { bA.setAttribute('data-sala', ant); bA.querySelector('span').textContent = PROYECTOS[ant].nombre; }
    if (sig) { bS.setAttribute('data-sala', sig); bS.querySelector('span').textContent = PROYECTOS[sig].nombre; }
    elegirPin(1, false, true);
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
    enSala = null;
    salaEl.classList.remove('visible'); salaEl.hidden = true; salaCaja.innerHTML = '';
    document.body.classList.remove('en-sala');
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
  function copiar(btn) {
    var url = btn.getAttribute('data-url'), code = btn.parentNode.querySelector('code');
    function listo() { btn.textContent = 'Copiado'; setTimeout(function () { btn.textContent = 'Copiar'; }, 1600); }
    function seleccionar() { var r = document.createRange(); r.selectNodeContents(code); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
    try { navigator.clipboard.writeText(url).then(listo, seleccionar); } catch (e) { seleccionar(); }
  }
  function compartir(btn) {
    var pr = PROYECTOS[enSala];
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
  function activarMedios() {
    var v = panelCuerpo.querySelector('video.panel-video'); if (!v) return;
    v.src = v.getAttribute('data-src');
    var auto = !reducido && window.innerWidth >= 900 && !(navigator.connection && navigator.connection.saveData);
    if (auto) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.setAttribute('controls', '');
  }
  function detenerMedios() { var v = panelCuerpo.querySelector('video'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); } }
  var lightbox = $('#lightbox'), lbVideo = $('#lightbox video');
  function abrirLightbox(h, v) {
    lbVideo.src = (v && window.innerHeight > window.innerWidth) ? v : h;
    lightbox.hidden = false; lbVideo.muted = false;
    var pr = lbVideo.play(); if (pr && pr.catch) pr.catch(function () {});
    $('#lightbox-cerrar').focus();
  }
  function cerrarLightbox() { lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load(); lightbox.hidden = true; var b = panelCuerpo.querySelector('.media-grande'); if (b) b.focus(); }
  $('#lightbox-cerrar').addEventListener('click', cerrarLightbox);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) cerrarLightbox(); });

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
    ['zona', 'set', 'El set', 'Aquí graba Aby, la corresponsal. La única cara real de la oficina.'],
    ['zona', 'pasaje', 'El pasaje', 'Por aquí se sale a la calle: un local por proyecto, con su nombre y su logo en el techo. Toca uno para ver qué hicimos y entrar a su sala.'],
    ['zona', 'nuhome', 'Nu Home 360', 'Casas modulares: del primer contacto a la entrega, en una sola plataforma.'],
    ['zona', 'fundos', 'Fundos 360', 'Venta de parcelas: el terreno sobre la mesa y el ciclo de venta completo.'],
    ['zona', 'haru', 'Haru 360', 'Una barra de sushi con ventas, cocina, delivery y caja en un solo sistema.'],
    ['zona', 'eleven', 'Eleven 360', 'Un gimnasio que suma socios y no los suelta.'],
    ['zona', 'rumbo', 'Rumbo', 'Nuestra app para ordenar lo personal, un día a la vez.'],
    ['zona', 'archivo', 'El Archivo', 'Todos los casos tienen su carpeta, por rubro. Cuando llega un rubro nuevo, se abre su calle.'],
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
    resaltar(obj);
    requestAnimationFrame(function () { irA(obj, 900); });
  }
  function terminarGuia() { guia.hidden = true; resaltar(null); verTodo(); }
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
    if (tieneSala(h)) { entrarSala(h, { sinHistoria: true, directo: primera }); return; }
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
