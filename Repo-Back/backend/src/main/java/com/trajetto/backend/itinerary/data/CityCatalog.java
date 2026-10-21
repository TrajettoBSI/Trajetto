package com.trajetto.backend.itinerary.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.text.Normalizer;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
            int popularity,
            String site,
            Map<String, String> names
    ) {}

    /**
     * Pontos a menos disso um do outro sao a mesma visita: o OSM cadastra a Piramide, o
     * Palacio e o Museu do Louvre separados, mas quem vai la faz uma parada so.
     */
    public static final double SAME_VISIT_KM = 0.1;

    /**
     * Ate essa distancia, tambem e a mesma visita quando o nome de um contem o do outro:
     * "Statue of Liberty" e "Statue of Liberty Museum", "Templo Mayor" e "Museo Templo Mayor".
     */
    public static final double SAME_NAME_VISIT_KM = 0.25;

    /*
     * Pontos com o mesmo "site" (o Wikidata do recinto do OSM em que estao: o planalto de
     * Gize, a Acropole, a Cidadela do Cairo) tambem sao a mesma visita, a qualquer distancia
     * -- a Grande Piramide e a Esfinge ficam a 500 m uma da outra, mas e um ingresso so.
     */

    private final ObjectMapper objectMapper;
    private final List<City> cities;
    private final List<CatalogPlace> places;
    private final Map<CatalogPlace, List<CatalogPlace>> sameVisit = new IdentityHashMap<>();
    private final Map<String, List<CatalogPlace>> byName = new HashMap<>();

    public CityCatalog(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.cities = List.copyOf(loadCities());
        List<CatalogPlace> loaded = new ArrayList<>();
        for (City city : cities) {
            loaded.addAll(loadPlaces(city));
        }
        this.places = Collections.unmodifiableList(loaded);
        for (City city : cities) {
            List<CatalogPlace> ofCity = placesOf(city);
            Map<CatalogPlace, List<String>> nameWords = new IdentityHashMap<>();
            ofCity.forEach(p -> nameWords.put(p, words(p.name())));
            for (CatalogPlace p : ofCity) {
                sameVisit.put(p, ofCity.stream()
                        .filter(o -> {
                            double km = haversineKm(p.latitude(), p.longitude(), o.latitude(), o.longitude());
                            return km <= SAME_VISIT_KM || (km <= SAME_NAME_VISIT_KM
                                    && oneNamesTheOther(nameWords.get(p), nameWords.get(o), city))
                                    || (!p.site().isEmpty() && p.site().equals(o.site()));
                        })
                        .toList());
            }
        }
        for (CatalogPlace p : places) {
            byName.computeIfAbsent(p.name().toLowerCase(Locale.ROOT), k -> new ArrayList<>()).add(p);
        }
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
                Map<String, String> names = props.has("names")
                        ? Map.copyOf(objectMapper.convertValue(props.get("names"), new TypeReference<Map<String, String>>() {}))
                        : Map.of();

                if (!name.isBlank() && lat != 0.0 && lon != 0.0) {
                    loaded.add(new CatalogPlace(
                            city.slug(), name, props.path("address").asText(""), lat, lon, profiles,
                            props.path("opening_hours").asText(""), props.path("category").asText(""),
                            props.path("fee").asText(""), props.path("phone").asText(""),
                            props.path("website").asText(""), props.path("wikidata").asText(""),
                            props.path("wikipedia").asText(""), props.path("wheelchair").asText(""),
                            props.path("popularity").asInt(0), props.path("site").asText(""), names
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

    /** O proprio ponto e os outros do catalogo no mesmo lugar (ver {@link #SAME_VISIT_KM}). */
    public List<CatalogPlace> sameVisit(CatalogPlace place) {
        return sameVisit.getOrDefault(place, List.of(place));
    }

    /**
     * Ponto do catalogo com esse nome, sem diferenciar maiusculas. O nome se repete entre
     * cidades -- Toquio tambem tem uma "Statue of Liberty" --, entao vale o mais perto da posicao.
     */
    public Optional<CatalogPlace> findByName(String name, double lat, double lon) {
        if (name == null) {
            return Optional.empty();
        }
        return byName.getOrDefault(name.toLowerCase(Locale.ROOT), List.of()).stream()
                .min(Comparator.comparingDouble(p -> haversineKm(lat, lon, p.latitude(), p.longitude())));
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

    /** Um nome contem o outro, palavra por palavra -- desde que o menor nao seja so o nome da cidade. */
    private static boolean oneNamesTheOther(List<String> a, List<String> b, City city) {
        List<String> shorter = a.size() <= b.size() ? a : b;
        List<String> longer = shorter == a ? b : a;
        if (shorter.equals(longer) || String.join("", shorter).length() < 6 || shorter.equals(words(city.name()))) {
            return false;
        }
        return Collections.indexOfSubList(longer, shorter) >= 0;
    }

    /** Palavras do nome sem acento e em minusculas: "Kōdai-ji" vira [kodai, ji]. */
    static List<String> words(String name) {
        String plain = Normalizer.normalize(name, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        return Arrays.stream(plain.split("[^a-z0-9]+")).filter(w -> !w.isEmpty()).toList();
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
