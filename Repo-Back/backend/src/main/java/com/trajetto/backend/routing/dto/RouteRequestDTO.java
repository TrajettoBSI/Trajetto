package com.trajetto.backend.routing.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Schema(description = "Rota a pé passando pelas paradas, para desenhar no mapa")
public class RouteRequestDTO {

    @Valid
    @Schema(description = "Ponto de partida")
    @NotNull(message = "A origem da rota é obrigatória")
    public CoordinateDTO origin;

    @Valid
    @Schema(description = "Ponto de chegada")
    @NotNull(message = "O destino da rota é obrigatório")
    public CoordinateDTO destination;

    @Valid
    @Schema(description = "Paradas intermediárias, na ordem da visita", nullable = true)
    public List<CoordinateDTO> waypoints;
}
