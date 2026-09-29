// El Archivo, el museo de BiPlot. Una sala de galería en orden: dos filas de vitrinas iguales, en las mismas columnas, y
// una sola línea en el piso («Seis décadas, la misma línea», el sitio). Adelante, las épocas, de derecha a izquierda como
// se entra: 1985 la libreta, 1990 la terminal, 1998 el software de caja, 2015 el portátil con sus tres palabras y hoy las
// diez fases de BiPlot HQ (sin vidrio: sigue abierto). La línea parte color papel en el atril de la entrada y va tomando
// el color de cada época hasta volverse cian en hoy; da una sola vuelta, frente al primer plano de la oficina, y vuelve
// por la fila de atrás, con una pieza de cada desarrollo en el orden en que llegaron a biplot.cl (la escritura de Fundos
// 360, el QR de la mesa de Haru 360, el módulo de Nu Home 360, la huella de Eleven 360 y el elefante de Rumbo). Termina en
// el punto coral, frente al pedestal libre: tu turno. En los muros, la línea de tiempo de 2026 y el nombre del museo; a la
// izquierda, el fichero con todos los casos por rubro. Lo cuida Pepa (Cosecha): «Lo que sirve dos veces se guarda». Sus
// textos (tarjetas, burbujas y recorrido) están en datos.js (salas.archivo.salaPropia).
import { montar, base, registrar, planoXen, plantaAlta, txt, mono, PELO, Z, PIEL, EA, r1 } from './comun.mjs';
import { ETAPAS } from './elefantes.mjs';
import { grabador, marco3d } from './vitrina3d.mjs';

const AZUL = '#0E2A47', AZUL2 = '#12375E', CIAN = '#17C3B2', CIAN2 = '#7FD8CF', TINTA = '#13202E', GRIS = '#5B6776', CORAL = '#FF6B4A';
const MURO = '#F1EEE8', MURO2 = '#E4E0D8';
// Los colores de cada época, los mismos del sitio (plotline.html)
const EPOCA = { papel: '#E8DFC8', hoja: '#F4ECD8', lapiz: '#3A2F1C', rojo: '#A4241A', fosforo: '#5FF0D0', fosforo2: '#3FAE94', pantalla: '#040A08',
  neon: '#FF6BD6', neon2: '#00F6FF', morado: '#150523', ventana: '#1A1030', barra: '#241640', azul: '#2B57D6', celeste: '#E8EDFB', gris: '#DBE1E8' };
const BLANCO = { t: '#FFFFFF', l: '#ECE9E3', r: '#D9D5CD' };
const ZOCALO = { t: '#D9D5CD', l: '#C9C4BA', r: '#B7B1A6' };
const ROBLE = { t: '#C9AE86', l: '#B0936A', r: '#957955' };
const NOGAL = { t: '#8C6A4A', l: '#735538', r: '#5E452D' };
const BEIGE = { t: '#EDE6D3', l: '#DCD3BC', r: '#C8BEA4' };
const MARINO = { t: '#1B3A5C', l: AZUL, r: '#081A2D' };
const W = 20, D = 14, HM = 2.6;

// La grilla: seis columnas y dos filas. Adelante las épocas (hoy en la primera columna); atrás los desarrollos y, en la
// última columna, el pedestal libre. La línea pasa frente a cada fila.
const COL = [4.2, 7.0, 9.8, 12.6, 15.4, 18.2];
const FRENTE = 10.6, FONDO = 5.2;
const LF = FRENTE + 1.1, LC = FONDO + 1.1, INICIO = 18.7, VUELTA = 1.2;

// ───────── Quienes visitan el museo (ilustraciones sin nombre) ─────────
registrar({
  arMira: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'melena', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#C9A24E', '#A8843A', ['#F2F4F7']], abajo: 'pantalon', abajoCol: ['#2A3038', '#1F242B'], zapatos: Z.negras, brazoD: 'cadera', ojos: 'grandes' },
  arFoto: { piel: PIEL.trigo, pelo: PELO.castano, peinado: 'cola', lazo: CIAN, cuerpo: 'fino', arriba: 'parka', arribaCol: ['#2A7C78', '#1F5F5C', '#174A48'], abajo: 'pantalon', abajoCol: ['#35557A', '#27425F'], zapatos: Z.blancas, brazoD: 'telefono', objeto: 'camara' }
});

// La luz de cada pieza, en el piso: una mancha tibia que se apaga hacia los bordes
const LUZ = `<defs><radialGradient id="ar-luz"><stop offset="0" stop-color="#FFF1CF" stop-opacity=".30"/><stop offset=".55" stop-color="#FFF1CF" stop-opacity=".12"/><stop offset="1" stop-color="#FFF1CF" stop-opacity="0"/></radialGradient></defs>`;
const ESPERA3D = `<defs><radialGradient id="ar-espera3d"><stop offset="0" stop-color="#7FD8CF" stop-opacity=".6"/><stop offset="1" stop-color="#7FD8CF" stop-opacity="0"/></radialGradient></defs>`;
const luz = (L, x, y, r = 1.1) => L.piso(x - r, y - r, `<circle cx="${r * 100}" cy="${r * 100}" r="${r * 100}" fill="url(#ar-luz)"/>`, -30, 0.012);

