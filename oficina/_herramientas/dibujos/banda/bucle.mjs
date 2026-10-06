// Kilo (Bucle, Benjamín Ochoa), ronda 2: el desarrollador del equipo con estilo de rapero del Bronx de los noventa.
// Conserva las rastas en la misma línea (el moño azul oscuro con la cinta cian, las puntas que se enroscan como
// tentáculos y las rastas que caen a los hombros), la barba corta y la taza «</>» de café (le dicen Kilo por el kilo a
// la semana). Suma la chaqueta inflada corta, abierta sobre la camiseta holgada con KILO y el 5, el pañuelo azul
// marino de cintillo bajo el moño, la cadena dorada gruesa de cordón con el «</>» grande, los anillos, los jeans
// oscuros arrugados y las botas de trabajo color trigo con los cordones sueltos. Actitud de b-boy: una mano en la
// cadena, el mentón arriba, la mirada pesada y el peso hacia atrás. Marco 600 × 1260, suelo en y = 1240, mira a la
// izquierda.
import { K, W, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, nuevoId, r1, achicar, numeroChico } from './base.mjs';
import { NUMERO, lamina } from './tinta.mjs';

export const C = {
  piel: '#C68A5E', pielS: '#A56E45', pielL: '#D9A47B',
  barba: '#35271E', barbaS: '#241A14', labio: '#8E5442', labioS: '#6C3B2E',
  rasta: '#27467A', rastaS: '#18305A', rastaL: '#4A7BB5',
  chaqueta: '#1F3150', chaquetaS: '#142139', chaquetaL: '#41608F',
  camiseta: '#F2F4F7', camisetaS: '#C9D3DE',
  azul: '#17446F', azulS: '#0F3558', azulL: '#1F5A92',
  panuelo: '#142A4C', panueloS: '#0C1C36', blanco: '#F6F3EC',
  jean: '#25344C', jeanS: '#18233A', jeanL: '#3E5478',
  trigo: '#C9A15A', trigoS: '#A07E3E', trigoL: '#DDBB7A', cuello: '#5E3F24', suela: '#4A3221', vira: '#8A6A45', cordon: '#B88E4A',
  cian: '#17C3B2', cianS: '#0A8A7E', cianL: '#7FD8CF',
  oro: '#E2B341', oroS: '#A97E1E', oroL: '#F8DF8E',
  taza: '#F2F4F7', tazaS: '#C4D2E0', cafe: '#3B2416', vapor: '#D5E2EE'
};
// El mentón arriba: la cabeza se echa un poco atrás (gira sobre la base del cuello) y se agranda desde la coronilla
const LADEO = 'rotate(8 300 470)';
const CABEZA = `${LADEO} translate(300 150) scale(1.1) translate(-300 -150)`;
// El peso hacia atrás: el tronco se recuesta un poco sobre las caderas
const ATRAS = 'translate(-12 0) rotate(3 300 850)';

// «</>» dibujado con trazos (la taza y el colgante), centrado en (0, 0)
export function codigo(color, ancho, borde = 0) {
  const d = 'M-15 -13 L-30 0 L-15 13 M5 -16 L-5 16 M15 -13 L30 0 L15 13';
  const t = (c, w, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  return (borde ? t(K, ancho + borde * 2, ' transform="translate(1.2 1.4)"') + t(K, ancho + borde * 2) : '') + t(color, ancho);
}

// Una rasta: baja desde la raíz por una curva suave y remata en un rulo que se enrosca, como tentáculo, afinándose en
// la punta. giro +1 enrosca hacia la izquierda del cuadro (sentido horario), −1 hacia la derecha.
export function rasta(pts, w0, w1, { giro = 1, vueltas = 1.1, radio = 17, n = 16, segmentos = true, rulo = true } = {}) {
  const todo = pts.slice(), anchos = pts.map((_, i) => w0 + (w1 - w0) * i / (pts.length - 1));
  if (rulo) {
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    const tt = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const cx = b[0] + radio * Math.cos(tt + giro * Math.PI / 2), cy = b[1] + radio * Math.sin(tt + giro * Math.PI / 2);
    const f0 = tt - giro * Math.PI / 2;
    for (let k = 1; k <= n; k++) {
      const u = k / n, f = f0 + giro * u * vueltas * 2 * Math.PI, r = radio * (1 - 0.5 * u);
      todo.push([cx + r * Math.cos(f), cy + r * Math.sin(f)]);
      anchos.push(w1 * (1 - 0.6 * u));
    }
  }
  const d = miembro(todo, anchos, { punta: 'redonda' });
  // Sombra dura abajo a la derecha: la misma rasta corrida hacia la luz tapa el resto
  const sombras = [P(d, C.rasta, ' transform="translate(-5 -4.5)"')];
  // Los nudos de la rasta: barritas de tinta espaciadas a lo largo del tramo recto
  if (segmentos) sombras.push(`<path d="${curva(pts)}" fill="none" stroke="${C.rastaS}" stroke-width="${w0 + 4}" stroke-dasharray="2 24" stroke-dashoffset="9"/>`);
  return pieza(d, C.rastaS, sombras, { w: 4.6, peso: 1.4 });
}

// Un tramo inflado de la chaqueta (manga): un miembro sobre una curva cuadrática cuyo ancho sube en cada gajo y se
// hunde en cada costura. Devuelve la forma, los puntos y los anchos (para las costuras y los brillos)
export function inflado(p0, p1, p2, w0, w1, gajos, { hundido = 0.14 } = {}) {
  const pts = [], anchos = [], n = gajos * 2;
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
    const w = w0 + (w1 - w0) * t;
    anchos.push(i % 2 === 0 && i > 0 && i < n ? w * (1 - hundido) : w);
  }
  return { d: miembro(pts, anchos, { punta: 'redonda' }), pts, anchos };
}
// Las costuras del acolchado: una pincelada curva que cruza el tramo en cada punto hundido, y el brillo de cada gajo
export function acolchado(pts, anchos, { w = 2.6, brillo = true } = {}) {
  let o = '';
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i + 1], p = pts[i];
    const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
    if (i % 2 === 0) {
      const h = anchos[i] / 2 * 0.86, c = 6;
      o += pincel([p[0] + nx * h, p[1] + ny * h], [p[0] + nx * h * 0.4 + tx / l * c, p[1] + ny * h * 0.4 + ty / l * c], [p[0] - nx * h * 0.4 + tx / l * c, p[1] - ny * h * 0.4 + ty / l * c], [p[0] - nx * h, p[1] - ny * h], w);
    } else if (brillo) {
      // el brillo va del lado de la luz (arriba a la izquierda)
      const s = nx * -1 + ny * -1 > 0 ? 1 : -1, h = anchos[i] / 2 * 0.5;
      const q = [p[0] + s * nx * h, p[1] + s * ny * h];
      o += L(`M${r1(q[0] - tx / l * 9)} ${r1(q[1] - ty / l * 9)} L${r1(q[0] + tx / l * 9)} ${r1(q[1] + ty / l * 9)}`, 3.4, C.chaquetaL);
    }
  }
  return o;
}

