package com.trajetto.backend.itinerary.ai;

import com.trajetto.backend.itinerary.planning.ItineraryPlanner;
import com.trajetto.backend.itinerary.planning.TripPreferences;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Interpretador por palavras-chave, para quando a IA nao esta disponivel (sem chave, sem
 * internet, limite de uso). Entende o basico -- "mais museus", "sem igrejas", "so gratis",
 * "com calma" -- em portugues, ingles e espanhol. Lugares pelo nome ficam so com a IA.
 *
 * <p>O pedido e quebrado em trechos ("mais museus, menos igrejas" vira dois), e cada trecho
 * e positivo ou negativo conforme as palavras de negacao que tiver.</p>
 */
final class RuleBasedInterpreter {

    private RuleBasedInterpreter() {}

    private static final Pattern CLAUSE_SPLIT = Pattern.compile("[,.;!?\\n]|\\s+(?:e|mas|and|but|y|pero)\\s+");

    private static final List<String> NEGATIVE = List.of(
            "menos", "sem ", "nada de", "evitar", "evite", "nao quero", "nao gosto", "odeio", "chega de", "tira",
            "remove", "less", "fewer", "no more", "without", "avoid", "don't", "dont", "hate",
            "sin ", "no quiero", "evita");

    private static final List<String> FREE = List.of(
            "gratis", "gratuito", "de graca", "barato", "economi", "sem gastar", "orcamento",
            "free", "cheap", "budget", "gratuita");

    private static final List<String> SLOW = List.of(
            "calma", "tranquil", "devagar", "relax", "descans", "sem pressa", "slow", "chill", "leve");
    private static final List<String> FAST = List.of(
            "intens", "corrid", "maximo", "aproveitar tudo", "muita coisa", "o maximo", "packed", "busy");

    static TripPreferences interpret(String request) {
        String text = " " + ItineraryPlanner.normalize(request) + " ";
        Set<String> more = new LinkedHashSet<>();
        Set<String> less = new LinkedHashSet<>();

        for (String clause : CLAUSE_SPLIT.split(text)) {
            String c = " " + clause.trim() + " ";
            if (c.isBlank()) continue;
            boolean negative = NEGATIVE.stream().anyMatch(w -> has(c, w));
            for (TravelCategories.Category category : TravelCategories.ALL) {
                if (category.words().stream().anyMatch(w -> has(c, w))) {
                    (negative ? less : more).add(category.id());
                }
            }
        }
        more.removeAll(less);

        boolean avoidPaid = FREE.stream().anyMatch(w -> has(text, w));
        String pace = SLOW.stream().anyMatch(w -> has(text, w)) ? "LEVE"
                : FAST.stream().anyMatch(w -> has(text, w)) ? "INTENSO"
                : has(text, "equilibr") ? "EQUILIBRADO" : "";

        TripPreferences prefs = new TripPreferences(new ArrayList<>(more), new ArrayList<>(less), avoidPaid, pace,
                List.of(), List.of(), "");
        return prefs.withSummary(summary(prefs));
    }

    /** A palavra (ou o comeco dela) aparece no texto como inicio de palavra: "bar" nao casa com "barato"... */
    static boolean has(String text, String word) {
        for (int i = text.indexOf(word); i >= 0; i = text.indexOf(word, i + 1)) {
            if (i == 0 || !Character.isLetter(text.charAt(i - 1))) return true;
        }
        return false;
    }

    static String summary(TripPreferences prefs) {
        if (prefs.isEmpty()) {
            return "Não encontrei um ajuste específico no pedido, então gerei uma nova versão do roteiro.";
        }
        List<String> parts = new ArrayList<>();
        if (!prefs.moreCategories().isEmpty()) parts.add("mais " + describe(prefs.moreCategories()));
        if (!prefs.lessCategories().isEmpty()) parts.add("menos " + describe(prefs.lessCategories()));
        if (prefs.avoidPaid()) parts.add("só lugares gratuitos sempre que der");
        if ("LEVE".equals(prefs.pace())) parts.add("um ritmo mais tranquilo");
        if ("INTENSO".equals(prefs.pace())) parts.add("dias mais cheios");
        if ("EQUILIBRADO".equals(prefs.pace())) parts.add("um ritmo equilibrado");
        return "Ajustei o roteiro com " + String.join(", ", parts) + ".";
    }

    private static String describe(List<String> ids) {
        return String.join(" e ", ids.stream()
                .map(id -> TravelCategories.BY_ID.containsKey(id) ? TravelCategories.BY_ID.get(id).description() : id)
                .distinct().limit(3).toList());
    }
}
