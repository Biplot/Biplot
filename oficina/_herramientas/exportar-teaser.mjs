#!/usr/bin/env node
// Graba el teaser del equipo (teaser/teaser.html) a MP4 con Edge o Chrome sin interfaz y ffmpeg. Sin dependencias de npm.
//   1. Fotografía en grande los fondos: el barrio y la oficina dibujados por escena.js (teaser/placas.html).
//   2. Compone la música y la voz de cada personaje (teaser/musica.mjs) desde el mismo guion (teaser/guion.js).
//   3. Dibuja cada cuadro con TEASER.cuadro(t) a 30 cuadros por segundo y ffmpeg lo junta con el sonido.
//
// Uso (desde la raíz del repo biplot; ffmpeg en el PATH o FFMPEG=<ruta>, NAVEGADOR=<ruta> para otro Chromium):
//   node oficina/_herramientas/exportar-teaser.mjs                       → oficina/kit/video/teaser-equipo-9x16.mp4 y -16x9.mp4
//   node oficina/_herramientas/exportar-teaser.mjs --formato 9x16 --salida <carpeta>
//   node oficina/_herramientas/exportar-teaser.mjs --cuadros 1.2,15.5,30 --salida <carpeta>   → sólo esos cuadros, en PNG
//   node oficina/_herramientas/exportar-teaser.mjs --solo-audio --salida <carpeta>            → sólo teaser-equipo.wav
//   --placas <carpeta> guarda ahí los fondos y los reusa en la próxima pasada (si no cambió la oficina)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..', '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const bandera = (n) => process.argv.includes('--' + n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const salida = path.resolve(arg('salida', path.join(raiz, 'oficina', 'kit', 'video')));
const FORMATOS = arg('formato', 'ambos') === 'ambos' ? ['9x16', '16x9'] : [arg('formato')];
const FPS = Number(arg('fps', 30));
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
fs.mkdirSync(salida, { recursive: true });

// El guion, el mismo que usa la página
const ventana = {}; new Function('window', fs.readFileSync(path.join(aqui, 'teaser', 'guion.js'), 'utf8'))(ventana);
const G = ventana.TEASER_GUION;

// 2. El sonido primero (no necesita navegador)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'teaser_'));
const wav = path.join(bandera('solo-audio') ? salida : tmp, 'teaser-equipo.wav');
const { componer, escribirWav } = await import(path.join(aqui, 'teaser', 'musica.mjs'));
if (!arg('cuadros')) {
  const t0 = Date.now();
  escribirWav(wav, componer(G));
  console.log('✓ música y voces', path.basename(wav), ((Date.now() - t0) / 1000).toFixed(1) + ' s');
}
if (bandera('solo-audio')) process.exit(0);

// Servidor estático sobre la raíz del repo; /__placas/ sirve los fondos fotografiados
const placas = arg('placas') ? path.resolve(arg('placas')) : path.join(tmp, 'placas'); fs.mkdirSync(placas, { recursive: true });
const reusar = !!arg('placas') && fs.existsSync(path.join(placas, 'placas.json'));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json' };
const servidor = http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const base = ruta.startsWith('/__placas/') ? placas : raiz;
  if (ruta.startsWith('/__placas/')) ruta = ruta.slice('/__placas'.length);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(base, ruta);
  if (!archivo.startsWith(base) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
  fs.createReadStream(archivo).pipe(res);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + servidor.address().port;

// Edge o Chrome, manejado por el protocolo de DevTools (puerto libre elegido por el sistema)
const EDGE = [process.env.NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/opt/pw-browsers/chromium'].find((p) => p && fs.existsSync(p));
if (!EDGE) { console.error('No encontré Edge ni Chrome (usa NAVEGADOR=<ruta>)'); process.exit(2); }
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'teaser_perfil_'));
const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=0', ...(process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []), `--user-data-dir=${perfil}`,
  '--no-first-run', '--disable-extensions', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none', 'about:blank'], { stdio: 'ignore' });
