// Las salas propias de Fundos, Haru, Eleven y Rumbo: cada una es su casa, sin números (la de Nu Home está en
// salas-grandes.mjs). Y la de El Archivo, el museo de BiPlot. generar.mjs las pone en salas.js.
import { fundos } from './fundos.mjs';
import { haru } from './haru.mjs';
import { eleven } from './eleven.mjs';
import { rumbo } from './rumbo.mjs';
import { archivo } from './archivo.mjs';

export const SALAS_PROPIAS = { fundos, haru, eleven, rumbo, archivo };
