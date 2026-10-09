// Atlas, la página: monta a Atlas en 3D, entra con la contraseña, lo despierta con el resumen del día y conversa
// (con la voz o escribiendo). Lleva sus reacciones según lo que pasa: atento, escuchando, buscando, leyendo,
// encontrado, hablando, esperando tu OK, guardado… Lo que dice va en voz alta (si está activado) y por escrito.
import { crearAvatar3D } from '../avatares3d/avatar3d.js';
import { crearVoz, crearOido } from './voz.js';
import { sonar, encenderAudio } from './sonidos.js';
import { markdown, paraDecir } from './markdown.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const hud = $('#hud');
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[¿¡]/g, '').trim();
const hoy = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());

// ── Lo que se guarda en este aparato ──
const AJUSTES = { estilo: '1', sonido: 'si', voz: 'si', nombreVoz: '' };
const leer = (clave, defecto) => { try { return JSON.parse(localStorage.getItem(clave)) ?? defecto; } catch { return defecto; } };
const guardarLocal = (clave, valor) => { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento */ } };

// ── Atlas y sus reacciones ──
const UNA_VEZ = { despertar: 2800, atento: 700, asentir: 1000, duda: 2200, encontrado: 1100, alegre: 1500, celebrar: 2600, risa: 1800, buenasnoches: 3200, success: 2600, error: 1900 };
const TONO_HUD = { alerta: 'alerta', preocupado: 'preocupado', success: 'bien', celebrar: 'bien', error: 'error', dormir: 'dormido', buenasnoches: 'dormido' };
let atlas = null, actual = 'idle', luego = null;

function reaccion(clave, { sonido = false, despues = null } = {}) {
  actual = clave;
  luego = despues;
  atlas?.play(clave);
  hud.dataset.reaccion = clave;
  hud.dataset.tono = TONO_HUD[clave] ?? '';
  if (sonido && AJUSTES.sonido === 'si') sonar(clave);
}
// Cuando termina una de las que corren una vez, sigue la que corresponde
function alTerminarReaccion(clave) {
  if (clave !== actual) return;
  const siguiente = typeof luego === 'function' ? luego() : luego;
  luego = null;
  if (siguiente) reaccion(siguiente);
  else if (!['buenasnoches', 'despertar'].includes(clave)) reaccion('idle');
}
// Mientras Atlas habla: «hablando», salvo que el tono sea de alerta o de pena
const reaccionAlHablar = (tono) => (tono === 'alerta' ? 'alerta' : tono === 'preocupado' ? 'preocupado' : 'hablando');

// El plasma late con cada palabra que se dice o se oye
let pico = 0;
const latir = () => { pico = 1; };
(function latido() {
  if (hud.dataset.voz) { pico *= 0.88; atlas?.ajustar({ nivel: 0.12 + pico * 0.88 }); }
  requestAnimationFrame(latido);
})();

// La mirada sigue al cursor (con el dedo, mira al frente)
addEventListener('pointermove', (ev) => {
  if (ev.pointerType === 'touch' || sinMovimiento.matches || !atlas) return;
  const r = $('#atlas').getBoundingClientRect(), alcance = Math.max(innerWidth, innerHeight) * 0.55;
  const lim = (v) => Math.max(-1, Math.min(1, v));
  atlas.orientar(lim((ev.clientX - (r.left + r.width / 2)) / alcance), lim((ev.clientY - (r.top + r.height / 2)) / alcance));
}, { passive: true });

// ── Lo que se ve y se oye ──
const estado = (texto = '') => { $('#estado').textContent = texto; };
function subtitulo(quien, texto) {
  const q = $('#quien');
  q.textContent = quien === 'atlas' ? 'Atlas' : quien === 'tu' ? 'Tú' : '';
  q.className = `quien${quien === 'atlas' ? ' es-atlas' : ''}`;
  $('#dicho').textContent = texto;
}
function conexion(tipo, texto) { hud.dataset.conexion = tipo; $('#conexion-texto').textContent = texto; }
$('#onda').innerHTML = Array.from({ length: 28 }, (_, i) => `<i style="--h:${6 + Math.round(22 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)))}px;animation-delay:${-(i % 7) * 0.13}s"></i>`).join('');

