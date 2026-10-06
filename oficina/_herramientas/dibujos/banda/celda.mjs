// Celda en la línea de la banda: la de los datos (E3). Celeste Dávila, le dicen Byte. Mujer afrodescendiente de
// treinta y tantos, baja (casi de la altura de Pepa) y delgada, segura y precisa: una mano en la cadera y el plumero cian
// en alto (le saca el polvo a los datos). Un afro grande cortado en forma de cubo, en perspectiva, de rulos tupidos, las
// orillas mullidas y las esquinas de arriba redondeadas (la luz viene de arriba a la izquierda), con la peineta cian
// clavada arriba. Lentes cuadrados de marco grueso (en su cara chica se ven grandes), nariz chica y el aro cian. La
// chaqueta corta cuadriculada como planilla, con celdas encendidas en cian, abierta sobre la polera blanca con su 3; el
// reloj cuadrado, pantalón azul recto y angosto y zapatillas blancas con la franja cian. Marco 600 × 1260, suelo en
// y = 1240, mira a la derecha.
import { K, P, B, L, pol, negro, pieza, curva, miembro, pincel, reiniciar, nuevoId, r1, numeroChico } from './base.mjs';
import { NUMERO, lamina } from './tinta.mjs';

export const C = {
  piel: '#98613D', pielS: '#76482A',
  labio: '#6A3530', labioS: '#532622', labioL: '#8C4E44',
  peloS: '#111218',
  // El afro en cubo: la cara de arriba (la más clara), la de la oreja y la de la frente (la más oscura); sus rulos y
  // las motas de volumen, más claras, hacia la luz
  cuboA: '#363B4B', cuboI: '#242833', cuboD: '#181A22',
  rizoA: '#555B70', rizoI: '#3A3F4F', rizoD: '#2B2F3B',
  motaA: '#434959', motaI: '#2E323E', motaD: '#1F222B',
  rapado: '#2B2425', rapadoL: '#3F3634',
  chaq: '#183C64', chaqS: '#0F2947', cuadro: '#5486BA', cuadroS: '#33618F',
  cian: '#17C3B2', cianL: '#7FD8CF', cianS: '#0A8A7E', cianX: '#06645B',
  polera: '#F4F2EC', poleraS: '#CBCAC5',
  pant: '#2C5B92', pantS: '#1C3F69', pantL: '#4876AC',
  zap: '#F2F4F7', zapS: '#B9C8D8', suela: '#E2E7ED', suelaS: '#97A6B8', cordon: '#B9C8D8',
  mango: '#C9D3DE', mangoS: '#8E99A6', blanco: '#FFFFFF', ojo: '#F6F3EC', vidrio: '#DDF4F1'
};
const rad = (g) => (g * Math.PI) / 180;
// Azar fijo: el mismo dibujo en cada render
export const azar = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
// Un rectángulo girado: centro, ancho (a lo ancho de la pieza), alto (a lo largo) y giro en grados
function banda([cx, cy], giro, ancho, alto) {
  const a = rad(giro), c = Math.cos(a), s = Math.sin(a);
  return pol([[-ancho / 2, -alto / 2], [ancho / 2, -alto / 2], [ancho / 2, alto / 2], [-ancho / 2, alto / 2]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]));
}
const angulo = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

// ── La tela de planilla: azul marino con la grilla más clara, en un patrón que sigue cada pieza ──
const PASO = 20;
let ID = 'celda';
const GIROS = { torso: 0, mangaI: 26, mangaD: -34 };
function tela(nombre) {
  const t = `rotate(${GIROS[nombre]})`;
  const uno = (id, fondo, linea) => `<pattern id="${id}" width="${PASO}" height="${PASO}" patternUnits="userSpaceOnUse" patternTransform="${t}">` +
    `<rect width="${PASO}" height="${PASO}" fill="${fondo}"/><path d="M${PASO / 2} 0 V${PASO} M0 ${PASO / 2} H${PASO}" stroke="${linea}" stroke-width="2.1" fill="none"/></pattern>`;
  return uno(`${ID}-${nombre}`, C.chaq, C.cuadro) + uno(`${ID}-${nombre}S`, C.chaqS, C.cuadroS);
}
const T = (nombre) => `url(#${ID}-${nombre})`;
const TS = (nombre) => `url(#${ID}-${nombre}S)`;
// Una celda encendida: la de la grilla de esa pieza que contiene el punto (x, y) del cuadro, con su resplandor
function luz(nombre, x, y, color = C.cian) {
  const g = rad(-GIROS[nombre]), px = x * Math.cos(g) - y * Math.sin(g), py = x * Math.sin(g) + y * Math.cos(g);
  const cx = PASO / 2 + PASO * Math.floor((px - PASO / 2) / PASO), cy = PASO / 2 + PASO * Math.floor((py - PASO / 2) / PASO);
  return `<g transform="rotate(${GIROS[nombre]})">` +
    `<rect x="${r1(cx - 4)}" y="${r1(cy - 4)}" width="${PASO + 8}" height="${PASO + 8}" fill="${C.cian}" opacity=".75" filter="url(#${ID}-luz)"/>` +
    `<rect x="${r1(cx + 1.3)}" y="${r1(cy + 1.3)}" width="${PASO - 2.6}" height="${PASO - 2.6}" fill="${color}"/>` +
    `<rect x="${r1(cx + 3.6)}" y="${r1(cy + 3.6)}" width="${PASO - 11}" height="3.2" fill="${C.blanco}" opacity=".8"/></g>`;
}

