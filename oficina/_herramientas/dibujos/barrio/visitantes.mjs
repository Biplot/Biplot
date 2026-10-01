// Visitantes (NPC) de la oficina: mismo trazo cabezón del equipo, sin placa y con ropa de todos los días.
// Coordenadas de personaje (las del kit): mira a la derecha en 3/4, pies en y ≈ 50, cabeza local = (x - 7, y - 1).
import { figura, cara, rr, elipse, puntos, T, BLANCO } from '../cabezones/kit.mjs';

const r = (n) => Math.round(n * 100) / 100;
// Punto de una curva cuadrática y la curva cortada en t (para mangas cortas)
const q = (a, c, b, t) => [a[0] * (1 - t) ** 2 + 2 * c[0] * t * (1 - t) + b[0] * t * t, a[1] * (1 - t) ** 2 + 2 * c[1] * t * (1 - t) + b[1] * t * t];
const corta = (a, c, b, t) => { const c1 = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t], p = q(a, c, b, t); return `M${r(a[0])} ${r(a[1])}Q${r(c1[0])} ${r(c1[1])} ${r(p[0])} ${r(p[1])}`; };
const curva = (a, c, b) => `M${r(a[0])} ${r(a[1])}Q${r(c[0])} ${r(c[1])} ${r(b[0])} ${r(b[1])}`;

export const PIEL = {
  clara: ['#F3CFB0', '#DDAE8C'], media: ['#E0AC82', '#C48C63'], trigo: ['#D39A6A', '#B47A4C'],
  morena: ['#B97A4E', '#96603A'], oscura: ['#8A5534', '#6C3F24'], rosada: ['#F1C4A8', '#D9A386']
};

const TORSO = {
  ancho: { d: 'M9 24C11 23 22.4 23 24.4 24Q25.3 24.5 25.2 25.8L24.3 36.4H9.6L8.6 25.8Q8.4 24.5 9 24Z', s: 'M22.6 24.1C23.9 24.3 25.1 24.9 25.2 25.9L24.3 36.3H22.8Z', I: [9.2, 25.2], D: [24.5, 25.3] },
  fino: { d: 'M10 24C11.8 23.2 21.6 23.2 23.4 24Q24.2 24.4 24.1 25.6L23.4 36.4H10.4L9.6 25.6Q9.5 24.4 10 24Z', s: 'M21.8 24C23 24.2 24 24.7 24.1 25.7L23.4 36.3H22Z', I: [10.1, 25.1], D: [23.6, 25.2] }
};

// Brazos: [control, mano] desde el hombro. La mano queda en la punta.
const BRAZO_D = {
  abajo: [[25.8, 29.6], [25, 33.4]], sostiene: [[26.2, 29.6], [22.8, 31.4]], saluda: [[27.8, 23.8], [27.4, 18.6]],
  telefono: [[27.6, 25.6], [24.8, 20.6]], senala: [[27.4, 26.4], [30.2, 24.4]], cadera: [[28, 28.4], [25.4, 31.4]],
  correa: [[26.6, 29.4], [27.8, 32.2]], alto: [[27.2, 24.6], [27, 19.8]], frente: [[27, 28.6], [28.4, 30.2]]
};
const BRAZO_I = {
  abajo: [[7.8, 29.6], [8.8, 33.4]], sostiene: [[7.8, 29.6], [11.6, 31.4]], alto: [[6.6, 23.6], [6.6, 18.6]],
  atras: [[7.2, 28.8], [6.6, 32.6]], frente: [[8.4, 30], [12.6, 30.6]]
};

function mano(f, [x, y], piel, o = {}) {
  if (o.abierta) {
    f.forma(rr(x - 1.4, y - 2.6, 2.8, 3.2, 0.9), piel[0], { w: 0.45 });
    f.forma(rr(x + 0.9, y - 1.4, 1.2, 1.9, 0.55), piel[0], { w: 0.4 });
    return;
  }
  f.forma(elipse(x, y + 0.4, 1.15, 1.05), piel[0], { w: 0.4 });
}

// Zapatos (dx para abrir las piernas al caminar)
function zapato(f, x, y, capa, suela, franja, alto = 4) {
  f.forma(`M${x + 0.6} ${y}H${x + 5.4}Q${x + 6} ${y + 1.3} ${x + 6.6} ${y + 1.9}Q${x + 7} ${y + 2.4} ${x + 6.9} ${y + alto - 1}L${x + 6.9} ${y + alto}H${x}V${y + 1.6}Q${x} ${y} ${x + 0.6} ${y}Z`, capa);
  if (suela) f.forma(rr(x, y + alto - 1.1, 6.9, 1.1, 0.4), suela, { w: 0.4 });
  if (franja) f.linea(`M${x + 1.4} ${y + 1.5}Q${x + 2.8} ${y + 1.2} ${x + 4.2} ${y + 1.6}`, 0.6, franja);
}

// Piernas: parado, caminando o sentado. Devuelve la altura de los pies.
function piernasDe(f, o) {
  const [c, s] = o.abajoCol, piel = o.piel;
  const zc = o.zapatos || ['#F2F4F7', '#B9C8D8', null];
  const pose = o.piernas || 'parado';
  const tipo = o.abajo || 'pantalon';
  if (pose === 'sentado') {
    // Muslos hacia adelante (a la derecha), canillas hacia abajo; el asiento lo pone la escena
    if (tipo === 'falda') f.forma('M10.2 35.4H24.6Q28.6 35.6 28.8 38.4L28.6 40.2H10.4Z', c);
    else f.forma('M10.4 35.8H24.4Q28.2 35.8 28.4 38.6L28.2 40.8H10.6Z', c);
    f.mancha('M22 39.4H28.3L28.2 40.7H22Z', s);
    const canilla = tipo === 'short' || tipo === 'falda' ? piel : [c, s];
    f.forma('M23.8 40.2H28.2L27.9 46.2H24.1Z', canilla[0]); f.mancha('M27 40.4H28.1L27.8 46H27Z', canilla[1]);
    zapato(f, 23.6, 46, zc[0], zc[1], zc[2], 3.6);
    return 49.6;
  }
  const camina = pose === 'camina';
  const Li = camina ? ['M11.2 37.4H16.2L14.2 45.6H9.2Z', -1.8] : ['M11 37.4H16L15.9 45.6H11.2Z', 0];
  const Ld = camina ? ['M17.4 37.4H22.4L25 45.4H19.8Z', 2.2] : ['M17.4 37.4H22.4L22.3 45.6H17.6Z', 0];
  let pieY = 46.1;
  if (tipo === 'falda' || tipo === 'vestido') {
    // Piernas (medias o piel) bajo la falda
    const m = o.medias || piel;
    f.forma(Li[0], m[0]); f.forma(Ld[0], m[0]);
    if (tipo === 'falda') { f.forma('M10.4 35.6H23.4L25.4 42.4H8.6Z', c); f.mancha('M21.8 35.8H23.3L25.2 42.3H23.6Z', s); }
  } else if (tipo === 'short') {
    f.forma(Li[0], piel[0]); f.forma(Ld[0], piel[0]);
    f.mancha(camina ? 'M15 38H16L14.6 45.4H13.6Z' : 'M14.9 38H15.9L15.8 45.4H14.9Z', piel[1]);
    f.forma('M10.8 36.2H22.8L23.4 41.4H17.2L16.8 39.2L16 41.4H10.2Z', c); f.mancha('M21.4 36.4H22.7L23.2 41.2H21.8Z', s);
  } else {
    f.forma('M10.8 36.2H22.6L22.5 38.4H10.9Z', c);
    f.forma(Li[0], c); f.forma(Ld[0], c);
    f.mancha(camina ? 'M15.2 37.7H16.1L14.2 45.4H13.2Z' : 'M14.9 37.7H15.8L15.7 45.4H14.9Z', s);
    f.mancha(camina ? 'M21.3 37.7H22.3L24.8 45.2H23.7Z' : 'M21.3 37.7H22.2L22.1 45.4H21.3Z', s);
  }
  zapato(f, 10.2 + Li[1], pieY, zc[0], zc[1], zc[2]);
  zapato(f, 17.4 + Ld[1], pieY, zc[0], zc[1], zc[2]);
  return pieY + 4;
}

