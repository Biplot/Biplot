# Mano a Mano — práctica de batería

App personal para practicar batería con metrónomo y guía visual. Se publica en **biplot.cl/bateria/**, sin indexar
(`noindex`) y sin enlaces desde el resto del sitio. Todo vive en `index.html` (HTML, CSS y JavaScript, sin build ni
dependencias; sólo carga dos fuentes de Google Fonts).

## Módulos

Se cambian con las pestañas de arriba o con el ancla de la dirección:

- **Sticking** (`/bateria/#sticking`): las 72 combinaciones de golpes simples (hojas de las pág. 5 a 7), con la pauta en
  una línea de percusión como en la hoja, un carril por mano (L izquierda, R derecha) y dos pads que se encienden. Se
  puede escribir un patrón propio con R y L (o D e I).
- **Ritmos** (`/bateria/#ritmos`): 38 ritmos de rock de un compás (hoja 1: 20; hoja 2, pág. 125: 18). Hi-hat en
  corcheas, caja en 2 y 4, y el bombo cambia en cada uno. Grilla de 4/4, un carril por pieza con la cuenta «1 y 2 y» al
  costado y una batería dibujada cuyas piezas se iluminan al golpe.

Los dos comparten el metrónomo: tempo, click por nota / negra / blanca, cuenta de 4, acento, repeticiones, «al
completarlas» (seguir, parar o pasar al siguiente, de inmediato o con cuenta), anticipo del ejercicio siguiente, subida
de tempo, pulso interno y guía sonora. Cada módulo recuerda su propio tempo y su click.

## Dónde está cada cosa (dentro del `<script>`)

| Qué | Dónde |
| --- | --- |
| Los 72 stickings, 16 golpes cada uno, en el orden de la hoja | `EX` |
| El bombo de cada ritmo: 8 corcheas (`1 y 2 y 3 y 4 y`), `x` = golpe y `.` = nada | `KICKS` (una letra por hoja) |
| Nombre de cada hoja de ritmos | `SHEETS` |
| Hi-hat y caja, iguales en todos los ritmos | `HAT`, `SNARE` |
| Cada módulo: cómo se arma cada paso, siguiente/anterior, etiquetas y récords | `MOD.st`, `MOD.gr` |
| Metrónomo (Web Audio, programado por adelantado) | `step`, `plan`, `tick`, `replan` |
| Lo que se ve en cada golpe, sincronizado con lo que suena | `onShow`, `audible` |
| Pauta de sticking y grilla de ritmo | `renderStrip`, `renderGrid` |
| Carril de notas (canvas) | `drawLane`, `layout` |
| Sonidos (click, golpe de baqueta, hi-hat, caja, bombo) | `click`, `stick`, `hat`, `snare`, `kick` |

Los ajustes, los récords y los minutos de práctica se guardan en `localStorage` (`mano-a-mano.v1`), por navegador.

## Agregar ejercicios

- **Otra hoja de ritmos** con hi-hat en corcheas y caja en 2 y 4: una letra nueva en `KICKS` con el bombo de cada ritmo
  y su nombre en `SHEETS`. La lista, la numeración, el «siguiente» y el contador de la pestaña se arman solos.
- **Ritmos con otro hi-hat o caja** (negras, semicorcheas, caja en otro lugar): hay que guardar `HAT` y `SNARE` por
  ritmo en vez de fijos, y si cambian a semicorcheas, la grilla y el carril pasan de 8 a 16 pasos por compás.
- **Otra hoja de sticking**: más patrones en `EX` y su página en `PAGES`.

## Probar en local

Desde la raíz del repositorio:

```bash
npx http-server . -p 8080
```

Luego abre http://localhost:8080/bateria/ (el sonido parte con el primer toque, como pide el navegador).

## Ideas pendientes

- Grilla editable para armar ritmos propios, como el patrón propio de sticking.
- Más hojas de ritmos (semicorcheas en el hi-hat, caja con notas fantasma, toms).
- Agregarla a la pantalla de inicio del teléfono (manifiesto e ícono propios).
