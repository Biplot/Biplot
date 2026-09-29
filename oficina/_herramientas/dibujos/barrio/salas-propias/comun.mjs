// Piezas comunes de las salas propias de Fundos, Haru, Eleven y Rumbo: la base con su piso, sus muros y su filete,
// planos en las caras de los muebles, pantallas, vidrios, sillas, plantas, la gente propia de cada sala y el kiosco
// «Hecho con BiPlot». El armado (montar, con zona() y lugar()) es el de salas-grandes.mjs, el mismo de la sala de Nu Home.
import { registrarMedida } from '../maqueta.mjs';
import { VISITANTES, persona, PIEL, medida } from '../visitantes.mjs';
export { montar, EA } from '../salas-grandes.mjs';
export { P } from '../maqueta.mjs';
export { PIEL };

export const r1 = (n) => Math.round(n * 10) / 10;
export const texto = (fuente, peso = 700) => (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" font-family="${fuente}" font-weight="${peso}" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
export const txt = texto(`'Space Grotesk','DejaVu Sans',sans-serif`);
export const mono = texto(`'Space Mono','DejaVu Sans Mono',monospace`);
export const PELO = { negro: ['#1A1613', '#0B0908', '#3A322C'], cafe: ['#4A3222', '#2E1F15', '#7A5334'], castano: ['#6E4A30', '#4A3222', '#8B6A4E'], rubio: ['#D9A441', '#B8862A', '#F4DDA8'], canoso: ['#B9C0C8', '#8E949C', '#E4E7EB'], rojizo: ['#8E3E20', '#6E2C14', '#B5532E'] };
export const Z = { negras: ['#1F2733', '#0B1726', null], cafe: ['#6E4A30', '#4A3222', null], blancas: ['#F2F4F7', '#B9C8D8', '#17C3B2'], botas: ['#8B6A4E', '#4A3222', null], rojas: ['#C8474A', '#F2F4F7', '#F2F4F7'] };

// Registra la gente propia de una sala (sentados con la medida de los sentados)
export function registrar(personas) {
  for (const [id, o] of Object.entries(personas)) {
    VISITANTES[id] = () => persona(o);
    registrarMedida(id, o.piernas === 'sentado' ? { cx: 15.6, pie: 38.6, sentado: true, alto: 50, ancho: 30 } : medida(id, persona(o)));
  }
}

// Piso (con su dibujo) y los dos muros de atrás, en tramos para el orden por profundidad, con su filete arriba
export function base(E, L, c) {
  const W = c.W, D = c.D, HM = c.HM;
  E.losa(-0.12, -0.12, W + 0.12, D + 0.12, 0, c.piso, -1000);
  if (c.dibujo) L.piso(0, 0, c.dibujo, -56);
  const s = 0.5;
  for (let x = 0; x < W - 0.001; x += s) {
    const b = Math.min(W, x + s);
    L.add(-50 + b * 0.01, L.poly([[x, 0, 0], [b, 0, 0], [b, 0, HM], [x, 0, HM]], `fill="${c.muroY}"`) +
      L.poly([[x, 0, 0], [b, 0, 0], [b, 0, 0.12], [x, 0, 0.12]], `fill="${c.zocalo}"`) +
      (c.filete ? L.poly([[x, 0, HM - 0.05], [b, 0, HM - 0.05], [b, 0, HM - 0.02], [x, 0, HM - 0.02]], `fill="${c.filete}"`) : '') +
      L.poly([[x, 0, HM], [b, 0, HM], [b, -0.14, HM], [x, -0.14, HM]], `fill="${c.tope}"`));
  }
  for (let y = 0; y < D - 0.001; y += s) {
    const b = Math.min(D, y + s);
    L.add(-50 + b * 0.01, L.poly([[0, y, 0], [0, b, 0], [0, b, HM], [0, y, HM]], `fill="${c.muroX}"`) +
      L.poly([[0, y, 0], [0, b, 0], [0, b, 0.12], [0, y, 0.12]], `fill="${c.zocalo}"`) +
      (c.filete ? L.poly([[0, y, HM - 0.05], [0, b, HM - 0.05], [0, b, HM - 0.02], [0, y, HM - 0.02]], `fill="${c.filete}"`) : '') +
      L.poly([[0, y, HM], [0, b, HM], [-0.14, b, HM], [-0.14, y, HM]], `fill="${c.tope}"`));
  }
  L.add(-49, L.poly([[W, 0, 0], [W, 0, HM], [W, -0.14, HM], [W, -0.14, 0]], `fill="${c.canto}"`) + L.poly([[0, D, 0], [0, D, HM], [-0.14, D, HM], [-0.14, D, 0]], `fill="${c.canto}"`));
}

// Contenido 2D en un plano x = const (la cara +x de un mueble); u va desde y0 hacia el fondo
export function planoXen(L, x, y0, zTop, ancho, alto, svg, k) {
  const [px, py] = L.P(x, y0, zTop); L.E.marca(x, y0, zTop); L.E.marca(x, y0 - ancho / 100, zTop - alto / 100);
  return L.add(k, `<g transform="matrix(0.32,-0.16,0,0.39,${r1(px)},${r1(py)})">${svg}</g>`);
}
// Pantalla con una imagen real, en un plano y = const (muro de atrás o la cara de un mueble) o en el muro x = 0
export function pantallaY(L, x0, y0, zTop, w, h, img, o = {}) {
  const Wp = w * 100, Hp = h * 100, b = o.borde ?? 5;
  L.planoY(x0, y0, zTop, Wp, Hp, `<rect width="${Wp}" height="${Hp}" rx="5" fill="${o.marco || '#0B0A08'}"/>` +
    `<image href="${img}" x="${b}" y="${b}" width="${Wp - b * 2}" height="${Hp - b * 2}" preserveAspectRatio="${o.ajuste || 'xMidYMid slice'}"/>` +
    `<rect x="${b}" y="${b}" width="${Wp - b * 2}" height="${Hp - b * 2}" fill="url(#brillo-pantalla)"/>`, o.k);
}
export function pantallaX(L, y0, zTop, w, h, img, o = {}) {
  const Wp = w * 100, Hp = h * 100, b = o.borde ?? 5;
  L.planoX(y0, zTop, Wp, Hp, `<rect width="${Wp}" height="${Hp}" rx="5" fill="${o.marco || '#0B0A08'}"/>` +
    `<image href="${img}" x="${b}" y="${b}" width="${Wp - b * 2}" height="${Hp - b * 2}" preserveAspectRatio="${o.ajuste || 'xMidYMid slice'}"/>` +
    `<rect x="${b}" y="${b}" width="${Wp - b * 2}" height="${Hp - b * 2}" fill="url(#brillo-pantalla)"/>`, o.k);
}
// Vidrio en tramos, con sus perfiles
export function vidrioY(L, y, x0, x1, h, perfil = '#141414', dk = 0) {
  for (let x = x0; x < x1 - 0.001; x += 0.5) {
    const b = Math.min(x1, x + 0.5);
    L.add((x + b) / 2 + y + dk, L.poly([[x, y, 0], [b, y, 0], [b, y, h], [x, y, h]], `fill="rgba(214,236,240,.16)" stroke="rgba(255,255,255,.3)" stroke-width=".6"`) +
      L.poly([[x, y, h - 0.06], [b, y, h - 0.06], [b, y, h], [x, y, h]], `fill="${perfil}"`) + L.poly([[x, y, 0], [b, y, 0], [b, y, 0.08], [x, y, 0.08]], `fill="${perfil}"`) +
      (Math.abs(b - Math.round(b)) < 0.01 ? L.poly([[b - 0.03, y, 0], [b + 0.03, y, 0], [b + 0.03, y, h], [b - 0.03, y, h]], `fill="${perfil}"`) : ''));
  }
}
export function vidrioX(L, x, y0, y1, h, perfil = '#141414', dk = 0) {
  for (let y = y0; y < y1 - 0.001; y += 0.5) {
    const b = Math.min(y1, y + 0.5);
    L.add(x + (y + b) / 2 + dk, L.poly([[x, y, 0], [x, b, 0], [x, b, h], [x, y, h]], `fill="rgba(214,236,240,.13)" stroke="rgba(255,255,255,.28)" stroke-width=".6"`) +
      L.poly([[x, y, h - 0.06], [x, b, h - 0.06], [x, b, h], [x, y, h]], `fill="${perfil}"`) + L.poly([[x, y, 0], [x, b, 0], [x, b, 0.08], [x, y, 0.08]], `fill="${perfil}"`) +
      (Math.abs(b - Math.round(b)) < 0.01 ? L.poly([[x, b - 0.03, 0], [x, b + 0.03, 0], [x, b + 0.03, h], [x, b - 0.03, h]], `fill="${perfil}"`) : ''));
  }
}
// Silla o piso (se dibuja antes que quien se sienta)
export function silla(L, x, y, col = { t: '#2B2724', l: '#1C1917', r: '#141110' }, alto = 0.4) {
  L.cil(x, y, 0, 0.05, alto, '#3A3530', '#2B2724', x + y - 0.2);
  L.caja(x - 0.22, y - 0.22, alto, 0.44, 0.44, 0.07, col, x + y - 0.15);
}
export function banqueta(L, x, y, col = ['#8B6A4E', '#5A4330'], alto = 0.72) {
  L.cil(x, y, 0, 0.04, alto, '#3A3530', '#2B2724', x + y - 0.2);
  L.cil(x, y, alto, 0.17, 0.06, col[0], col[1], x + y - 0.15);
}
// Planta alta en macetero
export function plantaAlta(L, x, y, t = 1, maceta = ['#2B2724', '#1C1917'], hojas = ['#3E7A4E', '#2F6440', '#4E8A55']) {
  L.cil(x, y, 0, 0.26 * t, 0.42 * t, maceta[0], maceta[1]);
  const [cx, cy] = L.P(x, y, 0.42 * t + 0.55 * t), k = x + y + 0.12;
  L.add(k, `<path d="M${r1(cx)} ${r1(cy + 22 * t)}V${r1(cy - 10 * t)}" stroke="#4A3F2E" stroke-width="${r1(2 * t)}"/>` +
    [[-12, 4, 11, 0], [11, -2, 12, 1], [-4, -14, 11, 2], [8, -22, 9, 0], [-10, -26, 8, 1], [2, 10, 9, 2]]
      .map(([dx, dy, r, c]) => `<ellipse cx="${r1(cx + dx * t)}" cy="${r1(cy + dy * t)}" rx="${r1(r * t)}" ry="${r1(r * 0.72 * t)}" fill="${hojas[c]}" transform="rotate(${dx > 0 ? -24 : 24} ${r1(cx + dx * t)} ${r1(cy + dy * t)})"/>`).join(''));
}
// Palmera en macetero (hojas largas)
export function palmera(L, x, y, t = 1, maceta = ['#2B2724', '#1C1917']) {
  L.cil(x, y, 0, 0.24 * t, 0.4 * t, maceta[0], maceta[1]);
  const [cx, cy] = L.P(x, y, 0.4 * t), k = x + y + 0.12;
  const hoja = (a, l, c) => { const rad = a * Math.PI / 180, ex = cx + Math.cos(rad) * l * t, ey = cy - 26 * t + Math.sin(rad) * l * 0.55 * t; return `<path d="M${r1(cx)} ${r1(cy - 26 * t)}Q${r1((cx + ex) / 2)} ${r1(Math.min(cy - 26 * t, ey) - 16 * t)} ${r1(ex)} ${r1(ey)}" stroke="${c}" stroke-width="${r1(5 * t)}" fill="none" stroke-linecap="round"/>`; };
  L.add(k, `<path d="M${r1(cx)} ${r1(cy)}V${r1(cy - 26 * t)}" stroke="#6E5A3A" stroke-width="${r1(3 * t)}"/>` +
    [[-170, 34, '#2F6440'], [-140, 40, '#3E7A4E'], [-110, 30, '#4E8A55'], [-70, 32, '#3E7A4E'], [-40, 40, '#2F6440'], [-10, 34, '#4E8A55'], [-90, 36, '#2F6440']].map(([a, l, c]) => hoja(a, l, c)).join(''));
}
// El kiosco «Hecho con BiPlot», con quien lleva la fase del proyecto a su lado. En la pantalla, el video del proyecto
// (img, con su botón) o, si no hay video, lo que se hizo (pantalla: SVG de 69 × 38). Es la zona «biplot» de la sala.
export function kioscoBiPlot({ L, pj, zona }, x0, y0, quien, img, pantalla) {
  const k = x0 + 0.55 + y0 + 0.35;
  L.caja(x0, y0, 0, 1.15, 0.72, 1.02, { t: '#0E2A47', l: '#0B1F36', r: '#081628' }, k + 0.5);
  L.caja(x0, y0, 1.02, 1.15, 0.72, 0.04, { t: '#17C3B2', l: '#0A8A7E', r: '#087066' }, k + 0.52);
  L.planoY(x0 + 0.1, y0 + 0.724, 0.9, 95, 60, `<rect x="4" y="6" width="22" height="22" rx="5" fill="#0E2A47" stroke="#17C3B2" stroke-width="1.6"/><path d="M9 11V23H22" stroke="#3F6DA0" stroke-width="1.4" fill="none"/><circle cx="11" cy="20" r="1.8" fill="#17C3B2"/><circle cx="15" cy="17" r="1.8" fill="#17C3B2"/><circle cx="20.5" cy="12.5" r="2.2" fill="#FF6B4A"/>` +
    txt(32, 17, 'Hecho con', 9, '#A9B7C6') + txt(32, 28, 'BiPlot', 11, '#FFFFFF') + `<rect x="4" y="38" width="86" height="3" rx="1.5" fill="#17C3B2"/>`, k + 0.53);
  L.caja(x0 + 0.57, y0 + 0.33, 1.06, 0.06, 0.05, 0.08, { t: '#0B1726', l: '#0B1726', r: '#000' }, k + 0.6);
  L.caja(x0 + 0.21, y0 + 0.35, 1.13, 0.78, 0.05, 0.47, { t: '#0B1726', l: '#0B1726', r: '#000' }, k + 0.62);
  L.planoY(x0 + 0.23, y0 + 0.402, 1.58, 74, 43, `<rect width="74" height="43" rx="2" fill="#0B1726"/>` + (pantalla ? `<g transform="translate(2.5 2.5)">${pantalla}</g>` :
    (img ? `<image href="${img}" x="2.5" y="2.5" width="69" height="38" preserveAspectRatio="xMidYMid slice"/>` : `<rect x="2.5" y="2.5" width="69" height="38" fill="#10345A"/>`) +
    `<circle cx="37" cy="21.5" r="8" fill="rgba(11,23,38,.7)"/><path d="M34.4 17.3V25.7L41.2 21.5Z" fill="#FFFFFF"/>`), k + 0.63);
  pj(quien, x0 + 1.65, y0 + 0.4, 0, 'i');
  zona('biplot', { formas: [{ piso: [[x0 - 0.1, y0 - 0.1], [x0 + 1.25, y0 - 0.1], [x0 + 1.25, y0 + 0.85], [x0 - 0.1, y0 + 0.85]], alto: 1.65 }], lugar: [x0 + 0.57, y0 + 0.35, 1.95], guia: [x0 + 2.4, y0 - 0.25] });
}
