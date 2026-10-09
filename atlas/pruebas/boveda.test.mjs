import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, mkdtemp, cp } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import os from 'node:os';
import path from 'node:path';
import { copiaDeLaBoveda, variablesDePrueba, FIXTURA } from './ayuda.mjs';

const dir = await copiaDeLaBoveda();
variablesDePrueba(dir);
const B = await import('../lib/boveda.js');

test('carga las páginas del wiki, sin raw/', async () => {
  const b = await B.cargar({ forzar: true });
  assert.ok(b.archivos.has('CLAUDE.md'));
  assert.ok(b.archivos.has('Biplot/proyectos/Rumbo.md'));
  assert.ok(![...b.archivos.keys()].some((r) => r.includes('/raw/')));
  assert.equal(b.paginas.length, 6);
});

test('encuentra páginas por nombre, alias, con [[ ]] y sin tildes', async () => {
  const b = await B.cargar();
  assert.equal(B.encontrarPagina(b, 'rumbo').pagina.ruta, 'Biplot/proyectos/Rumbo.md');
  assert.equal(B.encontrarPagina(b, 'App Vendible').pagina.nombre, 'Rumbo');
  assert.equal(B.encontrarPagina(b, 'Aplicación de gestiones personales').pagina.nombre, 'Rumbo');
  assert.equal(B.encontrarPagina(b, '[[Pendientes abiertos|lo pendiente]]').pagina.nombre, 'Pendientes abiertos');
  assert.equal(B.encontrarPagina(b, 'sesion 2026-09-21 — notificaciones, dominio y cuenta').pagina.carpeta, 'sesiones');
  const nada = B.encontrarPagina(b, 'Pendientes');
  assert.equal(nada.pagina, null);
  assert.deepEqual(nada.sugerencias, ['Pendientes abiertos']);
});

test('busca y devuelve primero la página que más calza', async () => {
  const b = await B.cargar();
  const r = B.buscar(b, '¿Qué quedó pendiente del prompt v44 en Rumbo?');
  assert.equal(r[0].pagina, 'Rumbo');
  assert.ok(r[0].fragmentos.some((f) => f.includes('Prompt v44')));
  assert.ok(r.every((x) => x.pagina !== 'log'));
  assert.deepEqual(B.buscar(b, 'de la que'), []);
});

