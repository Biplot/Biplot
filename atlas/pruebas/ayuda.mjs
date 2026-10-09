// Para las pruebas: una copia de la bóveda de prueba en una carpeta temporal (se puede escribir sin tocar la original)
import { cp, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIXTURA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'boveda-de-prueba');

export async function copiaDeLaBoveda() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'atlas-boveda-'));
  await cp(FIXTURA, dir, { recursive: true });
  return dir;
}

// Lo justo para firmar sesiones y propuestas en las pruebas
export function variablesDePrueba(dir) {
  process.env.BOVEDA_LOCAL = dir;
  process.env.BOVEDA_LOCAL_ESCRIBIR = '1';
  process.env.ATLAS_SECRETO = 'secreto-de-prueba-que-tiene-mas-de-32-caracteres';
  process.env.ATLAS_CLAVE = 'clave de prueba';
}
