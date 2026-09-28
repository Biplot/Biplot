/*
 * Oficina BiPlot · el guion de la visita guiada con Plotty
 * Lo comparten la imagen (visita.html) y el sonido (musica.mjs): todo en segundos, a 100 pulsos por minuto
 * (un pulso = 0,6 s y un compás = 2,4 s), para que los cortes, los sonidos de cada parada y la voz de Plotty caigan juntos.
 * La visita: la oficina por dentro (una parada por parte del trabajo) y después la calle, donde cada proyecto tiene su
 * local y su sala. El mensaje: quien trabaja con BiPlot se muda al barrio, y lo seguimos acompañando.
 * Sin Aby (no sale en los videos) y sin decir quién está detrás de la mesa de dos.
 */
window.VISITA_GUION = (function () {
  var PULSO = 0.6, COMPAS = 2.4;
  // La voz de Plotty (la misma del teaser: tono en Hz, timbre y sílabas por segundo) y su velocidad al escribir
  var VOZ = { tono: 540, timbre: 'robot', ritmo: 15 }, LETRAS = 26;

  // Las paradas de adentro: dos compases cada una. foco: el punto del mundo (x, y, z de escena.js) que queda al centro;
  // k: píxeles por unidad del dibujo en vertical (en horizontal se usa un poco menos, para ver más alrededor)
  var PARADAS = [
    { id: 'recepcion', foco: [20.6, 16.2, 1.0], k: 2.7, placa: 'E0', lugar: 'Recepción', linea: 'Aquí atiendo yo: tres preguntas y te digo por dónde partir.' },
    { id: 'diagnostico', foco: [2.7, 13.2, 0.8], k: 2.7, placa: 'E1', lugar: 'Sala de diagnóstico', linea: 'Aquí se mira tu proceso real, con cronómetro.' },
    { id: 'estaciones', foco: [12.9, 10.1, 1.0], k: 2.1, placa: 'E3 · E5 · E6', lugar: 'Datos, diseño, desarrollo y pruebas', linea: 'Aquí se ordenan los datos, se diseña, se construye y se prueba.' },
    { id: 'produccion', foco: [22.4, 10.3, 1.2], k: 2.7, placa: 'E7', lugar: 'Puesta en marcha', linea: 'Y por este tubo sale a producción.' },
    { id: 'planos', foco: [8.0, 2.4, 1.1], k: 2.6, placa: 'E2 · E4', lugar: 'La mesa de dos', linea: 'Al fondo, la mesa de dos. ¿Quiénes son? No prometo nada.' },
    { id: 'nucleo', foco: [1.9, 7.7, 1.2], k: 2.7, placa: 'E9', lugar: 'El núcleo', linea: 'Lo que sirve se guarda para el próximo proyecto.' }
  ];
  var ADENTRO = 4 * COMPAS;                       // 9,6: se entra a la recepción
  PARADAS.forEach(function (p, i) {
    p.t = ADENTRO + i * 2 * COMPAS;               // llega la cámara (viaja el primer 0,9 s)
    p.habla = p.t + 1.0;
  });
  var AFUERA = ADENTRO + PARADAS.length * 2 * COMPAS;   // 38,4: se sale a la calle

  // Lo de afuera: un momento por idea, dos compases cada uno (la salida dura uno)
  var CALLE = AFUERA + COMPAS;                    // 40,8
  var M = {
    salida: { t: AFUERA, linea: 'Y afuera está lo mejor.' },
    calle: { t: CALLE, linea: 'Cada cliente se muda al barrio.', titulo: ['Cada proyecto,', 'su local en el barrio.'] },
    local: { t: CALLE + 2 * COMPAS, linea: 'Su local muestra lo que vende.', titulo: ['Su marca en el techo.', 'Sus productos, a la vista.'] },
    sala: { t: CALLE + 4 * COMPAS, linea: 'Adentro, lo que construimos juntos.', titulo: ['Adentro, su sala:', 'su historia en pantalla.'] },
    enlace: { t: CALLE + 6 * COMPAS, linea: 'Y se comparte con un enlace.', titulo: ['Un enlace para mostrarla', 'a sus propios clientes.'] },
    seguimos: { t: CALLE + 8 * COMPAS, linea: 'Y no nos vamos: seguimos acompañando.', titulo: ['Y seguimos con ellos', 'después de la entrega.'],
      puntos: ['Soporte continuo', 'Sistemas sanos y al día', 'Medición: día 30, 60 y 90'] },
    libre: { t: CALLE + 10 * COMPAS, linea: 'Este está libre. ¿Será el tuyo?', titulo: ['Tu proyecto', 'aquí.'] },
    cierre: { t: CALLE + 12 * COMPAS, linea: '¿Tres preguntas?' }
  };
  Object.keys(M).forEach(function (k) { M[k].habla = M[k].t + (k === 'salida' ? 0.25 : k === 'cierre' ? 4.2 : 0.35); });
  // Las salas que se muestran (las de proyectos en curso o entregados; Eleven 360 es propuesta y no sale)
  var SALAS = [
    { id: 'haru', nombre: 'Haru 360', rubro: 'Restaurante' },
    { id: 'fundos', nombre: 'Fundos 360', rubro: 'Inmobiliaria' },
    { id: 'nuhome', nombre: 'Nu Home 360', rubro: 'Casas modulares' }
  ];

  return {
    PULSO: PULSO, COMPAS: COMPAS, BPM: 100, VOZ: VOZ, LETRAS: LETRAS,
    // La entrada: el barrio de noche, Plotty llega volando y se va el techo
    hola: { t: 0.35, linea: '¡Hola! Soy Plotty.', habla: 0.95 },
    muestro: { t: COMPAS, linea: 'Te muestro BiPlot HQ.', habla: COMPAS + 0.25 },
    techo: 2 * COMPAS,                           // 4,8: se va el techo
    pasa: { t: 2 * COMPAS, linea: 'Adentro trabaja el equipo. Pasa.', habla: 2 * COMPAS + 0.5 },
    entra: 3 * COMPAS,                           // 7,2: la cámara entra
    ADENTRO: ADENTRO, PARADAS: PARADAS, AFUERA: AFUERA, CALLE: CALLE, M: M, SALAS: SALAS,
    total: M.cierre.t + 3 * COMPAS + 1.8
  };
})();
