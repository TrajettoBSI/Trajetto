package com.trajetto.backend.routing.dto;

import java.util.List;

/**
 * Opcoes para ir de um ponto a outro: a pe, de carro/app de transporte e de transporte publico,
 * com a recomendada marcada. Distancias em metros, duracoes em segundos.
 */
public record DirectionsResponseDTO(
        Option walking,
        Option driving,
        Option transit,
        Mode recommended
) {

    public enum Mode { WALK, CAR, TRANSIT }

    /**
     * @param estimated {@code true} quando o tempo e uma estimativa do proprio app (transporte publico,
     *                  ou o servico de rotas fora do ar), e nao um trajeto calculado rua a rua.
     * @param geometry  trajeto no formato polyline do Google, ou {@code null} quando estimado.
     */
    public record Option(Mode mode, double distance, double duration, boolean estimated,
                         String geometry, List<Step> steps) {}

    public record Step(String instruction, double distance, double duration) {}
}
