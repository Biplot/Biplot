// Graba el fondo de la portada (fondo.html) cuadro a cuadro y lo pasa a video sin sonido, en bucle.
// Uso, desde la raíz del repo: node _herramientas/fondo-portada/grabar.mjs [16x9|9x16|todo]
// Deja assets/portada-fondo-h.mp4|.webm y assets/portada-fondo-v.mp4|.webm (16 s a 24 cuadros) y sus pósters .jpg
// (el cuadro del segundo 10, con la línea armada), que también son la imagen fija con «reducir movimiento».
// Necesita Playwright (con el Chromium del entorno) y ffmpeg.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execFileSync } from 'node:child_process';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const pedido = process.argv[2] || 'todo', FPS = 24, POSTER_SEG = 10;
const formatos = pedido === 'todo' ? ['16x9', '9x16'] : [pedido];
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const srv = http.createServer((q, r) => {
  const f = path.join(raiz, decodeURIComponent(new URL(q.url, 'http://x').pathname));
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const nav = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });

for (const formato of formatos) {
  const V = formato === '9x16', W = V ? 1080 : 1920, H = V ? 1920 : 1080, sufijo = V ? 'v' : 'h';
  const pg = await nav.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await pg.goto(`http://127.0.0.1:${srv.address().port}/_herramientas/fondo-portada/fondo.html?formato=${formato}`, { waitUntil: 'networkidle' });
  await pg.evaluate(() => window.FONDO.listo);
  const total = await pg.evaluate(() => window.FONDO.total), n = Math.round(total * FPS);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fondo-'));
  for (let i = 0; i < n; i++) {
    await pg.evaluate((t) => window.FONDO.cuadro(t), i / FPS);
    await pg.screenshot({ path: path.join(tmp, String(i).padStart(4, '0') + '.png') });
    if (i % 48 === 0) process.stdout.write(`${formato} ${i}/${n}\r`);
  }
  await pg.evaluate((t) => window.FONDO.cuadro(t), POSTER_SEG);
  const poster = path.join(raiz, 'assets', `portada-fondo-${sufijo}.jpg`);
  await pg.screenshot({ path: poster, type: 'jpeg', quality: 82 });
  await pg.close();
  const salida = path.join(raiz, 'assets', `portada-fondo-${sufijo}.mp4`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(tmp, '%04d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-g', String(FPS * 2), '-movflags', '+faststart', '-an', salida]);
  // WebM (VP9) para los navegadores sin H.264 (Chromium sin códecs propietarios)
  const webm = salida.replace(/\.mp4$/, '.webm');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(tmp, '%04d.png'),
    '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
    '-pix_fmt', 'yuv420p', '-g', String(FPS * 2), '-an', webm]);
  fs.rmSync(tmp, { recursive: true, force: true });
  const mb = (f) => (fs.statSync(f).size / 1e6).toFixed(2) + ' MB';
  console.log(`${formato}: ${path.relative(raiz, salida)} (${mb(salida)}), .webm (${mb(webm)}) y ${path.relative(raiz, poster)}`);
}
await nav.close(); srv.close();
