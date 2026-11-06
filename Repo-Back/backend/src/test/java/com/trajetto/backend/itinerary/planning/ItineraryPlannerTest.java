package com.trajetto.backend.itinerary.planning;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.itinerary.data.CityCatalog.City;
import com.trajetto.backend.itinerary.dto.TravelPace;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner.Plan;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner.Request;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner.Stop;
import com.trajetto.backend.itinerary.schedule.OpeningHours;
import com.trajetto.backend.weather.DayWeather;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** O planejador roda sem Spring e sem banco: so o catalogo, o pedido e a previsao. */
class ItineraryPlannerTest {

    private static final CityCatalog CATALOG = new CityCatalog(new ObjectMapper());
    private static final ItineraryPlanner PLANNER = new ItineraryPlanner(CATALOG);
    private static final City ROMA = CATALOG.city("roma").orElseThrow();
    private static final LocalDate INICIO = LocalDate.of(2026, 11, 10);

    private Plan planejar(TripPreferences prefs, Map<LocalDate, DayWeather> clima, boolean otimizar, long semente) {
        return PLANNER.plan(new Request(ROMA, "CULTURAL", 41.9009, 12.4833, INICIO, 3, TravelPace.INTENSO,
                prefs, clima, otimizar), new Random(semente));
    }

    @Test
    @DisplayName("Com a mesma semente, o 2-opt so reordena: mesmos lugares, caminho menor ou igual")
    void otimizacaoSoReordena() {
        Plan guloso = planejar(TripPreferences.NONE, Map.of(), false, 7);
        Plan otimizado = planejar(TripPreferences.NONE, Map.of(), true, 7);

        assertEquals(guloso.stops().stream().map(s -> s.place().name()).sorted().toList(),
                otimizado.stops().stream().map(s -> s.place().name()).sorted().toList());
        assertEquals(guloso.greedyKm(), otimizado.greedyKm(), 1e-9);
        assertTrue(otimizado.optimizedKm() <= otimizado.greedyKm() + 1e-9);
    }

    @Test
    @DisplayName("Lugar pedido para um dia e periodo fica la, mesmo depois do 2-opt, e aparece uma vez so")
    void lugarFicaNoDiaEPeriodoPedidos() {
        for (long semente = 0; semente < 20; semente++) {
            TripPreferences prefs = new TripPreferences(List.of(), List.of(), false, "", List.of(), List.of(), "",
                    List.of(new TripPreferences.Placement("Fontana di Trevi", -1, "MANHA"),
                            new TripPreferences.Placement("Colosseo", 1, "TARDE")));
            List<Stop> stops = planejar(prefs, Map.of(), true, semente).stops();

            List<Stop> trevi = stops.stream().filter(s -> s.place().name().equals("Fontana di Trevi")).toList();
            assertEquals(1, trevi.size());
            assertEquals(INICIO.plusDays(2), trevi.get(0).date());
            assertTrue(ItineraryPlanner.inPeriod(trevi.get(0).time(), "MANHA"), trevi.get(0).time().toString());

            List<Stop> coliseu = stops.stream().filter(s -> s.place().name().equals("Colosseo")).toList();
            assertEquals(1, coliseu.size());
            assertEquals(INICIO, coliseu.get(0).date());
            assertTrue(ItineraryPlanner.inPeriod(coliseu.get(0).time(), "TARDE"), coliseu.get(0).time().toString());
        }
    }

    @Test
    @DisplayName("Os lugares mais famosos do roteiro ficam nos primeiros dias")
    void famososNosPrimeirosDias() {
        int noPrimeiroDia = 0;
        int total = 0;
        for (long semente = 0; semente < 20; semente++) {
            List<Stop> stops = planejar(TripPreferences.NONE, Map.of(), true, semente).stops();
            List<Stop> maisFamosos = stops.stream()
                    .sorted(java.util.Comparator.comparingInt((Stop s) -> s.place().popularity()).reversed())
                    .limit(3).toList();
            for (Stop stop : maisFamosos) {
                total++;
                if (stop.date().equals(INICIO)) noPrimeiroDia++;
                assertFalse(stop.date().isAfter(INICIO.plusDays(1)), stop.place().name() + " ficou no " + stop.date());
            }
        }
        assertTrue(noPrimeiroDia >= total * 0.8, noPrimeiroDia + " de " + total + " no primeiro dia");
    }

