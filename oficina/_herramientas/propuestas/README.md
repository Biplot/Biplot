# Propuestas de salas

Las propuestas de las salas de cada proyecto en BiPlot HQ, con el modelo sin números (ya aprobadas y en la oficina): al entrar estás en su casa (su
estilo, sus productos y su gente), lo que se toca se ilumina y abre una tarjeta, la gente conversa en burbujas, abajo
va la barra de su marca y BiPlot aparece en un kiosco «Hecho con BiPlot», con quien lleva la fase del proyecto.

| Sala | Carpeta | En su rincón |
| --- | --- | --- |
| Nu Home (casas modulares) | `sala-nuhome/` | Bucle, en desarrollo |
| Fundos (parcelas) | `sala-fundos/` | Celda |
| Haru (restaurante) | `sala-haru/` | Faro, en implementación |
| Eleven (gimnasio) | `sala-eleven/` | Lupe, propuesta |
| Rumbo (app de BiPlot) | `sala-rumbo/` | Tamandúa, publicada |

Los dibujos son los mismos de la oficina: la sala de Nu Home vive en `../dibujos/barrio/salas-grandes.mjs` y las de
Fundos, Haru, Eleven y Rumbo en `../dibujos/barrio/salas-propias/`, una por archivo, con sus piezas comunes en
`salas-propias/comun.mjs` (el armado con su gente, la base con piso y muros, vidrios, sillas, plantas, planos en caras
de muebles y el kiosco de BiPlot, con su video o con una pantalla propia). Cada `sala-<id>/sala.mjs` de aquí sólo los
reexporta, con sus acercamientos (`ZONAS`), para las fotos y las maquetas. Lo que cuenta cada sala (tarjetas, burbujas,
recorrido) está en `oficina/datos.js`, en su `salaPropia`.

- `comun.mjs`: `componer` (la sala armada en un SVG) y `P` (del mundo a la pantalla).
- `dibujar-sala.mjs`: la foto de la sala entera y de cada zona (`ZONAS` de su `sala.mjs`).
- `mock-comun.mjs`: la sala dentro de la oficina, con la barra de BiPlot y lo que aparece encima: burbujas, el brillo de
  lo que se toca, su etiqueta, la tarjeta y la barra de la marca. Cada `mock.mjs` pone su paleta y su guion.

```bash
SALIDA=/tmp/sala-haru node oficina/_herramientas/propuestas/dibujar-sala.mjs haru
SALIDA=/tmp/sala-haru node oficina/_herramientas/propuestas/sala-haru/mock.mjs
```

Las páginas y las fotos van a `SALIDA`, nunca al repo. Las letras de cada marca tienen que estar instaladas para que
las fotos salgan con ellas: Montserrat (Haru), Anton, Chakra Petch y Manrope (Eleven), Cormorant Garamond (Nu Home y
Fundos) y Space Grotesk (Rumbo y BiPlot).

De dónde sale cada cosa:

- Haru: rolls y precios de su carta digital (carta impresa vigente); los servicios y la paleta, de la misma carta.
- Eleven: zonas, cifras, horario de clases, planes, pase diario, tienda y acceso con huella, de su sitio (`data.js`,
  septiembre de 2026). Su team va sin nombres.
- Rumbo: sus módulos, rangos, insignias, la rueda de la vida y el elefante con su propio dibujo, exportado desde la app
  (`dibujos/barrio/salas-propias/exportar-elefantes.mjs <carpeta del repo rumbo>` rehace `elefantes.mjs`).

Las personas son ilustraciones sin nombre. Las frases de las burbujas y las tarjetas son de ejemplo hasta que cada
cliente las apruebe.

## El Archivo, el museo de BiPlot (propuesta)

`sala-archivo/` propone que El Archivo sea el museo de BiPlot: una pieza única de cada desarrollo en su vitrina (la
terminal del primer día, la escritura inscrita de Fundos 360, el QR de la mesa de Haru 360, el módulo de Nu Home 360,
la huella de Eleven 360 y el elefante de Rumbo en sus cuatro etapas), unidas por una línea en el piso en el orden en que
llegaron a biplot.cl, y al final un pedestal libre para el próximo. En el muro va la línea de tiempo y el primer plano
de BiPlot HQ; a la izquierda, el fichero con todos los casos por rubro. Lo cuida Pepa (Cosecha).

Todavía no está en la oficina: su dibujo vive entero en `sala-archivo/sala.mjs` hasta que se apruebe, y sólo ahí pasa a
`../dibujos/`. Las fechas son las del historial del sitio (cuándo llegó cada caso a biplot.cl), no las del inicio de
cada proyecto. Usa Space Grotesk y Space Mono.

```bash
SALIDA=/tmp/sala-archivo node oficina/_herramientas/propuestas/dibujar-sala.mjs archivo
SALIDA=/tmp/sala-archivo node oficina/_herramientas/propuestas/sala-archivo/mock.mjs
```
