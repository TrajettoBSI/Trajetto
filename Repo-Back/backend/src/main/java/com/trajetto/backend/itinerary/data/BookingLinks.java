package com.trajetto.backend.itinerary.data;

import java.util.Map;

/**
 * Atracoes de Roma em que a entrada precisa (ou e fortemente recomendado) ser reservada antes,
 * com o site oficial de venda. Quem chega sem reserva costuma enfrentar horas de fila ou nao
 * conseguir entrar no dia, por isso o app avisa na parada do roteiro.
 */
public final class BookingLinks {

    private static final String COLOSSEO = "https://ticketing.colosseo.it/";
    private static final String VATICANO = "https://tickets.museivaticani.va/";

    private static final Map<String, String> BY_NAME = Map.of(
            "colosseo", COLOSSEO,
            "colle palatino", COLOSSEO,
            "museo palatino", COLOSSEO,
            "domus aurea", COLOSSEO,
            "musei vaticani", VATICANO,
            "cappella sistina", VATICANO,
            "pinacoteca vaticana", VATICANO,
            "galleria borghese", "https://galleriaborghese.beniculturali.it/",
            "pantheon", "https://www.pantheonroma.com/"
    );

    private BookingLinks() {
    }

    /** Link oficial de reserva, ou {@code null} quando o lugar nao exige reserva. */
    public static String forPlace(String name) {
        return name == null ? null : BY_NAME.get(name.trim().toLowerCase());
    }
}
