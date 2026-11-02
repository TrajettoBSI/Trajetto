package com.trajetto.backend.routing.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import io.swagger.v3.oas.annotations.tags.Tag;


import com.trajetto.backend.routing.dto.DirectionsRequestDTO;
import com.trajetto.backend.routing.dto.DirectionsResponseDTO;
import com.trajetto.backend.routing.dto.RouteRequestDTO;
import com.trajetto.backend.routing.service.DirectionsService;
import com.trajetto.backend.routing.service.RouteService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Rotas")
@RestController
@RequestMapping("/route")
public class RouteController {

    private final RouteService routeService;
    private final DirectionsService directionsService;

    public RouteController(RouteService routeService, DirectionsService directionsService) {
        this.routeService = routeService;
        this.directionsService = directionsService;
    }

    @Operation(summary = "Rota a pé pelas paradas do roteiro",
            description = "Calcula no OpenRouteService o trajeto a pé da origem ao destino passando pelos waypoints, e devolve o GeoJSON que o mapa desenha.")
    @ApiResponse(responseCode = "200", description = "GeoJSON do OpenRouteService (FeatureCollection)")
    @ApiResponse(responseCode = "502", description = "OpenRouteService indisponível")
    @SecurityRequirements
    @PostMapping
    public ResponseEntity<?> getRoute(@Valid @RequestBody RouteRequestDTO request) {
        return ResponseEntity.ok(routeService.getRoute(request));
    }

    @Operation(summary = "Como ir de um ponto a outro",
            description = "Opções a pé, de carro e de transporte público, com a recomendada marcada. Se o serviço de rotas estiver fora do ar, os tempos voltam estimados (estimated = true).")
    @ApiResponse(responseCode = "200", description = "Opções de trajeto")
    @PostMapping("/directions")
    public DirectionsResponseDTO getDirections(@Valid @RequestBody DirectionsRequestDTO request) {
        return directionsService.directions(request);
    }
}
