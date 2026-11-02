package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Cartoes do topo do painel de roteiros. */
@Schema(description = "Cartões do topo do painel de roteiros")
public record ItineraryOverviewDTO(
        @Schema(description = "Total de roteiros", example = "64")
        long totalItineraries,
        @Schema(description = "Duração média, em dias", example = "3.4", nullable = true)
        Double avgDurationDays,
        @Schema(description = "Nota média dos roteiros avaliados", example = "4.3", nullable = true)
        Double avgRating,
        @Schema(description = "Roteiros avaliados", example = "29")
        long ratedCount,
        @Schema(description = "Roteiros sem avaliação", example = "35")
        long unratedCount
) {}
