# La semana de La Línea

Cómo sale cada edición, de la recolección al correo. Es el estándar: se escribió recorriendo de punta a punta la
edición de práctica del lunes 12 de octubre de 2026 (la semana del 5 al 11), y los tiempos de abajo son los de esa
corrida. Lo que el diario es y cómo se ve está en `../README.md`; esto es cómo se hace cada semana.

## Quién hace qué

- **La redacción**: Claude, en una sesión de Claude Code con este repo. Recolecta, elige la principal, propone las
  escenas de la tapa, redacta el JSON, lo hace verificar, arma la edición y abre su PR.
- **Tamandúa**: una segunda pasada con IA, de un agente distinto del que redactó. Compara cada frase y cada cifra con
  su fuente antes de abrir el PR.
- **El socio de turno**: Hernán o Christopher, el que se acordó para esa semana. Elige la tapa, responde las
  preguntas, aprueba y publica en **La Línea** del CRM (`biplot-crm.vercel.app/la-linea`) y envía el correo desde
  Brevo. Su nombre va en `edita` antes de pedir la validación: una edición de verdad sin `edita` no se aprueba.

## El calendario

Hora de Chile. La edición cubre de lunes a domingo y sale el lunes siguiente, con la fecha de ese lunes.

| Cuándo | Qué | Quién | En la práctica |
|---|---|---|---|
| jueves, 18:00 | Primera recolección, de lunes a jueves: candidatas por sección | redacción | — |
| domingo, 10:00 | Cierre de la recolección (viernes a domingo) y la principal | redacción | 24 min, cuatro búsquedas en paralelo |
| domingo, 10:30 | Tres escenas para la tapa | redacción | 4 min, más 6 de rehacer dos |
| domingo, 11:00 | Redacción del JSON | redacción | 10 min |
| domingo, 11:30 | Verificación y correcciones | Tamandúa y redacción | 17 min, más 10 de correcciones |
| domingo, 12:30 | Armar, fotografiar, revisar las capturas y abrir el PR | redacción | 10 min |
| domingo, en la tarde | Elegir la tapa en La Línea | socio | — |
| domingo, 20:00 | Poner la tapa elegida, sacar `escenas` y subir | redacción | — |
| lunes, 7:30 | Responder las preguntas, aprobar y «Publicar en biplot.cl» | socio | — |
| lunes, 8:00 | Enviar el correo desde Brevo | socio | — |
| durante la semana | Anotar lo que haya que corregir | todos | — |

La redacción corre sola con las tareas programadas de la sesión (jueves y domingo); el socio sólo entra a La Línea dos
veces: el domingo para la tapa y el lunes para aprobar y publicar. Si el lunes es feriado, la edición sale igual con
esa fecha, y la nota de la redacción dice qué indicadores son del viernes.

## 1. La recolección

- **La ventana**: de lunes 00:00 a domingo 23:59 de la semana que se cubre. Lo que pasó después no entra, salvo en «Lo
  que viene». Cada artículo lleva su fecha de publicación anotada.
- **Las fuentes**: una primaria (INE, Banco Central, CMF, SII, Tesorería, Hacienda, el anuncio de la propia empresa, el
  estudio) o una de referencia (Diario Financiero, La Tercera, Emol, BioBioChile, Cooperativa, CNN Chile, El
  Mostrador, Harvard Business Review…), o dos independientes. Dos medios que repiten el mismo despacho de agencia
  cuentan como uno. El contenido pagado (BrandCorner, publirreportajes) no es fuente.
- **Leer completo**: cada artículo se baja y se lee entero; los resúmenes del buscador no sirven. Lo que no se pudo
  abrir, no se usa. Si un sitio bloquea, no se esquiva el bloqueo: se busca otra fuente.
- **Desde la nube no abren**: Reuters, AP, EFE, Bloomberg, openai.com, blog.google, TechCrunch y The Verge. bcentral.cl
  bloquea bots, pero `si3.bcentral.cl` (indicadores diarios) sí abre. Emol a veces entrega sólo el título y la bajada:
  si es así, no cuenta como leído.
