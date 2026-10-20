package com.trajetto.backend.itinerary.data;

import java.util.Map;

/**
 * Atracoes do catalogo em que a entrada precisa (ou e fortemente recomendado) ser reservada antes,
 * com o site oficial de venda. Quem chega sem reserva costuma enfrentar horas de fila ou nao
 * conseguir entrar no dia, por isso o app avisa na parada do roteiro.
 */
public final class BookingLinks {

    private static final String COLOSSEO = "https://ticketing.colosseo.it/";
    private static final String VATICANO = "https://tickets.museivaticani.va/";

    private static final Map<String, String> BY_NAME = Map.ofEntries(
            // Roma
            Map.entry("colosseo", COLOSSEO),
            Map.entry("colle palatino", COLOSSEO),
            Map.entry("museo palatino", COLOSSEO),
            Map.entry("domus aurea", COLOSSEO),
            Map.entry("musei vaticani", VATICANO),
            Map.entry("cappella sistina", VATICANO),
            Map.entry("pinacoteca vaticana", VATICANO),
            Map.entry("galleria borghese", "https://galleriaborghese.beniculturali.it/"),
            Map.entry("pantheon", "https://www.pantheonroma.com/"),
            // Paris
            Map.entry("musée du louvre", "https://www.ticketlouvre.fr/"),
            Map.entry("tour eiffel", "https://www.toureiffel.paris/"),
            Map.entry("sainte-chapelle", "https://www.sainte-chapelle.fr/"),
            // Nova York
            Map.entry("statue of liberty", "https://www.statuecitycruises.com/"),
            // Toquio
            Map.entry("mitaka forest ghibli museum", "https://www.ghibli-museum.jp/en/tickets/"),
            Map.entry("tokyo skytree", "https://www.tokyo-skytree.jp/en/ticket/")
    );

    private BookingLinks() {
    }

    /** Link oficial de reserva, ou {@code null} quando o lugar nao exige reserva. */
    public static String forPlace(String name) {
        return name == null ? null : BY_NAME.get(name.trim().toLowerCase());
    }
}
