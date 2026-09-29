// El Archivo, el museo de BiPlot. La línea de «Seis décadas, la misma línea» (el sitio) cruza el piso: parte a lápiz en
// la entrada y cambia de herramienta en cada época, con una pieza por época (1985 la libreta, 1990 la terminal, 1998 el
// software de caja, 2015 el portátil con sus tres palabras), hasta volverse la línea cian de BiPlot HQ (hoy: las diez
// fases, cada una con alguien a cargo). Sigue por una pieza única de cada desarrollo, en el orden en que llegaron a
// biplot.cl (la escritura de Fundos 360, el QR de la mesa de Haru 360, el módulo de Nu Home 360, la huella de Eleven 360 y
// el elefante de Rumbo en sus cuatro etapas), y termina en el punto coral del isotipo, junto a un pedestal libre: tu
// turno. En el muro, la línea de tiempo de 2026, el primer plano de la oficina y el nombre del museo; a la izquierda, el
// fichero con todos los casos por rubro y una carpeta por caso. Lo cuida Pepa (Cosecha): «Lo que sirve dos veces se
// guarda». Sus textos (tarjetas, burbujas y recorrido) están en datos.js (salas.archivo.salaPropia).
import { montar, base, registrar, planoXen, plantaAlta, txt, mono, PELO, Z, PIEL, EA, r1 } from './comun.mjs';
import { ETAPAS } from './elefantes.mjs';

const AZUL = '#0E2A47', AZUL2 = '#12375E', CIAN = '#17C3B2', CIAN2 = '#7FD8CF', TINTA = '#13202E', GRIS = '#5B6776', CORAL = '#FF6B4A';
const MURO = '#F1EEE8', MURO2 = '#E4E0D8';
// Los colores de cada época, los mismos del sitio (plotline.html)
const EPOCA = { papel: '#E8DFC8', hoja: '#F4ECD8', lapiz: '#3A2F1C', rojo: '#A4241A', fosforo: '#5FF0D0', fosforo2: '#3FAE94', pantalla: '#040A08',
  neon: '#FF6BD6', neon2: '#00F6FF', morado: '#150523', ventana: '#1A1030', barra: '#241640', azul: '#2B57D6', celeste: '#E8EDFB', gris: '#DBE1E8' };
const BLANCO = { t: '#FFFFFF', l: '#ECE9E3', r: '#D9D5CD' };
const ZOCALO = { t: '#D9D5CD', l: '#C9C4BA', r: '#B7B1A6' };
const ROBLE = { t: '#C9AE86', l: '#B0936A', r: '#957955' };
const NOGAL = { t: '#8C6A4A', l: '#735538', r: '#5E452D' };
const NEGRO = { t: '#2B2F36', l: '#1F2329', r: '#171A1F' };
const BEIGE = { t: '#EDE6D3', l: '#DCD3BC', r: '#C8BEA4' };
const W = 20, D = 14, HM = 2.6;

// ───────── Quienes visitan el museo (ilustraciones sin nombre) ─────────
registrar({
  arMira: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'melena', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#C9A24E', '#A8843A', ['#F2F4F7']], abajo: 'pantalon', abajoCol: ['#2A3038', '#1F242B'], zapatos: Z.negras, brazoD: 'cadera', ojos: 'grandes' },
  arLentes: { piel: PIEL.clara, pelo: PELO.canoso, peinado: 'corto', arriba: 'blazer', arribaCol: ['#3A4A5C', '#2B3847', ['#F2F4F7', '#17C3B2']], abajo: 'pantalon', abajoCol: ['#8B8272', '#6E6658'], zapatos: Z.cafe, lentes: 'rectos', brazoD: 'senala', barba: '#B9C0C8' },
  arFoto: { piel: PIEL.trigo, pelo: PELO.castano, peinado: 'cola', lazo: CIAN, cuerpo: 'fino', arriba: 'parka', arribaCol: ['#2A7C78', '#1F5F5C', '#174A48'], abajo: 'pantalon', abajoCol: ['#35557A', '#27425F'], zapatos: Z.blancas, brazoD: 'telefono', objeto: 'camara' },
  arBanco: { piel: PIEL.media, pelo: PELO.cafe, peinado: 'rizado', cuerpo: 'fino', arriba: 'poleron', arribaCol: ['#6E86B8', '#566E9E', '#566E9E'], abajo: 'pantalon', abajoCol: ['#2A3038', '#1F242B'], zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', objeto: 'libreta' },
  arJoven: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'rizado', arriba: 'polera', arribaCol: ['#E0B341', '#C49A2E'], manga: 'corta', abajo: 'pantalon', abajoCol: ['#35557A', '#27425F'], zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'celular', ojos: 'grandes' }
});

// La luz de cada pieza, en el piso: una mancha tibia que se apaga hacia los bordes
const LUZ = `<defs><radialGradient id="ar-luz"><stop offset="0" stop-color="#FFF1CF" stop-opacity=".30"/><stop offset=".55" stop-color="#FFF1CF" stop-opacity=".12"/><stop offset="1" stop-color="#FFF1CF" stop-opacity="0"/></radialGradient></defs>`;
const luz = (L, x, y, r = 1.1) => L.piso(x - r, y - r, `<circle cx="${r * 100}" cy="${r * 100}" r="${r * 100}" fill="url(#ar-luz)"/>`, -30, 0.012);

// Contenido 2D sobre un plano cualquiera (una hoja inclinada, la pantalla de un portátil): o es la esquina de arriba a la
// izquierda y u, v los lados (en baldosas) que corresponden al ancho a y al alto h del dibujo
function plano(L, o, u, v, a, h, svg, k) {
  const p0 = L.P(...o), pu = L.P(o[0] + u[0], o[1] + u[1], o[2] + u[2]), pv = L.P(o[0] + v[0], o[1] + v[1], o[2] + v[2]);
  L.E.marca(...o); L.E.marca(o[0] + u[0] + v[0], o[1] + u[1] + v[1], o[2] + u[2] + v[2]);
  const m = [(pu[0] - p0[0]) / a, (pu[1] - p0[1]) / a, (pv[0] - p0[0]) / h, (pv[1] - p0[1]) / h].map((n) => n.toFixed(4));
  return L.add(k, `<g transform="matrix(${m.join(',')},${r1(p0[0])},${r1(p0[1])})">${svg}</g>`);
}

