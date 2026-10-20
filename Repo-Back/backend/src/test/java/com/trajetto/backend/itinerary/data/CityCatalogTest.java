package com.trajetto.backend.itinerary.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.data.CityCatalog.City;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
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
        var piramide = lugar("paris", "Pyramide du Louvre");
        var museu = lugar("paris", "Musée du Louvre");
        var torre = lugar("paris", "Tour Eiffel");
        var campo = lugar("paris", "Champ de Mars");
        assertTrue(catalog.sameVisit(piramide).contains(museu));
        assertFalse(catalog.sameVisit(torre).contains(campo));
    }

    @Test
    @DisplayName("Ate 250 m, nome contido no outro tambem e o mesmo lugar; Abadia e Palacio de Westminster, nao")
    void mesmoLugarPeloNome() {
        assertTrue(catalog.sameVisit(lugar("nova-york", "Statue of Liberty"))
                .contains(lugar("nova-york", "Statue of Liberty Museum")));
        assertTrue(catalog.sameVisit(lugar("cidade-do-mexico", "Templo Mayor"))
                .contains(lugar("cidade-do-mexico", "Museo Templo Mayor")));
        assertFalse(catalog.sameVisit(lugar("londres", "Westminster Abbey"))
                .contains(lugar("londres", "Palace of Westminster")));
        assertFalse(catalog.sameVisit(lugar("atenas", "Acropolis"))
                .contains(lugar("atenas", "Acropolis Museum")));
    }

    @Test
    @DisplayName("Dentro do mesmo recinto e uma visita so, a qualquer distancia: Gize, Acropole")
    void mesmoLugarPeloRecinto() {
        List<CatalogPlace> gize = catalog.sameVisit(lugar("cairo", "Great Pyramid of Giza"));
        assertTrue(gize.contains(lugar("cairo", "The Great Sphinx")));
        assertTrue(gize.contains(lugar("cairo", "Giza Pyramids")));
        assertTrue(catalog.sameVisit(lugar("atenas", "Parthenon"))
                .contains(lugar("atenas", "Athena Nike Temple")));
        assertFalse(gize.contains(lugar("cairo", "Pyramid of Djoser")));
    }

    @Test
    @DisplayName("A cidade escolhida e a mais perto da posicao, mesmo fora do raio de todas")
    void cidadeMaisProxima() {
        assertEquals("roma", catalog.nearestCity(41.9009, 12.4833).slug());
        City qualquer = catalog.nearestCity(0, 0);
        assertTrue(catalog.getCities().contains(qualquer));
    }

    private CatalogPlace lugar(String cidade, String nome) {
        return catalog.placesOf(catalog.city(cidade).orElseThrow()).stream()
                .filter(p -> p.name().equals(nome)).findFirst().orElseThrow(() -> new AssertionError(nome));
    }
}
