# Trajetto

Plataforma mobile para descoberta e planejamento de roteiros turísticos personalizados.

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Requisitos funcionais](#requisitos-funcionais)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Montando o ambiente](#montando-o-ambiente)
- [Executando o projeto](#executando-o-projeto)
- [Documentação da API](#documentação-da-api)
- [Testes e integração contínua](#testes-e-integração-contínua)
- [Documentação complementar](#documentação-complementar)

---

## Sobre o projeto

O **Trajetto** é um aplicativo que ajuda o usuário a **descobrir, planejar e organizar roteiros
turísticos personalizados**. A partir de um teste de perfil de viajante, o app gera um roteiro
dia a dia para a cidade escolhida — com horários, refeições e o ritmo de viagem desejado —,
mostra o trajeto no mapa e permite editar, anotar, avaliar e compartilhar o roteiro.

O catálogo cobre 20 cidades (Roma, Paris, Curitiba, Tóquio, Nova York, Lisboa, entre outras),
com pontos turísticos do OpenStreetMap enriquecidos com Wikidata/Wikimedia.

O projeto é o **Trabalho de Conclusão de Curso (TCC)** do curso de **Sistemas de Informação**.

### Equipe

- Ana Julia Rocha Cezanoski
- Eduardo Nicolosi de Oliveira
- Kauane Santana da Rosa

### Objetivos

- Facilitar o planejamento de viagens e roteiros turísticos
- Centralizar informações sobre pontos turísticos
- Permitir a criação de **roteiros personalizados**
- Melhorar a experiência do usuário ao explorar novos destinos
- Utilizar tecnologias modernas para desenvolvimento mobile

## Funcionalidades

- Cadastro com verificação de e-mail, login e recuperação de senha
- Teste de perfil de viajante
- Geração de roteiros por perfil, cidade, número de dias e ritmo de viagem
- Rota otimizada: construção gulosa + melhoria 2-opt que respeita o horário de funcionamento
  (31% menos caminho que uma ordem sem critério; ver o [benchmark](Repo-Back/backend/docs/BENCHMARK-DE-ROTAS.md))
- Roteiro que considera o clima: em dia de chuva, museus e lugares cobertos primeiro
- Ajuste do roteiro em linguagem natural ("menos igrejas, mais comida de rua", "Fontana di Trevi no último dia, de manhã"), interpretado por palavras-chave, sem serviço pago
- Edição do roteiro: trocar, incluir, remover e reordenar paradas, anotar e dar nome
- Mapa com o trajeto e instruções a pé, de carro e de transporte público
- Busca de pontos turísticos com filtros (categoria, preço, horário, perfil, distância)
- Favoritos e avaliações de pontos turísticos
- Histórico, avaliação e compartilhamento de roteiros
- Painel gerencial com indicadores e filtros (administração)
- Gestão de usuários e perfis de acesso (administração)
- Tema claro/escuro e interface em português, inglês e espanhol

## Requisitos funcionais

A especificação completa, com atores, histórias de usuário e critérios de aceitação, está em
[`BSI-Especificação do Projeto.docx`](BSI-Especificação%20do%20Projeto.docx).

| # | Requisito | Ator | Sprint |
|---|---|---|---|
| RF01 | Realizar autenticação do usuário | Todos | 1 |
| RF02 | Gerenciar cadastro do usuário | Todos | 1 |
| RF03 | Realizar teste de perfil de viajante | Cliente | 1 |
| RF04 | Gerar roteiro da viagem com base no perfil | Cliente | 1 |
| RF05 | Avaliar roteiro gerado | Cliente | 1 |
| RF06 | Visualizar mapa e itinerário do roteiro | Cliente | 1 |
| RF07 | Filtrar pontos turísticos por critérios avançados | Cliente | 2 |
| RF08 | Recalcular roteiros em tempo real | Cliente | 2 |
| RF09 | Adicionar notas pessoais ao roteiro | Cliente | 4 |
| RF10 | Avaliar os pontos turísticos visitados | Cliente | 2 |
| RF11 | Exportar roteiro | Cliente | 2 |
| RF12 | Consultar histórico de roteiros | Cliente | 1 |
| RF13 | Gerar estatísticas de uso | Administrador | 2 e 3 |
| RF14 | Visualizar dashboards de uso | Administrador | 2 e 3 |
| RF15 | Favoritar locais | Cliente | 4 |
| RF16 | Gerenciar usuários e perfis de acesso | Administrador | 4 |

## Arquitetura

Arquitetura **cliente-servidor**:

```
┌──────────────────────┐   HTTPS/JSON + JWT   ┌──────────────────────────┐
│  App mobile (Expo)   │ ───────────────────▶ │  API REST (Spring Boot)  │
│  React Native + TS   │                      │  porta 8080              │
└──────────────────────┘                      └─────┬───────────┬────────┘
                                                    │           │
                                   ┌────────────────┘           └───────────────┐
                                   ▼                                            ▼
                     ┌───────────────────────────┐            ┌──────────────────────────────┐
                     │ MySQL 8                   │            │ MongoDB 7                    │
                     │ usuários, roteiros,       │            │ catálogo de pontos turísticos│
                     │ avaliações, favoritos,    │            │ e espelho das avaliações     │
                     │ procedures do painel      │            │ (consultas geoespaciais)     │
                     └───────────────────────────┘            └──────────────────────────────┘

Serviços externos: OpenRouteService (rotas), Overpass/OpenStreetMap, Wikidata/Wikimedia
(fotos), Open-Meteo (previsão do tempo) e Gmail SMTP (códigos de verificação).
```

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Mobile | React Native 0.88, Expo SDK 58, Expo Router, TypeScript, Axios, i18n |
| Backend | Java 21, Spring Boot 3.5, Spring Security (JWT), Spring Data JPA, Spring Data MongoDB, Bean Validation, springdoc-openapi (Swagger) |
| Banco de dados | MySQL 8 (esquema versionado com Flyway) e MongoDB 7 |
| Qualidade | JUnit 5, Mockito, JaCoCo (mínimo de 75%), Jest, ESLint, GitHub Actions |
| Ferramentas | Git, GitHub, Postman, Figma, Trello |

## Estrutura do repositório

```
Trajetto/
├── Repo-Back/backend/              API REST (Spring Boot)
│   ├── src/main/java/com/trajetto/backend/
│   │   ├── user/                   cadastro, login, verificação de e-mail, senha
│   │   ├── role/                   perfis de acesso e permissões
│   │   ├── itinerary/              roteiros, catálogo de cidades e lugares
│   │   ├── favorite/               locais favoritos
│   │   ├── rating/                 avaliações de pontos turísticos
│   │   ├── routing/                rotas e direções (OpenRouteService)
│   │   ├── touristSpots/           busca no OpenStreetMap (Overpass)
│   │   ├── stats/                  indicadores do painel gerencial
│   │   ├── security/               JWT e regras de acesso
│   │   ├── exception/              contrato único de erro
│   │   └── config/                 CORS, Swagger, Firebase
│   ├── src/main/resources/
│   │   ├── db/migration/           migrações Flyway (V1, V2, ...)
│   │   ├── data/                   catálogo de cidades (cities.json + GeoJSON)
│   │   └── application*.properties perfis dev, test e prod
│   ├── docs/                       contrato de erro, catálogo, cobertura de testes
│   ├── scripts/                    geração do catálogo e dados de demonstração
│   └── docker-compose.yml          MongoDB de desenvolvimento
├── Repo-Front/Trajetto/            aplicativo mobile (Expo)
│   ├── app/                        rotas (Expo Router)
│   ├── src/                        telas, regras de domínio, tema
│   ├── services/                   única camada que chama a API
│   └── ARQUITETURA.md              padrões do frontend
├── docs/qa/                        roteiros de teste de regressão (QA)
└── .github/workflows/              CI do backend e do frontend
```

---

## Montando o ambiente

### Pré-requisitos

| Ferramenta | Versão | Para quê |
|---|---|---|
| [Java JDK](https://adoptium.net) | 21 | backend |
| [MySQL](https://dev.mysql.com/downloads/) | 8.x | banco relacional |
| [Docker](https://www.docker.com/) | qualquer recente | subir o MongoDB (ou instale o MongoDB 7 direto) |
| [Node.js](https://nodejs.org) | 22 (a do CI) | frontend |
| [Expo Go](https://expo.dev/go) | — | rodar o app no celular |

O Maven não precisa ser instalado: o projeto traz o wrapper `mvnw`.

Confira as instalações:

```bash
java -version
mysql --version
docker --version
node -v && npm -v
```

### 1. Clonar o repositório

```bash
git clone https://github.com/TrajettoBSI/Trajetto.git
cd Trajetto
```

### 2. Subir os bancos de dados

**MySQL** — basta o servidor estar rodando na porta 3306. Não é preciso criar o banco nem
tabelas: na primeira execução o backend cria o banco `trajetto_dev` e o Flyway aplica todas
as migrações.

**MongoDB** — pelo Docker, a partir da pasta do backend:

```bash
cd Repo-Back/backend
docker compose up -d      # sobe o MongoDB 7 na porta 27017
```

O catálogo de pontos turísticos é carregado no MongoDB automaticamente quando o backend sobe.

### 3. Configurar os segredos do backend

Nenhum segredo fica no repositório. Copie o modelo e preencha:

```bash
cd Repo-Back/backend/src/main/resources
cp secrets.properties.example secrets.properties   # o secrets.properties é ignorado pelo git
```

| Chave | O que é |
|---|---|
| `DB_PASSWORD` | senha do usuário `root` do MySQL (outro usuário: defina `DB_USERNAME`) |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | conta Gmail que envia os códigos, com [senha de app](https://myaccount.google.com/apppasswords) |
| `JWT_SECRET` | chave do token, com 32+ caracteres — gere com `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | senha do administrador criado na primeira subida |
| `ors.api.key` | chave gratuita do [OpenRouteService](https://openrouteservice.org/dev/#/signup) |

Cada chave também pode vir de uma variável de ambiente com o mesmo nome. Também são
configuráveis por variável: `DB_HOST`, `DB_PORT`, `DB_NAME`, `MONGO_HOST`, `MONGO_PORT`,
`MONGO_DATABASE` e `SPRING_PROFILES_ACTIVE` (`dev`, `test` ou `prod`; padrão `dev`).

Para popular o painel gerencial com usuários, roteiros e avaliações de demonstração, suba o
backend com `SEED_DEMO_DATA=true`.

### 4. Configurar o frontend

```bash
cd Repo-Front/Trajetto
cp .env.example .env
```

No `.env`, aponte `EXPO_PUBLIC_BACKEND_URL` para o IP da máquina que roda o backend na rede
local (o celular não enxerga `localhost`):

```
EXPO_PUBLIC_BACKEND_URL=http://192.168.0.10:8080
```

---

## Executando o projeto

### Backend

```bash
cd Repo-Back/backend
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

A API sobe em **http://localhost:8080** e a documentação em
**http://localhost:8080/swagger-ui.html**.

Para gerar o pacote e rodar como JAR:

```bash
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Frontend (mobile)

```bash
cd Repo-Front/Trajetto
npm install
npx expo start
```

O terminal mostra um QR Code:

- **No celular:** instale o Expo Go (Play Store / App Store), conecte o celular na mesma rede
  Wi-Fi do computador e escaneie o QR Code.
- **No emulador:** pressione `a` para Android ou `i` para iOS (somente macOS).

### Primeiro acesso

1. No app, crie uma conta — o código de verificação chega no e-mail informado.
2. Responda o teste de perfil de viajante e gere o primeiro roteiro.
3. Para o painel gerencial, entre com o administrador criado na primeira subida
   `admin@authserver.com.br` (senha definida em `ADMIN_PASSWORD`).

---

## Documentação da API

Com o backend rodando:

| | Endereço |
|---|---|
| Swagger UI (interativo) | http://localhost:8080/swagger-ui.html |
| OpenAPI 3 (JSON) | http://localhost:8080/v3/api-docs |

A página lista **todos os endpoints**, agrupados por domínio, cada um com resumo, descrição,
parâmetros, códigos de resposta e **exemplos de payload** com dados do catálogo real (Coliseu,
Pantheon, Jardim Botânico de Curitiba...). Os erros seguem um contrato único, também
documentado com exemplo em cada operação.

### Autenticação

A API usa **JWT**. Para testar pela página:

1. `POST /user/create` e `POST /user/verify` (código recebido por e-mail);
2. `POST /user/login` — copie o `token` da resposta;
3. clique em **Authorize** e cole o token.

Endpoints sem cadeado são públicos. `/stats` e a administração de usuários exigem também uma
permissão do perfil de acesso (`STATS_VIEW`, `USERS_VIEW`, `USERS_MANAGE`, `ROLES_ASSIGN`).

### Visão geral dos endpoints

| Grupo | Endpoints principais |
|---|---|
| Usuários | `POST /user/create`, `POST /user/verify`, `POST /user/login`, `GET/PUT /user/me`, `GET /user`, `PUT /user/{id}/role` |
| Senha | `POST /user/password/forgot`, `POST /user/password/reset` |
| Perfis de acesso | `GET /roles` |
| Cidades | `GET /cities` |
| Lugares | `GET /places`, `GET /places/nearby`, `GET /places/highlights`, `GET /places/image`, `GET /places/categories`, `GET /places/profiles` |
| Roteiros | `POST /itinerary/generate`, `GET /itinerary/active/{userId}`, `GET /itinerary/all/{userId}`, edição de paradas, nome, data, nota e anotações |
| Favoritos | `GET/POST /favorites`, `DELETE /favorites/{xid}` |
| Avaliações | `GET /api/ratings/spot`, `GET /api/ratings/spot/average`, `POST/PUT/DELETE /api/ratings` |
| Rotas | `POST /route`, `POST /route/directions` |
| Pontos turísticos (Overpass) | `GET /api/tourist-spots` |
| Painel gerencial | `GET /stats/overview`, `/stats/countries`, `/stats/itineraries-per-month`, `/stats/top-rated-places` e outros |

### Exemplos

**Login**

```http
POST /user/login
Content-Type: application/json

{
  "email": "ana.silva@email.com",
  "password": "Trajetto@2026"
}
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 2,
    "firstName": "Ana",
    "lastName": "Silva",
    "travelerProfile": "Aventureiro",
    "birthDate": "1995-03-15",
    "telephone": "+55 41 99876-5432",
    "email": "ana.silva@email.com",
    "country": "Brasil",
    "isAdmin": false,
    "role": "USER",
    "permissions": []
  }
}
```

**Gerar um roteiro de 3 dias em Roma**

```http
POST /itinerary/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "city": "roma",
  "startLatitude": 41.9009,
  "startLongitude": 12.5016,
  "startDate": "2026-11-20",
  "days": 3,
  "pace": "EQUILIBRADO",
  "name": "Lua de mel em Roma"
}
```

```json
{
  "id": 15,
  "name": "Lua de mel em Roma",
  "city": "roma",
  "startDate": "2026-11-20",
  "endDate": "2026-11-22",
  "active": true,
  "originLatitude": 41.9009,
  "originLongitude": 12.5016,
  "places": [
    {
      "xid": "osm_colosseo",
      "name": "Colosseo",
      "names": { "pt": "Coliseu de Roma", "en": "Colosseum", "es": "Coliseo" },
      "address": "Piazza del Colosseo",
      "latitude": 41.890335502205886,
      "longitude": 12.49238329485295,
      "visitDate": "2026-11-20",
      "estimatedVisitTime": "09:00",
      "orderIndex": 0,
      "category": "attraction",
      "fee": "yes",
      "openingHours": "Mar 30-Sep 30: 08:30-19:15; Oct 01-Oct 25: 08:30-18:30; Oct 26-Feb 28: 08:30-16:30; Jan 01 off; Dec 25 off",
      "openAtVisit": true,
      "bookingUrl": "https://ticketing.colosseo.it/",
      "wikidata": "Q10285"
    }
  ]
}
```

**Erro** (formato único para todas as falhas)

```json
{
  "timestamp": "2026-11-02T14:03:22.123-03:00",
  "status": 404,
  "error": "Not Found",
  "code": "RESOURCE_NOT_FOUND",
  "message": "Roteiro não encontrado.",
  "path": "/itinerary/99/name",
  "method": "PATCH",
  "traceId": "3f1c2b9e"
}
```

Os códigos de erro e quando cada um ocorre estão em
[`Repo-Back/backend/docs/CONTRATO-DE-ERRO.md`](Repo-Back/backend/docs/CONTRATO-DE-ERRO.md).

---

## Testes e integração contínua

**Backend** — testes unitários e de integração (precisam do MySQL e do MongoDB rodando):

```bash
cd Repo-Back/backend
SPRING_PROFILES_ACTIVE=test ./mvnw verify
```

O `verify` também mede a cobertura com JaCoCo e **falha abaixo de 75%**. O relatório fica em
`target/site/jacoco/index.html`.

**Frontend**:

```bash
cd Repo-Front/Trajetto
npm test                 # testes (Jest)
npm run test:coverage    # com cobertura
npm run lint             # ESLint
```

Os dois conjuntos rodam no GitHub Actions a cada pull request para `dev`, `test` e `prod`
(`.github/workflows/backend-ci.yml` e `frontend-ci.yml`).

## Documentação complementar

| Documento | Conteúdo |
|---|---|
| [Contrato de erro da API](Repo-Back/backend/docs/CONTRATO-DE-ERRO.md) | formato JSON e códigos de erro |
| [Catálogo de cidades](Repo-Back/backend/docs/CATALOGO-DE-CIDADES.md) | como o catálogo é montado e como incluir uma cidade |
| [Cobertura de testes](Repo-Back/backend/docs/COBERTURA-DE-TESTES.md) | resultado da medição por pacote |
| [Benchmark de rotas](Repo-Back/backend/docs/BENCHMARK-DE-ROTAS.md) | ganho da otimização 2-opt nas 20 cidades |
| [Migrações do banco](Repo-Back/backend/src/main/resources/db/migration/README.md) | regras do Flyway e passo a passo |
| [Arquitetura do frontend](Repo-Front/Trajetto/ARQUITETURA.md) | camadas e padrões do app |
