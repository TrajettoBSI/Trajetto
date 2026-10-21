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

## Como o roteiro escolhe os pontos

- **Pontuação.** Cada ponto soma popularidade (0 a 6, pelo número de Wikipédias
  com artigo sobre ele), um bônus de `PROFILE_BONUS` se combina com o perfil do
  viajante, um pouco de acaso e uma penalidade pela distância da partida.
- **Imperdíveis.** Os `MUST_SEE` (5) pontos mais famosos da cidade ganham o
  mesmo bônus do perfil: o Coliseu entra para o aventureiro também, e o perfil
  decide o resto. `ProfileItineraryIntegrationTest` mede as duas coisas.
- **Uma parada por lugar.** Pontos a menos de 100 m, ou a menos de 250 m quando
  o nome de um contém o do outro ("Statue of Liberty" e "Statue of Liberty
  Museum"), são a mesma visita: vale o mais famoso, e escolher um bloqueia os
  outros (`CityCatalog.sameVisit`). Pontos dentro do contorno do mesmo recinto
  do OSM — sítio arqueológico, castelo, palácio, atração, museu ou zoo com
  Wikidata — também, a qualquer distância: a Grande Pirâmide, a Esfinge e o
  "Giza Pyramids" ficam a até 1,3 km um do outro, mas são um ingresso só; o
  Partenon e o Templo de Atena Nike são a Acrópole. O script grava o código do
  recinto em `site`. Parque e jardim não contam como recinto, mesmo marcados como atração: a
  Torre Eiffel fica dentro do Champ de Mars e é outro passeio.
- **Noite.** Mirantes, praças e fontes para todos; bar e pub só para os perfis
  Social e Mochileiro, e para eles com prioridade.

Os perfis de cada categoria ficam em `PERFIS`, no script. Cada perfil precisa de
um conjunto próprio de lugares, senão o roteiro sai igual para todos: Aventureiro
é ruína, castelo, forte, mirante, pico, cachoeira e caverna; `attraction` é
Cultural e Social; lugar com entrada gratuita ganha Mochileiro.

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

Sem baixar do OSM de novo:
`python scripts/gera_catalogo_cidade.py --revisar <slug>` refaz a checagem do
Wikidata, a popularidade e os perfis; `--perfis <slug>` refaz só os perfis;
`--recintos <slug>` refaz só os recintos (uma consulta pequena ao Overpass).
`--nomes <slug>` refaz só os nomes traduzidos.
`--comida <slug>` completa a comida perto das atrações: o app sugere café e
restaurante a até 1,2 km (depois 2,5 km) de cada parada, e o catálogo só trazia
comida do centro — a Torre de Belém e as pirâmides ficavam sem sugestão de refeição.
Cada uma das 150 atrações mais populares sem restaurante ou café por perto ganha
até 3 restaurantes e 2 cafés do OSM em volta dela.

## Nomes no idioma do usuário

Cada ponto com Wikidata leva em `names` o nome em português, inglês e espanhol
(os rótulos do Wikidata: "Musée du Louvre" vira "Museu do Louvre", "Louvre
Museum", "Museo del Louvre"). O backend devolve `names` na busca de pontos e nas
paradas do roteiro, e o app mostra o do idioma escolhido (`placeName`); sem
tradução, fica o nome original. A busca também acha o ponto pelo nome traduzido.
Endereço fica como no OSM, no formato local — nome de rua não se traduz.
Só a popularidade: `python scripts/atualiza_popularidade.py [slug]`.

## Cidades atendidas

Roma (curada à mão), Florença, Paris, Londres, Lisboa, Barcelona, Atenas,
Istambul, Nova York, Cidade do México, Buenos Aires, Rio de Janeiro, São Paulo,
Curitiba, Cairo (com Gizé), Marrakech, Cidade do Cabo, Dubai, Tóquio e Kyoto. As geradas pelo script ainda pedem a revisão do passo 3 — por exemplo,
"Santos FC Business Center" no topo de São Paulo herda a popularidade do clube.

## O que ainda é específico de Roma

- `OpeningHours.SUNSET`: horário fixo para "sunset" nos horários de
  funcionamento.
