# Reacciones de Atlas (propuesta final)

Las reacciones de Atlas para su página con voz (la opción 2 de «Atlas, tu Jarvis», con Sonnet), cada una en 3D: 22 en
total, 17 nuevas y 5 que ya sabía hacer, ordenadas por momento de la conversación.

Lo que eligió Chris: **quedan todas**, más las tres sugerencias (preocupado, risa y buenas noches); **sobrio o
expresivo a elección** (un ajuste en la página de Atlas, que parte en expresivo); y **con sonido**.

- Dirección: `/propuestas/reacciones-atlas/` (no indexada). Es una propuesta: el sitio no la enlaza.
- Para probarla en local: `npx http-server . -p 8080` en la raíz del repo y abrir
  http://localhost:8080/propuestas/reacciones-atlas/ (como archivo suelto no carga: los módulos necesitan un servidor).
- Los ejemplos son genéricos: no trae datos de la bóveda.

## Las reacciones

| N.º | Estado | Cuándo | Corre |
|---|---|---|---|
| 1 | `despertar` | Al abrir la página | 2,8 s |
| 2 | `buenasnoches` | Cuando le dices que te vas (queda dormido) | 3,2 s |
| 3 | `dormir` | Después de un rato sin hablarle | Siempre |
| 4 | `shy` (ya estaba) | Mientras escribes la contraseña | Siempre |
| 5 | `atento` | Cuando dices «Atlas» o tocas el micrófono | 0,7 s |
| 6 | `escuchando` | Mientras le hablas | Siempre |
| 7 | `asentir` | Cuando terminas de hablar y te entendió | 1 s |
| 8 | `hablando` | Mientras responde en voz alta | Siempre |
| 9 | `thinking` (ya estaba) | Preguntas que piden pensar | Siempre |
| 10 | `buscando` | Mientras busca en el índice | Siempre |
| 11 | `leyendo` | Mientras lee una página | Siempre |
| 12 | `encontrado` | Cuando da con la respuesta | 1,1 s |
| 13 | `duda` | Cuando no lo encuentra o no te entendió | 2,2 s |
| 14 | `typing` (ya estaba) | Mientras prepara lo que va a anotar | Siempre |
| 15 | `esperando` | Cuando muestra un cambio antes de guardarlo | Siempre |
| 16 | `success` (ya estaba) | Cuando guardó en la bóveda | 2,6 s |
| 17 | `error` (ya estaba) | Sin conexión, o si GitHub no responde | 1,9 s |
| 18 | `alerta` | Lo importante del resumen (en ámbar) | Siempre |
| 19 | `preocupado` | Cuando el resumen trae muchos pendientes | Siempre |
| 20 | `alegre` | Buenas noticias, o cuando le das las gracias | 1,5 s |
| 21 | `risa` | Cuando le cuentas algo gracioso | 1,8 s |
| 22 | `celebrar` | Un hito: algo publicado, un pendiente grande cerrado | 2,6 s |

Todas viven en `assets/avatares3d/atlas3d.js` (ver su README) y pasan tal cual a la página de Atlas.

## La página

- El escenario muestra a Atlas en grande, con el nombre de la reacción y cuándo pasa. El brillo cambia de color con la
  reacción: ámbar en la alerta, azul en la pena, verde en lo que salió bien, rojo en el error, apagado al dormir.
- **Conversación completa**: encadena las reacciones como en una conversación de verdad (despierta, te da el resumen
  con su alerta y su preocupación, le preguntas, busca, lee, encuentra, te contesta, le pides anotar, espera tu OK,
  guarda, le das las gracias, se ríe con una broma y se despide), con lo que dice cada uno.
- **Estilo**: expresivo (intensidad 1) o sobrio (0,5): cambia cuánto se mueve el cuerpo, no las caras ni los colores.
- **Sonido** (activado de partida): notas cortas hechas con Web Audio para las reacciones y, en la conversación, la voz
  del navegador en español; con cada palabra, el plasma late (`ajustar({ nivel })`). Los navegadores no dejan sonar
  nada hasta el primer toque en la página: el sonido se enciende con ese toque.
- Con «reducir movimiento», Atlas no salta ni gira: sólo cambian sus ojos y sus colores.
