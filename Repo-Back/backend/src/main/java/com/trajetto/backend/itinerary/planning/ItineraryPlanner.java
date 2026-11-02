package com.trajetto.backend.itinerary.planning;

import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.data.PlaceXid;
import com.trajetto.backend.itinerary.dto.TravelPace;
import com.trajetto.backend.itinerary.planning.RouteOptimizer.Point;
import com.trajetto.backend.itinerary.schedule.OpeningHours;
import com.trajetto.backend.itinerary.schedule.OpeningHours.Status;
import com.trajetto.backend.weather.DayWeather;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Monta as paradas de um roteiro: escolhe os lugares, distribui pelos dias e horarios e
 * ordena cada dia. Nao fala com banco nem com servicos externos -- recebe o catalogo, o
 * pedido, a previsao do tempo ja buscada e devolve o plano. Por isso pode rodar milhares de
 * vezes no benchmark de rotas ({@code RouteOptimizationBenchmarkTest}).
 *
 * <ol>
 *   <li><b>Pontuacao.</b> Cada lugar ganha pontos pela popularidade (0 a 6, em escala log),
 *       por combinar com o perfil do viajante, pelo que ele pediu em texto livre
 *       ({@link TripPreferences}) e perde pela distancia do ponto de partida.</li>
 *   <li><b>Selecao.</b> Os mais bem pontuados enchem os horarios; os da noite (mirantes,
 *       pracas, bares) saem de uma lista propria.</li>
 *   <li><b>Construcao gulosa.</b> Em cada horario, vai ao lugar aberto mais proximo -- antes,
 *       ao que fecha cedo; em dia de chuva, aos lugares cobertos.</li>
 *   <li><b>Melhoria 2-opt.</b> Desfaz os cruzamentos do caminho sem tirar ninguem do horario
 *       de funcionamento ({@link RouteOptimizer}).</li>
 * </ol>
 */
@Component
public class ItineraryPlanner {

    public static final Set<String> MEAL_CATEGORIES = Set.of("restaurant", "cafe", "ice_cream");

    private static final Set<String> NOT_FOR_EVENING = Set.of("historic_archaeological_site", "historic_ruins", "marketplace");

    /** Bar e pub so entram a noite -- e so para quem tem o perfil da vida noturna. */
    private static final Set<String> NIGHTLIFE = Set.of("bar", "pub");
    private static final Set<String> NIGHTLIFE_PROFILES = Set.of("SOCIAL", "MOCHILEIRO");

    /** Lugares ao ar livre: em dia de chuva saem da frente; nos dias secos da mesma viagem, entram primeiro. */
    public static final Set<String> OUTDOOR = Set.of(
            "park", "garden", "viewpoint", "beach", "peak", "nature_reserve", "zoo", "theme_park",
            "historic_archaeological_site", "historic_ruins", "historic_citywalls", "historic_aqueduct",
            "artwork", "waterfall");

    /** Quanto o lugar ganha por combinar com o perfil do viajante (a popularidade vai de 0 a 6). */
    public static final double PROFILE_BONUS = 2.0;

    /** Pedidos em texto livre: "mais museus" vale mais que o perfil; "sem igrejas" derruba ate as famosas. */
    static final double MORE_BONUS = 2.5;
    static final double LESS_PENALTY = 6.0;
    static final double PAID_PENALTY = 6.0;
    /** "Quero ver o Coliseu": o lugar passa na frente de todos. */
    static final double MUST_INCLUDE_BONUS = 100.0;
    /** Ao ajustar um roteiro, as paradas atuais levam um pouco de vantagem: o resto nao muda a toa. */
    static final double KEEP_BONUS = 1.0;

    /**
     * Os lugares mais famosos da cidade ganham o mesmo bonus de quem combina com o perfil: o
     * Coliseu entra para o aventureiro tambem, e o perfil decide o resto do roteiro.
     */
    public static final int MUST_SEE = 5;

