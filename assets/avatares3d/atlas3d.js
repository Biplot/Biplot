// Atlas en 3D, calcado de su dibujo de la banda (oficina/_herramientas/dibujos/banda/atlas.mjs): el orbe de vidrio con
// el globo de líneas y el corazón de plasma adentro, el visor oscuro con dos ojos de lente de párpado pesado, los dos
// anillos en órbita (el grande lleva los satélites y gira) y la placa 360° que cuelga del anillo de abajo.
// Los ojos se dibujan en un lienzo: el párpado y la mirada cambian con cada estado y siguen al cursor.
// Además de los estados de Avatar Lab, las reacciones de Jarvis (propuestas/reacciones-atlas/): despertar, dormir,
// atento, escuchando, hablando, asentir, duda, buscando, leyendo, encontrado, esperando, alerta, alegre y celebrar.
// Escuchando y hablando laten con el nivel de la voz (de 0 a 1); sin nivel, con una voz simulada.
import {
  THREE, X, Y, grados, pintura, basico, esfera, elipsoide, toro, losa, squircle, caraPlana, lienzo, brillo, sombraSuelo,
  acercar, limitar, azar, TINTA
} from './kit3d.js';

export const COLORES = { cuerpo: '#174b73', ojos: '#7fd8cf' };
const C = {
  vidrio: '#174B73', vidrioS: '#0C2B48', borde: '#7FD8CF', linea: '#7FD8CF', cian: '#17C3B2', cianS: '#0A8A7E',
  plasmaL: '#BDF5EE', plasmaB: '#F2FFFD', visor: '#0A1B2E', visorL: '#1B3556', lente: '#0C3A44', parpado: '#13294A',
  anillo: '#B9C8D8', anilloS: '#7F93A8', anilloL: '#E1E9F1', sat: '#35679A', satS: '#1F4673', placa: '#F2F4F7', placaS: '#C4D2E0', azul: '#0E2A47',
  ambar: '#F5B83D', verde: '#4ADE80', rojo: '#FF4D6D'
};
// Nunca coral: el ámbar es para la alerta
const IRIS = { idle: C.cian, error: C.rojo, success: C.verde, celebrar: C.verde, alerta: C.ambar, encontrado: '#8FF7EA' };
// Lo que sabe hacer; los que tienen duración corren una vez y avisan al terminar
export const ESTADOS = [
  'idle', 'typing', 'error', 'success', 'shy', 'thinking', 'look-left', 'look-right', 'look-up', 'look-down',
  'despertar', 'dormir', 'atento', 'escuchando', 'hablando', 'asentir', 'duda', 'buscando', 'leyendo', 'encontrado',
  'esperando', 'alerta', 'alegre', 'celebrar'
];
export const DURACION = {
  error: 1900, success: 2600, despertar: 2800, atento: 700, asentir: 1000, duda: 2200, encontrado: 1100, alegre: 1500, celebrar: 2600
};
const R = 1.64, CENTRO = Y(292);                                                  // el orbe
const G = { y: Y(338), r: 1.08 };                                                 // el globo de líneas y el plasma

