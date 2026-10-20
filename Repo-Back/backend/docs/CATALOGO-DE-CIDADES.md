# Catálogo de cidades

O gerador de roteiros e o mapa trabalham sobre um catálogo curado de pontos
turísticos, um arquivo por cidade. Adicionar uma cidade não exige mudar código.

## Como os arquivos se organizam

- `src/main/resources/data/cities.json` — manifesto com as cidades atendidas:
  `slug`, `name`, `country`, centro (`latitude`/`longitude`), `radiusKm`,
  `timezone` e `localCuisine` (usado só pelo script, ver abaixo). Opcional:
  `preferEnglishName`, para cidades de outro alfabeto.
- `src/main/resources/data/cities/<slug>.geojson` — os pontos da cidade, no
  formato que o `CityCatalog` lê (`name`, `category`, `profiles`, `latitude`,
  `longitude`, `opening_hours`, `fee`, `wikidata`, `popularity`...).

Na inicialização, o `CityCatalog` lê o manifesto e todos os arquivos, e o
`TouristSpotCatalogSync` espelha tudo na coleção `tourist_spots` do MongoDB
(cada documento leva o `city` de onde veio).

## Como o roteiro escolhe a cidade

No app, o destino é escolhido num seletor alimentado por `GET /cities`, e o
pedido de geração leva o `city` escolhido; a busca do ponto de partida fica
presa à região dessa cidade. Sem `city` no pedido, `ItineraryService` usa a
cidade do manifesto mais próxima do ponto de partida (`CityCatalog.nearestCity`).
Em qualquer caso, só sorteia pontos dela. O fuso
da cidade mais próxima é o que o `DirectionsService` usa para saber se é
madrugada.

## Adicionando uma cidade

1. Acrescente a cidade em `data/cities.json`. O raio deve cobrir a área que
   turista visita (Roma: 25 km; Paris: 12 km). Em `localCuisine`, liste as
   cozinhas do OSM (`cuisine=*`) que contam como experiência local — elas
   marcam o restaurante com o perfil `LUXO`; os demais ficam `MOCHILEIRO`.
2. Gere o catálogo a partir do OpenStreetMap:

   ```
   python scripts/gera_catalogo_cidade.py <slug>
   ```

   O script consulta o Overpass, filtra o que é relevante, descarta códigos do
   Wikidata que não descrevem o lugar (uma pessoa, um modelo de avião...),
   calcula a popularidade e grava `data/cities/<slug>.geojson`.
3. **Revise o arquivo.** O OSM tem lacunas e erros de marcação: vale conferir
   se os pontos mais famosos estão lá e tirar o que não faz sentido. Em cidade
   com cadastro pobre no OSM (Curitiba, por exemplo) o arquivo sai menor.
4. Rode os testes: `CityCatalogTest` confere que todo ponto está dentro do
   raio da sua cidade e que o fuso é válido.

Para refazer só a checagem do Wikidata e a popularidade num arquivo já
revisado à mão (sem baixar do OSM de novo):
`python scripts/gera_catalogo_cidade.py --revisar <slug>`. Só a popularidade:
`python scripts/atualiza_popularidade.py [slug]`.

## Cidades atendidas

Roma (curada à mão), Florença, Paris, Londres, Lisboa, Barcelona, Nova York,
Cidade do México, Buenos Aires, Rio de Janeiro, São Paulo, Curitiba, Tóquio e
Kyoto. As geradas pelo script ainda pedem a revisão do passo 3 — por exemplo,
"Santos FC Business Center" no topo de São Paulo herda a popularidade do clube.

## O que ainda é específico de Roma

- `OpeningHours.SUNSET`: horário fixo para "sunset" nos horários de
  funcionamento.
