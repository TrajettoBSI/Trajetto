package com.trajetto.backend.itinerary.ai;

import com.trajetto.backend.itinerary.planning.TripPreferences;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PreferenceInterpreterTest {

    private static final com.trajetto.backend.itinerary.data.CityCatalog CATALOG =
            new com.trajetto.backend.itinerary.data.CityCatalog(new com.fasterxml.jackson.databind.ObjectMapper());
    private static final List<com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace> ROMA =
            CATALOG.placesOf(CATALOG.city("roma").orElseThrow());

    @Test
    @DisplayName("Pedido vazio nao muda nada; pedido com texto vira preferencias")
    void interpretaPedido() {
        PreferenceInterpreter interpreter = new PreferenceInterpreter();

        assertEquals(TripPreferences.NONE, interpreter.interpret("  ", ROMA));
        assertTrue(interpreter.interpret("mais museus", ROMA).moreCategories().contains("museum"));
    }

    @Test
    @DisplayName("Regras: acha o lugar pelo nome e o dia e o periodo pedidos para ele")
    void regrasAchamLugarDiaEPeriodo() {
        TripPreferences prefs = RuleBasedInterpreter.interpret(
                "coloca a fontana di trevi no último dia, na parte da manhã", ROMA);

        assertEquals(List.of(new TripPreferences.Placement("Fontana di Trevi", -1, "MANHA")), prefs.placements());
        assertTrue(prefs.mustInclude().isEmpty());
        assertTrue(prefs.moreCategories().isEmpty());
        assertTrue(prefs.summary().contains("Fontana di Trevi no último dia, de manhã"));
    }

    @Test
    @DisplayName("Regras: lugar pelo nome em portugues, para incluir ou tirar, sem confundir com categoria")
    void regrasIncluemETiramLugares() {
        TripPreferences prefs = RuleBasedInterpreter.interpret("quero ver o Coliseu, tira o Pantheon e mais museus", ROMA);

        assertEquals(List.of("Colosseo"), prefs.mustInclude());
        assertEquals(List.of("Pantheon"), prefs.exclude());
        assertTrue(prefs.moreCategories().contains("museum"));

        TripPreferences segundoDia = RuleBasedInterpreter.interpret("Trevi Fountain on day 2 in the afternoon", ROMA);
        assertEquals(List.of(new TripPreferences.Placement("Fontana di Trevi", 2, "TARDE")), segundoDia.placements());
    }

    @Test
    @DisplayName("Um pedido novo de horario para o mesmo lugar substitui o anterior e tira o lugar da lista de evitar")
    void novoHorarioSubstituiOAnterior() {
        TripPreferences antes = new TripPreferences(List.of(), List.of(), false, "", List.of(), List.of("Fontana di Trevi"),
                "", List.of(new TripPreferences.Placement("Colosseo", 1, "TARDE")));
        TripPreferences depois = antes.then(new TripPreferences(List.of(), List.of(), false, "", List.of(), List.of(), "",
                List.of(new TripPreferences.Placement("colosseo", 2, "MANHA"),
                        new TripPreferences.Placement("Fontana di Trevi", -1, "NOITE"))));

        assertEquals(2, depois.placements().size());
        assertEquals(2, depois.placements().get(0).day());
        assertTrue(depois.exclude().isEmpty());
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
