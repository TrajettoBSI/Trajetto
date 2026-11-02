package com.trajetto.backend.touristSpots.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

import io.swagger.v3.oas.annotations.Parameter;

import io.swagger.v3.oas.annotations.Operation;


import com.trajetto.backend.touristSpots.dto.TouristSpotDTO;
import com.trajetto.backend.touristSpots.service.OverpassService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Pontos turísticos (Overpass)")
@SecurityRequirements
@Validated
@RestController
@RequestMapping("/api/tourist-spots")
public class TouristSpotController {

    private final OverpassService overpassService;

    public TouristSpotController(OverpassService overpassService) {
        this.overpassService = overpassService;
    }

    @Operation(summary = "Busca pontos turísticos de uma cidade no OpenStreetMap",
            description = "Consulta a API Overpass em tempo real, fora do catálogo. Exemplo: GET /api/tourist-spots?city=Curitiba&radius=10000.")
    @ApiResponse(responseCode = "200", description = "Pontos encontrados")
    @ApiResponse(responseCode = "404", description = "Cidade não encontrada")
    @ApiResponse(responseCode = "502", description = "Overpass indisponível")
    @GetMapping
    public ResponseEntity<List<TouristSpotDTO>> getByCity(
            @Parameter(description = "Nome da cidade", example = "Curitiba") @RequestParam @NotBlank(message = "A cidade é obrigatória") String city,
            @Parameter(description = "Raio em metros, de 100 a 50000", example = "10000") @RequestParam(defaultValue = "10000")
            @Min(value = 100, message = "O raio deve estar entre 100 e 50000 metros")
            @Max(value = 50000, message = "O raio deve estar entre 100 e 50000 metros") int radius
    ) {
        return ResponseEntity.ok(overpassService.searchByCity(city, radius));
    }
}