// Pelo por detrás (antes del cuerpo)
function peloAtras(f, estilo, c, lazo) {
  if (estilo === 'largo') f.forma('M0.6 10C-0.2 16 0 22.4 0.6 27.4Q5 29 10 28.2Q15 29 19.4 27.4C20 22.4 20.2 16 19.4 10Z', c[0], { cab: true });
  if (estilo === 'melena') f.forma('M0.8 10C0.2 14.4 0.4 18.6 1 21.8Q5.4 23 10 22.4Q14.6 23 19 21.8C19.6 18.6 19.8 14.4 19.2 10Z', c[0], { cab: true });
  if (estilo === 'cola') {
    f.tubo('M3.4 3.6Q-2.6 6 -1.6 14.2Q-1 17.6 -2.6 19.4', c[0], 2.6, { cab: true });
    f.forma(rr(1.2, 2.6, 2.6, 2.2, 0.8), lazo || '#17C3B2', { cab: true, w: 0.4 });
  }
  if (estilo === 'trenza') {
    for (let i = 0; i < 5; i++) f.forma(elipse(-0.4 - i * 0.2, 9 + i * 2.6, 1.6, 1.5), c[0], { cab: true, w: 0.4 });
    f.forma(rr(-2.2, 21.6, 3, 1.4, 0.5), lazo || '#E0B341', { cab: true, w: 0.35 });
  }
}

// Pelo por delante y sombreros (después de la cara)
function peloAdelante(f, estilo, c) {
  const [h, hs, hl] = c;
  const tapa = 'M1.6 11.4C0.8 6.6 2.4 1.6 7.6 0.6C12.2 -0.2 16.4 0.8 17.9 4.2C18.8 6.4 18.7 9 18.3 11.2L17.3 11.2C17.2 9.6 16.8 8.6 16.2 8.2C13.4 8.6 10 8.4 7.4 7.8C6 8.6 4.6 9.8 3.8 11.6C3 11.8 2.2 11.8 1.6 11.4Z';
  const sombraTapa = 'M16.4 2.8C17.8 4 18.7 6.6 18.3 11.1L17.4 11.1C17.3 9.4 16.9 8.6 16.4 8.2C16.9 6.4 16.9 4.6 16.4 2.8Z';
  switch (estilo) {
    case 'corto': case 'cola': case 'trenza':
      f.forma(tapa, h, { cab: true }); f.mancha(sombraTapa, hs, { cab: true });
      f.linea('M3.8 4.4Q6 2 9.2 1.6', 0.55, hl, { cab: true });
      break;
    case 'peinado':
      // Corto con partidura y copete
      f.forma('M1.6 11.4C0.6 6.8 2 1.6 7 0.2C11 -0.6 15.8 0.2 17.6 3.6C18.6 5.6 18.6 8.6 18.3 11.2L17.3 11.2C17.1 9.4 16.6 8.4 15.6 8C13.8 6.4 12.6 5 12.2 3.8C10.8 5.6 8 7.2 5.4 8.4C4.4 9.2 3.8 10.4 3.4 11.8C2.6 11.8 2 11.7 1.6 11.4Z', h, { cab: true });
      f.mancha(sombraTapa, hs, { cab: true });
      f.linea('M12.2 3.8Q13.4 1.8 15.6 1.8', 0.5, hl, { cab: true });
      break;
    case 'largo': case 'melena':
      f.forma('M2 10.4C1 4.8 4.4 0.3 9.8 0.1C15 0.3 18.6 4.4 18 10.4C16.2 9 14.2 7.8 11.6 7.2C9.2 6.8 6.6 7.4 4.6 8.4C3.4 9 2.6 9.6 2 10.4Z', h, { cab: true });
      f.forma(estilo === 'largo' ? 'M2.2 9.2C0.8 13 1 18 1.4 23.4Q2.8 24.2 4.4 23.4L4.6 9.6Z' : 'M2.2 9.2C1 12.6 1.2 16.6 1.6 20.2Q3 20.8 4.4 20.2L4.6 9.6Z', h, { cab: true });
      f.mancha('M14.8 1.4C16.8 2.8 18.2 5.8 18 10.2L17.2 9.8C17.2 7.2 16.4 4.4 14.8 1.4Z', hs, { cab: true });
      f.linea('M4.6 5.6Q6.8 2.4 10.4 1.6', 0.55, hl, { cab: true });
      break;
    case 'mono':
      f.forma(elipse(4.6, 0.6, 3.3, 3), h, { cab: true });
      f.forma(tapa, h, { cab: true }); f.mancha(sombraTapa, hs, { cab: true });
      f.linea('M3.2 -0.8Q4.6 -2 6.4 -1.6', 0.5, hl, { cab: true });
      f.linea('M5.2 3.4Q8.8 1.6 12.6 2.4', 0.45, hs, { cab: true });
      break;
    case 'rizado':
      f.forma('M0.8 11.6C-1 8 0.2 3.6 3 2C3.8 -0.6 7 -1.8 9.8 -1C12.4 -2 15.6 -1 16.8 1.4C19.4 2.4 20.4 5.8 19.4 9C19.8 10.4 19.2 11.6 18.4 12L17.2 11.4C17 9.8 16.4 8.9 15.8 8.6C12.4 9 8.4 9 5.4 8.4C4.4 9.2 3.8 10.4 3.4 11.8C2.4 12 1.4 12 0.8 11.6Z', h, { cab: true });
      for (const [x, y] of [[3.6, 3.6], [7.4, 1.4], [11.4, 1.2], [15, 2.6], [5.4, 6.4], [9.6, 5], [13.8, 5.8], [17.2, 6.6], [2.4, 8.4]]) f.linea(`M${x - 0.7} ${y}q0.7 -0.8 1.4 0`, 0.45, hs, { cab: true });
      f.linea('M4.2 1.8Q6.2 0 8.6 0', 0.5, hl, { cab: true });
      break;
    case 'calvo':
      f.forma('M3.1 9.6C3.1 3 6.4 0.4 10 0.4C13.6 0.4 16.9 3 16.9 9.6Z', c[3] || '#E0AC82', { cab: true, w: 0.5 });
      f.linea('M6.4 2.6Q8.4 1.6 10.4 1.8', 0.55, 'rgba(255,255,255,.55)', { cab: true });
      f.forma('M1.6 13.4C1 11 1.6 9 3 8.4L5 8.6L4.2 13.4Z', h, { cab: true });
      f.forma('M17 8.4C18.4 9 18.8 10.8 18.4 12.6L16.8 12.6Z', h, { cab: true });
      break;
    case 'jockey':
      f.forma('M1.4 11C0.8 5 4 0.8 9.8 0.6C15.2 0.6 18.4 4 18.4 9.4L17.2 9.8C14 8.8 8 8.6 3.8 9.4Z', h, { cab: true });
      f.forma('M15.6 8.6Q21.6 7.6 24.2 9.4Q23.4 11 17 10.8Z', hs, { cab: true, w: 0.45 });
      f.forma(elipse(9.8, 0.6, 1.1, 0.7), hl, { cab: true, w: 0.35 });
      f.linea('M5.8 2.6Q8 1.6 10.2 1.8', 0.5, hl, { cab: true });
      break;
    case 'casco':
      f.forma('M1 9.8C1 3.4 4.8 -0.4 10.2 -0.4C15.6 -0.4 19.4 3.4 19.4 9.8Z', h, { cab: true });
      f.forma(rr(-0.6, 8.8, 21.6, 1.9, 0.8), hs, { cab: true, w: 0.45 });
      f.linea('M10.2 -0.2V8.6', 0.9, hs, { cab: true });
      f.linea('M4.6 3.2Q6.6 1.4 8.8 1', 0.6, hl, { cab: true });
      break;
    case 'moto':
      f.forma('M0.4 16.6C-0.6 5.6 3.8 -0.8 10.2 -0.8C16.6 -0.8 20.8 5 19.8 15.4L17.6 15.6L17.4 10.6Q10.4 9.4 3.4 10.6L3.2 16.6Z', h, { cab: true });
      f.forma('M3.2 9.4Q10.4 8 17.8 9.4L18 11.2Q10.4 10 3.2 11.2Z', hs, { cab: true, w: 0.4 });
      f.linea('M5 3.2Q7.4 1 10.4 0.6', 0.6, hl, { cab: true });
      break;
    case 'lana':
      f.forma('M1.2 10.4C0.8 4.6 4.6 0.2 10 0.2C15.4 0.2 19 4.2 18.8 10.2Z', h, { cab: true });
      f.forma(rr(0.6, 8, 18.8, 3, 1.1), hs, { cab: true, w: 0.45 });
      f.forma(elipse(10, -0.6, 1.8, 1.6), hl, { cab: true, w: 0.4 });
      for (const x of [3, 5.6, 8.2, 10.8, 13.4, 16]) f.linea(`M${x} 8.6V10.4`, 0.35, h, { cab: true });
      break;
  }
}

