package com.trajetto.backend.role.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.trajetto.backend.role.model.PermissionModel;
import com.trajetto.backend.role.model.RoleModel;

import java.util.List;

@Schema(description = "Perfil de acesso e suas permissões")
public record RoleResponseDTO(
        @Schema(description = "Código do perfil", example = "ADMIN")
        String code,
        @Schema(description = "Nome exibido", example = "Administrador")
        String name,
        @Schema(description = "Descrição", example = "Gerencia usuarios, perfis e acessa o painel gerencial.")
        String description,
        @Schema(description = "Permissões do perfil", example = "[\"ROLES_ASSIGN\", \"STATS_VIEW\", \"USERS_MANAGE\", \"USERS_VIEW\"]")
        List<String> permissions
) {
    public RoleResponseDTO(RoleModel role) {
        this(role.getCode(), role.getName(), role.getDescription(),
                role.getPermissions().stream().map(PermissionModel::getCode).sorted().toList());
    }
}
