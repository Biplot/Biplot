// Tamandúa (Tomás Hormazábal) en la línea de la banda: el que valida. Alto, flaco y encorvado como un oso hormiguero:
// la espalda curva, el cuello largo y la cabeza adelantada, con la nariz muy larga que olfatea los bichos en la
// pantalla. Conserva la piel oliva, el pelo oscuro revuelto con su mechón canoso, la linterna de minero en la frente
// (la luz cian cae sobre el celular), el chaleco negro acolchado sobre la polera crema con el 6 de su placa, los jeans
// que le quedan cortos, las zapatillas grises y el frasco con sus bichos. Marco 600 × 1260, suelo en y = 1240, mira a
// la izquierda.
import { K, W, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, nuevoId, r1, numeroChico } from './base.mjs';
import { NUMERO, lamina } from './tinta.mjs';

export const C = {
  piel: '#C8A47C', pielS: '#9F7E58', pielL: '#DDBE98',
  pelo: '#2B2622', peloS: '#1A1613', peloL: '#4B423A', cana: '#AAB3BD', barba: '#4E4038',
  polera: '#F4ECD8', poleraS: '#CFC2A3', poleraL: '#FFF8EA',
  chaleco: '#262B33', chalecoS: '#16191E', chalecoL: '#3C434E', cierre: '#8E99A6',
  jean: '#35679A', jeanS: '#244B75', jeanL: '#5E8BBE',
  zapa: '#B3BCC7', zapaS: '#8A95A3', zapaL: '#D2D9E1', suela: '#ECEFF2', suelaS: '#BCC4CD', goma: '#59636F',
  calcetin: '#1F2733', calcetinS: '#141A23', numero: '#35679A',
  cian: '#17C3B2', cianS: '#0A8A7E', cianL: '#7FD8CF',
  vidrio: '#D9F1EE', vidrioS: '#ACD6D0', tapa: '#35679A', tapaS: '#244B75', tapaL: '#5E8BBE',
  celular: '#14171C', pantalla: '#0E2A47', pantallaL: '#35679A', bicho: '#2A2F3A', bichoL: '#4A5262',
  linterna: '#E6EAEF', linternaS: '#AEB8C3', cinta: '#1F2733', blanco: '#F6F3EC'
};
// La cabeza baja un poco hacia el celular: gira sobre el nacimiento del cuello
const GIRO = { a: -6, cx: 270, cy: 350, dx: -12, dy: 18 };
const CABEZA = `translate(${GIRO.dx} ${GIRO.dy}) rotate(${GIRO.a} ${GIRO.cx} ${GIRO.cy})`;
const girar = ([x, y]) => {
  const t = (GIRO.a * Math.PI) / 180, dx = x - GIRO.cx, dy = y - GIRO.cy;
  return [r1(GIRO.cx + dx * Math.cos(t) - dy * Math.sin(t) + GIRO.dx), r1(GIRO.cy + dx * Math.sin(t) + dy * Math.cos(t) + GIRO.dy)];
};
// Todo el tronco se inclina hacia adelante sobre las caderas: la postura del oso hormiguero
const INCLINA = 'rotate(-3 320 790)';
const LENTE = [196, 200];   // el foco de la linterna, en la frente (antes de girar la cabeza)
let ids = 'tm';
// Azar repetible (para la barba de días)
const azar = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

