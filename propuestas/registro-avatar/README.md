# Registro con avatar (propuesta)

Una página de registro donde quien te recibe es el protagonista: **Plotty** (o **Atlas**, con `?avatar=atlas` o `#atlas`)
en 3D, con sus colores reales y calcado de su dibujo de la oficina. Te mira, sigue el cursor, mira lo que escribes, se
tapa la pantalla (o cierra los ojos) en la contraseña, frunce el ceño en rojo si algo no valida y celebra en verde cuando
la cuenta queda creada. Sigue la guía «Avatar interactivo con Claude Code» de NodeStudio, pero el avatar ya no es el de
Avatar Lab: ese estudio pinta todo el cuerpo de un color, y aquí cada pieza va con el suyo.

- Dirección: `/propuestas/registro-avatar/` (no indexada). Es una propuesta: el envío se simula con 1 s de espera, no hay
  backend y no se guarda nada.
- Para probarla en local: `npx http-server . -p 8080` en la raíz del repo y abrir
  http://localhost:8080/propuestas/registro-avatar/ (como archivo suelto no carga: los módulos necesitan un servidor).

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página y sus estilos: el avatar en grande sobre papel y el formulario compacto sobre tinta |
| `registro.js` | Los estados del avatar, el giro hacia el cursor y el formulario |
| `avatar3d.js` | El avatar en 3D: monta a Plotty o a Atlas en WebGL y responde a `play(clave)`, `orientar(x, y)` y `onAnimationEnd` |
| `kit3d.js` | Lo que comparten: la pintura de la banda (color plano y una sombra dura, con la luz arriba a la izquierda), el contorno de tinta y las piezas |
| `plotty3d.js`, `atlas3d.js` | Cada personaje, pieza por pieza, con las medidas y los colores de su dibujo (`oficina/_herramientas/dibujos/banda/`) |
| `three/` | Three.js 0.185.1 (MIT), sin cambios: `three.module.min.js` y `three.core.min.js` (750 KB, unos 190 KB con gzip) |
| `plotty.svg`, `atlas.svg` | *Generados* con `node oficina/_herramientas/avatares/dibujos.mjs`: el dibujo de la banda, que se ve mientras carga el 3D y queda si el navegador no tiene WebGL |

## Cómo están hechos

- **Calcados del dibujo.** Las piezas salen de `banda/plotty.mjs` y `banda/atlas.mjs`: el mismo marco de 600 × 600
  (100 píxeles son una unidad), los mismos colores y su sombra (`carcasa` y `carcasaS`, por ejemplo). Cada pieza se pinta
  con su color y una sola sombra dura, con la luz fija arriba a la izquierda como en los dibujos, y lleva el contorno de
  tinta (`#0C0D11`): una copia apenas más grande de la pieza, pintada por detrás.
- **Plotty**: la carcasa blanca, el borde cian del isotipo y la pantalla con su cara de LED (12 × 10, dibujada en un
  lienzo: los ojos siguen al cursor y cada estado arma su cara), los rotores que giran, la antena con el punto del logo,
  el cuello de fuelle, la barriga con el 0, la llama de plasma y las dos manos que flotan.
- **Atlas**: el orbe de vidrio con el globo de líneas que gira y el corazón de plasma con sus filamentos, el visor con
  los dos ojos de lente (el párpado mecánico y la mirada, en un lienzo), el anillo grande con los satélites en órbita, el
  anillo chico y la placa 360° que cuelga y se mece.

## Lo que hace

| Estado | Cuándo | Plotty | Atlas |
|---|---|---|---|
| `idle` | Nada especial | Sonríe, saluda con una mano y te sigue con los ojos | Párpado pesado, de reojo, te sigue con la mirada |
| `typing` | Al teclear; vuelve al reposo tras 1,2 s sin teclear | Mira el campo y teclea con las manos | Mira el campo, concentrado |
| `shy` | Con el foco en una de las contraseñas | Se tapa la pantalla (y espía) | Cierra los ojos y se da vuelta (y espía) |
| `error` | Al salir de un campo con algo escrito que no valida, o al enviar con errores | Ceño en rojo y una sacudida | Ceño y plasma en rojo, y una sacudida |
| `thinking` | El segundo que tarda el envío | Mira arriba, puntos suspensivos y la mano en el mentón | Mira arriba; el anillo y el plasma se aceleran |
| `success` | La cuenta quedó creada (primero la pantalla de éxito) | Cara feliz en verde, guiño y las manos arriba | Ojos abiertos en verde, plasma fuerte y el anillo girando |

- `error` y `success` corren una vez: al terminar, `onAnimationEnd` los devuelve al estado que corresponda. También
  responde a `look-left`, `look-right`, `look-up` y `look-down` (en 3D los ojos siguen al cursor todo el tiempo).
- `registro.js` gira al personaje hacia el cursor con un resorte en `requestAnimationFrame` y, mientras escribes, hacia el
  campo activo. En el celular el avatar va arriba; al tocar un campo se achica y queda fijo arriba, mirando lo que escribes.
- El brillo de atrás respira lento y se tiñe de rojo en el error y de verde en el éxito. La paleta de la página sale de
  quien recibe (la tinta del color de su cuerpo, el acento del de sus ojos). Sin coral: sigue reservado para «Agenda tu
  diagnóstico».
- Con «reducir movimiento» no flota, no gira hacia el cursor, los rotores y anillos se quedan quietos y no hay sacudidas
  ni rebote: sólo cambian las caras. El lienzo no se dibuja mientras no se ve.

## Actualizar Three.js

Copiar `build/three.module.min.js` y `build/three.core.min.js` del paquete `three` (una versión de hace por lo menos
unas semanas) a `three/`, y revisar la página.

## Licencias

Three.js es MIT (`three/LICENSE`). La página ya no usa los paquetes de Avatar Lab (AGPL-3.0): los `.avatar.json` de
Plotty y Atlas para ese estudio siguen en `oficina/_herramientas/avatares/`.
