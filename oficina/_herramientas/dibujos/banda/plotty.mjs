// Plotty en la línea de la banda: el isotipo de BiPlot hecho bot. La cabeza es el cuadrado del isotipo (azul con el
// borde cian claro y los ejes en L), dentro de una carcasa blanca; la cara de LED se dibuja sobre esos ejes, como el
// gráfico del logo. Dos rotores (el «Bi»), la antena cian (el punto del logo, nunca coral), el cuello de fuelle y una
// barriga con el 0 de su placa E0. Saluda con una mano y con la otra muestra tres dedos: tres preguntas.
// Flota sobre su chorro de plasma, un poco ladeado. Marco 600 × 600, centrado.
import { K, P, B, L, pol, pieza, curva, miembro, pincel, reiniciar, nuevoId, r1, numeroChico } from './base.mjs';
import { NUMERO, lamina } from './tinta.mjs';

export const C = {
  carcasa: '#EEF2F6', carcasaS: '#B9C8D8',
  azul: '#1C426D', azulS: '#0D2642', eje: '#35679A',
  borde: '#7FD8CF', bordeS: '#47AFA4',
  cian: '#17C3B2', cianL: '#7FD8CF', cianS: '#0A8A7E', cianB: '#E9FFFC',
  metal: '#B9C8D8', metalS: '#8197AF', metalL: '#E1E9F1',
  motor: '#35679A', motorS: '#1F4673',
  cuello: '#17446F', cuelloS: '#0E2A47',
  led: '#24507E', estela: '#DDF4F1'
};
const GIRO = -5, CORRE = 10;                             // se ladea hacia la mano que saluda; se corre para quedar centrado
const claro = (trazo, color = C.estela) => trazo.replace(/fill="[^"]+"/, `fill="${color}"`);   // pincelada en color claro (sobre fondo oscuro)

// Cuadrado redondeado de lados apenas abombados (superelipse): la forma del isotipo, dibujada a mano
export function squircle(cx, cy, a, b, n = 4.4, N = 64) {
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    pts.push([cx + a * Math.sign(c) * Math.abs(c) ** (2 / n), cy + b * Math.sign(s) * Math.abs(s) ** (2 / n)]);
  }
  return curva(pts, true);
}
export const rr = (x, y, w, h, r) => `M${r1(x + r)} ${r1(y)} H${r1(x + w - r)} A${r} ${r} 0 0 1 ${r1(x + w)} ${r1(y + r)} V${r1(y + h - r)} A${r} ${r} 0 0 1 ${r1(x + w - r)} ${r1(y + h)} H${r1(x + r)} A${r} ${r} 0 0 1 ${r1(x)} ${r1(y + h - r)} V${r1(y + r)} A${r} ${r} 0 0 1 ${r1(x + r)} ${r1(y)} Z`;
export const circulo = (x, y, r) => `M${r1(x - r)} ${r1(y)} A${r} ${r} 0 1 1 ${r1(x + r)} ${r1(y)} A${r} ${r} 0 1 1 ${r1(x - r)} ${r1(y)} Z`;

// Geometría de la cabeza
export const CAB = { x: 300, y: 240, a: 170, b: 142 };          // carcasa
export const VID = { x: 300, y: 234, a: 132, b: 110 };          // vidrio de la pantalla (el isotipo)
// Del isotipo (caja de 4 a 96) a la pantalla
const IX = (u) => r1(VID.x - VID.a + ((u - 4) / 92) * VID.a * 2);
const IY = (v) => r1(VID.y - VID.b + ((v - 4) / 92) * VID.b * 2);

// ── La cara de LED: o encendido, w el brillo blanco del ojo, . apagado. Ojos abiertos y la media sonrisa ──
const CARA = [
  '............',
  '..wo....wo..',
  '..oo....oo..',
  '..oo....oo..',
  '............',
  '..........o.',
  '.o.......oo.',
  '.ooooooooo..',
  '..ooooooo...',
  '...oooo.....'
];

