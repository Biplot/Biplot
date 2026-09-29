// Las salas grandes: el local de cada empresa por dentro, con su gente, sus pantallas reales y un punto por módulo.
// Cada sala se dibuja en su propia escena (la misma proyección de la oficina) y devuelve { vb, capas, arriba, caminan,
// pines, usados }: el dibujo en capas por profundidad y, aparte, la gente que camina por la sala con su ruta.
// Una sala propia (la de Nu Home) no lleva puntos numerados: marca lo que se toca con zona() y dónde van las etiquetas
// con lugar(), y devuelve además { lugares, zonas, gente } (ver montar()).
import { escena, P, registrarMedida, andante, medidaDe } from './maqueta.mjs';
import * as S from './locales.mjs';
import { VISITANTES, persona, PIEL, medida } from './visitantes.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
export const EA = 1.36;
const HM = 2.0;
const FUENTE = `font-family="'Space Grotesk','DejaVu Sans',sans-serif"`, MONO = `font-family="'Space Mono','DejaVu Sans Mono',monospace"`;
const txt = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${FUENTE} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const mono = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${MONO} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const ACERO = { t: '#C4D2E0', l: '#8FA3B8', r: '#6B7A8C' };

// ───────── Gente nueva: los perfiles reales de cada sistema y quienes los usan ─────────
const JEAN = ['#35679A', '#27507C'], OSCURO = ['#2A3038', '#1E232A'], CAQUI = ['#C9B28A', '#A8936A'], NEGRO = ['#1F2733', '#141A23'];
const Z = { blancas: ['#F2F4F7', '#B9C8D8', '#17C3B2'], cafe: ['#6E4A30', '#4A3222', null], negras: ['#1F2733', '#0B1726', null], botas: ['#8B6A4E', '#4A3222', null], rojas: ['#C8474A', '#F2F4F7', '#F2F4F7'] };
const PELO = { negro: ['#1A1613', '#0B0908', '#3A322C'], cafe: ['#4A3222', '#2E1F15', '#7A5334'], castano: ['#6E4A30', '#4A3222', '#8B6A4E'], canoso: ['#B9C0C8', '#8E949C', '#E4E7EB'], rojizo: ['#8E3E20', '#6E2C14', '#B5532E'], rubio: ['#D9A441', '#B8862A', '#F4DDA8'] };
const UNIFORME_NH = ['#1C1917', '#0F0D0C', ['#F4ECD8', '#C9A227']];
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
  corredora: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'cola', lazo: '#17C3B2', cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#3E9C95', '#2A7C78', null], abajo: 'short', abajoCol: NEGRO, zapatos: Z.blancas, audifonos: '#7FD8CF', piernas: 'camina', brazoD: 'frente', brazoI: 'atras', ojos: 'felices' },
  // La sala de Nu Home: su equipo de asesoría (chaqueta negra, camisa crema y botón dorado), sin nombre, y quienes visitan
  nhRecepcion: { piel: PIEL.media, pelo: PELO.castano, peinado: 'melena', cuerpo: 'fino', arriba: 'blazer', arribaCol: UNIFORME_NH, abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'saluda', ojos: 'grandes', aros: '#E0B341', boca: 'dientes' },
  nhAsesor: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'corto', arriba: 'blazer', arribaCol: UNIFORME_NH, abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', lentes: 'rectos', barba: '#1A1613' },
  nhAsesora: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'mono', cuerpo: 'fino', arriba: 'blazer', arribaCol: UNIFORME_NH, abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'grandes', aros: '#E0B341' },
  nhMaqueta: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'cola', cuerpo: 'fino', arriba: 'blazer', arribaCol: UNIFORME_NH, abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'senala', brazoI: 'sostiene', objetoI: 'carpeta', ojos: 'grandes' },
  nhGuia: { piel: PIEL.trigo, pelo: PELO.cafe, peinado: 'peinado', arriba: 'blazer', arribaCol: UNIFORME_NH, abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'sostiene', objeto: 'tablet', piernas: 'camina' },
  nhEntrega: { piel: PIEL.media, pelo: PELO.castano, peinado: 'largo', cuerpo: 'fino', arriba: 'blazer', arribaCol: UNIFORME_NH, abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'saluda', brazoI: 'sostiene', objetoI: 'carpeta', ojos: 'felices', boca: 'dientes' },
  nhAbuela: { piel: PIEL.rosada, pelo: PELO.canoso, peinado: 'rizado', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#C9824E', '#A8683A', ['#F2F4F7']], abajo: 'pantalon', abajoCol: ['#3A4A5A', '#2A3848'], zapatos: Z.cafe, brazoD: 'senala', brazoI: 'abajo', objetoI: 'bolso', bolsoCol: '#6E4A30', lentes: 'redondos', rubor: '#E9967A' },
  nhAbuelo: { piel: PIEL.clara, pelo: PELO.canoso, peinado: 'calvo', arriba: 'chaqueta', arribaCol: ['#4A5A4A', '#3A483A', ['#E8DFC8', null]], abajo: 'pantalon', abajoCol: ['#8B8272', '#6E6658'], zapatos: Z.cafe, brazoD: 'cadera', bigote: '#DADDE2', boca: 'media' },
  nhSentada: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'melena', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#8E6BB8', '#6E4E96'], manga: 'larga', abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'grandes', rubor: '#E9967A' }
};
// Medidas de todos los visitantes (los de siempre y los nuevos)
for (const id of Object.keys(VISITANTES)) registrarMedida(id, medida(id, VISITANTES[id]()));
for (const [id, o] of Object.entries(NUEVOS)) {
  VISITANTES[id] = () => persona(o);
  const f = persona(o);
  registrarMedida(id, o.piernas === 'sentado' ? { cx: 15.6, pie: 38.6, sentado: true, alto: 50, ancho: 30 } : medida(id, f));
}

