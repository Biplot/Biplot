#!/usr/bin/env node
// Genera los dibujos de la oficina a partir de sus fuentes (sin dependencias: Node 22+):
//   oficina/elenco.js         el elenco cabezón que vive en la escena (window.Elenco)
//   oficina/ilustraciones.js  las ilustraciones de las fichas y del kit (window.Ilustraciones)
//   oficina/barrio.js         la oficina cerrada y su calle: locales con su techo, plaza, pasaje, El Archivo y las piezas
//                             de las calles por rubro, que escena.js arma a partir de datos.js (window.Barrio)
//   oficina/locales.js        cada local por dentro, como se ve al abrirlo en la calle: los de la calle principal y el
//                             de un caso según su plantilla o su estado, con su gente y quien camina (window.Locales);
//                             se carga al abrir el primer local
//   oficina/salas.js          la sala grande de cada empresa, con su gente, quienes caminan y un punto por módulo
//                             (window.Salas); se carga al entrar a una sala, después de locales.js. Una sala propia
//                             (la de Nu Home) no lleva puntos: trae sus lugares, sus zonas y dónde está su gente
//   oficina/<sala>/index.html la página para compartir cada sala (biplot.cl/oficina/haru): trae su vista previa
//                             (kit/png/sala-<sala>-og.png) y lleva a la oficina, directo a esa sala (#haru)
//
// Uso, desde la raíz del repo:  node oficina/_herramientas/dibujos/generar.mjs
//
// Fuentes: cabezones/ (personajes de oficina), ilustracion/ (personajes de ficha y redes) y barrio/ (la calle, sus
// locales, las plantillas por rubro, la gente del barrio y las salas grandes).
// Las medidas de cada cabezón (caja, centro y pies) están en cabezones/medidas.json.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { VECTOR } from './cabezones/todos.mjs';
import { callePrincipal, piezas, adentro, G, HQ, PRINCIPAL, CAMINANTES, DE_PASO } from './barrio/barrio.mjs';
import { PASO } from './barrio/maqueta.mjs';
import { SALAS_GRANDES } from './barrio/salas-grandes.mjs';
import { SALAS_PROPIAS } from './barrio/salas-propias/index.mjs';
// Las salas de cada empresa y la de El Archivo (el museo de BiPlot): todas son salas propias (sin números); la de Nu Home
// está en salas-grandes.mjs
const SALAS = { ...SALAS_PROPIAS, ...SALAS_GRANDES };
import { VISITANTES } from './barrio/visitantes.mjs';
import { DEFS_ENTORNO } from './barrio/entorno.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const oficina = path.resolve(aqui, '..', '..');
const MED = JSON.parse(readFileSync(path.join(aqui, 'cabezones', 'medidas.json'), 'utf8'));
const CABECERA = (que) => `/*\n * Oficina BiPlot · ${que}\n * Generado por _herramientas/dibujos/generar.mjs desde sus fuentes. No se edita a mano.\n */\n`;

// Números con un decimal: los dibujos pesan la mitad y no se nota a ninguna escala de la oficina.
const redondear = (svg) => svg.replace(/-?\d+\.\d{2,}/g, (m) => String(Math.round(parseFloat(m) * 10) / 10));
const prefijar = (svg, p) => svg.replace(/id="([^"]+)"/g, `id="${p}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${p}-$1)`).replace(/href="#([^"]+)"/g, `href="#${p}-$1"`);
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + ' KB';

/* ───────── Elenco cabezón ───────── */
// En la escena, 1 unidad de personaje = 4 unidades de dibujo: pies en (0, 0) y entre 200 y 260 de alto,
// igual que el elenco anterior (la escena lo usa a 0,34 y la credencial a ~0,45).
const ESCALA = 4;
const IDS = ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle', 'tamandua', 'faro', 'pepa', 'aby', 'felipe', 'atlas', 'plotty'];
const MASCOTAS = ['atlas', 'plotty'];
const sprite = {}, alto = {}, ancho = {};
for (const id of IDS) {
  const m = MED[id];
  const partes = VECTOR[id]().svg({ partes: true });
  sprite[id] = { t: `${-m.cx} ${-m.pie}`, s: redondear(partes.sil), c: redondear(partes.color) };
  alto[id] = Math.round(m.alto * ESCALA);
  ancho[id] = Math.round(m.ancho * ESCALA);
}
const elenco = CABECERA('elenco') + `/*
 * Cada integrante en vector, cabezón y con el mismo trazo de la oficina. Coordenadas locales: pies en (0, 0).
 * Elenco.svg(id)           → <g> del personaje (con clases para animar en oficina.css)
 * Elenco.defs()            → <defs> compartidos (una vez por documento)
 * Elenco.placaTarjeta(p)   → credencial grande para fichas y paneles
 * Elenco.flota[id]         → altura a la que flotan las mascotas, en baldosas
 */