// ── Zapatillas grises de trote: malla, puntera de goma, cordones blancos y la planta gruesa ──
function zapatilla(lado) {
  // lado -1: la de la izquierda del cuadro (punta a la izquierda); +1: la de la derecha (punta a la derecha)
  const x0 = lado < 0 ? 250 : 364, s = -lado, X = (x) => x0 + s * x;
  const xd = Math.max(X(-142), X(54));   // borde derecho en el cuadro: ahí cae la sombra
  let o = '';
  // El calcetín oscuro con sus franjas cian: los jeans le quedan cortos
  o += pieza(pol([[X(-25), 1064], [X(25), 1064], [X(27), 1140], [X(-27), 1140]]), C.calcetin, [[pol([[xd - 36, 1070], [xd + 10, 1070], [xd + 10, 1150], [xd - 36, 1150]]), C.calcetinS]], { w: 4.4, peso: 1 });
  o += L(`M${X(-26)} 1094 L${X(26)} 1094`, 4, C.cian) + L(`M${X(-26)} 1104 L${X(26)} 1104`, 2.2, C.cian);
  // Capellada de malla gris: caña baja, empeine alto y la punta redondeada
  const capellada = curva([[X(52), 1206], [X(56), 1166], [X(48), 1136], [X(26), 1124], [X(-12), 1122], [X(-30), 1132], [X(-60), 1146], [X(-98), 1158], [X(-128), 1172], [X(-142), 1192], [X(-134), 1208]], true);
  o += pieza(capellada, C.zapa, [[pol([[xd - 28, 1110], [xd + 10, 1110], [xd + 10, 1216], [xd - 28, 1216]]), C.zapaS], [pol([[X(-160), 1192], [X(70), 1192], [X(70), 1216], [X(-160), 1216]]), C.zapaS]]);
  // Refuerzo del talón
  o += L(`M${X(16)} 1202 Q${X(18)} 1170 ${X(50)} 1152`, 2.6);
  // Puntera de goma
  o += pieza(curva([[X(-142), 1200], [X(-136), 1180], [X(-114), 1170], [X(-96), 1176], [X(-92), 1204], [X(-132), 1208]], true), C.zapaL, [], { w: 3.6, peso: 0.8 });
  // Lengüeta con su tirador cian y los cordones blancos cruzados sobre el empeine
  o += pieza(pol([[X(-28), 1104], [X(-8), 1102], [X(-4), 1128], [X(-30), 1134]]), C.zapa, [[pol([[xd - 20, 1096], [xd + 6, 1096], [xd + 6, 1136], [xd - 20, 1136]]), C.zapaS]], { w: 4, peso: 0.8 });
  o += pieza(pol([[X(-24), 1096], [X(-12), 1095], [X(-11), 1110], [X(-23), 1111]]), C.cian, [], { w: 2.8, peso: 0 });
  o += pieza(pol([[X(-16), 1126], [X(-2), 1134], [X(-84), 1172], [X(-96), 1160]]), C.zapaS, [], { w: 3.6, peso: 0.6 });
  for (let i = 0; i < 4; i++) {
    const t = i / 3, x = -22 - t * 62, y = 1140 + t * 22;
    o += L(`M${X(x - 10)} ${y - 5} L${X(x + 9)} ${y + 5}`, 4.4, C.suela) + L(`M${X(x - 10)} ${y - 5} L${X(x + 9)} ${y + 5}`, 1.2, C.suelaS);
  }
  // Planta gruesa blanca, con la onda de la entresuela y la suela gris
  o += pieza(pol([[X(-136), 1202], [X(52), 1202], [X(56), 1240], [X(-140), 1240]]), C.suela, [[pol([[X(-160), 1228], [X(70), 1228], [X(70), 1246], [X(-160), 1246]]), C.suelaS]], { w: 5.5 });
  o += L(`M${X(-126)} 1216 Q${X(-90)} 1210 ${X(-54)} 1216 Q${X(-18)} 1222 ${X(18)} 1216 Q${X(36)} 1213 ${X(48)} 1216`, 2.2, C.suelaS);
  o += L(`M${X(-138)} 1230 L${X(55)} 1230`, 2.2);
  return o;
}

