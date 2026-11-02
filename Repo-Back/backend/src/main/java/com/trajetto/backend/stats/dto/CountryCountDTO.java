package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Usuarios por pais, ja contados e ordenados pelo banco. */
@Schema(description = "Usuários de um país")
public record CountryCountDTO(@Schema(description = "País", example = "Brasil") String country, @Schema(description = "Quantidade de usuários", example = "21") long count) {}
