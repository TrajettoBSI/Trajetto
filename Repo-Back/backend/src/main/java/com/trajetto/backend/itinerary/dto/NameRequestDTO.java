package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Nome do roteiro")
public class NameRequestDTO {

    // Nulo ou em branco remove o nome: o app volta a mostrar o nome generico.
    @Schema(description = "Novo nome, até 80 caracteres; nulo ou em branco volta ao nome genérico", example = "Férias em Curitiba", nullable = true)
    @Size(max = ItineraryNames.MAX_LENGTH, message = "O nome do roteiro pode ter no máximo " + ItineraryNames.MAX_LENGTH + " caracteres")
    private String name;
}