// ── Botas de trabajo color trigo: nubuck, cuello acolchado, cordones sueltos, lengüeta afuera y planta dentada ──
export function bota(lado) {
  // lado -1: la de la izquierda del cuadro (punta a la izquierda); +1: la de la derecha (punta a la derecha)
  const x0 = lado < 0 ? 234 : 372, s = -lado, X = (x) => x0 + s * x;
  const xd = Math.max(X(-142), X(58));   // borde derecho de la bota en el cuadro: ahí cae la sombra
  let o = '';
  // Nubuck trigo: caña alta, empeine y una punta gorda y redonda
  const cuero = curva([[X(54), 1206], [X(58), 1150], [X(54), 1092], [X(46), 1062], [X(-32), 1060], [X(-42), 1092], [X(-58), 1124], [X(-94), 1144], [X(-128), 1156], [X(-144), 1180], [X(-140), 1208]], true);
  o += pieza(cuero, C.trigo, [[pol([[xd - 30, 1040], [xd + 10, 1040], [xd + 10, 1216], [xd - 30, 1216]]), C.trigoS], [pol([[X(-160), 1192], [X(70), 1192], [X(70), 1216], [X(-160), 1216]]), C.trigoS]]);
  // Costuras de la puntera y del talón
  const costura = (d) => `<path d="${d}" fill="none" stroke="${C.trigoS}" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round"/>`;
  o += L(`M${X(-142)} 1186 Q${X(-122)} 1150 ${X(-84)} 1156 Q${X(-74)} 1176 ${X(-76)} 1204`, 3);
  o += costura(`M${X(-134)} 1184 Q${X(-118)} 1158 ${X(-90)} 1162 Q${X(-82)} 1178 ${X(-84)} 1200`) + costura(`M${X(30)} 1204 Q${X(28)} 1150 ${X(44)} 1100`);
  // Ojalillos dorados a lo largo del empeine y los cordones cruzados, sueltos
  o += pieza(pol([[X(-36), 1088], [X(-18), 1092], [X(-60), 1146], [X(-80), 1140]]), C.trigoS, [], { w: 3.4, peso: 0.6 });
  for (let i = 0; i < 3; i++) {
    const y = 1100 + i * 15, x = -32 - i * 15;
    o += L(`M${X(x - 12)} ${y - 4} L${X(x + 10)} ${y + 6}`, 4.6, C.cordon) + L(`M${X(x - 12)} ${y - 4} L${X(x + 10)} ${y + 6}`, 1.2, C.trigoS);
    o += `<circle cx="${X(x - 13)}" cy="${y - 5}" r="3.2" fill="${C.oro}" stroke="${K}" stroke-width="1.6"/><circle cx="${X(x + 11)}" cy="${y + 6}" r="3.2" fill="${C.oro}" stroke="${K}" stroke-width="1.6"/>`;
  }
  // Las puntas del cordón cuelgan por el costado
  o += B(`M${X(-14)} 1092 C${X(4)} 1110 ${X(-2)} 1134 ${X(10)} 1152`, 8) + B(`M${X(-14)} 1092 C${X(4)} 1110 ${X(-2)} 1134 ${X(10)} 1152`, 4, C.cordon);
  o += B(`M${X(-10)} 1094 C${X(18)} 1104 ${X(16)} 1126 ${X(26)} 1140`, 8) + B(`M${X(-10)} 1094 C${X(18)} 1104 ${X(16)} 1126 ${X(26)} 1140`, 4, C.cordon);
  // Vira cosida y la planta dentada
  o += pieza(pol([[X(-138), 1198], [X(54), 1198], [X(56), 1214], [X(-140), 1214]]), C.vira, [], { w: 4, peso: 0 });
  o += `<path d="M${X(-132)} 1206 L${X(50)} 1206" fill="none" stroke="${C.trigoL}" stroke-width="1.8" stroke-dasharray="4 3"/>`;
  o += pieza(pol([[X(-140), 1212], [X(56), 1212], [X(60), 1240], [X(-144), 1240]]), C.suela, [], { w: 5.5 });
  for (let i = 0; i < 7; i++) o += L(`M${X(-128 + i * 28)} 1230 L${X(-128 + i * 28)} 1240`, 3, '#2E1F14');
  return o;
}
// El cuello acolchado y la lengüeta afuera: van encima del jeans
export function lengueta(lado) {
  const x0 = lado < 0 ? 234 : 372, s = -lado, X = (x) => x0 + s * x;
  let o = '';
  o += pieza(curva([[X(-34), 1080], [X(-6), 1076], [X(24), 1078], [X(50), 1082], [X(54), 1096], [X(22), 1094], [X(-8), 1094], [X(-36), 1096]], true), C.cuello, [], { w: 4.4, peso: 1 });
  o += pieza(curva([[X(-44), 1088], [X(-42), 1056], [X(-26), 1044], [X(-8), 1050], [X(-6), 1080], [X(-24), 1094]], true), C.trigo, [[pol([[X(-16), 1040], [X(0), 1040], [X(0), 1096], [X(-16), 1096]]), C.trigoS]], { w: 4.4, peso: 1 });
  o += L(`M${X(-36)} 1060 Q${X(-26)} 1054 ${X(-14)} 1060`, 1.8, C.trigoS);
  return o;
}

