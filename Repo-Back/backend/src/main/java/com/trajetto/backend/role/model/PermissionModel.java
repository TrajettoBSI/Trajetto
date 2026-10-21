package com.trajetto.backend.role.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Uma ação protegida do sistema. Os códigos usados pelas regras de autorização estão em
 * {@link Permissions}.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "permissions")
public class PermissionModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 60)
    private String code;

    @Column(name = "description")
    private String description;
}
