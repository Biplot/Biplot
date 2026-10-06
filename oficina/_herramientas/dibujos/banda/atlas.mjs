// Atlas en la línea de la banda: la mascota de The Architect. Un orbe de vidrio con dos anillos en órbita, un globo de
// líneas adentro (meridianos y paralelos) y un corazón de plasma cian que brilla y lanza sus filamentos contra el
// vidrio. Lleva un visor como el de The Architect, de vidrio oscuro, con dos ojos de lente de párpado pesado y pupila
// chica: habla poco y mira mucho. Del anillo de abajo cuelga su placa, 360°. Flota. Marco 600 × 600, centrado.
import { K, P, B, L, pol, pieza, curva, reiniciar, nuevoId, r1 } from './base.mjs';
import { NUMERO, lamina } from './tinta.mjs';

export const C = {
  vidrio: '#174B73', vidrioS: '#0C2B48', borde: '#7FD8CF',
  linea: '#7FD8CF',
  cian: '#17C3B2', cianL: '#7FD8CF', cianS: '#0A8A7E', plasmaL: '#BDF5EE', plasmaB: '#F2FFFD',
  visor: '#0A1B2E', visorL: '#1B3556', lente: '#0C3A44', parpado: '#13294A',
  anillo: '#B9C8D8', anilloS: '#7F93A8', anilloL: '#E1E9F1',
  sat: '#35679A', satS: '#1F4673',
  placa: '#F2F4F7', placaS: '#C4D2E0', azul: '#0E2A47'
};
export const O = { x: 300, y: 292, r: 164 };                   // el orbe
export const G = { x: 300, y: 338, r: 108, eje: 18, alto: 16 }; // el globo de líneas: radio, inclinación del eje y elevación
export const rad = (g) => (g * Math.PI) / 180;
export const circulo = (x, y, r) => `M${r1(x - r)} ${r1(y)} A${r} ${r} 0 1 1 ${r1(x + r)} ${r1(y)} A${r} ${r} 0 1 1 ${r1(x - r)} ${r1(y)} Z`;
// Elipse centrada en (x, y); el sentido importa para que un anillo quede hueco
export const elipse = (x, y, rx, ry, horario = true) => `M${r1(x - rx)} ${r1(y)} A${r1(rx)} ${r1(ry)} 0 1 ${horario ? 1 : 0} ${r1(x + rx)} ${r1(y)} A${r1(rx)} ${r1(ry)} 0 1 ${horario ? 1 : 0} ${r1(x - rx)} ${r1(y)} Z`;
// Medio arco de una elipse: 'arriba' o 'abajo' (con y hacia abajo), 'izq' o 'der'
export function medio(x, y, rx, ry, lado) {
  if (lado === 'abajo') return `M${r1(x - rx)} ${r1(y)} A${r1(rx)} ${r1(ry)} 0 0 0 ${r1(x + rx)} ${r1(y)}`;
  if (lado === 'arriba') return `M${r1(x - rx)} ${r1(y)} A${r1(rx)} ${r1(ry)} 0 0 1 ${r1(x + rx)} ${r1(y)}`;
  if (lado === 'der') return `M${r1(x)} ${r1(y - ry)} A${r1(rx)} ${r1(ry)} 0 0 1 ${r1(x)} ${r1(y + ry)}`;
  return `M${r1(x)} ${r1(y - ry)} A${r1(rx)} ${r1(ry)} 0 0 0 ${r1(x)} ${r1(y + ry)}`;
}
// Azar fijo (siempre el mismo dibujo)
const azar = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ── Los anillos: un tubo de metal en elipse. Se dibuja en dos mitades: la de atrás (detrás del orbe) y la de adelante ──
export const ANILLOS = [
  { x: 300, y: 326, rx: 264, ry: 46, giro: -9, t: 17 },
  { x: 300, y: 316, rx: 214, ry: 102, giro: 12, t: 10 }
];
export function anillo(a, mitad) {
  const { rx, ry, t } = a;
  const banda = elipse(0, 0, rx + t / 2, ry + t / 2, true) + ' ' + elipse(0, 0, rx - t / 2, ry - t / 2, false);
  const corrida = elipse(0, -t * 0.42, rx + t / 2, ry + t / 2, true) + ' ' + elipse(0, -t * 0.42, rx - t / 2, ry - t / 2, false);
  const idM = nuevoId(), m = rx + t + 30;
  const corte = `<clipPath id="${idM}"><rect x="${-m}" y="${mitad === 'atras' ? -m : 0}" width="${2 * m}" height="${m}"/></clipPath>`;
  const brillo = mitad === 'adelante' ? L(medio(0, -t * 0.12, rx, ry, 'abajo'), 2.4, C.anilloL) : '';
  return `<g transform="translate(${a.x} ${a.y}) rotate(${a.giro})">${corte}<g clip-path="url(#${idM})">` +
    pieza(banda, C.anillo, [`<path d="${banda} ${corrida}" fill="${C.anilloS}" fill-rule="evenodd"/>`, brillo], { w: 4.4, peso: 1.2 }) + `</g></g>`;
}
// Un satélite en la punta del anillo grande: una bolita con su luz cian
export function satelite(x, y) {
  let o = '';
  o += pieza(circulo(x, y, 20), C.sat, [`<path d="${circulo(x, y, 20)} ${circulo(x - 6, y - 6, 20)}" fill="${C.satS}" fill-rule="evenodd"/>`], { w: 4.4, peso: 1.2 });
  o += `<circle cx="${x + 2}" cy="${y + 1}" r="7.5" fill="${C.cian}" stroke="${K}" stroke-width="2.6"/><circle cx="${x - 0.5}" cy="${y - 1.5}" r="2.6" fill="${C.plasmaB}"/>`;
  o += L(`M${x - 13} ${y - 8} Q${x - 9} ${y - 14} ${x - 2} ${y - 16}`, 2.6, C.anilloL);
  return o;
}

