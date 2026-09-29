// Propuesta: la sala de Fundos Inmobiliaria como su propia sala de ventas de parcelas, dentro del barrio de BiPlot HQ.
// Mismo motor y misma proyección de las salas grandes; los datos de proyectos y lotes salen de la propuesta de su sitio
// (propuestas/fundos-inmobiliaria/lib/manifest.js), que son referenciales.
const R = new URL('../../dibujos', import.meta.url).href;
const { escena, P, registrarMedida } = await import(R + '/barrio/maqueta.mjs');
const S = await import(R + '/barrio/locales.mjs');
const { VISITANTES, persona, PIEL, medida } = await import(R + '/barrio/visitantes.mjs');
const { caminante, EA } = await import(R + '/barrio/salas-grandes.mjs');
export { componer } from '../sala-nuhome/sala.mjs';
export { P };

const r1 = (n) => Math.round(n * 10) / 10;
const SERIF = `font-family="'Cormorant Garamond','DejaVu Serif',serif"`;
const SANS = `font-family="'Mulish','Inter','DejaVu Sans',sans-serif"`;
const MONO = `font-family="'Space Mono','DejaVu Sans Mono',monospace"`;
const serif = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${SERIF} font-weight="600" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const sans = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${SANS} font-weight="600" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const txt = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" font-family="'Space Grotesk','DejaVu Sans',sans-serif" font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;

// ───────── La paleta de Fundos: verde bosque, dorado tierra y crema ─────────
const VERDE = { t: '#1F3B2B', l: '#16301F', r: '#0F1F16' };
const MUSGO = { t: '#2F5A45', l: '#244A37', r: '#1B3A2B' };
const RAULI = { t: '#A8744A', l: '#8E5F3A', r: '#744C2E' };
const LANA = { t: '#E8DDC7', l: '#D5C8AD', r: '#BFB295' };
const ORO = '#C8A165', ORO2 = '#D8B982', CREMA = '#F7F5F0', TINTA = '#0F1F16';

// ───────── La gente de Fundos: su equipo comercial con la polera de la marca ─────────
const PELO = { negro: ['#1A1613', '#0B0908', '#3A322C'], cafe: ['#4A3222', '#2E1F15', '#7A5334'], castano: ['#6E4A30', '#4A3222', '#8B6A4E'], rubio: ['#D9A441', '#B8862A', '#F4DDA8'] };
const Z = { negras: ['#1F2733', '#0B1726', null], cafe: ['#6E4A30', '#4A3222', null], blancas: ['#F2F4F7', '#B9C8D8', '#17C3B2'], botas: ['#8B6A4E', '#4A3222', null] };
const POLERA = ['#5E9AA3', '#4A808A', [ORO2, 'M18.8 26.4H21.4V28.6H18.8Z']];
const NEGRO = ['#1F2733', '#141A23'], BEIGE = ['#CDB892', '#B09B74'], OLIVA = ['#6E7456', '#565C42'], JEAN = ['#35679A', '#27507C'];
const FD = {
  fdRecepcion: { piel: PIEL.media, pelo: PELO.castano, peinado: 'largo', cuerpo: 'fino', arriba: 'polera', arribaCol: POLERA, manga: 'corta', abajo: 'pantalon', abajoCol: BEIGE, zapatos: Z.cafe, brazoD: 'saluda', ojos: 'grandes', boca: 'dientes', aros: ORO2 },
  fdMaqueta: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'largo', cuerpo: 'fino', arriba: 'polera', arribaCol: POLERA, manga: 'corta', abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'senala', ojos: 'grandes' },
  fdGuia: { piel: PIEL.clara, pelo: PELO.cafe, peinado: 'corto', arriba: 'polera', arribaCol: POLERA, manga: 'corta', abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'sostiene', objeto: 'tablet', barba: '#4A3222', ojos: 'felices' },
  fdEjecutiva1: { piel: PIEL.media, pelo: PELO.negro, peinado: 'largo', cuerpo: 'fino', arriba: 'polera', arribaCol: POLERA, manga: 'corta', abajo: 'pantalon', abajoCol: OLIVA, zapatos: Z.negras, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'grandes', aros: ORO2 },
  fdEjecutiva2: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'melena', cuerpo: 'fino', arriba: 'polera', arribaCol: POLERA, manga: 'corta', abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'grandes' },
  fdFirma: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'cola', cuerpo: 'fino', arriba: 'polera', arribaCol: POLERA, manga: 'corta', abajo: 'pantalon', abajoCol: BEIGE, zapatos: Z.cafe, brazoD: 'saluda', brazoI: 'sostiene', objetoI: 'carpeta', ojos: 'felices', boca: 'dientes' },
  // Quienes compran
  fdEl: { piel: PIEL.trigo, pelo: PELO.cafe, peinado: 'corto', arriba: 'chaqueta', arribaCol: ['#6E5A42', '#584836', ['#E8DFC8', null]], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.botas, brazoD: 'frente', barba: '#4A3222', ojos: 'felices' },
  fdElla: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'largo', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#C9824E', '#A8683A', ['#F2F4F7']], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.cafe, brazoD: 'saluda', ojos: 'grandes', boca: 'dientes', rubor: '#E9967A' },
  fdCompradora: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'mono', cuerpo: 'fino', arriba: 'chaqueta', arribaCol: ['#8B3A3A', '#6E2C2C', ['#F2F4F7', null]], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'celular', ojos: 'grandes' },
  fdMaquetaEl: { piel: PIEL.clara, pelo: ['#B9C0C8', '#8E949C', '#E4E7EB'], peinado: 'peinado', arriba: 'parka', arribaCol: ['#35557A', '#27425F', '#1E3550'], abajo: 'pantalon', abajoCol: BEIGE, zapatos: Z.cafe, brazoD: 'senala', lentes: 'rectos', bigote: '#DADDE2' },
  fdMaquetaElla: { piel: PIEL.rosada, pelo: PELO.castano, peinado: 'melena', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#8E6BB8', '#6E4E96', ['#F2F4F7']], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, brazoD: 'abajo', brazoI: 'abajo', objetoI: 'bolso', bolsoCol: '#6E4A30', ojos: 'grandes', rubor: '#E9967A' }
};
for (const [id, o] of Object.entries(FD)) {
  VISITANTES[id] = () => persona(o);
  registrarMedida(id, o.piernas === 'sentado' ? { cx: 15.6, pie: 38.6, sentado: true, alto: 50, ancho: 30 } : medida(id, persona(o)));
}

