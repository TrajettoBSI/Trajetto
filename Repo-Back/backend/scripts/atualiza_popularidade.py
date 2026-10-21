"""
Grava em cada ponto do catalogo (data/cities/<slug>.geojson) o campo "popularity":
em quantas edicoes da Wikipedia o lugar tem artigo, segundo o Wikidata.
Ponto sem codigo do Wikidata fica com 0.

Uso, a partir de Repo-Back/backend:
    python scripts/atualiza_popularidade.py            # todas as cidades
    python scripts/atualiza_popularidade.py roma       # so uma
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

CIDADES = Path(__file__).resolve().parent.parent / 'src/main/resources/data/cities'
SPARQL = 'https://query.wikidata.org/sparql'
LOTE = 150


def consulta_sitelinks(qids):
    valores = ' '.join(f'wd:{q}' for q in qids)
    query = f'SELECT ?item ?links WHERE {{ VALUES ?item {{ {valores} }} ?item wikibase:sitelinks ?links }}'
    url = SPARQL + '?' + urllib.parse.urlencode({'query': query})
    req = urllib.request.Request(url, headers={
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'TrajettoTCC/1.0 (estudo academico)',
    })
    with urllib.request.urlopen(req, timeout=60) as resp:
        dados = json.load(resp)
    return {
        b['item']['value'].rsplit('/', 1)[-1]: int(b['links']['value'])
        for b in dados['results']['bindings']
    }


def aplica_popularidade(props):
    qids = sorted({p['wikidata'] for p in props if p.get('wikidata', '').startswith('Q')})
    sitelinks = {}
    for i in range(0, len(qids), LOTE):
        sitelinks.update(consulta_sitelinks(qids[i:i + LOTE]))
        time.sleep(1)

    for p in props:
        p['popularity'] = sitelinks.get(p.get('wikidata', ''), 0)
    print(f'{len(sitelinks)} de {len(qids)} codigos do Wikidata consultados.')


def atualiza(catalogo_path):
    texto = catalogo_path.read_text(encoding='utf-8')
    catalogo = json.loads(texto)
    props = [f['properties'] for f in catalogo['features']]
    aplica_popularidade(props)

    catalogo_path.write_text(json.dumps(catalogo, ensure_ascii=False, indent=2) + ('\n' if texto.endswith('\n') else ''),
                             encoding='utf-8', newline='\n')

    ranking = sorted(props, key=lambda p: p['popularity'], reverse=True)[:15]
    print(f'== {catalogo_path.stem}')
    for p in ranking:
        print(f"{p['popularity']:4d}  {p['name']}")


def main():
    slugs = sys.argv[1:]
    arquivos = [CIDADES / f'{s}.geojson' for s in slugs] if slugs else sorted(CIDADES.glob('*.geojson'))
    for arquivo in arquivos:
        atualiza(arquivo)


if __name__ == '__main__':
    main()
