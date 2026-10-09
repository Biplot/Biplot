// Plotty, la recepción de BiPlot HQ: el isotipo hecho bot. La cabeza es el cuadrado del logo (el azul, un punto más claro
// para que se vea sobre fondo oscuro) con los ojos de LED en cian; arriba, los dos rotores (el «Bi») y la antena con el
// punto del logo, en el mismo azul: el estudio pinta todo el cuerpo de un color. Saluda, escucha y hace tres preguntas.
import { ojo, expr, nodo, paso, parpadeo, animacion, definicion } from './comun.mjs';
export function plotty({ k = 0.9, colores = { body: '#224b78', eyes: '#17c3b2' } } = {}) {
  const v = (a) => a.map((x) => x * k);
  const body = { primary: { type: 'cube', width: 176 * k, height: 146 * k, depth: 120 * k, roundness: 0.62 }, nodes: [] };
  for (const s of [-1, 1]) {
    body.nodes.push(nodo('capsule', v([15, 54, 15]), v([s * 80, -78, -8]), [0, 0, s * -42]));                                           // brazo
    body.nodes.push(nodo('cylinder', v([20, 18, 20]), v([s * 100, -100, -8]), [0, 0, 0], { roundness: 0.3, morphRoundness: 0 }));         // motor
    body.nodes.push(nodo('cylinder', v([88, 4, 24]), v([s * 100, -114, -8]), [0, 0, s * 4], { roundness: 1, morphRoundness: 0 }));         // hélice
  }
  body.nodes.push(nodo('capsule', v([9, 44, 9]), v([22, -92, -4]), [0, 0, 10]));    // antena
  body.nodes.push(nodo('sphere', v([24, 24, 24]), v([27, -118, -4])));             // el punto del logo
  const S = 68, Y = -14;                                 // separación y altura de los ojos
  const ROJO = { eyes: '#ff4d6d' }, VERDE = { eyes: '#4ade80' };   // los LED de error y de éxito (nunca coral)
  const E = {
    neutral: expr({ left: ojo(24, 32, 0, Y), spacing: S, body: 'none' }),
    feliz: expr({ head: [4, 0, -6], left: ojo(30, 11, 0, Y + 2), spacing: S + 2 }),
    guino: expr({ head: [4, -8, -9], left: ojo(24, 32, 0, Y), right: ojo(30, 10, 0, Y + 4), spacing: S }),
    atento: expr({ head: [5, 0, 5], left: ojo(26, 36, 0, Y - 2), spacing: S }),
    pensando: expr({ head: [10, -14, 4], left: ojo(22, 26, 9, Y - 10), spacing: S - 4, eyes: 'microSaccades' }),
    'mira-izquierda': expr({ head: [0, -12, 0], left: ojo(24, 32, -14, Y), spacing: S }),
    'mira-derecha': expr({ head: [0, 12, 0], left: ojo(24, 32, 14, Y), spacing: S }),
    'mira-arriba': expr({ head: [10, 0, 0], left: ojo(24, 30, 0, Y - 11), spacing: S }),
    'mira-abajo': expr({ head: [-10, 0, 0], left: ojo(24, 28, 0, Y + 11), spacing: S }),
    curioso: expr({ head: [6, 10, 10], left: ojo(22, 28, 0, Y + 1), right: ojo(28, 38, 0, Y - 3), spacing: S }),
    sorpresa: expr({ head: [8, 0, 0], left: ojo(30, 42, 0, Y - 4), spacing: S + 4 }),
    procesando: expr({ head: [0, 0, 0], left: ojo(18, 18, 0, Y), spacing: S - 6, eyes: 'microSaccades' }),
    dudando: expr({ head: [0, -6, -8], left: ojo(24, 32, 0, Y), right: ojo(26, 16, 0, Y - 4, 0), spacing: S }),
    triste: expr({ head: [-10, 0, -4], left: ojo(24, 18, 0, Y + 8, -14), right: ojo(24, 18, 0, Y + 8, 14), spacing: S }),
    dormido: expr({ head: [-12, 0, 6], left: ojo(28, 10, 0, Y + 8), spacing: S, body: 'slowDrift' }),
    // Mientras escribes: mira hacia abajo y hacia el formulario, y lee
    escribiendo: expr({ head: [-12, 10, 0], left: ojo(24, 26, 6, Y + 12), spacing: S, eyes: 'microSaccades' }),
    leyendo: expr({ head: [-12, 15, 2], left: ojo(24, 24, 10, Y + 13), spacing: S, eyes: 'microSaccades' }),
    // Algo no valida: ceño en rojo con una sacudida, y después la cara de preocupado
    ceno: expr({ head: [-4, 0, 0], left: ojo(30, 14, 0, Y + 2, 18), right: ojo(30, 14, 0, Y + 2, -18), spacing: S, body: 'shake', colors: ROJO }),
    preocupado: expr({ head: [-6, 0, -4], left: ojo(26, 18, 0, Y + 2, -12), right: ojo(26, 18, 0, Y + 2, 12), spacing: S, colors: ROJO }),
    // Todo bien: ojos grandes y felices, en verde
    'exito-grande': expr({ head: [8, 0, 0], left: ojo(30, 42, 0, Y - 4), spacing: S + 4, colors: VERDE }),
    'exito-feliz': expr({ head: [6, 0, -8], left: ojo(32, 11, 0, Y + 2), spacing: S + 2, colors: VERDE }),
    'exito-guino': expr({ head: [6, -8, -10], left: ojo(30, 11, 0, Y + 2), right: ojo(24, 34, 0, Y - 2), spacing: S + 2, colors: VERDE }),
    // La contraseña: se da vuelta y cierra los ojos; cada tanto espía un poquito
    timido: expr({ head: [-14, -32, 6], left: ojo(28, 10, -6, Y + 10), spacing: S }),
    espiando: expr({ head: [-10, -24, 4], left: ojo(28, 10, -6, Y + 10), right: ojo(20, 18, -8, Y + 8), spacing: S, eyes: 'microSaccades' })
  };
  const G = 'Plotty', una = (e) => [paso(e, 2000, 320, 'smooth')];
  // Las claves de las animaciones son las que usa la página (idle, typing, error, success, shy, look-*): no cambiarlas
  const A = {
    idle: animacion('En reposo', 'Flota en la recepción y mira a los lados, tranquilo.', G, 'loop',
      [paso('neutral', 2600, 500, 'smooth'), paso('mira-izquierda', 1600, 450, 'smooth'), paso('neutral', 2200, 450, 'smooth'), paso('mira-derecha', 1600, 450, 'smooth')],
      parpadeo(3400, 6200, 280, 2600)),
    typing: animacion('Escribiendo', 'Mira lo que escribes, como quien lee por encima del hombro.', G, 'pingPong',
      [paso('escribiendo', 900, 380, 'smooth'), paso('leyendo', 900, 380, 'smooth')],
      parpadeo(2800, 5000, 240, 2100)),
    error: animacion('Error', 'Algo no valida: ceño en rojo, una sacudida y cara de preocupado.', G, 'once',
      [paso('ceno', 900, 180, 'snappy'), paso('preocupado', 1100, 320, 'smooth')],
      parpadeo(2800, 5000, 240, 1600)),
    success: animacion('Éxito', 'Registro listo: ojos grandes, felices y en verde.', G, 'once',
      [paso('exito-grande', 600, 200, 'snappy'), paso('exito-feliz', 1100, 320, 'spring'), paso('exito-guino', 500, 220, 'snappy'), paso('exito-feliz', 900, 260, 'spring')],
      parpadeo(2800, 5000, 240, 2400)),
    shy: animacion('Tímido', 'En la contraseña se da vuelta para no mirar (y espía un poquito).', G, 'loop',
      [paso('timido', 2600, 380, 'smooth'), paso('espiando', 500, 260, 'snappy'), paso('timido', 1800, 300, 'smooth')],
      parpadeo(6500, 9500, 420, 4800, false)),
    'look-left': animacion('Mira a la izquierda', 'Para seguir el cursor.', G, 'loop', una('mira-izquierda'), parpadeo(3400, 6200, 260, 2600)),
    'look-right': animacion('Mira a la derecha', 'Para seguir el cursor.', G, 'loop', una('mira-derecha'), parpadeo(3400, 6200, 260, 2600)),
    'look-up': animacion('Mira arriba', 'Para seguir el cursor.', G, 'loop', una('mira-arriba'), parpadeo(3400, 6200, 260, 2600)),
    'look-down': animacion('Mira abajo', 'Para seguir el cursor.', G, 'loop', una('mira-abajo'), parpadeo(3400, 6200, 260, 2600)),
    greeting: animacion('Saludo', '¡Hola! Bienvenido a BiPlot HQ.', G, 'loop',
      [paso('neutral', 900, 300, 'snappy'), paso('feliz', 1300, 380, 'spring'), paso('guino', 700, 260, 'snappy'), paso('feliz', 1000, 300, 'spring')],
      parpadeo(2800, 5000, 240, 2100)),
    listening: animacion('Escuchando', 'Atento a lo que le cuentas: tres preguntas, no un formulario.', G, 'loop',
      [paso('atento', 2400, 500, 'smooth'), paso('curioso', 1600, 450, 'spring'), paso('atento', 2000, 450, 'smooth')],
      parpadeo(4800, 7200, 240, 3200)),
    thinking: animacion('Pensando', 'Arma la respuesta antes de hablar.', G, 'loop',
      [paso('pensando', 1600, 400, 'smooth'), paso('procesando', 1200, 300, 'snappy'), paso('pensando', 1400, 400, 'smooth'), paso('dudando', 1000, 350, 'spring')],
      parpadeo(2800, 5000, 260, 2100)),
    happy: animacion('Contento', 'Cuando encuentra lo que buscabas.', G, 'loop',
      [paso('feliz', 1400, 350, 'spring'), paso('sorpresa', 700, 260, 'snappy'), paso('feliz', 1200, 350, 'spring'), paso('guino', 700, 260, 'snappy')],
      parpadeo(1800, 3600, 220, 1200)),
    celebrate: animacion('Celebra', 'Para el final de un recorrido o una buena noticia.', G, 'loop',
      [paso('exito-grande', 500, 200, 'snappy'), paso('exito-feliz', 900, 300, 'spring'), paso('exito-guino', 450, 200, 'snappy'), paso('exito-feliz', 700, 260, 'spring')],
      parpadeo(1800, 3600, 220, 1200)),
    confused: animacion('Confundido', 'No entendió: ladea la cabeza y entrecierra un ojo.', G, 'loop',
      [paso('dudando', 1800, 400, 'spring'), paso('curioso', 1400, 400, 'spring')],
      parpadeo(2800, 5000, 260, 2100)),
    sad: animacion('Triste', 'Para una página 404 o algo que no se pudo.', G, 'loop',
      [paso('triste', 3000, 700, 'smooth'), paso('mira-abajo', 1600, 700, 'smooth')],
      parpadeo(6500, 9500, 420, 3200)),
    sleeping: animacion('Durmiendo', 'La recepción cerrada: rotores en pausa.', G, 'loop',
      [paso('dormido', 4000, 900, 'smooth')],
      parpadeo(6500, 9500, 420, 4800, false))
  };
  return definicion('Plotty', body, colores, E, A);
}
