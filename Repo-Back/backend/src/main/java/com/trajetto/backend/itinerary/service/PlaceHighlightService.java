package com.trajetto.backend.itinerary.service;

import com.trajetto.backend.itinerary.data.BookingLinks;
import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.data.PlaceXid;
import com.trajetto.backend.itinerary.data.WikimediaImages;
import com.trajetto.backend.itinerary.dto.PlaceHighlightDTO;
import com.trajetto.backend.itinerary.dto.TouristSpotResponseDTO;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Lugares em destaque: os mais populares do catalogo combinados com a nota dos usuarios.
 *
 * <p>A nota entra como media bayesiana: um lugar com uma unica nota 5 nao passa na frente
 * de um com dezenas de notas 4,8, e um lugar sem avaliacao conta como nota media
 * ({@link #PRIOR_MEAN}). Assim o Coliseu aparece mesmo antes de alguem avaliar, e um lugar
 * mal avaliado cai. A lista tem no maximo um lugar por cidade.</p>
 */
@Service
@RequiredArgsConstructor
public class PlaceHighlightService {

    public static final int MAX_LIMIT = 10;

    private static final double PRIOR_MEAN = 3.0;
    private static final double PRIOR_WEIGHT = 2.0;
    /** A popularidade soma ate isso a nota: e o que a mais popular do catalogo ganha. */
    private static final double POPULARITY_WEIGHT = 2.0;

    private static final Set<String> NOT_HIGHLIGHTS = Set.of("restaurant", "cafe", "ice_cream", "bar", "pub");

    private final CityCatalog cityCatalog;
    private final RatingRepository ratingRepository;
    private final WikimediaImages wikimediaImages;

    private record Stats(double average, long count) {}

    private record Scored(CatalogPlace place, Stats stats, double score) {}

    public List<PlaceHighlightDTO> highlights(int limit) {
        int size = Math.max(1, Math.min(limit, MAX_LIMIT));
        Map<String, Stats> stats = ratingRepository.summaryBySpot().stream()
                .collect(Collectors.toMap(row -> (String) row[0],
                        row -> new Stats(((Number) row[1]).doubleValue(), ((Number) row[2]).longValue())));
        List<CatalogPlace> places = cityCatalog.getPlaces().stream()
                .filter(place -> !NOT_HIGHLIGHTS.contains(place.category()))
                .toList();
        double maxPopularity = Math.log1p(places.stream().mapToInt(CatalogPlace::popularity).max().orElse(0));

        List<Scored> ranked = places.stream()
                .map(place -> {
                    Stats s = stats.getOrDefault(PlaceXid.of(place.name()), new Stats(0, 0));
                    double rating = (s.average() * s.count() + PRIOR_MEAN * PRIOR_WEIGHT) / (s.count() + PRIOR_WEIGHT);
                    double popularity = maxPopularity == 0 ? 0
                            : POPULARITY_WEIGHT * Math.log1p(place.popularity()) / maxPopularity;
                    return new Scored(place, s, rating + popularity);
                })
                .sorted(Comparator.comparingDouble(Scored::score).reversed())
                .toList();

        Set<String> cities = new HashSet<>();
        return ranked.stream()
                .filter(s -> cities.add(s.place().city()))
                .limit(size)
                .map(this::toDTO)
                .toList();
    }

    private PlaceHighlightDTO toDTO(Scored scored) {
        CatalogPlace p = scored.place();
        String xid = PlaceXid.of(p.name());
        PlaceHighlightDTO.Review review = ratingRepository.findByTouristSpotXid(xid).stream()
                .filter(r -> r.getComment() != null && !r.getComment().isBlank())
                .max(Comparator.comparing(RatingModel::getCreatedAt))
                .map(r -> new PlaceHighlightDTO.Review(r.getUserName(), r.getRating(), r.getComment()))
                .orElse(null);
        TouristSpotResponseDTO spot = new TouristSpotResponseDTO(
                p.name(), p.address(), p.latitude(), p.longitude(), p.profiles(), p.openingHours(), p.category(),
                p.fee(), p.phone(), p.website(), p.wikidata(), p.wikipedia(), p.wheelchair(), null,
                BookingLinks.forPlace(p.name()), p.names());
        return new PlaceHighlightDTO(spot, xid, p.city(), wikimediaImages.imageUrl(p.wikidata()).orElse(null),
                scored.stats().average(), scored.stats().count(), review);
    }
}
