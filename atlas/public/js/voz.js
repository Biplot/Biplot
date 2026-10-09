// La voz: Atlas habla con la síntesis del navegador (frase por frase, a medida que llega la respuesta) y escucha con
// su reconocimiento de voz (Chrome, Edge y Safari del iPhone). Cada palabra que dice o que oye hace latir el plasma.

// ── Hablar ──
export function crearVoz({ alLatir, alEmpezar, alTerminar }) {
  const disponible = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let elegida = null, cola = 0, desbloqueada = false, generacion = 0;
  const voces = () => (disponible ? speechSynthesis.getVoices().filter((v) => /^es/i.test(v.lang)) : []);
  const porDefecto = () => {
    const v = voces();
    return v.find((x) => /cl/i.test(x.lang)) ?? v.find((x) => /(419|mx|us)/i.test(x.lang)) ?? v.find((x) => /es-es/i.test(x.lang)) ?? v[0] ?? null;
  };
  function elegir(nombre) { elegida = voces().find((v) => v.name === nombre) ?? null; }

  // iOS sólo deja hablar después de un toque: una frase vacía en ese toque la destraba
  function desbloquear() {
    if (!disponible || desbloqueada) return;
    desbloqueada = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch { /* sin voz: Atlas igual escribe */ }
  }

  // Dice una frase; devuelve una promesa que se cumple cuando termina (o si no hay voz, al rato que tomaría leerla)
  function decir(texto) {
    const mia = generacion;
    const lectura = Math.max(900, texto.split(/\s+/).length * 330);
    if (!disponible || !texto.trim()) return new Promise((r) => setTimeout(r, disponible ? 0 : lectura));
    return new Promise((listo) => {
      const u = new SpeechSynthesisUtterance(texto);
      const voz = elegida ?? porDefecto();
      u.lang = voz?.lang ?? 'es-CL'; if (voz) u.voice = voz;
      u.rate = 1.04; u.pitch = 0.95;
      let hecho = false, palabras = false;
      const fin = () => {
        if (hecho) return;
        hecho = true;
        // Las frases de antes de un «callar» ya no cuentan
        if (mia === generacion) { cola = Math.max(0, cola - 1); if (cola === 0) alTerminar?.(); }
        listo();
      };
      u.onstart = () => { if (cola === 1 || !palabras) alEmpezar?.(); };
      u.onboundary = () => { palabras = true; alLatir?.(); };
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, lectura + 2500);                        // por si el navegador nunca avisa que terminó
      cola++;
      try { speechSynthesis.speak(u); } catch { fin(); }
    });
  }
  function callar() {
    generacion++;
    if (disponible) speechSynthesis.cancel();
    cola = 0;
  }
  return { disponible, voces, porDefecto, elegir, desbloquear, decir, callar, hablando: () => cola > 0 };
}

// ── Escuchar ──
export function crearOido({ alOir, alTerminar, alFallar }) {
  const Reconocer = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, ultimo = '';
  function escuchar() {
    if (!Reconocer || rec) return false;
    ultimo = '';
    rec = new Reconocer();
    rec.lang = 'es-CL';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let texto = '', final = false;
      for (const r of e.results) { texto += r[0].transcript; final ||= r.isFinal; }
      ultimo = texto.trim();
      alOir?.(ultimo, final);
    };
    rec.onerror = (e) => alFallar?.(e.error);
    rec.onend = () => { rec = null; alTerminar?.(ultimo); };
    try { rec.start(); } catch { rec = null; return false; }
    return true;
  }
  function parar() { try { rec?.stop(); } catch { /* ya paró */ } }
  function cancelar() { if (rec) { rec.onend = null; try { rec.abort(); } catch { /* ya paró */ } rec = null; } }
  return { disponible: Boolean(Reconocer), escuchar, parar, cancelar, escuchando: () => Boolean(rec) };
}
