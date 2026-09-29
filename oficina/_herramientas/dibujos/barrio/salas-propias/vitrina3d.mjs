// Una vitrina en 3D (El Archivo): graba lo que se dibuja en ella, con las mismas llamadas del dibujo de la sala (caja,
// cil, planoY, piso, linea, poly/add y, en archivo.mjs, plano y la figura del elefante), en coordenadas propias: el
// centro del pedestal en el origen y z hacia arriba, en baldosas. La oficina la hace girar (oficina/vitrina3d.js): la
// rota, la proyecta como la sala, ordena sus caras de atrás hacia adelante y las sombrea según hacia dónde miran.
//
// El modelo: cajas [x, y, z, w, d, h, arriba, izquierda, derecha] (los colores de la caja en la sala), cils [x, y, z, r,
// h, arriba, lado], planos { o, u, v, a, h, svg, dorso?, suelo? } (un dibujo de a × h sobre el plano que va de o a o + u
// y o + v; dorso es el color de su revés), lineas { p, c, w }, polys { pts, attr } (los vidrios) y figuras { svg, o, h,
// ax, ay } (un dibujo parado, siempre de frente, con su pie en ax, ay).
const TW = 32, TH = 16, ZH = 39;
const r3 = (n) => Math.round(n * 1000) / 1000;
const r1 = (n) => Math.round(n * 10) / 10;

export function grabador(cx, cy) {
  const M = { cajas: [], cils: [], planos: [], lineas: [], polys: [], figuras: [] };
  const g = (x, y, z = 0) => [r3(x - cx), r3(y - cy), r3(z)];
  const R = {
    tres: true, modelo: M, bajo: false,
    E: { marca() {} },
    P: () => [0, 0],
    caja(x, y, z, w, d, h, c) {
      const k = typeof c === 'string' ? { t: c } : c;
      M.cajas.push([...g(x, y, z), r3(w), r3(d), r3(h), k.t, k.l || '', k.r || '']);
      return R;
    },
    cil(x, y, z, r, h, arriba, lado) { M.cils.push([...g(x, y, z), r3(r), r3(h), arriba, lado]); return R; },
    // Un dibujo sobre el plano vertical y = y0 (a lo ancho hacia +x, hacia abajo desde zTop)
    planoY(x0, y0, zTop, a, h, svg, k, dorso) { M.planos.push({ o: g(x0, y0, zTop), u: [r3(a / 100), 0, 0], v: [0, 0, r3(-h / 100)], a, h, svg, ...(dorso ? { dorso } : {}) }); return R; },
    // Un dibujo sobre un plano cualquiera (o, la esquina de arriba a la izquierda; u y v, sus lados en baldosas)
    plano(o, u, v, a, h, svg, dorso) { M.planos.push({ o: g(...o), u: u.map(r3), v: v.map(r3), a, h, svg, ...(dorso ? { dorso } : {}) }); return R; },
    // Un dibujo en el piso (o sobre una superficie horizontal a la altura z): 100 = una baldosa
    piso(x0, y0, svg, k, z = 0.03) { M.planos.push({ o: g(x0, y0, z), u: [1, 0, 0], v: [0, 1, 0], a: 100, h: 100, svg, suelo: true }); return R; },
    linea(pts, c, w) { M.lineas.push({ p: pts.map((q) => g(...q)), c, w }); return R; },
    poly(pts, attr) { return { pts: pts.map((q) => g(...q)), attr }; },
    add(k, x) { if (x && x.pts) M.polys.push(x); return R; },
    figura(svg, x, y, z, h, ax, ay) { M.figuras.push({ svg, o: g(x, y, z), h: r3(h), ax, ay }); return R; }
  };
  return R;
}

// El marco donde gira: el círculo que barre la vitrina (sin la luz del piso, que se apaga hacia los bordes) y su alto,
// al menos alto (así todas las vitrinas se ven del mismo tamaño, con vidrio o sin él); en unidades del dibujo de la sala.
// ancho y alto, para la vista de frente, van ocho veces más grandes.
export function marco3d(M, alto = 0) {
  let rad = 0, zmax = alto;
  const ver = (x, y, z) => { rad = Math.max(rad, Math.hypot(x, y)); zmax = Math.max(zmax, z); };
  for (const [x, y, z, w, d, h] of M.cajas) for (const [a, b] of [[x, y], [x + w, y], [x, y + d], [x + w, y + d]]) ver(a, b, z + h);
  for (const [x, y, z, r, h] of M.cils) ver(Math.hypot(x, y) + r, 0, z + h);
  for (const p of M.planos) if (!p.suelo) for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) ver(...p.o.map((c, k) => c + p.u[k] * i + p.v[k] * j));
  for (const l of M.lineas) for (const q of l.p) ver(...q);
  for (const q of M.polys) for (const p of q.pts) ver(...p);
  for (const f of M.figuras) ver(Math.hypot(f.o[0], f.o[1]) + 0.35, 0, f.o[2] + f.h);
  const rx = rad * Math.SQRT2 * TW, ry = rad * Math.SQRT2 * TH, px = 22, py = 10;
  const vb = [-rx - px, -(ry + zmax * ZH) - py, 2 * (rx + px), 2 * ry + zmax * ZH + 2 * py].map(r1);
  return { vb, ancho: Math.round(vb[2] * 8), alto: Math.round(vb[3] * 8) };
}
