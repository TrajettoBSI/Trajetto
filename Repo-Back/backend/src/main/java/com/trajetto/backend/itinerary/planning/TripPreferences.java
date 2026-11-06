package com.trajetto.backend.itinerary.planning;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * O que o viajante pediu com as proprias palavras ("menos igrejas, mais comida de rua"),
 * traduzido em ajustes que o gerador de roteiros entende. Quem traduz e o
 * {@link com.trajetto.backend.itinerary.ai.PreferenceInterpreter}; quem monta o roteiro
 * continua sendo o {@link ItineraryPlanner}.
 *
 * <p>Nenhum campo e nulo: listas vazias e texto vazio quando o viajante nao pediu nada.</p>
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
        String summary,
        @JsonPropertyDescription("Lugares citados pelo nome que o viajante quer num dia ou periodo especifico")
        List<Placement> placements,
        @JsonPropertyDescription("true so no pedido que libera de novo os lugares pagos; desfaz o avoidPaid dos pedidos anteriores")
        boolean allowPaid,
        @JsonPropertyDescription("MENOS quando o viajante quer andar menos; NORMAL no pedido que desfaz isso; texto vazio para manter")
        String walking
) {

    public static final String WALK_LESS = "MENOS";
    public static final String WALK_ANY = "NORMAL";

    public static final Set<String> PERIODS = Set.of("MANHA", "TARDE", "NOITE");

    /**
     * "Fontana di Trevi no ultimo dia, de manha": o lugar fica preso nesse dia e periodo.
     * O dia comeca em 1; -1 e o ultimo, -2 o penultimo; 0 e qualquer dia.
     */
    public record Placement(
            @JsonPropertyDescription("Nome do lugar, como ele e conhecido localmente ou em portugues")
            String place,
            @JsonPropertyDescription("Dia da viagem comecando em 1; -1 para o ultimo dia; 0 se o viajante nao disse o dia")
            int day,
            @JsonPropertyDescription("MANHA, TARDE ou NOITE; texto vazio se o viajante nao disse o periodo")
            String period
    ) {
        public Placement {
            place = place == null ? "" : place.trim();
            String p = period == null ? "" : ItineraryPlanner.normalize(period).toUpperCase();
            period = PERIODS.contains(p) ? p : "";
        }
    }

    public static final TripPreferences NONE = new TripPreferences(List.of(), List.of(), false, "", List.of(), List.of(), "");

    public TripPreferences(List<String> moreCategories, List<String> lessCategories, boolean avoidPaid, String pace,
                           List<String> mustInclude, List<String> exclude, String summary) {
        this(moreCategories, lessCategories, avoidPaid, pace, mustInclude, exclude, summary, List.of());
    }

    public TripPreferences(List<String> moreCategories, List<String> lessCategories, boolean avoidPaid, String pace,
                           List<String> mustInclude, List<String> exclude, String summary, List<Placement> placements) {
        this(moreCategories, lessCategories, avoidPaid, pace, mustInclude, exclude, summary, placements, false, "");
    }

    public TripPreferences {
        moreCategories = clean(moreCategories);
        lessCategories = clean(lessCategories);
        mustInclude = clean(mustInclude);
        exclude = clean(exclude);
        pace = pace == null ? "" : pace.trim().toUpperCase();
        summary = summary == null ? "" : summary.trim();
        walking = walking == null ? "" : walking.trim().toUpperCase();
        placements = placements == null ? List.of()
                : placements.stream().filter(p -> p != null && !p.place().isBlank()).toList();
    }

    public TripPreferences withSummary(String text) {
        return new TripPreferences(moreCategories, lessCategories, avoidPaid, pace, mustInclude, exclude, text, placements, allowPaid, walking);
    }

    public boolean isEmpty() {
        return moreCategories.isEmpty() && lessCategories.isEmpty() && !avoidPaid && pace.isEmpty()
                && mustInclude.isEmpty() && exclude.isEmpty() && placements.isEmpty()
                && !allowPaid && walking.isEmpty();
    }

    /**
     * Junta um pedido novo aos anteriores: "mais museus" e depois "sem igrejas" vira as duas
     * coisas. Quando os dois se contradizem, vale o pedido mais recente: "pode incluir pagos"
     * desfaz o "so gratis", e "pode andar mais" desfaz o "menos caminhada".
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

        Map<String, Placement> pinned = new LinkedHashMap<>();
        placements.forEach(p -> pinned.put(ItineraryPlanner.normalize(p.place()), p));
        next.exclude.forEach(name -> pinned.remove(ItineraryPlanner.normalize(name)));
        next.placements.forEach(p -> {
            pinned.put(ItineraryPlanner.normalize(p.place()), p);
            skip.removeIf(name -> ItineraryPlanner.normalize(name).equals(ItineraryPlanner.normalize(p.place())));
        });

        String nextWalking = next.walking.isEmpty() ? walking : WALK_LESS.equals(next.walking) ? WALK_LESS : "";
        return new TripPreferences(new ArrayList<>(more), new ArrayList<>(less), !next.allowPaid && (avoidPaid || next.avoidPaid),
                next.pace.isEmpty() ? pace : next.pace, new ArrayList<>(include), new ArrayList<>(skip), next.summary,
                new ArrayList<>(pinned.values()), false, nextWalking);
    }

    private static List<String> clean(List<String> values) {
        if (values == null) return List.of();
        return values.stream().filter(v -> v != null && !v.isBlank()).map(String::trim).distinct().toList();
    }
}
