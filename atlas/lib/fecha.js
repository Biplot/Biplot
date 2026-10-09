// Las fechas de la bóveda van siempre en hora de Chile (America/Santiago), como pide su CLAUDE.md
const ZONA = 'America/Santiago';

// AAAA-MM-DD en Chile
export function hoyChile(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

// La hora (0 a 23) en Chile
export function horaChile(d = new Date()) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: ZONA, hour: 'numeric', hourCycle: 'h23' }).format(d));
}

// «viernes 9 de octubre de 2026», para el prompt y el resumen
export function fechaLarga(d = new Date()) {
  return new Intl.DateTimeFormat('es-CL', { timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

// Días entre dos fechas AAAA-MM-DD (b - a)
export function diasEntre(a, b) {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);
}