    /** Pracas, fontes e pontes, que valem a visita a noite -- nos idiomas das cidades do catalogo. */
    private static final Pattern EVENING_NAME = Pattern.compile(
            "^(Piazza|Piazzale|Fontana|Scalinata|Ponte|Campo|Place|Pont|Fontaine|Praça|Largo|Plaza)\\b|\\bSquare$");

    public static final LocalTime EVENING = LocalTime.of(20, 0);

    /** Tempo de visita que o roteiro reserva em cada parada; o lugar precisa estar aberto o tempo todo. */
    public static final Duration VISIT_LENGTH = Duration.ofHours(1);

    /** Quantos lugares da lista geral entram na busca quando nenhum dos escolhidos esta aberto no horario. */
    private static final int RESERVE_SIZE = 40;

    private final CityCatalog cityCatalog;

    public ItineraryPlanner(CityCatalog cityCatalog) {
        this.cityCatalog = cityCatalog;
    }

    /**
     * @param weather  previsao por dia; dias sem previsao sao planejados sem levar o tempo em conta
     * @param optimize se aplica o 2-opt depois da construcao gulosa (o benchmark compara os dois)
     */
    /**
     * @param keep xids das paradas do roteiro que esta sendo ajustado; vazio num roteiro novo
     */
    public record Request(CityCatalog.City city, String profile, double startLatitude, double startLongitude,
                          LocalDate startDate, int days, TravelPace pace, TripPreferences preferences,
                          Map<LocalDate, DayWeather> weather, boolean optimize, Set<String> keep) {

        public Request(CityCatalog.City city, String profile, double startLatitude, double startLongitude,
                       LocalDate startDate, int days, TravelPace pace, TripPreferences preferences,
                       Map<LocalDate, DayWeather> weather, boolean optimize) {
            this(city, profile, startLatitude, startLongitude, startDate, days, pace, preferences, weather, optimize, Set.of());
        }
    }

    public record Stop(CatalogPlace place, LocalDate date, LocalTime time) {}

    /** Um horario do roteiro: o dia (a partir de 0) e a hora. */
    private record Slot(int day, LocalTime time) {}

    /**
     * @param greedyKm    caminho total (soma dos dias, em linha reta) da construcao gulosa
     * @param optimizedKm caminho total depois do 2-opt; igual ao guloso quando {@code optimize} e falso
     */
    public record Plan(List<Stop> stops, double greedyKm, double optimizedKm, int rainyDays) {}

    private record ScoredPlace(CatalogPlace place, double score) {}

