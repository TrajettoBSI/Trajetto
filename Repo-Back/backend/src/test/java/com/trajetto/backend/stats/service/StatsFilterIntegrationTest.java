package com.trajetto.backend.stats.service;

import com.trajetto.backend.stats.dto.CategoryCountDTO;
import com.trajetto.backend.stats.dto.FilterOptionsDTO;
import com.trajetto.backend.stats.dto.ItinerariesPerUserPanelDTO;
import com.trajetto.backend.stats.dto.MonthCountDTO;
import com.trajetto.backend.stats.dto.MostVisitedPlaceDTO;
import com.trajetto.backend.stats.dto.ProfileCountDTO;
import com.trajetto.backend.stats.dto.StatsFilter;
import com.trajetto.backend.stats.dto.TopRatedPlaceDTO;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * OB01.1 — o serviço de estatísticas respondendo a filtros isolados e
 * combinados, contra o banco de verdade.
 *
 * <p>O ponto do teste não é conferir contas: é conferir que o recorte
 * realmente chega ao SQL e muda o resultado, e que as quatro condições se
 * combinam sem se atrapalharem. Por isso ele roda a consulta de ponta a ponta
 * — Hibernate, driver e MySQL incluídos — em vez de dublar o repositório: o
 * que se quer verificar são justamente os pedaços que um dublê apagaria, como
 * o {@code :parametro IS NULL} que desliga cada critério e o rótulo
 * {@code COALESCE(NULLIF(TRIM(...)))} com que perfil e categoria são
 * comparados.</p>
 *
 * <p>A base de teste pode ter outras linhas, então todo cenário carrega o
 * país {@code Trajettolandia}, que só existe aqui. Como país recorta todos os
 * blocos, é ele que isola os números deste teste do resto do banco. As datas
 * ficam em 2090 pelo mesmo motivo. Tudo é revertido no fim — o teste não
 * deixa nada gravado.</p>
 *
 * <p>O cenário montado no {@code seed}:</p>
 * <pre>
 *   Ana   (PerfilAlfa)  roteiro 1: 10/01/2090, com parada de CatAlfa
 *                       roteiro 2: 10/06/2090, com parada de CatBeta
 *   Bruno (PerfilBeta)  roteiro 3: 20/01/2090, com parada de CatAlfa
 *   Célia (sem perfil)  nenhum roteiro
 * </pre>
 */
@SpringBootTest
@Transactional
class StatsFilterIntegrationTest {

    private static final String PAIS = "Trajettolandia";

    private static final long ANA = 995_001L;
    private static final long BRUNO = 995_002L;
    private static final long CELIA = 995_003L;

    private static final long ROTEIRO_ANA_JANEIRO = 995_001L;
    private static final long ROTEIRO_ANA_JUNHO = 995_002L;
    private static final long ROTEIRO_BRUNO_JANEIRO = 995_003L;

    @Autowired
    private StatsService statsService;

    @Autowired
    private EntityManager em;

    private void sql(String comando) {
        em.createNativeQuery(comando).executeUpdate();
    }

    private void usuario(long code, String nome, String perfil, String nascimento) {
        sql("INSERT INTO users (code, first_name, last_name, email, password, is_verified, isAdmin, country, travelerProfile, birthDate) "
                + "VALUES (" + code + ", '" + nome + "', 'Filtro', '" + nome.toLowerCase() + ".filtro@trajetto.local', 'x', 1, 0, "
                + "'" + PAIS + "', " + (perfil == null ? "NULL" : "'" + perfil + "'") + ", '" + nascimento + "')");
    }

    private void roteiro(long id, long usuario, String inicio, String fim, String nota) {
        sql("INSERT INTO itineraries (id, user_id, start_date, end_date, is_active, rating) "
                + "VALUES (" + id + ", " + usuario + ", '" + inicio + "', '" + fim + "', 0, " + nota + ")");
    }

