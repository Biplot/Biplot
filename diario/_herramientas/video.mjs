// Graba el video de la semana de La Línea (lo arma armar.mjs en salida/<fecha>-video.html) en los dos formatos, con
// su música: diario/<fecha>/video/h.mp4 (1920×1080, el canal de La Línea en BiPlot.TV) y v.mp4 (1080×1920, el Reel),
// más h.jpg y v.jpg (su portada, en la escena de la tapa), y vuelve a correr armar.mjs para que ultima.json lo sume.
// Viajan en el PR de la edición; al publicarla, el CRM deja el Reel por aprobar en Marketing y la oficina lo pasa en
// la tele.
// El cierre de marca y el motor de audio son los de biplot-nucleo (04-marca/00-motor/): se usan desde su copia local,
// que se busca junto a este repo (../biplot-nucleo) o en la variable BIPLOT_NUCLEO.
// Uso, desde la raíz del repo:
//   node diario/_herramientas/video.mjs [AAAA-MM-DD]                    → los dos formatos (unos 8 minutos)
//   node diario/_herramientas/video.mjs AAAA-MM-DD --cuadros 2,9.5,40     → sólo esos cuadros, para revisar
//                                                                          (en salida/<fecha>-video-cuadros/)
// Antes: node diario/_herramientas/armar.mjs AAAA-MM-DD. Necesita Playwright (con el Chromium del entorno), ffmpeg
// (el del sistema o ffmpeg-static) y red para las letras de Google Fonts.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process';
import { once } from 'node:events'; import { createRequire } from 'node:module';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));
const require = createRequire(import.meta.url);

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const nucleo = path.resolve(process.env.BIPLOT_NUCLEO || path.join(raiz, '..', 'biplot-nucleo'));
const motor = path.join(nucleo, '04-marca', '00-motor');
if (!fs.existsSync(path.join(motor, 'cierre-biplot.js'))) { console.error(`No encuentro biplot-nucleo en ${nucleo}: clónalo junto a este repo o define BIPLOT_NUCLEO.`); process.exit(1); }
const args = process.argv.slice(2);
const opcion = (n) => { const i = args.indexOf(`--${n}`); return i > -1 ? args.splice(i, 2)[1] : null; };
const cuadros = opcion('cuadros');
const fecha = args[0] || fs.readdirSync(path.join(raiz, 'diario', '_herramientas', 'ediciones')).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().at(-1).slice(0, 10);
const salida = path.join(raiz, 'diario', '_herramientas', 'salida');
if (!fs.existsSync(path.join(salida, `${fecha}-video.html`))) { console.error(`Falta salida/${fecha}-video.html: corre antes node diario/_herramientas/armar.mjs ${fecha}`); process.exit(1); }
let ffmpeg = 'ffmpeg';
try { ffmpeg = require('ffmpeg-static') || ffmpeg; } catch {}

const FORMATOS = { h: [1920, 1080], v: [1080, 1920] };
const FPS = 30;
// El mismo filtro de render.cjs del núcleo: compresión suave y limitador, ~−14 LUFS (Instagram, WhatsApp, YouTube)
const FILTRO_AUDIO = 'acompressor=threshold=-22dB:ratio=3.5:attack=4:release=140:makeup=6dB,volume=2.6dB,alimiter=limit=0.891:attack=3:release=60:level=disabled';

