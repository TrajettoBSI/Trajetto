# Padrão de carregamento, erro e vazio

Toda tela que busca dados passa pelas mesmas quatro situações: está buscando, falhou, não veio
nada, ou veio conteúdo. Antes, cada tela resolvia isso do seu jeito — um spinner aqui, um alerta
ali, uma lista em branco sem explicação acolá. Agora existe um lugar só.

## Como uma tela usa

```tsx
import { AsyncBoundary, useAsyncData } from '@/src/components/feedback';

const usuarios = useAsyncData(() => userService.getAll());

<AsyncBoundary
  state={usuarios}
  onRetry={usuarios.reload}
  empty={{ title: t('userList.emptyTitle'), message: t('userList.emptyMessage') }}
>
  {(lista) => <FlatList data={lista} ... />}
</AsyncBoundary>
```

A tela diz **o que buscar** e **o que desenhar quando há conteúdo**. O resto — decidir qual aviso
mostrar, escrever a mensagem que orienta o usuário e oferecer o botão que tira ele da situação —
é do padrão.

Quando o estado já vem de outro lugar (uma loja compartilhada, por exemplo), a tela entrega o
que sabe da busca no mesmo formato:

```tsx
<AsyncBoundary state={{ loading, error, data: itinerary }} onRetry={reload}>
```

## Os três tamanhos de aviso

| `layout` | Onde cabe |
| --- | --- |
| `screen` (padrão) | A tela inteira, quando não há mais nada para mostrar. |
| `block` | Dentro de uma tela que continua em pé, como um painel entre gráficos. |
| `inline` | Uma faixa curta, para avisar sem empurrar o formulário para fora da vista. |

Um formulário usa o `inline` direto, sem boundary, porque ali o aviso acompanha o conteúdo em
vez de substituí-lo:

```tsx
{error ? <FeedbackState variant="error" layout="inline" message={error} /> : null}
```

## Quando o vazio é um convite

Há telas em que "não tem nada" não é um problema a resolver, e sim o começo da jornada — quem
ainda não montou um roteiro precisa de um convite, não de um aviso. Nesses casos a tela desenha
o próprio vazio e o padrão continua decidindo quando mostrá-lo:

```tsx
<AsyncBoundary state={...} renderEmpty={() => <NoItineraryEmptyState destIndex={destIndex} />}>
```

## Como está dividido

| Arquivo | Responsabilidade |
| --- | --- |
| `feedbackStatus.ts` | A regra: dado o estado da busca, qual aviso aparece. Não sabe o que é tela. |
| `useAsyncData.ts` | O estado: buscar, guardar o resultado, guardar a falha, refazer. Não sabe o que é aparência. |
| `FeedbackState.tsx` | A aparência: símbolo, título, mensagem orientativa e ação de recuperação. Não sabe o que é busca. |
| `AsyncBoundary.tsx` | A ligação entre as três coisas acima. |
| `styles.ts` | As medidas e as cores dos avisos, tiradas do tema do app. |
| `index.ts` | A porta de entrada. Telas importam daqui e não conhecem o que tem dentro. |

Cada peça pode mudar sem obrigar as outras a mudar: trocar o visual dos avisos não mexe na regra,
e mudar a regra não mexe em nenhuma tela.

As palavras padrão dos avisos ficam no arquivo de idiomas, em `common:feedback`, nos três
idiomas do app. A tela só escreve um texto quando ele for específico do caso dela.

## Onde está em uso

**Telas de acesso e perfil:** entrada, cadastro, recuperação de senha, redefinição de senha,
verificação de conta e perfil.

**Telas de conteúdo:** roteiro, mapa, exploração, lista de roteiros, lista de usuários e painel
gerencial.

## Como conferir

```bash
npm run test:feedback   # prova que o aviso certo aparece em cada situação
npm run web             # e abra /DemoFeedbackScreen para ver os três estados na mão
```
