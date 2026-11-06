package com.trajetto.backend.itinerary.ai;

import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.PlaceResponseDTO;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner;
import com.trajetto.backend.itinerary.planning.TripPreferences;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.trajetto.backend.itinerary.ai.AssistantMessages.categories;
import static com.trajetto.backend.itinerary.ai.AssistantMessages.join;
import static com.trajetto.backend.itinerary.ai.AssistantMessages.t;

/**
 * A resposta do assistente, escrita a partir do roteiro que saiu e nao so do pedido: o que entrou
 * e saiu, e o que nao deu para atender. Um pedido atendido pela metade precisa dizer isso.
 */
public final class AssistantReply {

    private static final int NAMES_SHOWN = 2;

    private AssistantReply() {}

    /**
     * @param request        o que o viajante escreveu
     * @param requested      o que foi entendido do pedido
     * @param language       idioma do app ("en-US"); sem ele, portugues
     * @param catalog        lugares da cidade
     * @param sameVisitNames nomes dos pontos que contam como a mesma visita de um lugar
     */
    public record Context(String request, TripPreferences requested, String language, List<CatalogPlace> catalog,
                          Function<String, Set<String>> sameVisitNames) {}

    /** O pedido nao rendeu ajuste nenhum: explica por que e nao mexe no roteiro. */
    public static String withoutChanges(Context context) {
        String language = AssistantMessages.language(context.language());
        List<String> notices = notices(context, language);
        return notices.isEmpty() ? AssistantMessages.notUnderstood(language) : String.join(" ", notices);
    }

    /** Roteiro novo gerado com um pedido: nao ha o que comparar, so o que nao deu para atender. */
    public static String forGenerated(Context context, ItineraryResponseDTO generated) {
        String language = AssistantMessages.language(context.language());
        List<String> lines = new ArrayList<>();
        lines.add(context.requested().summary());
        lines.addAll(unmet(context, null, generated, language));
        lines.addAll(notices(context, language));
        return String.join("\n", lines);
    }

    /** Ajuste de um roteiro: o que foi entendido, o que mudou e o que ficou de fora. */
    public static String forAdjusted(Context context, ItineraryResponseDTO before, ItineraryResponseDTO after) {
        String language = AssistantMessages.language(context.language());
        List<String> lines = new ArrayList<>();
        lines.add(context.requested().summary());
        lines.add(changes(before, after, language));
        String walking = walkingChange(context.requested(), before, after, language);
        if (walking != null) lines.add(walking);
        lines.addAll(unmet(context, before, after, language));
        lines.addAll(notices(context, language));
        return String.join("\n", lines);
    }

    private static List<String> notices(Context context, String language) {
        return RuleBasedInterpreter.notices(context.request(), context.catalog()).stream()
                .map(notice -> AssistantMessages.notice(notice, language)).toList();
    }

    private static String changes(ItineraryResponseDTO before, ItineraryResponseDTO after, String language) {
        Set<String> oldXids = before.getPlaces().stream().map(PlaceResponseDTO::getXid).collect(Collectors.toSet());
        Set<String> newXids = after.getPlaces().stream().map(PlaceResponseDTO::getXid).collect(Collectors.toSet());
        List<PlaceResponseDTO> added = after.getPlaces().stream().filter(p -> !oldXids.contains(p.getXid())).toList();
        List<PlaceResponseDTO> removed = before.getPlaces().stream().filter(p -> !newXids.contains(p.getXid())).toList();
        if (added.isEmpty() && removed.isEmpty()) {
            return Objects.equals(schedule(before), schedule(after))
                    ? t(language, "O roteiro não mudou: ele já estava assim.", "The itinerary didn't change: it was already like this.", "El itinerario no cambió: ya estaba así.")
                    : t(language, "As paradas são as mesmas, em outra ordem.", "The stops are the same, in a different order.", "Las paradas son las mismas, en otro orden.");
        }
        List<String> parts = new ArrayList<>();
        if (!added.isEmpty()) {
            parts.add(added.size() == 1
                    ? t(language, "Entrou ", "Added ", "Entró ") + listed(added, language)
                    : t(language, "Entraram ", "Added ", "Entraron ") + added.size() + t(language, " paradas: ", " stops: ", " paradas: ") + listed(added, language));
        }
        if (!removed.isEmpty()) {
            parts.add(removed.size() == 1
                    ? t(language, "Saiu ", "Removed ", "Salió ") + listed(removed, language)
                    : t(language, "Saíram ", "Removed ", "Salieron ") + removed.size() + t(language, " paradas: ", " stops: ", " paradas: ") + listed(removed, language));
        }
        return String.join(". ", parts) + ".";
    }