// ───────── Piezas ─────────
const W = 20, D = 14, HM = 2.6;
function base(E, L) {
  E.losa(-0.12, -0.12, W + 0.12, D + 0.12, 0, '#C99D6B', -1000);
  let t = '';
  for (let v = 30; v < D * 100; v += 30) t += `<path d="M0 ${v}H${W * 100}" stroke="#B88B5B" stroke-width="1.8"/>`;
  for (let v = 0, i = 0; v < D * 100; v += 30, i++) for (let u = (i % 4) * 60 + 30; u < W * 100; u += 240) t += `<path d="M${u} ${v}V${v + 30}" stroke="#B88B5B" stroke-width="1.5"/>`;
  L.piso(0, 0, t, -56);
  const s = 0.5, c = { muroY: '#244634', muroX: '#1C3829', zocalo: '#0F1F16', tope: '#3A5E48', canto: '#122A1C' };
  for (let x = 0; x < W - 0.001; x += s) {
    const b = Math.min(W, x + s);
    L.add(-50 + b * 0.01, L.poly([[x, 0, 0], [b, 0, 0], [b, 0, HM], [x, 0, HM]], `fill="${c.muroY}"`) +
      L.poly([[x, 0, 0], [b, 0, 0], [b, 0, 0.12], [x, 0, 0.12]], `fill="${c.zocalo}"`) +
      L.poly([[x, 0, HM - 0.05], [b, 0, HM - 0.05], [b, 0, HM - 0.02], [x, 0, HM - 0.02]], `fill="${ORO}"`) +
      L.poly([[x, 0, HM], [b, 0, HM], [b, -0.14, HM], [x, -0.14, HM]], `fill="${c.tope}"`));
  }
  for (let y = 0; y < D - 0.001; y += s) {
    const b = Math.min(D, y + s);
    L.add(-50 + b * 0.01, L.poly([[0, y, 0], [0, b, 0], [0, b, HM], [0, y, HM]], `fill="${c.muroX}"`) +
      L.poly([[0, y, 0], [0, b, 0], [0, b, 0.12], [0, y, 0.12]], `fill="${c.zocalo}"`) +
      L.poly([[0, y, HM - 0.05], [0, b, HM - 0.05], [0, b, HM - 0.02], [0, y, HM - 0.02]], `fill="${ORO}"`) +
      L.poly([[0, y, HM], [0, b, HM], [-0.14, b, HM], [-0.14, y, HM]], `fill="${c.tope}"`));
  }
  L.add(-49, L.poly([[W, 0, 0], [W, 0, HM], [W, -0.14, HM], [W, -0.14, 0]], `fill="${c.canto}"`) + L.poly([[0, D, 0], [0, D, HM], [-0.14, D, HM], [-0.14, D, 0]], `fill="${c.canto}"`));
}
function planoXen(L, x, y0, zTop, ancho, alto, svg, k) {
  const [px, py] = L.P(x, y0, zTop); L.E.marca(x, y0, zTop); L.E.marca(x, y0 - ancho / 100, zTop - alto / 100);
  return L.add(k, `<g transform="matrix(0.32,-0.16,0,0.39,${r1(px)},${r1(py)})">${svg}</g>`);
}
function silla(L, x, y, col = VERDE) {
  L.cil(x, y, 0, 0.05, 0.4, '#3A3530', '#2B2724', x + y - 0.2);
  L.caja(x - 0.22, y - 0.22, 0.4, 0.44, 0.44, 0.07, col, x + y - 0.15);
}
function plantaAlta(L, x, y, t = 1, maceta = ['#6E4A30', '#4A3222']) {
  L.cil(x, y, 0, 0.26 * t, 0.42 * t, maceta[0], maceta[1]);
  const [cx, cy] = L.P(x, y, 0.42 * t + 0.55 * t), k = x + y + 0.12;
  L.add(k, `<path d="M${r1(cx)} ${r1(cy + 22 * t)}V${r1(cy - 10 * t)}" stroke="#4A3F2E" stroke-width="${r1(2 * t)}"/>` +
    [[-12, 4, 11, '#3E7A4E'], [11, -2, 12, '#2F6440'], [-4, -14, 11, '#4E8A55'], [8, -22, 9, '#3E7A4E'], [-10, -26, 8, '#2F6440'], [2, 10, 9, '#4E8A55']]
      .map(([dx, dy, r, c]) => `<ellipse cx="${r1(cx + dx * t)}" cy="${r1(cy + dy * t)}" rx="${r1(r * t)}" ry="${r1(r * 0.72 * t)}" fill="${c}" transform="rotate(${dx > 0 ? -24 : 24} ${r1(cx + dx * t)} ${r1(cy + dy * t)})"/>`).join(''));
}
// Araucaria en silueta (tronco y dos pisos de ramas), para los paisajes
const araucaria = (x, y, s, c = '#1F3B2A') => { const q = (n) => r1(n * s); return `<path d="M${x} ${y}V${r1(y - 33 * s)}" stroke="${c}" stroke-width="${q(3)}"/>` +
  `<path d="M${r1(x - 19 * s)} ${r1(y - 29 * s)}C${r1(x - 12 * s)} ${r1(y - 38 * s)} ${r1(x + 12 * s)} ${r1(y - 38 * s)} ${r1(x + 19 * s)} ${r1(y - 29 * s)}Z" fill="${c}"/>` +
  `<path d="M${r1(x - 11 * s)} ${r1(y - 36 * s)}C${r1(x - 7 * s)} ${r1(y - 43 * s)} ${r1(x + 7 * s)} ${r1(y - 43 * s)} ${r1(x + 11 * s)} ${r1(y - 36 * s)}Z" fill="${c}"/>`; };
