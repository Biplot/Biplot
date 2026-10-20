// Las imágenes de La Línea, en diario/imagenes/:
//   caras/<id>.jpg        la cara de quien firma, en blanco y negro de manga (320 × 320), para el recuadro del interior
//   caras/color/<id>.jpg  la misma cara a color, como en la tapa (640 × 640)
//   tapas/<fecha>.jpg     la tapa a color de una edición (1200 px de ancho)
// y, en diario/_herramientas/escenas/ (no se publica), las escenas propuestas para la tapa, que se eligen en el CRM:
//   <fecha>-<letra>.jpg   una escena (900 px de ancho)
//   rumbo.png             el ícono de Rumbo, en blanco y negro, para el consultorio
// Las caras y las tapas se dibujan con IA (ver diario/README.md) y quedan, al generarlas, en el sitio de la herramienta.
// Esto las baja y las deja del tamaño que usa el diario:
//   node diario/_herramientas/imagenes.mjs caras                  las caras que lista caras.json (y las saca de la lista)
//   node diario/_herramientas/imagenes.mjs tapa AAAA-MM-DD <url>  la tapa de esa edición
//   node diario/_herramientas/imagenes.mjs escena AAAA-MM-DD a <url>  una escena propuesta para su tapa (a, b, c…)
//   node diario/_herramientas/imagenes.mjs rumbo                  el ícono de Rumbo, desde assets/rumbo/icono.png
// Todo en PNG o JPEG: los correos (Outlook, sobre todo) no muestran WebP ni aplican filtros.
// Necesita Playwright (con el Chromium del entorno). Detrás de un proxy (HTTPS_PROXY), Node lo usa para bajar sólo con
// NODE_USE_ENV_PROXY=1 delante (Node 22.21 o más nuevo).
import fs from 'node:fs'; import path from 'node:path';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const salida = path.join(raiz, 'diario', 'imagenes');
const listaCaras = path.join(raiz, 'diario', '_herramientas', 'caras.json');
const listo = (archivo) => console.log('✓', path.relative(raiz, archivo), Math.round(fs.statSync(archivo).size / 1024) + ' KB');
const [, , pedido, ...args] = process.argv;
if (!['caras', 'tapa', 'escena', 'rumbo'].includes(pedido)) { console.error('Uso: imagenes.mjs caras | tapa AAAA-MM-DD https://… | escena AAAA-MM-DD a https://… | rumbo'); process.exit(1); }

const nav = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const pg = await nav.newPage();
const bajar = async (url) => {
  const r = await fetch(url).catch((e) => ({ ok: false, status: e.cause?.code || e.message }));
  if (!r.ok) throw new Error(`no pude bajar ${url} (${r.status}). ¿La red deja entrar a ${new URL(url).host}?`);
  return `data:${r.headers.get('content-type') || 'image/png'};base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`;
};
// Pasa una imagen al ancho pedido (el alto, proporcional, salvo que se diga) y la guarda en PNG o JPEG
const guardar = async (datos, archivo, ancho, alto) => {
  await pg.setContent(`<body style="margin:0"><img src="${datos}" style="display:block;width:100vw;height:100vh;object-fit:cover"></body>`);
  const [w, h] = await pg.$eval('img', (i) => i.decode().then(() => [i.naturalWidth, i.naturalHeight]));
  await pg.setViewportSize({ width: ancho, height: alto || Math.round(ancho * h / w) });
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  await pg.screenshot({ path: archivo, ...(archivo.endsWith('.jpg') ? { type: 'jpeg', quality: 86 } : {}) });
  listo(archivo);
};

let fallas = 0;
if (pedido === 'caras') {
  const pendientes = fs.existsSync(listaCaras) ? JSON.parse(fs.readFileSync(listaCaras, 'utf8')) : {};
  for (const [id, { bn, color }] of Object.entries(pendientes)) {
    try {
      await guardar(await bajar(bn), path.join(salida, 'caras', `${id}.jpg`), 320, 320);
      if (color) await guardar(await bajar(color), path.join(salida, 'caras', 'color', `${id}.jpg`), 640, 640);
      delete pendientes[id];
    } catch (e) { fallas++; console.error(`✗ ${id}: ${e.message}`); }
  }
  fs.writeFileSync(listaCaras, JSON.stringify(pendientes, null, 2) + '\n');
  console.log(Object.keys(pendientes).length ? `  Quedan en caras.json: ${Object.keys(pendientes).join(', ')}` : '  caras.json quedó vacío: el diario usa las caras del repo.');
}
if (pedido === 'tapa') {
  const [fecha, url] = args;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^https:\/\//.test(url || '')) { console.error('Uso: imagenes.mjs tapa AAAA-MM-DD https://…'); process.exit(1); }
  try {
    await guardar(await bajar(url), path.join(salida, 'tapas', `${fecha}.jpg`), 1200);
    console.log(`  En el JSON de la edición: "tapa": { "src": "imagenes/tapas/${fecha}.jpg", … }`);
  } catch (e) { fallas++; console.error(`✗ tapa: ${e.message}`); }
}
if (pedido === 'escena') {
  const [fecha, letra, url] = args;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^[a-f]$/.test(letra || '') || !/^https:\/\//.test(url || '')) { console.error('Uso: imagenes.mjs escena AAAA-MM-DD a https://…'); process.exit(1); }
  try {
    await guardar(await bajar(url), path.join(raiz, 'diario', '_herramientas', 'escenas', `${fecha}-${letra}.jpg`), 900);
    console.log(`  En el JSON de la edición, en "escenas": { "imagen": "_herramientas/escenas/${fecha}-${letra}.jpg", "escena": "…" }`);
  } catch (e) { fallas++; console.error(`✗ escena: ${e.message}`); }
}
if (pedido === 'rumbo') {
  // La tinta del cómic (contorno grueso), el color plano de imprenta y el paso a blanco y negro del manga
  const K = '#0d0b1a', T = 320;
  const datos = 'data:image/png;base64,' + fs.readFileSync(path.join(raiz, 'assets', 'rumbo', 'icono.png')).toString('base64');
  await pg.setViewportSize({ width: T, height: T });
  await pg.setContent(`<body style="margin:0;background:transparent"><svg width="${T}" height="${T}" viewBox="0 0 ${T} ${T}" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="tinta" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
  <feMorphology in="SourceAlpha" operator="dilate" radius="3.2" result="grueso"/>
  <feFlood flood-color="${K}"/><feComposite in2="grueso" operator="in" result="contorno"/>
  <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gris"/>
  <feComponentTransfer in="gris" result="plano">
    <feFuncR type="discrete" tableValues="0.06 0.32 0.6 0.84 1"/><feFuncG type="discrete" tableValues="0.06 0.32 0.6 0.84 1"/><feFuncB type="discrete" tableValues="0.06 0.32 0.6 0.84 1"/>
  </feComponentTransfer>
  <feMerge><feMergeNode in="contorno"/><feMergeNode in="plano"/></feMerge>
</filter></defs>
<image href="${datos}" x="12" y="12" width="${T - 24}" height="${T - 24}" filter="url(#tinta)"/></svg></body>`);
  await pg.screenshot({ path: path.join(salida, 'rumbo.png'), omitBackground: true });
  listo(path.join(salida, 'rumbo.png'));
}
await nav.close();
process.exit(fallas ? 1 : 0);