// ── Zapatillas blancas: grandes, de caricatura, con la suela gruesa y la franja cian ──
export function zapatilla(x0, lado) {
  // x0: el tobillo; lado -1: la punta hacia la izquierda; +1: hacia la derecha
  const X = (x) => x0 - lado * x;
  let o = '';
  const suela = curva([[X(-102), 1212], [X(-66), 1206], [X(38), 1206], [X(46), 1221], [X(44), 1240], [X(-96), 1240], [X(-106), 1227]], true);
  o += pieza(suela, C.suela, [[pol([[X(-126), 1230], [X(64), 1230], [X(64), 1250], [X(-126), 1250]]), C.suelaS]], { w: 5.2 });
  o += pieza(pol([[X(-102), 1213], [X(43), 1213], [X(45), 1222], [X(-104), 1222]]), C.cian, [], { w: 2.4, peso: 0 });
  // Empeine de cuero blanco, con la puntera redonda que asoma bajo la basta
  const cuero = curva([[X(-28), 1142], [X(30), 1140], [X(40), 1172], [X(40), 1208], [X(-58), 1210], [X(-100), 1208], [X(-96), 1186], [X(-74), 1171], [X(-48), 1159]], true);
  o += pieza(cuero, C.zap, [[pol([[X(10), 1132], [X(54), 1132], [X(54), 1214], [X(14), 1214]]), C.zapS], [pol([[X(-110), 1199], [X(-26), 1199], [X(-26), 1214], [X(-110), 1214]]), C.zapS]], { w: 5.2 });
  o += L(`M${X(-96)} 1195 Q${X(-83)} 1179 ${X(-61)} 1187`, 2.4);
  o += L(`M${X(-61)} 1202 Q${X(-14)} 1196 ${X(34)} 1199`, 2, C.zapS);
  // Cordones cortos sobre el empeine
  for (let i = 0; i < 3; i++) {
    const x = -54 + i * 10, y = 1172 - i * 8;
    o += L(`M${X(x - 9)} ${y + 3} L${X(x + 9)} ${y - 3}`, 3.2, C.cordon);
  }
  return o;
}

// ── Piernas: el pantalón azul recto y angosto, con la raya planchada y la basta que se quiebra sobre la zapatilla.
// Es baja: las piernas son cortas y la cadera queda abajo. BAJA es cuánto baja todo lo que va sobre las piernas (las
// zapatillas no se mueven, así que las piernas se acortan en lo mismo). Con 50 queda casi de la altura de Pepa ──
const BAJA = 50;
const RODILLA = Math.round(BAJA * 0.43);
const PIERNA_I = [[270, 782 + BAJA], [264, 1006 + RODILLA], [255, 1176]], PIERNA_D = [[332, 782 + BAJA], [339, 1006 + RODILLA], [349, 1176]];
const ANCHO_P = [64, 52, 48];
function piernas() {
  let o = '';
  o += pieza(miembro(PIERNA_I, ANCHO_P, { punta: 'plana' }), C.pant, [[pol([[288, 760 + BAJA], [308, 760 + BAJA], [285, 1188], [268, 1188], [281, 1000 + RODILLA]]), C.pantS]]);
  o += pieza(miembro(PIERNA_D, ANCHO_P, { punta: 'plana' }), C.pant, [[pol([[348, 760 + BAJA], [372, 760 + BAJA], [378, 1188], [357, 1188], [353, 1000 + RODILLA]]), C.pantS]]);
  // Cadera, bajo la pretina: chica y angosta (baja con el cuerpo)
  let cadera = pieza(pol([[242, 758], [362, 758], [366, 816], [301, 840], [237, 816]]), C.pant, [[pol([[336, 752], [372, 752], [372, 852], [330, 852]]), C.pantS]], { borde: false });
  cadera += B('M242 758 L237 818', 6) + B('M362 758 L366 818', 6);
  // La bragueta y los bolsillos sesgados
  cadera += pincel([302, 766], [303, 790], [302, 814], [300, 840], 2.8) + L('M248 770 Q258 788 262 806', 2.6) + L('M356 770 Q348 788 346 806', 2.6);
  cadera += pincel([300, 846], [298, 864], [295, 878], [292, 890], 2.6);
  o += `<g transform="translate(0 ${BAJA})">${cadera}</g>`;
  // La raya planchada de cada pierna
  o += L(`M262 ${856 + BAJA} L255 1164`, 1.8, C.pantL) + L(`M340 ${856 + BAJA} L349 1164`, 1.8, C.pantL);
  // Rodillas
  o += `<g transform="translate(0 ${RODILLA})">` + pincel([246, 996], [256, 1004], [268, 1004], [280, 996], 2.4) + pincel([324, 998], [334, 1006], [346, 1006], [356, 998], 2.4) + `</g>`;
  // La basta se quiebra sobre la zapatilla
  o += pincel([233, 1142], [247, 1150], [263, 1150], [277, 1142], 2.4) + pincel([327, 1144], [341, 1152], [357, 1152], [373, 1144], 2.4);
  return o;
}

