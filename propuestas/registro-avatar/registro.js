// Registro con avatar (propuesta). El avatar es Plotty o Atlas, hechos para Avatar Lab (avatars.bible-strong.app) y
// pintados con @bible-strong/avatar-web (avatar-web.js, empaquetado sin cambios). Sólo se usa su API documentada:
// createAvatar(destino, { definition, size, ariaLabel, onAnimationEnd, onError }) y play(clave) / destroy().
//
// Estados: idle (en reposo; con el cursor lejos mira hacia él con look-left/right/up/down), typing (mientras escribes;
// vuelve a idle tras 1,2 s sin teclear), error (un campo o el envío no validan), success (registro listo), shy (en las
// contraseñas hace como que no mira) y thinking (el segundo que tarda el envío simulado). error y success son «once»:
// al terminar quedan quietos, así que onAnimationEnd los devuelve al estado que corresponda.
import { createAvatar } from './avatar-web.js';

const AVATARES = {
  plotty: {
    archivo: 'plotty.avatar.json',
    etiqueta: 'Plotty, la recepción de BiPlot HQ, te mira mientras te registras',
    placa: 'E0 · Recepción',
    frase: '«Tres preguntas. Prometo que no es un formulario.»'
  },
  atlas: {
    archivo: 'atlas.avatar.json',
    etiqueta: 'Atlas, la mascota de The Architect, te mira mientras te registras',
    placa: '360° · Sala de planos',
    frase: '«Desde aquí arriba se ve todo.»'
  }
};
const NECESARIAS = ['idle', 'typing', 'error', 'success'];
const MIRADAS = { left: 'look-left', right: 'look-right', up: 'look-up', down: 'look-down' };
const PAUSA_TECLEO = 1200;      // ms sin teclear para volver a idle
const ENVIO = 1000;             // ms del envío simulado
const INCLINACION = 12;         // grados, como máximo

const raiz = document.documentElement;
const $ = (s) => document.querySelector(s);
const montaje = $('#avatar'), inclina = $('#inclina'), rebota = $('#rebota');
const form = $('#formulario'), boton = $('#enviar'), aviso = $('#aviso');
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
const celular = matchMedia('(max-width: 900px)');
const conCursor = matchMedia('(hover: hover) and (pointer: fine)');

// ── El avatar: cargar, revisar las animaciones y reproducir sólo cuando cambia el estado ──
let avatar = null, definicion = null, cual = null, sonando = null;
let estado = 'idle', zona = null, tecleo = null;
const tiene = (clave) => Boolean(definicion?.animations?.[clave]);
const tieneMiradas = () => Object.values(MIRADAS).every(tiene);

function sonar(clave, { otraVez = false } = {}) {
  if (!avatar || !tiene(clave) || (clave === sonando && !otraVez)) return;
  const r = avatar.play(clave);
  if (r.ok) raiz.dataset.animacion = sonando = clave;
  else console.warn(`[registro] ${r.error.message}`);
}

// Lo que corresponde cuando no pasa nada especial
const enClave = () => document.activeElement?.matches?.('[data-clave]') ?? false;
function base() {
  if (raiz.dataset.pantalla === 'listo') return 'idle';
  if (enClave() && tiene('shy')) return 'shy';
  if (tecleo) return 'typing';
  return 'idle';
}
function aplicar() {
  raiz.dataset.estado = estado;
  if (estado === 'idle') sonar(zona && tieneMiradas() ? MIRADAS[zona] : 'idle');
  else sonar(estado);
}
function ir(nuevo, opciones) {
  estado = nuevo;
  if (nuevo === 'idle') aplicar();
  else { raiz.dataset.estado = nuevo; sonar(nuevo, opciones); }
  apuntar();
}

function alTerminar(clave) {
  // error y success (en modo «once») quedan congelados al terminar: se vuelve a lo que corresponda
  if (clave === 'error' && estado === 'error') ir(base());
  if (clave === 'success' && estado === 'success') ir('idle');
}

