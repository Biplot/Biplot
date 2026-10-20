// Entrega una edición de La Línea al taller del CRM (biplot-nucleo), para que un socio la valide en Marketing:
//   node diario/_herramientas/taller.mjs AAAA-MM-DD /ruta/a/biplot-nucleo [v2]
//     05-crm/marketing/piezas/ll-<NNN>/: la tapa, cada capítulo de la web, el correo en tramos y su pieza.json
//   node diario/_herramientas/taller.mjs tapas AAAA-MM-DD /ruta/a/biplot-nucleo escenas.json
//     una pieza por escena propuesta para la tapa (ll-<NNN>-tapa-a, -b…): se aprueba una y se descartan las otras.
//     escenas.json: [{ "imagen": "/ruta/a/escena.png", "escena": "Plotty, de FMI, corta la línea con unas tijeras" }, …]
// Cada imagen va en JPG con su miniatura de 480 px en min/, como pide biplot-crm/docs/TALLER.md. Nada llega aprobado:
// en el CRM, Marketing → «Traer piezas nuevas» las deja por aprobar, y quien aprueba la edición es quien firma «Edita».
// Una pieza que ya está en el taller no se pisa: los archivos nuevos se entregan con otro nombre (el tercer argumento,
// «v2», se lo suma a cada archivo) y los viejos se quitan en el CRM.
// Antes: node diario/_herramientas/armar.mjs AAAA-MM-DD. Necesita Playwright (con el Chromium del entorno).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SITIO = 'https://biplot.cl';
const CAMPANA = 'la-linea';
const tapas = process.argv[2] === 'tapas';
const [fecha, nucleo, extra] = process.argv.slice(tapas ? 3 : 2);
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !nucleo || !fs.existsSync(path.join(nucleo, '05-crm', 'marketing', 'piezas')) || (tapas && !extra)) {
  console.error('Uso: taller.mjs AAAA-MM-DD /ruta/a/biplot-nucleo [v2]  ·  taller.mjs tapas AAAA-MM-DD /ruta/a/biplot-nucleo escenas.json');
  process.exit(1);
}
const ed = JSON.parse(fs.readFileSync(path.join(raiz, 'diario', '_herramientas', 'ediciones', `${fecha}.json`), 'utf8'));
const codigo = `ll-${String(ed.numero).padStart(3, '0')}`;
const plano = (t) => String(t || '').replace(/\*\*?([^*]+)\*\*?/g, '$1');
const principal = plano((ed.portada || [])[0]?.titular);
const PIE = 'Cómo validar: si está bien, apruébenla; si hay que ajustar algo, escríbanlo en esta nota y no la aprueben. '
  + 'Los ajustes vuelven como archivos con otro nombre (…-v2).';

const nav = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
// El taller de imágenes: un lienzo del navegador que achica, corta y pasa a JPEG
const lienzo = await nav.newPage();
const jpeg = (datos, ancho) => lienzo.evaluate(async ([d, w]) => {
  const i = new Image(); i.src = d; await i.decode();
  const c = document.createElement('canvas'); c.width = w || i.naturalWidth; c.height = Math.round(c.width * i.naturalHeight / i.naturalWidth);
  c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', w && w <= 480 ? 0.8 : 0.86);
}, [datos, ancho]);
// Corta una imagen larga en tramos de a lo más `alto` px, cada corte en la fila con menos tinta (entre dos bloques)
const tramos = (datos, alto) => lienzo.evaluate(async ([d, max]) => {
  const i = new Image(); i.src = d; await i.decode();
  const w = i.naturalWidth, h = i.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.drawImage(i, 0, 0);
  const px = x.getImageData(0, 0, w, h).data, tinta = new Uint32Array(h);
  for (let y = 0; y < h; y++) for (let k = y * w * 4, f = k + w * 4; k < f; k += 4) if (px[k] * 0.3 + px[k + 1] * 0.59 + px[k + 2] * 0.11 < 140) tinta[y]++;
  const n = Math.ceil(h / max), cortes = [0];
  for (let t = 1; t < n; t++) {
    const meta = Math.round(h * t / n), v = Math.round(max * 0.15); let mejor = meta;
    for (let y = Math.max(cortes.at(-1) + 1, meta - v); y < Math.min(h, meta + v); y++) if (tinta[y] < tinta[mejor] || (tinta[y] === tinta[mejor] && Math.abs(y - meta) < Math.abs(mejor - meta))) mejor = y;
    cortes.push(mejor);
  }
  cortes.push(h);
  return cortes.slice(1).map((fin, t) => {
    const s = document.createElement('canvas'); s.width = w; s.height = fin - cortes[t];
    s.getContext('2d').drawImage(c, 0, cortes[t], w, s.height, 0, 0, w, s.height); return s.toDataURL('image/jpeg', 0.86);
  });
}, [datos, alto]);
const deDatos = (d) => Buffer.from(d.split(',')[1], 'base64');
const aDatos = (buf, tipo = 'image/png') => `data:${tipo};base64,${buf.toString('base64')}`;
const leerImagen = async (src) => {
  if (/^https:\/\//.test(src)) { const r = await fetch(src); if (!r.ok) throw new Error(`no pude bajar ${src} (${r.status})`); return aDatos(Buffer.from(await r.arrayBuffer()), r.headers.get('content-type') || 'image/png'); }
  return aDatos(fs.readFileSync(src), /\.jpe?g$/i.test(src) ? 'image/jpeg' : 'image/png');
};

// Deja una pieza en el taller: sus archivos (con miniatura) y su ficha, revisados con las reglas de TALLER.md
async function entregar(cod, ficha, archivos) {
  const carpeta = path.join(nucleo, '05-crm', 'marketing', 'piezas', cod);
  const nombres = archivos.map(([n]) => n);
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(cod)) throw new Error(`código inválido: ${cod}`);
  if (nombres.some((n) => !/^[\w.-]{1,90}$/.test(n) || !n.endsWith('.jpg'))) throw new Error('un nombre de archivo no sirve');
  if (fs.existsSync(carpeta) && nombres.some((n) => fs.existsSync(path.join(carpeta, n)))) throw new Error(`${cod} ya está en el taller con esos nombres: entrega con «v2»`);
  fs.mkdirSync(path.join(carpeta, 'min'), { recursive: true });
  for (const [n, datos] of archivos) {
    fs.writeFileSync(path.join(carpeta, n), deDatos(datos));
    fs.writeFileSync(path.join(carpeta, 'min', n.replace(/\.jpg$/, '.min.jpg')), deDatos(await jpeg(datos, 480)));
  }
  const previa = fs.existsSync(path.join(carpeta, 'pieza.json')) ? JSON.parse(fs.readFileSync(path.join(carpeta, 'pieza.json'), 'utf8')).archivos : [];
  fs.writeFileSync(path.join(carpeta, 'pieza.json'), JSON.stringify({ codigo: cod, ...ficha, archivos: [...previa, ...nombres.map((archivo) => ({ archivo, uso: 'PUBLICA' }))] }, null, 2) + '\n');
  console.log('✓', path.relative(nucleo, carpeta), `${archivos.length} archivos`);
}

