# Atlas · la página con voz sobre la Bóveda BiPlot

Atlas es el asistente de Chris sobre su Bóveda BiPlot (el wiki de Obsidian en `4ChrisM/boveda-biplot`): una página
privada, con contraseña, que se abre en el PC o se instala en el iPhone. Le hablas (o le escribes) y te responde en voz
alta, citando las páginas de donde sacó cada dato; al abrirla te da el resumen del día; y anota en la bóveda lo que le
pidas, siempre mostrándote el cambio antes de guardarlo. Es la opción 2 de la propuesta «Atlas, tu Jarvis», con Claude
Sonnet 5.5 y las 22 reacciones de `propuestas/reacciones-atlas/`.

## Cómo se usa

- **Entrar**: la contraseña de `ATLAS_CLAVE` (Atlas no mira mientras la escribes). La sesión dura 30 días.
- **Despertarlo**: al abrir la página, Atlas duerme; tócalo y despierta con el resumen del día (lo último del registro,
  los pendientes de prioridad alta y las preguntas guardadas). Se vuelve a dormir tras 4 minutos sin hablarle.
- **Hablarle**: el botón del micrófono, tocar a Atlas o la barra espaciadora (en el PC). También se le puede escribir.
  Mientras busca, lee y responde, reacciona: atento, escuchando, buscando, leyendo, ¡lo encontré!, hablando…
- **Las citas**: cada respuesta trae las páginas que usó. Al tocarlas se leen ahí mismo, con el enlace para abrirlas
  en Obsidian (en el PC).
- **Anotar**: «Anota que el lunes reviso el v44 con Hernán». Atlas propone el cambio (la página, la sección y la línea
  del registro) y espera tu OK: el botón Guardar o decirle «sí». Con «no» lo descarta; con «Cambiar», le dices qué.
  Al guardar hace un commit en la copia privada de GitHub; en el PC aparece con el próximo `git pull`.
- **Ajustes** (el engranaje): estilo sobrio o expresivo, sonidos, si te lee las respuestas, qué voz usa, lo que lleva
  gastado hoy en Claude, y salir.
- **En el iPhone**: Safari → Compartir → «Agregar a pantalla de inicio». Queda como app.

## Cómo funciona

```
public/  la página (HTML, CSS y JS sin compilar) + Atlas en 3D (se copia de assets/avatares3d al armar)
api/     las funciones de Vercel: entrar, salir, sesion, resumen, charla (la conversación), pagina, guardar
lib/     boveda (leer, buscar, cambiar y guardar), atlas (Claude y sus herramientas), resumen, sesion, simulado
```

1. **La bóveda** (`lib/boveda.js`): baja la copia de GitHub de una vez (el `.tar.gz` del último commit) y la tiene en
   memoria; cada 15 segundos revisa si hay un commit nuevo. Sólo lee las páginas del wiki (`Biplot/**/*.md`, sin `raw/`)
   y el `CLAUDE.md`. Busca por nombre, alias y contenido, sin importar tildes.
2. **Una pregunta** (`api/charla.js` → `lib/atlas.js`): Claude Sonnet 5.5 con el `CLAUDE.md` y el índice de la bóveda
   en el prompt (en caché) y tres herramientas: `buscar_en_boveda`, `leer_pagina` y `proponer_cambio`. La respuesta
   llega por partes (server-sent events): qué está haciendo (para las reacciones), el texto a medida que se escribe y,
   al final, las páginas citadas y lo que costó. El tono de cada respuesta (normal, encontrado, duda, alerta,
   preocupado, alegre, risa, celebrar o buenasnoches) viene en una etiqueta que la página no muestra.
3. **Anotar**: `proponer_cambio` no guarda nada. Arma el cambio contra la bóveda de ese momento y lo manda firmado a la
   página. Cuando Chris dice que sí, `api/guardar.js` comprueba la firma, lo vuelve a aplicar sobre lo último de la
   bóveda y hace **un solo commit** con la página (y su `actualizado:` de hoy) y la línea del registro en `log.md`
   (`## [AAAA-MM-DD] nota | …`). Sólo edita páginas que ya existen; nunca el índice ni el log a mano.