// ── El plumero: una mota esponjosa de plumas cian sobre un mango largo (k: su tamaño) ──
// La mota: angosta abajo (donde nacen las plumas) y ancha arriba; el borde son motas chicas y, de tanto en tanto, la
// punta de una pluma que se escapa y se dobla
function mota(alto, ancho, n, amp, puntas, semilla) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 2 * Math.PI;
    pts.push([ancho * Math.sin(t) * Math.pow(Math.sin(t / 2), 0.55), (-alto * (1 - Math.cos(t))) / 2]);
  }
  const cy = -alto * 0.6;
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[i + 1], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const v = [m[0], m[1] - cy], l = Math.hypot(v[0], v[1]) || 1, u = [v[0] / l, v[1] / l];
    const crece = Math.min(1, -m[1] / (alto * 0.3));
    if (puntas.includes(i)) {
      const largo = amp * 2.7 * crece, lado = azar(semilla + i) < 0.5 ? -1 : 1;
      const tip = [m[0] + u[0] * largo - u[1] * lado * largo * 0.5, m[1] + u[1] * largo + u[0] * lado * largo * 0.5];
      d += ` Q${r1(a[0] + u[0] * largo * 0.7)} ${r1(a[1] + u[1] * largo * 0.7)} ${r1(tip[0])} ${r1(tip[1])}`;
      d += ` Q${r1(b[0] + u[0] * largo * 0.5)} ${r1(b[1] + u[1] * largo * 0.5)} ${r1(b[0])} ${r1(b[1])}`;
    } else {
      const k = amp * crece * (0.6 + 0.8 * azar(semilla + i));
      d += ` Q${r1(m[0] + u[0] * k)} ${r1(m[1] + u[1] * k)} ${r1(b[0])} ${r1(b[1])}`;
    }
  }
  return d + ' Z';
}
function plumero(k = 0.84) {
  // Coordenadas propias: el puño en el origen y el mango hacia arriba (y negativo)
  const q = (pts) => pol(pts.map(([x, y]) => [x * k, y * k]));
  let o = '';
  o += `<g transform="translate(0 ${r1(-122 * k)})">`;
  // La mota: luz arriba a la izquierda, sombra a la derecha, y las barbas de las plumas en el borde
  o += pieza(mota(170 * k, 84 * k, 30, 9 * k, [4, 8, 11, 15, 19, 22, 26], 5), C.cian, [
    [q([[16, 4], [30, -60], [44, -120], [36, -170], [30, -220], [140, -220], [140, 4]]), C.cianS],
    `<path d="${mota(92 * k, 40 * k, 18, 6 * k, [5, 12], 31)}" transform="translate(${r1(-22 * k)} ${r1(-70 * k)})" fill="${C.cianL}"/>`
  ], { w: 4.6, peso: 1.4 });
  for (const [x, y, g, c] of [[-50, -120, -40, C.cianS], [-30, -150, -18, C.cianS], [-4, -160, 0, C.cianS], [24, -150, 18, C.cianX], [50, -126, 40, C.cianX], [62, -92, 60, C.cianX], [-60, -86, -58, C.cianS], [-20, -112, -10, C.cianS], [16, -112, 14, C.cianX], [34, -80, 34, C.cianX]]) {
    o += `<g transform="translate(${r1(x * k)} ${r1(y * k)}) rotate(${g})">` + L('M-5 8 Q-2 0 0 -8 M3 10 Q5 2 7 -5', 1.9, c) + `</g>`;
  }
  o += L(`M${r1(-34 * k)} ${r1(-86 * k)} Q${r1(-40 * k)} ${r1(-108 * k)} ${r1(-42 * k)} ${r1(-128 * k)}`, 2.4, C.blanco);
  o += `</g>`;
  // Mango y el amarre de las plumas, angosto
  o += pieza(q([[-6, -112], [6, -112], [6, 44], [-6, 44]]), C.mango, [[q([[1, -116], [10, -116], [10, 50], [1, 50]]), C.mangoS]], { w: 3.6, peso: 1 });
  o += pieza(q([[-9, -134], [9, -134], [7, -108], [-7, -108]]), C.cianS, [[q([[1, -138], [12, -138], [12, -104], [1, -104]]), C.cianX]], { w: 3.4, peso: 0.8 });
  o += L(`M${r1(-8 * k)} ${r1(-126 * k)} L${r1(8 * k)} ${r1(-126 * k)} M${r1(-8 * k)} ${r1(-118 * k)} L${r1(7 * k)} ${r1(-118 * k)}`, 1.8, C.cianX);
  o += `<circle cx="0" cy="${r1(50 * k)}" r="${r1(7 * k)}" fill="${C.cian}" stroke="${K}" stroke-width="3"/>`;
  return o;
}
function puno() {
  // El puño cerrado alrededor del mango: los dedos apilados y el pulgar que cruza por delante
  let o = '';
  o += pieza(curva([[-19, -19], [8, -22], [20, -14], [22, 7], [17, 22], [-14, 24], [-22, 10], [-22, -7]], true), C.piel, [[pol([[5, -26], [28, -26], [28, 28], [8, 28]]), C.pielS]], { w: 4.6, peso: 1.4 });
  for (const y of [-5, 5, 14.5]) o += L(`M-19 ${y} Q2 ${y - 3.4} 20 ${y + 1}`, 2.2);
  o += pieza(curva([[-22, -17], [-4, -24], [12, -20], [14, -12], [-2, -10], [-19, -7]], true), C.piel, [[pol([[2, -26], [18, -26], [18, -7], [4, -7]]), C.pielS]], { w: 3.6, peso: 0.8 });
  return o;
}

