// La tinta del video «Del plano a la máquina»: referencia de estética, el cómic británico alternativo de los 2000.
// Trazo de pincel con peso (más grueso del lado de la sombra), sombras duras de un tono, negros sólidos, trama de medios
// tonos y un contorno que «hierve» (filtro de desplazamiento con tres semillas que se alternan).
export const T = '#0B1726';
export const P = {
  azul: '#0E2A47', azul9: '#091D33', azul7: '#17446F', azul6: '#35679A', azul3: '#B9C8D8',
  cian: '#17C3B2', cianL: '#7FD8CF', cianS: '#0A8A7E', niebla: '#F2F4F7',
  naranjo: '#F5883A', naranjoS: '#C9661F',
  nhNegro: '#1C1208', nhCrema: '#F4EFE6', nhOro: '#D4A017', nhOroS: '#8B6F3A', nhOroL: '#F0C84A'
};
export const r = (n) => Math.round(n * 10) / 10;
const pt = (p) => `${r(p[0])} ${r(p[1])}`;

// ── Geometría ──
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const len = (a) => Math.hypot(a[0], a[1]) || 1;
const unit = (a) => mul(a, 1 / len(a));
const normal = (a) => { const u = unit(a); return [-u[1], u[0]]; };

// Curva suave por puntos (Catmull-Rom a Bézier). Devuelve los segmentos «C …» desde el primer punto.
export function suave(pts, k = 1) {
  let s = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = add(p1, mul(sub(p2, p0), k / 6)), c2 = sub(p2, mul(sub(p3, p1), k / 6));
    s += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return s;
}
export const curva = (pts, cerrada) => `M${pt(pts[0])}${suave(cerrada ? [...pts, pts[0]] : pts)}${cerrada ? ' Z' : ''}`;

// Un miembro (pierna, manga, brazo) alrededor de una línea de articulaciones, con su ancho en cada una. La punta
// es redonda; el inicio, plano (queda bajo el torso o la manga).
export function miembro(pts, anchos, { punta = 'redonda' } = {}) {
  const n = pts.length, izq = [], der = [];
  for (let i = 0; i < n; i++) {
    const t = sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]), no = normal(t), w = anchos[i] / 2;
    izq.push(add(pts[i], mul(no, w))); der.push(sub(pts[i], mul(no, w)));
  }
  const tf = unit(sub(pts[n - 1], pts[n - 2])), wf = anchos[n - 1] * (punta === 'redonda' ? 0.62 : 0.12);
  return `M${pt(izq[0])}${suave(izq)} C${pt(add(izq[n - 1], mul(tf, wf)))} ${pt(add(der[n - 1], mul(tf, wf)))} ${pt(der[n - 1])}` +
    `${suave(der.slice().reverse())} Z`;
}
// La franja de sombra de un miembro: del borde (lado +1 o -1) hacia adentro, una fracción del ancho
export function franja(pts, anchos, lado = -1, frac = 0.38) {
  const n = pts.length, afuera = [], adentro = [];
  for (let i = 0; i < n; i++) {
    const t = sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]), no = mul(normal(t), lado), w = anchos[i] / 2;
    afuera.push(add(pts[i], mul(no, w))); adentro.push(add(pts[i], mul(no, w * (1 - 2 * frac))));
  }
  return `M${pt(afuera[0])}${suave(afuera)} L${pt(adentro[n - 1])}${suave(adentro.slice().reverse())} Z`;
}
// Pincelada que se afina en las puntas, sobre una Bézier cúbica
export function pincel(p0, p1, p2, p3, w, { ini = 0.2, fin = 0.35 } = {}) {
  const N = 18, izq = [], der = [];
  const b = (t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; };
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = b(Math.max(0, t - 0.02)), c = b(Math.min(1, t + 0.02)), no = normal(sub(c, a));
    const g = Math.min(1, t / ini, (1 - t) / fin), ancho = w * Math.sin(Math.max(0, Math.min(1, g)) * Math.PI / 2) / 2 + 0.25;
    const p = b(t); izq.push(add(p, mul(no, ancho))); der.push(sub(p, mul(no, ancho)));
  }
  return `<path d="M${izq.map(pt).join(' L')} L${der.reverse().map(pt).join(' L')} Z" fill="${T}"/>`;
}
// Pincelada rápida por puntos (Catmull-Rom convertido a una cúbica por tramo, afinada en las puntas)
export function pinceles(lista, w) { return lista.map((q) => pincel(q[0], q[1], q[2], q[3], q[4] || w)).join(''); }

// ── Tinta ──
// Forma con contorno de pincel: una silueta de tinta corrida hacia la sombra (el peso) y encima la forma con su borde.
export function tinta(d, fill, { w = 4.2, peso = [2.4, 2.8] } = {}) {
  return `<path d="${d}" fill="${T}" transform="translate(${peso[0]} ${peso[1]})"/>` +
    `<path d="${d}" fill="${fill}" stroke="${T}" stroke-width="${w}" stroke-linejoin="round"/>`;
}
export const plano = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
export const negro = (d) => `<path d="${d}" fill="${T}"/>`;
export const trama = (d, id = 'trama') => `<path d="${d}" fill="url(#${id})"/>`;
export const linea = (d, w = 3, color = T, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

// Definiciones: tramas de medios tonos, el hervor del trazo, papel, grano y resplandor
export function defs({ semilla = 3, hervor = 2.6, p = '' } = {}) {
  const q = (id) => p + id;
  return `<defs>
  <pattern id="${q('trama')}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4.5" cy="4.5" r="2" fill="${T}" opacity=".5"/></pattern>
  <pattern id="${q('trama-fina')}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="3" cy="3" r="1.25" fill="${T}" opacity=".45"/></pattern>
  <pattern id="${q('trama-cian')}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="5" cy="5" r="2.1" fill="${P.cianL}" opacity=".55"/></pattern>
  <pattern id="${q('trama-oro')}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="5" cy="5" r="2.1" fill="${P.nhOroL}" opacity=".5"/></pattern>
  <filter id="${q('hierve')}" x="-4%" y="-4%" width="108%" height="108%">
    <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="${semilla}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="${hervor}" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="${q('papel')}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${semilla + 7}" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0"/>
  </filter>
  <filter id="${q('fotocopia')}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="${semilla + 2}" result="m"/>
    <feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.3"/>
  </filter>
  <filter id="${q('brillo')}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="${q('brillo-chico')}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
</defs>`;
}
// Grano y papel sobre todo el cuadro
export function grano(W, H, p = '', { opGrano = 0.2, opMancha = 0.18 } = {}) {
  return `<rect width="${W}" height="${H}" filter="url(#${p}papel)" opacity="${opGrano}" style="mix-blend-mode:overlay"/>` +
    `<rect width="${W}" height="${H}" fill="${T}" filter="url(#${p}fotocopia)" opacity="${opMancha}"/>`;
}
