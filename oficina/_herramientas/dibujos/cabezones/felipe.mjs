// Felipe (le dicen Rodman) en vector, versión oficina: la otra cara real, que graba con Aby. Dos vestuarios, como ella.
// Urbano: chaqueta de trabajo negra abierta sobre polera negra, cadena dorada, pantalón ancho gris con manchas y
// zapatillas grises; hace girar una pelota de básquetbol en el índice. Elegante: esmoquin con solapas de satén, humita
// roja, zapatos de charol con calcetines rojos, el micrófono y la pelota bajo el brazo. En los dos, el pelo al ras
// teñido en zigzag rojo y negro con las puntas amarillas, como Rodman, y la flor de Tyler, the Creator en la solapa.
import { figura, cara, zapatillas, piernas, credencial, rr, elipse, puntos, T } from './kit.mjs';

const K = {
  s: '#E8B996', S: '#CF9C74', ce: '#2B1D16', la: '#7A2E2A',
  pn: '#17120F', pr: '#C8242B', pa: '#EAB92C',
  ch: '#2A2E35', chs: '#1B1E23', chl: '#3B414B', et: '#C9A66B',
  po: '#141619', or: '#D9A441',
  pg: '#B3B8C0', pgs: '#979DA7', pm: '#4A4F57',
  za: '#3E434B', zs: '#F2F4F7', zf: '#9AA1AA',
  ba: '#E07F2E', bs: '#B85F1C', bl: '#F6B26B', ci: '#17C3B2',
  fl: '#F2C94C', fc: '#8A5A12'
};

// El pelo al ras (cabeza local): la silueta del cráneo, con patillas y la línea de la frente.
const PELO = 'M2.7 11.7C1.6 8.4 1.9 4.6 4.5 2.4C6.6 0.7 13.3 0.6 15.6 2.2C18.2 4 18.9 7.9 17.6 11.5L16.6 11.7C16.4 10.3 16 9.3 15.2 8.7C12.2 7.8 7.8 7.8 4.8 8.7C4 9.3 3.6 10.5 3.5 11.8Z';
// Tres zigzag rojos sobre el negro, en fase, como el corte de Rodman
const ZIGZAG = [
  'M5.6 3.4L7.3 2.4L9 3.4L10.7 2.4L12.4 3.4L14.1 2.4L15.3 3.1',
  'M3.6 5.6L5.3 4.6L7 5.6L8.7 4.6L10.4 5.6L12.1 4.6L13.8 5.6L15.5 4.6L16.8 5.3',
  'M4.4 7.4L6.1 6.6L7.8 7.4L9.5 6.6L11.2 7.4L12.9 6.6L14.6 7.4L15.8 6.8'
];
// Hacia los lados el zigzag se vuelve amarillo, y las patillas también
const PUNTAS = ['M3.6 5.6L5.3 4.6', 'M15.5 4.6L16.8 5.3', 'M4.4 7.4L6.1 6.6', 'M14.6 7.4L15.8 6.8'];
const PATILLAS = [
  'M2.75 8.6C2.5 9.6 2.6 10.6 2.95 11.45L3.45 11.55C3.6 10.4 4 9.35 4.7 8.8L4.5 8.3Z',
  'M17.45 8.6C17.6 9.6 17.5 10.5 17.3 11.3L16.75 11.45C16.55 10.3 16.15 9.35 15.45 8.85L15.7 8.3Z'
];
// Las puntas cortas del pelo sobre la frente
const RAS = 'M6.1 8.55L6 9M8 8.15L7.95 8.6M10 8.05V8.5M12 8.15L12.05 8.6M13.9 8.5L14 8.95';

