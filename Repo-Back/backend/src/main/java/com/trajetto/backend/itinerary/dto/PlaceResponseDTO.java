package com.trajetto.backend.itinerary.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

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
}