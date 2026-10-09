// Markdown de la bóveda, lo justo para leerlo en la pantalla: títulos, listas, callouts, tablas, código, negritas y
// los enlaces [[Página|texto]] (que abren la página). Todo se escapa antes: nada del texto llega como HTML.
const escapar = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function enLinea(texto) {
  let s = escapar(texto);
  const codigos = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${codigos.push(c) - 1}\u0000`);
  s = s.replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, pagina, alias) => {
    const nombre = pagina.split('#')[0].trim();
    return `<a class="wl" href="#" data-pagina="${nombre}">${alias ?? pagina}</a>`;
  });
  s = s.replace(/\[([^\]]+)\]\(((?:https?|obsidian):\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  s = s.replace(/^\[ \]\s/, '☐ ').replace(/^\[[xX]\]\s/, '☑ ');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codigos[i]}</code>`);      // ya venían escapados
}

export function markdown(texto, { propiedades = false } = {}) {
  let t = String(texto ?? '').replace(/\r\n/g, '\n');
  let html = '';
  const fm = t.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) { if (propiedades) html += `<details class="propiedades"><summary>Propiedades</summary>${escapar(fm[1])}</details>`; t = t.slice(fm[0].length); }
  const lineas = t.split('\n');
  for (let i = 0; i < lineas.length;) {
    const l = lineas[i];
    if (!l.trim()) { i++; continue; }
    if (/^```/.test(l)) {
      const bloque = [];
      for (i++; i < lineas.length && !/^```/.test(lineas[i]); i++) bloque.push(lineas[i]);
      i++;
      html += `<pre><code>${escapar(bloque.join('\n'))}</code></pre>`;
      continue;
    }
    const titulo = l.match(/^(#{1,6})\s+(.*)$/);
    if (titulo) { const n = Math.min(5, titulo[1].length + 2); html += `<h${n}>${enLinea(titulo[2])}</h${n}>`; i++; continue; }
    if (/^(-{3,}|\*{3,})\s*$/.test(l)) { html += '<hr>'; i++; continue; }
    if (/^>/.test(l)) {
      const bloque = [];
      for (; i < lineas.length && /^>/.test(lineas[i]); i++) bloque.push(lineas[i].replace(/^>\s?/, ''));
      let cabeza = '';
      const callout = bloque[0]?.match(/^\[!(\w+)\][-+]?\s*(.*)$/);
      if (callout) { cabeza = `<span class="callout">${enLinea(callout[2] || callout[1])}</span>`; bloque.shift(); }
      html += `<blockquote>${cabeza}${markdown(bloque.join('\n'))}</blockquote>`;
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(l)) {
      const filas = [];
      for (; i < lineas.length && /^\s*\|.*\|\s*$/.test(lineas[i]); i++) filas.push(lineas[i]);
      const celdas = (f) => f.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const separador = filas[1] && /^[\s|:-]+$/.test(filas[1]);
      const cabeza = separador ? `<thead><tr>${celdas(filas[0]).map((c) => `<th>${enLinea(c)}</th>`).join('')}</tr></thead>` : '';
      const cuerpo = filas.slice(separador ? 2 : 0).map((f) => `<tr>${celdas(f).map((c) => `<td>${enLinea(c)}</td>`).join('')}</tr>`).join('');
      html += `<table>${cabeza}<tbody>${cuerpo}</tbody></table>`;
      continue;
    }
    const punto = /^(\s*)([-*+]|\d+[.)])\s+/;
    if (punto.test(l)) {
      const ordenada = /^\s*\d/.test(l);
      const items = [];
      for (; i < lineas.length && (punto.test(lineas[i]) || (/^\s{2,}\S/.test(lineas[i]) && items.length)); i++) {
        if (punto.test(lineas[i])) items.push(lineas[i].replace(punto, ''));
        else items[items.length - 1] += ` ${lineas[i].trim()}`;
      }
      html += `<${ordenada ? 'ol' : 'ul'}>${items.map((x) => `<li>${enLinea(x)}</li>`).join('')}</${ordenada ? 'ol' : 'ul'}>`;
      continue;
    }
    const parrafo = [];
    for (; i < lineas.length && lineas[i].trim() && !/^(#{1,6}\s|>|```|\s*\||\s*([-*+]|\d+[.)])\s)/.test(lineas[i]); i++) parrafo.push(lineas[i]);
    if (!parrafo.length) { parrafo.push(lineas[i]); i++; }
    html += `<p>${parrafo.map(enLinea).join('<br>')}</p>`;
  }
  return html;
}

// Lo que se dice en voz alta: sin marcas, los enlaces como su texto y sin direcciones
export function paraDecir(texto) {
  return String(texto)
    .replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, p, a) => a ?? p.split('#')[0])
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~#>]/g, '')
    .replace(/^\s*[-+]\s+/gm, '')
    .replace(/\[[ xX]\]\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