// Torso según la prenda
function torso(f, o) {
  const tb = TORSO[o.cuerpo || 'ancho'];
  const [c, s, d] = o.arribaCol;
  switch (o.arriba) {
    case 'vestido':
      f.forma(o.cuerpo === 'fino' ? 'M10 24C11.8 23.2 21.6 23.2 23.4 24Q24.2 24.4 24.1 25.6L23.8 33.2L25.8 43H8.2L10 33.2L9.6 25.6Q9.5 24.4 10 24Z' : 'M9 24C11 23 22.4 23 24.4 24Q25.3 24.5 25.2 25.8L24.6 33.2L26.4 43H7.6L9.4 33.2L8.6 25.8Q8.4 24.5 9 24Z', c);
      f.mancha('M22.2 24.2C23.4 24.4 24.1 24.9 24.1 25.8L23.8 33.2L25.7 42.9H23.8L22.4 33.4Z', s);
      f.forma(rr(9.8, 32.2, 14.4, 1.4, 0.5), d, { w: 0.35, sil: false });
      return tb;
    case 'chef':
      f.forma(tb.d, c); f.mancha(tb.s, s);
      f.forma('M13.4 22.6H20.6L20.8 24.6H13.2Z', c, { w: 0.4, sil: false });
      f.linea('M20.4 24.2Q18.4 29.6 20.2 36.2', 0.45, s);
      f.mancha(puntos([[16.4, 27.2], [16.4, 30.4], [16.4, 33.6], [21.8, 27.2], [21.8, 30.4], [21.8, 33.6]], 0.42), d);
      return tb;
    case 'delantal':
      f.forma(tb.d, c); f.mancha(tb.s, s);
      f.forma('M12.2 27.2H22L23 44H11.4Z', d[0]); f.mancha('M20.6 27.4H21.9L22.9 43.9H21.4Z', d[1]);
      f.linea('M12.4 27.4Q16.8 22.6 21.8 27.4', 0.55, d[0]);
      f.forma(rr(14.4, 34.6, 5.6, 3.4, 0.5), d[1], { w: 0.35, sil: false });
      return tb;
    case 'chaleco':
      f.forma(tb.d, c); f.mancha(tb.s, s);
      f.forma('M9.2 24.2C10.6 23.4 12.4 23.2 13.8 23.2L14 36.4H9.6L8.6 25.8Z', d[0]);
      f.forma('M24.2 24.2C22.8 23.4 21 23.2 19.6 23.2L19.4 36.4H24.3L25.2 25.8Z', d[0]);
      for (const y of [30.2, 33.4]) { f.mancha(`M9.2 ${y}H14V${y + 1.1}H9.3Z`, d[1]); f.mancha(`M19.4 ${y}H24.8L24.7 ${y + 1.1}H19.4Z`, d[1]); }
      return tb;
    case 'blazer':
      f.forma('M14 23H20L20.2 36.2H13.8Z', d[0]);
      f.forma('M9 24C10.4 23.2 12.4 23 14.2 23L15.8 36.4H9.6L8.6 25.8Q8.4 24.5 9 24Z', c);
      f.forma('M24.4 24C23 23.2 21 23 19.4 23L18.2 36.4H24.3L25.2 25.8Q25.3 24.5 24.4 24Z', c);
      f.mancha('M22.6 23.6Q25.1 23.9 25.2 25.8L24.3 36.3H22.8Z', s);
      f.forma('M14.2 23.2L16.4 29.4L13.4 26.4Z', s, { w: 0.35, sil: false }); f.forma('M19.4 23.2L17.4 29.4L20.4 26.4Z', s, { w: 0.35, sil: false });
      f.mancha(puntos([[16.2, 32.2]], 0.45), d[1] || T);
      return tb;
    case 'poleron':
      f.forma('M11 22.2Q16.8 20.4 22.6 22.2L22.2 24.8Q16.8 23.6 11.4 24.8Z', s, { w: 0.45 });
      f.forma(tb.d, c); f.mancha(tb.s, s);
      f.forma(rr(12, 30.6, 10, 3.8, 0.8), d || s, { w: 0.4 });
      f.linea('M15.2 24.2V27.6M18.4 24.2V27.2', 0.4, BLANCO);
      return tb;
    case 'deportiva':
      f.forma(o.cuerpo === 'fino' ? 'M12 24C13.2 23.3 20.4 23.3 21.6 24Q22.6 25.4 23.6 25.8L23.4 36.4H10.4L10.4 25.8Q11.2 25.2 12 24Z' : 'M11.6 24C13 23.2 20.8 23.2 22.2 24Q23.4 25.4 24.6 25.8L24.3 36.4H9.6L9.4 25.8Q10.6 25.2 11.6 24Z', c);
      f.mancha('M21.4 24.4Q22.6 25.4 23.6 25.8L23.4 36.3H21.8Z', s);
      if (d) f.linea('M10.6 30.6H23.4', 0.9, d);
      return tb;
    case 'chaqueta':
      f.forma('M14.2 23H19.6L19.8 36.2H14Z', d[0]);
      f.forma(tb.d, c); f.mancha(tb.s, s);
      f.forma('M14.4 23.2H19.4L19.6 36.3H14.2Z', d[0], { w: 0.35, sil: false });
      f.linea('M14.4 23.6V36M19.4 23.6V36', 0.6, s);
      if (d[1]) f.mancha('M15.6 27.4H18.2V29.6H15.6Z', d[1]);
      return tb;
    case 'parka':
      f.forma(tb.d, c); f.mancha(tb.s, s);
      for (const y of [27, 30.2, 33.4]) f.linea(`M9.2 ${y}Q16.8 ${y + 0.8} 24.8 ${y}`, 0.45, s);
      f.linea('M16.9 23.4V36.2', 0.55, d || s);
      f.forma('M11.2 22.4Q16.8 21.2 22.4 22.4L22.2 24.4Q16.8 23.4 11.4 24.4Z', s, { w: 0.4 });
      return tb;
    case 'cardigan':
      f.forma('M14.4 23H19.4L19.6 36.2H14.2Z', d[0]);
      f.forma(tb.d, c); f.mancha(tb.s, s);
      f.forma('M14.6 23.2L17 36.3H14.2Z', d[0], { w: 0.3, sil: false }); f.forma('M19.2 23.2L17 36.3H19.6Z', d[0], { w: 0.3, sil: false });
      f.mancha(puntos([[14.6, 28], [14.9, 31], [15.2, 34]], 0.38), s);
      return tb;
    default: // polera
      f.forma(tb.d, c); f.mancha(tb.s, s);
      f.forma('M14.4 23.1Q16.8 25 19.2 23.1', 'none', { w: 0.45, sil: false });
      if (d) { const dd = Array.isArray(d) ? d : [d]; f.mancha(dd[1] || `M14.6 28H19V31H14.6Z`, dd[0]); }
      return tb;
  }
}

