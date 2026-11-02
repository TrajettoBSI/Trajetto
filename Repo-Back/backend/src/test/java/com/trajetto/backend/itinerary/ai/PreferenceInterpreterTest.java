package com.trajetto.backend.itinerary.ai;

import com.trajetto.backend.itinerary.ai.PreferenceInterpreter.Interpretation;
import com.trajetto.backend.itinerary.ai.PreferenceInterpreter.Source;
import com.trajetto.backend.itinerary.planning.TripPreferences;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PreferenceInterpreterTest {

    @Test
    @DisplayName("Sem chave da API, o pedido e interpretado pelas regras")
    void semChaveUsaAsRegras() {
        PreferenceInterpreter interpreter = new PreferenceInterpreter("");

        Interpretation result = interpreter.interpret("mais museus", "Roma", List.of());

        assertFalse(interpreter.aiEnabled());
        assertEquals(Source.REGRAS, result.source());
        assertTrue(result.preferences().moreCategories().contains("museum"));
    }

    @Test
    @DisplayName("Regras: 'menos igrejas, mais museus e so coisas gratis' separa o que sobe, o que desce e o preco")
    void regrasSeparamPositivoENegativo() {
        TripPreferences prefs = RuleBasedInterpreter.interpret("Menos igrejas, mais museus e só coisas grátis");

        assertTrue(prefs.lessCategories().contains("historic_church"));
        assertTrue(prefs.moreCategories().contains("museum"));
        assertFalse(prefs.moreCategories().contains("historic_church"));
        assertTrue(prefs.avoidPaid());
        assertFalse(prefs.summary().isBlank());
    }

    @Test
    @DisplayName("Regras: 'mais barato' nao vira 'mais bares', e 'com calma' vira o ritmo leve")
    void regrasNaoConfundemPalavras() {
        TripPreferences prefs = RuleBasedInterpreter.interpret("quero algo mais barato e com calma");

        assertFalse(prefs.moreCategories().contains("bar"));
        assertTrue(prefs.avoidPaid());
        assertEquals("LEVE", prefs.pace());
    }

    @Test
    @DisplayName("Regras entendem ingles e espanhol: 'fewer churches, more parks' e 'sin iglesias'")
    void regrasEmOutrosIdiomas() {
        TripPreferences en = RuleBasedInterpreter.interpret("fewer churches, more parks");
        assertTrue(en.moreCategories().contains("park"));
        assertTrue(en.lessCategories().contains("historic_church"));
        assertTrue(RuleBasedInterpreter.interpret("without churches").lessCategories().contains("historic_church"));
        assertTrue(RuleBasedInterpreter.interpret("sin iglesias").lessCategories().contains("historic_church"));
    }

    @Test
    @DisplayName("A resposta da IA passa por um filtro: categoria inventada e ritmo invalido sao descartados")
    void saidaDaIaESanitizada() {
        TripPreferences raw = new TripPreferences(List.of("museum", "disco"), List.of("historic_church"), false,
                "RAPIDO", List.of("Coliseu"), List.of(), "");

        TripPreferences clean = PreferenceInterpreter.sanitize(raw);

        assertEquals(List.of("museum"), clean.moreCategories());
        assertEquals("", clean.pace());
        assertEquals(List.of("Coliseu"), clean.mustInclude());
        assertFalse(clean.summary().isBlank(), "sem resumo da IA, o resumo vem das regras");
    }

    @Test
    @DisplayName("Pedidos se acumulam e o mais recente vence: 'mais igrejas' depois de 'sem igrejas'")
    void pedidosSeAcumulam() {
        TripPreferences primeiro = new TripPreferences(List.of("museum"), List.of("historic_church"), false,
                "", List.of(), List.of(), "");
        TripPreferences segundo = new TripPreferences(List.of("historic_church"), List.of(), true,
                "LEVE", List.of(), List.of(), "ok");

        TripPreferences juntos = primeiro.then(segundo);

        assertEquals(List.of("museum", "historic_church"), juntos.moreCategories());
        assertTrue(juntos.lessCategories().isEmpty());
        assertTrue(juntos.avoidPaid());
        assertEquals("LEVE", juntos.pace());
    }
}