(function () {
  'use strict';

  var C = {
    niebla: '#F2F4F7', blanco: '#FFFFFF', grafito: '#1C1C1E',
    a900: '#091D33', a800: '#0E2A47', a700: '#17446F', a600: '#35679A', a500: '#5B6B7F',
    a400: '#6B7A8C', a300: '#B9C8D8', a200: '#C4D2E0', a150: '#D5E2EE', a50: '#EDF1F5',
    cian: '#17C3B2', c700: '#0A8A7E', c600: '#168A86', c300: '#7FD8CF', vidrio: '#DDF4F1', naranjo: '#F5883A'
  };
  var ESCALA = ${ESCALA};
  var SPRITE = ${JSON.stringify(sprite)};
  var ALTO = ${JSON.stringify(alto)};
  var ANCHO = ${JSON.stringify(ancho)};
  var MASCOTAS = ${JSON.stringify(MASCOTAS)};

  function defs() {
    return '<defs><radialGradient id="pj-halo"><stop offset="0" stop-color="' + C.cian + '" stop-opacity=".55"/><stop offset="1" stop-color="' + C.cian + '" stop-opacity="0"/></radialGradient></defs>';
  }

  // El cuerpo respira desde los pies; las mascotas flotan.
  function svg(id) {
    if (!SPRITE[id]) return '';
    var clase = MASCOTAS.indexOf(id) > -1 ? 'pj-flota' : 'pj-cuerpo';
    var S = SPRITE[id];
    return '<g class="pj pj-' + id + '"><g class="' + clase + '"><g transform="scale(' + ESCALA + ') translate(' + S.t + ')">' +
      S.s + '<g transform="translate(.28 .36)">' + S.s + '</g>' + S.c + '</g></g></g>';
  }

  // Credencial grande (placa) para paneles y fichas: 300 × 190.
  function placaTarjeta(p, retrato, op) {
    var masc = MASCOTAS.indexOf(p.id) > -1, alto = ALTO[p.id] || 220, ancho = ANCHO[p.id] || 110;
    var k = Math.min(masc ? 0.9 : 0.46, (masc ? 96 : 104) / alto, 84 / ancho);
    var arriba = { aby: 'PRENSA', felipe: 'PRENSA', atlas: 'MASCOTA', plotty: 'MASCOTA' }[p.id] || 'EQUIPO';
    var nombre = p.nombre, largo = nombre.length > 9;
    return '<g class="placa-grande">' +
      '<rect x="0" y="0" width="300" height="190" rx="16" fill="' + C.niebla + '"/>' +
      '<path d="M0 44 V16 a16 16 0 0 1 16 -16 H284 a16 16 0 0 1 16 16 V44 Z" fill="' + C.a800 + '"/>' +
      (op && op.isoSimple
        // Bajo 28 px el manual pide priorizar el cuadrado y el punto coral
        ? '<rect x="14" y="8" width="28" height="28" rx="7" fill="url(#bp-sq)" stroke="#7fd8cf" stroke-width=".8"/><circle cx="33.5" cy="17.5" r="3.4" fill="#FF6B4A"/>'
        : '<g transform="translate(14 8) scale(.28)">' + ISO + '</g>') +
      '<text x="50" y="30" font-family="Space Mono, monospace" font-weight="700" font-size="18" fill="' + C.niebla + '" letter-spacing="-1">Bi<tspan font-family="Space Grotesk, sans-serif" fill="' + C.cian + '" letter-spacing="0">Plot</tspan></text>' +
      '<text x="284" y="29" text-anchor="end" font-family="Space Grotesk, sans-serif" font-weight="600" font-size="11" letter-spacing="3" fill="' + C.a300 + '">' + arriba + '</text>' +
      '<rect x="16" y="58" width="92" height="116" rx="10" fill="' + C.a800 + '"/>' +
      (retrato ? '<g transform="translate(62 ' + (masc ? 160 : 170) + ') scale(' + k + ')">' + svg(p.id) + '</g>' : '') +
      '<text x="124" y="92" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="' + (largo ? 20 : 30) + '" fill="' + C.a800 + '" letter-spacing="-.5">' + nombre + '</text>' +
      '<text x="124" y="118" font-family="Space Grotesk, sans-serif" font-weight="600" font-size="' + (p.rol.length > 18 ? 12.5 : 15) + '" fill="#0B776D">' + p.rol + '</text>' +
      '<rect x="124" y="136" width="' + (p.placa.length > 3 ? 84 : 58) + '" height="30" rx="8" fill="' + C.cian + '"/>' +
      '<text x="' + (p.placa.length > 3 ? 166 : 153) + '" y="157" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="' + (p.placa.length > 3 ? 14 : 17) + '" fill="' + C.a800 + '">' + p.placa + '</text>' +
      (p.placa.length > 3 ? '' : '<path d="M196 160 L214 146 L232 150 L252 134 L270 138" stroke="' + C.a300 + '" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>') +
      '</g>';
  }

  // Isotipo oficial (04-marca/logo/isotipo.svg), sin cambios de color ni de forma. Usa el degradado #bp-sq.
  var ISO = '<rect x="4" y="4" width="92" height="92" rx="22" fill="url(#bp-sq)" stroke="#7fd8cf" stroke-width="2.4"/>' +
    '<path d="M27 23V75H80" fill="none" stroke="#35679a" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M31 67L45 53L59 57L72 35" fill="none" stroke="#168a86" stroke-width="3.6" stroke-linecap="round"/>' +
    '<circle cx="31" cy="67" r="5.6" fill="#17C3B2"/><circle cx="45" cy="53" r="5.6" fill="#17C3B2"/>' +
    '<circle cx="59" cy="57" r="5.6" fill="#17C3B2"/><circle cx="72" cy="35" r="7" fill="#FF6B4A"/>';
  var ISO_DEFS = '<linearGradient id="bp-sq" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c426d"/><stop offset="1" stop-color="#0d2642"/></linearGradient>';

  window.Elenco = {
    C: C, svg: svg, defs: function () { return defs().replace('</defs>', ISO_DEFS + '</defs>'); },
    placaTarjeta: placaTarjeta, alto: ALTO, ancho: ANCHO, isotipo: ISO,
    // El equipo, en el orden del motor; después las dos mascotas
    ids: ${JSON.stringify(IDS.filter((i) => !MASCOTAS.includes(i)))},
    mascotas: MASCOTAS,
    flota: { atlas: 1.3, plotty: 1.05 }
  };
})();
`;
writeFileSync(path.join(oficina, 'elenco.js'), elenco);
console.log('elenco.js', kb(elenco));

/* ───────── Ilustraciones de ficha ───────── */
const ILUS = {};
const personas = ['lupe', 'celda', 'grilla', 'bucle', 'tamandua', 'faro', 'pepa', 'architect', 'engine'];
for (const id of personas) {
  const m = await import(`./ilustracion/${id}.mjs`);
  ILUS[id] = { vb: '0 0 300 520', svg: prefijar(redondear(m[id]()), 'il-' + id) };
}
const ab = await import('./ilustracion/aby.mjs');
ILUS.aby = { vb: '0 0 300 520', svg: prefijar(redondear(ab.abyUrbana()), 'il-aby') };
ILUS['aby-elegante'] = { vb: '0 0 300 520', svg: prefijar(redondear(ab.abyElegante()), 'il-abye') };
const fe = await import('./ilustracion/felipe.mjs');
ILUS.felipe = { vb: '0 0 300 520', svg: prefijar(redondear(fe.felipe()), 'il-felipe') };
ILUS['felipe-elegante'] = { vb: '0 0 300 520', svg: prefijar(redondear(fe.felipeElegante()), 'il-felipee') };
const at = await import('./ilustracion/atlas.mjs');
const pl = await import('./ilustracion/plotty.mjs');
ILUS.atlas = { vb: '0 0 300 320', svg: redondear(at.atlas('mira', 'il-at')) };
ILUS.plotty = { vb: '0 0 300 320', svg: redondear(pl.plotty('hola', 'il-pl')) };
// Recorte de la cabeza de cada ilustración (viewBox), para los avatares del kit
const CABEZA = { bucle: '90 14 124 124', lupe: '88 106 124 124', celda: '86 22 128 128', grilla: '88 30 124 124', tamandua: '84 36 124 124', faro: '80 38 140 140', pepa: '86 120 128 128',
  architect: '86 18 128 128', engine: '86 36 128 128', aby: '84 46 132 132', 'aby-elegante': '84 46 132 132',
  felipe: '88 38 128 128', 'felipe-elegante': '88 38 128 128', plotty: '66 20 168 168', atlas: '70 78 160 160' };
for (const id of Object.keys(ILUS)) ILUS[id].cabeza = CABEZA[id];
const ilus = CABECERA('ilustraciones') + `/*
 * La ilustración de cada integrante (tinta con peso y color plano), para las fichas de la oficina y el kit.
 * Se carga recién cuando se abre la primera ficha. window.Ilustraciones[id] = { vb, svg }.
 */
