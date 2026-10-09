// Guarda un cambio que Atlas propuso y Chris aprobó: lo que llega es la propuesta firmada, tal cual Atlas la armó
import { haySesion, verificar } from '../lib/sesion.js';
import { guardarPropuesta } from '../lib/boveda.js';
import { json, error, leerCuerpo, mensajeDeError } from '../lib/respuesta.js';

export async function POST(request) {
  try {
    if (!haySesion(request)) return error('Tienes que entrar primero.', 401);
    const { token } = await leerCuerpo(request, 100_000);
    const propuesta = verificar(token);
    if (!propuesta) return error('Esa propuesta ya no vale (venció o se modificó). Pídele a Atlas que la vuelva a proponer.', 400);
    return json({ ok: true, ...(await guardarPropuesta(propuesta)) });
  } catch (e) {
    return error(mensajeDeError(e), e.estado ?? 500);
  }
}
