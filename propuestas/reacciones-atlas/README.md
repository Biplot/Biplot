# Reacciones de Atlas (propuesta)

Antes de armar la página de Atlas con voz (la opción 2 de «Atlas, tu Jarvis»), las reacciones que se proponen para él,
cada una en 3D: 14 nuevas y 5 que ya sabía hacer, ordenadas por momento de la conversación. Se elige cuáles quedan, el
estilo (sobrio o expresivo) y si lleva sonido.

- Dirección: `/propuestas/reacciones-atlas/` (no indexada). Es una propuesta: el sitio no la enlaza.
- Para probarla en local: `npx http-server . -p 8080` en la raíz del repo y abrir
  http://localhost:8080/propuestas/reacciones-atlas/ (como archivo suelto no carga: los módulos necesitan un servidor).
- Los ejemplos son genéricos: no trae datos de la bóveda.

## Las reacciones

| N.º | Estado | Cuándo | Corre |
|---|---|---|---|
| 1 | `despertar` | Al abrir la página | 2,8 s |
| 2 | `dormir` | Después de un rato sin hablarle | Siempre |
| 3 | `shy` (ya estaba) | Mientras escribes la contraseña | Siempre |
| 4 | `atento` | Cuando dices «Atlas» o tocas el micrófono | 0,7 s |
| 5 | `escuchando` | Mientras le hablas | Siempre |
| 6 | `asentir` | Cuando terminas de hablar y te entendió | 1 s |
| 7 | `hablando` | Mientras responde en voz alta | Siempre |
| 8 | `thinking` (ya estaba) | Preguntas que piden pensar | Siempre |
| 9 | `buscando` | Mientras busca en el índice | Siempre |
| 10 | `leyendo` | Mientras lee una página | Siempre |
| 11 | `encontrado` | Cuando da con la respuesta | 1,1 s |
| 12 | `duda` | Cuando no lo encuentra o no te entendió | 2,2 s |
| 13 | `typing` (ya estaba) | Mientras prepara lo que va a anotar | Siempre |
| 14 | `esperando` | Cuando muestra un cambio antes de guardarlo | Siempre |
| 15 | `success` (ya estaba) | Cuando guardó en la bóveda | 2,6 s |
| 16 | `error` (ya estaba) | Sin conexión, o si GitHub no responde | 1,9 s |
| 17 | `alerta` | Lo importante del resumen (en ámbar) | Siempre |
| 18 | `alegre` | Buenas noticias, o cuando le das las gracias | 1,5 s |
| 19 | `celebrar` | Un hito: algo publicado, un pendiente grande cerrado | 2,6 s |

Todas viven en `assets/avatares3d/atlas3d.js` (ver su README): las que se elijan pasan tal cual a la página de Atlas.

## La página

- El escenario muestra a Atlas en grande, con el nombre de la reacción y cuándo pasa. El brillo cambia de color con la
  reacción: ámbar en la alerta, verde en lo que salió bien, rojo en el error, apagado al dormir.
- **Conversación completa**: encadena las reacciones como en una conversación de verdad (despierta, te da el resumen,
  le preguntas, busca, lee, encuentra, te contesta, le pides anotar, espera tu OK, guarda, le das las gracias y se
  duerme), con lo que dice cada uno.
- **Estilo**: expresivo (intensidad 1) o sobrio (0,5): cambia cuánto se mueve el cuerpo, no las caras ni los colores.
- **Sonido**: notas cortas hechas con Web Audio para algunas reacciones y, en la conversación, la voz del navegador en
  español; con cada palabra, el plasma late (`ajustar({ nivel })`).
- Con «reducir movimiento», Atlas no salta ni gira: sólo cambian sus ojos y sus colores.
