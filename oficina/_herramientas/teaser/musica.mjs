// Oficina BiPlot · la música y las voces del teaser del equipo
// Todo se sintetiza aquí, en Node y sin dependencias, desde el mismo guion que la imagen (guion.js): los golpes caen
// en los cortes y cada personaje «habla» mientras se escribe su línea, con una voz balbuceada a su modo (sílabas con
// las vocales de lo que dice, en su tono y su timbre). Tráiler en do menor a 100 pulsos por minuto:
//   intro   dron grave, un golpe por frase, avisos de chat, y una subida hasta «ordenarlo»;
//   oficina el braam de la oficina, el techo que se abre (destellos) y el golpe de BiPlot HQ;
//   equipo  bajo y ostinato que crecen personaje a personaje (i–VI–III–VII), batería cada vez más llena, un golpe por corte;
//   motor   diez notas que suben (una por fase), el hilo que las une y un respiro;
//   elenco  coro y redoble hasta el blanco; cierre: el braam final, un acorde largo y la invitación; remate: Plotty.
// componer(G) → { sr, L, R } (Float32Array); escribirWav(ruta, audio) lo guarda en WAV de 16 bits.
import fs from 'node:fs';

const SR = 48000, TAU = Math.PI * 2;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
function nota(n) { const m = n.match(/^([A-G])(b|#)?(-?\d)$/); return 12 * (Number(m[3]) + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0); }
function azar(semilla) { let a = semilla >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const muestras = (s) => Math.max(1, Math.ceil(s * SR));

// Filtro biquad (recetas de Robert Bristow-Johnson): lp, hp, bp y pico
class Filtro {
  constructor(tipo) { this.tipo = tipo; this.x1 = this.x2 = this.y1 = this.y2 = 0; }
  poner(f, q = 0.707, db = 0) {
    f = Math.min(Math.max(f, 16), SR * 0.45);
    const w = TAU * f / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    let b0, b1, b2, a0, a1, a2;
    if (this.tipo === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (this.tipo === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (this.tipo === 'bp') { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else { const A = Math.pow(10, db / 40); b0 = 1 + al * A; b1 = -2 * c; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * c; a2 = 1 - al / A; }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
    return this;
  }
  // Coeficientes a mano (con a0 = 1), como los de la ponderación K de la sonoridad
  coef(b0, b1, b2, a1, a2) { Object.assign(this, { b0, b1, b2, a1, a2 }); return this; }
  paso(x) { const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2; this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y; }
}

/* ───────── Los instrumentos: cada uno devuelve su sonido (mono, o { L, R }) ───────── */

// Golpe grave: un seno que cae de tono, con un golpe de ruido
function golpe(o = {}) {
  const d = o.dur || 2.2, n = muestras(d), b = new Float32Array(n), r = azar(o.semilla || 3), lp = new Filtro('lp').poner(o.corte || 160, 0.8);
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = (o.fondo || 30) + (o.caida || 75) * Math.exp(-t * 13);
    fase += TAU * f / SR;
    const s = Math.sin(fase) * Math.exp(-t * (o.decae || 1.5)) + lp.paso((r() * 2 - 1) * Math.exp(-t * 28)) * 1.2;
    b[i] = Math.tanh(s * 1.9) * Math.min(1, (d - t) / 0.05);
  }
  return b;
}
// Braam: sierras desafinadas en quintas y octavas, con un filtro que se abre de golpe y se va cerrando, saturadas
function braam(notas, o = {}) {
  const d = o.dur || 3.4, n = muestras(d), r = azar(o.semilla || 7), L = new Float32Array(n), R = new Float32Array(n);
  const voces = []; notas.forEach((m) => [-0.13, -0.04, 0.05, 0.14].forEach((det, j) => voces.push({ f: hz(m + det), fase: r(), lado: j % 2 })));
  const fl = [new Filtro('lp'), new Filtro('lp')], fr = [new Filtro('lp'), new Filtro('lp')], sub = hz(notas[0] - 12);
  let fs = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    if ((i & 31) === 0) { const corte = (o.base || 220) + (o.abre || 2400) * Math.exp(-t * (o.cierra || 1.8)) * Math.min(1, t / 0.07); fl[0].poner(corte, 1.2); fl[1].poner(corte * 1.3, 0.7); fr[0].poner(corte * 1.04, 1.2); fr[1].poner(corte * 1.34, 0.7); }
    let sl = 0, sr = 0;
    for (const v of voces) { v.fase += v.f / SR; if (v.fase >= 1) v.fase -= 1; const s = 2 * v.fase - 1; if (v.lado) sr += s; else sl += s; }
    fs += TAU * sub / SR;
    const env = Math.min(1, t / (o.ataque || 0.04)) * (t < d - (o.suelta || 1.6) ? 1 : Math.max(0, (d - t) / (o.suelta || 1.6)));
    const s0 = Math.sin(fs) * 0.55;
    L[i] = Math.tanh((fl[1].paso(fl[0].paso(sl / voces.length * 2)) + s0) * (o.fuerza || 3)) * env * 0.8;
    R[i] = Math.tanh((fr[1].paso(fr[0].paso(sr / voces.length * 2)) + s0) * (o.fuerza || 3)) * env * 0.8;
  }
  return { L, R };
}
// Colchón: acorde de sierras suaves, con entrada y salida lentas (o «aah» de coro, con formantes)
function colchon(notas, o = {}) {
  const d = o.dur || 4.8, n = muestras(d), r = azar(o.semilla || 11), L = new Float32Array(n), R = new Float32Array(n);
  const voces = []; notas.forEach((m) => [-0.09, 0.09, -0.03, 0.03].forEach((det, j) => voces.push({ f: hz(m + det), fase: r(), lado: j % 2, vib: r() * 6 })));
  const lpL = new Filtro('lp').poner(o.corte || 900, 0.6), lpR = new Filtro('lp').poner((o.corte || 900) * 1.05, 0.6);
  const coro = o.coro ? [new Filtro('bp').poner(700, 3), new Filtro('bp').poner(1150, 4), new Filtro('bp').poner(710, 3), new Filtro('bp').poner(1170, 4)] : null;
  const at = o.ataque || 0.8, su = o.suelta || 1.2;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let sl = 0, sr = 0;
    for (const v of voces) { v.fase += v.f * (1 + 0.003 * Math.sin(t * 5 + v.vib)) / SR; if (v.fase >= 1) v.fase -= 1; const s = 2 * v.fase - 1; if (v.lado) sr += s; else sl += s; }
    sl /= voces.length / 2; sr /= voces.length / 2;
    let yl = lpL.paso(sl), yr = lpR.paso(sr);
    if (coro) { yl = coro[0].paso(sl) * 1.6 + coro[1].paso(sl) + yl * 0.3; yr = coro[2].paso(sr) * 1.6 + coro[3].paso(sr) + yr * 0.3; }
    const env = Math.min(1, t / at) * Math.min(1, Math.max(0, (d - t) / su));
    L[i] = yl * env; R[i] = yr * env;
  }
  return { L, R };
}
// Subida: ruido con un filtro que sube, un tono que sube y el volumen que crece
function subida(d, o = {}) {
  const n = muestras(d), L = new Float32Array(n), R = new Float32Array(n), r = azar(o.semilla || 5), a = new Filtro('bp'), b = new Filtro('bp');
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n, fc = (o.desde || 250) * Math.pow((o.hasta || 7000) / (o.desde || 250), u);
    if ((i & 31) === 0) { a.poner(fc, 2.2); b.poner(fc * 1.03, 2.2); }
    fase += TAU * (160 + 1300 * u * u) / SR;
    const vol = Math.pow(u, o.curva || 2.2), tono = Math.sin(fase) * 0.22 * u;
    L[i] = (a.paso(r() * 2 - 1) * 1.9 + tono) * vol; R[i] = (b.paso(r() * 2 - 1) * 1.9 + tono) * vol;
  }
  return { L, R };
}
// Soplido: ruido que pasa de un lado al otro (antes de cada corte)
function soplido(d = 0.55, o = {}) {
  const n = muestras(d), L = new Float32Array(n), R = new Float32Array(n), r = azar(o.semilla || 9), f = new Filtro('bp');
  for (let i = 0; i < n; i++) {
    const u = i / n; if ((i & 31) === 0) f.poner(400 + 3200 * Math.sin(Math.PI * u) * u + 300 * u, 1.3);
    const s = f.paso(r() * 2 - 1) * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 2) * 1.8, p = o.izq ? 1 - u : u;
    L[i] = s * Math.cos(p * Math.PI / 2); R[i] = s * Math.sin(p * Math.PI / 2);
  }
  return { L, R };
}
// Platillo (el golpe de arriba): ruido agudo con cola larga
function platillo(d = 2.5, o = {}) {
  const n = muestras(d), L = new Float32Array(n), R = new Float32Array(n), r = azar(o.semilla || 13), hl = new Filtro('hp').poner(3800, 0.7), hr = new Filtro('hp').poner(4100, 0.7);
  for (let i = 0; i < n; i++) { const t = i / SR, e = Math.exp(-t * (o.decae || 2.2)) * Math.min(1, t / 0.002); L[i] = hl.paso(r() * 2 - 1) * e * 0.7; R[i] = hr.paso(r() * 2 - 1) * e * 0.7; }
  return { L, R };
}
// Campana: parciales inarmónicos que se apagan
function campana(f, o = {}) {
  const d = o.dur || 2.2, n = muestras(d), b = new Float32Array(n), P = [[1, 1, 1.6], [2.76, 0.45, 2.6], [5.4, 0.22, 3.8], [8.93, 0.1, 5.5]];
  for (let i = 0; i < n; i++) { const t = i / SR; let s = 0; for (const p of P) s += Math.sin(TAU * f * p[0] * t) * p[1] * Math.exp(-t * p[2] * (o.corta ? 3 : 1)); b[i] = s * Math.min(1, t / 0.002) * 0.5; }
  return b;
}
function bombo() {
  const n = muestras(0.5), b = new Float32Array(n), r = azar(17); let fase = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, f = 44 + 120 * Math.exp(-t * 36); fase += TAU * f / SR; const click = t < 0.004 ? (r() * 2 - 1) * (1 - t / 0.004) * 0.6 : 0; b[i] = Math.tanh((Math.sin(fase) * Math.exp(-t * 7) + click) * 1.7); }
  return b;
}
function caja() {
  const n = muestras(0.35), b = new Float32Array(n), r = azar(19), bp = new Filtro('bp').poner(1900, 0.8), hp = new Filtro('hp').poner(700); let fase = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; fase += TAU * (190 - 30 * t) / SR; b[i] = Math.tanh((Math.sin(fase) * Math.exp(-t * 18) * 0.7 + hp.paso(bp.paso(r() * 2 - 1)) * Math.exp(-t * 15) * 2.4) * 1.3); }
  return b;
}
function palmas() {
  const n = muestras(0.4), b = new Float32Array(n), r = azar(23), bp = new Filtro('bp').poner(1250, 1.1);
  for (let i = 0; i < n; i++) { const t = i / SR, e = [0, 0.011, 0.023].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 90) : 0), 0) + (t > 0.023 ? Math.exp(-(t - 0.023) * 12) * 0.5 : 0); b[i] = bp.paso(r() * 2 - 1) * e * 2.2; }
  return b;
}
function hihat(abierto) {
  const n = muestras(abierto ? 0.5 : 0.08), b = new Float32Array(n), r = azar(29), hp = new Filtro('hp').poner(7200, 0.8);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = hp.paso(r() * 2 - 1) * Math.exp(-t * (abierto ? 7 : 55)) * 0.8; }
  return b;
}
function tambor(f0 = 110) {
  const n = muestras(0.9), b = new Float32Array(n), r = azar(31), lp = new Filtro('lp').poner(900); let fase = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, f = f0 * (0.62 + 0.38 * Math.exp(-t * 16)); fase += TAU * f / SR; b[i] = Math.tanh((Math.sin(fase) * Math.exp(-t * 4.5) + lp.paso(r() * 2 - 1) * Math.exp(-t * 22) * 0.9) * 1.6); }
  return b;
}
// Bajo: dos sierras con el filtro que se cierra en cada nota
function bajo(m, d) {
  const n = muestras(d), b = new Float32Array(n), f = hz(m), lp = new Filtro('lp'); let a = 0, c = 0.37, s = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; if ((i & 15) === 0) lp.poner(180 + 1100 * Math.exp(-t * 18), 1.4);
    a += f / SR; if (a >= 1) a -= 1; c += f * 1.004 / SR; if (c >= 1) c -= 1; s += TAU * f / SR;
    b[i] = Math.tanh((lp.paso((2 * a - 1) + (2 * c - 1)) * 0.6 + Math.sin(s) * 0.32) * 1.4) * Math.exp(-t * 3) * Math.min(1, t / 0.003, (d - t) / 0.01);
  }
  return b;
}
// Punteo del ostinato
function punteo(m, d, brillo = 1) {
  const n = muestras(d), b = new Float32Array(n), f = hz(m), lp = new Filtro('lp'); let a = 0, q = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; if ((i & 15) === 0) lp.poner(350 + 2600 * brillo * Math.exp(-t * 22), 2);
    a += f / SR; if (a >= 1) a -= 1; q += f * 2.002 / SR; if (q >= 1) q -= 1;
    b[i] = lp.paso((2 * a - 1) * 0.7 + (q < 0.5 ? 0.3 : -0.3)) * Math.exp(-t * 11) * Math.min(1, t / 0.002, (d - t) / 0.01);
  }
  return b;
}
// Destello: arpegio agudo de campanitas (el techo que se abre)
function brillos(notas, paso) {
  const d = notas.length * paso + 1.8, n = muestras(d), L = new Float32Array(n), R = new Float32Array(n);
  notas.forEach((m, k) => { const c = campana(hz(m), { dur: 1.6 }), i0 = Math.round(k * paso * SR), p = k % 2 ? 0.75 : 0.25; for (let i = 0; i < c.length && i0 + i < n; i++) { L[i0 + i] += c[i] * (1 - p) * 0.5; R[i0 + i] += c[i] * p * 0.5; } });
  return { L, R };
}
// Burbuja de chat: un «tin» corto
function tin(f) { const n = muestras(0.12), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = (Math.sin(TAU * f * t) + Math.sin(TAU * f * 1.5 * t) * 0.3) * Math.exp(-t * 38) * Math.min(1, t / 0.002); } return b; }
// Tic mecánico
function tic() { const n = muestras(0.05), b = new Float32Array(n), r = azar(41), bp = new Filtro('bp').poner(3200, 3); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = bp.paso(r() * 2 - 1) * Math.exp(-t * 120) * 3; } return b; }
// Zumbido que recorre el hilo del motor
function zumbido(d) {
  const n = muestras(d), L = new Float32Array(n), R = new Float32Array(n), r = azar(43), bp = new Filtro('bp'); let fase = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n; fase += TAU * (300 * Math.pow(8, u)) / SR; if ((i & 31) === 0) bp.poner(500 * Math.pow(10, u), 4);
    const s = (Math.sin(fase) * 0.4 + Math.sin(fase * 2.01) * 0.2 + bp.paso(r() * 2 - 1) * 1.2) * Math.sin(Math.PI * u) * 0.8;
    L[i] = s * (1 - u * 0.6); R[i] = s * (0.4 + u * 0.6);
  }
  return { L, R };
}
// «Blup»: Plotty que aparece
function blup() { const n = muestras(0.22), b = new Float32Array(n); let fase = 0; for (let i = 0; i < n; i++) { const t = i / SR; fase += TAU * (260 + 900 * Math.pow(t / 0.22, 0.6)) / SR; b[i] = Math.sin(fase) * Math.sin(Math.PI * t / 0.22) * 0.8; } return b; }

