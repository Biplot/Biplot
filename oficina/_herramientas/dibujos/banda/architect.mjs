// The Architect en la línea nueva: altísimo y desgarbado, cuello largo, cabeza grande, visor cian, barba corta, el
// polerón carbón abierto sobre una polera blanca con su número (el 2 de su placa E2) o con la «A», jeans pitillo con
// cadena y basta doblada, y zapatillas de caña enormes. Marco 600 × 1260, suelo en y = 1240, mira a la derecha.
import { K, W, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, nuevoId, achicar, numeroChico } from './base.mjs';

export const C = {
  piel: '#E3B08A', pielS: '#BC8762', pelo: '#2B211B', peloS: '#1A1310', peloL: '#4D3B2F',
  barba: '#33261F', barbaS: '#221813', labio: '#B86C5E',
  pol: '#2C323B', polS: '#1A1F26', polL: '#434C59',
  polera: '#F3F1EA', poleraS: '#C9CBC9',
  cian: '#17C3B2', cianL: '#7FD8CF', cianS: '#0A8A7E',
  jean: '#3E5C83', jeanS: '#28405F', jeanL: '#7B9AC0',
  zap: '#191C22', zapS: '#0F1115', goma: '#ECEFF2', gomaS: '#B5BEC8', cadena: '#C3CDD8'
};
const FUENTE = "'Archivo Black', 'Arial Black', sans-serif";
const NUMERO = "'Alfa Slab One', 'Archivo Black', serif";   // el número de camiseta, de losa gruesa

// ── Zapatillas de caña: enormes, con puntera de goma, cordones y el parche redondo cian ──
function zapatilla(lado) {
  // lado -1: la de la izquierda del cuadro (punta hacia la izquierda); +1: la de la derecha (punta hacia la derecha)
  const x0 = lado < 0 ? 252 : 348, s = -lado, X = (x) => x0 + s * x;
  let o = '';
  // Suela gruesa
  o += pieza(pol([[X(-108), 1204], [X(36), 1204], [X(42), 1240], [X(-112), 1240]]), C.goma, [[pol([[X(-120), 1226], [X(50), 1224], [X(50), 1246], [X(-120), 1246]]), C.gomaS]], { w: 5.5 });
  o += L(`M${X(-104)} 1220 L${X(36)} 1219`, 2.6);
  // Caña y empeine de lona
  const lona = curva([[X(-26), 1112], [X(30), 1110], [X(36), 1160], [X(36), 1206], [X(-60), 1208], [X(-110), 1204], [X(-100), 1180], [X(-62), 1166], [X(-34), 1146]], true);
  o += pieza(lona, C.zap, [[pol([[X(8), 1104], [X(44), 1104], [X(44), 1212], [X(14), 1212]]), C.zapS]]);
  // Puntera de goma
  o += pieza(curva([[X(-110), 1204], [X(-104), 1184], [X(-80), 1174], [X(-58), 1184], [X(-56), 1206]], true), C.goma, [[pol([[X(-74), 1196], [X(-52), 1196], [X(-52), 1210], [X(-74), 1210]]), C.gomaS]], { w: 4.4, peso: 1.4 });
  // Cordones blancos cruzados sobre el empeine
  for (let i = 0; i < 4; i++) {
    const y = 1178 - i * 15, x = -52 + i * 8;
    o += L(`M${X(x - 13)} ${y + 5} L${X(x + 13)} ${y - 5}`, 4.4, C.goma);
  }
  // Parche redondo de la caña, en cian
  o += `<circle cx="${X(14)}" cy="1148" r="11" fill="${C.cian}" stroke="${K}" stroke-width="3"/>`;
  return o;
}

