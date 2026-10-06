// Lupe en la línea de la banda: la que pregunta primero. Sesenta y tantos, delgada y erguida, el moño plateado
// atravesado por un lápiz amarillo y la lupa de joyero que le agranda el ojo cercano (el otro, de párpado pesado: la
// asimetría es su sello). Gabardina arena larga y abierta con el cuello levantado, polera azul marino con su número (el
// 1 de su placa E1), humita azul, el cronómetro plateado colgando, el índice arriba («¿por qué?») y el portapapeles.
// Marco 600 × 1260, suelo en y = 1240, mira a la derecha.
import { K, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, nuevoId, r1, numeroChico } from './base.mjs';
import { NUMERO, lamina } from './tinta.mjs';

export const C = {
  piel: '#F2CDB0', pielS: '#D6A585', pielL: '#FBE2CD', mejilla: '#E8907F', labio: '#C27A70',
  pelo: '#DCE2E9', peloS: '#A9B4C2', peloL: '#F6F8FB',
  gab: '#E6D9B6', gabS: '#C1AE86', gabL: '#F4ECD6', forro: '#6E604A', forroS: '#544936',
  polera: '#1E3A5F', poleraS: '#132840', poleraL: '#2E5280',
  humita: '#4C86C6', humitaS: '#2F5F97', lunar: '#E9F0F7',
  pant: '#2A303C', pantS: '#1A1F28', pantL: '#3D4655',
  zap: '#2F4E78', zapS: '#1F3554', zapL: '#4A6C99', suela: '#E9DFC6', suelaS: '#BCAE8C',
  boton: '#2B4467',
  lapiz: '#F2C230', lapizS: '#C99A17', lapizL: '#FBE08A', madera: '#EFD1A0', goma: '#E3A1AE', mina: '#3A3D45',
  metal: '#C9D2DC', metalS: '#8E99A6', metalL: '#EEF2F6', esfera: '#F7F3E8',
  lupa: '#262D38', lupaL: '#3E4858', cian: '#17C3B2', cianS: '#0A8A7E', cianL: '#7FD8CF', vidrio: '#DDF4F1',
  iris: '#5D86AE', blanco: '#FBFAF6',
  tabla: '#35679A', tablaS: '#24496F', papel: '#F4ECD8', papelS: '#D8CDB2', renglon: '#9FB2C8'
};

// ── Zapatos grandes de cordones, con la suela gruesa de crepé ──
function zapato(lado) {
  // lado -1: el de la izquierda del cuadro (punta hacia la izquierda); +1: el de la derecha
  const x0 = lado < 0 ? 258 : 342, s = -lado, X = (x) => x0 + s * x;
  let o = '';
  // La suela gruesa de crepé, con su textura
  o += pieza(pol([[X(-102), 1210], [X(38), 1210], [X(40), 1240], [X(-104), 1240]]), C.suela, [[pol([[X(-114), 1229], [X(50), 1228], [X(50), 1246], [X(-114), 1246]]), C.suelaS]], { w: 5 });
  for (let i = 0; i < 7; i++) o += `<circle cx="${X(-90 + i * 18)}" cy="1222" r="1.6" fill="${C.suelaS}"/>`;
  // El cuero: empeine alto, punta redonda y ancha
  const cuero = curva([[X(-20), 1158], [X(28), 1156], [X(38), 1182], [X(38), 1206], [X(-40), 1210], [X(-100), 1210], [X(-102), 1192], [X(-82), 1176], [X(-48), 1168]], true);
  o += pieza(cuero, C.zap, [[pol([[X(8), 1150], [X(46), 1150], [X(46), 1220], [X(12), 1220]]), C.zapS], [pol([[X(-106), 1202], [X(-30), 1204], [X(-30), 1222], [X(-106), 1222]]), C.zapS], [pol([[X(-88), 1180], [X(-62), 1172], [X(-60), 1180], [X(-86), 1188]]), C.zapL]]);
  // La puntera cosida, el contrafuerte del talón y la lengüeta con sus cordones
  o += L(`M${X(-66)} 1176 Q${X(-56)} 1192 ${X(-62)} 1210`, 2.6) + L(`M${X(14)} 1164 Q${X(4)} 1186 ${X(12)} 1208`, 2.2);
  for (let i = 0; i < 3; i++) {
    const y = 1186 - i * 9, x = -36 + i * 7;
    o += L(`M${X(x - 10)} ${y + 3} L${X(x + 10)} ${y - 3}`, 3.6, C.suela);
  }
  return o;
}

