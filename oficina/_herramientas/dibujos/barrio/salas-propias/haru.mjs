// La sala de Haru Isidora en la oficina: su propio restaurante, sin números. Sushi de autor en Arica: la barra con sus
// itamaes, la cocina a la vista, el bar, el salón con faroles, la terraza y el retiro, con la carta real (haru-carta) y
// Haru 360 (en implementación) en el kiosco de BiPlot. Lo que se toca va con zona(); sus textos, en datos.js.
import { montar, base, registrar, planoXen, pantallaY, pantallaX, silla, banqueta, plantaAlta, palmera, kioscoBiPlot, r1, txt, mono, texto, PELO, Z, PIEL, EA } from './comun.mjs';

const MONT = texto(`'Montserrat','DejaVu Sans',sans-serif`, 700);
const MONT8 = texto(`'Montserrat','DejaVu Sans',sans-serif`, 800);
// La paleta de Haru: negro cálido, crema, el rojo del 春, dorado y matcha
const ROJO = '#E0482F', ROJO2 = '#B93620', ORO = '#C9A24E', CREMA = '#F3EDE1', MATCHA = '#7FA35B', TINTA = '#0B0A08';
const NEGRO = { t: '#2A2622', l: '#1C1916', r: '#141110' };
const MADERA = { t: '#9C6B45', l: '#7E5434', r: '#654229' };
const ACERO = { t: '#C4CCD2', l: '#98A2AA', r: '#7A848C' };
const CANA = '#C9A87A';

// ───────── La gente de Haru ─────────
registrar({
  hrItamae: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'corto', arriba: 'chef', arribaCol: ['#F2F4F7', '#C4D2E0', '#1F2733'], abajo: 'pantalon', abajoCol: ['#1F2733', '#141A23'], zapatos: Z.negras, cintillo: ROJO, brazoD: 'frente', brazoI: 'frente', ojos: 'felices' },
  hrItamae2: { piel: PIEL.media, pelo: PELO.negro, peinado: 'mono', cuerpo: 'fino', arriba: 'chef', arribaCol: ['#1F1B18', '#151210', ROJO], abajo: 'pantalon', abajoCol: ['#1F2733', '#141A23'], zapatos: Z.negras, cintillo: '#F2F4F7', brazoD: 'sostiene', objeto: 'plato', ojos: 'grandes' },
  hrAnfitriona: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'largo', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#1F1B18', '#151210'], manga: 'larga', abajo: 'pantalon', abajoCol: ['#1F2733', '#141A23'], zapatos: Z.negras, brazoD: 'saluda', brazoI: 'sostiene', objetoI: 'carpeta', ojos: 'grandes', aros: ORO, boca: 'dientes' },
  hrCliente: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'corto', arriba: 'polera', arribaCol: ['#5E7A8C', '#4A6272'], manga: 'corta', abajo: 'pantalon', abajoCol: ['#35679A', '#27507C'], zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', barba: '#4A3222', ojos: 'felices' },
  hrGuia: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'cola', lazo: '#E0482F', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#1F1B18', '#151210'], manga: 'larga', abajo: 'pantalon', abajoCol: ['#1F2733', '#141A23'], zapatos: Z.negras, brazoD: 'sostiene', objeto: 'carpeta', piernas: 'camina', ojos: 'grandes' },
  hrClienta: { piel: PIEL.media, pelo: PELO.rubio, peinado: 'melena', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#E8DFC8', '#CFC2A3'], manga: 'corta', abajo: 'falda', abajoCol: ['#3A4A5A', '#2A3848'], medias: ['#D39A6A', '#B47A4C'], zapatos: Z.cafe, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'grandes', rubor: '#E9967A' }
});

