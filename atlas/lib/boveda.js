// La bóveda: las páginas del wiki (Biplot/**/*.md, sin raw/) y su CLAUDE.md, leídas de la copia privada en GitHub
// (BOVEDA_REPO, con GITHUB_TOKEN) o de una carpeta local para probar (BOVEDA_LOCAL). Busca, lee, arma los cambios que
// Atlas propone y los guarda con un commit (con la línea de log.md y el «actualizado» de la página).
import { gunzipSync } from 'node:zlib';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { hoyChile } from './fecha.js';

const WIKI = 'Biplot/';
const LOG = 'Biplot/log.md';
const NO_EDITABLES = new Set([LOG, 'Biplot/index.md']);   // el log lo escribe Atlas solo; el índice lo genera la ingesta
const REVISAR_CADA = 15_000;                               // ms entre consultas a GitHub por si hubo cambios

const config = () => ({
  local: process.env.BOVEDA_LOCAL || '',
  escribirLocal: process.env.BOVEDA_LOCAL_ESCRIBIR === '1',
  repo: process.env.BOVEDA_REPO || '4ChrisM/boveda-biplot',
  rama: process.env.BOVEDA_RAMA || 'main',
  token: process.env.GITHUB_TOKEN || '',
  vault: process.env.OBSIDIAN_BOVEDA || 'Biplot'
});

export const normalizar = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const publico = (mensaje, estado = 400) => Object.assign(new Error(mensaje), { publico: true, estado });

// ── Cargar ──
let cache = null;              // { sha, revisado, archivos: Map(ruta → texto), paginas, claves }

export async function cargar({ forzar = false } = {}) {
  const c = config();
  if (cache && !forzar && Date.now() - cache.revisado < REVISAR_CADA) return cache;
  if (c.local) {
    cache = armar(await leerCarpeta(c.local), 'local');
    return cache;
  }
  if (!c.token) throw publico('Falta GITHUB_TOKEN (acceso a la bóveda) en las variables de Vercel.', 500);
  const sha = (await (await gh(`/repos/${c.repo}/commits/${encodeURIComponent(c.rama)}`, { aceptar: 'application/vnd.github.sha' })).text()).trim();
  if (cache && cache.sha === sha) { cache.revisado = Date.now(); return cache; }
  const tar = gunzipSync(Buffer.from(await (await gh(`/repos/${c.repo}/tarball/${sha}`)).arrayBuffer()));
  const archivos = new Map();
  for (const [ruta, texto] of leerTar(tar)) {
    const sinRaiz = ruta.slice(ruta.indexOf('/') + 1);             // el tarball trae todo dentro de «dueño-repo-sha/»
    if (esDelWiki(sinRaiz)) archivos.set(sinRaiz, texto.toString('utf8'));
  }
  cache = armar(archivos, sha);
  return cache;
}

const esDelWiki = (ruta) => ruta === 'CLAUDE.md' || (ruta.startsWith(WIKI) && ruta.endsWith('.md') && !ruta.startsWith(`${WIKI}raw/`) && !ruta.includes('/.'));

