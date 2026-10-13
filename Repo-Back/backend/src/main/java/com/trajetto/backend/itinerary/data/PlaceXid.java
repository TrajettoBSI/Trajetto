package com.trajetto.backend.itinerary.data;

public final class PlaceXid {

    private PlaceXid() {
    }

    public static String of(String name) {
        return "osm_" + name.toLowerCase().replaceAll("[^a-z0-9]", "_");
    }
}
