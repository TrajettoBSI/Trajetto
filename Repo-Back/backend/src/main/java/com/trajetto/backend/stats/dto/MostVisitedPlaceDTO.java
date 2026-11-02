package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Lugares que mais aparecem dentro dos roteiros montados. */
@Schema(description = "Lugar que mais aparece em roteiros")
public record MostVisitedPlaceDTO(@Schema(description = "Nome", example = "Pantheon") String name, @Schema(description = "Roteiros em que aparece", example = "23") long count) {}
