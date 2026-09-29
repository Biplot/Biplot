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
        resumen: 'La única cara real de la oficina. Graba en el mundo real y entra a la oficina dibujada con su pase de prensa. Pregunta lo que la gente se pregunta y casi nunca recibe una respuesta clara.',
        rasgos: ['Siempre anda grabando.', 'Pregunta lo que nadie se atreve a preguntar.', 'Tampoco sabe quién es real. O eso dice.'],
        frase: '¿The Engine existe? Yo tampoco lo sé.',
        look: 'Ondas largas color miel, aros dorados, bomber azul con el parche de Plotty, polera «REC» y el celular con aro de luz.',
        ahora: ['Grabando en el set.', 'Preguntándole a Kilo qué rompió hoy.', 'Buscando a The Engine con la cámara encendida.']
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
      set: { nombre: 'El set', sub: 'Aby graba aquí', etiqueta: 'El set',
        titulo: 'Donde graba Aby',
        texto: 'Aro de luz, cámara y la pared de la marca. Aby entra a la oficina con su pase de prensa y le pregunta al equipo lo que todos se preguntan.' },
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
      archivo: { nombre: 'El Archivo', sub: 'Todos los casos, por rubro', etiqueta: 'El Archivo',
        titulo: 'Todos los casos tienen su carpeta',
        texto: 'Aquí está cada caso, también los que no muestran su nombre o ya terminaron. Pepa los ordena por rubro. El edificio sube un piso cada diez casos.' },
      estanteria: { nombre: 'Estantería del núcleo', sub: 'Pepa · E9', etiqueta: 'Estantería del núcleo · E9',
        titulo: 'Lo que ya sabemos hacer',
        texto: 'Aquí Pepa guarda lo que sirvió en un proyecto y le sirve al siguiente. Por eso cada sistema nuevo parte con ventaja.' },
      muro: { nombre: 'Muro del equipo', sub: 'Los diez, con su placa', etiqueta: 'Muro del equipo',
        titulo: 'El equipo',
        texto: 'Diez integrantes, uno por parte del trabajo. Los reconoces por su placa: la fase del motor que llevan.' },
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
       `salaPropia` (hoy, sólo Nu Home) cambia su sala: sin números ni panel, como su propia sala de ventas (ver su bloque).
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
        nota: 'Pantallas ilustrativas con datos de ejemplo.'
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
        nota: 'Las cifras del video son ilustrativas: salen del generador de datos de prueba.'
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
        nota: 'Horario y cupos de ejemplo.'
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
        nota: 'Racha y hábitos de ejemplo.'
      },
      {
        id: 'libre', nombre: 'Tu proyecto aquí', cliente: '', rubro: 'Local disponible', estado: 'Disponible', libre: true, corto: 'Disponible',
        acento: '#7FD8CF',
        esencia: 'El local que espera al próximo proyecto.',
        resumen: 'Este local está esperando un proyecto. Cuéntale a Plotty cómo trabajas hoy: son tres preguntas y te dice por dónde partir.',
        puntos: [], enlaces: [], equipo: [], media: null
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
