// Plantillas por rubro y estados del local (fases del motor). Mismo formato que los locales de la calle principal:
// coordenadas locales 0..4,6 × 0..4,3, muros de fondo en y = 0 (planoY) y x = 0 (planoX).
// Para el barrio se dibujan una vez con marcas que el navegador reemplaza (escena.js):
//   §C§ el color del cliente, §C.t25§ / §C.c30§ ese color oscurecido o aclarado (25 % / 30 %),
//   §N§ el nombre del letrero, §NF:a:b:c§ su tamaño (hasta 9 letras, hasta 12 y más largo) y
//   §NTL:a:b§ su largo forzado (textLength; hasta 12 letras y más largo; 0 = sin forzar).
import { base } from './locales.mjs';
const r1 = (n) => Math.round(n * 10) / 10;
const FUENTE = `font-family="'Space Grotesk','DejaVu Sans',sans-serif"`, MONO = `font-family="'Space Mono','DejaVu Sans Mono',monospace"`;
const txt = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${FUENTE} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const mono = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${MONO} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
const MADERA = { t: '#8B6A4E', l: '#6E5238', r: '#5A4330' };
const OSCURO = { t: '#3A424E', l: '#2A3038', r: '#1E232A' };
const BLANCO = { t: '#F2F4F7', l: '#D5E2EE', r: '#B9C8D8' };
const hex = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const marca = (c) => typeof c === 'string' && c.charAt(0) === '§';
const tono = (c, t) => marca(c) ? `${c.slice(0, -1)}.t${Math.round(t * 100)}§` : '#' + hex(c).map(v => Math.round(v + (6 - v) * t).toString(16).padStart(2, '0')).join('');
const claro = (c, t) => marca(c) ? `${c.slice(0, -1)}.c${Math.round(t * 100)}§` : '#' + hex(c).map(v => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0')).join('');
// Nombre en un letrero: tamaño [corto, largo] y largo forzado [corto, largo] (0 = sin forzar)
const nombreTxt = (x, y, nombre, fs, color, extra = '', tl = [0, 0]) => {
  if (marca(nombre)) return `<text x="${x}" y="${y}" ${FUENTE} font-weight="700" font-size="§NF:${fs[0]}:${fs[0]}:${fs[1]}§" fill="${color}"${extra} §NTL:${tl[0]}:${tl[1]}§>${nombre}</text>`;
  const largo = nombre.length > 12, l = largo ? tl[1] : tl[0];
  return txt(x, y, nombre, largo ? fs[1] : fs[0], color, extra + (l ? ` textLength="${l}" lengthAdjust="spacingAndGlyphs"` : ''));
};

// Muela (logo de la clínica), en coordenadas 2D
const muela = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-10 -8C-10 -14 -4 -14 0 -11C4 -14 10 -14 10 -8C10 -2 7 2 6 8C5 12 2 12 1.5 7C1 4 -1 4 -1.5 7C-2 12 -5 12 -6 8C-7 2 -10 -2 -10 -8Z" fill="${c}"/>`;

/* ───────── Clínica dental ───────── */
export function clinica(L, o = {}) {
  const c = o.color || '#3E9C95', nombre = o.nombre || 'CLÍNICA DENTAL';
  base(L, '#8FAFB6');
  L.piso(0, 0, `<g stroke="#9DBCC2" stroke-width="2">${[58, 116, 174, 232, 290, 348, 406].map(x => `<path d="M${x} 0V430"/>`).join('')}${[54, 108, 162, 216, 270, 324, 378].map(y => `<path d="M0 ${y}H460"/>`).join('')}</g>`, -55);
  // Letrero con la muela
  L.planoY(0.25, 0.02, 1.84, 188, 44, `<rect width="188" height="44" rx="8" fill="#F2F4F7" stroke="${c}" stroke-width="3"/>` + muela(24, 23, 1.1, c) + nombreTxt(44, 29, nombre, [18, 15], tono(c, 0.45), '', [120, 134]));
  // Negatoscopio con la radiografía panorámica
  L.planoY(0.3, 0.02, 1.22, 118, 58, `<rect width="118" height="58" rx="4" fill="#DDE8EE" stroke="#0B1726" stroke-width="3"/><rect x="7" y="7" width="104" height="44" rx="3" fill="#1C2B38"/>` +
    [16, 28, 40, 52, 64, 76, 88, 100].map((x, i) => `<rect x="${x - 4}" y="${i % 2 ? 13 : 12}" width="8" height="${i % 3 ? 13 : 15}" rx="3" fill="#C9D8E0" opacity=".85"/><rect x="${x - 4}" y="31" width="8" height="${i % 3 ? 12 : 14}" rx="3" fill="#C9D8E0" opacity=".85"/>`).join(''));
  // Agenda del día: las confirmaciones llegan solas
  L.planoY(2.72, 0.02, 1.82, 162, 98, `<rect width="162" height="98" rx="6" fill="#0B2B45" stroke="#0B1726" stroke-width="4"/>` + mono(10, 18, 'AGENDA DE HOY', 9, '#7FD8CF') +
    [['09:00', 'Limpieza', 1], ['10:30', 'Control', 1], ['12:00', 'Ortodoncia', 0]].map(([h, t, ok], i) => mono(10, 40 + i * 21, h, 9, '#B9C8D8') + txt(50, 40 + i * 21, t, 10.5, '#F2F4F7') +
      (ok ? `<rect x="116" y="${30 + i * 21}" width="38" height="13" rx="6" fill="#17C3B2"/>` + mono(121, 40 + i * 21, 'OK', 8, '#0E2A47') : `<g class="loc-a"><rect x="116" y="${30 + i * 21}" width="38" height="13" rx="6" fill="none" stroke="#7FD8CF" stroke-width="1.5"/>` + mono(119, 40 + i * 21, '...', 8, '#7FD8CF') + `</g><g class="loc-b"><rect x="116" y="${30 + i * 21}" width="38" height="13" rx="6" fill="#17C3B2"/>` + mono(121, 40 + i * 21, 'OK', 8, '#0E2A47') + '</g>')).join(''));
  // Muro izquierdo: «Tu sonrisa, al día»
  L.planoX(3.9, 1.62, 176, 58, `<rect width="176" height="58" rx="6" fill="${claro(c, 0.82)}" stroke="#0B1726" stroke-width="3"/>` + muela(26, 30, 1.2, c) + txt(50, 26, 'Tu sonrisa,', 15, tono(c, 0.5)) + txt(50, 45, 'al día', 15, tono(c, 0.5)));
  // Mueble con lavamanos contra el fondo
  L.caja(2.5, 0.1, 0, 1.95, 0.5, 0.86, BLANCO);
  L.caja(2.5, 0.1, 0.86, 1.95, 0.5, 0.04, { t: '#DDE8EE', l: '#B9C8D8', r: '#8FA3B8' }, 3.9);
  L.cil(3.0, 0.35, 0.9, 0.16, 0.02, '#B9C8D8', '#8FA3B8', 3.95); L.linea([[3.0, 0.14, 0.9], [3.0, 0.14, 1.12], [3.0, 0.3, 1.12]], '#B9C8D8', 2, 3.96);
  for (const x of [3.6, 4.1]) L.caja(x, 0.12, 0.9, 0.22, 0.18, 0.22, { t: c, l: tono(c, 0.2), r: tono(c, 0.35) }, 3.97 + x * 0.001);
  // Sillón dental: base, asiento, respaldo reclinado, cabezal y apoyapiés
  L.cil(2.2, 2.22, 0, 0.42, 0.05, '#B9C8D8', '#8FA3B8', 4.0);
  L.cil(2.2, 2.22, 0.05, 0.12, 0.4, '#D5E2EE', '#8FA3B8', 4.1);
  L.caja(1.75, 1.95, 0.45, 1.0, 0.55, 0.12, { t: c, l: tono(c, 0.18), r: tono(c, 0.32) }, 4.3);
  L.add(4.2, L.poly([[1.75, 1.95, 0.57], [1.75, 2.5, 0.57], [1.2, 2.5, 1.18], [1.2, 1.95, 1.18]], `fill="${claro(c, 0.12)}"`) + L.poly([[1.75, 2.5, 0.45], [1.75, 2.5, 0.57], [1.2, 2.5, 1.18], [1.2, 2.5, 1.06]], `fill="${tono(c, 0.25)}"`));
  L.caja(1.02, 2.05, 1.12, 0.26, 0.35, 0.12, { t: c, l: tono(c, 0.18), r: tono(c, 0.32) }, 4.21);
  L.add(4.35, L.poly([[2.75, 1.97, 0.57], [2.75, 2.48, 0.57], [3.3, 2.48, 0.36], [3.3, 1.97, 0.36]], `fill="${claro(c, 0.12)}"`) + L.poly([[2.75, 2.48, 0.45], [2.75, 2.48, 0.57], [3.3, 2.48, 0.36], [3.3, 2.48, 0.26]], `fill="${tono(c, 0.25)}"`));
  // Lámpara de brazo y bandeja de instrumentos
  L.cil(1.05, 1.45, 0, 0.16, 0.04, '#8FA3B8', '#6B7A8C', 3.0);
  L.linea([[1.05, 1.45, 0], [1.05, 1.45, 1.95], [1.9, 1.95, 1.8]], '#B9C8D8', 3, 3.05);
  L.anim('loc-lampara', () => { const [lx, ly] = L.P(1.95, 2.0, 1.72); L.add(3.06, `<ellipse cx="${r1(lx)}" cy="${r1(ly)}" rx="11" ry="6" fill="#DDF4F1" stroke="#8FA3B8" stroke-width="2"/><ellipse cx="${r1(lx)}" cy="${r1(ly + 16)}" rx="24" ry="12" fill="#FFF7D6" opacity=".22"/>`); });
  L.linea([[3.05, 1.55, 0], [3.05, 1.55, 0.86]], '#B9C8D8', 2.4, 4.4);
  L.caja(2.8, 1.35, 0.86, 0.55, 0.4, 0.04, { t: '#DDE8EE', l: '#B9C8D8', r: '#8FA3B8' }, 4.41);
  L.linea([[2.9, 1.45, 0.91], [3.25, 1.55, 0.91]], '#6B7A8C', 1.4, 4.42); L.linea([[2.9, 1.55, 0.91], [3.2, 1.65, 0.91]], '#6B7A8C', 1.4, 4.43);
  // Taburete de la dentista
  L.cil(3.35, 2.95, 0, 0.05, 0.42, '#6B7A8C', '#3A424E', 6.3); L.cil(3.35, 2.95, 0.42, 0.2, 0.07, c, tono(c, 0.25), 6.31);
  // Recepción y espera
  L.caja(0.15, 3.25, 0, 1.55, 0.55, 0.9, { t: '#F2F4F7', l: claro(c, 0.55), r: '#C4D2E0' });
  L.caja(0.15, 3.25, 0.9, 1.55, 0.55, 0.05, { t: claro(c, 0.3), l: c, r: tono(c, 0.2) }, 5.05);
  L.caja(0.35, 3.35, 0.95, 0.35, 0.08, 0.26, OSCURO, 5.1);
  L.cil(1.35, 3.5, 0.95, 0.07, 0.05, '#E0B341', '#B8902E', 5.12);
  if (o.planta !== false) L.planta(0.35, 0.55, 0, undefined, 0.7);
}

/* ───────── Taller mecánico ───────── */
export function taller(L, o = {}) {
  const c = o.color || '#E0524A', nombre = o.nombre || 'TALLER';
  base(L, '#4A5360');
  L.piso(0, 0, `<rect x="70" y="100" width="330" height="190" fill="none" stroke="#E0B341" stroke-width="7" stroke-dasharray="18 12"/><ellipse cx="160" cy="330" rx="40" ry="18" fill="#3A424E"/><ellipse cx="300" cy="120" rx="26" ry="12" fill="#3A424E"/>`, -55);
  // Tablero de herramientas
  L.planoY(0.2, 0.02, 1.86, 200, 110, `<rect width="200" height="110" rx="4" fill="#8FA3B8" stroke="#0B1726" stroke-width="3"/>` +
    Array.from({ length: 60 }, (_, i) => `<circle cx="${12 + (i % 12) * 16}" cy="${10 + Math.floor(i / 12) * 20}" r="1.6" fill="#6B7A8C"/>`).join('') +
    `<g fill="#1F2733"><path d="M20 20h6v50h-6zM16 16h14v8h-14z"/><path d="M44 18l8 0 3 52h-14z"/><circle cx="84" cy="32" r="12"/><rect x="80" y="40" width="8" height="34"/><path d="M110 20h30v10h-12v44h-6v-44h-12z"/><path d="M156 18c10 0 16 8 16 16h-6c0-6-4-10-10-10z"/><rect x="164" y="34" width="6" height="40"/></g>` +
    `<rect x="0" y="86" width="200" height="24" fill="${c}"/>` + nombreTxt(12, 104, nombre, [16, 13], '#F2F4F7', ` letter-spacing="3"`, [0, 176]));
  // Órdenes de trabajo: recibido → aprobado → listo
  L.planoY(2.7, 0.02, 1.84, 168, 100, `<rect width="168" height="100" rx="6" fill="#0B2B45" stroke="#0B1726" stroke-width="4"/>` + mono(9, 16, 'ÓRDENES DE TRABAJO', 8, '#7FD8CF') +
    [['RECIBIDO', '#8FA3B8'], ['APROBADO', '#E0B341'], ['LISTO', '#17C3B2']].map(([t, col], i) => { const x = 7 + i * 53; return mono(x + 2, 32, t, 6, col) + `<rect x="${x}" y="37" width="49" height="56" rx="3" fill="#123459"/>`; }).join('') +
    `<rect x="11" y="42" width="41" height="12" rx="2" fill="#35679A"/><rect x="11" y="58" width="41" height="12" rx="2" fill="#35679A"/>` +
    `<g class="loc-a"><rect x="64" y="42" width="41" height="12" rx="2" fill="#E0B341"/></g><g class="loc-b"><rect x="117" y="58" width="41" height="12" rx="2" fill="#17C3B2"/></g><rect x="117" y="42" width="41" height="12" rx="2" fill="#17C3B2"/>`);
  // Muro izquierdo: servicios
  L.planoX(3.9, 1.66, 200, 44, `<rect width="200" height="44" rx="5" fill="#1F2733" stroke="${c}" stroke-width="3"/>` + mono(12, 28, 'ACEITE · FRENOS · MOTOR', 12, '#F2F4F7'));
  // Carro de herramientas y neumáticos
  L.caja(0.25, 0.55, 0, 0.75, 0.45, 0.8, { t: c, l: tono(c, 0.18), r: tono(c, 0.32) });
  for (const z of [0.2, 0.42, 0.64]) L.add(1.9, L.poly([[0.25, 1.0, z], [1.0, 1.0, z]], `stroke="#0B1726" stroke-width="1.6"`));
  for (const [x, y, n] of [[4.15, 0.75, 3], [4.15, 1.45, 2]]) for (let k = 0; k < n; k++) { L.cil(x, y, k * 0.2, 0.32, 0.2, '#2A3038', '#1E232A', x + y + 0.1 + k * 0.01); L.cil(x, y, k * 0.2 + 0.2, 0.14, 0.001, '#6B7A8C', '#6B7A8C', x + y + 0.105 + k * 0.01); }
  // Elevador de dos columnas con el auto arriba
  for (const y of [1.3, 3.05]) L.caja(2.3, y, 0, 0.18, 0.18, 1.7, { t: '#E0B341', l: '#B8902E', r: '#8C6D22' }, 2.3 + y + 0.1);
  L.caja(1.3, 1.6, 0.66, 2.6, 0.1, 0.06, { t: '#E0B341', l: '#B8902E', r: '#8C6D22' }, 5.0); L.caja(1.3, 2.75, 0.66, 2.6, 0.1, 0.06, { t: '#E0B341', l: '#B8902E', r: '#8C6D22' }, 5.05);
  const auto = o.auto || '#35679A';
  L.caja(1.15, 1.55, 0.72, 2.9, 1.35, 0.45, { t: auto, l: tono(auto, 0.2), r: tono(auto, 0.35) }, 5.1);
  L.caja(1.75, 1.65, 1.17, 1.55, 1.15, 0.38, { t: claro(auto, 0.1), l: tono(auto, 0.15), r: tono(auto, 0.3) }, 5.2);
  L.add(5.21, L.poly([[1.85, 2.801, 1.22], [3.2, 2.801, 1.22], [3.1, 2.801, 1.5], [1.95, 2.801, 1.5]], `fill="#9FC3D9" opacity=".85"`) + L.poly([[3.301, 1.72, 1.22], [3.301, 2.72, 1.22], [3.301, 2.62, 1.5], [3.301, 1.82, 1.5]], `fill="#9FC3D9" opacity=".7"`));
  for (const x of [1.6, 3.5]) { const [wx, wy] = L.P(x, 2.9, 0.74); L.add(5.3, `<ellipse cx="${r1(wx)}" cy="${r1(wy)}" rx="11" ry="12" fill="#1F2733"/><ellipse cx="${r1(wx)}" cy="${r1(wy)}" rx="5" ry="5.5" fill="#8FA3B8"/>`); }
  L.caja(4.05, 1.72, 0.8, 0.02, 0.2, 0.1, { t: '#F2C14E', l: '#F2C14E', r: '#F2C14E' }, 5.4);
  // Tambor de aceite
  L.cil(0.55, 3.7, 0, 0.26, 0.72, '#35679A', '#17446F', 4.3); L.cil(0.55, 3.7, 0.72, 0.26, 0.001, '#27507C', '#27507C', 4.31);
  if (o.planta !== false) L.planta(4.3, 3.9, 0, undefined, 0.55);
}

/* ───────── Plantilla base: cualquier rubro, con nombre y color ───────── */
export function basica(L, o = {}) {
  const c = o.color || '#8E6BB8', nombre = o.nombre || 'TU NEGOCIO', lema = o.lema || 'Tu sistema, al día';
  base(L, '#2F4459');
  L.piso(0, 0, `<rect x="90" y="150" width="280" height="190" rx="18" fill="${tono(c, 0.45)}" opacity=".85"/><rect x="104" y="164" width="252" height="162" rx="12" fill="none" stroke="${c}" stroke-width="3" opacity=".7"/>`, -55);
  // Letrero grande de la marca y el tablero de su sistema
  L.planoY(0.22, 0.02, 1.86, 212, 62, `<rect width="212" height="62" rx="8" fill="${c}"/><rect x="6" y="6" width="200" height="50" rx="5" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"/>` + nombreTxt(106, 33, nombre, [22, 16], '#FFFFFF', ` text-anchor="middle" letter-spacing="1.5"`, [0, 186]) + mono(106, 49, lema, 8.5, 'rgba(255,255,255,.85)', ' text-anchor="middle"'));
  L.planoY(2.72, 0.02, 1.8, 162, 96, `<rect width="162" height="96" rx="6" fill="#0B2B45" stroke="#0B1726" stroke-width="4"/>` + mono(10, 18, 'TU SISTEMA', 9, '#7FD8CF') +
    (o.lineas || [['Pedidos', 0.8], ['Stock', 0.55], ['Cobros', 0.68]]).map(([t, v], i) => mono(10, 40 + i * 20, t, 8.5, '#B9C8D8') + `<rect x="64" y="${31 + i * 20}" width="86" height="10" rx="3" fill="#123459"/><rect x="64" y="${31 + i * 20}" width="${r1(86 * v)}" height="10" rx="3" fill="${i === 1 ? '#17C3B2' : c}"/>`).join(''));
  // Repisas con productos en el muro izquierdo
  L.planoX(3.95, 1.8, 200, 120, `<rect width="200" height="120" fill="#1D3A55"/>` + [0, 1, 2].map(f => `<rect x="0" y="${30 + f * 40}" width="200" height="5" fill="#8B6A4E"/>` +
    [0, 1, 2, 3, 4, 5, 6].map(k => `<rect x="${10 + k * 27}" y="${10 + f * 40}" width="${16 + (k + f) % 3 * 3}" height="${20 - (k * f) % 3 * 3}" rx="2" fill="${(k + f) % 3 === 0 ? c : (k + f) % 3 === 1 ? claro(c, 0.45) : '#F2F4F7'}"/>`).join('')).join(''));
  // Mesón con la caja
  L.caja(1.35, 2.35, 0, 2.3, 0.55, 0.95, { t: '#D5E2EE', l: claro(c, 0.2), r: tono(c, 0.25) });
  L.caja(1.35, 2.35, 0.95, 2.3, 0.55, 0.05, { t: '#F2F4F7', l: '#D5E2EE', r: '#B9C8D8' }, 5.2);
  L.caja(2.9, 2.45, 1.0, 0.36, 0.08, 0.28, OSCURO, 5.3);
  L.cil(1.8, 2.62, 1.0, 0.1, 0.12, c, tono(c, 0.25), 5.31);
  if (o.planta !== false) L.planta(0.45, 0.55, 0, undefined, 0.75);
  L.caja(3.9, 3.4, 0, 0.45, 0.45, 0.45, { t: tono(c, 0.1), l: tono(c, 0.28), r: tono(c, 0.4) });
}

/* ───────── Estados del local según la fase del motor ───────── */
// E1 · Diagnóstico: el local vacío, con notas en el muro y el piso marcado con cinta
export function diagnostico(L, o = {}) {
  base(L, '#3A4A5C');
  L.piso(0, 0, `<g fill="none" stroke="#E0B341" stroke-width="4" stroke-dasharray="14 10" opacity=".85"><rect x="60" y="60" width="160" height="110"/><rect x="250" y="220" width="150" height="150"/><path d="M60 300H200"/></g>`, -55);
  L.planoY(0.22, 0.02, 1.86, 230, 118, `<rect width="230" height="118" rx="5" fill="#E8DFC8" stroke="#0B1726" stroke-width="3"/>` +
    [['HOY', 14], ['DUELE', 88], ['QUEREMOS', 158]].map(([t, x]) => mono(x, 16, t, 8.5, '#0E2A47')).join('') +
    [[12, 24, '#F2C14E'], [12, 56, '#F2C14E'], [40, 40, '#F2C14E'], [86, 24, '#F5A3B4'], [86, 56, '#F5A3B4'], [114, 34, '#F5A3B4'], [86, 86, '#F5A3B4'], [156, 24, '#7FD8CF'], [184, 44, '#7FD8CF'], [156, 70, '#7FD8CF']].map(([x, y, col], i) =>
      `<rect x="${x}" y="${y}" width="26" height="26" fill="${col}" transform="rotate(${(i % 3) - 1} ${x + 13} ${y + 13})"/><path d="M${x + 4} ${y + 9}h16M${x + 4} ${y + 15}h12" stroke="#5A4A3A" stroke-width="1.6" opacity=".6"/>`).join(''));
  L.planoY(2.9, 0.02, 1.7, 140, 64, `<rect width="140" height="64" rx="4" fill="#F4ECD8" stroke="#0B1726" stroke-width="3"/>` + txt(70, 30, 'PRÓXIMAMENTE', 16, '#0E2A47', ' text-anchor="middle"') + mono(70, 50, 'E1 · DIAGNÓSTICO', 9, '#35679A', ' text-anchor="middle"'));
  // Mesa plegable con el computador y dos sillas
  for (const [x, y] of [[1.45, 1.75], [2.95, 1.75], [1.45, 2.45], [2.95, 2.45]]) L.linea([[x, y, 0], [x, y, 0.7]], '#6B7A8C', 2.2, 3.5);
  L.caja(1.35, 1.65, 0.7, 1.7, 0.9, 0.05, BLANCO, 3.6);
  L.caja(1.7, 1.85, 0.75, 0.5, 0.36, 0.03, { t: '#3A424E', l: '#2A3038', r: '#1E232A' }, 3.61); L.add(3.62, L.poly([[1.7, 1.85, 0.78], [2.2, 1.85, 0.78], [2.2, 1.85, 1.08], [1.7, 1.85, 1.08]], `fill="#1E232A"`) + L.poly([[1.75, 1.852, 0.81], [2.15, 1.852, 0.81], [2.15, 1.852, 1.05], [1.75, 1.852, 1.05]], `fill="#7FD8CF" opacity=".7"`));
  L.cil(2.6, 2.1, 0.75, 0.07, 0.11, '#F2F4F7', '#C4D2E0', 3.63);
  for (const [x, y] of [[1.0, 2.0], [3.4, 2.1]]) { L.caja(x, y, 0.42, 0.42, 0.42, 0.04, { t: '#6B7A8C', l: '#5B6B7F', r: '#4A5260' }, x + y + 0.3); L.linea([[x + 0.05, y + 0.4, 0], [x + 0.05, y + 0.4, 0.42]], '#4A5260', 1.8, x + y + 0.31); L.linea([[x + 0.37, y + 0.4, 0], [x + 0.37, y + 0.4, 0.42]], '#4A5260', 1.8, x + y + 0.32); }
  // Huincha de medir en el piso
  L.linea([[0.7, 3.6, 0.02], [2.6, 3.6, 0.02]], '#E0B341', 3, 4.3); L.caja(0.55, 3.5, 0, 0.2, 0.2, 0.14, { t: '#E0B341', l: '#B8902E', r: '#8C6D22' }, 4.31);
}

// E2–E6 · En obra: andamio, el plano pegado, cajas, escalera y la zona con cinta
export function obra(L, o = {}) {
  base(L, '#3A4A5C');
  L.add(-54, L.poly([[0.1, 0.1, 0.018], [4.5, 0.1, 0.018], [4.5, 1.2, 0.018], [0.1, 1.2, 0.018]], `fill="url(#obra-rayas)" opacity=".75"`));
  L.planoY(1.2, 0.02, 1.7, 160, 92, `<rect width="160" height="92" rx="3" fill="#1E5C8A" stroke="#0B1726" stroke-width="3"/>` + mono(10, 18, 'EL PLANO', 9, '#DDF4F1') +
    `<g fill="none" stroke="#DDF4F1" stroke-width="2"><rect x="12" y="30" width="40" height="20" rx="3"/><rect x="66" y="30" width="40" height="20" rx="3"/><rect x="120" y="30" width="30" height="20" rx="3"/><rect x="66" y="62" width="40" height="18" rx="3"/><path d="M52 40H66M106 40H120M86 50V62"/></g>`);
  L.planoY(3.05, 0.02, 1.62, 128, 46, `<rect width="128" height="46" rx="4" fill="#E0B341" stroke="#0B1726" stroke-width="3"/>` + txt(64, 22, 'EN OBRA', 15, '#0B1726', ' text-anchor="middle" letter-spacing="2"') + mono(64, 37, 'abrimos pronto', 8.5, '#0B1726', ' text-anchor="middle"'));
  // Andamio: tres parantes, travesaños y la tabla a media altura
  for (const x of [0.35, 2.0, 3.65]) for (const y of [0.25, 0.75]) L.linea([[x, y, 0], [x, y, 1.75]], '#B9C8D8', 2.4, x + y + 0.2);
  L.caja(0.25, 0.2, 1.02, 3.55, 0.62, 0.06, MADERA, 3.2);
  for (const x of [0.35, 2.0, 3.65]) L.linea([[x, 0.25, 1.62], [x, 0.75, 1.62]], '#B9C8D8', 2, 3.25);
  L.linea([[0.35, 0.75, 0.5], [2.0, 0.75, 1.0]], '#B9C8D8', 1.8, 3.26); L.linea([[2.0, 0.75, 0.5], [3.65, 0.75, 1.0]], '#B9C8D8', 1.8, 3.27);
  // Escalera de tijera, tarros de pintura y cajas
  { const a = [3.9, 1.6], h = 1.3; L.linea([[a[0] - 0.2, a[1], 0], [a[0], a[1], h], [a[0] + 0.2, a[1], 0]], '#E0B341', 2.6, 5.7); for (const t of [0.3, 0.55, 0.8]) L.linea([[a[0] - 0.2 + 0.2 * t, a[1], h * t], [a[0] + 0.2 - 0.2 * t, a[1], h * t]], '#E0B341', 1.8, 5.71); }
  for (const [x, y, col] of [[1.2, 1.55, '#17C3B2'], [1.45, 1.75, '#F2F4F7']]) { L.cil(x, y, 0, 0.13, 0.22, col, '#8FA3B8', x + y + 0.2); }
  for (const [x, y, z, w] of [[0.3, 3.0, 0, 0.7], [0.35, 3.05, 0.45, 0.6], [1.05, 3.2, 0, 0.55]]) L.caja(x, y, z, w, 0.6, 0.45, { t: '#C9A27A', l: '#A8845E', r: '#8C6D4A' }, x + y + 0.3 + z);
  // Cono y cinta de peligro al frente
  L.cil(4.2, 3.95, 0, 0.12, 0.34, '#F5883A', '#C9682A', 8.4); L.cil(4.2, 3.95, 0.14, 0.13, 0.05, '#F2F4F7', '#C4D2E0', 8.41);
  L.linea([[0.4, 4.15, 0.62], [4.2, 4.15, 0.62]], '#E0B341', 3.5, 8.5, ' stroke-dasharray="10 7"');
}

// E7 · Inauguración: cinta roja con rosa, globos, el lienzo «¡Abrimos!» y papel picado
export function inauguracion(L, o = {}) {
  const c = o.color || '#17C3B2';
  L.planoY(0.9, 0.03, 2.22, 280, 50, `<rect width="280" height="40" rx="6" fill="#E0524A"/><path d="M0 40l14 10 14-10z M252 40l14 10 14-10z" fill="#A8352F"/>` + txt(140, 28, '¡ABRIMOS!', 22, '#FFFFFF', ' text-anchor="middle" letter-spacing="3"'), -39);
  L.linea([[0.35, 4.26, 0.78], [4.25, 4.26, 0.78]], '#E0524A', 4, 9.2);
  { const [bx, by] = L.P(2.3, 4.26, 0.8); L.add(9.21, `<path d="M${r1(bx)} ${r1(by)}l-14 -8v16zM${r1(bx)} ${r1(by)}l14 -8v16z" fill="#C8423A"/><circle cx="${r1(bx)}" cy="${r1(by)}" r="4" fill="#A8352F"/><path d="M${r1(bx)} ${r1(by)}l-6 16M${r1(bx)} ${r1(by)}l6 16" stroke="#E0524A" stroke-width="3"/>`); }
  for (const [x, cols] of [[0.12, [c, '#F2C14E', '#E0524A']], [4.48, ['#F2C14E', c, '#8E6BB8']]]) {
    const [ax, ay] = L.P(x, 4.26, 1.0);
    L.add(9.3, cols.map((col, i) => { const dx = (i - 1) * 11, dy = -34 - (i % 2) * 12; return `<path d="M${r1(ax)} ${r1(ay)}Q${r1(ax + dx * 0.5)} ${r1(ay + dy * 0.5)} ${r1(ax + dx)} ${r1(ay + dy + 12)}" stroke="#B9C8D8" stroke-width="1" fill="none"/><ellipse class="globo" cx="${r1(ax + dx)}" cy="${r1(ay + dy)}" rx="9" ry="11" fill="${col}"/><ellipse cx="${r1(ax + dx - 3)}" cy="${r1(ay + dy - 4)}" rx="2.4" ry="3.4" fill="#FFFFFF" opacity=".45"/>`; }).join(''));
  }
  L.piso(0, 0, Array.from({ length: 26 }, (_, i) => `<rect x="${(i * 97) % 440 + 10}" y="${(i * 53) % 400 + 10}" width="10" height="5" rx="1" fill="${[c, '#F2C14E', '#E0524A', '#8E6BB8', '#F2F4F7'][i % 5]}" transform="rotate(${i * 37 % 90} ${(i * 97) % 440 + 15} ${(i * 53) % 400 + 12})"/>`).join(''), -40, 0.021);
}

// Placa del día 90 (E8): la medición contra la línea base, junto a la puerta
export function placa90(L) {
  L.planoY(0.35, 4.28, 1.45, 62, 40, `<rect width="62" height="40" rx="5" fill="#0E2A47" stroke="#17C3B2" stroke-width="2.5"/>` + mono(31, 16, 'DÍA 90', 9, '#7FD8CF', ' text-anchor="middle"') + `<path d="M20 26l7 6 14-12" stroke="#17C3B2" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, 9.4);
}

/* ───────── El Archivo: todos los casos, también los que no tienen local ───────── */
export function archivo(L, o = {}) {
  const colores = ['#6FAF6B', '#E0524A', '#17C3B2', '#E0B341', '#3E9C95', '#8E6BB8', '#F29A6B', '#35679A'];
  base(L, '#1B3F66');
  L.piso(0, 0, `<rect x="120" y="140" width="250" height="180" rx="16" fill="#224F7B"/><rect x="132" y="152" width="226" height="156" rx="10" fill="none" stroke="#7FD8CF" stroke-width="2" opacity=".5"/>`, -55);
  const estante = (w, h, filas, semilla) => {
    let s = `<rect width="${w}" height="${h}" fill="#0B2440"/>`;
    for (let f = 0; f < filas; f++) {
      const y0 = 8 + f * (h - 8) / filas, alto = (h - 8) / filas - 10;
      s += `<rect x="0" y="${r1(y0 + alto)}" width="${w}" height="6" fill="#8B6A4E"/>`;
      let x = 8, k = semilla + f * 7;
      while (x < w - 14) { k = (k * 9301 + 49297) % 233280; const a = 10 + (k % 3) * 3, col = colores[k % colores.length]; s += `<rect x="${x}" y="${r1(y0 + 4)}" width="${a}" height="${r1(alto - 4)}" rx="1.5" fill="${col}"/><rect x="${x + 2}" y="${r1(y0 + alto * 0.35)}" width="${a - 4}" height="6" fill="#F2F4F7" opacity=".85"/>`; x += a + 3; }
    }
    return s;
  };
  L.planoY(0.1, 0.02, 1.9, 300, 186, estante(300, 186, 4, 3));
  L.planoX(4.1, 1.9, 290, 186, estante(290, 186, 4, 11));
  L.planoY(3.25, 0.02, 1.9, 120, 90, `<rect width="120" height="90" rx="6" fill="#0B2B45" stroke="#0B1726" stroke-width="4"/>` + mono(10, 18, 'BUSCAR CASO', 9, '#7FD8CF') + `<rect x="10" y="26" width="100" height="16" rx="8" fill="#123459"/>` + mono(18, 37, 'clínica', 8, '#B9C8D8') +
    ['Salud', 'Comida', 'Obra'].map((t, i) => `<rect x="${10 + i * 34}" y="50" width="30" height="14" rx="7" fill="${[colores[2], colores[1], colores[3]][i]}"/>` + mono(13 + i * 34, 60, t, 6.4, '#0E2A47')).join('') + mono(10, 80, o.total || '30 casos', 8, '#F2F4F7'));
  // Mesa de lectura con fichas abiertas y su lámpara
  L.caja(1.5, 1.85, 0, 1.9, 1.0, 0.72, MADERA);
  L.caja(1.5, 1.85, 0.72, 1.9, 1.0, 0.04, { t: '#A8845E', l: '#8B6A4E', r: '#6E5238' }, 4.0);
  for (const [x, y, col] of [[1.65, 1.95, colores[0]], [2.2, 2.05, colores[1]], [2.75, 1.95, colores[2]], [1.9, 2.45, colores[3]], [2.55, 2.5, colores[5]]]) {
    const [px, py] = L.P(x, y, 0.77);
    L.add(4.05, `<g transform="matrix(.32,.16,-.32,.16,${r1(px)},${r1(py)})"><rect width="44" height="30" rx="2" fill="#F2F4F7"/><rect width="44" height="8" rx="2" fill="${col}"/><path d="M5 14h30M5 20h24" stroke="#8FA3B8" stroke-width="2"/></g>`);
  }
  L.linea([[3.2, 2.0, 0.76], [3.25, 2.0, 1.3], [3.0, 2.1, 1.42]], '#3A424E', 2, 4.2);
  { const [lx, ly] = L.P(3.0, 2.1, 1.38); L.add(4.21, `<ellipse cx="${r1(lx)}" cy="${r1(ly)}" rx="9" ry="5" fill="#F2C14E"/><ellipse cx="${r1(lx)}" cy="${r1(ly + 14)}" rx="26" ry="11" fill="#FFE7B0" opacity=".2"/>`); }
  L.planta(0.4, 3.8, 0, undefined, 0.7);
}