/* ───────── La voz de cada personaje: sílabas balbuceadas con sus vocales ───────── */
const FORMANTES = { a: [800, 1250, 2600], e: [430, 1950, 2600], i: [310, 2300, 3000], o: [480, 860, 2500], u: [340, 720, 2400] };
const VOCAL = { a: 'a', á: 'a', e: 'e', é: 'e', i: 'i', í: 'i', o: 'o', ó: 'o', u: 'u', ú: 'u', ü: 'u' };
function silaba(f0, vocal, d, timbre, r, subeFin) {
  const n = muestras(d), b = new Float32Array(n), F = FORMANTES[vocal], mueve = timbre === 'voz' || timbre === 'nasal' ? 1 : timbre === 'filtro' ? 0.92 : 1;
  const k = timbre === 'nasal' ? 1.12 : timbre === 'motor' ? 0.9 : 1;
  const f1 = new Filtro('bp').poner(F[0] * k * mueve, 3), f2 = new Filtro('bp').poner(F[1] * k * mueve, 4.5), f3 = new Filtro('bp').poner(F[2] * k, 6), nas = new Filtro('pk').poner(2400, 3, 9);
  const cuerpo = new Filtro('lp').poner(3200, 0.7);
  const glide = (r() - 0.5) * 0.08 + (subeFin ? 0.35 : 0);
  let fase = 0, fase2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, u = t / d, f = f0 * (1 + glide * u) * (1 + 0.012 * Math.sin(t * 38));
    fase += f / SR; if (fase >= 1) fase -= 1; fase2 += f * 2.003 / SR; if (fase2 >= 1) fase2 -= 1;
    let y;
    if (timbre === 'robot') { const cuad = fase < 0.5 ? 1 : -1; y = Math.round((cuad * 0.35 + f2.paso(cuad) * 0.9) * 10) / 10; }
    else if (timbre === 'cristal') y = Math.sin(TAU * fase) * 0.5 + Math.sin(TAU * fase2) * 0.25 + f2.paso(Math.sin(TAU * fase)) * 0.4;
    else {
      const pulso = (2 * fase - 1) * 0.6 + (fase < 0.25 ? 0.5 : -0.1);
      y = f1.paso(pulso) * 1.3 + f2.paso(pulso) * 1.0 + f3.paso(pulso) * 0.35 + cuerpo.paso(pulso) * 0.12;
      if (timbre === 'nasal') y = nas.paso(y) * 0.8;
      if (timbre === 'motor') y *= 0.55 + 0.45 * Math.sin(TAU * 34 * t);
      if (timbre === 'filtro') y = y * 0.7 + f2.paso(y) * 0.6;
    }
    b[i] = y * Math.min(1, t / 0.007) * Math.min(1, Math.max(0, (d - t) / 0.028));
  }
  return b;
}
// Una línea hablada: una sílaba por grupo de vocales, al tiempo en que se escribe cada letra
function hablar(linea, t0, letras, voz, semilla) {
  const r = azar(semilla), eventos = [], txt = linea.toLowerCase();
  for (let c = 0; c < txt.length; c++) {
    const v = VOCAL[txt[c]];
    if (v && !VOCAL[txt[c - 1]]) eventos.push({ t: t0 + c / letras, v });
  }
  const pregunta = /\?\s*$/.test(linea), sal = [];
  eventos.forEach((e, k) => {
    const sig = eventos[k + 1] ? eventos[k + 1].t : e.t + 0.14, d = Math.min(0.13, Math.max(0.055, (sig - e.t) * 0.92));
    const decl = 1.06 - 0.14 * (k / Math.max(1, eventos.length - 1)), sube = pregunta && k >= eventos.length - 2;
    const f0 = voz.tono * decl * (1 + (r() - 0.5) * 0.12) * (sube ? 1.18 : 1);
    sal.push({ t: e.t, b: silaba(f0, e.v, d, voz.timbre, r, sube) });
  });
  let e2 = 0, cuenta = 0;
  for (const x of sal) for (let i = 0; i < x.b.length; i++) { e2 += x.b[i] * x.b[i]; cuenta++; }
  const g = (voz.volumen || 0.16) / Math.sqrt(e2 / Math.max(1, cuenta));
  for (const x of sal) for (let i = 0; i < x.b.length; i++) x.b[i] = Math.tanh(x.b[i] * g * 1.4) / 1.4;
  return sal;
}

