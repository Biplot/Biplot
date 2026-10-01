// BiPlot.TV, el canal de BiPlot: un edificio propio en la plaza, junto a BiPlot HQ (barrio.mjs). Un estudio de televisión
// con su sala de estreno, donde están todos los videos de BiPlot. Al fondo a la izquierda, el cine: la pantalla grande con
// el estreno (hoy «Un bocado a la vez», el capítulo de Rumbo), su telón y dos filas de butacas con público. Al medio, el set
// de Aby y Felipe: la pared con la marca del canal, el escritorio, dos focos y dos cámaras. A la derecha, el camarín, que
// espera al próximo invitado: tu proyecto (el coral es sólo para eso). En el muro de la izquierda, cómo se hace un
// capítulo (guion y look, animación y música, al aire) y el muro de pantallas, con un programa en cada una y su consola
// adelante. En la entrada, la cartelera con la programación y el carro de las cabritas. Al medio, colgando sobre la
// cancha como en la NBA, la pantalla del centro: las repeticiones del canal y el marcador, con sus anillos de luces.
// Aby graba en el set y Felipe guía el recorrido: lo cuenta como si fuera un partido. Sus textos (tarjetas, burbujas y recorrido) están en datos.js
// (salas.tv.salaPropia).
import { montar, base, registrar, planoXen, plantaAlta, silla, txt, mono, PELO, Z, PIEL, EA, r1 } from './comun.mjs';

const AZUL = '#0E2A47', AZUL2 = '#12375E', NOCHE = '#0B1726', CIAN = '#17C3B2', MENTA = '#7FD8CF', ACERO = '#35679A';
const NIEBLA = '#F2F4F7', GRIS = '#C9D4DF', SUAVE = '#8FA3B8', CEJA = '#0B6F66', CORAL = '#FF6B4A', LUZ = '#FFF1CF';
const MURO = '#11253B', MURO2 = '#0D1F33';
const OSCURO = { t: '#223142', l: '#18232F', r: '#111A24' };
const NEGRO = { t: '#1A222C', l: '#11171E', r: '#0B1015' };
const MARINO = { t: '#17446F', l: '#0F3558', r: '#0B2B45' };
const TERCIOPELO = { t: '#285C8C', l: '#1D4670', r: '#163858' };
const BLANCO = { t: '#FFFFFF', l: '#EEF1F3', r: '#DCE2E7' };
const METAL = { t: '#6B7A8C', l: '#525F6E', r: '#3F4A57' };
const W = 20, D = 14, HM = 2.6;
const PANTALLA = (id) => `§M§../tv/pantalla-${id}.webp`;

// El isotipo de BiPlot.TV, en un cuadrado de s × s: un televisor con sus antenas y, en la pantalla, el isotipo de BiPlot
// (los ejes, dos puntos cian y el punto final coral). También va en el techo del edificio (barrio.mjs).
export const ISO_TV = (s) => `<g transform="scale(${(s / 100).toFixed(3)})">` +
  `<path d="M50 25L33 9M50 25L67 9" stroke="${MENTA}" stroke-width="4.5" stroke-linecap="round"/><circle cx="33" cy="9" r="5.5" fill="${MENTA}"/><circle cx="67" cy="9" r="5.5" fill="${MENTA}"/>` +
  `<rect x="5" y="25" width="90" height="68" rx="17" fill="${AZUL}" stroke="${CIAN}" stroke-width="4.5"/><rect x="16" y="35" width="68" height="48" rx="9" fill="${NOCHE}"/>` +
  `<path d="M27 42V74H74" stroke="#3F6DA0" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<circle cx="34" cy="65" r="4.6" fill="${CIAN}"/><circle cx="46" cy="56" r="4.6" fill="${CIAN}"/><circle cx="62" cy="44" r="5.8" fill="${CORAL}"/></g>`;
// La marca: «BiPlot» y «.TV» en cian
const MARCA = (x, y, fs, extra = '') => txt(x, y, `BiPlot<tspan fill="${CIAN}">.TV</tspan>`, fs, NIEBLA, extra);

// La programación: un monitor por video en el muro de pantallas, en el orden en que se leen y en el de los canales de la
// tele (arriba los de BiPlot; abajo, los casos). El estreno va en la pantalla grande del cine. [zona, rótulo, duración]
export const MURO_TV = [['teaser', 'BIPLOT', '0:30'], ['equipo', 'BIPLOT HQ', '1:25'], ['visita', 'LA VISITA', '1:19'],
  ['fundos', 'FUNDOS 360°', '0:45'], ['haru', 'HARU 360', '0:45'], ['nuhome', 'NU HOME 360', '0:46']];
// Los capítulos de Nu Home y de Fundos, en el orden de los canales: una columna de pantallas, una sobre otra, entre «Así se
// hace un capítulo» y el muro de pantallas. [zona, rótulo, duración]
export const CAPITULOS_TV = [['plano', 'DEL PLANO A LA MÁQUINA', '0:22'], ['telefono', 'TELÉFONO ROTO', '0:47'], ['vendido', 'VENDIDO DOS VECES', '0:47']];

// ───────── Quienes están en el canal (ilustraciones sin nombre) ─────────
registrar({
  tvConsola: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'corto', arriba: 'poleron', arribaCol: ['#2F5A86', '#244A70', '#1B3A5A'], abajo: 'pantalon', abajoCol: ['#2A3038', '#1F242B'],
    zapatos: Z.blancas, piernas: 'sentado', audifonos: CIAN, brazoD: 'frente', brazoI: 'frente' },
  tvCabritas: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'rizado', cuerpo: 'fino', arriba: 'chaqueta', arribaCol: ['#7FD8CF', '#5FB8AF', '#0E2A47'], abajo: 'pantalon', abajoCol: ['#35557A', '#27425F'],
    zapatos: Z.negras, brazoD: 'sostiene', objeto: 'cabritas' },
  tvReel: { piel: PIEL.media, pelo: PELO.rubio, peinado: 'largo', cuerpo: 'fino', arriba: 'poleron', arribaCol: ['#8E6BB8', '#6E4F96', '#55397A'], abajo: 'pantalon', abajoCol: ['#2A3038', '#1F242B'],
    zapatos: Z.blancas, brazoD: 'saluda' },
  tvFoto: { piel: PIEL.trigo, pelo: PELO.cafe, peinado: 'cola', lazo: CIAN, cuerpo: 'fino', arriba: 'parka', arribaCol: ['#E0B341', '#B8862A', '#8C6A1F'], abajo: 'pantalon', abajoCol: ['#2A3038', '#1F242B'],
    zapatos: Z.blancas, brazoD: 'telefono', objeto: 'camara' }
});

// La luz en el piso: manchas que se apagan hacia los bordes (la pantalla, el set y el camarín)
const DEFS_PISO = `<defs><radialGradient id="tv-luz"><stop offset="0" stop-color="${LUZ}" stop-opacity=".26"/><stop offset=".6" stop-color="${LUZ}" stop-opacity=".1"/><stop offset="1" stop-color="${LUZ}" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="tv-cine"><stop offset="0" stop-color="#9FD8FF" stop-opacity=".22"/><stop offset="1" stop-color="#9FD8FF" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="tv-espera"><stop offset="0" stop-color="${CORAL}" stop-opacity=".3"/><stop offset="1" stop-color="${CORAL}" stop-opacity="0"/></radialGradient></defs>`;
const mancha = (x, y, r, id = 'tv-luz', ry = r) => `<ellipse cx="${r1(x * 100)}" cy="${r1(y * 100)}" rx="${r1(r * 100)}" ry="${r1(ry * 100)}" fill="url(#${id})"/>`;

