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
  const E = {
    neutral: expr({ left: ojo(24, 32, 0, Y), spacing: S, body: 'none' }),
    feliz: expr({ head: [4, 0, -6], left: ojo(30, 11, 0, Y + 2), spacing: S + 2 }),
    guino: expr({ head: [4, -8, -9], left: ojo(24, 32, 0, Y), right: ojo(30, 10, 0, Y + 4), spacing: S }),
    atento: expr({ head: [5, 0, 5], left: ojo(26, 36, 0, Y - 2), spacing: S }),
    pensando: expr({ head: [10, -14, 4], left: ojo(22, 26, 9, Y - 10), spacing: S - 4, eyes: 'microSaccades' }),
    'mira-izquierda': expr({ head: [0, -20, 0], left: ojo(24, 32, -12, Y), spacing: S }),
    'mira-derecha': expr({ head: [0, 20, 0], left: ojo(24, 32, 12, Y), spacing: S }),
    curioso: expr({ head: [6, 10, 10], left: ojo(22, 28, 0, Y + 1), right: ojo(28, 38, 0, Y - 3), spacing: S }),
    sorpresa: expr({ head: [8, 0, 0], left: ojo(30, 42, 0, Y - 4), spacing: S + 4 }),
    procesando: expr({ head: [0, 0, 0], left: ojo(18, 18, 0, Y), spacing: S - 6, eyes: 'microSaccades' }),
    dudando: expr({ head: [0, -6, -8], left: ojo(24, 32, 0, Y), right: ojo(26, 16, 0, Y - 4, 0), spacing: S }),
    dormido: expr({ head: [-12, 0, 6], left: ojo(28, 10, 0, Y + 8), spacing: S, body: 'slowDrift' })
  };
  const G = 'Plotty';
  const A = {
    'en-reposo': animacion('En reposo', 'Flota en la recepción y mira a los lados, tranquilo.', G, 'loop',
      [paso('neutral', 2600, 500, 'smooth'), paso('mira-izquierda', 1600, 450, 'smooth'), paso('neutral', 2200, 450, 'smooth'), paso('mira-derecha', 1600, 450, 'smooth')],
      parpadeo(3400, 6200, 280, 2600)),
    saludo: animacion('Saludo', '¡Hola! Bienvenido a BiPlot HQ.', G, 'loop',
      [paso('neutral', 900, 300, 'snappy'), paso('feliz', 1300, 380, 'spring'), paso('guino', 700, 260, 'snappy'), paso('feliz', 1000, 300, 'spring')],
      parpadeo(2800, 5000, 240, 2100)),
    escuchando: animacion('Escuchando', 'Atento a lo que le cuentas: tres preguntas, no un formulario.', G, 'loop',
      [paso('atento', 2400, 500, 'smooth'), paso('curioso', 1600, 450, 'spring'), paso('atento', 2000, 450, 'smooth')],
      parpadeo(4800, 7200, 240, 3200)),
    pensando: animacion('Pensando', 'Arma la respuesta antes de hablar.', G, 'loop',
      [paso('pensando', 1600, 400, 'smooth'), paso('procesando', 1200, 300, 'snappy'), paso('pensando', 1400, 400, 'smooth'), paso('dudando', 1000, 350, 'spring')],
      parpadeo(2800, 5000, 260, 2100)),
    contento: animacion('Contento', 'Cuando encuentra lo que buscabas.', G, 'loop',
      [paso('feliz', 1400, 350, 'spring'), paso('sorpresa', 700, 260, 'snappy'), paso('feliz', 1200, 350, 'spring'), paso('guino', 700, 260, 'snappy')],
      parpadeo(1800, 3600, 220, 1200)),
    durmiendo: animacion('Durmiendo', 'La recepción cerrada: rotores en pausa.', G, 'loop',
      [paso('dormido', 4000, 900, 'smooth')],
      parpadeo(6500, 9500, 420, 4800, false))
  };
  return definicion('Plotty', body, colores, E, A);
}
