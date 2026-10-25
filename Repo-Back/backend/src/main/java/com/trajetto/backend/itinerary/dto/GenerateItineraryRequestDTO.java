package com.trajetto.backend.itinerary.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class
GenerateItineraryRequestDTO {

    public static final int MAX_DAYS = 7;

    /** Preenchido pelo controller com o usuário do token; se o cliente enviar, precisa ser o mesmo. */
    private Long userId;

    @DecimalMin(value = "-90.0", message = "A latitude de origem deve estar entre -90 e 90")
    @DecimalMax(value = "90.0", message = "A latitude de origem deve estar entre -90 e 90")
    private double startLatitude;

    @DecimalMin(value = "-180.0", message = "A longitude de origem deve estar entre -180 e 180")
    @DecimalMax(value = "180.0", message = "A longitude de origem deve estar entre -180 e 180")
    private double startLongitude;

    private LocalDate startDate;

    @Min(value = 1, message = "O roteiro deve ter pelo menos 1 dia")
    @Max(value = MAX_DAYS, message = "O roteiro pode ter no máximo " + MAX_DAYS + " dias")
    private Integer days;

    private TravelPace pace;

    /** Slug da cidade em {@code data/cities.json}; sem ele, vale a cidade mais perto da partida. */
    private String city;

    /** Nome dado pelo usuario; sem ele, o app mostra um nome generico. */
    @Size(max = ItineraryNames.MAX_LENGTH, message = "O nome do roteiro pode ter no máximo " + ItineraryNames.MAX_LENGTH + " caracteres")
    private String name;
}