// ── El brazo de atrás: delgado, en alto, con el plumero; la manga va arremangada sobre el codo ──
const HOMBRO_D = [352, 536], CODO_D = [434, 640], PUNO = { x: 462, y: 500, giro: 8 };
function brazoAtras() {
  let o = '';
  // Antebrazo delgado, del puño al codo
  o += pieza(miembro([[PUNO.x - 3, PUNO.y + 16], CODO_D], [27, 34], { punta: 'redonda' }), C.piel, [[pol([[463, 506], [484, 506], [458, 664], [439, 656]]), C.pielS]]);
  o += pincel([444, 628], [446, 614], [449, 600], [452, 588], 1.8);
  // Manga de la planilla, arremangada sobre el codo, con su puño
  const g = angulo(HOMBRO_D, CODO_D), u = [Math.cos(rad(g)), Math.sin(rad(g))], fin = [CODO_D[0] - 17 * u[0], CODO_D[1] - 17 * u[1]];
  o += pieza(miembro([HOMBRO_D, [(HOMBRO_D[0] + fin[0]) / 2 + 3, (HOMBRO_D[1] + fin[1]) / 2 - 2], fin], [56, 52, 48], { punta: 'plana' }), T('mangaD'), [[pol([[374, 522], [424, 546], [444, 640], [410, 634]]), TS('mangaD')]]);
  o += pieza(banda([fin[0] - 3 * u[0], fin[1] - 3 * u[1]], g + 90, 56, 14), C.chaqS, [], { w: 4.2, peso: 1 });
  o += pincel([370, 566], [382, 580], [392, 590], [404, 596], 2.2);
  // El plumero en alto, en su puño
  o += `<g transform="translate(${PUNO.x} ${PUNO.y}) rotate(${PUNO.giro})">${plumero()}${puno()}</g>`;
  return o;
}

// ── Torso: angosto y sin curvas grandes. La polera blanca con el 3, la pretina y la chaqueta planilla abierta ──
const CHAQ_I = curva([[278, 508], [250, 514], [232, 532], [228, 592], [230, 670], [234, 736], [266, 738], [260, 670], [258, 600], [266, 540]], true);
const CHAQ_D = curva([[328, 508], [354, 512], [372, 530], [376, 592], [374, 670], [368, 734], [344, 736], [350, 670], [350, 600], [340, 540]], true);
function torso() {
  let o = '';
  const polera = curva([[272, 506], [302, 518], [332, 506], [356, 514], [368, 550], [366, 640], [360, 758], [302, 764], [244, 758], [238, 640], [236, 550], [248, 514]], true);
  o += pieza(polera, C.polera, [[pol([[336, 500], [382, 500], [382, 770], [340, 770], [352, 640]]), C.poleraS]]);
  o += L('M274 510 Q302 532 330 510', 4.2);
  o += numeroChico(`<text x="305" y="718" text-anchor="middle" font-family="${NUMERO}" font-size="116" fill="${C.cian}" stroke="${K}" stroke-width="5" paint-order="stroke" transform="rotate(-3 305 670)">3</text>`, 305, 676);
  // La pretina, con su botón y las presillas
  o += pieza(pol([[242, 742], [362, 742], [364, 764], [240, 764]]), C.pant, [[pol([[334, 738], [370, 738], [370, 768], [336, 768]]), C.pantS]], { w: 4.6, peso: 1.2 });
  o += `<circle cx="304" cy="753" r="5" fill="${C.mango}" stroke="${K}" stroke-width="2.4"/>`;
  for (const x of [272, 338]) o += pieza(pol([[x - 4, 740], [x + 4, 740], [x + 4, 766], [x - 4, 766]]), C.pant, [], { w: 2.8, peso: 0 });
  // La chaqueta planilla: dos mitades abiertas, con sus celdas encendidas
  o += pieza(CHAQ_I, T('torso'), [[pol([[252, 500], [270, 500], [270, 744], [252, 744]]), TS('torso')], luz('torso', 244, 684, C.cianL)]);
  o += pieza(CHAQ_D, T('torso'), [[pol([[358, 500], [384, 500], [384, 744], [356, 744]]), TS('torso')], luz('torso', 362, 580), luz('torso', 356, 682)]);
  o += pincel([244, 560], [242, 590], [242, 620], [244, 650], 2.2) + pincel([362, 600], [364, 630], [362, 660], [358, 690], 2.2);
  // Cuello en punta y el ruedo de la chaqueta
  o += pieza(pol([[280, 500], [250, 514], [258, 552], [270, 542], [274, 518]]), C.chaq, [[pol([[262, 496], [282, 496], [282, 560], [266, 560]]), C.chaqS]], { w: 4.4, peso: 1.2 });
  o += pieza(pol([[326, 500], [354, 512], [348, 548], [336, 538], [332, 516]]), C.chaq, [[pol([[340, 496], [360, 496], [360, 556], [344, 556]]), C.chaqS]], { w: 4.4, peso: 1.2 });
  o += pieza(pol([[236, 724], [264, 726], [266, 740], [238, 738]]), C.chaqS, [], { w: 4.2, peso: 0 });
  o += pieza(pol([[344, 724], [366, 722], [364, 736], [344, 738]]), C.chaqS, [], { w: 4.2, peso: 0 });
  return o;
}

