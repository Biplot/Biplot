// Pepa en la línea de la banda: la más baja y la más rápida de la oficina, de pie y a punto de partir, saludando
// con la mano en alto. Morena, de rasgos andinos, pelo negro con dos moños redondos como orejas de degú y una trenza
// que vuela hacia atrás; delantal crema con su número (el 9 de su placa E9) en el peto y un brote en el bolsillo,
// polerón gris arremangado, botas de agua azules (la de atrás empuja en punta) y el canasto de pepas en la cadera.
// Marco 600 × 1260, las botas tocan el suelo en y = 1240, mira a la derecha.
import { K, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, nuevoId, r1, numeroChico } from './base.mjs';
import { NUMERO, lamina } from './tinta.mjs';

export const C = {
  piel: '#C68A5E', pielS: '#A06842', pielL: '#D9A57B', mejilla: '#C4675F',
  boca: '#4A1C17', lengua: '#B9584E', diente: '#F6F3EC', labio: '#9C5240',
  pelo: '#2A2421', peloS: '#141110', peloL: '#5C524B',
  poleron: '#8E99A8', poleronS: '#6F7A89', poleronL: '#AAB4C1', ribete: '#7A8595',
  delantal: '#E8DFC8', delantalS: '#CFC2A3', delantalL: '#F6F1E4', costura: '#B3A584',
  pantalon: '#22395A', pantalonS: '#152640', pantalonL: '#3A5A82', pantalonSS: '#0E1B2E',
  bota: '#2F66A8', botaS: '#1E477A', botaL: '#7AA8DB', suela: '#13284A',
  canasto: '#8B6A4E', canastoS: '#5E4633', canastoL: '#AE8A64',
  cian: '#17C3B2', cianS: '#0A8A7E', cianL: '#7FD8CF', niebla: '#F2F4F7', nieblaS: '#C3CBD5',
  tallo: '#0A8A7E'
};
const GRAD = Math.PI / 180, SUELO = 1240;
const raya = (d, color, w = 1.6, dash = '5 4') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
const ruedo = (cx, cy, rx, ry) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

// La cabeza se dibuja en su propio sistema: el origen está en la raíz de la nariz, entre los ojos. Los moños llegan
// a y ≈ 330: es la más baja del elenco
const CAB = { x: 330, y: 471, k: 0.94, giro: 0 };
const enCab = ([x, y]) => [CAB.x + CAB.k * x, CAB.y + CAB.k * y];

// ── La trenza: sale de la nuca y vuela hacia atrás con la carrera; termina en un elástico cian y un mechón ──
function trenza() {
  let o = '';
  const [nx, ny] = enCab([-94, 50]);
  const eje = [[nx + 6, ny], [nx - 34, ny + 14], [nx - 72, ny + 34], [nx - 106, ny + 62], [nx - 128, ny + 94]];
  o += pieza(miembro(eje, [36, 32, 28, 25, 21], { punta: 'redonda' }), C.pelo, [[pol([[nx + 30, ny + 20], [nx - 10, ny + 44], [nx - 70, ny + 80], [nx - 112, ny + 118], [nx - 146, ny + 124], [nx - 122, ny + 86], [nx - 60, ny + 44]]), C.peloS]]);
  // Los gajos de la trenza: cada uno cruza en diagonal
  const N = 8;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N, seg = Math.min(3, Math.floor(t * 4)), f = t * 4 - seg, a = eje[seg], b = eje[seg + 1];
    const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, k = 1 - t * 0.4;
    o += pincel([x - 12 * k, y - 8 * k], [x - 5 * k, y + 3 * k], [x + 4 * k, y + 8 * k], [x + 13 * k, y + 6 * k], 2.6);
    o += P(`M${r1(x - 9 * k)} ${r1(y - 10 * k)} Q${r1(x + 1 * k)} ${r1(y - 9 * k)} ${r1(x + 8 * k)} ${r1(y - 1 * k)} Q${r1(x - 2 * k)} ${r1(y - 4 * k)} ${r1(x - 9 * k)} ${r1(y - 10 * k)} Z`, C.peloL);
  }
  // El elástico cian y el mechón de la punta
  const [ex, ey] = eje[4];
  o += pieza(pol([[ex - 13, ey - 4], [ex + 9, ey + 4], [ex + 4, ey + 17], [ex - 17, ey + 9]]), C.cian, [[pol([[ex - 2, ey - 8], [ex + 14, ey - 8], [ex + 10, ey + 22], [ex - 4, ey + 22]]), C.cianS]], { w: 3.6, peso: 0.8 });
  o += pieza(curva([[ex - 16, ey + 9], [ex + 4, ey + 16], [ex + 2, ey + 30], [ex - 6, ey + 46], [ex - 12, ey + 34], [ex - 22, ey + 44], [ex - 24, ey + 26]], true), C.pelo, [[pol([[ex - 6, ey + 12], [ex + 10, ey + 12], [ex + 4, ey + 50], [ex - 8, ey + 50]]), C.peloS]], { w: 4, peso: 1 });
  return o;
}

