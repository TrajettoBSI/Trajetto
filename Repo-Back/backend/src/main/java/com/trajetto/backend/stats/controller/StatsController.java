package com.trajetto.backend.stats.controller;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

import com.trajetto.backend.stats.dto.*;
import com.trajetto.backend.stats.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Indicadores do painel gerencial.
 *
 * <p>O controlador só expõe os endpoints: quem agrupa, conta, ordena e
 * recorta é o banco, pelas consultas do {@code StatsService}. Cada endpoint
 * devolve o que o painel exibe, e não a coleção de onde o número saiu.</p>
 *
 * <h2>O recorte gerencial</h2>
 * <p>Todos os endpoints aceitam os mesmos quatro critérios como parâmetros de
 * consulta, que o Spring monta no {@link StatsFilter}:</p>
 *
 * <ul>
 *   <li>{@code from} e {@code to} — o período, em datas ISO
 *       ({@code 2026-01-31}), ambos inclusive;</li>
 *   <li>{@code profile} — o perfil de viajante, pelo rótulo que o painel
 *       exibe (inclusive {@code Sem perfil});</li>
 *   <li>{@code country} — o país do usuário;</li>
 *   <li>{@code category} — a categoria do local, pelo rótulo que o painel
 *       exibe (inclusive {@code Outros}).</li>
 * </ul>
 *
 * <p>Os quatro são opcionais e se combinam livremente: cada um ausente
 * simplesmente não recorta, então uma requisição sem nenhum parâmetro
 * devolve o painel inteiro, como antes de os filtros existirem. Os valores
 * válidos de perfil, país e categoria estão em {@code /stats/filter-options},
 * que os lê da própria base.</p>
 *
 * <p>Período e categoria alcançam os blocos que têm data e categoria —
 * roteiros, locais e avaliações. Os indicadores de usuário respondem a perfil
 * e país; o motivo está em {@code StatsRecortes}.</p>
 *
 * <p>Um único contrato JSON mudou desde então: {@code /itineraries-per-user}
 * devolvia a lista de todos os clientes, que o painel recortava e contava na
 * tela; agora devolve o ranking já cortado em dez mais os dois totais de
 * clientes com e sem roteiro, ambos contados pelo banco.</p>
 */
@Tag(name = "Painel gerencial")
@ApiResponse(responseCode = "403", description = "Sem a permissão STATS_VIEW")
@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
@SecurityRequirement(name = "AuthServer")
@PreAuthorize("hasAuthority('STATS_VIEW')")
public class StatsController {

    private final StatsService statsService;

    // ─── Filtros ───────────────────────────────────────────────────────────

    @Operation(summary = "Opções dos filtros do painel",
            description = "Valores aceitos em profile, country e category nos demais endpoints de /stats, lidos da própria base. Exige a permissão STATS_VIEW.")
    @GetMapping("/filter-options")
    public ResponseEntity<FilterOptionsDTO> getFilterOptions() {
        return ResponseEntity.ok(statsService.getFilterOptions());
    }

    // ─── Usuários ──────────────────────────────────────────────────────────

    @Operation(summary = "Cartões de usuários",
            description = "Totais de usuários, administradores, clientes, roteiros, verificados e idade média, calculados pela stored procedure sp_stats_user_overview. Responde aos filtros profile e country. Exige a permissão STATS_VIEW.")
    @GetMapping("/overview")
    public ResponseEntity<UserOverviewDTO> getOverview(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getUserOverview(filtro));
    }

    @Operation(summary = "Usuários por país",
            description = "Contagem de usuários por país, em ordem decrescente. Responde aos filtros profile e country. Exige a permissão STATS_VIEW.")
    @GetMapping("/countries")
    public ResponseEntity<List<CountryCountDTO>> getByCountry(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getUsersByCountry(filtro));
    }

    @Operation(summary = "Usuários por perfil de viajante",
            description = "Quem não fez o teste de perfil entra como Sem perfil. Responde aos filtros profile e country. Exige a permissão STATS_VIEW.")
    @GetMapping("/traveler-profiles")
    public ResponseEntity<List<ProfileCountDTO>> getTravelerProfiles(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getUsersByTravelerProfile(filtro));
    }

    @Operation(summary = "Roteiros por cliente",
            description = "Os dez clientes que mais criaram roteiros e os totais de clientes com e sem roteiro, todos contados pelo banco. Exige a permissão STATS_VIEW.")
    @GetMapping("/itineraries-per-user")
    public ResponseEntity<ItinerariesPerUserPanelDTO> getItinerariesPerUser(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getItinerariesPerUser(filtro));
    }

    @Operation(summary = "Usuários por faixa etária",
            description = "Sempre as sete faixas, inclusive as zeradas e a de data de nascimento desconhecida. Exige a permissão STATS_VIEW.")
    @GetMapping("/age-groups")
    public ResponseEntity<List<AgeGroupCountDTO>> getAgeGroups(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getUsersByAgeGroup(filtro));
    }

    // ─── Roteiros ──────────────────────────────────────────────────────────

    @Operation(summary = "Cartões de roteiros",
            description = "Total de roteiros, duração média, nota média e quantos foram ou não avaliados (stored procedure sp_stats_itinerary_overview). Exige a permissão STATS_VIEW.")
    @GetMapping("/itinerary-overview")
    public ResponseEntity<ItineraryOverviewDTO> getItineraryOverview(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getItineraryOverview(filtro));
    }

    @Operation(summary = "Roteiros criados por mês",
            description = "Série mensal para o gráfico, com o rótulo do mês em português (ex.: Out/26). Exige a permissão STATS_VIEW.")
    @GetMapping("/itineraries-per-month")
    public ResponseEntity<List<MonthCountDTO>> getItinerariesPerMonth(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getItinerariesPerMonth(filtro));
    }

    // ─── Lugares ───────────────────────────────────────────────────────────

    @Operation(summary = "Lugares por categoria",
            description = "Quantas paradas de roteiro há em cada categoria; sem categoria entra como Outros. Exige a permissão STATS_VIEW.")
    @GetMapping("/places-by-category")
    public ResponseEntity<List<CategoryCountDTO>> getPlacesByCategory(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getPlacesByCategory(filtro));
    }

    @Operation(summary = "Lugares mais bem avaliados",
            description = "Os dez lugares com a maior média de notas, com o total de avaliações de cada um. Exige a permissão STATS_VIEW.")
    @GetMapping("/top-rated-places")
    public ResponseEntity<List<TopRatedPlaceDTO>> getTopRatedPlaces(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getTopRatedPlaces(filtro));
    }

    @Operation(summary = "Lugares mais comentados",
            description = "Os dez lugares que mais receberam avaliações com comentário. Exige a permissão STATS_VIEW.")
    @GetMapping("/most-commented-places")
    public ResponseEntity<List<MostCommentedPlaceDTO>> getMostCommentedPlaces(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getMostCommentedPlaces(filtro));
    }

    @Operation(summary = "Lugares mais incluídos em roteiros",
            description = "Os dez lugares que aparecem em mais roteiros. Exige a permissão STATS_VIEW.")
    @GetMapping("/most-visited-places")
    public ResponseEntity<List<MostVisitedPlaceDTO>> getMostVisitedPlaces(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getMostVisitedPlaces(filtro));
    }
}
