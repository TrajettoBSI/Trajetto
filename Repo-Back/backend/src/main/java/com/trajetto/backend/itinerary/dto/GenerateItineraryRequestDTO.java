package com.trajetto.backend.itinerary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Parâmetros para gerar um roteiro com base no perfil do usuário")
public class
GenerateItineraryRequestDTO {

    public static final int MAX_DAYS = 7;

    /** Preenchido pelo controller com o usuário do token; se o cliente enviar, precisa ser o mesmo. */
    @Schema(description = "Opcional; se enviado, precisa ser o usuário do token", example = "2", nullable = true)
    private Long userId;

    @Schema(description = "Latitude do ponto de partida (ex.: o hotel)", example = "41.9009")
    @DecimalMin(value = "-90.0", message = "A latitude de origem deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude de origem deve estar entre -90 e 90")
    private double startLatitude;

    @Schema(description = "Longitude do ponto de partida", example = "12.5016")
    @DecimalMin(value = "-180.0", message = "A longitude de origem deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude de origem deve estar entre -180 e 180")
    private double startLongitude;

    @Schema(description = "Primeiro dia da viagem", example = "2026-11-20")
    private LocalDate startDate;

    @Schema(description = "Quantidade de dias, de 1 a 7", example = "3")
    @Min(value = 1, message = "O roteiro deve ter pelo menos 1 dia")
    @Max(value = MAX_DAYS, message = "O roteiro pode ter no máximo " + MAX_DAYS + " dias")
    private Integer days;

    @Schema(description = "Ritmo: INTENSO (dia cheio), EQUILIBRADO (alterna dias cheios e meio período) ou LEVE", example = "EQUILIBRADO")
    private TravelPace pace;

    /** Slug da cidade em {@code data/cities.json}; sem ele, vale a cidade mais perto da partida. */
    @Schema(description = "Slug da cidade (GET /cities); sem ele, vale a cidade mais perto da partida", example = "roma")
    private String city;

    /** Nome dado pelo usuario; sem ele, o app mostra um nome generico. */
    @Schema(description = "Nome dado pelo usuário, até 80 caracteres", example = "Lua de mel em Roma")
    @Size(max = ItineraryNames.MAX_LENGTH, message = "O nome do roteiro pode ter no máximo " + ItineraryNames.MAX_LENGTH + " caracteres")
    private String name;

    /** Como o viajante quer a viagem, com as proprias palavras; interpretado pela IA. */
    @Schema(description = "Como o viajante quer a viagem, em texto livre", example = "Quero museus e comida de rua, nada de igrejas", nullable = true)
    @Size(max = AdjustItineraryRequestDTO.MAX_LENGTH, message = "O pedido pode ter no máximo " + AdjustItineraryRequestDTO.MAX_LENGTH + " caracteres")
    private String request;
}
