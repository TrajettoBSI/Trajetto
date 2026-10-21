package com.trajetto.backend.security;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Optional;

/**
 * Descobre o que o portador de um token pode fazer agora.
 * <p>
 * O token só identifica o usuário; o perfil e as permissões são lidos a cada requisição. Assim
 * uma troca de perfil vale na hora, sem esperar o token antigo vencer.
 */
@FunctionalInterface
public interface UserAuthorityResolver {

    /**
     * @return as autoridades do usuário, ou vazio quando ele não existe mais.
     */
    Optional<Collection<GrantedAuthority>> authoritiesOf(Long userId);
}
