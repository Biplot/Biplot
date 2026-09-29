// Propuesta: El Archivo como el museo de BiPlot. Una pieza única de cada desarrollo, en vitrinas, unidas por una línea en
// el piso en el orden en que llegaron a biplot.cl («Seis décadas, la misma línea»): la terminal del primer día, la
// escritura inscrita de Fundos 360, el QR de la mesa de Haru 360, el módulo a escala de Nu Home 360, la huella de
// Eleven 360 y el elefante de Rumbo en sus cuatro etapas; al final, un pedestal libre para el próximo. En el muro, la
// línea de tiempo con las fechas reales del sitio y el primer plano de BiPlot HQ; a la izquierda, el fichero con todos
// los casos por rubro y una carpeta por caso. Lo cuida Pepa (Cosecha): «Lo que sirve dos veces se guarda».
import { montar, base, registrar, planoXen, plantaAlta, txt, mono, PELO, Z, PIEL, EA, r1 } from '../../dibujos/barrio/salas-propias/comun.mjs';
import { ETAPAS } from '../../dibujos/barrio/salas-propias/elefantes.mjs';
export { componer, P } from '../comun.mjs';

const AZUL = '#0E2A47', AZUL2 = '#12375E', CIAN = '#17C3B2', CIAN2 = '#7FD8CF', TINTA = '#13202E', GRIS = '#5B6776';
const MURO = '#F1EEE8', MURO2 = '#E4E0D8';
const BLANCO = { t: '#FFFFFF', l: '#ECE9E3', r: '#D9D5CD' };
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
  arBanco: { piel: PIEL.media, pelo: PELO.cafe, peinado: 'rizado', cuerpo: 'fino', arriba: 'poleron', arribaCol: ['#6E86B8', '#566E9E', '#566E9E'], abajo: 'pantalon', abajoCol: ['#2A3038', '#1F242B'], zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', objeto: 'libreta' }
});

// La luz de cada pieza, en el piso: una mancha tibia que se apaga hacia los bordes
const LUZ = `<defs><radialGradient id="ar-luz"><stop offset="0" stop-color="#FFF1CF" stop-opacity=".30"/><stop offset=".55" stop-color="#FFF1CF" stop-opacity=".12"/><stop offset="1" stop-color="#FFF1CF" stop-opacity="0"/></radialGradient></defs>`;
const luz = (L, x, y, r = 1.1) => L.piso(x - r, y - r, `<circle cx="${r * 100}" cy="${r * 100}" r="${r * 100}" fill="url(#ar-luz)"/>`, -30, 0.012);