window.Ilustraciones = ${JSON.stringify(ILUS)};
`;
writeFileSync(path.join(oficina, 'ilustraciones.js'), ilus);
console.log('ilustraciones.js', kb(ilus));

/* ───────── Barrio y salas grandes ───────── */
// Los datos reales (nombres y colores de cada proyecto) salen de datos.js, igual que en la oficina.
const ventana = {}; new Function('window', readFileSync(path.join(oficina, 'datos.js'), 'utf8'))(ventana);
const DATOS = ventana.OFICINA_DATOS;
// Cada personaje se define una vez por documento (#v-id) y el barrio lo usa con <use>. La silueta (el contorno grueso)
// se dibuja una vez y se repite corrida con <use>, como en el elenco.
const defsDe = (ids) => [...ids].sort().map((id) => {
  const f = VECTOR[id] || VISITANTES[id];
  if (!f) throw new Error('Personaje sin dibujo: ' + id);
  const p = f().svg({ partes: true });
  return `<g id="v-${id}"><g id="v-${id}-s">${redondear(p.sil)}</g><use href="#v-${id}-s" transform="translate(.28 .36)"/>${redondear(p.color)}</g>`;
}).join('');
const calle = callePrincipal(DATOS), pz = piezas();
const enBarrio = new Set([...calle.usados, ...pz.usados]);
const barrio = CABECERA('barrio') + `/*
 * La oficina cerrada (hq) y su calle: la principal con los locales de los proyectos (cerrados, con su nombre y su logo en
 * el techo), el pasaje con el directorio, la plaza y El Archivo, más las piezas con que escena.js arma las calles por
 * rubro desde datos.js (el local en cada estado, con marcas §…§ para el color, el nombre y el logo de cada caso).
 * Coordenadas del mundo de escena.js; la oficina ocupa x 0..24, y 0..20. §M§ = carpeta de medios.
 */
