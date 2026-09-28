package com.trajetto.backend.stats.controller;

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
@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
@SecurityRequirement(name = "AuthServer")
@PreAuthorize("hasRole('ADMIN')")
public class StatsController {

    private final StatsService statsService;

    // ─── Filtros ───────────────────────────────────────────────────────────

    @Operation(summary = "Perfis, países e categorias disponíveis nos seletores do painel")
    @GetMapping("/filter-options")
    public ResponseEntity<FilterOptionsDTO> getFilterOptions() {
        return ResponseEntity.ok(statsService.getFilterOptions());
    }

    // ─── Usuários ──────────────────────────────────────────────────────────

    @Operation(summary = "Cartões de usuários do painel (stored procedure sp_stats_user_overview)")
    @GetMapping("/overview")
    public ResponseEntity<UserOverviewDTO> getOverview(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getUserOverview(filtro));
    }

    @Operation(summary = "Usuários agrupados por país")
    @GetMapping("/countries")
    public ResponseEntity<List<CountryCountDTO>> getByCountry(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getUsersByCountry(filtro));
    }

    @Operation(summary = "Usuários agrupados por perfil de viajante")
    @GetMapping("/traveler-profiles")
    public ResponseEntity<List<ProfileCountDTO>> getTravelerProfiles(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getUsersByTravelerProfile(filtro));
    }

    @Operation(summary = "Ranking de roteiros por cliente, com o total de clientes com e sem roteiro")
    @GetMapping("/itineraries-per-user")
    public ResponseEntity<ItinerariesPerUserPanelDTO> getItinerariesPerUser(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getItinerariesPerUser(filtro));
    }

    @Operation(summary = "Usuários agrupados por faixa etária")
    @GetMapping("/age-groups")
    public ResponseEntity<List<AgeGroupCountDTO>> getAgeGroups(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getUsersByAgeGroup(filtro));
    }

    // ─── Roteiros ──────────────────────────────────────────────────────────

    @Operation(summary = "Cartões de roteiros do painel (stored procedure sp_stats_itinerary_overview)")
    @GetMapping("/itinerary-overview")
    public ResponseEntity<ItineraryOverviewDTO> getItineraryOverview(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getItineraryOverview(filtro));
    }

    @Operation(summary = "Roteiros criados por mês")
    @GetMapping("/itineraries-per-month")
    public ResponseEntity<List<MonthCountDTO>> getItinerariesPerMonth(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getItinerariesPerMonth(filtro));
    }

    // ─── Lugares ───────────────────────────────────────────────────────────

    @Operation(summary = "Lugares agrupados por categoria")
    @GetMapping("/places-by-category")
    public ResponseEntity<List<CategoryCountDTO>> getPlacesByCategory(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getPlacesByCategory(filtro));
    }

    @Operation(summary = "Dez lugares com melhor média de avaliação")
    @GetMapping("/top-rated-places")
    public ResponseEntity<List<TopRatedPlaceDTO>> getTopRatedPlaces(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getTopRatedPlaces(filtro));
    }

    @Operation(summary = "Dez lugares com mais comentários")
    @GetMapping("/most-commented-places")
    public ResponseEntity<List<MostCommentedPlaceDTO>> getMostCommentedPlaces(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getMostCommentedPlaces(filtro));
    }

    @Operation(summary = "Dez lugares que mais aparecem em roteiros")
    @GetMapping("/most-visited-places")
    public ResponseEntity<List<MostVisitedPlaceDTO>> getMostVisitedPlaces(@ParameterObject @ModelAttribute StatsFilter filtro) {
        return ResponseEntity.ok(statsService.getMostVisitedPlaces(filtro));
    }
}
