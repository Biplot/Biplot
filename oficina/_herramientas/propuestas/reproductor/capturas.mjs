#!/usr/bin/env node
// Las fotos de la propuesta del reproductor de BiPlot.TV: la oficina en el canal, con la maqueta (reproductor.js y .css)
// encima, en sus tres versiones (remoto, control, historias), en el computador (1440 × 900) y en el celular (390 × 844).
// También fotografía cómo es hoy (el video solo, en grande). Las fotos van a SALIDA, nunca al repo.
//
//   WEBM=<carpeta con copias .webm de los videos> SALIDA=/tmp/reproductor node oficina/_herramientas/propuestas/reproductor/capturas.mjs [remoto control historias hoy]
//
// WEBM hace falta donde Chromium no trae H.264 (la nube): sin eso, los videos salen vacíos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { servir } from './servidor.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = process.env.SALIDA || '/tmp/reproductor';
fs.mkdirSync(SALIDA, { recursive: true });
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));
const srv = await servir();
const nav = await chromium.launch({ executablePath: process.env.NAVEGADOR || '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
const quiero = process.argv.slice(2).length ? process.argv.slice(2) : ['hoy', 'remoto', 'control', 'historias'];
const PC = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const CEL = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

async function sala(ctx, modo) {
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => console.log('  error:', e.message));
  await pg.goto(srv.url + '#tv');
  await pg.waitForFunction(() => document.documentElement.classList.contains('lista') && document.body.classList.contains('en-sala-propia'), null, { timeout: 30000 });
  await pg.waitForTimeout(1800);
  if (modo !== 'hoy') {
    await pg.addStyleTag({ path: path.join(aqui, 'reproductor.css') });
    await pg.evaluate((m) => { window.REPRODUCTOR = m; localStorage.removeItem('oficina-tv-punto'); localStorage.removeItem('oficina-tv-desliza'); }, modo);
    await pg.addScriptTag({ path: path.join(aqui, 'reproductor.js') });
  }
  return pg;
}
const foto = async (pg, nombre) => { await pg.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }); await pg.screenshot({ path: path.join(SALIDA, nombre + '.png') }); console.log('  ' + nombre); };
// El video listo en ese segundo (y andando, salvo que se pida quieto)
async function en(pg, t, quieto) {
  await pg.waitForFunction(() => RP.video().readyState >= 1, null, { timeout: 15000 });
  await pg.evaluate(async ([t, quieto]) => {
    const v = RP.video(); if (t < 0) t = v.duration + t;
    await new Promise((r) => { v.addEventListener('seeked', r, { once: true }); v.currentTime = t; });
    if (quieto) v.pause(); else await v.play().catch(() => {});
  }, [t, !!quieto]);
  await pg.waitForFunction(() => RP.video().readyState >= 3, null, { timeout: 15000 });
  await pg.waitForTimeout(450);
}
// Del estreno (su tarjeta, «Ver con sonido») al canal k
async function abrirDesdeEstreno(pg, k) {
  await pg.evaluate(() => { const z = document.querySelector('.zona-sala[data-zona="estreno"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
  await pg.waitForTimeout(1500);
  await pg.click('#sala-tarjeta .media-grande');
  await pg.waitForTimeout(400);
  if (k) { await pg.evaluate((k) => RP.ir(k, { sin: true }), k); await pg.waitForTimeout(300); }
  await pg.mouse.move(4, 896);
}
const fin = async (pg) => {
  // Termina el video: aparece «A continuación» (se congela la cuenta para la foto)
  await en(pg, -0.6);
  await pg.waitForFunction(() => !document.querySelector('.rp-sigue').hidden, null, { timeout: 8000 });
  await pg.evaluate(() => { RP.congelar(); const s = document.querySelector('.rp-sigue'); s.classList.remove('corre'); s.querySelector('.rp-cuenta-v').style.strokeDashoffset = 97.4 * .38; s.querySelector('[data-s="cuenta"]').textContent = '3'; });
  await pg.waitForTimeout(700);
};
const vistos = (pg, l) => pg.evaluate((l) => RP.vistos(l), l);

for (const modo of quiero) {
  console.log(modo);
  if (modo === 'hoy') {
    const ctx = await nav.newContext(CEL), pg = await sala(ctx, 'hoy');
    await pg.evaluate(() => { const z = document.querySelector('.zona-sala[data-zona="estreno"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
    await pg.waitForTimeout(1500);
    await pg.evaluate(() => document.querySelector('#sala-tarjeta .media-grande').click());
    await pg.waitForTimeout(2500);
    await foto(pg, 'hoy-cel');
    await ctx.close();
    const c2 = await nav.newContext(PC), p2 = await sala(c2, 'hoy');
    await p2.evaluate(() => { const z = document.querySelector('.zona-sala[data-zona="estreno"]'); z.focus(); z.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
    await p2.waitForTimeout(1500);
    await p2.click('#sala-tarjeta .media-grande');
    await p2.waitForTimeout(2500);
    await foto(p2, 'hoy-pc');
    await c2.close();
    continue;
  }
  // En el computador
  {
    const ctx = await nav.newContext(PC), pg = await sala(ctx, modo);
    await vistos(pg, ['estreno', 'equipo']);
    await abrirDesdeEstreno(pg, 2);
    await en(pg, 14);
    if (modo === 'remoto') {
      await pg.evaluate(() => RP.osd()); await pg.waitForTimeout(600);
      await foto(pg, 'remoto-pc');
      // El cambio de canal: la estática, con el número del que entra
      await pg.evaluate(() => { RP.raiz().classList.add('rp-fija'); RP.ir(3); }); await pg.waitForTimeout(700);
      await foto(pg, 'remoto-pc-cambio');
      await pg.evaluate(() => RP.raiz().classList.remove('rp-fija', 'rp-cambiando'));
      await pg.evaluate(() => RP.ir(2, { sin: true })); await en(pg, 22);
      await pg.evaluate(() => RP.guia(true)); await pg.waitForTimeout(500);
      await foto(pg, 'remoto-pc-guia');
      await pg.evaluate(() => RP.guia(false));
    }
    if (modo === 'control') {
      await pg.evaluate(() => RP.osd()); await pg.waitForTimeout(600);
      await foto(pg, 'control-pc');
      await pg.hover('.rp-monitor-b[data-canal="5"]'); await pg.waitForTimeout(500);
      await foto(pg, 'control-pc-elige');
      await pg.mouse.move(5, 5);
    }
    if (modo === 'historias') {
      await pg.waitForTimeout(300);
      await foto(pg, 'historias-pc');
    }
    await fin(pg);
    await foto(pg, modo + '-pc-sigue');
    await pg.evaluate(() => { RP.parar(); RP.ir(RP.canales.length - 1, { sin: true }); }); await pg.waitForTimeout(600);
    await foto(pg, modo + '-pc-tu');
    await ctx.close();
  }
  // En el celular
  {
    const ctx = await nav.newContext(CEL), pg = await sala(ctx, modo);
    await vistos(pg, ['estreno', 'equipo']);
    await pg.evaluate(() => RP.abrir(2)); await pg.waitForTimeout(300);
    await en(pg, 14);
    if (modo === 'remoto') {
      await pg.evaluate(() => { RP.osd(); RP.raiz().classList.add('rp-ver-desliza'); }); await pg.waitForTimeout(500);
      await foto(pg, 'remoto-cel');
      await pg.evaluate(() => RP.raiz().classList.remove('rp-ver-desliza'));
      await pg.evaluate(() => RP.guia(true)); await pg.waitForTimeout(500);
      await foto(pg, 'remoto-cel-guia');
      await pg.evaluate(() => RP.guia(false));
    } else {
      await pg.evaluate(() => RP.osd()); await pg.waitForTimeout(500);
      await foto(pg, modo + '-cel');
      if (modo === 'control') {
        await pg.evaluate(() => { const s = document.querySelector('.rp-sala'); s.scrollTop = s.querySelector('.rp-muro').offsetTop - 12; }); await pg.waitForTimeout(400);
        await foto(pg, 'control-cel-muro');
        await pg.evaluate(() => { document.querySelector('.rp-sala').scrollTop = 0; });
      }
    }
    await fin(pg);
    await foto(pg, modo + '-cel-sigue');
    await pg.evaluate(() => { RP.parar(); RP.ir(RP.canales.length - 1, { sin: true }); }); await pg.waitForTimeout(600);
    await foto(pg, modo + '-cel-tu');
    await ctx.close();
  }
}
await nav.close(); srv.cerrar();
