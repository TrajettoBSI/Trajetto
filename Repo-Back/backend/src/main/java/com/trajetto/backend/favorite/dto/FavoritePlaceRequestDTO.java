package com.trajetto.backend.favorite.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FavoritePlaceRequestDTO {

    @NotBlank(message = "O nome do local é obrigatório")
    @Size(max = 255, message = "O nome do local deve ter no máximo 255 caracteres")
    private String name;

    @Size(max = 255, message = "O endereço deve ter no máximo 255 caracteres")
    private String address;

    @Size(max = 255, message = "A categoria deve ter no máximo 255 caracteres")
    private String category;

    @NotNull(message = "A latitude do local é obrigatória")
    @DecimalMin(value = "-90.0", message = "A latitude deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude deve estar entre -90 e 90")
    private Double latitude;

    @NotNull(message = "A longitude do local é obrigatória")
    @DecimalMin(value = "-180.0", message = "A longitude deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude deve estar entre -180 e 180")
    private Double longitude;
}
