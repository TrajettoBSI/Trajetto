package com.trajetto.backend.gender.repository;

import com.trajetto.backend.gender.model.GenderModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GenderRepository extends JpaRepository<GenderModel, Long> {
}
