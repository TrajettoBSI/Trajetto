package com.trajetto.backend.role.model;

/**
 * Códigos das permissões cadastradas em {@code permissions} (migração V9). As regras de
 * autorização usam estes códigos com {@code hasAuthority}, nunca o código do perfil.
 */
public final class Permissions {

    public static final String USERS_VIEW = "USERS_VIEW";
    public static final String USERS_MANAGE = "USERS_MANAGE";
    public static final String ROLES_ASSIGN = "ROLES_ASSIGN";
    public static final String STATS_VIEW = "STATS_VIEW";

    private Permissions() {
    }
}
