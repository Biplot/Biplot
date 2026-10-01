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

## El Archivo, el museo de BiPlot

`sala-archivo/` es la propuesta con que El Archivo pasó a ser el museo de BiPlot (ya está en la oficina: su dibujo vive
en `../dibujos/barrio/salas-propias/archivo.mjs` y `sala-archivo/sala.mjs` sólo lo reexporta, con sus acercamientos).
Es una galería en orden: dos filas de vitrinas iguales en las mismas columnas y una sola línea en el piso, del mismo
grosor. Adelante, las épocas (1985 la libreta, 1990 la terminal, 1998 el software de caja, 2015 el portátil con sus tres
palabras y hoy el tablero de las diez fases, sin vidrio): la línea parte color papel en el atril de la entrada y va
tomando el color de cada época hasta volverse cian en hoy. Da una sola vuelta, frente al primer plano de BiPlot HQ, y
vuelve por la fila de atrás, con una pieza única de cada desarrollo (la escritura de Fundos 360, el QR de la mesa de Haru
360, el módulo de Nu Home 360, la huella de Eleven 360 y el elefante de Rumbo), en el orden en que llegaron a biplot.cl,
hasta el punto coral del pedestal libre. En los muros van la línea de tiempo de 2026 y el fichero con todos los casos
por rubro. Lo cuida Pepa (Cosecha). `salaArchivo({ tono: 'dos' })` dibuja la línea sólo de papel a cian (para
comparar).

Las fechas son las del historial del sitio (cuándo llegó cada caso a biplot.cl), no las del inicio de cada proyecto.
Usa Space Grotesk y Space Mono. Las maquetas (`mock.mjs`) quedan para probar ideas antes de pasarlas a `datos.js`.

```bash
SALIDA=/tmp/sala-archivo node oficina/_herramientas/propuestas/dibujar-sala.mjs archivo
SALIDA=/tmp/sala-archivo node oficina/_herramientas/propuestas/sala-archivo/mock.mjs
```

## BiPlot.TV, el canal de BiPlot

`sala-tv/` es la propuesta del canal (ya está en la oficina: su dibujo vive en `../dibujos/barrio/salas-propias/tv.mjs`
y `sala-tv/sala.mjs` sólo lo reexporta, con sus acercamientos). Es un estudio de televisión con su sala de estreno: el
cine, el set de Aby y Felipe, el camarín, «Así se hace un capítulo», el muro de pantallas, la cartelera y, al medio,
la pantalla del centro, como en la NBA (las repeticiones y el marcador). `salaTv({ felipe: [x, y] })` deja a Felipe
parado en ese punto (para la maqueta del recorrido). Por fuera es un edificio propio en la plaza, junto a BiPlot HQ (se
eligió entre tres: el estudio, una pantalla gigante al aire libre y una torre).

```bash
SALIDA=/tmp/sala-tv node oficina/_herramientas/propuestas/dibujar-sala.mjs tv
```