const voz = crearVoz({
  alLatir: latir,
  alEmpezar: () => { hud.dataset.voz = 'atlas'; },
  alTerminar: () => { if (hud.dataset.voz === 'atlas') delete hud.dataset.voz; alCallarse(); }
});
const conVoz = () => AJUSTES.voz === 'si' && voz.disponible;
const lectura = (texto) => Math.max(1200, texto.split(/\s+/).length * 320);
// Dice algo y espera a que termine (sin voz: el rato que toma leerlo)
async function decirYEsperar(texto) {
  if (conVoz()) { hud.dataset.voz = 'atlas'; await voz.decir(paraDecir(texto)); delete hud.dataset.voz; }
  else await esperar(lectura(texto));
}

// ── El servidor ──
async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  const r = await fetch(ruta, { method: metodo, headers: cuerpo ? { 'content-type': 'application/json' } : {}, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  const datos = await r.json().catch(() => ({}));
  if (r.status === 401 && ruta !== '/api/entrar') { sesionVencida(); throw new Error('La sesión venció.'); }
  if (!r.ok) throw Object.assign(new Error(datos.error ?? `El servidor respondió ${r.status}.`), { estado: r.status });
  return datos;
}
// Los eventos de la conversación (server-sent events), a medida que llegan
async function* eventos(cuerpo) {
  const lector = cuerpo.getReader(), decodificador = new TextDecoder();
  let buf = '', terminado = false;
  try {
    for (;;) {
      const { value, done } = await lector.read();
      if (done) { terminado = true; break; }
      buf += decodificador.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n\n')) !== -1) {
        const bloque = buf.slice(0, i);
        buf = buf.slice(i + 2);
        let evento = 'message', datos = '';
        for (const l of bloque.split('\n')) {
          if (l.startsWith('event: ')) evento = l.slice(7);
          else if (l.startsWith('data: ')) datos += l.slice(6);
        }
        let objeto;
        try { objeto = JSON.parse(datos || '{}'); } catch { continue; }      // un evento roto no corta la conversación
        yield [evento, objeto];
      }
    }
  } finally {
    // Al terminar se suelta el lector (si no, el navegador da la respuesta por cortada); si se dejó de leer antes, se cancela
    if (terminado) lector.releaseLock(); else lector.cancel().catch(() => {});
  }
}

// ── Entrar ──
function mostrarEntrar(aviso = '') {
  hud.dataset.vista = 'entrar';
  $('#entrar').hidden = false;
  $('#mando').hidden = true;
  $('#abrir-ajustes').hidden = true;
  $('#tocar').hidden = true;
  $('#aviso-entrar').textContent = aviso;
  conexion('', 'Privado');
  reaccion('idle');
  estado('');
}
// Mientras escribes la contraseña, Atlas no mira
$('#clave').addEventListener('focus', () => reaccion('shy'));
$('#clave').addEventListener('blur', () => { if (hud.dataset.vista === 'entrar') reaccion('idle'); });
$('#entrar').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  encenderAudio(); voz.desbloquear();
  const boton = $('#entrar button');
  boton.disabled = true;
  try {
    const r = await api('/api/entrar', { metodo: 'POST', cuerpo: { clave: $('#clave').value } });
    $('#clave').value = '';
    $('#clave').blur();
    entrarAAtlas({ conToque: false, modoSimulado: r.simulado });
  } catch (e) {
    reaccion('error', { sonido: true });
    $('#aviso-entrar').textContent = e.message;
  } finally { boton.disabled = false; }
});
function sesionVencida() { voz.callar(); oido.cancelar(); enCurso?.abort(); mostrarEntrar('La sesión venció: vuelve a entrar.'); }

// ── Despertar, dormir y el resumen del día ──
let dormido = false, ultimoResumen = leer('atlas-resumen-dia', ''), simulado = false, temporizador = null;
const DORMIR_TRAS = 4 * 60 * 1000;

function entrarAAtlas({ conToque, modoSimulado = simulado }) {
  simulado = modoSimulado;
  hud.dataset.vista = 'atlas';
  $('#entrar').hidden = true;
  $('#mando').hidden = false;
  $('#abrir-ajustes').hidden = false;
  conexion(simulado ? 'simulado' : 'ok', simulado ? 'Modo de prueba' : 'En línea');
  restaurarCharla();
  if (conToque) { dormir({ sinSonido: true }); subtitulo('', ''); }
  else despertar();
}