// ── Piernas: jeans pitillo con la basta doblada y la cadena ──
function piernas() {
  let o = '';
  const izq = miembro([[262, 696], [268, 930], [252, 1112]], [76, 50, 46], { punta: 'plana' });
  const der = miembro([[338, 696], [332, 930], [348, 1112]], [76, 50, 46], { punta: 'plana' });
  o += pieza(izq, C.jean, [[pol([[268, 680], [316, 680], [300, 1124], [258, 1124], [282, 920]]), C.jeanS]]);
  o += pieza(der, C.jean, [[pol([[350, 680], [400, 680], [392, 1124], [360, 1124], [346, 920]]), C.jeanS]]);
  // Cadera, bajo el polerón
  o += pieza(pol([[224, 690], [376, 690], [380, 750], [300, 770], [220, 750]]), C.jean, [[pol([[330, 686], [390, 686], [390, 770], [330, 770]]), C.jeanS]], { peso: 0 });
  // Arrugas de rodilla y entrepierna
  o += pincel([250, 900], [262, 910], [274, 908], [284, 896], 3.2) + pincel([254, 950], [264, 958], [276, 956], [284, 946], 2.6) + pincel([246, 820], [256, 834], [262, 850], [264, 866], 2.4) + pincel([258, 1010], [262, 1030], [258, 1050], [252, 1066], 2.4);
  o += pincel([318, 896], [330, 908], [342, 906], [352, 894], 3.2) + pincel([318, 948], [330, 958], [342, 954], [348, 944], 2.6) + pincel([352, 822], [346, 838], [342, 854], [340, 870], 2.4) + pincel([342, 1012], [340, 1032], [344, 1052], [350, 1066], 2.4);
  o += pincel([300, 760], [296, 790], [290, 812], [284, 830], 3);
  // Bastas dobladas, más anchas y claras
  for (const x of [254, 346]) {
    o += pieza(pol([[x - 34, 1086], [x + 32, 1084], [x + 36, 1124], [x - 36, 1126]]), C.jeanL, [[pol([[x + 6, 1080], [x + 40, 1080], [x + 40, 1130], [x + 10, 1130]]), C.jean]], { w: 5, peso: 1.6 });
    o += L(`M${x - 34} 1098 L${x + 33} 1096`, 2.4);
  }
  // La cadena de la billetera, del pasador al bolsillo de atrás
  const cad = 'M372 712 C394 750 402 796 386 816 C376 822 372 794 384 752';
  o += `<path d="${cad}" fill="none" stroke="${K}" stroke-width="7.5" stroke-linecap="round"/><path d="${cad}" fill="none" stroke="${C.cadena}" stroke-width="4" stroke-dasharray="6 3" stroke-linecap="round"/>`;
  return o;
}

// La mitad derecha del polerón y su sombra: el bolsillo las vuelve a pintar encima de la mano
const MITAD_DER = curva([[338, 372], [366, 378], [386, 394], [396, 424], [394, 470], [390, 560], [388, 704], [338, 712], [346, 560], [342, 430]], true);
const MITAD_DER_S = pol([[356, 380], [404, 380], [404, 716], [360, 716]]);