// ── Piernas: jeans oscuros y anchos que se acumulan en acordeón sobre las botas ──
function piernas() {
  let o = '';
  const izq = miembro([[258, 800], [244, 930], [236, 1010], [234, 1084]], [120, 104, 108, 130], { punta: 'plana' });
  const der = miembro([[342, 800], [362, 930], [370, 1010], [372, 1084]], [120, 104, 108, 130], { punta: 'plana' });
  o += pieza(izq, C.jean, [[pol([[268, 770], [330, 770], [304, 1100], [258, 1100], [264, 930]]), C.jeanS]]);
  o += pieza(der, C.jean, [[pol([[382, 770], [424, 770], [446, 1100], [398, 1100], [392, 930]]), C.jeanS]]);
  // Entrepierna baja y los pliegues que bajan de ella, con su brillo
  o += pincel([300, 872], [298, 888], [294, 902], [288, 914], 3);
  o += pincel([258, 884], [266, 902], [272, 918], [274, 934], 2.6) + pincel([346, 886], [342, 904], [340, 920], [342, 938], 2.6);
  o += L('M250 890 Q258 906 262 924', 2.4, C.jeanL) + L('M356 894 Q352 910 352 928', 2.4, C.jeanL);
  // Rodillas
  o += pincel([214, 952], [228, 960], [246, 960], [262, 952], 3) + pincel([346, 954], [360, 962], [378, 962], [394, 954], 3);
  // El acordeón sobre la bota: cada pliegue con su brillo encima
  for (const x of [234, 372]) {
    for (const [y, d] of [[996, 1], [1024, -1], [1050, 1]]) {
      o += L(`M${x - 52} ${y - 6 * d} Q${x - 10} ${y + 10 * d} ${x + 52} ${y - 4 * d}`, 3, C.jeanL);
      o += pincel([x - 54, y], [x - 20, y + 12 * d], [x + 18, y + 10 * d], [x + 54, y - 2 * d], 3);
    }
    o += L(`M${x - 60} 1074 Q${x} 1082 ${x + 62} 1072`, 2.4, C.jeanL);
  }
  return o;
}

// ── Rastas de atrás: cuelgan detrás de la cabeza y se enroscan sobre los hombros ──
function rastasAtras() {
  let o = '';
  o += rasta([[264, 214], [250, 280], [240, 350], [236, 440]], 22, 20, { rulo: false });
  o += rasta([[338, 212], [356, 280], [368, 350], [372, 440]], 22, 20, { rulo: false });
  o += rasta([[246, 214], [224, 270], [204, 330], [192, 380], [188, 404]], 24, 22, { giro: 1, radio: 15 });
  o += rasta([[354, 212], [378, 268], [400, 330], [412, 380], [416, 404]], 24, 22, { giro: -1, radio: 15 });
  // Las puntas del pañuelo, anudado atrás, caen detrás de la cabeza
  o += pieza('M404 232 C426 246 436 268 432 292 L420 286 C420 266 410 250 396 242 Z', C.panuelo, [], { w: 4.4, peso: 1 });
  o += pieza('M408 238 C430 258 446 274 448 300 L436 298 C432 278 418 262 400 250 Z', C.panuelo, [[pol([[430, 260], [452, 260], [452, 304], [432, 304]]), C.panueloS]], { w: 4.4, peso: 1 });
  return `<g transform="${CABEZA}">${o}</g>`;
}

