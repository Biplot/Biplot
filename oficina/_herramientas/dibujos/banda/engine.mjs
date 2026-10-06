// The Engine, versión 2 en la línea de la banda: tan alto como The Architect, de espalda ancha y brazos marcados, y el
// que construye. Lleva cinturón de herramientas (la huincha, el bolso con destornilladores, alicate y lápiz, el martillo
// colgando y el llavero de llaves, una para cada integración) y una herramienta grande al hombro: la llave o el combo.
// Conserva el jopo con los lados rapados, la barba de pocos días, la media sonrisa, los audífonos naranjos, la polera
// carbón con el 4 o el motor, el cargo, las botas y la tablet. Marco 600 × 1260, suelo en y = 1240, mira a la izquierda.
import { K, W, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, nuevoId, r1, achicar, numeroChico } from './base.mjs';

export const C = {
  piel: '#D49C72', pielS: '#AA7451', pielL: '#E8B892',
  pelo: '#3B2416', peloS: '#22140B', peloL: '#6E4729', rapado: '#8F6A50', barba: '#A07C63',
  polera: '#343940', poleraS: '#21252B', poleraL: '#4B525C',
  naranjo: '#F5883A', naranjoS: '#C9661F', naranjoL: '#FFB57E',
  cargo: '#5F6B45', cargoS: '#434D2F', cargoL: '#7B875C', rodillera: '#535D3B',
  bota: '#6E4629', botaS: '#4A2D18', suela: '#25201C',
  cuero: '#8A5A36', cueroS: '#5E3A1F', cueroL: '#C08A55',
  correa: '#1E1A17', metal: '#C3CDD8', metalS: '#8E99A6', bronce: '#D2A54C',
  cromo: '#D3DAE2', cromoS: '#98A3AF', fierro: '#3B4049', fierroS: '#262A31', fierroL: '#6A7380',
  madera: '#C8955A', maderaS: '#9A6A3A',
  tablet: '#14171C', pantalla: '#0E2A47', cian: '#17C3B2', cianL: '#7FD8CF', blanco: '#F6F3EC'
};
const NUMERO = "'Alfa Slab One', 'Archivo Black', serif";   // el número de camiseta, de losa gruesa
const raya = (d, color, w = 1.6, dash = '5 4') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round"/>`;

// ── Botas de trabajo: anchas, suela gruesa con dientes y cordones naranjos ──
function bota(lado) {
  const x0 = lado < 0 ? 238 : 362, s = -lado, X = (x) => x0 + s * x;
  let o = '';
  o += pieza(pol([[X(-118), 1204], [X(46), 1204], [X(50), 1240], [X(-122), 1240]]), C.suela, [], { w: 5.5 });
  for (let i = 0; i < 6; i++) o += L(`M${X(-104 + i * 26)} 1232 L${X(-104 + i * 26)} 1240`, 3, '#4A423C');
  const cuero = curva([[X(-36), 1090], [X(40), 1088], [X(46), 1150], [X(46), 1206], [X(-60), 1208], [X(-118), 1204], [X(-114), 1176], [X(-84), 1160], [X(-46), 1146]], true);
  o += pieza(cuero, C.bota, [[pol([[X(10), 1080], [X(52), 1080], [X(52), 1210], [X(16), 1210]]), C.botaS], [pol([[X(-118), 1186], [X(-60), 1186], [X(-60), 1210], [X(-118), 1210]]), C.botaS]]);
  // Puntera más oscura y la costura
  o += L(`M${X(-112)} 1184 Q${X(-90)} 1170 ${X(-62)} 1178`, 3);
  // Cordones naranjos cruzados
  for (let i = 0; i < 4; i++) {
    const y = 1170 - i * 17, x = -50 + i * 8;
    o += L(`M${X(x - 14)} ${y + 6} L${X(x + 14)} ${y - 6}`, 4.6, C.naranjo);
    o += `<circle cx="${X(x - 16)}" cy="${y + 7}" r="2.6" fill="${C.metal}"/><circle cx="${X(x + 16)}" cy="${y - 7}" r="2.6" fill="${C.metal}"/>`;
  }
  // Tirador de atrás
  o += pieza(pol([[X(28), 1080], [X(42), 1078], [X(44), 1100], [X(30), 1102]]), C.cuero, [], { w: 3.4, peso: 0 });
  return o;
}