const pino = (x, y, a, c1 = '#2F5A3E', c2 = '#3B6B4A') => `<path d="M${x} ${y - a}L${r1(x - a * 0.34)} ${y}H${r1(x + a * 0.34)}Z" fill="${c1}"/><path d="M${x} ${r1(y - a * 0.72)}L${r1(x - a * 0.28)} ${r1(y - a * 0.1)}H${r1(x + a * 0.28)}Z" fill="${c2}"/>`;
const cipres = (x, y, a, c = '#3E6B3A') => `<path d="M${x} ${y - a}C${r1(x + a * 0.16)} ${r1(y - a * 0.7)} ${r1(x + a * 0.13)} ${r1(y - a * 0.1)} ${x} ${y}C${r1(x - a * 0.13)} ${r1(y - a * 0.1)} ${r1(x - a * 0.16)} ${r1(y - a * 0.7)} ${x} ${y - a}Z" fill="${c}"/>`;

// Los tres paisajes (400 × 170 unidades de plano), cada uno con su marco dorado y su nombre
function paisaje(tipo) {
  const w = 400, h = 170;
  let s = '';
  if (tipo === 'malalcahuello') {
    s += `<defs><linearGradient id="fd-cielo-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC3DC"/><stop offset="1" stop-color="#E6EEF2"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#fd-cielo-m)"/>`;
    s += `<path d="M150 118L232 32L262 36L340 118Z" fill="#7E8C99"/><path d="M232 32L262 36L286 60L270 66L256 52L244 64L226 56L212 62Z" fill="#F7F8FA"/>`;
    s += `<path d="M0 104L60 78L110 98L170 84L230 104L300 88L400 100V${h}H0Z" fill="#5E7A62"/>`;
    s += `<path d="M0 132Q100 112 200 126T400 122V${h}H0Z" fill="#3E6B4A"/>`;
    for (const [x, y, sc] of [[34, 140, 1.25], [74, 134, 0.95], [352, 138, 1.2], [310, 131, 0.8], [128, 128, 0.7]]) s += araucaria(x, y, sc, '#1E3A28');
    s += `<path d="M0 158Q90 146 180 154T400 150V${h}H0Z" fill="#5A93B8"/><path d="M40 160Q120 152 200 158" stroke="#E6EEF2" stroke-width="2" fill="none" opacity=".7"/>`;
    s += `<ellipse cx="120" cy="160" rx="14" ry="5" fill="#8E949C"/><ellipse cx="270" cy="158" rx="11" ry="4" fill="#7E8C99"/>`;
  } else if (tipo === 'marchigue') {
    s += `<defs><linearGradient id="fd-cielo-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C98A"/><stop offset="1" stop-color="#FBEBCF"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#fd-cielo-c)"/>`;
    s += `<circle cx="300" cy="52" r="20" fill="#FFE1A0"/><circle cx="300" cy="52" r="32" fill="#FFE1A0" opacity=".3"/>`;
    s += `<path d="M0 92Q70 70 150 86T290 80T400 88V${h}H0Z" fill="#B7A25E"/>`;
    s += `<path d="M0 116Q90 92 200 108T400 104V${h}H0Z" fill="#8F9A4E"/>`;
    for (let i = 0; i < 9; i++) s += `<path d="M${-20 + i * 8} ${h}Q${120 + i * 20} ${118 - i * 2} ${420} ${112 + i * 7}" stroke="#5E7A3A" stroke-width="3.2" fill="none" stroke-dasharray="7 5"/>`;
    for (const [x, a] of [[40, 46], [54, 58], [68, 50], [82, 42]]) s += cipres(x, 112, a, '#4E6B34');
    s += `<rect x="330" y="98" width="30" height="16" fill="#E8DDC7"/><path d="M326 98L345 88L364 98Z" fill="#A85A3A"/>`;
  } else {
    s += `<defs><linearGradient id="fd-cielo-p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9CBE0"/><stop offset="1" stop-color="#E8F0F4"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#fd-cielo-p)"/>`;
    s += `<path d="M120 100L200 30H216L300 100Z" fill="#8391A0"/><path d="M200 30H216L240 52L226 58L214 48L204 58L190 50L178 54Z" fill="#F7F8FA"/>`;
    s += `<rect y="98" width="${w}" height="30" fill="#5C8FB4"/><path d="M0 104H400M20 112H380" stroke="#DCEAF2" stroke-width="1.6" opacity=".6"/>`;
    s += `<path d="M0 126Q60 116 140 124T300 120T400 124V${h}H0Z" fill="#2F5A3E"/>`;
    for (let i = 0; i < 18; i++) { const x = i * 24 + (i % 3) * 5, a = 26 + ((i * 29) % 17); s += pino(x, 160 + (i % 2) * 6, a, '#23452F', '#2F5A3E'); }
    s += `<path d="M150 ${h}Q170 150 200 146T260 140" stroke="#6FA3C4" stroke-width="5" fill="none"/>`;
  }
  s += `<path d="M40 0L0 ${h}H22L62 0ZM250 0L210 ${h}H222L262 0Z" fill="#FFFFFF" opacity=".14"/>`;
  s = `<clipPath id="fd-vent-${tipo}"><rect width="${w}" height="${h}"/></clipPath><g clip-path="url(#fd-vent-${tipo})">${s}</g>`;
  s += `<rect width="${w}" height="${h}" fill="none" stroke="${ORO}" stroke-width="7"/><rect x="198" width="4" height="${h}" fill="${ORO}"/>`;
  return s;
}
const NOMBRES = { malalcahuello: ['Malalcahuello', 'La Araucanía · Cordillera'], marchigue: ['Marchigüe', "O'Higgins · Valle de Colchagua"], 'puerto-varas': ['Puerto Varas', 'Los Lagos · Entre mar y lago'] };

