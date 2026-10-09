// Las páginas de la bóveda, sin nada del servidor (corre igual en Node y en el navegador): arma el catálogo de
// páginas (nombre, carpeta, alias y resumen), las encuentra por nombre o alias, busca en todas, y arma los cambios
// que Atlas propone (agregar en una sección o reemplazar un texto), con su línea de log.md.
import { hoyChile } from './fecha.js';

export const WIKI = 'Biplot/';
export const LOG = 'Biplot/log.md';
export const NO_EDITABLES = new Set([LOG, 'Biplot/index.md']);   // el log lo escribe Atlas solo; el índice lo genera la ingesta

export const normalizar = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const publico = (mensaje, estado = 400) => Object.assign(new Error(mensaje), { publico: true, estado });
const nombreDeArchivo = (ruta) => ruta.split('/').pop().replace(/\.md$/i, '');

// Lo que es del wiki: las páginas de Biplot/ (sin raw/ ni carpetas ocultas) y el CLAUDE.md de la raíz
export const esDelWiki = (ruta) => ruta === 'CLAUDE.md' || (ruta.startsWith(WIKI) && ruta.endsWith('.md') && !ruta.startsWith(`${WIKI}raw/`) && !ruta.includes('/.'));

// Las páginas: nombre (el del archivo), carpeta, alias y la línea «> resumen» de cada una
export function armar(archivos, sha) {
  const paginas = [], claves = new Map();
  for (const [ruta, texto] of archivos) {
    if (!ruta.startsWith(WIKI)) continue;
    const nombre = nombreDeArchivo(ruta);
    const partes = ruta.slice(WIKI.length).split('/');
    const fm = frontmatter(texto);
    const pagina = {
      nombre, ruta, carpeta: partes.length > 1 ? partes[0] : '',
      alias: listaYaml(fm.aliases), tipo: fm.tipo ?? '',
      resumen: (texto.match(/^>\s+(?!\[!)(.+)$/m)?.[1] ?? '').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1').slice(0, 240)
    };
    paginas.push(pagina);
  }
  // Primero los nombres, después los alias (un alias nunca tapa un nombre)
  for (const p of paginas) claves.set(normalizar(p.nombre), p);
  for (const p of paginas) for (const a of p.alias) if (!claves.has(normalizar(a))) claves.set(normalizar(a), p);
  return { sha, revisado: Date.now(), archivos, paginas, claves };
}

export function frontmatter(texto) {
  const m = texto.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const campos = {};
  let ultimo = null;
  for (const linea of m[1].split('\n')) {
    const kv = linea.match(/^([A-Za-z_áéíóú]+):\s*(.*)$/);
    if (kv) { ultimo = kv[1]; campos[ultimo] = kv[2]; }
    else if (ultimo && /^\s+-\s+/.test(linea)) campos[ultimo] = `${campos[ultimo] ? `${campos[ultimo]},` : ''}${linea.replace(/^\s+-\s+/, '')}`;
  }
  return campos;
}
function listaYaml(valor) {
  if (!valor) return [];
  return valor.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

// ── Leer y buscar ──
const limpiarNombre = (s) => String(s).replace(/^\[\[|\]\]$/g, '').split('|')[0].split('#')[0].replace(/\.md$/i, '').trim();

export function encontrarPagina(boveda, nombre) {
  const limpio = limpiarNombre(nombre);
  const directa = boveda.claves.get(normalizar(limpio)) ?? boveda.claves.get(normalizar(nombreDeArchivo(limpio)));
  if (directa) return { pagina: directa, sugerencias: [] };
  const n = normalizar(limpio);
  const sugerencias = boveda.paginas.filter((p) => normalizar(p.nombre).includes(n) || n.includes(normalizar(p.nombre))).slice(0, 5).map((p) => p.nombre);
  return { pagina: null, sugerencias };
}

export function leerPagina(boveda, nombre, tope = 40_000) {
  const { pagina, sugerencias } = encontrarPagina(boveda, nombre);
  if (!pagina) return { error: `No hay una página llamada «${limpiarNombre(nombre)}».`, sugerencias };
  const texto = boveda.archivos.get(pagina.ruta);
  return { pagina: pagina.nombre, ruta: pagina.ruta, texto: texto.length > tope ? `${texto.slice(0, tope)}\n\n[… la página sigue; se cortó aquí]` : texto };
}

const VACIAS = new Set(['que', 'qué', 'como', 'cómo', 'cual', 'cuál', 'del', 'las', 'los', 'una', 'uno', 'unos', 'unas', 'con', 'para', 'por', 'sus', 'mis', 'tus', 'esta', 'este', 'eso', 'esa', 'ese', 'hay', 'fue', 'son', 'era', 'pero', 'mas', 'más', 'sobre', 'entre', 'tiene', 'tengo', 'quedo', 'quedó', 'algo', 'donde', 'dónde', 'cuando', 'cuándo', 'the', 'and'].map(normalizar));

export function buscar(boveda, consulta, max = 6) {
  const terminos = [...new Set(normalizar(consulta).split(/[^a-z0-9ñ]+/).filter((t) => t.length >= 3 && !VACIAS.has(t)))];
  if (!terminos.length) return [];
  const resultados = [], pregunta = normalizar(consulta);
  for (const p of boveda.paginas) {
    if (NO_EDITABLES.has(p.ruta)) continue;                            // el log y el índice: Atlas ya los tiene a mano
    const texto = boveda.archivos.get(p.ruta), normal = normalizar(texto), nombre = normalizar(p.nombre), alias = p.alias.map(normalizar);
    let puntos = 0, aciertos = 0;
    for (const t of terminos) {
      let pt = 0;
      if (nombre.includes(t)) pt += 12;
      if (alias.some((a) => a.includes(t))) pt += 6;
      let veces = 0, desde = 0;
      while (veces < 6 && (desde = normal.indexOf(t, desde)) !== -1) { veces++; desde += t.length; }
      pt += veces;
      if (pt) aciertos++;
      puntos += pt;
    }
    if (!puntos) continue;
    if (nombre.length >= 3 && pregunta.includes(nombre)) puntos += 25;    // la pregunta nombra la página entera («Rumbo»)
    puntos *= aciertos / terminos.length + 0.5;                         // premia a las que tienen todas las palabras
    const lineas = texto.split('\n').filter((l) => { const n = normalizar(l); return terminos.some((t) => n.includes(t)) && !/^\w+:\s/.test(l); });
    resultados.push({ pagina: p.nombre, carpeta: p.carpeta, resumen: p.resumen, puntos, fragmentos: lineas.slice(0, 3).map((l) => l.trim().slice(0, 220)) });
  }
  return resultados.sort((a, b) => b.puntos - a.puntos).slice(0, max).map(({ puntos, ...r }) => r);
}

// ── Cambios ──
const TITULO = /^(#{1,6})\s+(.*)$/;
const textoDeTitulo = (t) => normalizar(t.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' '));

// Aplica un cambio a un texto. tipo «agregar» (al final de una sección, o de la página) o «reemplazar» (un texto que
// aparece una sola vez). Devuelve el texto nuevo y la vista del cambio, en líneas {signo, texto}.
export function aplicarCambio(texto, { tipo, texto: nuevo, seccion, buscar: viejo }) {
  nuevo = String(nuevo ?? '').replace(/\r\n/g, '\n').replace(/\n+$/, '');
  if (!nuevo.trim() && tipo !== 'reemplazar') throw publico('El cambio viene vacío.');
  if (tipo === 'reemplazar') {
    viejo = String(viejo ?? '').replace(/\r\n/g, '\n');
    if (!viejo) throw publico('Para reemplazar falta el texto que se cambia («buscar»).');
    const veces = texto.split(viejo).length - 1;
    if (veces === 0) throw publico('El texto que quieres cambiar no está (o cambió) en la página.');
    if (veces > 1) throw publico(`El texto que quieres cambiar aparece ${veces} veces: hay que elegir un pedazo que aparezca una sola vez.`);
    return {
      texto: texto.replace(viejo, () => nuevo),
      vista: [...viejo.split('\n').map((t) => ({ signo: '-', texto: t })), ...nuevo.split('\n').map((t) => ({ signo: '+', texto: t }))]
    };
  }
  if (tipo !== 'agregar') throw publico('El cambio tiene que ser «agregar» o «reemplazar».');
  const lineas = texto.split('\n');
  let ini = 0, fin = lineas.length;                              // dónde se agrega: el tramo [ini, fin)
  if (seccion) {
    const buscada = textoDeTitulo(seccion);
    const titulos = lineas.map((l, i) => ({ i, m: l.match(TITULO) })).filter((x) => x.m);
    const elegido = titulos.find((x) => textoDeTitulo(x.m[2]) === buscada) ?? titulos.find((x) => textoDeTitulo(x.m[2]).includes(buscada));
    if (!elegido) throw publico(`No hay una sección «${seccion}» en la página.`);
    const nivel = elegido.m[1].length;
    ini = elegido.i + 1;
    fin = titulos.find((x) => x.i > elegido.i && x.m[1].length <= nivel)?.i ?? lineas.length;
  } else {
    // Al final, pero antes de «## Fuentes» si la página la tiene
    const fuentes = lineas.findIndex((l) => /^##\s+Fuentes\s*$/i.test(l));
    if (fuentes !== -1) fin = fuentes;
  }
  let ultima = fin - 1;
  while (ultima >= ini && !lineas[ultima].trim()) ultima--;
  let agregadas = nuevo.split('\n');
  // Si la sección termina en un callout («> - …») y lo nuevo son puntos de lista, va dentro del callout
  if (ultima >= ini && lineas[ultima].startsWith('>') && agregadas.every((l) => /^\s*([-*]|\d+\.)\s/.test(l))) agregadas = agregadas.map((l) => `> ${l}`);
  const donde = ultima >= ini ? ultima + 1 : ini;
  const antes = lineas.slice(0, donde), despues = lineas.slice(donde);
  // Una línea en blanco entre lo nuevo y un título que venga justo después
  if (despues.length && TITULO.test(despues[0])) agregadas = [...agregadas, ''];
  if ((ultima < ini || TITULO.test(agregadas[0])) && antes.length && antes[antes.length - 1].trim()) agregadas = ['', ...agregadas];
  const contexto = ultima >= ini ? [{ signo: ' ', texto: lineas[ultima] }] : [];
  return {
    texto: [...antes, ...agregadas, ...despues].join('\n'),
    vista: [...contexto, ...agregadas.filter((l, i, a) => l || (i > 0 && i < a.length - 1)).map((t) => ({ signo: '+', texto: t }))]
  };
}

// El «actualizado:» del frontmatter queda con la fecha de hoy
export function marcarActualizado(texto, hoy = hoyChile()) {
  const m = texto.match(/^---\n([\s\S]*?)\n---/);
  if (!m || !/^actualizado:/m.test(m[1])) return texto;
  return `---\n${m[1].replace(/^actualizado:.*$/m, `actualizado: ${hoy}`)}\n---${texto.slice(m[0].length)}`;
}

// La línea del registro (log.md), con el formato de la bóveda
export const entradaDeLog = (hoy, resumen, pagina) => `## [${hoy}] nota | ${resumen}\n- Atlas lo anotó en [[${pagina}]] a pedido de Chris, desde su página.`;
export function agregarAlLog(log, entrada) {
  return `${log.replace(/\s+$/, '')}\n\n${entrada}\n`;
}

// Revisa una propuesta contra la bóveda de ahora: dice dónde va y cómo se ve el cambio (sin guardar nada)
export function prepararCambio(boveda, propuesta) {
  const { pagina } = encontrarPagina(boveda, propuesta.pagina);
  if (!pagina) throw publico(`No hay una página llamada «${limpiarNombre(propuesta.pagina)}». Atlas sólo anota en páginas que ya existen.`);
  if (NO_EDITABLES.has(pagina.ruta)) throw publico(`«${pagina.nombre}» no se edita a mano (la arma la ingesta o el propio Atlas).`);
  const resumen = String(propuesta.resumen ?? '').replace(/\s+/g, ' ').trim().slice(0, 140);
  if (!resumen) throw publico('Falta el resumen de una línea para el registro.');
  const { texto, vista } = aplicarCambio(boveda.archivos.get(pagina.ruta), propuesta);
  const hoy = hoyChile();
  return { pagina, resumen, hoy, texto: marcarActualizado(texto, hoy), vista, log: entradaDeLog(hoy, resumen, pagina.nombre) };
}
