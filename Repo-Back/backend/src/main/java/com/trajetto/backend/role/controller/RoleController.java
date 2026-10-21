package com.trajetto.backend.role.controller;

import com.trajetto.backend.role.dto.RoleResponseDTO;
import com.trajetto.backend.role.model.RoleModel;
import com.trajetto.backend.role.repository.RoleRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

/**
 * Perfis disponíveis para atribuição, com as permissões de cada um. É a lista que a tela de
 * troca de perfil consulta, em vez de conhecer os perfis de antemão.
 */
@RestController
@RequestMapping("/roles")
public class RoleController {

    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasAuthority('ROLES_ASSIGN')")
    @GetMapping
    public List<RoleResponseDTO> listRoles() {
        return roleRepository.findAll().stream()
                .sorted(Comparator.comparing(RoleModel::getId))
                .map(RoleResponseDTO::new)
                .toList();
    }
}
