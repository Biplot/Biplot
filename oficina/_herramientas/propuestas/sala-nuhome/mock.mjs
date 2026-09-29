// Maquetas de la sala de Nu Home dentro de la oficina: cómo se recorre sin números.
// #a al entrar · #b al tocar la casa piloto · #c el rincón de BiPlot
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { salaNuhome, componer } from './sala.mjs';
import { fotos } from './foto.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const r = salaNuhome();
const { defs, cuerpo } = componer(r, new URL('../../../../', import.meta.url).href);
const CARAS_URL = new URL('../../../../assets/oficina/caras/', import.meta.url).href;
const CARAS = ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle', 'tamandua', 'faro', 'pepa'];

const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Sala Nu Home</title>
<style>
:root{--fondo:#0B1726;--barra:#0A1A2C;--panel:#0E2A47;--linea:rgba(127,216,207,.22);--texto:#F2F4F7;--suave:#A9B7C6;--cian:#17C3B2;--cian2:#7FD8CF;--coral:#FF6B4A;
  --crema:#F6EFDF;--crema2:#EADFC6;--tinta:#1C1917;--oro:#C9A227;--oro2:#E0B341}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--fondo);color:var(--texto);font-family:'Space Grotesk','DejaVu Sans',sans-serif;overflow:hidden}
.barra{position:absolute;inset:0 0 auto 0;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;background:var(--barra);border-bottom:1px solid rgba(127,216,207,.12);z-index:9}
.marca{display:flex;align-items:center;gap:12px;font-weight:700;font-size:21px}
.marca .iso{width:30px;height:30px;border-radius:8px;background:#0E2A47;border:1.5px solid var(--cian);display:grid;place-items:center}
.marca b{color:var(--texto)}.marca b i{font-style:normal;color:var(--cian)}
.marca span{color:var(--suave);font-weight:500;font-size:16px;border-left:1px solid rgba(169,183,198,.35);padding-left:12px}
.acciones{display:flex;align-items:center;gap:22px;font-size:15px;color:var(--suave)}
.coral{background:var(--coral);color:#1A0B06;font-weight:700;padding:11px 18px;border-radius:999px;font-size:15px}
#escena{position:absolute;inset:60px 0 0 0}
#escena svg{width:100%;height:100%;display:block}
.capa{position:absolute;inset:60px 0 0 0;pointer-events:none;z-index:4}
.volver{position:absolute;top:18px;left:18px;padding:10px 16px 10px 12px;border-radius:999px;background:rgba(14,42,71,.92);border:1px solid var(--linea);font-weight:600;font-size:15px;display:flex;gap:8px;align-items:center}
/* Burbujas: la gente habla sola, de a poco */
.burbuja{position:absolute;transform:translate(-50%,calc(-100% - 12px));max-width:230px;background:#FFFFFF;color:#13202E;border-radius:14px;padding:9px 12px 10px;font:500 13.5px/1.35 Inter,'DejaVu Sans',sans-serif;box-shadow:0 8px 24px rgba(4,12,22,.35)}
.burbuja::after{content:"";position:absolute;left:50%;bottom:-7px;width:14px;height:14px;background:inherit;transform:translateX(-50%) rotate(45deg);border-radius:0 0 3px 0}
.burbuja small{display:block;font:600 10.5px/1.2 'Space Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#8A6F1C;margin-bottom:3px}
.burbuja.bp{background:#0E2A47;color:var(--texto);border:1.5px solid var(--cian)}
.burbuja.bp::after{border-right:1.5px solid var(--cian);border-bottom:1.5px solid var(--cian)}
.burbuja.bp small{color:var(--cian2)}
.burbuja.corta{white-space:nowrap}
/* La barra de Nu Home: su marca y sus dos caminos */
.nh-barra{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;align-items:center;gap:18px;padding:12px 14px 12px 18px;border-radius:18px;background:var(--crema);color:var(--tinta);box-shadow:0 18px 40px rgba(4,12,22,.45);white-space:nowrap}
.nh-logo{font:600 22px/1 'Cormorant Garamond',serif;letter-spacing:.14em}
.nh-logo small{display:block;font:500 10px/1.4 'Space Grotesk',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#6E6250;margin-top:3px}
.nh-sep{width:1px;height:34px;background:#CFC1A3}
.nh-txt{flex:none;width:300px;font:500 14px/1.4 Inter,sans-serif;color:#3A3530;white-space:normal}
.nh-btn{border-radius:999px;padding:11px 16px;font:700 14px/1 'Space Grotesk',sans-serif}
.nh-btn.negro{background:var(--tinta);color:var(--crema)}
.nh-btn.negro::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--oro2);margin-right:8px;vertical-align:1px}
.nh-btn.borde{border:1.5px solid var(--tinta);color:var(--tinta)}
/* Tarjetas: aparecen junto a lo que se toca */
.tarjeta{position:absolute;width:340px;border-radius:16px;padding:18px 18px 16px;box-shadow:0 22px 50px rgba(4,12,22,.5)}
.tarjeta.nh{background:var(--crema);color:var(--tinta)}
.tarjeta .ceja{font:700 11px/1 'Space Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#8A6F1C}
.tarjeta h3{margin:8px 0 8px;font:600 27px/1.08 'Cormorant Garamond',serif;letter-spacing:-.005em;text-wrap:balance}
.tarjeta p{margin:0 0 12px;font:400 14px/1.45 Inter,sans-serif;color:#3A3530}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.chips span{font:600 12px/1 'Space Grotesk',sans-serif;padding:7px 9px;border-radius:999px;background:var(--crema2);color:#3A3530}
.botones{display:flex;gap:8px;flex-wrap:wrap}
.cerrar{position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:600 16px/1 sans-serif;color:#6E6250;background:rgba(28,25,23,.06)}
.tarjeta.bp{background:#0E2A47;color:var(--texto);border:1px solid var(--linea)}
.tarjeta.bp .ceja{color:var(--cian2)}
.tarjeta.bp h3{font:700 24px/1.1 'Space Grotesk',sans-serif;letter-spacing:-.01em}
.tarjeta.bp p{color:#C9D4DF}
.tarjeta.bp .cerrar{color:var(--suave);background:rgba(255,255,255,.06)}
.estado{display:inline-block;font:700 11px/1 'Space Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--cian2);border:1px solid rgba(127,216,207,.5);border-radius:999px;padding:6px 9px;margin-left:8px;vertical-align:4px}
.caras{display:flex;margin:4px 0 6px}
.caras img{width:34px;height:34px;border-radius:50%;margin-right:-7px;border:2px solid #0E2A47;background:#10345A}
.caras-pie{font:500 12px/1.3 Inter,sans-serif;color:var(--suave);margin-bottom:14px}
.btn-cian{background:var(--cian);color:#062B27;border-radius:999px;padding:11px 16px;font:700 14px/1 'Space Grotesk',sans-serif}
.btn-ghost{border:1.5px solid rgba(242,244,247,.4);color:var(--texto);border-radius:999px;padding:11px 16px;font:700 14px/1 'Space Grotesk',sans-serif}
.etiqueta{position:absolute;transform:translate(-50%,-50%);background:var(--tinta);color:var(--crema);font:600 16px/1 'Cormorant Garamond',serif;letter-spacing:.02em;padding:8px 12px;border-radius:999px;border:1.5px solid var(--oro2);box-shadow:0 0 0 6px rgba(224,179,65,.18)}
#brillo{position:absolute;inset:60px 0 0 0;z-index:3;pointer-events:none}
</style>
<div class="barra"><div class="marca"><div class="iso"><svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 2V15H16" stroke="#3F6DA0" stroke-width="1.6" fill="none"/><circle cx="5.5" cy="12" r="1.6" fill="#17C3B2"/><circle cx="9" cy="9.5" r="1.6" fill="#17C3B2"/><circle cx="14" cy="5" r="2" fill="#FF6B4A"/></svg></div><b>Bi<i>Plot</i></b><span>La oficina</span></div>
<div class="acciones"><span>Volver al sitio</span><span class="coral">Agenda tu diagnóstico</span></div></div>
<div id="escena"><svg id="dibujo" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${cuerpo}</svg></div>
<svg id="brillo"></svg>
<div class="capa" id="capa"></div>
<script>
const P = (x, y, z = 0) => [(x - y) * 32, (x + y) * 16 - z * 39];
const ANCHO = innerWidth, ALTO = innerHeight - 60;
const ESTADOS = {
  a: { centro: [95, 262], zoom: 1.1 },
  b: { centro: P(13.9, 9.6, 1.0), zoom: 1.95 },
  c: { centro: P(7.2, 11.7, 1.1), zoom: 2.25 }
};
const est = new URLSearchParams(location.search).get('e') || 'a', cam = ESTADOS[est];
const vw = ANCHO / cam.zoom, vh = ALTO / cam.zoom, x0 = cam.centro[0] - vw / 2, y0 = cam.centro[1] - vh / 2;
document.getElementById('dibujo').setAttribute('viewBox', [x0, y0, vw, vh].join(' '));
const aPantalla = (x, y, z) => { const [px, py] = P(x, y, z); return [(px - x0) * cam.zoom, (py - y0) * cam.zoom]; };
const capa = document.getElementById('capa');
const poner = (htmlTxt, x, y, z, clase = '', dx = 0, dy = 0) => { const [sx, sy] = aPantalla(x, y, z); const d = document.createElement('div'); d.className = clase; d.innerHTML = htmlTxt; d.style.left = (sx + dx) + 'px'; d.style.top = (sy + dy) + 'px'; capa.appendChild(d); return d; };
capa.insertAdjacentHTML('beforeend', '<div class="volver"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>Volver a la calle</div>');
if (est === 'a') {
  poner('<small>Asesora · Nu Home</small>¡Hola! Pasa, la casa piloto está abierta.', 17.9, 10.95, 2.05, 'burbuja');
  poner('<small>Asesora · Nu Home</small>Dibujamos tu terreno a escala y vemos qué casa te cabe.', 1.85, 12.15, 2.05, 'burbuja');
  poner('¡Tiene terraza!', 12.2, 9.6, 1.62, 'burbuja corta');
  poner('<small>Taller</small>Este módulo sale el jueves.', 4.4, 4.05, 2.05, 'burbuja corta');
  capa.insertAdjacentHTML('beforeend', '<div class="nh-barra"><div class="nh-logo">NÜHOME<small>Vida &amp; Hogar</small></div><div class="nh-sep"></div><div class="nh-txt">Casas modulares. Pasa, recorre la casa piloto y conversa con nuestras asesoras.</div><span class="nh-btn negro">Hablar con una asesora</span><span class="nh-btn borde">Recorrer con una asesora</span></div>');
}
if (est === 'b') {
  // El brillo dorado alrededor de la casa piloto (lo que se toca se ilumina, sin números)
  const pts = [[10.1, 5.5], [16.3, 5.5], [16.3, 8.2], [15.2, 8.2], [15.2, 11.1], [10.8, 11.1], [10.8, 8.2], [10.1, 8.2]].map(([x, y]) => aPantalla(x, y, 0.01).map(n => n.toFixed(1)).join(',')).join(' ');
  document.getElementById('brillo').innerHTML = '<defs><filter id="f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs><polygon points="' + pts + '" fill="rgba(224,179,65,.16)" stroke="#E0B341" stroke-width="10" stroke-linejoin="round" opacity=".55" filter="url(#f)"/><polygon points="' + pts + '" fill="none" stroke="#E0B341" stroke-width="2.5" stroke-linejoin="round" stroke-dasharray="10 7"/>';
  document.getElementById('brillo').setAttribute('viewBox', '0 0 ' + ANCHO + ' ' + ALTO);
  poner('Casa piloto', 13.2, 6.85, 2.95, 'etiqueta');
  poner('<small>Asesor · Nu Home</small>¿Tienes terreno? Te muestro cómo quedaría en el tuyo.', 15.6, 9.05, 2.05, 'burbuja');
  const t = poner('<span class="cerrar">×</span><div class="ceja">Casa piloto</div><h3>Un módulo de 6 m, con terraza y pérgola</h3><p>Así se ve un módulo terminado: forro negro, madera y ventanales que se abren a la terraza. Se combina con otros módulos para armar tu casa.</p><div class="chips"><span>6 × 2,5 m · 13,6 m²</span><span>Terraza 4 × 3 m</span><span>Pérgola 4 × 4 m</span></div><div class="botones"><span class="nh-btn negro">Diseñar la mía</span><span class="nh-btn borde">Hablar con un asesor</span></div>', 16.6, 8.2, 1.2, 'tarjeta nh', 40, -150);
}
if (est === 'c') {
  poner('<small>Bucle · BiPlot</small>Con Nu Home estamos construyendo Nu Home 360, la plataforma detrás de esta sala. ¿Te cuento cómo?', 9.7, 12.95, 2.1, 'burbuja bp');
  poner('<small>Asesora · Nu Home</small>Mira: así queda en tu terreno.', 1.85, 12.15, 2.05, 'burbuja corta');
  const caras = ${JSON.stringify(CARAS)}.map(id => '<img src="${CARAS_URL}' + id + '.webp" alt="">').join('');
  poner('<span class="cerrar">×</span><div class="ceja">Hecho con BiPlot</div><h3>Nu Home 360<span class="estado">En desarrollo</span></h3><p>El diseñador para las asesoras, la carta Gantt del taller y el portal donde cada cliente sigue su casa: una sola plataforma, del primer contacto a la entrega. La estamos construyendo con Nu Home, fase por fase.</p><div class="caras">' + caras + '</div><div class="caras-pie">El equipo de BiPlot HQ que la hace</div><div class="botones"><span class="btn-cian">Ver el video</span><span class="btn-ghost">Pasar a BiPlot HQ</span></div>', 10.6, 12.4, 1.0, 'tarjeta bp', 50, -250);
}
</script></html>`;
const trabajo = process.env.SALIDA || path.join(os.tmpdir(), 'sala-nuhome'), salida = path.join(trabajo, 'fotos');
fs.mkdirSync(salida, { recursive: true });
fs.writeFileSync(path.join(trabajo, 'mock.html'), html);
await fotos(['a', 'b', 'c'].map((e) => ({ html: path.join(trabajo, 'mock.html'), hash: '?e=' + e, png: path.join(salida, `mock-${e}.png`), ancho: 1440, alto: 900, escala: 2, espera: 1200 })));