// El fondo de la gabardina (el forro de atrás, que se ve entre las piernas)
const FONDO = pol([[232, 790], [372, 790], [392, 1004], [214, 1008]]);

// ── Piernas: pantalón oscuro y delgado que cae sobre el zapato ──
function piernas() {
  let o = '';
  o += pieza(FONDO, C.forro, [[pol([[300, 780], [400, 780], [400, 1010], [312, 1010]]), C.forroS]], { peso: 0 });
  const izq = miembro([[272, 800], [266, 1010], [262, 1184]], [64, 48, 50], { punta: 'plana' });
  const der = miembro([[330, 800], [336, 1010], [342, 1184]], [64, 48, 50], { punta: 'plana' });
  o += pieza(izq, C.pant, [[pol([[276, 780], [312, 780], [290, 1196], [270, 1196]]), C.pantS]]);
  o += pieza(der, C.pant, [[pol([[342, 780], [376, 780], [372, 1196], [350, 1196]]), C.pantS]]);
  // El quiebre del pantalón sobre el zapato
  o += pincel([240, 1150], [252, 1158], [266, 1158], [280, 1150], 2.6) + pincel([322, 1152], [334, 1160], [348, 1160], [362, 1152], 2.6);
  o += L('M270 1016 L263 1150', 2, C.pantL) + L('M333 1016 L341 1150', 2, C.pantL);
  o += pincel([252, 1064], [256, 1080], [256, 1096], [252, 1112], 2.2) + pincel([352, 1064], [350, 1080], [350, 1096], [354, 1112], 2.2);
  return o;
}

// ── Torso: la polera azul marino con el 1, el cuello parado de la gabardina detrás de la nuca ──
function torso() {
  let o = '';
  // El cuello de la gabardina, levantado detrás del cuello
  const cuelloAtras = curva([[252, 550], [250, 510], [244, 476], [272, 490], [304, 496], [338, 488], [364, 470], [362, 510], [360, 552], [304, 542]], true);
  o += pieza(cuelloAtras, C.gab, [[pol([[318, 460], [380, 460], [380, 560], [322, 560]]), C.gabS], [pol([[240, 524], [380, 524], [380, 560], [240, 560]]), '#A99470']]);
  o += L('M256 500 Q258 520 262 540', 2, C.gabS) + L('M354 494 Q352 516 350 540', 2, '#8E7B59');
  // Cuello delgado, con sus tendones
  o += pieza(pol([[284, 466], [322, 466], [326, 534], [280, 534]]), C.piel, [[pol([[278, 456], [330, 456], [330, 490], [278, 496]]), C.pielS], [pol([[310, 480], [332, 480], [332, 540], [314, 540]]), C.pielS]], { w: 5 });
  o += L('M292 494 L296 524', 2.2) + L('M316 496 L314 522', 2);
  // La polera
  const pol1 = curva([[278, 524], [304, 534], [330, 524], [372, 546], [376, 640], [370, 812], [304, 820], [238, 812], [234, 640], [238, 546]], true);
  o += pieza(pol1, C.polera, [[pol([[330, 520], [390, 520], [390, 830], [338, 830]]), C.poleraS], [pol([[226, 540], [262, 540], [258, 830], [226, 830]]), C.poleraL]]);
  o += L('M280 526 Q304 542 330 526', 4);
  // El número de su placa, de losa gruesa
  o += numeroChico(`<text x="303" y="748" text-anchor="middle" font-family="${NUMERO}" font-size="144" fill="${C.lapiz}" stroke="${K}" stroke-width="5" paint-order="stroke" transform="rotate(-3 303 690)">1</text>`, 303, 696);
  o += pincel([248, 772], [262, 784], [280, 788], [300, 786], 2.4) + pincel([318, 784], [334, 782], [348, 776], [358, 766], 2.2);
  return o;
}

