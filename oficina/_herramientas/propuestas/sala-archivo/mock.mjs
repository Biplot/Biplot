// Maquetas de El Archivo como museo de BiPlot, dentro de la oficina y sin números (ya está armado en la oficina: estas
// maquetas quedan para probar ideas antes de pasarlas a datos.js).
// ?e=a al entrar · ?e=b al tocar la vitrina de Fundos 360 · ?e=c el fichero · ?e=d el pedestal libre · ?e=e el recorrido con Pepa
import { salaArchivo, componer, P } from './sala.mjs';
import { maqueta } from '../mock-comun.mjs';

const css = `
.burbuja.ar small{color:#5B6776}
.ar-barra{background:#0E2A47;color:#F2F4F7;border:1px solid rgba(127,216,207,.35)}
.ar-logo span{display:block;font:700 21px/1 'Space Grotesk',sans-serif;letter-spacing:.06em}
.ar-logo small{display:block;margin-top:5px;font:700 10.5px/1 'Space Mono',monospace;letter-spacing:.16em;color:#7FD8CF}
.ar-barra .mb-sep{background:rgba(127,216,207,.3)}
.ar-barra .mb-txt{color:#C9D4DF}
.mb-btn.ar-cian{background:#17C3B2;color:#062B27}
.mb-btn.ar-borde{border:1.5px solid rgba(242,244,247,.45);color:#F2F4F7}
.ar-rec{display:flex;flex-direction:column;gap:4px;min-width:250px}
.ar-rec small{font:700 10.5px/1 'Space Mono',monospace;letter-spacing:.12em;color:#7FD8CF;text-transform:uppercase}
.ar-rec b{font:700 21px/1.1 'Space Grotesk',sans-serif}
.ar-x{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:#A9B7C6;font:600 18px/1 sans-serif}
.tarjeta.cedula{background:#FBFAF7;color:#13202E;border:1px solid #E4E0D8;border-radius:8px;width:370px;padding:20px 20px 18px}
.cedula .meta{font:700 10.5px/1.5 'Space Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:#5B6776;margin-right:30px}
.cedula h3{font:700 27px/1.08 'Space Grotesk',sans-serif;letter-spacing:-.01em;color:#0E2A47}
.cedula p{color:#2F3A46}
.cedula .regla{height:1px;background:#E4E0D8;margin:2px 0 12px}
.cedula .fecha{display:flex;align-items:center;gap:9px;margin-bottom:14px;font:700 11.5px/1.35 'Space Mono',monospace;letter-spacing:.04em;color:#0E2A47}
.cedula .fecha i{flex:none;width:10px;height:10px;border-radius:50%;background:#17C3B2;box-shadow:0 0 0 3px rgba(23,195,178,.22)}
.cedula .fecha span{color:#5B6776;font-weight:400}
.cedula .cerrar{color:#5B6776;background:#EEEBE5}
.btn-oscuro{border:1.5px solid #0E2A47;color:#0E2A47;border-radius:999px;padding:11px 16px;font:700 14px/1 'Space Grotesk',sans-serif}
.tarjeta.fichero{background:#FBFAF7;color:#13202E;border:1px solid #E4E0D8;border-radius:8px;width:380px;padding:20px 20px 16px}
.fichero .meta{font:700 10.5px/1.5 'Space Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#5B6776}
.fichero h3{font:700 25px/1.1 'Space Grotesk',sans-serif;color:#0E2A47}
.fichero p{color:#2F3A46}
.busca{display:flex;align-items:center;gap:8px;border:1.5px solid #D9D5CD;border-radius:10px;padding:10px 12px;margin:0 0 12px;font:400 14px/1 Inter,sans-serif;color:#8A94A0;background:#FFFFFF}
.grupo{margin:0 0 10px}
.grupo h4{margin:0 0 5px;font:700 10.5px/1 'Space Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#5B6776}
.ficha{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border:1px solid #E4E0D8;border-left:4px solid #17C3B2;border-radius:6px;background:#FFFFFF;margin-bottom:5px;font:600 14px/1.2 'Space Grotesk',sans-serif;color:#0E2A47}
.ficha em{font:600 11px/1 'Space Mono',monospace;font-style:normal;color:#5B6776;letter-spacing:.04em}
.fichero .cerrar{color:#5B6776;background:#EEEBE5}
.etiqueta.ar{background:#FBFAF7;color:#0E2A47;border-color:#17C3B2;box-shadow:0 0 0 6px rgba(23,195,178,.18);font:700 14px/1 'Space Grotesk',sans-serif}
`;

const BARRA = `<div class="marca-barra ar-barra"><div class="ar-logo"><span>EL ARCHIVO</span><small>MUSEO DE BIPLOT</small></div><div class="mb-sep"></div><div class="mb-txt">Una pieza de cada desarrollo, en el orden en que llegaron. De la terminal a hoy.</div><span class="mb-btn ar-cian">Recorrer con Pepa</span><span class="mb-btn ar-borde">Todos los casos</span></div>`;
const Q = (x, y, z) => P(x, y, z).map((n) => Math.round(n));