async function despertar({ conResumen = ultimoResumen !== hoy() } = {}) {
  dormido = false;
  $('#tocar').hidden = true;
  encenderAudio(); voz.desbloquear();
  reaccion('despertar', { sonido: true });
  estado('');
  const pedido = conResumen ? api('/api/resumen').catch((e) => ({ error: e.message })) : null;
  await esperar(sinMovimiento.matches ? 500 : 2800);
  if (!conResumen) { if (actual === 'despertar') reaccion('idle'); marcarActividad(); return; }
  const r = await pedido;
  if (r.error) { fallaGeneral(r.error); return; }
  pintarResumen(r);
  ultimoResumen = r.fecha;
  guardarLocal('atlas-resumen-dia', r.fecha);
  await leerResumen(r);
}

function pintarResumen(r) {
  const caja = $('#resumen');
  const dia = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
  caja.innerHTML = `<div class="tarjeta"><p class="t-titulo">Resumen del día <small>${dia}</small></p><ul class="cifras">${r.cifras.map((c) =>
    `<li${c.tono ? ` data-tono="${c.tono}"` : ''}><b>${c.n}</b><span>${escapar(c.texto)}${c.detalle ? `<small>${escapar(c.detalle)}</small>` : ''}</span></li>`).join('')}</ul>
    <button class="repetir" type="button">Escuchar de nuevo</button></div>`;
  caja.hidden = false;
  $('.repetir', caja).addEventListener('click', () => leerResumen(r));
}

let leyendoResumen = 0;
async function leerResumen(r) {
  const mio = ++leyendoResumen;
  voz.callar();
  for (const parte of r.partes) {
    if (mio !== leyendoResumen) return;
    const tono = parte.tono;
    if (tono === 'alerta' || tono === 'preocupado') reaccion(tono, { sonido: true });
    else if (tono === 'alegre') reaccion('alegre', { sonido: true, despues: 'hablando' });
    else reaccion('hablando');
    subtitulo('atlas', parte.texto);
    await decirYEsperar(parte.texto);
  }
  if (mio === leyendoResumen) { reaccion('idle'); marcarActividad(); }
}

function dormir({ sinSonido = false } = {}) {
  if (enCurso || oido.escuchando() || voz.hablando()) { marcarActividad(); return; }
  dormido = true;
  reaccion('dormir', { sonido: !sinSonido });
  estado('');
  $('#tocar').hidden = false;
}
function marcarActividad() {
  clearTimeout(temporizador);
  if (hud.dataset.vista === 'atlas') temporizador = setTimeout(() => dormir(), DORMIR_TRAS);
}
['pointerdown', 'keydown'].forEach((t) => addEventListener(t, () => { encenderAudio(); if (!dormido) marcarActividad(); }, { capture: true, passive: true }));

$('#tocar').addEventListener('click', () => despertar());

// ── La conversación ──
let historia = leer('atlas-historia', []), turnos = leer('atlas-charla', []), enCurso = null, propuestaPendiente = null;
let tonoActual = null, respuestaTerminada = true;

const CONFIRMAR = /^(si|sip|dale|ok|okay|ya|bueno|perfecto|de acuerdo|confirmo|hazlo|guarda(lo)?|si,? (guarda(lo)?|dale|por favor|gracias|hazlo))[\s.!,]*(por favor|gracias)?[\s.!]*$/;
const DESCARTAR = /^(no|nop|cancela(lo)?|olvida(lo)?|deja(lo)?|mejor no|no,? (gracias|deja(lo)?|olvida(lo)?|no lo guardes))[\s.!]*$/;
const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function crearTurno(pregunta) {
  const el = document.createElement('article');
  el.className = 'turno';
  el.innerHTML = `<p class="pregunta"></p><div class="respuesta md escribiendo"></div>`;
  $('.pregunta', el).textContent = pregunta;
  $('#charla').append(el);
  hud.classList.add('hay-charla');
  bajar();
  return { el, pregunta, respuesta: '', citas: [], propuesta: null };
}
const bajar = () => requestAnimationFrame(() => { const c = innerWidth <= 900 ? $('#lecturas') : $('#charla'); c.scrollTop = c.scrollHeight; });

