package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.Map;

/**
 * Ponto do catalogo como o mapa o recebe.
 *
 * <p>Os campos sao os mesmos que {@code GET /places} ja devolvia -- inclusive
 * texto vazio, e nao {@code null}, para informacao que o ponto nao tem --, entao
 * o aplicativo nao precisa mudar. Os acrescimos sao {@code distanceMeters},
 * calculado pelo banco quando a busca informa um ponto de referencia, e
 * {@code bookingUrl}, o site oficial de reserva das atracoes que exigem uma,
 * {@code names}, o nome do ponto em cada idioma do app, e {@code xid}, o
 * identificador que as avaliacoes e os favoritos usam.</p>
 */
@Schema(description = "Ponto do catálogo como o mapa o recebe; informação ausente vem como texto vazio")
public record TouristSpotResponseDTO(
        @Schema(description = "Nome", example = "Colosseo")
        String name,
        @Schema(description = "Endereço", example = "Piazza del Colosseo")
        String address,
        @Schema(description = "Latitude", example = "41.890335502205886")
        double latitude,
        @Schema(description = "Longitude", example = "12.49238329485295")
        double longitude,
        @Schema(description = "Perfis de viajante a que o ponto atende", example = "[\"CULTURAL\", \"SOCIAL\"]")
        List<String> profiles,
        @Schema(description = "Horário de funcionamento (formato OpenStreetMap)", example = "Mar 30-Sep 30: 08:30-19:15; Oct 01-Oct 25: 08:30-18:30; Oct 26-Feb 28: 08:30-16:30; Jan 01 off; Dec 25 off")
        String openingHours,
        @Schema(description = "Categoria", example = "attraction")
        String category,
        @Schema(description = "Se é pago: yes, no ou vazio", example = "yes")
        String fee,
        @Schema(description = "Telefone", example = "+39 06 3996 7700")
        String phone,
        @Schema(description = "Site oficial", example = "https://colosseo.it/")
        String website,
        @Schema(description = "Id no Wikidata", example = "Q10285")
        String wikidata,
        @Schema(description = "Artigo na Wikipedia (idioma:título)", example = "it:Colosseo")
        String wikipedia,
        @Schema(description = "Acessibilidade para cadeirantes: yes, limited ou no", example = "limited")
        String wheelchair,
        @Schema(description = "Distância até o ponto de referência da busca, em metros; nula sem ponto de referência", example = "412.7", nullable = true)
        Double distanceMeters,
        @Schema(description = "Site oficial de reserva, quando a atração exige", example = "https://ticketing.colosseo.it/", nullable = true)
        String bookingUrl,
        @Schema(description = "Nome por idioma do app", example = "{\"pt\": \"Coliseu de Roma\", \"en\": \"Colosseum\", \"es\": \"Coliseo\"}")
        Map<String, String> names,
        @Schema(description = "Identificador usado por avaliações e favoritos", example = "osm_colosseo")
        String xid
) {}