export function pantalla(idBrillo, cara = CARA) {
  let o = '';
  const vidrio = squircle(VID.x, VID.y, VID.a, VID.b);
  // El borde cian claro del isotipo, con su sombra abajo a la derecha
  const borde = squircle(VID.x, VID.y, VID.a + 11, VID.b + 11);
  o += pieza(borde, C.borde, [`<path d="${borde} ${squircle(VID.x - 7, VID.y - 7, VID.a + 11, VID.b + 11)}" fill="${C.bordeS}" fill-rule="evenodd"/>`], { w: 5, peso: 0 });
  // El vidrio azul: la diagonal del degradado del isotipo, en una sombra dura
  const idV = nuevoId();
  o += `<clipPath id="${idV}"><path d="${vidrio}"/></clipPath>`;
  o += P(vidrio, C.azul);
  o += `<g clip-path="url(#${idV})">`;
  o += P(pol([[VID.x + VID.a * 0.9, VID.y - VID.b - 10], [VID.x + VID.a + 20, VID.y - VID.b - 10], [VID.x + VID.a + 20, VID.y + VID.b + 20], [VID.x - VID.a * 0.6, VID.y + VID.b + 20]]), C.azulS);
  // Los ejes en L del isotipo
  o += L(`M${IX(27)} ${IY(23)} V${IY(75)} H${IX(80)}`, 8, C.eje);
  // La matriz de LED en el cuadrante del gráfico
  const filas = cara.length, cols = cara[0].length;
  const x0 = IX(27) + 9, x1 = IX(80) + 4, y0 = IY(23) - 4, y1 = IY(75) - 10;
  const px = (x1 - x0) / cols, py = (y1 - y0) / filas, lado = Math.min(px, py) * 0.8;
  let apagados = '', prendidos = '', blancos = '';
  for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) {
    const ch = cara[f][c], x = r1(x0 + c * px + (px - lado) / 2), y = r1(y0 + f * py + (py - lado) / 2);
    const r = `<rect x="${x}" y="${y}" width="${r1(lado)}" height="${r1(lado)}" rx="2.6"/>`;
    if (ch === 'o') prendidos += r; else if (ch === 'w') blancos += r; else apagados += r;
  }
  o += `<g fill="${C.led}" opacity=".55">${apagados}</g>`;
  o += `<g fill="${C.cian}" filter="url(#${idBrillo})" opacity=".9">${prendidos}${blancos}</g>`;
  o += `<g fill="${C.cian}">${prendidos}</g><g fill="${C.cianB}">${blancos}</g>`;
  // El reflejo del vidrio: dos franjas diagonales arriba a la izquierda
  o += P(pol([[VID.x - VID.a - 10, VID.y - 30], [VID.x - 30, VID.y - VID.b - 10], [VID.x - 4, VID.y - VID.b - 10], [VID.x - VID.a - 10, VID.y + 2]]), '#FFFFFF', ' opacity=".10"');
  o += P(pol([[VID.x - VID.a - 10, VID.y + 22], [VID.x + 14, VID.y - VID.b - 10], [VID.x + 30, VID.y - VID.b - 10], [VID.x - VID.a - 10, VID.y + 42]]), '#FFFFFF', ' opacity=".07"');
  o += `</g>`;
  o += B(vidrio, 5);
  o += L(`M${VID.x - VID.a + 20} ${VID.y - VID.b + 44} Q${VID.x - VID.a + 26} ${VID.y - VID.b + 18} ${VID.x - VID.a + 56} ${VID.y - VID.b + 10}`, 4.4, '#FFFFFF');
  return o;
}

// ── La carcasa blanca: el marco del isotipo, con tornillos, la luz de encendido, la rejilla y algún raspón ──
export function carcasa() {
  let o = '';
  const d = squircle(CAB.x, CAB.y, CAB.a, CAB.b);
  const sombra = `<path d="${d} ${squircle(CAB.x - 22, CAB.y - 20, CAB.a, CAB.b)}" fill="${C.carcasaS}" fill-rule="evenodd"/>`;
  o += pieza(d, C.carcasa, [sombra]);
  // Tornillos en las esquinas del marco
  for (const [x, y] of [[CAB.x - CAB.a + 25, CAB.y - CAB.b + 25], [CAB.x + CAB.a - 25, CAB.y - CAB.b + 25], [CAB.x - CAB.a + 25, CAB.y + CAB.b - 25], [CAB.x + CAB.a - 25, CAB.y + CAB.b - 25]]) {
    o += `<circle cx="${x}" cy="${y}" r="6" fill="${C.metal}" stroke="${K}" stroke-width="2.6"/>` + L(`M${x - 3.4} ${y + 2} L${x + 3.4} ${y - 2}`, 2);
  }
  // La luz de encendido, abajo
  o += `<circle cx="${CAB.x + 92}" cy="${CAB.y + CAB.b - 16}" r="5.5" fill="${C.cian}" stroke="${K}" stroke-width="2.6"/>`;
  // Rejilla de ventilación en el costado de la sombra
  for (let i = 0; i < 3; i++) o += L(`M${CAB.x + CAB.a - 13} ${CAB.y - 28 + i * 15} L${CAB.x + CAB.a - 4} ${CAB.y - 30 + i * 15}`, 3.4);
  // Raspones
  o += pincel([CAB.x - CAB.a + 13, CAB.y + 34], [CAB.x - CAB.a + 16, CAB.y + 46], [CAB.x - CAB.a + 16, CAB.y + 56], [CAB.x - CAB.a + 13, CAB.y + 64], 2.4);
  o += pincel([CAB.x - 70, CAB.y - CAB.b + 12], [CAB.x - 56, CAB.y - CAB.b + 9], [CAB.x - 40, CAB.y - CAB.b + 9], [CAB.x - 28, CAB.y - CAB.b + 11], 2.2);
  return o;
}

