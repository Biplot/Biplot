// Fotografía la oficina por dentro, sin interfaz, para el recorte del sitio (assets/oficina/oficina-adentro.webp).
// Uso, desde la raíz del repo: node oficina/_herramientas/fotografiar-adentro.mjs <salida.png> ["-432 -52 1137 568.5"]
// (el encuadre del sitio es ese viewBox, a 1600 × 800; después se pasa a WebP con calidad 78)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'), salida = process.argv[2], vb = process.argv[3] || '-432 -52 1137 568.5';
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html'; const f = path.join(raiz, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await nav.newPage({ viewport: { width: 1600, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await pg.goto(`http://127.0.0.1:${srv.address().port}/oficina/#oficina`, { waitUntil: 'networkidle' });
await pg.waitForTimeout(3000);
const info = await pg.evaluate((vb) => {
  const s = document.querySelector('#svg-escena');
  const antes = s.getAttribute('viewBox');
  // Sin interfaz encima: sólo el dibujo
  document.body.style.visibility = 'hidden'; s.style.visibility = 'visible';
  Object.assign(s.style, { position: 'fixed', inset: '0', width: '1600px', height: '800px', zIndex: '9999' });
  if (vb) s.setAttribute('viewBox', vb);
  s.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  return { antes, ahora: s.getAttribute('viewBox') };
}, vb);
await pg.waitForTimeout(800);
await pg.screenshot({ path: salida });
console.log(JSON.stringify(info));
await nav.close(); srv.close();
