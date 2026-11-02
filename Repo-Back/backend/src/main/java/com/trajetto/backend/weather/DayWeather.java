package com.trajetto.backend.weather;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.Set;

/**
 * Previsao de um dia na cidade do roteiro, do Open-Meteo.
 *
 * @param weatherCode codigo WMO do tempo mais severo do dia (0 ceu limpo, 61 chuva, 95 trovoada...)
 */
@Schema(description = "Previsão do tempo de um dia do roteiro")
public record DayWeather(
        @Schema(example = "2026-11-20") LocalDate date,
        @Schema(description = "Código WMO do tempo do dia", example = "61") int weatherCode,
        @Schema(description = "Máxima em °C", example = "18.4") double maxTemperature,
        @Schema(description = "Mínima em °C", example = "11.2") double minTemperature,
        @Schema(description = "Chance de chuva, de 0 a 100", example = "80") int precipitationProbability,
        @Schema(description = "Se o dia é de chuva; o roteiro prioriza lugares cobertos", example = "true") boolean rainy
) {

    /** Chuva, garoa forte, neve e trovoada: os codigos em que passear ao ar livre deixa de ser programa. */
    private static final Set<Integer> WET_CODES = Set.of(
            61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99);

    public static DayWeather of(LocalDate date, int weatherCode, double max, double min, int precipitationProbability) {
        boolean rainy = (WET_CODES.contains(weatherCode) && precipitationProbability >= 40)
                || precipitationProbability >= 70;
        return new DayWeather(date, weatherCode, max, min, precipitationProbability, rainy);
    }
}
