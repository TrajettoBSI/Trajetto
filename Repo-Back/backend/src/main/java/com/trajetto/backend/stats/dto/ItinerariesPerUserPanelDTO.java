package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Bloco "roteiros por cliente" do painel: o ranking que a tela lista e os
 * dois totais que ela exibe ao lado.
 *
 * <p>Os tres campos existiam antes, mas so o primeiro vinha do servidor --
 * e vinha inteiro. O painel recebia uma linha por cliente cadastrado,
 * cortava as dez primeiras para o ranking e contava, na propria tela,
 * quantas linhas tinham zero roteiros. Agora o recorte e as duas contagens
 * sao feitos pelo banco, e o que trafega e o que a tela exibe.</p>
 *
 * @param topClients              os dez clientes que mais criaram roteiros
 * @param clientsWithItinerary    clientes com pelo menos um roteiro
 * @param clientsWithoutItinerary clientes que ainda nao geraram nenhum
 */
@Schema(description = "Ranking de roteiros por cliente e os totais exibidos ao lado")
public record ItinerariesPerUserPanelDTO(
        @Schema(description = "Os dez clientes que mais criaram roteiros")
        List<ItinerariesPerUserDTO> topClients,
        @Schema(description = "Clientes com pelo menos um roteiro", example = "18")
        long clientsWithItinerary,
        @Schema(description = "Clientes sem roteiro", example = "7")
        long clientsWithoutItinerary
) {}
