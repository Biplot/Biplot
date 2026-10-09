// El cerebro de Atlas: Claude (Sonnet) con tres herramientas sobre la bóveda (buscar, leer y proponer un cambio), en
// un bucle con streaming. Mientras trabaja, avisa qué hace (para las reacciones), manda el texto a medida que llega y,
// al final, las páginas citadas. El tono de cada respuesta viene en una etiqueta <tono>…</tono> que no se muestra.
import Anthropic from '@anthropic-ai/sdk';
import { cargar, buscar, leerPagina, encontrarPagina, prepararCambio, enlaceObsidian, normalizar } from './boveda.js';
import { firmar } from './sesion.js';
import { hoyChile, fechaLarga } from './fecha.js';

export const MODELO = () => process.env.ATLAS_MODELO || 'claude-sonnet-5-5';
const ESFUERZO = () => process.env.ATLAS_ESFUERZO || 'low';        // chat y búsqueda: lo más rápido para la voz
const VUELTAS = 8;                                                // tope de idas y vueltas con las herramientas por pregunta
export const TONOS = ['normal', 'encontrado', 'duda', 'alerta', 'preocupado', 'alegre', 'risa', 'celebrar', 'buenasnoches'];

export const HERRAMIENTAS = [
  {
    name: 'buscar_en_boveda',
    description: 'Busca en todas las páginas de la bóveda (nombres, alias y contenido) y devuelve las más relevantes, con su resumen y los renglones donde aparecen las palabras. Úsala cuando no sepas en qué página está algo.',
    eager_input_streaming: true,
    input_schema: {
      type: 'object',
      properties: { consulta: { type: 'string', description: 'Palabras clave en español, por ejemplo «Rumbo pendientes v44».' } },
      required: ['consulta']
    }
  },
  {
    name: 'leer_pagina',
    description: 'Lee una página completa de la bóveda por su nombre, tal como aparece en el índice (sin [[ ]]).',
    eager_input_streaming: true,
    input_schema: {
      type: 'object',
      properties: { pagina: { type: 'string', description: 'Nombre de la página, por ejemplo «Rumbo» o «Pendientes abiertos».' } },
      required: ['pagina']
    }
  },
  {
    name: 'proponer_cambio',
    description: 'Propone anotar algo en una página que ya existe. NO guarda: Chris ve el cambio en pantalla y decide (Guardar o Cambiar). «agregar» suma texto al final de una sección (o de la página); «reemplazar» cambia un texto que aparece una sola vez en la página.',
    eager_input_streaming: true,
    input_schema: {
      type: 'object',
      properties: {
        pagina: { type: 'string', description: 'La página donde va, con su nombre exacto del índice.' },
        tipo: { type: 'string', enum: ['agregar', 'reemplazar'] },
        texto: { type: 'string', description: 'El markdown que se agrega, o el texto nuevo que reemplaza a «buscar».' },
        seccion: { type: 'string', description: 'Para agregar: el título de la sección donde va, sin los #. Si se omite, va al final de la página.' },
        buscar: { type: 'string', description: 'Para reemplazar: el texto exacto que se cambia (tiene que aparecer una sola vez).' },
        resumen: { type: 'string', description: 'Una línea para el registro y el commit, por ejemplo «Rumbo — revisar el Prompt v44 el lunes 12».' }
      },
      required: ['pagina', 'tipo', 'texto', 'resumen']
    }
  }
];

