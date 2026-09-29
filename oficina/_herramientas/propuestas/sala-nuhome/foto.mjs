// Fotografía páginas locales con Chromium sin interfaz: node foto.mjs <html> <png> <ancho> <alto> [escala]
// o, como módulo, fotos([{ html, png, ancho, alto, escala }]).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function fotos(lista) {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'foto_'));
  const nav = spawn(process.env.NAVEGADOR || '/opt/pw-browsers/chromium', ['--headless=new', '--remote-debugging-port=0', '--no-sandbox', `--user-data-dir=${perfil}`, '--no-first-run', '--allow-file-access-from-files', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let puerto = 0, obj = null;
  for (let i = 0; i < 120 && !obj; i++) { try { if (!puerto) puerto = Number(fs.readFileSync(path.join(perfil, 'DevToolsActivePort'), 'utf8').split('\n')[0]); if (puerto) obj = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json(); } catch {} if (!obj) await sleep(250); }
  const ws = new WebSocket(obj.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let seq = 0; const pend = {}; let cargada = null; const errores = [];
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; return; }
    if (m.method === 'Page.loadEventFired' && cargada) cargada();
    if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  });
  const cdp = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pend[id] = (m) => (m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id, method, params })); });
  await cdp('Page.enable'); await cdp('Runtime.enable');
  for (const f of lista) {
    await cdp('Emulation.setDeviceMetricsOverride', { width: f.ancho, height: f.alto, deviceScaleFactor: f.escala || 1, mobile: false });
    const listo = new Promise((r) => { cargada = r; setTimeout(r, 30000); });
    await cdp('Page.navigate', { url: pathToFileURL(path.resolve(f.html)).href + (f.hash || '') });
    await listo; cargada = null;
    await cdp('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });
    await sleep(f.espera ?? 700);
    const img = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: f.ancho, height: f.alto, scale: 1 } });
    fs.writeFileSync(f.png, Buffer.from(img.data, 'base64'));
    console.log('✓', path.basename(f.png));
  }
  if (errores.length) console.log('errores:', errores.join(' | '));
  ws.close(); nav.kill();
}
if (import.meta.url === pathToFileURL(process.argv[1]).href && process.argv[2]) await fotos([{ html: process.argv[2], png: process.argv[3], ancho: +process.argv[4], alto: +process.argv[5], escala: +(process.argv[6] || 1) }]);
