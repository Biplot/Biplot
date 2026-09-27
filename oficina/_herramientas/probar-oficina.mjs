#!/usr/bin/env node
// Prueba funcional de la oficina con Edge o Chrome sin interfaz (sin dependencias, Node 22+). Levanta su propio
// servidor estático sobre la raíz del repo y recorre la página en escritorio y celular: el barrio cerrado con los techos
// de cada empresa, la oficina que se abre al entrar (y se cierra con Escape y con el botón atrás), menú y buscador del
// barrio, recorrido guiado, la vista previa de un local y su sala (puntos, pantallas reales, volver), el chat de Plotty
// con la cámara en el rubro y la vitrina, El Archivo, teclado, enlaces directos (#oficina, #lupe, #nuhome, #archivo,
// #conversar y biplot.cl/oficina/haru), Escape, pausa, movimiento reducido, errores de consola y desborde horizontal.
// Al final carga casos de prueba (sólo en el navegador de la prueba, no en datos.js) para revisar las calles por rubro,
// sus techos, las plantillas y las fases. NAVEGADOR=<ruta> usa otro Chromium.
//
// Uso (desde la raíz del repo biplot):  node oficina/_herramientas/probar-oficina.mjs [--url http://…/oficina/]
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

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json' };
const servidor = http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(raiz, ruta);
  if (!archivo.startsWith(raiz) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
  fs.createReadStream(archivo).pipe(res);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const url = arg('url', 'http://127.0.0.1:' + servidor.address().port + '/oficina/');

const EDGE = [process.env.NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/opt/pw-browsers/chromium'].find((p) => p && fs.existsSync(p));
if (!EDGE) { console.error('No encontré Edge ni Chrome (usa NAVEGADOR=<ruta>)'); process.exit(2); }
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'probar_'));
const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=0', ...(process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []), `--user-data-dir=${perfil}`, '--no-first-run', '--disable-extensions', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
let puerto = 0, objetivos = null;
for (let i = 0; i < 120 && !objetivos; i++) {
  try { if (!puerto) puerto = Number(fs.readFileSync(path.join(perfil, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]); if (puerto) objetivos = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json(); } catch { /* aún no */ }
  if (!objetivos) await sleep(250);
}
const ws = new WebSocket(objetivos.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0; const pend = {}; let cargada = null; let consola = []; const recursos = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; return; }
  const p = m.params || {};
  if (m.method === 'Page.loadEventFired' && cargada) cargada();
  if (m.method === 'Runtime.exceptionThrown') consola.push('Excepción: ' + (p.exceptionDetails.exception?.description || p.exceptionDetails.text).split('\n')[0]);
  if (m.method === 'Runtime.consoleAPICalled' && p.type === 'error') consola.push(p.args.map((a) => a.value ?? a.description).join(' '));
  if (m.method === 'Network.responseReceived' && p.response.status >= 400) recursos.push(p.response.status + ' ' + p.response.url);
});
const cdp = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pend[id] = (m) => (m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id, method, params })); });
const js = async (e) => { const r = await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');

let fallas = 0;
const ok = (cond, texto) => { console.log((cond ? '  ✓ ' : '  ✗ ') + texto); if (!cond) fallas++; };
async function abrir(w, h, movil, reducir, hash) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: movil });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: movil });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reducir ? 'reduce' : 'no-preference' }] });
  const listo = new Promise((r) => { cargada = r; setTimeout(r, 15000); });
  await cdp('Page.navigate', { url: url + (hash || '') });
  await listo; cargada = null;
  for (let i = 0; i < 60; i++) { try { if (await js("document.documentElement.classList.contains('lista') && document.querySelectorAll('.actor').length === 12 && document.documentElement.classList.contains('navegado')")) break; } catch { /* navegando */ } await sleep(250); }
  await sleep(700);
}
const W = (ms) => `new Promise(r => setTimeout(r, ${ms}))`;

