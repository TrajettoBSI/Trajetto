package com.trajetto.backend.routing;

import com.trajetto.backend.exception.ApiException;
import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.routing.dto.CoordinateDTO;
import com.trajetto.backend.routing.dto.RouteRequestDTO;
import com.trajetto.backend.routing.service.RouteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.web.client.MockServerRestTemplateCustomizer;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class RouteServiceTest {

    private static final String ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

    private MockRestServiceServer server;
    private RouteService service;

    @BeforeEach
    void setUp() {
        MockServerRestTemplateCustomizer customizer = new MockServerRestTemplateCustomizer();
        service = new RouteService(new RestTemplateBuilder(customizer), "chave-de-teste");
        server = customizer.getServer();
    }

    private static CoordinateDTO ponto(double lat, double lng) {
        CoordinateDTO c = new CoordinateDTO();
        c.lat = lat;
        c.lng = lng;
        return c;
    }

    private static RouteRequestDTO pedido() {
        RouteRequestDTO req = new RouteRequestDTO();
        req.origin = ponto(41.90, 12.48);
        req.destination = ponto(41.89, 12.49);
        req.waypoints = List.of(ponto(41.895, 12.485));
        return req;
    }

    @Test
    @DisplayName("Envia origem, paradas e destino como longitude/latitude e devolve geometria, distancia e duracao")
    void calculaRota() {
        server.expect(requestTo(ORS_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "chave-de-teste"))
                .andExpect(jsonPath("$.coordinates.length()").value(3))
                .andExpect(jsonPath("$.coordinates[0][0]").value(12.48))
                .andRespond(withSuccess("""
                        {"routes":[{"geometry":"abc123","summary":{"distance":1500.5,"duration":300.2},"way_points":[0,4,9]}]}
                        """, MediaType.APPLICATION_JSON));

        Map<String, Object> rota = service.getRoute(pedido());

        assertEquals("abc123", rota.get("geometry"));
        assertEquals(1500.5, rota.get("distance"));
        assertEquals(300.2, rota.get("duration"));
        assertEquals(List.of(0, 4, 9), rota.get("wayPoints"));
        server.verify();
    }

    @Test
    @DisplayName("A mesma rota pedida de novo vem do cache, sem gastar consulta do OpenRouteService")
    void rotaRepetidaVemDoCache() {
        server.expect(ExpectedCount.once(), requestTo(ORS_URL)).andRespond(withSuccess("""
                {"routes":[{"geometry":"abc123","summary":{"distance":1500.5,"duration":300.2},"way_points":[0,4,9]}]}
                """, MediaType.APPLICATION_JSON));

        Map<String, Object> primeira = service.getRoute(pedido());
        Map<String, Object> segunda = service.getRoute(pedido());

        assertEquals(primeira, segunda);
        server.verify();
    }

    @Test
    @DisplayName("Limite de consultas do OpenRouteService vira erro de servico externo")
    void limiteDeConsultas() {
        server.expect(requestTo(ORS_URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));

        ApiException erro = assertThrows(ApiException.class, () -> service.getRoute(pedido()));
        assertEquals(ApiErrorCode.EXTERNAL_SERVICE_ERROR, erro.getErrorCode());
    }

    @Test
    @DisplayName("Servico de rotas fora do ar vira erro de servico externo")
    void servicoForaDoAr() {
        server.expect(requestTo(ORS_URL)).andRespond(withServerError());

        ApiException erro = assertThrows(ApiException.class, () -> service.getRoute(pedido()));
        assertEquals(ApiErrorCode.EXTERNAL_SERVICE_ERROR, erro.getErrorCode());
    }

    @Test
    @DisplayName("Resposta sem nenhum trajeto vira erro de servico externo")
    void semTrajeto() {
        server.expect(requestTo(ORS_URL)).andRespond(withSuccess("{\"routes\":[]}", MediaType.APPLICATION_JSON));

        ApiException erro = assertThrows(ApiException.class, () -> service.getRoute(pedido()));
        assertEquals(ApiErrorCode.EXTERNAL_SERVICE_ERROR, erro.getErrorCode());
    }
}
