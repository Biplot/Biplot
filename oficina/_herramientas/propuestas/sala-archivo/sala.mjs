// El Archivo, el museo de BiPlot, para las fotos de la propuesta: el mismo dibujo de la oficina
// (dibujos/barrio/salas-propias/archivo.mjs) y sus acercamientos (ZONAS: centro en el mundo y ancho de la ventana en
// píxeles del dibujo). salaArchivo({ pepa: [x, y] }) deja a Pepa parada en ese punto (para la maqueta del recorrido).
export { salaArchivo, archivo as sala } from '../../dibujos/barrio/salas-propias/archivo.mjs';
export { componer, P } from '../comun.mjs';
export const ZONAS = {
  entrada: [17.4, 11.3, 1.0, 560], epocas: [9.8, 10.9, 1.0, 820], papel: [15.4, 10.6, 1.4, 260], terminal: [12.6, 10.6, 1.4, 260], software: [9.8, 10.6, 1.4, 260],
  generico: [7.0, 10.6, 1.4, 260], hoy: [4.2, 10.6, 1.3, 300], casos: [11.2, 5.5, 1.0, 900], fundos: [4.2, 5.2, 1.4, 260], haru: [7.0, 5.2, 1.4, 260],
  nuhome: [9.8, 5.2, 1.4, 260], eleven: [12.6, 5.2, 1.4, 260], rumbo: [15.4, 5.2, 1.4, 260], tuproyecto: [18.2, 5.6, 1.1, 340], vuelta: [1.6, 9.0, 0.9, 560],
  linea: [9.8, 0.2, 1.6, 560], fichero: [1.2, 3.0, 1.2, 440]
};
