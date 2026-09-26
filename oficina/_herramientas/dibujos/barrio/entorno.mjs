// Entorno de la oficina, de noche: piso, pasto, paseo, árboles, faroles, bancas, letreros y agua.
// Todo en coordenadas del mundo (las de escena.js). k = profundidad (x + y) para el orden de dibujo.
import { P } from './maqueta.mjs';
const r1 = (n) => Math.round(n * 10) / 10;
const FUENTE = `font-family="'Space Grotesk','DejaVu Sans',sans-serif"`, MONO = `font-family="'Space Mono','DejaVu Sans Mono',monospace"`;
export const txt = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${FUENTE} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;
export const mono = (x, y, t, fs, color, extra = '') => `<text x="${x}" y="${y}" ${MONO} font-weight="700" font-size="${fs}" fill="${color}"${extra}>${t}</text>`;

export const COL = {
  piso: '#163A60', pisoLinea: 'rgba(23,195,178,.09)', losaIzq: '#0E2A47', losaDer: '#091D33',
  muroX: '#10304F', muroY: '#15395E', muroTope: '#2A5A88', zocalo: '#0B2440',
  paseo: '#2A4560', paseoLinea: 'rgba(185,200,216,.09)', solera: '#4A6582', calle: '#18222F', calleLinea: 'rgba(233,238,244,.55)',
  pasto: '#1C4A44', pasto2: '#23574F', camino: '#4B627B', caminoBorde: '#5E7892',
  hoja: ['#1B5244', '#236953', '#2E8263', '#46A079'], jacaranda: ['#5E4486', '#7B5CA8', '#9A7BC6', '#BFA3E2'],
  tronco: ['#5A4330', '#46331F'], madera: { t: '#8B6A4E', l: '#6E5238', r: '#5A4330' }, fierro: { t: '#3A424E', l: '#2A3038', r: '#1E232A' },
  luz: '#FFE7B0', agua: '#1C5A86'
};