- **Las notas**, una por sección (economía, gestión, tecnología y mundo, deportes), cada candidata con: fecha, hechos
  con las cifras exactas y su fecha, la URL https del artículo (no la portada del medio), si se leyó completo, la
  confianza y, al final, lo descartado y por qué. Las cuatro búsquedas van en paralelo.
- **Los indicadores del lunes**: la UF de ese lunes (tabla del SII), y el dólar, el MSCI IPSA y el cobre del viernes
  (DF y el informe semanal de Cochilco), cada uno con su fuente. Si dos medios dan cierres distintos, se usa uno y se
  cita ese.

## 2. La principal y la tapa

- **La principal** es la noticia que más le cambia algo a una pyme esa semana, no la más ruidosa. En la práctica fue la
  Ley de Reconstrucción (el impuesto a las empresas baja de 27% a 23%), por sobre el IPC, que sale todos los meses.
- **Tres escenas**, cada una con dos o tres integrantes del equipo que actúan la noticia (se disfrazan si hace falta) y
  una idea distinta: en la práctica, una escalera en obra que baja del 27% al 23%, un ascensor y una goma que borra
  intereses y multas.
- **Las referencias** se suben a Higgsfield desde el repo: las caras a color (`diario/imagenes/caras/color/`) de quienes
  actúan y la tapa anterior como referencia de estilo. Modelo `nano_banana_pro`, 2:3, 2k. El prompt pide el mismo logo
  «LA LÍNEA», el «VOL. N» en el círculo amarillo y la faja blanca con el titular corto y «El diario de BiPlot · Lunes D
  de mes de AAAA».
- **Mirar cada escena antes de proponerla**: números y palabras bien escritos y una sola vez (en la práctica, el dial
  del ascensor repetía el 23 y una escalera rehecha repetía el 23%), sin letras japonesas, cada integrante reconocible y
  **The Architect sin ojos a la vista y con su barba italiana**.
- **Para corregir una escena, editarla** (la imagen como referencia y «cambia sólo esto, deja todo lo demás igual»)
  antes que generarla de nuevo: así no se pierde lo que ya estaba bien.
- Cada una se baja con `node diario/_herramientas/imagenes.mjs escena AAAA-MM-DD a <url>` y va en `escenas`, sin
  `tapa`. Detrás del proxy, con `NODE_USE_ENV_PROXY=1`.

## 3. La redacción

- **Cuánto cabe**: portada, tres notas (la principal, a todo lo ancho; si las otras dos son mucho más largas, la
  principal queda con un hueco); el dato, una; sala de planos, dos; las máquinas, dos o tres; ¿mito o dato?, una o dos;
  el marcador, **tres** (una fila) y cuatro líneas de «Lo que viene»; desde arriba, tres; para guardar, una o dos; a
  producción, dos; tres preguntas; el consultorio.
- **El caso de la semana sale sólo si hay uno que cumple**: una empresa real (nunca un cliente de BiPlot sin su
  permiso), con cifras de antes y de después, en una fuente de referencia que no sea contenido pagado. Si no hay, no
  sale. En la práctica no hubo: el mejor candidato era un aviso pagado.
- **El tono**: tuteo, frases cortas, sin relleno. Las cifras, tal cual las da la fuente, con su fecha y su día («el
  jueves 8»). Lo que es proyección, estimación o fuente anónima va atribuido («según DF, que cita a fuentes que
  conocen el proceso»).
- **«Por qué importa», «Para llevar» y «Para qué sirve»**: un consejo concreto para una pyme, sin cifras que no estén
  en las fuentes de esa nota.
- **Si la nota es sobre una herramienta con que se hace La Línea** (Claude, de Anthropic), la nota lo dice.
- **Tres preguntas**: sobre lo que trae la misma edición, con la respuesta en una frase.
- **El asunto del correo** es el titular de la faja de la tapa («La Línea: el impuesto baja de 27% a 23%»), y `previa`,
  el texto que se ve junto a él.
- Una edición de prueba o de práctica lleva `"prueba": true`: no se indexa ni se envía.

## 4. La verificación

- Un agente distinto del que redactó (Tamandúa) recorre cada frase y cada cifra del JSON contra el texto de su fuente:
  número, unidad, fecha, día de la semana, atribución y que nada dependa de lo publicado después del domingo. Entrega
  cada problema con lo que dice la nota, lo que dice la fuente, la corrección y la gravedad.
