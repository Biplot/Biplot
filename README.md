# BiPlot

Sitio de BiPlot — automatización de procesos hecha a la medida.

Sitio estático (HTML, CSS y JavaScript, sin build). Se sirve tal cual:

- `index.html` — sitio principal. BiPlot va primero y la oficina acompaña: servicios; cómo trabajamos (el motor de diez
  fases, con la cara de quien lleva cada una); casos (Fundos 360, Haru 360 y Nu Home 360, cada uno con el enlace a su
  sala); **BiPlot HQ** (la visita guiada con Plotty y lo que gana cada cliente: su local, su sala con un enlace y el
  acompañamiento después de la entrega); por qué BiPlot; precios; la historia; preguntas y contacto (con la opción de
  partir conversando con Plotty). El menú y el aviso «Nuevo» de la portada llevan a la sección de la oficina.
- `plotline.html` — recorrido "Cómo pensamos la automatización".
- `oficina/` — BiPlot HQ, la oficina virtual (el equipo, la calle con la sala de cada empresa y kit para Instagram). Ver `oficina/README.md`.
- `assets/` — video, imágenes y scripts. En `assets/oficina/`, lo de la oficina que usa el sitio: las caras del equipo
  (`caras/`, se generan con `node oficina/_herramientas/exportar-kit.mjs --caras`) y la visita guiada en versión web
  (`visita-plotty-h.mp4` y `visita-plotty-v.mp4`, con sus pósters; ver la sección de la visita en `oficina/README.md`).
- `propuestas/fundos-inmobiliaria/` — propuesta de sitio para Fundos Inmobiliaria (no indexada; ver su README).

## Desarrollo local

Cualquier servidor estático sirve. Por ejemplo:

```bash
npx http-server . -p 8080
```

Luego abre http://localhost:8080

## Despliegue

Sitio estático: Vercel (u otro host estático) lo sirve directo desde la raíz, sin paso de build.