// ── Piernas: largas y flacas, jeans con la basta doblada que no alcanza a tapar los calcetines ──
function piernas() {
  let o = '';
  o += pieza(pol([[228, 742], [408, 742], [402, 806], [318, 818], [234, 806]]), C.jean, [[pol([[340, 736], [414, 736], [414, 820], [344, 820]]), C.jeanS]], { peso: 0 });
  const izq = miembro([[272, 760], [254, 910], [250, 1076]], [80, 60, 56], { punta: 'plana' });
  const der = miembro([[350, 760], [350, 910], [364, 1076]], [80, 60, 56], { punta: 'plana' });
  o += pieza(izq, C.jean, [[pol([[276, 740], [320, 740], [290, 1104], [262, 1104], [268, 914]]), C.jeanS]]);
  o += pieza(der, C.jean, [[pol([[360, 740], [400, 740], [396, 1104], [370, 1104], [362, 914]]), C.jeanS]]);
  // Bastas dobladas, más claras
  for (const x of [250, 364]) {
    o += pieza(pol([[x - 31, 1056], [x + 31, 1056], [x + 33, 1082], [x - 33, 1082]]), C.jeanL, [[pol([[x + 8, 1050], [x + 40, 1050], [x + 40, 1088], [x + 10, 1088]]), C.jean]], { w: 4.6, peso: 1.2 });
  }
  // Arrugas: entrepierna, rodillas y el jeans que se arruga sobre la basta
  o += pincel([314, 812], [310, 834], [304, 850], [298, 864], 2.8);
  o += pincel([232, 904], [244, 914], [258, 914], [270, 906], 3) + pincel([330, 906], [342, 916], [356, 916], [368, 908], 3);
  o += pincel([238, 980], [248, 990], [262, 990], [272, 980], 2.4) + pincel([340, 984], [350, 994], [364, 994], [374, 986], 2.4);
  o += pincel([240, 1026], [252, 1036], [266, 1036], [276, 1028], 2.4) + pincel([344, 1028], [354, 1038], [368, 1038], [378, 1030], 2.4);
  return o;
}

// ── Brazo lejano: el codo abajo y la mano arriba con el celular, frente a la nariz ──
function brazoCelular() {
  let o = '';
  // Manga crema arremangada hasta el codo
  const manga = miembro([[184, 590], [218, 486]], [52, 58], { punta: 'redonda' });
  o += pieza(manga, C.polera, [[pol([[204, 470], [240, 470], [208, 610], [184, 610]]), C.poleraS]]);
  // Antebrazo huesudo, del codo a la muñeca
  const ante = miembro([[124, 476], [174, 604]], [34, 46], { punta: 'redonda' });
  o += pieza(ante, C.piel, [[pol([[140, 470], [170, 470], [196, 610], [176, 616]]), C.pielS]]);
  o += pincel([142, 520], [150, 540], [158, 560], [164, 576], 2);
  // La basta de la manga, enrollada sobre el codo
  o += pieza(pol([[160, 576], [208, 590], [200, 614], [152, 600]]), C.polera, [[pol([[186, 570], [216, 570], [212, 620], [190, 620]]), C.poleraS]], { w: 4.6, peso: 1.2 });
  o += L('M162 588 L204 600', 2.2, C.poleraS);
  return o;
}
// El celular y la mano que lo sostiene (van delante de todo)
function celular() {
  let o = '';
  let t = '';
  t += pieza('M-24 -54 H24 Q32 -54 32 -46 V46 Q32 54 24 54 H-24 Q-32 54 -32 46 V-46 Q-32 -54 -24 -54 Z', C.celular, [], { w: 5 });
  t += P('M-25 -45 H25 V41 H-25 Z', C.pantalla);
  // La pantalla: un encabezado cian, la lista y el bicho encontrado, marcado con un círculo
  t += P('M-25 -45 H25 V-33 H-25 Z', C.cian);
  for (let i = 0; i < 4; i++) t += L(`M-18 ${-20 + i * 14} L${i === 0 ? -6 : 16} ${-20 + i * 14}`, 3.4, C.pantallaL);
  t += `<g transform="translate(12 -12)"><circle cx="0" cy="0" r="10" fill="none" stroke="${C.cian}" stroke-width="2.6"/><ellipse cx="0" cy="1" rx="3.8" ry="4.6" fill="${C.cianL}"/>` +
    L('M-3 -4 L-6 -7 M3 -4 L6 -7 M-4 1 L-8 1 M4 1 L8 1 M-3 5 L-6 8 M3 5 L6 8', 1.6, C.cianL) + `</g>`;
  t += `<circle cx="0" cy="48" r="2.4" fill="#3A4150"/>`;
  o += `<g transform="translate(92 418) rotate(-14)">${t}</g>`;
  // Mano: la palma detrás, el pulgar sobre la pantalla y los dedos que asoman por el borde
  o += pieza(curva([[106, 452], [134, 448], [146, 462], [142, 482], [124, 490], [108, 480]], true), C.piel, [[pol([[130, 440], [156, 440], [156, 500], [132, 500]]), C.pielS]], { w: 5, peso: 1.4 });
  for (let i = 0; i < 3; i++) {
    const y = 404 + i * 16, x = 62 + i * 3;
    o += pieza(curva([[x + 14, y], [x - 2, y - 2], [x - 8, y + 5], [x - 3, y + 12], [x + 14, y + 11]], true), C.piel, [[pol([[x + 4, y - 6], [x + 18, y - 6], [x + 18, y + 18], [x + 6, y + 18]]), C.pielS]], { w: 3.6, peso: 0.6 });
  }
  o += pieza(curva([[114, 462], [108, 446], [106, 432], [114, 428], [122, 440], [128, 458]], true), C.piel, [[pol([[116, 424], [134, 424], [134, 466], [118, 466]]), C.pielS]], { w: 4, peso: 0.8 });
  o += L('M110 436 Q114 432 118 434', 1.6, C.pielS);
  return o;
}