// ───────── Piezas comunes ─────────
// Piso, muros de atrás (en tramos, para el orden por profundidad), zócalo y canto de la losa. c.alto, c.zocaloAlto y
// c.grosor cambian el alto de los muros, el del zócalo y el grosor del tope (por defecto, los de todas las salas).
function base(E, L, W, D, c) {
  const hm = c.alto ?? HM, hz = c.zocaloAlto ?? 0.12, g = c.grosor ?? 0.12;
  E.losa(-0.12, -0.12, W + 0.12, D + 0.12, 0, c.piso, -1000);
  if (c.dibujo) L.piso(0, 0, c.dibujo, c.dibujoK ?? -55);
  const s = 0.5;
  for (let x = 0; x < W - 0.001; x += s) {
    const b = Math.min(W, x + s);
    L.add(-50 + b * 0.01, L.poly([[x, 0, 0], [b, 0, 0], [b, 0, hm], [x, 0, hm]], `fill="${c.muroY}"`) +
      L.poly([[x, 0, 0], [b, 0, 0], [b, 0, hz], [x, 0, hz]], `fill="${c.zocalo}"`) +
      L.poly([[x, 0, hm], [b, 0, hm], [b, -g, hm], [x, -g, hm]], `fill="${c.tope}"`));
  }
  for (let y = 0; y < D - 0.001; y += s) {
    const b = Math.min(D, y + s);
    L.add(-50 + b * 0.01, L.poly([[0, y, 0], [0, b, 0], [0, b, hm], [0, y, hm]], `fill="${c.muroX}"`) +
      L.poly([[0, y, 0], [0, b, 0], [0, b, hz], [0, y, hz]], `fill="${c.zocalo}"`) +
      L.poly([[0, y, hm], [0, b, hm], [-g, b, hm], [-g, y, hm]], `fill="${c.tope}"`));
  }
  // Cantos de los muros
  L.add(-49, L.poly([[W, 0, 0], [W, 0, hm], [W, -g, hm], [W, -g, 0]], `fill="${c.canto}"`) + L.poly([[0, D, 0], [0, D, hm], [-g, D, hm], [-g, D, 0]], `fill="${c.canto}"`));
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
// Una sala propia, además, marca lo que se toca: zona(id, o) y lugar(id, x, y, z) (ver zonaDe()). Entonces devuelve
// también lugares ({ id: [x, y] } en coordenadas del dibujo), zonas y gente ({ id: [x, y, alto] }: dónde pisa cada
// persona, o dónde se sienta, y cuánto mide en el dibujo; así la oficina sabe dónde va su burbuja).
export function montar(fn) {
  const E = escena(); E.txt = 1;
  const L = S.local(E, 0, 0, 0, false, 0);
  const usados = new Set(), pines = [], caminan = [], lugares = {}, zonas = [], gente = {};
  const quien = (id, x, y, z, e) => { const [px, py] = P(x, y, z); gente[id] = [r1(px), r1(py), r1(medidaDe(id).alto * e)]; };
  const pj = (id, x, y, z = 0, dir = 'd', e = EA, k) => { usados.add(id); quien(id, x, y, z, e); L.pj(id, x, y, z, dir, e, k); };
  const camina = (id, ruta, o = {}) => { usados.add(id); quien(id, ruta[0][0], ruta[0][1], 0, o.e || EA); caminan.push(caminante(E, id, ruta, o)); };
  const lugar = (id, x, y, z = 0) => { lugares[id] = P(x, y, z).map(r1); };
  const zona = (id, o) => { zonas.push(zonaDe(id, o)); if (o.lugar) lugar(id, ...o.lugar); };
  const info = fn({ E, L, pj, camina, lugar, zona, pin: (n, x, y, z, col, tinta) => pin(E, pines, n, x, y, z, col, tinta) });
  const r = E.svg(18), { capas, arriba } = E.capas();
  const propia = zonas.length ? { lugares, zonas, gente } : {};
  return { vb: r.vb, ancho: r.ancho, alto: r.alto, capas, arriba, caminan, pines, usados: [...usados], ...propia, ...info };
}
// Una zona que se toca: formas (en coordenadas del mundo) y, opcional, su lugar (donde va la etiqueta), guia (el punto
// del piso donde se para la asesora cuando el recorrido pasa por ahí) y frente: lo que es una imagen (un mural, una
// pizarra, un cartel, una pantalla) trae su dibujo derecho, { svg, ancho, alto }, o su pantalla real, { img, ancho, alto }
// (el nombre en media/salas/), y al tocarla se abre de frente y en grande, con la sala oscurecida detrás.
//   { piso: [[x, y], …], alto }   un pedazo de piso, levantado hasta alto (un mueble, un rincón con su gente)
//   { plano: [[x, y, z], …] }     un plano (una pantalla o un cuadro en el muro)
// Devuelve { id, silueta, suelo, caja, prof, guia }: silueta es el contorno que se toca (la envolvente de todo, en el
// dibujo), suelo los contornos que se iluminan (el piso y los planos), caja el rectángulo que la encierra y prof su
// profundidad (x + y del medio): si dos zonas se tapan en pantalla, manda la de adelante.
function zonaDe(id, o) {
  const pts = [], suelo = [];
  let px = 0, n = 0;
  for (const f of o.formas) {
    const borde = f.piso ? f.piso.map(([x, y]) => [x, y, 0.02]) : f.plano;
    if (f.piso) for (const [x, y] of f.piso) pts.push(P(x, y, 0), P(x, y, f.alto));
    else for (const [x, y, z] of f.plano) pts.push(P(x, y, z));
    if (!f.soloToque) suelo.push(puntos(borde.map(([x, y, z]) => P(x, y, z))));
    for (const [x, y] of borde) { px += x + y; n++; }
  }
  const silueta = envolvente(pts), xs = silueta.map((p) => p[0]), ys = silueta.map((p) => p[1]);
  return { id, silueta: puntos(silueta), suelo, caja: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map(r1), prof: r1(px / n), ...(o.guia ? { guia: o.guia } : {}),
    ...(o.frente ? { frente: o.frente } : {}) };
}
const puntos = (a) => a.map(([x, y]) => r1(x) + ',' + r1(y)).join(' ');
// Envolvente convexa (cadena monótona) de puntos del dibujo
function envolvente(a) {
  const p = a.slice().sort((u, v) => u[0] - v[0] || u[1] - v[1]);
  const cruz = (o, u, v) => (u[0] - o[0]) * (v[1] - o[1]) - (u[1] - o[1]) * (v[0] - o[0]);
  const lado = (lista) => { const h = []; for (const q of lista) { while (h.length >= 2 && cruz(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop(); h.push(q); } h.pop(); return h; };
  return lado(p).concat(lado(p.slice().reverse()));
}
// Quien camina: su dibujo parado en el origen, su ruta y su paso (baldosas por segundo). Marca los bordes del dibujo
// en su primera parada, como si estuviera parado ahí.
export function caminante(E, id, ruta, o = {}) {
  const e = o.e || EA, [x, y] = ruta[0];
  E.marca(x, y, 0); E.marca(x, y, 1.9);
  return { id, svg: andante(id, e), ruta: ruta.map(p => p.map(n => Math.round(n * 100) / 100)), vel: o.vel || 0.5 };
}

// ───────── Nu Home 360 · casas modulares: su propia sala de ventas ─────────
// Una sala propia (datos.js, salaPropia): se recorre sin números. Lo que se toca va con zona() y la gente habla sola
// (sus frases están en datos.js). Crema, negro, madera y un dorado sobrio; los letreros en Cormorant Garamond.
const SERIF = `font-family="'Cormorant Garamond','DejaVu Serif',serif"`;
const serif = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${SERIF} font-weight="600" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const NH = {
  negro: { t: '#2B2724', l: '#1C1917', r: '#141110' }, carbon: { t: '#3A3530', l: '#2B2724', r: '#1F1B18' },
  roble: { t: '#D6B68C', l: '#BD9A6C', r: '#A27F55' }, nogal: { t: '#9C7550', l: '#7E5C3C', r: '#654830' },
  crema: { t: '#F4ECD8', l: '#E4D8BE', r: '#CFC1A3' }, acero: { t: '#B9BEC4', l: '#8F959C', r: '#71777E' },
  oro: '#C9A227', oro2: '#E0B341', tinta: '#1C1917'
};
// Vidrio en tramos (para que el orden por profundidad no falle), con sus perfiles negros
function vidrioY(L, y, x0, x1, h, dk = 0) {
  for (let x = x0; x < x1 - 0.001; x += 0.5) {
    const b = Math.min(x1, x + 0.5);
    L.add((x + b) / 2 + y + dk, L.poly([[x, y, 0], [b, y, 0], [b, y, h], [x, y, h]], `fill="rgba(214,236,240,.20)" stroke="rgba(255,255,255,.35)" stroke-width=".6"`) +
      L.poly([[x, y, h - 0.06], [b, y, h - 0.06], [b, y, h], [x, y, h]], `fill="${NH.tinta}"`) + L.poly([[x, y, 0], [b, y, 0], [b, y, 0.08], [x, y, 0.08]], `fill="${NH.tinta}"`) +
      (Math.abs(b - Math.round(b)) < 0.01 ? L.poly([[b - 0.03, y, 0], [b + 0.03, y, 0], [b + 0.03, y, h], [b - 0.03, y, h]], `fill="${NH.tinta}"`) : ''));
  }
}
function vidrioX(L, x, y0, y1, h, dk = 0) {
  for (let y = y0; y < y1 - 0.001; y += 0.5) {
    const b = Math.min(y1, y + 0.5);
    L.add(x + (y + b) / 2 + dk, L.poly([[x, y, 0], [x, b, 0], [x, b, h], [x, y, h]], `fill="rgba(214,236,240,.16)" stroke="rgba(255,255,255,.3)" stroke-width=".6"`) +
      L.poly([[x, y, h - 0.06], [x, b, h - 0.06], [x, b, h], [x, y, h]], `fill="${NH.tinta}"`) + L.poly([[x, y, 0], [x, b, 0], [x, b, 0.08], [x, y, 0.08]], `fill="${NH.tinta}"`) +
      (Math.abs(b - Math.round(b)) < 0.01 ? L.poly([[x, b - 0.03, 0], [x, b + 0.03, 0], [x, b + 0.03, h], [x, b - 0.03, h]], `fill="${NH.tinta}"`) : ''));
  }
}
// Silla de escritorio (se dibuja antes que quien se sienta)
function silla(L, x, y, col = NH.negro) {
  L.cil(x, y, 0, 0.05, 0.4, '#3A3530', '#2B2724', x + y - 0.2);
  L.caja(x - 0.22, y - 0.22, 0.4, 0.44, 0.44, 0.07, col, x + y - 0.15);
}
// Planta alta en macetero negro
function plantaAlta(L, x, y, t = 1) {
  L.cil(x, y, 0, 0.26 * t, 0.42 * t, '#2B2724', '#1C1917');
  const [cx, cy] = L.P(x, y, 0.42 * t + 0.55 * t), k = x + y + 0.12;
  L.add(k, `<path d="M${r1(cx)} ${r1(cy + 22 * t)}V${r1(cy - 10 * t)}" stroke="#4A3F2E" stroke-width="${r1(2 * t)}"/>` +
    [[-12, 4, 11, '#3E7A4E'], [11, -2, 12, '#2F6440'], [-4, -14, 11, '#4E8A55'], [8, -22, 9, '#3E7A4E'], [-10, -26, 8, '#2F6440'], [2, 10, 9, '#4E8A55']]
      .map(([dx, dy, r, c]) => `<ellipse cx="${r1(cx + dx * t)}" cy="${r1(cy + dy * t)}" rx="${r1(r * t)}" ry="${r1(r * 0.72 * t)}" fill="${c}" transform="rotate(${dx > 0 ? -24 : 24} ${r1(cx + dx * t)} ${r1(cy + dy * t)})"/>`).join(''));
}
// Casa en miniatura (los modelos): un módulo negro con su franja de madera y ventanas
function casita(L, x, y, z, w, d, h, o = {}) {
  L.caja(x, y, z, w, d, h, NH.negro, o.k);
  const kk = (o.k ?? x + w / 2 + y + d / 2 + z * 0.5) + 0.01;
  L.add(kk, L.poly([[x + w * 0.72, y + d + 0.002, z], [x + w, y + d + 0.002, z], [x + w, y + d + 0.002, z + h], [x + w * 0.72, y + d + 0.002, z + h]], `fill="#B98B5E"`) +
    L.poly([[x + w * 0.12, y + d + 0.003, z + h * 0.3], [x + w * 0.55, y + d + 0.003, z + h * 0.3], [x + w * 0.55, y + d + 0.003, z + h * 0.78], [x + w * 0.12, y + d + 0.003, z + h * 0.78]], `fill="#F2C14E" opacity=".85"`) +
    L.poly([[x + w + 0.002, y + d * 0.25, z + h * 0.3], [x + w + 0.002, y + d * 0.7, z + h * 0.3], [x + w + 0.002, y + d * 0.7, z + h * 0.78], [x + w + 0.002, y + d * 0.25, z + h * 0.78]], `fill="rgba(214,236,240,.7)"`));
}
// El paisaje del ventanal: la cordillera con nieve, el bosque y una casa en la pradera con la luz encendida
function ventanal() {
  const w = 840, h = 215, T = NH.tinta;
  let s = `<defs><linearGradient id="nh-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE0E8"/><stop offset=".75" stop-color="#F6E9CF"/></linearGradient></defs>`;
  s += `<rect width="${w}" height="${h}" fill="url(#nh-cielo)"/>`;
  s += `<path d="M0 118L70 70L118 96L190 44L250 88L320 58L392 100L470 52L540 90L610 60L690 96L760 66L840 94V${h}H0Z" fill="#9AAEBD"/>`;
  s += `<path d="M190 44L172 60L186 58L198 66L210 56ZM470 52L452 68L468 64L482 72L492 62ZM320 58L306 70L320 68L332 74ZM760 66L746 78L760 76L772 82Z" fill="#F7F8FA"/>`;
  s += `<path d="M0 150Q120 118 250 140T520 132T840 138V${h}H0Z" fill="#7F9A73"/>`;
  s += `<path d="M0 176Q160 156 330 170T660 164T840 170V${h}H0Z" fill="#6A8A5E"/>`;
  const pino = (x, y, a) => `<path d="M${x} ${y - a}L${x - a * 0.36} ${y}H${x + a * 0.36}Z" fill="#2F5A3E"/><path d="M${x} ${y - a * 0.72}L${x - a * 0.3} ${y - a * 0.12}H${x + a * 0.3}Z" fill="#3B6B4A"/>`;
  for (let i = 0; i < 34; i++) { const x = i * 25 + (i % 3) * 6, a = 30 + ((i * 37) % 23); if (x > 540 && x < 700) continue; s += pino(x, 196 + (i % 2) * 6, a); }
  s += `<rect x="560" y="150" width="120" height="34" fill="#2B2724"/><rect x="560" y="146" width="124" height="6" fill="${T}"/><rect x="650" y="152" width="30" height="32" fill="#B98B5E"/>` +
    `<rect x="574" y="158" width="52" height="20" fill="#F2C14E"/><rect x="598" y="158" width="2" height="20" fill="${T}"/><rect x="548" y="184" width="150" height="5" fill="#8B6A4E"/>`;
  s += `<path d="M0 ${h}V200Q300 190 840 200V${h}Z" fill="#587A4E"/>`;
  s += `<path d="M60 0L10 ${h}H40L90 0ZM330 0L280 ${h}H296L346 0ZM620 0L570 ${h}H600L650 0Z" fill="#FFFFFF" opacity=".16"/>`;
  s += [0, 210, 420, 630, 834].map(u => `<rect x="${u}" width="6" height="${h}" fill="${T}"/>`).join('') + `<rect width="${w}" height="6" fill="${T}"/><rect y="${h - 6}" width="${w}" height="6" fill="${T}"/>`;
  return s;
}
// El living que se ve por el ventanal corredera de la casa piloto
function living() {
  const T = NH.tinta, O = NH.oro2;
  let s = `<rect x="180" y="18" width="290" height="194" fill="#EFE2C8"/><rect x="180" y="168" width="290" height="44" fill="#C9A27A"/>` +
    `<rect x="236" y="44" width="70" height="52" fill="#9AAEBD" stroke="#B98B5E" stroke-width="4"/><path d="M240 92L262 66L280 80L302 58V92Z" fill="#6A8A5E"/>` +
    `<rect x="330" y="118" width="120" height="44" rx="8" fill="#6E757C"/><rect x="330" y="106" width="120" height="22" rx="8" fill="#5E656C"/><rect x="340" y="116" width="30" height="16" rx="4" fill="${O}"/>` +
    `<path d="M395 18V58" stroke="${T}" stroke-width="2"/><path d="M380 58H410L402 70H388Z" fill="${O}"/><ellipse cx="395" cy="74" rx="26" ry="8" fill="#F2C14E" opacity=".35"/>` +
    `<rect x="200" y="132" width="26" height="36" fill="#2B2724"/><circle cx="213" cy="120" r="16" fill="#3E7A4E"/><circle cx="222" cy="108" r="12" fill="#4E8A55"/>` +
    `<path d="M186 18L236 212H262L212 18ZM380 18L430 212H444L394 18Z" fill="#FFFFFF" opacity=".22"/>`;
  s += [180, 276, 372, 466].map(u => `<rect x="${u}" y="18" width="5" height="194" fill="${T}"/>`).join('') + `<rect x="180" y="16" width="291" height="5" fill="${T}"/>`;
  return s;
}
export function nuhome() {
  return montar(({ E, L, pj, camina, lugar, zona }) => {
    const W = 20, D = 14, HM = 2.6;
    const { negro: NEGRO, carbon: CARBON, roble: ROBLE, nogal: NOGAL, crema: CREMA, acero: ACERO, oro: ORO, oro2: ORO2, tinta: TINTA } = NH;
    // Piso de tablas de roble, con las uniones corridas
    let tablas = '';
    for (let v = 25; v < D * 100; v += 25) tablas += `<path d="M0 ${v}H${W * 100}" stroke="#C7AC84" stroke-width="1.6"/>`;
    for (let v = 0, i = 0; v < D * 100; v += 25, i++) for (let u = (i % 3) * 70 + 40; u < W * 100; u += 210) tablas += `<path d="M${u} ${v}V${v + 25}" stroke="#C7AC84" stroke-width="1.4"/>`;
    base(E, L, W, D, { piso: '#D9C29E', muroY: '#EFE6D3', muroX: '#E0D4BC', zocalo: TINTA, tope: '#CDBF9F', canto: '#B8A987', dibujo: tablas, dibujoK: -56, alto: HM, zocaloAlto: 0.1, grosor: 0.14 });

    // ── Así se arma tu casa: el taller al fondo, detrás del vidrio ──
    const FX = 7.4, FY = 4.6;
    L.piso(0, 0, `<rect width="${FX * 100}" height="${FY * 100}" fill="#B7B2A7"/>` +
      `<g stroke="#A8A398" stroke-width="1.4">${Array.from({ length: 7 }, (_, i) => `<path d="M${(i + 1) * 100} 0V${FY * 100}"/>`).join('')}${Array.from({ length: 4 }, (_, i) => `<path d="M0 ${(i + 1) * 100}H${FX * 100}"/>`).join('')}</g>` +
      `<rect x="70" y="100" width="500" height="260" fill="none" stroke="${ORO2}" stroke-width="6" stroke-dasharray="26 16"/>`, -54);
    // Muros del taller: plancha acanalada
    L.planoY(0, 0.02, HM, FX * 100, HM * 100, `<rect width="${FX * 100}" height="${HM * 100}" fill="#8E9398"/>` + Array.from({ length: 37 }, (_, i) => `<rect x="${i * 20 + 4}" width="8" height="${HM * 100}" fill="#80858A"/>`).join(''), -45);
    L.planoX(FY, HM, FY * 100, HM * 100, `<rect width="${FY * 100}" height="${HM * 100}" fill="#7F8489"/>` + Array.from({ length: 23 }, (_, i) => `<rect x="${i * 20 + 4}" width="8" height="${HM * 100}" fill="#72777C"/>`).join(''), -45);
    // El portón de despacho y la carta Gantt del taller (pantalla real de Nu Home 360)
    L.planoX(4.0, 2.25, 300, 225, `<rect width="300" height="225" fill="#5E6368"/>` + Array.from({ length: 21 }, (_, i) => `<path d="M0 ${10 + i * 10}H300" stroke="#4E5358" stroke-width="3"/>`).join('') +
      `<rect width="300" height="16" fill="${TINTA}"/><rect x="80" y="30" width="140" height="30" rx="3" fill="${TINTA}"/>` + mono(98, 51, 'DESPACHO', 17, ORO2) +
      `<g>${Array.from({ length: 15 }, (_, i) => `<path d="M${i * 22} 225L${i * 22 + 12} 211H${i * 22 + 23}L${i * 22 + 11} 225Z" fill="${ORO2}"/>`).join('')}</g>`, -40);
    pantallaY(L, 4.55, 2.4, 2.5, 1.25, '§M§recorte-nuhome-5-fabricacion.webp', { k: -39, marco: TINTA, pie: false });
    // El módulo que se está armando: su base, la estructura, la mitad ya forrada en madera y la aislación a la vista
    L.caja(1.0, 1.3, 0, 4.6, 2.2, 0.16, ACERO, 4.3);
    const mx0 = 1.15, mx1 = 5.45, my0 = 1.45, my1 = 3.35, mz0 = 0.16, mz1 = 2.05;
    L.add(4.35, L.poly([[mx0, my0, mz0], [mx1, my0, mz0], [mx1, my0, mz1], [mx0, my0, mz1]], `fill="#3A3530"`) + L.poly([[mx0, my0, mz0], [mx0, my1, mz0], [mx0, my1, mz1], [mx0, my0, mz1]], `fill="#2B2724"`));
    L.planoY(mx0, my1 + 0.004, mz1, (mx1 - mx0) * 100, (mz1 - mz0) * 100,
      `<rect width="${(mx1 - mx0) * 100}" height="${(mz1 - mz0) * 100}" fill="#F2D98A"/>` + Array.from({ length: 12 }, (_, i) => `<path d="M${i * 18} 0L${i * 18 + 18} ${(mz1 - mz0) * 100}" stroke="#E0B341" stroke-width="3"/>`).join('') +
      `<rect width="220" height="${(mz1 - mz0) * 100}" fill="#B98B5E"/>` + Array.from({ length: 11 }, (_, i) => `<path d="M${i * 20 + 10} 0V${(mz1 - mz0) * 100}" stroke="#9C7550" stroke-width="3"/>`).join('') +
      `<rect x="70" y="40" width="110" height="80" fill="#6E8B98" stroke="${TINTA}" stroke-width="6"/>` +
      [0, 108, 216, 324, 424].map(u => `<rect x="${u}" width="6" height="${(mz1 - mz0) * 100}" fill="${TINTA}"/>`).join('') + `<rect width="${(mx1 - mx0) * 100}" height="6" fill="${TINTA}"/>`, 5.62);
    planoXen(L, mx1 + 0.004, my1, mz1, (my1 - my0) * 100, (mz1 - mz0) * 100,
      `<rect width="${(my1 - my0) * 100}" height="${(mz1 - mz0) * 100}" fill="#F2D98A"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${i * 34} 0L${i * 34 + 34} ${(mz1 - mz0) * 100}" stroke="#E0B341" stroke-width="3"/>`).join('') +
      [0, 92, 184].map(u => `<rect x="${u}" width="6" height="${(mz1 - mz0) * 100}" fill="${TINTA}"/>`).join('') + `<rect width="${(my1 - my0) * 100}" height="6" fill="${TINTA}"/>`, 5.63);
    L.add(5.64, L.poly([[mx0, my0, mz1], [mx1, my0, mz1], [mx1, my1, mz1], [mx0, my1, mz1]], `fill="none" stroke="${TINTA}" stroke-width="2.4"`) +
      [1.9, 2.65, 3.4, 4.15, 4.9].map(x => L.poly([[x, my0, mz1], [x + 0.04, my0, mz1], [x + 0.04, my1, mz1], [x, my1, mz1]], `fill="${TINTA}"`)).join(''));
    // El puente grúa bajando el panel del techo
    L.caja(0.35, 2.3, 0, 0.14, 0.14, 2.4, { t: ORO2, l: '#B8902E', r: '#8C6D22' }, 2.9);
    L.caja(6.85, 2.3, 0, 0.14, 0.14, 2.4, { t: ORO2, l: '#B8902E', r: '#8C6D22' }, 9.4);
    L.caja(0.35, 2.3, 2.4, 6.64, 0.14, 0.12, { t: ORO2, l: '#B8902E', r: '#8C6D22' }, 9.66);
    L.anim('loc-grua', () => {
      L.caja(2.3, 1.7, 2.12, 1.8, 1.35, 0.07, { t: '#3A3530', l: '#2B2724', r: '#1F1B18' }, 9.6);
      L.linea([[3.2, 2.37, 2.28], [3.2, 2.37, 2.19]], '#3A424E', 1.4, 9.61);
      L.caja(3.0, 2.22, 2.28, 0.4, 0.3, 0.12, NEGRO, 9.62);
    });
    // Quienes trabajan en el taller
    pj('soldador', 3.15, 3.7, 0, 'd');
    pj('maestro', 4.4, 4.05, 0, 'i');
    // El vidrio del taller, con su letrero
    vidrioY(L, FY, 0, 5.7, 2.2, 0.05); vidrioY(L, FY, 6.75, FX, 2.2, 0.05);
    L.caja(5.65, FY - 0.05, 0, 0.08, 0.1, 2.2, NEGRO, 5.7 + FY + 0.3); L.caja(6.7, FY - 0.05, 0, 0.08, 0.1, 2.2, NEGRO, 6.75 + FY + 0.3);
    L.caja(5.65, FY - 0.05, 2.12, 1.13, 0.1, 0.08, NEGRO, 6.2 + FY + 0.31);
    vidrioX(L, FX, 0, FY, 2.2, 0.05);
    L.planoY(0.2, FY + 0.01, 2.12, 360, 52, serif(0, 30, '<tspan font-style="italic">Así se arma</tspan> tu casa', 35, '#FFFFFF') + `<rect x="2" y="42" width="110" height="3.5" fill="${ORO2}"/>`, 0.2 + 1.8 + FY + 0.4);
    zona('taller', { formas: [{ piso: [[0, 0], [FX, 0], [FX, FY], [0, FY]], alto: HM }], lugar: [3.3, 2.4, 2.55], guia: [6.2, 5.35] });

    // ── El muro de la marca y el ventanal hacia el paisaje ──
    L.planoY(7.85, 0.025, 2.35, 330, 185, `<rect width="330" height="185" rx="3" fill="${TINTA}"/><image href="§M§logo-nuhome.webp" x="95" y="22" width="140" height="99"/>` +
      `<rect x="120" y="140" width="90" height="2.5" fill="${ORO}"/>`, -39);
    L.caja(7.9, 0.1, 0, 3.2, 0.5, 0.42, NOGAL, 7.9 + 1.6 + 0.35);
    L.planoY(11.5, 0.025, 2.45, 840, 215, ventanal(), -39);

    // ── El salón: donde se espera, se conversa y se entregan las llaves ──
    L.piso(12.1, 1.3, `<rect width="330" height="210" rx="12" fill="#E7D8BA"/><rect x="14" y="14" width="302" height="182" rx="8" fill="none" stroke="#CDB892" stroke-width="4"/>`, -52);
    L.caja(12.4, 0.35, 0, 2.7, 0.3, 0.86, CARBON, 12.4 + 1.35 + 0.5);
    L.caja(12.4, 0.65, 0, 2.7, 0.72, 0.42, CARBON, 12.4 + 1.35 + 1.0);
    L.caja(12.2, 0.35, 0, 0.2, 1.02, 0.6, CARBON, 12.3 + 0.86 + 0.1); L.caja(15.1, 0.35, 0, 0.2, 1.02, 0.6, CARBON, 15.2 + 0.86 + 0.2);
    L.caja(12.6, 0.72, 0.42, 0.62, 0.5, 0.08, { t: '#C9824E', l: '#A8683A', r: '#8C5530' }, 13.5 + 0.95 + 0.3);
    L.cil(13.8, 2.35, 0, 0.5, 0.36, '#B98B5E', '#8B6A4E');
    L.cil(13.62, 2.28, 0.36, 0.1, 0.12, '#F4ECD8', '#CFC1A3', 16.1); L.luz(13.62, 2.28, 0.48, 4, 2, '#3E7A4E', 16.11);
    L.caja(13.9, 2.25, 0.36, 0.36, 0.26, 0.03, { t: TINTA, l: TINTA, r: '#000' }, 16.2);
    pj('nhSentada', 13.3, 0.95, 0.42, 'd', EA, 14.9);
    plantaAlta(L, 11.95, 0.55, 1.1);
    plantaAlta(L, 19.45, 0.55, 1.15);
    pj('clienta2', 15.7, 2.8, 0, 'i');
    zona('salon', { formas: [{ piso: [[11.6, 0.12], [16.25, 0.12], [16.25, 3.5], [11.6, 3.5]], alto: 2.2 }, { plano: [[11.5, 0.03, 0.3], [16.3, 0.03, 0.3], [16.3, 0.03, 2.45], [11.5, 0.03, 2.45]], soloToque: true }],
      lugar: [13.9, 1.6, 2.05], guia: [14.6, 4.3] });
    // La entrega: la mesa, las llaves y la familia que recibe su casa
    L.cil(17.9, 2.3, 0, 0.06, 0.72, '#2B2724', '#1C1917');
    L.cil(17.9, 2.3, 0.72, 0.6, 0.05, '#D6B68C', '#A27F55');
    L.cil(17.65, 2.18, 0.77, 0.07, 0.25, '#F4ECD8', '#CFC1A3', 20.4); L.luz(17.65, 2.18, 1.04, 9, 7, '#E8A0B4', 20.41); L.luz(17.6, 2.14, 1.08, 5, 4, '#F2F4F7', 20.42);
    L.caja(18.05, 2.35, 0.77, 0.34, 0.24, 0.02, { t: '#F4ECD8', l: '#E4D8BE', r: '#CFC1A3' }, 20.43);
    pj('nhEntrega', 18.9, 1.55, 0, 'i');
    pj('papa', 17.1, 3.25, 0, 'd');
    pj('mama', 18.3, 3.55, 0, 'i');
    zona('entrega', { formas: [{ piso: [[16.6, 1.0], [19.6, 1.0], [19.6, 4.0], [16.6, 4.0]], alto: 2.2 }], lugar: [17.9, 2.4, 2.05] });

    // ── Terminaciones: el muro de muestras y su cajonera ──
    const MUESTRAS = `<rect width="205" height="175" rx="4" fill="#F7F1E4" stroke="#CDBF9F" stroke-width="3"/>` + serif(14, 34, 'Terminaciones', 28, TINTA) + `<rect x="15" y="42" width="60" height="3" fill="${ORO}"/>` +
      [['#2B2724', 14, 58], ['#B98B5E', 62, 58], ['#8B6A4E', 110, 58], ['#E9EEF2', 158, 58], ['#6E757C', 14, 112], ['#D6B68C', 62, 112], ['#9AAEBD', 110, 112], ['#F4ECD8', 158, 112]]
        .map(([c, x, y]) => `<rect x="${x}" y="${y}" width="40" height="46" rx="2" fill="${c}" stroke="${TINTA}" stroke-width="1.6"/>`).join('') +
      `<path d="M62 58l40 46M72 58l30 34M62 70l28 34" stroke="#9C7550" stroke-width="2"/>`;
    L.planoX(6.95, 2.25, 205, 175, MUESTRAS, -38);
    L.caja(0.08, 4.95, 0, 0.55, 1.95, 0.88, NOGAL, 0.35 + 5.9);
    for (const [y, c] of [[5.15, '#2B2724'], [5.55, '#B98B5E'], [5.95, '#E9EEF2'], [6.4, '#6E757C']]) L.caja(0.18, y, 0.88, 0.32, 0.26, 0.05, { t: c, l: c, r: c }, 0.35 + y + 0.6);
    pj('nhAbuela', 1.15, 5.75, 0, 'i');
    pj('nhAbuelo', 1.35, 6.75, 0, 'i');
    zona('terminaciones', { formas: [{ plano: [[0.02, 6.95, 0.5], [0.02, 4.9, 0.5], [0.02, 4.9, 2.25], [0.02, 6.95, 2.25]] }, { piso: [[0.08, 4.95], [0.7, 4.95], [0.7, 6.95], [0.08, 6.95]], alto: 0.93 }],
      lugar: [0.05, 5.9, 2.45], guia: [2.3, 6.1], frente: { svg: MUESTRAS, ancho: 205, alto: 175 } });
    // La ingeniera, entre el taller y la asesoría
    pj('ingeniera', 7.95, 5.55, 0, 'i');

    // ── Asesoría: la pantalla grande del diseñador, los escritorios y la mesa de maqueta ──
    L.planoX(13.2, 2.35, 190, 44, serif(4, 32, 'Asesoría', 34, TINTA) + `<rect x="6" y="40" width="54" height="3" fill="${ORO}"/>`, -38);
    pantallaX(L, 10.6, 2.35, 3.1, 1.74, '§M§recorte-nuhome-1-disenador.webp', { k: -38, marco: TINTA });
    zona('disenador', { formas: [{ plano: [[0.02, 10.6, 0.61], [0.02, 7.5, 0.61], [0.02, 7.5, 2.35], [0.02, 10.6, 2.35]] }], lugar: [0.05, 9.05, 2.5],
      frente: { img: 'nuhome-1-disenador', ancho: 1280, alto: 720 } });
    const escritorio = (x0, y0, img, k) => {
      L.caja(x0, y0, 0.7, 1.5, 0.8, 0.05, ROBLE, k);
      L.caja(x0 + 0.05, y0 + 0.05, 0, 0.08, 0.7, 0.7, NEGRO, k - 0.4); L.caja(x0 + 1.37, y0 + 0.05, 0, 0.08, 0.7, 0.7, NEGRO, k - 0.1);
      L.caja(x0 + 0.62, y0 + 0.3, 0.75, 0.06, 0.06, 0.2, NEGRO, k + 0.02);
      L.planoY(x0 + 0.33, y0 + 0.37, 1.32, 64, 42, `<rect width="64" height="42" rx="3" fill="${TINTA}"/><image href="${img}" x="3" y="3" width="58" height="36" preserveAspectRatio="xMidYMid slice"/>`, k + 0.03);
      L.caja(x0 + 0.95, y0 + 0.45, 0.75, 0.3, 0.2, 0.02, { t: '#F4ECD8', l: '#E4D8BE', r: '#CFC1A3' }, k + 0.04);
    };
    silla(L, 1.95, 8.4); pj('nhAsesor', 1.95, 8.4, 0.47, 'd');
    escritorio(2.45, 8.0, '§M§recorte-nuhome-3-cotizacion.webp', 11.3);
    silla(L, 4.4, 8.4); pj('tomacafe', 4.4, 8.4, 0.47, 'i');
    silla(L, 4.3, 10.1); pj('nhAsesora', 4.3, 10.1, 0.47, 'd');
    escritorio(4.8, 9.7, '§M§recorte-nuhome-2-leads.webp', 15.0);
    silla(L, 6.75, 10.1); pj('comensal2', 6.75, 10.1, 0.47, 'i');
    zona('asesoria', { formas: [{ piso: [[1.65, 7.9], [4.7, 7.9], [4.7, 9.55], [7.05, 9.55], [7.05, 10.65], [4.0, 10.65], [4.0, 8.9], [1.65, 8.9]], alto: 2.05 }],
      lugar: [4.35, 9.25, 2.35], guia: [6.45, 8.3] });
    // La mesa de maqueta: el terreno a escala y la casa encima, como en el diseñador
    L.caja(2.3, 11.35, 0, 0.12, 0.12, 0.8, NEGRO, 13.9); L.caja(4.95, 11.35, 0, 0.12, 0.12, 0.8, NEGRO, 16.5);
    L.caja(2.3, 12.85, 0, 0.12, 0.12, 0.8, NEGRO, 15.4); L.caja(4.95, 12.85, 0, 0.12, 0.12, 0.8, NEGRO, 18.0);
    L.caja(2.2, 11.3, 0.8, 2.95, 1.75, 0.08, { t: '#F1E7D2', l: '#1C1917', r: '#141110' }, 16.0);
    L.piso(2.3, 11.4, `<rect width="275" height="155" fill="#E9DDC4"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M${(i + 1) * 25} 0V155" stroke="#D5C6A6" stroke-width="1.6"/>`).join('') +
      Array.from({ length: 5 }, (_, i) => `<path d="M0 ${(i + 1) * 25}H275" stroke="#D5C6A6" stroke-width="1.6"/>`).join('') +
      `<rect x="40" y="30" width="190" height="95" fill="none" stroke="${ORO}" stroke-width="3" stroke-dasharray="10 6"/>`, 16.01, 0.881);
    casita(L, 2.95, 11.75, 0.88, 1.15, 0.42, 0.3, { k: 16.3 });
    casita(L, 3.2, 11.78, 1.18, 0.55, 0.38, 0.26, { k: 16.6 });
    L.caja(4.15, 11.9, 0.88, 0.5, 0.36, 0.03, ROBLE, 16.4);
    for (const [x, y] of [[2.55, 12.75], [4.7, 12.6], [2.6, 11.55]]) { L.cil(x, y, 0.88, 0.03, 0.12, '#4A3F2E', '#4A3F2E', 17); const [cx, cy] = L.P(x, y, 1.12); L.add(17.01 + x * 0.001, `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="7" fill="#3E7A4E"/><circle cx="${r1(cx + 3)}" cy="${r1(cy - 3)}" r="4.5" fill="#4E8A55"/>`); }
    pj('nhMaqueta', 1.85, 12.15, 0, 'd');
    pj('clienta', 5.55, 11.75, 0, 'i');
    pj('cliente', 5.65, 12.75, 0, 'i');
    zona('maqueta', { formas: [{ piso: [[2.2, 11.3], [5.15, 11.3], [5.15, 13.05], [2.2, 13.05]], alto: 1.45 }], lugar: [3.7, 12.15, 1.75] });

    // ── La casa piloto: un módulo de verdad, con su terraza y su pérgola ──
    const HX = 10.2, HY = 5.6, HW = 6.0, HD = 2.5, HZ = 0.22, HH = 2.12;
    L.caja(HX + 0.1, HY + 0.1, 0, HW - 0.2, HD - 0.2, HZ, { t: '#9A9C9E', l: '#86888A', r: '#6E7072' }, HX + HW / 2 + HY + HD / 2 - 0.2);
    L.caja(HX, HY, HZ, HW, HD, HH, { t: '#2B2724', l: '#23201D', r: '#191614' }, HX + HW / 2 + HY + HD / 2 + 0.3);
    const kH = HX + HW / 2 + HY + HD / 2 + 0.31;
    // Fachada del lado de la terraza: forro negro vertical, el ventanal corredera con el living adentro y la franja de madera
    L.planoY(HX, HY + HD + 0.004, HZ + HH, HW * 100, HH * 100,
      `<rect width="${HW * 100}" height="${HH * 100}" fill="#23201D"/>` + Array.from({ length: 60 }, (_, i) => `<path d="M${i * 10 + 5} 0V${HH * 100}" stroke="#1A1715" stroke-width="2"/>`).join('') +
      `<rect x="40" y="40" width="80" height="70" fill="#C8D6DC" stroke="${TINTA}" stroke-width="5"/><path d="M80 40V110" stroke="${TINTA}" stroke-width="3"/>` +
      living() + `<rect x="490" y="0" width="110" height="${HH * 100}" fill="#B98B5E"/>` + Array.from({ length: 11 }, (_, i) => `<path d="M${495 + i * 10} 0V${HH * 100}" stroke="#9C7550" stroke-width="2.4"/>`).join(''), kH);
    planoXen(L, HX + HW + 0.004, HY + HD, HZ + HH, HD * 100, HH * 100,
      `<rect width="${HD * 100}" height="${HH * 100}" fill="#191614"/>` + Array.from({ length: 25 }, (_, i) => `<path d="M${i * 10 + 5} 0V${HH * 100}" stroke="#121010" stroke-width="2"/>`).join('') +
      `<rect x="60" y="42" width="130" height="100" fill="#D5E2E6" stroke="${TINTA}" stroke-width="5"/><path d="M125 42V142" stroke="${TINTA}" stroke-width="3"/><path d="M70 42L100 142H116L86 42Z" fill="#FFFFFF" opacity=".35"/>`, kH);
    // Techo con canto de madera
    L.caja(HX - 0.08, HY - 0.08, HZ + HH, HW + 0.16, HD + 0.16, 0.12, { t: '#2B2724', l: '#B98B5E', r: '#9C7550' }, kH + 0.02);
    // Terraza de madera y la pérgola
    const TX0 = 10.9, TX1 = 15.1, TY0 = HY + HD, TY1 = 11.0;
    L.caja(TX0, TY0, 0, TX1 - TX0, TY1 - TY0, HZ, NOGAL, (TX0 + TX1) / 2 + (TY0 + TY1) / 2 - 1.2);
    L.piso(TX0, TY0, Array.from({ length: 21 }, (_, i) => `<path d="M${i * 20 + 10} 0V${(TY1 - TY0) * 100}" stroke="#7E5C3C" stroke-width="2"/>`).join(''), (TX0 + TX1) / 2 + (TY0 + TY1) / 2 - 1.19, HZ + 0.002);
    L.cil(11.8, 9.3, HZ, 0.07, 0.42, '#1C1917', '#1C1917'); L.caja(11.45, 8.95, HZ + 0.42, 0.7, 0.7, 0.05, { t: '#D6B68C', l: '#A27F55', r: '#8B6A4E' }, 11.8 + 9.3 + 0.4);
    for (const [x, y] of [[11.2, 10.2], [12.5, 10.3]]) { L.caja(x - 0.25, y - 0.25, HZ, 0.5, 0.5, 0.4, { t: '#E8DDC7', l: '#CFC1A3', r: '#B8A987' }, x + y); L.caja(x - 0.25, y - 0.3, HZ + 0.4, 0.5, 0.08, 0.4, { t: '#E8DDC7', l: '#CFC1A3', r: '#B8A987' }, x + y + 0.01); }
    const PZ = HZ + HH - 0.05;
    for (const x of [TX0 + 0.05, TX1 - 0.13]) L.caja(x, TY1 - 0.13, HZ, 0.08, 0.08, PZ - HZ, NEGRO, x + TY1 + 0.25);
    L.caja(TX0 + 0.05, TY1 - 0.13, PZ, TX1 - TX0 - 0.1, 0.1, 0.1, NEGRO, (TX0 + TX1) / 2 + TY1 + 0.6);
    for (let x = TX0 + 0.2; x < TX1 - 0.1; x += 0.35) L.caja(x, TY0, PZ + 0.1, 0.05, TY1 - TY0, 0.06, NEGRO, x + TY1 + 0.62);
    // Quienes miran la casa: un asesor con una pareja, y el niño que corre por la terraza
    pj('ejecutivo', 15.6, 9.05, 0, 'i');
    pj('senora', 13.75, 11.55, 0, 'd');
    pj('senor', 14.7, 11.8, 0, 'd');
    camina('nino', [[12.2, 9.6, 1.5], [13.9, 9.9, 1], [14.2, 8.7, 1.5], [12.4, 8.8], [12.2, 9.6]], { e: EA * 0.72, vel: 0.7 });
    // El letrero de la casa
    L.caja(15.55, 10.95, 0, 0.5, 0.1, 1.35, NEGRO, 15.8 + 11.0 + 0.6);
    L.planoY(15.57, 11.056, 1.32, 46, 60, serif(4, 22, 'Casa', 20, '#F4ECD8') + serif(4, 42, 'piloto', 20, '#F4ECD8', ' font-style="italic"') + `<rect x="5" y="50" width="22" height="2" fill="${ORO}"/>`, 15.8 + 11.06 + 0.61);
    zona('piloto', { formas: [{ piso: [[10.1, 5.5], [16.3, 5.5], [16.3, 8.2], [15.2, 8.2], [15.2, 11.1], [10.8, 11.1], [10.8, 8.2], [10.1, 8.2]], alto: 2.5 }],
      lugar: [13.2, 6.85, 2.95], guia: [16.7, 8.9] });

    // ── Los modelos, en maqueta, junto a la entrada ──
    const pedestal = (x, y, k) => { L.caja(x, y, 0, 0.9, 0.9, 0.86, CREMA, k); };
    pedestal(11.5, 12.55, 24.5); casita(L, 11.62, 12.8, 0.86, 0.66, 0.36, 0.27, { k: 24.7 });
    pedestal(12.75, 12.55, 25.7); casita(L, 12.87, 12.8, 0.86, 0.66, 0.36, 0.27, { k: 25.9 }); casita(L, 13.05, 12.82, 1.13, 0.36, 0.32, 0.22, { k: 26.1 });
    pedestal(14.0, 12.55, 26.9); casita(L, 14.1, 12.62, 0.86, 0.52, 0.34, 0.27, { k: 27.1 }); L.caja(14.1, 12.97, 0.86, 0.52, 0.34, 0.03, NOGAL, 27.2);
    for (const [x, t] of [[11.5, 'Un módulo'], [12.75, 'Dos pisos'], [14.0, 'Con terraza']]) L.planoY(x + 0.08, 13.452, 0.62, 74, 18, `<rect width="74" height="18" rx="2" fill="${TINTA}"/>` + serif(6, 13, t, 12, '#F4ECD8'), x + 13.5 + 0.9);
    [[11.5, 1.2], [12.75, 1.4], [14.0, 1.2]].forEach(([x, h], i) => zona('modelo-' + (i + 1), { formas: [{ piso: [[x, 12.55], [x + 0.9, 12.55], [x + 0.9, 13.45], [x, 13.45]], alto: h }], lugar: [x + 0.45, 13.0, h + 0.45] }));

    // ── La entrada: el felpudo, el mesón de recepción y quien te recibe ──
    L.piso(15.3, 12.9, `<rect width="150" height="90" rx="8" fill="${TINTA}"/><rect x="8" y="8" width="134" height="74" rx="5" fill="none" stroke="${ORO}" stroke-width="2.4"/>` + serif(75, 54, 'NÜHOME', 23, '#F4ECD8', ' letter-spacing="1.5" text-anchor="middle"'), -52);
    pj('nhRecepcion', 17.9, 10.95, 0, 'i');
    L.caja(16.7, 11.4, 0, 2.6, 0.6, 1.02, NEGRO, 16.7 + 1.3 + 11.7 + 0.5);
    L.caja(16.62, 11.34, 1.02, 2.76, 0.72, 0.06, ROBLE, 16.7 + 1.3 + 11.7 + 0.52);
    L.planoY(16.95, 12.004, 0.86, 210, 60, `<image href="§M§logo-nuhome.webp" x="72" y="2" width="66" height="47" opacity=".95"/>`, 16.7 + 1.3 + 11.7 + 0.51);
    L.cil(19.05, 11.62, 1.08, 0.1, 0.16, '#F4ECD8', '#CFC1A3', 31.5); L.luz(19.05, 11.62, 1.24, 6, 3, '#3E7A4E', 31.51);
    plantaAlta(L, 19.55, 10.4, 1.05);
    zona('recepcion', { formas: [{ piso: [[16.5, 10.55], [19.45, 10.55], [19.45, 12.15], [16.5, 12.15]], alto: 2.2 }], lugar: [18.0, 11.7, 1.6], guia: [15.85, 12.35] });
    lugar('entrada', 15.9, 12.4, 0.9);
    // Una asesora que acompaña a recorrer (en el recorrido, se para junto a cada zona)
    camina('nhGuia', [[16.95, 6.2, 2.5], [16.8, 9.7, 2], [16.95, 6.2]], { vel: 0.45 });

    // ── El rincón de BiPlot: chico, junto a la asesoría ──
    L.caja(8.05, 12.55, 0, 1.15, 0.72, 1.02, { t: '#0E2A47', l: '#0B1F36', r: '#081628' }, 8.6 + 12.9 + 0.5);
    L.caja(8.05, 12.55, 1.02, 1.15, 0.72, 0.04, { t: '#17C3B2', l: '#0A8A7E', r: '#087066' }, 8.6 + 12.9 + 0.52);
    L.planoY(8.15, 13.274, 0.9, 95, 60, `<rect x="4" y="6" width="22" height="22" rx="5" fill="#0E2A47" stroke="#17C3B2" stroke-width="1.6"/><path d="M9 11V23H22" stroke="#3F6DA0" stroke-width="1.4" fill="none"/><circle cx="11" cy="20" r="1.8" fill="#17C3B2"/><circle cx="15" cy="17" r="1.8" fill="#17C3B2"/><circle cx="20.5" cy="12.5" r="2.2" fill="#FF6B4A"/>` +
      txt(32, 17, 'Hecho con', 9, '#A9B7C6') + txt(32, 28, 'BiPlot', 11, '#FFFFFF') + `<rect x="4" y="38" width="86" height="3" rx="1.5" fill="#17C3B2"/>`, 8.6 + 13.3 + 0.53);
    L.caja(8.62, 12.88, 1.06, 0.06, 0.05, 0.08, { t: TINTA, l: TINTA, r: '#000' }, 8.6 + 12.9 + 0.6);
    L.caja(8.26, 12.9, 1.13, 0.78, 0.05, 0.47, { t: TINTA, l: TINTA, r: '#000' }, 8.6 + 12.9 + 0.62);
    // En la pantalla del quiosco, el video de Nu Home 360 (su póster está en media/, junto a media/salas/)
    L.planoY(8.28, 12.952, 1.58, 74, 43, `<rect width="74" height="43" rx="2" fill="${TINTA}"/><image href="§M§../nuhome-360-h.jpg" x="2.5" y="2.5" width="69" height="38" preserveAspectRatio="xMidYMid slice"/><circle cx="37" cy="21.5" r="8" fill="rgba(11,23,38,.7)"/><path d="M34.4 17.3V25.7L41.2 21.5Z" fill="#FFFFFF"/>`, 8.6 + 12.95 + 0.63);
    // Bucle (E5 · Desarrollo), porque Nu Home 360 está en desarrollo, mirando el quiosco
    pj('bucle', 9.7, 12.95, 0, 'i');
    zona('biplot', { formas: [{ piso: [[7.95, 12.45], [9.3, 12.45], [9.3, 13.4], [7.95, 13.4]], alto: 1.65 }], lugar: [8.62, 12.9, 1.95], guia: [10.45, 12.2] });

    return { id: 'nuhome', ancho: W, fondo: D };
  });
}

// Las salas de Fundos, Haru, Eleven y Rumbo son salas propias, como esta: están en salas-propias/ (usan montar())
export const SALAS_GRANDES = { nuhome };
