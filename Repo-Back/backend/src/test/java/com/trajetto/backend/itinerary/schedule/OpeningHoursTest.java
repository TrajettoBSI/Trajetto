package com.trajetto.backend.itinerary.schedule;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.itinerary.schedule.OpeningHours.Status;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.io.InputStream;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OpeningHoursTest {

    private static final Duration UMA_HORA = Duration.ofHours(1);

    /** 2026-11-09 e uma segunda-feira. */
    private static Status em(String horario, String data, String hora) {
        return OpeningHours.statusAt(horario, LocalDate.parse(data), LocalTime.parse(hora), UMA_HORA);
    }

    @ParameterizedTest(name = "{0} em {1} {2} -> {3}")
    @CsvSource(delimiter = '|', value = {
            // dias da semana e folga semanal
            "Tu-Su 09:00-19:00; Mo off         | 2026-11-09 | 10:00 | CLOSED",
            "Tu-Su 09:00-19:00; Mo off         | 2026-11-10 | 10:00 | OPEN",
            "Tu-Su 09:00-19:00; Mo off         | 2026-11-10 | 18:30 | CLOSED",
            "Mo-Fr 09:00-19:15;Sa off;Su off;PH off | 2026-11-14 | 10:00 | CLOSED",
            "Mo-Fr 09:00-19:15;Sa off;Su off;PH off | 2026-11-13 | 10:00 | OPEN",
            "Th-Tu 09:00-12:00,14:00-17:00     | 2026-11-11 | 10:00 | CLOSED",
            "Th-Tu 09:00-12:00,14:00-17:00     | 2026-11-09 | 10:00 | OPEN",
            "Th-Tu 09:00-12:00,14:00-17:00     | 2026-11-09 | 11:30 | CLOSED",
            "Th-Tu 09:00-12:00,14:00-17:00     | 2026-11-09 | 14:00 | OPEN",
            // dia sem regra fica fechado, como no OSM
            "Mo-Sa 09:00-18:00                 | 2026-11-15 | 10:00 | CLOSED",
            // regras separadas por virgula
            "Mo-Sa 08:15-17:45,Su 08:45-17:15  | 2026-11-15 | 09:00 | OPEN",
            "Tu-Fr, Su 11:00-19:00; Sa 11:00-22:00 | 2026-11-15 | 12:00 | OPEN",
            "Tu-Fr, Su 11:00-19:00; Sa 11:00-22:00 | 2026-11-09 | 12:00 | CLOSED",
            // passando da meia-noite
            "Mo-Su 11:00-02:00                 | 2026-11-09 | 21:00 | OPEN",
            "Mo-Su 12:00-24:00                 | 2026-11-09 | 21:00 | OPEN",
            "Mo-Su 11:00-00:00                 | 2026-11-09 | 21:00 | OPEN",
            "Mo-Sa 08:00-17:00+                | 2026-11-09 | 21:00 | OPEN",
            "Mo-Su 06:30-sunset                | 2026-11-09 | 21:00 | CLOSED",
            // a regra posterior substitui a anterior no mesmo dia
            "Mo-Su 09:00-19:45; Mo off         | 2026-11-09 | 10:00 | CLOSED",
            "Mo off; Tu-Su 09:00-14:00         | 2026-11-10 | 10:00 | OPEN",
            // datas especiais
            "Tu-Su 09:00-19:00; Dec 24,31 09:00-14:00; Mo off; Dec 25 off | 2026-12-31 | 15:00 | CLOSED",
            "Tu-Su 09:00-19:00; Dec 24,31 09:00-14:00; Mo off; Dec 25 off | 2026-12-31 | 10:00 | OPEN",
            "Tu-Su 09:00-19:00; Dec 24,31 09:00-14:00; Mo off; Dec 25 off | 2026-12-25 | 10:00 | CLOSED",
            "Tu-Su 09:30-19:30; Mo, Jan 1, Dec 25 off | 2026-12-25 | 10:00 | CLOSED",
            "Tu-Su 09:30-19:30; Mo, Jan 1, Dec 25 off | 2026-11-09 | 10:00 | CLOSED",
            "Tu-Su 09:30-19:30; Mo, Jan 1, Dec 25 off | 2026-11-10 | 10:00 | OPEN",
            // temporadas
            "Oct-May: Tu-Su 10:00-16:00; Jun-Sep: Tu-Su 13:00-19:00 | 2026-11-10 | 17:00 | CLOSED",
            "Oct-May: Tu-Su 10:00-16:00; Jun-Sep: Tu-Su 13:00-19:00 | 2026-07-14 | 17:00 | OPEN",
            "Oct-Mar 08:15-18:00; Apr-Sep 08:15-19:00 | 2026-01-10 | 17:30 | CLOSED",
            "Oct-Mar 08:15-18:00; Apr-Sep 08:15-19:00 | 2026-06-10 | 17:30 | OPEN",
            "Jan 02-Feb 15,Oct 28-Dec 31 08:30-16:30; Mar 16-24 08:30-17:30; Mar 25-Aug 31 08:30-19:15 | 2026-11-10 | 16:00 | CLOSED",
            "Jan 02-Feb 15,Oct 28-Dec 31 08:30-16:30; Mar 16-24 08:30-17:30; Mar 25-Aug 31 08:30-19:15 | 2026-03-20 | 16:00 | OPEN",
            // sem dia da semana: vale todo dia
            "09:00-19:00                       | 2026-11-15 | 10:00 | OPEN",
            "07:00-12:00,16:00-19:00           | 2026-11-15 | 13:00 | CLOSED",
            // casos extremos
            "24/7                              | 2026-11-15 | 03:00 | OPEN",
            "closed                            | 2026-11-15 | 10:00 | CLOSED",
            // o que nao da para afirmar vira duvida, nunca um "fechado" inventado
            "\"on appointment\"                | 2026-11-15 | 10:00 | UNKNOWN",
            "08:30-(sunset-01:00)              | 2026-11-15 | 10:00 | UNKNOWN",
            "Tu 14:00-17:00, Fr 11:00-14:00 \"by appointment\" | 2026-11-09 | 10:00 | UNKNOWN",
    })
    void interpretaHorarios(String horario, String data, String hora, Status esperado) {
        assertEquals(esperado, em(horario, data, hora));
    }

    @Test
    @DisplayName("Sem horario cadastrado a resposta e duvida")
    void semHorario() {
        assertEquals(Status.UNKNOWN, em(null, "2026-11-09", "10:00"));
        assertEquals(Status.UNKNOWN, em("  ", "2026-11-09", "10:00"));
    }

    @Test
    @DisplayName("A visita inteira precisa caber no horario: chegar 30 min antes de fechar nao serve")
    void visitaInteira() {
        assertEquals(Status.OPEN, OpeningHours.statusAt("09:00-19:00", LocalDate.parse("2026-11-09"),
                LocalTime.parse("18:30"), Duration.ofMinutes(30)));
        assertEquals(Status.CLOSED, OpeningHours.statusAt("09:00-19:00", LocalDate.parse("2026-11-09"),
                LocalTime.parse("18:30"), Duration.ofMinutes(60)));
    }

    @Test
    @DisplayName("Separa regras na virgula so quando ela comeca uma regra nova")
    void separaRegras() {
        assertEquals(List.of("Mo-Sa 10:00-12:30, 16:30-18:00", "Su 11:30-12:30"),
                OpeningHours.splitRules("Mo-Sa 10:00-12:30, 16:30-18:00; Su 11:30-12:30"));
        assertEquals(List.of("Mo-Fr 10:00-19:00", "Su 10:00-19:00", "Sa 10:00-20:00"),
                OpeningHours.splitRules("Mo-Fr 10:00-19:00, Su 10:00-19:00; Sa 10:00-20:00"));
        assertEquals(List.of("Jan 01,May 01,Dec 25 off"),
                OpeningHours.splitRules("Jan 01,May 01,Dec 25 off"));
    }

    @Test
    @DisplayName("Todo horario do catalogo de Roma e lido sem erro, e a grande maioria tem resposta certa")
    void catalogoInteiro() throws Exception {
        JsonNode root;
        try (InputStream in = getClass().getResourceAsStream("/data/cities/roma.geojson")) {
            root = new ObjectMapper().readTree(in);
        }
        int comHorario = 0;
        int comResposta = 0;
        for (JsonNode feature : root.get("features")) {
            String horario = feature.get("properties").path("opening_hours").asText("");
            if (horario.isBlank()) continue;
            comHorario++;
            for (int dia = 9; dia <= 15; dia++) {
                LocalDate data = LocalDate.of(2026, 11, dia);
                Status status = assertDoesNotThrow(() -> OpeningHours.statusAt(horario, data, LocalTime.of(10, 0), UMA_HORA),
                        horario);
                if (dia == 10 && status != Status.UNKNOWN) comResposta++;
            }
        }
        assertTrue(comHorario > 300);
        assertTrue(comResposta >= comHorario * 0.9, comResposta + " de " + comHorario);
    }
}
