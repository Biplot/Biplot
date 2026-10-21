// Fotografía una edición de La Línea para revisarla antes de enviarla (o para el PR): la web a 1280 y 390 px y el correo
// a 680 y 390 px, en página completa. Lo que el correo pide a https://biplot.cl/ se sirve desde este repo, así que las
// caras y el ícono de Rumbo se ven aunque todavía no estén publicados.
// Uso, desde la raíz del repo: node diario/_herramientas/fotografiar.mjs [AAAA-MM-DD] [carpeta]
//   (sin fecha, la última; sin carpeta, diario/_herramientas/salida/). Antes: node diario/_herramientas/armar.mjs
// Necesita Playwright (con el Chromium del entorno).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const salidaDef = path.join(raiz, 'diario', '_herramientas', 'salida');
const fecha = process.argv[2] || fs.readdirSync(path.join(raiz, 'diario', '_herramientas', 'ediciones')).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().at(-1).slice(0, 10);
const carpeta = path.resolve(process.argv[3] || salidaDef);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const archivoDe = (ruta) => { let f = path.join(raiz, decodeURIComponent(ruta)); if (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory())) f = path.join(f, 'index.html'); return f; };
const srv = http.createServer((q, r) => {
  const f = archivoDe(new URL(q.url, 'http://x').pathname);
  if (!f.startsWith(raiz) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${srv.address().port}`;
const nav = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
fs.mkdirSync(carpeta, { recursive: true });

const vistas = [
  ['web', `${base}/diario/${fecha}/`, 1280], ['web', `${base}/diario/${fecha}/`, 390],
  ['correo', `${base}/diario/_herramientas/salida/${fecha}-correo.html`, 680], ['correo', `${base}/diario/_herramientas/salida/${fecha}-correo.html`, 390],
  ['hemeroteca', `${base}/diario/`, 1280],
];
for (const [nombre, url, ancho] of vistas) {
  const pg = await nav.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: ancho < 500 ? 2 : 1, isMobile: ancho < 500 });
  await pg.route(/^https:\/\/biplot\.cl\//, (ruta) => {
    const f = archivoDe(new URL(ruta.request().url()).pathname);
    return fs.existsSync(f) ? ruta.fulfill({ path: f, contentType: TIPOS[path.extname(f)] }) : ruta.fulfill({ status: 404 });
  });
  await pg.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
  await pg.evaluate(() => document.fonts && document.fonts.ready);
  // Las caras van con loading="lazy": se recorre la página para que carguen todas antes de la foto
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
  await pg.waitForLoadState('networkidle').catch(() => {});
  const archivo = path.join(carpeta, `${fecha}-${nombre}-${ancho}.png`);
  await pg.screenshot({ path: archivo, fullPage: true });
  console.log('✓', path.relative(process.cwd(), archivo));
  await pg.close();
}
await nav.close(); srv.close();