    private static List<String> schedule(ItineraryResponseDTO itinerary) {
        return itinerary.getPlaces().stream()
                .map(p -> p.getXid() + "|" + p.getVisitDate() + "|" + p.getEstimatedVisitTime()).sorted().toList();
    }

    /** Os primeiros nomes e quantos mais: "A, B e mais 3". */
    private static String listed(List<PlaceResponseDTO> places, String language) {
        List<String> shown = new ArrayList<>(places.stream().limit(NAMES_SHOWN).map(p -> name(p, language)).toList());
        int hidden = places.size() - shown.size();
        if (hidden > 0) shown.add(t(language, "mais " + hidden, hidden + " more", "otras " + hidden));
        return join(shown, language);
    }

    private static String name(PlaceResponseDTO place, String language) {
        return place.getNames() == null ? place.getName() : place.getNames().getOrDefault(language, place.getName());
    }

    private static String walkingChange(TripPreferences requested, ItineraryResponseDTO before, ItineraryResponseDTO after, String language) {
        if (!TripPreferences.WALK_LESS.equals(requested.walking())) return null;
        if (before.getDistanceKm() == null || after.getDistanceKm() == null) return null;
        Locale locale = Locale.forLanguageTag(language);
        String from = String.format(locale, "%.1f", before.getDistanceKm());
        String to = String.format(locale, "%.1f", after.getDistanceKm());
        if (after.getDistanceKm() < before.getDistanceKm()) {
            return t(language, "O caminho total caiu de ", "The total route went from ", "El camino total bajó de ")
                    + from + t(language, " km para ", " km to ", " km a ") + to + " km.";
        }
        return t(language, "Não consegui encurtar mais o caminho: continua em ", "I couldn't shorten the route any further: it's still ", "No pude acortar más el camino: sigue en ")
                + to + " km.";
    }

