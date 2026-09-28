package com.trajetto.backend.itinerary.dto;

import java.util.List;

/**
 * Ponto do catalogo como o mapa o recebe.
 *
 * <p>Os campos sao os mesmos que {@code GET /places} ja devolvia -- inclusive
 * texto vazio, e nao {@code null}, para informacao que o ponto nao tem --, entao
 * o aplicativo nao precisa mudar. O unico acrescimo e {@code distanceMeters},
 * calculado pelo banco quando a busca informa um ponto de referencia.</p>
 */
public record TouristSpotResponseDTO(
        String name,
        String address,
        double latitude,
        double longitude,
        List<String> profiles,
        String openingHours,
        String category,
        String fee,
        String phone,
        String website,
        String wikidata,
        String wikipedia,
        String wheelchair,
        Double distanceMeters
) {}
