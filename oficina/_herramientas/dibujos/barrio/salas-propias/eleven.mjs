// La sala de Eleven Club Fitness and BXO en la oficina: su propio club, sin números. Hecha con los datos de su sitio
// (eleven-360, assets/js/data.js): sus zonas, su horario de clases, sus cifras, la tienda Identity Eleven, el acceso con
// huella, el campeonato de calistenia y su lema. Eleven 360 es una propuesta: la cuenta Lupe en el kiosco de BiPlot.
import { montar, base, registrar, planoXen, banqueta, plantaAlta, kioscoBiPlot, vidrioY, vidrioX, texto, PELO, Z, PIEL, EA } from './comun.mjs';

const ANTON = texto(`'Anton','Impact','DejaVu Sans',sans-serif`, 400);
const CHAKRA = texto(`'Chakra Petch','DejaVu Sans',sans-serif`, 700);
const MANROPE = texto(`'Manrope','Inter','DejaVu Sans',sans-serif`, 700);
// La paleta de Eleven: negro, naranjo, ámbar y papel
const OR = '#FF6600', OR2 = '#FF8A1F', AMB = '#FFB020', PAPEL = '#F2EDE5', TINTA = '#0B0B0B';
const NEGRO = { t: '#2A2A2A', l: '#1C1C1C', r: '#121212' };
const GRIS = { t: '#4A4A4A', l: '#383838', r: '#2A2A2A' };
const ACERO = { t: '#B9BEC4', l: '#8F959C', r: '#71777E' };
const NARANJO = { t: OR2, l: OR, r: '#CC5200' };
const NARANJO2 = { t: OR, l: '#CC5200', r: '#A84400' };
const MADERA = { t: '#B98B5E', l: '#9C7550', r: '#7E5C3C' };

// ───────── La gente de Eleven: el Team Eleven con su polera negra y naranja, y quienes entrenan ─────────
// (ilustraciones sin nombre; varias visten los colores de los polos Identity Eleven)
const POLERA_TEAM = ['#141414', '#0B0B0B', [OR, 'M14.6 27.4H19.2V29.8H14.6Z']];
const NEGROS = ['#1F1F1F', '#141414'];
registrar({
  elCoach: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'corto', arriba: 'polera', arribaCol: POLERA_TEAM, manga: 'corta', abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'tablet', barba: '#1A1613', ojos: 'felices' },
  elCoach2: { piel: PIEL.media, pelo: PELO.castano, peinado: 'cola', lazo: OR, cuerpo: 'fino', arriba: 'polera', arribaCol: POLERA_TEAM, manga: 'corta', abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'alto', ojos: 'grandes', boca: 'dientes' },
  elRecepcion: { piel: PIEL.clara, pelo: PELO.negro, peinado: 'largo', cuerpo: 'fino', arriba: 'polera', arribaCol: POLERA_TEAM, manga: 'corta', abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'saluda', ojos: 'grandes', aros: OR, boca: 'dientes' },
  elSocio: { piel: PIEL.media, pelo: PELO.cafe, peinado: 'corto', arriba: 'poleron', arribaCol: ['#5A5A5A', '#454545', '#454545'], abajo: 'short', abajoCol: NEGROS, zapatos: Z.blancas, atras: 'mochila', brazoD: 'senala', ojos: 'felices' },
  elLevanta: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'corto', arriba: 'deportiva', arribaCol: [OR, '#CC5200', null], abajo: 'short', abajoCol: NEGROS, zapatos: Z.negras, brazoD: 'alto', brazoI: 'alto', boca: 'dientes' },
  elToalla: { piel: PIEL.clara, pelo: PELO.negro, peinado: 'cola', lazo: OR, cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#2A2A2A', '#1C1C1C', null], abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, objeto: 'toalla', brazoD: 'abajo', piernas: 'camina', ojos: 'felices' },
  elCorre1: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'cola', lazo: AMB, cuerpo: 'fino', arriba: 'deportiva', arribaCol: [AMB, '#D9901A', null], abajo: 'short', abajoCol: NEGROS, zapatos: Z.blancas, piernas: 'camina', brazoD: 'frente', brazoI: 'atras', audifonos: '#141414', ojos: 'felices' },
  elCorre2: { piel: PIEL.trigo, pelo: PELO.negro, peinado: 'corto', arriba: 'deportiva', arribaCol: ['#5E6B7A', '#4A5562', null], abajo: 'short', abajoCol: NEGROS, zapatos: Z.rojas, piernas: 'camina', brazoD: 'frente', brazoI: 'atras', ojos: 'felices' },
  elBici1: { piel: PIEL.media, pelo: PELO.rojizo, peinado: 'cola', lazo: '#141414', cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#EEE5D1', '#CFC2A3', null], abajo: 'short', abajoCol: NEGROS, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'felices' },
  elBici2: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'rizado', arriba: 'deportiva', arribaCol: [OR, '#CC5200', null], abajo: 'short', abajoCol: NEGROS, zapatos: Z.rojas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', boca: 'dientes' },
  elMaquina1: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'mono', cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#B7A2E6', '#9A84CC', null], abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'grandes' },
  elMaquina2: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'corto', arriba: 'deportiva', arribaCol: ['#2A2A2A', '#1C1C1C', null], abajo: 'short', abajoCol: ['#35557A', '#27425F'], zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', barba: '#4A3222' },
  elClase1: { piel: PIEL.media, pelo: PELO.negro, peinado: 'largo', cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#EAB6CA', '#D295AE', null], abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'alto', brazoI: 'alto', ojos: 'felices', boca: 'dientes' },
  elClase2: { piel: PIEL.trigo, pelo: PELO.rojizo, peinado: 'cola', lazo: '#141414', cuerpo: 'fino', arriba: 'deportiva', arribaCol: [OR, '#CC5200', null], abajo: 'short', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'saluda', brazoI: 'alto', ojos: 'felices' },
  elClase3: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'rizado', arriba: 'deportiva', arribaCol: ['#A8C7EC', '#86A8D2', null], abajo: 'short', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'alto', brazoI: 'frente', boca: 'dientes' },
  elClase4: { piel: PIEL.clara, pelo: PELO.canoso, peinado: 'melena', cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#EEE5D1', '#CFC2A3', null], abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'saluda', brazoI: 'alto', lentes: 'redondos', ojos: 'felices', rubor: '#E9967A' },
  elClase5: { piel: PIEL.trigo, pelo: PELO.castano, peinado: 'corto', arriba: 'deportiva', arribaCol: ['#B7A2E6', '#9A84CC', null], abajo: 'short', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'alto', brazoI: 'alto', ojos: 'felices', boca: 'dientes' },
  elNino: { piel: PIEL.media, pelo: PELO.cafe, peinado: 'corto', arriba: 'polera', arribaCol: [OR, '#CC5200'], manga: 'corta', abajo: 'short', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'alto', brazoI: 'alto', ojos: 'grandes', boca: 'dientes' },
  elCompra: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'melena', cuerpo: 'fino', arriba: 'chaqueta', arribaCol: ['#5A5E3A', '#464A2C', [PAPEL, null]], abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'senala', brazoI: 'abajo', objetoI: 'bolsa', ojos: 'grandes' },
  elCafe: { piel: PIEL.media, pelo: PELO.negro, peinado: 'corto', arriba: 'deportiva', arribaCol: ['#4A3227', '#3A261D', null], abajo: 'short', abajoCol: NEGROS, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'sostiene', objeto: 'taza', brazoI: 'frente', barba: '#1A1613', ojos: 'felices' },
  elGuia: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'corto', arriba: 'polera', arribaCol: POLERA_TEAM, manga: 'corta', abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'tablet', piernas: 'camina', ojos: 'felices' },
  elBatido: { piel: PIEL.clara, pelo: PELO.rubio, peinado: 'largo', cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#121212', '#0B0B0B', null], abajo: 'pantalon', abajoCol: NEGROS, zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'taza', atras: 'mochila', ojos: 'grandes', rubor: '#E9967A' }
});

