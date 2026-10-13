package com.trajetto.backend.itinerary.dto;

import java.time.LocalTime;
import java.util.List;

public enum TravelPace {
    INTENSO, EQUILIBRADO, METADE_LIVRE, LEVE;

    private static final List<LocalTime> DIA_CHEIO = List.of(
            LocalTime.of(9, 0), LocalTime.of(10, 30), LocalTime.of(12, 0),
            LocalTime.of(14, 0), LocalTime.of(15, 30), LocalTime.of(17, 0),
            LocalTime.of(21, 0));

    private static final List<LocalTime> DIA_MODERADO = List.of(
            LocalTime.of(9, 30), LocalTime.of(11, 30), LocalTime.of(14, 30),
            LocalTime.of(16, 30), LocalTime.of(21, 0));

    private static final List<LocalTime> DIA_LEVE = List.of(
            LocalTime.of(10, 0), LocalTime.of(12, 0), LocalTime.of(15, 30),
            LocalTime.of(21, 0));

    private static final List<LocalTime> DIA_LIVRE = List.of();

    public List<LocalTime> visitTimes(int dayIndex) {
        boolean alternate = dayIndex % 2 == 1;
        return switch (this) {
            case INTENSO -> DIA_CHEIO;
            case EQUILIBRADO -> alternate ? DIA_MODERADO : DIA_CHEIO;
            case METADE_LIVRE -> alternate ? DIA_LIVRE : DIA_CHEIO;
            case LEVE -> DIA_LEVE;
        };
    }
}
