package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Lugares por categoria; sem categoria entra como "Outros". */
@Schema(description = "Lugares de uma categoria nos roteiros")
public record CategoryCountDTO(@Schema(description = "Categoria do local; sem categoria entra como Outros", example = "attraction") String category, @Schema(description = "Quantidade", example = "38") long count) {}
