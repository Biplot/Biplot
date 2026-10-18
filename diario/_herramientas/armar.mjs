// Arma una edición de La Línea, el diario de BiPlot, desde su contenido (diario/_herramientas/ediciones/<fecha>.json):
//   diario/<fecha>/index.html                        la edición en la web (biplot.cl/diario/<fecha>/), con diario/diario.css
//   diario/index.html                                la hemeroteca, con todas las ediciones (la más nueva arriba)
//   diario/_herramientas/salida/<fecha>-correo.html  el correo: tablas de 600 px y estilos en línea (no se sube)
// Uso, desde la raíz del repo: node diario/_herramientas/armar.mjs [AAAA-MM-DD]   (sin fecha, la última)
// El orden de las secciones, quién firma cada una y sus textos fijos están aquí (SECCIONES); el JSON trae sólo lo de esa
// semana. Cómo se escribe ese JSON está en diario/README.md.
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
  { id: 'marcador', kicker: 'Deporte', nombre: ['El', 'marcador'], firma: 'felipe', importa: 'La jugada', tinta: true },
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
  return [...vistas.values()];
}
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

// ---------- La web ----------
const ISOTIPO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0E2A47" stroke="rgba(245,242,236,.25)"/><path d="M9 8 V24 H25" fill="none" stroke="#3f6da0" stroke-width="1.7" stroke-linecap="round"/><polyline points="10.5,20.5 15,16.5 19,18 23,11" fill="none" stroke="#17C3B2" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/><circle cx="10.5" cy="20.5" r="1.8" fill="#17C3B2"/><circle cx="15" cy="16.5" r="1.8" fill="#17C3B2"/><circle cx="19" cy="18" r="1.8" fill="#17C3B2"/><circle cx="23" cy="11" r="2.3" fill="#FF6B4A"/></svg>';
// La línea de la cabecera: sube como la del isotipo, pero aquí todavía no llega al punto coral (ése está en el pie)
const PUNTOS = [[8, 38], [190, 30], [340, 34], [530, 22], [705, 27], [880, 15], [1108, 9]];
const LINEA = `<svg class="linea" viewBox="0 0 1120 46" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><polyline points="${PUNTOS.map((p) => p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>${PUNTOS.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === PUNTOS.length - 1 ? 6 : 4.2}" fill="currentColor"/>`).join('')}</svg>`;
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230E2A47'/%3E%3Cpath d='M9 8 V24 H25' stroke='%233f6da0' stroke-width='1.7' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='11.5' cy='20.5' r='2.2' fill='%2317C3B2'/%3E%3Ccircle cx='16' cy='17' r='2.2' fill='%2317C3B2'/%3E%3Ccircle cx='23' cy='11' r='2.8' fill='%23FF6B4A'/%3E%3C/svg%3E";

function cabezaHtml({ titulo: t, descripcion, url, base, noindex }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(descripcion)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#081B30">
<meta property="og:type" content="article">
<meta property="og:site_name" content="BiPlot">
<meta property="og:locale" content="es_CL">
<meta property="og:title" content="${esc(t)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITIO}/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Mulish:wght@400;600;700;800&family=Space+Grotesk:wght@700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}diario.css">
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<div class="barra"><div class="envoltura">
  <a href="${base}../" aria-label="BiPlot, inicio">${ISOTIPO}<span class="marca">Bi<span>Plot</span></span></a>
  <nav aria-label="Diario"><a href="${base}">Hemeroteca</a><a href="${base}../oficina/">BiPlot HQ</a></nav>
</div></div>
`;
}

