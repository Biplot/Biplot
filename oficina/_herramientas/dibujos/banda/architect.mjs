// The Architect en la línea de la banda: el científico de planos (aprobado el 07-10-2026, la A3 con sus ajustes).
// Altísimo y desgarbado, cabeza grande con el pelo disparado, visor cian y, sobre la sien, las dos antenas: la lupa
// abatible y la antena con su foco cian. Barba corta con canas y la sonrisa torcida. Bata blanca abierta, con la falda
// al vuelo y manchas de tinta cian, el 2 de su placa (E2) en el bolsillo del pecho, con su portaplumas; polera lisa,
// el cinturón de los aparatos (la batería de repuesto y una hélice), pantalón gris con la cadena y zapatillas de caña.
// En la mano de adelante, el control remoto de su dron: chico (no compite con Atlas), proyecta una casa en alambre de
// luz. En la otra, el plumón cian. Marco 600 × 1260, suelo en y = 1240, mira a la derecha.
// El diseño anterior (el polerón abierto con el 2 en la polera) quedó en el museo de la oficina y en el historial de git.
import { K, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, r1, achicar, numeroChico } from './base.mjs';

export const C = {
  piel: '#E3B08A', pielS: '#BC8762', pelo: '#2B211B', peloS: '#1A1310', peloL: '#4D3B2F',
  barba: '#3A332E', barbaS: '#26201C', cana: '#9A938D',
  bata: '#F1F4F7', bataS: '#C3CDD8', bataL: '#FFFFFF', forro: '#D2DAE3',
  polera: '#2C323B', poleraS: '#1A1F26',
  cian: '#17C3B2', cianL: '#7FD8CF', cianS: '#0A8A7E',
  // El pantalón gris (las piernas usan los colores del jean de antes)
  jean: '#4A505B', jeanS: '#323741', jeanL: '#6E7684',
  zap: '#191C22', zapS: '#0F1115', goma: '#ECEFF2', gomaS: '#B5BEC8', cadena: '#C3CDD8',
  cromo: '#D3DAE2', cromoS: '#98A3AF', fierro: '#2A2E35', fierroS: '#16181D'
};
const NUMERO = "'Alfa Slab One', 'Archivo Black', serif";   // el número de camiseta, de losa gruesa

// La cabeza se dibuja en sus coordenadas y se agranda desde la base del cuello
const enCabeza = (o) => `<g transform="translate(300 384) rotate(-3) scale(1.1) translate(-300 -384)">${o}</g>`;

// Una mancha de tinta, redonda e irregular, con un par de gotas alrededor
function mancha(x, y, r, color, giro = 0, { gotas = 2 } = {}) {
  const p = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 + giro) * Math.PI / 180, rr = r * (0.8 + 0.22 * Math.sin(i * 1.9 + giro * 0.07) + (i % 4 === 0 ? 0.22 : 0));
    p.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]);
  }
  let o = P(curva(p, true), color);
  for (let k = 0; k < gotas; k++) {
    const a = (giro * 2.1 + k * 137) * Math.PI / 180, d = r * (1.55 + 0.55 * k);
    o += `<circle cx="${r1(x + d * Math.cos(a))}" cy="${r1(y + d * Math.sin(a))}" r="${r1(Math.max(1.2, r * (0.3 - 0.09 * k)))}" fill="${color}"/>`;
  }
  return o;
}

