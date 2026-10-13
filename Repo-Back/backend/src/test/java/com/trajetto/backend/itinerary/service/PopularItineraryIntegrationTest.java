package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.itinerary.dto.GenerateItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.PlaceResponseDTO;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class PopularItineraryIntegrationTest {

    private static final long USUARIO = 999_101L;

    @Autowired
    private ItineraryService itineraryService;

    @Autowired
    private EntityManager em;

    @BeforeEach
    void seed() {
        em.createNativeQuery("INSERT INTO users (code, first_name, last_name, email, password, is_verified, isAdmin, travelerProfile) "
                + "VALUES (" + USUARIO + ", 'Popular', 'Teste', 'popular.teste@trajetto.local', 'x', 1, 0, 'SOCIAL')")
                .executeUpdate();
        em.flush();
    }

    private List<String> gerar(int dias) {
        return roteiro(dias).getPlaces().stream().map(PlaceResponseDTO::getName).toList();
    }

    private ItineraryResponseDTO roteiro(int dias) {
        GenerateItineraryRequestDTO req = new GenerateItineraryRequestDTO();
        req.setUserId(USUARIO);
        req.setStartLatitude(41.9009);
        req.setStartLongitude(12.4833);
        req.setStartDate(LocalDate.of(2026, 11, 10));
        req.setDays(dias);
        ItineraryResponseDTO roteiro = itineraryService.generateItinerary(req);
        assertFalse(roteiro.getPlaces().stream().map(PlaceResponseDTO::getCategory)
                        .anyMatch(Set.of("restaurant", "cafe", "ice_cream")::contains),
                "restaurantes e cafes ficam para as sugestoes de refeicao");
        return roteiro;
    }

    @RepeatedTest(5)
    @DisplayName("Um roteiro de um dia em Roma sempre passa pelo Coliseu")
    void umDiaTemOColiseu() {
        assertTrue(gerar(1).contains("Colosseo"));
    }

    @RepeatedTest(5)
    @DisplayName("Em tres dias entram Coliseu, Panteao e Fontana di Trevi, sem repetir o mesmo lugar")
    void tresDiasTemOsEssenciais() {
        List<String> nomes = gerar(3);

        assertTrue(nomes.containsAll(List.of("Colosseo", "Pantheon", "Fontana di Trevi")), nomes::toString);
        assertFalse(nomes.contains("Forum Romanum") && nomes.contains("Piazza del Foro"),
                "os dois nomes sao o mesmo lugar no Wikidata");
        assertTrue(nomes.stream().distinct().count() == nomes.size(), nomes::toString);
    }

    @RepeatedTest(5)
    @DisplayName("A parada da noite nao cai em museu, galeria ou igreja, que estao fechados")
    void paradaDaNoiteEAoArLivre() {
        roteiro(3).getPlaces().stream()
                .filter(p -> !p.getEstimatedVisitTime().isBefore(LocalTime.of(20, 0)))
                .forEach(p -> assertFalse(Set.of("museum", "gallery", "historic_church", "historic_monastery").contains(p.getCategory()),
                        p.getName() + " (" + p.getCategory() + ")"));
    }
}
