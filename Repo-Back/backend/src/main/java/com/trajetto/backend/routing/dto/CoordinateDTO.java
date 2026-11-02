package com.trajetto.backend.routing.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

@Schema(description = "Coordenada geográfica (WGS 84)")
public class CoordinateDTO {

    @Schema(description = "Latitude", example = "41.890335502205886")
    @DecimalMin(value = "-90.0", message = "A latitude deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude deve estar entre -90 e 90")
    public double lat;

    @Schema(description = "Longitude", example = "12.49238329485295")
    @DecimalMin(value = "-180.0", message = "A longitude deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude deve estar entre -180 e 180")
    public double lng;
}