function pintarTurno(t) {
  const caja = $('.respuesta', t.el);
  caja.innerHTML = markdown(t.respuesta);
  if (t.citas.length) caja.insertAdjacentHTML('beforeend', `<ul class="citas">${t.citas.map((c) => `<li><button type="button" class="cita" data-pagina="${escapar(c.nombre)}">${escapar(c.nombre)}</button></li>`).join('')}</ul>`);
  if (t.meta) caja.insertAdjacentHTML('beforeend', `<p class="meta">${escapar(t.meta)}</p>`);
}
let pintado = null;
const programarPintado = (t) => { if (!pintado) pintado = requestAnimationFrame(() => { pintado = null; pintarTurno(t); bajar(); }); };

// Las frases se dicen a medida que llegan: cada una cuando termina en punto, signo o salto de línea
let porDecir = '';
function empujarVoz(delta, { final = false } = {}) {
  porDecir += delta;
  const frases = [];
  for (;;) {
    const m = porDecir.match(/^[\s\S]*?(?:[.!?…:](?=\s)|\n)/);
    if (!m) break;
    frases.push(m[0]);
    porDecir = porDecir.slice(m[0].length);
  }
  if (final && porDecir.trim()) { frases.push(porDecir); porDecir = ''; }
  if (!conVoz()) return;
  for (const f of frases) { const dicho = paraDecir(f); if (dicho) voz.decir(dicho); }
}

// Cuando Atlas termina de decir una respuesta que ya llegó entera, queda en lo que corresponde
let cerrarAlCallar = false;
function alCallarse() {
  if (!cerrarAlCallar || enCurso) return;
  cerrarAlCallar = false;
  quedarse();
}
function quedarse() {
  estado('');
  if (propuestaPendiente) { reaccion('esperando', { sonido: true }); estado('Esperando tu OK'); }
  else if (tonoActual === 'buenasnoches') {
    reaccion('buenasnoches', { sonido: true });
    setTimeout(() => { if (actual === 'buenasnoches') { dormido = true; $('#tocar').hidden = false; } }, 3300);
  } else if (!UNA_VEZ[actual]) reaccion('idle');
  marcarActividad();
}

