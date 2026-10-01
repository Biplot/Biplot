// Las salas propias de Fundos, Haru, Eleven y Rumbo: cada una es su casa, sin números (la de Nu Home está en
// salas-grandes.mjs). Y las de BiPlot: El Archivo, su museo, la sala de ventas del local libre («Tu proyecto aquí») y
// BiPlot.TV, su canal.
// generar.mjs las pone en salas.js.
import { fundos } from './fundos.mjs';
import { haru } from './haru.mjs';
import { eleven } from './eleven.mjs';
import { rumbo } from './rumbo.mjs';
import { archivo } from './archivo.mjs';
import { ventas } from './ventas.mjs';
import { tv } from './tv.mjs';

export const SALAS_PROPIAS = { fundos, haru, eleven, rumbo, archivo, libre: ventas, tv };
