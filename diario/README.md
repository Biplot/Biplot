# La Línea, el diario de BiPlot

Un newsletter que es un diario de verdad, armado como **un tomo de manga**. Cada edición abre con una **tapa a color**,
como las portadas a color de los tomos: una escena donde el equipo de la oficina actúa la noticia más importante de la
semana (se disfrazan si hace falta: en la N.º 0, Plotty va de FMI, con sombrero de copa, y le corta con unas tijeras
gigantes la línea de crecimiento a Chile). Al abrirlo, el interior es **en blanco y negro**: capítulos con su barra
negra, paneles con borde de tinta, tramas de puntos, líneas de velocidad, onomatopeyas y globos de diálogo, y un folio en
cada página. El capítulo 1 es la portada (los mercados, la noticia principal a todo lo ancho, las otras dos, la nota de
la redacción y el índice «En este tomo»); después vienen Economía y gestión, Tecnología y verificación, Deportes, y
Pasatiempos y avisos. Lo escribe la oficina: Aby abre la edición y el resto del equipo firma su sección, con su cara en el
recuadro de esquina, **dibujada en anime como en la tapa** y pasada al blanco y negro del manga (tinta y trama). El coral sigue siendo
sólo para agendar el diagnóstico: es el botón del aviso «Se busca», la única mancha de color del interior. Las noticias
se juntan solas, pero **ninguna edición sale sin que un socio la apruebe en el CRM**, igual que la vitrina.

Las fuentes son de Google Fonts: Dela Gothic One (titulares y capítulos), Bangers (onomatopeyas y golpes), Archivo
Narrow (el texto), Patrick Hand (los globos) e IBM Plex Mono (fechas, folios y cotizaciones). **No lleva letras
japonesas**, ni en la tapa ni adentro: todo va en castellano. Es un estilo inspirado en el manga y el cómic, sin nombres,
personajes ni logos de ninguna serie o editorial.

