// El barrio de BiPlot HQ (barrio.js): la oficina cerrada, la calle principal con los locales de los proyectos, el pasaje
// con el directorio, la plaza y El Archivo, y las piezas con que el navegador arma las calles por rubro desde datos.js.
// Coordenadas del mundo de escena.js: la oficina ocupa x 0..24, y 0..20 y la calle pasa por delante (y > 20).
//
// La calle principal sale en tres capas, para que escena.js la monte sobre la oficina en el orden correcto:
//   suelo  (losas, vereda, calzada, pasto, luces en el piso), que va antes que todo lo demás del barrio;
//   atras  (locales, plaza, pasaje), que queda detrás de la franja por donde caminan los caminantes;
//   frente (faroles, árboles, bancas y la gente de la vereda), que queda delante de esa franja.
// Los locales se ven siempre cerrados, con el nombre y el logo de su empresa pintados en el techo: por dentro se ven
// en la vista previa (las plantillas, en salas.js) y en la sala de cada empresa. La oficina también se ve cerrada
// (hq) hasta que alguien entra: escena.js la dibuja encima del interior y la abre al entrar.
import { escena, P } from './maqueta.mjs';
import * as S from './locales.mjs';
import * as T from './plantillas.mjs';
import * as EN from './entorno.mjs';
import { EA } from './salas-grandes.mjs';
import { VISITANTES, medida } from './visitantes.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
const { W, D } = S;
const FUENTE = `font-family="'Space Grotesk','DejaVu Sans',sans-serif"`, MONO = `font-family="'Space Mono','DejaVu Sans Mono',monospace"`;
const hex = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const marca = (c) => typeof c === 'string' && c.charAt(0) === '§';
const tono = (c, t) => marca(c) ? `${c.slice(0, -1)}.t${Math.round(t * 100)}§` : '#' + hex(c).map(v => Math.round(v + (6 - v) * t).toString(16).padStart(2, '0')).join('');
const claro = (c, t) => marca(c) ? `${c.slice(0, -1)}.c${Math.round(t * 100)}§` : '#' + hex(c).map(v => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0')).join('');

// Geometría del barrio (escena.js la recibe en barrio.js)
export const G = {
  yf: 20.15,            // fondo de los locales de la calle principal
  paseo: 24.45,         // donde empieza la vereda
  calzada: 29, y1: 31,  // la calzada de la calle principal
  x1: 40.4,             // donde terminan la calle y la plaza
  plaza: 24,            // la plaza parte al costado de la oficina
  paso: 4.7,            // de un local al siguiente
  banda: [25.8, 27.3],  // la franja de la vereda por donde caminan los caminantes
  fila: 11,             // fondo de una calle por rubro: locales (4,3), vereda (4,55) y calzada (2)
  avenida: [-3.2, -0.6] // la avenida que une las calles por rubro, al costado izquierdo
};
// Los locales de la calle principal, de izquierda a derecha, con el pasaje a BiPlot HQ entre Eleven y Rumbo
export const PRINCIPAL = [['nuhome', 0.15], ['fundos', 4.85], ['haru', 9.55], ['eleven', 14.25], ['rumbo', 26.15], ['libre', 30.85], ['archivo', 35.55]];
const PASAJE = [18.95, 24.05];

// El nombre de cada empresa, en su techo y en su letrero
const LETRERO = { nuhome: 'NU HOME', fundos: 'FUNDOS', haru: 'HARU', eleven: 'ELEVEN', rumbo: 'RUMBO', libre: 'SE ARRIENDA', archivo: 'EL ARCHIVO' };
// Los que caminan por la vereda (escena.js los mueve)
export const CAMINANTES = ['caminante', 'atleta'];
// La gente de paso en las calles por rubro (escena.js pone una por calle)
export const DE_PASO = ['clienta', 'abuelo', 'turista', 'senora', 'repartidor', 'cliente', 'mama'];

/* ───────── Los logos del techo ───────── */
// Un cuadrado de s × s. El logo real cuando lo tenemos (§M§ = carpeta de medios); Eleven y Rumbo llevan la misma
// marca que su sala, sin inventar otra.
const LOGO = {
  fundos: (s) => `<rect width="${s}" height="${s}" rx="${r1(s * .16)}" fill="#10241A"/><image href="§M§logo-fundos.webp" x="${r1(s * .08)}" y="${r1(s * .19)}" width="${r1(s * .84)}" height="${r1(s * .61)}"/>`,
  haru: (s) => `<image href="§M§logo-haru.webp" width="${s}" height="${s}"/>`,
  nuhome: (s) => `<rect width="${s}" height="${s}" rx="${r1(s * .16)}" fill="#1C1917"/><image href="§M§logo-nuhome.webp" x="${r1(s * .1)}" y="${r1(s * .2)}" width="${r1(s * .8)}" height="${r1(s * .565)}"/>`,
  eleven: (s) => `<rect width="${s}" height="${s}" rx="${r1(s * .16)}" fill="#17C3B2"/><text x="${r1(s / 2)}" y="${r1(s * .7)}" text-anchor="middle" ${FUENTE} font-weight="700" font-size="${r1(s * .56)}" fill="#0B1726">11</text>`,
  rumbo: (s) => `<rect width="${s}" height="${s}" rx="${r1(s * .16)}" fill="#0E2A47" stroke="#3E9C95" stroke-width="${r1(s * .04)}"/><g transform="translate(${r1(s * .1)} ${r1(s * .22)}) scale(${r1(s / 62 * 100) / 100})"><path d="M26 18L26 -4" stroke="#F2F4F7" stroke-width="2.4"/><path d="M26 -4L48 3L26 10Z" fill="#17C3B2"/><path d="M2 38L26 18L46 34L34 40L26 32L16 42Z" fill="#DDF4F1"/></g>`,
  archivo: (s) => `<rect width="${s}" height="${s}" rx="${r1(s * .16)}" fill="#0E2A47" stroke="#7FD8CF" stroke-width="${r1(s * .035)}"/>` +
    ['#6FAF6B', '#E0524A', '#17C3B2', '#E0B341', '#8E6BB8'].map((c, i) => `<rect x="${r1(s * (.16 + i * .14))}" y="${r1(s * (.2 + (i % 2) * .05))}" width="${r1(s * .1)}" height="${r1(s * .58)}" rx="${r1(s * .02)}" fill="${c}"/>`).join('')
};
// Los casos que llegan sin logo llevan el dibujo de su rubro, en el color del caso (escena.js elige por calle)
const PICTO = {
  inmobiliaria: '<path d="M22 50L50 26L78 50V78H22Z" fill="none" stroke="#F2F4F7" stroke-width="7" stroke-linejoin="round"/><path d="M42 78V60H58V78" fill="#F2F4F7"/>',
  comida: '<path d="M24 52H76Q74 76 50 78Q26 76 24 52Z" fill="#F2F4F7"/><path d="M40 22L52 46M58 20L60 46" stroke="#F2F4F7" stroke-width="6" stroke-linecap="round"/>',
  servicios: '<circle cx="50" cy="50" r="16" fill="none" stroke="#F2F4F7" stroke-width="8"/><path d="M50 20V30M50 70V80M20 50H30M70 50H80M29 29L36 36M64 64L71 71M29 71L36 64M64 36L71 29" stroke="#F2F4F7" stroke-width="8" stroke-linecap="round"/>',
  construccion: '<path d="M22 64Q22 34 50 32Q78 34 78 64Z" fill="#F2F4F7"/><rect x="16" y="64" width="68" height="10" rx="5" fill="#F2F4F7"/><path d="M50 32V52" stroke="§C§" stroke-width="6"/>',
  comercio: '<path d="M22 38H78L72 78H28Z" fill="#F2F4F7"/><path d="M38 38V32Q38 22 50 22Q62 22 62 32V38" fill="none" stroke="#F2F4F7" stroke-width="6"/>',
  salud: '<path d="M42 22H58V42H78V58H58V78H42V58H22V42H42Z" fill="#F2F4F7"/>',
  otro: '<path d="M50 20L58 42L80 50L58 58L50 80L42 58L20 50L42 42Z" fill="#F2F4F7"/>'
};
export const INSIGNIAS = Object.fromEntries(Object.entries(PICTO).map(([id, p]) => [id, (s) => `<rect width="${s}" height="${s}" rx="${r1(s * .16)}" fill="§C§"/><g transform="scale(${r1(s / 100 * 100) / 100})">${p}</g>`]));

/* ───────── Piezas de un local ───────── */

// Frente: zócalo con la puerta al medio, dos pilares y el letrero colgante. En coordenadas del local (k relativo).
function frente(L, c, letrero, ancho = 116, conBandera = true) {
  const y = D, puerta = [1.7, 2.9], k = 9.0;
  const zocalo = { t: '#5E7892', l: '#4A6582', r: '#3A5470' }, pilar = { t: '#6B84A0', l: '#4A6582', r: '#3A5470' };
  L.caja(0.02, y - 0.12, 0, puerta[0] - 0.02, 0.12, 0.28, zocalo, k);
  L.caja(puerta[1], y - 0.12, 0, W - 0.02 - puerta[1], 0.12, 0.28, zocalo, k + 0.001);
  L.caja(0.02, y - 0.12, 0, 0.12, 0.12, 2.35, pilar, k + 0.002);
  L.caja(W - 0.14, y - 0.12, 0, 0.12, 0.12, 2.35, pilar, k + 0.003);
  if (conBandera) bandera(L, c, letrero, ancho, k);
}
// Letrero colgante, perpendicular a la fachada: cuelga sobre la vereda y se lee desde ella
function bandera(L, c, letrero, ancho = 116, k = 9.0) {
  const y = D, x0 = W - 0.08, y0 = y - 0.06, z = 1.85, h = 34;
  L.linea([[x0, y0, z + 0.12], [x0, y0 + ancho / 100 + 0.1, z + 0.12]], '#1E2A38', 2.4, k + 0.004);
  const [px, py] = L.P(x0, y0 + ancho / 100 + 0.05, z + 0.08);
  const texto = marca(letrero)
    ? `<text x="${ancho / 2}" y="23" text-anchor="middle" ${FUENTE} font-weight="700" font-size="§NF:15:14:12§" fill="#F2F4F7" §NTL:0:${ancho - 14}§>${letrero}</text>`
    : EN.txt(ancho / 2, 23, letrero, letrero.length > 12 ? 12 : 15, '#F2F4F7', ' text-anchor="middle"');
  L.add(k + 0.005, `<g transform="matrix(.32,-.16,0,.39,${r1(px)},${r1(py)})"><rect width="${ancho}" height="${h}" rx="5" fill="#0E2A47" stroke="${c}" stroke-width="2.5"/>${texto}</g>`);
}
// Lo del frente que va en el suelo: el felpudo con el color del local y la luz sobre la vereda
function sueloLocal(E, ox, oy, c) {
  const puerta = [1.7, 2.9];
  E.planoZ(ox + puerta[0] + 0.1, oy + D - 0.02, 0.012, `<rect width="${(puerta[1] - puerta[0] - 0.2) * 100}" height="60" rx="8" fill="${c}" opacity=".85"/>`, -1100 + ox * 0.001);
  const [lx, ly] = P(ox + W / 2, oy + D + 0.9, 0);
  E.add(-1150 + ox * 0.001, `<ellipse cx="${r1(lx)}" cy="${r1(ly)}" rx="96" ry="30" fill="url(#luz-local)"/>`);
}
// La gente de un local, en coordenadas del local
function gente(L, lista) { for (const g of lista) L.pj(g[0], g[1], g[2], g[3] || 0, g[4] || 'd', g[5] || EA, g[6]); }

// El techo de un local: el logo y el nombre de la empresa pintados, como el isotipo en el techo de la oficina.
// Un cuadro de 400 × 300 (4 × 3 baldosas) en el plano del techo; el texto corre a lo largo de la calle.
// cs.logo: el logo (s → svg) o la marca §LOGO§, que escena.js cambia por el logo o el dibujo del rubro de cada caso.
function techo(cs, estado) {
  const A = 400, H = 300, s = 168, n = cs.n;
  if (estado === 'arriendo') {
    return `<rect x="8" y="8" width="${A - 16}" height="${H - 16}" rx="22" fill="rgba(127,216,207,.06)" stroke="#7FD8CF" stroke-width="7" stroke-dasharray="22 14"/>` +
      `<text x="${A / 2}" y="138" text-anchor="middle" ${FUENTE} font-weight="700" font-size="58" fill="#7FD8CF" letter-spacing="2">SE ARRIENDA</text>` +
      `<text x="${A / 2}" y="206" text-anchor="middle" ${MONO} font-weight="700" font-size="32" fill="#B9C8D8">TU PROYECTO AQUÍ</text>`;
  }
  const logo = typeof cs.logo === 'function' ? cs.logo(s) : cs.logo || '';
  const fs = marca(n) ? '§NF:66:54:44§' : n.length <= 9 ? 66 : n.length <= 12 ? 54 : 44;
  const tl = marca(n) ? ' §NTL:0:380§' : n.length > 12 ? ' textLength="380" lengthAdjust="spacingAndGlyphs"' : '';
  const pie = estado === 'diagnostico' ? `<rect x="${A / 2 - 118}" y="${H - 30}" width="236" height="28" rx="14" fill="#F4ECD8"/><text x="${A / 2}" y="${H - 9}" text-anchor="middle" ${MONO} font-weight="700" font-size="20" fill="#0B1726">PRÓXIMAMENTE</text>`
    : estado === 'obra' ? `<rect x="${A / 2 - 90}" y="${H - 30}" width="180" height="28" rx="14" fill="#E0B341"/><text x="${A / 2}" y="${H - 9}" text-anchor="middle" ${MONO} font-weight="700" font-size="20" fill="#0B1726">EN OBRA</text>`
    : `<rect x="${A / 2 - 90}" y="${H - 22}" width="180" height="10" rx="5" fill="${cs.c}"/>`;
  return (logo ? `<g transform="translate(${(A - s) / 2} 8)">${logo}</g>` : '') +
    `<text x="${A / 2}" y="${H - 44}" text-anchor="middle" ${FUENTE} font-weight="700" font-size="${fs}" letter-spacing="1" fill="#F2F4F7"${tl}>${n}</text>` + pie;
}

// El local cerrado: el edificio con su techo, su toldo y su letrero (en coordenadas del mundo)
function cerrado(E, x, y, cs, k) {
  const h = 2.5, c = cs.c, estado = cs.estado || 'abierto';
  const muroF = '#2B4C70', muroD = '#1F3B5A', techoC = '#2E5A85';
  const add = (dk, svg) => E.add(k + dk, svg);
  E.caja(x, y, 0, W, D, h, { t: techoC, l: muroF, r: muroD }, k);
  // El pretil, del color de la marca (punteado si se arrienda, amarillo si está en obra)
  const pretil = estado === 'arriendo' ? `stroke="${claro(techoC, 0.22)}" stroke-width="2"` : `stroke="${estado === 'obra' ? '#E0B341' : c}" stroke-width="3"`;
  add(0.001, E.poly([[x + 0.12, y + 0.12, h + 0.001], [x + W - 0.12, y + 0.12, h + 0.001], [x + W - 0.12, y + D - 0.12, h + 0.001], [x + 0.12, y + D - 0.12, h + 0.001]], `fill="none" ${pretil}`));
  const [tx, ty] = P(x + 0.3, y + 0.95, h + 0.003);
  add(0.0015, `<g transform="matrix(.32,.16,-.32,.16,${r1(tx)},${r1(ty)})">${techo(cs, estado)}</g>`);
  // El equipo de aire, atrás a la derecha (fuera del cuadro pintado)
  if (estado !== 'obra') E.caja(x + W - 1.25, y + 0.22, h, 0.8, 0.5, 0.3, { t: '#8FA3B8', l: '#6B7A8C', r: '#5B6B7F' }, k + 0.002);
  const vidrio = estado === 'arriendo' ? '#0B1726' : estado === 'diagnostico' ? '#E8DFC8' : estado === 'obra' ? '#3A4A5C' : '#FFE7B0';
  add(0.01, E.poly([[x + 0.3, y + D + 0.002, 0.15], [x + W - 0.3, y + D + 0.002, 0.15], [x + W - 0.3, y + D + 0.002, 1.3], [x + 0.3, y + D + 0.002, 1.3]], `fill="${vidrio}" opacity="${estado === 'abierto' || estado === 'inauguracion' ? 0.62 : 0.9}"`) +
    [1.2, 2.3, 3.4].map(dx => E.poly([[x + dx, y + D + 0.003, 0.15], [x + dx, y + D + 0.003, 1.3]], `stroke="${muroF}" stroke-width="2.4"`)).join('') +
    E.poly([[x + 2.0, y + D + 0.004, 0.15], [x + 2.6, y + D + 0.004, 0.15], [x + 2.6, y + D + 0.004, 1.1], [x + 2.0, y + D + 0.004, 1.1]], `fill="${tono(muroF, 0.3)}"`));
  add(0.011, [0.8, 2.2, 3.4].map(dy => E.poly([[x + W + 0.002, y + dy, 0.6], [x + W + 0.002, y + dy + 0.6, 0.6], [x + W + 0.002, y + dy + 0.6, 1.3], [x + W + 0.002, y + dy, 1.3]], `fill="${estado === 'arriendo' ? '#0B1726' : '#FFE7B0'}" opacity="${estado === 'arriendo' ? 0.8 : 0.4}"`)).join(''));
  if (estado !== 'arriendo' && estado !== 'obra') add(0.02, E.poly([[x + 0.2, y + D, 1.52], [x + W - 0.2, y + D, 1.52], [x + W - 0.2, y + D + 0.5, 1.28], [x + 0.2, y + D + 0.5, 1.28]], `fill="${c}"`) + E.poly([[x + 0.2, y + D + 0.5, 1.28], [x + W - 0.2, y + D + 0.5, 1.28], [x + W - 0.2, y + D + 0.5, 1.18], [x + 0.2, y + D + 0.5, 1.18]], `fill="${tono(c, 0.25)}"`));
  const letrero = estado === 'arriendo' ? 'SE ARRIENDA' : estado === 'obra' ? 'EN OBRA' : estado === 'diagnostico' ? 'PRÓXIMAMENTE' : cs.n;
  const fs = marca(letrero) ? '§NF:23:19:15§' : letrero.length > 12 ? 15 : letrero.length > 9 ? 19 : 23;
  const fondo = estado === 'arriendo' ? '#0E2A47' : estado === 'obra' ? '#E0B341' : estado === 'diagnostico' ? '#F4ECD8' : c;
  const tinta = estado === 'arriendo' ? '#7FD8CF' : estado === 'obra' || estado === 'diagnostico' ? '#0B1726' : '#FFFFFF';
  const [sx, sy] = P(x + 0.35, y + D + 0.005, 2.3);
  add(0.03, `<g transform="matrix(.32,.16,0,.39,${r1(sx)},${r1(sy)})"><rect width="${(W - 0.7) * 100}" height="56" rx="8" fill="${fondo}"${estado === 'arriendo' ? ' stroke="#7FD8CF" stroke-width="4" stroke-dasharray="10 7"' : ''}/>` +
    `<text x="${(W - 0.7) * 50}" y="37" text-anchor="middle" ${FUENTE} font-weight="700" font-size="${fs}" letter-spacing="1.5" fill="${tinta}"${marca(letrero) ? ' §NTL:0:350§' : ''}>${letrero}</text></g>`);
  if (cs.mano && estado === 'abierto') { const [ex, ey] = P(x + W - 0.5, y + D + 0.01, 2.2); add(0.031, `<path transform="translate(${r1(ex)} ${r1(ey)}) scale(.9)" d="M0 -8L2.4 -2.6L8 -2.4L3.6 1.2L5 7L0 3.8L-5 7L-3.6 1.2L-8 -2.4L-2.4 -2.6Z" fill="#F2F4F7" stroke="#0B1726" stroke-width="1"/>`); }
  if (estado === 'obra') {
    let a = '';
    for (let xx = x + 0.2; xx <= x + W - 0.1; xx += 1.1) a += E.poly([[xx, y + D + 0.25, 0], [xx, y + D + 0.25, h + 0.2]], '');
    for (const z of [0.9, 1.8]) a += E.poly([[x + 0.2, y + D + 0.25, z], [x + W - 0.2, y + D + 0.25, z]], '');
    add(0.04, `<g stroke="#B9C8D8" stroke-width="2">${a}</g>`);
    E.linea([[x + 3.6, y + 1.2, h], [x + 3.6, y + 1.2, h + 2.4], [x + 0.6, y + 1.2, h + 2.4]], '#E0B341', 3.4, k + 0.05);
    E.linea([[x + 1.0, y + 1.2, h + 2.4], [x + 1.0, y + 1.2, h + 1.4]], '#3A424E', 1.4, k + 0.051);
    E.caja(x + 0.75, y + 0.95, h + 1.1, 0.5, 0.5, 0.3, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' }, k + 0.052);
  }
  if (estado === 'inauguracion') {
    const [bx, by] = P(x + 0.35, y + D + 0.3, 1.5);
    add(0.06, ['#E0524A', '#F2C14E', c].map((col, i) => `<path d="M${r1(bx)} ${r1(by + 30)}Q${r1(bx + (i - 1) * 6)} ${r1(by + 10)} ${r1(bx + (i - 1) * 12)} ${r1(by - 8 - (i % 2) * 8)}" stroke="#B9C8D8" stroke-width="1" fill="none"/><ellipse cx="${r1(bx + (i - 1) * 12)}" cy="${r1(by - 14 - (i % 2) * 8)}" rx="7" ry="9" fill="${col}"/>`).join(''));
    E.linea([[x + 0.8, y + D + 0.02, 0.8], [x + W - 0.8, y + D + 0.02, 0.8]], '#E0524A', 3, k + 0.061);
  }
}
// El Archivo de lejos: un edificio que sube un piso cada diez casos, con una carpeta de color por ventana
function archivoCerrado(E, x, y, pisos, k) {
  const h = 2.0 * pisos + 0.6, colores = ['#6FAF6B', '#E0524A', '#17C3B2', '#E0B341', '#8E6BB8', '#F29A6B'];
  E.caja(x, y, 0, W, D, h, { t: '#35679A', l: '#2B4C70', r: '#1F3B5A' }, k);
  E.add(k + 0.001, E.poly([[x + 0.12, y + 0.12, h + 0.001], [x + W - 0.12, y + 0.12, h + 0.001], [x + W - 0.12, y + D - 0.12, h + 0.001], [x + 0.12, y + D - 0.12, h + 0.001]], 'fill="none" stroke="#7FD8CF" stroke-width="3"'));
  const [tx, ty] = P(x + 0.3, y + 0.95, h + 0.003);
  E.add(k + 0.0015, `<g transform="matrix(.32,.16,-.32,.16,${r1(tx)},${r1(ty)})">${techo({ n: 'EL ARCHIVO', c: '#7FD8CF', logo: LOGO.archivo }, 'abierto')}</g>`);
  let v = '';
  for (let p = 0; p < pisos; p++) for (let xx = x + 0.4; xx < x + W - 0.5; xx += 0.95) v += E.poly([[xx, y + D + 0.002, 0.5 + p * 2], [xx + 0.55, y + D + 0.002, 0.5 + p * 2], [xx + 0.55, y + D + 0.002, 1.8 + p * 2], [xx, y + D + 0.002, 1.8 + p * 2]], `fill="${colores[Math.round(xx * 3 + p) % colores.length]}" opacity=".75"`);
  E.add(k + 0.01, v);
  const [sx, sy] = P(x + 0.3, y + D + 0.006, h - 0.1);
  E.add(k + 0.02, `<g transform="matrix(.32,.16,0,.39,${r1(sx)},${r1(sy)})"><rect width="${(W - 0.6) * 100}" height="46" rx="8" fill="#0E2A47" stroke="#7FD8CF" stroke-width="3"/><text x="${(W - 0.6) * 50}" y="31" text-anchor="middle" ${FUENTE} font-weight="700" font-size="19" fill="#F2F4F7" letter-spacing="1.5">EL ARCHIVO · §NCASOS§</text></g>`);
}

/* ───────── La plaza ───────── */
// Mural de la plaza: la cordillera al atardecer, con un cóndor (ancho en centésimas de baldosa)
function mural(w, h) {
  let s = `<rect width="${w}" height="${h}" rx="8" fill="#1B3F66"/><rect y="0" width="${w}" height="${h * 0.62}" rx="8" fill="#224E7A"/>`;
  s += `<circle cx="${w * 0.62}" cy="${h * 0.34}" r="34" fill="#F5883A" opacity=".85"/><circle cx="${w * 0.62}" cy="${h * 0.34}" r="22" fill="#F2C14E"/>`;
  // La silueta de los cerros, pico por pico, y la nieve en los dos más altos
  const cerros = [[0, 0.78], [90, 0.42], [150, 0.6], [250, 0.22], [330, 0.5], [420, 0.3], [520, 0.56], [640, 0.18], [760, 0.52], [860, 0.34], [980, 0.58], [1090, 0.4], [1190, 0.62], [1300, 0.28], [1400, 0.54], [1510, 0.36]];
  s += `<path d="M${cerros.filter(([x]) => x <= w).map(([x, y]) => `${x} ${r1(h * y)}`).join('L')}L${w} ${r1(h * 0.46)}V${h}H0Z" fill="#2C5F8E"/>`;
  s += `<path d="M250 ${h * 0.22}L278 ${h * 0.34}L262 ${h * 0.32}L250 ${h * 0.4}L236 ${h * 0.31}L222 ${h * 0.33}ZM640 ${h * 0.18}L672 ${h * 0.32}L654 ${h * 0.3}L640 ${h * 0.37}L626 ${h * 0.3}L608 ${h * 0.32}ZM1300 ${h * 0.28}L1326 ${h * 0.4}L1312 ${h * 0.38}L1300 ${h * 0.45}L1288 ${h * 0.38}L1274 ${h * 0.4}Z" fill="#F2F4F7"/>`;
  s += `<path d="M0 ${h * 0.86}Q300 ${h * 0.7} 620 ${h * 0.84}T${w} ${h * 0.78}V${h}H0Z" fill="#17C3B2" opacity=".55"/><path d="M0 ${h * 0.93}Q380 ${h * 0.82} 820 ${h * 0.92}T${w} ${h * 0.9}V${h}H0Z" fill="#0A8A7E"/>`;
  s += `<path d="M430 ${h * 0.3}q30 -16 60 -2q30 -14 60 2q-30 -6 -60 8q-30 -14 -60 -8z" fill="#0B1726"/>`;
  return s;
}
function plaza(E, pj) {
  const X0 = G.plaza, X1 = G.x1;
  EN.losa(E, X0, 0, X1, 20, '#27425E', { frente: false });
  EN.muroFondoY(E, X0, X1, 0, 3, { color: '#173C60' });
  const wM = Math.round((X1 - X0 - 0.6) * 100);
  E.planoY(X0 + 0.3, 0.001, 2.75, mural(wM, 250), -1790, wM, 250);
  EN.pasto(E, [[X0 + 0.4, 0.5], [X1 - 0.3, 0.5], [X1 - 0.3, 19.6], [X0 + 0.4, 19.6]], { semilla: 11, densidad: 0.8 });
  EN.camino(E, [[25.1, 21], [25.4, 16.2], [29.6, 11.2]], 1.3);
  EN.camino(E, [[29.6, 11.2], [33.6, 6.8], [37.2, 5.6]], 1.3);
  EN.camino(E, [[26.2, 7.2], [29.6, 11.2], [33.8, 15.4], [37.6, 19.9]], 1.1);
  // La pileta con su chorro
  E.cilindro(29.6, 11.2, 0, 1.9, 0.08, '#4B627B', '#3A5470', -1200);
  E.cilindro(29.6, 11.2, 0.08, 1.35, 0.42, '#8FA3B8', '#6B7A8C', 40.6);
  E.cilindro(29.6, 11.2, 0.5, 1.12, 0.01, '#1C6A8E', '#1C6A8E', 40.61);
  E.cilindro(29.6, 11.2, 0.5, 0.18, 0.7, '#B9C8D8', '#8FA3B8', 40.62);
  E.cilindro(29.6, 11.2, 1.2, 0.42, 0.08, '#B9C8D8', '#8FA3B8', 40.63);
  { const [cx, cy] = P(29.6, 11.2, 1.3); E.add(40.64, `<g class="chorro" stroke="#7FD8CF" stroke-width="2" fill="none" opacity=".75"><path d="M${r1(cx)} ${r1(cy)}q-10 -26 -26 8M${r1(cx)} ${r1(cy)}q10 -26 26 8M${r1(cx)} ${r1(cy)}v-24"/></g>`); }
  for (const [x, y, s] of [[25.9, 2.8, 1.15], [33.9, 3.2, 1.2], [26.2, 12.8, 1], [34.2, 13.2, 1.05], [31.2, 1.9, 0.95], [37.9, 2.6, 1.1], [38.8, 12.2, 1.0], [36.3, 9.3, 0.85]]) EN.arbol(E, x, y, { s });
  EN.arbol(E, 27.2, 17.6, { s: 0.9, tipo: 'jacaranda' });
  EN.arbol(E, 39.3, 16.9, { s: 0.8, tipo: 'jacaranda' });
  EN.banca(E, 27.1, 9.6, 'y', { largo: 1.4 });
  EN.banca(E, 31.6, 13.6, 'x', { largo: 1.4 });
  for (const [x, y] of [[26.4, 6.2], [33.2, 9.4], [32.4, 17.2], [37.4, 7.4]]) EN.farol(E, x, y);
  EN.arbusto(E, 24.8, 19.2, { s: 0.9 }); EN.arbusto(E, 35, 18.6, { s: 0.8 }); EN.arbusto(E, 40.0, 19.0, { s: 0.8 });
  // El quiosco de diarios
  {
    const x = 33.2, y = 7.2, k = x + y + 0.5;
    E.caja(x, y, 0, 1.4, 1.1, 1.3, { t: '#1F5A4A', l: '#1B5244', r: '#143E33' }, k);
    E.caja(x - 0.12, y - 0.12, 1.3, 1.64, 1.34, 0.1, { t: '#2E8263', l: '#236953', r: '#1B5244' }, k + 0.01);
    E.planoY(x + 0.12, y + 1.101, 1.15, `<rect width="116" height="70" rx="3" fill="#F4ECD8"/>` + [0, 1, 2, 3].map(i => `<rect x="${8 + i * 27}" y="10" width="22" height="30" fill="${['#E0524A', '#17C3B2', '#E0B341', '#35679A'][i]}"/><rect x="${8 + i * 27}" y="44" width="22" height="18" fill="#B9C8D8"/>`).join(''), k + 0.02, 116, 70);
    E.planoX(x + 1.401, y + 1.05, 1.22, EN.txt(8, 20, 'DIARIOS', 15, '#F4ECD8'), k + 0.03, 100, 24);
  }
  // La gente de la plaza: poca, para que el barrio se vea tranquilo (y pese menos)
  pj('abuelo', 30.9, 13.5, 0, 'd');
  pj('paseadora', 30.8, 14.9, 0, 'd'); pj('perro', 32.0, 15.05, 0, 'd');
  { // la correa, de la mano de quien pasea al collar del perro
    const mp = medida('paseadora', VISITANTES.paseadora()), md = medida('perro', VISITANTES.perro());
    const [ax, ay] = P(30.8, 14.9, 0), [bx, by] = P(32.0, 15.05, 0);
    const hx = ax + (27.8 - mp.cx) * EA, hy = ay + (33.2 - mp.pie) * EA, cx = bx + (25.4 - md.cx) * EA, cy = by + (37 - md.pie) * EA;
    E.add(47.35, `<path d="M${r1(hx)} ${r1(hy)}Q${r1((hx + cx) / 2)} ${r1(Math.max(hy, cy) + 10)} ${r1(cx)} ${r1(cy)}" stroke="#E0524A" stroke-width="1.6" fill="none"/>`);
  }
}

/* ───────── La oficina cerrada ───────── */
// El edificio de BiPlot HQ visto desde la calle: el isotipo y el nombre pintados en el techo, ventanas encendidas en
// las dos fachadas y la puerta al fondo del pasaje. escena.js lo dibuja encima del interior y lo desvanece al entrar.
const ISO = '<rect x="4" y="4" width="92" height="92" rx="22" fill="#1c426d" stroke="#7fd8cf" stroke-width="2.4"/><path d="M27 23V75H80" fill="none" stroke="#35679a" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 67L45 53L59 57L72 35" fill="none" stroke="#168a86" stroke-width="3.6" stroke-linecap="round"/><circle cx="31" cy="67" r="5.6" fill="#17C3B2"/><circle cx="45" cy="53" r="5.6" fill="#17C3B2"/><circle cx="59" cy="57" r="5.6" fill="#17C3B2"/><circle cx="72" cy="35" r="7" fill="#FF6B4A"/>';
// entrada: el pasaje hasta la puerta (tocarlo también abre la oficina)
export const HQ = { alto: 3.4, puerta: [20.4, 22.6], entrada: [18.95, 20, 24.05, 24.45, 2.9] };
function oficinaCerrada() {
  const E = escena(), h = HQ.alto, k = 22, [p0, p1] = HQ.puerta;
  E.caja(0, 0, 0, 24, 20, h, { t: '#24476B', l: '#2B4C70', r: '#1F3B5A' }, k);
  E.add(k + 0.001, E.poly([[0.25, 0.25, h + 0.001], [23.75, 0.25, h + 0.001], [23.75, 19.75, h + 0.001], [0.25, 19.75, h + 0.001]], `fill="none" stroke="#35679A" stroke-width="3"`));
  // Ventanas: algunas encendidas, otras no (como una oficina de verdad a esta hora)
  let v = '';
  for (let x = 0.6; x < 23.5; x += 1.5) for (const z of [0.6, 1.8]) if (!(z < 1.5 && x > p0 - 1 && x < p1 + 0.1)) v += E.poly([[x, 20.002, z], [x + 0.9, 20.002, z], [x + 0.9, 20.002, z + 0.8], [x, 20.002, z + 0.8]], `fill="#FFE7B0" opacity="${(x * 7 + z * 3) % 5 < 3 ? 0.55 : 0.18}"`);
  for (let y = 0.6; y < 19.5; y += 1.5) for (const z of [0.6, 1.8]) v += E.poly([[24.002, y, z], [24.002, y + 0.9, z], [24.002, y + 0.9, z + 0.8], [24.002, y, z + 0.8]], `fill="#FFE7B0" opacity="${(y * 5 + z * 3) % 5 < 3 ? 0.45 : 0.15}"`);
  E.add(k + 0.01, v);
  // La puerta: vidrio encendido, el marco al medio y un alero cian
  E.add(k + 0.02, E.poly([[p0, 20.004, 0], [p1, 20.004, 0], [p1, 20.004, 1.45], [p0, 20.004, 1.45]], `fill="#FFE7B0" opacity=".88"`) +
    E.poly([[(p0 + p1) / 2, 20.005, 0], [(p0 + p1) / 2, 20.005, 1.45]], `stroke="#2B4C70" stroke-width="3"`));
  E.caja(p0 - 0.3, 20.0, 1.55, p1 - p0 + 0.6, 0.55, 0.14, { t: '#17C3B2', l: '#0A8A7E', r: '#077068' }, k + 0.03);
  // El isotipo y el nombre en el techo
  E.planoZ(3.2, 4.2, h + 0.002, `<g transform="scale(6.2)">${ISO}</g>`, k + 0.02, 620, 620);
  E.planoZ(10.6, 8.4, h + 0.002, `<text x="0" y="200" font-weight="700" font-size="260"><tspan ${MONO} fill="#F2F4F7" letter-spacing="-10">Bi</tspan><tspan ${FUENTE} fill="#17C3B2">Plot</tspan></text><text x="10" y="420" ${FUENTE} font-weight="700" font-size="190" fill="#B9C8D8" letter-spacing="24">HQ</text>`, k + 0.021, 1200, 450);
  return E.piezas.sort((p, q) => p[0] - q[0] || p[1] - q[1]).map(p => p[2]).join('');
}

/* ───────── La calle principal ───────── */
export function callePrincipal(datos) {
  const E = escena(); E.txt = 1;
  const usados = new Set(), frentePiezas = [];
  const pj = (id, x, y, z = 0, dir = 'd', e = EA, k) => { usados.add(id); return E.pj(id, x, y, z, dir, e, k); };
  const acento = (id) => (datos.proyectos.find(p => p.id === id) || {}).acento || '#7FD8CF';
  const nombre = (id) => (datos.proyectos.find(p => p.id === id) || {}).nombre || id;
  // Lo que se dibuja dentro de enFrente() va a la capa de adelante (salvo lo del suelo)
  const enFrente = (fn) => {
    const add = E.add;
    E.add = (k, svg) => { if (k < -900) return add(k, svg); frentePiezas.push([k, frentePiezas.length, svg]); return E; };
    try { fn(); } finally { E.add = add; }
  };
  const { yf: YF, paseo: YP, calzada: YC, y1: Y1, x1: X1 } = G;

  // Suelo: vereda y calzada de punta a punta, con el paso de cebra frente al pasaje
  EN.losa(E, 0, 20, X1, Y1, EN.COL.paseo);
  EN.paseo(E, 0, 20, X1, YC);
  E.add(-1390, E.poly([[0, YC, 0.008], [X1, YC, 0.008], [X1, Y1, 0.008], [0, Y1, 0.008]], `fill="${EN.COL.calle}"`) +
    E.poly([[0, YC, 0.009], [X1, YC, 0.009], [X1, YC + 0.14, 0.009], [0, YC + 0.14, 0.009]], `fill="${EN.COL.solera}"`));
  for (let x = 0.6; x < X1 - 0.6; x += 2.4) if (x < 18.8 || x > 24.2) E.add(-1380, E.poly([[x, 30.02, 0.01], [x + 1.2, 30.02, 0.01], [x + 1.2, 30.14, 0.01], [x, 30.14, 0.01]], `fill="${EN.COL.calleLinea}"`));
  for (let y = YC + 0.25; y < Y1 - 0.2; y += 0.42) E.add(-1380, E.poly([[19.6, y, 0.011], [23.6, y, 0.011], [23.6, y + 0.24, 0.011], [19.6, y + 0.24, 0.011]], `fill="rgba(233,238,244,.7)"`));

  plaza(E, pj);

  // Los locales, cerrados, con el nombre y el logo de su empresa en el techo
  const zonas = [{ id: 'oficina', caja: [0, 0, 24, 20, HQ.alto], foco: [12, 10, 1.2], hq: true }];
  for (const [id, ox] of PRINCIPAL) {
    const c = id === 'archivo' ? '#7FD8CF' : acento(id), kLocal = ox + YF + W + D + 0.6;
    sueloLocal(E, ox, YF, c);
    if (id === 'archivo') {
      for (let p = 1; p <= 4; p++) E.bloque(kLocal + 0.001 * p, () => archivoCerrado(E, ox, YF, p, kLocal), 'local', `data-local="archivo" data-pisos="${p}"`);
    } else {
      E.bloque(kLocal + 0.001, () => cerrado(E, ox, YF, { n: LETRERO[id], c, logo: LOGO[id], estado: id === 'libre' ? 'arriendo' : 'abierto', mano: id !== 'libre' }, kLocal), 'local', `data-local="${id}"`);
    }
    zonas.push({ id, caja: [ox, YF, ox + W, YF + D, 2.5], foco: [ox + W / 2, YF + D / 2, 1.0] });
  }
  // Pizarras en la vereda, frente a su local (después del frente del local)
  EN.pizarra(E, 8.6, 24.72, ['VISITA LA', 'MAQUETA', 'del loteo'], { k: 4.85 + YF + W + D + 0.7 });
  EN.pizarra(E, 13.3, 24.72, ['HOY', 'Pide con', 'el QR'], { color: '#F29A6B', k: 9.55 + YF + W + D + 0.7 });
  EN.pizarra(E, 17.9, 24.72, ['19:00', 'Spinning', 'cupos'], { color: '#7FD8CF', k: 14.25 + YF + W + D + 0.7 });
  // Bicicleta en su soporte, junto al pasaje
  { const x = 24.3, y = 24.95; E.planoY(x, y, 0.62, `<g fill="none" stroke="#1E2A38" stroke-width="5"><circle cx="14" cy="44" r="16"/><circle cx="70" cy="44" r="16"/></g><path d="M14 44L34 18H58L70 44M34 18L44 44L58 18M30 10H40M58 18L60 8H68" stroke="#E0B341" stroke-width="4" fill="none" stroke-linejoin="round"/>`, x + y + 0.45, 86, 62); }

  // El pasaje a BiPlot HQ: el arco con el nombre y el directorio con los locales de cada calle
  {
    const k = PASAJE[0] + YP + 0.6;
    for (const x of [19.05, 23.85]) E.caja(x, YP - 0.14, 0, 0.14, 0.14, 2.75, { t: '#35679A', l: '#2A5A88', r: '#1D4A72' }, k);
    E.caja(19.05, YP - 0.14, 2.62, 4.94, 0.14, 0.13, { t: '#35679A', l: '#2A5A88', r: '#1D4A72' }, k + 0.01);
    E.planoY(20.35, YP + 0.001, 3.25, `<rect width="236" height="44" rx="8" fill="#0E2A47" stroke="#17C3B2" stroke-width="3"/><text x="118" y="31" text-anchor="middle" font-weight="700" font-size="25"><tspan font-family="'Space Mono',monospace" fill="#F2F4F7" letter-spacing="-1">Bi</tspan><tspan font-family="'Space Grotesk',sans-serif" fill="#17C3B2">Plot</tspan><tspan font-family="'Space Grotesk',sans-serif" fill="#B9C8D8"> HQ</tspan></text>`, k + 0.02, 236, 44);
    // Directorio: un tótem a la entrada del pasaje, con las calles del barrio (escena.js escribe la lista)
    const x = 22.55, y = 23.7, kd = x + 0.6 + y + 0.08;
    E.caja(x, y, 0, 1.2, 0.16, 2.05, { t: '#2A5A88', l: '#17446F', r: '#0E2A47' }, kd);
    E.planoY(x + 0.06, y + 0.161, 1.98, `<rect width="108" height="188" rx="5" fill="#0B2B45" stroke="#17C3B2" stroke-width="2"/>` +
      `<text x="54" y="20" text-anchor="middle" ${MONO} font-weight="700" font-size="11" fill="#7FD8CF" letter-spacing=".5">DIRECTORIO</text><path d="M10 28H98" stroke="#35679A" stroke-width="1.5"/><g class="directorio-lista"></g>`, kd + 0.001, 108, 188);
    // El tótem del directorio (el resto del pasaje es la entrada a la oficina)
    zonas.push({ id: 'pasaje', caja: [22.4, 23.55, 23.9, 24.0, 2.15], foco: [23.15, 23.8, 1.1] });
  }
  pj('clienta', 21.2, 22.5, 0, 'i');

  // La vereda: faroles, árboles, bancas, la moto de reparto y la gente de adelante
  enFrente(() => {
    for (const x of [4.75, 14.2, 24.1, 30.8, 38.3]) EN.farol(E, x, 28.4);
    for (const [x, s] of [[9.5, 0.8], [18.6, 0.85], [35.0, 0.8]]) EN.arbol(E, x, 28.3, { s, alto: 2.1 });
    EN.banca(E, 1.3, 27.5, 'x'); EN.banca(E, 15.4, 27.5, 'x');
    letreroCalle(E, 0.45, 28.55, 'CALLE PRINCIPAL');
    const x = 11.4, y = 29.55, k = x + y + 0.3;
    E.caja(x, y, 0.28, 1.1, 0.34, 0.26, { t: '#E0524A', l: '#C8423A', r: '#A8352F' }, k);
    E.caja(x + 0.1, y + 0.02, 0.54, 0.62, 0.3, 0.1, { t: '#1F2733', l: '#141A23', r: '#0B0F14' }, k + 0.01);
    E.caja(x - 0.18, y + 0.03, 0.46, 0.46, 0.28, 0.42, { t: '#17C3B2', l: '#0A8A7E', r: '#077068' }, k + 0.02);
    for (const dx of [0.05, 1.05]) E.cilindro(x + dx, y + 0.17, 0, 0.2, 0.06, '#1F2733', '#0B0F14', k - 0.01);
    E.linea([[x + 1.1, y + 0.17, 0.55], [x + 1.25, y + 0.17, 0.95]], '#3A424E', 2.4, k + 0.03);
    pj('repartidor', 11.8, 27.6, 0, 'i');
  });

  // Tres capas, cada una en su orden de profundidad
  const orden = (a) => a.sort((p, q) => p[0] - q[0] || p[1] - q[1]).map(p => p[2]).join('');
  const todas = E.piezas;
  const suelo = orden(todas.filter(p => p[0] < -900)), atras = orden(todas.filter(p => p[0] >= -900));
  const frenteSvg = orden(frentePiezas);
  const c = E.caja0;
  return { suelo, atras, frente: frenteSvg, hq: oficinaCerrada(), zonas, usados, caja: { x0: r1(c.x0), y0: r1(c.y0), x1: r1(c.x1), y1: r1(c.y1) } };
}

// Letrero con el nombre de la calle, en un poste (mira hacia la vereda)
function letreroCalle(E, x, y, texto) {
  const k = x + y + 0.3, ancho = 150;
  E.linea([[x, y, 0], [x, y, 2.25]], '#1E2A38', 3, k);
  const t = marca(texto)
    ? `<text x="${ancho / 2}" y="21" text-anchor="middle" ${FUENTE} font-weight="700" font-size="13" fill="#F2F4F7" letter-spacing="1" textLength="${ancho - 16}" lengthAdjust="spacingAndGlyphs">${texto}</text>`
    : EN.txt(ancho / 2, 21, texto, 13, '#F2F4F7', ` text-anchor="middle" letter-spacing="1"${texto.length > 14 ? ` textLength="${ancho - 16}" lengthAdjust="spacingAndGlyphs"` : ''}`);
  E.planoY(x - 0.05, y + 0.01, 2.3, `<rect width="${ancho}" height="30" rx="5" fill="#1D5E8C" stroke="#F2F4F7" stroke-width="2"/>${t}`, k + 0.01, ancho, 30);
}

/* ───────── Piezas para las calles por rubro (las arma escena.js) ───────── */
// Cada pieza se dibuja en su propio origen (0, 0): el navegador la traslada a P(x, y), que es lineal.
function pieza(fn) {
  const E = escena(); E.txt = 1;
  const usados = new Set();
  const pj = (id, x, y, z = 0, dir = 'd', e = EA, k) => { usados.add(id); return E.pj(id, x, y, z, dir, e, k); };
  fn(E, pj, usados);
  const suelo = E.piezas.filter(p => p[0] < -900).sort((p, q) => p[0] - q[0] || p[1] - q[1]).map(p => p[2]).join('');
  const obj = E.piezas.filter(p => p[0] >= -900).sort((p, q) => p[0] - q[0] || p[1] - q[1]).map(p => p[2]).join('');
  return { suelo, obj, usados };
}
// Tijeras grandes de inauguración, en la mano de Faro
function tijeras(E, x, y, z, k) {
  const [px, py] = P(x, y, z);
  E.add(k ?? x + y + 0.5, `<g transform="translate(${r1(px)} ${r1(py)}) rotate(-20)"><path d="M0 0L26 -3L26 1Z" fill="#D5E2EE" stroke="#6B7A8C" stroke-width="1"/><path d="M0 2L25 7L24 10Z" fill="#B9C8D8" stroke="#6B7A8C" stroke-width="1"/><circle cx="-4" cy="-2" r="4" fill="none" stroke="#E0524A" stroke-width="2.4"/><circle cx="-4" cy="5" r="4" fill="none" stroke="#E0524A" stroke-width="2.4"/></g>`);
}
// Las plantillas por rubro y los estados, con la gente que va adentro (y afuera, en la inauguración)
const INTERIORES = {
  clinica: { fn: (L) => { T.clinica(L, { color: '§C§', nombre: '§N§' }); L.caja(1.85, 3.72, 0, 0.5, 0.45, 0.4, { t: '§C§', l: tono('§C§', 0.2), r: tono('§C§', 0.35) }, 5.9); },
    gente: [['paciente', 1.9, 2.22, 0.57, 'd'], ['dentista', 3.05, 2.5, 0, 'i'], ['recepcionista', 0.9, 2.95, 0, 'd']] },
  taller: { fn: (L) => T.taller(L, { color: '§C§', nombre: '§N§' }), gente: [['mecanico', 3.95, 3.35, 0, 'i'], ['papa', 1.2, 3.75, 0, 'd']] },
  basica: { fn: (L) => T.basica(L, { color: '§C§', nombre: '§N§', lema: '§LEMA§', lineas: [['§L1§', 0.8], ['§L2§', 0.55], ['§L3§', 0.68]] }), gente: [['cajera', 2.4, 2.05, 0, 'd'], ['encargado', 3.3, 3.75, 0, 'i']] },
  diagnostico: { fn: (L) => T.diagnostico(L), gente: [['jefaventas', 0.95, 2.75, 0, 'd'], ['lupe', 3.5, 2.35, 0, 'i']] },
  obra: { fn: (L) => T.obra(L), gente: [['grilla', 1.2, 0.55, 1.08, 'de'], ['bucle', 1.55, 2.05, 0, 'd'], ['tamandua', 2.75, 2.5, 0, 'i']] },
  arriendo: { fn: (L) => S.libre(L, { sinPlotty: true }), gente: [] }
};
export function piezas() {
  // Lo que va en barrio.js: el local cerrado en cada estado, con marcas §…§ para el nombre, el color y el logo de
  // cada caso, más lo de la vereda y la gente de paso
  const usados = new Set(), sumar = (p) => { p.usados.forEach(u => usados.add(u)); return p; };
  const sl = pieza((E) => sueloLocal(E, 0, 0, '§C§'));
  const cerr = {};
  for (const estado of ['abierto', 'arriendo', 'diagnostico', 'obra', 'inauguracion']) cerr[estado] = pieza((E) => cerrado(E, 0, 0, { n: '§N§', c: '§C§', logo: '§LOGO§', estado }, 0)).obj;
  const fantasma = pieza((E) => E.fantasma(0, 0, W, D, 0.01, -1350, { fill: 'rgba(127,216,207,.05)' })).suelo;
  const [tx, ty] = P(W / 2, D / 2, 0.02);
  const sitioLibre = `<text x="${r1(tx)}" y="${r1(ty)}" text-anchor="middle" ${FUENTE} font-weight="700" font-size="15" fill="rgba(127,216,207,.55)">sitio libre</text>`;
  const farol = pieza((E) => EN.farol(E, 0, 0));
  const arbol = pieza((E) => EN.arbol(E, 0, 0, { s: 0.8, alto: 2.1 })).obj;
  const letrero = pieza((E) => letreroCalle(E, 0, 0, '§CALLE§')).obj;
  // La gente de paso y los caminantes, parados en el origen mirando a cada lado
  const personas = {};
  for (const id of [...new Set([...DE_PASO, ...CAMINANTES])]) {
    personas[id] = { d: sumar(pieza((E, pj) => pj(id, 0, 0, 0, 'd'))).obj, i: pieza((E, pj) => pj(id, 0, 0, 0, 'i')).obj };
  }
  const insignias = Object.fromEntries(Object.entries(INSIGNIAS).map(([id, f]) => [id, f(168)]));

  // Lo que va en salas.js (se carga al abrir la vista previa de un caso): el local por dentro, con su plantilla, su gente
  // y su frente abierto, en cada estado
  const enVistas = new Set(), vista = (p) => { p.usados.forEach(u => enVistas.add(u)); return p; };
  const interior = {}, extra = {};
  for (const [id, o] of Object.entries(INTERIORES)) {
    interior[id] = vista(pieza((E, pj, u) => { const L = S.local(E, 0, 0, 0, false, 0); o.fn(L); for (const g of o.gente) u.add(g[0]); gente(L, o.gente); })).obj;
  }
  extra.inauguracion = vista(pieza((E, pj, u) => {
    const L = S.local(E, 0, 0, 0, false, 0); T.inauguracion(L, { color: '§C§' });
    const afuera = [['faro', 2.05, 5.0, 0, 'd'], ['dueno', 3.3, 5.3, 0, 'i']];
    for (const g of afuera) u.add(g[0]);
    gente(L, afuera.map(g => [...g.slice(0, 5), EA, 9.6 + g[1] * 0.01]));
    tijeras(E, 2.5, 5.0, 1.0, 9.9);
  })).obj;
  extra.placa90 = pieza((E) => T.placa90(S.local(E, 0, 0, 0, false, 0))).obj;
  const fr = pieza((E) => { const L = S.local(E, 0, 0, 0, false, 0); frente(L, '§C§', '§N§', 124, true); });
  return {
    local: { suelo: sl.suelo, cerrado: cerr, fantasma, sitioLibre, insignias },
    fila: { farolSuelo: farol.suelo, farol: farol.obj, arbol, letrero },
    personas, usados,
    vistas: { interior, extra, frente: fr.obj, usados: enVistas }
  };
}