const W = 20, D = 14, HM = 2.6;
// El logo de Eleven: la barra con sus discos y su nombre
const logo = (x, y, s = 1, conTexto = true) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-44" y="-4" width="88" height="8" rx="2" fill="${OR}"/>` +
  [[-40, 14, 30], [-30, 10, 22], [26, 10, 22], [30, 14, 30]].map(([dx, w, h]) => `<rect x="${dx - (dx < 0 ? 0 : w - 10)}" y="${-h / 2}" width="10" height="${h}" rx="2" fill="${OR}"/>`).join('') +
  (conTexto ? CHAKRA(0, 28, 'ELEVEN CLUB', 17, PAPEL, ' text-anchor="middle" letter-spacing="2"') + MANROPE(0, 39, 'FITNESS AND BXO', 6.5, '#B8B2AA', ' text-anchor="middle" letter-spacing="2.4"') : '') + `</g>`;
const neon = (id) => `<defs><filter id="${id}" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
const letreroNeon = (id, t, fs) => neon(id) + `<g filter="url(#${id})">` + ANTON(0, fs, t, fs, OR, ' letter-spacing="1"') + `</g>` + ANTON(0, fs, t, fs, '#FFD2A8', ' letter-spacing="1"');
// Disco de pesas centrado en (y, z), en un plano x = const
const disco = (L, x, y, z, r, col, k) => planoXen(L, x, y + r, z + r, r * 200, r * 200, `<circle cx="${r * 100}" cy="${r * 100}" r="${r * 100}" fill="${col}"/><circle cx="${r * 100}" cy="${r * 100}" r="${r * 100 - 5}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/><circle cx="${r * 100}" cy="${r * 100}" r="4" fill="#B9BEC4"/>`, k);

