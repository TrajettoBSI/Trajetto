package com.trajetto.backend.itinerary.data;

import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.mongodb.core.CollectionOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.validation.Validator;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Garante que a colecao {@code tourist_spots} do MongoDB existe com um
 * validador de schema -- o equivalente, em NoSQL, aos {@code NOT NULL} e
 * {@code CHECK} que a migracao V8 do MySQL aplica sobre a mesma informacao.
 *
 * <p>So cria a colecao se ela ainda nao existir. Ao contrario de
 * {@link TouristSpotCatalogSync}, que reescreve os documentos a cada
 * inicializacao, a estrutura (schema, indices) e criada uma vez so -- recriar
 * o schema do zero a cada subida apagaria a colecao sem necessidade.</p>
 */
@Slf4j
@Component
@Order(1)
public class TouristSpotMongoSchema implements ApplicationRunner {

    private static final String COLLECTION = "tourist_spots";

    private final MongoTemplate mongoTemplate;

    public TouristSpotMongoSchema(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Verificando colecao Mongo '{}' no banco '{}'...", COLLECTION, mongoTemplate.getDb().getName());
        if (mongoTemplate.collectionExists(COLLECTION)) {
            log.info("Colecao '{}' ja existe, nada a fazer.", COLLECTION);
            return;
        }

        Document schema = new Document("$jsonSchema", new Document()
                .append("bsonType", "object")
                .append("required", List.of("name", "latitude", "longitude", "location"))
                .append("properties", new Document()
                        .append("name", new Document("bsonType", "string").append("minLength", 1))
                        .append("latitude", new Document("bsonType", "double")
                                .append("minimum", -90).append("maximum", 90))
                        .append("longitude", new Document("bsonType", "double")
                                .append("minimum", -180).append("maximum", 180))
                        .append("location", new Document("bsonType", "object")
                                .append("required", List.of("type", "coordinates"))
                                .append("properties", new Document()
                                        .append("type", new Document("enum", List.of("Point")))
                                        .append("coordinates", new Document("bsonType", "array"))))
                        .append("profiles", new Document("bsonType", "array")
                                .append("items", new Document("bsonType", "string")))
                ));

        mongoTemplate.createCollection(COLLECTION,
                CollectionOptions.empty().validator(Validator.document(schema)));
        log.info("Colecao '{}' criada com validador de schema.", COLLECTION);
    }
}
