package com.trajetto.backend.weather;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class WeatherServiceTest {

    private static final LocalDate HOJE = LocalDate.of(2026, 11, 2);
    private static final Clock RELOGIO = Clock.fixed(HOJE.atStartOfDay(ZoneId.of("UTC")).toInstant(), ZoneId.of("UTC"));
    private static final String RESPOSTA = """
            {"daily": {
              "time": ["2026-11-03", "2026-11-04"],
              "weather_code": [63, 1],
              "temperature_2m_max": [15.2, 21.0],
              "temperature_2m_min": [10.1, 12.4],
              "precipitation_probability_max": [90, 5]
            }}""";

    private RestTemplate restTemplate;
    private MockRestServiceServer server;
    private WeatherService service;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        server = MockRestServiceServer.bindTo(restTemplate).build();
        service = new WeatherService(restTemplate, true, "https://api.open-meteo.com/v1/forecast", RELOGIO);
    }

    @Test
    @DisplayName("Le a previsao diaria e marca como chuvoso o dia de chuva com alta probabilidade")
    void lePrevisao() {
        server.expect(once(), queryParam("start_date", "2026-11-03"))
                .andRespond(withSuccess(RESPOSTA, MediaType.APPLICATION_JSON));

        Map<LocalDate, DayWeather> dias = service.forecast(41.9, 12.5, HOJE.plusDays(1), HOJE.plusDays(2));

        assertEquals(2, dias.size());
        assertTrue(dias.get(HOJE.plusDays(1)).rainy());
        assertFalse(dias.get(HOJE.plusDays(2)).rainy());
        assertEquals(21.0, dias.get(HOJE.plusDays(2)).maxTemperature());
    }

    @Test
    @DisplayName("Pede so os dias dentro da janela de 16 dias e reaproveita a resposta guardada")
    void recortaAJanelaEGuarda() {
        server.expect(once(), queryParam("end_date", HOJE.plusDays(15).toString()))
                .andRespond(withSuccess(RESPOSTA, MediaType.APPLICATION_JSON));

        service.forecast(41.9, 12.5, HOJE.plusDays(1), HOJE.plusDays(40));
        service.forecast(41.9, 12.5, HOJE.plusDays(1), HOJE.plusDays(40));

        server.verify();
    }

    @Test
    @DisplayName("Viagem fora da janela da previsao nem chama o servico")
    void foraDaJanela() {
        assertTrue(service.forecast(41.9, 12.5, HOJE.plusDays(30), HOJE.plusDays(32)).isEmpty());
        assertTrue(service.forecast(41.9, 12.5, HOJE.minusDays(5), HOJE.minusDays(2)).isEmpty());
        server.verify();
    }

    @Test
    @DisplayName("Falha do servico vira 'sem previsao': o roteiro e gerado mesmo assim")
    void falhaViraSemPrevisao() {
        server.expect(once(), queryParam("latitude", "41.9"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        assertTrue(service.forecast(41.9, 12.5, HOJE, HOJE.plusDays(1)).isEmpty());
    }

    @Test
    @DisplayName("Desligada por configuracao, nao consulta nada")
    void desligada() {
        WeatherService off = new WeatherService(restTemplate, false, "http://x", RELOGIO);

        assertTrue(off.forecast(41.9, 12.5, HOJE, HOJE.plusDays(1)).isEmpty());
        server.verify();
    }
}
