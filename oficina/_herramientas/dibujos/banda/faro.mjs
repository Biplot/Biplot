// Faro en la línea de la banda: el que se queda hasta que se usa. Sesenta y tantos, macizo y con algo de guatita (ronda
// 3: «gordo, pero no tanto»: la cintura un 20 % más angosta y la guata sale la mitad), piernas cortas: el cálido del
// equipo. Barba blanca esponjosa y cejas blancas, nariz y mejillas coloradas, el gorro marinero, el suéter a rayas de
// faro estirado sobre la guata con su número (el 7 de su placa E7) en la franja ancha del pecho, el chaquetón azul
// abierto, el farol cian encendido en una mano y el MANUAL bajo el otro brazo. Un audífono chico en la oreja que se ve.
// Marco 600 × 1260, suelo en y = 1240, mira a la izquierda.
import { K, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, nuevoId, r1, numeroChico } from './base.mjs';
import { NUMERO, LETRA, lamina } from './tinta.mjs';

export const C = {
  piel: '#F2CDB0', pielS: '#D6A585', pielL: '#FBE2CD', colorado: '#E3897A', nariz: '#EDA592', narizS: '#D3846F', narizL: '#F9CFC2',
  barba: '#F2F5F8', barbaS: '#BAC6D3', barbaL: '#FFFFFF',
  gorro: '#1F3D63', gorroS: '#132944', gorroL: '#30598A',
  crema: '#F2EBDB', cremaS: '#CDBFA2', marino: '#172C4D', marinoS: '#0D1B30',
  chaq: '#2B5285', chaqS: '#1C3A62', chaqL: '#3F6CA3', boton: '#C3CDD8', botonS: '#8E99A6',
  pant: '#2B2F38', pantS: '#1C1F26', pantL: '#3E4350',
  bota: '#4C3226', botaS: '#301E15', botaL: '#6E4C38', suela: '#1E1B19', vira: '#7E6048', viraS: '#523C2C', elastico: '#2E3239', elasticoS: '#1F2227', media: '#EDE6D3', mediaS: '#C9BFA5',
  fierro: '#3A4452', fierroS: '#262D38', fierroL: '#5C6878', cian: '#17C3B2', cianL: '#7FD8CF', cianS: '#0A8A7E', luz: '#E8FFFB',
  tapa: '#35679A', tapaS: '#24496F', tapaL: '#4F7FB5', hojas: '#F4ECD8', hojasS: '#D8CDB2',
  audifono: '#CBD2DA', audifonoS: '#97A2AE'
};

// Una forma esponjosa: cada tramo del contorno (recorrido en el sentido del reloj) se infla hacia afuera
export function nube(pts, inflar = 0.25) {
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dy = b[1] - a[1];
    const k = (a[2] ?? inflar);
    d += ` Q${r1((a[0] + b[0]) / 2 + dy * k)} ${r1((a[1] + b[1]) / 2 - dx * k)} ${r1(b[0])} ${r1(b[1])}`;
  }
  return d + ' Z';
}

