/* ============ CONSULTAS: el formulario y Plotty también las mandan a BiPlot ============
   La portada, el contacto y Plotty (oficina/) mandan la consulta a la bandeja de consultas de BiPlot, además de abrir
   WhatsApp como siempre. Las etiquetas utm_* de la dirección por la que entró la persona se guardan al llegar
   (sessionStorage), así siguen ahí si navega antes de escribir. Nunca bloquea: si no responde, WhatsApp abre igual.
   Se usa como window.BiplotConsulta.enviar({ nombre, correo, telefono, empresa, mensaje, origen, sitio }). */
(function () {
  'use strict';
  // La única dirección que cambia cuando la bandeja tenga su propio dominio.
  var DESTINO = 'https://biplot-crm.vercel.app/api/leads';
  var LLAVE = 'biplot-utm';
  var ETIQUETAS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  var ESPERA_MS = 8000;

  // Al llegar: si la dirección trae etiquetas, se guardan (las de un enlace nuevo reemplazan a las anteriores).
  try {
    var q = new URLSearchParams(location.search), e = {}, hay = false;
    ETIQUETAS.forEach(function (k) { var v = q.get(k); if (v) { e[k] = v.slice(0, 80); hay = true; } });
    if (hay) sessionStorage.setItem(LLAVE, JSON.stringify(e));
  } catch (_) { /* sin sessionStorage (modo privado estricto): sin etiquetas */ }

  function etiquetas() {
    var r = {};
    try {
      var e = JSON.parse(sessionStorage.getItem(LLAVE) || '{}');
      ETIQUETAS.forEach(function (k) { if (typeof e[k] === 'string' && e[k]) r[k] = e[k].slice(0, 80); });
    } catch (_) { /* nada que agregar */ }
    return r;
  }

  var texto = function (v, max) { return String(v == null ? '' : v).trim().slice(0, max); };
  // Un correo que la bandeja no aceptaría («juan@gmail») no se manda: así la consulta llega igual, sin él.
  var correoValido = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? v : ''; };

  /* Devuelve una promesa que nunca falla: { ok: true } o { ok: false, error? }. */
  function enviar(d) {
    if (!window.fetch) return Promise.resolve({ ok: false });
    var cuerpo = {
      nombre: texto(d.nombre, 120),
      correo: correoValido(texto(d.correo, 200)),
      telefono: texto(d.telefono, 40),
      empresa: texto(d.empresa, 120),
      mensaje: texto(d.mensaje, 3000),
      origen: d.origen === 'oficina' ? 'oficina' : 'landing',
      sitio: texto(d.sitio, 200)
    };
    var et = etiquetas();
    for (var k in et) cuerpo[k] = et[k];
    var ctrl = window.AbortController ? new AbortController() : null;
    var reloj = ctrl ? setTimeout(function () { ctrl.abort(); }, ESPERA_MS) : 0;
    return fetch(DESTINO, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok !== false, error: typeof j.error === 'string' ? j.error : '' }; });
      })
      .catch(function () { return { ok: false }; })
      .then(function (r) { if (reloj) clearTimeout(reloj); return r; });
  }

  window.BiplotConsulta = { enviar: enviar };
})();
