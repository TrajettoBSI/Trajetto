package com.trajetto.backend.itinerary.data;

import com.trajetto.backend.itinerary.data.RomePlacesLoader.RomePlace;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Espelha o catalogo curado de Roma ({@code data/rome_curated.geojson}) nas
 * tabelas {@code tourist_spots} e {@code tourist_spot_profiles} (migracao V8).
 *
 * <p>O arquivo continua sendo a fonte do catalogo; o banco guarda uma copia
 * para poder responder as buscas -- em especial a de proximidade, que usa o
 * indice espacial da coluna {@code location}. A copia e refeita a cada
 * inicializacao, dentro de uma transacao so: sao ~800 linhas, gravadas em lote,
 * e ninguem enxerga a tabela vazia no meio do caminho. Assim, uma edicao no
 * GeoJSON chega ao banco no proximo deploy sem precisar de migracao.</p>
 *
 * <p>O {@code id} de cada ponto e a sua posicao no arquivo, o que mantem a
 * ordem do catalogo e dispensa buscar chaves geradas para gravar os perfis.
 * Nada referencia esse {@code id} fora destas duas tabelas.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TouristSpotCatalogSync implements ApplicationRunner {

    private final RomePlacesLoader romePlacesLoader;
    private final JdbcTemplate jdbc;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<RomePlace> places = romePlacesLoader.getPlaces();

        // Os perfis saem junto por ON DELETE CASCADE.
        jdbc.update("DELETE FROM tourist_spots");

        List<Object[]> spots = new ArrayList<>(places.size());
        List<Object[]> profiles = new ArrayList<>();
        for (int i = 0; i < places.size(); i++) {
            RomePlace p = places.get(i);
            long id = i + 1L;
            spots.add(new Object[]{
                    id, p.name(), blankToNull(p.address()), p.latitude(), p.longitude(),
                    blankToNull(p.category()), blankToNull(p.fee()), blankToNull(p.openingHours()),
                    blankToNull(p.phone()), blankToNull(p.website()), blankToNull(p.wikidata()),
                    blankToNull(p.wikipedia()), blankToNull(p.wheelchair())
            });
            p.profiles().stream()
                    .filter(pr -> pr != null && !pr.isBlank())
                    .distinct()
                    .forEach(pr -> profiles.add(new Object[]{id, pr}));
        }

        jdbc.batchUpdate("""
                INSERT INTO tourist_spots
                    (id, name, address, latitude, longitude, category, fee, opening_hours,
                     phone, website, wikidata, wikipedia, wheelchair)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, spots);
        jdbc.batchUpdate("INSERT INTO tourist_spot_profiles (spot_id, profile) VALUES (?, ?)", profiles);

        log.info("Catalogo de pontos turisticos sincronizado: {} pontos, {} perfis.", spots.size(), profiles.size());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
