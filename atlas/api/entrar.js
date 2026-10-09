// Entrar con la contraseña (ATLAS_CLAVE): deja la cookie de sesión por 30 días
import { claveCorrecta, cookieDeSesion } from '../lib/sesion.js';
import { json, error, leerCuerpo, mensajeDeError } from '../lib/respuesta.js';

export async function POST(request) {
  try {
    const { clave } = await leerCuerpo(request, 2000);
    if (!claveCorrecta(clave)) {
      await new Promise((r) => setTimeout(r, 900));               // frena a quien pruebe contraseñas
      return error('Esa no es la contraseña.', 401);
    }
    return json({ ok: true, simulado: process.env.ATLAS_SIMULADO === '1' }, 200, { 'set-cookie': cookieDeSesion(request) });
  } catch (e) {
    return error(mensajeDeError(e), e.estado ?? 500);
  }
}