const sombra = (c, t) => { const h = (s) => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const a = h(c), b = h('#061525'); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

// Losa flotante: piso y cantos del frente (hacia +y) y del costado derecho (hacia +x)
export function losa(E, x0, y0, x1, y1, color, o = {}) {
  const k = o.k ?? -2000;
  let s = E.poly([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], `fill="${color}"`);
  if (o.lineas) {
    let l = '';
    for (let x = Math.ceil(x0); x < x1; x++) l += E.poly([[x, y0, 0], [x, y1, 0]], '');
    for (let y = Math.ceil(y0); y < y1; y++) l += E.poly([[x0, y, 0], [x1, y, 0]], '');
    s += `<g stroke="${o.lineas}" stroke-width="1" fill="none">${l}</g>`;
  }
  if (o.frente !== false) s += E.poly([[x0, y1, 0], [x1, y1, 0], [x1, y1, -0.4], [x0, y1, -0.4]], `fill="${COL.losaIzq}"`);
  if (o.derecha !== false) s += E.poly([[x1, y0, 0], [x1, y1, 0], [x1, y1, -0.4], [x1, y0, -0.4]], `fill="${COL.losaDer}"`);
  if (o.borde) s += `<polyline points="${[[x0, y1], [x1, y1], [x1, y0]].map(([x, y]) => P(x, y, 0).map(r1).join(',')).join(' ')}" stroke="${o.borde}" stroke-width="1.5" fill="none"/>`;
  return E.add(k, s);
}
// Superficie sobre el piso (alfombra, pasto, pavimento) con un poco de altura para no pelear con el piso
export function superficie(E, pts, color, k = -1500, extra = '') { return E.add(k, E.poly(pts.map(([x, y]) => [x, y, 0.005]), `fill="${color}" ${extra}`)); }

// Pavimento de baldosas
export function paseo(E, x0, y0, x1, y1, o = {}) {
  const c = o.color || COL.paseo;
  let s = E.poly([[x0, y0, 0.006], [x1, y0, 0.006], [x1, y1, 0.006], [x0, y1, 0.006]], `fill="${c}"`);
  let l = '';
  const paso = o.paso || 1;
  for (let x = x0 + paso; x < x1 - 0.01; x += paso) l += E.poly([[x, y0, 0.007], [x, y1, 0.007]], '');
  for (let y = y0 + paso; y < y1 - 0.01; y += paso) l += E.poly([[x0, y, 0.007], [x1, y, 0.007]], '');
  s += `<g stroke="${o.linea || COL.paseoLinea}" stroke-width="1.2" fill="none">${l}</g>`;
  return E.add(o.k ?? -1400, s);
}

// Pasto con textura de matas
export function pasto(E, pts, o = {}) {
  let s = E.poly(pts.map(([x, y]) => [x, y, 0.006]), `fill="${o.color || COL.pasto}"`);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const [ax, bx, ay, by] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let semilla = o.semilla || 7, marcas = '';
  const rnd = () => { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; };
  const dentro = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const n = Math.round((bx - ax) * (by - ay) * (o.densidad ?? 0.9));
  for (let i = 0; i < n; i++) {
    const x = ax + rnd() * (bx - ax), y = ay + rnd() * (by - ay);
    if (!dentro(x, y)) continue;
    const [px, py] = P(x, y, 0);
    marcas += `M${r1(px - 3)} ${r1(py)}l1.5 -4.5M${r1(px)} ${r1(py)}l0 -6M${r1(px + 3)} ${r1(py)}l-1.5 -4.5`;
  }
  s += `<path d="${marcas}" stroke="${o.color2 || COL.pasto2}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
  return E.add(o.k ?? -1450, s);
}

// Camino de piedra: una franja que sigue una curva (puntos en el piso), con borde claro
export function camino(E, pts, ancho = 1.4, o = {}) {
  const d = pts.map(([x, y], i) => { const [px, py] = P(x, y, 0.01); E.marca(x, y, 0); return (i ? 'L' : 'M') + r1(px) + ' ' + r1(py); }).join('');
  // El ancho en pantalla cambia con la dirección; se usa el promedio de la proyección
  const w = ancho * 32 * 0.95;
  return E.add(o.k ?? -1300, `<path d="${d}" fill="none" stroke="${o.borde || COL.caminoBorde}" stroke-width="${r1(w + 5)}" stroke-linecap="round" stroke-linejoin="round" transform="scale(1 1)"/>` +
    `<path d="${d}" fill="none" stroke="${o.color || COL.camino}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    (o.puntos ? `<path d="${d}" fill="none" stroke="rgba(233,238,244,.14)" stroke-width="2" stroke-dasharray="2 14" stroke-linecap="round"/>` : ''));
}

// Árbol: tronco, sombra y copa en capas
export function arbol(E, x, y, o = {}) {
  const s = o.s ?? 1, c = o.tipo === 'jacaranda' ? COL.jacaranda : COL.hoja, zc = (o.alto ?? 1.9) * s;
  const [fx, fy] = P(x, y, 0), [tx, ty] = P(x, y, zc - 0.35 * s), [cx, cy] = P(x, y, zc);
  E.marca(x - 1, y - 1, zc + 1);
  const k = o.k ?? x + y + 0.3;
  let g = `<ellipse cx="${r1(fx + 6 * s)}" cy="${r1(fy + 2 * s)}" rx="${r1(30 * s)}" ry="${r1(12 * s)}" fill="#061525" opacity=".35"/>`;
  g += `<path d="M${r1(fx - 3.4 * s)} ${r1(fy)}L${r1(tx - 2.4 * s)} ${r1(ty)}H${r1(tx + 2.4 * s)}L${r1(fx + 3.4 * s)} ${r1(fy)}Z" fill="${COL.tronco[0]}"/><path d="M${r1(fx)} ${r1(fy)}L${r1(tx + 0.4 * s)} ${r1(ty)}H${r1(tx + 2.4 * s)}L${r1(fx + 3.4 * s)} ${r1(fy)}Z" fill="${COL.tronco[1]}"/>`;
  g += `<path d="M${r1(tx)} ${r1(ty + 8 * s)}l${r1(-9 * s)} ${r1(-10 * s)}M${r1(tx + 1)} ${r1(ty + 4 * s)}l${r1(8 * s)} ${r1(-9 * s)}" stroke="${COL.tronco[0]}" stroke-width="${r1(2.4 * s)}" stroke-linecap="round"/>`;
  const bolas = [[-17, 6, 21, 0], [17, 4, 20, 0], [0, 10, 20, 1], [-10, -12, 21, 1], [12, -14, 19, 2], [0, -24, 17, 2], [-6, -28, 9, 3], [-16, -8, 7, 3]];
  for (const [dx, dy, rr, i] of bolas) g += `<circle cx="${r1(cx + dx * s)}" cy="${r1(cy + dy * s)}" r="${r1(rr * s)}" fill="${c[i]}"/>`;
  if (o.tipo === 'jacaranda') for (const [dx, dy] of [[-20, 12], [22, 10], [6, 16], [-2, -30], [16, -22]]) g += `<circle cx="${r1(cx + dx * s)}" cy="${r1(cy + dy * s)}" r="${r1(3 * s)}" fill="${c[3]}" opacity=".8"/>`;
  return E.add(k, `<g class="arbol">${g}</g>`);
}

// Arbusto bajo (en macetero o suelto)
export function arbusto(E, x, y, o = {}) {
  const s = o.s ?? 1, [cx, cy] = P(x, y, 0.35 * s), k = o.k ?? x + y + 0.2;
  let g = '';
  if (o.macetero) { E.caja(x - 0.4 * s, y - 0.4 * s, 0, 0.8 * s, 0.8 * s, 0.4 * s, { t: '#4A6582', l: '#3A5470', r: '#2C4460' }, k - 0.01); }
  const z0 = o.macetero ? 0.4 * s : 0;
  const [bx, by] = P(x, y, z0 + 0.2 * s);
  for (const [dx, dy, rr, i] of [[-9, 2, 11, 0], [9, 2, 10, 1], [0, -7, 11, 2], [-3, -12, 6, 3]]) g += `<circle cx="${r1(bx + dx * s)}" cy="${r1(by + dy * s)}" r="${r1(rr * s)}" fill="${COL.hoja[i]}"/>`;
  E.marca(x, y, z0 + 0.8 * s);
  return E.add(k, g);
}

// Farol: poste, brazo, lámpara y su luz (en el suelo y alrededor)
export function farol(E, x, y, o = {}) {
  const h = o.alto ?? 2.7, k = o.k ?? x + y + 0.25;
  const [fx, fy] = P(x, y, 0), [tx, ty] = P(x, y, h);
  E.marca(x, y, h + 0.3);
  E.add(-1200 + (x + y) * 0.01, `<ellipse cx="${r1(fx)}" cy="${r1(fy)}" rx="78" ry="34" fill="url(#luz-farol-piso)"/>`);
  let g = `<rect x="${r1(fx - 3.2)}" y="${r1(fy - 5)}" width="6.4" height="6" rx="1.5" fill="#1E2A38"/>`;
  g += `<path d="M${r1(fx)} ${r1(fy)}V${r1(ty)}" stroke="#1E2A38" stroke-width="3.2"/><path d="M${r1(fx + 0.8)} ${r1(fy)}V${r1(ty)}" stroke="#2F3F52" stroke-width="1"/>`;
  g += `<path d="M${r1(tx)} ${r1(ty + 2)}q7 -9 16 -4" stroke="#1E2A38" stroke-width="2.6" fill="none"/>`;
  g += `<circle cx="${r1(tx + 16)}" cy="${r1(ty + 6)}" r="30" fill="url(#luz-farol)"/>`;
  g += `<path d="M${r1(tx + 10)} ${r1(ty + 1)}h12l-2 7h-8z" fill="#1E2A38"/><ellipse cx="${r1(tx + 16)}" cy="${r1(ty + 9)}" rx="5" ry="3" fill="${COL.luz}"/>`;
  return E.add(k, `<g class="farol">${g}</g>`);
}

// Banca de plaza, a lo largo de x (mira hacia +y) o de y (mira hacia +x)
export function banca(E, x, y, eje = 'x', o = {}) {
  const k = o.k ?? x + y + 0.2, L = o.largo ?? 1.5, W = 0.42;
  if (eje === 'x') {
    for (const dx of [0.12, L - 0.2]) E.caja(x + dx, y + 0.05, 0, 0.08, W - 0.1, 0.42, COL.fierro, k - 0.02);
    E.caja(x, y, 0.42, L, W, 0.06, COL.madera, k);
    E.caja(x, y, 0.48, L, 0.07, 0.38, COL.madera, k - 0.01);
  } else {
    for (const dy of [0.12, L - 0.2]) E.caja(x + 0.05, y + dy, 0, W - 0.1, 0.08, 0.42, COL.fierro, k - 0.02);
    E.caja(x, y, 0.42, W, L, 0.06, COL.madera, k);
    E.caja(x, y, 0.48, 0.07, L, 0.38, COL.madera, k - 0.01);
  }
  return E;
}

// Pizarra de vereda (letrero en A), mirando hacia +y
export function pizarra(E, x, y, lineas, o = {}) {
  const k = o.k ?? x + y + 0.3;
  E.caja(x, y, 0, 0.62, 0.1, 0.78, { t: '#6E5238', l: '#8B6A4E', r: '#5A4330' }, k);
  E.planoY(x + 0.05, y + 0.101, 0.73, `<rect width="52" height="64" rx="3" fill="#1F2A26"/>` + lineas.map((t, i) => mono(5, 15 + i * 13, t, i ? 7.6 : 8.4, i ? '#E8DFC8' : (o.color || '#F2C14E'))).join(''), k + 0.001, 52, 64);
  return E;
}

// Letrero colgante perpendicular a la fachada (visible de lado), en x = x0 entre y0 e y0 + 0.9
export function bandera(E, x0, y0, z, texto, o = {}) {
  const k = o.k ?? x0 + y0 + 0.9, w = o.ancho ?? 100, h = 34;
  E.linea([[x0, y0, z + 0.12], [x0, y0 + w / 100 + 0.1, z + 0.12]], '#1E2A38', 2.4, k - 0.001);
  E.planoX(x0, y0 + w / 100 + 0.05, z + 0.08, `<rect width="${w}" height="${h}" rx="5" fill="${o.fondo || '#0E2A47'}" stroke="${o.borde || '#7FD8CF'}" stroke-width="2.5"/>` + txt(w / 2, 23, texto, o.fs || 15, o.color || '#F2F4F7', ' text-anchor="middle"'), k, w, h);
  return E;
}

// Agua (estanque) en el piso, con reflejos
export function estanque(E, x, y, rx, ry, o = {}) {
  const [cx, cy] = P(x, y, 0.01);
  E.marca(x - rx, y - ry, 0); E.marca(x + rx, y + ry, 0);
  const sx = rx * 32 * 1.41, sy = ry * 16 * 1.41;
  return E.add(o.k ?? -1250, `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(sx + 8)}" ry="${r1(sy + 5)}" fill="#5E7892"/><ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(sx)}" ry="${r1(sy)}" fill="url(#agua)"/>` +
    `<g class="onda" stroke="#7FD8CF" stroke-width="1.6" fill="none" opacity=".5"><path d="M${r1(cx - sx * 0.5)} ${r1(cy - 4)}q10 -4 20 0M${r1(cx + sx * 0.1)} ${r1(cy + sy * 0.3)}q12 -4 24 0M${r1(cx - sx * 0.2)} ${r1(cy + sy * 0.55)}q8 -3 16 0"/></g>`);
}

// Muro alto de fondo sobre el plano y = 0 (de x0 a x1), con tope
export function muroFondoY(E, x0, x1, y, h, o = {}) {
  const k = o.k ?? -1800;
  let s = E.poly([[x0, y, 0], [x1, y, 0], [x1, y, h], [x0, y, h]], `fill="${o.color || COL.muroY}"`);
  s += E.poly([[x0, y, 0], [x1, y, 0], [x1, y, 0.14], [x0, y, 0.14]], `fill="${COL.zocalo}"`);
  s += E.poly([[x0, y - 0.3, h], [x1, y - 0.3, h], [x1, y, h], [x0, y, h]], `fill="${o.tope || COL.muroTope}"`);
  if (o.fin !== false) s += E.poly([[x1, y - 0.3, -0.4], [x1, y, -0.4], [x1, y, h], [x1, y - 0.3, h]], `fill="#0E2A47"`);
  return E.add(k, s);
}

// Ventanas altas con la cordillera de noche (igual que escena.js), en el plano y = y0
export function cordillera(w, h, semilla) {
  let s = `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#cielo)"/>`;
  let pp = ['0,' + h], x = 0, k = semilla;
  while (x < w) { k = (k * 9301 + 49297) % 233280; const alto = 18 + (k / 233280) * 40; pp.push(r1(x + 22) + ',' + r1(h - alto)); x += 44 + (k % 30); pp.push(r1(x) + ',' + r1(h - 10 - (k % 14))); }
  pp.push(w + ',' + h);
  s += `<polygon points="${pp.join(' ')}" fill="#0B2340"/>`;
  for (let e = 0; e < w / 90; e++) { k = (k * 9301 + 49297) % 233280; s += `<circle cx="${r1(e * 90 + k % 80)}" cy="${r1(6 + k % 20)}" r="1.6" fill="#F2F4F7" opacity=".7"/>`; }
  for (let m = 60; m < w; m += 150) s += `<rect x="${m}" y="0" width="5" height="${h}" fill="${COL.zocalo}"/>`;
  return s + `<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="${COL.zocalo}" stroke-width="5"/>`;
}

// Sombra suave bajo un grupo de personas o un objeto
export function sombraPiso(E, x, y, rx, ry, k) { const [px, py] = P(x, y, 0); return E.add(k ?? x + y, `<ellipse cx="${r1(px)}" cy="${r1(py)}" rx="${rx}" ry="${ry}" fill="#061525" opacity=".3"/>`); }

// Definiciones (gradientes) que usa el entorno
export const DEFS_ENTORNO = `<radialGradient id="luz-farol"><stop offset="0" stop-color="#FFE7B0" stop-opacity=".55"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="luz-farol-piso"><stop offset="0" stop-color="#FFE7B0" stop-opacity=".2"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="luz-local"><stop offset="0" stop-color="#FFE7B0" stop-opacity=".16"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient>` +
  `<linearGradient id="agua" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17446F"/><stop offset="1" stop-color="#1C6A8E"/></linearGradient>` +
  `<pattern id="obra-rayas" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="14" height="14" fill="#1B2A3A"/><rect width="6" height="14" fill="rgba(224,179,65,.55)"/></pattern>`;

export { sombra };
