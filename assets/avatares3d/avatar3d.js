// El avatar en 3D: monta a Plotty o a Atlas en un lienzo WebGL y expone lo mismo que un avatar de Avatar Lab:
// play(clave) con los estados de cada uno (idle, typing, error, success, shy, thinking y look-*; Plotty además greeting,
// listening, happy, surprised y califica), onAnimationEnd cuando termina uno de los que corren una vez, y tiene(clave).
// orientar(x, y) lo gira hacia el cursor o el campo (de -1 a 1). ajustar({ intensidad, nivel }) cambia cuánto se mueve
// el cuerpo (1 expresivo, 0,5 sobrio) y el nivel de la voz (de 0 a 1; null: simulada) para escuchando y hablando. Mientras
// carga, y si el navegador no tiene WebGL, se ve el dibujo de la banda (plotty.svg o atlas.svg, junto a este archivo).
import { THREE, liberar } from './kit3d.js';
import * as Plotty from './plotty3d.js';
import * as Atlas from './atlas3d.js';

const PERSONAJES = {
  plotty: { crear: Plotty.plotty, colores: Plotty.COLORES, estados: Plotty.ESTADOS, duracion: Plotty.DURACION },
  atlas: { crear: Atlas.atlas, colores: Atlas.COLORES, estados: Atlas.ESTADOS, duracion: Atlas.DURACION }
};
const FOV = 20;

export function crearAvatar3D(destino, { personaje = 'plotty', ariaLabel = '', onAnimationEnd, reducido = () => false } = {}) {
  const nombre = personaje in PERSONAJES ? personaje : 'plotty', elegido = PERSONAJES[nombre];
  const { estados: ESTADOS, duracion: DURACION } = elegido;
  const host = document.createElement('div');
  host.className = 'avatar3d';
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', ariaLabel);
  const poster = new Image();
  poster.src = new URL(`${nombre}.svg`, import.meta.url).href;
  poster.alt = '';
  poster.className = 'avatar3d-poster';
  host.append(poster);
  destino.append(host);

  let estado = 'idle', desde = performance.now(), fin = null, destruido = false, intensidad = 1, nivel = null;
  const mirar = { x: 0, y: 0 };
  const control = {
    colores: elegido.colores,
    tiene: (clave) => ESTADOS.includes(clave),
    play(clave) {
      if (!ESTADOS.includes(clave)) return { ok: false, error: { code: 'unknown_animation', message: `Unknown animation '${clave}'` } };
      estado = clave; desde = performance.now();
      clearTimeout(fin);
      if (DURACION[clave]) fin = setTimeout(() => { if (!destruido && estado === clave) onAnimationEnd?.(clave); }, DURACION[clave]);
      return { ok: true };
    },
    orientar(x, y) { mirar.x = x; mirar.y = y; },
    ajustar(opciones = {}) {
      if ('intensidad' in opciones) intensidad = opciones.intensidad;
      if ('nivel' in opciones) nivel = opciones.nivel;
    },
    destroy() { destruido = true; clearTimeout(fin); host.remove(); }
  };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    host.classList.add('sin-3d');                 // sin WebGL queda el dibujo, y los estados igual avisan cuando terminan
    return control;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.append(renderer.domElement);

  const escena = new THREE.Scene();
  const p = elegido.crear();
  escena.add(p.grupo);
  const camara = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
  const distancia = p.marco.tam / 2 / Math.tan((FOV * Math.PI) / 360);
  camara.position.set(0, p.marco.centro, distancia);
  camara.lookAt(0, p.marco.centro, 0);

  const ajustar = () => {
    const r = host.getBoundingClientRect(), lado = Math.max(1, Math.round(Math.min(r.width, r.height)));
    renderer.setSize(lado, lado, false);
  };
  const medidor = new ResizeObserver(ajustar);
  medidor.observe(host);
  ajustar();
  let visible = true;
  const vigia = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  vigia.observe(host);

  let cuadro = null, previo = performance.now(), primero = true;
  const bucle = (ahora) => {
    cuadro = requestAnimationFrame(bucle);
    // El primer cuadro puede traer una hora anterior a la de creación (si crear la escena tardó): nunca hacia atrás
    const dt = Math.min(0.05, Math.max(0, (ahora - previo) / 1000));
    previo = Math.max(previo, ahora);
    if (!visible || document.hidden) return;
    p.actualizar(ahora / 1000, dt, { estado, desde: (ahora - desde) / 1000, mirar, quieto: reducido(), intensidad, nivel });
    renderer.render(escena, camara);
    if (primero) { primero = false; host.classList.add('dibujado'); }
  };
  cuadro = requestAnimationFrame(bucle);

  const destruir = control.destroy;
  control.destroy = () => {
    cancelAnimationFrame(cuadro);
    medidor.disconnect(); vigia.disconnect();
    liberar(escena);
    renderer.dispose();
    renderer.forceContextLoss?.();
    destruir();
  };
  return control;
}
