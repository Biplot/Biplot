// Dibuja la propuesta de la sala de Nu Home y la fotografía: la sala entera y acercamientos por zona.
// node dibujar.mjs [--solo entera,taller,...]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { salaNuhome, componer, P } from './sala.mjs';
import { fotos } from './foto.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
// Las páginas y las fotos van a una carpeta de trabajo (no al repo): SALIDA=<carpeta> o la temporal del sistema
const trabajo = process.env.SALIDA || path.join(os.tmpdir(), 'sala-nuhome'), salida = path.join(trabajo, 'fotos');
fs.mkdirSync(salida, { recursive: true });
const r = salaNuhome();
const { defs, cuerpo } = componer(r, new URL('../../../../', import.meta.url).href);
fs.writeFileSync(path.join(trabajo, 'lugares.json'), JSON.stringify({ vb: r.vb, lugares: r.lugares }, null, 1));
const [vx, vy, vw, vh] = r.vb.split(' ').map(Number);
console.log('viewBox', r.vb, '·', r.usados.length, 'personajes');

const pagina = (vb, fondo = '#0B1726') => `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:${fondo};overflow:hidden}svg{display:block;width:100vw;height:100vh}</style>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet"><defs>${defs}</defs>${cuerpo}</svg>`;
fs.writeFileSync(path.join(trabajo, 'sala.html'), pagina(r.vb));

// Acercamientos: el centro (x, y, z del mundo) y el ancho de la ventana en píxeles del dibujo
const zona = (x, y, z, ancho, prop = 16 / 10) => { const [cx, cy] = P(x, y, z); const h = ancho / prop; return `${Math.round(cx - ancho / 2)} ${Math.round(cy - h / 2)} ${Math.round(ancho)} ${Math.round(h)}`; };
const ZONAS = {
  entrada: zona(15.9, 11.2, 1.0, 440),
  piloto: zona(13.4, 8.6, 1.1, 460),
  asesoria: zona(3.6, 10.6, 1.0, 460),
  taller: zona(3.8, 2.6, 1.2, 440),
  salon: zona(16.0, 2.0, 1.1, 460),
  biplot: zona(8.9, 12.7, 1.0, 230)
};
const solo = process.argv.includes('--solo') ? process.argv[process.argv.indexOf('--solo') + 1].split(',') : null;
const lista = [];
if (!solo || solo.includes('entera')) lista.push({ html: path.join(trabajo, 'sala.html'), png: path.join(salida, 'sala-entera.png'), ancho: 1600, alto: Math.round(1600 * vh / vw), escala: 2 });
for (const [id, vb] of Object.entries(ZONAS)) {
  if (solo && !solo.includes(id)) continue;
  const f = path.join(trabajo, `zona-${id}.html`); fs.writeFileSync(f, pagina(vb));
  lista.push({ html: f, png: path.join(salida, `zona-${id}.png`), ancho: 1200, alto: 750, escala: 2 });
}
await fotos(lista);
