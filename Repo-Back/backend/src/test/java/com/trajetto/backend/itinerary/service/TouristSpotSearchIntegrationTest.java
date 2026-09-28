package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.itinerary.data.RomePlacesLoader;
import com.trajetto.backend.itinerary.dto.TouristSpotResponseDTO;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
 * <p>Roda contra o MySQL de verdade, com o catalogo que
 * {@code TouristSpotCatalogSync} espelha do GeoJSON na inicializacao: o que se
 * quer verificar e justamente o que um duble apagaria -- o tipo geografico, o
 * {@code ST_Distance} no elipsoide e o pre-filtro {@code MBRContains} que
 * permite ao otimizador usar o indice espacial.</p>
 */
@SpringBootTest
@Transactional
class TouristSpotSearchIntegrationTest {

    /** Pantheon, como esta no catalogo. */
    private static final double LAT = 41.89865224324324;
    private static final double LNG = 12.476784108108108;

    @Autowired
    private TouristSpotSearchService service;

    @Autowired
    private RomePlacesLoader romePlacesLoader;

    @Autowired
    private EntityManager em;

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
    @DisplayName("O pre-filtro pelo indice espacial nao perde nenhum ponto na borda do raio")
    void indiceNaoPerdePontos() {
        for (double raio : new double[]{150, 500, 1_000, 2_000, 5_000}) {
            Set<String> pelaBusca = service.nearby(LAT, LNG, raio, TouristSpotSearchService.MAX_NEARBY_LIMIT, null, null)
                    .stream().map(TouristSpotResponseDTO::name).collect(Collectors.toSet());

            // Referencia: a mesma distancia, sem indice e sem retangulo, ponto a ponto.
            @SuppressWarnings("unchecked")
            List<String> referencia = em.createNativeQuery("""
                            SELECT name FROM tourist_spots IGNORE INDEX (sx_tourist_spots_location)
                            WHERE ST_Distance(location, ST_SRID(POINT(:lng, :lat), 4326)) <= :raio
                            ORDER BY ST_Distance(location, ST_SRID(POINT(:lng, :lat), 4326)), id
                            LIMIT :limite
                            """)
                    .setParameter("lat", LAT).setParameter("lng", LNG).setParameter("raio", raio)
                    .setParameter("limite", TouristSpotSearchService.MAX_NEARBY_LIMIT)
                    .getResultList();

            assertEquals(Set.copyOf(referencia), pelaBusca, "raio de " + raio + " m");
        }
    }

    @Test
    @DisplayName("A distancia do banco bate com a medida conhecida entre Pantheon e Fontana di Trevi")
    void distanciaEmMetros() {
        TouristSpotResponseDTO trevi = service.nearby(LAT, LNG, 1_000, 100, null, null).stream()
                .filter(p -> p.name().equals("Fontana di Trevi"))
                .findFirst().orElseThrow();

        // ~593 m em linha reta no elipsoide. Latitude e longitude trocadas no
        // POINT dariam outro numero bem diferente, entao a faixa estreita
        // tambem confere a ordem dos eixos.
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
}