async function enviar(texto) {
  texto = texto.trim();
  if (!texto) return;
  marcarActividad();
  encenderAudio(); voz.desbloquear();
  if (dormido) await despertar({ conResumen: false });
  leyendoResumen++;

  // Con una propuesta esperando, «sí» la guarda y «no» la descarta, sin pasar por Claude
  const n = normalizar(texto);
  if (propuestaPendiente && CONFIRMAR.test(n)) { subtitulo('tu', texto); return guardar(propuestaPendiente); }
  if (propuestaPendiente && DESCARTAR.test(n)) {
    subtitulo('tu', texto);
    marcarPropuesta(propuestaPendiente, 'descartada');
    propuestaPendiente = null;
    reaccion('asentir', { sonido: true });
    subtitulo('atlas', 'Listo, no lo guardo.');
    historia.push({ rol: 'chris', texto }, { rol: 'atlas', texto: 'Listo, no lo guardo. (La propuesta quedó descartada.)' });
    guardarCharla();
    decirYEsperar('Listo, no lo guardo.');
    return;
  }

  enCurso?.abort();
  voz.callar();
  oido.cancelar();
  const control = new AbortController();
  enCurso = control;
  const t = crearTurno(texto);
  turnos.push(t);
  const t0 = performance.now();
  subtitulo('tu', texto);
  estado('');
  porDecir = '';
  tonoActual = null;
  respuestaTerminada = false;
  cerrarAlCallar = false;
  let herramientas = false, primerTexto = true;
  reaccion('asentir', { sonido: true, despues: null });
  const pensando = setTimeout(() => { if (primerTexto && !herramientas && enCurso === control) { reaccion('thinking'); estado('Pensando…'); } }, 1000);
  const cambiar = (clave, texto) => { if (actual !== clave) reaccion(clave); estado(texto); };

  try {
    const r = await fetch('/api/charla', {
      method: 'POST', headers: { 'content-type': 'application/json' }, signal: control.signal,
      body: JSON.stringify({ mensaje: texto, historia: historia.slice(-16) })
    });
    if (r.status === 401) { sesionVencida(); return; }
    if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error ?? 'No pude hablar con el servidor.');
    for await (const [evento, d] of eventos(r.body)) {
      if (enCurso !== control) return;
      if (evento === 'reaccion') {
        if (d.reaccion === 'buscando') { herramientas = true; cambiar('buscando', d.detalle ? `Buscando «${d.detalle}»…` : 'Buscando en tu bóveda…'); }
        else if (d.reaccion === 'leyendo') { herramientas = true; cambiar('leyendo', d.detalle ? `Leyendo «${d.detalle}»…` : 'Leyendo…'); }
        else if (d.reaccion === 'anotando') { herramientas = true; cambiar('typing', 'Preparando el cambio…'); }
      } else if (evento === 'tono') {
        tonoActual = d.tono;
      } else if (evento === 'texto') {
        if (primerTexto) {
          primerTexto = false;
          clearTimeout(pensando);
          estado('');
          // La primera reacción de la respuesta: la del tono, o «¡lo encontré!» si buscó; después, hablando
          const tono = tonoActual;
          const abre = ['encontrado', 'duda', 'alegre', 'risa', 'celebrar'].includes(tono) ? tono : herramientas && tono !== 'alerta' && tono !== 'preocupado' ? 'encontrado' : null;
          if (abre) reaccion(abre, { sonido: true, despues: () => (voz.hablando() || !respuestaTerminada ? reaccionAlHablar(tonoActual) : null) });
          else reaccion(reaccionAlHablar(tono), { sonido: tono === 'alerta' || tono === 'preocupado' });
        }
        t.respuesta += d.delta;
        programarPintado(t);
        empujarVoz(d.delta);
        subtitulo('atlas', paraDecir(t.respuesta).slice(-220));
      } else if (evento === 'propuesta') {
        if (propuestaPendiente) marcarPropuesta(propuestaPendiente, 'reemplazada');
        t.propuesta = { ...d, estado: 'pendiente' };
        propuestaPendiente = t.propuesta;
        pintarPropuesta(t);
      } else if (evento === 'fin') {
        t.citas = d.citas ?? [];
        const segundos = ((performance.now() - t0) / 1000).toFixed(1).replace('.', ',');
        t.meta = d.costo != null ? `${segundos} s · ≈ US$${d.costo.toFixed(3).replace('.', ',')}` : `${segundos} s`;
        if (d.costo != null) sumarGasto(d.costo);
        if (!tonoActual) tonoActual = d.tono;
      } else if (evento === 'error') {
        throw new Error(d.mensaje);
      }
    }
    $('.respuesta', t.el).classList.remove('escribiendo');
    pintarTurno(t);
    if (t.propuesta) pintarPropuesta(t);
    bajar();
    const nota = t.propuesta ? `\n\n[Propuesta en pantalla para ${t.propuesta.pagina}: ${t.propuesta.vista.filter((l) => l.signo !== ' ').map((l) => `${l.signo} ${l.texto}`).join(' / ')}]` : '';
    historia.push({ rol: 'chris', texto }, { rol: 'atlas', texto: `${t.respuesta}${nota}` || '(sin respuesta)' });
    guardarCharla();
    empujarVoz('', { final: true });
    respuestaTerminada = true;
    if (enCurso === control) enCurso = null;
    if (conVoz() && voz.hablando()) cerrarAlCallar = true;
    else setTimeout(() => { if (!enCurso && respuestaTerminada) quedarse(); }, conVoz() ? 200 : Math.min(2500, lectura(t.respuesta) / 3));
  } catch (e) {
    if (e.name === 'AbortError') return;
    fallo(t, e.message);
  } finally {
    clearTimeout(pensando);
    if (enCurso === control) enCurso = null;
    respuestaTerminada = true;
  }
}

function fallo(t, mensaje) {
  t.fallo = true;
  t.respuesta = t.respuesta || mensaje;
  const caja = $('.respuesta', t.el);
  caja.classList.remove('escribiendo');
  caja.classList.add('fallo');
  pintarTurno(t);
  guardarCharla();
  fallaGeneral(mensaje);
}
function fallaGeneral(mensaje) {
  voz.callar();
  reaccion('error', { sonido: true });
  estado('Algo falló');
  subtitulo('atlas', mensaje);
  marcarActividad();
}

