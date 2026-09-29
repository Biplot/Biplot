// Fotografía una sala propuesta: la sala entera y sus acercamientos (los de ZONAS en su sala.mjs).
// SALIDA=<carpeta> node dibujar-sala.mjs <haru|eleven|rumbo> [--solo entera,barra,...]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fotos } from './sala-nuhome/foto.mjs';

const id = process.argv[2];
const m = await import(`./sala-${id}/sala.mjs`);
const trabajo = process.env.SALIDA || path.join(os.tmpdir(), 'sala-' + id), salida = path.join(trabajo, 'fotos');
fs.mkdirSync(salida, { recursive: true });
const r = m.sala();
const { defs, cuerpo } = m.componer(r, new URL('../../../', import.meta.url).href);
fs.writeFileSync(path.join(trabajo, 'lugares.json'), JSON.stringify({ vb: r.vb, lugares: r.lugares }, null, 1));
const [, , vw, vh] = r.vb.split(' ').map(Number);
console.log('viewBox', r.vb, '·', r.usados.length, 'personajes');
const pagina = (vb) => `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#0B1726;overflow:hidden}svg{display:block;width:100vw;height:100vh}</style>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet"><defs>${defs}</defs>${cuerpo}</svg>`;
fs.writeFileSync(path.join(trabajo, 'sala.html'), pagina(r.vb));
const zona = ([x, y, z, ancho], prop = 16 / 10) => { const [cx, cy] = m.P(x, y, z); const h = ancho / prop; return `${Math.round(cx - ancho / 2)} ${Math.round(cy - h / 2)} ${Math.round(ancho)} ${Math.round(h)}`; };
const solo = process.argv.includes('--solo') ? process.argv[process.argv.indexOf('--solo') + 1].split(',') : null;
const lista = [];
if (!solo || solo.includes('entera')) lista.push({ html: path.join(trabajo, 'sala.html'), png: path.join(salida, 'sala-entera.png'), ancho: 1600, alto: Math.round(1600 * vh / vw), escala: 2 });
for (const [z, c] of Object.entries(m.ZONAS || {})) {
  if (solo && !solo.includes(z)) continue;
  const f = path.join(trabajo, `zona-${z}.html`); fs.writeFileSync(f, pagina(zona(c)));
  lista.push({ html: f, png: path.join(salida, `zona-${z}.png`), ancho: 1200, alto: 750, escala: 2 });
}
await fotos(lista);