    public Plan plan(Request req, Random random) {
        String profile = req.profile();
        boolean hasProfile = profile != null && !profile.equals("SKIPPED");
        TripPreferences prefs = req.preferences() == null ? TripPreferences.NONE : req.preferences();
        Map<LocalDate, DayWeather> weather = req.weather() == null ? Map.of() : req.weather();
        Set<String> keep = req.keep() == null ? Set.of() : req.keep();

        List<CatalogPlace> candidates = cityCatalog.placesOf(req.city()).stream()
                .filter(place -> !MEAL_CATEGORIES.contains(place.category()))
                .filter(place -> prefs.exclude().stream().noneMatch(name -> matchesName(place, name)))
                .toList();
        Set<CatalogPlace> wanted = mustInclude(candidates, prefs.mustInclude());
        double maxPopularity = Math.log1p(candidates.stream().mapToInt(CatalogPlace::popularity).max().orElse(0));
        Set<CatalogPlace> mustSee = candidates.stream()
                .filter(place -> !NIGHTLIFE.contains(place.category()))
                .sorted(Comparator.comparingInt(CatalogPlace::popularity).reversed())
                .limit(MUST_SEE)
                .collect(Collectors.toSet());

        List<ScoredPlace> scored = candidates.stream().map(place -> {
            double popularityScore = maxPopularity == 0 ? 0 : 6.0 * Math.log1p(place.popularity()) / maxPopularity;
            double profileScore = hasProfile && (place.profiles().contains(profile) || mustSee.contains(place))
                    ? PROFILE_BONUS : 0.0;
            double randomScore = random.nextDouble() * 0.5;
            double distKm = RouteOptimizer.km(new Point(req.startLatitude(), req.startLongitude()), point(place));
            double keepScore = keep.contains(PlaceXid.of(place.name())) ? KEEP_BONUS : 0.0;
            double score = popularityScore + profileScore + randomScore + keepScore - (distKm * 0.15)
                    + preferenceScore(place, prefs, wanted);
            return new ScoredPlace(place, score);
        }).sorted(Comparator.comparingDouble(ScoredPlace::score).reversed())
                .collect(Collectors.toList());

        int days = req.days();
        TravelPace pace = req.pace() == null ? TravelPace.INTENSO : req.pace();
        List<List<LocalTime>> schedule = IntStream.range(0, days).mapToObj(pace::visitTimes).toList();
        // "Fontana di Trevi no ultimo dia, de manha": esses horarios ja saem preenchidos.
        Set<String> chosen = new HashSet<>();
        Map<Slot, CatalogPlace> pins = pin(candidates, prefs.placements(), schedule, req.startDate(), chosen);
        long pinnedEvening = pins.keySet().stream().filter(slot -> !slot.time().isBefore(EVENING)).count();
        long eveningSlots = schedule.stream().flatMap(List::stream).filter(t -> !t.isBefore(EVENING)).count() - pinnedEvening;
        long totalSlots = schedule.stream().mapToLong(List::size).sum() - pins.size();

        List<CatalogPlace> ranked = scored.stream().map(ScoredPlace::place).toList();
        // De dia, cada lugar vira a sua visita principal: quem pontuou com a Piramide do Louvre
        // ganha o Museu do Louvre. A noite fica com os pontos como sao (o mirante, nao o museu).
        List<CatalogPlace> visits = ranked.stream().filter(place -> !NIGHTLIFE.contains(place.category()))
                .map(this::mainVisit).distinct().toList();
        // A noite: mirantes e pracas para todos; bar e pub tambem, para os perfis Social e Mochileiro.
        boolean nightlife = hasProfile && NIGHTLIFE_PROFILES.contains(profile);
        Predicate<CatalogPlace> eveningFit = place -> isEveningPlace(place)
                || (nightlife && NIGHTLIFE.contains(place.category()));
        // Para quem gosta da vida noturna, bar e pub passam na frente das pracas famosas a noite.
        List<CatalogPlace> eveningRanked = ranked.stream().filter(eveningFit)
                .sorted(Comparator.comparing((CatalogPlace place) -> !(nightlife && NIGHTLIFE.contains(place.category()))))
                .toList();
        List<CatalogPlace> eveningPool = pick(eveningRanked, eveningSlots, chosen);
        List<CatalogPlace> dayPool = pick(visits, totalSlots - eveningSlots, chosen);

        boolean anyRain = weather.values().stream().anyMatch(DayWeather::rainy);
        Point origin = new Point(req.startLatitude(), req.startLongitude());
        List<Stop> ordered = new ArrayList<>();
        double greedyKm = 0;
        double optimizedKm = 0;
        int rainyDays = 0;
        for (int day = 0; day < days; day++) {
            double curLat = req.startLatitude();
            double curLng = req.startLongitude();
            LocalDate date = req.startDate().plusDays(day);
            DayWeather forecast = weather.get(date);
            boolean rainy = forecast != null && forecast.rainy();
            if (rainy) rainyDays++;
            // Chuva: lugares cobertos primeiro. Dia seco numa viagem com chuva: os ao ar livre
            // primeiro, para sobrar museu para o dia molhado.
            Predicate<CatalogPlace> weatherFit = rainy ? place -> !OUTDOOR.contains(place.category())
                    : anyRain && forecast != null ? place -> OUTDOOR.contains(place.category())
                    : null;
            List<LocalTime> times = schedule.get(day);
            List<Stop> dayStops = new ArrayList<>();
            final int dayIndex = day;
            for (int slot = 0; slot < times.size(); slot++) {
                LocalTime time = times.get(slot);
                CatalogPlace pinned = pins.get(new Slot(day, time));
                if (pinned != null) {
                    dayStops.add(new Stop(pinned, date, time));
                    curLat = pinned.latitude();
                    curLng = pinned.longitude();
                    continue;
                }
                boolean evening = !time.isBefore(EVENING);
                List<CatalogPlace> pool = evening && !eveningPool.isEmpty() ? eveningPool : dayPool;
                // Os proximos horarios do dia que ainda usam a mesma lista (o dia ou a noite).
                List<LocalTime> later = times.subList(slot + 1, times.size()).stream()
                        .filter(t -> !t.isBefore(EVENING) == evening)
                        .filter(t -> !pins.containsKey(new Slot(dayIndex, t))).toList();
                // Um museu fechado as segundas nao entra na segunda: entre os ja escolhidos, vale o
                // mais perto que esteja aberto no horario; se nenhum estiver, busca outro na lista geral.
                Optional<CatalogPlace> next = nearestOpen(pool, curLat, curLng, date, time, later, weatherFit);
                if (next.isPresent()) {
                    pool.remove(next.get());
                } else {
                    next = nearestOpen(evening ? reserve(ranked, chosen, eveningFit) : reserve(visits, chosen, place -> true),
                            curLat, curLng, date, time, List.of(), weatherFit);
                    next.ifPresent(place -> markChosen(place, chosen));
                }
                if (next.isEmpty()) continue;
                dayStops.add(new Stop(next.get(), date, time));
                curLat = next.get().latitude();
                curLng = next.get().longitude();
            }

            greedyKm += RouteOptimizer.pathKm(origin, null, dayStops, stop -> point(stop.place()));
            Map<LocalTime, CatalogPlace> dayPins = new HashMap<>();
            pins.forEach((slot, place) -> {
                if (slot.day() == dayIndex) dayPins.put(slot.time(), place);
            });
            List<Stop> improved = req.optimize() ? optimizeDay(origin, dayStops, dayPins) : dayStops;
            optimizedKm += RouteOptimizer.pathKm(origin, null, improved, stop -> point(stop.place()));
            ordered.addAll(improved);
        }
        return new Plan(ordered, greedyKm, optimizedKm, rainyDays);
    }