window.Barrio = ${JSON.stringify({
  geo: G, hq: HQ,
  principal: { locales: PRINCIPAL.map(([id, x]) => ({ id, x })), zonas: calle.zonas, caja: calle.caja,
    suelo: redondear(calle.suelo), atras: redondear(calle.atras), frente: redondear(calle.frente), hq: redondear(calle.hq) },
  local: Object.fromEntries(Object.entries(pz.local).map(([k, v]) => [k, typeof v === 'string' ? redondear(v) : Object.fromEntries(Object.entries(v).map(([a, b]) => [a, redondear(b)]))])),
  fila: Object.fromEntries(Object.entries(pz.fila).map(([k, v]) => [k, redondear(v)])),
  personas: Object.fromEntries(Object.entries(pz.personas).map(([id, v]) => [id, { d: redondear(v.d), i: redondear(v.i) }])),
  caminantes: CAMINANTES, dePaso: DE_PASO,
  defs: DEFS_ENTORNO + defsDe(enBarrio)
})};
`;
writeFileSync(path.join(oficina, 'barrio.js'), barrio);
console.log('barrio.js', kb(barrio), '·', enBarrio.size, 'personajes');

// Un dibujo en capas (una sala, un local por dentro): cada capa redondeada y quienes caminan con su dibujo redondeado
const enCapas = (r, red = redondear) => ({ capas: r.capas.map(red), arriba: red(r.arriba),
  caminan: r.caminan.map((c) => ({ id: c.id, svg: red(c.svg), ruta: c.ruta, vel: c.vel })) });
// Las salas propias redondean igual, pero conservan los coeficientes de sus planos (matrix(a,b,c,d,…)) y la escala de su
// gente: con un decimal, lo que va pintado en un muro o en el piso se tuerce y se sale de su lugar (0,32 pasa a 0,3 y
// 0,16 a 0,2), y la gente crece un poco. Las demás salas, los locales y el barrio quedan como estaban.
const redondearPreciso = (svg) => {
  const guardados = [];
  const s = svg.replace(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,|scale\([^)]*\)/g, (m) => { guardados.push(m); return `§G${guardados.length - 1}§`; });
  return redondear(s).replace(/§G(\d+)§/g, (_, i) => guardados[+i]);
};

// Los locales por dentro (locales.js va primero: define los personajes que no están en el barrio)
const dentro = adentro(DATOS);
const enLocales = new Set([...dentro.usados, ...pz.vistas.usados].filter((u) => !enBarrio.has(u)));
const localesJs = CABECERA('locales por dentro') + `/*
 * Cada local por dentro, como se ve al abrirlo en la calle (sin techo): el de cada proyecto de la calle principal y el
 * de un caso según su plantilla (interior) o su estado, con su frente abierto y sus extras, con marcas §…§ para el color
 * y el nombre de cada caso (como barrio.js). Todo se dibuja en su origen (0, 0), en capas por profundidad: la capa i
 * lleva lo que está entre x + y = i·paso y (i + 1)·paso; quienes caminan van aparte, con su ruta [[x, y, espera], …], y
 * escena.js los mete en la capa que les toca. defs: los personajes que no están en el barrio.
 */
