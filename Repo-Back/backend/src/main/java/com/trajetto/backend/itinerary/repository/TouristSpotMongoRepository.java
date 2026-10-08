package com.trajetto.backend.itinerary.repository;

import com.trajetto.backend.itinerary.model.TouristSpotDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Escrita do catalogo de pontos turisticos na colecao MongoDB
 * {@code tourist_spots} (usada por {@link com.trajetto.backend.itinerary.data.TouristSpotCatalogSync}).
 *
 * <p>A busca com filtros/proximidade nao mora aqui -- ela precisa do
 * aggregation framework ({@code $geoNear}), que fica em
 * {@link com.trajetto.backend.itinerary.service.TouristSpotSearchService}.</p>
 */
public interface TouristSpotMongoRepository extends MongoRepository<TouristSpotDocument, Long> {
}
