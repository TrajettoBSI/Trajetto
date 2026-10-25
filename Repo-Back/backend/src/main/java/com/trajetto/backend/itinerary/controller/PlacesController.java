package com.trajetto.backend.itinerary.controller;

import com.trajetto.backend.itinerary.data.WikimediaImages;
import com.trajetto.backend.itinerary.dto.PlaceHighlightDTO;
import com.trajetto.backend.itinerary.dto.TouristSpotResponseDTO;
import com.trajetto.backend.itinerary.service.PlaceHighlightService;
import com.trajetto.backend.itinerary.service.TouristSpotSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/places")
@RequiredArgsConstructor
public class PlacesController {

    private final TouristSpotSearchService touristSpotSearchService;
    private final PlaceHighlightService placeHighlightService;
    private final WikimediaImages wikimediaImages;

    @Operation(summary = "Pontos do catalogo com os filtros do mapa; a distancia e filtrada pelo banco (indice espacial)")
    @GetMapping
    public List<TouristSpotResponseDTO> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String fee,        // "yes" ou "no"
            @RequestParam(required = false) Boolean hasHours,  // true = só com horário
            @RequestParam(required = false) String profile,    // ex: "cultural"
            @RequestParam(required = false) Double lat,        // para distância
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double maxDistance // em metros
    ) {
        return touristSpotSearchService.search(search, category, fee, hasHours, profile, lat, lng, maxDistance);
    }

    @Operation(summary = "Pontos do catalogo mais proximos de uma posicao, do mais perto para o mais longe")
    @GetMapping("/nearby")
    public List<TouristSpotResponseDTO> getNearby(
            @Parameter(description = "Latitude da posicao de referencia (WGS 84)") @RequestParam double lat,
            @Parameter(description = "Longitude da posicao de referencia (WGS 84)") @RequestParam double lng,
            @Parameter(description = "Raio da busca, em metros") @RequestParam(defaultValue = "1000") double radius,
            @Parameter(description = "Quantidade maxima de pontos") @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String profile
    ) {
        return touristSpotSearchService.nearby(lat, lng, radius, limit, category, profile);
    }

    @Operation(summary = "Lugares em destaque: populares no catalogo e bem avaliados, no maximo um por cidade")
    @GetMapping("/highlights")
    public List<PlaceHighlightDTO> getHighlights(
            @Parameter(description = "Quantidade de lugares, de 1 a " + PlaceHighlightService.MAX_LIMIT)
            @RequestParam(defaultValue = "5") int limit
    ) {
        return placeHighlightService.highlights(limit);
    }

    @Operation(summary = "Foto do ponto no Wikimedia Commons, pelo id dele no Wikidata; 204 quando nao ha foto")
    @GetMapping("/image")
    public ResponseEntity<Map<String, String>> getImage(
            @Parameter(description = "Id do ponto no Wikidata, como Q10285") @RequestParam String wikidata
    ) {
        return wikimediaImages.imageUrl(wikidata)
                .map(url -> ResponseEntity.ok(Map.of("url", url)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return touristSpotSearchService.categories();
    }

    @GetMapping("/profiles")
    public List<String> getProfiles() {
        return touristSpotSearchService.profiles();
    }
}
