// Fotografía las láminas para redes de una edición de La Línea (el carrusel de Instagram y LinkedIn) y las deja en
// diario/<fecha>/redes/01.jpg, 02.jpg…, de 1080×1350. Viajan en el PR de la edición: al publicarla, el CRM deja el
// carrusel por aprobar en Marketing con estas imágenes (las lee de biplot.cl). Las arma armar.mjs en
// salida/<fecha>-redes.html; lo que la página pide a /diario/ se sirve desde este repo.
// Uso, desde la raíz del repo: node diario/_herramientas/redes.mjs [AAAA-MM-DD]
//   (sin fecha, la última). Antes: node diario/_herramientas/armar.mjs AAAA-MM-DD
// Necesita Playwright (con el Chromium del entorno) y red para las letras de Google Fonts.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const fecha = process.argv[2] || fs.readdirSync(path.join(raiz, 'diario', '_herramientas', 'ediciones')).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().at(-1).slice(0, 10);
const pagina = path.join(raiz, 'diario', '_herramientas', 'salida', `${fecha}-redes.html`);
if (!fs.existsSync(pagina)) { console.error(`Falta ${path.relative(raiz, pagina)}: corre antes node diario/_herramientas/armar.mjs ${fecha}`); process.exit(1); }
const carpeta = path.join(raiz, 'diario', fecha, 'redes');

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const f = path.join(raiz, decodeURIComponent(new URL(q.url, 'http://x').pathname));
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const nav = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const pg = await nav.newPage({ viewport: { width: 1160, height: 1430 } });
let errores = 0;
pg.on('requestfailed', (q) => { if (!/fonts\.g/.test(q.url())) { errores++; console.error('✗ no cargó', q.url()); } });
pg.on('response', (r) => { if (r.status() >= 400) { errores++; console.error('✗', r.status(), r.url()); } });
await pg.goto(`http://127.0.0.1:${srv.address().port}/diario/_herramientas/salida/${fecha}-redes.html`, { waitUntil: 'networkidle' });
await pg.waitForSelector('body[data-listo]', { timeout: 20000 });
const cargadas = await pg.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')));
const faltan = ['Dela Gothic One', 'Bangers', 'Archivo Narrow', 'Patrick Hand', 'IBM Plex Mono'].filter((f) => !cargadas.includes(f));
if (faltan.length) { errores++; console.error('✗ no cargaron las letras de Google Fonts:', faltan.join(', ')); }

// Las de una vuelta anterior se borran: si la edición ahora tiene menos láminas, no queda una de sobra
fs.rmSync(carpeta, { recursive: true, force: true });
fs.mkdirSync(carpeta, { recursive: true });
const laminas = await pg.$$('.lamina');
for (const [i, l] of laminas.entries()) {
  const archivo = path.join(carpeta, `${String(i + 1).padStart(2, '0')}.jpg`);
  await l.screenshot({ path: archivo, type: 'jpeg', quality: 86 });
  const noCabe = await l.evaluate((x) => x.dataset.noCabe === '1');
  if (noCabe) { errores++; console.error(`✗ ${path.relative(raiz, archivo)}: el texto no cabe ni con la letra más chica (acorta la nota)`); }
  console.log('✓', path.relative(raiz, archivo), Math.round(fs.statSync(archivo).size / 1024) + ' KB');
}
await nav.close(); srv.close();
if (errores) process.exit(1);