// /nucleo/… se sirve desde biplot-nucleo; lo demás, desde este repo
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  const ruta = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  const base = ruta.startsWith('/nucleo/') ? nucleo : raiz;
  const f = path.join(base, ruta.replace(/^\/nucleo\//, '/'));
  if (!f.startsWith(base) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const nav = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });

async function abrir(w, h) {
  const pg = await nav.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errores = [];
  pg.on('pageerror', (e) => errores.push(e.message));
  pg.on('response', (r) => { if (r.status() >= 400) errores.push(`${r.status()} ${r.url()}`); });
  await pg.goto(`http://127.0.0.1:${srv.address().port}/diario/_herramientas/salida/${fecha}-video.html?w=${w}&h=${h}&render`, { waitUntil: 'networkidle' });
  await pg.waitForFunction('window.READY === true', null, { timeout: 60000 });
  const faltan = await pg.evaluate(() => (window.FONTS || []).filter((f) => ![...document.fonts].some((x) => x.family.replace(/["']/g, '') === f && x.status === 'loaded')));
  if (faltan.length) errores.push(`no cargaron las letras: ${faltan.join(', ')} (¿hay internet?)`);
  const ajustados = await pg.evaluate(() => window.TEXTOS_AJUSTADOS || []);
  if (ajustados.length) console.log(`  ${w}×${h}: letra achicada para que quepa → ${ajustados.join(' · ')}`);
  if (errores.length) throw new Error(`La página del video tiene errores:\n  ${errores.join('\n  ')}`);
  return pg;
}

// ---------- La música: un pulso de noticiero que se corta en el barrido del cierre, y la firma BiPlot ----------
function musica(cues, duracion, wav) {
  const { crearMezcla, sonidos, SR, TAU } = require(path.join(motor, 'sintesis.cjs'));
  const { firmaBiPlot } = require(path.join(motor, 'cierre-biplot-audio.cjs'));
  const m = crearMezcla(duracion);
  const { voice, noise, svf } = m;
  const S = sonidos(m);
  const BEAT = 60 / 112, INI = 0.25;
  const corte = cues.find((c) => c.type === 'drop').t, impacto = cues.find((c) => c.type === 'impact' && c.t > corte);
  // La menor, Fa, Do y Sol, dos compases cada uno
  const ACORDES = [[55, [220, 261.63, 329.63]], [43.65, [174.61, 220, 261.63]], [65.41, [196, 261.63, 329.63]], [49, [196, 246.94, 293.66]]];
  const cola = (t) => (t > corte - 0.08 ? Math.max(0, (corte - t) / 0.08) : 1);
  for (let b = 0; INI + b * BEAT < corte; b++) {
    const t = INI + b * BEAT, [raizF, notas] = ACORDES[Math.floor(b / 8) % 4];
    // Bombo en 1 y 3, caja en 2 y 4, platillo cerrado en corcheas
    if (b % 2 === 0) voice(t, 0.32, (tt) => cola(t + tt) * (Math.exp(-tt / 0.12) * Math.sin(TAU * (52 * tt + 3.4 * (1 - Math.exp(-tt / 0.03)))) + Math.exp(-tt / 0.003) * noise() * 0.4), { gain: 0.3 });
    else { const f = svf(); voice(t, 0.2, (tt) => cola(t + tt) * Math.exp(-tt / 0.05) * f(noise(), 1900, 0.9).band, { gain: 0.32, rev: 0.15 }); }
    for (const k of [0, 0.5]) { const f = svf(), th = t + k * BEAT; voice(th, 0.05, (tt) => cola(th + tt) * Math.exp(-tt / 0.012) * f(noise(), 8000).high, { gain: k ? 0.05 : 0.08, pan: 0.25 }); }
    // Bajo en corcheas y el acorde en staccato, a contratiempo
    for (const k of [0, 0.5]) { const tb = t + k * BEAT; voice(tb, 0.24, (tt) => cola(tb + tt) * Math.min(1, tt / 0.004) * Math.exp(-tt / 0.12) * (Math.sin(TAU * raizF * tt) + 0.6 * Math.sin(TAU * 2 * raizF * tt) + 0.2 * Math.sin(TAU * 3 * raizF * tt)), { gain: k ? 0.07 : 0.1 }); }
    const ts = t + 0.5 * BEAT;
    notas.forEach((fr, i) => voice(ts, 0.18, (tt) => cola(ts + tt) * Math.min(1, tt / 0.005) * Math.exp(-tt / 0.07) * (Math.sin(TAU * fr * tt) + 0.3 * Math.sin(TAU * 2 * fr * tt)), { gain: 0.035, pan: (i - 1) * 0.4, rev: 0.25 }));
  }
  for (const c of cues) if (S[c.type]) S[c.type](c);
  if (impacto) firmaBiPlot(m, { impacto: impacto.t, duracion });
  m.terminar(wav);
}

async function grabar(nombre) {
  const [w, h] = FORMATOS[nombre];
  const pg = await abrir(w, h);
  const { cues, duracion, escenas } = await pg.evaluate(() => ({ cues: window.CUES, duracion: window.DURATION, escenas: window.ESCENAS }));
  const carpeta = path.join(raiz, 'diario', fecha, 'video');
  fs.mkdirSync(carpeta, { recursive: true });
  const wav = path.join(salida, `${fecha}-video.wav`);
  if (nombre === 'h' || !fs.existsSync(wav)) musica(cues, duracion, wav);
  const mp4 = path.join(carpeta, `${nombre}.mp4`);
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', '27', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-af', FILTRO_AUDIO,
    '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.floor(duracion * FPS), ini = Date.now();
  for (let i = 0; i < total; i++) {
    await pg.evaluate((t) => window.renderFrame(t), i / FPS);
    if (!ff.stdin.write(await pg.screenshot({ type: 'jpeg', quality: 94 }))) await once(ff.stdin, 'drain');
    if (i % 300 === 0) console.log(`  ${nombre}: ${i}/${total} cuadros (${Math.round((Date.now() - ini) / 1000)} s)`);
  }
  ff.stdin.end();
  const [codigo] = await once(ff, 'close');
  if (codigo !== 0) throw new Error(`ffmpeg terminó con código ${codigo}`);
  // La portada: la escena de la tapa (o la primera nota, si la edición no trae tapa), ya con todo a la vista
  const e = escenas.find((x) => x.id === 'tapa') || escenas.find((x) => x.id === 'nota-1') || escenas[0];
  await pg.evaluate((t) => window.renderFrame(t), e.ini + e.d - 0.6);
  await pg.screenshot({ path: path.join(carpeta, `${nombre}.jpg`), type: 'jpeg', quality: 78 });
  await pg.close();
  for (const f of [mp4, path.join(carpeta, `${nombre}.jpg`)]) console.log('✓', path.relative(raiz, f), Math.round(fs.statSync(f).size / 1024) + ' KB');
}

try {
  if (cuadros) {
    const carpeta = path.join(salida, `${fecha}-video-cuadros`);
    fs.mkdirSync(carpeta, { recursive: true });
    for (const nombre of Object.keys(FORMATOS)) {
      const pg = await abrir(...FORMATOS[nombre]);
      for (const t of cuadros.split(',').map(Number)) {
        await pg.evaluate((t) => window.renderFrame(t), t);
        const f = path.join(carpeta, `${nombre}-${String(t).replace('.', '_')}.png`);
        await pg.screenshot({ path: f });
        console.log('✓', path.relative(raiz, f));
      }
      await pg.close();
    }
  } else {
    await grabar('h');
    await grabar('v');
  }
} finally {
  await nav.close(); srv.close();
}
// Con el video ya grabado, armar.mjs lo suma a ultima.json (lo lee la tele de la oficina)
if (!cuadros) {
  const armar = spawn(process.execPath, [path.join(raiz, 'diario', '_herramientas', 'armar.mjs'), fecha], { stdio: 'inherit' });
  const [codigo] = await once(armar, 'close');
  if (codigo !== 0) process.exit(codigo);
}