// ── La chaqueta inflada: el cuello alto (con el forro cian por dentro) va detrás del cuello ──
function cuelloChaqueta() {
  let o = '';
  o += pieza(curva([[214, 496], [210, 458], [230, 428], [268, 414], [332, 414], [370, 428], [390, 458], [386, 496], [352, 480], [300, 472], [248, 480]], true), C.chaqueta, [[pol([[340, 400], [400, 400], [400, 500], [344, 500]]), C.chaquetaS]]);
  o += pieza(curva([[238, 476], [244, 444], [270, 428], [330, 428], [356, 444], [362, 476], [332, 466], [268, 466]], true), C.cian, [[pol([[322, 420], [370, 420], [370, 480], [326, 480]]), C.cianS]], { w: 4, peso: 0 });
  return o;
}

// ── Cuello sólido ──
function cuello() {
  let o = pieza(pol([[268, 372], [332, 372], [336, 480], [264, 480]]), C.piel, [[pol([[260, 364], [340, 364], [340, 420], [260, 428]]), C.pielS], [pol([[312, 400], [342, 400], [342, 484], [316, 484]]), C.pielS]]);
  o += L('M288 438 Q292 448 290 458', 2.2);
  return `<g transform="${LADEO}">${o}</g>`;
}

// ── La camiseta de básquetbol holgada: asoma entre la chaqueta abierta y bajo ella, con KILO en arco y el 5 ──
const CAMISETA = 'M222 470 L262 460 L296 516 L330 460 L374 468 C380 540 392 600 404 650 C408 720 412 800 414 868 Q300 888 186 868 C190 800 194 720 198 650 C210 600 220 540 222 470 Z';
function camiseta() {
  let o = '';
  // El cuello redondo de la polera de abajo asoma en la V
  o += pieza('M262 464 Q296 484 330 464 L326 478 Q296 500 266 478 Z', C.azulL, [], { w: 4, peso: 0 });
  o += pieza(CAMISETA, C.camiseta, [[pol([[356, 440], [430, 440], [430, 900], [370, 900], [384, 700]]), C.camisetaS]]);
  o += pincel([244, 862], [256, 846], [272, 840], [288, 842], 2.4) + pincel([334, 852], [348, 842], [364, 844], [376, 854], 2.4);
  // Ribete de la V: banda azul con su línea cian
  const ribete = (d) => B(d, 21) + B(d, 14, C.azul) + B(d, 3.2, C.cian);
  o += ribete('M262 462 L296 514 L330 462');
  // KILO en arco, letra por letra, y el 5: chicos y discretos (ronda 4), achicados juntos alrededor del 5
  let camiseta = '';
  const arco = { cx: 296, cy: 832, r: 190 };
  [['K', -12.4], ['I', -4.1], ['L', 4.1], ['O', 12.4]].forEach(([letra, a]) => {
    const t = (a * Math.PI) / 180, x = r1(arco.cx + arco.r * Math.sin(t)), y = r1(arco.cy - arco.r * Math.cos(t));
    const base = `x="${x}" y="${y}" text-anchor="middle" font-family="${NUMERO}" font-size="34" stroke-linejoin="round" transform="rotate(${a} ${x} ${y})"`;
    camiseta += `<text ${base} fill="none" stroke="${K}" stroke-width="9">${letra}</text><text ${base} fill="${C.azulL}" stroke="${C.cian}" stroke-width="3.6" paint-order="stroke">${letra}</text>`;
  });
  // El 5 grande, con contorno cian y la tinta por fuera
  const cinco = `x="296" y="826" text-anchor="middle" font-family="${NUMERO}" font-size="176" stroke-linejoin="round" transform="rotate(-2 296 760)"`;
  camiseta += `<text ${cinco} fill="none" stroke="${K}" stroke-width="11">5</text><text ${cinco} fill="${C.azulL}" stroke="${C.cian}" stroke-width="4.6" paint-order="stroke">5</text>`;
  o += numeroChico(camiseta, 296, 763);
  return o;
}

