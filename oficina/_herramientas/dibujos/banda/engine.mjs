// The Engine en la línea de la banda: el carpintero pistolero (aprobado el 07-10-2026, el E2 con sus ajustes). El que
// arma y hace los muebles: tan alto como The Architect, de espalda ancha y brazos marcados. Jopo con los lados rapados,
// barba corta y bien definida, la media sonrisa y los lentes de seguridad naranjos. Polera carbón con el cuello naranjo,
// el chaleco de lona abierto, la canana de brocas y tornillos cruzada al pecho y el cinturón pistolero con dos taladros
// enfundados, el llavero y la hebilla de rodeo: ovalada, de plata, con dos taladros cruzados grabados y el 4 de su placa
// (E4) al centro. Pantalón de mezclilla con rodilleras y bolsillos de fuelle, botas de trabajo con cordones naranjos.
// En alto, el taladro como pistola, con su rulo de aserrín; en la otra mano, la tablet con funda de madera y el plano
// del mueble. Aserrín en el suelo. Marco 600 × 1260, suelo en y = 1240, mira a la izquierda.
// El diseño anterior (el constructor con la llave al hombro) quedó en el museo de la oficina y en el historial de git.
import { K, W, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, r1, achicar, numeroChico } from './base.mjs';

export const C = {
  piel: '#D49C72', pielS: '#AA7451', pielL: '#E8B892',
  pelo: '#3B2416', peloS: '#22140B', peloL: '#6E4729', rapado: '#8F6A50',
  barba: '#4A2E1C', barbaS: '#2E1C10', barbaL: '#6E4729',
  polera: '#343940', poleraS: '#21252B', poleraL: '#4B525C',
  naranjo: '#F5883A', naranjoS: '#C9661F', naranjoL: '#FFB57E',
  // El pantalón de mezclilla
  cargo: '#2D3E5C', cargoS: '#1E2B42', cargoL: '#41587E', rodillera: '#26354F',
  lona: '#A08B5F', lonaS: '#7A6A47', lonaL: '#BFA878',
  bota: '#6E4629', botaS: '#4A2D18', suela: '#25201C',
  cuero: '#7A4E2E', cueroS: '#52331C', cueroL: '#A87444',
  metal: '#C3CDD8', metalS: '#8E99A6', bronce: '#D2A54C',
  cromo: '#D3DAE2', cromoS: '#98A3AF', fierro: '#3B4049', fierroS: '#262A31', fierroL: '#6A7380',
  madera: '#C8955A', maderaS: '#9A6A3A', maderaL: '#E2B67C', viruta: '#EBC48E', virutaS: '#C39257',
  pantalla: '#0E2A47', cian: '#17C3B2', cianL: '#7FD8CF'
};
const NUMERO = "'Alfa Slab One', 'Archivo Black', serif";   // el número de camiseta, de losa gruesa
const raya = (d, color, w = 1.6, dash = '5 4') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
// La cabeza se dibuja en sus coordenadas y se ubica sobre el cuello
const enCabeza = (o) => `<g transform="translate(300 414) scale(1.06) translate(-300 -528)">${o}</g>`;

// ── Botas de trabajo: anchas, suela gruesa con dientes y cordones naranjos ──
function bota(lado) {
  const x0 = lado < 0 ? 238 : 362, s = -lado, X = (x) => x0 + s * x;
  let o = '';
  o += pieza(pol([[X(-118), 1204], [X(46), 1204], [X(50), 1240], [X(-122), 1240]]), C.suela, [], { w: 5.5 });
  for (let i = 0; i < 6; i++) o += L(`M${X(-104 + i * 26)} 1232 L${X(-104 + i * 26)} 1240`, 3, '#4A423C');
  const cuero = curva([[X(-36), 1090], [X(40), 1088], [X(46), 1150], [X(46), 1206], [X(-60), 1208], [X(-118), 1204], [X(-114), 1176], [X(-84), 1160], [X(-46), 1146]], true);
  o += pieza(cuero, C.bota, [[pol([[X(10), 1080], [X(52), 1080], [X(52), 1210], [X(16), 1210]]), C.botaS], [pol([[X(-118), 1186], [X(-60), 1186], [X(-60), 1210], [X(-118), 1210]]), C.botaS]]);
  o += L(`M${X(-112)} 1184 Q${X(-90)} 1170 ${X(-62)} 1178`, 3);
  for (let i = 0; i < 4; i++) {
    const y = 1170 - i * 17, x = -50 + i * 8;
    o += L(`M${X(x - 14)} ${y + 6} L${X(x + 14)} ${y - 6}`, 4.6, C.naranjo);
    o += `<circle cx="${X(x - 16)}" cy="${y + 7}" r="2.6" fill="${C.metal}"/><circle cx="${X(x + 16)}" cy="${y - 7}" r="2.6" fill="${C.metal}"/>`;
  }
  o += pieza(pol([[X(28), 1080], [X(42), 1078], [X(44), 1100], [X(30), 1102]]), C.cuero, [], { w: 3.4, peso: 0 });
  return o;
}