// ───────── Lo que se ve de frente ─────────
// La pared del set: la marca del canal y, abajo, la franja con la programación (como un noticiero)
const FONDO_SET = `<defs><linearGradient id="tv-set" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${AZUL2}"/><stop offset="1" stop-color="${NOCHE}"/></linearGradient></defs>` +
  `<rect width="600" height="210" rx="8" fill="url(#tv-set)"/>` +
  Array.from({ length: 24 }, (_, i) => Array.from({ length: 7 }, (_, j) => `<circle cx="${12 + i * 25}" cy="${14 + j * 24}" r="1.6" fill="${MENTA}" opacity=".16"/>`).join('')).join('') +
  `<g transform="translate(46 30)">${ISO_TV(112)}</g>` + MARCA(178, 104, 66) + mono(182, 134, 'EL CANAL DE BIPLOT', 16, MENTA, ' letter-spacing="3"') +
  `<defs><clipPath id="tv-cinta"><rect x="92" y="170" width="508" height="28"/></clipPath></defs>` +
  `<rect x="0" y="170" width="600" height="28" fill="${CIAN}"/><rect x="0" y="170" width="92" height="28" fill="${NOCHE}"/>` + mono(14, 189, 'EN VIVO', 13, MENTA, ' letter-spacing="1.5"') +
  `<g clip-path="url(#tv-cinta)">` + mono(104, 189, 'ESTRENO: UN BOCADO A LA VEZ · LA VISITA DE PLOTTY · TRES CASOS 360', 11.5, NOCHE, ' letter-spacing=".4"') + '</g>';

