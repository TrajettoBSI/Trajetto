package com.trajetto.backend.itinerary.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

/** Lugar que o usuario inclui por conta propria num dia do roteiro (ex.: vindo dos favoritos). */
@Data
public class AddPlaceRequestDTO {

    private String xid;

    @NotBlank(message = "O nome do local é obrigatório")
    private String name;

    private String address;

    @NotNull(message = "A latitude do local é obrigatória")
    @DecimalMin(value = "-90.0", message = "A latitude deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude deve estar entre -90 e 90")
    private Double latitude;

    @NotNull(message = "A longitude do local é obrigatória")
    @DecimalMin(value = "-180.0", message = "A longitude deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude deve estar entre -180 e 180")
    private Double longitude;

    private String category;

    /** Dia da visita; sem ele, o primeiro dia do roteiro. */
    private LocalDate visitDate;

    /** Horario da visita (HH:mm); sem ele, 1h30 depois da ultima parada do dia. */
    @Pattern(regexp = "([01]\\d|2[0-3]):[0-5]\\d", message = "O horário deve estar no formato HH:mm")
    private String estimatedVisitTime;
}