// ── Las botas de agua: caña a media pierna, punta redonda y suela gruesa. Se dibujan con la suela en y = 0 y la punta
// en x = 124; la de atrás gira sobre esa punta (el talón se levanta y la punta sigue en el suelo) ──
const PUNTA = 124;
export function bota(x, giro = 0) {
  let o = '';
  const cuerpo = curva([[14, -119], [42, -123], [70, -119], [69, -79], [70, -47], [88, -41], [110, -35], [124, -23], [124, -9], [60, -7], [2, -7], [0, -35], [8, -79]], true);
  o += pieza(cuerpo, C.bota, [[pol([[52, -131], [82, -131], [80, -43], [130, -43], [134, 1], [50, 1]]), C.botaS]]);
  // Brillo de goma en la caña y en la punta
  o += P(curva([[18, -105], [26, -105], [24, -51], [18, -45], [14, -63]], true), C.botaL);
  o += P(curva([[86, -33], [104, -31], [116, -23], [98, -24]], true), C.botaL);
  // Borde de arriba, un poco abierto, y la suela gruesa
  o += pieza(curva([[8, -125], [42, -132], [76, -125], [74, -109], [42, -114], [10, -109]], true), C.bota, [[pol([[54, -137], [84, -137], [84, -103], [56, -103]]), C.botaS]], { w: 4.6, peso: 1.2 });
  o += pieza(pol([[-4, -15], [128, -15], [128, 0], [-6, 0]]), C.suela, [], { w: 4.6, peso: 1 });
  o += L('M4 -7 L120 -7', 1.8, '#2C4670');
  return `<g transform="translate(${x} ${SUELO}) rotate(${giro} ${PUNTA} 0)">${o}</g>`;
}
// Dónde queda un punto de la bota (en su sistema) una vez puesta en el cuadro
const enBota = (x, giro, [u, v]) => {
  const a = giro * GRAD, du = u - PUNTA;
  return [x + PUNTA + du * Math.cos(a) - v * Math.sin(a), SUELO + du * Math.sin(a) + v * Math.cos(a)];
};
// La bota de adelante pisa plana; la de atrás empuja con la punta
const BOTA_D = { x: 356, giro: 0 }, BOTA_A = { x: 268 - PUNTA, giro: 22 };

// ── Las piernas: cortas y firmes, en zancada; pantalón azul marino que entra en las botas ──
function piernas() {
  let o = '';
  // La pierna de atrás (su izquierda), en sombra: empuja con la punta, el talón arriba
  const [ax, ay] = enBota(BOTA_A.x, BOTA_A.giro, [42, -118]);
  o += pieza(miembro([[318, 858], [286, 938], [258, 1012]], [72, 64, 58], { punta: 'redonda' }), C.pantalonS, [[pol([[300, 840], [360, 840], [294, 1030], [270, 1030]]), C.pantalonSS]]);
  o += pieza(miembro([[258, 1004], [(258 + ax) / 2, (1004 + ay) / 2], [ax, ay]], [58, 52, 50], { punta: 'plana' }), C.pantalonS, [[pol([[264, 990], [294, 990], [ax + 30, ay + 6], [ax + 10, ay + 6]]), C.pantalonSS]]);
  o += pincel([240, 1028], [250, 1038], [264, 1040], [276, 1032], 2.4) + pincel([246, 1060], [252, 1068], [262, 1070], [270, 1064], 2);
  o += bota(BOTA_A.x, BOTA_A.giro);
  // La pierna de adelante (su derecha): la rodilla doblada y adelante, pisa firme con toda la bota
  const [dx, dy] = enBota(BOTA_D.x, BOTA_D.giro, [42, -118]);
  o += pieza(miembro([[290, 858], [342, 928], [392, 994]], [76, 68, 60], { punta: 'redonda' }), C.pantalon, [[pol([[340, 850], [420, 910], [420, 1024], [370, 1024], [350, 940]]), C.pantalonS]]);
  o += pieza(miembro([[392, 988], [(392 + dx) / 2 + 2, (988 + dy) / 2], [dx, dy]], [58, 54, 50], { punta: 'plana' }), C.pantalon, [[pol([[404, 978], [436, 978], [dx + 30, dy + 6], [dx + 10, dy + 6]]), C.pantalonS]]);
  // La rodilla: luz arriba a la izquierda y los pliegues sobre la caña
  o += P(curva([[372, 984], [392, 976], [408, 984], [394, 994], [376, 994]], true), C.pantalonL);
  o += P(curva([[300, 900], [318, 892], [338, 912], [352, 936], [334, 930]], true), C.pantalonL);
  o += pincel([378, 1016], [388, 1024], [402, 1026], [414, 1018], 2.6) + pincel([380, 1056], [388, 1064], [400, 1066], [410, 1060], 2.2);
  o += bota(BOTA_D.x, BOTA_D.giro);
  return o;
}

