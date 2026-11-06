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

/** Ajuste do roteiro por pedido em texto livre. */
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
    @DisplayName("'Troca a Fontana di Trevi para as 16:20' muda a hora e deixa a fonte no mesmo dia")
    void mudaOHorarioNoMesmoDia() {
        ItineraryResponseDTO noUltimoDia = itineraryService.adjustItinerary(gerar(null).getId(), USUARIO,
                pedido("coloca a fontana di trevi no último dia, de manhã"));

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(noUltimoDia.getId(), USUARIO,
                pedido("troca a fontana di trevi para as 16:20"));

        List<PlaceResponseDTO> trevi = ajustado.getPlaces().stream()
                .filter(p -> p.getName().equals("Fontana di Trevi")).toList();
        assertEquals(1, trevi.size());
        assertEquals(ajustado.getEndDate(), trevi.get(0).getVisitDate());
        assertEquals(java.time.LocalTime.of(16, 20), trevi.get(0).getEstimatedVisitTime());
        assertEquals(noUltimoDia.getPlaces().size(), ajustado.getPlaces().size());
        assertTrue(ajustado.getAssistantSummary().contains("16:20"));
        assertFalse(ajustado.getAssistantSummary().contains("não coube"));
    }

    @Test
    @DisplayName("'Fontana di Trevi no ultimo dia, de manha' coloca a fonte nesse dia e periodo, uma vez so")
    void colocaLugarNoDiaEPeriodoPedidos() {
        ItineraryResponseDTO original = gerar(null);

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(original.getId(), USUARIO,
                pedido("coloca a fontana di trevi no último dia, na parte da manhã"));

        List<PlaceResponseDTO> trevi = ajustado.getPlaces().stream()
                .filter(p -> p.getName().equals("Fontana di Trevi")).toList();
        assertEquals(1, trevi.size());
        assertEquals(ajustado.getEndDate(), trevi.get(0).getVisitDate());
        assertTrue(trevi.get(0).getEstimatedVisitTime().isBefore(java.time.LocalTime.NOON));
        assertTrue(ajustado.getAssistantSummary().contains("Fontana di Trevi"));
    }

    @Test
    @DisplayName("Um ajuste so de horario mantem a maior parte das paradas do roteiro")
    void ajustePontualMantemORoteiro() {
        ItineraryResponseDTO original = gerar(null);

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(original.getId(), USUARIO,
                pedido("Fontana di Trevi no primeiro dia à noite"));

        List<String> antes = original.getPlaces().stream().map(PlaceResponseDTO::getXid).toList();
        long mantidas = ajustado.getPlaces().stream().filter(p -> antes.contains(p.getXid())).count();
        assertTrue(mantidas >= antes.size() - 2, "mantidas " + mantidas + " de " + antes.size());
    }

    @Test
    @DisplayName("Pedido que nao foi entendido nao cria versao nova e diz o que tentar")
    void pedidoNaoEntendido() {
        ItineraryResponseDTO original = gerar(null);

        ItineraryResponseDTO resposta = itineraryService.adjustItinerary(original.getId(), USUARIO, pedido("asdfgh"));

        assertEquals(original.getId(), resposta.getId());
        assertEquals(1, itineraryService.getAllItineraries(USUARIO).size());
        assertTrue(resposta.getAssistantSummary().contains("Não entendi"));
    }

    @Test
    @DisplayName("Pedido de refeicao recebe a explicacao, sem criar versao nova")
    void pedidoDeRefeicao() {
        ItineraryResponseDTO original = gerar(null);

        ItineraryResponseDTO resposta = itineraryService.adjustItinerary(original.getId(), USUARIO, pedido("mais restaurantes"));

        assertEquals(original.getId(), resposta.getId());
        assertTrue(resposta.getAssistantSummary().contains("Refeições"));
    }

    @Test
    @DisplayName("A resposta diz o que entrou e o que saiu, no idioma do app")
    void respostaComAsMudancas() {
        ItineraryResponseDTO original = gerar(null);
        AdjustItineraryRequestDTO req = pedido("more museums");
        req.setLanguage("en-US");

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(original.getId(), USUARIO, req);

        assertTrue(ajustado.getAssistantSummary().startsWith("Got it: more museums."), ajustado.getAssistantSummary());
        assertTrue(ajustado.getAssistantSummary().contains("Added"), ajustado.getAssistantSummary());
        assertTrue(ajustado.getAssistantSummary().contains("Removed"), ajustado.getAssistantSummary());
    }

    @Test
    @DisplayName("Categoria que a cidade nao tem: a resposta avisa em vez de fingir que ajustou")
    void categoriaQueACidadeNaoTem() {
        ItineraryResponseDTO original = gerar(null);

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(original.getId(), USUARIO, pedido("mais praias"));

        assertTrue(ajustado.getAssistantSummary().contains("Esta cidade não tem praias"), ajustado.getAssistantSummary());
    }

    @Test
    @DisplayName("'Menos caminhada' responde com o caminho antes e depois")
    void respostaComACaminhada() {
        ItineraryResponseDTO original = gerar(null);

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(original.getId(), USUARIO, pedido("menos caminhada"));

        assertTrue(ajustado.getAssistantSummary().contains(" km"), ajustado.getAssistantSummary());
        assertEquals("MENOS", ajustado.getPreferences().walking());
    }

    @Test
    @DisplayName("'Pode incluir pagos' desfaz o 'so gratis' entre ajustes")
    void desfazSoGratis() {
        ItineraryResponseDTO gratis = gerar("só lugares grátis");
        assertTrue(gratis.getPreferences().avoidPaid());

        ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(gratis.getId(), USUARIO, pedido("pode incluir lugares pagos"));

        assertTrue(ajustado.getPreferences() == null || !ajustado.getPreferences().avoidPaid());
    }

    @Test
    @DisplayName("Ajuste que nao muda nenhuma parada fica na mesma versao")
    void ajusteSemMudancaNaoCriaVersao() {
        // O sorteio do planejador pode mexer em uma parada; repetindo, o roteiro estabiliza.
        ItineraryResponseDTO atual = gerar(null);
        ItineraryResponseDTO mesmaVersao = null;
        for (int i = 0; i < 10 && mesmaVersao == null; i++) {
            ItineraryResponseDTO ajustado = itineraryService.adjustItinerary(atual.getId(), USUARIO, pedido("sem zoológicos"));
            if (ajustado.getId().equals(atual.getId())) mesmaVersao = ajustado;
            atual = ajustado;
        }

        assertNotNull(mesmaVersao, "nenhum dos ajustes manteve a versao");
        assertTrue(mesmaVersao.getAssistantSummary().contains("não mudou"), mesmaVersao.getAssistantSummary());
        assertTrue(mesmaVersao.getPreferences().lessCategories().contains("zoo"));
        assertEquals(1, itineraryService.getAllItineraries(USUARIO).stream().filter(ItineraryResponseDTO::getActive).count());
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