// ── Torso: la capucha, la polera blanca con su número o la «A», el polerón abierto y los cordones ──
function torso(polera) {
  let o = '';
  o += pieza(curva([[230, 396], [236, 350], [270, 330], [330, 330], [364, 350], [370, 396], [340, 374], [300, 368], [260, 374]], true), C.pol, [[pol([[300, 320], [380, 320], [380, 400], [300, 400]]), C.polS]]);
  // Polera
  o += pieza(pol([[246, 378], [354, 378], [360, 724], [240, 726]]), C.polera, [[pol([[322, 370], [366, 370], [366, 730], [330, 730]]), C.poleraS]]);
  o += L('M264 380 Q300 400 336 380', 4) + L('M268 386 Q300 404 332 386', 2.2);
  const grafico = polera === 'numero' ? '2' : 'A';
  const estampado = `<text x="${polera === 'numero' ? 301 : 300}" y="${polera === 'numero' ? 584 : 590}" text-anchor="middle" font-family="${polera === 'numero' ? NUMERO : FUENTE}" font-size="${polera === 'numero' ? 122 : 160}" fill="${C.cian}" stroke="${C.cianS}" stroke-width="4" paint-order="stroke" transform="rotate(-4 300 520)">${grafico}</text>`;
  // El número va chico y discreto (ronda 4 del elenco)
  o += polera === 'numero' ? numeroChico(estampado, 301, 540) : estampado;
  // Polerón abierto: dos mitades de hombros caídos
  const mitadIzq = curva([[262, 372], [234, 378], [214, 394], [204, 424], [206, 470], [210, 560], [212, 704], [262, 712], [254, 560], [258, 430]], true);
  o += pieza(mitadIzq, C.pol, [[pol([[240, 380], [270, 380], [270, 716], [244, 716], [246, 500]]), C.polS], [pol([[196, 380], [222, 380], [218, 716], [196, 716]]), C.polL]]);
  o += pieza(MITAD_DER, C.pol, [[MITAD_DER_S, C.polS]]);
  o += L('M214 690 L258 697', 3) + L('M342 697 L386 690', 3);
  o += L('M254 432 L250 560 L257 704', 2.6, C.cianS) + L('M346 432 L350 560 L343 704', 2.6, C.cianS);
  if (polera === 'numero') o += `<text x="234" y="462" text-anchor="middle" font-family="${FUENTE}" font-size="32" fill="${C.cian}" stroke="${K}" stroke-width="2" paint-order="stroke">A</text>`;
  o += pincel([222, 474], [232, 494], [236, 524], [234, 552], 2.8) + pincel([372, 466], [368, 496], [370, 526], [376, 552], 2.8);
  // Cordones cian de la capucha, con sus puntas de metal
  for (const [x0, x1, y1] of [[278, 270, 472], [322, 330, 462]]) {
    const d = `M${x0} 384 C${x0 - 2} 420 ${x1 + 2} 440 ${x1} ${y1}`;
    o += `<path d="${d}" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.cian}" stroke-width="4.5" stroke-linecap="round"/>`;
    o += pieza(pol([[x1 - 5, y1 - 2], [x1 + 5, y1 - 2], [x1 + 5, y1 + 16], [x1 - 5, y1 + 16]]), C.cadena, [], { w: 3, peso: 0 });
  }
  return o;
}

