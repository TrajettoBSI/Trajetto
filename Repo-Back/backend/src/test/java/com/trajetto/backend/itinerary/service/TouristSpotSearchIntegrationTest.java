package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.itinerary.data.RomePlacesLoader;
import com.trajetto.backend.itinerary.dto.TouristSpotResponseDTO;
import com.trajetto.backend.itinerary.model.TouristSpotDocument;
import com.trajetto.backend.itinerary.repository.TouristSpotMongoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * BE02.4 — busca de pontos turisticos por proximidade feita pelo banco.
 *
 * <p>Roda contra o MongoDB de verdade, com o catalogo que
 * {@code TouristSpotCatalogSync} espelha do GeoJSON na inicializacao: o que se
 * quer verificar e justamente o que um duble apagaria -- o indice
 * {@code 2dsphere} e o {@code $geoNear} do aggregation framework.</p>
 *
 * <p>So leitura: nenhum teste grava no banco, entao nao precisa de rollback
 * entre casos -- o Mongo standalone deste projeto tambem nao suporta
 * transacao multi-documento, ao contrario do MySQL da versao anterior.</p>
 */
@SpringBootTest
class TouristSpotSearchIntegrationTest {

    /** Pantheon, como esta no catalogo. */
    private static final double LAT = 41.89865224324324;
    private static final double LNG = 12.476784108108108;

    /** Mesmo raio de esfera (eixo maior do WGS 84) que o $geoNear do Mongo usa. */
    private static final double EARTH_RADIUS_METERS = 6_378_137.0;

    @Autowired
    private TouristSpotSearchService service;

    @Autowired
    private RomePlacesLoader romePlacesLoader;

    @Autowired
    private TouristSpotMongoRepository mongoRepository;

    @Test
    @DisplayName("O catalogo inteiro chega ao banco, na ordem do arquivo")
    void catalogoEspelhadoNoBanco() {
        List<TouristSpotResponseDTO> todos = service.search(null, null, null, null, null, null, null, null);

        assertEquals(romePlacesLoader.getPlaces().size(), todos.size());
        assertEquals(romePlacesLoader.getPlaces().get(0).name(), todos.get(0).name());
        assertTrue(todos.stream().allMatch(p -> p.distanceMeters() == null),
                "sem ponto de referencia nao ha distancia");
    }

    @Test
    @DisplayName("Locais proximos vem do mais perto para o mais longe, todos dentro do raio")
    void proximosOrdenadosPorDistancia() {
        List<TouristSpotResponseDTO> proximos = service.nearby(LAT, LNG, 500, 100, null, null);

        assertFalse(proximos.isEmpty());
        assertEquals("Pantheon", proximos.get(0).name());
        assertTrue(proximos.get(0).distanceMeters() < 1, "o proprio ponto esta a distancia zero");
        for (int i = 0; i < proximos.size(); i++) {
            assertTrue(proximos.get(i).distanceMeters() <= 500);
            if (i > 0) {
                assertTrue(proximos.get(i - 1).distanceMeters() <= proximos.get(i).distanceMeters());
            }
        }
    }

    @Test
    @DisplayName("O indice 2dsphere nao perde nenhum ponto na borda do raio")
    void indiceNaoPerdePontos() {
        // Referencia independente do banco: Haversine em Java sobre o catalogo
        // inteiro, sem passar pelo indice nem pelo $geoNear.
        List<TouristSpotDocument> catalogo = mongoRepository.findAll();

        for (double raio : new double[]{150, 500, 1_000, 2_000, 5_000}) {
            Set<String> pelaBusca = service.nearby(LAT, LNG, raio, TouristSpotSearchService.MAX_NEARBY_LIMIT, null, null)
                    .stream().map(TouristSpotResponseDTO::name).collect(Collectors.toSet());

            // Mesmo corte de MAX_NEARBY_LIMIT que o service aplica: a prova e
            // que o indice nao troca QUEM entra no top-N por distancia, nao
            // que ele devolve todo mundo dentro do raio sem limite nenhum.
            Set<String> referencia = catalogo.stream()
                    .map(doc -> Map.entry(doc.getName(), haversine(LAT, LNG, doc.getLatitude(), doc.getLongitude())))
                    .filter(e -> e.getValue() <= raio)
                    .sorted(Map.Entry.comparingByValue())
                    .limit(TouristSpotSearchService.MAX_NEARBY_LIMIT)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toSet());

            assertEquals(referencia, pelaBusca, "raio de " + raio + " m");
        }
    }

    @Test
    @DisplayName("A distancia do banco bate com a medida conhecida entre Pantheon e Fontana di Trevi")
    void distanciaEmMetros() {
        TouristSpotResponseDTO trevi = service.nearby(LAT, LNG, 1_000, 100, null, null).stream()
                .filter(p -> p.name().equals("Fontana di Trevi"))
                .findFirst().orElseThrow();

        // ~593 m em linha reta. Latitude e longitude trocadas no GeoJSON
        // (coordinates: [longitude, latitude]) dariam outro numero bem
        // diferente, entao a faixa estreita tambem confere a ordem dos eixos.
        assertTrue(trevi.distanceMeters() > 585 && trevi.distanceMeters() < 600,
                "veio " + trevi.distanceMeters());
    }

    @Test
    @DisplayName("Proximidade se combina com categoria e perfil")
    void proximidadeComFiltros() {
        List<TouristSpotResponseDTO> museus = service.nearby(LAT, LNG, 2_000, 100, "museum", "cultural");

        assertFalse(museus.isEmpty());
        assertTrue(museus.stream().allMatch(p -> p.category().equals("museum")));
        assertTrue(museus.stream().allMatch(p -> p.profiles().contains("CULTURAL")));
        assertTrue(museus.stream().allMatch(p -> p.distanceMeters() <= 2_000));
    }

    @Test
    @DisplayName("O filtro de distancia do mapa (/places) tambem passa pelo banco")
    void filtroDoMapaUsaOBanco() {
        List<TouristSpotResponseDTO> comDistancia = service.search(null, null, null, null, null, LAT, LNG, 300.0);
        List<TouristSpotResponseDTO> semRaio = service.search(null, null, null, null, null, LAT, LNG, null);

        assertTrue(comDistancia.size() < semRaio.size());
        assertTrue(comDistancia.stream().allMatch(p -> p.distanceMeters() <= 300));
        assertNull(semRaio.get(0).distanceMeters(), "sem raio o filtro de distancia fica desligado, como antes");
    }

    @Test
    @DisplayName("Coordenada ou raio fora da faixa viram 400, e nao erro do banco")
    void parametrosInvalidos() {
        assertThrows(InvalidRequestException.class, () -> service.nearby(95, LNG, 500, 20, null, null));
        assertThrows(InvalidRequestException.class, () -> service.nearby(LAT, 200, 500, 20, null, null));
        assertThrows(InvalidRequestException.class, () -> service.nearby(LAT, LNG, 0, 20, null, null));
        assertThrows(InvalidRequestException.class, () -> service.nearby(LAT, LNG, Double.NaN, 20, null, null));
        assertThrows(InvalidRequestException.class, () -> service.nearby(LAT, LNG, 60_000, 20, null, null));
        assertThrows(InvalidRequestException.class, () -> service.nearby(LAT, LNG, 500, 0, null, null));
    }

    /** Distancia esferica, em metros, com o mesmo raio de Terra que o $geoNear do Mongo usa. */
    private static double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}
