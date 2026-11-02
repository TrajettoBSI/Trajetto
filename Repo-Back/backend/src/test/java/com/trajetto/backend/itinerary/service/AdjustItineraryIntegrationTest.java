package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.exception.ForbiddenOperationException;
import com.trajetto.backend.itinerary.dto.AdjustItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.GenerateItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.NoteRequestDTO;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Ajuste por texto livre; nos testes nao ha chave da IA, entao vale o interpretador por regras. */
@SpringBootTest
@Transactional
class AdjustItineraryIntegrationTest {

    private static final long USUARIO = 999_301L;
    private static final long OUTRO = 999_302L;
    private static final LocalDate INICIO = LocalDate.of(2026, 11, 10);

    @Autowired
    private ItineraryService itineraryService;

    @Autowired
    private EntityManager em;

    @BeforeEach
    void seed() {
        for (long id : new long[]{USUARIO, OUTRO}) {
            em.createNativeQuery("INSERT INTO users (code, first_name, last_name, email, password, is_verified, role_id, travelerProfile) "
                    + "VALUES (" + id + ", 'Ajuste', 'Teste', 'ajuste" + id + "@trajetto.local', 'x', 1, (SELECT id FROM roles WHERE code = 'USER'), 'CULTURAL')")
                    .executeUpdate();
        }
        em.flush();
    }

    private ItineraryResponseDTO gerar(String pedido) {
        GenerateItineraryRequestDTO req = new GenerateItineraryRequestDTO();
        req.setUserId(USUARIO);
        req.setStartLatitude(41.9009);
        req.setStartLongitude(12.4833);
        req.setStartDate(INICIO);
        req.setDays(2);
        req.setPace(TravelPace.EQUILIBRADO);
        req.setCity("roma");
        req.setName("Roma com a familia");
        req.setRequest(pedido);
        return itineraryService.generateItinerary(req);
    }

    private AdjustItineraryRequestDTO pedido(String texto) {
        AdjustItineraryRequestDTO req = new AdjustItineraryRequestDTO();
        req.setRequest(texto);
        return req;
    }

    @Test
    @DisplayName("Gerar com pedido em texto livre aplica e devolve o que foi entendido")
    void gerarComPedido() {
        ItineraryResponseDTO roteiro = gerar("quero mais museus");

        assertEquals("REGRAS", roteiro.getAssistantSource());
        assertFalse(roteiro.getAssistantSummary().isBlank());
        assertTrue(roteiro.getPreferences().moreCategories().contains("museum"));
        assertEquals("EQUILIBRADO", roteiro.getPace());
    }

    @Test
    @DisplayName("Ajustar cria uma nova versao ativa, mesma cidade e datas, e a anterior vai para o historico")
    void ajustarCriaNovaVersao() {
        ItineraryResponseDTO original = gerar(null);

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(original.getId(), USUARIO,
                pedido("menos museus e com calma"));

        assertNotEquals(original.getId(), ajustado.getId());
        assertTrue(ajustado.getActive());
        assertEquals("roma", ajustado.getCity());
        assertEquals(INICIO, ajustado.getStartDate());
        assertEquals(INICIO.plusDays(1), ajustado.getEndDate());
        assertEquals("Roma com a familia", ajustado.getName());
        assertEquals("LEVE", ajustado.getPace());
        assertTrue(ajustado.getPreferences().lessCategories().contains("museum"));
        assertFalse(ajustado.getAssistantSummary().isBlank());

        List<ItineraryResponseDTO> todos = itineraryService.getAllItineraries(USUARIO);
        assertEquals(2, todos.size());
        assertEquals(1, todos.stream().filter(ItineraryResponseDTO::getActive).count());
    }

    @Test
    @DisplayName("Os pedidos se acumulam entre ajustes")
    void pedidosSeAcumulam() {
        ItineraryResponseDTO original = gerar("mais parques");

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(original.getId(), USUARIO,
                pedido("sem igrejas"));

        assertTrue(ajustado.getPreferences().moreCategories().contains("park"));
        assertTrue(ajustado.getPreferences().lessCategories().contains("historic_church"));
    }

    @Test
    @DisplayName("A anotacao de uma parada que continua no roteiro vai junto para a nova versao")
    void levaAsAnotacoes() {
        ItineraryResponseDTO original = gerar(null);
        PlaceResponseDTO primeira = original.getPlaces().get(0);
        NoteRequestDTO nota = new NoteRequestDTO();
        nota.setNote("Comprar ingresso antes");
        itineraryService.updateNote(original.getId(), primeira.getOrderIndex(), USUARIO, nota);

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(original.getId(), USUARIO,
                pedido("mais " + primeira.getCategory()));

        ajustado.getPlaces().stream()
                .filter(p -> p.getXid().equals(primeira.getXid()))
                .findFirst()
                .ifPresent(p -> assertEquals("Comprar ingresso antes", p.getNote()));
    }

    @Test
    @DisplayName("O roteiro informa o caminho total e o tempo a pe entre as paradas")
    void informaDistancias() {
        ItineraryResponseDTO roteiro = gerar(null);

        assertNotNull(roteiro.getDistanceKm());
        assertNotNull(roteiro.getBaselineDistanceKm());
        assertTrue(roteiro.getDistanceKm() <= roteiro.getBaselineDistanceKm() + 0.01,
                "o caminho otimizado nao pode ser maior que o guloso");
        assertTrue(roteiro.getPlaces().stream().allMatch(p -> p.getWalkingMinutesFromPrevious() != null));
    }

    @Test
    @DisplayName("Ninguem ajusta o roteiro de outro usuario")
    void soODonoAjusta() {
        ItineraryResponseDTO original = gerar(null);

        assertThrows(ForbiddenOperationException.class,
                () -> itineraryService.adjustItinerary(original.getId(), OUTRO, pedido("mais museus")));
    }
}
