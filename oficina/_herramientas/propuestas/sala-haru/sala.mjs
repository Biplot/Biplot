// La sala de Haru para las fotos de la propuesta: el mismo dibujo de la oficina (dibujos/barrio/salas-propias/haru.mjs)
// y sus acercamientos (ZONAS: centro en el mundo y ancho de la ventana en píxeles del dibujo).
export { haru as sala, haru as salaHaru } from '../../dibujos/barrio/salas-propias/haru.mjs';
export { componer, P } from '../comun.mjs';
export const ZONAS = {
  entrada: [17.2, 11.0, 1.0, 440], barra: [9.0, 2.4, 1.2, 460], cocina: [2.6, 2.4, 1.2, 420], bar: [16.0, 1.6, 1.2, 420],
  salon: [13.2, 6.2, 1.0, 460], delivery: [1.6, 6.4, 1.2, 380], terraza: [3.8, 11.4, 1.2, 440], caja: [16.8, 10.2, 1.0, 380], biplot: [9.3, 12.6, 1.0, 230]
};
