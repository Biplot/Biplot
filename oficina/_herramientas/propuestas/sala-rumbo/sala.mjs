// La sala de Rumbo para las fotos de la propuesta: el mismo dibujo de la oficina (dibujos/barrio/salas-propias/rumbo.mjs)
// y sus acercamientos (ZONAS: centro en el mundo y ancho de la ventana en píxeles del dibujo).
export { rumbo as sala, rumbo as salaRumbo } from '../../dibujos/barrio/salas-propias/rumbo.mjs';
export { componer, P } from '../comun.mjs';
export const ZONAS = {
  entrada: [17.0, 11.8, 1.1, 440], manana: [16.6, 1.8, 1.3, 440], objetivos: [9.2, 1.4, 1.3, 420], lecturas: [2.6, 1.6, 1.2, 380],
  elefante: [10.5, 7.0, 1.4, 400], muro: [0.9, 7.2, 1.4, 460], noche: [2.2, 11.6, 1.1, 400], salud: [16.6, 6.0, 1.1, 380], biplot: [9.7, 12.6, 1.0, 230]
};