const W = 20, D = 14, HM = 2.6;
// Farol de papel colgado sobre una mesa, con su luz cálida
function farol(L, x, y, col = [CREMA, '#D9CCB0'], k) {
  k = k ?? x + y + 1.4;
  L.linea([[x, y, HM], [x, y, 2.2]], '#8C8078', 1.1, k);
  const [cx, cy] = L.P(x, y, 1.97);
  L.add(k + 0.01, `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="24" fill="rgba(255,176,96,.16)"/><ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="10.5" ry="12.5" fill="${col[0]}"/>` +
    [-5, 0, 5].map(d => `<path d="M${r1(cx + d * 1.2)} ${r1(cy - 12)}Q${r1(cx + d * 2.2)} ${r1(cy)} ${r1(cx + d * 1.2)} ${r1(cy + 12)}" fill="none" stroke="${col[1]}" stroke-width=".9"/>`).join('') +
    `<rect x="${r1(cx - 5)}" y="${r1(cy - 14.5)}" width="10" height="3" rx="1" fill="${TINTA}"/><rect x="${r1(cx - 5)}" y="${r1(cy + 11.5)}" width="10" height="3" rx="1" fill="${TINTA}"/>`);
  L.luz(x, y, 0.02, 34, 17, 'rgba(242,160,90,.10)', -51);
}
// Mesa cuadrada de madera con su vajilla (rolls en tabla, palillos, soya)
function mesa(L, x, y, lado = 1.0, k) {
  const h = 0.72; k = k ?? x + y + 0.35;
  L.caja(x - 0.06, y - 0.06, 0, 0.12, 0.12, h, NEGRO, k - 0.3);
  L.caja(x - lado / 2, y - lado / 2, h, lado, lado, 0.05, MADERA, k);
  L.caja(x - 0.3, y - 0.12, h + 0.05, 0.42, 0.18, 0.03, { t: '#2B2724', l: '#1C1916', r: '#141110' }, k + 0.01);
  for (let i = 0; i < 4; i++) { const [cx, cy] = L.P(x - 0.24 + i * 0.1, y - 0.03, h + 0.1); L.add(k + 0.02 + i * 0.001, `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="3.4" fill="${i % 2 ? '#F29A6B' : '#F3EDE1'}" stroke="#1C1916" stroke-width=".8"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="1.4" fill="${i % 2 ? '#E0482F' : MATCHA}"/>`); }
  L.cil(x + 0.25, y + 0.2, h + 0.05, 0.035, 0.12, '#3A2E26', '#5A2A22', k + 0.03);
  L.linea([[x + 0.1, y - 0.3, h + 0.06], [x + 0.32, y - 0.24, h + 0.06]], '#3A2E26', 1.2, k + 0.04);
}

