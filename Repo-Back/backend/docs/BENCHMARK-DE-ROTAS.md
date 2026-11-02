# Benchmark de rotas

Mede quanto a ordenação das paradas encurta o caminho do viajante. O teste
`RouteOptimizationBenchmarkTest` gera roteiros nas 20 cidades do catálogo e compara três
formas de ordenar **os mesmos lugares** de cada dia.

## Como o roteiro é ordenado

1. **Famosos primeiro**: o quarto mais popular dos lugares escolhidos é reservado para os
   primeiros dias, ocupando no máximo metade dos horários de cada dia (ver abaixo).
2. **Construção gulosa** (vizinho mais próximo): de onde o viajante está, vai sempre ao lugar
   aberto mais próximo, começando pelos reservados para o dia. Antes, ao que fecha cedo; em dia
   de chuva, aos lugares cobertos.
3. **Melhoria 2-opt** (`RouteOptimizer`): testa inverter cada trecho da sequência do dia e fica
   com a inversão quando o caminho total encurta, até nenhuma inversão ajudar (ótimo local).
   Os horários não mudam: muda qual lugar ocupa cada horário, e a inversão só é aceita se
   **todos os lugares continuarem abertos** no novo horário. A parada da noite fica fixa no fim.

O caminho é medido em linha reta (haversine), do ponto de partida até a última parada de
cada dia, somando os dias.

## Metodologia

- 20 cidades x 10 roteiros de 3 dias = **200 roteiros, 600 dias**.
- Perfis alternados (Cultural, Social, Natureza, Aventureiro, Relaxamento) e os três ritmos
  (Intenso, Equilibrado, Leve). Semente fixa: o resultado é reproduzível.
- **Aleatória**: os mesmos lugares em ordem qualquer (média de 30 embaralhamentos por dia),
  a referência de "sem algoritmo".
- **Gulosa**: como o gerador fazia antes deste trabalho.
- **Gulosa + 2-opt**: a versão atual.

Além de medir, o teste falha se o 2-opt aumentar o caminho de algum roteiro ou colocar
algum lugar num horário em que ele está fechado.

## Resultados

| Cidade | Roteiros | Aleatória (km) | Gulosa (km) | Gulosa + 2-opt (km) | Redução vs gulosa | Redução vs aleatória | Dias melhorados | Tempo médio |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Roma | 10 | 330.6 | 275.0 | 232.1 | 15.6% | 29.8% | 26 de 30 | 19 ms |
| Curitiba | 10 | 657.2 | 574.2 | 525.4 | 8.5% | 20.1% | 26 de 30 | 8 ms |
| Paris | 10 | 513.7 | 415.1 | 371.5 | 10.5% | 27.7% | 26 de 30 | 21 ms |
| Tóquio | 10 | 876.8 | 727.3 | 645.7 | 11.2% | 26.4% | 23 de 30 | 29 ms |
| Nova York | 10 | 565.6 | 467.2 | 397.8 | 14.9% | 29.7% | 28 de 30 | 14 ms |
| Rio de Janeiro | 10 | 590.2 | 475.3 | 450.0 | 5.3% | 23.8% | 15 de 30 | 10 ms |
| São Paulo | 10 | 465.7 | 394.3 | 345.1 | 12.5% | 25.9% | 28 de 30 | 11 ms |
| Lisboa | 10 | 483.2 | 410.3 | 366.3 | 10.7% | 24.2% | 28 de 30 | 13 ms |
| Buenos Aires | 10 | 371.5 | 313.1 | 272.8 | 12.9% | 26.6% | 28 de 30 | 11 ms |
| Barcelona | 10 | 747.6 | 547.0 | 464.8 | 15.0% | 37.8% | 24 de 30 | 19 ms |
| Londres | 10 | 371.0 | 312.6 | 282.6 | 9.6% | 23.8% | 19 de 30 | 13 ms |
| Florença | 10 | 153.2 | 128.3 | 111.2 | 13.3% | 27.4% | 24 de 30 | 10 ms |
| Kyoto | 10 | 696.0 | 570.4 | 505.9 | 11.3% | 27.3% | 22 de 30 | 10 ms |
| Cidade do México | 10 | 794.7 | 725.3 | 679.7 | 6.3% | 14.5% | 26 de 30 | 7 ms |
| Atenas | 10 | 335.0 | 245.6 | 228.7 | 6.9% | 31.7% | 23 de 30 | 17 ms |
| Cairo | 10 | 1056.9 | 912.8 | 807.5 | 11.5% | 23.6% | 20 de 30 | 4 ms |
| Istambul | 10 | 351.7 | 269.8 | 248.0 | 8.1% | 29.5% | 24 de 30 | 6 ms |
| Dubai | 10 | 1359.5 | 1000.9 | 888.2 | 11.3% | 34.7% | 25 de 30 | 5 ms |
| Cidade do Cabo | 10 | 402.6 | 316.4 | 252.3 | 20.2% | 37.3% | 21 de 30 | 6 ms |
| Marrakech | 10 | 245.5 | 206.2 | 178.9 | 13.2% | 27.1% | 25 de 30 | 5 ms |
| **Total** | 200 | 11368.1 | 9287.0 | 8254.5 | 11.1% | 27.4% | 481 de 600 | 12 ms |

**Leitura:** a ordenação atual percorre **27,4% menos** que uma ordem sem critério e
**11,1% menos** que a gulosa, sem tirar nenhum lugar do horário de funcionamento. O 2-opt
melhorou 481 dos 600 dias (nos demais, a gulosa já era ótima localmente). Gerar um roteiro de 3 dias,
com a otimização, leva poucos milissegundos.

## Famosos primeiro: o custo em caminho

Antes, os lugares eram distribuídos pelos dias só pela proximidade: um ponto muito famoso
podia cair no último dia. Quem encurta a viagem ou chega cansado ao fim perdia o principal.
Agora, os mais populares vão para os primeiros dias.

Os pontos mais famosos de uma cidade costumam estar espalhados por ela, então juntá-los
no mesmo dia aumenta o caminho. A tabela mostra a troca, medida nos mesmos 200 roteiros
(cidades, sementes e ritmos variados; perfis alternados):

| Distribuição | 3 mais famosos no 1º dia | 5 mais famosos nos dias 1 e 2 | Caminho total |
|---|---:|---:|---:|
| Só proximidade (antes) | 34% | 65% | 7254 km |
| **1/4 da lista, até metade de cada dia (atual)** | **87%** | **92,5%** | **7890 km (+8,8%)** |
| 1/3 da lista, até metade de cada dia | 87% | 95% | 8006 km (+10,4%) |
| Todos por fama | 94% | 99% | 8458 km (+16,6%) |

A versão atual leva quase todo o ganho da distribuição por fama por metade do custo: o
resto de cada dia é completado pela proximidade. No benchmark acima, o caminho final foi de
7382 km para 8254,5 km.

## Como reproduzir

```bash
cd Repo-Back/backend
./mvnw test -Dtest=RouteOptimizationBenchmarkTest
# tabela em target/benchmark-rotas.md
```

O teste não usa banco nem serviços externos: só o catálogo de cidades.
