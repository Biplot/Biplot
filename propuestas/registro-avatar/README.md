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

El avatar en 3D (Plotty y Atlas, con sus colores reales y calcados de sus dibujos) está en `assets/avatares3d/`, porque
también lo usa la propuesta de las tres preguntas: ver su README.

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

## Licencias

Three.js es MIT (`assets/avatares3d/three/LICENSE`). La página ya no usa los paquetes de Avatar Lab (AGPL-3.0): los `.avatar.json` de
Plotty y Atlas para ese estudio siguen en `oficina/_herramientas/avatares/`.