    private void parada(long roteiro, String nome, String categoria, String xid) {
        sql("INSERT INTO places (itinerary_id, name, category, xid, order_index) "
                + "VALUES (" + roteiro + ", '" + nome + "', '" + categoria + "', '" + xid + "', 0)");
    }

    private void avaliacao(long usuario, String xid, int nota, String comentario, String quando) {
        sql("INSERT INTO RatingModel (userId, touristSpotXid, rating, comment, createdAt) "
                + "VALUES (" + usuario + ", '" + xid + "', " + nota + ", '" + comentario + "', '" + quando + "')");
    }

    @BeforeEach
    void seed() {
        usuario(ANA, "Ana", "PerfilAlfa", "1990-05-04");
        usuario(BRUNO, "Bruno", "PerfilBeta", "2000-05-04");
        usuario(CELIA, "Celia", null, "1970-05-04");

        roteiro(ROTEIRO_ANA_JANEIRO, ANA, "2090-01-10", "2090-01-12", "5");
        roteiro(ROTEIRO_ANA_JUNHO, ANA, "2090-06-10", "2090-06-15", "NULL");
        roteiro(ROTEIRO_BRUNO_JANEIRO, BRUNO, "2090-01-20", "2090-01-25", "3");

        parada(ROTEIRO_ANA_JANEIRO, "Museu Alfa", "CatAlfa", "XALFA");
        parada(ROTEIRO_ANA_JUNHO, "Parque Beta", "CatBeta", "XBETA");
        parada(ROTEIRO_BRUNO_JANEIRO, "Museu Alfa", "CatAlfa", "XALFA");

        avaliacao(ANA, "XALFA", 5, "otimo", "2090-01-11 10:00:00");
        avaliacao(BRUNO, "XBETA", 3, "razoavel", "2090-06-11 10:00:00");

        em.flush();
    }

    /** O recorte base: só o país inventado, que sozinho já separa este cenário do resto da base. */
    private StatsFilter apenasOPais() {
        return new StatsFilter(null, null, null, PAIS, null);
    }

    private StatsFilter recorte(LocalDate de, LocalDate ate, String perfil, String categoria) {
        return new StatsFilter(de, ate, perfil, PAIS, categoria);
    }

    // ─── Sem recorte ───────────────────────────────────────────────────────

    @Test
    @DisplayName("Sem nenhum critério, o painel continua enxergando a base inteira")
    void semRecorteOPainelVeTudo() {
        long comFiltro = statsService.getUserOverview(apenasOPais()).totalUsers();
        long semFiltro = statsService.getUserOverview(StatsFilter.SEM_RECORTE).totalUsers();

        assertEquals(3, comFiltro);
        assertTrue(semFiltro >= comFiltro,
                "o painel sem filtro não pode enxergar menos gente do que o painel filtrado por um país só");
    }

    // ─── Filtros isolados ──────────────────────────────────────────────────

    @Test
    @DisplayName("País isolado recorta usuários, roteiros e locais de uma vez")
    void paisIsolado() {
        StatsFilter filtro = apenasOPais();

        assertEquals(3, statsService.getUserOverview(filtro).totalUsers());
        assertEquals(3, statsService.getUserOverview(filtro).totalItineraries());
        assertEquals(3, statsService.getItineraryOverview(filtro).totalItineraries());
        assertEquals(List.of(new CategoryCountDTO("CatAlfa", 2), new CategoryCountDTO("CatBeta", 1)),
                statsService.getPlacesByCategory(filtro));
    }

    @Test
    @DisplayName("Perfil isolado deixa no painel só quem tem aquele perfil, e só os roteiros dele")
    void perfilIsolado() {
        StatsFilter filtro = recorte(null, null, "PerfilAlfa", null);

        assertEquals(1, statsService.getUserOverview(filtro).totalUsers());
        assertEquals(2, statsService.getItineraryOverview(filtro).totalItineraries());
        assertEquals(List.of(new ProfileCountDTO("PerfilAlfa", 1)),
                statsService.getUsersByTravelerProfile(filtro));
    }

