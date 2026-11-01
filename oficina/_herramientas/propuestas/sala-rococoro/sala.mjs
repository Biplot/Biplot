// La sala de Rococoro para las fotos de la propuesta: el mismo dibujo de la oficina (dibujos/barrio/salas-propias/rococoro.mjs)
// y sus acercamientos (ZONAS: centro en el mundo y ancho de la ventana en píxeles del dibujo).
export { rococoro as sala, salaRococoro } from '../../dibujos/barrio/salas-propias/rococoro.mjs';
export { componer, P } from '../comun.mjs';
export const ZONAS = {
  entrada: [15.8, 11.4, 1.0, 460], portada: [3.6, 0.6, 1.6, 460], lookbook: [10.0, 1.6, 1.3, 440], probador: [16.4, 1.6, 1.3, 460],
  taller: [1.8, 3.6, 1.3, 440], redaccion: [1.6, 8.8, 1.4, 420], directora: [1.2, 12.2, 1.4, 380], coleccion: [8.6, 7.2, 1.0, 460],
  caja: [16.6, 7.6, 1.0, 420], biplot: [10.6, 12.6, 1.0, 230]
};