// El recorrido 360°: el río Lolén desde dentro del bosque, en los dos muros del rincón (cada tramo, 430 × 200)
function panorama(tramo) {
  const w = 430, h = 200;
  let s = `<defs><linearGradient id="fd-pan-${tramo}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FC0E0"/><stop offset=".6" stop-color="#DDEBF2"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#fd-pan-${tramo})"/>`;
  s += `<path d="M0 ${tramo ? 60 : 70}Q120 40 230 58T430 ${tramo ? 70 : 60}V${h}H0Z" fill="#4E7A45"/>`;
  s += `<path d="M0 118Q110 100 230 112T430 108V${h}H0Z" fill="#3E6B3A"/>`;
  // El río con sus piedras
  s += `<path d="M0 142Q120 128 230 140T430 136V${h}H0Z" fill="#5E97B8"/>`;
  s += `<path d="M20 156Q140 146 260 154T420 150" stroke="#DCEAF2" stroke-width="2.2" fill="none" opacity=".7"/><path d="M60 176Q160 166 300 174" stroke="#DCEAF2" stroke-width="1.8" fill="none" opacity=".55"/>`;
  for (const [x, y, rx] of (tramo ? [[80, 150, 26], [250, 162, 20], [360, 146, 30]] : [[60, 158, 22], [190, 146, 28], [330, 164, 24]])) s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${r1(rx * 0.42)}" fill="#6E767E"/><ellipse cx="${x - 4}" cy="${y - 3}" rx="${r1(rx * 0.7)}" ry="${r1(rx * 0.22)}" fill="#8E969E"/>`;
  // Troncos y copas del bosque
  for (const [x, a] of (tramo ? [[40, 1], [300, 0.8], [400, 1.1]] : [[110, 1.05], [240, 0.8], [380, 0.9]])) {
    s += `<path d="M${x} ${h - 58}C${x - 4} 110 ${x + 6} 60 ${x - 2} 0H${x + 16}C${x + 10} 60 ${x + 20} 110 ${x + 16} ${h - 58}Z" fill="#4A3A2A"/>`;
    s += `<ellipse cx="${x + 8}" cy="${r1(24 * a)}" rx="${r1(70 * a)}" ry="${r1(34 * a)}" fill="#2F5A3E" opacity=".92"/><ellipse cx="${x + 40}" cy="${r1(40 * a)}" rx="${r1(46 * a)}" ry="${r1(24 * a)}" fill="#3E6B4A" opacity=".9"/>`;
  }
  s = `<clipPath id="fd-pan-borde-${tramo}"><rect width="${w}" height="${h}"/></clipPath><g clip-path="url(#fd-pan-borde-${tramo})">${s}</g>`;
  s += `<rect width="${w}" height="${h}" fill="none" stroke="${TINTA}" stroke-width="5"/>`;
  if (tramo === 0) s += `<rect x="16" y="14" width="126" height="30" rx="15" fill="rgba(15,31,22,.78)"/>` + txt(30, 35, '360°', 15, ORO2) + sans(72, 34, 'Lolén', 13, CREMA);
  return s;
}

