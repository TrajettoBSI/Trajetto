package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.itinerary.data.CityCatalog;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
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

    @Autowired
    private CityCatalog cityCatalog;

    @BeforeEach
    void seed() {
        em.createNativeQuery("INSERT INTO users (code, first_name, last_name, email, password, is_verified, role_id, travelerProfile) "
                + "VALUES (" + USUARIO + ", 'Dias', 'Teste', 'dias.teste@trajetto.local', 'x', 1, (SELECT id FROM roles WHERE code = 'USER'), 'CULTURAL')")
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


    @Test
    @DisplayName("Alguns dias cheios: alterna dia de 7 paradas e dia de 4, com a tarde ou a manha livre")
    void algunsDiasCheios() {
        GenerateItineraryRequestDTO req = pedido(INICIO, 4);
        req.setPace(TravelPace.EQUILIBRADO);
        Map<LocalDate, List<PlaceResponseDTO>> porDia = itineraryService.generateItinerary(req).getPlaces().stream()
                .collect(Collectors.groupingBy(PlaceResponseDTO::getVisitDate));

        assertEquals(7, porDia.get(INICIO).size());
        assertEquals(4, porDia.get(INICIO.plusDays(1)).size());
        assertEquals(7, porDia.get(INICIO.plusDays(2)).size());
        assertEquals(4, porDia.get(INICIO.plusDays(3)).size());

        LocalTime meioDia = LocalTime.of(12, 0);
        LocalTime noite = LocalTime.of(20, 0);
        assertTrue(porDia.get(INICIO.plusDays(1)).stream().map(PlaceResponseDTO::getEstimatedVisitTime)
                .noneMatch(t -> t.isAfter(meioDia) && t.isBefore(noite)), "tarde livre");
        assertTrue(porDia.get(INICIO.plusDays(3)).stream().map(PlaceResponseDTO::getEstimatedVisitTime)
                .noneMatch(t -> t.isBefore(meioDia)), "manha livre");
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

    @Test
    @DisplayName("Com a cidade escolhida no app, todas as paradas sao dela, mesmo partindo de longe")
    void roteiroNaCidadeEscolhida() {
        GenerateItineraryRequestDTO req = pedido(INICIO, 1);
        req.setCity("paris");
        ItineraryResponseDTO roteiro = itineraryService.generateItinerary(req);

        CityCatalog.City paris = cityCatalog.city("paris").orElseThrow();
        List<String> nomesDeParis = cityCatalog.placesOf(paris).stream().map(CityCatalog.CatalogPlace::name).toList();
        assertTrue(!roteiro.getPlaces().isEmpty());
        assertTrue(roteiro.getPlaces().stream().allMatch(p -> nomesDeParis.contains(p.getName())));
    }

    @Test
    @DisplayName("Pontos no mesmo lugar sao uma parada so, e vale a principal: o Museu do Louvre, nao a Piramide")
    void umaParadaPorLugar() {
        em.createNativeQuery("UPDATE users SET travelerProfile = 'AVENTUREIRO' WHERE code = " + USUARIO).executeUpdate();
        em.flush();
        em.clear();
        for (int i = 0; i < 7; i++) {
            GenerateItineraryRequestDTO req = pedido(INICIO.plusDays(i), 5);
            req.setCity("paris");
            List<PlaceResponseDTO> paradas = itineraryService.generateItinerary(req).getPlaces();

            assertTrue(paradas.stream().noneMatch(p -> p.getName().equals("Pyramide du Louvre")
                    || p.getName().equals("Palais du Louvre")));
            for (PlaceResponseDTO a : paradas) {
                for (PlaceResponseDTO b : paradas) {
                    if (a != b) {
                        assertTrue(distanciaKm(a, b) > CityCatalog.SAME_VISIT_KM, a.getName() + " e " + b.getName());
                    }
                }
            }
        }
    }

    @Test
    @DisplayName("Lugar pago sem reserva cadastrada leva o site oficial para o ingresso")
    void ingressoNoSiteOficial() {
        GenerateItineraryRequestDTO req = pedido(INICIO, 7);
        req.setCity("paris");
        List<PlaceResponseDTO> pagos = itineraryService.generateItinerary(req).getPlaces().stream()
                .filter(p -> "yes".equals(p.getFee())).toList();

        assertTrue(!pagos.isEmpty());
        for (PlaceResponseDTO p : pagos) {
            String site = cityCatalog.findByName(p.getName(), p.getLatitude(), p.getLongitude()).map(CityCatalog.CatalogPlace::website).orElse("");
            if (p.getBookingUrl() != null) {
                assertEquals(null, p.getTicketUrl(), p.getName());
            } else {
                assertEquals(site.isBlank() ? null : site, p.getTicketUrl(), p.getName());
            }
        }
    }

    private static double distanciaKm(PlaceResponseDTO a, PlaceResponseDTO b) {
        double dLat = Math.toRadians(b.getLatitude() - a.getLatitude());
        double dLon = Math.toRadians(b.getLongitude() - a.getLongitude());
        double h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(Math.toRadians(a.getLatitude()))
                * Math.cos(Math.toRadians(b.getLatitude())) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    }

    @Test
    @DisplayName("Cidade fora do catalogo e recusada")
    void cidadeDesconhecida() {
        GenerateItineraryRequestDTO req = pedido(INICIO, 1);
        req.setCity("atlantida");
        assertThrows(InvalidRequestException.class, () -> itineraryService.generateItinerary(req));
    }
}