// ── Torso: polerón gris inclinado hacia adelante, el delantal crema con el 9 en el peto y la falda en movimiento ──
function torso() {
  let o = '';
  const t = curva([[292, 600], [262, 606], [242, 624], [234, 660], [230, 710], [230, 760], [234, 800], [238, 840], [296, 856], [352, 842], [358, 800], [364, 752], [372, 704], [378, 664], [374, 628], [360, 610], [330, 600]], true);
  o += pieza(t, C.poleron, [[pol([[352, 590], [400, 590], [400, 860], [330, 860], [346, 760], [358, 680]]), C.poleronS], [pol([[222, 620], [252, 620], [244, 850], [220, 850]]), C.poleronL]]);
  o += pincel([244, 690], [250, 720], [252, 750], [248, 780], 2.4);
  // Cuello redondo con ribete
  o += pieza(curva([[298, 602], [326, 596], [354, 602], [352, 612], [326, 606], [300, 612]], true), C.ribete, [], { w: 3.6, peso: 0 });
  // La falda del delantal: se abre con la zancada y el ruedo se va hacia atrás
  const falda = curva([[234, 800], [300, 806], [358, 798], [376, 836], [388, 880], [394, 920], [388, 946], [340, 952], [290, 954], [238, 948], [210, 936], [214, 890], [224, 846]], true);
  o += pieza(falda, C.delantal, [[pol([[360, 790], [420, 790], [420, 970], [352, 970], [374, 880]]), C.delantalS], [pol([[196, 922], [410, 924], [410, 970], [196, 970]]), C.delantalS]]);
  o += pincel([298, 872], [302, 900], [304, 924], [300, 948], 2.6) + pincel([250, 884], [244, 906], [236, 924], [226, 940], 2.2) + pincel([350, 884], [358, 904], [366, 922], [376, 938], 2.2);
  // Los tirantes al cuello y el peto, inclinado con ella
  for (const [x0, x1] of [[290, 304], [352, 366]]) o += pieza(pol([[x0, 620], [x1, 620], [x1 - 4, 596], [x0 - 4, 598]]), C.delantal, [[pol([[x1 - 6, 590], [x1 + 4, 590], [x1 + 4, 624], [x1 - 4, 624]]), C.delantalS]], { w: 3.6, peso: 0.8 });
  const peto = curva([[288, 614], [328, 612], [370, 618], [366, 660], [358, 720], [350, 792], [310, 798], [270, 796], [274, 730], [282, 668]], true);
  o += pieza(peto, C.delantal, [[pol([[352, 606], [392, 606], [372, 806], [334, 806], [352, 700]]), C.delantalS], [pol([[262, 610], [292, 610], [280, 806], [262, 806]]), C.delantalL]], { w: 5 });
  o += raya('M292 622 L362 626 L352 720 L344 786 L278 788 L284 722 Z', C.costura, 1.6);
  // El 9 de su placa E9, en el peto, con la inclinación del cuerpo
  o += numeroChico(`<text x="318" y="746" text-anchor="middle" font-family="${NUMERO}" font-size="108" fill="${C.bota}" stroke="${K}" stroke-width="5" paint-order="stroke" transform="rotate(6 318 704) translate(318 704) scale(0.9 1) translate(-318 -704)">9</text>`, 318, 707);
  // La pretina
  o += pieza(curva([[232, 790], [296, 796], [362, 788], [364, 802], [296, 810], [232, 804]], true), C.delantal, [[pol([[322, 782], [370, 782], [370, 814], [322, 814]]), C.delantalS]], { w: 4.4, peso: 1 });
  // El bolsillo, con pepas y el brote
  o += pieza(pol([[304, 866], [350, 862], [354, 902], [308, 906]]), C.delantal, [[pol([[334, 856], [362, 856], [362, 910], [338, 910]]), C.delantalS]], { w: 4, peso: 1 });
  o += raya('M309 872 L346 869 L349 896 L312 899 Z', C.costura, 1.4, '4 3');
  o += brote(328, 868);
  return o;
}
// Un brote: tallo y dos hojitas, asomado del bolsillo (con dos pepas)
export function brote(x, y) {
  let o = '';
  o += pepita(x - 14, y - 3, 7, -30, C.niebla) + pepita(x + 13, y - 2, 6.5, 25, C.cianL);
  const tallo = `M${x} ${y + 2} C${x - 2} ${y - 14} ${x - 6} ${y - 24} ${x - 4} ${y - 36}`;
  o += `<path d="${tallo}" fill="none" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="${tallo}" fill="none" stroke="${C.tallo}" stroke-width="3.6" stroke-linecap="round"/>`;
  o += pieza(curva([[x - 4, y - 34], [x - 18, y - 46], [x - 34, y - 46], [x - 26, y - 34], [x - 12, y - 30]], true), C.cian, [[pol([[x - 30, y - 38], [x - 2, y - 38], [x - 2, y - 26], [x - 30, y - 26]]), C.cianS]], { w: 3.6, peso: 1 });
  o += pieza(curva([[x - 4, y - 36], [x + 6, y - 52], [x + 22, y - 56], [x + 18, y - 42], [x + 4, y - 34]], true), C.cianL, [[pol([[x + 2, y - 44], [x + 26, y - 44], [x + 26, y - 30], [x + 2, y - 30]]), C.cian]], { w: 3.6, peso: 1 });
  o += L(`M${x - 6} ${y - 36} Q${x - 16} ${y - 40} ${x - 26} ${y - 42}`, 1.6, C.cianS) + L(`M${x - 3} ${y - 37} Q${x + 6} ${y - 46} ${x + 16} ${y - 50}`, 1.6, C.cianS);
  return o;
}
// Una pepa de zapallo: plana, en punta, con su reborde y un brillo
function pepita(x, y, r, giro, color) {
  const sombra = color === C.niebla ? C.nieblaS : color === C.cianL ? C.cian : C.cianS;
  const d = `M0 ${r1(-r * 1.3)} Q${r1(r * 0.9)} ${r1(-r * 0.6)} ${r1(r * 0.72)} ${r1(r * 0.55)} Q${r1(r * 0.45)} ${r1(r * 1.1)} 0 ${r1(r * 1.1)} Q${r1(-r * 0.45)} ${r1(r * 1.1)} ${r1(-r * 0.72)} ${r1(r * 0.55)} Q${r1(-r * 0.9)} ${r1(-r * 0.6)} 0 ${r1(-r * 1.3)} Z`;
  const borde = `M0 ${r1(-r * 0.8)} Q${r1(r * 0.5)} ${r1(-r * 0.3)} ${r1(r * 0.4)} ${r1(r * 0.45)} Q0 ${r1(r * 0.8)} ${r1(-r * 0.4)} ${r1(r * 0.45)} Q${r1(-r * 0.5)} ${r1(-r * 0.3)} 0 ${r1(-r * 0.8)} Z`;
  return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${giro})">` + pieza(d, color, [[pol([[r * 0.15, -2 * r], [2 * r, -2 * r], [2 * r, 2 * r], [-2 * r, 2 * r], [-2 * r, r * 0.7]]), sombra]], { w: 2.4, peso: 0.5 }) +
    `<path d="${borde}" fill="none" stroke="${sombra}" stroke-width="1.3"/>` +
    `<path d="M${r1(-r * 0.3)} ${r1(r * 0.05)} Q${r1(-r * 0.32)} ${r1(-r * 0.5)} ${r1(-r * 0.02)} ${r1(-r * 0.9)}" fill="none" stroke="#fff" stroke-width="${r1(Math.max(1.4, r * 0.22))}" stroke-linecap="round"/></g>`;
}

