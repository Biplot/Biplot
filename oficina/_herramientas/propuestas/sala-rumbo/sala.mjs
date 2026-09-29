// Propuesta: la sala de Rumbo, la app de BiPlot para ordenar lo personal, como su propio espacio en el barrio de BiPlot HQ.
// Hecha con lo que trae la app (repo Biplot/rumbo): el ritual que abre y cierra el día, los hábitos y su racha, los
// objetivos, las lecturas, las finanzas, la salud, la rueda de la vida, el diario, los rangos, las insignias, la tienda de
// estrellas y su elefante, con su propio dibujo. Rumbo es un producto propio de BiPlot y ya está publicado.
import { montar, base, registrar, planoXen, silla, plantaAlta, kioscoBiPlot, txt, mono, PELO, Z, PIEL, EA, r1 } from '../comun.mjs';
import { ESTATUA, MANIQUI } from './elefantes.mjs';
export { componer, P } from '../comun.mjs';

// La paleta de Rumbo: azul profundo, su azul de acción, el cian y el coral del isotipo, y la niebla de fondo
const AZUL = '#0E2A47', CIAN = '#3B6FB0', CIAN2 = '#33629C', TEAL = '#17C3B2', CORAL = '#E8563A', NIEBLA = '#F5F6F4', TINTA = '#111F31', SUAVE = '#45505F';
const BLANCO = { t: '#FFFFFF', l: '#EEF0EC', r: '#DCDFD9' };
const CELESTE = { t: '#FFFFFF', l: '#DDE7F0', r: '#C3D2E0' };
const ROBLE = { t: '#C9AE86', l: '#B0936A', r: '#957955' };
const PIZARRA = { t: '#2A3038', l: '#1F242B', r: '#171B20' };
const ESTRELLA = (x, y, r, c) => `<path d="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; return (i ? 'L' : 'M') + r1(x + Math.cos(a) * q) + ' ' + r1(y + Math.sin(a) * q); }).join('')}Z" fill="${c}"/>`;
const ISOTIPO = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="1" y="1" width="30" height="30" rx="8" fill="${AZUL}" stroke="${TEAL}" stroke-width="1.2"/><polyline points="7,23 13,17 18,20 25,10" fill="none" stroke="${TEAL}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="23" r="2" fill="${TEAL}"/><circle cx="13" cy="17" r="2" fill="${TEAL}"/><circle cx="18" cy="20" r="2" fill="${TEAL}"/><circle cx="25" cy="10" r="2.6" fill="#FF6B4A"/></g>`;

// ───────── Quienes viven su día con Rumbo (ilustraciones sin nombre) ─────────
const JEAN = ['#35557A', '#27425F'], CLARO = ['#DDE7F0', '#C3D2E0'];
registrar({
  rmEstira: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'cola', lazo: TEAL, cuerpo: 'fino', arriba: 'deportiva', arribaCol: [CIAN, CIAN2, null], abajo: 'pantalon', abajoCol: ['#2A3038', '#1F242B'], zapatos: Z.blancas, brazoD: 'alto', brazoI: 'alto', ojos: 'felices' },
  rmHabito: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'corto', arriba: 'polera', arribaCol: ['#F2F4F7', '#D6DCE3'], manga: 'corta', abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, brazoD: 'alto', ojos: 'felices', boca: 'dientes' },
  rmSube: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'largo', cuerpo: 'fino', arriba: 'deportiva', arribaCol: [TEAL, '#0F8F83', null], abajo: 'pantalon', abajoCol: ['#2A3038', '#1F242B'], zapatos: Z.blancas, piernas: 'camina', brazoD: 'frente', brazoI: 'atras', ojos: 'felices' },
  rmCocina: { piel: PIEL.media, pelo: PELO.cafe, peinado: 'corto', arriba: 'delantal', arribaCol: ['#F2F4F7', '#D6DCE3', [CIAN, CIAN2]], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'plato', barba: '#4A3222', ojos: 'felices' },
  rmAhorro: { piel: PIEL.clara, pelo: PELO.rojizo, peinado: 'melena', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#E0B341', '#C49A2E', ['#F2F4F7']], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, brazoD: 'senala', ojos: 'grandes', rubor: '#E9967A' },
  rmDiario: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'rizado', cuerpo: 'fino', arriba: 'poleron', arribaCol: ['#8E6BB8', '#6E4E96', '#6E4E96'], abajo: 'pantalon', abajoCol: CLARO, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'sostiene', objeto: 'libreta', brazoI: 'frente', ojos: 'felices' },
  rmNoche: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'largo', cuerpo: 'fino', arriba: 'poleron', arribaCol: ['#6E86B8', '#566E9E', '#566E9E'], abajo: 'pantalon', abajoCol: CLARO, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'sostiene', objeto: 'taza', brazoI: 'frente', ojos: 'felices', rubor: '#E9967A' },
  rmTienda: { piel: PIEL.trigo, pelo: PELO.castano, peinado: 'corto', arriba: 'chaqueta', arribaCol: ['#2A7C78', '#1F5F5C', ['#DDF4F1', null]], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, brazoD: 'senala', brazoI: 'abajo', objetoI: 'bolsa', ojos: 'grandes' }
});

