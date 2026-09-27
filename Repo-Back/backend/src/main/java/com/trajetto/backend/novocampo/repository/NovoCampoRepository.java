package com.trajetto.backend.novocampo.repository;

import com.trajetto.backend.novocampo.model.NovoCampoModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NovoCampoRepository extends JpaRepository<NovoCampoModel, Long> {
}
