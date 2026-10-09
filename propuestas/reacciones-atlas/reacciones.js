// Reacciones de Atlas (propuesta): el catálogo, Atlas en 3D en el escenario, una conversación completa que las encadena
// y, si se activa, los sonidos (hechos con Web Audio) y su voz (la del navegador, que mueve el plasma con cada palabra).
import { crearAvatar3D } from '../../assets/avatares3d/avatar3d.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

// ── El catálogo ──
const GRUPOS = [
  { titulo: 'Al abrir, al irte y al quedarse solo', items: [
    { clave: 'despertar', nombre: 'Despertar', nueva: true, cuando: 'Al abrir la página.', que: 'Se enciende: el plasma prende desde el centro, los anillos arrancan rápido y frenan, abre los ojos, parpadea y las lentes se calibran.' },
    { clave: 'buenasnoches', nombre: 'Buenas noches', nueva: true, cuando: 'Cuando le dices que te vas.', que: 'Te sonríe, hace una reverencia, cierra los ojos despacio y el plasma se apaga hasta quedar dormido.' },
    { clave: 'dormir', nombre: 'Dormir', nueva: true, cuando: 'Después de un rato sin hablarle.', que: 'Entrecierra los ojos y los cierra, el plasma respira lento y tenue, los anillos casi se detienen y baja un poco.' },
    { clave: 'shy', nombre: 'No mira tu contraseña', cuando: 'Mientras escribes la contraseña para entrar.', que: 'Cierra los ojos y se da vuelta (y de vez en cuando espía).' }
  ] },
  { titulo: 'Cuando le hablas', items: [
    { clave: 'atento', nombre: 'Atento', nueva: true, cuando: 'Cuando dices «Atlas» o tocas el micrófono.', que: 'Abre los ojos de golpe, da un saltito y el anillo pega un tirón.' },
    { clave: 'escuchando', nombre: 'Escuchando', nueva: true, cuando: 'Mientras le hablas.', que: 'Se inclina hacia ti con las pupilas grandes, el anillo se ladea como una oreja y el plasma late con tu voz.' },
    { clave: 'asentir', nombre: 'Asentir', nueva: true, cuando: 'Cuando terminas de hablar y te entendió.', que: 'Dos cabeceos y un parpadeo.' },
    { clave: 'hablando', nombre: 'Hablando', nueva: true, cuando: 'Mientras te responde en voz alta.', que: 'El plasma y los filamentos laten con cada sílaba (es su boca), mira amable y la placa 360° se mece.' }
  ] },
  { titulo: 'Trabajando en tu bóveda', items: [
    { clave: 'thinking', nombre: 'Pensando', cuando: 'Con preguntas que piden pensar: comparar, decidir, resumir.', que: 'Mira arriba; el anillo y el plasma se aceleran.' },
    { clave: 'buscando', nombre: 'Buscando', nueva: true, cuando: 'Mientras busca en el índice de la bóveda.', que: 'Un escáner de luz recorre el orbe, el globo gira rápido y los ojos van de lado a lado.' },
    { clave: 'leyendo', nombre: 'Leyendo', nueva: true, cuando: 'Mientras lee una página.', que: 'Los ojos recorren renglones, de izquierda a derecha y bajando.' },
    { clave: 'encontrado', nombre: '¡Lo encontré!', nueva: true, cuando: 'Cuando da con la respuesta.', que: 'Ojos muy abiertos, los satélites destellan, el plasma estalla y da un saltito.' },
    { clave: 'duda', nombre: 'Duda', nueva: true, cuando: 'Cuando no lo encuentra en tu bóveda o no te entendió.', que: 'Una «ceja» arriba y el otro ojo entrecerrado, ladea el orbe y el plasma baja.' },
    { clave: 'typing', nombre: 'Anotando', cuando: 'Mientras prepara lo que te va a anotar.', que: 'Mira hacia abajo, concentrado.' },
    { clave: 'esperando', nombre: 'Esperando tu OK', nueva: true, cuando: 'Cuando te muestra un cambio antes de guardarlo.', que: 'Te mira con las cejas arriba, el anillo se detiene y los satélites laten despacio: «¿sí?».' },
    { clave: 'success', nombre: 'Guardado', cuando: 'Cuando guardó en la bóveda.', que: 'Ojos abiertos en verde, plasma fuerte y el anillo girando.' },
    { clave: 'error', nombre: 'Algo falló', cuando: 'Sin conexión, o si GitHub no responde.', que: 'Ceño y plasma en rojo, y una sacudida.' }
  ] },
  { titulo: 'El tono', items: [
    { clave: 'alerta', nombre: 'Alerta', nueva: true, cuando: 'Para lo importante, como los pendientes de prioridad alta del resumen.', que: 'El plasma y los ojos en ámbar, la mirada seria y el anillo se endereza.' },
    { clave: 'preocupado', nombre: 'Preocupado', nueva: true, cuando: 'Cuando el resumen trae muchos pendientes.', que: 'Cejas de pena, mira hacia abajo, el plasma late lento y bajo, y los anillos casi se detienen.' },
    { clave: 'alegre', nombre: 'Alegre', nueva: true, cuando: 'Con buenas noticias, o cuando le das las gracias.', que: 'Ojos que sonríen, tres botecitos y el plasma chispea.' },
    { clave: 'risa', nombre: 'Risa', nueva: true, cuando: 'Cuando le cuentas algo gracioso.', que: 'Aprieta los ojos sonriendo, tirita de risa, el plasma tiembla y la placa se bambolea.' },
    { clave: 'celebrar', nombre: 'Celebrar', nueva: true, cuando: 'Con un hito: algo publicado, un pendiente grande cerrado.', que: 'Salta, da una vuelta entera, el anillo gira rápido y todo se pone verde.' }
  ] }
];
// Numeradas en el orden de la página
let n = 0;
for (const g of GRUPOS) for (const r of g.items) r.n = ++n;
const TODAS = GRUPOS.flatMap((g) => g.items);
const porClave = Object.fromEntries(TODAS.map((r) => [r.clave, r]));
const DURA = {
  error: 1900, success: 2600, despertar: 2800, atento: 700, asentir: 1000, duda: 2200, encontrado: 1100, alegre: 1500, celebrar: 2600,
  risa: 1800, buenasnoches: 3200
};
const TONO = { alerta: 'ambar', success: 'verde', celebrar: 'verde', error: 'rojo', dormir: 'apagado', buenasnoches: 'apagado', preocupado: 'pena' };

