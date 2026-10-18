// Exporta las imágenes de La Línea con la paleta de Gotham (la noche, el acero y la luz del farol):
//   diario/imagenes/caras/<id>.png  la cara de quien firma (160 × 160, fondo transparente), desde el kit de la oficina
//   diario/imagenes/prensa.jpg      la foto de portada: Aby y Felipe, la dupla de PRENSA, con la trama de puntos del diario
//   diario/imagenes/rumbo.png       el ícono de Rumbo, para el consultorio
//   diario/imagenes/cabecera.png    «La Línea» en letra gótica, para el correo (Gmail y Outlook no cargan esa fuente)
// Todo en PNG o JPEG: los correos (Outlook, sobre todo) no muestran WebP.
// Uso, desde la raíz del repo: node diario/_herramientas/imagenes.mjs [caras,prensa,rumbo,cabecera]
// Necesita Playwright (con el Chromium del entorno).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const salida = path.join(raiz, 'diario', 'imagenes');
const CARAS = ['aby', 'felipe', 'celda', 'engine', 'architect', 'lupe', 'tamandua', 'pepa', 'faro', 'atlas', 'plotty'];
const pedidas = process.argv[2] ? process.argv[2].split(',') : ['caras', 'prensa', 'rumbo', 'cabecera'];

// La paleta de Gotham: el color baja a un tercio, las sombras se van al acero y las luces al farol de sodio
const FILTRO = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="gotham" color-interpolation-filters="sRGB">
  <feColorMatrix type="saturate" values="0.32"/>
  <feComponentTransfer>
    <feFuncR type="table" tableValues="0.035 0.15 0.42 0.80 0.95"/>
    <feFuncG type="table" tableValues="0.045 0.16 0.38 0.69 0.86"/>
    <feFuncB type="table" tableValues="0.065 0.21 0.36 0.53 0.66"/>
  </feComponentTransfer></filter></svg>`;
// La trama de puntos de un diario impreso, encima de la foto
const TRAMA = 'radial-gradient(circle at 50% 50%, rgba(10,9,8,.42) 0 1.05px, transparent 1.35px) 0 0/4px 4px';

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = http.createServer((q, r) => {
  let ruta = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const f = path.join(raiz, ruta);
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${srv.address().port}`;
const nav = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const listo = (archivo) => console.log('✓', path.relative(raiz, archivo), Math.round(fs.statSync(archivo).size / 1024) + ' KB');

if (pedidas.includes('caras')) {
  fs.mkdirSync(path.join(salida, 'caras'), { recursive: true });
  const pg = await nav.newPage({ viewport: { width: 160, height: 160 }, reducedMotion: 'reduce' });
  for (const id of CARAS) {
    await pg.goto(`${base}/oficina/kit/?pieza=cara-${id}&formato=cara`, { waitUntil: 'networkidle' });
    await pg.waitForFunction(() => window.KIT_LISTO === true, null, { timeout: 15000 });
    await pg.evaluate((filtro) => { document.body.insertAdjacentHTML('beforeend', filtro); document.querySelector('.k-cara').style.filter = 'url(#gotham)'; }, FILTRO);
    const archivo = path.join(salida, 'caras', id + '.png');
    await pg.screenshot({ path: archivo, omitBackground: true, clip: { x: 0, y: 0, width: 160, height: 160 } });
    listo(archivo);
  }
  await pg.close();
}

if (pedidas.includes('prensa')) {
  // Aby y Felipe bajo el farol, de la cintura para arriba
  const pg = await nav.newPage({ viewport: { width: 1200, height: 760 } });
  await pg.goto(`${base}/diario/`, { waitUntil: 'domcontentloaded' });
  await pg.addScriptTag({ url: `${base}/oficina/ilustraciones.js` });
  await pg.evaluate(({ filtro, trama }) => {
    const I = window.Ilustraciones;
    const figura = (id, x) => `<svg viewBox="${I[id].vb}" style="position:absolute;left:${x}px;top:-6px;width:560px;filter:url(#gotham)">${I[id].svg}</svg>`;
    document.documentElement.innerHTML = `<body style="margin:0">${filtro}<div id="foto" style="position:relative;width:1200px;height:760px;overflow:hidden;
      background:radial-gradient(ellipse 46% 60% at 52% 6%, #8a7448 0%, #4a4234 32%, #1d1e20 66%, #0d0f12 100%)">
      <div style="position:absolute;inset:auto 0 0 0;height:300px;background:linear-gradient(transparent,#0d0f12 85%)"></div>
      ${figura('aby', 150)}${figura('felipe', 510)}
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(13,15,18,.85));"></div>
      <div style="position:absolute;inset:0;background:${trama};mix-blend-mode:multiply;opacity:.9"></div>
    </div></body>`;
  }, { filtro: FILTRO, trama: TRAMA });
  await pg.waitForTimeout(300);
  fs.mkdirSync(salida, { recursive: true });
  const archivo = path.join(salida, 'prensa.jpg');
  await pg.locator('#foto').screenshot({ path: archivo, type: 'jpeg', quality: 80 });
  listo(archivo);
  await pg.close();
}

if (pedidas.includes('rumbo')) {
  const pg = await nav.newPage({ viewport: { width: 128, height: 128 } });
  await pg.goto(`${base}/diario/`, { waitUntil: 'domcontentloaded' });
  // El filtro va dentro del mismo SVG que la imagen: así se aplica también al PNG
  const datos = 'data:image/png;base64,' + fs.readFileSync(path.join(raiz, 'assets', 'rumbo', 'icono.png')).toString('base64');
  await pg.setContent(`<body style="margin:0;background:transparent"><svg id="r" width="128" height="128" viewBox="0 0 128 128" style="display:block">
    ${FILTRO.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}<image href="${datos}" width="128" height="128" filter="url(#gotham)"/></svg></body>`);
  const archivo = path.join(salida, 'rumbo.png');
  await pg.locator('#r').screenshot({ path: archivo, omitBackground: true });
  listo(archivo);
  await pg.close();
}

if (pedidas.includes('cabecera')) {
  // A 2×: el correo la muestra a 552 px de ancho
  const pg = await nav.newPage({ viewport: { width: 1104, height: 220 }, deviceScaleFactor: 1 });
  await pg.setContent(`<link href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap" rel="stylesheet">
    <body style="margin:0;background:transparent"><div id="c" style="width:1104px;height:220px;display:flex;align-items:center;justify-content:center;
    font:400 196px/1 'UnifrakturMaguntia',serif;color:#16130F;letter-spacing:-2px">La Línea</div></body>`, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  const archivo = path.join(salida, 'cabecera.png');
  await pg.locator('#c').screenshot({ path: archivo, omitBackground: true });
  listo(archivo);
  await pg.close();
}
await nav.close(); srv.close();