// La cadera del cargo y su sombra
const CADERA = pol([[196, 704], [404, 704], [412, 798], [300, 822], [188, 798]]);
const CADERA_S = pol([[330, 698], [418, 698], [418, 824], [330, 824]]);

// ── Piernas: largas, con el cargo de bolsillos de fuelle y rodilleras reforzadas ──
function piernas() {
  let o = '';
  const izq = miembro([[250, 740], [240, 950], [240, 1108]], [104, 84, 90], { punta: 'plana' });
  const der = miembro([[350, 740], [362, 950], [362, 1108]], [104, 84, 90], { punta: 'plana' });
  o += pieza(izq, C.cargo, [[pol([[262, 720], [320, 720], [300, 1120], [258, 1120], [262, 960]]), C.cargoS]]);
  o += pieza(der, C.cargo, [[pol([[372, 720], [420, 720], [420, 1120], [380, 1120], [378, 960]]), C.cargoS]]);
  o += pieza(CADERA, C.cargo, [[CADERA_S, C.cargoS]], { peso: 0 });
  // Rodilleras: el refuerzo de los pantalones de obra, con su costura
  for (const [x0, x1] of [[206, 266], [336, 394]]) {
    const r = pol([[x0, 946], [x1, 948], [x1 - 2, 1012], [x0 + 2, 1010]]);
    o += P(r, C.rodillera) + raya(`M${x0 + 6} 954 L${x1 - 6} 955 L${x1 - 8} 1004 L${x0 + 8} 1003 Z`, C.cargoL, 1.6);
  }
  // Bolsillos de fuelle con su tapa
  o += pieza(pol([[180, 842], [226, 846], [222, 932], [178, 928]]), C.cargo, [[pol([[206, 840], [232, 840], [232, 936], [208, 936]]), C.cargoS]], { w: 4.6, peso: 1.4 });
  o += pieza(pol([[176, 836], [230, 840], [228, 862], [176, 858]]), C.cargoL, [], { w: 4.4, peso: 1.2 });
  o += pieza(pol([[380, 848], [428, 844], [430, 930], [384, 936]]), C.cargo, [[pol([[404, 842], [436, 842], [436, 940], [404, 940]]), C.cargoS]], { w: 4.6, peso: 1.4 });
  o += pieza(pol([[376, 842], [432, 838], [432, 860], [378, 864]]), C.cargoL, [], { w: 4.4, peso: 1.2 });
  // Arrugas: rodillas, entrepierna y el pantalón que se arruga sobre la bota
  o += pincel([212, 1024], [228, 1034], [244, 1034], [260, 1024], 3.2) + pincel([340, 1026], [356, 1036], [372, 1036], [388, 1026], 3.2);
  o += pincel([300, 820], [296, 850], [290, 874], [286, 894], 3);
  for (const x of [240, 360]) {
    o += pincel([x - 40, 1074], [x - 20, 1086], [x + 4, 1080], [x + 20, 1068], 3) + pincel([x - 30, 1094], [x - 10, 1102], [x + 14, 1098], [x + 34, 1088], 2.8);
  }
  return o;
}