// ── El cronómetro plateado, colgando de su cordón ──
function cronometro() {
  let o = '';
  const cx = 358, cy = 688;
  for (const d of [`M290 532 C304 584 334 626 ${cx - 2} ${cy - 30}`, `M332 534 C344 584 356 616 ${cx + 2} ${cy - 30}`]) {
    o += `<path d="${d}" fill="none" stroke="${K}" stroke-width="5.5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.metal}" stroke-width="2.6" stroke-dasharray="4 2.4" stroke-linecap="round"/>`;
  }
  o += `<circle cx="${cx}" cy="${cy - 30}" r="6" fill="none" stroke="${K}" stroke-width="6"/><circle cx="${cx}" cy="${cy - 30}" r="6" fill="none" stroke="${C.metal}" stroke-width="2.6"/>`;
  o += pieza(pol([[cx - 6, cy - 28], [cx + 6, cy - 28], [cx + 6, cy - 20], [cx - 6, cy - 20]]), C.metal, [], { w: 3, peso: 0 });
  o += pieza(pol([[cx + 14, cy - 22], [cx + 22, cy - 14], [cx + 18, cy - 10], [cx + 10, cy - 18]]), C.metal, [], { w: 2.6, peso: 0 });
  const caja = `M${cx - 23} ${cy} a23 23 0 1 0 46 0 a23 23 0 1 0 -46 0 Z`;
  o += pieza(caja, C.metal, [[pol([[cx + 2, cy - 30], [cx + 30, cy - 30], [cx + 30, cy + 30], [cx - 20, cy + 30]]), C.metalS]], { w: 4.6, peso: 1.4 });
  o += `<circle cx="${cx}" cy="${cy}" r="16.5" fill="${C.esfera}" stroke="${K}" stroke-width="2.6"/>`;
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, r0 = i % 3 ? 13.6 : 11.6;
    o += L(`M${r1(cx + r0 * Math.sin(a))} ${r1(cy - r0 * Math.cos(a))} L${r1(cx + 15.2 * Math.sin(a))} ${r1(cy - 15.2 * Math.cos(a))}`, i % 3 ? 1.2 : 2);
  }
  o += L(`M${cx} ${cy} L${cx + 6} ${cy - 11}`, 2.6) + L(`M${cx} ${cy} L${cx - 3} ${cy + 6}`, 1.6, C.cianS);
  o += `<circle cx="${cx}" cy="${cy}" r="2.4" fill="${K}"/>`;
  o += L(`M${cx - 16} ${cy - 8} A17 17 0 0 1 ${cx - 6} ${cy - 16}`, 2.4, '#FFFFFF');
  return o;
}

// ── La gabardina abierta: dos delanteros largos, solapas anchas, botones, cinturón suelto y bolsillos ──
const DEL_IZQ = curva([[262, 532], [228, 544], [208, 570], [202, 650], [198, 780], [190, 900], [182, 1006], [222, 1014], [252, 1012], [254, 900], [252, 760], [252, 700], [262, 610], [274, 534]], true);
const DEL_DER = curva([[334, 534], [372, 546], [392, 570], [398, 660], [404, 780], [412, 900], [420, 1002], [388, 1012], [352, 1012], [352, 900], [352, 780], [356, 702], [344, 612], [332, 536]], true);
function gabardina() {
  let o = '';
  o += pieza(DEL_IZQ, C.gab, [[pol([[232, 530], [262, 530], [262, 1020], [238, 1020], [244, 760]]), C.gabS], [pol([[190, 540], [214, 540], [206, 1020], [176, 1020]]), C.gabL]]);
  o += pieza(DEL_DER, C.gab, [[pol([[372, 530], [430, 530], [430, 1020], [384, 1020], [388, 760]]), C.gabS]]);
  // Solapas anchas, dobladas hacia afuera
  const solIzq = pol([[274, 534], [262, 610], [252, 700], [228, 624], [220, 576], [242, 566]]);
  o += pieza(solIzq, C.gabL, [[pol([[230, 600], [266, 600], [256, 706]]), C.gab]], { w: 4.6, peso: 1.2 });
  const solDer = pol([[332, 536], [344, 612], [356, 702], [376, 626], [384, 580], [360, 570]]);
  o += pieza(solDer, C.gab, [[pol([[350, 560], [392, 560], [392, 706], [358, 706]]), C.gabS]], { w: 4.6, peso: 1.2 });
  // Pespuntes del borde delantero
  o += L('M248 712 L246 1004', 1.6, C.gabS) + L('M360 714 L360 1004', 1.6, '#A8956C');
  // Botones de la doble botonadura
  for (const [x, y] of [[228, 708], [228, 760], [380, 712], [382, 764]]) o += `<circle cx="${x}" cy="${y}" r="6.5" fill="${C.boton}" stroke="${K}" stroke-width="2.6"/><circle cx="${x - 1.6}" cy="${y - 1.6}" r="1.8" fill="#5D7FAA"/>`;
  // El cinturón suelto en las presillas, con su hebilla en el delantero cercano
  o += pieza(pol([[352, 802], [406, 798], [408, 820], [352, 824]]), C.gab, [[pol([[384, 790], [414, 790], [414, 830], [386, 830]]), C.gabS]], { w: 4, peso: 1 });
  o += pieza(pol([[364, 794], [386, 793], [387, 828], [365, 829]]), C.metal, [[pol([[378, 788], [392, 788], [392, 834], [380, 834]]), C.metalS]], { w: 3.4, peso: 0.8 });
  o += P(pol([[370, 801], [381, 800], [381, 821], [370, 822]]), C.gab) + L('M375.5 801 L375.5 821', 2.6, C.metalS);
  o += pieza(pol([[256, 804], [264, 804], [264, 822], [256, 822]]), C.gab, [], { w: 3, peso: 0 });
  // Bolsillos sesgados con su tapa
  o += pieza(pol([[204, 876], [240, 864], [244, 878], [208, 890]]), C.gab, [], { w: 3.4, peso: 0.6 });
  o += pieza(pol([[366, 868], [400, 878], [398, 892], [364, 882]]), C.gabS, [], { w: 3.4, peso: 0.6 });
  // Pliegues que cuelgan
  o += pincel([216, 900], [212, 930], [208, 960], [204, 990], 2.6) + pincel([232, 930], [232, 954], [230, 976], [228, 998], 2.2);
  o += pincel([392, 900], [396, 930], [400, 960], [404, 990], 2.6) + pincel([224, 650], [222, 690], [220, 730], [218, 760], 2.2);
  return o;
}

