// Plotty en 3D, calcado de su dibujo de la banda (oficina/_herramientas/dibujos/banda/plotty.mjs): la carcasa blanca
// con la pantalla del isotipo y su cara de LED, los dos rotores, la antena con el punto del logo, el cuello de fuelle,
// la barriga con el 0, la llama de plasma y las dos manos que flotan. Las medidas salen del dibujo (600 × 600).
// La cara de LED se dibuja en un lienzo: cada estado arma su cara con unos ojos y una boca, y los ojos siguen al cursor.
import {
  THREE, X, Y, grados, pintura, basico, esfera, elipsoide, cilindro, barra, toro, tubo, losa, squircle, caraPlana,
  lienzo, brillo, sombraSuelo, acercar, limitar, TINTA
} from './kit3d.js';

export const COLORES = { cuerpo: '#1c426d', ojos: '#17c3b2' };
const C = {
  carcasa: '#EEF2F6', carcasaS: '#B9C8D8', azul: '#1C426D', azulS: '#0D2642', eje: '#35679A', borde: '#7FD8CF', bordeS: '#47AFA4',
  cian: '#17C3B2', cianS: '#0A8A7E', cianB: '#E9FFFC', metal: '#B9C8D8', metalS: '#8197AF', metalL: '#E1E9F1',
  motor: '#35679A', motorS: '#1F4673', cuello: '#17446F', cuelloS: '#0E2A47', led: '#24507E', estela: '#DDF4F1'
};
const LED = { idle: '#17C3B2', error: '#FF4D6D', success: '#4ADE80' };          // los LED: cian, rojo y verde (nunca coral)
const BLANCOS = { '#17C3B2': '#E9FFFC', '#FF4D6D': '#FFE3E8', '#4ADE80': '#E6FFEE' };

// ── La cara de LED: 12 columnas por 10 filas en el cuadrante del gráfico del isotipo ──
const VID = { x: 300, y: 234, a: 132, b: 110 };
const IX = (u) => VID.x - VID.a + ((u - 4) / 92) * VID.a * 2;
const IY = (v) => VID.y - VID.b + ((v - 4) / 92) * VID.b * 2;
const OJOS = {                                     // ancho 2: columnas 2 y 8; ancho 3: columnas 1 y 8
  abierto: ['wo', 'oo', 'oo'], cerrado: ['..', '..', 'oo'], feliz: ['.o.', 'o.o', '...'], grande: ['woo', 'ooo', 'ooo'],
  enojadoI: ['o..', '.oo', '.oo'], enojadoD: ['..o', 'oo.', 'oo.'], mayor: ['o..', '.oo', 'o..'], menor: ['..o', 'oo.', '..o']
};
const BOCAS = {                                    // filas 5 a 9
  media: ['..........o.', '.o.......oo.', '.ooooooooo..', '..ooooooo...', '...oooo.....'],
  grande: ['............', '.o........o.', '.oo......oo.', '..oooooooo..', '...oooooo...'],
  recta: ['............', '............', '....oooo....', '............', '............'],
  chica: ['............', '............', '.....oo.....', '.....oo.....', '............'],
  triste: ['............', '............', '...oooooo...', '..o......o..', '.o........o.'],
  puntos1: ['............', '............', '...o........', '............', '............'],
  puntos2: ['............', '............', '...o..o.....', '............', '............'],
  puntos3: ['............', '............', '...o..o..o..', '............', '............']
};
function armarCara(izq, der, boca, dx = 0, dy = 0) {
  const g = Array.from({ length: 10 }, () => Array(12).fill('.'));
  const estampar = (forma, fila, col) => forma.forEach((linea, f) => [...linea].forEach((ch, k) => {
    const r = fila + f, c = col + k;
    if (ch !== '.' && r >= 0 && r < 10 && c >= 0 && c < 12) g[r][c] = ch;
  }));
  estampar(BOCAS[boca], 5, 0);
  estampar(OJOS[izq], 1 + dy, (OJOS[izq][0].length === 3 ? 1 : 2) + dx);
  estampar(OJOS[der], 1 + dy, 8 + dx);
  return g;
}