/* ───────── La sala (reverberación tipo Freeverb) ───────── */
function sala(L, R, o = {}) {
  const e = SR / 44100, CT = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], AT = [556, 441, 341, 225], abre = Math.round(23 * e);
  const tam = o.tam ?? 0.87, amort = o.amort ?? 0.32;
  function canal(x, extra) {
    const n = x.length, y = new Float32Array(n);
    const cb = CT.map((t) => new Float32Array(Math.round(t * e) + extra)), ci = new Int32Array(8), cf = new Float64Array(8);
    const ab = AT.map((t) => new Float32Array(Math.round(t * e) + extra)), ai = new Int32Array(4);
    for (let i = 0; i < n; i++) {
      const ent = x[i] * 0.015; let s = 0;
      for (let k = 0; k < 8; k++) { const buf = cb[k], j = ci[k], v = buf[j]; cf[k] = v * (1 - amort) + cf[k] * amort; buf[j] = ent + cf[k] * tam; ci[k] = j + 1 === buf.length ? 0 : j + 1; s += v; }
      for (let k = 0; k < 4; k++) { const buf = ab[k], j = ai[k], v = buf[j], out = -s + v; buf[j] = s + v * 0.5; ai[k] = j + 1 === buf.length ? 0 : j + 1; s = out; }
      y[i] = s;
    }
    return y;
  }
  return { L: canal(L, 0), R: canal(R, abre) };
}

