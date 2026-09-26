# La oficina de BiPlot

BiPlot HQ: una oficina dibujada que se puede recorrer, al modo de una banda virtual. El equipo trabaja en la oficina y,
afuera, en la calle, cada proyecto tiene su local: al entrar se abre la sala de esa empresa, con sus pantallas reales,
su video, sus enlaces y el equipo que la hizo. Las mismas piezas sirven para Instagram y para compartir cada sala.

- Página: `oficina/index.html` → **biplot.cl/oficina/** (GitHub Pages publica `main`).
- Enlaces directos: `/oficina/#lupe`, `/oficina/#haru` (la sala de Haru), `/oficina/#archivo`, `/oficina/#calle-salud`,
  `/oficina/#conversar`… (cualquier integrante, lugar, sala o calle).
- Para compartir una sala: **biplot.cl/oficina/haru/** (y `fundos/`, `eleven/`, `nuhome/`, `rumbo/`): en un chat se ve su
  imagen y al abrirlo se entra a la oficina, directo en esa sala.
- Kit para Instagram: `oficina/kit/` (galería) y `oficina/kit/png/` (los PNG).

## El equipo

Diez integrantes, cada uno con placa, y dos mascotas. En la oficina son cabezones en vector, con el mismo trazo de la
escena; en las fichas y en redes, ilustraciones con tinta y color plano. Coral no aparece en ningún dibujo: sigue
reservado para "Agenda tu diagnóstico".

| Integrante | Nombre | Rol | Placa | Dónde está | Frase |
|---|---|---|---|---|---|
| **Lupe** | Guadalupe Cifuentes | Diagnóstico | E1 | Sala de diagnóstico | «Lo que pides no siempre es lo que necesitas.» |
| **The Architect** | | Estrategia y proyectos | E2 | Sala de planos | «Si no se puede dibujar, no se puede construir.» |
| **Celda** (Byte) | Celeste Dávila | Datos y métricas | E3 | Su estación y el laboratorio | «Si no cuadra, no avanza.» |
| **The Engine** | | Ejecución y sistemas | E4 | Sala de máquinas | «Lo que se repite, se automatiza.» |
| **Grilla** (Pixel) | Griselda Llanos | Diseño | E5 | Su estación | «Si hay que explicarlo, está mal diseñado.» |
| **Bucle** (Kilo) | Benjamín Ochoa | Desarrollo | E5 | Su estación | «Rebanada chica, entrega segura.» |
| **Tamandúa** | Tomás Hormazábal | Validación | E6 | Su estación | «Si se puede romper, lo rompo yo antes.» |
| **Faro** | Fausto Torres | Puesta en marcha | E7 | El tubo a producción | «No termina cuando se publica. Termina cuando se usa.» |
| **Pepa** | Josefa Huerta | Cosecha | E9 | Estantería del núcleo | «Lo que sirve dos veces se guarda. Lo demás, se bota.» |
| **Aby** | | La corresponsal | PRENSA | El set | «¿The Engine existe? Yo tampoco lo sé.» |
| **Atlas** | | Mascota de The Architect | 360° | Sobre la mesa de dos | «Desde aquí arriba se ve todo.» |
| **Plotty** | | Recepción | E0 | Recepción | «Tres preguntas. Prometo que no es un formulario.» |

Pronombres para los textos: Lupe, Celda, Grilla, Pepa y Aby en femenino; el resto en masculino. En los textos públicos
se habla de integrantes, todos con placa y con el mismo trato.

## Qué hay en la oficina

**La oficina.** La recepción con Plotty y la vitrina; el muro del equipo; las estaciones de Celda, Grilla, Bucle y
Tamandúa; el tubo "A producción" de Faro; la sala de diagnóstico con el motor en la pizarra; la estantería del núcleo
(Pepa, los cuatro casos de referencia, el Recetario y "Seis décadas"); el café con el reloj en hora de Chile; y al fondo
la **Sala de planos y máquinas** (The Architect y The Engine frente a frente en la mesa de dos, Atlas proyectando el
mapa y el tubo del plano que baja a los racks), **el set** donde graba Aby, el **laboratorio de métricas** y la **sala de
reuniones**. La **Puerta 404** es una caja cerrada: nunca se abre.

**La calle principal.** Por delante de la oficina: un local por proyecto con sala dibujada a mano (Nu Home 360,
Fundos 360, Haru 360 y Eleven 360, el pasaje a BiPlot HQ, Rumbo), el local libre "Tu proyecto aquí" y **El Archivo**.
En la vereda hay gente de paso, faroles, bancas y pizarras; al costado, la plaza con su mural, la pileta y el quiosco.
En el **pasaje** está el directorio con las calles del barrio.

| Local | Esencia | Lo que se mueve |
|---|---|---|
| Fundos 360 | Sala de ventas de parcelas: maqueta del terreno, plano de loteo, ciclo de venta | Una parcela pasa a reservada y cae un pin |
| Haru 360 | Barra de sushi: noren, vitrina de pescados, comandas por canal, QR en las mesas | Entra una comanda, sale vapor, se mecen los faroles |
| Eleven 360 | Gimnasio: mancuernas, trotadora, clases del día, torniquete con huella | Corre la cinta, la huella marca, sube un cupo |
| Nu Home 360 | Casa modular a medio armar: catálogo, configurador, carta Gantt de fábrica | La grúa baja un módulo y el configurador suma uno |
| Rumbo | Un camino del día 1 al 30 que termina en una escalera | Se marca un hábito, sube la racha, flamea la bandera |
| Tu proyecto aquí | El local libre, con el letrero «Se arrienda» | Al tocarlo se abre la conversación con Plotty |
| El Archivo | Estantes con una carpeta por caso, la mesa de lectura y el buscador | Al tocarlo se abre la lista de todos los casos |

**La sala de cada empresa.** Al tocar un local hecho a mano, la cámara entra y se abre su sala en grande (`salas.js`, se
carga recién la primera vez), con su gente y un **punto por módulo**. Cada punto muestra la pantalla real de ese módulo
(de los videos de cada caso, con datos de ejemplo) o, si todavía no hay capturas, el rincón de la sala donde está. El
panel trae lo que construimos, lo que resolvimos, el video, los enlaces para visitarlos, el equipo que lo hizo, los
resultados (día 30, 60 y 90: pendientes hasta que se midan y el cliente lo autorice) y el enlace para compartirla. Cada
sala tiene su dirección (`#haru`): el botón atrás del navegador vuelve a la calle.

**Cómo crece el barrio: una calle por rubro.** La calle principal queda con los proyectos que tienen sala dibujada a
mano. Los demás casos van a la **calle de su rubro** (los mismos rubros de la primera pregunta de Plotty), que aparece
cuando llega el primer caso de ese rubro, por delante de la principal y unida por una avenida. Cada calle tiene siete
lotes y termina con un local que se arrienda. Nada de esto se dibuja a mano: escena.js lo arma desde `datos.js`.

- **Plantilla por rubro**: `clinica`, `taller` o `basica` (cualquier rubro), con el nombre y el color de cada caso.
- **La fase manda cómo se ve el local**: E0 se arrienda, E1 diagnóstico (notas en el muro, «Próximamente», Lupe y el
  cliente), E2 a E6 en obra (andamio, el plano, Grilla, Bucle y Tamandúa), E7 inauguración (cinta, globos, Faro con las
  tijeras), E8 y E9 abierto (en E9, con la placa del día 90 junto a la puerta).
- **Permiso**: con su nombre, sólo con su rubro (el letrero dice, por ejemplo, «Clínica dental») o sólo en El Archivo.
- **El Archivo** guarda todos los casos, por rubro y con buscador; el edificio sube un piso cada diez casos.
- **De lejos y de cerca**: con la cámara lejos, los locales se ven cerrados, con su techo, su toldo y su letrero (menos
  que dibujar); al acercarse, se abren con su gente.
- **Encontrar un caso**: el menú "Recorre la oficina" agrupa los locales por calle, con buscador y filtros (abiertos o
  en obra); el directorio del pasaje; y Plotty, que con la primera respuesta lleva la cámara a los casos del rubro.

**Plotty (E0).** Hace tres preguntas (rubro, dónde vive la operación y horas a la semana en tareas repetidas); con el
rubro marca en la calle los casos como el tuyo; al final arma el mensaje de WhatsApp para agendar y deja en la vitrina
de la recepción los tres casos más cercanos. El rubro queda guardado en el navegador de quien visita (`localStorage`),
sólo para su vitrina.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página: barra de marca, escena, la sala de cada empresa, menú "Recorre la oficina", controles, bienvenida, recorrido guiado y panel |
| `datos.js` | **Lo único que hay que tocar para cambiar textos y sumar casos**: equipo, mascotas, fases, lugares, proyectos (con los puntos de cada sala), calles del barrio, casos de referencia, vitrina y Plotty |
| `escena.js` | La oficina isométrica y su barrio: arma la calle principal, las calles por rubro y El Archivo desde `datos.js`; zonas, vitrina, los recorridos del equipo, la gente que camina y la vista de lejos |
| `oficina.js` | Interfaz: cámara (arrastrar, rueda, pellizco, teclado), menú con el barrio y su buscador, la sala de cada empresa, El Archivo, recorrido guiado, paneles, chat, videos y enlaces directos |
| `oficina.css` | Estilos con los tokens oscuros de la marca y todas las animaciones |
| `elenco.js` | *Generado.* Los cabezones de la oficina y la credencial (lo usan la oficina y el kit) |
| `barrio.js` | *Generado.* La calle principal (locales, plaza, pasaje, El Archivo) y las piezas de las calles por rubro: plantillas, estados, frentes y gente |
| `salas.js` | *Generado.* La sala grande de cada empresa, con su gente y sus puntos; se carga recién al entrar a la primera sala |
| `ilustraciones.js` | *Generado.* Las ilustraciones de ficha; se cargan recién al abrir la primera ficha |
| `<sala>/index.html` | *Generado.* La página para compartir cada sala (`fundos/`, `haru/`, `eleven/`, `nuhome/`, `rumbo/`): su vista previa y el paso a la oficina |
| `kit/` | Galería y plantilla de las piezas de Instagram y de cada sala (`?pieza=sala-haru&formato=og`) |
| `kit/png/` | Los PNG exportados (36 archivos) |
| `casos/` | Copias publicables de las demos y documentos de los casos de referencia del núcleo |
| `media/` | El teaser de Nu Home 360 (horizontal, vertical y póster) y, en `media/salas/`, las pantallas reales de cada sala (de los videos de cada caso, con datos de ejemplo), sus recortes y los logos |
| `_herramientas/` | Scripts internos y las fuentes de los dibujos. **No se publican en biplot.cl** (Jekyll ignora carpetas con `_`) |

Sin librerías ni build para la página: SVG, CSS y JavaScript planos. Lo único externo son las fuentes de Google Fonts
(Inter, Space Grotesk y Space Mono). Los videos se cargan sólo al abrir el panel de su sala, y las salas grandes al
entrar a la primera.

## Cómo se edita

- **Textos, enlaces, quién trabajó en qué**: `datos.js`. Cada proyecto tiene `calle` (su rubro), `equipo`, `enlaces`,
  `puntos`, `esencia`, `media`, `pines` (los puntos de su sala: módulo, título, detalle y la pantalla en `media/salas/`) y
  `medicion` (en qué va la medición; sin cifras hasta que se midan y el cliente lo autorice).
- **Un caso nuevo con plantilla** (lo normal): sólo `datos.js`. Se suma a `proyectos` con su `calle`, `plantilla`,
  `fase`, `permiso`, `acento` y sus textos (el formato está en el comentario de `proyectos`). La oficina lo ubica en la
  calle de su rubro (y la abre si es el primero), elige la plantilla y muestra la fase. Para cambiar de fase, se cambia
  `fase`. Mientras el CRM no esté conectado, es la forma de cargar casos.
- **Un proyecto destacado, con sala hecha a mano**: se dibuja su local en `_herramientas/dibujos/barrio/locales.mjs` y su
  sala grande en `barrio/salas-grandes.mjs` (con un `pin()` por módulo), se agrega a `PRINCIPAL` en `barrio/barrio.mjs`,
  se suben sus pantallas a `media/salas/` y se regenera todo; después, `exportar-kit.mjs --solo sala-<id>` para su vista
  previa. Lo que se mueve en un local o en una sala lleva una clase `loc-…` con su animación en `oficina.css`.
- **Los dibujos** viven en `_herramientas/dibujos/`: `cabezones/` (el equipo), `ilustracion/` (las fichas) y `barrio/`
  (el motor de maquetas, los locales, las plantillas, el entorno, la gente del barrio y las salas grandes). Después de
  cambiarlos (o los nombres y colores de los proyectos) se regenera:

  ```bash
  node oficina/_herramientas/dibujos/generar.mjs
  ```

  Escribe `elenco.js`, `ilustraciones.js`, `barrio.js`, `salas.js` y las páginas para compartir de cada sala.
- **Videos de las salas**: Fundos y Haru usan los teasers del sitio (`assets/casos/`); el de Nu Home vive en `oficina/media/`,
  comprimido con `ffmpeg -crf 28 -preset slow -movflags +faststart` y con el póster en el segundo 10.
- **Casos de referencia**: si cambian en su fuente, correr `node oficina/_herramientas/sincronizar-casos.mjs`. Son
  negocios ilustrativos, no clientes: viven en la estantería, no en la calle.

## Probar

```bash
npx http-server . -p 5480 -c-1
```

Abrir http://localhost:5480/oficina/. La prueba funcional (menú y buscador del barrio, recorrido guiado, la sala de una
empresa con sus puntos y sus pantallas, chat de Plotty con la cámara en el rubro, vitrina, El Archivo, teclado, enlaces
directos y la página para compartir, Escape, pausa, la vista de lejos, movimiento reducido, errores de consola y
desbordes a 1440, 1366 y 375 px, y las calles por rubro con casos de prueba que sólo existen en su navegador) corre sola
con Edge o Chrome sin interfaz y no necesita servidor:

```bash
node oficina/_herramientas/probar-oficina.mjs
```

Con otro Chromium: `NAVEGADOR=/ruta/al/chrome node oficina/_herramientas/probar-oficina.mjs`.

## Accesibilidad

Todo lo que se abre en la escena está también en el menú "Recorre la oficina" (botones de verdad, con teclado), con
el barrio agrupado por calle, buscador y filtros. Al recorrer el menú con Tab la cámara va mostrando dónde está cada
cosa. Sobre la escena: flechas para moverse, `+` y `−` para acercar, `0` para ver todo, `Escape` cierra. En la sala de
una empresa, cada punto es un botón (Enter o espacio) y también está en la tira de módulos del panel; `Escape` vuelve a
la calle. El chat de Plotty son botones, con los mensajes anunciados a lectores de pantalla. Con "reducir movimiento"
todo queda quieto y la cámara salta sin animación; además hay un botón para pausar.

## Kit para Instagram

Catorce piezas en publicación (1080 × 1350) e historia (1080 × 1920), más la imagen para compartir el enlace
(1200 × 630, `oficina-og.png`, ya enlazada en las etiquetas `og:image` de la página) y la de cada sala
(`sala-<id>-og.png`, la de las páginas `oficina/<id>/`). En las historias lo importante queda fuera de las franjas de
250 px de arriba y abajo.

| Pieza | Archivos | Texto sugerido para la publicación |
|---|---|---|
| La oficina | `oficina-4x5.png`, `oficina-9x16.png` | Pasa a la oficina: el equipo trabajando y una sala por empresa. biplot.cl/oficina |
| La sala de Haru 360 | `sala-haru-4x5.png`, `sala-haru-9x16.png` | Pasa a la sala de Haru 360: lo que construimos, con sus pantallas reales. biplot.cl/oficina/haru |
| Vista previa de cada sala | `sala-<id>-og.png` | (La usan las páginas `oficina/<id>/` al compartir el enlace) |
| El equipo | `elenco-4x5.png`, `elenco-9x16.png` | Diez integrantes, uno por parte del trabajo. Los reconoces por su placa. |
| ¿Quién hace qué? | `motor-4x5.png`, `motor-9x16.png` | Diez fases, un solo motor. |
| ¿Quién es real? | `quien-4x5.png`, `quien-9x16.png` | Aby dice que ella. Los demás no contestan. |
| Fichas | `ficha-<id>-4x5.png`, `ficha-<id>-9x16.png` | Una por integrante: su frase, sus tres rasgos (en `datos.js`) y biplot.cl/oficina |

Se regeneran con `node oficina/_herramientas/exportar-kit.mjs` (todas) o `--solo ficha-lupe,oficina,sala-haru`. Con
`--capturas <carpeta>` saca además la oficina a 1920, 1440, 1366 y 375 px (la oficina y la calle, la sala de Haru, la
calle al volver y una ficha).

## Conexión con el CRM

La oficina queda lista para conectarse al CRM de BiPlot sin cambiar su código:

1. **Un solo contrato de datos.** Todo lo que muestra la oficina sale de `window.OFICINA_DATOS` (`datos.js`). El CRM
   exportaría el mismo objeto como `oficina.json`, sólo con campos públicos, y la oficina lo leería con un `fetch`.
2. **Proyectos = locales.** Cada proyecto con la marca "mostrar en la oficina" aporta nombre, rubro (`calle`), fase,
   permiso (con nombre, sólo el rubro o sólo en El Archivo), plantilla, esencia, resumen, puntos, enlaces y sus versiones
   liberadas (videos y demos con datos ilustrativos) como `media`. La fase del CRM cambia sola cómo se ve el local.
3. **Equipo = roles.** Cada integrante corresponde a un rol del motor; el CRM arma el campo `equipo` de cada sala y las
   líneas "Ahora: …" de cada ficha. Nunca tareas, notas, horas ni costos.
4. **Plotty = entrada al CRM.** Las tres respuestas de Plotty son las de la calificación (E0): hoy viajan en el mensaje
   de WhatsApp; con el CRM, entrarían como solicitud.
5. **Sin datos de personas.** Ni en el JSON público ni en la oficina: sólo el nombre del proyecto y del cliente, con su
   autorización.
