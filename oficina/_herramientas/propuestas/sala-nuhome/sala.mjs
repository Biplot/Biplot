// Propuesta: la sala de Nu Home como su propio showroom dentro del barrio de BiPlot HQ.
// Mismo motor y misma proyección de las salas grandes (salas-grandes.mjs); se dibuja aquí mientras es propuesta.
const R = new URL('../../dibujos', import.meta.url).href;
const { escena, P, registrarMedida, PASO } = await import(R + '/barrio/maqueta.mjs');
const S = await import(R + '/barrio/locales.mjs');
const { VISITANTES, persona, PIEL, medida } = await import(R + '/barrio/visitantes.mjs');
const { caminante, EA, SALAS_GRANDES } = await import(R + '/barrio/salas-grandes.mjs'); // registra la gente de las salas
const { VECTOR } = await import(R + '/cabezones/todos.mjs');
const { DEFS_ENTORNO } = await import(R + '/barrio/entorno.mjs');

const r1 = (n) => Math.round(n * 10) / 10;
const SERIF = `font-family="'Cormorant Garamond','DejaVu Serif',serif"`;
const FUENTE = `font-family="'Space Grotesk','DejaVu Sans',sans-serif"`;
const MONO = `font-family="'Space Mono','DejaVu Sans Mono',monospace"`;
const serif = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${SERIF} font-weight="600" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const txt = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${FUENTE} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const mono = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${MONO} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;

// ───────── La paleta de Nu Home: crema, negro, madera y un dorado sobrio ─────────
const NEGRO = { t: '#2B2724', l: '#1C1917', r: '#141110' };
const CARBON = { t: '#3A3530', l: '#2B2724', r: '#1F1B18' };
const ROBLE = { t: '#D6B68C', l: '#BD9A6C', r: '#A27F55' };
const NOGAL = { t: '#9C7550', l: '#7E5C3C', r: '#654830' };
const CREMA = { t: '#F4ECD8', l: '#E4D8BE', r: '#CFC1A3' };
const ACERO = { t: '#B9BEC4', l: '#8F959C', r: '#71777E' };
const ORO = '#C9A227', ORO2 = '#E0B341', TINTA = '#1C1917';

