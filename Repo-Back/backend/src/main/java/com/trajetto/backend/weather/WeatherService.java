package com.trajetto.backend.weather;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;

/**
 * Previsao do tempo do Open-Meteo (gratuito, sem chave). Serve o app, que mostra o tempo de
 * cada dia, e o gerador de roteiros, que leva os museus para os dias de chuva.
 *
 * <p>A previsao cobre so os proximos 16 dias: dias fora dessa janela ficam sem previsao, e o
 * roteiro e gerado como antes. Qualquer falha do servico tambem resulta em "sem previsao" --
 * o tempo melhora o roteiro, mas nunca impede de gera-lo.</p>
 */
@Slf4j
@Service
public class WeatherService {

    static final int FORECAST_DAYS = 16;
    private static final Duration CACHE_TTL = Duration.ofHours(1);
    private static final int CACHE_SIZE = 200;

    private final RestTemplate restTemplate;
    private final boolean enabled;
    private final String baseUrl;
    private final Clock clock;

    private record Key(double lat, double lng, LocalDate start, LocalDate end) {}
    private record Cached(Map<LocalDate, DayWeather> days, Instant at) {}

    private final Map<Key, Cached> cache = new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<Key, Cached> eldest) {
            return size() > CACHE_SIZE;
        }
    };

    @Autowired
    public WeatherService(RestTemplateBuilder builder,
                          @Value("${weather.enabled:true}") boolean enabled,
                          @Value("${weather.url:https://api.open-meteo.com/v1/forecast}") String baseUrl) {
        this(builder.connectTimeout(Duration.ofSeconds(3)).readTimeout(Duration.ofSeconds(4)).build(),
                enabled, baseUrl, Clock.systemDefaultZone());
    }

    WeatherService(RestTemplate restTemplate, boolean enabled, String baseUrl, Clock clock) {
        this.restTemplate = restTemplate;
        this.enabled = enabled;
        this.baseUrl = baseUrl;
        this.clock = clock;
    }

    /** Previsao de cada dia entre {@code start} e {@code end} que cai na janela da previsao. */
    public Map<LocalDate, DayWeather> forecast(double latitude, double longitude, LocalDate start, LocalDate end) {
        if (!enabled || start == null || end == null) return Map.of();
        LocalDate today = LocalDate.now(clock);
        LocalDate from = start.isBefore(today) ? today : start;
        LocalDate to = end.isAfter(today.plusDays(FORECAST_DAYS - 1L)) ? today.plusDays(FORECAST_DAYS - 1L) : end;
        if (from.isAfter(to)) return Map.of();

        // Duas casas decimais (~1 km): quem gera varios roteiros na mesma cidade reaproveita a previsao.
        Key key = new Key(Math.round(latitude * 100) / 100.0, Math.round(longitude * 100) / 100.0, from, to);
        synchronized (cache) {
            Cached cached = cache.get(key);
            if (cached != null && cached.at().plus(CACHE_TTL).isAfter(clock.instant())) return cached.days();
        }

        Map<LocalDate, DayWeather> days = fetch(key);
        if (!days.isEmpty()) {
            synchronized (cache) {
                cache.put(key, new Cached(days, clock.instant()));
            }
        }
        return days;
    }

    private Map<LocalDate, DayWeather> fetch(Key key) {
        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("latitude", key.lat())
                .queryParam("longitude", key.lng())
                .queryParam("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max")
                .queryParam("timezone", "auto")
                .queryParam("start_date", key.start())
                .queryParam("end_date", key.end())
                .toUriString();
        try {
            JsonNode body = restTemplate.getForObject(url, JsonNode.class);
            if (body == null) return Map.of();
            JsonNode daily = body.path("daily");
            Map<LocalDate, DayWeather> days = new TreeMap<>();
            JsonNode dates = daily.path("time");
            for (int i = 0; i < dates.size(); i++) {
                LocalDate date = LocalDate.parse(dates.get(i).asText());
                days.put(date, DayWeather.of(date,
                        daily.path("weather_code").path(i).asInt(0),
                        daily.path("temperature_2m_max").path(i).asDouble(),
                        daily.path("temperature_2m_min").path(i).asDouble(),
                        daily.path("precipitation_probability_max").path(i).asInt(0)));
            }
            return days;
        } catch (RestClientException | java.time.format.DateTimeParseException e) {
            log.warn("Previsao do tempo indisponivel ({}, {}): {}", key.lat(), key.lng(), e.getMessage());
            return Map.of();
        }
    }
}
