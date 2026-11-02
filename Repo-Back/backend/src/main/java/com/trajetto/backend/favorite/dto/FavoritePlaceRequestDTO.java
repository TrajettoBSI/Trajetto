package com.trajetto.backend.favorite.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Local a marcar como favorito")
public class FavoritePlaceRequestDTO {

    @Schema(description = "Nome do local", example = "Jardim Botânico de Curitiba")
    @NotBlank(message = "O nome do local é obrigatório")
    @Size(max = 255, message = "O nome do local deve ter no máximo 255 caracteres")
    private String name;

    @Schema(description = "Endereço", example = "Rua Engenheiro Ostoja Roguski, 350")
    @Size(max = 255, message = "O endereço deve ter no máximo 255 caracteres")
    private String address;

    @Schema(description = "Categoria", example = "park")
    @Size(max = 255, message = "A categoria deve ter no máximo 255 caracteres")
    private String category;

    @Schema(description = "Latitude", example = "-25.441763")
    @NotNull(message = "A latitude do local é obrigatória")
    @DecimalMin(value = "-90.0", message = "A latitude deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude deve estar entre -90 e 90")
    private Double latitude;

    @Schema(description = "Longitude", example = "-49.2387389")
    @NotNull(message = "A longitude do local é obrigatória")
    @DecimalMin(value = "-180.0", message = "A longitude deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude deve estar entre -180 e 180")
    private Double longitude;
}
