package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Lugares que mais receberam comentario junto da avaliacao. */
@Schema(description = "Lugar com mais comentários")
public record MostCommentedPlaceDTO(@Schema(description = "Nome", example = "Colosseo") String name, @Schema(description = "Identificador", example = "osm_colosseo") String xid, @Schema(description = "Comentários", example = "9") long commentCount) {}