// Objetos que se llevan en las manos o a la espalda
function objetoAtras(f, obj) {
  if (obj === 'mochila') { f.forma(rr(4.6, 24.4, 6.4, 10.4, 1.4), '#35679A'); f.linea('M5.6 29.4H10.2', 0.45, '#17446F'); }
  if (obj === 'delivery') {
    f.forma(rr(0.6, 19.6, 12, 13, 1), '#17C3B2'); f.mancha('M9.8 19.9H12.3V32.3H9.8Z', '#0A8A7E');
    f.forma(rr(2.4, 23.4, 6.4, 2.6, 0.6), '#F2F4F7', { w: 0.35, sil: false }); f.linea('M3.4 24.7H7.6', 0.5, '#0A8A7E');
  }
  if (obj === 'guitarra-atras') f.tubo('M5 22Q2 30 4 40', '#8B6A4E', 1.6);
}
function objetoAdelante(f, obj, o) {
  const piel = o.piel;
  switch (obj) {
    case 'tablet': f.forma(rr(20.2, 28.8, 6, 7, 0.6), '#0E2A47'); f.mancha(rr(20.9, 29.6, 4.6, 5.4, 0.3), '#7FD8CF'); f.linea('M21.8 32.6L23 31.4L24.2 32.2L25 30.6', 0.4, '#0E2A47'); break;
    case 'celular': f.forma(rr(21.6, 29.2, 2.8, 4.4, 0.5), '#1C1C1E'); f.mancha(rr(22, 29.8, 2, 3.2, 0.3), '#7FD8CF'); break;
    case 'telefono': f.forma(rr(23.6, 17.6, 2.2, 4.6, 0.5), '#1C1C1E'); break;
    case 'bandeja':
      f.forma('M15.6 30.2H29.4Q29.6 31.6 28.6 31.8H16.4Q15.4 31.6 15.6 30.2Z', '#3A2E26', { w: 0.4 });
      f.forma('M18 30.2Q18.2 27.6 20.6 27.4Q23 27.6 23.2 30.2Z', '#F2F4F7', { w: 0.4 }); f.mancha('M18.8 29.4Q20.6 28.6 22.4 29.4', '#E0B341');
      f.forma(rr(24.4, 28, 2.4, 2.4, 0.4), '#C8474A', { w: 0.4 });
      break;
    case 'plato':
      f.forma(elipse(24.4, 30.4, 3.6, 1.1), '#F2F4F7', { w: 0.4 });
      for (const [x, cc] of [[22.8, '#F29A6B'], [24.4, '#C8474A'], [26, '#F29A6B']]) { f.forma(rr(x - 0.8, 28.6, 1.6, 1.2, 0.5), BLANCO, { w: 0.3, sil: false }); f.mancha(rr(x - 0.8, 28.4, 1.6, 0.6, 0.3), cc); }
      break;
    case 'caja':
      f.forma('M11 27.6H23.4L23.6 36.2H10.8Z', '#C9A27A'); f.mancha('M21.6 27.8H23.3L23.5 36H21.8Z', '#A8845E');
      f.linea('M16.9 27.8V36', 0.8, '#E8DFC8');
      break;
    case 'mancuerna':
      f.linea('M26.6 31.8H31', 0.9, '#6B7A8C');
      f.forma(rr(25.2, 30, 1.8, 3.6, 0.4), '#35679A', { w: 0.4 }); f.forma(rr(30.6, 30, 1.8, 3.6, 0.4), '#35679A', { w: 0.4 });
      break;
    case 'toalla': f.forma('M19.8 23Q22.4 22.6 23.8 24L23.2 31.8L21 31.6Z', '#F2F4F7', { w: 0.4 }); break;
    case 'bolsa':
      f.forma(rr(23, 33.4, 5, 5.8, 0.5), o.bolsaCol || '#E8DFC8'); f.linea('M24.2 33.6Q25.5 31.8 26.8 33.6', 0.5, T);
      break;
    case 'bolso':
      f.linea('M20.4 23.4Q15 28 10.6 33.2', 0.6, o.bolsoCol || '#6E4A30');
      f.forma(rr(6.6, 32, 5.4, 4.6, 0.7), o.bolsoCol || '#6E4A30');
      f.linea('M7.4 33.6H11.2', 0.4, '#E0B341');
      break;
    case 'carpeta': f.forma('M5.6 26.8L10.2 25.6L11.4 33.2L6.8 34.4Z', '#E0B341'); f.linea('M6.4 28L9.8 27.1', 0.4, '#8C6D22'); break;
    case 'plano': f.tubo('M5.8 29.4L12.4 24.6', '#F4ECD8', 1.6); f.linea('M6.2 30L12.8 25.2', 0.3, '#6FA0D0'); break;
    case 'llave': f.tubo('M27 31.4L30.4 35.4', '#B9C8D8', 0.8); f.forma('M29.6 35.2A1.4 1.4 0 1 0 31.8 36.6L30.8 35.8Z', '#B9C8D8', { w: 0.35 }); break;
    case 'camara': f.forma(rr(22.4, 17.8, 5.2, 3.6, 0.5), '#1C1C1E'); f.forma(elipse(25.8, 19.6, 1.3, 1.3), '#35679A', { w: 0.35 }); f.mancha(rr(22.8, 17, 1.6, 1, 0.3), '#1C1C1E'); break;
    case 'taza': f.forma(rr(22, 29.6, 2.6, 2.8, 0.4), '#F2F4F7'); f.tubo('M24.6 30.4Q25.8 30.6 25.6 31.6', '#F2F4F7', 0.4); break;
    // El balde de cabritas, a rayas, con las cabritas asomando
    case 'cabritas':
      f.forma('M20.4 27.6H26L25.2 33.6H21.2Z', '#F2F4F7', { w: 0.45 });
      f.linea('M22.1 27.8L22.5 33.4M23.2 27.8V33.4M24.3 27.8L23.9 33.4', 0.7, '#17C3B2');
      for (const [x, y, r] of [[21.2, 27.2, 1.2], [22.6, 26.6, 1.3], [24, 26.8, 1.25], [25.2, 27.3, 1.1], [23.3, 27.5, 1]]) f.forma(elipse(x, y, r, r * 0.9), '#FFF3C4', { w: 0.35 });
      break;
    case 'guitarra':
      f.forma('M6.8 38.6Q4.4 35 7.4 32.6Q8.8 31.4 10.4 32.4Q12.4 30.2 14.8 31.6Q17.4 33.4 15.6 36.4Q14.4 38.2 12.6 38.4Q10 41.4 6.8 38.6Z', '#C9824E');
      f.mancha(elipse(11.4, 35.4, 1.3, 1.2), T);
      f.tubo('M13.2 33.8L26.4 24.2', '#6E4A30', 1.1);
      f.forma(rr(25.6, 22.2, 2.8, 2.6, 0.5), '#3A2E26', { w: 0.35 });
      break;
    case 'globo':
      f.linea('M6.6 17.6Q5.2 8 7.8 -4', 0.35, '#B9C8D8');
      f.forma(elipse(8.2, -8.8, 4.2, 5), '#17C3B2'); f.mancha(elipse(6.8, -10.8, 1, 1.6), '#7FD8CF');
      f.forma('M7.4 -3.6L8.2 -4.4L9 -3.6Z', '#0A8A7E', { w: 0.3 });
      break;
    case 'baston': f.tubo('M25.6 33.6L27.8 49.8', '#6E4A30', 0.8); f.tubo('M25.6 33.6Q25.8 32 27.2 32.4', '#6E4A30', 0.8); break;
    case 'babero': f.forma('M13.4 24.4H20.4L20.8 30.6H13Z', '#9FD3E6', { w: 0.35, sil: false }); f.linea('M13.6 24.6Q16.9 23 20.2 24.6', 0.35, '#B9C8D8'); break;
    case 'trapo': f.forma('M8.6 34.6L11.4 34.2L11.8 38.8L10.2 39.6L8.8 38.4Z', '#C8474A', { w: 0.35 }); break;
    case 'espejo': f.tubo('M22.6 31.2L26.6 27.4', '#B9C8D8', 0.5); f.forma(elipse(26.9, 27.1, 0.9, 0.9), '#DDF4F1', { w: 0.35 }); break;
    case 'libreta': f.forma(rr(21.2, 29.2, 5, 6, 0.4), '#F4ECD8'); f.linea('M22 31H25.4M22 32.6H25.4', 0.35, '#8FA3B8'); f.tubo('M26.8 27.6L25 32', '#35679A', 0.5); break;
  }
}

