package com.trajetto.backend.itinerary;

import com.fasterxml.jackson.databind.JsonNode;
import com.trajetto.backend.itinerary.data.WikimediaImages;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingRepository;
import com.trajetto.backend.support.ApiIntegrationTest;
import com.trajetto.backend.user.model.UserModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.StreamSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PlaceHighlightApiIntegrationTest extends ApiIntegrationTest {

    @Autowired
    private RatingRepository ratingRepository;

    @MockitoBean
    private WikimediaImages wikimediaImages;

    @BeforeEach
    void semRede() {
        when(wikimediaImages.imageUrl(any())).thenReturn(Optional.of("https://upload.wikimedia.org/foto.jpg"));
    }

    private JsonNode destaques(UserModel user) throws Exception {
        return corpo(mvc.perform(comToken(get("/places/highlights"), user)).andExpect(status().isOk()).andReturn());
    }

    private Optional<JsonNode> porXid(JsonNode lista, String xid) {
        return StreamSupport.stream(lista.spliterator(), false).filter(n -> n.get("xid").asText().equals(xid)).findFirst();
    }

    private void avaliar(String xid, int nota, String comentario) {
        UserModel autor = usuario(false);
        RatingModel rating = new RatingModel();
        rating.setTouristSpotXid(xid);
        rating.setUserId(autor.getId());
        rating.setUserName("Maria Souza");
        rating.setRating(nota);
        rating.setComment(comentario);
        rating.setCreatedAt(LocalDateTime.now());
        ratingRepository.saveAndFlush(rating);
    }

    @Test
    @DisplayName("Mostra 5 lugares de cidades diferentes, com foto e o ponto completo para abrir o detalhe")
    void cincoLugares() throws Exception {
        JsonNode lista = destaques(usuario(false));

        assertEquals(5, lista.size());
        Set<String> cidades = new HashSet<>();
        lista.forEach(n -> {
            assertTrue(cidades.add(n.get("city").asText()));
            assertEquals("https://upload.wikimedia.org/foto.jpg", n.get("imageUrl").asText());
            assertTrue(n.get("spot").get("name").asText().length() > 0);
        });
    }

    @Test
    @DisplayName("A avaliacao aparece no destaque, e um lugar mal avaliado sai da lista")
    void avaliacoes() throws Exception {
        UserModel user = usuario(false);
        JsonNode antes = destaques(user);
        String primeiro = antes.get(0).get("xid").asText();
        String segundo = antes.get(1).get("xid").asText();

        avaliar(primeiro, 5, "Vale cada minuto");
        for (int i = 0; i < 5; i++) avaliar(segundo, 1, null);
        JsonNode depois = destaques(user);

        JsonNode destaque = porXid(depois, primeiro).orElseThrow();
        assertTrue(destaque.get("ratingsCount").asLong() >= 1);
        assertEquals("Vale cada minuto", destaque.get("latestReview").get("comment").asText());
        assertEquals("Maria Souza", destaque.get("latestReview").get("userName").asText());
        assertTrue(porXid(depois, segundo).isEmpty());
    }
}
