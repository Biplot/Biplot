// Arma una edición de La Línea, el diario de BiPlot, desde su contenido (diario/_herramientas/ediciones/<fecha>.json):
//   diario/<fecha>/index.html                        la edición en la web (biplot.cl/diario/<fecha>/), con diario/diario.css
//   diario/index.html                                la hemeroteca, con todas las ediciones (la más nueva arriba)
//   diario/_herramientas/salida/<fecha>-correo.html  el correo: tablas de 600 px y estilos en línea (no se sube)
// Uso, desde la raíz del repo: node diario/_herramientas/armar.mjs [AAAA-MM-DD]   (sin fecha, la última)
// Es un diario de verdad, en su edición de Gotham: la portada con su cabecera gótica y, después, una hoja por página, con
// su folio. Quién firma cada sección y sus textos fijos (SECCIONES) y cómo se reparten en páginas (PAGINAS) están aquí;
// el JSON trae sólo lo de esa semana. Las imágenes (las caras, la foto de portada, la cabecera del correo) las saca
// imagenes.mjs. Cómo se escribe el JSON está en diario/README.md.
import fs from 'node:fs'; import path from 'node:path';

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const carpetaEd = path.join(raiz, 'diario', '_herramientas', 'ediciones');
const SITIO = 'https://biplot.cl';
const AGENDAR = 'https://wa.me/56966275675?text=Hola%20BiPlot%20%F0%9F%91%8B%2C%20quiero%20agendar%20un%20diagn%C3%B3stico.';
const RUMBO = 'https://rumbo.biplot.cl/conoce';
const PERIODICIDAD = 'Sale los lunes';
// El enlace para darse de baja lo pone la plataforma de envío: aquí va su etiqueta (en Buttondown, {{ unsubscribe_url }};
// en Brevo, {{ unsubscribe }}). Mientras no se elija, queda este marcador.
const BAJA = '{{baja}}';

// Quién firma: los integrantes de la oficina (oficina/README.md), con su placa y su frase
const FIRMAS = {
  aby: { nombre: 'Aby', rol: 'La corresponsal', placa: 'PRENSA', frase: 'Tres, dos, uno… estamos al aire.' },
  felipe: { nombre: 'Felipe', rol: 'El rostro', placa: 'PRENSA', frase: 'Pásala, que yo la cuento.' },
  celda: { nombre: 'Celda', rol: 'Datos y métricas', placa: 'E3', frase: 'Si no cuadra, no avanza.' },
  engine: { nombre: 'The Engine', rol: 'Ejecución y sistemas', placa: 'E4', frase: 'Lo que se repite, se automatiza.' },
  architect: { nombre: 'The Architect', rol: 'Estrategia y proyectos', placa: 'E2', frase: 'Si no se puede dibujar, no se puede construir.' },
  lupe: { nombre: 'Lupe', rol: 'Diagnóstico', placa: 'E1', frase: 'Lo que pides no siempre es lo que necesitas.' },
  tamandua: { nombre: 'Tamandúa', rol: 'Validación', placa: 'E6', frase: 'Si se puede romper, lo rompo yo antes.' },
  pepa: { nombre: 'Pepa', rol: 'Cosecha', placa: 'E9', frase: 'Lo que sirve dos veces se guarda. Lo demás, se bota.' },
  faro: { nombre: 'Faro', rol: 'Puesta en marcha', placa: 'E7', frase: 'No termina cuando se publica. Termina cuando se usa.' },
  atlas: { nombre: 'Atlas', rol: 'Mascota de The Architect', placa: '360°', frase: 'Desde aquí arriba se ve todo.' },
  plotty: { nombre: 'Plotty', rol: 'Recepción', placa: 'E0', frase: 'Tres preguntas. Prometo que no es un formulario.' },
};

// Las secciones, en el orden del diario. nombre: [antes, remate en cursiva]; importa: la etiqueta de «por qué importa».
// Las que no traiga la edición no salen (Mito o dato, Para guardar, A producción y Desde arriba van rotando).
const SECCIONES = [
  { id: 'portada', kicker: 'Portada', firma: 'aby', importa: 'Por qué importa' },
  { id: 'dato', kicker: 'Economía', nombre: ['El', 'dato'], firma: 'celda', importa: 'Para tu empresa' },
  { id: 'maquinas', kicker: 'IA y automatización', nombre: ['Las', 'máquinas'], firma: 'engine', importa: 'Qué cambia para una pyme' },
  { id: 'planos', kicker: 'Gestión de empresas', nombre: ['Sala de', 'planos'], firma: 'architect', importa: 'Para llevar' },
  { id: 'caso', kicker: 'Casos de éxito', nombre: ['El caso de', 'la semana'], firma: 'lupe' },
  { id: 'marcador', kicker: 'Deporte', nombre: ['El', 'marcador'], firma: 'felipe', importa: 'La jugada' },
  { id: 'mito', kicker: 'Verificación', nombre: ['¿Mito o', 'dato?'], firma: 'tamandua' },
  { id: 'guardar', kicker: 'Herramientas', nombre: ['Para', 'guardar'], firma: 'pepa', importa: 'Para qué sirve' },
  { id: 'lanzamientos', kicker: 'Emprendimiento', nombre: ['A', 'producción'], firma: 'faro', importa: 'Por qué importa' },
  { id: 'mundo', kicker: 'Internacional', nombre: ['Desde', 'arriba'], firma: 'atlas', importa: 'Por qué importa' },
  { id: 'preguntas', kicker: 'Para cerrar', nombre: ['Tres', 'preguntas'], firma: 'plotty' },
];
const VEREDICTOS = { mito: ['Mito', 'v-mito'], dato: ['Dato', 'v-dato'], 'a medias': ['A medias', 'v-medias'] };

