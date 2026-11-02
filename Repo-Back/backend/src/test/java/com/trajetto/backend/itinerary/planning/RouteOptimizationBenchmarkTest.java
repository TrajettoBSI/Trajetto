package com.trajetto.backend.itinerary.planning;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.itinerary.data.CityCatalog.City;
import com.trajetto.backend.itinerary.dto.TravelPace;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner.Plan;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner.Request;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner.Stop;
import com.trajetto.backend.itinerary.planning.RouteOptimizer.Point;
import com.trajetto.backend.itinerary.schedule.OpeningHours;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Benchmark da ordenacao das paradas: gera roteiros em todas as cidades do catalogo e compara
 * tres formas de ordenar os mesmos lugares de cada dia:
 *
 * <ul>
 *   <li><b>Aleatoria</b> -- a referencia de "sem algoritmo": os mesmos lugares em ordem qualquer
 *       (media de 30 embaralhamentos por dia, ignorando horario de funcionamento).</li>
 *   <li><b>Gulosa</b> -- vizinho aberto mais proximo, como o gerador fazia antes.</li>
 *   <li><b>Gulosa + 2-opt</b> -- a versao atual.</li>
 * </ul>
 *
 * <p>Alem de medir, o teste garante duas propriedades em todos os roteiros: o 2-opt nunca
 * aumenta o caminho e nunca coloca um lugar num horario em que esta fechado. O relatorio vai
 * para {@code target/benchmark-rotas.md}; os numeros do TCC estao em
 * {@code docs/BENCHMARK-DE-ROTAS.md}.</p>
 */
class RouteOptimizationBenchmarkTest {

    private static final CityCatalog CATALOG = new CityCatalog(new ObjectMapper());
    private static final ItineraryPlanner PLANNER = new ItineraryPlanner(CATALOG);
    private static final String[] PROFILES = {"CULTURAL", "SOCIAL", "NATUREZA", "AVENTUREIRO", "RELAXAMENTO"};
    private static final int SEEDS_PER_CITY = 10;
    private static final int SHUFFLES = 30;
    private static final LocalDate INICIO = LocalDate.of(2026, 11, 10);

    private record CityResult(String city, int itineraries, double randomKm, double greedyKm, double optimizedKm,
                              int improvedDays, int days, long nanos) {}

    @Test
    @DisplayName("Benchmark: o 2-opt encurta o caminho em todas as cidades sem violar horarios")
    void benchmark() throws IOException {
        List<CityResult> results = new ArrayList<>();
        for (City city : CATALOG.getCities()) {
            results.add(runCity(city));
        }
        Path report = Path.of("target", "benchmark-rotas.md");
        Files.createDirectories(report.getParent());
        Files.writeString(report, render(results));
        System.out.println(render(results));

        double greedy = results.stream().mapToDouble(CityResult::greedyKm).sum();
        double optimized = results.stream().mapToDouble(CityResult::optimizedKm).sum();
        assertTrue(optimized < greedy, "no total, o 2-opt precisa encurtar o caminho");
    }

    private CityResult runCity(City city) {
        double randomKm = 0, greedyKm = 0, optimizedKm = 0;
        int improvedDays = 0, days = 0, itineraries = 0;
        long nanos = 0;
        Point origin = new Point(city.latitude(), city.longitude());
        for (int seed = 0; seed < SEEDS_PER_CITY; seed++) {
            String profile = PROFILES[seed % PROFILES.length];
            TravelPace pace = TravelPace.values()[seed % TravelPace.values().length];
            Request req = new Request(city, profile, city.latitude(), city.longitude(), INICIO, 3, pace,
                    TripPreferences.NONE, Map.of(), true);

            long start = System.nanoTime();
            Plan plan = PLANNER.plan(req, new Random(seed));
            nanos += System.nanoTime() - start;
            itineraries++;

            assertTrue(plan.optimizedKm() <= plan.greedyKm() + 1e-9, city.slug() + " semente " + seed);
            for (Stop stop : plan.stops()) {
                assertTrue(OpeningHours.statusAt(stop.place().openingHours(), stop.date(), stop.time(),
                        ItineraryPlanner.VISIT_LENGTH) != OpeningHours.Status.CLOSED,
                        stop.place().name() + " fechado as " + stop.time());
            }

            Plan greedyPlan = PLANNER.plan(new Request(city, profile, city.latitude(), city.longitude(), INICIO, 3,
                    pace, TripPreferences.NONE, Map.of(), false), new Random(seed));
            assertEquals(greedyPlan.optimizedKm(), plan.greedyKm(), 1e-6, "o guloso e o mesmo nas duas execucoes");

            Map<LocalDate, List<Stop>> byDay = plan.stops().stream()
                    .collect(Collectors.groupingBy(Stop::date));
            Map<LocalDate, List<Stop>> greedyByDay = greedyPlan.stops().stream()
                    .collect(Collectors.groupingBy(Stop::date));
            Random shuffle = new Random(seed);
            for (LocalDate day : byDay.keySet()) {
                List<Point> points = byDay.get(day).stream().map(s -> new Point(s.place().latitude(), s.place().longitude()))
                        .collect(Collectors.toCollection(ArrayList::new));
                double sum = 0;
                for (int i = 0; i < SHUFFLES; i++) {
                    Collections.shuffle(points, shuffle);
                    sum += RouteOptimizer.pathKm(origin, null, points, p -> p);
                }
                randomKm += sum / SHUFFLES;
                days++;
                double g = dayKm(origin, greedyByDay.get(day));
                double o = dayKm(origin, byDay.get(day));
                if (o < g - 1e-6) improvedDays++;
            }
            greedyKm += plan.greedyKm();
            optimizedKm += plan.optimizedKm();
        }
        return new CityResult(city.name(), itineraries, randomKm, greedyKm, optimizedKm, improvedDays, days, nanos);
    }

    private double dayKm(Point origin, List<Stop> stops) {
        return RouteOptimizer.pathKm(origin, null, stops, s -> new Point(s.place().latitude(), s.place().longitude()));
    }

    private String render(List<CityResult> results) {
        StringBuilder md = new StringBuilder();
        md.append("| Cidade | Roteiros | Aleatória (km) | Gulosa (km) | Gulosa + 2-opt (km) | Redução vs gulosa | Redução vs aleatória | Dias melhorados | Tempo médio |\n");
        md.append("|---|---:|---:|---:|---:|---:|---:|---:|---:|\n");
        double r = 0, g = 0, o = 0;
        int improved = 0, days = 0, its = 0;
        long nanos = 0;
        for (CityResult c : results) {
            md.append(row(c.city(), c.itineraries(), c.randomKm(), c.greedyKm(), c.optimizedKm(), c.improvedDays(), c.days(), c.nanos()));
            r += c.randomKm(); g += c.greedyKm(); o += c.optimizedKm();
            improved += c.improvedDays(); days += c.days(); its += c.itineraries(); nanos += c.nanos();
        }
        md.append(row("**Total**", its, r, g, o, improved, days, nanos));
        return md.toString();
    }

    private String row(String name, int its, double r, double g, double o, int improved, int days, long nanos) {
        return String.format(Locale.ROOT, "| %s | %d | %.1f | %.1f | %.1f | %.1f%% | %.1f%% | %d de %d | %.0f ms |%n",
                name, its, r, g, o, 100 * (g - o) / g, 100 * (r - o) / r, improved, days, nanos / 1e6 / its);
    }
}
