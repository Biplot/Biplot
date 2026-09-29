// Las salas propias de Fundos, Haru, Eleven y Rumbo: cada una es su casa, sin números (la de Nu Home está en
// salas-grandes.mjs). generar.mjs las pone en salas.js en lugar de las salas de antes.
import { fundos } from './fundos.mjs';
import { haru } from './haru.mjs';
import { eleven } from './eleven.mjs';
import { rumbo } from './rumbo.mjs';

export const SALAS_PROPIAS = { fundos, haru, eleven, rumbo };