async function leerCarpeta(raiz) {
  const archivos = new Map();
  async function recorrer(rel) {
    for (const e of await readdir(path.join(raiz, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { if (!e.name.startsWith('.') && r !== 'Biplot/raw' && e.name !== 'node_modules') await recorrer(r); }
      else if (esDelWiki(r)) archivos.set(r, await readFile(path.join(raiz, r), 'utf8'));
    }
  }
  await recorrer('');
  return archivos;
}

// Un .tar (ya descomprimido): cabeceras de 512 bytes; las rutas largas o con tildes vienen en cabeceras pax («x»)
export function leerTar(buf) {
  const archivos = new Map();
  let i = 0, rutaPax = null;
  while (i + 512 <= buf.length) {
    const h = buf.subarray(i, i + 512);
    if (h.every((b) => b === 0)) break;
    const campo = (a, b) => { const s = h.subarray(a, b); const fin = s.indexOf(0); return s.subarray(0, fin === -1 ? s.length : fin).toString('utf8'); };
    const tam = parseInt(campo(124, 136).trim() || '0', 8);
    const tipo = h[156] === 0 ? '0' : String.fromCharCode(h[156]);
    const datos = buf.subarray(i + 512, i + 512 + tam);
    i += 512 + Math.ceil(tam / 512) * 512;
    if (tipo === 'x') { rutaPax = leerPax(datos).path ?? null; continue; }
    if (tipo === 'g') continue;
    const prefijo = campo(345, 500), nombre = campo(0, 100);
    const ruta = rutaPax ?? (prefijo ? `${prefijo}/${nombre}` : nombre);
    rutaPax = null;
    if (tipo === '0') archivos.set(ruta, datos);
  }
  return archivos;
}
function leerPax(datos) {
  const campos = {};
  let p = 0;
  while (p < datos.length) {
    const espacio = datos.indexOf(0x20, p);
    if (espacio === -1) break;
    const largo = parseInt(datos.subarray(p, espacio).toString('ascii'), 10);
    if (!largo) break;
    const registro = datos.subarray(espacio + 1, p + largo - 1).toString('utf8');      // sin el «\n» final
    const igual = registro.indexOf('=');
    campos[registro.slice(0, igual)] = registro.slice(igual + 1);
    p += largo;
  }
  return campos;
}

// Las páginas: nombre (el del archivo), carpeta, alias y la línea «> resumen» de cada una
function armar(archivos, sha) {
  const paginas = [], claves = new Map();
  for (const [ruta, texto] of archivos) {
    if (!ruta.startsWith(WIKI)) continue;
    const nombre = path.posix.basename(ruta, '.md');
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
  const directa = boveda.claves.get(normalizar(limpio)) ?? boveda.claves.get(normalizar(path.posix.basename(limpio)));
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

// El enlace para abrir una página en Obsidian (en el PC donde está la bóveda)
export const enlaceObsidian = (ruta) => `obsidian://open?vault=${encodeURIComponent(config().vault)}&file=${encodeURIComponent(ruta.slice(WIKI.length).replace(/\.md$/, ''))}`;

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
function agregarAlLog(log, entrada) {
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

// Guarda una propuesta ya aprobada: la vuelve a aplicar sobre lo último de la bóveda y lo sube en un solo commit
export async function guardarPropuesta(propuesta) {
  const c = config();
  for (let intento = 0; intento < 3; intento++) {
    const boveda = await cargar({ forzar: true });
    const listo = prepararCambio(boveda, propuesta);
    const cambios = new Map([[listo.pagina.ruta, listo.texto], [LOG, agregarAlLog(boveda.archivos.get(LOG) ?? '# Log\n', listo.log)]]);
    const mensaje = `nota: ${listo.resumen} (Atlas)`;
    if (c.local) {
      if (!c.escribirLocal) throw publico('La bóveda local es de sólo lectura (BOVEDA_LOCAL_ESCRIBIR=1 para escribir).', 403);
      for (const [ruta, texto] of cambios) await writeFile(path.join(c.local, ruta), texto, 'utf8');
      cache = null;
      return { pagina: listo.pagina.nombre, ruta: listo.pagina.ruta, commit: null, url: null };
    }
    const commit = await subir(c, boveda.sha, cambios, mensaje);
    if (commit) {
      cache = null;
      return { pagina: listo.pagina.nombre, ruta: listo.pagina.ruta, commit: commit.sha, url: `https://github.com/${c.repo}/commit/${commit.sha}` };
    }
    // La rama se movió mientras tanto (alguien más guardó): se vuelve a aplicar sobre lo nuevo
  }
  throw publico('La bóveda cambió mientras guardaba. Pídele a Atlas que lo vuelva a proponer.', 409);
}

// Un commit con varios archivos (Git Data API). null si la rama ya no está donde se leyó.
async function subir(c, base, cambios, mensaje) {
  const ref = await (await gh(`/repos/${c.repo}/git/ref/heads/${encodeURIComponent(c.rama)}`)).json();
  if (ref.object.sha !== base) return null;
  const padre = await (await gh(`/repos/${c.repo}/git/commits/${base}`)).json();
  const arbol = await (await gh(`/repos/${c.repo}/git/trees`, {
    metodo: 'POST',
    cuerpo: { base_tree: padre.tree.sha, tree: [...cambios].map(([ruta, content]) => ({ path: ruta, mode: '100644', type: 'blob', content })) }
  })).json();
  const nuevo = await (await gh(`/repos/${c.repo}/git/commits`, { metodo: 'POST', cuerpo: { message: mensaje, tree: arbol.sha, parents: [base] } })).json();
  try {
    await gh(`/repos/${c.repo}/git/refs/heads/${encodeURIComponent(c.rama)}`, { metodo: 'PATCH', cuerpo: { sha: nuevo.sha, force: false } });
  } catch (e) {
    if (e.status === 422) return null;                         // no avanza en línea recta: alguien guardó antes
    throw e;
  }
  return nuevo;
}

async function gh(ruta, { metodo = 'GET', cuerpo, aceptar = 'application/vnd.github+json' } = {}) {
  const r = await fetch(`https://api.github.com${ruta}`, {
    method: metodo,
    headers: {
      authorization: `Bearer ${config().token}`, accept: aceptar, 'x-github-api-version': '2022-11-28', 'user-agent': 'atlas-biplot',
      ...(cuerpo ? { 'content-type': 'application/json' } : {})
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  if (!r.ok) {
    const e = new Error(`GitHub respondió ${r.status} (${metodo} ${ruta.split('?')[0]})`);
    e.status = r.status;
    throw e;
  }
  return r;
}
