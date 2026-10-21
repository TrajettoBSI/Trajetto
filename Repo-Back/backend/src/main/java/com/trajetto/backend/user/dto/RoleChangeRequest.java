package com.trajetto.backend.user.dto;

import com.trajetto.backend.role.model.Roles;

/**
 * Corpo de {@code PUT /user/{id}/role}.
 * <p>
 * O formato atual é {@code {"role": "ADMIN"}}, com o código de qualquer perfil cadastrado. O
 * formato antigo, {@code {"isAdmin": true}}, que o aplicativo ainda envia, continua aceito e é
 * lido como ADMIN ou USER. Sem nenhum dos dois, vale o comportamento original do endpoint:
 * alternar entre ADMIN e USER.
 */
public record RoleChangeRequest(String role, Boolean isAdmin) {

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