    /**
     * 2-opt nas paradas do dia; a da noite fica fixa no fim. Cada lugar so pode ir para um
     * horario em que esteja aberto, e os lugares pedidos para um horario nao saem dele.
     */
    private List<Stop> optimizeDay(Point origin, List<Stop> dayStops, Map<LocalTime, CatalogPlace> pinned) {
        List<Stop> daytime = dayStops.stream().filter(s -> s.time().isBefore(EVENING)).toList();
        List<Stop> evening = dayStops.stream().filter(s -> !s.time().isBefore(EVENING)).toList();
        if (daytime.size() < 2) return dayStops;
        List<LocalTime> slots = daytime.stream().map(Stop::time).toList();
        LocalDate date = daytime.get(0).date();
        Point end = evening.isEmpty() ? null : point(evening.get(0).place());

        List<Stop> best = RouteOptimizer.twoOpt(origin, end, daytime, stop -> point(stop.place()),
                candidate -> IntStream.range(0, candidate.size()).allMatch(j ->
                        OpeningHours.statusAt(candidate.get(j).place().openingHours(), date, slots.get(j), VISIT_LENGTH)
                                != Status.CLOSED
                                && (!pinned.containsKey(slots.get(j)) || pinned.get(slots.get(j)) == candidate.get(j).place())));

        List<Stop> result = new ArrayList<>();
        for (int j = 0; j < best.size(); j++) result.add(new Stop(best.get(j).place(), date, slots.get(j)));
        result.addAll(evening);
        return result;
    }