let pedido = 0;
async function montar(nombre) {
  const datos = AVATARES[nombre] ? nombre : 'plotty';
  const info = AVATARES[datos], este = ++pedido;
  let def;
  try {
    const r = await fetch(info.archivo);
    if (!r.ok) throw new Error(`${info.archivo}: ${r.status}`);
    def = await r.json();
  } catch (e) {
    mostrarAviso(`No se pudo cargar el avatar (${e.message}). Abre la página desde un servidor, no como archivo.`);
    return;
  }
  if (este !== pedido) return;          // se eligió otro mientras cargaba
  const faltan = NECESARIAS.filter((k) => !def.animations?.[k]);
  if (faltan.length) {
    mostrarAviso(`Al .avatar.json de ${def.name ?? datos} le faltan las animaciones: ${faltan.join(', ')}.`);
    console.error(`[registro] faltan animaciones en ${info.archivo}: ${faltan.join(', ')}`);
  } else ocultarAviso();
  avatar?.destroy();
  avatar = null;
  definicion = def;
  cual = datos;
  sonando = null;
  try {
    avatar = createAvatar(montaje, {
      definition: def,
      size: '100%',
      ariaLabel: info.etiqueta,
      onAnimationEnd: alTerminar,
      onError: (e) => console.warn(`[registro] ${e.message}`)
    });
  } catch (e) {
    mostrarAviso(`El .avatar.json de ${def.name ?? datos} no es válido: ${e.message}`);
    return;
  }
  // La paleta sale del .avatar.json
  raiz.style.setProperty('--cuerpo', def.colors.body);
  raiz.style.setProperty('--ojos', def.colors.eyes);
  $('#placa').textContent = info.placa;
  $('#frase').textContent = info.frase;
  for (const b of document.querySelectorAll('[data-avatar]')) b.setAttribute('aria-pressed', String(b.dataset.avatar === datos));
  const url = new URL(location.href);
  if (datos === 'plotty') url.searchParams.delete('avatar'); else url.searchParams.set('avatar', datos);
  history.replaceState(null, '', url);
  if (estado === 'error' || estado === 'success') estado = base();
  aplicar();
}

for (const b of document.querySelectorAll('[data-avatar]')) {
  b.addEventListener('click', () => { if (b.dataset.avatar !== cual) montar(b.dataset.avatar); });
}

// ── La inclinación hacia el cursor (o hacia el campo activo): un resorte en requestAnimationFrame ──
const objetivo = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
let cuadro = null, ultimo = 0, cursor = null;
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

function centro() {
  const r = inclina.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, tam: r.width };
}
function hacia(px, py) {
  const c = centro(), alcance = Math.max(innerWidth, innerHeight) * 0.55;
  objetivo.x = limitar((px - c.x) / alcance, -1, 1);
  objetivo.y = limitar((py - c.y) / alcance, -1, 1);
  arrancar();
}
// Mientras escribes (o con el foco en un campo, en el celular) mira el campo activo; si no, el cursor
function apuntar() {
  const activo = form.contains(document.activeElement) && document.activeElement.matches('input') ? document.activeElement : null;
  if (activo && (estado === 'typing' || estado === 'shy' || !conCursor.matches)) {
    const r = activo.getBoundingClientRect();
    hacia(r.left + r.width * 0.3, r.top + r.height / 2);
  } else if (cursor && conCursor.matches) hacia(cursor.x, cursor.y);
  else { objetivo.x = 0; objetivo.y = 0; arrancar(); }
}
function arrancar() {
  if (sinMovimiento.matches) { inclina.style.transform = ''; return; }
  if (cuadro === null) { ultimo = performance.now(); cuadro = requestAnimationFrame(paso); }
}
function paso(ahora) {
  // Un resorte con amortiguación, a paso fijo de 60 cuadros por segundo para que no dependa de la pantalla
  const pasos = limitar(Math.round((ahora - ultimo) / 16.67), 1, 4);
  ultimo = ahora;
  for (let i = 0; i < pasos; i++) for (const e of ['x', 'y']) {
    vel[e] = (vel[e] + (objetivo[e] - pos[e]) * 0.045) * 0.84;
    pos[e] += vel[e];
  }
  inclina.style.transform = `rotateX(${(-pos.y * INCLINACION).toFixed(2)}deg) rotateY(${(pos.x * INCLINACION).toFixed(2)}deg)`;
  const quieto = Math.abs(objetivo.x - pos.x) + Math.abs(objetivo.y - pos.y) + Math.abs(vel.x) + Math.abs(vel.y) < 0.002;
  cuadro = quieto ? null : requestAnimationFrame(paso);
}

