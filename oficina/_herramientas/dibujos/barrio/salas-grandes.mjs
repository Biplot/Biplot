// Las salas grandes: el local de cada empresa por dentro, con su gente, sus pantallas reales y un punto por módulo.
// Cada sala se dibuja en su propia escena (la misma proyección de la oficina) y devuelve { vb, capas, arriba, caminan,
// pines, usados }: el dibujo en capas por profundidad y, aparte, la gente que camina por la sala con su ruta.
import { escena, P, registrarMedida, andante } from './maqueta.mjs';
import * as S from './locales.mjs';
import { VISITANTES, persona, PIEL, medida } from './visitantes.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
export const EA = 1.36;
const HM = 2.0;
const FUENTE = `font-family="'Space Grotesk','DejaVu Sans',sans-serif"`, MONO = `font-family="'Space Mono','DejaVu Sans Mono',monospace"`;
const txt = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${FUENTE} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const mono = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${MONO} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const MADERA = { t: '#8B6A4E', l: '#6E5238', r: '#5A4330' };
const ACERO = { t: '#C4D2E0', l: '#8FA3B8', r: '#6B7A8C' };

// ───────── Gente nueva: los perfiles reales de cada sistema y quienes los usan ─────────
const JEAN = ['#35679A', '#27507C'], OSCURO = ['#2A3038', '#1E232A'], CAQUI = ['#C9B28A', '#A8936A'], NEGRO = ['#1F2733', '#141A23'];
const Z = { blancas: ['#F2F4F7', '#B9C8D8', '#17C3B2'], cafe: ['#6E4A30', '#4A3222', null], negras: ['#1F2733', '#0B1726', null], botas: ['#8B6A4E', '#4A3222', null], rojas: ['#C8474A', '#F2F4F7', '#F2F4F7'] };
const PELO = { negro: ['#1A1613', '#0B0908', '#3A322C'], cafe: ['#4A3222', '#2E1F15', '#7A5334'], castano: ['#6E4A30', '#4A3222', '#8B6A4E'], canoso: ['#B9C0C8', '#8E949C', '#E4E7EB'], rojizo: ['#8E3E20', '#6E2C14', '#B5532E'], rubio: ['#D9A441', '#B8862A', '#F4DDA8'] };
const NUEVOS = {
  // Haru 360: los nueve perfiles de su sistema (Dueño, Encargado, Caja, Garzón, Jefa de cocina, Barman, Runner, Repartidor, Aseo)
  dueno: { piel: PIEL.clara, pelo: PELO.canoso, peinado: 'peinado', arriba: 'blazer', arribaCol: ['#2A3038', '#1E232A', ['#F2F4F7', '#E0524A']], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'sostiene', objeto: 'tablet', lentes: 'rectos', boca: 'media' },
  encargado: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'corto', arriba: 'chaleco', arribaCol: ['#F2F4F7', '#C4D2E0', ['#3A2E26', '#3A2E26']], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoI: 'sostiene', objetoI: 'carpeta', brazoD: 'senala', barba: '#1A1613' },
  cajera: { piel: PIEL.media, pelo: PELO.rojizo, peinado: 'cola', cuerpo: 'fino', arriba: 'delantal', arribaCol: ['#F2F4F7', '#C4D2E0', ['#C8474A', '#A8352F']], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'saluda', ojos: 'grandes', aros: '#E0B341' },
  garzon: { piel: PIEL.clara, pelo: PELO.cafe, peinado: 'peinado', arriba: 'delantal', arribaCol: ['#F2F4F7', '#C4D2E0', ['#1F2733', '#141A23']], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'sostiene', objeto: 'celular', brazoI: 'abajo' },
  jefacocina: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'mono', cuerpo: 'fino', arriba: 'chef', arribaCol: ['#F2F4F7', '#C4D2E0', '#C8474A'], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, cintillo: '#C8474A', brazoD: 'sostiene', objeto: 'plato', ojos: 'grandes' },
  barman: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'rizado', arriba: 'chaleco', arribaCol: ['#F2F4F7', '#C4D2E0', ['#1F2733', '#1F2733']], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'frente', objeto: 'taza', brazoI: 'frente', objetoI: 'trapo', bigote: '#1A1613' },
  aseo: { piel: PIEL.trigo, pelo: PELO.castano, peinado: 'trenza', lazo: '#7FD8CF', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#3E9C95', '#2A7C78'], manga: 'corta', abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.blancas, brazoI: 'frente', objetoI: 'trapo', brazoD: 'abajo', ojos: 'felices' },
  comensal3: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'melena', cuerpo: 'fino', arriba: 'chaqueta', arribaCol: ['#E0B341', '#C49A2E', ['#F2F4F7', null]], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'telefono', objeto: 'telefono', brazoI: 'frente', aros: '#E0B341', ojos: 'grandes' },
  comensal4: { piel: PIEL.clara, pelo: PELO.canoso, peinado: 'rizado', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#8E6BB8', '#6E4E96', ['#F2F4F7']], abajo: 'falda', abajoCol: ['#3A4A5A', '#2A3848'], medias: ['#C4A088', '#A88670'], zapatos: Z.negras, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', lentes: 'redondos', rubor: '#E9967A' },
  comensal5: { piel: PIEL.clara, pelo: PELO.canoso, peinado: 'calvo', arriba: 'chaqueta', arribaCol: ['#35557A', '#27425F', ['#F2F4F7', null]], abajo: 'pantalon', abajoCol: CAQUI, zapatos: Z.cafe, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', bigote: '#DADDE2' },
  comensal6: { piel: PIEL.media, pelo: PELO.castano, peinado: 'corto', arriba: 'polera', arribaCol: ['#17446F', '#0F3558', ['#7FD8CF', 'M14.6 28H19V31H14.6Z']], manga: 'corta', abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'felices' },
  // Fundos 360: la jefa de ventas, finanzas y el topógrafo
  jefaventas: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'melena', cuerpo: 'fino', arriba: 'blazer', arribaCol: ['#17446F', '#0F3558', ['#F2F4F7', '#E0B341']], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'sostiene', objeto: 'tablet', aros: '#E0B341', ojos: 'grandes' },
  finanzas: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'corto', arriba: 'blazer', arribaCol: ['#4A5260', '#39404C', ['#F2F4F7', '#35679A']], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.negras, brazoI: 'sostiene', objetoI: 'carpeta', brazoD: 'senala', lentes: 'rectos' },
  comprador: { piel: PIEL.trigo, pelo: PELO.cafe, peinado: 'peinado', arriba: 'parka', arribaCol: ['#8B7355', '#6E5A42', '#5A4A36'], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.botas, brazoD: 'sostiene', objeto: 'tablet', barba: '#4A3222' },
  // Nu Home 360: el ejecutivo, la ingeniera, el papá con la llave y la clienta que sigue su casa
  ejecutivo: { piel: PIEL.media, pelo: PELO.negro, peinado: 'peinado', arriba: 'blazer', arribaCol: ['#3A3F46', '#2A2F35', ['#F2F4F7', '#E0B341']], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'senala', brazoI: 'abajo' },
  ingeniera: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'cola', cuerpo: 'fino', sombrero: 'casco', sombreroCol: ['#F2F4F7', '#C4D2E0', '#FFFFFF'], arriba: 'chaleco', arribaCol: ['#35679A', '#27507C', ['#F5883A', '#E8EEF4']], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.botas, brazoD: 'sostiene', objeto: 'tablet', brazoI: 'sostiene', objetoI: 'plano', ojos: 'grandes' },
  papa: { piel: PIEL.trigo, pelo: PELO.cafe, peinado: 'corto', arriba: 'polera', arribaCol: ['#3E7A4E', '#2F6440'], manga: 'corta', abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, brazoD: 'alto', objeto: 'llave', barba: '#4A3222', ojos: 'felices', boca: 'dientes' },
  clienta2: { piel: PIEL.media, pelo: PELO.negro, peinado: 'largo', cuerpo: 'fino', arriba: 'parka', arribaCol: ['#C9824E', '#A8683A', '#8C5530'], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'celular', ojos: 'grandes', rubor: '#E9967A' },
  soldador: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'corto', sombrero: 'casco', sombreroCol: ['#F5883A', '#D26A22', '#F8B27A'], arriba: 'polera', arribaCol: ['#35557A', '#27425F'], manga: 'larga', abajo: 'pantalon', abajoCol: ['#35557A', '#27425F'], zapatos: Z.botas, brazoD: 'frente', objeto: 'caja', brazoI: 'frente' },
  // Eleven 360: la dueña del gimnasio, el instructor, un socio que llega y quienes pedalean
  duenagym: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'cola', lazo: '#17C3B2', cuerpo: 'fino', arriba: 'poleron', arribaCol: ['#1F2733', '#141A23', '#17C3B2'], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'tablet', ojos: 'grandes' },
  instructor: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'corto', arriba: 'deportiva', arribaCol: ['#E0524A', '#C8423A', null], abajo: 'short', abajoCol: NEGRO, zapatos: Z.blancas, brazoD: 'alto', brazoI: 'abajo', ojos: 'felices', boca: 'dientes' },
  socio: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'corto', arriba: 'poleron', arribaCol: ['#35679A', '#27507C', '#27507C'], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.blancas, atras: 'mochila', brazoD: 'sostiene', objeto: 'celular', piernas: 'camina' },
  ciclista: { piel: PIEL.media, pelo: PELO.rojizo, peinado: 'cola', lazo: '#E0B341', cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#E0B341', '#C49A2E', null], abajo: 'short', abajoCol: NEGRO, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'felices' },
  ciclista2: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'rizado', arriba: 'deportiva', arribaCol: ['#17C3B2', '#0A8A7E', null], abajo: 'short', abajoCol: NEGRO, zapatos: Z.rojas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', boca: 'dientes' },
  // Rumbo: quien medita en el ritual de la mañana y quien escribe su diario
  meditadora: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'mono', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#DDF4F1', '#B9D8D3'], manga: 'larga', abajo: 'pantalon', abajoCol: ['#2A7C78', '#1F5F5C'], zapatos: Z.blancas, piernas: 'sentado', brazoD: 'abajo', brazoI: 'abajo', ojos: 'felices', boca: 'sonrisa' },
  corredora: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'cola', lazo: '#17C3B2', cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#3E9C95', '#2A7C78', null], abajo: 'short', abajoCol: NEGRO, zapatos: Z.blancas, audifonos: '#7FD8CF', piernas: 'camina', brazoD: 'frente', brazoI: 'atras', ojos: 'felices' }
};
// Medidas de todos los visitantes (los de siempre y los nuevos)
for (const id of Object.keys(VISITANTES)) registrarMedida(id, medida(id, VISITANTES[id]()));
for (const [id, o] of Object.entries(NUEVOS)) {
  VISITANTES[id] = () => persona(o);
  const f = persona(o);
  registrarMedida(id, o.piernas === 'sentado' ? { cx: 15.6, pie: 38.6, sentado: true, alto: 50, ancho: 30 } : medida(id, f));
}

