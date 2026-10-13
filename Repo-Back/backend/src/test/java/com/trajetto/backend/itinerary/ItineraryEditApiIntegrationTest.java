package com.trajetto.backend.itinerary;

import com.fasterxml.jackson.databind.JsonNode;
import com.trajetto.backend.support.ApiIntegrationTest;
import com.trajetto.backend.user.model.UserModel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ItineraryEditApiIntegrationTest extends ApiIntegrationTest {

    private JsonNode gerar(UserModel user, String inicio, int dias, String ritmo) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("startLatitude", 41.9009);
        body.put("startLongitude", 12.4833);
        body.put("startDate", inicio);
        body.put("days", dias);
        body.put("pace", ritmo);
        return corpo(mvc.perform(json(comToken(post("/itinerary/generate"), user), body))
                .andExpect(status().isOk())
                .andReturn());
    }

    private static List<JsonNode> paradas(JsonNode roteiro) {
        List<JsonNode> lista = new ArrayList<>();
        roteiro.get("places").forEach(lista::add);
        lista.sort((a, b) -> Integer.compare(a.get("orderIndex").asInt(), b.get("orderIndex").asInt()));
        return lista;
    }

    private static List<String> nomes(JsonNode roteiro) {
        return paradas(roteiro).stream().map(p -> p.get("name").asText()).toList();
    }

    @ParameterizedTest(name = "{0}, {1} dia(s), ritmo {2}")
    @CsvSource({
            "2026-11-09, 3, INTENSO",     // comeca numa segunda, dia de museu fechado em Roma
            "2026-11-09, 2, LEVE",
            "2026-12-24, 3, EQUILIBRADO", // vespera de Natal e Natal: horarios especiais
            "2027-01-01, 1, INTENSO",
    })
    @DisplayName("Nenhuma parada gerada cai num horario em que o lugar esta fechado")
    void respeitaHorarioDeFuncionamento(String inicio, int dias, String ritmo) throws Exception {
        JsonNode roteiro = gerar(usuario(false), inicio, dias, ritmo);

        assertFalse(paradas(roteiro).isEmpty());
        for (JsonNode parada : paradas(roteiro)) {
            assertNotEquals(false, parada.get("openAtVisit").isBoolean() ? parada.get("openAtVisit").asBoolean() : null,
                    parada.get("name").asText() + " em " + parada.get("visitDate").asText() + " "
                            + parada.get("estimatedVisitTime").asText() + " (" + parada.get("openingHours").asText() + ")");
        }
    }

    @Test
    @DisplayName("Tirar uma parada fecha o buraco na numeracao")
    void tirarParada() throws Exception {
        UserModel user = usuario(false);
        JsonNode roteiro = gerar(user, "2026-11-10", 1, "INTENSO");
        long id = roteiro.get("id").asLong();
        List<String> antes = nomes(roteiro);

        JsonNode depois = corpo(mvc.perform(comToken(delete("/itinerary/" + id + "/place/1"), user))
                .andExpect(status().isOk()).andReturn());

        List<String> esperado = new ArrayList<>(antes);
        esperado.remove(1);
        assertEquals(esperado, nomes(depois));
        for (int i = 0; i < esperado.size(); i++) {
            assertEquals(i, paradas(depois).get(i).get("orderIndex").asInt());
        }
        mvc.perform(comToken(delete("/itinerary/" + id + "/place/99"), user)).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Mover uma parada troca o lugar com a vizinha e mantem os horarios do dia")
    void moverParada() throws Exception {
        UserModel user = usuario(false);
        JsonNode roteiro = gerar(user, "2026-11-10", 1, "INTENSO");
        long id = roteiro.get("id").asLong();
        List<JsonNode> antes = paradas(roteiro);

        JsonNode depois = corpo(mvc.perform(comToken(patch("/itinerary/" + id + "/place/0/move").param("direction", "DOWN"), user))
                .andExpect(status().isOk()).andReturn());
        List<JsonNode> agora = paradas(depois);

        assertEquals(antes.get(1).get("name").asText(), agora.get(0).get("name").asText());
        assertEquals(antes.get(0).get("name").asText(), agora.get(1).get("name").asText());
        assertEquals(antes.get(0).get("estimatedVisitTime").asText(), agora.get(0).get("estimatedVisitTime").asText());
        assertEquals(antes.get(1).get("estimatedVisitTime").asText(), agora.get(1).get("estimatedVisitTime").asText());

        mvc.perform(comToken(patch("/itinerary/" + id + "/place/0/move").param("direction", "UP"), user))
                .andExpect(status().isBadRequest());
        mvc.perform(comToken(patch("/itinerary/" + id + "/place/0/move").param("direction", "LADO"), user))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Mover nao passa uma parada para outro dia")
    void moverNaoTrocaDeDia() throws Exception {
        UserModel user = usuario(false);
        JsonNode roteiro = gerar(user, "2026-11-10", 2, "LEVE");
        long id = roteiro.get("id").asLong();
        List<JsonNode> lista = paradas(roteiro);
        int ultimaDoPrimeiroDia = 0;
        while (lista.get(ultimaDoPrimeiroDia + 1).get("visitDate").asText().equals("2026-11-10")) ultimaDoPrimeiroDia++;

        mvc.perform(comToken(patch("/itinerary/" + id + "/place/" + ultimaDoPrimeiroDia + "/move").param("direction", "DOWN"), user))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Incluir um favorito: entra depois da ultima parada do dia e o catalogo completa os dados")
    void incluirLugar() throws Exception {
        UserModel user = usuario(false);
        JsonNode roteiro = gerar(user, "2026-11-10", 2, "LEVE");
        long id = roteiro.get("id").asLong();
        int total = roteiro.get("places").size();

        Map<String, Object> galleria = new HashMap<>();
        galleria.put("xid", "osm_galleria_borghese");
        galleria.put("name", "Galleria Borghese");
        galleria.put("address", "Piazzale Scipione Borghese, 5");
        galleria.put("latitude", 41.9142);
        galleria.put("longitude", 12.4921);
        galleria.put("visitDate", "2026-11-11");
        galleria.put("estimatedVisitTime", "11:00");

        JsonNode depois = corpo(mvc.perform(json(comToken(post("/itinerary/" + id + "/place"), user), galleria))
                .andExpect(status().isOk()).andReturn());

        assertEquals(total + 1, depois.get("places").size());
        JsonNode incluida = paradas(depois).stream().filter(p -> p.get("name").asText().equals("Galleria Borghese")).findFirst().orElseThrow();
        assertEquals("2026-11-11", incluida.get("visitDate").asText());
        assertEquals("11:00:00", incluida.get("estimatedVisitTime").asText());
        assertEquals("museum", incluida.get("category").asText());
        assertFalse(incluida.get("openingHours").isNull());
        assertTrue(incluida.get("bookingUrl").asText().startsWith("https://"));

        Map<String, Object> semHorario = new HashMap<>(galleria);
        semHorario.remove("estimatedVisitTime");
        semHorario.put("name", "Lugar Sem Catalogo");
        semHorario.remove("xid");
        semHorario.put("visitDate", "2026-11-10");
        JsonNode comNovo = corpo(mvc.perform(json(comToken(post("/itinerary/" + id + "/place"), user), semHorario))
                .andExpect(status().isOk()).andReturn());
        List<JsonNode> doDia = paradas(comNovo).stream().filter(p -> p.get("visitDate").asText().equals("2026-11-10")).toList();
        assertEquals("Lugar Sem Catalogo", doDia.get(doDia.size() - 1).get("name").asText());

        semHorario.put("visitDate", "2026-12-01");
        mvc.perform(json(comToken(post("/itinerary/" + id + "/place"), user), semHorario))
                .andExpect(status().isBadRequest());
        mvc.perform(json(comToken(post("/itinerary/" + id + "/place"), user), Map.of("name", "")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("So o dono edita as paradas do roteiro")
    void soODonoEdita() throws Exception {
        UserModel user = usuario(false);
        UserModel outro = usuario(false);
        long id = gerar(user, "2026-11-10", 1, "LEVE").get("id").asLong();

        mvc.perform(comToken(delete("/itinerary/" + id + "/place/0"), outro)).andExpect(status().isForbidden());
        mvc.perform(comToken(patch("/itinerary/" + id + "/place/0/move").param("direction", "DOWN"), outro))
                .andExpect(status().isForbidden());
        mvc.perform(json(comToken(post("/itinerary/" + id + "/place"), outro),
                        Map.of("name", "Intruso", "latitude", 41.9, "longitude", 12.48)))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/itinerary/" + id + "/place/0")).andExpect(status().isUnauthorized());
    }
}