function firmaWeb(id, base, conFrase = true) {
  const f = FIRMAS[id];
  return `<div class="firma"><img src="${base}firmas/${id}.png" alt="" width="48" height="48" loading="lazy"><span><b>${esc(f.nombre)}<small>${esc(f.placa)}</small></b>${conFrase ? `<i>«${esc(f.frase)}»</i>` : `<i>${esc(f.rol)}</i>`}</span></div>`;
}
function fuentesWeb(fuentes) {
  const fs_ = lista(fuentes);
  if (!fs_.length) return '';
  return `<p class="fuente">${fs_.length > 1 ? 'Fuentes' : 'Fuente'}: ${fs_.map((f) => `<a href="${esc(f.url)}" rel="noopener">${esc(f.medio)}</a>`).join(' · ')}</p>`;
}
function notaWeb(n, sec, clase = '') {
  const cifra = n.cifra ? `<p class="cifra">${esc(n.cifra.valor)}${n.cifra.leyenda ? `<small>${esc(n.cifra.leyenda)}</small>` : ''}</p>` : '';
  return `<article class="nota ${clase}">
      ${cifra}<h3>${md(n.titular)}</h3>
      ${lista(n.bajada).map((p) => `<p class="bajada">${md(p)}</p>`).join('\n      ')}
      ${n.importa ? `<p class="importa"><b>${esc(sec.importa || 'Por qué importa')}.</b> ${md(n.importa)}</p>` : ''}
      ${fuentesWeb(n.fuentes)}
    </article>`;
}
function cabSeccion(sec, base) {
  return `<header class="sec-cab"><div><span class="kicker">${esc(sec.kicker)}</span><h2>${titulo(sec.nombre)}</h2></div>${firmaWeb(sec.firma, base)}</header>`;
}
function seccionWeb(ed, sec, base) {
  const v = ed[sec.id];
  if (!v || (Array.isArray(v) && !v.length)) return '';
  if (sec.id === 'portada') {
    const [principal, ...lado] = lista(v);
    return `<section class="portada envoltura" aria-label="Portada">
  <header class="sec-cab"><div><span class="kicker">${esc(sec.kicker)} · ${esc(ed.cubre || '')}</span></div>${firmaWeb('aby', base)}</header>
  <div class="notas">
    ${notaWeb(principal, sec, 'principal')}
    ${lado.length ? `<div class="lado">${lado.map((n) => notaWeb(n, sec)).join('\n')}</div>` : ''}
  </div>
</section>`;
  }
  let cuerpo;
  if (sec.id === 'dato') {
    cuerpo = `<div class="el-dato"><p class="grande">${esc(v.valor)}<small>${esc(v.leyenda)}</small></p>${notaWeb({ ...v, cifra: null }, sec)}</div>`;
  } else if (sec.id === 'caso') {
    cuerpo = `<article class="nota caso"><h3>${md(v.titular)}</h3>${lista(v.bajada).map((p) => `<p class="bajada">${md(p)}</p>`).join('')}
    <ol class="caso-pasos"><li><b>Lo que pasaba</b>${md(v.antes)}</li><li><b>Lo que cambiaron</b>${md(v.cambio)}</li><li><b>Lo que pasó</b>${md(v.resultado)}</li></ol>
    ${fuentesWeb(v.fuentes)}</article>`;
  } else if (sec.id === 'mito') {
    cuerpo = `<div class="notas n-${Math.min(lista(v).length, 3)}">${lista(v).map((n) => {
      const [txt, cl] = VEREDICTOS[n.veredicto] || VEREDICTOS['a medias'];
      return `<article class="nota mito"><span class="timbre ${cl}">${txt}</span><p class="afirmacion">«${md(n.afirmacion)}»</p>
      ${lista(n.bajada).map((p) => `<p class="bajada">${md(p)}</p>`).join('')}${fuentesWeb(n.fuentes)}</article>`;
    }).join('\n')}</div>`;
  } else if (sec.id === 'preguntas') {
    cuerpo = `<ol class="preguntas">${lista(v).map((p) => `<li><p>${md(p.pregunta)}</p><details><summary>Ver respuesta</summary><p>${md(p.respuesta)}</p></details></li>`).join('')}</ol>`;
  } else if (sec.id === 'marcador') {
    const notas = lista(v.notas);
    cuerpo = `<div class="notas n-${Math.min(notas.length, 3)}">${notas.map((n) => notaWeb(n, sec)).join('\n')}</div>
    ${lista(v.agenda).length ? `<div class="agenda"><span class="kicker">Lo que viene</span><ul>${lista(v.agenda).map((a) => `<li><b>${esc(a.fecha)}</b><span>${md(a.texto)}</span></li>`).join('')}</ul></div>` : ''}`;
  } else {
    const notas = lista(v);
    cuerpo = `<div class="notas n-${Math.min(notas.length, 3)}">${notas.map((n) => notaWeb(n, sec)).join('\n')}</div>`;
  }
  const html = `<section class="seccion envoltura" id="${sec.id}" aria-label="${esc(tituloPlano(sec.nombre))}">
  ${cabSeccion(sec, base)}
  ${cuerpo}
</section>`;
  return sec.tinta ? `<div class="tinta">${html}</div>` : html;
}
function pieWeb(ed, base) {
  const fuentes = ed ? todasLasFuentes(ed) : [];
  return `<footer class="pie">
  <div class="envoltura">
    <div class="punto">
      <div><span class="kicker">BiPlot · Automatización a la medida</span><h2>Tu proceso es el <em>próximo punto</em></h2>
      <p>Si algo de esta edición se parece a lo que pasa en tu empresa, conversemos. Una sesión corta, sin costo.</p></div>
      <a class="btn-cta" href="${AGENDAR}" rel="noopener">Agenda tu diagnóstico</a>
    </div>
    <div class="pie-cols">
      <div><h3>La Línea</h3><ul>
        <li>El diario de BiPlot. ${PERIODICIDAD}.</li>
        <li>${ed ? hechura(ed) : 'Hecho con ayuda de IA y revisado por personas'}.</li>
        <li><a href="${base}">La hemeroteca</a> · <a href="${base}../">biplot.cl</a> · <a href="${base}../oficina/">BiPlot HQ</a> · <a href="${base}../oficina/tv/">BiPlot.TV</a></li>
      </ul></div>
      ${ed ? `<div><h3>Las fuentes de esta edición</h3><ul class="fuentes">${fuentes.map((f) => `<li><a href="${esc(f.url)}" rel="noopener">${esc(f.medio)}</a>${f.titulo ? ` · ${esc(f.titulo)}` : ''}</li>`).join('')}</ul></div>
      <div><h3>Fe de erratas</h3><ul>${lista(ed.erratas).length ? lista(ed.erratas).map((e) => `<li>${md(e)}</li>`).join('') : '<li>Sin correcciones en esta edición. Si ves un error, respóndenos y lo corregimos aquí.</li>'}</ul></div>` : ''}
    </div>
    <p class="legal">© ${new Date().getUTCFullYear()} BiPlot. Los resúmenes son nuestros; las notas completas son de cada medio, y cada una lleva su enlace.</p>
  </div>
</footer>
</body>
</html>
`;
}
function edicionWeb(ed) {
  const base = '../';
  const fecha = fechaLarga(ed.fecha);
  const ind = lista(ed.indicadores);
  let html = cabezaHtml({ titulo: `La Línea ${numero(ed)} · ${fecha}`, descripcion: ed.previa || lista(ed.portada)[0].titular,
    url: `${SITIO}/diario/${ed.fecha}/`, base, noindex: ed.prueba });
  html += `<header class="cabecera envoltura">
  <p class="cab-fecha"><span>Santiago, ${esc(fecha)}</span><span>${esc(numero(ed))}${ed.prueba ? ' · <span class="prueba">Edición de prueba</span>' : ''}</span></p>
  <h1 class="cab-nombre">La <em>Línea</em></h1>
  <p class="cab-lema"><b>El diario de BiPlot</b>Lo que pasó esta semana, en cinco minutos</p>
  ${LINEA}
  ${ind.length ? `<dl class="franja" style="--n:${ind.length}">${ind.map((i) => `<div><dt>${esc(i.nombre)}</dt><dd>${esc(i.valor)}</dd><small>${esc(i.nota || '')}${i.fuente ? ` · <a href="${esc(i.fuente.url)}" rel="noopener">${esc(i.fuente.medio)}</a>` : ''}</small></div>`).join('')}</dl>` : ''}
</header>
<main id="contenido">
${lista(ed.redaccion).length ? `<aside class="envoltura" aria-label="Nota de la redacción"><div class="redaccion"><img src="${base}firmas/aby.png" alt="" width="56" height="56"><div>${lista(ed.redaccion).map((p) => `<p>${md(p)}</p>`).join('')}<p class="firma-chica">Aby, por la redacción</p></div></div></aside>` : ''}
${SECCIONES.map((s) => seccionWeb(ed, s, base)).filter(Boolean).join('\n')}
${ed.aparte ? `<aside class="envoltura" aria-label="El aparte"><div class="aparte"><img src="${base}../assets/rumbo/icono.png" alt="" width="64" height="64"><div><span class="kicker">Psst… ¿y tu día?</span><h2>${md(ed.aparte.titulo)}</h2><p>${md(ed.aparte.texto)}</p><a class="ir" href="${esc(ed.aparte.enlace || RUMBO)}" rel="noopener">Conoce Rumbo, la app de BiPlot para ordenar tu día →</a></div></div></aside>` : ''}
</main>
`;
  return html + pieWeb(ed, base);
}
function hemerotecaWeb(ediciones) {
  const base = './';
  const publicadas = ediciones.filter((e) => !e.prueba);
  let html = cabezaHtml({ titulo: 'La Línea: la hemeroteca del diario de BiPlot', descripcion: 'Todas las ediciones de La Línea, el diario de BiPlot: IA, gestión, casos de éxito, economía y deporte, con sus fuentes.',
    url: `${SITIO}/diario/`, base, noindex: !publicadas.length });
  html += `<header class="cabecera envoltura">
  <p class="cab-fecha"><span>Santiago</span><span>La hemeroteca</span></p>
  <h1 class="cab-nombre">La <em>Línea</em></h1>
  <p class="cab-lema"><b>El diario de BiPlot</b>Todas las ediciones, la más nueva arriba</p>
  ${LINEA}
</header>
<main id="contenido" class="envoltura seccion">
  <ol class="hemeroteca">
${ediciones.map((e) => `    <li><a href="${e.fecha}/"><span class="num">${esc(numero(e))}</span><span class="fecha">${esc(fechaLarga(e.fecha))}${e.prueba ? '<span class="etiqueta">Prueba</span>' : ''}</span><span class="tit">${md(lista(e.portada)[0].titular)}</span></a></li>`).join('\n')}
  </ol>
</main>
`;
  return html + pieWeb(null, base);
}

