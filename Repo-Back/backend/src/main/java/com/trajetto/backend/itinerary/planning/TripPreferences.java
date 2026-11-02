package com.trajetto.backend.itinerary.planning;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * O que o viajante pediu com as proprias palavras ("menos igrejas, mais comida de rua"),
 * traduzido em ajustes que o gerador de roteiros entende. Quem traduz e o
 * {@link com.trajetto.backend.itinerary.ai.PreferenceInterpreter}; quem monta o roteiro
 * continua sendo o {@link ItineraryPlanner}.
 *
 * <p>Os campos sao todos obrigatorios (listas vazias e texto vazio em vez de nulo) porque o
 * mesmo registro e o esquema da saida estruturada pedida a IA.</p>
 */
public record TripPreferences(
        @JsonPropertyDescription("Categorias do catálogo que o viajante quer ver mais")
        List<String> moreCategories,
        @JsonPropertyDescription("Categorias do catálogo que o viajante quer ver menos ou evitar")
        List<String> lessCategories,
        @JsonPropertyDescription("true quando o viajante quer só lugares gratuitos ou economizar")
        boolean avoidPaid,
        @JsonPropertyDescription("INTENSO, EQUILIBRADO ou LEVE quando o viajante pede outro ritmo; texto vazio para manter")
        String pace,
        @JsonPropertyDescription("Nomes de lugares específicos que o viajante faz questão de visitar")
        List<String> mustInclude,
        @JsonPropertyDescription("Nomes de lugares específicos que o viajante não quer no roteiro")
        List<String> exclude,
        @JsonPropertyDescription("Uma ou duas frases, no idioma do pedido, dizendo ao viajante o que vai mudar no roteiro")
        String summary
) {

    public static final TripPreferences NONE = new TripPreferences(List.of(), List.of(), false, "", List.of(), List.of(), "");

    public TripPreferences {
        moreCategories = clean(moreCategories);
        lessCategories = clean(lessCategories);
        mustInclude = clean(mustInclude);
        exclude = clean(exclude);
        pace = pace == null ? "" : pace.trim().toUpperCase();
        summary = summary == null ? "" : summary.trim();
    }

    public TripPreferences withSummary(String text) {
        return new TripPreferences(moreCategories, lessCategories, avoidPaid, pace, mustInclude, exclude, text);
    }

    public boolean isEmpty() {
        return moreCategories.isEmpty() && lessCategories.isEmpty() && !avoidPaid && pace.isEmpty()
                && mustInclude.isEmpty() && exclude.isEmpty();
    }

    /**
     * Junta um pedido novo aos anteriores: "mais museus" e depois "sem igrejas" vira as duas
     * coisas. Quando os dois se contradizem, vale o pedido mais recente.
     */
    public TripPreferences then(TripPreferences next) {
        Set<String> more = new LinkedHashSet<>(moreCategories);
        Set<String> less = new LinkedHashSet<>(lessCategories);
        more.removeAll(next.lessCategories);
        less.removeAll(next.moreCategories);
        more.addAll(next.moreCategories);
        less.addAll(next.lessCategories);

        Set<String> include = new LinkedHashSet<>(mustInclude);
        Set<String> skip = new LinkedHashSet<>(exclude);
        include.removeAll(next.exclude);
        skip.removeAll(next.mustInclude);
        include.addAll(next.mustInclude);
        skip.addAll(next.exclude);

        return new TripPreferences(new ArrayList<>(more), new ArrayList<>(less), avoidPaid || next.avoidPaid,
                next.pace.isEmpty() ? pace : next.pace, new ArrayList<>(include), new ArrayList<>(skip), next.summary);
    }

    private static List<String> clean(List<String> values) {
        if (values == null) return List.of();
        return values.stream().filter(v -> v != null && !v.isBlank()).map(String::trim).distinct().toList();
    }
}