// Contenido 2D sobre un plano cualquiera (una hoja inclinada, la pantalla de un portátil): o es la esquina de arriba a la
// izquierda y u, v los lados (en baldosas) que corresponden al ancho a y al alto h del dibujo; dorso, el color de su revés
// cuando la vitrina gira (vitrina3d.mjs)
function plano(L, o, u, v, a, h, svg, k, dorso) {
  if (L.tres) return L.plano(o, u, v, a, h, svg, dorso);
  const p0 = L.P(...o), pu = L.P(o[0] + u[0], o[1] + u[1], o[2] + u[2]), pv = L.P(o[0] + v[0], o[1] + v[1], o[2] + v[2]);
  L.E.marca(...o); L.E.marca(o[0] + u[0] + v[0], o[1] + u[1] + v[1], o[2] + u[2] + v[2]);
  const m = [(pu[0] - p0[0]) / a, (pu[1] - p0[1]) / a, (pv[0] - p0[0]) / h, (pv[1] - p0[1]) / h].map((n) => n.toFixed(4));
  return L.add(k, `<g transform="matrix(${m.join(',')},${r1(p0[0])},${r1(p0[1])})">${svg}</g>`);
}

// Una vitrina: pedestal blanco con su cédula al frente, la pieza encima y el vidrio alrededor (la cara de atrás antes
// de la pieza y la de adelante después). pieza(z, L) dibuja lo que va encima (z = h), en la sala o en la vitrina en 3D.
// Todas iguales; hoy y el pedestal libre van sin vidrio (o.vidrio = false).
function vitrina(L, x, y, cedula, pieza, o = {}) {
  const s = 0.86, h = 0.98, hv = 0.7, x0 = x - s / 2, y0 = y - s / 2, x1 = x + s / 2, y1 = y + s / 2, k = x + y, zv = h + hv;
  const vidrio = o.vidrio !== false;
  luz(L, x, y, 1.15);
  L.caja(x0, y0, 0, s, s, h, BLANCO, k);
  L.caja(x0 - 0.02, y0 - 0.02, 0, s + 0.04, s + 0.04, 0.08, ZOCALO, k - 0.01);
  // La cédula: una placa oscura al frente del pedestal
  const cw = r1((s - 0.1) * 100);
  L.planoY(x0 + 0.05, y1 + 0.004, h - 0.14, cw, 30, `<rect width="${cw}" height="30" rx="2" fill="${AZUL}"/>` +
    (cedula[0].length > 19 ? mono(5, 11.5, cedula[0], 5.2, CIAN2) : mono(5, 11.5, cedula[0], 5.6, CIAN2, ' letter-spacing=".3"')) + txt(5, 24, cedula[1], 7.6, '#FFFFFF'), k + 0.02);
  const vid = (pts, kk, a = '.13') => L.add(kk, L.poly(pts, `fill="rgba(214,236,240,${a})" stroke="rgba(255,255,255,.6)" stroke-width=".7" stroke-linejoin="round"`));
  if (vidrio) {
    vid([[x0, y0, h], [x1, y0, h], [x1, y0, zv], [x0, y0, zv]], k - 0.3, '.10');
    vid([[x0, y0, h], [x0, y1, h], [x0, y1, zv], [x0, y0, zv]], k - 0.3, '.08');
  }
  if (pieza) pieza(h, L);
  if (vidrio) {
    vid([[x0, y1, h], [x1, y1, h], [x1, y1, zv], [x0, y1, zv]], k + 0.6, '.12');
    vid([[x1, y0, h], [x1, y1, h], [x1, y1, zv], [x1, y0, zv]], k + 0.6, '.10');
    vid([[x0, y0, zv], [x1, y0, zv], [x1, y1, zv], [x0, y1, zv]], k + 0.61, '.16');
    // Un reflejo en diagonal en la cara de adelante
    L.add(k + 0.62, L.poly([[x0 + 0.12, y1, zv - 0.08], [x0 + 0.22, y1, zv - 0.08], [x0 + 0.05, y1, h + 0.1], [x0 + 0.02, y1, h + 0.1]], 'fill="rgba(255,255,255,.35)"'));
  }
}

