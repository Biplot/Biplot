# La Línea, el diario de BiPlot

Un newsletter que es un diario de verdad, en su edición de **Gotham**: hojas de papel de diario envejecido, con grano,
sobre la ciudad de noche; la cabecera «La Línea» en letra gótica, con sus orejas; titulares condensados en mayúsculas,
texto en columnas y un folio en cada página. La portada trae el titular a todo lo ancho, la foto con trama de puntos, la
nota de la redacción y el índice («En esta edición»); después vienen las páginas (Economía y gestión, Tecnología y
verificación, Deportes, Pasatiempos y avisos). Lo escribe la oficina: Aby abre la edición y el resto del equipo firma su
sección, con su cara en la **paleta de la noche** (el color baja, las sombras se van al acero y las luces al farol). El
coral sigue siendo sólo para agendar el diagnóstico: es el botón del aviso «Se busca», la única mancha de color del
diario. Las noticias se juntan solas, pero **ninguna edición sale sin que una persona la apruebe**, igual que la vitrina.

Las fuentes son de Google Fonts: UnifrakturMaguntia (la cabecera), Oswald (los titulares), Old Standard TT (el texto) y
Courier Prime (fechas, folios y cotizaciones). Es un estilo inspirado en los diarios de Gotham, sin nombres ni símbolos
de Batman.

- Cada edición en la web: **biplot.cl/diario/AAAA-MM-DD/** (`diario/<fecha>/index.html`).
- La hemeroteca: **biplot.cl/diario/** (`diario/index.html`), con todas las ediciones, la más nueva arriba.
- El correo: `diario/_herramientas/salida/<fecha>-correo.html` (no se sube; se arma de nuevo al enviarlo).
- La N.º 0 (19 de octubre de 2026) es la **edición de prueba**: lleva «Edición de prueba» en la cabecera y `noindex`.
  Sus notas se juntaron con búsqueda web, sin poder abrir los artículos (la red del entorno donde se armó no lo permitía):
  antes de enviarla, alguien tiene que abrir cada enlace y confirmar las cifras.
  La hemeroteca también queda `noindex` mientras no haya ninguna edición publicada (sin `"prueba": true`).

## Las secciones y quién las firma

| Sección | Firma | Qué trae |
|---|---|---|
| Portada | Aby (PRENSA) | Las tres noticias de la semana, la primera a todo lo ancho, la foto y la nota de la redacción |
| El dato · Economía | Celda (E3) | Un número explicado; la UF, el dólar, el IPSA y el cobre van en «Mercados», bajo la cabecera |
| Las máquinas · IA y automatización | The Engine (E4) | IA y automatización aterrizadas: «Qué cambia para una pyme» |
| Sala de planos · Gestión | The Architect (E2) | Una idea de gestión con evidencia: «Para llevar» |
| El caso de la semana | Lupe (E1) | Lo que pasaba, lo que cambiaron y lo que pasó, con cifras |
| El marcador · Deporte | Felipe (PRENSA) | Contado como un partido; los resultados en una caja en negativo y «Lo que viene» |
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
  son las del equipo). Las cifras, tal cual las da la fuente, con su fecha.
- Hecho con ayuda de IA y **revisado por personas**: el pie lo dice, con el nombre de quien edita (`edita`). Una edición de
  prueba sin `edita` dice, en cambio, que todavía le falta esa revisión.
- Los errores se corrigen en la **fe de erratas** de la edición siguiente (`erratas`).
- Los casos de clientes de BiPlot salen sólo con su permiso, como los capítulos de BiPlot.TV.

## Cómo se arma una edición

1. Escribir `_herramientas/ediciones/<fecha>.json` (la fecha es la del lunes en que sale).
2. `node diario/_herramientas/armar.mjs [AAAA-MM-DD]`: escribe la edición web, la hemeroteca y el correo (sin fecha, la
   última). Si falta algo obligatorio, dice qué y no escribe nada.
3. `node diario/_herramientas/fotografiar.mjs [AAAA-MM-DD] [carpeta]`: fotografía la web (1280 y 390 px), el correo (680 y
   390 px) y la hemeroteca para revisarlos. Lo que el correo pide a biplot.cl se sirve desde el repo.
4. Una persona la revisa y la aprueba (en el PR); al publicarse `main`, la edición queda en biplot.cl/diario/.
5. Se envía el correo desde la plataforma de envío.

`node diario/_herramientas/imagenes.mjs` vuelve a sacar las imágenes del diario, todas con la paleta de la noche, a
`diario/imagenes/`: las caras de quienes firman (`caras/<id>.png`, 160 × 160, desde el kit de la oficina), la foto de la
portada (`prensa.jpg`: Aby y Felipe bajo el farol, con la trama de puntos; una edición puede traer otra en `foto`), el
ícono de Rumbo (`rumbo.png`) y la cabecera en letra gótica para el correo (`cabecera.png`). Van en PNG y JPEG porque los
correos no muestran WebP. Las tres herramientas necesitan Playwright.

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
  "portada": [nota, nota, nota],          // la primera va a todo lo ancho; su «importa» es la bajada del titular
  "foto": { "src": "imagenes/prensa.jpg", "pie": "…" },   // opcional: sin ella, la de Aby y Felipe
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

Tablas de 600 px con los estilos en línea, que es lo que respetan Gmail, Outlook y Apple Mail: la hoja de papel sobre la
noche, la barra negra de cada página y el aviso «Se busca» con su botón coral. Gmail y Outlook no cargan las fuentes del
diario, así que la cabecera gótica va como imagen (`imagenes/cabecera.png`), los titulares caen en Arial Narrow y el texto
en Georgia (Apple Mail sí carga las fuentes). Las imágenes se piden a https://biplot.cl/diario/imagenes/, así que se ven
recién cuando están publicadas.
El enlace para darse de baja es `BAJA` en `armar.mjs` (hoy, el marcador `{{baja}}`): se cambia por la etiqueta de la
plataforma que se elija (en Buttondown, `{{ unsubscribe_url }}`; en Brevo, `{{ unsubscribe }}`).

## Lo que viene

- `fuentes.json` y `recolectar.mjs`: los RSS y las API de cada sección, para que la edición parta de lo que publicaron las
  fuentes de la semana.
- `redactar.mjs`: la API de Claude escribe el JSON con este manual de estilo, y una segunda pasada (la de Tamandúa)
  compara cada frase con el texto de su fuente.
- Un workflow semanal que deja el borrador como PR para que una persona lo apruebe.
- El quiosco de la plaza de la oficina, que vende la última edición.
