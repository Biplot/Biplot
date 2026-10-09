// Para probar en el PC sin Vercel: sirve public/ y las funciones de api/ (npm run dev → http://localhost:3000)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Readable } from 'node:stream';

const aqui = path.dirname(fileURLToPath(import.meta.url));
// Las variables de .env.local (si existe)
const env = path.join(aqui, '.env.local');
if (existsSync(env)) {
  for (const linea of readFileSync(env, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
// Los mismos encabezados que pone Vercel (vercel.json), para probar con la misma política de seguridad
const ENCABEZADOS = Object.fromEntries((JSON.parse(readFileSync(path.join(aqui, 'vercel.json'), 'utf8')).headers ?? [])
  .find((h) => h.source === '/(.*)')?.headers.map((h) => [h.key.toLowerCase(), h.value]) ?? []);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const PUERTO = Number(process.env.PORT || 3000);

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      const nombre = url.pathname.slice(5).replace(/\/$/, '');
      if (!/^[a-z]+$/.test(nombre) || !existsSync(path.join(aqui, 'api', `${nombre}.js`))) { res.writeHead(404); return res.end(); }
      const modulo = await import(pathToFileURL(path.join(aqui, 'api', `${nombre}.js`)).href);
      const manejar = modulo[req.method];
      if (!manejar) { res.writeHead(405); return res.end(); }
      const control = new AbortController();
      res.on('close', () => { if (!res.writableFinished) control.abort(); });
      const cuerpo = ['GET', 'HEAD'].includes(req.method) ? undefined : Readable.toWeb(req);
      const request = new Request(url, { method: req.method, headers: req.headers, body: cuerpo, duplex: 'half', signal: control.signal });
      const r = await manejar(request);
      const encabezados = { ...ENCABEZADOS };
      r.headers.forEach((v, k) => { encabezados[k] = v; });
      res.writeHead(r.status, encabezados);
      if (r.body) for await (const pedazo of r.body) res.write(pedazo);
      return res.end();
    }
    let archivo = path.join(aqui, 'public', decodeURIComponent(url.pathname));
    if (!archivo.startsWith(path.join(aqui, 'public'))) { res.writeHead(403); return res.end(); }
    if ((await stat(archivo).catch(() => null))?.isDirectory()) archivo = path.join(archivo, 'index.html');
    const datos = await readFile(archivo).catch(() => null);
    if (!datos) { res.writeHead(404); return res.end('No existe'); }
    res.writeHead(200, { ...ENCABEZADOS, 'content-type': TIPOS[path.extname(archivo)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(datos);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
}).listen(PUERTO, () => console.log(`Atlas en http://localhost:${PUERTO}`));