// ── Torso: la polera crema con el 6. El pecho se hunde, los hombros caen hacia adelante y la espalda hace joroba ──
const POLERA = curva([[234, 774], [222, 700], [214, 620], [210, 560], [212, 500], [224, 466], [252, 446], [300, 428], [344, 410], [380, 402], [402, 432], [406, 520], [406, 640], [402, 774], [316, 786]], true);
function polera() {
  let o = '';
  o += pieza(POLERA, C.polera, [[pol([[330, 400], [420, 400], [420, 790], [334, 790]]), C.poleraS]]);
  o += numeroChico(`<text x="298" y="700" text-anchor="middle" font-family="${NUMERO}" font-size="138" fill="${C.numero}" stroke="${K}" stroke-width="5" stroke-linejoin="round" paint-order="stroke" transform="rotate(-6 298 640)">6</text>`, 298, 650);
  o += pincel([250, 548], [258, 560], [268, 566], [280, 568], 2.4) + pincel([300, 750], [314, 758], [330, 758], [344, 750], 2.2);
  // El cuello redondo de la polera
  o += pieza('M256 446 Q300 440 342 412 L348 426 Q304 460 262 462 Z', C.polera, [[pol([[310, 400], [356, 400], [356, 466], [314, 466]]), C.poleraS]], { w: 4.4, peso: 0 });
  return o;
}

// ── El chaleco: abierto, acolchado en franjas; el paño cercano sube por la joroba y tiene el cuello parado ──
function chaleco() {
  let o = '';
  // Paño lejano (angosto): el pecho hundido casi lo esconde
  const lejano = curva([[224, 468], [246, 452], [262, 448], [256, 530], [250, 610], [248, 690], [252, 772], [234, 774], [222, 700], [214, 620], [210, 560], [212, 500]], true);
  o += pieza(lejano, C.chaleco, [[pol([[240, 440], [270, 440], [262, 780], [244, 780]]), C.chalecoS]]);
  // Paño cercano: del cierre a la espalda curva
  const cercano = curva([[346, 416], [382, 404], [420, 408], [452, 428], [472, 464], [478, 518], [472, 594], [456, 682], [434, 772], [366, 776], [362, 700], [358, 620], [354, 530], [350, 462]], true);
  o += pieza(cercano, C.chaleco, [[pol([[440, 390], [500, 390], [500, 790], [430, 790], [452, 600]]), C.chalecoS]]);
  // El cuello parado, detrás de la nuca
  o += pieza('M338 422 Q350 404 378 396 Q394 394 402 404 Q382 408 364 416 Q352 424 348 432 Z', C.chaleco, [[pol([[376, 386], [410, 386], [410, 424], [380, 424]]), C.chalecoS]], { w: 4.6, peso: 1 });
  // Las franjas del acolchado siguen la curva de la espalda: la costura y el brillo de cada franja
  for (const [y, c] of [[452, -10], [500, -4], [550, 0], [600, 2], [650, 2], [700, 0], [746, -2]]) {
    o += pincel([356, y], [384, y + 8 + c], [426, y + 8 + c], [464, y - 6 + c], 2.6);
    o += L(`M${364} ${y + 14} Q${390} ${y + 21 + c} ${420} ${y + 18 + c}`, 3, C.chalecoL);
  }
  for (const y of [520, 580, 640, 700]) o += pincel([214, y - 2], [224, y + 2], [238, y + 3], [250, y - 2], 2.2);
  // Cierres a la vista en los dos bordes abiertos
  o += `<path d="M352 440 L356 530 L360 620 L364 700 L368 770" fill="none" stroke="${C.cierre}" stroke-width="4" stroke-dasharray="2.4 3"/>`;
  o += `<path d="M256 470 L250 560 L248 650 L250 766" fill="none" stroke="${C.cierre}" stroke-width="3.4" stroke-dasharray="2.4 3"/>`;
  // Bolsillo con cierre
  o += L('M378 668 L414 656', 3.6) + pieza(pol([[408, 656], [416, 654], [418, 672], [410, 674]]), C.cierre, [], { w: 2.4, peso: 0 });
  return o;
}

