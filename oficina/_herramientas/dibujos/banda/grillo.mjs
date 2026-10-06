// Grillo en la línea de la banda: el de diseño (E5), Gregorio Llanos, le dicen Pixel. Antes era Grilla; ahora es un
// hombre joven y conserva todo lo que la hacía reconocible. Es el más alto y flaco del elenco (como un grillo), de cuello
// largo con nuez, hombros rectos y brazos largos, piel clara con pecas y barba de pocos días. Corte de hombre: los
// costados rapados al ras y el cian sólo arriba, peinado hacia atrás, con dos lápices clavados como antenas; lentes
// redondos y el audífono cian detrás de la oreja. Jardinera verde azulado con
// el 5 en el peto, sobre una polera blanca de manga larga arremangada; la huincha de modista al cuello, de bufanda. Un
// pulgar arriba («prueba cada botón con el pulgar») y la libreta de bocetos en la otra mano. Zapatillas grandes. Marco
// 600 × 1260, suelo en y = 1240, mira a la derecha, casi de frente.
import { K, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, r1, achicar, numeroChico } from './base.mjs';
import { NUMERO, lamina } from './tinta.mjs';

export const C = {
  piel: '#F1C5A1', pielS: '#D29A77', peca: '#B97556', labio: '#B97A6E',
  pelo: '#17C3B2', peloS: '#0A8A7E', peloL: '#7FD8CF', rapado: '#C9A084', rapadoS: '#AE8467', barba: '#6E5444',
  jard: '#178571', jardS: '#0E6253', jardL: '#3BA58F',
  polera: '#F4F3EE', poleraS: '#C9CCCB',
  huincha: '#F2E2A0', huinchaS: '#CDB872',
  zap: '#1B2D4A', zapS: '#101D33', zapL: '#2E4770', suela: '#ECEFF2', suelaS: '#B5BEC8',
  cian: '#17C3B2', cianL: '#7FD8CF', cianS: '#0A8A7E',
  lapiz: '#35679A', lapizS: '#244A72', lapizL: '#5B8CC0', metal: '#C3CDD8', metalS: '#8E99A6', goma: '#F2F4F7',
  libreta: '#1E4A78', libretaS: '#13324F', hoja: '#F4ECD8', hojaS: '#D9CDB2',
  ojo: '#F6F3EC', blanco: '#FFFFFF', vidrio: '#DDF4F1'
};

// ── Zapatillas grandes: bajas, de lona azul marino, con la talonera de otro tono, lengüeta acolchada y cordones cian ──
export function zapatilla(lado) {
  const x0 = lado < 0 ? 250 : 354, s = -lado, X = (x) => x0 + s * x, xc = lado < 0 ? 262 : 342;
  let o = '';
  // Calcetín blanco con su raya cian, que asoma sobre la zapatilla
  o += pieza(pol([[xc - 15, 1092], [xc + 15, 1092], [xc + 17, 1156], [xc - 17, 1156]]), C.polera, [[pol([[xc + 4, 1088], [xc + 20, 1088], [xc + 20, 1160], [xc + 6, 1160]]), C.poleraS]], { w: 4.4, peso: 1 });
  o += L(`M${xc - 15} 1112 L${xc + 16} 1112 M${xc - 15} 1121 L${xc + 16} 1121`, 3.4, C.cian);
  // Suela gruesa
  o += pieza(pol([[X(-124), 1206], [X(42), 1206], [X(46), 1240], [X(-128), 1240]]), C.suela, [[pol([[X(-140), 1226], [X(64), 1224], [X(64), 1246], [X(-140), 1246]]), C.suelaS]], { w: 5.5 });
  o += L(`M${X(-120)} 1220 L${X(42)} 1219`, 2.6);
  // Lona
  const lona = curva([[X(-24), 1138], [X(30), 1134], [X(40), 1170], [X(40), 1208], [X(-60), 1210], [X(-122), 1206], [X(-116), 1180], [X(-82), 1166], [X(-46), 1154]], true);
  o += pieza(lona, C.zap, [[pol([[X(12), 1126], [X(54), 1126], [X(54), 1214], [X(18), 1214]]), C.zapS]]);
  // Talonera de otro tono y la costura de la puntera
  o += pieza(curva([[X(2), 1150], [X(32), 1142], [X(40), 1176], [X(40), 1206], [X(8), 1206], [X(14), 1178]], true), C.zapL, [[pol([[X(26), 1138], [X(52), 1138], [X(52), 1210], [X(30), 1210]]), C.zap]], { w: 4.4, peso: 0 });
  o += L(`M${X(-116)} 1190 Q${X(-96)} 1172 ${X(-66)} 1180 Q${X(-60)} 1194 ${X(-62)} 1206`, 2.4);
  // Lengüeta acolchada que asoma arriba
  o += pieza(curva([[X(-38), 1150], [X(-26), 1128], [X(-2), 1122], [X(8), 1140]], true), C.zapL, [], { w: 4, peso: 0 });
  // Cordones cian cruzados sobre el empeine, con su rosa
  for (const [x, y] of [[-66, 1170], [-52, 1162], [-38, 1155]]) {
    o += L(`M${X(x - 6)} ${y - 6} L${X(x + 6)} ${y + 6} M${X(x - 6)} ${y + 6} L${X(x + 6)} ${y - 6}`, 3.4, C.cian);
  }
  o += L(`M${X(-30)} 1150 Q${X(-22)} 1136 ${X(-14)} 1148 Q${X(-24)} 1154 ${X(-30)} 1150 M${X(-30)} 1150 Q${X(-40)} 1138 ${X(-46)} 1148 Q${X(-38)} 1156 ${X(-30)} 1150`, 2.6, C.cian);
  return o;
}

