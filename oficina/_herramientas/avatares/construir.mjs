// Atlas y Plotty para Avatar Lab (avatars.bible-strong.app): arma atlas.avatar.json y plotty.avatar.json en esta carpeta.
//   node oficina/_herramientas/avatares/construir.mjs
// En el estudio se importan con «+» → «Import a .avatar.json» (ver oficina/README.md, «Avatares para Avatar Lab»).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { atlas } from './atlas.mjs';
import { plotty } from './plotty.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
for (const [nombre, definicion] of [['atlas', atlas()], ['plotty', plotty()]]) {
  writeFileSync(path.join(aqui, `${nombre}.avatar.json`), JSON.stringify(definicion, null, 2) + '\n');
}
