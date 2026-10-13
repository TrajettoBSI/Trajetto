package com.trajetto.backend.touristSpots;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiException;
import com.trajetto.backend.exception.ResourceNotFoundException;
import com.trajetto.backend.touristSpots.dto.TouristSpotDTO;
import com.trajetto.backend.touristSpots.service.OverpassService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OverpassServiceTest {

    private static final String NOMINATIM = "https://nominatim.openstreetmap.org/search?q=Rio+de+Janeiro&format=json&limit=1";
    private static final String OVERPASS = "https://overpass.kumi.systems/api/interpreter";

    private MockRestServiceServer server;
    private OverpassService service;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        service = new OverpassService(builder, new ObjectMapper());
    }

    @Test
    @DisplayName("Busca por cidade: acha as coordenadas no Nominatim e os pontos no Overpass")
    void buscaPorCidade() {
        server.expect(requestTo(NOMINATIM))
                .andRespond(withSuccess("[{\"lat\":\"-22.9068\",\"lon\":\"-43.1729\"}]", MediaType.APPLICATION_JSON));
        server.expect(requestTo(OVERPASS))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("""
                        {"elements":[
                          {"id":1,"lat":-22.95,"lon":-43.21,"tags":{"name":"Cristo Redentor","tourism":"attraction"}},
                          {"id":2,"lat":-22.94,"lon":-43.18,"tags":{"historic":"monument"}},
                          {"id":3,"lat":-22.93,"lon":-43.17}
                        ]}
                        """, MediaType.APPLICATION_JSON));

        List<TouristSpotDTO> pontos = service.searchByCity("Rio de Janeiro", 5000);

        assertEquals(3, pontos.size());
        assertEquals("osm_1", pontos.get(0).xid());
        assertEquals("Cristo Redentor", pontos.get(0).name());
        assertEquals("attraction", pontos.get(0).kinds());
        assertEquals("Sem nome", pontos.get(1).name());
        assertEquals("monument", pontos.get(1).kinds());
        assertEquals("interesting_places", pontos.get(2).kinds());
        server.verify();
    }

    @Test
    @DisplayName("Cidade que o Nominatim nao conhece responde recurso nao encontrado")
    void cidadeDesconhecida() {
        server.expect(requestTo(NOMINATIM)).andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        assertThrows(ResourceNotFoundException.class, () -> service.searchByCity("Rio de Janeiro", 5000));
    }

    @Test
    @DisplayName("Falha no Nominatim ou no Overpass vira erro de servico externo")
    void servicosForaDoAr() {
        server.expect(requestTo(NOMINATIM)).andRespond(withServerError());
        ApiException erro = assertThrows(ApiException.class, () -> service.getCityCoordinates("Rio de Janeiro"));
        assertEquals(ApiErrorCode.EXTERNAL_SERVICE_ERROR, erro.getErrorCode());

        server.reset();
        server.expect(requestTo(OVERPASS)).andRespond(withServerError());
        erro = assertThrows(ApiException.class, () -> service.getTouristSpots(-22.9, -43.1, 1000));
        assertEquals(ApiErrorCode.EXTERNAL_SERVICE_ERROR, erro.getErrorCode());
    }

    @Test
    @DisplayName("Resposta do Overpass sem elementos devolve lista vazia")
    void semElementos() {
        server.expect(requestTo(OVERPASS)).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        assertTrue(service.getTouristSpots(-22.9, -43.1, 1000).isEmpty());
    }
}
