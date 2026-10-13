package com.trajetto.backend.rating;

import com.trajetto.backend.support.ApiIntegrationTest;
import com.trajetto.backend.user.model.UserModel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RatingApiIntegrationTest extends ApiIntegrationTest {

    private static final String XID = "osm_local_de_teste_das_avaliacoes";

    private long avaliar(UserModel user, int nota) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("placeId", XID);
        body.put("userId", user.getId());
        body.put("userName", "Teste Api");
        body.put("rating", nota);
        body.put("comment", "Vale a visita");
        return corpo(mvc.perform(json(comToken(post("/api/ratings"), user), body))
                .andExpect(status().isCreated())
                .andReturn()).get("id").asLong();
    }

    @Test
    @DisplayName("Avaliacoes de um local aparecem na lista e na media")
    void listaEMedia() throws Exception {
        UserModel ana = usuario(false);
        UserModel bia = usuario(false);
        avaliar(ana, 5);
        avaliar(bia, 2);

        mvc.perform(comToken(get("/api/ratings/spot").param("xid", XID), ana))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        mvc.perform(comToken(get("/api/ratings/spot/average").param("xid", XID), ana))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(3.5));
        mvc.perform(comToken(get("/api/ratings/spot/average").param("xid", "osm_sem_avaliacao"), ana))
                .andExpect(jsonPath("$").value(0.0));
    }

    @Test
    @DisplayName("O mesmo usuario nao avalia o mesmo local duas vezes")
    void avaliacaoDuplicada() throws Exception {
        UserModel ana = usuario(false);
        avaliar(ana, 4);

        Map<String, Object> body = Map.of("placeId", XID, "userId", ana.getId(), "rating", 3);
        mvc.perform(json(comToken(post("/api/ratings"), ana), body))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Nota fora de 1 a 5 responde 400")
    void notaInvalida() throws Exception {
        UserModel ana = usuario(false);

        Map<String, Object> body = Map.of("placeId", XID, "userId", ana.getId(), "rating", 9);
        mvc.perform(json(comToken(post("/api/ratings"), ana), body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("So o autor edita ou apaga a propria avaliacao")
    void edicaoERemocao() throws Exception {
        UserModel ana = usuario(false);
        UserModel bia = usuario(false);
        long id = avaliar(ana, 4);

        mvc.perform(comToken(put("/api/ratings/" + id), bia)
                        .param("userId", String.valueOf(bia.getId())).param("rating", "1"))
                .andExpect(status().isForbidden());
        mvc.perform(comToken(put("/api/ratings/" + id), ana)
                        .param("userId", String.valueOf(ana.getId())).param("rating", "5").param("comment", "Melhor ainda"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Melhor ainda"));

        mvc.perform(comToken(delete("/api/ratings/" + id), bia).param("userId", String.valueOf(bia.getId())))
                .andExpect(status().isForbidden());
        mvc.perform(comToken(delete("/api/ratings/" + id), ana).param("userId", String.valueOf(ana.getId())))
                .andExpect(status().isNoContent());
        mvc.perform(comToken(delete("/api/ratings/" + id), ana).param("userId", String.valueOf(ana.getId())))
                .andExpect(status().isNotFound());
        mvc.perform(comToken(put("/api/ratings/" + id), ana)
                        .param("userId", String.valueOf(ana.getId())).param("rating", "3"))
                .andExpect(status().isNotFound());
    }
}