// La maqueta del predio de Puerto Varas: bosque nativo, el estero, el camino principal y los lotes por precio
const CAT = { amarillo: '#C9C43A', verdeClaro: '#35A83A', celeste: '#1E95BF', verdeOscuro: '#2F5E2C', morado: '#6A67C9' };
function predio() {
  const w = 420, h = 300;
  let s = `<rect width="${w}" height="${h}" fill="#5E8A4E"/>`;
  // Bosque nativo en los bordes
  for (let i = 0; i < 46; i++) { const x = (i * 53) % w, y = (i * 37) % h; if (x > 40 && x < 380 && y > 36 && y < 264) continue; s += `<circle cx="${x}" cy="${y}" r="${9 + (i % 4) * 2}" fill="${i % 2 ? '#2F5A3E' : '#3E6B4A'}"/>`; }
  // Caminos (el principal y los interiores), en arena con borde punteado
  s += `<path d="M0 150H420" stroke="#E4D2A8" stroke-width="16"/><path d="M0 150H420" stroke="#B8A27A" stroke-width="16" stroke-dasharray="2 10" opacity=".5"/>`;
  s += `<path d="M140 40V260M280 40V260" stroke="#E4D2A8" stroke-width="10"/>`;
  // El estero que cruza el predio
  s += `<path d="M30 300C80 240 120 230 170 200S260 150 300 110S380 60 420 30" stroke="#4E8FC0" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  // Los lotes: una grilla por manzana, cada uno con el color de su categoría (el 79 está vendido)
  const colores = ['verdeOscuro', 'morado', 'verdeClaro', 'celeste', 'celeste', 'verdeClaro', 'celeste', 'amarillo'];
  let n = 1;
  for (const [x0, y0] of [[46, 46], [150, 46], [290, 46], [46, 160], [150, 160], [290, 160]]) {
    for (let f = 0; f < 3; f++) for (let c = 0; c < 3; c++) {
      const x = x0 + c * 30, y = y0 + f * 30, cat = colores[(n * 5 + f) % colores.length];
      const tuyo = x0 === 150 && y0 === 160 && f === 0 && c === 1;
      s += `<rect x="${x}" y="${y}" width="27" height="27" rx="2" fill="${CAT[tuyo ? 'verdeClaro' : cat]}" stroke="${tuyo ? '#D8B982' : '#F7F5F0'}" stroke-width="${tuyo ? 3.5 : 2}"/>`;
      n++;
    }
  }
  return s;
}

// ───────── La sala ─────────
function montar(fn) {
  const E = escena(); E.txt = 1;
  const L = S.local(E, 0, 0, 0, false, 0);
  const usados = new Set(), caminan = [], lugares = {};
  const pj = (id, x, y, z = 0, dir = 'd', e = EA, k) => { usados.add(id); L.pj(id, x, y, z, dir, e, k); };
  const camina = (id, ruta, o = {}) => { usados.add(id); caminan.push(caminante(E, id, ruta, o)); };
  const lugar = (id, x, y, z) => { lugares[id] = P(x, y, z).map(r1); };
  const info = fn({ E, L, pj, camina, lugar });
  const r = E.svg(18), { capas, arriba } = E.capas();
  return { vb: r.vb, capas, arriba, caminan, usados: [...usados], lugares, ...info };
}

export function salaFundos() {
  return montar(({ E, L, pj, camina, lugar }) => {
    base(E, L);

    // ── El camino de la compra: una huella dorada en el piso, de la puerta a la inscripción ──
    const huella = [[15.9, 13.4], [14.6, 11.2], [12.9, 9.2], [10.5, 8.6], [7.6, 6.2], [5.4, 4.8], [3.3, 3.8], [4.7, 6.6], [4.9, 9.4], [4.6, 11.0], [2.4, 12.3], [0.4, 12.3]];
    // Marcas de bronce embutidas en el piso, cada 45 cm a lo largo de la huella
    let marcas = '';
    for (let i = 0; i < huella.length - 1; i++) {
      const [ax, ay] = huella[i], [bx, by] = huella[i + 1], largo = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(largo / 0.45));
      for (let j = 0; j < n; j++) { const t = j / n, x = (ax + (bx - ax) * t) * 100, y = (ay + (by - ay) * t) * 100; marcas += `<circle cx="${r1(x)}" cy="${r1(y)}" r="8" fill="#16301F" stroke="${ORO2}" stroke-width="3"/>`; }
    }
    L.piso(0, 0, marcas, -53);

    // ── El mirador 360°: el río Lolén alrededor, en los dos muros del rincón ──
    L.planoY(0.15, 0.025, 2.4, 430, 200, panorama(0), -39);
    L.planoX(4.45, 2.4, 430, 200, panorama(1), -39);
    L.piso(0.9, 0.9, `<circle cx="140" cy="140" r="132" fill="#16301F" stroke="${ORO}" stroke-width="3"/><circle cx="140" cy="140" r="104" fill="none" stroke="${ORO}" stroke-width="1.4" stroke-dasharray="4 7"/>` +
      `<path d="M140 30L152 128L140 140L128 128Z" fill="${ORO}"/><path d="M140 250L152 152L140 140L128 152Z" fill="#8C7445"/><path d="M30 140L128 128L140 140L128 152ZM250 140L152 152L140 140L152 128Z" fill="#A8905F"/>` +
      serif(132, 26, 'N', 16, ORO2), -52);
    pj('turista', 1.9, 2.55, 0, 'i');
    pj('estudiante', 2.75, 1.7, 0, 'i');
    pj('fdGuia', 3.7, 3.35, 0, 'i');
    lugar('mirador', 1.4, 1.4, 1.5);

    // ── Tres paisajes, un mismo cuidado: los ventanales de sus proyectos ──
    const vent = [['malalcahuello', 5.1], ['marchigue', 10.05], ['puerto-varas', 15.0]];
    for (const [id, x0] of vent) {
      L.planoY(x0, 0.025, 2.28, 400, 170, paisaje(id), -39);
      const [n, reg] = NOMBRES[id];
      L.planoY(x0 + 0.9, 0.025, 0.5, 220, 34, `<rect width="220" height="34" rx="3" fill="${TINTA}" stroke="${ORO}" stroke-width="1.6"/>` + serif(12, 23, n, 19, ORO2) + sans(12 + n.length * 9.2, 22, reg, 9, 'rgba(247,245,240,.75)'), -38);
      lugar('ventanal-' + id, x0 + 2.0, 0.05, 1.45);
    }
    // Banca de galería y plantas entre ventanales
    L.caja(5.6, 0.45, 0, 3.0, 0.5, 0.42, RAULI, 5.6 + 1.5 + 0.7 + 0.2);
    plantaAlta(L, 9.65, 0.5, 1.0);
    plantaAlta(L, 14.6, 0.5, 1.05);

    // ── El salón con la estufa a leña: el sur, con calma ──
    L.piso(15.3, 2.2, `<rect width="330" height="220" rx="10" fill="#C98E4E"/><rect x="12" y="12" width="306" height="196" rx="6" fill="none" stroke="#8C5A2E" stroke-width="4"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${40 + i * 30} 40L${55 + i * 30} 110L${40 + i * 30} 180" fill="none" stroke="#F4E2C4" stroke-width="3"/>`).join(''), -52);
    L.cil(19.05, 2.55, 0, 0.36, 0.08, '#2B2724', '#1C1917');
    L.cil(19.05, 2.55, 0.08, 0.3, 0.86, '#2B2724', '#1C1917', 21.9);
    L.caja(18.85, 2.84, 0.3, 0.4, 0.02, 0.36, { t: '#F5883A', l: '#F5883A', r: '#E0703A' }, 21.95);
    L.luz(19.05, 2.95, 0.02, 34, 17, 'rgba(245,136,58,.18)', -51);
    L.cil(19.05, 2.55, 0.94, 0.09, 1.66, '#2B2724', '#1C1917', 22.0);
    for (const [x, y, z] of [[18.1, 1.35, 0], [18.35, 1.35, 0], [18.6, 1.35, 0], [18.22, 1.35, 0.22], [18.47, 1.35, 0.22], [18.35, 1.35, 0.42]]) L.cil(x, y, z, 0.12, 0.22, '#C9A27A', '#7E5C3C', x + y + 0.1 + z);
    L.caja(16.0, 1.25, 0, 2.0, 0.75, 0.42, MUSGO, 17.0 + 1.6 + 0.6);
    L.caja(16.0, 1.0, 0, 2.0, 0.28, 0.85, MUSGO, 17.0 + 1.1 + 0.4);
    L.caja(15.85, 1.0, 0, 0.18, 1.0, 0.58, MUSGO, 16.0 + 1.5 + 0.2); L.caja(17.97, 1.0, 0, 0.18, 1.0, 0.58, MUSGO, 18.1 + 1.5 + 0.3);
    pj('lectora', 16.6, 1.6, 0.42, 'd', EA, 19.3);
    for (const [x, y] of [[15.6, 4.2], [17.4, 4.6]]) { L.caja(x - 0.3, y - 0.3, 0, 0.6, 0.6, 0.42, LANA, x + y); L.caja(x - 0.3, y - 0.36, 0.42, 0.6, 0.1, 0.5, LANA, x + y + 0.02); }
    pj('tomacafe', 17.4, 4.6, 0.42, 'd', EA, 22.3);
    L.cil(16.6, 3.3, 0, 0.36, 0.34, '#A8744A', '#744C2E');
    L.cil(16.45, 3.22, 0.34, 0.06, 0.26, '#5E8A7A', '#4A6E61', 20.1); L.cil(16.7, 3.35, 0.34, 0.06, 0.08, '#8B5A34', '#6E4527', 20.12); L.linea([[16.72, 3.35, 0.42], [16.78, 3.3, 0.52]], '#C9A27A', 1.4, 20.13);
    pj('perro', 18.7, 3.5, 0, 'i', EA * 0.9);
    plantaAlta(L, 19.45, 5.4, 1.0);
    lugar('salon', 17.0, 2.8, 1.7);

    // ── La maqueta del predio de Puerto Varas, con el lote 25 marcado ──
    const MX = 8.4, MY = 4.8, MW = 4.2, MD = 3.0, MZ = 0.86;
    L.caja(MX, MY, 0, MW, MD, MZ, { t: '#16301F', l: '#8E5F3A', r: '#744C2E' }, 16.0);
    L.piso(MX, MY, predio(), 16.01, MZ + 0.004);
    L.planoY(MX + 0.55, MY + MD + 0.004, 0.62, 300, 30, `<rect width="300" height="30" rx="2" fill="${TINTA}"/>` + serif(12, 21, 'Fundos de Puerto Varas', 17, ORO2) + sans(186, 20, '79 parcelas', 10, CREMA), 16.02);
    // Arbolitos en relieve sobre el bosque del predio
    for (const [x, y] of [[8.55, 5.0], [8.6, 6.2], [8.55, 7.55], [12.4, 5.0], [12.45, 6.6], [12.3, 7.6], [10.3, 4.95], [11.6, 7.65], [9.4, 7.65]]) { const k = 16.3 + (x + y) * 0.001; L.cil(x, y, MZ, 0.025, 0.12, '#4A3A2A', '#4A3A2A', k); const [cx, cy] = L.P(x, y, MZ + 0.2); L.add(k + 0.0005, `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="6.5" fill="#2F5A3E"/><circle cx="${r1(cx + 2.5)}" cy="${r1(cy - 3)}" r="4.2" fill="#3E6B4A"/>`); }
    // La banderita dorada del lote 25
    const [lx, ly] = [MX + 1.95, MY + 1.75];
    L.linea([[lx, ly, MZ], [lx, ly, MZ + 0.42]], TINTA, 1.8, 16.9);
    L.planoY(lx, ly + 0.001, MZ + 0.42, 22, 14, `<path d="M0 0H22L16 7L22 14H0Z" fill="${ORO2}" stroke="${TINTA}" stroke-width="1.2"/>` + txt(3, 10.5, '25', 8.5, TINTA), 16.91);
    pj('fdMaqueta', 8.0, 6.4, 0, 'd');
    pj('fdMaquetaEl', 13.05, 5.7, 0, 'i');
    pj('fdMaquetaElla', 13.2, 6.75, 0, 'i');
    camina('nino', [[11.6, 8.3, 1.5], [9.2, 8.35, 1.5], [11.6, 8.3]], { e: EA * 0.72, vel: 0.7 });
    lugar('maqueta', MX + MW / 2, MY + MD / 2, MZ + 0.1);
    lugar('lote25', lx, ly, MZ + 0.5);

    // ── El equipo: el muro de las personas y los escritorios de reserva y validación ──
    const retratos = ['fdRecepcion', 'fdMaqueta', 'fdGuia', 'fdEjecutiva1', 'fdEjecutiva2', 'fdFirma'];
    L.planoX(9.5, 2.5, 470, 96, serif(8, 24, 'Detrás de cada venta hay personas', 23, ORO2) +
      retratos.map((id, i) => { const cx = 36 + i * 72; return `<clipPath id="fd-ret-${i}"><circle cx="${cx}" cy="62" r="25"/></clipPath><circle cx="${cx}" cy="62" r="27" fill="${ORO}"/><circle cx="${cx}" cy="62" r="25" fill="#E9E1CF"/>` +
        `<g clip-path="url(#fd-ret-${i})"><use href="#v-${id}" transform="translate(${cx - 23.5} ${62 - 20}) scale(1.45)"/></g>`; }).join(''), -38);
    const escritorio = (y0, img, k) => {
      L.caja(2.35, y0, 0.7, 1.5, 0.8, 0.05, RAULI, k);
      L.caja(2.4, y0 + 0.05, 0, 0.08, 0.7, 0.7, VERDE, k - 0.4); L.caja(3.72, y0 + 0.05, 0, 0.08, 0.7, 0.7, VERDE, k - 0.1);
      L.caja(2.95, y0 + 0.3, 0.75, 0.06, 0.06, 0.2, TINTA, k + 0.02);
      L.planoY(2.66, y0 + 0.37, 1.32, 64, 42, `<rect width="64" height="42" rx="3" fill="${TINTA}"/><image href="${img}" x="3" y="3" width="58" height="36" preserveAspectRatio="xMidYMid slice"/>`, k + 0.03);
      L.caja(3.3, y0 + 0.45, 0.75, 0.3, 0.2, 0.02, { t: CREMA, l: '#E4DED2', r: '#CFC7B6' }, k + 0.04);
    };
    silla(L, 1.95, 6.4); pj('fdEjecutiva1', 1.95, 6.4, 0.47, 'd');
    escritorio(6.0, '§M§recorte-fundos-3-reservas.webp', 10.9);
    silla(L, 4.3, 6.4, MUSGO); pj('comensal5', 4.3, 6.4, 0.47, 'i');
    silla(L, 1.95, 8.6); pj('fdEjecutiva2', 1.95, 8.6, 0.47, 'd');
    escritorio(8.2, '§M§recorte-fundos-4-escrituras.webp', 13.1);
    silla(L, 4.3, 8.6, MUSGO); pj('comensal4', 4.3, 8.6, 0.47, 'i');
    lugar('equipo', 0.05, 7.2, 2.1);
    lugar('reserva', 3.1, 6.4, 1.4);
    lugar('validacion', 3.1, 8.6, 1.4);

    // ── La firma y la inscripción: la escritura sobre la mesa y el certificado en el muro ──
    L.planoX(12.55, 2.2, 200, 118, `<rect width="200" height="118" rx="3" fill="${ORO}"/><rect x="6" y="6" width="188" height="106" fill="#F4ECD8"/>` + serif(18, 32, 'Inscrita a tu nombre', 19, TINTA) +
      [44, 54, 64, 74].map(v => `<rect x="18" y="${v}" width="${v === 74 ? 90 : 150}" height="3.5" fill="#B9AE97"/>`).join('') +
      `<circle cx="160" cy="86" r="17" fill="none" stroke="#9A4432" stroke-width="2.6"/>` + txt(147, 90, 'CBR', 10, '#9A4432') + `<path d="M22 96Q40 84 58 96T96 92" fill="none" stroke="#1F3B5A" stroke-width="1.8"/>`, -38);
    L.cil(3.5, 11.35, 0, 0.07, 0.72, '#2B2724', '#1C1917');
    L.cil(3.5, 11.35, 0.72, 0.62, 0.05, '#6E4527', '#4A2E1A');
    L.caja(3.25, 11.2, 0.77, 0.36, 0.26, 0.015, { t: CREMA, l: '#E4DED2', r: '#CFC7B6' }, 15.2);
    L.linea([[3.42, 11.32, 0.79], [3.6, 11.42, 0.79]], TINTA, 1.6, 15.21);
    L.cil(3.78, 11.1, 0.77, 0.08, 0.1, '#8E5F3A', '#6E4527', 15.3); L.cil(3.78, 11.1, 0.87, 0.02, 0.1, '#4A3A2A', '#4A3A2A', 15.31);
    { const [cx, cy] = L.P(3.78, 11.1, 1.02); L.add(15.32, `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="7" fill="#4E8A55"/><circle cx="${r1(cx - 3)}" cy="${r1(cy - 3)}" r="4.5" fill="#6FAF6B"/>`); }
    pj('fdFirma', 2.55, 11.1, 0, 'd');
    pj('fdEl', 4.35, 10.95, 0, 'i');
    pj('fdElla', 4.3, 12.0, 0, 'i');
    lugar('firma', 3.5, 11.35, 1.9);
    lugar('cbr', 0.05, 11.55, 1.7);

    // ── Quien sigue su compra en el celular ──
    pj('fdCompradora', 14.9, 7.4, 0, 'i');
    lugar('micompra', 14.9, 7.4, 2.0);

    // ── La entrada: el letrero de sus valores, el felpudo y la recepción ──
    L.caja(13.45, 12.05, 0, 0.1, 0.1, 1.75, RAULI, 13.5 + 12.1 + 0.4);
    const tabla = (z, t, dir, k) => {
      const w = 88, x0 = dir > 0 ? 13.5 : 13.5 - w / 100;
      L.planoY(x0, 12.16, z, w, 18, `<path d="${dir > 0 ? 'M0 0H78L88 9L78 18H0Z' : 'M10 0H88V18H10L0 9Z'}" fill="#8E5F3A" stroke="#5A3A22" stroke-width="1.4"/>` + serif(dir > 0 ? 8 : 16, 13.5, t, 12.5, CREMA), k);
    };
    tabla(1.7, 'Transparencia', 1, 26.0); tabla(1.46, 'Cercanía', -1, 26.01); tabla(1.22, 'Innovación', 1, 26.02); tabla(0.98, 'Confianza', -1, 26.03);
    L.piso(15.3, 12.9, `<rect width="150" height="90" rx="8" fill="${TINTA}"/><rect x="8" y="8" width="134" height="74" rx="5" fill="none" stroke="${ORO}" stroke-width="2.4"/>` + serif(75, 54, 'FUNDOS', 24, ORO2, ' letter-spacing="2" text-anchor="middle"'), -52);
    pj('fdRecepcion', 17.9, 10.95, 0, 'i');
    L.caja(16.7, 11.4, 0, 2.6, 0.6, 1.02, VERDE, 16.7 + 1.3 + 11.7 + 0.5);
    L.caja(16.62, 11.34, 1.02, 2.76, 0.72, 0.06, RAULI, 16.7 + 1.3 + 11.7 + 0.52);
    L.planoY(16.95, 12.004, 0.94, 210, 72, `<image href="§M§logo-fundos.webp" x="72" y="2" width="68" height="50"/>` + serif(105, 66, 'Fundos Inmobiliaria', 11, ORO2, ' text-anchor="middle" letter-spacing=".5"'), 16.7 + 1.3 + 11.7 + 0.51);
    L.cil(19.05, 11.62, 1.08, 0.1, 0.16, CREMA, '#CFC7B6', 31.5); L.luz(19.05, 11.62, 1.24, 6, 3, '#3E6B4A', 31.51);
    plantaAlta(L, 19.55, 10.4, 1.05);
    lugar('recepcion', 18.0, 11.7, 1.6);
    lugar('valores', 13.5, 12.1, 1.9);
    camina('fdGuia2', [[16.8, 6.4, 2.5], [16.9, 9.6, 2], [16.8, 6.4]], { vel: 0.45 });

    // ── El rincón de BiPlot: chico, junto a la firma ──
    L.caja(8.05, 12.55, 0, 1.15, 0.72, 1.02, { t: '#0E2A47', l: '#0B1F36', r: '#081628' }, 8.6 + 12.9 + 0.5);
    L.caja(8.05, 12.55, 1.02, 1.15, 0.72, 0.04, { t: '#17C3B2', l: '#0A8A7E', r: '#087066' }, 8.6 + 12.9 + 0.52);
    L.planoY(8.15, 13.274, 0.9, 95, 60, `<rect x="4" y="6" width="22" height="22" rx="5" fill="#0E2A47" stroke="#17C3B2" stroke-width="1.6"/><path d="M9 11V23H22" stroke="#3F6DA0" stroke-width="1.4" fill="none"/><circle cx="11" cy="20" r="1.8" fill="#17C3B2"/><circle cx="15" cy="17" r="1.8" fill="#17C3B2"/><circle cx="20.5" cy="12.5" r="2.2" fill="#FF6B4A"/>` +
      txt(32, 17, 'Hecho con', 9, '#A9B7C6') + txt(32, 28, 'BiPlot', 11, '#FFFFFF') + `<rect x="4" y="38" width="86" height="3" rx="1.5" fill="#17C3B2"/>`, 8.6 + 13.3 + 0.53);
    L.caja(8.62, 12.88, 1.06, 0.06, 0.05, 0.08, { t: TINTA, l: TINTA, r: '#000' }, 8.6 + 12.9 + 0.6);
    L.caja(8.26, 12.9, 1.13, 0.78, 0.05, 0.47, { t: TINTA, l: TINTA, r: '#000' }, 8.6 + 12.9 + 0.62);
    L.planoY(8.28, 12.952, 1.58, 74, 43, `<rect width="74" height="43" rx="2" fill="#0B1726"/><image href="§X§assets/casos/fundos-360-h.jpg" x="2.5" y="2.5" width="69" height="38" preserveAspectRatio="xMidYMid slice"/><circle cx="37" cy="21.5" r="8" fill="rgba(11,23,38,.7)"/><path d="M34.4 17.3V25.7L41.2 21.5Z" fill="#FFFFFF"/>`, 8.6 + 12.95 + 0.63);
    pj('celda', 9.7, 12.95, 0, 'i');
    lugar('biplot', 8.6, 12.9, 1.5);

    return { id: 'fundos', ancho: W, fondo: D };
  });
}
// El segundo guía (el que camina entre la recepción y la maqueta) es otro integrante del equipo con la misma polera
VISITANTES.fdGuia2 = () => persona({ ...FD.fdGuia, peinado: 'largo', cuerpo: 'fino', pelo: PELO.castano, barba: undefined, piernas: 'camina', objeto: 'carpeta', brazoD: 'abajo', brazoI: 'sostiene', objetoI: 'carpeta' });
registrarMedida('fdGuia2', medida('fdGuia2', VISITANTES.fdGuia2()));
