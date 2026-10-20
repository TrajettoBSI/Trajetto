package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.dto.GenerateItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.PlaceResponseDTO;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * O perfil do viajante tem de mudar o roteiro -- sem tirar dele os lugares que todo
 * mundo quer ver.
 */
@SpringBootTest
@Transactional
class ProfileItineraryIntegrationTest {

    private static final long USUARIO = 999_002L;
    private static final int RODADAS = 6;

    @Autowired
    private ItineraryService itineraryService;

    @Autowired
    private CityCatalog cityCatalog;

    @Autowired
    private EntityManager em;

    @BeforeEach
    void seed() {
        em.createNativeQuery("INSERT INTO users (code, first_name, last_name, email, password, is_verified, isAdmin, travelerProfile) "
                + "VALUES (" + USUARIO + ", 'Perfil', 'Teste', 'perfil.teste@trajetto.local', 'x', 1, 0, 'SKIPPED')")
                .executeUpdate();
        em.flush();
    }

    @Test
    @DisplayName("Cada perfil recebe bem mais paradas do seu tipo do que quem pulou o quiz")
    void perfilPuxaOsLugaresDoSeuTipo() {
        for (String perfil : List.of("NATUREZA", "AVENTUREIRO", "LUXO", "MOCHILEIRO", "SOLITARIO", "RELAXAMENTO")) {
            double com = fracaoDoPerfil(roteiros("paris", perfil), perfil);
            double sem = fracaoDoPerfil(roteiros("paris", "SKIPPED"), perfil);
            assertTrue(com >= sem + 0.15, perfil + ": " + com + " com perfil, " + sem + " sem");
        }
    }

    @Test
    @DisplayName("Os lugares mais famosos da cidade continuam no roteiro, qualquer que seja o perfil")
    void imperdiveisEntramParaTodos() {
        for (String cidade : List.of("roma", "paris")) {
            List<String> top = cityCatalog.placesOf(cityCatalog.city(cidade).orElseThrow()).stream()
                    .filter(p -> !Set.of("restaurant", "cafe", "ice_cream", "bar", "pub").contains(p.category()))
                    .sorted(Comparator.comparingInt(CatalogPlace::popularity).reversed())
                    .limit(ItineraryService.MUST_SEE).map(CatalogPlace::name).toList();
            for (String perfil : List.of("AVENTUREIRO", "NATUREZA", "LUXO", "SOLITARIO")) {
                long vistos = roteiros(cidade, perfil).stream().flatMap(List::stream)
                        .filter(p -> top.contains(p.getName())).count();
                assertTrue(vistos >= RODADAS * 3L, cidade + "/" + perfil + ": " + vistos + " imperdiveis em " + RODADAS);
            }
        }
    }

    @Test
    @DisplayName("Para os perfis Social e Mochileiro, a noite pode terminar num bar; para os outros, nao")
    void vidaNoturnaSoParaQuemGosta() {
        assertTrue(roteiros("paris", "SOCIAL").stream().flatMap(List::stream)
                .anyMatch(p -> Set.of("bar", "pub").contains(p.getCategory())));
        assertTrue(roteiros("paris", "NATUREZA").stream().flatMap(List::stream)
                .noneMatch(p -> Set.of("bar", "pub").contains(p.getCategory())));
    }

    private List<List<PlaceResponseDTO>> roteiros(String cidade, String perfil) {
        em.createNativeQuery("UPDATE users SET travelerProfile = '" + perfil + "' WHERE code = " + USUARIO).executeUpdate();
        em.flush();
        em.clear();
        CityCatalog.City c = cityCatalog.city(cidade).orElseThrow();
        List<List<PlaceResponseDTO>> todos = new ArrayList<>();
        for (int i = 0; i < RODADAS; i++) {
            GenerateItineraryRequestDTO req = new GenerateItineraryRequestDTO();
            req.setUserId(USUARIO);
            req.setStartLatitude(c.latitude());
            req.setStartLongitude(c.longitude());
            req.setStartDate(LocalDate.of(2026, 11, 9).plusDays(i));
            req.setDays(3);
            req.setCity(cidade);
            todos.add(itineraryService.generateItinerary(req).getPlaces());
        }
        return todos;
    }

    private double fracaoDoPerfil(List<List<PlaceResponseDTO>> roteiros, String perfil) {
        List<PlaceResponseDTO> paradas = roteiros.stream().flatMap(List::stream).toList();
        long doPerfil = paradas.stream().filter(p -> cityCatalog.findByName(p.getName(), p.getLatitude(), p.getLongitude())
                .map(cp -> cp.profiles().contains(perfil)).orElse(false)).count();
        return paradas.isEmpty() ? 0 : (double) doPerfil / paradas.size();
    }
}