    /**
     * Prende cada lugar pedido num dia e periodo ao primeiro horario livre em que ele esteja
     * aberto. Sem horario no periodo, vale qualquer horario livre do dia pedido; sem dia
     * pedido, o primeiro dia que tiver horario no periodo.
     */
    private Map<Slot, CatalogPlace> pin(List<CatalogPlace> candidates, List<TripPreferences.Placement> placements,
                                        List<List<LocalTime>> schedule, LocalDate start, Set<String> chosen) {
        Map<Slot, CatalogPlace> pins = new HashMap<>();
        int days = schedule.size();
        for (TripPreferences.Placement placement : placements) {
            Optional<CatalogPlace> found = candidates.stream().filter(place -> matchesName(place, placement.place()))
                    .max(Comparator.comparingInt(CatalogPlace::popularity));
            if (found.isEmpty()) continue;
            CatalogPlace place = found.get();
            List<Integer> dayOptions = placement.day() == 0 ? IntStream.range(0, days).boxed().toList()
                    : List.of(dayIndex(placement.day(), days));
            Optional<Slot> slot = Optional.empty();
            for (int day : dayOptions) {
                LocalDate date = start.plusDays(day);
                List<LocalTime> free = schedule.get(day).stream()
                        .filter(t -> !pins.containsKey(new Slot(day, t)))
                        .filter(t -> OpeningHours.statusAt(place.openingHours(), date, t, VISIT_LENGTH) != Status.CLOSED)
                        .toList();
                Optional<LocalTime> time = free.stream().filter(t -> inPeriod(t, placement.period())).findFirst();
                if (time.isEmpty() && placement.day() != 0 && !free.isEmpty()) {
                    time = Optional.of("NOITE".equals(placement.period()) ? free.get(free.size() - 1) : free.get(0));
                }
                if (time.isPresent()) {
                    slot = Optional.of(new Slot(day, time.get()));
                    break;
                }
            }
            if (slot.isPresent() && markChosen(place, chosen)) pins.put(slot.get(), place);
        }
        return pins;
    }

    /** Dia pedido (1 e o primeiro, -1 o ultimo) para o indice a partir de 0, dentro da viagem. */
    static int dayIndex(int day, int days) {
        int index = day > 0 ? day - 1 : days + day;
        return Math.max(0, Math.min(days - 1, index));
    }

    static boolean inPeriod(LocalTime time, String period) {
        return switch (period) {
            case "MANHA" -> time.isBefore(LocalTime.NOON);
            case "TARDE" -> !time.isBefore(LocalTime.NOON) && time.isBefore(EVENING);
            case "NOITE" -> !time.isBefore(EVENING);
            default -> true;
        };
    }

    private double preferenceScore(CatalogPlace place, TripPreferences prefs, Set<CatalogPlace> wanted) {
        double score = 0;
        if (prefs.moreCategories().contains(place.category())) score += MORE_BONUS;
        if (prefs.lessCategories().contains(place.category())) score -= LESS_PENALTY;
        if (prefs.avoidPaid() && "yes".equals(place.fee())) score -= PAID_PENALTY;
        if (wanted.contains(place)) score += MUST_INCLUDE_BONUS;
        return score;
    }

    /** Para cada nome pedido, o lugar mais popular do catalogo com esse nome (em qualquer idioma). */
    private Set<CatalogPlace> mustInclude(List<CatalogPlace> candidates, List<String> names) {
        Set<CatalogPlace> found = new HashSet<>();
        for (String name : names) {
            candidates.stream().filter(place -> matchesName(place, name))
                    .max(Comparator.comparingInt(CatalogPlace::popularity))
                    .ifPresent(found::add);
        }
        return found;
    }

    /** "coliseu" acha o "Colosseo" pelo nome em portugues; sem acento e sem diferenciar maiusculas. */
    static boolean matchesName(CatalogPlace place, String query) {
        String q = normalize(query);
        if (q.length() < 3) return false;
        if (normalize(place.name()).contains(q)) return true;
        return place.names() != null && place.names().values().stream().anyMatch(n -> normalize(n).contains(q));
    }