/* ───────── La partitura ───────── */
export function componer(G, opciones = {}) {
  const total = G.total + 2.5, n = muestras(total);
  const M = { L: new Float32Array(n), R: new Float32Array(n) };      // música
  const V = { L: new Float32Array(n), R: new Float32Array(n) };      // voces (no se agachan)
  const S = { L: new Float32Array(n), R: new Float32Array(n) };      // envío a la sala
  const P = G.PULSO, C = G.COMPAS, r = azar(2027);
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
  const K = bombo(), SN = caja(), CL = palmas(), HC = hihat(false), HO = hihat(true), CR = platillo(2.8), CRc = platillo(1.2, { decae: 4, semilla: 14 });

  /* Intro: dron, un golpe por frase, avisos y la subida */
  poner(colchon([nota('C1'), nota('G1'), nota('C2'), nota('Eb2')], { dur: G.braam - 0.1, ataque: 2.5, suelta: 0.35, corte: 380 }), 0, 0.55, 0, 0.3);
  G.intro.forEach((c, i) => {
    const g = golpe({ dur: 2.2, semilla: 30 + i, caida: 60, decae: 1.8 });
    poner(g, c.t, i === 0 ? 0.35 : 0.6, 0, 0.35);
    poner(campana(hz(nota(i === 3 ? 'G5' : 'C6'))), c.t, 0.16, (i - 1.5) * 0.3, 0.6);
    if (c.segunda) { poner(golpe({ dur: 1.6, semilla: 40 + i, caida: 50 }), c.segunda, 0.45, 0, 0.35); poner(campana(hz(nota(i === 3 ? 'C6' : 'Eb6'))), c.segunda, 0.2, 0.2, 0.6); }
  });
  for (let i = 0; i < 12; i++) poner(tin(1500 + (i % 4) * 230), 4.86 + i * 0.085, 0.12, i % 2 ? 0.5 : -0.5, 0.2);
  for (let j = 0; j < 7; j++) poner(tic(), 6.05 + j * 0.13, 0.25, 0, 0.15);
  poner(subida(G.braam - 0.15 - 7.2, { hasta: 9000 }), 7.2, 0.55, 0, 0.25);
  poner(bombo(), 8.4, 0.5); poner(colchon([nota('C4'), nota('G4'), nota('C5')], { dur: 1.05, ataque: 0.02, suelta: 0.4, corte: 3000 }), G.intro[3].segunda, 0.18, 0, 0.5);

  /* La oficina: braam, el techo que se abre, BiPlot HQ */
  poner(braam([nota('C2'), nota('G2'), nota('C3'), nota('Eb3')], { dur: 3.6, semilla: 51 }), G.braam, 0.7, 0, 0.4);
  poner(golpe({ dur: 3, semilla: 52, caida: 90, decae: 1.2 }), G.braam, 0.9, 0, 0.3);
  poner(CR, G.braam, 0.35, 0, 0.3);
  poner(brillos([nota('C6'), nota('Eb6'), nota('G6'), nota('Bb6'), nota('C7'), nota('Eb7')], 0.07), G.techo, 0.35, 0, 0.7);
  poner(subida(0.9, { desde: 1500, hasta: 12000, semilla: 53 }), G.techo - 0.1, 0.18, 0, 0.3);
  poner(braam([nota('Ab1'), nota('Eb2'), nota('Ab2'), nota('C3')], { dur: 2.6, semilla: 54, abre: 3000 }), G.titulo, 0.62, 0, 0.45);
  poner(golpe({ dur: 2.4, semilla: 55, caida: 80 }), G.titulo, 0.85, 0, 0.3);
  poner(CR, G.titulo, 0.3, 0, 0.3);
  poner(colchon([nota('C3'), nota('Eb3'), nota('G3'), nota('C4')], { dur: G.equipo - G.titulo + 0.4, ataque: 1.2, suelta: 0.5, corte: 1100 }), G.titulo, 0.3, 0, 0.4);
  for (let k = 0; k < 8; k++) poner(punteo(nota(['C4', 'G4', 'C5', 'Eb5'][k % 4]), P / 4 * 0.95, 0.25 + k * 0.05), G.conoce + k * P / 4 * 2, 0.08 + k * 0.012, -0.2, 0.3);
  [0, 1, 2].forEach((k) => poner(tambor(95 + k * 12), G.equipo - P / 4 * (3 - k), 0.32 + k * 0.08, (k - 1) * 0.4, 0.2));
  poner(soplido(0.6, { semilla: 56 }), G.equipo - 0.55, 0.45, 0, 0.2);

  /* El equipo: i–VI–III–VII, y al final V para tensar */
  const ACORDES = [['C', 'Eb', 'G'], ['Ab', 'C', 'Eb'], ['Eb', 'G', 'Bb'], ['Bb', 'D', 'F']];
  const BAJOS = { C: 'C2', Ab: 'Ab1', Eb: 'Eb2', Bb: 'Bb1', G: 'G1' };
  const tonos = (a, oct) => a.map((x, j) => nota(x + (oct + (j && nota(x + '4') < nota(a[0] + '4') ? 1 : 0))));
  const PATRON = [0, 2, 3, 4, 2, 3, 4, 5, 0, 2, 3, 4, 5, 4, 3, 2];
  G.EQUIPO.forEach((p, s) => {
    const t0 = p.t, nivel = s < 2 ? 1 : s < 6 ? 2 : 3, ult = s === G.EQUIPO.length - 1;
    const acorde = ult ? ['G', 'B', 'D'] : ACORDES[s % 4];
    // El corte: golpe, platillo corto y el soplido que lo anuncia (salvo el primero, que ya viene de la oficina)
    poner(golpe({ dur: 1.8, semilla: 60 + s, caida: 70, decae: 2.2, fondo: 38 }), t0, 0.5, 0, 0.3);
    poner(s % 3 === 0 ? CR : CRc, t0, 0.22, 0, 0.3);
    if (s) poner(soplido(0.55, { semilla: 70 + s, izq: s % 2 === 1 }), t0 - 0.5, 0.4, 0, 0.15);
    // El nombre cae de golpe
    poner(caja(), t0 + 0.3, 0.35, 0, 0.35); poner(golpe({ dur: 0.8, semilla: 80 + s, caida: 40, decae: 5, fondo: 45 }), t0 + 0.3, 0.3, 0, 0.2);
    // Colchón y bajo
    const tt = tonos(acorde, 3);
    poner(colchon(tt.concat([tt[0] + 12]), { dur: G.DURA + 0.3, ataque: 0.5, suelta: 0.5, corte: 1200 + nivel * 600, semilla: 90 + s }), t0, 0.2 + nivel * 0.05, 0, 0.35);
    if (nivel >= 2) poner(colchon(tonos(acorde, 5), { dur: G.DURA + 0.3, ataque: 1.2, suelta: 0.8, corte: 5200, semilla: 95 + s }), t0, 0.05 + nivel * 0.025, 0, 0.5);
    const raiz = nota(BAJOS[acorde[0]]);
    for (let k = 0; k < 16; k++) { const tk = t0 + k * P / 2; if (ult && tk > t0 + G.DURA - 0.3) break; poner(bajo(raiz + (k % 8 === 7 ? 12 : 0), P / 2 * 0.95), tk, 0.3 * (k % 2 ? 0.8 : 1), 0, 0.05); }
    // Ostinato en semicorcheas, con eco
    const arp = tonos(acorde, 4).concat(tonos(acorde, 5));
    for (let k = 0; k < 32; k++) {
      const tk = t0 + k * P / 4; if (ult && tk > t0 + C + 0.1) break;
      const b = punteo(arp[PATRON[k % 16]], P / 4 * 0.95, 0.6 + nivel * 0.25), g = (0.15 + nivel * 0.04) * (k % 4 === 0 ? 1.2 : 1);
      poner(b, tk, g, -0.25, 0.25); poner(b, tk + P * 0.75, g * 0.35, 0.45, 0.3);
    }
    // Batería
    for (let k = 0; k < 8; k++) {
      const tk = t0 + k * P, enCompas = k % 4;
      if (ult && k >= 4) break;
      if (enCompas === 0 || (nivel >= 2 && enCompas === 2)) poner(K, tk, 0.75, 0);
      if (nivel >= 3 && enCompas === 1) poner(K, tk + P / 2, 0.55, 0);
      if (nivel >= 2 && enCompas % 2 === 1) poner(nivel >= 3 ? SN : CL, tk, nivel >= 3 ? 0.42 : 0.4, 0, 0.25);
      for (let h = 0; h < (nivel >= 3 ? 4 : 2); h++) poner(h === 2 && nivel >= 3 ? HO : HC, tk + h * P / (nivel >= 3 ? 4 : 2), (h % 2 ? 0.15 : 0.24) * (nivel === 1 ? 0.7 : 1), 0.3);
    }
    if (nivel >= 2 && !ult) [0, 1, 2].forEach((k) => poner(tambor(120 - k * 18), t0 + G.DURA - P / 4 * (3 - k), 0.3 + k * 0.08, (1 - k) * 0.4, 0.2));
    if (nivel >= 3) poner(golpe({ dur: 1.2, semilla: 100 + s, caida: 50, decae: 3 }), t0 + C, 0.35, 0, 0.2);
    // Su voz, mientras se escribe su línea
    hablar(p.linea, p.habla, p.letras, p.voz, 500 + s).forEach((e) => poner(e.b, e.t, 1, 0, 0.12, V));
    // El último arma la tensión: redoble y subida hasta el motor
    if (ult) {
      const t1 = t0 + C;
      for (let k = 0; k < 16; k++) { const tk = t1 + (k < 8 ? k * P / 2 : C / 2 + (k - 8) * P / 4); poner(SN, tk, 0.18 + k * 0.022, 0, 0.2); }
      poner(subida(C - 0.05, { semilla: 110 }), t1, 0.55, 0, 0.3);
      poner(colchon([nota('G2'), nota('D3'), nota('G3'), nota('B3')], { dur: C, ataque: 1.6, suelta: 0.05, corte: 1500 }), t1, 0.3, 0, 0.3);
    }
  });

  /* El motor: diez fases que suben */
  const tm = G.motor;
  poner(golpe({ dur: 2.2, semilla: 120, caida: 90 }), tm, 0.85, 0, 0.3); poner(CR, tm, 0.3, 0, 0.3);
  poner(braam([nota('Ab1'), nota('Eb2'), nota('Ab2')], { dur: 2.2, semilla: 121, abre: 1800 }), tm, 0.4, 0, 0.35);
  poner(caja(), tm + P, 0.4, 0, 0.3);
  const ESCALA = ['C5', 'D5', 'Eb5', 'F5', 'G5', 'Ab5', 'Bb5', 'C6', 'D6', 'Eb6'];
  ESCALA.forEach((x, i) => { const ti = G.motorPlacas + i * P / 2; poner(campana(hz(nota(x)), { dur: 0.9, corta: true }), ti, 0.2, (i % 2 ? 0.35 : -0.35), 0.4); poner(punteo(nota(x) - 12, 0.2, 1), ti, 0.14, 0, 0.2); });
  for (let k = 0; k < 8; k++) {
    const tk = tm + k * P; if (tk >= tm + 4.2) break;
    poner(K, tk, 0.72); if (k % 2 === 1) poner(SN, tk, 0.4, 0, 0.25);
    for (let h = 0; h < 4; h++) poner(h === 2 ? HO : HC, tk + h * P / 4, h % 2 ? 0.1 : 0.15, 0.3);
    const acorde = k < 4 ? ['Ab', 'C', 'Eb'] : ['Bb', 'D', 'F'];
    for (let h = 0; h < 4; h++) poner(bajo(nota(BAJOS[acorde[0]]) + (h === 3 ? 12 : 0), P / 4 * 0.9), tk + h * P / 4, 0.3);
  }
  poner(colchon(tonos(['Ab', 'C', 'Eb'], 3), { dur: C + 0.2, ataque: 0.3, suelta: 0.4, corte: 1400 }), tm, 0.22, 0, 0.35);
  poner(colchon(tonos(['Bb', 'D', 'F'], 3), { dur: 1.9, ataque: 0.3, suelta: 0.3, corte: 1600 }), tm + C, 0.22, 0, 0.35);
  const th = G.motorPlacas + 9 * P / 2 + 0.1;
  poner(zumbido(tm + 4.2 - th), th, 0.4, 0, 0.35);
  poner(golpe({ dur: 1.4, semilla: 122, caida: 60 }), tm + 4.2, 0.6, 0, 0.35);
  poner(colchon(tonos(['Bb', 'D', 'F'], 4), { dur: 0.6, ataque: 0.005, suelta: 0.5, corte: 3500 }), tm + 4.2, 0.2, 0, 0.6);

  /* Todos juntos: coro, tambores, redoble hasta el blanco */
  const te = G.elenco;
  poner(golpe({ dur: 2.4, semilla: 130, caida: 95 }), te, 0.9, 0, 0.35); poner(CR, te, 0.35, 0, 0.35);
  poner(colchon([nota('G2'), nota('D3'), nota('G3'), nota('B3'), nota('D4')], { dur: C + 0.1, ataque: 0.5, suelta: 0.1, coro: true, semilla: 131 }), te, 0.42, 0, 0.5);
  poner(braam([nota('G1'), nota('D2'), nota('G2')], { dur: C, semilla: 132, abre: 1500, suelta: 0.2 }), te, 0.35, 0, 0.3);
  for (let k = 0; k < 4; k++) poner(tambor(100 - (k % 2) * 20), te + k * P, 0.5, (k % 2 ? 0.3 : -0.3), 0.3);
  for (let k = 0; k < 24; k++) { const tk = te + C / 2 + k * (C / 2) / 24; poner(SN, tk, 0.12 + k * 0.014, 0, 0.2); }
  poner(subida(C - 0.06, { semilla: 133, hasta: 11000 }), te, 0.6, 0, 0.3);

  /* El cierre: el braam final, el acorde largo y la invitación */
  const tc = G.cierre;
  poner(braam([nota('C1'), nota('C2'), nota('G2'), nota('C3'), nota('Eb3')], { dur: 5.5, semilla: 140, abre: 3200, cierra: 1.1, suelta: 3 }), tc, 0.85, 0, 0.5);
  poner(golpe({ dur: 4, semilla: 141, caida: 100, decae: 0.9 }), tc, 1, 0, 0.35); poner(CR, tc, 0.45, 0, 0.45);
  poner(colchon([nota('C3'), nota('G3'), nota('Eb4'), nota('D5'), nota('G4')], { dur: G.remate - tc - 0.2, ataque: 1.5, suelta: 2.8, corte: 1600, semilla: 142 }), tc + 0.3, 0.32, 0, 0.5);
  poner(campana(hz(nota('G5'))), tc + C / 2, 0.16, -0.2, 0.6);
  poner(campana(hz(nota('C6'))), tc + C, 0.18, 0.2, 0.6);
  poner(colchon([nota('C5'), nota('Eb5'), nota('G5')], { dur: 0.7, ataque: 0.004, suelta: 0.6, corte: 4000 }), tc + C + 0.25, 0.16, 0, 0.6);

  /* El remate: Plotty */
  poner(blup(), G.remate + 0.28, 0.32, 0, 0.3);
  hablar(G.remateLinea, G.remateHabla, G.remateLetras, G.EQUIPO[0].voz, 999).forEach((e) => poner(e.b, e.t, 1, 0, 0.15, V));
  poner(campana(hz(nota('C7')), { dur: 1.4 }), G.remateHabla + G.remateLinea.length / G.remateLetras + 0.45, 0.12, 0.2, 0.5);

  /* Mezcla: la música se agacha cuando alguien habla; sala, un poco de saturación y el volumen final */
  const env = new Float32Array(n); let e = 0;
  for (let i = 0; i < n; i++) { const x = Math.abs(V.L[i]) + Math.abs(V.R[i]); e = x > e ? e + (x - e) * 0.02 : e * 0.99985; env[i] = e; }
  const rev = sala(S.L, S.R, { tam: 0.88, amort: 0.3 });
  const L = new Float32Array(n), R = new Float32Array(n), hpL = new Filtro('hp').poner(28, 0.7), hpR = new Filtro('hp').poner(28, 0.7);
  const eq = [0, 1].map(() => [new Filtro('pk').poner(48, 0.8, -4), new Filtro('pk').poner(170, 0.9, -2), new Filtro('pk').poner(2800, 0.8, 3.5), new Filtro('pk').poner(9500, 0.7, 4)]);
  const ecualizar = (x, c) => { for (const f of eq[c]) x = f.paso(x); return x; };
  // Arriba de 16,5 kHz no queda nada (el AAC corta ahí): así el limitador ve lo mismo que se va a escuchar
  const lp = [0, 1].map(() => [new Filtro('lp').poner(16500, 0.5412), new Filtro('lp').poner(16500, 1.3066)]);
  const recortar = (x, c) => lp[c][1].paso(lp[c][0].paso(x));
  for (let i = 0; i < n; i++) {
    const agacha = 1 - 0.58 * Math.min(1, env[i] * 6);
    const l = (M.L[i] * agacha + rev.L[i] * 2.4 * (0.75 + 0.25 * agacha)) * 0.9 + V.L[i], rr = (M.R[i] * agacha + rev.R[i] * 2.4 * (0.75 + 0.25 * agacha)) * 0.9 + V.R[i];
    L[i] = recortar(Math.tanh(ecualizar(hpL.paso(l), 0) * 1.15), 0); R[i] = recortar(Math.tanh(ecualizar(hpR.paso(rr), 1) * 1.15), 1);
  }
  // El volumen: -14 LUFS, como piden las redes, y los picos reales bajo -2,5 dBTP para que el AAC tampoco pase de 0.
  // El limitador baja un poco la sonoridad, así que se mide de nuevo y se corrige (dos o tres vueltas)
  const fin = muestras(G.total), fu = muestras(0.4), L0 = Float32Array.from(L), R0 = Float32Array.from(R);
  let ganancia = 1;
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    const falta = SONORIDAD - sonoridad(L.subarray(0, fin), R.subarray(0, fin));
    if (vuelta > 0 && Math.abs(falta) < 0.05) break;   // (la primera vuelta siempre limita)
    ganancia *= Math.pow(10, falta / 20);
    for (let i = 0; i < n; i++) { L[i] = L0[i] * ganancia; R[i] = R0[i] * ganancia; }
    limitar(L, R, TECHO);
  }
  // Al final, un fundido corto para que no corte en seco
  for (let i = 0; i < n; i++) { const k = i < fin - fu ? 1 : Math.max(0, (fin - i) / fu); L[i] *= k; R[i] *= k; }
  const salida = { sr: SR, L: L.subarray(0, fin), R: R.subarray(0, fin) };
  // Para revisar la mezcla: la música y las voces por separado
  if (opciones.pistas) salida.pistas = { musica: M, voces: V };
  return salida;
}

