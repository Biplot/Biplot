# Propuesta Fundos Inmobiliaria — contexto para Claude

Rediseño del sitio de Fundos Inmobiliaria (parcelas en Malalcahuello, Marchigüe y Puerto Varas), hecho por BiPlot
según el **Manual de Marca Fundos 360°**. Sitio estático: HTML, CSS y JavaScript sin build ni dependencias.
Toda la interfaz y los textos van en **español de Chile**. Lee también `README.md` (qué propone la página y la lista
"Estado y próximos pasos").

## Dónde está publicado
- **Sitio público:** https://biplot.cl/propuestas/fundos-inmobiliaria/ (GitHub Pages desde `main` de `Biplot/biplot`,
  dominio en el `CNAME` de la raíz). Lleva `noindex`.
- **Vista previa privada (artefacto de Claude):** https://claude.ai/artifact/NthH9NFHsid6PzqL8HN9wU
  (se actualiza con `tools/artefacto_build.py`, ver abajo). Ahí los recorridos 360° no se ven: el visor bloquea iframes.

## Cómo se publica un cambio
1. Trabajar en una rama nacida del `main` actual (`git fetch origin main && git checkout -B <rama> origin/main`).
2. Probar (ver "Pruebas") y subir `?v=AAAAMMDDx` en `index.html` si cambió CSS/JS/datos (el `.htaccess` guarda un año).
3. Commit, push, pull request a `main` y fusionar: GitHub Pages despliega en 1-2 minutos. El cliente ya autorizó
   publicar esta propuesta (incluidas las fotos y el video del equipo). Nunca tocar nada fuera de esta carpeta:
   `main` también tiene el sitio de BiPlot y la oficina virtual, que trabajan otras sesiones.
4. Actualizar el artefacto: `cd <carpeta temporal> && python3 <repo>/propuestas/fundos-inmobiliaria/tools/artefacto_build.py propuesta-fundos.html`
   imprime el mapa de archivos; publicar ese HTML con esos archivos en la URL del artefacto de arriba.

## Estructura y datos
- `index.html` todo el contenido (se lee sin JS) · `styles.css` tokens del manual + estilos · `main.js` módulos IIFE
  (`initPlan`, `initTour`, `initSim`, `initVisit`, `initSellers`, `initVideo`, `initCompra`, …) aislados con `safe()`.
- `lib/manifest.js` **único lugar de datos**: contacto, proyectos, lotes (`[n, categoría, estado]`), categorías de
  precio (color, precio, precio lista), financiamiento, `equipo` (nombre, apodo, cargo, foto, bio, whatsapp, video)
  y `videoPortada` (mp4/webm y versión `Movil`). Precios y contacto son de ejemplo (placeholder `+56 9 0000 0000`).
- `lib/planos.js` **generado, no editar a mano**: por proyecto `viewBox`, `contorno`, `calles` (servidumbres),
  `agua`, opcional `caminoPrincipal`, y `lotes[n] = {d, l, r}` (path SVG, punto de etiqueta, radio libre). Lotes y
  servidumbres forman una cobertura continua (bordes compartidos, sin huecos ni traslapes).
- `entorno.html` **boceto** del mapa "Descubre tu entorno" de Fundos Puerto Varas (página aparte, sin enlazar desde
  `index.html`): imagen satelital del cliente (`assets/entorno/mapa-puerto-varas.webp`, 931 × 728) georreferenciada
  con las cumbres del Osorno, Calbuco y Puntiagudo y la marca del proyecto (-41.3700833, -72.8781389); los lugares
  (`x`, `y` en píxeles de esa imagen), textos del folleto y distancias están en el script de la página. Si llega una
  imagen de mayor resolución, recalibrar los `x`, `y`. Fotos recortadas del folleto: reemplazar por las originales.
  Las rutas por camino (`RUTAS`: path en píxeles, km y minutos) se calcularon una vez con el servidor público de
  OSRM (`router.project-osrm.org`, datos © OpenStreetMap, crédito visible en el mapa) desde Camino El Encanto; el
  Calbuco (sin camino a la cumbre) y Parque Vivo Alerces (sin ubicación confirmada) van en línea recta.
- `assets/img` fotos y logos (WebP) · `assets/video` saludo del equipo (MP4 H.264 + WebM de respaldo + portada) ·
  `assets/fonts` Cormorant Garamond y Mulish autoalojadas.

