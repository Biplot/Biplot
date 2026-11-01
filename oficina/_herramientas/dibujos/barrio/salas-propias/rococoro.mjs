// La sala de Rococoro.studio en la oficina: su tienda-taller, que es también la redacción de «El Rococoro», el diario de
// la marca. Hecha con su sitio (Biplot/rococoro-studio: la portada tipo diario, la colección, el probador con maniquí, el
// taller, la sala de redacción, el lookbook, la tarjeta abanico y las cartas a la directora), en su paleta E (papel
// blanco, tinta, Burgundy Rose y Dark Rose) y con sus letras (la gótica de la cabecera, Instrument Serif y Jost). La
// recorre la Directora, el personaje de la marca: la mujer con cabeza de pez de su tatuaje. Rococoro es un prototipo en
// desarrollo: lo cuenta Grillo, que lo diseñó, en el kiosco de BiPlot.
import { montar, base, registrar, planoXen, silla, kioscoBiPlot, texto, PELO, Z, PIEL } from './comun.mjs';

const GOTICA = texto(`'UnifrakturMaguntia','Old English Text MT','DejaVu Serif',serif`, 400);
const SERIF = texto(`'Instrument Serif','Times New Roman','DejaVu Serif',serif`, 400);
const JOST = texto(`'Jost','Avenir Next','DejaVu Sans',sans-serif`, 500);
// La paleta E de Rococoro: papel blanco, tinta, Burgundy Rose (titulares y acentos) y Dark Rose (cinta, botones y pie)
const PAPEL = '#FCFCFA', PAPEL2 = '#F1F0EC', PAPEL3 = '#E3E1DC', TINTA = '#121214', TINTA2 = '#3B3B40', GRIS = '#7B7B80';
const ROJO = '#8F4151', ROJO2 = '#B0607A', OSCURO = '#481925', ROSA = '#D58A9C';
const NEGRO = { t: '#2A2A2E', l: '#1A1A1D', r: '#121214' };
const ROSE = { t: '#5C2533', l: OSCURO, r: '#36121C' };
const BLANCO = { t: '#FFFFFF', l: '#EDEBE6', r: '#DEDBD4' };
const ROBLE = { t: '#D8C3A5', l: '#C2AA88', r: '#A8916F' };
const NOGAL = { t: '#8C6A4E', l: '#6E5238', r: '#5A4330' };
const PAPELES = { t: '#F4F1EA', l: '#E3DED3', r: '#D2CCC0' };