// ── Cinturón de herramientas: la huincha, el llavero de llaves, el bolso y el martillo ──
function llaveChica(largo, banda) {
  // Llave combinada en miniatura, colgando hacia abajo: corona arriba (en la argolla) y boca abierta abajo
  let k = '';
  k += pieza(pol([[-3.4, 12], [3.4, 12], [4, largo - 10], [-4, largo - 10]]), C.cromo, [[pol([[0, 8], [6, 8], [6, largo], [0, largo]]), C.cromoS]], { w: 2.6, peso: 0 });
  k += pieza(pol([[-8, largo - 14], [8, largo - 14], [9, largo], [3, largo], [3, largo - 6], [-3, largo - 6], [-3, largo], [-9, largo]]), C.cromo, [], { w: 2.6, peso: 0 });
  k += `<path d="M-7 7 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M-3.4 7 a3.4 3.4 0 1 1 6.8 0 a3.4 3.4 0 1 1 -6.8 0 Z" fill="${C.cromo}" fill-rule="evenodd" stroke="${K}" stroke-width="2.6"/>`;
  if (banda) k += pieza(pol([[-4.4, 20], [4.4, 20], [4.6, 30], [-4.6, 30]]), banda, [], { w: 2.2, peso: 0 });
  return k;
}
function cinturon() {
  let o = '';
  // Las herramientas del bolso asoman por arriba (van detrás del bolso)
  o += `<g transform="rotate(-10 342 700)">` + pieza(pol([[336, 664], [348, 664], [350, 712], [334, 712]]), C.naranjo, [[pol([[343, 660], [352, 660], [352, 716], [344, 716]]), C.naranjoS]], { w: 3.6, peso: 0 }) + L('M335 676 L349 676', 3) + `</g>`;
  o += `<g transform="rotate(6 358 700)">` + pieza(pol([[352, 670], [364, 670], [365, 712], [351, 712]]), C.fierro, [], { w: 3.6, peso: 0 }) + L('M352 682 L364 682', 2.4, C.fierroL) + `</g>`;
  o += pieza(pol([[372, 676], [380, 674], [384, 712], [376, 712]]), C.naranjo, [], { w: 3.2, peso: 0 }) + pieza(pol([[386, 674], [394, 678], [390, 712], [382, 712]]), C.naranjo, [], { w: 3.2, peso: 0 });
  o += pieza(pol([[396, 680], [404, 678], [404, 712], [396, 712]]), C.bronce, [], { w: 3, peso: 0 }) + negro(pol([[397, 680], [403, 678], [400, 672]]));
  // La correa de cuero, con su costura, y la hebilla
  o += pieza(pol([[190, 694], [410, 694], [412, 724], [188, 726]]), C.cuero, [[pol([[330, 688], [420, 688], [420, 730], [330, 730]]), C.cueroS]], { w: 4.4, peso: 1.2 });
  o += raya('M196 700 L404 700', C.cueroL) + raya('M196 719 L405 719', C.cueroL);
  o += pieza(pol([[286, 688], [316, 688], [316, 730], [286, 730]]), C.metal, [[pol([[302, 684], [320, 684], [320, 734], [304, 734]]), C.metalS]], { w: 4, peso: 1 });
  o += P(pol([[293, 697], [309, 697], [309, 721], [293, 721]]), C.cuero) + L('M293 709 L309 709', 3, C.metal);
  // El bolso de cuero, con remaches
  o += pieza(pol([[320, 710], [408, 710], [402, 806], [328, 808]]), C.cuero, [[pol([[372, 704], [414, 704], [414, 812], [372, 812]]), C.cueroS]], { w: 4.6, peso: 1.4 });
  o += raya('M328 722 L400 722 L396 798 L334 800 Z', C.cueroL, 1.6);
  for (const [x, y] of [[332, 718], [396, 718], [336, 796], [392, 796]]) o += `<circle cx="${x}" cy="${y}" r="3.2" fill="${C.metal}" stroke="${K}" stroke-width="1.6"/>`;
  o += pincel([344, 744], [356, 750], [372, 750], [386, 744], 2.4);
  // La huincha, enganchada al cinturón
  o += P(pol([[220, 690], [232, 690], [232, 718], [220, 718]]), C.metal) + B('M220 690 L232 690 L232 718', 2.4);
  o += pieza('M210 712 H242 Q250 712 250 720 V750 Q250 758 242 758 H210 Q202 758 202 750 V720 Q202 712 210 712 Z', C.naranjo, [[pol([[230, 706], [256, 706], [256, 762], [232, 762]]), C.naranjoS]], { w: 4.4, peso: 1.2 });
  o += `<circle cx="225" cy="735" r="10" fill="${K}"/><circle cx="225" cy="735" r="4" fill="${C.fierroL}"/>`;
  o += pieza(pol([[196, 752], [214, 752], [214, 762], [196, 762]]), C.metal, [], { w: 2.6, peso: 0 }) + L('M196 752 L196 766', 3);
  // El llavero: una llave para cada integración
  const ax = 268, ay = 734;
  [[-24, 50, C.naranjo], [-8, 60, C.cian], [8, 56, null], [24, 50, C.naranjo]].forEach(([ang, largo, banda]) => {
    o += `<g transform="translate(${ax} ${ay}) rotate(${ang}) scale(1.2)">${llaveChica(largo, banda)}</g>`;
  });
  o += `<circle cx="${ax}" cy="${ay + 2}" r="10" fill="none" stroke="${K}" stroke-width="6.5"/><circle cx="${ax}" cy="${ay + 2}" r="10" fill="none" stroke="${C.metal}" stroke-width="3.2"/>`;
  o += pieza(pol([[262, 718], [274, 718], [274, 730], [262, 730]]), C.cueroS, [], { w: 2.6, peso: 0 });
  // El martillo, colgando de su presilla en la cadera
  o += pieza(pol([[414, 712], [426, 712], [425, 818], [415, 818]]), C.madera, [[pol([[421, 708], [430, 708], [430, 822], [421, 822]]), C.maderaS]], { w: 4, peso: 1 });
  o += pieza(pol([[413, 776], [427, 776], [427, 820], [413, 820]]), C.fierro, [], { w: 4, peso: 0 }) + L('M413 788 L427 788 M413 800 L427 800', 1.8, C.fierroL);
  o += pieza(pol([[406, 710], [434, 708], [436, 728], [408, 730]]), C.cueroS, [], { w: 3.6, peso: 0 });
  o += pieza(pol([[396, 694], [438, 692], [450, 700], [458, 716], [446, 710], [434, 712], [404, 712], [396, 708]]), C.fierro, [[pol([[396, 690], [452, 690], [452, 699], [396, 699]]), C.fierroL]], { w: 4, peso: 1 });
  return o;
}