// ── Piernas: la mezclilla, con rodilleras reforzadas y bolsillos de fuelle ──
const CADERA = pol([[196, 704], [404, 704], [412, 798], [300, 822], [188, 798]]);
const CADERA_S = pol([[330, 698], [418, 698], [418, 824], [330, 824]]);
function piernas() {
  let o = '';
  const izq = miembro([[250, 740], [240, 950], [240, 1108]], [104, 84, 90], { punta: 'plana' });
  const der = miembro([[350, 740], [362, 950], [362, 1108]], [104, 84, 90], { punta: 'plana' });
  o += pieza(izq, C.cargo, [[pol([[262, 720], [320, 720], [300, 1120], [258, 1120], [262, 960]]), C.cargoS]]);
  o += pieza(der, C.cargo, [[pol([[372, 720], [420, 720], [420, 1120], [380, 1120], [378, 960]]), C.cargoS]]);
  o += pieza(CADERA, C.cargo, [[CADERA_S, C.cargoS]], { peso: 0 });
  for (const [x0, x1] of [[206, 266], [336, 394]]) {
    const r = pol([[x0, 946], [x1, 948], [x1 - 2, 1012], [x0 + 2, 1010]]);
    o += P(r, C.rodillera) + raya(`M${x0 + 6} 954 L${x1 - 6} 955 L${x1 - 8} 1004 L${x0 + 8} 1003 Z`, C.cargoL, 1.6);
  }
  o += pieza(pol([[180, 842], [226, 846], [222, 932], [178, 928]]), C.cargo, [[pol([[206, 840], [232, 840], [232, 936], [208, 936]]), C.cargoS]], { w: 4.6, peso: 1.4 });
  o += pieza(pol([[176, 836], [230, 840], [228, 862], [176, 858]]), C.cargoL, [], { w: 4.4, peso: 1.2 });
  o += pieza(pol([[380, 848], [428, 844], [430, 930], [384, 936]]), C.cargo, [[pol([[404, 842], [436, 842], [436, 940], [404, 940]]), C.cargoS]], { w: 4.6, peso: 1.4 });
  o += pieza(pol([[376, 842], [432, 838], [432, 860], [378, 864]]), C.cargoL, [], { w: 4.4, peso: 1.2 });
  o += pincel([212, 1024], [228, 1034], [244, 1034], [260, 1024], 3.2) + pincel([340, 1026], [356, 1036], [372, 1036], [388, 1026], 3.2);
  o += pincel([300, 820], [296, 850], [290, 874], [286, 894], 3);
  for (const x of [240, 360]) {
    o += pincel([x - 40, 1074], [x - 20, 1086], [x + 4, 1080], [x + 20, 1068], 3) + pincel([x - 30, 1094], [x - 10, 1102], [x + 14, 1098], [x + 34, 1088], 2.8);
  }
  return o;
}

// Una llave combinada en miniatura, colgando: la corona arriba (en la argolla) y la boca abierta abajo
function llaveChica(largo, banda) {
  let k = '';
  k += pieza(pol([[-3.4, 12], [3.4, 12], [4, largo - 10], [-4, largo - 10]]), C.cromo, [[pol([[0, 8], [6, 8], [6, largo], [0, largo]]), C.cromoS]], { w: 2.6, peso: 0 });
  k += pieza(pol([[-8, largo - 14], [8, largo - 14], [9, largo], [3, largo], [3, largo - 6], [-3, largo - 6], [-3, largo], [-9, largo]]), C.cromo, [], { w: 2.6, peso: 0 });
  k += `<path d="M-7 7 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M-3.4 7 a3.4 3.4 0 1 1 6.8 0 a3.4 3.4 0 1 1 -6.8 0 Z" fill="${C.cromo}" fill-rule="evenodd" stroke="${K}" stroke-width="2.6"/>`;
  if (banda) k += pieza(pol([[-4.4, 20], [4.4, 20], [4.6, 30], [-4.6, 30]]), banda, [], { w: 2.2, peso: 0 });
  return k;
}