    /** O que foi pedido e o roteiro nao atendeu. */
    private static List<String> unmet(Context context, ItineraryResponseDTO before, ItineraryResponseDTO after, String language) {
        TripPreferences requested = context.requested();
        List<String> lines = new ArrayList<>();

        // Lugares pedidos pelo nome: entraram? no dia e periodo pedidos?
        for (TripPreferences.Placement placement : requested.placements()) {
            List<PlaceResponseDTO> stops = stopsOf(context, after, placement.place());
            if (stops.isEmpty()) {
                lines.add(t(language, "Não consegui colocar ", "I couldn't fit ", "No pude incluir ") + placeLabel(context, placement.place(), language)
                        + AssistantMessages.when(placement.day(), placement.period(), language)
                        + t(language, ": ele não está aberto nos horários livres.", ": it isn't open at the free times.", ": no está abierto en los horarios libres."));
            } else if (stops.stream().noneMatch(stop -> inPlace(stop, placement, after))) {
                lines.add(placeLabel(context, placement.place(), language)
                        + t(language, " não coube", " didn't fit", " no cupo")
                        + AssistantMessages.when(placement.day(), placement.period(), language)
                        + t(language, ": ficou no dia ", ": it's on day ", ": quedó en el día ") + dayNumber(stops.get(0), after)
                        + t(language, ", às ", ", at ", ", a las ") + stops.get(0).getEstimatedVisitTime() + ".");
            }
        }
        for (String place : requested.mustInclude()) {
            if (stopsOf(context, after, place).isEmpty()) {
                lines.add(t(language, "Não consegui incluir ", "I couldn't include ", "No pude incluir ") + placeLabel(context, place, language)
                        + t(language, ": ele não está aberto nos horários livres.", ": it isn't open at the free times.", ": no está abierto en los horarios libres."));
            }
        }

        // "Mais museus": o numero subiu? a cidade tem algum?
        List<String> more = requested.moreCategories();
        if (!more.isEmpty()) {
            Set<String> inCity = context.catalog().stream().map(CatalogPlace::category).collect(Collectors.toSet());
            long afterCount = count(after, more);
            if (more.stream().noneMatch(inCity::contains)) {
                lines.add(t(language, "Esta cidade não tem ", "This city has no ", "Esta ciudad no tiene ") + categories(more, language)
                        + t(language, " no nosso catálogo.", " in our catalog.", " en nuestro catálogo."));
            } else if (before == null ? afterCount == 0 : afterCount <= count(before, more)) {
                lines.add(t(language, "Não consegui colocar mais ", "I couldn't add more ", "No pude incluir más ") + categories(more, language)
                        + t(language, " nos horários livres.", " at the free times.", " en los horarios libres."));
            }
        }

        // "Menos igrejas": alguma ficou?
        long remaining = count(after, requested.lessCategories());
        if (remaining > 0) {
            lines.add(t(language, "Ainda ficaram ", "There are still ", "Todavía quedan ") + remaining + " ("
                    + categories(requested.lessCategories(), language)
                    + t(language, "): não havia outras opções abertas nesses horários.", "): no other options were open at those times.", "): no había otras opciones abiertas en esos horarios."));
        }

        if (requested.avoidPaid()) {
            long paid = after.getPlaces().stream().filter(p -> "yes".equals(p.getFee())).count();
            if (paid > 0) {
                lines.add(t(language, "Ainda ficaram ", "There are still ", "Todavía quedan ") + paid
                        + t(language, " lugares pagos: não havia outras opções abertas nesses horários.", " paid places: no other options were open at those times.", " lugares de pago: no había otras opciones abiertas en esos horarios."));
            }
            if (after.getPlaces().stream().anyMatch(p -> p.getFee() == null || p.getFee().isBlank())) {
                lines.add(t(language, "Alguns lugares não têm preço informado, então vale conferir antes de ir.",
                        "Some places have no price information, so it's worth checking before you go.",
                        "Algunos lugares no tienen precio informado, conviene confirmarlo antes de ir."));
            }
        }
        return lines;
    }

    private static List<PlaceResponseDTO> stopsOf(Context context, ItineraryResponseDTO itinerary, String place) {
        Set<String> names = context.sameVisitNames().apply(place);
        return itinerary.getPlaces().stream().filter(p -> names.contains(p.getName())).toList();
    }

    private static boolean inPlace(PlaceResponseDTO stop, TripPreferences.Placement placement, ItineraryResponseDTO itinerary) {
        if (stop.getEstimatedVisitTime() == null) return false;
        boolean dayOk = placement.day() == 0 || dayNumber(stop, itinerary) - 1 == ItineraryPlanner.dayIndex(placement.day(), days(itinerary));
        return dayOk && ItineraryPlanner.inPeriod(stop.getEstimatedVisitTime(), placement.period());
    }

    private static long dayNumber(PlaceResponseDTO stop, ItineraryResponseDTO itinerary) {
        LocalDate date = stop.getVisitDate() == null ? itinerary.getStartDate() : stop.getVisitDate();
        return ChronoUnit.DAYS.between(itinerary.getStartDate(), date) + 1;
    }

    private static int days(ItineraryResponseDTO itinerary) {
        return (int) ChronoUnit.DAYS.between(itinerary.getStartDate(), itinerary.getEndDate()) + 1;
    }

    private static String placeLabel(Context context, String place, String language) {
        return context.catalog().stream().filter(p -> p.name().equals(place)).findFirst()
                .filter(p -> p.names() != null)
                .map(p -> p.names().getOrDefault(language, place))
                .orElse(place);
    }

    private static long count(ItineraryResponseDTO itinerary, Collection<String> categories) {
        return itinerary.getPlaces().stream().filter(p -> categories.contains(p.getCategory())).count();
    }
}
