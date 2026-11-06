package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Pedido em texto livre para ajustar o roteiro")
public class AdjustItineraryRequestDTO {

    public static final int MAX_LENGTH = 500;

    @Schema(description = "O que o viajante quer mudar, com as próprias palavras",
            example = "Menos igrejas, mais comida de rua e quero ver o Coliseu")
    @NotBlank(message = "Escreva o que você quer mudar no roteiro")
    @Size(max = MAX_LENGTH, message = "O pedido pode ter no máximo " + MAX_LENGTH + " caracteres")
    private String request;

    @Schema(description = "Idioma do app, o da resposta do assistente; sem ele, português", example = "pt-BR", nullable = true)
    @Size(max = 10, message = "Idioma inválido")
    private String language;
}
