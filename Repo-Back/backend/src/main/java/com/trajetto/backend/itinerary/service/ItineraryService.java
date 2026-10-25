package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.itinerary.data.BookingLinks;
import com.trajetto.backend.itinerary.data.PlaceXid;
import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.dto.AddPlaceRequestDTO;
import com.trajetto.backend.itinerary.dto.DateRequestDTO;
import com.trajetto.backend.itinerary.dto.GenerateItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.ItineraryNames;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.NameRequestDTO;
import com.trajetto.backend.itinerary.dto.NoteRequestDTO;
import com.trajetto.backend.itinerary.dto.PlaceRequestDTO;
import com.trajetto.backend.itinerary.dto.PlaceResponseDTO;
import com.trajetto.backend.itinerary.dto.RatingRequestDTO;
import com.trajetto.backend.itinerary.dto.TravelPace;
import com.trajetto.backend.itinerary.model.ItineraryModel;
import com.trajetto.backend.itinerary.model.PlaceModel;
import com.trajetto.backend.itinerary.schedule.OpeningHours;
import com.trajetto.backend.itinerary.schedule.OpeningHours.Status;
import com.trajetto.backend.exception.ForbiddenOperationException;
import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.exception.ResourceNotFoundException;
import com.trajetto.backend.itinerary.repository.ItineraryRepository;
import com.trajetto.backend.itinerary.repository.PlaceRepository;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.HashSet;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class ItineraryService {

    private static final Set<String> MEAL_CATEGORIES = Set.of("restaurant", "cafe", "ice_cream");

    private static final Set<String> NOT_FOR_EVENING = Set.of("historic_archaeological_site", "historic_ruins", "marketplace");

    /** Bar e pub so entram a noite -- e so para quem tem o perfil da vida noturna. */
    private static final Set<String> NIGHTLIFE = Set.of("bar", "pub");
    private static final Set<String> NIGHTLIFE_PROFILES = Set.of("SOCIAL", "MOCHILEIRO");

    /** Quanto o lugar ganha por combinar com o perfil do viajante (a popularidade vai de 0 a 6). */
    static final double PROFILE_BONUS = 2.0;

    /**
     * Os lugares mais famosos da cidade ganham o mesmo bonus de quem combina com o perfil: o
     * Coliseu entra para o aventureiro tambem, e o perfil decide o resto do roteiro.
     */
    static final int MUST_SEE = 5;

    /** Pracas, fontes e pontes, que valem a visita a noite -- nos idiomas das cidades do catalogo. */
    private static final Pattern EVENING_NAME = Pattern.compile(
            "^(Piazza|Piazzale|Fontana|Scalinata|Ponte|Campo|Place|Pont|Fontaine|Praça|Largo|Plaza)\\b|\\bSquare$");

    private static final LocalTime EVENING = LocalTime.of(20, 0);

    /** Tempo de visita que o roteiro reserva em cada parada; o lugar precisa estar aberto o tempo todo. */
    static final Duration VISIT_LENGTH = Duration.ofHours(1);

    /** Quantos lugares da lista geral entram na busca quando nenhum dos escolhidos esta aberto no horario. */
    private static final int RESERVE_SIZE = 40;

    private static final LocalTime LAST_ADDED_TIME = LocalTime.of(22, 0);
    private static final Duration GAP_BETWEEN_STOPS = Duration.ofMinutes(90);

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CityCatalog cityCatalog;

    @Autowired
    private PlaceRepository placeRepository;

    // Sorteio que varia o roteiro entre geracoes. Fica num campo para os testes fixarem a semente.
    private Random random = new Random();

    @Transactional
    public ItineraryModel createItineraryMock(Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", userId));

        deactivateActiveItineraries(user);

        ItineraryModel itinerary = new ItineraryModel();
        itinerary.setStartDate(LocalDate.now());
        itinerary.setEndDate(LocalDate.now().plusDays(3));
        List<PlaceModel> places = new ArrayList<>();

        PlaceModel eiffel = new PlaceModel();
        eiffel.setName("Eiffel Tower");
        eiffel.setAddress("Champ de Mars, 5 Avenue Anatole France, Paris");
        eiffel.setLatitude(48.8584);
        eiffel.setLongitude(2.2945);
        eiffel.setEstimatedVisitTime(LocalTime.of(8, 0));
        eiffel.setItinerary(itinerary);
        eiffel.setOrderIndex(0);

        PlaceModel louvre = new PlaceModel();
        louvre.setName("Louvre Museum");
        louvre.setAddress("Rue de Rivoli, Paris");
        louvre.setLatitude(48.8606);
        louvre.setLongitude(2.3376);
        louvre.setEstimatedVisitTime(LocalTime.of(11, 0));
        louvre.setItinerary(itinerary);
        louvre.setOrderIndex(1);

        PlaceModel champsDeMars = new PlaceModel();
        champsDeMars.setName("Champ de Mars Park");
        champsDeMars.setAddress("2 Allée Adrienne Lecouvreur, 75007 Paris");
        champsDeMars.setLatitude(48.8556);
        champsDeMars.setLongitude(2.2986);
        champsDeMars.setEstimatedVisitTime(LocalTime.of(9, 30));
        champsDeMars.setItinerary(itinerary);
        champsDeMars.setOrderIndex(2);

        PlaceModel trocadero = new PlaceModel();
        trocadero.setName("Trocadéro Gardens");
        trocadero.setAddress("Place du Trocadéro et du 11 Novembre, 75016 Paris");
        trocadero.setLatitude(48.8629);
        trocadero.setLongitude(2.2873);
        trocadero.setEstimatedVisitTime(LocalTime.of(10, 30));
        trocadero.setItinerary(itinerary);
        trocadero.setOrderIndex(3);

        places.add(eiffel);
        places.add(louvre);
        places.add(champsDeMars);
        places.add(trocadero);
        itinerary.setUser(user);

        itinerary.setPlaces(places);
        itinerary.setActive(true);

        return itineraryRepository.save(itinerary);
    }

    public ItineraryResponseDTO getActiveItinerary(Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", userId));

        List<ItineraryModel> activeItineraries = itineraryRepository.findByUserAndActiveTrue(user);

        if (!activeItineraries.isEmpty()) {
            return toDTO(activeItineraries.get(0));
        }
        return null;
    }

    @Transactional
    public ItineraryResponseDTO generateItinerary(GenerateItineraryRequestDTO req) {
        UserModel user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", req.getUserId()));

        String profile = user.getTravelerProfile();
        boolean hasProfile = profile != null && !profile.equals("SKIPPED");

        record ScoredPlace(CatalogPlace place, double score) {}

        // A cidade escolhida no app; sem escolha, a do catalogo mais perto do ponto de partida.
        CityCatalog.City city = req.getCity() == null || req.getCity().isBlank()
                ? cityCatalog.nearestCity(req.getStartLatitude(), req.getStartLongitude())
                : cityCatalog.city(req.getCity())
                        .orElseThrow(() -> new InvalidRequestException("Cidade não atendida: " + req.getCity()));
        List<CatalogPlace> candidates = cityCatalog.placesOf(city).stream()
                .filter(place -> !MEAL_CATEGORIES.contains(place.category()))
                .toList();
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
            double distKm = haversineKm(req.getStartLatitude(), req.getStartLongitude(),
                    place.latitude(), place.longitude());
            double score = popularityScore + profileScore + randomScore - (distKm * 0.15);
            return new ScoredPlace(place, score);
        }).sorted(Comparator.comparingDouble(ScoredPlace::score).reversed())
                .collect(Collectors.toList());

        int days = req.getDays() == null ? 1 : req.getDays();
        LocalDate startDate = req.getStartDate() == null ? LocalDate.now() : req.getStartDate();

        TravelPace pace = req.getPace() == null ? TravelPace.INTENSO : req.getPace();
        List<List<LocalTime>> schedule = IntStream.range(0, days).mapToObj(pace::visitTimes).toList();
        long eveningSlots = schedule.stream().flatMap(List::stream).filter(t -> !t.isBefore(EVENING)).count();
        long totalSlots = schedule.stream().mapToLong(List::size).sum();

        List<CatalogPlace> ranked = scored.stream().map(ScoredPlace::place).toList();
        // De dia, cada lugar vira a sua visita principal: quem pontuou com a Piramide do Louvre
        // ganha o Museu do Louvre. A noite fica com os pontos como sao (o mirante, nao o museu).
        List<CatalogPlace> visits = ranked.stream().filter(place -> !NIGHTLIFE.contains(place.category()))
                .map(this::mainVisit).distinct().toList();
        // A noite: mirantes e pracas para todos; bar e pub tambem, para os perfis Social e Mochileiro.
        boolean nightlife = hasProfile && NIGHTLIFE_PROFILES.contains(profile);
        Predicate<CatalogPlace> eveningFit = place -> isEveningPlace(place)
                || (nightlife && NIGHTLIFE.contains(place.category()));
        Set<String> chosen = new HashSet<>();
        // Para quem gosta da vida noturna, bar e pub passam na frente das pracas famosas a noite.
        List<CatalogPlace> eveningRanked = ranked.stream().filter(eveningFit)
                .sorted(Comparator.comparing((CatalogPlace place) -> !(nightlife && NIGHTLIFE.contains(place.category()))))
                .toList();
        List<CatalogPlace> eveningPool = pick(eveningRanked, eveningSlots, chosen);
        List<CatalogPlace> dayPool = pick(visits, totalSlots - eveningSlots, chosen);

        record DayStop(CatalogPlace place, LocalDate date, LocalTime time) {}
        List<DayStop> ordered = new ArrayList<>();
        for (int day = 0; day < days; day++) {
            double curLat = req.getStartLatitude();
            double curLng = req.getStartLongitude();
            LocalDate date = startDate.plusDays(day);
            List<LocalTime> times = schedule.get(day);
            for (int slot = 0; slot < times.size(); slot++) {
                LocalTime time = times.get(slot);
                boolean evening = !time.isBefore(EVENING);
                List<CatalogPlace> pool = evening && !eveningPool.isEmpty() ? eveningPool : dayPool;
                // Os proximos horarios do dia que ainda usam a mesma lista (o dia ou a noite).
                List<LocalTime> later = times.subList(slot + 1, times.size()).stream()
                        .filter(t -> !t.isBefore(EVENING) == evening).toList();
                // Um museu fechado as segundas nao entra na segunda: entre os ja escolhidos, vale o
                // mais perto que esteja aberto no horario; se nenhum estiver, busca outro na lista geral.
                Optional<CatalogPlace> next = nearestOpen(pool, curLat, curLng, date, time, later);
                if (next.isPresent()) {
                    pool.remove(next.get());
                } else {
                    next = nearestOpen(evening ? reserve(ranked, chosen, eveningFit) : reserve(visits, chosen, place -> true),
                            curLat, curLng, date, time, List.of());
                    next.ifPresent(place -> markChosen(place, chosen));
                }
                if (next.isEmpty()) continue;
                ordered.add(new DayStop(next.get(), date, time));
                curLat = next.get().latitude();
                curLng = next.get().longitude();
            }
        }

        deactivateActiveItineraries(user);

        ItineraryModel itinerary = new ItineraryModel();
        itinerary.setStartDate(startDate);
        itinerary.setEndDate(startDate.plusDays(days - 1L));
        itinerary.setActive(true);
        itinerary.setUser(user);
        itinerary.setOriginLatitude(req.getStartLatitude());
        itinerary.setOriginLongitude(req.getStartLongitude());
        itinerary.setCity(city.slug());
        itinerary.setName(ItineraryNames.normalize(req.getName()));

        List<PlaceModel> places = new ArrayList<>();
        for (int i = 0; i < ordered.size(); i++) {
            CatalogPlace rp = ordered.get(i).place();
            PlaceModel p = new PlaceModel();
            p.setXid(PlaceXid.of(rp.name()));
            p.setName(rp.name());
            p.setAddress(rp.address());
            p.setLatitude(rp.latitude());
            p.setLongitude(rp.longitude());
            p.setVisitDate(ordered.get(i).date());
            p.setEstimatedVisitTime(ordered.get(i).time());
            p.setOrderIndex(i);
            p.setOpeningHours(rp.openingHours().isBlank() ? null : rp.openingHours());
            p.setCategory(rp.category().isBlank() ? null : rp.category());
            p.setFee(rp.fee().isBlank() ? null : rp.fee());
            p.setItinerary(itinerary);
            places.add(p);
        }
        itinerary.setPlaces(places);

        return toDTO(itineraryRepository.save(itinerary));
    }

    private void deactivateActiveItineraries(UserModel user) {
        List<ItineraryModel> ativos = itineraryRepository.findByUserAndActiveTrue(user);
        ativos.forEach(it -> it.setActive(false));
        itineraryRepository.saveAllAndFlush(ativos);
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
     * la tarde demais e perde a visita.
     */
    private Optional<CatalogPlace> nearestOpen(List<CatalogPlace> pool, double lat, double lng, LocalDate date,
                                               LocalTime time, List<LocalTime> later) {
        List<CatalogPlace> open = pool.stream()
                .filter(place -> OpeningHours.statusAt(place.openingHours(), date, time, VISIT_LENGTH) != Status.CLOSED)
                .toList();
        List<CatalogPlace> lastChance = later.isEmpty() ? List.of() : open.stream()
                .filter(place -> later.stream().allMatch(t ->
                        OpeningHours.statusAt(place.openingHours(), date, t, VISIT_LENGTH) == Status.CLOSED))
                .toList();
        return (lastChance.isEmpty() ? open : lastChance).stream()
                .min(Comparator.comparingDouble(place -> haversineKm(lat, lng, place.latitude(), place.longitude())));
    }

    private boolean isEveningPlace(CatalogPlace place) {
        return !NOT_FOR_EVENING.contains(place.category())
                && ("viewpoint".equals(place.category()) || EVENING_NAME.matcher(place.name()).find());
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public List<ItineraryResponseDTO> getAllItineraries(Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", userId));
        return itineraryRepository.findByUserOrderByStartDateDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Troca qual roteiro do usuário está ativo.
     *
     * <p>A regra de que um usuário tem no máximo um roteiro ativo agora é do
     * banco: o índice único {@code uk_itineraries_active_per_user} (migração
     * V4) não admite dois. Por isso a desativação vem primeiro e é
     * descarregada antes da ativação — o roteiro que sai tem de largar a
     * marca antes de o que entra assumi-la. A versão anterior percorria os
     * roteiros em ordem de data e marcava cada um no caminho, então quando o
     * alvo vinha antes do ativo atual os dois ficavam ativos ao mesmo tempo,
     * e {@code getActiveItinerary} passava a devolver um dos dois conforme a
     * ordem que o banco entregasse.</p>
     */
    @Transactional
    public ItineraryResponseDTO activateItinerary(Long itineraryId, Long userId) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", userId));
        ItineraryModel target = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Roteiro", itineraryId));
        if (!target.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("Este roteiro pertence a outro usuário.");
        }

        List<ItineraryModel> ativos = itineraryRepository.findByUserAndActiveTrue(user);
        ativos.forEach(it -> it.setActive(false));
        itineraryRepository.saveAllAndFlush(ativos);

        target.setActive(true);
        return toDTO(itineraryRepository.saveAndFlush(target));
    }

    public ItineraryResponseDTO updateRating(Long itineraryId, Long userId, RatingRequestDTO req) {
        ItineraryModel itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Roteiro", itineraryId));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("Este roteiro pertence a outro usuário.");
        }
        itinerary.setRating(req.getRating());
        itinerary.setRatingDescription(req.getRatingDescription());
        return toDTO(itineraryRepository.save(itinerary));
    }

    public ItineraryResponseDTO updateDate(Long itineraryId, Long userId, DateRequestDTO req) {
        ItineraryModel itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Roteiro", itineraryId));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("Este roteiro pertence a outro usuário.");
        }
        itinerary.setDate(req.getDate());
        return toDTO(itineraryRepository.save(itinerary));
    }

    public ItineraryResponseDTO updateName(Long itineraryId, Long userId, NameRequestDTO req) {
        ItineraryModel itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Roteiro", itineraryId));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("Este roteiro pertence a outro usuário.");
        }
        itinerary.setName(ItineraryNames.normalize(req.getName()));
        return toDTO(itineraryRepository.save(itinerary));
    }

    public ItineraryResponseDTO replacePlace(Long itineraryId, Integer orderIndex, Long userId, PlaceRequestDTO req) {
        ItineraryModel itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Roteiro", itineraryId));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("Este roteiro pertence a outro usuário.");
        }

        PlaceModel place = itinerary.getPlaces().stream()
                .filter(p -> p.getOrderIndex().equals(orderIndex))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Local de índice " + orderIndex + " não encontrado no roteiro."));

        place.setName(req.getName());
        place.setAddress(req.getAddress());
        place.setLatitude(req.getLatitude());
        place.setLongitude(req.getLongitude());
        place.setOpeningHours(req.getOpeningHours());
        place.setCategory(req.getCategory());
        place.setFee(req.getFee());
        if (req.getEstimatedVisitTime() != null) {
            place.setEstimatedVisitTime(java.time.LocalTime.parse(req.getEstimatedVisitTime()));
        }

        return toDTO(itineraryRepository.save(itinerary));
    }

    public ItineraryResponseDTO updateNote(Long itineraryId, Integer orderIndex, Long userId, NoteRequestDTO req) {
        ItineraryModel itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Roteiro", itineraryId));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("Este roteiro pertence a outro usuário.");
        }

        PlaceModel place = itinerary.getPlaces().stream()
                .filter(p -> p.getOrderIndex().equals(orderIndex))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Local de índice " + orderIndex + " não encontrado no roteiro."));

        String note = req.getNote();
        place.setNote(note == null || note.isBlank() ? null : note.trim());

        return toDTO(itineraryRepository.save(itinerary));
    }

    /** Tira uma parada do roteiro; as que vem depois sobem uma posicao. */
    @Transactional
    public ItineraryResponseDTO removePlace(Long itineraryId, Integer orderIndex, Long userId) {
        ItineraryModel itinerary = ownedItinerary(itineraryId, userId);
        PlaceModel place = placeAt(itinerary, orderIndex);
        itinerary.getPlaces().remove(place);
        placeRepository.delete(place);
        placeRepository.flush();
        return toDTO(renumber(itinerary));
    }

    /**
     * Troca a parada de lugar com a vizinha do mesmo dia. Os horarios ficam onde estavam (o das
     * 9h continua sendo o das 9h); quem muda e o lugar visitado em cada horario.
     */
    @Transactional
    public ItineraryResponseDTO movePlace(Long itineraryId, Integer orderIndex, String direction, Long userId) {
        ItineraryModel itinerary = ownedItinerary(itineraryId, userId);
        PlaceModel place = placeAt(itinerary, orderIndex);
        int step;
        if ("UP".equalsIgnoreCase(direction)) step = -1;
        else if ("DOWN".equalsIgnoreCase(direction)) step = 1;
        else throw new InvalidRequestException("A direção deve ser UP ou DOWN.");

        List<PlaceModel> sameDay = byVisitOrder(itinerary).stream()
                .filter(p -> visitDate(p).equals(visitDate(place)))
                .toList();
        int position = sameDay.indexOf(place);
        int target = position + step;
        if (target < 0 || target >= sameDay.size()) {
            throw new InvalidRequestException("Esta parada já está no " + (step < 0 ? "início" : "fim") + " do dia.");
        }
        PlaceModel neighbor = sameDay.get(target);
        LocalTime time = place.getEstimatedVisitTime();
        place.setEstimatedVisitTime(neighbor.getEstimatedVisitTime());
        neighbor.setEstimatedVisitTime(time);
        return toDTO(renumber(itinerary));
    }

    /**
     * Inclui um lugar escolhido pelo usuario (por exemplo, um favorito) num dia do roteiro. Sem
     * horario informado, ele entra 1h30 depois da ultima parada do dia. Os dados que o catalogo
     * tem e o pedido nao (horario de funcionamento, entrada paga) sao completados pelo catalogo.
     */
    @Transactional
    public ItineraryResponseDTO addPlace(Long itineraryId, AddPlaceRequestDTO req, Long userId) {
        ItineraryModel itinerary = ownedItinerary(itineraryId, userId);
        LocalDate date = req.getVisitDate() != null ? req.getVisitDate() : itinerary.getStartDate();
        LocalDate lastDay = itinerary.getEndDate() != null ? itinerary.getEndDate() : itinerary.getStartDate();
        if (date.isBefore(itinerary.getStartDate()) || date.isAfter(lastDay)) {
            throw new InvalidRequestException("O dia escolhido está fora do período do roteiro.");
        }

        LocalTime time = req.getEstimatedVisitTime() != null
                ? LocalTime.parse(req.getEstimatedVisitTime())
                : nextFreeTime(itinerary, date);

        Optional<CatalogPlace> catalog = cityCatalog.getPlaces().stream()
                .filter(rp -> PlaceXid.of(rp.name()).equals(req.getXid()) || rp.name().equalsIgnoreCase(req.getName()))
                .findFirst();

        PlaceModel place = new PlaceModel();
        place.setXid(req.getXid() != null ? req.getXid() : PlaceXid.of(req.getName()));
        place.setName(req.getName());
        place.setAddress(req.getAddress());
        place.setLatitude(req.getLatitude());
        place.setLongitude(req.getLongitude());
        place.setCategory(req.getCategory() != null ? req.getCategory()
                : catalog.map(CatalogPlace::category).filter(c -> !c.isBlank()).orElse(null));
        place.setOpeningHours(catalog.map(CatalogPlace::openingHours).filter(h -> !h.isBlank()).orElse(null));
        place.setFee(catalog.map(CatalogPlace::fee).filter(f -> !f.isBlank()).orElse(null));
        place.setVisitDate(date);
        place.setEstimatedVisitTime(time);
        place.setOrderIndex(itinerary.getPlaces().stream().mapToInt(PlaceModel::getOrderIndex).max().orElse(-1) + 1);
        place.setItinerary(itinerary);
        itinerary.getPlaces().add(place);
        itineraryRepository.saveAndFlush(itinerary);
        return toDTO(renumber(itinerary));
    }

    private LocalTime nextFreeTime(ItineraryModel itinerary, LocalDate date) {
        LocalTime last = itinerary.getPlaces().stream()
                .filter(p -> visitDate(p).equals(date) && p.getEstimatedVisitTime() != null)
                .map(PlaceModel::getEstimatedVisitTime)
                .max(Comparator.naturalOrder())
                .orElse(null);
        if (last == null) return LocalTime.of(10, 0);
        LocalTime next = last.plus(GAP_BETWEEN_STOPS);
        return next.isBefore(last) || next.isAfter(LAST_ADDED_TIME) ? LAST_ADDED_TIME : next;
    }

    private ItineraryModel ownedItinerary(Long itineraryId, Long userId) {
        ItineraryModel itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Roteiro", itineraryId));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("Este roteiro pertence a outro usuário.");
        }
        return itinerary;
    }

    private PlaceModel placeAt(ItineraryModel itinerary, Integer orderIndex) {
        return itinerary.getPlaces().stream()
                .filter(p -> p.getOrderIndex().equals(orderIndex))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Local de índice " + orderIndex + " não encontrado no roteiro."));
    }

    private LocalDate visitDate(PlaceModel place) {
        return place.getVisitDate() != null ? place.getVisitDate() : place.getItinerary().getStartDate();
    }

    private List<PlaceModel> byVisitOrder(ItineraryModel itinerary) {
        return itinerary.getPlaces().stream()
                .sorted(Comparator.comparing(this::visitDate)
                        .thenComparing(PlaceModel::getEstimatedVisitTime, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(PlaceModel::getOrderIndex))
                .toList();
    }

    /**
     * Refaz as posicoes 0..n-1 na ordem de visita (dia, depois horario). O banco nao aceita duas
     * paradas com a mesma posicao no roteiro, entao todas passam antes por posicoes livres.
     */
    private ItineraryModel renumber(ItineraryModel itinerary) {
        List<PlaceModel> ordered = byVisitOrder(itinerary);
        int offset = ordered.stream().mapToInt(PlaceModel::getOrderIndex).max().orElse(0) + 1;
        ordered.forEach(p -> p.setOrderIndex(p.getOrderIndex() + offset));
        itineraryRepository.saveAndFlush(itinerary);
        for (int i = 0; i < ordered.size(); i++) ordered.get(i).setOrderIndex(i);
        ItineraryModel saved = itineraryRepository.saveAndFlush(itinerary);
        saved.setPlaces(new ArrayList<>(ordered));
        return saved;
    }

    public void deleteItinerary(Long itineraryId, Long userId) {
        ItineraryModel itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Roteiro", itineraryId));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new ForbiddenOperationException("Este roteiro pertence a outro usuário.");
        }
        itineraryRepository.delete(itinerary);
    }

    /** Roteiros de antes da V17 nao guardam a cidade: vale a do catalogo mais perto da partida. */
    private String cityOf(ItineraryModel model) {
        if (model.getCity() != null) return model.getCity();
        if (model.getOriginLatitude() == null || model.getOriginLongitude() == null) return null;
        return cityCatalog.nearestCity(model.getOriginLatitude(), model.getOriginLongitude()).slug();
    }

    private ItineraryResponseDTO toDTO(ItineraryModel model) {
        ItineraryResponseDTO dto = new ItineraryResponseDTO();
        dto.setId(model.getId());
        dto.setStartDate(model.getStartDate());
        dto.setEndDate(model.getEndDate());
        dto.setActive(model.getActive());
        dto.setOriginLatitude(model.getOriginLatitude());
        dto.setOriginLongitude(model.getOriginLongitude());
        dto.setRating(model.getRating());
        dto.setRatingDescription(model.getRatingDescription());
        dto.setDate(model.getDate());
        dto.setName(model.getName());
        dto.setCity(cityOf(model));
        dto.setPlaces(
                model.getPlaces().stream()
                        .map(this::toPlaceDTO)
                        .collect(Collectors.toList())
        );
        return dto;
    }

    private PlaceResponseDTO toPlaceDTO(PlaceModel model) {
        PlaceResponseDTO dto = new PlaceResponseDTO();
        dto.setXid(model.getXid());
        dto.setName(model.getName());
        dto.setAddress(model.getAddress());
        dto.setLatitude(model.getLatitude());
        dto.setLongitude(model.getLongitude());
        dto.setEstimatedVisitTime(model.getEstimatedVisitTime());
        dto.setOrderIndex(model.getOrderIndex());
        dto.setOpeningHours(model.getOpeningHours());
        dto.setCategory(model.getCategory());
        dto.setFee(model.getFee());
        dto.setNote(model.getNote());
        dto.setVisitDate(model.getVisitDate());
        dto.setOpenAtVisit(openAtVisit(model));
        dto.setBookingUrl(BookingLinks.forPlace(model.getName()));
        Optional<CatalogPlace> catalogPlace = model.getLatitude() == null || model.getLongitude() == null
                ? Optional.empty()
                : cityCatalog.findByName(model.getName(), model.getLatitude(), model.getLongitude());
        catalogPlace.ifPresent(cp -> {
            dto.setNames(cp.names());
            dto.setWikidata(cp.wikidata().isBlank() ? null : cp.wikidata());
        });
        if (dto.getBookingUrl() == null && "yes".equals(model.getFee())) {
            dto.setTicketUrl(catalogPlace.map(CatalogPlace::website).filter(w -> !w.isBlank()).orElse(null));
        }
        return dto;
    }

    private Boolean openAtVisit(PlaceModel model) {
        if (model.getEstimatedVisitTime() == null) return null;
        LocalDate date = model.getVisitDate() != null ? model.getVisitDate() : model.getItinerary().getStartDate();
        if (date == null) return null;
        Status status = OpeningHours.statusAt(model.getOpeningHours(), date, model.getEstimatedVisitTime(), VISIT_LENGTH);
        return status == Status.UNKNOWN ? null : status == Status.OPEN;
    }
}
