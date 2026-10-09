// La sesión: una cookie firmada que dura 30 días. Se entra con la contraseña de ATLAS_CLAVE; la firma usa ATLAS_SECRETO.
// También firma las propuestas de cambio, para que lo que se guarda sea exactamente lo que Atlas propuso.
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const NOMBRE = 'atlas';
const DURA = 30 * 24 * 3600;                      // segundos

function secreto() {
  const s = process.env.ATLAS_SECRETO ?? '';
  if (s.length < 32) throw Object.assign(new Error('Falta ATLAS_SECRETO (al menos 32 caracteres) en las variables de Vercel.'), { publico: true, estado: 500 });
  return s;
}
const firma = (texto) => createHmac('sha256', secreto()).update(texto).digest('base64url');
const iguales = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// ¿La contraseña es la de ATLAS_CLAVE? (compara los resúmenes, en tiempo constante)
export function claveCorrecta(clave) {
  const real = process.env.ATLAS_CLAVE ?? '';
  if (!real) throw Object.assign(new Error('Falta ATLAS_CLAVE (la contraseña de la página) en las variables de Vercel.'), { publico: true, estado: 500 });
  const h = (s) => createHash('sha256').update(String(s)).digest();
  return timingSafeEqual(h(clave ?? ''), h(real));
}

export function cookieDeSesion(request) {
  const vence = Math.floor(Date.now() / 1000) + DURA;
  const valor = `${vence}.${firma(`sesion:${vence}`)}`;
  return `${NOMBRE}=${valor}; Path=/; Max-Age=${DURA}; HttpOnly; SameSite=Strict${seguro(request)}`;
}
export const cookieDeSalida = (request) => `${NOMBRE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${seguro(request)}`;
// En http://localhost (para probar) la cookie no puede ser Secure
const seguro = (request) => (new URL(request.url).protocol === 'https:' ? '; Secure' : '');

export function haySesion(request) {
  const cookies = Object.fromEntries((request.headers.get('cookie') ?? '').split(/;\s*/).filter(Boolean).map((c) => {
    const i = c.indexOf('='); return [c.slice(0, i), c.slice(i + 1)];
  }));
  const [vence, f] = (cookies[NOMBRE] ?? '').split('.');
  if (!vence || !f || Number(vence) < Date.now() / 1000) return false;
  return iguales(f, firma(`sesion:${vence}`));
}

// Firma un objeto: «datos.firma», los datos en base64url. Vence a las 2 horas.
export function firmar(objeto) {
  const datos = Buffer.from(JSON.stringify({ ...objeto, vence: Date.now() + 2 * 3600 * 1000 })).toString('base64url');
  return `${datos}.${firma(`propuesta:${datos}`)}`;
}
export function verificar(token) {
  const [datos, f] = String(token ?? '').split('.');
  if (!datos || !f || !iguales(f, firma(`propuesta:${datos}`))) return null;
  const objeto = JSON.parse(Buffer.from(datos, 'base64url').toString('utf8'));
  return objeto.vence > Date.now() ? objeto : null;
}
