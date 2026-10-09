import { test } from 'node:test';
import assert from 'node:assert/strict';
import Anthropic from '@anthropic-ai/sdk';
import { copiaDeLaBoveda, variablesDePrueba } from './ayuda.mjs';

variablesDePrueba(await copiaDeLaBoveda());
const A = await import('../lib/atlas.js');
const { verificar } = await import('../lib/sesion.js');

// Un Claude falso: cada llamada a messages.stream devuelve la siguiente vuelta del guion y guarda lo que se le pidió
function claudeFalso(guion) {
  const pedidos = [];
  let i = 0;
  return {
    pedidos,
    messages: {
      stream(params, opciones) {
        pedidos.push({ params: structuredClone(params), opciones });
        const vuelta = guion[i++];
        return {
          async *[Symbol.asyncIterator]() { for (const e of vuelta.eventos ?? []) yield e; },
          finalMessage: async () => { if (vuelta.falla) throw vuelta.falla; return vuelta.mensaje; }
        };
      }
    }
  };
}
const uso = (entrada, salida) => ({ input_tokens: entrada, output_tokens: salida, cache_read_input_tokens: 1000, cache_creation_input_tokens: 0 });
const herramienta = (id, name, input) => ({
  eventos: [{ type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id, name, input: {} } }],
  mensaje: { role: 'assistant', stop_reason: 'tool_use', content: [{ type: 'tool_use', id, name, input }], usage: uso(100, 20) }
});
const texto = (...pedazos) => ({
  eventos: pedazos.map((t) => ({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: t } })),
  mensaje: { role: 'assistant', stop_reason: 'end_turn', content: [{ type: 'text', text: pedazos.join('') }], usage: uso(200, 40) }
});
async function correr(guion, mensaje = '¿Qué quedó pendiente en Rumbo?', historia = []) {
  const cliente = claudeFalso(guion), eventos = [];
  await A.conversar({ historia, mensaje, cliente, emitir: (e, d) => eventos.push([e, d]) });
  return { cliente, eventos, de: (n) => eventos.filter(([e]) => e === n).map(([, d]) => d) };
}

test('el filtro de tono saca la etiqueta aunque venga partida', () => {
  const tonos = [];
  const f = A.filtroTono((t) => tonos.push(t));
  const salida = ['<to', 'no>enc', 'ontrado</tono>\nQuedan ', '3 < 4 cosas', ' <b>ok</b>'].map((d) => f.empujar(d)).join('') + f.cerrar();
  assert.deepEqual(tonos, ['encontrado']);
  assert.equal(salida, 'Quedan 3 < 4 cosas <b>ok</b>');
});

