# BiPlot

Sitio de BiPlot — automatización de procesos hecha a la medida.

Sitio estático (HTML, CSS y JavaScript, sin build). Se sirve tal cual:

- `index.html` — sitio principal, contado como una sola historia: **el papel es el antes, la oficina es el ahora, la
  línea es lo que los une y el punto coral es tu próximo paso**. Portada; «Seis décadas, la misma línea» (del papel al
  genérico, y sus dos últimas láminas: la línea pasa por las diez fases de la oficina y termina en el local libre del
  barrio); servicios; cómo trabajamos (el motor de diez fases con la cara de quien lleva cada una, sobre un riel que
  sube como la línea del isotipo y termina en el punto coral); casos (Fundos 360, Haru 360 y Nu Home 360, cada uno con
  el enlace a su sala); **BiPlot HQ** (la visita guiada con Plotty y lo que gana cada cliente); precios; preguntas y
  contacto («Tu proceso es el próximo punto de esta línea», con la opción de partir conversando con Plotty). El coral
  queda sólo para agendar el diagnóstico.
- `plotline.html` — recorrido "Cómo pensamos la automatización": el papel, la terminal, el enredo y el genérico, y al
  final «Hoy · BiPlot HQ» (la línea con alguien a cargo de cada tramo) y «Tu turno» (el local libre del barrio).
- `oficina/` — BiPlot HQ, la oficina virtual (el equipo, la calle con la sala de cada empresa y kit para Instagram). Ver `oficina/README.md`.
- `assets/` — video, imágenes y scripts. En `assets/oficina/`, lo de la oficina que usa el sitio: las caras del equipo
  (`caras/`, se generan con `node oficina/_herramientas/exportar-kit.mjs --caras`), la visita guiada en versión web
  (`visita-plotty-h.mp4` y `visita-plotty-v.mp4`, con sus pósters; ver la sección de la visita en `oficina/README.md`) y
  dos recortes de los dibujos de la oficina: `oficina-adentro.webp` (el equipo en sus estaciones) y `local-libre.webp`
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
