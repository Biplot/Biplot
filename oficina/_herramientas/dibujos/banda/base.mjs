// La línea nueva de la mesa de dos: contorno negro limpio y grueso, color plano, una sola sombra dura por pieza y
// negros sólidos. Cada pieza se pinta, se le recortan sus sombras dentro y se le pasa el contorno encima.
import { curva, miembro, pincel } from './estilo.mjs';
export { curva, miembro, pincel };

export const K = '#0C0D11';          // la tinta
export const W = 6;                  // contorno de las formas grandes
let uid = 0;
export const reiniciar = (p = 'r') => { uid = 0; prefijo = p; };
let prefijo = 'r';

export const nuevoId = () => `${prefijo}${uid++}`;
export const r1 = (n) => Math.round(n * 10) / 10;
export const pol = (pts) => 'M' + pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join(' L') + ' Z';
export const P = (d, c, extra = '') => `<path d="${d}" fill="${c}"${extra}/>`;
export const B = (d, w = W, color = K) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
export const L = (d, w = 3, color = K) => B(d, w, color);
export const negro = (d) => P(d, K);

// Una pieza: su color, sus sombras recortadas adentro y el contorno encima
// peso: una copia en tinta corrida hacia la sombra (abajo a la derecha), que engruesa el contorno de ese lado
export function pieza(d, color, sombras = [], { w = W, borde = true, peso = 2.4 } = {}) {
  const id = `${prefijo}${uid++}`;
  const dentro = sombras.length ? `<g clip-path="url(#${id})">${sombras.map((s) => (typeof s === 'string' ? s : P(s[0], s[1]))).join('')}</g>` : '';
  const sombraTinta = borde && peso ? P(d, K, ` transform="translate(${peso} ${r1(peso * 1.15)})" stroke="${K}" stroke-width="${w}" stroke-linejoin="round"`) : '';
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>` + sombraTinta + P(d, color) + dentro + (borde ? B(d, w) : '');
}

// Achica un pedazo del dibujo (una nariz, por ejemplo) alrededor de su punto de anclaje sin adelgazar la tinta: los
// grosores de línea y el corrimiento de la tinta de `pieza` se compensan con la escala.
export function achicar(svg, cx, cy, s) {
  const tinta = svg
    .replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${r1(w / s)}"`)
    .replace(/transform="translate\(([-\d.]+) ([-\d.]+)\)"/g, (_, x, y) => `transform="translate(${r1(x / s)} ${r1(y / s)})"`);
  return `<g transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${tinta}</g>`;
}

// Los números de camiseta van chicos y discretos (ronda 4 del elenco: «que pasen más desapercibidos»): el número se
// achica alrededor de su centro y su contorno se adelgaza con él
export const ESCALA_NUMERO = 0.55;
export const numeroChico = (svg, cx, cy, s = ESCALA_NUMERO) => `<g transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${svg}</g>`;
