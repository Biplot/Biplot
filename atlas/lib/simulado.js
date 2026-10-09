// Un Atlas de prueba, sin Claude (ATLAS_SIMULADO=1): busca y lee de verdad en la bóveda y arma propuestas de verdad,
// pero las respuestas son fijas. Sirve para probar la página entera sin clave de Anthropic y sin gastar.
import { cargar, buscar, encontrarPagina, normalizar } from './boveda.js';
import { ejecutar, citasDe } from './atlas.js';

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

export async function conversarSimulado({ mensaje, emitir }) {
  const boveda = await cargar();
  const m = normalizar(mensaje);
  let tono = 'normal', respuesta = '';
  emitir('reaccion', { reaccion: 'pensando' });
  await pausa(500);

  if (/buenas noches|chao|me voy|hasta manana/.test(m)) { tono = 'buenasnoches'; respuesta = 'Buenas noches, Chris. Aquí quedo.'; }
  else if (/gracias/.test(m)) { tono = 'alegre'; respuesta = 'De nada, Chris. Para eso estoy.'; }
  else if (/nunca duermes|chiste|broma/.test(m)) { tono = 'risa'; respuesta = 'Sólo cuando tú duermes.'; }
  else if (/^(anota|apunta|agrega|registra|recuerdame)/.test(m)) {
    const encontrados = buscar(boveda, mensaje);
    await pausa(600);
    const destino = encontrarPagina(boveda, encontrados[0]?.pagina ?? 'Pendientes abiertos').pagina;
    const texto = destino ? boveda.archivos.get(destino.ruta) : '';
    const seccion = texto.split('\n').map((l) => l.match(/^##\s+(.*)$/)?.[1]).find((t) => t && /pendiente/i.test(t));
    const nota = mensaje.replace(/^\s*(anota|apunta|agrega|registra|recuérdame|recuerdame)\s+(que\s+)?/i, '').replace(/\.$/, '');
    const r = ejecutar(boveda, 'proponer_cambio', {
      pagina: destino?.nombre ?? 'Pendientes abiertos', tipo: 'agregar', seccion, texto: `- [ ] ${nota.charAt(0).toUpperCase()}${nota.slice(1)}.`,
      resumen: `${destino?.nombre ?? 'Pendientes'} — ${nota}`.slice(0, 120)
    }, emitir);
    respuesta = r.error ? 'No pude armar el cambio. ¿Me lo dices de otra forma?' : `Te propongo anotarlo en [[${destino.nombre}]]. ¿Lo guardo así?`;
    if (r.error) tono = 'duda';
  } else {
    const r = ejecutar(boveda, 'buscar_en_boveda', { consulta: mensaje }, emitir);
    await pausa(900);
    const encontrados = r.error ? [] : (() => { try { return JSON.parse(r.contenido); } catch { return []; } })();
    if (encontrados.length) {
      ejecutar(boveda, 'leer_pagina', { pagina: encontrados[0].pagina }, emitir);
      await pausa(900);
      tono = 'encontrado';
      respuesta = `Según [[${encontrados[0].pagina}]]: ${encontrados[0].resumen || encontrados[0].fragmentos[0] || 'ahí está lo que buscas.'}`;
    } else {
      tono = 'duda';
      respuesta = 'No lo encontré en tu bóveda. ¿Me lo preguntas con otras palabras?';
    }
  }
  emitir('tono', { tono });
  for (const palabra of respuesta.split(/(?<= )/)) { emitir('texto', { delta: palabra }); await pausa(35); }
  emitir('fin', { tono, citas: citasDe(boveda, respuesta), uso: null, costo: null, modelo: 'simulado' });
}