// ── Las propuestas de cambio ──
function pintarPropuesta(t) {
  const p = t.propuesta;
  let caja = $('.propuesta', t.el);
  if (!caja) { caja = document.createElement('div'); caja.className = 'propuesta'; $('.respuesta', t.el).after(caja); }
  const lineas = (vista) => vista.map((l) => `<span class="l${l.signo === '+' ? ' mas' : l.signo === '-' ? ' menos' : ''}">${escapar(`${l.signo} ${l.texto}`)}</span>`).join('');
  const titulos = { pendiente: '¿Lo guardo así?', guardando: 'Guardando…', guardada: 'Guardado en la bóveda', error: 'No se pudo guardar', descartada: 'No se guardó', reemplazada: 'Reemplazada por una nueva propuesta' };
  caja.dataset.estado = p.estado;
  caja.innerHTML = `<p class="p-titulo">${titulos[p.estado] ?? ''}</p>
    <div class="diff"><div class="ruta">${escapar(p.ruta.replace(/^Biplot\//, ''))}</div>${lineas(p.vista)}<div class="ruta">log.md</div>${lineas(p.log.split('\n').map((texto) => ({ signo: '+', texto })))}</div>
    ${p.estado === 'pendiente' || p.estado === 'error' ? '<div class="acciones"><button type="button" class="guardar">Guardar en la bóveda</button><button type="button" class="cambiar">Cambiar</button></div>' : ''}
    ${p.estado === 'guardada' ? `<p class="hecho">✓ Guardado en ${escapar(p.pagina)} y en el registro${p.url ? `<a href="${escapar(p.url)}" target="_blank" rel="noopener noreferrer">ver el commit</a>` : ''}</p>` : ''}
    ${p.error ? `<p class="nota">${escapar(p.error)}</p>` : ''}`;
  $('.guardar', caja)?.addEventListener('click', () => guardar(p));
  $('.cambiar', caja)?.addEventListener('click', () => {
    const entrada = $('#entrada');
    entrada.placeholder = '¿Qué le cambio?';
    entrada.focus();
    subtitulo('atlas', '¿Qué le cambio? Dímelo o escríbelo.');
  });
}
function marcarPropuesta(p, estadoNuevo, extra = {}) {
  Object.assign(p, { estado: estadoNuevo }, extra);
  const t = turnos.find((x) => x.propuesta === p);
  if (t) pintarPropuesta(t);
  guardarCharla();
}

async function guardar(p) {
  if (p.estado === 'guardando' || p.estado === 'guardada') return;
  marcarActividad();
  voz.callar();
  marcarPropuesta(p, 'guardando', { error: '' });
  reaccion('typing');
  estado('Guardando en la bóveda…');
  try {
    const r = await api('/api/guardar', { metodo: 'POST', cuerpo: { token: p.token } });
    marcarPropuesta(p, 'guardada', { url: r.url });
    if (propuestaPendiente === p) propuestaPendiente = null;
    const frase = `Listo, anotado en ${r.pagina}.`;
    reaccion('success', { sonido: true });
    estado('Anotado');
    subtitulo('atlas', frase);
    historia.push({ rol: 'chris', texto: 'Sí, guárdalo.' }, { rol: 'atlas', texto: `${frase} (Quedó guardado en la bóveda.)` });
    guardarCharla();
    await decirYEsperar(frase);
    estado('');
  } catch (e) {
    marcarPropuesta(p, 'error', { error: e.message });
    reaccion('error', { sonido: true });
    estado('No se pudo guardar');
    subtitulo('atlas', e.message);
  }
}

// ── Lo de la conversación que queda en este aparato (para no perderla al recargar) ──
function guardarCharla() {
  historia = historia.slice(-30);
  guardarLocal('atlas-historia', historia);
  guardarLocal('atlas-charla', turnos.slice(-30).map(({ pregunta, respuesta, citas, meta, fallo: f, propuesta }) => ({
    pregunta, respuesta, citas, meta, fallo: f,
    propuesta: propuesta ? { ...propuesta, token: undefined, estado: propuesta.estado === 'pendiente' ? 'descartada' : propuesta.estado } : null
  })));
}
let restaurada = false;
function restaurarCharla() {
  if (restaurada) return;
  restaurada = true;
  const guardados = turnos;
  turnos = [];
  for (const g of guardados) {
    const t = crearTurno(g.pregunta);
    Object.assign(t, g);
    $('.respuesta', t.el).classList.remove('escribiendo');
    if (g.fallo) $('.respuesta', t.el).classList.add('fallo');
    pintarTurno(t);
    if (t.propuesta) pintarPropuesta(t);
    turnos.push(t);
  }
}

