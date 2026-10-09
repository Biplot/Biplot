// ¿Hay sesión? La página lo pregunta al abrir, para saber si muestra la contraseña o a Atlas
import { haySesion } from '../lib/sesion.js';
import { json, error, mensajeDeError } from '../lib/respuesta.js';

export async function GET(request) {
  try {
    return json({ ok: haySesion(request), simulado: process.env.ATLAS_SIMULADO === '1' });
  } catch (e) {
    return error(mensajeDeError(e), e.estado ?? 500);
  }
}
