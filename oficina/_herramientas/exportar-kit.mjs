#!/usr/bin/env node
// Exporta el kit de Instagram de la oficina a PNG con Edge sin interfaz (DevTools Protocol). Sin dependencias: Node 22+.
// Levanta un servidor estático propio sobre la raíz del repo, abre oficina/kit/?pieza=…&formato=…, espera las
// fuentes y captura cada pieza a su tamaño exacto. Emula "reducir movimiento" para que todo quede quieto.
//
// Uso (desde la raíz del repo biplot):
//   node oficina/_herramientas/exportar-kit.mjs                 → todas las piezas a oficina/kit/png/
//   node oficina/_herramientas/exportar-kit.mjs --solo ficha-lupe,oficina,sala-haru
//   node oficina/_herramientas/exportar-kit.mjs --capturas <carpeta>   → además, la oficina a 1920/1440/1366/375 px
//     (el barrio, un local abierto con su vista previa, su sala, la calle, la oficina por dentro y una ficha)
//   node oficina/_herramientas/exportar-kit.mjs --caras                 → sólo las caras del motor (E0 a E9) para el sitio,
//     en WebP de 160 × 160 con fondo transparente, a assets/oficina/caras/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..', '..');
const salida = path.join(raiz, 'oficina', 'kit', 'png');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const IDS = ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle', 'tamandua', 'faro', 'pepa', 'aby', 'felipe'];
const PIEZAS = IDS.map((id) => 'ficha-' + id).concat(['oficina', 'elenco', 'motor', 'quien']);
const FORMATOS = { '4x5': [1080, 1350], '9x16': [1080, 1920], og: [1200, 630], cara: [160, 160] };
// La sala de cada empresa, el museo de El Archivo y la sala de ventas del local libre: vista previa del enlace
// biplot.cl/oficina/<sala>; Haru 360, además, publicación e historia
const SALAS = ['fundos', 'haru', 'eleven', 'nuhome', 'rumbo', 'archivo', 'libre'], FORMATOS_SALA = { haru: ['og', '4x5', '9x16'] };
let trabajos = [];
for (const p of PIEZAS) for (const f of ['4x5', '9x16']) trabajos.push([p, f]);
trabajos.push(['oficina', 'og']);
for (const id of SALAS) for (const f of FORMATOS_SALA[id] || ['og']) trabajos.push(['sala-' + id, f]);
if (arg('solo')) { const s = arg('solo').split(','); trabajos = trabajos.filter(([p]) => s.includes(p)); }
// Las caras del sitio: quienes llevan alguna fase del motor (Plotty y el equipo; Aby y Felipe, la dupla de PRENSA, no llevan ninguna)
const CARAS = process.argv.includes('--caras');
if (CARAS) trabajos = ['plotty'].concat(IDS.filter((id) => id !== 'aby' && id !== 'felipe')).map((id) => ['cara-' + id, 'cara']);

// Servidor estático mínimo
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const servidor = http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(raiz, ruta);
  if (!archivo.startsWith(raiz) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
  fs.createReadStream(archivo).pipe(res);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + servidor.address().port;

// Edge o Chrome; NAVEGADOR=<ruta> para usar otro Chromium (en Linux, por ejemplo, el de Playwright).
const EDGE = [process.env.NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/opt/pw-browsers/chromium'].find((p) => p && fs.existsSync(p));
if (!EDGE) { console.error('No encontré Edge ni Chrome (usa NAVEGADOR=<ruta>)'); process.exit(2); }
// Puerto de depuración 0: el sistema asigna uno libre y Edge lo escribe en DevToolsActivePort de su perfil.
// Nunca un puerto fijo: otra sesión puede tener su propio Edge escuchando ahí y terminaríamos manejando su pestaña.
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'kit_'));
const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=0', ...(process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []), `--user-data-dir=${perfil}`, '--no-first-run', '--disable-extensions',
  '--hide-scrollbars', '--force-color-profile=srgb', '--window-size=1200,1920', 'about:blank'], { stdio: 'ignore' });
