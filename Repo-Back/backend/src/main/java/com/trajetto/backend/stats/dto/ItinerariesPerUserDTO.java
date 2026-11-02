package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Quantos roteiros cada cliente criou, contados por um GROUP BY unico. */
@Schema(description = "Roteiros criados por um cliente")
public record ItinerariesPerUserDTO(@Schema(description = "Nome do cliente", example = "Ana Silva") String user, @Schema(description = "E-mail", example = "ana.silva@email.com") String email, @Schema(description = "Roteiros criados", example = "5") long count) {}
