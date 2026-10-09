import { test } from 'node:test';
import assert from 'node:assert/strict';
import { variablesDePrueba } from './ayuda.mjs';

variablesDePrueba('/no/importa');
const S = await import('../lib/sesion.js');
const pedido = (cookie, url = 'https://atlas.biplot.cl/api/x') => new Request(url, { headers: cookie ? { cookie } : {} });

test('la contraseña', () => {
  assert.equal(S.claveCorrecta('clave de prueba'), true);
  assert.equal(S.claveCorrecta('otra'), false);
  assert.equal(S.claveCorrecta(undefined), false);
});

test('la cookie de sesión: vale la propia, no una inventada', () => {
  const cookie = S.cookieDeSesion(pedido());
  assert.match(cookie, /HttpOnly; SameSite=Strict; Secure$/);
  assert.doesNotMatch(S.cookieDeSesion(pedido(null, 'http://localhost:3000/')), /Secure/);
  const valor = cookie.split(';')[0];
  assert.equal(S.haySesion(pedido(`otra=1; ${valor}`)), true);
  assert.equal(S.haySesion(pedido(valor.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')))), false);
  assert.equal(S.haySesion(pedido('atlas=99999999999.firma')), false);
  assert.equal(S.haySesion(pedido()), false);
});

test('las propuestas firmadas: se leen tal cual, y nada si se tocan', () => {
  const token = S.firmar({ pagina: 'Rumbo', texto: '- x' });
  assert.equal(S.verificar(token).pagina, 'Rumbo');
  const [datos, firma] = token.split('.');
  const otro = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(datos, 'base64url')), pagina: 'log' })).toString('base64url');
  assert.equal(S.verificar(`${otro}.${firma}`), null);
  assert.equal(S.verificar('basura'), null);
});

test('sin ATLAS_SECRETO, avisa', () => {
  const antes = process.env.ATLAS_SECRETO;
  process.env.ATLAS_SECRETO = 'corto';
  assert.throws(() => S.firmar({}), /ATLAS_SECRETO/);
  process.env.ATLAS_SECRETO = antes;
});
