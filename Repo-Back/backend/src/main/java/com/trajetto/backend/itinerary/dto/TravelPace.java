package com.trajetto.backend.itinerary.dto;

import java.time.LocalTime;
import java.util.List;

public enum TravelPace {
    INTENSO, EQUILIBRADO, LEVE;

    private static final List<LocalTime> DIA_CHEIO = List.of(
            LocalTime.of(9, 0), LocalTime.of(10, 30), LocalTime.of(12, 0),
            LocalTime.of(14, 0), LocalTime.of(15, 30), LocalTime.of(17, 0),
            LocalTime.of(21, 0));

    private static final List<LocalTime> DIA_TARDE_LIVRE = List.of(
            LocalTime.of(9, 0), LocalTime.of(10, 30), LocalTime.of(12, 0),
            LocalTime.of(21, 0));

    private static final List<LocalTime> DIA_MANHA_LIVRE = List.of(
            LocalTime.of(14, 0), LocalTime.of(15, 30), LocalTime.of(17, 0),
            LocalTime.of(21, 0));

    private static final List<LocalTime> DIA_LEVE = List.of(
            LocalTime.of(10, 0), LocalTime.of(12, 0), LocalTime.of(15, 30),
            LocalTime.of(21, 0));

    public List<LocalTime> visitTimes(int dayIndex) {
        return switch (this) {
            case INTENSO -> DIA_CHEIO;
            case EQUILIBRADO -> dayIndex % 2 == 0 ? DIA_CHEIO
                    : (dayIndex / 2) % 2 == 0 ? DIA_TARDE_LIVRE : DIA_MANHA_LIVRE;
            case LEVE -> DIA_LEVE;
        };
    }
}
