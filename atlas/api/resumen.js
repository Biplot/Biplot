// El resumen del día: lo último del registro y lo que espera en «Pendientes abiertos» (sin pasar por Claude)
import { haySesion } from '../lib/sesion.js';
import { cargar } from '../lib/boveda.js';
import { resumenDelDia } from '../lib/resumen.js';
import { json, error, mensajeDeError } from '../lib/respuesta.js';

export async function GET(request) {
  try {
    if (!haySesion(request)) return error('Tienes que entrar primero.', 401);
    return json(resumenDelDia(await cargar()));
  } catch (e) {
    return error(mensajeDeError(e), e.estado ?? 500);
  }
}