// Una vitrina: pedestal blanco con su cédula al frente, la pieza adentro y el vidrio alrededor (la cara de atrás antes
// de la pieza y la de adelante después). pieza(z) dibuja lo que va adentro, parado sobre el pedestal (z = h).
function vitrina(L, x, y, cedula, pieza, o = {}) {
  const s = o.s || 0.86, h = o.h || 0.98, hv = o.hv || 0.7, x0 = x - s / 2, y0 = y - s / 2, x1 = x + s / 2, y1 = y + s / 2, k = x + y, zv = h + hv;
  luz(L, x, y, 1.15);
  L.caja(x0, y0, 0, s, s, h, BLANCO, k);
  L.caja(x0 - 0.02, y0 - 0.02, 0, s + 0.04, s + 0.04, 0.08, { t: '#D9D5CD', l: '#C9C4BA', r: '#B7B1A6' }, k - 0.01);
  // La cédula: una placa oscura al frente del pedestal
  const cw = r1((s - 0.1) * 100);
  L.planoY(x0 + 0.05, y1 + 0.004, h - 0.14, cw, 30, `<rect width="${cw}" height="30" rx="2" fill="${AZUL}"/>` +
    mono(5, 11.5, cedula[0], 5.6, CIAN2, ' letter-spacing=".3"') + txt(5, 24, cedula[1], 7.6, '#FFFFFF'), k + 0.02);
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

export function salaArchivo(o = {}) {
  return montar(({ E, L, pj, camina, lugar, zona }) => {
    // Piso de concreto pulido, azul pizarra, en paños grandes; muros de galería con el zócalo azul y el filete cian
    let panos = '';
    for (let i = 1; i < 10; i++) panos += `<path d="M${i * 200} 0V1400" stroke="#2C3F55" stroke-width="3"/>`;
    for (let j = 1; j < 7; j++) panos += `<path d="M0 ${j * 200}H2000" stroke="#2C3F55" stroke-width="3"/>`;
    base(E, L, { W, D, HM, piso: '#233447', dibujo: LUZ + panos, muroY: MURO, muroX: MURO2, zocalo: AZUL, tope: '#D5D0C6', canto: '#C9C3B8', filete: CIAN });

    // La línea del piso: une las piezas en el orden en que llegaron, de la entrada al pedestal libre
    const recorrido = [[18.6, 13.8], [13.4, 11.4], [9.2, 11.0], [5.8, 10.0], [5.0, 6.4], [8.4, 5.2], [11.6, 5.6], [16.3, 6.4], [17.6, 8.7]];
    const pz = (x, y) => [x * 100, y * 100];
    const d = recorrido.map(([x, y], i) => (i ? 'L' : 'M') + pz(x, y).join(' ')).join('');
    L.piso(0, 0, `<path d="${d}" fill="none" stroke="${CIAN}" stroke-opacity=".75" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>` +
      recorrido.slice(1).map(([x, y], i) => `<circle cx="${x * 100}" cy="${y * 100}" r="${i === recorrido.length - 2 ? 16 : 12}" fill="${i === recorrido.length - 2 ? AZUL : CIAN}" stroke="${CIAN}" stroke-width="5"/>`).join(''), -29.5, 0.01);

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
    const rubros = ['INMOBILIARIA', 'COMIDA', 'SERVICIOS', 'CONSTRUCCIÓN', 'COMERCIO', 'SALUD', 'APPS'];
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

    // ── Las piezas, en el orden en que llegaron ──
    // 1. La terminal: biplot.cl nació contando la automatización desde aquí («Seis décadas, la misma línea»)
    vitrina(L, 13.4, 10.6, ['BIPLOT · 8 SEP 2026', 'La terminal'], (h) => {
      const x = 13.4, y = 10.55;
      L.caja(x - 0.2, y - 0.2, h, 0.4, 0.34, 0.3, BEIGE, x + y + 0.1);
      L.planoY(x - 0.16, y + 0.141, h + 0.27, 32, 22, `<rect width="32" height="22" rx="3" fill="#0B1A12"/><rect x="2" y="2" width="28" height="18" rx="2" fill="#0F2A1C"/>` +
        mono(4, 9, '&gt; biplot', 5.5, '#4ADE80') + `<rect x="4" y="12" width="4" height="5" fill="#4ADE80"/>`, x + y + 0.12);
      L.caja(x - 0.18, y + 0.2, h, 0.36, 0.13, 0.03, BEIGE, x + y + 0.2);
    });
    zona('terminal', { formas: [{ piso: [[12.9, 10.1], [13.9, 10.1], [13.9, 11.1], [12.9, 11.1]], alto: 1.75 }], lugar: [13.4, 10.6, 2.0], guia: [12.95, 11.35] });
    pj('abuelo', 14.4, 10.3, 0, 'i');

    // 2. Fundos 360: la escritura inscrita a nombre del comprador y la banderita del lote 25
    vitrina(L, 9.2, 10.2, ['FUNDOS 360 · 10 SEP', 'La escritura'], (h) => {
      const x = 9.2, y = 10.2;
      L.caja(x - 0.26, y - 0.06, h, 0.36, 0.1, 0.03, ROBLE, x + y);
      L.planoY(x - 0.24, y + 0.041, h + 0.46, 32, 43, `<rect width="32" height="43" fill="#FBF6E9" stroke="#D8CDB2" stroke-width=".8"/>` + mono(4, 7, 'ESCRITURA', 4.2, '#0F1F16') +
        [11, 14, 17, 20, 23, 26].map((yy) => `<rect x="4" y="${yy}" width="${yy === 26 ? 14 : 24}" height="1.1" fill="#B9AE98"/>`).join('') +
        `<circle cx="23" cy="35" r="6" fill="none" stroke="#9E2B25" stroke-width="1.3"/><circle cx="23" cy="35" r="4.3" fill="none" stroke="#9E2B25" stroke-width=".6"/>` + mono(19, 36.2, 'INSCRITA', 1.9, '#9E2B25'), x + y + 0.05);
      L.caja(x + 0.08, y - 0.02, h, 0.26, 0.24, 0.06, { t: '#5E8A4E', l: '#4E7440', r: '#3F6034' }, x + y + 0.1);
      L.linea([[x + 0.2, y + 0.1, h + 0.06], [x + 0.2, y + 0.1, h + 0.5]], '#3A2E22', 1.4, x + y + 0.15);
      L.planoY(x + 0.2, y + 0.101, h + 0.5, 20, 13, `<path d="M0 0H20L15 6.5L20 13H0Z" fill="#D8B982" stroke="#0F1F16" stroke-width="1"/>` + txt(3, 9.5, '25', 7.5, '#0F1F16'), x + y + 0.16);
    });
    zona('fundos', { formas: [{ piso: [[8.7, 9.7], [9.7, 9.7], [9.7, 10.7], [8.7, 10.7]], alto: 1.75 }], lugar: [9.2, 10.2, 2.0], guia: [8.4, 10.9] });
    pj('arMira', 10.25, 9.75, 0, 'i');

    // 3. Haru 360: el QR de la mesa (se pide desde la mesa y la comanda llega a la cocina sin papel)
    vitrina(L, 5.8, 9.5, ['HARU 360 · 15 SEP', 'El QR de la mesa'], (h) => {
      const x = 5.8, y = 9.5;
      L.caja(x - 0.3, y - 0.22, h, 0.6, 0.44, 0.05, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' }, x + y);
      L.caja(x - 0.13, y - 0.04, h + 0.05, 0.22, 0.05, 0.02, { t: '#E6ECEF', l: '#C9D3D8', r: '#B3BFC6' }, x + y + 0.05);
      const qr = Array.from({ length: 36 }, (_, i) => ((i * 7 + (i >> 2)) % 3 === 0 ? `<rect x="${4 + (i % 6) * 2.4}" y="${7 + Math.floor(i / 6) * 2.4}" width="2.2" height="2.2" fill="#15120F"/>` : '')).join('');
      L.planoY(x - 0.12, y - 0.005, h + 0.33, 20, 26, `<rect width="20" height="26" rx="1.5" fill="#FFFFFF" stroke="#C9D3D8" stroke-width=".8"/>` + mono(3, 5, 'CARTA', 3.4, '#E0482F') + qr +
        `<rect x="4" y="7" width="5" height="5" fill="none" stroke="#15120F" stroke-width="1.1"/><rect x="11.4" y="7" width="5" height="5" fill="none" stroke="#15120F" stroke-width="1.1"/><rect x="4" y="14.4" width="5" height="5" fill="none" stroke="#15120F" stroke-width="1.1"/>`, x + y + 0.06);
      L.cil(x + 0.17, y + 0.08, h + 0.05, 0.11, 0.015, '#FFFFFF', '#E6E1D8', x + y + 0.12);
      for (const [dx, dy] of [[0.13, 0.05], [0.2, 0.1]]) { L.cil(x + dx, y + dy, h + 0.065, 0.035, 0.035, '#F3EDE1', '#1F3A28', x + y + 0.13 + dx * 0.01); }
    });
    zona('haru', { formas: [{ piso: [[5.3, 9.0], [6.3, 9.0], [6.3, 10.0], [5.3, 10.0]], alto: 1.75 }], lugar: [5.8, 9.5, 2.0], guia: [4.9, 10.3] });

    // 4. Nu Home 360: el módulo de 6 m, a escala, sobre su terreno (así se diseña la casa en su diseñador)
    vitrina(L, 5.0, 5.9, ['NU HOME 360 · 25 SEP', 'El módulo'], (h) => {
      const x = 5.0, y = 5.9;
      L.caja(x - 0.34, y - 0.28, h, 0.68, 0.56, 0.05, { t: '#8FAE78', l: '#789A62', r: '#658653' }, x + y);
      L.caja(x - 0.26, y - 0.1, h + 0.05, 0.36, 0.16, 0.15, { t: '#2B2724', l: '#1C1917', r: '#141110' }, x + y + 0.08);
      L.planoY(x - 0.24, y + 0.061, h + 0.17, 32, 10, `<rect x="2" y="2" width="9" height="6" fill="#CFE3EE"/><rect x="14" y="2" width="15" height="6" fill="#CFE3EE"/>`, x + y + 0.09);
      L.caja(x + 0.1, y - 0.1, h + 0.05, 0.14, 0.16, 0.015, { t: '#D6B68C', l: '#BD9A6C', r: '#A27F55' }, x + y + 0.1);
      for (const [dx, dy] of [[0.1, -0.1], [0.24, -0.1], [0.1, 0.06], [0.24, 0.06]]) L.linea([[x + dx, y + dy, h + 0.05], [x + dx, y + dy, h + 0.2]], '#3A3530', 0.9, x + y + 0.11 + dx * 0.01);
      L.caja(x + 0.09, y - 0.11, h + 0.2, 0.16, 0.18, 0.01, { t: '#A27F55', l: '#8C6A4A', r: '#735538' }, x + y + 0.13);
      L.cil(x - 0.22, y + 0.18, h + 0.05, 0.05, 0.1, '#3E7A4E', '#2F6440', x + y + 0.14);
    });
    zona('nuhome', { formas: [{ piso: [[4.5, 5.4], [5.5, 5.4], [5.5, 6.4], [4.5, 6.4]], alto: 1.75 }], lugar: [5.0, 5.9, 2.0], guia: [4.1, 6.6] });
    pj('arLentes', 5.95, 5.6, 0, 'i');

    // 5. Eleven 360: la huella (la propuesta no la reemplaza: trabaja antes y después de ella)
    vitrina(L, 8.6, 4.6, ['ELEVEN 360 · 25 SEP', 'La huella'], (h) => {
      const x = 8.6, y = 4.6;
      L.caja(x - 0.2, y - 0.14, h, 0.4, 0.28, 0.04, { t: '#1A1A1A', l: '#111111', r: '#0B0B0B' }, x + y);
      L.caja(x - 0.11, y - 0.05, h + 0.04, 0.22, 0.1, 0.36, { t: '#2A2A2A', l: '#1A1A1A', r: '#101010' }, x + y + 0.05);
      L.planoY(x - 0.09, y + 0.051, h + 0.37, 18, 26, `<rect width="18" height="26" rx="2" fill="#0B0B0B"/>` +
        [3.2, 5, 6.8, 8.6].map((r) => `<path d="M${9 - r} 13A${r} ${r * 1.15} 0 0 1 ${9 + r} 13" fill="none" stroke="#FF6600" stroke-width=".9"/>`).join('') +
        [3.2, 5, 6.8].map((r) => `<path d="M${9 - r} 13.5Q${9 - r} ${13.5 + r} 9 ${14 + r}" fill="none" stroke="#FF8A1F" stroke-width=".8"/>`).join('') +
        `<circle cx="9" cy="23" r="1.3" fill="#37D67A"/>`, x + y + 0.06);
      L.caja(x - 0.2, y + 0.08, h + 0.04, 0.4, 0.06, 0.012, { t: '#FF6600', l: '#CC5200', r: '#A84300' }, x + y + 0.07);
    });
    zona('eleven', { formas: [{ piso: [[8.1, 4.1], [9.1, 4.1], [9.1, 5.1], [8.1, 5.1]], alto: 1.75 }], lugar: [8.6, 4.6, 2.0], guia: [9.7, 4.3] });

    // 6. Rumbo: el elefante en sus cuatro etapas, como en un museo de historia natural, con su cordón al frente
    L.caja(11.9, 3.7, 0, 4.6, 1.1, 0.32, BLANCO, 12.3);
    L.caja(11.88, 3.68, 0, 4.64, 1.14, 0.06, { t: '#D9D5CD', l: '#C9C4BA', r: '#B7B1A6' }, 12.29);
    luz(L, 13.0, 4.3, 1.1); luz(L, 15.3, 4.3, 1.2);
    [['Cría', 12.55, 0.5], ['Joven', 13.55, 0.72], ['Adulto', 14.7, 0.98], ['Sabio', 15.95, 1.22]].forEach(([n, x, h], i) => {
      elefante(L, ETAPAS[i], x, 4.25, 0.32, h, 16.6 + i * 0.3);
      L.planoY(x - 0.28, 4.801, 0.26, 56, 16, `<rect width="56" height="16" rx="2" fill="${AZUL}"/>` + txt(28, 11.5, n, 9, '#FFFFFF', ' text-anchor="middle"'), 17.9 + i * 0.01);
    });
    for (const x of [12.0, 14.2, 16.4]) { L.cil(x, 5.35, 0, 0.06, 0.02, '#C9A227', '#A8861F', x + 5.35); L.cil(x, 5.35, 0.02, 0.022, 0.62, '#C9A227', '#A8861F', x + 5.36); L.cil(x, 5.35, 0.64, 0.045, 0.04, '#E0B341', '#C9A227', x + 5.37); }
    for (const [a, b] of [[12.0, 14.2], [14.2, 16.4]]) {
      const p1 = L.P(a, 5.35, 0.6), p2 = L.P(b, 5.35, 0.6), m = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 9];
      L.E.marca(a, 5.35, 0.6); L.E.marca(b, 5.35, 0.6);
      L.add((a + b) / 2 + 5.4, `<path d="M${r1(p1[0])} ${r1(p1[1])}Q${r1(m[0])} ${r1(m[1])} ${r1(p2[0])} ${r1(p2[1])}" fill="none" stroke="${AZUL}" stroke-width="2.4" stroke-linecap="round"/>`);
    }
    zona('rumbo', { formas: [{ piso: [[11.9, 3.7], [16.5, 3.7], [16.5, 4.8], [11.9, 4.8]], alto: 1.7 }], lugar: [14.2, 4.25, 1.9], guia: [11.3, 3.9] });
    pj('nino', 11.1, 5.2, 0, 'd', EA * 0.72);
    pj('arFoto', 17.4, 3.95, 0, 'i');

    // 7. El pedestal libre: la próxima pieza puede ser de tu proyecto
    vitrina(L, 17.6, 8.2, ['PRÓXIMAMENTE', 'Tu proyecto'], null);
    { const [cx, cy] = L.P(17.6, 8.2, 0.98); L.add(25.9, `<defs><radialGradient id="ar-espera"><stop offset="0" stop-color="#7FD8CF" stop-opacity=".55"/><stop offset="1" stop-color="#7FD8CF" stop-opacity="0"/></radialGradient></defs><ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="24" ry="12" fill="url(#ar-espera)"/>`); }
    zona('tuproyecto', { formas: [{ piso: [[17.1, 7.7], [18.1, 7.7], [18.1, 8.7], [17.1, 8.7]], alto: 1.75 }], lugar: [17.6, 8.2, 2.0], guia: [16.6, 9.4] });

    // ── Para descansar: una banca en el medio, mirando las piezas ──
    L.caja(9.6, 7.3, 0, 2.0, 0.55, 0.38, NEGRO, 9.6 + 7.3 + 0.9);
    L.caja(9.55, 7.25, 0.38, 2.1, 0.65, 0.06, { t: '#3A2E22', l: '#2B221A', r: '#221A14' }, 9.6 + 7.3 + 1.0);
    pj('arBanco', 10.9, 7.55, 0.44, 'i', EA, 19.2);

    // ── La entrada: el mesón con la guía del museo y la puerta ──
    L.caja(16.4, 11.9, 0, 1.3, 0.55, 0.95, BLANCO, 16.4 + 11.9 + 0.9);
    L.caja(16.38, 11.88, 0.95, 1.34, 0.59, 0.04, { t: AZUL, l: '#0B2239', r: '#081A2D' }, 16.4 + 11.9 + 0.95);
    L.planoY(16.5, 12.451, 0.82, 110, 30, `<rect width="110" height="30" rx="2" fill="${AZUL}"/>` + mono(8, 13, 'EL ARCHIVO', 8, CIAN2, ' letter-spacing="1.2"') + txt(8, 25, 'Entrada libre', 9.5, '#FFFFFF'), 16.4 + 11.9 + 0.97);
    for (const [dx, c] of [[0.2, CIAN], [0.45, '#F2F4F7'], [0.7, '#E0B341']]) L.caja(16.4 + dx, 12.02, 0.99, 0.18, 0.26, 0.012, { t: c, l: c, r: c }, 16.4 + 11.9 + 1.0 + dx * 0.01);
    L.piso(17.8, 13.05, `<rect width="140" height="70" rx="8" fill="${AZUL}"/>` + mono(18, 44, 'EL ARCHIVO', 22, CIAN2, ' letter-spacing="2"'), -28, 0.01);
    plantaAlta(L, 19.45, 10.7, 1.0, ['#FFFFFF', '#DCDFD9']);
    plantaAlta(L, 0.95, 12.9, 1.05, ['#FFFFFF', '#DCDFD9']);
    zona('recepcion', { formas: [{ piso: [[16.4, 11.9], [17.7, 11.9], [17.7, 12.45], [16.4, 12.45]], alto: 1.0 }, { piso: [[17.8, 13.05], [19.2, 13.05], [19.2, 13.75], [17.8, 13.75]], alto: 0.05 }], lugar: [17.05, 12.2, 1.35] });
    lugar('entrada', 17.6, 12.6, 0.9);

    // Quienes caminan: Pepa, que cuida el museo y guía el recorrido, y una visita que va de pieza en pieza
    camina('pepa', o.pepa ? [[...o.pepa, 4], [3.4, 7.8, 2], [...o.pepa]] : [[1.9, 4.35, 4], [3.4, 7.8, 2], [7.4, 8.2, 3], [3.4, 7.8], [1.9, 4.35]], { vel: 0.45 });
    camina('estudiante', [[15.8, 10.0, 3], [11.9, 8.95, 2.5], [7.6, 7.9, 3], [11.9, 8.95], [15.8, 10.0]], { vel: 0.4 });
  });
}
export const sala = salaArchivo;

// Acercamientos para las fotos: centro en el mundo y ancho de la ventana en píxeles del dibujo
export const ZONAS = {
  entrada: [15.6, 11.0, 1.0, 560], terminal: [13.4, 10.6, 1.4, 260], fundos: [9.2, 10.2, 1.4, 260], haru: [5.8, 9.5, 1.4, 260],
  nuhome: [5.0, 5.9, 1.4, 260], eleven: [8.6, 4.6, 1.4, 260], rumbo: [14.2, 4.4, 1.0, 420], tuproyecto: [17.6, 8.2, 1.4, 260], linea: [10.2, 0.2, 1.6, 520], fichero: [1.2, 5.0, 1.2, 440]
};
