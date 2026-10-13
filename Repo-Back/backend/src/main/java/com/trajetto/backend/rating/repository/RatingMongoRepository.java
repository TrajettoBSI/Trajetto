package com.trajetto.backend.rating.repository;

import com.trajetto.backend.rating.model.RatingDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Escrita do espelho Mongo das avaliacoes (usado por
 * {@link com.trajetto.backend.rating.service.RatingService} a cada
 * criar/editar/apagar). A leitura dos rankings fica em
 * {@code RatingMongoStatsRepository}, que usa aggregation em vez de metodos
 * derivados.
 */
public interface RatingMongoRepository extends MongoRepository<RatingDocument, String> {
}
