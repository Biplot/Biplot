// La sala de ventas de BiPlot: el local «Se arrienda · Tu proyecto aquí» de la calle principal, por dentro. Como la sala de
// ventas de una inmobiliaria: la maqueta del barrio con el sitio libre, un local piloto armado adentro, la lista de
// precios, cómo avanza un proyecto (y cómo cambia el local con él), la promesa por escrito, la ventana a los vecinos, la
// sala de espera y, al fondo, la mesa de Lupe, donde se agenda el diagnóstico. Plotty recibe en la entrada y guía el
// recorrido; Atlas flota sobre la maqueta y proyecta el mapa: no tiene una fase, ve las diez a la vez. Todo lo que dice sale del sitio y de datos.js: el diagnóstico desde $0, la respuesta en menos de 48 horas
// hábiles, las diez fases con alguien a cargo, la medición a los 30, 60 y 90 días y el local y la sala de cada proyecto.
// El coral es sólo para «Agenda tu diagnóstico» (y el punto final del isotipo).
import { montar, base, registrar, planoXen, silla, plantaAlta, txt, mono, PELO, Z, PIEL, EA, r1 } from './comun.mjs';
import * as S from '../locales.mjs';
import * as T from '../plantillas.mjs';

// La paleta de BiPlot: su azul, el cian, la menta del local libre, el papel y, sólo para agendar, el coral
const AZUL = '#0E2A47', NOCHE = '#0B1726', CIAN = '#17C3B2', MENTA = '#7FD8CF', ACERO = '#35679A', PAPEL = '#FBFAF7', NIEBLA = '#F2F4F7';
const CEJA = '#0B6F66', GRIS = '#C9D4DF', SUAVE = '#5B6776', CORAL = '#FF6B4A';
const BLANCO = { t: '#FFFFFF', l: '#EEF1F3', r: '#DCE2E7' };
const MARINO = { t: '#17446F', l: '#0F3558', r: '#0B2B45' };
const ROBLE = { t: '#D2B48C', l: '#B8986E', r: '#9C7F57' };
const TELA = { t: '#3F6F9E', l: '#2F5A86', r: '#244A70' };
// Los colores de los vecinos (su acento, el de datos.js) y el de «tu marca» (el de la plantilla básica)
const VECINOS = [['NU HOME', '#E0B341', NOCHE], ['FUNDOS', '#6FAF6B', NOCHE], ['HARU', '#E0524A', '#FFFFFF'], ['ELEVEN', '#17C3B2', NOCHE], ['RUMBO', '#3E9C95', '#FFFFFF']];
const TU_MARCA = '#8E6BB8';

// El isotipo de BiPlot (la línea con su punto final coral), de 22 × 22
const ISOTIPO = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect width="22" height="22" rx="5" fill="${AZUL}" stroke="${CIAN}" stroke-width="1.6"/>` +
  `<path d="M5 5V17H18" stroke="#3F6DA0" stroke-width="1.4" fill="none"/><circle cx="7" cy="14" r="1.8" fill="${CIAN}"/><circle cx="11" cy="11" r="1.8" fill="${CIAN}"/><circle cx="16.5" cy="6.5" r="2.2" fill="${CORAL}"/></g>`;
// El orbe de Atlas (vidrio, anillos, un globo de líneas y su corazón de plasma), de radio r
const ORBE = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="rgba(127,216,207,.16)" stroke="${MENTA}" stroke-width="${r1(r * 0.09)}"/>` +
  `<ellipse rx="${r}" ry="${r1(r * 0.36)}" fill="none" stroke="${MENTA}" stroke-width="${r1(r * 0.06)}" opacity=".8"/><ellipse rx="${r1(r * 0.42)}" ry="${r}" fill="none" stroke="${MENTA}" stroke-width="${r1(r * 0.06)}" opacity=".6"/>` +
  `<ellipse rx="${r1(r * 1.35)}" ry="${r1(r * 0.3)}" fill="none" stroke="${CIAN}" stroke-width="${r1(r * 0.07)}" transform="rotate(-18)"/><circle r="${r1(r * 0.3)}" fill="${CIAN}"/><circle r="${r1(r * 0.14)}" fill="#DDF4F1"/></g>`;
// Texto en varias líneas
const lineas = (x, y, ls, fs, color, alto, f = txt, extra = '') => ls.map((l, i) => f(x, r1(y + i * alto), l, fs, color, extra)).join('');
const visto = (x, y, s = 1) => `<path d="M${x} ${y}l${r1(4 * s)} ${r1(4 * s)}l${r1(8 * s)} ${r1(-9 * s)}" fill="none" stroke="${CIAN}" stroke-width="${r1(2.6 * s)}" stroke-linecap="round" stroke-linejoin="round"/>`;

