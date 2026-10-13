package com.trajetto.backend.itinerary.data;

/**
 * Identificador de um local do catalogo fora do MongoDB.
 *
 * <p>O catalogo nao tem chave estavel propria; roteiros, avaliacoes e
 * favoritos se referem a um local pelo nome normalizado com o prefixo
 * {@code osm_}. A regra fica aqui para que as tres pontas gerem sempre o
 * mesmo valor para o mesmo local.</p>
 */
public final class PlaceXid {

    private PlaceXid() {
    }

    public static String of(String name) {
        return "osm_" + name.toLowerCase().replaceAll("[^a-z0-9]", "_");
    }
}
