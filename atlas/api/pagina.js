// Una página de la bóveda, para leerla en la pantalla (en el celular, donde no está Obsidian)
import { haySesion } from '../lib/sesion.js';
import { cargar, leerPagina, enlaceObsidian } from '../lib/boveda.js';
import { json, error, mensajeDeError } from '../lib/respuesta.js';

export async function GET(request) {
  try {
    if (!haySesion(request)) return error('Tienes que entrar primero.', 401);
    const nombre = new URL(request.url).searchParams.get('nombre') ?? '';
    const r = leerPagina(await cargar(), nombre, 200_000);
    if (r.error) return json({ error: r.error, sugerencias: r.sugerencias }, 404);
    return json({ ...r, obsidian: enlaceObsidian(r.ruta) });
  } catch (e) {
    return error(mensajeDeError(e), e.estado ?? 500);
  }
}
