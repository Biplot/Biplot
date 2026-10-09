// Atlas en modo demo: la página de verdad con un servidor de mentira dentro del navegador. Atiende las mismas rutas
// (/api/…) con el Atlas de prueba (sin Claude) sobre una bóveda de ejemplo; lo que se guarda vive sólo en esta pestaña.
// Usa las mismas piezas que el servidor (paginas, resumen, simulado y herramientas), así que se comporta igual.
import { armar, leerPagina, prepararCambio, agregarAlLog, LOG } from '../lib/paginas.js';
import { resumenDelDia } from '../lib/resumen.js';
import { conversarSimulado } from '../lib/simulado.js';
import { ARCHIVOS } from './boveda-demo.js';

globalThis.ATLAS_DEMO = true;
const archivos = new Map(Object.entries(ARCHIVOS));
let boveda = armar(archivos, 'demo');
const enlace = (ruta) => `obsidian://open?vault=Biplot&file=${encodeURIComponent(ruta.replace(/^Biplot\//, '').replace(/\.md$/, ''))}`;
// La propuesta va y vuelve en base64 (aquí no hay nada que firmar: todo pasa en esta pestaña)
const aToken = (o) => btoa(Array.from(new TextEncoder().encode(JSON.stringify(o)), (b) => String.fromCharCode(b)).join(''));
const deToken = (t) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(t), (c) => c.charCodeAt(0))));
const json = (datos, estado = 200) => new Response(JSON.stringify(datos), { status: estado, headers: { 'content-type': 'application/json' } });
let dentro = false;
try { dentro = sessionStorage.getItem('atlas-demo') === '1'; } catch { /* sin almacenamiento */ }
const recordar = () => { try { sessionStorage.setItem('atlas-demo', dentro ? '1' : '0'); } catch { /* nada */ } };

const RUTAS = {
  'GET /api/sesion': () => json({ ok: dentro, simulado: true }),
  'POST /api/entrar': (c) => {
    if (!String(c.clave ?? '').trim()) return json({ error: 'Escribe cualquier contraseña.' }, 401);
    dentro = true; recordar();
    return json({ ok: true, simulado: true });
  },
  'POST /api/salir': () => { dentro = false; recordar(); return json({ ok: true }); },
  'GET /api/resumen': () => json(resumenDelDia(boveda)),
  'GET /api/pagina': (_, url) => {
    const r = leerPagina(boveda, url.searchParams.get('nombre') ?? '', 200_000);
    return r.error ? json(r, 404) : json({ ...r, obsidian: enlace(r.ruta) });
  },
  'POST /api/guardar': (c) => {
    let propuesta;
    try { propuesta = deToken(c.token); } catch { return json({ error: 'Esa propuesta no vale.' }, 400); }
    try {
      const listo = prepararCambio(boveda, propuesta);
      archivos.set(listo.pagina.ruta, listo.texto);
      archivos.set(LOG, agregarAlLog(archivos.get(LOG) ?? '# Log\n', listo.log));
      boveda = armar(archivos, 'demo');
      return json({ ok: true, pagina: listo.pagina.nombre, ruta: listo.pagina.ruta, commit: null, url: null });
    } catch (e) {
      return json({ error: e.publico ? e.message : 'No se pudo guardar.' }, e.estado ?? 500);
    }
  },
  'POST /api/charla': (c) => {
    const codificador = new TextEncoder();
    return new Response(new ReadableStream({
      async start(control) {
        const emitir = (evento, datos = {}) => control.enqueue(codificador.encode(`event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`));
        try { await conversarSimulado({ boveda, mensaje: String(c.mensaje ?? ''), emitir, firmar: aToken, enlace }); }
        catch (e) { emitir('error', { mensaje: e.publico ? e.message : 'Algo falló.' }); }
        control.close();
      }
    }), { headers: { 'content-type': 'text/event-stream' } });
  }
};

const original = window.fetch.bind(window);
window.fetch = async (recurso, opciones = {}) => {
  const url = new URL(typeof recurso === 'string' ? recurso : recurso.url, location.href);
  if (!url.pathname.startsWith('/api/')) return original(recurso, opciones);
  const ruta = RUTAS[`${(opciones.method ?? 'GET').toUpperCase()} ${url.pathname}`];
  if (!ruta) return json({ error: 'No existe.' }, 404);
  if (!dentro && !/\/(sesion|entrar)$/.test(url.pathname)) return json({ error: 'Tienes que entrar primero.' }, 401);
  let cuerpo = {};
  try { cuerpo = opciones.body ? JSON.parse(opciones.body) : {}; } catch { /* sin cuerpo */ }
  await new Promise((r) => setTimeout(r, 120));                      // como si fuera por la red
  return ruta(cuerpo, url);
};

// En la entrada, el aviso de que es un demo
const nota = document.createElement('p');
nota.textContent = 'Demo: un Atlas de prueba, sin Claude, con una bóveda de ejemplo. Entra con cualquier contraseña.';
nota.setAttribute('style', 'margin:4px 0 0;font-size:13px;color:#F5B83D');
document.querySelector('#entrar .aviso')?.before(nota);