// ───────── Piezas comunes ─────────
// Piso, muros de atrás (en tramos, para el orden por profundidad), zócalo y canto de la losa
function base(E, L, W, D, c) {
  E.losa(-0.12, -0.12, W + 0.12, D + 0.12, 0, c.piso, -1000);
  if (c.dibujo) L.piso(0, 0, c.dibujo, -55);
  const s = 0.5;
  for (let x = 0; x < W - 0.001; x += s) {
    const b = Math.min(W, x + s);
    L.add(-50 + b * 0.01, L.poly([[x, 0, 0], [b, 0, 0], [b, 0, HM], [x, 0, HM]], `fill="${c.muroY}"`) +
      L.poly([[x, 0, 0], [b, 0, 0], [b, 0, 0.12], [x, 0, 0.12]], `fill="${c.zocalo}"`) +
      L.poly([[x, 0, HM], [b, 0, HM], [b, -0.12, HM], [x, -0.12, HM]], `fill="${c.tope}"`));
  }
  for (let y = 0; y < D - 0.001; y += s) {
    const b = Math.min(D, y + s);
    L.add(-50 + b * 0.01, L.poly([[0, y, 0], [0, b, 0], [0, b, HM], [0, y, HM]], `fill="${c.muroX}"`) +
      L.poly([[0, y, 0], [0, b, 0], [0, b, 0.12], [0, y, 0.12]], `fill="${c.zocalo}"`) +
      L.poly([[0, y, HM], [0, b, HM], [-0.12, b, HM], [-0.12, y, HM]], `fill="${c.tope}"`));
  }
  // Cantos de los muros
  L.add(-49, L.poly([[W, 0, 0], [W, 0, HM], [W, -0.12, HM], [W, -0.12, 0]], `fill="${c.canto}"`) + L.poly([[0, D, 0], [0, D, HM], [-0.12, D, HM], [-0.12, D, 0]], `fill="${c.canto}"`));
}
// Mostrador largo en tramos a lo largo de x (o de y), para que la gente de atrás y de adelante quede bien tapada
function mostradorX(L, x0, x1, y0, d, h, col, s = 0.45) {
  for (let x = x0; x < x1 - 0.001; x += s) { const b = Math.min(x1, x + s); L.caja(x, y0, 0, b - x, d, h, col); }
}
function mostradorY(L, x0, w, y0, y1, h, col, s = 0.45) {
  for (let y = y0; y < y1 - 0.001; y += s) { const b = Math.min(y1, y + s); L.caja(x0, y, 0, w, b - y, h, col); }
}
// Pantalla en el muro de atrás (y = 0) o en el izquierdo (x = 0) con una pantalla real del sistema
function pantallaY(L, x0, zTop, w, h, img, o = {}) {
  const W = w * 100, H = h * 100, b = o.borde ?? 5;
  L.planoY(x0, 0.03, zTop, W, H, `<rect width="${W}" height="${H}" rx="5" fill="${o.marco || '#0B1726'}"/>` +
    `<image href="${img}" x="${b}" y="${b}" width="${W - b * 2}" height="${H - b * 2}" preserveAspectRatio="${o.ajuste || 'xMidYMid slice'}"/>` +
    `<rect x="${b}" y="${b}" width="${W - b * 2}" height="${H - b * 2}" fill="url(#brillo-pantalla)"/>` + (o.extra || ''), o.k);
  if (o.pie !== false) L.add(-39, L.poly([[x0 + w / 2 - 0.08, 0, zTop - h - 0.02], [x0 + w / 2 + 0.08, 0, zTop - h - 0.02], [x0 + w / 2 + 0.08, 0.06, zTop - h - 0.02], [x0 + w / 2 - 0.08, 0.06, zTop - h - 0.02]], `fill="#0B1726"`));
}
function pantallaX(L, y0, zTop, w, h, img, o = {}) {
  const W = w * 100, H = h * 100, b = o.borde ?? 5;
  L.planoX(y0, zTop, W, H, `<rect width="${W}" height="${H}" rx="5" fill="${o.marco || '#0B1726'}"/>` +
    `<image href="${img}" x="${b}" y="${b}" width="${W - b * 2}" height="${H - b * 2}" preserveAspectRatio="${o.ajuste || 'xMidYMid slice'}"/>` +
    `<rect x="${b}" y="${b}" width="${W - b * 2}" height="${H - b * 2}" fill="url(#brillo-pantalla)"/>` + (o.extra || ''), o.k);
}
// Contenido 2D en un plano x = const (la cara +x de un mueble); u va desde y0 hacia el fondo
function planoXen(L, x, y0, zTop, ancho, alto, svg, k) {
  const [px, py] = L.P(x, y0, zTop); L.E.marca(x, y0, zTop); L.E.marca(x, y0 - ancho / 100, zTop - alto / 100);
  return L.add(k, `<g transform="matrix(0.32,-0.16,0,0.39,${r1(px)},${r1(py)})">${svg}</g>`);
}
// Farol de papel colgando del cielo (se mece con la animación loc-farol de la oficina)
function farol(L, x, y, z, col = ['#E0524A', '#C8423A', '#A8352F'], k) {
  k = k ?? x + y + 0.35;
  L.anim('loc-farol', () => {
    L.linea([[x, y, 2.55], [x, y, z + 0.33]], '#3A424E', 1.3, k + 0.1);
    L.cil(x, y, z - 0.02, 0.09, 0.03, '#1E232A', '#1E232A', k + 0.101);
    L.cil(x, y, z, 0.16, 0.3, col[0], col[1], k + 0.102);
    const [cx, c0] = L.P(x, y, 0), rx = 0.16 * 32 * 1.41, ry = 0.16 * 16 * 1.41;
    L.add(k + 0.103, [0.08, 0.17, 0.25].map(dz => { const cy = c0 - (z + dz) * 39; return `<path d="M${r1(cx - rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 0 0 ${r1(cx + rx)} ${r1(cy)}" fill="none" stroke="${col[2]}" stroke-width="1"/>`; }).join(''));
    L.cil(x, y, z + 0.3, 0.09, 0.03, '#1E232A', '#1E232A', k + 0.104);
  });
  L.luz(x, y, 0.01, 30, 15, 'rgba(242,120,90,.10)', -54);
}
// Piso de barra (asiento redondo)
function piso(L, x, y, col = ['#C9A27A', '#8B6A4E']) { L.cil(x, y, 0, 0.035, 0.46, '#3A424E', '#2A3038'); L.cil(x, y, 0.46, 0.15, 0.06, col[0], col[1]); }
// Punto de interés numerado: un alfiler con la punta en el objeto (en la capa de carteles, siempre arriba)
function pin(E, pines, n, x, y, z, col, tinta = '#0B1726') {
  const [px, py] = P(x, y, z); E.marca(x, y, z + 1.1);
  pines.push({ n, x: r1(px), y: r1(py) });
  E.add(6000 + n, `<g class="pin" data-pin="${n}" transform="translate(${r1(px)} ${r1(py)})"><ellipse class="pin-onda" rx="9" ry="4.5" fill="none" stroke="${col}" stroke-width="2"/>` +
    `<g class="pin-cabeza"><path d="M0 0C-3 -6 -12 -13 -12 -24A12 12 0 1 1 12 -24C12 -13 3 -6 0 0Z" fill="${col}" stroke="#0B1726" stroke-width="2.2" stroke-linejoin="round"/>` +
    `<text y="-19.2" text-anchor="middle" ${MONO} font-weight="700" font-size="14" fill="${tinta}">${n}</text></g></g>`);
}
const flor = (cx, cy, r) => [0, 72, 144, 216, 288].map(a => { const t = (a - 90) * Math.PI / 180; return `<circle cx="${r1(cx + Math.cos(t) * r)}" cy="${r1(cy + Math.sin(t) * r)}" r="${r1(r * 0.72)}" fill="#F2F4F7"/>`; }).join('') + `<circle cx="${cx}" cy="${cy}" r="${r1(r * 0.42)}" fill="#F5B7C5"/>`;

// La sala sale en capas por profundidad (E.capas) y la gente que camina va aparte, con su ruta: escena.js la mete en la
// capa que le toca mientras camina. camina(id, ruta, o): ruta = [[x, y, espera en segundos], …], se recorre en círculo
// (para ir y volver se anotan los puntos de vuelta); la primera parada es donde se ve en las imágenes fijas.
function montar(fn) {
  const E = escena(); E.txt = 1;
  const L = S.local(E, 0, 0, 0, false, 0);
  const usados = new Set(), pines = [], caminan = [];
  const pj = (id, x, y, z = 0, dir = 'd', e = EA, k) => { usados.add(id); L.pj(id, x, y, z, dir, e, k); };
  const camina = (id, ruta, o = {}) => { usados.add(id); caminan.push(caminante(E, id, ruta, o)); };
  const info = fn({ E, L, pj, camina, pin: (n, x, y, z, col, tinta) => pin(E, pines, n, x, y, z, col, tinta) });
  const r = E.svg(18), { capas, arriba } = E.capas();
  return { vb: r.vb, ancho: r.ancho, alto: r.alto, capas, arriba, caminan, pines, usados: [...usados], ...info };
}
// Quien camina: su dibujo parado en el origen, su ruta y su paso (baldosas por segundo). Marca los bordes del dibujo
// en su primera parada, como si estuviera parado ahí.
export function caminante(E, id, ruta, o = {}) {
  const e = o.e || EA, [x, y] = ruta[0];
  E.marca(x, y, 0); E.marca(x, y, 1.9);
  return { id, svg: andante(id, e), ruta: ruta.map(p => p.map(n => Math.round(n * 100) / 100)), vel: o.vel || 0.5 };
}

