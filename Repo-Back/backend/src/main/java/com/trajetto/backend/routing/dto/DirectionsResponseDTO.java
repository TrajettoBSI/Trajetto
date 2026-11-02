package com.trajetto.backend.routing.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Opcoes para ir de um ponto a outro: a pe, de carro/app de transporte e de transporte publico,
 * com a recomendada marcada. Distancias em metros, duracoes em segundos.
 */
@Schema(description = "Opções para ir de um ponto a outro, com a recomendada marcada. Distâncias em metros, durações em segundos.")
public record DirectionsResponseDTO(
        @Schema(description = "A pé")
        Option walking,
        @Schema(description = "De carro ou app de transporte")
        Option driving,
        @Schema(description = "De transporte público (estimativa)")
        Option transit,
        @Schema(description = "Modo recomendado", example = "WALK")
        Mode recommended
) {

    public enum Mode { WALK, CAR, TRANSIT }

    /**
     * @param estimated {@code true} quando o tempo e uma estimativa do proprio app (transporte publico,
     *                  ou o servico de rotas fora do ar), e nao um trajeto calculado rua a rua.
     * @param geometry  trajeto no formato polyline do Google, ou {@code null} quando estimado.
     */
    @Schema(description = "Uma forma de fazer o trajeto")
    public record Option(
            @Schema(description = "Modo", example = "WALK")
            Mode mode,
            @Schema(description = "Distância em metros", example = "1843.6")
            double distance,
            @Schema(description = "Duração em segundos", example = "1327.4")
            double duration,
            @Schema(description = "true quando o tempo é estimado pelo app, e não calculado rua a rua", example = "false")
            boolean estimated,
            @Schema(description = "Trajeto no formato polyline do Google; nulo quando estimado", example = "o{w~F}ldkAcAzDw@nCi@|AeBdF", nullable = true)
            String geometry,
            @Schema(description = "Instruções passo a passo")
            List<Step> steps) {}

    @Schema(description = "Instrução de um trecho do caminho")
    public record Step(
            @Schema(description = "Instrução", example = "Siga para noroeste na Via dei Fori Imperiali")
            String instruction,
            @Schema(description = "Distância em metros", example = "612.3")
            double distance,
            @Schema(description = "Duração em segundos", example = "440.9")
            double duration) {}
}
