package com.trajetto.backend.routing.controller;


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

@RestController
@RequestMapping("/route")
public class RouteController {

    private final RouteService routeService;
    private final DirectionsService directionsService;

    public RouteController(RouteService routeService, DirectionsService directionsService) {
        this.routeService = routeService;
        this.directionsService = directionsService;
    }

    @PostMapping
    public ResponseEntity<?> getRoute(@Valid @RequestBody RouteRequestDTO request) {
        return ResponseEntity.ok(routeService.getRoute(request));
    }

    @Operation(summary = "Como ir de um ponto a outro: a pe, de carro e de transporte publico, com a opcao recomendada")
    @PostMapping("/directions")
    public DirectionsResponseDTO getDirections(@Valid @RequestBody DirectionsRequestDTO request) {
        return directionsService.directions(request);
    }
}