let puerto = 0, objetivos = null;
for (let i = 0; i < 120 && !objetivos; i++) {
  try { if (!puerto) puerto = Number(fs.readFileSync(path.join(perfil, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]); if (puerto) objetivos = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json(); } catch { /* aún no */ }
  if (!objetivos) await sleep(250);
}
const ws = new WebSocket(objetivos.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = {}; let cargada = null; const errores = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; return; }
  if (m.method === 'Page.loadEventFired' && cargada) cargada();
  if (m.method === 'Runtime.exceptionThrown') errores.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
});
const cdp = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pend[id] = (m) => (m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id, method, params })); });
const js = async (e) => { const r = await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
await cdp('Page.enable'); await cdp('Runtime.enable');
async function ir(direccion, w, h) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  const listo = new Promise((r) => { cargada = r; setTimeout(r, 30000); });
  await cdp('Page.navigate', { url: direccion });
  await listo; cargada = null;
}
async function foto(formato = 'jpeg') {
  const c = await cdp('Page.captureScreenshot', { format: formato, ...(formato === 'jpeg' ? { quality: 94 } : {}), captureBeyondViewport: false });
  return Buffer.from(c.data, 'base64');
}

try {
  // 1. Los fondos: el barrio (cerrado y abierto) y la oficina por dentro, en grande
  if (!reusar) await ir(`${url}/oficina/_herramientas/teaser/placas.html`, 1600, 1000);
  for (let i = 0; i < 80 && !(await js('!!window.PLACAS_LISTAS')); i++) await sleep(250);
  const PX = { barrio: 2.2, 'barrio-abierto': 2.2, oficina: 3.0 }, meta = {};
  for (const nombre of reusar ? [] : Object.keys(PX)) {
    const vb = await js(`window.PLACAS[${JSON.stringify(nombre)}].vb`);
    const w = Math.round(vb[2] * PX[nombre]), h = Math.round(vb[3] * PX[nombre]);
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await js(`window.placa(${JSON.stringify(nombre)}), new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    await sleep(400);
    fs.writeFileSync(path.join(placas, nombre + '.jpg'), await foto('jpeg'));
    meta[nombre] = { vb, w, h };
    console.log('✓ fondo', nombre, w + '×' + h);
  }
  if (!reusar) fs.writeFileSync(path.join(placas, 'placas.json'), JSON.stringify(meta));

  // 3. Cada formato, cuadro a cuadro
  for (const formato of FORMATOS) {
    const [W, H] = formato === '16x9' ? [1920, 1080] : [1080, 1920];
    await ir(`${url}/oficina/_herramientas/teaser/teaser.html?formato=${formato}`, W, H);
    for (let i = 0; i < 120 && !(await js("document.documentElement.getAttribute('data-listo') === '1'")); i++) await sleep(250);
    if (arg('cuadros')) {
      for (const s of arg('cuadros').split(',').map(Number)) {
        await js(`TEASER.cuadro(${s})`);
        fs.writeFileSync(path.join(salida, `cuadro-${formato}-${s.toFixed(2)}.png`), await foto('png'));
      }
      console.log('✓ cuadros', formato);
      continue;
    }
    const total = Math.ceil(G.total * FPS), mp4 = path.join(salida, `teaser-equipo-${formato}.mp4`);
    const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', wav,
      // crf 22 con aq-mode 3 (cuida los degradados oscuros): ~6 Mbps, liviano para subir a redes, que igual lo recomprimen.
      // El AAC a 256 kbps deja los picos reales bajo -1 dBTP (a 192 kbps el códec los subía casi hasta 0)
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-x264-params', 'aq-mode=3', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '256k',
      '-shortest', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
    const termino = new Promise((ok, mal) => { ff.on('close', (c) => (c === 0 ? ok() : mal(new Error('ffmpeg terminó con ' + c)))); ff.on('error', mal); });
    const t0 = Date.now();
    for (let n = 0; n < total; n++) {
      await js(`TEASER.cuadro(${(n / FPS).toFixed(4)})`);
      const img = await foto('jpeg');
      if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r));
      if (n % 150 === 0) process.stdout.write(`  ${formato}: ${n}/${total} cuadros (${Math.round((Date.now() - t0) / 1000)} s)\r`);
    }
    ff.stdin.end(); await termino;
    console.log(`✓ ${path.relative(raiz, mp4)} · ${total} cuadros · ${(fs.statSync(mp4).size / 1048576).toFixed(1)} MB · ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  if (errores.length) console.log('Errores de la página:\n  ' + [...new Set(errores)].join('\n  '));
} finally {
  try { ws.close(); } catch { /* ya cerrado */ }
  edge.kill(); servidor.close(); await sleep(500);
  for (const d of [perfil, tmp]) for (let i = 0; i < 5; i++) { try { fs.rmSync(d, { recursive: true, force: true }); break; } catch { await sleep(400); } }
}
