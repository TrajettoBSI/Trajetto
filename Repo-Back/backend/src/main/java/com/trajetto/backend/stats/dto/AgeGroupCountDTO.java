package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Uma faixa etaria do painel, no formato que o aplicativo espera. */
@Schema(description = "Usuários de uma faixa etária")
public record AgeGroupCountDTO(@Schema(description = "Faixa etária", example = "25-34") String group, @Schema(description = "Quantidade de usuários", example = "14") long count) {}