// ── Cuello adelantado: sale del pecho y sube en diagonal hacia la cabeza ──
function cuello() {
  let o = '';
  const c = pol([[262, 452], [344, 418], [294, 344], [226, 368]]);
  o += pieza(c, C.piel, [[pol([[290, 334], [350, 334], [350, 460], [312, 460]]), C.pielS], [pol([[222, 356], [300, 336], [304, 384], [232, 398]]), C.pielS]]);
  o += L('M246 410 Q238 420 246 430', 2.6);
  return o;
}

// ── Cabeza: larga y adelantada, nariz de oso hormiguero, ojos desconfiados, barba de días y la linterna ──
function cabeza() {
  let o = '';
  // Pelo de atrás: la nuca revuelta
  const nuca = curva([[300, 170], [336, 176], [356, 210], [352, 252], [336, 290], [318, 300], [300, 260]], true);
  o += pieza(nuca, C.pelo, [[pol([[330, 160], [370, 160], [370, 310], [330, 310]]), C.peloS]]);
  // Cara larga
  const cara = curva([[182, 228], [190, 184], [222, 156], [266, 148], [306, 160], [328, 196], [332, 240], [326, 286], [306, 320], [276, 344], [244, 356], [218, 352], [200, 336], [190, 304], [184, 268]], true);
  o += pieza(cara, C.piel, [[pol([[290, 200], [340, 200], [340, 360], [262, 360], [298, 290]]), C.pielS]]);
  // Barba de tres días: la mandíbula se oscurece apenas y se puntea
  o += P(pol([[194, 312], [214, 330], [246, 338], [284, 324], [316, 292], [326, 290], [306, 322], [276, 346], [244, 358], [218, 354], [200, 338]]), C.barba, ' opacity=".35"');
  for (let i = 0, n = 0; i < 200 && n < 34; i++) {
    const u = azar(i), v = azar(i + 500), x = 196 + u * 130, y = 300 + v * 60;
    // sólo dentro de la franja de la mandíbula: bajo la línea de la mejilla y sobre el borde de la cara
    if (y > 316 - (x - 196) * 0.12 + Math.max(0, x - 290) * 0.2 && y < 352 - Math.max(0, x - 250) * 0.55 && y > 300) { o += `<circle cx="${r1(x)}" cy="${r1(y)}" r="1.4" fill="${C.peloS}" opacity=".55"/>`; n++; }
  }
  // Oreja grande (a la derecha del cuadro)
  o += pieza(curva([[300, 238], [324, 226], [340, 252], [336, 290], [308, 298]], true), C.piel, [[pol([[318, 220], [348, 220], [348, 304], [322, 304]]), C.pielS]], { w: 5, peso: 1.6 });
  o += L('M314 248 Q330 262 320 284', 2.6);
  // Mejilla hundida y las ojeras del que revisa de noche
  o += L('M270 292 Q276 304 272 318', 2.2) + L('M218 266 Q232 272 248 266', 2) + L('M172 260 Q178 264 186 262', 1.8);
  // Ojos chicos y desconfiados, de párpado pesado: miran abajo, al celular
  for (const [x, y, w, h] of [[179, 245, 20, 11], [234, 246, 30, 15]]) {
    o += pieza(`M${x - w / 2} ${y} Q${x} ${y - h} ${x + w / 2} ${y} Q${x} ${y + h * 0.8} ${x - w / 2} ${y} Z`, C.blanco, [], { w: 3.4, peso: 0 });
    o += `<circle cx="${r1(x - w * 0.24)}" cy="${r1(y + 2)}" r="${r1(h * 0.32)}" fill="${K}"/>`;
    o += negro(`M${x - w / 2 - 3} ${y - 1} Q${x} ${y - h - 6} ${x + w / 2 + 4} ${y - 2} L${x + w / 2 + 2} ${r1(y + h * 0.05)} Q${x} ${r1(y - h * 0.3)} ${x - w / 2} ${y + 1} Z`);
  }
  // Cejas: la lejana se frunce hacia la nariz, la cercana sube (desconfía)
  o += negro(pol([[164, 230], [186, 226], [194, 236], [168, 240]]));
  o += negro(pol([[214, 226], [234, 214], [256, 216], [258, 226], [236, 226], [218, 236]]));
  // La nariz larga del oso hormiguero: sale de la cara y cae en punta; sólo el borde de afuera lleva tinta
  o += P(pol([[206, 254], [188, 268], [160, 286], [132, 302], [116, 314], [120, 326], [142, 328], [168, 326], [194, 320], [208, 292]]), C.piel);
  o += P(pol([[122, 320], [148, 322], [176, 320], [196, 316], [194, 322], [166, 328], [134, 330], [120, 326]]), C.pielS);
  o += B('M206 254 Q186 270 160 286 Q132 302 118 314 Q108 326 126 329 Q156 330 190 322', 5);
  o += negro('M146 324 Q154 317 164 319 Q160 324 148 326 Z');
  o += L('M176 322 Q190 322 192 310', 2.4);
  // Boca chica y torcida, concentrada
  o += L('M198 340 Q214 344 232 334', 3.6) + L('M206 350 Q214 352 222 349', 2);
  // Pelo de arriba, revuelto: mechones redondos que se escapan por todos lados, y el mechón canoso
  const pelo = curva([[182, 214], [172, 196], [160, 184], [176, 176], [182, 158], [196, 144], [192, 128], [212, 130], [228, 114], [242, 100], [254, 114], [272, 108], [292, 98], [298, 114], [318, 120], [334, 132], [352, 126], [346, 148], [354, 166], [362, 182], [344, 188], [342, 206], [300, 194], [256, 192], [214, 202]], true);
  o += pieza(pelo, C.pelo, [[pol([[306, 100], [372, 110], [372, 220], [312, 198]]), C.peloS]]);
  o += pincel([200, 176], [214, 158], [232, 144], [252, 138], 2.6) + pincel([284, 146], [302, 152], [318, 166], [330, 184], 2.6) + pincel([182, 192], [190, 180], [200, 172], [212, 168], 2.2);
  o += L('M222 166 Q236 140 262 126', 3.4, C.peloL) + L('M300 128 Q320 136 334 152', 3, C.peloL);
  o += pieza(curva([[232, 190], [238, 172], [252, 156], [272, 146], [262, 160], [250, 176], [244, 192]], true), C.cana, [[pol([[256, 140], [280, 140], [266, 196], [248, 196]]), '#8B95A1']], { w: 3, peso: 0.6 });
  // Un mechón cae a la frente por debajo de la cinta
  o += pieza(curva([[214, 206], [222, 222], [220, 238], [212, 246], [214, 232], [210, 218]], true), C.pelo, [], { w: 3.4, peso: 0.6 });
  // La linterna de minero: la cinta alrededor de la cabeza y el foco cian en la frente
  o += B('M180 214 Q254 190 340 204', 15) + B('M180 214 Q254 190 340 204', 8, C.cinta);
  o += pieza('M182 186 H214 Q220 186 220 192 V210 Q220 216 214 216 H182 Q176 216 176 210 V192 Q176 186 182 186 Z', C.linterna, [[pol([[204, 180], [226, 180], [226, 222], [206, 222]]), C.linternaS]], { w: 4.4, peso: 1 });
  o += `<circle cx="${LENTE[0]}" cy="${LENTE[1]}" r="12" fill="${C.cian}" opacity=".55" filter="url(#${ids}-brillo)"/>`;
  o += `<circle cx="${LENTE[0]}" cy="${LENTE[1]}" r="8.4" fill="${C.cian}" stroke="${K}" stroke-width="3.2"/><circle cx="${LENTE[0] - 2.6}" cy="${LENTE[1] - 2.6}" r="2.6" fill="#FFFFFF"/>`;
  return `<g transform="${CABEZA}">${o}</g>`;
}
// El haz de la linterna cae sobre el celular
function haz() {
  const [x, y] = girar(LENTE);
  const id = `${ids}-haz`;
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x}" y1="${y}" x2="84" y2="430"><stop offset="0" stop-color="${C.cianL}" stop-opacity=".05"/><stop offset=".55" stop-color="${C.cianL}" stop-opacity=".12"/><stop offset="1" stop-color="${C.cianL}" stop-opacity=".26"/></linearGradient></defs>` +
    `<path d="M${x - 2} ${y - 6} L30 366 L132 486 L${x + 6} ${y + 4} Z" fill="url(#${id})"/>`;
}