    @Test
    @DisplayName("\"Sem perfil\" é uma escolha como qualquer outra, e acha quem nunca fez o teste")
    void semPerfilTambemERecorte() {
        StatsFilter filtro = recorte(null, null, "Sem perfil", null);

        assertEquals(1, statsService.getUserOverview(filtro).totalUsers());
        assertEquals(0, statsService.getItineraryOverview(filtro).totalItineraries());
    }

    @Test
    @DisplayName("Período isolado recorta os roteiros, e não a população de usuários")
    void periodoIsolado() {
        StatsFilter janeiro = recorte(LocalDate.of(2090, 1, 1), LocalDate.of(2090, 1, 31), null, null);

        assertEquals(2, statsService.getItineraryOverview(janeiro).totalItineraries());
        assertEquals(2, statsService.getUserOverview(janeiro).totalItineraries());
        assertEquals(3, statsService.getUserOverview(janeiro).totalUsers(),
                "usuário não tem data de cadastro: o período não pode encolher a base de usuários");
    }

    @Test
    @DisplayName("Período de um dia só pega o roteiro que começa naquele dia")
    void periodoDeUmDiaSo() {
        StatsFilter umDia = recorte(LocalDate.of(2090, 1, 20), LocalDate.of(2090, 1, 20), null, null);

        assertEquals(1, statsService.getItineraryOverview(umDia).totalItineraries());
    }

    @Test
    @DisplayName("Categoria isolada recorta pelos roteiros que têm uma parada daquela categoria")
    void categoriaIsolada() {
        StatsFilter catBeta = recorte(null, null, null, "CatBeta");

        assertEquals(1, statsService.getItineraryOverview(catBeta).totalItineraries());
        assertEquals(List.of(new CategoryCountDTO("CatBeta", 1)), statsService.getPlacesByCategory(catBeta));
        assertEquals(List.of(new MostVisitedPlaceDTO("Parque Beta", 1)),
                statsService.getMostVisitedPlaces(catBeta));
    }

    // ─── Filtros combinados ────────────────────────────────────────────────

    @Test
    @DisplayName("Perfil e período combinados recortam pela interseção, não pela soma")
    void perfilMaisPeriodo() {
        StatsFilter alfaEmJunho = recorte(
                LocalDate.of(2090, 6, 1), LocalDate.of(2090, 6, 30), "PerfilAlfa", null);

        assertEquals(1, statsService.getItineraryOverview(alfaEmJunho).totalItineraries());

        StatsFilter betaEmJunho = recorte(
                LocalDate.of(2090, 6, 1), LocalDate.of(2090, 6, 30), "PerfilBeta", null);

        assertEquals(0, statsService.getItineraryOverview(betaEmJunho).totalItineraries(),
                "o roteiro de junho é da Ana; o Bruno não tem nenhum nesse mês");
    }

    @Test
    @DisplayName("Os quatro critérios juntos chegam a um roteiro só")
    void quatroCriteriosJuntos() {
        StatsFilter tudo = recorte(
                LocalDate.of(2090, 1, 1), LocalDate.of(2090, 1, 31), "PerfilAlfa", "CatAlfa");

        assertEquals(1, statsService.getItineraryOverview(tudo).totalItineraries());
        assertEquals(List.of(new MonthCountDTO("Jan/90", 1)), statsService.getItinerariesPerMonth(tudo));
        assertEquals(1, statsService.getItinerariesPerUser(tudo).topClients().size());
        assertEquals("Ana Filtro", statsService.getItinerariesPerUser(tudo).topClients().get(0).user());
    }

