package com.trajetto.backend.itinerary.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NameRequestDTO {

    // Nulo ou em branco remove o nome: o app volta a mostrar o nome generico.
    @Size(max = ItineraryNames.MAX_LENGTH, message = "O nome do roteiro pode ter no máximo " + ItineraryNames.MAX_LENGTH + " caracteres")
    private String name;
}
