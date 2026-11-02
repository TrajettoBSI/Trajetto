package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Cartoes do topo do painel gerencial. Vem prontos da stored procedure
 * {@code sp_stats_user_overview}: uma linha, sete numeros, nenhuma lista de
 * usuarios trafegada.
 *
 * <p>A ordem dos componentes e a ordem das chaves no JSON, e ela reproduz o
 * contrato que o aplicativo ja consumia.</p>
 */
@Schema(description = "Cartões do topo do painel de usuários")
public record UserOverviewDTO(
        @Schema(description = "Total de usuários", example = "26")
        long totalUsers,
        @Schema(description = "Administradores", example = "1")
        long totalAdmins,
        @Schema(description = "Clientes", example = "25")
        long totalClients,
        @Schema(description = "Total de roteiros", example = "64")
        long totalItineraries,
        @Schema(description = "Usuários com e-mail verificado", example = "22")
        long verifiedUsers,
        @Schema(description = "Usuários sem e-mail verificado", example = "4")
        long unverifiedUsers,
        @Schema(description = "Idade média", example = "31", nullable = true)
        Long avgAge
) {}