// ── Zapatillas de caña: enormes, con puntera de goma, cordones y el parche redondo cian ──
function zapatilla(lado) {
  // lado -1: la de la izquierda del cuadro (punta hacia la izquierda); +1: la de la derecha (punta hacia la derecha)
  const x0 = lado < 0 ? 252 : 348, s = -lado, X = (x) => x0 + s * x;
  let o = '';
  o += pieza(pol([[X(-108), 1204], [X(36), 1204], [X(42), 1240], [X(-112), 1240]]), C.goma, [[pol([[X(-120), 1226], [X(50), 1224], [X(50), 1246], [X(-120), 1246]]), C.gomaS]], { w: 5.5 });
  o += L(`M${X(-104)} 1220 L${X(36)} 1219`, 2.6);
  const lona = curva([[X(-26), 1112], [X(30), 1110], [X(36), 1160], [X(36), 1206], [X(-60), 1208], [X(-110), 1204], [X(-100), 1180], [X(-62), 1166], [X(-34), 1146]], true);
  o += pieza(lona, C.zap, [[pol([[X(8), 1104], [X(44), 1104], [X(44), 1212], [X(14), 1212]]), C.zapS]]);
  o += pieza(curva([[X(-110), 1204], [X(-104), 1184], [X(-80), 1174], [X(-58), 1184], [X(-56), 1206]], true), C.goma, [[pol([[X(-74), 1196], [X(-52), 1196], [X(-52), 1210], [X(-74), 1210]]), C.gomaS]], { w: 4.4, peso: 1.4 });
  for (let i = 0; i < 4; i++) {
    const y = 1178 - i * 15, x = -52 + i * 8;
    o += L(`M${X(x - 13)} ${y + 5} L${X(x + 13)} ${y - 5}`, 4.4, C.goma);
  }
  o += `<circle cx="${X(14)}" cy="1148" r="11" fill="${C.cian}" stroke="${K}" stroke-width="3"/>`;
  return o;
}

// ── Piernas: el pantalón pitillo gris, con la basta doblada y la cadena de la billetera ──
function piernas() {
  let o = '';
  const izq = miembro([[262, 696], [268, 930], [252, 1112]], [76, 50, 46], { punta: 'plana' });
  const der = miembro([[338, 696], [332, 930], [348, 1112]], [76, 50, 46], { punta: 'plana' });
  o += pieza(izq, C.jean, [[pol([[268, 680], [316, 680], [300, 1124], [258, 1124], [282, 920]]), C.jeanS]]);
  o += pieza(der, C.jean, [[pol([[350, 680], [400, 680], [392, 1124], [360, 1124], [346, 920]]), C.jeanS]]);
  o += pieza(pol([[224, 690], [376, 690], [380, 750], [300, 770], [220, 750]]), C.jean, [[pol([[330, 686], [390, 686], [390, 770], [330, 770]]), C.jeanS]], { peso: 0 });
  o += pincel([250, 900], [262, 910], [274, 908], [284, 896], 3.2) + pincel([254, 950], [264, 958], [276, 956], [284, 946], 2.6) + pincel([246, 820], [256, 834], [262, 850], [264, 866], 2.4) + pincel([258, 1010], [262, 1030], [258, 1050], [252, 1066], 2.4);
  o += pincel([318, 896], [330, 908], [342, 906], [352, 894], 3.2) + pincel([318, 948], [330, 958], [342, 954], [348, 944], 2.6) + pincel([352, 822], [346, 838], [342, 854], [340, 870], 2.4) + pincel([342, 1012], [340, 1032], [344, 1052], [350, 1066], 2.4);
  o += pincel([300, 760], [296, 790], [290, 812], [284, 830], 3);
  for (const x of [254, 346]) {
    o += pieza(pol([[x - 34, 1086], [x + 32, 1084], [x + 36, 1124], [x - 36, 1126]]), C.jeanL, [[pol([[x + 6, 1080], [x + 40, 1080], [x + 40, 1130], [x + 10, 1130]]), C.jean]], { w: 5, peso: 1.6 });
    o += L(`M${x - 34} 1098 L${x + 33} 1096`, 2.4);
  }
  const cad = 'M372 712 C394 750 402 796 386 816 C376 822 372 794 384 752';
  o += `<path d="${cad}" fill="none" stroke="${K}" stroke-width="7.5" stroke-linecap="round"/><path d="${cad}" fill="none" stroke="${C.cadena}" stroke-width="4" stroke-dasharray="6 3" stroke-linecap="round"/>`;
  return o;
}

// ── La bata: la espalda que se ve entre las piernas y vuela hacia atrás ──
function bataAtras() {
  return pieza(curva([[228, 384], [372, 384], [410, 560], [430, 780], [450, 962], [300, 986], [160, 994], [112, 996], [150, 860], [178, 700], [192, 560]], true), C.forro, [[pol([[330, 380], [460, 380], [460, 1000], [340, 1000]]), C.bataS]]);
}