// ───────── La gente de Rococoro (ilustraciones sin nombre), de negro y con los rosas de la marca ─────────
// La Directora (directora) y el maniquí con su cabeza (maniqui) están en visitantes.mjs: también van en el local chico.
const NEGROS = ['#151312', '#000000'];
const ZN = ['#151312', '#151312', null];
registrar({
  roModelo: { piel: PIEL.clara, pelo: PELO.negro, peinado: 'mono', cuerpo: 'fino', arriba: 'vestido', arribaCol: ['#151312', '#000000', ROJO], abajo: 'vestido', abajoCol: NEGROS, zapatos: ZN, brazoD: 'telefono', objeto: 'abanico', ojos: 'grandes', labio: ROJO },
  roFotografa: { piel: PIEL.media, pelo: PELO.castano, peinado: 'cola', lazo: '#151312', cuerpo: 'fino', arriba: 'chaqueta', arribaCol: ['#2A2A2E', '#1A1A1D', [PAPEL2, null]], abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'telefono', objeto: 'camara', ojos: 'grandes' },
  roClienta: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'largo', cuerpo: 'fino', arriba: 'polera', arribaCol: [ROSA, ROJO2], manga: 'corta', abajo: 'falda', abajoCol: NEGROS, zapatos: ZN, brazoD: 'sostiene', objeto: 'celular', ojos: 'grandes', rubor: '#E9967A' },
  roCostura: { piel: PIEL.morena, pelo: PELO.canoso, peinado: 'mono', cuerpo: 'fino', arriba: 'delantal', arribaCol: [PAPEL2, PAPEL3, [OSCURO, '#36121C']], abajo: 'pantalon', abajoCol: NEGROS, zapatos: ZN, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', lentes: 'redondos', ojos: 'felices' },
  roEditora: { piel: PIEL.clara, pelo: PELO.rojizo, peinado: 'melena', cuerpo: 'fino', arriba: 'cardigan', arribaCol: [ROJO, '#6E2F3D', [PAPEL2]], abajo: 'falda', abajoCol: NEGROS, zapatos: ZN, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', lentes: 'rectos', ojos: 'grandes' },
  roVendedora: { piel: PIEL.media, pelo: PELO.negro, peinado: 'trenza', lazo: ROJO, cuerpo: 'fino', arriba: 'polera', arribaCol: NEGROS, manga: 'corta', abajo: 'pantalon', abajoCol: NEGROS, zapatos: ZN, brazoD: 'saluda', ojos: 'grandes', labio: ROJO, aros: '#C9A227' },
  roLectora: { piel: PIEL.media, pelo: PELO.cafe, peinado: 'largo', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#7A5A6B', '#5E4352'], abajo: 'falda', abajoCol: ['#7E2B35', '#5E1F28'], medias: NEGROS, zapatos: ZN, brazoD: 'frente', brazoI: 'frente', objeto: 'diario', piernas: 'camina', ojos: 'grandes' },
  // La vitrina: un maniquí de cabeza lisa con el look de la portada (Top Lazo y Pantalón Pliegue)
  roVitrina: { cabeza: 'liso', piel: ['#FFFFFF', '#E3E1DC'], cuerpo: 'fino', arriba: 'polera', arribaCol: ['#151312', '#000000', ['#F4F1EA', 'M15.6 24.4L17.4 27.6L19.2 24.4Z']], manga: 'corta', abajo: 'pantalon', abajoCol: NEGROS, zapatos: ['#FFFFFF', '#E3E1DC', null] },
  // «Lectura obligada»: el diario en el sofá, como en su lookbook
  roLectora2: { piel: PIEL.clara, pelo: PELO.negro, peinado: 'cola', lazo: ROJO, cuerpo: 'fino', arriba: 'polera', arribaCol: ['#151312', '#000000'], abajo: 'falda', abajoCol: ['#7E2B35', '#5E1F28'], zapatos: ZN, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', objeto: 'diario', ojos: 'grandes' },
  roLectora3: { piel: PIEL.trigo, pelo: PELO.castano, peinado: 'trenza', lazo: '#151312', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#7A7A4E', '#5E5E3A', [PAPEL2]], abajo: 'falda', abajoCol: NEGROS, zapatos: ZN, piernas: 'sentado', brazoD: 'senala', ojos: 'grandes', boca: 'dientes' },
  roCompradora: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'melena', cuerpo: 'fino', arriba: 'chaqueta', arribaCol: [TINTA2, '#2A2A2E', [PAPEL2, null]], abajo: 'falda', abajoCol: NEGROS, zapatos: ZN, brazoD: 'abajo', objeto: 'bolsa', bolsaCol: OSCURO, piernas: 'camina', ojos: 'felices' }
});

const W = 20, D = 14, HM = 2.8;
const r1 = (n) => Math.round(n * 10) / 10;

// ───────── Lo que se pinta ─────────
// La portada de El Rococoro, como la de su sitio (se abre de frente): la cabecera gótica, la edición, la colección
// actual con su foto, la última hora y la directora en la oreja de la cabecera
const PORTADA = `<rect width="600" height="200" fill="${PAPEL}" stroke="${TINTA}" stroke-width="2"/>` +
  JOST(12, 15, 'SANTIAGO DE CHILE', 7.5, TINTA, ' letter-spacing="1"') + JOST(300, 15, 'EDICIÓN Nº 39 · TIENDA EN LÍNEA', 7.5, TINTA, ' text-anchor="middle" letter-spacing="1"') +
  JOST(588, 15, 'PRECIO: TU MEJOR PINTA', 7.5, TINTA, ' text-anchor="end" letter-spacing="1"') +
  `<path d="M10 20H590" stroke="${TINTA}" stroke-width="1"/>` +
  `<rect x="14" y="27" width="96" height="48" fill="none" stroke="${TINTA}" stroke-width="1"/>` + JOST(20, 37, 'HOY', 6, ROJO, ' letter-spacing="1"') +
  SERIF(20, 49, 'Probador abierto: tu', 9, TINTA) + SERIF(20, 59, 'maniquí, con tus', 9, TINTA) + SERIF(20, 69, 'medidas.', 9, TINTA) +
  GOTICA(300, 74, 'Rococoro', 60, TINTA, ' text-anchor="middle"') +
  `<image href="§M§rococoro-directora.webp" x="528" y="23" width="26" height="59"/>` + SERIF(541, 86, 'La directora', 6.5, TINTA2, ' text-anchor="middle" font-style="italic"') +
  `<path d="M10 90H590M10 93H590" stroke="${TINTA}" stroke-width="1"/>` +
  SERIF(300, 106, 'Diseño de autor · Hecho en Chile · De nichooo', 10.5, TINTA2, ' text-anchor="middle" font-style="italic"') +
  JOST(14, 124, 'COLECCIÓN ACTUAL', 6.5, ROJO, ' letter-spacing="1.2"') +
  SERIF(14, 143, 'Una historia que', 19, TINTA) + SERIF(14, 162, `no grita, <tspan fill="${ROJO}" font-style="italic">pero se</tspan>`, 19, TINTA) +
  SERIF(14, 181, 'transforma.', 19, ROJO, ' font-style="italic"') +
  `<path d="M206 116V194M436 116V194" stroke="${PAPEL3}" stroke-width="1"/>` +
  `<image href="§M§rococoro-foto-portada.webp" x="218" y="116" width="206" height="78" preserveAspectRatio="xMidYMin slice"/>` +
  JOST(448, 124, 'ÚLTIMA HORA', 6.5, TINTA, ' letter-spacing="1.2"') + `<path d="M448 128H588" stroke="${TINTA}" stroke-width=".8"/>` +
  JOST(448, 140, 'PROBADOR', 5.5, ROJO, ' letter-spacing="1"') + SERIF(448, 151, 'Pruébate la colección', 9, TINTA) + SERIF(448, 161, 'en tu propio maniquí.', 9, TINTA) +
  JOST(448, 176, 'A MEDIDA', 5.5, ROJO, ' letter-spacing="1"') + SERIF(448, 187, '¿Ninguna talla te calza?', 9, TINTA);

// Del boceto a tu clóset: los cuatro pasos del taller (se abren de frente)
const PASOS_T = [['I', 'BOCETO', 'La silueta y el detalle,', 'en papel.'], ['II', 'MOLDE', 'Se patrona y se prueba', 'hasta que cae bien.'],
  ['III', 'CONFECCIÓN', 'Se corta y se cose en', 'Chile, a mano.'], ['IV', 'TU CLÓSET', 'Te llega a la casa,', 'o a tu medida.']];
const PASOS = `<rect width="320" height="104" fill="${PAPEL}" stroke="${TINTA}" stroke-width="1.5"/>` +
  JOST(10, 14, 'EL TALLER', 6.5, ROJO, ' letter-spacing="1.2"') + SERIF(62, 15, `Del boceto <tspan fill="${ROJO}" font-style="italic">a tu clóset</tspan>`, 13, TINTA) +
  PASOS_T.map(([n, t, a, b], i) => { const x = 10 + i * 77; return `<path d="M${x} 24H${x + 70}" stroke="${TINTA}" stroke-width=".8"/>` + SERIF(x, 50, n, 22, ROJO, ' font-style="italic"') +
    JOST(x, 64, t, 6.5, TINTA, ' letter-spacing="1"') + JOST(x, 78, a, 5.6, TINTA2) + JOST(x, 87, b, 5.6, TINTA2); }).join('');

// La votación de la Sala de redacción: la tela de la próxima colección (las opciones de catalogo.js, de ejemplo)
const tela = (tipo) => tipo === 'listado' ? `<rect width="64" height="56" fill="#151312"/>` + Array.from({ length: 11 }, (_, i) => `<path d="M${3 + i * 6} 0V56" stroke="#5A5A60" stroke-width="1.2"/>`).join('')
  : tipo === 'mezclilla' ? `<rect width="64" height="56" fill="#3E5A80"/>` + Array.from({ length: 16 }, (_, i) => `<path d="M${-30 + i * 7} 56L${i * 7} 0" stroke="#5B7AA3" stroke-width="1.4" opacity=".7"/>`).join('') + `<path d="M8 6Q30 2 56 8" stroke="#C9A227" stroke-width="1.4" fill="none" stroke-dasharray="3 2"/>`
    : `<rect width="64" height="56" fill="#9E1B2A"/>` + [8, 26, 44].map(u => `<rect x="${u}" width="8" height="56" fill="#3A0E14" opacity=".55"/><rect y="${u}" width="64" height="8" fill="#3A0E14" opacity=".55"/>`).join('') +
      [16, 34, 52].map(u => `<path d="M${u} 0V56M0 ${u}H64" stroke="#F4F1EA" stroke-width=".8" opacity=".8"/>`).join('');
const VOTACION = `<rect width="240" height="140" fill="${PAPEL}" stroke="${TINTA}" stroke-width="1.5"/>` +
  JOST(10, 14, 'EN VOTACIÓN: LA TELA DE LA PRÓXIMA COLECCIÓN', 6.4, ROJO, ' letter-spacing="1"') +
  [['listado', 'Listado negro'], ['mezclilla', 'Mezclilla'], ['escoces', 'Escocés rojo']].map(([t, n], i) => { const x = 10 + i * 76; return `<g transform="translate(${x} 22)">${tela(t)}</g>` +
    `<rect x="${x}" y="22" width="64" height="56" fill="none" stroke="${TINTA}" stroke-width="1"/>` + SERIF(x, 92, n, 11, TINTA); }).join('') +
  `<rect x="10" y="104" width="112" height="24" fill="${OSCURO}"/>` + JOST(66, 120, 'VOTAR EN INSTAGRAM', 7, PAPEL, ' text-anchor="middle" letter-spacing="1"') +
  SERIF(132, 120, 'La eliges tú.', 12, ROJO, ' font-style="italic"');

// La tarjeta abanico, en el frente de la caja (se abre de frente): nueve varillas, premios con 3, 6 y 9
const varillas = (cx, cy, l) => Array.from({ length: 9 }, (_, i) => {
  const a1 = (-168 + i * 17) * Math.PI / 180, a2 = (-168 + (i + 1) * 17) * Math.PI / 180;
  const p = (a, d) => `${r1(cx + Math.cos(a) * d)} ${r1(cy + Math.sin(a) * d)}`;
  return `<path d="M${cx} ${cy}L${p(a1, l)}A${l} ${l} 0 0 1 ${p(a2, l)}Z" fill="${i < 3 ? ROSA : i < 6 ? ROJO2 : '#6E2F3D'}" stroke="${OSCURO}" stroke-width="1"/>` +
    ([2, 5, 8].includes(i) ? `<circle cx="${r1(cx + Math.cos((a1 + a2) / 2) * l * 0.72)}" cy="${r1(cy + Math.sin((a1 + a2) / 2) * l * 0.72)}" r="3.4" fill="none" stroke="${PAPEL}" stroke-width="1.2"/>` : '');
}).join('') + `<circle cx="${cx}" cy="${cy}" r="3" fill="${PAPEL}"/>`;
const ABANICO = `<rect width="200" height="80" fill="${OSCURO}"/>` + varillas(46, 70, 50) +
  JOST(104, 16, 'CLIENTAS FRECUENTES', 5.6, ROSA, ' letter-spacing="1.2"') + SERIF(104, 33, `La tarjeta <tspan fill="${ROSA}" font-style="italic">abanico</tspan>`, 15, PAPEL) +
  [['3', 'Un arreglo gratis'], ['6', 'Preventa 24 horas'], ['9', 'Una pieza a medida']].map(([n, t], i) => SERIF(104, 50 + i * 11, n, 10, ROSA) + JOST(114, 49 + i * 11, t, 6.2, PAPEL)).join('');

// Lo que muestra la pantalla del kiosco de BiPlot: el sitio de Rococoro (su portada real)
const SITIO = `<rect width="69" height="38" fill="${PAPEL}"/><image href="§M§rococoro-1-portada.webp" width="69" height="38" preserveAspectRatio="xMidYMin slice"/>`;

// Prendas colgadas (26 × 70, con su gancho): la colección del sitio, en sus colores
const PRENDA = {
  top: (c) => `<path d="M3 8L8 3H18L23 8L21 13V36H5V13Z" fill="${c}" stroke="#0B0B0B" stroke-width="1.1"/><path d="M11 3Q13 9 15 3" fill="none" stroke="#F4F1EA" stroke-width="1"/>`,
  pantalon: (c) => `<path d="M4 3H22L23.5 68H15L13 24L11 68H2.5Z" fill="${c}" stroke="#0B0B0B" stroke-width="1.1"/><path d="M9 3V18M17 3V18" stroke="#3B3B40" stroke-width=".8"/>`,
  vestido: (c) => `<path d="M6 7L9 3H17L20 7L19 22L25 68H1L7 22Z" fill="${c}" stroke="#0B0B0B" stroke-width="1.1"/><path d="M1 62Q7 66 13 62Q19 66 25 62" fill="none" stroke="#0B0B0B" stroke-width=".9"/>`,
  falda: (c) => `<path d="M5 3H21L25 44Q19 48 13 44Q7 48 1 44Z" fill="${c}" stroke="#0B0B0B" stroke-width="1.1"/><path d="M7 3V8M13 3V8M19 3V8" stroke="#F4F1EA" stroke-width=".9"/>`,
  sobrefalda: (c) => `<path d="M5 3H21L21 20Q16 30 8 34Q3 30 4 20Z" fill="${c}" stroke="#0B0B0B" stroke-width="1.1"/><path d="M4 22Q9 28 8 34M12 22Q15 28 13 32" fill="none" stroke="#0B0B0B" stroke-width=".8"/>`,
  escocesa: (c) => `<path d="M6 6L8 3M20 6L18 3" stroke="#0B0B0B" stroke-width="1.1"/><path d="M5 8H21L20 32H6Z" fill="${c}" stroke="#0B0B0B" stroke-width="1.1"/><path d="M5 8H9L8.6 32H6ZM17 8H21L20 32H17.4Z" fill="#9E1B2A"/><path d="M5 14H21M5 22H21" stroke="#3A0E14" stroke-width=".8" opacity=".6"/>`
};
const gancho = (x) => `<path d="M${x + 13} 3V0.6Q${x + 13} -1.6 ${x + 15} -1.6" stroke="#8E949B" stroke-width="1" fill="none"/>`;
const colgadas = (lista) => lista.map(([t, c], i) => `<g transform="translate(${i * 30} 2)">${gancho(0)}${PRENDA[t](c)}</g>`).join('');

export function salaRococoro() {
  return montar(({ E, L, pj, camina, lugar, zona }) => {
    // Parquet de roble claro (como el piso de sus fotos) y muros blancos, con el zócalo y el filete en sus rosas
    let tablas = '';
    for (let x = 0; x < W * 100; x += 25) {
      tablas += `<path d="M${x} 0V${D * 100}" stroke="#C7B290" stroke-width="1.6"/>`;
      for (let y = ((x / 25) % 4) * 45; y < D * 100; y += 180) tablas += `<path d="M${x} ${y}H${x + 25}" stroke="#C7B290" stroke-width="1.4"/>`;
    }
    base(E, L, { W, D, HM, piso: '#DCCAAD', dibujo: tablas, muroY: PAPEL, muroX: PAPEL2, zocalo: OSCURO, tope: PAPEL3, canto: '#C9C6BF', filete: ROJO });
    // La cinta que corre en su sitio, arriba de los muros
    const CINTA = 'Diseño de autor  ·  Hecho en Chile  ·  Tiradas cortas  ·  De nichooo  ·  Pruébatelo con tus medidas  ·  ';
    L.planoY(0, 0.022, HM - 0.06, W * 100, 15, `<rect width="${W * 100}" height="15" fill="${OSCURO}"/>` + SERIF(6, 11.5, CINTA.repeat(4), 10.5, ROSA, ' font-style="italic"'), -38.5);
    L.planoX(D, HM - 0.06, D * 100, 15, `<rect width="${D * 100}" height="15" fill="${OSCURO}"/>` + SERIF(6, 11.5, CINTA.repeat(3), 10.5, ROSA, ' font-style="italic"'), -38.5);
    // Diarios tirados en el piso, como en sus fotos
    const diarioPiso = (x, y, giro, k = -29) => L.piso(x, y, `<g transform="rotate(${giro} 30 40)"><rect width="60" height="80" fill="#F4F1EA" stroke="#CFC8BC" stroke-width="1.2"/>` +
      GOTICA(30, 13, 'Rococoro', 9, TINTA, ' text-anchor="middle"') + `<path d="M5 17H55M5 26H28M5 31H28M5 36H28M32 26H55M32 31H55M5 45H55M5 50H55M5 55H40M5 64H55M5 69H48" stroke="#9A958C" stroke-width="1.6"/></g>`, k);

    // ── La portada de El Rococoro en el muro y la mesa de los diarios de la edición ──
    L.planoY(0.5, 0.03, 2.56, 600, 200, PORTADA, -39);
    L.caja(1.0, 0.25, 0, 5.0, 0.6, 0.42, BLANCO, 3.4);
    for (let i = 0; i < 6; i++) { const x = 1.2 + i * 0.8; L.caja(x, 0.32, 0.42, 0.5, 0.42, 0.08 + (i % 3) * 0.04, PAPELES, 3.5 + x * 0.01); L.piso(x, 0.32, GOTICA(25, 18, 'Rococoro', 8, TINTA, ' text-anchor="middle"') + `<path d="M6 24H44M6 30H44" stroke="#9A958C" stroke-width="2"/>`, 3.6 + x * 0.01, 0.5 + (i % 3) * 0.04 + 0.002); }
    L.planoY(1.4, 0.852, 0.36, 420, 22, JOST(210, 15, 'EL ROCOCORO · EDICIÓN Nº 39 · TU PEDIDO LLEGA ENVUELTO EN ÉL', 10, OSCURO, ' text-anchor="middle" letter-spacing="1"'), 3.45);
    zona('portada', { formas: [{ plano: [[0.5, 0.03, 0.56], [6.5, 0.03, 0.56], [6.5, 0.03, 2.56], [0.5, 0.03, 2.56]] }, { piso: [[0.9, 0.2], [6.1, 0.2], [6.1, 0.95], [0.9, 0.95]], alto: 0.55 }],
      lugar: [3.5, 0.5, 2.85], guia: [3.6, 1.9], frente: { svg: PORTADA, ancho: 600, alto: 200, fondo: PAPEL } });

    // ── El set del lookbook: el papel blanco que baja del muro, diarios en el piso, la modelo con su abanico, dos focos y la fotógrafa ──
    L.cil(7.3, 0.12, 2.5, 0.1, 0.02, PAPEL3, PAPEL3, -36);
    L.linea([[7.3, 0.12, 2.52], [12.5, 0.12, 2.52]], '#B9B6AE', 7, -35.9);
    L.planoY(7.4, 0.06, 2.48, 500, 248, `<rect width="500" height="248" fill="#FFFFFF"/><path d="M0 230Q250 244 500 230V248H0Z" fill="#F4F3F0"/>`, -37);
    L.piso(7.4, 0.06, `<rect width="500" height="250" fill="#FFFFFF"/><path d="M0 0H500V18H0Z" fill="#F4F3F0"/>`, -30.5);
    for (const [x, y, g] of [[7.9, 0.9, -12], [8.8, 1.6, 18], [10.6, 0.7, 6], [11.3, 1.5, -20], [9.3, 0.4, 32], [10.2, 2.0, -6]]) diarioPiso(x, y, g, -30.2);
    pj('roModelo', 9.95, 1.25, 0, 'd');
    const foco = (x, y) => {
      L.cil(x, y, 0, 0.04, 1.55, '#2A2A2E', '#1A1A1D', x + y + 0.1);
      for (const [dx, dy] of [[-0.3, -0.2], [0.3, -0.2], [0, 0.32]]) L.linea([[x, y, 0.5], [x + dx, y + dy, 0]], '#2A2A2E', 1.6, x + y);
      L.caja(x - 0.32, y - 0.1, 1.42, 0.64, 0.2, 0.6, { t: '#2A2A2E', l: '#F7F7F4', r: '#1A1A1D' }, x + y + 0.3);
    };
    foco(7.75, 2.5); foco(12.25, 2.3);
    pj('roFotografa', 10.5, 3.45, 0, 'i');
    zona('lookbook', { formas: [{ piso: [[7.2, 0.1], [12.8, 0.1], [12.8, 3.9], [7.2, 3.9]], alto: 2.5 }], lugar: [10.0, 1.6, 2.75], guia: [9.0, 4.5] });

    // ── El probador: dos cabinas con cortina, el espejo, la regla de altura y el maniquí con la cabeza de la Directora ──
    L.planoY(13.6, 0.03, 2.56, 380, 26, SERIF(0, 20, `El probador · <tspan fill="${ROJO}" font-style="italic">tu maniquí, tus medidas</tspan>`, 20, TINTA), -38);
    const cabina = (x, abierta) => {
      L.caja(x, 0.05, 0, 0.05, 1.35, 2.4, BLANCO, x + 0.7);
      L.caja(x + 1.45, 0.05, 0, 0.05, 1.35, 2.4, BLANCO, x + 2.2);
      L.linea([[x + 0.05, 1.42, 2.36], [x + 1.45, 1.42, 2.36]], '#8E949B', 2.4, x + 2.25);
      const ancho = abierta ? 70 : 140;
      L.planoY(x + 0.05 + (abierta ? 0.7 : 0), 1.42, 2.34, ancho, 222, `<rect width="${ancho}" height="222" fill="${OSCURO}"/>` +
        Array.from({ length: Math.round(ancho / 10) }, (_, i) => `<path d="M${i * 10 + 5} 0V222" stroke="${i % 2 ? '#36121C' : '#6E2F3D'}" stroke-width="4"/>`).join(''), x + 2.3);
    };
    cabina(13.6, false); cabina(15.2, true);
    L.planoY(17.2, 0.04, 2.3, 100, 212, `<rect width="100" height="212" rx="50" fill="${OSCURO}"/><rect x="6" y="6" width="88" height="200" rx="44" fill="#CDD8DE"/>` +
      `<path d="M20 190L70 20M40 196L86 50" stroke="#FFFFFF" stroke-width="7" opacity=".45"/>`, -38);
    L.planoY(18.75, 0.035, 2.2, 22, 200, `<rect width="22" height="200" fill="#EBD9A2" stroke="#B9A06A" stroke-width="1"/>` +
      Array.from({ length: 20 }, (_, i) => `<path d="M0 ${i * 10 + 5}H${i % 5 ? 7 : 13}" stroke="#5A4A2A" stroke-width="1"/>`).join(''), -38);
    L.cil(18.1, 2.5, 0, 0.42, 0.06, '#FFFFFF', PAPEL3, 20.6);
    pj('maniqui', 18.1, 2.5, 0.06, 'd');
    // La cinta de medir en el cuello del maniquí y la clienta, que pone sus medidas en el celular
    L.linea([[17.85, 2.45, 1.62], [17.9, 2.6, 1.0], [17.95, 2.65, 0.75]], '#EBD9A2', 2.2, 21.2);
    pj('roClienta', 16.7, 3.15, 0, 'd');
    zona('probador', { formas: [{ piso: [[13.4, 0.1], [19.8, 0.1], [19.8, 3.7], [13.4, 3.7]], alto: 2.55 }], lugar: [16.6, 1.8, 2.95], guia: [15.5, 4.3] });

    // ── El taller: la mesa de corte con la tela y los moldes, la máquina de coser con la costurera y, en el muro, los
    //    figurines de la colección y «Del boceto a tu clóset» ──
    L.planoX(4.9, 2.56, 330, 24, SERIF(0, 19, `El taller <tspan fill="${ROJO}" font-style="italic">de Rococoro</tspan>`, 19, TINTA), -38);
    L.planoX(5.4, 2.4, 120, 150, `<rect width="120" height="150" fill="${PAPEL}" stroke="${TINTA}" stroke-width="3"/><image href="§M§rococoro-figurines.webp" x="5" y="5" width="110" height="140" preserveAspectRatio="xMidYMid slice"/>`, -38);
    L.planoX(3.5, 2.36, 320, 104, PASOS, -38);
    L.caja(0.6, 1.4, 0, 2.3, 2.7, 0.86, ROBLE, 3.6);
    L.piso(0.75, 1.55, `<rect width="200" height="150" fill="#151312"/><path d="M0 40H200M0 90H200" stroke="#2A2A2E" stroke-width="3"/>`, 4.6, 0.87);
    L.piso(1.0, 2.9, `<path d="M10 10H120L132 60L100 110H22L4 60Z" fill="#C9A77E" stroke="#8C6A4E" stroke-width="2"/><path d="M60 10V110" stroke="#8C6A4E" stroke-width="1.6" stroke-dasharray="6 4"/>` +
      `<path d="M140 20H190V90H140Z" fill="#E8D3B0" stroke="#8C6A4E" stroke-width="2"/>`, 4.7, 0.871);
    L.linea([[2.5, 1.7, 0.88], [2.6, 3.9, 0.88]], '#EBD9A2', 2.6, 6.6);
    L.linea([[2.2, 4.0, 0.9], [2.45, 3.75, 0.9]], '#B9BEC4', 2.2, 7.0); L.linea([[2.2, 3.75, 0.9], [2.45, 4.0, 0.9]], '#B9BEC4', 2.2, 7.01);
    // El busto de costura junto a la mesa
    L.cil(3.35, 4.5, 0, 0.18, 0.04, '#2A2A2E', '#1A1A1D', 7.7);
    L.cil(3.35, 4.5, 0, 0.03, 1.0, '#8E949B', '#6B7178', 7.75);
    L.cil(3.35, 4.5, 1.0, 0.2, 0.5, '#151312', '#000000', 8.2);
    L.cil(3.35, 4.5, 1.5, 0.06, 0.08, '#8E949B', '#6B7178', 8.25);
    // La máquina de coser y la costurera
    L.caja(0.35, 4.7, 0, 1.25, 1.0, 0.74, NOGAL, 5.9);
    L.caja(0.55, 4.95, 0.74, 0.7, 0.32, 0.16, NEGRO, 6.6);
    L.caja(0.55, 4.95, 0.9, 0.16, 0.32, 0.26, NEGRO, 6.62);
    L.caja(0.55, 4.95, 1.12, 0.62, 0.32, 0.12, NEGRO, 6.64);
    L.cil(0.9, 5.3, 0.74, 0.05, 0.12, ROJO, '#6E2F3D', 6.7);
    silla(L, 2.0, 5.2, { t: '#2A2A2E', l: '#1A1A1D', r: '#121214' }, 0.4);
    pj('roCostura', 2.0, 5.2, 0.47, 'i', undefined, 7.5);
    // Los carretes de hilo en el muro
    L.planoX(6.5, 1.5, 90, 60, `<rect width="90" height="60" fill="${NOGAL.t}"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${6 + (i % 6) * 14}" y="${6 + Math.floor(i / 6) * 28}" width="8" height="20" rx="2" fill="${['#151312', ROJO, PAPEL, '#3E5A80', ROSA, '#7A7A4E'][i % 6]}"/>`).join(''), -38);
    zona('taller', { formas: [{ piso: [[0.2, 1.0], [3.8, 1.0], [3.8, 6.2], [0.2, 6.2]], alto: 1.9 }], lugar: [1.9, 3.4, 2.2], guia: [4.4, 3.6] });
    zona('figurines', { formas: [{ plano: [[0.03, 5.4, 0.9], [0.03, 4.2, 0.9], [0.03, 4.2, 2.4], [0.03, 5.4, 2.4]] }], lugar: [0.05, 4.8, 2.5], guia: [4.4, 3.6],
      frente: { img: 'rococoro-figurines', ancho: 480, alto: 600, alt: 'Los figurines de la colección de Rococoro: un vestido oliva con volante, un top negro con flores rojas, un pantalón con sobrefalda y una falda con volante', pie: 'Figurines de la colección' } });
    zona('pasos', { formas: [{ plano: [[0.03, 3.5, 1.32], [0.03, 0.3, 1.32], [0.03, 0.3, 2.36], [0.03, 3.5, 2.36]] }], lugar: [0.05, 1.9, 2.5], guia: [4.4, 3.6],
      frente: { svg: PASOS, ancho: 320, alto: 104, fondo: PAPEL } });

    // ── La sala de redacción: el escritorio con la máquina de escribir, la editora y la votación de la próxima colección ──
    L.planoX(10.4, 2.56, 330, 24, SERIF(0, 19, `Sala de <tspan fill="${ROJO}" font-style="italic">redacción</tspan>`, 19, TINTA), -38);
    L.planoX(10.2, 2.32, 240, 140, VOTACION, -38);
    L.caja(0.5, 7.6, 0, 1.8, 1.7, 0.78, NOGAL, 9.3);
    L.caja(0.8, 7.9, 0.78, 0.62, 0.5, 0.14, NEGRO, 9.9);
    L.caja(0.85, 7.95, 0.92, 0.5, 0.1, 0.24, PAPELES, 9.95);
    L.piso(1.5, 8.6, `<rect width="50" height="40" fill="#F4F1EA" stroke="#CFC8BC" stroke-width="1"/><rect x="40" y="30" width="50" height="40" fill="#F4F1EA" stroke="#CFC8BC" stroke-width="1"/>`, 10.5, 0.79);
    silla(L, 2.85, 8.4, { t: OSCURO, l: '#36121C', r: '#2A0E15' }, 0.4);
    pj('roEditora', 2.85, 8.4, 0.47, 'i', undefined, 11.5);
    zona('redaccion', { formas: [{ piso: [[0.3, 7.3], [3.4, 7.3], [3.4, 9.7], [0.3, 9.7]], alto: 1.75 }], lugar: [1.6, 8.5, 2.1], guia: [4.4, 8.6] });
    zona('votacion', { formas: [{ plano: [[0.03, 10.2, 0.92], [0.03, 7.8, 0.92], [0.03, 7.8, 2.32], [0.03, 10.2, 2.32]] }], lugar: [0.05, 9.0, 2.45], guia: [4.4, 8.6],
      frente: { svg: VOTACION, ancho: 240, alto: 140, fondo: PAPEL } });

    // ── El rincón de la Directora: su retrato (la tinta de su tatuaje, tal cual) y su escritorio con las cartas ──
    L.planoX(13.5, 2.5, 116, 240, `<rect width="116" height="240" fill="${OSCURO}"/><rect x="6" y="6" width="104" height="228" fill="${PAPEL}"/>` +
      `<image href="§M§rococoro-directora.webp" x="10" y="10" width="96" height="220"/>`, -38);
    L.planoX(13.4, 0.2, 100, 16, `<rect width="100" height="16" fill="${OSCURO}"/>` + SERIF(50, 12, 'La directora', 11, ROSA, ' text-anchor="middle" font-style="italic"'), -37.9);
    L.caja(0.45, 10.9, 0, 1.4, 1.7, 0.76, NEGRO, 12.6);
    L.caja(0.42, 10.86, 0.76, 1.46, 1.78, 0.04, ROSE, 12.65);
    for (let i = 0; i < 5; i++) L.piso(0.6 + (i % 2) * 0.35, 11.1 + i * 0.25, `<rect width="34" height="22" fill="#F4F1EA" stroke="#B9B2A6" stroke-width="1"/><path d="M0 0L17 12L34 0" stroke="#B9B2A6" stroke-width="1" fill="none"/>`, 13.4 + i * 0.01, 0.805 + i * 0.012);
    L.cil(1.55, 11.3, 0.8, 0.05, 0.45, '#2A2A2E', '#1A1A1D', 13.8);
    L.cil(1.55, 11.3, 1.2, 0.18, 0.14, ROJO, '#6E2F3D', 13.85);
    L.caja(2.1, 11.4, 0, 0.6, 0.6, 0.42, ROSE, 14.2);
    L.caja(2.1, 11.4, 0.42, 0.14, 0.6, 0.6, ROSE, 14.0);
    zona('directora', { formas: [{ plano: [[0.03, 13.5, 0.1], [0.03, 12.34, 0.1], [0.03, 12.34, 2.5], [0.03, 13.5, 2.5]] }, { piso: [[0.3, 10.7], [2.8, 10.7], [2.8, 12.7], [0.3, 12.7]], alto: 1.4 }],
      lugar: [1.2, 11.7, 2.65], guia: [3.6, 12.2],
      frente: { img: 'rococoro-directora', ancho: 510, alto: 1159, fondo: PAPEL, alt: 'La Directora de Rococoro: una mujer con cabeza de pez, con top corto, mangas de malla y pantalón ajustado, dibujada a tinta (el tatuaje de la marca)', pie: 'La directora, del tatuaje de la marca' } });

    // ── La colección: dos percheros con las nueve prendas y la mesa de las tiradas cortas ──
    const perchero = (x, y, lista, k) => {
      L.caja(x, y, 0, 0.06, 0.06, 1.62, NEGRO, k);
      L.caja(x + 3.6, y, 0, 0.06, 0.06, 1.62, NEGRO, k + 3.7);
      L.linea([[x + 0.03, y + 0.03, 1.6], [x + 3.63, y + 0.03, 1.6]], '#8E949B', 2.4, k + 1.9);
      L.planoY(x + 0.2, y + 0.05, 1.55, lista.length * 30, 72, colgadas(lista), k + 2.0);
    };
    perchero(5.5, 6.0, [['top', '#151312'], ['top', '#3E5A80'], ['escocesa', '#C9707F'], ['top', '#151312'], ['sobrefalda', '#3B3B40'], ['falda', '#2A2A2E'], ['vestido', '#151312'], ['vestido', '#7A7A4E'], ['vestido', '#151312'], ['pantalon', '#151312'], ['pantalon', '#151312']], 9.5);
    perchero(5.5, 8.3, [['vestido', '#151312'], ['vestido', '#7A7A4E'], ['pantalon', '#151312'], ['falda', '#2A2A2E'], ['top', '#3E5A80'], ['escocesa', '#C9707F'], ['sobrefalda', '#3B3B40'], ['top', '#151312'], ['vestido', '#151312'], ['top', '#151312'], ['falda', '#151312']], 11.8);
    L.caja(10.3, 6.5, 0, 1.6, 1.3, 0.8, BLANCO, 13.4);
    for (const [x, y, c] of [[10.45, 6.65, '#151312'], [10.95, 6.62, '#3E5A80'], [11.45, 6.7, OSCURO], [10.55, 7.2, '#7A7A4E'], [11.15, 7.25, '#151312']]) L.caja(x, y, 0.8, 0.42, 0.42, 0.08, { t: c, l: c, r: '#000000' }, x + y + 0.9);
    L.planoY(10.45, 7.802, 0.66, 130, 34, `<rect width="130" height="34" fill="${OSCURO}"/>` + JOST(65, 14, 'TIRADAS CORTAS', 8.5, PAPEL, ' text-anchor="middle" letter-spacing="1.4"') + SERIF(65, 28, 'Pieza única', 11, ROSA, ' text-anchor="middle" font-style="italic"'), 14.7);
    camina('roCompradora', [[12.7, 9.6, 2.5], [5.0, 9.7, 1], [4.9, 7.2, 2], [9.7, 7.2, 2], [4.9, 7.2], [5.0, 9.7]], { vel: 0.4 });
    zona('coleccion', { formas: [{ piso: [[5.3, 5.8], [12.1, 5.8], [12.1, 8.6], [5.3, 8.6]], alto: 1.7 }], lugar: [8.7, 7.2, 2.0], guia: [8.4, 10.1] });

    // ── La vitrina: el maniquí de la portada (Top Lazo y Pantalón Pliegue), entre diarios ──
    for (const [x, y, g] of [[12.6, 11.4, 14], [13.9, 12.6, -10], [12.9, 12.9, 28]]) diarioPiso(x, y, g, -28);
    L.cil(13.6, 12.1, 0, 0.55, 0.22, PAPEL, PAPEL3, 25.6);
    pj('roVitrina', 13.6, 12.1, 0.22, 'd');
    L.planoY(13.0, 12.66, 0.2, 120, 18, `<rect width="120" height="18" fill="${PAPEL}" stroke="${TINTA}" stroke-width="1"/>` + SERIF(60, 13, 'En portada: Top Lazo y Pantalón Pliegue', 8.5, TINTA, ' text-anchor="middle" font-style="italic"'), 26.1);
    zona('vitrina', { formas: [{ piso: [[12.8, 11.4], [14.4, 11.4], [14.4, 12.8], [12.8, 12.8]], alto: 2.1 }], lugar: [13.6, 12.1, 2.35], guia: [14.9, 13.2] });

    // ── La caja: el mesón en Dark Rose, el pedido envuelto en diario, la bolsa, el timbre y la tarjeta abanico al frente ──
    L.planoY(15.3, 7.38, 2.66, 300, 40, `<path d="M40 0V-30M260 0V-30" stroke="#8E949B" stroke-width="1.5"/><rect width="300" height="40" fill="${PAPEL}" stroke="${TINTA}" stroke-width="1.5"/>` +
      JOST(150, 16, 'LA BOLSA', 9, ROJO, ' text-anchor="middle" letter-spacing="2"') + SERIF(150, 33, 'Sin cobro en línea: el pedido sale por mensaje', 12, TINTA, ' text-anchor="middle" font-style="italic"'), 24.5);
    L.caja(15.2, 7.4, 0, 3.4, 0.7, 1.0, ROSE, 17.0 + 7.75 + 0.5);
    L.caja(15.15, 7.35, 1.0, 3.5, 0.8, 0.05, BLANCO, 17.0 + 7.75 + 0.52);
    L.planoY(15.5, 8.104, 0.92, 200, 80, ABANICO, 17.0 + 7.75 + 0.51);
    L.planoY(17.85, 8.104, 0.92, 70, 66, `<rect width="70" height="66" fill="#36121C"/>` + GOTICA(35, 30, 'R', 34, ROSA, ' text-anchor="middle"') + JOST(35, 52, 'ROCOCORO', 7, PAPEL, ' text-anchor="middle" letter-spacing="1.5"'), 17.0 + 7.75 + 0.511);
    L.caja(15.5, 7.5, 1.05, 0.62, 0.46, 0.2, PAPELES, 25.8);
    L.piso(15.5, 7.5, GOTICA(31, 26, 'Rococoro', 9, TINTA, ' text-anchor="middle"') + `<path d="M4 32H58M4 38H58" stroke="#9A958C" stroke-width="1.6"/><path d="M31 0V46" stroke="${ROJO}" stroke-width="3"/>`, 25.81, 1.252);
    L.caja(16.5, 7.55, 1.05, 0.42, 0.24, 0.5, ROSE, 26.0);
    L.linea([[16.6, 7.67, 1.55], [16.71, 7.67, 1.7], [16.82, 7.67, 1.55]], '#151312', 1.6, 26.05);
    L.cil(17.6, 7.7, 1.05, 0.06, 0.16, NOGAL.t, NOGAL.l, 26.3); L.cil(17.6, 7.7, 1.2, 0.1, 0.04, '#151312', '#000000', 26.31);
    L.cil(18.2, 7.65, 1.05, 0.08, 0.26, '#E3E1DC', '#C9C6BF', 26.4);
    for (const [dx, dz] of [[-0.05, 0.42], [0.04, 0.46], [0.0, 0.4]]) { const [fx, fy] = L.P(18.2 + dx, 7.65, 1.05 + dz); L.add(26.42, `<circle cx="${r1(fx)}" cy="${r1(fy)}" r="4.2" fill="#9E1B2A" stroke="#4A0E16" stroke-width="1"/>`); }
    pj('roVendedora', 16.9, 6.85, 0, 'd');
    zona('caja', { formas: [{ piso: [[15.0, 6.4], [18.8, 6.4], [18.8, 8.15], [15.0, 8.15]], alto: 2.0 }], lugar: [17.0, 7.3, 2.3], guia: [14.6, 9.0] });
    zona('abanico', { formas: [{ plano: [[15.5, 8.15, 0.12], [17.5, 8.15, 0.12], [17.5, 8.15, 0.92], [15.5, 8.15, 0.92]] }], lugar: [16.5, 8.2, 1.15], guia: [14.6, 9.0],
      frente: { svg: ABANICO, ancho: 200, alto: 80, fondo: OSCURO } });

    // ── «Lectura obligada»: el sofá con El Rococoro, como en su lookbook, y la mesita con la flor roja ──
    L.caja(4.5, 11.15, 0, 2.8, 0.9, 0.4, ROSE, 4.5 + 1.4 + 11.6);
    L.caja(4.5, 11.15, 0.4, 2.8, 0.22, 0.55, ROSE, 4.5 + 1.4 + 11.3);
    L.caja(4.5, 11.15, 0.4, 0.22, 0.9, 0.25, ROSE, 4.6 + 11.6 + 0.3);
    L.caja(7.08, 11.15, 0.4, 0.22, 0.9, 0.25, ROSE, 7.2 + 11.6 + 0.5);
    pj('roLectora2', 5.4, 11.7, 0.42, 'd', undefined, 17.6);
    pj('roLectora3', 6.5, 11.7, 0.42, 'i', undefined, 18.7);
    L.cil(7.95, 11.6, 0, 0.32, 0.55, PAPEL, PAPEL3, 19.6);
    L.cil(7.95, 11.6, 0.55, 0.07, 0.24, '#E3E1DC', '#C9C6BF', 19.7);
    for (const [dx, dz] of [[-0.05, 0.36], [0.05, 0.4]]) { const [fx, fy] = L.P(7.95 + dx, 11.6, 0.55 + dz); L.add(19.75, `<circle cx="${r1(fx)}" cy="${r1(fy)}" r="5" fill="#9E1B2A" stroke="#4A0E16" stroke-width="1"/>`); }
    for (const [x, y, g] of [[5.0, 12.4, -8], [6.6, 12.6, 22]]) diarioPiso(x, y, g, -28);
    zona('lectura', { formas: [{ piso: [[4.3, 11.0], [8.4, 11.0], [8.4, 12.7], [4.3, 12.7]], alto: 1.55 }], lugar: [6.0, 11.6, 1.85], guia: [6.2, 13.4] });

    // ── La entrada: el felpudo y quien lee la edición del día ──
    L.piso(16.3, 13.0, `<rect width="210" height="80" rx="6" fill="${OSCURO}"/><rect x="8" y="8" width="194" height="64" rx="4" fill="none" stroke="${ROSA}" stroke-width="2"/>` + GOTICA(105, 52, 'Rococoro', 30, PAPEL, ' text-anchor="middle"'), -52);
    camina('roLectora', [[15.4, 10.6, 3], [12.0, 10.3, 2], [15.4, 10.6]], { vel: 0.35 });
    lugar('entrada', 17.4, 13.2, 0.9);

    // ── La Directora, que recorre su tienda (y guía el recorrido) ──
    camina('directora', [[11.4, 4.7, 3], [5.0, 4.8, 2.5], [11.4, 4.7]], { vel: 0.4 });

    // ── El rincón de BiPlot: Grillo, que diseñó el sitio (el prototipo, en desarrollo) ──
    kioscoBiPlot({ L, pj, zona }, 9.4, 12.2, 'grilla', null, SITIO);

    return { id: 'rococoro', ancho: W, fondo: D };
  });
}

export const rococoro = salaRococoro;
