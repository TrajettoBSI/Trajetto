package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Lugares melhor avaliados, com media e volume de avaliacoes. */
@Schema(description = "Lugar entre os mais bem avaliados")
public record TopRatedPlaceDTO(@Schema(description = "Nome", example = "Fontana di Trevi") String name, @Schema(description = "Identificador", example = "osm_fontana_di_trevi") String xid, @Schema(description = "Média das notas", example = "4.8") double avgRating, @Schema(description = "Quantidade de avaliações", example = "6") long totalRatings) {}
