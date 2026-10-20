package com.trajetto.backend.routing.service;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiException;
import com.trajetto.backend.routing.dto.CoordinateDTO;
import com.trajetto.backend.routing.dto.RouteRequestDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RouteService {

    /** Rotas guardadas: o mapa pede a mesma rota toda vez que abre o dia. */
    private static final int CACHE_SIZE = 500;

    private final RestTemplate restTemplate;
    private final String apiKey;

    /*
     * A chave gratuita do OpenRouteService aceita cerca de 40 rotas por minuto; sem
     * guardar, quem navega entre os dias do roteiro estoura o limite em segundos.
     */
    private final Map<List<List<Double>>, Map<String, Object>> cache = new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<List<List<Double>>, Map<String, Object>> eldest) {
            return size() > CACHE_SIZE;
        }
    };

    public RouteService(RestTemplateBuilder restTemplateBuilder, @Value("${ors.api.key}") String apiKey) {
        this.restTemplate = restTemplateBuilder.build();
        this.apiKey = apiKey;
    }

    public Map<String, Object> getRoute(RouteRequestDTO request) {
        String url = "https://api.openrouteservice.org/v2/directions/driving-car";

        List<List<Double>> coordinates =  new ArrayList<>();

        coordinates.add(List.of(request.origin.lng, request.origin.lat));

        if (request.waypoints != null) {
            for (CoordinateDTO wp : request.waypoints) {
                coordinates.add(List.of(wp.lng, wp.lat));
            }
        }

        coordinates.add(List.of(request.destination.lng, request.destination.lat));

        synchronized (cache) {
            Map<String, Object> cached = cache.get(coordinates);
            if (cached != null) {
                return cached;
            }
        }

        Map<String, Object> body = new HashMap<>();

        body.put("coordinates", coordinates);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map<String, Object>> response;
        try {
            response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
        } catch (HttpClientErrorException.TooManyRequests e) {
            // Sem a causa: o limite da chave nao e defeito, e o stack trace so polui o log.
            throw new ApiException(ApiErrorCode.EXTERNAL_SERVICE_ERROR,
                    "O serviço de rotas atingiu o limite de consultas; tente de novo em instantes.");
        } catch (RestClientException e) {
            throw new ApiException(ApiErrorCode.EXTERNAL_SERVICE_ERROR,
                    "Não foi possível calcular a rota no momento.", e);
        }

        @SuppressWarnings("unchecked")
        List<Object> routes = response.getBody() != null
                ? (List<Object>) response.getBody().get("routes")
                : null;

        if (routes == null || routes.isEmpty()) {
            throw new ApiException(ApiErrorCode.EXTERNAL_SERVICE_ERROR,
                    "O serviço de rotas não retornou nenhum trajeto para os pontos informados.");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> route = (Map<String, Object>) routes.get(0);
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) route.get("summary");

        Map<String, Object> result = new HashMap<>();
        result.put("geometry", route.get("geometry"));
        result.put("distance", summary.get("distance"));
        result.put("duration", summary.get("duration"));
        // Posicao de cada ponto pedido na geometria: com ela o app separa os trechos
        // entre as paradas de uma rota pedida de uma vez so.
        result.put("wayPoints", route.get("way_points"));

        synchronized (cache) {
            cache.put(coordinates, result);
        }
        return result;
    }
}