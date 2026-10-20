"""
Gera o catalogo de pontos turisticos de uma cidade (data/cities/<slug>.geojson)
a partir do OpenStreetMap, no mesmo formato do catalogo curado de Roma.

A cidade precisa estar antes no manifesto data/cities.json (centro, raio, fuso,
as cozinhas "locais", que decidem se um restaurante conta como LUXO ou MOCHILEIRO,
e, opcional, "preferEnglishName" para usar o nome em ingles do OSM).

Como fica a selecao:
  * atracoes, museus, parques e afins entram se tiverem algum sinal de que sao
    conhecidos -- codigo do Wikidata, artigo na Wikipedia, site ou horario;
  * comida e bebida entram so perto do centro, com horario e site ou telefone
    cadastrados, ate um teto por categoria;
  * teatros e templos entram so com codigo do Wikidata (sao muitos, e so os
    conhecidos interessam);
  * codigo do Wikidata que nao descreve o proprio lugar (uma pessoa, um tipo de
    coisa -- p.ex. a estatua marcada com o codigo do aviao que ela retrata -- ou
    um lugar longe dali) e descartado, para nao inflar a popularidade;
  * ponto cujo centro cai fora do raio (um aqueduto de 100 km pego pela ponta)
    fica de fora;
  * o mesmo lugar (nome ou codigo do Wikidata repetido) entra uma vez so;
  * no fim, cada ponto recebe "popularity" (ver atualiza_popularidade.py) e os
    pontos que nao sao comida ficam limitados aos mais populares.

O resultado e um ponto de partida: vale abrir o arquivo e revisar a lista antes
de subir -- foi assim que o catalogo de Roma foi curado.

Uso, a partir de Repo-Back/backend:
    python scripts/gera_catalogo_cidade.py curitiba
    python scripts/gera_catalogo_cidade.py --revisar curitiba   # so refaz Wikidata e popularidade
"""
import http.client
import json
import math
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from atualiza_popularidade import SPARQL, aplica_popularidade  # noqa: E402

DADOS = Path(__file__).resolve().parent.parent / 'src/main/resources/data'
# O servidor principal do Overpass vive sobrecarregado; o espelho entra quando ele falha.
OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
USER_AGENT = 'TrajettoTCC/1.0 (estudo academico)'

TOURISM = ['museum', 'attraction', 'gallery', 'zoo', 'theme_park', 'viewpoint', 'artwork']
HISTORIC = ['archaeological_site', 'ruins', 'church', 'monument', 'temple', 'castle', 'citywalls',
            'fort', 'villa', 'aqueduct', 'tower', 'monastery']
LEISURE = ['park', 'garden', 'nature_reserve']
AMENITY = ['restaurant', 'cafe', 'bar', 'pub', 'ice_cream', 'marketplace']
# Amenities que viram uma categoria que o app ja conhece.
AMENITY_COMO = {'theatre': 'attraction', 'place_of_worship': 'historic_church'}

# Mesmos perfis que o catalogo de Roma usa para cada categoria.
PERFIS = {
    'museum': ['CULTURAL', 'LUXO'],
    'gallery': ['CULTURAL', 'LUXO'],
    'attraction': ['AVENTUREIRO', 'CULTURAL'],
    'zoo': ['AVENTUREIRO'],
    'theme_park': ['AVENTUREIRO'],
    'viewpoint': ['RELAXAMENTO', 'SOLITARIO'],
    'artwork': ['CULTURAL'],
    'historic_archaeological_site': ['AVENTUREIRO', 'CULTURAL'],
    'historic_ruins': ['AVENTUREIRO', 'CULTURAL'],
    'historic_castle': ['AVENTUREIRO', 'CULTURAL'],
    'historic_fort': ['AVENTUREIRO', 'CULTURAL'],
    'park': ['NATUREZA', 'RELAXAMENTO'],
    'garden': ['NATUREZA', 'RELAXAMENTO', 'SOLITARIO'],
    'nature_reserve': ['NATUREZA'],
    'cafe': ['RELAXAMENTO', 'SOCIAL'],
    'ice_cream': ['RELAXAMENTO', 'SOCIAL'],
    'bar': ['MOCHILEIRO', 'SOCIAL'],
    'pub': ['MOCHILEIRO', 'SOCIAL'],
    'marketplace': ['MOCHILEIRO', 'SOCIAL'],
}
PERFIS_HISTORICO = ['CULTURAL', 'SOLITARIO']