const W = 20, D = 14, HM = 2.6;
// El elefante de Rumbo parado en (x, y, z), de alto h: su dibujo va de pie, como la gente
const elefante = (L, svg, x, y, z, h, k) => {
  const [px, py] = L.P(x, y, z), s = h * 39 / 222;
  L.E.marca(x, y, z); L.E.marca(x, y, z + h);
  L.add(k, `<g transform="translate(${r1(px - 128 * s)} ${r1(py - 222 * s)}) scale(${s.toFixed(4)})">${svg}</g>`);
};
// Lo que muestra la pantalla del kiosco: el «Hoy» de Rumbo
const HOY = `<rect width="69" height="38" fill="#FBFBF9"/><rect width="16" height="38" fill="#FFFFFF"/>` + ISOTIPO(3, 3, 0.3) +
  [14, 19, 24, 29].map((y) => `<rect x="3" y="${y}" width="10" height="2" rx="1" fill="#D6D8D3"/>`).join('') +
  txt(20, 9, 'Hoy', 5.5, TINTA) + `<circle cx="28" cy="22" r="7" fill="none" stroke="#DDE7F0" stroke-width="2.6"/><path d="M28 15A7 7 0 1 1 21.4 24.3" fill="none" stroke="${CIAN}" stroke-width="2.6" stroke-linecap="round"/>` +
  [0, 1, 2, 3].map((i) => `<rect x="39" y="${13 + i * 6}" width="3.4" height="3.4" rx="1" fill="${i < 3 ? CIAN : 'none'}" stroke="${CIAN}" stroke-width=".6"/><rect x="44.5" y="${13.8 + i * 6}" width="${18 - i * 2}" height="1.8" rx=".9" fill="#C3CAD2"/>`).join('');