// ── La polera lisa y el cinturón de los aparatos: la batería de repuesto y una hélice ──
function polera() {
  let o = '';
  o += pieza(pol([[246, 378], [354, 378], [360, 724], [240, 726]]), C.polera, [[pol([[322, 370], [366, 370], [366, 730], [330, 730]]), C.poleraS]]);
  o += L('M264 380 Q300 400 336 380', 4) + L('M268 386 Q300 404 332 386', 2.2, '#434C59');
  o += pieza(pol([[244, 712], [356, 712], [356, 730], [244, 730]]), '#1A1C21', [], { w: 4, peso: 0 });
  // La batería, con sus barras de carga
  o += pieza(pol([[258, 722], [306, 722], [306, 786], [258, 786]]), C.fierro, [[pol([[290, 718], [310, 718], [310, 790], [292, 790]]), C.fierroS]], { w: 4.4, peso: 1 });
  for (const y of [734, 750, 766]) o += pieza(pol([[266, y], [290, y], [290, y + 10], [266, y + 10]]), y < 760 ? C.cian : C.cianS, [], { w: 2, peso: 0 });
  o += pieza(pol([[272, 714], [292, 714], [292, 722], [272, 722]]), C.cromo, [], { w: 2.6, peso: 0 });
  // Una hélice de repuesto colgando
  o += L('M324 728 L324 752', 3) + `<g transform="rotate(64 324 768)">` + pieza('M296 768 C304 760 316 762 324 768 C332 774 344 776 352 768 C344 780 332 778 324 768 C316 758 304 760 296 768 Z', C.cromo, [], { w: 3, peso: 0 }) + `</g>` + `<circle cx="324" cy="768" r="5" fill="${C.cian}" stroke="${K}" stroke-width="2.4"/>`;
  return o;
}

