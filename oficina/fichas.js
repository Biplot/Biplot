/*
 * Oficina BiPlot · las fichas públicas
 * Lo público de un proyecto con ficha (nombre, rubro, estado, textos, módulos, enlaces, media y equipo) no se escribe
 * aquí: lo arma el proceso de la vitrina desde el vitrina.json de su repo, con su fase y su permiso, y llega por un PR
 * a ../vitrina/ (proyectos.js, cargado antes de datos.js). Este archivo lo pone encima de su proyecto de datos.js, que
 * deja sólo lo de la oficina: su dibujo, su sala propia y su gente. Ver README.md, «Las fichas públicas».
 * - Un proyecto de datos.js con `ficha: true` que no viene en lo generado sale de la oficina: su permiso se revocó.
 * - Uno que viene y no está en datos.js entra como un local más de su calle.
 * - Con un permiso que no es «nombre», no se muestra: la oficina todavía no dibuja los casos sin nombre ni el fichero
 *   de El Archivo desde las fichas, y mostrar de menos es lo seguro.
 * - Si ../vitrina/proyectos.js no cargó o viene raro, datos.js queda como estaba.
 * Nada de lo que llega se escribe como HTML: oficina.js lo pone como texto, igual que lo de datos.js.
 */
(function () {
  'use strict';

  var D = window.OFICINA_DATOS, V = window.BIPLOT_VITRINA;
  if (!D || !Array.isArray(D.proyectos)) return;
  if (!V || V.contrato !== 'vitrina-generada/1' || !Array.isArray(V.proyectos)) return;

  // Las rutas de lo generado son desde la raíz de biplot; la oficina vive en /oficina/
  var RAIZ = '../';
  // Las pantallas de los módulos se piden como MEDIOS + id + '.webp' (oficina.js, MEDIOS = 'media/salas/'): desde
  // oficina/media/salas/ hay que subir tres carpetas para llegar a la raíz
  var DESDE_MEDIOS = '../../../';
  var MEDIO = /^vitrina\/media\/[a-z0-9-]+\/[a-z0-9-]+\.(?:mp4|webp|jpg|png)$/;

  function texto(v) { return typeof v === 'string' && v.trim() ? v : null; }
  function lista(v) { return Array.isArray(v) ? v : []; }
  function medio(ruta) { return typeof ruta === 'string' && MEDIO.test(ruta) ? ruta : null; }

  // Lo generado, en la forma de un proyecto de datos.js; null si le falta algo
  function proyectoDe(g) {
    if (!g || g.permiso !== 'nombre') return null;
    var p = { id: g.id, nombre: texto(g.nombre), cliente: texto(g.cliente), rubro: texto(g.rubro), estado: texto(g.estado),
      corto: texto(g.etapa), calle: texto(g.calle), acento: texto(g.acento), esencia: texto(g.esencia), resumen: texto(g.resumen),
      medicion: texto(g.medicion) };
    for (var k in p) if (p[k] === null) return null;
    p.puntos = lista(g.puntos).map(function (x) { return [x.titulo, x.detalle]; });
    // El cuarto valor de cada pin es la pantalla, sin «.webp» (oficina.js se lo agrega): sólo pantallas webp
    p.pines = lista(g.modulos).map(function (m) {
      var r = medio(m.pantalla);
      return [m.modulo, m.titulo, m.detalle, r && /\.webp$/.test(r) ? DESDE_MEDIOS + r.replace(/\.webp$/, '') : null];
    });
    p.enlaces = lista(g.enlaces).map(function (l) { return { texto: l.texto, url: l.url }; });
    p.equipo = lista(g.equipo).slice();
    var m = {};
    lista(g.media).forEach(function (x) { var r = medio(x.archivo); if (r) m[x.tipo] = RAIZ + r; });
    p.media = m['video-horizontal'] && m.poster ? { h: m['video-horizontal'], v: m['video-vertical'] || '', poster: m.poster } : null;
    p.nota = texto(g.nota) || '';
    return p;
  }

  var generados = {};
  V.proyectos.forEach(function (g) { var p = proyectoDe(g); if (p) generados[p.id] = p; });

  // Lo de la ficha reemplaza lo de datos.js; lo de la oficina (salaPropia, libre, fase…) queda
  var CAMPOS = ['nombre', 'cliente', 'rubro', 'estado', 'corto', 'calle', 'acento', 'esencia', 'resumen', 'medicion', 'puntos', 'pines', 'enlaces', 'equipo', 'media', 'nota'];
  var quedan = [], sale = {};
  D.proyectos.forEach(function (p) {
    var g = generados[p.id];
    if (g) {
      CAMPOS.forEach(function (k) { p[k] = g[k]; });
      p.ficha = true;
      delete generados[p.id];
      quedan.push(p);
    } else if (p.ficha) {
      sale[p.id] = true;
    } else {
      quedan.push(p);
    }
  });
  // Los que llegan sin estar en datos.js: un local más de su calle
  Object.keys(generados).forEach(function (id) { generados[id].ficha = true; quedan.push(generados[id]); });
  D.proyectos = quedan;

  // Los que salieron tampoco quedan en la vitrina de la recepción
  if (D.vitrina) {
    var fuera = function (ids) { return lista(ids).filter(function (id) { return !sale[id]; }); };
    D.vitrina.porDefecto = fuera(D.vitrina.porDefecto);
    if (D.vitrina.rubros) Object.keys(D.vitrina.rubros).forEach(function (r) { D.vitrina.rubros[r] = fuera(D.vitrina.rubros[r]); });
  }
})();