$('#grupos').innerHTML = GRUPOS.map((g) => `
  <section class="grupo" aria-label="${g.titulo}">
    <h3>${g.titulo}</h3>
    <ul class="tarjetas">${g.items.map((r) => `
      <li><button class="tarjeta" type="button" data-clave="${r.clave}" aria-pressed="false">
        <span class="n" aria-hidden="true">${r.n}</span>
        <span class="nombre"><span><span class="oculto-n">${r.n}. </span>${r.nombre}</span><small class="${r.nueva ? 'nueva' : ''}">${r.nueva ? 'Nueva' : 'Ya la tiene'}</small><small>${DURA[r.clave] ? 'Una vez' : 'Mientras dure'}</small></span>
        <span class="cuando">${r.cuando}</span>
        <span class="que">${r.que}</span>
      </button></li>`).join('')}
    </ul>
  </section>`).join('');

// ── Atlas ──
let alTerminar = null;
const atlas = crearAvatar3D($('#atlas'), {
  personaje: 'atlas',
  ariaLabel: 'Atlas',
  reducido: () => sinMovimiento.matches,
  onAnimationEnd: (clave) => alTerminar?.(clave)
});
const escenario = $('#escenario');

// Mira el cursor (con el dedo no hay cursor: mira al frente)
addEventListener('pointermove', (ev) => {
  if (ev.pointerType === 'touch' || sinMovimiento.matches) return;
  const r = $('#atlas').getBoundingClientRect(), alcance = Math.max(innerWidth, innerHeight) * 0.55;
  const x = (ev.clientX - (r.left + r.width / 2)) / alcance, y = (ev.clientY - (r.top + r.height / 2)) / alcance;
  atlas.orientar(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
}, { passive: true });

// Muestra una reacción en el escenario
let actual = null, vuelta = null;
function mostrar(clave, { texto, quien } = {}) {
  const r = porClave[clave];
  actual = clave;
  atlas.play(clave);
  escenario.dataset.tono = TONO[clave] ?? '';
  $('#ahora-n').textContent = r ? r.n : '—';
  $('#ahora-nombre').innerHTML = r ? `<span class="oculto-n">${r.n}. </span>${r.nombre}` : 'Atlas';
  $('#etiquetas').innerHTML = r ? `<span class="etiqueta ${r.nueva ? 'nueva' : ''}">${r.nueva ? 'Nueva' : 'Ya la tiene'}</span><span class="etiqueta">${DURA[clave] ? 'Una vez' : 'Mientras dure'}</span>` : '';
  decir(quien, texto ?? (r ? r.cuando : ''));
  $$('.tarjeta').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.clave === clave)));
  sonar(clave);
}
function decir(quien, texto) {
  const q = $('#quien'), t = $('#texto');
  q.textContent = quien === 'atlas' ? 'Atlas' : quien === 'tu' ? 'Tú' : '';
  q.className = `quien ${quien === 'atlas' ? 'es-atlas' : ''}`;
  t.textContent = texto;
  t.classList.toggle('cuando', !quien);
}

