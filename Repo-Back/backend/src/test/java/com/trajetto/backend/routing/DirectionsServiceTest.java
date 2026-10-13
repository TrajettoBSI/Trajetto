package com.trajetto.backend.routing;

import com.trajetto.backend.routing.dto.CoordinateDTO;
import com.trajetto.backend.routing.dto.DirectionsRequestDTO;
import com.trajetto.backend.routing.dto.DirectionsResponseDTO;
import com.trajetto.backend.routing.dto.DirectionsResponseDTO.Mode;
import com.trajetto.backend.routing.service.DirectionsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.web.client.MockServerRestTemplateCustomizer;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class DirectionsServiceTest {

    private static final String ORS = "https://api.openrouteservice.org/v2/directions/";

    private MockRestServiceServer server;
    private DirectionsService service;

    @BeforeEach
    void setUp() {
        MockServerRestTemplateCustomizer customizer = new MockServerRestTemplateCustomizer();
        service = new DirectionsService(new RestTemplateBuilder(customizer), "chave-de-teste");
        server = customizer.getServer();
    }

    private static CoordinateDTO ponto(double lat, double lng) {
        CoordinateDTO c = new CoordinateDTO();
        c.lat = lat;
        c.lng = lng;
        return c;
    }

    private static DirectionsRequestDTO trecho(CoordinateDTO origem, CoordinateDTO destino, int hora) {
        DirectionsRequestDTO req = new DirectionsRequestDTO();
        req.origin = origem;
        req.destination = destino;
        req.language = "en";
        req.hour = hora;
        return req;
    }

    private static String rota(double distancia, double duracao) {
        return """
                {"routes":[{"geometry":"abc","summary":{"distance":%s,"duration":%s},
                  "segments":[{"steps":[
                    {"instruction":"Head north on Via del Corso","distance":300.0,"duration":216.0},
                    {"instruction":"Arrive at destination","distance":0,"duration":0}]}]}]}
                """.formatted(distancia, duracao);
    }

    @Test
    @DisplayName("Perto: calcula a pe e de carro com as instrucoes, nao oferece metro e recomenda ir a pe")
    void pertoVaiAPe() {
        server.expect(requestTo(ORS + "foot-walking"))
                .andExpect(header("Authorization", "chave-de-teste"))
                .andExpect(jsonPath("$.language").value("en"))
                .andExpect(jsonPath("$.instructions").value(true))
                .andExpect(jsonPath("$.coordinates[0][0]").value(12.4833))
                .andRespond(withSuccess(rota(700, 520), MediaType.APPLICATION_JSON));
        server.expect(requestTo(ORS + "driving-car"))
                .andRespond(withSuccess(rota(900, 180), MediaType.APPLICATION_JSON));

        DirectionsResponseDTO r = service.directions(trecho(ponto(41.9009, 12.4833), ponto(41.8986, 12.4769), 10));

        assertEquals(Mode.WALK, r.recommended());
        assertEquals(700, r.walking().distance());
        assertEquals("Head north on Via del Corso", r.walking().steps().get(0).instruction());
        assertEquals(2, r.walking().steps().size());
        assertFalse(r.walking().estimated());
        assertEquals("abc", r.driving().geometry());
        assertNull(r.transit());
        server.verify();
    }

    @Test
    @DisplayName("Longe de dia: recomenda transporte publico, com tempo estimado")
    void longeDeDiaVaiDeMetro() {
        server.expect(requestTo(ORS + "foot-walking")).andRespond(withSuccess(rota(4200, 3100), MediaType.APPLICATION_JSON));
        server.expect(requestTo(ORS + "driving-car")).andRespond(withSuccess(rota(5000, 900), MediaType.APPLICATION_JSON));

        DirectionsResponseDTO r = service.directions(trecho(ponto(41.9029, 12.4534), ponto(41.8902, 12.4922), 14));

        assertEquals(Mode.TRANSIT, r.recommended());
        assertTrue(r.transit().estimated());
        assertEquals(10 * 60 + 5000 / (18 / 3.6), r.transit().duration(), 0.5);
    }

    @Test
    @DisplayName("Longe de madrugada: recomenda carro/app de transporte")
    void deMadrugadaVaiDeCarro() {
        server.expect(requestTo(ORS + "foot-walking")).andRespond(withSuccess(rota(4200, 3100), MediaType.APPLICATION_JSON));
        server.expect(requestTo(ORS + "driving-car")).andRespond(withSuccess(rota(5000, 900), MediaType.APPLICATION_JSON));

        assertEquals(Mode.CAR, service.directions(trecho(ponto(41.9029, 12.4534), ponto(41.8902, 12.4922), 23)).recommended());
    }

    @Test
    @DisplayName("Muito longe recomenda carro mesmo de dia")
    void muitoLongeVaiDeCarro() {
        server.expect(requestTo(ORS + "foot-walking")).andRespond(withSuccess(rota(15000, 11000), MediaType.APPLICATION_JSON));
        server.expect(requestTo(ORS + "driving-car")).andRespond(withSuccess(rota(16000, 1500), MediaType.APPLICATION_JSON));

        assertEquals(Mode.CAR, service.directions(trecho(ponto(41.9, 12.45), ponto(41.8, 12.6), 12)).recommended());
    }

    @Test
    @DisplayName("Servico de rotas fora do ar: a navegacao continua com estimativa pela distancia")
    void semServicoDeRotas() {
        server.expect(requestTo(ORS + "foot-walking")).andRespond(withServerError());
        server.expect(requestTo(ORS + "driving-car")).andRespond(withSuccess("{\"routes\":[]}", MediaType.APPLICATION_JSON));

        DirectionsResponseDTO r = service.directions(trecho(ponto(41.9009, 12.4833), ponto(41.8902, 12.4922), 10));

        assertTrue(r.walking().estimated());
        assertTrue(r.driving().estimated());
        assertTrue(r.walking().steps().isEmpty());
        assertTrue(r.walking().distance() > 1400 && r.walking().distance() < 2000, String.valueOf(r.walking().distance()));
    }
}