// ── Brazo cercano: largo, cuelga desde la joroba con el frasco de bichos tomado por la tapa ──
function brazoFrasco() {
  let o = '';
  // Manga crema arremangada
  const manga = miembro([[440, 600], [418, 462]], [52, 62], { punta: 'redonda' });
  o += pieza(manga, C.polera, [[pol([[426, 450], [470, 450], [470, 620], [440, 620]]), C.poleraS]]);
  // La sisa del chaleco abraza el hombro
  o += B('M394 446 Q422 432 446 460 Q456 490 452 514', 9);
  // Antebrazo largo y huesudo
  const ante = miembro([[452, 766], [442, 612]], [36, 48], { punta: 'redonda' });
  o += pieza(ante, C.piel, [[pol([[454, 600], [480, 600], [474, 776], [454, 776]]), C.pielS]]);
  o += pincel([436, 650], [434, 680], [436, 708], [440, 732], 2);
  o += pieza(pol([[412, 586], [466, 590], [464, 616], [414, 612]]), C.polera, [[pol([[444, 580], [474, 580], [474, 622], [446, 622]]), C.poleraS]], { w: 4.6, peso: 1.2 });
  o += L('M416 600 L462 603', 2.2, C.poleraS);
  o += `<g transform="translate(455 790) scale(1.22) translate(-455 -790)">${frasco()}</g>`;
  // La mano toma el frasco por la tapa: el dorso arriba y los dedos que bajan por delante
  o += pieza(curva([[430, 766], [472, 764], [486, 778], [482, 794], [440, 796], [424, 784]], true), C.piel, [[pol([[464, 756], [494, 756], [494, 800], [466, 800]]), C.pielS]], { w: 5, peso: 1.4 });
  for (let i = 0; i < 4; i++) {
    const x = 436 + i * 12;
    o += pieza(curva([[x - 6, 786], [x + 6, 786], [x + 7, 806], [x, 812], [x - 7, 806]], true), C.piel, [[pol([[x + 1, 782], [x + 10, 782], [x + 10, 814], [x + 2, 814]]), C.pielS]], { w: 3.4, peso: 0.6 });
  }
  return o;
}

