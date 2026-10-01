// Servidor estático sobre la raíz del repo, con rangos (para adelantar un video). Con WEBM=<carpeta>, cada .mp4 se sirve
// desde su copia .webm de esa carpeta (sólo para fotografiar: el Chromium de la nube no trae H.264).
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.webmanifest': 'application/manifest+json' };

export async function servir(webm = process.env.WEBM) {
  const servidor = http.createServer((req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (ruta.endsWith('/')) ruta += 'index.html';
    let archivo = path.join(raiz, ruta);
    if (webm && ruta.endsWith('.mp4')) { const otro = path.join(webm, ruta.replace(/\.mp4$/, '.webm')); if (fs.existsSync(otro)) archivo = otro; }
    if ((!archivo.startsWith(raiz) && !(webm && archivo.startsWith(webm))) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) { res.writeHead(404); res.end('404'); return; }
    const tipo = TIPOS[path.extname(archivo)] || 'application/octet-stream', total = fs.statSync(archivo).size, r = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (r) {
      const a = r[1] ? +r[1] : 0, b = r[2] ? Math.min(+r[2], total - 1) : total - 1;
      res.writeHead(206, { 'Content-Type': tipo, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${a}-${b}/${total}`, 'Content-Length': b - a + 1 });
      fs.createReadStream(archivo, { start: a, end: b }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': tipo, 'Accept-Ranges': 'bytes', 'Content-Length': total });
      fs.createReadStream(archivo).pipe(res);
    }
  });
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  return { url: 'http://127.0.0.1:' + servidor.address().port + '/oficina/', cerrar: () => servidor.close() };
}