// ── El globo de líneas: paralelos y meridianos sobre un eje inclinado; los arcos de adelante, más claros ──
export function globo() {
  const el = rad(G.alto);
  let atras = '', adelante = '';
  for (const lat of [-60, -30, 0, 30, 60]) {
    const cy = -G.r * Math.sin(rad(lat)) * Math.cos(el), rx = G.r * Math.cos(rad(lat)), ry = rx * Math.sin(el);
    atras += medio(0, cy, rx, ry, 'arriba') + ' ';
    adelante += medio(0, cy, rx, ry, 'abajo') + ' ';
  }
  for (const lon of [30, 60]) {
    const rx = G.r * Math.sin(rad(lon));
    adelante += medio(0, 0, rx, G.r, 'der') + ' ' + medio(0, 0, rx, G.r, 'izq') + ' ';
  }
  adelante += `M0 ${-G.r} L0 ${G.r}`;
  return `<g transform="translate(${G.x} ${G.y}) rotate(${G.eje})">` +
    `<path d="${atras}" fill="none" stroke="${C.linea}" stroke-width="2.2" opacity=".38"/>` +
    `<path d="${adelante}" fill="none" stroke="${C.linea}" stroke-width="2.8" opacity=".8" stroke-linecap="round"/>` +
    `<circle r="${G.r}" fill="none" stroke="${C.linea}" stroke-width="3.4" opacity=".85"/>` +
    `<circle cx="0" cy="${r1(-G.r * Math.cos(el))}" r="4" fill="${C.linea}"/><circle cx="0" cy="${r1(G.r * Math.cos(el))}" r="4" fill="${C.linea}" opacity=".6"/></g>`;
}

