package com.trajetto.backend.itinerary;

import com.fasterxml.jackson.databind.JsonNode;
import com.trajetto.backend.support.ApiIntegrationTest;
import com.trajetto.backend.user.model.UserModel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ItineraryApiIntegrationTest extends ApiIntegrationTest {

    private JsonNode gerar(UserModel user) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", user.getId());
        body.put("startLatitude", 41.9009);
        body.put("startLongitude", 12.4833);
        body.put("startDate", "2026-11-10");
        body.put("days", 2);
        body.put("pace", "LEVE");
        return corpo(mvc.perform(json(comToken(post("/itinerary/generate"), user), body))
                .andExpect(status().isOk())
                .andReturn());
    }

    @Test
    @DisplayName("Gerar cria o roteiro ativo, que aparece no ativo e na lista do usuario")
    void gerarEConsultar() throws Exception {
        UserModel user = usuario(false);
        JsonNode roteiro = gerar(user);

        assertEquals(8, roteiro.get("places").size());
        mvc.perform(comToken(get("/itinerary/active/" + user.getId()), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(roteiro.get("id").asLong()))
                .andExpect(jsonPath("$.endDate").value("2026-11-11"));
        mvc.perform(comToken(get("/itinerary/all/" + user.getId()), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @DisplayName("Sem roteiro ativo, o ativo responde 204; pedir o de outro id responde 403")
    void semRoteiro() throws Exception {
        UserModel user = usuario(false);

        mvc.perform(comToken(get("/itinerary/active/" + user.getId()), user)).andExpect(status().isNoContent());
        mvc.perform(comToken(get("/itinerary/active/999999999"), user)).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Ativar outro roteiro desativa o atual, e so o dono ativa")
    void ativar() throws Exception {
        UserModel user = usuario(false);
        UserModel outro = usuario(false);
        long primeiro = gerar(user).get("id").asLong();
        long segundo = gerar(user).get("id").asLong();

        mvc.perform(comToken(patch("/itinerary/" + primeiro + "/activate/" + user.getId()), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));
        mvc.perform(comToken(get("/itinerary/active/" + user.getId()), user))
                .andExpect(jsonPath("$.id").value(primeiro));
        mvc.perform(comToken(patch("/itinerary/" + segundo + "/activate/" + outro.getId()), outro))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Avaliacao e data do roteiro sao gravadas e podem ser removidas")
    void avaliacaoEData() throws Exception {
        UserModel user = usuario(false);
        long id = gerar(user).get("id").asLong();

        mvc.perform(json(comToken(patch("/itinerary/" + id + "/rating"), user), Map.of("rating", 4, "ratingDescription", "Otimo")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4));
        mvc.perform(json(comToken(patch("/itinerary/" + id + "/rating"), user), Map.of("rating", 7)))
                .andExpect(status().isBadRequest());
        mvc.perform(json(comToken(patch("/itinerary/" + id + "/date"), user), Map.of("date", "2026-11-10")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date").value("2026-11-10"));
        mvc.perform(json(comToken(patch("/itinerary/" + id + "/date"), user), Map.of("date", "10/11/2026")))
                .andExpect(status().isBadRequest());
        mvc.perform(json(comToken(patch("/itinerary/999999999/rating"), user), Map.of("rating", 3)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Trocar uma parada mantem a posicao e grava o novo lugar")
    void trocarParada() throws Exception {
        UserModel user = usuario(false);
        JsonNode roteiro = gerar(user);
        long id = roteiro.get("id").asLong();
        int posicao = roteiro.get("places").get(0).get("orderIndex").asInt();

        Map<String, Object> novo = new HashMap<>();
        novo.put("name", "Lugar Novo");
        novo.put("address", "Via Nuova, 1");
        novo.put("latitude", 41.9);
        novo.put("longitude", 12.48);
        novo.put("estimatedVisitTime", "11:15");
        novo.put("category", "museum");
        JsonNode atualizado = corpo(mvc.perform(json(comToken(patch("/itinerary/" + id + "/place/" + posicao), user), novo))
                .andExpect(status().isOk())
                .andReturn());

        JsonNode parada = null;
        for (JsonNode p : atualizado.get("places")) {
            if (p.get("orderIndex").asInt() == posicao) parada = p;
        }
        assertEquals("Lugar Novo", parada.get("name").asText());
        assertEquals("11:15:00", parada.get("estimatedVisitTime").asText());

        mvc.perform(json(comToken(patch("/itinerary/" + id + "/place/999"), user), novo))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Anotacao pela API: o dono grava, outro usuario e quem nao esta logado sao recusados")
    void anotacao() throws Exception {
        UserModel user = usuario(false);
        UserModel outro = usuario(false);
        JsonNode roteiro = gerar(user);
        long id = roteiro.get("id").asLong();
        int posicao = roteiro.get("places").get(0).get("orderIndex").asInt();

        mvc.perform(json(comToken(patch("/itinerary/" + id + "/place/" + posicao + "/note"), user), Map.of("note", "Comprar ingresso")))
                .andExpect(status().isOk());
        mvc.perform(json(comToken(patch("/itinerary/" + id + "/place/" + posicao + "/note"), outro), Map.of("note", "Intruso")))
                .andExpect(status().isForbidden());
        mvc.perform(json(patch("/itinerary/" + id + "/place/" + posicao + "/note"), Map.of("note", "Sem login")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("O dono do roteiro vem do token: outro usuario nao le, nao gera e nao altera roteiro alheio")
    void donoVemDoToken() throws Exception {
        UserModel user = usuario(false);
        UserModel outro = usuario(false);
        long id = gerar(user).get("id").asLong();

        mvc.perform(comToken(get("/itinerary/active/" + user.getId()), outro)).andExpect(status().isForbidden());
        mvc.perform(comToken(get("/itinerary/all/" + user.getId()), outro)).andExpect(status().isForbidden());
        mvc.perform(comToken(post("/itinerary/mock/" + user.getId()), outro)).andExpect(status().isForbidden());
        mvc.perform(comToken(patch("/itinerary/" + id + "/activate/" + user.getId()), outro)).andExpect(status().isForbidden());
        mvc.perform(comToken(delete("/itinerary/" + id + "/user/" + user.getId()), outro)).andExpect(status().isForbidden());
        mvc.perform(json(comToken(patch("/itinerary/" + id + "/rating"), outro), Map.of("rating", 1)))
                .andExpect(status().isForbidden());
        mvc.perform(json(comToken(patch("/itinerary/" + id + "/date"), outro), Map.of("date", "2026-11-10")))
                .andExpect(status().isForbidden());
        Map<String, Object> parada = Map.of("name", "Intruso", "address", "Via, 1", "latitude", 41.9, "longitude", 12.48);
        mvc.perform(json(comToken(patch("/itinerary/" + id + "/place/0"), outro), parada))
                .andExpect(status().isForbidden());
        mvc.perform(get("/itinerary/active/" + user.getId())).andExpect(status().isUnauthorized());

        Map<String, Object> body = new HashMap<>();
        body.put("userId", user.getId());
        body.put("startLatitude", 41.8902);
        body.put("startLongitude", 12.4922);
        body.put("startDate", "2026-11-10");
        body.put("days", 1);
        body.put("pace", "LEVE");
        mvc.perform(json(comToken(post("/itinerary/generate"), outro), body)).andExpect(status().isForbidden());

        body.remove("userId");
        mvc.perform(json(comToken(post("/itinerary/generate"), outro), body)).andExpect(status().isOk());
        mvc.perform(comToken(get("/itinerary/all/" + outro.getId()), outro))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @DisplayName("So o dono apaga o roteiro")
    void apagar() throws Exception {
        UserModel user = usuario(false);
        UserModel outro = usuario(false);
        long id = gerar(user).get("id").asLong();

        mvc.perform(comToken(delete("/itinerary/" + id + "/user/" + outro.getId()), outro)).andExpect(status().isForbidden());
        mvc.perform(comToken(delete("/itinerary/" + id + "/user/" + user.getId()), user)).andExpect(status().isNoContent());
        mvc.perform(comToken(delete("/itinerary/" + id + "/user/" + user.getId()), user)).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("O roteiro de exemplo e criado ativo com quatro paradas")
    void roteiroDeExemplo() throws Exception {
        UserModel user = usuario(false);

        mvc.perform(comToken(post("/itinerary/mock/" + user.getId()), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.places.length()").value(4));
    }
}
