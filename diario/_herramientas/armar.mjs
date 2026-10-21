// Arma una edición de La Línea, el diario de BiPlot, desde su contenido (diario/_herramientas/ediciones/<fecha>.json):
//   diario/<fecha>/index.html                        la edición en la web (biplot.cl/diario/<fecha>/), con diario/diario.css
//   diario/index.html                                la hemeroteca, con todas las ediciones (la más nueva arriba)
//   diario/ultima.json                               la última edición que no es de prueba, para la portada de
//                                                    biplot.cl, el quiosco de la oficina y el cintillo de BiPlot.TV
//   diario/_herramientas/salida/<fecha>-correo.html  el correo: tablas de 600 px y estilos en línea (no se sube)
// Uso, desde la raíz del repo: node diario/_herramientas/armar.mjs [AAAA-MM-DD]   (sin fecha, la última)
// Es un tomo de manga: la tapa a color (la escena de la semana) y, al abrirlo, los capítulos en blanco y negro, con
// paneles, tramas y globos. Quién firma cada sección y sus textos fijos (SECCIONES) y cómo se reparten en capítulos
// (PAGINAS) están aquí; el JSON trae sólo lo de esa semana. Las caras (en anime, como la tapa) y la tapa se dibujan con
// IA; imagenes.mjs las baja al repo y saca el ícono de Rumbo. Cómo se escribe el JSON está en diario/README.md.
import fs from 'node:fs'; import path from 'node:path';

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const carpetaEd = path.join(raiz, 'diario', '_herramientas', 'ediciones');
const SITIO = 'https://biplot.cl';
const AGENDAR = 'https://wa.me/56966275675?text=Hola%20BiPlot%20%F0%9F%91%8B%2C%20quiero%20agendar%20un%20diagn%C3%B3stico.';
const RUMBO = 'https://rumbo.biplot.cl/conoce';
const PERIODICIDAD = 'Sale los lunes';
// El enlace para darse de baja lo pone la plataforma de envío, Brevo: aquí va su etiqueta, que Brevo cambia por el
// enlace de cada suscriptor al enviar.
const BAJA = '{{ unsubscribe }}';
// Las caras van en diario/imagenes/caras/<id>.jpg. Las que todavía no se bajan al repo están en caras.json, con la URL
// donde quedaron al generarlas (la de blanco y negro y la de color), y se piden de ahí; imagenes.mjs caras las baja.
const listaCaras = path.join(raiz, 'diario', '_herramientas', 'caras.json');
const CARAS_FUERA = fs.existsSync(listaCaras) ? JSON.parse(fs.readFileSync(listaCaras, 'utf8')) : {};

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
// Lo que dice el pie de cómo se hizo: una edición de prueba que nadie ha revisado no puede decir «revisado por personas»
const hechura = (ed) => (ed.prueba && !ed.edita ? 'Armada con ayuda de IA; como es de prueba, todavía le falta la revisión de una persona'
  : `Hecho con ayuda de IA y revisado por personas${ed.edita ? `. Edita: ${esc(ed.edita)}` : ''}`);
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
  if (ed.tapa && !/^(https:\/\/|imagenes\/)/.test(ed.tapa.src || '')) faltan.push('tapa: «src» va con una URL https o una ruta imagenes/…');
  for (const [id, c] of Object.entries(CARAS_FUERA)) if (!/^https:\/\/.+\.png$/.test(c.bn || '')) faltan.push(`caras.json: «${id}» no trae su URL https (.png) en «bn»`);
  if (faltan.length) { console.error(`✗ ${path.relative(raiz, archivo)}:\n  - ` + faltan.join('\n  - ')); process.exit(1); }
}