// ── El micrófono ──
let fallaDeOido = false;
const oido = crearOido({
  alOir: (texto) => { subtitulo('tu', texto || '…'); latir(); },
  alFallar: (error) => {
    fallaDeOido = true;
    const mensajes = {
      'not-allowed': 'No tengo permiso para usar el micrófono: dámelo en los ajustes del navegador.',
      'service-not-allowed': 'Este navegador no me deja escucharte: escríbeme abajo.',
      network: 'Para escucharte necesito internet.',
      'audio-capture': 'No encuentro un micrófono.'
    };
    if (mensajes[error]) { reaccion('duda', { sonido: true }); subtitulo('atlas', mensajes[error]); }
    else fallaDeOido = false;
  },
  alTerminar: (texto) => {
    $('#mic').setAttribute('aria-pressed', 'false');
    if (hud.dataset.voz === 'chris') delete hud.dataset.voz;
    estado('');
    if (texto) { enviar(texto); return; }
    if (!fallaDeOido) { reaccion('duda', { sonido: true }); subtitulo('atlas', 'No te escuché. ¿Me lo repites?'); }
    fallaDeOido = false;
  }
});
if (!oido.disponible) $('#mic').dataset.sinVoz = '';

async function alternarMic() {
  marcarActividad();
  encenderAudio(); voz.desbloquear();
  if (dormido) { await despertar({ conResumen: false }); return; }
  if (oido.escuchando()) { oido.parar(); return; }
  if (!oido.disponible) {
    $('#entrada').focus();
    subtitulo('atlas', 'Este navegador no me deja escucharte: escríbeme abajo.');
    reaccion('duda', { sonido: true });
    return;
  }
  leyendoResumen++;
  voz.callar();
  enCurso?.abort();
  fallaDeOido = false;
  reaccion('atento', { sonido: true, despues: () => (oido.escuchando() ? 'escuchando' : null) });
  $('#mic').setAttribute('aria-pressed', 'true');
  hud.dataset.voz = 'chris';
  subtitulo('tu', '…');
  estado('Te escucho');
  if (!oido.escuchar()) { $('#mic').setAttribute('aria-pressed', 'false'); delete hud.dataset.voz; estado(''); }
}
$('#mic').addEventListener('click', alternarMic);
$('#atlas').addEventListener('click', () => (dormido ? despertar() : hud.dataset.vista === 'atlas' && alternarMic()));
$('#escribir').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const entrada = $('#entrada');
  const texto = entrada.value;
  entrada.value = '';
  entrada.placeholder = 'Escríbele a Atlas…';
  enviar(texto);
});
// Espacio: hablarle (si no estás escribiendo). Escape: que se calle
addEventListener('keydown', (ev) => {
  if (hud.dataset.vista !== 'atlas' || ev.target.closest?.('input, textarea, select, button, dialog')) return;
  if (ev.code === 'Space') { ev.preventDefault(); alternarMic(); }
  if (ev.key === 'Escape') { voz.callar(); oido.cancelar(); leyendoResumen++; if (!enCurso) quedarse(); }
});

// ── Las páginas citadas: se leen aquí mismo, con el enlace para abrirlas en Obsidian ──
document.addEventListener('click', async (ev) => {
  const enlace = ev.target.closest?.('[data-pagina]');
  if (!enlace) return;
  ev.preventDefault();
  marcarActividad();
  const visor = $('#visor');
  $('#t-visor').textContent = enlace.dataset.pagina;
  $('#visor-texto').innerHTML = '<p>Cargando…</p>';
  $('#visor-obsidian').hidden = true;
  if (!visor.open) visor.showModal();
  try {
    const p = await api(`/api/pagina?nombre=${encodeURIComponent(enlace.dataset.pagina)}`);
    $('#t-visor').textContent = p.pagina;
    $('#visor-texto').innerHTML = markdown(p.texto, { propiedades: true });
    $('#visor-obsidian').href = p.obsidian;
    $('#visor-obsidian').hidden = false;
    $('#visor-texto').scrollTop = 0;
  } catch (e) {
    $('#visor-texto').innerHTML = `<p>${escapar(e.message)}</p>`;
  }
});
$('#cerrar-visor').addEventListener('click', () => $('#visor').close());