/* ───────── El volumen final ───────── */

const SONORIDAD = -14, TECHO = Math.pow(10, -2.5 / 20);

// Sonoridad integrada en LUFS (ITU-R BS.1770): ponderación K (sus coeficientes a 48 kHz), bloques de 400 ms cada
// 100 ms y las compuertas de -70 LUFS y de 10 LU bajo el promedio
function sonoridad(L, R) {
  const paso = SR / 10, tramos = Math.floor(L.length / paso), cuad = new Float64Array(tramos + 1);
  for (const x of [L, R]) {
    const f1 = new Filtro().coef(1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, 0.73248077421585);
    const f2 = new Filtro().coef(1, -2, 1, -1.99004745483398, 0.99007225036621);
    for (let i = 0; i < tramos * paso; i++) { const y = f2.paso(f1.paso(x[i])); cuad[Math.floor(i / paso)] += y * y; }
  }
  const bloques = [];
  for (let j = 0; j + 4 <= tramos; j++) bloques.push((cuad[j] + cuad[j + 1] + cuad[j + 2] + cuad[j + 3]) / (4 * paso));
  const lufs = (z) => -0.691 + 10 * Math.log10(z), media = (a) => a.reduce((s, z) => s + z, 0) / a.length;
  const sobre70 = bloques.filter((z) => lufs(z) > -70), umbral = lufs(media(sobre70)) - 10;
  return lufs(media(sobre70.filter((z) => lufs(z) > umbral)));
}

