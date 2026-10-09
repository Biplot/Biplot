// Copia a Atlas en 3D (assets/avatares3d del sitio) a public/avatares3d, para que la página lo sirva
import { cp, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const origen = path.resolve(aqui, '../../assets/avatares3d');
const destino = path.resolve(aqui, '../public/avatares3d');
const existe = (p) => access(p).then(() => true, () => false);

if (!(await existe(origen))) {
  if (await existe(destino)) { console.log('avatares3d: no está ../assets; se usa la copia de public/avatares3d'); process.exit(0); }
  console.error(`avatares3d: no encuentro ${origen}`);
  process.exit(1);
}
await mkdir(path.join(destino, 'three'), { recursive: true });
for (const f of ['avatar3d.js', 'kit3d.js', 'atlas3d.js', 'plotty3d.js', 'atlas.svg']) await cp(path.join(origen, f), path.join(destino, f));
for (const f of ['three.module.min.js', 'three.core.min.js', 'LICENSE']) await cp(path.join(origen, 'three', f), path.join(destino, 'three', f));
console.log('avatares3d: copiado a public/avatares3d');
