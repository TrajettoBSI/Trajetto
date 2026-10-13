package com.trajetto.backend.favorite.dto;

import com.trajetto.backend.favorite.model.FavoritePlaceModel;

import java.time.LocalDateTime;

public record FavoritePlaceResponseDTO(
        Long id,
        String xid,
        String name,
        String address,
        String category,
        Double latitude,
        Double longitude,
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
