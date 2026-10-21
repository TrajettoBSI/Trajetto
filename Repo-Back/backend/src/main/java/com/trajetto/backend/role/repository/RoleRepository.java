package com.trajetto.backend.role.repository;

import com.trajetto.backend.role.model.RoleModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<RoleModel, Long> {

    Optional<RoleModel> findByCode(String code);
}