4. **El resumen del día** (`lib/resumen.js`) no pasa por Claude: sale del registro y de «Pendientes abiertos».
5. **La voz** es la del navegador: escuchar con su reconocimiento de voz (Chrome, Edge y Safari del iPhone; Firefox no
   tiene) y hablar con su síntesis, frase por frase a medida que llega la respuesta. Cada palabra hace latir el plasma.

### Seguridad

- Todo pide sesión: una cookie firmada (`ATLAS_SECRETO`), `HttpOnly`, `Secure` y `SameSite=Strict`, que sólo da la
  contraseña de `ATLAS_CLAVE`. Las claves de Anthropic y GitHub viven en Vercel y nunca llegan a la página.
- Lo que se guarda es exactamente lo que Atlas propuso: la propuesta va firmada y vence en 2 horas.
- Política de contenido estricta (sin scripts de afuera), `noindex` y sin iframes (`vercel.json`).
- El token de GitHub sólo debe tener acceso a `boveda-biplot` (ver abajo). Atlas no repite claves aunque aparezcan.

### Costo

Con Claude Sonnet 5.5 a esfuerzo `low` (lo más rápido para la voz), una pregunta típica (leer el índice en caché y
dos o tres páginas) cuesta del orden de US$0,03; el gasto de cada respuesta y el del día se ven en los ajustes. El
resumen del día y la voz no cuestan. Se puede cambiar el modelo o el esfuerzo con `ATLAS_MODELO` y `ATLAS_ESFUERZO`.

## Publicarla en Vercel

1. **Un proyecto nuevo en Vercel** importando el repositorio donde viva Atlas. Si es este repo, con *Root Directory*
   `atlas` (y «Include files outside the root directory» activado, para copiar a Atlas en 3D de `assets/`). El resto
   lo dice `vercel.json`: arma con `npm run build` y sirve `public/`.
2. **Las variables** (Settings → Environment Variables), como en `.env.ejemplo`:
   - `ANTHROPIC_API_KEY`: la clave de Anthropic (la de Aibi u otra).
   - `GITHUB_TOKEN`: en GitHub, Settings → Developer settings → Personal access tokens → *Fine-grained tokens* →
     *Only select repositories*: `4ChrisM/boveda-biplot`; *Repository permissions* → *Contents: Read and write*.
   - `ATLAS_CLAVE`: la contraseña para entrar.
   - `ATLAS_SECRETO`: un texto largo al azar (por ejemplo, la salida de
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
3. **La dirección**: la que da Vercel, o una propia como `atlas.biplot.cl` (en Vercel, Domains; en GoDaddy, un CNAME
   `atlas` hacia `cname.vercel-dns.com`).

## Probarla en el PC

```bash
cd atlas
npm install
# .env.local (no se sube), por ejemplo:
#   BOVEDA_LOCAL=C:/Users/.../07. BiPlot/00. Boveda Biplot
#   ATLAS_SIMULADO=1                  ← sin Claude ni gasto: respuestas fijas, búsqueda y propuestas de verdad
#   ATLAS_CLAVE=prueba
#   ATLAS_SECRETO=un-texto-largo-de-al-menos-32-caracteres
npm run dev                           # → http://localhost:3000
npm test                              # las pruebas (con una bóveda de prueba y un Claude falso)
```

Con `BOVEDA_LOCAL` lee la bóveda de una carpeta en vez de GitHub; para que Guardar escriba ahí, `BOVEDA_LOCAL_ESCRIBIR=1`
(mejor en una copia). Sin `ATLAS_SIMULADO` y con `ANTHROPIC_API_KEY`, habla con Claude de verdad.

## Lo que viene

- **Manos libres**: que despierte al oír «Atlas», sin tocar el micrófono.
- **El panel en Obsidian** (la opción 3): el mismo Atlas al lado de las notas, con lectura de `raw/`.
- Crear páginas nuevas (hoy sólo anota en las que existen) y una voz más natural que la del navegador.
