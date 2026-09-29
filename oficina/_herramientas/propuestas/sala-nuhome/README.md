# Propuesta: la sala de Nu Home como su propia sala de ventas

Borrador de la sala nueva de Nu Home, para revisar con Nu Home antes de construirla. Todavía no está en la oficina:
cuando se apruebe, la sala pasa a `dibujos/barrio/salas-grandes.mjs` y lo que se ve encima (las burbujas, las tarjetas,
el recorrido con una asesora y la barra de Nu Home) a `oficina.js`, en lugar de los puntos numerados.

- `sala.mjs`: la sala (20 × 14 baldosas) con el mismo motor de las salas grandes. Tiene el taller detrás del vidrio, el
  muro de la marca y el ventanal, el salón y la entrega, las terminaciones, la asesoría con la mesa de maqueta, la casa
  piloto con terraza y pérgola, los modelos en maqueta, la recepción y el rincón de BiPlot con Bucle. No lleva alfileres:
  `lugar(id, x, y, z)` marca dónde van las burbujas y las tarjetas.
- `dibujar.mjs`: saca la foto de la sala entera y de cada zona (`--solo entera,taller,…`).
- `mock.mjs`: muestra la sala dentro de la oficina en tres momentos: al entrar (`?e=a`), al tocar la casa piloto (`?e=b`)
  y en el rincón de BiPlot (`?e=c`).
- `antes.mjs`: saca la sala actual, para comparar. Necesita la oficina servida en http://127.0.0.1:5480 (o en `BASE=…`).
- `foto.mjs`: fotografía las páginas con Chromium sin interfaz (`NAVEGADOR=…` para usar otro).

```bash
SALIDA=/tmp/sala-nuhome node oficina/_herramientas/propuestas/sala-nuhome/dibujar.mjs
SALIDA=/tmp/sala-nuhome node oficina/_herramientas/propuestas/sala-nuhome/mock.mjs
```

Las páginas y las fotos van a `SALIDA` (o a la carpeta temporal del sistema), nunca al repo. Los letreros de Nu Home usan
Cormorant Garamond: tiene que estar instalada para que las fotos salgan con esa letra.

Las asesoras y asesores son ilustraciones sin nombre; su nombre va sólo si Nu Home lo autoriza. Las medidas de los
módulos son las del diseñador de Nu Home 360, y las frases de las burbujas y las tarjetas son de ejemplo hasta que Nu Home
las apruebe.