// La cadera de la jardinera: sin contorno abajo, para que siga en las piernas
const CADERA = pol([[246, 640], [354, 640], [354, 718], [330, 744], [302, 756], [274, 744], [246, 718]]);
// ── Piernas: largas y flacas, las rodillas de grillo hacia adentro y la basta doblada ──
function piernas() {
  let o = '';
  const izq = miembro([[274, 700], [280, 936], [262, 1100]], [56, 44, 46], { punta: 'plana' });
  const der = miembro([[326, 700], [322, 936], [342, 1100]], [56, 44, 46], { punta: 'plana' });
  o += pieza(der, C.jard, [[pol([[330, 690], [360, 690], [366, 1108], [346, 1108], [336, 940]]), C.jardS]]);
  o += pieza(izq, C.jard, [[pol([[302, 752], [298, 940], [286, 1108], [270, 1108], [288, 940]]), C.jardS]]);
  o += pieza(CADERA, C.jard, [[pol([[330, 636], [366, 636], [366, 760], [318, 760]]), C.jardS]], { borde: false });
  o += B('M246 640 L246 720', 6) + B('M354 640 L354 720', 6);
  // La bragueta: la costura del centro, que se pierde en la entrepierna
  o += pincel([302, 668], [303, 700], [302, 730], [300, 758], 3) + pincel([286, 676], [288, 700], [292, 720], [298, 734], 2);
  // Rodillas huesudas y la tela que se arruga
  o += pincel([262, 930], [272, 940], [284, 940], [294, 932], 2.8) + pincel([306, 932], [316, 940], [328, 940], [338, 930], 2.8);
  o += pincel([258, 800], [264, 830], [268, 860], [270, 890], 2.2) + pincel([340, 800], [334, 830], [330, 860], [328, 890], 2.2);
  o += pincel([300, 752], [298, 780], [294, 800], [290, 820], 2.6);
  o += pincel([254, 1030], [262, 1040], [272, 1042], [282, 1036], 2.4) + pincel([324, 1034], [334, 1042], [346, 1042], [356, 1032], 2.4);
  // Bastas dobladas, más claras
  for (const [x, g] of [[262, 4], [342, -6]]) {
    o += `<g transform="rotate(${g} ${x} 1088)">` + pieza(pol([[x - 27, 1072], [x + 27, 1072], [x + 29, 1100], [x - 29, 1100]]), C.jardL, [[pol([[x + 6, 1068], [x + 34, 1068], [x + 34, 1104], [x + 10, 1104]]), C.jard]], { w: 4.6, peso: 1.2 }) +
      L(`M${x - 27} 1082 L${x + 27} 1082`, 2.2) + `</g>`;
  }
  return o;
}

