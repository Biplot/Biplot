// Atlas en 3D, calcado de su dibujo de la banda (oficina/_herramientas/dibujos/banda/atlas.mjs): el orbe de vidrio con
// el globo de líneas y el corazón de plasma adentro, el visor oscuro con dos ojos de lente de párpado pesado, los dos
// anillos en órbita (el grande lleva los satélites y gira) y la placa 360° que cuelga del anillo de abajo.
// Los ojos se dibujan en un lienzo: el párpado y la mirada cambian con cada estado y siguen al cursor.
import {
  THREE, X, Y, grados, pintura, basico, esfera, elipsoide, toro, losa, squircle, caraPlana, lienzo, brillo, sombraSuelo,
  acercar, limitar, azar, TINTA
} from './kit3d.js';

export const COLORES = { cuerpo: '#174b73', ojos: '#7fd8cf' };
const C = {
  vidrio: '#174B73', vidrioS: '#0C2B48', borde: '#7FD8CF', linea: '#7FD8CF', cian: '#17C3B2', cianS: '#0A8A7E',
  plasmaL: '#BDF5EE', plasmaB: '#F2FFFD', visor: '#0A1B2E', visorL: '#1B3556', lente: '#0C3A44', parpado: '#13294A',
  anillo: '#B9C8D8', anilloS: '#7F93A8', anilloL: '#E1E9F1', sat: '#35679A', satS: '#1F4673', placa: '#F2F4F7', placaS: '#C4D2E0', azul: '#0E2A47'
};
const IRIS = { idle: '#17C3B2', error: '#FF4D6D', success: '#4ADE80' };          // nunca coral
// Lo que sabe hacer; error y success corren una vez y avisan al terminar
export const ESTADOS = ['idle', 'typing', 'error', 'success', 'shy', 'thinking', 'look-left', 'look-right', 'look-up', 'look-down'];
export const DURACION = { error: 1900, success: 2600 };
const R = 1.64, CENTRO = Y(292);                                                  // el orbe
const G = { y: Y(338), r: 1.08 };                                                 // el globo de líneas y el plasma

