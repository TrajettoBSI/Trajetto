package com.trajetto.backend.itinerary.controller;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

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

@Tag(name = "Lugares")
@RestController
@RequestMapping("/places")
@RequiredArgsConstructor
public class PlacesController {

    private final TouristSpotSearchService touristSpotSearchService;
    private final PlaceHighlightService placeHighlightService;
    private final WikimediaImages wikimediaImages;

    @Operation(summary = "Busca pontos do catálogo com os filtros do mapa",
            description = "Todos os filtros são opcionais e se combinam. Para filtrar por distância, envie lat, lng e maxDistance juntos: o recorte é feito pelo banco, com índice espacial, e cada ponto volta com distanceMeters.")
    @ApiResponse(responseCode = "200", description = "Pontos encontrados")
    @GetMapping
    public List<TouristSpotResponseDTO> getAll(
            @Parameter(description = "Trecho do nome do ponto", example = "Colosseo") @RequestParam(required = false) String search,
            @Parameter(description = "Categoria (ver GET /places/categories)", example = "attraction") @RequestParam(required = false) String category,
            @Parameter(description = "Pago (yes) ou gratuito (no)", example = "yes") @RequestParam(required = false) String fee,
            @Parameter(description = "true para trazer só pontos com horário de funcionamento", example = "true") @RequestParam(required = false) Boolean hasHours,
            @Parameter(description = "Perfil de viajante (ver GET /places/profiles)", example = "CULTURAL") @RequestParam(required = false) String profile,
            @Parameter(description = "Latitude do ponto de referência", example = "41.8986") @RequestParam(required = false) Double lat,
            @Parameter(description = "Longitude do ponto de referência", example = "12.4768") @RequestParam(required = false) Double lng,
            @Parameter(description = "Distância máxima até o ponto de referência, em metros", example = "1500") @RequestParam(required = false) Double maxDistance
    ) {
        return touristSpotSearchService.search(search, category, fee, hasHours, profile, lat, lng, maxDistance);
    }

    @Operation(summary = "Pontos mais próximos de uma posição",
            description = "Pontos do catálogo dentro do raio, ordenados do mais perto para o mais longe. Usado no mapa para sugerir o que há por perto.")
    @ApiResponse(responseCode = "200", description = "Pontos próximos")
    @GetMapping("/nearby")
    public List<TouristSpotResponseDTO> getNearby(
            @Parameter(description = "Latitude da posição de referência (WGS 84)", example = "41.8986") @RequestParam double lat,
            @Parameter(description = "Longitude da posição de referência (WGS 84)", example = "12.4768") @RequestParam double lng,
            @Parameter(description = "Raio da busca, em metros", example = "1000") @RequestParam(defaultValue = "1000") double radius,
            @Parameter(description = "Quantidade máxima de pontos", example = "20") @RequestParam(defaultValue = "20") int limit,
            @Parameter(description = "Categoria", example = "restaurant") @RequestParam(required = false) String category,
            @Parameter(description = "Perfil de viajante", example = "SOCIAL") @RequestParam(required = false) String profile
    ) {
        return touristSpotSearchService.nearby(lat, lng, radius, limit, category, profile);
    }

    @Operation(summary = "Lugares em destaque da tela inicial",
            description = "Pontos populares no catálogo e bem avaliados pelos usuários, no máximo um por cidade, com foto e a avaliação mais recente.")
    @ApiResponse(responseCode = "200", description = "Lugares em destaque")
    @GetMapping("/highlights")
    public List<PlaceHighlightDTO> getHighlights(
            @Parameter(description = "Quantidade de lugares, de 1 a " + PlaceHighlightService.MAX_LIMIT, example = "5")
            @RequestParam(defaultValue = "5") int limit
    ) {
        return placeHighlightService.highlights(limit);
    }

    @Operation(summary = "Foto de um ponto",
            description = "Busca a imagem principal do ponto no Wikimedia Commons pelo id no Wikidata e devolve {\"url\": \"...\"}.")
    @ApiResponse(responseCode = "200", description = "URL da foto")
    @ApiResponse(responseCode = "204", description = "O ponto não tem foto")
    @GetMapping("/image")
    public ResponseEntity<Map<String, String>> getImage(
            @Parameter(description = "Id do ponto no Wikidata", example = "Q10285") @RequestParam String wikidata
    ) {
        return wikimediaImages.imageUrl(wikidata)
                .map(url -> ResponseEntity.ok(Map.of("url", url)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @Operation(summary = "Lista as categorias do catálogo",
            description = "Valores aceitos no filtro category de GET /places e GET /places/nearby.")
    @ApiResponse(responseCode = "200", description = "Categorias, ex.: attraction, museum, park, restaurant")
    @GetMapping("/categories")
    public List<String> getCategories() {
        return touristSpotSearchService.categories();
    }

    @Operation(summary = "Lista os perfis de viajante do catálogo",
            description = "Valores aceitos no filtro profile, ex.: AVENTUREIRO, CULTURAL, NATUREZA, SOCIAL.")
    @ApiResponse(responseCode = "200", description = "Perfis de viajante")
    @GetMapping("/profiles")
    public List<String> getProfiles() {
        return touristSpotSearchService.profiles();
    }
}