test('agregar en una sección que termina en callout: el punto va dentro del callout', async () => {
  const b = await B.cargar();
  const { texto, vista } = B.aplicarCambio(b.archivos.get('Biplot/proyectos/Rumbo.md'), {
    tipo: 'agregar', seccion: 'Pendientes abiertos', texto: '- [ ] Lunes 12: revisar el Prompt v44 con [[Hernán]].'
  });
  assert.match(texto, /> - Selector de año antes de enero 2027\.\n> - \[ \] Lunes 12: revisar el Prompt v44 con \[\[Hernán\]\]\.\n\n## Fuentes/);
  assert.deepEqual(vista.map((l) => l.signo), [' ', '+']);
});

test('agregar sin sección: va al final, antes de «## Fuentes»', async () => {
  const b = await B.cargar();
  const { texto } = B.aplicarCambio(b.archivos.get('Biplot/proyectos/Rumbo.md'), { tipo: 'agregar', texto: '## Notas\n- Una nota.' });
  assert.match(texto, /> - Selector de año antes de enero 2027\.\n\n## Notas\n- Una nota\.\n\n## Fuentes/);
});

test('agregar en una sección con título enlazado y emoji', async () => {
  const b = await B.cargar();
  const p = b.archivos.get('Biplot/sintesis/Pendientes abiertos.md');
  assert.match(B.aplicarCambio(p, { tipo: 'agregar', seccion: 'Rumbo', texto: '- Otra cosa.' }).texto, /- ~~Algo tachado~~\n- Otra cosa\.\n\n## Fuentes/);
  assert.match(B.aplicarCambio(p, { tipo: 'agregar', seccion: 'Seguridad', texto: '- [ ] Una más.' }).texto, /- \[x\] Algo que ya se hizo\.\n- \[ \] Una más\.\n\n## \[\[Rumbo\]\]/);
  assert.throws(() => B.aplicarCambio(p, { tipo: 'agregar', seccion: 'No existe', texto: '- x' }), /No hay una sección/);
});

test('reemplazar: sólo un texto que aparece una vez', async () => {
  const b = await B.cargar();
  const p = b.archivos.get('Biplot/proyectos/Rumbo.md');
  const r = B.aplicarCambio(p, { tipo: 'reemplazar', buscar: 'sin ejecutar', texto: 'ejecutado el 2026-10-12' });
  assert.match(r.texto, /El Prompt v44 quedó redactado, ejecutado el 2026-10-12\./);
  assert.deepEqual(r.vista, [{ signo: '-', texto: 'sin ejecutar' }, { signo: '+', texto: 'ejecutado el 2026-10-12' }]);
  assert.throws(() => B.aplicarCambio(p, { tipo: 'reemplazar', buscar: 'no está', texto: 'x' }), /no está/);
  assert.throws(() => B.aplicarCambio(p, { tipo: 'reemplazar', buscar: 'Prompt v44', texto: 'x' }), /aparece 2 veces/);
});

test('marca «actualizado» sólo en el frontmatter', () => {
  const t = '---\ntipo: x\nactualizado: 2026-01-01\n---\n# T\n\nactualizado: no se toca\n';
  assert.equal(B.marcarActualizado(t, '2026-10-09'), '---\ntipo: x\nactualizado: 2026-10-09\n---\n# T\n\nactualizado: no se toca\n');
  assert.equal(B.marcarActualizado('# Sin frontmatter\n', '2026-10-09'), '# Sin frontmatter\n');
});

test('no deja editar el log ni el índice, ni páginas que no existen', async () => {
  const b = await B.cargar();
  assert.throws(() => B.prepararCambio(b, { pagina: 'log', tipo: 'agregar', texto: '- x', resumen: 'x' }), /no se edita/);
  assert.throws(() => B.prepararCambio(b, { pagina: 'Página nueva', tipo: 'agregar', texto: '- x', resumen: 'x' }), /No hay una página/);
  assert.throws(() => B.prepararCambio(b, { pagina: 'Rumbo', tipo: 'agregar', texto: '- x', resumen: '  ' }), /resumen/);
});

test('guardar escribe la página (con «actualizado» de hoy) y suma la línea al log', async () => {
  const { hoyChile } = await import('../lib/fecha.js');
  const r = await B.guardarPropuesta({ pagina: 'App Vendible', tipo: 'agregar', seccion: 'Pendientes abiertos', texto: '- [ ] Revisar el v44.', resumen: 'Rumbo — revisar el v44' });
  assert.equal(r.pagina, 'Rumbo');
  const rumbo = await readFile(path.join(dir, 'Biplot/proyectos/Rumbo.md'), 'utf8');
  assert.match(rumbo, new RegExp(`actualizado: ${hoyChile()}`));
  assert.match(rumbo, /> - \[ \] Revisar el v44\./);
  const log = await readFile(path.join(dir, 'Biplot/log.md'), 'utf8');
  assert.ok(log.endsWith(`\n\n## [${hoyChile()}] nota | Rumbo — revisar el v44\n- Atlas lo anotó en [[Rumbo]] a pedido de Chris, desde su página.\n`));
  // Y la próxima lectura ya lo ve
  assert.match((await B.cargar()).archivos.get('Biplot/proyectos/Rumbo.md'), /Revisar el v44/);
});

test('lee un .tar.gz como el de GitHub (rutas con tildes en cabeceras pax)', async () => {
  const repo = await mkdtemp(path.join(os.tmpdir(), 'atlas-tar-'));
  await cp(FIXTURA, repo, { recursive: true });
  const git = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'buffer', env: { ...process.env, GIT_AUTHOR_NAME: 'p', GIT_AUTHOR_EMAIL: 'p@p', GIT_COMMITTER_NAME: 'p', GIT_COMMITTER_EMAIL: 'p@p' } });
  git('init', '-q'); git('add', '-A'); git('commit', '-qm', 'prueba');
  const tgz = git('archive', '--format=tar.gz', '--prefix=4ChrisM-boveda-biplot-abc123/', 'HEAD');
  const archivos = B.leerTar(gunzipSync(tgz));
  const sesion = '4ChrisM-boveda-biplot-abc123/Biplot/sesiones/Sesión 2026-09-21 — Notificaciones, dominio y cuenta.md';
  assert.ok(archivos.has(sesion), [...archivos.keys()].join('\n'));
  assert.match(archivos.get(sesion).toString('utf8'), /notificaciones push/);
  assert.equal(archivos.size, 8);
});