// Cara: rasgos extra
function rasgos(f, o) {
  const [s, S] = o.piel;
  if (o.lentes === 'redondos') { f.forma(elipse(8.6, 14, 1.9, 1.8), 'rgba(221,244,241,.5)', { cab: true, w: 0.5, sil: false }); f.forma(elipse(13.9, 14, 1.7, 1.8), 'rgba(221,244,241,.5)', { cab: true, w: 0.5, sil: false }); f.linea('M10.5 13.8Q11.2 13.3 12.2 13.8', 0.45, T, { cab: true }); f.linea('M6.7 13.6L3.4 12.8', 0.45, T, { cab: true }); }
  if (o.lentes === 'rectos') { f.forma(rr(6.4, 12.6, 4.4, 3, 0.5), 'rgba(221,244,241,.5)', { cab: true, w: 0.55, sil: false }); f.forma(rr(12.2, 12.6, 3.8, 3, 0.5), 'rgba(221,244,241,.5)', { cab: true, w: 0.55, sil: false }); f.linea('M10.8 13.6H12.2', 0.45, T, { cab: true }); f.linea('M6.4 13.4L3.4 12.8', 0.45, T, { cab: true }); }
  if (o.lentes === 'sol') { f.forma(rr(6.2, 12.6, 4.6, 2.8, 0.9), '#1C1C1E', { cab: true, w: 0.4, sil: false }); f.forma(rr(12, 12.6, 4, 2.8, 0.9), '#1C1C1E', { cab: true, w: 0.4, sil: false }); f.linea('M10.8 13.4H12', 0.45, T, { cab: true }); }
  if (o.bigote) f.forma('M10 17.2Q11.8 16.2 13.8 17Q14.4 18 13.2 18Q11.8 17.6 10.8 18Q9.6 18.2 10 17.2Z', o.bigote, { cab: true, w: 0.35, sil: false });
  if (o.barba) f.forma('M3.6 16.8C4 20.8 6.8 23 10.8 23C14.6 23 16.8 20.6 17 16.8C15.8 18.8 14 19.6 12.2 19.6C10.8 18.8 9.6 18.8 8.4 19.6C6.4 19.6 4.6 18.6 3.6 16.8Z', o.barba, { cab: true, w: 0.4 });
  if (o.aros) f.linea('M2.5 16A1 1.2 0 1 0 2.6 18.4', 0.55, o.aros, { cab: true });
  if (o.mascarilla) {
    f.linea('M3.4 15.6Q2.2 18.6 5.2 20.4', 0.35, '#B9C8D8', { cab: true });
    f.forma('M5 19.6Q10.6 18.6 16.4 19.4Q16.2 22.4 11 22.8Q6 22.6 5 19.6Z', o.mascarilla, { cab: true, w: 0.4, sil: false });
    f.linea('M6.4 20.6Q10.8 19.9 15.2 20.5', 0.3, 'rgba(11,23,38,.35)', { cab: true });
  }
  if (o.audifonos) {
    f.tubo('M2.2 11Q1.6 -1.4 10 -1.2Q18.4 -1.4 17.8 11', '#1C1C1E', 0.9, { cab: true });
    f.forma(rr(0.2, 10.6, 3.6, 5, 1.2), o.audifonos, { cab: true, w: 0.45 });
  }
}

