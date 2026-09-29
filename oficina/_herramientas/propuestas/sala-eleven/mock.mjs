// Maquetas de la sala de Eleven dentro de la oficina, sin números.
// ?e=a al entrar · ?e=b al tocar la sala de clases · ?e=c el rincón de BiPlot con Lupe
import { salaEleven, componer, P } from './sala.mjs';
import { maqueta, caras } from '../mock-comun.mjs';

const EQUIPO = ['lupe', 'architect', 'grilla', 'bucle', 'tamandua'];
const LOGO = '<svg width="46" height="30" viewBox="-46 -17 92 34"><rect x="-44" y="-4" width="88" height="8" rx="2" fill="#FF6600"/><rect x="-40" y="-15" width="10" height="30" rx="2" fill="#FF6600"/><rect x="-30" y="-11" width="10" height="22" rx="2" fill="#FF6600"/><rect x="20" y="-11" width="10" height="22" rx="2" fill="#FF6600"/><rect x="30" y="-15" width="10" height="30" rx="2" fill="#FF6600"/></svg>';
const css = `
.burbuja.el small{color:#CC5200}
.el-barra{background:#0B0B0B;color:#F2EDE5;border:1px solid rgba(255,102,0,.45)}
.el-logo{display:flex;align-items:center;gap:12px}
.el-logo span{font:700 19px/1 'Chakra Petch',sans-serif;letter-spacing:.12em;text-transform:uppercase}
.el-logo small{display:block;font:700 9.5px/1.4 Manrope,sans-serif;letter-spacing:.26em;text-transform:uppercase;color:#B8B2AA;margin-top:4px}
.el-barra .mb-sep{background:rgba(255,102,0,.4)}
.el-barra .mb-txt{color:#CFC8BE;font-family:Manrope,sans-serif;font-size:13.5px}
.mb-btn.el-or{background:#FF6600;color:#0B0B0B;font:700 13px/1 'Chakra Petch',sans-serif;text-transform:uppercase;letter-spacing:.08em;padding:12px 16px}
.mb-btn.el-borde{border:1.5px solid rgba(242,237,229,.5);color:#F2EDE5;font:700 13px/1 'Chakra Petch',sans-serif;text-transform:uppercase;letter-spacing:.08em;padding:12px 16px}
.tarjeta.el{background:#0B0B0B;color:#F2EDE5;border:1px solid rgba(255,102,0,.42)}
.tarjeta.el .ceja{color:#FF8A1F;font-family:'Chakra Petch',sans-serif;font-size:12px}
.tarjeta.el h3{font:400 42px/.95 Anton,Impact,sans-serif;text-transform:uppercase;letter-spacing:.01em;margin:10px 0 12px}
.tarjeta.el p{color:#CFC8BE;font-family:Manrope,sans-serif;font-size:13.5px;line-height:1.5}
.tarjeta.el .chips span{background:#1A1A1A;color:#F2EDE5;border:1px solid rgba(255,102,0,.3);font-family:Manrope,sans-serif;font-weight:700}
.tarjeta.el .cerrar{color:#B8B2AA;background:rgba(255,255,255,.07)}
.tarjeta.el .intensidad{display:inline-flex;gap:3px;margin-left:6px;vertical-align:1px}
.tarjeta.el .intensidad i{width:14px;height:6px;border-radius:2px;background:#FF3B2F}
.etiqueta.el{background:#0B0B0B;color:#F2EDE5;border-color:#FF6600;box-shadow:0 0 0 6px rgba(255,102,0,.2);font:700 13px/1 'Chakra Petch',sans-serif;text-transform:uppercase;letter-spacing:.1em}
`;
const estados = { a: { centro: [96, 250], zoom: 1.1 }, b: { centro: P(15.4, 7.6, 1.1), zoom: 1.7 }, c: { centro: P(11.6, 11.9, 1.2), zoom: 2.2 } };
const guion = `
if (est === 'a') {
  poner('<small>Recepción · Eleven</small>¡Hola! ¿Vienes a conocer el club? El pase diario es de $4.000.', 16.9, 10.75, 2.05, 'burbuja el');
  poner('<small>Coach · Eleven</small>Armamos tu plan según tu objetivo y vemos tu progreso cada semana.', 3.4, 4.5, 2.05, 'burbuja el');
  poner('<small>Instructor · Eleven</small>¡Vamos que se puede! Power Jump, martes y jueves a las 19:30.', 19.0, 5.9, 2.25, 'burbuja el');
  poner('<small>Coach · Eleven</small>Calistenia Kids: lunes, miércoles y viernes a las 17:00.', 8.4, 6.9, 2.05, 'burbuja el');
  capa.insertAdjacentHTML('beforeend', '<div class="marca-barra el-barra"><div class="el-logo">${LOGO}<span>Eleven Club<small>Fitness and BXO</small></span></div><div class="mb-sep"></div><div class="mb-txt">Peso libre, fuerza, cardio y 240 m² de clases, abierto los 7 días en Arica.</div><span class="mb-btn el-or">Ver planes</span><span class="mb-btn el-borde">Recorrer con un coach</span></div>');
}
if (est === 'b') {
  brillo([[12.6, 4.4], [20, 4.4], [20, 10], [12.6, 10]], 0.05, '#FF6600');
  poner('Sala de clases', 20.0, 9.3, 0.0, 'etiqueta el');
  poner('<small>Instructor · Eleven</small>¿Te sumas a la próxima? Es el martes a las 19:30.', 19.0, 5.9, 2.25, 'burbuja el');
  poner('<span class="cerrar">×</span><div class="ceja">Sala de clases · Cardio</div><h3>Power Jump</h3><div class="chips"><span>Martes y jueves · 19:30</span><span>60 min</span><span>Incluida en tu plan</span></div><p>Trabajo cardiovascular sobre mini trampolín que fortalece piernas, mejora el equilibrio y ayuda a quemar calorías.</p><div class="botones"><span class="mb-btn el-or">Ver horario vivo</span><span class="mb-btn el-borde">Ver planes</span></div>', 12.4, 10.2, 0.0, 'tarjeta el', -380, -250);
}
if (est === 'c') {
  poner('<small>Lupe · BiPlot</small>Hice el diagnóstico de Eleven: más socios, que se queden y que vuelvan por más. ¿Te cuento la propuesta?', 11.85, 12.85, 2.1, 'burbuja bp');
  poner('<small>Socio · Eleven</small>Entro con mi huella, como siempre.', 14.5, 12.4, 2.05, 'burbuja el');
  poner('<span class="cerrar">×</span><div class="ceja">Propuesta de BiPlot</div><h3>Eleven 360<span class="estado">Propuesta</span></h3><p>Sitio y experiencia digital para el club. La idea: más socios, que se queden y que vuelvan por más. No reemplaza su acceso con huella: se conecta a él y trabaja antes y después de la huella.</p><div class="caras">${caras(EQUIPO)}</div><div class="caras-pie">El equipo de BiPlot HQ que la preparó</div><div class="botones"><span class="btn-cian">Ver el sitio</span><span class="btn-ghost">Pasar a BiPlot HQ</span></div>', 9.6, 12.9, 1.0, 'tarjeta bp', -400, -300);
}
`;
await maqueta({ id: 'eleven', titulo: 'Sala Eleven', r: salaEleven(), componer, css, estados, guion });
