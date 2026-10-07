// The Architect en vector, versión oficina: el científico de planos. Visor cian con las dos antenas (la lupa abatible y
// la antena con su foco cian), pelo disparado, barba corta con canas y la sonrisa torcida; la bata blanca abierta, con
// manchas de tinta cian y el 2 en el bolsillo del pecho (con su portaplumas), la credencial E2, la polera lisa, el
// pantalón gris con la cadena y las zapatillas de caña. En una mano, el plumón cian; en la otra, el control de su dron.
import { figura, cara, zapatillas, piernas, credencial, rr, elipse, T, BLANCO } from './kit.mjs';

const K = {
  h: '#2B211B', H: '#4D3B2F', j: '#1A1310', s: '#E0AC82', S: '#C48C63',
  v: '#A8EDE4', V: '#3FD3C4', e: '#0A6F66', b: '#3A332E', B: '#26201C', cana: '#A39C96',
  bata: '#F1F4F7', bataS: '#C3CDD8', bataL: '#FFFFFF', forro: '#D2DAE3',
  p: '#2C323B', P: '#1A1F26', t: '#17C3B2', tl: '#7FD8CF', W: '#F2F4F7',
  J: '#4A505B', JK: '#323741', JL: '#6E7684', c: '#C3CDD8', z: '#1F252E',
  f: '#2A2E35', cromo: '#D3DAE2'
};

