package com.trajetto.backend.itinerary.dto;

public final class ItineraryNames {

    public static final int MAX_LENGTH = 80;

    private ItineraryNames() {}

    /** Nome sem espacos nas pontas; em branco vira nulo. */
    public static String normalize(String name) {
        return name == null || name.isBlank() ? null : name.trim();
    }
}
