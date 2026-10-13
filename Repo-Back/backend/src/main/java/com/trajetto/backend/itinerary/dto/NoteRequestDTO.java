package com.trajetto.backend.itinerary.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NoteRequestDTO {

    // Nulo ou em branco é permitido: representa a remoção da anotação da parada.
    @Size(max = 1000, message = "A anotação deve ter no máximo 1000 caracteres")
    private String note;
}
