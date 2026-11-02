package com.trajetto.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.trajetto.backend.role.model.Roles;

/**
 * Corpo de {@code PUT /user/{id}/role}.
 * <p>
 * O formato atual é {@code {"role": "ADMIN"}}, com o código de qualquer perfil cadastrado. O
 * formato antigo, {@code {"isAdmin": true}}, que o aplicativo ainda envia, continua aceito e é
 * lido como ADMIN ou USER. Sem nenhum dos dois, vale o comportamento original do endpoint:
 * alternar entre ADMIN e USER.
 */
@Schema(description = "Novo perfil de acesso do usuário. Envie role (formato atual) ou isAdmin (formato antigo); sem nenhum dos dois, alterna entre ADMIN e USER.")
public record RoleChangeRequest(
        @Schema(description = "Código do perfil de destino", example = "ADMIN") String role,
        @Schema(description = "Formato antigo: true vira ADMIN, false vira USER", example = "true", nullable = true) Boolean isAdmin) {

    /** @return o código do perfil de destino, ou {@code null} para alternar entre ADMIN e USER. */
    public String resolveRoleCode() {
        if (role != null && !role.isBlank()) {
            return role.trim().toUpperCase();
        }
        if (isAdmin != null) {
            return isAdmin ? Roles.ADMIN : Roles.USER;
        }
        return null;
    }
}
