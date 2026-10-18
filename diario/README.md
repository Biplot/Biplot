# La Línea, el diario de BiPlot

Un newsletter con forma de diario: cabecera con filetes dobles, la franja de datos, portada y secciones, cada una
firmada por un integrante de la oficina, y al pie la línea que termina en el punto coral («Agenda tu diagnóstico»). Lo
escribe la oficina: Aby abre la edición y el resto del equipo firma su sección. Las noticias se juntan solas, pero
**ninguna edición sale sin que una persona la apruebe**, igual que la vitrina.

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
| Portada | Aby (PRENSA) | Las tres noticias de la semana, la primera en grande, y la nota de la redacción |
| El dato · Economía | Celda (E3) | Un número explicado; la UF, el dólar, el IPSA y el cobre van en la franja de la cabecera |
| Las máquinas · IA y automatización | The Engine (E4) | IA y automatización aterrizadas: «Qué cambia para una pyme» |
| Sala de planos · Gestión | The Architect (E2) | Una idea de gestión con evidencia: «Para llevar» |
| El caso de la semana | Lupe (E1) | Lo que pasaba, lo que cambiaron y lo que pasó, con cifras |
| El marcador · Deporte | Felipe (PRENSA) | Contado como un partido; la sección en tinta, con el marcador y «Lo que viene» |
| ¿Mito o dato? | Tamandúa (E6) | Una afirmación que circula, con su timbre: mito, dato o a medias |
| Para guardar | Pepa (E9) | Una herramienta o un recurso que sirve dos veces |
| A producción · Emprendimiento | Faro (E7) | Lanzamientos y emprendimiento |
| Desde arriba · Internacional | Atlas (360°) | El mundo en pocas líneas |
| Tres preguntas | Plotty (E0) | Para cerrar; en la web, «Ver respuesta»; en el correo, las respuestas al pie |
| El aparte | El elefante de Rumbo | «Psst… ¿y tu día?»: algo personal, fuera del negocio, con el enlace a Rumbo |

Portada, El dato, Las máquinas, Sala de planos, El caso, El marcador y Tres preguntas van siempre; las otras rotan
(sólo salen si la edición las trae). El orden, las firmas, las frases y las etiquetas («Por qué importa», «Para llevar»…)
están en `SECCIONES` y `FIRMAS`, al comienzo de `_herramientas/armar.mjs`. Las frases son las de la oficina
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

`node diario/_herramientas/firmas.mjs` vuelve a sacar las caras de quienes firman (`diario/firmas/<id>.png`, 160 × 160)
desde el kit de la oficina, en PNG porque los correos no muestran WebP. Las tres herramientas necesitan Playwright.

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
  "portada": [nota, nota, nota],          // la primera va en grande
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

Tablas de 600 px con los estilos en línea, que es lo que respetan Gmail, Outlook y Apple Mail. Gmail y Outlook no cargan
Cormorant ni Mulish: ahí se ve en Georgia y Arial, que son su respaldo (Apple Mail sí carga las fuentes de la marca).
Las imágenes (las caras y el ícono de Rumbo) se piden a https://biplot.cl/, así que se ven recién cuando están publicadas.
El enlace para darse de baja es `BAJA` en `armar.mjs` (hoy, el marcador `{{baja}}`): se cambia por la etiqueta de la
plataforma que se elija (en Buttondown, `{{ unsubscribe_url }}`; en Brevo, `{{ unsubscribe }}`).

## Lo que viene

- `fuentes.json` y `recolectar.mjs`: los RSS y las API de cada sección, para que la edición parta de lo que publicaron las
  fuentes de la semana.
- `redactar.mjs`: la API de Claude escribe el JSON con este manual de estilo, y una segunda pasada (la de Tamandúa)
  compara cada frase con el texto de su fuente.
- Un workflow semanal que deja el borrador como PR para que una persona lo apruebe.
- El quiosco de la plaza de la oficina, que vende la última edición.
