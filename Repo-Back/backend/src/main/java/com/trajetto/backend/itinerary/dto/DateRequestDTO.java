package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Data escolhida para o roteiro; nula remove a data")
public class DateRequestDTO {

    // Nulo é permitido: representa a remoção da data escolhida para o roteiro.
    @Schema(description = "Data no formato AAAA-MM-DD", example = "2026-11-20", nullable = true)
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "A data deve estar no formato AAAA-MM-DD")
    private String date;
}
