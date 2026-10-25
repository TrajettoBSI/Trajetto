package com.trajetto.backend.itinerary.dto;

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
public record PlaceHighlightDTO(
        TouristSpotResponseDTO spot,
        String xid,
        String city,
        String imageUrl,
        double average,
        long ratingsCount,
        Review latestReview
) {
    public record Review(String userName, int rating, String comment) {}
}