// ── El brazo de atrás (el de la tablet): manga arremangada con el ribete naranjo, bíceps y antebrazo marcados ──
function brazoLejos() {
  let o = '';
  const brazo = curva([[134, 470], [124, 520], [120, 566], [130, 606], [154, 640], [184, 630], [198, 590], [202, 530], [200, 470]], true);
  o += pieza(brazo, C.piel, [[pol([[170, 450], [212, 450], [212, 650], [172, 650]]), C.pielS]]);
  o += pincel([142, 560], [140, 580], [144, 598], [152, 612], 2.4);
  const ante = miembro([[166, 752], [156, 620]], [50, 68], { punta: 'redonda' });
  o += pieza(ante, C.piel, [[pol([[164, 600], [204, 600], [194, 770], [170, 770]]), C.pielS]]);
  o += pincel([150, 652], [146, 678], [148, 704], [154, 728], 2.2);
  const manga = curva([[202, 424], [166, 432], [140, 456], [128, 494], [130, 528], [198, 534], [206, 478]], true);
  o += pieza(manga, C.polera, [[pol([[120, 430], [150, 430], [146, 540], [120, 540]]), C.poleraL]]);
  o += pieza(pol([[129, 514], [199, 518], [199, 536], [129, 532]]), C.naranjo, [[pol([[178, 510], [204, 510], [204, 540], [180, 540]]), C.naranjoS]], { w: 4, peso: 1 });
  return o;
}

// ── El torso en V, liso, y el cuello naranjo de la polera ──
const TORSO = curva([[258, 404], [220, 414], [186, 430], [166, 456], [176, 494], [188, 532], [196, 600], [204, 660], [210, 708], [300, 718], [392, 708], [398, 660], [404, 600], [412, 532], [426, 494], [436, 456], [416, 430], [382, 414], [342, 404], [300, 422]], true);
function torso() {
  let o = pieza(TORSO, C.polera, [[pol([[350, 396], [480, 396], [480, 730], [356, 730], [372, 560]]), C.poleraS], [pol([[160, 440], [198, 440], [208, 724], [184, 724]]), C.poleraL]]);
  o += pincel([224, 506], [248, 522], [274, 526], [298, 516], 2.8) + pincel([306, 518], [330, 528], [352, 526], [372, 514], 2.8);
  o += pincel([222, 640], [236, 656], [250, 664], [268, 668], 2.6) + pincel([392, 628], [384, 648], [372, 660], [356, 666], 2.6);
  o += pieza(curva([[258, 404], [300, 424], [342, 404], [340, 414], [300, 436], [260, 414]], true), C.naranjo, [], { w: 4, peso: 0 });
  return o;
}

// ── El chaleco de lona abierto, con sus bolsillos y un lápiz ──
function chaleco() {
  let o = '';
  const izq = curva([[252, 406], [214, 416], [182, 434], [174, 470], [186, 540], [196, 610], [204, 700], [248, 706], [258, 612], [252, 520], [244, 452]], true);
  const der = curva([[348, 406], [386, 416], [418, 434], [426, 470], [414, 540], [404, 610], [396, 700], [352, 706], [342, 612], [348, 520], [356, 452]], true);
  o += pieza(izq, C.lona, [[pol([[160, 420], [192, 420], [206, 712], [188, 712]]), C.lonaL]]);
  o += pieza(der, C.lona, [[pol([[368, 400], [440, 400], [440, 716], [372, 716]]), C.lonaS]]);
  o += raya('M248 412 L240 456 L248 520 L254 612 L244 700', C.lonaL, 1.6) + raya('M352 412 L360 456 L352 520 L346 612 L356 700', C.lonaS, 1.6);
  for (const [x0, x1, y] of [[200, 244, 600], [356, 400, 600]]) {
    o += pieza(pol([[x0, y], [x1, y], [x1 - 2, y + 54], [x0 + 2, y + 54]]), C.lona, [[pol([[x0 + 24, y - 4], [x1 + 4, y - 4], [x1 + 4, y + 58], [x0 + 26, y + 58]]), C.lonaS]], { w: 3.6, peso: 0.8 });
    o += pieza(pol([[x0 - 2, y - 4], [x1 + 2, y - 4], [x1 + 2, y + 12], [x0 - 2, y + 12]]), C.lonaL, [], { w: 3.4, peso: 0 });
  }
  o += pieza(pol([[366, 568], [374, 568], [376, 598], [366, 598]]), C.naranjo, [], { w: 2.8, peso: 0 }) + negro(pol([[366, 568], [374, 568], [370, 558]]));
  return o;
}
// ── La canana: del hombro de atrás a la cadera de adelante, con brocas y tornillos ──
function canana() {
  let o = '';
  const a = [196, 444], b = [406, 716], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), u = [dx / l, dy / l], n = [-u[1], u[0]];
  const p = (t, s) => [r1(a[0] + dx * t + n[0] * s), r1(a[1] + dy * t + n[1] * s)];
  o += pieza(pol([p(0, -15), p(1, -15), p(1, 15), p(0, 15)]), C.cuero, [[pol([p(0, 4), p(1, 4), p(1, 16), p(0, 16)]), C.cueroS]], { w: 4.4, peso: 1 });
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + i * 0.1, [x, y] = p(t, 0), ang = Math.atan2(u[1], u[0]) * 180 / Math.PI;
    const g = i % 3 !== 1
      ? pieza(pol([[-4, -24], [4, -24], [4, 6], [-4, 6]]), C.cromo, [[pol([[0, -28], [6, -28], [6, 10], [1, 10]]), C.cromoS]], { w: 2.4, peso: 0 }) + L('M-4 -16 L4 -12 M-4 -8 L4 -4', 1.4, C.cromoS) + negro(pol([[-4, -24], [4, -24], [0, -32]]))
      : pieza(pol([[-3, -22], [3, -22], [3, 4], [-3, 4]]), C.bronce, [], { w: 2.2, peso: 0 }) + pieza(pol([[-7, -26], [7, -26], [7, -20], [-7, -20]]), C.bronce, [], { w: 2.2, peso: 0 });
    o += `<g transform="translate(${x} ${y}) rotate(${r1(ang - 90)})">${g}</g>`;
  }
  o += pieza(pol([p(0.04, -15), p(0.94, -15), p(0.94, -6), p(0.04, -6)]), C.cueroL, [], { w: 0, borde: false });
  return o;
}