// ───────── Lo que es una imagen (se abre de frente, y en la sala va en el muro, más chico) ─────────
// Un local de la calle visto de frente, en el estado de su fase: se arrienda, en diagnóstico, en obra o abierto
function fachada(x, y, estado) {
  const w = 170, h = 104;
  let s = `<g transform="translate(${x} ${y})"><rect x="0" y="${h - 6}" width="${w}" height="6" fill="#2A5A88"/><rect x="8" y="8" width="${w - 16}" height="${h - 14}" fill="#15395E"/>`;
  s += `<rect x="8" y="2" width="${w - 16}" height="10" fill="#0B2B45"/>`;
  if (estado === 'arriendo') {
    s += `<rect x="20" y="24" width="${w - 40}" height="${h - 38}" rx="4" fill="rgba(127,216,207,.08)" stroke="${MENTA}" stroke-width="2.4" stroke-dasharray="8 6"/>` +
      mono(w / 2, 58, 'SE ARRIENDA', 13, MENTA, ' text-anchor="middle" letter-spacing="1"');
  } else if (estado === 'diagnostico') {
    s += `<rect x="18" y="22" width="${w - 36}" height="${h - 34}" fill="#3A4A5C"/>` +
      [[26, 30, '#F2C14E'], [48, 30, '#F5A3B4'], [70, 30, MENTA], [37, 50, '#F2C14E'], [59, 50, '#F5A3B4']].map(([a, b, c]) => `<rect x="${a}" y="${b}" width="16" height="16" fill="${c}"/>`).join('') +
      `<rect x="100" y="30" width="52" height="30" rx="3" fill="#F4ECD8"/>` + mono(126, 49, 'PRONTO', 9, AZUL, ' text-anchor="middle"') +
      `<path d="M18 ${h - 16}H${w - 18}" stroke="#E0B341" stroke-width="3" stroke-dasharray="9 6"/>`;
  } else if (estado === 'obra') {
    s += `<rect x="18" y="22" width="${w - 36}" height="${h - 34}" fill="#3A4A5C"/><rect x="28" y="30" width="62" height="36" rx="2" fill="#1E5C8A"/>` +
      `<g fill="none" stroke="#DDF4F1" stroke-width="1.4"><rect x="34" y="38" width="20" height="10"/><rect x="60" y="38" width="22" height="10"/><path d="M34 56H82"/></g>` +
      [24, 94, 146].map((a) => `<path d="M${a} 18V${h - 8}" stroke="#B9C8D8" stroke-width="2.4"/>`).join('') + `<path d="M18 74H152" stroke="#8B6A4E" stroke-width="5"/>` +
      `<rect x="98" y="30" width="56" height="22" rx="3" fill="#E0B341" stroke="${NOCHE}" stroke-width="1.2"/>` + mono(126, 45, 'EN OBRA', 9, NOCHE, ' text-anchor="middle"');
  } else {
    s += `<rect x="18" y="22" width="${w - 36}" height="${h - 34}" fill="#2F4459"/><rect x="26" y="28" width="${w - 52}" height="22" rx="4" fill="${TU_MARCA}"/>` +
      txt(w / 2, 44, 'TU MARCA', 13, '#FFFFFF', ' text-anchor="middle" letter-spacing="1"') +
      `<rect x="30" y="58" width="50" height="28" fill="rgba(214,236,240,.55)"/><rect x="92" y="58" width="48" height="28" rx="3" fill="#0B2B45"/>` +
      [64, 71, 78].map((b, i) => `<rect x="98" y="${b}" width="${[30, 22, 26][i]}" height="3.4" rx="1.7" fill="${MENTA}"/>`).join('') +
      `<rect x="${w - 58}" y="${h - 30}" width="44" height="18" rx="4" fill="${AZUL}" stroke="${CIAN}" stroke-width="1.4"/>` + mono(w - 36, h - 18, 'DÍA 90', 7.5, MENTA, ' text-anchor="middle"');
  }
  return s + '</g>';
}
// Así avanza tu proyecto: cuatro etapas, diez fases y el local de la calle en cada una (1200 × 400)
const ETAPAS = [
  ['01', 'Diagnóstico', 'E0 · E1', 'diagnostico', ['Mapa de tu proceso, dónde se', 'pierde tiempo y la línea base.']],
  ['02', 'Diseño a la medida', 'E2 · E3 · E4', 'obra', ['El flujo ideal, dibujado', 'para tu operación.']],
  ['03', 'Construcción', 'E5 · E6', 'obra', ['Tus herramientas conectadas', 'y funcionando.']],
  ['04', 'Puesta en marcha', 'E7 · E8 · E9', 'abierto', ['La medición del día 30, 60 y 90,', 'contra tu línea base.']]
];
const AVANCE_A = 1200, AVANCE_H = 452;
const AVANCE = `<rect width="${AVANCE_A}" height="${AVANCE_H}" rx="14" fill="${AZUL}"/><rect x="10" y="10" width="${AVANCE_A - 20}" height="${AVANCE_H - 20}" rx="9" fill="none" stroke="rgba(127,216,207,.3)" stroke-width="1.5"/>` +
  mono(44, 58, 'ASÍ AVANZA TU PROYECTO', 22, MENTA, ' letter-spacing="3"') +
  txt(AVANCE_A - 44, 58, 'Cuatro etapas, diez fases, alguien a cargo de cada una', 19, GRIS, ' text-anchor="end" font-weight="500"') +
  ETAPAS.map(([n, nombre, cod, estado, ent], i) => {
    const x = 44 + i * 284;
    return (i < 3 ? `<path d="M${x + 58} 106H${x + 272}" stroke="${CIAN}" stroke-width="2.4" stroke-dasharray="3 9" stroke-linecap="round"/><path d="M${x + 266} 100L${x + 274} 106L${x + 266} 112" fill="none" stroke="${CIAN}" stroke-width="2.4" stroke-linecap="round"/>` : '') +
      `<circle cx="${x + 24}" cy="106" r="22" fill="${CIAN}"/>` + mono(x + 24, 112, n, 17, NOCHE, ' text-anchor="middle"') +
      txt(x, 160, nombre, 24, '#FFFFFF') + mono(x, 186, cod, 15, MENTA, ' letter-spacing="1"') +
      fachada(x, 200, estado) +
      mono(x, 334, 'ENTREGABLE', 12, MENTA, ' letter-spacing="2"') + lineas(x, 358, ent, 16.5, '#E6ECF2', 22, txt, ' font-weight="500"');
  }).join('') +
  // Atlas no tiene una fase: las ve todas a la vez, por encima de las cuatro etapas
  `<rect x="44" y="392" width="${AVANCE_A - 88}" height="42" rx="21" fill="rgba(127,216,207,.1)" stroke="${MENTA}" stroke-width="1.6" stroke-dasharray="6 5"/>` +
  ORBE(72, 413, 13) + mono(96, 419, 'ATLAS · 360°', 14, MENTA, ' letter-spacing="2"') +
  txt(236, 419, 'No tiene una fase: ve las diez a la vez. Recorre tu proceso y marca dónde se pierden las horas.', 16.5, '#FFFFFF', ' font-weight="500"');

