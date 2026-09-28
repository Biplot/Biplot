/*
 * Oficina BiPlot · el guion del teaser del equipo
 * Lo comparten la imagen (teaser.html) y el sonido (musica.mjs): todo en segundos, a 100 pulsos por minuto
 * (un pulso = 0,6 s y un compás = 2,4 s), para que los cortes, los golpes y la voz de cada personaje caigan juntos.
 * Los textos salen de datos.js (rol, placa y lo que hace cada uno). Aby no sale en el teaser.
 */
window.TEASER_GUION = (function () {
  var PULSO = 0.6, COMPAS = 2.4;
  // Cada personaje: su placa y su rol (como en su ficha), lo que dice de su trabajo, el color de su luz, dónde está en
  // la oficina (x, y, z del mundo de escena.js: el fondo de su presentación) y cómo suena su voz (tono en Hz, timbre y
  // sílabas por segundo).
  var EQUIPO = [
    { id: 'plotty', nombre: 'Plotty', placa: 'E0', rol: 'Recepción', linea: 'Tres preguntas y te digo por dónde partir.', acento: '#17C3B2', fondo: [20.4, 15.4, 1.2], voz: { tono: 540, timbre: 'robot', ritmo: 15 } },
    { id: 'lupe', nombre: 'Lupe', placa: 'E1', rol: 'Diagnóstico', linea: 'Me siento contigo y cronometro cuánto se va en cada paso.', acento: '#E8C98E', fondo: [2.7, 13.2, 0.8], voz: { tono: 330, timbre: 'voz', ritmo: 13 } },
    { id: 'architect', nombre: 'The Architect', placa: 'E2', rol: 'Estrategia y proyectos', linea: 'Trazo el mapa: qué ordenar, qué automatizar y qué construir.', acento: '#7FD8CF', fondo: [7.0, 2.0, 1.0], voz: { tono: 150, timbre: 'filtro', ritmo: 11 } },
    { id: 'atlas', nombre: 'Atlas', placa: '360°', rol: 'Mascota de The Architect', linea: 'Desde aquí arriba se ve todo.', acento: '#6FE7F2', fondo: [6.3, 2.45, 1.8], voz: { tono: 440, timbre: 'cristal', ritmo: 9 } },
    { id: 'celda', nombre: 'Celda', placa: 'E3', rol: 'Datos y métricas', linea: 'Abro los Excel que nadie quiere abrir.', acento: '#5FBF7F', fondo: [10.4, 8.1, 1.0], voz: { tono: 300, timbre: 'voz', ritmo: 14 } },
    { id: 'engine', nombre: 'The Engine', placa: 'E4', rol: 'Ejecución y sistemas', linea: 'Dejo corriendo lo que trabaja solo, de noche y en feriado.', acento: '#F5883A', fondo: [9.6, 1.8, 1.0], voz: { tono: 110, timbre: 'motor', ritmo: 11 } },
    { id: 'grilla', nombre: 'Grilla', placa: 'E5', rol: 'Diseño', linea: 'Dibujo la maqueta antes de construir.', acento: '#62D2E8', fondo: [15.4, 8.1, 1.0], voz: { tono: 360, timbre: 'voz', ritmo: 13 } },
    { id: 'bucle', nombre: 'Bucle', placa: 'E5', rol: 'Desarrollo', linea: 'Construyo por rebanadas: cada una funciona sola.', acento: '#5B8DEF', fondo: [10.45, 12.05, 1.0], voz: { tono: 170, timbre: 'voz', ritmo: 12 } },
    { id: 'tamandua', nombre: 'Tamandúa', placa: 'E6', rol: 'Validación', linea: 'Si se puede romper, lo rompo yo antes.', acento: '#F2C14E', fondo: [15.4, 12.05, 1.0], voz: { tono: 135, timbre: 'nasal', ritmo: 12 } },
    { id: 'faro', nombre: 'Faro', placa: 'E7', rol: 'Puesta en marcha', linea: 'No termina cuando se publica. Termina cuando se usa.', acento: '#FFD27A', fondo: [22.9, 10.3, 1.2], voz: { tono: 98, timbre: 'voz', ritmo: 10 } },
    { id: 'pepa', nombre: 'Pepa', placa: 'E9', rol: 'Cosecha', linea: 'Guardo lo que sirve para el próximo proyecto.', acento: '#9CCB5B', fondo: [1.8, 7.7, 1.2], voz: { tono: 430, timbre: 'voz', ritmo: 16 } }
  ];
  // El motor, fase por fase (el orden del clímax)
  var MOTOR = [['E0', 'Calificación', 'plotty'], ['E1', 'Diagnóstico', 'lupe'], ['E2', 'Camino', 'architect'], ['E3', 'Datos', 'celda'],
    ['E4', 'Modelo y permisos', 'engine'], ['E5', 'Construcción', 'grilla'], ['E6', 'Validación', 'tamandua'], ['E7', 'Puesta en marcha', 'faro'],
    ['E8', 'Medición', 'lupe'], ['E9', 'Cosecha', 'pepa']];

  // Las partes del teaser
  var INICIO = 14.4, DURA = 2 * COMPAS;             // cada personaje: dos compases
  EQUIPO.forEach(function (p, i) {
    p.t = INICIO + i * DURA;                         // corte y golpe
    p.habla = p.t + 1.15;                            // empieza a escribirse (y a hablar) su línea
    p.letras = 30;                                   // letras por segundo
  });
  var FIN_EQUIPO = INICIO + EQUIPO.length * DURA;    // 67,2
  return {
    PULSO: PULSO, COMPAS: COMPAS, BPM: 100, DURA: DURA, EQUIPO: EQUIPO, MOTOR: MOTOR,
    // La intro: cuatro frases, una por compás, y el golpe grande con la oficina
    intro: [
      { t: 0.35, fin: 2.3, lineas: ['Todo negocio tiene un proceso', 'que se come las horas.'] },
      { t: 2.4, fin: 4.7, lineas: ['Planillas que no cuadran.'], planillas: true },
      { t: 4.8, fin: 7.1, lineas: ['Chats que nadie ordena.', 'Tareas que se repiten.'], chats: true, segunda: 6.0 },
      { t: 7.2, fin: 9.45, lineas: ['Alguien tenía que', 'ordenarlo.'], segunda: 8.4 }
    ],
    braam: 9.6,          // la oficina aparece, cerrada, de noche
    techo: 10.8,         // se va el techo: adentro está el equipo
    titulo: 12.0,        // BiPlot HQ
    conoce: 13.2,        // «Conoce al equipo»
    equipo: INICIO,
    motor: FIN_EQUIPO,   // «Diez fases. Un solo motor.»: una placa por medio pulso
    motorPlacas: FIN_EQUIPO + 0.6,
    elenco: FIN_EQUIPO + 2 * COMPAS,        // todos juntos: «Del diagnóstico a la cosecha.»
    cierre: FIN_EQUIPO + 3 * COMPAS,        // el golpe final con la marca
    remate: FIN_EQUIPO + 6 * COMPAS,        // Plotty: «¿Tres preguntas?»
    remateHabla: FIN_EQUIPO + 6 * COMPAS + 0.7,
    remateLinea: '¿Tres preguntas?',
    remateLetras: 20,
    total: FIN_EQUIPO + 6 * COMPAS + 3.0
  };
})();
