package com.trajetto.backend.user.repository;

import com.trajetto.backend.user.model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<UserModel,Long> {

    UserModel findByEmail(String email);

    boolean existsByEmail(String email);

    //boolean existsByCpf(String cpf);
    
    /**
     * Quantos usuários têm um perfil com a permissão informada. Usado para impedir que o último
     * usuário capaz de atribuir perfis seja removido ou rebaixado.
     */
    @Query("SELECT COUNT(u) FROM UserModel u JOIN u.role r JOIN r.permissions p WHERE p.code = :permission")
    long countByPermission(@Param("permission") String permission);
}
