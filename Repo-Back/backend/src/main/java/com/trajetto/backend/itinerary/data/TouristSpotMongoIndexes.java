package com.trajetto.backend.itinerary.data;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeospatialIndex;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.TextIndexDefinition;
import org.springframework.stereotype.Component;

/**
 * Indices da colecao {@code tourist_spots}, equivalentes aos que a migracao
 * V8 cria no MySQL: indice comum em {@code category}, e o indice espacial em
 * {@code location} que resolve a busca por proximidade.
 *
 * <p>{@code createIndex} e idempotente -- chamar de novo com a mesma
 * definicao nao recria nada -- entao roda a cada subida sem custo extra em
 * banco ja indexado.</p>
 */
@Component
@Order(2)
public class TouristSpotMongoIndexes implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    public TouristSpotMongoIndexes(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        IndexOperations indexOps = mongoTemplate.indexOps("tourist_spots");

        indexOps.createIndex(new Index().on("category", Sort.Direction.ASC));
        indexOps.createIndex(new Index().on("profiles", Sort.Direction.ASC));
        indexOps.createIndex(TextIndexDefinition.builder()
                .onField("name")
                .onField("address")
                .build());
        indexOps.createIndex(new GeospatialIndex("location").typed(GeoSpatialIndexType.GEO_2DSPHERE));
    }
}