// ───────── La gente de Nu Home: su equipo de asesoría, con chaqueta negra, camisa crema y botón dorado ─────────
const PELO = { negro: ['#1A1613', '#0B0908', '#3A322C'], cafe: ['#4A3222', '#2E1F15', '#7A5334'], castano: ['#6E4A30', '#4A3222', '#8B6A4E'], rubio: ['#D9A441', '#B8862A', '#F4DDA8'], canoso: ['#B9C0C8', '#8E949C', '#E4E7EB'] };
const Z = { negras: ['#1F2733', '#0B1726', null], cafe: ['#6E4A30', '#4A3222', null], blancas: ['#F2F4F7', '#B9C8D8', '#17C3B2'] };
const PANT = ['#1F2733', '#141A23'], JEAN = ['#35679A', '#27507C'];
const UNIFORME = ['#1C1917', '#0F0D0C', ['#F4ECD8', ORO]];
const NH = {
  nhRecepcion: { piel: PIEL.media, pelo: PELO.castano, peinado: 'melena', cuerpo: 'fino', arriba: 'blazer', arribaCol: UNIFORME, abajo: 'pantalon', abajoCol: PANT, zapatos: Z.negras, brazoD: 'saluda', ojos: 'grandes', aros: ORO2, boca: 'dientes' },
  nhAsesor: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'corto', arriba: 'blazer', arribaCol: UNIFORME, abajo: 'pantalon', abajoCol: PANT, zapatos: Z.negras, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', lentes: 'rectos', barba: '#1A1613' },
  nhAsesora: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'mono', cuerpo: 'fino', arriba: 'blazer', arribaCol: UNIFORME, abajo: 'pantalon', abajoCol: PANT, zapatos: Z.negras, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'grandes', aros: ORO2 },
  nhMaqueta: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'cola', cuerpo: 'fino', arriba: 'blazer', arribaCol: UNIFORME, abajo: 'pantalon', abajoCol: PANT, zapatos: Z.negras, brazoD: 'senala', brazoI: 'sostiene', objetoI: 'carpeta', ojos: 'grandes' },
  nhGuia: { piel: PIEL.trigo, pelo: PELO.cafe, peinado: 'peinado', arriba: 'blazer', arribaCol: UNIFORME, abajo: 'pantalon', abajoCol: PANT, zapatos: Z.negras, brazoD: 'sostiene', objeto: 'tablet', piernas: 'camina' },
  nhEntrega: { piel: PIEL.media, pelo: PELO.castano, peinado: 'largo', cuerpo: 'fino', arriba: 'blazer', arribaCol: UNIFORME, abajo: 'pantalon', abajoCol: PANT, zapatos: Z.negras, brazoD: 'saluda', brazoI: 'sostiene', objetoI: 'carpeta', ojos: 'felices', boca: 'dientes' },
  // Quienes visitan
  nhAbuela: { piel: PIEL.rosada, pelo: PELO.canoso, peinado: 'rizado', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#C9824E', '#A8683A', ['#F2F4F7']], abajo: 'pantalon', abajoCol: ['#3A4A5A', '#2A3848'], zapatos: Z.cafe, brazoD: 'senala', brazoI: 'abajo', objetoI: 'bolso', bolsoCol: '#6E4A30', lentes: 'redondos', rubor: '#E9967A' },
  nhAbuelo: { piel: PIEL.clara, pelo: PELO.canoso, peinado: 'calvo', arriba: 'chaqueta', arribaCol: ['#4A5A4A', '#3A483A', ['#E8DFC8', null]], abajo: 'pantalon', abajoCol: ['#8B8272', '#6E6658'], zapatos: Z.cafe, brazoD: 'cadera', bigote: '#DADDE2', boca: 'media' },
  nhSentada: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'melena', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#8E6BB8', '#6E4E96'], manga: 'larga', abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'grandes', rubor: '#E9967A' }
};
for (const [id, o] of Object.entries(NH)) {
  VISITANTES[id] = () => persona(o);
  registrarMedida(id, o.piernas === 'sentado' ? { cx: 15.6, pie: 38.6, sentado: true, alto: 50, ancho: 30 } : medida(id, persona(o)));
}

