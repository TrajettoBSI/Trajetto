package com.trajetto.backend.itinerary.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NoteRequestDTO {

    @Size(max = 1000, message = "A anotação deve ter no máximo 1000 caracteres")
    private String note;
}
