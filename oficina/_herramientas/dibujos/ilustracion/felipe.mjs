import { C, forma, plana, mancha, linea, tubo, credencialAncha, suelo, ojo } from './tinta.mjs';

// Felipe · el rostro que graba con Aby · PRENSA. Marco 300×520, suelo en y=503. Le dicen Rodman.
// Pelo al ras teñido en zigzag rojo y negro que se vuelve amarillo hacia los lados, como Rodman. Dos vestuarios, como
// Aby. Urbano: chaqueta de trabajo negra abierta sobre polera negra, cadena dorada, pantalón ancho gris con manchas y
// zapatillas grises; hace girar una pelota de básquetbol en el índice. Elegante: esmoquin con solapas de satén, humita
// roja, zapatos de charol con calcetines rojos, el micrófono de BiPlot y la pelota bajo el brazo. En los dos, la flor
// de la solapa es por Tyler, the Creator.

const piel = '#E8B996', pielS = '#CF9C74', ceja = '#2B1D16';
const P = { negro: '#17120F', rojo: '#C8242B', amarillo: '#EAB92C' };
const cha = '#2A2E35', chaS = '#1B1E23', chaL = '#3B414B', etiqueta = '#C9A66B';
const polera = '#141619', oro = '#D9A441', oroS = '#A87A22';
const pan = '#B3B8C0', panS = '#979DA7', mancha1 = '#4A4F57';
const zap = '#3E434B', zapN = '#1F2329', zapG = '#9AA1AA';
const bola = '#E07F2E', bolaS = '#B85F1C', bolaL = '#F6B26B';
const flor = '#F2C94C', florC = '#8A5A12';

// El pelo al ras: el cráneo, con patillas y la línea de la frente
const PELO = 'M118 100 C111 74 119 51 151 48 C183 50 192 74 185 100 L180 101 C180 94 177 89 173 86 C163 80 140 80 130 86 C126 89 123 94 123 101 Z';
const PIERNA_I = 'M114 306 L152 306 L151 336 C149 376 147 420 146 470 L100 472 C102 420 106 366 114 306 Z';
const PIERNA_D = 'M152 306 L190 306 C198 366 202 420 204 472 L158 470 C157 420 155 376 153 336 Z';

