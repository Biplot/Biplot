# Saca de las dos fuentes de los dibujos (Alfa Slab One y Archivo Black, licencia OFL) el contorno de las letras que usan
# (números de camiseta, KILO, MANUAL, REC, PRENSA, 360°…), para que generar.mjs las dibuje como trazos y la ilustración no
# dependa de que la página cargue esas fuentes. Se corre una vez, sólo si cambian las letras:
#   pip install fonttools
#   python3 glifos.py <AlfaSlabOne-Regular.ttf> <ArchivoBlack-Regular.ttf>   → glifos.json
# Las fuentes se bajan de Google Fonts (no se suben al repo).
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

LETRAS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ°<>/.-'


# Cada contorno en comandos absolutos y explícitos (M, L, Q, C, Z), en unidades de la fuente con la y hacia arriba:
# así generar.mjs sólo tiene que escalar y mover cada par de números.
class Pluma(BasePen):
    def __init__(self, gs):
        super().__init__(gs)
        self.d = []

    def _xy(self, *pts):
        return ' '.join(f'{round(x)} {round(y)}' for x, y in pts)

    def _moveTo(self, p):
        self.d.append('M' + self._xy(p))

    def _lineTo(self, p):
        self.d.append('L' + self._xy(p))

    def _curveToOne(self, a, b, c):
        self.d.append('C' + self._xy(a, b, c))

    def _qCurveToOne(self, a, b):
        self.d.append('Q' + self._xy(a, b))

    def _closePath(self):
        self.d.append('Z')


def glifos(ruta):
    f = TTFont(ruta)
    cmap, gs = f.getBestCmap(), f.getGlyphSet()
    salida = {'em': f['head'].unitsPerEm, 'letras': {}}
    for c in LETRAS:
        nombre = cmap.get(ord(c))
        if not nombre:
            continue
        pluma = Pluma(gs)
        gs[nombre].draw(pluma)
        salida['letras'][c] = {'a': gs[nombre].width, 'd': ''.join(pluma.d)}
    return salida


alfa, archivo = sys.argv[1], sys.argv[2]
with open('glifos.json', 'w') as out:
    json.dump({'alfa': glifos(alfa), 'archivo': glifos(archivo)}, out, separators=(',', ':'))
print('glifos.json')
