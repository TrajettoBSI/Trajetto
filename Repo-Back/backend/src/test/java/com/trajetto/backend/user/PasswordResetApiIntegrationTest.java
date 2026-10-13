package com.trajetto.backend.user;

import com.trajetto.backend.support.ApiIntegrationTest;
import com.trajetto.backend.user.model.PasswordResetToken;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.PasswordResetTokenRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PasswordResetApiIntegrationTest extends ApiIntegrationTest {

    private static final String NOVA_SENHA = "nova-senha-456";

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    private String pedirCodigo(UserModel user) throws Exception {
        mvc.perform(json(post("/user/password/forgot"), Map.of("email", user.getEmail())))
                .andExpect(status().isOk());

        ArgumentCaptor<SimpleMailMessage> email = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(email.capture());
        Matcher codigo = Pattern.compile("CÓDIGO DE VERIFICAÇÃO: (\\d{6})").matcher(email.getValue().getText());
        assertTrue(codigo.find());
        return codigo.group(1);
    }

    private Map<String, String> redefinicao(UserModel user, String codigo) {
        return Map.of("email", user.getEmail(), "code", codigo, "newPassword", NOVA_SENHA);
    }

    @Test
    @DisplayName("O codigo enviado por e-mail redefine a senha uma vez so")
    void redefineSenhaUmaVez() throws Exception {
        UserModel user = usuario(false);
        String codigo = pedirCodigo(user);

        mvc.perform(json(post("/user/password/reset"), redefinicao(user, codigo))).andExpect(status().isOk());
        assertTrue(passwordEncoder.matches(NOVA_SENHA, userRepository.findById(user.getId()).orElseThrow().getPassword()));

        mvc.perform(json(post("/user/password/reset"), redefinicao(user, codigo)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("Este código já foi utilizado. Solicite um novo."));
    }

    @Test
    @DisplayName("Codigo errado responde 400 e e-mail sem conta responde 404")
    void codigoErradoEEmailDesconhecido() throws Exception {
        UserModel user = usuario(false);

        mvc.perform(json(post("/user/password/reset"), redefinicao(user, "000000")))
                .andExpect(status().isBadRequest());
        mvc.perform(json(post("/user/password/forgot"), Map.of("email", "ninguem@trajetto.local")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Codigo vencido responde 422")
    void codigoVencido() throws Exception {
        UserModel user = usuario(false);
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setCode("654321");
        token.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        tokenRepository.saveAndFlush(token);

        mvc.perform(json(post("/user/password/reset"), redefinicao(user, "654321")))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("Este código expirou. Solicite um novo."));
    }

    @Test
    @DisplayName("Nova senha curta demais responde 400")
    void senhaCurta() throws Exception {
        UserModel user = usuario(false);

        mvc.perform(json(post("/user/password/reset"), Map.of("email", user.getEmail(), "code", "123456", "newPassword", "123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