// ── El brazo de atrás: el pulgar arriba ──
function pulgar() {
  // Coordenadas propias: el puño en el origen, la muñeca abajo. Los dedos doblados se apilan del lado del cuerpo
  // (izquierda) y el pulgar sube derecho
  let o = '';
  o += pieza(curva([[-18, -22], [12, -24], [22, -10], [22, 14], [14, 28], [-12, 30], [-22, 16], [-22, -6]], true), C.piel, [[pol([[6, -30], [30, -30], [30, 34], [10, 34]]), C.pielS]], { w: 5, peso: 1.6 });
  for (let i = 0; i < 4; i++) {
    const y = -16 + i * 12;
    o += pieza(curva([[-6, y - 6], [-24, y - 5], [-30, y + 1], [-24, y + 7], [-6, y + 6]], true), C.piel, [[pol([[-34, y + 2], [-4, y + 2], [-4, y + 9], [-34, y + 9]]), C.pielS]], { w: 3.6, peso: 0.8 });
  }
  o += pieza(curva([[-12, -18], [-14, -40], [-10, -56], [0, -60], [8, -54], [8, -36], [6, -18]], true), C.piel, [[pol([[0, -64], [12, -64], [12, -14], [2, -14]]), C.pielS]], { w: 4.4, peso: 1.2 });
  o += L('M-8 -50 Q-2 -54 4 -50', 2);
  return o;
}
function brazoAtras() {
  let o = '';
  // Antebrazo flaco, del puño al codo, y el pedazo de brazo que asoma bajo la manga
  o += pieza(miembro([[383, 520], [394, 572]], [30, 32], { punta: 'redonda' }), C.piel, [[pol([[392, 510], [420, 510], [420, 600], [396, 600]]), C.pielS]]);
  o += pieza(miembro([[416, 484], [396, 574]], [28, 34], { punta: 'redonda' }), C.piel, [[pol([[404, 470], [430, 470], [416, 600], [400, 600]]), C.pielS]]);
  // Manga blanca arremangada sobre el codo
  o += pieza(miembro([[368, 392], [378, 468], [384, 524]], [48, 39, 35], { punta: 'plana' }), C.polera, [[pol([[380, 384], [412, 394], [408, 530], [384, 530]]), C.poleraS]]);
  o += pieza(curva([[362, 516], [400, 508], [406, 528], [402, 542], [366, 548], [358, 532]], true), C.polera, [[pol([[388, 500], [412, 500], [412, 552], [390, 552]]), C.poleraS]], { w: 4.6, peso: 1.2 });
  o += L('M364 530 Q384 524 404 520', 2.2);
  o += pincel([358, 440], [366, 456], [372, 470], [376, 486], 2.2);
  // El pulgar arriba
  o += `<g transform="translate(418 456) rotate(-6) scale(1.08)">${pulgar()}</g>`;
  return o;
}

