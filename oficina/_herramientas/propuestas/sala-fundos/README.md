# Propuesta: la sala de Fundos como su propia sala de ventas de parcelas

Borrador de la sala nueva de Fundos Inmobiliaria, para revisar antes de construirla. Sigue el mismo modelo que la de
Nu Home (`../sala-nuhome/`): al entrar estás en su sala, sin puntos numerados, y BiPlot aparece en un rincón.

La paleta y los datos salen de la propuesta de su sitio (`propuestas/fundos-inmobiliaria/`): verde bosque, dorado tierra
y Cormorant Garamond del manual de marca; proyectos, lotes, precios y reserva de `lib/manifest.js`, que son
referenciales.

- `sala.mjs`: la sala (20 × 14 baldosas) con el motor de las salas grandes. Tiene el mirador 360° en el rincón del fondo
  (el río Lolén envuelve la esquina), los tres ventanales (Malalcahuello, Marchigüe y Puerto Varas), el salón con estufa
  a leña, la maqueta del predio de Puerto Varas con el lote 25 marcado, el muro «Detrás de cada venta hay personas» con
  los escritorios de reserva y validación, la firma con el certificado «Inscrita a tu nombre», la recepción, el letrero
  de sus valores y el rincón de BiPlot con Celda. Una huella de marcas de bronce en el piso sigue el camino de la
  compra, de la puerta a la inscripción. `lugar(id, x, y, z)` marca dónde van las burbujas y las tarjetas.
- `dibujar.mjs`: saca la foto de la sala entera y de cada zona (`--solo entera,maqueta,…`).
- `mock.mjs`: muestra la sala dentro de la oficina al entrar (`?e=a`), al tocar el lote 25 (`?e=b`) y en el rincón de
  BiPlot (`?e=c`).
- Reusa `componer` de `../sala-nuhome/sala.mjs` y `foto.mjs` de la misma carpeta. Para la sala de hoy, a modo de
  comparación: `SALA=fundos node ../sala-nuhome/antes.mjs <png>` con la oficina servida en http://127.0.0.1:5480.

```bash
SALIDA=/tmp/sala-fundos node oficina/_herramientas/propuestas/sala-fundos/dibujar.mjs
SALIDA=/tmp/sala-fundos node oficina/_herramientas/propuestas/sala-fundos/mock.mjs
```

Las personas son ilustraciones. Las fotos reales del equipo de Fundos están autorizadas para su sitio; para usarlas en
la oficina hay que confirmarlo con Fundos. Las frases de las burbujas y las fichas son de ejemplo hasta que Fundos las
apruebe.
