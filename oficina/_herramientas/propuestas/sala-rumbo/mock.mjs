// Maquetas de la sala de Rumbo dentro de la oficina, sin números.
// ?e=a al entrar · ?e=b al tocar el elefante · ?e=c el rincón de BiPlot con Tamandúa
import { salaRumbo, componer, P } from './sala.mjs';
import { ETAPAS } from './elefantes.mjs';
import { maqueta, caras } from '../mock-comun.mjs';

const EQUIPO = ['architect', 'engine', 'grilla', 'bucle', 'tamandua', 'faro', 'pepa'];
const ISOTIPO = '<svg viewBox="0 0 32 32" width="38" height="38"><rect x="1" y="1" width="30" height="30" rx="8" fill="#0E2A47" stroke="#17C3B2" stroke-width="1.2"/><polyline points="7,23 13,17 18,20 25,10" fill="none" stroke="#17C3B2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="23" r="2" fill="#17C3B2"/><circle cx="13" cy="17" r="2" fill="#17C3B2"/><circle cx="18" cy="20" r="2" fill="#17C3B2"/><circle cx="25" cy="10" r="2.6" fill="#FF6B4A"/></svg>';
const etapas = ['Cría', 'Joven', 'Adulto', 'Sabio'].map((n, i) => `<figure><svg viewBox="0 0 260 240" width="66" height="61">${ETAPAS[i]}</svg><figcaption>${n}</figcaption></figure>`).join('');
const css = `
.burbuja.rm small{color:#3B6FB0}
.rm-barra{background:#FFFFFF;color:#111F31;border:1px solid #D6D8D3}
.rm-logo{display:flex;align-items:center;gap:11px}
.rm-logo span{font:700 21px/1 'Space Grotesk',sans-serif;letter-spacing:-.02em}
.rm-logo small{display:block;font:500 11px/1.4 'Space Grotesk',sans-serif;letter-spacing:.04em;color:#5F6975;margin-top:3px}
.rm-barra .mb-sep{background:#D6D8D3}
.rm-barra .mb-txt{color:#45505F;font-family:'Space Grotesk',sans-serif;font-size:13.5px}
.mb-btn.rm-azul{background:#3B6FB0;color:#FFFFFF}
.mb-btn.rm-borde{border:1.5px solid #0E2A47;color:#0E2A47}
.tarjeta.rm{background:#FFFFFF;color:#111F31;border:1px solid #D6D8D3;width:360px}
.tarjeta.rm .ceja{color:#3B6FB0}
.tarjeta.rm h3{font:700 25px/1.12 'Space Grotesk',sans-serif;letter-spacing:-.02em}
.tarjeta.rm p{color:#45505F}
.tarjeta.rm .chips span{background:#F4F5F2;color:#111F31;border:1px solid #ECEDEA}
.tarjeta.rm .cerrar{color:#5F6975;background:#F4F5F2}
.tarjeta.rm .etapas{display:flex;justify-content:space-between;margin:0 0 12px;padding:8px 6px 6px;border-radius:12px;background:#F5F6F4}
.tarjeta.rm .etapas figure{margin:0;display:grid;justify-items:center;gap:2px}
.tarjeta.rm .etapas figcaption{font:600 11px/1 'Space Grotesk',sans-serif;color:#45505F}
.etiqueta.rm{background:#FFFFFF;color:#0E2A47;border-color:#3B6FB0;box-shadow:0 0 0 6px rgba(59,111,176,.18);font:700 14px/1 'Space Grotesk',sans-serif}
`;
const estados = { a: { centro: [96, 250], zoom: 1.1 }, b: { centro: P(11.2, 7.0, 1.4), zoom: 1.9 }, c: { centro: P(10.6, 12.0, 1.2), zoom: 2.2 } };
const guion = `
if (est === 'a') {
  poner('<small>Apertura del día</small>Tres prioridades y mi elefante. Parto por lo difícil.', 16.2, 1.85, 1.4, 'burbuja rm');
  poner('<small>Hábitos</small>¡12 días de racha! Hoy tampoco la suelto.', 0.85, 6.3, 2.05, 'burbuja rm');
  poner('<small>Objetivos</small>Meta del trimestre: correr mis primeros 10K.', 9.55, 1.3, 2.65, 'burbuja rm');
  poner('<small>Cierre del día</small>¿Qué salió bien hoy? Anotado en el diario.', 1.4, 12.2, 1.75, 'burbuja rm');
  capa.insertAdjacentHTML('beforeend', '<div class="marca-barra rm-barra"><div class="rm-logo">${ISOTIPO}<span>Rumbo<small>by BiPlot</small></span></div><div class="mb-sep"></div><div class="mb-txt">Tu vida en un solo lugar: rituales, hábitos, metas, finanzas y más, con un elefante que crece contigo.</div><span class="mb-btn rm-azul">Abrir Rumbo</span><span class="mb-btn rm-borde">Recorrer un día</span></div>');
}
if (est === 'b') {
  brillo([[9.25, 5.65], [11.75, 5.65], [11.75, 8.15], [9.25, 8.15]], 0.55, '#3B6FB0');
  poner('Tu elefante', 10.5, 6.9, 3.25, 'etiqueta rm');
  poner('<small>De visita</small>¡Está feliz porque cerraste el día!', 12.6, 6.6, 2.05, 'burbuja rm');
  poner('<span class="cerrar">×</span><div class="ceja">Tu elefante</div><h3>¿Cómo te comes un elefante?</h3><p>Un bocado a la vez: así se llama tu tarea más importante del día. Tu elefante crece con tu constancia y se pone feliz cuando cierras el día.</p><div class="etapas">${etapas}</div><div class="chips"><span>Seis tipos para ganar</span><span>Ropa con tus estrellas</span></div><div class="botones"><span class="mb-btn rm-azul">Elegir mi elefante</span><span class="mb-btn rm-borde">Ver recompensas</span></div>', 13.6, 5.0, 1.0, 'tarjeta rm', 20, -290);
}
if (est === 'c') {
  poner('<small>Tamandúa · BiPlot</small>Rumbo es nuestro. Cada cambio pasa por sus pruebas antes de llegar a tu celular.', 10.25, 12.85, 2.1, 'burbuja bp');
  poner('<small>Tienda · Rumbo</small>Con mis estrellas le compré el jockey.', 15.5, 12.5, 2.05, 'burbuja rm');
  poner('<span class="cerrar">×</span><div class="ceja">Hecho en BiPlot</div><h3>Rumbo<span class="estado">Publicado</span></h3><p>Tu vida en un solo lugar. Una app de BiPlot para ordenar lo personal: ritual de mañana y de noche, hábitos, finanzas, metas, lecturas, salud y diario, con rangos e insignias para no soltarlo.</p><div class="caras">${caras(EQUIPO)}</div><div class="caras-pie">El equipo de BiPlot HQ que la hace</div><div class="botones"><span class="btn-cian">Abrir Rumbo</span><span class="btn-ghost">Pasar a BiPlot HQ</span></div>', 7.6, 12.4, 1.2, 'tarjeta bp', -400, -260);
}
`;
await maqueta({ id: 'rumbo', titulo: 'Sala Rumbo', r: salaRumbo(), componer, css, estados, guion });
