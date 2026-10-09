// Tres preguntas con Plotty (propuesta): la conversación de la recepción de BiPlot HQ (E0), con Plotty en 3D que
// reacciona a cada respuesta. Las preguntas, el saludo, los finales, el WhatsApp y los casos de cada rubro salen de
// oficina/datos.js (window.OFICINA_DATOS, el mismo chat de la oficina): si cambian ahí, cambian aquí. Califica con 5
// horas o más a la semana, o si no lo sabe (noCalifican). Si calificas, la antena de Plotty se pone coral y te invita a
// «Agenda tu diagnóstico», que abre WhatsApp con tus tres respuestas. No se guarda ni se envía nada más.
import { crearAvatar3D } from '../../assets/avatares3d/avatar3d.js';

const D = window.OFICINA_DATOS, C = D.plotty;
const OFICINA = '../../oficina/';
// Lo que dice Plotty entre pregunta y pregunta (borradores de esta página) y el mensaje que va a WhatsApp
const REACCIONES = {
  rubro: (r) => (r === 'otro' ? 'Anotado. Al final te muestro algunos casos.' : 'Anotado. Tengo casos cercanos a tu rubro: te los dejo al final.'),
  donde: {
    planillas: 'Planillas: ahí suelen esconderse las horas.',
    whatsapp: 'WhatsApp y papel: rápido para partir, difícil para seguirle la pista.',
    sistema: 'Un sistema que no conversa con nada: alguien termina copiando datos a mano.',
    todo: 'Un poco en todo: es lo más común. Se ordena por partes.'
  }
};
const MENSAJE = {
  agenda: 'Hola BiPlot, respondí las tres preguntas de Plotty. Mi negocio: {rubro}. Mi operación vive {donde}. Horas a la semana en tareas que se repiten: {horas}. Quiero agendar un diagnóstico.',
  igual: 'Hola BiPlot, respondí las tres preguntas de Plotty. Mi negocio: {rubro}. Mi operación vive {donde}. Horas a la semana en tareas que se repiten: {horas}. Quiero conversar.'
};

const raiz = document.documentElement;
const $ = (s) => document.querySelector(s);
const charla = $('#charla'), opciones = $('#opciones'), final = $('#final'), avance = $('#avance'), rebota = $('#rebota');
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
const conCursor = matchMedia('(hover: hover) and (pointer: fine)');
const celular = matchMedia('(max-width: 900px)');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const pausa = (ms) => (sinMovimiento.matches ? Math.min(ms, 150) : ms);

// ── Plotty: cada reacción corre una vez y vuelve a lo que corresponda ──
let estado = 'idle', luego = 'listening';
const avatar = crearAvatar3D($('#avatar'), {
  personaje: 'plotty',
  ariaLabel: 'Plotty, la recepción de BiPlot HQ, reacciona a tus respuestas',
  onAnimationEnd: (clave) => { if (clave === estado) poner(luego); },
  reducido: () => sinMovimiento.matches
});
function poner(e) {
  estado = e;
  raiz.dataset.estado = raiz.dataset.animacion = e;
  avatar.play(e);
}
function reaccionar(e, despues) { luego = despues; poner(e); }

// ── La conversación ──
const resp = {};
let paso = 0, turno = 0;                      // turno: al empezar de nuevo, lo que estaba pendiente ya no sigue

// En el celular no se mueve la página hasta la primera respuesta: así Plotty se ve en grande al llegar
function mostrar(el) {
  if (celular.matches && !('charla' in raiz.dataset)) return;
  el.scrollIntoView({ block: 'nearest', behavior: sinMovimiento.matches ? 'auto' : 'smooth' });
}
function decir(texto, quien = 'plotty') {
  const li = document.createElement('li');
  li.className = `msg ${quien}`;
  if (quien === 'plotty') { const q = document.createElement('span'); q.className = 'quien'; q.textContent = 'Plotty'; li.append(q); }
  li.append(texto);
  charla.append(li); mostrar(li);
  return li;
}
// Los puntos de «escribiendo» y después el mensaje; si se empezó de nuevo entretanto, no dice nada
async function escribir(t, texto, ms = 750) {
  const li = document.createElement('li');
  li.className = 'msg plotty escribiendo'; li.setAttribute('aria-hidden', 'true');
  li.innerHTML = '<i></i><i></i><i></i>';
  charla.append(li); mostrar(li); apuntarCharla();
  await esperar(pausa(ms));
  li.remove();
  if (t !== turno) return false;
  decir(texto);
  return true;
}
function marcarAvance() {
  [...avance.children].forEach((li, i) => {
    const e = i < paso ? 'lista' : i === paso ? 'actual' : '';
    if (e) li.dataset.estado = e; else delete li.dataset.estado;
    if (e === 'actual') li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
  });
}