// La lista de precios, la del sitio (1000 × 440)
const PLANES = [
  ['DIAGNÓSTICO', 'Desde $0', '/ primera sesión', ['Revisión de tu proceso actual', 'Mapa de dónde se pierde tiempo,|con la línea base', 'Propuesta de alcance, sin|compromiso']],
  ['PROYECTO A MEDIDA', 'Cotizado', '/ según alcance', ['Automatización diseñada para|tu proceso', 'Integración con tus|herramientas actuales', 'Medición a los 30, 60 y 90 días', 'Tu local y tu sala en BiPlot HQ']],
  ['SOPORTE CONTINUO', 'Mensual', '/ desde el mes 2', ['Ajustes cuando tu proceso|cambia', 'Monitoreo de las|automatizaciones activas', 'Canal directo de soporte']]
];
const PRECIOS_A = 1000, PRECIOS_H = 470;
const PRECIOS = `<rect width="${PRECIOS_A}" height="${PRECIOS_H}" rx="12" fill="${PAPEL}"/><rect x="5" y="5" width="${PRECIOS_A - 10}" height="${PRECIOS_H - 10}" rx="9" fill="none" stroke="${AZUL}" stroke-width="10"/>` +
  `<path d="M5 14A9 9 0 0 1 14 5H${PRECIOS_A - 14}A9 9 0 0 1 ${PRECIOS_A - 5} 14V78H5Z" fill="${AZUL}"/>` +
  mono(40, 52, 'LISTA DE PRECIOS', 24, MENTA, ' letter-spacing="4"') + txt(PRECIOS_A - 40, 52, 'Sin letra chica', 21, GRIS, ' text-anchor="end" font-weight="500"') +
  PLANES.map(([cab, precio, sub, items], i) => {
    const x = 40 + i * 316;
    let y = 246, s = (i ? `<path d="M${x - 22} 104V414" stroke="#E4E0D8" stroke-width="2"/>` : '') +
      mono(x, 118, cab, 14, CEJA, ' letter-spacing="1.5"') + txt(x, 170, precio, 42, AZUL) + txt(x, 198, sub, 17, SUAVE, ' font-weight="500"') + `<path d="M${x} 214H${x + 270}" stroke="#E4E0D8" stroke-width="2"/>`;
    for (const it of items) { const ls = it.split('|'); s += visto(x, y - 13, 0.9) + lineas(x + 22, y, ls, 16.5, '#2F3A46', 21, txt, ' font-weight="500"'); y += ls.length * 21 + 13; }
    return s;
  }).join('') +
  txt(40, 446, 'El diagnóstico define el alcance real antes de cualquier número.', 17, SUAVE, ' font-weight="500"');

// La promesa, por escrito: siete compromisos, todos del sitio (1000 × 380)
const CLAUSULAS = [
  ['PRIMERO', ['Responderte en menos de', '48 horas hábiles.']],
  ['SEGUNDO', ['Que hables siempre con una persona,', 'con su nombre y su rol.']],
  ['TERCERO', ['Decirte de frente si no hay algo', 'real que automatizar.']],
  ['CUARTO', ['Apoyarnos en las herramientas', 'que tu equipo ya conoce.']],
  ['QUINTO', ['Medir a los 30, 60 y 90 días contra tu', 'línea base. Si no bajó, se dice.']],
  ['SEXTO', ['Quedarnos después de la entrega.']],
  ['SÉPTIMO', ['Mostrar tu empresa en la oficina', 'sólo si tú quieres.']]
];
const PROMESA_A = 1000, PROMESA_H = 380;
const PROMESA = `<rect width="${PROMESA_A}" height="${PROMESA_H}" fill="#8B6A4E"/><rect x="12" y="12" width="${PROMESA_A - 24}" height="${PROMESA_H - 24}" fill="${PAPEL}"/>` +
  `<rect x="28" y="28" width="${PROMESA_A - 56}" height="${PROMESA_H - 56}" fill="none" stroke="${AZUL}" stroke-width="1.6"/><rect x="34" y="34" width="${PROMESA_A - 68}" height="${PROMESA_H - 68}" fill="none" stroke="${AZUL}" stroke-width=".8"/>` +
  txt(PROMESA_A / 2, 82, 'P R O M E S A', 34, AZUL, ' text-anchor="middle"') +
  txt(PROMESA_A / 2, 110, 'BiPlot se compromete, con quien trabaje con nosotros, a lo siguiente:', 17, SUAVE, ' text-anchor="middle" font-weight="500"') +
  CLAUSULAS.map(([n, ls], i) => {
    const col = i < 4 ? 0 : 1, fila = i < 4 ? i : i - 4, x = 64 + col * 470, y = 150 + fila * 52;
    return mono(x, y, n + '.', 12.5, CEJA, ' letter-spacing="1"') + lineas(x + 92, y, ls, 16, '#2F3A46', 20, txt, ' font-weight="500"');
  }).join('') +
  `<path d="M620 306Q640 284 656 302T690 294T724 304T760 288" fill="none" stroke="${AZUL}" stroke-width="2.4" stroke-linecap="round"/><path d="M600 314H880" stroke="${AZUL}" stroke-width="1.2"/>` +
  ISOTIPO(894, 290, 1.2) + txt(600, 334, 'BiPlot', 15, AZUL);