// ── El brazo de atrás (el de la tablet): manga arremangada, bíceps y antebrazo marcados ──
function brazoLejos() {
  let o = '';
  const brazo = curva([[134, 470], [124, 520], [120, 566], [130, 606], [154, 640], [184, 630], [198, 590], [202, 530], [200, 470]], true);
  o += pieza(brazo, C.piel, [[pol([[170, 450], [212, 450], [212, 650], [172, 650]]), C.pielS]]);
  o += pincel([142, 560], [140, 580], [144, 598], [152, 612], 2.4);
  const ante = miembro([[166, 752], [156, 620]], [50, 68], { punta: 'redonda' });
  o += pieza(ante, C.piel, [[pol([[164, 600], [204, 600], [194, 770], [170, 770]]), C.pielS]]);
  o += pincel([150, 652], [146, 678], [148, 704], [154, 728], 2.2);
  // Manga arremangada, con el ribete naranjo
  const manga = curva([[202, 424], [166, 432], [140, 456], [128, 494], [130, 528], [198, 534], [206, 478]], true);
  o += pieza(manga, C.polera, [[pol([[120, 430], [150, 430], [146, 540], [120, 540]]), C.poleraL]]);
  o += pieza(pol([[129, 514], [199, 518], [199, 536], [129, 532]]), C.naranjo, [[pol([[178, 510], [204, 510], [204, 540], [180, 540]]), C.naranjoS]], { w: 4, peso: 1 });
  return o;
}

// ── Torso en V: hombros anchos, pecho marcado y cintura más angosta ──
function torso(polera) {
  let o = '';
  const t = curva([[258, 404], [220, 414], [186, 430], [166, 456], [176, 494], [188, 532], [196, 600], [204, 660], [210, 708], [300, 718], [392, 708], [398, 660], [404, 600], [412, 532], [426, 494], [436, 456], [416, 430], [382, 414], [342, 404], [300, 422]], true);
  o += pieza(t, C.polera, [[pol([[350, 396], [480, 396], [480, 730], [356, 730], [372, 560]]), C.poleraS], [pol([[160, 440], [198, 440], [208, 724], [184, 724]]), C.poleraL]]);
  // El pecho y los pliegues de la cintura
  o += pincel([224, 506], [248, 522], [274, 526], [298, 516], 2.8) + pincel([306, 518], [330, 528], [352, 526], [372, 514], 2.8);
  o += pincel([222, 640], [236, 656], [250, 664], [268, 668], 2.6) + pincel([392, 628], [384, 648], [372, 660], [356, 666], 2.6);
  // Cuello redondo con ribete
  o += pieza(curva([[258, 404], [300, 424], [342, 404], [340, 414], [300, 436], [260, 414]], true), C.naranjo, [], { w: 4, peso: 0 });
  if (polera === 'numero') {
    o += numeroChico(`<text x="262" y="680" text-anchor="middle" font-family="${NUMERO}" font-size="148" fill="${C.naranjo}" stroke="${K}" stroke-width="5" paint-order="stroke" transform="rotate(3 262 620)">4</text>`, 262, 627);
  } else {
    o += motor(278, 618, 0.9, 0);
  }
  return o;
}