window.Locales = ${JSON.stringify({
  defs: defsDe(enLocales), paso: PASO,
  principal: Object.fromEntries(Object.entries(dentro.locales).map(([k, v]) => [k, enCapas(v)])),
  interior: Object.fromEntries(Object.entries(pz.vistas.interior).map(([k, v]) => [k, enCapas(v)])),
  extra: Object.fromEntries(Object.entries(pz.vistas.extra).map(([k, v]) => [k, enCapas(v)])),
  frente: enCapas(pz.vistas.frente)
})};
`;
writeFileSync(path.join(oficina, 'locales.js'), localesJs);
console.log('locales.js', kb(localesJs), '·', enLocales.size, 'personajes');

// Las salas grandes: el alto del cuadro se recorta arriba (ahí iban los carteles de la maqueta)
const DEFS_SALA = `<linearGradient id="luz-cocina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0B341" stop-opacity="0"/><stop offset="1" stop-color="#E0B341" stop-opacity=".35"/></linearGradient>` +
  `<linearGradient id="brillo-pantalla" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>`;
const salas = {}, enSalas = new Set();
for (const [id, fn] of Object.entries(SALAS)) {
  const r = fn(), vb = r.vb.split(' ').map(Number);
  vb[1] += 36; vb[3] -= 30;
  r.usados.forEach((u) => { if (!enBarrio.has(u) && !enLocales.has(u)) enSalas.add(u); });
  // Una sala propia (sin números) lleva además sus lugares, sus zonas y dónde está su gente
  const propia = r.zonas ? { lugares: r.lugares, zonas: r.zonas, gente: r.gente } : {};
  salas[id] = { vb: vb.map((n) => Math.round(n * 10) / 10).join(' '), ...enCapas(r, r.zonas ? redondearPreciso : redondear), pines: r.pines, ...propia };
}
const salasJs = CABECERA('salas grandes') + `/*
 * La sala de cada empresa por dentro: su gente, sus pantallas reales (§M§ = carpeta de medios) y un punto por módulo.
 * En capas por profundidad, como locales.js (capas, arriba: los puntos), con quienes caminan aparte (caminan).
 * pines: [{ n, x, y }] en coordenadas del dibujo; los textos e imágenes de cada punto están en datos.js.
 * Una sala propia (salaPropia en datos.js, hoy la de Nu Home) no tiene puntos (pines: []) y trae, en coordenadas del
 * dibujo: lugares { id: [x, y] } (dónde va la etiqueta de cada zona, y la entrada), zonas [{ id, silueta, suelo, caja,
 * prof, guia }] (lo que se toca: su contorno, lo que se ilumina, su rectángulo, su profundidad y, si el recorrido pasa por
 * ahí, el punto del piso —en baldosas— donde se para la asesora) y gente { id: [x, y, alto] } (dónde pisa o se sienta
 * cada persona y cuánto mide: ahí va su burbuja). Sus textos están en datos.js.
 * defs: los personajes que no están ni en el barrio ni en los locales (barrio.js y locales.js definen los demás).
 */