// ── La humita azul con lunares, al cuello ──
function humita() {
  let o = '';
  const ala = (s) => curva([[305, 528], [305 + s * 16, 514], [305 + s * 30, 512], [305 + s * 32, 530], [305 + s * 30, 546], [305 + s * 16, 544]], true);
  o += pieza(ala(-1), C.humita, [[pol([[260, 534], [306, 534], [306, 552], [260, 552]]), C.humitaS]], { w: 4, peso: 1 });
  o += pieza(ala(1), C.humita, [[pol([[300, 534], [346, 534], [346, 552], [300, 552]]), C.humitaS]], { w: 4, peso: 1 });
  for (const [x, y] of [[286, 522], [280, 536], [292, 538], [322, 522], [330, 536], [318, 538]]) o += `<circle cx="${x}" cy="${y}" r="2.2" fill="${C.lunar}"/>`;
  o += pieza(pol([[298, 520], [312, 520], [314, 538], [296, 538]]), C.humitaS, [], { w: 3.4, peso: 0 });
  o += L('M286 520 Q292 528 288 538', 1.6, C.humitaS) + L('M324 520 Q318 528 322 538', 1.6, C.humitaS);
  return o;
}

// ── El brazo levantado (el lejano): la manga, la trabilla del puño y la mano con el índice arriba ──
function brazoIndice() {
  let o = '';
  const brazo = miembro([[376, 566], [430, 674]], [62, 54], { punta: 'redonda' });
  o += pieza(brazo, C.gab, [[pol([[400, 560], [470, 600], [452, 700], [418, 690]]), C.gabS]]);
  o += pincel([392, 600], [404, 620], [414, 640], [418, 656], 2.4);
  const ante = miembro([[454, 560], [432, 676]], [52, 56], { punta: 'redonda' });
  o += pieza(ante, C.gab, [[pol([[452, 540], [490, 540], [470, 690], [440, 690]]), C.gabS]]);
  o += pincel([424, 640], [434, 650], [446, 654], [458, 652], 2.4);
  // La trabilla del puño, con su hebilla
  o += pieza(pol([[426, 578], [480, 586], [476, 602], [424, 594]]), C.gab, [[pol([[460, 576], [486, 576], [482, 606], [460, 606]]), C.gabS]], { w: 3.6, peso: 0.8 });
  o += pieza(pol([[438, 580], [450, 582], [448, 598], [436, 596]]), C.metal, [], { w: 2.4, peso: 0 });
  o += `<g transform="translate(456 564) rotate(-6) scale(1.12)">${manoIndice()}</g>`;
  return o;
}