// ── Botas grandes de cuero sin cordones: punta redonda, elástico al costado, tirador atrás y la media de lana doblada ──
export function bota(lado) {
  // lado -1: la de la izquierda del cuadro (punta hacia la izquierda); +1: la de la derecha
  const x0 = lado < 0 ? 240 : 360, s = -lado, X = (x) => x0 + s * x;
  let o = '';
  // La suela y la vira cosida
  o += pieza(pol([[X(-112), 1216], [X(46), 1216], [X(50), 1240], [X(-116), 1240]]), C.suela, [], { w: 5.5 });
  o += pieza(pol([[X(-116), 1202], [X(48), 1202], [X(50), 1218], [X(-118), 1218]]), C.vira, [[pol([[X(10), 1196], [X(56), 1196], [X(56), 1222], [X(12), 1222]]), C.viraS]], { w: 4, peso: 0 });
  o += `<path d="M${X(-110)} 1210 L${X(44)} 1210" fill="none" stroke="${C.viraS}" stroke-width="1.8" stroke-dasharray="4 3"/>`;
  // El cuero: caña ancha y punta redonda, bulbosa
  const cuero = curva([[X(-36), 1114], [X(40), 1112], [X(46), 1158], [X(46), 1202], [X(-60), 1204], [X(-114), 1202], [X(-120), 1178], [X(-106), 1156], [X(-76), 1148], [X(-46), 1142]], true);
  o += pieza(cuero, C.bota, [[pol([[X(10), 1104], [X(54), 1104], [X(54), 1208], [X(16), 1208]]), C.botaS], [pol([[X(-124), 1188], [X(-60), 1186], [X(-60), 1208], [X(-124), 1208]]), C.botaS], ]);
  o += L(`M${X(-110)} 1174 Q${X(-96)} 1158 ${X(-74)} 1154`, 4, C.botaL);
  // La puntera cosida
  o += L(`M${X(-114)} 1184 Q${X(-90)} 1166 ${X(-62)} 1176`, 3) + `<path d="M${X(-108)} 1192 Q${X(-88)} 1176 ${X(-64)} 1184" fill="none" stroke="${C.botaL}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
  // El elástico del costado, acanalado
  const elastico = curva([[X(-24), 1124], [X(14), 1122], [X(12), 1148], [X(-5), 1174], [X(-22), 1152]], true);
  o += pieza(elastico, C.elastico, [[pol([[X(0), 1118], [X(20), 1118], [X(20), 1178], [X(2), 1178]]), C.elasticoS]], { w: 3.4, peso: 0 });
  for (let i = 0; i < 4; i++) o += L(`M${X(-16 + i * 8)} 1130 L${X(-13 + i * 6)} ${1152 + (i === 1 || i === 2 ? 10 : 0)}`, 1.4, '#4A4F58');
  // La media de lana, doblada sobre la caña
  const media = curva([[X(-42), 1100], [X(42), 1096], [X(50), 1112], [X(44), 1128], [X(-40), 1132], [X(-48), 1116]], true);
  o += pieza(media, C.media, [[pol([[X(10), 1090], [X(56), 1090], [X(56), 1136], [X(14), 1136]]), C.mediaS]], { w: 4.6, peso: 1.2 });
  for (let i = 0; i < 5; i++) o += L(`M${X(-30 + i * 16)} 1105 L${X(-30 + i * 16)} 1127`, 1.6, C.mediaS);
  return o;
}

// ── Piernas cortas y firmes, en pantalón oscuro ──
export function piernas() {
  let o = '';
  const izq = miembro([[250, 930], [242, 1036], [240, 1100]], [106, 94, 92], { punta: 'plana' });
  const der = miembro([[350, 930], [358, 1036], [360, 1100]], [106, 94, 92], { punta: 'plana' });
  o += pieza(izq, C.pant, [[pol([[262, 910], [312, 910], [292, 1124], [258, 1124]]), C.pantS]]);
  o += pieza(der, C.pant, [[pol([[372, 910], [420, 910], [420, 1124], [382, 1124]]), C.pantS]]);
  o += pieza(pol([[190, 930], [410, 930], [416, 980], [300, 1000], [184, 980]]), C.pant, [[pol([[330, 922], [424, 922], [424, 1004], [330, 1004]]), C.pantS]], { peso: 0 });
  // Arrugas de la entrepierna y de las rodillas, y el pantalón que se arruga sobre la media
  o += pincel([300, 992], [296, 1012], [292, 1026], [288, 1040], 3);
  o += pincel([206, 1046], [222, 1054], [240, 1054], [256, 1046], 2.8) + pincel([344, 1048], [360, 1056], [378, 1056], [394, 1046], 2.8);
  for (const x of [240, 360]) o += pincel([x - 38, 1076], [x - 16, 1086], [x + 8, 1082], [x + 26, 1072], 2.8);
  return o;
}

// ── El brazo del farol (el lejano): baja junto a la guata y el antebrazo va hacia adelante, como el de un sereno ──
function brazoFarol() {
  let o = '';
  // El brazo baja junto a la guata hasta el codo
  const brazo = curva([[152, 624], [181, 608], [206, 624], [214, 690], [206, 744], [188, 776], [158, 780], [142, 752], [140, 690]], true);
  o += pieza(brazo, C.chaq, [[pol([[188, 600], [238, 600], [238, 790], [180, 790], [196, 700]]), C.chaqS], [pol([[132, 610], [158, 610], [154, 760], [132, 760]]), C.chaqL]]);
  o += pincel([152, 690], [150, 712], [154, 732], [162, 748], 2.4);
  // El antebrazo, hacia adelante (a la izquierda), casi horizontal
  const ante = miembro([[100, 738], [176, 752]], [56, 64], { punta: 'redonda' });
  o += pieza(ante, C.chaq, [[pol([[96, 748], [210, 754], [210, 792], [96, 792]]), C.chaqS]]);
  o += pincel([126, 726], [140, 722], [156, 724], [170, 730], 2.2) + pincel([158, 764], [168, 770], [180, 770], [190, 764], 2.2);
  return o;
}

// El farol de tormenta, en coordenadas propias: el asa arriba (en el puño) y el farol colgando
function farol() {
  let o = '';
  // El asa de alambre
  const asa = 'M-30 58 C-34 20 -14 2 0 2 C14 2 34 20 30 58';
  o += `<path d="${asa}" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="${asa}" fill="none" stroke="${C.fierroL}" stroke-width="3" stroke-linecap="round"/>`;
  // Los tubos laterales del aire
  for (const x of [-30, 30]) o += pieza(pol([[x - 4, 54], [x + 4, 54], [x + 4, 132], [x - 4, 132]]), C.fierro, [[pol([[x, 50], [x + 6, 50], [x + 6, 136], [x, 136]]), C.fierroS]], { w: 3, peso: 0 });
  // El vidrio encendido: la llama blanca adentro
  const vidrio = curva([[-18, 62], [18, 62], [26, 92], [20, 122], [-20, 122], [-26, 92]], true);
  o += pieza(vidrio, C.cianL, [[pol([[6, 56], [30, 56], [30, 128], [8, 128]]), C.cian]], { w: 4.4, peso: 0 });
  o += P('M0 74 C9 86 10 100 0 108 C-10 100 -9 86 0 74 Z', C.luz) + P('M0 86 C4 92 4 99 0 103 C-4 99 -4 92 0 86 Z', '#FFFFFF');
  o += L('M-14 70 Q-20 86 -16 104', 2.6, '#FFFFFF');
  // Las varillas que protegen el vidrio
  o += L('M-10 62 Q-14 92 -10 122 M10 62 Q14 92 10 122', 2.6, C.fierroS) + L('M-25 92 L25 92', 2.6, C.fierroS);
  // El sombrero de arriba, con su chimenea, y el anillo
  o += pieza(pol([[-24, 50], [24, 50], [32, 62], [-32, 62]]), C.fierro, [[pol([[6, 46], [36, 46], [36, 66], [10, 66]]), C.fierroS]], { w: 4, peso: 1 });
  o += pieza(pol([[-12, 34], [12, 34], [20, 50], [-20, 50]]), C.fierro, [[pol([[2, 30], [24, 30], [24, 52], [4, 52]]), C.fierroS], [pol([[-20, 30], [-8, 30], [-12, 52], [-22, 52]]), C.fierroL]], { w: 4, peso: 1 });
  o += pieza(pol([[-6, 24], [6, 24], [8, 34], [-8, 34]]), C.fierro, [], { w: 3.4, peso: 0 });
  // El estanque de abajo
  o += pieza(pol([[-30, 120], [30, 120], [32, 128], [-32, 128]]), C.fierro, [], { w: 3.6, peso: 0 });
  const base = curva([[-32, 128], [32, 128], [38, 140], [32, 154], [-32, 154], [-38, 140]], true);
  o += pieza(base, C.fierro, [[pol([[8, 124], [44, 124], [44, 160], [12, 160]]), C.fierroS], [pol([[-40, 124], [-20, 124], [-26, 140], [-40, 140]]), C.fierroL]], { w: 4.4, peso: 1.2 });
  o += L('M-30 141 L30 141', 1.8, C.fierroS);
  return o;
}

// El puño que sostiene el asa, en coordenadas propias (el asa entra por abajo, en el origen): el dorso, los cuatro
// dedos recogidos alrededor del alambre, la línea de los nudillos y el pulgar encima
function punoFarol() {
  let m = '';
  m += pieza(curva([[-26, 0], [-29, -22], [-20, -40], [2, -46], [22, -40], [31, -22], [29, 0], [14, 9], [-12, 9]], true), C.piel, [[pol([[12, -50], [36, -50], [36, 12], [14, 12]]), C.pielS]], { w: 4.6, peso: 1.4 });
  for (let i = 0; i < 4; i++) {
    const x = -20 + i * 12.5;
    m += pieza(curva([[x - 6, -14], [x + 6, -15], [x + 7, 2], [x + 1, 9], [x - 6, 4]], true), C.piel, [[pol([[x + 2, -18], [x + 10, -18], [x + 10, 12], [x + 3, 12]]), C.pielS]], { w: 3, peso: 0.5 });
  }
  m += L('M-26 -16 Q0 -22 30 -16', 2.4);
  // El pulgar, por encima, que apunta hacia adelante
  m += pieza(curva([[26, -34], [10, -46], [-12, -50], [-24, -44], [-18, -36], [0, -34], [16, -28]], true), C.piel, [[pol([[-28, -40], [30, -36], [30, -26], [-28, -32]]), C.pielS]], { w: 3.8, peso: 0.8 });
  m += L('M-20 -44 Q-17 -40 -20 -37', 1.6, C.pielS);
  return m;
}

// El halo del farol: la luz cian que baña lo que tiene cerca (una elipse, para que no se salga del marco)
function halo(cx, cy, rx, ry) {
  const id = nuevoId();
  return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${C.cianL}" stop-opacity=".75"/><stop offset=".5" stop-color="${C.cian}" stop-opacity=".28"/><stop offset="1" stop-color="${C.cian}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`;
}

