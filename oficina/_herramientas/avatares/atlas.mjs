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
  const ROJO = { eyes: '#ff4d6d' }, VERDE = { eyes: '#4ade80' };   // las lentes de error y de éxito (nunca coral)
  const E = {
    neutral: expr({ left: ojo(34, 22, 0, Y), spacing: S, body: 'none' }),
    'de-reojo': expr({ head: [-6, -10, 0], left: ojo(34, 18, -12, Y + 5), spacing: S, eyes: 'microSaccades' }),
    'mira-izquierda': expr({ head: [-2, -12, 0], left: ojo(34, 20, -13, Y), spacing: S }),
    'mira-derecha': expr({ head: [-2, 12, 0], left: ojo(34, 20, 13, Y), spacing: S }),
    'mira-abajo': expr({ head: [-16, 0, 0], left: ojo(34, 18, 0, Y + 8), spacing: S }),
    'mira-arriba': expr({ head: [3, 0, 0], left: ojo(32, 24, 0, Y - 10), spacing: S }),
    'escanea-izquierda': expr({ head: [-4, -28, 0], left: ojo(36, 16, -10, Y), spacing: S, eyes: 'microSaccades' }),
    'escanea-derecha': expr({ head: [-4, 28, 0], left: ojo(36, 16, 10, Y), spacing: S, eyes: 'microSaccades' }),
    proyectando: expr({ head: [0, 0, 0], left: ojo(38, 30, 0, Y - 2), spacing: S + 2, colors: { eyes: '#e9fffc' } }),
    sospecha: expr({ head: [-4, 8, 7], left: ojo(34, 22, 2, Y), right: ojo(34, 11, 2, Y - 3), spacing: S }),
    sorpresa: expr({ head: [0, 0, 0], left: ojo(32, 34, 0, Y - 4), spacing: S + 2 }),
    satisfecho: expr({ head: [-4, 0, -6], left: ojo(36, 11, 0, Y + 2), spacing: S }),
    triste: expr({ head: [-14, 0, -4], left: ojo(32, 16, 0, Y + 8, -12), right: ojo(32, 16, 0, Y + 8, 12), spacing: S }),
    dormido: expr({ head: [-14, 0, 5], left: ojo(34, 10, 0, Y + 8), spacing: S }),
    // Mientras escribes: mira hacia abajo y hacia el formulario, y lee
    escribiendo: expr({ head: [-10, 10, 0], left: ojo(34, 16, 8, Y + 8), spacing: S, eyes: 'microSaccades' }),
    leyendo: expr({ head: [-10, 14, 0], left: ojo(34, 16, 11, Y + 9), spacing: S, eyes: 'microSaccades' }),
    // Algo no valida: ceño en rojo con una sacudida, y después no convencido
    ceno: expr({ head: [-4, 0, 0], left: ojo(36, 14, 0, Y + 2, 16), right: ojo(36, 14, 0, Y + 2, -16), spacing: S, body: 'shake', colors: ROJO }),
    'sospecha-roja': expr({ head: [-4, 8, 7], left: ojo(34, 20, 2, Y), right: ojo(34, 11, 2, Y - 3), spacing: S, colors: ROJO }),
    // Todo bien: el plano cuadra
    'exito-grande': expr({ head: [0, 0, 0], left: ojo(34, 34, 0, Y - 4), spacing: S + 2, colors: VERDE }),
    'exito-satisfecho': expr({ head: [-4, 0, -6], left: ojo(36, 11, 0, Y + 2), spacing: S, colors: VERDE }),
    // La contraseña: se da vuelta y cierra los ojos; cada tanto mira de reojo
    timido: expr({ head: [-16, -30, 4], left: ojo(34, 10, -8, Y + 8), spacing: S }),
    espiando: expr({ head: [-12, -22, 2], left: ojo(34, 10, -8, Y + 8), right: ojo(30, 16, -10, Y + 6), spacing: S, eyes: 'microSaccades' })
  };
  const G = 'Atlas', una = (e) => [paso(e, 2000, 380, 'smooth')];
  // Las claves de las animaciones son las que usa la página (idle, typing, error, success, shy, look-*): no cambiarlas
  const A = {
    idle: animacion('Observando', 'Desde aquí arriba se ve todo: flota y mira de reojo.', G, 'loop',
      [paso('neutral', 3200, 700, 'smooth'), paso('de-reojo', 2600, 700, 'smooth'), paso('neutral', 2400, 700, 'smooth'), paso('mira-abajo', 2200, 800, 'smooth')],
      parpadeo(6500, 9500, 420, 4800)),
    typing: animacion('Escribiendo', 'Revisa lo que escribes como si fuera un plano.', G, 'pingPong',
      [paso('escribiendo', 1000, 420, 'smooth'), paso('leyendo', 1000, 420, 'smooth')],
      parpadeo(4800, 7200, 300, 3200)),
    error: animacion('Error', 'Si no cuadra, no avanza: ceño en rojo y una sacudida.', G, 'once',
      [paso('ceno', 900, 180, 'snappy'), paso('sospecha-roja', 1100, 360, 'smooth')],
      parpadeo(4800, 7200, 300, 1600)),
    success: animacion('Éxito', 'El plano cuadra: ojos grandes y en verde.', G, 'once',
      [paso('exito-grande', 700, 220, 'snappy'), paso('exito-satisfecho', 1600, 380, 'spring')],
      parpadeo(4800, 7200, 300, 2400)),
    shy: animacion('Tímido', 'En la contraseña se da vuelta para no mirar (y mira de reojo).', G, 'loop',
      [paso('timido', 2800, 420, 'smooth'), paso('espiando', 600, 300, 'smooth'), paso('timido', 2000, 360, 'smooth')],
      parpadeo(6500, 9500, 420, 4800, false)),
    'look-left': animacion('Mira a la izquierda', 'Para seguir el cursor.', G, 'loop', una('mira-izquierda'), parpadeo(6500, 9500, 420, 4800)),
    'look-right': animacion('Mira a la derecha', 'Para seguir el cursor.', G, 'loop', una('mira-derecha'), parpadeo(6500, 9500, 420, 4800)),
    'look-up': animacion('Mira arriba', 'Para seguir el cursor.', G, 'loop', una('mira-arriba'), parpadeo(6500, 9500, 420, 4800)),
    'look-down': animacion('Mira abajo', 'Para seguir el cursor.', G, 'loop', una('mira-abajo'), parpadeo(6500, 9500, 420, 4800)),
    listening: animacion('Escuchando', 'Habla poco y mira mucho.', G, 'loop',
      [paso('neutral', 2600, 600, 'smooth'), paso('de-reojo', 1800, 600, 'smooth')],
      parpadeo(4800, 7200, 300, 3200)),
    thinking: animacion('Pensando', 'Mira hacia arriba, donde está el mapa.', G, 'loop',
      [paso('mira-arriba', 1800, 600, 'smooth'), paso('de-reojo', 1400, 600, 'smooth'), paso('sospecha', 1200, 450, 'spring')],
      parpadeo(4800, 7200, 300, 2600)),
    searching: animacion('Escaneando', 'Recorre el plano de un lado al otro.', G, 'pingPong',
      [paso('escanea-izquierda', 1400, 900, 'smooth'), paso('neutral', 500, 700, 'smooth'), paso('escanea-derecha', 1400, 900, 'smooth')],
      parpadeo(4800, 7200, 300, 3200)),
    projecting: animacion('Proyectando', 'Enciende el corazón de plasma y proyecta el mapa.', G, 'loop',
      [paso('mira-arriba', 900, 600, 'smooth'), paso('proyectando', 2600, 500, 'spring'), paso('neutral', 1400, 700, 'smooth')],
      parpadeo(4800, 7200, 300, 3200)),
    suspicious: animacion('No convencido', 'Si no se puede dibujar, no se puede construir.', G, 'loop',
      [paso('neutral', 1400, 500, 'smooth'), paso('sospecha', 2200, 450, 'spring'), paso('de-reojo', 1600, 600, 'smooth')],
      parpadeo(4800, 7200, 300, 2600)),
    happy: animacion('Satisfecho', 'Cuando el plano cuadra.', G, 'loop',
      [paso('satisfecho', 2400, 500, 'spring'), paso('neutral', 1600, 600, 'smooth')],
      parpadeo(6500, 9500, 420, 3200)),
    celebrate: animacion('Celebra', 'Pocas veces, pero se nota: enciende las lentes.', G, 'loop',
      [paso('sorpresa', 600, 250, 'snappy'), paso('proyectando', 1400, 400, 'spring'), paso('satisfecho', 1400, 400, 'spring')],
      parpadeo(4800, 7200, 300, 2400)),
    confused: animacion('Confundido', 'Algo no calza con el plano.', G, 'loop',
      [paso('sospecha', 1800, 450, 'spring'), paso('de-reojo', 1400, 600, 'smooth')],
      parpadeo(4800, 7200, 300, 2600)),
    sad: animacion('Triste', 'Para una página 404 o algo que no se pudo.', G, 'loop',
      [paso('triste', 3200, 800, 'smooth'), paso('mira-abajo', 1800, 800, 'smooth')],
      parpadeo(6500, 9500, 420, 3200)),
    sleeping: animacion('Durmiendo', 'El orbe en reposo, sin perder la órbita.', G, 'loop',
      [paso('dormido', 4000, 1200, 'smooth')],
      parpadeo(6500, 9500, 420, 4800, false))
  };
  return definicion('Atlas', body, colores, E, A);
}