// ── La mano de atrás con la tablet ──
function manoTablet() {
  let o = '';
  o += `<g transform="rotate(-6 142 818)">`;
  o += pieza(pol([[92, 742], [190, 742], [190, 892], [92, 892]]), C.tablet, [], { w: 5.5 });
  o += P(pol([[102, 754], [180, 754], [180, 880], [102, 880]]), C.pantalla);
  o += L('M110 856 L128 836 L144 844 L170 802', 4, C.cian);
  o += `<circle cx="170" cy="802" r="5" fill="${C.cianL}"/>`;
  o += L('M110 770 L146 770 M110 782 L132 782', 3, '#35679A');
  o += `</g>`;
  o += pieza(curva([[148, 742], [180, 744], [190, 756], [186, 776], [164, 778], [152, 764]], true), C.piel, [[pol([[174, 736], [196, 736], [196, 782], [176, 782]]), C.pielS]], { w: 5, peso: 1.6 });
  for (let i = 0; i < 4; i++) {
    const y = 762 + i * 15;
    o += pieza(curva([[176, y], [196, y - 2], [204, y + 6], [198, y + 14], [178, y + 13]], true), C.piel, [[pol([[190, y - 4], [208, y - 4], [208, y + 18], [192, y + 18]]), C.pielS]], { w: 3.6, peso: 0.8 });
  }
  return o;
}

// ── La herramienta al hombro: la llave grande o el combo. Coordenadas propias: el eje va a lo largo del mango ──
const MANGO = { x: 329, y: 597, giro: -46.9 };
function llaveGrande() {
  let o = '';
  // Corona (abajo, bajo el puño), cuerpo, empuñadura naranja y la boca abierta (arriba, detrás del hombro)
  o += pieza(pol([[40, -9], [282, -12], [282, 12], [40, 9]]), C.cromo, [[pol([[36, 0], [290, 0], [290, 16], [36, 16]]), C.cromoS]], { w: 4.4, peso: 1.2 });
  o += L('M52 0 L272 0', 1.6, C.cromoS);
  o += `<path d="M-2 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0 Z M11 0 a11 11 0 1 1 22 0 a11 11 0 1 1 -22 0 Z" fill="${C.cromo}" fill-rule="evenodd"/>`;
  o += `<path d="M-2 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0 Z M11 0 a11 11 0 1 1 22 0 a11 11 0 1 1 -22 0 Z" fill="none" stroke="${K}" stroke-width="4.4"/>`;
  o += pieza('M48 -15 H150 Q156 -15 156 -9 V9 Q156 15 150 15 H48 Q42 15 42 9 V-9 Q42 -15 48 -15 Z', C.naranjo, [[pol([[40, 2], [160, 2], [160, 18], [40, 18]]), C.naranjoS]], { w: 4.4, peso: 1.2 });
  for (let x = 104; x <= 146; x += 10) o += L(`M${x} -11 L${x} 11`, 2, C.naranjoS);
  const boca = pol([[276, -20], [292, -34], [322, -32], [342, -18], [344, -12], [310, -12], [304, -6], [304, 6], [310, 12], [344, 12], [342, 18], [322, 32], [292, 34], [276, 20]]);
  o += pieza(boca, C.cromo, [[pol([[270, 4], [350, 4], [350, 40], [270, 40]]), C.cromoS]], { w: 4.4, peso: 1.2 });
  return o;
}
function combo() {
  let o = '';
  // Mango de madera con su veta y la cabeza de fierro
  o += pieza(pol([[0, -10], [300, -12], [300, 12], [0, 10]]), C.madera, [[pol([[0, 2], [300, 2], [300, 14], [0, 14]]), C.maderaS]], { w: 4.4, peso: 1.2 });
  o += L('M30 -3 Q120 -6 220 -2', 1.6, C.maderaS) + L('M60 5 Q150 2 250 6', 1.4, C.maderaS);
  o += pieza(pol([[0, -12], [16, -12], [16, 12], [0, 12]]), C.fierro, [], { w: 4, peso: 0 });
  const cabeza = pol([[276, -44], [322, -44], [328, -36], [328, 36], [322, 44], [276, 44], [270, 36], [270, -36]]);
  o += pieza(cabeza, C.fierro, [[pol([[262, 10], [336, 10], [336, 50], [262, 50]]), C.fierroS], [pol([[262, -50], [336, -50], [336, -30], [262, -30]]), C.fierroL]], { w: 5, peso: 1.4 });
  o += L('M276 -36 L322 -36 M276 36 L322 36', 1.8, C.fierroL);
  return o;
}