// ───────── Haru 360 · restaurante de cocina japonesa, Arica ─────────
export function haru() {
  return montar(({ E, L, pj, camina, pin }) => {
    const W = 9.6, D = 7.0, ROJO = '#E0524A';
    base(E, L, W, D, { piso: '#6E4A30', muroY: '#2E2623', muroX: '#262020', zocalo: '#1B1512', tope: '#40352F', canto: '#1B1512',
      dibujo: `<g stroke="#5E3F28" stroke-width="2.4">${Array.from({ length: 26 }, (_, i) => `<path d="M${(i + 1) * 36} 0V${D * 100}"/>`).join('')}</g>` });
    // La cocina detrás del noren, con el pase y sus platos listos
    L.planoY(0.3, 0.02, 1.86, 140, 152, `<rect width="140" height="152" fill="#0B1726"/><rect y="112" width="140" height="40" fill="url(#luz-cocina)"/><rect x="-6" y="0" width="152" height="8" rx="2" fill="#8B6A4E"/>` +
      [4, 49, 94].map(x => `<rect x="${x}" y="8" width="42" height="60" fill="#22407A"/><path d="M${x} 62H${x + 42}" stroke="#17325F" stroke-width="3"/>`).join('') + flor(70, 36, 8));
    L.caja(0.35, 0.05, 0, 1.3, 0.34, 0.92, ACERO, 0.9);
    for (const [x, c] of [[0.62, '#F29A6B'], [1.02, '#C8474A'], [1.4, '#E0B341']]) { L.cil(x, 0.22, 0.92, 0.13, 0.02, '#F2F4F7', '#C4D2E0', 1.3 + x * 0.01); L.luz(x, 0.22, 0.95, 5, 2.4, c, 1.31 + x * 0.01); }
    // La pantalla de comandas de cocina (pantalla real de Haru 360)
    pantallaY(L, 1.9, 1.9, 1.15, 0.7, '§M§recorte-haru-3-comandas.webp');
    // La barra: listones de madera, repisa con botellas y el logo de Haru
    L.planoY(3.15, 0.02, 1.98, 290, 198, `<rect width="290" height="198" fill="#4A3526"/>` + Array.from({ length: 29 }, (_, i) => `<rect x="${i * 10 + 2}" width="6" height="198" fill="#8B6A4E"/>`).join(''));
    L.planoY(4.39, 0.03, 1.95, 44, 44, `<image href="§M§logo-haru.webp" width="44" height="44"/>`, -38);
    L.caja(3.3, 0.0, 1.28, 2.6, 0.2, 0.05, MADERA, -37);
    for (const x of [3.45, 3.65, 3.85, 4.05, 5.1, 5.3, 5.5, 5.7]) L.cil(x, 0.1, 1.33, 0.05, 0.26, x < 4.5 ? '#E8DFC8' : '#3E7A4E', x < 4.5 ? '#CFC2A3' : '#2F6440', -36 + x * 0.001);
    mostradorX(L, 3.2, 6.0, 0.85, 0.6, 0.95, { t: '#E8D2A8', l: '#8B6A4E', r: '#6E5238' });
    ['#F29A6B', '#C8474A', '#F2F4F7', '#F7B58E', '#F29A6B', '#C8474A'].forEach((c, i) => L.caja(3.62 + i * 0.22, 0.95, 0.95, 0.16, 0.13, 0.05, { t: c, l: c, r: c }));
    const [gx0, gx1, gy0, gy1, gz0, gz1] = [3.5, 4.95, 0.9, 1.16, 0.95, 1.15], kv = 4.95 + 1.16 + 0.6;
    L.add(kv, L.poly([[gx0, gy1, gz0], [gx1, gy1, gz0], [gx1, gy1, gz1], [gx0, gy1, gz1]], `fill="rgba(221,244,241,.16)" stroke="rgba(221,244,241,.6)" stroke-width="1"`) +
      L.poly([[gx1, gy0, gz0], [gx1, gy1, gz0], [gx1, gy1, gz1], [gx1, gy0, gz1]], `fill="rgba(221,244,241,.1)" stroke="rgba(221,244,241,.45)" stroke-width="1"`) +
      L.poly([[gx0, gy0, gz1], [gx1, gy0, gz1], [gx1, gy1, gz1], [gx0, gy1, gz1]], `fill="rgba(221,244,241,.12)" stroke="rgba(221,244,241,.6)" stroke-width="1"`));
    L.caja(5.15, 1.08, 0.95, 0.42, 0.18, 0.03, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' });
    for (const [x, c] of [[5.25, '#F29A6B'], [5.36, '#C8474A'], [5.47, '#F29A6B']]) { L.luz(x, 1.17, 1.0, 3.2, 1.8, '#F2F4F7', 7.2); L.luz(x, 1.17, 1.02, 2.8, 1.4, c, 7.21); }
    L.cil(5.78, 1.2, 0.95, 0.12, 0.08, '#F2F4F7', '#C4D2E0'); L.luz(5.78, 1.2, 1.03, 4, 2, '#E0B341', 7.95);
    L.anim('loc-vapor', () => { L.linea([[5.75, 1.2, 1.06], [5.71, 1.2, 1.22], [5.78, 1.2, 1.38]], 'rgba(242,244,247,.7)', 1.5, 7.96); L.linea([[5.83, 1.2, 1.06], [5.87, 1.2, 1.22]], 'rgba(242,244,247,.55)', 1.3, 7.96); });
    for (const x of [3.6, 4.45, 5.3]) piso(L, x, 1.9);
    // La caja: mostrador contra el muro, con el punto de venta y la máquina de pago
    L.planoY(6.45, 0.02, 1.9, 130, 40, `<rect width="130" height="40" rx="5" fill="#C8474A"/>` + txt(40, 28, 'CAJA', 20, '#F2F4F7'));
    mostradorX(L, 6.35, 7.75, 0.85, 0.55, 0.95, { t: '#3A2E26', l: '#2A211C', r: '#1E1714' }, 0.47);
    L.planoY(6.4, 1.401, 0.8, 130, 40, `<rect width="130" height="40" fill="#C8474A"/>` + Array.from({ length: 13 }, (_, i) => `<rect x="${i * 10 + 3}" y="0" width="4" height="40" fill="#A8352F"/>`).join(''), 9.4);
    L.planoY(6.9, 0.9, 1.34, 44, 34, `<rect width="44" height="34" rx="3" fill="#0B1726"/><rect x="3" y="3" width="38" height="26" rx="2" fill="#123459"/><rect x="6" y="7" width="15" height="6" rx="1" fill="#E0524A"/><rect x="6" y="16" width="28" height="3" fill="#7FD8CF"/><rect x="6" y="22" width="19" height="3" fill="#7FD8CF"/>`, 9.1);
    L.caja(7.02, 0.93, 0.95, 0.2, 0.1, 0.06, { t: '#1F2733', l: '#141A23', r: '#0B0B0B' }, 9.05);
    L.caja(7.45, 1.1, 0.95, 0.12, 0.18, 0.03, { t: '#1C1C1E', l: '#141414', r: '#0B0B0B' }, 9.6);
    // El retiro de delivery y, arriba, el panel del día (pantalla real)
    mostradorX(L, 8.0, 9.45, 0.08, 0.46, 0.78, MADERA, 0.5);
    for (const x of [8.12, 8.45, 8.78, 9.1]) { L.caja(x, 0.16, 0.78, 0.22, 0.17, 0.26, { t: '#D9B98C', l: '#C4A06E', r: '#A8845E' }); L.linea([[x + 0.05, 0.25, 1.04], [x + 0.11, 0.25, 1.1], [x + 0.17, 0.25, 1.04]], '#8C6D4A', 1.4, x + 0.4 + 0.52); }
    L.planoY(8.25, 0.545, 0.66, 96, 18, `<rect width="96" height="18" rx="3" fill="#0B2B45"/>` + mono(8, 13, 'DELIVERY', 10, '#7FD8CF', ` textLength="80" lengthAdjust="spacingAndGlyphs"`), 9.1);
    pantallaY(L, 8.05, 1.96, 1.35, 0.76, '§M§recorte-haru-1-dashboard.webp');
    // La carta en pizarra, con el QR para pedir desde la mesa
    L.planoX(2.75, 1.8, 185, 108, `<rect width="185" height="108" rx="5" fill="#1F2A26" stroke="#8B6A4E" stroke-width="6"/>` + txt(12, 26, 'CARTA', 15, '#F2C14E') +
      ['Sushi', 'Ramen', 'Gyozas', 'Temaki', 'Yakimeshi'].map((t, i) => mono(12, 44 + i * 13, t, 9.5, '#E8DFC8') + `<path d="M${66} ${41 + i * 13}H112" stroke="#6B7A8C" stroke-width="1.4" stroke-dasharray="2 4"/>`).join('') +
      `<rect x="124" y="20" width="50" height="50" rx="4" fill="#F2F4F7"/>` + [[1, 1], [9, 1], [1, 9], [6, 6], [10, 9], [5, 1], [1, 5], [10, 5], [3, 3], [8, 7]].map(([a, b]) => `<rect x="${128 + a * 3.4}" y="${24 + b * 3.4}" width="3.4" height="3.4" fill="#0B1726"/>`).join('') +
      mono(122, 84, 'PIDE DESDE', 8, '#F2C14E') + mono(122, 96, 'TU MESA', 8, '#F2C14E'));
    // La bodega: estantes con insumos y cajas en el piso
    L.planoX(5.75, 1.9, 225, 180, `<rect width="225" height="180" rx="4" fill="#3A2E26"/>` + [40, 85, 130, 172].map(y => `<rect x="4" y="${y}" width="217" height="6" fill="#8B6A4E"/>`).join('') +
      [[10, 10, 30, 30, '#E8DFC8', 'ARROZ'], [48, 14, 22, 26, '#C8474A', ''], [76, 14, 22, 26, '#C8474A', ''], [106, 8, 40, 32, '#D9B98C', 'NORI'], [154, 12, 26, 28, '#3E7A4E', ''], [186, 12, 26, 28, '#3E7A4E', ''],
        [10, 52, 44, 33, '#D9B98C', 'SALMÓN'], [62, 58, 20, 27, '#1F2733', ''], [86, 58, 20, 27, '#1F2733', ''], [112, 50, 50, 35, '#E8DFC8', 'PALTA'], [170, 56, 40, 29, '#D9B98C', ''],
        [12, 98, 36, 32, '#F2F4F7', ''], [56, 96, 56, 34, '#D9B98C', 'SOYA'], [120, 102, 22, 28, '#C8474A', ''], [148, 100, 60, 30, '#E8DFC8', 'SAKE'], [14, 142, 70, 30, '#D9B98C', 'VINAGRE'], [96, 146, 38, 26, '#F2F4F7', ''], [144, 140, 64, 32, '#D9B98C', 'JENGIBRE']]
        .map(([x, y, w, h, c, t]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}" stroke="#0B1726" stroke-width="1.2"/>` + (t ? mono(x + 3, y + h / 2 + 3, t, 6.4, '#0B1726') : '')).join(''));
    L.caja(0.12, 5.15, 0, 0.48, 0.44, 0.34, { t: '#D9B98C', l: '#C4A06E', r: '#A8845E' });
    L.caja(0.16, 5.2, 0.34, 0.4, 0.36, 0.28, { t: '#D9B98C', l: '#C4A06E', r: '#A8845E' });
    L.cil(0.42, 6.35, 0, 0.2, 0.36, '#E8DFC8', '#CFC2A3');
    // Mesas con ramen, nigiris y la carta con QR, bajo faroles de papel
    const mesa = (x, y) => {
      L.cil(x - 0.62, y, 0, 0.15, 0.42, '#C9A27A', '#8B6A4E'); L.cil(x + 0.62, y, 0, 0.15, 0.42, '#C9A27A', '#8B6A4E');
      L.caja(x - 0.07, y - 0.07, 0, 0.14, 0.14, 0.58, { t: '#3A2E26', l: '#3A2E26', r: '#2A211C' });
      L.caja(x - 0.4, y - 0.4, 0.58, 0.8, 0.8, 0.05, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' });
      const k = x + y + 0.35;
      L.luz(x, y, 0.64, 22, 11, 'rgba(242,120,90,.16)', k);
      L.cil(x - 0.14, y + 0.08, 0.63, 0.12, 0.08, '#F2F4F7', '#C4D2E0', k + 0.01); L.luz(x - 0.14, y + 0.08, 0.71, 4, 2, '#E0B341', k + 0.011);
      L.linea([[x - 0.3, y - 0.1, 0.64], [x + 0.02, y - 0.16, 0.64]], '#3A2E26', 1.3, k + 0.012); L.linea([[x - 0.3, y - 0.06, 0.64], [x + 0.02, y - 0.12, 0.64]], '#3A2E26', 1.3, k + 0.013);
      L.cil(x + 0.18, y + 0.14, 0.63, 0.13, 0.02, '#F2F4F7', '#C4D2E0', k + 0.014);
      L.luz(x + 0.14, y + 0.14, 0.66, 3, 1.6, '#F29A6B', k + 0.015); L.luz(x + 0.22, y + 0.14, 0.66, 3, 1.6, '#C8474A', k + 0.016);
      L.cil(x + 0.24, y - 0.2, 0.63, 0.035, 0.12, '#3A2E26', '#5A2A22', k + 0.017);
      L.caja(x + 0.14, y + 0.3, 0.63, 0.16, 0.03, 0.17, { t: '#F2F4F7', l: '#F2F4F7', r: '#C4D2E0' }, k + 0.018);
      L.planoY(x + 0.15, y + 0.331, 0.785, 14, 14, [[1, 1], [9, 1], [1, 9], [6, 6], [10, 9], [5, 1], [1, 5], [10, 5]].map(([a, b]) => `<rect x="${a}" y="${b}" width="3.4" height="3.4" fill="#0B1726"/>`).join(''), k + 0.019);
    };
    mesa(2.3, 3.2); mesa(4.75, 3.55); mesa(4.3, 5.85);
    // Guirnalda de luces cálidas en lo alto del muro de la barra
    L.planoY(3.15, 0.025, 1.97, 470, 30, `<path d="M0 6Q58 22 117 6T235 6T352 6T470 6" fill="none" stroke="#1B1512" stroke-width="1.6"/>` + Array.from({ length: 16 }, (_, i) => { const u = 15 + i * 29.5, v = 6 + 12 * Math.sin(Math.PI * ((u % 117.5) / 117.5)); return `<circle cx="${r1(u)}" cy="${r1(v + 3)}" r="3.4" fill="#F2C14E"/><circle cx="${r1(u)}" cy="${r1(v + 3)}" r="7" fill="#F2C14E" opacity=".18"/>`; }).join(''), -35);
    // Bambú en la esquina de adelante y planta junto a la bodega
    L.cil(9.3, 5.0, 0, 0.18, 0.34, '#3A424E', '#2A3038');
    L.add(14.4, [[-0.05, 1.5], [0.03, 1.72], [0.1, 1.35]].map(([dx, h]) => { const [a, b] = L.P(9.3 + dx, 5.0, 0.32), [, c] = L.P(9.3 + dx, 5.0, h); return `<path d="M${r1(a)} ${r1(b)}V${r1(c)}" stroke="#4E8A55" stroke-width="2.8"/><path d="M${r1(a)} ${r1(c + 10)}l8 -5M${r1(a)} ${r1(c + 19)}l-8 -4M${r1(a)} ${r1(c + 30)}l7 -4" stroke="#6FAF6B" stroke-width="2.4" stroke-linecap="round"/>`; }).join(''));
    L.planta(0.5, 6.55, 0, undefined, 0.8);
    // Felpudo de la entrada
    L.piso(8.0, 6.05, `<rect width="120" height="70" rx="8" fill="#3A2E26"/><rect x="8" y="8" width="104" height="54" rx="5" fill="none" stroke="#C8474A" stroke-width="3"/>` + txt(28, 44, 'HARU', 22, '#E8D2A8'), -54);
    // La gente: los nueve perfiles del sistema, los comensales y Faro enseñando
    pj('jefacocina', 1.35, 0.8, 0, 'd');
    camina('mesera', [[3.35, 2.25, 2.5], [3.45, 3.0], [3.95, 4.95, 2.2], [3.45, 3.0]]);
    pj('chef', 4.1, 0.45, 0, 'd');
    pj('barman', 5.55, 0.45, 0, 'i');
    pj('comensal6', 4.45, 1.9, 0.48, 'i');
    pj('cajera', 7.05, 0.45, 0, 'd');
    pj('comensal', 1.68, 3.2, 0.48, 'd'); pj('comensal2', 2.92, 3.2, 0.48, 'i');
    pj('comensal3', 4.13, 3.55, 0.48, 'd');
    pj('garzon', 5.6, 4.2, 0, 'i');
    pj('faro', 6.35, 3.7, 0, 'i');
    pj('encargado', 0.95, 4.45, 0, 'i');
    pj('comensal4', 3.68, 5.85, 0.48, 'd'); pj('comensal5', 4.92, 5.85, 0.48, 'i');
    pj('repartidor', 8.7, 2.85, 0, 'd');
    pj('dueno', 7.5, 5.45, 0, 'i');
    camina('aseo', [[1.8, 6.35, 3], [3.2, 6.55], [5.4, 6.55, 2.5], [3.2, 6.55]], { vel: 0.4 });
    L.cil(1.35, 6.5, 0, 0.13, 0.22, '#17C3B2', '#0A8A7E');
    // Un alfiler por módulo, en el mismo orden del video
    pin(1, 8.72, 0.05, 1.62, ROJO, '#FFFFFF');
    pin(2, 5.6, 4.2, 1.98, ROJO, '#FFFFFF');
    pin(3, 2.47, 0.05, 1.58, ROJO, '#FFFFFF');
    pin(4, 0.03, 4.9, 1.3, ROJO, '#FFFFFF');
    pin(5, 7.12, 0.9, 1.22, ROJO, '#FFFFFF');
    pin(6, 8.7, 2.85, 2.05, ROJO, '#FFFFFF');
    pin(7, 7.5, 5.45, 1.98, ROJO, '#FFFFFF');
    return { id: 'haru', ancho: W, fondo: D };
  });
}

// ───────── Fundos 360 · venta de parcelas ─────────
const araucaria = (x, y, s) => { const q = (n) => r1(n * s); return `<path d="M${x} ${y}V${r1(y - 33 * s)}" stroke="#1F3B2A" stroke-width="${q(3)}"/>` +
  `<path d="M${r1(x - 19 * s)} ${r1(y - 29 * s)}C${r1(x - 12 * s)} ${r1(y - 38 * s)} ${r1(x + 12 * s)} ${r1(y - 38 * s)} ${r1(x + 19 * s)} ${r1(y - 29 * s)}Z" fill="#1F3B2A"/>` +
  `<path d="M${r1(x - 11 * s)} ${r1(y - 36 * s)}C${r1(x - 7 * s)} ${r1(y - 43 * s)} ${r1(x + 7 * s)} ${r1(y - 43 * s)} ${r1(x + 11 * s)} ${r1(y - 36 * s)}Z" fill="#1F3B2A"/>`; };
export function fundos() {
  return montar(({ E, L, pj, camina, pin }) => {
    const W = 9.6, D = 7.0, VERDE = '#6FAF6B', ORO = '#C9A45C';
    base(E, L, W, D, { piso: '#2B4A3B', muroY: '#1D3A2D', muroX: '#183226', zocalo: '#10241A', tope: '#2F5A45', canto: '#10241A',
      dibujo: `<rect x="40" y="40" width="${W * 100 - 80}" height="${D * 100 - 80}" rx="18" fill="none" stroke="#335A47" stroke-width="5"/>` });
    // El plano de loteo en el muro: disponibles, reservadas y escrituradas
    let lotes = '';
    const est = ['d', 'v', 'd', 'r', 'v', 'd', 'v', 'd', 'd', 'r', 'v', 'd'];
    est.forEach((e, i) => {
      const c = i % 6, f = Math.floor(i / 6), x = 14 + c * 44, y = 40 + f * 40;
      const col = e === 'v' ? '#17446F' : e === 'r' ? '#E0B341' : '#9CCB8F';
      lotes += `<rect x="${x}" y="${y}" width="40" height="34" fill="${col}" stroke="#0B1726" stroke-width="2"/>` + mono(x + 7, y + 22, i + 1, 12, e === 'v' ? '#F2F4F7' : '#0B1726');
    });
    L.planoY(0.3, 0.02, 1.86, 290, 150, `<rect width="290" height="150" rx="5" fill="#F4ECD8" stroke="#0B1726" stroke-width="4"/>` + txt(14, 27, 'LOTEO · FUNDO NORTE', 14, '#0E2A47') + lotes +
      `<rect x="10" y="126" width="270" height="6" fill="#CFC2A3"/>` + [['#9CCB8F', 'Disponible'], ['#E0B341', 'Reservada'], ['#17446F', 'Escriturada']].map(([c, t], i) => `<rect x="${16 + i * 92}" y="136" width="9" height="9" fill="${c}" stroke="#0B1726" stroke-width="1.2"/>` + mono(29 + i * 92, 144, t, 8, '#0E2A47')).join(''));
    // Dos pantallas reales de Fundos 360: los leads y el panel del negocio
    pantallaY(L, 3.3, 1.92, 1.5, 0.98, '§M§recorte-fundos-1-leads.webp', { marco: '#0B1726' });
    pantallaY(L, 5.0, 1.92, 1.5, 0.98, '§M§recorte-fundos-6-dashboard.webp', { marco: '#0B1726' });
    // La ventana al fundo: volcán, araucarias y cerco
    L.planoY(6.75, 0.02, 1.84, 255, 118, `<rect width="255" height="118" rx="6" fill="#1E5C8A" stroke="#3A2E26" stroke-width="6"/><circle cx="214" cy="28" r="11" fill="#F2C14E"/>` +
      `<path d="M78 92L140 26H158L224 92Z" fill="#6B7A8C"/><path d="M140 26H158L170 38L161 43L151 35L142 43L130 37Z" fill="#F2F4F7"/>` +
      `<path d="M4 86Q70 50 140 76T251 70V112H4Z" fill="#3E7A4E"/><path d="M4 98Q100 70 180 94T251 92V112H4Z" fill="#2F6440"/>` +
      araucaria(30, 104, 1) + araucaria(54, 106, 0.72) + araucaria(228, 102, 0.9) +
      `<path d="M92 106V95M114 106V95M136 106V95M158 106V95" stroke="#CFC2A3" stroke-width="3"/><path d="M88 99H162" stroke="#CFC2A3" stroke-width="2"/><path d="M127 0V118M0 59H255" stroke="#3A2E26" stroke-width="5"/>`);
    // El emblema de Fundos y la pantalla del calendario de escrituras (real)
    L.planoX(1.55, 1.9, 125, 92, `<rect width="125" height="92" rx="6" fill="#10241A" stroke="${ORO}" stroke-width="2.5"/><image href="§M§logo-fundos.webp" x="10" y="8" width="105" height="76"/>`);
    pantallaX(L, 3.95, 1.9, 1.95, 1.05, '§M§recorte-fundos-4-escrituras.webp');
    // El archivo de posventa: mueble con carpetas y el timbre del Conservador
    L.caja(0.05, 4.55, 0, 0.55, 1.9, 1.25, { t: '#6E5238', l: '#5A4330', r: '#4A3526' }, 5.9);
    planoXen(L, 0.6, 6.45, 1.18, 190, 110, Array.from({ length: 17 }, (_, i) => { const c = ['#17446F', '#E0B341', '#3E7A4E', '#8B3A3A'][i % 4]; return `<rect x="${6 + i * 10.8}" y="${i % 3 ? 8 : 14}" width="9" height="${i % 3 ? 46 : 40}" rx="1.5" fill="${c}" stroke="#0B1726" stroke-width="1"/>`; }).join('') +
      `<rect x="4" y="60" width="182" height="4" fill="#3A2E26"/>` + Array.from({ length: 17 }, (_, i) => `<rect x="${6 + i * 10.8}" y="${i % 2 ? 68 : 72}" width="9" height="${i % 2 ? 38 : 34}" rx="1.5" fill="${['#F4ECD8', '#17446F', '#3E7A4E'][i % 3]}" stroke="#0B1726" stroke-width="1"/>`).join(''), 6.2);
    L.caja(0.15, 5.1, 1.25, 0.34, 0.45, 0.02, { t: '#F4ECD8', l: '#E8DFC8', r: '#CFC2A3' }, 6.35);
    L.piso(0.18, 5.14, `<rect width="28" height="38" fill="none"/><circle cx="14" cy="18" r="10" fill="none" stroke="#C8474A" stroke-width="2.4"/>` + mono(6, 21, 'CBR', 7, '#C8474A'), 6.36, 1.272);
    L.cil(0.35, 5.8, 1.25, 0.07, 0.1, '#3A2E26', '#2A211C', 6.4); L.cil(0.35, 5.8, 1.35, 0.03, 0.12, '#8B6A4E', '#6E5238', 6.41);
    // La maqueta del loteo: mesa de madera con el terreno por curvas de nivel, parcelas y pines
    L.caja(1.5, 2.2, 0, 2.8, 1.7, 0.62, MADERA);
    L.caja(1.6, 2.3, 0.62, 2.6, 1.5, 0.08, { t: '#4E8A55', l: '#3E7046', r: '#325C39' }, 5.95);
    L.caja(1.85, 2.45, 0.7, 2.05, 1.2, 0.07, { t: '#6FAF6B', l: '#4E8A55', r: '#3E7046' }, 5.96);
    L.piso(1.85, 2.45, `<g stroke="#2F6440" stroke-width="1.6" fill="none"><path d="M41 0V120M82 0V120M123 0V120M164 0V120M0 60H205"/></g>`, 5.97, 0.771);
    L.caja(2.3, 2.7, 0.77, 1.2, 0.7, 0.06, { t: '#9CCB8F', l: '#6FAF6B', r: '#4E8A55' }, 5.98);
    L.piso(2.3, 2.7, `<g stroke="#4E8A55" stroke-width="1.6" fill="none"><path d="M40 0V70M80 0V70M0 35H120"/></g>`, 5.99, 0.831);
    const sobre = (x, y) => x > 2.3 && x < 3.5 && y > 2.7 && y < 3.4 ? 0.83 : x > 1.85 && x < 3.9 && y > 2.45 && y < 3.65 ? 0.77 : 0.7;
    [[2.05, 2.6, '#17C3B2'], [2.75, 2.8, '#17446F'], [3.55, 2.9, '#17C3B2'], [2.6, 3.2, '#E0B341'], [3.2, 3.3, '#17C3B2'], [2.0, 3.4, '#E0B341'], [3.7, 3.5, '#17446F']].forEach(([x, y, c]) => {
      const z = sobre(x, y), k = 6.0 + (x + y) * 0.01;
      L.linea([[x, y, z], [x, y, z + 0.3]], '#0B1726', 1.6, k);
      L.cil(x, y, z + 0.3, 0.065, 0.065, c, c, k + 0.001);
    });
    L.anim('loc-pin', () => { const x = 2.95, y = 3.0, z = sobre(x, y), k = 6.0 + (x + y) * 0.01; L.linea([[x, y, z], [x, y, z + 0.3]], '#0B1726', 1.6, k); L.cil(x, y, z + 0.3, 0.065, 0.065, '#E0B341', '#E0B341', k + 0.001); });
    for (const [x, y] of [[1.75, 3.7], [4.0, 2.4], [4.05, 3.6]]) { const k = 6.0 + (x + y) * 0.01; L.cil(x, y, 0.7, 0.03, 0.09, '#6E5238', '#5A4330', k); L.luz(x, y, 0.94, 7, 7, '#2F6440', k + 0.001); L.luz(x, y, 1.0, 5, 5, '#4E8A55', k + 0.002); }
    // La alfombra redonda: doce módulos, un solo recorrido
    const MOD = ['Leads', 'Dashboard', 'Parcelas', 'Promociones', 'Reservas', 'Escrituras', 'Comisiones', 'Calendario', 'Facturación', 'Postventa', 'Clientes', 'Recursos'];
    L.piso(1.3, 4.7, `<circle cx="110" cy="110" r="106" fill="#1F3B2E" stroke="${ORO}" stroke-width="3"/><circle cx="110" cy="110" r="84" fill="none" stroke="${ORO}" stroke-width="1.6" stroke-dasharray="3 5"/>` +
      MOD.map((t, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2, x = 110 + Math.cos(a) * 84, y = 110 + Math.sin(a) * 84; return `<circle cx="${r1(x)}" cy="${r1(y)}" r="6.5" fill="${ORO}"/>`; }).join('') +
      `<image href="§M§logo-fundos.webp" x="62" y="72" width="96" height="70"/>`, -54);
    // El escritorio de reservas: la ficha con valor, promoción y reserva, y la tablet donde se firma
    mostradorY(L, 8.05, 0.6, 3.9, 5.7, 0.8, { t: '#E8DFC8', l: '#8B6A4E', r: '#6E5238' }, 0.45);
    L.caja(8.15, 4.3, 0.8, 0.4, 0.5, 0.03, { t: '#F4ECD8', l: '#E8DFC8', r: '#CFC2A3' });
    L.piso(8.15, 4.3, mono(5, 14, 'RESERVA', 7, '#0E2A47') + `<rect x="5" y="22" width="30" height="3" fill="#8FA3B8"/><rect x="5" y="30" width="22" height="3" fill="#8FA3B8"/><path d="M6 42Q12 36 18 42T30 40" fill="none" stroke="#17446F" stroke-width="1.6"/>`, 13.0, 0.832);
    L.caja(8.2, 5.0, 0.8, 0.36, 0.26, 0.025, { t: '#0B1726', l: '#0B1726', r: '#0B1726' });
    L.piso(8.23, 5.03, `<image href="§M§recorte-fundos-3-reservas.webp" width="30" height="20" preserveAspectRatio="xMidYMid slice"/>`, 13.9, 0.83);
    L.cil(8.35, 5.5, 0.8, 0.06, 0.12, '#F2F4F7', '#C4D2E0', 14.3);
    // Teodolito de topógrafo junto a la ventana
    L.linea([[8.35, 1.55, 1.08], [8.1, 1.4, 0]], '#B9C8D8', 2.4, 9.9); L.linea([[8.35, 1.55, 1.08], [8.6, 1.45, 0]], '#B9C8D8', 2.4, 9.9); L.linea([[8.35, 1.55, 1.08], [8.35, 1.87, 0]], '#B9C8D8', 2.4, 10.2);
    L.caja(8.25, 1.45, 1.08, 0.22, 0.18, 0.2, { t: '#F2C14E', l: '#E0B341', r: '#B8902E' }, 10.3);
    L.planta(9.2, 2.9, 0, undefined, 0.85); L.planta(4.9, 0.45, 0, undefined, 0.7);
    // La gente
    pj('vendedora', 3.3, 1.65, 0, 'd');
    pj('senor', 2.35, 4.55, 0, 'd'); pj('senora', 3.15, 4.65, 0, 'i');
    camina('jefaventas', [[5.75, 1.3, 3], [5.0, 2.1], [4.7, 2.9, 2.5], [5.0, 2.1]]);
    pj('finanzas', 9.05, 4.65, 0, 'i');
    pj('comprador', 7.45, 4.95, 0, 'd');
    pj('maestro', 8.95, 2.1, 0, 'i');
    camina('nino', [[1.2, 4.2, 2], [1.05, 2.1], [2.3, 1.85, 2.5], [1.05, 2.1]], { e: EA * 0.72, vel: 0.8 });
    // Un alfiler por módulo del video
    pin(1, 4.05, 0.05, 1.42, VERDE); pin(2, 2.95, 3.0, 1.15, VERDE); pin(3, 8.35, 4.55, 0.85, VERDE); pin(4, 0.03, 2.95, 1.35, VERDE);
    pin(5, 0.35, 5.5, 1.3, VERDE); pin(6, 5.75, 0.05, 1.42, VERDE); pin(7, 2.4, 5.8, 0.03, VERDE);
    return { id: 'fundos', ancho: W, fondo: D };
  });
}

// ───────── Nu Home 360 · casas modulares ─────────
export function nuhome() {
  return montar(({ E, L, pj, camina, pin }) => {
    const W = 9.8, D = 7.0, ORO = '#E0B341';
    base(E, L, W, D, { piso: '#5E6670', muroY: '#3A3733', muroX: '#33302C', zocalo: '#24211E', tope: '#4A4640', canto: '#24211E',
      dibujo: `<g stroke="#535A63" stroke-width="2.2">${Array.from({ length: 9 }, (_, i) => `<path d="M${(i + 1) * 100} 0V${D * 100}"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${(i + 1) * 100}H${W * 100}"/>`).join('')}</g>` });
    // El diseñador 3D en pantalla grande (real) y el logo de Nu Home
    pantallaY(L, 0.3, 1.92, 2.2, 1.24, '§M§recorte-nuhome-1-disenador.webp', { marco: '#1C1917' });
    L.planoY(2.85, 0.02, 1.9, 150, 62, `<rect width="150" height="62" rx="4" fill="#1C1917"/><image href="§M§logo-nuhome.webp" x="37" y="4" width="76" height="54"/>`);
    // Catálogo de módulos
    const mod = (x, t, c) => `<rect x="${x}" y="6" width="34" height="50" rx="3" fill="#F2F4F7" stroke="#0B1726" stroke-width="1.6"/><path d="M${x + 7} 24L${x + 17} 18L${x + 27} 24V35L${x + 17} 41L${x + 7} 35Z" fill="${c}" stroke="#0B1726" stroke-width="1.2"/><path d="M${x + 7} 24L${x + 17} 30L${x + 27} 24M${x + 17} 30V41" fill="none" stroke="#0B1726" stroke-width="1.2"/>` + mono(x + 5, 52, t, 6.4, '#0B1726');
    L.planoY(2.85, 0.02, 1.2, 150, 62, `<rect width="150" height="62" rx="4" fill="#4A4640"/>` + mod(4, 'M1', '#E9EEF2') + mod(41, 'M2', '#C9A27A') + mod(78, 'M3', '#7FD8CF') + mod(115, 'M4', ORO));
    // La carta Gantt de la fábrica (real) y el portón de la fábrica
    pantallaY(L, 4.75, 1.92, 2.3, 1.2, '§M§recorte-nuhome-5-fabricacion.webp', { marco: '#1C1917' });
    L.planoY(7.3, 0.02, 1.95, 230, 195, `<rect width="230" height="195" fill="#6B7078"/>` + Array.from({ length: 19 }, (_, i) => `<path d="M0 ${8 + i * 10}H230" stroke="#555A61" stroke-width="3"/>`).join('') +
      `<rect x="0" y="0" width="230" height="14" fill="#2A2724"/><rect x="70" y="20" width="90" height="22" rx="3" fill="#1C1917"/>` + mono(84, 36, 'FÁBRICA', 11, ORO) + `<path d="M0 195L20 175H210L230 195" fill="none" stroke="#E0B341" stroke-width="4" stroke-dasharray="10 8"/>`);
    // El CRM de leads (real) y el informe de visita técnica, con su timbre
    pantallaX(L, 2.45, 1.9, 2.0, 1.1, '§M§recorte-nuhome-2-leads.webp', { marco: '#1C1917' });
    L.planoX(5.0, 1.88, 200, 118, `<rect width="200" height="118" rx="4" fill="#F4ECD8" stroke="#1C1917" stroke-width="4"/><image href="§M§recorte-nuhome-4-visita.webp" x="6" y="6" width="188" height="106" preserveAspectRatio="xMidYMid slice"/>` +
      `<g transform="translate(150 92) rotate(-8)"><rect x="-34" y="-11" width="68" height="22" rx="3" fill="rgba(244,236,216,.9)" stroke="#2F8A4E" stroke-width="2.4"/>` + mono(-28, 5, 'FACTIBLE', 11, '#2F8A4E') + `</g>`);
    // Muestras de materiales
    L.caja(0.05, 5.6, 0, 0.45, 1.1, 0.9, { t: '#8B7A66', l: '#6E5F4E', r: '#5A4D40' });
    planoXen(L, 0.5, 6.62, 0.86, 100, 76, [['#C9A27A', 6, 6], ['#8FA3B8', 52, 6], ['#F2F4F7', 6, 40], ['#3A424E', 52, 40]].map(([c, x, y]) => `<rect x="${x}" y="${y}" width="42" height="30" fill="${c}" stroke="#0B1726" stroke-width="1.4"/>`).join(''), 6.5);
    // El escritorio del ejecutivo, con el cotizador en el notebook
    mostradorY(L, 1.25, 0.65, 1.1, 2.6, 0.76, { t: '#E8DFC8', l: '#8B6A4E', r: '#6E5238' }, 0.5);
    L.caja(1.35, 1.55, 0.76, 0.34, 0.46, 0.03, { t: '#1C1917', l: '#1C1917', r: '#0B0B0B' });
    planoXen(L, 1.38, 2.0, 1.12, 44, 34, `<rect width="44" height="34" rx="2" fill="#1C1917"/><image href="§M§recorte-nuhome-3-cotizacion.webp" x="2" y="2" width="40" height="30" preserveAspectRatio="xMidYMid slice"/>`, 3.9);
    // La casa armándose en la fábrica: plataforma, módulos y la grúa bajando el último
    L.caja(4.9, 1.4, 0, 3.4, 2.2, 0.16, { t: '#B98B5E', l: '#9C7B55', r: '#7E6242' });
    const ventanas = (x, y, z, w, d, h) => L.add(x + w + y + d + 0.4, L.poly([[x + 0.2, y + d + 0.001, z + 0.2], [x + 0.55, y + d + 0.001, z + 0.2], [x + 0.55, y + d + 0.001, z + h - 0.12], [x + 0.2, y + d + 0.001, z + h - 0.12]], `fill="#1C1917"`) +
      L.poly([[x + w + 0.001, y + 0.22, z + 0.2], [x + w + 0.001, y + 0.62, z + 0.2], [x + w + 0.001, y + 0.62, z + h - 0.12], [x + w + 0.001, y + 0.22, z + h - 0.12]], `fill="rgba(127,216,207,.55)"`));
    L.caja(5.15, 1.6, 0.16, 1.3, 1.0, 0.7, { t: '#E9EEF2', l: '#C4D2E0', r: '#9FB2C4' }); ventanas(5.15, 1.6, 0.16, 1.3, 1.0, 0.7);
    L.caja(6.55, 1.6, 0.16, 1.3, 1.0, 0.7, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' }); ventanas(6.55, 1.6, 0.16, 1.3, 1.0, 0.7);
    L.caja(6.55, 1.6, 0.86, 1.3, 1.0, 0.56, { t: '#F2F4F7', l: '#D5E2EE', r: '#B9C8D8' }, 6.55 + 0.65 + 1.6 + 0.5 + 0.8); ventanas(6.55, 1.6, 0.86, 1.3, 1.0, 0.56);
    L.add(12.3, L.poly([[5.15, 2.75, 0.165], [6.45, 2.75, 0.165], [6.45, 3.5, 0.165], [5.15, 3.5, 0.165]], `fill="none" stroke="#F2F4F7" stroke-width="1.6" stroke-dasharray="5 4"/>`));
    L.caja(8.75, 1.0, 0, 0.14, 0.14, 2.2, { t: ORO, l: '#B8902E', r: '#8C6D22' }, 9.9);
    L.linea([[8.82, 1.07, 2.15], [5.82, 3.12, 2.15]], ORO, 4, 11.5);
    L.anim('loc-grua', () => {
      L.linea([[5.82, 3.12, 2.13], [5.82, 3.12, 1.62]], '#3A424E', 1.4, 11.6);
      L.caja(5.3, 2.8, 1.2, 1.05, 0.65, 0.42, { t: '#E9EEF2', l: '#C4D2E0', r: '#9FB2C4' }, 11.7);
    });
    // La casa entregada: dos módulos sobre su radier, puerta y el letrero de entregada
    L.caja(6.75, 5.0, 0, 2.6, 0.95, 0.1, { t: '#8FA3B8', l: '#6B7A8C', r: '#56687B' });
    L.caja(6.85, 5.08, 0.1, 1.2, 0.8, 0.66, { t: '#E9EEF2', l: '#C4D2E0', r: '#9FB2C4' }); ventanas(6.85, 5.08, 0.1, 1.2, 0.8, 0.66);
    L.caja(8.1, 5.08, 0.1, 1.15, 0.8, 0.66, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' });
    L.add(13.95, L.poly([[8.45, 5.881, 0.1], [8.8, 5.881, 0.1], [8.8, 5.881, 0.64], [8.45, 5.881, 0.64]], `fill="#1C1917"`) + L.poly([[8.72, 5.882, 0.36], [8.76, 5.882, 0.36], [8.76, 5.882, 0.4], [8.72, 5.882, 0.4]], `fill="${ORO}"`));
    L.planoY(7.05, 5.886, 0.6, 58, 20, `<rect width="58" height="20" rx="3" fill="${ORO}"/>` + mono(5, 14, 'ENTREGADA', 7.8, '#1C1917'), 13.9);
    // Bucle construyendo la siguiente rebanada en su notebook
    L.caja(2.95, 3.25, 0, 0.7, 0.5, 0.95, { t: '#E8DFC8', l: '#8B6A4E', r: '#6E5238' });
    L.caja(3.07, 3.33, 0.95, 0.4, 0.3, 0.02, { t: '#1C1917', l: '#1C1917', r: '#0B0B0B' });
    L.planoY(3.07, 3.35, 1.25, 40, 28, `<rect width="40" height="28" rx="2" fill="#0B1726"/><path d="M5 8H22M5 14H30M5 20H18" stroke="#7FD8CF" stroke-width="2.4"/>`, 7.25);
    L.planta(9.35, 3.8, 0, undefined, 0.8);
    // La gente
    pj('clienta', 1.7, 0.75, 0, 'd');
    pj('ejecutivo', 0.75, 1.8, 0, 'd');
    pj('cliente', 2.35, 2.1, 0, 'i');
    pj('ingeniera', 0.95, 3.85, 0, 'd');
    pj('bucle', 3.95, 3.5, 0, 'i');
    camina('maestro', [[8.2, 3.9, 2.5], [5.3, 4.0, 2.5]]);
    pj('soldador', 8.95, 2.0, 0, 'i');
    pj('clienta2', 3.4, 5.55, 0, 'd');
    pj('papa', 7.55, 6.5, 0, 'd'); pj('mama', 8.35, 6.6, 0, 'i'); 
    camina('nino', [[6.85, 6.6, 2], [5.3, 6.25, 1.5], [6.2, 4.5, 2], [6.4, 5.9]], { e: EA * 0.72, vel: 0.8 });
    // Un alfiler por paso del video
    pin(1, 1.4, 0.05, 1.3, ORO); pin(2, 0.03, 1.45, 1.35, ORO); pin(3, 2.35, 2.1, 1.98, ORO); pin(4, 0.03, 4.0, 1.3, ORO);
    pin(5, 5.9, 0.05, 1.32, ORO); pin(6, 3.4, 5.55, 1.98, ORO); pin(7, 7.55, 6.5, 2.05, ORO);
    return { id: 'nuhome', ancho: W, fondo: D };
  });
}

// ───────── Eleven 360 · gimnasio, Arica ─────────
const OSC = { t: '#3A424E', l: '#2A3038', r: '#1E232A' };
export function eleven() {
  return montar(({ E, L, pj, camina, pin }) => {
    const W = 9.4, D = 7.0, CIAN = '#17C3B2';
    base(E, L, W, D, { piso: '#23282E', muroY: '#1B232C', muroX: '#161D25', zocalo: '#10161C', tope: '#2A3644', canto: '#10161C',
      dibujo: `<rect x="30" y="30" width="${W * 100 - 60}" height="${D * 100 - 60}" fill="none" stroke="${CIAN}" stroke-width="3" opacity=".55"/>` +
        `<path d="M40 330H420M40 360H420" stroke="#2E353F" stroke-width="3"/>` });
    // Espejo, el horario de clases y el nombre en el muro
    L.planoY(0.3, 0.02, 1.86, 280, 165, `<rect width="280" height="165" fill="#9FC3D9" stroke="#0B1726" stroke-width="4"/><path d="M93 0V165M186 0V165" stroke="#7FA6BF" stroke-width="3"/>` +
      `<path d="M20 155L75 10M44 155L99 10M120 155L165 40M200 155L245 20" stroke="#DDF4F1" stroke-width="7" opacity=".55"/>`);
    L.planoY(3.35, 0.02, 1.86, 175, 112, `<rect width="175" height="112" rx="6" fill="#0B2B45" stroke="#0B1726" stroke-width="4"/>` + mono(12, 20, 'CLASES DE HOY', 10.5, '#7FD8CF') + mono(118, 20, 'CUPOS', 8.5, '#B9C8D8') +
      [['07:00', 'Funcional', '12/20', .6], ['12:30', 'Yoga', '8/15', .53], ['18:00', 'BXO', '16/18', .89], ['19:30', 'Spinning', '18/20', .9]].map(([h, c, q, f], i) => mono(12, 42 + i * 19, h, 9, '#B9C8D8') + txt(52, 42 + i * 19, c, 10.5, '#F2F4F7') +
        `<rect x="116" y="${33 + i * 19}" width="46" height="11" rx="5" fill="#123459"/><rect x="116" y="${33 + i * 19}" width="${r1(46 * f)}" height="11" rx="5" fill="${CIAN}"/>` + mono(120, 42 + i * 19, q, 7.6, '#0B1726')).join(''));
    L.planoY(5.55, 0.02, 1.95, 360, 60, txt(18, 44, 'ELEVEN 360', 40, '#F2F4F7') + `<rect x="276" y="10" width="70" height="42" rx="6" fill="${CIAN}"/>` + txt(290, 44, '11', 34, '#0B1726'));
    L.planoY(5.55, 0.02, 1.25, 360, 22, `<rect width="360" height="22" fill="#2A3644"/>` + mono(14, 15, 'CLUB FITNESS  ·  BXO  ·  ARICA', 10, '#7FD8CF'));
    // Bicicletas de spinning
    const bici = (x, y) => {
      L.caja(x - 0.45, y - 0.12, 0, 0.9, 0.24, 0.08, OSC);
      L.caja(x - 0.2, y - 0.04, 0.08, 0.08, 0.08, 0.62, OSC);
      L.caja(x - 0.34, y - 0.1, 0.7, 0.3, 0.2, 0.06, { t: '#1F2733', l: '#141A23', r: '#0B1726' });
      L.caja(x + 0.3, y - 0.04, 0.08, 0.08, 0.08, 0.8, OSC);
      L.caja(x + 0.22, y - 0.18, 0.86, 0.1, 0.36, 0.05, { t: '#B9C8D8', l: '#8FA3B8', r: '#6B7A8C' });
      L.planoY(x - 0.05, y + 0.13, 0.62, 44, 44, `<circle cx="22" cy="22" r="20" fill="#2A3038" stroke="${CIAN}" stroke-width="4"/><circle cx="22" cy="22" r="5" fill="${CIAN}"/>`, x + y + 0.12);
    };
    for (const x of [6.1, 7.35, 8.6]) bici(x, 1.45);
    // Rack de mancuernas en el muro izquierdo y banca
    L.caja(0.1, 1.0, 0, 0.55, 2.6, 0.72, OSC);
    for (let i = 0; i < 6; i++) { const y = 1.15 + i * 0.42; L.caja(0.2, y, 0.72, 0.35, 0.12, 0.08, { t: '#B9C8D8', l: '#8FA3B8', r: '#6B7A8C' }, 0.8 + y); L.cil(0.2, y + 0.06, 0.72, 0.1, 0.14, i % 2 ? CIAN : '#35679A', i % 2 ? '#0A8A7E' : '#17446F', 0.81 + y); L.cil(0.55, y + 0.06, 0.72, 0.1, 0.14, i % 2 ? CIAN : '#35679A', i % 2 ? '#0A8A7E' : '#17446F', 0.82 + y); }
    // La tienda: repisas con batidos, toallas y poleras, y el mesón de recepción
    L.planoX(6.6, 1.88, 230, 150, `<rect width="230" height="150" rx="5" fill="#1F2733"/>` + [44, 92, 140].map(y => `<rect x="6" y="${y}" width="218" height="5" fill="#6B7A8C"/>`).join('') +
      [0, 1, 2, 3, 4, 5].map(i => `<rect x="${14 + i * 34}" y="16" width="20" height="28" rx="4" fill="${i % 2 ? CIAN : '#F2F4F7'}"/><rect x="${14 + i * 34}" y="12" width="20" height="6" rx="2" fill="#0B1726"/>`).join('') +
      [0, 1, 2, 3].map(i => `<rect x="${12 + i * 52}" y="58" width="40" height="34" rx="3" fill="${['#E0524A', '#F2F4F7', '#17446F', CIAN][i]}"/>` + txt(22 + i * 52, 82, '11', 14, i === 1 ? '#0B1726' : '#F2F4F7')).join('') +
      [0, 1, 2, 3, 4].map(i => `<rect x="${14 + i * 42}" y="112" width="30" height="28" rx="3" fill="${['#F2F4F7', '#9FD3E6', '#F2F4F7', '#9FD3E6', '#F2F4F7'][i]}"/>`).join('') + mono(8, 12, 'TIENDA', 8, '#7FD8CF'));
    mostradorX(L, 0.85, 2.95, 5.35, 0.6, 0.95, { t: '#E8EEF4', l: '#35679A', r: '#27507C' }, 0.42);
    L.planoY(0.9, 5.951, 0.8, 200, 34, `<rect width="200" height="34" fill="${CIAN}"/>` + txt(52, 24, 'RECEPCIÓN', 16, '#0B1726'), 9.2);
    L.cil(1.25, 5.62, 0.95, 0.07, 0.2, CIAN, '#0A8A7E', 7.9); L.cil(1.45, 5.62, 0.95, 0.07, 0.2, '#F2F4F7', '#C4D2E0', 7.95);
    L.caja(2.35, 5.45, 0.95, 0.34, 0.26, 0.025, { t: '#0B1726', l: '#0B1726', r: '#0B1726' });
    // Trotadora y pesas rusas en el centro
    L.caja(3.6, 2.6, 0, 1.55, 0.72, 0.2, OSC);
    const franjas = (xs, clase) => `<g class="${clase}">` + xs.map(x => L.poly([[x, 2.67, 0.215], [x, 3.25, 0.215]], `stroke="#2F3945" stroke-width="2"`)).join('') + '</g>';
    L.add(6.85, L.poly([[3.68, 2.67, 0.21], [4.9, 2.67, 0.21], [4.9, 3.25, 0.21], [3.68, 3.25, 0.21]], `fill="#141A23"`) + franjas([3.9, 4.3, 4.7], 'loc-cinta') + franjas([4.1, 4.5], 'loc-cinta loc-cinta-b'));
    L.caja(5.0, 2.63, 0.2, 0.1, 0.66, 1.0, OSC, 7.2);
    L.caja(4.82, 2.7, 1.12, 0.3, 0.52, 0.14, { t: CIAN, l: '#0A8A7E', r: '#077068' }, 7.3);
    for (const [x, y, t, l] of [[2.75, 3.55, CIAN, '#0A8A7E'], [3.05, 3.7, '#35679A', '#17446F'], [3.35, 3.55, '#E0524A', '#A8352F']]) { L.cil(x, y, 0, 0.14, 0.2, t, l); L.linea([[x - 0.08, y, 0.2], [x - 0.08, y, 0.3], [x + 0.08, y, 0.3], [x + 0.08, y, 0.2]], l, 2.4, x + y + 0.2); }
    // El plan de The Architect: la propuesta dibujada en un atril
    L.caja(4.4, 4.3, 0, 0.06, 0.06, 1.35, OSC, 8.75); L.caja(5.4, 4.3, 0, 0.06, 0.06, 1.35, OSC, 9.75);
    L.planoY(4.3, 4.34, 1.72, 125, 80, `<rect width="125" height="80" rx="4" fill="#F4ECD8" stroke="#0B1726" stroke-width="3"/>` + mono(8, 14, 'LA PROPUESTA', 8, '#0E2A47') +
      [['Sitio', 10, 26], ['Clases', 64, 26], ['Rescate', 10, 52], ['Tienda', 64, 52]].map(([t, x, y]) => `<rect x="${x}" y="${y}" width="50" height="18" rx="4" fill="none" stroke="#17446F" stroke-width="2"/>` + mono(x + 5, y + 12.5, t, 7.4, '#17446F')).join('') +
      `<path d="M60 35H64M35 44V52M89 44V52M60 61H64" stroke="#E0524A" stroke-width="2.4"/>`, 9.3);
    // El torniquete con el lector de huella de siempre
    L.caja(7.7, 5.3, 0, 0.16, 0.16, 1.0, { t: '#B9C8D8', l: '#8FA3B8', r: '#6B7A8C' });
    L.caja(7.6, 5.24, 1.0, 0.36, 0.28, 0.06, { t: '#0B2B45', l: '#0B2B45', r: '#091D33' }, 13.6);
    L.piso(7.63, 5.27, `<g class="loc-huella" fill="none" stroke="${CIAN}" stroke-width="2.6" stroke-linecap="round"><path d="M6 20Q6 6 15 6Q24 6 24 20"/><path d="M10 21Q10 10 15 10Q20 10 20 21"/><path d="M15 14V22"/></g>`, 13.7, 1.065);
    L.linea([[7.78, 5.46, 0.6], [7.78, 6.1, 0.6]], '#B9C8D8', 3.2, 13.8);
    L.caja(8.6, 5.3, 0, 0.16, 0.16, 1.0, { t: '#B9C8D8', l: '#8FA3B8', r: '#6B7A8C' });
    L.planta(9.1, 3.4, 0, undefined, 0.85);
    // La gente
    camina('instructor', [[1.6, 1.25, 2.5], [1.9, 2.85, 2], [3.1, 2.2, 2], [1.9, 2.85]]);
    pj('atleta', 2.45, 1.9, 0, 'i');
    pj('atleta2', 1.2, 2.25, 0, 'd');
    pj('ciclista', 5.9, 1.45, 0.74, 'd', EA, 7.7); pj('ciclista2', 7.15, 1.45, 0.74, 'd', EA, 8.95);
    pj('corredora', 4.25, 2.95, 0.2, 'de');
    pj('recepcionista', 1.9, 4.95, 0, 'd');
    pj('architect', 4.0, 4.85, 0, 'd');
    pj('duenagym', 6.3, 4.7, 0, 'i');
    camina('socio', [[8.2, 6.6, 2.5], [8.2, 5.85, 1.2], [8.2, 4.6], [7.0, 3.6], [6.1, 2.35, 3], [7.0, 3.6], [8.2, 4.6], [8.2, 5.85, 1]]);
    // Un alfiler por punto del sistema
    pin(1, 4.2, 0.05, 1.35, CIAN); pin(2, 6.3, 4.7, 1.95, CIAN); pin(3, 0.03, 5.5, 1.3, CIAN); pin(4, 7.78, 5.38, 1.1, CIAN);
    return { id: 'eleven', ancho: W, fondo: D };
  });
}

// ───────── Rumbo · app de desarrollo personal (producto de BiPlot) ─────────
export function rumbo() {
  return montar(({ E, L, pj, camina, pin }) => {
    const W = 9.0, D = 6.8, TEAL = '#7FD8CF';
    base(E, L, W, D, { piso: '#1D4F55', muroY: '#173F48', muroX: '#12353D', zocalo: '#0E2B31', tope: '#245A62', canto: '#0E2B31',
      dibujo: `<path d="M60 610C170 560 250 520 330 470S520 400 600 330S700 230 640 180" fill="none" stroke="${TEAL}" stroke-width="12" stroke-dasharray="2 22" stroke-linecap="round"/>` +
        `<path class="loc-camino" d="M60 610C170 560 250 520 330 470S520 400 600 330S700 230 640 180" fill="none" stroke="#DDF4F1" stroke-width="6" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100"/>` +
        [[60, 610, 'Día 1', 24, 8], [330, 470, 'Día 7', -24, -26], [600, 330, 'Día 30', 22, 10]].map(([x, y, t, dx, dy]) => `<circle cx="${x}" cy="${y}" r="18" fill="#0E2A47" stroke="${TEAL}" stroke-width="5"/>` + mono(x + dx, y + dy, t, 20, '#DDF4F1')).join('') });
    // La ventana del amanecer: el ritual de la mañana
    L.planoY(0.35, 0.02, 1.84, 220, 128, `<defs><linearGradient id="amanecer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F29A6B"/><stop offset=".6" stop-color="#F7C98E"/><stop offset="1" stop-color="#F2E0B5"/></linearGradient></defs>` +
      `<rect width="220" height="128" rx="6" fill="url(#amanecer)" stroke="#0E2B31" stroke-width="6"/><circle cx="110" cy="96" r="24" fill="#FBE3A6"/><path d="M0 104Q60 80 110 100T220 94V128H0Z" fill="#2A7C78"/><path d="M0 116Q80 98 150 114T220 112V128H0Z" fill="#1F5F5C"/><path d="M110 0V128M0 64H220" stroke="#0E2B31" stroke-width="5"/>`);
    L.cil(1.45, 1.1, 0, 0.42, 0.13, '#E8DFC8', '#CFC2A3');
    // El celular gigante con la app
    L.planoY(2.9, 0.02, 1.9, 120, 180, `<rect width="120" height="180" rx="18" fill="#0B1726"/><rect x="8" y="10" width="104" height="160" rx="11" fill="#0E2A47"/>` + mono(20, 32, 'HOY', 10, TEAL) +
      `<circle cx="60" cy="76" r="27" fill="none" stroke="#17446F" stroke-width="8"/><path d="M60 49A27 27 0 1 1 34 83" fill="none" stroke="#17C3B2" stroke-width="8" stroke-linecap="round"/>` + txt(47, 83, '12', 18, '#F2F4F7', ' class="loc-a"') + txt(47, 83, '13', 18, '#F2F4F7', ' class="loc-b"') +
      ['Ritual de mañana', 'Leer 20 min', 'Caminar', 'Ahorrar', 'Diario'].map((t, i) => `<rect x="16" y="${116 + i * 11}" width="7" height="7" rx="2" fill="${i < 3 ? '#17C3B2' : 'none'}"${i === 3 ? ' class="loc-habito"' : ''} stroke="#17C3B2" stroke-width="1.4"/>` + mono(28, 122 + i * 11, t, 6.8, '#DDF4F1')).join(''));
    // El mural de la montaña con la meta arriba
    L.planoY(4.55, 0.02, 1.9, 410, 150, `<rect width="410" height="150" rx="5" fill="#15546A"/><path d="M0 150L90 60L150 105L250 20L410 135V150Z" fill="#2A7C78"/><path d="M0 150L70 112L150 142L240 78L410 150Z" fill="#1F5F5C"/>` +
      `<path d="M250 20L250 -2" stroke="#F2F4F7" stroke-width="2.4"/><path d="M250 -2L272 5L250 12Z" fill="#17C3B2"/><path d="M226 40L250 20L270 36L258 42L250 34L240 44Z" fill="#DDF4F1"/>` + txt(18, 30, 'Rumbo', 24, '#DDF4F1'));
    // La escalera al final del camino: un peldaño por paso, con la bandera arriba
    for (let j = 4; j >= 0; j--) L.caja(5.6 + j * 0.55, 0.8, 0, 0.55, 1.5, 0.2 * (j + 1), { t: '#3E9C95', l: '#2A7C78', r: '#1F5F5C' });
    L.linea([[8.1, 1.55, 1.0], [8.1, 1.55, 1.75]], '#F2F4F7', 2.2, 10.2);
    L.anim('loc-bandera', () => L.add(10.21, L.poly([[8.1, 1.55, 1.75], [8.45, 1.55, 1.65], [8.1, 1.55, 1.55]], `fill="#17C3B2"`)));
    // Biblioteca y sillón de lectura
    L.planoX(2.75, 1.88, 200, 150, `<rect width="200" height="150" rx="4" fill="#3A2E26"/>` + [46, 96, 144].map(y => `<rect x="4" y="${y}" width="192" height="5" fill="#8B6A4E"/>`).join('') +
      [0, 1, 2].map(f => Array.from({ length: 16 }, (_, i) => `<rect x="${8 + i * 11.6}" y="${f * 50 + 10 + (i % 3) * 3}" width="9" height="${36 - (i % 3) * 3}" rx="1" fill="${['#17446F', '#E0B341', '#3E9C95', '#C8474A', '#F4ECD8'][(i + f) % 5]}"/>`).join('')).join(''));
    L.caja(0.45, 2.95, 0, 0.8, 0.75, 0.42, { t: '#C9824E', l: '#A8683A', r: '#8C5530' });
    L.caja(0.35, 2.95, 0.42, 0.18, 0.75, 0.55, { t: '#C9824E', l: '#A8683A', r: '#8C5530' }, 3.9);
    // Muro de insignias: rangos y logros
    L.planoX(5.3, 1.8, 190, 110, `<rect width="190" height="110" rx="6" fill="#0E2A47" stroke="${TEAL}" stroke-width="2"/>` + mono(12, 20, 'INSIGNIAS', 10, TEAL) +
      [[30, 55, '#E0B341'], [75, 55, '#B9C8D8'], [120, 55, '#C9824E'], [165, 55, '#17C3B2'], [52, 90, '#7FD8CF'], [98, 90, '#E0B341'], [144, 90, '#F2F4F7']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="15" fill="${c}" stroke="#0B1726" stroke-width="2"/><path d="M${x - 6} ${y}L${x - 1} ${y + 5}L${x + 7} ${y - 5}" fill="none" stroke="#0B1726" stroke-width="2.4"/>`).join(''));
    // Mesa de café con el diario y el frasco del ahorro
    L.cil(3.4, 5.6, 0, 0.05, 0.62, '#3A424E', '#2A3038'); L.cil(3.4, 5.6, 0.62, 0.36, 0.05, '#E8DFC8', '#CFC2A3');
    L.caja(3.3, 5.45, 0.67, 0.3, 0.22, 0.02, { t: '#F4ECD8', l: '#E8DFC8', r: '#CFC2A3' });
    L.cil(3.6, 5.72, 0.67, 0.07, 0.16, 'rgba(221,244,241,.5)', 'rgba(221,244,241,.35)', 9.5); L.luz(3.6, 5.72, 0.72, 3, 1.4, '#E0B341', 9.51);
    L.planta(0.55, 6.2, 0, undefined, 0.9); L.planta(8.6, 4.6, 0, undefined, 0.8);
    // La gente
    pj('meditadora', 1.45, 1.1, 0.13, 'd');
    pj('lectora', 0.85, 3.3, 0.42, 'd');
    camina('caminante', [[3.3, 4.6, 2], [2.1, 5.3], [0.95, 5.95, 2.5], [2.1, 5.3]]);
    pj('estudiante', 6.95, 1.55, 0.6, 'de');
    camina('corredora', [[5.95, 3.85, 1.5], [7.6, 3.55], [7.9, 5.4], [5.2, 5.65]], { vel: 1.0 });
    pj('tomacafe', 2.8, 5.8, 0.48, 'd');
    L.cil(2.8, 5.8, 0, 0.16, 0.46, '#3E9C95', '#2A7C78');
    // Un alfiler por punto de la app
    pin(1, 1.45, 1.1, 1.85, TEAL); pin(2, 3.5, 0.05, 1.2, TEAL); pin(3, 0.03, 4.35, 1.3, TEAL);
    return { id: 'rumbo', ancho: W, fondo: D };
  });
}

export const SALAS_GRANDES = { fundos, haru, eleven, nuhome, rumbo };