// ── Un ojo de lente: el bisel en 3D y, en un lienzo, la lente, el iris, la pupila y el párpado mecánico ──
function ojo() {
  const { ctx, tex } = lienzo(160, 160), r = 78;
  let ultimo = '';
  // pupila agranda o achica el iris (1 es su tamaño de siempre); abajo es el párpado de abajo: [borde, centro]
  function dibujar({ mx, my, izq, der, curva, iris, pupila = 1, abajo = [1.2, 1.2] }) {
    const clave = [mx, my, izq, der, curva, pupila, ...abajo].map((v) => v.toFixed(3)).join() + iris;
    if (clave === ultimo) return;
    ultimo = clave;
    ctx.clearRect(0, 0, 160, 160);
    ctx.save();
    ctx.beginPath(); ctx.arc(80, 80, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = C.lente; ctx.fillRect(0, 0, 160, 160);
    const px = 80 + r * mx, py = 80 + r * my;
    ctx.shadowColor = iris; ctx.shadowBlur = 22; ctx.fillStyle = iris;
    ctx.beginPath(); ctx.arc(px, py, r * 0.56 * pupila, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(px, py, r * 0.5 * pupila, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.plasmaB; ctx.beginPath(); ctx.arc(px, py, r * 0.2 * pupila, 0, Math.PI * 2); ctx.fill();
    // El párpado: tapa desde arriba hasta su borde, apenas inclinado
    const yI = 80 + r * izq, yD = 80 + r * der, yC = 80 + r * curva;
    ctx.fillStyle = C.parpado; ctx.beginPath();
    ctx.moveTo(-10, -10); ctx.lineTo(170, -10); ctx.lineTo(170, yD); ctx.quadraticCurveTo(80, yC, -10, yI); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = TINTA; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(-10, yI); ctx.quadraticCurveTo(80, yC, 170, yD); ctx.stroke();
    // El de abajo sube en arco: ojos que sonríen
    if (abajo[0] < 1.1) {
      const yB = 80 + r * abajo[0], yBC = 80 + r * abajo[1];
      ctx.fillStyle = C.parpado; ctx.beginPath();
      ctx.moveTo(-10, 170); ctx.lineTo(170, 170); ctx.lineTo(170, yB); ctx.quadraticCurveTo(80, yBC, -10, yB); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-10, yB); ctx.quadraticCurveTo(80, yBC, 170, yB); ctx.stroke();
    }
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
  thinking: [-0.45, -0.5, -0.38], cerrado: [1.15, 1.15, 1.15],
  ancho: [-0.9, -0.9, -0.86], atento: [-0.5, -0.54, -0.46], amable: [-0.34, -0.38, -0.5], enfocado: [-0.22, -0.26, -0.14],
  esperando: [-0.66, -0.7, -0.6], serio: [-0.16, -0.16, -0.1], somnoliento: [0.32, 0.28, 0.4],
  dormido: [0.55, 0.55, 0.75], feliz: [-0.8, -0.8, -0.86]          // dormido: se ve la línea del párpado cerrado
};
// El párpado de abajo: [borde, centro]; casi siempre escondido
const ABAJO = { feliz: [0.22, -0.62], serio: [0.62, 0.5], nada: [1.2, 1.2] };
const ENOJO = [[-0.62, 0.06, -0.16], [0.06, -0.62, -0.16]];       // el borde de adentro baja: ceño
const DUDA = [[-0.04, -0.12, 0.02], [-0.78, -0.82, -0.7]];         // un ojo entrecerrado y la otra «ceja» arriba

// Las curvas de los movimientos que corren una vez (d: segundos desde que empezó)
const rampa = (d, ini, dur) => { const x = limitar((d - ini) / dur, 0, 1); return x * x * (3 - 2 * x); };
const pulso = (d, ini, dur) => (d < ini || d > ini + dur ? 0 : Math.sin((Math.PI * (d - ini)) / dur));
const salto = (d, ini, dur) => { const x = (d - ini) / dur; return x < 0 || x > 1 ? 0 : 4 * x * (1 - x); };
// Una voz que no existe: sílabas con pausas entre frases, para cuando la página no le pasa el nivel de la voz
function vozSimulada(t) {
  if ((t % 3.1) / 3.1 > 0.82) return 0.04;
  const s = (t * 4.3) % 1;
  return (s < 0.62 ? Math.sin((Math.PI * s) / 0.62) : 0) * (0.55 + 0.45 * azar(Math.floor(t * 4.3)));
}

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
  const satelites = [];
  for (const s of [-1, 1]) {
    const sat = new THREE.Group(); sat.position.x = s * 2.64; grande.vuelta.add(sat);
    sat.add(esfera(0.2, pintura(C.sat, C.satS), 0.045));
    const luz = esfera(0.08, basico(C.cian), 0.025); luz.position.set(s * 0.1, 0, 0.14); sat.add(luz);
    const resplandor = brillo(C.cian, 0.55, 0.35); sat.add(resplandor);
    satelites.push({ luz: luz.children[1].material, resplandor });
  }
  const chico = anillo(2.14, 0.05, 28.5, 12, Y(316));

  // La banda del escáner: un aro de luz que recorre el orbe por dentro mientras busca en la bóveda
  const banda = new THREE.Group(); banda.visible = false; orbe.add(banda);
  const matBanda = basico(C.plasmaL, { transparent: true, opacity: 0, depthWrite: false });
  const matBandaB = basico(C.cian, { transparent: true, opacity: 0, depthWrite: false });
  for (const [grosor, mat] of [[0.022, matBanda], [0.09, matBandaB]]) {
    const aro = new THREE.Mesh(new THREE.TorusGeometry(1, grosor, 6, 120), mat);
    aro.rotation.x = Math.PI / 2; aro.renderOrder = 2; banda.add(aro);
  }

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
  const p = { izq: [...PARPADOS.idle], der: [...PARPADOS.idle], abajo: [...ABAJO.nada], mx: -0.3, my: 0.2, iris: new THREE.Color(IRIS.idle), pupila: 1 };
  const giro = { y: 0, x: 0 }, cuerpo = { y: 0, rx: 0, rz: 0 };
  let parpadeo = 4.8, cierra = 0, espia = 3, espiando = 0, chispa = 0, semilla = 1, vuelta = 0;
  let velAnillo = 0.35, velGlobo = 0.25, ladeoAnillo = 0, luz = 1, voz = 0, luzBanda = 0, brilloSat = 1;
  const color = new THREE.Color(), tmp = new THREE.Color(), colorSat = new THREE.Color(C.cian);
  const SIN_PARPADEO = ['success', 'error', 'dormir', 'despertar', 'alegre', 'celebrar'];

  // Los párpados de cada estado: [izquierdo, derecho]
  function parpados(estado, d) {
    const P = PARPADOS, par = (m) => [m, m];
    switch (estado) {
      case 'error': return ENOJO;
      case 'duda': return DUDA;
      case 'despertar': return par(d < 1.1 ? P.dormido : d > 1.7 && d < 1.85 ? P.cerrado : d < 1.7 ? P.ancho : P.atento);
      case 'dormir': return par(d < 1.6 ? P.somnoliento : P.dormido);
      case 'atento': case 'encontrado': return par(P.ancho);
      case 'escuchando': return par(P.atento);
      case 'hablando': return par(P.amable);
      case 'asentir': return par(d > 0.45 && d < 0.6 ? P.cerrado : P.amable);
      case 'buscando': case 'leyendo': return par(P.enfocado);
      case 'esperando': return par(P.esperando);
      case 'alerta': return par(P.serio);
      case 'alegre': case 'celebrar': return par(P.feliz);
      default: return par(P[estado] ?? P.idle);
    }
  }
  // La mirada de cada estado (de -0,42 a 0,42); null: la de siempre, de reojo y hacia el cursor
  function mirada(estado, d, t, mirar) {
    switch (estado) {
      case 'typing': return [0.3 + mirar.x * 0.1, 0.36];
      case 'thinking': return [0.15, -0.42];
      case 'error': case 'success': case 'encontrado': case 'alerta': case 'despertar': return [0, 0.02];
      case 'shy': return [0.35, 0.3];
      case 'dormir': return [0, -0.3];
      case 'atento': case 'escuchando': case 'esperando': return [mirar.x * 0.2, 0.04 + mirar.y * 0.12];
      case 'hablando': case 'asentir': return [mirar.x * 0.2 + Math.sin(t * 0.7) * 0.08, 0.06 + mirar.y * 0.1];
      case 'duda': return [0.26, -0.22];
      case 'buscando': return [Math.sin(d * 5.2) * 0.38, 0.08 + Math.sin(d * 1.3) * 0.12];
      case 'leyendo': {
        // Renglones: cuatro saltos de izquierda a derecha y vuelta al comienzo del siguiente, más abajo
        const s = (d % 1.5) / 1.5, renglon = Math.floor(d / 1.5) % 4;
        return [s < 0.85 ? -0.34 + Math.min(3, Math.floor((s / 0.85) * 4)) * 0.227 : -0.34, 0.06 + renglon * 0.07];
      }
      case 'alegre': case 'celebrar': return [0, -0.12];
      default: return null;
    }
  }
  // Lo que hace el cuerpo (subir, cabecear, ladearse), antes de la intensidad
  function movimiento(estado, d, t) {
    switch (estado) {
      case 'despertar': return { y: -0.16 * (1 - rampa(d, 0.3, 1)), rx: pulso(d, 2.05, 0.45) * 0.14, rz: 0 };
      case 'dormir': return { y: -0.12, rx: 0.1, rz: 0 };
      case 'atento': return { y: salto(d, 0, 0.42) * 0.2, rx: -0.06, rz: 0 };
      case 'escuchando': return { y: 0, rx: 0.08, rz: 0.07 };
      case 'hablando': return { y: 0, rx: voz * 0.05, rz: Math.sin(t * 1.1) * 0.03 };
      case 'asentir': return { y: 0, rx: (pulso(d, 0.05, 0.3) + 0.8 * pulso(d, 0.42, 0.3)) * 0.24, rz: 0 };
      case 'duda': return { y: 0, rx: -0.04, rz: -0.15 * rampa(d, 0, 0.45) };
      case 'leyendo': return { y: 0, rx: 0.09, rz: 0 };
      case 'encontrado': return { y: salto(d, 0.04, 0.42) * 0.24, rx: 0, rz: 0 };
      case 'esperando': return { y: Math.sin(t * 2.5) * 0.015, rx: 0, rz: 0.08 };
      case 'alegre': { const b = d < 1.2 ? Math.sin((d * Math.PI * 3) / 1.2) : 0; return { y: Math.abs(b) * 0.12, rx: 0, rz: b * 0.05 }; }
      case 'celebrar': return { y: salto(d, 0.05, 0.62) * 0.42 + salto(d, 0.8, 0.4) * 0.16, rx: 0, rz: 0 };
      default: return { y: 0, rx: 0, rz: 0 };
    }
  }

  function actualizar(t, dt, { estado, desde: d, mirar, quieto, intensidad = 1, nivel = null }) {
    const k = quieto ? 0 : intensidad;
    voz = acercar(voz, nivel ?? vozSimulada(t), dt, 18);
    const hablaOEscucha = estado === 'hablando' || estado === 'escuchando';

    // Párpados: cada estado los pone a su altura; el parpadeo los cierra un momento
    parpadeo -= dt; if (parpadeo <= 0) { cierra = 0.2; parpadeo = 6.5 + Math.random() * 3; }
    if (cierra > 0) cierra -= dt;
    if (estado === 'shy') { espia -= dt; if (espia <= 0) { espiando = 0.8; espia = 2.8 + Math.random() * 1.6; } } else espia = 2.2;
    if (espiando > 0) espiando -= dt;
    let [metaI, metaD] = parpados(estado, d);
    if (cierra > 0 && !SIN_PARPADEO.includes(estado)) metaI = metaD = PARPADOS.cerrado;
    if (estado === 'shy' && espiando > 0) metaD = [-0.02, -0.1, 0.02];
    const rapidez = cierra > 0 ? 30 : estado === 'dormir' ? 1.8 : estado === 'atento' || estado === 'encontrado' ? 26 : 12;
    for (let i = 0; i < 3; i++) { p.izq[i] = acercar(p.izq[i], metaI[i], dt, rapidez); p.der[i] = acercar(p.der[i], metaD[i], dt, rapidez); }
    const metaAbajo = estado === 'alegre' || estado === 'celebrar' ? ABAJO.feliz : estado === 'alerta' ? ABAJO.serio : ABAJO.nada;
    for (let i = 0; i < 2; i++) p.abajo[i] = acercar(p.abajo[i], metaAbajo[i], dt, 12);
    // La mirada: de reojo y hacia el cursor; cada estado mira a su manera
    let [mx, my] = mirada(estado, d, t, mirar) ?? [-0.3 + mirar.x * 0.42, 0.2 + mirar.y * 0.32];
    const largo = Math.hypot(mx, my); if (largo > 0.42) { mx *= 0.42 / largo; my *= 0.42 / largo; }
    const rapidezMirada = estado === 'leyendo' || estado === 'buscando' ? 22 : 9;
    p.mx = acercar(p.mx, mx, dt, rapidezMirada); p.my = acercar(p.my, my, dt, rapidezMirada);
    // La pupila: grande cuando te escucha o encuentra algo, chica cuando busca o hay una alerta
    const metaPupila = estado === 'despertar' ? (d < 1.1 ? 1.6 : 1 + 0.6 * (1 - rampa(d, 1.2, 1.1)))
      : { atento: 1.3, escuchando: 1.22, encontrado: 1.35, esperando: 1.15, buscando: 0.85, leyendo: 0.9, alerta: 0.78 }[estado] ?? 1;
    p.pupila = acercar(p.pupila, metaPupila, dt, 8);
    p.iris.lerp(tmp.set(IRIS[estado] ?? IRIS.idle), 1 - Math.exp(-dt * 10));
    const iris = '#' + p.iris.getHexString();
    ojos[0].dibujar({ mx: p.mx, my: p.my, izq: p.izq[0], der: p.izq[1], curva: p.izq[2], iris, pupila: p.pupila, abajo: p.abajo });
    ojos[1].dibujar({ mx: p.mx, my: p.my, izq: p.der[0], der: p.der[1], curva: p.der[2], iris, pupila: p.pupila, abajo: p.abajo });

    // Gira hacia el cursor; en la contraseña se da vuelta y mira al suelo. Cada reacción suma su movimiento
    const metaY = estado === 'shy' ? -0.55 : mirar.x * 0.42, metaX = estado === 'shy' ? 0.2 : mirar.y * 0.2;
    giro.y = acercar(giro.y, metaY, dt, 5); giro.x = acercar(giro.x, metaX, dt, 5);
    const m = movimiento(estado, d, t);
    for (const e of ['y', 'rx', 'rz']) cuerpo[e] = acercar(cuerpo[e], m[e] * k, dt, 16);
    // Celebrar: una vuelta entera (con «sobrio», sólo un meneo)
    let vueltaEntera = 0;
    if (estado === 'celebrar' && k > 0) {
      vueltaEntera = k >= 0.75 ? (d < 1.05 ? Math.PI * 2 * rampa(d, 0.15, 0.9) : 0) : Math.sin(d * 12) * 0.12 * pulso(d, 0.1, 0.8);
    }
    orbe.rotation.set(giro.x + cuerpo.rx, giro.y + vueltaEntera, cuerpo.rz);
    const vaiven = quieto ? 0 : estado === 'dormir' ? Math.sin(t * 0.7) * 0.04 : Math.sin(t * 1.3) * (estado === 'alerta' ? 0.03 : 0.08);
    const sacudida = estado === 'error' && !quieto ? Math.sin(d * 46) * 0.08 * Math.max(0, 1 - d / 0.5) : 0;
    flota.position.set(sacudida, vaiven + cuerpo.y, 0);
    const alto = vaiven + cuerpo.y;
    sombra.scale.set(1 - alto * 0.5, 1, 0.12 * (1 - alto * 0.5));

    // Anillo con satélites, globo, placa y plasma
    const metaAnillo = {
      success: 2.6, thinking: 1.3, shy: 0.15, dormir: 0.04, escuchando: 0.22, duda: 0.15, buscando: 0.9, leyendo: 0.2,
      esperando: 0, alerta: 0.55, alegre: 1.4,
      despertar: d < 0.4 ? 0 : 0.35 + 3.4 * (1 - rampa(d, 0.4, 2)),
      atento: 0.35 + 4 * pulso(d, 0, 0.55), encontrado: 0.35 + 5 * pulso(d, 0, 0.8),
      hablando: 0.3 + voz * 0.5, celebrar: 0.5 + 4.5 * (1 - rampa(d, 0.2, 2.2))
    }[estado] ?? 0.35;
    velAnillo = acercar(velAnillo, metaAnillo, dt, 10);
    const metaGlobo = {
      buscando: 2.6, dormir: 0.04, celebrar: 1.6, encontrado: 1.2,
      despertar: d < 0.4 ? 0 : 0.25 + 1.5 * (1 - rampa(d, 0.4, 1.8))
    }[estado] ?? 0.25;
    velGlobo = acercar(velGlobo, metaGlobo, dt, 5);
    // El anillo grande se ladea como una oreja al escucharte, se endereza en la alerta y titubea en la duda
    const metaLadeo = estado === 'escuchando' ? grados(-6) : estado === 'alerta' ? grados(9)
      : estado === 'duda' ? Math.sin(d * 7) * grados(5) * (1 - rampa(d, 0, 1.4)) : 0;
    ladeoAnillo = acercar(ladeoAnillo, metaLadeo * (quieto ? 0 : 1), dt, 6);
    grande.ladeo.rotation.z = grados(-9) + ladeoAnillo;
    if (!quieto) {
      vuelta += dt * velAnillo; grande.vuelta.rotation.z = vuelta;
      gira.rotation.y += dt * velGlobo;
      const meneo = grados(3) + (estado === 'hablando' ? voz * grados(5) : estado === 'celebrar' ? grados(6) * (1 - rampa(d, 0.5, 2)) : 0);
      colgante.rotation.z = grados(-6) + Math.sin(t * 1.4) * meneo;
      const cada = estado === 'success' ? 0.06 : estado === 'encontrado' || estado === 'celebrar' ? 0.04
        : estado === 'alegre' ? 0.06 : estado === 'buscando' ? 0.07 : estado === 'dormir' ? 0.6
        : estado === 'despertar' && d > 0.4 && d < 1.8 ? 0.05 : hablaOEscucha ? 0.13 - voz * 0.08 : 0.12;
      chispa -= dt; if (chispa <= 0) { rayos(++semilla); adentro(); chispa = cada; }
    }
    const colorMeta = estado === 'error' ? C.rojo : estado === 'success' || estado === 'celebrar' ? C.verde : estado === 'alerta' ? C.ambar : C.cian;
    color.lerp(tmp.set(colorMeta), 1 - Math.exp(-dt * 8));
    for (const mat of [estrella.material, matPunta, matBrillo, halo.material, haloGrande.material]) mat.color.copy(color);
    const quietoNo = !quieto;
    const fuerza = {
      success: 1.35, thinking: quietoNo ? 1.1 + Math.sin(t * 5) * 0.1 : 1,
      despertar: 0.25 + 0.75 * rampa(d, 0.35, 0.7) + 0.35 * pulso(d, 0.9, 0.6),
      dormir: 0.55 + (quietoNo ? Math.sin(t * 1.1) * 0.07 : 0), atento: 1 + 0.25 * pulso(d, 0, 0.5),
      escuchando: 0.9 + voz * 0.45, hablando: 0.88 + voz * 0.55, duda: 0.82, buscando: 1 + (quietoNo ? Math.sin(t * 9) * 0.05 : 0),
      leyendo: 0.95, encontrado: 1 + 0.6 * pulso(d, 0, 0.7), esperando: 0.95 + (quietoNo ? Math.sin(t * 2.5) * 0.06 : 0),
      alerta: 1.05 + (quietoNo ? Math.sin(t * 4) * 0.08 : 0), alegre: 1.15, celebrar: 1.3 + (quietoNo ? Math.sin(t * 8) * 0.2 : 0)
    }[estado] ?? 1;
    nucleo.scale.setScalar(acercar(nucleo.scale.x, fuerza, dt, hablaOEscucha ? 18 : 6));
    // La luz del plasma: casi apagado al despertar, tenue al dormir
    const metaLuz = estado === 'despertar' ? Math.max(0.04, rampa(d, 0.35, 0.9)) : estado === 'dormir' ? 0.35 : estado === 'duda' ? 0.75 : 1;
    luz = acercar(luz, metaLuz, dt, estado === 'despertar' ? 12 : 4);
    haloGrande.material.opacity = 0.32 * luz; halo.material.opacity = 0.75 * luz; matBrillo.opacity = 0.45 * luz;
    for (const mat of [matFilo, matPunta, matPuntaB, estrella.material, blanco.material]) mat.opacity = luz;

    // Los satélites: laten al esperar tu OK, destellan al encontrar algo; ámbar en la alerta, verdes al celebrar
    const metaSat = {
      esperando: 0.6 + 0.6 * Math.sin(t * 2.5), encontrado: 1 + 2 * pulso(d, 0, 0.7), atento: 1 + 1.2 * pulso(d, 0, 0.5),
      celebrar: 1.8, dormir: 0.3, despertar: rampa(d, 0.6, 1), alerta: 1 + 0.5 * Math.sin(t * 4)
    }[estado] ?? 1;
    brilloSat = acercar(brilloSat, metaSat, dt, 10);
    colorSat.lerp(tmp.set(estado === 'alerta' ? C.ambar : estado === 'celebrar' ? C.verde : C.cian), 1 - Math.exp(-dt * 8));
    for (const s of satelites) {
      s.luz.color.copy(colorSat); s.resplandor.material.color.copy(colorSat);
      s.resplandor.material.opacity = Math.min(1, 0.35 * brilloSat);
      s.resplandor.scale.setScalar(0.55 * (0.75 + 0.25 * brilloSat));
    }

    // El escáner: sube y baja por dentro del orbe mientras busca
    luzBanda = acercar(luzBanda, estado === 'buscando' ? 1 : 0, dt, 6);
    banda.visible = luzBanda > 0.01;
    if (banda.visible) {
      const yb = quieto ? 0 : Math.sin(d * 2) * 1.15, rb = Math.sqrt(Math.max(0.01, (R - 0.05) ** 2 - yb * yb));
      banda.position.y = yb; banda.scale.set(rb, 1, rb);
      matBanda.opacity = luzBanda; matBandaB.opacity = 0.38 * luzBanda;
    }
  }

  return {
    grupo: raiz, colores: COLORES, marco: { centro: -0.52, tam: 6.0 },
    estados: ESTADOS, duracion: DURACION,
    actualizar: (t, dt, ctx) => actualizar(t, dt, { ...ctx, estado: ctx.estado.startsWith('look-') ? 'idle' : ctx.estado })
  };
}
