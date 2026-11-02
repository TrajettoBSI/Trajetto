package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Avaliação do roteiro; nota nula remove a avaliação")
public class RatingRequestDTO {

    // Nulo é permitido: representa a remoção da avaliação feita pelo usuário.
    @Schema(description = "Nota de 1 a 5", example = "5", nullable = true)
    @Min(value = 1, message = "A nota deve estar entre 1 e 5")
    @Max(value = 5, message = "A nota deve estar entre 1 e 5")
    private Integer rating;

    @Schema(description = "Comentário de até 500 caracteres", example = "Roteiro bem distribuído, deu tempo de ver tudo com calma.", nullable = true)
    @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres")
    private String ratingDescription;
}
