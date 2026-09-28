// La sala de Nu Home como está hoy en la oficina (para comparar)
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { spawn } from 'node:child_process';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'antes_'));
const nav = spawn(process.env.NAVEGADOR || '/opt/pw-browsers/chromium', ['--headless=new', '--remote-debugging-port=0', '--no-sandbox', `--user-data-dir=${perfil}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
let puerto = 0, obj = null;
for (let i = 0; i < 120 && !obj; i++) { try { if (!puerto) puerto = Number(fs.readFileSync(path.join(perfil, 'DevToolsActivePort'), 'utf8').split('\n')[0]); if (puerto) obj = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json(); } catch {} if (!obj) await sleep(250); }
const ws = new WebSocket(obj.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = {};
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } });
const cdp = (method, params = {}) => new Promise((res) => { const id = ++seq; pend[id] = (m) => res(m.result); ws.send(JSON.stringify({ id, method, params })); });
await cdp('Page.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await cdp('Page.navigate', { url: (process.env.BASE || 'http://127.0.0.1:5480') + '/oficina/#nuhome' });
await sleep(6000);
const img = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(process.argv[2], Buffer.from(img.data, 'base64'));
ws.close(); nav.kill(); console.log('✓ antes');
