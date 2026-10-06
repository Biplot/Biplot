// La lámina común del elenco en la línea de la banda: fondo, fuentes y la tinta a mano (siempre).
export const FUENTES = `<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Archivo+Black&display=block" rel="stylesheet">`;
// La tinta a mano: el contorno tiembla apenas (desplazamiento con ruido), como pincel sobre papel
export const TINTA = `<defs><filter id="a-mano" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`;
export const NUMERO = "'Alfa Slab One', 'Archivo Black', serif";   // el número de camiseta, de losa gruesa
export const LETRA = "'Archivo Black', 'Arial Black', sans-serif";
// Un personaje (o varios) en su marco, sobre fondo negro, con la tinta a mano
export function lamina(contenido, { ancho = 600, alto = 1260, fondo = '#000', extraDefs = '' } = {}) {
  return FUENTES + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}">${extraDefs}<rect width="${ancho}" height="${alto}" fill="${fondo}"/>${TINTA}<g filter="url(#a-mano)">${contenido}</g></svg>`;
}
