package com.trajetto.backend.itinerary.ai;

import com.trajetto.backend.itinerary.planning.TripPreferences;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PreferenceInterpreterTest {

    private static final com.trajetto.backend.itinerary.data.CityCatalog CATALOG =
            new com.trajetto.backend.itinerary.data.CityCatalog(new com.fasterxml.jackson.databind.ObjectMapper());
    private static final List<com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace> ROMA =
            CATALOG.placesOf(CATALOG.city("roma").orElseThrow());

    /** Os textos de assistant.suggestions e assistant.smart nos arquivos de idioma do app. */
    private static final List<String> SUGESTOES_DO_APP = List.of(
            "Menos igrejas, mais museus", "Quero um ritmo mais tranquilo", "Só lugares gratuitos", "Mais natureza e mirantes",
            "Mais vida noturna", "Quero mais história", "Menos caminhada", "Mais lugares cobertos", "Pode incluir lugares pagos",
            "Fewer churches, more museums", "I want a calmer pace", "Free places only", "More nature and viewpoints",
            "More nightlife", "I want more history", "Less walking", "More indoor places", "Paid places are fine",
            "Menos iglesias, más museos", "Quiero un ritmo más tranquilo", "Solo lugares gratuitos", "Más naturaleza y miradores",
            "Más vida nocturna", "Quiero más historia", "Menos caminata", "Más lugares cubiertos", "Pueden ser lugares de pago");

    @Test
    @DisplayName("Horario exato: trocar a hora nao tira o lugar do roteiro")
    void horarioExato() {
        List<com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace> atenas = CATALOG.placesOf(CATALOG.city("atenas").orElseThrow());
        Map<String, Integer> pedidos = Map.of(
                "troca a biblioteca de adriano para as 15:30", 0,
                "muda a biblioteca de adriano para 15:30 no terceiro dia", 3,
                "no terceiro dia, biblioteca de adriano esta para as 09h, troca para 15:30", 3,
                "quero a biblioteca de adriano as 15h30", 0,
                "bibliotece de adriano as 3:30 pm no dia 3", 3);
        pedidos.forEach((pedido, dia) -> {
            TripPreferences prefs = new PreferenceInterpreter().interpret(pedido, atenas);
            assertTrue(prefs.exclude().isEmpty(), pedido);
            assertEquals(List.of(new TripPreferences.Placement("Hadrian's Library", dia, "", "15:30")), prefs.placements(), pedido);
        });
        assertEquals("15:00", new PreferenceInterpreter().interpret("biblioteca de adriano as 3 da tarde", atenas).placements().get(0).time());
        assertTrue(new PreferenceInterpreter().interpret("troca a biblioteca de adriano pelo arco de adriano", atenas).exclude().contains("Hadrian's Library"));
    }

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
    @DisplayName("A negacao vale para a lista e para os jeitos comuns de recusar, nos tres idiomas")
    void negacoes() {
        for (String pedido : List.of("menos igrejas e museus", "sem igrejas, museus", "detesto igrejas e museus",
                "nao curto igrejas e museus", "cansei de igrejas e museus", "no churches or museums, no museums", "no iglesias, no museos")) {
            TripPreferences prefs = RuleBasedInterpreter.interpret(pedido, ROMA);
            assertTrue(prefs.lessCategories().containsAll(List.of("historic_church", "museum")), pedido + ": " + prefs);
            assertTrue(prefs.moreCategories().isEmpty(), pedido + ": " + prefs);
        }
        for (String pedido : List.of("igrejas nao", "nao quero mais igrejas", "no more churches", "no mas iglesias")) {
            assertEquals(List.of("historic_church"), RuleBasedInterpreter.interpret(pedido, ROMA).lessCategories(), pedido);
        }
    }

    @Test
    @DisplayName("O 'mas', o 'mais' e a negacao dupla voltam ao positivo")
    void voltaAoPositivo() {
        for (String pedido : List.of("menos igrejas mas museus", "quero museus sem igrejas", "menos igrejas mais museus",
                "more museums and fewer churches", "museus em vez de igrejas", "em vez de igrejas, museus", "troca igrejas por museus")) {
            TripPreferences prefs = RuleBasedInterpreter.interpret(pedido, ROMA);
            assertEquals(List.of("museum"), prefs.moreCategories(), pedido);
            assertEquals(List.of("historic_church"), prefs.lessCategories(), pedido);
        }
        assertEquals(List.of("museum"), RuleBasedInterpreter.interpret("nao tira os museus", ROMA).moreCategories());
    }

    @Test
    @DisplayName("Palavras parecidas nao viram pedido: sem pressa, tirar fotos, me leve, sexta-feira, publico, reservar")
    void naoConfundePalavras() {
        TripPreferences semPressa = RuleBasedInterpreter.interpret("museus sem pressa", ROMA);
        assertEquals(List.of("museum"), semPressa.moreCategories());
        assertEquals("LEVE", semPressa.pace());

        assertEquals(List.of("viewpoint"), RuleBasedInterpreter.interpret("quero tirar fotos em mirantes", ROMA).moreCategories());
        assertEquals("", RuleBasedInterpreter.interpret("me leve a um museu", ROMA).pace());
        assertEquals(List.of("museum"), RuleBasedInterpreter.interpret("na sexta-feira quero museus", ROMA).moreCategories());
        assertEquals(List.of("museum"), RuleBasedInterpreter.interpret("quero reservar um museu", ROMA).moreCategories());
        assertTrue(RuleBasedInterpreter.interpret("quero um lugar publico", ROMA).isEmpty());
        assertTrue(RuleBasedInterpreter.interpret("artesanato local", ROMA).isEmpty());
        assertTrue(RuleBasedInterpreter.interpret("asdfgh", ROMA).isEmpty());
    }

    @Test
    @DisplayName("Dois lugares, cada um com o seu dia e periodo; 'Trevi' sozinho basta")
    void doisLugares() {
        assertEquals(List.of(new TripPreferences.Placement("Colosseo", 1, ""), new TripPreferences.Placement("Fontana di Trevi", 2, "")),
                RuleBasedInterpreter.interpret("Coliseu no dia 1 e Trevi no dia 2", ROMA).placements());
        assertEquals(List.of(new TripPreferences.Placement("Colosseo", 0, "MANHA"), new TripPreferences.Placement("Fontana di Trevi", 0, "NOITE")),
                RuleBasedInterpreter.interpret("Coliseu de manha e Trevi a noite", ROMA).placements());
    }

    @Test
    @DisplayName("Trocas e recusas de lugares: 'troca X por Y', 'sem X e Y', 'X nao'")
    void trocasDeLugares() {
        TripPreferences troca = RuleBasedInterpreter.interpret("troca o Coliseu pelo Pantheon", ROMA);
        assertEquals(List.of("Colosseo"), troca.exclude());
        assertEquals(List.of("Pantheon"), troca.mustInclude());

        assertEquals(List.of("Colosseo", "Pantheon"), RuleBasedInterpreter.interpret("sem Coliseu e Pantheon", ROMA).exclude());
        assertEquals(List.of("Colosseo"), RuleBasedInterpreter.interpret("Coliseu nao", ROMA).exclude());

        TripPreferences semLugar = RuleBasedInterpreter.interpret("tira o Pantheon, museus", ROMA);
        assertEquals(List.of("Pantheon"), semLugar.exclude());
        assertEquals(List.of("museum"), semLugar.moreCategories());
    }

    @Test
    @DisplayName("'Menos caminhada' e os pagos: pedir, desfazer e acumular")
    void caminhadaEPagos() {
        for (String pedido : List.of("menos caminhada", "lugares mais perto", "quero andar menos", "less walking", "menos caminata")) {
            assertEquals(TripPreferences.WALK_LESS, RuleBasedInterpreter.interpret(pedido, ROMA).walking(), pedido);
        }
        TripPreferences andarMais = RuleBasedInterpreter.interpret("pode andar mais", ROMA);
        assertEquals(TripPreferences.WALK_ANY, andarMais.walking());
        assertEquals("", RuleBasedInterpreter.interpret("menos caminhada", ROMA).then(andarMais).walking());

        TripPreferences semPagos = RuleBasedInterpreter.interpret("sem lugares pagos", ROMA);
        assertTrue(semPagos.avoidPaid());
        for (String pedido : List.of("pode incluir lugares pagos", "nao precisa ser gratis", "Paid places are fine", "Pueden ser lugares de pago")) {
            TripPreferences libera = RuleBasedInterpreter.interpret(pedido, ROMA);
            assertTrue(libera.allowPaid(), pedido);
            assertFalse(semPagos.then(libera).avoidPaid(), pedido);
        }
    }

    @Test
    @DisplayName("Refeicoes e horario de inicio nao viram ajuste, mas recebem resposta")
    void pedidosQueORoteiroNaoFaz() {
        for (String pedido : List.of("quero comer pizza", "mais restaurantes")) {
            assertTrue(RuleBasedInterpreter.interpret(pedido, ROMA).isEmpty(), pedido);
            assertEquals(List.of(RuleBasedInterpreter.Notice.MEALS), RuleBasedInterpreter.notices(pedido, ROMA), pedido);
        }
        assertEquals(List.of(RuleBasedInterpreter.Notice.START_TIME), RuleBasedInterpreter.notices("comecar mais tarde", ROMA));
        assertTrue(RuleBasedInterpreter.notices("mais comida de rua", ROMA).isEmpty());
    }

    @Test
    @DisplayName("As sugestoes do app sao entendidas nos tres idiomas e nao viram lugar em nenhuma cidade")
    void sugestoesDoApp() {
        for (String pedido : SUGESTOES_DO_APP) {
            for (var cidade : CATALOG.getCities()) {
                TripPreferences prefs = RuleBasedInterpreter.interpret(pedido, CATALOG.placesOf(cidade));
                assertFalse(prefs.isEmpty(), pedido + " em " + cidade.slug());
                assertTrue(prefs.mustInclude().isEmpty() && prefs.exclude().isEmpty() && prefs.placements().isEmpty(),
                        pedido + " em " + cidade.slug() + ": " + prefs);
            }
        }
    }

    @Test
    @DisplayName("A sugestao 'menos <categoria>' do app funciona com os nomes de categoria dos tres idiomas")
    void categoriasDoApp() {
        Map<String, List<String>> nomes = Map.ofEntries(
                Map.entry("museum", List.of("museus", "museums", "museos")),
                Map.entry("gallery", List.of("galerias", "galleries", "galerías")),
                Map.entry("historic_church", List.of("igrejas", "churches", "iglesias")),
                Map.entry("historic_monastery", List.of("mosteiros", "monasteries", "monasterios")),
                Map.entry("historic_temple", List.of("templos", "temples", "templos")),
                Map.entry("park", List.of("parques", "parks", "parques")),
                Map.entry("garden", List.of("jardins", "gardens", "jardines")),
                Map.entry("nature_reserve", List.of("reservas naturais", "nature reserves", "reservas naturales")),
                Map.entry("viewpoint", List.of("mirantes", "viewpoints", "miradores")),
                Map.entry("peak", List.of("morros", "peaks", "cerros")),
                Map.entry("beach", List.of("praias", "beaches", "playas")),
                Map.entry("marketplace", List.of("mercados", "markets", "mercados")),
                Map.entry("bar", List.of("bares", "bars", "bares")),
                Map.entry("pub", List.of("pubs", "pubs", "pubs")),
                Map.entry("historic_archaeological_site", List.of("sítios arqueológicos", "archaeological sites", "sitios arqueológicos")),
                Map.entry("historic_ruins", List.of("ruínas", "ruins", "ruinas")),
                Map.entry("historic_castle", List.of("castelos", "castles", "castillos")),
                Map.entry("historic_monument", List.of("monumentos", "monuments", "monumentos")),
                Map.entry("historic_fort", List.of("fortes", "forts", "fuertes")),
                Map.entry("artwork", List.of("arte de rua", "street art", "arte urbano")),
                Map.entry("theme_park", List.of("parques de diversão", "theme parks", "parques de diversiones")),
                Map.entry("zoo", List.of("zoológicos", "zoos", "zoológicos")));
        List<String> prefixos = List.of("Menos ", "Fewer ", "Menos ");
        nomes.forEach((categoria, porIdioma) -> {
            for (int i = 0; i < 3; i++) {
                String pedido = prefixos.get(i) + porIdioma.get(i);
                for (var cidade : CATALOG.getCities()) {
                    TripPreferences prefs = RuleBasedInterpreter.interpret(pedido, CATALOG.placesOf(cidade));
                    assertTrue(prefs.lessCategories().contains(categoria), pedido + " em " + cidade.slug() + ": " + prefs);
                    assertTrue(prefs.exclude().isEmpty(), pedido + " em " + cidade.slug() + ": " + prefs);
                }
            }
        });
    }

    @Test
    @DisplayName("O resumo sai no idioma do app, com o nome do lugar nesse idioma")
    void resumoNoIdiomaDoApp() {
        PreferenceInterpreter interpreter = new PreferenceInterpreter();

        assertTrue(interpreter.interpret("mais museus", ROMA, "pt-BR").summary().startsWith("Entendi: mais museus"));
        assertTrue(interpreter.interpret("more museums", ROMA, "en-US").summary().startsWith("Got it: more museums"));
        assertTrue(interpreter.interpret("más museos", ROMA, "es-ES").summary().startsWith("Entendido: más museos"));
        assertTrue(interpreter.interpret("Trevi on day 2", ROMA, "en-US").summary().contains("Trevi Fountain on day 2"));
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
