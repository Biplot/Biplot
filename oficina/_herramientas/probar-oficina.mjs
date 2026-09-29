#!/usr/bin/env node
// Prueba funcional de la oficina con Edge o Chrome sin interfaz (sin dependencias, Node 22+). Levanta su propio
// servidor estático sobre la raíz del repo y recorre la página en escritorio y celular: el barrio cerrado con los techos
// de cada empresa, la oficina que se abre al entrar (y se cierra con Escape y con el botón atrás), menú y buscador del
// barrio, recorrido guiado, el local que se abre al tocarlo (sin techo, con su gente caminando) con su vista previa y su
// sala (gente caminando, puntos, pantallas reales, volver), el chat de Plotty con la cámara en el rubro y la vitrina,
// El Archivo, teclado, enlaces directos (#oficina, #lupe, #nuhome, #archivo, #conversar y biplot.cl/oficina/haru y /nuhome),
// Escape, pausa, movimiento reducido, errores de consola y desborde horizontal. La sala propia de Nu Home: sin números ni
// panel, su barra, sus zonas (se iluminan y abren su tarjeta, que se cierra con la × y con Escape), su gente que habla,
// la cámara (rueda y teclado), el recorrido con una asesora, la tarjeta de BiPlot, las salas vecinas y el botón atrás.
// El Archivo, el museo de BiPlot: sus épocas (del papel a hoy) con su capítulo, las diez fases, sus casos con su sala, el
// fichero con su buscador, el pedestal libre y el recorrido con Pepa. La vista de frente: lo que es una imagen (un mural,
// una pizarra, una pantalla) se abre derecho y en grande con la sala oscurecida detrás (las diez fases y la línea de tiempo
// del museo, una pieza de cada sala, el diseñador de Nu Home con un clic de verdad) y el recorrido sigue detrás.
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
// El local abierto en la calle: su techo (el local cerrado) desvanecido, lo de adentro montado y quienes caminan
const localAbierto = (id) => js(`(async () => {
  for (let i = 0; i < 40 && !document.querySelector('.local-abierto[data-abierto="${id}"] .andante'); i++) await ${W(100)};
  await ${W(700)};
  const g = document.querySelector('.local-abierto[data-abierto="${id}"]'), c = [...document.querySelectorAll('.barrio .local[data-local]')].find(l => l.dataset.local === '${id}');
  return { abierto: !!g, techo: c ? getComputedStyle(c).opacity + ' ' + getComputedStyle(c).visibility : '', andan: g ? g.querySelectorAll('.andante').length : 0, marcas: g ? g.innerHTML.includes('§') : true }; })()`);
// Quienes caminan en un contenedor: cuántos son y si se movieron en un segundo y medio
const caminan = (sel) => js(`(async () => { const pos = () => [...document.querySelectorAll('${sel} .andante')].map(a => a.getAttribute('transform')).join();
  const a = pos(); await ${W(1500)}; return { n: document.querySelectorAll('${sel} .andante').length, movio: a !== pos() }; })()`);
const techosCerrados = () => js("!document.querySelector('.local-abierto') && [...document.querySelectorAll('.barrio .local[data-local]')].every(l => getComputedStyle(l).opacity === '1' && getComputedStyle(l).visibility === 'visible')");