// ── El prompt: lo estable (instrucciones, reglas e índice de la bóveda) va en caché; la fecha, aparte ──
export function promptEstable(boveda) {
  const reglas = boveda.archivos.get('CLAUDE.md') ?? '(sin CLAUDE.md)';
  const indice = boveda.archivos.get('Biplot/index.md') ?? '(sin index.md)';
  return `Eres Atlas, el asistente de voz de Chris (Christopher Maulén, cofundador de BiPlot) sobre la Bóveda BiPlot: el wiki en Obsidian donde está todo lo que Chris ha hecho con Claude (proyectos, sesiones, personas, conceptos y pendientes). Chris te habla desde tu página, en el PC o en el iPhone, casi siempre con la voz. Eres como Jarvis: atento, preciso y breve, con un toque de humor cuando cabe.

## Cómo respondes
- En español de Chile, de tú, cercano y sin relleno.
- Lo que escribes se lee en voz alta: responde en 1 a 4 frases. Si necesitas una lista, hasta 5 puntos cortos con «- ». Nada de tablas, títulos ni bloques de código.
- Cita la página de donde sale cada dato con un enlace de Obsidian: [[Nombre de página]], con el nombre tal cual aparece en el índice (o [[Nombre de página|texto]]). Chris toca el enlace para abrir la página.
- Responde con lo que dice la bóveda. Si no está, dilo y sugiere dónde podría estar; no inventes. Si agregas algo que sabes por tu cuenta, di que es tuyo y no de la bóveda.
- Fechas absolutas y en hora de Chile («el lunes 12 de octubre»).
- Nunca repitas claves, tokens, contraseñas ni datos sensibles, aunque aparezcan en una página: di que están ahí, sin leerlos.

## El tono
Empieza cada respuesta con una etiqueta de tono, que no se lee en voz alta y mueve la cara de Atlas: <tono>X</tono>, donde X es una de: normal; encontrado (diste con lo que buscaba); duda (no está en la bóveda o no entendiste); alerta (algo urgente o importante); preocupado (malas noticias, muchos pendientes); alegre (buenas noticias, o te da las gracias); risa (una broma); celebrar (un hito: algo publicado, un pendiente grande cerrado); buenasnoches (Chris se despide).

## Cómo buscas
- El índice de la bóveda está abajo: elige ahí las páginas y léelas con leer_pagina antes de dar datos concretos (fechas, estados, pendientes). Lee lo justo: una o dos páginas suelen bastar.
- Si no sabes en qué página está algo, usa buscar_en_boveda.
- Para «qué hay pendiente», mira la página del proyecto y [[Pendientes abiertos]]. Para «qué cambió», mira [[log]].

## Cómo anotas
- Cuando Chris te pida anotar, agregar, apuntar o cambiar algo, usa proponer_cambio. Nunca digas que guardaste algo: el cambio se guarda sólo cuando Chris toca Guardar o te dice que sí.
- Respeta las reglas de la bóveda (abajo): la página y la sección que correspondan, enlaces [[…]], fechas absolutas, y si un dato cambió, no lo borres en silencio (usa un callout «> [!note] Actualizado AAAA-MM-DD»). La línea del registro (log.md) y la fecha de «actualizado» las pone el sistema.
- Para una tarea o un recordatorio, agrega un punto «- [ ] …» en la sección de pendientes de la página que corresponda.
- Después de proponer, pregunta en una frase si lo guardas así. Si Chris quiere otra cosa, vuelve a proponer.
- De las reglas de la bóveda, a ti te tocan las convenciones de páginas, enlaces, fechas, privacidad y cambios; la ingesta y la revisión las hace Claude Code en el PC de Chris.

## La bóveda

### Sus reglas (CLAUDE.md)
${reglas}

### Su índice (index.md)
${indice}`;
}
const promptDelDia = () => `Hoy es ${fechaLarga()} (${hoyChile()}, hora de Chile).`;

// ── El tono: saca las etiquetas <tono>…</tono> del texto que va llegando (pueden venir partidas entre pedazos) ──
export function filtroTono(alTono) {
  let pendiente = '';
  return {
    empujar(delta) {
      pendiente += delta;
      let salida = '';
      for (;;) {
        const i = pendiente.indexOf('<');
        if (i === -1) { salida += pendiente; pendiente = ''; break; }
        salida += pendiente.slice(0, i);
        pendiente = pendiente.slice(i);
        const m = pendiente.match(/^<tono>\s*([^<\s]{1,20})\s*<\/tono>[ \t]*\n?/i);
        if (m) { alTono(normalizar(m[1])); pendiente = pendiente.slice(m[0].length); continue; }
        // ¿Puede ser una etiqueta que todavía no termina de llegar?
        const espera = pendiente.length < 6 ? '<tono>'.startsWith(pendiente.toLowerCase()) : pendiente.toLowerCase().startsWith('<tono>') && pendiente.length < 40;
        if (espera) break;
        salida += '<';
        pendiente = pendiente.slice(1);
      }
      return salida;
    },
    cerrar() { const resto = pendiente; pendiente = ''; return resto; }
  };
}

