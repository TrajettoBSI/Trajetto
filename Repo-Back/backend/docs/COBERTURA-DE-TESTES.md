# Cobertura de testes do backend

A cobertura é medida pelo **JaCoCo** (`jacoco-maven-plugin` 0.8.13, no `pom.xml`) a cada
`./mvnw verify`, sobre todo o código de `src/main/java`. O build **falha** se a cobertura de
linhas ou de instruções ficar abaixo de **75%** (regra `check` do plugin), então o mínimo é
verificado automaticamente em toda execução, inclusive no pipeline do GitHub.

## Resultado

Medição de 13/10/2026, com 164 testes automatizados e nenhuma falha:

| Métrica | Cobertura | Cobertos / total |
|---|---|---|
| **Linhas** | **93,1%** | 1503 / 1615 |
| **Instruções** | **92,4%** | 8432 / 9122 |
| Desvios (branches) | 75,8% | 307 / 405 |
| Métodos | 90,2% | 333 / 369 |

Antes deste trabalho a cobertura era de 51,1% das linhas.

### Por pacote

| Pacote | Linhas | Instruções |
|---|---|---|
| `(raiz)` | 33,3% | 37,5% |
| `config` | 100,0% | 100,0% |
| `config.swagger` | 100,0% | 100,0% |
| `exception` | 75,4% | 75,3% |
| `favorite.controller` | 85,7% | 87,2% |
| `favorite.dto` | 100,0% | 100,0% |
| `favorite.service` | 100,0% | 93,0% |
| `itinerary.controller` | 95,0% | 95,8% |
| `itinerary.data` | 77,1% | 75,9% |
| `itinerary.dto` | 100,0% | 100,0% |
| `itinerary.model` | 100,0% | 100,0% |
| `itinerary.repository` | 95,4% | 94,7% |
| `itinerary.service` | 100,0% | 95,9% |
| `rating.controller` | 100,0% | 100,0% |
| `rating.model` | 100,0% | 100,0% |
| `rating.service` | 100,0% | 100,0% |
| `routing.controller` | 75,0% | 50,0% |
| `routing.dto` | 100,0% | 100,0% |
| `routing.service` | 100,0% | 99,4% |
| `security` | 96,2% | 96,2% |
| `stats.controller` | 100,0% | 100,0% |
| `stats.dto` | 100,0% | 100,0% |
| `stats.repository` | 100,0% | 97,8% |
| `stats.service` | 100,0% | 99,0% |
| `touristSpots.controller` | 75,0% | 46,2% |
| `touristSpots.dto` | 66,7% | 61,5% |
| `touristSpots.service` | 100,0% | 100,0% |
| `user` | 95,9% | 97,7% |
| `user.controller` | 95,2% | 95,0% |
| `user.dto` | 30,8% | 42,2% |
| `user.facade.impl` | 93,3% | 86,3% |
| `user.model` | 100,0% | 100,0% |
| `user.service` | 100,0% | 100,0% |
| `user.service.impl` | 95,7% | 94,1% |

O código que o Lombok gera (getters, setters, construtores) é marcado como gerado pelo
`lombok.config` e não entra na conta, nem a favor nem contra: ele não é escrito pela equipe.

## O que os testes cobrem

| Teste | Comportamento verificado |
|---|---|
| `UserApiIntegrationTest` | Cadastro com envio do código, e-mail em uso, verificação de conta, login, perfil próprio e as operações do administrador (listar, editar, remover, trocar cargo). |
| `PasswordResetApiIntegrationTest` | Recuperação de senha: código por e-mail, uso único, código vencido ou errado. |
| `ItineraryApiIntegrationTest` | Gerar, consultar, ativar, avaliar, datar, trocar parada, anotar e apagar roteiros, sempre respeitando o dono. |
| `MultiDayItineraryIntegrationTest`, `PopularItineraryIntegrationTest` | Roteiro de vários dias, ritmos da viagem, prioridade por popularidade e parada da noite ao ar livre. |
| `ItineraryNoteIntegrationTest`, `FavoritePlaceServiceIntegrationTest` | Persistência das anotações e dos favoritos (OB05). |
| `FavoriteAndPlacesApiIntegrationTest`, `TouristSpotSearchIntegrationTest` | Favoritos pela API e busca no catálogo (MongoDB), inclusive por proximidade. |
| `RatingApiIntegrationTest` | Avaliações de locais: média, duplicidade, nota inválida e permissão do autor. |
| `StatsApiIntegrationTest`, `Stats*Test` | Indicadores do painel gerencial e seus filtros; acesso só do administrador. |
| `SchemaRulesTest` | Regras garantidas pelo próprio banco (chaves, unicidade, faixas de valor). |
| `SecurityErrorContractTest`, `GlobalExceptionHandlerTest`, `ApiError*Test` | Contrato JSON de erro e respostas de autenticação e autorização. |
| `RouteServiceTest`, `OverpassServiceTest` | Integração com OpenRouteService, Nominatim e Overpass, com as APIs externas simuladas. |
| `DataSeederIntegrationTest` | População de demonstração do painel, sem duplicar ao rodar de novo. |

Os testes de API sobem a aplicação inteira e fazem requisições HTTP reais (MockMvc) com token
JWT, contra MySQL e MongoDB de verdade. Cada teste roda numa transação desfeita no fim, então
nada fica no banco. O envio de e-mail é simulado para não disparar mensagens reais.

## Como reproduzir

Com MySQL e MongoDB rodando localmente, a partir de `Repo-Back/backend`:

```bash
SPRING_PROFILES_ACTIVE=test DB_USERNAME=root DB_PASSWORD=<senha> ./mvnw clean verify
```

O relatório completo, navegável por pacote, classe e linha, fica em
`target/site/jacoco/index.html`.

## Evidência no GitHub

Cada execução do pipeline **Backend CI** mostra a tabela de cobertura no resumo da execução e
publica o relatório HTML como artefato `relatorio-cobertura-jacoco`, disponível para download na
página da execução.
