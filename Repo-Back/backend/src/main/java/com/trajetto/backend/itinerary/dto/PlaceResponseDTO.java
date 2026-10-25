package com.trajetto.backend.itinerary.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@Data
public class PlaceResponseDTO {

    private String xid;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalDate visitDate;
    private LocalTime estimatedVisitTime;
    private Integer orderIndex;
    private String openingHours;
    private String category;
    private String fee;
    private String note;

    /** Aberto no horario marcado para a visita? {@code null} quando o horario do lugar nao permite afirmar. */
    private Boolean openAtVisit;

    /** Site oficial de reserva, quando a atracao exige reservar antes. */
    private String bookingUrl;

    /** Site oficial do lugar pago que nao exige reserva -- onde ver preco e comprar o ingresso. */
    private String ticketUrl;

    /** Nome do lugar por idioma do app ({@code pt}, {@code en}, {@code es}); vazio fora do catalogo. */
    private Map<String, String> names = Map.of();

    /** Id do lugar no Wikidata, de onde vem a foto; nulo fora do catalogo. */
    private String wikidata;
}