async function empezar() {
  const t = ++turno;
  charla.innerHTML = ''; opciones.innerHTML = ''; final.innerHTML = ''; final.hidden = true;
  for (const k of Object.keys(resp)) delete resp[k];
  paso = 0; marcarAvance();
  reaccionar('greeting', 'listening');
  if (await escribir(t, C.saludo, 900)) await preguntar(t);
}
async function preguntar(t) {
  const q = C.preguntas[paso];
  marcarAvance();
  if (!(await escribir(t, q.texto))) return;
  if (estado !== 'greeting') poner('listening');
  opciones.innerHTML = q.opciones.map((o, i) => `<button type="button" data-v="${esc(o[0])}" style="animation-delay:${i * 40}ms">${esc(o[1])}</button>`).join('');
  if (paso > 0) opciones.querySelector('button').focus({ preventScroll: true });
  mostrar(opciones); apuntarCharla();
}
opciones.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-v]');
  if (!b) return;
  const t = turno, q = C.preguntas[paso];
  resp[q.id] = b.dataset.v;
  opciones.innerHTML = '';
  decir(b.textContent, 'tu');
  if (celular.matches) raiz.dataset.charla = '';
  // Una reacción a la respuesta: contento, sorprendido con muchas horas, pensativo si no lo sabe
  reaccionar(q.id === 'horas' && resp.horas === 'mas15' ? 'surprised' : q.id === 'horas' && resp.horas === 'nose' ? 'thinking' : 'happy', 'thinking');
  paso++; marcarAvance();
  await esperar(pausa(350));
  const texto = q.id === 'rubro' ? REACCIONES.rubro(resp.rubro) : q.id === 'donde' ? REACCIONES.donde[resp.donde] : null;
  if (texto && !(await escribir(t, texto))) return;
  if (t !== turno) return;
  if (paso < C.preguntas.length) await preguntar(t); else await terminar(t);
});

async function terminar(t) {
  const califica = !C.noCalifican.includes(resp.horas);
  if (!(await escribir(t, 'Déjame ver…', 600))) return;
  poner('thinking');
  if (!(await escribir(t, califica ? C.califica : C.noCalifica, 1100))) return;
  poner(califica ? 'califica' : 'idle');
  if (califica && !sinMovimiento.matches) { rebota.classList.remove('salta'); void rebota.offsetWidth; rebota.classList.add('salta'); }
  mostrarFinal(califica);
}
rebota.addEventListener('animationend', () => rebota.classList.remove('salta'));