// ── Un ojo de lente: el bisel en 3D y, en un lienzo, la lente, el iris, la pupila y el párpado mecánico ──
function ojo() {
  const { ctx, tex } = lienzo(160, 160), r = 78;
  let ultimo = '';
  function dibujar({ mx, my, izq, der, curva, iris }) {
    const clave = [mx, my, izq, der, curva].map((v) => v.toFixed(3)).join() + iris;
    if (clave === ultimo) return;
    ultimo = clave;
    ctx.clearRect(0, 0, 160, 160);
    ctx.save();
    ctx.beginPath(); ctx.arc(80, 80, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = C.lente; ctx.fillRect(0, 0, 160, 160);
    const px = 80 + r * mx, py = 80 + r * my;
    ctx.shadowColor = iris; ctx.shadowBlur = 22; ctx.fillStyle = iris;
    ctx.beginPath(); ctx.arc(px, py, r * 0.56, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(px, py, r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.plasmaB; ctx.beginPath(); ctx.arc(px, py, r * 0.2, 0, Math.PI * 2); ctx.fill();
    // El párpado: tapa desde arriba hasta su borde, apenas inclinado
    const yI = 80 + r * izq, yD = 80 + r * der, yC = 80 + r * curva;
    ctx.fillStyle = C.parpado; ctx.beginPath();
    ctx.moveTo(-10, -10); ctx.lineTo(170, -10); ctx.lineTo(170, yD); ctx.quadraticCurveTo(80, yC, -10, yI); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = TINTA; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(-10, yI); ctx.quadraticCurveTo(80, yC, 170, yD); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = TINTA; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(80, 80, r - 2, 0, Math.PI * 2); ctx.stroke();
    tex.needsUpdate = true;
  }
  const g = new THREE.Group();
  const lente = new THREE.Mesh(new THREE.CircleGeometry(0.25, 48), new THREE.MeshBasicMaterial({ map: tex })); lente.position.z = 0.012; g.add(lente);
  g.add(toro(0.28, 0.05, pintura(C.anilloS, '#5E7189'), 0.03));
  return { g, dibujar };
}

// Cómo van los párpados en cada estado: borde izquierdo, derecho y el centro (en radios; negativo es arriba)
const PARPADOS = {
  idle: [-0.16, -0.26, -0.08], typing: [0, -0.08, 0.06], shy: [1.15, 1.15, 1.15], success: [-0.85, -0.85, -0.78],
  thinking: [-0.45, -0.5, -0.38], cerrado: [1.15, 1.15, 1.15]
};
const ENOJO = [[-0.62, 0.06, -0.16], [0.06, -0.62, -0.16]];       // el borde de adentro baja: ceño

export function atlas() {
  const raiz = new THREE.Group(), flota = new THREE.Group(), orbe = new THREE.Group();
  raiz.add(flota); flota.add(orbe);
  orbe.position.y = CENTRO;

  // El vidrio: el contorno y el vidrio de adelante (transparente), la pared de atrás y lo de adentro
  const vidrio = esfera(R, pintura(C.vidrio, C.vidrioS, { opacidad: 0.55, fresnel: 0.95, borde: C.borde, umbral: 0.05 }), 0.055);
  vidrio.children[1].renderOrder = 1; orbe.add(vidrio);
  orbe.add(new THREE.Mesh(new THREE.SphereGeometry(R - 0.004, 48, 32), basico('#0B2945', { side: THREE.BackSide })));

  // El globo de líneas, inclinado sobre su eje, que gira despacio
  const globo = new THREE.Group(); globo.position.y = G.y - CENTRO; globo.rotation.set(grados(16), 0, grados(-18)); orbe.add(globo);
  const gira = new THREE.Group(); globo.add(gira);
  const linea = basico(C.linea, { transparent: true, opacity: 0.8, depthWrite: false });
  for (const lat of [-60, -30, 0, 30, 60]) {
    const p = new THREE.Mesh(new THREE.TorusGeometry(G.r * Math.cos(grados(lat)), 0.012, 6, 96), linea);
    p.rotation.x = Math.PI / 2; p.position.y = G.r * Math.sin(grados(lat)); gira.add(p);
  }
  for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(new THREE.TorusGeometry(G.r, 0.012, 6, 96), linea); m.rotation.y = grados(k * 30); gira.add(m); }
  for (const s of [-1, 1]) { const polo = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), linea); polo.position.y = s * G.r; gira.add(polo); }

  // El corazón de plasma: el núcleo, los halos y los filamentos que buscan el vidrio
  const plasma = new THREE.Group(); plasma.position.y = G.y - CENTRO; orbe.add(plasma);
  const colorPlasma = new THREE.Color(C.cian);
  const haloGrande = brillo(C.cian, 3.6, 0.32), halo = brillo(C.cian, 1.9, 0.75);
  const estrella = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), basico(C.cian, { transparent: true }));
  const blanco = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 14), basico(C.plasmaB, { transparent: true }));
  const nucleo = new THREE.Group(); nucleo.add(haloGrande, halo, estrella, blanco); plasma.add(nucleo);
  const filamentos = new THREE.Group(); plasma.add(filamentos);
  const matFilo = basico(C.plasmaL, { transparent: true }), matBrillo = basico(C.cian, { transparent: true, opacity: 0.45, depthWrite: false });
  const matPunta = basico(C.cian, { transparent: true }), matPuntaB = basico(C.plasmaB, { transparent: true });
  const ANGULOS = [200, 238, 292, 322, 12, 52, 96, 140];
  const centroPlasma = new THREE.Vector3(0, G.y - CENTRO, 0);
  function rayos(semilla) {
    for (const h of [...filamentos.children]) { h.geometry.dispose(); filamentos.remove(h); }
    ANGULOS.forEach((ang, i) => {
      const a0 = grados(-ang), z0 = 0.35 + azar(semilla * 7 + i) * 0.5;
      const dir = new THREE.Vector3(Math.cos(a0), Math.sin(a0), z0).normalize();
      // Hasta dónde llega: el vidrio por dentro, desde el centro del plasma
      const b = centroPlasma.dot(dir), c = centroPlasma.lengthSq() - (R - 0.07) ** 2, largo = -b + Math.sqrt(b * b - c);
      const pts = [];
      let a = a0, z = z0;
      for (let k = 0; k <= 8; k++) {
        const d = 0.22 + ((largo - 0.22) * k) / 8;
        if (k > 0 && k < 8) { a += (azar(semilla * 13 + i * 9 + k) - 0.5) * 0.36; z += (azar(semilla * 5 + i * 3 + k) - 0.5) * 0.2; }
        const v = new THREE.Vector3(Math.cos(a), Math.sin(a), z).normalize().multiplyScalar(d);
        pts.push(k === 8 ? dir.clone().multiplyScalar(largo) : v);
      }
      const curva = new THREE.CatmullRomCurve3(pts);
      filamentos.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 24, 0.035, 6), matBrillo));
      filamentos.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 24, 0.012, 6), matFilo));
      const fin = pts[8];
      const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), matPunta); p1.position.copy(fin); filamentos.add(p1);
      const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), matPuntaB); p2.position.copy(fin).multiplyScalar(0.99); filamentos.add(p2);
    });
  }
  rayos(1);
  // Lo de adentro va después del vidrio (que no escribe profundidad): se ve encima, brillante
  const adentro = () => { for (const g of [gira, plasma]) g.traverse((o) => { if (o.isMesh || o.isSprite) o.renderOrder = 2; }); };
  adentro();

  // El visor: envuelve el orbe, oscuro, con la parte de arriba un poco más clara; los remaches de las bisagras
  const visor = elipsoide(1.62, 0.47, 1.72, pintura(C.visorL, C.visor, { umbral: 0.42 }), 0.05); visor.position.y = Y(231) - CENTRO; orbe.add(visor);
  for (const s of [-1, 1]) { const rem = esfera(0.055, pintura(C.anillo, C.anilloS), 0.025); rem.position.set(s * 1.44, Y(250) - CENTRO, 0.4); orbe.add(rem); }
  const ojos = [ojo(), ojo()];
  [-0.48, 0.48].forEach((x, i) => {
    const z = 1.72 * Math.sqrt(1 - (x / 1.62) ** 2);
    ojos[i].g.position.set(x, Y(234) - CENTRO, z + 0.012);
    ojos[i].g.rotation.y = Math.atan2(x / 1.62 ** 2, z / 1.72 ** 2);
    orbe.add(ojos[i].g);
  });

  // Los anillos: un tubo de metal; el grande lleva los satélites y gira con ellos
  const metal = pintura(C.anillo, C.anilloS);
  function anillo(Rad, tubo, inclinacion, giro, alto) {
    const ladeo = new THREE.Group(); ladeo.rotation.z = grados(giro); ladeo.position.y = alto - CENTRO;
    const plano = new THREE.Group(); plano.rotation.x = Math.PI / 2 + grados(inclinacion); ladeo.add(plano);   // se ve desde arriba: el frente pasa abajo
    const vuelta = new THREE.Group(); plano.add(vuelta);
    vuelta.add(toro(Rad, tubo, metal, 0.04));
    orbe.add(ladeo);
    return { ladeo, plano, vuelta };
  }
  const grande = anillo(2.64, 0.085, 10, -9, Y(326));
  for (const s of [-1, 1]) {
    const sat = new THREE.Group(); sat.position.x = s * 2.64; grande.vuelta.add(sat);
    sat.add(esfera(0.2, pintura(C.sat, C.satS), 0.045));
    const luz = esfera(0.08, basico(C.cian), 0.025); luz.position.set(s * 0.1, 0, 0.14); sat.add(luz);
    sat.add(brillo(C.cian, 0.55, 0.35));
  }
  const chico = anillo(2.14, 0.05, 28.5, 12, Y(316));

  // La placa 360°, colgando del punto más bajo del anillo chico
  orbe.updateMatrixWorld(true);
  let gancho = null;
  for (let i = 0; i < 180; i++) {
    const a = (i / 180) * Math.PI * 2, p = new THREE.Vector3(Math.cos(a) * 2.14, Math.sin(a) * 2.14, 0);
    chico.plano.localToWorld(p); orbe.worldToLocal(p);
    if (p.z > 0.5 && (!gancho || p.y < gancho.y)) gancho = p;
  }
  const colgante = new THREE.Group(); colgante.position.copy(gancho); orbe.add(colgante);
  const argolla = toro(0.075, 0.022, metal, 0.02); argolla.position.y = -0.08; colgante.add(argolla);
  const placa = new THREE.Group(); placa.position.y = -0.36; colgante.add(placa);
  placa.add(losa(0.48, 0.22, 0.07, pintura(C.placa, C.placaS), { w: 0.04, n: 10, bisel: 0.02 }));
  const etiqueta = lienzo(384, 176);
  const escribirPlaca = () => {
    const { ctx, tex } = etiqueta;
    ctx.clearRect(0, 0, 384, 176); ctx.fillStyle = C.placa; ctx.fillRect(0, 0, 384, 176);
    ctx.fillStyle = C.placaS; ctx.beginPath(); ctx.moveTo(300, 0); ctx.lineTo(384, 0); ctx.lineTo(384, 176); ctx.lineTo(320, 176); ctx.fill();
    ctx.fillStyle = TINTA; ctx.beginPath(); ctx.arc(192, 26, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.azul; ctx.font = '108px "Alfa Slab One", "Rockwell", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('360°', 192, 150);
    tex.needsUpdate = true;
  };
  escribirPlaca();
  document.fonts?.load('108px "Alfa Slab One"').then(escribirPlaca).catch(() => {});
  const frente = new THREE.Mesh(caraPlana(squircle(0.47, 0.21, 10)), new THREE.MeshBasicMaterial({ map: etiqueta.tex })); frente.position.z = 0.037; placa.add(frente);

  // El reflejo del vidrio (no gira con el orbe: es de la luz) y la sombra en el suelo
  const media = new THREE.Shape(), a1 = grados(196), a2 = grados(262), ri = R - 0.14, re = R - 0.36;
  media.moveTo(Math.cos(a1) * ri, -Math.sin(a1) * ri);
  media.absarc(0, 0, ri, -a1, -a2, true);
  media.quadraticCurveTo(Math.cos(grados(232)) * re, -Math.sin(grados(232)) * re, Math.cos(a1) * ri, -Math.sin(a1) * ri);
  const geoReflejo = new THREE.ShapeGeometry(media, 24), pos = geoReflejo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sqrt(Math.max(0, (R + 0.012) ** 2 - pos.getX(i) ** 2 - pos.getY(i) ** 2)));
  const reflejo = new THREE.Mesh(geoReflejo, basico('#FFFFFF', { transparent: true, opacity: 0.85 })); reflejo.position.y = CENTRO; reflejo.renderOrder = 3; flota.add(reflejo);
  const sombra = sombraSuelo(1.12, TINTA, 0.4); sombra.position.y = Y(580); sombra.scale.set(1, 1, 0.12); raiz.add(sombra);
  const reflejoSuelo = sombraSuelo(0.72, C.cian, 0.24); reflejoSuelo.position.y = Y(580) + 0.01; reflejoSuelo.scale.set(1, 1, 0.12); raiz.add(reflejoSuelo);

  // ── El estado ──
  const p = { izq: [...PARPADOS.idle], der: [...PARPADOS.idle], mx: -0.3, my: 0.2, iris: new THREE.Color(IRIS.idle) };
  const giro = { y: 0, x: 0 };
  let parpadeo = 4.8, cierra = 0, espia = 3, espiando = 0, chispa = 0, semilla = 1, vuelta = 0;
  const color = new THREE.Color(), tmp = new THREE.Color();

  function actualizar(t, dt, { estado, desde, mirar, quieto }) {
    // Párpados: cada estado los pone a su altura; el parpadeo los cierra un momento
    parpadeo -= dt; if (parpadeo <= 0) { cierra = 0.2; parpadeo = 6.5 + Math.random() * 3; }
    if (cierra > 0) cierra -= dt;
    if (estado === 'shy') { espia -= dt; if (espia <= 0) { espiando = 0.8; espia = 2.8 + Math.random() * 1.6; } } else espia = 2.2;
    if (espiando > 0) espiando -= dt;
    let metaI = PARPADOS[estado] ?? PARPADOS.idle, metaD = metaI;
    if (estado === 'error') [metaI, metaD] = ENOJO;
    if (cierra > 0 && estado !== 'success' && estado !== 'error') metaI = metaD = PARPADOS.cerrado;
    if (estado === 'shy' && espiando > 0) metaD = [-0.02, -0.1, 0.02];
    const rapidez = cierra > 0 ? 30 : 12;
    for (let k = 0; k < 3; k++) { p.izq[k] = acercar(p.izq[k], metaI[k], dt, rapidez); p.der[k] = acercar(p.der[k], metaD[k], dt, rapidez); }
    // La mirada: de reojo y hacia el cursor; al escribir, hacia el formulario
    let mx = -0.3 + mirar.x * 0.42, my = 0.2 + mirar.y * 0.32;
    if (estado === 'typing') { mx = 0.3 + mirar.x * 0.1; my = 0.36; }
    else if (estado === 'thinking') { mx = 0.15; my = -0.42; }
    else if (estado === 'error' || estado === 'success') { mx = 0; my = 0; }
    else if (estado === 'shy') { mx = 0.35; my = 0.3; }
    const largo = Math.hypot(mx, my); if (largo > 0.42) { mx *= 0.42 / largo; my *= 0.42 / largo; }
    p.mx = acercar(p.mx, mx, dt, 9); p.my = acercar(p.my, my, dt, 9);
    p.iris.lerp(tmp.set(IRIS[estado] ?? IRIS.idle), 1 - Math.exp(-dt * 10));
    const iris = '#' + p.iris.getHexString();
    ojos[0].dibujar({ mx: p.mx, my: p.my, izq: p.izq[0], der: p.izq[1], curva: p.izq[2], iris });
    ojos[1].dibujar({ mx: p.mx, my: p.my, izq: p.der[0], der: p.der[1], curva: p.der[2], iris });

    // Gira hacia el cursor; en la contraseña se da vuelta y mira al suelo
    const metaY = estado === 'shy' ? -0.55 : mirar.x * 0.42, metaX = estado === 'shy' ? 0.2 : mirar.y * 0.2;
    giro.y = acercar(giro.y, metaY, dt, 5); giro.x = acercar(giro.x, metaX, dt, 5);
    orbe.rotation.set(giro.x, giro.y, 0);
    const vaiven = quieto ? 0 : Math.sin(t * 1.3) * 0.08;
    const sacudida = estado === 'error' && !quieto ? Math.sin(desde * 46) * 0.08 * Math.max(0, 1 - desde / 0.5) : 0;
    flota.position.set(sacudida, vaiven, 0);
    sombra.scale.set(1 - vaiven * 0.5, 1, 0.12 * (1 - vaiven * 0.5));

    // Anillo con satélites, globo, placa y plasma (rojo en el error, más fuerte en el éxito)
    const rapidezAnillo = { success: 2.6, thinking: 1.3, shy: 0.15 }[estado] ?? 0.35;
    if (!quieto) {
      vuelta += dt * rapidezAnillo; grande.vuelta.rotation.z = vuelta;
      gira.rotation.y += dt * 0.25;
      colgante.rotation.z = grados(-6) + Math.sin(t * 1.4) * grados(3);
      chispa -= dt; if (chispa <= 0) { rayos(++semilla); adentro(); chispa = estado === 'success' ? 0.06 : 0.12; }
    }
    color.lerp(tmp.set(estado === 'error' ? IRIS.error : estado === 'success' ? IRIS.success : C.cian), 1 - Math.exp(-dt * 8));
    for (const m of [estrella.material, matPunta, matBrillo, halo.material, haloGrande.material]) m.color.copy(color);
    const fuerza = estado === 'success' ? 1.35 : estado === 'thinking' && !quieto ? 1.1 + Math.sin(t * 5) * 0.1 : 1;
    nucleo.scale.setScalar(acercar(nucleo.scale.x, fuerza, dt, 6));
  }

  return {
    grupo: raiz, colores: COLORES, marco: { centro: -0.52, tam: 6.0 },
    estados: ESTADOS, duracion: DURACION,
    actualizar: (t, dt, ctx) => actualizar(t, dt, { ...ctx, estado: ctx.estado.startsWith('look-') ? 'idle' : ctx.estado })
  };
}
