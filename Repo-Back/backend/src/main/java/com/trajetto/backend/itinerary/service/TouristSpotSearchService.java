package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.itinerary.dto.TouristSpotResponseDTO;
import com.trajetto.backend.itinerary.repository.TouristSpotRepository;
import com.trajetto.backend.itinerary.repository.TouristSpotRepository.TouristSpotRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Busca no catalogo de pontos turisticos, com a proximidade resolvida pelo banco.
 *
 * <p>Aqui ficam so a validacao dos parametros e a conversao para o formato de
 * resposta; a filtragem inteira e a consulta de {@link TouristSpotRepository}.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TouristSpotSearchService {

    /** Maior raio aceito. O catalogo e de Roma; 50 km ja cobre a cidade inteira com folga. */
    public static final double MAX_RADIUS_METERS = 50_000;
    public static final int DEFAULT_NEARBY_LIMIT = 20;
    public static final int MAX_NEARBY_LIMIT = 100;

    /** A listagem do mapa nao tem paginacao; o teto so existe porque LIMIT pede um numero. */
    private static final int NO_LIMIT = Integer.MAX_VALUE;

    private final TouristSpotRepository repository;

    /**
     * Filtros do mapa ({@code GET /places}). A proximidade so e aplicada quando
     * chegam os tres parametros -- ponto e raio --, como ja era antes.
     */
    public List<TouristSpotResponseDTO> search(String search, String category, String fee, Boolean hasHours,
                                               String profile, Double lat, Double lng, Double maxDistance) {
        boolean near = lat != null && lng != null && maxDistance != null;
        if (near) {
            validatePoint(lat, lng, maxDistance);
        }
        return toResponse(repository.search(
                blankToNull(search), blankToNull(category), blankToNull(fee),
                Boolean.TRUE.equals(hasHours) ? Boolean.TRUE : null,
                blankToNull(profile),
                near ? lat : null, near ? lng : null, near ? maxDistance : null,
                NO_LIMIT));
    }

    /** Pontos dentro do raio, do mais perto para o mais longe ({@code GET /places/nearby}). */
    public List<TouristSpotResponseDTO> nearby(double lat, double lng, double radius, int limit,
                                               String category, String profile) {
        validatePoint(lat, lng, radius);
        if (limit < 1 || limit > MAX_NEARBY_LIMIT) {
            throw new InvalidRequestException("O limite deve ficar entre 1 e " + MAX_NEARBY_LIMIT + ".");
        }
        return toResponse(repository.search(
                null, blankToNull(category), null, null, blankToNull(profile),
                lat, lng, radius, limit));
    }

    public List<String> categories() {
        return repository.findCategories();
    }

    public List<String> profiles() {
        return repository.findProfiles();
    }

    /**
     * O MySQL recusa com erro um ponto fora da faixa do SRID 4326, e um raio
     * negativo ou gigante nao faz sentido para o mapa. Melhor responder 400
     * dizendo o motivo do que deixar a consulta estourar como 500.
     *
     * <p>As comparacoes sao escritas "dentro da faixa" e negadas para que
     * {@code NaN}, que falha em qualquer comparacao, tambem seja recusado.</p>
     */
    private static void validatePoint(double lat, double lng, double radius) {
        if (!(lat >= -90 && lat <= 90)) {
            throw new InvalidRequestException("A latitude deve ficar entre -90 e 90.");
        }
        if (!(lng >= -180 && lng <= 180)) {
            throw new InvalidRequestException("A longitude deve ficar entre -180 e 180.");
        }
        if (!(radius > 0 && radius <= MAX_RADIUS_METERS)) {
            throw new InvalidRequestException(
                    "O raio deve ser maior que zero e de no maximo " + (int) MAX_RADIUS_METERS + " metros.");
        }
    }

    private static List<TouristSpotResponseDTO> toResponse(List<TouristSpotRow> rows) {
        return rows.stream().map(TouristSpotSearchService::toResponse).toList();
    }

    private static TouristSpotResponseDTO toResponse(TouristSpotRow r) {
        List<String> profiles = r.getProfiles() == null
                ? List.of()
                : Arrays.asList(r.getProfiles().split(","));
        return new TouristSpotResponseDTO(
                r.getName(), nullToEmpty(r.getAddress()), r.getLatitude(), r.getLongitude(), profiles,
                nullToEmpty(r.getOpeningHours()), nullToEmpty(r.getCategory()), nullToEmpty(r.getFee()),
                nullToEmpty(r.getPhone()), nullToEmpty(r.getWebsite()), nullToEmpty(r.getWikidata()),
                nullToEmpty(r.getWikipedia()), nullToEmpty(r.getWheelchair()),
                r.getDistanceMeters());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