// ── El brazo de adelante: la mano en la cadera, el codo afuera ──
function mano() {
  // Coordenadas propias: la muñeca en el origen, los dedos hacia +x; se ve el dorso
  let o = '';
  o += pieza(curva([[-2, -15], [16, -18], [31, -17], [34, 0], [31, 17], [16, 19], [-2, 15]], true), C.piel, [[pol([[-4, 6], [38, 6], [38, 24], [-4, 24]]), C.pielS]], { w: 4.6, peso: 1.4 });
  // Los cuatro dedos juntos, doblados en los nudillos hacia el frente de la cadera, con las yemas redondas
  const dedos = 'M26 -17 L54 -16.5 Q61 -16.5 61 -12.4 Q61 -8.5 56 -8.2 Q66 -8.2 66 -4.1 Q66 0 59 0 Q65 0 65 4.1 Q65 8.2 57 8.2 Q60 8.2 60 12.4 Q60 16.5 52 16.5 L26 17 Z';
  o += `<g transform="rotate(-12 28 0)">` + pieza(dedos, C.piel, [[pol([[22, 6], [70, 6], [70, 20], [22, 20]]), C.pielS]], { w: 4, peso: 1.2 });
  o += L('M56 -8.2 L36 -8.6', 2) + L('M59 0 L36 0', 2) + L('M57 8.2 L36 8.6', 2) + `</g>`;
  o += L('M26 -12 Q29 -7.5 27 -3.6', 1.8) + L('M27 -1 Q30 4 28 8', 1.8);
  return o;
}
const HOMBRO_I = [250, 534], CODO_I = [186, 664], MUNECA = [240, 756];
function brazoDelante() {
  let o = '';
  // Antebrazo delgado, del codo a la muñeca sobre la cadera
  o += pieza(miembro([MUNECA, CODO_I], [27, 34], { punta: 'redonda' }), C.piel, [[pol([[190, 664], [212, 650], [264, 746], [244, 760]]), C.pielS]]);
  o += pincel([204, 666], [210, 674], [216, 684], [220, 694], 1.8);
  // Manga de la planilla, arremangada sobre el codo, con una celda encendida y su puño
  const g = angulo(HOMBRO_I, CODO_I), u = [Math.cos(rad(g)), Math.sin(rad(g))], fin = [CODO_I[0] - 17 * u[0], CODO_I[1] - 17 * u[1]];
  o += pieza(miembro([HOMBRO_I, [(HOMBRO_I[0] + fin[0]) / 2 - 3, (HOMBRO_I[1] + fin[1]) / 2 - 2], fin], [58, 54, 50], { punta: 'plana' }), T('mangaI'), [[pol([[252, 518], [286, 536], [228, 664], [206, 652]]), TS('mangaI')], luz('mangaI', 226, 572)]);
  o += pieza(banda([fin[0] - 3 * u[0], fin[1] - 3 * u[1]], g + 90, 58, 14), C.chaqS, [], { w: 4.2, peso: 1 });
  o += pincel([236, 574], [232, 590], [228, 604], [226, 618], 2.2);
  // La mano en la cadera: los dedos hacia abajo y adelante, sobre la pretina
  o += `<g transform="translate(${MUNECA[0]} ${MUNECA[1]}) rotate(46) scale(1.1)">${mano()}</g>`;
  // El reloj de pantalla cuadrada: le dicen Byte porque todo lo mide
  const gr = angulo(CODO_I, MUNECA), v = [Math.cos(rad(gr)), Math.sin(rad(gr))];
  o += `<g transform="translate(${r1(MUNECA[0] - 15 * v[0])} ${r1(MUNECA[1] - 15 * v[1])}) rotate(${r1(gr - 90)})">` + pieza(pol([[-17, -6], [17, -6], [17, 6], [-17, 6]]), C.chaqS, [], { w: 3.2, peso: 0 }) +
    pieza('M-10 -11 H10 Q12.5 -11 12.5 -8.5 V8.5 Q12.5 11 10 11 H-10 Q-12.5 11 -12.5 8.5 V-8.5 Q-12.5 -11 -10 -11 Z', C.mango, [[pol([[2, -14], [16, -14], [16, 14], [4, 14]]), C.mangoS]], { w: 3.2, peso: 0.8 }) +
    P('M-7 -7 H7 V7 H-7 Z', C.chaqS) + P('M-4.4 3.6 V-1 H-0.8 V3.6 Z M0.8 3.6 V-4.4 H4.4 V3.6 Z', C.cian) + `</g>`;
  return o;
}