// La mano del «¿por qué?» (coordenadas propias, la muñeca en el origen): el puño de canto, los tres dedos recogidos
// apilados hacia la cara, el pulgar cruzado encima y el índice bien arriba
function manoIndice() {
  let m = '';
  m += pieza(curva([[-16, 2], [-20, -26], [-16, -50], [0, -58], [18, -54], [25, -36], [23, -12], [14, 4]], true), C.piel, [[pol([[8, -66], [34, -66], [34, 8], [10, 8]]), C.pielS]], { w: 4.6, peso: 1.4 });
  // El índice, largo y huesudo, con sus nudillos
  m += pieza(curva([[-13, -46], [-14, -80], [-11, -106], [-4, -112], [3, -107], [5, -80], [5, -48]], true), C.piel, [[pol([[-1, -118], [10, -118], [10, -44], [1, -44]]), C.pielS]], { w: 4.4, peso: 1.2 });
  m += L('M-11 -72 Q-5 -69 1 -72', 1.8, C.pielS) + L('M-10 -90 Q-5 -88 0 -90', 1.6, C.pielS);
  m += P(curva([[-9, -104], [-5, -108], [-1, -104], [-3, -99], [-8, -99]], true), C.pielL);
  // Los tres dedos recogidos, apilados
  for (let i = 0; i < 3; i++) {
    const y = -42 + i * 13;
    m += pieza(curva([[2, y - 6], [-16, y - 7], [-26, y - 2], [-25, y + 5], [-14, y + 7], [2, y + 6]], true), C.piel, [[pol([[-30, y + 2], [6, y + 2], [6, y + 10], [-30, y + 10]]), C.pielS]], { w: 3.4, peso: 0.6 });
  }
  // El pulgar, cruzado encima de los dedos
  m += pieza(curva([[22, -6], [18, -26], [4, -38], [-14, -42], [-19, -35], [-8, -29], [6, -19], [10, -4]], true), C.piel, [[pol([[-24, -32], [24, -24], [24, -2], [8, -2]]), C.pielS]], { w: 4, peso: 1 });
  m += L('M-12 -40 Q-15 -37 -13 -33', 1.6, C.pielS);
  return m;
}

// ── El brazo cercano: la manga cae y la mano sostiene el portapapeles por el canto ──
function brazoPortapapeles() {
  let o = '';
  const manga = miembro([[230, 560], [206, 712], [212, 836]], [64, 54, 50], { punta: 'plana' });
  o += pieza(manga, C.gab, [[pol([[222, 560], [262, 560], [244, 848], [222, 848], [232, 700]]), C.gabS], [pol([[186, 560], [204, 560], [186, 848], [176, 848]]), C.gabL]]);
  o += pincel([214, 690], [222, 700], [232, 704], [242, 704], 2.4) + pincel([198, 760], [202, 780], [204, 800], [202, 816], 2.2);
  // La hombrera con su botón
  o += pieza(pol([[232, 546], [270, 540], [272, 554], [234, 562]]), C.gab, [[pol([[256, 536], [278, 536], [278, 566], [258, 566]]), C.gabS]], { w: 3.4, peso: 0.6 });
  o += `<circle cx="262" cy="549" r="3.4" fill="${C.boton}" stroke="${K}" stroke-width="1.8"/>`;
  // La trabilla del puño
  o += pieza(pol([[184, 806], [238, 808], [238, 824], [184, 822]]), C.gab, [[pol([[220, 800], [244, 800], [244, 830], [222, 830]]), C.gabS]], { w: 3.6, peso: 0.8 });
  o += pieza(pol([[196, 808], [208, 808], [208, 822], [196, 822]]), C.metal, [], { w: 2.4, peso: 0 });
  // El portapapeles: tabla azul, hoja con renglones, la pinza y un visto bueno cian
  let t = '';
  t += pieza(pol([[-56, -6], [50, -6], [50, 140], [-56, 140]]), C.tabla, [[pol([[30, -10], [56, -10], [56, 146], [32, 146]]), C.tablaS]], { w: 5, peso: 1.6 });
  t += pieza(pol([[-46, 10], [40, 10], [40, 130], [-46, 130]]), C.papel, [[pol([[24, 6], [44, 6], [44, 134], [26, 134]]), C.papelS]], { w: 2.8, peso: 0 });
  for (let i = 0; i < 4; i++) {
    const y = 40 + i * 22;
    t += pieza(pol([[-38, y - 7], [-26, y - 7], [-26, y + 5], [-38, y + 5]]), C.papel, [], { w: 2, peso: 0 });
    t += L(`M-18 ${y} L${i % 2 ? 14 : 24} ${y}`, 2.4, C.renglon);
  }
  t += L('M-36 39 L-32 44 L-23 31', 3, C.cianS) + L('M-36 61 L-32 66 L-23 53', 3, C.cianS);
  t += pieza(pol([[-22, -14], [16, -14], [20, 10], [-26, 10]]), C.metal, [[pol([[2, -18], [24, -18], [24, 14], [4, 14]]), C.metalS]], { w: 3.6, peso: 0.8 });
  t += `<circle cx="-3" cy="-4" r="4.4" fill="${K}"/>`;
  o += `<g transform="translate(174 852) rotate(-5)">${t}</g>`;
  // La mano: el dorso arriba y los cuatro dedos que abrazan el canto
  o += pieza(curva([[196, 832], [228, 834], [236, 850], [230, 868], [208, 870], [196, 856]], true), C.piel, [[pol([[220, 826], [242, 826], [242, 874], [222, 874]]), C.pielS]], { w: 4.6, peso: 1.4 });
  for (let i = 0; i < 4; i++) {
    const y = 858 + i * 13;
    o += pieza(curva([[214, y], [232, y - 2], [240, y + 5], [234, y + 12], [216, y + 11]], true), C.piel, [[pol([[228, y - 4], [244, y - 4], [244, y + 16], [230, y + 16]]), C.pielS]], { w: 3.4, peso: 0.7 });
  }
  return o;
}

