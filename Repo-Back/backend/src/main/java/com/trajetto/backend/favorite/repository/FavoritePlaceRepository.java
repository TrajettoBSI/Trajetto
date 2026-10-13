package com.trajetto.backend.favorite.repository;

import com.trajetto.backend.favorite.model.FavoritePlaceModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoritePlaceRepository extends JpaRepository<FavoritePlaceModel, Long> {

    List<FavoritePlaceModel> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<FavoritePlaceModel> findByUserIdAndXid(Long userId, String xid);
}