// ── Brazos: las mangas van detrás del polerón; el puño, la mano y el antebrazo del bolsillo, delante ──
function brazosAtras() {
  let o = '';
  const mangaI = miembro([[226, 396], [198, 548], [192, 668]], [58, 46, 42], { punta: 'plana' });
  o += pieza(mangaI, C.pol, [[pol([[200, 380], [256, 380], [212, 690], [186, 690]]), C.polS]]);
  o += pincel([196, 520], [204, 540], [212, 556], [218, 562], 2.6);
  // Brazo de la derecha: sólo hasta el codo (el antebrazo va delante)
  const brazoD = miembro([[374, 396], [416, 548]], [58, 48], { punta: 'redonda' });
  o += pieza(brazoD, C.pol, [[pol([[396, 380], [460, 380], [440, 600], [404, 570]]), C.polS]]);
  return o;
}
function brazosDelante() {
  let o = '';
  o += pieza(pol([[170, 650], [212, 652], [212, 682], [170, 680]]), C.cian, [[pol([[196, 646], [216, 646], [216, 686], [198, 686]]), C.cianS]], { w: 4.6, peso: 1.4 });
  // Mano huesuda en puño, con el plumón cian apuntando abajo
  o += pieza(curva([[174, 680], [210, 682], [222, 696], [224, 712], [220, 730], [206, 738], [188, 736], [174, 724], [170, 700]], true), C.piel, [[pol([[200, 676], [230, 676], [230, 742], [206, 742]]), C.pielS]], { w: 5, peso: 1.6 });
  for (const y of [698, 711, 724]) o += L(`M${182} ${y} Q${200} ${y - 4} ${220} ${y + 1}`, 2.4);
  o += L('M176 690 Q186 686 196 690', 2.2) + P(pol([[208, 684], [222, 690], [216, 698], [206, 692]]), C.pielS);
  o += pieza(pol([[188, 730], [206, 730], [212, 820], [194, 822]]), C.cian, [[pol([[200, 726], [214, 726], [216, 824], [204, 824]]), C.cianS]], { w: 4.6, peso: 1.4 });
  o += negro(pol([[194, 822], [212, 820], [204, 842]]));
  // Antebrazo de la derecha, del codo al puño (la punta redonda queda en el codo)
  const ante = miembro([[377, 646], [416, 548]], [44, 50], { punta: 'redonda' });
  o += pieza(ante, C.pol, [[pol([[400, 540], [450, 540], [410, 660], [384, 660]]), C.polS]]);
  o += pincel([404, 584], [408, 596], [408, 610], [404, 622], 2.4);
  // La mano se hunde en el bolsillo del polerón: bajo el puño sólo asoma el dorso
  o += pieza(pol([[356, 647], [391, 661], [378, 695], [346, 683]]), C.piel, [[pol([[380, 640], [400, 640], [392, 700], [370, 700]]), C.pielS]], { w: 4.4, peso: 1.2 });
  o += pieza(pol([[361, 623], [404, 640], [394, 666], [351, 649]]), C.cian, [[pol([[386, 616], [412, 616], [402, 672], [378, 672]]), C.cianS]], { w: 4.4, peso: 1.4 });
  // El bolsillo: bajo su boca, la tela del polerón (con su sombra, el ribete y el cierre) se vuelve a pintar y tapa la mano
  const bajo = pol([[338, 611], [400, 705], [400, 760], [320, 760], [320, 611]]);
  const idP = nuevoId(), idB = nuevoId();
  o += `<clipPath id="${idP}"><path d="${MITAD_DER}"/></clipPath><clipPath id="${idB}"><path d="${bajo}"/></clipPath>`;
  o += `<g clip-path="url(#${idB})"><g clip-path="url(#${idP})">${P(MITAD_DER, C.pol)}${P(MITAD_DER_S, C.polS)}${L('M342 697 L386 690', 3)}${L('M346 432 L350 560 L343 704', 2.6, C.cianS)}</g>${B(MITAD_DER)}</g>`;
  o += L('M348 626 L390 690', 4.4) + B('M356 638 L384 680', 7.5);
  return o;
}

