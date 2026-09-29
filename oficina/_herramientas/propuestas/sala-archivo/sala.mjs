// El Archivo, el museo de BiPlot, para las fotos de la propuesta: el mismo dibujo de la oficina
// (dibujos/barrio/salas-propias/archivo.mjs) y sus acercamientos (ZONAS: centro en el mundo y ancho de la ventana en
// píxeles del dibujo). salaArchivo({ pepa: [x, y] }) deja a Pepa parada en ese punto (para la maqueta del recorrido).
export { salaArchivo, archivo as sala } from '../../dibujos/barrio/salas-propias/archivo.mjs';
export { componer, P } from '../comun.mjs';
export const ZONAS = {
  entrada: [15.6, 11.6, 1.0, 560], epocas: [10.8, 10.9, 1.0, 800], papel: [15.4, 10.8, 1.4, 260], terminal: [12.6, 10.8, 1.4, 260], software: [9.8, 10.8, 1.4, 260],
  generico: [7.0, 10.8, 1.4, 260], hoy: [4.2, 10.6, 0.9, 380], fundos: [3.2, 6.6, 1.4, 260], haru: [5.6, 5.6, 1.4, 260], nuhome: [8.0, 4.9, 1.4, 260],
  eleven: [10.4, 4.6, 1.4, 260], rumbo: [14.5, 4.3, 1.0, 420], tuproyecto: [17.8, 8.5, 1.3, 300], linea: [10.2, 0.2, 1.6, 520], fichero: [1.2, 5.0, 1.2, 440]
};