    @Test
    @DisplayName("Combinação sem nenhuma linha devolve painel vazio, e não erro")
    void combinacaoSemResultado() {
        StatsFilter impossivel = recorte(
                LocalDate.of(2090, 6, 1), LocalDate.of(2090, 6, 30), "PerfilBeta", "CatAlfa");

        assertEquals(0, statsService.getItineraryOverview(impossivel).totalItineraries());
        assertEquals(List.of(), statsService.getItinerariesPerMonth(impossivel));
        assertEquals(List.of(), statsService.getPlacesByCategory(impossivel));
        assertEquals(List.of(), statsService.getTopRatedPlaces(impossivel));
    }

    // ─── Indicadores que o recorte poderia ter estragado ───────────────────

    @Test
    @DisplayName("Clientes sem roteiro conta quem não gerou nada no recorte, e não some com o filtro")
    void clientesSemRoteiroDentroDoRecorte() {
        ItinerariesPerUserPanelDTO semPeriodo = statsService.getItinerariesPerUser(apenasOPais());
        assertEquals(2, semPeriodo.clientsWithItinerary());
        assertEquals(1, semPeriodo.clientsWithoutItinerary(), "a Célia nunca gerou roteiro");

        ItinerariesPerUserPanelDTO junho = statsService.getItinerariesPerUser(
                recorte(LocalDate.of(2090, 6, 1), LocalDate.of(2090, 6, 30), null, null));
        assertEquals(1, junho.clientsWithItinerary());
        assertEquals(2, junho.clientsWithoutItinerary(),
                "em junho só a Ana gerou roteiro; Bruno e Célia entram como clientes sem roteiro no período");
    }

    @Test
    @DisplayName("Faixas etárias continuam saindo nas sete fatias, recortadas por perfil e país")
    void faixasEtariasRecortadas() {
        assertEquals(7, statsService.getUsersByAgeGroup(apenasOPais()).size());
        assertEquals(3, statsService.getUsersByAgeGroup(apenasOPais()).stream()
                .mapToLong(faixa -> faixa.count()).sum());
        assertEquals(1, statsService.getUsersByAgeGroup(recorte(null, null, "PerfilAlfa", null)).stream()
                .mapToLong(faixa -> faixa.count()).sum());
    }

    // ─── Avaliações ────────────────────────────────────────────────────────

    @Test
    @DisplayName("Avaliação é recortada pela própria data, pelo autor e pelo local avaliado")
    void avaliacoesRecortadas() {
        List<TopRatedPlaceDTO> doPais = statsService.getTopRatedPlaces(apenasOPais());
        assertEquals(2, doPais.size());

        List<TopRatedPlaceDTO> deJaneiro = statsService.getTopRatedPlaces(
                recorte(LocalDate.of(2090, 1, 1), LocalDate.of(2090, 1, 31), null, null));
        assertEquals(List.of("Museu Alfa"), deJaneiro.stream().map(TopRatedPlaceDTO::name).toList());

        List<TopRatedPlaceDTO> doPerfilBeta = statsService.getTopRatedPlaces(
                recorte(null, null, "PerfilBeta", null));
        assertEquals(List.of("Parque Beta"), doPerfilBeta.stream().map(TopRatedPlaceDTO::name).toList());

        List<TopRatedPlaceDTO> daCatAlfa = statsService.getTopRatedPlaces(
                recorte(null, null, null, "CatAlfa"));
        assertEquals(List.of("Museu Alfa"), daCatAlfa.stream().map(TopRatedPlaceDTO::name).toList());
    }

    // ─── Opções dos seletores ──────────────────────────────────────────────

    @Test
    @DisplayName("Os seletores oferecem o que existe na base, com os rótulos que o painel exibe")
    void opcoesDosSeletores() {
        FilterOptionsDTO opcoes = statsService.getFilterOptions();

        assertTrue(opcoes.profiles().containsAll(List.of("PerfilAlfa", "PerfilBeta")));
        assertTrue(opcoes.profiles().contains("Sem perfil"));
        assertTrue(opcoes.countries().contains(PAIS));
        assertTrue(opcoes.categories().containsAll(List.of("CatAlfa", "CatBeta")));
    }
}
