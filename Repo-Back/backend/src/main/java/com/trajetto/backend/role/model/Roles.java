package com.trajetto.backend.role.model;

/**
 * Códigos dos perfis criados pela migração V16. Outros perfis podem existir no banco; estes dois
 * têm papel fixo: {@link #USER} é o perfil de quem se cadastra pelo aplicativo e {@link #ADMIN}
 * é o do administrador criado na primeira inicialização.
 */
public final class Roles {

    public static final String ADMIN = "ADMIN";
    public static final String USER = "USER";

    private Roles() {
    }
}
