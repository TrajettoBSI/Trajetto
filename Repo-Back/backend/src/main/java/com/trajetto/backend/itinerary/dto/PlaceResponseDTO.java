package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@Data
@Schema(description = "Parada do roteiro")
public class PlaceResponseDTO {

    @Schema(description = "Identificador do lugar no catálogo", example = "osm_colosseo")
    private String xid;
    @Schema(description = "Nome", example = "Colosseo")
    private String name;
    @Schema(description = "Endereço", example = "Piazza del Colosseo")
    private String address;
    @Schema(description = "Latitude", example = "41.890335502205886")
    private Double latitude;
    @Schema(description = "Longitude", example = "12.49238329485295")
    private Double longitude;
    @Schema(description = "Dia da visita", example = "2026-11-20")
    private LocalDate visitDate;
    @Schema(description = "Horário previsto da visita", example = "09:00", type = "string")
    private LocalTime estimatedVisitTime;
    @Schema(description = "Posição da parada no roteiro; usada nas rotas de edição", example = "0")
    private Integer orderIndex;
    @Schema(description = "Horário de funcionamento (formato OpenStreetMap)", example = "Mar 30-Sep 30: 08:30-19:15; Oct 01-Oct 25: 08:30-18:30; Oct 26-Feb 28: 08:30-16:30; Jan 01 off; Dec 25 off")
    private String openingHours;
    @Schema(description = "Categoria", example = "attraction")
    private String category;
    @Schema(description = "Se é pago: yes ou no", example = "yes")
    private String fee;
    @Schema(description = "Anotação pessoal do usuário", example = "Comprar o ingresso combinado com o Fórum Romano e o Palatino.", nullable = true)
    private String note;

    /** Aberto no horario marcado para a visita? {@code null} quando o horario do lugar nao permite afirmar. */
    @Schema(description = "Se o lugar está aberto no horário da visita; nulo quando não dá para afirmar", example = "true", nullable = true)
    private Boolean openAtVisit;

    /** Site oficial de reserva, quando a atracao exige reservar antes. */
    @Schema(description = "Site oficial de reserva, quando a atração exige", example = "https://ticketing.colosseo.it/", nullable = true)
    private String bookingUrl;

    /** Site oficial do lugar pago que nao exige reserva -- onde ver preco e comprar o ingresso. */
    @Schema(description = "Site oficial para comprar ingresso de lugar pago que não exige reserva", nullable = true)
    private String ticketUrl;

    /** Nome do lugar por idioma do app ({@code pt}, {@code en}, {@code es}); vazio fora do catalogo. */
    @Schema(description = "Nome do lugar por idioma do app", example = "{\"pt\": \"Coliseu de Roma\", \"en\": \"Colosseum\", \"es\": \"Coliseo\"}")
    private Map<String, String> names = Map.of();

    /** Id do lugar no Wikidata, de onde vem a foto; nulo fora do catalogo. */
    @Schema(description = "Id do lugar no Wikidata, de onde vem a foto", example = "Q10285", nullable = true)
    private String wikidata;
}