// ── El frasco: vidrio con tres bichitos de caricatura adentro y la tapa azul ──
function bicho(x, y, giro, { patasArriba = false, e = 1 } = {}) {
  let b = '';
  // Patas y antenas
  b += L('M-6 -5 L-10 -12 M0 -6 L1 -14 M6 -5 L10 -12 M-6 5 L-10 12 M0 6 L1 14 M6 5 L10 12', 2, K);
  b += L('M12 -3 Q20 -10 18 -16 M12 3 Q22 2 24 -4', 1.8, K);
  // Cuerpo con su caparazón y el brillo cian
  b += `<ellipse cx="0" cy="0" rx="11" ry="8" fill="${C.bicho}" stroke="${K}" stroke-width="2.4"/>`;
  b += L('M-11 0 L4 0', 1.4, C.bichoL) + `<ellipse cx="-3" cy="-4" rx="4" ry="1.8" fill="${C.cianL}" opacity=".8"/>`;
  // Cabeza con los ojos grandes
  b += `<circle cx="11" cy="0" r="6" fill="${C.bicho}" stroke="${K}" stroke-width="2.2"/>`;
  b += `<circle cx="12.5" cy="-2.4" r="3.2" fill="#FFFFFF" stroke="${K}" stroke-width="1.2"/><circle cx="13.4" cy="-2.2" r="1.4" fill="${K}"/>`;
  b += `<circle cx="12.5" cy="2.8" r="2.8" fill="#FFFFFF" stroke="${K}" stroke-width="1.2"/><circle cx="13.2" cy="3" r="1.2" fill="${K}"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${giro}) scale(${e}${patasArriba ? ' -1' : ''})">${b}</g>`;
}
function frasco() {
  let o = '';
  const vidrio = 'M424 808 H486 Q496 808 496 818 V890 Q496 904 482 904 H428 Q414 904 414 890 V818 Q414 808 424 808 Z';
  const id = nuevoId();
  o += `<clipPath id="${id}"><path d="${vidrio}"/></clipPath>`;
  o += P(vidrio, K, ' transform="translate(2 2.3)" stroke="#0C0D11" stroke-width="5.4"');
  o += P(vidrio, C.vidrio);
  o += `<g clip-path="url(#${id})">${P(pol([[470, 800], [510, 800], [510, 910], [474, 910]]), C.vidrioS)}`;
  // Los bichos: uno camina, otro quedó de espaldas y el tercero trepa mirando hacia afuera
  o += bicho(444, 888, -4) + bicho(474, 884, 180, { patasArriba: true }) + bicho(434, 846, -70, { e: 0.95 });
  // El brillo del vidrio pasa por encima
  o += P(pol([[424, 820], [434, 820], [434, 892], [424, 892]]), '#FFFFFF', ' opacity=".55"') + P(pol([[440, 820], [444, 820], [444, 860], [440, 860]]), '#FFFFFF', ' opacity=".45"');
  o += `</g>`;
  o += B(vidrio, 5);
  // La tapa azul con su rosca
  o += pieza('M418 786 H492 Q498 786 498 792 V806 Q498 812 492 812 H418 Q412 812 412 806 V792 Q412 786 418 786 Z', C.tapa, [[pol([[470, 780], [504, 780], [504, 816], [472, 816]]), C.tapaS], [pol([[408, 780], [500, 780], [500, 790], [408, 790]]), C.tapaL]], { w: 4.6, peso: 1.2 });
  for (let x = 424; x <= 486; x += 9) o += L(`M${x} 794 L${x} 806`, 1.6, C.tapaS);
  return o;
}

export function tamandua({ prefijo = 'tamandua' } = {}) {
  reiniciar(prefijo);
  ids = prefijo;
  const defs = `<defs><filter id="${ids}-brillo" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter></defs>`;
  const tronco = `${brazoCelular()}${cuello()}${polera()}${chaleco()}${cabeza()}${brazoFrasco()}${haz()}${celular()}`;
  return `<g>${defs}${zapatilla(-1)}${zapatilla(1)}${piernas()}<g transform="${INCLINA}">${tronco}</g></g>`;
}

export const vista = () => lamina(tamandua());