    @Test
    @DisplayName("Depois do 2-opt, nenhum lugar fica num horario em que esta fechado")
    void otimizacaoRespeitaHorarios() {
        for (long semente = 0; semente < 20; semente++) {
            for (Stop stop : planejar(TripPreferences.NONE, Map.of(), true, semente).stops()) {
                assertNotEquals(OpeningHours.Status.CLOSED, OpeningHours.statusAt(stop.place().openingHours(),
                        stop.date(), stop.time(), ItineraryPlanner.VISIT_LENGTH), stop.place().name() + " " + stop.time());
            }
        }
    }

    @Test
    @DisplayName("Evitar uma categoria tira do roteiro os lugares dela, ate os famosos")
    void evitaCategoria() {
        Plan base = planejar(TripPreferences.NONE, Map.of(), true, 3);
        String maisComum = base.stops().stream()
                .collect(java.util.stream.Collectors.groupingBy(s -> s.place().category(), java.util.stream.Collectors.counting()))
                .entrySet().stream().max(Map.Entry.comparingByValue()).orElseThrow().getKey();
        TripPreferences evitar = new TripPreferences(List.of(), List.of(maisComum), false, "",
                List.of(), List.of(), "");

        long antes = base.stops().stream().filter(s -> maisComum.equals(s.place().category())).count();
        long depois = planejar(evitar, Map.of(), true, 3).stops().stream()
                .filter(s -> maisComum.equals(s.place().category())).count();

        assertTrue(depois * 2 < antes, maisComum + ": antes " + antes + ", depois " + depois);
    }

    @Test
    @DisplayName("'Mais museus' aumenta o numero de museus no roteiro")
    void maisMuseus() {
        TripPreferences maisMuseus = new TripPreferences(List.of("museum"), List.of(), false, "",
                List.of(), List.of(), "");

        long antes = planejar(TripPreferences.NONE, Map.of(), true, 5).stops().stream()
                .filter(s -> "museum".equals(s.place().category())).count();
        long depois = planejar(maisMuseus, Map.of(), true, 5).stops().stream()
                .filter(s -> "museum".equals(s.place().category())).count();

        assertTrue(depois > antes, "museus: antes " + antes + ", depois " + depois);
    }

    private Plan planejarComo(String perfil, TripPreferences prefs, long semente) {
        return PLANNER.plan(new Request(ROMA, perfil, 41.9009, 12.4833, INICIO, 3, TravelPace.INTENSO,
                prefs, Map.of(), true), new Random(semente));
    }

    private static long daCategoria(Plan plano, java.util.Set<String> categorias) {
        return plano.stops().stream().filter(s -> categorias.contains(s.place().category())).count();
    }

    private static TripPreferences categorias(List<String> mais, List<String> menos) {
        return new TripPreferences(mais, menos, false, "", List.of(), List.of(), "");
    }

    @Test
    @DisplayName("'Mais museus' aparece ate para o perfil que nao costuma ir a museu")
    void pedidoValeMaisQueOPerfil() {
        for (long semente = 0; semente < 5; semente++) {
            long museus = daCategoria(planejarComo("SOCIAL", categorias(List.of("museum"), List.of()), semente), java.util.Set.of("museum"));
            assertTrue(museus >= 4, "semente " + semente + ": " + museus + " museus");
        }
    }

    @Test
    @DisplayName("'Mais natureza e mirantes' reparte os horarios entre as categorias pedidas")
    void pedidoRepartidoEntreCategorias() {
        Plan plano = planejarComo("CULTURAL", categorias(List.of("park", "viewpoint"), List.of()), 2);

        assertTrue(daCategoria(plano, java.util.Set.of("park")) > 0);
        assertTrue(daCategoria(plano, java.util.Set.of("viewpoint")) > 0);
    }

