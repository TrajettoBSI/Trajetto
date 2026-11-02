package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

/** Lugar que o usuario inclui por conta propria num dia do roteiro (ex.: vindo dos favoritos). */
@Data
@Schema(description = "Lugar incluído pelo usuário num dia do roteiro")
public class AddPlaceRequestDTO {

    @Schema(description = "Identificador do lugar no catálogo, quando vier de lá", example = "osm_pantheon")
    private String xid;

    @Schema(description = "Nome do lugar", example = "Pantheon")
    @NotBlank(message = "O nome do local é obrigatório")
    private String name;

    @Schema(description = "Endereço", example = "Piazza della Rotonda, Roma")
    private String address;

    @Schema(description = "Latitude", example = "41.89865224324324")
    @NotNull(message = "A latitude do local é obrigatória")
    @DecimalMin(value = "-90.0", message = "A latitude deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude deve estar entre -90 e 90")
    private Double latitude;

    @Schema(description = "Longitude", example = "12.476784108108108")
    @NotNull(message = "A longitude do local é obrigatória")
    @DecimalMin(value = "-180.0", message = "A longitude deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude deve estar entre -180 e 180")
    private Double longitude;

    @Schema(description = "Categoria do lugar", example = "attraction")
    private String category;

    /** Dia da visita; sem ele, o primeiro dia do roteiro. */
    @Schema(description = "Dia da visita; sem ele, o primeiro dia do roteiro", example = "2026-11-21")
    private LocalDate visitDate;

    /** Horario da visita (HH:mm); sem ele, 1h30 depois da ultima parada do dia. */
    @Schema(description = "Horário da visita (HH:mm); sem ele, 1h30 depois da última parada do dia", example = "15:30")
    @Pattern(regexp = "([01]\\d|2[0-3]):[0-5]\\d", message = "O horário deve estar no formato HH:mm")
    private String estimatedVisitTime;
}