// ── El canasto de pepas, en la cadera ──
function canasto(cx, top) {
  let o = '';
  const rx = 58, ry = 13;
  o += pieza(ruedo(cx, top, rx, ry), C.canastoS, [], { w: 4, peso: 0 });
  // El montón de pepas
  const pepas = [[-44, -4, 7, -60, C.niebla], [-31, -9, 8, 25, C.cian], [-16, -15, 8, -20, C.niebla], [-1, -18, 8, 40, C.cianL], [14, -16, 8, -35, C.niebla], [28, -11, 8, 15, C.cian], [42, -5, 7, -50, C.niebla],
    [-37, 0, 7, 80, C.cianL], [-22, -4, 8, -70, C.niebla], [-7, -5, 8, 10, C.cian], [7, -7, 8, -15, C.niebla], [22, -3, 8, 55, C.cianL], [36, 0, 7, -30, C.niebla],
    [-9, -26, 7, -40, C.cian], [5, -30, 7, 20, C.niebla], [-23, -22, 7, 65, C.niebla], [20, -24, 7, -70, C.cianL]];
  for (const [x, y, r, g, c] of pepas) o += pepita(cx + x, top + y, r, g, c);
  // La pared de adelante, tejida
  const pared = `M${cx - rx} ${top} A${rx} ${ry} 0 0 0 ${cx + rx} ${top} L${cx + rx - 9} ${top + 34} Q${cx} ${top + 47} ${cx - rx + 9} ${top + 34} Z`;
  o += pieza(pared, C.canasto, [[pol([[cx + 20, top - 10], [cx + rx + 10, top - 10], [cx + rx + 10, top + 60], [cx + 26, top + 60]]), C.canastoS], [pol([[cx - rx - 10, top + 26], [cx + rx + 10, top + 26], [cx + rx + 10, top + 60], [cx - rx - 10, top + 60]]), C.canastoS]]);
  // El tejido: varillas verticales y hileras de mimbre que pasan alternadas por encima y por debajo
  for (let i = -3; i <= 3; i++) {
    const x = cx + i * 14;
    o += L(`M${x} ${r1(top + ry * Math.sqrt(1 - (i * 14 / rx) ** 2) + 2)} L${r1(x - i * 1.2)} ${r1(top + 38 - Math.abs(i) * 1.4)}`, 2.4, C.canastoS);
  }
  const idT = nuevoId();
  o += `<clipPath id="${idT}"><path d="${pared}"/></clipPath><g clip-path="url(#${idT})">`;
  for (let i = 0; i < 3; i++) {
    const y = top + 9 + i * 10, a = rx + 4 - i * 4;
    const d = `M${cx - a} ${y - 6} Q${cx} ${r1(y + ry + 6 - i * 2)} ${cx + a} ${y - 6}`;
    o += `<path d="${d}" fill="none" stroke="${C.canastoL}" stroke-width="6.4" stroke-dasharray="9 4" stroke-dashoffset="${i % 2 ? 6.5 : 0}"/>`;
    o += L(d.replace(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g, (m, x, _a, y) => `${x} ${r1(+y + 4.6)}`), 1.4, C.canastoS);
  }
  o += `</g>`;
  // El borde trenzado
  o += pieza(`M${cx - rx - 5} ${top - 1} A${rx + 5} ${ry + 5} 0 0 0 ${cx + rx + 5} ${top - 1} L${cx + rx - 4} ${top + 1} A${rx - 4} ${ry - 3} 0 0 1 ${cx - rx + 4} ${top + 1} Z`, C.canastoL, [[pol([[cx + 22, top - 10], [cx + rx + 10, top - 10], [cx + rx + 10, top + 30], [cx + 22, top + 30]]), C.canasto]], { w: 4, peso: 1 });
  for (let i = -4; i <= 4; i++) {
    const x = cx + i * 11.5, y = top + Math.sqrt(Math.max(0, 1 - (i * 11.5 / (rx + 1)) ** 2)) * (ry + 1);
    o += L(`M${r1(x - 4)} ${r1(y - 4)} L${r1(x + 4)} ${r1(y + 3)}`, 2, C.canastoS);
  }
  return o;
}

