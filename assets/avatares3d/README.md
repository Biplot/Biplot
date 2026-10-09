# Plotty y Atlas en 3D

Plotty y Atlas en 3D, con sus colores reales y calcados de sus dibujos de la banda
(`oficina/_herramientas/dibujos/banda/`), para usarlos en cualquier página del sitio. Hoy los usan dos propuestas:
`propuestas/tres-preguntas/` (Plotty) y `propuestas/registro-avatar/` (Plotty o Atlas).

```js
import { crearAvatar3D } from '/assets/avatares3d/avatar3d.js';   // o con la ruta relativa desde la página

const avatar = crearAvatar3D(document.querySelector('#avatar'), {
  personaje: 'plotty',                       // o 'atlas'
  ariaLabel: 'Plotty, la recepción de BiPlot HQ',
  onAnimationEnd: (clave) => { /* terminó un estado de los que corren una vez */ },
  reducido: () => matchMedia('(prefers-reduced-motion: reduce)').matches
});
avatar.play('greeting');                     // { ok: true } o { ok: false, error }
avatar.orientar(0.4, -0.1);                  // hacia dónde mira, de -1 a 1 (el cursor, un campo, un botón)
avatar.tiene('califica');                    // si el personaje sabe hacerlo
avatar.colores;                              // { cuerpo, ojos }: para la paleta de la página
avatar.destroy();
```

El lienzo llena el elemento donde se monta (conviene un cuadrado). Mientras carga, y si el navegador no tiene WebGL, se
ve el dibujo de la banda (`plotty.svg` o `atlas.svg`); la página pone los estilos de `.avatar3d`, `.avatar3d canvas`,
`.avatar3d-poster` y `.avatar3d.dibujado` (ver cualquiera de las dos propuestas). El lienzo no se dibuja mientras no se ve.

## Los estados

| Estado | Plotty | Atlas | Corre |
|---|---|---|---|
| `idle` | Sonríe, saluda con una mano y te sigue con los ojos | Párpado pesado, de reojo, te sigue con la mirada | Siempre |
| `typing` | Mira hacia abajo y teclea con las manos | Mira hacia abajo, concentrado | Siempre |
| `shy` | Se tapa la pantalla (y espía) | Cierra los ojos y se da vuelta (y espía) | Siempre |
| `thinking` | Mira arriba, puntos suspensivos, la mano en el mentón y la antena late | Mira arriba; el anillo y el plasma se aceleran | Siempre |
| `error` | Ceño en rojo y una sacudida | Ceño y plasma en rojo, y una sacudida | 1,9 s |
| `success` | Cara feliz en verde, guiño y las manos arriba | Ojos abiertos en verde, plasma fuerte y el anillo girando | 2,6 s |
| `greeting` | Saluda con la mano, cara feliz y un guiño | — | 2,4 s |
| `listening` | Ladea la cabeza y te sigue con los ojos | — | Siempre |
| `happy` | Cara feliz y las manos arriba, contento | — | 1,1 s |
| `surprised` | Ojos grandes, boca de «o» y las manos arriba | — | 1,3 s |
| `califica` | La antena se pone coral, saluda y apunta con la otra mano (a «Agenda tu diagnóstico») | — | Siempre |

También responden a `look-left`, `look-right`, `look-up` y `look-down` (como `idle`: en 3D los ojos siguen a `orientar`
todo el tiempo). Los que tienen duración avisan con `onAnimationEnd` y quedan quietos hasta el siguiente `play`.
El coral de la antena es el de «Agenda tu diagnóstico»: el único lugar donde Plotty lo usa. Los LED y las lentes van en
cian, rojo y verde. Con «reducir movimiento» no flotan ni giran, los rotores y anillos se quedan quietos y no hay
sacudidas: sólo cambian las caras.

## Archivos

| Archivo | Qué es |
|---|---|
| `avatar3d.js` | Monta al personaje en WebGL, maneja los estados y su duración, y el dibujo mientras carga |
| `kit3d.js` | Lo que comparten: la pintura de la banda (color plano y una sombra dura, con la luz arriba a la izquierda), el contorno de tinta, las piezas y los lienzos |
| `plotty3d.js`, `atlas3d.js` | Cada personaje, pieza por pieza, con las medidas y los colores de su dibujo; cada uno exporta sus `ESTADOS` y su `DURACION` |
| `three/` | Three.js 0.185.1 (MIT), sin cambios: `three.module.min.js` y `three.core.min.js` (750 KB, unos 190 KB con gzip) |
| `plotty.svg`, `atlas.svg` | *Generados* con `node oficina/_herramientas/avatares/dibujos.mjs`: el dibujo de la banda |

## Cómo están hechos

- **Calcados del dibujo.** Las piezas salen de `banda/plotty.mjs` y `banda/atlas.mjs`: el mismo marco de 600 × 600
  (100 píxeles son una unidad), los mismos colores y su sombra (`carcasa` y `carcasaS`, por ejemplo). Cada pieza se pinta
  con su color y una sola sombra dura, con la luz fija arriba a la izquierda como en los dibujos, y lleva el contorno de
  tinta (`#0C0D11`): una copia apenas más grande de la pieza, pintada por detrás.
- **Plotty**: la carcasa blanca, el borde cian del isotipo y la pantalla con su cara de LED (12 × 10, dibujada en un
  lienzo: los ojos siguen a `orientar` y cada estado arma su cara con unos ojos y una boca), los rotores que giran, la
  antena con el punto del logo, el cuello de fuelle, la barriga con el 0, la llama de plasma y las dos manos que flotan.
- **Atlas**: el orbe de vidrio con el globo de líneas que gira y el corazón de plasma con sus filamentos, el visor con
  los dos ojos de lente (el párpado mecánico y la mirada, en un lienzo), el anillo grande con los satélites en órbita, el
  anillo chico y la placa 360° que cuelga y se mece.

## Actualizar Three.js

Copiar `build/three.module.min.js` y `build/three.core.min.js` del paquete `three` (una versión de hace por lo menos unas
semanas) a `three/`, y revisar las dos propuestas.
