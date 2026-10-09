// Salir: borra la cookie de sesión
import { cookieDeSalida } from '../lib/sesion.js';
import { json } from '../lib/respuesta.js';

export async function POST(request) {
  return json({ ok: true }, 200, { 'set-cookie': cookieDeSalida(request) });
}
