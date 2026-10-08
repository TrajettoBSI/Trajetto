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
import org.springframework.data.mongodb.core.query.Collation;
import org.springframework.stereotype.Component;

/**
 * Indices da colecao {@code tourist_spots}, equivalentes aos que a migracao
 * V8 cria no MySQL: indice comum em {@code category}, e o indice espacial em
 * {@code location} que resolve a busca por proximidade.
 *
 * <p>{@code category} e {@code profiles} usam uma <b>collation</b> de forca
 * primaria -- ignora maiuscula/minuscula e acento, o mesmo nivel da collation
 * {@code utf8mb4_0900_ai_ci} do MySQL. Sem isso, a busca ignorando caixa que
 * o {@code TouristSpotRepository} faz ate aparece como "IXSCAN" no plano,
 * mas examina a colecao inteira -- o indice so serve de verdade quando a
 * comparacao da query usa a mesma collation dele.</p>
 *
 * <p>{@code createIndex} e idempotente para indices sem collation -- chamar
 * de novo com a mesma definicao nao recria nada. Com collation, o Mongo
 * recusa recriar um indice existente com opcoes diferentes; por isso estes
 * dois sao sempre apagados e recriados, barato nessa escala (~800
 * documentos).</p>
 */
@Component
@Order(2)
public class TouristSpotMongoIndexes implements ApplicationRunner {

    /** Mesmo nivel que a collation utf8mb4_0900_ai_ci do MySQL: ignora caixa e acento. */
    private static final Collation CASE_INSENSITIVE = Collation.of("pt").strength(Collation.ComparisonLevel.primary());

    private final MongoTemplate mongoTemplate;

    public TouristSpotMongoIndexes(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        IndexOperations indexOps = mongoTemplate.indexOps("tourist_spots");

        recreateWithCollation(indexOps, "category_1", new Index().named("category_1")
                .on("category", Sort.Direction.ASC).collation(CASE_INSENSITIVE));
        recreateWithCollation(indexOps, "profiles_1", new Index().named("profiles_1")
                .on("profiles", Sort.Direction.ASC).collation(CASE_INSENSITIVE));

        indexOps.createIndex(TextIndexDefinition.builder()
                .onField("name")
                .onField("address")
                .build());
        indexOps.createIndex(new GeospatialIndex("location").typed(GeoSpatialIndexType.GEO_2DSPHERE));
    }

    private static void recreateWithCollation(IndexOperations indexOps, String name, Index withCollation) {
        try {
            indexOps.dropIndex(name);
        } catch (Exception ignored) {
            // Primeira subida: o indice ainda nao existe, nao ha o que apagar.
        }
        indexOps.createIndex(withCollation);
    }
}
