package com.trajetto.backend.favorite;

import com.trajetto.backend.favorite.dto.FavoritePlaceRequestDTO;
import com.trajetto.backend.favorite.dto.FavoritePlaceResponseDTO;
import com.trajetto.backend.favorite.service.FavoritePlaceService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class FavoritePlaceServiceIntegrationTest {

    private static final long USUARIO = 997_001L;
    private static final long OUTRO_USUARIO = 997_002L;

    @Autowired
    private FavoritePlaceService favoritePlaceService;

    @Autowired
    private EntityManager em;

    @BeforeEach
    void seed() {
        em.createNativeQuery("INSERT INTO users (code, first_name, last_name, email, password, is_verified, role_id) VALUES "
                + "(" + USUARIO + ", 'Fav', 'Um', 'fav.um@trajetto.local', 'x', 1, (SELECT id FROM roles WHERE code = 'USER')), "
                + "(" + OUTRO_USUARIO + ", 'Fav', 'Dois', 'fav.dois@trajetto.local', 'x', 1, (SELECT id FROM roles WHERE code = 'USER'))")
                .executeUpdate();
        em.flush();
    }

    private FavoritePlaceRequestDTO local(String nome) {
        FavoritePlaceRequestDTO req = new FavoritePlaceRequestDTO();
        req.setName(nome);
        req.setAddress("Piazza del Colosseo");
        req.setCategory("monument");
        req.setLatitude(41.8902);
        req.setLongitude(12.4922);
        return req;
    }

    private long linhasNoBanco(long usuario) {
        em.flush();
        return ((Number) em.createNativeQuery("SELECT COUNT(*) FROM favorite_places WHERE user_id = " + usuario)
                .getSingleResult()).longValue();
    }

    @Test
    @DisplayName("Marcar grava o favorito com o mesmo xid que roteiros e avaliacoes usam")
    void marcarGravaNoBanco() {
        FavoritePlaceResponseDTO salvo = favoritePlaceService.mark(USUARIO, local("Colosseo"));

        assertEquals("osm_colosseo", salvo.xid());
        assertEquals(1, linhasNoBanco(USUARIO));
    }

    @Test
    @DisplayName("Marcar duas vezes o mesmo local nao duplica")
    void marcarDuasVezesNaoDuplica() {
        FavoritePlaceResponseDTO primeiro = favoritePlaceService.mark(USUARIO, local("Colosseo"));
        FavoritePlaceResponseDTO segundo = favoritePlaceService.mark(USUARIO, local("Colosseo"));

        assertEquals(primeiro.id(), segundo.id());
        assertEquals(1, linhasNoBanco(USUARIO));
    }

    @Test
    @DisplayName("A lista traz so os favoritos do proprio usuario")
    void listaSoDoUsuario() {
        favoritePlaceService.mark(USUARIO, local("Colosseo"));
        favoritePlaceService.mark(USUARIO, local("Pantheon"));
        favoritePlaceService.mark(OUTRO_USUARIO, local("Fontana di Trevi"));

        List<FavoritePlaceResponseDTO> lista = favoritePlaceService.list(USUARIO);

        assertEquals(2, lista.size());
        assertTrue(lista.stream().noneMatch(f -> f.name().equals("Fontana di Trevi")));
    }

    @Test
    @DisplayName("Desmarcar remove do banco, e desmarcar de novo nao falha")
    void desmarcarEIdempotente() {
        favoritePlaceService.mark(USUARIO, local("Colosseo"));

        favoritePlaceService.unmark(USUARIO, "osm_colosseo");
        favoritePlaceService.unmark(USUARIO, "osm_colosseo");

        assertEquals(0, linhasNoBanco(USUARIO));
    }

    @Test
    @DisplayName("O banco recusa o mesmo local favoritado duas vezes pelo mesmo usuario")
    void bancoRecusaDuplicata() {
        favoritePlaceService.mark(USUARIO, local("Colosseo"));
        em.flush();

        Exception erro = assertThrows(Exception.class, () -> {
            em.createNativeQuery("INSERT INTO favorite_places (user_id, xid, name, latitude, longitude, created_at) "
                    + "VALUES (" + USUARIO + ", 'osm_colosseo', 'Colosseo', 41.89, 12.49, NOW())").executeUpdate();
            em.flush();
        });

        Throwable raiz = erro;
        while (raiz.getCause() != null) {
            raiz = raiz.getCause();
        }
        assertTrue(String.valueOf(raiz.getMessage()).contains("uk_favorite_places_user_place"));
    }
}
