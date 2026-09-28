// Oficina BiPlot · la música y la voz de la visita guiada con Plotty
// Se sintetiza en Node, sin dependencias, desde el mismo guion que la imagen (guion.js), con los instrumentos y la
// mezcla del teaser (../teaser/musica.mjs). Más cálida que el teaser: fa mayor a 100 pulsos por minuto (F–C–Dm–Bb).
//   entrada  colchón, Plotty que llega («blup»), destellos cuando se va el techo y un paso suave hacia adentro;
//   adentro  groove liviano (bombo, palmas, bajo, marimba y piano eléctrico), una campanita en cada parada y un
//            soplido en cada viaje de la cámara; en la mesa de dos, un misterio (re menor y la mayor);
//   afuera   un respiro que sube y el groove completo en la calle: golpes al abrir el local, al entrar a la sala y en
//            cada sala; el aviso del enlace, un tin por cada punto del acompañamiento y la subida hasta el cierre;
//   cierre   el acorde grande de BiPlot HQ, la invitación y Plotty: «¿Tres preguntas?».
// componer(G) → { sr, L, R } (Float32Array); escribirWav(ruta, audio) lo guarda en WAV de 16 bits.
import {
  SR, TAU, hz, nota, azar, muestras, golpe, colchon, subida, soplido, platillo, campana, bombo, caja, palmas, hihat, tambor,
  bajo, brillos, tin, tic, blup, hablar, mezclar, escribirWav
} from '../teaser/musica.mjs';

export { escribirWav };

/* ───────── Dos instrumentos más, para la calidez ───────── */

// Piano eléctrico (FM, como un Rhodes): una moduladora 1:1 cuyo índice se apaga, y el «tine» agudo del golpe
function teclado(m, d, o = {}) {
  const suelta = 0.5, n = muestras(d + suelta), b = new Float32Array(n), f = hz(m) * (1 + (o.desafina || 0));
  let pc = 0, pm = 0, pt = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, idx = (o.brillo ?? 1.3) * Math.exp(-t * 3.5) + 0.22;
    pc += TAU * f / SR; pm += TAU * f / SR; pt += TAU * f * 14 / SR;
    const s = Math.sin(pc + idx * Math.sin(pm)) + Math.sin(pt) * 0.1 * Math.exp(-t * 34);
    b[i] = s * Math.min(1, t / 0.003) * Math.exp(-t * (o.decae ?? 0.9)) * (t < d ? 1 : Math.max(0, 1 - (t - d) / suelta));
  }
  return b;
}
// Marimba: el tono y su cuarto parcial (el golpe de madera), que se apaga rápido
function marimba(m, o = {}) {
  const d = o.dur || 0.8, n = muestras(d), b = new Float32Array(n), f = hz(m);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    b[i] = (Math.sin(TAU * f * t) * Math.exp(-t * (o.decae || 6)) + Math.sin(TAU * f * 3.99 * t) * 0.3 * Math.exp(-t * 28) + Math.sin(TAU * f * 9.8 * t) * 0.06 * Math.exp(-t * 70)) * Math.min(1, t / 0.0015);
  }
  return b;
}

