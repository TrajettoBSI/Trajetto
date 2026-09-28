package com.trajetto.backend.stats.dto;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Recorte pedido pelo painel gerencial: período, perfil de viajante, país e
 * categoria de local.
 *
 * <p>Chega como parâmetros de consulta em todos os endpoints de
 * {@code /stats} e desce inteiro até as consultas agregadas — nenhum
 * indicador é recortado depois de calculado. Campo ausente significa "sem
 * recorte por este critério", e é por isso que todo componente é nulo quando
 * não vem: as consultas testam {@code :parametro IS NULL} para decidir se
 * aplicam a condição.</p>
 *
 * <p>O construtor canônico normaliza texto em branco para nulo. Sem isso, um
 * {@code ?country=} vazio — que o aplicativo manda ao limpar um seletor —
 * viraria um recorte por país igual a string vazia, e o painel voltaria
 * zerado em vez de completo.</p>
 *
 * <p>O período recorta cada bloco pela data que aquele bloco tem: roteiros e
 * locais pela data de início do roteiro, avaliações pela data em que foram
 * feitas. Os indicadores de usuário ficam de fora: a tabela não guarda data
 * de cadastro, e a única leitura possível — "usuário com roteiro no recorte" —
 * zeraria por construção o indicador de clientes sem roteiro. Pela mesma
 * razão a categoria não os alcança; para eles valem perfil e país, e o
 * detalhe está em {@code StatsRecortes}.</p>
 *
 * @param from     primeiro dia do período, inclusive
 * @param to       último dia do período, inclusive
 * @param profile  rótulo do perfil de viajante, como o painel o exibe
 * @param country  país do usuário, exatamente como cadastrado
 * @param category rótulo da categoria do local, como o painel o exibe
 */
public record StatsFilter(
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        String profile,
        String country,
        String category
) {

    /** O painel sem nenhum filtro aplicado — os números que ele já exibia. */
    public static final StatsFilter SEM_RECORTE = new StatsFilter(null, null, null, null, null);

    public StatsFilter {
        profile = emBrancoENulo(profile);
        country = emBrancoENulo(country);
        category = emBrancoENulo(category);
    }

    /** Verdadeiro quando nenhum critério foi escolhido. */
    public boolean vazio() {
        return from == null && to == null && profile == null && country == null && category == null;
    }

    private static String emBrancoENulo(String valor) {
        if (valor == null) {
            return null;
        }
        String limpo = valor.trim();
        return limpo.isEmpty() ? null : limpo;
    }
}
