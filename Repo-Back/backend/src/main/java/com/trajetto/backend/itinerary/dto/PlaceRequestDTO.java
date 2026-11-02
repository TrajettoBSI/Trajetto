package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Lugar que substitui uma parada do roteiro")
public class PlaceRequestDTO {

    @Schema(description = "Nome do lugar", example = "Fontana di Trevi")
    @NotBlank(message = "O nome do local é obrigatório")
    private String name;

    @Schema(description = "Endereço", example = "Piazza di Trevi, Roma")
    private String address;

    @Schema(description = "Latitude", example = "41.900894619999995")
    @NotNull(message = "A latitude do local é obrigatória")
    @DecimalMin(value = "-90.0", message = "A latitude deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude deve estar entre -90 e 90")
    private Double latitude;

    @Schema(description = "Longitude", example = "12.483273240000004")
    @NotNull(message = "A longitude do local é obrigatória")
    @DecimalMin(value = "-180.0", message = "A longitude deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude deve estar entre -180 e 180")
    private Double longitude;

    @Schema(description = "Horário da visita (HH:mm)", example = "10:30")
    @Pattern(regexp = "([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?", message = "O horário deve estar no formato HH:mm")
    private String estimatedVisitTime;

    @Schema(description = "Horário de funcionamento no formato do OpenStreetMap", example = "24/7")
    private String openingHours;
    @Schema(description = "Categoria", example = "attraction")
    private String category;
    @Schema(description = "Se é pago: yes ou no", example = "no")
    private String fee;
}
