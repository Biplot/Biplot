# Tres preguntas con Plotty (propuesta)

En vez de un formulario, la conversación de la recepción de BiPlot HQ (E0) en una página propia: Plotty en 3D, con sus
colores reales, hace sus tres preguntas y reacciona a cada respuesta. Si calificas, su antena se pone coral y te invita a
**Agenda tu diagnóstico**, que abre WhatsApp con tus tres respuestas listas para enviar. Si no, te invita a recorrer la
oficina. En los dos casos te muestra los casos más cercanos a tu rubro.

- Dirección: `/propuestas/tres-preguntas/` (no indexada). Es una propuesta: todavía no la enlaza el sitio.
- Para probarla en local: `npx http-server . -p 8080` en la raíz del repo y abrir
  http://localhost:8080/propuestas/tres-preguntas/ (como archivo suelto no carga: los módulos necesitan un servidor).
- No se guarda ni se envía nada: las respuestas sólo salen de la página si la persona toca un enlace a WhatsApp.

## De dónde sale cada cosa

| Qué | De dónde |
|---|---|
| Las tres preguntas y sus opciones, el saludo y los dos finales (`califica` y `noCalifica`) | `plotty` en `oficina/datos.js`: el mismo chat de la recepción de la oficina. Si cambian ahí, cambian aquí |
| Quién califica | `noCalifican` en `oficina/datos.js` (hoy, menos de 5 horas a la semana); «No sé» califica |
| El número de WhatsApp y el texto del botón | `whatsapp` y `cta` en `oficina/datos.js` |
| Los casos como el tuyo | La vitrina de la oficina (`vitrina.rubros` en `oficina/datos.js`): las salas de la calle llevan a su sala en la oficina (`/oficina/#fundos`) y los casos de referencia, a su caso (`oficina/casos/…`) |
| Lo que dice Plotty entre pregunta y pregunta, «Déjame ver…» y el mensaje de WhatsApp | `REACCIONES` y `MENSAJE` en `preguntas.js`: son borradores de esta página |
| Plotty en 3D | `assets/avatares3d/` (ver su README) |

## La conversación

| Momento | Plotty |
|---|---|
| Al llegar | `greeting`: saluda con la mano y guiña; después `listening` |
| Cada pregunta | `listening`: ladea la cabeza y mira las opciones (o el cursor) |
| Al responder | `happy`; con «Más de 15», `surprised`; con «No sé», `thinking`. Mientras escribe, `thinking` y los puntos suspensivos |
| Si calificas | `califica`: la antena se pone coral, saluda y apunta a «Agenda tu diagnóstico». La página da un saltito |
| Si no calificas | `idle`: tranquilo, te invita a recorrer la oficina o a escribir igual |

- Arriba de la conversación, el avance de las tres preguntas (tu negocio, tu operación, tus horas). Al final, el resumen
  de tus respuestas, el camino que corresponde, los casos como el tuyo y «Empezar de nuevo».
- Las opciones son botones: se responde con el mouse, con el dedo o con el teclado (el foco pasa a la primera opción de
  cada pregunta y, al final, al botón principal). La conversación se anuncia a los lectores de pantalla.
- Plotty mira el cursor; sin cursor (o con el teclado), mira la opción con foco o lo último de la conversación.
- En el celular, Plotty va arriba en grande. Con la primera respuesta se achica y queda fijo arriba, para que se le vean
  las reacciones mientras la conversación sigue abajo.
- Con «reducir movimiento», los mensajes aparecen sin animación y casi sin espera, y Plotty no flota ni gira.
- El coral es sólo para «Agenda tu diagnóstico» y para la antena de Plotty cuando te invita a ese botón.

## Para llevarla al sitio

Hoy «Conversar con Plotty» lleva a la recepción de la oficina (`oficina/#conversar`). Esta página puede reemplazar ese
destino o quedar como la página de las tres preguntas para campañas y redes. Conviene que el 3D cargue sólo aquí: pesa
unos 190 KB con gzip.