// La ventana a la calle: los vecinos, cada uno con su marca en el techo, al atardecer (1200 × 420)
const VENTANA_A = 1200, VENTANA_H = 420;
const VENTANA = (() => {
  let s = `<defs><linearGradient id="vt-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B3F66"/><stop offset=".62" stop-color="#4E7BA6"/><stop offset="1" stop-color="#F2C9A0"/></linearGradient></defs>` +
    `<rect width="${VENTANA_A}" height="${VENTANA_H}" fill="url(#vt-cielo)"/>`;
  s += [[90, 40], [300, 70], [520, 30], [760, 58], [980, 36], [1120, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#FFFFFF" opacity=".7"/>`).join('');
  // Atrás, BiPlot HQ con sus ventanas encendidas
  s += `<rect x="470" y="96" width="260" height="190" fill="#12375E"/><rect x="470" y="88" width="260" height="10" fill="${CIAN}"/>` +
    Array.from({ length: 18 }, (_, i) => `<rect x="${488 + (i % 6) * 40}" y="${112 + Math.floor(i / 6) * 34}" width="24" height="18" fill="${i % 4 ? '#F2C14E' : '#5B86B0'}" opacity=".85"/>`).join('') +
    txt(600, 82, 'BIPLOT HQ', 18, '#FFFFFF', ' text-anchor="middle" letter-spacing="3"');
  // Los locales de la calle principal, cada uno con su letrero
  VECINOS.forEach(([n, c, t], i) => {
    const x = 34 + i * 232, y = 196;
    s += `<rect x="${x}" y="${y}" width="210" height="140" fill="#15395E"/><rect x="${x - 6}" y="${y - 20}" width="222" height="30" rx="3" fill="${c}"/>` +
      txt(x + 105, y + 1, n, 17, t, ' text-anchor="middle" letter-spacing="2"') +
      `<path d="M${x} ${y + 14}H${x + 210}L${x + 200} ${y + 34}H${x + 10}Z" fill="${c}" opacity=".85"/>` +
      Array.from({ length: 6 }, (_, k) => `<path d="M${x + 12 + k * 33} ${y + 14}L${x + 20 + k * 33} ${y + 34}" stroke="#FFFFFF" stroke-width="6" opacity=".35"/>`).join('') +
      `<rect x="${x + 16}" y="${y + 50}" width="110" height="74" fill="#F2C14E" opacity=".85"/><rect x="${x + 140}" y="${y + 50}" width="54" height="90" fill="#0B2B45"/>` +
      `<circle cx="${x + 52}" cy="${y + 96}" r="11" fill="#0B2B45" opacity=".55"/><rect x="${x + 42}" y="${y + 104}" width="20" height="20" rx="8" fill="#0B2B45" opacity=".55"/>`;
  });
  // La vereda, los árboles, los faroles y la calzada
  s += `<rect y="336" width="${VENTANA_A}" height="18" fill="#2A5A88"/><rect y="354" width="${VENTANA_A}" height="${VENTANA_H - 354}" fill="#1D4A72"/>` +
    `<path d="M0 388H${VENTANA_A}" stroke="#F2F4F7" stroke-width="3" stroke-dasharray="26 22" opacity=".6"/>` +
    [250, 482, 714, 946].map((x) => `<path d="M${x} 336V296" stroke="#4A3F2E" stroke-width="4"/><circle cx="${x}" cy="284" r="20" fill="#168A86"/><circle cx="${x - 9}" cy="292" r="13" fill="#0A8A7E"/>`).join('') +
    [140, 1060].map((x) => `<path d="M${x} 336V250" stroke="#0B1726" stroke-width="3.4"/><path d="M${x} 250H${x + 18}" stroke="#0B1726" stroke-width="3"/><ellipse cx="${x + 18}" cy="256" rx="8" ry="4" fill="#FFF1CF"/><ellipse cx="${x + 18}" cy="268" rx="26" ry="10" fill="#FFF1CF" opacity=".25"/>`).join('');
  // El marco de la ventana y el reflejo del vidrio
  s += `<path d="M90 0L30 ${VENTANA_H}H70L130 0ZM700 0L640 ${VENTANA_H}H660L720 0Z" fill="#FFFFFF" opacity=".12"/>` +
    [0, 251, 483, 715, 947, VENTANA_A - 8].map((u) => `<rect x="${u}" width="8" height="${VENTANA_H}" fill="${AZUL}"/>`).join('') + `<rect width="${VENTANA_A}" height="8" fill="${AZUL}"/><rect y="${VENTANA_H - 8}" width="${VENTANA_A}" height="8" fill="${AZUL}"/>`;
  return s;
})();

// Un dibujo grande, escalado para su lugar en el muro (a de ancho, en unidades del plano)
const enMuro = (svg, ancho, a) => `<g transform="scale(${(a / ancho).toFixed(4)})">${svg}</g>`;

// ───────── Quienes vienen a la sala de ventas (ilustraciones sin nombre) ─────────
const JEAN = ['#35557A', '#27425F'], OSCURO = ['#2A3038', '#1F242B'];
registrar({
  vtElla: { piel: PIEL.morena, pelo: PELO.negro, peinado: 'melena', cuerpo: 'fino', arriba: 'blazer', arribaCol: ['#2A7C78', '#1F5F5C', ['#F2F4F7', '#E0B341']], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.negras, brazoD: 'senala', aros: '#E0B341', ojos: 'grandes' },
  vtEl: { piel: PIEL.clara, pelo: PELO.castano, peinado: 'peinado', arriba: 'cardigan', arribaCol: ['#8B7355', '#6E5A42', ['#F2F4F7']], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.cafe, brazoD: 'cadera', lentes: 'rectos', barba: '#4A3222' },
  vtPiloto: { piel: PIEL.trigo, pelo: PELO.rojizo, peinado: 'cola', lazo: MENTA, cuerpo: 'fino', arriba: 'chaqueta', arribaCol: ['#E0B341', '#C49A2E', ['#F2F4F7', null]], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, brazoD: 'saluda', ojos: 'felices', boca: 'dientes' },
  vtPrecios: { piel: PIEL.oscura, pelo: PELO.negro, peinado: 'corto', arriba: 'blazer', arribaCol: ['#4A5260', '#39404C', ['#F2F4F7', '#35679A']], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.negras, brazoD: 'sostiene', objeto: 'taza', lentes: 'redondos' },
  vtEspera1: { piel: PIEL.clara, pelo: PELO.canoso, peinado: 'rizado', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#C9824E', '#A8683A', ['#F2F4F7']], abajo: 'pantalon', abajoCol: ['#3A4A5A', '#2A3848'], zapatos: Z.cafe, piernas: 'sentado', brazoD: 'sostiene', objeto: 'libreta', brazoI: 'frente', lentes: 'redondos' },
  vtEspera2: { piel: PIEL.media, pelo: PELO.negro, peinado: 'corto', arriba: 'polera', arribaCol: ['#35679A', '#27507C'], manga: 'larga', abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'sostiene', objeto: 'celular', brazoI: 'frente', barba: '#1A1613' },
  vtCliente: { piel: PIEL.trigo, pelo: PELO.cafe, peinado: 'largo', cuerpo: 'fino', arriba: 'blazer', arribaCol: ['#8E6BB8', '#6E4E96', ['#F2F4F7', null]], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.negras, piernas: 'sentado', brazoD: 'frente', brazoI: 'sostiene', objetoI: 'carpeta', ojos: 'grandes' }
});

const W = 18, D = 13, HM = 2.6;
// El piloto: un local de la calle, armado adentro (4,6 × 4,3 baldosas), contra el muro de la izquierda
const PX = 0.25, PY = 8.45;

export function salaVentas() {
  return montar(({ E, L, pj, camina, lugar, zona }) => {
    // Piso de cemento pulido en paños grandes, muros blancos con el filete cian
    let panos = '';
    for (let i = 1; i < 9; i++) panos += `<path d="M${i * 200} 0V1300" stroke="#DCE3E8" stroke-width="3"/>`;
    for (let j = 1; j < 7; j++) panos += `<path d="M0 ${j * 200}H1800" stroke="#DCE3E8" stroke-width="3"/>`;
    base(E, L, { W, D, HM, piso: '#EDF1F3', dibujo: panos, muroY: '#F7F8F6', muroX: '#EDF1F0', zocalo: AZUL, tope: '#D6DCE3', canto: '#C9D1D9', filete: CIAN });
    // Al medio del piso, el sitio libre: el mismo contorno punteado del local de la calle
    L.piso(6.3, 8.2, `<rect x="6" y="6" width="368" height="288" rx="14" fill="rgba(127,216,207,.10)" stroke="${MENTA}" stroke-width="6" stroke-dasharray="18 13"/>` +
      txt(190, 138, 'TU PROYECTO AQUÍ', 34, '#5FBDB3', ' text-anchor="middle" letter-spacing="2"') + mono(190, 182, 'ESTE ESPACIO ESPERA EL PRÓXIMO', 15, '#5FBDB3', ' text-anchor="middle" letter-spacing="1.5"'), -54);

    // ── Así avanza tu proyecto: el mural de las cuatro etapas, con el local de la calle en cada una ──
    L.planoY(0.7, 0.02, 2.5, 580, 218, enMuro(AVANCE, AVANCE_A, 580), -39);
    zona('avance', { formas: [{ plano: [[0.7, 0.03, 0.32], [6.5, 0.03, 0.32], [6.5, 0.03, 2.5], [0.7, 0.03, 2.5]] }], lugar: [3.6, 0.1, 2.66], guia: [3.4, 2.3],
      frente: { svg: AVANCE, ancho: AVANCE_A, alto: AVANCE_H, fondo: AZUL } });

    // ── La lista de precios, en el muro del fondo ──
    L.planoY(7.1, 0.02, 2.46, 440, 207, enMuro(PRECIOS, PRECIOS_A, 440), -39);
    pj('vtPrecios', 9.9, 1.55, 0, 'i');
    zona('precios', { formas: [{ plano: [[7.1, 0.03, 0.39], [11.5, 0.03, 0.39], [11.5, 0.03, 2.46], [7.1, 0.03, 2.46]] }], lugar: [9.3, 0.1, 2.6], guia: [8.1, 2.1],
      frente: { svg: PRECIOS, ancho: PRECIOS_A, alto: PRECIOS_H, fondo: AZUL } });

    // ── La ventana a la calle: los vecinos ──
    L.planoY(12.2, 0.02, 2.44, 540, 189, enMuro(VENTANA, VENTANA_A, 540), -39);
    L.caja(12.1, 0.0, 0.5, 5.6, 0.2, 0.05, BLANCO, 12.4);
    plantaAlta(L, 17.5, 0.7, 1.0, ['#FFFFFF', '#DCE2E7']);
    zona('vecinos', { formas: [{ plano: [[12.2, 0.03, 0.55], [17.6, 0.03, 0.55], [17.6, 0.03, 2.44], [12.2, 0.03, 2.44]] }], lugar: [14.9, 0.1, 2.62], guia: [12.3, 2.9],
      frente: { svg: VENTANA, ancho: VENTANA_A, alto: VENTANA_H, fondo: '#1B3F66' } });

    // ── La promesa, enmarcada en el muro de la izquierda, con la consola y la pluma ──
    L.planoX(6.35, 2.42, 490, 186, enMuro(PROMESA, PROMESA_A, 490), -39);
    L.caja(0.1, 2.5, 0, 0.5, 3.0, 0.76, ROBLE, 0.35 + 4.0);
    L.caja(0.08, 2.48, 0.76, 0.56, 3.04, 0.04, { t: '#E3CBA6', l: ROBLE.l, r: ROBLE.r }, 0.36 + 4.0);
    L.piso(0.18, 3.1, `<rect width="34" height="44" rx="2" fill="${PAPEL}" transform="rotate(6 17 22)"/><rect x="4" y="2" width="34" height="44" rx="2" fill="#FFFFFF" stroke="#D6DCE3" stroke-width="1"/>` +
      [10, 16, 22, 28].map((v) => `<path d="M9 ${v}H33" stroke="#B9C2CC" stroke-width="1.6"/>`).join('') + `<path d="M8 38L36 30" stroke="${AZUL}" stroke-width="2.4" stroke-linecap="round"/>`, 4.45, 0.805);
    L.cil(0.36, 4.9, 0.8, 0.09, 0.14, AZUL, NOCHE, 5.6);
    { const [cx, cy] = L.P(0.36, 4.9, 1.02); L.add(5.61, `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="7" fill="#4E8A55"/><circle cx="${r1(cx - 3)}" cy="${r1(cy - 4)}" r="5" fill="#6FAF6B"/><circle cx="${r1(cx + 4)}" cy="${r1(cy - 2)}" r="4" fill="#3E7A4E"/>`); }
    zona('promesa', { formas: [{ plano: [[0.03, 6.35, 0.55], [0.03, 1.45, 0.55], [0.03, 1.45, 2.42], [0.03, 6.35, 2.42]] }, { piso: [[0.08, 2.48], [0.64, 2.48], [0.64, 5.52], [0.08, 5.52]], alto: 0.8, soloToque: true }],
      lugar: [0.05, 3.9, 2.6], guia: [2.0, 4.4], frente: { svg: PROMESA, ancho: PROMESA_A, alto: PROMESA_H, fondo: '#5A4330' } });
    plantaAlta(L, 0.6, 0.65, 0.95, ['#FFFFFF', '#DCE2E7']);

    // ── La maqueta del barrio: la calle principal, con el sitio libre entre Rumbo y El Archivo ──
    L.caja(6.0, 3.6, 0, 4.8, 2.8, 0.7, BLANCO, 8.4 + 5.0);
    L.caja(5.94, 3.54, 0.7, 4.92, 2.92, 0.06, { t: '#FFFFFF', l: '#D5DEE8', r: '#B9C8D8' }, 8.4 + 5.02);
    L.caja(6.15, 3.72, 0.76, 4.5, 2.56, 0.04, { t: '#12344F', l: '#0E2A47', r: '#0B2240' }, 8.4 + 5.04);
    // la vereda y la calzada, con su línea
    L.piso(6.15, 5.3, `<rect width="450" height="16" fill="#2A5A88"/><rect y="16" width="450" height="44" fill="#1D4A72"/><path d="M8 38H442" stroke="#F2F4F7" stroke-width="2" stroke-dasharray="10 9" opacity=".7"/>`, 8.4 + 5.05, 0.805);
    // los locales, cada uno con su color en el techo; al medio, BiPlot HQ, y el sitio libre marcado (todo lo de encima de
    // la maqueta va después de su base y antes de quienes la miran)
    const km = (x) => 13.5 + x * 0.02;
    const fila = [['nuhome', '#E0B341'], ['fundos', '#6FAF6B'], ['haru', '#E0524A'], ['eleven', '#17C3B2'], ['hq', null], ['rumbo', '#3E9C95'], ['libre', null], ['archivo', '#7FD8CF']];
    fila.forEach(([id, c], i) => {
      const x = 6.32 + i * 0.54;
      if (id === 'hq') {
        L.caja(x - 0.02, 3.86, 0.8, 0.52, 1.1, 0.78, { t: AZUL, l: '#17446F', r: '#0F3558' }, km(x));
        L.caja(x - 0.02, 3.86, 1.58, 0.52, 1.1, 0.03, { t: CIAN, l: '#0A8A7E', r: '#087066' }, km(x) + 0.001);
        for (let f = 0; f < 3; f++) L.add(km(x) + 0.002, L.poly([[x + 0.06, 4.961, 0.95 + f * 0.2], [x + 0.42, 4.961, 0.95 + f * 0.2], [x + 0.42, 4.961, 1.05 + f * 0.2], [x + 0.06, 4.961, 1.05 + f * 0.2]], `fill="#F2C14E" opacity=".85"`));
      } else if (id === 'libre') {
        L.piso(x, 4.3, `<rect x="2" y="2" width="42" height="62" rx="4" fill="rgba(127,216,207,.3)" stroke="${MENTA}" stroke-width="3" stroke-dasharray="6 5"/>`, km(x), 0.81);
        L.caja(x + 0.2, 4.95, 0.8, 0.03, 0.03, 0.42, { t: NIEBLA, l: '#C9D1D9', r: '#AEB8C2' }, km(x) + 0.001);
        L.planoY(x - 0.04, 4.99, 1.3, 56, 20, `<rect width="56" height="20" rx="5" fill="${MENTA}"/>` + mono(28, 13.8, 'TU LOCAL', 9.4, NOCHE, ' text-anchor="middle"'), km(x) + 0.002);
      } else {
        L.caja(x, 4.3, 0.8, 0.46, 0.66, 0.3, { t: c, l: '#1B4670', r: '#15395E' }, km(x));
        L.add(km(x) + 0.001, L.poly([[x + 0.05, 4.961, 0.84], [x + 0.41, 4.961, 0.84], [x + 0.41, 4.961, 0.98], [x + 0.05, 4.961, 0.98]], `fill="#F2C14E" opacity=".8"`));
      }
    });
    // los árboles de la vereda de enfrente
    for (const x of [6.5, 7.6, 8.7, 9.8, 10.4]) {
      L.cil(x, 6.05, 0.8, 0.018, 0.14, '#4A3F2E', '#4A3F2E', km(x) + 0.1);
      const [cx, cy] = L.P(x, 6.05, 1.02); L.add(km(x) + 0.101, `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="6.5" fill="#168A86"/><circle cx="${r1(cx - 2.5)}" cy="${r1(cy - 2)}" r="4" fill="#1FA39E"/>`);
    }
    L.planoY(7.4, 6.404, 0.58, 200, 26, `<rect width="200" height="26" rx="4" fill="${AZUL}"/>` + mono(100, 17.6, 'LA CALLE PRINCIPAL', 11, MENTA, ' text-anchor="middle" letter-spacing="2"'), 8.4 + 6.4 + 0.1);
    // Atlas flota sobre la maqueta y proyecta el mapa de la calle: ve todo el panorama
    L.add(13.97, L.poly([[8.25, 4.95, 1.86], [6.3, 6.1, 0.84], [10.55, 6.1, 0.84], [10.55, 4.15, 0.84]], `class="haz-atlas" fill="rgba(127,216,207,.2)"`));
    pj('atlas', 8.25, 4.95, 1.86, 'i', 2.1, 13.98);
    pj('vtEl', 7.25, 7.05, 0, 'd');
    pj('vtElla', 9.15, 7.15, 0, 'i');
    zona('maqueta', { formas: [{ piso: [[5.9, 3.5], [10.9, 3.5], [10.9, 6.5], [5.9, 6.5]], alto: 1.25 }], lugar: [8.4, 5.0, 1.75], guia: [10.9, 7.4] });

    // ── El local piloto: un local de la calle armado adentro, con tu marca ──
    const LP = S.local(E, PX, PY, 0, false, PX + PY);
    T.basica(LP, { color: TU_MARCA, nombre: 'TU MARCA', lema: 'Tu sistema, al día', lineas: [['Pedidos', 0.8], ['Stock', 0.55], ['Cobros', 0.68]] });
    LP.planoX(1.72, 1.78, 150, 50, `<rect width="150" height="50" rx="6" fill="${AZUL}" stroke="${MENTA}" stroke-width="2"/>` + mono(10, 20, 'TU SALA, CON UN ENLACE', 8.5, MENTA) + txt(10, 38, 'biplot.cl/oficina/tu-empresa', 11, '#FFFFFF'), -39);
    pj('vtPiloto', PX + 2.6, PY + 3.35, 0, 'd');
    // el letrero de piloto, afuera
    L.caja(5.2, 12.25, 0, 0.3, 0.3, 0.06, MARINO, 17.6);
    L.caja(5.32, 12.37, 0.06, 0.06, 0.06, 0.9, { t: NIEBLA, l: '#C9D1D9', r: '#AEB8C2' }, 17.62);
    L.planoY(4.95, 12.45, 1.42, 80, 44, `<rect width="80" height="44" rx="6" fill="${AZUL}" stroke="${MENTA}" stroke-width="2"/>` + mono(40, 19, 'LOCAL', 10, MENTA, ' text-anchor="middle" letter-spacing="2"') + txt(40, 36, 'PILOTO', 14, '#FFFFFF', ' text-anchor="middle" letter-spacing="2"'), 17.64);
    zona('piloto', { formas: [{ piso: [[PX, PY], [PX + 4.6, PY], [PX + 4.6, PY + 4.3], [PX, PY + 4.3]], alto: 1.95 }], lugar: [PX + 2.3, PY + 2.1, 2.3], guia: [5.9, 11.3] });

    // ── La sala de espera: el sillón, la mesa con los folletos y el café ──
    L.caja(10.5, 9.4, 0, 0.6, 0.55, 0.92, BLANCO, 10.8 + 9.7);
    L.caja(10.6, 9.5, 0.92, 0.3, 0.26, 0.34, { t: '#5B6776', l: '#4A5260', r: '#39404C' }, 10.8 + 9.7 + 0.02);
    L.add(10.8 + 9.7 + 0.025, L.poly([[10.64, 9.763, 1.02], [10.86, 9.763, 1.02], [10.86, 9.763, 1.2], [10.64, 9.763, 1.2]], `fill="#2A3038"`) + L.poly([[10.7, 9.764, 1.13], [10.8, 9.764, 1.13], [10.8, 9.764, 1.17], [10.7, 9.764, 1.17]], `fill="${MENTA}"`));
    L.cil(10.98, 9.7, 0.92, 0.05, 0.08, '#FFFFFF', '#DCE2E7', 10.8 + 9.7 + 0.03);
    L.caja(11.35, 9.3, 0.4, 2.9, 0.22, 0.44, TELA, 20.5);
    L.caja(11.35, 9.3, 0, 2.9, 0.85, 0.4, TELA, 20.6);
    L.caja(11.22, 9.3, 0, 0.14, 0.85, 0.6, { t: '#2F5A86', l: '#244A70', r: '#1C3C5C' }, 20.7);
    L.caja(14.25, 9.3, 0, 0.14, 0.85, 0.6, { t: '#2F5A86', l: '#244A70', r: '#1C3C5C' }, 20.71);
    pj('vtEspera1', 12.0, 9.8, 0.47, 'd', EA, 12.0 + 9.8 + 0.3);
    pj('vtEspera2', 13.55, 9.8, 0.47, 'i', EA, 13.55 + 9.8 + 0.3);
    L.caja(11.8, 10.55, 0, 1.9, 0.7, 0.36, ROBLE, 12.75 + 10.9);
    L.piso(11.95, 10.62, [[0, TU_MARCA], [26, CIAN], [52, AZUL], [78, '#E0B341']].map(([x, c], i) => `<g transform="translate(${x} ${i % 2 ? 6 : 0}) rotate(${i % 2 ? 6 : -4})"><rect width="22" height="30" rx="2" fill="#FFFFFF"/><rect width="22" height="9" rx="2" fill="${c}"/><rect x="4" y="14" width="14" height="2.4" fill="#C9D1D9"/><rect x="4" y="19" width="10" height="2.4" fill="#C9D1D9"/></g>`).join(''), 12.75 + 10.9 + 0.01, 0.365);
    L.cil(13.35, 10.85, 0.36, 0.06, 0.09, '#FFFFFF', '#DCE2E7', 24.3); L.cil(13.55, 10.95, 0.36, 0.06, 0.09, '#FFFFFF', '#DCE2E7', 24.31);
    zona('espera', { formas: [{ piso: [[10.45, 9.25], [14.45, 9.25], [14.45, 11.3], [10.45, 11.3]], alto: 1.4 }], lugar: [12.6, 10.0, 1.8], guia: [15.2, 11.6] });

    // ── Al fondo, la mesa de Lupe: el diagnóstico, con la primera sesión sin costo ──
    L.caja(13.55, 4.35, 0, 0.08, 0.75, 0.7, MARINO, 14.2 + 4.7 - 0.4);
    L.caja(15.07, 4.35, 0, 0.08, 0.75, 0.7, MARINO, 14.2 + 4.7 - 0.1);
    L.caja(13.6, 5.02, 0.08, 1.52, 0.06, 0.56, MARINO, 14.36 + 5.05);
    L.planoY(13.72, 5.084, 0.55, 128, 34, `<rect width="128" height="30" rx="15" fill="${CORAL}"/>` + txt(64, 20.5, 'Agenda tu diagnóstico', 11.5, NOCHE, ' text-anchor="middle"'), 14.36 + 5.06);
    L.caja(13.5, 4.3, 0.7, 1.7, 0.85, 0.05, BLANCO, 14.35 + 4.73);
    // sobre la mesa: el portátil con la radiografía, la libreta de planillas, el cronómetro y el cartel de la primera sesión
    L.caja(13.85, 4.45, 0.75, 0.46, 0.3, 0.02, { t: '#AEB8C2', l: '#8F9AA6', r: '#77828E' }, 14.35 + 4.73 + 0.02);
    L.planoY(13.85, 4.47, 1.06, 46, 29, `<rect width="46" height="29" rx="2" fill="${NOCHE}"/><rect x="2" y="2" width="42" height="25" fill="${AZUL}"/>` + mono(4.5, 8.4, 'RADIOGRAFÍA', 3.6, MENTA) +
      [[5, 18, 8], [12, 14, 12], [19, 10, 16], [26, 16, 10], [33, 12, 14]].map(([x, y, h]) => `<rect x="${x}" y="${y}" width="4.6" height="${h - 2}" fill="${x === 19 ? '#F2C14E' : CIAN}"/>`).join(''), 14.35 + 4.73 + 0.03);
    L.piso(14.45, 4.62, `<rect width="30" height="24" rx="1.5" fill="#F4ECD8"/><path d="M15 0V24" stroke="#C9BFA8" stroke-width=".8"/>` + [5, 9, 13, 17, 21].map((v) => `<path d="M3 ${v}H12M18 ${v}H27" stroke="#9C8E72" stroke-width=".7"/>`).join(''), 14.35 + 4.73 + 0.04, 0.755);
    L.cil(14.95, 4.55, 0.75, 0.06, 0.03, '#E6ECF2', '#AEB8C2', 14.35 + 4.73 + 0.05);
    L.planoY(14.52, 5.0, 0.97, 60, 20, `<rect width="60" height="20" rx="3" fill="${AZUL}"/>` + mono(30, 8.4, 'PRIMERA SESIÓN', 5.2, MENTA, ' text-anchor="middle"') + txt(30, 16, 'sin costo', 6.4, '#FFFFFF', ' text-anchor="middle"'), 14.35 + 5.0 + 0.06);
    pj('lupe', 13.05, 4.8, 0, 'd');
    silla(L, 15.75, 4.75, MARINO); pj('vtCliente', 15.75, 4.75, 0.47, 'i');
    zona('diagnostico', { formas: [{ piso: [[12.7, 4.2], [16.1, 4.2], [16.1, 5.25], [12.7, 5.25]], alto: 1.9 }], lugar: [14.35, 4.7, 2.2], guia: [12.6, 6.0] });

    // ── La entrada: Plotty y su tótem de las tres preguntas, el pendón y el felpudo ──
    L.caja(15.75, 8.5, 0, 0.6, 0.4, 1.3, MARINO, 16.05 + 8.7 + 0.2);
    L.caja(15.75, 8.5, 1.3, 0.6, 0.4, 0.04, { t: CIAN, l: '#0A8A7E', r: '#087066' }, 16.05 + 8.7 + 0.21);
    L.planoY(15.8, 8.904, 1.22, 50, 78, `<rect width="50" height="78" rx="4" fill="${NOCHE}"/><rect x="3" y="3" width="44" height="72" rx="2" fill="${AZUL}"/>` +
      mono(25, 14, '¿POR DÓNDE', 5.2, MENTA, ' text-anchor="middle"') + mono(25, 21, 'PARTIR?', 5.2, MENTA, ' text-anchor="middle"') + txt(25, 38, '3', 17, '#FFFFFF', ' text-anchor="middle"') +
      txt(25, 47, 'preguntas', 6.4, '#FFFFFF', ' text-anchor="middle"') + [55, 62, 69].map((v, i) => `<rect x="9" y="${v - 4}" width="32" height="5" rx="2.5" fill="${i ? '#1B4670' : CIAN}"/>`).join(''), 16.05 + 8.9 + 0.22);
    L.caja(17.15, 10.12, 0, 0.8, 0.2, 0.07, { t: '#AEB8C2', l: '#8F9AA6', r: '#77828E' }, 17.55 + 10.2);
    L.planoY(17.2, 10.2, 2.02, 70, 190, `<rect width="70" height="190" fill="${AZUL}"/>` + ISOTIPO(24, 16, 1) + txt(35, 58, 'BiPlot', 14, '#FFFFFF', ' text-anchor="middle"') +
      mono(35, 76, 'SALA DE', 6.4, MENTA, ' text-anchor="middle" letter-spacing="1"') + mono(35, 85, 'VENTAS', 6.4, MENTA, ' text-anchor="middle" letter-spacing="1"') +
      `<path d="M14 98H56" stroke="${CIAN}" stroke-width="1.4"/>` + lineas(35, 116, ['Primera', 'sesión', 'sin costo'], 9.5, '#FFFFFF', 12, txt, ' text-anchor="middle"') +
      `<rect x="10" y="160" width="50" height="16" rx="8" fill="none" stroke="${MENTA}" stroke-width="1.2"/>` + mono(35, 171, 'biplot.cl', 6, MENTA, ' text-anchor="middle"'), 17.55 + 10.21);
    L.piso(15.3, 11.55, `<rect width="230" height="120" rx="12" fill="${AZUL}"/><rect x="8" y="8" width="214" height="104" rx="8" fill="none" stroke="${MENTA}" stroke-width="3" stroke-dasharray="10 7"/>` +
      mono(115, 56, 'PASA', 26, MENTA, ' text-anchor="middle" letter-spacing="6"') + txt(115, 90, 'Este local te espera', 17, '#FFFFFF', ' text-anchor="middle"'), -52);
    plantaAlta(L, 17.5, 8.7, 1.0, ['#FFFFFF', '#DCE2E7']);
    zona('plotty', { formas: [{ piso: [[15.6, 8.35], [16.5, 8.35], [16.5, 9.05], [15.6, 9.05]], alto: 2.2 }], lugar: [16.05, 8.7, 2.1], guia: [16.9, 10.4] });
    lugar('entrada', 16.6, 12.2, 0.9);

    // Plotty recibe en la entrada (y guía el recorrido); alguien más llega a la sala
    camina('plotty', [[16.95, 10.0, 4], [15.4, 11.1, 3], [16.95, 10.0]], { vel: 0.4, e: 2.2, z: 0.8 });
    camina('caminante', [[15.4, 12.2, 2], [11.0, 8.0, 3], [8.6, 2.6, 3], [11.0, 8.0], [15.4, 12.2]], { vel: 0.5 });

    return { id: 'libre', ancho: W, fondo: D };
  });
}

export const ventas = salaVentas;
