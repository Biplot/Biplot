// Ayudas para armar definiciones bible-strong/avatar-definition v1 (las que importa avatars.bible-strong.app)
export const r = (n) => Math.round(n * 100) / 100;
export const ojo = (width, height, x = 0, y = 0, angle = 0) => ({ width, height, x, y, angle });
// Una expresión: giro de la cabeza (x arriba/abajo, y a los lados, z ladeo, en grados), los dos ojos y el movimiento
export function expr({ head = [0, 0, 0], left, right, spacing, eyes = 'none', body = 'slowDrift', colors }) {
  const e = { head: { x: head[0], y: head[1], z: head[2] }, eyes: { left, right: right ?? left, spacing }, perspective: 1, motion: { eyes, body } };
  if (colors) e.colors = colors;
  return e;
}
export const nodo = (type, dims, position, rotation = [0, 0, 0], extra = {}) => ({
  surface: { type, width: r(dims[0]), height: r(dims[1]), depth: r(dims[2]), roundness: type === 'sphere' || type === 'capsule' ? 1 : 0.4, ...extra },
  position: position.map(r), rotation
});
export const paso = (expression, holdMs, transitionMs = 450, transition = 'spring') => ({ expression, holdMs, transitionMs, transition });
export const parpadeo = (min, max, dur = 260, ini = 1800, enabled = true) => ({ enabled, initialDelayMs: ini, minIntervalMs: min, maxIntervalMs: max, durationMs: dur });
export const animacion = (label, description, group, playbackMode, steps, blink) => ({ playbackMode, steps, blink, metadata: { label, description, group } });
export function definicion(name, body, colors, E, A) {
  return { schema: 'bible-strong/avatar-definition', schemaVersion: 1, name, body, colors,
    expressions: E, expressionOrder: Object.keys(E), animations: A, animationOrder: Object.keys(A) };
}