// ── Un rotor: el brazo que sale de la esquina, el motor y la hélice de dos palas girando ──
export function pala(e) {
  // Una pala a lo largo de +x, achatada por la perspectiva
  return curva([[6, -2.6 * e], [34, -7 * e], [64, -7.4 * e], [82, -3 * e], [84, 1 * e], [66, 5.6 * e], [36, 6 * e], [6, 3 * e]], true);
}
export function rotor(lado) {
  let o = '';
  const s = lado, X = (x) => CAB.x + s * x;
  const hx = X(190), hy = 86, cy = hy - 20;
  // Las estelas del giro, por detrás
  const arco = (a1, a2, rx, ry) => `M${r1(hx + rx * Math.cos(a1))} ${r1(cy + ry * Math.sin(a1))} A${rx} ${ry} 0 0 ${a2 > a1 ? 1 : 0} ${r1(hx + rx * Math.cos(a2))} ${r1(cy + ry * Math.sin(a2))}`;
  o += `<path d="${arco(3.5, 4.6, 88, 17)} ${arco(5.3, 6.1, 88, 17)}" fill="none" stroke="${C.estela}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
  // Brazo
  const brazo = miembro([[X(122), 140], [X(184), 94]], [24, 18], { punta: 'plana' });
  o += pieza(brazo, C.metal, [[pol([[X(122), 144], [X(190), 98], [X(190), 130], [X(122), 176]]), C.metalS]], { w: 5, peso: 1.6 });
  // Motor: un cilindro con su tapa
  o += pieza(`M${hx - 24} ${hy - 6} L${hx + 24} ${hy - 6} L${hx + 22} ${hy + 20} Q${hx} ${hy + 28} ${hx - 22} ${hy + 20} Z`, C.motor, [[pol([[hx + 4, hy - 10], [hx + 30, hy - 10], [hx + 30, hy + 32], [hx + 4, hy + 32]]), C.motorS]], { w: 5, peso: 1.4 });
  o += pieza(`M${hx - 24} ${hy - 6} A24 8 0 1 1 ${hx + 24} ${hy - 6} A24 8 0 1 1 ${hx - 24} ${hy - 6} Z`, C.metalL, [], { w: 4.4, peso: 0 });
  o += pieza(pol([[hx - 5, cy + 2], [hx + 5, cy + 2], [hx + 5, hy - 8], [hx - 5, hy - 8]]), C.metal, [], { w: 3.4, peso: 0 });
  // Las dos palas, a medio giro (una hacia adelante, la otra hacia atrás)
  const giro = s < 0 ? 8 : -10;
  for (const a of [giro, 180 + giro]) {
    o += `<g transform="translate(${hx} ${cy}) rotate(${a}) scale(1 ${a > 90 ? 0.8 : 1})">${pieza(pala(1), C.metal, [[pol([[0, 1], [90, 0], [90, 10], [0, 10]]), C.metalS]], { w: 3.8, peso: 0 })}</g>`;
  }
  o += pieza(circulo(hx, cy, 8), C.metalL, [], { w: 3.6, peso: 0 });
  // Las estelas del giro, por delante
  o += `<path d="${arco(0.5, 1.5, 90, 18)} ${arco(1.9, 2.7, 90, 18)}" fill="none" stroke="${C.estela}" stroke-width="3.6" stroke-linecap="round" opacity=".85"/>`;
  return o;
}

// ── La antena: sale de la carcasa y termina en el punto del logo, en cian ──
export function antena(idBrillo) {
  let o = '';
  const base = [336, CAB.y - CAB.b + 4], tope = [350, 44];
  o += pieza(`M${base[0] - 18} ${base[1] + 2} Q${base[0]} ${base[1] - 22} ${base[0] + 18} ${base[1] + 2} Z`, C.metal, [[pol([[base[0] + 2, base[1] - 30], [base[0] + 30, base[1] - 30], [base[0] + 30, base[1] + 6], [base[0] + 2, base[1] + 6]]), C.metalS]], { w: 4.4, peso: 1 });
  const tallo = `M${base[0]} ${base[1] - 14} C${base[0] + 2} ${base[1] - 50} ${tope[0] - 6} ${tope[1] + 40} ${tope[0]} ${tope[1] + 14}`;
  o += B(tallo, 12) + B(tallo, 5, C.metal);
  o += `<circle cx="${tope[0]}" cy="${tope[1]}" r="30" fill="${C.cian}" opacity=".5" filter="url(#${idBrillo})"/>`;
  o += pieza(circulo(tope[0], tope[1], 17), C.cian, [[`<path d="M${tope[0] - 30} ${tope[1] + 6} Q${tope[0] + 4} ${tope[1] + 4} ${tope[0] + 14} ${tope[1] - 22} L${tope[0] + 30} ${tope[1] - 30} L${tope[0] + 30} ${tope[1] + 30} L${tope[0] - 30} ${tope[1] + 30} Z" fill="${C.cianS}"/>`]], { w: 4.6, peso: 1.2 });
  o += `<circle cx="${tope[0] - 6}" cy="${tope[1] - 6}" r="5" fill="${C.cianB}"/>`;
  return o;
}

// ── El cuello de fuelle, la barriga con el 0 de la placa y, abajo, la tobera con el chorro de plasma ──
export function cuerpo(idBrillo, idCono) {
  let o = '';
  // El chorro de luz hasta el suelo
  o += P(pol([[288, 548], [312, 548], [362, 600], [238, 600]]), `url(#${idCono})`);
  // Cuello de fuelle: tres anillos que bajan de la carcasa a la barriga
  for (let i = 2; i >= 0; i--) {
    const y = CAB.y + CAB.b - 18 + i * 14, w = 70 - i * 4;
    o += pieza(rr(300 - w / 2, y, w, 18, 8), C.cuello, [[pol([[312, y - 4], [340, y - 4], [340, y + 24], [312, y + 24]]), C.cuelloS]], { w: 4.2, peso: 0.8 });
  }
  // Barriga redonda, como una camiseta con el número
  const pts = [[246, 426], [300, 418], [354, 426], [380, 454], [372, 496], [300, 522], [228, 496], [220, 454]];
  const barriga = curva(pts, true), corrida = curva(pts.map(([x, y]) => [x - 16, y - 14]), true);
  o += pieza(barriga, C.carcasa, [`<path d="${barriga} ${corrida}" fill="${C.carcasaS}" fill-rule="evenodd"/>`]);
  o += numeroChico(`<text x="297" y="497" text-anchor="middle" font-family="${NUMERO}" font-size="70" fill="${C.cian}" stroke="${K}" stroke-width="5.5" paint-order="stroke" transform="rotate(-3 297 470)">0</text>`, 297, 472, 0.72);
  // La llama de plasma, que sale de la tobera
  o += `<ellipse cx="300" cy="554" rx="26" ry="30" fill="${C.cian}" opacity=".8" filter="url(#${idBrillo})"/>`;
  o += P('M285 536 Q285 556 300 580 Q315 556 315 536 Z', C.cian);
  o += P('M292 536 Q292 551 300 567 Q308 551 308 536 Z', C.cianB);
  // La tobera, con su labio de metal
  o += pieza('M276 514 L324 514 L318 534 L282 534 Z', C.cuello, [[pol([[304, 510], [332, 510], [332, 540], [306, 540]]), C.cuelloS]], { w: 4.6, peso: 0 });
  o += pieza('M278 532 L322 532 Q324 540 318 542 L282 542 Q276 540 278 532 Z', C.metal, [[pol([[306, 528], [330, 528], [330, 546], [308, 546]]), C.metalS]], { w: 4, peso: 0 });
  return o;
}

// ── Las manos flotantes: guantes de tres dedos y pulgar, con su puño cian ──
function dedo(x0, y0, ang, largo, ancho = 17) {
  const t = (ang * Math.PI) / 180, u = [Math.sin(t), -Math.cos(t)], n = [Math.cos(t), Math.sin(t)];
  const x1 = x0 + u[0] * largo, y1 = y0 + u[1] * largo, k = ancho * 0.08, e = ancho;
  const d = miembro([[x0, y0], [x1, y1]], [ancho, ancho - 1], { punta: 'redonda' });
  const sombra = pol([[x0 + n[0] * k - u[0] * 6, y0 + n[1] * k - u[1] * 6], [x1 + n[0] * k + u[0] * e, y1 + n[1] * k + u[1] * e], [x1 + n[0] * e + u[0] * e, y1 + n[1] * e + u[1] * e], [x0 + n[0] * e - u[0] * 6, y0 + n[1] * e - u[1] * 6]]);
  return pieza(d, C.carcasa, [[sombra, C.carcasaS]], { w: 4.2, peso: 1 });
}
function palma() {
  const d = curva([[-26, -14], [0, -20], [26, -14], [30, 8], [20, 28], [-20, 28], [-30, 8]], true);
  return pieza(d, C.carcasa, [[pol([[8, -30], [40, -30], [40, 40], [0, 40]]), C.carcasaS]], { w: 4.6, peso: 1.4 });
}
function puno() {
  return pieza('M-22 24 L22 24 L20 40 L-20 40 Z', C.cian, [[pol([[6, 18], [30, 18], [30, 46], [8, 46]]), C.cianS]], { w: 4.2, peso: 1 });
}
function manoHola() {
  let o = puno();
  o += dedo(-16, -6, -26, 40) + dedo(0, -10, -3, 44) + dedo(16, -6, 20, 40);
  o += dedo(-20, 8, -48, 32, 16);
  o += palma();
  o += L('M-12 -8 L-9 -1 M2 -11 L3 -4 M14 -8 L12 -1', 2.2);
  return o;
}
function manoTres() {
  let o = puno();
  o += dedo(-15, -8, -8, 42) + dedo(0, -10, 0, 46) + dedo(15, -8, 8, 42);
  o += palma();
  // El pulgar doblado sobre la palma
  o += pieza(curva([[-28, 2], [-4, -2], [12, 2], [12, 12], [-4, 16], [-28, 14]], true), C.carcasa, [[pol([[-2, 8], [20, 8], [20, 24], [-2, 24]]), C.carcasaS]], { w: 4, peso: 0.8 });
  o += L('M-14 26 Q0 30 14 26', 2.2);
  return o;
}

export function plotty({ prefijo = 'plotty' } = {}) {
  reiniciar(prefijo);
  const idBrillo = nuevoId(), idCono = nuevoId();
  const defs = `<defs><filter id="${idBrillo}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>` +
    `<linearGradient id="${idCono}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cian}" stop-opacity=".5"/><stop offset="1" stop-color="${C.cian}" stop-opacity="0"/></linearGradient></defs>`;
  // Dónde cae el chorro: bajo la tobera, ya ladeada
  const g = (GIRO * Math.PI) / 180, sx = r1(300 + CORRE - 250 * Math.sin(g));
  let o = defs;
  // La sombra en el suelo y la luz del chorro
  o += `<ellipse cx="${sx}" cy="584" rx="92" ry="9" fill="${K}" opacity=".45"/><ellipse cx="${sx}" cy="582" rx="64" ry="7" fill="${C.cian}" opacity=".3"/>`;
  let bot = cuerpo(idBrillo, idCono);
  bot += rotor(-1) + rotor(1);
  bot += antena(idBrillo);
  bot += carcasa();
  bot += pantalla(idBrillo);
  // La mano que saluda, con su estela, y la de los tres dedos
  bot += `<g transform="translate(80 258) rotate(-16)">${manoHola()}</g>`;
  bot += claro(pincel([30, 214], [24, 230], [24, 248], [28, 264], 4)) + claro(pincel([122, 186], [134, 194], [140, 206], [142, 220], 3.4));
  bot += `<g transform="translate(522 372) rotate(8)">${manoTres()}</g>`;
  o += `<g transform="translate(${CORRE} 0) rotate(${GIRO} 300 300)">${bot}</g>`;
  return `<g>${o}</g>`;
}

export const vista = () => lamina(plotty(), { alto: 600 });
