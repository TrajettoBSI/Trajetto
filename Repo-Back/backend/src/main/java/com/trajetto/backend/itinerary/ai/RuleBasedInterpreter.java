package com.trajetto.backend.itinerary.ai;

import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner;
import com.trajetto.backend.itinerary.planning.TripPreferences;
import com.trajetto.backend.itinerary.planning.TripPreferences.Placement;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

/**
 * Interpretador por palavras-chave, sem servico externo. Entende o basico -- "mais museus", "sem igrejas", "so gratis",
 * "com calma" -- em portugues, ingles e espanhol. Tambem acha os lugares do catalogo citados
 * pelo nome ("Fontana di Trevi", "Coliseu") e o dia e o periodo pedidos para eles
 * ("no ultimo dia, de manha").
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

    private static final Pattern LAST_DAY = Pattern.compile("\\b(?:ultimo|last)\\s+(?:dia|day)\\b");
    private static final Pattern BEFORE_LAST_DAY = Pattern.compile("\\b(?:penultimo|second to last)\\s+(?:dia|day)\\b");
    private static final Pattern ORDINAL_DAY = Pattern.compile(
            "\\b(primeiro|primer|first|segundo|second|terceiro|tercer|third|quarto|cuarto|fourth|quinto|fifth"
                    + "|sexto|sixth|setimo|septimo|seventh)\\s+(?:dia|day)\\b");
    private static final Pattern NUMBERED_DAY = Pattern.compile("\\b(?:dia|day)\\s+(\\d{1,2})\\b");
    private static final Map<String, Integer> ORDINALS = Map.ofEntries(
            Map.entry("primeiro", 1), Map.entry("primer", 1), Map.entry("first", 1),
            Map.entry("segundo", 2), Map.entry("second", 2),
            Map.entry("terceiro", 3), Map.entry("tercer", 3), Map.entry("third", 3),
            Map.entry("quarto", 4), Map.entry("cuarto", 4), Map.entry("fourth", 4),
            Map.entry("quinto", 5), Map.entry("fifth", 5),
            Map.entry("sexto", 6), Map.entry("sixth", 6),
            Map.entry("setimo", 7), Map.entry("septimo", 7), Map.entry("seventh", 7));

    /** Palavra do nome de um lugar que, sozinha, ja identifica o lugar ("trevi", "coliseu"). */
    private static final int MIN_KEYWORD = 5;

    private record Mention(CatalogPlace place, int start, int end) {}

    static TripPreferences interpret(String request) {
        return interpret(request, List.of());
    }

    /** @param places lugares do catalogo da cidade, para achar os citados pelo nome */
    static TripPreferences interpret(String request, List<CatalogPlace> places) {
        String text = " " + ItineraryPlanner.normalize(request) + " ";
        List<Mention> mentions = findPlaces(text, places);
        String withoutPlaces = text;
        for (Mention m : mentions) {
            withoutPlaces = withoutPlaces.substring(0, m.start()) + " ".repeat(m.end() - m.start())
                    + withoutPlaces.substring(m.end());
        }

        Set<String> more = new LinkedHashSet<>();
        Set<String> less = new LinkedHashSet<>();
        for (String clause : CLAUSE_SPLIT.split(withoutPlaces)) {
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

        List<String> include = new ArrayList<>();
        List<String> exclude = new ArrayList<>();
        List<Placement> placements = new ArrayList<>();
        for (int i = 0; i < mentions.size(); i++) {
            int from = i == 0 ? 0 : mentions.get(i - 1).end();
            int to = i == mentions.size() - 1 ? text.length() : mentions.get(i + 1).start();
            String around = " " + text.substring(from, to) + " ";
            String name = mentions.get(i).place().name();
            int day = day(around);
            String period = period(around);
            String before = clauseBefore(text.substring(from, mentions.get(i).start()));
            if (NEGATIVE.stream().anyMatch(w -> has(before, w))) {
                exclude.add(name);
            } else if (day != 0 || !period.isEmpty()) {
                placements.add(new Placement(name, day, period));
            } else {
                include.add(name);
            }
        }

        String finalText = withoutPlaces;
        boolean avoidPaid = FREE.stream().anyMatch(w -> has(finalText, w));
        String pace = SLOW.stream().anyMatch(w -> has(finalText, w)) ? "LEVE"
                : FAST.stream().anyMatch(w -> has(finalText, w)) ? "INTENSO"
                : has(finalText, "equilibr") ? "EQUILIBRADO" : "";

        TripPreferences prefs = new TripPreferences(new ArrayList<>(more), new ArrayList<>(less), avoidPaid, pace,
                include, exclude, "", placements);
        return prefs.withSummary(summary(prefs));
    }

    /**
     * Lugares citados: pelo nome inteiro (em qualquer idioma do catalogo) ou por uma palavra do
     * nome que so ele tem na cidade. Entre citacoes sobrepostas, vale a mais longa.
     */
    private static List<Mention> findPlaces(String text, List<CatalogPlace> places) {
        if (places == null || places.isEmpty()) return List.of();
        Map<String, Integer> wordCount = new HashMap<>();
        for (CatalogPlace place : places) {
            namesOf(place).flatMap(n -> Stream.of(n.split("[^a-z0-9]+"))).distinct()
                    .forEach(w -> wordCount.merge(w, 1, Integer::sum));
        }
        List<Mention> found = new ArrayList<>();
        List<CatalogPlace> byPopularity = places.stream()
                .sorted(Comparator.comparingInt(CatalogPlace::popularity).reversed()).toList();
        for (CatalogPlace place : byPopularity) {
            namesOf(place).filter(n -> n.length() >= MIN_KEYWORD && (n.contains(" ") || !isCategoryWord(n)))
                    .forEach(n -> wholeWord(text, n).ifPresent(i -> found.add(new Mention(place, i, i + n.length()))));
            namesOf(place).flatMap(n -> Stream.of(n.split("[^a-z0-9]+"))).distinct()
                    .filter(w -> w.length() >= MIN_KEYWORD && wordCount.getOrDefault(w, 0) <= 2 && !isCategoryWord(w))
                    .forEach(w -> wholeWord(text, w).ifPresent(i -> found.add(new Mention(place, i, i + w.length()))));
        }
        found.sort(Comparator.comparingInt((Mention m) -> m.end() - m.start()).reversed());
        List<Mention> accepted = new ArrayList<>();
        Set<CatalogPlace> seen = new java.util.HashSet<>();
        for (Mention m : found) {
            boolean overlaps = accepted.stream().anyMatch(a -> m.start() < a.end() && a.start() < m.end());
            if (!overlaps && seen.add(m.place())) accepted.add(m);
        }
        accepted.sort(Comparator.comparingInt(Mention::start));
        return accepted;
    }

    /** O fim do texto depois da ultima separacao de trechos: "quero o Coliseu, tira o " vira " tira o ". */
    private static String clauseBefore(String text) {
        Matcher split = CLAUSE_SPLIT.matcher(text);
        int start = 0;
        while (split.find()) start = split.end();
        return " " + text.substring(start) + " ";
    }

    /** "museus" e "basilica" falam de categorias, nao de um lugar. */
    private static boolean isCategoryWord(String word) {
        return TravelCategories.ALL.stream().flatMap(c -> c.words().stream())
                .anyMatch(w -> word.startsWith(w.trim()));
    }

    private static Stream<String> namesOf(CatalogPlace place) {
        Stream<String> others = place.names() == null ? Stream.empty() : place.names().values().stream();
        return Stream.concat(Stream.of(place.name()), others).map(ItineraryPlanner::normalize)
                .filter(n -> !n.isBlank()).distinct();
    }

    private static java.util.Optional<Integer> wholeWord(String text, String word) {
        for (int i = text.indexOf(word); i >= 0; i = text.indexOf(word, i + 1)) {
            int end = i + word.length();
            boolean startOk = i == 0 || !Character.isLetterOrDigit(text.charAt(i - 1));
            boolean endOk = end >= text.length() || !Character.isLetterOrDigit(text.charAt(end));
            if (startOk && endOk) return java.util.Optional.of(i);
        }
        return java.util.Optional.empty();
    }

    /** Dia citado no trecho: 1 e o primeiro, -1 o ultimo, 0 se nao citou. */
    static int day(String text) {
        if (BEFORE_LAST_DAY.matcher(text).find()) return -2;
        if (LAST_DAY.matcher(text).find()) return -1;
        Matcher ordinal = ORDINAL_DAY.matcher(text);
        if (ordinal.find()) return ORDINALS.get(ordinal.group(1));
        Matcher numbered = NUMBERED_DAY.matcher(text);
        if (numbered.find()) return Integer.parseInt(numbered.group(1));
        return 0;
    }

    static String period(String text) {
        if (has(text, "manha") || has(text, "morning") || has(text, "manana")) return "MANHA";
        if (has(text, "tarde") || has(text, "afternoon")) return "TARDE";
        if (has(text, "noite") || has(text, "night") || has(text, "evening") || has(text, "noche")) return "NOITE";
        return "";
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
        prefs.placements().forEach(p -> parts.add(p.place() + describeWhen(p)));
        if (!prefs.mustInclude().isEmpty()) parts.add("a visita a " + String.join(", ", prefs.mustInclude()));
        if (!prefs.exclude().isEmpty()) parts.add("sem " + String.join(", ", prefs.exclude()));
        if (!prefs.moreCategories().isEmpty()) parts.add("mais " + describe(prefs.moreCategories()));
        if (!prefs.lessCategories().isEmpty()) parts.add("menos " + describe(prefs.lessCategories()));
        if (prefs.avoidPaid()) parts.add("só lugares gratuitos sempre que der");
        if ("LEVE".equals(prefs.pace())) parts.add("um ritmo mais tranquilo");
        if ("INTENSO".equals(prefs.pace())) parts.add("dias mais cheios");
        if ("EQUILIBRADO".equals(prefs.pace())) parts.add("um ritmo equilibrado");
        return "Ajustei o roteiro com " + String.join(", ", parts) + ".";
    }

    private static String describeWhen(Placement p) {
        String day = switch (p.day()) {
            case 0 -> "";
            case -1 -> " no último dia";
            case -2 -> " no penúltimo dia";
            default -> p.day() > 0 ? " no dia " + p.day() : "";
        };
        String period = switch (p.period()) {
            case "MANHA" -> " de manhã";
            case "TARDE" -> " à tarde";
            case "NOITE" -> " à noite";
            default -> "";
        };
        return day + (day.isEmpty() || period.isEmpty() ? "" : ",") + period;
    }

    private static String describe(List<String> ids) {
        return String.join(" e ", ids.stream()
                .map(id -> TravelCategories.BY_ID.containsKey(id) ? TravelCategories.BY_ID.get(id).description() : id)
                .distinct().limit(3).toList());
    }
}
