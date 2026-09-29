// Maquetas de la sala de Haru dentro de la oficina, sin números.
// ?e=a al entrar · ?e=b al tocar la barra de sushi · ?e=c el rincón de BiPlot con Faro
import { salaHaru, componer, P } from './sala.mjs';
import { maqueta, MEDIA, caras } from '../mock-comun.mjs';

const EQUIPO = ['lupe', 'architect', 'celda', 'engine', 'grilla', 'bucle', 'tamandua', 'faro'];
const css = `
.burbuja.hr small{color:#B93620}
.hr-barra{background:#15120F;color:#F3EDE1;border:1px solid rgba(201,162,78,.45)}
.hr-logo{display:flex;align-items:center;gap:11px}
.hr-logo img{width:40px;height:40px;border-radius:9px}
.hr-logo span{font:800 21px/1 Montserrat,sans-serif;letter-spacing:.01em}
.hr-logo small{display:block;font:600 10px/1.4 Montserrat,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#C9A24E;margin-top:4px}
.hr-barra .mb-sep{background:rgba(201,162,78,.4)}
.hr-barra .mb-txt{color:#CFC5B3;font-family:Montserrat,sans-serif;font-size:13.5px}
.mb-btn.hr-rojo{background:#E0482F;color:#FFFFFF;font-family:Montserrat,sans-serif}
.mb-btn.hr-borde{border:1.5px solid rgba(243,237,225,.5);color:#F3EDE1;font-family:Montserrat,sans-serif}
.tarjeta.hr{width:370px;background:#15120F;color:#F3EDE1;border:1px solid rgba(201,162,78,.38)}
.tarjeta.hr .ceja{color:#C9A24E}
.tarjeta.hr h3{font:800 30px/1.05 Montserrat,sans-serif;letter-spacing:-.01em}
.tarjeta.hr p{color:#CFC5B3;font-family:Montserrat,sans-serif;font-size:13.5px;line-height:1.5}
.tarjeta.hr .chips span{background:#1F1B16;color:#F3EDE1;border:1px solid rgba(243,237,225,.14);font-family:Montserrat,sans-serif}
.tarjeta.hr .chips span.precio{background:#E0482F;border-color:#E0482F;color:#FFFFFF}
.tarjeta.hr .cerrar{color:#CFC5B3;background:rgba(255,255,255,.07)}
.etiqueta.hr{background:#15120F;color:#F3EDE1;border-color:#E0482F;box-shadow:0 0 0 6px rgba(224,72,47,.2);font:700 15px/1 Montserrat,sans-serif}
`;
const estados = { a: { centro: [96, 250], zoom: 1.1 }, b: { centro: P(10.4, 2.6, 1.3), zoom: 1.85 }, c: { centro: P(9.2, 11.9, 1.2), zoom: 2.2 } };
const guion = `
if (est === 'a') {
  poner('<small>Anfitriona · Haru</small>¡Bienvenidos a Haru! ¿Barra, salón o terraza?', 16.0, 12.6, 2.05, 'burbuja hr');
  poner('<small>Itamae · Haru</small>Hoy el Chinchorrero sale con mariscos salteados al estilo nikkei.', 10.8, 1.35, 2.1, 'burbuja hr');
  poner('<small>Garzón · Haru</small>La carta está en el QR de la mesa. Pidan cuando quieran.', 12.1, 8.3, 2.05, 'burbuja hr');
  poner('<small>Cajera · Haru</small>¡Pedido para retiro listo!', 0.55, 4.0, 2.05, 'burbuja hr');
  capa.insertAdjacentHTML('beforeend', '<div class="marca-barra hr-barra"><div class="hr-logo"><img src="${MEDIA}logo-haru.webp" alt=""><span>Haru Isidora<small>Sushi de autor · Arica</small></span></div><div class="mb-sep"></div><div class="mb-txt">Rolls de autor, barra, salón y terraza. Pide desde la mesa, para retiro o delivery.</div><span class="mb-btn hr-rojo">Ver la carta</span><span class="mb-btn hr-borde">Recorrer con la anfitriona</span></div>');
}
if (est === 'b') {
  brillo([[5.75, 0.4], [12.65, 0.4], [12.65, 3.45], [5.75, 3.45]], 1.08, '#E0482F');
  poner('Barra de sushi', 12.55, 2.0, 1.35, 'etiqueta hr');
  poner('<small>Itamae · Haru</small>¿Lo armo para ti? Sale en un momento.', 10.8, 1.35, 2.1, 'burbuja hr');
  poner('<span class="cerrar">×</span><div class="ceja">Rolls de la casa</div><h3>Chinchorrero</h3><div class="chips"><span class="precio">$8.000</span><span>Camarón furay</span><span>Estilo nikkei</span></div><p>Camarón furay, queso crema y palta, apanado en chicharrón, bañado en salsa olivo y mariscos salteados al estilo nikkei.</p><div class="botones"><span class="mb-btn hr-rojo">Pedir desde la mesa</span><span class="mb-btn hr-borde">Ver la carta</span></div>', 13.6, 1.2, 1.0, 'tarjeta hr', 20, -250);
}
if (est === 'c') {
  poner('<small>Faro · BiPlot</small>Haru 360 junta la caja, la cocina, el delivery y la bodega. ¿Te muestro cómo llega una comanda?', 9.85, 12.85, 2.1, 'burbuja bp');
  poner('<span class="cerrar">×</span><div class="ceja">Hecho con BiPlot</div><h3>Haru 360<span class="estado">En implementación</span></h3><p>Caja, máquinas de pago, apps de delivery y una planilla a mano: los totales no cuadraban y nadie sabía el costo real de cada plato. Haru 360 junta ventas, cocina, delivery, bodega y caja, y la carta digital deja pedir desde la mesa con un QR.</p><div class="caras">${caras(EQUIPO)}</div><div class="caras-pie">El equipo de BiPlot HQ que la hizo</div><div class="botones"><span class="btn-cian">Ver el video</span><span class="btn-ghost">Ver la carta digital</span></div>', 10.8, 12.3, 1.0, 'tarjeta bp', 60, -260);
}
`;
await maqueta({ id: 'haru', titulo: 'Sala Haru', r: salaHaru(), componer, css, estados, guion });
