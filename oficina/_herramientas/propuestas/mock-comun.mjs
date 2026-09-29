// Base de las maquetas de las salas propuestas (Haru, Eleven y las que vengan): la sala dentro de la oficina, con la
// barra de BiPlot arriba y, encima del dibujo, lo que aparece al recorrerla sin números: las burbujas de su gente, el
// brillo de lo que se toca, su etiqueta, la tarjeta y la barra de la marca. Cada sala pone su paleta y su guion.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fotos } from './sala-nuhome/foto.mjs';

const RAIZ = new URL('../../../', import.meta.url).href;
export const MEDIA = RAIZ + 'oficina/media/salas/';
export const caras = (ids) => ids.map((id) => `<img src="${RAIZ}assets/oficina/caras/${id}.webp" alt="">`).join('');

const CSS = `
:root{--fondo:#0B1726;--barra:#0A1A2C;--texto:#F2F4F7;--suave:#A9B7C6;--cian:#17C3B2;--cian2:#7FD8CF;--coral:#FF6B4A;--linea:rgba(127,216,207,.22)}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--fondo);color:var(--texto);font-family:'Space Grotesk','DejaVu Sans',sans-serif;overflow:hidden}
.barra{position:absolute;inset:0 0 auto 0;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;background:var(--barra);border-bottom:1px solid rgba(127,216,207,.12);z-index:9}
.marca{display:flex;align-items:center;gap:12px;font-weight:700;font-size:21px}
.marca .iso{width:30px;height:30px;border-radius:8px;background:#0E2A47;border:1.5px solid var(--cian);display:grid;place-items:center}
.marca b i{font-style:normal;color:var(--cian)}
.marca span{color:var(--suave);font-weight:500;font-size:16px;border-left:1px solid rgba(169,183,198,.35);padding-left:12px}
.acciones{display:flex;align-items:center;gap:22px;font-size:15px;color:var(--suave)}
.coral{background:var(--coral);color:#1A0B06;font-weight:700;padding:11px 18px;border-radius:999px;font-size:15px}
#escena{position:absolute;inset:60px 0 0 0}
#escena svg{width:100%;height:100%;display:block}
#brillo{position:absolute;inset:60px 0 0 0;z-index:3;pointer-events:none}
.capa{position:absolute;inset:60px 0 0 0;pointer-events:none;z-index:4}
.volver{position:absolute;top:18px;left:18px;padding:10px 16px 10px 12px;border-radius:999px;background:rgba(14,42,71,.92);border:1px solid var(--linea);font-weight:600;font-size:15px;display:flex;gap:8px;align-items:center}
.burbuja{position:absolute;transform:translate(-50%,calc(-100% - 12px));max-width:230px;background:#FFFFFF;color:#13202E;border-radius:14px;padding:9px 12px 10px;font:500 13.5px/1.35 Inter,'DejaVu Sans',sans-serif;box-shadow:0 8px 24px rgba(4,12,22,.35)}
.burbuja::after{content:"";position:absolute;left:50%;bottom:-7px;width:14px;height:14px;background:inherit;transform:translateX(-50%) rotate(45deg);border-radius:0 0 3px 0}
.burbuja small{display:block;font:600 10.5px/1.2 'Space Mono',monospace;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}
.burbuja.bp{background:#0E2A47;color:var(--texto);border:1.5px solid var(--cian)}
.burbuja.bp::after{border-right:1.5px solid var(--cian);border-bottom:1.5px solid var(--cian)}
.burbuja.bp small{color:var(--cian2)}
.marca-barra{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;align-items:center;gap:18px;padding:12px 14px 12px 18px;border-radius:18px;box-shadow:0 18px 40px rgba(4,12,22,.45);white-space:nowrap}
.mb-sep{width:1px;height:34px}
.mb-txt{flex:none;width:300px;font:500 14px/1.4 Inter,sans-serif;white-space:normal}
.mb-btn{border-radius:999px;padding:11px 16px;font:700 14px/1 'Space Grotesk',sans-serif}
.tarjeta{position:absolute;width:340px;border-radius:16px;padding:18px 18px 16px;box-shadow:0 22px 50px rgba(4,12,22,.5)}
.tarjeta .ceja{font:700 11px/1 'Space Mono',monospace;letter-spacing:.14em;text-transform:uppercase}
.tarjeta h3{margin:8px 0 8px;text-wrap:balance}
.tarjeta p{margin:0 0 12px;font:400 14px/1.45 Inter,sans-serif}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.chips span{font:600 12px/1 'Space Grotesk',sans-serif;padding:7px 9px;border-radius:999px}
.botones{display:flex;gap:8px;flex-wrap:wrap}
.cerrar{position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:600 16px/1 sans-serif}
.nota{margin:12px 0 0;font:400 12px/1.4 Inter,sans-serif;opacity:.6}
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
.etiqueta{position:absolute;transform:translate(-50%,-50%);padding:8px 12px;border-radius:999px;border:1.5px solid}
`;

