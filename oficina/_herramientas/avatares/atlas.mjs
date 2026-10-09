// Atlas, la mascota de The Architect: un orbe de vidrio azul con su anillo en órbita y los dos satélites en las puntas.
// Ojos de lente cian, anchos y de párpado pesado: habla poco y mira mucho, casi siempre de reojo.
// Ojo: la cabeza no se inclina mucho hacia arriba (x > 10), porque el anillo se abre y tapa el orbe.
import { ojo, expr, nodo, paso, parpadeo, animacion, definicion } from './comun.mjs';
export function atlas({ colores = { body: '#1d5c92', eyes: '#7fd8cf' } } = {}) {
  const R = 80, giro = -9, rx = 124, g = (giro * Math.PI) / 180, y0 = 8;
  const body = { primary: { type: 'sphere', width: 2 * R, height: 2 * R, depth: 2 * R, roundness: 1 }, nodes: [] };
  body.nodes.push(nodo('cylinder', [2 * rx, 6, 2 * rx], [0, y0, 0], [15, 0, giro], { roundness: 1, morphRoundness: 0 }));        // el anillo
  for (const s of [-1, 1]) body.nodes.push(nodo('sphere', [24, 24, 24], [s * rx * Math.cos(g), y0 + s * rx * Math.sin(g), 0]));  // los satélites
  const S = 62, Y = -6;
  const E = {
    neutral: expr({ left: ojo(34, 22, 0, Y), spacing: S, body: 'none' }),
    'de-reojo': expr({ head: [-6, -10, 0], left: ojo(34, 18, -12, Y + 5), spacing: S, eyes: 'microSaccades' }),
    'mira-abajo': expr({ head: [-16, 0, 0], left: ojo(34, 18, 0, Y + 8), spacing: S }),
    'mira-arriba': expr({ head: [3, 0, 0], left: ojo(32, 24, 0, Y - 10), spacing: S }),
    'escanea-izquierda': expr({ head: [-4, -28, 0], left: ojo(36, 16, -10, Y), spacing: S, eyes: 'microSaccades' }),
    'escanea-derecha': expr({ head: [-4, 28, 0], left: ojo(36, 16, 10, Y), spacing: S, eyes: 'microSaccades' }),
    proyectando: expr({ head: [0, 0, 0], left: ojo(38, 30, 0, Y - 2), spacing: S + 2, colors: { eyes: '#e9fffc' } }),
    sospecha: expr({ head: [-4, 8, 7], left: ojo(34, 22, 2, Y), right: ojo(34, 11, 2, Y - 3), spacing: S }),
    sorpresa: expr({ head: [0, 0, 0], left: ojo(32, 34, 0, Y - 4), spacing: S + 2 }),
    satisfecho: expr({ head: [-4, 0, -6], left: ojo(36, 11, 0, Y + 2), spacing: S }),
    dormido: expr({ head: [-14, 0, 5], left: ojo(34, 10, 0, Y + 8), spacing: S })
  };
  const G = 'Atlas';
  const A = {
    observando: animacion('Observando', 'Desde aquí arriba se ve todo: flota y mira de reojo.', G, 'loop',
      [paso('neutral', 3200, 700, 'smooth'), paso('de-reojo', 2600, 700, 'smooth'), paso('neutral', 2400, 700, 'smooth'), paso('mira-abajo', 2200, 800, 'smooth')],
      parpadeo(6500, 9500, 420, 4800)),
    escaneando: animacion('Escaneando', 'Recorre el plano de un lado al otro.', G, 'pingPong',
      [paso('escanea-izquierda', 1400, 900, 'smooth'), paso('neutral', 500, 700, 'smooth'), paso('escanea-derecha', 1400, 900, 'smooth')],
      parpadeo(4800, 7200, 300, 3200)),
    proyectando: animacion('Proyectando', 'Enciende el corazón de plasma y proyecta el mapa.', G, 'loop',
      [paso('mira-arriba', 900, 600, 'smooth'), paso('proyectando', 2600, 500, 'spring'), paso('neutral', 1400, 700, 'smooth')],
      parpadeo(4800, 7200, 300, 3200)),
    'no-convencido': animacion('No convencido', 'Si no se puede dibujar, no se puede construir.', G, 'loop',
      [paso('neutral', 1400, 500, 'smooth'), paso('sospecha', 2200, 450, 'spring'), paso('de-reojo', 1600, 600, 'smooth')],
      parpadeo(4800, 7200, 300, 2600)),
    satisfecho: animacion('Satisfecho', 'Cuando el plano cuadra.', G, 'loop',
      [paso('satisfecho', 2400, 500, 'spring'), paso('neutral', 1600, 600, 'smooth')],
      parpadeo(6500, 9500, 420, 3200)),
    durmiendo: animacion('Durmiendo', 'El orbe en reposo, sin perder la órbita.', G, 'loop',
      [paso('dormido', 4000, 1200, 'smooth')],
      parpadeo(6500, 9500, 420, 4800, false))
  };
  return definicion('Atlas', body, colores, E, A);
}
