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

`ItineraryService.generateItinerary` usa a cidade do manifesto mais próxima do
ponto de partida (`CityCatalog.nearestCity`) e só sorteia pontos dela. O fuso
dessa cidade também é o que o `DirectionsService` usa para saber se é
madrugada. `GET /cities` lista as cidades, com o centro e quantos pontos têm,
para o app montar o seletor de destino.

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

Para recalcular só a popularidade (sem baixar tudo de novo):
`python scripts/atualiza_popularidade.py [slug]`.

## O que ainda é específico de Roma

- `OpeningHours.SUNSET`: horário fixo para "sunset" nos horários de
  funcionamento.