// Las que corren una vez vuelven solas a la normalidad
alTerminar = (clave) => {
  if (enConversacion || clave !== actual || clave === 'buenasnoches') return;
  clearTimeout(vuelta);
  vuelta = setTimeout(() => { if (actual === clave && !enConversacion) atlas.play('idle'); }, 1400);
};

$('#grupos').addEventListener('click', (ev) => {
  const b = ev.target.closest('.tarjeta');
  if (!b) return;
  detenerConversacion();
  clearTimeout(vuelta);
  mostrar(b.dataset.clave);
});
$('#repetir').addEventListener('click', () => {
  if (enConversacion) { iniciarConversacion(); return; }
  clearTimeout(vuelta);
  if (actual) mostrar(actual); else mostrar('despertar');
});

// ── Estilo y sonido ──
$$('[data-estilo]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-estilo]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
  atlas.ajustar({ intensidad: Number(b.dataset.estilo) });
  if (actual && DURA[actual] && !enConversacion) mostrar(actual);
}));
// Con sonido desde el comienzo: el navegador lo deja sonar desde el primer toque en la página
let conSonido = true, audio = null;
function encenderAudio() {
  if (!conSonido) return;
  try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume?.(); } catch { audio = null; }
}
addEventListener('pointerdown', encenderAudio, { capture: true });
addEventListener('keydown', encenderAudio, { capture: true });
$$('[data-sonido]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-sonido]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
  conSonido = b.dataset.sonido === 'si';
  if (conSonido) { encenderAudio(); notas([[880, 0, 0.08]]); } else callar();
}));

