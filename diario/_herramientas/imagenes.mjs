// Exporta las imágenes de La Línea en su formato de manga y cómic:
//   diario/imagenes/caras/<id>.png   la cara de quien firma, en el recuadro de esquina del cómic, pasada a blanco y negro
//                                    como en las páginas de un manga: tinta gruesa, sombra dura con trama de puntos
//                                    (320 × 320, fondo transparente), desde los dibujos de la oficina (ilustraciones.js)
//   diario/imagenes/rumbo.png        el ícono de Rumbo, en blanco y negro, para el consultorio
//   diario/imagenes/tapas/<fecha>.<ext>  la tapa a color de una edición, bajada desde la URL donde quedó al generarla:
//                                    node diario/_herramientas/imagenes.mjs tapa AAAA-MM-DD <url>
// Todo en PNG o JPEG: los correos (Outlook, sobre todo) no muestran WebP ni aplican filtros.
// Uso, desde la raíz del repo: node diario/_herramientas/imagenes.mjs [caras,rumbo]
// Necesita Playwright (con el Chromium del entorno).
import fs from 'node:fs'; import path from 'node:path';
const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const salida = path.join(raiz, 'diario', 'imagenes');
const listo = (archivo) => console.log('✓', path.relative(raiz, archivo), Math.round(fs.statSync(archivo).size / 1024) + ' KB');

// La tapa de una edición: se baja tal cual y se guarda con la extensión de su tipo
if (process.argv[2] === 'tapa') {
  const [, , , fecha, url] = process.argv;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^https:\/\//.test(url || '')) { console.error('Uso: imagenes.mjs tapa AAAA-MM-DD https://…'); process.exit(1); }
  const r = await fetch(url);
  if (!r.ok) { console.error(`✗ No pude bajar la tapa (${r.status}). ¿La red del entorno deja entrar a ${new URL(url).host}?`); process.exit(1); }
  const ext = (r.headers.get('content-type') || '').includes('jpeg') ? 'jpg' : 'png';
  fs.mkdirSync(path.join(salida, 'tapas'), { recursive: true });
  const archivo = path.join(salida, 'tapas', `${fecha}.${ext}`);
  fs.writeFileSync(archivo, Buffer.from(await r.arrayBuffer()));
  listo(archivo);
  console.log(`  En el JSON de la edición: "tapa": { "src": "imagenes/tapas/${fecha}.${ext}", … }`);
  process.exit(0);
}

const pedidas = process.argv[2] ? process.argv[2].split(',') : ['caras', 'rumbo'];
global.window = {}; await import(path.join(raiz, 'oficina', 'ilustraciones.js'));
const I = global.window.Ilustraciones;
const CARAS = ['aby', 'felipe', 'celda', 'engine', 'architect', 'lupe', 'tamandua', 'pepa', 'faro', 'atlas', 'plotty'];
const K = '#0d0b1a', T = 320;
// La tinta del cómic (contorno grueso), el color plano de imprenta y, al final, el paso a blanco y negro del manga
const FILTRO = `<filter id="tinta" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
  <feMorphology in="SourceAlpha" operator="dilate" radius="3.2" result="grueso"/>
  <feFlood flood-color="${K}"/><feComposite in2="grueso" operator="in" result="contorno"/>
  <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gris"/>
  <feComponentTransfer in="gris" result="plano">
    <feFuncR type="discrete" tableValues="0.06 0.32 0.6 0.84 1"/><feFuncG type="discrete" tableValues="0.06 0.32 0.6 0.84 1"/><feFuncB type="discrete" tableValues="0.06 0.32 0.6 0.84 1"/>
  </feComponentTransfer>
  <feMerge><feMergeNode in="contorno"/><feMergeNode in="plano"/></feMerge>
</filter>
<filter id="blanco"><feFlood flood-color="#fff"/><feComposite in2="SourceAlpha" operator="in"/></filter>
<pattern id="trama" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3.5" cy="3.5" r="1.75" fill="${K}"/></pattern>`;
// La sombra dura: la luz viene de arriba a la izquierda y el lado derecho de la figura cae en trama
const sombra = `<polygon points="${T * 0.6},0 ${T},0 ${T},${T} ${T * 0.38},${T}" fill="${K}" opacity=".22"/>
  <polygon points="${T * 0.6},0 ${T},0 ${T},${T} ${T * 0.38},${T}" fill="url(#trama)" opacity=".42"/>`;
const nav = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const pg = await nav.newPage({ viewport: { width: T, height: T } });
const foto = async (svgInterno, archivo) => {
  await pg.setContent(`<body style="margin:0;background:transparent"><svg width="${T}" height="${T}" viewBox="0 0 ${T} ${T}" xmlns="http://www.w3.org/2000/svg">${svgInterno}</svg></body>`);
  await pg.screenshot({ path: archivo, omitBackground: true });
  listo(archivo);
};

if (pedidas.includes('caras')) {
  fs.mkdirSync(path.join(salida, 'caras'), { recursive: true });
  for (const id of CARAS) {
    const [x, y, w, h] = I[id].cabeza.split(' ').map(Number);
    const k = id === 'atlas' || id === 'plotty' ? 1.25 : 1.5;
    const vb = [x - w * (k - 1) / 2, y - h * 0.08, w * k, h * k].map(Math.round).join(' ');
    await foto(`<defs>${FILTRO}<svg id="fig" x="10" y="10" width="${T - 20}" height="${T - 20}" viewBox="${vb}">${I[id].svg}</svg>
      <mask id="silueta" maskUnits="userSpaceOnUse" x="0" y="0" width="${T}" height="${T}"><use href="#fig" filter="url(#blanco)"/></mask></defs>
      <g filter="url(#tinta)"><use href="#fig"/></g><g mask="url(#silueta)">${sombra}</g>`, path.join(salida, 'caras', id + '.png'));
  }
}
if (pedidas.includes('rumbo')) {
  const datos = 'data:image/png;base64,' + fs.readFileSync(path.join(raiz, 'assets', 'rumbo', 'icono.png')).toString('base64');
  await foto(`<defs>${FILTRO}</defs><image href="${datos}" x="12" y="12" width="${T - 24}" height="${T - 24}" filter="url(#tinta)"/>`, path.join(salida, 'rumbo.png'));
}
await nav.close();
