# Registro con avatar (propuesta)

Una página de registro donde quien te recibe es el protagonista: **Plotty** (o **Atlas**, con `?avatar=atlas`) te mira,
sigue el cursor, mira lo que escribes, hace como que no mira en la contraseña, frunce el ceño en rojo si algo no valida
y celebra en verde cuando la cuenta queda creada. Sigue la guía «Avatar interactivo con Claude Code» de NodeStudio
(avatares hechos en Avatar Lab, avatars.bible-strong.app), adaptada al sitio: sin React ni build, con
`@bible-strong/avatar-web`, el paquete para JavaScript sin React.

- Dirección: `/propuestas/registro-avatar/` (no indexada); con Atlas, `?avatar=atlas` o `#atlas`. Es una propuesta: el envío se simula con 1 s de espera, no hay
  backend y no se guarda nada.
- Para probarla en local: `npx http-server . -p 8080` en la raíz del repo y abrir
  http://localhost:8080/propuestas/registro-avatar/ (como archivo suelto no carga: el avatar se pide con `fetch`).

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página y sus estilos: el avatar en grande sobre papel y el formulario compacto sobre tinta |
| `registro.js` | Los estados del avatar, la mirada que sigue al cursor y el formulario |
| `plotty.avatar.json`, `atlas.avatar.json` | *Generados* con `node oficina/_herramientas/avatares/construir.mjs` (son la misma definición que se importa en Avatar Lab) |
| `avatar-web.js` | *Empaquetado.* `@bible-strong/avatar-web` 0.1.0 con `@bible-strong/avatar-core` 0.1.0 y ajv, sin cambios, en un solo módulo (167 KB, 52 KB con gzip) |

## Lo que hace

| Estado | Cuándo | Animación |
|---|---|---|
| En reposo | Nada especial | `idle`; con el cursor lejos del avatar, `look-left`, `look-right`, `look-up` o `look-down` |
| Escribiendo | Al teclear; vuelve al reposo tras 1,2 s sin teclear | `typing` |
| Tímido | Con el foco en una de las contraseñas (no mira; cada tanto espía) | `shy` |
| Error | Al salir de un campo con algo escrito que no valida, o al enviar con errores | `error` (una vez) |
| Pensando | El segundo que tarda el envío | `thinking` |
| Éxito | La cuenta quedó creada: primero la pantalla de éxito, después el avatar | `success` (una vez) |

- Sólo se usa la API documentada del paquete: `createAvatar(destino, { definition, size, ariaLabel, onAnimationEnd,
  onError })`, `play(clave)` y `destroy()`. `play` se llama sólo cuando cambia la animación, no en cada tecla.
- `error` y `success` corren una vez y quedan quietos al terminar: `onAnimationEnd` los devuelve al estado que corresponda.
- La librería no trae seguimiento del cursor: `registro.js` inclina el avatar hacia el cursor (hasta 12°, con un resorte
  en `requestAnimationFrame`) y, en reposo, elige la mirada por zona, con margen y una pausa de 160 ms para que no
  tiemble. Mientras escribes mira hacia el campo activo.
- En el celular el avatar va arriba; al tocar un campo se achica y queda fijo arriba, mirando lo que escribes.
- El brillo de atrás respira lento y se tiñe de rojo en el error y de verde en el éxito. La paleta sale del
  `.avatar.json`: la tinta es el color del cuerpo oscurecido y el acento, el de los ojos. Sin coral: sigue reservado para
  «Agenda tu diagnóstico».
- Con «reducir movimiento» no hay inclinación, respiración, sacudidas ni rebote (y la librería también lo respeta).
- Si al `.avatar.json` le faltan `idle`, `typing`, `error` o `success`, la página lo avisa arriba del formulario.

## Actualizar el paquete

```bash
npm install @bible-strong/avatar-web@<versión> esbuild
echo "export { createAvatar } from '@bible-strong/avatar-web';" > entrada.js
npx esbuild entrada.js --bundle --format=esm --minify --target=es2020 --platform=browser --legal-comments=none --outfile=avatar-web.js
```

(y se le vuelve a poner el comentario de la primera línea, con la versión y la licencia).

## Licencia: revisar antes de publicarla

Avatar Lab y sus paquetes (`@bible-strong/avatar-core` y `avatar-web`) son **AGPL-3.0**
(https://github.com/smontlouis/bible-strong-avatar-lab). Para una propuesta no hay problema. Si se publica en biplot.cl o
se usa en el proyecto de un cliente, antes hay que revisar qué exige: entre otras cosas, ofrecer el código fuente de la
librería (y de lo que se considere derivado de ella) bajo la misma licencia. `avatar-web.js` conserva el aviso de la
licencia y el enlace al código.