// Lo que se espera de cada sala propia además de la de Nu Home (que se prueba en detalle más abajo)
const SALAS_PROPIAS = [
  { id: 'fundos', nombre: 'Fundos 360', barra: ['Fundos', 'INMOBILIARIA', 'Parcelas de 5.000 m²', 'Ver los proyectos', 'Recorrer con una ejecutiva'], letra: 'Cormorant Garamond',
    disenar: 'https://biplot.cl/propuestas/fundos-inmobiliaria/', zona: 'lote25', titulo: 'Lote 25', chips: '5.000 m² | $35.990.000 | Disponible',
    enlace: 'Verlo en el plano https://biplot.cl/propuestas/fundos-inmobiliaria/#lote-puerto-varas-25', paradas: 7, recorrido: ['La entrada', 'El mirador 360°'],
    ceja: 'Hecho con BiPlot', chip: 'A la medida', pantallas: 7, frente: 'malalcahuello', frenteT: 'Malalcahuello' },
  { id: 'haru', nombre: 'Haru 360', barra: ['Haru Isidora', 'SUSHI DE AUTOR · ARICA', 'Ver la carta', 'Recorrer con la anfitriona'], letra: 'Montserrat',
    disenar: 'https://haru-carta.vercel.app', zona: 'barra', titulo: 'Chinchorrero', chips: '$8.000 | Rolls de autor', enlace: 'Ver la carta https://haru-carta.vercel.app', paradas: 7, recorrido: ['La entrada', 'La barra de sushi'],
    ceja: 'Hecho con BiPlot', chip: 'En implementación', pantallas: 7, frente: 'carta', frenteT: 'Rolls de la casa' },
  { id: 'eleven', nombre: 'Eleven 360', barra: ['Eleven Club', 'FITNESS AND BXO', 'Ver planes', 'Recorrer con un coach'], letra: 'Anton',
    disenar: 'https://eleven-360.vercel.app/#planes', zona: 'clases', titulo: 'Power Jump', chips: 'Martes y jueves · 19:30 | 60 min | Incluida en tu plan',
    enlace: 'Ver planes https://eleven-360.vercel.app/#planes', paradas: 8,
    recorrido: ['La recepción', 'El peso libre'], ceja: 'Propuesta de BiPlot', chip: 'Propuesta', pantallas: 4, frente: 'horario', frenteT: 'Las clases de la semana' },
  { id: 'rumbo', nombre: 'Rumbo', barra: ['Rumbo', 'by BiPlot', 'Abrir Rumbo', 'Recorrer un día'], letra: 'Space Grotesk',
    disenar: 'https://rumbo.biplot.cl', zona: 'elefante', titulo: '¿Cómo te comes un elefante?', chips: 'Cría · Joven · Adulto · Sabio | Seis tipos', enlace: 'Abrir Rumbo https://rumbo.biplot.cl', paradas: 7,
    recorrido: ['Tu día', 'El ritual de mañana'], ceja: 'Hecho en BiPlot', chip: 'Publicado', pantallas: 3, frente: 'habitos', frenteT: 'Marca cada día y cuida tu racha' },
];

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
  await sleep(700);
  ok(await techosCerrados(), 'al cerrar el panel de un local, el local vuelve a cerrarse (con su techo)');
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
  const la = await localAbierto('haru');
  ok(la.abierto && la.techo === '0 hidden' && !la.marcas, 'y el local se abre: se va el techo y se ve por dentro (' + la.techo + ')');
  ok(await js("(() => { const e = [...document.querySelectorAll('.barrio .local[data-local]')].find(l => l.dataset.local === 'eleven'); return getComputedStyle(e).opacity < 0.5; })()"), 'el local vecino de la derecha se vuelve transparente para no tapar lo de adentro');
  const ch = await caminan('.local-abierto');
  ok(ch.n >= 1 && ch.movio, 'adentro del local alguien camina entre los muebles (' + ch.n + ')');
  // La pausa también detiene a quien camina adentro
  const pausa = await js(`(async () => { const b = document.querySelector('#controles [data-accion="pausa"]'); b.click(); await ${W(120)};
    const pos = () => [...document.querySelectorAll('.local-abierto .andante')].map(a => a.getAttribute('transform')).join(), a = pos(); await ${W(800)};
    const r = a === pos() && !document.querySelector('.local-abierto .andante.camina'); b.click(); return r; })()`);
  ok(pausa, 'con la animación pausada, quien camina en el local se detiene');
  await js(`(async () => { document.querySelector('#panel [data-entrar="haru"]').click(); await ${W(1300)}; return true; })()`);
  ok(await enSala() && (await js('location.hash')) === '#haru', '«Entrar a la sala» abre la sala de Haru (' + await js('location.hash') + ')');
  const cs = await caminan('#sala-dibujo');
  ok(cs.n === 2 && cs.movio, 'en la sala de Haru la gente camina (' + cs.n + ')');
  // Haru tiene su propia sala: sin números ni panel; la cocina muestra la pantalla real de las comandas
  const hr = await js(`(async () => { const b = document.querySelector('#sala-barra'), d = b.querySelector('a.sp-btn');
    const r = { propia: document.body.classList.contains('en-sala-propia') && document.querySelector('#panel').hidden && !document.querySelector('#sala-dibujo-caja .pin'),
      barra: !b.hidden ? b.textContent : '', disenar: d ? d.getAttribute('href') + ' ' + d.target : '' };
    const z = document.querySelector('.zona-sala[data-zona="cocina"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(300)};
    const img = document.querySelector('#sala-tarjeta .tarjeta-img img');
    if (img && !(img.complete && img.naturalWidth)) await new Promise((listo) => { img.onload = img.onerror = listo; setTimeout(listo, 4000); });
    r.t = document.querySelector('#sala-tarjeta-t')?.textContent; r.img = img ? img.getAttribute('src') : ''; r.carga = !!img && img.complete && img.naturalWidth > 0;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(120)};
    const bz = document.querySelector('.zona-sala[data-zona="biplot"]'); bz.focus(); bz.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(300)};
    r.comparte = document.querySelector('#sala-tarjeta .enlace-copia code')?.textContent;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(120)}; return r; })()`);
  ok(hr.propia && /Haru Isidora/.test(hr.barra) && /Recorrer con la anfitriona/.test(hr.barra) && hr.disenar === 'https://haru-carta.vercel.app _blank', 'la sala de Haru es su propia sala: sin números ni panel, con su barra y «Ver la carta»');
  ok(hr.t === 'Comandas sin papel' && /media\/salas\/haru-3-comandas\.webp$/.test(hr.img) && hr.carga, 'la cocina abre su tarjeta con la pantalla real de las comandas, y la pantalla carga');
  ok(hr.comparte === 'biplot.cl/oficina/haru', 'su rincón de BiPlot trae el enlace para compartir la sala');
  const vecina = await js(`(async () => { document.querySelector('#sala-sig').click(); await ${W(500)};
    return [document.querySelector('#sala-nombre').textContent, location.hash, document.body.classList.contains('en-sala-propia') && document.querySelector('#panel').hidden]; })()`);
  ok(vecina[0] === 'Eleven 360' && vecina[1] === '#eleven' && vecina[2], 'el botón de la sala vecina pasa a la sala de Eleven 360');
  ok(await js(`(async () => { document.querySelector('#sala-volver').click(); await ${W(300)}; return document.querySelector('#sala').hidden && !location.hash && document.querySelector('#panel').hidden; })()`), '«Volver a la calle» cierra la sala y limpia la dirección');
  await sleep(700);
  ok(await techosCerrados() && await js("!document.querySelector('#sala-dibujo .andante')"), 'y el local vuelve a cerrarse');
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
    for (let k = 0; k < 40 && !document.querySelector('#panel .vista-sala svg'); k++) await ${W(100)};
    return { n, vis: [...document.querySelectorAll('.archivo-grupo:not([hidden]) li:not([hidden]) b')].map(b => b.textContent), titulo: document.querySelector('#panel-titulo')?.textContent,
      museo: !!document.querySelector('#panel .vista-sala svg use'), entrar: !!document.querySelector('#panel [data-entrar="archivo"]') }; })()`);
  ok(archivo.n === 5 && archivo.vis.join() === 'Eleven 360', 'El Archivo lista los 5 casos por rubro y los busca (' + archivo.vis.join(', ') + ')');
  ok(archivo.titulo === 'El museo de BiPlot' && archivo.museo && archivo.entrar, 'desde la calle, El Archivo muestra el museo dibujado y «Entrar al museo»');
  // Entrar desde el menú y salir con Escape; la vista previa de un local sin video muestra su sala dibujada
  const entra = await js(`(async () => { document.querySelector('#panel-cerrar').click(); await ${W(60)};
    const b = document.querySelector('#recorrer [data-oficina]'); if (document.querySelector('#recorrer').classList.contains('cerrado')) document.querySelector('#recorrer-toggle').click(); b.click(); await ${W(900)};
    const s = document.querySelector('#svg-escena'), dentro = s.classList.contains('oficina-abierta') && getComputedStyle(document.querySelector('.piso-0')).display !== 'none', texto = b.querySelector('.txt').textContent;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(900)};
    return { dentro, texto, fuera: !s.classList.contains('oficina-abierta') && getComputedStyle(document.querySelector('.piso-0')).display === 'none' }; })()`);
  ok(entra.dentro && entra.texto === 'Salir a la calle' && entra.fuera, '«Entrar a la oficina» en el menú la abre y Escape la vuelve a cerrar');
  const cierra = await js(`(async () => { document.querySelector('#recorrer [data-id="fundos"]').click();
    for (let i = 0; i < 40 && !document.querySelector('.local-abierto[data-abierto="fundos"]'); i++) await ${W(100)};
    const abierto = !!document.querySelector('.local-abierto[data-abierto="fundos"]');
    document.querySelector('#recorrer [data-oficina]').click(); await ${W(900)};
    const r = abierto && !document.querySelector('.local-abierto') && document.querySelector('#svg-escena').classList.contains('oficina-abierta');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(900)}; return r; })()`);
  ok(cierra, 'al entrar a la oficina, el local que estaba abierto se cierra');
  const vista = await js(`(async () => { document.querySelector('#recorrer [data-id="eleven"]').click(); for (let i = 0; i < 40 && !document.querySelector('.vista-sala svg'); i++) await ${W(100)};
    return { titulo: document.querySelector('#panel-titulo')?.textContent, sala: !!document.querySelector('.vista-sala svg use'), entrar: !!document.querySelector('#panel [data-entrar="eleven"]') }; })()`);
  ok(vista.titulo === 'Eleven 360' && vista.sala && vista.entrar, 'la vista previa de Eleven 360 (sin video) muestra su sala dibujada y el botón para entrar');
  // Enlaces directos
  await abrir(w, h, movil, false, '#oficina');
  ok(await js("document.querySelector('#svg-escena').classList.contains('oficina-abierta') && document.querySelector('#panel').hidden"), 'oficina/#oficina entra a la oficina');
  await abrir(w, h, movil, false, '#lupe');
  ok((await js("document.querySelector('#panel-titulo')?.textContent")) === 'Lupe' && await js("document.querySelector('#svg-escena').classList.contains('oficina-abierta')"), 'oficina/#lupe entra a la oficina y abre la ficha de Lupe');
  // La sala propia de Nu Home: sin números ni panel, con su barra, sus zonas, su gente que habla, su recorrido y BiPlot en su rincón
  await abrir(w, h, movil, false, '#nuhome');
  await sleep(900);
  const nh = await js(`(() => { const b = document.querySelector('#sala-barra'), d = document.querySelector('#sala-barra a.sp-btn');
    return { sala: !document.querySelector('#sala').hidden && document.body.classList.contains('en-sala-propia'), nombre: document.querySelector('#sala-nombre').textContent,
      panel: document.querySelector('#panel').hidden, pines: document.querySelectorAll('#sala-dibujo-caja .pin').length, ayuda: getComputedStyle(document.querySelector('.sala-ayuda')).display,
      barra: !b.hidden ? b.textContent : '', disenar: d ? d.getAttribute('href') + ' ' + d.target : '', wa: [...document.querySelectorAll('#sala a')].some(a => /wa\\.me/.test(a.href)),
      zonas: [...document.querySelectorAll('.zona-sala')].map(z => z.dataset.zona),
      botones: [...document.querySelectorAll('.zona-sala, .quien-sala')].every(z => z.getAttribute('role') === 'button' && z.tabIndex === 0 && /\\w/.test(z.getAttribute('aria-label') || '')),
      quienes: document.querySelectorAll('.quien-sala').length, foco: document.activeElement.id, desborde: document.documentElement.scrollWidth > innerWidth }; })()`);
  ok(nh.sala && nh.nombre === 'Nu Home 360' && nh.panel && nh.pines === 0 && nh.ayuda === 'none', 'oficina/#nuhome abre la sala propia de Nu Home: sin números, sin panel y sin «Toca un número»');
  ok(/NÜHOME/.test(nh.barra) && /Vida & Hogar/.test(nh.barra) && /Casas modulares\. Pasa, recorre la casa piloto y conversa con nuestras asesoras\./.test(nh.barra) && /Recorrer con una asesora/.test(nh.barra) &&
    nh.disenar === 'https://nuhome-crm-nu.vercel.app/cotizador _blank' && !/Hablar con una asesora/.test(nh.barra) && !nh.wa, 'abajo va la barra de Nu Home: «Diseñar la mía» abre el cotizador en otra pestaña y, sin su WhatsApp, no hay «Hablar con una asesora» (ni el de BiPlot)');
  ok(nh.zonas.length === 13 && nh.zonas.includes('piloto') && nh.zonas.includes('biplot') && nh.quienes === 7 && nh.botones && nh.foco === 'sala-dibujo-caja', 'sus 13 zonas y sus 7 personas que hablan son botones con teclado y su nombre en español (' + nh.zonas.join(', ') + ')');
  ok(!nh.desborde, 'en la sala no hay desborde horizontal');
  // La gente habla sola: de a una o de a dos, con frases distintas
  const habla = await js(`(async () => { let max = 0, frases = new Set();
    for (let i = 0; i < 36; i++) { const v = [...document.querySelectorAll('#sala-capa .burbuja.visible')]; max = Math.max(max, v.length); v.forEach(b => frases.add(b.textContent)); await ${W(250)}; }
    return { max, frases: [...frases] }; })()`);
  ok(habla.frases.length >= 2 && habla.max >= 1 && habla.max <= 2, 'la gente habla sola en burbujas, de a una o de a dos (' + habla.frases.length + ' frases, ' + habla.max + ' a la vez)');
  // Tocar a alguien que habla muestra su frase (y se anuncia)
  const pos = (expr) => js(`(() => { const s = document.querySelector('.sala-svg'), vb = s.viewBox.baseVal, r = s.getBoundingClientRect(), p = ${expr};
    return [r.left + (p[0] - vb.x) * r.width / vb.width, r.top + (p[1] - vb.y) * r.height / vb.height]; })()`);
  const tocar = async (c) => { for (const t of ['mousePressed', 'mouseReleased']) await cdp('Input.dispatchMouseEvent', { type: t, x: c[0], y: c[1], button: 'left', clickCount: 1, pointerType: 'mouse' }); await sleep(350); };
  await tocar(await pos("(g => [g[0], g[1] - g[2] / 2])(window.Salas.salas.nuhome.gente.ejecutivo)"));
  ok(await js("[...document.querySelectorAll('#sala-capa .burbuja')].some(b => /¿Tienes terreno\\?/.test(b.textContent)) && /asesor de la terraza/.test(document.querySelector('#sala-aviso').textContent)"), 'al tocar al asesor de la terraza aparece su frase y se anuncia');
  // Una zona se ilumina con su nombre y abre su tarjeta junto a ella (en celular, desde abajo); se cierra con la × y con Escape
  await tocar(await pos("window.Salas.salas.nuhome.lugares.piloto"));
  await sleep(900);
  const tj = await js(`(() => { const t = document.querySelector('#sala-tarjeta'), z = document.querySelector('.zona-sala[data-zona="piloto"]');
    return { abierta: !t.hidden && t.classList.contains('empresa'), titulo: document.querySelector('#sala-tarjeta-t')?.textContent, chips: [...t.querySelectorAll('.tarjeta-chips li')].map(l => l.textContent).join(' | '),
      disenar: t.querySelector('a.sp-btn.negro')?.getAttribute('href'), hoja: t.classList.contains('hoja'), expandida: z.getAttribute('aria-expanded'), etiqueta: document.querySelector('.sala-etiqueta').textContent,
      brillo: document.querySelectorAll('.sala-resalte .resalte-linea').length, desborde: document.documentElement.scrollWidth > innerWidth,
      chicos: [...document.querySelectorAll('#sala-tarjeta button, #sala-tarjeta a, #sala-barra button, #sala-barra a')].filter(b => { const r = b.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); }).length }; })()`);
  ok(tj.abierta && tj.titulo === 'Un módulo de 6 m, con terraza y pérgola' && tj.chips === '6 × 2,5 m · 13,6 m² | Terraza 4 × 3 m | Pérgola 4 × 4 m' && tj.disenar === 'https://nuhome-crm-nu.vercel.app/cotizador' && tj.expandida === 'true',
    'al tocar la casa piloto se abre su tarjeta de Nu Home, con sus medidas y «Diseñar la mía»');
  ok(tj.etiqueta === 'Casa piloto' && tj.brillo >= 1 && tj.hoja === !!movil && !tj.desborde, 'la casa piloto se ilumina con su nombre, y la tarjeta va ' + (movil ? 'como hoja desde abajo' : 'a su lado'));
  ok(tj.chicos === 0, 'los botones de la barra y de la tarjeta miden al menos 44 px');
  ok(await js(`(async () => { document.querySelector('#sala-tarjeta .tarjeta-cerrar').click(); await ${W(120)}; return document.querySelector('#sala-tarjeta').hidden && document.querySelector('.zona-sala[data-zona="piloto"]').getAttribute('aria-expanded') === 'false'; })()`), 'la × cierra la tarjeta');
  const esc2 = await js(`(async () => { const z = document.querySelector('.zona-sala[data-zona="taller"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(250)};
    const img = document.querySelector('#sala-tarjeta .tarjeta-img img'), t = document.querySelector('#sala-tarjeta-t')?.textContent;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(120)};
    return { t, img: img ? img.getAttribute('src') : '', cerrada: document.querySelector('#sala-tarjeta').hidden, sigue: document.body.classList.contains('en-sala-propia') && location.hash === '#nuhome' }; })()`);
  ok(esc2.t === 'Así se arma tu casa' && /media\/salas\/nuhome-5-fabricacion\.webp$/.test(esc2.img) && esc2.cerrada && esc2.sigue, 'con teclado, el taller abre su tarjeta con la carta Gantt real, y Escape la cierra sin salir de la sala');
  // La pantalla del diseñador se abre de frente con un clic, con la sala oscurecida detrás; un clic en lo oscuro la cierra
  // (la cámara quedó donde la dejó el taller: con las flechas, la pantalla va hacia el centro hasta que un punto suyo se
  // vea y se pueda tocar, no bajo el menú ni fuera de la pantalla)
  const pd = await js(`(async () => { const p = document.querySelector('.zona-sala[data-zona="disenador"] polygon'), caja = document.querySelector('#sala-dibujo-caja');
    const libre = () => { const m = p.getScreenCTM(), v = Array.from({ length: p.points.numberOfItems }, (_, i) => { const q = new DOMPoint(p.points.getItem(i).x, p.points.getItem(i).y).matrixTransform(m); return [q.x, q.y]; });
      const c = [v.reduce((t, q) => t + q[0], 0) / v.length, v.reduce((t, q) => t + q[1], 0) / v.length];
      for (const q of [c, ...v.map((w) => [c[0] + (w[0] - c[0]) * 0.4, c[1] + (w[1] - c[1]) * 0.4])]) { const el = document.elementFromPoint(q[0], q[1]); if (el && caja.contains(el)) return { q, c }; }
      return { q: null, c }; };
    caja.focus();
    for (let k = 0; k < 24; k++) {
      const l = libre(); if (l.q) return l.q;
      const dx = l.c[0] - innerWidth / 2, dy = l.c[1] - innerHeight / 2;
      caja.dispatchEvent(new KeyboardEvent('keydown', { key: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'), bubbles: true })); await ${W(40)};
    }
    return null; })()`);
  if (pd) await tocar(pd);
  await sleep(400);
  const fd = await js(`(async () => { const f = document.querySelector('#sala-frente'), img = f.querySelector('.frente-marco img');
    if (img && !(img.complete && img.naturalWidth)) await new Promise((listo) => { img.onload = img.onerror = listo; setTimeout(listo, 4000); });
    return { abierta: !f.hidden, img: img ? img.getAttribute('src') : '', carga: !!img && img.naturalWidth > 0, t: document.querySelector('#sala-frente-t')?.textContent, foco: document.activeElement?.id,
      disenar: f.querySelector('a.sp-btn.negro')?.getAttribute('href'), desborde: document.documentElement.scrollWidth > innerWidth }; })()`);
  if (fd.abierta) {
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: 6, y: h - 6, button: 'left', clickCount: 1, pointerType: 'mouse' });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 6, y: h - 6, button: 'left', clickCount: 1, pointerType: 'mouse' });
    await sleep(250);
  }
  fd.cierra = await js("document.querySelector('#sala-frente').hidden && document.body.classList.contains('en-sala-propia') && location.hash === '#nuhome'");
  ok(fd.abierta && /media\/salas\/nuhome-1-disenador\.webp$/.test(fd.img) && fd.carga && fd.t === 'Diseña tu casa, pieza por pieza' && fd.foco === 'sala-frente-t' &&
    fd.disenar === 'https://nuhome-crm-nu.vercel.app/cotizador' && !fd.desborde && fd.cierra, 'un clic en el diseñador abre su pantalla real de frente, y un clic en lo oscuro la cierra');
  // La cámara de la sala: rueda, teclado y «ver toda la sala»
  const cam = await js(`(async () => { const s = document.querySelector('.sala-svg'), c = document.querySelector('#sala-dibujo-caja'), a = s.getAttribute('viewBox');
    c.dispatchEvent(new WheelEvent('wheel', { deltaY: -240, clientX: innerWidth / 2, clientY: innerHeight / 2, bubbles: true, cancelable: true })); await ${W(60)}; const b = s.getAttribute('viewBox');
    c.focus(); c.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true })); c.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); await ${W(60)}; const d = s.getAttribute('viewBox');
    const w = (v) => +v.split(' ')[2]; return { rueda: w(b) < w(a), teclado: d !== b && w(d) < w(b) }; })()`);
  ok(cam.rueda && cam.teclado, 'la sala se acerca con la rueda y se mueve y se acerca con el teclado');
  // «Recorrer con una asesora»: la cámara va zona por zona y la asesora habla en cada parada
  const rec = await js(`(async () => { document.querySelector('#controles [data-accion="todo"]').click(); await ${W(700)};
    document.querySelector('#sala-barra [data-recorrer]').click(); await ${W(1500)};
    const s = document.querySelector('.sala-svg'), p1 = { n: document.querySelector('[data-rec="n"]').textContent, t: document.querySelector('[data-rec="t"]').textContent, vb: s.getAttribute('viewBox'), b: document.querySelector('.burbuja.de-guia')?.textContent || '' };
    document.querySelector('#sala-barra [data-rec="sig"]').click(); await ${W(1600)};
    const p2 = { n: document.querySelector('[data-rec="n"]').textContent, t: document.querySelector('[data-rec="t"]').textContent, vb: s.getAttribute('viewBox'), b: document.querySelector('.burbuja.de-guia')?.textContent || '', ilumina: document.querySelectorAll('.sala-resalte .resalte-linea').length };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(150)};
    return { p1, p2, fin: !document.querySelector('#sala-barra').classList.contains('recorriendo') && !!document.querySelector('#sala-barra [data-recorrer]') && document.body.classList.contains('en-sala-propia') }; })()`);
  ok(rec.p1.n === '1 de 7' && rec.p1.t === 'La entrada' && /Te acompaño/.test(rec.p1.b) && rec.p2.n === '2 de 7' && rec.p2.t === 'La casa piloto' && /Asesora · Nu Home/.test(rec.p2.b) && rec.p2.vb !== rec.p1.vb && rec.p2.ilumina >= 1,
    'el recorrido con una asesora pasa de la entrada a la casa piloto: la cámara se mueve y la asesora habla (' + rec.p1.t + ' → ' + rec.p2.t + ')');
  ok(rec.fin, 'Escape termina el recorrido sin salir de la sala');
  // El rincón de BiPlot: su tarjeta, con todo lo del proyecto
  const bp = await js(`(async () => { const z = document.querySelector('.zona-sala[data-zona="biplot"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(300)};
    const t = document.querySelector('#sala-tarjeta'), tira = [...t.querySelectorAll('.tira-bp button')];
    tira[4].click(); await ${W(80)};
    return { bp: t.classList.contains('bp') && !t.hidden, texto: t.textContent, titulo: document.querySelector('#sala-tarjeta-t')?.textContent, chip: t.querySelector('h3 .chip')?.textContent,
      tira: tira.map(b => b.textContent), visor: t.querySelector('.visor img')?.getAttribute('src'), video: !!t.querySelector('video.panel-video'), equipo: t.querySelectorAll('.equipo a').length,
      comparte: t.querySelector('.enlace-copia code')?.textContent, hq: !!t.querySelector('[data-hq]'), desborde: document.documentElement.scrollWidth > innerWidth }; })()`);
  ok(bp.bp && /^Hecho con BiPlot/.test(bp.texto) && /^Nu Home 360/.test(bp.titulo) && bp.chip === 'En desarrollo' && bp.texto.includes('Nu Home 360 junta en una sola plataforma'), 'el rincón de BiPlot abre su tarjeta: «Hecho con BiPlot», Nu Home 360 «En desarrollo» y su resumen');
  ok(bp.tira.length === 7 && bp.tira.every((n) => n && !/^\s*\d|·/.test(n)) && bp.tira[0] === 'Diseñador 3D' && /nuhome-5-fabricacion\.webp$/.test(bp.visor || ''), 'sus pantallas reales van en una tira con el nombre de cada módulo, sin números (' + bp.tira.join(', ') + ')');
  ok(bp.video && bp.equipo === 9 && bp.comparte === 'biplot.cl/oficina/nuhome' && bp.hq && !bp.desborde, 'y trae el video, el equipo, «Comparte esta sala» y «Pasar a BiPlot HQ»');
  ok(await js(`(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(120)}; const t = document.querySelector('#sala-tarjeta').hidden;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(300)}; return t && document.querySelector('#sala').hidden && !location.hash; })()`), 'Escape cierra primero la tarjeta y después sale a la calle');
  // Las salas vecinas: de Nu Home a Fundos (otra sala propia, con su barra) y de vuelta
  await abrir(w, h, movil, false, '#nuhome');
  await sleep(700);
  const vec = await js(`(async () => { const estado = () => ({ hash: location.hash, propia: document.body.classList.contains('en-sala-propia'), panel: document.querySelector('#panel').hidden,
      pines: document.querySelectorAll('#sala-dibujo-caja .pin').length, barra: document.querySelector('#sala-barra').hidden ? '' : document.querySelector('#sala-barra').textContent, nombre: document.querySelector('#sala-nombre').textContent });
    document.querySelector('#sala-sig').click(); await ${W(500)}; const f = estado();
    document.querySelector('#sala-ant').click(); await ${W(500)}; return { f, n: estado() }; })()`);
  ok(vec.f.hash === '#fundos' && vec.f.propia && vec.f.panel && vec.f.pines === 0 && /Ver los proyectos/.test(vec.f.barra) && vec.f.nombre === 'Fundos 360' &&
    vec.n.hash === '#nuhome' && vec.n.propia && vec.n.panel && /Diseñar la mía/.test(vec.n.barra) && vec.n.nombre === 'Nu Home 360', 'el botón de la sala vecina pasa a la sala de Fundos 360, con su barra, y vuelve a la de Nu Home');
  // Las otras cuatro salas propias: su barra con su letra, todas sus zonas y su gente, una tarjeta con lo real, su recorrido y BiPlot en su rincón
  for (const s of SALAS_PROPIAS) {
    await abrir(w, h, movil, false, '#' + s.id);
    await sleep(900);
    const r = await js(`(async () => { const PP = window.OFICINA_DATOS.proyectos.find(p => p.id === '${s.id}').salaPropia, b = document.querySelector('#sala-barra'), d = b.querySelector('a.sp-btn');
      const zonas = [...document.querySelectorAll('.zona-sala')].map(z => z.dataset.zona), quienes = [...document.querySelectorAll('.quien-sala')].map(q => q.dataset.quien);
      const r = { sala: document.body.classList.contains('en-sala-propia') && document.querySelector('#panel').hidden && !document.querySelector('#sala-dibujo-caja .pin'), nombre: document.querySelector('#sala-nombre').textContent,
        barra: !b.hidden ? b.textContent : '', disenar: d ? d.getAttribute('href') + ' ' + d.target : '', wa: [...document.querySelectorAll('#sala a')].some(a => /wa\\.me/.test(a.href)),
        letra: getComputedStyle(b.querySelector('.sp-logo')).fontFamily, desborde: document.documentElement.scrollWidth > innerWidth,
        faltan: Object.keys(PP.zonas).filter(z => !zonas.includes(z)).concat([...new Set(PP.burbujas.map(x => x.quien))].filter(q => !quienes.includes(q))) };
      const t = document.querySelector('#sala-tarjeta'), z = document.querySelector('.zona-sala[data-zona="${s.zona}"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(300)};
      const img = t.querySelector('.tarjeta-img img');
      if (img && !(img.complete && img.naturalWidth)) await new Promise((listo) => { img.onload = img.onerror = listo; setTimeout(listo, 4000); });
      r.tj = { abierta: !t.hidden && t.classList.contains('empresa'), t: document.querySelector('#sala-tarjeta-t')?.textContent, chips: [...t.querySelectorAll('.tarjeta-chips li')].map(l => l.textContent).join(' | '),
        enlace: [...t.querySelectorAll('a.sp-btn')].map(a => a.textContent.replace(/ \\(se abre.*/, '') + ' ' + a.getAttribute('href')).join(' | '), carga: !img || (img.complete && img.naturalWidth > 0),
        hoja: t.classList.contains('hoja'), etiqueta: document.querySelector('.sala-etiqueta')?.textContent, desborde: document.documentElement.scrollWidth > innerWidth };
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(150)};
      // Lo que es una imagen se abre de frente, en grande, y la × la cierra
      const fz = document.querySelector('.zona-sala[data-zona="${s.frente}"]'), f = document.querySelector('#sala-frente'); fz.focus(); fz.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(300)};
      const fl = f.querySelector('.frente-lamina')?.getBoundingClientRect();
      r.fr = { abierta: !f.hidden && t.hidden, t: document.querySelector('#sala-frente-t')?.textContent, dib: !!f.querySelector('.frente-marco svg'), grande: !!fl && fl.width >= Math.min(innerWidth - 48, 600),
        desborde: document.documentElement.scrollWidth > innerWidth };
      f.querySelector('.frente-cerrar').click(); await ${W(150)};
      r.fr.cierra = f.hidden && document.activeElement === fz && document.body.classList.contains('en-sala-propia');
      const s = document.querySelector('.sala-svg'), rec = () => ({ n: document.querySelector('[data-rec="n"]').textContent, t: document.querySelector('[data-rec="t"]').textContent, vb: s.getAttribute('viewBox'),
        guia: document.querySelector('#sala-capa .burbuja.de-guia')?.textContent || '' });
      document.querySelector('#sala-barra [data-recorrer]').click(); await ${W(1500)}; const p1 = rec();
      document.querySelector('#sala-barra [data-rec="sig"]').click(); await ${W(1600)}; const p2 = rec();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(150)};
      r.rec = { p1, p2, esperado: PP.recorrido.slice(0, 2).map(p => PP.textos.guia + p.texto), fin: !document.querySelector('#sala-barra').classList.contains('recorriendo') && document.body.classList.contains('en-sala-propia') };
      const bz = document.querySelector('.zona-sala[data-zona="biplot"]'); bz.focus(); bz.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(300)};
      r.bp = { bp: t.classList.contains('bp') && !t.hidden, ceja: t.querySelector('.ceja')?.textContent, chip: t.querySelector('h3 .chip')?.textContent, tira: t.querySelectorAll('.tira-bp button').length,
        comparte: t.querySelector('.enlace-copia code')?.textContent, hq: !!t.querySelector('[data-hq]'), desborde: document.documentElement.scrollWidth > innerWidth };
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(120)}; return r; })()`);
    ok(r.sala && r.nombre === s.nombre && s.barra.every((x) => r.barra.includes(x)) && r.disenar === s.disenar + ' _blank' && !/Hablar|Escribir/.test(r.barra) && !r.wa && r.letra.includes(s.letra),
      `oficina/#${s.id} abre la sala propia de ${s.nombre}, con su barra en su letra (${s.letra}) y «${s.barra.at(-1)}»`);
    ok(!r.faltan.length && !r.desborde, `en la sala de ${s.nombre} están todas sus zonas y toda su gente` + (r.faltan.length ? ' (faltan: ' + r.faltan.join(', ') + ')' : ''));
    ok(r.tj.abierta && r.tj.t === s.titulo && r.tj.chips === s.chips && r.tj.enlace === s.enlace && r.tj.carga && r.tj.hoja === !!movil && !r.tj.desborde,
      `${s.zona} abre su tarjeta de ${s.nombre}: «${r.tj.t}» (${r.tj.chips})`);
    ok(r.fr.abierta && r.fr.t === s.frenteT && r.fr.dib && r.fr.grande && !r.fr.desborde && r.fr.cierra, `${s.frente} se abre de frente y en grande («${r.fr.t}»), y la × la cierra`);
    ok(r.rec.p1.n === '1 de ' + s.paradas && r.rec.p1.t === s.recorrido[0] && r.rec.p2.n === '2 de ' + s.paradas && r.rec.p2.t === s.recorrido[1] && r.rec.p2.vb !== r.rec.p1.vb &&
      r.rec.p1.guia === r.rec.esperado[0] && r.rec.p2.guia === r.rec.esperado[1] && r.rec.fin, `«${s.barra.at(-1)}» pasa de ${s.recorrido.join(' a ')}, y quien guía habla en cada parada`);
    ok(r.bp.bp && r.bp.ceja === s.ceja && r.bp.chip === s.chip && r.bp.tira === s.pantallas && r.bp.comparte === 'biplot.cl/oficina/' + s.id && r.bp.hq && !r.bp.desborde,
      `el rincón de BiPlot abre su tarjeta: «${r.bp.ceja}», ${s.nombre} «${r.bp.chip}» y ${r.bp.tira} pantallas`);
  }
  // Desde la calle: el local de Nu Home, «Entrar a la sala» y el botón atrás del navegador
  await abrir(w, h, movil, false);
  const atras = await js(`(async () => { document.querySelector('#recorrer [data-id="nuhome"]').click(); await ${W(400)}; document.querySelector('#panel [data-entrar="nuhome"]').click(); await ${W(1500)};
    const dentro = location.hash === '#nuhome' && document.body.classList.contains('en-sala-propia') && document.querySelector('#panel').hidden;
    history.back(); await ${W(900)};
    return dentro && document.querySelector('#sala').hidden && !location.hash && !document.body.classList.contains('en-sala-propia'); })()`);
  ok(atras, 'desde su local, «Entrar a la sala» abre la sala propia de Nu Home y el botón atrás vuelve a la calle');
  // «Pasar a BiPlot HQ» entra a la oficina
  await abrir(w, h, movil, false, '#nuhome');
  await sleep(700);
  ok(await js(`(async () => { const z = document.querySelector('.zona-sala[data-zona="biplot"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(300)};
      document.querySelector('#sala-tarjeta [data-hq]').click(); await ${W(1000)};
      return document.querySelector('#sala').hidden && document.querySelector('#svg-escena').classList.contains('oficina-abierta') && location.hash === '#oficina'; })()`), '«Pasar a BiPlot HQ» sale de la sala y entra a la oficina');
  // El Archivo, el museo de BiPlot: del papel a hoy, una pieza de cada desarrollo, el fichero y el pedestal libre
  await abrir(w, h, movil, false, '#archivo');
  await sleep(900);
  const ar = await js(`(async () => { const PP = window.OFICINA_DATOS.salas.archivo.salaPropia, b = document.querySelector('#sala-barra');
    const zonas = [...document.querySelectorAll('.zona-sala')].map(z => z.dataset.zona), quienes = [...document.querySelectorAll('.quien-sala')].map(q => q.dataset.quien);
    const r = { sala: document.body.classList.contains('en-sala-propia') && document.querySelector('#panel').hidden, nombre: document.querySelector('#sala-nombre').textContent, barra: b.hidden ? '' : b.textContent,
      ant: document.querySelector('#sala-ant').hidden ? '' : document.querySelector('#sala-ant span').textContent, sig: !document.querySelector('#sala-sig').hidden,
      faltan: Object.keys(PP.zonas).filter(z => !zonas.includes(z)).concat(PP.burbujas.map(x => x.quien).filter(q => !quienes.includes(q))), desborde: document.documentElement.scrollWidth > innerWidth };
    const t = document.querySelector('#sala-tarjeta'), abre = async (id) => { const z = document.querySelector('.zona-sala[data-zona="' + id + '"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(300)}; };
    const cierra = async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await ${W(150)}; };
    await abre('papel');
    r.papel = { t: document.querySelector('#sala-tarjeta-t')?.textContent, ceja: t.querySelector('.ceja')?.textContent, cap: [...t.querySelectorAll('a.sp-btn')].map(a => a.getAttribute('href') + ' ' + a.target).join() };
    await cierra(); await abre('hoy');
    // (lo que es una imagen se abre de frente, con la sala oscurecida detrás: se sigue viendo)
    const f = document.querySelector('#sala-frente'), fl = f.querySelector('.frente-lamina')?.getBoundingClientRect(), velo = f.querySelector('.frente-velo');
    const va = velo ? getComputedStyle(velo).backgroundColor.match(/[\d.]+/g) : null, alfa = va && va.length === 4 ? +va[3] : 1;
    r.hoy = { frente: !f.hidden && f.getAttribute('role') === 'dialog' && f.getAttribute('aria-modal') === 'true' && t.hidden, vb: f.querySelector('.frente-marco svg')?.getAttribute('viewBox'),
      detras: !document.querySelector('#sala').hidden && alfa > 0.4 && alfa < 0.85, cabe: !!fl && fl.left >= 0 && fl.right <= innerWidth + 1 && fl.top >= 0,
      foco: document.activeElement?.id, exp: document.querySelector('.zona-sala[data-zona="hoy"]').getAttribute('aria-expanded'),
      fases: f.querySelectorAll('.tarjeta-fases li').length, caras: f.querySelectorAll('.tarjeta-fases .avatar').length, hq: !!f.querySelector('[data-hq]'), desborde: document.documentElement.scrollWidth > innerWidth };
    await cierra();
    r.hoy.cierra = f.hidden && document.body.classList.contains('en-sala-propia') && location.hash === '#archivo' && document.activeElement?.getAttribute('data-zona') === 'hoy';
    await abre('linea');
    const mc = f.querySelector('.frente-marco');
    r.linea = { t: document.querySelector('#sala-frente-t')?.textContent, vb: f.querySelector('.frente-marco svg')?.getAttribute('viewBox'), hitos: f.querySelectorAll('.sr .tarjeta-hitos li').length,
      desliza: !!mc && mc.scrollWidth > mc.clientWidth + 20, desborde: document.documentElement.scrollWidth > innerWidth };
    await cierra(); await abre('fundos');
    const img = t.querySelector('.tarjeta-img img');
    if (img && !(img.complete && img.naturalWidth)) await new Promise((listo) => { img.onload = img.onerror = listo; setTimeout(listo, 4000); });
    r.fundos = { t: document.querySelector('#sala-tarjeta-t')?.textContent, img: img ? img.getAttribute('src') : '', carga: !!img && img.naturalWidth > 0, pie: t.querySelector('figcaption')?.textContent || '', sala: !!t.querySelector('[data-sala-ir="fundos"]'), hoja: t.classList.contains('hoja') };
    await cierra();
    // El fichero, desde la barra: todos los casos por rubro, con su buscador
    b.querySelector('[data-zona-ir="fichero"]').click(); await ${W(300)};
    const n = t.querySelectorAll('.archivo-grupo li').length, i = t.querySelector('.archivo-busca input'); i.value = 'restaurante'; i.dispatchEvent(new Event('input', { bubbles: true })); await ${W(50)};
    r.fichero = { t: document.querySelector('#sala-tarjeta-t')?.textContent, n, vis: [...t.querySelectorAll('.archivo-grupo:not([hidden]) li:not([hidden]) b')].map(x => x.textContent).join() };
    await cierra(); await abre('tuproyecto');
    r.turno = { cta: t.querySelector('a.bp-cta')?.getAttribute('href') || '', chat: !!t.querySelector('[data-abrir="chat:plotty"]') };
    await cierra();
    // Recorrer con Pepa
    const rec = () => ({ n: document.querySelector('[data-rec="n"]').textContent, t: document.querySelector('[data-rec="t"]').textContent, guia: document.querySelector('#sala-capa .burbuja.de-guia')?.textContent || '' });
    b.querySelector('[data-recorrer]').click(); await ${W(1500)}; const p1 = rec();
    document.querySelector('#sala-barra [data-rec="sig"]').click(); await ${W(1600)}; const p2 = rec();
    // «Ver más» en la parada de las diez fases las abre de frente; al cerrarla, el recorrido sigue en la misma parada
    const iHoy = PP.recorrido.findIndex(p => p.zona === 'hoy');
    for (let k = 1; k < iHoy; k++) { document.querySelector('#sala-barra [data-rec="sig"]').click(); await ${W(600)}; }
    document.querySelector('#sala-barra [data-rec="mas"]').click(); await ${W(300)};
    const enHoy = { frente: !f.hidden, n: document.querySelector('[data-rec="n"]').textContent };
    await cierra();
    enHoy.sigue = f.hidden && b.classList.contains('recorriendo') && document.querySelector('[data-rec="n"]').textContent === enHoy.n && document.activeElement === document.querySelector('#sala-barra [data-rec="mas"]');
    await cierra();
    r.rec = { p1, p2, enHoy, iHoy, esperado: PP.recorrido.slice(0, 2).map(p => PP.textos.guia + p.texto), fin: !b.classList.contains('recorriendo') };
    return r; })()`);
  ok(ar.sala && ar.nombre === 'El Archivo' && /MUSEO DE BIPLOT/.test(ar.barra) && /Recorrer con Pepa/.test(ar.barra) && /Todos los casos/.test(ar.barra) && ar.ant === 'Rumbo' && !ar.sig,
    'oficina/#archivo abre El Archivo, el museo de BiPlot: su barra con «Recorrer con Pepa» y «Todos los casos», y la sala vecina es Rumbo');
  ok(!ar.faltan.length && !ar.desborde, 'en el museo están todas sus piezas y toda su gente' + (ar.faltan.length ? ' (faltan: ' + ar.faltan.join(', ') + ')' : ''));
  ok(ar.papel.t === 'Antes de todo esto, había una libreta' && ar.papel.ceja === '1985 · El papel' && ar.papel.cap === '../plotline.html#ch0 _blank', 'la libreta abre su tarjeta de 1985 y lleva a su capítulo de «Seis décadas, la misma línea»');
  const hoyOk = ar.hoy.frente && ar.hoy.vb === '0 0 1000 440' && ar.hoy.detras && ar.hoy.cabe && ar.hoy.foco === 'sala-frente-t' && ar.hoy.exp === 'true' && !ar.hoy.desborde;
  ok(hoyOk, 'el mural de las diez fases se abre de frente y en grande, con la sala oscurecida detrás' + (hoyOk ? '' : ' ' + JSON.stringify(ar.hoy)));
  ok(ar.hoy.fases === 10 && ar.hoy.caras >= 10 && ar.hoy.hq && ar.hoy.cierra, 'debajo, quién lleva cada fase y «Pasar a BiPlot HQ»; Escape lo cierra sin salir del museo');
  ok(ar.linea.t === 'Así creció BiPlot' && ar.linea.vb === '0 0 1280 290' && ar.linea.hitos === 8 && ar.linea.desliza === !!movil && !ar.linea.desborde,
    'la línea de tiempo se abre de frente con sus 8 fechas' + (movil ? ' y se desliza de lado' : ''));
  ok(ar.fundos.t === 'La escritura inscrita' && /media\/salas\/fundos-5-postventa\.webp$/.test(ar.fundos.img) && ar.fundos.carga && /^Fundos 360 · Postventa/.test(ar.fundos.pie) && ar.fundos.sala && ar.fundos.hoja === !!movil,
    'la escritura de Fundos 360 trae su pantalla real y «Entrar a su sala»');
  ok(ar.fichero.t === 'Todos los casos tienen su carpeta' && ar.fichero.n === 5 && ar.fichero.vis === 'Haru 360', 'el fichero, desde la barra, lista los 5 casos por rubro y los busca (' + ar.fichero.vis + ')');
  ok(/^https:\/\/wa\.me\/\d+\?text=/.test(ar.turno.cta) && ar.turno.chat, 'el pedestal libre lleva «Agenda tu diagnóstico» (el WhatsApp de BiPlot) y «Conversar con Plotty»');
  ok(ar.rec.p1.n === '1 de 12' && ar.rec.p1.t === 'La entrada' && ar.rec.p2.t === '1985 · La libreta' && ar.rec.p1.guia === ar.rec.esperado[0] && ar.rec.p2.guia === ar.rec.esperado[1] && ar.rec.fin,
    '«Recorrer con Pepa» va de la entrada a la libreta, Pepa habla en cada parada y Escape lo termina');
  ok(ar.rec.enHoy.frente && ar.rec.enHoy.n === (ar.rec.iHoy + 1) + ' de 12' && ar.rec.enHoy.sigue, '«Ver más» en la parada de las diez fases las abre de frente, y al cerrarla el recorrido sigue en la misma parada');
  ok(await js(`(async () => { const z = document.querySelector('.zona-sala[data-zona="fundos"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(300)};
      document.querySelector('#sala-tarjeta [data-sala-ir="fundos"]').click(); await ${W(700)};
      return location.hash === '#fundos' && document.querySelector('#sala-nombre').textContent === 'Fundos 360' && document.body.classList.contains('en-sala-propia'); })()`), '«Entrar a su sala» pasa del museo a la sala de Fundos 360');
  await abrir(w, h, movil, false, '#conversar');
  ok((await js("!!document.querySelector('#panel:not([hidden]) .chat') && document.querySelector('#svg-escena').classList.contains('oficina-abierta')")), 'oficina/#conversar entra y abre la conversación con Plotty');
  // La página para compartir de una sala lleva a la oficina, dentro de la sala
  {
    const listo = new Promise((r) => { cargada = r; setTimeout(r, 15000); });
    await cdp('Page.navigate', { url: url + 'haru/' });
    await listo; cargada = null;
    for (let i = 0; i < 60; i++) { try { if (await js("location.hash === '#haru' && document.documentElement.classList.contains('lista')")) break; } catch { /* navegando */ } await sleep(250); }
    await sleep(900);
    ok(await enSala() && await js("document.body.classList.contains('en-sala-propia') && document.querySelector('#sala-nombre').textContent === 'Haru 360' && !document.querySelector('#sala-barra').hidden"), 'biplot.cl/oficina/haru/ lleva a la oficina, dentro de la sala de Haru');
    const og = fs.readFileSync(path.join(raiz, 'oficina', 'haru', 'index.html'), 'utf8');
    ok(/og:image" content="https:\/\/biplot\.cl\/oficina\/kit\/png\/sala-haru-og\.png"/.test(og) && fs.existsSync(path.join(raiz, 'oficina', 'kit', 'png', 'sala-haru-og.png')), 'la página de Haru trae su vista previa para compartir');
  }
  // Y la de Nu Home, a su sala propia
  {
    const listo = new Promise((r) => { cargada = r; setTimeout(r, 15000); });
    await cdp('Page.navigate', { url: url + 'nuhome/' });
    await listo; cargada = null;
    for (let i = 0; i < 60; i++) { try { if (await js("location.hash === '#nuhome' && document.documentElement.classList.contains('lista')")) break; } catch { /* navegando */ } await sleep(250); }
    await sleep(900);
    ok(await js("document.body.classList.contains('en-sala-propia') && document.querySelector('#sala-nombre').textContent === 'Nu Home 360' && !document.querySelector('#sala-barra').hidden"), 'biplot.cl/oficina/nuhome/ lleva a la oficina, dentro de la sala propia de Nu Home');
    const og = fs.readFileSync(path.join(raiz, 'oficina', 'nuhome', 'index.html'), 'utf8');
    ok(/og:image" content="https:\/\/biplot\.cl\/oficina\/kit\/png\/sala-nuhome-og\.png"/.test(og) && fs.existsSync(path.join(raiz, 'oficina', 'kit', 'png', 'sala-nuhome-og.png')), 'la página de Nu Home trae su vista previa para compartir');
  }
  // Y la del museo
  {
    const og = fs.readFileSync(path.join(raiz, 'oficina', 'archivo', 'index.html'), 'utf8');
    ok(/og:image" content="https:\/\/biplot\.cl\/oficina\/kit\/png\/sala-archivo-og\.png"/.test(og) && og.includes("location.replace('../#archivo')") && fs.existsSync(path.join(raiz, 'oficina', 'kit', 'png', 'sala-archivo-og.png')),
      'la página del museo (biplot.cl/oficina/archivo) trae su vista previa y lleva a El Archivo');
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
    await ${W(700)};
    const g = document.querySelector('.local-abierto[data-abierto="prueba-c"]'), abierto = !!g && !g.innerHTML.includes('§') && g.querySelectorAll('.andante').length === 1;
    document.querySelector('#recorrer [data-id="archivo"]').click(); await ${W(200)};
    const archivo = [...document.querySelectorAll('.archivo-grupo li b')].map(b => b.textContent);
    const menu = [...document.querySelectorAll('#recorrer [data-id]')].map(b => b.dataset.id);
    return { filas, locales, titulo, fase, adentro, abierto, marcas, archivo, menu, anonimo: texto.includes('Nombre reservado'), letrero: texto.includes('DISTRIBUIDORA DE ALIMENTOS'), reservado: menu.includes('prueba-e') }; })()`);
  ok(r.filas.join() === 'salud,servicios,comercio', 'cada rubro abre su calle, en el orden en que llegó su primer caso (' + r.filas.join(', ') + ')');
  ok(r.locales.join() === 'prueba-a,prueba-b,libre-salud,prueba-c,libre-servicios,prueba-d,libre-comercio', 'cada calle termina con un local que se arrienda');
  ok(!r.marcas, 'los techos de las calles por rubro no dejan marcas §…§ sin reemplazar');
  ok(r.titulo === 'Taller de Prueba' && /E7/.test(r.fase || ''), 'el local de un caso con plantilla abre su panel con su fase (' + r.titulo + ', ' + r.fase + ')');
  ok(r.adentro, 'la vista previa de un caso muestra su local por dentro (locales.js)');
  ok(r.abierto, 'y en la calle su local se abre con su plantilla, su color y alguien que camina, sin marcas §…§');
  ok(!r.anonimo && r.letrero, 'un caso sin permiso para su nombre muestra sólo su rubro');
  ok(r.archivo.includes('Sólo archivo') && !r.reservado, 'un caso «sólo en El Archivo» no tiene local, pero está en El Archivo');
  ok(consola.length === 0, 'sin errores de consola' + (consola.length ? ': ' + [...new Set(consola)].join(' | ') : ''));
  await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier });
}

console.log('\nMovimiento reducido');
await abrir(1440, 900, false, true);
ok(await js("getComputedStyle(document.querySelector('.pj-cuerpo')).animationName === 'none'"), 'el personal queda quieto');
ok(await js("document.querySelector('#controles [data-accion=\"pausa\"]').getAttribute('aria-pressed') === 'true'"), 'la animación parte pausada');
await js("document.querySelector('#recorrer [data-id=\"rumbo\"]').click(), true");
{
  const lr = await localAbierto('rumbo'), cr = await caminan('.local-abierto');
  ok(lr.abierto && cr.n >= 1 && !cr.movio, 'el local se abre igual, con su gente quieta en su lugar');
}
// La sala propia de Nu Home, quieta: nadie habla solo, pero al elegir a alguien se ve su frase; el recorrido salta sin animación
consola = [];
await abrir(1440, 900, false, true, '#nuhome');
await sleep(600);
{
  const rq = await js(`(async () => { await ${W(4200)}; const solas = document.querySelectorAll('#sala-capa .burbuja').length;
    const q = document.querySelector('.quien-sala[data-quien="nhRecepcion"]'); q.focus(); q.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await ${W(60)};
    const elegida = [...document.querySelectorAll('#sala-capa .burbuja.visible')].some(b => /Pasa, la casa piloto está abierta/.test(b.textContent));
    const s = document.querySelector('.sala-svg'); document.querySelector('#sala-barra [data-recorrer]').click(); await ${W(40)}; const a = s.getAttribute('viewBox');
    document.querySelector('#sala-barra [data-rec="sig"]').click(); await ${W(40)};
    return { solas, elegida, salta: s.getAttribute('viewBox') !== a && !!document.querySelector('#sala-capa .burbuja.de-guia.visible'), paso: document.querySelector('[data-rec="n"]').textContent }; })()`);
  ok(rq.solas === 0 && rq.elegida, 'en la sala de Nu Home nadie habla solo, pero al elegir a alguien se ve su frase');
  ok(rq.salta && rq.paso === '2 de 7', 'y el recorrido con una asesora pasa de parada en parada sin animación');
  ok(consola.length === 0, 'sin errores de consola' + (consola.length ? ': ' + [...new Set(consola)].join(' | ') : ''));
}

console.log('\nRecursos con error: ' + (recursos.length ? [...new Set(recursos)].join(', ') : 'ninguno'));
if (recursos.length) fallas++;
console.log(fallas ? `\n${fallas} prueba(s) fallaron` : '\nTodo OK');
try { ws.close(); } catch { /* */ }
edge.kill(); servidor.close(); await sleep(400);
for (let i = 0; i < 5; i++) { try { fs.rmSync(perfil, { recursive: true, force: true }); break; } catch { await sleep(300); } }
process.exit(fallas ? 1 : 0);