// ── El lápiz amarillo (en coordenadas propias, a lo largo del eje) ──
export function lapiz() {
  let o = '';
  o += pieza(pol([[0, -7], [14, -7], [14, 7], [0, 7]]), C.goma, [], { w: 3.4, peso: 0 });
  o += pieza(pol([[14, -7.5], [28, -7.5], [28, 7.5], [14, 7.5]]), C.metal, [[pol([[12, 2], [30, 2], [30, 10], [12, 10]]), C.metalS]], { w: 3.4, peso: 0 });
  o += L('M19 -7 L19 7 M23 -7 L23 7', 1.4, C.metalS);
  o += pieza(pol([[28, -7], [128, -7], [128, 7], [28, 7]]), C.lapiz, [[pol([[26, 2.4], [130, 2.4], [130, 10], [26, 10]]), C.lapizS], [pol([[26, -10], [130, -10], [130, -3], [26, -3]]), C.lapizL]], { w: 3.6, peso: 0.8 });
  o += pieza(pol([[128, -7], [152, -2], [152, 2], [128, 7]]), C.madera, [[pol([[126, 2], [156, 0], [156, 10], [126, 10]]), '#D2AE78']], { w: 3.4, peso: 0 });
  o += negro(pol([[146, -3.4], [158, 0], [146, 3.4]]));
  return o;
}

