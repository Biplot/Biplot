// Los dibujos de la banda de Plotty y Atlas (oficina/_herramientas/dibujos/banda/) para el avatar 3D (assets/avatares3d/): se ven
// mientras carga el 3D y quedan si el navegador no tiene WebGL.
//   node oficina/_herramientas/avatares/dibujos.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ilustrar } from '../dibujos/banda/ilustrar.mjs';

const destino = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../assets/avatares3d');
for (const id of ['plotty', 'atlas']) {
  const { vb, svg } = ilustrar(id);
  writeFileSync(path.join(destino, `${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${svg}</svg>\n`);
}