// Una vitrina: pedestal blanco con su cédula al frente, la pieza adentro y el vidrio alrededor (la cara de atrás antes
// de la pieza y la de adelante después). pieza(z) dibuja lo que va adentro, parado sobre el pedestal (z = h).
function vitrina(L, x, y, cedula, pieza, o = {}) {
  const s = o.s || 0.86, h = o.h || 0.98, hv = o.hv || 0.7, x0 = x - s / 2, y0 = y - s / 2, x1 = x + s / 2, y1 = y + s / 2, k = x + y, zv = h + hv;
  luz(L, x, y, 1.15);
  L.caja(x0, y0, 0, s, s, h, BLANCO, k);
  L.caja(x0 - 0.02, y0 - 0.02, 0, s + 0.04, s + 0.04, 0.08, ZOCALO, k - 0.01);
  // La cédula: una placa oscura al frente del pedestal
  const cw = r1((s - 0.1) * 100);
  L.planoY(x0 + 0.05, y1 + 0.004, h - 0.14, cw, 30, `<rect width="${cw}" height="30" rx="2" fill="${AZUL}"/>` +
    (cedula[0].length > 19 ? mono(5, 11.5, cedula[0], 5.2, CIAN2) : mono(5, 11.5, cedula[0], 5.6, CIAN2, ' letter-spacing=".3"')) + txt(5, 24, cedula[1], 7.6, '#FFFFFF'), k + 0.02);
  const vid = (pts, kk, a = '.13') => L.add(kk, L.poly(pts, `fill="rgba(214,236,240,${a})" stroke="rgba(255,255,255,.6)" stroke-width=".7" stroke-linejoin="round"`));
  vid([[x0, y0, h], [x1, y0, h], [x1, y0, zv], [x0, y0, zv]], k - 0.3, '.10');
  vid([[x0, y0, h], [x0, y1, h], [x0, y1, zv], [x0, y0, zv]], k - 0.3, '.08');
  if (pieza) pieza(h);
  vid([[x0, y1, h], [x1, y1, h], [x1, y1, zv], [x0, y1, zv]], k + 0.6, '.12');
  vid([[x1, y0, h], [x1, y1, h], [x1, y1, zv], [x1, y0, zv]], k + 0.6, '.10');
  vid([[x0, y0, zv], [x1, y0, zv], [x1, y1, zv], [x0, y1, zv]], k + 0.61, '.16');
  // Un reflejo en diagonal en la cara de adelante
  L.add(k + 0.62, L.poly([[x0 + 0.12, y1, zv - 0.08], [x0 + 0.22, y1, zv - 0.08], [x0 + 0.05, y1, h + 0.1], [x0 + 0.02, y1, h + 0.1]], 'fill="rgba(255,255,255,.35)"'));
}

// El elefante de Rumbo parado en (x, y, z), de alto h (su dibujo va de pie, como la gente)
const elefante = (L, svg, x, y, z, h, k) => {
  const [px, py] = L.P(x, y, z), s = h * 39 / 222;
  L.E.marca(x, y, z); L.E.marca(x, y, z + h);
  L.add(k, `<g transform="translate(${r1(px - 128 * s)} ${r1(py - 222 * s)}) scale(${s.toFixed(4)})">${svg}</g>`);
};

// ───────── Las piezas de cada época ─────────
// 1985 · La libreta abierta: planillas a mano, un clip, la corrección en rojo y el timbre «Diagnóstico pendiente»
const LIBRETA = `<rect x="0" y="0" width="27.5" height="37" rx="1" fill="${EPOCA.hoja}" stroke="#D8CDB2" stroke-width=".5"/><rect x="28.5" y="0" width="27.5" height="37" rx="1" fill="${EPOCA.hoja}" stroke="#D8CDB2" stroke-width=".5"/>` +
  Array.from({ length: 8 }, (_, i) => `<circle cx="28" cy="${3 + i * 4.4}" r=".9" fill="none" stroke="#8C8577" stroke-width=".6"/>`).join('') +
  [7, 11, 15, 19, 23, 27, 31].map((y, i) => `<path d="M3 ${y}H${24 - (i % 3) * 3}" stroke="#9C8E72" stroke-width=".7"/><path d="M3 ${y - 1.4}q2 -1 4 0t4 0t4 0" stroke="${EPOCA.lapiz}" stroke-width=".45" fill="none" opacity=".7"/>`).join('') +
  `<path d="M14 18.5H21" stroke="${EPOCA.rojo}" stroke-width=".9"/><path d="M15 16q2 -1.6 4 0" stroke="${EPOCA.rojo}" stroke-width=".7" fill="none"/>` +
  `<path d="M4.5 -1.5V6.5a1.6 1.6 0 0 0 3.2 0V0" stroke="#9AA3AD" stroke-width=".8" fill="none"/>` +
  [8, 12, 16].map((y) => `<path d="M31 ${y}H${52 - (y % 3) * 2}" stroke="#9C8E72" stroke-width=".7"/>`).join('') +
  `<g transform="rotate(-8 42 27)"><rect x="32" y="22" width="21" height="9" rx="1" fill="none" stroke="${EPOCA.rojo}" stroke-width=".9"/>` +
  mono(33.6, 25.6, 'DIAGNÓSTICO', 2.7, EPOCA.rojo) + mono(34.8, 29.2, 'PENDIENTE', 2.7, EPOCA.rojo) + '</g>';
// 1990 · La terminal: «> LEYENDO PROCESO… 14 PASOS MANUALES»
const TERMINAL = `<rect width="32" height="22" rx="3" fill="#0B1A12"/><rect x="2" y="2" width="28" height="18" rx="2" fill="${EPOCA.pantalla}"/>` +
  mono(4, 7.6, '&gt; PROCESO', 3.8, EPOCA.fosforo) + mono(4, 12.2, '&gt; 14 PASOS', 3.8, EPOCA.fosforo2) + `<rect x="4.4" y="14.6" width="3" height="3.6" fill="${EPOCA.fosforo}"/>`;