// ── Cabeza: cara delgada de pómulos marcados, nariz puntuda, el moño plateado y el lápiz ──
function cabeza() {
  let o = '';
  // El lápiz, que atraviesa el moño (va detrás)
  o += `<g transform="translate(202 312) rotate(-23)">${lapiz()}</g>`;
  // El moño, alto y atrás
  const mono = curva([[238, 276], [247, 249], [276, 238], [307, 249], [316, 274], [305, 299], [275, 308], [247, 299]], true);
  o += pieza(mono, C.pelo, [[pol([[286, 234], [324, 234], [324, 314], [268, 314], [298, 276]]), C.peloS], [pol([[243, 256], [268, 241], [260, 268]]), C.peloL]]);
  o += pincel([251, 276], [258, 257], [279, 248], [299, 259], 2.4) + pincel([258, 291], [273, 299], [295, 293], [304, 278], 2.2) + pincel([269, 266], [279, 262], [290, 270], [286, 280], 2);
  // Cara
  const cara = curva([[236, 380], [244, 330], [278, 302], [330, 298], [368, 318], [384, 352], [388, 396], [386, 434], [378, 464], [356, 488], [326, 496], [294, 490], [264, 468], [242, 430]], true);
  o += pieza(cara, C.piel, [[pol([[362, 330], [400, 330], [400, 500], [348, 500], [368, 430]]), C.pielS]]);
  // Mejillas rosadas
  o += `<ellipse cx="282" cy="454" rx="20" ry="10" fill="${C.mejilla}" opacity=".5"/><ellipse cx="374" cy="428" rx="9" ry="7" fill="${C.mejilla}" opacity=".45"/>`;
  // Surco de la mejilla, hoyuelo y mentón
  o += L('M368 446 Q350 448 344 462', 2.2) + L('M268 452 Q276 464 290 468', 1.8, C.pielS);
  // Boca chica, media sonrisa de lado
  o += pieza(curva([[350, 471], [366, 475], [381, 466], [375, 478], [362, 482], [352, 478]], true), C.labio, [], { w: 2.4, peso: 0 });
  o += L('M344 468 Q364 476 382 464', 3.4) + L('M382 464 Q386 460 386 454', 2.6) + L('M341 463 Q338 468 342 473', 2);
  o += L('M334 490 Q346 494 358 489', 1.8);
  // Nariz larga y puntuda: nace entre los ojos; sólo su borde de afuera lleva tinta
  o += P(pol([[334, 386], [348, 402], [360, 412], [398, 436], [410, 444], [404, 452], [386, 452], [364, 444], [348, 428], [338, 404]]), C.piel);
  o += P(pol([[380, 446], [410, 446], [404, 453], [380, 453]]), C.pielS);
  o += B('M334 386 Q346 400 360 412 L398 436 Q416 446 404 452 L386 452', 5);
  o += L('M370 448 Q372 438 382 439', 2.4);
  o += negro(pol([[386, 446], [398, 447], [396, 452], [386, 452]]));
  // El ojo lejano: párpado pesado y pupila chica que mira a la derecha
  const [ex, ey, ew, eh] = [362, 394, 26, 14];
  o += pieza(`M${ex - ew / 2} ${ey} Q${ex} ${ey - eh} ${ex + ew / 2} ${ey} Q${ex} ${ey + eh * 0.8} ${ex - ew / 2} ${ey} Z`, C.blanco, [], { w: 3.2, peso: 0 });
  o += `<circle cx="${ex + 5}" cy="${ey + 2}" r="4" fill="${K}"/>`;
  o += negro(`M${ex - ew / 2 - 3} ${ey - 1} Q${ex} ${ey - eh - 6} ${ex + ew / 2 + 4} ${ey - 2} L${ex + ew / 2 + 2} ${ey + 1} Q${ex} ${ey - eh * 0.3} ${ex - ew / 2} ${ey + 2} Z`);
  // Patas de gallo en el rabillo
  o += L(`M${ex + 16} ${ey - 4} l7 -4 M${ex + 17} ${ey + 2} l8 0 M${ex + 15} ${ey + 7} l6 4`, 1.8);
  // La ceja lejana, baja y desconfiada
  o += negro(pol([[338, 372], [354, 364], [374, 360], [388, 364], [374, 368], [356, 372], [342, 380]]));
  // El pelo plateado tirado hacia atrás, hacia el moño
  const pelo = curva([[240, 446], [222, 412], [220, 362], [236, 318], [266, 292], [306, 282], [346, 288], [374, 306], [388, 332], [376, 334], [352, 318], [320, 312], [290, 318], [266, 336], [254, 364], [250, 400], [252, 432]], true);
  o += pieza(pelo, C.pelo, [[pol([[214, 380], [250, 380], [256, 450], [214, 450]]), C.peloS], [pol([[230, 300], [300, 280], [300, 290], [248, 316], [232, 340]]), C.peloL]]);
  o += pincel([258, 352], [262, 324], [276, 306], [296, 296], 2.4) + pincel([300, 312], [312, 300], [326, 294], [344, 294], 2.2) + pincel([236, 400], [234, 370], [240, 340], [252, 318], 2.4) + pincel([346, 306], [356, 308], [366, 314], [374, 322], 1.8);
  // La oreja (a la izquierda del cuadro), delante del pelo, con su aro cian
  o += pieza(curva([[250, 392], [232, 384], [222, 406], [227, 430], [248, 438]], true), C.piel, [[pol([[220, 414], [246, 414], [246, 444], [220, 444]]), C.pielS]], { w: 4.6, peso: 1.4 });
  o += L('M240 396 Q230 408 236 426', 2.4) + L('M236 410 Q242 412 242 418', 1.8);
  o += `<circle cx="234" cy="442" r="4.6" fill="${C.cian}" stroke="${K}" stroke-width="2.2"/>`;
  // Un mechón suelto junto a la sien
  o += pincel([254, 344], [246, 362], [252, 374], [246, 388], 2.2);
  return o;
}

