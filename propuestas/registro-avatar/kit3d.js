// Lo que comparten Plotty y Atlas en 3D: la pintura de la banda (cada pieza con su color y una sola sombra dura, con la
// luz fija arriba a la izquierda, como en los dibujos de la oficina), el contorno de tinta (una copia apenas más grande
// de cada pieza, pintada en tinta por detrás), las piezas con su contorno y las texturas que se dibujan en un lienzo.
import * as THREE from './three/three.module.min.js';

export { THREE };
export const TINTA = '#0C0D11';
export const W = 0.05;                                            // grosor de la tinta en unidades (el dibujo: 6 de 600)
const LUZ = new THREE.Vector3(-0.45, 0.62, 0.64).normalize();     // en el espacio de la cámara: la sombra cae abajo a la derecha

// Del dibujo (600 × 600, centro en 300 300, y hacia abajo) a unidades (y hacia arriba)
export const X = (px) => (px - 300) / 100;
export const Y = (py) => (300 - py) / 100;
export const grados = (g) => (g * Math.PI) / 180;

// ── Las pinturas ──
const vertice = `varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const fragmento = `uniform vec3 uColor; uniform vec3 uSombra; uniform vec3 uLuz; uniform float uUmbral; uniform float uOpacidad;
uniform vec3 uBorde; uniform float uFresnel; uniform vec3 uEmision;
varying vec3 vN; varying vec3 vV;
void main() {
  vec3 n = normalize(vN);
  vec3 c = dot(n, uLuz) > uUmbral ? uColor : uSombra;
  float f = pow(1.0 - clamp(dot(n, normalize(vV)), 0.0, 1.0), 2.4) * uFresnel;
  c = mix(c, uBorde, clamp(f, 0.0, 1.0)) + uEmision;
  gl_FragColor = vec4(c, uOpacidad);
  #include <colorspace_fragment>
}`;
// Color plano con su sombra dura; opcional: transparencia y un borde de luz (el vidrio de Atlas)
export function pintura(color, sombra = color, { umbral = 0.12, opacidad = 1, borde = color, fresnel = 0 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uSombra: { value: new THREE.Color(sombra) }, uLuz: { value: LUZ },
      uUmbral: { value: umbral }, uOpacidad: { value: opacidad }, uBorde: { value: new THREE.Color(borde) },
      uFresnel: { value: fresnel }, uEmision: { value: new THREE.Color(0, 0, 0) }
    },
    vertexShader: vertice, fragmentShader: fragmento,
    transparent: opacidad < 1, depthWrite: opacidad >= 1
  });
}
// Sin luz: lo que brilla (el plasma, la llama, los LED)
export const basico = (color, opciones = {}) => new THREE.MeshBasicMaterial({ color, ...opciones });

const tinta = new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Color(TINTA) } },
  vertexShader: 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform vec3 uColor; void main() { gl_FragColor = vec4(uColor, 1.0);\n#include <colorspace_fragment>\n}',
  side: THREE.BackSide
});

// ── Las piezas: la forma con su pintura y, detrás, la misma forma agrandada en tinta ──
// crear(e) arma la geometría agrandada en e; con w = 0 la pieza va sin contorno
function par(crear, material, w) {
  const g = new THREE.Group();
  if (w > 0) g.add(new THREE.Mesh(crear(w), tinta));
  g.add(new THREE.Mesh(crear(0), material));
  return g;
}
export const esfera = (r, mat, w = W) => par((e) => new THREE.SphereGeometry(r + e, 48, 32), mat, w);
export const elipsoide = (rx, ry, rz, mat, w = W) => par((e) => new THREE.SphereGeometry(1, 48, 32).scale(rx + e, ry + e, rz + e), mat, w);
export const cilindro = (arriba, abajo, alto, mat, w = W, lados = 40) =>
  par((e) => new THREE.CylinderGeometry(arriba + e, abajo + e, alto + 2 * e, lados), mat, w);
export const capsula = (r, largo, mat, w = W) => par((e) => new THREE.CapsuleGeometry(r + e, largo, 8, 20), mat, w);
export const toro = (R, r, mat, w = W) => par((e) => new THREE.TorusGeometry(R, r + e, 18, 140), mat, w);
export const caja = (x, y, z, mat, w = W) => par((e) => new THREE.BoxGeometry(x + 2 * e, y + 2 * e, z + 2 * e), mat, w);

// Una cápsula de un punto a otro (brazos, dedos)
export function barra(a, b, r, mat, w = W) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const g = capsula(r, A.distanceTo(B), mat, w);
  g.position.copy(A).add(B).multiplyScalar(0.5);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return g;
}
// Un tubo por una curva (la antena)
export function tubo(puntos, r, mat, w = W) {
  const curva = new THREE.CatmullRomCurve3(puntos.map((p) => new THREE.Vector3(...p)));
  return par((e) => new THREE.TubeGeometry(curva, 32, r + e, 12, false), mat, w);
}

// El cuadrado de lados abombados del isotipo (superelipse)
export function squircle(a, b, n = 4.4, N = 96) {
  const s = new THREE.Shape();
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2, c = Math.cos(t), si = Math.sin(t);
    const x = a * Math.sign(c) * Math.abs(c) ** (2 / n), y = b * Math.sign(si) * Math.abs(si) ** (2 / n);
    if (i) s.lineTo(x, y); else s.moveTo(x, y);
  }
  s.closePath();
  return s;
}
// Una losa con esa forma y los cantos redondeados, centrada (la carcasa de Plotty, el borde de su pantalla, la placa)
export function losa(a, b, prof, mat, { w = W, n = 4.4, bisel = 0.1 } = {}) {
  return par((e) => {
    const bs = bisel + e;
    const g = new THREE.ExtrudeGeometry(squircle(a + e - bs, b + e - bs, n), {
      depth: Math.max(0.002, prof + 2 * e - 2 * bs), bevelEnabled: true, bevelThickness: bs, bevelSize: bs, bevelSegments: 6, curveSegments: 12
    });
    g.center();
    return g;
  }, mat, w);
}
// Una cara plana con una textura que la cubre entera (la pantalla, el frente de la placa)
export function caraPlana(forma) {
  const g = new THREE.ShapeGeometry(forma, 1);
  g.computeBoundingBox();
  const b = g.boundingBox, uv = g.attributes.uv, pos = g.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (pos.getX(i) - b.min.x) / (b.max.x - b.min.x), (pos.getY(i) - b.min.y) / (b.max.y - b.min.y));
  }
  return g;
}

// ── Lienzos ──
export function lienzo(ancho, alto) {
  const c = document.createElement('canvas');
  c.width = ancho; c.height = alto;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { c, ctx: c.getContext('2d'), tex };
}
// El halo de lo que brilla: un degradado redondo, compartido
let halo = null;
function texturaHalo() {
  if (halo) return halo;
  const { ctx, tex } = lienzo(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  halo = tex;
  return tex;
}
export function brillo(color, tam, opacidad = 0.6) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaHalo(), color, transparent: true, opacity: opacidad, depthWrite: false }));
  s.scale.set(tam, tam, 1);
  return s;
}
// La sombra en el suelo (y su reflejo de color)
export function sombraSuelo(r, color = TINTA, opacidad = 0.4) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opacidad, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

// ── Utilidades del movimiento ──
export const acercar = (actual, meta, dt, rapidez = 8) => actual + (meta - actual) * (1 - Math.exp(-Math.max(0, dt) * rapidez));
export const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
// Azar fijo por semilla (el plasma cambia de forma, pero no tiembla dentro de un mismo instante)
export const azar = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// Libera todo lo de la GPU al cambiar de personaje (el halo compartido se queda)
export function liberar(raiz) {
  raiz.traverse((o) => {
    o.geometry?.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) { if (m.map && m.map !== halo) m.map.dispose(); if (m !== tinta) m.dispose(); }
  });
}
