// El cerebro de Atlas: Claude (Sonnet) con tres herramientas sobre la bóveda (buscar, leer y proponer un cambio), en
// un bucle con streaming. Mientras trabaja, avisa qué hace (para las reacciones), manda el texto a medida que llega y,
// al final, las páginas citadas. El tono de cada respuesta viene en una etiqueta <tono>…</tono> que no se muestra.
import Anthropic from '@anthropic-ai/sdk';
import { cargar, enlaceObsidian } from './boveda.js';
import { firmar } from './sesion.js';
import { hoyChile, fechaLarga } from './fecha.js';
import { TONOS, HERRAMIENTAS, promptEstable, filtroTono, citasDe, ejecutar } from './herramientas.js';

export { TONOS, HERRAMIENTAS, promptEstable, filtroTono };
export const MODELO = () => process.env.ATLAS_MODELO || 'claude-sonnet-5-5';
const ESFUERZO = () => process.env.ATLAS_ESFUERZO || 'low';        // chat y búsqueda: lo más rápido para la voz
const VUELTAS = 8;                                                // tope de idas y vueltas con las herramientas por pregunta

const promptDelDia = () => `Hoy es ${fechaLarga()} (${hoyChile()}, hora de Chile).`;

// La conversación que manda la página: [{ rol: 'chris' | 'atlas', texto }], de la más antigua a la más nueva
export function armarMensajes(historia, mensaje) {
  const mensajes = [];
  for (const h of (Array.isArray(historia) ? historia : []).slice(-16)) {
    if (!h || typeof h.texto !== 'string' || !h.texto.trim()) continue;
    const role = h.rol === 'atlas' ? 'assistant' : 'user';
    if (!mensajes.length && role === 'assistant') continue;          // la primera tiene que ser de Chris
    mensajes.push({ role, content: h.texto.slice(0, 6000) });
  }
  mensajes.push({ role: 'user', content: String(mensaje).slice(0, 6000) });
  return mensajes;
}

// Lo que cuesta, con los precios de Sonnet 5.5 (US$ por millón de tokens)
const PRECIOS = { 'claude-sonnet-5-5': { entrada: 2, salida: 10, leida: 0.2, escrita: 2.5 } };
export function costo(modelo, u) {
  const p = PRECIOS[modelo];
  if (!p) return null;
  return (u.input_tokens * p.entrada + u.output_tokens * p.salida + u.cache_read_input_tokens * p.leida + u.cache_creation_input_tokens * p.escrita) / 1e6;
}

// ── La conversación con Claude ──
export async function conversar({ historia, mensaje, emitir, signal, cliente = new Anthropic() }) {
  const boveda = await cargar();
  const modelo = MODELO();
  const system = [
    { type: 'text', text: promptEstable(boveda), cache_control: { type: 'ephemeral' } },
    { type: 'text', text: promptDelDia() }
  ];
  const mensajes = armarMensajes(historia, mensaje);
  const uso = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
  let tono = null, todo = '', reintentos = 0;
  const filtro = filtroTono((t) => { if (TONOS.includes(t)) { tono = t; emitir('tono', { tono: t }); } });
  const decir = (delta) => { if (delta) { todo += delta; emitir('texto', { delta }); } };

  emitir('reaccion', { reaccion: 'pensando' });
  for (let vuelta = 0; vuelta < VUELTAS; vuelta++) {
    const stream = cliente.messages.stream({
      model: modelo,
      max_tokens: 4000,
      output_config: { effort: ESFUERZO() },
      cache_control: { type: 'ephemeral' },          // la conversación que crece, en caché automática
      system,
      tools: HERRAMIENTAS,
      messages: mensajes
    }, { signal });
    let mensajeFinal;
    try {
      for await (const evento of stream) {
        if (evento.type === 'content_block_start' && evento.content_block.type === 'tool_use') {
          const r = { buscar_en_boveda: 'buscando', leer_pagina: 'leyendo', proponer_cambio: 'anotando' }[evento.content_block.name];
          if (r) emitir('reaccion', { reaccion: r });
        } else if (evento.type === 'content_block_delta' && evento.delta.type === 'text_delta') {
          decir(filtro.empujar(evento.delta.text));
        }
      }
      mensajeFinal = await stream.finalMessage();
      reintentos = 0;
    } catch (err) {
      // Sólo se reintenta cuando el SDK no pudo leer el JSON de una herramienta; los errores de la API se informan
      if (err instanceof Anthropic.APIError || err?.name === 'AbortError' || signal?.aborted || reintentos++ >= 2) throw err;
      continue;
    }
    for (const k of Object.keys(uso)) uso[k] += mensajeFinal.usage?.[k] ?? 0;
    decir(filtro.cerrar());

    if (mensajeFinal.stop_reason === 'refusal') {
      if (!tono) { tono = 'duda'; emitir('tono', { tono }); }
      decir(`${todo ? ' ' : ''}Eso no te lo puedo responder.`);
      break;
    }
    const usos = mensajeFinal.content.filter((b) => b.type === 'tool_use');
    if (mensajeFinal.stop_reason === 'pause_turn') { mensajes.push({ role: 'assistant', content: mensajeFinal.content }); continue; }
    if (!usos.length) break;                                     // end_turn (o max_tokens con texto): terminó
    if (mensajeFinal.stop_reason === 'max_tokens') throw Object.assign(new Error('La respuesta se cortó antes de tiempo. Pregúntame de nuevo, más corto.'), { publico: true });

    mensajes.push({ role: 'assistant', content: mensajeFinal.content });
    const resultados = usos.map((u) => {
      const r = ejecutar(boveda, u.name, u.input, emitir, { firmar });
      return { type: 'tool_result', tool_use_id: u.id, content: r.contenido, ...(r.error ? { is_error: true } : {}) };
    });
    mensajes.push({ role: 'user', content: resultados });
    if (vuelta === VUELTAS - 1) decir(' (Me quedé sin vueltas para buscar; pregúntame algo más acotado.)');
  }
  emitir('fin', { tono: tono ?? 'normal', citas: citasDe(boveda, todo, enlaceObsidian), uso, costo: costo(modelo, uso), modelo });
}