// Mancha irregular del estampado (seis puntas suaves)
function manchita(cx, cy, rx, ry, giro = 0) {
  const n = 6, p = [];
  for (let i = 0; i < n; i++) {
    const a = giro + (i / n) * Math.PI * 2, k = i % 2 ? 0.66 : 1;
    p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  const m = (a, b) => `${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
  let d = `M${m(p[n - 1], p[0])}`;
  for (let i = 0; i < n; i++) d += `Q${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${m(p[i], p[(i + 1) % n])}`;
  return d + 'Z';
}
// Zigzag de x0 a x1 en torno a y, con medio período paso y amplitud a
function zigzag(x0, x1, y, paso = 13, a = 7) {
  const pts = [];
  for (let x = x0, i = 0; x <= x1 + 0.1; x += paso, i++) pts.push(`${x} ${y + (i % 2 ? -a / 2 : a / 2)}`);
  return 'M' + pts.join(' L');
}

function pelo() {
  let s = forma(PELO, P.negro, 2.6);
  s += '<g clip-path="url(#pelo)">';
  // Tres franjas rojas en zigzag, en fase; hacia los lados se vuelven amarillas
  for (const y of [60, 74, 88]) {
    s += linea(zigzag(98, 206, y), 7, P.rojo);
    s += linea(zigzag(98, 124, y), 7, P.amarillo) + linea(zigzag(176, 206, y), 7, P.amarillo);
  }
  // Patillas y bajo la sien, amarillas
  s += mancha('M112 88 L128 88 C125 92 123 96 123 101 L112 101 Z', P.amarillo);
  s += mancha('M176 88 L192 88 L192 101 L180 101 C180 96 179 92 176 88 Z', P.amarillo);
  // Brillo en la coronilla: es pelo, no un gorro
  s += linea('M130 56 C140 50 160 49 172 54', 3, '#4A3E36', ' opacity=".8"');
  s += '</g>';
  s += `<clipPath id="pelo"><path d="${PELO}"/></clipPath>`;
  // Borde otra vez encima de las franjas, y las puntas cortas sobre la frente
  s += plana(PELO, 'none', 2.6);
  s += linea('M133 86 L132 90 M141 82.5 L140.5 86.5 M150 81.5 L150 85.5 M159 82 L159.5 86 M168 84 L169 88', 1.6, P.negro);
  return s;
}

function cara() {
  let s = '';
  // Rostro joven, mandíbula marcada
  s += forma('M122 94 C121 66 181 64 181 94 L180 112 C179 128 168 140 151 144 C134 140 122 128 122 112 Z', piel);
  s += mancha('M168 72 C178 78 181 86 181 96 L180 112 C179 128 168 140 151 144 C162 134 170 124 172 110 C174 96 174 82 168 72 Z', pielS);
  s += pelo();
  // Orejas
  s += forma('M123 96 C112 94 112 116 124 118', piel, 2.4);
  s += linea('M119 102 C116 104 116 110 119 112', 1.4, pielS);
  s += forma('M180 96 C191 94 191 116 179 118', piel, 2.4);
  s += linea('M184 102 C187 104 187 110 184 112', 1.4, pielS);
  // Ojos tranquilos, con el párpado un poco caído
  s += ojo(137, 106, 16, 7, 1.6, 0.6, 0.22, piel);
  s += ojo(166, 105, 16, 7, 1.6, 0.6, 0.22, piel);
  // Cejas: la derecha un poco arriba, de pícaro
  s += linea('M127 95 C133 90 141 90 146 93', 4, ceja);
  s += linea('M157 90 C163 85 171 86 176 91', 4, ceja);
  // Nariz y sonrisa de lado
  s += linea('M152 104 C151 111 150 117 147 121 C150 124 154 124 157 121', 2.2);
  s += linea('M140 132 C147 137 155 136 163 129', 2.8);
  s += linea('M162 127 L165 131', 2);
  s += `<ellipse cx="132" cy="122" rx="7" ry="4" fill="${C.mejilla}"/><ellipse cx="170" cy="121" rx="6" ry="3.6" fill="${C.mejilla}"/>`;
  return s;
}

// La flor amarilla de cinco pétalos
function florSolapa(x, y) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    s += `<circle cx="${(x + Math.cos(a) * 5.6).toFixed(1)}" cy="${(y + Math.sin(a) * 5.6).toFixed(1)}" r="4.4" fill="${flor}" stroke="${C.tinta}" stroke-width="1.4"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="3.2" fill="${florC}" stroke="${C.tinta}" stroke-width="1.2"/>`;
}
// La pelota de básquetbol, centrada en (x, y) con radio r
function pelota(x, y, r) {
  const k = r / 27;
  const p = (dx, dy) => `${(x + dx * k).toFixed(1)} ${(y + dy * k).toFixed(1)}`;
  let s = forma(`M${p(-27, 0)} A${r} ${r} 0 1 0 ${p(27, 0)} A${r} ${r} 0 1 0 ${p(-27, 0)} Z`, bola);
  s += mancha(`M${p(15, -22)} C${p(27, -14)} ${p(31, 6)} ${p(21, 20)} C${p(15, 26)} ${p(9, 28)} ${p(3, 27)} C${p(19, 20)} ${p(25, 0)} ${p(15, -22)} Z`, bolaS);
  s += mancha(`M${p(-17, -14)} C${p(-13, -20)} ${p(-5, -24)} ${p(1, -24)} C${p(-5, -20)} ${p(-11, -14)} ${p(-13, -8)} Z`, bolaL, ' opacity=".9"');
  s += linea(`M${p(-26, 4)} C${p(-11, -4)} ${p(13, -4)} ${p(26, 4)}`, 2.2);
  s += linea(`M${p(0, -27)} C${p(-10, -14)} ${p(-10, 14)} ${p(0, 27)}`, 2.2);
  s += linea(`M${p(-19, -18)} C${p(-7, -8)} ${p(-7, 10)} ${p(-19, 20)}`, 2);
  s += linea(`M${p(20, -18)} C${p(9, -8)} ${p(9, 10)} ${p(20, 20)}`, 2);
  return s;
}

// ───────── Urbano ─────────
export function felipe() {
  let s = suelo(150, 503, 84);

  // Zapatillas grises de caña baja, con el costado negro y suela blanca (van antes: el pantalón cae encima)
  s += forma('M104 464 L146 464 C150 476 150 490 148 498 L88 498 C84 486 92 470 104 464 Z', zap);
  s += plana('M94 480 C110 474 130 474 146 480 L147 494 L90 494 C90 488 92 484 94 480 Z', zapN, 2);
  s += plana('M88 494 C88 484 94 476 104 472 L112 472 C104 480 100 488 100 494 Z', zapG, 2);
  s += forma('M86 494 L150 494 L150 503 L86 503 Z', C.niebla, 2.2);
  s += forma('M154 464 L196 464 C208 470 214 486 212 498 L152 498 C150 490 150 476 154 464 Z', zap);
  s += plana('M154 480 C170 474 190 474 206 480 C208 484 210 488 210 494 L153 494 Z', zapN, 2);
  s += plana('M212 494 C212 484 206 476 196 472 L188 472 C196 480 200 488 200 494 Z', zapG, 2);
  s += forma('M150 494 L214 494 L214 503 L150 503 Z', C.niebla, 2.2);

  // Pantalón ancho gris con manchas, que cae sobre las zapatillas
  s += forma(PIERNA_I, pan);
  s += forma(PIERNA_D, pan);
  s += `<clipPath id="piernas"><path d="${PIERNA_I} ${PIERNA_D}"/></clipPath><g clip-path="url(#piernas)">`;
  s += mancha('M136 310 L152 306 L151 336 C149 376 147 420 146 470 L132 470 C136 410 138 360 136 310 Z', panS);
  s += mancha('M180 310 L190 306 C198 366 202 420 204 472 L192 472 C190 410 186 360 180 310 Z', panS);
  s += mancha([
    [122, 330, 10, 7, 0.4], [140, 356, 9, 6, 1.3], [116, 384, 11, 7, 2.1], [138, 408, 10, 7, 0.7], [112, 436, 10, 7, 1.7],
    [134, 456, 11, 7, 0.2], [168, 326, 10, 7, 1.1], [186, 350, 9, 6, 0.3], [166, 380, 11, 7, 1.5], [190, 404, 10, 7, 2.3],
    [170, 432, 10, 7, 0.9], [192, 456, 11, 7, 1.9], [150, 310, 7, 5, 0.6]
  ].map((m) => manchita(...m)).join(''), mancha1);
  s += '</g>';
  s += linea('M126 340 C124 380 120 420 118 456 M178 340 C182 380 186 420 188 456', 1.6, panS);
  s += linea('M102 464 C114 458 132 460 146 466 M158 466 C172 460 190 458 204 464', 1.8, panS);

  // Polera negra
  s += forma('M124 168 L178 168 L182 310 L120 310 Z', polera);
  // Cuello
  s += forma('M140 134 L162 134 L163 166 C156 172 146 172 139 166 Z', piel);
  s += mancha('M154 136 L162 136 L162 164 C159 168 156 168 154 168 Z', pielS);
  // Cadena dorada con un colgante chico
  s += linea('M136 168 C140 194 162 194 166 168', 3.4, oroS);
  s += linea('M136 168 C140 192 162 192 166 168', 2, oro);
  s += forma('M148 190 L154 190 L154 198 L148 198 Z', oro, 1.6);

  // Chaqueta de trabajo, abierta y larga hasta la cadera
  s += forma('M102 186 C110 172 124 166 136 164 L134 176 C130 220 128 268 128 318 L100 318 C96 280 94 230 96 206 C96 196 98 190 102 186 Z', cha);
  s += forma('M198 186 C190 172 176 166 164 164 L166 176 C170 220 172 268 172 318 L200 318 C204 280 206 230 204 206 C204 196 202 190 198 186 Z', cha);
  s += mancha('M186 176 C196 184 202 194 204 210 C206 240 204 280 200 316 L190 316 C196 280 196 230 186 176 Z', chaS);
  // Costuras dobles de chaqueta de trabajo
  s += linea('M130 184 C127 230 125 270 124 312 M170 184 C173 230 175 270 176 312', 1.4, chaL, ' stroke-dasharray="4 3"');
  s += linea('M100 308 L128 308 M172 308 L200 308', 1.4, chaL, ' stroke-dasharray="4 3"');
  // Cuello de camisa
  s += forma('M136 162 L120 166 L130 190 L140 176 Z', cha, 2.4);
  s += forma('M164 162 L180 166 L170 190 L160 176 Z', cha, 2.4);
  s += linea('M124 168 L131 184 M176 168 L169 184', 1.2, chaL);
  // Bolsillo de pecho con su etiqueta, y bolsillo de abajo
  s += plana('M174 214 L196 212 L197 236 L175 238 Z', cha, 2);
  s += linea('M174 220 L196 218', 1.2, chaL);
  s += plana('M179 224 L191 223 L191 229 L179 230 Z', etiqueta, 1.4);
  s += plana('M104 262 L126 262 L126 290 L105 290 Z', cha, 2);
  s += linea('M104 268 L126 268', 1.2, chaL);
  // Pase de PRENSA colgando del cuello, al lado de la cadena
  s += credencialAncha(117, 214, 'PRENSA', 'M134 170 C130 186 124 200 119 214 M140 170 C136 188 128 202 123 214', 0.8);
  // La flor en la solapa, por Tyler
  s += florSolapa(170, 184);

  // Brazo derecho del espectador: la mano al bolsillo de la chaqueta
  s += tubo('M196 180 C210 204 214 244 208 280', cha, 22);
  s += mancha('M208 196 C214 220 214 250 210 272 L214 256 C216 236 214 214 208 196 Z', chaS);
  s += forma('M196 266 L220 264 L220 276 L196 278 Z', chaL, 2.2);
  s += forma('M198 280 C200 272 214 272 216 280 L216 290 L198 290 Z', piel, 2.2);
  s += forma('M192 286 L222 284 L222 298 L192 300 Z', cha, 2.2);

  s += cara();

  // Brazo izquierdo del espectador, en alto: la pelota gira en la punta del índice
  s += tubo('M104 180 C84 176 72 158 76 132', cha, 22);
  s += mancha('M86 170 C78 162 74 150 75 138 L80 138 C80 150 82 160 90 168 Z', chaS);
  s += forma('M62 128 L90 128 L90 140 L62 140 Z', chaL, 2.2);
  s += forma('M64 104 C64 96 88 96 88 104 L88 124 C84 130 68 130 64 124 Z', piel, 2.2);
  s += linea('M68 111 L84 111 M68 118 L84 118', 1.6, pielS);
  s += tubo('M77 100 L77 73', piel, 7, 2.2);
  s += pelota(77, 44, 27);
  // Giro
  s += linea('M40 30 C34 40 34 50 40 60', 2.6, C.cian);
  s += linea('M58 10 C68 5 86 5 96 10', 2.6, C.cian);
  return s;
}

// ───────── Elegante ─────────
export function felipeElegante() {
  const tux = '#16181C', tuxS = '#0D0F12', sat = '#30353E', satL = '#4E5561', cam = C.niebla, camS = '#C9D2DC';
  const panE = '#1A1D22', panES = '#101216', franja = '#383E48', charol = '#101215', brillo = '#6B7684';
  const humitaS = '#9E1B21';
  let s = suelo(150, 503, 80);

  // Calcetines rojos y zapatos de charol
  s += plana('M112 462 L142 462 L142 482 L110 482 Z', P.rojo, 2);
  s += plana('M158 462 L188 462 L190 482 L158 482 Z', P.rojo, 2);
  s += forma('M110 478 L144 478 C148 486 148 494 146 499 L96 499 C88 496 92 484 110 478 Z', charol);
  s += linea('M102 488 C110 483 122 482 132 484', 2.2, brillo, ' opacity=".9"');
  s += forma('M92 497 L148 497 L148 503 L92 503 Z', '#0B0D10', 2);
  s += forma('M156 478 L190 478 C208 484 212 496 204 499 L154 499 C152 494 152 486 156 478 Z', charol);
  s += linea('M168 484 C178 482 190 483 198 488', 2.2, brillo, ' opacity=".9"');
  s += forma('M152 497 L208 497 L208 503 L152 503 Z', '#0B0D10', 2);

  // Pantalón recto con franja de satén
  s += forma('M116 300 L152 300 L150 330 C148 370 146 420 145 466 L110 466 C112 420 114 360 116 300 Z', panE);
  s += forma('M152 300 L188 300 C188 360 190 420 190 466 L157 466 C156 420 154 370 152 330 Z', panE);
  s += mancha('M138 304 L152 300 L150 330 C148 370 146 420 145 464 L136 464 C138 410 140 350 138 304 Z', panES);
  s += mancha('M180 304 L188 300 C188 360 190 420 190 464 L182 464 C182 410 182 350 180 304 Z', panES);
  s += linea('M117 308 C115 378 113 428 112 460', 3, franja);
  s += linea('M187 308 C188 378 189 428 189 460', 3, franja);

  // Camisa blanca, que se ve en la V, con dos botones de pechera
  s += forma('M126 164 L176 164 L160 256 L142 256 Z', cam);
  s += mancha('M160 168 L176 164 L160 254 L154 254 Z', camS);
  s += `<circle cx="151" cy="200" r="2.6" fill="${C.tinta}"/><circle cx="151" cy="222" r="2.6" fill="${C.tinta}"/>`;
  // Cuello y el cuello de la camisa
  s += forma('M140 134 L162 134 L163 160 C156 166 146 166 139 160 Z', piel);
  s += mancha('M154 136 L162 136 L162 158 C159 162 156 162 154 162 Z', pielS);
  s += forma('M140 158 L151 170 L134 174 Z', cam, 2);
  s += forma('M162 158 L151 170 L168 174 Z', cam, 2);

  // Esmoquin negro, con la V abierta hasta el botón
  s += forma('M100 180 C112 166 126 162 136 160 L151 252 L166 160 C176 162 190 166 202 180 C208 196 208 230 206 262 L204 318 L98 318 L96 262 C94 230 94 196 100 180 Z', tux);
  s += mancha('M188 172 C198 180 204 192 206 210 C208 236 206 280 204 316 L192 316 C196 280 198 232 188 172 Z', tuxS);
  // Solapas de satén con pico, y el botón
  s += forma('M136 160 L151 252 L144 252 L122 198 L110 190 L117 177 L128 170 Z', sat, 2.4);
  s += forma('M166 160 L151 252 L158 252 L180 198 L192 190 L185 177 L174 170 Z', sat, 2.4);
  s += linea('M131 176 L147 238 M171 176 L155 238', 2, satL);
  s += `<circle cx="151" cy="260" r="4.4" fill="${sat}" stroke="${C.tinta}" stroke-width="1.8"/>`;
  // Bolsillos con ribete
  s += linea('M104 286 L126 286 M176 286 L198 286', 2.6, sat);
  // Humita roja, como el pelo
  s += forma('M150 170 L134 161 C130 166 130 176 134 181 Z', P.rojo, 2.2);
  s += forma('M152 170 L168 161 C172 166 172 176 168 181 Z', P.rojo, 2.2);
  s += forma('M146 165 L156 165 L157 176 L145 176 Z', humitaS, 2);
  // La flor en el ojal, por Tyler
  s += florSolapa(178, 204);

  // Brazo derecho del espectador: la pelota contra la cadera
  s += pelota(204, 292, 25);
  s += tubo('M198 176 C214 200 224 240 224 280', tux, 22);
  s += mancha('M210 192 C218 214 222 244 222 270 L226 256 C226 234 220 210 210 192 Z', tuxS);
  s += forma('M212 276 L236 276 L236 288 L212 288 Z', cam, 2.2);
  s += forma('M214 288 C214 296 218 304 226 306 C234 304 238 294 236 288 Z', piel, 2.2);

  s += cara();

  // Brazo izquierdo del espectador: el micrófono de BiPlot a la altura del mentón
  s += tubo('M104 180 C90 206 90 236 102 246 C112 252 122 238 124 216', tux, 22);
  s += forma('M112 212 L136 212 L136 224 L112 224 Z', cam, 2.2);
  s += tubo('M124 196 L124 166', '#1F252E', 7, 2);
  s += forma('M115 170 L133 170 L133 186 L115 186 Z', C.cian, 2);
  s += `<g transform="translate(117 172) scale(.14)"><path d="M27 23V75H80" fill="none" stroke="#0E2A47" stroke-width="7" stroke-linecap="round"/><path d="M31 67L45 53L59 57L72 35" fill="none" stroke="#0E2A47" stroke-width="7" stroke-linecap="round"/></g>`;
  s += `<circle cx="124" cy="156" r="10" fill="#3A424E" stroke="${C.tinta}" stroke-width="2.2"/>`;
  s += linea('M117 153 L131 153 M116.5 157 L131.5 157 M118 161 L130 161', 1, C.a300, ' opacity=".7"');
  s += forma('M112 192 C112 184 136 184 136 192 L136 210 C130 216 116 216 112 210 Z', piel, 2.2);
  s += linea('M116 198 L132 198 M116 204 L132 204', 1.6, pielS);
  return s;
}