    @Test
    @DisplayName("Quem pede vida noturna ganha bar a noite com qualquer perfil; quem recusa nao ganha")
    void vidaNoturnaPedida() {
        java.util.Set<String> bares = java.util.Set.of("bar", "pub");
        assertEquals(0, daCategoria(planejarComo("CULTURAL", TripPreferences.NONE, 1), bares));
        assertTrue(daCategoria(planejarComo("CULTURAL", categorias(List.of("bar", "pub"), List.of()), 1), bares) > 0);
        assertTrue(daCategoria(planejarComo("SOCIAL", TripPreferences.NONE, 1), bares) > 0);
        assertEquals(0, daCategoria(planejarComo("SOCIAL", categorias(List.of(), List.of("bar", "pub")), 1), bares));
    }

    @Test
    @DisplayName("'Menos caminhada' encurta o caminho total")
    void menosCaminhada() {
        TripPreferences perto = new TripPreferences(List.of(), List.of(), false, "", List.of(), List.of(), "", List.of(),
                false, TripPreferences.WALK_LESS);
        double antes = 0;
        double depois = 0;
        for (long semente = 0; semente < 10; semente++) {
            antes += planejar(TripPreferences.NONE, Map.of(), true, semente).optimizedKm();
            depois += planejar(perto, Map.of(), true, semente).optimizedKm();
        }
        assertTrue(depois < antes * 0.9, "antes " + antes + ", depois " + depois);
    }

    @Test
    @DisplayName("Lugar pedido pelo nome, em portugues, entra no roteiro; lugar recusado sai")
    void incluiEExcluiPeloNome() {
        Plan base = planejar(TripPreferences.NONE, Map.of(), true, 11);
        String recusado = base.stops().get(0).place().name();
        TripPreferences prefs = new TripPreferences(List.of(), List.of(), false, "",
                List.of("Basílica de São Clemente"), List.of(recusado), "");

        Plan plano = planejar(prefs, Map.of(), true, 11);

        assertTrue(plano.stops().stream().anyMatch(s -> ItineraryPlanner.matchesName(s.place(), "São Clemente")));
        assertFalse(plano.stops().stream().anyMatch(s -> s.place().name().equals(recusado)));
    }

    @Test
    @DisplayName("Em dia de chuva, as visitas do dia sao em lugares cobertos sempre que ha opcao aberta")
    void chuvaPriorizaLugaresCobertos() {
        Map<LocalDate, DayWeather> clima = Map.of(
                INICIO, DayWeather.of(INICIO, 0, 20, 12, 0),
                INICIO.plusDays(1), DayWeather.of(INICIO.plusDays(1), 63, 15, 10, 90),
                INICIO.plusDays(2), DayWeather.of(INICIO.plusDays(2), 1, 21, 12, 10));

        Plan seco = planejar(TripPreferences.NONE, Map.of(), true, 9);
        Plan comChuva = planejar(TripPreferences.NONE, clima, true, 9);

        long aoArLivreSeco = aoArLivreDeDia(seco, INICIO.plusDays(1));
        long aoArLivreChuva = aoArLivreDeDia(comChuva, INICIO.plusDays(1));
        assertEquals(1, comChuva.rainyDays());
        assertTrue(aoArLivreChuva < aoArLivreSeco || aoArLivreChuva == 0,
                "ao ar livre no dia 2: sem previsao " + aoArLivreSeco + ", com chuva " + aoArLivreChuva);
    }

    private long aoArLivreDeDia(Plan plan, LocalDate dia) {
        return plan.stops().stream()
                .filter(s -> s.date().equals(dia) && s.time().isBefore(ItineraryPlanner.EVENING))
                .filter(s -> ItineraryPlanner.OUTDOOR.contains(s.place().category()))
                .count();
    }
}
