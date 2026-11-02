# Benchmark de rotas

Mede quanto a ordenação das paradas encurta o caminho do viajante. O teste
`RouteOptimizationBenchmarkTest` gera roteiros nas 20 cidades do catálogo e compara três
formas de ordenar **os mesmos lugares** de cada dia.

## Como o roteiro é ordenado

1. **Construção gulosa** (vizinho mais próximo): de onde o viajante está, vai sempre ao lugar
   aberto mais próximo. Antes, ao que fecha cedo; em dia de chuva, aos lugares cobertos.
2. **Melhoria 2-opt** (`RouteOptimizer`): testa inverter cada trecho da sequência do dia e fica
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
| Roma | 10 | 278.6 | 198.7 | 183.1 | 7.9% | 34.3% | 18 de 30 | 11 ms |
| Curitiba | 10 | 635.6 | 527.0 | 494.9 | 6.1% | 22.1% | 21 de 30 | 3 ms |
| Paris | 10 | 460.2 | 358.3 | 328.0 | 8.5% | 28.7% | 25 de 30 | 12 ms |
| Tóquio | 10 | 828.8 | 651.5 | 595.2 | 8.6% | 28.2% | 24 de 30 | 14 ms |
| Nova York | 10 | 583.0 | 412.5 | 397.4 | 3.7% | 31.8% | 20 de 30 | 11 ms |
| Rio de Janeiro | 10 | 513.2 | 396.6 | 371.9 | 6.2% | 27.5% | 13 de 30 | 4 ms |
| São Paulo | 10 | 390.9 | 317.0 | 275.9 | 12.9% | 29.4% | 19 de 30 | 4 ms |
| Lisboa | 10 | 537.1 | 382.6 | 359.0 | 6.2% | 33.1% | 18 de 30 | 6 ms |
| Buenos Aires | 10 | 339.8 | 283.5 | 251.6 | 11.2% | 26.0% | 17 de 30 | 5 ms |
| Barcelona | 10 | 687.7 | 443.4 | 424.1 | 4.3% | 38.3% | 10 de 30 | 11 ms |
| Londres | 10 | 361.4 | 281.2 | 263.9 | 6.2% | 27.0% | 19 de 30 | 5 ms |
| Florença | 10 | 149.8 | 116.8 | 105.6 | 9.6% | 29.5% | 21 de 30 | 6 ms |
| Kyoto | 10 | 676.9 | 468.7 | 450.6 | 3.9% | 33.4% | 13 de 30 | 9 ms |
| Cidade do México | 10 | 807.9 | 691.1 | 656.5 | 5.0% | 18.7% | 21 de 30 | 5 ms |
| Atenas | 10 | 314.8 | 237.7 | 211.4 | 11.1% | 32.8% | 18 de 30 | 6 ms |
| Cairo | 10 | 989.1 | 676.7 | 629.6 | 7.0% | 36.3% | 11 de 30 | 2 ms |
| Istambul | 10 | 298.0 | 235.5 | 209.2 | 11.2% | 29.8% | 19 de 30 | 3 ms |
| Dubai | 10 | 1266.1 | 940.6 | 794.7 | 15.5% | 37.2% | 18 de 30 | 4 ms |
| Cidade do Cabo | 10 | 351.6 | 251.4 | 241.3 | 4.0% | 31.4% | 12 de 30 | 5 ms |
| Marrakech | 10 | 221.0 | 165.5 | 138.5 | 16.3% | 37.3% | 14 de 30 | 4 ms |
| **Total** | 200 | 10691.5 | 8036.1 | 7382.4 | 8.1% | 31.0% | 351 de 600 | 7 ms |

**Leitura:** a ordenação atual percorre **31% menos** que uma ordem sem critério e **8,1% menos**
que a gulosa, sem tirar nenhum lugar do horário de funcionamento. O 2-opt melhorou 351 dos 600
dias (nos demais, a gulosa já era ótima localmente). Gerar um roteiro de 3 dias, com a
otimização, leva poucos milissegundos.

## Como reproduzir

```bash
cd Repo-Back/backend
./mvnw test -Dtest=RouteOptimizationBenchmarkTest
# tabela em target/benchmark-rotas.md
```

O teste não usa banco nem serviços externos: só o catálogo de cidades.
