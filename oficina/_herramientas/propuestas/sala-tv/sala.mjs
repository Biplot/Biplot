// BiPlot.TV, el canal de BiPlot, para las fotos de la propuesta: el mismo dibujo de la oficina
// (dibujos/barrio/salas-propias/tv.mjs) y sus acercamientos (ZONAS: centro en el mundo y ancho de la ventana en píxeles
// del dibujo). salaTv({ felipe: [x, y] }) deja a Felipe parado en ese punto (para la maqueta del recorrido).
export { salaTv, tv as sala } from '../../dibujos/barrio/salas-propias/tv.mjs';
export { componer, P } from '../comun.mjs';
export const ZONAS = {
  entrada: [12.6, 6.6, 1.1, 900], cine: [3.1, 2.4, 1.0, 560], set: [9.8, 2.2, 1.0, 620], camarin: [16.4, 1.2, 1.0, 420],
  guion: [0.4, 3.3, 1.6, 420], muro: [0.6, 10.6, 1.4, 560], cartelera: [14.6, 10.4, 1.2, 520], marcador: [10.4, 7.8, 2.5, 600]
};
