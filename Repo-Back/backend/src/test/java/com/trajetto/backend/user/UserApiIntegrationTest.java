package com.trajetto.backend.user;

import com.fasterxml.jackson.databind.JsonNode;
import com.trajetto.backend.support.ApiIntegrationTest;
import com.trajetto.backend.user.model.UserModel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserApiIntegrationTest extends ApiIntegrationTest {

    private Map<String, Object> cadastro(String email) {
        Map<String, Object> body = new HashMap<>();
        body.put("firstName", "  maria  clara ");
        body.put("lastName", "souza");
        body.put("email", email);
        body.put("password", SENHA);
        body.put("telephone", "41999990000");
        body.put("country", "brasil");
        body.put("birthDate", "1998-03-10");
        return body;
    }

    @Test
    @DisplayName("Cadastro grava o usuario nao verificado, padroniza os nomes e envia o codigo por e-mail")
    void cadastroEnviaCodigo() throws Exception {
        mvc.perform(json(post("/user/create"), cadastro("Nova.Conta@Trajetto.local")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].firstName").value("Maria Clara"))
                .andExpect(jsonPath("$[0].country").value("Brasil"));

        UserModel salvo = userRepository.findByEmail("nova.conta@trajetto.local");
        assertFalse(salvo.isVerified());
        assertEquals(6, salvo.getVerificationCode().length());
        assertTrue(passwordEncoder.matches(SENHA, salvo.getPassword()));
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("Cadastro com e-mail de conta ja verificada responde 409")
    void cadastroComEmailEmUso() throws Exception {
        UserModel existente = usuario(false);

        mvc.perform(json(post("/user/create"), cadastro(existente.getEmail())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("RESOURCE_CONFLICT"));
    }

    @Test
    @DisplayName("Cadastro de conta ainda nao verificada reaproveita o registro e gera novo codigo")
    void cadastroDeContaNaoVerificada() throws Exception {
        UserModel pendente = usuario(false);
        pendente.setVerified(false);
        pendente.setVerificationCode("000000");
        userRepository.saveAndFlush(pendente);

        mvc.perform(json(post("/user/create"), cadastro(pendente.getEmail())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].id").value(pendente.getId()));
    }

    @Test
    @DisplayName("Cadastro com campos invalidos responde 400 listando os campos")
    void cadastroInvalido() throws Exception {
        Map<String, Object> body = cadastro("email-invalido");
        body.put("password", "123");

        mvc.perform(json(post("/user/create"), body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("Falha no envio do e-mail de verificacao responde 502")
    void cadastroComFalhaNoEmail() throws Exception {
        doThrow(new MailSendException("smtp fora")).when(mailSender).send(any(SimpleMailMessage.class));

        mvc.perform(json(post("/user/create"), cadastro("sem.email@trajetto.local")))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.code").value("EXTERNAL_SERVICE_ERROR"));
    }

    @Test
    @DisplayName("Verificacao de e-mail: codigo errado recusa, codigo certo ativa a conta")
    void verificacaoDeEmail() throws Exception {
        UserModel user = usuario(false);
        user.setVerified(false);
        user.setVerificationCode("123456");
        userRepository.saveAndFlush(user);

        mvc.perform(post("/user/verify").param("email", user.getEmail()).param("code", "999999"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/user/verify").param("email", "ninguem@trajetto.local").param("code", "123456"))
                .andExpect(status().isNotFound());
        mvc.perform(post("/user/verify").param("email", user.getEmail()).param("code", "123456"))
                .andExpect(status().isOk());

        UserModel verificado = userRepository.findByEmail(user.getEmail());
        assertTrue(verificado.isVerified());
        assertNull(verificado.getVerificationCode());
    }

    @Test
    @DisplayName("Codigo de verificacao vencido e recusado; o reenvio gera outro codigo valido")
    void codigoVencidoEReenvio() throws Exception {
        UserModel user = usuario(false);
        user.setVerified(false);
        user.setVerificationCode("123456");
        user.setVerificationCodeExpiresAt(LocalDateTime.now().minusMinutes(1));
        userRepository.saveAndFlush(user);

        mvc.perform(post("/user/verify").param("email", user.getEmail()).param("code", "123456"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Este código expirou. Peça um novo código."));

        mvc.perform(post("/user/verify/resend").param("email", user.getEmail().toUpperCase()))
                .andExpect(status().isOk());
        verify(mailSender).send(any(SimpleMailMessage.class));

        UserModel reenviado = userRepository.findByEmail(user.getEmail());
        assertNotEquals("123456", reenviado.getVerificationCode());
        assertTrue(reenviado.getVerificationCodeExpiresAt().isAfter(LocalDateTime.now().plusMinutes(9)));

        mvc.perform(post("/user/verify").param("email", user.getEmail()).param("code", reenviado.getVerificationCode()))
                .andExpect(status().isOk());
        mvc.perform(post("/user/verify/resend").param("email", user.getEmail()))
                .andExpect(status().isConflict());
        mvc.perform(post("/user/verify/resend").param("email", "ninguem@trajetto.local"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Login devolve token e dados do usuario; senha errada responde 401; conta nao verificada responde 422")
    void login() throws Exception {
        UserModel user = usuario(false);

        JsonNode resposta = corpo(mvc.perform(json(post("/user/login"), Map.of("email", user.getEmail(), "password", SENHA)))
                .andExpect(status().isOk())
                .andReturn());
        assertFalse(resposta.get("token").asText().isBlank());

        mvc.perform(json(post("/user/login"), Map.of("email", user.getEmail(), "password", "senha-errada")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

        user.setVerified(false);
        userRepository.saveAndFlush(user);
        mvc.perform(json(post("/user/login"), Map.of("email", user.getEmail(), "password", SENHA)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("O usuario le e edita o proprio perfil pelo /user/me")
    void perfilProprio() throws Exception {
        UserModel user = usuario(false);

        mvc.perform(comToken(get("/user/me"), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(user.getEmail()));

        Map<String, Object> edicao = new HashMap<>();
        edicao.put("firstName", "Novo Nome");
        edicao.put("country", "Italia");
        edicao.put("travelerProfile", "AVENTUREIRO");
        mvc.perform(json(comToken(put("/user/me"), user), edicao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Novo Nome"))
                .andExpect(jsonPath("$.travelerProfile").value("AVENTUREIRO"));

        mvc.perform(get("/user/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Listagem e consulta de usuarios sao so do administrador")
    void listagemSoParaAdmin() throws Exception {
        UserModel admin = usuario(true);
        UserModel comum = usuario(false);

        mvc.perform(comToken(get("/user"), admin)).andExpect(status().isOk());
        mvc.perform(comToken(get("/user/" + comum.getId()), admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(comum.getEmail()));
        mvc.perform(comToken(get("/user/999999999"), admin)).andExpect(status().isNotFound());
        mvc.perform(comToken(get("/user"), comum)).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Administrador edita o cadastro de outro usuario")
    void edicaoPeloAdmin() throws Exception {
        UserModel admin = usuario(true);
        UserModel comum = usuario(false);

        Map<String, Object> edicao = new HashMap<>();
        edicao.put("firstName", "editado pelo");
        edicao.put("lastName", "painel");
        edicao.put("email", comum.getEmail());
        edicao.put("country", "chile");
        mvc.perform(json(comToken(patch("/user/" + comum.getId()), admin), edicao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Editado Pelo"))
                .andExpect(jsonPath("$.country").value("Chile"));
    }

    @Test
    @DisplayName("Administrador remove outro usuario, mas nao a si mesmo")
    void remocaoDeUsuario() throws Exception {
        UserModel admin = usuario(true);
        UserModel comum = usuario(false);

        mvc.perform(comToken(delete("/user/" + admin.getId()), admin)).andExpect(status().isForbidden());
        mvc.perform(comToken(delete("/user/" + comum.getId()), admin)).andExpect(status().isNoContent());
        mvc.perform(comToken(delete("/user/" + comum.getId()), admin)).andExpect(status().isNotFound());
        assertFalse(userRepository.existsById(comum.getId()));
    }

    @Test
    @DisplayName("Troca de cargo alterna entre administrador e usuario comum, nunca no proprio cargo")
    void trocaDeCargo() throws Exception {
        UserModel admin = usuario(true);
        UserModel comum = usuario(false);

        mvc.perform(comToken(put("/user/" + comum.getId() + "/role"), admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAdmin").value(true));
        mvc.perform(comToken(put("/user/" + comum.getId() + "/role"), admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAdmin").value(false));
        mvc.perform(comToken(put("/user/" + admin.getId() + "/role"), admin)).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Logout responde com mensagem e a checagem de e-mail diz se ele ja existe")
    void logoutEValidacaoDeEmail() throws Exception {
        UserModel user = usuario(false);

        mvc.perform(comToken(post("/user/logout"), user)).andExpect(status().isOk());
        mvc.perform(get("/user/validateEmail/" + user.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(true));
        mvc.perform(get("/user/validateEmail/ninguem@trajetto.local"))
                .andExpect(jsonPath("$").value(false));
    }
}
