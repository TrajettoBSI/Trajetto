package com.trajetto.backend.rating.service;

import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.data.PlaceXid;
import com.trajetto.backend.rating.model.RatingDocument;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingMongoRepository;
import com.trajetto.backend.rating.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Ao subir, copia para o Mongo as avaliacoes que so existem no MySQL.
 *
 * <p>O espelho e gravado pelo {@link RatingService} a cada avaliacao feita pelo app, mas
 * nao pelas que entram por fora dele: as do {@code DataSeeder} e as de
 * {@code scripts/avaliacoes_demo.sql}. Sem a copia, o painel do admin nao as conta.</p>
 */
@Component
@RequiredArgsConstructor
public class RatingMongoSync {

    private static final Logger log = LoggerFactory.getLogger(RatingMongoSync.class);

    private final RatingRepository ratingRepository;
    private final RatingMongoRepository ratingMongoRepository;
    private final RatingService ratingService;
    private final CityCatalog cityCatalog;

    @EventListener(ApplicationReadyEvent.class)
    public void sincronizar() {
        try {
            Set<String> espelhadas = ratingMongoRepository.findAll().stream()
                    .map(RatingDocument::getId)
                    .collect(Collectors.toSet());
            List<RatingModel> faltando = ratingRepository.findAll().stream()
                    .filter(r -> !espelhadas.contains(String.valueOf(r.getId())))
                    .toList();
            if (faltando.isEmpty()) return;

            Map<String, CatalogPlace> catalogo = new HashMap<>();
            cityCatalog.getPlaces().forEach(p -> catalogo.putIfAbsent(PlaceXid.of(p.name()), p));
            for (RatingModel rating : faltando) {
                CatalogPlace lugar = catalogo.get(rating.getTouristSpotXid());
                ratingService.espelharNoMongo(rating,
                        lugar != null ? lugar.name() : null,
                        lugar != null ? lugar.category() : null);
            }
            log.info("{} avaliacoes copiadas para o espelho do Mongo.", faltando.size());
        } catch (DataAccessException e) {
            // Mongo fora do ar nao impede o backend de subir; a copia fica para a proxima subida.
            log.warn("Nao foi possivel sincronizar as avaliacoes com o Mongo: {}", e.getMessage());
        }
    }
}