export function salaRumbo() {
  return montar(({ E, L, pj, camina, lugar }) => {
    // Piso de roble claro en tablas, muros en su niebla con el filete azul
    let tablas = '';
    for (let i = 0; i < 40; i++) tablas += `<path d="M0 ${i * 35 + 17}H2000" stroke="#DCCDB3" stroke-width="2"/>`;
    for (let i = 0; i < 160; i++) { const v = (i % 40) * 35 + 17, u = (i * 377 + (i % 7) * 91) % 2000; tablas += `<path d="M${u} ${v}V${v + 35}" stroke="#DCCDB3" stroke-width="2"/>`; }
    base(E, L, { W, D, HM, piso: '#E8DCC8', dibujo: tablas, muroY: NIEBLA, muroX: '#E6E9E4', zocalo: AZUL, tope: '#D6D8D3', canto: '#C9CDC6', filete: CIAN });
    // El camino de los días, de la puerta a la cumbre: cada día es un paso
    const camino = 'M1630 1240C1520 1140 1440 1070 1300 990C1120 900 780 900 700 720C640 560 780 380 900 250';
    L.piso(0, 0, `<path d="${camino}" fill="none" stroke="${CIAN}" stroke-opacity=".5" stroke-width="12" stroke-dasharray="2 24" stroke-linecap="round"/>` +
      [[1630, 1240, 'Día 1', 26, 8], [1300, 990, 'Día 7', 26, 8], [700, 720, 'Día 30', 26, 8], [900, 250, 'Día 100', 26, 8]].map(([x, y, t, dx, dy]) =>
        `<circle cx="${x}" cy="${y}" r="20" fill="#FFFFFF" stroke="${CIAN}" stroke-width="6"/><circle cx="${x}" cy="${y}" r="7" fill="${CORAL}"/>` + mono(x + dx, y + dy, t, 22, AZUL)).join(''), -54);

    // ── Ritual de mañana: el ventanal del amanecer, la colchoneta y el café ──
    L.planoY(13.2, 0.02, 2.35, 640, 185, `<defs><linearGradient id="rm-amanecer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6B98E"/><stop offset=".55" stop-color="#F9D9A8"/><stop offset="1" stop-color="#FCEBCB"/></linearGradient></defs>` +
      `<rect width="640" height="185" fill="url(#rm-amanecer)"/><circle cx="330" cy="150" r="72" fill="#FFF3D6" opacity=".45"/><circle cx="330" cy="150" r="44" fill="#FFF3D6"/>` +
      `<path d="M0 150Q120 112 240 140T480 128T640 138V185H0Z" fill="#9DB7C9"/><path d="M0 168Q160 142 320 164T640 160V185H0Z" fill="#7F9DB3"/>` +
      [0, 1, 2, 3, 4].map((i) => `<rect x="${i * 158}" width="8" height="185" fill="${AZUL}"/>`).join('') + `<rect width="640" height="185" fill="none" stroke="${AZUL}" stroke-width="10"/>`, -39);
    L.planoY(13.4, 0.03, 2.56, 300, 20, txt(0, 16, 'ABRE TU DÍA', 16, AZUL, ' letter-spacing="3"'), -38);
    L.piso(15.2, 1.25, `<rect width="250" height="105" rx="16" fill="${CIAN}"/><rect x="10" y="10" width="230" height="85" rx="11" fill="none" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="3"/>`, -28, 0.02);
    pj('meditadora', 16.2, 1.85, 0.02, 'd');
    pj('rmEstira', 18.7, 2.3, 0, 'i');
    L.cil(14.5, 2.1, 0, 0.24, 0.46, '#FFFFFF', '#DCDFD9'); L.cil(14.45, 2.05, 0.46, 0.05, 0.1, CORAL, '#C63F26', 16.7);
    plantaAlta(L, 19.55, 0.55, 1.0, ['#FFFFFF', '#DCDFD9']);
    lugar('manana', 16.4, 1.6, 1.8);

    // ── Objetivos: el mural de la montaña con la bandera arriba y la escalera, un peldaño por paso ──
    L.planoY(6.0, 0.02, 2.35, 640, 175, `<rect width="640" height="175" rx="6" fill="#DDE7F0"/><path d="M0 175L130 82L210 128L360 26L520 118L640 72V175Z" fill="#6E8FB5"/><path d="M0 175L110 130L220 160L360 92L500 160L640 130V175Z" fill="#4E72A0"/>` +
      `<path d="M332 45L360 26L392 48L378 52L360 40L344 54Z" fill="#FFFFFF"/><path d="M360 26V0" stroke="${AZUL}" stroke-width="3"/><path d="M360 0L388 8L360 16Z" fill="${CORAL}"/>` +
      txt(20, 36, 'OBJETIVOS', 22, AZUL, ' letter-spacing="2"') + txt(20, 58, 'Metas del trimestre y del mes', 13, SUAVE, ' font-weight="500"'), -39);
    for (let j = 0; j < 5; j++) L.caja(8.2 + j * 0.55, 0.7, 0, 0.55, 1.2, 0.2 * (j + 1), CELESTE, 8.2 + j * 0.55 + 0.27 + 1.3 + j * 0.01);
    L.linea([[10.95, 1.3, 1.0], [10.95, 1.3, 1.85]], AZUL, 2.4, 12.4);
    L.add(12.41, L.poly([[10.95, 1.3, 1.85], [11.35, 1.3, 1.74], [10.95, 1.3, 1.63]], `fill="${CORAL}"`));
    pj('rmSube', 9.55, 1.3, 0.6, 'd', EA, 11.2);
    lugar('objetivos', 9.3, 0.6, 2.1);

    // ── Lecturas: la biblioteca de roble, el sillón y la lámpara ──
    L.caja(0.4, 0.05, 0, 5.0, 0.45, 2.3, ROBLE, -20);
    L.planoY(0.45, 0.504, 2.24, 490, 222, [0, 1, 2, 3].map((f) => `<rect x="0" y="${f * 55 + 50}" width="490" height="6" fill="#8C6D4A"/>` +
      Array.from({ length: 38 }, (_, i) => { const h = 38 - (i % 4) * 4; return `<rect x="${6 + i * 12.6}" y="${f * 55 + 50 - h}" width="10" height="${h}" rx="1" fill="${[AZUL, CIAN, '#E0B341', CORAL, '#F2F4F7', TEAL, '#8E6BB8'][(i * 3 + f) % 7]}"/>`; }).join('')).join(''), -19);
    L.planoY(0.6, 0.51, 2.54, 300, 20, txt(0, 16, 'LECTURAS', 16, AZUL, ' letter-spacing="3"'), -18);
    L.caja(1.9, 1.55, 0, 0.9, 0.85, 0.42, { t: '#6E8FB5', l: '#56769C', r: '#46628A' }, 4.2);
    L.caja(1.8, 1.55, 0.42, 0.2, 0.85, 0.5, { t: '#6E8FB5', l: '#56769C', r: '#46628A' }, 3.9);
    pj('lectora', 2.45, 2.0, 0.42, 'd', EA, 4.9);
    L.cil(3.35, 1.1, 0, 0.03, 1.55, '#2A3038', '#1F242B'); L.cil(3.35, 1.1, 1.52, 0.22, 0.24, '#FFF3D6', '#F2DFB3', 5.0);
    lugar('lecturas', 2.6, 1.2, 2.0);

    // ── El muro de la izquierda: la rueda de la vida, los hábitos con su racha y las recompensas ──
    const AREAS = ['Salud y deporte', 'Familia y amor', 'Trabajo y finanzas', 'Ocio y amistad', 'Tiempo para mí', 'Emocional', 'Educativa y cultural', 'Espiritual y ética'];
    const notas = [8, 7, 6, 5, 7, 6, 8, 7];
    const rueda = (cx, cy, R) => { const pt = (i, v) => { const a = -Math.PI / 2 + i * Math.PI / 4; return [cx + Math.cos(a) * R * v / 10, cy + Math.sin(a) * R * v / 10]; };
      return [2, 4, 6, 8, 10].map((v) => `<circle cx="${cx}" cy="${cy}" r="${R * v / 10}" fill="none" stroke="#C3D2E0" stroke-width="1.4"/>`).join('') +
        AREAS.map((_, i) => { const [x, y] = pt(i, 10); return `<path d="M${cx} ${cy}L${r1(x)} ${r1(y)}" stroke="#C3D2E0" stroke-width="1.2"/>`; }).join('') +
        `<polygon points="${notas.map((v, i) => pt(i, v).map(r1).join(',')).join(' ')}" fill="${CIAN}" fill-opacity=".35" stroke="${CIAN}" stroke-width="3" stroke-linejoin="round"/>` +
        notas.map((v, i) => { const [x, y] = pt(i, v); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="4" fill="${AZUL}"/>`; }).join(''); };
    L.planoX(3.7, 2.3, 320, 210, `<rect width="320" height="210" rx="8" fill="#FFFFFF" stroke="#D6D8D3" stroke-width="2"/>` + txt(16, 30, 'RUEDA DE LA VIDA', 16, AZUL, ' letter-spacing="2"') +
      txt(16, 48, 'Cada área, del 0 al 10', 11, SUAVE, ' font-weight="500"') + rueda(96, 132, 66) +
      AREAS.map((a, i) => txt(186, 76 + i * 16, a, 10.5, TINTA, ' font-weight="500"') + `<rect x="300" y="${68 + i * 16}" width="6" height="9" rx="2" fill="${CIAN}" opacity="${0.3 + notas[i] / 14}"/>`).join(''), -38);
    const HABITOS = ['Ritual de mañana', 'Leer 20 min', 'Caminar', 'Ahorrar', 'Diario'];
    L.planoX(8.2, 2.3, 400, 190, `<rect width="400" height="190" rx="8" fill="#FFFFFF" stroke="#D6D8D3" stroke-width="2"/>` + txt(16, 30, 'HÁBITOS', 16, AZUL, ' letter-spacing="2"') +
      `<path d="M300 14C308 24 300 28 306 36C298 36 292 30 294 22C288 28 288 34 290 38C282 34 282 22 300 14Z" fill="${CORAL}"/>` + txt(314, 34, '12 días', 16, CORAL) +
      ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => mono(166 + i * 30, 58, d, 11, SUAVE)).join('') +
      HABITOS.map((h, f) => txt(16, 82 + f * 24, h, 12, TINTA, ' font-weight="500"') + Array.from({ length: 7 }, (_, i) => { const hecho = !(f === 3 && i === 5) && i < 6; return `<rect x="${160 + i * 30}" y="${70 + f * 24}" width="18" height="18" rx="5" fill="${hecho ? CIAN : '#FFFFFF'}" stroke="${CIAN}" stroke-width="1.6"/>` + (hecho ? `<path d="M${164 + i * 30} ${79 + f * 24}l4 4 7-8" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>` : ''); }).join('')).join(''), -38);
    pj('rmHabito', 0.85, 6.3, 0, 'i');
    const RANGOS = [['Aprendiz', '#7A8CA0'], ['Constante', '#FF6B4A'], ['Enfocado', TEAL], ['Imparable', '#3EE0CF'], ['Maestro', TEAL], ['Élite', '#8FF3E8'], ['Alto Valor', '#FFC24A']];
    const INSIGNIAS = [['Primer Paso', CORAL], ['Semana de Fuego', '#FF8A3D'], ['Madrugador', '#F6B98E'], ['Bocado a Bocado', CIAN], ['Página Uno', '#8E6BB8'], ['Mes Redondo', TEAL]];
    L.planoX(11.1, 2.3, 250, 190, `<rect width="250" height="190" rx="8" fill="${AZUL}"/>` + txt(14, 28, 'RECOMPENSAS', 15, '#FFFFFF', ' letter-spacing="2"') +
      RANGOS.map(([n, c], i) => `<rect x="14" y="${42 + i * 20}" width="${40 + i * 12}" height="14" rx="4" fill="${c}" opacity="${i === 3 ? 1 : 0.55}"/>` + txt(20 + 40 + i * 12, 53 + i * 20, n, 9.5, i === 3 ? '#FFFFFF' : '#AFC0D2', i === 3 ? '' : ' font-weight="500"')).join('') +
      INSIGNIAS.map(([n, c], i) => { const x = 184 + (i % 2) * 34, y = 58 + Math.floor(i / 2) * 38; return `<circle cx="${x}" cy="${y}" r="13" fill="${c}" stroke="#FFFFFF" stroke-width="2"/>` + ESTRELLA(x, y, 6, '#FFFFFF'); }).join(''), -38);
    lugar('rueda', 0.05, 2.1, 1.3);
    lugar('habitos', 0.05, 6.2, 1.4);
    lugar('recompensas', 0.05, 9.9, 1.4);

    // ── Cierre del día: la ventana de noche, el sofá y el diario ──
    L.planoX(13.7, 2.35, 250, 185, `<defs><linearGradient id="rm-noche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E2A47"/><stop offset="1" stop-color="#2E4F7A"/></linearGradient></defs><rect width="250" height="185" fill="url(#rm-noche)"/>` +
      `<circle cx="178" cy="52" r="22" fill="#F4ECD8"/><circle cx="188" cy="46" r="20" fill="url(#rm-noche)"/>` + [[40, 30], [90, 60], [60, 110], [130, 26], [210, 120], [150, 90], [30, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#FFFFFF"/>`).join('') +
      `<path d="M0 160Q70 138 130 156T250 150V185H0Z" fill="#0A1F35"/>` + [0, 1, 2].map((i) => `<rect x="${i * 121}" width="8" height="185" fill="#DCDFD9"/>`).join('') + `<rect width="250" height="185" fill="none" stroke="#DCDFD9" stroke-width="10"/>`, -38);
    L.planoX(13.7, 2.57, 250, 20, txt(0, 16, 'CIERRA TU DÍA', 16, AZUL, ' letter-spacing="3"'), -37);
    L.caja(1.0, 11.2, 0, 0.85, 2.2, 0.4, { t: '#8E6BB8', l: '#6E4E96', r: '#5A3E7E' }, 12.6);
    L.caja(1.75, 11.2, 0.4, 0.22, 2.2, 0.48, { t: '#8E6BB8', l: '#6E4E96', r: '#5A3E7E' }, 13.9);
    pj('rmNoche', 1.4, 12.2, 0.4, 'i', EA, 13.5);
    L.caja(2.6, 9.95, 0, 0.7, 0.7, 0.62, BLANCO, 13.2);
    L.caja(2.75, 10.1, 0.62, 0.34, 0.26, 0.04, { t: '#F4ECD8', l: '#E8DFC8', r: '#CFC2A3' }, 13.25);
    L.cil(3.15, 10.15, 0.62, 0.05, 0.3, '#2A3038', '#1F242B', 13.3); L.cil(3.15, 10.15, 0.9, 0.13, 0.14, '#FFF3D6', '#F2DFB3', 13.31);
    silla(L, 3.0, 11.0, { t: '#DDE7F0', l: '#C3D2E0', r: '#A9BACB' }, 0.42);
    pj('rmDiario', 3.0, 11.0, 0.46, 'i', EA, 14.3);
    lugar('noche', 0.05, 12.4, 1.6);
    lugar('diario', 2.9, 10.4, 1.3);

    // ── Tu elefante: la estatua al centro, sobre su alfombra y su pedestal ──
    L.piso(8.55, 4.95, `<circle cx="195" cy="195" r="195" fill="#DDE7F0"/><circle cx="195" cy="195" r="172" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="3 14" stroke-linecap="round"/>`, -40);
    L.caja(9.4, 5.8, 0, 2.2, 2.2, 0.5, BLANCO, 9.4 + 5.8 + 2.2);
    L.caja(9.36, 5.76, 0.5, 2.28, 2.28, 0.05, { t: CIAN, l: CIAN2, r: '#2A5585' }, 9.4 + 5.8 + 2.25);
    L.planoY(9.5, 8.004, 0.46, 200, 42, txt(100, 18, '¿Cómo te comes un elefante?', 12.5, AZUL, ' text-anchor="middle"') + txt(100, 34, 'Un bocado a la vez.', 11.5, CIAN2, ' text-anchor="middle" font-weight="500"'), 9.4 + 5.8 + 2.3);
    elefante(L, ESTATUA, 10.5, 6.9, 0.55, 2.35, 9.4 + 5.8 + 2.4);
    pj('nino', 12.6, 6.6, 0, 'i');
    pj('turista', 8.6, 9.8, 0, 'd');
    lugar('elefante', 10.5, 6.9, 2.9);

    // ── Salud y bienestar: la isla de cocina con fruta y verduras ──
    L.caja(15.2, 5.8, 0, 3.0, 0.8, 0.92, BLANCO, 16.7 + 6.2 + 0.3);
    L.caja(15.16, 5.76, 0.92, 3.08, 0.88, 0.05, { t: '#F2F4F7', l: '#DCDFD9', r: '#C9CDC6' }, 16.7 + 6.2 + 0.32);
    L.cil(15.8, 6.2, 0.97, 0.26, 0.12, '#FFFFFF', '#DCDFD9', 23.3);
    [['#E8563A', 15.7, 6.12], ['#E0B341', 15.9, 6.26], ['#7FA35B', 15.78, 6.3]].forEach(([c, x, y], i) => L.cil(x, y, 1.07, 0.08, 0.1, c, c, 23.35 + i * 0.01));
    L.caja(16.5, 6.0, 0.97, 0.7, 0.4, 0.03, ROBLE, 23.4); [16.62, 16.8, 16.98].forEach((x, i) => L.cil(x, 6.2, 1.0, 0.07, 0.05, '#7FA35B', '#5E8A3E', 23.42 + i * 0.01));
    L.cil(17.7, 6.15, 0.97, 0.12, 0.34, 'rgba(221,236,240,.7)', 'rgba(195,210,224,.8)', 23.5);
    pj('rmCocina', 16.9, 5.25, 0, 'd');
    L.planoY(15.3, 6.604, 0.8, 280, 32, txt(12, 22, 'SALUD Y BIENESTAR', 13, AZUL, ' letter-spacing="2"'), 23.25);
    lugar('salud', 16.7, 6.2, 1.9);

    // ── Finanzas: el frasco del ahorro y el ahorro del mes ──
    L.caja(4.6, 7.9, 0, 1.6, 0.6, 0.9, BLANCO, 5.4 + 8.2 + 0.3);
    L.planoY(4.7, 8.504, 0.84, 140, 70, txt(8, 20, 'Ahorro del mes', 11, AZUL) + [30, 44, 38, 56, 50, 66].map((h, i) => `<rect x="${12 + i * 20}" y="${64 - h * 0.6}" width="12" height="${h * 0.6}" rx="2" fill="${i === 5 ? CORAL : CIAN}"/>`).join(''), 14.0);
    L.cil(5.0, 8.2, 0.9, 0.2, 0.42, 'rgba(221,244,241,.55)', 'rgba(185,215,225,.6)', 14.2);
    [0, 1, 2, 3, 4].forEach((i) => L.cil(5.0 + (i % 2) * 0.06 - 0.03, 8.2, 0.92 + i * 0.05, 0.15, 0.04, '#E0B341', '#C49A2E', 14.1 + i * 0.001));
    L.cil(5.7, 8.15, 0.9, 0.12, 0.22, '#FFFFFF', '#DCDFD9', 14.25);
    pj('rmAhorro', 4.3, 9.1, 0, 'd');
    lugar('finanzas', 5.2, 8.2, 1.6);

    // ── La tienda de estrellas: ropa para el elefante, con el maniquí en el mesón ──
    L.caja(12.6, 12.2, 0, 2.4, 0.62, 0.92, { t: '#FFFFFF', l: AZUL, r: '#0A1F35' }, 13.8 + 12.5 + 0.3);
    L.caja(12.56, 12.16, 0.92, 2.48, 0.7, 0.05, { t: '#F2F4F7', l: '#DCDFD9', r: '#C9CDC6' }, 13.8 + 12.5 + 0.32);
    L.planoY(12.8, 12.824, 0.8, 200, 54, ESTRELLA(22, 26, 16, '#FFC24A') + txt(46, 24, 'TIENDA', 16, '#FFFFFF', ' letter-spacing="3"') + txt(46, 42, 'Ropa y funciones con tus estrellas', 9.5, '#AFC0D2', ' font-weight="500"'), 13.8 + 12.5 + 0.33);
    elefante(L, MANIQUI, 13.3, 12.5, 0.97, 0.95, 13.8 + 12.5 + 0.5);
    [['#E8563A', 14.2], ['#17C3B2', 14.55]].forEach(([c, x], i) => L.cil(x, 12.45, 0.97, 0.13, 0.08, c, c, 26.9 + i * 0.01));
    pj('rmTienda', 15.5, 12.5, 0, 'i');
    lugar('tienda', 13.8, 12.5, 1.6);

    // ── La entrada: el felpudo y el celular gigante con el «Hoy» de Rumbo ──
    L.piso(16.8, 12.75, `<rect width="170" height="80" rx="10" fill="${AZUL}"/>` + ISOTIPO(10, 16, 1.5) + txt(70, 50, 'Rumbo', 26, '#FFFFFF'), -52);
    L.caja(18.7, 10.6, 0, 0.9, 0.18, 2.1, { t: '#1B2530', l: '#0B1726', r: '#0B1726' }, 18.9 + 10.7 + 0.5);
    L.planoY(18.74, 10.784, 2.04, 82, 196, `<rect width="82" height="196" rx="12" fill="#FBFBF9"/>` + ISOTIPO(8, 10, 0.55) + txt(28, 23, 'Rumbo', 11, TINTA) + txt(8, 46, 'Hoy', 14, TINTA) +
      `<circle cx="41" cy="84" r="22" fill="none" stroke="#DDE7F0" stroke-width="7"/><path d="M41 62A22 22 0 1 1 20 91" fill="none" stroke="${CIAN}" stroke-width="7" stroke-linecap="round"/>` + txt(33, 90, '12', 15, TINTA) +
      HABITOS.map((h, i) => `<rect x="9" y="${118 + i * 14}" width="8" height="8" rx="2" fill="${i < 3 ? CIAN : 'none'}" stroke="${CIAN}" stroke-width="1.2"/>` + txt(21, 125 + i * 14, h, 7, SUAVE, ' font-weight="500"')).join(''), 18.9 + 10.7 + 0.51);
    plantaAlta(L, 19.55, 12.9, 1.0, ['#FFFFFF', '#DCDFD9']);
    lugar('entrada', 17.6, 12.4, 1.8);
    camina('caminante', [[16.4, 10.4, 2.5], [13.0, 9.9, 2], [7.3, 8.1, 2], [8.3, 3.6, 2], [7.3, 8.1], [13.0, 9.9]], { vel: 0.5 });

    // ── El rincón de BiPlot: Tamandúa, que prueba cada versión de Rumbo antes de publicarla ──
    kioscoBiPlot(L, pj, lugar, 8.6, 12.45, 'tamandua', null, HOY);

    return { id: 'rumbo', ancho: W, fondo: D };
  });
}

export const ZONAS = {
  entrada: [17.0, 11.8, 1.1, 440], manana: [16.6, 1.8, 1.3, 440], objetivos: [9.2, 1.4, 1.3, 420], lecturas: [2.6, 1.6, 1.2, 380],
  elefante: [10.5, 7.0, 1.4, 400], muro: [0.9, 7.2, 1.4, 460], noche: [2.2, 11.6, 1.1, 400], salud: [16.6, 6.0, 1.1, 380], biplot: [9.7, 12.6, 1.0, 230]
};
export const sala = salaRumbo;
