/*
 * Oficina BiPlot · datos
 * El equipo, las fases del motor, las salas de la oficina, los proyectos y el barrio, la vitrina y las preguntas de Plotty.
 * Es lo único que hay que tocar para cambiar textos, enlaces o quién trabajó en qué.
 * A futuro lo genera el CRM de BiPlot (ver README.md, "Conexión con el CRM"): mismo formato.
 * Reglas: sólo datos públicos y sin cifras de clientes. Los textos hablan de integrantes, todos con placa y con el mismo trato.
 */
(function () {
  'use strict';

  var TELEFONO = '56966275675';
  var WHATSAPP = 'https://wa.me/' + TELEFONO + '?text=' +
    encodeURIComponent('Hola BiPlot, vengo de la oficina virtual y quiero agendar un diagnóstico.');
  // El cotizador de Nu Home 360: el enlace de su local y el «Diseñar la mía» de su sala
  var COTIZADOR_NUHOME = 'https://nuhome-crm-nu.vercel.app/cotizador';

  window.OFICINA_DATOS = {
    version: '2026-09-26',
    cta: { texto: 'Agenda tu diagnóstico', url: WHATSAPP },
    whatsapp: TELEFONO,
    sitio: { texto: 'biplot.cl', url: '../' },

    /* El equipo, en el orden del motor. `placa` va en la credencial; `fases`, todas las que cubre.
       `completo` es su nombre y apellido; el apodo es como les dicen. */
    personal: [
      {
        id: 'lupe', nombre: 'Lupe', completo: 'Guadalupe Cifuentes', genero: 'f', rol: 'Diagnóstico', placa: 'E1', fases: ['E1', 'E8'],
        vive: 'diagnostico', lema: 'La que pregunta primero.',
        resumen: 'Recibe a cada negocio después de Plotty. Se sienta con quien hace el trabajo, mira las planillas y los chats, y cronometra cuánto se va en cada paso. Con eso arma la radiografía y la línea base. A los 30, 60 y 90 días vuelve con el cronómetro.',
        rasgos: ['Pregunta «¿por qué?» hasta llegar al fondo.', 'Escucha más de lo que habla.', 'No sale de una reunión sin una cifra.'],
        frase: 'Lo que pides no siempre es lo que necesitas.',
        look: 'Lupa de joyero que le agranda un ojo, moño plateado atravesado por un lápiz, gabardina arena con humita azul y un cronómetro colgado al cuello.',
        ahora: ['Recibiendo a quien acaba de pasar por la recepción.', 'Cronometrando cuánto se va en una planilla.', 'Armando la radiografía de un negocio.']
      },
      {
        id: 'architect', nombre: 'The Architect', genero: 'm', rol: 'Estrategia y proyectos', placa: 'E2', fases: ['E2'],
        vive: 'planos', lema: 'El que traza el mapa.',
        resumen: 'Toma la radiografía de Lupe y traza el mapa: qué ordenar, qué automatizar y qué construir, en ese orden. Lleva la Sala de planos, donde ves tu proceso dibujado en vivo y te llevas «tu plano».',
        rasgos: ['Ve la oficina entera antes de mover una pieza.', 'Dibuja en cualquier superficie.', 'No acepta reuniones sin pizarra.'],
        frase: 'Si no se puede dibujar, no se puede construir.',
        look: 'Lentes-visor cian, polerón carbón con la «A», jeans con cadena y zapatillas de caña.',
        ahora: ['Dibujando el plano de un proceso de venta.', 'Proyectando un mapa con Atlas.', 'Pasándole un plano a The Engine.']
      },
      {
        id: 'celda', nombre: 'Celda', completo: 'Celeste Dávila', alias: 'Byte', genero: 'f', rol: 'Datos y métricas', placa: 'E3', fases: ['E3', 'E8'],
        vive: 'laboratorio', lema: 'La que ordena los datos.',
        resumen: 'Abre los Excel que nadie quiere abrir. Encuentra duplicados, vacíos y fórmulas rotas, y deja los datos listos para usarse. Cuando el sistema ya corre, cuenta los resultados: horas ahorradas, errores que dejaron de pasar, el antes y el después.',
        rasgos: ['Ve un duplicado a diez filas de distancia.', 'Le tiene alergia a «final_final_v3.xlsx».', 'Le dicen Byte porque todo lo mide.'],
        frase: 'Si no cuadra, no avanza.',
        look: 'Pelo afro cortado en cubo con peineta cian, lentes cuadrados, chaqueta cuadriculada con celdas que se encienden, plumero y tableta.',
        ahora: ['Limpiando una planilla con tres hojas repetidas.', 'Cruzando dos listas de clientes.', 'Contando las horas que se ahorró un cliente.']
      },
      {
        id: 'engine', nombre: 'The Engine', genero: 'm', rol: 'Ejecución y sistemas', placa: 'E4', fases: ['E4'],
        vive: 'planos', lema: 'El que deja todo andando.',
        resumen: 'Arma el esqueleto: el modelo de datos, quién ve qué y cómo se conectan los sistemas. Después deja corriendo las automatizaciones que trabajan solas, de noche y en feriado. Muestra las demos técnicas desde la tablet.',
        rasgos: ['Nunca apaga nada un viernes.', 'Tiene una llave para cada integración.', 'Si algo funciona solo, lo da por bien hecho.'],
        frase: 'Lo que se repite, se automatiza.',
        look: 'Polera carbón con el ícono de motor, audífonos naranjos al cuello, pantalón cargo, botas y la tablet siempre encendida.',
        ahora: ['Conectando dos sistemas que no se hablaban.', 'Dejando corriendo una automatización de noche.', 'Mostrando una demo desde la tablet.']
      },
      {
        id: 'grilla', nombre: 'Grilla', completo: 'Griselda Llanos', alias: 'Pixel', genero: 'f', rol: 'Diseño', placa: 'E5', fases: ['E5'],
        vive: 'estaciones', lema: 'La que dibuja antes de construir.',
        resumen: 'Convierte el mapa de The Architect en una maqueta que se puede tocar antes de programar. Diseña cada pantalla para quien la va a usar, en el celular en terreno o en el escritorio de la gerencia.',
        rasgos: ['Todo cae en su grilla.', 'Prueba cada botón con el pulgar.', 'Le dicen Pixel porque ve un píxel chueco a dos metros.'],
        frase: 'Si hay que explicarlo, está mal diseñado.',
        look: 'La más alta del equipo: pelo cian con dos lápices como antenas, lentes redondos, jardinera y una huincha de medir de bufanda.',
        ahora: ['Dibujando la maqueta de un cotizador.', 'Probando un botón con el pulgar.', 'Alineando todo a la grilla.']
      },
      {
        id: 'bucle', nombre: 'Bucle', completo: 'Benjamín Ochoa', alias: 'Kilo', genero: 'm', rol: 'Desarrollo', placa: 'E5', fases: ['E5'],
        vive: 'estaciones', lema: 'El que construye por rebanadas.',
        resumen: 'Construye el sistema por rebanadas finas: cada una funciona sola y se puede mostrar. Parte de lo que el equipo ya tiene guardado, así cada proyecto arranca más adelante que el anterior.',
        rasgos: ['Tiene ocho pestañas abiertas y cierra una rebanada a la vez.', 'Prefiere reutilizar antes que reinventar.', 'Le dicen Kilo por el café: un kilo a la semana.'],
        frase: 'Rebanada chica, entrega segura.',
        look: 'Rastas azules que se enroscan como tentáculos, moño con cinta cian, audífonos al cuello, polerón y la taza «</>».',
        ahora: ['Construyendo la rebanada 3.', 'Conectando el módulo de cobranza.', 'Rellenando el café.']
      },
      {
        id: 'tamandua', nombre: 'Tamandúa', completo: 'Tomás Hormazábal', genero: 'm', rol: 'Validación', placa: 'E6', fases: ['E6'],
        vive: 'estaciones', lema: 'El que se come los bichos.',
        resumen: 'Antes de que algo llegue al cliente, lo prueba en celular, tablet y escritorio, con cada perfil de usuario y en tema claro y oscuro. Se come los bichos antes de que alguien más los vea, y los guarda en un frasco.',
        rasgos: ['Revisa en cuatro pantallas a la vez.', 'Trabaja con linterna porque los bichos se esconden.', 'Desconfía de todo lo que funciona a la primera.'],
        frase: 'Si se puede romper, lo rompo yo antes.',
        look: 'Alto y encorvado, nariz larga, chaleco negro sobre polera crema, linterna en la frente y el frasco de bichos.',
        ahora: ['Probando una pantalla a 375 píxeles.', 'Revisando qué ve cada perfil.', 'Guardando un bicho en el frasco.']
      },
      {
        id: 'faro', nombre: 'Faro', completo: 'Fausto Torres', genero: 'm', rol: 'Puesta en marcha', placa: 'E7', fases: ['E7'],
        vive: 'estaciones', lema: 'El que se queda hasta que se usa.',
        resumen: 'Publica el sistema, lo instala en el día a día del cliente y enseña a cada perfil a usarlo, con su manual. Tiene paciencia infinita. Da el trabajo por terminado cuando nadie tiene que llamarlo.',
        rasgos: ['Enseña igual la décima vez que la primera.', 'Su farol se prende cuando algo sale a producción.', 'Anda con el manual bajo el brazo.'],
        frase: 'No termina cuando se publica. Termina cuando se usa.',
        look: 'El mayor del equipo: barba blanca, gorro marinero, suéter a rayas de faro, farol cian y el manual bajo el brazo.',
        ahora: ['Subiendo una entrega a producción.', 'Enseñando a usar el sistema en terreno.', 'Escribiendo el manual de cada perfil.']
      },
      {
        id: 'pepa', nombre: 'Pepa', completo: 'Josefa Huerta', genero: 'f', rol: 'Cosecha', placa: 'E9', fases: ['E9'],
        vive: 'estanteria', lema: 'La que guarda lo que sirve.',
        resumen: 'Cuando un proyecto cierra, recorre la oficina y se lleva lo que le sirve al próximo: componentes, reglas, textos y plantillas. Sólo guarda lo que ya se usó en dos proyectos. Por eso cada sistema nuevo parte con ventaja.',
        rasgos: ['Sabe dónde está todo.', 'Bota sin pena lo que no sirve.', 'Siempre anda con un brote en el bolsillo.'],
        frase: 'Lo que sirve dos veces se guarda. Lo demás, se bota.',
        look: 'La más baja y la más rápida: dos moños redondos como orejas de degú, trenza, delantal, botas de agua y un canasto de pepas.',
        ahora: ['Guardando un componente en la estantería.', 'Revisando qué se usó dos veces.', 'Ordenando el núcleo.']
      },
      {
        id: 'aby', nombre: 'Aby', genero: 'f', rol: 'La corresponsal', placa: 'PRENSA', fases: [],
        vive: 'set', lema: 'La que pregunta lo que todos se preguntan.',
        resumen: 'Una de las dos caras reales de la oficina. Graba en el mundo real y entra a la oficina dibujada con su pase de prensa. Pregunta lo que la gente se pregunta y casi nunca recibe una respuesta clara.',
        rasgos: ['Siempre anda grabando.', 'Pregunta lo que nadie se atreve a preguntar.', 'Tampoco sabe quién es real. O eso dice.'],
        frase: '¿The Engine existe? Yo tampoco lo sé.',
        look: 'Ondas largas color miel, aros dorados, bomber azul con el parche de Plotty, polera «REC» y el celular con aro de luz.',
        ahora: ['Grabando en el set.', 'Preguntándole a Kilo qué rompió hoy.', 'Buscando a The Engine con la cámara encendida.']
      },
      {
        id: 'felipe', nombre: 'Felipe', alias: 'Rodman', genero: 'm', rol: 'El rostro', placa: 'PRENSA', fases: [],
        vive: 'set', lema: 'El que da la cara.',
        resumen: 'La otra cara real de la oficina. Graba con Aby y cuenta lo que hace el equipo como si fuera un partido: quién pasó la pelota, quién la metió y cuánto falta para el final.',
        rasgos: ['Siempre anda con una pelota de básquetbol.', 'Edita con Tyler, the Creator de fondo.', 'Le dicen Rodman por el pelo. No por los rebotes. O eso dice.'],
        frase: 'Pásala, que yo la cuento.',
        look: 'Pelo al ras en zigzag rojo y negro con las puntas amarillas, chaqueta de trabajo negra con una flor en la solapa, cadena dorada, pantalón ancho gris con manchas y la pelota girando en el índice.',
        ahora: ['Grabando con Aby en el set.', 'Haciendo girar la pelota en el dedo.', 'Poniendo a Tyler mientras edita.']
      }
    ],

    /* Las mascotas: una de The Architect y una de The Engine. */
    mascotas: [
      {
        id: 'atlas', nombre: 'Atlas', de: 'architect', genero: 'm', rol: 'Mascota de The Architect', placa: '360°', fases: [],
        vive: 'planos', lema: 'El que ve la oficina desde arriba.',
        resumen: 'Un orbe de vidrio con un globo de líneas y un corazón de plasma. Sostiene el mapa, como su nombre, y ve la oficina entera desde arriba. Habla poco y mira mucho. Su placa dice 360° porque no tiene una fase: ve las diez a la vez.',
        rasgos: ['Guía el recorrido de la oficina, desde arriba.', 'Proyecta sobre la mesa de dos el mapa que traza The Architect.', 'Recorre los procesos y marca dónde se pierden las horas.'],
        frase: 'Desde aquí arriba se ve todo.',
        look: 'Un orbe de vidrio con anillos, un globo de líneas y un corazón de plasma cian.',
        ahora: ['Proyectando un mapa sobre la mesa de dos.', 'Mirando la oficina entera.', 'Esperando el próximo recorrido.']
      },
      {
        id: 'plotty', nombre: 'Plotty', de: 'engine', genero: 'm', rol: 'Recepción', placa: 'E0', fases: ['E0'],
        vive: 'recepcion', lema: 'El que atiende la puerta.',
        resumen: 'El isotipo de BiPlot convertido en bot, con dos rotores y cara de LED. Es la primera automatización que armó The Engine y atiende la recepción: conversa, apura y no soporta los formularios largos.',
        rasgos: ['Hace tres preguntas y te dice por dónde partir.', 'Si calificas, su antena se pone coral y te invita a agendar.', 'Si una automatización falla, pone cara de bicho y llama a Tamandúa.'],
        frase: 'Tres preguntas. Prometo que no es un formulario.',
        look: 'El isotipo de BiPlot hecho bot: dos rotores, cara de LED y una antena.',
        ahora: ['Atendiendo la recepción.', 'Esperando a alguien para hacerle tres preguntas.', 'Vigilando las máquinas.']
      }
    ],

    /* El motor de entrega, fase por fase, con quién la lleva. */
    fases: [
      { id: 'E0', nombre: 'Calificación', texto: 'Tres preguntas con Plotty y, si tiene sentido, la primera sesión sin costo.', quien: ['plotty'] },
      { id: 'E1', nombre: 'Diagnóstico', texto: 'El proceso real, los dolores en horas y pesos, y la línea base.', quien: ['lupe'] },
      { id: 'E2', nombre: 'Camino', texto: 'El mapa: qué ordenar, qué automatizar y qué construir, en ese orden.', quien: ['architect'] },
      { id: 'E3', nombre: 'Datos', texto: 'Los datos reales, cargados y revisados.', quien: ['celda'] },
      { id: 'E4', nombre: 'Modelo y permisos', texto: 'Quién ve qué y cómo se conectan los sistemas, validado contigo.', quien: ['engine'] },
      { id: 'E5', nombre: 'Construcción', texto: 'Rebanadas cortas que funcionan solas.', quien: ['grilla', 'bucle'] },
      { id: 'E6', nombre: 'Validación', texto: 'Se prueba con uso real antes de aceptar.', quien: ['tamandua'] },
      { id: 'E7', nombre: 'Puesta en marcha', texto: 'Publicar, enseñar y acompañar.', quien: ['faro'] },
      { id: 'E8', nombre: 'Medición', texto: 'Día 30, 60 y 90, contra la línea base.', quien: ['lupe', 'celda'] },
      { id: 'E9', nombre: 'Cosecha', texto: 'Lo que sirve para el próximo, al núcleo.', quien: ['pepa'] }
    ],

    /* Las salas de la oficina y los lugares del barrio: lo que cuenta el panel de cada uno. */
    salas: {
      recepcion: { nombre: 'Recepción', sub: 'Plotty y la vitrina', etiqueta: 'Recepción',
        titulo: 'Pasa, esta es la oficina',
        texto: 'Aquí te recibe Plotty. Llega con tu libreta, la de las planillas a mano y el clip: tres preguntas y te dice por dónde partir. En la vitrina de al lado están los casos más cercanos a tu rubro.' },
      diagnostico: { nombre: 'Sala de diagnóstico', sub: 'Lupe · E1', etiqueta: 'Sala de diagnóstico · E1',
        titulo: 'Diez fases, un solo motor',
        texto: 'Todo proyecto pasa por el mismo motor. Primero entendemos tu negocio. Después elegimos lo justo. A veces la respuesta no es más software.' },
      planos: { nombre: 'Planos y máquinas', sub: 'The Architect y The Engine', etiqueta: 'Sala de planos y Sala de máquinas',
        titulo: 'Uno dibuja, el otro construye',
        texto: 'La Sala de planos y la Sala de máquinas son una sola, con el vidrio abierto al medio. La mesa de dos cruza de un lado al otro: el plano en una punta, la tablet en la otra. Atlas proyecta el mapa sobre la mesa y, cuando el plano está listo, baja por el tubo a las máquinas.',
        puntos: [['El plano', 'tu proceso dibujado en vivo, y te lo llevas'], ['Las máquinas', 'las automatizaciones que corren solas, de noche y en feriado'], ['«Del plano a la máquina»', 'una vez al mes, un caso contado a dos voces']] },
      set: { nombre: 'El set', sub: 'Aby y Felipe graban aquí', etiqueta: 'El set',
        titulo: 'Donde graban Aby y Felipe',
        texto: 'Aro de luz, cámara y la pared de la marca. Aby y Felipe entran a la oficina con su pase de prensa: ella le pregunta al equipo lo que todos se preguntan y él lo cuenta como si fuera un partido.' },
      laboratorio: { nombre: 'Laboratorio de métricas', sub: 'Celda y Lupe · E8', etiqueta: 'Laboratorio de métricas · E8',
        titulo: 'Antes y después, sin adornos',
        texto: 'Aquí se mide si funcionó. A los 30, 60 y 90 días, Lupe y Celda comparan contra la línea base del diagnóstico: horas al mes, errores y tiempos de respuesta.',
        puntos: [['Línea base', 'cómo se trabajaba antes, medido en horas'], ['Día 30, 60 y 90', 'la misma medición, después'], ['Sin adornos', 'si no bajó, se dice']] },
      reuniones: { nombre: 'Sala de reuniones', sub: 'Donde te atienden', etiqueta: 'Sala de reuniones',
        titulo: 'Aquí te atienden',
        texto: 'Las reuniones contigo son aquí, con una persona del equipo, con su nombre y su rol. En la pantalla, cómo avanza cada proyecto esta semana.' },
      pasaje: { nombre: 'El pasaje', sub: 'La entrada y el directorio', etiqueta: 'El pasaje · Directorio',
        titulo: 'La calle de los proyectos',
        texto: 'Por el pasaje se entra a la oficina. Afuera está la calle: un local por proyecto, cada uno con la sala de su empresa. Los proyectos que se muestran con su propio dibujo están en la calle principal; los demás, en la calle de su rubro.' },
      /* El Archivo es también el museo de BiPlot, con su sala propia (su dibujo: dibujos/barrio/salas-propias/archivo.mjs).
         La línea de «Seis décadas, la misma línea» cruza el piso: una pieza por época y una por desarrollo, en el orden en
         que llegaron a biplot.cl, y al final un pedestal libre. Adentro está el fichero con todos los casos. */
      archivo: { nombre: 'El Archivo', sub: 'El museo de BiPlot', etiqueta: 'El Archivo · Museo de BiPlot',
        titulo: 'El museo de BiPlot',
        texto: 'Del papel a lo que construimos hoy: una pieza de cada época y de cada desarrollo, unidas por la misma línea. Adentro está el fichero con cada caso, también los que no muestran su nombre o ya terminaron. Pepa los ordena por rubro, y el edificio sube un piso cada diez casos.',
        esencia: 'Seis décadas, la misma línea: del papel a lo que construimos hoy.',
        salaPropia: {
          marca: { nombre: 'El Archivo', sub: 'MUSEO DE BIPLOT', texto: 'Seis décadas, la misma línea: una pieza de cada época y de cada desarrollo. Al final, tu turno.' },
          colores: { fondo: '#FBFAF7', fondo2: '#EEEBE5', tinta: '#0E2A47', tinta2: '#2F3A46', oro: '#17C3B2', ceja: '#0B6F66', cejaBurbuja: '#0B6F66',
            borde: '#E4E0D8', brillo: '23, 195, 178', sub: '#0B6F66', pie: '#5B6776', velo: 'rgba(14, 42, 71, .06)', hover: '#12375E',
            boton: '#0E2A47', botonTinta: '#FFFFFF', botonPunto: '#17C3B2' },
          // La barra va en azul, con el botón cian; las tarjetas, como las cédulas de un museo
          coloresBarra: { fondo: '#0E2A47', tinta: '#F2F4F7', tinta2: '#C9D4DF', sub: '#7FD8CF', borde: 'rgba(127, 216, 207, .35)', ceja: '#7FD8CF',
            velo: 'rgba(255, 255, 255, .08)', hover: '#3FD3C4', boton: '#17C3B2', botonTinta: '#062B27', botonPunto: '#062B27' },
          fuente: { familia: "'Space Grotesk', 'DejaVu Sans', sans-serif", peso: 700, espacio: '.06em', titulo: '25px', sub: "700 10.5px/1.4 'Space Mono', monospace" },
          textos: { recorrer: 'Recorrer con Pepa', recorrido: 'Recorrido con Pepa', guia: 'Pepa · Cosecha' },
          barra: ['recorrer', { zona: 'fichero', texto: 'Todos los casos' }],
          guia: 'pepa',
          whatsapp: null,
          burbujas: [
            { quien: 'pepa', nombre: 'Pepa, de BiPlot', rol: 'Pepa · Cosecha', texto: '¡Bienvenido al Archivo! Aquí guardamos lo que sirve dos veces. ¿Te acompaño?', biplot: true },
            { quien: 'abuelo', nombre: 'Un visitante junto a la libreta', rol: 'Visita', texto: 'Así llevaba yo las cuentas.' },
            { quien: 'arMira', nombre: 'Una visitante junto a la escritura', rol: 'Visita', texto: '¡La banderita del lote 25!' },
            { quien: 'nino', nombre: 'Un niño junto al elefante', rol: '', texto: '¡El elefante tiene corona!' },
            { quien: 'arFoto', nombre: 'Una visitante junto a las diez fases', rol: 'Visita', texto: 'Una foto de las diez fases, para el equipo.' }
          ],
          zonas: {
            recepcion: { nombre: 'La entrada', ceja: 'El Archivo · Museo de BiPlot', titulo: 'Seis décadas, la misma línea',
              texto: 'La línea del piso parte color papel, como en 1985, y va tomando el color de cada época hasta volverse cian en BiPlot HQ. Después vuelve por una pieza de cada desarrollo, en el orden en que llegaron, y termina en tu turno.',
              botones: ['recorrer', { zona: 'fichero', texto: 'Todos los casos' }] },
            papel: { nombre: 'La libreta', ceja: '1985 · El papel', titulo: 'Antes de todo esto, había una libreta',
              texto: 'Planillas a mano, un clip para no perder la hoja y una corrección en rojo sobre el número que no cuadraba. Así seguía operando, hasta hace muy poco, casi cualquier pyme de servicios: un cuaderno, WhatsApp, un Excel y la memoria de una sola persona sosteniendo el proceso completo.',
              botones: [{ url: '../plotline.html#ch0', texto: 'Ver el capítulo' }] },
            terminal: { nombre: 'La terminal', ceja: '1990 · El diagnóstico', titulo: 'Todo cambio serio empieza por leer el proceso real',
              texto: 'Antes de tocar nada, se entiende paso a paso cómo trabaja el equipo, sin apurarse a la solución. Así parte hoy cada proyecto en BiPlot: con el diagnóstico y la línea base contra la que se mide todo.',
              botones: [{ url: '../plotline.html#ch1', texto: 'Ver el capítulo' }] },
            software: { nombre: 'El software', ceja: '1998 · El enredo', titulo: 'Compraste una herramienta. Ahora tienes dos problemas',
              texto: 'El software de caja prometía resolverlo todo. Una herramienta potente que el equipo nunca aprende a usar es dinero tirado: una pestaña más que alguien tiene que aprender, mantener y explicarle al resto.',
              botones: [{ url: '../plotline.html#ch2', texto: 'Ver el capítulo' }] },
            generico: { nombre: 'Tres palabras', ceja: '2015 · El genérico', titulo: 'Todas prometen lo mismo, con las mismas tres palabras',
              texto: 'Así se ve la mayoría de las plantillas de automatización: la misma solución para cualquier negocio, vestida de innovación.',
              chips: ['Escalable', 'Innovador', 'Centrado en el cliente'],
              botones: [{ url: '../plotline.html#ch3', texto: 'Ver el capítulo' }] },
            hoy: { nombre: 'Diez fases', ceja: 'Hoy · BiPlot HQ', titulo: 'La misma línea, ahora con alguien a cargo de cada tramo',
              texto: 'Al software genérico le faltaban personas. En BiPlot HQ, tu proceso pasa por diez fases y cada una la lleva alguien del equipo: del diagnóstico a la medición del día 90.',
              fases: true,
              botones: [{ hq: true, texto: 'Pasar a BiPlot HQ' }, { url: '../plotline.html#ch4', texto: 'Ver el capítulo' }] },
            fundos: { nombre: 'La escritura', ceja: 'Fundos 360 · 10 sep 2026', titulo: 'La escritura inscrita', caso: 'fundos', imagen: 'fundos-5-postventa',
              texto: 'El ciclo de una parcela es largo: contacto, reserva, escritura, facturación al inversionista, posventa y comisiones. Fundos 360 lo sigue completo, hasta que la escritura queda inscrita a nombre de quien compró. A su lado, la banderita del lote 25 de su plano.',
              botones: [{ sala: 'fundos', texto: 'Entrar a su sala' }] },
            haru: { nombre: 'El QR de la mesa', ceja: 'Haru 360 · 15 sep 2026', titulo: 'El QR de la mesa', caso: 'haru', imagen: 'haru-3-comandas',
              texto: 'En Haru se pide desde la mesa, con el QR de la carta digital, y la comanda llega a la cocina sin papel. Detrás, un solo sistema junta ventas, cocina, delivery, bodega y caja.',
              botones: [{ sala: 'haru', texto: 'Entrar a su sala' }] },
            nuhome: { nombre: 'El módulo', ceja: 'Nu Home 360 · 25 sep 2026', titulo: 'Una casa que se arma por módulos', caso: 'nuhome', imagen: 'nuhome-1-disenador',
              texto: 'Nu Home fabrica casas modulares, y así también se diseñan: módulo por módulo. Nu Home 360 junta todo lo que pasa entre el primer contacto y la entrega de la casa.',
              botones: [{ sala: 'nuhome', texto: 'Entrar a su sala' }] },
            eleven: { nombre: 'La huella', ceja: 'Eleven 360 · 25 sep 2026', titulo: 'Antes y después de la huella', caso: 'eleven',
              texto: 'En Eleven se entra con la huella. La propuesta no la reemplaza: se conecta a su lector de siempre y trabaja antes y después de ella, para que quienes entrenan se queden y vuelvan por más.',
              chips: ['Propuesta'],
              botones: [{ sala: 'eleven', texto: 'Entrar a su sala' }] },
            rumbo: { nombre: 'El elefante', ceja: 'Rumbo · 25 sep 2026', titulo: '¿Cómo te comes un elefante?', caso: 'rumbo',
              texto: 'Un bocado a la vez. En Rumbo, la app de BiPlot para ordenar lo personal, el elefante es la tarea más importante del día, y crece con tu constancia. Aquí está en su última etapa: el Sabio, con su corona.',
              chips: ['Cría · Joven · Adulto · Sabio'],
              botones: [{ sala: 'rumbo', texto: 'Entrar a su sala' }] },
            tuproyecto: { nombre: 'Tu proyecto', ceja: 'Tu turno', titulo: 'Tu proceso es el próximo punto de esta línea',
              texto: 'Del papel al pixel, la línea nunca dejó de trazarse. Este pedestal está libre: todo empieza con un diagnóstico, y la primera sesión es sin costo.',
              botones: [{ cta: true }, { chat: true }] },
            fichero: { nombre: 'El fichero', ceja: 'El fichero', titulo: 'Todos los casos tienen su carpeta',
              texto: 'Aquí está cada caso, también los que no muestran su nombre o ya terminaron. Pepa los ordena por rubro, y cuando llega un rubro nuevo se abre su calle.',
              fichero: true },
            apertura: { nombre: 'BiPlot HQ, el día que abrió', ceja: 'BiPlot HQ · 25 sep 2026', titulo: 'Así abrió BiPlot HQ',
              texto: 'La primera oficina: el equipo en su muro, la estantería del núcleo, el motor en la pared y una sala por proyecto adentro. Al día siguiente, cada proyecto se fue a su local en la calle.',
              botones: [{ hq: true, texto: 'Pasar a BiPlot HQ' }] },
            plano: { nombre: 'El primer plano', ceja: 'BiPlot HQ · 25 sep 2026', titulo: 'El primer plano de la oficina',
              texto: 'Así se dibujó BiPlot HQ antes de abrir: una oficina donde cada fase del motor tiene su lugar y su gente.',
              botones: [{ hq: true, texto: 'Pasar a BiPlot HQ' }] },
            linea: { nombre: 'Así creció BiPlot', ceja: '2026', titulo: 'Así creció BiPlot',
              texto: 'Las fechas del sitio, del día en que nació biplot.cl a una sala por empresa.',
              hitos: [['8 sep', 'Nace biplot.cl', 'Seis décadas, la misma línea'], ['10 sep', 'Fundos 360', 'el primer caso, en video'], ['15 sep', 'Haru 360', 'llega al portafolio'],
                ['25 sep', 'Abre BiPlot HQ', 'la oficina y su equipo'], ['25 sep', 'Nu Home, Eleven y Rumbo', 'llegan a la oficina'], ['26 sep', 'La calle', 'un local por proyecto'],
                ['28 sep', 'La visita de Plotty', 'en video'], ['29 sep', 'Una sala por empresa', 'cada una en su estilo']] }
          },
          recorrido: [
            { zona: 'recepcion', titulo: 'La entrada', texto: '¡Bienvenido al Archivo! Sigue la línea del piso: parte color papel, como en 1985. Te acompaño.' },
            { zona: 'papel', titulo: '1985 · La libreta', texto: 'Antes de todo esto, había una libreta: planillas a mano y la memoria de una sola persona.' },
            { zona: 'terminal', titulo: '1990 · La terminal', texto: 'Después, el diagnóstico: leer el proceso real, paso a paso, antes de tocar nada.' },
            { zona: 'software', titulo: '1998 · El software', texto: 'Luego llegó el software de caja: una herramienta más que nadie aprendía a usar.' },
            { zona: 'generico', titulo: '2015 · Tres palabras', texto: 'Y las plantillas genéricas: escalable, innovador y centrado en el cliente.' },
            { zona: 'hoy', titulo: 'Hoy · Diez fases', texto: 'Hoy la misma línea pasa por BiPlot HQ: diez fases, con alguien a cargo de cada una.' },
            { zona: 'fundos', titulo: 'Fundos 360', texto: 'El primer caso que llegó al sitio: la escritura, inscrita a nombre de quien compró.' },
            { zona: 'haru', titulo: 'Haru 360', texto: 'En Haru se pide con el QR de la mesa, y la comanda llega a la cocina sin papel.' },
            { zona: 'nuhome', titulo: 'Nu Home 360', texto: 'Un módulo de Nu Home, a escala: así se diseña su casa.' },
            { zona: 'eleven', titulo: 'Eleven 360', texto: 'La huella de Eleven: nuestra propuesta trabaja antes y después de ella.' },
            { zona: 'rumbo', titulo: 'Rumbo', texto: 'Y Rumbo, nuestra app: el elefante crece con tu constancia, hasta ser el Sabio.' },
            { zona: 'tuproyecto', titulo: 'Tu turno', texto: 'Este pedestal está libre. ¿Será tu proyecto la próxima pieza?' }
          ]
        } },
      /* BiPlot.TV, el canal de BiPlot, en un edificio propio en la plaza, junto a BiPlot HQ (su dibujo:
         dibujos/barrio/salas-propias/tv.mjs). Un estudio con su sala de estreno y, al medio, la pantalla del centro, como
         en la NBA: los capítulos animados, la oficina y su equipo, y cada caso en 45 segundos. Cada video sale en horizontal (16:9) y en vertical (9:16): al verlo con sonido
         se elige el que calza con la pantalla. Los dos nuevos están en media/tv/, con los pósters de las pantallas de la
         sala; los demás, donde ya estaban (video: '<id>' usa el del caso). Aby graba en el set y Felipe guía el recorrido:
         lo cuenta como si fuera un partido. Sus frases son de ejemplo hasta que las aprueben. Todo «Ver con sonido» de la
         oficina abre la tele del canal: sus canales son los programas de la cartelera y, al final, su cierre; al terminar
         cada video, Felipe anuncia el siguiente con su frase del recorrido. */
      tv: { nombre: 'BiPlot.TV', sub: 'El canal de BiPlot', etiqueta: 'BiPlot.TV · El canal de BiPlot',
        titulo: 'El canal de BiPlot',
        texto: 'Todos los videos de BiPlot en un solo lugar: los capítulos animados, la oficina y su equipo, y cada caso en 45 segundos. Hoy se estrena «Un bocado a la vez», el capítulo de Rumbo.',
        esencia: 'Los capítulos, la oficina y los casos, en video.',
        salaPropia: {
          marca: { nombre: 'BiPlot.TV', sub: 'EL CANAL DE BIPLOT', texto: 'Los capítulos, la oficina y los casos, en video. Hoy se estrena «Un bocado a la vez».' },
          // Oscura, como una sala de cine: las tarjetas en azul noche, el cian para los botones
          colores: { fondo: '#0B1726', fondo2: '#12375E', tinta: '#F2F4F7', tinta2: '#C9D4DF', oro: '#17C3B2', ceja: '#7FD8CF', cejaBurbuja: '#0B6F66',
            borde: 'rgba(127, 216, 207, .35)', brillo: '23, 195, 178', sub: '#7FD8CF', pie: '#8FA3B8', velo: 'rgba(255, 255, 255, .08)', hover: '#3FD3C4',
            boton: '#17C3B2', botonTinta: '#062B27', botonPunto: '#062B27' },
          fuente: { familia: "'Space Grotesk', 'DejaVu Sans', sans-serif", peso: 700, espacio: '-.01em', titulo: '25px', sub: "700 10.5px/1.4 'Space Mono', monospace" },
          textos: { recorrer: 'Recorrer con Felipe', recorrido: 'Recorrido con Felipe', guia: 'Felipe · El rostro' },
          barra: [{ tele: true, texto: 'Prender la tele' }, 'recorrer'],
          guia: 'felipe',
          whatsapp: null,
          burbujas: [
            { quien: 'felipe', nombre: 'Felipe, de BiPlot', rol: 'Felipe · El rostro', texto: '¡Bienvenido a BiPlot.TV! Hoy hay estreno. Pásala, que yo la cuento.', biplot: true },
            { quien: 'aby', nombre: 'Aby, de BiPlot', rol: 'Aby · La corresponsal', texto: 'Estamos al aire. Yo pregunto lo que todos se preguntan.', biplot: true },
            { quien: 'tvConsola', nombre: 'El de la consola', rol: 'Programación', texto: 'Tres, dos, uno… ¡al aire!' },
            { quien: 'nino', nombre: 'Un niño junto a la cámara', rol: '', texto: '¡Mamá, salgo en la tele!' },
            { quien: 'tvCabritas', nombre: 'Una visitante con cabritas', rol: 'Visita', texto: 'Yo me quedo para el estreno.' },
            { quien: 'tvReel', nombre: 'Una visitante en el aro de luz', rol: 'Visita', texto: '¡Hola! Te saludo desde BiPlot.TV.' },
            { quien: 'tvFoto', nombre: 'Una visitante con su cámara', rol: 'Visita', texto: 'Una foto del set, para el recuerdo.' }
          ],
          zonas: {
            cartelera: { nombre: 'La cartelera', ceja: 'BiPlot.TV · Programación', titulo: 'Toda la programación',
              texto: 'Siete videos, y cada uno sale en horizontal y en vertical. Toca uno para verlo con sonido, o prende la tele y cambia de canal. Vienen más capítulos.',
              // Los canales de la tele, en este orden (del 01 en adelante): primero BiPlot (quiénes somos, la oficina y la
              // visita de Plotty), después los casos y al final los capítulos, el más nuevo justo antes de «Tu proyecto».
              // Un video nuevo es una línea más aquí
              programas: ['teaser', 'equipo', 'visita', 'fundos', 'haru', 'nuhome', 'estreno'],
              // El último canal de la tele, después de la programación: tu proyecto, que todavía no sale al aire
              cierre: { nombre: 'Tu proyecto', ceja: 'Próximamente', titulo: 'Este canal todavía no sale al aire',
                texto: 'Los capítulos cuentan cómo trabaja BiPlot, caso por caso. El próximo puede ser el tuyo: todo empieza con un diagnóstico, y la primera sesión es sin costo.',
                relato: 'El próximo capítulo puede ser el tuyo. ¿Entras a la cancha?' },
              botones: [{ tele: true, texto: 'Prender la tele' }, 'recorrer'] },
            estreno: { nombre: 'Un bocado a la vez', ceja: 'Estreno · Rumbo', titulo: '¿Cómo te comes un elefante?', duracion: '0:50', pantalla: 'estreno',
              texto: 'Una muchacha sueña con llegar a la cumbre del cerro, pero no se puede ni levantar del sofá. Abre Rumbo y del celular sale una cría de elefante que le marca el camino, un punto por día. El elefante crece con su constancia, de Cría a Sabio, hasta que llegan juntos arriba. En clave de rock de estadio.',
              chips: ['Capítulo', '0:50', '16:9 y 9:16'],
              video: { h: 'media/tv/un-bocado-a-la-vez-h.mp4', v: 'media/tv/un-bocado-a-la-vez-v.mp4', poster: 'media/tv/un-bocado-a-la-vez-h.jpg' },
              botones: [{ url: 'https://rumbo.biplot.cl', texto: 'Descargar Rumbo' }, { sala: 'rumbo', texto: 'Entrar a la sala de Rumbo' }] },
            equipo: { nombre: 'Pasa, la oficina está abierta', ceja: 'BiPlot HQ · El equipo', titulo: 'Conoce al equipo de la oficina', duracion: '1:25', pantalla: 'equipo',
              texto: 'Abre con el problema de siempre (planillas, chats y tareas repetidas). Después se abre la oficina, de noche, y aparecen once personajes, uno por uno, cada uno con su frase. Pasa por el motor de diez fases y termina con el equipo completo.',
              chips: ['BiPlot', '1:25', '16:9 y 9:16'],
              video: { h: 'media/tv/teaser-equipo-h.mp4', v: 'media/tv/teaser-equipo-v.mp4', poster: 'media/tv/teaser-equipo-h.jpg' },
              botones: [{ hq: true, texto: 'Pasar a BiPlot HQ' }] },
            visita: { nombre: 'La visita de Plotty', ceja: 'BiPlot HQ · La visita', titulo: 'Plotty te muestra la oficina', duracion: '1:19', pantalla: 'visita',
              texto: 'Plotty recorre BiPlot HQ, una parada por parte del trabajo, y sale a la calle: cada proyecto se muda al barrio con su local y su sala. Y después de la entrega seguimos: soporte, sistemas al día y la medición a los 30, 60 y 90 días.',
              chips: ['BiPlot', '1:19', '16:9 y 9:16'],
              video: { h: '../assets/oficina/visita-plotty-h.mp4', v: '../assets/oficina/visita-plotty-v.mp4', poster: '../assets/oficina/visita-plotty-h.jpg' },
              botones: [{ hq: true, texto: 'Pasar a BiPlot HQ' }] },
            teaser: { nombre: 'BiPlot en 30 segundos', ceja: 'BiPlot · El teaser', titulo: 'Planillas. Chats. Copiar y pegar.', duracion: '0:30', pantalla: 'teaser',
              texto: 'Así opera la mayoría de las pymes. En 30 segundos: primero entendemos tu negocio, después elegimos lo justo (a veces la respuesta no es más software) y todo tu proceso queda conectado, de punta a punta.',
              chips: ['BiPlot', '0:30', '16:9 y 9:16'],
              video: { h: '../assets/casos/teaser-biplot-h.mp4', v: '../assets/casos/teaser-biplot-v.mp4', poster: '../assets/casos/teaser-biplot-h.jpg' },
              botones: [{ chat: true }] },
            fundos: { nombre: 'Fundos 360', ceja: 'Caso · Fundos 360', titulo: 'Del primer llamado a la escritura', duracion: '0:45', pantalla: 'fundos',
              texto: 'El sistema de Fundos en 45 segundos: cada contacto con su seguimiento, el inventario fundo por fundo, la reserva sin calculadora, cada plazo de la escritura a tiempo y la posventa hasta el Conservador. Todo el negocio, en una pantalla.',
              chips: ['Caso', '0:45', '16:9 y 9:16'], video: 'fundos',
              botones: [{ sala: 'fundos', texto: 'Entrar a su sala' }] },
            haru: { nombre: 'Haru 360', ceja: 'Caso · Haru 360', titulo: 'El restaurante en una pantalla', duracion: '0:45', pantalla: 'haru',
              texto: 'El sistema de Haru en 45 segundos: cada mesa en tiempo real, las comandas sin papel, el costo real de cada plato, la rentabilidad por canal y por plato, y el delivery en vivo.',
              chips: ['Caso', '0:45', '16:9 y 9:16'], video: 'haru',
              botones: [{ sala: 'haru', texto: 'Entrar a su sala' }] },
            nuhome: { nombre: 'Nu Home 360', ceja: 'Caso · Nu Home 360', titulo: 'De la maqueta a la llave', duracion: '0:46', pantalla: 'nuhome',
              texto: 'El sistema de Nu Home en 45 segundos: la casa se diseña pieza por pieza, la cotización llega directo al CRM, la visita técnica revisa el terreno y un solo sistema acompaña a ventas, a la fábrica y a cada cliente.',
              chips: ['Caso', '0:46', '16:9 y 9:16'], video: 'nuhome',
              botones: [{ sala: 'nuhome', texto: 'Entrar a su sala' }] },
            set: { nombre: 'El set', ceja: 'BiPlot.TV · El set', titulo: 'Aquí graban Aby y Felipe',
              texto: 'La pared con la marca del canal, el escritorio, dos focos y dos cámaras. Aby pregunta lo que todos se preguntan y Felipe cuenta lo que hace el equipo como si fuera un partido: quién pasó la pelota, quién la metió y cuánto falta para el final.',
              chips: ['Aby · La corresponsal', 'Felipe · El rostro'],
              botones: [{ hq: true, texto: 'Pasar a BiPlot HQ' }] },
            marcador: { nombre: 'La pantalla del centro', ceja: 'BiPlot.TV · Como en la NBA', titulo: 'Las mejores jugadas, al centro de la cancha',
              texto: 'Cuelga sobre el medio del estudio, como en la NBA: cuatro pantallas, los anillos de luces y el marcador. Pasa las repeticiones del canal, una tras otra. En el marcador, BiPlot.TV juega de local; la visita es tu proyecto, que todavía no entra a la cancha.',
              botones: [{ tele: true, texto: 'Prender la tele' }, { zona: 'cartelera', texto: 'Toda la programación' }] },
            guion: { nombre: 'Así se hace un capítulo', ceja: 'BiPlot.TV · El guion', titulo: 'Tres pasos, y cada uno se aprueba',
              texto: 'Primero, el guion y el look: la historia compás por compás, el elenco y seis cuadros clave. Después, la animación con su música, cuadro a cuadro, dibujada y compuesta por código. Al final, los dos formatos: horizontal para la web y LinkedIn, vertical para Reels, TikTok y estados.' },
            camarin: { nombre: 'El camarín', ceja: 'Tu turno', titulo: 'El próximo capítulo puede ser el tuyo',
              texto: 'El camarín espera al próximo invitado. Los capítulos cuentan cómo trabaja BiPlot, caso por caso, y el próximo puede ser el tuyo. Todo empieza con un diagnóstico, y la primera sesión es sin costo.',
              botones: [{ cta: true }, { chat: true }] }
          },
          recorrido: [
            { zona: 'cartelera', titulo: 'La cartelera', texto: '¡Bienvenido a BiPlot.TV! Hoy hay estreno. Pásala, que yo la cuento.' },
            { zona: 'estreno', titulo: 'El estreno', texto: 'En pantalla grande, Un bocado a la vez: del sofá a la cumbre, punto por punto. ¡Triple sobre la bocina!' },
            { zona: 'set', titulo: 'El set', texto: 'Aquí grabamos con Aby. Ella pregunta, yo relato.' },
            { zona: 'marcador', titulo: 'La pantalla del centro', texto: '¡Miren arriba! Las mejores jugadas del canal, una tras otra. De local, BiPlot.TV; de visita, tu proyecto.' },
            { zona: 'guion', titulo: 'Así se hace un capítulo', texto: 'Un capítulo se juega en tres tiempos: guion y look, animación con su música, y al aire.' },
            { zona: 'teaser', titulo: 'BiPlot en 30 segundos', texto: 'De las planillas al sistema en treinta segundos. Contraataque.' },
            { zona: 'equipo', titulo: 'El equipo', texto: 'El equipo completo, uno por uno, cada cual con su frase. La alineación titular.' },
            { zona: 'visita', titulo: 'La visita de Plotty', texto: 'Plotty recorre la oficina y sale a la calle. Una asistencia de cancha completa.' },
            { zona: 'fundos', titulo: 'Fundos 360', texto: 'Fundos: del primer llamado a la escritura, sin perder la pelota.' },
            { zona: 'haru', titulo: 'Haru 360', texto: 'Haru: cada mesa en tiempo real y la comanda en la cocina, sin papel.' },
            { zona: 'nuhome', titulo: 'Nu Home 360', texto: 'Nu Home: de la maqueta a la llave, en una sola jugada.' },
            { zona: 'camarin', titulo: 'Tu turno', texto: 'Y el camarín espera al próximo invitado. ¿Entras a la cancha?' }
          ]
        } },
      estanteria: { nombre: 'Estantería del núcleo', sub: 'Pepa · E9', etiqueta: 'Estantería del núcleo · E9',
        titulo: 'Lo que ya sabemos hacer',
        texto: 'Aquí Pepa guarda lo que sirvió en un proyecto y le sirve al siguiente. Por eso cada sistema nuevo parte con ventaja.' },
      muro: { nombre: 'Muro del equipo', sub: 'Los once, con su placa', etiqueta: 'Muro del equipo',
        titulo: 'El equipo',
        texto: 'Once integrantes, uno por parte del trabajo. Los reconoces por su placa: la fase del motor que llevan, o PRENSA, la de Aby y Felipe.' },
      'puerta-404': { nombre: 'Puerta 404', sub: 'No se abre', etiqueta: 'Puerta 404',
        titulo: 'Esta puerta no se abre',
        texto: 'Nadie dice qué hay detrás. Si alguien lo sabe, tampoco lo va a decir.',
        golpes: ['Nadie contesta.', 'Se oye un teclado. Después, silencio.', 'Una voz pregunta: «¿Quién es?».', 'Alguien apaga la luz de adentro.'] }
    },

    /* Los proyectos: un local en el barrio y, adentro, la sala de la empresa. `calle` es su rubro (los mismos de la primera
       pregunta de Plotty). Los que tienen sala dibujada a mano (barrio.js) van en la calle principal; los demás, en la
       calle de su rubro, con una plantilla. `media` usa los teasers del sitio. `pines`: un punto por módulo en la sala,
       [módulo, título, detalle, pantalla en media/salas/ o null]. `medicion` dice en qué va la medición (sin cifras
       hasta que se midan y el cliente lo autorice). El local `libre` es el que espera al próximo proyecto.
       `salaPropia` cambia su sala: sin números ni panel, como su propia casa (ver el bloque de Nu Home, el primero).
       Un caso nuevo con plantilla, mientras el CRM no esté conectado, se suma aquí con este formato:
         { id, nombre, cliente, rubro: 'Clínica dental · Arica', calle: 'salud', plantilla: 'clinica' | 'taller' | 'basica',
           fase: 'E0'…'E9' (cómo se ve el local), permiso: 'nombre' | 'rubro' (sólo el rubro) | 'archivo' (sólo en El Archivo),
           acento: '#3E9C95', letrero, lema y lineas (plantilla basica), esencia, resumen, puntos, enlaces, equipo } */
    proyectos: [
      {
        id: 'fundos', nombre: 'Fundos 360', cliente: 'Fundos Inmobiliaria', rubro: 'Inmobiliaria · venta de parcelas', estado: 'Plataforma a la medida',
        calle: 'inmobiliaria', corto: 'A la medida',
        pines: [
          ['01 · Leads', 'Cada contacto, con seguimiento.', 'Del primer llamado a la visita y la reserva, en un tablero.', 'fundos-1-leads'],
          ['03 · Parcelas', 'El inventario, fundo por fundo.', 'Precio y estado de cada lote, con su vendedor asignado.', 'fundos-2-parcelas'],
          ['05 · Reservas', 'Reservar, sin calculadora.', 'Valor, promoción y reserva en una sola ficha.', 'fundos-3-reservas'],
          ['06 · Escrituras y calendario', 'Cada plazo, a tiempo.', 'Cuotas, firmas y entregas de cada escritura, en un calendario.', 'fundos-4-escrituras'],
          ['10 · Postventa', 'Hasta el Conservador.', 'Aranceles e inscripción de cada parcela después de escriturar.', 'fundos-5-postventa'],
          ['02 · Dashboard', 'El negocio, en una pantalla.', 'Comercial, inventario, financiero y postventa, en claro u oscuro.', 'fundos-6-dashboard'],
          ['La plataforma', 'Doce módulos. Un solo recorrido.', 'Del primer contacto comercial a la inscripción en el Conservador.', 'fundos-7-modulos']
        ],
        medicion: 'Sin cifras publicadas todavía. Aparecen cuando se midan contra la línea base del diagnóstico y Fundos lo autorice.',
        acento: '#6FAF6B',
        esencia: 'Una sala de ventas de parcelas, con el terreno sobre la mesa.',
        resumen: 'Un ciclo de venta largo —contacto, reserva, escritura, facturación al inversionista, posventa y comisiones— vivía repartido entre planillas, WhatsApp y papel. Fundos 360 lo digitaliza completo, con permisos por rol.',
        puntos: [
          ['Ciclo completo', 'contactos, escrituras y comisiones conectados'],
          ['Por rol', 'lo financiero lo ve sólo quien corresponde'],
          ['Multiproyecto', 'un fundo o varios, en la misma plataforma']
        ],
        enlaces: [],
        equipo: ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle', 'tamandua', 'faro', 'pepa'],
        media: { h: '../assets/casos/fundos-360-h.mp4', v: '../assets/casos/fundos-360-v.mp4', poster: '../assets/casos/fundos-360-h.jpg' },
        nota: 'Pantallas ilustrativas con datos de ejemplo.',
        /* Sala propia: su sala de ventas de parcelas, sin números (ver la de Nu Home). TEXTOS DE EJEMPLO hasta que Fundos
           los apruebe; lotes y precios, los referenciales de la propuesta de su sitio. Su gente va sin nombre. */
        salaPropia: {
          textosDeEjemplo: true,
          marca: { nombre: 'Fundos', sub: 'INMOBILIARIA', texto: 'Parcelas de 5.000 m² en la cordillera, el valle y el lago. Recorre la sala y elige tu lote.' },
          colores: { fondo: '#0F1F16', fondo2: '#1B3526', tinta: '#F7F5F0', tinta2: 'rgba(247,245,240,.82)', oro: '#C8A165', ceja: '#D8B982', cejaBurbuja: '#7A5D33',
            borde: 'rgba(200,161,101,.45)', brillo: '216, 185, 130', sub: '#D8B982', pie: 'rgba(247,245,240,.6)', velo: 'rgba(255,255,255,.08)', hover: '#D8B982',
            boton: '#C8A165', botonTinta: '#0F1F16', botonPunto: '#0F1F16' },
          fuente: { espacio: '.02em', titulo: '31px', sub: "600 10px/1.4 'Space Grotesk', sans-serif" },
          textos: { recorrer: 'Recorrer con una ejecutiva', hablar: 'Hablar con una ejecutiva', recorrido: 'Recorrido con una ejecutiva', guia: 'Ejecutiva · Fundos' },
          disenar: { texto: 'Ver los proyectos', url: 'https://biplot.cl/propuestas/fundos-inmobiliaria/' },
          guia: 'fdGuia2',
          // Pendiente: el WhatsApp de su equipo (en la propuesta de su sitio todavía es uno de ejemplo)
          whatsapp: null,
          mensaje: 'Hola Fundos, vi su sala en la oficina de BiPlot y quiero conocer sus parcelas.',
          burbujas: [
            { quien: 'fdRecepcion', nombre: 'La ejecutiva de la recepción', rol: 'Ejecutiva · Fundos', texto: '¡Hola! ¿Cordillera, valle o lago?' },
            { quien: 'fdMaqueta', nombre: 'La ejecutiva de la maqueta', rol: 'Ejecutiva · Fundos', texto: 'Este es Puerto Varas: bosque nativo y un estero que cruza el predio.' },
            { quien: 'fdGuia', nombre: 'El ejecutivo del mirador', rol: 'Ejecutivo · Fundos', texto: 'Mira alrededor: así se ve el río Lolén.' },
            { quien: 'fdFirma', nombre: 'La ejecutiva de la firma', rol: 'Ejecutiva · Fundos', texto: 'Firmamos la escritura y después la inscribimos a tu nombre.' },
            { quien: 'fdCompradora', nombre: 'Una compradora con su celular', rol: 'Compradora', texto: 'Sigo mi compra desde el celular.' },
            { quien: 'nino', nombre: 'Un niño junto a la maqueta', rol: '', texto: '¡Aquí hay un río!' },
            { quien: 'celda', nombre: 'Celda, de BiPlot', rol: 'Celda · BiPlot', texto: 'Fundos 360 es la plataforma que hicimos con Fundos para seguir cada venta. ¿Te cuento cómo?', biplot: true }
          ],
          zonas: {
            recepcion: { nombre: 'Recepción', ceja: 'Recepción', titulo: 'Bienvenido a Fundos', texto: 'Una ejecutiva te recibe y te acompaña a recorrer la sala: los paisajes, la maqueta y el camino de la compra, de la reserva a la inscripción.', botones: ['recorrer', 'disenar', 'hablar'] },
            valores: { nombre: 'Sus valores', ceja: 'Sus valores', titulo: 'Transparencia, cercanía, innovación y confianza', texto: 'Los valores de su sitio, como un letrero de sendero en la entrada.' },
            mirador: { nombre: 'Mirador 360°', ceja: 'Mirador 360°', titulo: 'Camina el terreno antes de viajar', texto: 'La pantalla envuelve el rincón con el río Lolén, en Malalcahuello: su recorrido virtual, hecho lugar.', botones: ['disenar'] },
            malalcahuello: { nombre: 'Malalcahuello', ceja: 'La Araucanía · Cordillera', titulo: 'Malalcahuello', texto: 'Bosque nativo, volcanes y el río Lolén. Nieve en invierno; pesca, senderos y termas el resto del año.', chips: ['Parcelas de 5.000 m²', 'Frente al río Lolén'], botones: ['disenar'] },
            marchigue: { nombre: 'Marchigüe', ceja: "O'Higgins · Valle de Colchagua", titulo: 'Marchigüe', texto: 'Lomajes suaves, viñedos y cielos despejados. Clima templado todo el año, a unos 40 minutos de Pichilemu.', chips: ['Parcelas de 5.000 m²', 'Zona vitivinícola'], botones: ['disenar'] },
            'puerto-varas': { nombre: 'Puerto Varas', ceja: 'Los Lagos · Entre mar y lago', titulo: 'Puerto Varas', texto: 'Bosque nativo atravesado por un estero, con camino principal y caminos interiores. Puerto Montt y el aeropuerto, a unos 20 km.', chips: ['Parcelas de 5.000 m²', 'Estero en el predio'], botones: ['disenar'] },
            salon: { nombre: 'Salón', ceja: 'Salón', titulo: 'El sur, con calma', texto: 'La estufa a leña, un mate y el perro echado: así se conversa con tu ejecutiva, sin apuro.' },
            maqueta: { nombre: 'Maqueta de Puerto Varas', ceja: 'Maqueta', titulo: 'El predio sobre la mesa', texto: 'Bosque nativo, el estero y cada lote con el color de su precio, como en su plano. La banderita marca el lote 25.', imagen: 'fundos-2-parcelas', botones: ['disenar'] },
            lote25: { nombre: 'Lote 25', ceja: 'Puerto Varas · Los Lagos', titulo: 'Lote 25', texto: 'Reserva con $1.000.000 y recibe el comprobante y los antecedentes del lote. Te acompañamos hasta la inscripción en el Conservador. Valores referenciales, sujetos a disponibilidad.', chips: ['5.000 m²', '$35.990.000', 'Disponible'], enlace: { texto: 'Verlo en el plano', url: 'https://biplot.cl/propuestas/fundos-inmobiliaria/#lote-puerto-varas-25' } },
            equipo: { nombre: 'El equipo', ceja: 'El equipo', titulo: 'Detrás de cada venta hay personas', texto: 'En los escritorios se reserva y se validan los antecedentes, con Fundos 360 en las pantallas.', imagen: 'fundos-3-reservas' },
            firma: { nombre: 'Firma e inscripción', ceja: 'Firma e inscripción', titulo: 'El día que la tierra es tuya', texto: 'Se firma la escritura y se inscribe en el Conservador: «Inscrita a tu nombre». Ahí termina la huella de bronce.', imagen: 'fundos-4-escrituras' },
            micompra: { nombre: 'Tu compra en el celular', ceja: 'Tu compra', titulo: 'Paso a paso, hasta el Conservador', texto: 'Aranceles e inscripción de cada parcela después de escriturar, a la vista.', imagen: 'fundos-5-postventa' },
            biplot: { nombre: 'Rincón de BiPlot', ceja: 'Hecho con BiPlot', titulo: 'Fundos 360', biplot: true }
          },
          recorrido: [
            { zona: 'recepcion', titulo: 'La entrada', ver: ['valores'], texto: '¡Hola! Te acompaño. Comprar una parcela tiene su orden, y aquí es un recorrido.' },
            { zona: 'mirador', titulo: 'El mirador 360°', texto: 'Aquí caminas el terreno antes de viajar: el río Lolén, en Malalcahuello.' },
            { zona: 'marchigue', titulo: 'Tres paisajes', ver: ['malalcahuello', 'puerto-varas'], texto: 'Cordillera, valle o lago: Malalcahuello, Marchigüe y Puerto Varas.' },
            { zona: 'maqueta', titulo: 'La maqueta', ver: ['lote25'], texto: 'Este es el predio de Puerto Varas. El lote 25 está disponible: toca su banderita.' },
            { zona: 'equipo', titulo: 'El equipo', texto: 'Aquí reservas y validamos tus antecedentes, con Fundos 360.' },
            { zona: 'firma', titulo: 'La firma', texto: 'Firmamos la escritura y la inscribimos a tu nombre en el Conservador.' },
            { zona: 'biplot', titulo: 'El rincón de BiPlot', texto: 'Este rincón es de BiPlot, que hizo con nosotros Fundos 360 para seguir cada venta.' }
          ]
        }
      },
      {
        id: 'haru', nombre: 'Haru 360', cliente: 'Haru Isidora', rubro: 'Restaurante · cocina japonesa, Arica', estado: 'Sistema a la medida · en implementación',
        calle: 'comida', corto: 'En implementación',
        pines: [
          ['01 · Dashboard', 'Tu restaurante, en una pantalla.', 'Ventas, costo, margen y alertas del día, en vivo.', 'haru-1-dashboard'],
          ['02 · Mesas y comandas', 'Cada mesa, en tiempo real.', 'El garzón toma el pedido en su celular y la cocina lo recibe al instante.', 'haru-2-mesas'],
          ['03 · Cocina y barra', 'Comandas sin papel.', 'Cada plato con su cronómetro y alerta de atraso.', 'haru-3-comandas'],
          ['04 · Inventario y recetas', 'El costo real de cada plato.', 'Escandallos con merma, stock mínimo y compras.', 'haru-4-costo'],
          ['05 · Finanzas', 'Rentabilidad por canal y por plato.', 'Comisiones de apps, propinas y arqueo de caja.', 'haru-5-rentabilidad'],
          ['06 · Carta y delivery', 'Pedidos directos, delivery en vivo.', 'Carta online sin comisiones y el repartidor en el mapa.', 'haru-6-delivery'],
          ['07 · Perfiles', 'Cada rol ve lo suyo.', 'Del dueño al repartidor, con tema claro y oscuro.', 'haru-7-perfiles']
        ],
        medicion: 'La medición parte con la puesta en marcha: día 30, 60 y 90, contra la línea base del diagnóstico.',
        acento: '#E0524A',
        esencia: 'Una barra de sushi a la hora de almuerzo.',
        resumen: 'Caja, máquinas de pago, apps de delivery y una planilla a mano: los totales no cuadraban y nadie sabía el costo real de cada plato. Haru 360 junta ventas, cocina, delivery, bodega y caja. Y la carta digital deja pedir desde la mesa con un QR.',
        puntos: [
          ['Todo en uno', 'ventas, cocina, delivery, bodega y caja'],
          ['Costo por plato', 'el margen real por producto y por canal'],
          ['Carta con QR', 'se pide desde la mesa o para retiro']
        ],
        enlaces: [{ texto: 'Ver la carta digital', url: 'https://haru-carta.vercel.app' }],
        equipo: ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle', 'tamandua', 'faro'],
        media: { h: '../assets/casos/haru-360-h.mp4', v: '../assets/casos/haru-360-v.mp4', poster: '../assets/casos/haru-360-h.jpg' },
        nota: 'Las cifras del video son ilustrativas: salen del generador de datos de prueba.',
        /* Sala propia: su restaurante, sin números (ver la de Nu Home). TEXTOS DE EJEMPLO hasta que Haru los apruebe; los
           rolls y precios, los de su carta digital. Su equipo va sin nombre. */
        salaPropia: {
          textosDeEjemplo: true,
          marca: { nombre: 'Haru Isidora', sub: 'SUSHI DE AUTOR · ARICA', texto: 'Rolls de autor, barra, salón y terraza. Pide desde la mesa, para retiro o delivery.' },
          colores: { fondo: '#15120F', fondo2: '#1F1B16', tinta: '#F3EDE1', tinta2: '#CFC5B3', oro: '#E0482F', ceja: '#C9A24E', cejaBurbuja: '#B93620',
            borde: 'rgba(201,162,78,.4)', brillo: '224, 72, 47', sub: '#C9A24E', pie: '#958B7B', velo: 'rgba(255,255,255,.08)', hover: '#C93A22',
            boton: '#E0482F', botonTinta: '#FFFFFF', botonPunto: '#FFFFFF' },
          fuente: { familia: "Montserrat, 'DejaVu Sans', sans-serif", peso: 800, espacio: '.01em', titulo: '26px', sub: "700 10px/1.4 Montserrat, sans-serif" },
          textos: { recorrer: 'Recorrer con la anfitriona', hablar: 'Escribir a Haru', recorrido: 'Recorrido con la anfitriona', guia: 'Anfitriona · Haru' },
          disenar: { texto: 'Ver la carta', url: 'https://haru-carta.vercel.app' },
          guia: 'hrGuia',
          // Pendiente: el WhatsApp oficial de Haru (en la carta digital todavía es uno de ejemplo)
          whatsapp: null,
          mensaje: 'Hola Haru, vi su local en la oficina de BiPlot y quiero hacer un pedido.',
          burbujas: [
            { quien: 'hrAnfitriona', nombre: 'La anfitriona de la entrada', rol: 'Anfitriona · Haru', texto: '¡Bienvenidos a Haru! ¿Barra, salón o terraza?' },
            { quien: 'hrItamae2', nombre: 'La itamae de la barra', rol: 'Itamae · Haru', texto: 'Hoy el Chinchorrero sale con mariscos salteados al estilo nikkei.' },
            { quien: 'garzon', nombre: 'El garzón del salón', rol: 'Garzón · Haru', texto: 'La carta está en el QR de la mesa. Pidan cuando quieran.' },
            { quien: 'cajera', nombre: 'La cajera del retiro', rol: 'Cajera · Haru', texto: '¡Pedido para retiro listo!' },
            { quien: 'barman', nombre: 'El barman', rol: 'Barman · Haru', texto: '¿Algo de la barra mientras esperan?' },
            { quien: 'jefacocina', nombre: 'La jefa de cocina', rol: 'Cocina · Haru', texto: 'La comanda de la mesa cuatro ya está en pantalla.' },
            { quien: 'faro', nombre: 'Faro, de BiPlot', rol: 'Faro · BiPlot', texto: 'Haru 360 junta la caja, la cocina, el delivery y la bodega. ¿Te muestro cómo llega una comanda?', biplot: true }
          ],
          zonas: {
            recepcion: { nombre: 'La entrada', ceja: 'La entrada', titulo: 'Bienvenidos a Haru', texto: 'La anfitriona te recibe bajo el noren y te lleva a la barra, al salón o a la terraza.', botones: ['recorrer', 'disenar', 'hablar'] },
            barra: { nombre: 'Barra de sushi', ceja: 'La barra de sushi', titulo: 'Chinchorrero', texto: 'Camarón furay, queso crema y palta, apanado en chicharrón, bañado en salsa olivo y mariscos salteados al estilo nikkei.', chips: ['$8.000', 'Rolls de autor'], botones: ['disenar'] },
            carta: { nombre: 'Rolls de la casa', ceja: 'La pizarra', titulo: 'Rolls de la casa', texto: 'Teo Roll, Acevichado, Chinchorrero, Azapa, Payachata y Mangojito, con sus precios, en la carta digital.', chips: ['Desde $7.000'], botones: ['disenar'] },
            cocina: { nombre: 'Cocina', ceja: 'La cocina', titulo: 'Comandas sin papel', texto: 'Cada plato llega a la pantalla de la cocina con su cronómetro y su alerta de atraso.', imagen: 'haru-3-comandas' },
            salon: { nombre: 'Salón', ceja: 'El salón', titulo: 'Se pide desde la mesa', texto: 'En cada mesa, el QR de la carta digital: se elige, se pide y llega a la cocina.', imagen: 'haru-2-mesas', botones: ['disenar'] },
            bar: { nombre: 'Bar', ceja: 'El bar', titulo: 'Bar y coctelería', texto: 'Tragos, vinos y bebidas para acompañar los rolls. Venta de alcohol solo a mayores de 18 años.' },
            terraza: { nombre: 'Terraza', ceja: 'La terraza', titulo: 'Afuera, bajo los quitasoles', texto: 'Madera, quitasoles, palmeras y caña: la atención en terraza de su local.' },
            delivery: { nombre: 'Retiro y delivery', ceja: 'Retiro y delivery', titulo: 'Pedidos directos, delivery en vivo', texto: 'La carta online sin comisiones y el repartidor en el mapa. También para retiro en el local.', imagen: 'haru-6-delivery', botones: ['disenar'] },
            caja: { nombre: 'Caja', ceja: 'La caja', titulo: 'El día, en una pantalla', texto: 'Ventas, costo, margen y alertas del día, en vivo, desde la caja.', imagen: 'haru-1-dashboard' },
            biplot: { nombre: 'Rincón de BiPlot', ceja: 'Hecho con BiPlot', titulo: 'Haru 360', biplot: true }
          },
          recorrido: [
            { zona: 'recepcion', titulo: 'La entrada', ver: ['caja'], texto: '¡Bienvenidos! Los acompaño. Partimos por la barra de sushi.' },
            { zona: 'barra', titulo: 'La barra de sushi', ver: ['carta'], texto: 'Aquí trabajan los itamaes. En la pizarra, los rolls de la casa.' },
            { zona: 'cocina', titulo: 'La cocina', texto: 'La cocina está a la vista: las comandas llegan a la pantalla, sin papel.' },
            { zona: 'salon', titulo: 'El salón', ver: ['bar'], texto: 'En cada mesa está el QR de la carta. Al fondo, el bar.' },
            { zona: 'terraza', titulo: 'La terraza', texto: 'Y afuera, la terraza, bajo los quitasoles.' },
            { zona: 'delivery', titulo: 'Retiro y delivery', texto: 'Por aquí salen los pedidos para retiro y delivery, directo desde la carta.' },
            { zona: 'biplot', titulo: 'El rincón de BiPlot', texto: 'Este rincón es de BiPlot, que puso en marcha con nosotros Haru 360.' }
          ]
        }
      },
      {
        id: 'eleven', nombre: 'Eleven 360', cliente: 'Eleven Club Fitness and BXO', rubro: 'Gimnasio, Arica', estado: 'Propuesta',
        calle: 'servicios', corto: 'Propuesta',
        pines: [
          ['Sitio al día', 'Planes, horarios y clases.', 'Desde un solo archivo, siempre al día.', null],
          ['Rescate de socios', 'Aviso a tiempo.', 'Quién dejó de venir, antes de que se vaya.', null],
          ['Tienda y ficha', 'Lo que compra afuera, adentro.', 'La tienda y la ficha de cada socio, juntas.', null],
          ['Antes y después de la huella', 'No reemplaza su acceso.', 'Se conecta a su lector de huella de siempre.', null]
        ],
        medicion: 'Es una propuesta: todavía no hay nada que medir.',
        acento: '#17C3B2',
        esencia: 'Un gimnasio con las clases llenas y el acceso con huella.',
        resumen: 'Sitio y experiencia digital para un gimnasio. La idea: más socios, que se queden y que vuelvan por más. No reemplaza su sistema de acceso con huella: se conecta a él y trabaja antes y después de la huella.',
        puntos: [
          ['Sitio al día', 'planes, horarios y clases desde un solo archivo'],
          ['Rescate de socios', 'aviso a tiempo de quien deja de venir'],
          ['Tienda y ficha', 'lo que el socio compra afuera, adentro']
        ],
        enlaces: [{ texto: 'Ver el sitio', url: 'https://eleven-360.vercel.app' }],
        equipo: ['lupe', 'architect', 'grilla', 'bucle', 'tamandua'],
        media: null,
        nota: 'Horario y cupos de ejemplo.',
        /* Sala propia: su club, sin números (ver la de Nu Home). TEXTOS DE EJEMPLO hasta que Eleven los apruebe; clases,
           horarios, planes y cifras, los de su sitio (septiembre de 2026). Su team va sin nombre. */
        salaPropia: {
          textosDeEjemplo: true,
          cejaBiplot: 'Propuesta de BiPlot',
          marca: { nombre: 'Eleven Club', sub: 'FITNESS AND BXO', texto: 'Peso libre, fuerza, cardio y 240 m² de clases, abierto los 7 días en Arica.' },
          colores: { fondo: '#0B0B0B', fondo2: '#1A1A1A', tinta: '#F2EDE5', tinta2: '#CFC8BE', oro: '#FF6600', ceja: '#FF8A1F', cejaBurbuja: '#CC5200',
            borde: 'rgba(255,102,0,.4)', brillo: '255, 102, 0', sub: '#B8B2AA', pie: '#8F877D', velo: 'rgba(255,255,255,.08)', hover: '#FF8A1F',
            boton: '#FF6600', botonTinta: '#0B0B0B', botonPunto: '#0B0B0B' },
          fuente: { familia: "Anton, Impact, 'Arial Narrow', sans-serif", peso: 400, espacio: '.04em', caja: 'uppercase', titulo: '34px', sub: "700 10px/1.4 'Chakra Petch', sans-serif" },
          textos: { recorrer: 'Recorrer con un coach', hablar: 'Escribir al club', recorrido: 'Recorrido con un coach', guia: 'Coach · Eleven' },
          disenar: { texto: 'Ver planes', url: 'https://eleven-360.vercel.app/#planes' },
          guia: 'elGuia',
          // Sin WhatsApp: la sala se muestra con la propuesta, antes de conectar a nadie con el club
          whatsapp: null,
          mensaje: 'Hola Eleven, vi su club en la oficina de BiPlot y quiero conocer los planes.',
          burbujas: [
            { quien: 'elRecepcion', nombre: 'La recepcionista', rol: 'Recepción · Eleven', texto: '¡Hola! ¿Vienes a conocer el club? El pase diario es de $4.000.' },
            { quien: 'elCoach', nombre: 'El coach de la asesoría', rol: 'Coach · Eleven', texto: 'Armamos tu plan según tu objetivo y vemos tu progreso cada semana.' },
            { quien: 'instructor', nombre: 'El instructor de la clase', rol: 'Instructor · Eleven', texto: '¡Vamos que se puede! Power Jump, martes y jueves a las 19:30.' },
            { quien: 'elCoach2', nombre: 'La coach de calistenia', rol: 'Coach · Eleven', texto: 'Calistenia Kids: lunes, miércoles y viernes a las 17:00.' },
            { quien: 'elSocio', nombre: 'Un socio en el torniquete', rol: 'Socio', texto: 'Entro con mi huella, como siempre.' },
            { quien: 'elBatido', nombre: 'Una socia en la cafetería', rol: 'Socia', texto: 'Recargo aquí antes de la clase.' },
            { quien: 'lupe', nombre: 'Lupe, de BiPlot', rol: 'Lupe · BiPlot', texto: 'Hice el diagnóstico de Eleven: más socios, que se queden y que vuelvan por más. ¿Te cuento la propuesta?', biplot: true }
          ],
          zonas: {
            recepcion: { nombre: 'Recepción', ceja: 'Recepción', titulo: '¿Y tú, ya eres Eleven?', texto: 'Aquí te inscribes con tus datos y tu huella. Pase diario de $4.000; los viernes y domingos, $2.000.', chips: ['Eleven Full $35.000', 'Estudiantes $24.990', 'Jubilados $24.990'], botones: ['recorrer', 'disenar'] },
            huella: { nombre: 'Acceso con huella', ceja: 'El acceso', titulo: 'Se entra con la huella', texto: 'La registras en recepción el día que te inscribes y desde ahí entras siempre así, sin tarjetas ni llaveros.' },
            trofeo: { nombre: 'El trofeo', ceja: 'Campeonato de Calistenia', titulo: '¡El título se quedó en casa!', texto: '4ª edición del Campeonato de Calistenia y Lucha Libre, con las promesas de Calistenia Kids en el podio.' },
            peso: { nombre: 'Peso libre', ceja: 'Peso libre', titulo: 'Diez toneladas de hierro', texto: 'Racks, barras y bancos para entrenar pesado: 4.400 kg en mancuernas y 5.600 kg en discos preolímpicos.' },
            asesoria: { nombre: 'Asesoría personalizada', ceja: 'Asesoría personalizada', titulo: 'Un plan según tu objetivo', texto: 'Planificación según tus objetivos, corrección técnica y seguimiento de tu progreso, con el team de profesionales.', botones: ['disenar'] },
            fuerza: { nombre: 'Zona fuerza', ceja: 'Zona fuerza', titulo: 'Máquinas Life Fitness 2024', texto: 'Máquinas de fuerza de última generación para trabajar cada grupo muscular con seguridad y precisión.' },
            cardio: { nombre: 'Zona cardio', ceja: 'Zona cardio', titulo: 'Esto no es un gimnasio, esto es Eleven', texto: 'Trotadoras y bicicletas Life Fitness para calentar, quemar y recuperar. Abierto desde las 6:00 de lunes a viernes.' },
            clases: { nombre: 'Sala de clases', ceja: 'Sala de clases · Cardio', titulo: 'Power Jump', texto: 'Trabajo cardiovascular sobre mini trampolín que fortalece piernas, mejora el equilibrio y ayuda a quemar calorías.', chips: ['Martes y jueves · 19:30', '60 min', 'Incluida en tu plan'], botones: ['disenar'] },
            calistenia: { nombre: 'Calistenia', ceja: 'Calistenia', titulo: 'También para niñas y niños', texto: 'Calistenia Kids los lunes, miércoles y viernes a las 17:00, y Calistenia Adulto a las 18:00.' },
            horario: { nombre: 'Horario vivo', ceja: 'Horario vivo', titulo: 'Las clases de la semana', texto: 'Zumba, Body Combat, Power Jump, Core, GRIT, Body Pump, GAP, Calistenia y Salsa y Bachata: todas incluidas en tu membresía.' },
            team: { nombre: 'Team Eleven', ceja: 'Team Eleven', titulo: 'Un team de profesionales', texto: 'Personal trainers para rendimiento, fuerza, hipertrofia, movilidad y nutrición.' },
            cafe: { nombre: 'Cafetería', ceja: 'Cafetería', titulo: 'Recarga antes y después', texto: 'Un punto de encuentro dentro del club para recuperar energía y compartir con la comunidad Eleven.' },
            tienda: { nombre: 'Tienda', ceja: 'Identity Eleven', titulo: 'La ropa del club', texto: 'Los polos Gym Time y Why Not en seis colores, la colección hombre y la tienda de nutrición y suplementos, en el mismo edificio.' },
            biplot: { nombre: 'Rincón de BiPlot', ceja: 'Propuesta de BiPlot', titulo: 'Eleven 360', biplot: true }
          },
          recorrido: [
            { zona: 'recepcion', titulo: 'La recepción', ver: ['huella', 'trofeo'], texto: '¡Hola! Te muestro el club. Aquí se entra con la huella de siempre.' },
            { zona: 'peso', titulo: 'El peso libre', ver: ['asesoria'], texto: 'Diez toneladas de hierro. Y si quieres, armamos tu plan con un coach.' },
            { zona: 'fuerza', titulo: 'La zona fuerza', texto: 'Máquinas Life Fitness para trabajar cada grupo muscular.' },
            { zona: 'cardio', titulo: 'El cardio', texto: 'Trotadoras y bicicletas, frente a nuestra frase.' },
            { zona: 'clases', titulo: 'La sala de clases', texto: '240 m² y diez clases distintas, todas incluidas. Ahora mismo, Power Jump.' },
            { zona: 'calistenia', titulo: 'Calistenia', texto: 'Barras y paralelas. Los lunes, miércoles y viernes, Calistenia Kids.' },
            { zona: 'cafe', titulo: 'Cafetería y tienda', ver: ['tienda'], texto: 'Para recargar, la cafetería. Al lado, la ropa Identity Eleven.' },
            { zona: 'biplot', titulo: 'El rincón de BiPlot', texto: 'Este rincón es de BiPlot, que nos preparó la propuesta Eleven 360.' }
          ]
        }
      },
      {
        id: 'nuhome', nombre: 'Nu Home 360', cliente: 'Nu Home', rubro: 'Casas modulares', estado: 'Plataforma a la medida · en desarrollo',
        calle: 'construccion', corto: 'En desarrollo',
        pines: [
          ['01 · Diseñador 3D', 'Diseña tu casa, pieza por pieza.', 'Terreno a escala, segundo piso y precio referencial al instante.', 'nuhome-1-disenador'],
          ['02 · Leads', 'Del cotizador, directo al CRM.', 'Llega con su maqueta y queda asignado a un ejecutivo.', 'nuhome-2-leads'],
          ['03 · Cotización', 'Aceptada, en línea.', 'Ingeniería la visa y el cliente la acepta con su nombre.', 'nuhome-3-cotizacion'],
          ['04 · Visita técnica', 'El terreno, sin sorpresas.', 'Informe con acceso, topografía y servicios, visible para todos.', 'nuhome-4-visita'],
          ['05 · Fabricación', 'Cada partida, a tiempo.', 'Carta Gantt en días hábiles, con alerta antes del atraso.', 'nuhome-5-fabricacion'],
          ['06 · Portal del cliente', 'Tu casa, paso a paso.', 'Avance, fotos y pagos en un link privado, sin costos a la vista.', 'nuhome-6-portal'],
          ['07 · Entrega', 'Entrega firmada, sin papel.', 'Acta de recepción conforme, firmada en el celular en terreno.', 'nuhome-7-entrega']
        ],
        medicion: 'En construcción. La medición parte cuando la plataforma esté en uso.',
        acento: '#E0B341',
        esencia: 'La casa se arma por módulos, frente a quien visita.',
        resumen: 'Nu Home fabrica casas modulares. Nu Home 360 junta en una sola plataforma todo lo que pasa entre el primer contacto y la entrega de la casa: ventas, cotizaciones, fábrica, bodega, pagos y un portal para cada cliente.',
        puntos: [
          ['Cotizador en línea', 'el cliente arma su casa sobre su terreno'],
          ['Fábrica a la vista', 'producción con carta Gantt y alertas tempranas'],
          ['Portal del cliente', 'cada cliente sigue su casa sin llamar']
        ],
        enlaces: [{ texto: 'Probar el cotizador', url: COTIZADOR_NUHOME }],
        equipo: ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle', 'tamandua', 'faro', 'pepa'],
        media: { h: 'media/nuhome-360-h.mp4', v: 'media/nuhome-360-v.mp4', poster: 'media/nuhome-360-h.jpg' },
        nota: 'Pantallas recreadas con datos de ejemplo.',
        /* Sala propia: al entrar se está en la sala de Nu Home, como en su propia sala de ventas. Sin números ni panel: se
           toca lo que se ve (las zonas de su dibujo, en salas.js), la gente habla sola y abajo va la barra de Nu Home. BiPlot
           aparece en su rincón, con todo lo del proyecto. Es el modelo para las demás salas.
           TEXTOS DE EJEMPLO: las frases de las burbujas, las del recorrido y las tarjetas son borradores («los diálogos los
           vemos después»), hasta que Nu Home los revise y los apruebe. Las medidas son las del diseñador de Nu Home 360.
           Las asesoras y asesores son ilustraciones sin nombre. */
        salaPropia: {
          textosDeEjemplo: true,
          marca: { nombre: 'NÜHOME', sub: 'Vida & Hogar', texto: 'Casas modulares. Pasa, recorre la casa piloto y conversa con nuestras asesoras.' },
          // Los colores de su barra y sus tarjetas: crema, tinta y dorado
          colores: { fondo: '#F6EFDF', tinta: '#1C1917', oro: '#E0B341' },
          textos: { recorrer: 'Recorrer con una asesora', hablar: 'Hablar con una asesora', recorrido: 'Recorrido con una asesora', guia: 'Asesora · Nu Home' },
          disenar: { texto: 'Diseñar la mía', url: COTIZADOR_NUHOME },
          // Quien acompaña el recorrido (la asesora que camina por la sala, por su id en el dibujo)
          guia: 'nhGuia',
          // Pendiente: el número de WhatsApp de Nu Home. Mientras sea null no aparece «Hablar con una asesora».
          // Nunca el de BiPlot: los contactos de Nu Home van a Nu Home.
          whatsapp: null,
          mensaje: 'Hola Nu Home, vi su sala en la oficina de BiPlot y quiero conversar con una asesora.',
          // La gente que habla (por su id en el dibujo): quién es (para lectores de pantalla), su rótulo y su frase de ejemplo
          burbujas: [
            { quien: 'nhRecepcion', nombre: 'La asesora de la recepción', rol: 'Asesora · Nu Home', texto: '¡Hola! Pasa, la casa piloto está abierta.' },
            { quien: 'nhMaqueta', nombre: 'La asesora de la mesa de maqueta', rol: 'Asesora · Nu Home', texto: 'Dibujamos tu terreno a escala y vemos qué casa te cabe.' },
            { quien: 'nino', nombre: 'Un niño en la terraza', rol: '', texto: '¡Tiene terraza!' },
            { quien: 'maestro', nombre: 'El maestro del taller', rol: 'Taller', texto: 'Este módulo sale el jueves.' },
            { quien: 'ejecutivo', nombre: 'El asesor de la terraza', rol: 'Asesor · Nu Home', texto: '¿Tienes terreno? Te muestro cómo quedaría en el tuyo.' },
            { quien: 'clienta2', nombre: 'Una clienta con su celular', rol: 'Clienta', texto: 'Veo el avance de mi casa desde el celular.' },
            { quien: 'bucle', nombre: 'Bucle, de BiPlot', rol: 'Bucle · BiPlot', texto: 'Con Nu Home estamos construyendo Nu Home 360, la plataforma detrás de esta sala. ¿Te cuento cómo?', biplot: true }
          ],
          // Lo que cuenta cada zona al tocarla (la del rincón de BiPlot abre la tarjeta de BiPlot). botones: disenar
          // (el cotizador), recorrer (el recorrido con una asesora) y hablar (sólo con el WhatsApp de Nu Home).
          // imagen: una pantalla real de Nu Home 360 (media/salas/).
          zonas: {
            recepcion: { nombre: 'Recepción', ceja: 'Recepción', titulo: 'Pasa, estás en Nu Home', texto: 'Aquí te recibe una asesora. Si quieres, te acompaña a recorrer la sala: la casa piloto, la asesoría y el taller.', botones: ['recorrer', 'disenar', 'hablar'] },
            'modelo-1': { nombre: 'Un módulo', ceja: 'Modelo', titulo: 'Un módulo', texto: 'Toda la casa en un solo módulo de 12 m.', chips: ['12 m', '27,2 m²'], botones: ['disenar'] },
            'modelo-2': { nombre: 'Dos pisos', ceja: 'Modelo', titulo: 'Dos pisos', texto: 'Un módulo de 12 m abajo y uno de 6 m arriba.', chips: ['40,8 m²', '12 m abajo y 6 m arriba'], botones: ['disenar'] },
            'modelo-3': { nombre: 'Con terraza', ceja: 'Modelo', titulo: 'Con terraza', texto: 'Un módulo con su terraza. La casa piloto tiene una: pasa a verla.', botones: ['disenar'] },
            piloto: { nombre: 'Casa piloto', ceja: 'Casa piloto', titulo: 'Un módulo de 6 m, con terraza y pérgola', texto: 'Así se ve un módulo terminado: forro negro, madera y ventanales que se abren a la terraza. Se combina con otros módulos para armar tu casa.', chips: ['6 × 2,5 m · 13,6 m²', 'Terraza 4 × 3 m', 'Pérgola 4 × 4 m'], botones: ['disenar', 'hablar'] },
            asesoria: { nombre: 'Asesoría', ceja: 'Asesoría', titulo: 'Diseña tu casa con una asesora', texto: 'En los escritorios te sientas con una asesora y arman juntos tu casa en el diseñador 3D, sobre tu terreno.', botones: ['disenar', 'hablar'] },
            maqueta: { nombre: 'Mesa de maqueta', ceja: 'Mesa de maqueta', titulo: 'Tu terreno, a escala', texto: 'Sobre la mesa se dibuja tu terreno a escala y se prueba qué casa te cabe, igual que en el diseñador.', botones: ['disenar'] },
            disenador: { nombre: 'Pantalla del diseñador 3D', ceja: 'El diseñador 3D', titulo: 'Diseña tu casa, pieza por pieza', texto: 'Terreno a escala, segundo piso y precio referencial al instante.', imagen: 'nuhome-1-disenador', botones: ['disenar'] },
            terminaciones: { nombre: 'Terminaciones', ceja: 'Terminaciones', titulo: 'Las muestras, en la mano', texto: 'Colores y materiales de muestra, para elegir cómo se ve tu casa.', botones: ['disenar'] },
            taller: { nombre: 'Taller', ceja: 'Taller', titulo: 'Así se arma tu casa', texto: 'Detrás del vidrio se arma cada módulo. En la pantalla, la carta Gantt del taller: cada partida a tiempo, con alerta antes del atraso.', imagen: 'nuhome-5-fabricacion' },
            salon: { nombre: 'Salón y ventanal', ceja: 'Salón', titulo: 'Tu casa, paso a paso', texto: 'Mientras esperas, sigues tu casa desde el celular: avance y fotos en el portal del cliente, en un link privado.', imagen: 'nuhome-6-portal' },
            entrega: { nombre: 'La entrega', ceja: 'Entrega', titulo: 'El día de las llaves', texto: 'La familia recibe su casa y el acta de entrega se firma en el celular, sin papel.', imagen: 'nuhome-7-entrega' },
            biplot: { nombre: 'Rincón de BiPlot', ceja: 'Hecho con BiPlot', titulo: 'Nu Home 360', biplot: true }
          },
          // «Recorrer con una asesora»: una parada por zona (ver: otras zonas que entran en el cuadro), con lo que dice la asesora
          recorrido: [
            { zona: 'recepcion', titulo: 'La entrada', ver: ['modelo-1', 'modelo-3'], texto: '¡Hola! Te acompaño a recorrer la sala. Partimos por la casa piloto.' },
            { zona: 'piloto', titulo: 'La casa piloto', texto: 'Es un módulo de 6 m, con su terraza y su pérgola. Pasa, está abierta.' },
            { zona: 'asesoria', titulo: 'La asesoría', ver: ['maqueta', 'disenador'], texto: 'Aquí diseñamos contigo tu casa en el diseñador 3D, sobre tu terreno y a escala.' },
            { zona: 'terminaciones', titulo: 'Las terminaciones', texto: 'Aquí eliges las terminaciones, con las muestras en la mano.' },
            { zona: 'taller', titulo: 'El taller', texto: 'Detrás del vidrio se arma cada módulo. En la pantalla, la carta Gantt dice qué sale y cuándo.' },
            { zona: 'salon', titulo: 'El salón', ver: ['entrega'], texto: 'Aquí se conversa, se espera y se entregan las llaves. El avance de tu casa lo sigues desde el celular.' },
            { zona: 'biplot', titulo: 'El rincón de BiPlot', texto: 'Este rincón es de BiPlot, que construye con nosotros Nu Home 360: la plataforma detrás de esta sala.' }
          ]
        }
      },
      {
        id: 'rumbo', nombre: 'Rumbo', cliente: 'Producto propio de BiPlot', rubro: 'App de desarrollo personal', estado: 'Producto propio · publicado',
        calle: 'otro', corto: 'Publicado',
        pines: [
          ['Ritual diario', 'Apertura y cierre del día.', 'Con recordatorio, para no soltarlo.', null],
          ['Todo junto', 'Hábitos, finanzas y metas.', 'En una sola pantalla.', null],
          ['Recompensas', 'Rangos e insignias.', 'Para seguir un día más.', null]
        ],
        medicion: 'Producto de BiPlot. Sin cifras de uso publicadas todavía.',
        acento: '#3E9C95',
        esencia: 'Un rincón tranquilo donde cada día es un paso.',
        resumen: 'Tu vida en un solo lugar. Una app de BiPlot para ordenar lo personal: ritual de mañana y de noche, hábitos, finanzas, metas, lecturas, salud y diario, con rangos e insignias para no soltarlo.',
        puntos: [
          ['Ritual diario', 'apertura y cierre del día, con recordatorio'],
          ['Todo junto', 'hábitos, finanzas y metas en una pantalla'],
          ['Recompensas', 'rangos e insignias para seguir']
        ],
        enlaces: [{ texto: 'Abrir Rumbo', url: 'https://rumbo.biplot.cl' }],
        equipo: ['architect', 'engine', 'grilla', 'bucle', 'tamandua', 'faro', 'pepa'],
        media: null,
        nota: 'Racha y hábitos de ejemplo.',
        /* Sala propia: un día con Rumbo, sin números (ver la de Nu Home). La racha, las metas y los hábitos son de ejemplo;
           los módulos, rangos, insignias y el elefante, los de la app. */
        salaPropia: {
          textosDeEjemplo: true,
          cejaBiplot: 'Hecho en BiPlot',
          marca: { nombre: 'Rumbo', sub: 'by BiPlot', texto: 'Tu vida en un solo lugar: rituales, hábitos, metas, finanzas y más, con un elefante que crece contigo.' },
          colores: { fondo: '#FFFFFF', fondo2: '#F4F5F2', tinta: '#111F31', tinta2: '#45505F', oro: '#3B6FB0', ceja: '#3B6FB0', cejaBurbuja: '#3B6FB0',
            borde: '#D6D8D3', brillo: '59, 111, 176', sub: '#5F6975', pie: '#5F6975', velo: 'rgba(17,31,49,.06)', hover: '#33629C',
            boton: '#3B6FB0', botonTinta: '#FFFFFF', botonPunto: '#FFFFFF' },
          fuente: { familia: "'Space Grotesk', 'DejaVu Sans', sans-serif", peso: 700, espacio: '-.02em', titulo: '25px', sub: "500 11px/1.4 'Space Grotesk', sans-serif" },
          textos: { recorrer: 'Recorrer un día', recorrido: 'Un día con Rumbo', guia: 'Rumbo' },
          disenar: { texto: 'Abrir Rumbo', url: 'https://rumbo.biplot.cl' },
          guia: 'rmGuia',
          whatsapp: null,
          burbujas: [
            { quien: 'meditadora', nombre: 'Quien abre su día en la colchoneta', rol: 'Apertura del día', texto: 'Mi elefante de hoy: primero lo difícil.' },
            { quien: 'rmHabito', nombre: 'Quien marca sus hábitos', rol: 'Hábitos', texto: '¡12 días de racha! Hoy tampoco la suelto.' },
            { quien: 'rmSube', nombre: 'Quien sube la escalera de las metas', rol: 'Objetivos', texto: 'Meta del trimestre: correr mis primeros 10K.' },
            { quien: 'rmNoche', nombre: 'Quien cierra su día en el sofá', rol: 'Cierre del día', texto: '¿Qué salió bien hoy? Anotado en el diario.' },
            { quien: 'lectora', nombre: 'Quien lee en el sillón', rol: 'Lecturas', texto: 'Página 120 de 300. Veinte minutos al día.' },
            { quien: 'rmAhorro', nombre: 'Quien mira su ahorro del mes', rol: 'Finanzas', texto: 'Este mes el frasco va mejor que el anterior.' },
            { quien: 'nino', nombre: 'Un niño junto al elefante', rol: '', texto: '¡Está feliz porque cerraste el día!' },
            { quien: 'rmTienda', nombre: 'Quien compra en la tienda', rol: 'Tienda', texto: 'Con mis estrellas le compré el jockey.' },
            { quien: 'tamandua', nombre: 'Tamandúa, de BiPlot', rol: 'Tamandúa · BiPlot', texto: 'Rumbo es nuestro. Cada cambio pasa por sus pruebas antes de llegar a tu celular.', biplot: true }
          ],
          zonas: {
            celular: { nombre: 'Tu día en Rumbo', ceja: 'Hoy', titulo: 'Tu centro de control diario', texto: 'Abres la app y ves tu día: el ritual, tus hábitos, tus metas y tu racha.', botones: ['disenar', 'recorrer'] },
            manana: { nombre: 'Ritual de mañana', ceja: 'Ritual', titulo: 'Abre tu día', texto: 'Cada mañana se abre el día y se elige el elefante: la tarea más importante, un bocado a la vez. Con recordatorio, para no soltarlo.' },
            objetivos: { nombre: 'Objetivos', ceja: 'Objetivos', titulo: 'Tus metas del trimestre y del mes', texto: 'Cada meta con sus pasos, y cada semana con su foco y sus tres prioridades. Se sube un peldaño a la vez.' },
            lecturas: { nombre: 'Lecturas', ceja: 'Lecturas', titulo: 'Tu biblioteca personal', texto: 'Lo que lees, lo que vas a leer y cuánto avanzas.' },
            rueda: { nombre: 'Rueda de la vida', ceja: 'Rueda de la vida', titulo: 'Cada área, del 0 al 10', texto: 'Salud y deporte, familia y amor, trabajo y finanzas, ocio y amistad, tiempo para mí, emocional, educativa y cultural, y espiritual y ética.' },
            habitos: { nombre: 'Hábitos', ceja: 'Hábitos', titulo: 'Marca cada día y cuida tu racha', texto: 'Los hábitos de la semana en una grilla, con la racha a la vista.' },
            recompensas: { nombre: 'Recompensas', ceja: 'Recompensas', titulo: 'Tu rango y tus insignias', texto: 'De Aprendiz a Alto Valor. Insignias como Primer Paso, Semana de Fuego, Madrugador y Bocado a Bocado.' },
            noche: { nombre: 'Cierre del día', ceja: 'Ritual', titulo: 'Cierra tu día', texto: 'Lo mejor del día, tu gratitud y cómo te sentiste. Y el elefante se pone feliz.' },
            diario: { nombre: 'Diario', ceja: 'Diario', titulo: 'Tu día a día', texto: 'Ánimo, reflexión e historial del ritual, en un solo lugar.' },
            finanzas: { nombre: 'Finanzas', ceja: 'Finanzas', titulo: 'Ahorro, gastos y seguimiento mensual', texto: 'El frasco del ahorro, los gastos del mes y cómo vas.' },
            salud: { nombre: 'Salud y bienestar', ceja: 'Salud y bienestar', titulo: 'Entrenamiento, cocina y peso', texto: 'Tu rutina por bloques, lo que cocinas y tu peso, junto al resto de tu día.' },
            elefante: { nombre: 'Tu elefante', ceja: 'Tu elefante', titulo: '¿Cómo te comes un elefante?', texto: 'Un bocado a la vez: así se llama tu tarea más importante del día. Tu elefante crece con tu constancia, de Cría a Sabio, y se pone feliz cuando cierras el día.', chips: ['Cría · Joven · Adulto · Sabio', 'Seis tipos'], botones: ['disenar'] },
            tienda: { nombre: 'Tienda', ceja: 'Tienda', titulo: 'Tus estrellas valen', texto: 'Útiles, funciones y cosméticos: ropa para tu elefante, como un jockey o una bufanda.' },
            biplot: { nombre: 'Rincón de BiPlot', ceja: 'Hecho en BiPlot', titulo: 'Rumbo', biplot: true }
          },
          recorrido: [
            { zona: 'celular', titulo: 'Tu día', texto: 'Así es un día con Rumbo. Partimos temprano.' },
            { zona: 'manana', titulo: 'El ritual de mañana', texto: 'Se abre el día y se elige el elefante: la tarea más importante.' },
            { zona: 'objetivos', titulo: 'Los objetivos', ver: ['lecturas'], texto: 'Las metas del trimestre y del mes, un peldaño a la vez.' },
            { zona: 'habitos', titulo: 'Hábitos y recompensas', ver: ['rueda', 'recompensas'], texto: 'Cada hábito cuenta para la racha, y la racha para tu rango.' },
            { zona: 'elefante', titulo: 'Tu elefante', texto: 'Tu elefante crece contigo: de Cría a Sabio.' },
            { zona: 'noche', titulo: 'El cierre del día', ver: ['diario', 'finanzas'], texto: 'En la noche se cierra el día y se anota qué salió bien.' },
            { zona: 'biplot', titulo: 'El rincón de BiPlot', texto: 'Rumbo lo hacemos en BiPlot HQ. Aquí te cuentan cómo.' }
          ]
        }
      },
      {
        id: 'libre', nombre: 'Tu proyecto aquí', cliente: '', rubro: 'Local disponible', estado: 'Disponible', libre: true, corto: 'Disponible',
        acento: '#7FD8CF',
        esencia: 'El local que espera al próximo proyecto.',
        resumen: 'Este local está esperando un proyecto. Cuéntale a Plotty cómo trabajas hoy: son tres preguntas y te dice por dónde partir.',
        puntos: [], enlaces: [], equipo: [], media: null,
        /* Sala propia: la sala de ventas de BiPlot, como la de una inmobiliaria (maqueta, piloto, lista de precios y la
           promesa). Todo lo que dice sale del sitio: el diagnóstico desde $0, la respuesta en 48 horas hábiles, las diez
           fases, la medición a los 30, 60 y 90 días y el local y la sala de cada proyecto. Quienes la visitan son
           ilustraciones sin nombre; Plotty guía el recorrido y termina en la mesa de Lupe. Atlas, sobre la maqueta, ve todo
           el panorama: no tiene una fase, ve las diez a la vez (atlas: true suma su fila bajo las diez fases). */
        salaPropia: {
          marca: { nombre: 'Tu proyecto aquí', sub: 'SALA DE VENTAS DE BIPLOT', texto: 'Mira cómo se vería tu local, cómo avanza tu proyecto y cuánto cuesta. La primera sesión es sin costo.' },
          colores: { fondo: '#FBFAF7', fondo2: '#EEF1F0', tinta: '#0E2A47', tinta2: '#2F3A46', oro: '#17C3B2', ceja: '#0B6F66', cejaBurbuja: '#0B6F66',
            borde: '#DCE3E8', brillo: '23, 195, 178', sub: '#0B6F66', pie: '#5B6776', velo: 'rgba(14, 42, 71, .06)', hover: '#12375E',
            boton: '#0E2A47', botonTinta: '#FFFFFF', botonPunto: '#17C3B2' },
          coloresBarra: { fondo: '#0E2A47', tinta: '#F2F4F7', tinta2: '#C9D4DF', sub: '#7FD8CF', borde: 'rgba(127, 216, 207, .35)', ceja: '#7FD8CF',
            velo: 'rgba(255, 255, 255, .08)', hover: '#3FD3C4', boton: '#17C3B2', botonTinta: '#062B27', botonPunto: '#062B27' },
          fuente: { familia: "'Space Grotesk', 'DejaVu Sans', sans-serif", peso: 700, espacio: '-.01em', titulo: '25px', sub: "700 10.5px/1.4 'Space Mono', monospace" },
          textos: { recorrer: 'Recorrer con Plotty', recorrido: 'Recorrido con Plotty', guia: 'Plotty · Recepción' },
          barra: ['recorrer', { zona: 'precios', texto: 'Lista de precios' }],
          guia: 'plotty',
          whatsapp: null,
          burbujas: [
            { quien: 'plotty', nombre: 'Plotty, de BiPlot', rol: 'Plotty · Recepción', texto: '¡Hola! Este local espera un proyecto. ¿Te muestro cómo sería el tuyo?', biplot: true },
            { quien: 'lupe', nombre: 'Lupe, de BiPlot', rol: 'Lupe · Diagnóstico', texto: 'La primera sesión es sin costo. ¿Me cuentas cómo trabajan hoy?', biplot: true },
            { quien: 'atlas', nombre: 'Atlas, de BiPlot', rol: 'Atlas · 360°', texto: 'Desde aquí arriba se ve todo: la calle entera y las diez fases a la vez.', biplot: true },
            { quien: 'vtElla', nombre: 'Una visitante frente a la maqueta', rol: 'Visita', texto: '¿Y el nuestro iría aquí, al lado de Rumbo?' },
            { quien: 'vtEl', nombre: 'Un visitante frente a la maqueta', rol: 'Visita', texto: 'Con nuestro logo en el techo.' },
            { quien: 'vtPiloto', nombre: 'Una visitante en el local piloto', rol: 'Visita', texto: '¡Así se vería el nuestro!' },
            { quien: 'vtPrecios', nombre: 'Un visitante frente a la lista de precios', rol: 'Visita', texto: 'El diagnóstico parte en $0.' },
            { quien: 'vtEspera1', nombre: 'Una visitante en la sala de espera', rol: 'Visita', texto: 'Nosotros llevamos todo en tres Excel.' },
            { quien: 'vtEspera2', nombre: 'Un visitante en la sala de espera', rol: 'Visita', texto: 'Nosotros, en un cuaderno y WhatsApp.' },
            { quien: 'vtCliente', nombre: 'Una clienta en la mesa de Lupe', rol: 'Visita', texto: 'Traje las planillas de verdad.' }
          ],
          zonas: {
            plotty: { nombre: 'Tres preguntas', ceja: 'Plotty · Recepción', titulo: 'Tres preguntas y te digo por dónde partir',
              texto: '¿A qué se dedica tu negocio? ¿Dónde vive hoy tu operación? ¿Cuántas horas a la semana se van en tareas que se repiten? Con eso, Plotty te dice por dónde partir. Prometido: no es un formulario.',
              botones: [{ chat: true }] },
            espera: { nombre: 'La sala de espera', ceja: 'Pymes como la tuya', titulo: 'Tu operación creció más rápido que tus procesos',
              texto: 'Trabajamos con pymes de servicios profesionales que sienten que su operación creció más rápido que sus procesos. Si hoy todo vive en planillas, en un cuaderno o en WhatsApp, llegaste al lugar correcto.',
              chips: ['En planillas', 'En WhatsApp y papel', 'En un sistema que no conversa con nada'], botones: [{ chat: true }] },
            maqueta: { nombre: 'La maqueta del barrio', ceja: 'La maqueta', titulo: 'Un local para cada proyecto',
              texto: 'Así es la calle principal: un local por proyecto, cada uno con su marca en el techo y su sala adentro. El sitio libre, entre Rumbo y El Archivo, espera el próximo. Encima flota Atlas, que proyecta el mapa y ve todo el panorama. Los proyectos que no se muestran con su propio dibujo van en la calle de su rubro.' },
            piloto: { nombre: 'El local piloto', ceja: 'El local piloto', titulo: 'Así se vería el tuyo',
              texto: 'Tu nombre y tu logo en el techo, tus productos a la vista de quien pasa por el barrio y, adentro, tu sala con tus pantallas y un enlace para mostrarla a tus clientes. Sólo si quieres: si prefieres no aparecer, se muestra sólo tu rubro.',
              chips: ['Tu marca en el techo', 'Tu sala, con un enlace', 'biplot.cl/oficina/tu-empresa'] },
            avance: { nombre: 'Así avanza tu proyecto', ceja: 'Cómo trabajamos', titulo: 'Diez fases, un solo motor',
              texto: 'Sin plantillas: el proceso real, primero. Cuatro etapas y diez fases, cada una con alguien del equipo a cargo, y Atlas, que las ve todas a la vez y marca dónde se pierden las horas. Tú hablas con una persona; el motor hace el resto, y tu local en la calle cambia con él.',
              fases: true, atlas: true, botones: [{ url: '../#metodologia', texto: 'Ver cómo trabajamos' }] },
            promesa: { nombre: 'La promesa', ceja: 'La promesa', titulo: 'Lo que te prometemos, por escrito',
              texto: 'Te respondemos en menos de 48 horas hábiles, hablas siempre con una persona y, si no hay algo real que automatizar, te lo decimos de frente. A los 30, 60 y 90 días medimos contra tu línea base: si no bajó, se dice.',
              botones: [{ url: '../#faq', texto: 'Ver las preguntas frecuentes' }] },
            precios: { nombre: 'La lista de precios', ceja: 'Lista de precios', titulo: 'Precios claros, sin letra chica',
              texto: 'El diagnóstico define el alcance real antes de cualquier número. Parte con una primera sesión sin costo; el proyecto se cotiza según su alcance, y el soporte continuo es mensual, desde el mes 2.',
              botones: [{ cta: true }, { url: '../#precios', texto: 'Ver los precios en el sitio' }] },
            vecinos: { nombre: 'La ventana a la calle', ceja: 'Los vecinos', titulo: 'Cada proyecto, con su local y su sala',
              texto: 'Por la ventana se ve la calle principal: Nu Home 360, Fundos 360, Haru 360, Eleven 360 y Rumbo, cada uno con su marca en el techo y su sala adentro. Pasa a verlas.',
              botones: [{ sala: 'nuhome', texto: 'Nu Home 360' }, { sala: 'fundos', texto: 'Fundos 360' }, { sala: 'haru', texto: 'Haru 360' }, { sala: 'eleven', texto: 'Eleven 360' }, { sala: 'rumbo', texto: 'Rumbo' }] },
            diagnostico: { nombre: 'La mesa de Lupe', ceja: 'Lupe · Diagnóstico', titulo: 'La primera sesión es sin costo',
              texto: 'Lupe se sienta con quien hace el trabajo, mira las planillas y los chats, y cronometra cuánto se va en cada paso. Te llevas la revisión de tu proceso, el mapa de dónde se pierde tiempo, con la línea base, y una propuesta de alcance, sin compromiso. Si no hay algo real que automatizar, te lo decimos de frente.',
              botones: [{ cta: true }, { chat: true }] }
          },
          recorrido: [
            { zona: 'plotty', titulo: 'La entrada', texto: '¡Hola! Soy Plotty. Este local espera un proyecto: el tuyo. Te muestro cómo se trabaja con BiPlot.' },
            { zona: 'espera', titulo: 'La sala de espera', texto: 'Aquí esperan otras pymes: tres Excel, un cuaderno, WhatsApp. ¿Te suena?' },
            { zona: 'maqueta', titulo: 'La maqueta', texto: 'Esta es la calle. Atlas la mira desde arriba, con todo el panorama, y este sitio libre puede ser el tuyo.' },
            { zona: 'piloto', titulo: 'El local piloto', texto: 'Así se vería el tuyo: tu marca en el techo y tu sala con un enlace para tus clientes.' },
            { zona: 'avance', titulo: 'Cómo avanza', texto: 'Cuatro etapas y diez fases, con alguien a cargo de cada una. Atlas las ve todas a la vez.' },
            { zona: 'promesa', titulo: 'La promesa', texto: 'Lo que te prometemos, por escrito. Si no bajó, se dice.' },
            { zona: 'precios', titulo: 'Los precios', texto: 'Precios claros: el diagnóstico parte en $0 y el proyecto se cotiza según su alcance.' },
            { zona: 'vecinos', titulo: 'Los vecinos', texto: 'Por la ventana, la calle: pasa a la sala de cada proyecto cuando quieras.' },
            { zona: 'diagnostico', titulo: 'La mesa de Lupe', texto: 'Aquí te espera Lupe. La primera sesión es sin costo.' }
          ]
        }
      }
    ],

    /* El barrio: una calle por rubro para los casos con plantilla, con los mismos rubros de la primera pregunta de Plotty.
       Cada calle aparece cuando llega su primer caso. */
    barrio: {
      calles: {
        inmobiliaria: 'Calle Inmobiliaria', comida: 'Calle Comida', servicios: 'Calle Servicios', construccion: 'Calle Construcción',
        comercio: 'Calle Comercio', salud: 'Calle Salud', otro: 'Calle Otros rubros'
      }
    },

    /* Casos de referencia del núcleo: negocios ilustrativos, no clientes. Copias servidas desde casos/. */
    casos: [
      { id: 'caso-01', num: '01', nombre: 'Taller Aguilar', rubro: 'Taller mecánico', camino: 'Sistema',
        hallazgo: 'Pedía facturación. Perdía 8 órdenes al mes en aprobaciones por WhatsApp.',
        demo: 'casos/01-taller-aguilar/demo.html', caso: 'casos/01-taller-aguilar/caso.html' },
      { id: 'caso-02', num: '02', nombre: 'Punto Sur', rubro: 'Distribuidora', camino: 'Visibilidad',
        hallazgo: 'Cuatro productos vendidos bajo costo durante ocho meses, en dos planillas que nadie restó.',
        demo: 'casos/02-distribuidora-punto-sur/demo.html', caso: 'casos/02-distribuidora-punto-sur/caso.html' },
      { id: 'caso-03', num: '03', nombre: 'Centro Aurora', rubro: 'Clínica dental', camino: 'Automatización',
        hallazgo: 'Pedía cambiar el software. El dolor estaba alrededor del software, no dentro.',
        demo: 'casos/03-clinica-dental/demo.html', caso: 'casos/03-clinica-dental/caso.html' },
      { id: 'caso-04', num: '04', nombre: 'Servicios Elqui', rubro: 'Mantención en terreno', camino: 'Higiene',
        hallazgo: '7 de 14 pasos existían sólo para pasar un dato de un papel a un Word.',
        demo: 'casos/04-mantencion-terreno/demo.html', caso: 'casos/04-mantencion-terreno/caso.html' }
    ],

    /* Otras piezas que viven en la estantería. */
    estanteria: [
      { texto: 'Recetario BiPlot', detalle: 'Elige tu rubro y tus dolores, y mira qué se arma.', url: 'https://recetario-biplot.vercel.app' },
      { texto: 'Seis décadas, la misma línea', detalle: 'Cómo pensamos la automatización.', url: '../plotline.html' }
    ],

    /* La vitrina de la recepción: tres casos, los más cercanos al rubro de quien visita (lo elige Plotty). */
    vitrina: {
      porDefecto: ['fundos', 'haru', 'nuhome'],
      rubros: {
        inmobiliaria: ['fundos', 'nuhome', 'caso-04'],
        comida: ['haru', 'caso-02', 'caso-03'],
        servicios: ['eleven', 'caso-03', 'haru'],
        construccion: ['nuhome', 'caso-01', 'caso-04'],
        comercio: ['caso-02', 'haru', 'fundos'],
        salud: ['caso-03', 'eleven', 'caso-04'],
        otro: ['fundos', 'haru', 'nuhome']
      }
    },

    /* Las tres preguntas de Plotty (E0). Califica con 5 horas o más a la semana, o si no lo sabe. */
    plotty: {
      saludo: 'Hola, soy Plotty. Te hago tres preguntas y te digo por dónde partir. Prometo que no es un formulario.',
      preguntas: [
        { id: 'rubro', texto: '¿A qué se dedica tu negocio?', opciones: [
          ['inmobiliaria', 'Inmobiliaria o parcelas'], ['comida', 'Restaurante o comida'], ['servicios', 'Gimnasio o servicios'],
          ['construccion', 'Construcción o fábrica'], ['comercio', 'Comercio o distribución'], ['salud', 'Salud'], ['otro', 'Otro rubro']] },
        { id: 'donde', texto: '¿Dónde vive hoy tu operación?', opciones: [
          ['planillas', 'En planillas'], ['whatsapp', 'En WhatsApp y papel'], ['sistema', 'En un sistema que no conversa con nada'], ['todo', 'Un poco en todo']] },
        { id: 'horas', texto: '¿Cuántas horas a la semana se van en tareas que se repiten?', opciones: [
          ['menos5', 'Menos de 5'], ['5a15', 'Entre 5 y 15'], ['mas15', 'Más de 15'], ['nose', 'No sé, y eso me preocupa']] }
      ],
      noCalifican: ['menos5'],
      califica: 'Con eso ya hay por dónde partir. Agenda tu diagnóstico: la primera sesión es sin costo, y la tomas con una persona del equipo.',
      noCalifica: 'Con menos de 5 horas a la semana, quizás todavía no te hace falta automatizar. Recorre la oficina, y si algo te hace sentido, escríbenos igual.',
      vitrina: 'Te dejé en la vitrina de la recepción los tres casos más cercanos a tu rubro.',
      rubroCasos: 'Mira la calle: te marqué los casos de tu rubro: {casos}. Toca uno para verlo por dentro.',
      rubroSinCasos: 'Todavía no hay un caso de tu rubro en la calle. Te marqué el local libre: puede ser el tuyo.',
      mensaje: 'Hola BiPlot, vengo de la oficina. Mi negocio: {rubro}. Mi operación vive {donde}. Horas a la semana en tareas que se repiten: {horas}. Quiero agendar un diagnóstico.'
    }
  };
})();