// Los sonidos: notas cortas y suaves (frecuencia, inicio y duración en segundos)
const SONIDOS = {
  despertar: [[261.63, 0, 0.5, 'triangle', 0.05], [523.25, 0.5, 0.18], [659.25, 0.64, 0.18], [783.99, 0.78, 0.4]],
  atento: [[880, 0, 0.08]],
  asentir: [[660, 0, 0.06], [660, 0.14, 0.06]],
  encontrado: [[1318.5, 0, 0.3, 'triangle']],
  duda: [[659.25, 0, 0.12], [523.25, 0.16, 0.22]],
  esperando: [[783.99, 0, 0.12], [1046.5, 0.16, 0.22]],
  success: [[523.25, 0, 0.5], [659.25, 0.04, 0.5], [783.99, 0.08, 0.5]],
  error: [[196, 0, 0.16, 'square', 0.025], [174.6, 0.2, 0.22, 'square', 0.025]],
  alerta: [[440, 0, 0.18, 'triangle'], [349.23, 0.24, 0.26, 'triangle']],
  alegre: [[659.25, 0, 0.08], [783.99, 0.08, 0.08], [1046.5, 0.16, 0.18]],
  celebrar: [[523.25, 0, 0.1], [659.25, 0.1, 0.1], [783.99, 0.2, 0.1], [1046.5, 0.3, 0.3], [1318.5, 0.44, 0.4]],
  dormir: [[392, 0, 0.35], [261.63, 0.32, 0.6]],
  buenasnoches: [[783.99, 0, 0.4], [659.25, 0.36, 0.4], [523.25, 0.72, 0.9]],
  preocupado: [[392, 0, 0.3], [311.13, 0.26, 0.5]],
  risa: [[783.99, 0, 0.07, 'triangle'], [880, 0.12, 0.07, 'triangle'], [783.99, 0.24, 0.07, 'triangle'], [987.77, 0.36, 0.12, 'triangle']]
};
function notas(lista) {
  if (!audio || audio.state !== 'running') return;
  const t0 = audio.currentTime + 0.02;
  for (const [frec, ini, dur, tipo = 'sine', vol = 0.07] of lista) {
    const osc = audio.createOscillator(), gan = audio.createGain();
    osc.type = tipo; osc.frequency.value = frec;
    gan.gain.setValueAtTime(0, t0 + ini);
    gan.gain.linearRampToValueAtTime(vol, t0 + ini + 0.015);
    gan.gain.exponentialRampToValueAtTime(0.0001, t0 + ini + dur);
    osc.connect(gan).connect(audio.destination);
    osc.start(t0 + ini); osc.stop(t0 + ini + dur + 0.05);
  }
}
const sonar = (clave) => { if (conSonido && SONIDOS[clave]) notas(SONIDOS[clave]); };

// La voz de Atlas (sólo en la conversación y con sonido): el plasma late con cada palabra
const voces = () => speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('es'));
const vozElegida = () => { const v = voces(); return v.find((x) => /cl/i.test(x.lang)) ?? v.find((x) => /(mx|us|419)/i.test(x.lang)) ?? v[0] ?? null; };
let pico = 0, hablandoVoz = false, palabras = false;
(function latir() {
  if (hablandoVoz && palabras) { pico *= 0.88; atlas.ajustar({ nivel: 0.12 + pico * 0.88 }); }
  requestAnimationFrame(latir);
})();
// Lo que se tarda en leer una frase (también si la voz falla o termina antes)
const lectura = (texto) => Math.max(1600, texto.split(' ').length * 330 + 700);
function hablar(texto) {
  return new Promise((listo) => {
    const espera = lectura(texto);
    if (!conSonido || !('speechSynthesis' in window)) { listo(); return; }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-CL'; u.rate = 1.02; u.pitch = 0.95;
    const v = vozElegida(); if (v) u.voice = v;
    let hecho = false;
    const fin = () => { if (hecho) return; hecho = true; hablandoVoz = false; palabras = false; atlas.ajustar({ nivel: null }); listo(); };
    u.onstart = () => { hablandoVoz = true; };
    u.onboundary = () => { palabras = true; pico = 1; };
    u.onend = fin; u.onerror = fin;
    setTimeout(fin, espera + 6000);
    speechSynthesis.speak(u);
  });
}
function callar() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