    public static String normalize(String text) {
        if (text == null) return "";
        return Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT).trim();
    }

    private List<CatalogPlace> pick(List<CatalogPlace> ranked, long limit, Set<String> chosen) {
        List<CatalogPlace> picked = new ArrayList<>();
        for (CatalogPlace place : ranked) {
            if (picked.size() == limit) break;
            if (markChosen(place, chosen)) picked.add(place);
        }
        return picked;
    }

    /**
     * Marca o lugar como usado no roteiro, junto com os pontos no mesmo lugar (o Louvre leva
     * a Piramide); devolve {@code false} se ele (ou o mesmo lugar com outro nome) ja estava.
     */
    private boolean markChosen(CatalogPlace place, Set<String> chosen) {
        boolean repeated = chosen.contains(PlaceXid.of(place.name()))
                || (!place.wikidata().isBlank() && chosen.contains(place.wikidata()));
        if (repeated) return false;
        for (CatalogPlace same : cityCatalog.sameVisit(place)) {
            chosen.add(PlaceXid.of(same.name()));
            if (!same.wikidata().isBlank()) chosen.add(same.wikidata());
        }
        return true;
    }

    /** O ponto mais conhecido entre os que ficam no mesmo lugar -- e ele que vale a parada. */
    private CatalogPlace mainVisit(CatalogPlace place) {
        CatalogPlace main = place;
        for (CatalogPlace same : cityCatalog.sameVisit(place)) {
            if (!MEAL_CATEGORIES.contains(same.category()) && same.popularity() > main.popularity()) main = same;
        }
        return main;
    }

    private List<CatalogPlace> reserve(List<CatalogPlace> ranked, Set<String> chosen, Predicate<CatalogPlace> fit) {
        return ranked.stream()
                .filter(fit)
                .filter(place -> !chosen.contains(PlaceXid.of(place.name()))
                        && (place.wikidata().isBlank() || !chosen.contains(place.wikidata())))
                .limit(RESERVE_SIZE)
                .toList();
    }

    /**
     * O mais perto aberto no horario. Antes, porem, o que fecha antes dos proximos horarios
     * do dia: o Coliseu fecha as 16h30 no inverno, e quem segue sempre o mais perto chega
     * la tarde demais e perde a visita. Com {@code weatherFit}, os lugares que combinam com o
     * tempo do dia passam na frente (se houver algum aberto).
     */
    private Optional<CatalogPlace> nearestOpen(List<CatalogPlace> pool, double lat, double lng, LocalDate date,
                                               LocalTime time, List<LocalTime> later, Predicate<CatalogPlace> weatherFit) {
        List<CatalogPlace> open = pool.stream()
                .filter(place -> OpeningHours.statusAt(place.openingHours(), date, time, VISIT_LENGTH) != Status.CLOSED)
                .toList();
        List<CatalogPlace> lastChance = later.isEmpty() ? List.of() : open.stream()
                .filter(place -> later.stream().allMatch(t ->
                        OpeningHours.statusAt(place.openingHours(), date, t, VISIT_LENGTH) == Status.CLOSED))
                .toList();
        List<CatalogPlace> options = lastChance.isEmpty() ? open : lastChance;
        if (weatherFit != null) {
            List<CatalogPlace> fit = options.stream().filter(weatherFit).toList();
            if (!fit.isEmpty()) options = fit;
        }
        Point here = new Point(lat, lng);
        return options.stream().min(Comparator.comparingDouble(place -> RouteOptimizer.km(here, point(place))));
    }

    private boolean isEveningPlace(CatalogPlace place) {
        return !NOT_FOR_EVENING.contains(place.category())
                && ("viewpoint".equals(place.category()) || EVENING_NAME.matcher(place.name()).find());
    }

    private static Point point(CatalogPlace place) {
        return new Point(place.latitude(), place.longitude());
    }
}