// Limitador de picos reales: busca los picos también entre muestras (interpola a ×4, como un medidor de picos reales),
// baja el volumen desde 1,5 ms antes de cada uno para que llegue justo al techo y lo devuelve en unos 80 ms
function limitar(L, R, techo) {
  const n = L.length, ANT = Math.round(SR * 0.0015), VUELTA = 1 - Math.exp(-1 / (SR * 0.08));
  // El interpolador: seno cardinal con ventana de Hann, 16 muestras, en 1/4, 2/4 y 3/4 del camino a la siguiente
  const fases = [0.25, 0.5, 0.75].map((f) => {
    const h = []; for (let k = -7; k <= 8; k++) { const t = k - f; h.push(Math.sin(Math.PI * t) / (Math.PI * t) * (0.5 + 0.5 * Math.cos(Math.PI * t / 8.5))); }
    const s = h.reduce((a, b) => a + b, 0); return h.map((v) => v / s);
  });
  // Cuánto hay que bajar en cada muestra para que ni ella ni lo que viene hasta la siguiente pase del techo
  const pide = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let p = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    if (i >= 7 && i + 8 < n) for (const h of fases) {
      let a = 0, b = 0; for (let k = 0; k < 16; k++) { a += L[i - 7 + k] * h[k]; b += R[i - 7 + k] * h[k]; }
      p = Math.max(p, Math.abs(a), Math.abs(b));
    }
    pide[i] = p > techo ? techo / p : 1;
  }
  // Mirando adelante: en cada muestra, lo más bajo que piden las próximas ANT (una cola de mínimos)
  const antes = new Float32Array(n), cola = new Int32Array(n); let cab = 0, pie = 0;
  for (let i = n - 1; i >= 0; i--) {
    while (pie > cab && pide[cola[pie - 1]] >= pide[i]) pie--;
    cola[pie++] = i;
    while (cola[cab] > i + ANT) cab++;
    antes[i] = pide[cola[cab]];
  }
  // Baja de inmediato y sube despacio; un promedio de ANT + 1 muestras suaviza la bajada y llega al pico ya abajo
  let e = 1, suma = 0; const g = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    e = antes[i] < e ? antes[i] : e + (antes[i] - e) * VUELTA; g[i] = e;
    suma += e; if (i > ANT) suma -= g[i - ANT - 1];
    const k = suma / Math.min(i + 1, ANT + 1); L[i] *= k; R[i] *= k;
  }
}

// WAV estéreo de 16 bits
export function escribirWav(ruta, a) {
  const n = a.L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(a.sr, 24); b.writeUInt32LE(a.sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, a.L[i])) * 32767), 44 + i * 4);
    b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, a.R[i])) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(ruta, b);
}
