package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.itinerary.dto.GenerateItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.PlaceResponseDTO;
import com.trajetto.backend.itinerary.dto.TravelPace;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class MultiDayItineraryIntegrationTest {

    private static final long USUARIO = 999_001L;
    private static final LocalDate INICIO = LocalDate.of(2026, 11, 10);

    @Autowired
    private ItineraryService itineraryService;

    @Autowired
    private EntityManager em;

    @BeforeEach
    void seed() {
        em.createNativeQuery("INSERT INTO users (code, first_name, last_name, email, password, is_verified, isAdmin, travelerProfile) "
                + "VALUES (" + USUARIO + ", 'Dias', 'Teste', 'dias.teste@trajetto.local', 'x', 1, 0, 'CULTURAL')")
                .executeUpdate();
        em.flush();
    }

    private GenerateItineraryRequestDTO pedido(LocalDate inicio, Integer dias) {
        GenerateItineraryRequestDTO req = new GenerateItineraryRequestDTO();
        req.setUserId(USUARIO);
        req.setStartLatitude(41.9009);
        req.setStartLongitude(12.4833);
        req.setStartDate(inicio);
        req.setDays(dias);
        return req;
    }

    @Test
    @DisplayName("Um roteiro de 3 dias tem paradas em cada um dos 3 dias, e o periodo cobre os 3")
    void geraParadasParaTodosOsDias() {
        ItineraryResponseDTO roteiro = itineraryService.generateItinerary(pedido(INICIO, 3));

        assertEquals(INICIO, roteiro.getStartDate());
        assertEquals(INICIO.plusDays(2), roteiro.getEndDate());

        Map<LocalDate, List<PlaceResponseDTO>> porDia = roteiro.getPlaces().stream()
                .collect(Collectors.groupingBy(PlaceResponseDTO::getVisitDate));
        assertEquals(3, porDia.size());
        porDia.forEach((dia, paradas) -> {
            assertEquals(7, paradas.size(), "paradas no dia " + dia);
            assertTrue(paradas.stream().anyMatch(p -> p.getEstimatedVisitTime().equals(LocalTime.of(9, 0))),
                    "cada dia recomeca as 9h: " + dia);
        });

        assertEquals(21, roteiro.getPlaces().stream().map(PlaceResponseDTO::getName).distinct().count(),
                "nenhum lugar se repete entre os dias");
        assertEquals(21, roteiro.getPlaces().stream().map(PlaceResponseDTO::getOrderIndex).distinct().count());
    }

    @Test
    @DisplayName("Sem data nem duracao, o roteiro continua sendo de um dia, comecando hoje")
    void semDataNemDuracaoGeraUmDiaHoje() {
        ItineraryResponseDTO roteiro = itineraryService.generateItinerary(pedido(null, null));

        assertEquals(LocalDate.now(), roteiro.getStartDate());
        assertEquals(LocalDate.now(), roteiro.getEndDate());
        assertEquals(7, roteiro.getPlaces().size());
        assertTrue(roteiro.getPlaces().stream().allMatch(p -> LocalDate.now().equals(p.getVisitDate())));
    }

    private Map<LocalDate, Long> paradasPorDia(TravelPace ritmo, int dias) {
        GenerateItineraryRequestDTO req = pedido(INICIO, dias);
        req.setPace(ritmo);
        ItineraryResponseDTO roteiro = itineraryService.generateItinerary(req);
        assertEquals(INICIO.plusDays(dias - 1L), roteiro.getEndDate());
        return roteiro.getPlaces().stream()
                .collect(Collectors.groupingBy(PlaceResponseDTO::getVisitDate, Collectors.counting()));
    }

    @Test
    @DisplayName("Metade cheios, metade livres: alterna dia de 7 paradas e dia sem paradas")
    void metadeCheiosMetadeLivres() {
        Map<LocalDate, Long> porDia = paradasPorDia(TravelPace.METADE_LIVRE, 4);

        assertEquals(Map.of(INICIO, 7L, INICIO.plusDays(2), 7L), porDia);
    }

    @Test
    @DisplayName("Alguns dias cheios: alterna dia de 7 paradas e dia de 5")
    void algunsDiasCheios() {
        assertEquals(Map.of(INICIO, 7L, INICIO.plusDays(1), 5L, INICIO.plusDays(2), 7L),
                paradasPorDia(TravelPace.EQUILIBRADO, 3));
    }

    @Test
    @DisplayName("Roteiro leve: 4 paradas por dia, comecando as 10h")
    void roteiroLeve() {
        GenerateItineraryRequestDTO req = pedido(INICIO, 2);
        req.setPace(TravelPace.LEVE);
        ItineraryResponseDTO roteiro = itineraryService.generateItinerary(req);

        assertEquals(8, roteiro.getPlaces().size());
        assertTrue(roteiro.getPlaces().stream().noneMatch(p -> p.getEstimatedVisitTime().isBefore(LocalTime.of(10, 0))));
    }
}