// ── La cadena de cordón trenzado: eslabones ovalados inclinados a lo largo de cada tramo ──
function bezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
}
export function cordon(p0, p1, p2, p3, n) {
  let fondo = '', eslabones = '';
  const d = `M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`;
  fondo += `<path d="${d}" fill="none" stroke="${K}" stroke-width="15" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.oroS}" stroke-width="8" stroke-linecap="round"/>`;
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = bezier(p0, p1, p2, p3, t), q = bezier(p0, p1, p2, p3, Math.min(1, t + 0.01)), a = bezier(p0, p1, p2, p3, Math.max(0, t - 0.01));
    const ang = (Math.atan2(q[1] - a[1], q[0] - a[0]) * 180) / Math.PI + 52;
    eslabones += `<g transform="translate(${r1(p[0])} ${r1(p[1])}) rotate(${r1(ang)})"><ellipse cx="0" cy="0" rx="6.4" ry="3.6" fill="${C.oro}" stroke="${C.oroS}" stroke-width="1.4"/><path d="M-4 -1.4 Q0 -3 4 -1.4" fill="none" stroke="${C.oroL}" stroke-width="1.4" stroke-linecap="round"/></g>`;
  }
  return { fondo, eslabones };
}
function cadena() {
  const izq = cordon([268, 466], [266, 506], [278, 534], [296, 552], 13);
  const der1 = cordon([332, 466], [338, 480], [344, 492], [350, 506], 6);
  const der2 = cordon([350, 506], [348, 526], [320, 544], [296, 552], 9);
  let o = izq.fondo + der1.fondo + der2.fondo + izq.eslabones + der1.eslabones + der2.eslabones;
  // La argolla y el «</>» grande, de oro macizo
  o += `<circle cx="296" cy="558" r="7" fill="none" stroke="${K}" stroke-width="8"/><circle cx="296" cy="558" r="7" fill="none" stroke="${C.oro}" stroke-width="3.6"/>`;
  o += `<g transform="translate(296 588) scale(1.22)">${codigo(C.oroS, 9.4, 2.6)}<g transform="translate(-0.9 -0.9)">${codigo(C.oro, 6.6)}</g><g transform="translate(-2 -2)">${codigo(C.oroL, 2)}</g></g>`;
  return o;
}

// ── La chaqueta abierta: dos mitades acolchadas en franjas, con la cinta cian del cierre en cada borde ──
const MITAD_IZQ = [[252, 470], [240, 522], [230, 592], [224, 662], [224, 722], [228, 764], [208, 770], [184, 764], [178, 742], [181, 716], [174, 690], [177, 664], [170, 638], [173, 612], [168, 590], [174, 540], [190, 506], [222, 480]];
const MITAD_DER = [[346, 468], [356, 522], [362, 592], [368, 662], [369, 722], [367, 766], [394, 772], [420, 766], [426, 744], [423, 718], [430, 692], [427, 666], [434, 640], [431, 614], [436, 590], [430, 538], [412, 504], [380, 478]];
function chaqueta() {
  let o = '';
  o += pieza(curva(MITAD_IZQ, true), C.chaqueta, [[pol([[218, 470], [262, 470], [252, 780], [214, 780]]), C.chaquetaS]]);
  o += pieza(curva(MITAD_DER, true), C.chaqueta, [[pol([[400, 470], [450, 470], [450, 790], [404, 790]]), C.chaquetaS]]);
  // Franjas del acolchado: la costura de cada franja y el brillo encima
  for (const y of [560, 612, 664, 716]) {
    o += pincel([226, y + 2], [210, y + 6], [194, y + 6], [176, y + 2], 2.6) + pincel([364, y + 2], [384, y + 7], [408, y + 7], [430, y + 1], 2.6);
    o += L(`M${226} ${y - 18} Q${206} ${y - 14} ${190} ${y - 18}`, 3.2, C.chaquetaL) + L(`M${372} ${y - 18} Q${388} ${y - 13} ${404} ${y - 16}`, 3.2, C.chaquetaL);
  }
  // La cinta cian del cierre en los dos bordes abiertos
  const borde = (pts, dx) => pol([...pts, ...pts.slice().reverse().map(([x, y]) => [x + dx, y])]);
  o += pieza(borde([[252, 474], [240, 522], [230, 592], [224, 662], [224, 722], [228, 760]], -8), C.cian, [], { w: 3.2, peso: 0 });
  o += pieza(borde([[346, 472], [356, 522], [362, 592], [368, 662], [369, 722], [367, 762]], 8), C.cian, [], { w: 3.2, peso: 0 });
  // Las puntas del cuello alto, por delante
  o += pieza(curva([[214, 496], [212, 462], [228, 436], [252, 432], [258, 470], [244, 490]], true), C.chaqueta, [[pol([[240, 420], [266, 420], [266, 500], [244, 500]]), C.chaquetaS]], { w: 5 });
  o += pieza(curva([[386, 496], [388, 462], [372, 436], [348, 432], [342, 470], [356, 490]], true), C.chaqueta, [[pol([[370, 420], [400, 420], [400, 500], [374, 500]]), C.chaquetaS]], { w: 5 });
  o += L('M226 452 Q236 444 248 444', 3, C.chaquetaL) + L('M372 448 Q362 442 352 444', 3, C.chaquetaL);
  return o;
}