COMIDA = {'restaurant', 'cafe', 'bar', 'pub', 'ice_cream'}
# Categorias em que o codigo do Wikidata costuma ser o do tema retratado, nao o da obra.
OBRAS = {'artwork', 'historic_monument'}
TETO_COMIDA = {'restaurant': 120, 'cafe': 40, 'bar': 10, 'pub': 20, 'ice_cream': 25}
TETO_RESTANTE = 650
# Cidade grande tem centenas de igrejas com Wikidata; sem teto elas tomam o catalogo.
TETO_CATEGORIA = {'historic_church': 40}
TETO_CATEGORIA_PADRAO = 150
# Comida so perto do centro: fracao do raio da cidade.
RAIO_COMIDA = 0.4


def carrega_cidade(slug):
    cidades = json.loads((DADOS / 'cities.json').read_text(encoding='utf-8'))
    for cidade in cidades:
        if cidade['slug'] == slug:
            return cidade
    sys.exit(f'Cidade "{slug}" nao esta em data/cities.json. Cadastre-a la primeiro.')


def consulta_overpass(cidade):
    lat, lon = cidade['latitude'], cidade['longitude']
    raio = int(cidade['radiusKm'] * 1000)
    raio_comida = int(raio * RAIO_COMIDA)

    def lista(valores):
        return '^(' + '|'.join(valores) + ')$'

    comida = [a for a in AMENITY if a in COMIDA]
    query = f"""
    [out:json][timeout:300];
    (
      nwr(around:{raio},{lat},{lon})["name"]["tourism"~"{lista(TOURISM)}"];
      nwr(around:{raio},{lat},{lon})["name"]["historic"~"{lista(HISTORIC)}"];
      nwr(around:{raio},{lat},{lon})["name"]["leisure"~"{lista(LEISURE)}"];
      nwr(around:{raio},{lat},{lon})["name"]["amenity"="marketplace"];
      nwr(around:{raio},{lat},{lon})["name"]["amenity"~"{lista(AMENITY_COMO)}"]["wikidata"];
      nwr(around:{raio_comida},{lat},{lon})["name"]["amenity"~"{lista(comida)}"]["opening_hours"];
    );
    out center tags;
    """
    dados = urllib.parse.urlencode({'data': query}).encode()
    for tentativa in range(3):
        for url in OVERPASS:
            req = urllib.request.Request(url, data=dados, headers={'User-Agent': USER_AGENT})
            try:
                with urllib.request.urlopen(req, timeout=360) as resp:
                    return json.load(resp)['elements']
            except (OSError, http.client.HTTPException) as erro:  # inclui HTTPError e timeout
                print(f'  {url} falhou ({erro}); tentando de novo...')
        time.sleep(10 * (tentativa + 1))
    sys.exit('Overpass indisponivel. Tente mais tarde.')


def categoria(tags):
    if tags.get('tourism') in TOURISM:
        return tags['tourism']
    if tags.get('historic') in HISTORIC:
        return 'historic_' + tags['historic']
    if tags.get('leisure') in LEISURE:
        return tags['leisure']
    if tags.get('amenity') in AMENITY:
        return tags['amenity']
    if tags.get('amenity') in AMENITY_COMO and tags.get('wikidata'):
        return AMENITY_COMO[tags['amenity']]
    return None


def perfis(cat, tags, cozinhas_locais):
    if cat == 'restaurant':
        cozinhas = {c.strip() for c in tags.get('cuisine', '').split(';')}
        return ['LUXO', 'SOCIAL'] if cozinhas & set(cozinhas_locais) else ['MOCHILEIRO', 'SOCIAL']
    if cat.startswith('historic_') and cat not in PERFIS:
        return PERFIS_HISTORICO
    return PERFIS.get(cat, [])