function mostrarFinal(califica) {
  const etiqueta = (id) => C.preguntas.find((p) => p.id === id).opciones.find((o) => o[0] === resp[id])?.[1] ?? resp[id];
  const minus = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const rellenar = (m) => m.replace('{rubro}', minus(etiqueta('rubro'))).replace('{donde}', minus(etiqueta('donde'))).replace('{horas}', minus(etiqueta('horas')));
  const wa = (m) => `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(rellenar(m))}`;
  const nuevaPestana = '<span class="oculto"> (se abre WhatsApp en otra pestaña)</span>';
  const camino = califica
    ? `<div class="acciones"><a class="agenda" href="${esc(wa(MENSAJE.agenda))}" target="_blank" rel="noopener">${esc(D.cta.texto)}${nuevaPestana}</a></div>
       <p class="detalle">Se abre WhatsApp con tus tres respuestas, listas para enviar.</p>`
    : `<div class="acciones"><a class="boton" href="${OFICINA}">Recorre la oficina</a>
       <a class="secundario" href="${esc(wa(MENSAJE.igual))}" target="_blank" rel="noopener">Escríbenos igual${nuevaPestana}</a></div>`;
  final.innerHTML = `
    <dl class="resumen">
      <div><dt>Tu negocio</dt><dd>${esc(etiqueta('rubro'))}</dd></div>
      <div><dt>Tu operación</dt><dd>${esc(etiqueta('donde'))}</dd></div>
      <div><dt>Tus horas</dt><dd>${esc(etiqueta('horas'))}</dd></div>
    </dl>
    ${camino}
    <section class="casos" aria-label="Casos como el tuyo"><h2>Casos como el tuyo</h2><ul>${casos(resp.rubro)}</ul></section>
    <div class="acciones"><button type="button" class="secundario" id="otra-vez">Empezar de nuevo</button></div>`;
  final.hidden = false;
  final.querySelector('.agenda, .boton').focus({ preventScroll: true });
  mostrar(final.querySelector('.acciones'));
  apuntarCharla();
  $('#otra-vez').addEventListener('click', () => {
    delete raiz.dataset.charla;
    if (celular.matches) scrollTo({ top: 0, behavior: sinMovimiento.matches ? 'auto' : 'smooth' });
    empezar();
  });
}
// Los casos más cercanos al rubro (la vitrina de la oficina): una sala de la calle o un caso de referencia del núcleo
function casos(rubro) {
  return (D.vitrina.rubros[rubro] ?? D.vitrina.porDefecto).map((id) => {
    const pr = D.proyectos.find((p) => p.id === id);
    if (pr) return `<li><a href="${OFICINA}#${esc(id)}"><b>${esc(pr.nombre)}</b><span>${esc(pr.rubro)}</span></a></li>`;
    const c = D.casos.find((x) => x.id === id);
    if (c) return `<li><a href="${OFICINA}${esc(c.caso)}"><b>${esc(c.nombre)} · ${esc(c.rubro)}</b><span>${esc(c.hallazgo)}</span></a></li>`;
    return '';
  }).join('');
}

// ── La mirada: hacia el cursor; sin cursor (o con teclado), hacia lo último de la conversación ──
const objetivo = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
let cuadro = null, ultimo = 0, cursor = null;
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
function hacia(px, py) {
  const r = $('#avatar').getBoundingClientRect(), alcance = Math.max(innerWidth, innerHeight) * 0.55;
  objetivo.x = limitar((px - (r.left + r.width / 2)) / alcance, -1, 1);
  objetivo.y = limitar((py - (r.top + r.height / 2)) / alcance, -1, 1);
  arrancar();
}
function apuntarCharla() {
  if (cursor && conCursor.matches) return;
  const el = final.hidden ? (opciones.firstElementChild ?? charla.lastElementChild) : final.querySelector('.agenda, .boton');
  if (!el) return;
  const r = el.getBoundingClientRect();
  hacia(r.left + r.width * 0.3, r.top + r.height / 2);
}
function arrancar() {
  if (sinMovimiento.matches) { avatar.orientar(0, 0); return; }
  if (cuadro === null) { ultimo = performance.now(); cuadro = requestAnimationFrame(paso3d); }
}
function paso3d(ahora) {
  const pasos = limitar(Math.round((ahora - ultimo) / 16.67), 1, 4);
  ultimo = ahora;
  for (let i = 0; i < pasos; i++) for (const e of ['x', 'y']) { vel[e] = (vel[e] + (objetivo[e] - pos[e]) * 0.045) * 0.84; pos[e] += vel[e]; }
  avatar.orientar(pos.x, pos.y);
  const quieto = Math.abs(objetivo.x - pos.x) + Math.abs(objetivo.y - pos.y) + Math.abs(vel.x) + Math.abs(vel.y) < 0.002;
  cuadro = quieto ? null : requestAnimationFrame(paso3d);
}
addEventListener('pointermove', (ev) => {
  if (ev.pointerType === 'touch') return;
  cursor = { x: ev.clientX, y: ev.clientY };
  hacia(ev.clientX, ev.clientY);
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { cursor = null; apuntarCharla(); });
// Con el teclado, mira la opción que tiene el foco
opciones.addEventListener('focusin', (ev) => { if (cursor && conCursor.matches) return; const r = ev.target.getBoundingClientRect(); hacia(r.left + r.width * 0.3, r.top + r.height / 2); });
addEventListener('scroll', () => apuntarCharla(), { passive: true });
sinMovimiento.addEventListener?.('change', () => { if (sinMovimiento.matches) avatar.orientar(0, 0); else apuntarCharla(); });

empezar();