// El horario de clases de la semana, por categoría (data.js: clases y sesiones)
const COLOR_CAT = { baile: OR, cardio: '#FF3B2F', fuerza: AMB, calistenia: PAPEL };
const SEMANA = [
  ['calistenia', 'baile', 'calistenia', 'fuerza', 'fuerza', 'baile'], // lun: Calistenia Kids, Zumba, Calistenia Adulto, GRIT, GAP, Salsa y Bachata
  ['fuerza', 'cardio', 'cardio'], // mar: Body Pump, Power Jump, Body Combat
  ['calistenia', 'baile', 'calistenia', 'fuerza', 'fuerza', 'baile'], // mié: igual que el lunes, con Core en vez de GRIT
  ['fuerza', 'cardio', 'cardio'], // jue
  ['calistenia', 'baile', 'calistenia', 'fuerza', 'fuerza', 'baile'], // vie
  ['baile', 'fuerza'], // sáb: Zumba, Core
  [] // dom
];
// Lo que muestra la pantalla del kiosco: el sitio de Eleven 360
const SITIO = `<rect width="69" height="38" fill="#0B0B0B"/><rect width="69" height="4.5" fill="#161616"/>` + logo(8.5, 2.3, 0.07, false) +
  `<rect x="47" y="1.2" width="17" height="2.2" rx="1.1" fill="${OR}"/>` + ANTON(5, 17, '¿Y TÚ, YA ERES', 7.4, PAPEL) + ANTON(5, 26.5, 'ELEVEN?', 7.4, OR) +
  `<rect x="5" y="30" width="20" height="4.4" rx="2.2" fill="${OR}"/><rect x="27" y="30" width="18" height="4.4" rx="2.2" fill="none" stroke="#B8B2AA" stroke-width=".6"/>` +
  [0, 1, 2].map(i => `<rect x="${50 + i * 5.5}" y="${12 + i * 3}" width="4" height="${20 - i * 3}" rx="1" fill="${[OR, AMB, '#FF3B2F'][i]}" opacity=".85"/>`).join('');