export function salaHaru() {
  return montar(({ E, L, pj, camina, lugar, zona }) => {
    // Piso de baldosas de hormigón, como su local, y la terraza de madera
    let piso = '';
    for (let v = 100; v < D * 100; v += 100) piso += `<path d="M0 ${v}H${W * 100}" stroke="#2F2C28" stroke-width="2.2"/>`;
    for (let u = 100; u < W * 100; u += 100) piso += `<path d="M${u} 0V${D * 100}" stroke="#2F2C28" stroke-width="2.2"/>`;
    base(E, L, { W, D, HM, piso: '#3B3834', dibujo: piso, muroY: '#1E1B18', muroX: '#171412', zocalo: TINTA, tope: '#2B2622', canto: TINTA });

    // ── La cocina abierta, con su pase y la pantalla de comandas (Haru 360) ──
    L.piso(0, 0, `<rect width="520" height="340" fill="#4A4743"/>` + Array.from({ length: 13 }, (_, i) => `<path d="M${(i + 1) * 40} 0V340" stroke="#403D39" stroke-width="1.6"/>`).join('') + Array.from({ length: 8 }, (_, i) => `<path d="M0 ${(i + 1) * 40}H520" stroke="#403D39" stroke-width="1.6"/>`).join(''), -54);
    L.planoY(0, 0.02, HM, 520, HM * 100, `<rect width="520" height="${HM * 100}" fill="#6E767E"/>` + Array.from({ length: 26 }, (_, i) => `<rect x="${i * 20 + 2}" y="120" width="16" height="10" fill="#7F878F"/>`).join('') +
      Array.from({ length: 7 }, (_, j) => Array.from({ length: 26 }, (_, i) => `<rect x="${i * 20 + (j % 2) * 10}" y="${140 + j * 16}" width="18" height="14" fill="${(i + j) % 3 ? '#E8E2D6' : '#DCD5C7'}"/>`).join('')).join(''), -45);
    L.caja(0.25, 0.15, 0, 3.4, 0.75, 0.92, ACERO, 2.5);
    L.caja(0.4, 0.12, 1.95, 2.6, 0.7, 0.32, { t: '#5E666E', l: '#4E565E', r: '#3E464E' }, 2.9);
    for (const [x, c] of [[0.8, '#2B2724'], [1.6, '#2B2724'], [2.5, '#3A424E']]) { L.cil(x, 0.5, 0.92, 0.22, 0.26, '#8F969C', c, 2.6 + x * 0.01); }
    L.anim('loc-vapor', () => { for (const x of [0.8, 1.6]) { L.linea([[x - 0.04, 0.5, 1.2], [x - 0.1, 0.5, 1.45], [x - 0.02, 0.5, 1.7]], 'rgba(242,244,247,.7)', 1.6, 2.7 + x * 0.01); L.linea([[x + 0.06, 0.5, 1.2], [x + 0.12, 0.5, 1.4]], 'rgba(242,244,247,.55)', 1.4, 2.71 + x * 0.01); } });
    pantallaY(L, 3.85, 0.03, 2.15, 1.3, 0.8, '§M§recorte-haru-3-comandas.webp', { k: -39 });
    L.planoX(3.2, 2.1, 280, 150, `<rect width="280" height="150" rx="4" fill="#2A2420"/>` + [42, 88, 134].map(y => `<rect x="4" y="${y}" width="272" height="5" fill="#8B6A4E"/>`).join('') +
      [[10, 12, 34, 30, '#F3EDE1', 'ARROZ'], [50, 16, 28, 26, '#E0482F', ''], [84, 10, 40, 32, '#D9B98C', 'NORI'], [130, 14, 30, 28, '#7FA35B', ''], [166, 12, 44, 30, '#F3EDE1', 'PANKO'], [216, 16, 30, 26, '#E0482F', ''],
        [12, 58, 50, 30, '#D9B98C', 'SALMÓN'], [70, 62, 26, 26, '#1F2733', ''], [104, 56, 56, 32, '#F3EDE1', 'PALTA'], [168, 60, 40, 28, '#D9B98C', ''], [216, 58, 52, 30, '#E0482F', 'SOYA'],
        [14, 104, 60, 30, '#D9B98C', 'CAMARÓN'], [84, 108, 36, 26, '#F3EDE1', ''], [128, 102, 70, 32, '#D9B98C', 'Q. CREMA'], [206, 106, 60, 28, '#7FA35B', 'CEBOLLÍN']]
        .map(([x, y, w, h, c, t]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}" stroke="#0B1726" stroke-width="1.2"/>` + (t ? mono(x + 3, y + h / 2 + 3, t, 6.4, '#0B1726') : '')).join(''), -40);
    pj('jefacocina', 1.5, 1.45, 0, 'd');
    pj('chef', 3.4, 2.1, 0, 'i');
    // El pase: mesón con platos listos y el noren rojo sobre él
    for (let x = 0.3; x < 5.0 - 0.001; x += 0.5) L.caja(x, 3.1, 0, Math.min(0.5, 5.0 - x), 0.45, 1.02, NEGRO, x + 0.25 + 3.3);
    for (let x = 0.3; x < 5.0 - 0.001; x += 0.5) L.caja(x - 0.02, 3.06, 1.02, Math.min(0.54, 5.02 - x), 0.53, 0.05, MADERA, x + 0.25 + 3.34);
    for (const [x, c] of [[1.1, '#F29A6B'], [2.3, '#E0482F'], [3.6, '#F3EDE1']]) { L.cil(x, 3.3, 1.07, 0.16, 0.03, '#F3EDE1', '#D9CCB0', 4.6 + x * 0.01); L.luz(x, 3.3, 1.1, 5, 2.5, c, 4.61 + x * 0.01); }
    L.planoY(0.2, 0.03, HM - 0.02, 500, 34, [0, 100, 200, 300, 400].map(u => `<rect x="${u + 2}" width="96" height="34" fill="${ROJO}"/><path d="M${u + 2} 26H${u + 98}" stroke="${ROJO2}" stroke-width="3"/>`).join('') + MONT8(236, 25, '春', 20, CREMA), -38);
    zona('cocina', { formas: [{ piso: [[0.1, 0.1], [5.2, 0.1], [5.2, 3.6], [0.1, 3.6]], alto: 2.45 }], lugar: [2.6, 1.8, 2.75], guia: [3.3, 4.3] });

    // ── La barra de sushi: sus itamaes, la vitrina y los rolls de la casa en la pizarra ──
    L.planoY(5.6, 0.02, HM, 720, HM * 100, `<rect width="720" height="${HM * 100}" fill="#3A2A20"/>` + Array.from({ length: 72 }, (_, i) => `<rect x="${i * 10 + 2}" width="6" height="${HM * 100}" fill="#5A4030"/>`).join(''), -45);
    L.planoY(8.45, 0.03, 2.42, 120, 120, `<rect width="120" height="120" rx="8" fill="${ROJO}"/><image href="§M§logo-haru.webp" x="6" y="6" width="108" height="108"/>`, -39);
    const carta = [['Teo Roll', '9.000'], ['Acevichado Roll', '7.500'], ['Chinchorrero', '8.000'], ['Azapa Roll', '7.500'], ['Payachata', '7.000'], ['Mangojito Roll', '7.000']];
    L.planoY(10.1, 0.03, 2.4, 240, 150, `<rect width="240" height="150" rx="5" fill="#15120F" stroke="#8B6A4E" stroke-width="5"/>` + MONT8(14, 26, 'ROLLS DE LA CASA', 14, ORO, ' letter-spacing="1"') +
      carta.map(([n, p], i) => MONT(14, 50 + i * 17, n, 11, CREMA) + `<path d="M${22 + n.length * 6.6} ${46 + i * 17}H176" stroke="#5E554A" stroke-width="1.2" stroke-dasharray="2 4"/>` + MONT(184, 50 + i * 17, '$' + p, 11, CREMA)).join(''), -39);
    L.caja(5.9, 0.08, 1.35, 2.3, 0.22, 0.04, MADERA, -37);
    for (let i = 0; i < 10; i++) { const x = 6.05 + i * 0.22, alto = 0.22 + (i % 3) * 0.04; L.cil(x, 0.18, 1.39, 0.045, alto, ['#E8DFC8', '#3E7A4E', '#C9A24E', '#F3EDE1'][i % 4], ['#CFC2A3', '#2F6440', '#A8843A', '#D9CCB0'][i % 4], -36 + i * 0.001); }
    L.caja(5.9, 0.55, 0, 6.6, 0.5, 0.92, ACERO, 4.5);
    pj('hrItamae', 7.4, 1.35, 0, 'd');
    pj('hrItamae2', 10.8, 1.35, 0, 'i');
    for (let x = 5.9; x < 12.5 - 0.001; x += 0.5) L.caja(x, 2.0, 0, Math.min(0.5, 12.5 - x), 0.55, 1.02, NEGRO, x + 0.25 + 2.3);
    for (let x = 5.9; x < 12.5 - 0.001; x += 0.5) L.caja(x - 0.02, 1.95, 1.02, Math.min(0.54, 12.52 - x), 0.65, 0.05, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' }, x + 0.25 + 2.34);
    // La vitrina del pescado: vidrio, salmón, atún, pulpo y camarones
    const [gx0, gx1, gy0, gy1, gz0, gz1] = [6.6, 11.8, 2.02, 2.38, 1.07, 1.32], kv = 11.8 + 2.38 + 0.7;
    ['#F29A6B', '#C8474A', '#F29A6B', '#E8DFC8', '#F7B58E', '#C8474A', '#F29A6B', '#E8DFC8'].forEach((c, i) => L.caja(6.75 + i * 0.62, 2.1, 1.07, 0.5, 0.2, 0.06, { t: c, l: c, r: c }, 10.5 + i * 0.01));
    L.add(kv, L.poly([[gx0, gy1, gz0], [gx1, gy1, gz0], [gx1, gy1, gz1], [gx0, gy1, gz1]], `fill="rgba(221,244,241,.16)" stroke="rgba(221,244,241,.6)" stroke-width="1"`) +
      L.poly([[gx1, gy0, gz0], [gx1, gy1, gz0], [gx1, gy1, gz1], [gx1, gy0, gz1]], `fill="rgba(221,244,241,.1)" stroke="rgba(221,244,241,.45)" stroke-width="1"`) +
      L.poly([[gx0, gy0, gz1], [gx1, gy0, gz1], [gx1, gy1, gz1], [gx0, gy1, gz1]], `fill="rgba(221,244,241,.12)" stroke="rgba(221,244,241,.6)" stroke-width="1"`));
    for (const [x, id] of [[7.0, 'comensal6'], [8.3, 'hrClienta'], [9.6, 'hrCliente'], [11.6, 'comensal3']]) { banqueta(L, x, 3.05); pj(id, x, 3.05, 0.72, 'd', EA, x + 3.05 + 0.3); }
    banqueta(L, 10.6, 3.05);
    zona('barra', { formas: [{ piso: [[5.8, 0.5], [12.6, 0.5], [12.6, 3.4], [5.8, 3.4]], alto: 2.1 }], lugar: [8.6, 2.0, 2.5], guia: [9.2, 4.1] });
    zona('carta', { formas: [{ plano: [[10.1, 0.03, 0.9], [12.5, 0.03, 0.9], [12.5, 0.03, 2.4], [10.1, 0.03, 2.4]] }], lugar: [11.3, 0.05, 2.62] });

    // ── El bar de cócteles, con sus botellas y el 春 en neón ──
    L.planoY(13.3, 0.03, 2.35, 600, 150, `<rect width="600" height="150" rx="4" fill="#15120F"/>` + [48, 96, 144].map(y => `<rect x="6" y="${y - 4}" width="588" height="4" fill="#8B6A4E"/>`).join('') +
      Array.from({ length: 48 }, (_, i) => { const f = Math.floor(i / 16), c = i % 16, x = 20 + c * 36, y = 44 + f * 48, h = 22 + (i % 4) * 5, col = ['#3E7A4E', '#C9A24E', '#E0482F', '#E8DFC8', '#5E97B8', '#8B3A3A'][i % 6]; return `<rect x="${x}" y="${y - h}" width="12" height="${h}" rx="4" fill="${col}"/><rect x="${x + 3}" y="${y - h - 8}" width="6" height="9" fill="${col}"/>`; }).join(''), -39);
    L.planoY(15.2, 0.03, HM - 0.02, 180, 22, MONT8(0, 17, '春 HARU · BAR', 16, '#FF8A6E', ' letter-spacing="2"'), -38);
    for (let x = 13.6; x < 18.8 - 0.001; x += 0.5) L.caja(x, 1.35, 0, Math.min(0.5, 18.8 - x), 0.55, 1.02, NEGRO, x + 0.25 + 1.65);
    for (let x = 13.6; x < 18.8 - 0.001; x += 0.5) L.caja(x - 0.02, 1.3, 1.02, Math.min(0.54, 18.82 - x), 0.65, 0.05, MADERA, x + 0.25 + 1.69);
    pj('barman', 15.9, 0.75, 0, 'd');
    L.cil(16.9, 1.6, 1.07, 0.06, 0.18, '#F29A6B', '#E07A4A', 18.6); L.cil(17.3, 1.62, 1.07, 0.06, 0.18, '#7FA35B', '#5E8A45', 18.9);
    for (const [x, id] of [[16.6, null], [17.7, 'comensal2']]) { banqueta(L, x, 2.4); if (id) pj(id, x, 2.4, 0.72, 'd', EA, x + 2.4 + 0.3); }
    zona('bar', { formas: [{ piso: [[13.3, 0.1], [19.8, 0.1], [19.8, 2.8], [13.3, 2.8]], alto: 2.1 }, { plano: [[13.3, 0.03, 0.85], [19.3, 0.03, 0.85], [19.3, 0.03, 2.35], [13.3, 0.03, 2.35]] }], lugar: [16.3, 1.5, 2.55], guia: [15.4, 3.5] });

    // ── El salón: mesas con faroles; en la del QR se pide desde el celular ──
    mesa(L, 10.0, 6.4, 1.1);
    for (const [dx, dy, id, dir] of [[-0.8, 0, 'comensal4', 'd'], [0.8, 0, 'comensal5', 'i']]) { silla(L, 10.0 + dx, 6.4 + dy); pj(id, 10.0 + dx, 6.4 + dy, 0.47, dir, EA, 10.0 + dx + 6.4 + dy + 0.3); }
    farol(L, 10.0, 6.4, [ROJO, ROJO2]);
    mesa(L, 13.4, 5.2, 0.9);
    silla(L, 12.7, 5.2); pj('comensal3', 12.7, 5.2, 0.47, 'd', EA, 18.2);
    silla(L, 14.1, 5.2); pj('comensal6', 14.1, 5.2, 0.47, 'i', EA, 19.6);
    L.caja(13.35, 4.9, 0.77, 0.16, 0.03, 0.18, { t: '#F2F4F7', l: '#F2F4F7', r: '#C4D2E0' }, 18.9);
    L.planoY(13.36, 4.931, 0.93, 14, 14, [[1, 1], [9, 1], [1, 9], [6, 6], [10, 9], [5, 1], [1, 5], [10, 5]].map(([a, b]) => `<rect x="${a}" y="${b}" width="3.4" height="3.4" fill="#0B1726"/>`).join(''), 18.91);
    farol(L, 13.4, 5.2);
    mesa(L, 16.6, 6.9, 0.9);
    silla(L, 15.9, 6.9); pj('lectora', 15.9, 6.9, 0.47, 'd', EA, 23.1);
    silla(L, 17.3, 6.9); pj('tomacafe', 17.3, 6.9, 0.47, 'i', EA, 24.5);
    farol(L, 16.6, 6.9, [ROJO, ROJO2]);
    camina('garzon', [[12.1, 8.3, 2.5], [15.0, 8.6, 1.2], [15.2, 4.4, 2], [12.0, 4.2, 1.2], [12.1, 8.3]], { vel: 0.5 });
    zona('salon', { formas: [{ piso: [[8.8, 4.2], [17.8, 4.2], [17.8, 8.2], [8.8, 8.2]], alto: 1.9 }], lugar: [13.3, 6.3, 2.35], guia: [11.7, 8.7] });
    camina('hrGuia', [[15.4, 11.9, 3], [13.8, 9.6, 2], [15.4, 11.9]], { vel: 0.45 });
    // Plantas en repisas negras: separan el salón de la terraza
    for (let x = 0.4; x < 7.2; x += 1.6) { L.caja(x, 8.7, 0, 1.3, 0.45, 0.62, NEGRO, x + 0.65 + 8.9); plantaAlta(L, x + 0.4, 8.9, 0.62, ['#1C1916', '#141110']); plantaAlta(L, x + 0.95, 8.95, 0.55, ['#1C1916', '#141110']); }

    // ── Retiro y delivery: el mesón con las bolsas, quien reparte y el pedido en el mapa ──
    L.caja(0.1, 4.5, 0, 0.95, 3.3, 1.0, NEGRO, 0.55 + 6.2);
    L.caja(0.08, 4.46, 1.0, 0.99, 3.38, 0.05, MADERA, 0.55 + 6.25);
    for (const y of [4.8, 5.5, 6.2]) { L.caja(0.3, y, 1.05, 0.5, 0.36, 0.42, { t: '#D9B98C', l: '#C4A06E', r: '#A8845E' }, 1.0 + y + 0.3); L.planoY(0.4, y + 0.362, 1.36, 30, 24, `<rect x="3" y="3" width="22" height="18" rx="2" fill="${ROJO}"/>` + MONT8(7, 17, '春', 12, CREMA), 1.0 + y + 0.31); }
    pantallaX(L, 7.9, 2.35, 2.6, 1.3, '§M§haru-6-delivery.webp', { ajuste: 'xMaxYMid slice', k: -38 });
    L.planoX(5.1, 2.4, 170, 30, `<rect width="170" height="30" rx="4" fill="${ROJO}"/>` + MONT8(12, 21, 'RETIRO · DELIVERY', 14, CREMA, ' letter-spacing="1.5"'), -37);
    pj('repartidor', 1.7, 6.7, 0, 'i');
    pj('cajera', 0.55, 4.0, 0, 'd');
    zona('delivery', { formas: [{ piso: [[0.1, 3.7], [3.0, 3.7], [3.0, 8.3], [0.1, 8.3]], alto: 2.0 }, { plano: [[0.03, 7.9, 1.05], [0.03, 5.3, 1.05], [0.03, 5.3, 2.35], [0.03, 7.9, 2.35]] }], lugar: [1.3, 6.0, 2.45], guia: [3.6, 7.3] });

    // ── La terraza: madera, quitasoles, palmeras y la caña en el muro, como en su local ──
    L.caja(0.35, 9.3, 0, 6.9, 4.4, 0.1, { t: '#8E6746', l: '#6E4E34', r: '#5A3E28' }, -20);
    L.piso(0.35, 9.3, Array.from({ length: 35 }, (_, i) => `<path d="M${i * 20 + 10} 0V440" stroke="#7A583B" stroke-width="2"/>`).join(''), -19.9, 0.102);
    L.planoX(13.7, 2.3, 480, 200, Array.from({ length: 96 }, (_, i) => `<rect x="${i * 5}" width="3.4" height="200" fill="${i % 3 ? CANA : '#B8956A'}"/>`).join('') + `<rect y="0" width="480" height="8" fill="#5A4330"/>`, -38);
    const quitasol = (x, y, k) => {
      L.caja(x - 0.03, y - 0.03, 0.1, 0.06, 0.06, 2.4, { t: '#3A3530', l: '#2B2724', r: '#1C1916' }, k - 0.2);
      const pts = Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4 + Math.PI / 8; return [x + Math.cos(a) * 1.02, y + Math.sin(a) * 1.02, 2.32]; });
      L.add(k + 2.5, `<g opacity=".9">` + L.poly(pts, `fill="#EFE7D2" stroke="#CFC2A3" stroke-width="1.4"`) + pts.map(p => L.poly([[x, y, 2.55], p, p], `fill="none" stroke="#CFC2A3" stroke-width="1"`)).join('') + `</g>`);
    };
    mesa(L, 2.4, 10.9, 0.9);
    silla(L, 1.7, 10.9, NEGRO); pj('hrCliente', 1.7, 10.9, 0.47, 'd', EA, 12.9);
    silla(L, 3.1, 10.9, NEGRO); pj('hrClienta', 3.1, 10.9, 0.47, 'i', EA, 14.3);
    quitasol(2.4, 10.9, 13.3);
    mesa(L, 5.3, 12.4, 0.9);
    silla(L, 4.6, 12.4, NEGRO); pj('comensal', 4.6, 12.4, 0.47, 'd', EA, 17.3);
    silla(L, 6.0, 12.4, NEGRO); pj('comensal2', 6.0, 12.4, 0.47, 'i', EA, 18.7);
    quitasol(5.3, 12.4, 17.7);
    palmera(L, 0.8, 9.8, 1.1); palmera(L, 0.8, 13.2, 1.0); palmera(L, 6.9, 9.9, 0.9);
    zona('terraza', { formas: [{ piso: [[0.35, 9.3], [7.25, 9.3], [7.25, 13.7], [0.35, 13.7]], alto: 2.6 }], lugar: [3.8, 11.5, 2.9], guia: [7.7, 11.2] });

    // ── La caja, con el panel del día (Haru 360), y el dueño mirando su tablet ──
    L.caja(15.4, 10.6, 0, 2.3, 0.62, 1.0, NEGRO, 16.55 + 10.9 + 0.5);
    L.caja(15.36, 10.56, 1.0, 2.38, 0.7, 0.05, MADERA, 16.55 + 10.9 + 0.52);
    L.caja(15.75, 10.75, 1.05, 0.06, 0.06, 0.2, TINTA, 16.55 + 10.9 + 0.53);
    L.planoY(15.52, 10.8, 1.62, 72, 44, `<rect width="72" height="44" rx="3" fill="${TINTA}"/><image href="§M§recorte-haru-1-dashboard.webp" x="3" y="3" width="66" height="38" preserveAspectRatio="xMidYMid slice"/>`, 16.55 + 10.9 + 0.54);
    L.caja(16.9, 10.8, 1.05, 0.22, 0.16, 0.05, { t: '#1F2733', l: '#141A23', r: '#0B0B0B' }, 16.55 + 10.9 + 0.55);
    L.planoY(15.5, 11.224, 0.8, 200, 22, MONT8(10, 16, 'CAJA', 13, '#FF8A6E', ' letter-spacing="3"'), 16.55 + 10.9 + 0.51);
    pj('mesera', 16.4, 10.1, 0, 'd');
    pj('dueno', 18.6, 9.3, 0, 'i');
    zona('caja', { formas: [{ piso: [[15.3, 8.8], [19.3, 8.8], [19.3, 11.3], [15.3, 11.3]], alto: 2.0 }], lugar: [16.6, 10.9, 2.25], guia: [14.6, 10.3] });

    // ── La entrada: el noren rojo, el felpudo y la anfitriona con la carta ──
    L.caja(17.45, 13.5, 0, 0.1, 0.1, 2.25, NEGRO, 17.5 + 13.55 + 0.8);
    L.caja(19.35, 13.5, 0, 0.1, 0.1, 2.25, NEGRO, 19.4 + 13.55 + 0.8);
    L.caja(17.45, 13.5, 2.2, 2.0, 0.1, 0.1, NEGRO, 18.45 + 13.55 + 0.9);
    L.planoY(17.55, 13.61, 2.2, 190, 60, [0, 64, 128].map((u, i) => `<rect x="${u}" width="61" height="60" fill="${ROJO}"/><path d="M${u} 52H${u + 61}" stroke="${ROJO2}" stroke-width="3"/>` + (i === 1 ? MONT8(u + 16, 38, '春', 28, CREMA) : '')).join(''), 18.45 + 13.61 + 0.95);
    L.piso(17.6, 12.55, `<rect width="160" height="80" rx="8" fill="#15120F"/><rect x="8" y="8" width="144" height="64" rx="5" fill="none" stroke="${ROJO}" stroke-width="2.4"/>` + MONT8(80, 50, 'HARU', 22, CREMA, ' letter-spacing="3" text-anchor="middle"'), -52);
    pj('hrAnfitriona', 16.0, 12.6, 0, 'd');
    palmera(L, 19.5, 10.9, 1.0);
    zona('recepcion', { formas: [{ piso: [[15.5, 11.8], [19.5, 11.8], [19.5, 13.7], [15.5, 13.7]], alto: 2.3 }], lugar: [18.5, 12.9, 2.6], guia: [15.2, 12.3] });
    lugar('entrada', 17.6, 13.1, 0.9);

    // ── El rincón de BiPlot: Faro, que acompaña la puesta en marcha ──
    kioscoBiPlot({ L, pj, zona }, 8.2, 12.45, 'faro', '§M§../../../assets/casos/haru-360-h.jpg');

    return { id: 'haru', ancho: W, fondo: D };
  });
}

export const haru = salaHaru;
