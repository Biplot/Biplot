# BiPlot

Sitio de BiPlot — automatización de procesos hecha a la medida.

Sitio estático (HTML, CSS y JavaScript, sin build). Se sirve tal cual:

- `index.html` — sitio principal, en la línea editorial de la propuesta de Fundos (https://fundos.biplot.cl/): títulos
  en Cormorant Garamond con un remate en cursiva, texto en Mulish, secciones que alternan papel (claro) y tinta
  (oscuro), kickers espaciados y columnas con filete. Los colores siguen siendo los de BiPlot: la línea cian y el
  **punto coral, que queda sólo para agendar el diagnóstico**. Orden: portada (con el video de fondo, una
  ficha para agendar por WhatsApp y una franja de datos); servicios y «lo que cambia con BiPlot»; casos (Fundos 360,
  Haru 360 y Nu Home 360, cada uno con su video y el enlace a su sala); «Seis décadas, la misma línea» (del papel al
  genérico, la línea por las diez fases de la oficina y el local libre del barrio); el motor de diez fases (sobre la curva del isotipo que termina en el
  punto coral; los personajes de la oficina no aparecen en el proceso, sólo el guiño «Conócelos en la oficina»); **BiPlot HQ** (la visita
  guiada con Plotty); precios; preguntas y contacto («Tu proceso es el próximo punto», con la opción de partir
  conversando con Plotty). El fondo de la portada es un video sin
  textos grandes de qué trata BiPlot (planillas y chats sueltos → se tachan los pasos que sobran → lo demás se
  ordena en la línea del isotipo hasta el punto coral), en bucle: `assets/portada-fondo-h.mp4` y `-v.mp4` (celular),
  con sus cuadros fijos `.jpg`. Se hace con `_herramientas/fondo-portada/` (`fondo.html` dibuja cada cuadro y
  `node _herramientas/fondo-portada/grabar.mjs` lo graba con Playwright y ffmpeg). Los colores salen de las
  variables al comienzo del `<style>` (azul BiPlot, cian y el coral sólo para agendar).
- `plotline.html` — recorrido "Cómo pensamos la automatización": el papel, la terminal, el enredo y el genérico, y al
  final «Hoy · BiPlot HQ» (la línea con alguien a cargo de cada tramo) y «Tu turno» (el local libre del barrio).
- `oficina/` — BiPlot HQ, la oficina virtual (el equipo, la calle con la sala de cada empresa y kit para Instagram). Ver `oficina/README.md`.
- `assets/` — video, imágenes y scripts. En `assets/oficina/`, lo de la oficina que usa el sitio: las caras del equipo
  (`caras/`, se generan con `node oficina/_herramientas/exportar-kit.mjs --caras`), la visita guiada en versión web
  (`visita-plotty-h.mp4` y `visita-plotty-v.mp4`, con sus pósters; ver la sección de la visita en `oficina/README.md`) y
  dos recortes de los dibujos de la oficina: `oficina-adentro.webp` (el equipo en sus estaciones; se vuelve a sacar con
  `node oficina/_herramientas/fotografiar-adentro.mjs <salida.png>` y se pasa a WebP con calidad 78) y `local-libre.webp`
  (el local «Tu proyecto aquí»).
- `propuestas/fundos-inmobiliaria/` — propuesta de sitio para Fundos Inmobiliaria (no indexada; ver su README).

## Desarrollo local

Cualquier servidor estático sirve. Por ejemplo:

```bash
npx http-server . -p 8080
```

Luego abre http://localhost:8080

## Despliegue

Sitio estático: Vercel (u otro host estático) lo sirve directo desde la raíz, sin paso de build.