// Mancha irregular del estampado del pantalón (seis puntas suaves).
function manchita(cx, cy, rx, ry, giro = 0) {
  const n = 6, p = [];
  for (let i = 0; i < n; i++) {
    const a = giro + (i / n) * Math.PI * 2, k = i % 2 ? 0.68 : 1;
    p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  const m = (a, b) => `${((a[0] + b[0]) / 2).toFixed(2)} ${((a[1] + b[1]) / 2).toFixed(2)}`;
  let d = `M${m(p[n - 1], p[0])}`;
  for (let i = 0; i < n; i++) d += `Q${p[i][0].toFixed(2)} ${p[i][1].toFixed(2)} ${m(p[i], p[(i + 1) % n])}`;
  return d + 'Z';
}

// Cara tranquila y el pelo de Rodman (igual en los dos vestuarios)
function cabeza(f) {
  cara(f, { piel: K.s, sombra: K.S, ojos: 'grandes', cejas: K.ce, boca: 'sonrisa', labio: K.la });
  f.forma(PELO, K.pn, { cab: true });
  for (const d of ZIGZAG) f.linea(d, 1, K.pr, { cab: true });
  for (const d of PUNTAS) f.linea(d, 1, K.pa, { cab: true });
  for (const d of PATILLAS) f.mancha(d, K.pa, { cab: true });
  f.forma(PELO, 'none', { cab: true, sil: false });
  f.linea(RAS, 0.3, K.pn, { cab: true });
}
// La flor amarilla de cinco pétalos, por Tyler
function flor(f, x, y) {
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    f.mancha(elipse(x + Math.cos(a) * 0.55, y + Math.sin(a) * 0.55, 0.42, 0.42), K.fl);
  }
  f.mancha(elipse(x, y, 0.3, 0.3), K.fc);
}