// Persona completa
export function persona(o) {
  const f = figura();
  const piel = o.piel || PIEL.media;
  const pelo = o.pelo || ['#2B2622', '#1A1613', '#4A3F36'];
  const estilo = o.peinado || 'corto';
  peloAtras(f, estilo, pelo, o.lazo);
  objetoAtras(f, o.atras);
  const pies = piernasDe(f, { ...o, piel });
  const tb = torso(f, { ...o, piel });
  // Brazo izquierdo (atrás del objeto que se sostiene)
  const bi = BRAZO_I[o.brazoI || 'abajo'], bd = BRAZO_D[o.brazoD || 'abajo'];
  const manga = o.manga || 'larga';
  const colBrazo = o.arriba === 'deportiva' ? piel[0] : o.arribaCol[0];
  const brazo = (h, b, lado) => {
    const d = curva(h, b[0], b[1]);
    if (manga === 'corta' && o.arriba !== 'deportiva') {
      f.tubo(d, piel[0], 2.1);
      f.tubo(corta(h, b[0], b[1], 0.38), o.arribaCol[0], 2.5);
    } else f.tubo(d, colBrazo, 2.3);
    if (o.puno && manga === 'larga') { const p = q(h, b[0], b[1], 0.9); f.forma(elipse(p[0], p[1], 1.25, 0.8), o.puno, { w: 0.35 }); }
    mano(f, b[1], piel, { abierta: lado === 'D' && (o.brazoD === 'saluda' || o.brazoD === 'alto') });
  };
  brazo(tb.I, bi, 'I');
  if (o.objetoI) objetoAdelante(f, o.objetoI, { ...o, piel });
  // Cabeza
  cara(f, { piel: piel[0], sombra: piel[1], ojos: o.ojos || 'chicos', boca: o.boca || 'sonrisa', labio: o.labio, rubor: o.rubor, cejas: o.cejas || pelo[1], oreja: !['largo', 'melena', 'moto'].includes(estilo) });
  rasgos(f, { ...o, piel });
  peloAdelante(f, estilo, [...pelo.slice(0, 3), piel[0]]);
  if (o.sombrero) peloAdelante(f, o.sombrero, o.sombreroCol);
  if (o.cintillo) { f.forma('M1.4 8.6Q10 7.2 18.6 8.4L18.5 10.2Q10 9 1.3 10.4Z', o.cintillo, { cab: true, w: 0.4 }); f.forma('M1.6 8.8L-1.2 7.8L-0.8 10.6Z', o.cintillo, { cab: true, w: 0.35 }); }
  // Brazo derecho y lo que lleva
  brazo(tb.D, bd, 'D');
  if (o.objeto) objetoAdelante(f, o.objeto, { ...o, piel });
  if (o.objeto2) objetoAdelante(f, o.objeto2, { ...o, piel });
  f.pies = pies;
  return f;
}

// Perro quiltro: mira a la derecha, patas en y ≈ 50
export function perro(o = {}) {
  const c = o.color || ['#C9924E', '#A87A45', '#F4DDA8'];
  const f = figura();
  f.tubo('M8 38Q4.6 35.4 5.4 31.4', c[0], 1.6);
  for (const [x, s] of [[9.4, c[1]], [13, c[0]], [20.6, c[1]], [24, c[0]]]) f.forma(rr(x, 41.6, 2.6, 7.6, 0.8), s);
  f.forma('M7.8 38.4C7.8 35.6 10.6 34.4 14.6 34.4H21.6C25.4 34.4 27.2 36.2 27 39.4C26.8 42 24.6 43.4 21.4 43.4H12.8C9.8 43.4 7.8 41.6 7.8 38.4Z', c[0]);
  f.mancha('M11.6 40.6Q17 42.6 23.4 40.8Q22.4 43.2 20.4 43.3H13.2Q11.8 42.4 11.6 40.6Z', c[2]);
  // Cabeza
  f.forma('M21.6 33.2C21.4 29 24 26.6 27.6 26.6C31 26.6 33.4 28.8 33.4 31.6Q35.6 32 35.8 33.8Q35.8 35.8 33.2 36.2Q30.6 37.6 27.2 37.4C23.8 37.2 21.8 35.8 21.6 33.2Z', c[0]);
  f.mancha('M30 33.8Q33 34.2 35.6 33.8Q35.4 35.8 33.2 36Q31.2 36.6 29.4 35.8Z', c[2]);
  f.forma('M22.6 29.4Q21.4 25.4 24.4 24.6Q26 26 25.4 29.4Z', c[1], { w: 0.45 });
  f.mancha(elipse(35.2, 32.8, 0.9, 0.7), T);
  f.raw(`<g class="pj-ojo"><path d="${elipse(30.2, 30.6, 0.75, 0.9)}" fill="${T}"/></g>`);
  f.linea('M33.4 35Q34.4 35.8 35.4 35', 0.45, T);
  if (o.collar) f.forma('M22.8 34.4Q25.4 37.6 28.6 37.2L28.4 38.6Q24.8 39 22.2 35.6Z', o.collar, { w: 0.35 });
  f.pies = 49.2;
  return f;
}