// En la página: la cámara de cada momento, pasar del mundo a la pantalla, poner algo encima y el brillo de lo que se toca
const AYUDA = `
const P = (x, y, z = 0) => [(x - y) * 32, (x + y) * 16 - z * 39];
const ANCHO = innerWidth, ALTO = innerHeight - 60;
const est = new URLSearchParams(location.search).get('e') || 'a', cam = ESTADOS[est];
const vw = ANCHO / cam.zoom, vh = ALTO / cam.zoom, x0 = cam.centro[0] - vw / 2, y0 = cam.centro[1] - vh / 2;
document.getElementById('dibujo').setAttribute('viewBox', [x0, y0, vw, vh].join(' '));
const aPantalla = (x, y, z) => { const [px, py] = P(x, y, z); return [(px - x0) * cam.zoom, (py - y0) * cam.zoom]; };
const capa = document.getElementById('capa');
const poner = (htmlTxt, x, y, z, clase = '', dx = 0, dy = 0) => { const [sx, sy] = aPantalla(x, y, z); const d = document.createElement('div'); d.className = clase; d.innerHTML = htmlTxt; d.style.left = (sx + dx) + 'px'; d.style.top = (sy + dy) + 'px'; capa.appendChild(d); return d; };
const brillo = (esquinas, z, color) => {
  const pts = esquinas.map(([x, y]) => aPantalla(x, y, z).map((n) => n.toFixed(1)).join(',')).join(' '), b = document.getElementById('brillo');
  b.setAttribute('viewBox', '0 0 ' + ANCHO + ' ' + ALTO);
  b.innerHTML = '<defs><filter id="f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs><polygon points="' + pts + '" fill="' + color + '22" stroke="' + color + '" stroke-width="10" stroke-linejoin="round" opacity=".55" filter="url(#f)"/><polygon points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linejoin="round" stroke-dasharray="10 7"/>';
};
capa.insertAdjacentHTML('beforeend', '<div class="volver"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>Volver a la calle</div>');
`;

// Escribe la maqueta y le saca una foto a cada momento (?e=a, ?e=b, ?e=c)
export async function maqueta({ id, titulo, r, componer, css = '', estados, guion }) {
  const { defs, cuerpo } = componer(r, RAIZ);
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>${titulo}</title><style>${CSS}${css}</style>
<div class="barra"><div class="marca"><div class="iso"><svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 2V15H16" stroke="#3F6DA0" stroke-width="1.6" fill="none"/><circle cx="5.5" cy="12" r="1.6" fill="#17C3B2"/><circle cx="9" cy="9.5" r="1.6" fill="#17C3B2"/><circle cx="14" cy="5" r="2" fill="#FF6B4A"/></svg></div><b>Bi<i>Plot</i></b><span>La oficina</span></div>
<div class="acciones"><span>Volver al sitio</span><span class="coral">Agenda tu diagnóstico</span></div></div>
<div id="escena"><svg id="dibujo" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${cuerpo}</svg></div>
<svg id="brillo"></svg>
<div class="capa" id="capa"></div>
<script>const ESTADOS = ${JSON.stringify(estados)};${AYUDA}${guion}</script></html>`;
  const trabajo = process.env.SALIDA || path.join(os.tmpdir(), 'sala-' + id), salida = path.join(trabajo, 'fotos');
  fs.mkdirSync(salida, { recursive: true });
  fs.writeFileSync(path.join(trabajo, 'mock.html'), html);
  await fotos(Object.keys(estados).map((e) => ({ html: path.join(trabajo, 'mock.html'), hash: '?e=' + e, png: path.join(salida, `mock-${e}.png`), ancho: 1440, alto: 900, escala: 2, espera: 1200 })));
}
