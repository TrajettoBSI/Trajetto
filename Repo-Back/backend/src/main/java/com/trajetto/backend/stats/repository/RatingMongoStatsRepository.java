package com.trajetto.backend.stats.repository;

import com.trajetto.backend.rating.model.RatingDocument;
import com.trajetto.backend.stats.dto.MostCommentedPlaceDTO;
import com.trajetto.backend.stats.dto.TopRatedPlaceDTO;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/**
 * Rankings de lugares por avaliacao, calculados por aggregation do MongoDB
 * sobre o espelho em {@code ratings} -- ver {@link RatingDocument} e
 * {@link com.trajetto.backend.rating.service.RatingService}.
 *
 * <p>Substitui as duas consultas SQL que existiam antes em
 * {@code RatingStatsRepository} (window function + CTE para achar o nome do
 * local). Como o documento ja carrega nome/categoria do local e perfil/pais
 * de quem avaliou, o pipeline nao precisa de nenhum join -- so
 * {@code $match} (o recorte do painel) + {@code $group} (media/contagem por
 * local) + {@code $sort} + {@code $limit}.</p>
 */
@Repository
public class RatingMongoStatsRepository {

    private static final int TAMANHO_DO_RANKING = 10;

    private final MongoTemplate mongoTemplate;

    public RatingMongoStatsRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /** Dez lugares com melhor media, com a media e o total de avaliacoes do recorte. */
    public List<TopRatedPlaceDTO> findTopRated(LocalDate from, LocalDate to, String profile, String country, String category) {
        List<AggregationOperation> stages = new ArrayList<>();
        matchDoRecorte(from, to, profile, country, category, null).ifPresent(m -> stages.add(Aggregation.match(m)));
        stages.add(Aggregation.group("touristSpotXid")
                .first("touristSpotName").as("name")
                .avg("rating").as("avgRating")
                .count().as("totalRatings"));
        stages.add(Aggregation.sort(Sort.by(
                Sort.Order.desc("avgRating"), Sort.Order.desc("totalRatings"), Sort.Order.asc("name"))));
        stages.add(Aggregation.limit(TAMANHO_DO_RANKING));

        Aggregation aggregation = Aggregation.newAggregation(RatingDocument.class, stages.toArray(new AggregationOperation[0]));
        return mongoTemplate.aggregate(aggregation, RatingDocument.class, TopRatedRow.class)
                .getMappedResults().stream()
                .map(r -> new TopRatedPlaceDTO(r.name, r.id, arredondado(r.avgRating), r.totalRatings))
                .toList();
    }

    /** Dez lugares com mais comentarios do recorte. Avaliacao sem texto nao conta. */
    public List<MostCommentedPlaceDTO> findMostCommented(LocalDate from, LocalDate to, String profile, String country, String category) {
        List<AggregationOperation> stages = new ArrayList<>();
        matchDoRecorte(from, to, profile, country, category, Criteria.where("comment").ne(null))
                .ifPresent(m -> stages.add(Aggregation.match(m)));
        stages.add(Aggregation.group("touristSpotXid")
                .first("touristSpotName").as("name")
                .count().as("commentCount"));
        stages.add(Aggregation.sort(Sort.by(Sort.Order.desc("commentCount"), Sort.Order.asc("name"))));
        stages.add(Aggregation.limit(TAMANHO_DO_RANKING));

        Aggregation aggregation = Aggregation.newAggregation(RatingDocument.class, stages.toArray(new AggregationOperation[0]));
        return mongoTemplate.aggregate(aggregation, RatingDocument.class, MostCommentedRow.class)
                .getMappedResults().stream()
                .map(r -> new MostCommentedPlaceDTO(r.name, r.id, r.commentCount))
                .toList();
    }

    /** Os mesmos criterios de {@code StatsRecortes.AVALIACAO_SQL}, so que como Criteria do Mongo. */
    private static java.util.Optional<Criteria> matchDoRecorte(LocalDate from, LocalDate to, String profile,
                                                                 String country, String category,
                                                                 Criteria extra) {
        List<Criteria> filtros = new ArrayList<>();
        if (from != null) {
            filtros.add(Criteria.where("createdAt").gte(from.atStartOfDay(ZoneId.systemDefault()).toInstant()));
        }
        if (to != null) {
            filtros.add(Criteria.where("createdAt").lt(to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()));
        }
        if (profile != null) {
            filtros.add(Criteria.where("userProfile").is(profile));
        }
        if (country != null) {
            filtros.add(Criteria.where("userCountry").is(country));
        }
        if (category != null) {
            filtros.add(Criteria.where("touristSpotCategory").is(category));
        }
        if (extra != null) {
            filtros.add(extra);
        }

        if (filtros.isEmpty()) {
            return java.util.Optional.empty();
        }
        return java.util.Optional.of(filtros.size() == 1 ? filtros.get(0) : new Criteria().andOperator(filtros.toArray(new Criteria[0])));
    }

    private static double arredondado(double valor) {
        return Math.round(valor * 10) / 10.0;
    }

    /** Projecao de saida do $group: _id (mapeado por "id") + o que cada ranking calculou. */
    private static final class TopRatedRow {
        private String id;
        private String name;
        private double avgRating;
        private long totalRatings;

        public String getId() { return id; }
        public String getName() { return name; }
        public double getAvgRating() { return avgRating; }
        public long getTotalRatings() { return totalRatings; }
    }

    private static final class MostCommentedRow {
        private String id;
        private String name;
        private long commentCount;

        public String getId() { return id; }
        public String getName() { return name; }
        public long getCommentCount() { return commentCount; }
    }
}