// ── Brazo lejano: la manga inflada cuelga y la mano sostiene la taza «</>» por el asa, con un anillo ──
function brazoTaza() {
  let o = '';
  const m = inflado([154, 708], [168, 600], [194, 500], 62, 84, 3);
  o += pieza(m.d, C.chaqueta, [[pol([[184, 480], [252, 480], [196, 730], [172, 730]]), C.chaquetaS]]) + acolchado(m.pts, m.anchos);
  // Puño elástico con el forro cian
  o += pieza(pol([[126, 694], [182, 696], [180, 718], [128, 716]]), C.chaquetaS, [], { w: 4.4, peso: 1 }) + L('M130 697 L180 699', 2.4, C.cian);
  return o;
}
// La taza y la mano que la sostiene (van delante de la chaqueta)
function taza() {
  let o = '';
  // La taza: asa, cuerpo con su sombra, el café y el «</>»
  o += pieza('M146 730 C180 724 182 790 146 786 L146 774 C166 776 166 740 146 742 Z', C.taza, [[pol([[160, 720], [190, 720], [190, 796], [162, 796]]), C.tazaS]], { w: 4.2, peso: 1 });
  o += pieza('M82 724 L148 724 L146 784 Q146 794 136 794 L94 794 Q84 794 84 784 Z', C.taza, [[pol([[124, 716], [156, 716], [156, 800], [128, 800]]), C.tazaS]], { w: 5, peso: 1.4 });
  o += pieza('M82 724 Q115 715 148 724 Q115 733 82 724 Z', C.cafe, [], { w: 3.4, peso: 0 });
  o += `<g transform="translate(114 761) scale(0.66)">${codigo(C.azul, 7)}</g>`;
  // La mano: el dorso, tres dedos que abrazan el asa (uno con anillo) y el pulgar encima
  o += pieza(curva([[142, 710], [184, 710], [196, 726], [192, 750], [172, 758], [156, 744]], true), C.piel, [[pol([[176, 702], [204, 702], [204, 762], [178, 762]]), C.pielS]], { w: 5, peso: 1.6 });
  for (let i = 0; i < 3; i++) {
    const y = 740 + i * 12;
    o += pieza(curva([[178, y], [152, y - 1], [142, y + 6], [148, y + 13], [178, y + 12]], true), C.piel, [[pol([[166, y - 4], [186, y - 4], [186, y + 18], [168, y + 18]]), C.pielS]], { w: 3.6, peso: 0.8 });
  }
  o += pieza(pol([[160, 751], [167, 751], [167, 764], [160, 764]]), C.oro, [], { w: 2.2, peso: 0 });
  o += pieza(curva([[172, 722], [148, 718], [138, 726], [148, 734], [174, 734]], true), C.piel, [[pol([[160, 714], [180, 714], [180, 738], [160, 738]]), C.pielS]], { w: 3.6, peso: 0.8 });
  return o;
}

// El vapor del café sube enroscado, como sus rastas
function vapor() {
  let o = '';
  for (const d of ['M100 714 C88 694 114 682 104 662 C96 646 112 634 104 616', 'M124 710 C136 692 112 678 126 658 C134 644 122 632 128 620']) {
    o += `<path d="${d}" fill="none" stroke="${C.vapor}" stroke-width="4" stroke-linecap="round" opacity=".75"/>`;
  }
  return o;
}

// ── Brazo cercano: el codo afuera y la mano agarrada a la cadena, con dos anillos ──
function brazoCadena() {
  let o = '';
  // Del hombro al codo: la manga inflada baja hacia afuera
  const arriba = inflado([454, 624], [446, 560], [414, 500], 70, 86, 2);
  o += pieza(arriba.d, C.chaqueta, [[pol([[430, 480], [490, 480], [490, 650], [448, 650]]), C.chaquetaS]]) + acolchado(arriba.pts, arriba.anchos);
  // Del codo a la muñeca: el antebrazo sube en diagonal hacia el pecho
  const ante = inflado([392, 556], [422, 584], [458, 628], 60, 72, 2);
  o += pieza(ante.d, C.chaqueta, [[pol([[404, 604], [484, 604], [484, 664], [424, 664]]), C.chaquetaS]]) + acolchado(ante.pts, ante.anchos);
  // La muñeca y el puño elástico, atravesado, con el forro cian asomando
  o += pieza(miembro([[372, 526], [390, 548]], [30, 32], { punta: 'plana' }), C.piel, [[pol([[384, 520], [404, 520], [404, 556], [388, 556]]), C.pielS]], { w: 4.4, peso: 1 });
  o += `<g transform="translate(392 552) rotate(-40)">` + pieza(pol([[-31, -11], [31, -11], [31, 11], [-31, 11]]), C.chaquetaS, [], { w: 4.4, peso: 1 }) + L('M-29 -8 L29 -8', 2.4, C.cian) + `</g>`;
  // El puño cerrado sobre la cadena: el dorso, cuatro dedos que la abrazan (dos con anillo) y el pulgar encima
  let m = '';
  m += pieza(curva([[-4, -26], [20, -28], [32, -14], [32, 12], [20, 28], [-2, 28], [-10, 10]], true), C.piel, [[pol([[16, -36], [40, -36], [40, 36], [18, 36]]), C.pielS]], { w: 5, peso: 1.6 });
  for (let i = 0; i < 4; i++) {
    const y = -24 + i * 12.5;
    m += pieza(curva([[2, y], [-20, y - 1], [-29, y + 6], [-23, y + 12], [2, y + 11]], true), C.piel, [[pol([[-8, y - 4], [6, y - 4], [6, y + 16], [-8, y + 16]]), C.pielS]], { w: 3.6, peso: 0.8 });
    if (i === 1 || i === 2) m += pieza(pol([[-14, y + 0.5], [-8, y + 0.5], [-8, y + 11], [-14, y + 11]]), C.oro, [], { w: 2.2, peso: 0 });
  }
  m += pieza(curva([[12, -32], [-12, -36], [-24, -30], [-16, -22], [8, -20]], true), C.piel, [[pol([[2, -40], [16, -40], [16, -16], [2, -16]]), C.pielS]], { w: 3.8, peso: 0.8 });
  o += `<g transform="translate(352 512) rotate(-8)">${m}</g>`;
  return o;
}