// ── El cinturón pistolero: la hebilla de rodeo con el 4, las dos cartucheras con sus taladros y el llavero ──
function cinturon() {
  let o = '';
  o += pieza(pol([[190, 704], [410, 708], [414, 742], [186, 738]]), C.cuero, [[pol([[330, 700], [420, 700], [420, 746], [330, 746]]), C.cueroS]], { w: 4.6, peso: 1.2 });
  o += raya('M196 712 L404 716', C.cueroL, 1.6) + raya('M194 732 L408 736', C.cueroL, 1.6);
  // La hebilla de rodeo: ovalada, de plata, con dos taladros cruzados grabados y el 4 al centro
  o += pieza('M258 723 a42 29 0 1 0 84 0 a42 29 0 1 0 -84 0 Z', C.metal, [[pol([[306, 690], [346, 690], [346, 756], [308, 756]]), C.metalS], `<path d="M266 716 Q280 700 300 698" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".8"/>`], { w: 5, peso: 1.2 });
  o += `<ellipse cx="300" cy="723" rx="34" ry="22" fill="none" stroke="${C.metalS}" stroke-width="2" stroke-dasharray="3 3"/>`;
  for (const giro of [-28, 28]) {
    o += `<g transform="rotate(${giro} 300 723)" opacity=".9"><rect x="266" y="718" width="20" height="10" rx="2" fill="${C.metalS}"/><rect x="286" y="720" width="6" height="6" fill="${C.metalS}"/><path d="M292 723 H332" stroke="${C.metalS}" stroke-width="3" stroke-linecap="round"/></g>`;
  }
  o += numeroChico(`<text x="300" y="790" text-anchor="middle" font-family="${NUMERO}" font-size="148" fill="${C.naranjo}" stroke="${K}" stroke-width="5" paint-order="stroke">4</text>`, 300, 723, 0.3);
  // Las dos cartucheras, con el taladro enfundado: asoman la cola naranja del motor, el mango y la batería
  for (const x of [220, 392]) {
    o += pieza('M' + (x - 16) + ' 746 V724 Q' + (x - 16) + ' 716 ' + (x - 8) + ' 716 H' + (x + 8) + ' Q' + (x + 16) + ' 716 ' + (x + 16) + ' 724 V746 Z', C.naranjo, [[pol([[x + 4, 712], [x + 20, 712], [x + 20, 750], [x + 6, 750]]), C.naranjoS]], { w: 4.4, peso: 1 });
    o += pieza(pol([[x + 12, 720], [x + 42, 714], [x + 44, 734], [x + 14, 740]]), C.fierro, [[pol([[x + 10, 730], [x + 48, 730], [x + 48, 744], [x + 10, 744]]), C.fierroS]], { w: 4, peso: 0.8 });
    o += pieza(pol([[x + 40, 704], [x + 62, 702], [x + 64, 742], [x + 42, 744]]), C.fierro, [[pol([[x + 54, 698], [x + 68, 698], [x + 68, 748], [x + 56, 748]]), C.fierroS]], { w: 4, peso: 0.8 });
    o += pieza(pol([[x + 40, 720], [x + 64, 719], [x + 64, 726], [x + 40, 727]]), C.naranjo, [], { w: 2, peso: 0 });
    o += pieza(pol([[x - 30, 738], [x + 30, 738], [x + 24, 836], [x - 20, 840]]), C.cuero, [[pol([[x + 6, 734], [x + 34, 734], [x + 30, 844], [x + 8, 844]]), C.cueroS]], { w: 4.6, peso: 1.2 });
    o += raya(`M${x - 24} 746 L${x + 24} 746 L${x + 18} 830 L${x - 16} 832 Z`, C.cueroL, 1.4);
    o += `<circle cx="${x}" cy="790" r="6" fill="${C.naranjo}" stroke="${K}" stroke-width="2.4"/>`;
  }
  // El llavero, en la presilla de al lado de la hebilla: una llave para cada integración
  const ax = 346, ay = 750;
  [[-20, 50, C.naranjo], [-6, 60, C.cian], [10, 56, null], [24, 50, C.naranjo]].forEach(([ang, largo, banda]) => {
    o += `<g transform="translate(${ax} ${ay}) rotate(${ang}) scale(1.2)">${llaveChica(largo, banda)}</g>`;
  });
  o += `<circle cx="${ax}" cy="${ay + 2}" r="10" fill="none" stroke="${K}" stroke-width="6.5"/><circle cx="${ax}" cy="${ay + 2}" r="10" fill="none" stroke="${C.metal}" stroke-width="3.2"/>`;
  return o;
}

