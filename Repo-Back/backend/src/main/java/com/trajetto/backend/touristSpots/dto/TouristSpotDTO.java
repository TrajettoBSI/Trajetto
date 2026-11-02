package com.trajetto.backend.touristSpots.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Ponto turístico encontrado no OpenStreetMap")
public record TouristSpotDTO(
        @Schema(description = "Identificador do local", example = "osm_jardim_bot_nico_de_curitiba")
        String xid,
        @Schema(description = "Nome", example = "Jardim Botânico de Curitiba")
        String name,
        @Schema(description = "Categorias do OpenStreetMap, separadas por vírgula", example = "park")
        String kinds,
        @Schema(description = "Coordenada")
        Point point
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    @Schema(description = "Coordenada do ponto")
    public record Point(
            @Schema(description = "Latitude", example = "-25.441763")
            double lat,
            @Schema(description = "Longitude", example = "-49.2387389")
            double lon) {}
}