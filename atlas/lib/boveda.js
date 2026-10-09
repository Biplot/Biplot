// La bóveda: las páginas del wiki (Biplot/**/*.md, sin raw/) y su CLAUDE.md, leídas de la copia privada en GitHub
// (BOVEDA_REPO, con GITHUB_TOKEN) o de una carpeta local para probar (BOVEDA_LOCAL). Busca, lee, arma los cambios que
// Atlas propone y los guarda con un commit (con la línea de log.md y el «actualizado» de la página).
import { gunzipSync } from 'node:zlib';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { WIKI, LOG, publico, esDelWiki, armar, prepararCambio, agregarAlLog } from './paginas.js';

// Lo que no depende del servidor (buscar, leer, armar cambios) vive en paginas.js; se re-exporta aquí
export * from './paginas.js';

const REVISAR_CADA = 15_000;                               // ms entre consultas a GitHub por si hubo cambios

const config = () => ({
  local: process.env.BOVEDA_LOCAL || '',
  escribirLocal: process.env.BOVEDA_LOCAL_ESCRIBIR === '1',
  repo: process.env.BOVEDA_REPO || '4ChrisM/boveda-biplot',
  rama: process.env.BOVEDA_RAMA || 'main',
  token: process.env.GITHUB_TOKEN || '',
  vault: process.env.OBSIDIAN_BOVEDA || 'Biplot'
});

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

// El enlace para abrir una página en Obsidian (en el PC donde está la bóveda)
export const enlaceObsidian = (ruta) => `obsidian://open?vault=${encodeURIComponent(config().vault)}&file=${encodeURIComponent(ruta.slice(WIKI.length).replace(/\.md$/, ''))}`;

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