/* ───────── La partitura ───────── */
export function componer(G, opciones = {}) {
  const total = G.total + 2.5, n = muestras(total);
  const M = { L: new Float32Array(n), R: new Float32Array(n) };      // música
  const V = { L: new Float32Array(n), R: new Float32Array(n) };      // la voz de Plotty (no se agacha)
  const S = { L: new Float32Array(n), R: new Float32Array(n) };      // envío a la sala
  const P = G.PULSO, C = G.COMPAS, Mo = G.M;
  // Suma un sonido (mono o estéreo) en t, con volumen, paneo y envío a la sala
  function poner(buf, t, g = 1, pan = 0, sala = 0, dest = M) {
    const i0 = Math.round(t * SR); if (i0 >= n) return;
    const est = buf.L !== undefined, gl = g * Math.SQRT2 * Math.cos((pan + 1) * Math.PI / 4), gr = g * Math.SQRT2 * Math.sin((pan + 1) * Math.PI / 4);
    const len = est ? buf.L.length : buf.length;
    for (let i = Math.max(0, -i0); i < len && i0 + i < n; i++) {
      const l = (est ? buf.L[i] : buf[i]) * gl, rr = (est ? buf.R[i] : buf[i]) * gr;
      dest.L[i0 + i] += l; dest.R[i0 + i] += rr;
      if (sala) { S.L[i0 + i] += l * sala; S.R[i0 + i] += rr * sala; }
    }
  }
  const K = bombo(), CL = palmas(), SN = caja(), HC = hihat(false), HO = hihat(true), CR = platillo(2.8), CRc = platillo(1.2, { decae: 4, semilla: 14 });

  // Los acordes (con su novena arriba, para el colchón) y cómo se reparten en la octava
  const ACORDES = { F: ['F', 'A', 'C', 'G'], C: ['C', 'E', 'G', 'D'], Dm: ['D', 'F', 'A', 'E'], Bb: ['Bb', 'D', 'F', 'C'], A: ['A', 'C#', 'E', 'B'], Gm: ['G', 'Bb', 'D', 'A'] };
  const RAIZ = { F: 'F1', C: 'C2', Dm: 'D2', Bb: 'Bb1', A: 'A1', Gm: 'G1' };
  const tonos = (a, oct) => { let prev = -1; return a.map((x) => { let m = nota(x + oct); while (m <= prev) m += 12; prev = m; return m; }); };
  // Un compás de acorde: colchón, piano eléctrico y bajo; nivel 0 (sólo colchón) a 3 (todo, con el bajo que bombea)
  function compas(t0, nombre, nivel, o = {}) {
    const a = ACORDES[nombre], raiz = nota(RAIZ[nombre]), dur = o.dur || C;
    poner(colchon(tonos(a, 3), { dur: dur + 0.35, ataque: o.ataque || 0.35, suelta: 0.45, corte: 900 + nivel * 350, semilla: Math.round(t0 * 10) }), t0, 0.16 + (o.colchon || 0), 0, 0.4);
    if (nivel >= 1) {
      tonos(a, 3).forEach((m, j) => poner(teclado(m, dur * 0.8, { brillo: 1.1 + nivel * 0.15 }), t0 + j * 0.012, 0.075, (j - 1.5) * 0.25, 0.3));
      if (dur >= C) tonos(a.slice(0, 3), 4).forEach((m, j) => poner(teclado(m, P * 0.9, { brillo: 0.9 }), t0 + 3.5 * P + j * 0.01, 0.035, 0.3, 0.3));
    }
    if (nivel >= 1) {
      // El bajo: en la entrada y adentro, a tiempo y a contratiempo; en la calle, corcheas con octava (bombea)
      const pasos = nivel >= 3 ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 3, 4, 6, 7];
      pasos.forEach((k) => {
        const tk = t0 + k * P / 2; if (tk >= t0 + dur - 0.02) return;
        const alto = nivel >= 3 ? k % 2 === 1 : k === 7, d = nivel >= 3 ? P / 2 * 0.85 : (k === 0 ? P * 1.4 : P / 2 * 0.9);
        poner(bajo(raiz + (alto ? 12 : 0), d), tk, 0.26 * (k % 2 ? 0.85 : 1), 0, 0.03);
      });
    }
    if (nivel >= 2) {
      // Marimba en corcheas (adentro) o semicorcheas suaves (calle), con eco al otro lado
      const arp = tonos(a.slice(0, 3), 4).concat(tonos(a.slice(0, 3), 5)), PAT = [0, 2, 1, 3, 2, 4, 3, 5, 0, 2, 1, 3, 2, 4, 5, 4];
      const cuantas = nivel >= 3 ? 16 : 8, paso = C / cuantas;
      for (let k = 0; k < cuantas; k++) {
        const tk = t0 + k * paso; if (tk >= t0 + dur - 0.02) break;
        const b = marimba(arp[PAT[(nivel >= 3 ? k : k * 2) % 16] % arp.length], { decae: nivel >= 3 ? 9 : 6 }), g = (nivel >= 3 ? 0.075 : 0.1) * (k % (cuantas / 4) === 0 ? 1.25 : 1);
        poner(b, tk, g, 0.3, 0.25); poner(b, tk + P * 0.75, g * 0.3, -0.45, 0.3);
      }
    }
  }
  // Un compás de batería: 1 = liviano (bombo en 1 y 3, palmas en 2 y 4, hi-hat en corcheas), 2 = completo (bombo en cada pulso,
  // caja con las palmas y hi-hat en semicorcheas, abierto a contratiempo); sin bombo si o.sinBombo
  function bateria(t0, nivel, o = {}) {
    for (let k = 0; k < 4; k++) {
      const tk = t0 + k * P; if (o.hasta && tk >= o.hasta) break;
      if (!o.sinBombo && (nivel >= 2 || k % 2 === 0)) poner(K, tk, nivel >= 2 ? 0.62 : 0.55, 0);
      if (k % 2 === 1) { poner(CL, tk, 0.3, 0, 0.25); if (nivel >= 2) poner(SN, tk, 0.24, 0, 0.25); }
      const sub = nivel >= 2 ? 4 : 2;
      for (let h = 0; h < sub; h++) {
        const abierto = nivel >= 2 && h === 2;
        poner(abierto ? HO : HC, tk + h * P / sub, abierto ? 0.09 : (h % 2 ? 0.1 : 0.16) * (nivel >= 2 ? 1 : 0.85), 0.3);
      }
    }
  }
  const redoble = (t0, d, g0, g1) => { const pasos = Math.round(d / (P / 4)); for (let k = 0; k < pasos; k++) poner(SN, t0 + k * P / 4, g0 + (g1 - g0) * k / pasos, 0, 0.2); };
  const toms = (tFin) => [0, 1, 2, 3].forEach((k) => poner(tambor(140 - k * 22), tFin - P / 4 * (4 - k), 0.3 + k * 0.05, (1.5 - k) * 0.3, 0.2));
  const voz = (linea, t, semilla) => hablar(linea, t, G.LETRAS, G.VOZ, semilla).forEach((e) => poner(e.b, e.t, 1, 0, 0.15, V));

  /* ── La entrada: el barrio de noche, Plotty llega y se va el techo ── */
  compas(0, 'F', 0, { ataque: 2.2, colchon: 0.08 });
  compas(C, 'C', 0, { colchon: 0.05 });
  poner(soplido(0.8, { semilla: 201, izq: true }), 0.12, 0.28, 0, 0.2);          // Plotty llega volando desde la derecha
  poner(blup(), 0.5, 0.34, -0.2, 0.3);
  voz(G.hola.linea, G.hola.habla, 301);
  // «BiPlot HQ»: un golpe suave y la marimba que se abre
  poner(golpe({ dur: 2, semilla: 202, caida: 60, decae: 2, fondo: 40 }), G.muestro.t + 0.1, 0.4, 0, 0.3);
  ['F4', 'A4', 'C5', 'F5'].forEach((x, k) => poner(marimba(nota(x), { dur: 1.2, decae: 3.5 }), G.muestro.t + 0.1 + k * 0.07, 0.12, (k - 1.5) * 0.3, 0.45));
  voz(G.muestro.linea, G.muestro.habla, 302);
  // El techo que se va: destellos, un poco de aire y el groove que empieza a asomar
  poner(subida(0.9, { desde: 1200, hasta: 11000, semilla: 203 }), G.techo - 0.75, 0.16, 0, 0.3);
  poner(brillos(['F6', 'G6', 'A6', 'C7', 'D7', 'F7'].map(nota), 0.07), G.techo + 0.1, 0.3, 0, 0.7);
  poner(CRc, G.techo + 0.1, 0.16, 0, 0.3);
  compas(G.techo, 'Dm', 1);
  for (let k = 0; k < 8; k++) poner(HC, G.techo + C / 2 + k * P / 4, 0.06 + k * 0.01, 0.3);
  voz(G.pasa.linea, G.pasa.habla, 303);
  // La cámara entra y viaja a la recepción
  compas(G.entra, 'Bb', 1);
  poner(K, G.entra, 0.5); poner(K, G.entra + 2 * P, 0.45);
  for (let k = 0; k < 8; k++) poner(HC, G.entra + k * P / 2, k % 2 ? 0.08 : 0.12, 0.3);
  poner(soplido(2.0, { semilla: 204 }), G.entra + 0.15, 0.3, 0, 0.2);
  toms(G.ADENTRO);

  /* ── Adentro: una parada cada dos compases ── */
  const RONDA = [['F', 'C'], ['Dm', 'Bb'], ['F', 'C'], ['Dm', 'Bb'], ['Dm', 'A'], ['Bb', 'F']];
  G.PARADAS.forEach((p, i) => {
    const t0 = p.t, misterio = p.id === 'planos', ultima = i === G.PARADAS.length - 1;
    const [a1, a2] = RONDA[i];
    compas(t0, a1, misterio ? 1 : 2); compas(t0 + C, a2, 2);
    // La mesa de dos: el primer compás sin bombo y con un misterio (campana grave y tics), el segundo vuelve
    if (misterio) {
      bateria(t0, 1, { sinBombo: true });
      poner(golpe({ dur: 2.4, semilla: 220, caida: 45, decae: 1.4, fondo: 36 }), t0, 0.45, 0, 0.35);
      poner(campana(hz(nota('A4')), { dur: 2.6 }), t0 + 0.55, 0.12, -0.3, 0.7);
      poner(campana(hz(nota('C#5')), { dur: 2.2 }), t0 + C + 0.05, 0.1, 0.3, 0.7);
      for (let j = 0; j < 5; j++) poner(tic(), p.habla + 1.25 + j * 0.09, 0.14, (j % 2 ? 0.4 : -0.4), 0.2);
    } else bateria(t0, 1);
    bateria(t0 + C, 1, ultima ? { hasta: t0 + 2 * C - C / 2 } : {});
    // Llega la cámara (un soplido, menos en la recepción, que viene de la entrada) y el nombre del lugar (una campanita)
    if (i > 0) poner(soplido(0.95, { semilla: 230 + i, izq: i % 2 === 0 }), t0 - 0.05, 0.3, 0, 0.18);
    poner(campana(hz(nota(i % 2 ? 'C6' : 'A5')), { dur: 1.1, corta: true }), t0 + 0.55, 0.09, 0.25, 0.55);
    poner(campana(hz(nota(i % 2 ? 'F6' : 'C6')), { dur: 1.4, corta: true }), t0 + 0.67, 0.08, -0.25, 0.55);
    voz(p.linea, p.habla, 310 + i);
    if (!ultima && !misterio) poner(tambor(125), t0 + 2 * C - P / 2, 0.22, 0.3, 0.2);
    if (ultima) { redoble(t0 + 2 * C - C / 2, C / 2, 0.1, 0.3); toms(G.AFUERA); }
  });

  /* ── La salida: un respiro que sube hasta la calle ── */
  const ts = G.AFUERA;
  poner(golpe({ dur: 1.8, semilla: 240, caida: 55, decae: 2.2, fondo: 40 }), ts, 0.45, 0, 0.3);
  poner(CRc, ts, 0.18, 0, 0.3);
  compas(ts, 'C', 0, { colchon: 0.06 });
  poner(subida(C - 0.05, { desde: 300, hasta: 9000, semilla: 241 }), ts + 0.05, 0.42, 0, 0.3);
  for (let k = 0; k < 4; k++) poner(K, ts + k * P, 0.2 + k * 0.08);
  redoble(ts + C / 2, C / 2, 0.06, 0.28);
  poner(soplido(1.0, { semilla: 242 }), ts + 0.2, 0.25, 0, 0.2);
  poner(soplido(0.7, { semilla: 243, izq: true }), G.CALLE - 0.65, 0.35, 0, 0.2);
  voz(Mo.salida.linea, Mo.salida.habla, 330);

  /* ── La calle: doce compases con todo ── */
  const CALLE = [['F', 'C'], ['Dm', 'Bb'], ['F', 'C'], ['Dm', 'Bb'], ['F', 'C'], ['Dm', 'Bb']];
  ['calle', 'local', 'sala', 'enlace', 'seguimos', 'libre'].forEach((k, i) => {
    const m = Mo[k], t0 = m.t, [a1, a2] = CALLE[i], enlace = k === 'enlace', libre = k === 'libre';
    compas(t0, a1, enlace ? 2 : 3);
    if (libre) { compas(t0 + C, 'Bb', 3, { dur: C / 2 }); compas(t0 + C + C / 2, 'C', 3, { dur: C / 2 }); }
    else compas(t0 + C, a2, enlace ? 2 : 3);
    // El enlace respira: el primer compás sin bombo
    bateria(t0, enlace ? 1 : 2, enlace ? { sinBombo: true } : {});
    bateria(t0 + C, enlace ? 1 : 2, libre ? { hasta: t0 + 2 * C - C / 2 } : {});
    voz(m.linea, m.habla, 340 + i);
  });
  // Los golpes de la calle
  poner(golpe({ dur: 2.4, semilla: 250, caida: 85, decae: 1.5 }), G.CALLE, 0.8, 0, 0.3);
  poner(CR, G.CALLE, 0.32, 0, 0.3);
  poner(brillos(['C6', 'F6', 'A6', 'C7'].map(nota), 0.06), G.CALLE + 0.05, 0.16, 0, 0.6);
  // El local de Haru que se abre
  poner(soplido(0.9, { semilla: 251 }), Mo.local.t - 0.05, 0.3, 0, 0.2);
  poner(golpe({ dur: 1.6, semilla: 252, caida: 55, decae: 2.4, fondo: 42 }), Mo.local.t + 1.05, 0.4, 0, 0.3);
  poner(brillos(['A5', 'C6', 'F6', 'G6', 'A6', 'C7'].map(nota), 0.06), Mo.local.t + 1.05, 0.26, 0, 0.65);
  // La zambullida a su sala y las otras dos
  poner(subida(0.95, { desde: 600, hasta: 12000, semilla: 253, curva: 1.6 }), Mo.sala.t - 0.5, 0.35, 0, 0.3);
  poner(golpe({ dur: 2.2, semilla: 254, caida: 90, decae: 1.6 }), Mo.sala.t + 0.45, 0.75, 0, 0.3);
  poner(CR, Mo.sala.t + 0.45, 0.28, 0, 0.35);
  [1.9, 3.35].forEach((d, j) => {
    poner(golpe({ dur: 1.2, semilla: 255 + j, caida: 50, decae: 3.2, fondo: 44 }), Mo.sala.t + d, 0.42, 0, 0.25);
    poner(CRc, Mo.sala.t + d, 0.14, 0, 0.3);
    poner(tin(1760 + j * 220), Mo.sala.t + d + 0.02, 0.12, (j ? 0.4 : -0.4), 0.35);
    poner(soplido(0.3, { semilla: 257 + j, izq: j === 0 }), Mo.sala.t + d - 0.25, 0.22, 0, 0.15);
  });
  // El teléfono que sube y el aviso de «Compartir»
  poner(soplido(0.7, { semilla: 260 }), Mo.enlace.t + 0.15, 0.3, 0, 0.2);
  poner(tic(), Mo.enlace.t + 2.28, 0.3, 0.1, 0.1);
  poner(marimba(nota('C6'), { dur: 0.9, decae: 5 }), Mo.enlace.t + 2.3, 0.2, 0.15, 0.45);
  poner(marimba(nota('F6'), { dur: 1.2, decae: 4 }), Mo.enlace.t + 2.42, 0.2, 0.15, 0.45);
  poner(campana(hz(nota('F6')), { dur: 1.4, corta: true }), Mo.enlace.t + 2.42, 0.06, 0.15, 0.5);
  toms(Mo.seguimos.t);
  // Seguimos con ellos: el golpe y un tin por cada punto
  poner(golpe({ dur: 2.2, semilla: 262, caida: 80, decae: 1.6 }), Mo.seguimos.t, 0.7, 0, 0.3);
  poner(CR, Mo.seguimos.t, 0.28, 0, 0.3);
  ['A5', 'C6', 'F6'].forEach((x, j) => {
    poner(marimba(nota(x), { dur: 0.9, decae: 5 }), Mo.seguimos.t + 0.95 + j * 0.45, 0.2, 0.2 - j * 0.2, 0.45);
    poner(tin(2093 + j * 300), Mo.seguimos.t + 0.95 + j * 0.45, 0.05, 0.2 - j * 0.2, 0.3);
  });
  // El local libre: soplido, destellos, y la subida hasta el cierre
  poner(soplido(0.9, { semilla: 263, izq: true }), Mo.libre.t - 0.05, 0.3, 0, 0.2);
  poner(brillos(['F6', 'A6', 'C7', 'D7', 'F7'].map(nota), 0.06), Mo.libre.t + 1.05, 0.24, 0, 0.65);
  poner(golpe({ dur: 1.4, semilla: 264, caida: 50, decae: 2.6, fondo: 44 }), Mo.libre.t + 1.05, 0.35, 0, 0.3);
  redoble(Mo.cierre.t - C / 2, C / 2, 0.12, 0.42);
  poner(subida(C - 0.05, { desde: 250, hasta: 10000, semilla: 265 }), Mo.cierre.t - C, 0.5, 0, 0.3);
  toms(Mo.cierre.t);

  /* ── El cierre: BiPlot HQ, la invitación y Plotty ── */
  const tc = Mo.cierre.t, fin = G.total;
  poner(golpe({ dur: 3.6, semilla: 270, caida: 100, decae: 1.0 }), tc, 1, 0, 0.35);
  poner(CR, tc, 0.42, 0, 0.45);
  poner(brillos(['F6', 'A6', 'C7', 'F7', 'A7'].map(nota), 0.06), tc + 0.05, 0.22, 0, 0.7);
  poner(colchon([nota('F2'), nota('C3'), nota('F3'), nota('A3'), nota('C4'), nota('G4')], { dur: fin - tc + 0.6, ataque: 0.08, suelta: 3.2, corte: 1500, semilla: 271 }), tc, 0.32, 0, 0.5);
  poner(colchon([nota('A4'), nota('C5'), nota('G5')], { dur: fin - tc, ataque: 1.6, suelta: 3.0, corte: 3200, semilla: 272, coro: true }), tc + 0.4, 0.14, 0, 0.6);
  tonos(['F', 'A', 'C', 'G'], 3).forEach((m, j) => poner(teclado(m, 3.5, { brillo: 1.6, decae: 0.6 }), tc + j * 0.02, 0.1, (j - 1.5) * 0.3, 0.4));
  // Dos compases más de groove liviano (F y Dm) y queda el colchón
  compas(tc, 'F', 2, { colchon: -0.06 }); compas(tc + C, 'Dm', 2, { colchon: -0.06 });
  bateria(tc, 1); bateria(tc + C, 1, { hasta: tc + 2 * C - P });
  poner(bajo(nota('F1'), 3.5), tc + 2 * C, 0.25, 0, 0.05);
  // La frase, la dirección y el botón
  poner(marimba(nota('C6'), { dur: 1, decae: 4 }), tc + 1.2, 0.12, -0.2, 0.5);
  poner(tic(), tc + 2.4, 0.18, 0.1, 0.15);
  poner(marimba(nota('A5'), { dur: 1, decae: 4 }), tc + 2.65, 0.16, 0.2, 0.5);
  poner(marimba(nota('F6'), { dur: 1.4, decae: 3 }), tc + 2.77, 0.16, 0.2, 0.5);
  poner(campana(hz(nota('C7')), { dur: 1.6 }), tc + 2.77, 0.07, 0.2, 0.55);
  // Plotty
  poner(blup(), Mo.cierre.habla - 0.3, 0.28, -0.2, 0.3);
  voz(Mo.cierre.linea, Mo.cierre.habla, 399);
  poner(campana(hz(nota('F6')), { dur: 2.2 }), Mo.cierre.habla + Mo.cierre.linea.length / G.LETRAS + 0.5, 0.1, 0.2, 0.6);

  const salida = mezclar(M, V, S, n, G.total);
  // Para revisar la mezcla: la música y la voz por separado
  if (opciones.pistas) salida.pistas = { musica: M, voces: V };
  return salida;
}