// ── La lupa de joyero en el ojo cercano: el ojo detrás del vidrio se ve enorme ──
function lupa() {
  let o = '';
  const cx = 298, cy = 396, rx = 31, ry = 36, f = 18;
  // La cinta elástica que la sujeta, por encima de la oreja
  o += `<path d="M${cx - 34} ${cy - 10} Q246 372 222 378" fill="none" stroke="${K}" stroke-width="7.5" stroke-linecap="round"/><path d="M${cx - 34} ${cy - 10} Q246 372 222 378" fill="none" stroke="${C.lupaL}" stroke-width="3.4" stroke-linecap="round"/>`;
  // El tubo del lente, que asoma hacia la sien, con sus estrías
  const tubo = `M${cx - f} ${cy - ry} L${cx} ${cy - ry} A${rx} ${ry} 0 0 1 ${cx} ${cy + ry} L${cx - f} ${cy + ry} A${rx} ${ry} 0 0 1 ${cx - f} ${cy - ry} Z`;
  o += pieza(tubo, C.lupa, [[pol([[cx - 70, cy - 50], [cx - 10, cy - 50], [cx - 10, cy - 18], [cx - 70, cy - 8]]), C.lupaL]], { w: 5, peso: 1.6 });
  for (const t of [-0.66, -0.33, 0, 0.33, 0.66]) {
    const y = cy + t * ry, k = rx * Math.sqrt(1 - t * t);
    o += L(`M${r1(cx - f - k + 4)} ${r1(y)} L${r1(cx - k - 2)} ${r1(y)}`, 2, t < -0.1 ? '#566275' : '#151A22');
  }
  // El vidrio: adentro, la piel y el ojo agrandados
  const vidrio = `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  const id = nuevoId();
  o += `<clipPath id="${id}"><path d="${vidrio}"/></clipPath><g clip-path="url(#${id})">`;
  o += P(vidrio, C.piel) + P(pol([[cx + 12, cy - 50], [cx + 50, cy - 50], [cx + 50, cy + 50], [cx + 6, cy + 50]]), C.pielS);
  // El ojo enorme, bien abierto, que mira a la derecha
  const ojo = `M${cx - 27} ${cy + 4} Q${cx - 2} ${cy - 30} ${cx + 27} ${cy + 2} Q${cx} ${cy + 26} ${cx - 27} ${cy + 4} Z`;
  o += P(ojo, C.blanco);
  o += `<circle cx="${cx + 6}" cy="${cy + 2}" r="13" fill="${C.iris}" stroke="${K}" stroke-width="2.4"/><circle cx="${cx + 7}" cy="${cy + 3}" r="6" fill="${K}"/><circle cx="${cx + 2}" cy="${cy - 3}" r="3.2" fill="#FFFFFF"/>`;
  o += B(ojo, 3);
  o += negro(`M${cx - 30} ${cy + 3} Q${cx - 2} ${cy - 36} ${cx + 30} ${cy + 1} L${cx + 26} ${cy + 3} Q${cx - 2} ${cy - 26} ${cx - 27} ${cy + 6} Z`);
  o += L(`M${cx - 18} ${cy + 22} Q${cx} ${cy + 30} ${cx + 18} ${cy + 22}`, 2) + L(`M${cx - 14} ${cy - 25} Q${cx} ${cy - 31} ${cx + 16} ${cy - 25}`, 2);
  // El tinte del vidrio
  o += P(vidrio, C.vidrio, ' opacity=".28"');
  o += `</g>`;
  o += L(`M${cx - 21} ${cy - 18} A26 30 0 0 1 ${cx - 4} ${cy - 30}`, 3.6, '#FFFFFF') + `<circle cx="${cx + 15}" cy="${cy + 22}" r="2.6" fill="#FFFFFF"/>`;
  // El aro cian del lente
  o += `<path d="${vidrio}" fill="none" stroke="${K}" stroke-width="13"/><path d="${vidrio}" fill="none" stroke="${C.cian}" stroke-width="6.5"/>`;
  o += `<path d="M${cx - rx + 5} ${cy - 16} A${rx} ${ry} 0 0 1 ${cx - 8} ${cy - ry + 3}" fill="none" stroke="${C.cianL}" stroke-width="2.6" stroke-linecap="round"/>`;
  // La ceja de ese lado, bien arriba y arqueada: la pregunta
  o += negro(pol([[254, 357], [262, 340], [280, 327], [302, 322], [324, 327], [333, 337], [322, 335], [302, 332], [282, 336], [266, 347]]));
  return o;
}

export function lupe({ prefijo = 'lupe' } = {}) {
  reiniciar(prefijo);
  return `<g>${zapato(-1)}${zapato(1)}${piernas()}${torso()}${gabardina()}${cronometro()}${humita()}${brazoIndice()}${brazoPortapapeles()}<g transform="translate(304 500) rotate(2) scale(1.05) translate(-304 -496)">${cabeza()}${lupa()}</g></g>`;
}

export const vista = () => lamina(lupe());
