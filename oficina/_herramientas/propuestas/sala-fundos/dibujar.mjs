// Dibuja la propuesta de la sala de Fundos y la fotografía: la sala entera y acercamientos por zona.
// SALIDA=<carpeta> node dibujar.mjs [--solo entera,mirador,...]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { salaFundos, componer, P } from './sala.mjs';
import { fotos } from '../sala-nuhome/foto.mjs';

const trabajo = process.env.SALIDA || path.join(os.tmpdir(), 'sala-fundos'), salida = path.join(trabajo, 'fotos');
fs.mkdirSync(salida, { recursive: true });
const r = salaFundos();
const { defs, cuerpo } = componer(r, new URL('../../../../', import.meta.url).href);
fs.writeFileSync(path.join(trabajo, 'lugares.json'), JSON.stringify({ vb: r.vb, lugares: r.lugares }, null, 1));
const [, , vw, vh] = r.vb.split(' ').map(Number);
console.log('viewBox', r.vb, '·', r.usados.length, 'personajes');

const pagina = (vb, fondo = '#0B1726') => `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:${fondo};overflow:hidden}svg{display:block;width:100vw;height:100vh}</style>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet"><defs>${defs}</defs>${cuerpo}</svg>`;
fs.writeFileSync(path.join(trabajo, 'sala.html'), pagina(r.vb));

const zona = (x, y, z, ancho, prop = 16 / 10) => { const [cx, cy] = P(x, y, z); const h = ancho / prop; return `${Math.round(cx - ancho / 2)} ${Math.round(cy - h / 2)} ${Math.round(ancho)} ${Math.round(h)}`; };
const ZONAS = {
  entrada: zona(15.9, 11.2, 1.0, 440),
  maqueta: zona(10.6, 6.6, 1.0, 440),
  mirador: zona(2.4, 2.6, 1.3, 400),
  equipo: zona(3.0, 8.4, 1.2, 460),
  paisajes: zona(12.4, 1.4, 1.4, 560),
  salon: zona(17.2, 3.0, 1.0, 420),
  firma: zona(3.6, 11.4, 1.0, 400),
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
