package com.trajetto.backend.favorite.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.trajetto.backend.favorite.model.FavoritePlaceModel;

import java.time.LocalDateTime;

@Schema(description = "Local favorito do usuário")
public record FavoritePlaceResponseDTO(
        @Schema(description = "Identificador do favorito", example = "7")
        Long id,
        @Schema(description = "Identificador do local, gerado a partir do nome", example = "osm_jardim_bot_nico_de_curitiba")
        String xid,
        @Schema(description = "Nome do local", example = "Jardim Botânico de Curitiba")
        String name,
        @Schema(description = "Endereço", example = "Rua Engenheiro Ostoja Roguski, 350")
        String address,
        @Schema(description = "Categoria", example = "park")
        String category,
        @Schema(description = "Latitude", example = "-25.441763")
        Double latitude,
        @Schema(description = "Longitude", example = "-49.2387389")
        Double longitude,
        @Schema(description = "Quando foi marcado", example = "2026-10-28T19:42:10")
        LocalDateTime createdAt
) {
    public static FavoritePlaceResponseDTO from(FavoritePlaceModel model) {
        return new FavoritePlaceResponseDTO(
                model.getId(),
                model.getXid(),
                model.getName(),
                model.getAddress(),
                model.getCategory(),
                model.getLatitude(),
                model.getLongitude(),
                model.getCreatedAt()
        );
    }
}