// ── Torso: la polera blanca, la jardinera con el 5 en el peto y los tirantes ──
function torso() {
  let o = '';
  const polera = curva([[266, 362], [300, 374], [334, 362], [376, 372], [390, 402], [374, 520], [358, 646], [300, 650], [242, 646], [226, 520], [210, 402], [224, 372]], true);
  o += pieza(polera, C.polera, [[pol([[326, 360], [380, 360], [380, 660], [338, 660], [350, 520]]), C.poleraS]]);
  o += pincel([246, 430], [250, 450], [252, 470], [252, 490], 2.2) + pincel([352, 430], [350, 450], [348, 470], [348, 490], 2.2);
  // Pretina de la jardinera, con los botones de los costados: la polera queda metida adentro
  o += pieza(pol([[244, 636], [356, 636], [357, 664], [243, 664]]), C.jard, [[pol([[330, 630], [362, 630], [362, 668], [334, 668]]), C.jardS]], { w: 5, peso: 1 });
  for (const x of [252, 348]) o += `<circle cx="${x}" cy="650" r="5.5" fill="${C.metal}" stroke="${K}" stroke-width="2.6"/>`;
  // Peto con su costura y el 5
  const peto = pol([[254, 470], [348, 470], [351, 640], [251, 640]]);
  o += pieza(peto, C.jard, [[pol([[326, 464], [360, 464], [360, 660], [330, 660]]), C.jardS]]);
  o += `<path d="M260 480 L342 480 L345 632 L257 632 Z" fill="none" stroke="${C.jardL}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
  o += numeroChico(`<text x="302" y="618" text-anchor="middle" font-family="${NUMERO}" font-size="104" fill="${C.polera}" stroke="${K}" stroke-width="5" paint-order="stroke" transform="rotate(-2 302 580)">5</text>`, 302, 581);
  // Tirantes que suben por los hombros, con sus botones
  o += pieza(pol([[256, 472], [274, 472], [280, 380], [262, 382]]), C.jard, [[pol([[268, 376], [284, 376], [278, 476], [266, 476]]), C.jardS]], { w: 4.6, peso: 1.2 });
  o += pieza(pol([[326, 472], [344, 472], [340, 382], [322, 380]]), C.jard, [[pol([[334, 376], [348, 376], [348, 476], [338, 476]]), C.jardS]], { w: 4.6, peso: 1.2 });
  for (const x of [265, 335]) o += `<circle cx="${x}" cy="482" r="6" fill="${C.metal}" stroke="${K}" stroke-width="2.6"/>`;
  return o;
}

// ── La huincha de modista al cuello, de bufanda: una vuelta y las dos puntas colgando, con sus marcas ──
export function cinta(pts, ancho, { lado = 1, desde = 0 } = {}) {
  // La cinta como un miembro de ancho parejo, con las marcas de los centímetros en un borde
  let o = pieza(miembro(pts, pts.map(() => ancho), { punta: 'plana' }), C.huincha, [], { w: 4, peso: 1 });
  let marcas = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / l, (b[1] - a[1]) / l], n = [-u[1] * lado, u[0] * lado];
    for (let t = 4; t < l - 2; t += 6) {
      const k = Math.round((desde + t) / 6), largo = k % 5 === 0 ? ancho * 0.5 : ancho * 0.28;
      const p = [a[0] + u[0] * t + n[0] * (ancho / 2 - 1), a[1] + u[1] * t + n[1] * (ancho / 2 - 1)];
      marcas += `M${r1(p[0])} ${r1(p[1])} l${r1(-n[0] * largo)} ${r1(-n[1] * largo)} `;
    }
    desde += l;
  }
  return o + `<path d="${marcas}" fill="none" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/>`;
}
function huinchaAtras() {
  // La vuelta por detrás del cuello
  return pieza(curva([[264, 362], [276, 344], [300, 338], [324, 344], [338, 362], [326, 358], [300, 352], [276, 356]], true), C.huinchaS, [], { w: 4, peso: 0 });
}
// Cuello largo y flaco, con la nuez: la huincha da la vuelta por detrás y la polera lo tapa abajo
function cuello() {
  const d = pol([[286, 240], [318, 240], [318, 328], [324, 336], [325, 344], [319, 352], [320, 376], [284, 376]]);
  return pieza(d, C.piel, [[pol([[278, 286], [330, 286], [330, 318], [278, 328]]), C.pielS], [pol([[306, 318], [332, 318], [332, 380], [308, 380]]), C.pielS]]) +
    L('M312 334 Q318 340 314 348', 2.2) + L('M294 352 L296 362', 2);
}
function huincha() {
  let o = '';
  // La punta corta, a la derecha, cae sobre el tirante
  o += cinta([[332, 366], [340, 400], [344, 440], [346, 470]], 20, { lado: -1 });
  // La punta larga, a la izquierda, cae hasta la cintura y termina en su chapita de metal
  o += cinta([[268, 366], [262, 420], [256, 480], [258, 540], [254, 596]], 22, { lado: 1 });
  o += pieza(pol([[242, 592], [266, 596], [264, 608], [240, 604]]), C.metal, [[pol([[254, 590], [270, 590], [270, 612], [256, 612]]), C.metalS]], { w: 3.4, peso: 0.8 });
  // La vuelta por delante del cuello
  o += cinta([[262, 360], [280, 378], [300, 384], [320, 380], [338, 362]], 18, { lado: -1 });
  return o;
}

// ── El brazo de adelante: cuelga largo, con la libreta de bocetos ──
function libreta() {
  // Tapa azul con elástico cian, el canto de las hojas y el espiral arriba; cuelga tomada por el canto derecho
  let o = '';
  o += pieza(pol([[146, 746], [230, 748], [226, 870], [142, 866]]), C.hoja, [[pol([[142, 856], [232, 856], [232, 874], [142, 874]]), C.hojaS]], { w: 5 });
  o += pieza(pol([[142, 740], [228, 742], [224, 862], [138, 858]]), C.libreta, [[pol([[200, 734], [236, 734], [236, 870], [196, 870]]), C.libretaS]], { w: 5.5 });
  o += pieza(pol([[204, 741], [213, 741], [209, 861], [200, 861]]), C.cian, [[pol([[208, 736], [218, 736], [216, 866], [206, 866]]), C.cianS]], { w: 3, peso: 0 });
  o += P(pol([[152, 774], [186, 776], [185, 796], [151, 794]]), C.hoja) + B(pol([[152, 774], [186, 776], [185, 796], [151, 794]]), 2.6);
  for (let x = 150; x <= 222; x += 10) o += `<path d="M${x} 746 a5 7 0 1 1 6 -2" fill="none" stroke="${C.metal}" stroke-width="2.8" stroke-linecap="round"/>`;
  return o;
}
function brazoDelante() {
  let o = '';
  // El brazo largo y flaco, de la manga a la muñeca
  o += pieza(miembro([[232, 520], [228, 600], [224, 744]], [30, 30, 27], { punta: 'plana' }), C.piel, [[pol([[232, 510], [250, 510], [244, 760], [228, 760]]), C.pielS]]);
  o += pincel([216, 580], [218, 592], [222, 600], [228, 604], 2);
  // La libreta, colgando de la mano
  o += libreta();
  // La mano: el dorso al costado de la libreta y los cuatro dedos que pasan por delante de la tapa
  o += pieza(curva([[212, 736], [236, 738], [246, 758], [246, 786], [236, 804], [220, 800], [214, 772]], true), C.piel, [[pol([[234, 730], [256, 730], [256, 810], [236, 810]]), C.pielS]], { w: 5, peso: 1.6 });
  for (let i = 0; i < 4; i++) {
    const y = 760 + i * 12.5;
    o += pieza(curva([[236, y - 6], [214, y - 6], [204, y], [212, y + 6.5], [236, y + 6]], true), C.piel, [[pol([[200, y + 1.5], [240, y + 1.5], [240, y + 9], [200, y + 9]]), C.pielS]], { w: 3.6, peso: 0.8 });
  }
  o += L('M218 744 Q228 740 238 746', 2);
  // Manga blanca arremangada sobre el codo
  const manga = curva([[230, 370], [252, 386], [254, 440], [252, 486], [250, 526], [212, 526], [208, 478], [206, 426], [212, 388]], true);
  o += pieza(manga, C.polera, [[pol([[246, 380], [272, 380], [262, 530], [242, 530], [248, 440]]), C.poleraS]]);
  o += L('M216 386 Q232 376 250 384', 2.2);
  o += pieza(curva([[210, 518], [252, 516], [256, 534], [252, 548], [212, 550], [206, 534]], true), C.polera, [[pol([[238, 508], [262, 508], [262, 556], [240, 556]]), C.poleraS]], { w: 4.6, peso: 1.2 });
  o += L('M212 534 Q232 530 252 532', 2.2);
  o += pincel([238, 440], [236, 456], [236, 472], [238, 488], 2.2);
  return o;
}

// ── Cabeza: cara larga y angulosa con pecas, lentes redondos, el audífono, el pelo cian y los lápices-antena ──
export function lapiz(x, y, giro, largo, goma) {
  // Un lápiz hexagonal: el cuerpo de tres caras, la virola de metal y la goma arriba; la punta queda clavada en el pelo
  let o = '';
  o += pieza(pol([[-7, 0], [7, 0], [7, -largo], [-7, -largo]]), C.lapiz, [[pol([[-7, 4], [-2.5, 4], [-2.5, -largo - 2], [-7, -largo - 2]]), C.lapizL], [pol([[2.5, 4], [7, 4], [7, -largo - 2], [2.5, -largo - 2]]), C.lapizS]], { w: 3.6, peso: 0.8 });
  o += pieza(pol([[-7.5, -largo], [7.5, -largo], [7.5, -largo - 12], [-7.5, -largo - 12]]), C.metal, [[pol([[2, -largo + 2], [9, -largo + 2], [9, -largo - 14], [2, -largo - 14]]), C.metalS]], { w: 3.2, peso: 0 });
  o += L(`M-7 ${-largo - 4} L7 ${-largo - 4} M-7 ${-largo - 8} L7 ${-largo - 8}`, 1.6, C.metalS);
  o += pieza(`M-7 ${-largo - 12} L-7 ${-largo - 20} Q-7 ${-largo - 26} 0 ${-largo - 26} Q7 ${-largo - 26} 7 ${-largo - 20} L7 ${-largo - 12} Z`, goma, [[pol([[2, -largo - 30], [10, -largo - 30], [10, -largo - 10], [2, -largo - 10]]), goma === C.cian ? C.cianS : C.suelaS]], { w: 3.4, peso: 0.8 });
  return `<g transform="translate(${x} ${y}) rotate(${giro})">${o}</g>`;
}
function cabeza() {
  let o = '';
  // Los lápices, clavados en el pelo (el pelo les tapa la punta)
  o += lapiz(278, 84, -45, 77, C.cian) + lapiz(324, 82, 43, 71, C.goma);
  // Cara larga de hombre joven: la mandíbula marcada y el mentón cuadrado
  const cara = curva([[240, 146], [258, 114], [296, 100], [338, 104], [362, 126], [372, 162], [373, 204], [367, 240], [346, 270], [318, 286], [290, 284], [266, 266], [250, 238], [242, 192]], true);
  // La barba de pocos días: un tono suave en la mandíbula, el mentón y sobre el labio, con sus puntitos
  const barba = pol([[240, 210], [256, 232], [280, 244], [304, 246], [322, 250], [344, 246], [362, 234], [376, 212], [384, 300], [232, 300]]);
  let puntos = '';
  for (let i = 0; i < 46; i++) {
    const x = 246 + ((i * 37) % 128), y = 240 + ((i * 23) % 44);
    if ((x < 262 && y < 236) || (x > 354 && y < 236)) continue;
    puntos += `<circle cx="${x}" cy="${y}" r="1.25" fill="${C.barba}" opacity=".6"/>`;
  }
  o += pieza(cara, C.piel, [[pol([[350, 110], [392, 110], [392, 296], [320, 296], [350, 254], [358, 200]]), C.pielS], [barba, C.barba + '2E'], puntos]);
  // Pecas: nariz y mejillas
  for (const [x, y, r] of [[266, 214], [276, 218], [286, 214], [272, 224], [282, 226], [262, 222], [344, 212], [352, 216], [348, 224], [358, 210], [306, 202], [314, 198], [310, 208], [298, 208]].map((p, i) => [p[0], p[1], 1.6 + (i % 3) * 0.3])) o += `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.peca}"/>`;
  // Boca: media sonrisa pícara que sube hacia la derecha, con el hoyuelo y la línea de la mejilla
  o += L('M298 256 Q320 262 342 250', 3.6) + L('M341 251 Q346 246 347 240', 2.4) + L('M298 254 Q295 258 297 262', 2);
  o += L('M312 266 Q321 268 330 265', 2.2) + L('M312 278 Q318 281 324 278', 2);
  o += L('M352 228 Q360 240 358 254', 2.2);
  // Nariz con un quiebre, casi de frente: sólo su borde de afuera lleva tinta (ronda 3: más chica, desde el puente)
  let nariz = P('M310 190 Q326 210 338 226 Q346 238 334 242 Q322 244 310 238 Z', C.piel);
  nariz += P('M308 234 Q322 242 338 240 Q334 247 320 248 Q310 246 308 234 Z', C.pielS);
  nariz += B('M313 190 Q320 202 326 210 Q336 222 342 232 Q346 241 334 243', 4.6);
  nariz += L('M334 243 Q324 247 313 240', 2.6);
  nariz += negro('M318 240 Q323 238 328 241 Q323 243 318 240 Z');
  o += achicar(nariz, 312, 188, 0.72);
  // Ojos de párpado pesado, las pupilas chicas mirando a la derecha
  for (const [x, y, w, h] of [[283, 182, 32, 16], [338, 180, 28, 15]]) {
    o += pieza(`M${x - w / 2} ${y} Q${x} ${y - h} ${x + w / 2} ${y} Q${x} ${y + h * 0.8} ${x - w / 2} ${y} Z`, C.ojo, [], { w: 3.4, peso: 0 });
    o += `<circle cx="${x + w * 0.2}" cy="${y - 1}" r="${h * 0.32}" fill="${K}"/>`;
    o += negro(`M${x - w / 2 - 3} ${y - 1} Q${x} ${y - h - 6} ${x + w / 2 + 4} ${y - 2} L${x + w / 2 + 2} ${y - h * 0.15} Q${x} ${y - h * 0.62} ${x - w / 2} ${y + 1} Z`);
  }
  o += L('M272 194 Q283 199 294 194', 1.8) + L('M330 192 Q338 196 346 192', 1.6);
  // Cejas negras, gruesas y rectas: la de atrás un poco alzada
  o += negro(pol([[250, 154], [282, 140], [310, 142], [309, 156], [282, 156], [253, 167]]));
  o += negro(pol([[320, 145], [344, 133], [368, 137], [368, 151], [344, 148], [322, 159]]));
  // Lentes redondos, con su reflejo
  o += `<circle cx="283" cy="183" r="25" fill="${C.vidrio}" opacity=".16"/><circle cx="339" cy="181" r="22" fill="${C.vidrio}" opacity=".16"/>`;
  o += `<path d="M268 196 L290 164 M346 194 L358 172" fill="none" stroke="${C.blanco}" stroke-width="4" stroke-linecap="round" opacity=".32"/>`;
  o += `<circle cx="283" cy="183" r="25" fill="none" stroke="${K}" stroke-width="6"/><circle cx="339" cy="181" r="22" fill="none" stroke="${K}" stroke-width="5.5"/>`;
  o += B('M308 180 Q312 174 317 179', 5);
  // El corte: los costados rapados al ras (la piel con el pelo oscuro en puntitos) y el cian sólo arriba, peinado hacia
  // atrás, con una onda chica adelante; la frente queda despejada
  const rapado = 'M270 114 Q248 108 238 124 Q228 148 234 176 Q240 192 250 200 L258 197 Q254 172 256 150 Q258 128 272 120 Z';
  o += pieza(rapado, C.rapado, [[pol([[254, 100], [280, 100], [280, 206], [256, 206]]), C.rapadoS]], { borde: false });
  for (let i = 0; i < 30; i++) o += `<circle cx="${r1(238 + (i * 7) % 22 + (i % 4) * 0.8)}" cy="${r1(118 + i * 2.6)}" r="1.2" fill="${C.barba}" opacity=".7"/>`;
  o += B('M270 114 Q248 108 238 124 Q228 148 234 176 Q240 192 250 200', 5.5) + L('M258 197 Q254 172 256 150 Q258 128 272 120', 2);
  const pelo = 'M366 130 Q382 112 380 88 Q374 62 348 50 Q318 38 288 42 Q262 44 244 58 L226 64 Q238 70 240 78 ' +
    'L224 90 Q238 94 240 104 Q248 116 262 116 Q288 106 316 104 Q346 104 366 130 Z';
  o += pieza(pelo, C.pelo, [
    [pol([[344, 98], [404, 82], [404, 144], [356, 136]]), C.peloS],
    [pol([[220, 40], [300, 32], [270, 66], [236, 100]]), C.peloL]
  ]);
  // Las pasadas del peine: suben por la onda de adelante y se van hacia la nuca
  o += pincel([366, 108], [362, 70], [318, 54], [268, 60], 2.6) + pincel([350, 108], [340, 80], [302, 70], [256, 78], 2.4);
  o += pincel([330, 106], [318, 90], [288, 86], [250, 96], 2.2) + pincel([374, 82], [360, 58], [328, 48], [292, 48], 2);
  // La oreja (grande), el audífono cian detrás y su tubito
  o += pieza(curva([[220, 150], [208, 156], [203, 176], [206, 194], [214, 190], [218, 168]], true), C.cian, [[pol([[209, 174], [222, 174], [222, 198], [209, 198]]), C.cianS]], { w: 3, peso: 0.6 });
  o += pieza(curva([[248, 164], [224, 154], [214, 184], [222, 214], [248, 222]], true), C.piel, [[pol([[212, 196], [234, 196], [234, 226], [212, 226]]), C.pielS]], { w: 4.6, peso: 1.4 });
  o += L('M236 170 Q224 184 230 204', 2.4);
  o += `<path d="M218 152 Q228 142 236 156 Q240 166 238 178" fill="none" stroke="${K}" stroke-width="3.8" stroke-linecap="round"/><path d="M218 152 Q228 142 236 156 Q240 166 238 178" fill="none" stroke="${C.cianL}" stroke-width="1.6" stroke-linecap="round"/>`;
  // La patilla de los lentes, hasta la oreja
  o += B('M258 180 L240 176', 5.5);
  return `<g transform="translate(302 44) scale(1.1) translate(-302 -44)">${o}</g>`;
}

export function grillo({ prefijo = 'grillo' } = {}) {
  reiniciar(prefijo);
  return `<g>${zapatilla(-1)}${zapatilla(1)}${piernas()}${brazoAtras()}${huinchaAtras()}${cuello()}${torso()}${huincha()}${brazoDelante()}${cabeza()}</g>`;
}

export const vista = () => lamina(grillo());