// Una manga recogida: el polerón arremangado se junta en rollos sobre el codo
export function rollo(x, y, giro, ancho = 58) {
  const a = ancho / 2;
  let o = pieza(curva([[-a, -8], [-a * 0.4, -11], [a * 0.4, -11], [a, -7], [a + 2, 3], [a * 0.6, 10], [-a * 0.5, 10], [-a - 2, 2]], true), C.poleron, [[pol([[a * 0.25, -16], [a + 8, -16], [a + 8, 16], [a * 0.35, 16]]), C.poleronS], [pol([[-a - 6, 4], [a + 6, 4], [a + 6, 16], [-a - 6, 16]]), C.poleronS]], { w: 4.2, peso: 1 });
  o += pincel([-a + 6, -1], [-a * 0.3, 2], [a * 0.3, 2], [a - 6, -1], 2);
  return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(giro)})">${o}</g>`;
}

// ── El brazo de atrás (su izquierda): en alto, saludando con la mano abierta ──
const HOMBRO_L = [360, 626], CODO_L = [420, 552], MUNECA_L = [438, 476];
function brazoSaludo() {
  let o = '';
  const ang = Math.atan2(CODO_L[1] - HOMBRO_L[1], CODO_L[0] - HOMBRO_L[0]) / GRAD;
  const rx = HOMBRO_L[0] + (CODO_L[0] - HOMBRO_L[0]) * 0.36, ry = HOMBRO_L[1] + (CODO_L[1] - HOMBRO_L[1]) * 0.36;
  // Antebrazo y bíceps en piel, bajo la manga recogida
  o += pieza(miembro([CODO_L, MUNECA_L], [42, 32], { punta: 'plana' }), C.piel, [[pol([[CODO_L[0] + 6, CODO_L[1] - 10], [CODO_L[0] + 40, CODO_L[1]], [MUNECA_L[0] + 30, MUNECA_L[1]], [MUNECA_L[0] + 6, MUNECA_L[1] - 4]]), C.pielS]]);
  o += pieza(miembro([[rx, ry], CODO_L], [50, 44], { punta: 'redonda' }), C.piel, [[pol([[rx + 6, ry + 20], [rx + 40, ry - 10], [CODO_L[0] + 40, CODO_L[1] + 10], [CODO_L[0] + 2, CODO_L[1] + 26]]), C.pielS]]);
  o += pincel([CODO_L[0] - 14, CODO_L[1] - 6], [CODO_L[0] - 12, CODO_L[1] - 24], [CODO_L[0] - 6, CODO_L[1] - 42], [CODO_L[0] + 2, CODO_L[1] - 56], 2);
  // La manga, con la copa del hombro, y su rollo
  o += pieza(curva([[338, 612], [356, 598], [378, 594], [394, 604], [398, 622], [384, 640], [362, 650], [344, 642]], true), C.poleron, [[pol([[350, 630], [410, 600], [410, 660], [350, 660]]), C.poleronS]]);
  o += rollo(rx, ry, ang - 90, 54);
  // La mano abierta: la palma de frente y los dedos en abanico
  let m = '';
  [[-12, -30, -20, -62], [-3, -34, -4, -70], [6, -34, 11, -68], [14, -28, 24, -56]].forEach(([x0, y0, x1, y1]) => {
    m += pieza(miembro([[x0, y0 + 8], [x1, y1]], [11, 9.5], { punta: 'redonda' }), C.piel, [[pol([[x0 + 3, y0 + 12], [x1 + 8, y1 - 8], [x1 + 14, y1], [x0 + 10, y0 + 12]]), C.pielS]], { w: 3, peso: 0.6 });
  });
  m += pieza(miembro([[-12, -6], [-30, -22]], [13, 10], { punta: 'redonda' }), C.piel, [[pol([[-26, -14], [-14, 0], [-10, -6], [-24, -20]]), C.pielS]], { w: 3, peso: 0.6 });
  m += pieza(curva([[-16, 4], [-18, -16], [-14, -32], [0, -36], [16, -32], [20, -14], [14, 4]], true), C.piel, [[pol([[8, -44], [30, -44], [30, 10], [10, 10]]), C.pielS]], { w: 4.2, peso: 1 });
  m += L('M-10 -10 Q0 -4 12 -12', 1.8, C.pielS) + L('M-8 -24 Q2 -20 10 -26', 1.6, C.pielS);
  o += `<g transform="translate(${MUNECA_L[0]} ${MUNECA_L[1]}) rotate(8)">${m}</g>`;
  return o;
}