// 1998 · El enredo: ventanas encima de ventanas en el monitor, y el software en su caja
const ENREDO = `<rect width="30" height="24" rx="3" fill="#2A2530"/><rect x="2" y="2" width="26" height="20" rx="1.5" fill="${EPOCA.morado}"/>` +
  [[4, 4, 14, 9], [12, 8, 13, 9], [6, 12.5, 12, 7.5]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${EPOCA.ventana}" stroke="rgba(255,255,255,.35)" stroke-width=".4"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="2" fill="${EPOCA.barra}"/><rect x="${x + 1.5}" y="${y + 3.6}" width="${w - 5}" height=".8" fill="#C9B8EA"/><rect x="${x + 1.5}" y="${y + 5.4}" width="${w - 7}" height=".8" fill="#C9B8EA" opacity=".7"/>`).join('') +
  `<path d="M3 18.2H27" stroke="${EPOCA.neon}" stroke-width=".7" opacity=".9"/><path d="M5 18.9H22" stroke="${EPOCA.neon2}" stroke-width=".5" opacity=".7"/>`;
const CAJA_SOFTWARE = `<defs><linearGradient id="ar-caja" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B2A86"/><stop offset="1" stop-color="#C2379A"/></linearGradient></defs>` +
  `<rect width="14" height="26" fill="url(#ar-caja)"/><circle cx="7" cy="15" r="4.6" fill="#D9DEE5"/><circle cx="7" cy="15" r="3.4" fill="#F2F4F7" opacity=".6"/><circle cx="7" cy="15" r="1" fill="#5B2A86"/>` +
  txt(1.6, 6, 'PRO', 4.4, '#FFFFFF') + mono(1.8, 9.6, '98', 3.2, EPOCA.neon2) + mono(1.6, 24, '4 CDs', 2.2, '#F4E9FF');
// 2015 · El genérico: la misma plantilla de siempre, con sus tres tarjetas azules
const SAAS = `<rect width="48" height="31" rx="2" fill="#1F2329"/><rect x="2" y="2" width="44" height="27" fill="#FFFFFF"/>` +
  `<rect x="4" y="4" width="3" height="3" rx=".8" fill="${EPOCA.azul}"/><rect x="8.2" y="4.8" width="9" height="1.4" rx=".7" fill="${EPOCA.azul}"/><rect x="36" y="4.4" width="8" height="2.4" rx="1.2" fill="${EPOCA.azul}"/>` +
  `<rect x="10" y="10" width="28" height="2.2" rx="1" fill="#1C2733"/><rect x="13" y="13.6" width="22" height="1.3" rx=".6" fill="#8B94A0"/>` +
  [5, 18, 31].map((x) => `<rect x="${x}" y="18" width="12" height="9" rx="1.2" fill="#FFFFFF" stroke="${EPOCA.gris}" stroke-width=".5"/><rect x="${x + 1.4}" y="19.4" width="3" height="3" rx=".7" fill="${EPOCA.celeste}"/>` +
    `<rect x="${x + 2.2}" y="20.2" width="1.4" height="1.4" fill="${EPOCA.azul}"/><rect x="${x + 1.4}" y="23.6" width="8" height="1" fill="#1C2733"/><rect x="${x + 1.4}" y="25.2" width="6" height=".7" fill="#8B94A0"/>`).join('');
// Hoy · BiPlot HQ: la misma línea, con alguien a cargo de cada tramo (las diez fases, como en el sitio)
const FASES = [[5, 83.3], [15, 71.7], [25, 76.7], [35, 61.7], [45, 66.7], [55, 51.7], [65, 56.7], [75, 41.7], [85, 46.7], [95, 31.7]];
const TABLERO = (() => {
  const a = 212, h = 84, x = (p) => r1(8 + p * (a - 16) / 100), y = (p) => r1(22 + (p - 11.7) * 0.62);
  const lin = [[0, 86.7], ...FASES, [100, 11.7]].map(([px, py]) => [x(px), y(py)]), pts = lin.map((q) => q.join(',')).join(' ');
  return `<rect width="${a}" height="${h}" rx="3" fill="${AZUL}"/><rect x="3" y="3" width="${a - 6}" height="${h - 6}" rx="2" fill="none" stroke="rgba(127,216,207,.3)" stroke-width=".8"/>` +
    mono(8, 13, 'LA MISMA LÍNEA · DIEZ FASES', 6.2, CIAN2, ' letter-spacing=".6"') + mono(a - 46, 13, 'BIPLOT HQ', 6.2, '#FFFFFF', ' letter-spacing=".6"') +
    `<polygon points="${pts} ${lin.at(-1)[0]},70 ${lin[0][0]},70" fill="${CIAN}" fill-opacity=".16"/><path d="M${lin[0][0]} 70H${lin.at(-1)[0]}" stroke="rgba(127,216,207,.35)" stroke-width=".8"/>` +
    `<polyline points="${pts}" fill="none" stroke="${CIAN}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` +
    FASES.map(([px, py], i) => `<circle cx="${x(px)}" cy="${y(py)}" r="3.4" fill="${CIAN}" stroke="#FFFFFF" stroke-width="1.2"/>` + mono(x(px) - 4.6, 79, 'E' + i, 5.4, '#F2F4F7')).join('') +
    `<circle cx="${x(100)}" cy="${y(11.7)}" r="3" fill="none" stroke="${CIAN2}" stroke-width="1.2"/>`;
})();

// La línea de tiempo del muro: fechas reales del historial de biplot.cl
const HITOS = [
  ['8 SEP', 'Nace biplot.cl', 'Seis décadas, la misma línea'],
  ['10 SEP', 'Fundos 360', 'el primer caso, en video'],
  ['15 SEP', 'Haru 360', 'llega al portafolio'],
  ['25 SEP', 'Abre BiPlot HQ', 'la oficina y su equipo'],
  ['25 SEP', 'Nu Home, Eleven y Rumbo', 'llegan a la oficina'],
  ['26 SEP', 'La calle', 'un local por proyecto'],
  ['28 SEP', 'La visita de Plotty', 'en video'],
  ['29 SEP', 'Una sala por empresa', 'cada una en su estilo']
];

// ───────── La línea del piso: la misma, contada con herramientas distintas ─────────
// Sus puntos (en baldosas): la entrada, las cuatro épocas, hoy, los cinco desarrollos y el final, junto al pedestal libre
const LINEA = {
  papel: [[18.6, 13.8], [16.1, 12.95], [15.4, 11.72], [12.6, 11.72]],
  terminal: [[12.6, 11.72], [9.8, 11.72]],
  enredo: [[9.8, 11.72], [7.0, 11.72]],
  generico: [[7.0, 11.72], [4.2, 11.72]],
  biplot: [[4.2, 11.72], [2.0, 11.05], [3.2, 7.47], [5.6, 6.47], [8.0, 5.77], [10.4, 5.47], [12.0, 5.66], [17.1, 5.66], [18.95, 6.5], [18.95, 9.2], [17.8, 9.2]]
};
const HITOS_PISO = [[15.4, 11.72, 'papel'], [12.6, 11.72, 'terminal'], [9.8, 11.72, 'enredo'], [7.0, 11.72, 'generico'], [4.2, 11.72, 'biplot'],
  [3.2, 7.47, 'biplot'], [5.6, 6.47, 'biplot'], [8.0, 5.77, 'biplot'], [10.4, 5.47, 'biplot'], [12.0, 5.66, 'biplot']];
const cien = (pts) => pts.map(([x, y]) => [r1(x * 100), r1(y * 100)]);
const recta = (pts) => cien(pts).map(([x, y], i) => (i ? 'L' : 'M') + x + ' ' + y).join('');
// A lápiz: un trazo que tiembla un poco, como hecho a mano
function aMano(pts) {
  const p = cien(pts); let d = `M${p[0][0]} ${p[0][1]}`, n = 0;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1], [x1, y1] = p[i], largo = Math.hypot(x1 - x0, y1 - y0), pasos = Math.max(1, Math.round(largo / 55));
    const nx = -(y1 - y0) / largo, ny = (x1 - x0) / largo;
    for (let j = 1; j <= pasos; j++) {
      const t = j / pasos, tm = (j - 0.5) / pasos, a = (n++ % 2 ? 1 : -1) * 4.5;
      d += `Q${r1(x0 + (x1 - x0) * tm + nx * a)} ${r1(y0 + (y1 - y0) * tm + ny * a)} ${r1(x0 + (x1 - x0) * t)} ${r1(y0 + (y1 - y0) * t)}`;
    }
  }
  return d;
}
const TRAZO = {
  papel: (pts) => `<path d="${recta(pts)}" fill="none" stroke="${EPOCA.papel}" stroke-opacity=".92" stroke-width="20" stroke-linejoin="round"/>` +
    `<path d="${aMano(pts)}" fill="none" stroke="${EPOCA.lapiz}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  terminal: (pts) => `<path d="${recta(pts)}" fill="none" stroke="${EPOCA.fosforo}" stroke-opacity=".16" stroke-width="18"/>` +
    `<path d="${recta(pts)}" fill="none" stroke="${EPOCA.fosforo2}" stroke-width="7" stroke-dasharray="12 7"/>`,
  enredo: (pts) => `<path d="${recta(pts)}" fill="none" stroke="${EPOCA.neon}" stroke-opacity=".22" stroke-width="20" stroke-linecap="round"/>` +
    `<path d="${recta(pts)}" fill="none" stroke="${EPOCA.neon2}" stroke-opacity=".75" stroke-width="2" transform="translate(4 -4)"/>` +
    `<path d="${recta(pts)}" fill="none" stroke="#FFB8EE" stroke-width="4.6" stroke-linecap="round"/>`,
  generico: (pts) => `<path d="${recta(pts)}" fill="none" stroke="#FFFFFF" stroke-opacity=".85" stroke-width="15" stroke-linecap="round"/>` +
    `<path d="${recta(pts)}" fill="none" stroke="${EPOCA.azul}" stroke-width="6.5" stroke-linecap="round"/>`,
  biplot: (pts) => `<path d="${recta(pts)}" fill="none" stroke="${CIAN}" stroke-opacity=".78" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`
};
const PUNTO = { papel: [EPOCA.hoja, EPOCA.lapiz], terminal: [EPOCA.pantalla, EPOCA.fosforo2], enredo: [EPOCA.morado, EPOCA.neon], generico: ['#FFFFFF', EPOCA.azul], biplot: [CIAN, CIAN] };

export function salaArchivo(o = {}) {
  return montar(({ E, L, pj, camina, lugar, zona }) => {
    // Piso de concreto pulido, azul pizarra, en paños grandes; muros de galería con el zócalo azul y el filete cian
    let panos = '';
    for (let i = 1; i < 10; i++) panos += `<path d="M${i * 200} 0V1400" stroke="#2C3F55" stroke-width="3"/>`;
    for (let j = 1; j < 7; j++) panos += `<path d="M0 ${j * 200}H2000" stroke="#2C3F55" stroke-width="3"/>`;
    base(E, L, { W, D, HM, piso: '#233447', dibujo: LUZ + panos, muroY: MURO, muroX: MURO2, zocalo: AZUL, tope: '#D5D0C6', canto: '#C9C3B8', filete: CIAN });

    // La línea del piso, de la entrada al pedestal libre, con la herramienta de cada época y un punto en cada pieza
    const fin = LINEA.biplot.at(-1);
    L.piso(0, 0, Object.entries(LINEA).map(([e, pts]) => TRAZO[e](pts)).join('') +
      HITOS_PISO.map(([x, y, e]) => `<circle cx="${x * 100}" cy="${y * 100}" r="12" fill="${PUNTO[e][0]}" stroke="${PUNTO[e][1]}" stroke-width="5"/>`).join('') +
      `<circle cx="${fin[0] * 100}" cy="${fin[1] * 100}" r="30" fill="${CORAL}" opacity=".22"/><circle cx="${fin[0] * 100}" cy="${fin[1] * 100}" r="17" fill="${CORAL}" stroke="${AZUL}" stroke-width="5"/>` +
      // Los años, en el piso, junto a cada época
      [[15.4, '1985', EPOCA.papel], [12.6, '1990', EPOCA.fosforo], [9.8, '1998', EPOCA.neon], [7.0, '2015', '#8FB0FF'], [4.2, 'HOY', CIAN2]]
        .map(([x, t, c]) => mono(r1(x * 100 - (t === '1985' ? 60 : 30)), 1262, t, 24, c, ' letter-spacing="2"')).join('') +
      mono(1725, 985, 'TU TURNO', 22, CORAL, ' letter-spacing="2"') + mono(150, 860, '2026', 24, CIAN2, ' letter-spacing="2"'), -29.5, 0.01);
    // Al entrar: el nombre de la línea, en el piso
    L.piso(12.95, 12.95, `<rect width="232" height="44" rx="6" fill="${AZUL}" opacity=".9"/>` + mono(14, 28, 'SEIS DÉCADAS, LA MISMA LÍNEA', 13, EPOCA.papel, ' letter-spacing="1.4"'), -29, 0.012);

    // ── El muro de atrás: el primer plano de BiPlot HQ, la línea de tiempo y el nombre del museo ──
    L.planoY(0.7, 0.02, 2.3, 300, 160, `<rect width="300" height="160" fill="#F8F6F1"/><rect x="10" y="10" width="280" height="140" fill="${AZUL2}"/>` +
      Array.from({ length: 13 }, (_, i) => `<path d="M${10 + i * 22} 10V150" stroke="#2B5580" stroke-width=".8"/>`).join('') + Array.from({ length: 7 }, (_, i) => `<path d="M10 ${10 + i * 22}H290" stroke="#2B5580" stroke-width=".8"/>`).join('') +
      `<path d="M150 42L230 82L150 122L70 82Z" fill="none" stroke="#FFFFFF" stroke-width="2.4"/><path d="M150 42V62M230 82V96M70 82V96M150 122V136M70 96L150 136L230 96" fill="none" stroke="#FFFFFF" stroke-width="1.6"/>` +
      `<path d="M110 62L150 82L190 62M150 82V122" stroke="#7FD8CF" stroke-width="1.4" fill="none" stroke-dasharray="4 3"/>` +
      mono(18, 30, 'BIPLOT HQ · PLANO', 11, '#FFFFFF', ' letter-spacing="1.5"') + mono(208, 142, '25·09·2026', 9, CIAN2), -39);
    L.planoY(0.7, 0.021, 0.62, 300, 20, mono(0, 14, 'EL PRIMER PLANO DE LA OFICINA', 11, GRIS, ' letter-spacing="1.2"'), -38.5);
    zona('plano', { formas: [{ plano: [[0.7, 0.03, 0.7], [3.7, 0.03, 0.7], [3.7, 0.03, 2.3], [0.7, 0.03, 2.3]] }], lugar: [2.2, 0.05, 2.5], guia: [2.6, 1.8] });

    const LT = 1150;
    L.planoY(4.4, 0.02, 2.35, LT, 170, `<rect width="${LT}" height="170" fill="${MURO}"/>` + txt(0, 26, 'ASÍ CRECIÓ BIPLOT', 24, AZUL, ' letter-spacing="2"') + mono(292, 26, '2026', 16, CIAN, ' letter-spacing="2"') +
      `<path d="M10 96H${LT - 10}" stroke="${AZUL}" stroke-width="4" stroke-linecap="round"/>` +
      HITOS.map(([f, t, s], i) => {
        const x = 40 + i * ((LT - 80) / (HITOS.length - 1)), arriba = i % 2 === 0, yT = arriba ? 58 : 128;
        return `<path d="M${x} ${arriba ? 70 : 104}V${arriba ? 88 : 122}" stroke="${AZUL}" stroke-width="1.6"/><circle cx="${x}" cy="96" r="9" fill="${i === 1 || i === 2 || i === 4 ? CIAN : AZUL}" stroke="#FFFFFF" stroke-width="3"/>` +
          mono(x - 60, yT - 14, f, 10, GRIS, ' letter-spacing=".8"') + txt(x - 60, yT, t, 12.5, AZUL) + txt(x - 60, yT + 14, s, 10, GRIS, ' font-weight="500"');
      }).join(''), -39);
    zona('linea', { formas: [{ plano: [[4.4, 0.03, 0.65], [15.9, 0.03, 0.65], [15.9, 0.03, 2.35], [4.4, 0.03, 2.35]] }], lugar: [10.3, 0.05, 2.62], guia: [10.4, 2.0] });

    L.planoY(16.7, 0.02, 2.4, 310, 175, `<rect width="310" height="175" fill="${MURO}"/>` + txt(0, 52, 'EL ARCHIVO', 44, AZUL, ' letter-spacing="3"') +
      mono(2, 78, 'MUSEO DE BIPLOT', 15, CIAN, ' letter-spacing="3"') + `<rect x="2" y="94" width="64" height="4" fill="${CIAN}"/>` +
      txt(2, 128, '«Lo que sirve dos veces', 15, TINTA, ' font-weight="500"') + txt(2, 148, 'se guarda.»', 15, TINTA, ' font-weight="500"') + mono(2, 168, 'PEPA · COSECHA', 10, GRIS, ' letter-spacing="1"'), -39);

    // ── El muro de la izquierda: el fichero con todos los casos por rubro y una carpeta por caso ──
    L.caja(0.06, 1.1, 0, 0.64, 2.8, 1.18, ROBLE, 1.2);
    L.caja(0.04, 1.08, 1.18, 0.68, 2.84, 0.05, NOGAL, 1.25);
    planoXen(L, 0.701, 3.9, 1.12, 280, 108, `<rect width="280" height="108" fill="#B99A70"/>` +
      Array.from({ length: 28 }, (_, i) => { const c = i % 7, f = Math.floor(i / 7), x = 6 + c * 39, y = 6 + f * 25.5; return `<rect x="${x}" y="${y}" width="35" height="22" rx="2" fill="#C9AE86" stroke="#8C6A4A" stroke-width="1"/>` +
        `<rect x="${x + 7}" y="${y + 4}" width="21" height="6" rx="1" fill="#F4ECD8"/><circle cx="${x + 17.5}" cy="${y + 15.5}" r="2.6" fill="#C9A227" stroke="#8C6A1F" stroke-width=".8"/>`; }).join(''), 2.8);
    L.planoX(3.95, 2.02, 290, 44, txt(0, 18, 'EL FICHERO', 18, AZUL, ' letter-spacing="2"') + mono(0, 36, 'TODOS LOS CASOS, POR RUBRO', 10, GRIS, ' letter-spacing="1"'), -38);
    // Una ficha afuera, sobre el fichero
    L.caja(0.25, 2.3, 1.23, 0.3, 0.42, 0.012, { t: '#FBF6E9', l: '#E8DFC8', r: '#D8CDB2' }, 1.9);
    zona('fichero', { formas: [{ piso: [[0.06, 1.1], [0.72, 1.1], [0.72, 3.9], [0.06, 3.9]], alto: 1.25 }, { plano: [[0.03, 3.95, 1.55], [0.03, 1.05, 1.55], [0.03, 1.05, 2.05], [0.03, 3.95, 2.05]] }], lugar: [0.4, 2.5, 1.7], guia: [1.7, 3.2] });

    L.caja(0.06, 4.9, 0, 0.52, 5.4, 2.2, NOGAL, 3.2);
    const COLS = ['#17C3B2', '#E0B341', '#C8474A', '#35679A', '#8E6BB8', '#3E9C95', '#F2F4F7', '#E8563A', '#6B7A8C'];
    planoXen(L, 0.581, 10.3, 2.15, 540, 210, `<rect width="540" height="210" fill="#735538"/>` + [0, 1, 2, 3].map((f) => `<rect x="0" y="${f * 52 + 48}" width="540" height="5" fill="#5E452D"/>` +
      Array.from({ length: 36 }, (_, i) => { const h = 40 - (i * 7 + f * 3) % 9, w = 11 + (i + f) % 3; return `<rect x="${6 + i * 14.8}" y="${f * 52 + 48 - h}" width="${w}" height="${h}" rx="1.2" fill="${COLS[(i * 5 + f * 2) % 9]}"/>`; }).join('')).join(''), 7.8);
    L.planoX(10.35, 2.52, 300, 26, mono(0, 16, 'UNA CARPETA POR CASO', 13, GRIS, ' letter-spacing="1.5"'), -38);
    zona('carpetas', { formas: [{ piso: [[0.06, 4.9], [0.6, 4.9], [0.6, 10.3], [0.06, 10.3]], alto: 2.2 }], lugar: [0.3, 7.6, 2.5], guia: [1.9, 8.2] });

    // ── Seis décadas, la misma línea: una pieza por época ──
    // 1985 · El papel: la libreta abierta sobre su atril, con el lápiz al lado
    vitrina(L, 15.4, 10.8, ['1985 · EL PAPEL', 'La libreta'], (h) => {
      const x = 15.4, y = 10.8;
      L.caja(x - 0.3, y - 0.14, h, 0.6, 0.34, 0.05, ROBLE, x + y);
      plano(L, [x - 0.28, y - 0.12, h + 0.38], [0.56, 0, 0], [0, 0.24, -0.3], 56, 37, LIBRETA, x + y + 0.05);
      L.linea([[x - 0.22, y + 0.2, h + 0.06], [x + 0.14, y + 0.15, h + 0.06]], '#E0B341', 2.4, x + y + 0.1);
      L.linea([[x + 0.14, y + 0.15, h + 0.06], [x + 0.19, y + 0.14, h + 0.06]], EPOCA.lapiz, 1.6, x + y + 0.11);
    });
    zona('papel', { formas: [{ piso: [[14.9, 10.3], [15.9, 10.3], [15.9, 11.3], [14.9, 11.3]], alto: 1.75 }], lugar: [15.4, 10.8, 2.0], guia: [14.45, 11.15] });

    // 1990 · El diagnóstico: la terminal, leyendo el proceso paso a paso
    vitrina(L, 12.6, 10.8, ['1990 · EL DIAGNÓSTICO', 'La terminal'], (h) => {
      const x = 12.6, y = 10.75;
      L.caja(x - 0.2, y - 0.2, h, 0.4, 0.34, 0.3, BEIGE, x + y + 0.1);
      L.planoY(x - 0.16, y + 0.141, h + 0.27, 32, 22, TERMINAL, x + y + 0.12);
      L.caja(x - 0.18, y + 0.2, h, 0.36, 0.13, 0.03, BEIGE, x + y + 0.2);
    });
    zona('terminal', { formas: [{ piso: [[12.1, 10.3], [13.1, 10.3], [13.1, 11.3], [12.1, 11.3]], alto: 1.75 }], lugar: [12.6, 10.8, 2.0], guia: [11.65, 11.15] });
    pj('abuelo', 13.65, 10.45, 0, 'i');

    // 1998 · El enredo: el monitor con ventanas encima de ventanas y la caja del software, con sus cuatro CD
    vitrina(L, 9.8, 10.8, ['1998 · EL ENREDO', 'El software'], (h) => {
      const x = 9.8, y = 10.8;
      L.caja(x - 0.3, y - 0.2, h, 0.36, 0.36, 0.33, BEIGE, x + y);
      L.planoY(x - 0.27, y + 0.161, h + 0.3, 30, 24, ENREDO, x + y + 0.05);
      L.caja(x - 0.2, y - 0.06, h - 0.001, 0.16, 0.2, 0.005, { t: '#C8BEA4', l: '#B7AC90', r: '#A69B80' }, x + y - 0.05);
      L.caja(x + 0.12, y - 0.02, h, 0.15, 0.06, 0.27, { t: '#7A3A9E', l: '#5B2A86', r: '#4A2170' }, x + y + 0.12);
      L.planoY(x + 0.12, y + 0.041, h + 0.27, 15, 27, CAJA_SOFTWARE, x + y + 0.13);
    });
    zona('software', { formas: [{ piso: [[9.3, 10.3], [10.3, 10.3], [10.3, 11.3], [9.3, 11.3]], alto: 1.75 }], lugar: [9.8, 10.8, 2.0], guia: [8.85, 11.15] });

    // 2015 · El genérico: un portátil con la misma plantilla de siempre
    vitrina(L, 7.0, 10.8, ['2015 · EL GENÉRICO', 'Tres palabras'], (h) => {
      const x = 7.0, y = 10.8;
      L.caja(x - 0.25, y - 0.08, h, 0.5, 0.32, 0.018, { t: '#D9DEE5', l: '#BFC6CF', r: '#A9B1BB' }, x + y + 0.02);
      L.planoY(x - 0.2, y + 0.241, h + 0.018, 40, 1, `<rect width="40" height="1" fill="#8F97A1"/>`, x + y + 0.03);
      plano(L, [x - 0.25, y - 0.12, h + 0.33], [0.5, 0, 0], [0, 0.05, -0.315], 48, 31, SAAS, x + y + 0.04);
    });
    zona('generico', { formas: [{ piso: [[6.5, 10.3], [7.5, 10.3], [7.5, 11.3], [6.5, 11.3]], alto: 1.75 }], lugar: [7.0, 10.8, 2.0], guia: [6.05, 11.15] });
    pj('arJoven', 8.05, 10.45, 0, 'i');

    // Hoy · BiPlot HQ: la misma línea, ahora con alguien a cargo de cada tramo
    L.caja(3.0, 10.3, 0, 2.4, 0.7, 0.32, BLANCO, 14.7);
    L.caja(2.98, 10.28, 0, 2.44, 0.74, 0.06, ZOCALO, 14.69);
    luz(L, 3.8, 10.65, 1.2); luz(L, 4.8, 10.65, 1.1);
    L.caja(3.1, 10.46, 0.32, 2.2, 0.07, 0.9, { t: '#1B3A5C', l: AZUL, r: '#081A2D' }, 14.72);
    L.planoY(3.12, 10.531, 1.2, 212, 84, TABLERO, 14.74);
    L.planoY(3.6, 11.001, 0.27, 120, 20, `<rect width="120" height="20" rx="2" fill="${AZUL}"/>` + mono(5, 8.5, 'HOY · BIPLOT HQ', 5.6, CIAN2, ' letter-spacing=".3"') + txt(5, 17, 'Diez fases, un solo motor', 7, '#FFFFFF'), 14.76);
    zona('hoy', { formas: [{ piso: [[3.0, 10.3], [5.4, 10.3], [5.4, 11.0], [3.0, 11.0]], alto: 1.25 }], lugar: [4.2, 10.5, 1.6], guia: [2.25, 11.45] });

    // ── Lo que construimos: una pieza de cada desarrollo, en el orden en que llegaron ──
    // Fundos 360: la escritura inscrita a nombre del comprador y la banderita del lote 25
    vitrina(L, 3.2, 6.6, ['FUNDOS 360 · 10 SEP', 'La escritura'], (h) => {
      const x = 3.2, y = 6.6;
      L.caja(x - 0.26, y - 0.06, h, 0.36, 0.1, 0.03, ROBLE, x + y);
      L.planoY(x - 0.24, y + 0.041, h + 0.46, 32, 43, `<rect width="32" height="43" fill="#FBF6E9" stroke="#D8CDB2" stroke-width=".8"/>` + mono(4, 7, 'ESCRITURA', 4.2, '#0F1F16') +
        [11, 14, 17, 20, 23, 26].map((yy) => `<rect x="4" y="${yy}" width="${yy === 26 ? 14 : 24}" height="1.1" fill="#B9AE98"/>`).join('') +
        `<circle cx="23" cy="35" r="6" fill="none" stroke="#9E2B25" stroke-width="1.3"/><circle cx="23" cy="35" r="4.3" fill="none" stroke="#9E2B25" stroke-width=".6"/>` + mono(19, 36.2, 'INSCRITA', 1.9, '#9E2B25'), x + y + 0.05);
      L.caja(x + 0.08, y - 0.02, h, 0.26, 0.24, 0.06, { t: '#5E8A4E', l: '#4E7440', r: '#3F6034' }, x + y + 0.1);
      L.linea([[x + 0.2, y + 0.1, h + 0.06], [x + 0.2, y + 0.1, h + 0.5]], '#3A2E22', 1.4, x + y + 0.15);
      L.planoY(x + 0.2, y + 0.101, h + 0.5, 20, 13, `<path d="M0 0H20L15 6.5L20 13H0Z" fill="#D8B982" stroke="#0F1F16" stroke-width="1"/>` + txt(3, 9.5, '25', 7.5, '#0F1F16'), x + y + 0.16);
    });
    zona('fundos', { formas: [{ piso: [[2.7, 6.1], [3.7, 6.1], [3.7, 7.1], [2.7, 7.1]], alto: 1.75 }], lugar: [3.2, 6.6, 2.0], guia: [2.25, 7.3] });
    pj('arMira', 4.6, 6.35, 0, 'i');

    // Haru 360: el QR de la mesa (se pide desde la mesa y la comanda llega a la cocina sin papel)
    vitrina(L, 5.6, 5.6, ['HARU 360 · 15 SEP', 'El QR de la mesa'], (h) => {
      const x = 5.6, y = 5.6;
      L.caja(x - 0.3, y - 0.22, h, 0.6, 0.44, 0.05, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' }, x + y);
      L.caja(x - 0.13, y - 0.04, h + 0.05, 0.22, 0.05, 0.02, { t: '#E6ECEF', l: '#C9D3D8', r: '#B3BFC6' }, x + y + 0.05);
      const qr = Array.from({ length: 36 }, (_, i) => ((i * 7 + (i >> 2)) % 3 === 0 ? `<rect x="${4 + (i % 6) * 2.4}" y="${7 + Math.floor(i / 6) * 2.4}" width="2.2" height="2.2" fill="#15120F"/>` : '')).join('');
      L.planoY(x - 0.12, y - 0.005, h + 0.33, 20, 26, `<rect width="20" height="26" rx="1.5" fill="#FFFFFF" stroke="#C9D3D8" stroke-width=".8"/>` + mono(3, 5, 'CARTA', 3.4, '#E0482F') + qr +
        `<rect x="4" y="7" width="5" height="5" fill="none" stroke="#15120F" stroke-width="1.1"/><rect x="11.4" y="7" width="5" height="5" fill="none" stroke="#15120F" stroke-width="1.1"/><rect x="4" y="14.4" width="5" height="5" fill="none" stroke="#15120F" stroke-width="1.1"/>`, x + y + 0.06);
      L.cil(x + 0.17, y + 0.08, h + 0.05, 0.11, 0.015, '#FFFFFF', '#E6E1D8', x + y + 0.12);
      for (const [dx, dy] of [[0.13, 0.05], [0.2, 0.1]]) { L.cil(x + dx, y + dy, h + 0.065, 0.035, 0.035, '#F3EDE1', '#1F3A28', x + y + 0.13 + dx * 0.01); }
    });
    zona('haru', { formas: [{ piso: [[5.1, 5.1], [6.1, 5.1], [6.1, 6.1], [5.1, 6.1]], alto: 1.75 }], lugar: [5.6, 5.6, 2.0], guia: [4.65, 6.25] });

    // Nu Home 360: el módulo de 6 m, a escala, sobre su terreno (así se diseña la casa en su diseñador)
    vitrina(L, 8.0, 4.9, ['NU HOME 360 · 25 SEP', 'El módulo'], (h) => {
      const x = 8.0, y = 4.9;
      L.caja(x - 0.34, y - 0.28, h, 0.68, 0.56, 0.05, { t: '#8FAE78', l: '#789A62', r: '#658653' }, x + y);
      L.caja(x - 0.26, y - 0.1, h + 0.05, 0.36, 0.16, 0.15, { t: '#2B2724', l: '#1C1917', r: '#141110' }, x + y + 0.08);
      L.planoY(x - 0.24, y + 0.061, h + 0.17, 32, 10, `<rect x="2" y="2" width="9" height="6" fill="#CFE3EE"/><rect x="14" y="2" width="15" height="6" fill="#CFE3EE"/>`, x + y + 0.09);
      L.caja(x + 0.1, y - 0.1, h + 0.05, 0.14, 0.16, 0.015, { t: '#D6B68C', l: '#BD9A6C', r: '#A27F55' }, x + y + 0.1);
      for (const [dx, dy] of [[0.1, -0.1], [0.24, -0.1], [0.1, 0.06], [0.24, 0.06]]) L.linea([[x + dx, y + dy, h + 0.05], [x + dx, y + dy, h + 0.2]], '#3A3530', 0.9, x + y + 0.11 + dx * 0.01);
      L.caja(x + 0.09, y - 0.11, h + 0.2, 0.16, 0.18, 0.01, { t: '#A27F55', l: '#8C6A4A', r: '#735538' }, x + y + 0.13);
      L.cil(x - 0.22, y + 0.18, h + 0.05, 0.05, 0.1, '#3E7A4E', '#2F6440', x + y + 0.14);
    });
    zona('nuhome', { formas: [{ piso: [[7.5, 4.4], [8.5, 4.4], [8.5, 5.4], [7.5, 5.4]], alto: 1.75 }], lugar: [8.0, 4.9, 2.0], guia: [7.05, 5.55] });
    pj('arLentes', 9.0, 4.65, 0, 'i');

    // Eleven 360: la huella (la propuesta no la reemplaza: trabaja antes y después de ella)
    vitrina(L, 10.4, 4.6, ['ELEVEN 360 · 25 SEP', 'La huella'], (h) => {
      const x = 10.4, y = 4.6;
      L.caja(x - 0.2, y - 0.14, h, 0.4, 0.28, 0.04, { t: '#1A1A1A', l: '#111111', r: '#0B0B0B' }, x + y);
      L.caja(x - 0.11, y - 0.05, h + 0.04, 0.22, 0.1, 0.36, { t: '#2A2A2A', l: '#1A1A1A', r: '#101010' }, x + y + 0.05);
      L.planoY(x - 0.09, y + 0.051, h + 0.37, 18, 26, `<rect width="18" height="26" rx="2" fill="#0B0B0B"/>` +
        [3.2, 5, 6.8, 8.6].map((r) => `<path d="M${9 - r} 13A${r} ${r * 1.15} 0 0 1 ${9 + r} 13" fill="none" stroke="#FF6600" stroke-width=".9"/>`).join('') +
        [3.2, 5, 6.8].map((r) => `<path d="M${9 - r} 13.5Q${9 - r} ${13.5 + r} 9 ${14 + r}" fill="none" stroke="#FF8A1F" stroke-width=".8"/>`).join('') +
        `<circle cx="9" cy="23" r="1.3" fill="#37D67A"/>`, x + y + 0.06);
      L.caja(x - 0.2, y + 0.08, h + 0.04, 0.4, 0.06, 0.012, { t: '#FF6600', l: '#CC5200', r: '#A84300' }, x + y + 0.07);
    });
    zona('eleven', { formas: [{ piso: [[9.9, 4.1], [10.9, 4.1], [10.9, 5.1], [9.9, 5.1]], alto: 1.75 }], lugar: [10.4, 4.6, 2.0], guia: [9.45, 5.25] });

    // Rumbo: el elefante en sus cuatro etapas, como en un museo de historia natural, con su cordón al frente
    L.caja(12.2, 3.6, 0, 4.6, 1.1, 0.32, BLANCO, 12.3);
    L.caja(12.18, 3.58, 0, 4.64, 1.14, 0.06, ZOCALO, 12.29);
    luz(L, 13.3, 4.2, 1.1); luz(L, 15.6, 4.2, 1.2);
    [['Cría', 12.85, 0.5], ['Joven', 13.85, 0.72], ['Adulto', 15.0, 0.98], ['Sabio', 16.25, 1.22]].forEach(([n, x, h], i) => {
      elefante(L, ETAPAS[i], x, 4.15, 0.32, h, 16.6 + i * 0.3);
      L.planoY(x - 0.28, 4.701, 0.26, 56, 16, `<rect width="56" height="16" rx="2" fill="${AZUL}"/>` + txt(28, 11.5, n, 9, '#FFFFFF', ' text-anchor="middle"'), 17.9 + i * 0.01);
    });
    for (const x of [12.3, 14.5, 16.7]) { L.cil(x, 5.25, 0, 0.06, 0.02, '#C9A227', '#A8861F', x + 5.25); L.cil(x, 5.25, 0.02, 0.022, 0.62, '#C9A227', '#A8861F', x + 5.26); L.cil(x, 5.25, 0.64, 0.045, 0.04, '#E0B341', '#C9A227', x + 5.27); }
    for (const [a, b] of [[12.3, 14.5], [14.5, 16.7]]) {
      const p1 = L.P(a, 5.25, 0.6), p2 = L.P(b, 5.25, 0.6), m = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 9];
      L.E.marca(a, 5.25, 0.6); L.E.marca(b, 5.25, 0.6);
      L.add((a + b) / 2 + 5.3, `<path d="M${r1(p1[0])} ${r1(p1[1])}Q${r1(m[0])} ${r1(m[1])} ${r1(p2[0])} ${r1(p2[1])}" fill="none" stroke="${AZUL}" stroke-width="2.4" stroke-linecap="round"/>`);
    }
    zona('rumbo', { formas: [{ piso: [[12.2, 3.6], [16.8, 3.6], [16.8, 4.7], [12.2, 4.7]], alto: 1.7 }], lugar: [14.5, 4.15, 1.9], guia: [11.65, 4.5] });
    pj('nino', 13.25, 5.85, 0, 'd', EA * 0.72);
    pj('arFoto', 17.55, 4.05, 0, 'i');

    // Tu turno: el pedestal libre, junto al punto coral donde termina la línea
    vitrina(L, 17.8, 8.3, ['TU TURNO', 'Tu proyecto'], null);
    { const [cx, cy] = L.P(17.8, 8.3, 0.98); L.add(26.1, `<defs><radialGradient id="ar-espera"><stop offset="0" stop-color="#7FD8CF" stop-opacity=".55"/><stop offset="1" stop-color="#7FD8CF" stop-opacity="0"/></radialGradient></defs><ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="24" ry="12" fill="url(#ar-espera)"/>`); }
    zona('tuproyecto', { formas: [{ piso: [[17.3, 7.8], [18.3, 7.8], [18.3, 8.8], [17.3, 8.8]], alto: 1.75 }, { piso: [[17.45, 8.95], [18.15, 8.95], [18.15, 9.45], [17.45, 9.45]], alto: 0.05 }], lugar: [17.8, 8.3, 2.0], guia: [16.5, 9.55] });

    // ── Para descansar: una banca en el medio, mirando las piezas ──
    L.caja(9.3, 7.4, 0, 2.0, 0.55, 0.38, NEGRO, 9.3 + 7.4 + 0.9);
    L.caja(9.25, 7.35, 0.38, 2.1, 0.65, 0.06, { t: '#3A2E22', l: '#2B221A', r: '#221A14' }, 9.3 + 7.4 + 1.0);
    pj('arBanco', 10.6, 7.65, 0.44, 'i', EA, 19.0);

    // ── La entrada: el mesón con la guía del museo y la puerta ──
    L.caja(16.4, 11.9, 0, 1.3, 0.55, 0.95, BLANCO, 16.4 + 11.9 + 0.9);
    L.caja(16.38, 11.88, 0.95, 1.34, 0.59, 0.04, { t: AZUL, l: '#0B2239', r: '#081A2D' }, 16.4 + 11.9 + 0.95);
    L.planoY(16.5, 12.451, 0.82, 110, 30, `<rect width="110" height="30" rx="2" fill="${AZUL}"/>` + mono(8, 13, 'EL ARCHIVO', 8, CIAN2, ' letter-spacing="1.2"') + txt(8, 25, 'Entrada libre', 9.5, '#FFFFFF'), 16.4 + 11.9 + 0.97);
    for (const [dx, c] of [[0.2, CIAN], [0.45, '#F2F4F7'], [0.7, '#E0B341']]) L.caja(16.4 + dx, 12.02, 0.99, 0.18, 0.26, 0.012, { t: c, l: c, r: c }, 16.4 + 11.9 + 1.0 + dx * 0.01);
    L.piso(17.8, 13.05, `<rect width="140" height="70" rx="8" fill="${AZUL}"/>` + mono(18, 44, 'EL ARCHIVO', 22, CIAN2, ' letter-spacing="2"'), -28, 0.01);
    plantaAlta(L, 19.5, 12.6, 1.0, ['#FFFFFF', '#DCDFD9']);
    plantaAlta(L, 0.95, 12.9, 1.05, ['#FFFFFF', '#DCDFD9']);
    zona('recepcion', { formas: [{ piso: [[16.4, 11.9], [17.7, 11.9], [17.7, 12.45], [16.4, 12.45]], alto: 1.0 }, { piso: [[17.8, 13.05], [19.2, 13.05], [19.2, 13.75], [17.8, 13.75]], alto: 0.05 }], lugar: [17.05, 12.2, 1.35], guia: [18.4, 12.3] });
    // (en celular se entra viendo de cerca este punto: la libreta, la terminal y el pedestal libre)
    lugar('entrada', 14.8, 11.2, 0.9);

    // Quienes caminan: Pepa, que cuida el museo y guía el recorrido, y una visita que va de una punta a la otra
    camina('pepa', o.pepa ? [[...o.pepa, 4], [1.9, 8.6, 2], [...o.pepa]] : [[1.9, 4.3, 4], [1.9, 8.6, 2], [6.8, 8.45, 3], [1.9, 8.6], [1.9, 4.3]], { vel: 0.45 });
    camina('estudiante', [[15.6, 9.3, 3], [12.2, 8.75, 2.5], [8.2, 8.7, 3], [12.2, 8.75], [15.6, 9.3]], { vel: 0.4 });
  });
}
export const archivo = () => salaArchivo();
