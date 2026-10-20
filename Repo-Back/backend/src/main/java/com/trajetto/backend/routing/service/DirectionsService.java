package com.trajetto.backend.routing.service;

import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.routing.dto.CoordinateDTO;
import com.trajetto.backend.routing.dto.DirectionsRequestDTO;
import com.trajetto.backend.routing.dto.DirectionsResponseDTO;
import com.trajetto.backend.routing.dto.DirectionsResponseDTO.Mode;
import com.trajetto.backend.routing.dto.DirectionsResponseDTO.Option;
import com.trajetto.backend.routing.dto.DirectionsResponseDTO.Step;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Calcula como ir de uma parada a outra.
 * <p>
 * A pe e de carro o trajeto vem do OpenRouteService, rua a rua e com as instrucoes de cada
 * curva. Transporte publico o ORS nao calcula, entao o tempo e uma estimativa: deslocamento a
 * cerca de 18 km/h (media de metro/onibus com as paradas) mais 10 minutos de caminhada ate a
 * estacao e espera. Se o ORS estiver fora do ar, a pe e de carro tambem viram estimativa pela
 * distancia em linha reta, para a navegacao nao parar no meio do passeio.
 */
@Service
public class DirectionsService {

    private static final Logger logger = LogManager.getLogger(DirectionsService.class);
    private static final String ORS_URL = "https://api.openrouteservice.org/v2/directions/";

    static final double WALK_SPEED = 4.8 / 3.6;
    static final double CAR_SPEED = 25 / 3.6;
    static final double TRANSIT_SPEED = 18 / 3.6;
    static final double TRANSIT_OVERHEAD = 10 * 60;
    static final double WALK_DETOUR = 1.3;
    static final double CAR_DETOUR = 1.4;

    /** Ate 20 minutos a pe, caminhar e a melhor opcao; abaixo de 1 km nem se oferece transporte publico. */
    static final double WALK_LIMIT = 20 * 60;
    static final double TRANSIT_MIN_DISTANCE = 1000;
    /** Acima disso, mesmo de dia, compensa carro/app de transporte. */
    static final double CAR_MIN_DISTANCE = 8000;

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final CityCatalog cityCatalog;

    public DirectionsService(RestTemplateBuilder restTemplateBuilder, @Value("${ors.api.key}") String apiKey,
                             CityCatalog cityCatalog) {
        this.restTemplate = restTemplateBuilder.build();
        this.apiKey = apiKey;
        this.cityCatalog = cityCatalog;
    }

    public DirectionsResponseDTO directions(DirectionsRequestDTO req) {
        String language = req.language == null ? "pt" : req.language;
        double straight = haversineMeters(req.origin, req.destination);

        Option walking = route("foot-walking", Mode.WALK, req, language, straight * WALK_DETOUR, WALK_SPEED, 0);
        Option driving = route("driving-car", Mode.CAR, req, language, straight * CAR_DETOUR, CAR_SPEED, 120);
        Option transit = straight < TRANSIT_MIN_DISTANCE ? null
                : new Option(Mode.TRANSIT, driving.distance(),
                        TRANSIT_OVERHEAD + driving.distance() / TRANSIT_SPEED, true, null, List.of());

        int hour = req.hour != null ? req.hour
                : LocalTime.now(cityCatalog.nearestCity(req.origin.lat, req.origin.lng).zone()).getHour();
        return new DirectionsResponseDTO(walking, driving, transit, recommend(walking, driving, transit, hour));
    }

    static Mode recommend(Option walking, Option driving, Option transit, int hour) {
        if (walking.duration() <= WALK_LIMIT || transit == null) return Mode.WALK;
        boolean lateNight = hour >= 23 || hour < 6;
        if (lateNight || driving.distance() > CAR_MIN_DISTANCE) return Mode.CAR;
        return Mode.TRANSIT;
    }

    private Option route(String profile, Mode mode, DirectionsRequestDTO req, String language,
                         double fallbackDistance, double fallbackSpeed, double fallbackExtra) {
        try {
            Map<String, Object> body = Map.of(
                    "coordinates", List.of(
                            List.of(req.origin.lng, req.origin.lat),
                            List.of(req.destination.lng, req.destination.lat)),
                    "instructions", true,
                    "language", language);
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> response = restTemplate.exchange(ORS_URL + profile, HttpMethod.POST,
                    new HttpEntity<>(body, headers), new ParameterizedTypeReference<Map<String, Object>>() {}).getBody();
            return parse(mode, response);
        } catch (RestClientException | ClassCastException | NullPointerException | IndexOutOfBoundsException e) {
            logger.warn("Rota {} indisponível no OpenRouteService; usando estimativa", profile, e);
            return new Option(mode, fallbackDistance, fallbackExtra + fallbackDistance / fallbackSpeed, true, null, List.of());
        }
    }

    @SuppressWarnings("unchecked")
    private static Option parse(Mode mode, Map<String, Object> response) {
        Map<String, Object> route = ((List<Map<String, Object>>) response.get("routes")).get(0);
        Map<String, Object> summary = (Map<String, Object>) route.get("summary");
        List<Step> steps = new ArrayList<>();
        for (Map<String, Object> segment : (List<Map<String, Object>>) route.getOrDefault("segments", List.of())) {
            for (Map<String, Object> step : (List<Map<String, Object>>) segment.getOrDefault("steps", List.of())) {
                steps.add(new Step(String.valueOf(step.get("instruction")), number(step.get("distance")), number(step.get("duration"))));
            }
        }
        return new Option(mode, number(summary.get("distance")), number(summary.get("duration")), false,
                (String) route.get("geometry"), steps);
    }

    private static double number(Object value) {
        return value instanceof Number n ? n.doubleValue() : 0;
    }

    static double haversineMeters(CoordinateDTO a, CoordinateDTO b) {
        double dLat = Math.toRadians(b.lat - a.lat);
        double dLng = Math.toRadians(b.lng - a.lng);
        double h = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(a.lat)) * Math.cos(Math.toRadians(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 6_371_000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    }
}
