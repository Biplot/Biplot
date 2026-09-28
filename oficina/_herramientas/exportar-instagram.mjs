#!/usr/bin/env node
// Exporta a PNG las piezas de Instagram de _herramientas/instagram/ (cada .lamina a su tamaño exacto, 1080 × 1350)
// con Edge o Chrome sin interfaz. Sin dependencias de npm.
//
// Uso (desde la raíz del repo biplot; NAVEGADOR=<ruta> para otro Chromium):
//   node oficina/_herramientas/exportar-instagram.mjs --pieza motor                 → oficina/kit/instagram/motor/motor-01.png …
//   node oficina/_herramientas/exportar-instagram.mjs --pieza motor --salida <carpeta>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..', '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pieza = arg('pieza', 'motor');
if (!/^[a-z0-9-]+$/.test(pieza) || !fs.existsSync(path.join(aqui, 'instagram', pieza + '.html'))) { console.error('No existe la pieza', pieza, '(mira _herramientas/instagram/)'); process.exit(2); }
const salida = path.resolve(arg('salida', path.join(raiz, 'oficina', 'kit', 'instagram', pieza)));
fs.mkdirSync(salida, { recursive: true });

// Servidor estático sobre la raíz del repo
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json' };
const servidor = http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(raiz, ruta);
  if (!archivo.startsWith(raiz) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
  fs.createReadStream(archivo).pipe(res);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + servidor.address().port;

// Edge o Chrome, manejado por el protocolo de DevTools
const NAVEGADOR = [process.env.NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/opt/pw-browsers/chromium'].find((p) => p && fs.existsSync(p));
if (!NAVEGADOR) { console.error('No encontré Edge ni Chrome (usa NAVEGADOR=<ruta>)'); process.exit(2); }
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'instagram_perfil_'));
const nav = spawn(NAVEGADOR, ['--headless=new', '--remote-debugging-port=0', ...(process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []), `--user-data-dir=${perfil}`,
  '--no-first-run', '--disable-extensions', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none', 'about:blank'], { stdio: 'ignore' });
let puerto = 0, objetivos = null;
for (let i = 0; i < 120 && !objetivos; i++) {
  try { if (!puerto) puerto = Number(fs.readFileSync(path.join(perfil, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]); if (puerto) objetivos = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json(); } catch { /* aún no */ }
  if (!objetivos) await sleep(250);
}
const ws = new WebSocket(objetivos.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = {}; let cargada = null;
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; return; }
  if (m.method === 'Page.loadEventFired' && cargada) cargada();
});
const cdp = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pend[id] = (m) => (m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id, method, params })); });
const js = async (e) => { const r = await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };

try {
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1160, height: 1430, deviceScaleFactor: 1, mobile: false });
  const listo = new Promise((r) => { cargada = r; setTimeout(r, 30000); });
  await cdp('Page.navigate', { url: `${url}/oficina/_herramientas/instagram/${pieza}.html` });
  await listo; cargada = null;
  for (let i = 0; i < 120 && !(await js("document.documentElement.getAttribute('data-listo') === '1'")); i++) await sleep(250);
  const laminas = await js(`[...document.querySelectorAll('.lamina')].map((l) => { const r = l.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, n: l.dataset.n }; })`);
  for (const l of laminas) {
    const c = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: l.x, y: l.y, width: l.w, height: l.h, scale: 1 } });
    const archivo = path.join(salida, `${pieza}-${String(l.n).padStart(2, '0')}.png`);
    fs.writeFileSync(archivo, Buffer.from(c.data, 'base64'));
  }
  console.log(`✓ ${pieza}: ${laminas.length} láminas en ${path.relative(raiz, salida) || salida}`);
} finally {
  try { ws.close(); } catch { /* ya cerrado */ }
  nav.kill(); servidor.close(); await sleep(400);
  for (let i = 0; i < 5; i++) { try { fs.rmSync(perfil, { recursive: true, force: true }); break; } catch { await sleep(300); } }
}
