package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Lugar em destaque na tela inicial: popular no catalogo e bem avaliado pelos usuarios.
 *
 * @param spot          o ponto, no mesmo formato de {@code GET /places}, para abrir o detalhe
 * @param xid           identificador usado pelas avaliacoes
 * @param city          slug da cidade em {@code data/cities.json}
 * @param imageUrl      foto do Wikimedia Commons; nulo quando o ponto nao tem
 * @param average       media das avaliacoes (0 sem avaliacao)
 * @param ratingsCount  quantas avaliacoes o lugar tem
 * @param latestReview  a avaliacao com comentario mais recente; nula quando nao ha
 */
@Schema(description = "Lugar em destaque na tela inicial")
public record PlaceHighlightDTO(
        @Schema(description = "O ponto, no mesmo formato de GET /places")
        TouristSpotResponseDTO spot,
        @Schema(description = "Identificador usado pelas avaliações", example = "osm_colosseo")
        String xid,
        @Schema(description = "Slug da cidade", example = "roma")
        String city,
        @Schema(description = "Foto do Wikimedia Commons; nula quando o ponto não tem", example = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg", nullable = true)
        String imageUrl,
        @Schema(description = "Média das avaliações (0 sem avaliação)", example = "4.7")
        double average,
        @Schema(description = "Quantidade de avaliações", example = "12")
        long ratingsCount,
        @Schema(description = "Avaliação com comentário mais recente; nula quando não há", nullable = true)
        Review latestReview
) {
    @Schema(description = "Avaliação exibida no destaque")
    public record Review(
            @Schema(description = "Nome de quem avaliou", example = "Carlos Ferreira")
            String userName,
            @Schema(description = "Nota de 1 a 5", example = "5")
            int rating,
            @Schema(description = "Comentário", example = "Chegue cedo: às 8h30 a fila ainda é pequena.")
            String comment) {}
}