export function architect() {
  const f = figura();
  // La bata por detrás: se ve entre las piernas, hasta la rodilla
  f.forma('M10 30.4H24L25.2 41.6Q17.2 42.6 8.8 41.6Z', K.forro);
  f.mancha('M20.6 30.6H24L25.2 41.5Q22.8 41.9 20.6 42Z', K.bataS);
  // Pantalón gris con la cadena y las zapatillas de caña, con su parche cian
  piernas(f, 37.4, 46.6, K.J, K.JK, [11, 16.1], [17.3, 22.5]);
  f.linea('M12.4 42.2V44.8', 0.55, K.JL); f.linea('M18.7 42.2V44.8', 0.55, K.JL);
  zapatillas(f, 46.2, K.z, K.W, K.W);
  f.mancha(elipse(15.2, 47.5, 0.55, 0.55), K.t); f.mancha(elipse(22.4, 47.5, 0.55, 0.55), K.t);
  // La polera lisa y el cinturón de los aparatos, con la batería de barras cian
  f.forma('M12.4 23.4H21.4L21.8 36.4H12Z', K.p);
  f.mancha('M19.8 23.6H21.4L21.8 36.3H20Z', K.P);
  f.forma(rr(12, 35, 9.8, 1.3, 0.3), '#1A1C21', { w: 0.35 });
  f.forma(rr(13.2, 35.6, 2.2, 2.6, 0.35), K.f, { w: 0.35 });
  f.mancha('M13.7 36.2H14.9V36.7H13.7ZM13.7 37H14.9V37.5H13.7Z', K.t);
  f.linea('M22.3 37.2Q24.4 38.4 23.6 39.8Q23 40.8 21.9 40.5', 0.45, K.c, { sil: true });
  // La bata por delante: dos paneles largos, abiertos sobre la polera, con la falda que se abre abajo
  f.forma('M9.6 23.8Q11.4 23.1 13.6 23.2L14.2 30.2L13.8 41.4Q11.2 41.8 8.4 41.2L8.9 33Q8.6 26.6 8.9 25.2Q9.1 24.2 9.6 23.8Z', K.bata);
  f.mancha('M12.6 23.4L13.6 23.2L14.2 30.2L13.8 41.4Q13 41.5 12.4 41.5Z', K.bataS);
  f.mancha('M9 25.4Q9.6 24.4 10.2 24.2L9.6 41.1Q9 41.1 8.5 41Z', K.bataL);
  f.forma('M24.2 23.8Q22.4 23.1 20.2 23.2L19.8 30.2L20.4 41.4Q23.2 41.8 25.8 41.2L25.1 33Q25.4 26.6 25 25.2Q24.8 24.2 24.2 23.8Z', K.bata);
  f.mancha('M22.4 23.4Q23.8 23.5 24.4 24.1Q25.1 25.2 25 27.2L25.1 33L25.8 41.1Q24.2 41.4 22.6 41.5Z', K.bataS);
  // Las solapas
  f.forma('M13.6 23.2L11.8 24.6L12.6 28.4L14.2 26.4Z', K.bataL, { w: 0.35, sil: false });
  f.forma('M20.2 23.2L22 24.6L21.2 28.4L19.6 26.4Z', K.bata, { w: 0.35, sil: false });
  // Los bolsillos de la cadera
  f.forma(rr(9.4, 36.4, 3.4, 2.6, 0.3), K.bata, { w: 0.35, sil: false });
  f.forma(rr(21.4, 36.4, 3.4, 2.6, 0.3), K.bataS, { w: 0.35, sil: false });
  // El bolsillo del pecho, del lado del corazón: el portaplumas (cian, blanco y azul) y el 2
  f.forma(rr(21.2, 26.4, 0.55, 1.9, 0.2), K.t, { w: 0.25, sil: false });
  f.forma(rr(21.9, 26.8, 0.55, 1.5, 0.2), K.W, { w: 0.25, sil: false });
  f.forma(rr(22.6, 26.5, 0.55, 1.8, 0.2), '#35679A', { w: 0.25, sil: false });
  f.forma(rr(20.9, 27.9, 3, 3.2, 0.3), K.bataS, { w: 0.4, sil: false });
  f.linea('M21.2 28.5H23.6', 0.3, '#9FAAB6');
  f.raw(`<g class="pj-num"><path d="M21.8 29.3Q22.4 28.8 23 29.2Q23.3 29.6 22.8 30.1L21.8 30.8H23.2" fill="none" stroke="${K.t}" stroke-width=".42" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  credencial(f, 10.2, 27);
  // Manchas de tinta cian
  f.mancha(elipse(10.6, 33.4, 0.5, 0.45), K.t); f.mancha(elipse(11.7, 38.6, 0.4, 0.35), K.t); f.mancha(elipse(23.4, 34.6, 0.45, 0.4), K.t);
  f.mancha(elipse(9.8, 39.8, 0.35, 0.3), '#0A8A7E');
  // El brazo del plumón: la manga arremangada y el puño con el plumón cian apuntando abajo
  f.tubo('M9.2 25.2Q8.4 29.4 8.9 32.6', K.bata, 2.4);
  f.forma(rr(7.4, 31.8, 2.9, 1.3, 0.4), K.bataL, { w: 0.4 });
  f.forma(rr(8.2, 34.6, 1.1, 2.8, 0.3), K.t, { w: 0.35 });
  f.mancha('M8.4 37.4L9.1 37.4L8.75 38.1Z', T);
  f.forma(elipse(8.8, 34, 1.25, 1.15), K.s, { w: 0.4 });
  // El brazo del control: la manga baja por el costado, el codo afuera y la mano adelante con el control del dron,
  // la antena en alto
  f.tubo('M24.6 25.2Q26.5 28.6 26.3 31.4Q25.6 33.2 23.9 33.5', K.bata, 2.4);
  f.forma(rr(22.2, 32.3, 3.8, 2.3, 0.5), K.f, { w: 0.45 });
  f.mancha(elipse(23.4, 33.4, 0.45, 0.45), K.t); f.mancha(elipse(25, 33.4, 0.45, 0.45), K.t);
  f.linea('M25.5 32.5L27.4 26.6', 0.45, K.cromo, { sil: true });
  f.forma(elipse(27.5, 26.3, 0.5, 0.5), K.t, { w: 0.3 });
  f.forma(elipse(22.6, 33.7, 1.2, 1.1), K.s, { w: 0.4 });
  // El cuello de la bata, alrededor de la nuca
  f.forma('M10.8 24C11.6 22 22.2 22 23 24C21.2 23.2 12.6 23.2 10.8 24Z', K.bata);

  // Cabeza
  cara(f, { piel: K.s, sombra: K.S, ojos: null, boca: null });
  // Barba corta con canas: la mandíbula y el mentón, y el bigote
  f.mancha('M3.2 15.4C3.4 19.7 6.9 22.3 10.7 22.3C14.4 22.2 17.1 19.6 17.1 15.3L16.3 15.7Q15.7 17.4 14.2 17.2Q12.2 16.7 10.6 17.4Q8.8 17.1 7.3 17.7Q5.2 17.3 4.1 15.8Z', K.b, { cab: true });
  f.mancha('M14.6 16.6Q16.4 16.4 16.9 15.6Q16.8 19.8 13.8 21.6Q15.8 19.2 14.6 16.6Z', K.B, { cab: true });
  f.linea('M5.4 18.6l0.5 -0.9M7.2 20.2l0.5 -0.9M9.6 21l0.4 -0.9M12.6 20.8l0.4 -0.9M15 19.4l0.4 -0.8', 0.3, K.cana, { cab: true });
  // La sonrisa torcida, con los dientes apretados
  f.forma('M10.4 18.5Q12.6 18.6 14.6 17.7Q14.4 19 12.6 19.5Q11 19.6 10.4 18.5Z', '#2B0E08', { cab: true, w: 0.3, sil: false });
  f.mancha('M10.9 18.65Q12.6 18.7 14.1 18Q14 18.5 12.6 18.85Q11.5 18.95 10.9 18.65Z', BLANCO, { cab: true });
  f.linea(CONTORNO_CARA, 0.5, T, { cab: true });
  // Visor envolvente
  f.forma('M2.4 11.2Q10 10.3 18.4 10.9Q19.3 11 19.1 12.1L18.8 13.9Q18.6 14.8 17.6 14.7Q10.6 14.3 3 14.7Q2 14.8 1.9 13.8L1.8 12.1Q1.8 11.3 2.4 11.2Z', K.V, { cab: true, w: 0.55 });
  f.mancha('M2.5 11.8Q10 10.9 18.3 11.4L18.2 12.7Q10.4 12.3 2.5 12.8Z', K.v, { cab: true });
  f.mancha(elipse(9, 13.35, 0.8, 0.55), K.e, { cab: true }); f.mancha(elipse(14, 13.35, 0.8, 0.55), K.e, { cab: true });
  f.linea('M3.5 12.05L6.4 11.85', 0.45, BLANCO, { cab: true });
  // El pelo disparado, en púas
  f.forma('M1.6 12C0.6 10.6 -0.4 9.6 -1.4 9.2Q0 8.6 0.8 7.8Q-0.8 6.6 -1.6 4.8Q0.2 5 1.4 4.4Q0.8 2.4 1 0.2Q2.6 1.4 3.8 1.6Q4 -0.8 5.2 -2.6Q6 -0.8 7.2 -0.2Q8.2 -2.4 9.6 -3.4Q10 -1.4 11 -0.6Q12.4 -2.6 14 -3Q13.8 -1 14.4 0Q16 -1.2 17.6 -1Q17 0.6 17.4 1.6Q19 1.4 20.6 2.2Q19.4 3 19.2 4Q20.6 4.8 21.2 6.2Q19.8 6.4 19.2 7.2C19.6 8.4 19.4 9.8 18.9 10.6C18.4 11 17.8 11 17.4 10.6C17 10.3 16.5 10.2 16 10.4Q15.8 11.3 14.9 11.9Q15.2 10.9 14.4 10.2C13.1 9.8 11.9 9.9 11 10.2Q10.6 11.1 9.6 11.6Q9.9 10.6 9.2 10C8.2 9.7 7.2 9.9 6.6 10.3Q6.2 11.1 5.2 11.5Q5.5 10.6 4.8 10.2Q3.8 10.3 3.1 11.5C2.6 11.9 2.1 12.1 1.6 12Z', K.h, { cab: true });
  f.mancha('M0.9 7.6C0.7 9.4 0.9 11 1.3 12.1C1.9 12.2 2.6 12 3.1 11.5C3 10.2 2.7 8.8 2.2 7.4C1.7 7.2 1.2 7.3 0.9 7.6Z', K.j, { cab: true });
  f.mancha('M17.9 3.4C19 4.6 19.7 7.2 18.9 10.4C18.5 10.8 18 10.8 17.7 10.5C18.4 8.2 18.6 5.6 17.9 3.4Z', K.j, { cab: true });
  f.linea('M3.6 4.2Q4.4 1.8 5.2 -1.2', 0.5, K.H, { cab: true });
  f.linea('M8.8 2Q9.2 -0.6 9.6 -2.2', 0.5, K.H, { cab: true });
  f.linea('M13.4 2.2Q13.8 0 14 -1.8', 0.5, K.H, { cab: true });
  f.linea('M7.6 4.3Q8.5 6.2 7.9 8.4', 0.4, K.j, { cab: true });
  f.linea('M12.4 4Q13.4 6 12.9 8.2', 0.4, K.j, { cab: true });
  f.linea('M16.1 5.2Q17 7 16.7 8.9', 0.4, K.j, { cab: true });
  // Las dos antenas: la lupa abatible sobre la sien y la antena con su foco cian
  f.linea('M2.2 11.6L-0.6 6.4', 0.55, K.cromo, { cab: true, sil: true });
  f.forma(elipse(-1, 5.4, 1.5, 1.5), K.cromo, { cab: true, w: 0.45 });
  f.forma(elipse(-1, 5.4, 0.9, 0.9), K.tl, { cab: true, w: 0.3, sil: false });
  f.linea('M-1.4 5Q-1.1 4.6 -0.7 4.6', 0.3, BLANCO, { cab: true });
  f.linea('M18.6 11.4L20.2 3.2', 0.5, K.cromo, { cab: true, sil: true });
  f.mancha(elipse(20.3, 2.6, 1.6, 1.6), K.t, { cab: true, op: 0.35 });
  f.forma(elipse(20.3, 2.6, 0.85, 0.85), K.t, { cab: true, w: 0.35 });
  f.mancha(elipse(20.05, 2.35, 0.25, 0.25), BLANCO, { cab: true });
  return f;
}
// Contorno de la mandíbula, para devolverle el borde que tapa la barba.
const CONTORNO_CARA = 'M3.1 15.3C3.1 19.5 6.6 22.2 10.7 22.2C14.3 22.1 17 19.4 17 15.2';
