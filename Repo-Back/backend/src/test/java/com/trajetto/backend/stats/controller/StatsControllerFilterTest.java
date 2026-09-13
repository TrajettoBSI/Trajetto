package com.trajetto.backend.stats.controller;

import com.trajetto.backend.stats.dto.StatsFilter;
import com.trajetto.backend.stats.dto.UserOverviewDTO;
import com.trajetto.backend.stats.service.StatsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * OB01.1 — a ponte entre a URL que o painel chama e o recorte que o serviço
 * recebe.
 *
 * <p>Os quatro critérios chegam como parâmetros de consulta e viram um
 * {@link StatsFilter} por ligação de dados do Spring. Este teste cobre
 * justamente esse trecho, que nenhum outro alcança: que a data ISO vira
 * {@code LocalDate}, que parâmetro ausente vira nulo — e não string vazia ou
 * exceção — e que um seletor limpo pelo aplicativo, que chega como
 * {@code ?country=}, é lido como "sem recorte por país", e não como um país
 * chamado "".</p>
 *
 * <p>O {@code StatsService} é dublado de propósito: o que se quer ver aqui é o
 * que chegou nele, não o número que ele devolveria. Que o recorte muda os
 * números é assunto do {@code StatsFilterIntegrationTest}.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
class StatsControllerFilterTest {

    private static final UserOverviewDTO QUALQUER_RESPOSTA =
            new UserOverviewDTO(0, 0, 0, 0, 0, 0, null);

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StatsService statsService;

    private StatsFilter filtroRecebidoEm(MockHttpServletRequestBuilder requisicao) throws Exception {
        when(statsService.getUserOverview(any())).thenReturn(QUALQUER_RESPOSTA);

        mockMvc.perform(requisicao).andExpect(status().isOk());

        ArgumentCaptor<StatsFilter> filtro = ArgumentCaptor.forClass(StatsFilter.class);
        verify(statsService).getUserOverview(filtro.capture());
        return filtro.getValue();
    }

    private MockHttpServletRequestBuilder painel() {
        return get("/stats/overview");
    }

    @Test
    @DisplayName("Requisição sem parâmetro nenhum chega ao serviço como painel inteiro")
    @WithMockUser(roles = "ADMIN")
    void semParametros() throws Exception {
        assertEquals(StatsFilter.SEM_RECORTE, filtroRecebidoEm(painel()));
    }

    @Test
    @DisplayName("Os quatro critérios chegam juntos, com as datas já convertidas")
    @WithMockUser(roles = "ADMIN")
    void quatroCriterios() throws Exception {
        StatsFilter filtro = filtroRecebidoEm(painel()
                .param("from", "2026-01-01")
                .param("to", "2026-03-31")
                .param("profile", "Cultural")
                .param("country", "Brasil")
                .param("category", "Museu"));

        assertEquals(LocalDate.of(2026, 1, 1), filtro.from());
        assertEquals(LocalDate.of(2026, 3, 31), filtro.to());
        assertEquals("Cultural", filtro.profile());
        assertEquals("Brasil", filtro.country());
        assertEquals("Museu", filtro.category());
    }

    @Test
    @DisplayName("Critério isolado não arrasta os outros junto")
    @WithMockUser(roles = "ADMIN")
    void criterioIsolado() throws Exception {
        StatsFilter filtro = filtroRecebidoEm(painel().param("country", "Brasil"));

        assertEquals("Brasil", filtro.country());
        assertNull(filtro.from());
        assertNull(filtro.to());
        assertNull(filtro.profile());
        assertNull(filtro.category());
    }

    @Test
    @DisplayName("Seletor limpo chega vazio e é lido como critério não escolhido")
    @WithMockUser(roles = "ADMIN")
    void parametroEmBranco() throws Exception {
        StatsFilter filtro = filtroRecebidoEm(painel()
                .param("country", "")
                .param("profile", " ")
                .param("category", "Museu"));

        assertNull(filtro.country());
        assertNull(filtro.profile());
        assertEquals("Museu", filtro.category());
    }

    @Test
    @DisplayName("Rótulo com espaço e acento atravessa a URL inteiro")
    @WithMockUser(roles = "ADMIN")
    void rotuloComEspacoEAcento() throws Exception {
        StatsFilter filtro = filtroRecebidoEm(painel()
                .param("profile", "Sem perfil")
                .param("country", "Estados Unidos"));

        assertEquals("Sem perfil", filtro.profile());
        assertEquals("Estados Unidos", filtro.country());
    }
}
