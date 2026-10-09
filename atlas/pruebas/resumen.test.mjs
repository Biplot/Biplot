import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copiaDeLaBoveda, variablesDePrueba } from './ayuda.mjs';

variablesDePrueba(await copiaDeLaBoveda());
const { cargar } = await import('../lib/boveda.js');
const { resumenDelDia } = await import('../lib/resumen.js');

test('el resumen cuenta los pendientes abiertos (no los hechos ni los tachados)', async () => {
  const r = resumenDelDia(await cargar(), new Date('2026-10-09T12:00:00-03:00'));
  const cifra = (t) => r.cifras.find((c) => c.texto.includes(t)).n;
  assert.equal(cifra('seguridad'), 2);
  assert.equal(cifra('preguntas'), 2);
  assert.equal(cifra('en total'), 5);
  assert.equal(cifra('cambio'), 1);
});

test('el resumen habla en partes, con su tono', async () => {
  const r = resumenDelDia(await cargar(), new Date('2026-10-10T09:00:00-03:00'));
  assert.deepEqual(r.partes.map((p) => p.tono), ['normal', 'normal', 'alerta', 'normal']);
  assert.equal(r.partes[0].texto, 'Buen día, Chris.');
  assert.equal(r.partes[1].texto, 'Lo último en tu bóveda: Copia privada en GitHub, ayer.');
  assert.equal(r.partes[2].texto, 'Ojo: tienes 2 pendientes de prioridad alta.');
  const noche = resumenDelDia(await cargar(), new Date('2026-10-20T22:30:00-03:00'));
  assert.equal(noche.partes[0].texto, 'Buenas noches, Chris.');
  assert.match(noche.partes[1].texto, /el 9 de octubre\.$/);
});
