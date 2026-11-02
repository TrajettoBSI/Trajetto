package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Schema(description = "Roteiro com as paradas de cada dia")
public class ItineraryResponseDTO {

    @Schema(description = "Identificador", example = "15")
    private Long id;
    @Schema(description = "Primeiro dia", example = "2026-11-20")
    private LocalDate startDate;
    @Schema(description = "Último dia", example = "2026-11-22")
    private LocalDate endDate;
    @Schema(description = "Se é o roteiro ativo do usuário (o que aparece no mapa)", example = "true")
    private Boolean active;
    @Schema(description = "Paradas, ordenadas por dia e horário")
    private List<PlaceResponseDTO> places;
    @Schema(description = "Latitude do ponto de partida", example = "41.9009")
    private Double originLatitude;
    @Schema(description = "Longitude do ponto de partida", example = "12.5016")
    private Double originLongitude;
    @Schema(description = "Nota dada pelo usuário ao roteiro, de 1 a 5", example = "5", nullable = true)
    private Integer rating;
    @Schema(description = "Comentário da avaliação do roteiro", example = "Roteiro bem distribuído, deu tempo de ver tudo com calma.", nullable = true)
    private String ratingDescription;
    @Schema(description = "Data escolhida pelo usuário (AAAA-MM-DD)", example = "2026-11-20", nullable = true)
    private String date;
    @Schema(description = "Nome dado pelo usuário; nulo mostra o nome genérico", example = "Lua de mel em Roma", nullable = true)
    private String name;
    /** Slug da cidade em {@code data/cities.json}. */
    @Schema(description = "Slug da cidade", example = "roma")
    private String city;

    @Schema(description = "Ritmo do roteiro", example = "EQUILIBRADO", nullable = true)
    private String pace;

    @Schema(description = "Caminho total entre as paradas (soma dos dias, em linha reta)", example = "14.2")
    private Double distanceKm;

    @Schema(description = "Caminho total na ordem gulosa, antes da otimização 2-opt; nulo em roteiros antigos", example = "17.9", nullable = true)
    private Double baselineDistanceKm;

    @Schema(description = "Pedidos em texto livre já interpretados e aplicados ao roteiro", nullable = true)
    private com.trajetto.backend.itinerary.planning.TripPreferences preferences;

    /** So na resposta da geracao/ajuste por texto livre: o que a IA entendeu do pedido. */
    @Schema(description = "Resposta do assistente ao pedido em texto livre (só na geração e no ajuste)", nullable = true)
    private String assistantSummary;

    @Schema(description = "Quem interpretou o pedido: IA ou REGRAS (só na geração e no ajuste)", example = "IA", nullable = true)
    private String assistantSource;
}