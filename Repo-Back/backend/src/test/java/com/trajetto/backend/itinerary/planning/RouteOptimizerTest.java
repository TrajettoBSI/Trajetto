package com.trajetto.backend.itinerary.planning;

import com.trajetto.backend.itinerary.planning.RouteOptimizer.Point;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RouteOptimizerTest {

    private static final Point ORIGEM = new Point(0, 0);
    private static final Function<Point, Point> MESMO = p -> p;

    @Test
    @DisplayName("Desfaz o cruzamento: (0,0) -> (0,2) -> (0,1) -> (0,3) vira a linha reta")
    void desfazCruzamento() {
        List<Point> cruzado = List.of(new Point(0, 0.02), new Point(0, 0.01), new Point(0, 0.03));

        List<Point> melhor = RouteOptimizer.twoOpt(ORIGEM, null, cruzado, MESMO, ordem -> true);

        assertEquals(List.of(new Point(0, 0.01), new Point(0, 0.02), new Point(0, 0.03)), melhor);
        assertTrue(RouteOptimizer.pathKm(ORIGEM, null, melhor, MESMO)
                < RouteOptimizer.pathKm(ORIGEM, null, cruzado, MESMO));
    }

    @Test
    @DisplayName("Nao aceita a inversao que deixaria um lugar fechado no novo horario")
    void respeitaOHorarioDeFuncionamento() {
        Point museu = new Point(0, 0.02);
        List<Point> cruzado = List.of(museu, new Point(0, 0.01), new Point(0, 0.03));

        // O museu so abre no primeiro horario: qualquer ordem que o tire de la e inviavel.
        List<Point> melhor = RouteOptimizer.twoOpt(ORIGEM, null, cruzado, MESMO, ordem -> ordem.get(0).equals(museu));

        assertEquals(museu, melhor.get(0));
    }

    @Test
    @DisplayName("Considera o ponto fixo do fim (a parada da noite) no comprimento do caminho")
    void consideraOPontoFinal() {
        Point fim = new Point(0, 0);
        List<Point> ida = List.of(new Point(0, 0.01), new Point(0.01, 0.01), new Point(0.01, 0));

        List<Point> melhor = RouteOptimizer.twoOpt(ORIGEM, fim, ida, MESMO, ordem -> true);

        assertTrue(RouteOptimizer.pathKm(ORIGEM, fim, melhor, MESMO)
                <= RouteOptimizer.pathKm(ORIGEM, fim, ida, MESMO) + 1e-9);
    }

    @Test
    @DisplayName("Em 500 dias aleatorios, o caminho otimizado nunca e mais longo que o original")
    void nuncaPiora() {
        Random random = new Random(42);
        for (int caso = 0; caso < 500; caso++) {
            List<Point> pontos = random.ints(2 + random.nextInt(7), 0, 1000)
                    .mapToObj(i -> new Point(random.nextDouble() * 0.1, random.nextDouble() * 0.1)).toList();
            List<Point> melhor = RouteOptimizer.twoOpt(ORIGEM, null, pontos, MESMO, ordem -> true);

            assertEquals(pontos.size(), melhor.size());
            assertTrue(melhor.containsAll(pontos));
            assertTrue(RouteOptimizer.pathKm(ORIGEM, null, melhor, MESMO)
                    <= RouteOptimizer.pathKm(ORIGEM, null, pontos, MESMO) + 1e-9);
        }
    }

    @Test
    @DisplayName("A estimativa a pe considera o desvio das ruas: 1 km em linha reta da ~16 min")
    void estimativaAPe() {
        assertEquals(16, RouteOptimizer.walkingMinutes(1.0));
        assertEquals(0, RouteOptimizer.walkingMinutes(0));
    }
}