// ── El afro en cubo: un afro grande cortado como un cubo, visto en perspectiva (proyección paralela), girado 35° como
// la cara y visto un poco desde arriba (16°), para que se lea la cara de arriba. Ronda 4: más grande y con textura de
// pelo (rulos tupidos y orillas mullidas) en vez de la grilla ──
const LADO = 150, GIRO_C = rad(35), ALTO_C = rad(16);
const EJE_F = [LADO * Math.sin(GIRO_C), LADO * Math.cos(GIRO_C) * Math.sin(ALTO_C)];     // de la nuca a la frente
const EJE_L = [LADO * Math.cos(GIRO_C), -LADO * Math.sin(GIRO_C) * Math.sin(ALTO_C)];    // de su sien derecha a la izquierda
const EJE_V = LADO * Math.cos(ALTO_C);                                                   // de abajo hacia arriba
const SIEN = [290, 369];   // la esquina de abajo de la arista de adelante: la sien de ella
// Un punto del cubo: u de la nuca (0) a la frente (1), v de su lado derecho (0) al izquierdo (1), w de abajo (0) a arriba (1)
const cubo3 = (u, v, w) => [SIEN[0] + (u - 1) * EJE_F[0] + v * EJE_L[0], SIEN[1] + (u - 1) * EJE_F[1] + v * EJE_L[1] - w * EJE_V];
// Las tres caras que se ven, cada una como (a, b) ∈ [0, 1]² → punto del cuadro
const CARAS = {
  izq: { p: (a, b) => cubo3(a, 0, b), rizo: 'rizoI', mota: 'motaI', aplasta: 0.85 },   // sobre la oreja
  der: { p: (a, b) => cubo3(1, a, b), rizo: 'rizoD', mota: 'motaD', aplasta: 0.9 },    // sobre la frente
  arriba: { p: (a, b) => cubo3(a, b, 1), rizo: 'rizoA', mota: 'motaA', aplasta: 0.5 }  // el techo
};
const contornoCara = (f) => pol([f.p(0, 0), f.p(1, 0), f.p(1, 1), f.p(0, 1)]);
// Un rulo: una «c» chica (aplastada en el techo, que se ve de canto)
export function rulo([x, y], r, g, k) {
  const a = rad(g), b = rad(g + 250);
  const p0 = [x + r * Math.cos(a), y + r * k * Math.sin(a)], p1 = [x + r * Math.cos(b), y + r * k * Math.sin(b)];
  return `M${r1(p0[0])} ${r1(p0[1])} A${r1(r)} ${r1(r * k)} 0 1 1 ${r1(p1[0])} ${r1(p1[1])} `;
}
// La textura de una cara: motas de volumen más claras hacia la luz y rulos tupidos, cada uno una «c» chica con algo
// de azar en el tamaño, el giro y la posición
function textura(nombre, semilla) {
  const f = CARAS[nombre];
  let o = '', rizos = '';
  // Volumen: dos o tres motas irregulares, más claras, hacia donde viene la luz
  const motas = { arriba: [[0.3, 0.62, 0.2], [0.62, 0.3, 0.16], [0.7, 0.75, 0.13]], izq: [[0.3, 0.78, 0.17], [0.7, 0.62, 0.14]], der: [[0.25, 0.8, 0.13]] }[nombre];
  for (const [ca, cb, r] of motas) {
    const pts = [];
    for (let k = 0; k < 9; k++) {
      const t = (k / 9) * Math.PI * 2, rr = r * (0.75 + 0.4 * azar(semilla + k * 7 + ca * 100));
      pts.push(f.p(Math.min(0.97, Math.max(0.03, ca + rr * Math.cos(t))), Math.min(0.97, Math.max(0.03, cb + rr * Math.sin(t)))));
    }
    o += P(curva(pts, true), C[f.mota]);
  }
  // Los rulos: una grilla tupida de 12 × 12 con azar (algunos huecos para que respire)
  const n = 10;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const k = semilla + i * n + j;
    if (azar(k) < 0.18) continue;
    const a = (i + 0.5 + (azar(k + 31) - 0.5) * 0.9) / n, b = (j + 0.5 + (azar(k + 57) - 0.5) * 0.9) / n;
    rizos += rulo(f.p(a, b), 3 + azar(k + 90) * 2.4, azar(k + 130) * 360, f.aplasta);
  }
  o += `<path d="${rizos}" fill="none" stroke="${C[f.rizo]}" stroke-width="2.3" stroke-linecap="round"/>`;
  return o;
}
// Una arista con rizos: lomas chicas e irregulares hacia afuera, sin perder la recta
export function orilla(a, b, paso, amp, semilla) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(l / paso));
  const dx = (b[0] - a[0]) / n, dy = (b[1] - a[1]) / n, nx = dy / (l / n), ny = -dx / (l / n);
  let s = '';
  for (let i = 0; i < n; i++) {
    const k = amp * (0.6 + 0.8 * azar(semilla + i));
    s += ` Q${r1(a[0] + dx * (i + 0.5) + nx * k)} ${r1(a[1] + dy * (i + 0.5) + ny * k)} ${r1(a[0] + dx * (i + 1))} ${r1(a[1] + dy * (i + 1))}`;
  }
  return s;
}
function cubo() {
  let o = '';
  const esq = [cubo3(0, 0, 0), cubo3(1, 0, 0), cubo3(1, 1, 0), cubo3(1, 1, 1), cubo3(0, 1, 1), cubo3(0, 0, 1)];
  const pt = (p) => `${r1(p[0])} ${r1(p[1])}`;
  const hacia = (p, q, d) => { const l = Math.hypot(q[0] - p[0], q[1] - p[1]); return [p[0] + ((q[0] - p[0]) * d) / l, p[1] + ((q[1] - p[1]) * d) / l]; };
  // El borde de abajo (el nacimiento del pelo) va recto y marcado; los de afuera son mullidos, como de afro, y las tres
  // esquinas de arriba van redondeadas
  const R = 16;
  let silueta = `M${pt(esq[0])} L${pt(esq[1])} L${pt(esq[2])}`;
  const vuelta = [2, 3, 4, 5, 0];
  let actual = esq[2];
  for (let k = 0; k < 4; k++) {
    const a = esq[vuelta[k]], b = esq[vuelta[k + 1]], redonda = vuelta[k + 1] !== 0;
    const hasta = redonda ? hacia(b, a, R) : b;
    silueta += orilla(actual, hasta, 20, 9.5, 40 * k);
    if (redonda) { const sigue = hacia(b, esq[vuelta[k + 2]], R); silueta += ` Q${pt(b)} ${pt(sigue)}`; actual = sigue; }
    else actual = b;
  }
  silueta += ' Z';
  o += pieza(silueta, C.cuboI, [
    [contornoCara(CARAS.der), C.cuboD],
    [contornoCara(CARAS.arriba), C.cuboA],
    textura('izq', 0) + textura('der', 300) + textura('arriba', 600)
  ], { w: 6, peso: 2.4 });
  // Las aristas que se juntan en la esquina de adelante: suaves y también mullidas
  const e = cubo3(1, 0, 1), atras = hacia(esq[5], e, R), derecha = hacia(esq[3], e, R);
  o += B(`M${pt(atras)}${orilla(atras, e, 15, 2.6, 500)}${orilla(e, derecha, 15, 2.6, 520)}`, 2.6) +
    B(`M${pt(e)}${orilla(e, cubo3(1, 0, 0), 15, 2.6, 540)}`, 2.6);
  // Unos rulos sueltos que se escapan por arriba
  let sueltos = '';
  [[3, 4, 0.3], [3, 4, 0.7], [4, 5, 0.25], [4, 5, 0.62], [2, 3, 0.35]].forEach(([i, j, t], n) => {
    const a = esq[i], b = esq[j], x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
    const fuera = i === 2 ? [11, 0] : [0, -11];
    sueltos += rulo([x + fuera[0], y + fuera[1]], 4.6 + azar(n + 700) * 1.6, azar(n + 720) * 360, 1);
  });
  o += `<path d="${sueltos}" fill="none" stroke="${K}" stroke-width="2.8" stroke-linecap="round"/>`;
  return o;
}
// La peineta cian clavada en el techo del cubo: los dientes se hunden en el pelo
function peineta() {
  const [x, y] = cubo3(0.44, 0.78, 1);
  let o = `<g transform="translate(${r1(x)} ${r1(y)}) rotate(12)">`;
  o += `<ellipse cx="0" cy="1" rx="20" ry="4.4" fill="${C.peloS}" opacity=".9"/>`;
  for (const dx of [-14, -7, 0, 7, 14]) o += L(`M${dx} -22 L${dx} 0`, 5.4) + L(`M${dx} -22 L${dx} -1`, 2.4, C.cian);
  o += pieza('M-16 -20 L-16 -46 Q-16 -66 0 -68 Q16 -66 16 -46 L16 -20 Z', C.cian, [[pol([[4, -72], [22, -72], [22, -16], [6, -16]]), C.cianS]], { w: 4.4, peso: 1.2 });
  o += `<circle cx="0" cy="-46" r="6.4" fill="${K}"/>`;
  o += L('M-10 -50 Q-9 -59 -3 -62', 2.4, C.cianL);
  o += pieza(pol([[-19, -26], [19, -26], [19, -16], [-19, -16]]), C.cianS, [], { w: 3.8, peso: 0 });
  return o + `</g>`;
}