// ── El brazo de adelante (su derecha): baja por el costado y sostiene el canasto contra la cadera ──
const HOMBRO_C = [252, 628], CODO_C = [212, 724], CANASTO = { x: 208, top: 800 };
function brazoCanastoArriba() {
  let o = '';
  const ang = Math.atan2(CODO_C[1] - HOMBRO_C[1], CODO_C[0] - HOMBRO_C[0]) / GRAD;
  const rx = HOMBRO_C[0] + (CODO_C[0] - HOMBRO_C[0]) * 0.4, ry = HOMBRO_C[1] + (CODO_C[1] - HOMBRO_C[1]) * 0.4;
  // Bíceps y codo en piel
  o += pieza(miembro([[rx, ry], CODO_C], [54, 46], { punta: 'redonda' }), C.piel, [[pol([[rx + 10, ry - 10], [rx + 40, ry], [CODO_C[0] + 30, CODO_C[1] + 20], [CODO_C[0] + 6, CODO_C[1] + 20]]), C.pielS], [pol([[rx - 40, ry - 20], [rx - 16, ry - 20], [CODO_C[0] - 14, CODO_C[1]], [CODO_C[0] - 40, CODO_C[1]]]), C.pielL]]);
  // Hombro y manga
  o += pieza(curva([[296, 616], [272, 604], [248, 608], [232, 624], [228, 646], [236, 666], [262, 676], [288, 664], [300, 640]], true), C.poleron, [[pol([[220, 652], [310, 640], [310, 690], [220, 690]]), C.poleronS], [pol([[220, 590], [270, 590], [244, 620], [220, 640]]), C.poleronL]]);
  o += pincel([284, 624], [272, 632], [262, 644], [258, 656], 2);
  o += rollo(rx, ry, ang - 90, 60);
  return o;
}
function brazoCanastoAbajo() {
  let o = '';
  const mx = CANASTO.x + 36, my = CANASTO.top - 2;
  // Antebrazo del codo al borde del canasto
  o += pieza(miembro([[CODO_C[0] + 2, CODO_C[1] + 2], [(CODO_C[0] + mx) / 2 - 6, (CODO_C[1] + my) / 2 - 4], [mx - 10, my - 18]], [44, 40, 32], { punta: 'plana' }), C.piel, [[pol([[CODO_C[0] + 18, CODO_C[1] - 10], [CODO_C[0] + 40, CODO_C[1]], [mx + 10, my - 12], [mx - 6, my - 10]]), C.pielS]]);
  o += pincel([CODO_C[0] - 8, CODO_C[1] + 14], [CODO_C[0] - 4, CODO_C[1] + 30], [CODO_C[0] + 4, CODO_C[1] + 44], [CODO_C[0] + 14, CODO_C[1] + 54], 2);
  // La mano sobre el borde: el dorso arriba y los cuatro dedos que se enganchan por delante
  o += pieza(curva([[mx - 26, my - 18], [mx - 2, my - 22], [mx + 12, my - 12], [mx + 12, my + 2], [mx - 2, my + 8], [mx - 20, my + 6], [mx - 30, my - 6]], true), C.piel, [[pol([[mx - 2, my - 28], [mx + 20, my - 28], [mx + 20, my + 12], [mx, my + 12]]), C.pielS]], { w: 4.4, peso: 1.2 });
  for (let i = 0; i < 4; i++) {
    const x = mx - 26 + i * 9;
    o += pieza(curva([[x, my - 4], [x + 9, my - 4], [x + 10, my + 8], [x + 6, my + 16], [x + 1, my + 14], [x - 1, my + 4]], true), C.piel, [[pol([[x + 5, my - 8], [x + 12, my - 8], [x + 12, my + 20], [x + 6, my + 20]]), C.pielS]], { w: 3, peso: 0.6 });
  }
  o += L(`M${mx - 24} ${my - 12} Q${mx - 12} ${my - 16} ${mx - 2} ${my - 13}`, 1.8, C.pielS);
  return o;
}

