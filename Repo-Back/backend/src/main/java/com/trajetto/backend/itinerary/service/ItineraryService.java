package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.itinerary.data.BookingLinks;
import com.trajetto.backend.itinerary.data.PlaceXid;
import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.itinerary.ai.AssistantReply;
import com.trajetto.backend.itinerary.ai.PreferenceInterpreter;
import com.trajetto.backend.itinerary.dto.AddPlaceRequestDTO;
import com.trajetto.backend.itinerary.dto.AdjustItineraryRequestDTO;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner;
import com.trajetto.backend.itinerary.planning.RouteOptimizer;
import com.trajetto.backend.itinerary.planning.TripPreferences;
import com.trajetto.backend.weather.DayWeather;
import com.trajetto.backend.weather.WeatherService;
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
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ItineraryService {

    /** Os mais famosos entram para qualquer perfil (ver {@link ItineraryPlanner#MUST_SEE}). */
    static final int MUST_SEE = ItineraryPlanner.MUST_SEE;

    /** Tempo de visita que o roteiro reserva em cada parada; o lugar precisa estar aberto o tempo todo. */
    static final Duration VISIT_LENGTH = ItineraryPlanner.VISIT_LENGTH;

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

    @Autowired
    private ItineraryPlanner planner;

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private PreferenceInterpreter preferenceInterpreter;

    @Autowired
    private ObjectMapper objectMapper;

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

        // A cidade escolhida no app; sem escolha, a do catalogo mais perto do ponto de partida.
        CityCatalog.City city = req.getCity() == null || req.getCity().isBlank()
                ? cityCatalog.nearestCity(req.getStartLatitude(), req.getStartLongitude())
                : cityCatalog.city(req.getCity())
                        .orElseThrow(() -> new InvalidRequestException("Cidade não atendida: " + req.getCity()));

        int days = req.getDays() == null ? 1 : req.getDays();
        TripPreferences prefs = preferenceInterpreter.interpret(req.getRequest(), cityCatalog.placesOf(city), req.getLanguage());
        LocalDate startDate = req.getStartDate() == null ? LocalDate.now() : req.getStartDate();
        TravelPace pace = effectivePace(req.getPace(), prefs);
        ItineraryPlanner.Plan plan = plan(user, city, req.getStartLatitude(), req.getStartLongitude(), startDate, days, pace, prefs, Set.of());
        ItineraryModel itinerary = saveItinerary(user, city, req.getStartLatitude(), req.getStartLongitude(),
                startDate, days, pace, ItineraryNames.normalize(req.getName()), prefs, Map.of(), plan);

        ItineraryResponseDTO dto = toDTO(itinerary);
        if (req.getRequest() != null && !req.getRequest().isBlank()) {
            dto.setAssistantSummary(AssistantReply.forGenerated(replyContext(req.getRequest(), prefs, req.getLanguage(), city), dto));
        }
        return dto;
    }

    /**
     * Refaz o roteiro a partir de um pedido em texto livre ("menos igrejas, mais comida de rua").
     * O pedido se soma aos anteriores e o roteiro e gerado de novo, na mesma cidade, datas e
     * ponto de partida. A versao anterior fica no historico; as anotacoes das paradas que
     * continuam no roteiro sao levadas para a nova versao. Pedido que nao rendeu ajuste e
     * ajuste que nao mudou nada nao criam versao nova.
     */
    @Transactional
    public ItineraryResponseDTO adjustItinerary(Long itineraryId, Long userId, AdjustItineraryRequestDTO req) {
        ItineraryModel current = ownedItinerary(itineraryId, userId);
        if (current.getOriginLatitude() == null || current.getOriginLongitude() == null) {
            throw new InvalidRequestException("Este roteiro não tem ponto de partida; gere um roteiro novo.");
        }
        String slug = cityOf(current);
        CityCatalog.City city = cityCatalog.city(slug)
                .orElseThrow(() -> new InvalidRequestException("Cidade não atendida: " + slug));

        LocalDate start = current.getStartDate() == null ? LocalDate.now() : current.getStartDate();
        LocalDate end = current.getEndDate() == null ? start : current.getEndDate();
        int days = (int) Math.min(GenerateItineraryRequestDTO.MAX_DAYS, Math.max(1, ChronoUnit.DAYS.between(start, end) + 1));

        TripPreferences requested = preferenceInterpreter.interpret(req.getRequest(), cityCatalog.placesOf(city), req.getLanguage());
        AssistantReply.Context reply = replyContext(req.getRequest(), requested, req.getLanguage(), city);
        ItineraryResponseDTO before = toDTO(current);
        if (requested.isEmpty()) {
            before.setAssistantSummary(AssistantReply.withoutChanges(reply));
            return before;
        }
        TripPreferences merged = readPreferences(current).then(requested);
        TravelPace pace = effectivePace(parsePace(current.getPace()), merged);

        Map<String, String> notes = current.getPlaces().stream()
                .filter(p -> p.getNote() != null && p.getXid() != null)
                .collect(Collectors.toMap(PlaceModel::getXid, PlaceModel::getNote, (a, b) -> a));

        Set<String> keep = current.getPlaces().stream().map(PlaceModel::getXid)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        ItineraryPlanner.Plan plan = plan(current.getUser(), city, current.getOriginLatitude(), current.getOriginLongitude(),
                start, days, pace, merged, keep);

        if (sameSchedule(current, plan)) {
            current.setPreferences(merged.isEmpty() ? null : writePreferences(merged));
            current.setPace(pace.name());
            ItineraryResponseDTO kept = toDTO(itineraryRepository.save(current));
            kept.setAssistantSummary(AssistantReply.forAdjusted(reply, before, kept));
            return kept;
        }
        ItineraryModel itinerary = saveItinerary(current.getUser(), city, current.getOriginLatitude(),
                current.getOriginLongitude(), start, days, pace, current.getName(), merged, notes, plan);

        ItineraryResponseDTO dto = toDTO(itinerary);
        dto.setAssistantSummary(AssistantReply.forAdjusted(reply, before, dto));
        return dto;
    }

    private AssistantReply.Context replyContext(String request, TripPreferences requested, String language, CityCatalog.City city) {
        List<CatalogPlace> catalog = cityCatalog.placesOf(city);
        return new AssistantReply.Context(request, requested, language, catalog, name -> catalog.stream()
                .filter(place -> place.name().equals(name))
                .flatMap(place -> cityCatalog.sameVisit(place).stream())
                .map(CatalogPlace::name)
                .collect(Collectors.toSet()));
    }

    /** Mesmos lugares, nos mesmos dias e horarios. */
    private boolean sameSchedule(ItineraryModel current, ItineraryPlanner.Plan plan) {
        Set<String> now = current.getPlaces().stream()
                .map(p -> p.getXid() + "|" + visitDate(p) + "|" + p.getEstimatedVisitTime())
                .collect(Collectors.toSet());
        Set<String> planned = plan.stops().stream()
                .map(s -> PlaceXid.of(s.place().name()) + "|" + s.date() + "|" + s.time())
                .collect(Collectors.toSet());
        return now.equals(planned);
    }

    /** O ritmo pedido em texto livre vale mais que o escolhido no formulario. */
    private static TravelPace effectivePace(TravelPace pace, TripPreferences prefs) {
        return prefs.pace().isEmpty() ? (pace == null ? TravelPace.INTENSO : pace) : TravelPace.valueOf(prefs.pace());
    }

    private ItineraryPlanner.Plan plan(UserModel user, CityCatalog.City city, double startLat, double startLng,
                                       LocalDate startDate, int days, TravelPace pace, TripPreferences prefs, Set<String> keep) {
        Map<LocalDate, DayWeather> weather = weatherService.forecast(city.latitude(), city.longitude(),
                startDate, startDate.plusDays(days - 1L));
        return planner.plan(new ItineraryPlanner.Request(city, user.getTravelerProfile(), startLat, startLng,
                startDate, days, pace, prefs, weather, true, keep), random);
    }

    /** Grava o roteiro planejado, que passa a ser o ativo. */
    private ItineraryModel saveItinerary(UserModel user, CityCatalog.City city, double startLat, double startLng,
                                         LocalDate startDate, int days, TravelPace pace, String name,
                                         TripPreferences prefs, Map<String, String> notesByXid, ItineraryPlanner.Plan plan) {
        deactivateActiveItineraries(user);

        ItineraryModel itinerary = new ItineraryModel();
        itinerary.setStartDate(startDate);
        itinerary.setEndDate(startDate.plusDays(days - 1L));
        itinerary.setActive(true);
        itinerary.setUser(user);
        itinerary.setOriginLatitude(startLat);
        itinerary.setOriginLongitude(startLng);
        itinerary.setCity(city.slug());
        itinerary.setName(name);
        itinerary.setPace(pace.name());
        itinerary.setPreferences(prefs.isEmpty() ? null : writePreferences(prefs));
        itinerary.setBaselineDistanceKm(Math.round(plan.greedyKm() * 100) / 100.0);

        List<PlaceModel> places = new ArrayList<>();
        List<ItineraryPlanner.Stop> stops = plan.stops();
        for (int i = 0; i < stops.size(); i++) {
            CatalogPlace rp = stops.get(i).place();
            PlaceModel p = new PlaceModel();
            p.setXid(PlaceXid.of(rp.name()));
            p.setName(rp.name());
            p.setAddress(rp.address());
            p.setLatitude(rp.latitude());
            p.setLongitude(rp.longitude());
            p.setVisitDate(stops.get(i).date());
            p.setEstimatedVisitTime(stops.get(i).time());
            p.setOrderIndex(i);
            p.setOpeningHours(rp.openingHours().isBlank() ? null : rp.openingHours());
            p.setCategory(rp.category().isBlank() ? null : rp.category());
            p.setFee(rp.fee().isBlank() ? null : rp.fee());
            p.setNote(notesByXid.get(p.getXid()));
            p.setItinerary(itinerary);
            places.add(p);
        }
        itinerary.setPlaces(places);
        return itineraryRepository.save(itinerary);
    }

    private static TravelPace parsePace(String pace) {
        if (pace == null) return null;
        try {
            return TravelPace.valueOf(pace);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private TripPreferences readPreferences(ItineraryModel model) {
        if (model.getPreferences() == null || model.getPreferences().isBlank()) return TripPreferences.NONE;
        try {
            return objectMapper.readValue(model.getPreferences(), TripPreferences.class);
        } catch (JsonProcessingException e) {
            return TripPreferences.NONE;
        }
    }

    private String writePreferences(TripPreferences prefs) {
        try {
            return objectMapper.writeValueAsString(prefs.withSummary(""));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Preferências do roteiro não serializáveis", e);
        }
    }


    private void deactivateActiveItineraries(UserModel user) {
        List<ItineraryModel> ativos = itineraryRepository.findByUserAndActiveTrue(user);
        ativos.forEach(it -> it.setActive(false));
        itineraryRepository.saveAllAndFlush(ativos);
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
        dto.setPace(model.getPace());
        dto.setBaselineDistanceKm(model.getBaselineDistanceKm());
        TripPreferences prefs = readPreferences(model);
        dto.setPreferences(prefs.isEmpty() ? null : prefs);

        Map<PlaceModel, Double> legs = legsKm(model);
        double total = legs.values().stream().mapToDouble(Double::doubleValue).sum();
        dto.setDistanceKm(Math.round(total * 100) / 100.0);
        dto.setPlaces(
                model.getPlaces().stream()
                        .map(place -> {
                            PlaceResponseDTO placeDto = toPlaceDTO(place);
                            Double km = legs.get(place);
                            if (km != null) {
                                placeDto.setDistanceFromPreviousKm(Math.round(km * 100) / 100.0);
                                placeDto.setWalkingMinutesFromPrevious(RouteOptimizer.walkingMinutes(km));
                            }
                            return placeDto;
                        })
                        .collect(Collectors.toList())
        );
        return dto;
    }

    /**
     * Distancia de cada parada ate a anterior do mesmo dia; a primeira do dia conta desde o
     * ponto de partida. A soma e o caminho total do roteiro, comparavel ao da ordem gulosa.
     */
    private Map<PlaceModel, Double> legsKm(ItineraryModel model) {
        Map<PlaceModel, Double> legs = new IdentityHashMap<>();
        if (model.getPlaces() == null) return legs;
        RouteOptimizer.Point origin = model.getOriginLatitude() == null || model.getOriginLongitude() == null
                ? null : new RouteOptimizer.Point(model.getOriginLatitude(), model.getOriginLongitude());
        RouteOptimizer.Point prev = null;
        LocalDate day = null;
        for (PlaceModel place : byVisitOrder(model)) {
            if (place.getLatitude() == null || place.getLongitude() == null) continue;
            LocalDate date = visitDate(place);
            if (!date.equals(day)) {
                day = date;
                prev = origin;
            }
            RouteOptimizer.Point here = new RouteOptimizer.Point(place.getLatitude(), place.getLongitude());
            if (prev != null) legs.put(place, RouteOptimizer.km(prev, here));
            prev = here;
        }
        return legs;
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