// ── Aserrín: granitos sueltos, un montoncito en el suelo y las virutas enruladas, como las que salen del cepillo ──
function aserrin(puntos) {
  return puntos.map(([x, y, r = 2.6]) => `<path d="M${r1(x - r)} ${r1(y)} L${r1(x)} ${r1(y - r * 0.8)} L${r1(x + r)} ${r1(y)} L${r1(x)} ${r1(y + r * 0.8)} Z" fill="${C.viruta}" stroke="${K}" stroke-width="1.2"/>`).join('');
}
function montonAserrin(x, ancho = 90) {
  return pieza(`M${x - ancho / 2} 1240 Q${x - ancho / 4} 1222 ${x} 1220 Q${x + ancho / 4} 1222 ${x + ancho / 2} 1240 Z`, C.viruta, [[pol([[x + 6, 1214], [x + ancho / 2 + 4, 1214], [x + ancho / 2 + 4, 1244], [x + 10, 1244]]), C.virutaS]], { w: 3.6, peso: 0 });
}
function viruta(x, y, e = 1, giro = 0) {
  const d = 'M0 0 C6 -16 26 -20 34 -6 C40 6 30 18 18 14 C8 10 10 -2 20 -2 C28 -2 28 8 22 8 M34 -6 C42 -20 58 -18 62 -6';
  return `<g transform="translate(${x} ${y}) rotate(${giro}) scale(${e})">` +
    `<path d="${d}" fill="none" stroke="${K}" stroke-width="${r1(11 / e)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${C.viruta}" stroke-width="${r1(6.4 / e)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M2 -4 C8 -16 24 -18 30 -8" fill="none" stroke="#FFF1DA" stroke-width="${r1(2 / e)}" stroke-linecap="round"/></g>`;
}

