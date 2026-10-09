// La conversación: recibe lo que dijo Chris (y lo anterior) y devuelve eventos mientras Atlas busca, lee y responde
import { haySesion, firmar } from '../lib/sesion.js';
import { cargar, enlaceObsidian } from '../lib/boveda.js';
import { conversar } from '../lib/atlas.js';
import { conversarSimulado } from '../lib/simulado.js';
import { error, leerCuerpo, flujoDeEventos, mensajeDeError } from '../lib/respuesta.js';

export async function POST(request) {
  let cuerpo;
  try {
    if (!haySesion(request)) return error('Tienes que entrar primero.', 401);
    cuerpo = await leerCuerpo(request);
  } catch (e) {
    return error(mensajeDeError(e), e.estado ?? 500);
  }
  const mensaje = typeof cuerpo.mensaje === 'string' ? cuerpo.mensaje.trim() : '';
  if (!mensaje) return error('No me dijiste nada.', 400);
  const simulado = process.env.ATLAS_SIMULADO === '1';
  return flujoDeEventos(async (emitir) => (simulado
    ? conversarSimulado({ boveda: await cargar(), mensaje, emitir, firmar, enlace: enlaceObsidian })
    : conversar({ historia: cuerpo.historia, mensaje, emitir, signal: request.signal })));
}
