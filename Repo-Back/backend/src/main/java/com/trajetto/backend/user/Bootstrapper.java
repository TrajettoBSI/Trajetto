package com.trajetto.backend.user;

import com.trajetto.backend.role.model.Permissions;
import com.trajetto.backend.role.model.Roles;
import com.trajetto.backend.role.repository.RoleRepository;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@PropertySource("classpath:security.properties")
public class Bootstrapper implements ApplicationListener<ContextRefreshedEvent> {
    private static final Logger log = LoggerFactory.getLogger(Bootstrapper.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AdminConfig adminConfig;

    public Bootstrapper(UserRepository userRepository, RoleRepository roleRepository, AdminConfig adminConfig) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.adminConfig = AdminConfig.criarCom(adminConfig);
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        // Sem ninguém capaz de atribuir perfis, cria o administrador inicial.
        if (userRepository.countByPermission(Permissions.ROLES_ASSIGN) == 0) {
            UserModel admin = new UserModel();
            admin.setEmail(adminConfig.getEmail());
            admin.setPassword(passwordEncoder.encode(adminConfig.getPassword()));
            admin.setFirstName(adminConfig.getName());
            admin.setLastName("");
            //admin.setCpf("000.000.000-00");
            admin.setRole(roleRepository.findByCode(Roles.ADMIN)
                    .orElseThrow(() -> new IllegalStateException("Perfil ADMIN ausente; a migração V16 foi aplicada?")));
            userRepository.save(admin);
            log.info("ADMIN user created!");
        }
    }
}