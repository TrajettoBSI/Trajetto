package com.trajetto.backend.itinerary.controller;

import com.trajetto.backend.itinerary.data.CityCatalog;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityCatalog cityCatalog;

    public record CityResponse(String slug, String name, String country, double latitude, double longitude,
                               int spots) {}

    @Operation(summary = "Cidades atendidas pelo catalogo, com o centro de cada uma e quantos pontos ela tem")
    @GetMapping
    public List<CityResponse> getAll() {
        return cityCatalog.getCities().stream()
                .map(c -> new CityResponse(c.slug(), c.name(), c.country(), c.latitude(), c.longitude(),
                        cityCatalog.placesOf(c).size()))
                .toList();
    }
}
