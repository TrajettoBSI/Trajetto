# Cobertura de testes do frontend

A cobertura é medida pelo **Jest** (preset `jest-expo`) com a **React Native Testing Library**, a
cada `npm run test:coverage`. A configuração fica em `jest.config.js`: a execução **falha** se
linhas, instruções, funções ou desvios (branches) ficarem abaixo de **75%**, então o mínimo é
verificado automaticamente em toda execução, inclusive no pipeline do GitHub.

## Resultado

Medição de 13/10/2026, com 128 testes automatizados em 17 arquivos e nenhuma falha:

| Métrica | Cobertura | Cobertos / total |
|---|---|---|
| **Linhas** | **95,0%** | 2505 / 2638 |
| **Instruções** | **92,9%** | 2822 / 3038 |
| **Funções** | **89,7%** | 808 / 901 |
| **Desvios (branches)** | **79,8%** | 1658 / 2077 |

Antes deste trabalho o frontend não tinha testes automatizados de código (só o teste de
arquitetura).

### Por área

| Área | Linhas | Instruções | Funções | Desvios |
|---|---|---|---|---|
| `app` | 81,5% | 82,1% | 50,0% | 80,0% |
| `components` | 93,2% | 87,1% | 86,2% | 73,3% |
| `constants` | 20,0% | 20,0% | — | — |
| `context` | 100,0% | 100,0% | 100,0% | 100,0% |
| `data` | 100,0% | 100,0% | 100,0% | 100,0% |
| `hooks` | 83,3% | 83,9% | 84,4% | 68,1% |
| `services` | 99,2% | 98,7% | 97,2% | 88,6% |
| `src/components` | 95,3% | 94,4% | 90,6% | 83,1% |
| `src/domain` | 100,0% | 100,0% | 100,0% | 97,6% |
| `src/helpers` | 100,0% | 100,0% | 100,0% | 98,9% |
| `src/i18n` | 97,1% | 97,5% | 100,0% | 77,4% |
| `src/pages/admin` | 94,5% | 93,0% | 88,0% | 74,4% |
| `src/pages/common` | 96,6% | 95,4% | 87,3% | 77,5% |
| `src/pages/explore` | 93,0% | 91,8% | 88,9% | 94,2% |
| `src/pages/favorites` | 96,7% | 97,0% | 92,3% | 75,0% |
| `src/pages/profile` | 90,9% | 90,9% | 84,6% | 75,0% |
| `src/pages/quiz` | 97,7% | 95,6% | 92,0% | 88,3% |
| `src/pages/spot` | 96,0% | 89,9% | 82,4% | 77,6% |
| `src/pages/tabs` | 94,8% | 92,1% | 89,8% | 76,6% |
| `src/theme` | 100,0% | 100,0% | 100,0% | — |
| `utils` | 99,1% | 98,6% | 100,0% | 93,9% |

Entra na medição todo o código do app: rotas (`app/`), componentes, telas, hooks, serviços,
domínio, contexto, dados, tema e utilitários, sem exceções: as sobras do modelo inicial do
Expo foram apagadas do projeto.

## O que os testes cobrem

Os testes de tela renderizam a tela como o usuário a vê, preenchem campos, tocam nos botões e
conferem o resultado: o que aparece, para onde o app navega e o que é enviado ao backend. O
backend é simulado na camada de serviços.

| Teste | Comportamento verificado |
|---|---|
| `pages/login`, `pages/account` | Login, cadastro (máscaras, validações, erros por campo da API), verificação de e-mail, esqueci a senha e redefinição. |
| `pages/profile`, `pages/admin` (perfil) | Configurações do perfil, menu, troca de idioma e saída da conta. |
| `pages/places` | Explorar (busca, filtro por categoria, vazio e erro), detalhe do local (horários, contato, avaliações, favorito) e Meus favoritos. |
| `pages/roteiros` | Meus roteiros (ativo, outros, ativar, excluir, seleção múltipla) e o fluxo de gerar roteiro (endereço, data, dias, ritmo, prévia, erro e nova tentativa). |
| `pages/itinerario` | Paradas por dia, anotações, troca de parada, sugestões de refeição, período livre e exportação em PDF (iOS e Android). |
| `pages/mapa` | Pinos e trechos do dia, busca de lugares, cartão do lugar, filtros e seus chips. |
| `pages/admin` | Painel gerencial (indicadores, abas, filtros guardados), lista e edição de usuários, troca de cargo. |
| `pages/quiz` | Convite, as 10 perguntas do teste de viajante e o resultado. |
| `context/auth` | Sessão: entrar, sair, sessão expirada e a navegação inicial do app para cada tipo de usuário. |
| `services/*` | Cada chamada da camada de serviços ao endpoint certo, com os dados certos, e o token no cabeçalho. |
| `stores/*` | Estado global do roteiro e dos favoritos. |
| `domain`, `utils/*` | Regras puras: validações, formatação, dias do roteiro, refeições, alternativas, quiz, contrato de erro da API e filtros do painel. |

## Como reproduzir

A partir de `Repo-Front/Trajetto`:

```bash
npm install
npm run test:coverage
```

O resumo aparece no terminal, e o relatório completo, navegável por pasta, arquivo e linha, fica
em `coverage/index.html`.

## Evidência no GitHub

Cada execução do pipeline **Frontend CI** mostra a tabela de cobertura no resumo da execução e
publica o relatório HTML como artefato `relatorio-cobertura-frontend`, disponível para download na
página da execução.
