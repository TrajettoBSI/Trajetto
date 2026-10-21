package com.trajetto.backend.security;

import com.trajetto.backend.role.model.PermissionModel;
import com.trajetto.backend.role.model.RoleModel;
import com.trajetto.backend.user.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Autoridades vindas do banco: {@code ROLE_<código do perfil>} e o código de cada permissão do
 * perfil. As regras de acesso usam as permissões ({@code hasAuthority('STATS_VIEW')}); o
 * {@code ROLE_} fica disponível para quem precisar saber o perfil.
 */
@Component
public class DatabaseUserAuthorityResolver implements UserAuthorityResolver {

    private final UserRepository userRepository;

    public DatabaseUserAuthorityResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Collection<GrantedAuthority>> authoritiesOf(Long userId) {
        return userRepository.findById(userId).map(user -> toAuthorities(user.getRole()));
    }

    static Collection<GrantedAuthority> toAuthorities(RoleModel role) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getCode()));
        for (PermissionModel permission : role.getPermissions()) {
            authorities.add(new SimpleGrantedAuthority(permission.getCode()));
        }
        return authorities;
    }
}
