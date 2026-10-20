package com.trajetto.backend.itinerary.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.itinerary.data.CityCatalog.City;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.ZoneId;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CityCatalogTest {

    private final CityCatalog catalog = new CityCatalog(new ObjectMapper());

    @Test
    @DisplayName("Toda cidade do manifesto tem arquivo, fuso valido e pontos dentro do proprio raio")
    void manifestoConsistente() {
        Set<String> slugs = new HashSet<>();
        for (City city : catalog.getCities()) {
            assertTrue(slugs.add(city.slug()), "slug repetido: " + city.slug());
            assertDoesNotThrow(() -> ZoneId.of(city.timezone()), city.slug());
            assertFalse(catalog.placesOf(city).isEmpty(), city.slug());
            catalog.placesOf(city).forEach(p -> assertTrue(
                    CityCatalog.haversineKm(city.latitude(), city.longitude(), p.latitude(), p.longitude())
                            <= city.radiusKm() * 1.5,
                    city.slug() + ": " + p.name() + " longe demais do centro"));
        }
    }

    @Test
    @DisplayName("A Piramide e o Museu do Louvre ficam no mesmo lugar; a Torre Eiffel e o Champ de Mars, nao")
    void mesmoLugar() {
        var piramide = catalog.findByName("Pyramide du Louvre").orElseThrow();
        var museu = catalog.findByName("Musée du Louvre").orElseThrow();
        var torre = catalog.findByName("Tour Eiffel").orElseThrow();
        var campo = catalog.findByName("Champ de Mars").orElseThrow();
        assertTrue(catalog.sameVisit(piramide).contains(museu));
        assertFalse(catalog.sameVisit(torre).contains(campo));
    }

    @Test
    @DisplayName("A cidade escolhida e a mais perto da posicao, mesmo fora do raio de todas")
    void cidadeMaisProxima() {
        assertEquals("roma", catalog.nearestCity(41.9009, 12.4833).slug());
        City qualquer = catalog.nearestCity(0, 0);
        assertTrue(catalog.getCities().contains(qualquer));
    }
}