// ── Cabeza: mandíbula cuadrada, barba corta, la mirada pesada y seria, el pañuelo de cintillo y el moño de rastas ──
function cabeza() {
  let o = '';
  // Cara en tres cuartos: la mejilla lejana se recoge y deja salir la punta de la nariz
  const cara = curva([[218, 252], [228, 208], [262, 184], [308, 178], [354, 188], [386, 216], [398, 258], [398, 306], [388, 346], [364, 374], [326, 392], [288, 394], [256, 382], [238, 358], [228, 322]], true);
  o += pieza(cara, C.piel, [[pol([[354, 226], [414, 226], [414, 400], [336, 400], [366, 318]]), C.pielS]]);
  // Barba corta: la mandíbula y el mentón, con la línea de la mejilla bien recortada y el bigote delgado
  const barba = pol([[398, 262], [398, 306], [388, 346], [364, 374], [326, 392], [288, 394], [256, 382], [238, 358], [228, 322], [232, 330], [238, 344], [248, 356], [258, 354], [270, 351], [286, 349], [304, 349], [320, 352], [332, 357], [346, 358], [366, 349], [384, 330], [393, 300], [392, 264]]);
  o += pieza(barba, C.barba, [[pol([[350, 250], [420, 250], [420, 400], [330, 400]]), C.barbaS]], { w: 4.6 });
  // Boca seria: una línea recta, el labio de abajo apenas asoma bajo el bigote
  o += pieza('M272 361 L304 359 Q300 368 288 369 Q277 369 272 361 Z', C.labio, [[pol([[292, 354], [312, 354], [312, 374], [294, 374]]), C.labioS]], { w: 3, peso: 0 });
  o += L('M264 360 L304 358 Q310 359 314 363', 3.8);
  // Ojos de párpado muy pesado: la mirada baja desde arriba, seria
  for (const [x, y, w, h] of [[250, 280, 26, 14], [324, 276, 38, 19]]) {
    o += pieza(`M${x - w / 2} ${y} Q${x} ${y - h} ${x + w / 2} ${y} Q${x} ${y + h * 0.8} ${x - w / 2} ${y} Z`, C.blanco, [], { w: 3.6, peso: 0 });
    o += `<circle cx="${r1(x + w * 0.04)}" cy="${r1(y + 2.6)}" r="${r1(h * 0.33)}" fill="${K}"/>`;
    o += negro(`M${x - w / 2 - 3} ${y - 1} Q${x} ${y - h - 6} ${x + w / 2 + 4} ${y - 2} L${x + w / 2 + 2} ${r1(y + h * 0.06)} Q${x} ${r1(y - h * 0.16)} ${x - w / 2} ${y + 1} Z`);
  }
  o += L('M306 294 Q324 300 342 293', 2.2) + L('M242 294 Q250 298 260 294', 2);
  // Nariz ancha y corta, de punta redonda: sólo su borde de afuera lleva tinta (ronda 3: más chica, desde el puente)
  let nariz = P(pol([[266, 296], [278, 306], [288, 326], [284, 346], [250, 350], [230, 346], [224, 334], [232, 320], [250, 310]]), C.piel);
  nariz += P(pol([[270, 300], [290, 326], [286, 346], [278, 346], [282, 326]]), C.pielS) + P(pol([[228, 340], [254, 344], [284, 343], [286, 350], [252, 352], [232, 350]]), C.pielS);
  nariz += B('M266 298 Q256 312 240 320 Q224 328 226 340 Q230 350 246 349', 4.8);
  nariz += negro('M236 345 Q246 339 258 343 Q252 350 240 350 Z');
  nariz += L('M262 350 Q288 352 288 335 Q288 320 274 318', 2.8);
  o += achicar(nariz, 262, 296, 0.74);
  // Cejas gruesas, bajas y rectas (la cercana con su raya rapada)
  o += negro(pol([[232, 258], [262, 258], [268, 268], [236, 266]]));
  o += negro(pol([[296, 266], [324, 254], [327, 264], [300, 274]])) + negro(pol([[332, 252], [356, 250], [358, 260], [335, 262]]));
  // El pelo recogido: las rastas suben desde la frente y se juntan en la cinta
  const casco = curva([[216, 270], [210, 226], [226, 188], [258, 164], [300, 156], [344, 164], [384, 188], [406, 226], [410, 266], [402, 300], [392, 260], [376, 224], [350, 202], [316, 192], [280, 194], [250, 204], [228, 226], [220, 252]], true);
  o += pieza(casco, C.rasta, [[pol([[340, 156], [420, 170], [420, 310], [380, 310], [360, 200]]), C.rastaS]]);
  for (const [a, b, c, d] of [[[264, 200], [272, 186], [284, 172], [294, 162]], [[298, 194], [299, 180], [300, 170], [301, 160]], [[332, 196], [326, 182], [318, 172], [308, 162]], [[364, 210], [352, 192], [336, 178], [318, 166]]]) o += pincel(a, b, c, d, 3);
  for (const [a, b] of [[[270, 194], [284, 172]], [[304, 190], [304, 168]], [[340, 198], [326, 176]]]) o += L(`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, 3.4, C.rastaL);
  // Las rastas de adelante: la del lado cercano cae detrás de la oreja; la lejana enmarca la cara y se enrosca
  o += rasta([[398, 230], [408, 274], [414, 320], [416, 360]], 20, 19, { giro: -1, radio: 14 });
  o += rasta([[226, 226], [212, 268], [204, 318], [206, 362]], 20, 19, { giro: 1, radio: 14 });
  // El pañuelo azul marino de cintillo, con su dibujo blanco, bajo el moño
  const panuelo = 'M212 244 Q228 210 262 198 Q300 186 342 194 Q384 204 410 236 L414 262 Q388 230 344 220 Q300 212 262 224 Q232 236 218 268 Z';
  o += pieza(panuelo, C.panuelo, [[pol([[360, 180], [430, 200], [430, 280], [370, 240]]), C.panueloS]], { w: 4.6, peso: 1.2 });
  o += L('M220 248 Q234 222 264 211 Q300 200 342 207 Q380 215 404 240', 1.6, C.blanco) + L('M220 262 Q236 238 264 230', 1.2, C.blanco);
  for (const [x, y, a] of [[244, 228, -40], [276, 214, -18], [308, 210, 4], [338, 214, 22], [368, 224, 36], [392, 240, 48]]) {
    o += `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-5 2 Q-6 -5 0 -6 Q5 -6 4 -1 Q2 3 -1 1 Q-3 0 -1 -2" fill="none" stroke="${C.blanco}" stroke-width="1.6" stroke-linecap="round"/><circle cx="7" cy="3" r="1.3" fill="${C.blanco}"/></g>`;
  }
  // El nudo del pañuelo, atrás
  o += pieza(curva([[398, 236], [412, 228], [422, 240], [414, 254], [400, 250]], true), C.panuelo, [[pol([[410, 220], [430, 220], [430, 260], [412, 260]]), C.panueloS]], { w: 4.4, peso: 1 });
  // Oreja (a la derecha del cuadro) con un aro dorado chico
  o += pieza(curva([[388, 266], [410, 256], [424, 282], [418, 314], [394, 322]], true), C.piel, [[pol([[404, 248], [432, 248], [432, 328], [408, 328]]), C.pielS]], { w: 5, peso: 1.6 });
  o += L('M400 274 Q414 288 406 306', 2.6);
  o += `<circle cx="409" cy="320" r="4.8" fill="${C.oro}" stroke="${K}" stroke-width="2.4"/>`;
  // El moño alto: rastas enrolladas sobre la cinta, con dos puntas que se enroscan como tentáculos
  o += rasta([[264, 108], [248, 94], [232, 86], [220, 92]], 20, 17, { giro: -1, radio: 13, segmentos: false });
  o += rasta([[332, 100], [350, 80], [358, 60], [356, 46]], 20, 17, { giro: -1, radio: 13, segmentos: false });
  o += rasta([[288, 154], [258, 140], [248, 114], [262, 92], [292, 84]], 26, 24, { rulo: false });
  o += rasta([[312, 154], [344, 140], [354, 112], [340, 90], [310, 84]], 26, 24, { rulo: false });
  o += rasta([[296, 156], [284, 132], [292, 108], [318, 102], [334, 120], [324, 142]], 26, 24, { rulo: false });
  // La cinta cian que amarra el moño
  o += pieza(curva([[270, 152], [300, 146], [330, 152], [332, 170], [300, 176], [268, 170]], true), C.cian, [[pol([[314, 140], [344, 140], [344, 182], [318, 182]]), C.cianS], [pol([[262, 140], [300, 136], [300, 152], [262, 156]]), C.cianL]], { w: 4.6, peso: 1.2 });
  return `<g transform="${CABEZA}">${o}</g>`;
}

export function bucle({ prefijo = 'bucle' } = {}) {
  reiniciar(prefijo);
  const tronco = `${rastasAtras()}${brazoTaza()}${cuelloChaqueta()}${cuello()}${camiseta()}${cadena()}${chaqueta()}${taza()}${brazoCadena()}${cabeza()}${vapor()}`;
  return `<g>${bota(-1)}${bota(1)}${piernas()}${lengueta(-1)}${lengueta(1)}<g transform="${ATRAS}">${tronco}</g></g>`;
}

export const vista = () => lamina(bucle());
