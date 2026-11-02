package com.trajetto.backend.itinerary.planning;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Predicate;
import java.util.function.Function;

/**
 * Melhoria 2-opt sobre a ordem das paradas de um dia.
 *
 * <p>O gerador monta o dia de forma gulosa: de onde o viajante esta, vai sempre ao lugar aberto
 * mais proximo. E rapido, mas a escolha local pode cruzar o caminho -- ir ao Panteao, voltar
 * para perto do hotel e depois atravessar a cidade de novo. O 2-opt desfaz esses cruzamentos:
 * testa inverter cada trecho da sequencia e fica com a inversao quando o caminho total encurta.
 * Repete ate nenhuma inversao ajudar (um otimo local).</p>
 *
 * <p>Os horarios nao mudam -- o das 9h continua sendo o das 9h; muda qual lugar ocupa cada
 * horario. Por isso cada inversao so e aceita se todos os lugares continuarem abertos no
 * novo horario ({@code feasible}).</p>
 *
 * <p>O caminho e aberto: comeca no ponto de partida e, quando ha, termina num ponto fixo (a
 * parada da noite, que nao entra na troca).</p>
 */
public final class RouteOptimizer {

    /** Teto de rodadas: o 2-opt converge em poucas, mas o teto garante que a geracao nunca trava. */
    static final int MAX_ROUNDS = 50;
    private static final double EPSILON = 1e-9;

    private RouteOptimizer() {}

    public record Point(double lat, double lng) {}

    /**
     * Devolve a melhor ordem encontrada para {@code stops}. A lista original nao e alterada.
     *
     * @param start    de onde o dia comeca (o hotel)
     * @param end      ponto fixo depois da ultima parada, ou {@code null} se o dia termina nela
     * @param coords   coordenada de cada parada
     * @param feasible se uma ordem candidata respeita os horarios de funcionamento
     */
    public static <T> List<T> twoOpt(Point start, Point end, List<T> stops,
                                     Function<T, Point> coords, Predicate<List<T>> feasible) {
        List<T> route = new ArrayList<>(stops);
        int n = route.size();
        if (n < 2) return route;

        boolean improved = true;
        for (int round = 0; improved && round < MAX_ROUNDS; round++) {
            improved = false;
            for (int i = 0; i < n - 1; i++) {
                for (int k = i + 1; k < n; k++) {
                    Point before = i == 0 ? start : coords.apply(route.get(i - 1));
                    Point after = k == n - 1 ? end : coords.apply(route.get(k + 1));
                    Point first = coords.apply(route.get(i));
                    Point last = coords.apply(route.get(k));
                    double delta = km(before, last) + km(first, after) - km(before, first) - km(last, after);
                    if (delta >= -EPSILON) continue;

                    List<T> candidate = new ArrayList<>(route);
                    Collections.reverse(candidate.subList(i, k + 1));
                    if (!feasible.test(candidate)) continue;
                    route = candidate;
                    improved = true;
                }
            }
        }
        return route;
    }

    /** Comprimento do caminho start -> paradas -> end, em km. */
    public static <T> double pathKm(Point start, Point end, List<T> stops, Function<T, Point> coords) {
        double total = 0;
        Point prev = start;
        for (T stop : stops) {
            Point p = coords.apply(stop);
            total += km(prev, p);
            prev = p;
        }
        return total + km(prev, end);
    }

    /** Ruas nao sao linha reta: o caminho a pe numa cidade e, em media, ~30% maior que a distancia direta. */
    static final double DETOUR_FACTOR = 1.3;
    static final double WALKING_KMH = 4.8;

    /** Estimativa a pe entre dois pontos a {@code km} de distancia em linha reta. */
    public static int walkingMinutes(double km) {
        return (int) Math.round(km * DETOUR_FACTOR / WALKING_KMH * 60);
    }

    /** Distancia em linha reta (haversine); {@code null} vale zero, para o fim de caminho aberto. */
    public static double km(Point a, Point b) {
        if (a == null || b == null) return 0;
        final double r = 6371.0;
        double dLat = Math.toRadians(b.lat() - a.lat());
        double dLon = Math.toRadians(b.lng() - a.lng());
        double h = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(a.lat())) * Math.cos(Math.toRadians(b.lat()))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return r * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    }
}
