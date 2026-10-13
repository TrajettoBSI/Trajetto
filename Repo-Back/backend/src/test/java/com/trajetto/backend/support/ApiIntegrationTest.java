package com.trajetto.backend.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.security.Jwt;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public abstract class ApiIntegrationTest {

    protected static final String SENHA = "senha-segura-123";

    private static final AtomicInteger SEQUENCIA = new AtomicInteger();

    @Autowired
    protected MockMvc mvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    private Jwt jwt;

    @MockitoBean
    protected JavaMailSender mailSender;

    protected UserModel usuario(boolean admin) {
        UserModel user = new UserModel();
        user.setFirstName("Teste");
        user.setLastName("Api");
        user.setEmail("api.teste." + SEQUENCIA.incrementAndGet() + "." + System.nanoTime() + "@trajetto.local");
        user.setPassword(passwordEncoder.encode(SENHA));
        user.setCountry("Brasil");
        user.setTelephone("41999990000");
        user.setBirthDate(LocalDate.of(1995, 5, 20));
        user.setTravelerProfile("CULTURAL");
        user.setIsAdmin(admin);
        user.setVerified(true);
        return userRepository.saveAndFlush(user);
    }

    protected MockHttpServletRequestBuilder comToken(MockHttpServletRequestBuilder request, UserModel user) {
        return request.header(HttpHeaders.AUTHORIZATION, Jwt.BEARER_PREFIX + jwt.createToken(user));
    }

    protected MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, Object body) throws Exception {
        return request.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body));
    }

    protected JsonNode corpo(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