window.Salas = ${JSON.stringify({ defs: DEFS_SALA + defsDe(enSalas), paso: PASO, salas })};
`;
writeFileSync(path.join(oficina, 'salas.js'), salasJs);
console.log('salas.js', kb(salasJs), '·', Object.keys(salas).join(', '), '·', enSalas.size, 'personajes');

/* ───────── Páginas para compartir cada sala ───────── */
// Quien pega biplot.cl/oficina/haru en un chat ve la imagen de la sala; quien lo abre llega a la oficina, en esa sala.
const escHtml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ICONO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230E2A47'/%3E%3Cpath d='M9 8 V24 H25' stroke='%233f6da0' stroke-width='1.7' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='11.5' cy='20.5' r='2.2' fill='%2317C3B2'/%3E%3Ccircle cx='16' cy='17' r='2.2' fill='%2317C3B2'/%3E%3Ccircle cx='23' cy='11' r='2.8' fill='%23FF6B4A'/%3E%3C/svg%3E`;
for (const id of Object.keys(SALAS)) {
  // El Archivo no es un proyecto: es el museo de BiPlot (datos.js, salas.archivo)
  const museo = id === 'archivo' && DATOS.salas.archivo && DATOS.salas.archivo.salaPropia;
  const pr = museo ? { nombre: DATOS.salas.archivo.nombre, esencia: DATOS.salas.archivo.esencia } : DATOS.proyectos.find((p) => p.id === id);
  if (!pr) continue;
  const url = `https://biplot.cl/oficina/${id}/`, img = `https://biplot.cl/oficina/kit/png/sala-${id}-og.png`;
  // El local libre tampoco: es la sala de ventas de BiPlot (datos.js, proyectos.libre.salaPropia)
  const ventas = id === 'libre';
  const titulo = museo ? `${pr.nombre}, el museo de BiPlot` : ventas ? `${pr.nombre}: la sala de ventas de BiPlot` : `${pr.nombre} · La oficina de BiPlot`;
  const desc = museo ? `${pr.esencia} Una pieza de cada época y de cada desarrollo, en la oficina de BiPlot.` :
    ventas ? 'Mira cómo se vería tu local en el barrio de BiPlot, cómo avanza tu proyecto y cuánto cuesta. La primera sesión es sin costo.' :
    `${pr.esencia} Pasa a la sala de ${pr.nombre} en la oficina de BiPlot y mira lo que construimos.`;
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(titulo)}</title>
<!-- Generado por _herramientas/dibujos/generar.mjs desde datos.js. No se edita a mano. -->
<meta name="description" content="${escHtml(desc)}">
<meta name="theme-color" content="#0E2A47">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BiPlot">
<meta property="og:locale" content="es_CL">
<meta property="og:title" content="${escHtml(titulo)}">
<meta property="og:description" content="${escHtml(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escHtml(`${museo ? `${pr.nombre}, el museo de BiPlot, dibujado` : ventas ? 'La sala de ventas de BiPlot dibujada' : `La sala de ${pr.nombre} dibujada`}, con su gente. ${pr.esencia}`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${img}">
<link rel="icon" href="${ICONO}">
<script>location.replace('../#${id}');</script>
<style>
body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box; background: #0E2A47; color: #F2F4F7;
  font: 16px/1.5 Inter, "Segoe UI", system-ui, sans-serif; text-align: center; }
main { max-width: 600px; }
img { display: block; width: 100%; height: auto; border-radius: 12px; }
h1 { margin: 20px 0 6px; font: 700 32px/1.1 "Space Grotesk", "Segoe UI", system-ui, sans-serif; }
p { margin: 0 0 16px; color: #B9C8D8; }
a { color: #17C3B2; font-weight: 600; }
</style>
</head>
<body>
<main>
  <img src="../kit/png/sala-${id}-og.png" alt="${escHtml(museo ? `${pr.nombre}, el museo de BiPlot` : ventas ? 'La sala de ventas de BiPlot' : `La sala de ${pr.nombre}`)}" width="1200" height="630">
  <h1>${escHtml(pr.nombre)}</h1>
  <p>${escHtml(pr.esencia)}</p>
  <p><a href="../#${id}">${museo ? 'Entrar al museo en la oficina de BiPlot' : ventas ? 'Entrar a la sala de ventas en la oficina de BiPlot' : 'Entrar a la sala en la oficina de BiPlot'}</a></p>
</main>
</body>
</html>
`;
  mkdirSync(path.join(oficina, id), { recursive: true });
  writeFileSync(path.join(oficina, id, 'index.html'), html);
}
console.log('páginas para compartir:', Object.keys(SALAS).map((id) => `oficina/${id}/`).join(', '));