// ── La tablet con funda de madera, en la mano de atrás; en la pantalla, el plano del mueble ──
function tablet() {
  let o = `<g transform="rotate(-6 142 818)">`;
  o += pieza(pol([[88, 738], [194, 738], [194, 896], [88, 896]]), C.madera, [[pol([[160, 732], [200, 732], [200, 900], [164, 900]]), C.maderaS], [pol([[86, 736], [96, 736], [96, 898], [86, 898]]), C.maderaL]], { w: 5.5 });
  o += L('M96 760 Q140 756 186 762 M96 820 Q140 824 186 818 M96 872 Q140 868 186 874', 1.4, C.maderaS);
  o += pieza(pol([[100, 752], [182, 752], [182, 882], [100, 882]]), C.pantalla, [], { w: 3, peso: 0 });
  o += `<path d="M114 784 H168 V866 H114 Z M114 812 H168 M114 840 H168 M136 798 H146 M136 826 H146 M136 854 H146" fill="none" stroke="${C.cian}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += L('M110 770 L146 770', 2.6, '#35679A') + L('M150 874 L172 874 M150 870 V878 M172 870 V878', 1.6, C.cianL);
  o += `</g>`;
  o += pieza(curva([[148, 742], [180, 744], [190, 756], [186, 776], [164, 778], [152, 764]], true), C.piel, [[pol([[174, 736], [196, 736], [196, 782], [176, 782]]), C.pielS]], { w: 5, peso: 1.6 });
  for (let i = 0; i < 4; i++) {
    const y = 762 + i * 15;
    o += pieza(curva([[176, y], [196, y - 2], [204, y + 6], [198, y + 14], [178, y + 13]], true), C.piel, [[pol([[190, y - 4], [208, y - 4], [208, y + 18], [192, y + 18]]), C.pielS]], { w: 3.6, peso: 0.8 });
  }
  return o;
}

// ── El taladro: cuerpo vertical, broca hacia arriba (-y), mango hacia la derecha (+x) y la batería en la punta ──
function taladro() {
  let o = '';
  o += pieza(pol([[-56, -118], [-44, -118], [-46, -196], [-50, -206], [-54, -196]]), C.cromo, [[pol([[-50, -210], [-40, -210], [-40, -114], [-50, -114]]), C.cromoS]], { w: 3.4, peso: 0 });
  for (let y = -190; y < -124; y += 12) o += L(`M-56 ${y} L-44 ${y + 8}`, 2, C.cromoS);
  o += pieza(pol([[-64, -122], [-36, -122], [-32, -88], [-68, -88]]), C.cromo, [[pol([[-50, -126], [-28, -126], [-28, -84], [-48, -84]]), C.cromoS]], { w: 4, peso: 0.8 });
  o += L('M-66 -110 L-34 -110 M-67 -100 L-33 -100', 1.8, C.cromoS);
  // El cuerpo del motor
  o += pieza('M-76 -88 H-24 Q-14 -88 -14 -78 V14 Q-14 24 -24 24 H-76 Q-86 24 -86 14 V-78 Q-86 -88 -76 -88 Z', C.naranjo, [[pol([[-44, -92], [-10, -92], [-10, 28], [-42, 28]]), C.naranjoS], [pol([[-90, -92], [-78, -92], [-78, 28], [-90, 28]]), C.naranjoL]], { w: 5, peso: 1.4 });
  o += pieza(pol([[-86, -30], [-14, -30], [-14, -10], [-86, -10]]), C.fierro, [], { w: 3.6, peso: 0 });
  for (const y of [-74, -64, -54]) o += L(`M-70 ${y} L-44 ${y}`, 2.2, C.naranjoS);
  // El mango, con su goma, y el gatillo
  o += pieza(pol([[-16, -16], [44, -18], [46, 16], [-16, 18]]), C.fierro, [[pol([[-16, 4], [46, 4], [46, 20], [-16, 20]]), C.fierroS]], { w: 4.6, peso: 1 });
  o += pieza(pol([[-12, 18], [6, 18], [2, 34], [-10, 32]]), C.fierroS, [], { w: 3, peso: 0 });
  // La batería
  o += pieza(pol([[42, -30], [78, -30], [80, 30], [42, 30]]), C.fierro, [[pol([[62, -34], [84, -34], [84, 34], [64, 34]]), C.fierroS]], { w: 4.6, peso: 1 });
  o += pieza(pol([[42, -6], [80, -6], [80, 4], [42, 4]]), C.naranjo, [], { w: 2.4, peso: 0 });
  for (const x of [52, 60, 68]) o += `<rect x="${x}" y="-24" width="5" height="9" fill="${C.cian}" stroke="${K}" stroke-width="1.2"/>`;
  return o;
}
// El puño que toma el mango horizontal
function punoMango() {
  let m = pieza(curva([[-22, -26], [0, -32], [22, -26], [28, -4], [24, 24], [4, 32], [-18, 28], [-28, 6]], true), C.piel, [[pol([[6, -36], [34, -36], [34, 36], [8, 36]]), C.pielS]], { w: 5, peso: 1.6 });
  for (const x of [-12, 0, 12]) m += L(`M${x} -22 L${x + 2} 22`, 2.4);
  m += pieza(curva([[-26, -10], [-40, -20], [-44, -6], [-30, 4]], true), C.piel, [[pol([[-46, -24], [-28, -24], [-28, 8], [-46, 8]]), C.pielS]], { w: 4, peso: 1 });
  return m;
}

// ── El brazo de adelante, en alto, con el taladro como pistola y el rulo de aserrín que sale de la broca ──
const MANO = { x: 470, y: 486, giro: 16 };
function brazoTaladro() {
  let o = '';
  const brazo = curva([[406, 466], [396, 510], [400, 554], [420, 594], [452, 624], [490, 622], [506, 590], [502, 538], [488, 492], [468, 462]], true);
  o += pieza(brazo, C.piel, [[pol([[464, 450], [520, 450], [520, 640], [472, 640], [480, 540]]), C.pielS]]);
  o += pincel([470, 524], [476, 550], [478, 574], [474, 598], 2.4);
  const m = curva([[402, 428], [440, 428], [474, 446], [492, 470], [494, 488], [414, 496], [404, 474]], true);
  o += pieza(m, C.polera, [[pol([[446, 418], [504, 418], [504, 504], [452, 504]]), C.poleraS]]);
  o += pieza(pol([[410, 480], [494, 472], [496, 490], [414, 500]]), C.naranjo, [[pol([[462, 466], [500, 466], [500, 496], [464, 496]]), C.naranjoS]], { w: 4, peso: 1 });
  o += pieza(miembro([[488, 610], [474, 506]], [70, 56], { punta: 'redonda' }), C.piel, [[pol([[488, 500], [520, 500], [520, 630], [492, 630]]), C.pielS]]);
  o += pincel([466, 586], [462, 562], [462, 540], [466, 520], 2.4);
  o += `<g transform="translate(${MANO.x} ${MANO.y}) rotate(${MANO.giro})">${taladro()}${punoMango()}</g>`;
  const a = MANO.giro * Math.PI / 180, bx = MANO.x - 50 * Math.cos(a) + 206 * Math.sin(a), by = MANO.y - 50 * Math.sin(a) - 206 * Math.cos(a);
  o += viruta(r1(bx - 6), r1(by - 22), 0.8, -70) + viruta(r1(bx + 10), r1(by - 64), 0.62, -100);
  o += aserrin([[bx - 20, by - 10, 2.6], [bx + 22, by - 4, 2.4], [bx - 8, by - 90, 2.2], [bx + 30, by - 50, 2.4]]);
  return o;
}

// ── La cabeza, en sus coordenadas (enCabeza() la ubica) ──
const cuello = () => pieza(pol([[268, 470], [334, 470], [338, 526], [264, 526]]), C.piel, [[pol([[262, 462], [342, 462], [342, 494], [262, 500]]), C.pielS], [pol([[314, 480], [346, 480], [346, 530], [318, 530]]), C.pielS]]);
const oreja = () => pieza(curva([[372, 374], [396, 366], [406, 392], [398, 424], [374, 430]], true), C.piel, [[pol([[384, 360], [410, 360], [410, 434], [388, 434]]), C.pielS]], { w: 5, peso: 1.6 }) + L('M386 382 Q396 396 388 414', 2.6);
const CARA = curva([[226, 352], [240, 304], [290, 282], [346, 288], [380, 320], [388, 372], [384, 424], [370, 468], [334, 496], [286, 500], [246, 484], [226, 456], [222, 410]], true);
function cara() {
  let o = pieza(CARA, C.piel, [[pol([[344, 330], [400, 330], [400, 500], [330, 500], [350, 420]]), C.pielS]]);
  // Los lados rapados
  o += pieza(pol([[330, 304], [384, 326], [388, 372], [372, 376], [356, 346], [332, 332]]), C.rapado, [], { w: 0, borde: false });
  for (let i = 0; i < 14; i++) o += `<circle cx="${340 + (i * 37) % 44}" cy="${318 + (i * 23) % 52}" r="1.6" fill="${C.peloS}" opacity=".7"/>`;
  return o + B(CARA, W);
}
// Barba corta y definida: patillas, mandíbula, mentón y el bigote, sin llegar a ser frondosa
function barba() {
  let o = '';
  const forma = pol([[366, 384], [382, 388], [388, 420], [376, 462], [340, 494], [288, 503], [248, 489], [226, 462], [230, 452], [248, 466], [272, 472], [298, 464], [314, 452], [334, 440], [354, 418]]);
  o += pieza(forma, C.barba, [[pol([[330, 380], [396, 380], [396, 510], [322, 510]]), C.barbaS], [pol([[236, 470], [270, 478], [270, 496], [240, 490]]), C.barbaL]], { w: 4.4, peso: 1 });
  for (const [x, y] of [[258, 480], [276, 488], [296, 486], [316, 478], [338, 468], [356, 448], [366, 420], [372, 402]]) o += L(`M${x} ${y} l3 7`, 1.8, C.barbaS);
  o += pieza(pol([[228, 448], [246, 440], [270, 438], [292, 441], [306, 448], [298, 454], [272, 451], [250, 453], [233, 458]]), C.barba, [[pol([[276, 434], [310, 434], [310, 458], [278, 458]]), C.barbaS]], { w: 3.6, peso: 0.6 });
  return o;
}
const boca = () => L('M238 459 Q262 467 290 456', 4) + L('M290 456 L298 448', 3.2);
function nariz() {
  let n = P(pol([[268, 380], [248, 398], [236, 410], [206, 428], [210, 440], [232, 446], [262, 444], [270, 420]]), C.piel);
  n += P(pol([[206, 430], [236, 430], [262, 438], [262, 446], [232, 446], [210, 440]]), C.pielS);
  n += B('M268 380 L248 398 L236 410 L206 428 Q203 438 212 442 L232 446', 5);
  n += L('M262 444 Q256 436 250 438', 2.4) + negro(pol([[218, 440], [240, 438], [236, 446], [222, 446]]));
  return achicar(n, 268, 382, 0.78);
}
const cejas = () => negro(pol([[226, 362], [256, 352], [260, 362], [230, 370]])) + negro(pol([[284, 352], [330, 340], [334, 352], [288, 362]]));
// Los lentes de seguridad: una sola mica envolvente, naranja, con el puente de la ceja y la patilla hasta la oreja
const MICA = 'M206 372 C236 360 286 362 298 364 C328 360 362 358 382 366 L386 394 C372 410 334 413 314 405 C302 399 292 399 280 405 C258 415 222 411 208 399 Z';
function lentes() {
  let o = B('M382 372 L404 380', 6.5) + L('M382 372 L404 380', 3, C.fierro);
  o += pieza(MICA, '#F7A33A', [
    [pol([[196, 384], [396, 384], [396, 420], [196, 420]]), C.naranjoS],
    `<path d="M222 404 L250 366 L264 366 L236 406 Z M318 404 L344 364 L354 364 L328 406 Z" fill="#FFFFFF" opacity=".75"/>`,
    `<path d="M210 376 C240 366 290 368 300 370 C330 366 362 364 384 372 L384 376 C362 370 330 372 300 375 C290 374 240 372 210 380 Z" fill="#FFE2C4" opacity=".7"/>`
  ], { w: 5, peso: 1.2 });
  o += pieza('M204 368 C236 356 290 358 300 360 C330 356 364 354 384 362 L384 370 C362 362 330 364 300 367 C290 366 238 364 206 376 Z', C.fierro, [], { w: 3.4, peso: 0 });
  return o;
}
// El jopo, con sus brillos
const JOPO = curva([[228, 352], [210, 312], [202, 270], [214, 232], [248, 204], [298, 194], [346, 208], [384, 244], [398, 292], [388, 326], [356, 314], [318, 314], [284, 322], [256, 334]], true);
function jopo() {
  let o = pieza(JOPO, C.pelo, [
    [pol([[200, 240], [250, 226], [244, 300], [232, 352], [204, 340]]), C.peloS],
    [pol([[340, 236], [400, 270], [394, 330], [350, 316]]), C.peloS]
  ]);
  o += pincel([230, 300], [240, 262], [266, 236], [306, 228], 3, { ini: 0.2, fin: 0.4 }) + pincel([256, 312], [272, 280], [302, 258], [340, 252], 2.6) + pincel([288, 316], [306, 290], [334, 276], [366, 276], 2.4);
  o += P('M250 262 Q284 240 324 244 Q290 250 262 272 Z', C.peloL) + P('M292 282 Q326 262 360 274 Q330 274 304 290 Z', C.peloL);
  o += P('M214 262 Q222 226 258 210 Q236 232 228 266 Z', C.peloL);
  return o;
}
export const cabeza = () => enCabeza(cuello() + oreja() + cara() + barba() + boca() + nariz() + cejas() + lentes() + jopo());

export function engine({ prefijo = 'en' } = {}) {
  reiniciar(prefijo);
  return `<g>${bota(-1)}${bota(1)}${montonAserrin(102, 60)}${piernas()}${brazoLejos()}${torso()}${chaleco()}${canana()}${cinturon()}${tablet()}${brazoTaladro()}${cabeza()}</g>`;
}

export const FUENTES = `<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Archivo+Black&display=block" rel="stylesheet">`;
export function vista() {
  return FUENTES + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1260" width="600" height="1260"><rect width="600" height="1260" fill="#000"/>${engine()}</svg>`;
}