// ── Los ojos: en reposo miran hacia la zona del cursor. Cambian sólo al cambiar de zona, con margen para no temblar ──
let pendiente = null, esperaZona = null;
function zonaPara(dx, dy, tam) {
  const d = Math.hypot(dx, dy), muerta = tam * 0.42;
  if (zona === null ? d < muerta + 32 : d < muerta) return null;
  const h = Math.abs(dx), v = Math.abs(dy);
  const horizontal = zona === 'left' || zona === 'right' ? v < h * 1.35 : zona === 'up' || zona === 'down' ? h > v * 1.35 : h >= v;
  return horizontal ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
}
function mirarZona(candidata) {
  if (candidata === zona) { clearTimeout(esperaZona); pendiente = null; return; }
  if (candidata === pendiente) return;
  pendiente = candidata;
  clearTimeout(esperaZona);
  esperaZona = setTimeout(() => {
    zona = pendiente;
    pendiente = null;
    if (estado === 'idle') aplicar();
  }, 160);
}

addEventListener('pointermove', (ev) => {
  if (ev.pointerType === 'touch') return;
  cursor = { x: ev.clientX, y: ev.clientY };
  const c = centro();
  mirarZona(zonaPara(ev.clientX - c.x, ev.clientY - c.y, c.tam));
  if (estado !== 'typing' && estado !== 'shy') hacia(ev.clientX, ev.clientY);
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { cursor = null; mirarZona(null); apuntar(); });
addEventListener('scroll', () => apuntar(), { passive: true });
addEventListener('resize', () => apuntar());

// ── El formulario ──
const campos = {
  nombre: $('#nombre'), email: $('#email'), clave: $('#clave'), confirma: $('#confirma')
};
const reglas = {
  nombre: (v) => (!v.trim() ? 'Escribe tu nombre.' : v.trim().length < 2 ? 'Tu nombre necesita al menos 2 letras.' : ''),
  email: (v) => (!v.trim() ? 'Escribe tu email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Ese email no parece válido: revisa la @ y el dominio.' : ''),
  clave: (v) => (!v ? 'Elige una contraseña.' : v.length < 8 ? 'Usa al menos 8 caracteres.' : !/[a-zA-Z]/.test(v) || !/\d/.test(v) ? 'Combina letras y números.' : ''),
  confirma: (v) => (!v ? 'Repite la contraseña.' : v !== campos.clave.value ? 'Las contraseñas no coinciden.' : '')
};
function revisar(nombre) {
  const input = campos[nombre], msj = reglas[nombre](input.value);
  input.setAttribute('aria-invalid', msj ? 'true' : 'false');
  $(`#${input.id}-msj`).textContent = msj;
  return !msj;
}
function sacudir(input) {
  if (sinMovimiento.matches) return;
  const control = input.closest('.control');
  control.classList.remove('sacude');
  void control.offsetWidth;          // para que la animación vuelva a partir
  control.classList.add('sacude');
}
for (const c of document.querySelectorAll('.control')) c.addEventListener('animationend', () => c.classList.remove('sacude'));
function mostrarAviso(texto) { aviso.textContent = texto; aviso.hidden = false; }
function ocultarAviso() { aviso.hidden = true; aviso.textContent = ''; }

// Escribir: typing (salvo en las contraseñas, donde sigue tímido) y, si el campo tenía error, se revisa de nuevo
form.addEventListener('input', (ev) => {
  const nombre = ev.target.name;
  if (!reglas[nombre]) return;
  if (ev.target.getAttribute('aria-invalid') === 'true') revisar(nombre);
  if (nombre === 'clave' && campos.confirma.value && campos.confirma.getAttribute('aria-invalid') === 'true') revisar('confirma');
  if (ev.target.matches('[data-clave]') && tiene('shy')) return;
  clearTimeout(tecleo);
  tecleo = setTimeout(() => { tecleo = null; if (estado === 'typing') ir(base()); }, PAUSA_TECLEO);
  if (estado !== 'typing') ir('typing');
});

// Las contraseñas: hace como que no mira; al salir, vuelve
form.addEventListener('focusin', (ev) => {
  // En el celular el avatar se achica arriba (CSS con data-foco); el campo se vuelve a centrar tras el cambio
  if (celular.matches && !('foco' in raiz.dataset)) {
    raiz.dataset.foco = '';
    requestAnimationFrame(() => ev.target.scrollIntoView({ block: 'center' }));
  }
  if (ev.target.matches('[data-clave]') && tiene('shy') && estado !== 'error') { clearTimeout(tecleo); tecleo = null; ir('shy'); }
  else apuntar();
});
form.addEventListener('focusout', (ev) => {
  const input = ev.target, nombre = input.name;
  // Se mira después de que el foco llegó a su nuevo lugar
  setTimeout(() => {
    if (!form.contains(document.activeElement)) delete raiz.dataset.foco;
    if (estado === 'shy' && !enClave()) ir(base());
    else apuntar();
    // Al salir de un campo con algo escrito que no valida: el mensaje, la sacudida y la cara de error
    if (!reglas[nombre] || !input.value || raiz.dataset.pantalla === 'listo') return;
    if (!revisar(nombre)) { sacudir(input); ir('error', { otraVez: true }); }
  }, 0);
});

// Mostrar u ocultar la contraseña
for (const b of document.querySelectorAll('.ver')) {
  // Con el mouse, el foco se queda en el campo: así no se valida a medio escribir ni deja de hacerse el tímido
  b.addEventListener('mousedown', (ev) => ev.preventDefault());
  b.addEventListener('click', () => {
    const input = document.getElementById(b.getAttribute('aria-controls'));
    const ver = input.type === 'password';
    input.type = ver ? 'text' : 'password';
    b.textContent = ver ? 'Ocultar' : 'Mostrar';
    b.setAttribute('aria-pressed', String(ver));
    b.setAttribute('aria-label', (ver ? 'Ocultar ' : 'Mostrar ') + (input.id === 'clave' ? 'contraseña' : 'la confirmación'));
  });
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  if (boton.getAttribute('aria-busy') === 'true') return;
  const malos = Object.keys(campos).filter((n) => !revisar(n));
  if (malos.length) {
    malos.forEach((n) => sacudir(campos[n]));
    campos[malos[0]].focus({ preventScroll: false });
    clearTimeout(tecleo); tecleo = null;
    ir('error', { otraVez: true });
    return;
  }
  // El envío simulado: un segundo pensando, sin backend
  boton.setAttribute('aria-busy', 'true');
  boton.disabled = true;
  boton.textContent = 'Creando tu cuenta…';
  ir(tiene('thinking') ? 'thinking' : 'idle');
  await new Promise((r) => setTimeout(r, ENVIO));
  boton.removeAttribute('aria-busy');
  boton.disabled = false;
  boton.textContent = 'Crear cuenta';
  $('#listo-nombre').textContent = campos.nombre.value.trim().split(/\s+/)[0];
  raiz.dataset.pantalla = 'listo';
  document.activeElement?.blur();
  delete raiz.dataset.foco;
  $('#listo').focus({ preventScroll: true });
  if (celular.matches) scrollTo({ top: 0, behavior: sinMovimiento.matches ? 'auto' : 'smooth' });
  // Primero la pantalla de éxito, después el avatar celebra y da un saltito
  ir('success', { otraVez: true });
  if (!sinMovimiento.matches) { rebota.classList.remove('salta'); void rebota.offsetWidth; rebota.classList.add('salta'); }
});
rebota.addEventListener('animationend', () => rebota.classList.remove('salta'));

$('#otra-vez').addEventListener('click', () => {
  form.reset();
  for (const n of Object.keys(campos)) { campos[n].removeAttribute('aria-invalid'); $(`#${campos[n].id}-msj`).textContent = ''; }
  for (const b of document.querySelectorAll('.ver')) { const i = document.getElementById(b.getAttribute('aria-controls')); i.type = 'password'; b.textContent = 'Mostrar'; b.setAttribute('aria-pressed', 'false'); }
  delete raiz.dataset.pantalla;
  ir('idle');
  campos.nombre.focus();
});

sinMovimiento.addEventListener?.('change', () => { if (sinMovimiento.matches) inclina.style.transform = ''; else apuntar(); });

montar(new URLSearchParams(location.search).get('avatar'));
