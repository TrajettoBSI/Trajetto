package com.trajetto.backend.itinerary.ai;

import com.trajetto.backend.itinerary.planning.TripPreferences;
import com.trajetto.backend.itinerary.planning.TripPreferences.Placement;

import java.util.ArrayList;
import java.util.List;
import java.util.function.UnaryOperator;

/** Os textos do assistente em portugues, ingles e espanhol. */
final class AssistantMessages {

    private AssistantMessages() {}

    /** pt, en ou es a partir do idioma do app ("en-US"); na duvida, portugues. */
    static String language(String tag) {
        if (tag == null || tag.length() < 2) return "pt";
        String code = tag.substring(0, 2).toLowerCase();
        return code.equals("en") || code.equals("es") ? code : "pt";
    }

    static String t(String language, String pt, String en, String es) {
        return switch (language) {
            case "en" -> en;
            case "es" -> es;
            default -> pt;
        };
    }

    /** "A", "A e B", "A, B e C". */
    static String join(List<String> items, String language) {
        if (items.size() < 2) return String.join("", items);
        String last = items.get(items.size() - 1);
        return String.join(", ", items.subList(0, items.size() - 1)) + t(language, " e ", " and ", " y ") + last;
    }

    /** Ate tres categorias: "Quero mais historia" vira varias, e a frase nao precisa de todas. */
    static String categories(List<String> ids, String language) {
        return join(ids.stream()
                .map(id -> TravelCategories.BY_ID.containsKey(id) ? TravelCategories.BY_ID.get(id).description(language) : id)
                .distinct().limit(3).toList(), language);
    }

    /** O que foi entendido do pedido, ou o aviso de que nada foi. */
    static String understood(TripPreferences prefs, String language, UnaryOperator<String> placeName) {
        if (prefs.isEmpty()) return notUnderstood(language);
        List<String> parts = new ArrayList<>();
        prefs.placements().forEach(p -> parts.add(placeName.apply(p.place()) + when(p, language)));
        if (!prefs.mustInclude().isEmpty()) {
            parts.add(t(language, "a visita a ", "a visit to ", "la visita a ")
                    + join(prefs.mustInclude().stream().map(placeName).toList(), language));
        }
        if (!prefs.exclude().isEmpty()) {
            parts.add(t(language, "sem ", "without ", "sin ") + join(prefs.exclude().stream().map(placeName).toList(), language));
        }
        if (!prefs.moreCategories().isEmpty()) {
            parts.add(t(language, "mais ", "more ", "más ") + categories(prefs.moreCategories(), language));
        }
        if (!prefs.lessCategories().isEmpty()) {
            parts.add(t(language, "menos ", "fewer ", "menos ") + categories(prefs.lessCategories(), language));
        }
        if (prefs.avoidPaid()) {
            parts.add(t(language, "só lugares gratuitos sempre que der", "free places whenever possible", "solo lugares gratuitos siempre que se pueda"));
        }
        if (prefs.allowPaid()) {
            parts.add(t(language, "lugares pagos de volta", "paid places allowed again", "lugares de pago otra vez"));
        }
        if ("LEVE".equals(prefs.pace())) parts.add(t(language, "um ritmo mais tranquilo", "a calmer pace", "un ritmo más tranquilo"));
        if ("INTENSO".equals(prefs.pace())) parts.add(t(language, "dias mais cheios", "fuller days", "días más llenos"));
        if ("EQUILIBRADO".equals(prefs.pace())) parts.add(t(language, "um ritmo equilibrado", "a balanced pace", "un ritmo equilibrado"));
        if (TripPreferences.WALK_LESS.equals(prefs.walking())) {
            parts.add(t(language, "menos caminhada entre as paradas", "less walking between stops", "menos caminata entre paradas"));
        }
        if (TripPreferences.WALK_ANY.equals(prefs.walking())) {
            parts.add(t(language, "sem limitar a caminhada", "no limit on walking", "sin limitar la caminata"));
        }
        return t(language, "Entendi: ", "Got it: ", "Entendido: ") + join(parts, language) + ".";
    }

    static String notUnderstood(String language) {
        return t(language,
                "Não entendi esse pedido, então não mudei o roteiro. Tente algo como \"mais museus\", \"sem igrejas\", \"menos caminhada\", \"só gratuitos\", \"ritmo mais tranquilo\" ou um lugar pelo nome, como \"Coliseu no dia 2, de manhã\".",
                "I didn't understand that request, so I didn't change the itinerary. Try something like \"more museums\", \"no churches\", \"less walking\", \"free places only\", \"a calmer pace\" or a place by name, like \"Colosseum on day 2 in the morning\".",
                "No entendí ese pedido, así que no cambié el itinerario. Prueba algo como \"más museos\", \"sin iglesias\", \"menos caminata\", \"solo gratuitos\", \"ritmo más tranquilo\" o un lugar por su nombre, como \"Coliseo el día 2 por la mañana\".");
    }

    static String notice(RuleBasedInterpreter.Notice notice, String language) {
        return switch (notice) {
            case MEALS -> t(language,
                    "Refeições não entram como paradas: as sugestões de onde comer aparecem no roteiro, perto do almoço e do jantar.",
                    "Meals are not stops: suggestions of where to eat appear in the itinerary, around lunch and dinner.",
                    "Las comidas no son paradas: las sugerencias de dónde comer aparecen en el itinerario, cerca del almuerzo y la cena.");
            case START_TIME -> t(language,
                    "Ainda não consigo mudar o horário de início, mas no ritmo tranquilo o dia começa às 10h: é só pedir \"ritmo mais tranquilo\".",
                    "I can't change the start time yet, but at a calmer pace the day starts at 10:00: just ask for \"a calmer pace\".",
                    "Todavía no puedo cambiar la hora de inicio, pero con un ritmo tranquilo el día empieza a las 10:00: solo pide \"ritmo más tranquilo\".");
        };
    }

    static String when(Placement placement, String language) {
        int day = placement.day();
        String dayText = switch (day) {
            case 0 -> "";
            case -1 -> t(language, " no último dia", " on the last day", " el último día");
            case -2 -> t(language, " no penúltimo dia", " on the second to last day", " el penúltimo día");
            default -> day > 0 ? t(language, " no dia ", " on day ", " el día ") + day : "";
        };
        String periodText = !placement.time().isEmpty()
                ? t(language, " às ", " at ", " a las ") + placement.time()
                : switch (placement.period()) {
            case "MANHA" -> t(language, " de manhã", " in the morning", " por la mañana");
            case "TARDE" -> t(language, " à tarde", " in the afternoon", " por la tarde");
            case "NOITE" -> t(language, " à noite", " in the evening", " por la noche");
            default -> "";
        };
        return dayText + (dayText.isEmpty() || periodText.isEmpty() ? "" : ",") + periodText;
    }
}