// ── El chaquetón: el delantero lejano queda detrás de la guata ──
// Ronda 3: los dos delanteros cuelgan más rectos y más juntos, siguiendo la guata más chica
const DEL_LEJOS = curva([[224, 598], [196, 616], [152, 632], [152, 720], [161, 836], [157, 922], [158, 966], [206, 972], [222, 940], [208, 860], [198, 760], [202, 680], [224, 632]], true);
const DEL_CERCA = curva([[378, 598], [422, 604], [440, 632], [443, 720], [446, 830], [444, 920], [437, 966], [388, 974], [374, 958], [378, 880], [380, 800], [376, 720], [376, 660]], true);
function chaquetonAtras() {
  let o = '';
  o += pieza(DEL_LEJOS, C.chaq, [[pol([[140, 600], [170, 600], [162, 980], [132, 980]]), C.chaqL], [pol([[188, 640], [240, 600], [240, 980], [194, 980]]), C.chaqS]]);
  // La solapa lejana, ancha
  o += pieza(pol([[220, 604], [198, 698], [172, 668], [164, 636], [186, 616]]), C.chaq, [[pol([[186, 600], [226, 600], [202, 704]]), C.chaqS]], { w: 4.6, peso: 1.2 });
  return o;
}

// ── El suéter a rayas de faro, estirado sobre la guata, con el 7 en la franja ancha del pecho ──
// Ronda 3: la guata sale la mitad hacia adelante y la cintura es un 20 % más angosta; el suéter sigue tirante
const BARRIGA = curva([[199, 609], [300, 610], [408, 600], [420, 660], [424, 760], [422, 860], [412, 928], [370, 961], [300, 976], [238, 973], [192, 952], [162, 910], [151, 852], [157, 792], [170, 730], [184, 668]], true);
// Una raya entre dos alturas, combada hacia abajo sobre la guata (la panza mira a la izquierda): menos guata, menos comba
const RX = [110, 252, 470];
const comba = (y) => Math.max(0, Math.min(22, (y - 700) * 0.13));
const raya = (y0, y1) => `M${RX[0]} ${y0} Q${RX[1]} ${r1(y0 + 2 * comba(y0))} ${RX[2]} ${y0 - 8} L${RX[2]} ${y1 - 8} Q${RX[1]} ${r1(y1 + 2 * comba(y1))} ${RX[0]} ${y1} Z`;
// La altura del borde de arriba de una raya en x (para que el acanalado del elástico siga la comba)
function bordeRaya(y0, x) {
  const a = RX[0] - 2 * RX[1] + RX[2], b = 2 * (RX[1] - RX[0]), c = RX[0] - x;
  const t = Math.abs(a) < 1e-6 ? -c / b : (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  return (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * (y0 + 2 * comba(y0)) + t * t * (y0 - 8);
}
function sueter() {
  let o = '';
  const id = nuevoId(), idS = nuevoId();
  const sombra = curva([[358, 590], [376, 700], [368, 820], [352, 892], [306, 936], [244, 948], [188, 932], [152, 900], [130, 1000], [460, 1000], [460, 590]], true);
  o += `<clipPath id="${id}"><path d="${BARRIGA}"/></clipPath><clipPath id="${idS}"><path d="${sombra}"/></clipPath>`;
  o += P(BARRIGA, K, ` transform="translate(2.4 2.8)" stroke="${K}" stroke-width="6" stroke-linejoin="round"`);
  // Las rayas: crema y azul marino; la franja ancha del pecho, crema
  const franjas = [[560, 600], [628, 664], [790, 818], [846, 874], [902, 930]];
  const pintar = (crema, marino) => P(BARRIGA, crema) + franjas.map(([a, b]) => P(raya(a, b), marino)).join('');
  o += `<g clip-path="url(#${id})">${pintar(C.crema, C.marino)}<g clip-path="url(#${idS})">${pintar(C.cremaS, C.marinoS)}</g>`;
  // El elástico del borde, acanalado
  o += P(raya(944, 990), C.marino) + `<g clip-path="url(#${idS})">${P(raya(944, 990), C.marinoS)}</g>`;
  for (let x = 160; x < 430; x += 12) o += L(`M${x} ${r1(bordeRaya(944, x) + 2)} L${x} 990`, 1.6, '#2A4570');
  o += `</g>`;
  o += B(BARRIGA, 6);
  // El número de su placa en la franja del pecho
  o += numeroChico(`<text x="268" y="786" text-anchor="middle" font-family="${NUMERO}" font-size="130" fill="${C.marino}" stroke="${K}" stroke-width="5" paint-order="stroke" transform="rotate(4 268 730)">7</text>`, 268, 739);
  // El suéter tironeado: pliegues que salen de la guata
  o += pincel([180, 838], [196, 848], [212, 848], [226, 842], 2.4) + pincel([360, 900], [350, 914], [346, 930], [350, 944], 2.2);
  o += pincel([284, 900], [300, 906], [320, 906], [338, 898], 2.2);
  return o;
}

// ── El delantero cercano, con la solapa, la doble botonadura y el bolsillo ──
function chaquetonAdelante() {
  let o = '';
  o += pieza(DEL_CERCA, C.chaq, [[pol([[410, 600], [470, 600], [470, 980], [416, 980], [426, 760]]), C.chaqS], [pol([[368, 640], [388, 640], [386, 980], [372, 980]]), C.chaqL]]);
  o += pieza(pol([[378, 602], [376, 662], [376, 726], [408, 668], [424, 636], [402, 614]]), C.chaqL, [[pol([[394, 640], [434, 640], [378, 734]]), C.chaq]], { w: 4.6, peso: 1.2 });
  for (const [x, y] of [[394, 860], [428, 856], [394, 920], [428, 916]]) o += `<circle cx="${x}" cy="${y}" r="7.5" fill="${C.boton}" stroke="${K}" stroke-width="2.8"/><circle cx="${x + 1.5}" cy="${y + 1.5}" r="3" fill="${C.botonS}"/>`;
  o += L('M378 960 L440 952', 2, C.chaqS);
  // Los botones del delantero lejano, que asoman bajo la guata
  for (const [x, y] of [[172, 928], [192, 942]]) o += `<circle cx="${x}" cy="${y}" r="6.5" fill="${C.boton}" stroke="${K}" stroke-width="2.6"/>`;
  return o;
}

// ── Cabeza: cara redonda, nariz y mejillas coloradas, ojos que sonríen, barba de nube y el gorro marinero ──
function cabeza() {
  let o = '';
  const cara = curva([[206, 420], [216, 378], [254, 352], [310, 348], [362, 364], [392, 402], [398, 452], [388, 502], [354, 532], [300, 542], [246, 532], [214, 498], [204, 460]], true);
  o += pieza(cara, C.piel, [[pol([[352, 380], [420, 380], [420, 560], [340, 560], [368, 470]]), C.pielS]]);
  // Mejillas coloradas
  o += `<ellipse cx="324" cy="462" rx="24" ry="15" fill="${C.colorado}" opacity=".6"/><ellipse cx="246" cy="464" rx="14" ry="10" fill="${C.colorado}" opacity=".55"/>`;
  // La oreja (a la derecha del cuadro) y el audífono chico detrás
  o += pieza(curva([[388, 420], [408, 410], [420, 432], [414, 462], [392, 470]], true), C.piel, [[pol([[404, 404], [426, 404], [426, 474], [406, 474]]), C.pielS]], { w: 4.6, peso: 1.4 });
  o += L('M404 424 Q414 440 404 456', 2.4);
  o += pieza(curva([[414, 408], [424, 412], [428, 432], [422, 446], [416, 440], [418, 424]], true), C.audifono, [[pol([[420, 404], [432, 404], [432, 450], [420, 450]]), C.audifonoS]], { w: 3, peso: 0.6 });
  o += L('M416 410 Q406 414 404 436', 2, C.audifonoS) + `<circle cx="421" cy="420" r="1.8" fill="${C.cian}"/>`;
  // La barba blanca, grande y esponjosa
  const barba = nube([[378, 396, 0.3], [396, 446, 0.3], [400, 500, 0.3], [392, 552, 0.3], [372, 598, 0.3], [336, 632, 0.3], [292, 648, 0.3], [246, 638, 0.3], [212, 610, 0.3], [192, 566, 0.3], [188, 520, 0.3], [198, 488, 0.12], [228, 490, 0.12], [262, 484, 0.12], [300, 480, 0.12], [336, 474, 0.12], [360, 456, 0.12], [372, 428, 0.12]]);
  o += pieza(barba, C.barba, [[pol([[340, 380], [420, 380], [420, 660], [250, 660], [330, 600], [370, 520]]), C.barbaS]]);
  o += pincel([244, 540], [250, 566], [262, 590], [280, 606], 2.4) + pincel([300, 556], [306, 580], [318, 600], [334, 610], 2.2) + pincel([214, 528], [214, 552], [222, 574], [234, 590], 2.2) + pincel([352, 508], [362, 530], [366, 552], [362, 574], 2.2);
  // La sonrisa, que asoma bajo el bigote
  o += negro(curva([[240, 500], [264, 506], [288, 500], [282, 516], [262, 524], [246, 516]], true));
  o += P(curva([[250, 514], [262, 510], [276, 513], [270, 520], [256, 521]], true), C.colorado);
  // El bigote, de dos mechones
  const bigote = nube([[226, 466, 0.2], [262, 466, 0.2], [298, 478, 0.2], [304, 496, 0.25], [282, 500, 0.25], [256, 494, 0.2], [230, 500, 0.25], [200, 508, 0.25], [190, 494, 0.2], [204, 474, 0.2]]);
  o += pieza(bigote, C.barba, [[pol([[260, 488], [310, 488], [310, 510], [260, 510]]), C.barbaS], [pol([[186, 496], [240, 492], [240, 512], [186, 512]]), C.barbaS]], { w: 4.4, peso: 1.2 });
  o += pincel([252, 476], [262, 482], [272, 486], [284, 488], 1.8) + pincel([228, 478], [220, 484], [212, 490], [202, 494], 1.8);
  // La nariz redonda y colorada: sólo su borde de afuera lleva tinta
  o += P(curva([[262, 430], [240, 436], [222, 434], [204, 444], [198, 462], [208, 478], [228, 482], [244, 474], [250, 456]], true), C.nariz);
  o += P(curva([[236, 458], [250, 460], [244, 476], [226, 482], [216, 478], [232, 470]], true), C.narizS) + P(curva([[208, 448], [218, 440], [226, 444], [216, 454]], true), C.narizL);
  o += B('M262 430 Q240 437 222 434 Q204 440 199 456 Q196 474 212 480 L230 481', 4.6);
  o += L('M238 476 Q246 470 244 460', 2.4);
  // Ojos que sonríen: párpado pesado, pupila chica que mira a la izquierda y la mejilla que los empuja
  for (const [x, y, w, h] of [[254, 430, 22, 14], [322, 430, 31, 18]]) {
    o += pieza(`M${x - w / 2} ${y} Q${x} ${y - h} ${x + w / 2} ${y} Q${x} ${y + h * 0.72} ${x - w / 2} ${y} Z`, '#FBFAF6', [], { w: 3, peso: 0 });
    o += `<circle cx="${r1(x - w * 0.18)}" cy="${y}" r="${r1(h * 0.3)}" fill="${K}"/>`;
    o += negro(`M${x - w / 2 - 3} ${y} Q${x} ${y - h - 6} ${x + w / 2 + 4} ${y - 1} L${x + w / 2 + 2} ${y + 1} Q${x} ${r1(y - h * 0.5)} ${x - w / 2} ${y + 2} Z`);
    o += L(`M${x - w / 2 + 1} ${r1(y + h * 0.62)} Q${x} ${r1(y + h * 0.95)} ${x + w / 2 + 1} ${r1(y + h * 0.5)}`, 2);
  }
  // Las patas de gallo de reírse tanto
  o += L('M342 424 l8 -4 M343 431 l9 1 M341 438 l7 5', 1.8);
  // El gorro marinero: la copa y el doblez acanalado
  const copa = curva([[210, 372], [214, 326], [244, 300], [292, 290], [342, 294], [376, 316], [394, 352], [394, 376], [300, 366]], true);
  o += pieza(copa, C.gorro, [[pol([[330, 280], [410, 280], [410, 380], [340, 380], [356, 330]]), C.gorroS], [pol([[226, 300], [270, 290], [240, 340], [220, 350]]), C.gorroL]]);
  o += pincel([258, 306], [278, 300], [300, 300], [320, 304], 2.4) + pincel([300, 330], [306, 316], [316, 306], [330, 300], 2);
  const dobl = curva([[204, 360], [300, 350], [398, 356], [400, 382], [398, 396], [300, 390], [202, 400], [200, 380]], true);
  o += pieza(dobl, C.gorro, [[pol([[340, 340], [410, 340], [410, 410], [346, 410]]), C.gorroS]], { w: 5 });
  for (let x = 214; x < 396; x += 12) o += L(`M${x} ${r1(358 - (x - 300) * 0.02 + Math.abs(x - 300) * 0.04)} L${x} ${r1(394 - Math.abs(x - 300) * 0.02)}`, 2, x < 340 ? C.gorroL : '#1A3352');
  // Las cejas blancas, pobladas y caídas hacia afuera: montan sobre el doblez del gorro
  o += pieza(nube([[290, 410, 0.32], [304, 396, 0.32], [326, 390, 0.32], [350, 396, 0.32], [364, 414, 0.25], [348, 412, 0.15], [326, 408, 0.15], [306, 412, 0.15]]), C.barba, [[pol([[336, 384], [370, 384], [370, 420], [336, 420]]), C.barbaS]], { w: 4, peso: 1 });
  o += pieza(nube([[228, 418, 0.3], [236, 404, 0.3], [256, 398, 0.3], [276, 404, 0.3], [278, 414, 0.15], [258, 412, 0.15], [242, 420, 0.15]]), C.barba, [[pol([[262, 394], [284, 394], [284, 420], [262, 420]]), C.barbaS]], { w: 4, peso: 1 });
  o += pincel([306, 404], [318, 400], [332, 400], [344, 404], 1.6) + pincel([242, 410], [250, 406], [260, 405], [268, 407], 1.4);
  return o;
}

// ── El manual: libro grueso, con su etiqueta y la cinta cian ──
function manual() {
  let o = '';
  // El canto de las hojas (abajo) y el lomo (a la derecha)
  o += pieza(pol([[-56, 64], [50, 64], [56, 84], [-50, 84]]), C.hojas, [[pol([[16, 60], [62, 60], [62, 88], [20, 88]]), C.hojasS]], { w: 4, peso: 1 });
  o += L('M-48 70 L52 70 M-46 77 L54 77', 1.4, C.hojasS);
  o += pieza(pol([[48, -70], [58, -62], [58, 82], [48, 66]]), C.tapaS, [], { w: 4, peso: 1 });
  // La tapa
  o += pieza(pol([[-58, -70], [48, -70], [50, 66], [-56, 66]]), C.tapa, [[pol([[22, -74], [56, -74], [56, 70], [24, 70]]), C.tapaS], [pol([[-62, -74], [-46, -74], [-44, 70], [-60, 70]]), C.tapaL]], { w: 5, peso: 1.4 });
  // La etiqueta crema con su título
  o += pieza(pol([[-48, -22], [42, -22], [42, 12], [-48, 12]]), C.hojas, [[pol([[24, -26], [46, -26], [46, 16], [26, 16]]), C.hojasS]], { w: 3, peso: 0 });
  o += `<text x="-3" y="2" text-anchor="middle" font-family="${LETRA}" font-size="17" fill="${C.marino}" letter-spacing=".3">MANUAL</text>`;
  o += L('M-48 -44 L42 -44 M-48 36 L42 36', 2.2, C.tapaL);
  // La cinta cian que marca la página
  o += pieza(pol([[-24, 82], [-13, 82], [-13, 110], [-18, 103], [-24, 110]]), C.cian, [], { w: 2.6, peso: 0 });
  return o;
}

// ── El brazo del manual (el cercano): la manga aprieta el libro contra el costado y la mano lo sostiene por abajo ──
function brazoManual() {
  let o = '';
  // Ronda 3: con el costado más angosto, el libro y la mano se corren 18 hacia adentro (el codo, 22)
  const lm = -18;
  o += `<g transform="translate(${410 + lm} 770) rotate(-6)">${manual()}</g>`;
  // La manga cae del hombro redondeado (sin el corte plano de antes) y aprieta el libro contra el costado
  const brazo = curva([[408, 650], [412, 624], [428, 606], [448, 601], [468, 612], [480, 642], [488, 700], [498, 752], [490, 782], [464, 790], [446, 772], [432, 728], [418, 686]], true);
  o += pieza(brazo, C.chaq, [[pol([[460, 600], [512, 600], [512, 800], [474, 800], [474, 700]]), C.chaqS], [pol([[396, 620], [422, 608], [446, 790], [434, 800]]), C.chaqL]]);
  o += pincel([448, 676], [456, 700], [460, 722], [460, 744], 2.6);
  const ante = miembro([[434, 852], [470, 772]], [60, 68], { punta: 'redonda' });
  o += pieza(ante, C.chaq, [[pol([[452, 760], [512, 760], [462, 860], [434, 860]]), C.chaqS]]);
  o += pincel([443, 790], [451, 806], [455, 820], [451, 834], 2.4);
  // El puño del suéter, a rayas, que asoma bajo la manga
  o += pieza(pol([[424 + lm, 846], [474 + lm, 856], [470 + lm, 876], [420 + lm, 866]]), C.crema, [[pol([[422 + lm, 856], [474 + lm, 866], [474 + lm, 872], [422 + lm, 862]]), C.marino], [pol([[456 + lm, 840], [480 + lm, 840], [480 + lm, 880], [458 + lm, 880]]), C.cremaS]], { w: 3.6, peso: 0.8 });
  // La mano, que sostiene el libro por abajo: el dorso y los dedos que suben por la tapa
  o += pieza(curva([[404, 858], [440, 864], [454, 878], [446, 896], [414, 900], [396, 886], [394, 868]].map(([x, y]) => [x + lm, y]), true), C.piel, [[pol([[432 + lm, 852], [462 + lm, 852], [462 + lm, 906], [436 + lm, 906]]), C.pielS]], { w: 4.6, peso: 1.4 });
  for (let i = 0; i < 4; i++) {
    const x = 390 + lm + i * 13, y = 858 - i * 2;
    o += pieza(curva([[x - 6, y + 8], [x - 7, y - 8], [x, y - 15], [x + 7, y - 10], [x + 7, y + 8]], true), C.piel, [[pol([[x + 1, y - 18], [x + 12, y - 18], [x + 12, y + 12], [x + 2, y + 12]]), C.pielS]], { w: 3.4, peso: 0.7 });
  }
  return o;
}

// ── La mano del farol y el farol encendido (delante de todo, a la izquierda) ──
function farolAdelante() {
  let o = '';
  const fx = 66, fy = 760;
  o += halo(fx + 2, fy + 104, 66, 112);
  // El resplandor del vidrio encendido
  const idB = nuevoId();
  o += `<defs><filter id="${idB}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9"/></filter></defs><ellipse cx="${fx}" cy="${fy + 104}" rx="30" ry="40" fill="${C.cian}" opacity=".6" filter="url(#${idB})"/>`;
  o += `<g transform="translate(${fx} ${fy}) scale(1.12)">${farol()}</g>`;
  // El puño del suéter, a rayas, que asoma bajo la manga, y la mano que agarra el asa
  o += pieza(pol([[90, 710], [104, 712], [102, 766], [88, 764]]), C.crema, [[pol([[94, 708], [99, 708], [97, 770], [92, 770]]), C.marino], [pol([[86, 748], [108, 748], [108, 772], [86, 772]]), C.cremaS]], { w: 3.4, peso: 0.6 });
  o += `<g transform="translate(${fx + 2} ${fy + 4}) scale(.95)">${punoFarol()}</g>`;
  return o;
}

export function faro({ prefijo = 'faro' } = {}) {
  reiniciar(prefijo);
  return `<g>${bota(-1)}${bota(1)}${piernas()}${chaquetonAtras()}${sueter()}${chaquetonAdelante()}${brazoFarol()}${cabeza()}${brazoManual()}${farolAdelante()}</g>`;
}

export const vista = () => lamina(faro());