// ── El brazo de la derecha con el control remoto del dron ──
function brazoControl() {
  let o = '';
  o += pieza(miembro([[372, 404], [424, 520]], [58, 48], { punta: 'redonda' }), C.bata, [[pol([[400, 386], [466, 420], [450, 540], [418, 520]]), C.bataS]]);
  o += pieza(miembro([[424, 520], [458, 500]], [48, 44], { punta: 'plana' }), C.bata, [[pol([[426, 506], [462, 488], [466, 514], [432, 534]]), C.bataS]]);
  o += pieza(miembro([[454, 503], [470, 494]], [54, 54], { punta: 'plana' }), C.bataL, [[pol([[458, 500], [482, 488], [484, 510], [462, 518]]), C.bataS]], { w: 4.4, peso: 1 });
  // El control: caja de fierro con dos palancas y la antena hasta arriba
  let c = pieza('M-34 -18 H34 Q42 -18 42 -10 V12 Q42 20 34 20 H-34 Q-42 20 -42 12 V-10 Q-42 -18 -34 -18 Z', C.fierro, [[pol([[10, -22], [46, -22], [46, 24], [12, 24]]), C.fierroS]], { w: 4.6, peso: 1.2 });
  c += `<circle cx="-20" cy="-2" r="8" fill="#1A1C21" stroke="${C.cromoS}" stroke-width="2"/><circle cx="-20" cy="-6" r="4" fill="${C.cian}"/>`;
  c += `<circle cx="20" cy="-2" r="8" fill="#1A1C21" stroke="${C.cromoS}" stroke-width="2"/><circle cx="23" cy="-4" r="4" fill="${C.cian}"/>`;
  c += pieza(pol([[-6, 6], [6, 6], [6, 12], [-6, 12]]), C.cianS, [], { w: 1.6, peso: 0 });
  o += L('M526 452 L548 336', 6) + L('M526 452 L548 336', 2.6, C.cromo) + `<circle cx="549" cy="331" r="6" fill="${C.cromo}" stroke="${K}" stroke-width="2.6"/>`;
  for (const r of [14, 24]) o += `<path d="M${549 - r * 0.7} ${331 - r * 0.7} A${r} ${r} 0 0 1 ${549 + r * 0.7} ${331 - r * 0.7}" fill="none" stroke="${C.cianL}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
  o += `<g transform="translate(504 470) rotate(-10)">${c}</g>`;
  // La mano que lo toma
  o += pieza(curva([[464, 470], [486, 464], [498, 474], [498, 494], [484, 506], [466, 500], [458, 486]], true), C.piel, [[pol([[484, 458], [504, 458], [504, 510], [486, 510]]), C.pielS]], { w: 5, peso: 1.6 });
  o += L('M468 480 Q482 476 494 480 M468 492 Q482 488 494 492', 2.2);
  return o;
}

// ── La bata por delante: dos paneles largos, la falda al vuelo, los bolsillos y las manchas de tinta ──
function bataDelante() {
  let o = '';
  const izq = curva([[266, 372], [236, 378], [212, 396], [202, 440], [200, 540], [196, 660], [182, 800], [150, 920], [118, 990], [176, 988], [252, 972], [252, 700], [246, 470], [258, 410]], true);
  const der = curva([[334, 372], [364, 378], [388, 396], [398, 440], [402, 540], [406, 660], [418, 800], [440, 930], [454, 968], [398, 976], [350, 970], [348, 700], [354, 470], [342, 410]], true);
  o += pieza(izq, C.bata, [[pol([[230, 380], [262, 380], [256, 990], [234, 990]]), C.bataS], [pol([[176, 430], [204, 430], [180, 990], [110, 990]]), C.bataL]]);
  o += pieza(der, C.bata, [[pol([[372, 380], [440, 380], [462, 990], [384, 990]]), C.bataS]]);
  o += pincel([204, 820], [190, 880], [170, 930], [150, 972], 3) + pincel([232, 860], [226, 900], [214, 940], [200, 978], 2.6) + pincel([396, 840], [404, 890], [414, 930], [424, 962], 2.6);
  // Bolsillos de la cadera
  o += pieza(pol([[194, 760], [244, 762], [244, 828], [188, 826]]), C.bata, [[pol([[230, 756], [250, 756], [250, 832], [232, 832]]), C.bataS]], { w: 4, peso: 1 });
  o += pieza(pol([[356, 762], [406, 760], [412, 826], [358, 828]]), C.bataS, [], { w: 4, peso: 1 });
  o += L('M198 776 L242 777', 2.2, C.bataS) + L('M360 777 L406 775', 2.2, '#9FAAB6');
  // El bolsillo del pecho, del lado del corazón: el portaplumas (el plumón cian, un lápiz blanco y uno azul) y el 2
  for (const [x, c, alto] of [[362, C.cian, 40], [372, '#F3F1EA', 34], [382, '#35679A', 38]]) {
    o += pieza(pol([[x - 4, 494 - alto], [x + 4, 494 - alto], [x + 4, 504], [x - 4, 504]]), c, [], { w: 2.8, peso: 0 });
  }
  o += pieza(pol([[352, 490], [400, 488], [402, 556], [354, 558]]), C.bataS, [[pol([[388, 484], [406, 484], [406, 562], [390, 562]]), '#A8B3BF']], { w: 4, peso: 1 });
  o += pieza(pol([[352, 490], [400, 488], [400, 500], [352, 502]]), '#9FAAB6', [], { w: 2.6, peso: 0 });
  o += numeroChico(`<text x="377" y="573" text-anchor="middle" font-family="${NUMERO}" font-size="122" fill="${C.cian}" stroke="${C.cianS}" stroke-width="4" paint-order="stroke" transform="rotate(-4 377 529)">2</text>`, 377, 529, 0.36);
  // Manchas de tinta cian
  o += mancha(222, 612, 9, C.cian, 10) + mancha(378, 688, 7, C.cian, 40) + mancha(212, 892, 10, C.cianS, 70) + mancha(410, 872, 6, C.cian, 20, { gotas: 1 }) + mancha(160, 948, 7, C.cian, 130);
  return o;
}
// El cuello de la bata detrás de la nuca, y las solapas por delante de la manga
function cuelloBata() {
  return pieza(curva([[238, 392], [250, 352], [282, 338], [318, 338], [350, 352], [362, 392], [338, 374], [300, 370], [262, 374]], true), C.bata, [[pol([[300, 330], [372, 330], [372, 400], [300, 400]]), C.bataS]]);
}
function solapas() {
  let o = '';
  o += pieza(pol([[264, 374], [238, 398], [230, 452], [248, 474], [252, 422]]), C.bataL, [[pol([[244, 380], [266, 380], [258, 480], [246, 480]]), C.bataS]], { w: 4, peso: 0 });
  o += pieza(pol([[336, 374], [362, 398], [370, 452], [352, 474], [348, 422]]), C.bata, [[pol([[352, 380], [376, 380], [376, 480], [354, 480]]), C.bataS]], { w: 4, peso: 0 });
  return o;
}

// ── El brazo de la izquierda: la manga arremangada y el puño con el plumón cian apuntando abajo ──
function brazoPlumon() {
  let o = '';
  o += pieza(miembro([[220, 400], [198, 548], [194, 640]], [58, 50, 48], { punta: 'plana' }), C.bata, [[pol([[204, 380], [256, 380], [216, 660], [204, 660]]), C.bataS], [pol([[160, 420], [184, 420], [178, 660], [160, 660]]), C.bataL]]);
  o += pincel([200, 520], [206, 540], [214, 556], [220, 562], 2.6);
  o += mancha(186, 590, 6, C.cian, 200, { gotas: 1 });
  o += pieza(miembro([[194, 650], [194, 690]], [40, 38], { punta: 'plana' }), C.piel, [[pol([[198, 640], [220, 640], [220, 700], [200, 700]]), C.pielS]], { w: 4.4, peso: 1 });
  o += pieza(pol([[166, 628], [222, 630], [222, 660], [166, 658]]), C.bataL, [[pol([[200, 624], [228, 624], [228, 664], [202, 664]]), C.bataS]], { w: 4.6, peso: 1.2 });
  o += L('M168 644 L220 645', 2.2, C.bataS);
  o += pieza(curva([[174, 680], [210, 682], [222, 696], [224, 712], [220, 730], [206, 738], [188, 736], [174, 724], [170, 700]], true), C.piel, [[pol([[200, 676], [230, 676], [230, 742], [206, 742]]), C.pielS]], { w: 5, peso: 1.6 });
  for (const y of [698, 711, 724]) o += L(`M182 ${y} Q200 ${y - 4} 220 ${y + 1}`, 2.4);
  o += L('M176 690 Q186 686 196 690', 2.2) + P(pol([[208, 684], [222, 690], [216, 698], [206, 692]]), C.pielS);
  o += pieza(pol([[188, 730], [206, 730], [212, 820], [194, 822]]), C.cian, [[pol([[200, 726], [214, 726], [216, 824], [204, 824]]), C.cianS]], { w: 4.6, peso: 1.4 });
  o += negro(pol([[194, 822], [212, 820], [204, 842]]));
  return o;
}

// ── La cabeza, en sus coordenadas (enCabeza() la ubica) ──
function cara() {
  let o = '';
  o += pieza(pol([[284, 316], [320, 316], [322, 382], [282, 384]]), C.piel, [[pol([[280, 310], [326, 310], [326, 346], [280, 352]]), C.pielS], [pol([[306, 340], [330, 340], [330, 390], [310, 390]]), C.pielS]]);
  o += pieza(curva([[254, 226], [234, 218], [224, 246], [230, 274], [252, 284]], true), C.piel, [[pol([[224, 252], [246, 252], [246, 288], [224, 288]]), C.pielS]], { w: 5, peso: 1.6 });
  o += L('M242 236 Q232 250 238 268', 2.6);
  const forma = curva([[248, 196], [264, 150], [302, 130], [346, 138], [374, 170], [382, 214], [386, 252], [378, 286], [360, 316], [330, 336], [296, 334], [268, 318], [252, 290], [244, 248]], true);
  o += pieza(forma, C.piel, [[pol([[352, 200], [400, 200], [400, 330], [346, 330], [358, 268]]), C.pielS], [pol([[250, 238], [392, 238], [392, 254], [250, 252]]), C.pielS]]);
  return o;
}
// Barba corta con canas
function barba() {
  let o = '';
  const forma = pol([[248, 236], [256, 262], [278, 282], [302, 280], [324, 270], [348, 276], [382, 266], [376, 292], [358, 320], [330, 342], [296, 340], [266, 324], [250, 298], [244, 266]]);
  o += pieza(forma, C.barba, [[pol([[338, 250], [400, 250], [400, 350], [326, 350]]), C.barbaS]], { w: 5 });
  for (const [x, y] of [[262, 292], [276, 308], [292, 320], [312, 326], [270, 276], [338, 316], [352, 300], [324, 332]]) o += L(`M${x} ${y} l5 -10`, 2, C.cana);
  return o;
}
// La sonrisa torcida, con los dientes apretados
function boca() {
  let o = '';
  o += pieza(curva([[318, 302], [342, 300], [364, 292], [380, 282], [376, 300], [352, 312], [326, 312]], true), '#2B0E08', [], { w: 3.6, peso: 0 });
  o += P(curva([[324, 303], [344, 301], [364, 294], [374, 288], [370, 297], [348, 305], [326, 307]], true), '#F3F1EA');
  o += L('M336 302 L337 307 M348 300 L349 305 M360 296 L361 302', 1.6);
  return o;
}
function nariz() {
  let n = pieza(pol([[358, 234], [406, 268], [396, 280], [366, 282]]), C.piel, [[pol([[380, 262], [410, 262], [410, 290], [372, 290]]), C.pielS]], { w: 5, peso: 1.6 });
  n += negro(pol([[370, 281], [394, 280], [390, 287], [368, 288]])) + L('M350 258 Q366 264 382 260', 2.4);
  return achicar(n, 362, 238, 0.74);
}
// Cejas: una levantada
const cejas = () => negro(pol([[258, 192], [302, 180], [306, 192], [264, 200]])) + negro(pol([[322, 180], [364, 166], [370, 176], [326, 192]]));
// El visor envolvente, con su brillo
const VISOR = curva([[238, 206], [300, 196], [392, 204], [396, 222], [394, 240], [300, 236], [238, 242], [234, 224]], true);
function visor() {
  let o = `<path d="${VISOR}" fill="${C.cian}" opacity=".55" filter="url(#brillo-visor)"/>`;
  o += pieza(VISOR, C.cian, [
    [pol([[230, 228], [400, 226], [400, 250], [230, 250]]), C.cianS],
    [pol([[230, 196], [400, 196], [400, 210], [230, 212]]), C.cianL],
    [pol([[300, 196], [318, 196], [296, 246], [278, 246]]), '#FFFFFF'],
    [pol([[326, 196], [334, 196], [312, 246], [304, 246]]), '#E8FFFC']
  ], { w: 6.5 });
  return o;
}
// El pelo, más disparado que nunca
const PELO = pol([[244, 222], [198, 206], [232, 184], [186, 152], [230, 146], [206, 104], [248, 118], [238, 70], [272, 104], [270, 48], [298, 96], [306, 44], [322, 98], [340, 58], [346, 108], [376, 72], [368, 118], [412, 106], [384, 140], [420, 150], [386, 168], [366, 160], [346, 152], [322, 156], [300, 148], [276, 158], [258, 172], [250, 196], [250, 232]]);
function pelo() {
  let o = pieza(PELO, C.pelo, [
    [pol([[186, 140], [262, 120], [262, 186], [246, 226], [190, 210]]), C.peloS],
    [pol([[272, 104], [270, 52], [286, 100]]), C.peloL],
    [pol([[306, 96], [306, 50], [318, 98]]), C.peloL],
    [pol([[346, 106], [370, 78], [358, 116]]), C.peloL],
    [pol([[256, 168], [300, 150], [346, 154], [380, 170], [380, 182], [256, 182]]), C.peloS]
  ]);
  o += pincel([270, 150], [278, 132], [284, 120], [290, 104], 2.6) + pincel([316, 140], [322, 124], [330, 108], [338, 92], 2.6) + pincel([236, 170], [226, 160], [214, 150], [204, 140], 2.2);
  return o;
}
// Las dos antenas: la lupa abatible, levantada sobre la sien, y la antena con su foco cian
function antenas() {
  let o = '';
  o += L('M240 222 L216 170', 9) + L('M240 222 L216 170', 4.4, C.cromo);
  o += `<circle cx="212" cy="160" r="19" fill="${C.cromo}" stroke="${K}" stroke-width="4.6"/><circle cx="212" cy="160" r="11.5" fill="${C.cianL}" stroke="${K}" stroke-width="2.8"/><path d="M205 156 L211 149" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>`;
  o += `<circle cx="240" cy="222" r="9" fill="${C.cromo}" stroke="${K}" stroke-width="3.6"/><circle cx="240" cy="222" r="3" fill="${K}"/>`;
  o += L('M384 206 L378 150', 7) + L('M384 206 L378 150', 3, C.cromo);
  o += `<circle cx="377" cy="144" r="13" fill="${C.cian}" opacity=".7" filter="url(#brillo-rayo)"/><circle cx="377" cy="144" r="8" fill="${C.cian}" stroke="${K}" stroke-width="3.2"/><circle cx="375" cy="141" r="2.4" fill="#FFFFFF"/>`;
  return o;
}
export const cabeza = () => enCabeza(cara() + barba() + boca() + nariz() + cejas() + visor() + pelo() + antenas());

// ── El dron: cuerpo blanco, cuatro hélices girando y el lente cian que proyecta. Va chico ──
export const DRON = [514, 132];
const ESCALA_DRON = 0.66;
function dron() {
  const [x, y] = DRON;
  let o = '';
  // Brazos y hélices de atrás
  for (const [dx, dy] of [[-58, -20], [58, -20]]) {
    o += L(`M${x} ${y} L${x + dx} ${y + dy}`, 9) + L(`M${x} ${y} L${x + dx} ${y + dy}`, 4.4, C.cromoS);
    o += `<ellipse cx="${x + dx}" cy="${y + dy - 8}" rx="28" ry="6" fill="#C9D3DD" opacity=".55" stroke="${K}" stroke-width="2"/>` + `<rect x="${x + dx - 4}" y="${y + dy - 10}" width="8" height="10" fill="${C.fierro}" stroke="${K}" stroke-width="2"/>`;
  }
  // El cuerpo
  o += pieza(`M${x - 40} ${y - 14} Q${x - 40} ${y - 30} ${x - 22} ${y - 30} H${x + 22} Q${x + 40} ${y - 30} ${x + 40} ${y - 14} V${y + 10} Q${x + 40} ${y + 28} ${x + 20} ${y + 28} H${x - 20} Q${x - 40} ${y + 28} ${x - 40} ${y + 10} Z`, C.bata, [[pol([[x + 10, y - 34], [x + 44, y - 34], [x + 44, y + 32], [x + 14, y + 32]]), C.bataS], [pol([[x - 44, y - 34], [x + 44, y - 34], [x + 44, y - 24], [x - 44, y - 24]]), '#FFFFFF']], { w: 5, peso: 1.4 });
  o += pieza(pol([[x - 40, y - 4], [x + 40, y - 4], [x + 40, y + 4], [x - 40, y + 4]]), C.cian, [], { w: 2.4, peso: 0 });
  // Brazos y hélices de adelante
  for (const [dx, dy] of [[-50, 14], [50, 14]]) {
    o += L(`M${x + dx * 0.5} ${y + 8} L${x + dx} ${y + dy}`, 10) + L(`M${x + dx * 0.5} ${y + 8} L${x + dx} ${y + dy}`, 5, C.cromo);
    o += `<ellipse cx="${x + dx}" cy="${y + dy - 9}" rx="32" ry="7" fill="#DCE4EC" opacity=".6" stroke="${K}" stroke-width="2.4"/>` + `<rect x="${x + dx - 5}" y="${y + dy - 12}" width="10" height="12" fill="${C.fierro}" stroke="${K}" stroke-width="2.2"/>`;
  }
  // La antena chica y el lente
  o += L(`M${x + 24} ${y - 30} L${x + 34} ${y - 50}`, 4) + `<circle cx="${x + 34}" cy="${y - 52}" r="4.6" fill="${C.cian}" stroke="${K}" stroke-width="2.2"/>`;
  o += `<circle cx="${x}" cy="${y + 20}" r="20" fill="${C.cian}" opacity=".6" filter="url(#brillo-rayo)"/>`;
  o += `<circle cx="${x}" cy="${y + 20}" r="14" fill="${C.fierro}" stroke="${K}" stroke-width="4"/><circle cx="${x}" cy="${y + 20}" r="8.5" fill="${C.cian}" stroke="${K}" stroke-width="2.4"/><circle cx="${x - 3}" cy="${y + 17}" r="2.8" fill="#FFFFFF"/>`;
  return achicar(o, x, y, ESCALA_DRON);
}
// ── La proyección: el cono de luz, el disco y la casa en alambre de luz ──
function proyeccion() {
  const [x, y] = DRON, y0 = r1(y + 30 * ESCALA_DRON), yd = 262;
  let o = '';
  o += `<path d="M${x - 5} ${y0} L${x - 72} ${yd} L${x + 72} ${yd} L${x + 5} ${y0} Z" fill="${C.cian}" opacity=".16"/>`;
  o += `<path d="M${x - 5} ${y0} L${x - 72} ${yd} M${x + 5} ${y0} L${x + 72} ${yd}" stroke="${C.cianL}" stroke-width="1.6" opacity=".7"/>`;
  o += `<ellipse cx="${x}" cy="${yd}" rx="80" ry="16" fill="${C.cian}" opacity=".45" filter="url(#brillo-plano)"/>`;
  o += `<ellipse cx="${x}" cy="${yd}" rx="72" ry="13" fill="${C.cian}" fill-opacity=".25" stroke="${C.cian}" stroke-width="3"/>`;
  // La casa: un cubo con su techo y la puerta
  const b = 244, h = 44, w = 30, d = 14;
  const lin = (pts) => 'M' + pts.map((p) => p.join(' ')).join(' L');
  const frente = [[x - w, b], [x + w, b], [x + w, b - h], [x - w, b - h], [x - w, b]];
  const atras = frente.map(([px, py]) => [px + d, py - d * 0.7]);
  let casa = lin(frente) + ' ' + lin(atras);
  for (let i = 0; i < 4; i++) casa += ' ' + lin([frente[i], atras[i]]);
  casa += ' ' + lin([[x - w, b - h], [x, b - h - 30], [x + w, b - h]]) + ' ' + lin([[x - w + d, b - h - d * 0.7], [x + d, b - h - 30 - d * 0.7], [x + w + d, b - h - d * 0.7]]) + ' ' + lin([[x, b - h - 30], [x + d, b - h - 30 - d * 0.7]]);
  casa += ' ' + lin([[x - 8, b], [x - 8, b - 22], [x + 8, b - 22], [x + 8, b]]);
  o += `<path d="${casa}" fill="none" stroke="${C.cian}" stroke-width="7" opacity=".45" filter="url(#brillo-rayo)"/>`;
  o += L(casa, 2.6, '#FFFFFF');
  for (const [px, py, r] of [[436, 196, 3], [592, 210, 3.5], [446, 270, 2.5], [588, 150, 2.6]]) o += `<circle cx="${px}" cy="${py}" r="${r}" fill="${C.cianL}"/>`;
  return o;
}

export function architect({ prefijo = 'ar' } = {}) {
  reiniciar(prefijo);
  return `<g>${bataAtras()}${zapatilla(-1)}${zapatilla(1)}${piernas()}${polera()}${brazoControl()}${bataDelante()}${cuelloBata()}${brazoPlumon()}${solapas()}${cabeza()}${proyeccion()}${dron()}</g>`;
}

// Los brillos: el del visor, el del disco de la proyección y el del rayo (lente, foco y casa)
export const DEFS = `<defs><filter id="brillo-visor" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="9"/></filter>` +
  `<filter id="brillo-plano" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/></filter>` +
  `<filter id="brillo-rayo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs>`;
export const FUENTES = `<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Archivo+Black&display=block" rel="stylesheet">`;

export function vista() {
  return FUENTES + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1260" width="600" height="1260">${DEFS}<rect width="600" height="1260" fill="#000"/>${architect()}</svg>`;
}
