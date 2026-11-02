package com.trajetto.backend.weather;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/weather")
@Tag(name = "Clima", description = "Previsão do tempo dos dias do roteiro")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    @Operation(summary = "Previsão diária entre duas datas",
            description = "Só os dias dentro dos próximos 16 dias têm previsão; os demais ficam de fora da lista.")
    public ResponseEntity<List<DayWeather>> forecast(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(List.copyOf(weatherService.forecast(latitude, longitude, startDate, endDate).values()));
    }
}
