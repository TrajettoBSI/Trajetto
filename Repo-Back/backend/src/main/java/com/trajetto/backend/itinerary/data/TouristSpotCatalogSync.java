package com.trajetto.backend.itinerary.data;

import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.model.TouristSpotDocument;
import com.trajetto.backend.itinerary.repository.TouristSpotMongoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Espelha o catalogo curado das cidades ({@code data/cities/*.geojson}, ver
 * {@link CityCatalog}) na colecao MongoDB {@code tourist_spots} (schema e indices em
 * {@link TouristSpotMongoSchema} e {@link TouristSpotMongoIndexes}).
 *
 * <p>O arquivo continua sendo a fonte do catalogo; o banco guarda uma copia
 * para poder responder as buscas -- em especial a de proximidade, que usa o
 * indice {@code 2dsphere} da colecao. A copia e refeita a cada inicializacao:
 * apaga tudo e grava de novo em lote. Assim, uma edicao no GeoJSON chega ao
 * banco no proximo deploy sem precisar de migracao.</p>
 *
 * <p>O {@code id} de cada ponto e a sua posicao no catalogo, o que mantem a
 * ordem do catalogo e dispensa buscar chaves geradas. Os perfis vao embutidos
 * no proprio documento -- sem colecao separada, ao contrario da versao MySQL.</p>
 */
@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class TouristSpotCatalogSync implements ApplicationRunner {

    private final CityCatalog cityCatalog;
    private final TouristSpotMongoRepository repository;

    @Override
    public void run(ApplicationArguments args) {
        List<CatalogPlace> places = cityCatalog.getPlaces();

        List<TouristSpotDocument> documents = new ArrayList<>(places.size());
        for (int i = 0; i < places.size(); i++) {
            CatalogPlace p = places.get(i);
            long id = i + 1L;
            List<String> profiles = p.profiles().stream()
                    .filter(pr -> pr != null && !pr.isBlank())
                    .distinct()
                    .toList();
            documents.add(TouristSpotDocument.of(
                    id, p.city(), p.name(), blankToNull(p.address()), p.latitude(), p.longitude(),
                    blankToNull(p.category()), blankToNull(p.fee()), blankToNull(p.openingHours()),
                    blankToNull(p.phone()), blankToNull(p.website()), blankToNull(p.wikidata()),
                    blankToNull(p.wikipedia()), blankToNull(p.wheelchair()), profiles, p.names()
            ));
        }

        repository.deleteAll();
        repository.saveAll(documents);

        log.info("Catalogo de pontos turisticos sincronizado: {} pontos em {} cidades.", documents.size(),
                cityCatalog.getCities().size());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