def endereco(tags, nome_cidade):
    rua = tags.get('addr:street')
    if not rua:
        return None
    partes = [rua]
    if tags.get('addr:housenumber'):
        partes.append(tags['addr:housenumber'])
    partes.append(tags.get('addr:city', nome_cidade))
    return ', '.join(partes)


def notavel(tags):
    return any(tags.get(k) for k in ('wikidata', 'wikipedia', 'website', 'contact:website', 'opening_hours'))


def riqueza(props):
    """Desempate entre lugares de comida: quanto mais completo o cadastro, melhor."""
    return sum(1 for k in ('address', 'phone', 'wheelchair', 'cuisine', 'wikidata') if props.get(k))


def para_feature(elemento, cidade):
    tags = elemento.get('tags', {})
    cat = categoria(tags)
    if cat is None:
        return None
    lat = elemento.get('lat', elemento.get('center', {}).get('lat'))
    lon = elemento.get('lon', elemento.get('center', {}).get('lon'))
    if lat is None or lon is None:
        return None
    # Linha comprida (aqueduto, muralha) pega pela ponta tem o centro fora da cidade.
    if distancia_km(lat, lon, cidade['latitude'], cidade['longitude']) > cidade['radiusKm']:
        return None
    if cat in COMIDA:
        if not any(tags.get(k) for k in ('website', 'contact:website', 'phone', 'contact:phone')):
            return None
    elif not notavel(tags):
        return None

    nome = tags['name'].strip()
    nome_en = tags.get('name:en')
    # Em cidade de outro alfabeto (Toquio), o nome em ingles e o que o viajante consegue ler.
    if cidade.get('preferEnglishName') and nome_en:
        nome, nome_en = nome_en.strip(), nome
    props = {
        'name': nome,
        'name_en': nome_en,
        'category': cat,
        'profiles': perfis(cat, tags, cidade.get('localCuisine', [])),
        'latitude': lat,
        'longitude': lon,
        'address': endereco(tags, cidade['name']),
        'opening_hours': tags.get('opening_hours'),
        'phone': tags.get('phone') or tags.get('contact:phone'),
        'website': tags.get('website') or tags.get('contact:website'),
        'wikidata': tags.get('wikidata'),
        'wikipedia': tags.get('wikipedia'),
        'fee': tags.get('fee') if tags.get('fee') in ('yes', 'no') else None,
        'wheelchair': tags.get('wheelchair'),
        'cuisine': tags.get('cuisine'),
    }
    props = {k: v for k, v in props.items() if v not in (None, '')}
    if props.get('name_en') == props['name']:
        del props['name_en']
    return {
        'type': 'Feature',
        'geometry': {'type': 'Point', 'coordinates': [lon, lat]},
        'properties': props,
    }