// El espejo del camarín, con sus ampolletas
const ESPEJO = `<defs><linearGradient id="tv-espejo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCE8F2"/><stop offset=".5" stop-color="#B9CCDC"/><stop offset="1" stop-color="#9DB4C8"/></linearGradient></defs>` +
  `<rect width="170" height="112" rx="6" fill="#E9E2D0"/><rect x="14" y="14" width="142" height="84" rx="3" fill="url(#tv-espejo)"/>` +
  `<path d="M34 92L76 20M58 92L96 26" stroke="#FFFFFF" stroke-width="7" opacity=".35"/>` +
  [...Array.from({ length: 7 }, (_, i) => [14 + i * 23.7, 7]), ...Array.from({ length: 4 }, (_, i) => [7, 26 + i * 24]), ...Array.from({ length: 4 }, (_, i) => [163, 26 + i * 24])]
    .map(([x, y]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="5.4" fill="${LUZ}" stroke="#E0C98A" stroke-width="1.2"/>`).join('');

// La puerta del camarín: la estrella espera tu nombre (el coral es el de «Agenda tu diagnóstico»)
const ESTRELLA = (cx, cy, r) => `<path d="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; return (i ? 'L' : 'M') + r1(cx + Math.cos(a) * q) + ' ' + r1(cy + Math.sin(a) * q); }).join('')}Z" fill="${CORAL}"/>`;
const PUERTA = `<rect width="100" height="212" rx="3" fill="${AZUL2}"/><rect x="8" y="8" width="84" height="196" rx="2" fill="none" stroke="#1D4A75" stroke-width="2.4"/>` +
  `<rect x="14" y="26" width="72" height="72" rx="5" fill="${NIEBLA}"/>` + ESTRELLA(50, 54, 22) + mono(50, 89, 'TU PROYECTO', 8.2, AZUL, ' text-anchor="middle" letter-spacing=".6"') +
  mono(50, 118, 'CAMARÍN', 9, MENTA, ' text-anchor="middle" letter-spacing="2"') + `<circle cx="80" cy="128" r="4.6" fill="${GRIS}"/><rect x="72" y="125" width="10" height="6" rx="2" fill="${GRIS}"/>`;

// Cómo se hace un capítulo: tres pasos, y cada uno se aprueba antes del siguiente. pasos(escala) dibuja los tres cuadros.
function cuadroGuion(x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#FFFFFF" stroke="${AZUL}" stroke-width="1.6"/>` +
    [0.22, 0.36, 0.5, 0.64].map((t, i) => `<rect x="${r1(x + w * 0.1)}" y="${r1(y + h * t)}" width="${r1(w * (i % 2 ? 0.36 : 0.44))}" height="${r1(h * 0.05)}" rx="1" fill="${SUAVE}"/>`).join('') +
    `<circle cx="${r1(x + w * 0.74)}" cy="${r1(y + h * 0.4)}" r="${r1(h * 0.16)}" fill="none" stroke="${AZUL}" stroke-width="1.4"/><path d="M${r1(x + w * 0.66)} ${r1(y + h * 0.62)}Q${r1(x + w * 0.74)} ${r1(y + h * 0.52)} ${r1(x + w * 0.82)} ${r1(y + h * 0.62)}" fill="none" stroke="${AZUL}" stroke-width="1.4"/>` +
    [CIAN, MENTA, '#C55FD8', AZUL].map((c, i) => `<circle cx="${r1(x + w * (0.14 + i * 0.13))}" cy="${r1(y + h * 0.84)}" r="${r1(h * 0.065)}" fill="${c}"/>`).join('');
}
function cuadroAnimacion(x, y, w, h) {
  const f = (i) => `<rect x="${r1(x + w * (0.06 + i * 0.3))}" y="${r1(y + h * 0.12)}" width="${r1(w * 0.28)}" height="${r1(h * 0.5)}" fill="${NOCHE}"/>` +
    `<circle cx="${r1(x + w * (0.2 + i * 0.3))}" cy="${r1(y + h * [0.48, 0.26, 0.48][i])}" r="${r1(h * 0.07)}" fill="${CIAN}"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#FFFFFF" stroke="${AZUL}" stroke-width="1.6"/>` + f(0) + f(1) + f(2) +
    `<path d="M${r1(x + w * 0.1)} ${r1(y + h * 0.78)}H${r1(x + w * 0.9)}" stroke="${SUAVE}" stroke-width="1"/>` +
    [0.18, 0.34, 0.5, 0.66, 0.82].map((t, i) => `<rect x="${r1(x + w * t)}" y="${r1(y + h * (0.86 - [0.12, 0.2, 0.08, 0.16, 0.1][i]))}" width="${r1(w * 0.05)}" height="${r1(h * ([0.12, 0.2, 0.08, 0.16, 0.1][i] * 2))}" rx="1" fill="${AZUL}"/>`).join('');
}
function cuadroAire(x, y, w, h) {
  const play = (cx, cy, r) => `<path d="M${r1(cx - r * 0.5)} ${r1(cy - r * 0.7)}V${r1(cy + r * 0.7)}L${r1(cx + r * 0.75)} ${r1(cy)}Z" fill="${NIEBLA}"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#FFFFFF" stroke="${AZUL}" stroke-width="1.6"/>` +
    `<rect x="${r1(x + w * 0.08)}" y="${r1(y + h * 0.16)}" width="${r1(w * 0.5)}" height="${r1(w * 0.5 * 9 / 16)}" rx="2" fill="${AZUL}"/>` + play(x + w * 0.33, y + h * 0.16 + w * 0.25 * 9 / 16, h * 0.12) +
    `<rect x="${r1(x + w * 0.68)}" y="${r1(y + h * 0.1)}" width="${r1(h * 0.68 * 9 / 16)}" height="${r1(h * 0.68)}" rx="2" fill="${AZUL}"/>` + play(x + w * 0.68 + h * 0.34 * 9 / 16, y + h * 0.44, h * 0.1) +
    mono(r1(x + w * 0.08), r1(y + h * 0.9), '16:9', r1(h * 0.12), AZUL) + mono(r1(x + w * 0.68), r1(y + h * 0.9), '9:16', r1(h * 0.12), AZUL);
}
const PASOS = [['1 · EL GUION Y EL LOOK', cuadroGuion], ['2 · ANIMACIÓN Y MÚSICA', cuadroAnimacion], ['3 · AL AIRE', cuadroAire]];
// En el muro (470 × 130) y de frente (1280 × 470), con lo que cuenta cada paso
const GUION = `<rect width="470" height="130" rx="4" fill="${NIEBLA}"/>` + mono(16, 22, 'ASÍ SE HACE UN CAPÍTULO', 11.5, AZUL, ' letter-spacing="1.5"') +
  PASOS.map(([t, f], i) => f(16 + i * 152, 34, 132, 70) + mono(16 + i * 152, 121, t, 7.6, CEJA, ' letter-spacing=".3"') +
    (i < 2 ? `<path d="M${152 + i * 152} 69h10m-4 -4l4 4l-4 4" stroke="${CIAN}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : '')).join('');
const TEXTOS_PASOS = [['La historia, compás por compás,', 'el elenco y seis cuadros clave.'], ['Cuadro a cuadro, dibujada y', 'compuesta por código.'], ['En 16:9 y 9:16: para la web,', 'Reels, TikTok y LinkedIn.']];
const GUION_FRENTE = `<rect width="1280" height="490" rx="14" fill="${NIEBLA}"/><rect x="10" y="10" width="1260" height="470" rx="9" fill="none" stroke="#DCE2E7" stroke-width="2"/>` +
  txt(56, 74, 'ASÍ SE HACE UN CAPÍTULO', 30, AZUL, ' letter-spacing="2"') + mono(1224, 74, 'BIPLOT.TV', 18, CEJA, ' letter-spacing="2" text-anchor="end"') +
  PASOS.map(([t, f], i) => { const x = 56 + i * 404; return f(x, 112, 360, 196) + mono(x, 352, t, 17, CEJA, ' letter-spacing="1"') +
    TEXTOS_PASOS[i].map((l, j) => txt(x, 386 + j * 26, l, 19, AZUL, ' font-weight="500"')).join('') +
    (i < 2 ? `<path d="M${x + 368} 210h24m-9 -9l9 9l-9 9" stroke="${CIAN}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ''); }).join('') +
  mono(56, 452, 'CADA PASO SE APRUEBA ANTES DEL SIGUIENTE', 14, SUAVE, ' letter-spacing="1.5"');

// La cartelera de la entrada, con sus ampolletas: el estreno y los demás programas
const CARTELERA = `<rect width="250" height="128" rx="6" fill="${NOCHE}"/>` +
  [...Array.from({ length: 13 }, (_, i) => [9 + i * 19.3, 6]), ...Array.from({ length: 13 }, (_, i) => [9 + i * 19.3, 122]), ...Array.from({ length: 5 }, (_, i) => [5, 25 + i * 19]), ...Array.from({ length: 5 }, (_, i) => [245, 25 + i * 19])]
    .map(([x, y]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="2.8" fill="${LUZ}"/>`).join('') +
  `<rect x="13" y="13" width="224" height="102" rx="3" fill="#FBFAF7"/><rect x="13" y="13" width="224" height="25" rx="3" fill="${AZUL}"/>` + MARCA(125, 31.5, 15, ' text-anchor="middle"') +
  mono(125, 54, 'HOY · ESTRENO', 8.6, CEJA, ' text-anchor="middle" letter-spacing="1.2"') + txt(125, 74, 'UN BOCADO A LA VEZ', 16.5, AZUL, ' text-anchor="middle"') +
  `<path d="M40 83H210" stroke="#DCE2E7" stroke-width="1.2"/>` + mono(125, 96, 'BIPLOT · BIPLOT HQ · LA VISITA', 7.6, AZUL, ' text-anchor="middle"') +
  mono(125, 108, 'FUNDOS 360° · HARU 360 · NU HOME 360', 7.6, AZUL, ' text-anchor="middle"');

// ───────── La pantalla del centro, como en la NBA ─────────
// Las repeticiones que pasa, una tras otra: [pantalla, rótulo]. Son seis porque oficina.css (.loc-repe) turna seis, cada
// una 3,5 segundos; sin movimiento queda la primera, el estreno.
const REPES = [['estreno', 'ESTRENO · UN BOCADO A LA VEZ'], ['visita', 'LA VISITA DE PLOTTY'], ['teaser', 'BIPLOT EN 30 SEGUNDOS'],
  ['fundos', 'FUNDOS 360°'], ['haru', 'HARU 360'], ['nuhome', 'NU HOME 360']];
// Los números del marcador, en siete segmentos y un poco inclinados (los apagados se ven tenues). s es el alto de un
// dígito: cada uno avanza 0,7 s y los dos puntos del reloj, 0,22 s.
const SEGMENTOS = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g' };
const anchoLed = (texto, s) => [...String(texto)].reduce((a, c) => a + (c === ':' ? 0.22 : 0.7) * s, 0) - 0.16 * s;
function led(x, y, s, texto, col, apagado = '#14212F') {
  const w = s * 0.54, t = s * 0.12, g = t * 0.3;
  let h = '', cx = x;
  for (const c of String(texto)) {
    if (c === ':') { h += [0.32, 0.68].map((f) => `<rect x="${r1(cx)}" y="${r1(y + s * f - t / 2)}" width="${r1(t)}" height="${r1(t)}" rx="${r1(t * 0.3)}" fill="${col}"/>`).join(''); cx += s * 0.22; continue; }
    const on = SEGMENTOS[c] || '', hz = (yy) => [cx + t / 2 + g, yy, w - t - 2 * g, t], vt = (xx, yy) => [xx, yy, t, s / 2 - t / 2 - 2 * g];
    const seg = { a: hz(y), g: hz(y + s / 2 - t / 2), d: hz(y + s - t), f: vt(cx, y + t / 2 + g), b: vt(cx + w - t, y + t / 2 + g), e: vt(cx, y + s / 2 + g), c: vt(cx + w - t, y + s / 2 + g) };
    for (const [n, [sx, sy, sw, sh]] of Object.entries(seg)) h += `<rect x="${r1(sx)}" y="${r1(sy)}" width="${r1(sw)}" height="${r1(sh)}" rx="${r1(t * 0.45)}" fill="${on.includes(n) ? col : apagado}"/>`;
    cx += s * 0.7;
  }
  return `<g transform="translate(${r1(x)} ${r1(y + s)}) skewX(-6) translate(${r1(-x)} ${r1(-(y + s))})">${h}</g>`;
}
// La trama de luces de una pantalla de estadio
const PUNTOS = (id, w, h) => `<defs><pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".9" fill="${MENTA}" opacity=".1"/></pattern></defs><rect width="${w}" height="${h}" rx="4" fill="url(#${id})"/>`;
// El marcador: BiPlot.TV juega de local (sus puntos son los videos del canal), el reloj marca lo que dura el estreno y la
// visita es tu proyecto, que todavía no entra a la cancha. En la pantalla (240 × 130) y de frente (1280 × 720).
const VIDEOS = String(MURO_TV.length + CAPITULOS_TV.length + 1).padStart(2, '0');
const MARCADOR = `<rect width="240" height="130" rx="4" fill="#05090E"/>` + PUNTOS('tv-puntos', 240, 130) +
  mono(14, 17, 'LOCAL', 7.5, MENTA, ' letter-spacing="1.2"') + MARCA(14, 34, 13) + led(16, 42, 44, VIDEOS, CIAN) + mono(16, 100, 'VIDEOS', 7, SUAVE, ' letter-spacing="1"') +
  mono(120, 17, 'ESTRENO', 7.5, MENTA, ' text-anchor="middle" letter-spacing="1.2"') + led(120 - anchoLed('0:50', 30) / 2, 26, 30, '0:50', LUZ) +
  `<rect x="94" y="66" width="52" height="15" rx="7.5" fill="${NOCHE}" stroke="${CIAN}" stroke-width="1.2"/><circle cx="103" cy="73.5" r="3" fill="${CIAN}"/>` + mono(125, 76.5, 'EN VIVO', 7, NIEBLA, ' text-anchor="middle" letter-spacing=".6"') +
  mono(226, 17, 'VISITA', 7.5, MENTA, ' text-anchor="end" letter-spacing="1.2"') + mono(226, 33, 'TU PROYECTO', 9, NIEBLA, ' text-anchor="end" letter-spacing=".4"') +
  led(226 - anchoLed('--', 44), 42, 44, '--', MENTA) + mono(226, 100, 'EL PRÓXIMO', 7, SUAVE, ' text-anchor="end" letter-spacing="1"') +
  `<path d="M0 108H240V126Q240 130 236 130H4Q0 130 0 126Z" fill="${CIAN}"/>` + mono(120, 122.5, '¿ENTRAS A LA CANCHA?', 8.5, NOCHE, ' text-anchor="middle" letter-spacing="1"');
// Las repeticiones, con su rótulo abajo (fuera de la oficina, en una imagen fija, se ve sólo la primera)
const REPETICIONES = `<rect width="240" height="130" rx="4" fill="#05090E"/>` +
  REPES.map(([id, rotulo], i) => `<g class="loc-repe${i ? '' : ' primera'}"${i ? ` opacity="0" style="animation-delay:${i * 3.5}s"` : ''}>` +
    `<image href="${PANTALLA(id)}" x="4" y="4" width="232" height="122" preserveAspectRatio="xMidYMid slice"/>` +
    `<rect x="4" y="104" width="232" height="22" fill="#05090E" opacity=".82"/>` + mono(12, 118.5, rotulo, 7.6, NIEBLA, ' letter-spacing=".5"') + '</g>').join('') +
  `<rect x="4" y="4" width="232" height="122" fill="url(#brillo-pantalla)"/>` +
  `<rect x="10" y="10" width="66" height="16" rx="3" fill="${NOCHE}"/><circle cx="18" cy="18" r="3" fill="${CIAN}"/>` + mono(25, 21, 'REPETICIÓN', 6.6, NIEBLA, ' letter-spacing=".5"');
// Un anillo de luces (w × h): la cinta, repetida, corre hacia la izquierda (oficina.css, .loc-led) o queda quieta. El
// texto lleva espacios duros y su largo fijo (textLength), para que la vuelta no se note.
const CINTA_LED = ['BIPLOT.TV', 'EN VIVO', 'LAS MEJORES JUGADAS', 'ESTRENO: UN BOCADO A LA VEZ', ''].join('\u00A0·\u00A0');
function anillo(id, w, h, corre) {
  const fs = h * 0.62, largo = r1(CINTA_LED.length * fs * 0.6), veces = Math.ceil(w / largo) + 1;
  const cinta = Array.from({ length: veces }, (_, i) => `<text x="${r1(i * largo)}" y="${r1(h * 0.76)}" font-family="'Space Mono','DejaVu Sans Mono',monospace" font-weight="700" font-size="${r1(fs)}" fill="${CIAN}" textLength="${largo}" lengthAdjust="spacingAndGlyphs">${CINTA_LED}</text>`).join('');
  return `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="#05090E"/>` +
    `<g clip-path="url(#${id})"><g${corre ? ` class="loc-led" style="--led:-${largo}px"` : ''}>${cinta}</g></g>`;
}
// La panza, debajo de las pantallas: la marca del canal en una cara y el reloj de posesión en la otra (176 × 64; arriba
// queda una franja libre, que el anillo tapa desde este lado)
const PANZA_Y = `<rect width="176" height="64" fill="#05090E"/><g transform="translate(16 20)">${ISO_TV(38)}</g>` + MARCA(62, 47, 19);
const PANZA_X = `<rect width="176" height="64" fill="#05090E"/>` + mono(16, 36, 'POSESIÓN', 8, MENTA, ' letter-spacing="1.2"') + mono(16, 50, 'BIPLOT.TV', 8, SUAVE, ' letter-spacing="1"') +
  led(176 - 16 - anchoLed('24', 32), 23, 32, '24', LUZ);
// El techo: el televisor del canal, como en el techo del edificio (220 × 220)
const TECHO = `<rect width="220" height="220" rx="10" fill="${AZUL}"/><rect x="8" y="8" width="204" height="204" rx="7" fill="none" stroke="${CIAN}" stroke-width="2.4"/>` +
  `<g transform="translate(50 32)">${ISO_TV(120)}</g>` + MARCA(110, 186, 34, ' text-anchor="middle"');
// De frente y en grande: el marcador, las repeticiones y las dos cintas
const MARCADOR_FRENTE = `<rect width="1280" height="720" rx="18" fill="#05090E"/>` + PUNTOS('tv-puntos-f', 1280, 720) +
  `<path d="M0 18Q0 0 18 0H1262Q1280 0 1280 18V54H0Z" fill="${NOCHE}"/>` + mono(640, 36, 'BIPLOT.TV · EN VIVO · LAS MEJORES JUGADAS · ESTRENO: UN BOCADO A LA VEZ', 19, CIAN, ' text-anchor="middle" letter-spacing="3"') +
  mono(90, 118, 'LOCAL', 22, MENTA, ' letter-spacing="4"') + `<g transform="translate(88 140)">${ISO_TV(62)}</g>` + MARCA(162, 188, 46) + led(100, 222, 168, VIDEOS, CIAN) +
  mono(100, 432, 'VIDEOS EN EL CANAL', 18, SUAVE, ' letter-spacing="2"') +
  mono(640, 118, 'ESTRENO', 22, MENTA, ' text-anchor="middle" letter-spacing="4"') + led(640 - anchoLed('0:50', 120) / 2, 150, 120, '0:50', LUZ) +
  `<rect x="560" y="300" width="160" height="44" rx="22" fill="${NOCHE}" stroke="${CIAN}" stroke-width="3"/><circle cx="586" cy="322" r="8" fill="${CIAN}"/>` + mono(656, 330, 'EN VIVO', 20, NIEBLA, ' text-anchor="middle" letter-spacing="2"') +
  mono(640, 390, 'UN BOCADO A LA VEZ', 20, GRIS, ' text-anchor="middle" letter-spacing="2"') +
  mono(1190, 118, 'VISITA', 22, MENTA, ' text-anchor="end" letter-spacing="4"') + txt(1190, 188, 'TU PROYECTO', 46, NIEBLA, ' text-anchor="end"') + led(1190 - anchoLed('--', 168), 222, 168, '--', MENTA) +
  mono(1190, 432, 'EL PRÓXIMO CAPÍTULO', 18, SUAVE, ' text-anchor="end" letter-spacing="2"') +
  `<path d="M470 100V440M810 100V440" stroke="${CIAN}" stroke-opacity=".25" stroke-width="2"/>` +
  mono(80, 490, 'LAS REPETICIONES', 18, MENTA, ' letter-spacing="3"') +
  REPES.map(([id, rotulo], i) => { const x = 80 + i * 190; return `<rect x="${x}" y="504" width="176" height="99" rx="6" fill="${NOCHE}"/><image href="${PANTALLA(id)}" x="${x + 3}" y="507" width="170" height="93" preserveAspectRatio="xMidYMid slice"/>` +
    mono(x, 628, rotulo.replace('ESTRENO · ', ''), 12, GRIS, ' letter-spacing=".5"'); }).join('') +
  `<path d="M0 666H1280V702Q1280 720 1262 720H18Q0 720 0 702Z" fill="${CIAN}"/>` + mono(640, 701, '¿ENTRAS A LA CANCHA?', 22, NOCHE, ' text-anchor="middle" letter-spacing="4"');

// ───────── Piezas ─────────
// Una butaca del cine, mirando a la pantalla (hacia el fondo): el respaldo queda hacia adelante
function butaca(L, x, y, z) {
  const k = x + y + z * 0.5;
  L.caja(x - 0.28, y - 0.22, z, 0.56, 0.42, 0.3, NEGRO, k - 0.05);
  L.caja(x - 0.3, y - 0.26, z + 0.3, 0.6, 0.44, 0.12, TERCIOPELO, k);
  L.caja(x - 0.32, y + 0.16, z + 0.3, 0.64, 0.14, 0.64, TERCIOPELO, k + 0.4);
  L.caja(x + 0.3, y - 0.2, z + 0.3, 0.07, 0.42, 0.24, NEGRO, k + 0.42);
}
// Quien mira la pantalla, de espaldas: la cabeza (el pelo) y los hombros asoman sobre el respaldo
function deEspaldas(L, x, y, z, o, k) {
  const t = o.t || 1, [cx, cy] = L.P(x, y + 0.02, z + 0.74 * t + 0.3);
  L.E.marca(x, y, z + 1.4);
  L.add(k, `<path d="M${r1(cx - 15 * t)} ${r1(cy + 10)}Q${r1(cx - 15 * t)} ${r1(cy - 4 * t)} ${r1(cx)} ${r1(cy - 6 * t)}Q${r1(cx + 15 * t)} ${r1(cy - 4 * t)} ${r1(cx + 15 * t)} ${r1(cy + 10)}Z" fill="${o.ropa}"/>` +
    `<rect x="${r1(cx - 3.5 * t)}" y="${r1(cy - 11 * t)}" width="${r1(7 * t)}" height="${r1(7 * t)}" fill="${o.piel}"/>` +
    `<ellipse cx="${r1(cx - 11.5 * t)}" cy="${r1(cy - 19 * t)}" rx="${r1(2.4 * t)}" ry="${r1(3.6 * t)}" fill="${o.piel}"/><ellipse cx="${r1(cx + 11.5 * t)}" cy="${r1(cy - 19 * t)}" rx="${r1(2.4 * t)}" ry="${r1(3.6 * t)}" fill="${o.piel}"/>` +
    `<ellipse cx="${r1(cx)}" cy="${r1(cy - 21 * t)}" rx="${r1(12 * t)}" ry="${r1(13 * t)}" fill="${o.pelo}"/>` + (o.moño ? `<circle cx="${r1(cx)}" cy="${r1(cy - 35 * t)}" r="${r1(5.5 * t)}" fill="${o.pelo}"/>` : ''));
}
// Un foco del set: el trípode, el pie y la caja de luz; luz: la cara que alumbra se ve (mira hacia +x)
function foco(L, x, y, z, luz) {
  const k = x + y + 0.3;
  for (const [dx, dy] of [[-0.24, 0.16], [0.24, 0.16], [0, -0.28]]) L.linea([[x + dx, y + dy, z], [x, y, z + 0.7]], '#6B7A8C', 1.8, k - 0.1);
  L.linea([[x, y, z + 0.7], [x, y, z + 1.62]], '#6B7A8C', 2.2, k - 0.05);
  L.caja(x - 0.22, y - 0.28, z + 1.55, 0.44, 0.56, 0.46, { t: '#4A5768', l: '#3A4654', r: luz ? '#FFF6DE' : '#46525F' }, k);
  if (luz) L.add(k + 0.01, L.poly([[x + 0.22, y - 0.24, z + 1.59], [x + 0.22, y + 0.24, z + 1.59], [x + 0.22, y + 0.24, z + 1.97], [x + 0.22, y - 0.24, z + 1.97]], `fill="${LUZ}" opacity=".9"`));
}
// Una cámara de estudio en su pedestal, mirando al set (hacia el fondo); atrás, su visor muestra lo que graba
function camara(L, x, y) {
  const k = x + y;
  L.cil(x, y, 0, 0.32, 0.07, '#2A3440', '#1C2530', k - 0.3);
  for (const a of [0, 2.1, 4.2]) L.linea([[x, y, 0.07], [x + Math.cos(a) * 0.3, y + Math.sin(a) * 0.3, 0.03]], '#3F4A57', 2.2, k - 0.25);
  L.cil(x, y, 0.07, 0.06, 1.02, '#6B7A8C', '#525F6E', k - 0.2);
  L.caja(x - 0.18, y - 0.3, 1.08, 0.36, 0.58, 0.32, { t: '#3A4654', l: '#232C37', r: '#2E3946' }, k);
  L.caja(x - 0.1, y - 0.52, 1.13, 0.2, 0.22, 0.2, { t: '#1C2530', l: '#11161D', r: '#161D26' }, k - 0.08);
  L.planoY(x - 0.15, y + 0.281, 1.36, 30, 21, `<rect width="30" height="21" rx="2" fill="${NOCHE}"/><rect x="2" y="2" width="26" height="17" fill="${AZUL2}"/><rect x="5" y="11" width="20" height="5" fill="${NIEBLA}"/>` +
    `<circle cx="11" cy="8" r="2.6" fill="#C9924E"/><rect x="18" y="5" width="7" height="5" rx="1" fill="${CIAN}"/>`, k + 0.02);
  L.caja(x - 0.05, y - 0.06, 1.4, 0.1, 0.1, 0.05, { t: CIAN, l: '#0A8A7E', r: '#087066' }, k + 0.03);
  L.linea([[x - 0.14, y + 0.28, 1.12], [x - 0.3, y + 0.72, 0.98]], '#11161D', 2.4, k + 0.05);
  L.linea([[x + 0.14, y + 0.28, 1.12], [x + 0.3, y + 0.72, 0.98]], '#11161D', 2.4, k + 0.06);
}
// El perchero del camarín: la barra, tres colgadores y la ropa del invitado (una chaqueta, una camisa y una polera)
function perchero(L, x, y) {
  const k = x + 0.4 + y + 0.1;
  for (const dx of [0, 0.82]) L.linea([[x + dx, y, 0], [x + dx, y, 1.62]], '#6B7A8C', 2.2, k - 0.05);
  L.linea([[x, y, 1.6], [x + 0.82, y, 1.6]], '#8FA3B8', 2.4, k - 0.04);
  const ropa = (c, c2, cuello) => `<path d="M20 0V4" stroke="#8FA3B8" stroke-width="1.6"/><path d="M13 6L3 12L6 19L10 17V56H30V17L34 19L37 12L27 6Q20 10 13 6Z" fill="${c}"/>` +
    `<path d="M13 6Q20 10 27 6" stroke="${c2}" stroke-width="2.4" fill="none"/>` + (cuello ? `<path d="M20 9V56" stroke="${c2}" stroke-width="1.6"/>` : '');
  [[0.04, AZUL, CIAN, true], [0.28, NIEBLA, GRIS, true], [0.5, '#C55FD8', '#8E3FA0', false]].forEach(([dx, c, c2, cu], i) =>
    L.planoY(x + dx, y + 0.02 + i * 0.01, 1.6, 40, 58, ropa(c, c2, cu), k + i * 0.01));
}
// El aro de luz en su trípode, con el celular al medio (mira hacia +x, hacia quien graba)
function aro(L, x, y) {
  const k = x + y + 0.2;
  for (const [dx, dy] of [[0.2, 0.2], [0.2, -0.2], [-0.26, 0]]) L.linea([[x + dx, y + dy, 0], [x, y, 0.55]], '#6B7A8C', 1.8, k - 0.1);
  L.linea([[x, y, 0.55], [x, y, 1.18]], '#6B7A8C', 2.2, k - 0.05);
  planoXen(L, x, y + 0.34, 1.84, 68, 68, `<circle cx="34" cy="34" r="29" fill="none" stroke="#E0C98A" stroke-width="8"/><circle cx="34" cy="34" r="29" fill="none" stroke="${LUZ}" stroke-width="5"/>` +
    `<rect x="27" y="20" width="14" height="27" rx="2.5" fill="#1C1C1E"/><rect x="28.5" y="22" width="11" height="23" rx="1.5" fill="${AZUL2}"/><circle cx="34" cy="30" r="3" fill="${CIAN}"/>`, k);
}
// Un monitor del muro de pantallas (en el muro x = 0, desde y0 hacia el fondo): el marco, el póster del video, el botón de
// play y, debajo, su rótulo con la duración
function monitor(L, y0, zt, w, h, id, rotulo, dur) {
  L.caja(0.02, y0 - w, zt - h, 0.07, w, h, { t: '#1A222C', l: '#11171E', r: '#0B1015' }, -38.7);
  const Wp = w * 100, Hp = h * 100;
  planoXen(L, 0.091, y0 - 0.03, zt - 0.03, Wp - 6, Hp - 6, `<rect width="${Wp - 6}" height="${Hp - 6}" fill="${NOCHE}"/><image href="${PANTALLA(id)}" width="${Wp - 6}" height="${Hp - 6}" preserveAspectRatio="xMidYMid slice"/>` +
    `<rect width="${Wp - 6}" height="${Hp - 6}" fill="url(#brillo-pantalla)"/><circle cx="${r1((Wp - 6) / 2)}" cy="${r1((Hp - 6) / 2)}" r="11" fill="rgba(11,23,38,.6)"/>` +
    `<path d="M${r1((Wp - 6) / 2 - 3.6)} ${r1((Hp - 6) / 2 - 5.4)}V${r1((Hp - 6) / 2 + 5.4)}L${r1((Wp - 6) / 2 + 5.6)} ${r1((Hp - 6) / 2)}Z" fill="${NIEBLA}"/>`, -38.6);
  planoXen(L, 0.091, y0, zt - h - 0.015, Wp, 11, `<rect width="${Wp}" height="11" rx="2" fill="${NOCHE}"/>` + mono(4, 8.4, rotulo, 7, MENTA, ' letter-spacing=".5"') + mono(Wp - 4, 8.4, dur, 7, GRIS, ' text-anchor="end"'), -38.6);
}

// La pantalla del centro, colgando sobre el medio del estudio. De abajo hacia arriba: la panza (la marca y el reloj de
// posesión), el anillo de abajo, las pantallas (se ven dos: las repeticiones y el marcador), el anillo de arriba (su
// cinta corre), el techo con el televisor del canal y los cuatro cables, que se pierden hacia arriba. Va por delante de
// lo que queda detrás y debajo (la cámara, el foco y quien pasa por abajo).
function pantallaCentro(L, zona) {
  // (las caras están dibujadas para un cubo de 2,4: f agranda todo lo demás en la misma proporción)
  const A = 2.8, f = A / 2.4, X = 10.4 - A / 2, Y = 7.8 - A / 2, Z = 2.95, H = 1.3 * f, X1 = X + A, Y1 = Y + A, k = X1 + Y1 - 2;
  const caja = (d, z0, h, dk) => L.caja(X + d, Y + d, z0, A - 2 * d, A - 2 * d, h, NEGRO, k + dk);
  const escala = (svg) => `<g transform="scale(${f.toFixed(4)})">${svg}</g>`;
  const caras = (d, zTop, ancho, alto, svgY, svgX, dk) => {
    L.planoY(X + d, Y1 - d + 0.003, zTop, r1(ancho * f), r1(alto * f), escala(svgY), k + dk);
    planoXen(L, X1 - d + 0.003, Y1 - d, zTop, r1(ancho * f), r1(alto * f), escala(svgX), k + dk + 0.001);
  };
  const dp = 0.32 * f, anillos = 0.16 * f, sobra = 0.05 * f, pz = 0.64 * f;
  caja(dp, Z - anillos - pz, pz, 0);
  caras(dp, Z - anillos - 0.005, 176, 64, PANZA_Y, PANZA_X, 0.001);
  caja(-sobra, Z - anillos, anillos, 0.01);
  caras(-sobra, Z, 250, 16, anillo('tv-led-1', 250, 16, false), anillo('tv-led-2', 250, 16, false), 0.011);
  caja(0, Z, H, 0.02);
  caras(0, Z + H, 240, 130, REPETICIONES, MARCADOR, 0.021);
  caja(-sobra, Z + H, anillos, 0.03);
  caras(-sobra, Z + H + anillos, 250, 16, anillo('tv-led-3', 250, 16, true), anillo('tv-led-4', 250, 16, true), 0.031);
  const dt = 0.1 * f, zt = Z + H + anillos + 0.08 * f;
  L.caja(X + dt, Y + dt, Z + H + anillos, A - 2 * dt, A - 2 * dt, 0.08 * f, { t: AZUL, l: NOCHE, r: '#081A2D' }, k + 0.04);
  L.piso(X + dt, Y + dt, escala(TECHO), k + 0.041, zt + 0.001);
  let cables = `<defs><linearGradient id="tv-cable" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${SUAVE}" stop-opacity=".85"/><stop offset="1" stop-color="${SUAVE}" stop-opacity="0"/></linearGradient></defs>`;
  for (const [cx, cy] of [[X + 0.3, Y + 0.3], [X1 - 0.3, Y + 0.3], [X + 0.3, Y1 - 0.3], [X1 - 0.3, Y1 - 0.3]]) {
    const [px, py] = L.P(cx, cy, zt);
    cables += `<rect x="${r1(px - 0.7)}" y="${r1(py - 54)}" width="1.4" height="54" fill="url(#tv-cable)"/>`;
  }
  L.add(k + 0.05, cables);
  zona('marcador', { formas: [{ plano: [[X - sobra, Y1 + sobra, zt], [X1 + sobra, Y1 + sobra, zt], [X1 + sobra, Y1 + sobra, Z - anillos], [X - sobra, Y1 + sobra, Z - anillos]] },
    { plano: [[X1 + sobra, Y1 + sobra, zt], [X1 + sobra, Y - sobra, zt], [X1 + sobra, Y - sobra, Z - anillos], [X1 + sobra, Y1 + sobra, Z - anillos]] },
    { plano: [[X, Y, zt], [X1, Y, zt], [X1, Y1, zt], [X, Y1, zt]], soloToque: true },
    { plano: [[X + dp, Y1 - dp, Z - anillos - pz], [X1 - dp, Y1 - dp, Z - anillos - pz], [X1 - dp, Y + dp, Z - anillos - pz]], soloToque: true }],
  lugar: [X + A / 2, Y + A / 2, zt + 0.7], guia: [7.9, 10.6], frente: { svg: MARCADOR_FRENTE, ancho: 1280, alto: 720 } });
}

// ───────── La sala ─────────
export function salaTv(o = {}) {
  return montar(({ E, L, pj, camina, lugar, zona }) => {
    // Piso de estudio, oscuro y en paños grandes, con la luz de la pantalla, del set y del camarín; muros de estudio con el
    // zócalo noche y el filete cian
    let panos = '';
    for (let i = 1; i < 10; i++) panos += `<path d="M${i * 200} 0V1400" stroke="#1C3049" stroke-width="3"/>`;
    for (let j = 1; j < 7; j++) panos += `<path d="M0 ${j * 200}H2000" stroke="#1C3049" stroke-width="3"/>`;
    const luces = mancha(3.1, 1.6, 2.6, 'tv-cine', 2.0) + mancha(9.8, 2.4, 2.4) + mancha(15.4, 1.9, 1.4) + mancha(15.4, 2.35, 0.7, 'tv-espera') + mancha(10.4, 7.8, 2.2, 'tv-cine');
    // El círculo central de la cancha, bajo la pantalla del centro
    const cancha = `<g fill="none" stroke="${CIAN}" stroke-opacity=".3"><circle cx="1040" cy="780" r="190" stroke-width="6"/><circle cx="1040" cy="780" r="62" stroke-width="5"/></g>`;
    base(E, L, { W, D, HM, piso: '#142335', dibujo: DEFS_PISO + panos + luces + cancha, muroY: MURO, muroX: MURO2, zocalo: NOCHE, tope: '#1D3550', canto: '#183048', filete: CIAN });

    // Los cables de las cámaras, por el piso, hasta la consola
    L.linea([[8.4, 4.9, 0.005], [6.2, 7.6, 0.005], [0.9, 8.4, 0.005]], '#0A0F15', 2.4, -29);
    L.linea([[11.4, 5.1, 0.005], [9.2, 8.2, 0.005], [0.9, 9.0, 0.005]], '#0A0F15', 2.4, -29);

    // ── El cine: la pantalla grande con el estreno, su telón, el escenario y dos filas de butacas ──
    const SX = 1.2, SW = 3.8, SH = 2.14, SZ = 2.32;
    L.planoY(SX, 0.03, SZ, SW * 100, SH * 100, `<rect width="${SW * 100}" height="${SH * 100}" fill="#05090E"/><image href="${PANTALLA('estreno')}" x="4" y="4" width="${SW * 100 - 8}" height="${SH * 100 - 8}" preserveAspectRatio="xMidYMid slice"/>` +
      `<rect x="4" y="4" width="${SW * 100 - 8}" height="${SH * 100 - 8}" fill="url(#brillo-pantalla)"/>`, -39);
    const telon = (x0, ancho, lado) => L.planoY(x0, 0.035, 2.6, ancho, 244, `<rect width="${ancho}" height="244" fill="#173A63"/>` +
      Array.from({ length: 4 }, (_, i) => `<rect x="${r1(i * ancho / 4)}" width="${r1(ancho / 8)}" height="244" fill="#0F2B4C"/>`).join('') +
      `<path d="M${lado < 0 ? ancho : 0} 150Q${ancho / 2} 140 ${lado < 0 ? 0 : ancho} 120" stroke="${MENTA}" stroke-width="3" fill="none"/>`, -38.8);
    telon(SX - 0.45, 45, 1); telon(SX + SW, 45, -1);
    L.planoY(SX - 0.45, 0.04, 2.6, SW * 100 + 90, 27, `<rect width="${SW * 100 + 90}" height="27" fill="#173A63"/><path d="M0 27${Array.from({ length: 19 }, (_, i) => `Q${r1(i * 24.7 + 12.3)} 34 ${r1((i + 1) * 24.7)} 27`).join('')}" fill="#173A63"/>` +
      mono((SW * 100 + 90) / 2, 18.5, 'ESTRENO', 13, MENTA, ' text-anchor="middle" letter-spacing="4"'), -38.7);
    L.caja(SX - 0.45, 0.03, 0, SW + 0.9, 0.55, 0.16, { t: '#1B2B3D', l: '#131F2D', r: '#0E1824' }, 1.6);
    L.linea([[SX - 0.45, 0.58, 0.16], [SX + SW + 0.45, 0.58, 0.16]], CIAN, 1.6, 3.4, ' opacity=".7"');
    // La tarima de la segunda fila y las butacas, centradas con la pantalla
    L.caja(1.45, 3.32, 0, 3.3, 1.02, 0.15, { t: '#1B2B3D', l: '#131F2D', r: '#0E1824' }, 4.3);
    const XB = [1.975, 2.725, 3.475, 4.225];
    const publico = { 1: { 1: { pelo: '#1A1613', ropa: '#2F7C78', piel: PIEL.morena[0] } }, 2: { 2: { pelo: '#B5532E', ropa: '#C9A24E', piel: PIEL.clara[0], moño: true }, 3: { pelo: '#4A3222', ropa: '#35679A', piel: PIEL.trigo[0], t: 0.8 } } };
    for (const [fila, y, z] of [[1, 2.72, 0], [2, 3.82, 0.15]]) XB.forEach((x, i) => {
      butaca(L, x, y, z);
      const p = publico[fila][i];
      if (p) deEspaldas(L, x, y - 0.04, z + 0.3, p, x + y + z * 0.5 + 0.2);
    });
    // Las cabritas de la segunda fila, en el brazo de la butaca
    L.cil(3.82, 3.75, 0.69, 0.08, 0.15, '#F2F4F7', '#DCE2E7', 3.82 + 3.75 + 0.6);
    { const [cx, cy] = L.P(3.82, 3.75, 0.86); L.add(3.82 + 3.75 + 0.61, [[-3, 0], [2, -2], [4, 1], [-1, -3]].map(([dx, dy]) => `<circle cx="${r1(cx + dx)}" cy="${r1(cy + dy)}" r="2.4" fill="#FFF3C4"/>`).join('')); }
    zona('estreno', { formas: [{ plano: [[SX, 0.03, SZ], [SX + SW, 0.03, SZ], [SX + SW, 0.03, SZ - SH], [SX, 0.03, SZ - SH]] }, { piso: [[1.55, 2.4], [4.65, 2.4], [4.65, 4.3], [1.55, 4.3]], alto: 1.0, soloToque: true }],
      lugar: [SX + SW / 2, 0.05, 2.62], guia: [4.7, 5.3] });

    // ── El set de Aby y Felipe: la tarima, la pared con la marca, el escritorio, los focos y las cámaras ──
    const TX = 6.6;
    L.caja(TX, 0.1, 0, 6.4, 2.9, 0.1, { t: '#1A2C40', l: '#132233', r: '#0F1B29' }, 2.0);
    L.linea([[TX, 3.0, 0.1], [TX + 6.4, 3.0, 0.1], [TX + 6.4, 0.1, 0.1]], CIAN, 1.8, 6.0, ' opacity=".75"');
    L.planoY(TX + 0.2, 0.03, 2.45, 600, 210, FONDO_SET, -39);
    L.anim('loc-lampara', () => L.planoY(TX + 4.9, 0.04, 2.56, 100, 22, `<rect width="100" height="22" rx="5" fill="${NOCHE}" stroke="${CIAN}" stroke-width="1.6"/><circle cx="14" cy="11" r="5" fill="${CIAN}"/>` + mono(26, 15.5, 'AL AIRE', 11, NIEBLA, ' letter-spacing="1.5"'), -38.8));
    // El escritorio del noticiero: la cubierta blanca y el frente con la marca
    const EX = 8.3, EY = 1.35;
    pj('aby', 9.35, 0.95, 0.1, 'd');
    L.caja(EX, EY, 0.1, 3.0, 0.6, 0.78, { t: '#F4F6F8', l: AZUL, r: '#0B2440' });
    L.planoY(EX + 0.12, EY + 0.601, 0.8, 276, 60, `<rect width="276" height="60" rx="3" fill="${AZUL}"/><rect y="50" width="276" height="4" fill="${CIAN}"/><g transform="translate(70 10)">${ISO_TV(30)}</g>` + MARCA(108, 34, 21), EX + 1.5 + EY + 0.62);
    L.caja(EX + 0.4, EY + 0.12, 0.88, 0.42, 0.3, 0.02, { t: '#DCE2E7', l: '#C9D4DF', r: '#B9C8D8' }, EX + EY + 1.1);
    L.planoY(EX + 0.4, EY + 0.12, 1.16, 42, 28, `<rect width="42" height="28" rx="2" fill="#1A222C"/><rect x="2" y="2" width="38" height="24" fill="${AZUL2}"/><rect x="6" y="8" width="18" height="3" fill="${CIAN}"/><rect x="6" y="14" width="26" height="2.4" fill="${GRIS}"/>`, EX + EY + 1.12);
    L.cil(EX + 2.5, EY + 0.3, 0.88, 0.06, 0.12, '#FFFFFF', '#DCE2E7', EX + EY + 2.9);
    L.caja(EX + 1.7, EY + 0.18, 0.88, 0.36, 0.26, 0.012, { t: '#FBFAF7', l: '#E8E2D6', r: '#D8CDB2' }, EX + EY + 2.0);
    foco(L, 6.35, 3.45, 0, true);
    foco(L, TX + 6.35, 0.55, 0.1, false);
    zona('set', { formas: [{ piso: [[TX, 0.1], [TX + 6.4, 0.1], [TX + 6.4, 3.0], [TX, 3.0]], alto: 2.3 }, { plano: [[TX + 0.2, 0.03, 2.45], [TX + 6.2, 0.03, 2.45], [TX + 6.2, 0.03, 0.35], [TX + 0.2, 0.03, 0.35]] }],
      lugar: [11.7, 0.5, 2.62], guia: [12.3, 3.55] });
    camara(L, 8.4, 4.6);
    camara(L, 11.4, 4.8);
    pj('nino', 12.25, 5.6, 0, 'i', EA * 0.72);
    pj('tvFoto', 13.5, 3.7, 0, 'i');

    // ── El camarín: el espejo con ampolletas, el tocador, la silla de director y la puerta con la estrella ──
    L.planoY(13.45, 0.03, 2.6, 6, 260, `<rect width="6" height="260" fill="${CIAN}" opacity=".5"/>`, -38.9);
    L.planoY(14.55, 0.03, 2.25, 170, 112, ESPEJO, -39);
    L.caja(14.45, 0.05, 0, 1.9, 0.5, 0.74, BLANCO, 15.4 + 0.3);
    for (const [dx, c] of [[0.3, '#E0B341'], [0.5, CIAN], [1.5, '#C55FD8']]) L.cil(14.45 + dx, 0.3, 0.74, 0.04, 0.12, c, '#3A4654', 15.0 + dx);
    L.caja(15.3, 0.12, 0.74, 0.34, 0.24, 0.05, { t: '#E8E2D6', l: '#D8CDB2', r: '#C8BEA4' }, 15.9);
    // La silla de director, de espaldas: el respaldo dice para quién es
    const sx = 15.4, sy = 1.25, ks = sx + sy;
    for (const [dx, dy] of [[-0.24, -0.2], [0.24, -0.2], [-0.24, 0.2], [0.24, 0.2]]) L.linea([[sx + dx, sy + dy, 0], [sx - dx * 0.6, sy + dy, 0.48]], '#8C6A4A', 2.2, ks - 0.1);
    L.caja(sx - 0.26, sy - 0.22, 0.46, 0.52, 0.44, 0.04, { t: AZUL, l: '#0B2440', r: '#081A2D' }, ks);
    L.linea([[sx - 0.27, sy + 0.22, 0.46], [sx - 0.27, sy + 0.22, 1.02]], '#8C6A4A', 2.4, ks + 0.2);
    L.linea([[sx + 0.27, sy + 0.22, 0.46], [sx + 0.27, sy + 0.22, 1.02]], '#8C6A4A', 2.4, ks + 0.2);
    L.planoY(sx - 0.26, sy + 0.23, 0.98, 52, 24, `<rect width="52" height="24" fill="${AZUL}"/>` + mono(26, 15.5, 'TU PROYECTO', 6.4, NIEBLA, ' text-anchor="middle" letter-spacing=".3"'), ks + 0.21);
    L.planoY(17.75, 0.03, 2.12, 100, 212, PUERTA, -39);
    { const [cx, cy] = L.P(sx, sy + 1.0, 0.01); L.add(ks + 0.5, `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="12" ry="6" fill="${CORAL}" stroke="${AZUL}" stroke-width="2.4"/>`); }
    zona('camarin', { formas: [{ piso: [[14.4, 0.05], [16.4, 0.05], [16.4, 2.4], [14.4, 2.4]], alto: 2.25 }, { plano: [[17.75, 0.03, 2.12], [18.75, 0.03, 2.12], [18.75, 0.03, 0], [17.75, 0.03, 0]] }],
      lugar: [16.6, 0.6, 2.5], guia: [17.0, 2.8] });
    perchero(L, 16.55, 0.42);

    // ── El muro de la izquierda: cómo se hace un capítulo y el muro de pantallas, con su consola ──
    const GY = 5.75;
    L.planoX(GY, 2.38, 470, 130, GUION, -38.8);
    zona('guion', { formas: [{ plano: [[0.03, GY, 2.38], [0.03, GY - 4.7, 2.38], [0.03, GY - 4.7, 1.08], [0.03, GY, 1.08]] }], lugar: [0.05, GY - 2.35, 2.58], guia: [1.4, 5.9],
      frente: { svg: GUION_FRENTE, ancho: 1280, alto: 490 } });

    const MY = 12.95, MW = 1.5, MH = 0.84, MG = 0.14, MZ = [2.44, 1.46];
    MURO_TV.forEach(([id, rotulo, dur], i) => {
      const y0 = MY - (i % 3) * (MW + MG), zt = MZ[Math.floor(i / 3)];
      monitor(L, y0, zt, MW, MH, id, rotulo, dur);
      zona(id, { formas: [{ plano: [[0.09, y0, zt], [0.09, y0 - MW, zt], [0.09, y0 - MW, zt - MH], [0.09, y0, zt - MH]] }], lugar: [0.1, y0 - MW / 2, zt + 0.08], guia: [2.7, r1(y0 - MW / 2)] });
    });
    // La columna de los capítulos, al medio entre el guion (hasta y = GY) y el muro de pantallas
    const PW = 1.35, PH = 0.6, PY = r1((GY + MY - 2 * (MW + MG) - MW) / 2 + PW / 2), PZ = [2.44, 1.67, 0.9];
    CAPITULOS_TV.forEach(([id, rotulo, dur], i) => {
      monitor(L, PY, PZ[i], PW, PH, id, rotulo, dur);
      zona(id, { formas: [{ plano: [[0.09, PY, PZ[i]], [0.09, PY - PW, PZ[i]], [0.09, PY - PW, PZ[i] - PH - 0.13], [0.09, PY, PZ[i] - PH - 0.13]] }],
        lugar: [0.1, PY - PW / 2, PZ[i] + 0.08], guia: [2.7, r1(PY - PW / 2)] });
    });
    // La consola: los faders, las perillas y la pantalla de lo que sale al aire
    L.caja(0.08, 8.05, 0, 0.8, 4.95, 0.56, OSCURO, 11.0);
    L.piso(0.08, 8.05, `<rect width="80" height="495" fill="#2A3A4D"/>` + Array.from({ length: 16 }, (_, i) => `<rect x="${i % 2 ? 46 : 14}" y="${18 + Math.floor(i / 2) * 58}" width="22" height="36" rx="3" fill="#1A222C"/>` +
      `<rect x="${(i % 2 ? 46 : 14) + 8}" y="${22 + Math.floor(i / 2) * 58 + (i * 7) % 20}" width="6" height="8" rx="1.5" fill="${i % 5 ? GRIS : CIAN}"/>`).join(''), 11.1, 0.562);
    planoXen(L, 0.881, 12.8, 0.48, 470, 30, `<rect width="470" height="30" rx="3" fill="${NOCHE}"/>` + mono(14, 20, 'PROGRAMACIÓN', 11, MENTA, ' letter-spacing="2"') +
      Array.from({ length: 6 }, (_, i) => `<circle cx="${236 + i * 38}" cy="15" r="4.5" fill="${i === 0 ? CIAN : '#2A3A4D'}"/>`).join(''), 11.2);
    silla(L, 1.5, 10.55, { t: '#2B3A4C', l: '#1E2A38', r: '#16202B' });
    pj('tvConsola', 1.5, 10.55, 0.47, 'i', EA, 1.5 + 10.55 + 0.3);

    // ── La entrada: la cartelera con la programación y el carro de las cabritas ──
    const CX = 14.6, CY = 9.6, kc = CX + 1.25 + CY + 0.2;
    for (const dx of [0.2, 2.2]) L.caja(CX + dx - 0.04, CY - 0.12, 0, 0.08, 0.08, 1.06, METAL, kc - 0.2 + dx * 0.01);
    L.caja(CX, CY - 0.16, 1.04, 2.5, 0.16, 1.28, MARINO, kc);
    L.planoY(CX, CY + 0.002, 2.32, 250, 128, CARTELERA, kc + 0.02);
    zona('cartelera', { formas: [{ piso: [[CX - 0.05, CY - 0.25], [CX + 2.55, CY - 0.25], [CX + 2.55, CY + 0.2], [CX - 0.05, CY + 0.2]], alto: 2.35 }], lugar: [CX + 1.25, CY, 2.55], guia: [CX + 0.6, CY + 1.3] });
    // El carro de las cabritas: rayas cian, la vitrina llena y el techito
    const KX = 12.7, KY = 10.9, kk = KX + 0.4 + KY + 0.3;
    L.caja(KX, KY, 0.2, 0.8, 0.55, 0.62, BLANCO, kk);
    L.planoY(KX, KY + 0.551, 0.82, 80, 62, `<rect width="80" height="62" fill="#FFFFFF"/>` + [6, 26, 46, 66].map((x) => `<rect x="${x}" width="9" height="62" fill="${CIAN}"/>`).join('') + `<rect x="18" y="16" width="44" height="18" rx="3" fill="${AZUL}"/>` +
      mono(40, 29, 'CABRITAS', 7.6, NIEBLA, ' text-anchor="middle" letter-spacing=".4"'), kk + 0.01);
    for (const dx of [0.14, 0.66]) { const [cx, cy] = L.P(KX + dx, KY + 0.56, 0.12); L.add(kk + 0.02, `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="5.5" ry="6.5" fill="#1A222C" stroke="#3F4A57" stroke-width="1.6"/>`); }
    L.caja(KX + 0.06, KY + 0.06, 0.82, 0.68, 0.43, 0.04, { t: '#DCE2E7', l: '#C9D4DF', r: '#B9C8D8' }, kk + 0.03);
    { const [cx, cy] = L.P(KX + 0.4, KY + 0.28, 0.9); L.add(kk + 0.04, Array.from({ length: 14 }, (_, i) => `<circle cx="${r1(cx - 14 + (i * 7.3) % 28)}" cy="${r1(cy - 4 + (i * 3.7) % 9)}" r="3.2" fill="${i % 4 ? '#FFF3C4' : '#F4D47A'}"/>`).join('')); }
    L.add(kk + 0.05, L.poly([[KX + 0.06, KY + 0.49, 0.86], [KX + 0.74, KY + 0.49, 0.86], [KX + 0.74, KY + 0.49, 1.24], [KX + 0.06, KY + 0.49, 1.24]], 'fill="rgba(214,236,240,.18)" stroke="rgba(255,255,255,.6)" stroke-width=".8"') +
      L.poly([[KX + 0.74, KY + 0.06, 0.86], [KX + 0.74, KY + 0.49, 0.86], [KX + 0.74, KY + 0.49, 1.24], [KX + 0.74, KY + 0.06, 1.24]], 'fill="rgba(214,236,240,.14)" stroke="rgba(255,255,255,.6)" stroke-width=".8"'));
    L.caja(KX + 0.02, KY + 0.04, 1.24, 0.76, 0.47, 0.04, BLANCO, kk + 0.06);
    pj('tvCabritas', 14.3, 11.15, 0, 'i');
    plantaAlta(L, 19.2, 7.6, 1.05, ['#1A222C', '#11171E']);
    // El aro de luz con su celular, como el de Aby: aquí se graba un saludo en vertical
    aro(L, 5.0, 10.4);
    pj('tvReel', 5.95, 10.45, 0, 'i');
    // (en celular se entra viendo de cerca este punto: el set, las cámaras y la cartelera)
    lugar('entrada', 12.6, 6.6, 1.1);

    // Al medio, colgando sobre la cancha: la pantalla del centro
    pantallaCentro(L, zona);

    // Felipe guía el recorrido; mientras tanto, va y viene entre la entrada y el set
    camina('felipe', o.felipe ? [[...o.felipe, 4], [17.4, 8.6, 2], [...o.felipe]] : [[16.6, 12.3, 3], [17.4, 8.6, 2], [12.6, 7.2, 2.5], [7.4, 6.8, 2.5], [12.6, 7.2], [17.4, 8.6]], { vel: 0.45 });
    return { id: 'tv', ancho: W, fondo: D };
  });
}
export const tv = () => salaTv();
