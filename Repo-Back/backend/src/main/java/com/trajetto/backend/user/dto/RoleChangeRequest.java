package com.trajetto.backend.user.dto;

import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.role.model.Roles;

/**
 * Corpo de {@code PUT /user/{id}/role}.
 * <p>
 * O formato atual é {@code {"role": "ADMIN"}}, com o código de qualquer perfil cadastrado. O
 * formato antigo, {@code {"isAdmin": true}}, que o aplicativo ainda envia, continua aceito e é
 * lido como ADMIN ou USER.
 */
public record RoleChangeRequest(String role, Boolean isAdmin) {

    public String resolveRoleCode() {
        if (role != null && !role.isBlank()) {
            return role.trim().toUpperCase();
        }
        if (isAdmin != null) {
            return isAdmin ? Roles.ADMIN : Roles.USER;
        }
        throw new InvalidRequestException("Informe o perfil de destino no campo \"role\".");
    }
}
