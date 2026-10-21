package com.trajetto.backend.role.dto;

import com.trajetto.backend.role.model.PermissionModel;
import com.trajetto.backend.role.model.RoleModel;

import java.util.List;

public record RoleResponseDTO(
        String code,
        String name,
        String description,
        List<String> permissions
) {
    public RoleResponseDTO(RoleModel role) {
        this(role.getCode(), role.getName(), role.getDescription(),
                role.getPermissions().stream().map(PermissionModel::getCode).sorted().toList());
    }
}