- Cada edición en la web: **biplot.cl/diario/AAAA-MM-DD/** (`diario/<fecha>/index.html`).
- La hemeroteca: **biplot.cl/diario/** (`diario/index.html`), con todas las ediciones, la más nueva arriba.
- El correo: `diario/_herramientas/salida/<fecha>-correo.html` (no se sube; se arma de nuevo al enviarlo).
- La N.º 0 (Vol. 0, 19 de octubre de 2026) es la **edición de prueba**: lleva «Edición de prueba» y `noindex`.
  Sus notas se juntaron con búsqueda web, sin poder abrir los artículos (la red del entorno donde se armó no lo permitía):
  antes de enviarla, alguien tiene que abrir cada enlace y confirmar las cifras.
  La hemeroteca también queda `noindex` mientras no haya ninguna edición publicada (sin `"prueba": true`).

## Las secciones y quién las firma

| Sección | Firma | Qué trae |
|---|---|---|
| Portada | Aby (PRENSA) | Las tres noticias de la semana, la primera a todo lo ancho con su «¡Último minuto!», y la nota de la redacción |
| El dato · Economía | Celda (E3) | Un número explicado; la UF, el dólar, el IPSA y el cobre van en «Mercados», al comienzo del capítulo 1 |
| Las máquinas · IA y automatización | The Engine (E4) | IA y automatización aterrizadas: «Qué cambia para una pyme» |
| Sala de planos · Gestión | The Architect (E2) | Una idea de gestión con evidencia: «Para llevar» |
| El caso de la semana | Lupe (E1) | Una tira de tres paneles: lo que pasaba, lo que cambiaron y lo que pasó, con cifras |
| El marcador · Deporte | Felipe (PRENSA) | Contado como un partido, en paneles con líneas de acción y su «¡DON!», y «Lo que viene» |
| ¿Mito o dato? | Tamandúa (E6) | Una afirmación que circula, con su timbre: mito, dato o a medias |
| Para guardar | Pepa (E9) | Una herramienta o un recurso que sirve dos veces |
| A producción · Emprendimiento | Faro (E7) | Lanzamientos y emprendimiento |
| Desde arriba · Internacional | Atlas (360°) | El mundo en pocas líneas |
| Tres preguntas | Plotty (E0) | Los pasatiempos; en la web, las soluciones de cabeza, como en el diario; en el correo, al pie |
| El consultorio | El elefante de Rumbo | «Psst… ¿y tu día?»: algo personal, fuera del negocio, con el enlace a Rumbo (`aparte`) |

Portada, El dato, Las máquinas, Sala de planos, El caso, El marcador y Tres preguntas van siempre; las otras rotan
(sólo salen si la edición las trae). El orden, las firmas, las frases y las etiquetas («Por qué importa», «Para llevar»…)
están en `SECCIONES` y `FIRMAS`, al comienzo de `_herramientas/armar.mjs`, y cómo se reparten en páginas, en `PAGINAS`
(una página que no trae ninguna de sus secciones no sale, y las que siguen corren su número). Las frases son las de la oficina
(`oficina/README.md`); las de Aby y Felipe, como allá, son de ejemplo hasta que ellos las aprueben.

## Las reglas de la redacción

- **Cada nota lleva su fuente**, con el enlace al artículo (no a la portada del medio). `armar.mjs` no arma una edición
  con una nota sin fuente o con una URL que no sea https.
- Una nota necesita una fuente primaria (Banco Central, INE, CMF, el blog oficial de la empresa, el estudio) o de
  referencia (Reuters, AP, EFE, Diario Financiero, La Tercera, HBR…), o dos fuentes independientes.
- **Los resúmenes son nuestros**: dos o tres frases con los hechos, nunca el artículo copiado ni sus fotos (las imágenes
  son las del equipo). La tapa es una ilustración y se dice: «Ilustración hecha con IA a partir de los dibujos del equipo
  de BiPlot», en su pie. Las cifras, tal cual las da la fuente, con su fecha.
- Hecho con ayuda de IA y **revisado por personas**: el pie lo dice, con el nombre de quien edita (`edita`), que es el
  socio que aprobó la edición en el CRM. Una edición de prueba sin `edita` dice, en cambio, que todavía le falta esa
  revisión.
- Los errores se corrigen en la **fe de erratas** de la edición siguiente (`erratas`).
- Los casos de clientes de BiPlot salen sólo con su permiso, como los capítulos de BiPlot.TV.

## Cómo se arma una edición

1. Escribir `_herramientas/ediciones/<fecha>.json` (la fecha es la del lunes en que sale).
2. `node diario/_herramientas/armar.mjs [AAAA-MM-DD]`: escribe la edición web, la hemeroteca y el correo (sin fecha, la
   última). Si falta algo obligatorio, dice qué y no escribe nada.
3. `node diario/_herramientas/fotografiar.mjs [AAAA-MM-DD] [carpeta]`: fotografía la web (1280 y 390 px), el correo (680 y
   390 px) y la hemeroteca para revisarlos. Lo que el correo pide a biplot.cl se sirve desde el repo.
4. Un PR con la edición en este repo (uno por edición), sólo con lo suyo: el JSON, su página, la hemeroteca, su tapa y
   las escenas. El check **«Diario · verificar»** (`.github/workflows/diario.yml`) vuelve a armar cada edición y falla si
   alguna página no sale de su JSON.
5. **La validación, en el CRM**, en su sección **La Línea** (`biplot-crm.vercel.app/la-linea`). El CRM lee de GitHub
   los PR abiertos que traen una edición y la muestra: la tapa (o las escenas para elegirla), lo que trae sección por
   sección con sus fuentes y el enlace a la vista previa de Vercel. Un socio responde cada pregunta en «Sí» o «Ajustar»
   (en una edición de prueba, las del diseño) y:
   - la **aprueba**, o **pide ajustes** con lo que hay que cambiar;
   - si la edición trae escenas, **elige la tapa**.
   Lo decidido queda como comentario del PR, de la App del CRM («biplot-aprobador»), con el nombre de quien decidió y
   cuándo (el repo es público: nunca su correo): así quien arma la edición lo lee ahí. Una aprobación vale para el commit en que se dio; si después cambia algo, vuelve a esperar.
   El socio que aprueba es quien edita: su nombre va en `edita` antes de pedir la validación.
6. **Publicar**, también desde La Línea: «Publicar en biplot.cl» une el PR (lo aprueba antes en GitHub, en ese commit)
   cuando cada edición que trae está aprobada, el PR no trae nada más que sus ediciones, «Diario · verificar» está en
   verde y GitHub dice que se puede unir. Al publicarse `main`, queda en biplot.cl/diario/. Un PR que trae algo más (el
   diseño, las herramientas, como el de la N.º 0) se valida igual en La Línea, pero se une en Aprobaciones o en GitHub. Para que el CRM escriba en el PR y lo una, la App «biplot-aprobador» tiene que estar instalada en
   el repo `Biplot`; sin ella, cada botón abre el PR en GitHub.
7. Enviar el correo desde Brevo.

La N.º 0 es la edición de prueba con que se valida el diseño: en La Línea muestra las preguntas del diseño (la tapa,
las caras, la lectura, el orden, el tono, el aviso, las frases de Aby y Felipe, el nombre y el día).

`node diario/_herramientas/imagenes.mjs` baja al repo las caras y las tapas, ya del tamaño que usa el diario, y vuelve a
sacar el ícono de Rumbo (`rumbo`, en blanco y negro con tinta y trama). Todo queda en PNG o JPEG porque los correos no
muestran WebP ni aplican filtros. `fotografiar.mjs` e `imagenes.mjs` necesitan Playwright (`armar.mjs`, no).

### Las caras

Cada integrante que firma tiene su cara **en anime, en el mismo estilo de la tapa**, en dos versiones: a color (como sale
en la tapa) y en el blanco y negro del manga (tinta, negros planos y trama de puntos), que es la que va en el interior,
en la web y en el correo. Se dibujaron con IA a partir de las fichas del equipo (`biplot.cl/oficina/kit/png/ficha-<id>-4x5.png`)
con la tapa de la N.º 0 como referencia de estilo: un retrato de busto, cuadrado, con su rasgo y su objeto (la pelota
de Felipe, el taladro de The Engine, la lupa de Lupe, el farol de Faro…) sobre rayos cian, y después la misma imagen
pasada a blanco y negro. Sin letras ni números en la imagen, salvo la placa «360°» de Atlas. Atlas no tiene ficha
publicada, así que su referencia fue su cara de cómic del diario, pedida al repo (que es público) por
`raw.githubusercontent.com`; para rehacerla, sirve igual su cara a color (`caras/color/atlas.jpg`).

- `diario/imagenes/caras/<id>.jpg`: la de blanco y negro, 320 × 320, la que usa el diario.
- `diario/imagenes/caras/color/<id>.jpg`: la de color, 640 × 640, para cuando se necesite (la oficina, redes).
- `_herramientas/caras.json`: las caras que todavía no se bajan al repo, con la URL donde quedaron al generarlas (`bn` y
  `color`). Mientras una cara esté en la lista, `armar.mjs` la pide de ahí: en la web, la versión chica en WebP que la
  herramienta deja al lado (`…_min.webp`); en el correo, el PNG.
- `node diario/_herramientas/imagenes.mjs caras` las baja, las deja en `caras/` y las saca de la lista; con la lista
  vacía, el diario usa las del repo. Detrás de un proxy, con `NODE_USE_ENV_PROXY=1` delante.
- Mientras sigan fuera, el correo pesa más (cada PNG es de 1024 px): conviene bajarlas antes de enviarlo.

Para una cara nueva (o para rehacer una): generar la de color con la ficha y la tapa como referencias, después la de
blanco y negro desde la de color, y anotar las dos URL en `caras.json`. Antes de bajarlas, mirarlas: al pasar a blanco y
negro, la IA tiende a rellenar de negro el pelo claro (a Aby y a Lupe hubo que decirle que el suyo queda en blanco, con
trama suave). A The Architect **nunca se le ven los ojos**: lleva lentes opacos con el brillo blanco del anime y el
flequillo le da sombra (más misterioso, pedido del 21-10); en cada tapa donde salga, el prompt lo dice.

### La tapa

1. Elegir la noticia principal y pensar la escena: quién del equipo la actúa, de qué se disfraza, qué objeto la cuenta
   (unas tijeras, una balanza, un marcador). Sin texto en la imagen, salvo una cifra o una sigla si la escena la necesita.
   Las dos o tres escenas propuestas se eligen en La Línea, en el CRM: cada una se baja con
   `node diario/_herramientas/imagenes.mjs escena AAAA-MM-DD a <url>` (queda en `diario/_herramientas/escenas/`, que no se
   publica) y va en el JSON como `"escenas": [{ "imagen": "_herramientas/escenas/AAAA-MM-DD-a.jpg", "escena": "…" }]`,
   sin `tapa`. Cuando un socio elige una, se pone como tapa y se saca `escenas`.
2. Generarla con IA a partir de los dibujos del equipo (`oficina/ilustraciones.js` y los que están en biplot.cl), en el
   estilo de las portadas a color de manga: tinta, color plano, sombras duras. Formato vertical, 2:3.
3. Bajarla al repo: `node diario/_herramientas/imagenes.mjs tapa AAAA-MM-DD <url>` la guarda en
   `diario/imagenes/tapas/<fecha>.jpg` (1200 px de ancho) y dice qué poner en el JSON.
4. En el JSON, `tapa.src` con esa ruta (`imagenes/tapas/<fecha>.jpg`), `tapa.alt` describiendo la escena y `tapa.pie`.

Mientras la tapa no esté en el repo, `src` puede ser la URL https donde quedó al generarla: la web y el correo la piden
de ahí. Sin `tapa`, la edición sale con una tapa tipográfica (el nombre, el volumen y el titular).

### El JSON de una edición

```jsonc
{
  "numero": 0,
  "fecha": "2026-10-19",
  "prueba": true,                         // la N.º 0; las ediciones de verdad no lo llevan
  "cubre": "Semana del 12 al 18 de octubre",
  "edita": "Nombre de quien la revisó",
  "previa": "El texto que el correo muestra junto al asunto",
  "redaccion": ["Párrafo de Aby", "…"],
  "indicadores": [{ "nombre": "UF", "valor": "$39.000,00", "nota": "lunes 19", "fuente": { "medio": "…", "url": "https://…" } }],
  "tapa": { "src": "imagenes/tapas/2026-10-19.jpg", "alt": "La escena, descrita", "pie": "…" },   // opcional
  "escenas": [{ "imagen": "_herramientas/escenas/2026-10-26-a.jpg", "escena": "…" }],   // mientras se elige la tapa
  "portada": [nota, nota, nota],          // la primera va a todo lo ancho; su «importa» va en el globo de Aby
  "dato": { "valor": "4,1%", "leyenda": "IPC a 12 meses", ...nota },
  "maquinas": [nota, …], "planos": [nota, …],
  "caso": { "titular": "…", "bajada": ["…"], "antes": "…", "cambio": "…", "resultado": "…", "fuentes": [fuente] },
  "marcador": { "notas": [nota, …], "agenda": [{ "fecha": "mar 20", "texto": "…" }] },
  "mito": [{ "afirmacion": "…", "veredicto": "mito | dato | a medias", "bajada": ["…"], "fuentes": [fuente] }],
  "guardar": [nota], "lanzamientos": [nota], "mundo": [nota],   // las que rotan
  "preguntas": [{ "pregunta": "…", "respuesta": "…" }],
  "aparte": { "titulo": "…", "texto": "…", "enlace": "https://rumbo.biplot.cl/conoce" },
  "erratas": ["…"]
}
// nota   = { "titular": "…", "bajada": ["…"], "importa": "…", "cifra": { "valor": "3-1", "leyenda": "…" }, "fuentes": [fuente] }
// fuente = { "medio": "Diario Financiero", "url": "https://…" }
```

En los textos se puede usar `**negrita**` y `*cursiva*`; nada más.

## El correo

Tablas de 600 px con los estilos en línea, que es lo que respetan Gmail, Outlook y Apple Mail: la tapa a color arriba
(una imagen enlazada a la edición en la web) y, abajo, el interior en blanco y negro, con la barra negra de cada capítulo,
los paneles, los globos y el aviso «Se busca» con su botón coral. Las soluciones de «Tres preguntas», las fuentes y la fe
de erratas van al pie. Gmail y Outlook no cargan las fuentes del tomo, así que los titulares caen en Arial Black y el
texto en Arial Narrow o Arial (Apple Mail sí carga las fuentes). Las caras y el ícono se piden a
https://biplot.cl/diario/imagenes/, así que se ven recién cuando están publicadas (las caras que siguen en `caras.json`,
desde donde quedaron al generarlas).
El correo se envía con **Brevo**. El enlace para darse de baja es `BAJA` en `armar.mjs`: la etiqueta de Brevo,
`{{ unsubscribe }}`, que Brevo cambia por el enlace de cada suscriptor al enviar. Si algún día se cambia de plataforma,
se cambia esa etiqueta.

## Lo que viene

- `fuentes.json` y `recolectar.mjs`: los RSS y las API de cada sección, para que la edición parta de lo que publicaron las
  fuentes de la semana.
- `redactar.mjs`: la API de Claude escribe el JSON con este manual de estilo, y una segunda pasada (la de Tamandúa)
  compara cada frase con el texto de su fuente.
- Un workflow semanal que deja el borrador como PR, para que un socio lo valide en La Línea (con el token de una App
  de la org: un PR abierto con el `GITHUB_TOKEN` del workflow no hace correr «Diario · verificar»).
- El envío por Brevo desde La Línea, después de publicar.
- El quiosco de la plaza de la oficina, que vende el último tomo.
- Un campo `escena` en el JSON (quién actúa, de qué se disfraza, qué objeto usa) para que la tapa se pida sola.