def qids_que_nao_sao_o_lugar(features):
    """
    Codigos do Wikidata que nao descrevem o proprio ponto: uma pessoa (Q5), um tipo
    de coisa (tem "subclasse de", P279 -- como o modelo de aviao), um lugar com
    coordenadas a mais de 5 km do ponto do OSM, ou -- em estatuas e monumentos --
    um item sem coordenadas, que e o tema retratado (o deus Tritao, a Marinha).
    """
    pontos = {f['properties']['wikidata']: f['properties'] for f in features
              if f['properties'].get('wikidata', '').startswith('Q')}
    qids = sorted(pontos)
    errados = set()
    com_coordenadas = set()
    for i in range(0, len(qids), 150):
        valores = ' '.join(f'wd:{q}' for q in qids[i:i + 150])
        query = (f'SELECT ?item ?humano ?classe ?coord WHERE {{ VALUES ?item {{ {valores} }} '
                 'OPTIONAL { ?item wdt:P31 wd:Q5 . BIND(1 AS ?humano) } '
                 'OPTIONAL { ?item wdt:P279 ?classe } '
                 'OPTIONAL { ?item wdt:P625 ?coord } }')
        url = SPARQL + '?' + urllib.parse.urlencode({'query': query})
        req = urllib.request.Request(url, headers={
            'Accept': 'application/sparql-results+json', 'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=60) as resp:
            dados = json.load(resp)
        for b in dados['results']['bindings']:
            qid = b['item']['value'].rsplit('/', 1)[-1]
            if 'humano' in b or 'classe' in b:
                errados.add(qid)
            elif 'coord' in b:
                com_coordenadas.add(qid)
                lon, lat = map(float, b['coord']['value'][len('Point('):-1].split())
                p = pontos[qid]
                if distancia_km(lat, lon, p['latitude'], p['longitude']) > 5:
                    errados.add(qid)
        time.sleep(1)
    errados |= {q for q, p in pontos.items()
                if p['category'] in OBRAS and q not in com_coordenadas}
    return errados


def distancia_km(lat1, lon1, lat2, lon2):
    dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    return 6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def descarta_wikidata_errado(features):
    errados = qids_que_nao_sao_o_lugar(features)
    for f in features:
        p = f['properties']
        if p.get('wikidata') in errados:
            print(f'  wikidata {p["wikidata"]} de "{p["name"]}" nao descreve o lugar; descartado.')
            del p['wikidata']


def sem_repetidos(features):
    vistos = set()
    unicos = []
    for f in features:
        p = f['properties']
        chaves = {p['name'].casefold()} | ({p['wikidata']} if p.get('wikidata') else set())
        if chaves & vistos:
            continue
        vistos |= chaves
        unicos.append(f)
    return unicos


def seleciona(features):
    comida = {cat: [] for cat in TETO_COMIDA}
    restante = []
    for f in features:
        cat = f['properties']['category']
        (comida[cat] if cat in comida else restante).append(f)

    restante.sort(key=lambda f: f['properties']['popularity'], reverse=True)
    por_categoria = Counter()
    escolhidos = []
    for f in restante:
        cat = f['properties']['category']
        if len(escolhidos) == TETO_RESTANTE:
            break
        if por_categoria[cat] < TETO_CATEGORIA.get(cat, TETO_CATEGORIA_PADRAO):
            por_categoria[cat] += 1
            escolhidos.append(f)
    for cat, lista in comida.items():
        lista.sort(key=lambda f: riqueza(f['properties']), reverse=True)
        escolhidos += lista[:TETO_COMIDA[cat]]
    return escolhidos


def revisa(cidade):
    """Reaplica a checagem do Wikidata e a popularidade num arquivo ja gerado, sem consultar o OSM."""
    arquivo = DADOS / 'cities' / f'{cidade["slug"]}.geojson'
    catalogo = json.loads(arquivo.read_text(encoding='utf-8'))
    descarta_wikidata_errado(catalogo['features'])
    aplica_popularidade([f['properties'] for f in catalogo['features']])
    arquivo.write_text(json.dumps(catalogo, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')


def main():
    args = sys.argv[1:]
    revisar = '--revisar' in args
    args = [a for a in args if a != '--revisar']
    if len(args) != 1:
        sys.exit(__doc__)
    sys.stdout.reconfigure(encoding='utf-8')
    cidade = carrega_cidade(args[0])
    if revisar:
        revisa(cidade)
        return

    print(f'Consultando o OpenStreetMap ({cidade["name"]}, raio de {cidade["radiusKm"]} km)...')
    elementos = consulta_overpass(cidade)
    features = [f for f in (para_feature(e, cidade) for e in elementos) if f]
    descarta_wikidata_errado(features)
    features = sem_repetidos(features)
    print(f'{len(elementos)} elementos, {len(features)} candidatos depois do filtro.')

    aplica_popularidade([f['properties'] for f in features])
    features = seleciona(features)

    destino = DADOS / 'cities' / f'{cidade["slug"]}.geojson'
    destino.write_text(json.dumps({'type': 'FeatureCollection', 'features': features},
                                  ensure_ascii=False, indent=2) + '\n',
                       encoding='utf-8', newline='\n')

    print(f'{len(features)} pontos gravados em {destino.relative_to(DADOS.parent.parent.parent.parent)}.')
    for cat, n in Counter(f['properties']['category'] for f in features).most_common():
        print(f'{n:5d}  {cat}')


if __name__ == '__main__':
    main()