let puerto = 0, objetivos = null;
for (let i = 0; i < 120 && !objetivos; i++) {
  try {
    if (!puerto) puerto = Number(fs.readFileSync(path.join(perfil, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]);
    if (puerto) objetivos = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
  } catch { /* todavía no */ }
  if (!objetivos) await sleep(250);
}
if (!objetivos) { edge.kill(); servidor.close(); throw new Error('Edge no abrió su puerto de depuración'); }
if (objetivos.filter((t) => t.type === 'page').length !== 1 || !/about:blank/.test(objetivos.find((t) => t.type === 'page').url)) {
  edge.kill(); servidor.close(); throw new Error('El navegador del puerto ' + puerto + ' no es el que abrió este script');
}
const ws = new WebSocket(objetivos.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = {}; let cargada = null; const errores = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; return; }
  if (m.method === 'Page.loadEventFired' && cargada) cargada();
  if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
});
const cdp = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pend[id] = (m) => (m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id, method, params })); });
const js = async (e) => (await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.value;
await cdp('Page.enable'); await cdp('Runtime.enable');

async function ir(url, w, h, movil, reducir) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!movil });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reducir ? 'reduce' : 'no-preference' }] });
  const listo = new Promise((r) => { cargada = r; setTimeout(r, 20000); });
  await cdp('Page.navigate', { url });
  await listo; cargada = null;
}

const carpetaCaras = path.join(raiz, 'assets', 'oficina', 'caras');
fs.mkdirSync(CARAS ? carpetaCaras : salida, { recursive: true });
// Fondo transparente para las caras (lo de afuera del círculo)
if (CARAS) await cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
for (const [pieza, f] of trabajos) {
  const [w, h] = FORMATOS[f];
  await ir(`${base}/oficina/kit/?pieza=${pieza}&formato=${f}`, w, h, false, true);
  for (let i = 0; i < 60; i++) { if (await js('window.KIT_LISTO === true')) break; await sleep(250); }
  await sleep(300);
  const c = await cdp('Page.captureScreenshot', { format: CARAS ? 'webp' : 'png', ...(CARAS ? { quality: 90 } : {}), clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
  const archivo = CARAS ? path.join(carpetaCaras, pieza.slice(5) + '.webp') : path.join(salida, `${pieza}-${f}.png`);
  fs.writeFileSync(archivo, Buffer.from(c.data, 'base64'));
  console.log('✓', path.relative(raiz, archivo), Math.round(fs.statSync(archivo).size / 1024) + ' KB');
}

// Capturas de la oficina para el PR (1920, 1440, 1366 y 375 px): el barrio con la oficina cerrada, un local abierto (sin
// techo, con su gente) y su vista previa, su sala, la vuelta a la calle, la oficina por dentro y una ficha del equipo.
const capturas = arg('capturas');
if (capturas) {
  fs.mkdirSync(capturas, { recursive: true });
  const vistas = [[1920, 1080, false], [1440, 900, false], [1366, 768, false], [375, 812, true]];
  const foto = async (nombre) => { const c = await cdp('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(capturas, nombre), Buffer.from(c.data, 'base64')); };
  for (const [w, h, movil] of vistas) {
    await ir(`${base}/oficina/`, w, h, movil, false);
    await js("try{localStorage.setItem('oficina-visto','1')}catch(e){}; true");
    await ir(`${base}/oficina/`, w, h, movil, false);
    await sleep(1600);
    await foto(`oficina-${w}.png`);
    await js("document.querySelector('#recorrer [data-id=\"haru\"]').click(); true");
    await sleep(1800);
    await foto(`oficina-${w}-vista.png`);
    await js("document.querySelector('#panel [data-entrar=\"haru\"]').click(); true");
    await sleep(2200);
    await foto(`oficina-${w}-sala.png`);
    await js("document.querySelector('#sala-volver').click(); true");
    await sleep(1400);
    await foto(`oficina-${w}-calle.png`);
    await js("document.querySelector('#recorrer [data-oficina]').click(); true");
    await sleep(1800);
    await foto(`oficina-${w}-adentro.png`);
    await js("document.querySelector('#recorrer [data-id=\"lupe\"]').click(); true");
    await sleep(1800);
    await foto(`oficina-${w}-personal.png`);
    console.log('✓ capturas a', w, 'px');
  }
}

if (errores.length) console.log('Errores de la página:\n  ' + [...new Set(errores)].join('\n  '));
try { ws.close(); } catch { /* ya cerrado */ }
edge.kill(); servidor.close(); await sleep(500);
for (let i = 0; i < 5; i++) { try { fs.rmSync(perfil, { recursive: true, force: true }); break; } catch { await sleep(400); } }