// ───────── Piezas ─────────
const W = 20, D = 14, HM = 2.6;
function base(E, L) {
  E.losa(-0.12, -0.12, W + 0.12, D + 0.12, 0, '#D9C29E', -1000);
  // Piso de tablas de roble, con las uniones corridas
  let t = '';
  for (let v = 25; v < D * 100; v += 25) t += `<path d="M0 ${v}H${W * 100}" stroke="#C7AC84" stroke-width="1.6"/>`;
  for (let v = 0, i = 0; v < D * 100; v += 25, i++) for (let u = (i % 3) * 70 + 40; u < W * 100; u += 210) t += `<path d="M${u} ${v}V${v + 25}" stroke="#C7AC84" stroke-width="1.4"/>`;
  L.piso(0, 0, t, -56);
  const s = 0.5, c = { muroY: '#EFE6D3', muroX: '#E0D4BC', zocalo: '#1C1917', tope: '#CDBF9F', canto: '#B8A987' };
  for (let x = 0; x < W - 0.001; x += s) {
    const b = Math.min(W, x + s);
    L.add(-50 + b * 0.01, L.poly([[x, 0, 0], [b, 0, 0], [b, 0, HM], [x, 0, HM]], `fill="${c.muroY}"`) +
      L.poly([[x, 0, 0], [b, 0, 0], [b, 0, 0.1], [x, 0, 0.1]], `fill="${c.zocalo}"`) +
      L.poly([[x, 0, HM], [b, 0, HM], [b, -0.14, HM], [x, -0.14, HM]], `fill="${c.tope}"`));
  }
  for (let y = 0; y < D - 0.001; y += s) {
    const b = Math.min(D, y + s);
    L.add(-50 + b * 0.01, L.poly([[0, y, 0], [0, b, 0], [0, b, HM], [0, y, HM]], `fill="${c.muroX}"`) +
      L.poly([[0, y, 0], [0, b, 0], [0, b, 0.1], [0, y, 0.1]], `fill="${c.zocalo}"`) +
      L.poly([[0, y, HM], [0, b, HM], [-0.14, b, HM], [-0.14, y, HM]], `fill="${c.tope}"`));
  }
  L.add(-49, L.poly([[W, 0, 0], [W, 0, HM], [W, -0.14, HM], [W, -0.14, 0]], `fill="${c.canto}"`) + L.poly([[0, D, 0], [0, D, HM], [-0.14, D, HM], [-0.14, D, 0]], `fill="${c.canto}"`));
}
// Contenido 2D en un plano x = const (la cara +x de un mueble); u va desde y0 hacia el fondo
function planoXen(L, x, y0, zTop, ancho, alto, svg, k) {
  const [px, py] = L.P(x, y0, zTop); L.E.marca(x, y0, zTop); L.E.marca(x, y0 - ancho / 100, zTop - alto / 100);
  return L.add(k, `<g transform="matrix(0.32,-0.16,0,0.39,${r1(px)},${r1(py)})">${svg}</g>`);
}
function pantallaX(L, y0, zTop, w, h, img, o = {}) {
  const Wp = w * 100, Hp = h * 100, b = o.borde ?? 5;
  L.planoX(y0, zTop, Wp, Hp, `<rect width="${Wp}" height="${Hp}" rx="5" fill="${o.marco || TINTA}"/>` +
    `<image href="${img}" x="${b}" y="${b}" width="${Wp - b * 2}" height="${Hp - b * 2}" preserveAspectRatio="${o.ajuste || 'xMidYMid slice'}"/>` +
    `<rect x="${b}" y="${b}" width="${Wp - b * 2}" height="${Hp - b * 2}" fill="url(#brillo-pantalla)"/>`, o.k);
}
function pantallaY(L, x0, zTop, w, h, img, o = {}) {
  const Wp = w * 100, Hp = h * 100, b = o.borde ?? 5;
  L.planoY(x0, o.y ?? 0.03, zTop, Wp, Hp, `<rect width="${Wp}" height="${Hp}" rx="5" fill="${o.marco || TINTA}"/>` +
    `<image href="${img}" x="${b}" y="${b}" width="${Wp - b * 2}" height="${Hp - b * 2}" preserveAspectRatio="${o.ajuste || 'xMidYMid slice'}"/>` +
    `<rect x="${b}" y="${b}" width="${Wp - b * 2}" height="${Hp - b * 2}" fill="url(#brillo-pantalla)"/>`, o.k);
}
// Vidrio en tramos (para que el orden por profundidad no falle), con sus perfiles negros
function vidrioY(L, y, x0, x1, h, dk = 0) {
  for (let x = x0; x < x1 - 0.001; x += 0.5) {
    const b = Math.min(x1, x + 0.5);
    L.add((x + b) / 2 + y + dk, L.poly([[x, y, 0], [b, y, 0], [b, y, h], [x, y, h]], `fill="rgba(214,236,240,.20)" stroke="rgba(255,255,255,.35)" stroke-width=".6"`) +
      L.poly([[x, y, h - 0.06], [b, y, h - 0.06], [b, y, h], [x, y, h]], `fill="${TINTA}"`) + L.poly([[x, y, 0], [b, y, 0], [b, y, 0.08], [x, y, 0.08]], `fill="${TINTA}"`) +
      (Math.abs(b - Math.round(b)) < 0.01 ? L.poly([[b - 0.03, y, 0], [b + 0.03, y, 0], [b + 0.03, y, h], [b - 0.03, y, h]], `fill="${TINTA}"`) : ''));
  }
}
function vidrioX(L, x, y0, y1, h, dk = 0) {
  for (let y = y0; y < y1 - 0.001; y += 0.5) {
    const b = Math.min(y1, y + 0.5);
    L.add(x + (y + b) / 2 + dk, L.poly([[x, y, 0], [x, b, 0], [x, b, h], [x, y, h]], `fill="rgba(214,236,240,.16)" stroke="rgba(255,255,255,.3)" stroke-width=".6"`) +
      L.poly([[x, y, h - 0.06], [x, b, h - 0.06], [x, b, h], [x, y, h]], `fill="${TINTA}"`) + L.poly([[x, y, 0], [x, b, 0], [x, b, 0.08], [x, y, 0.08]], `fill="${TINTA}"`) +
      (Math.abs(b - Math.round(b)) < 0.01 ? L.poly([[x, b - 0.03, 0], [x, b + 0.03, 0], [x, b + 0.03, h], [x, b - 0.03, h]], `fill="${TINTA}"`) : ''));
  }
}
// Silla de escritorio (se dibuja antes que quien se sienta)
function silla(L, x, y, col = NEGRO) {
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
// Casa en miniatura (las maquetas de los modelos): un módulo negro con su franja de madera y ventanas
function casita(L, x, y, z, w, d, h, o = {}) {
  L.caja(x, y, z, w, d, h, NEGRO, o.k);
  const kk = (o.k ?? x + w / 2 + y + d / 2 + z * 0.5) + 0.01;
  L.add(kk, L.poly([[x + w * 0.72, y + d + 0.002, z], [x + w, y + d + 0.002, z], [x + w, y + d + 0.002, z + h], [x + w * 0.72, y + d + 0.002, z + h]], `fill="#B98B5E"`) +
    L.poly([[x + w * 0.12, y + d + 0.003, z + h * 0.3], [x + w * 0.55, y + d + 0.003, z + h * 0.3], [x + w * 0.55, y + d + 0.003, z + h * 0.78], [x + w * 0.12, y + d + 0.003, z + h * 0.78]], `fill="#F2C14E" opacity=".85"`) +
    L.poly([[x + w + 0.002, y + d * 0.25, z + h * 0.3], [x + w + 0.002, y + d * 0.7, z + h * 0.3], [x + w + 0.002, y + d * 0.7, z + h * 0.78], [x + w + 0.002, y + d * 0.25, z + h * 0.78]], `fill="rgba(214,236,240,.7)"`));
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
  return { vb: r.vb, ancho: r.ancho, alto: r.alto, capas, arriba, caminan, usados: [...usados], lugares, ...info };
}

export function salaNuhome() {
  return montar(({ E, L, pj, camina, lugar }) => {
    base(E, L);

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
    pantallaY(L, 4.55, 2.4, 2.5, 1.25, '§M§recorte-nuhome-5-fabricacion.webp', { k: -39 });
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
    lugar('taller', 3.3, 2.4, 1.2);

    // ── El muro de la marca y el ventanal hacia el paisaje ──
    L.planoY(7.85, 0.025, 2.35, 330, 185, `<rect width="330" height="185" rx="3" fill="${TINTA}"/><image href="§M§logo-nuhome.webp" x="95" y="22" width="140" height="99"/>` +
      `<rect x="120" y="140" width="90" height="2.5" fill="${ORO}"/>`, -39);
    L.caja(7.9, 0.1, 0, 3.2, 0.5, 0.42, NOGAL, 7.9 + 1.6 + 0.35);
    const ventanal = () => {
      const w = 840, h = 215;
      let s = `<defs><linearGradient id="nh-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE0E8"/><stop offset=".75" stop-color="#F6E9CF"/></linearGradient></defs>`;
      s += `<rect width="${w}" height="${h}" fill="url(#nh-cielo)"/>`;
      // La cordillera con nieve
      s += `<path d="M0 118L70 70L118 96L190 44L250 88L320 58L392 100L470 52L540 90L610 60L690 96L760 66L840 94V${h}H0Z" fill="#9AAEBD"/>`;
      s += `<path d="M190 44L172 60L186 58L198 66L210 56ZM470 52L452 68L468 64L482 72L492 62ZM320 58L306 70L320 68L332 74ZM760 66L746 78L760 76L772 82Z" fill="#F7F8FA"/>`;
      s += `<path d="M0 150Q120 118 250 140T520 132T840 138V${h}H0Z" fill="#7F9A73"/>`;
      s += `<path d="M0 176Q160 156 330 170T660 164T840 170V${h}H0Z" fill="#6A8A5E"/>`;
      // Bosque
      const pino = (x, y, a) => `<path d="M${x} ${y - a}L${x - a * 0.36} ${y}H${x + a * 0.36}Z" fill="#2F5A3E"/><path d="M${x} ${y - a * 0.72}L${x - a * 0.3} ${y - a * 0.12}H${x + a * 0.3}Z" fill="#3B6B4A"/>`;
      for (let i = 0; i < 34; i++) { const x = i * 25 + (i % 3) * 6, a = 30 + ((i * 37) % 23); if (x > 540 && x < 700) continue; s += pino(x, 196 + (i % 2) * 6, a); }
      // Una casa Nu Home en la pradera, con su terraza y la luz encendida
      s += `<rect x="560" y="150" width="120" height="34" fill="#2B2724"/><rect x="560" y="146" width="124" height="6" fill="${TINTA}"/><rect x="650" y="152" width="30" height="32" fill="#B98B5E"/>` +
        `<rect x="574" y="158" width="52" height="20" fill="#F2C14E"/><rect x="598" y="158" width="2" height="20" fill="${TINTA}"/><rect x="548" y="184" width="150" height="5" fill="#8B6A4E"/>`;
      s += `<path d="M0 ${h}V200Q300 190 840 200V${h}Z" fill="#587A4E"/>`;
      // Reflejos y perfiles
      s += `<path d="M60 0L10 ${h}H40L90 0ZM330 0L280 ${h}H296L346 0ZM620 0L570 ${h}H600L650 0Z" fill="#FFFFFF" opacity=".16"/>`;
      s += [0, 210, 420, 630, 834].map(u => `<rect x="${u}" width="6" height="${h}" fill="${TINTA}"/>`).join('') + `<rect width="${w}" height="6" fill="${TINTA}"/><rect y="${h - 6}" width="${w}" height="6" fill="${TINTA}"/>`;
      return s;
    };
    L.planoY(11.5, 0.025, 2.45, 840, 215, ventanal(), -39);
    lugar('ventanal', 15.9, 0.1, 1.5);

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
    // La entrega: la mesa, las llaves y la familia que recibe su casa
    L.cil(17.9, 2.3, 0, 0.06, 0.72, '#2B2724', '#1C1917');
    L.cil(17.9, 2.3, 0.72, 0.6, 0.05, '#D6B68C', '#A27F55');
    L.cil(17.65, 2.18, 0.77, 0.07, 0.25, '#F4ECD8', '#CFC1A3', 20.4); L.luz(17.65, 2.18, 1.04, 9, 7, '#E8A0B4', 20.41); L.luz(17.6, 2.14, 1.08, 5, 4, '#F2F4F7', 20.42);
    L.caja(18.05, 2.35, 0.77, 0.34, 0.24, 0.02, { t: '#F4ECD8', l: '#E4D8BE', r: '#CFC1A3' }, 20.43);
    pj('nhEntrega', 18.9, 1.55, 0, 'i');
    pj('papa', 17.1, 3.25, 0, 'd');
    pj('mama', 18.3, 3.55, 0, 'i');
    lugar('entrega', 17.9, 2.4, 1.9);

    // ── Terminaciones: el muro de muestras y su cajonera ──
    L.planoX(6.95, 2.25, 205, 175, `<rect width="205" height="175" rx="4" fill="#F7F1E4" stroke="#CDBF9F" stroke-width="3"/>` + serif(14, 34, 'Terminaciones', 28, TINTA) + `<rect x="15" y="42" width="60" height="3" fill="${ORO}"/>` +
      [['#2B2724', 14, 58], ['#B98B5E', 62, 58], ['#8B6A4E', 110, 58], ['#E9EEF2', 158, 58], ['#6E757C', 14, 112], ['#D6B68C', 62, 112], ['#9AAEBD', 110, 112], ['#F4ECD8', 158, 112]]
        .map(([c, x, y]) => `<rect x="${x}" y="${y}" width="40" height="46" rx="2" fill="${c}" stroke="${TINTA}" stroke-width="1.6"/>`).join('') +
      `<path d="M62 58l40 46M72 58l30 34M62 70l28 34" stroke="#9C7550" stroke-width="2"/>`, -38);
    L.caja(0.08, 4.95, 0, 0.55, 1.95, 0.88, NOGAL, 0.35 + 5.9);
    for (const [y, c] of [[5.15, '#2B2724'], [5.55, '#B98B5E'], [5.95, '#E9EEF2'], [6.4, '#6E757C']]) L.caja(0.18, y, 0.88, 0.32, 0.26, 0.05, { t: c, l: c, r: c }, 0.35 + y + 0.6);
    pj('nhAbuela', 1.15, 5.75, 0, 'i');
    pj('nhAbuelo', 1.35, 6.75, 0, 'i');
    lugar('terminaciones', 0.1, 5.9, 1.6);
    // La ingeniera, entre el taller y la asesoría
    pj('ingeniera', 7.95, 5.55, 0, 'i');

    // ── Asesoría: la pantalla grande del diseñador, los escritorios y la mesa de maqueta ──
    L.planoX(13.2, 2.35, 190, 44, serif(4, 32, 'Asesoría', 34, TINTA) + `<rect x="6" y="40" width="54" height="3" fill="${ORO}"/>`, -38);
    pantallaX(L, 10.6, 2.35, 3.1, 1.74, '§M§recorte-nuhome-1-disenador.webp', { k: -38 });
    lugar('disenador', 0.05, 9.05, 1.5);
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
    lugar('asesoria', 5.5, 10.1, 1.8);
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
    lugar('maqueta', 3.7, 12.1, 1.0);

    // ── La casa piloto: un módulo de verdad, con su terraza y su pérgola ──
    const HX = 10.2, HY = 5.6, HW = 6.0, HD = 2.5, HZ = 0.22, HH = 2.12;
    L.caja(HX + 0.1, HY + 0.1, 0, HW - 0.2, HD - 0.2, HZ, { t: '#9A9C9E', l: '#86888A', r: '#6E7072' }, HX + HW / 2 + HY + HD / 2 - 0.2);
    L.caja(HX, HY, HZ, HW, HD, HH, { t: '#2B2724', l: '#23201D', r: '#191614' }, HX + HW / 2 + HY + HD / 2 + 0.3);
    const kH = HX + HW / 2 + HY + HD / 2 + 0.31;
    // Fachada del lado de la terraza: forro negro vertical, el ventanal corredera con el living adentro y la franja de madera
    const living = () => {
      let s = `<rect x="180" y="18" width="290" height="194" fill="#EFE2C8"/><rect x="180" y="168" width="290" height="44" fill="#C9A27A"/>` +
        `<rect x="236" y="44" width="70" height="52" fill="#9AAEBD" stroke="#B98B5E" stroke-width="4"/><path d="M240 92L262 66L280 80L302 58V92Z" fill="#6A8A5E"/>` +
        `<rect x="330" y="118" width="120" height="44" rx="8" fill="#6E757C"/><rect x="330" y="106" width="120" height="22" rx="8" fill="#5E656C"/><rect x="340" y="116" width="30" height="16" rx="4" fill="${ORO2}"/>` +
        `<path d="M395 18V58" stroke="${TINTA}" stroke-width="2"/><path d="M380 58H410L402 70H388Z" fill="${ORO2}"/><ellipse cx="395" cy="74" rx="26" ry="8" fill="#F2C14E" opacity=".35"/>` +
        `<rect x="200" y="132" width="26" height="36" fill="#2B2724"/><circle cx="213" cy="120" r="16" fill="#3E7A4E"/><circle cx="222" cy="108" r="12" fill="#4E8A55"/>` +
        `<path d="M186 18L236 212H262L212 18ZM380 18L430 212H444L394 18Z" fill="#FFFFFF" opacity=".22"/>`;
      s += [180, 276, 372, 466].map(u => `<rect x="${u}" y="18" width="5" height="194" fill="${TINTA}"/>`).join('') + `<rect x="180" y="16" width="291" height="5" fill="${TINTA}"/>`;
      return s;
    };
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
    lugar('piloto', 13.2, 6.85, 2.6);
    // Quienes miran la casa: un asesor con una pareja, y el niño que corre por la terraza
    pj('ejecutivo', 15.6, 9.05, 0, 'i');
    pj('senora', 13.75, 11.55, 0, 'd');
    pj('senor', 14.7, 11.8, 0, 'd');
    camina('nino', [[12.2, 9.6, 1.5], [13.9, 9.9, 1], [14.2, 8.7, 1.5], [12.4, 8.8], [12.2, 9.6]], { e: EA * 0.72, vel: 0.7 });
    // El letrero de la casa
    L.caja(15.55, 10.95, 0, 0.5, 0.1, 1.35, NEGRO, 15.8 + 11.0 + 0.6);
    L.planoY(15.57, 11.056, 1.32, 46, 60, serif(4, 22, 'Casa', 20, '#F4ECD8') + serif(4, 42, 'piloto', 20, '#F4ECD8', ' font-style="italic"') + `<rect x="5" y="50" width="22" height="2" fill="${ORO}"/>`, 15.8 + 11.06 + 0.61);

    // ── Los modelos, en maqueta, junto a la entrada ──
    const pedestal = (x, y, k) => { L.caja(x, y, 0, 0.9, 0.9, 0.86, CREMA, k); };
    pedestal(11.5, 12.55, 24.5); casita(L, 11.62, 12.8, 0.86, 0.66, 0.36, 0.27, { k: 24.7 });
    pedestal(12.75, 12.55, 25.7); casita(L, 12.87, 12.8, 0.86, 0.66, 0.36, 0.27, { k: 25.9 }); casita(L, 13.05, 12.82, 1.13, 0.36, 0.32, 0.22, { k: 26.1 });
    pedestal(14.0, 12.55, 26.9); casita(L, 14.1, 12.62, 0.86, 0.52, 0.34, 0.27, { k: 27.1 }); L.caja(14.1, 12.97, 0.86, 0.52, 0.34, 0.03, NOGAL, 27.2);
    for (const [x, t] of [[11.5, 'Un módulo'], [12.75, 'Dos pisos'], [14.0, 'Con terraza']]) L.planoY(x + 0.08, 13.452, 0.62, 74, 18, `<rect width="74" height="18" rx="2" fill="${TINTA}"/>` + serif(6, 13, t, 12, '#F4ECD8'), x + 13.5 + 0.9);
    lugar('modelos', 12.9, 12.95, 1.3);

    // ── La entrada: el felpudo, el mesón de recepción y quien te recibe ──
    L.piso(15.3, 12.9, `<rect width="150" height="90" rx="8" fill="${TINTA}"/><rect x="8" y="8" width="134" height="74" rx="5" fill="none" stroke="${ORO}" stroke-width="2.4"/>` + serif(75, 54, 'NÜHOME', 23, '#F4ECD8', ' letter-spacing="1.5" text-anchor="middle"'), -52);
    pj('nhRecepcion', 17.9, 10.95, 0, 'i');
    L.caja(16.7, 11.4, 0, 2.6, 0.6, 1.02, NEGRO, 16.7 + 1.3 + 11.7 + 0.5);
    L.caja(16.62, 11.34, 1.02, 2.76, 0.72, 0.06, ROBLE, 16.7 + 1.3 + 11.7 + 0.52);
    L.planoY(16.95, 12.004, 0.86, 210, 60, `<image href="§M§logo-nuhome.webp" x="72" y="2" width="66" height="47" opacity=".95"/>`, 16.7 + 1.3 + 11.7 + 0.51);
    L.cil(19.05, 11.62, 1.08, 0.1, 0.16, '#F4ECD8', '#CFC1A3', 31.5); L.luz(19.05, 11.62, 1.24, 6, 3, '#3E7A4E', 31.51);
    plantaAlta(L, 19.55, 10.4, 1.05);
    lugar('recepcion', 18.0, 11.7, 1.6);
    // Una asesora que acompaña a recorrer
    camina('nhGuia', [[16.95, 6.2, 2.5], [16.8, 9.7, 2], [16.95, 6.2]], { vel: 0.45 });

    // ── El rincón de BiPlot: chico, junto a la asesoría ──
    L.caja(8.05, 12.55, 0, 1.15, 0.72, 1.02, { t: '#0E2A47', l: '#0B1F36', r: '#081628' }, 8.6 + 12.9 + 0.5);
    L.caja(8.05, 12.55, 1.02, 1.15, 0.72, 0.04, { t: '#17C3B2', l: '#0A8A7E', r: '#087066' }, 8.6 + 12.9 + 0.52);
    L.planoY(8.15, 13.274, 0.9, 95, 60, `<rect x="4" y="6" width="22" height="22" rx="5" fill="#0E2A47" stroke="#17C3B2" stroke-width="1.6"/><path d="M9 11V23H22" stroke="#3F6DA0" stroke-width="1.4" fill="none"/><circle cx="11" cy="20" r="1.8" fill="#17C3B2"/><circle cx="15" cy="17" r="1.8" fill="#17C3B2"/><circle cx="20.5" cy="12.5" r="2.2" fill="#FF6B4A"/>` +
      txt(32, 17, 'Hecho con', 9, '#A9B7C6') + txt(32, 28, 'BiPlot', 11, '#FFFFFF') + `<rect x="4" y="38" width="86" height="3" rx="1.5" fill="#17C3B2"/>`, 8.6 + 13.3 + 0.53);
    L.caja(8.62, 12.88, 1.06, 0.06, 0.05, 0.08, { t: TINTA, l: TINTA, r: '#000' }, 8.6 + 12.9 + 0.6);
    L.caja(8.26, 12.9, 1.13, 0.78, 0.05, 0.47, { t: TINTA, l: TINTA, r: '#000' }, 8.6 + 12.9 + 0.62);
    L.planoY(8.28, 12.952, 1.58, 74, 43, `<rect width="74" height="43" rx="2" fill="${TINTA}"/><image href="§X§oficina/media/nuhome-360-h.jpg" x="2.5" y="2.5" width="69" height="38" preserveAspectRatio="xMidYMid slice"/><circle cx="37" cy="21.5" r="8" fill="rgba(11,23,38,.7)"/><path d="M34.4 17.3V25.7L41.2 21.5Z" fill="#FFFFFF"/>`, 8.6 + 12.95 + 0.63);
    pj('bucle', 9.7, 12.95, 0, 'i');
    lugar('biplot', 8.6, 12.9, 1.5);

    return { id: 'nuhome', ancho: W, fondo: D };
  });
}

// ───────── Componer: el dibujo con sus personajes definidos y quienes caminan en su primera parada ─────────
const redondear = (svg) => svg.replace(/-?\d+\.\d{2,}/g, (m) => String(Math.round(parseFloat(m) * 10) / 10));
function defsDe(ids) {
  return [...ids].sort().map((id) => {
    const f = VECTOR[id] || VISITANTES[id];
    if (!f) throw new Error('Personaje sin dibujo: ' + id);
    const p = f().svg({ partes: true });
    return `<g id="v-${id}"><g id="v-${id}-s">${redondear(p.sil)}</g><use href="#v-${id}-s" transform="translate(.28 .36)"/>${redondear(p.color)}</g>`;
  }).join('');
}
const DEFS_SALA = `<linearGradient id="brillo-pantalla" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>` +
  `<linearGradient id="luz-cocina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0B341" stop-opacity="0"/><stop offset="1" stop-color="#E0B341" stop-opacity=".35"/></linearGradient>`;
export function componer(r, medios) {
  const capas = r.capas.slice();
  for (const c of r.caminan) {
    const [x, y] = c.ruta[0], [px, py] = P(x, y, 0), i = Math.max(0, Math.floor((x + y + 0.2) / PASO));
    while (capas.length <= i) capas.push('');
    capas[i] += `<g transform="translate(${r1(px)} ${r1(py)})">${c.svg}</g>`;
  }
  const cuerpo = (capas.join('') + r.arriba).replaceAll('§M§', medios + 'oficina/media/salas/').replaceAll('§X§', medios);
  return { defs: DEFS_SALA + DEFS_ENTORNO + defsDe(r.usados), cuerpo };
}
export { SALAS_GRANDES, P };
