// Exporta la cara de cada integrante que firma en La Línea a diario/firmas/<id>.png (160 × 160, fondo transparente).
// Son las mismas caras del kit de la oficina (oficina/kit/?pieza=cara-<id>), pero en PNG: los correos (Outlook, sobre
// todo) no muestran WebP. Las del sitio siguen en assets/oficina/caras/.
// Uso, desde la raíz del repo: node diario/_herramientas/firmas.mjs [aby,felipe,…]
// Necesita Playwright (con el Chromium del entorno).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const TODAS = ['aby', 'felipe', 'celda', 'engine', 'architect', 'lupe', 'tamandua', 'pepa', 'faro', 'atlas', 'plotty'];
const ids = process.argv[2] ? process.argv[2].split(',') : TODAS;
const salida = path.join(raiz, 'diario', 'firmas');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  let ruta = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const f = path.join(raiz, ruta);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const nav = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const pg = await nav.newPage({ viewport: { width: 160, height: 160 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
fs.mkdirSync(salida, { recursive: true });
for (const id of ids) {
  await pg.goto(`http://127.0.0.1:${srv.address().port}/oficina/kit/?pieza=cara-${id}&formato=cara`, { waitUntil: 'networkidle' });
  await pg.waitForFunction(() => window.KIT_LISTO === true, null, { timeout: 15000 });
  const archivo = path.join(salida, id + '.png');
  await pg.screenshot({ path: archivo, omitBackground: true, clip: { x: 0, y: 0, width: 160, height: 160 } });
  console.log('✓', path.relative(raiz, archivo), Math.round(fs.statSync(archivo).size / 1024) + ' KB');
}
await nav.close(); srv.close();