// ── Cuello y cabeza: la misma cara de la ronda 1 (rasgos andinos, sonrisa abierta, nariz con sombra) ──
function cuello() {
  return pieza(pol([[298, 540], [346, 542], [350, 610], [288, 610]]), C.piel, [[pol([[286, 534], [356, 534], [356, 570], [286, 564]]), C.pielS], [pol([[330, 560], [358, 560], [358, 614], [334, 614]]), C.pielS]]);
}
function cabeza() {
  let o = '';
  // El moño lejano queda detrás de la cabeza
  const mono = (x, y, r) => {
    let m = pieza(ruedo(x, y, r, r), C.pelo, [[pol([[x + r * 0.05, y - r - 4], [x + r + 4, y - r - 4], [x + r + 4, y + r + 4], [x - r - 4, y + r + 4], [x - r * 0.25, y + r * 0.3]]), C.peloS]]);
    m += pincel([x - r * 0.66, y + r * 0.25], [x - r * 0.66, y - r * 0.5], [x + r * 0.05, y - r * 0.82], [x + r * 0.58, y - r * 0.42], 2.6);
    m += pincel([x - r * 0.3, y + r * 0.4], [x - r * 0.34, y - r * 0.2], [x + r * 0.18, y - r * 0.34], [x + r * 0.34, y + r * 0.08], 2.2);
    m += P(`M${r1(x - r * 0.74)} ${r1(y - r * 0.05)} Q${r1(x - r * 0.62)} ${r1(y - r * 0.74)} ${r1(x)} ${r1(y - r * 0.82)} Q${r1(x - r * 0.48)} ${r1(y - r * 0.56)} ${r1(x - r * 0.74)} ${r1(y - r * 0.05)} Z`, C.peloL);
    return m;
  };
  o += mono(30, -122, 29);
  // Cara: ancha, de pómulos altos, mentón chico
  const cara = curva([[-104, 12], [-96, -46], [-62, -88], [-14, -104], [26, -92], [44, -60], [45, -24], [40, 0], [44, 20], [41, 38], [34, 62], [14, 86], [-12, 96], [-44, 88], [-72, 66], [-94, 40]], true);
  o += pieza(cara, C.piel, [[pol([[46, 30], [80, 30], [80, 130], [-40, 130], [-14, 94], [24, 78]]), C.pielS]]);
  // Oreja (la cercana)
  o += pieza(curva([[-60, 8], [-78, 4], [-86, 24], [-82, 46], [-62, 54]], true), C.piel, [[pol([[-88, 32], [-60, 32], [-60, 60], [-88, 60]]), C.pielS]], { w: 5, peso: 1.6 });
  o += L('M-68 16 Q-78 28 -72 44', 2.6) + L('M-70 28 Q-66 32 -70 38', 2);
  // Mejilla
  o += P(curva([[-58, 34], [-42, 26], [-22, 30], [-26, 42], [-48, 44]], true), C.mejilla);
  // Ojos alegres: párpado pesado arriba, el de abajo empujado por la sonrisa; pupilas chicas que miran adelante
  for (const [x, y, w, h, pest] of [[-22, 8, 37, 19, -1], [25, 6, 17, 14, 1]]) {
    const ojo = `M${x - w / 2} ${y} Q${x} ${y - h * 1.2} ${x + w / 2} ${y} Q${x} ${r1(y - h * 0.06)} ${x - w / 2} ${y} Z`;
    o += pieza(ojo, '#F6F3EC', [`<circle cx="${r1(x + w * 0.16)}" cy="${r1(y - h * 0.38)}" r="${r1(h * 0.3)}" fill="${K}"/>`], { w: 3.2, peso: 0 });
    o += negro(`M${x - w / 2 - 3} ${y - 1} Q${x} ${y - h * 1.2 - 7} ${x + w / 2 + 4} ${y - 2} L${x + w / 2 + 2} ${r1(y - h * 0.26)} Q${x} ${r1(y - h * 0.9)} ${x - w / 2} ${y + 1} Z`);
    const ex = pest < 0 ? x - w / 2 - 2 : x + w / 2 + 3;
    o += negro(`M${ex} ${y - 2} l${pest * 8} -5 l${pest * -3} 7 Z`);
    // El párpado de abajo, empujado hacia arriba por la sonrisa
    o += L(`M${x - w / 2 + 1} ${y + 1} Q${x} ${r1(y - h * 0.08)} ${x + w / 2 - 1} ${y}`, 2.6);
  }
  // Cejas negras gruesas, levantadas
  o += negro(curva([[-44, -6], [-30, -20], [-6, -22], [-2, -15], [-10, -14], [-30, -12], [-42, -2]], true));
  o += negro(curva([[12, -16], [26, -22], [42, -18], [42, -12], [28, -15], [14, -11]], true));
  // Nariz andina de punta redonda que asoma del contorno: el puente nace bajo el ojo y se funde con la cara (sólo
  // una sombra suave de piel, sin tinta); la tinta marca la punta y la aleta
  o += P(pol([[14, 10], [22, 22], [32, 34], [42, 39], [48, 47], [44, 54], [30, 53], [20, 44], [16, 28]]), C.piel);
  o += P(pol([[34, 52], [46, 50], [44, 56], [36, 56]]), C.pielS);
  o += P('M20 16 Q28 24 37 32 Q43 36 47 38 L46 42 Q40 39 35 36 Q27 29 19 19 Z', C.pielS);
  o += B('M38 37.5 Q48 41 48 49 Q47 55 40 55', 4.6);
  o += L('M24 51 Q26 46 31 48', 2);
  o += negro(curva([[31, 50.5], [37, 50], [37.5, 53], [32.5, 53.5]], true));
  // Sonrisa abierta: la fila de dientes de arriba es una franja blanca continua
  const boca = curva([[-20, 62], [-2, 64], [16, 63], [32, 58], [29, 70], [16, 79], [-2, 81], [-14, 74]], true);
  o += pieza(boca, C.boca, [[curva([[-14, 77], [4, 73], [18, 75], [18, 81], [4, 85]], true), C.lengua], '<path d="M-26 54 L38 50 L38 66 Q8 72 -26 70 Z" fill="' + C.diente + '"/>'], { w: 3.4, peso: 0.6 });
  o += B(boca, 3.4);
  o += P(curva([[-10, 83], [4, 86], [20, 81], [17, 88], [4, 92], [-6, 89]], true), C.labio);
  // Líneas de la sonrisa y del pómulo
  o += pincel([-14, 50], [-20, 54], [-24, 58], [-26, 64], 2.2);
  o += L('M34 55 Q38 58 37 63', 1.8);
  o += L('M-22 58 Q-27 62 -25 68', 2);
  o += pincel([-36, 24], [-28, 28], [-18, 28], [-10, 24], 1.8);
  // El pelo: raya al medio, tirante hacia los moños
  const pelo = curva([[48, -44], [30, -52], [8, -55], [-16, -48], [-38, -34], [-52, -24], [-58, 0], [-62, 10], [-76, 2], [-90, 14], [-94, 42], [-90, 66], [-110, 54], [-121, 14], [-114, -40], [-86, -90], [-36, -116], [16, -112], [44, -90], [54, -66]], true);
  o += pieza(pelo, C.pelo, [[pol([[-124, 0], [-98, -20], [-94, 40], [-86, 72], [-124, 72]]), C.peloS], [pol([[20, -118], [60, -102], [60, -60], [36, -72]]), C.peloS]]);
  // La raya del medio y los mechones que tiran hacia cada moño
  o += L('M8 -71 Q-2 -88 -14 -110', 2.6, C.peloL);
  o += pincel([-8, -66], [-26, -80], [-40, -94], [-50, -104], 2.4) + pincel([-28, -52], [-50, -66], [-66, -82], [-72, -96], 2.4) + pincel([-46, -30], [-70, -44], [-88, -62], [-92, -82], 2.4);
  o += pincel([16, -72], [20, -88], [24, -100], [28, -108], 2.2) + pincel([34, -66], [40, -80], [42, -92], [42, -102], 2);
  o += pincel([-60, 2], [-86, -10], [-104, -30], [-110, -54], 2.4) + pincel([-92, 30], [-104, 10], [-110, -10], [-114, -26], 2.2);
  o += P('M-20 -70 Q-40 -88 -56 -100 Q-36 -82 -30 -64 Z', C.peloL) + P('M-44 -40 Q-66 -58 -80 -78 Q-60 -54 -54 -32 Z', C.peloL) + P('M-70 -8 Q-90 -26 -100 -48 Q-82 -22 -76 0 Z', C.peloL);
  // Mechones sueltos que vuela el viento, en la sien y en la nuca
  o += pincel([-50, -30], [-64, -38], [-80, -40], [-96, -34], 3, { ini: 0.15, fin: 0.6 }) + pincel([-46, -22], [-60, -26], [-72, -24], [-84, -16], 2.4, { ini: 0.15, fin: 0.6 });
  o += pincel([-104, 46], [-118, 44], [-130, 46], [-142, 54], 2.8, { ini: 0.15, fin: 0.6 });
  o += mono(-54, -114, 33);
  return `<g transform="translate(${CAB.x} ${CAB.y}) rotate(${CAB.giro}) scale(${CAB.k})">${o}</g>`;
}

const INCLINA = 7, CADERA = [296, 852], CORRE = -24;
export function pepa({ prefijo = 'pepa' } = {}) {
  reiniciar(prefijo);
  // El tronco (con la falda, los brazos y la cabeza) se inclina hacia adelante sobre la cadera: va a partir
  const tronco = `<g transform="rotate(${INCLINA} ${CADERA[0]} ${CADERA[1]})">${trenza()}${brazoSaludo()}${torso()}${brazoCanastoArriba()}${canasto(CANASTO.x, CANASTO.top)}${brazoCanastoAbajo()}${cuello()}${cabeza()}</g>`;
  return `<g transform="translate(${CORRE} 0)">${piernas()}${tronco}</g>`;
}
export const vista = () => lamina(pepa());
