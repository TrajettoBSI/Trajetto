package com.trajetto.backend.itinerary.controller;

import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

import com.trajetto.backend.itinerary.data.CityCatalog;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Cidades")
@RestController
@RequestMapping("/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityCatalog cityCatalog;

    @Schema(description = "Cidade atendida pelo catálogo")
    public record CityResponse(
            @Schema(description = "Identificador usado em city nos roteiros", example = "roma") String slug,
            @Schema(description = "Nome", example = "Roma") String name,
            @Schema(description = "País (ISO 3166-1 alfa-2)", example = "IT") String country,
            @Schema(description = "Latitude do centro", example = "41.9028") double latitude,
            @Schema(description = "Longitude do centro", example = "12.4964") double longitude,
            @Schema(description = "Pontos turísticos no catálogo", example = "807") int spots) {}

    @Operation(summary = "Lista as cidades atendidas",
            description = "Cidades do catálogo, com o centro de cada uma e quantos pontos turísticos ela tem. O slug é o valor de city ao gerar um roteiro.")
    @ApiResponse(responseCode = "200", description = "Cidades do catálogo")
    @GetMapping
    public List<CityResponse> getAll() {
        return cityCatalog.getCities().stream()
                .map(c -> new CityResponse(c.slug(), c.name(), c.country(), c.latitude(), c.longitude(),
                        cityCatalog.placesOf(c).size()))
                .toList();
    }
}
