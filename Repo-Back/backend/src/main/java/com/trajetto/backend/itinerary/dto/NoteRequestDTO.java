package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Anotação pessoal numa parada")
public class NoteRequestDTO {

    @Schema(description = "Texto de até 1000 caracteres; em branco remove a anotação", example = "Comprar o ingresso combinado com o Fórum Romano e o Palatino.", nullable = true)
    @Size(max = 1000, message = "A anotação deve ter no máximo 1000 caracteres")
    private String note;
}
