/*
 * Oficina BiPlot · conexión con el CRM
 * Antes de dibujar, la oficina le pregunta al CRM de BiPlot qué liberaron los socios para cada sala («Avances para el
 * cliente»): la fase, el porcentaje, la etapa y quién la lleva, el equipo con la línea de cada integrante y los módulos
 * liberados. Lo deja en su proyecto de datos.js (`avances`, y además su `fase` y su `equipo`) y oficina.js lo muestra en
 * la sala: en la tarjeta del rincón de BiPlot y en lo que dice quien está ahí.
 * Un proyecto con `porcentaje: null` todavía no usa avances: su sala sigue con lo de datos.js. Si el CRM falla, no
 * responde en 3 segundos o algo viene raro, la oficina arranca con lo de datos.js, como siempre.
 * Sólo se le pregunta desde biplot.cl (el CRM no le responde a otros orígenes): en un archivo local, en una vista previa
 * o en las pruebas, la oficina arranca al tiro con lo de datos.js.
 * Nada de lo que viene del CRM se escribe como HTML: aquí sólo se revisa y oficina.js lo pone como texto.
 */
(function () {
  'use strict';

  // Lo que la oficina le pide al CRM. Es la única dirección que hay que cambiar cuando el CRM pase a https://crm.biplot.cl
  var CRM_OFICINA = 'https://biplot-crm.vercel.app/api/publico/oficina';
  // Desde dónde se le pregunta: los orígenes a los que el CRM les responde (su LEADS_ORIGINS)
  var ORIGENES = ['https://biplot.cl', 'https://www.biplot.cl'];
  // Lo más que se espera al CRM antes de dibujar, en milisegundos
  var PLAZO = 3000;

  var D = window.OFICINA_DATOS, esperan = [], arrancada = false;
  var raiz = document.documentElement, oficina = document.getElementById('oficina');

  // oficina.js arranca con esto: al tiro si no hay a quién esperar, o cuando el CRM respondió (o se le acabó el plazo)
  window.OficinaCRM = {
    listo: function (fn) { if (arrancada) fn(); else esperan.push(fn); }
  };
  function arrancar() {
    if (arrancada) return;
    arrancada = true;
    raiz.classList.remove('esperando-crm');
    if (oficina) oficina.removeAttribute('aria-busy');
    esperan.splice(0).forEach(function (fn) { fn(); });
  }

  /* ── Lo que trae el CRM, revisado ── */
  var FASE = /^E[0-9]$/;
  // La imagen de un módulo: la de ese módulo en el CRM, y se pide siempre al mismo CRM de CRM_OFICINA
  var IMAGEN = /^https:\/\/[^\/?#]+\/api\/publico\/avances\/([a-z0-9]{8,40})\/imagen$/;
  var ORIGEN_CRM = CRM_OFICINA.replace(/^(https:\/\/[^\/]+).*$/, '$1');
  // Los integrantes que llevan las fases del motor: los únicos que puede nombrar el CRM
  var QUIENES = [];
  function tiene(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  // Un texto del CRM en una línea; null si no es texto, viene vacío (cuando no puede) o es demasiado largo
  function texto(v, max, vacio) {
    if (typeof v !== 'string') return null;
    var t = v.replace(/\s+/g, ' ').trim();
    return (t || vacio) && t.length <= max ? t : null;
  }
  // Los avances de una sala; null si algo viene raro (entonces esa sala sigue con lo de datos.js)
  function avancesDe(x) {
    var n = x.porcentaje;
    if (typeof n !== 'number' || n % 1 !== 0 || n < 0 || n > 100) return null;
    if (x.fase !== null && !FASE.test(x.fase)) return null;
    var etapa = texto(x.etapa, 60), integrante = x.integrante == null ? '' : texto(x.integrante, 80, true);
    var placa = x.placa == null || x.placa === '' ? '' : FASE.test(x.placa) ? x.placa : null;
    if (!etapa || integrante === null || placa === null || !Array.isArray(x.equipo) || !Array.isArray(x.modulos)) return null;
    // El equipo: sólo integrantes conocidos, una vez cada uno y con su línea
    var equipo = [], vistos = {};
    x.equipo.forEach(function (m) {
      var i = m && typeof m.id === 'string' ? QUIENES.indexOf(m.id) : -1, linea = i > -1 ? texto(m.linea, 200) : null;
      if (linea && !vistos[QUIENES[i]]) { vistos[QUIENES[i]] = true; equipo.push({ id: QUIENES[i], linea: linea }); }
    });
    // Los módulos liberados: su título, su texto (puede ir vacío) y su imagen, si es una del CRM
    var modulos = [];
    x.modulos.forEach(function (m) {
      if (!m || modulos.length >= 30) return;
      var titulo = texto(m.titulo, 160), cuerpo = m.texto == null ? '' : texto(m.texto, 600, true);
      var img = typeof m.imagen === 'string' ? IMAGEN.exec(m.imagen) : null;
      if (titulo && cuerpo !== null) modulos.push({ titulo: titulo, texto: cuerpo, imagen: img ? ORIGEN_CRM + '/api/publico/avances/' + img[1] + '/imagen' : null });
    });
    return { etapa: etapa, integrante: integrante, placa: placa, fase: x.fase, porcentaje: n, equipo: equipo, modulos: modulos };
  }
  // Cada sala con avances deja los suyos en su proyecto (las demás quedan como están)
  function aplicar(json) {
    if (!json || !Array.isArray(json.salas)) return;
    var porId = {}, hechas = {};
    D.proyectos.forEach(function (p) { if (!p.libre) porId[p.id] = p; });
    json.salas.forEach(function (x) {
      if (!x || typeof x.sala !== 'string' || !tiene(porId, x.sala) || tiene(hechas, x.sala)) return;
      hechas[x.sala] = true;
      // Sin porcentaje, el proyecto todavía no usa avances: su sala sigue como hoy
      if (x.porcentaje == null) return;
      var av = avancesDe(x), pr = porId[x.sala]; if (!av) return;
      pr.avances = av;
      // La fase manda cómo se ve su local (sin fase pendiente, todo lo que ve el cliente está entregado)
      pr.fase = av.fase || 'E9';
      if (av.equipo.length) pr.equipo = av.equipo.map(function (m) { return m.id; });
    });
  }

  /* ── La pregunta ── */
  if (!D || !D.fases || !D.proyectos || ORIGENES.indexOf(location.origin) < 0 || !window.XMLHttpRequest) { arrancar(); return; }
  D.fases.forEach(function (f) { f.quien.forEach(function (id) { if (QUIENES.indexOf(id) < 0) QUIENES.push(id); }); });
  // Mientras se espera, la escena no se ve (como siempre antes de dibujar) y lo que todavía no responde, tampoco
  raiz.classList.add('esperando-crm');
  if (oficina) oficina.setAttribute('aria-busy', 'true');
  var pedido = new XMLHttpRequest();
  pedido.open('GET', CRM_OFICINA, true);
  pedido.timeout = PLAZO;
  pedido.onload = function () {
    if (pedido.status === 200) {
      try { aplicar(JSON.parse(pedido.responseText)); } catch (e) { /* vino algo raro: queda lo de datos.js */ }
    }
    arrancar();
  };
  pedido.onerror = pedido.ontimeout = pedido.onabort = arrancar;
  try { pedido.send(); } catch (e) { arrancar(); }
})();
