package com.trajetto.backend.user;

import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.service.UserService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * QA01.1 — a edicao de cadastro pelo painel admin nao pode apagar o perfil de viajante.
 *
 * <p>A tela de detalhe do usuario envia nome, e-mail, nascimento, pais e telefone, mas nao
 * o perfil, que so muda pelo teste de perfil. O servico gravava o nulo recebido e o
 * usuario perdia o perfil -- e com ele as recomendacoes do roteiro -- a cada edicao.</p>
 */
@SpringBootTest
@Transactional
class UserUpdateIntegrationTest {

    private static final long USUARIO = 996_001L;

    @Autowired
    private UserService userService;

    @Autowired
    private EntityManager em;

    @BeforeEach
    void seed() {
        em.createNativeQuery("INSERT INTO users (code, first_name, last_name, email, password, is_verified, isAdmin, country, travelerProfile) "
                + "VALUES (" + USUARIO + ", 'Edicao', 'Admin', 'edicao.admin@trajetto.local', 'x', 1, 0, 'Brasil', 'CULTURAL')")
                .executeUpdate();
        em.flush();
        em.clear();
    }

    private UserModel edicaoDoPainel(String perfil) {
        UserModel edicao = new UserModel();
        edicao.setId(USUARIO);
        edicao.setFirstName("Nome Novo");
        edicao.setLastName("Admin");
        edicao.setEmail("edicao.admin@trajetto.local");
        edicao.setCountry("Brasil");
        edicao.setTravelerProfile(perfil);
        return edicao;
    }

    @Test
    @DisplayName("Editar o cadastro sem enviar o perfil mantem o perfil de viajante")
    void edicaoSemPerfilMantemOPerfil() {
        UserModel salvo = userService.updateUser(edicaoDoPainel(null));

        assertEquals("Nome Novo", salvo.getFirstName());
        assertEquals("CULTURAL", salvo.getTravelerProfile());
    }

    @Test
    @DisplayName("Enviar um perfil continua alterando o perfil")
    void edicaoComPerfilAlteraOPerfil() {
        UserModel salvo = userService.updateUser(edicaoDoPainel("NATUREZA"));

        assertEquals("NATUREZA", salvo.getTravelerProfile());
    }
}