// ── Cabeza: cara chica y fina bajo el cubo, lentes grandes, nariz chica, el aro cian ──
// La coronilla queda en y ≈ 338 (388 con BAJA), escondida dentro del cubo (que sube unos 120 sobre ella)
const CARA = curva([[229, 354], [252, 341], [300, 337], [350, 339], [376, 348], [381, 368], [386, 388], [382, 406], [382, 426], [381, 444], [382, 458], [379, 468], [381, 477], [373, 491], [356, 501], [326, 499], [296, 485], [274, 468], [258, 452], [242, 430], [232, 400], [228, 366]], true);
function cuello() {
  // El cuello de la chaqueta por detrás, y el cuello de ella, delgado
  return pieza(pol([[260, 496], [344, 496], [350, 522], [254, 522]]), C.chaqS, [], { w: 5, peso: 0 }) +
    pieza(pol([[250, 430], [324, 462], [332, 516], [272, 516], [262, 470]]), C.piel, [[pol([[240, 420], [340, 420], [340, 484], [240, 496]]), C.pielS], [pol([[316, 476], [344, 476], [344, 520], [320, 520]]), C.pielS]]);
}
function cabeza() {
  let o = '';
  const a = cubo3(1, 0, 0), b = cubo3(1, 1, 0);
  // La cara: el cubo le tira una sombra dura sobre la frente
  o += pieza(CARA, C.piel, [
    [pol([[364, 330], [400, 330], [400, 512], [300, 512], [350, 494], [366, 470], [372, 430], [370, 396]]), C.pielS],
    [pol([[a[0] - 12, a[1] - 8], [b[0] + 12, b[1] - 8], [b[0] + 12, b[1] + 7], [a[0] - 12, a[1] + 8]]), C.pielS]
  ]);
  // La nuca y los costados al ras bajo el cubo, con la patilla marcada delante de la oreja
  const idC = nuevoId();
  const zonaRapada = pol([[214, 330], [300, 330], [282, 366], [272, 372], [270, 400], [258, 398], [246, 404], [240, 430], [250, 450], [214, 450]]);
  const idR = nuevoId();
  let puntos = '';
  for (let i = 0; i < 30; i++) puntos += `<circle cx="${r1(226 + azar(i + 900) * 50)}" cy="${r1(356 + azar(i + 950) * 90)}" r="1.3" fill="${C.rapadoL}"/>`;
  o += `<clipPath id="${idC}"><path d="${CARA}"/></clipPath><clipPath id="${idR}"><path d="${zonaRapada}"/></clipPath>` +
    `<g clip-path="url(#${idC})">${P(zonaRapada, C.rapado)}<g clip-path="url(#${idR})">${puntos}</g></g>` + B(CARA, 6);
  // Oreja, con el aro cian chico
  o += pieza(curva([[262, 402], [246, 396], [238, 414], [242, 436], [258, 444]], true), C.piel, [[pol([[236, 422], [256, 422], [256, 450], [236, 450]]), C.pielS]], { w: 4.6, peso: 1.4 });
  o += L('M252 408 Q244 420 249 434', 2.4);
  o += L('M250 444 L249 452', 2.4) + pieza(pol([[244, 452], [254, 452], [254, 462], [244, 462]]), C.cian, [[pol([[250, 448], [258, 448], [258, 466], [250, 466]]), C.cianS]], { w: 3, peso: 0.6 });
  // Boca: labios de su color, una media sonrisa cerrada que sube hacia la derecha
  o += pieza(curva([[338, 469], [352, 471], [368, 468], [376, 465], [372, 475], [358, 480], [344, 477]], true), C.labio, [[pol([[330, 475], [384, 475], [384, 486], [330, 486]]), C.labioS]], { w: 2.6, peso: 0 });
  o += P('M346 474 Q356 476 366 473 Q358 478 348 477 Z', C.labioL);
  o += pieza(curva([[337, 468], [348, 463], [356, 464], [362, 462], [372, 462], [377, 464], [366, 468], [350, 470]], true), C.labio, [], { w: 2.6, peso: 0 });
  o += L('M335 468 Q356 472 378 463', 3) + L('M377 464 Q382 460 382 455', 2.2);
  o += L('M352 487 Q360 489 368 486', 2);
  o += pincel([330, 448], [326, 455], [325, 462], [328, 469], 2);
  // Nariz chica, que apenas asoma del contorno: sólo su borde de afuera lleva tinta
  o += P(pol([[370, 432], [382, 436], [388, 444], [388, 451], [378, 454], [366, 452]]), C.piel);
  o += P(pol([[370, 449], [384, 448], [386, 453], [372, 455]]), C.pielS);
  o += B('M380 437 Q389 442 389 449 Q388 455 380 455', 3.8);
  o += L('M370 453 Q365 448 370 444', 2);
  o += negro(pol([[376, 450], [383, 450], [380, 454], [375, 454]]));
  // Ojos de párpado pesado: las pupilas chicas miran a la derecha
  for (const [x, y, w, h] of [[306, 419, 30, 15], [364, 416, 20, 13]]) {
    o += pieza(`M${x - w / 2} ${y} Q${x} ${y - h} ${x + w / 2} ${y} Q${x} ${y + h * 0.8} ${x - w / 2} ${y} Z`, C.ojo, [], { w: 3.2, peso: 0 });
    o += `<circle cx="${r1(x + w * 0.2)}" cy="${y + 1}" r="${r1(h * 0.3)}" fill="${K}"/>`;
    o += negro(`M${x - w / 2 - 3} ${y - 1} Q${x} ${y - h - 6} ${x + w / 2 + 4} ${y - 2} L${x + w / 2 + 2} ${r1(y - h * 0.12)} Q${x} ${r1(y - h * 0.58)} ${x - w / 2} ${y + 1} Z`);
  }
  o += L('M294 430 Q306 435 318 430', 2) + L('M358 426 Q365 429 372 426', 2);
  // Cejas negras y gruesas: la de adelante recta, la otra alzada (está segura)
  o += negro(curva([[283, 390], [296, 381], [314, 378], [330, 379], [331, 387], [314, 386], [298, 388]], true));
  o += negro(curva([[349, 386], [358, 377], [370, 372], [385, 374], [387, 380], [370, 379], [358, 383]], true));
  // Lentes cuadrados de marco grueso: en su cara chica se ven grandes
  const lenteI = 'M281 401 Q281 396 286 396 L330 396 Q335 396 335 401 L334 432 Q334 437 329 437 L287 437 Q282 437 282 432 Z';
  const lenteD = 'M347 398 Q347 393 352 393 L382 393 Q387 393 387 398 L386 428 Q386 433 381 433 L353 433 Q348 433 348 428 Z';
  for (const d of [lenteI, lenteD]) o += `<path d="${d}" fill="${C.vidrio}" opacity=".16"/>`;
  o += `<path d="M288 432 L308 400 M300 432 L316 406 M354 428 L370 397" fill="none" stroke="${C.blanco}" stroke-width="3.6" stroke-linecap="round" opacity=".3"/>`;
  o += B(lenteI, 7) + B(lenteD, 6.6);
  o += B('M335 412 Q341 406 347 410', 5.6);
  o += B('M281 405 L258 402', 6);
  // El afro en cubo y la peineta
  o += cubo() + peineta();
  return o;
}

export function celda({ prefijo = 'celda' } = {}) {
  reiniciar(prefijo);
  ID = prefijo;
  const defs = `<defs>${tela('torso')}${tela('mangaI')}${tela('mangaD')}` +
    `<filter id="${ID}-luz" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter></defs>`;
  return `<g>${defs}${zapatilla(250, -1)}${zapatilla(354, 1)}${piernas()}<g transform="translate(0 ${BAJA})">${brazoAtras()}${cuello()}${torso()}${brazoDelante()}${cabeza()}</g></g>`;
}

export const vista = () => lamina(celda());