// ── El brazo de adelante: el bíceps se marca al sostener la herramienta sobre el hombro ──
function brazoCerca(herramienta) {
  let o = '';
  const brazo = curva([[406, 466], [396, 510], [400, 554], [420, 594], [452, 624], [490, 622], [506, 590], [502, 538], [488, 492], [468, 462]], true);
  o += pieza(brazo, C.piel, [[pol([[464, 450], [520, 450], [520, 640], [472, 640], [480, 540]]), C.pielS]]);
  o += pincel([470, 524], [476, 550], [478, 574], [474, 598], 2.4);
  // Manga arremangada alto, con el parche del motor
  const manga = curva([[402, 428], [440, 428], [474, 446], [492, 470], [494, 488], [414, 496], [404, 474]], true);
  o += pieza(manga, C.polera, [[pol([[446, 418], [504, 418], [504, 504], [452, 504]]), C.poleraS]]);
  o += pieza(pol([[410, 480], [494, 472], [496, 490], [414, 500]]), C.naranjo, [[pol([[462, 466], [500, 466], [500, 496], [464, 496]]), C.naranjoS]], { w: 4, peso: 1 });
  o += motor(446, 456, 0.24, 12);
  o += pincel([404, 512], [408, 530], [416, 546], [428, 556], 2.2);
  // Antebrazo, del codo a la mano, con el músculo marcado
  const ante = miembro([[396, 566], [476, 616]], [56, 74], { punta: 'redonda' });
  o += pieza(ante, C.piel, [[pol([[360, 584], [390, 574], [470, 624], [480, 650], [446, 660]]), C.pielS]]);
  o += pincel([418, 566], [436, 576], [452, 588], [466, 604], 2.4) + L('M424 600 Q440 606 452 620', 1.8, C.pielS);
  // La herramienta, apoyada en el hombro
  const dibujo = herramienta === 'combo' ? combo() : llaveGrande();
  o += `<g transform="translate(${MANGO.x} ${MANGO.y}) rotate(${MANGO.giro})">${dibujo}</g>`;
  // El puño que la sostiene: cuatro dedos que abrazan el mango y el pulgar encima
  let mano = '';
  mano += pieza(curva([[-30, -6], [-24, -24], [0, -28], [26, -24], [32, -6], [30, 22], [14, 34], [-12, 34], [-28, 22]], true), C.piel, [[pol([[-40, 12], [40, 12], [40, 44], [-40, 44]]), C.pielS]], { w: 5, peso: 1.6 });
  for (const x of [-14, 0, 14]) mano += L(`M${x} 2 L${x} 26`, 2.4);
  mano += L('M-26 4 Q0 -2 28 4', 2.6);
  mano += pieza(curva([[16, -30], [40, -26], [46, -16], [36, -10], [14, -16]], true), C.piel, [[pol([[24, -36], [52, -36], [52, -6], [26, -6]]), C.pielS]], { w: 4, peso: 1 });
  const fx = r1(MANGO.x + 70 * Math.cos(MANGO.giro * Math.PI / 180)), fy = r1(MANGO.y + 70 * Math.sin(MANGO.giro * Math.PI / 180));
  o += `<g transform="translate(${fx} ${fy}) rotate(${MANGO.giro})">${mano}</g>`;
  return o;
}

