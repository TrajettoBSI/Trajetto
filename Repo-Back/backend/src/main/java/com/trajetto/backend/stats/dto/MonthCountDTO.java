package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Roteiros criados por mes, ja no rotulo pt-BR usado pelo grafico. */
@Schema(description = "Roteiros criados num mês")
public record MonthCountDTO(@Schema(description = "Mês, no rótulo do gráfico", example = "Out/26") String month, @Schema(description = "Roteiros criados", example = "17") long count) {}