// ── El corazón de plasma: el halo, los filamentos que buscan el vidrio y el núcleo ──
function rayo(ang, semilla) {
  const pts = [], n = 8, r0 = 22, rf = O.r - 8;
  let a = rad(ang);
  for (let i = 0; i <= n; i++) {
    const r = r0 + ((rf - r0) * i) / n;
    if (i > 0 && i < n) a += (azar(semilla * 10 + i) - 0.5) * 0.34;
    pts.push([G.x + r * Math.cos(a), G.y + r * Math.sin(a)]);
  }
  const d = 'M' + pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join(' L');
  const fin = pts[n];
  return { d, fin };
}
export function plasma(idBrillo, idHalo) {
  let o = '';
  o += `<circle cx="${G.x}" cy="${G.y}" r="78" fill="${C.cian}" opacity=".75" filter="url(#${idHalo})"/>`;
  const rayos = [[200, 1], [238, 2], [292, 3], [322, 4], [12, 5], [52, 6], [96, 7], [140, 8]].map(([a, s]) => rayo(a, s));
  const todos = rayos.map((r) => r.d).join(' ');
  o += `<path d="${todos}" fill="none" stroke="${C.cian}" stroke-width="7" opacity=".7" filter="url(#${idBrillo})"/>`;
  o += `<path d="${todos}" fill="none" stroke="${C.plasmaL}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
  for (const r of rayos) o += `<circle cx="${r1(r.fin[0])}" cy="${r1(r.fin[1])}" r="7" fill="${C.cian}" opacity=".8" filter="url(#${idBrillo})"/><circle cx="${r1(r.fin[0])}" cy="${r1(r.fin[1])}" r="3" fill="${C.plasmaB}"/>`;
  // El núcleo: una estrella de plasma con el centro blanco
  const pts = [];
  for (let i = 0; i < 14; i++) { const a = rad(i * (360 / 14) + 6), r = i % 2 ? 22 : 33 + azar(i) * 6; pts.push([G.x + r * Math.cos(a), G.y + r * Math.sin(a)]); }
  o += P(curva(pts, true), C.cian);
  o += `<circle cx="${G.x}" cy="${G.y}" r="17" fill="${C.plasmaB}"/>`;
  return o;
}

// ── El orbe de vidrio: el azul, su sombra dura, el globo, el plasma, el reflejo y el contorno ──
export function orbe(idBrillo, idHalo) {
  const d = circulo(O.x, O.y, O.r);
  const sombra = `<path d="${d} ${circulo(O.x - 30, O.y - 28, O.r)}" fill="${C.vidrioS}" fill-rule="evenodd"/>`;
  // Luz de borde abajo a la derecha (el plasma rebota en el vidrio)
  const luzBorde = `<path d="${d} ${circulo(O.x - 9, O.y - 9, O.r)}" fill="${C.borde}" fill-rule="evenodd" opacity=".55"/>`;
  // El reflejo: una media luna blanca arriba a la izquierda y un punto
  const a1 = rad(196), a2 = rad(262), ri = O.r - 14, re = O.r - 30;
  const reflejo = `M${r1(O.x + ri * Math.cos(a1))} ${r1(O.y + ri * Math.sin(a1))} A${ri} ${ri} 0 0 1 ${r1(O.x + ri * Math.cos(a2))} ${r1(O.y + ri * Math.sin(a2))} ` +
    `Q${r1(O.x + (re - 6) * Math.cos(rad(232)))} ${r1(O.y + (re - 6) * Math.sin(rad(232)))} ${r1(O.x + ri * Math.cos(a1))} ${r1(O.y + ri * Math.sin(a1))} Z`;
  const brillos = P(reflejo, '#FFFFFF', ' opacity=".85"') + `<circle cx="${r1(O.x + (O.r - 30) * Math.cos(rad(241)))}" cy="${r1(O.y + (O.r - 30) * Math.sin(rad(241)))}" r="7" fill="#FFFFFF" opacity=".9"/>`;
  return pieza(d, C.vidrio, [sombra, globo(), plasma(idBrillo, idHalo), luzBorde, brillos], { w: 6.5 });
}

// ── El visor: envuelve el orbe como el de The Architect, de vidrio oscuro. Adentro, dos ojos de lente con el párpado
// mecánico pesado y la pupila chica, que miran de reojo hacia la izquierda ──
export function ojo(x, y, r, idBrillo, mirada = [-0.3, 0.2]) {
  let o = '';
  const lente = `M${x - r} ${y} A${r} ${r} 0 1 1 ${x + r} ${y} A${r} ${r} 0 1 1 ${x - r} ${y} Z`;
  // El bisel de metal
  o += pieza(`M${x - r - 6} ${y} A${r + 6} ${r + 6} 0 1 1 ${x + r + 6} ${y} A${r + 6} ${r + 6} 0 1 1 ${x - r - 6} ${y} Z`, C.anilloS, [], { w: 4, peso: 0 });
  // La lente: iris cian y pupila blanca chica, corridos a la izquierda y abajo
  const idL = nuevoId(), px = x + r * mirada[0], py = y + r * mirada[1];
  o += `<clipPath id="${idL}"><path d="${lente}"/></clipPath><g clip-path="url(#${idL})">`;
  o += P(lente, C.lente);
  o += `<circle cx="${px}" cy="${py}" r="${r * 0.62}" fill="${C.cian}" opacity=".9" filter="url(#${idBrillo})"/>`;
  o += `<circle cx="${px}" cy="${py}" r="${r * 0.5}" fill="${C.cian}"/><circle cx="${px}" cy="${py}" r="${r * 0.2}" fill="${C.plasmaB}"/>`;
  // El párpado: tapa media lente, con el borde apenas inclinado
  o += P(`M${x - r - 4} ${y - r - 4} H${x + r + 4} V${y - r * 0.26} Q${x} ${y - r * 0.08} ${x - r - 4} ${y - r * 0.16} Z`, C.parpado);
  o += `</g>`;
  o += B(lente, 4);
  o += L(`M${x - r - 3} ${y - r * 0.16} Q${x} ${y - r * 0.08} ${x + r + 3} ${y - r * 0.26}`, 5.5);
  return o;
}
export function visor(idBrillo, mirada) {
  let o = '';
  const d = curva([[142, 236], [214, 198], [300, 184], [386, 198], [458, 236], [462, 264], [386, 274], [300, 278], [214, 274], [138, 264]], true);
  o += pieza(d, C.visor, [[pol([[120, 180], [480, 180], [480, 222], [120, 240]]), C.visorL]], { w: 5.5, peso: 1.6 });
  // Las franjas de brillo del visor, como en el de The Architect
  const idV = nuevoId();
  o += `<clipPath id="${idV}"><path d="${d}"/></clipPath><g clip-path="url(#${idV})">`;
  o += P(pol([[392, 180], [412, 180], [384, 300], [364, 300]]), '#FFFFFF', ' opacity=".16"') + P(pol([[420, 180], [428, 180], [400, 300], [392, 300]]), '#FFFFFF', ' opacity=".12"');
  o += `</g>`;
  o += ojo(250, 234, 25, idBrillo, mirada) + ojo(346, 234, 25, idBrillo, mirada);
  // Remaches de las bisagras
  for (const [x, y] of [[156, 250], [444, 250]]) o += `<circle cx="${x}" cy="${y}" r="5.5" fill="${C.anillo}" stroke="${K}" stroke-width="2.4"/>`;
  return o;
}

// ── La placa 360°, colgando del anillo de abajo ──
export function placa() {
  const a = ANILLOS[1], g = rad(a.giro);
  const px = r1(a.x - a.ry * Math.sin(g)), py = r1(a.y + a.ry * Math.cos(g) + a.t / 2);
  let o = '';
  o += `<ellipse cx="${px}" cy="${py + 4}" rx="7" ry="10" fill="none" stroke="${K}" stroke-width="7"/><ellipse cx="${px}" cy="${py + 4}" rx="7" ry="10" fill="none" stroke="${C.anillo}" stroke-width="3"/>`;
  const x = px, y = py + 12;
  o += `<g transform="rotate(-6 ${x} ${y})">`;
  o += pieza(`M${x - 48} ${y + 4} Q${x - 48} ${y} ${x - 44} ${y} H${x + 44} Q${x + 48} ${y} ${x + 48} ${y + 4} V${y + 40} Q${x + 48} ${y + 44} ${x + 44} ${y + 44} H${x - 44} Q${x - 48} ${y + 44} ${x - 48} ${y + 40} Z`, C.placa, [[pol([[x + 26, y - 4], [x + 54, y - 4], [x + 54, y + 50], [x + 30, y + 50]]), C.placaS]], { w: 4.4, peso: 1.2 });
  o += `<circle cx="${x}" cy="${y + 6}" r="2.6" fill="${K}"/>`;
  o += `<text x="${x}" y="${y + 37}" text-anchor="middle" font-family="${NUMERO}" font-size="27" fill="${C.azul}">360°</text>`;
  o += `</g>`;
  return o;
}

export function atlas({ prefijo = 'atlas' } = {}) {
  reiniciar(prefijo);
  const idBrillo = nuevoId(), idHalo = nuevoId();
  let o = `<defs><filter id="${idBrillo}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>` +
    `<filter id="${idHalo}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter></defs>`;
  // La sombra en el suelo y el reflejo cian del corazón
  o += `<ellipse cx="300" cy="580" rx="112" ry="10" fill="${K}" opacity=".45"/><ellipse cx="300" cy="578" rx="72" ry="7" fill="${C.cian}" opacity=".24"/>`;
  // El resplandor del orbe
  o += `<circle cx="${O.x}" cy="${O.y}" r="${O.r + 6}" fill="${C.cian}" opacity=".22" filter="url(#${idHalo})"/>`;
  o += anillo(ANILLOS[1], 'atras') + anillo(ANILLOS[0], 'atras');
  o += orbe(idBrillo, idHalo);
  o += visor(idBrillo);
  o += anillo(ANILLOS[1], 'adelante') + anillo(ANILLOS[0], 'adelante');
  const a = ANILLOS[0], g = rad(a.giro);
  for (const s of [-1, 1]) o += satelite(r1(a.x + s * a.rx * Math.cos(g)), r1(a.y + s * a.rx * Math.sin(g)));
  o += placa();
  return `<g>${o}</g>`;
}

export const vista = () => lamina(atlas(), { alto: 600 });