test('busca, lee y responde: reacciones, texto sin etiqueta, citas y uso', async () => {
  const { cliente, de, eventos } = await correr([
    herramienta('t1', 'buscar_en_boveda', { consulta: 'Rumbo pendientes' }),
    herramienta('t2', 'leer_pagina', { pagina: 'Rumbo' }),
    texto('<tono>encon', 'trado</tono>Quedan dos cosas en ', '[[Rumbo]] y en [[Pendientes abiertos|tus pendientes]].')
  ]);
  assert.deepEqual(de('reaccion').map((r) => r.reaccion), ['pensando', 'buscando', 'buscando', 'leyendo', 'leyendo']);
  assert.equal(de('reaccion')[3].reaccion, 'leyendo');
  assert.equal(de('reaccion')[4].detalle, 'Rumbo');
  assert.deepEqual(de('tono'), [{ tono: 'encontrado' }]);
  assert.equal(de('texto').map((t) => t.delta).join(''), 'Quedan dos cosas en [[Rumbo]] y en [[Pendientes abiertos|tus pendientes]].');
  const fin = de('fin')[0];
  assert.equal(fin.tono, 'encontrado');
  assert.deepEqual(fin.citas.map((c) => c.nombre), ['Rumbo', 'Pendientes abiertos']);
  assert.match(fin.citas[0].obsidian, /^obsidian:\/\/open\?vault=Biplot&file=proyectos%2FRumbo$/);
  assert.equal(fin.uso.input_tokens, 400);
  assert.ok(fin.costo > 0);
  assert.equal(eventos.at(-1)[0], 'fin');

  // Lo que se le pidió a Claude
  const [p1, , p3] = cliente.pedidos.map((x) => x.params);
  assert.equal(p1.model, 'claude-sonnet-5-5');
  assert.deepEqual(p1.output_config, { effort: 'low' });
  assert.deepEqual(p1.cache_control, { type: 'ephemeral' });
  assert.deepEqual(p1.system[0].cache_control, { type: 'ephemeral' });
  assert.match(p1.system[0].text, /# Índice del wiki/);
  assert.match(p1.system[1].text, /^Hoy es /);
  assert.ok(p1.tools.every((t) => t.eager_input_streaming === true));
  assert.equal(p1.thinking, undefined);
  // La tercera vuelta lleva las dos herramientas con sus resultados
  const resultados = p3.messages.filter((m) => m.role === 'user' && Array.isArray(m.content)).flatMap((m) => m.content);
  assert.deepEqual(resultados.map((r) => r.tool_use_id), ['t1', 't2']);
  assert.match(resultados[1].content, /^# Archivo: Biplot\/proyectos\/Rumbo\.md/);
});

test('anotar: la propuesta sale firmada, con su vista, y Claude sabe que no está guardada', async () => {
  const { de, cliente } = await correr([
    herramienta('t1', 'proponer_cambio', { pagina: 'Rumbo', tipo: 'agregar', seccion: 'Pendientes abiertos', texto: '- [ ] Lunes 12: revisar el v44.', resumen: 'Rumbo — revisar el v44 el lunes 12' }),
    texto('<tono>normal</tono>Te lo dejo en [[Rumbo]]. ¿Lo guardo así?')
  ], 'Anota que el lunes 12 reviso el v44');
  const [p] = de('propuesta');
  assert.equal(p.pagina, 'Rumbo');
  assert.deepEqual(p.vista.at(-1), { signo: '+', texto: '> - [ ] Lunes 12: revisar el v44.' });
  assert.match(p.log, /^## \[\d{4}-\d{2}-\d{2}\] nota \| Rumbo — revisar el v44 el lunes 12\n/);
  assert.equal(verificar(p.token).texto, '- [ ] Lunes 12: revisar el v44.');
  const resultado = cliente.pedidos[1].params.messages.at(-1).content[0];
  assert.match(resultado.content, /NO está guardado/);
  assert.equal(resultado.is_error, undefined);
});

test('una herramienta con datos malos vuelve a Claude como error, sin correr', async () => {
  const { cliente, de } = await correr([
    herramienta('t1', 'leer_pagina', {}),
    herramienta('t2', 'proponer_cambio', { pagina: 'log', tipo: 'agregar', texto: '- x', resumen: 'x' }),
    herramienta('t3', 'leer_pagina', { pagina: 'Pendiente' }),
    texto('<tono>duda</tono>No lo encontré.')
  ]);
  const r = (n) => cliente.pedidos[n].params.messages.at(-1).content[0];
  assert.equal(r(1).is_error, true);
  assert.match(r(1).content, /INVALID_JSON/);
  assert.match(r(2).content, /no se edita/);
  assert.match(r(3).content, /¿Quizás: Pendientes abiertos\?/);
  assert.equal(de('propuesta').length, 0);
  assert.equal(de('fin')[0].tono, 'duda');
});

test('una negativa de Claude termina con una frase y tono de duda', async () => {
  const { de } = await correr([{ eventos: [], mensaje: { role: 'assistant', stop_reason: 'refusal', content: [], usage: uso(10, 0) } }]);
  assert.equal(de('texto').map((t) => t.delta).join(''), 'Eso no te lo puedo responder.');
  assert.equal(de('fin')[0].tono, 'duda');
});

test('los errores de la API no se reintentan', async () => {
  const falla = new Anthropic.RateLimitError(429, { error: { message: 'saturado' } }, 'saturado', new Headers());
  await assert.rejects(correr([{ falla }]), Anthropic.RateLimitError);
});

test('la historia: empieza con Chris, se corta y termina con el mensaje nuevo', () => {
  const m = A.armarMensajes([{ rol: 'atlas', texto: 'Buen día' }, { rol: 'chris', texto: 'Hola' }, { rol: 'atlas', texto: 'Hola, Chris' }, { rol: 'chris', texto: '' }], '¿Qué hay?');
  assert.deepEqual(m, [{ role: 'user', content: 'Hola' }, { role: 'assistant', content: 'Hola, Chris' }, { role: 'user', content: '¿Qué hay?' }]);
});