// El motor: el bloque con sus cilindros y el escape (en chico, la línea no adelgaza de más)
function motor(x, y, e, giro) {
  const g = (w) => Math.max(w, 2.2 / e);
  return `<g transform="translate(${x} ${y}) rotate(${giro}) scale(${e})">` +
    pieza(pol([[-62, -26], [52, -26], [52, 30], [-62, 30]]), C.naranjo, [[pol([[20, -30], [60, -30], [60, 34], [24, 34]]), C.naranjoS]], { w: g(4.4), peso: e < 1 ? 0 : 1.2 }) +
    pieza(pol([[-44, -44], [30, -44], [30, -26], [-44, -26]]), C.naranjo, [], { w: g(4), peso: 0 }) +
    pieza(pol([[-82, -10], [-62, -10], [-62, 14], [-82, 14]]), C.naranjo, [], { w: g(4), peso: 0 }) +
    pieza(pol([[52, -14], [72, -20], [72, 22], [52, 16]]), C.naranjo, [], { w: g(4), peso: 0 }) +
    L('M-40 -12 L-40 16 M-14 -12 L-14 16 M12 -12 L12 16', g(4)) + `</g>`;
}

// ── Cabeza: jopo, lados rapados, párpados pesados, nariz que apunta a la izquierda, media sonrisa ──
function cabeza() {
  let o = '';
  // Banda de los audífonos detrás del cuello
  o += `<path d="M236 530 C246 498 354 498 364 530" fill="none" stroke="${K}" stroke-width="14" stroke-linecap="round"/><path d="M236 530 C246 498 354 498 364 530" fill="none" stroke="#2A2D33" stroke-width="7" stroke-linecap="round"/>`;
  // Cuello grueso
  o += pieza(pol([[268, 470], [334, 470], [338, 526], [264, 526]]), C.piel, [[pol([[262, 462], [342, 462], [342, 494], [262, 500]]), C.pielS], [pol([[314, 480], [346, 480], [346, 530], [318, 530]]), C.pielS]]);
  // Oreja (a la derecha del cuadro)
  o += pieza(curva([[372, 374], [396, 366], [406, 392], [398, 424], [374, 430]], true), C.piel, [[pol([[384, 360], [410, 360], [410, 434], [388, 434]]), C.pielS]], { w: 5, peso: 1.6 });
  o += L('M386 382 Q396 396 388 414', 2.6);
  // Cabeza ancha y cuadrada
  const cara = curva([[226, 352], [240, 304], [290, 282], [346, 288], [380, 320], [388, 372], [384, 424], [370, 468], [334, 496], [286, 500], [246, 484], [226, 456], [222, 410]], true);
  o += pieza(cara, C.piel, [[pol([[344, 330], [400, 330], [400, 500], [330, 500], [350, 420]]), C.pielS]]);
  // Lados rapados
  o += pieza(pol([[330, 304], [384, 326], [388, 372], [372, 376], [356, 346], [332, 332]]), C.rapado, [], { w: 0, borde: false });
  for (let i = 0; i < 14; i++) o += `<circle cx="${340 + (i * 37) % 44}" cy="${318 + (i * 23) % 52}" r="1.6" fill="${C.peloS}" opacity=".7"/>`;
  // Barba de pocos días: mandíbula, mentón y bigote
  const barba = pol([[226, 444], [262, 452], [292, 444], [330, 448], [376, 446], [368, 472], [334, 498], [286, 502], [248, 486], [228, 462]]);
  o += pieza(barba, C.barba, [[pol([[334, 440], [390, 440], [390, 506], [326, 506]]), '#86644E']], { w: 0, borde: false });
  for (let i = 0; i < 26; i++) o += `<circle cx="${236 + (i * 29) % 132}" cy="${452 + (i * 17) % 42}" r="1.5" fill="${C.peloS}" opacity=".55"/>`;
  o += B(cara, W);
  // Media sonrisa de lado
  o += L('M236 458 Q262 466 290 452', 4.2) + L('M290 452 L298 444', 3.4) + L('M252 472 Q264 476 276 472', 2.2);
  // Ojos de párpado pesado; las pupilas miran a la izquierda (el lejano queda medio tapado por la nariz)
  for (const [x, y, w, h] of [[238, 390, 22, 13], [310, 390, 36, 19]]) {
    o += pieza(`M${x - w / 2} ${y} Q${x} ${y - h} ${x + w / 2} ${y} Q${x} ${y + h * 0.8} ${x - w / 2} ${y} Z`, C.blanco, [], { w: 3.6, peso: 0 });
    o += `<circle cx="${x - w * 0.22}" cy="${y + 1}" r="${h * 0.32}" fill="${K}"/>`;
    o += negro(`M${x - w / 2 - 3} ${y - 1} Q${x} ${y - h - 6} ${x + w / 2 + 4} ${y - 2} L${x + w / 2 + 2} ${y - h * 0.15} Q${x} ${y - h * 0.62} ${x - w / 2} ${y + 1} Z`);
  }
  o += L('M296 406 Q310 412 326 405', 2.2) + L('M230 402 Q238 406 246 402', 2);
  o += L('M342 414 Q354 426 352 444', 2.2);
  // Nariz con quiebre que sale hacia la izquierda: sólo su borde de afuera lleva tinta, el puente se funde con la cara.
  // Desde la ronda 3 del elenco va más chica, achicada desde el puente
  let nariz = P(pol([[268, 380], [248, 398], [236, 410], [206, 428], [210, 440], [232, 446], [262, 444], [270, 420]]), C.piel);
  nariz += P(pol([[206, 430], [236, 430], [262, 438], [262, 446], [232, 446], [210, 440]]), C.pielS);
  nariz += B('M268 380 L248 398 L236 410 L206 428 Q203 438 212 442 L232 446', 5);
  nariz += L('M262 444 Q256 436 250 438', 2.4);
  nariz += negro(pol([[218, 440], [240, 438], [236, 446], [222, 446]]));
  o += achicar(nariz, 268, 382, 0.78);
  // Cejas gruesas: la cercana un poco arriba
  o += negro(pol([[226, 372], [256, 364], [260, 374], [230, 380]]));
  o += negro(pol([[284, 364], [330, 352], [334, 364], [288, 374]]));
  // El jopo: sube adelante y se va hacia atrás
  const jopo = curva([[228, 352], [210, 312], [202, 270], [214, 232], [248, 204], [298, 194], [346, 208], [384, 244], [398, 292], [388, 326], [356, 314], [318, 314], [284, 322], [256, 334]], true);
  o += pieza(jopo, C.pelo, [
    [pol([[200, 240], [250, 226], [244, 300], [232, 352], [204, 340]]), C.peloS],
    [pol([[340, 236], [400, 270], [394, 330], [350, 316]]), C.peloS]
  ]);
  o += pincel([230, 300], [240, 262], [266, 236], [306, 228], 3, { ini: 0.2, fin: 0.4 }) + pincel([256, 312], [272, 280], [302, 258], [340, 252], 2.6) + pincel([288, 316], [306, 290], [334, 276], [366, 276], 2.4);
  o += P('M250 262 Q284 240 324 244 Q290 250 262 272 Z', C.peloL) + P('M292 282 Q326 262 360 274 Q330 274 304 290 Z', C.peloL);
  // El brillo de la ola de adelante
  o += P('M214 262 Q222 226 258 210 Q236 232 228 266 Z', C.peloL);
  // Los audífonos naranjos sobre la clavícula
  for (const x of [244, 356]) {
    o += pieza(curva([[x - 26, 520], [x, 504], [x + 26, 520], [x + 22, 552], [x, 562], [x - 22, 552]], true), C.naranjo, [[pol([[x + 2, 500], [x + 30, 500], [x + 30, 566], [x + 4, 566]]), C.naranjoS], [pol([[x - 30, 512], [x - 12, 512], [x - 14, 530], [x - 30, 530]]), C.naranjoL]], { w: 5 });
    o += `<ellipse cx="${x}" cy="${533}" rx="11" ry="9" fill="${K}" opacity=".85"/>`;
  }
  return `<g transform="translate(300 414) scale(1.06) translate(-300 -528)">${o}</g>`;
}


export function engine2({ polera = 'numero', herramienta = 'llave', prefijo = 'en2' } = {}) {
  reiniciar(prefijo);
  return `<g>${bota(-1)}${bota(1)}${piernas()}${brazoLejos()}${torso(polera)}${cinturon()}${manoTablet()}${brazoCerca(herramienta)}${cabeza()}</g>`;
}

export const FUENTES = `<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Archivo+Black&display=block" rel="stylesheet">`;
export function vista(herramienta = 'llave') {
  return FUENTES + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1260" width="600" height="1260"><rect width="600" height="1260" fill="#000"/>${engine2({ herramienta })}</svg>`;
}
export const vistaLlave = () => vista('llave');
export const vistaCombo = () => vista('combo');