const clicEn = async (x, y) => {
  // Un punto del piso llevado a coordenadas de pantalla, y un clic de verdad ahí
  const c = await js(`(() => { const s = document.querySelector('#svg-escena'), r = s.getBoundingClientRect(), vb = s.viewBox.baseVal;
    const sx = (${x} - ${y}) * 32, sy = (${x} + ${y}) * 16; return [r.left + (sx - vb.x) * r.width / vb.width, r.top + (sy - vb.y) * r.height / vb.height]; })()`);
  for (const t of ['mousePressed', 'mouseReleased']) await cdp('Input.dispatchMouseEvent', { type: t, x: c[0], y: c[1], button: 'left', clickCount: 1, pointerType: 'mouse' });
  await sleep(300);
  return js("document.querySelector('#panel').hidden ? 'panel cerrado' : document.querySelector('#panel-titulo')?.textContent");
};
const enSala = () => js("!document.querySelector('#sala').hidden && document.body.classList.contains('en-sala')");

for (const [w, h, movil] of [[1440, 900, false], [1366, 768, false], [375, 812, true]]) {
  console.log(`\n${w}×${h}${movil ? ' (celular)' : ''}`);
  consola = [];
  await abrir(w, h, movil, false);
  await js("try{localStorage.clear()}catch(e){}; true"); await abrir(w, h, movil, false);
  ok(await js("!document.querySelector('#intro').hidden"), 'la bienvenida aparece en la primera visita');
  ok(await js('document.documentElement.scrollWidth <= innerWidth'), 'sin desborde horizontal');
  ok(await js("document.querySelectorAll('#recorrer [data-id]').length === 30"), 'el menú lista 10 integrantes, 2 mascotas, 10 lugares de la oficina y 8 del barrio (' + await js("document.querySelectorAll('#recorrer [data-id]').length") + ')');
  ok(await js("document.querySelectorAll('.actor').length === 12"), 'los 10 integrantes y las 2 mascotas están en la escena');
  ok(await js("document.querySelectorAll('.barrio-atras .local[data-local]').length === 7 && document.querySelectorAll('.caminante').length === 2"), 'la calle principal tiene sus 7 locales cerrados y 2 personas caminando por la vereda');
  ok(await js("[...document.querySelectorAll('.barrio-atras image')].map(i => i.getAttribute('href')).sort().join() === 'media/salas/logo-fundos.webp,media/salas/logo-haru.webp,media/salas/logo-nuhome.webp'"), 'los techos de Fundos, Haru y Nu Home llevan su logo real');
  ok(await js("!document.querySelector('.barrio').innerHTML.includes('§') && !document.querySelector('.hq-cerrada').innerHTML.includes('§')"), 'no queda ninguna marca §…§ sin reemplazar en el barrio');
  ok(await js("!document.querySelector('#svg-escena').classList.contains('oficina-abierta') && getComputedStyle(document.querySelector('.piso-0')).display === 'none' && getComputedStyle(document.querySelector('.hq-cerrada')).opacity === '1'"), 'la oficina parte cerrada: se ve su techo y el interior no se dibuja');
  ok(await js("document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.piso-0')).length === 0"), 'con la oficina cerrada, el equipo no se anima');
  ok(await js("[...document.querySelectorAll('button, a[href]')].every(b => { const r = b.getBoundingClientRect(); return r.width === 0 || (r.width >= 24 && r.height >= 24); })"), 'todo botón o enlace visible mide al menos 24 px');
  // Recorrido guiado completo
  const pasos = await js(`(async () => { document.querySelector('#intro-guia').click(); await ${W(300)}; const t = [], dentro = [];
    for (let i = 0; i < 20; i++) { t.push(document.querySelector('#guia-t').textContent); dentro.push(document.querySelector('#svg-escena').classList.contains('oficina-abierta')); document.querySelector('#guia-sig').click(); await ${W(120)}; }
    return { t, dentro, oculto: document.querySelector('#guia').hidden, intro: document.querySelector('#intro').hidden, chat: !!document.querySelector('#panel:not([hidden]) .chat') }; })()`);
  ok(pasos.t.length === 20 && pasos.oculto && pasos.intro && pasos.t[0] === 'BiPlot HQ' && pasos.t.includes('El pasaje') && pasos.t[19] === 'Tu proyecto aquí', 'el recorrido guiado pasa por 20 paradas, de la oficina cerrada a la calle (' + pasos.t[0] + ' → ' + pasos.t[19] + ')');
  ok(!pasos.dentro[0] && pasos.dentro.slice(1, 12).every(Boolean) && pasos.dentro.slice(12).every((d) => !d), 'el recorrido entra a la oficina en la recepción y sale a la calle en el pasaje');
  ok(pasos.chat, 'al terminar el recorrido se abre la conversación con Plotty');
  // Cada entrada del menú abre su panel con título (las salas de las empresas, con su vista de sala)
  const paneles = await js(`(async () => { const r = []; for (const b of document.querySelectorAll('#recorrer [data-id]')) {
      b.click(); await ${W(160)}; const t = document.querySelector('#panel-titulo'); r.push([b.dataset.id, t ? t.textContent : null, !document.querySelector('#panel').hidden]); }
    return r; })()`);
  ok(paneles.every((p) => p[1] && p[2]), 'las 30 entradas del menú abren su panel con título' + (paneles.every((p) => p[1] && p[2]) ? '' : ': ' + paneles.filter((p) => !p[1]).map((p) => p[0]).join(', ')));
  const desb = await js("document.querySelector('#panel-cuerpo').scrollWidth <= document.querySelector('#panel-cuerpo').clientWidth + 1");
  ok(desb, 'el panel no desborda a lo ancho');
  ok(await js(`(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(100)}; return document.querySelector('#panel').hidden; })()`), 'Escape cierra el panel');
  // Buscador y filtros del barrio
  const busca = await js(`(async () => { const i = document.querySelector('#busca-barrio'); i.value = 'restaurante'; i.dispatchEvent(new Event('input', { bubbles: true })); await ${W(50)};
    const r = [...document.querySelectorAll('#recorrer .menu-calle:not([hidden]) li:not([hidden]) b')].map(b => b.textContent); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); return r; })()`);
  ok(busca.length === 1 && busca[0] === 'Haru 360', 'el buscador del barrio encuentra por rubro (' + busca.join(', ') + ')');
  // Teclado sobre la escena
  ok(await js(`(async () => { const s = document.querySelector('#svg-escena'), e = document.querySelector('#escena'); e.focus(); const a = s.getAttribute('viewBox');
      e.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); e.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true })); await ${W(60)};
      return a !== s.getAttribute('viewBox'); })()`), 'las flechas y + mueven la cámara');
  // Pausa
  ok(await js(`(async () => { const b = document.querySelector('#controles [data-accion="pausa"]'); b.click(); await ${W(60)};
      const r = document.documentElement.classList.contains('oficina-quieta') && b.getAttribute('aria-pressed') === 'true'; b.click(); return r; })()`), 'el botón de pausa detiene la animación');
  // Clic real sobre la oficina cerrada (entra), sobre una sala de adentro y sobre un local de la calle (su vista previa)
  await js(`(async () => { document.querySelector('#panel-cerrar').click(); if (document.querySelector('#svg-escena').classList.contains('oficina-abierta')) document.querySelector('#salir-oficina').click(); document.querySelector('#controles [data-accion="todo"]').click(); await ${W(900)}; return true; })()`);
  const tOficina = await clicEn(8.0, 6.0);
  await sleep(1100);
  ok(tOficina === 'panel cerrado' && await js("document.querySelector('#svg-escena').classList.contains('oficina-abierta') && location.hash === '#oficina' && !document.querySelector('#salir-oficina').hidden"), 'un clic sobre la oficina cerrada entra (se abre, #oficina y «Salir a la calle»)');
  // (en celular la cámara entra de cerca a la recepción: se encuadra todo para alcanzar Planos, al fondo)
  if (movil) await js(`(async () => { document.querySelector('#controles [data-accion="todo"]').click(); await ${W(900)}; for (let i = 0; i < 3; i++) { document.querySelector('#svg-escena').dispatchEvent(new WheelEvent('wheel', { deltaY: -240, clientX: innerWidth / 2, clientY: innerHeight / 2, bubbles: true, cancelable: true })); await ${W(40)}; } return true; })()`);
  // (un punto del piso de Planos lejos de las rutas del equipo, para que no lo tape nadie caminando)
  const tPlanos = await clicEn(5.0, 4.0);
  ok(tPlanos === 'Uno dibuja, el otro construye', 'adentro, un clic sobre el piso de Planos y máquinas abre su sala (' + tPlanos + ')');
  ok(await js(`(async () => { document.querySelector('#panel-cerrar').click(); await ${W(80)}; history.back(); await ${W(900)};
      return !document.querySelector('#svg-escena').classList.contains('oficina-abierta') && !location.hash && document.querySelector('#salir-oficina').hidden; })()`), 'el botón atrás del navegador sale de la oficina a la calle');
  await js(`(async () => { document.querySelector('#controles [data-accion="todo"]').click(); await ${W(900)}; return true; })()`);
  // El pasaje lleva a la puerta de la oficina; su tótem, al directorio del barrio
  await clicEn(19.8, 21.8); await sleep(900);
  ok(await js("document.querySelector('#svg-escena').classList.contains('oficina-abierta')"), 'un clic sobre el pasaje también entra a la oficina');
  await js(`(async () => { document.querySelector('#salir-oficina').click(); await ${W(700)}; document.querySelector('#controles [data-accion="todo"]').click(); await ${W(900)}; return true; })()`);
  const tTotem = await clicEn(23.15, 23.78);
  ok(tTotem === 'La calle de los proyectos', 'un clic sobre el tótem del pasaje abre el directorio (' + tTotem + ')');
  await js(`(async () => { document.querySelector('#panel-cerrar').click(); document.querySelector('#controles [data-accion="todo"]').click(); await ${W(900)}; return true; })()`);
  const tHaru = await clicEn(11.8, 22.3);
  await sleep(900);
  ok(tHaru === 'Haru 360' && !(await enSala()) && !(await js('location.hash')) && await js("!!document.querySelector('#panel [data-entrar=\"haru\"]')"), 'un clic sobre el local de Haru abre su vista previa, con «Entrar a la sala» (' + tHaru + ')');
  await js(`(async () => { document.querySelector('#panel [data-entrar="haru"]').click(); await ${W(1300)}; return true; })()`);
  ok(await enSala() && (await js('location.hash')) === '#haru', '«Entrar a la sala» abre la sala de Haru (' + await js('location.hash') + ')');
  const pin = await js(`(async () => { document.querySelector('#sala-dibujo-caja .pin[data-pin="3"]').dispatchEvent(new MouseEvent('click', { bubbles: true })); await ${W(150)};
    const img = document.querySelector('.visor img'); return { src: img ? img.getAttribute('src') : '', activo: document.querySelector('#sala-dibujo-caja .pin.activo')?.dataset.pin, tira: document.querySelector('.tira [aria-pressed="true"]')?.dataset.pin }; })()`);
  ok(/media\/salas\/haru-3-comandas\.webp$/.test(pin.src) && pin.activo === '3' && pin.tira === '3', 'el punto 3 de la sala muestra la pantalla real de las comandas');
  ok(await js("[...document.querySelectorAll('.visor img, .tira img')].every(i => i.complete && i.naturalWidth > 0)"), 'las pantallas reales de la sala cargan');
  ok(await js("!!document.querySelector('#panel .enlace-copia code') && document.querySelector('#panel .enlace-copia code').textContent === 'biplot.cl/oficina/haru'"), 'la sala muestra su enlace para compartir');
  const vecina = await js(`(async () => { document.querySelector('#sala-sig').click(); await ${W(400)}; return [document.querySelector('#panel-titulo').textContent, location.hash]; })()`);
  ok(vecina[0] === 'Eleven 360' && vecina[1] === '#eleven', 'el botón de la sala vecina pasa a Eleven 360');
  const sinImg = await js("!!document.querySelector('.visor svg.visor-sala use')");
  ok(sinImg, 'en una sala sin capturas, el punto muestra su rincón de la sala');
  ok(await js(`(async () => { document.querySelector('#sala-volver').click(); await ${W(300)}; return document.querySelector('#sala').hidden && !location.hash && document.querySelector('#panel').hidden; })()`), '«Volver a la calle» cierra la sala y limpia la dirección');
  // El chat de Plotty: el rubro lleva la cámara a la calle, tres respuestas, WhatsApp y la vitrina para el rubro
  const chat = await js(`(async () => { document.querySelector('#recorrer [data-chat]').click(); await ${W(200)};
    document.querySelector('.chat-opciones [data-v="inmobiliaria"]').click(); await ${W(80)};
    const marcado = [...document.querySelectorAll('.capa-resalte .resalte')].length, msj = document.querySelector('.chat-mensajes').children[3]?.textContent || '';
    for (const v of ['planillas', '5a15']) { document.querySelector('.chat-opciones [data-v="' + v + '"]').click(); await ${W(80)}; }
    const a = document.querySelector('.chat-fin .bp-cta'); return { wa: a ? a.href : '', vitrina: document.querySelector('.vitrina-dinamica').textContent, califica: !!document.querySelector('.chat.califica'), marcado, msj }; })()`);
  ok(chat.marcado >= 1 && /Fundos 360/.test(chat.msj), 'con el rubro, Plotty marca en la calle los casos como el tuyo (' + chat.msj + ')');
  ok(/^https:\/\/wa\.me\/\d+\?text=.*inmobiliaria/.test(chat.wa) && chat.califica, 'Plotty hace las tres preguntas y arma el mensaje de WhatsApp');
  ok(/Fundos 360/.test(chat.vitrina) && /Nu Home 360/.test(chat.vitrina), 'la vitrina de la recepción muestra los casos del rubro (' + chat.vitrina.replace(/\s+/g, ' ').trim() + ')');
  // El Archivo y su buscador
  const archivo = await js(`(async () => { document.querySelector('#panel-cerrar').click(); document.querySelector('#recorrer [data-id="archivo"]').click(); await ${W(200)};
    const n = document.querySelectorAll('.archivo-grupo li').length, i = document.querySelector('.archivo-busca input'); i.value = 'gimnasio'; i.dispatchEvent(new Event('input', { bubbles: true })); await ${W(50)};
    return { n, vis: [...document.querySelectorAll('.archivo-grupo:not([hidden]) li:not([hidden]) b')].map(b => b.textContent) }; })()`);
  ok(archivo.n === 5 && archivo.vis.join() === 'Eleven 360', 'El Archivo lista los 5 casos por rubro y los busca (' + archivo.vis.join(', ') + ')');
  // Entrar desde el menú y salir con Escape; la vista previa de un local sin video muestra su sala dibujada
  const entra = await js(`(async () => { document.querySelector('#panel-cerrar').click(); await ${W(60)};
    const b = document.querySelector('#recorrer [data-oficina]'); if (document.querySelector('#recorrer').classList.contains('cerrado')) document.querySelector('#recorrer-toggle').click(); b.click(); await ${W(900)};
    const s = document.querySelector('#svg-escena'), dentro = s.classList.contains('oficina-abierta') && getComputedStyle(document.querySelector('.piso-0')).display !== 'none', texto = b.querySelector('.txt').textContent;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(900)};
    return { dentro, texto, fuera: !s.classList.contains('oficina-abierta') && getComputedStyle(document.querySelector('.piso-0')).display === 'none' }; })()`);
  ok(entra.dentro && entra.texto === 'Salir a la calle' && entra.fuera, '«Entrar a la oficina» en el menú la abre y Escape la vuelve a cerrar');
  const vista = await js(`(async () => { document.querySelector('#recorrer [data-id="eleven"]').click(); for (let i = 0; i < 40 && !document.querySelector('.vista-sala svg'); i++) await ${W(100)};
    return { titulo: document.querySelector('#panel-titulo')?.textContent, sala: !!document.querySelector('.vista-sala svg use'), entrar: !!document.querySelector('#panel [data-entrar="eleven"]') }; })()`);
  ok(vista.titulo === 'Eleven 360' && vista.sala && vista.entrar, 'la vista previa de Eleven 360 (sin video) muestra su sala dibujada y el botón para entrar');
  // Enlaces directos
  await abrir(w, h, movil, false, '#oficina');
  ok(await js("document.querySelector('#svg-escena').classList.contains('oficina-abierta') && document.querySelector('#panel').hidden"), 'oficina/#oficina entra a la oficina');
  await abrir(w, h, movil, false, '#lupe');
  ok((await js("document.querySelector('#panel-titulo')?.textContent")) === 'Lupe' && await js("document.querySelector('#svg-escena').classList.contains('oficina-abierta')"), 'oficina/#lupe entra a la oficina y abre la ficha de Lupe');
  await abrir(w, h, movil, false, '#nuhome');
  await sleep(600);
  ok((await js("document.querySelector('#panel-titulo')?.textContent")) === 'Nu Home 360' && await enSala(), 'oficina/#nuhome abre la sala de Nu Home');
  await abrir(w, h, movil, false, '#archivo');
  ok((await js("document.querySelector('#panel-titulo')?.textContent")) === 'Todos los casos tienen su carpeta', 'oficina/#archivo abre El Archivo');
  await abrir(w, h, movil, false, '#conversar');
  ok((await js("!!document.querySelector('#panel:not([hidden]) .chat') && document.querySelector('#svg-escena').classList.contains('oficina-abierta')")), 'oficina/#conversar entra y abre la conversación con Plotty');
  // La página para compartir de una sala lleva a la oficina, dentro de la sala
  {
    const listo = new Promise((r) => { cargada = r; setTimeout(r, 15000); });
    await cdp('Page.navigate', { url: url + 'haru/' });
    await listo; cargada = null;
    for (let i = 0; i < 60; i++) { try { if (await js("location.hash === '#haru' && document.documentElement.classList.contains('lista')")) break; } catch { /* navegando */ } await sleep(250); }
    await sleep(900);
    ok((await js("document.querySelector('#panel-titulo')?.textContent")) === 'Haru 360' && await enSala(), 'biplot.cl/oficina/haru/ lleva a la oficina, dentro de la sala de Haru');
    const og = fs.readFileSync(path.join(raiz, 'oficina', 'haru', 'index.html'), 'utf8');
    ok(/og:image" content="https:\/\/biplot\.cl\/oficina\/kit\/png\/sala-haru-og\.png"/.test(og) && fs.existsSync(path.join(raiz, 'oficina', 'kit', 'png', 'sala-haru-og.png')), 'la página de Haru trae su vista previa para compartir');
  }
  ok(consola.length === 0, 'sin errores de consola' + (consola.length ? ': ' + [...new Set(consola)].join(' | ') : ''));
}

// Las calles por rubro, con casos de prueba que sólo existen en el navegador de la prueba
console.log('\nCalles por rubro (casos de prueba)');
{
  const prueba = `(function () { var g; Object.defineProperty(window, 'OFICINA_DATOS', { configurable: true, get: function () { return g; }, set: function (D) {
    function c(o) { var x = { puntos: [], enlaces: [], equipo: ['lupe'], esencia: 'Caso de prueba.', resumen: 'Caso de prueba.' }; for (var k in o) x[k] = o[k]; return x; }
    D.proyectos.push(c({ id: 'prueba-a', nombre: 'Clínica de Prueba', rubro: 'Clínica dental · Arica', calle: 'salud', plantilla: 'clinica', fase: 'E9', acento: '#3E9C95' }),
      c({ id: 'prueba-b', nombre: 'Óptica de Prueba', rubro: 'Óptica', calle: 'salud', plantilla: 'basica', fase: 'E5', acento: '#8E6BB8' }),
      c({ id: 'prueba-c', nombre: 'Taller de Prueba', rubro: 'Taller mecánico · Arica', calle: 'servicios', plantilla: 'taller', fase: 'E7', acento: '#E0524A' }),
      c({ id: 'prueba-d', nombre: 'Nombre reservado', rubro: 'Distribuidora de alimentos · Iquique', calle: 'comercio', fase: 'E1', permiso: 'rubro', acento: '#35679A' }),
      c({ id: 'prueba-e', nombre: 'Sólo archivo', rubro: 'Minería', calle: 'otro', permiso: 'archivo', acento: '#6B7A8C' }));
    g = D; } }); })();`;
  const { identifier } = await cdp('Page.addScriptToEvaluateOnNewDocument', { source: prueba });
  consola = [];
  await abrir(1440, 900, false, false);
  const r = await js(`(async () => {
    const filas = [...document.querySelectorAll('.barrio .fila')].map(f => f.dataset.calle), locales = [...document.querySelectorAll('.fila .local')].map(l => l.dataset.local);
    const texto = document.querySelector('.barrio-filas').textContent, marcas = document.querySelector('.barrio-filas').innerHTML.includes('§');
    document.querySelector('#recorrer [data-id="prueba-c"]').click(); for (let i = 0; i < 40 && !document.querySelector('.vista-local svg'); i++) await ${W(100)};
    const titulo = document.querySelector('#panel-titulo').textContent, fase = document.querySelector('#panel .fases-mini')?.textContent, adentro = !!document.querySelector('.vista-local svg use');
    document.querySelector('#recorrer [data-id="archivo"]').click(); await ${W(200)};
    const archivo = [...document.querySelectorAll('.archivo-grupo li b')].map(b => b.textContent);
    const menu = [...document.querySelectorAll('#recorrer [data-id]')].map(b => b.dataset.id);
    return { filas, locales, titulo, fase, adentro, marcas, archivo, menu, anonimo: texto.includes('Nombre reservado'), letrero: texto.includes('DISTRIBUIDORA DE ALIMENTOS'), reservado: menu.includes('prueba-e') }; })()`);
  ok(r.filas.join() === 'salud,servicios,comercio', 'cada rubro abre su calle, en el orden en que llegó su primer caso (' + r.filas.join(', ') + ')');
  ok(r.locales.join() === 'prueba-a,prueba-b,libre-salud,prueba-c,libre-servicios,prueba-d,libre-comercio', 'cada calle termina con un local que se arrienda');
  ok(!r.marcas, 'los techos de las calles por rubro no dejan marcas §…§ sin reemplazar');
  ok(r.titulo === 'Taller de Prueba' && /E7/.test(r.fase || ''), 'el local de un caso con plantilla abre su panel con su fase (' + r.titulo + ', ' + r.fase + ')');
  ok(r.adentro, 'la vista previa de un caso muestra su local por dentro (locales.js)');
  ok(!r.anonimo && r.letrero, 'un caso sin permiso para su nombre muestra sólo su rubro');
  ok(r.archivo.includes('Sólo archivo') && !r.reservado, 'un caso «sólo en El Archivo» no tiene local, pero está en El Archivo');
  ok(consola.length === 0, 'sin errores de consola' + (consola.length ? ': ' + [...new Set(consola)].join(' | ') : ''));
  await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier });
}

console.log('\nMovimiento reducido');
await abrir(1440, 900, false, true);
ok(await js("getComputedStyle(document.querySelector('.pj-cuerpo')).animationName === 'none'"), 'el personal queda quieto');
ok(await js("document.querySelector('#controles [data-accion=\"pausa\"]').getAttribute('aria-pressed') === 'true'"), 'la animación parte pausada');

console.log('\nRecursos con error: ' + (recursos.length ? [...new Set(recursos)].join(', ') : 'ninguno'));
if (recursos.length) fallas++;
console.log(fallas ? `\n${fallas} prueba(s) fallaron` : '\nTodo OK');
try { ws.close(); } catch { /* */ }
edge.kill(); servidor.close(); await sleep(400);
for (let i = 0; i < 5; i++) { try { fs.rmSync(perfil, { recursive: true, force: true }); break; } catch { await sleep(300); } }
process.exit(fallas ? 1 : 0);
