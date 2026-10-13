# Temas, customização e internacionalização do frontend

Este documento liga cada item dos critérios de avaliação ao que o app faz e a onde isso está no
código e nos testes.

## 1. Frontend responsivo e customizável

### a) Diferentes temas de cores

O app tem três paletas com as mesmas 94 cores-chave (`src/theme/colors.ts`):

| Tema | Como é |
|---|---|
| **Claro** | A identidade original do Trajetto. |
| **Escuro** | Fundos escuros, texto claro e o azul da marca clareado para manter contraste. |
| **Alto contraste** | Preto sobre branco, bordas pretas e o azul da marca escurecido. |

O usuário escolhe em **Perfil → Tema** (também no perfil do administrador): *Padrão do sistema*,
*Claro*, *Escuro* ou *Alto contraste*. "Padrão do sistema" acompanha o modo claro/escuro do
celular. A escolha fica salva no aparelho e volta ao abrir o app de novo.

- **Como funciona:** `src/theme/ThemeContext.tsx` guarda a preferência, e todas as telas pegam as
  cores pelo hook `useColors()`, que devolve a paleta do tema escolhido. A barra de status e o tema
  da navegação também seguem a escolha (`app/_layout.tsx`).
- **Acessibilidade:** `tests/unit/theme/theme.test.tsx` mede o contraste (WCAG) dos pares
  principais de cada tema: pelo menos **4,5:1** no claro e no escuro (nível AA) e **7:1** no alto
  contraste (nível AAA).

### b) Desktop e dispositivo móvel

Não se aplica: o Trajetto é um aplicativo mobile (React Native/Expo para Android e iOS). As telas
usam layout flexível e as áreas seguras do aparelho (`react-native-safe-area-context`), então se
ajustam a celulares de tamanhos diferentes.

### c) Tela com customização relevante e salvamento

- **Painel gerencial (administrador):** quatro filtros — período, perfil de viajante, país e
  categoria de local — recortam todos os indicadores e gráficos. O recorte escolhido fica salvo no
  aparelho e volta na próxima vez que o painel é aberto (`useDashboardFilter`,
  `src/pages/admin/dashboard/`). O período é salvo como faixa ("últimos 30 dias"), não como datas
  fixas, para continuar fazendo sentido nas sessões seguintes.
- **Itinerário (cliente):** ao gerar o roteiro, o usuário escolhe a data, a duração e o **ritmo da
  viagem** (todos os dias cheios, alguns dias cheios com manhã ou tarde livre, ou roteiro leve), e o
  roteiro gerado fica salvo no banco.
- **Preferências do usuário:** idioma e tema, ambos salvos.

Testes: `tests/unit/pages/admin.test.tsx` (o filtro é salvo e recuperado) e
`tests/unit/theme/theme.test.tsx` (o tema é salvo e recuperado).

## 2. Frontend internacionalizado

O app está em **português (pt-BR), inglês (en-US) e espanhol (es-ES)**, com `i18next` e
`react-i18next`. O idioma segue o do aparelho e pode ser trocado em **Perfil → Idioma**; a escolha
fica salva.

### a) Textos estáticos mudam de língua

Todos os textos da interface ficam em `src/i18n/locales/<idioma>/*.json`, um arquivo por área do
app. `tests/unit/i18n/i18n.test.ts` confere que **os três idiomas têm exatamente as mesmas chaves**
em todos os arquivos, ou seja, nenhum texto fica sem tradução.

### b) Formatos de dados mudam com o idioma

As funções de `src/i18n/format.ts` usam a API `Intl` com o idioma ativo:

| Dado | pt-BR | en-US | es-ES |
|---|---|---|---|
| Data | 10/11/2026 | 11/10/2026 | 10/11/2026 |
| Número | 1.234,5 | 1,234.5 | 1234,5 |
| Decimal (nota média) | 4,5 | 4.5 | 4,5 |
| Distância | 1,5 km | 1.5 km | 1,5 km |
| Horário | 21:00 | 09:00 PM | 21:00 |
| Dia da semana | terça-feira | Tuesday | martes |

Estão no formato do idioma: datas e períodos dos roteiros, horários das paradas, distâncias,
notas médias, números e médias do painel gerencial.

### c) Dados da base e valores monetários

- **Categorias de lugares** (`historic_archaeological_site`, `ice_cream`...) e **perfis de
  viajante** (`CULTURAL`...) ficam gravados como chaves e aparecem traduzidos ("Sítio
  arqueológico" / "Archaeological site" / "Sitio arqueológico").
- **Países** ficam gravados com o nome em português. `src/i18n/countries.ts` traz o código ISO e o
  nome em inglês e espanhol dos 194 países do cadastro (gerado a partir do ICU), e o país aparece no
  idioma do usuário no cadastro, no perfil, na lista de usuários e nos gráficos e filtros do painel.
  O valor gravado não muda, então as estatísticas continuam agrupando certo.
- **Horário de funcionamento** vem do OpenStreetMap em inglês ("Mo-Fr 09:00-18:00; Dec 25 off") e
  aparece traduzido ("seg.-sex. 09:00-18:00; 25 de dez. Fechado").
- **Valores monetários:** `formatCurrency` formata qualquer valor com o símbolo e os separadores do
  idioma (€ 1.234,50 / €1,234.50 / 1234,50 €). Hoje o catálogo informa só se a entrada é paga ou
  gratuita, sem preço; essa informação aparece traduzida ("Pago" / "Paid" / "Pago"). Quando o
  catálogo passar a ter preços, eles já serão exibidos no formato de cada idioma.

Os nomes de lugares e endereços são nomes próprios (por exemplo "Fontana di Trevi") e ficam como
estão em todos os idiomas.

Testes: `tests/unit/i18n/i18n.test.ts` confere cada formato e cada tipo de dado nos três idiomas.
