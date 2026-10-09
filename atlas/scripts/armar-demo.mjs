// Arma el demo de Atlas como una página suelta, sin servidor (para publicarla y verla sin Vercel): la página de verdad,
// el servidor de mentira de demo/servidor.js y una bóveda de ejemplo (la de las pruebas más demo/boveda-extra).
// Uso: node scripts/armar-demo.mjs <carpeta>   → <carpeta>/atlas-demo.html y lo que necesita al lado
import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esDelWiki } from '../lib/paginas.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const salida = path.resolve(process.argv[2] ?? path.join(raiz, 'demo-armado'));
await mkdir(path.join(salida, 'lib'), { recursive: true });
await mkdir(path.join(salida, 'demo'), { recursive: true });
await cp(path.join(raiz, 'public/js'), path.join(salida, 'js'), { recursive: true });
await cp(path.join(raiz, 'public/estilos.css'), path.join(salida, 'estilos.css'));
await cp(path.join(raiz, 'public/avatares3d'), path.join(salida, 'avatares3d'), { recursive: true });
for (const f of ['paginas.js', 'resumen.js', 'fecha.js', 'simulado.js', 'herramientas.js']) await cp(path.join(raiz, 'lib', f), path.join(salida, 'lib', f));
await cp(path.join(raiz, 'demo/servidor.js'), path.join(salida, 'demo/servidor.js'));

// La bóveda de ejemplo, como un módulo
const archivos = {};
async function juntar(dir, rel = '') {
  for (const e of await readdir(path.join(dir, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) await juntar(dir, r);
    else if (esDelWiki(r)) archivos[r] = await readFile(path.join(dir, r), 'utf8');
  }
}
await juntar(path.join(raiz, 'pruebas/boveda-de-prueba'));
await juntar(path.join(raiz, 'demo/boveda-extra'));
await writeFile(path.join(salida, 'demo/boveda-demo.js'), `// La bóveda de ejemplo del demo (generada por scripts/armar-demo.mjs)\nexport const ARCHIVOS = ${JSON.stringify(archivos, null, 1)};\n`);

// La página: lo de public/index.html como página suelta (sin manifiesto ni service worker), con el demo antes de app.js
const html = await readFile(path.join(raiz, 'public/index.html'), 'utf8');
const cabeza = html.slice(html.indexOf('<title>'), html.indexOf('</head>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Atlas (demo)</title>')
  .replace(/^<(meta name="(robots|theme-color|apple|mobile)|link rel="(manifest|icon|apple))[^\n]*\n/gm, '');
const cuerpo = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace('<script type="module" src="js/app.js"></script>', '<script type="module" src="demo/servidor.js"></script>\n<script type="module" src="js/app.js"></script>');
await writeFile(path.join(salida, 'atlas-demo.html'), `${cabeza}${cuerpo}`);
console.log(`Demo armado en ${salida}`);