// ── La conversación completa ──
const CONVERSACION = [
  { e: 'despertar', ms: 2900, nota: 'Abres la página.' },
  { e: 'hablando', quien: 'atlas', texto: 'Buen día, Chris. Hay una novedad en tu bóveda y te esperan algunas preguntas.' },
  { e: 'alerta', quien: 'atlas', texto: 'Ojo: hay pendientes de prioridad alta.', ms: 2400 },
  { e: 'preocupado', quien: 'atlas', texto: 'Y se te están juntando las preguntas por responder.', ms: 2600 },
  { e: 'idle', ms: 1200, nota: 'Te mira, tranquilo.' },
  { e: 'atento', ms: 800, quien: 'tu', texto: 'Atlas…' },
  { e: 'escuchando', ms: 2800, quien: 'tu', texto: '¿Qué quedó pendiente en Rumbo?' },
  { e: 'asentir', ms: 1000, nota: 'Te entendió.' },
  { e: 'buscando', ms: 2600, nota: 'Buscando en tu bóveda…' },
  { e: 'leyendo', ms: 2600, nota: 'Leyendo la página de Rumbo…' },
  { e: 'encontrado', ms: 1100, nota: '¡Aquí está!' },
  { e: 'hablando', quien: 'atlas', texto: 'Quedaron tres cosas. Te dejo las páginas al lado.' },
  { e: 'atento', ms: 700, quien: 'tu', texto: 'Atlas…' },
  { e: 'escuchando', ms: 2600, quien: 'tu', texto: 'Anota que el lunes reviso Rumbo.' },
  { e: 'typing', ms: 1700, nota: 'Preparando el cambio…' },
  { e: 'esperando', quien: 'atlas', texto: '¿Lo guardo así?', ms: 2400 },
  { e: 'escuchando', ms: 1300, quien: 'tu', texto: 'Sí.' },
  { e: 'success', ms: 2600, quien: 'atlas', texto: 'Listo, anotado.' },
  { e: 'alegre', ms: 1600, quien: 'tu', texto: 'Gracias, Atlas.' },
  { e: 'escuchando', ms: 2200, quien: 'tu', texto: '¿Tú nunca duermes?' },
  { e: 'risa', quien: 'atlas', texto: 'Sólo cuando tú duermes.', ms: 2000 },
  { e: 'escuchando', ms: 1800, quien: 'tu', texto: 'Buenas noches, Atlas.' },
  { e: 'buenasnoches', quien: 'atlas', texto: 'Buenas noches, Chris.', ms: 3600 }
];
let enConversacion = false, turno = 0;
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
async function iniciarConversacion() {
  detenerConversacion();
  const mia = ++turno;
  enConversacion = true;
  const boton = $('#conversacion');
  boton.setAttribute('aria-pressed', 'true');
  $('span', boton).textContent = 'Detener';
  for (const paso of CONVERSACION) {
    if (mia !== turno) return;
    mostrar(paso.e, paso.quien ? { quien: paso.quien, texto: paso.texto } : { texto: paso.nota ?? '' });
    if (paso.quien === 'atlas') await Promise.all([hablar(paso.texto), pausa(paso.ms ?? lectura(paso.texto))]);
    else await pausa(paso.ms ?? 2000);
  }
  if (mia === turno) terminarConversacion();
}
function terminarConversacion() {
  enConversacion = false;
  const boton = $('#conversacion');
  boton.setAttribute('aria-pressed', 'false');
  $('span', boton).textContent = 'Conversación completa';
}
function detenerConversacion() {
  if (!enConversacion) return;
  turno++;
  callar();
  terminarConversacion();
}
$('#conversacion').addEventListener('click', () => {
  if (enConversacion) { detenerConversacion(); atlas.play('idle'); decir('', 'Toca una reacción para verla.'); }
  else iniciarConversacion();
});

// Al abrir, Atlas despierta
mostrar('despertar');
