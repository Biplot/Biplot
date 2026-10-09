// El resumen del día, sin gastar en Claude: lo último del registro (log.md) y lo que espera en «Pendientes abiertos».
// Devuelve lo que Atlas dice (en partes, cada una con su reacción) y las cifras de la tarjeta.
import { encontrarPagina, normalizar } from './boveda.js';
import { hoyChile, horaChile, diasEntre } from './fecha.js';

const sinEnlaces = (s) => s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/[*_`]/g, '');
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function resumenDelDia(boveda, ahora = new Date()) {
  const hoy = hoyChile(ahora), hora = horaChile(ahora);

  // El registro: «## [AAAA-MM-DD] tipo | Título»
  const entradas = [...(boveda.archivos.get('Biplot/log.md') ?? '').matchAll(/^## \[(\d{4}-\d{2}-\d{2})\]\s+(\S+)\s*\|\s*(.+)$/gm)]
    .map(([, fecha, tipo, titulo]) => ({ fecha, tipo, titulo: sinEnlaces(titulo).trim() }));
  const ultimo = entradas.at(-1) ?? null;
  const deHoy = entradas.filter((e) => e.fecha === hoy).length;

  // Los pendientes: los puntos abiertos de cada sección (también los que van dentro de un callout)
  const { pagina } = encontrarPagina(boveda, 'Pendientes abiertos');
  let seguridad = 0, preguntas = 0, total = 0;
  if (pagina) {
    let seccion = '';
    for (const linea of boveda.archivos.get(pagina.ruta).split('\n')) {
      const titulo = linea.match(/^##\s+(.*)$/);
      if (titulo) { seccion = normalizar(titulo[1]); continue; }
      if (!seccion || seccion.startsWith('fuentes')) continue;
      const punto = linea.match(/^(?:>\s*)*[-*]\s+(\[[ xX]\]\s+)?(.*)$/);
      if (!punto || /^\[[xX]\]/.test(punto[1] ?? '') || /^~~/.test(punto[2])) continue;
      total++;
      if (seccion.includes('seguridad')) seguridad++;
      if (seccion.includes('pregunta')) preguntas++;
    }
  }

  const saludo = hora >= 5 && hora < 12 ? 'Buen día, Chris.' : hora >= 12 && hora < 20 ? 'Buenas tardes, Chris.' : 'Buenas noches, Chris.';
  const partes = [{ texto: saludo, tono: 'normal' }];
  if (ultimo) {
    const d = diasEntre(ultimo.fecha, hoy);
    const cuando = d === 0 ? 'hoy' : d === 1 ? 'ayer' : `el ${Number(ultimo.fecha.slice(8))} de ${MESES[Number(ultimo.fecha.slice(5, 7)) - 1]}`;
    partes.push({ texto: `Lo último en tu bóveda: ${ultimo.titulo}, ${cuando}.`, tono: 'normal' });
  }
  if (seguridad) partes.push({ texto: `Ojo: tienes ${seguridad} ${seguridad === 1 ? 'pendiente' : 'pendientes'} de prioridad alta.`, tono: 'alerta' });
  if (preguntas) partes.push({ texto: `Y ${preguntas} ${preguntas === 1 ? 'pregunta guardada' : 'preguntas guardadas'} para cuando puedas.`, tono: preguntas >= 5 ? 'preocupado' : 'normal' });
  if (!seguridad && !preguntas && pagina) partes.push({ texto: 'No hay pendientes urgentes. Buen momento para avanzar.', tono: 'alegre' });

  const cifras = [
    { n: deHoy, texto: deHoy === 1 ? 'cambio hoy' : 'cambios hoy', detalle: ultimo ? `Último: ${ultimo.titulo}` : '' },
    { n: seguridad, texto: 'pendientes de seguridad', detalle: 'prioridad alta', tono: seguridad ? 'alerta' : '' },
    { n: preguntas, texto: preguntas === 1 ? 'pregunta para ti' : 'preguntas para ti', detalle: 'guardadas en la bóveda' },
    { n: total, texto: 'pendientes en total', detalle: 'en «Pendientes abiertos»' }
  ];
  return { fecha: hoy, partes, cifras, ultimo, paginas: boveda.paginas.length };
}