export function salaEleven() {
  return montar(({ E, L, pj, camina, lugar, zona }) => {
    // Piso de caucho negro con sus motas, y los muros con el filete naranjo
    let motas = '';
    for (let i = 0; i < 900; i++) { const u = (i * 97) % (W * 100), v = (i * 61 + (i % 7) * 13) % (D * 100); motas += `<circle cx="${u}" cy="${v}" r="${1.4 + (i % 3) * 0.6}" fill="${i % 4 ? '#2B2B2B' : '#3A2A1E'}"/>`; }
    base(E, L, { W, D, HM, piso: '#1E1E1E', dibujo: motas, muroY: '#2A2623', muroX: '#211E1C', zocalo: TINTA, tope: '#3A3531', canto: TINTA, filete: OR });

    // ── Peso libre: racks sobre tarimas, barras con discos, el rack de mancuernas y el espejo ──
    L.planoY(0.25, 0.025, 2.2, 590, 170, `<rect width="590" height="170" fill="#7F93A0"/><rect width="590" height="170" fill="none" stroke="${TINTA}" stroke-width="8"/>` + [60, 250, 440].map(u => `<path d="M${u} 0L${u - 60} 170H${u - 30}L${u + 30} 0Z" fill="#FFFFFF" opacity=".12"/>`).join(''), -39);
    L.planoY(0.4, 0.03, HM - 0.08, 580, 30, ANTON(0, 24, '4.400 KG EN MANCUERNAS · 5.600 KG EN DISCOS', 25, OR, ' letter-spacing="1"'), -38);
    for (const x0 of [0.7, 3.5]) {
      L.caja(x0 - 0.2, 0.9, 0, 2.2, 1.8, 0.06, { t: '#5A4330', l: '#3A2A1E', r: '#2A1E14' }, -30);
      L.piso(x0 - 0.2, 0.9, `<rect x="55" width="110" height="180" fill="#9C7550"/>` + Array.from({ length: 5 }, (_, i) => `<path d="M${55 + i * 22} 0V180" stroke="#7E5C3C" stroke-width="2"/>`).join(''), -29.9, 0.062);
      for (const [dx, dy] of [[0.2, 1.1], [1.6, 1.1], [0.2, 2.3], [1.6, 2.3]]) L.caja(x0 + dx, dy, 0.06, 0.08, 0.08, 2.3, NARANJO, x0 + dx + dy + 0.5);
      L.linea([[x0 + 0.24, 1.14, 2.36], [x0 + 1.64, 1.14, 2.36], [x0 + 1.64, 2.34, 2.36], [x0 + 0.24, 2.34, 2.36], [x0 + 0.24, 1.14, 2.36]], '#CC5200', 3, x0 + 3.9);
      L.linea([[x0 - 0.35, 1.72, 1.45], [x0 + 2.15, 1.72, 1.45]], '#9AA0A6', 3.2, x0 + 3.0);
      const [c1, c2] = x0 < 2 ? [OR, '#1A1A1A'] : ['#1A1A1A', AMB];
      disco(L, x0 - 0.28, 1.72, 1.45, 0.24, c1, x0 + 3.1); disco(L, x0 - 0.18, 1.72, 1.45, 0.2, c2, x0 + 3.11);
      disco(L, x0 + 1.98, 1.72, 1.45, 0.2, c2, x0 + 3.12); disco(L, x0 + 2.08, 1.72, 1.45, 0.24, c1, x0 + 3.13);
    }
    pj('elLevanta', 1.6, 1.75, 0.06, 'd');
    L.caja(0.05, 3.2, 0, 0.62, 3.6, 0.82, NEGRO, 0.36 + 5.0);
    planoXen(L, 0.674, 6.8, 0.82, 360, 70, Array.from({ length: 2 }, (_, f) => Array.from({ length: 12 }, (_, i) => { const x = 18 + i * 29, y = 18 + f * 34, r = 7 + (i % 4); return `<circle cx="${x - 7}" cy="${y}" r="${r}" fill="${i % 3 ? '#2B2B2B' : OR}" stroke="#0B0B0B" stroke-width="1.2"/><circle cx="${x + 7}" cy="${y}" r="${r}" fill="${i % 3 ? '#2B2B2B' : OR}" stroke="#0B0B0B" stroke-width="1.2"/><rect x="${x - 7}" y="${y - 2}" width="14" height="4" fill="#9AA0A6"/>`; }).join('')).join(''), 5.5);
    // El árbol de discos
    L.cil(5.7, 4.2, 0, 0.1, 1.15, '#2B2B2B', '#1A1A1A');
    disco(L, 5.83, 4.2, 0.42, 0.22, '#1A1A1A', 10.2); disco(L, 5.85, 4.2, 0.86, 0.19, OR, 10.21);
    // Asesoría personalizada: un coach con la planificación en la tablet, junto a quien entrena
    pj('elCoach', 3.4, 4.5, 0, 'd');
    pj('atleta2', 4.5, 4.2, 0, 'i');
    zona('peso', { formas: [{ piso: [[0.1, 0.3], [6.2, 0.3], [6.2, 3.0], [0.1, 3.0]], alto: 2.5 }, { plano: [[0.25, 0.03, 0.5], [6.15, 0.03, 0.5], [6.15, 0.03, 2.55], [0.25, 0.03, 2.55]] }], lugar: [3.0, 1.8, 2.85], guia: [2.1, 3.5] });
    zona('asesoria', { formas: [{ piso: [[2.9, 3.8], [5.1, 3.8], [5.1, 5.0], [2.9, 5.0]], alto: 1.9 }], lugar: [3.95, 4.35, 2.3], guia: [4.0, 5.8] });

    // ── Zona fuerza: máquinas Life Fitness contra el muro, con sus torres de placas ──
    L.planoY(6.9, 0.03, 2.35, 300, 26, ANTON(0, 22, 'ZONA FUERZA · LIFE FITNESS', 22, PAPEL, ' letter-spacing="1"'), -38);
    const maquina = (x, k, quien) => {
      L.caja(x, 0.35, 0, 0.55, 0.4, 2.0, NEGRO, k);
      L.caja(x - 0.02, 0.33, 2.0, 0.59, 0.44, 0.06, NARANJO, k + 0.01);
      L.planoY(x + 0.1, 0.754, 1.75, 35, 110, Array.from({ length: 12 }, (_, i) => `<rect x="0" y="${i * 9}" width="35" height="7" rx="1" fill="${i < 3 ? '#3A3A3A' : '#1A1A1A'}" stroke="#555" stroke-width=".6"/>`).join(''), k + 0.02);
      L.linea([[x + 0.28, 0.75, 1.9], [x + 0.28, 1.25, 1.9], [x + 0.9, 1.4, 1.2]], '#9AA0A6', 1.6, k + 0.4);
      L.caja(x + 0.62, 1.15, 0, 0.12, 0.5, 0.42, NEGRO, k + 0.3);
      L.caja(x + 0.55, 1.1, 0.42, 0.55, 0.55, 0.08, NARANJO2, k + 0.35);
      L.caja(x + 0.55, 1.05, 0.5, 0.55, 0.1, 0.62, NARANJO2, k + 0.33);
      if (quien) pj(quien, x + 0.82, 1.38, 0.5, 'i', EA, k + 0.5);
    };
    maquina(7.1, 8.3, 'elMaquina1'); maquina(8.9, 10.1, null); maquina(10.7, 11.9, 'elMaquina2');
    zona('fuerza', { formas: [{ piso: [[6.9, 0.2], [11.8, 0.2], [11.8, 1.9], [6.9, 1.9]], alto: 2.1 }], lugar: [9.4, 1.0, 2.5], guia: [9.4, 2.7] });

    // ── Zona cardio: trotadoras frente al muro del manifiesto y bicicletas ──
    L.planoY(12.9, 0.03, 2.35, 690, 50, letreroNeon('el-neon-1', 'ESTO NO ES UN GIMNASIO, ESTO ES ELEVEN.', 40), -38);
    const trotadora = (x, quien) => {
      const k = x + 0.4 + 1.2;
      L.caja(x, 0.35, 0, 0.8, 1.7, 0.2, NEGRO, k);
      L.caja(x + 0.1, 0.62, 0.2, 0.6, 1.36, 0.015, { t: '#4A4A4A', l: '#383838', r: '#2A2A2A' }, k + 0.01);
      L.caja(x, 0.35, 0.2, 0.8, 0.26, 0.12, NARANJO2, k - 0.1);
      L.caja(x + 0.05, 0.4, 0.2, 0.06, 0.08, 1.0, GRIS, k - 0.5); L.caja(x + 0.69, 0.4, 0.2, 0.06, 0.08, 1.0, GRIS, k - 0.3);
      L.linea([[x + 0.08, 0.46, 1.02], [x + 0.08, 1.05, 0.98]], '#9AA0A6', 2.2, k - 0.05); L.linea([[x + 0.72, 0.46, 1.02], [x + 0.72, 1.05, 0.98]], '#9AA0A6', 2.2, k - 0.04);
      L.caja(x, 0.3, 1.18, 0.8, 0.26, 0.26, NEGRO, k - 0.2);
      L.planoY(x + 0.12, 0.564, 1.42, 56, 16, `<rect width="56" height="16" rx="2" fill="#141414"/><rect x="5" y="4" width="30" height="8" rx="1" fill="${OR}"/><rect x="38" y="4" width="13" height="8" rx="1" fill="${AMB}"/>`, k - 0.19);
      if (quien) pj(quien, x + 0.4, 1.32, 0.215, 'd', EA, k + 0.2);
    };
    trotadora(13.2, 'elCorre1'); trotadora(14.4, null); trotadora(15.6, 'elCorre2');
    const bici = (x, y, quien) => {
      const k = x + y + 0.4;
      L.caja(x - 0.24, y - 0.55, 0, 0.48, 0.1, 0.06, GRIS, k - 0.45); L.caja(x - 0.24, y + 0.42, 0, 0.48, 0.1, 0.06, GRIS, k - 0.35);
      disco(L, x + 0.04, y - 0.28, 0.3, 0.22, OR, k - 0.33);
      L.linea([[x, y - 0.5, 0.06], [x, y - 0.36, 0.96]], '#2B2B2B', 4.5, k - 0.3);
      L.linea([[x, y + 0.47, 0.06], [x, y + 0.14, 0.6]], '#2B2B2B', 4.5, k - 0.29);
      L.linea([[x, y - 0.3, 0.32], [x, y + 0.22, 0.4]], '#2B2B2B', 4.5, k - 0.28);
      L.caja(x - 0.07, y + 0.02, 0.6, 0.14, 0.28, 0.05, NEGRO, k - 0.1);
      L.caja(x - 0.22, y - 0.44, 0.96, 0.44, 0.08, 0.05, GRIS, k - 0.24);
      if (quien) pj(quien, x, y + 0.16, 0.63, 'd', EA, k + 0.1);
    };
    bici(17.7, 1.25, 'elBici1'); bici(18.9, 1.25, 'elBici2');
    zona('cardio', { formas: [{ piso: [[13.0, 0.2], [19.8, 0.2], [19.8, 2.2], [13.0, 2.2]], alto: 1.8 }, { plano: [[12.9, 0.03, 1.85], [19.8, 0.03, 1.85], [19.8, 0.03, 2.4], [12.9, 0.03, 2.4]] }], lugar: [16.3, 1.2, 2.35], guia: [14.4, 3.4] });

    // ── La sala de clases: vidrio, tarima y la clase de Power Jump en plena canción ──
    L.caja(12.6, 4.4, 0, 7.4, 5.6, 0.04, { t: '#3A2A1E', l: '#2A1E14', r: '#20160F' }, -30);
    L.piso(12.6, 4.4, Array.from({ length: 36 }, (_, i) => `<path d="M${i * 20 + 10} 0V560" stroke="#4A3626" stroke-width="2"/>`).join('') +
      [[180, 150, 70], [420, 330, 80], [300, 470, 60], [560, 200, 60]].map(([u, v, r]) => `<ellipse cx="${u}" cy="${v}" rx="${r}" ry="${r}" fill="rgba(255,102,0,.16)"/>`).join(''), -29.9, 0.042);
    vidrioY(L, 4.4, 12.6, 20, 2.3, '#141414', 0.05);
    vidrioX(L, 12.6, 4.4, 10.0, 2.3, '#141414', 0.05);
    L.planoY(13.0, 4.41, 2.2, 360, 44, ANTON(0, 30, 'SALA DE CLASES', 30, PAPEL, ' letter-spacing="1.5"') + MANROPE(212, 29, '240 m² · 10 clases incluidas', 12, OR2), 20.0);
    L.planoY(17.2, 4.41, 2.18, 190, 60, `<rect width="190" height="60" rx="6" fill="#141414" stroke="${OR}" stroke-width="2.5"/>` + ANTON(95, 31, 'POWER JUMP', 24, OR, ' text-anchor="middle" letter-spacing="1"') + MANROPE(95, 49, 'MARTES Y JUEVES · 19:30', 11, PAPEL, ' text-anchor="middle" letter-spacing=".5"'), 22.8);
    L.caja(18.3, 5.2, 0, 1.4, 1.4, 0.2, NEGRO, 18.9 + 5.8);
    L.caja(18.35, 4.7, 0, 0.45, 0.35, 1.35, { t: '#1A1A1A', l: '#141414', r: '#0B0B0B' }, 18.5 + 4.85 + 0.3);
    for (const z of [0.35, 0.95]) L.planoY(18.4, 5.054, z + 0.15, 30, 30, `<circle cx="15" cy="15" r="12" fill="#0B0B0B" stroke="#333" stroke-width="2"/><circle cx="15" cy="15" r="4" fill="#2A2A2A"/>`, 23.9);
    pj('instructor', 19.0, 5.9, 0.2, 'i');
    const trampolin = (x, y) => { L.cil(x, y, 0, 0.42, 0.22, '#141414', OR, x + y); L.cil(x, y, 0.22, 0.33, 0.01, '#2A2A2A', '#2A2A2A', x + y + 0.01); };
    for (const [id, x, y] of [['elClase2', 16.6, 6.2], ['elClase4', 18.6, 8.6], ['elClase1', 15.0, 7.0], ['elClase3', 17.0, 9.2], ['elClase5', 14.2, 9.4]]) {
      trampolin(x, y); pj(id, x, y, 0.23, 'd', EA, x + y + 0.5);
    }
    zona('clases', { formas: [{ piso: [[12.6, 4.4], [20, 4.4], [20, 10], [12.6, 10]], alto: 2.3 }], lugar: [16.3, 7.2, 2.6], guia: [12.1, 7.6] });

    // ── Calistenia: la estructura de barras, las paralelas y una clase de Calistenia Kids ──
    L.piso(7.2, 5.5, `<rect width="420" height="320" rx="10" fill="#141414" stroke="${OR}" stroke-width="5"/>`, -29);
    for (const [x, y] of [[7.6, 6.0], [11.2, 6.0]]) L.caja(x, y, 0, 0.1, 0.1, 2.25, NARANJO, x + y + 0.6);
    L.linea([[7.65, 6.05, 2.18], [11.25, 6.05, 2.18]], '#E0E0E0', 3.2, 17.9);
    for (const [x, y] of [[8.2, 7.6], [9.9, 7.6], [8.2, 8.2], [9.9, 8.2]]) L.caja(x, y, 0, 0.07, 0.07, 0.9, GRIS, x + y);
    L.linea([[8.23, 7.63, 0.9], [9.93, 7.63, 0.9]], '#E0E0E0', 2.6, 17.9); L.linea([[8.23, 8.23, 0.9], [9.93, 8.23, 0.9]], '#E0E0E0', 2.6, 18.5);
    pj('elNino', 10.6, 6.1, 1.47, 'd', EA * 0.72, 17.8);
    pj('elCoach2', 8.4, 6.9, 0, 'd');
    zona('calistenia', { formas: [{ piso: [[7.2, 5.5], [11.4, 5.5], [11.4, 8.7], [7.2, 8.7]], alto: 2.3 }], lugar: [9.3, 7.1, 2.6], guia: [8.1, 9.4] });

    // ── El muro de la izquierda: su lema en neón, el horario vivo y el Team Eleven ──
    L.planoX(10.8, HM - 0.06, 520, 40, letreroNeon('el-neon-2', '¿Y TÚ, YA ERES ELEVEN?', 34), -37);
    L.planoX(10.6, 2.1, 250, 150, `<rect width="250" height="150" rx="5" fill="#141414" stroke="#3A3531" stroke-width="3"/>` + ANTON(12, 26, 'HORARIO VIVO', 18, PAPEL, ' letter-spacing="1"') + `<circle cx="150" cy="19" r="4" fill="#37D67A"/>` + MANROPE(158, 23, 'Abierto', 9, '#B8B2AA') +
      ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => MANROPE(21 + i * 33, 44, d, 9, '#B8B2AA', ' text-anchor="middle"')).join('') +
      SEMANA.map((dia, i) => dia.map((c, j) => `<rect x="${8 + i * 33}" y="${50 + j * 16}" width="27" height="13" rx="3" fill="${COLOR_CAT[c]}" opacity=".92"/>`).join('')).join(''), -38);
    const team = ['elCoach', 'elCoach2', 'elRecepcion', 'instructor'];
    L.planoX(7.9, 2.1, 260, 100, ANTON(6, 22, 'TEAM ELEVEN', 20, PAPEL, ' letter-spacing="1"') +
      team.map((id, i) => { const cx = 34 + i * 62; return `<clipPath id="el-ret-${i}"><circle cx="${cx}" cy="62" r="24"/></clipPath><circle cx="${cx}" cy="62" r="26" fill="${OR}"/><circle cx="${cx}" cy="62" r="24" fill="#2A2623"/><g clip-path="url(#el-ret-${i})"><use href="#v-${id}" transform="translate(${cx - 24} ${62 - 20}) scale(1.45)"/></g>`; }).join(''), -38);
    zona('horario', { formas: [{ plano: [[0.03, 10.6, 0.6], [0.03, 8.1, 0.6], [0.03, 8.1, 2.1], [0.03, 10.6, 2.1]] }], lugar: [0.05, 9.35, 2.3], guia: [1.9, 9.6] });
    zona('team', { formas: [{ plano: [[0.03, 7.9, 1.1], [0.03, 5.3, 1.1], [0.03, 5.3, 2.1], [0.03, 7.9, 2.1]] }, { plano: [[0.03, 10.8, 2.14], [0.03, 5.6, 2.14], [0.03, 5.6, 2.54], [0.03, 10.8, 2.54]], soloToque: true }], lugar: [0.05, 6.6, 2.3], guia: [1.9, 7.4] });
    camina('elToalla', [[6.3, 8.0, 2.5], [6.3, 4.9, 2], [6.3, 9.6, 2], [6.3, 8.0]], { vel: 0.45 });

    // ── Cafetería: el mesón contra el muro, la máquina y quienes recargan ──
    L.caja(0.1, 10.7, 0, 0.9, 2.9, 1.0, NEGRO, 0.55 + 12.15);
    L.caja(0.08, 10.66, 1.0, 0.94, 2.98, 0.05, MADERA, 0.55 + 12.2);
    L.caja(0.2, 11.0, 1.05, 0.5, 0.45, 0.55, ACERO, 0.45 + 11.2 + 0.9);
    L.cil(0.5, 12.0, 1.05, 0.07, 0.26, OR, '#CC5200', 13.5); L.cil(0.5, 12.4, 1.05, 0.07, 0.26, PAPEL, '#CFC7B6', 13.9);
    L.planoX(13.5, 2.2, 250, 30, ANTON(0, 24, 'CAFETERÍA', 22, PAPEL, ' letter-spacing="1"') + MANROPE(120, 22, 'Recarga antes y después', 10, '#B8B2AA'), -37);
    banqueta(L, 1.6, 11.2); pj('elCafe', 1.6, 11.2, 0.72, 'i', EA, 1.6 + 11.2 + 0.3);
    banqueta(L, 1.6, 12.5);
    pj('elBatido', 2.5, 12.3, 0, 'i');
    zona('cafe', { formas: [{ piso: [[0.05, 10.6], [2.9, 10.6], [2.9, 13.7], [0.05, 13.7]], alto: 1.95 }], lugar: [1.3, 12.1, 2.35], guia: [3.4, 12.2] });

    // ── La tienda Identity Eleven: percheros con los polos en sus seis colores y la repisa de suplementos ──
    const colores = ['#B7A2E6', '#EEE5D1', '#4A3227', '#121212', '#A8C7EC', '#EAB6CA'];
    const perchero = (x, y) => {
      L.caja(x, y, 0, 0.06, 0.06, 1.55, GRIS, x + y); L.caja(x + 1.6, y, 0, 0.06, 0.06, 1.55, GRIS, x + y + 1.7);
      L.linea([[x + 0.03, y + 0.03, 1.52], [x + 1.63, y + 0.03, 1.52]], '#9AA0A6', 2.2, x + y + 1.0);
      L.planoY(x + 0.12, y + 0.04, 1.48, 150, 70, colores.map((c, i) => `<path d="M${i * 25 + 2} 6L${i * 25 + 8} 0H${i * 25 + 17}L${i * 25 + 23} 6L${i * 25 + 21} 12V66H${i * 25 + 4}V12Z" fill="${c}" stroke="#0B0B0B" stroke-width="1.2"/>`).join(''), x + y + 1.05);
    };
    perchero(5.6, 11.0); perchero(5.6, 12.6);
    L.caja(8.1, 10.4, 0, 0.5, 1.6, 1.6, NEGRO, 8.35 + 11.2 + 0.2);
    planoXen(L, 8.604, 12.0, 1.55, 160, 150, [18, 60, 102].map(y => `<rect x="4" y="${y + 30}" width="152" height="4" fill="#5A5A5A"/>`).join('') + Array.from({ length: 12 }, (_, i) => `<rect x="${10 + (i % 4) * 38}" y="${24 + Math.floor(i / 4) * 42}" width="26" height="30" rx="4" fill="${[OR, '#141414', PAPEL, AMB][i % 4]}" stroke="#0B0B0B" stroke-width="1.2"/>`).join(''), 20.1);
    L.planoY(5.7, 10.98, 2.1, 250, 38, CHAKRA(0, 28, 'IDENTITY ELEVEN', 26, PAPEL, ' letter-spacing="2"'), 16.9);
    pj('elCompra', 7.1, 11.85, 0, 'i');
    zona('tienda', { formas: [{ piso: [[5.4, 10.3], [8.7, 10.3], [8.7, 13.0], [5.4, 13.0]], alto: 2.15 }], lugar: [7.0, 11.6, 2.45], guia: [7.1, 9.9] });

    // ── El acceso: la recepción, el torniquete y el lector de huella de siempre ──
    L.caja(15.6, 11.2, 0, 2.6, 0.62, 1.02, NEGRO, 16.9 + 11.5 + 0.5);
    L.caja(15.55, 11.15, 1.02, 2.7, 0.72, 0.05, { t: '#2A2A2A', l: OR, r: '#CC5200' }, 16.9 + 11.5 + 0.52);
    L.planoY(15.9, 11.824, 0.92, 200, 62, logo(100, 26, 0.95), 16.9 + 11.5 + 0.51);
    pj('elRecepcion', 16.9, 10.75, 0, 'i');
    L.caja(13.5, 11.3, 0, 0.32, 0.62, 0.95, ACERO, 13.66 + 11.61 + 0.3);
    L.linea([[13.82, 11.6, 0.82], [14.35, 11.72, 0.82]], '#9AA0A6', 3, 25.7);
    L.caja(14.62, 11.62, 0, 0.1, 0.1, 0.62, NEGRO, 14.67 + 11.67 + 0.3);
    L.caja(14.5, 11.6, 0.62, 0.34, 0.14, 0.38, { t: '#1A1A1A', l: '#141414', r: '#0B0B0B' }, 26.75);
    L.planoY(14.53, 11.744, 0.97, 28, 32, `<rect width="28" height="32" rx="3" fill="#0B0B0B" stroke="${OR}" stroke-width="1.2"/><circle cx="14" cy="14" r="10" fill="rgba(55,214,122,.2)"/>` +
      [2.5, 4.8, 7.1].map(r => `<path d="M${14 - r} ${16.5}A${r} ${r * 1.25} 0 0 1 ${14 + r} ${16.5}" fill="none" stroke="#37D67A" stroke-width="1.3" stroke-linecap="round"/>`).join('') + `<path d="M14 11V19" stroke="#37D67A" stroke-width="1.3" stroke-linecap="round"/><circle cx="14" cy="27" r="1.8" fill="#37D67A"/>`, 26.8);
    pj('elSocio', 14.5, 12.4, 0, 'd');
    L.piso(16.7, 12.7, `<rect width="170" height="80" rx="8" fill="#141414"/><rect x="8" y="8" width="154" height="64" rx="5" fill="none" stroke="${OR}" stroke-width="2.4"/>` + logo(85, 38, 0.9, false) + CHAKRA(85, 66, 'ELEVEN', 14, PAPEL, ' text-anchor="middle" letter-spacing="3"'), -52);
    // El trofeo del Campeonato de Calistenia (4ª edición): el título se quedó en casa
    L.caja(18.75, 10.75, 0, 0.5, 0.5, 0.95, NEGRO, 19.0 + 11.0 + 0.3);
    L.cil(19.0, 11.0, 0.95, 0.1, 0.1, '#C9A227', '#A8841E', 30.4); L.cil(19.0, 11.0, 1.05, 0.04, 0.15, '#C9A227', '#A8841E', 30.41); L.cil(19.0, 11.0, 1.2, 0.17, 0.22, '#E0B341', '#C9A227', 30.42);
    L.planoY(18.77, 11.254, 0.82, 46, 26, MANROPE(23, 11, 'CALISTENIA', 6.8, OR2, ' text-anchor="middle"') + MANROPE(23, 21, '4ª EDICIÓN', 6.8, PAPEL, ' text-anchor="middle"'), 30.43);
    plantaAlta(L, 19.55, 12.7, 1.0);
    zona('huella', { formas: [{ piso: [[13.4, 11.2], [15.0, 11.2], [15.0, 12.8], [13.4, 12.8]], alto: 1.9 }], lugar: [14.3, 11.8, 2.2] });
    zona('recepcion', { formas: [{ piso: [[15.4, 10.4], [18.4, 10.4], [18.4, 12.0], [15.4, 12.0]], alto: 2.0 }], lugar: [16.9, 11.5, 2.3], guia: [15.9, 12.9] });
    zona('trofeo', { formas: [{ piso: [[18.65, 10.65], [19.35, 10.65], [19.35, 11.35], [18.65, 11.35]], alto: 1.5 }], lugar: [19.0, 11.0, 1.8] });
    lugar('entrada', 17.5, 13.1, 0.9);
    camina('elGuia', [[15.2, 12.9, 3], [12.2, 10.6, 2], [15.2, 12.9]], { vel: 0.45 });

    // ── El rincón de BiPlot: Lupe, que hizo el diagnóstico y cuenta la propuesta ──
    kioscoBiPlot({ L, pj, zona }, 10.2, 12.45, 'lupe', null, SITIO);

    return { id: 'eleven', ancho: W, fondo: D };
  });
}

export const eleven = salaEleven;
