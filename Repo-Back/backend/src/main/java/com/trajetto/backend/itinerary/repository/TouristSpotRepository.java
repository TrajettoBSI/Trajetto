package com.trajetto.backend.itinerary.repository;

import com.trajetto.backend.itinerary.model.TouristSpotDocument;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Consultas sobre o catalogo de pontos turisticos (colecao {@code tourist_spots}).
 *
 * <p>Toda a filtragem do mapa acontece aqui, no banco -- inclusive a de
 * proximidade, que usa o {@code $geoNear} do aggregation framework sobre o
 * indice {@code 2dsphere} de {@code location}.</p>
 *
 * <p>{@code $geoNear} nao pode conviver com {@code $text} na mesma pipeline
 * (restricao do MongoDB), entao a busca por texto usa {@code $regex}
 * case-insensitive em vez do indice de texto -- o mesmo tipo de varredura que
 * o {@code LIKE '%texto%'} da versao MySQL ja fazia, sem regressao.</p>
 */
@Repository
public class TouristSpotRepository {

    /** Uma linha da busca. {@code distanceMeters} e nulo quando nao ha ponto de referencia. */
    public interface TouristSpotRow {
        Long getId();
        String getName();
        String getAddress();
        Double getLatitude();
        Double getLongitude();
        String getCategory();
        String getFee();
        String getOpeningHours();
        String getPhone();
        String getWebsite();
        String getWikidata();
        String getWikipedia();
        String getWheelchair();
        /** Perfis do ponto separados por virgula, ou nulo se nao houver nenhum. */
        String getProfiles();
        Double getDistanceMeters();
    }

    /** Projecao de saida do aggregate: os campos do documento mais a distancia que o $geoNear injeta. */
    private static final class Row implements TouristSpotRow {
        private Long id;
        private String name;
        private String address;
        private double latitude;
        private double longitude;
        private String category;
        private String fee;
        private String openingHours;
        private String phone;
        private String website;
        private String wikidata;
        private String wikipedia;
        private String wheelchair;
        private List<String> profiles;
        private Double distanceMeters;

        @Override public Long getId() { return id; }
        @Override public String getName() { return name; }
        @Override public String getAddress() { return address; }
        @Override public Double getLatitude() { return latitude; }
        @Override public Double getLongitude() { return longitude; }
        @Override public String getCategory() { return category; }
        @Override public String getFee() { return fee; }
        @Override public String getOpeningHours() { return openingHours; }
        @Override public String getPhone() { return phone; }
        @Override public String getWebsite() { return website; }
        @Override public String getWikidata() { return wikidata; }
        @Override public String getWikipedia() { return wikipedia; }
        @Override public String getWheelchair() { return wheelchair; }
        @Override public Double getDistanceMeters() { return distanceMeters; }

        @Override
        public String getProfiles() {
            return profiles == null || profiles.isEmpty() ? null : String.join(",", profiles);
        }
    }

    private final MongoTemplate mongoTemplate;

    public TouristSpotRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<TouristSpotRow> search(String search, String category, String fee, Boolean onlyWithHours,
                                        String profile, Double lat, Double lng, Double radius, int limit) {
        boolean near = lat != null && lng != null && radius != null;

        List<AggregationOperation> stages = new ArrayList<>();

        if (near) {
            // $geoNear cru: NearQuery + Distance/Metrics do Spring Data aplica
            // um fator de conversao de unidade tanto na entrada (maxDistance)
            // quanto na saida (o campo de distancia) -- unidade "metros" nao
            // existe nesse enum (so km, milhas e radianos), entao o resultado
            // sempre saia errado de um lado ou do outro. Em metros puro,
            // sem nenhuma conversao, e o formato nativo do $geoNear esferico
            // sobre um indice 2dsphere.
            AggregationOperation geoNear = context -> new Document("$geoNear", new Document()
                    .append("near", new Document("type", "Point")
                            .append("coordinates", List.of(lng, lat)))
                    .append("distanceField", "distanceMeters")
                    .append("spherical", true)
                    .append("maxDistance", radius));
            stages.add(geoNear);
        }

        List<Criteria> filters = new ArrayList<>();
        if (search != null) {
            String regex = Pattern.quote(search);
            filters.add(new Criteria().orOperator(
                    Criteria.where("name").regex(regex, "i"),
                    Criteria.where("address").regex(regex, "i")));
        }
        // MySQL comparava por uma collation que ja ignora maiusculas
        // (utf8mb4_0900_ai_ci); o Mongo compara binario por padrao, entao a
        // igualdade exata vira regex ancorado e case-insensitive para manter
        // o mesmo comportamento.
        if (category != null) {
            filters.add(Criteria.where("category").regex(exact(category), "i"));
        }
        if (fee != null) {
            filters.add(Criteria.where("fee").regex(exact(fee), "i"));
        }
        if (Boolean.TRUE.equals(onlyWithHours)) {
            filters.add(Criteria.where("openingHours").ne(null));
        }
        if (profile != null) {
            filters.add(Criteria.where("profiles").regex(exact(profile), "i"));
        }
        if (!filters.isEmpty()) {
            stages.add(Aggregation.match(filters.size() == 1
                    ? filters.get(0)
                    : new Criteria().andOperator(filters.toArray(new Criteria[0]))));
        }

        // Com ponto de referencia, do mais perto para o mais longe; sem ele, na
        // ordem do catalogo -- id desempata e da um resultado deterministico
        // mesmo quando duas distancias empatam.
        stages.add(near
                ? Aggregation.sort(Sort.by(Sort.Order.asc("distanceMeters"), Sort.Order.asc("id")))
                : Aggregation.sort(Sort.Direction.ASC, "id"));
        stages.add(Aggregation.limit(limit));

        Aggregation aggregation = Aggregation.newAggregation(
                TouristSpotDocument.class, stages.toArray(new AggregationOperation[0]));

        return mongoTemplate.aggregate(aggregation, TouristSpotDocument.class, Row.class)
                .getMappedResults()
                .stream()
                .map(row -> (TouristSpotRow) row)
                .toList();
    }

    public List<String> findCategories() {
        List<String> categories = mongoTemplate.findDistinct(
                Query.query(Criteria.where("category").ne(null)),
                "category", TouristSpotDocument.class, String.class);
        return categories.stream().sorted().toList();
    }

    public List<String> findProfiles() {
        // Lista vazia conta como valor distinto "undefined" no MongoDB; o filtro
        // de tamanho descarta esses pontos sem perfil antes do distinct.
        List<String> profiles = mongoTemplate.findDistinct(
                Query.query(Criteria.where("profiles").not().size(0)),
                "profiles", TouristSpotDocument.class, String.class);
        return profiles.stream().sorted().toList();
    }

    /** Regex que so bate com o valor inteiro (^...$), com os caracteres especiais escapados. */
    private static String exact(String value) {
        return "^" + Pattern.quote(value) + "$";
    }
}
