package com.trajetto.backend.role;

import com.trajetto.backend.security.Jwt;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * OB06.1 — perfis de acesso extensíveis.
 * <p>
 * Percorre o caminho real: token JWT emitido pelo backend, filtro que relê o perfil no banco e
 * as regras de autorização por permissão. Cada teste roda numa transação desfeita no final.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RoleAuthorizationIntegrationTest {

    private static final long ADMIN = 997_001L;
    private static final long VIAJANTE = 997_002L;
    private static final long GESTOR = 997_003L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManager em;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Jwt jwt;

    /** O cadastro envia e-mail de verificação; aqui não deve sair mensagem nenhuma. */
    @MockitoBean
    private JavaMailSender mailSender;

    private void sql(String comando) {
        em.createNativeQuery(comando).executeUpdate();
    }

    private void usuario(long code, String nome, String perfil) {
        sql("INSERT INTO users (code, first_name, last_name, email, password, is_verified, role_id) "
                + "VALUES (" + code + ", '" + nome + "', 'Perfil', '" + nome.toLowerCase() + ".perfil@trajetto.local', 'x', 1, "
                + "(SELECT id FROM roles WHERE code = '" + perfil + "'))");
    }

    @BeforeEach
    void seed() {
        // Um perfil que não existia no código: só lê o painel. Criado apenas com SQL.
        sql("INSERT INTO roles (code, name, description) VALUES ('GESTOR', 'Gestor', 'Só acompanha o painel.')");
        sql("INSERT INTO role_permissions (role_id, permission_id) "
                + "SELECT r.id, p.id FROM roles r JOIN permissions p "
                + "WHERE r.code = 'GESTOR' AND p.code = 'STATS_VIEW'");

        usuario(ADMIN, "Admin", "ADMIN");
        usuario(VIAJANTE, "Viajante", "USER");
        usuario(GESTOR, "Gestor", "GESTOR");
        em.flush();
        em.clear();
    }

    private MockHttpServletRequestBuilder como(long usuario, MockHttpServletRequestBuilder requisicao) {
        UserModel user = userRepository.findById(usuario).orElseThrow();
        return requisicao.header(HttpHeaders.AUTHORIZATION, Jwt.BEARER_PREFIX + jwt.createToken(user));
    }

    @Test
    @DisplayName("Migração: nenhum usuário ficou sem perfil e a coluna isAdmin deixou de existir")
    void migracaoDosUsuarios() {
        Number semPerfil = (Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE r.id IS NULL")
                .getSingleResult();
        Number colunaAntiga = (Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM information_schema.columns "
                        + "WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'isAdmin'")
                .getSingleResult();

        assertEquals(0, semPerfil.intValue());
        assertEquals(0, colunaAntiga.intValue());
    }

    @Test
    @DisplayName("Migração: o ADMIN tem as quatro permissões que o isAdmin liberava, e o USER nenhuma")
    @SuppressWarnings("unchecked")
    void permissoesDosPerfisMigrados() {
        List<String> admin = em.createNativeQuery(
                "SELECT p.code FROM roles r JOIN role_permissions rp ON rp.role_id = r.id "
                        + "JOIN permissions p ON p.id = rp.permission_id WHERE r.code = 'ADMIN' ORDER BY p.code")
                .getResultList();
        Number user = (Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM roles r JOIN role_permissions rp ON rp.role_id = r.id WHERE r.code = 'USER'")
                .getSingleResult();

        assertEquals(List.of("ROLES_ASSIGN", "STATS_VIEW", "USERS_MANAGE", "USERS_VIEW"), admin);
        assertEquals(0, user.intValue());
    }

    @Test
    @DisplayName("Viajante acessa o próprio perfil, mas recebe 403 na lista de usuários e no painel")
    void viajanteSemPermissao() throws Exception {
        mockMvc.perform(como(VIAJANTE, get("/user/me")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.isAdmin").value(false));
        mockMvc.perform(como(VIAJANTE, get("/user"))).andExpect(status().isForbidden());
        mockMvc.perform(como(VIAJANTE, get("/stats/overview"))).andExpect(status().isForbidden());
        mockMvc.perform(como(VIAJANTE, put("/user/" + ADMIN + "/role")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"USER\"}")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Administrador acessa a lista de usuários, o painel e a lista de perfis")
    void administradorComPermissao() throws Exception {
        mockMvc.perform(como(ADMIN, get("/user"))).andExpect(status().isOk());
        mockMvc.perform(como(ADMIN, get("/stats/overview"))).andExpect(status().isOk());
        mockMvc.perform(como(ADMIN, get("/roles")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code == 'GESTOR')].permissions[0]").value("STATS_VIEW"));
    }

    @Test
    @DisplayName("Perfil novo, criado só no banco, recebe exatamente as permissões cadastradas para ele")
    void perfilNovoSemMudarCodigo() throws Exception {
        mockMvc.perform(como(GESTOR, get("/stats/overview"))).andExpect(status().isOk());
        mockMvc.perform(como(GESTOR, get("/user"))).andExpect(status().isForbidden());
        mockMvc.perform(como(GESTOR, get("/user/me")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("GESTOR"))
                .andExpect(jsonPath("$.permissions[0]").value("STATS_VIEW"));
    }

    @Test
    @DisplayName("Troca de perfil vale na requisição seguinte, com o mesmo token")
    void trocaDePerfilValeNaHora() throws Exception {
        String token = Jwt.BEARER_PREFIX + jwt.createToken(userRepository.findById(VIAJANTE).orElseThrow());

        mockMvc.perform(get("/user").header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isForbidden());

        mockMvc.perform(como(ADMIN, put("/user/" + VIAJANTE + "/role")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"ADMIN\"}")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));

        mockMvc.perform(get("/user").header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isOk());
    }

    @Test
    @DisplayName("O formato antigo {isAdmin} da troca de perfil continua aceito")
    void formatoAntigoDaTroca() throws Exception {
        mockMvc.perform(como(ADMIN, put("/user/" + VIAJANTE + "/role")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"isAdmin\":true}")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.isAdmin").value(true));
    }

    @Test
    @DisplayName("Perfil inexistente na troca responde 400")
    void perfilInexistente() throws Exception {
        mockMvc.perform(como(ADMIN, put("/user/" + VIAJANTE + "/role")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"SUPERUSUARIO\"}")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Cadastro público ignora isAdmin no corpo e sempre cria um viajante")
    void cadastroNaoEscalaPrivilegio() throws Exception {
        mockMvc.perform(post("/user/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"Intruso","lastName":"Teste","birthDate":"1990-01-01",
                                 "telephone":"41999999999","email":"intruso.perfil@trajetto.local",
                                 "country":"Brasil","password":"senha12345","isAdmin":true,"role":"ADMIN"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].role").value("USER"))
                .andExpect(jsonPath("$[0].isAdmin").value(false));
    }
}