// ---------- Utilidades ----------
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Texto con **negrita** y *cursiva*, nada más
// (los marcadores y rangos como 6-0 o 2026-27 no se cortan al final de la línea)
const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
  .replace(/\b(\d+-\d+)\b/g, '<span style="white-space:nowrap">$1</span>');
const lista = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function fechaLarga(iso) { const d = new Date(iso + 'T12:00:00Z'); return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`; }
const numero = (ed) => 'N.º ' + ed.numero;
// Lo que dice el pie de cómo se hizo: una edición de prueba que nadie ha revisado no puede decir «revisado por personas»
const hechura = (ed) => (ed.prueba && !ed.edita ? 'Armada con ayuda de IA; como es de prueba, todavía le falta la revisión de una persona'
  : `Hecho con ayuda de IA y revisado por personas${ed.edita ? `. Edita: ${esc(ed.edita)}` : ''}`);
const titulo = (n) => (n ? `${esc(n[0])} <em>${esc(n[1])}</em>` : '');
const tituloPlano = (n) => (n ? n.join(' ') : '');
// Todas las fuentes de la edición, sin repetir, para el pie
function todasLasFuentes(ed) {
  const vistas = new Map();
  const juntar = (f) => { for (const x of lista(f)) if (x && x.url && !vistas.has(x.url)) vistas.set(x.url, x); };
  for (const i of lista(ed.indicadores)) juntar(i.fuente);
  for (const s of SECCIONES) for (const n of notasDe(ed, s.id)) juntar(n.fuentes);
  // Agrupadas por medio, en orden alfabético: cada medio con todos sus enlaces de la edición
  const porMedio = new Map();
  for (const f of vistas.values()) { if (!porMedio.has(f.medio)) porMedio.set(f.medio, []); porMedio.get(f.medio).push(f.url); }
  return [...porMedio].map(([medio, urls]) => ({ medio, urls })).sort((x, y) => x.medio.localeCompare(y.medio, 'es'));
}
// «Emol ² ³»: el medio enlaza a su primera nota y las demás van numeradas
const fuentePie = (f, estilo = '') => `<a href="${esc(f.urls[0])}"${estilo} rel="noopener">${esc(f.medio)}</a>${f.urls.slice(1).map((u, i) => ` <a href="${esc(u)}"${estilo} rel="noopener"><sup>${i + 2}</sup></a>`).join('')}`;
// Las notas de una sección, sea cual sea su forma en el JSON
function notasDe(ed, id) {
  const v = ed[id];
  if (!v) return [];
  if (id === 'marcador') return lista(v.notas);
  if (id === 'preguntas') return [];
  return lista(v);
}
function validar(ed, archivo) {
  const faltan = [];
  if (ed.numero == null) faltan.push('numero');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ed.fecha || '')) faltan.push('fecha (AAAA-MM-DD)');
  if (!lista(ed.portada).length) faltan.push('portada');
  for (const s of SECCIONES) for (const n of notasDe(ed, s.id)) {
    if (!lista(n.fuentes).length) faltan.push(`${s.id}: «${n.titular || n.afirmacion || n.empresa}» no trae fuentes`);
    for (const f of lista(n.fuentes)) if (!/^https:\/\//.test(f.url || '')) faltan.push(`${s.id}: la fuente «${f.medio}» no trae una URL https`);
  }
  if (faltan.length) { console.error(`✗ ${path.relative(raiz, archivo)}:\n  - ` + faltan.join('\n  - ')); process.exit(1); }
}

// Las páginas del diario, después de la portada: las secciones agrupadas como en un diario de papel. Una página que no
// traiga ninguna de sus secciones no sale, y las que siguen corren su número. La última es la de pasatiempos y avisos.
const PAGINAS = [
  { id: 'economia', nombre: ['Economía', 'y gestión'], secciones: ['dato', 'planos', 'caso'] },
  { id: 'tecnologia', nombre: ['Tecnología', 'y verificación'], secciones: ['maquinas', 'mito', 'guardar', 'lanzamientos', 'mundo'] },
  { id: 'deportes', nombre: ['Deportes'], secciones: ['marcador'] },
  { id: 'avisos', nombre: ['Pasatiempos', 'y avisos'], secciones: ['preguntas'], cierre: true },
];
// La foto de la portada, si la edición no trae otra (ed.foto = { src, pie }): la sacan imagenes.mjs
const FOTO = { src: 'imagenes/prensa.jpg', pie: (ed) => `Aby y Felipe, la dupla de PRENSA de BiPlot, cierran la edición ${numero(ed)}.` };
const seccion = (id) => SECCIONES.find((s) => s.id === id);
const tiene = (ed, id) => { const v = ed[id]; return !!v && (!Array.isArray(v) || v.length > 0); };
function paginasDe(ed) {
  let n = 1;
  return PAGINAS.filter((p) => p.cierre || p.secciones.some((id) => tiene(ed, id))).map((p) => ({ ...p, numero: ++n }));
}
const nombrePagina = (p) => (p.nombre[1] ? `${esc(p.nombre[0])} <em>${esc(p.nombre[1])}</em>` : esc(p.nombre[0]));
const Mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// ---------- La web ----------
const ISOTIPO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#15181D" stroke="rgba(231,221,196,.3)"/><path d="M9 8 V24 H25" fill="none" stroke="#5E5748" stroke-width="1.7" stroke-linecap="round"/><polyline points="10.5,20.5 15,16.5 19,18 23,11" fill="none" stroke="#C8962E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/><circle cx="10.5" cy="20.5" r="1.8" fill="#C8962E"/><circle cx="15" cy="16.5" r="1.8" fill="#C8962E"/><circle cx="19" cy="18" r="1.8" fill="#C8962E"/><circle cx="23" cy="11" r="2.3" fill="#FF6B4A"/></svg>';
// La línea bajo la cabecera: sube de punto en punto, como la del isotipo, en tinta
const PUNTOS = [[8, 24], [190, 19], [340, 22], [530, 14], [705, 17], [880, 9], [1110, 6]];
const LINEA = `<svg class="linea" viewBox="0 0 1120 30" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><polyline points="${PUNTOS.map((p) => p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>${PUNTOS.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === PUNTOS.length - 1 ? 5 : 3.4}" fill="currentColor"/>`).join('')}</svg>`;
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2315181D'/%3E%3Cpath d='M9 8 V24 H25' stroke='%235E5748' stroke-width='1.7' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='11.5' cy='20.5' r='2.2' fill='%23C8962E'/%3E%3Ccircle cx='16' cy='17' r='2.2' fill='%23C8962E'/%3E%3Ccircle cx='23' cy='11' r='2.8' fill='%23FF6B4A'/%3E%3C/svg%3E";
const FUENTES_WEB = 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Oswald:wght@500;600;700&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Courier+Prime:wght@400;700&display=swap';

function cabezaHtml({ titulo: t, descripcion, url, base, noindex }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(descripcion)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#0B0D10">
<meta property="og:type" content="article">
<meta property="og:site_name" content="BiPlot">
<meta property="og:locale" content="es_CL">
<meta property="og:title" content="${esc(t)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITIO}/diario/imagenes/prensa.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FUENTES_WEB}" rel="stylesheet">
<link rel="stylesheet" href="${base}diario.css">
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="barra">
  <a href="${base}../" aria-label="BiPlot, inicio">${ISOTIPO}<span>BiPlot</span></a>
  <nav aria-label="Diario"><a href="${base}">Hemeroteca</a><a href="${base}../oficina/">BiPlot HQ</a></nav>
</header>
`;
}
function pieWeb(base) {
  return `<footer class="pie">
  <p>La Línea es el diario de BiPlot, automatización a la medida. ${PERIODICIDAD}.</p>
  <p><a href="${base}">La hemeroteca</a> · <a href="${base}../">biplot.cl</a> · <a href="${base}../oficina/">BiPlot HQ</a> · <a href="${base}../oficina/tv/">BiPlot.TV</a> · <a href="${RUMBO}" rel="noopener">Rumbo</a></p>
</footer>
</body>
</html>
`;
}
function firmaWeb(id, base) {
  const f = FIRMAS[id];
  return `<div class="firma"><img src="${base}imagenes/caras/${id}.png" alt="" width="46" height="46" loading="lazy"><span><b>Por ${esc(f.nombre)} · ${esc(f.placa)}</b><i>«${esc(f.frase)}»</i></span></div>`;
}
function fuentesWeb(fuentes) {
  const fs_ = lista(fuentes);
  if (!fs_.length) return '';
  return `<p class="fuente">${fs_.length > 1 ? 'Fuentes' : 'Fuente'}: ${fs_.map((f) => `<a href="${esc(f.url)}" rel="noopener">${esc(f.medio)}</a>`).join(' · ')}</p>`;
}
const parrafos = (x) => lista(x).map((p) => `<p class="bajada">${md(p)}</p>`).join('\n      ');
function notaWeb(n, sec, clase = '') {
  const cifra = n.cifra ? `<p class="cifra">${esc(n.cifra.valor)}${n.cifra.leyenda ? `<small>${esc(n.cifra.leyenda)}</small>` : ''}</p>` : '';
  return `<article class="nota ${clase}">
      ${cifra}<h4>${md(n.titular)}</h4>
      ${parrafos(n.bajada)}
      ${n.importa ? `<p class="importa"><b>${esc(sec.importa || 'Por qué importa')}</b>${md(n.importa)}</p>` : ''}
      ${fuentesWeb(n.fuentes)}
    </article>`;
}
const cabSeccion = (sec, base) => `<header class="sec-cab"><div><span class="kicker">${esc(sec.kicker)}</span><h3 class="sec-nombre">${titulo(sec.nombre)}</h3></div>${firmaWeb(sec.firma, base)}</header>`;
function seccionWeb(ed, sec, base) {
  const v = ed[sec.id];
  let cuerpo;
  if (sec.id === 'dato') {
    cuerpo = `<div class="el-dato"><p class="grande">${esc(v.valor)}<small>${esc(v.leyenda)}</small></p>${notaWeb({ ...v, cifra: null }, sec)}</div>`;
  } else if (sec.id === 'caso') {
    cuerpo = `<article class="nota caso"><h4>${md(v.titular)}</h4>${parrafos(v.bajada)}
    <ol class="caso-pasos"><li><b>Lo que pasaba</b>${md(v.antes)}</li><li><b>Lo que cambiaron</b>${md(v.cambio)}</li><li><b>Lo que pasó</b>${md(v.resultado)}</li></ol>
    ${fuentesWeb(v.fuentes)}</article>`;
  } else if (sec.id === 'mito') {
    cuerpo = `<div class="notas n-${Math.min(lista(v).length, 3)}">${lista(v).map((n) => {
      const [txt, cl] = VEREDICTOS[n.veredicto] || VEREDICTOS['a medias'];
      return `<article class="nota mito"><span class="timbre ${cl}">${txt}</span><p class="afirmacion">«${md(n.afirmacion)}»</p>
      ${parrafos(n.bajada)}${fuentesWeb(n.fuentes)}</article>`;
    }).join('\n')}</div>`;
  } else if (sec.id === 'marcador') {
    const notas = lista(v.notas);
    cuerpo = `<div class="marcadores"><div class="notas n-${Math.min(notas.length, 3)}">${notas.map((n) => notaWeb(n, sec)).join('\n')}</div></div>
    ${lista(v.agenda).length ? `<div class="agenda"><h4>Lo que viene</h4><ul>${lista(v.agenda).map((a) => `<li><b>${esc(a.fecha)}</b><span>${md(a.texto)}</span></li>`).join('')}</ul></div>` : ''}`;
  } else {
    const notas = lista(v);
    cuerpo = `<div class="notas n-${Math.min(notas.length, 3)}">${notas.map((n) => notaWeb(n, sec)).join('\n')}</div>`;
  }
  return `<section class="seccion" id="${sec.id}" aria-label="${esc(tituloPlano(sec.nombre))}">
  ${cabSeccion(sec, base)}
  ${cuerpo}
</section>`;
}
const folioWeb = (ed, n) => `<p class="folio"><span class="gotica">La Línea</span><span>${esc(Mayus(fechaLarga(ed.fecha)))}</span><span>Página ${n}</span></p>`;
function portadaWeb(ed, base, paginas) {
  const fecha = fechaLarga(ed.fecha);
  const [principal, ...lado] = lista(ed.portada);
  const ind = lista(ed.indicadores);
  const foto = ed.foto || FOTO;
  return `<article class="hoja portada" id="pagina-1" aria-label="Página 1: portada">
  <div class="orejas">
    <p class="oreja"><b>${esc(numero(ed))}</b>${ed.prueba ? 'Edición de prueba' : 'Edición semanal'}</p>
    <h1 class="cabecera">La Línea</h1>
    <p class="oreja"><b>Gratis</b>${esc(PERIODICIDAD)}</p>
  </div>
  <p class="lema">El diario de BiPlot · Lo que pasó esta semana, en cinco minutos</p>
  ${LINEA}
  <p class="fechero"><span>Santiago de Chile</span><span>${esc(Mayus(fecha))}</span><span>${esc(ed.cubre || '')}</span></p>
  ${ind.length ? `<dl class="mercados" style="--n:${ind.length}">${ind.map((i) => `<div><dt>${esc(i.nombre)}</dt><dd>${esc(i.valor)}</dd><small>${esc(i.nota || '')}${i.fuente ? ` · <a href="${esc(i.fuente.url)}" rel="noopener">${esc(i.fuente.medio)}</a>` : ''}</small></div>`).join('')}</dl>` : ''}
  <h2 class="titular-mayor">${md(principal.titular)}</h2>
  ${principal.importa ? `<p class="bajada-mayor">${md(principal.importa)}</p>` : ''}
  <div class="portada-grid">
    <div>
      ${firmaWeb('aby', base)}
      <article class="nota capitular" style="margin-top:.8rem">${parrafos(principal.bajada)}${fuentesWeb(principal.fuentes)}</article>
    </div>
    <div>
      <figure class="foto"><img src="${base}${esc(foto.src)}" alt="${esc(typeof foto.pie === 'function' ? foto.pie(ed) : foto.pie)}" width="1200" height="760">
        <figcaption>${esc(typeof foto.pie === 'function' ? foto.pie(ed) : foto.pie)} <b>Ilustración: BiPlot</b></figcaption></figure>
      ${lista(ed.redaccion).length ? `<aside class="redaccion" aria-label="Nota de la redacción"><h2>Nota de la redacción</h2>${lista(ed.redaccion).map((p) => `<p>${md(p)}</p>`).join('')}</aside>` : ''}
    </div>
    <div class="lado">
      ${lado.map((n) => notaWeb(n, seccion('portada'))).join('\n')}
      <nav class="indice" aria-label="En esta edición"><h2>En esta edición</h2><ol>${paginas.map((p) => `<li><a href="#pagina-${p.numero}"><span>${esc(p.nombre.join(' '))}</span><b>${p.numero}</b></a></li>`).join('')}</ol></nav>
    </div>
  </div>
</article>`;
}
function cierreWeb(ed, base) {
  const fuentes = todasLasFuentes(ed);
  const preg = lista(ed.preguntas);
  return `<div class="cierre">
    <div>
      ${preg.length ? `<section class="seccion" id="preguntas" aria-label="Tres preguntas">${cabSeccion(seccion('preguntas'), base)}
      <ol class="preguntas">${preg.map((p) => `<li><span>${md(p.pregunta)}</span></li>`).join('')}</ol>
      <p class="soluciones"><b>Soluciones.</b> ${preg.map((p, i) => `${i + 1}. ${md(p.respuesta)}`).join(' ')}</p></section>` : ''}
    </div>
    <div class="aviso"><aside class="se-busca" aria-label="Aviso de BiPlot">
      <span class="kicker">Aviso · BiPlot, automatización a la medida</span>
      <h3>Se busca</h3>
      <p>Procesos que se repiten, planillas a mano y tareas que nadie quiere hacer.</p>
      <p class="recompensa">Recompensa: las horas de vuelta</p>
      <p>Tu proceso es el próximo punto. Una sesión corta, sin costo.</p>
      <a class="btn-cta" href="${AGENDAR}" rel="noopener">Agenda tu diagnóstico</a>
    </aside>
    ${ed.aparte ? `<section class="consultorio" aria-label="Consultorio"><img src="${base}imagenes/rumbo.png" alt="" width="58" height="58"><div><span class="kicker">Consultorio · Psst… ¿y tu día?</span><h3>${md(ed.aparte.titulo)}</h3><p>${md(ed.aparte.texto)}</p><a href="${esc(ed.aparte.enlace || RUMBO)}" rel="noopener">Conoce Rumbo, la app de BiPlot para ordenar tu día →</a></div></section>` : ''}
    </div>
  </div>
  <div class="cajas">
    <div><h3>Agencias y fuentes</h3><p>${fuentes.map((f) => fuentePie(f)).join(' · ')}</p></div>
    <div><h3>Fe de erratas</h3><p>${lista(ed.erratas).length ? lista(ed.erratas).map(md).join('<br>') : 'Sin correcciones en esta edición. Si ves un error, avísanos y lo corregimos aquí.'}</p></div>
    <div><h3>La Línea</h3><p>El diario de BiPlot. ${PERIODICIDAD}. Redacción: Aby y el equipo de BiPlot HQ. ${hechura(ed)}. Los resúmenes son nuestros; las notas completas, de cada medio.</p></div>
  </div>`;
}
function paginaWeb(ed, pag, base) {
  const cuerpo = pag.cierre ? cierreWeb(ed, base)
    : pag.secciones.filter((id) => tiene(ed, id)).map((id) => seccionWeb(ed, seccion(id), base)).join('\n');
  return `<article class="hoja" id="pagina-${pag.numero}" aria-label="Página ${pag.numero}: ${esc(pag.nombre.join(' '))}">
  ${folioWeb(ed, pag.numero)}
  <h2 class="pagina-titulo">${nombrePagina(pag)}</h2>
  ${cuerpo}
</article>`;
}
function edicionWeb(ed) {
  const base = '../';
  const paginas = paginasDe(ed);
  return cabezaHtml({ titulo: `La Línea ${numero(ed)} · ${fechaLarga(ed.fecha)}`, descripcion: ed.previa || lista(ed.portada)[0].titular,
    url: `${SITIO}/diario/${ed.fecha}/`, base, noindex: ed.prueba }) +
`<main id="contenido" class="diario">
${portadaWeb(ed, base, paginas)}
${paginas.map((p) => paginaWeb(ed, p, base)).join('\n')}
</main>
` + pieWeb(base);
}
function hemerotecaWeb(ediciones) {
  const base = './';
  const publicadas = ediciones.filter((e) => !e.prueba);
  return cabezaHtml({ titulo: 'La Línea: la hemeroteca del diario de BiPlot', descripcion: 'Todas las ediciones de La Línea, el diario de BiPlot: IA, gestión, casos de éxito, economía y deporte, con sus fuentes.',
    url: `${SITIO}/diario/`, base, noindex: !publicadas.length }) +
`<main id="contenido" class="diario">
<article class="hoja" aria-label="La hemeroteca">
  <p class="folio"><span>Santiago de Chile</span><span>La hemeroteca</span><span>${ediciones.length} ${ediciones.length === 1 ? 'edición' : 'ediciones'}</span></p>
  <h1 class="cabecera">La Línea</h1>
  <p class="lema">El diario de BiPlot · Todas las ediciones, la más nueva arriba</p>
  ${LINEA}
  <h2 class="pagina-titulo">Hemeroteca</h2>
  <ol class="hemeroteca">
${ediciones.map((e) => `    <li><a href="${e.fecha}/"><span class="num">${esc(numero(e))}</span><span class="fecha">${esc(fechaLarga(e.fecha))}${e.prueba ? '<span class="etiqueta">Prueba</span>' : ''}</span><span class="tit">${md(lista(e.portada)[0].titular)}</span></a></li>`).join('\n')}
  </ol>
</article>
</main>
` + pieWeb(base);
}

// ---------- El correo ----------
// Tablas de 600 px y estilos en línea. Gmail y Outlook no cargan las fuentes del diario: la cabecera gótica va como
// imagen (imagenes/cabecera.png), los titulares caen en Arial Narrow y el texto en Georgia.
const C = {
  gotica: "UnifrakturMaguntia,'Old English Text MT',serif", titular: "Oswald,'Arial Narrow',Arial,Helvetica,sans-serif",
  texto: "'Old Standard TT',Georgia,'Times New Roman',serif", maquina: "'Courier Prime','Courier New',Courier,monospace",
  noche: '#0B0D10', papel: '#E7DDC4', papel2: '#DDD1B3', tinta: '#17140F', tinta2: '#3B362D', gris: '#5E5748', ocre: '#7A5512', farol: '#C8962E',
  cta: '#FF6B4A', ctaTexto: '#2b0f08', papelClaro: '#C9BFA6',
};
const img = (rel) => `${SITIO}/diario/${rel}`;
const kickerC = (t, color = C.ocre) => `<div style="font:500 11px/1.3 ${C.titular};letter-spacing:3px;text-transform:uppercase;color:${color};">${esc(t)}</div>`;
function firmaC(id) {
  const f = FIRMAS[id];
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="44" valign="middle" style="padding-right:10px;"><img src="${img(`imagenes/caras/${id}.png`)}" width="44" height="44" alt="" style="display:block;border:0;border-radius:22px;"></td>
<td valign="middle" style="font:600 12px/1.3 ${C.titular};letter-spacing:2px;text-transform:uppercase;color:${C.tinta};">Por ${esc(f.nombre)} · ${esc(f.placa)}<br>
<span style="font:italic 14px/1.3 ${C.texto};letter-spacing:0;text-transform:none;color:${C.tinta2};">«${esc(f.frase)}»</span></td></tr></table>`;
}
function fuentesC(fuentes, color = C.gris) {
  const fs_ = lista(fuentes);
  if (!fs_.length) return '';
  return `<div style="margin-top:8px;font:400 12px/1.5 ${C.maquina};color:${color};">${fs_.length > 1 ? 'Fuentes' : 'Fuente'}: ${fs_.map((f) => `<a href="${esc(f.url)}" style="color:${color};text-decoration:underline;">${esc(f.medio)}</a>`).join(' · ')}</div>`;
}
const parrafosC = (x, color = C.tinta) => lista(x).map((p) => `<div style="margin-top:8px;font:400 16px/1.5 ${C.texto};color:${color};">${md(p)}</div>`).join('\n');
function notaC(n, sec, { oscuro = false } = {}) {
  const tc = oscuro ? C.papel : C.tinta;
  return `<tr><td style="padding:0 0 22px 0;">
${n.cifra ? `<div style="font:700 34px/1 ${C.titular};color:${oscuro ? C.farol : C.tinta};">${esc(n.cifra.valor)}</div>${n.cifra.leyenda ? `<div style="font:700 11px/1.4 ${C.maquina};text-transform:uppercase;color:${oscuro ? C.papelClaro : C.gris};margin:3px 0 8px;">${esc(n.cifra.leyenda)}</div>` : ''}` : ''}
<div style="font:700 22px/1.08 ${C.titular};text-transform:uppercase;color:${tc};">${md(n.titular)}</div>
${parrafosC(n.bajada, tc)}
${n.importa ? `<div style="margin-top:10px;padding:7px 9px;border:1px solid ${oscuro ? C.papelClaro : C.tinta};font:400 14px/1.45 ${C.texto};color:${tc};"><b style="font:600 11px ${C.titular};letter-spacing:2px;text-transform:uppercase;">${esc(sec.importa || 'Por qué importa')}</b> ${md(n.importa)}</div>` : ''}
${fuentesC(n.fuentes, oscuro ? C.papelClaro : C.gris)}
</td></tr>`;
}
const cabSeccionC = (sec) => `<tr><td style="padding:20px 0 14px 0;">
${kickerC(sec.kicker)}
<div style="font:700 30px/1.05 ${C.titular};text-transform:uppercase;color:${C.tinta};margin:4px 0 10px;">${esc(sec.nombre[0])} <i style="font:italic 400 28px ${C.texto};text-transform:none;">${esc(sec.nombre[1])}</i></div>
${firmaC(sec.firma)}
</td></tr>`;
const barraPaginaC = (pag) => `<tr><td style="padding:26px 0 6px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${C.tinta}" style="background:${C.tinta};padding:8px 12px;font:700 15px/1.1 ${C.titular};letter-spacing:3px;text-transform:uppercase;color:${C.papel};">Página ${pag.numero} · ${esc(pag.nombre.join(' '))}</td></tr></table></td></tr>`;
function seccionC(ed, sec) {
  const v = ed[sec.id];
  let filas;
  if (sec.id === 'dato') {
    filas = `<tr><td style="padding:0 0 4px 0;font:700 72px/1 ${C.titular};color:${C.tinta};">${esc(v.valor)}</td></tr>
<tr><td style="padding:0 0 12px 0;font:700 12px/1.4 ${C.maquina};text-transform:uppercase;color:${C.ocre};">${esc(v.leyenda)}</td></tr>${notaC({ ...v, cifra: null }, sec)}`;
  } else if (sec.id === 'caso') {
    const paso = (t, x) => `<tr><td style="padding:8px 0 0 0;border-top:2px solid ${C.tinta};">${kickerC(t)}<div style="margin-top:3px;font:400 15px/1.5 ${C.texto};color:${C.tinta};">${md(x)}</div></td></tr>`;
    filas = `<tr><td style="padding:0 0 22px 0;"><div style="font:700 24px/1.08 ${C.titular};text-transform:uppercase;color:${C.tinta};">${md(v.titular)}</div>
${parrafosC(v.bajada)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">${paso('Lo que pasaba', v.antes)}${paso('Lo que cambiaron', v.cambio)}${paso('Lo que pasó', v.resultado)}</table>
${fuentesC(v.fuentes)}</td></tr>`;
  } else if (sec.id === 'mito') {
    filas = lista(v).map((n) => {
      const [txt] = VEREDICTOS[n.veredicto] || VEREDICTOS['a medias'];
      const color = n.veredicto === 'a medias' ? C.ocre : C.tinta;
      return `<tr><td style="padding:0 0 22px 0;"><span style="display:inline-block;border:3px double ${color};padding:2px 9px;font:700 14px/1.2 ${C.titular};letter-spacing:4px;text-transform:uppercase;color:${color};">${txt}</span>
<div style="margin-top:10px;font:italic 400 21px/1.25 ${C.texto};color:${C.tinta};">«${md(n.afirmacion)}»</div>
${parrafosC(n.bajada)}${fuentesC(n.fuentes)}</td></tr>`;
    }).join('\n');
  } else if (sec.id === 'marcador') {
    filas = `<tr><td style="padding:0 0 16px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${C.tinta}" style="background:${C.tinta};padding:18px 16px 0 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lista(v.notas).map((n) => notaC(n, sec, { oscuro: true })).join('\n')}</table></td></tr></table></td></tr>`;
    if (lista(v.agenda).length) filas += `<tr><td style="padding:6px 0 12px 0;border-top:3px double ${C.tinta};"><div style="padding-top:8px;font:600 12px ${C.titular};letter-spacing:3px;text-transform:uppercase;color:${C.tinta};">Lo que viene</div>
${lista(v.agenda).map((a) => `<div style="margin-top:6px;font:400 15px/1.45 ${C.texto};color:${C.tinta};"><span style="font:700 13px ${C.maquina};text-transform:uppercase;">${esc(a.fecha)}</span> · ${md(a.texto)}</div>`).join('')}</td></tr>`;
  } else {
    filas = lista(v).map((n) => notaC(n, sec)).join('\n');
  }
  return cabSeccionC(sec) + filas;
}
function cierreC(ed) {
  const preg = lista(ed.preguntas);
  let filas = '';
  if (preg.length) filas += cabSeccionC(seccion('preguntas')) + preg.map((p, i) => `<tr><td style="padding:0 0 12px 0;font:400 17px/1.35 ${C.texto};color:${C.tinta};"><b style="font:700 20px ${C.titular};">${i + 1}.</b> ${md(p.pregunta)}</td></tr>`).join('');
  if (ed.aparte) filas += `<tr><td style="padding:16px 0 0 0;border-top:4px solid ${C.tinta};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  <td width="58" valign="top" style="padding:14px 12px 0 0;"><img src="${img('imagenes/rumbo.png')}" width="56" height="56" alt="" style="display:block;border:0;border-radius:12px;"></td>
  <td valign="top" style="padding-top:14px;">${kickerC('Consultorio · Psst… ¿y tu día?')}
  <div style="font:700 22px/1.1 ${C.titular};text-transform:uppercase;color:${C.tinta};margin-top:4px;">${md(ed.aparte.titulo)}</div>
  <div style="font:400 15px/1.5 ${C.texto};color:${C.tinta};margin-top:6px;">${md(ed.aparte.texto)}</div>
  <div style="margin-top:8px;font:700 12px/1.4 ${C.maquina};text-transform:uppercase;"><a href="${esc(ed.aparte.enlace || RUMBO)}" style="color:${C.tinta};">Conoce Rumbo, la app de BiPlot para ordenar tu día →</a></div></td></tr></table></td></tr>`;
  // Se busca: el aviso de BiPlot, con el único coral del diario
  filas += `<tr><td style="padding:24px 0 8px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:3px solid ${C.tinta};"><tr><td align="center" style="padding:18px 16px 22px 16px;">
  ${kickerC('Aviso · BiPlot, automatización a la medida', C.tinta2)}
  <div style="font:700 56px/1 ${C.titular};letter-spacing:3px;text-transform:uppercase;color:${C.tinta};margin:6px 0 8px;">Se busca</div>
  <div style="font:400 16px/1.45 ${C.texto};color:${C.tinta};">Procesos que se repiten, planillas a mano y tareas que nadie quiere hacer.</div>
  <div style="margin-top:8px;font:700 13px/1.4 ${C.maquina};text-transform:uppercase;color:${C.tinta};">Recompensa: las horas de vuelta</div>
  <div style="margin-top:6px;font:400 15px/1.45 ${C.texto};color:${C.tinta};">Tu proceso es el próximo punto. Una sesión corta, sin costo.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr><td bgcolor="${C.cta}" style="background:${C.cta};border-radius:999px;">
    <a href="${AGENDAR}" style="display:inline-block;padding:13px 24px;font:700 15px/1 ${C.titular};letter-spacing:2px;text-transform:uppercase;color:${C.ctaTexto};text-decoration:none;">● &nbsp;Agenda tu diagnóstico</a></td></tr></table>
  </td></tr></table></td></tr>`;
  return filas;
}
function edicionCorreo(ed) {
  const fecha = fechaLarga(ed.fecha);
  const url = `${SITIO}/diario/${ed.fecha}/`;
  const ind = lista(ed.indicadores);
  const paginas = paginasDe(ed);
  const [principal, ...lado] = lista(ed.portada);
  const foto = ed.foto || FOTO;
  const pie = typeof foto.pie === 'function' ? foto.pie(ed) : foto.pie;
  const fuentes = todasLasFuentes(ed);
  const preg = lista(ed.preguntas);
  const celdasInd = ind.map((i) => `<td class="ind" width="${Math.floor(100 / ind.length)}%" valign="top" style="padding:8px 8px 8px 0;">
<div style="font:700 10px/1.2 ${C.maquina};letter-spacing:2px;text-transform:uppercase;color:${C.ocre};">${esc(i.nombre)}</div>
<div style="font:600 19px/1.15 ${C.titular};color:${C.tinta};margin-top:3px;">${esc(i.valor)}</div>
<div style="font:400 11px/1.3 ${C.maquina};color:${C.gris};margin-top:2px;">${esc(i.nota || '')}</div></td>`).join('');
  let paginasHtml = '';
  for (const p of paginas) {
    paginasHtml += barraPaginaC(p) + (p.cierre ? cierreC(ed) : p.secciones.filter((id) => tiene(ed, id)).map((id) => seccionC(ed, seccion(id))).join(''));
  }
  return `<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>La Línea ${esc(numero(ed))} · ${esc(fecha)}</title>
<link href="${FUENTES_WEB}" rel="stylesheet">
<style>
  body{margin:0;padding:0;background:${C.noche};}
  a{color:${C.tinta};}
  @media (max-width:620px){
    .contenedor{width:100% !important;}
    .pad{padding-left:16px !important;padding-right:16px !important;}
    .ind{display:inline-block !important;width:48% !important;}
    .grande{font-size:30px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.noche};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.noche};">${esc(ed.previa || '')}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.noche}" style="background:${C.noche};">
<tr><td align="center" style="padding:14px 0 30px 0;">
<table role="presentation" class="contenedor" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
<tr><td style="padding:0 6px 10px 6px;text-align:right;font:700 11px/1.4 ${C.maquina};letter-spacing:1px;text-transform:uppercase;"><a href="${url}" style="color:#B9AE94;">Ver en el navegador</a></td></tr>
<tr><td bgcolor="${C.papel}" class="pad" style="background:${C.papel};padding:18px 24px 26px 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td valign="middle" style="font:700 10px/1.35 ${C.maquina};letter-spacing:1px;text-transform:uppercase;color:${C.tinta};"><span style="font:700 15px ${C.titular};">${esc(numero(ed))}</span><br>${ed.prueba ? 'Edición de prueba' : 'Edición semanal'}</td>
    <td valign="middle" align="right" style="font:700 10px/1.35 ${C.maquina};letter-spacing:1px;text-transform:uppercase;color:${C.tinta};"><span style="font:700 15px ${C.titular};">Gratis</span><br>${esc(PERIODICIDAD)}</td></tr></table></td></tr>
  <tr><td align="center" style="padding:4px 0 0 0;"><img src="${img('imagenes/cabecera.png')}" width="552" alt="La Línea" style="display:block;width:100%;max-width:552px;height:auto;border:0;font:400 64px ${C.gotica};color:${C.tinta};"></td></tr>
  <tr><td align="center" style="padding:0 0 10px 0;font:italic 16px/1.3 ${C.texto};color:${C.tinta2};">El diario de BiPlot · Lo que pasó esta semana, en cinco minutos</td></tr>
  <tr><td style="border-top:3px double ${C.tinta};border-bottom:3px double ${C.tinta};padding:6px 0;font:700 11px/1.3 ${C.maquina};letter-spacing:1px;text-transform:uppercase;color:${C.tinta};">
    Santiago de Chile · ${esc(fecha)} · ${esc(ed.cubre || '')}</td></tr>
  ${ind.length ? `<tr><td style="border-bottom:1px solid ${C.tinta};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${celdasInd}</tr></table></td></tr>` : ''}
  <tr><td align="center" class="grande" style="padding:20px 0 6px 0;font:700 38px/1 ${C.titular};text-transform:uppercase;color:${C.tinta};">${md(principal.titular)}</td></tr>
  ${principal.importa ? `<tr><td align="center" style="padding:0 0 14px 0;font:italic 17px/1.4 ${C.texto};color:${C.tinta2};">${md(principal.importa)}</td></tr>` : ''}
  <tr><td style="padding:0 0 4px 0;"><img src="${img(foto.src)}" width="552" alt="${esc(pie)}" style="display:block;width:100%;max-width:552px;height:auto;border:1px solid ${C.tinta};"></td></tr>
  <tr><td style="padding:0 0 14px 0;font:italic 13px/1.4 ${C.texto};color:${C.tinta2};">${esc(pie)} <span style="font:700 10px ${C.maquina};text-transform:uppercase;font-style:normal;">Ilustración: BiPlot</span></td></tr>
  <tr><td style="padding:0 0 4px 0;">${firmaC('aby')}</td></tr>
  <tr><td style="padding:0 0 22px 0;">${parrafosC(principal.bajada)}${fuentesC(principal.fuentes)}</td></tr>
  ${lado.map((n) => notaC(n, seccion('portada'))).join('\n')}
  ${lista(ed.redaccion).length ? `<tr><td style="padding:12px 14px;border-top:3px double ${C.tinta};border-bottom:3px double ${C.tinta};background:${C.papel2};" bgcolor="${C.papel2}">
    <div style="font:700 11px ${C.titular};letter-spacing:3px;text-transform:uppercase;color:${C.tinta};">Nota de la redacción</div>
    ${lista(ed.redaccion).map((p) => `<div style="margin-top:6px;font:italic 15px/1.45 ${C.texto};color:${C.tinta};">${md(p)}</div>`).join('')}</td></tr>` : ''}
  ${paginasHtml}
  </table>
</td></tr>
<tr><td bgcolor="${C.noche}" class="pad" style="background:${C.noche};padding:22px 24px 0 24px;font:400 12px/1.6 ${C.maquina};color:#B9AE94;">
  ${preg.length ? `<div style="font:700 11px ${C.maquina};letter-spacing:2px;text-transform:uppercase;color:${C.farol};">Soluciones de Plotty</div>
  ${preg.map((p, i) => `<div style="margin-top:4px;">${i + 1}. ${md(p.respuesta)}</div>`).join('')}<br>` : ''}
  <div style="font:700 11px ${C.maquina};letter-spacing:2px;text-transform:uppercase;color:${C.farol};">Agencias y fuentes</div>
  <div style="margin-top:4px;">${fuentes.map((f) => fuentePie(f, ' style="color:#E7DDC4;"')).join(' · ')}</div><br>
  <div style="font:700 11px ${C.maquina};letter-spacing:2px;text-transform:uppercase;color:${C.farol};">Fe de erratas</div>
  <div style="margin-top:4px;">${lista(ed.erratas).length ? lista(ed.erratas).map(md).join('<br>') : 'Sin correcciones en esta edición. Si ves un error, responde este correo y lo corregimos aquí.'}</div><br>
  <div>La Línea es el diario de BiPlot. ${PERIODICIDAD}. ${hechura(ed)}. Los resúmenes son nuestros; las notas completas son de cada medio, y cada una lleva su enlace.</div>
  <div style="margin-top:8px;"><a href="${url}" style="color:#E7DDC4;">Ver en el navegador</a> · <a href="${SITIO}/diario/" style="color:#E7DDC4;">La hemeroteca</a> · <a href="${SITIO}/" style="color:#E7DDC4;">biplot.cl</a> · <a href="${BAJA}" style="color:#E7DDC4;">Darte de baja</a></div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;
}

// ---------- Armar ----------
const archivos = fs.readdirSync(carpetaEd).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
if (!archivos.length) { console.error('No hay ediciones en', path.relative(raiz, carpetaEd)); process.exit(1); }
const ediciones = archivos.map((f) => { const ed = JSON.parse(fs.readFileSync(path.join(carpetaEd, f), 'utf8')); validar(ed, path.join(carpetaEd, f)); return ed; });
const pedida = process.argv[2] || archivos.at(-1).slice(0, 10);
const ed = ediciones.find((e) => e.fecha === pedida);
if (!ed) { console.error('No encontré la edición', pedida); process.exit(1); }

const escribir = (rel, html) => { const f = path.join(raiz, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); console.log('✓', rel, Math.round(html.length / 1024) + ' KB'); };
escribir(`diario/${ed.fecha}/index.html`, edicionWeb(ed));
escribir('diario/index.html', hemerotecaWeb([...ediciones].reverse()));
escribir(`diario/_herramientas/salida/${ed.fecha}-correo.html`, edicionCorreo(ed));