try {
  if (tapas) {
    const escenas = JSON.parse(fs.readFileSync(extra, 'utf8'));
    for (const [k, e] of escenas.entries()) {
      const letra = 'abcdefgh'[k], cod = `${codigo}-tapa-${letra}`;
      await entregar(cod, {
        titulo: `La Línea N.º ${ed.numero} · tapa ${letra.toUpperCase()}`.slice(0, 200), canal: 'OTRO', campana: CAMPANA, fecha,
        texto: e.escena, nota: `Una de las ${escenas.length} escenas para la tapa (la noticia: ${principal}). Aprueben la que va y descarten las otras.`,
      }, [[`LL-${ed.numero}-tapa-${letra}.jpg`, await jpeg(await leerImagen(e.imagen))]]);
    }
  } else {
    const v = extra ? `-${extra}` : '';
    // Lo que se ve: la web servida desde el repo (lo que pide a biplot.cl también sale de aquí)
    const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
    const archivoDe = (ruta) => { let f = path.join(raiz, decodeURIComponent(ruta)); if (f.endsWith(path.sep) || (fs.existsSync(f) && fs.statSync(f).isDirectory())) f = path.join(f, 'index.html'); return f; };
    const srv = http.createServer((q, r) => {
      const f = archivoDe(new URL(q.url, 'http://x').pathname);
      if (!f.startsWith(raiz) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    });
    await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
    const base = `http://127.0.0.1:${srv.address().port}`;
    const abrir = async (url, ancho) => {
      const pg = await nav.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 1.5 });
      await pg.route(/^https:\/\/biplot\.cl\//, (r) => { const f = archivoDe(new URL(r.request().url()).pathname); return fs.existsSync(f) ? r.fulfill({ path: f, contentType: TIPOS[path.extname(f)] }) : r.fulfill({ status: 404 }); });
      await pg.goto(url, { waitUntil: 'networkidle' });
      await pg.evaluate(async () => { await document.fonts.ready; for (const i of document.images) i.loading = 'eager'; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
      return pg;
    };
    const archivos = [];
    if (ed.tapa) archivos.push([`LL-${ed.numero}-tapa${v}.jpg`, await jpeg(await leerImagen(/^https:\/\//.test(ed.tapa.src) ? ed.tapa.src : path.join(raiz, 'diario', ed.tapa.src)))]);
    let pg = await abrir(`${base}/diario/${fecha}/`, 1280);
    const hojas = await pg.locator('article.hoja').count();
    for (let n = 0; n < hojas; n++) archivos.push([`LL-${ed.numero}-web-${n + 1}${v}.jpg`, await jpeg(aDatos(await pg.locator('article.hoja').nth(n).screenshot()))]);
    await pg.close();
    pg = await abrir(`${base}/diario/_herramientas/salida/${fecha}-correo.html`, 680);
    const correo = await tramos(aDatos(await pg.screenshot({ fullPage: true })), 3600);
    correo.forEach((d, k) => archivos.push([`LL-${ed.numero}-correo-${k + 1}${v}.jpg`, d]));
    await pg.close(); srv.close();
    await entregar(codigo, {
      titulo: `La Línea N.º ${ed.numero} · ${principal}`.slice(0, 200), canal: 'OTRO', campana: CAMPANA, fecha,
      texto: ed.previa || '', enlace: `${SITIO}/diario/${fecha}/`,
      nota: [`${ed.cubre || ''}. La tapa, los ${hojas} capítulos de la web y el correo en ${correo.length} tramos; cada nota lleva el enlace a su fuente.`
        + (ed.prueba ? ' Es una edición de prueba: sus noticias no están verificadas.' : ''),
        'Quien la apruebe firma «Edita». Después se publica uniendo su PR en Aprobaciones (Biplot/Biplot) y se envía desde Brevo.', PIE].join('\n\n'),
    }, archivos);
  }
} catch (e) { console.error('✗', e.message); process.exitCode = 1; }
await nav.close();