- Se corrige todo lo de gravedad alta y media antes de abrir el PR; lo que no se pudo verificar se dice en el PR.
- En la práctica encontró 27 problemas: 1 alto (el plazo del F29 para quien paga con mandato al banco no era el martes
  13, sino el día 11), 14 medios y 12 de estilo. Los medios fueron casi todos de atribución: una causa dicha como única
  («la causa es la guerra»), una cifra de todas las organizaciones atribuida sólo a las pymes, un precio a media tarde
  presentado como cierre, un titular que daba por hecho lo que venía de fuentes anónimas, y datos tomados de notas
  publicadas después del domingo.
- La Línea del CRM lee la edición con un esquema estricto: un campo que el CRM no conoce o un enlace que no sea https
  impiden aprobarla. Conviene probarlo antes del PR con `leerEdicion` de `biplot-crm/src/lib/la-linea.ts`.

## 5. Armar y el PR

- `node diario/_herramientas/armar.mjs AAAA-MM-DD` y `node diario/_herramientas/fotografiar.mjs AAAA-MM-DD <carpeta>`.
  Mirar las capturas: la portada (que la principal no quede con un hueco grande), el marcador, el correo a 390 px.
- **Una rama y un PR por edición**: la rama `diario/AAAA-MM-DD`, desde `main`, y el PR sólo con lo suyo: el JSON, su
  página, la hemeroteca, su tapa y sus escenas. Con algo más, La Línea no lo publica (se une en Aprobaciones o en
  GitHub). El check **«Diario · verificar»** vuelve a armar cada edición y tiene que quedar en verde.
- En la descripción del PR: la principal y por qué, lo que no se pudo verificar y lo que el socio debería mirar.

## 6. Validar, publicar y enviar

1. **El domingo, el socio elige la tapa** en La Línea. La redacción la baja con
   `node diario/_herramientas/imagenes.mjs tapa AAAA-MM-DD <url>`, la pone en `tapa` (con `alt` y el `pie` «La escena de
   la semana: … Ilustración hecha con IA a partir de los dibujos del equipo de BiPlot.»), saca `escenas` y sube.
2. **El lunes, el socio responde las preguntas** y la aprueba o pide ajustes. Lo que decide queda como comentario del PR,
   con su nombre: el repo es público, así que nada privado en las notas. Con ajustes pedidos, la redacción los hace y
   la edición vuelve a esperar su validación.
3. **«Publicar en biplot.cl»** aprueba el PR en GitHub y lo une; Vercel la deja en `biplot.cl/diario/AAAA-MM-DD/` en
   unos minutos.
4. **El correo, desde Brevo**: una campaña nueva con el HTML de `diario/_herramientas/salida/AAAA-MM-DD-correo.html`
   (`armar.mjs` lo arma; no se sube al repo), el asunto y la previa de arriba, una prueba a los dos socios y, si se ve
   bien en Gmail y en el celular, el envío a la lista.

## 7. Después

- Lo que haya que corregir va en `erratas` de la edición siguiente, con la fecha de la nota corregida.
- Lo que la recolección no alcanzó a cubrir y sigue vigente (en la práctica, la publicación de la Ley de
  Reconstrucción en el Diario Oficial, el sábado 17) es candidato para la semana que viene.

## Lo que dejó la práctica

- Cuatro búsquedas en paralelo cubren la semana en unos 25 minutos; la de economía es la más importante y la que más
  fuentes primarias tiene.
- Las fuentes se contradicen a menudo en detalles (cierres del dólar, minutos de un gol, cuántos goles marcó una
  jugadora): se elige una, se cita esa, o se dice que hay dos versiones.
- Las imágenes se equivocan en los números: hay que mirarlas siempre antes de proponerlas.
- «Lo que viene» se escribe con lo que se sabía el domingo. Si la edición se arma después (como la práctica), se deja
  fuera lo que ya se sabe que se suspendió y el PR lo dice: es preferible a publicar una agenda que se sabe falsa.
- Una edición de práctica (`"prueba": true`) muestra en La Línea las preguntas del diseño, no las de la semana: el CRM
  todavía no distingue una de otra.