// ───────── Urbano ─────────
export function felipe() {
  const f = figura();
  // Zapatillas grises con suela blanca (van antes: el pantalón ancho cae encima)
  zapatillas(f, 46.4, K.za, K.zs, K.zf);
  // Pantalón ancho gris con manchas
  f.forma('M10.5 35.8H16.9L16.8 47.6H9.5Z', K.pg);
  f.forma('M16.9 35.8H23.5L24.5 47.6H17.3Z', K.pg);
  f.mancha('M15.4 36.2H16.8L16.7 47.4H15Z', K.pgs);
  f.mancha('M22.2 36.2H23.5L24.4 47.4H23Z', K.pgs);
  f.mancha([
    [11.8, 37.8, 0.9, 0.6, 0.3], [14.4, 39.6, 0.8, 0.6, 1.2], [11.6, 41.8, 1, 0.7, 2], [14.2, 43.8, 0.9, 0.6, 0.6], [11.2, 45.8, 0.9, 0.6, 1.6],
    [18.8, 37.6, 0.9, 0.6, 1], [21.3, 39.4, 0.8, 0.6, 0.2], [18.9, 41.8, 1, 0.7, 1.4], [21.6, 43.6, 0.9, 0.6, 2.2], [19.2, 45.9, 0.9, 0.6, 0.8]
  ].map((m) => manchita(...m)).join(''), K.pm);
  f.linea('M9.8 47.1Q13 46.5 16.6 47.1M17.5 47.1Q21 46.5 24.3 47.1', 0.35, K.pgs);
  // Polera negra y cadena dorada
  f.forma('M13.4 23.1H20.4L20.6 36.2H13.2Z', K.po);
  f.linea('M14 23.4Q17 27.2 19.9 23.4', 0.4, K.or);
  f.mancha(elipse(16.95, 26.35, 0.4, 0.45), K.or);
  // Chaqueta de trabajo abierta, hasta la cadera
  f.forma('M9.2 24C10.4 23.3 12.2 23 13.8 23L13.6 36.8H9.7L8.7 25.6Q8.6 24.4 9.2 24Z', K.ch);
  f.forma('M24.6 24C23.4 23.3 21.6 23 20 23L20.2 36.8H24.1L25.1 25.6Q25.2 24.4 24.6 24Z', K.ch);
  f.mancha('M22.8 23.4Q25.1 23.7 25.1 25.6L24.1 36.7H22.6Z', K.chs);
  f.forma('M13.8 23L15.1 25.2L13.7 26.4Z', K.chl, { w: 0.35, sil: false });
  f.forma('M20 23L18.7 25.2L20.1 26.4Z', K.chl, { w: 0.35, sil: false });
  f.linea('M13.1 26.8V36.4M20.7 26.8V36.4', 0.25, K.chl);
  // Bolsillo de pecho con su etiqueta, y bolsillo de abajo
  f.forma(rr(20.8, 26.8, 2.7, 2.8, 0.3), K.ch, { w: 0.35, sil: false });
  f.mancha(rr(21.4, 27.4, 1.4, 0.6, 0.15), K.et);
  f.forma(rr(9.8, 31.6, 3.3, 3, 0.3), K.ch, { w: 0.35, sil: false });
  // Credencial y la florcita en la solapa
  credencial(f, 10.6, 26.8);
  flor(f, 12.4, 24.9);
  // Brazo abajo, con la mano al bolsillo
  f.tubo('M24.4 25.2Q25.8 29.8 24.4 33.4', K.ch, 2.3);
  f.forma(rr(22.9, 32.9, 2.9, 1.1, 0.4), K.chl, { w: 0.35 });
  f.forma(elipse(24.2, 34.6, 1.05, 0.9), K.s, { w: 0.4 });
  cabeza(f);
  // Brazo en alto: la pelota gira en la punta del índice
  f.tubo('M9.2 24.8Q6.6 23 6.2 19.2', K.ch, 2.3);
  f.forma(rr(4.8, 18.4, 2.9, 1.2, 0.4), K.chl, { w: 0.35 });
  f.forma(rr(5, 15.9, 2.5, 2.8, 0.9), K.s, { w: 0.45 });
  f.tubo('M6.3 16.2V13.4', K.s, 0.75, { borde: 0.35 });
  f.forma(elipse(6.3, 10.3, 2.9, 2.9), K.ba);
  f.mancha('M8.3 8.3C9.4 9.5 9.5 11.4 8.5 12.8C10 11.6 10 9.3 8.3 8.3Z', K.bs);
  f.linea('M3.5 10.6Q6.3 9.4 9.1 10.6', 0.35, T);
  f.linea('M6.3 7.4Q5 10.3 6.3 13.2', 0.35, T);
  f.mancha(elipse(5.2, 8.9, 0.75, 0.45), K.bl, { op: 0.85 });
  f.linea('M2.5 8.2Q1.8 10.3 2.6 12.4', 0.35, K.ci);
  f.linea('M4.6 6.2Q6.3 5.5 8 6.2', 0.35, K.ci);
  return f;
}

