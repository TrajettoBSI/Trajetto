package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.exception.ForbiddenOperationException;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.NoteRequestDTO;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class ItineraryNoteIntegrationTest {

    private static final long USUARIO = 998_001L;
    private static final long OUTRO_USUARIO = 998_002L;
    private static final long ROTEIRO = 998_001L;

    @Autowired
    private ItineraryService itineraryService;

    @Autowired
    private EntityManager em;

    @BeforeEach
    void seed() {
        em.createNativeQuery("INSERT INTO users (code, first_name, last_name, email, password, is_verified, isAdmin) VALUES "
                + "(" + USUARIO + ", 'Nota', 'Um', 'nota.um@trajetto.local', 'x', 1, 0), "
                + "(" + OUTRO_USUARIO + ", 'Nota', 'Dois', 'nota.dois@trajetto.local', 'x', 1, 0)")
                .executeUpdate();
        em.createNativeQuery("INSERT INTO itineraries (id, user_id, start_date, end_date, is_active) "
                + "VALUES (" + ROTEIRO + ", " + USUARIO + ", '2026-03-01', '2026-03-01', 1)").executeUpdate();
        em.createNativeQuery("INSERT INTO places (itinerary_id, name, order_index, latitude, longitude) "
                + "VALUES (" + ROTEIRO + ", 'Colosseo', 0, 41.89, 12.49)").executeUpdate();
        em.flush();
        em.clear();
    }

    private NoteRequestDTO nota(String texto) {
        NoteRequestDTO req = new NoteRequestDTO();
        req.setNote(texto);
        return req;
    }

    private Object notaNoBanco() {
        em.flush();
        em.clear();
        return em.createNativeQuery("SELECT note FROM places WHERE itinerary_id = " + ROTEIRO + " AND order_index = 0")
                .getSingleResult();
    }

    @Test
    @DisplayName("A anotacao e gravada no banco e volta ao ler o roteiro de novo")
    void anotacaoPersisteEVolta() {
        itineraryService.updateNote(ROTEIRO, 0, USUARIO, nota("  Comprar ingresso antes  "));

        assertEquals("Comprar ingresso antes", notaNoBanco());

        ItineraryResponseDTO lido = itineraryService.getActiveItinerary(USUARIO);
        assertEquals("Comprar ingresso antes", lido.getPlaces().get(0).getNote());
    }

    @Test
    @DisplayName("Anotacao em branco remove a anotacao, gravando NULL")
    void anotacaoEmBrancoRemove() {
        itineraryService.updateNote(ROTEIRO, 0, USUARIO, nota("Levar casaco"));
        itineraryService.updateNote(ROTEIRO, 0, USUARIO, nota("   "));

        assertNull(notaNoBanco());
    }

    @Test
    @DisplayName("Outro usuario nao anota no roteiro de quem nao e ele")
    void outroUsuarioNaoAnota() {
        assertThrows(ForbiddenOperationException.class,
                () -> itineraryService.updateNote(ROTEIRO, 0, OUTRO_USUARIO, nota("Intruso")));

        assertNull(notaNoBanco());
    }
}
