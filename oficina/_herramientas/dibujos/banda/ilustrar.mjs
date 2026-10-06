// La ilustración de cada integrante en la línea de la banda, lista para ilustraciones.js: el dibujo de tres cuartos de
// cada uno (marco de 600 × 1260, suelo en y = 1240; Plotty y Atlas en 600 × 600), con la tinta a mano y sus letras
// convertidas en trazos (glifos.json), así se ve igual en la oficina, el kit y los videos sin cargar sus fuentes.
// ilustrar(id) → { vb, svg }. Los ids van sin prefijo: generar.mjs les pone el suyo a cada uno.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { TINTA } from './tinta.mjs';
import { architect, DEFS as DEFS_ARCHITECT } from './architect.mjs';
import { engine2 } from './engine.mjs';
import { lupe } from './lupe.mjs';
import { celda } from './celda.mjs';
import { grillo } from './grillo.mjs';
import { bucle } from './bucle.mjs';
import { tamandua } from './tamandua.mjs';
import { faro } from './faro.mjs';
import { pepa } from './pepa.mjs';
import { plotty } from './plotty.mjs';
import { atlas } from './atlas.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const GLIFOS = JSON.parse(readFileSync(path.join(aqui, 'glifos.json'), 'utf8'));

// Los once y las mascotas. The Architect y The Engine van sin la tinta a mano, como se aprobaron.
const DIBUJOS = {
  lupe: () => lupe(), architect: () => DEFS_ARCHITECT + architect(), celda: () => celda(), engine: () => engine2(),
  grilla: () => grillo(), bucle: () => bucle(), tamandua: () => tamandua(), faro: () => faro(), pepa: () => pepa(),
  plotty: () => plotty(), atlas: () => atlas()
};
const SIN_TINTA = ['architect', 'engine'];
const MASCOTAS = ['plotty', 'atlas'];

// La versión de Aby y Felipe en la línea de la banda entra cuando se apruebe. Mientras, la
// oficina sigue con su dibujo aprobado (ilustracion/aby.mjs y felipe.mjs). Para verla antes, PRENSA_BANDA=<carpeta con
// aby.mjs y felipe.mjs> la suma sin subirla al repo.
export async function prensa() {
  const carpeta = process.env.PRENSA_BANDA;
  if (!carpeta) return false;
  const ab = await import(path.resolve(carpeta, 'aby.mjs')), fe = await import(path.resolve(carpeta, 'felipe.mjs'));
  DIBUJOS.aby = () => ab.aby();
  DIBUJOS.felipe = () => fe.felipe();
  return true;
}

// Números con más de tres decimales (restos de las cuentas): se cortan a tres, sin mover nada.
const limpiar = (svg) => svg.replace(/-?\d+\.\d{4,}/g, (m) => String(Math.round(parseFloat(m) * 1000) / 1000));

// <text> → <path>: cada letra sale de glifos.json, escalada y puesta en su lugar; se quedan el relleno, el contorno, el
// orden de pintura y el giro del texto. Sin interletraje de la fuente (a este tamaño no se nota).
function trazos(svg) {
  return svg.replace(/<text([^>]*)>([^<]*)<\/text>/g, (todo, attrs, texto) => {
    const a = {};
    attrs.replace(/([a-z-]+)="([^"]*)"/g, (_, k, v) => { a[k] = v; });
    const fuente = /Alfa Slab One/.test(a['font-family']) ? GLIFOS.alfa : GLIFOS.archivo;
    const tam = parseFloat(a['font-size']), k = tam / fuente.em, sep = parseFloat(a['letter-spacing'] || 0);
    const letras = [...texto].map((c) => fuente.letras[c] || fuente.letras[c.toUpperCase()]);
    if (letras.some((l) => !l)) throw new Error('Falta una letra en glifos.json: «' + texto + '»');
    const ancho = letras.reduce((s, l) => s + l.a * k, 0) + sep * (letras.length - 1);
    let x = parseFloat(a.x) - (a['text-anchor'] === 'middle' ? ancho / 2 : a['text-anchor'] === 'end' ? ancho : 0);
    const y = parseFloat(a.y);
    let d = '';
    for (const l of letras) {
      const x0 = x;
      d += l.d.replace(/(-?\d+) (-?\d+)/g, (_, px, py) => `${Math.round((x0 + px * k) * 10) / 10} ${Math.round((y - py * k) * 10) / 10}`);
      x += l.a * k + sep;
    }
    const quedan = ['fill', 'stroke', 'stroke-width', 'stroke-linejoin', 'paint-order', 'transform', 'opacity']
      .filter((n) => a[n] != null).map((n) => ` ${n}="${a[n]}"`).join('');
    return `<path d="${d}"${quedan}/>`;
  });
}

export function ilustrar(id) {
  const crudo = trazos(limpiar(DIBUJOS[id]()));
  const svg = SIN_TINTA.includes(id) ? crudo : `${TINTA}<g filter="url(#a-mano)">${crudo}</g>`;
  return { vb: MASCOTAS.includes(id) ? '0 0 600 600' : '0 0 600 1260', svg };
}

export const idsBanda = () => Object.keys(DIBUJOS);