const estados = {
  a: { centro: [96, 250], zoom: 1.1 },
  b: { centro: [-80, 130], zoom: 2.0 },
  c: { centro: [60, 40], zoom: 1.9 },
  d: { centro: [260, 380], zoom: 2.0 }
};
const guion = `
const barra = ${JSON.stringify(BARRA)};
if (est === 'a') {
  poner('<small>Pepa · Cosecha</small>¡Bienvenido al Archivo! Aquí guardamos una pieza de cada desarrollo.', 1.9, 4.35, 2.1, 'burbuja bp');
  poner('<small>Visita</small>Yo trabajé con una de esas.', 13.65, 10.45, 2.0, 'burbuja ar');
  poner('¡El elefante crece!', 13.25, 5.85, 1.45, 'burbuja ar');
  capa.insertAdjacentHTML('beforeend', barra);
}
if (est === 'b') {
  brillo([[2.72, 6.12], [3.68, 6.12], [3.68, 7.08], [2.72, 7.08]], 0.02, '#17C3B2');
  poner('La escritura inscrita', 3.2, 6.6, 1.95, 'etiqueta ar');
  poner('<small>Visita</small>¡La banderita del lote 25!', 4.6, 6.35, 2.05, 'burbuja ar');
  poner('<span class="cerrar">×</span><div class="meta">Fundos 360 · Fundos Inmobiliaria · A la medida</div><h3>La escritura inscrita</h3><p>El ciclo de una parcela es largo: contacto, reserva, escritura, facturación al inversionista, posventa y comisiones. Fundos 360 lo sigue completo, hasta que la escritura queda inscrita a nombre de quien compró. A su lado, la banderita del lote 25 de su plano.</p><div class="regla"></div><div class="fecha"><i></i><div>10 de septiembre de 2026<br><span>El primer caso de biplot.cl</span></div></div><div class="botones"><span class="btn-cian">Entrar a su sala</span><span class="btn-oscuro">Ver su caso</span></div>', 3.2, 6.6, 1.6, 'tarjeta cedula', 250, -330);
}
if (est === 'c') {
  brillo([[0.06, 1.1], [0.72, 1.1], [0.72, 3.9], [0.06, 3.9]], 0.02, '#17C3B2');
  poner('El fichero', 0.4, 2.5, 1.62, 'etiqueta ar');
  poner('<small>Pepa · Cosecha</small>Todos los casos tienen su carpeta, también los que no muestran su nombre.', 1.9, 4.35, 2.1, 'burbuja bp');
  poner('<span class="cerrar">×</span><div class="meta">El fichero · 5 casos</div><h3>Todos los casos tienen su carpeta</h3><p>Por rubro, también los que no muestran su nombre o ya terminaron. Cuando llega un rubro nuevo, se abre su calle.</p><div class="busca">⌕ Busca por nombre o rubro</div>' +
    [['Inmobiliaria o parcelas', [['Fundos 360', 'A la medida']]], ['Restaurante o comida', [['Haru 360', 'En implementación']]], ['Gimnasio o servicios', [['Eleven 360', 'Propuesta']]], ['Construcción o fábrica', [['Nu Home 360', 'En desarrollo']]], ['Otro rubro', [['Rumbo', 'Publicado']]]]
      .map(([g, l]) => '<div class="grupo"><h4>' + g + '</h4>' + l.map(([n, e]) => '<div class="ficha">' + n + '<em>' + e + '</em></div>').join('') + '</div>').join(''), 0.4, 2.5, 1.3, 'tarjeta fichero', 170, -300);
}
if (est === 'd') {
  brillo([[17.32, 7.82], [18.28, 7.82], [18.28, 8.78], [17.32, 8.78]], 0.02, '#17C3B2');
  poner('Tu proyecto', 17.8, 8.3, 1.95, 'etiqueta ar');
  poner('<span class="cerrar">×</span><div class="ceja">Próximamente</div><h3>Este pedestal está libre</h3><p>La próxima pieza puede ser de tu proyecto. Todo empieza con un diagnóstico: tres preguntas con Plotty y, si tiene sentido, la primera sesión sin costo.</p><div class="botones"><span class="coral">Agenda tu diagnóstico</span><span class="btn-ghost">Conversar con Plotty</span></div>', 17.8, 8.3, 1.6, 'tarjeta bp', -520, -250);
}
`;
await maqueta({ id: 'archivo', titulo: 'El Archivo', r: salaArchivo(), componer, css, estados, guion });

// El recorrido con Pepa, en su segunda parada: la libreta de 1985 (Pepa se para junto a ella)
const guionRec = `
brillo([[14.92, 10.32], [15.88, 10.32], [15.88, 11.28], [14.92, 11.28]], 0.02, '#17C3B2');
poner('<small>Pepa · Cosecha</small>Antes de todo esto, había una libreta: planillas a mano y la memoria de una sola persona.', 14.45, 11.15, 2.1, 'burbuja bp');
capa.insertAdjacentHTML('beforeend', '<div class="marca-barra ar-barra"><div class="ar-rec"><small>Recorrido con Pepa · 2 de 12</small><b>1985 · La libreta</b></div><span class="mb-btn ar-borde">Anterior</span><span class="mb-btn ar-borde">Ver más</span><span class="mb-btn ar-cian">Siguiente</span><span class="ar-x">×</span></div>');
`;
await maqueta({ id: 'archivo', titulo: 'El Archivo', r: salaArchivo({ pepa: [14.45, 11.15] }), componer, css, estados: { e: { centro: [150, 380], zoom: 2.0 } }, guion: guionRec });
