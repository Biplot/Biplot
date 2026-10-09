// Respuestas de las funciones: JSON y eventos (server-sent events) para la conversación
export function json(datos, estado = 200, encabezados = {}) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...encabezados }
  });
}

export const error = (mensaje, estado = 400) => json({ error: mensaje }, estado);

// Lee el cuerpo JSON de la petición (con un tope, para no recibir cualquier cosa)
export async function leerCuerpo(request, tope = 200_000) {
  const texto = await request.text();
  if (texto.length > tope) throw Object.assign(new Error('La petición es demasiado grande.'), { estado: 413 });
  try { return JSON.parse(texto || '{}'); } catch { throw Object.assign(new Error('La petición no es JSON.'), { estado: 400 }); }
}

// Un flujo de eventos: emitir(nombre, datos) escribe «event: nombre\ndata: {...}\n\n»
export function flujoDeEventos(trabajo) {
  const codificador = new TextEncoder();
  let cerrado = false;
  const cuerpo = new ReadableStream({
    async start(control) {
      const emitir = (evento, datos = {}) => {
        if (cerrado) return;
        try { control.enqueue(codificador.encode(`event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`)); } catch { cerrado = true; }
      };
      try { await trabajo(emitir); } catch (e) { emitir('error', { mensaje: mensajeDeError(e) }); }
      cerrado = true;
      try { control.close(); } catch { /* ya estaba cerrado */ }
    },
    cancel() { cerrado = true; }
  });
  return new Response(cuerpo, {
    headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' }
  });
}

// Lo que se le muestra a Chris cuando algo falla (sin detalles internos ni secretos)
export function mensajeDeError(e) {
  if (e?.publico) return e.message;
  if (e?.status === 401 || e?.status === 403) return 'No tengo permiso para entrar a la bóveda o a Claude: revisa las claves en Vercel.';
  if (e?.status === 429) return 'Claude está saturado en este momento. Prueba de nuevo en un rato.';
  return 'Algo falló de mi lado. Prueba de nuevo en un rato.';
}