// ───────── Elegante ─────────
export function felipeElegante() {
  const E = {
    tx: '#16181C', txs: '#0D0F12', sa: '#30353E', sal: '#4E5561', ca: '#F2F4F7', cas: '#C9D2DC', mos: '#9E1B21',
    pa: '#1A1D22', pas: '#101216', pf: '#383E48', zs: '#101215', zb: '#6B7684', mi: '#3A424E', mil: '#8E99A8'
  };
  const f = figura();
  // Calcetines rojos, zapatos de charol y pantalón recto con franja de satén
  f.forma(rr(11.2, 44.6, 4.6, 2, 0.3), K.pr, { w: 0.35 });
  f.forma(rr(18.4, 44.6, 4.6, 2, 0.3), K.pr, { w: 0.35 });
  zapatillas(f, 46.4, E.zs, E.zs, null, { alto: 3.8 });
  f.linea('M11.8 47.5Q13 47.1 14.2 47.4M19 47.5Q20.2 47.1 21.4 47.4', 0.4, E.zb);
  piernas(f, 36.6, 45, E.pa, E.pas);
  f.linea('M11.4 37.2V44.6M17.8 37.2V44.6', 0.4, E.pf);
  // Esmoquin negro, abotonado a la cintura
  f.forma('M9 24C11 23 22.4 23 24.4 24Q25.3 24.5 25.2 25.8L24.5 37.2H9.4L8.6 25.8Q8.4 24.5 9 24Z', E.tx);
  f.mancha('M22.6 24.1C23.9 24.3 25.1 24.9 25.2 25.9L24.5 37.1H22.8Z', E.txs);
  // Camisa blanca en la V, con dos botones de pechera
  f.forma('M13.5 23.1H20.3L17.4 31.1H16.4Z', E.ca, { w: 0.4, sil: false });
  f.mancha('M18.7 23.3H20.1L17.3 30.8H16.9Z', E.cas);
  f.mancha(puntos([[16.9, 26.6], [16.9, 28.6]], 0.26), T);
  // Solapas de satén con pico, y el botón
  f.forma('M13.5 23.1L16.4 31.1L15.3 31.1L12.6 26.2L11.4 25.4L12.3 24.4Z', E.sa, { w: 0.35, sil: false });
  f.forma('M20.3 23.1L17.4 31.1L18.5 31.1L21.2 26.2L22.4 25.4L21.5 24.4Z', E.sa, { w: 0.35, sil: false });
  f.linea('M13.3 24.2L15.8 30.2M20.5 24.2L18 30.2', 0.3, E.sal);
  f.forma(elipse(16.9, 31.9, 0.45, 0.45), E.sa, { w: 0.3, sil: false });
  f.linea('M10.2 34.6H13M20.8 34.6H23.6', 0.35, E.sa);
  // Humita roja, como el pelo, y la flor en el ojal
  f.forma('M14.8 23.2L16.7 24L14.8 25Z', K.pr, { w: 0.35, sil: false });
  f.forma('M19 23.2L17.1 24L19 25Z', K.pr, { w: 0.35, sil: false });
  f.forma(rr(16.4, 23.5, 1, 1, 0.3), E.mos, { w: 0.3, sil: false });
  flor(f, 21.1, 25.8);
  // Brazo con la pelota bajo el brazo, contra la cadera
  f.tubo('M24.6 25.4Q26.9 29 26.3 33', E.tx, 2.3);
  f.forma(elipse(24.2, 33.8, 2.5, 2.5), K.ba);
  f.mancha('M25.9 32C26.8 33 26.9 34.8 26 36C27.3 34.9 27.3 32.9 25.9 32Z', K.bs);
  f.linea('M21.8 34Q24.2 33 26.6 34', 0.35, T);
  f.linea('M24.2 31.3Q23.1 33.8 24.2 36.3', 0.35, T);
  f.forma(rr(25.3, 33.2, 1.9, 1, 0.3), E.ca, { w: 0.3 });
  f.forma(elipse(25.9, 35, 1.05, 0.95), K.s, { w: 0.4 });
  cabeza(f);
  // Brazo con el micrófono de BiPlot, a la altura del mentón
  f.tubo('M9.3 25.4Q7.6 28.6 9.2 31', E.tx, 2.3);
  f.tubo('M9.2 31Q11 30.8 11.7 29', E.tx, 2.1);
  f.forma(rr(11.1, 28.9, 1.9, 0.9, 0.3), E.ca, { w: 0.3 });
  f.forma(rr(11.5, 24.4, 1.4, 4, 0.4), E.mi, { w: 0.4 });
  f.forma(rr(10.9, 24.1, 2.6, 1.1, 0.3), K.ci, { w: 0.3 });
  f.forma(elipse(12.2, 22.6, 1.6, 1.6), E.mi, { w: 0.45 });
  f.linea('M11.3 22Q12.1 21.4 12.9 21.8', 0.4, E.mil);
  f.forma(elipse(12.2, 28.2, 1, 0.95), K.s, { w: 0.4 });
  return f;
}
