package com.trajetto.backend.rating.repository;

import com.trajetto.backend.rating.model.RatingModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<RatingModel, Long> {

    List<RatingModel> findByTouristSpotXid(String touristSpotXid);

    /** Por local avaliado: [xid, media, quantidade]. */
    @Query("SELECT r.touristSpotXid, AVG(r.rating), COUNT(r) FROM RatingModel r GROUP BY r.touristSpotXid")
    List<Object[]> summaryBySpot();

    Optional<RatingModel> findByTouristSpotXidAndUserId(String touristSpotXid, Long userId);
}