// ---------- El correo ----------
// Tablas y estilos en línea: Gmail y Outlook no cargan Cormorant ni Mulish, así que van Georgia y Arial de respaldo.
const C = {
  serif: "'Cormorant Garamond',Georgia,'Times New Roman',serif", sans: "Mulish,Arial,Helvetica,sans-serif", mono: "'JetBrains Mono',Consolas,'Courier New',monospace",
  papel: '#F5F2EC', arena: '#ECE6DA', tinta: '#0E2A47', texto: '#0F1B28', gris: '#56606A', acento: '#0A7A6F', cian: '#17C3B2', cta: '#FF6B4A', ctaTexto: '#2b0f08',
  filete: '#C9C4BA', crema: '#F5F2EC',
};
const kickerC = (t, color = C.acento) => `<div style="font:700 11px/1.3 ${C.sans};letter-spacing:3px;text-transform:uppercase;color:${color};">${esc(t)}</div>`;
function firmaC(id, oscuro) {
  const f = FIRMAS[id];
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="44" valign="middle" style="padding-right:10px;"><img src="${SITIO}/diario/firmas/${id}.png" width="44" height="44" alt="" style="display:block;border:0;"></td>
<td valign="middle" style="font:700 13px/1.3 ${C.sans};color:${oscuro ? C.crema : C.texto};">${esc(f.nombre)} <span style="font-size:10px;letter-spacing:2px;color:${oscuro ? C.cian : C.acento};">${esc(f.placa)}</span><br>
<span style="font:italic 15px/1.3 ${C.serif};color:${oscuro ? '#B9C2CC' : C.gris};">«${esc(f.frase)}»</span></td></tr></table>`;
}
function fuentesC(fuentes, oscuro) {
  const fs_ = lista(fuentes);
  if (!fs_.length) return '';
  const color = oscuro ? C.cian : C.acento;
  return `<div style="margin-top:10px;font:700 11px/1.5 ${C.sans};letter-spacing:1px;text-transform:uppercase;color:${oscuro ? '#9AA6B2' : C.gris};">${fs_.length > 1 ? 'Fuentes' : 'Fuente'}: ${fs_.map((f) => `<a href="${esc(f.url)}" style="color:${color};text-decoration:underline;">${esc(f.medio)}</a>`).join(' · ')}</div>`;
}
function notaC(n, sec, { grande = false, oscuro = false } = {}) {
  const tc = oscuro ? C.crema : C.texto, gc = oscuro ? '#B9C2CC' : C.gris;
  return `<tr><td style="padding:0 0 22px 0;">
${n.cifra ? `<div style="font:600 30px/1.1 ${oscuro ? C.mono : C.serif};color:${oscuro ? C.cian : C.acento};font-variant-numeric:lining-nums;">${esc(n.cifra.valor)}</div>${n.cifra.leyenda ? `<div style="font:700 10px/1.4 ${C.sans};letter-spacing:2px;text-transform:uppercase;color:${gc};margin:2px 0 8px;">${esc(n.cifra.leyenda)}</div>` : ''}` : ''}
<div style="font:500 ${grande ? '34px/1.05' : '23px/1.15'} ${C.serif};color:${tc};font-variant-numeric:lining-nums;">${md(n.titular)}</div>
${lista(n.bajada).map((p) => `<div style="margin-top:8px;font:400 ${grande ? `18px/1.45 ${C.serif}` : `15px/1.55 ${C.sans}`};color:${tc};">${md(p)}</div>`).join('\n')}
${n.importa ? `<div style="margin-top:10px;padding-left:10px;border-left:2px solid ${C.cian};font:400 14px/1.5 ${C.sans};color:${gc};"><b style="color:${tc};">${esc(sec.importa || 'Por qué importa')}.</b> ${md(n.importa)}</div>` : ''}
${fuentesC(n.fuentes, oscuro)}
</td></tr>`;
}
function cabSeccionC(sec, oscuro) {
  return `<tr><td style="padding:34px 0 18px 0;border-top:1px solid ${oscuro ? '#3A5068' : C.texto};">
<div style="padding-top:12px;">${kickerC(sec.kicker, oscuro ? C.cian : C.acento)}</div>
${sec.nombre ? `<div style="font:500 38px/1.05 ${C.serif};color:${oscuro ? C.crema : C.texto};margin:6px 0 14px;">${esc(sec.nombre[0])} <i>${esc(sec.nombre[1])}</i></div>` : '<div style="height:10px;line-height:10px;">&nbsp;</div>'}
${firmaC(sec.firma, oscuro)}
</td></tr>`;
}
function seccionC(ed, sec) {
  const v = ed[sec.id];
  if (!v || (Array.isArray(v) && !v.length)) return '';
  const oscuro = !!sec.tinta;
  let filas = '';
  if (sec.id === 'portada') {
    filas = lista(v).map((n, i) => notaC(n, sec, { grande: i === 0 })).join('\n');
    return `${cabSeccionC({ ...sec, kicker: `${sec.kicker} · ${ed.cubre || ''}` })}${filas}`;
  }
  if (sec.id === 'dato') {
    filas = `<tr><td style="padding:0 0 6px 0;font:500 64px/1 ${C.serif};color:${C.acento};font-variant-numeric:lining-nums;">${esc(v.valor)}</td></tr>
<tr><td style="padding:0 0 14px 0;font:700 11px/1.4 ${C.sans};letter-spacing:3px;text-transform:uppercase;color:${C.gris};">${esc(v.leyenda)}</td></tr>${notaC({ ...v, cifra: null }, sec)}`;
  } else if (sec.id === 'caso') {
    const paso = (t, x) => `<tr><td style="padding:10px 0 0 0;border-top:1px solid ${C.filete};">${kickerC(t)}<div style="margin-top:4px;font:400 15px/1.55 ${C.sans};color:${C.texto};">${md(x)}</div></td></tr>`;
    filas = `<tr><td style="padding:0 0 22px 0;"><div style="font:500 28px/1.1 ${C.serif};color:${C.texto};">${md(v.titular)}</div>
${lista(v.bajada).map((p) => `<div style="margin-top:8px;font:400 15px/1.55 ${C.sans};color:${C.texto};">${md(p)}</div>`).join('')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">${paso('Lo que pasaba', v.antes)}${paso('Lo que cambiaron', v.cambio)}${paso('Lo que pasó', v.resultado)}</table>
${fuentesC(v.fuentes)}</td></tr>`;
  } else if (sec.id === 'mito') {
    filas = lista(v).map((n) => {
      const [txt] = VEREDICTOS[n.veredicto] || VEREDICTOS['a medias'];
      const color = n.veredicto === 'dato' ? C.acento : n.veredicto === 'mito' ? C.texto : C.gris;
      return `<tr><td style="padding:0 0 22px 0;"><span style="display:inline-block;border:2px solid ${color};border-radius:4px;padding:3px 9px;font:800 12px/1.2 ${C.sans};letter-spacing:3px;text-transform:uppercase;color:${color};">${txt}</span>
<div style="margin-top:10px;font:italic 500 22px/1.2 ${C.serif};color:${C.texto};">«${md(n.afirmacion)}»</div>
${lista(n.bajada).map((p) => `<div style="margin-top:8px;font:400 15px/1.55 ${C.sans};color:${C.texto};">${md(p)}</div>`).join('')}${fuentesC(n.fuentes)}</td></tr>`;
    }).join('\n');
  } else if (sec.id === 'preguntas') {
    filas = lista(v).map((p, i) => `<tr><td style="padding:0 0 16px 0;"><span style="font:600 13px/1 ${C.mono};color:${C.acento};">0${i + 1}</span>
<div style="margin-top:4px;font:500 20px/1.25 ${C.serif};color:${C.texto};">${md(p.pregunta)}</div></td></tr>`).join('\n') +
      `<tr><td style="padding:4px 0 0 0;font:400 13px/1.5 ${C.sans};color:${C.gris};">Las respuestas, al pie.</td></tr>`;
  } else if (sec.id === 'marcador') {
    filas = lista(v.notas).map((n) => notaC(n, sec, { oscuro })).join('\n');
    if (lista(v.agenda).length) filas += `<tr><td style="padding:6px 0 0 0;border-top:1px solid #3A5068;"><div style="padding-top:12px;">${kickerC('Lo que viene', C.cian)}</div>
${lista(v.agenda).map((a) => `<div style="margin-top:8px;font:400 14px/1.5 ${C.sans};color:${C.crema};"><span style="font:600 13px ${C.mono};color:${C.cian};">${esc(a.fecha)}</span> · ${md(a.texto)}</div>`).join('')}</td></tr>`;
  } else {
    filas = lista(v).map((n) => notaC(n, sec)).join('\n');
  }
  const cuerpo = `${cabSeccionC(sec, oscuro)}${filas}`;
  if (!oscuro) return cuerpo;
  return `<tr><td style="padding:8px 24px 24px 24px;background:${C.tinta};" bgcolor="${C.tinta}" class="pad">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cuerpo}</table></td></tr>`;
}
function edicionCorreo(ed) {
  const fecha = fechaLarga(ed.fecha);
  const url = `${SITIO}/diario/${ed.fecha}/`;
  const ind = lista(ed.indicadores);
  const bloque = (filas) => `<tr><td style="padding:0 24px;" class="pad"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${filas}</table></td></tr>`;
  // Las secciones claras van dentro de un bloque con márgenes; la de tinta, de borde a borde
  let cuerpo = '', claras = '';
  for (const s of SECCIONES) {
    const html = seccionC(ed, s);
    if (!html) continue;
    if (s.tinta) { if (claras) cuerpo += bloque(claras); claras = ''; cuerpo += html; } else claras += html;
  }
  if (claras) cuerpo += bloque(claras);
  const fuentes = todasLasFuentes(ed);
  const celdasInd = ind.map((i) => `<td class="ind" width="${Math.floor(100 / ind.length)}%" valign="top" style="padding:12px 8px 12px 0;">
<div style="font:700 10px/1.2 ${C.sans};letter-spacing:2px;text-transform:uppercase;color:${C.acento};">${esc(i.nombre)}</div>
<div style="font:500 22px/1.15 ${C.serif};color:${C.texto};margin-top:4px;font-variant-numeric:lining-nums;">${esc(i.valor)}</div>
<div style="font:600 11px/1.3 ${C.sans};color:${C.gris};margin-top:3px;">${esc(i.nota || '')}</div></td>`).join('');
  return `<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>La Línea ${esc(numero(ed))} · ${esc(fecha)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Mulish:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:0;background:${C.papel};}
  a{color:${C.acento};}
  @media (max-width:620px){
    .contenedor{width:100% !important;}
    .pad{padding-left:16px !important;padding-right:16px !important;}
    .ind{display:inline-block !important;width:48% !important;}
    .nombre{font-size:64px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.papel};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.papel};">${esc(ed.previa || '')}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.papel}" style="background:${C.papel};">
<tr><td align="center" style="padding:16px 0 32px 0;">
<table role="presentation" class="contenedor" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
<tr><td class="pad" style="padding:0 24px 10px 24px;text-align:right;font:600 12px/1.4 ${C.sans};color:${C.gris};"><a href="${url}" style="color:${C.gris};">Ver en el navegador</a></td></tr>
<tr><td class="pad" style="padding:0 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="border-top:3px double ${C.texto};border-bottom:1px solid ${C.texto};padding:7px 0;font:700 10px/1.3 ${C.sans};letter-spacing:2px;text-transform:uppercase;color:${C.gris};">
    Santiago, ${esc(fecha)} &nbsp;·&nbsp; ${esc(numero(ed))}${ed.prueba ? ` · <span style="color:${C.acento};">Edición de prueba</span>` : ''}</td></tr>
  <tr><td align="center" class="nombre" style="padding:18px 0 4px 0;font:500 80px/0.95 ${C.serif};color:${C.texto};letter-spacing:-1px;">La <i>Línea</i></td></tr>
  <tr><td align="center" style="padding:0 0 4px 0;">${kickerC('El diario de BiPlot')}</td></tr>
  <tr><td align="center" style="padding:0 0 16px 0;font:italic 18px/1.3 ${C.serif};color:${C.gris};">Lo que pasó esta semana, en cinco minutos</td></tr>
  <tr><td style="border-top:2px solid ${C.cian};font-size:0;line-height:0;">&nbsp;</td></tr>
  ${ind.length ? `<tr><td style="border-bottom:3px double ${C.texto};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${celdasInd}</tr></table></td></tr>` : ''}
  ${lista(ed.redaccion).length ? `<tr><td style="padding:22px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.arena}" style="background:${C.arena};border-radius:12px;"><tr>
    <td width="50" valign="top" style="padding:16px 0 16px 16px;"><img src="${SITIO}/diario/firmas/aby.png" width="48" height="48" alt="" style="display:block;border:0;"></td>
    <td valign="top" style="padding:16px 16px 16px 12px;">${lista(ed.redaccion).map((p) => `<div style="font:400 18px/1.4 ${C.serif};color:${C.texto};margin-bottom:8px;">${md(p)}</div>`).join('')}
    ${kickerC('Aby, por la redacción')}</td></tr></table></td></tr>` : ''}
  </table>
</td></tr>
${cuerpo}
${ed.aparte ? `<tr><td class="pad" style="padding:12px 24px 0 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.arena}" style="background:${C.arena};border-radius:12px;"><tr>
  <td width="56" valign="top" style="padding:18px 0 18px 18px;"><img src="${SITIO}/assets/rumbo/icono.png" width="52" height="52" alt="" style="display:block;border:0;border-radius:12px;"></td>
  <td valign="top" style="padding:18px 18px 18px 14px;">${kickerC('Psst… ¿y tu día?')}
  <div style="font:500 24px/1.15 ${C.serif};color:${C.texto};margin-top:4px;">${md(ed.aparte.titulo)}</div>
  <div style="font:400 15px/1.55 ${C.sans};color:${C.texto};margin-top:6px;">${md(ed.aparte.texto)}</div>
  <div style="margin-top:8px;font:700 13px/1.4 ${C.sans};"><a href="${esc(ed.aparte.enlace || RUMBO)}" style="color:${C.acento};">Conoce Rumbo, la app de BiPlot para ordenar tu día →</a></div></td></tr></table></td></tr>` : ''}
<tr><td style="padding:28px 0 0 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#081B30" style="background:#081B30;">
  <tr><td class="pad" style="padding:30px 24px 26px 24px;">
    ${kickerC('BiPlot · Automatización a la medida', C.cian)}
    <div style="font:500 32px/1.1 ${C.serif};color:${C.crema};margin:6px 0 10px;">Tu proceso es el <i style="color:${C.cian};">próximo punto</i></div>
    <div style="font:400 15px/1.55 ${C.sans};color:#C9D1D9;">Si algo de esta edición se parece a lo que pasa en tu empresa, conversemos. Una sesión corta, sin costo.</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;"><tr><td bgcolor="${C.cta}" style="background:${C.cta};border-radius:999px;">
      <a href="${AGENDAR}" style="display:inline-block;padding:14px 26px;font:800 15px/1 ${C.sans};color:${C.ctaTexto};text-decoration:none;">● &nbsp;Agenda tu diagnóstico</a></td></tr></table>
  </td></tr>
  ${lista(ed.preguntas).length ? `<tr><td class="pad" style="padding:0 24px 18px 24px;border-top:1px solid #2A3F55;"><div style="padding-top:16px;">${kickerC('Las respuestas de Plotty', C.cian)}</div>
    ${lista(ed.preguntas).map((p, i) => `<div style="margin-top:8px;font:400 14px/1.5 ${C.sans};color:#C9D1D9;"><span style="font:600 12px ${C.mono};color:${C.cian};">0${i + 1}</span> · ${md(p.respuesta)}</div>`).join('')}</td></tr>` : ''}
  <tr><td class="pad" style="padding:0 24px 18px 24px;border-top:1px solid #2A3F55;"><div style="padding-top:16px;">${kickerC('Las fuentes de esta edición', C.cian)}</div>
    <div style="margin-top:8px;font:400 13px/1.7 ${C.sans};color:#C9D1D9;">${fuentes.map((f) => `<a href="${esc(f.url)}" style="color:${C.crema};">${esc(f.medio)}</a>`).join(' · ')}</div></td></tr>
  <tr><td class="pad" style="padding:0 24px 18px 24px;border-top:1px solid #2A3F55;"><div style="padding-top:16px;">${kickerC('Fe de erratas', C.cian)}</div>
    <div style="margin-top:8px;font:400 13px/1.6 ${C.sans};color:#C9D1D9;">${lista(ed.erratas).length ? lista(ed.erratas).map(md).join('<br>') : 'Sin correcciones en esta edición. Si ves un error, responde este correo y lo corregimos aquí.'}</div></td></tr>
  <tr><td class="pad" style="padding:16px 24px 26px 24px;border-top:1px solid #2A3F55;font:400 12px/1.6 ${C.sans};color:#8C99A6;">
    La Línea es el diario de BiPlot. ${PERIODICIDAD}. ${hechura(ed)}.<br>
    Los resúmenes son nuestros; las notas completas son de cada medio, y cada una lleva su enlace.<br>
    <a href="${url}" style="color:#C9D1D9;">Ver en el navegador</a> · <a href="${SITIO}/diario/" style="color:#C9D1D9;">La hemeroteca</a> · <a href="${SITIO}/" style="color:#C9D1D9;">biplot.cl</a> · <a href="${BAJA}" style="color:#C9D1D9;">Darte de baja</a>
  </td></tr>
  </table>
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