## Planos: cómo se hicieron y cómo reemplazarlos
- Hoy salen de segmentar las imágenes de los masterplan (OpenCV + shapely) y enderezarlos con
  `tools/enderezar_planos.py` (cobertura simplificada: tolerancia 16 en Malalcahuello, 12 en Marchigüe). Puerto Varas
  son rectángulos. Marchigüe lotes 1-4 y 49-51 se retrazaron a mano con las líneas del masterplan.
- **Pendiente:** el cliente enviará los planos en **SVG** (Malalcahuello y Puerto Varas primero, Marchigüe después) para
  calcarlos exactos. Al llegar: verificar que cada lote sea su propia forma vectorial (no una imagen incrustada),
  asociar cada forma a su número de lote (por posición de la etiqueta o comparando con la geometría actual),
  llevar las coordenadas al `viewBox` del proyecto y regenerar `lotes`, `calles`, `agua` y `contorno` manteniendo el
  formato `{d, l, r}` (`l` con `shapely.ops.polylabel`, `r` = distancia de `l` al borde). No cambiar el render.
- El render (formato estándar Fundos) vive en `main.js`: `PLANO`, `svgPlan`, `catsHtml`, `legendHtml`; pins a tamaño
  constante en pantalla vía `--u`; zoom y encuadre en `layoutPlan`, `applyView`, `reveal`, `frameLots`.

## Pruebas
Servidor local desde la raíz del repo: `python3 -m http.server 8765 --bind 127.0.0.1`. Pruebas Playwright en
`tools/pruebas/` (ver su `LEEME.md`); correrlas desde una carpeta temporal con `mkdir ux` porque guardan capturas.
Mínimo antes de publicar: `interacciones.js`, `plano.js`, `qa.js`, `anchos.js` (sin desborde de 320 a 1920 px).

## Particularidades del entorno (sesiones en la nube)
- Chromium de Playwright: `executablePath: "/opt/pw-browsers/chromium"`, `NODE_PATH=/opt/node22/lib/node_modules`,
  `--proxy-server=$HTTPS_PROXY`. **No reproduce H.264**: los videos deben tener también WebM (y así se prueban).
- El proxy bloquea biplot.cl (verificar el despliegue por GitHub Actions "pages build and deployment"), Hugging Face
  (no hay transcripción de audio) y algunos CDN.
- Fotos HEIC del iPhone: `pip install pillow-heif`. ffmpeg: `pip install imageio-ffmpeg`. Videos del iPhone son HDR
  (HLG): convertir a SDR con `zscale` + `tonemap` antes de codificar.

## Decisiones tomadas con el cliente
- Portada: video de caballos pastando (entregado por el cliente, `assets/video/portada*`: bucle sin salto con fundido, sin audio, versión vertical para celular) en el marco de la foto del equipo, que queda de respaldo.
- Una tarjeta y una ficha (ventana) por persona del equipo, con su presentación en sus palabras (sin reescribirla).
  No suponer género ni cargos: hoy todos dicen "Equipo comercial" hasta tener los cargos reales.
- Santo Domingo fuera de la propuesta. No bajar videos de internet: solo material propio del cliente.
- Planos con líneas rectas como el masterplan. En computador la herramienta completa (proyectos, filtros, chips,
  plano y leyenda en franja baja) cabe en la pantalla: el plano mide entre 380 y 480 px de alto y no pasa del 47 % de la ventana (`layoutPlan`); los
  chips de precio van en una sola fila (precio arriba, precio lista y disponibles abajo); el
  detalle del lote toma el mismo alto (`--stage-h`) y los enlaces a `#plano` llevan directo a la herramienta.
  En celular el plano parte acercado (lotes tocables) con botón para ver completo.
- Cotizador compacto: la cotización completa visible en computador; en celular, franja con la cuota bajo los controles.
- Página corta por secciones (el cliente sintió que tanto scroll cansa): Cómo comprar, Simulador, Preguntas y Mi compra
  van como pestañas en `#tu-compra` (`initCompra`; los enlaces a esos `#id` abren su pestaña); Nosotros compacto con
  valores cortos y el equipo en carrusel; proyectos en carrusel en celular; indicador de sección (`[data-nav-where]`)
  y barra de avance (`--avance` en `.nav`). Medir el largo con `tools/pruebas/largo.js` si se agregan secciones.
