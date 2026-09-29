// Exporta el elefante de Rumbo (Biplot/rumbo, js/elefante.js) como SVG fijo para su sala en la oficina
import fs from 'node:fs'; import vm from 'node:vm';
// Uso: node exportar-elefantes.mjs <carpeta del repo rumbo> (rehace elefantes.mjs, junto a este archivo)
const code = fs.readFileSync((process.argv[2] || '../rumbo') + '/js/elefante.js', 'utf8');
const ctx = { STATE: { gamif: { xp: 5000, equipped: {}, owned: [], badges: [] }, ritual: { dias: {} }, vida: {} }, window: {}, document: {} };
vm.createContext(ctx);
vm.runInContext(code + '\n;this.elefanteSVG = elefanteSVG;', ctx);
const interior = (op) => ctx.elefanteSVG({ anim: false, tipo: 'clasico', animo: 'feliz', ...op }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s*\n\s*/g, '');
const piezas = {
  ESTATUA: interior({ etapa: 2, ropa: { cuello: 'bufanda', espalda: 'mochila' } }),
  MANIQUI: interior({ etapa: 1, ropa: { cabeza: 'jockey', cuello: 'humita' } }),
  ETAPAS: [0, 1, 2, 3].map((i) => interior({ etapa: i, ropa: i === 3 ? { cabeza: 'corona' } : {} }))
};
const js = `// El elefante de Rumbo, con su propio dibujo (repo Biplot/rumbo, js/elefante.js), exportado como SVG fijo.
// Cada pieza va en un cuadro de 260 × 240, con los pies en (128, 222). Se vuelve a sacar con exportar-elefantes.mjs.
export const ESTATUA = ${JSON.stringify(piezas.ESTATUA)};
export const MANIQUI = ${JSON.stringify(piezas.MANIQUI)};
export const ETAPAS = ${JSON.stringify(piezas.ETAPAS, null, 0)};
`;
fs.writeFileSync(new URL('./elefantes.mjs', import.meta.url), js);
console.log(js.length);