// ── Ajustes ──
function aplicarAjustes() {
  atlas?.ajustar({ intensidad: Number(AJUSTES.estilo) });
  for (const b of $$('[data-ajuste]')) b.setAttribute('aria-pressed', String(AJUSTES[b.dataset.ajuste] === b.dataset.valor));
  if (AJUSTES.nombreVoz) voz.elegir(AJUSTES.nombreVoz);
  if (AJUSTES.voz !== 'si') voz.callar();
}
function llenarVoces() {
  const lista = $('#elegir-voz'), voces = voz.voces();
  const elegida = AJUSTES.nombreVoz || voz.porDefecto()?.name || '';
  lista.innerHTML = voces.length ? voces.map((v) => `<option value="${escapar(v.name)}"${v.name === elegida ? ' selected' : ''}>${escapar(`${v.name} (${v.lang})`)}</option>`).join('') : '<option value="">Sin voces en español</option>';
  lista.disabled = !voces.length;
}
if (voz.disponible) speechSynthesis.addEventListener?.('voiceschanged', llenarVoces);
$$('[data-ajuste]').forEach((b) => b.addEventListener('click', () => {
  AJUSTES[b.dataset.ajuste] = b.dataset.valor;
  guardarLocal('atlas-ajustes', AJUSTES);
  aplicarAjustes();
  if (b.dataset.ajuste === 'estilo') reaccion('alegre', { sonido: true });
  if (b.dataset.ajuste === 'sonido' && b.dataset.valor === 'si') { encenderAudio(); sonar('atento'); }
}));
$('#elegir-voz').addEventListener('change', (ev) => {
  AJUSTES.nombreVoz = ev.target.value;
  guardarLocal('atlas-ajustes', AJUSTES);
  aplicarAjustes();
  voz.callar();
  voz.decir('Así sueno yo.');
});
function sumarGasto(costo) {
  const g = leer('atlas-gasto', { dia: '', total: 0, ultimo: 0 });
  if (g.dia !== hoy()) Object.assign(g, { dia: hoy(), total: 0 });
  g.total += costo; g.ultimo = costo;
  guardarLocal('atlas-gasto', g);
}
$('#abrir-ajustes').addEventListener('click', () => {
  llenarVoces();
  aplicarAjustes();
  const g = leer('atlas-gasto', null);
  $('#gasto').textContent = simulado ? 'Modo de prueba: las respuestas no pasan por Claude.'
    : g && g.dia === hoy() ? `Hoy: ≈ US$${g.total.toFixed(3).replace('.', ',')} en Claude (la última respuesta, ≈ US$${g.ultimo.toFixed(3).replace('.', ',')}).` : 'Hoy todavía no le has preguntado nada a Claude.';
  $('#ajustes').showModal();
});
$('#salir').addEventListener('click', async () => {
  try { await api('/api/salir', { metodo: 'POST' }); } catch { /* igual sale */ }
  for (const k of ['atlas-historia', 'atlas-charla']) try { localStorage.removeItem(k); } catch { /* nada */ }
  location.reload();
});

// ── Arranque ──
async function iniciar() {
  Object.assign(AJUSTES, leer('atlas-ajustes', {}));
  atlas = crearAvatar3D($('#atlas'), { personaje: 'atlas', ariaLabel: 'Atlas', reducido: () => sinMovimiento.matches, onAnimationEnd: alTerminarReaccion });
  aplicarAjustes();
  reaccion('idle');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});
  try {
    const s = await api('/api/sesion');
    if (s.ok) entrarAAtlas({ conToque: true, modoSimulado: s.simulado });
    else mostrarEntrar();
  } catch (e) {
    conexion('error', 'Sin conexión');
    reaccion('error');
    estado(e.message);
  }
}
iniciar();