function pantallaLed() {
  const k = 2, { c, ctx, tex } = lienzo(VID.a * 2 * k, VID.b * 2 * k);
  const camino = () => {
    ctx.beginPath();
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2, co = Math.cos(t), si = Math.sin(t);
      const x = VID.x + VID.a * Math.sign(co) * Math.abs(co) ** (2 / 4.4), y = VID.y + VID.b * Math.sign(si) * Math.abs(si) ** (2 / 4.4);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  };
  let ultima = '';
  function dibujar(grilla, color) {
    const clave = color + grilla.map((f) => f.join('')).join('');
    if (clave === ultima) return;
    ultima = clave;
    ctx.setTransform(k, 0, 0, k, -k * (VID.x - VID.a), -k * (VID.y - VID.b));
    ctx.clearRect(VID.x - VID.a, VID.y - VID.b, VID.a * 2, VID.b * 2);
    ctx.save();
    camino(); ctx.clip();
    ctx.fillStyle = C.azul; ctx.fillRect(VID.x - VID.a, VID.y - VID.b, VID.a * 2, VID.b * 2);
    // La diagonal del degradado del isotipo, en una sombra dura
    ctx.fillStyle = C.azulS; ctx.beginPath();
    ctx.moveTo(VID.x + VID.a * 0.9, VID.y - VID.b - 10); ctx.lineTo(VID.x + VID.a + 20, VID.y - VID.b - 10);
    ctx.lineTo(VID.x + VID.a + 20, VID.y + VID.b + 20); ctx.lineTo(VID.x - VID.a * 0.6, VID.y + VID.b + 20); ctx.fill();
    // Los ejes en L del isotipo
    ctx.strokeStyle = C.eje; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(IX(27), IY(23)); ctx.lineTo(IX(27), IY(75)); ctx.lineTo(IX(80), IY(75)); ctx.stroke();
    // La matriz de LED
    const x0 = IX(27) + 9, x1 = IX(80) + 4, y0 = IY(23) - 4, y1 = IY(75) - 10;
    const px = (x1 - x0) / 12, py = (y1 - y0) / 10, lado = Math.min(px, py) * 0.8;
    const celda = (f, col) => { const x = x0 + col * px + (px - lado) / 2, y = y0 + f * py + (py - lado) / 2; ctx.beginPath(); ctx.roundRect(x, y, lado, lado, 2.6); };
    ctx.fillStyle = C.led; ctx.globalAlpha = 0.55;
    grilla.forEach((fila, f) => fila.forEach((ch, col) => { if (ch === '.') { celda(f, col); ctx.fill(); } }));
    ctx.globalAlpha = 1;
    ctx.shadowColor = color; ctx.shadowBlur = 9; ctx.fillStyle = color;
    for (let vez = 0; vez < 2; vez++) grilla.forEach((fila, f) => fila.forEach((ch, col) => { if (ch !== '.') { celda(f, col); ctx.fill(); } }));
    ctx.shadowBlur = 0; ctx.fillStyle = BLANCOS[color] ?? '#FFFFFF';
    grilla.forEach((fila, f) => fila.forEach((ch, col) => { if (ch === 'w') { celda(f, col); ctx.fill(); } }));
    // El reflejo del vidrio
    ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.beginPath();
    ctx.moveTo(VID.x - VID.a - 10, VID.y - 30); ctx.lineTo(VID.x - 30, VID.y - VID.b - 10); ctx.lineTo(VID.x - 4, VID.y - VID.b - 10); ctx.lineTo(VID.x - VID.a - 10, VID.y + 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.beginPath();
    ctx.moveTo(VID.x - VID.a - 10, VID.y + 22); ctx.lineTo(VID.x + 14, VID.y - VID.b - 10); ctx.lineTo(VID.x + 30, VID.y - VID.b - 10); ctx.lineTo(VID.x - VID.a - 10, VID.y + 42); ctx.fill();
    ctx.restore();
    // La tinta del borde del vidrio y su brillo
    camino(); ctx.strokeStyle = TINTA; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4.4; ctx.beginPath();
    ctx.moveTo(VID.x - VID.a + 20, VID.y - VID.b + 44); ctx.quadraticCurveTo(VID.x - VID.a + 26, VID.y - VID.b + 18, VID.x - VID.a + 56, VID.y - VID.b + 10); ctx.stroke();
    tex.needsUpdate = true;
  }
  const malla = new THREE.Mesh(caraPlana(squircle(VID.a / 100, VID.b / 100)), new THREE.MeshBasicMaterial({ map: tex }));
  return { malla, dibujar };
}

// ── Una mano flotante: guante de tres dedos y pulgar, con su puño cian ──
function mano(tipo) {
  const g = new THREE.Group(), blanco = pintura(C.carcasa, C.carcasaS), cian = pintura(C.cian, C.cianS);
  const dedos = tipo === 'hola' ? [[-0.15, 0.13, -26, 0.36], [0, 0.17, -3, 0.4], [0.15, 0.13, 20, 0.36]] : [[-0.14, 0.15, -8, 0.38], [0, 0.18, 0, 0.42], [0.14, 0.15, 8, 0.38]];
  for (const [x, y, ang, largo] of dedos) {
    const a = grados(ang);
    g.add(barra([x, y, 0], [x + Math.sin(a) * largo, y + Math.cos(a) * largo, 0], 0.085, blanco, 0.035));
  }
  if (tipo === 'hola') g.add(barra([-0.18, -0.02, 0], [-0.44, 0.2, 0], 0.08, blanco, 0.035));
  else g.add(barra([-0.2, -0.02, 0.12], [0.1, 0.02, 0.15], 0.07, blanco, 0.03));
  g.add(elipsoide(0.3, 0.27, 0.17, blanco, 0.04));
  const puno = cilindro(0.21, 0.19, 0.14, cian, 0.035); puno.position.y = -0.3; g.add(puno);
  return g;
}

// Dónde van las manos en cada estado: x, y, z y el giro
const MANOS = {
  idle: { L: [-2.2, 0.35, 0.5, 0.28], R: [2.35, -0.4, 0.5, -0.1] },
  typing: { L: [-0.95, -1.2, 1.4, 0.15], R: [0.95, -1.2, 1.4, -0.15] },
  shy: { L: [-0.52, 0.62, 1.45, 0.12], R: [0.52, 0.62, 1.45, -0.12] },
  error: { L: [-2.05, 1.0, 0.6, 0.55], R: [2.05, 1.0, 0.6, -0.55] },
  success: { L: [-2.05, 1.6, 0.5, 0.35], R: [2.05, 1.6, 0.5, -0.35] },
  thinking: { L: [-2.2, 0.25, 0.5, 0.28], R: [0.85, -0.95, 1.25, 0.55] }
};

export function plotty() {
  const raiz = new THREE.Group(), flota = new THREE.Group(), bot = new THREE.Group();
  raiz.add(flota); flota.add(bot);
  const blanco = pintura(C.carcasa, C.carcasaS), metal = pintura(C.metal, C.metalS), metalL = pintura(C.metalL, C.metal);
  const cian = pintura(C.cian, C.cianS, { umbral: 0.25 });

  // La cabeza: la carcasa blanca, el borde cian del isotipo y la pantalla
  const PROF = 1.2, frente = PROF / 2;
  const carcasa = losa(1.7, 1.42, PROF, blanco, { w: 0.055, bisel: 0.12 }); carcasa.position.y = Y(240); bot.add(carcasa);
  const borde = losa(1.43, 1.21, 0.08, pintura(C.borde, C.bordeS), { w: 0.04, bisel: 0.03 }); borde.position.set(0, Y(VID.y), frente + 0.02); bot.add(borde);
  const led = pantallaLed(); led.malla.position.set(0, Y(VID.y), frente + 0.075); bot.add(led.malla);
  // Tornillos en las esquinas, la luz de encendido y la rejilla del costado
  for (const [x, y] of [[-1.33, 1.67], [1.33, 1.67], [-1.33, -0.47], [1.33, -0.47]]) {
    const t = cilindro(0.06, 0.06, 0.04, metal, 0.02, 20); t.rotation.x = Math.PI / 2; t.position.set(x, y, frente + 0.01); bot.add(t);
    const ranura = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.016, 0.01), basico(TINTA)); ranura.rotation.z = 0.5; ranura.position.set(x, y, frente + 0.04); bot.add(ranura);
  }
  const encendido = cilindro(0.055, 0.055, 0.04, cian, 0.02, 20); encendido.rotation.x = Math.PI / 2; encendido.position.set(0.92, -0.66, frente + 0.01); bot.add(encendido);
  for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.03, 0.55), basico(TINTA)); r.position.set(1.701, 0.88 - i * 0.15, 0); bot.add(r); }

  // Los rotores (el «Bi»): brazo, motor y la hélice de dos palas con su estela
  const helices = [];
  for (const s of [-1, 1]) {
    bot.add(barra([s * 1.22, 1.6, -0.15], [s * 1.86, 2.05, -0.15], 0.1, metal, 0.04));
    const motor = cilindro(0.24, 0.22, 0.34, pintura(C.motor, C.motorS), 0.045); motor.position.set(s * 1.9, 2.03, -0.15); bot.add(motor);
    const tapa = cilindro(0.24, 0.24, 0.05, metalL, 0.035); tapa.position.set(s * 1.9, 2.22, -0.15); bot.add(tapa);
    const eje = cilindro(0.05, 0.05, 0.14, metal, 0.025, 16); eje.position.set(s * 1.9, 2.3, -0.15); bot.add(eje);
    const helice = new THREE.Group(); helice.position.set(s * 1.9, 2.37, -0.15);
    for (const lado of [-1, 1]) { const p = elipsoide(0.42, 0.028, 0.085, metal, 0.03); p.position.x = lado * 0.44; p.rotation.x = lado * 0.32; helice.add(p); }
    helice.add(esfera(0.08, metalL, 0.03));
    const estela = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), basico(C.estela, { transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }));
    estela.rotation.x = -Math.PI / 2; estela.position.set(s * 1.9, 2.36, -0.15); bot.add(estela);
    bot.add(helice); helices.push(helice);
  }

  // La antena: sale de la carcasa y termina en el punto del logo, en cian
  const domo = elipsoide(0.18, 0.12, 0.18, metal, 0.035); domo.position.set(X(336), Y(98), 0); bot.add(domo);
  bot.add(tubo([[X(336), Y(98) + 0.05, 0], [X(338), 2.28, 0], [X(350) - 0.02, Y(44) - 0.14, 0]], 0.035, metal, 0.03));
  const punto = new THREE.Group(); punto.position.set(X(350), Y(44), 0); bot.add(punto);
  punto.add(esfera(0.17, cian, 0.045));
  const reflejo = esfera(0.05, basico(C.cianB), 0); reflejo.position.set(-0.06, 0.06, 0.13); punto.add(reflejo);
  const haloAntena = brillo(C.cian, 1.0, 0.5); punto.add(haloAntena);

  // El cuello de fuelle, la barriga con el 0 y la tobera con la llama de plasma
  for (let i = 0; i < 3; i++) {
    const f = cilindro(0.35 - i * 0.02, 0.35 - i * 0.02, 0.17, pintura(C.cuello, C.cuelloS), 0.04);
    f.position.y = Y(373 + i * 14); bot.add(f);
  }
  const barriga = elipsoide(0.8, 0.52, 0.6, blanco, 0.055); barriga.position.y = Y(464); bot.add(barriga);
  const cero = toro(0.15, 0.045, cian, 0.03); cero.scale.y = 1.45; cero.rotation.z = grados(-3); cero.position.set(-0.03, Y(464), 0.585); bot.add(cero);
  const tobera = cilindro(0.24, 0.19, 0.2, pintura(C.cuello, C.cuelloS), 0.04); tobera.position.y = Y(524); bot.add(tobera);
  const labio = cilindro(0.23, 0.23, 0.07, metal, 0.035); labio.position.y = Y(537); bot.add(labio);
  const llama = new THREE.Group(); llama.position.y = Y(541); bot.add(llama);
  const fuego = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.46, 24), basico(C.cian)); fuego.rotation.x = Math.PI; fuego.position.y = -0.23; llama.add(fuego);
  const nucleo = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 20), basico(C.cianB)); nucleo.rotation.x = Math.PI; nucleo.position.set(0, -0.15, 0.02); llama.add(nucleo);
  const haloLlama = brillo(C.cian, 1.3, 0.55); haloLlama.position.y = -0.2; llama.add(haloLlama);
  const chorro = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.62, 0.5, 40, 1, true), basico(C.cian, { transparent: true, opacity: 0.16, depthWrite: false }));
  chorro.position.y = Y(574); raiz.add(chorro);
  const sombra = sombraSuelo(1.1, TINTA, 0.32); sombra.position.y = -3.0; sombra.scale.set(1, 1, 0.16); raiz.add(sombra);
  const reflejoSuelo = sombraSuelo(0.7, C.cian, 0.22); reflejoSuelo.position.y = -2.99; reflejoSuelo.scale.set(1, 1, 0.16); raiz.add(reflejoSuelo);

  // Las manos
  const manos = { L: mano('hola'), R: mano('tres') };
  for (const [lado, m] of Object.entries(manos)) {
    const [x, y, z, r] = MANOS.idle[lado]; m.position.set(x, y, z); m.rotation.z = r; flota.add(m);
  }

  // ── El estado ──
  let parpadeo = 2.5, cierra = 0, espia = 3, espiando = 0;
  const giro = { y: 0, x: 0 };
  function cara(estado, desde, t, mirar) {
    const dx = Math.round(limitar(mirar.x * 1.6, -1, 1)), dy = Math.round(limitar(mirar.y * 1.6, -1, 1));
    const cerrado = cierra > 0;
    switch (estado) {
      case 'error': return [armarCara('enojadoI', 'enojadoD', 'triste'), LED.error];
      case 'success': {
        const guino = desde > 1.2 && desde < 1.55;
        return [armarCara('feliz', guino ? 'cerrado' : 'feliz', 'grande'), LED.success];
      }
      case 'shy': return [armarCara(espiando > 0 ? 'abierto' : 'mayor', 'menor', 'chica', espiando > 0 ? 1 : 0, espiando > 0 ? 1 : 0), LED.idle];
      case 'typing': return [armarCara(cerrado ? 'cerrado' : 'abierto', cerrado ? 'cerrado' : 'abierto', 'recta', dx, 1), LED.idle];
      case 'thinking': return [armarCara(cerrado ? 'cerrado' : 'abierto', cerrado ? 'cerrado' : 'abierto', `puntos${1 + (Math.floor(t * 2.6) % 3)}`, 1, -1), LED.idle];
      default: return [armarCara(cerrado ? 'cerrado' : 'abierto', cerrado ? 'cerrado' : 'abierto', 'media', dx, dy), LED.idle];
    }
  }

  function actualizar(t, dt, { estado, desde, mirar, quieto }) {
    const e = MANOS[estado] ? estado : 'idle';
    // Parpadeo (y, en la contraseña, una espiadita cada tanto)
    parpadeo -= dt; if (parpadeo <= 0) { cierra = 0.14; parpadeo = 2.8 + Math.random() * 2.2; }
    if (cierra > 0) cierra -= dt;
    if (estado === 'shy') { espia -= dt; if (espia <= 0) { espiando = 0.7; espia = 2.6 + Math.random() * 1.6; } } else espia = 2;
    if (espiando > 0) espiando -= dt;
    const [grilla, color] = cara(estado, desde, t, mirar);
    led.dibujar(grilla, color);

    // Mira hacia el cursor (o el campo); en la contraseña baja la cabeza
    const metaY = estado === 'shy' ? -0.12 : mirar.x * 0.5, metaX = estado === 'shy' ? 0.16 : mirar.y * 0.24;
    giro.y = acercar(giro.y, metaY, dt, 6); giro.x = acercar(giro.x, metaX, dt, 6);
    bot.rotation.set(giro.x, giro.y, grados(-5));
    const vaiven = quieto ? 0 : Math.sin(t * 1.7) * 0.07;
    let sacudida = 0;
    if (estado === 'error' && !quieto) sacudida = Math.sin(desde * 46) * 0.08 * Math.max(0, 1 - desde / 0.5);
    flota.position.set(sacudida, vaiven, 0);
    sombra.scale.set(1 - vaiven * 0.6, 1, 0.16 * (1 - vaiven * 0.6));

    // Rotores, llama y antena
    if (!quieto) for (const h of helices) h.rotation.y += dt * (estado === 'success' ? 24 : 12);
    const llamita = quieto ? 1 : 1 + Math.sin(t * 23) * 0.08 + Math.sin(t * 37) * 0.05;
    llama.scale.set(1, llamita * (estado === 'success' ? 1.25 : 1), 1);
    const pulso = estado === 'thinking' && !quieto ? 1 + Math.sin(t * 6) * 0.12 : 1;
    punto.scale.setScalar(pulso); haloAntena.material.opacity = estado === 'thinking' ? 0.75 : 0.5;

    // Las manos van a su lugar; saludan, teclean o tapan la pantalla
    for (const lado of ['L', 'R']) {
      const m = manos[lado];
      let [x, y, z, r] = MANOS[e][lado];
      const fase = lado === 'L' ? 0 : 1.7;
      if (!quieto) {
        y += Math.sin(t * 1.7 + fase) * 0.08;
        if (e === 'typing') y += Math.max(0, Math.sin(t * 13 + fase * 2)) * 0.08;
        if (e === 'success' || (e === 'idle' && lado === 'L')) r += Math.sin(t * (e === 'success' ? 9 : 3.2) + fase) * (e === 'success' ? 0.35 : 0.12);
        if (e === 'error') x += Math.sin(t * 30 + fase) * 0.03;
      }
      if (e === 'shy' && lado === 'L' && espiando > 0) { x -= 0.5; y -= 0.1; }
      m.position.set(acercar(m.position.x, x, dt, 7), acercar(m.position.y, y, dt, 7), acercar(m.position.z, z, dt, 7));
      m.rotation.z = acercar(m.rotation.z, r, dt, 7);
    }
  }

  return {
    grupo: raiz, colores: COLORES, marco: { centro: -0.14, tam: 6.25 },
    estados: ['idle', 'typing', 'error', 'success', 'shy', 'thinking', 'look-left', 'look-right', 'look-up', 'look-down'],
    duracion: { error: 1900, success: 2600 },
    actualizar: (t, dt, ctx) => actualizar(t, dt, { ...ctx, estado: ctx.estado.startsWith('look-') ? 'idle' : ctx.estado })
  };
}