// ── Cabeza: cuello largo, cara angulosa, visor, barba, nariz larga y el pelo en púas ──
function cabeza() {
  let o = '';
  o += pieza(pol([[284, 316], [320, 316], [322, 382], [282, 384]]), C.piel, [[pol([[280, 310], [326, 310], [326, 346], [280, 352]]), C.pielS], [pol([[306, 340], [330, 340], [330, 390], [310, 390]]), C.pielS]]);
  o += L('M296 354 L300 368', 2.4);
  // Oreja
  o += pieza(curva([[254, 226], [234, 218], [224, 246], [230, 274], [252, 284]], true), C.piel, [[pol([[224, 252], [246, 252], [246, 288], [224, 288]]), C.pielS]], { w: 5, peso: 1.6 });
  o += L('M242 236 Q232 250 238 268', 2.6);
  // Cara
  const cara = curva([[248, 196], [264, 150], [302, 130], [346, 138], [374, 170], [382, 214], [386, 252], [378, 286], [360, 316], [330, 336], [296, 334], [268, 318], [252, 290], [244, 248]], true);
  o += pieza(cara, C.piel, [[pol([[352, 200], [400, 200], [400, 330], [346, 330], [358, 268]]), C.pielS], [pol([[250, 238], [392, 238], [392, 254], [250, 252]]), C.pielS]]);
  // Barba corta y angulosa
  const barba = pol([[248, 236], [256, 262], [278, 282], [302, 280], [324, 270], [348, 276], [382, 266], [376, 292], [358, 320], [330, 342], [296, 340], [266, 324], [250, 298], [244, 266]]);
  o += pieza(barba, C.barba, [[pol([[338, 250], [400, 250], [400, 350], [326, 350]]), C.barbaS]], { w: 5 });
  o += P(pol([[334, 288], [374, 282], [370, 292], [336, 296]]), C.barbaS);
  // Boca chica, de lado
  o += pieza(curva([[338, 299], [354, 297], [368, 293], [364, 304], [342, 306]], true), C.labio, [], { w: 3.2, peso: 0 });
  // Nariz que asoma bajo el visor; desde la ronda 3 del elenco va más chica, achicada desde el puente
  let nariz = pieza(pol([[358, 234], [406, 268], [396, 280], [366, 282]]), C.piel, [[pol([[380, 262], [410, 262], [410, 290], [372, 290]]), C.pielS]], { w: 5, peso: 1.6 });
  nariz += negro(pol([[370, 281], [394, 280], [390, 287], [368, 288]]));
  nariz += L('M350 258 Q366 264 382 260', 2.4);
  o += achicar(nariz, 362, 238, 0.74) + L('M358 276 Q346 290 344 302', 2.2);
  for (const [x, y] of [[266, 300], [282, 314], [300, 324], [318, 322], [276, 286], [262, 278], [344, 318], [330, 330]]) o += L(`M${x} ${y} l6 -9`, 2, '#160F0B');
  // Cejas duras
  o += negro(pol([[258, 192], [302, 180], [306, 192], [264, 200]]));
  o += negro(pol([[322, 184], [366, 182], [370, 194], [324, 194]]));
  // Visor envolvente con su brillo
  const visor = curva([[238, 206], [300, 196], [392, 204], [396, 222], [394, 240], [300, 236], [238, 242], [234, 224]], true);
  o += `<path d="${visor}" fill="${C.cian}" opacity=".55" filter="url(#brillo-visor)"/>`;
  o += pieza(visor, C.cian, [
    [pol([[230, 228], [400, 226], [400, 250], [230, 250]]), C.cianS],
    [pol([[230, 196], [400, 196], [400, 210], [230, 212]]), C.cianL],
    [pol([[300, 196], [318, 196], [296, 246], [278, 246]]), '#FFFFFF'],
    [pol([[326, 196], [334, 196], [312, 246], [304, 246]]), '#E8FFFC']
  ], { w: 6.5 });
  // Pelo en púas, con la patilla que baja a la barba
  const pelo = pol([[240, 214], [226, 182], [204, 160], [232, 158], [214, 118], [250, 132], [250, 84], [282, 118], [298, 58], [318, 112], [350, 72], [350, 120], [388, 104], [374, 142], [402, 150], [380, 170], [366, 160], [346, 152], [322, 156], [300, 148], [276, 158], [258, 172], [250, 196], [250, 232], [242, 232]]);
  o += pieza(pelo, C.pelo, [
    [pol([[230, 150], [270, 130], [262, 176], [246, 210]]), C.peloS],
    [pol([[284, 116], [298, 64], [304, 112]]), C.peloL],
    [pol([[318, 112], [348, 78], [334, 120]]), C.peloL],
    [pol([[352, 120], [384, 108], [372, 140]]), C.peloL],
    [pol([[256, 168], [300, 150], [346, 154], [380, 170], [380, 182], [256, 182]]), C.peloS]
  ]);
  o += pincel([270, 150], [278, 132], [284, 120], [290, 104], 2.6) + pincel([316, 140], [324, 126], [332, 112], [340, 96], 2.6);
  // Cabeza grande: se agranda desde la base del cuello
  return `<g transform="translate(300 384) rotate(-3) scale(1.1) translate(-300 -384)">${o}</g>`;
}

export function architect({ polera = 'numero', prefijo = 'ar' } = {}) {
  reiniciar(prefijo);
  return `<g>${zapatilla(-1)}${zapatilla(1)}${piernas()}${brazosAtras()}${torso(polera)}${brazosDelante()}${cabeza()}</g>`;
}

export const DEFS = `<defs><filter id="brillo-visor" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="9"/></filter></defs>`;
export const FUENTES = `<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Archivo+Black&display=block" rel="stylesheet">`;

export function vista() {
  return FUENTES + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1260" width="600" height="1260">${DEFS}<rect width="600" height="1260" fill="#000"/>${architect()}</svg>`;
}