// El elefante de Rumbo parado en (x, y, z), de alto h (su dibujo va de pie, como la gente)
const elefante = (L, svg, x, y, z, h, k) => {
  if (L.tres) return L.figura(svg, x, y, z, h, 128, 222);
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

// Hoy, de frente: el proceso completo, la misma línea con el nombre de cada fase (los de datos.js, fases)
const NOMBRES_FASES = ['Calificación', 'Diagnóstico', 'Camino', 'Datos', 'Modelo y permisos', 'Construcción', 'Validación', 'Puesta en marcha', 'Medición', 'Cosecha'];
const partir = (n) => { const i = n.lastIndexOf(' ', Math.ceil(n.length / 2) + 1); return n.length > 12 && i > 0 ? [n.slice(0, i), n.slice(i + 1)] : [n, '']; };
const PROCESO = (() => {
  const a = 1000, h = 440, base = 350, x = (p) => r1(60 + p * (a - 120) / 100), y = (p) => r1(96 + (p - 11.7) * 3.3);
  const lin = [[0, 86.7], ...FASES, [100, 11.7]].map(([px, py]) => [x(px), y(py)]), pts = lin.map((q) => q.join(',')).join(' ');
  return `<rect width="${a}" height="${h}" rx="14" fill="${AZUL}"/><rect x="10" y="10" width="${a - 20}" height="${h - 20}" rx="9" fill="none" stroke="rgba(127,216,207,.3)" stroke-width="1.5"/>` +
    mono(40, 52, 'LA MISMA LÍNEA · DIEZ FASES', 16, CIAN2, ' letter-spacing="2"') + mono(a - 40, 52, 'BIPLOT HQ', 16, '#FFFFFF', ' letter-spacing="2" text-anchor="end"') +
    `<polygon points="${pts} ${lin.at(-1)[0]},${base} ${lin[0][0]},${base}" fill="${CIAN}" fill-opacity=".14"/><path d="M${lin[0][0]} ${base}H${lin.at(-1)[0]}" stroke="rgba(127,216,207,.35)" stroke-width="2"/>` +
    FASES.map(([px, py]) => `<path d="M${x(px)} ${r1(y(py) + 12)}V${base}" stroke="rgba(127,216,207,.22)" stroke-width="1.5" stroke-dasharray="3 5"/>`).join('') +
    `<polyline points="${pts}" fill="none" stroke="${CIAN}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>` +
    FASES.map(([px, py], i) => {
      const cx = x(px), [l1, l2] = partir(NOMBRES_FASES[i]);
      return `<circle cx="${cx}" cy="${y(py)}" r="10" fill="${CIAN}" stroke="#FFFFFF" stroke-width="3.5"/>` + mono(cx, base + 30, 'E' + i, 15, CIAN2, ' text-anchor="middle"') +
        txt(cx, base + 52, l1, 12.5, '#FFFFFF', ' text-anchor="middle"') + (l2 ? txt(cx, base + 68, l2, 12.5, '#FFFFFF', ' text-anchor="middle"') : '');
    }).join('') + `<circle cx="${x(100)}" cy="${y(11.7)}" r="8" fill="none" stroke="${CIAN2}" stroke-width="3"/>`;
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
// La línea de tiempo, de frente: las mismas fechas, con aire y cada una centrada en su punto (la del muro se sale por los bordes)
const TIEMPO_FRENTE = (() => {
  const a = 1280, h = 290, y0 = 172, x = (i) => r1(130 + i * (a - 260) / (HITOS.length - 1));
  return `<rect width="${a}" height="${h}" rx="14" fill="${MURO}"/><rect x="10" y="10" width="${a - 20}" height="${h - 20}" rx="9" fill="none" stroke="${MURO2}" stroke-width="2"/>` +
    txt(48, 56, 'ASÍ CRECIÓ BIPLOT', 26, AZUL, ' letter-spacing="2"') + mono(a - 48, 56, '2026', 18, '#0B6F66', ' letter-spacing="2" text-anchor="end"') +
    `<path d="M48 ${y0}H${a - 48}" stroke="${AZUL}" stroke-width="5" stroke-linecap="round"/>` +
    HITOS.map(([f, t, sub], i) => {
      const cx = x(i), arriba = i % 2 === 0, yT = arriba ? 96 : 218;
      return `<path d="M${cx} ${arriba ? 146 : 185}V${arriba ? 159 : 198}" stroke="${AZUL}" stroke-width="1.8"/>` +
        `<circle cx="${cx}" cy="${y0}" r="11" fill="${i === 1 || i === 2 || i === 4 ? CIAN : AZUL}" stroke="#FFFFFF" stroke-width="3.5"/>` +
        mono(cx, yT, f, 13, GRIS, ' letter-spacing="1" text-anchor="middle"') + txt(cx, yT + 22, t, 16.5, AZUL, ' text-anchor="middle"') +
        txt(cx, yT + 41, sub, 13, GRIS, ' font-weight="500" text-anchor="middle"');
    }).join('');
})();

// ───────── La línea del piso: una sola, del mismo grosor ─────────
// Parte color papel en el atril de la entrada y va tomando el color de cada época (el fósforo de la terminal, el neón del
// software, el azul del genérico) hasta volverse cian en hoy. Da una sola vuelta, a la izquierda, pasa frente a cada
// desarrollo y termina en el punto coral, frente al pedestal libre. Un punto frente a cada pieza, del color de su tramo.
const mezcla = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
function lineaDelPiso(tono) {
  const epocas = tono === 'dos'
    ? [15.4, 12.6, 9.8, 7.0, 4.2].map((x, i) => [x, mezcla(EPOCA.papel, CIAN, i / 4)])
    : [[15.4, EPOCA.papel], [12.6, '#7FE3C2'], [9.8, '#E596E8'], [7.0, '#93ABFF'], [4.2, CIAN]];
  const y1 = LF * 100, y2 = LC * 100, xi = INICIO * 100, xh = COL[0] * 100, xv = VUELTA * 100, r = 100, xf = COL[5] * 100;
  const frente = `M${xi} ${y1}H${xh}`;
  const vuelta = `M${xh} ${y1}H${xv + r}A${r} ${r} 0 0 1 ${xv} ${y1 - r}V${y2 + r}A${r} ${r} 0 0 1 ${xv + r} ${y2}H${xf}`;
  const grad = `<defs><linearGradient id="ar-epocas" gradientUnits="userSpaceOnUse" x1="${xi}" y1="0" x2="${xh}" y2="0"><stop offset="0" stop-color="${EPOCA.papel}"/>` +
    epocas.map(([x, c]) => `<stop offset="${((xi - x * 100) / (xi - xh)).toFixed(3)}" stop-color="${c}"/>`).join('') + '</linearGradient></defs>';
  const trazo = (d, c, w, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  return grad + trazo(frente, 'url(#ar-epocas)', 28, ' stroke-opacity=".10"') + trazo(vuelta, CIAN, 28, ' stroke-opacity=".10"') +
    trazo(frente, 'url(#ar-epocas)', 8) + trazo(vuelta, CIAN, 8) +
    epocas.map(([x, c]) => `<circle cx="${r1(x * 100)}" cy="${y1}" r="13" fill="${c}" stroke="${AZUL}" stroke-width="4"/>`).join('') +
    COL.slice(0, 5).map((x) => `<circle cx="${r1(x * 100)}" cy="${y2}" r="11" fill="${CIAN}" stroke="${AZUL}" stroke-width="4"/>`).join('') +
    `<circle cx="${xf}" cy="${y2}" r="32" fill="${CORAL}" opacity=".2"/><circle cx="${xf}" cy="${y2}" r="17" fill="${CORAL}" stroke="${AZUL}" stroke-width="5"/>`;
}

export function salaArchivo(o = {}) {
  return montar(({ E, L, pj, camina, lugar, zona }) => {
    // Piso de concreto pulido, azul pizarra, en paños grandes; muros de galería con el zócalo azul y el filete cian
    let panos = '';
    for (let i = 1; i < 10; i++) panos += `<path d="M${i * 200} 0V1400" stroke="#2A3C51" stroke-width="3"/>`;
    for (let j = 1; j < 7; j++) panos += `<path d="M0 ${j * 200}H2000" stroke="#2A3C51" stroke-width="3"/>`;
    base(E, L, { W, D, HM, piso: '#233447', dibujo: LUZ + panos, muroY: MURO, muroX: MURO2, zocalo: AZUL, tope: '#D5D0C6', canto: '#C9C3B8', filete: CIAN });
    L.piso(0, 0, lineaDelPiso(o.tono), -29.5, 0.01);

    // Cada vitrina se toca entera; la guía se para adelante, a su izquierda. Lo que es una imagen (la pantalla de hoy, la
    // línea de tiempo, el primer plano) se abre de frente; una vitrina con su pieza, en 3D, girando sobre su pedestal
    const expo = (x, y, cedula, fn, o = {}) => {
      vitrina(L, x, y, cedula, fn, o);
      const R = grabador(x, y); vitrina(R, x, y, cedula, fn, o);
      const m = marco3d(R.modelo, 0.98 + 0.7);
      return { modelo: { ...R.modelo, vb: m.vb, defs: LUZ + ESPERA3D }, ancho: m.ancho, alto: m.alto };
    };
    const pieza = (id, x, y, alto = 1.75, frente) => zona(id, { formas: [{ piso: [[x - 0.5, y - 0.5], [x + 0.5, y - 0.5], [x + 0.5, y + 0.5], [x - 0.5, y + 0.5]], alto }], lugar: [x, y, alto + 0.25],
      guia: [r1(x - 0.95), r1(y + 0.7)], ...(frente ? { frente } : {}) });

    // ── El muro de atrás: la línea de tiempo, sobre los desarrollos, y el nombre del museo ──
    const LT = 1280, XT = 3.4;
    const TIEMPO = `<rect width="${LT}" height="170" fill="${MURO}"/>` + txt(0, 26, 'ASÍ CRECIÓ BIPLOT', 24, AZUL, ' letter-spacing="2"') + mono(292, 26, '2026', 16, CIAN, ' letter-spacing="2"') +
      `<path d="M10 96H${LT - 10}" stroke="${AZUL}" stroke-width="4" stroke-linecap="round"/>` +
      HITOS.map(([f, t, s], i) => {
        const x = 40 + i * ((LT - 80) / (HITOS.length - 1)), arriba = i % 2 === 0, yT = arriba ? 58 : 128;
        return `<path d="M${x} ${arriba ? 70 : 104}V${arriba ? 88 : 122}" stroke="${AZUL}" stroke-width="1.6"/><circle cx="${x}" cy="96" r="9" fill="${i === 1 || i === 2 || i === 4 ? CIAN : AZUL}" stroke="#FFFFFF" stroke-width="3"/>` +
          mono(x - 60, yT - 14, f, 10, GRIS, ' letter-spacing=".8"') + txt(x - 60, yT, t, 12.5, AZUL) + txt(x - 60, yT + 14, s, 10, GRIS, ' font-weight="500"');
      }).join('');
    L.planoY(XT, 0.02, 2.35, LT, 170, TIEMPO, -39);
    zona('linea', { formas: [{ plano: [[XT, 0.03, 0.65], [XT + LT / 100, 0.03, 0.65], [XT + LT / 100, 0.03, 2.35], [XT, 0.03, 2.35]] }], lugar: [XT + LT / 200, 0.05, 2.62], guia: [9.8, 2.4],
      frente: { svg: TIEMPO_FRENTE, ancho: 1280, alto: 290 } });

    L.planoY(16.7, 0.02, 2.4, 310, 175, `<rect width="310" height="175" fill="${MURO}"/>` + txt(0, 52, 'EL ARCHIVO', 44, AZUL, ' letter-spacing="3"') +
      mono(2, 78, 'MUSEO DE BIPLOT', 15, CIAN, ' letter-spacing="3"') + `<rect x="2" y="94" width="64" height="4" fill="${CIAN}"/>` +
      txt(2, 128, '«Lo que sirve dos veces', 15, TINTA, ' font-weight="500"') + txt(2, 148, 'se guarda.»', 15, TINTA, ' font-weight="500"') + mono(2, 168, 'PEPA · COSECHA', 10, GRIS, ' letter-spacing="1"'), -39);

    // ── El muro de la izquierda: el fichero con todos los casos por rubro, BiPlot HQ el día que abrió y, donde la línea da
    // la vuelta, el primer plano de la oficina ──
    L.caja(0.06, 1.1, 0, 0.64, 2.8, 1.18, ROBLE, 1.2);
    L.caja(0.04, 1.08, 1.18, 0.68, 2.84, 0.05, NOGAL, 1.25);
    planoXen(L, 0.701, 3.9, 1.12, 280, 108, `<rect width="280" height="108" fill="#B99A70"/>` +
      Array.from({ length: 28 }, (_, i) => { const c = i % 7, f = Math.floor(i / 7), x = 6 + c * 39, y = 6 + f * 25.5; return `<rect x="${x}" y="${y}" width="35" height="22" rx="2" fill="#C9AE86" stroke="#8C6A4A" stroke-width="1"/>` +
        `<rect x="${x + 7}" y="${y + 4}" width="21" height="6" rx="1" fill="#F4ECD8"/><circle cx="${x + 17.5}" cy="${y + 15.5}" r="2.6" fill="#C9A227" stroke="#8C6A1F" stroke-width=".8"/>`; }).join(''), 2.8);
    L.planoX(3.95, 2.02, 290, 44, txt(0, 18, 'EL FICHERO', 18, AZUL, ' letter-spacing="2"') + mono(0, 36, 'TODOS LOS CASOS, POR RUBRO', 10, GRIS, ' letter-spacing="1"'), -38);
    // Una ficha afuera, sobre el fichero
    L.caja(0.25, 2.3, 1.23, 0.3, 0.42, 0.012, { t: '#FBF6E9', l: '#E8DFC8', r: '#D8CDB2' }, 1.9);
    zona('fichero', { formas: [{ piso: [[0.06, 1.1], [0.72, 1.1], [0.72, 3.9], [0.06, 3.9]], alto: 1.25 }, { plano: [[0.03, 3.95, 1.55], [0.03, 1.05, 1.55], [0.03, 1.05, 2.05], [0.03, 3.95, 2.05]] }], lugar: [0.4, 2.5, 1.7], guia: [1.7, 3.2] });

    // BiPlot HQ el día que abrió (25 sep): la imagen de entonces, con una sala por proyecto adentro, enmarcada; se abre de
    // frente completa
    const yh = 7.12;
    L.planoX(yh, 2.4, 280, 177, `<rect width="280" height="177" fill="${AZUL}"/><image href="§M§archivo-hq-apertura.webp" x="6" y="6" width="268" height="165" preserveAspectRatio="xMidYMid meet"/>`, -38.8);
    L.planoX(yh, 0.55, 280, 20, mono(0, 14, 'BIPLOT HQ, EL DÍA QUE ABRIÓ', 11, GRIS, ' letter-spacing="1.2"'), -38.5);
    zona('apertura', { formas: [{ plano: [[0.03, yh, 0.63], [0.03, yh - 2.8, 0.63], [0.03, yh - 2.8, 2.4], [0.03, yh, 2.4]] }], lugar: [0.05, yh - 1.4, 2.6], guia: [2.1, yh - 1.4],
      frente: { img: 'archivo-hq-apertura', ancho: 1225, alto: 753, alt: 'BiPlot HQ el 25 de septiembre de 2026, en isométrico: la recepción con Plotty, el muro del personal, la estantería del núcleo, el motor en la pared y una sala por proyecto (Nu Home 360, Fundos 360, Haru 360, Eleven 360 y Rumbo)', pie: 'BiPlot HQ · 25 sep 2026' } });

    const yp = (LF + LC) / 2 + 1.5;
    const PLANO_HQ = `<rect width="300" height="160" fill="#F8F6F1"/><rect x="10" y="10" width="280" height="140" fill="${AZUL2}"/>` +
      Array.from({ length: 13 }, (_, i) => `<path d="M${10 + i * 22} 10V150" stroke="#2B5580" stroke-width=".8"/>`).join('') + Array.from({ length: 7 }, (_, i) => `<path d="M10 ${10 + i * 22}H290" stroke="#2B5580" stroke-width=".8"/>`).join('') +
      `<path d="M150 42L230 82L150 122L70 82Z" fill="none" stroke="#FFFFFF" stroke-width="2.4"/><path d="M150 42V62M230 82V96M70 82V96M150 122V136M70 96L150 136L230 96" fill="none" stroke="#FFFFFF" stroke-width="1.6"/>` +
      `<path d="M110 62L150 82L190 62M150 82V122" stroke="#7FD8CF" stroke-width="1.4" fill="none" stroke-dasharray="4 3"/>` +
      mono(18, 30, 'BIPLOT HQ · PLANO', 11, '#FFFFFF', ' letter-spacing="1.5"') + mono(208, 142, '25·09·2026', 9, CIAN2);
    L.planoX(yp, 2.3, 300, 160, PLANO_HQ, -38.8);
    L.planoX(yp, 0.62, 300, 20, mono(0, 14, 'EL PRIMER PLANO DE LA OFICINA', 11, GRIS, ' letter-spacing="1.2"'), -38.5);
    zona('plano', { formas: [{ plano: [[0.03, yp, 0.7], [0.03, yp - 3, 0.7], [0.03, yp - 3, 2.3], [0.03, yp, 2.3]] }], lugar: [0.05, yp - 1.5, 2.5], guia: [2.1, yp - 1.5],
      frente: { svg: PLANO_HQ, ancho: 300, alto: 160 } });

    // ── Adelante, las épocas: la misma línea, contada con herramientas distintas ──
    // 1985 · El papel: la libreta abierta sobre su atril, con el lápiz al lado
    const vPapel = expo(COL[4], FRENTE, ['1985 · EL PAPEL', 'La libreta'], (h, L) => {
      const x = COL[4], y = FRENTE;
      L.caja(x - 0.3, y - 0.14, h, 0.6, 0.34, 0.05, ROBLE, x + y);
      plano(L, [x - 0.28, y - 0.12, h + 0.38], [0.56, 0, 0], [0, 0.24, -0.3], 56, 37, LIBRETA, x + y + 0.05, '#8C6A4A');
      L.linea([[x - 0.22, y + 0.2, h + 0.06], [x + 0.14, y + 0.15, h + 0.06]], '#E0B341', 2.4, x + y + 0.1);
      L.linea([[x + 0.14, y + 0.15, h + 0.06], [x + 0.19, y + 0.14, h + 0.06]], EPOCA.lapiz, 1.6, x + y + 0.11);
    });
    pieza('papel', COL[4], FRENTE, 1.75, vPapel);
    pj('abuelo', COL[4] + 0.95, FRENTE - 0.25, 0, 'i');

    // 1990 · El diagnóstico: la terminal, leyendo el proceso paso a paso
    const vTerminal = expo(COL[3], FRENTE, ['1990 · EL DIAGNÓSTICO', 'La terminal'], (h, L) => {
      const x = COL[3], y = FRENTE - 0.05;
      L.caja(x - 0.2, y - 0.2, h, 0.4, 0.34, 0.3, BEIGE, x + y + 0.1);
      L.planoY(x - 0.16, y + 0.141, h + 0.27, 32, 22, TERMINAL, x + y + 0.12);
      L.caja(x - 0.18, y + 0.2, h, 0.36, 0.13, 0.03, BEIGE, x + y + 0.2);
    });
    pieza('terminal', COL[3], FRENTE, 1.75, vTerminal);

    // 1998 · El enredo: el monitor con ventanas encima de ventanas y la caja del software, con sus cuatro CD
    const vSoftware = expo(COL[2], FRENTE, ['1998 · EL ENREDO', 'El software'], (h, L) => {
      const x = COL[2], y = FRENTE;
      L.caja(x - 0.3, y - 0.2, h, 0.36, 0.36, 0.33, BEIGE, x + y);
      L.planoY(x - 0.27, y + 0.161, h + 0.3, 30, 24, ENREDO, x + y + 0.05);
      L.caja(x - 0.2, y - 0.06, h - 0.001, 0.16, 0.2, 0.005, { t: '#C8BEA4', l: '#B7AC90', r: '#A69B80' }, x + y - 0.05);
      L.caja(x + 0.12, y - 0.02, h, 0.15, 0.06, 0.27, { t: '#7A3A9E', l: '#5B2A86', r: '#4A2170' }, x + y + 0.12);
      L.planoY(x + 0.12, y + 0.041, h + 0.27, 15, 27, CAJA_SOFTWARE, x + y + 0.13);
    });
    pieza('software', COL[2], FRENTE, 1.75, vSoftware);

    // 2015 · El genérico: un portátil con la misma plantilla de siempre
    const vGenerico = expo(COL[1], FRENTE, ['2015 · EL GENÉRICO', 'Tres palabras'], (h, L) => {
      const x = COL[1], y = FRENTE;
      L.caja(x - 0.25, y - 0.08, h, 0.5, 0.32, 0.018, { t: '#D9DEE5', l: '#BFC6CF', r: '#A9B1BB' }, x + y + 0.02);
      L.planoY(x - 0.2, y + 0.241, h + 0.018, 40, 1, `<rect width="40" height="1" fill="#8F97A1"/>`, x + y + 0.03);
      plano(L, [x - 0.25, y - 0.12, h + 0.33], [0.5, 0, 0], [0, 0.05, -0.315], 48, 31, SAAS, x + y + 0.04, '#A9B1BB');
    });
    pieza('generico', COL[1], FRENTE, 1.75, vGenerico);

    // Hoy · BiPlot HQ: la misma línea, ahora con alguien a cargo de cada tramo. Sin vidrio: sigue abierta
    vitrina(L, COL[0], FRENTE, ['HOY · BIPLOT HQ', 'Diez fases'], (h, L) => {
      const x = COL[0], y = FRENTE, k = x + y;
      L.caja(x - 0.05, y - 0.07, h, 0.1, 0.08, 0.14, MARINO, k + 0.05);
      L.caja(x - 0.42, y - 0.07, h + 0.12, 0.84, 0.06, 0.42, MARINO, k + 0.1);
      L.planoY(x - 0.4, y - 0.009, h + 0.52, 80, 32, `<g transform="scale(${(80 / 212).toFixed(4)})">${TABLERO}</g>`, k + 0.12);
    }, { vidrio: false });
    pieza('hoy', COL[0], FRENTE, 1.55, { svg: PROCESO, ancho: 1000, alto: 440 });
    pj('arFoto', COL[0] + 0.95, FRENTE - 0.25, 0, 'i');

    // ── Atrás, lo que construimos: una pieza de cada desarrollo, en el orden en que llegaron ──
    // Fundos 360: la escritura inscrita a nombre del comprador y la banderita del lote 25
    const vFundos = expo(COL[0], FONDO, ['FUNDOS 360 · 10 SEP', 'La escritura'], (h, L) => {
      const x = COL[0], y = FONDO;
      L.caja(x - 0.26, y - 0.06, h, 0.36, 0.1, 0.03, ROBLE, x + y);
      L.planoY(x - 0.24, y + 0.041, h + 0.46, 32, 43, `<rect width="32" height="43" fill="#FBF6E9" stroke="#D8CDB2" stroke-width=".8"/>` + mono(4, 7, 'ESCRITURA', 4.2, '#0F1F16') +
        [11, 14, 17, 20, 23, 26].map((yy) => `<rect x="4" y="${yy}" width="${yy === 26 ? 14 : 24}" height="1.1" fill="#B9AE98"/>`).join('') +
        `<circle cx="23" cy="35" r="6" fill="none" stroke="#9E2B25" stroke-width="1.3"/><circle cx="23" cy="35" r="4.3" fill="none" stroke="#9E2B25" stroke-width=".6"/>` + mono(19, 36.2, 'INSCRITA', 1.9, '#9E2B25'), x + y + 0.05, '#EFE8D8');
      L.caja(x + 0.08, y - 0.02, h, 0.26, 0.24, 0.06, { t: '#5E8A4E', l: '#4E7440', r: '#3F6034' }, x + y + 0.1);
      L.linea([[x + 0.2, y + 0.1, h + 0.06], [x + 0.2, y + 0.1, h + 0.5]], '#3A2E22', 1.4, x + y + 0.15);
      L.planoY(x + 0.2, y + 0.101, h + 0.5, 20, 13, `<path d="M0 0H20L15 6.5L20 13H0Z" fill="#D8B982" stroke="#0F1F16" stroke-width="1"/>` + txt(3, 9.5, '25', 7.5, '#0F1F16'), x + y + 0.16, '#C9A66C');
    });
    pieza('fundos', COL[0], FONDO, 1.75, vFundos);
    pj('arMira', COL[0] + 0.95, FONDO - 0.25, 0, 'i');

    // Haru 360: el QR de la mesa (se pide desde la mesa y la comanda llega a la cocina sin papel)
    const vHaru = expo(COL[1], FONDO, ['HARU 360 · 15 SEP', 'El QR de la mesa'], (h, L) => {
      const x = COL[1], y = FONDO;
      L.caja(x - 0.3, y - 0.22, h, 0.6, 0.44, 0.05, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' }, x + y);
      L.caja(x - 0.13, y - 0.04, h + 0.05, 0.22, 0.05, 0.02, { t: '#E6ECEF', l: '#C9D3D8', r: '#B3BFC6' }, x + y + 0.05);
      const qr = Array.from({ length: 36 }, (_, i) => ((i * 7 + (i >> 2)) % 3 === 0 ? `<rect x="${4 + (i % 6) * 2.4}" y="${7 + Math.floor(i / 6) * 2.4}" width="2.2" height="2.2" fill="#15120F"/>` : '')).join('');
      L.planoY(x - 0.12, y - 0.005, h + 0.33, 20, 26, `<rect width="20" height="26" rx="1.5" fill="#FFFFFF" stroke="#C9D3D8" stroke-width=".8"/>` + mono(3, 5, 'CARTA', 3.4, '#E0482F') + qr +
        `<rect x="4" y="7" width="5" height="5" fill="none" stroke="#15120F" stroke-width="1.1"/><rect x="11.4" y="7" width="5" height="5" fill="none" stroke="#15120F" stroke-width="1.1"/><rect x="4" y="14.4" width="5" height="5" fill="none" stroke="#15120F" stroke-width="1.1"/>`, x + y + 0.06, '#EEF1F3');
      L.cil(x + 0.17, y + 0.08, h + 0.05, 0.11, 0.015, '#FFFFFF', '#E6E1D8', x + y + 0.12);
      for (const [dx, dy] of [[0.13, 0.05], [0.2, 0.1]]) { L.cil(x + dx, y + dy, h + 0.065, 0.035, 0.035, '#F3EDE1', '#1F3A28', x + y + 0.13 + dx * 0.01); }
    });
    pieza('haru', COL[1], FONDO, 1.75, vHaru);

    // Nu Home 360: el módulo de 6 m, a escala, sobre su terreno (así se diseña la casa en su diseñador)
    const vNuhome = expo(COL[2], FONDO, ['NU HOME 360 · 25 SEP', 'El módulo'], (h, L) => {
      const x = COL[2], y = FONDO;
      L.caja(x - 0.34, y - 0.28, h, 0.68, 0.56, 0.05, { t: '#8FAE78', l: '#789A62', r: '#658653' }, x + y);
      L.caja(x - 0.26, y - 0.1, h + 0.05, 0.36, 0.16, 0.15, { t: '#2B2724', l: '#1C1917', r: '#141110' }, x + y + 0.08);
      L.planoY(x - 0.24, y + 0.061, h + 0.17, 32, 10, `<rect x="2" y="2" width="9" height="6" fill="#CFE3EE"/><rect x="14" y="2" width="15" height="6" fill="#CFE3EE"/>`, x + y + 0.09);
      L.caja(x + 0.1, y - 0.1, h + 0.05, 0.14, 0.16, 0.015, { t: '#D6B68C', l: '#BD9A6C', r: '#A27F55' }, x + y + 0.1);
      for (const [dx, dy] of [[0.1, -0.1], [0.24, -0.1], [0.1, 0.06], [0.24, 0.06]]) L.linea([[x + dx, y + dy, h + 0.05], [x + dx, y + dy, h + 0.2]], '#3A3530', 0.9, x + y + 0.11 + dx * 0.01);
      L.caja(x + 0.09, y - 0.11, h + 0.2, 0.16, 0.18, 0.01, { t: '#A27F55', l: '#8C6A4A', r: '#735538' }, x + y + 0.13);
      L.cil(x - 0.22, y + 0.18, h + 0.05, 0.05, 0.1, '#3E7A4E', '#2F6440', x + y + 0.14);
    });
    pieza('nuhome', COL[2], FONDO, 1.75, vNuhome);

    // Eleven 360: la huella (la propuesta no la reemplaza: trabaja antes y después de ella)
    const vEleven = expo(COL[3], FONDO, ['ELEVEN 360 · 25 SEP', 'La huella'], (h, L) => {
      const x = COL[3], y = FONDO;
      L.caja(x - 0.2, y - 0.14, h, 0.4, 0.28, 0.04, { t: '#1A1A1A', l: '#111111', r: '#0B0B0B' }, x + y);
      L.caja(x - 0.11, y - 0.05, h + 0.04, 0.22, 0.1, 0.36, { t: '#2A2A2A', l: '#1A1A1A', r: '#101010' }, x + y + 0.05);
      L.planoY(x - 0.09, y + 0.051, h + 0.37, 18, 26, `<rect width="18" height="26" rx="2" fill="#0B0B0B"/>` +
        [3.2, 5, 6.8, 8.6].map((r) => `<path d="M${9 - r} 13A${r} ${r * 1.15} 0 0 1 ${9 + r} 13" fill="none" stroke="#FF6600" stroke-width=".9"/>`).join('') +
        [3.2, 5, 6.8].map((r) => `<path d="M${9 - r} 13.5Q${9 - r} ${13.5 + r} 9 ${14 + r}" fill="none" stroke="#FF8A1F" stroke-width=".8"/>`).join('') +
        `<circle cx="9" cy="23" r="1.3" fill="#37D67A"/>`, x + y + 0.06);
      L.caja(x - 0.2, y + 0.08, h + 0.04, 0.4, 0.06, 0.012, { t: '#FF6600', l: '#CC5200', r: '#A84300' }, x + y + 0.07);
    });
    pieza('eleven', COL[3], FONDO, 1.75, vEleven);

    // Rumbo: el elefante en su última etapa, el Sabio, con su corona
    const vRumbo = expo(COL[4], FONDO, ['RUMBO · 25 SEP', 'El elefante'], (h, L) => elefante(L, ETAPAS[3], COL[4], FONDO + 0.05, h, 0.62, COL[4] + FONDO + 0.1));
    pieza('rumbo', COL[4], FONDO, 1.75, vRumbo);
    pj('nino', COL[4] + 0.95, FONDO - 0.2, 0, 'i', EA * 0.72);

    // Tu turno: el pedestal libre, sin vidrio, con una luz que lo espera; la línea termina en su punto coral
    const vTurno = expo(COL[5], FONDO, ['TU TURNO', 'Tu proyecto'], (h, L) => { if (L.tres) L.piso(COL[5] - 0.34, FONDO - 0.34, `<circle cx="34" cy="34" r="34" fill="url(#ar-espera3d)"/>`, 0, h + 0.004); }, { vidrio: false });
    { const [cx, cy] = L.P(COL[5], FONDO, 0.98); L.add(COL[5] + FONDO + 0.3, `<defs><radialGradient id="ar-espera"><stop offset="0" stop-color="#7FD8CF" stop-opacity=".55"/><stop offset="1" stop-color="#7FD8CF" stop-opacity="0"/></radialGradient></defs><ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="26" ry="13" fill="url(#ar-espera)"/>`); }
    zona('tuproyecto', { formas: [{ piso: [[COL[5] - 0.5, FONDO - 0.5], [COL[5] + 0.5, FONDO - 0.5], [COL[5] + 0.5, FONDO + 0.5], [COL[5] - 0.5, FONDO + 0.5]], alto: 1.3 },
      { piso: [[COL[5] - 0.35, LC - 0.25], [COL[5] + 0.35, LC - 0.25], [COL[5] + 0.35, LC + 0.25], [COL[5] - 0.35, LC + 0.25]], alto: 0.05 }], lugar: [COL[5], FONDO, 1.5], guia: [r1(COL[5] - 0.95), r1(FONDO + 0.7)],
      frente: vTurno });

    // ── La entrada: el atril donde parte la línea, con el libro de visitas ──
    const ka = 19.25 + LF + 0.3;
    L.caja(19.0, LF - 0.2, 0, 0.5, 0.4, 1.02, MARINO, ka);
    L.caja(18.98, LF - 0.22, 1.02, 0.54, 0.44, 0.04, { t: CIAN, l: '#0A8A7E', r: '#087066' }, ka + 0.01);
    L.planoY(19.05, LF + 0.201, 0.9, 40, 34, `<rect width="40" height="34" rx="2" fill="${AZUL}"/>` + mono(4, 12, 'EL ARCHIVO', 4.6, CIAN2, ' letter-spacing=".3"') + txt(4, 22, 'Entrada', 6.4, '#FFFFFF') + txt(4, 29.5, 'libre', 6.4, '#FFFFFF'), ka + 0.02);
    L.caja(19.08, LF - 0.12, 1.06, 0.3, 0.24, 0.02, { t: EPOCA.hoja, l: '#E4D8BE', r: '#CFC1A3' }, ka + 0.03);
    L.linea([[19.23, LF - 0.12, 1.085], [19.23, LF + 0.12, 1.085]], '#C9B99A', 0.8, ka + 0.04);
    zona('recepcion', { formas: [{ piso: [[18.9, LF - 0.3], [19.6, LF - 0.3], [19.6, LF + 0.3], [18.9, LF + 0.3]], alto: 1.1 }], lugar: [19.25, LF, 1.35], guia: [18.4, 12.5] });
    // (en celular se entra viendo de cerca este punto: la libreta, la terminal y el atril)
    lugar('entrada', 16.2, 11.0, 0.9);
    plantaAlta(L, 0.95, 12.9, 1.05, ['#FFFFFF', '#DCDFD9']);

    // Pepa cuida el museo y guía el recorrido: camina por el pasillo del medio, entre las dos filas
    camina('pepa', o.pepa ? [[...o.pepa, 4], [17.2, 8.4, 2], [...o.pepa]] : [[17.2, 8.4, 3], [10.2, 8.4, 3], [2.8, 8.4, 3], [10.2, 8.4], [17.2, 8.4]], { vel: 0.45 });
  });
}
export const archivo = () => salaArchivo();
