package com.trajetto.backend.routing.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** Um trecho da navegacao: de onde o usuario esta (ou da parada anterior) ate a proxima parada. */
@Schema(description = "Trecho da navegação: de onde o usuário está até a próxima parada")
public class DirectionsRequestDTO {

    @Valid
    @Schema(description = "Ponto de partida (ex.: Coliseu)")
    @NotNull(message = "A origem da rota é obrigatória")
    public CoordinateDTO origin;

    @Valid
    @Schema(description = "Ponto de chegada (ex.: Pantheon)")
    @NotNull(message = "O destino da rota é obrigatório")
    public CoordinateDTO destination;

    /** Idioma das instrucoes de caminho ("pt", "en" ou "es"). */
    @Schema(description = "Idioma das instruções: pt, en ou es", example = "pt")
    @Pattern(regexp = "pt|en|es", message = "O idioma deve ser pt, en ou es")
    public String language = "pt";

    /** Hora local da partida (0-23); de madrugada o app sugere carro/taxi em vez de metro. */
    @Schema(description = "Hora local da partida (0-23); de madrugada sugere carro em vez de metrô", example = "10", nullable = true)
    @Min(value = 0, message = "A hora deve estar entre 0 e 23")
    @Max(value = 23, message = "A hora deve estar entre 0 e 23")
    public Integer hour;
}
