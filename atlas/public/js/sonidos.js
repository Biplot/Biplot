// Los sonidos de Atlas: notas cortas hechas con Web Audio (sin archivos). Suenan desde el primer toque en la página.
const NOTAS = {
  despertar: [[261.63, 0, 0.5, 'triangle', 0.05], [523.25, 0.5, 0.18], [659.25, 0.64, 0.18], [783.99, 0.78, 0.4]],
  atento: [[880, 0, 0.08]],
  asentir: [[660, 0, 0.06], [660, 0.14, 0.06]],
  encontrado: [[1318.5, 0, 0.3, 'triangle']],
  duda: [[659.25, 0, 0.12], [523.25, 0.16, 0.22]],
  esperando: [[783.99, 0, 0.12], [1046.5, 0.16, 0.22]],
  success: [[523.25, 0, 0.5], [659.25, 0.04, 0.5], [783.99, 0.08, 0.5]],
  error: [[196, 0, 0.16, 'square', 0.025], [174.6, 0.2, 0.22, 'square', 0.025]],
  alerta: [[440, 0, 0.18, 'triangle'], [349.23, 0.24, 0.26, 'triangle']],
  alegre: [[659.25, 0, 0.08], [783.99, 0.08, 0.08], [1046.5, 0.16, 0.18]],
  celebrar: [[523.25, 0, 0.1], [659.25, 0.1, 0.1], [783.99, 0.2, 0.1], [1046.5, 0.3, 0.3], [1318.5, 0.44, 0.4]],
  dormir: [[392, 0, 0.35], [261.63, 0.32, 0.6]],
  buenasnoches: [[783.99, 0, 0.4], [659.25, 0.36, 0.4], [523.25, 0.72, 0.9]],
  preocupado: [[392, 0, 0.3], [311.13, 0.26, 0.5]],
  risa: [[783.99, 0, 0.07, 'triangle'], [880, 0.12, 0.07, 'triangle'], [783.99, 0.24, 0.07, 'triangle'], [987.77, 0.36, 0.12, 'triangle']]
};

let audio = null;
export function encenderAudio() {
  try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume?.(); } catch { audio = null; }
}

export function sonar(clave) {
  const lista = NOTAS[clave];
  if (!lista || !audio || audio.state !== 'running') return;
  const t0 = audio.currentTime + 0.02;
  for (const [frec, ini, dur, tipo = 'sine', vol = 0.07] of lista) {
    const osc = audio.createOscillator(), gan = audio.createGain();
    osc.type = tipo; osc.frequency.value = frec;
    gan.gain.setValueAtTime(0, t0 + ini);
    gan.gain.linearRampToValueAtTime(vol, t0 + ini + 0.015);
    gan.gain.exponentialRampToValueAtTime(0.0001, t0 + ini + dur);
    osc.connect(gan).connect(audio.destination);
    osc.start(t0 + ini); osc.stop(t0 + ini + dur + 0.05);
  }
}