// ───────── El elenco de visitantes ─────────
const JEAN = ['#35679A', '#27507C'], OSCURO = ['#2A3038', '#1E232A'], CAQUI = ['#C9B28A', '#A8936A'], NEGRO = ['#1F2733', '#141A23'];
const Z = {
  blancas: ['#F2F4F7', '#B9C8D8', '#17C3B2'], cafe: ['#6E4A30', '#4A3222', null], negras: ['#1F2733', '#0B1726', null],
  grises: ['#B9C8D8', '#6B7A8C', null], botas: ['#8B6A4E', '#4A3222', null], rojas: ['#C8474A', '#F2F4F7', '#F2F4F7']
};
export const VISITANTES = {
  // Clienta que viene a conversar con BiPlot
  clienta: () => persona({ piel: PIEL.trigo, pelo: ['#2B2622', '#1A1613', '#4A3F36'], peinado: 'mono', cuerpo: 'fino', arriba: 'blazer', arribaCol: ['#D9A441', '#B8862A', ['#F2F4F7', '#8C6D22']], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.negras, brazoI: 'abajo', objetoI: 'bolso', bolsoCol: '#6E4A30', brazoD: 'saluda', aros: '#E0B341', ojos: 'grandes', boca: 'dientes', labio: '#B24A4A' }),
  // Dueño de negocio, con su celular
  cliente: () => persona({ piel: PIEL.clara, pelo: ['#8E949C', '#6B7178', '#C4C9CF'], peinado: 'peinado', arriba: 'cardigan', arribaCol: ['#35679A', '#27507C', ['#F2F4F7']], abajo: 'pantalon', abajoCol: CAQUI, zapatos: Z.cafe, brazoD: 'sostiene', objeto: 'celular', lentes: 'rectos' }),
  // Matrimonio que mira parcelas
  senora: () => persona({ piel: PIEL.rosada, pelo: ['#E4E7EB', '#B9C0C8', '#FFFFFF'], peinado: 'rizado', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#8E6BB8', '#6E4E96', ['#F2F4F7']], abajo: 'falda', abajoCol: ['#3A4A5A', '#2A3848'], medias: ['#C4A088', '#A88670'], zapatos: Z.negras, brazoI: 'abajo', objetoI: 'bolso', bolsoCol: '#4A3222', brazoD: 'senala', lentes: 'redondos', rubor: '#E9967A' }),
  senor: () => persona({ piel: PIEL.clara, pelo: ['#DADDE2', '#AEB4BB', '#FFFFFF'], peinado: 'calvo', arriba: 'chaqueta', arribaCol: ['#8B7355', '#6E5A42', ['#F2F4F7', '#35679A']], abajo: 'pantalon', abajoCol: ['#4A5260', '#39404C'], zapatos: Z.cafe, brazoD: 'cadera', bigote: '#DADDE2', boca: 'media' }),
  // Vendedora de Fundos, con la tablet del loteo
  vendedora: () => persona({ piel: PIEL.media, pelo: ['#4A3222', '#2E1F15', '#7A5334'], peinado: 'cola', cuerpo: 'fino', arriba: 'blazer', arribaCol: ['#3E7A4E', '#2F6440', ['#F2F4F7', '#1F3B2A']], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.negras, brazoD: 'sostiene', objeto: 'tablet', brazoI: 'abajo', ojos: 'grandes', aros: '#E0B341' }),
  // Haru: el itamae y la mesera
  chef: () => persona({ piel: PIEL.clara, pelo: ['#1A1613', '#0B0908', '#3A322C'], peinado: 'corto', arriba: 'chef', arribaCol: ['#F2F4F7', '#C4D2E0', '#35679A'], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, cintillo: '#F2F4F7', brazoD: 'sostiene', objeto: 'plato', ojos: 'felices', boca: 'sonrisa' }),
  mesera: () => persona({ piel: PIEL.morena, pelo: ['#1A1613', '#0B0908', '#3A322C'], peinado: 'mono', cuerpo: 'fino', arriba: 'delantal', arribaCol: ['#F2F4F7', '#C4D2E0', ['#1F2733', '#141A23']], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.negras, brazoD: 'sostiene', objeto: 'bandeja', ojos: 'grandes' }),
  comensal: () => persona({ piel: PIEL.trigo, pelo: ['#6E4A30', '#4A3222', '#8B6A4E'], peinado: 'corto', arriba: 'poleron', arribaCol: ['#C8474A', '#A8352F', '#A8352F'], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', barba: '#6E4A30' }),
  comensal2: () => persona({ piel: PIEL.clara, pelo: ['#B5532E', '#8E3E20', '#D27A4E'], peinado: 'largo', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#E8DFC8', '#CFC2A3'], manga: 'corta', abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.negras, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', ojos: 'grandes', rubor: '#E9967A' }),
  // Repartidor con la mochila térmica
  repartidor: () => persona({ piel: PIEL.morena, pelo: ['#1A1613', '#0B0908', '#3A322C'], peinado: 'corto', sombrero: 'moto', sombreroCol: ['#F2F4F7', '#1F2733', '#FFFFFF'], arriba: 'parka', arribaCol: ['#1F2733', '#141A23', '#17C3B2'], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.negras, atras: 'delivery', brazoD: 'sostiene', objeto: 'celular', piernas: 'camina' }),
  // Eleven: socios del gimnasio
  atleta: () => persona({ piel: PIEL.media, pelo: ['#2B2622', '#1A1613', '#4A3F36'], peinado: 'cola', lazo: '#17C3B2', cuerpo: 'fino', arriba: 'deportiva', arribaCol: ['#17C3B2', '#0A8A7E', null], abajo: 'pantalon', abajoCol: ['#1F2733', '#141A23'], zapatos: Z.blancas, objeto: 'toalla', brazoD: 'abajo', piernas: 'camina', ojos: 'felices' }),
  atleta2: () => persona({ piel: PIEL.oscura, pelo: ['#1A1613', '#0B0908', '#3A322C'], peinado: 'rizado', arriba: 'deportiva', arribaCol: ['#35679A', '#27507C', '#F2F4F7'], abajo: 'short', abajoCol: ['#1F2733', '#141A23'], zapatos: Z.rojas, brazoD: 'frente', objeto: 'mancuerna', boca: 'dientes' }),
  // Nu Home: maestro de la obra y familia que visita
  maestro: () => persona({ piel: PIEL.trigo, pelo: ['#2B2622', '#1A1613', '#4A3F36'], peinado: 'corto', sombrero: 'casco', sombreroCol: ['#E0B341', '#B8902E', '#F2D98A'], arriba: 'chaleco', arribaCol: ['#8FA3B8', '#6B7A8C', ['#F5883A', '#E8EEF4']], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.botas, brazoD: 'frente', objeto: 'llave', brazoI: 'abajo', objetoI: 'plano', bigote: '#2B2622' }),
  mama: () => persona({ piel: PIEL.clara, pelo: ['#7A5334', '#5A3C24', '#A87A45'], peinado: 'melena', cuerpo: 'fino', arriba: 'polera', arribaCol: ['#E0B341', '#C49A2E'], manga: 'corta', abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, brazoI: 'abajo', objetoI: 'bolso', bolsoCol: '#8B6A4E', brazoD: 'senala', ojos: 'grandes', rubor: '#E9967A' }),
  nino: () => persona({ piel: PIEL.clara, pelo: ['#C9924E', '#A87A45', '#EBC98F'], peinado: 'corto', arriba: 'polera', arribaCol: ['#17C3B2', '#0A8A7E'], manga: 'corta', abajo: 'short', abajoCol: ['#35679A', '#27507C'], zapatos: Z.rojas, brazoI: 'alto', objetoI: 'globo', brazoD: 'abajo', ojos: 'grandes', boca: 'dientes', rubor: '#EBA08A' }),
  // Rumbo: caminante con la app y audífonos
  caminante: () => persona({ piel: PIEL.trigo, pelo: ['#1A1613', '#0B0908', '#3A322C'], peinado: 'largo', cuerpo: 'fino', arriba: 'chaqueta', arribaCol: ['#2A7C78', '#1F5F5C', ['#DDF4F1', null]], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'celular', audifonos: '#17C3B2', piernas: 'camina', ojos: 'grandes' }),
  // Paseo: abuelo con bastón, músico, estudiante, paseadora de perro, turista
  abuelo: () => persona({ piel: PIEL.clara, pelo: ['#F2F4F7', '#C4C9CF', '#FFFFFF'], peinado: 'calvo', sombrero: 'jockey', sombreroCol: ['#4A5260', '#39404C', '#6B7A8C'], arriba: 'chaqueta', arribaCol: ['#6E5A42', '#584836', ['#E8DFC8', null]], abajo: 'pantalon', abajoCol: ['#8B8272', '#6E6658'], zapatos: Z.cafe, brazoD: 'abajo', objeto: 'baston', bigote: '#F2F4F7', lentes: 'redondos', boca: 'media' }),
  musico: () => persona({ piel: PIEL.morena, pelo: ['#2B2622', '#1A1613', '#4A3F36'], peinado: 'corto', sombrero: 'lana', sombreroCol: ['#C8474A', '#A8352F', '#F2F4F7'], arriba: 'polera', arribaCol: ['#1F2733', '#141A23', ['#E0B341', 'M14.6 27.4H19.2V29.8H14.6Z']], manga: 'corta', abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.botas, brazoI: 'frente', brazoD: 'frente', objeto: 'guitarra', barba: '#2B2622', ojos: 'felices' }),
  estudiante: () => persona({ piel: PIEL.oscura, pelo: ['#1A1613', '#0B0908', '#3A322C'], peinado: 'trenza', lazo: '#E0B341', cuerpo: 'fino', arriba: 'poleron', arribaCol: ['#8E6BB8', '#6E4E96', '#6E4E96'], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, atras: 'mochila', brazoD: 'sostiene', objeto: 'celular', piernas: 'camina', ojos: 'grandes' }),
  paseadora: () => persona({ piel: PIEL.media, pelo: ['#D9A441', '#B8862A', '#F4DDA8'], peinado: 'cola', cuerpo: 'fino', arriba: 'parka', arribaCol: ['#3E7A4E', '#2F6440', '#1F3B2A'], abajo: 'pantalon', abajoCol: NEGRO, zapatos: Z.botas, brazoD: 'correa', piernas: 'camina', ojos: 'grandes', rubor: '#E9967A' }),
  turista: () => persona({ piel: PIEL.rosada, pelo: ['#EBC98F', '#C9A26A', '#F8E6BE'], peinado: 'corto', sombrero: 'jockey', sombreroCol: ['#F2F4F7', '#C4D2E0', '#17C3B2'], arriba: 'polera', arribaCol: ['#F29A6B', '#D97E50'], manga: 'corta', abajo: 'short', abajoCol: CAQUI, zapatos: Z.blancas, brazoD: 'telefono', objeto: 'camara', atras: 'mochila', lentes: 'sol' }),
  perro: () => perro({ collar: '#17C3B2' }),
  // Sentados (bancas, sillones): lectora con tablet y señor con café
  lectora: () => persona({ piel: PIEL.oscura, pelo: ['#1A1613', '#0B0908', '#3A322C'], peinado: 'rizado', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#C9824E', '#A8683A', ['#F2F4F7']], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.cafe, piernas: 'sentado', brazoD: 'sostiene', objeto: 'tablet', brazoI: 'frente', lentes: 'redondos', ojos: 'grandes' }),
  // Plantillas nuevas: clínica dental y taller mecánico
  dentista: () => persona({ piel: PIEL.morena, pelo: ['#2B2622', '#1A1613', '#4A3F36'], peinado: 'mono', cuerpo: 'fino', arriba: 'blazer', arribaCol: ['#F2F4F7', '#C4D2E0', ['#5FB8B0', '#0A8A7E']], abajo: 'pantalon', abajoCol: ['#5FB8B0', '#3E9C95'], zapatos: Z.blancas, brazoD: 'sostiene', objeto: 'espejo', lentes: 'rectos', mascarilla: '#9FD3E6', ojos: 'grandes' }),
  paciente: () => persona({ piel: PIEL.clara, pelo: ['#6E4A30', '#4A3222', '#8B6A4E'], peinado: 'corto', arriba: 'polera', arribaCol: ['#E0B341', '#C49A2E'], manga: 'corta', abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'frente', brazoI: 'frente', objeto: 'babero', ojos: 'felices' }),
  recepcionista: () => persona({ piel: PIEL.media, pelo: ['#8E3E20', '#6E2C14', '#B5532E'], peinado: 'melena', cuerpo: 'fino', arriba: 'cardigan', arribaCol: ['#2A7C78', '#1F5F5C', ['#F2F4F7']], abajo: 'pantalon', abajoCol: OSCURO, zapatos: Z.negras, audifonos: '#17C3B2', brazoD: 'saluda', ojos: 'grandes', rubor: '#E9967A' }),
  mecanico: () => persona({ piel: PIEL.trigo, pelo: ['#2B2622', '#1A1613', '#4A3F36'], peinado: 'corto', sombrero: 'jockey', sombreroCol: ['#C8474A', '#A8352F', '#F2F4F7'], arriba: 'polera', arribaCol: ['#35557A', '#27425F', ['#E0B341', 'M19.4 26.6H22.6V29.2H19.4Z']], abajo: 'pantalon', abajoCol: ['#35557A', '#27425F'], zapatos: Z.botas, brazoD: 'frente', objeto: 'llave', objetoI: 'trapo', bigote: '#2B2622' }),
  tomacafe: () => persona({ piel: PIEL.media, pelo: ['#4A3F36', '#2B2622', '#6E625A'], peinado: 'peinado', arriba: 'parka', arribaCol: ['#8B3A3A', '#6E2C2C', '#5A2424'], abajo: 'pantalon', abajoCol: JEAN, zapatos: Z.blancas, piernas: 'sentado', brazoD: 'sostiene', objeto: 'taza', brazoI: 'frente', barba: '#4A3F36', ojos: 'felices' })
};

// Medidas para la escena: centro de los pies y altura del piso de la figura (como medidas.json)
export function medida(id, f) {
  if (id === 'perro') return { cx: 21, pie: 50.2, alto: 28, ancho: 34 };
  const sentado = ['comensal', 'comensal2', 'lectora', 'tomacafe', 'paciente'].includes(id);
  return sentado ? { cx: 15.6, pie: 38.6, sentado: true, alto: 50, ancho: 30 } : { cx: 16.8, pie: (f.pies || 50.1) + 1.9, alto: (f.pies || 50.1) + 14, ancho: 30 };
}