// Los capítulos del tomo, después de la tapa: el 1 es la portada y los demás agrupan las secciones. Un capítulo que no
// traiga ninguna de sus secciones no sale, y los que siguen corren su número. El último es el de pasatiempos y avisos.
const PAGINAS = [
  { id: 'economia', nombre: 'Economía y gestión', secciones: ['dato', 'planos', 'caso'] },
  { id: 'tecnologia', nombre: 'Tecnología y verificación', secciones: ['maquinas', 'mito', 'guardar', 'lanzamientos', 'mundo'] },
  { id: 'deportes', nombre: 'Deportes', secciones: ['marcador'] },
  { id: 'avisos', nombre: 'Pasatiempos y avisos', secciones: ['preguntas'], cierre: true },
];
const seccion = (id) => SECCIONES.find((s) => s.id === id);
const tiene = (ed, id) => { const v = ed[id]; return !!v && (!Array.isArray(v) || v.length > 0); };
function paginasDe(ed) {
  let n = 1;
  return PAGINAS.filter((p) => p.cierre || p.secciones.some((id) => tiene(ed, id))).map((p) => ({ ...p, numero: ++n }));
}
const Mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const vol = (ed) => 'Vol. ' + ed.numero;
// La tapa: una URL https (mientras está donde se generó) o una ruta imagenes/tapas/… (cuando ya está en el repo)
const tapaSrc = (ed, base) => (/^https:\/\//.test(ed.tapa.src) ? ed.tapa.src : base + ed.tapa.src);
const tapaSrcCorreo = (ed) => (/^https:\/\//.test(ed.tapa.src) ? ed.tapa.src : `${SITIO}/diario/${ed.tapa.src}`);

// ---------- La web ----------
const ISOTIPO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#FAFAF7"/><path d="M9 8 V24 H25" fill="none" stroke="#0B0B0B" stroke-width="1.7" stroke-linecap="round"/><polyline points="10.5,20.5 15,16.5 19,18 23,11" fill="none" stroke="#0B0B0B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/><circle cx="10.5" cy="20.5" r="1.8" fill="#0B0B0B"/><circle cx="15" cy="16.5" r="1.8" fill="#0B0B0B"/><circle cx="19" cy="18" r="1.8" fill="#0B0B0B"/><circle cx="23" cy="11" r="2.3" fill="#FF6B4A"/></svg>';
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230B0B0B'/%3E%3Cpath d='M9 8 V24 H25' stroke='%23FAFAF7' stroke-width='1.7' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='11.5' cy='20.5' r='2.2' fill='%23FAFAF7'/%3E%3Ccircle cx='16' cy='17' r='2.2' fill='%23FAFAF7'/%3E%3Ccircle cx='23' cy='11' r='2.8' fill='%23FF6B4A'/%3E%3C/svg%3E";
const FUENTES_WEB = 'https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Bangers&family=Archivo+Narrow:wght@400;600;700&family=Patrick+Hand&family=IBM+Plex+Mono:wght@400;600&display=swap';

function cabezaHtml({ titulo: t, descripcion, url, base, noindex, imagen }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(descripcion)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#0B0B0B">
<meta property="og:type" content="article">
<meta property="og:site_name" content="BiPlot">
<meta property="og:locale" content="es_CL">
<meta property="og:title" content="${esc(t)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(imagen || `${SITIO}/assets/og-image.png`)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FUENTES_WEB}" rel="stylesheet">
<link rel="stylesheet" href="${base}diario.css">
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="barra"><div>
  <a href="${base}../" aria-label="BiPlot, inicio">${ISOTIPO}<span class="marca">BiPlot</span></a>
  <nav aria-label="Diario"><a href="${base}">Hemeroteca</a><a href="${base}../oficina/">BiPlot HQ</a></nav>
</div></header>
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
// En la web, de una cara que sigue fuera se pide la versión chica en WebP que la herramienta deja al lado (…_min.webp)
const caraWeb = (id, base) => (CARAS_FUERA[id] ? CARAS_FUERA[id].bn.replace(/\.png$/, '_min.webp') : `${base}imagenes/caras/${id}.jpg`);
const recuadro = (id, base, tam = 84) => `<span class="recuadro" style="width:${tam}px;height:${tam}px"><img src="${esc(caraWeb(id, base))}" alt="" width="${tam}" height="${tam}" loading="lazy"></span>`;
function fuentesWeb(fuentes) {
  const fs_ = lista(fuentes);
  if (!fs_.length) return '';
  return `<p class="fuente">${fs_.length > 1 ? 'Fuentes' : 'Fuente'}: ${fs_.map((f) => `<a href="${esc(f.url)}" rel="noopener">${esc(f.medio)}</a>`).join(' · ')}</p>`;
}
const parrafos = (x) => lista(x).map((p) => `<p class="bajada">${md(p)}</p>`).join('\n      ');
const importaWeb = (n, sec) => (n.importa ? `<p class="importa"><b>${esc(sec.importa || 'Por qué importa')}.</b>${md(n.importa)}</p>` : '');
function notaWeb(n, sec, clase = '') {
  const cifra = n.cifra ? `<p class="cifra">${esc(n.cifra.valor)}${n.cifra.leyenda ? `<small>${esc(n.cifra.leyenda)}</small>` : ''}</p>` : '';
  return `<article class="panel nota ${clase}">
      ${cifra}<h4>${md(n.titular)}</h4>
      ${parrafos(n.bajada)}
      ${importaWeb(n, sec)}
      ${fuentesWeb(n.fuentes)}
    </article>`;
}
// La cabecera de una sección: el recuadro de quien firma, el nombre y su frase en un globo
const cabSeccion = (sec, base) => {
  const f = FIRMAS[sec.firma];
  return `<header class="sec-cab">${recuadro(sec.firma, base)}<div class="sec-nombre"><h3>${esc(tituloPlano(sec.nombre))}</h3><span>${esc(sec.kicker)}</span></div>
  <p class="sec-firma"><b>${esc(f.nombre)} · ${esc(f.placa)}</b><i>«${esc(f.frase)}»</i></p></header>`;
};
function seccionWeb(ed, sec, base) {
  const v = ed[sec.id];
  let cuerpo;
  if (sec.id === 'dato') {
    cuerpo = `<div class="el-dato"><p class="grande"><b>${esc(v.valor)}</b><small>${esc(v.leyenda)}</small></p>${notaWeb({ ...v, cifra: null }, sec)}</div>`;
  } else if (sec.id === 'caso') {
    cuerpo = `<article class="panel nota caso"><h4>${md(v.titular)}</h4>${parrafos(v.bajada)}${fuentesWeb(v.fuentes)}</article>
    <div class="tira"><div class="panel"><p class="narra">Lo que pasaba</p><p>${md(v.antes)}</p></div><div class="panel"><p class="narra">Lo que cambiaron</p><p>${md(v.cambio)}</p></div><div class="panel"><p class="narra">Lo que pasó</p><p>${md(v.resultado)}</p></div></div>`;
  } else if (sec.id === 'mito') {
    cuerpo = `<div class="paneles n-${Math.min(lista(v).length, 3)}">${lista(v).map((n) => {
      const [txt, cl] = VEREDICTOS[n.veredicto] || VEREDICTOS['a medias'];
      return `<article class="panel nota mito"><span class="timbre ${cl}">${txt}</span><p class="afirmacion">«${md(n.afirmacion)}»</p>
      ${parrafos(n.bajada)}${fuentesWeb(n.fuentes)}</article>`;
    }).join('\n')}</div>`;
  } else if (sec.id === 'marcador') {
    const notas = lista(v.notas);
    cuerpo = `<div class="marcador"><p class="onomatopeya" aria-hidden="true">¡DON!</p><div class="paneles n-${Math.min(notas.length, 3)}">${notas.map((n) => notaWeb(n, sec)).join('\n')}</div></div>
    ${lista(v.agenda).length ? `<div class="agenda"><h4>Lo que viene</h4><ul>${lista(v.agenda).map((a) => `<li><b>${esc(a.fecha)}</b><span>${md(a.texto)}</span></li>`).join('')}</ul></div>` : ''}`;
  } else {
    const notas = lista(v);
    // en las secciones de varias notas, la del medio va sobre trama, como en una página de manga
    cuerpo = `<div class="paneles n-${Math.min(notas.length, 3)}">${notas.map((n, i) => notaWeb(n, sec, notas.length > 2 && i === 1 ? 'trama' : '')).join('\n')}</div>`;
  }
  return `<section class="seccion" id="${sec.id}" aria-label="${esc(tituloPlano(sec.nombre))}">
  ${cabSeccion(sec, base)}
  ${cuerpo}
</section>`;
}
const capituloWeb = (n, nombre) => `<header class="capitulo"><span>Capítulo ${n}</span><h2>${esc(nombre)}</h2></header>`;
const folioWeb = (ed, n) => `<p class="folio"><span>La Línea · ${esc(vol(ed))} · ${esc(fechaLarga(ed.fecha))}</span><b>${n}</b></p>`;
function tapaWeb(ed, base) {
  if (!ed.tapa) {
    return `<div class="tapa"><div class="tapa-tipografica"><b>La Línea</b><span>${esc(vol(ed))}</span><span>${md(lista(ed.portada)[0].titular)}</span></div>
  <a class="abrir" href="#pagina-1">Abrir el tomo ↓</a></div>`;
  }
  return `<figure class="tapa"><img src="${esc(tapaSrc(ed, base))}" alt="${esc(ed.tapa.alt || '')}" width="1696" height="2528">
  <figcaption>${md(ed.tapa.pie || '')}</figcaption>
  <a class="abrir" href="#pagina-1">Abrir el tomo ↓</a></figure>`;
}
function portadaWeb(ed, base, paginas) {
  const [principal, ...lado] = lista(ed.portada);
  const ind = lista(ed.indicadores);
  const sec = seccion('portada');
  return `<article class="hoja" id="pagina-1" aria-label="Capítulo 1: portada">
  ${capituloWeb(1, `Portada · ${ed.cubre || ''}`)}
  ${ind.length ? `<dl class="mercados" style="--n:${ind.length}">${ind.map((i) => `<div><dt>${esc(i.nombre)}</dt><dd>${esc(i.valor)}</dd><small>${esc(i.nota || '')}${i.fuente ? ` · <a href="${esc(i.fuente.url)}" rel="noopener">${esc(i.fuente.medio)}</a>` : ''}</small></div>`).join('')}</dl>` : ''}
  <div class="portada-paneles">
    <article class="panel principal">
      <p class="onomatopeya" aria-hidden="true">¡Último minuto!</p>
      <div class="contenido">
        <p class="narra">Santiago · ${esc(Mayus(fechaLarga(ed.fecha)))}</p>
        <h2>${md(principal.titular)}</h2>
        ${parrafos(principal.bajada)}
        <div class="dice">${recuadro('aby', base)}${importaWeb(principal, sec)}</div>
        ${fuentesWeb(principal.fuentes)}
      </div>
    </article>
    ${lado.map((n, i) => notaWeb(n, sec, i === 0 ? 'trama' : '')).join('\n')}
  </div>
  ${lista(ed.redaccion).length ? `<aside class="redaccion" aria-label="Nota de la redacción">${recuadro('aby', base, 64)}<div><p class="narra">Nota de la redacción</p>${lista(ed.redaccion).map((p) => `<p>${md(p)}</p>`).join('')}</div></aside>` : ''}
  <nav class="indice" aria-label="En este tomo"><h2>En este tomo</h2><ol>${paginas.map((p) => `<li><a href="#pagina-${p.numero}"><span>Capítulo ${p.numero}: ${esc(p.nombre)}</span><b>${p.numero}</b></a></li>`).join('')}</ol></nav>
  ${folioWeb(ed, 1)}
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
    <div style="display:grid;gap:12px;align-content:start">
      <aside class="se-busca" aria-label="Aviso de BiPlot">
        <p class="narra">Aviso · BiPlot, automatización a la medida</p><br>
        <h3>Se busca</h3><br>
        <p>Procesos que se repiten, planillas a mano y tareas que nadie quiere hacer.</p><br>
        <p class="recompensa">Recompensa: las horas de vuelta</p><br>
        <p>Tu proceso es el próximo punto. Una sesión corta, sin costo.</p>
        <span class="accion"><a class="btn-cta" href="${AGENDAR}" rel="noopener">Agenda tu diagnóstico</a></span>
      </aside>
      ${ed.aparte ? `<section class="panel consultorio" aria-label="Consultorio"><img src="${base}imagenes/rumbo.png" alt="" width="64" height="64"><div><p class="narra">Consultorio · Psst… ¿y tu día?</p><h3>${md(ed.aparte.titulo)}</h3><p>${md(ed.aparte.texto)}</p><a href="${esc(ed.aparte.enlace || RUMBO)}" rel="noopener">Conoce Rumbo, la app de BiPlot para ordenar tu día →</a></div></section>` : ''}
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
  return `<article class="hoja" id="pagina-${pag.numero}" aria-label="Capítulo ${pag.numero}: ${esc(pag.nombre)}">
  ${capituloWeb(pag.numero, pag.nombre)}
  ${cuerpo}
  ${folioWeb(ed, pag.numero)}
</article>`;
}
function edicionWeb(ed) {
  const base = '../';
  const paginas = paginasDe(ed);
  return cabezaHtml({ titulo: `La Línea ${vol(ed)} · ${fechaLarga(ed.fecha)}`, descripcion: ed.previa || lista(ed.portada)[0].titular,
    url: `${SITIO}/diario/${ed.fecha}/`, base, noindex: ed.prueba, imagen: ed.tapa ? tapaSrcCorreo(ed) : null }) +
`<main id="contenido" class="tomo">
${tapaWeb(ed, base)}
${portadaWeb(ed, base, paginas)}
${paginas.map((p) => paginaWeb(ed, p, base)).join('\n')}
</main>
` + pieWeb(base);
}
// La hemeroteca: los tomos en el estante, cada uno con su tapa
function hemerotecaWeb(ediciones) {
  const base = './';
  const publicadas = ediciones.filter((e) => !e.prueba);
  return cabezaHtml({ titulo: 'La Línea: la hemeroteca del diario de BiPlot', descripcion: 'Todos los tomos de La Línea, el diario de BiPlot: IA, gestión, casos de éxito, economía y deporte, con sus fuentes.',
    url: `${SITIO}/diario/`, base, noindex: !publicadas.length }) +
`<main id="contenido" class="tomo">
<article class="hoja" aria-label="La hemeroteca">
  ${capituloWeb('·', 'La hemeroteca: todos los tomos, el más nuevo primero')}
  <ol class="estante">
${ediciones.map((e) => `    <li><a href="${e.fecha}/">${e.tapa ? `<img src="${esc(tapaSrc(e, base))}" alt="" loading="lazy">` : `<span class="tapa-tipografica"><b>La Línea</b><span>${esc(vol(e))}</span></span>`}
      <b class="vol">${esc(vol(e))}</b><span class="fecha">${esc(fechaLarga(e.fecha))}${e.prueba ? '<span class="etiqueta">Prueba</span>' : ''}</span><span class="tit">${md(lista(e.portada)[0].titular)}</span></a></li>`).join('\n')}
  </ol>
</article>
</main>
` + pieWeb(base);
}

// ---------- El correo ----------
// Tablas de 600 px y estilos en línea: la tapa a color arriba (como imagen, enlazada a la web) y el interior en blanco y
// negro. Gmail y Outlook no cargan las fuentes del tomo: los titulares caen en Arial Black y el texto en Arial.
const C = {
  titulo: "'Dela Gothic One','Arial Black',Arial,sans-serif", golpe: "Bangers,Impact,'Arial Black',sans-serif",
  texto: "'Archivo Narrow','Arial Narrow',Arial,sans-serif", globo: "'Patrick Hand','Comic Sans MS',cursive", maquina: "'IBM Plex Mono','Courier New',monospace",
  papel: '#FAFAF7', tinta: '#0B0B0B', gris: '#55554F', trama: '#D4D4CE', mesa: '#E2E1DC', cta: '#FF6B4A', ctaTexto: '#2b0f08',
};
const img = (rel) => `${SITIO}/diario/${rel}`;
const caraC = (id) => (CARAS_FUERA[id] ? CARAS_FUERA[id].bn : img(`imagenes/caras/${id}.jpg`));
const narraC = (t) => `<span style="display:inline-block;border:3px solid ${C.tinta};background:${C.papel};padding:2px 8px;font:700 11px/1.3 ${C.texto};letter-spacing:2px;text-transform:uppercase;color:${C.tinta};">${esc(t)}</span>`;
function firmaC(id) {
  const f = FIRMAS[id];
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="56" valign="middle" style="padding-right:10px;"><img src="${esc(caraC(id))}" width="56" height="56" alt="" style="display:block;border:3px solid ${C.tinta};background:${C.trama};"></td>
<td valign="middle" style="font:700 12px/1.3 ${C.texto};letter-spacing:2px;text-transform:uppercase;color:${C.tinta};">${esc(f.nombre)} · ${esc(f.placa)}<br>
<span style="font:16px/1.3 ${C.globo};letter-spacing:0;text-transform:none;color:${C.tinta};">«${esc(f.frase)}»</span></td></tr></table>`;
}
function fuentesC(fuentes) {
  const fs_ = lista(fuentes);
  if (!fs_.length) return '';
  return `<div style="margin-top:8px;font:400 12px/1.5 ${C.maquina};color:${C.gris};">${fs_.length > 1 ? 'Fuentes' : 'Fuente'}: ${fs_.map((f) => `<a href="${esc(f.url)}" style="color:${C.tinta};text-decoration:underline;">${esc(f.medio)}</a>`).join(' · ')}</div>`;
}
const parrafosC = (x) => lista(x).map((p) => `<div style="margin-top:8px;font:400 16px/1.5 ${C.texto};color:${C.tinta};">${md(p)}</div>`).join('\n');
const globoC = (etiqueta, t) => `<div style="margin-top:12px;border:3px solid ${C.tinta};border-radius:18px;padding:9px 12px;font:17px/1.3 ${C.globo};color:${C.tinta};"><b style="font:13px ${C.titulo};">${esc(etiqueta)}.</b> ${md(t)}</div>`;
// Un panel: borde de tinta, como las viñetas
const panelC = (contenido, fondo = C.papel) => `<tr><td style="padding:0 0 12px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${fondo}" style="background:${fondo};border:4px solid ${C.tinta};padding:14px 16px;">${contenido}</td></tr></table></td></tr>`;
function notaC(n, sec) {
  return panelC(`${n.cifra ? `<div style="display:inline-block;background:${C.tinta};color:${C.papel};font:400 32px/1 ${C.golpe};letter-spacing:2px;padding:4px 10px;">${esc(n.cifra.valor)}</div>${n.cifra.leyenda ? `<div style="font:700 11px/1.4 ${C.texto};letter-spacing:2px;text-transform:uppercase;color:${C.gris};margin:4px 0 8px;">${esc(n.cifra.leyenda)}</div>` : ''}` : ''}
<div style="font:400 20px/1.2 ${C.titulo};color:${C.tinta};">${md(n.titular)}</div>
${parrafosC(n.bajada)}
${n.importa ? globoC(sec.importa || 'Por qué importa', n.importa) : ''}
${fuentesC(n.fuentes)}`);
}
const cabSeccionC = (sec) => `<tr><td style="padding:14px 0 12px 0;">
<div style="font:400 26px/1.1 ${C.titulo};color:${C.tinta};">${esc(tituloPlano(sec.nombre))} <span style="font:700 11px ${C.texto};letter-spacing:2px;text-transform:uppercase;">${esc(sec.kicker)}</span></div>
<div style="margin-top:8px;">${firmaC(sec.firma)}</div></td></tr>`;
const capituloC = (n, nombre) => `<tr><td style="padding:22px 0 4px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${C.tinta}" style="background:${C.tinta};padding:9px 12px;color:${C.papel};"><span style="font:700 11px ${C.texto};letter-spacing:2px;text-transform:uppercase;">Capítulo ${n}</span>&nbsp; <span style="font:400 19px/1.1 ${C.titulo};">${esc(nombre)}</span></td></tr></table></td></tr>`;
function seccionC(ed, sec) {
  const v = ed[sec.id];
  let filas;
  if (sec.id === 'dato') {
    filas = panelC(`<div style="text-align:center;font:400 72px/1 ${C.golpe};letter-spacing:3px;color:${C.papel};">${esc(v.valor)}</div><div style="text-align:center;font:700 12px/1.4 ${C.texto};letter-spacing:2px;text-transform:uppercase;color:${C.papel};">${esc(v.leyenda)}</div>`, C.tinta) + notaC({ ...v, cifra: null }, sec);
  } else if (sec.id === 'caso') {
    filas = panelC(`<div style="font:400 22px/1.2 ${C.titulo};color:${C.tinta};">${md(v.titular)}</div>${parrafosC(v.bajada)}${fuentesC(v.fuentes)}`) +
      [['Lo que pasaba', v.antes, C.papel], ['Lo que cambiaron', v.cambio, C.trama], ['Lo que pasó', v.resultado, C.papel]].map(([t, x, fondo]) => panelC(`${narraC(t)}<div style="margin-top:8px;font:400 16px/1.5 ${C.texto};color:${C.tinta};">${md(x)}</div>`, fondo)).join('');
  } else if (sec.id === 'mito') {
    filas = lista(v).map((n) => {
      const [txt] = VEREDICTOS[n.veredicto] || VEREDICTOS['a medias'];
      return panelC(`<span style="display:inline-block;border:4px double ${C.tinta};padding:2px 9px;font:400 15px/1.2 ${C.titulo};letter-spacing:3px;color:${C.tinta};">${txt}</span>
<div style="margin-top:10px;border:3px solid ${C.tinta};border-radius:18px;padding:8px 12px;font:19px/1.3 ${C.globo};color:${C.tinta};">«${md(n.afirmacion)}»</div>
${parrafosC(n.bajada)}${fuentesC(n.fuentes)}`);
    }).join('');
  } else if (sec.id === 'marcador') {
    filas = lista(v.notas).map((n) => notaC(n, sec)).join('');
    if (lista(v.agenda).length) filas += panelC(`<div style="font:400 16px ${C.titulo};color:${C.tinta};">Lo que viene</div>
${lista(v.agenda).map((a) => `<div style="margin-top:6px;font:400 15px/1.45 ${C.texto};color:${C.tinta};"><span style="font:600 12px ${C.maquina};text-transform:uppercase;">${esc(a.fecha)}</span> · ${md(a.texto)}</div>`).join('')}`);
  } else {
    filas = lista(v).map((n) => notaC(n, sec)).join('');
  }
  return cabSeccionC(sec) + filas;
}
function cierreC(ed) {
  const preg = lista(ed.preguntas);
  let filas = '';
  if (preg.length) filas += cabSeccionC(seccion('preguntas')) + preg.map((p, i) => `<tr><td style="padding:0 0 10px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="34" valign="top" bgcolor="${C.tinta}" style="background:${C.tinta};color:${C.papel};text-align:center;font:400 20px/34px ${C.golpe};">${i + 1}</td>
    <td valign="top" style="padding-left:10px;"><div style="border:3px solid ${C.tinta};border-radius:18px;padding:7px 12px;font:18px/1.3 ${C.globo};color:${C.tinta};">${md(p.pregunta)}</div></td></tr></table></td></tr>`).join('');
  // Se busca: el aviso de BiPlot, con el único color de las páginas
  filas += `<tr><td style="padding:12px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:6px solid ${C.tinta};"><tr><td align="center" bgcolor="${C.papel}" style="background:${C.papel};padding:20px 16px 24px 16px;">
  ${narraC('Aviso · BiPlot, automatización a la medida')}
  <div style="font:400 48px/1 ${C.titulo};color:${C.tinta};margin:10px 0 8px;">Se busca</div>
  <div style="font:400 16px/1.45 ${C.texto};color:${C.tinta};">Procesos que se repiten, planillas a mano y tareas que nadie quiere hacer.</div>
  <div style="margin-top:8px;font:400 15px/1.4 ${C.titulo};color:${C.tinta};">Recompensa: las horas de vuelta</div>
  <div style="margin-top:6px;font:400 15px/1.45 ${C.texto};color:${C.tinta};">Tu proceso es el próximo punto. Una sesión corta, sin costo.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr><td bgcolor="${C.cta}" style="background:${C.cta};border:3px solid ${C.tinta};border-radius:999px;">
    <a href="${AGENDAR}" style="display:inline-block;padding:12px 22px;font:400 15px/1 ${C.titulo};color:${C.ctaTexto};text-decoration:none;">● &nbsp;Agenda tu diagnóstico</a></td></tr></table>
  </td></tr></table></td></tr>`;
  if (ed.aparte) filas += panelC(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  <td width="60" valign="top" style="padding-right:12px;"><img src="${img('imagenes/rumbo.png')}" width="56" height="56" alt="" style="display:block;border:3px solid ${C.tinta};"></td>
  <td valign="top">${narraC('Consultorio · Psst… ¿y tu día?')}
  <div style="font:400 19px/1.2 ${C.titulo};color:${C.tinta};margin-top:6px;">${md(ed.aparte.titulo)}</div>
  <div style="font:400 15px/1.5 ${C.texto};color:${C.tinta};margin-top:6px;">${md(ed.aparte.texto)}</div>
  <div style="margin-top:8px;font:400 12px/1.4 ${C.maquina};text-transform:uppercase;"><a href="${esc(ed.aparte.enlace || RUMBO)}" style="color:${C.tinta};">Conoce Rumbo, la app de BiPlot para ordenar tu día →</a></div></td></tr></table>`);
  return filas;
}
function edicionCorreo(ed) {
  const fecha = fechaLarga(ed.fecha);
  const url = `${SITIO}/diario/${ed.fecha}/`;
  const ind = lista(ed.indicadores);
  const paginas = paginasDe(ed);
  const [principal, ...lado] = lista(ed.portada);
  const fuentes = todasLasFuentes(ed);
  const preg = lista(ed.preguntas);
  const sec = seccion('portada');
  const celdasInd = ind.map((i) => `<td class="ind" width="${Math.floor(100 / ind.length)}%" valign="top" style="padding:0 4px 8px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:3px solid ${C.tinta};padding:6px 8px;">
<div style="font:700 10px/1.2 ${C.texto};letter-spacing:2px;text-transform:uppercase;color:${C.tinta};">${esc(i.nombre)}</div>
<div style="font:400 20px/1.15 ${C.golpe};letter-spacing:1px;color:${C.tinta};margin-top:3px;">${esc(i.valor)}</div>
<div style="font:400 10px/1.3 ${C.maquina};color:${C.gris};margin-top:2px;">${esc(i.nota || '')}</div></td></tr></table></td>`).join('');
  let paginasHtml = '';
  for (const p of paginas) {
    paginasHtml += capituloC(p.numero, p.nombre) + (p.cierre ? cierreC(ed) : p.secciones.filter((id) => tiene(ed, id)).map((id) => seccionC(ed, seccion(id))).join(''));
  }
  const tapa = ed.tapa ? `<tr><td style="padding:0 0 14px 0;"><a href="${url}"><img src="${esc(tapaSrcCorreo(ed))}" width="600" alt="${esc(ed.tapa.alt || 'La tapa de La Línea')}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>` :
    `<tr><td bgcolor="${C.tinta}" align="center" style="background:${C.tinta};padding:40px 20px;color:${C.papel};font:400 54px/1 ${C.titulo};">La Línea<br><span style="font-size:20px;">${esc(vol(ed))}</span></td></tr>`;
  return `<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>La Línea ${esc(vol(ed))} · ${esc(fecha)}</title>
<link href="${FUENTES_WEB}" rel="stylesheet">
<style>
  body{margin:0;padding:0;background:${C.mesa};}
  a{color:${C.tinta};}
  @media (max-width:620px){
    .contenedor{width:100% !important;}
    .pad{padding-left:14px !important;padding-right:14px !important;}
    .ind{display:inline-block !important;width:48% !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.mesa};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.mesa};">${esc(ed.previa || '')}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.mesa}" style="background:${C.mesa};">
<tr><td align="center" style="padding:14px 0 30px 0;">
<table role="presentation" class="contenedor" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
<tr><td style="padding:0 4px 10px 4px;text-align:right;font:400 11px/1.4 ${C.maquina};text-transform:uppercase;"><a href="${url}" style="color:${C.gris};">Ver en el navegador</a></td></tr>
${tapa}
<tr><td bgcolor="${C.papel}" class="pad" style="background:${C.papel};padding:18px 22px 26px 22px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  ${capituloC(1, `Portada · ${ed.cubre || ''}`)}
  <tr><td style="padding:10px 0 0 0;font:400 11px/1.4 ${C.maquina};text-transform:uppercase;color:${C.gris};">La Línea · ${esc(vol(ed))}${ed.prueba ? ' · Edición de prueba' : ''} · ${esc(fecha)}</td></tr>
  ${ind.length ? `<tr><td style="padding:10px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${celdasInd}</tr></table></td></tr>` : ''}
  ${panelC(`${narraC(`Santiago · ${Mayus(fecha)}`)}
    <div style="font:400 28px/1.15 ${C.titulo};color:${C.tinta};margin:10px 0 4px;">${md(principal.titular)}</div>
    ${parrafosC(principal.bajada)}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr><td width="64" valign="top" style="padding-right:10px;"><img src="${esc(caraC('aby'))}" width="64" height="64" alt="" style="display:block;border:3px solid ${C.tinta};background:${C.trama};"></td>
    <td valign="top">${principal.importa ? globoC(sec.importa, principal.importa).replace('margin-top:12px;', 'margin-top:0;') : ''}</td></tr></table>
    ${fuentesC(principal.fuentes)}`)}
  ${lado.map((n) => notaC(n, sec)).join('\n')}
  ${lista(ed.redaccion).length ? panelC(`${narraC('Nota de la redacción')}${lista(ed.redaccion).map((p) => `<div style="margin-top:8px;font:400 15px/1.5 ${C.texto};color:${C.tinta};">${md(p)}</div>`).join('')}`, C.trama) : ''}
  ${paginasHtml}
  </table>
</td></tr>
<tr><td class="pad" style="padding:20px 22px 0 22px;font:400 12px/1.6 ${C.maquina};color:${C.gris};">
  ${preg.length ? `<div style="font:700 11px ${C.maquina};letter-spacing:2px;text-transform:uppercase;color:${C.tinta};">Soluciones de Plotty</div>
  ${preg.map((p, i) => `<div style="margin-top:4px;">${i + 1}. ${md(p.respuesta)}</div>`).join('')}<br>` : ''}
  <div style="font:700 11px ${C.maquina};letter-spacing:2px;text-transform:uppercase;color:${C.tinta};">Agencias y fuentes</div>
  <div style="margin-top:4px;">${fuentes.map((f) => fuentePie(f, ` style="color:${C.tinta};"`)).join(' · ')}</div><br>
  <div style="font:700 11px ${C.maquina};letter-spacing:2px;text-transform:uppercase;color:${C.tinta};">Fe de erratas</div>
  <div style="margin-top:4px;">${lista(ed.erratas).length ? lista(ed.erratas).map(md).join('<br>') : 'Sin correcciones en esta edición. Si ves un error, responde este correo y lo corregimos aquí.'}</div><br>
  <div>La Línea es el diario de BiPlot. ${PERIODICIDAD}. ${hechura(ed)}. Los resúmenes son nuestros; las notas completas son de cada medio, y cada una lleva su enlace.</div>
  <div style="margin-top:8px;"><a href="${url}" style="color:${C.tinta};">Ver en el navegador</a> · <a href="${SITIO}/diario/" style="color:${C.tinta};">La hemeroteca</a> · <a href="${SITIO}/" style="color:${C.tinta};">biplot.cl</a> · <a href="${BAJA}" style="color:${C.tinta};">Darte de baja</a></div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;
}

// ---------- Las láminas para redes ----------
// El carrusel de cada edición para Instagram y LinkedIn: láminas de 1080×1350 (4:5) con la tapa, cada nota de la
// portada con su «por qué importa», El dato y un cierre con el resto del número y biplot.cl/diario. Aquí sólo se arma el
// HTML (en salida/, que no se sube); redes.mjs fotografía cada lámina en diario/<fecha>/redes/NN.jpg y esas sí viajan
// en el PR de la edición. Al publicarla, el CRM deja el carrusel por aprobar en Marketing con esas imágenes.
const caraColor = (id) => (CARAS_FUERA[id] && CARAS_FUERA[id].color ? CARAS_FUERA[id].color : `/diario/imagenes/caras/color/${id}.jpg`);
const LAMINA_CSS = `
:root{--papel:#FAFAF7;--tinta:#0B0B0B;--trama-clara:#D4D4CE;--trama-oscura:#6E6E68;--gris:#55554F;
  --titulo:'Dela Gothic One','Arial Black',sans-serif;--golpe:'Bangers',Impact,sans-serif;--texto:'Archivo Narrow','Arial Narrow',sans-serif;
  --globo:'Patrick Hand','Comic Sans MS',cursive;--maquina:'IBM Plex Mono',monospace;
  --trama-c:radial-gradient(circle,var(--trama-oscura) 1.6px,transparent 2.1px) 0 0/9px 9px,var(--trama-clara);
  --trama-o:radial-gradient(circle,var(--tinta) 2px,transparent 2.6px) 0 0/9px 9px,var(--trama-oscura)}
*{box-sizing:border-box;margin:0}
body{background:#E2E1DC;display:grid;gap:40px;justify-content:center;padding:40px 0;-webkit-font-smoothing:antialiased}
.lamina{--k:1;position:relative;width:1080px;height:1350px;overflow:hidden;background:var(--papel);color:var(--tinta);display:flex;flex-direction:column;font-family:var(--texto)}
.cab{display:flex;justify-content:space-between;align-items:center;gap:24px;background:var(--tinta);color:var(--papel);padding:26px 56px}
.cab b{font:400 46px/1 var(--titulo)}
.cab span{font:600 24px/1.2 var(--maquina);letter-spacing:.06em;text-transform:uppercase}
.cuerpo{flex:1;min-height:0;display:flex;flex-direction:column;gap:calc(30px*var(--k));padding:calc(52px*var(--k)) 64px calc(44px*var(--k));border:8px solid var(--tinta);border-top:0;border-bottom:0;overflow:hidden}
.kicker{align-self:flex-start;border:5px solid var(--tinta);padding:8px 18px;font:700 26px/1.2 var(--texto);letter-spacing:.14em;text-transform:uppercase}
.titular{font:400 calc(80px*var(--k))/1.08 var(--titulo);letter-spacing:-.01em}
.bajada{font:400 calc(36px*var(--k))/1.38 var(--texto)}
.dice{margin-top:auto;display:flex;align-items:flex-end;gap:34px}
.cara{flex:none;display:grid;gap:8px;justify-items:center}
.cara img{width:calc(190px*var(--k));height:calc(190px*var(--k));object-fit:cover;border:6px solid var(--tinta);background:var(--trama-c)}
.cara small{font:600 22px/1 var(--maquina);text-transform:uppercase;letter-spacing:.08em}
.globo{position:relative;flex:1;border:6px solid var(--tinta);border-radius:44px;padding:calc(26px*var(--k)) 34px;background:var(--papel);font:400 calc(40px*var(--k))/1.25 var(--globo)}
.globo::before{content:'';position:absolute;left:-34px;bottom:46px;border:17px solid transparent;border-right:30px solid var(--tinta);border-left:0}
.globo::after{content:'';position:absolute;left:-23px;bottom:52px;border:11px solid transparent;border-right:20px solid var(--papel);border-left:0}
.globo b{font:400 calc(30px*var(--k))/1 var(--titulo);margin-right:.3em}
.pie{display:flex;justify-content:space-between;align-items:center;border:8px solid var(--tinta);padding:20px 48px;font:600 26px/1 var(--maquina);letter-spacing:.04em}
.pie b{font:400 30px/1 var(--titulo);letter-spacing:0}
/* La tapa: la ilustración entera, sobre la trama oscura */
.tapa{background:var(--trama-o);align-items:center;padding-top:26px}
.tapa img{height:1210px;width:auto;box-shadow:0 0 0 6px var(--tinta),0 24px 50px -10px rgba(0,0,0,.6)}
.desliza{position:absolute;right:44px;bottom:22px;transform:rotate(-4deg);background:var(--papel);border:6px solid var(--tinta);padding:12px 22px;font:400 46px/1 var(--golpe);letter-spacing:.06em;box-shadow:8px 8px 0 var(--tinta)}
.tapa-tipografica{flex:1;width:812px;margin-bottom:114px;background:var(--tinta);color:var(--papel);display:grid;align-content:center;justify-items:center;gap:40px;padding:80px;text-align:center}
.tapa-tipografica b{font:400 150px/1 var(--titulo)}
.tapa-tipografica span{font:400 52px/1.2 var(--titulo)}
/* El dato: la cifra en grande, sobre la trama */
.cifra{border:8px solid var(--tinta);background:var(--trama-c);padding:calc(26px*var(--k)) 40px calc(30px*var(--k));display:grid;justify-items:center;text-align:center;gap:6px}
.cifra b{font:400 calc(250px*var(--k))/1 var(--golpe);letter-spacing:.02em;-webkit-text-stroke:3px var(--tinta);color:var(--papel);text-shadow:10px 10px 0 var(--tinta)}
.cifra span{background:var(--tinta);color:var(--papel);padding:8px 18px;font:700 30px/1.2 var(--texto);letter-spacing:.1em;text-transform:uppercase}
/* El cierre: el resto del número y dónde leerlo */
.cierre{background:var(--tinta);color:var(--papel)}
.cierre .cuerpo{border-color:var(--tinta)}
.cierre .kicker{border-color:var(--papel)}
.indice{list-style:none;padding:0;display:grid;gap:calc(20px*var(--k))}
.indice li{display:flex;align-items:center;gap:26px}
.indice img{flex:none;width:calc(104px*var(--k));height:calc(104px*var(--k));object-fit:cover;border:5px solid var(--papel)}
.indice i{display:block;font:700 22px/1.3 var(--texto);font-style:normal;letter-spacing:.14em;text-transform:uppercase;color:var(--trama-clara)}
.indice span{font:400 calc(31px*var(--k))/1.22 var(--titulo)}
.final{margin-top:auto;background:var(--papel);color:var(--tinta);border:8px solid var(--papel);padding:34px 40px;display:grid;gap:12px;text-align:center;box-shadow:inset 0 0 0 6px var(--tinta)}
.final b{font:400 54px/1 var(--titulo)}
.final span{font:400 92px/1 var(--golpe);letter-spacing:.03em}
.final small{font:600 24px/1.3 var(--maquina);letter-spacing:.06em;text-transform:uppercase}`;
// Ajusta la letra de cada lámina al texto de la semana (un titular corto va más grande, uno largo se achica hasta caber)
// y avisa a redes.mjs que ya se puede fotografiar.
const LAMINA_JS = `document.fonts.ready.then(() => {
  for (const l of document.querySelectorAll('.lamina')) {
    const c = l.querySelector('.cuerpo'); if (!c) continue;
    for (let k = 1.24; k > .55; k -= .03) { l.style.setProperty('--k', k.toFixed(2)); if (c.scrollHeight <= c.clientHeight + 1) break; }
    if (c.scrollHeight > c.clientHeight + 1) l.dataset.noCabe = '1';
  }
  document.body.dataset.listo = '1';
});`;
function laminasDe(ed) {
  const total = [];
  const fecha = Mayus(fechaLarga(ed.fecha).replace(/ de \d{4}$/, ''));
  const cab = `<header class="cab"><b>La Línea</b><span>${esc(vol(ed))} · ${esc(fecha)}</span></header>`;
  const pie = (n) => `<footer class="pie"><b>biplot.cl/diario</b><span>${n} / {{total}}</span></footer>`;
  const dice = (id, etiqueta, t) => (t ? `<div class="dice"><span class="cara"><img src="${esc(caraColor(id))}" alt=""><small>${esc(FIRMAS[id].nombre)}</small></span><p class="globo"><b>${esc(etiqueta)}.</b>${md(t)}</p></div>` : '');
  total.push(ed.tapa
    ? `<section class="lamina tapa"><img src="${esc(tapaSrc(ed, '/diario/'))}" alt=""><span class="desliza">Desliza →</span></section>`
    : `<section class="lamina tapa"><div class="tapa-tipografica"><b>La Línea</b><span>${esc(vol(ed))}</span><span>${md(lista(ed.portada)[0].titular)}</span></div><span class="desliza">Desliza →</span></section>`);
  const portada = lista(ed.portada), sp = seccion('portada');
  portada.forEach((n, i) => total.push(`<section class="lamina">${cab}<div class="cuerpo">
    <p class="kicker">Portada · ${i + 1} de ${portada.length}</p>
    <h2 class="titular">${md(n.titular)}</h2>
    ${lista(n.bajada).slice(0, 1).map((p) => `<p class="bajada">${md(p)}</p>`).join('')}
    ${dice('aby', sp.importa, n.importa)}
  </div>${pie(total.length + 1)}</section>`));
  if (ed.dato) {
    const sd = seccion('dato');
    total.push(`<section class="lamina">${cab}<div class="cuerpo">
    <p class="kicker">${esc(sd.kicker)} · ${esc(tituloPlano(sd.nombre))}</p>
    ${ed.dato.valor ? `<div class="cifra"><b>${esc(ed.dato.valor)}</b>${ed.dato.leyenda ? `<span>${esc(ed.dato.leyenda)}</span>` : ''}</div>` : ''}
    <h2 class="titular">${md(ed.dato.titular)}</h2>
    ${dice('celda', sd.importa, ed.dato.importa)}
  </div>${pie(total.length + 1)}</section>`);
  }
  // El cierre: lo que no cupo en el carrusel, con quién lo firma
  const resto = SECCIONES.filter((s) => !['portada', 'dato'].includes(s.id) && (s.id === 'preguntas' ? lista(ed.preguntas).length : notasDe(ed, s.id).length)).slice(0, 6).map((s) => {
    const n = notasDe(ed, s.id)[0];
    // Un mito no va como titular: se dice con su veredicto
    const t = s.id === 'preguntas' ? '¿Leíste bien la semana? Tres preguntas para comprobarlo'
      : s.id === 'mito' ? `«${plano(n.afirmacion).replace(/\.$/, '')}». Veredicto: ${(VEREDICTOS[n.veredicto] || [n.veredicto])[0]}`
      : plano(n.titular || n.empresa || '');
    return `<li><img src="${esc(caraColor(s.firma))}" alt=""><span><i>${esc(tituloPlano(s.nombre))} · ${esc(FIRMAS[s.firma].nombre)}</i>${esc(t)}</span></li>`;
  });
  total.push(`<section class="lamina cierre"><div class="cuerpo">
    ${resto.length ? `<p class="kicker">También en este número</p><ul class="indice">${resto.join('')}</ul>` : ''}
    <div class="final"><b>Léela completa</b><span>biplot.cl/diario</span><small>${esc(PERIODICIDAD)} · Gratis · Enlace en la bio</small></div>
  </div></section>`);
  return total.map((l) => l.replace('{{total}}', total.length));
}
function redesHtml(ed) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1160">
<meta name="robots" content="noindex">
<title>${esc(`La Línea, ${vol(ed)}: las láminas para redes`)}</title>
<link href="${FUENTES_WEB}" rel="stylesheet">
<style>${LAMINA_CSS}
</style>
</head>
<body>
${laminasDe(ed).join('\n')}
<script>${LAMINA_JS}</script>
</body>
</html>
`;
}

// ---------- El video de la semana ----------
// La edición en unos 45 segundos, para el canal de La Línea en BiPlot.TV (16:9) y el Reel (9:16): la portada con la
// tapa, cada nota de la portada con lo que dice Aby, El dato y dónde leerla, y al final el cierre de marca BiPlot de
// biplot-nucleo (04-marca/00-motor/cierre-biplot.js, que se monta, no se copia). Aquí sólo se arma la página
// (salida/<fecha>-video.html); video.mjs la graba cuadro a cuadro con su música en diario/<fecha>/video/.
// Una sola línea de tiempo para los dos formatos: el vertical cambia la composición, nunca los tiempos.
const VIDEO_CSS = `
:root{--papel:#FAFAF7;--tinta:#0B0B0B;--trama-clara:#D4D4CE;--trama-oscura:#6E6E68;
  --titulo:'Dela Gothic One','Arial Black',sans-serif;--golpe:'Bangers',Impact,sans-serif;--texto:'Archivo Narrow','Arial Narrow',sans-serif;
  --globo:'Patrick Hand','Comic Sans MS',cursive;--maquina:'IBM Plex Mono',monospace;
  --trama-c:radial-gradient(circle,var(--trama-oscura) .16rem,transparent .21rem) 0 0/.9rem .9rem,var(--trama-clara);
  --trama-o:radial-gradient(circle,var(--tinta) .2rem,transparent .26rem) 0 0/.9rem .9rem,var(--trama-oscura)}
*{box-sizing:border-box;margin:0}
html,body{background:#000}
body{overflow:hidden}
#stage{position:relative;overflow:hidden;background:var(--tinta);color:var(--tinta);font-family:var(--texto);-webkit-font-smoothing:antialiased}
.esc{position:absolute;inset:0;overflow:hidden}
[data-entra]{will-change:transform,opacity}
/* La portada del video */
.intro{background:var(--tinta)}
.rayas{position:absolute;left:50%;top:50%;width:300rem;height:300rem;margin:-150rem 0 0 -150rem;background:repeating-conic-gradient(rgba(250,250,247,.13) 0 1.6deg,transparent 1.6deg 7deg)}
.intro-c{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:3rem;text-align:center;color:var(--papel)}
.intro-c b{font:400 19rem/.95 var(--titulo);color:var(--papel);-webkit-text-stroke:.45rem var(--tinta);text-shadow:1.3rem 1.3rem 0 var(--trama-oscura)}
.intro-c span{font:700 4rem/1.2 var(--texto);letter-spacing:.24em;text-transform:uppercase;background:var(--papel);color:var(--tinta);padding:.6rem 2rem}
.intro-c small{font:600 3.2rem/1.2 var(--maquina);letter-spacing:.08em;text-transform:uppercase}
/* La tapa */
.tapa{background:var(--trama-o);display:flex;align-items:center;justify-content:space-between;gap:7rem;padding:0 9rem}
.tapa .lado{flex:1;display:grid;gap:3.4rem;align-content:center;height:80rem;color:var(--papel)}
.tapa ol{list-style:none;padding:0;display:grid;gap:2.6rem;overflow:hidden}
.tapa li{font:400 4.6rem/1.15 var(--titulo);background:var(--tinta);padding:2rem 2.6rem;border-left:1.2rem solid var(--papel)}
.tapa figure{flex:none;height:92rem;box-shadow:0 0 0 .7rem var(--tinta),0 3rem 6rem -1rem rgba(0,0,0,.6);overflow:hidden;background:var(--tinta)}
.tapa img{height:100%;width:auto;display:block}
.portrait .tapa{flex-direction:column;justify-content:flex-start;padding:23rem 7rem 0;gap:4rem}
.portrait .tapa .lado{flex:none;height:auto;justify-items:center}
.portrait .tapa ol{display:none}
.portrait .tapa figure{height:126rem}
.kicker{justify-self:start;align-self:flex-start;border:.55rem solid currentColor;padding:1rem 2.2rem;font:700 3.2rem/1.2 var(--texto);letter-spacing:.16em;text-transform:uppercase;background:inherit}
.tapa .kicker{color:var(--papel);background:var(--tinta)}
.portrait .tapa .kicker{justify-self:center}
/* Cada nota */
.nota{background:var(--papel);display:flex;flex-direction:column;gap:4rem;padding:9rem 10rem 8rem;border:1.1rem solid var(--tinta)}
.nota .titular{flex:1;min-height:0;overflow:hidden;font:400 8.4rem/1.08 var(--titulo);letter-spacing:-.01em;max-width:150rem}
.dice{display:flex;align-items:flex-end;gap:4.5rem}
.cara{flex:none;display:grid;gap:1rem;justify-items:center}
.cara img{width:25rem;height:25rem;object-fit:cover;border:.7rem solid var(--tinta);display:block}
.cara small{font:600 2.8rem/1 var(--maquina);text-transform:uppercase;letter-spacing:.1em}
.globo{position:relative;flex:1;max-width:120rem;border:.7rem solid var(--tinta);border-radius:5rem;padding:3rem 4rem;background:var(--papel);font:400 4.6rem/1.25 var(--globo);transform-origin:0 100%}
.globo::before{content:'';position:absolute;left:-4.2rem;bottom:5rem;border:2rem solid transparent;border-right:3.6rem solid var(--tinta);border-left:0}
.globo::after{content:'';position:absolute;left:-2.8rem;bottom:5.8rem;border:1.2rem solid transparent;border-right:2.4rem solid var(--papel);border-left:0}
.globo b{font:400 3.4rem/1 var(--titulo);margin-right:.35em}
.portrait .nota{padding:23rem 7rem 19rem;gap:5rem}
.portrait .nota .titular{font-size:9.4rem}
.portrait .dice{gap:4rem}
.portrait .cara img{width:23rem;height:23rem}
.portrait .globo{font-size:4.4rem;padding:3rem 3.4rem}
/* El dato */
.cifra{flex:none;display:grid;justify-items:center;gap:1.4rem;border:1.1rem solid var(--tinta);background:var(--trama-c);padding:2.4rem 4rem 3rem}
.cifra b{font:400 24rem/1 var(--golpe);color:var(--papel);-webkit-text-stroke:.45rem var(--tinta);text-shadow:1.4rem 1.4rem 0 var(--tinta)}
.cifra span{background:var(--tinta);color:var(--papel);padding:1rem 2.4rem;font:700 3.6rem/1.2 var(--texto);letter-spacing:.12em;text-transform:uppercase}
.dato .fila{flex:1;min-height:0;display:flex;gap:7rem;align-items:center}
.dato .fila .titular{font-size:6.6rem;align-self:stretch;display:flex;align-items:center}
.portrait .dato .fila{flex-direction:column;align-items:stretch;gap:5rem}
.portrait .dato .fila .titular{font-size:7.6rem}
.portrait .cifra b{font-size:32rem}
.portrait .intro-c b{font-size:14.5rem}
/* Dónde leerla */
.fin{background:var(--tinta);color:var(--papel);display:grid;place-content:center;justify-items:center;gap:4.4rem;text-align:center;padding:0 8rem}
.fin p{font:400 8.6rem/1 var(--titulo)}
.fin strong{font:400 15rem/1 var(--golpe);letter-spacing:.03em;background:var(--papel);color:var(--tinta);padding:2rem 5rem 1.4rem;box-shadow:1.4rem 1.4rem 0 var(--trama-oscura)}
.fin small{font:600 3.4rem/1.3 var(--maquina);letter-spacing:.08em;text-transform:uppercase}
.caras{display:flex;flex-wrap:wrap;justify-content:center;gap:2.2rem;max-width:150rem}
.caras img{width:13rem;height:13rem;object-fit:cover;border:.5rem solid var(--papel);display:block}
.portrait .fin strong{font-size:11.4rem;padding:2rem 3.4rem 1.4rem}
.portrait .caras{max-width:66rem}
.portrait .caras img{width:14rem;height:14rem}`;
// La animación, igual para todas las ediciones: cada escena dura su data-d y cada cosa con data-entra aparece a esos
// segundos de empezada su escena (data-como: golpe, globo, sube o cae; data-son: el sonido de ese momento).
const VIDEO_JS = `
const qs = new URLSearchParams(location.search);
const W = +qs.get('w') || 1920, H = +qs.get('h') || 1080, P = H > W;
const stage = document.getElementById('stage');
stage.style.width = W + 'px'; stage.style.height = H + 'px';
if (P) stage.classList.add('portrait');
document.documentElement.style.fontSize = Math.min(W, H) / 100 + 'px';
const lim = (x) => Math.max(0, Math.min(1, x));
const suave = (k) => 1 - Math.pow(1 - k, 3);
const rebote = (k) => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const ESC = [...document.querySelectorAll('.esc')].map((el) => ({ el, d: +el.dataset.d, cosas: [...el.querySelectorAll('[data-entra]')].map((c) => ({ c, entra: +c.dataset.entra, como: c.dataset.como || 'sube' })) }));
let t0 = 0;
for (const e of ESC) { e.ini = t0; t0 += e.d; }
const ultima = ESC[ESC.length - 1];
const cierre = CierreBiPlot.montar(stage, { inicio: t0 });
const cues = [{ t: 0.25, type: 'impact' }];
ESC.forEach((e, i) => {
  if (i) cues.push({ t: e.ini, type: 'whoosh', d: 0.5, gain: 0.55 });
  for (const c of e.cosas) if (c.c.dataset.son) cues.push({ t: e.ini + c.entra, type: c.c.dataset.son });
});
window.DURATION = cierre.fin;
window.CUES = [...cues, ...cierre.cues].sort((a, b) => a.t - b.t);
window.FONTS = ['Dela Gothic One', 'Bangers', 'Archivo Narrow', 'Patrick Hand', 'IBM Plex Mono', ...CierreBiPlot.FUENTES];
window.ESCENAS = ESC.map((e) => ({ id: e.el.id, ini: e.ini, d: e.d }));
function aparecer(c, x) {
  const k = lim((x - c.entra) / (c.como === 'golpe' ? 0.32 : 0.45));
  const s = c.c.style;
  s.opacity = c.como === 'golpe' ? lim(k * 3) : suave(k);
  if (c.como === 'golpe') s.transform = 'scale(' + (1.6 - 0.6 * suave(k)) + ') rotate(' + (-4 * (1 - k)) + 'deg)';
  else if (c.como === 'globo') s.transform = 'scale(' + (k <= 0 ? 0.4 : 0.4 + 0.6 * rebote(k)) + ')';
  else if (c.como === 'cae') s.transform = 'translateY(' + (-6 * (1 - suave(k))) + 'rem)';
  else s.transform = 'translateY(' + (5 * (1 - suave(k))) + 'rem)';
}
function renderFrame(t) {
  for (const e of ESC) {
    const x = t - e.ini;
    // La última sigue debajo hasta que el barrido del cierre la tapa entera
    const fin = e === ultima ? e.d + 1.2 : e.d;
    const ve = x >= 0 && x < fin;
    e.el.style.visibility = ve ? '' : 'hidden';
    if (!ve) continue;
    e.el.style.opacity = Math.min(lim(x / 0.3), e === ultima ? 1 : lim((e.d - x) / 0.3));
    e.el.style.transform = 'translateX(' + (4 * (1 - suave(lim(x / 0.45)))) + 'rem)';
    for (const c of e.cosas) aparecer(c, x);
    const r = e.el.querySelector('.rayas');
    if (r) r.style.transform = 'rotate(' + (t * 6) + 'deg)';
    const img = e.el.querySelector('.tapa figure img');
    if (img) img.style.transform = 'scale(' + (1 + 0.05 * lim(x / e.d)) + ')';
  }
  cierre.render(t);
}
window.renderFrame = renderFrame;
// La letra de cada caja se achica hasta que el texto cabe (una vez, ya con las letras cargadas)
function ajustar() {
  window.TEXTOS_AJUSTADOS = [];
  for (const e of ESC) {
    for (const c of e.el.querySelectorAll('.ajusta')) {
      const base = parseFloat(getComputedStyle(c).fontSize);
      let f = base;
      while ((c.scrollHeight > c.clientHeight + 6 || c.scrollWidth > c.clientWidth + 2) && f > base * 0.5) { f *= 0.96; c.style.fontSize = f + 'px'; }
      if (f < base) window.TEXTOS_AJUSTADOS.push(e.el.id + ': ' + Math.round(100 * f / base) + ' %');
    }
  }
}
Promise.all([document.fonts.ready, CierreBiPlot.listo(), ...[...document.images].map((i) => i.decode().catch(() => {}))]).then(() => {
  ajustar();
  renderFrame(+qs.get('t') || 0);
  window.READY = true;
  if (qs.has('render') || qs.has('t')) return;
  // Vista previa: se reproduce en un loop, a escala de la ventana
  const escala = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transformOrigin = '0 0'; stage.style.transform = 'scale(' + escala + ')';
  const t1 = performance.now();
  (function cuadro() { renderFrame(((performance.now() - t1) / 1000) % window.DURATION); requestAnimationFrame(cuadro); })();
});`;
// Cuánto dura cada escena (en segundos); el cierre BiPlot dura siempre 7,05
const VIDEO_D = { intro: 3, tapa: 4.5, nota: 6.5, dato: 6.5, fin: 4, cierre: 7.05 };
const duracionVideo = (ed) => VIDEO_D.intro + (ed.tapa ? VIDEO_D.tapa : 0) + lista(ed.portada).length * VIDEO_D.nota + (ed.dato ? VIDEO_D.dato : 0) + VIDEO_D.fin + VIDEO_D.cierre;
function videoHtml(ed) {
  const fecha = Mayus(fechaLarga(ed.fecha).replace(/ de \d{4}$/, ''));
  const portada = lista(ed.portada), sp = seccion('portada'), sd = seccion('dato');
  const dice = (id, etiqueta, t, entra) => (t ? `<div class="dice"><span class="cara" data-entra="${entra - 0.2}" data-como="sube"><img src="${esc(caraColor(id))}" alt=""><small>${esc(FIRMAS[id].nombre)}</small></span><p class="globo" data-entra="${entra}" data-como="globo" data-son="pop"><b>${esc(etiqueta)}.</b>${md(t)}</p></div>` : '');
  const esc_ = [];
  esc_.push(`<section class="esc intro" id="intro" data-d="${VIDEO_D.intro}"><div class="rayas"></div><div class="intro-c">
    <b data-entra="0.05" data-como="golpe">La Línea</b><span data-entra="0.7" data-como="sube">El diario de BiPlot</span><small data-entra="1.1" data-como="sube">${esc(vol(ed))} · ${esc(fecha)}</small></div></section>`);
  if (ed.tapa) {
    esc_.push(`<section class="esc tapa" id="tapa" data-d="${VIDEO_D.tapa}"><div class="lado"><p class="kicker" data-entra="0.2" data-como="sube">Esta semana</p>
    <ol class="ajusta">${portada.map((n, i) => `<li data-entra="${0.8 + i * 0.7}" data-como="sube" data-son="tick">${md(n.titular)}</li>`).join('')}</ol></div>
    <figure><img src="${esc(tapaSrc(ed, '/diario/'))}" alt=""></figure></section>`);
  }
  portada.forEach((n, i) => esc_.push(`<section class="esc nota" id="nota-${i + 1}" data-d="${VIDEO_D.nota}"><p class="kicker" data-entra="0.1" data-como="sube">Portada · ${i + 1} de ${portada.length}</p>
    <h2 class="titular ajusta" data-entra="0.3" data-como="sube">${md(n.titular)}</h2>
    ${dice('aby', sp.importa, n.importa, 2.1)}</section>`));
  if (ed.dato) {
    esc_.push(`<section class="esc nota dato" id="dato" data-d="${VIDEO_D.dato}"><p class="kicker" data-entra="0.1" data-como="sube">${esc(sd.kicker)} · ${esc(tituloPlano(sd.nombre))}</p>
    <div class="fila">${ed.dato.valor ? `<div class="cifra" data-entra="0.35" data-como="golpe" data-son="impact"><b>${esc(ed.dato.valor)}</b>${ed.dato.leyenda ? `<span>${esc(ed.dato.leyenda)}</span>` : ''}</div>` : ''}
    <h2 class="titular ajusta" data-entra="0.9" data-como="sube">${md(ed.dato.titular)}</h2></div>
    ${dice('celda', sd.importa, ed.dato.importa, 2.6)}</section>`);
  }
  const firmas = [...new Set(SECCIONES.filter((s) => (s.id === 'preguntas' ? lista(ed.preguntas).length : notasDe(ed, s.id).length)).map((s) => s.firma))].slice(0, 8);
  esc_.push(`<section class="esc fin" id="fin" data-d="${VIDEO_D.fin}"><p data-entra="0.1" data-como="sube">Léela completa</p>
    <strong data-entra="0.45" data-como="golpe" data-son="impact">biplot.cl/diario</strong>
    <div class="caras">${firmas.map((id, i) => `<img src="${esc(caraColor(id))}" alt="" data-entra="${1 + i * 0.12}" data-como="globo"${i % 2 ? '' : ' data-son="tick"'}>`).join('')}</div>
    <small data-entra="1.4" data-como="sube">${esc(PERIODICIDAD)} · Gratis</small></section>`);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="robots" content="noindex">
<title>${esc(`La Línea, ${vol(ed)}: el video de la semana`)}</title>
<link href="${FUENTES_WEB}" rel="stylesheet">
<style>${VIDEO_CSS}
</style>
</head>
<body>
<div id="stage">
${esc_.join('\n')}
</div>
<script src="/nucleo/04-marca/00-motor/cierre-biplot.js"></script>
<script>${VIDEO_JS}</script>
</body>
</html>
`;
}

// ---------- La última edición, para el resto del sitio ----------
// La portada de biplot.cl, el quiosco de la oficina y el cintillo de BiPlot.TV leen este archivo y no el JSON de cada
// edición: así todos muestran lo mismo y sólo lo publicado (viaja en el mismo PR que la edición). Las de prueba se ven
// sólo en la hemeroteca: sin una edición de verdad, «edicion» va en null y cada lugar muestra cuándo sale la próxima.
const plano = (t) => String(t ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
const minutosVideo = (s) => { const n = Math.floor(Math.floor(s * 30) / 30); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
const sumarDias = (iso, n) => new Date(Date.parse(iso + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
function ultimaJson(ediciones) {
  const ed = ediciones.filter((e) => !e.prueba).at(-1);
  const edicion = ed ? {
    numero: ed.numero, fecha: ed.fecha, fechaLarga: fechaLarga(ed.fecha), cubre: ed.cubre || null,
    url: `/diario/${ed.fecha}/`,
    tapa: ed.tapa ? { src: /^https:\/\//.test(ed.tapa.src) ? ed.tapa.src : `/diario/${ed.tapa.src}`, alt: ed.tapa.alt || '' } : null,
    titular: plano(lista(ed.portada)[0].titular),
    titulares: lista(ed.portada).map((n) => plano(n.titular)),
    // La nota de cada integrante de la oficina en esta edición: la primera de su sección, con su cifra si la trae (en El
    // dato, la de la sección) y el ancla de la sección en su página (la portada no tiene: se abre arriba)
    // El video de la semana (video.mjs), si la edición lo trae: el canal de La Línea en BiPlot.TV
    video: ['h.mp4', 'v.mp4', 'h.jpg'].every((f) => fs.existsSync(path.join(raiz, 'diario', ed.fecha, 'video', f)))
      ? { h: `/diario/${ed.fecha}/video/h.mp4`, v: `/diario/${ed.fecha}/video/v.mp4`, poster: `/diario/${ed.fecha}/video/h.jpg`, duracion: minutosVideo(duracionVideo(ed)) } : null,
    notas: SECCIONES.filter((s) => notasDe(ed, s.id).length).map((s) => {
      const n = notasDe(ed, s.id)[0], c = s.id === 'dato' ? ed.dato : n.cifra;
      return { id: s.id, seccion: s.nombre ? s.nombre.join(' ') : s.kicker, firma: s.firma, nombre: FIRMAS[s.firma].nombre,
        titular: plano(n.titular || n.afirmacion || n.empresa), cifra: c && c.valor ? { valor: plano(c.valor), leyenda: plano(c.leyenda || '') } : null };
    }),
  } : null;
  return JSON.stringify({ nota: 'Lo arma diario/_herramientas/armar.mjs: no se edita a mano.', edicion, proxima: sumarDias(ediciones.at(-1).fecha, 7) }, null, 2) + '\n';
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
escribir('diario/ultima.json', ultimaJson(ediciones));
escribir(`diario/_herramientas/salida/${ed.fecha}-correo.html`, edicionCorreo(ed));
escribir(`diario/_herramientas/salida/${ed.fecha}-redes.html`, redesHtml(ed));
escribir(`diario/_herramientas/salida/${ed.fecha}-video.html`, videoHtml(ed));