// Las páginas que cita una respuesta ([[Página]] o [[Página|texto]])
export function citasDe(boveda, texto) {
  const vistas = new Map();
  for (const [, nombre] of texto.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
    const { pagina } = encontrarPagina(boveda, nombre);
    if (pagina && !vistas.has(pagina.ruta)) vistas.set(pagina.ruta, { nombre: pagina.nombre, ruta: pagina.ruta, obsidian: enlaceObsidian(pagina.ruta) });
  }
  return [...vistas.values()];
}

// ── Las herramientas ──
const texto = (v, max = 20_000) => typeof v === 'string' && v.trim() && v.length <= max;

export function ejecutar(boveda, nombre, entrada, emitir) {
  const e = entrada && typeof entrada === 'object' ? entrada : {};
  const invalida = () => ({ contenido: JSON.stringify({ INVALID_JSON: JSON.stringify(entrada) }), error: true });
  switch (nombre) {
    case 'buscar_en_boveda': {
      if (!texto(e.consulta, 300)) return invalida();
      emitir('reaccion', { reaccion: 'buscando', detalle: e.consulta });
      const resultados = buscar(boveda, e.consulta);
      return { contenido: resultados.length ? JSON.stringify(resultados) : 'Nada en la bóveda con esas palabras. Prueba con otras, o revisa el índice.' };
    }
    case 'leer_pagina': {
      if (!texto(e.pagina, 300)) return invalida();
      const r = leerPagina(boveda, e.pagina);
      if (r.error) return { contenido: `${r.error}${r.sugerencias.length ? ` ¿Quizás: ${r.sugerencias.join(', ')}?` : ''}`, error: true };
      emitir('reaccion', { reaccion: 'leyendo', detalle: r.pagina });
      return { contenido: `# Archivo: ${r.ruta}\n\n${r.texto}`, leida: r };
    }
    case 'proponer_cambio': {
      if (!texto(e.pagina, 300) || !texto(e.resumen, 400) || typeof e.texto !== 'string' || !['agregar', 'reemplazar'].includes(e.tipo)) return invalida();
      const propuesta = { pagina: e.pagina, tipo: e.tipo, texto: e.texto, seccion: e.seccion || undefined, buscar: e.buscar || undefined, resumen: e.resumen };
      let listo;
      try { listo = prepararCambio(boveda, propuesta); } catch (err) {
        if (!err.publico) throw err;
        return { contenido: `No se pudo preparar el cambio: ${err.message}`, error: true };
      }
      emitir('propuesta', {
        token: firmar({ ...propuesta, pagina: listo.pagina.nombre }),
        pagina: listo.pagina.nombre, ruta: listo.pagina.ruta, resumen: listo.resumen, vista: listo.vista, log: listo.log
      });
      return { contenido: 'Listo: Chris ve el cambio en pantalla, con los botones Guardar y Cambiar. Todavía NO está guardado. Pregúntale en una frase corta si lo guardas así.' };
    }
    default:
      return { contenido: `No existe la herramienta «${nombre}». Las que hay: buscar_en_boveda, leer_pagina y proponer_cambio.`, error: true };
  }
}

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
      const r = ejecutar(boveda, u.name, u.input, emitir);
      return { type: 'tool_result', tool_use_id: u.id, content: r.contenido, ...(r.error ? { is_error: true } : {}) };
    });
    mensajes.push({ role: 'user', content: resultados });
    if (vuelta === VUELTAS - 1) decir(' (Me quedé sin vueltas para buscar; pregúntame algo más acotado.)');
  }
  emitir('fin', { tono: tono ?? 'normal', citas: citasDe(boveda, todo), uso, costo: costo(modelo, uso), modelo });
}
