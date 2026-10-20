package com.trajetto.backend.itinerary.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Catalogo curado de pontos turisticos, uma cidade por arquivo.
 *
 * <p>{@code data/cities.json} lista as cidades atendidas (centro, raio, fuso) e cada
 * uma tem o seu {@code data/cities/<slug>.geojson}, gerado por
 * {@code scripts/gera_catalogo_cidade.py}. Adicionar uma cidade e acrescentar uma
 * entrada no manifesto e o arquivo dela -- o codigo nao muda.</p>
 */
@Component
public class CityCatalog {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record City(
            String slug,
            String name,
            String country,
            double latitude,
            double longitude,
            double radiusKm,
            String timezone
    ) {
        public ZoneId zone() {
            return ZoneId.of(timezone);
        }
    }

    public record CatalogPlace(
            String city,
            String name,
            String address,
            double latitude,
            double longitude,
            List<String> profiles,
            String openingHours,
            String category,
            String fee,
            String phone,
            String website,
            String wikidata,
            String wikipedia,
            String wheelchair,
            int popularity
    ) {}

    private final ObjectMapper objectMapper;
    private final List<City> cities;
    private final List<CatalogPlace> places;

    public CityCatalog(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.cities = List.copyOf(loadCities());
        List<CatalogPlace> loaded = new ArrayList<>();
        for (City city : cities) {
            loaded.addAll(loadPlaces(city));
        }
        this.places = Collections.unmodifiableList(loaded);
    }

    private List<City> loadCities() {
        try (InputStream stream = getClass().getResourceAsStream("/data/cities.json")) {
            if (stream == null) {
                throw new IllegalStateException("cities.json not found in classpath");
            }
            List<City> list = objectMapper.readValue(stream, new TypeReference<>() {});
            if (list.isEmpty()) {
                throw new IllegalStateException("cities.json has no city");
            }
            return list;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load cities.json", e);
        }
    }

    private List<CatalogPlace> loadPlaces(City city) {
        String file = "/data/cities/" + city.slug() + ".geojson";
        List<CatalogPlace> loaded = new ArrayList<>();
        try (InputStream stream = getClass().getResourceAsStream(file)) {
            if (stream == null) {
                throw new IllegalStateException(file + " not found in classpath");
            }
            JsonNode root = objectMapper.readTree(stream);
            for (JsonNode feature : root.get("features")) {
                JsonNode props = feature.get("properties");
                String name = props.path("name").asText("");
                double lat = props.path("latitude").asDouble();
                double lon = props.path("longitude").asDouble();
                List<String> profiles = props.has("profiles")
                        ? objectMapper.convertValue(props.get("profiles"), new TypeReference<>() {})
                        : List.of();

                if (!name.isBlank() && lat != 0.0 && lon != 0.0) {
                    loaded.add(new CatalogPlace(
                            city.slug(), name, props.path("address").asText(""), lat, lon, profiles,
                            props.path("opening_hours").asText(""), props.path("category").asText(""),
                            props.path("fee").asText(""), props.path("phone").asText(""),
                            props.path("website").asText(""), props.path("wikidata").asText(""),
                            props.path("wikipedia").asText(""), props.path("wheelchair").asText(""),
                            props.path("popularity").asInt(0)
                    ));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load " + file, e);
        }
        return loaded;
    }

    public List<City> getCities() {
        return cities;
    }

    /** Todos os pontos, cidade a cidade, na ordem do manifesto e de cada arquivo. */
    public List<CatalogPlace> getPlaces() {
        return places;
    }

    public Optional<City> city(String slug) {
        return cities.stream().filter(c -> c.slug().equals(slug)).findFirst();
    }

    public List<CatalogPlace> placesOf(City city) {
        return places.stream().filter(p -> p.city().equals(city.slug())).toList();
    }

    /**
     * Cidade do catalogo mais perto da posicao. Fora do raio de todas, ainda devolve a
     * mais proxima: o roteiro sempre sai de alguma cidade atendida.
     */
    public City nearestCity(double lat, double lon) {
        return cities.stream()
                .min(Comparator.comparingDouble(c -> haversineKm(lat, lon, c.latitude(), c.longitude())))
                .orElseThrow();
    }

    static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
