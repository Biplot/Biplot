// La sala de Eleven para las fotos de la propuesta: el mismo dibujo de la oficina (dibujos/barrio/salas-propias/eleven.mjs)
// y sus acercamientos (ZONAS: centro en el mundo y ancho de la ventana en píxeles del dibujo).
export { eleven as sala, eleven as salaEleven } from '../../dibujos/barrio/salas-propias/eleven.mjs';
export { componer, P } from '../comun.mjs';
export const ZONAS = {
  entrada: [16.0, 11.6, 1.0, 440], peso: [2.8, 2.8, 1.3, 460], fuerza: [9.5, 1.6, 1.3, 420], cardio: [16.2, 1.4, 1.3, 460],
  clases: [16.4, 7.4, 1.2, 460], calistenia: [8.6, 7.0, 1.2, 400], muro: [1.4, 8.8, 1.6, 440], tienda: [6.8, 11.8, 1.1, 400], biplot: [11.3, 12.6, 1.0, 230]
};
