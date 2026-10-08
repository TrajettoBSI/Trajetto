package com.trajetto.backend.itinerary.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Ponto do catalogo curado de Roma, espelhado do GeoJSON na colecao MongoDB
 * {@code tourist_spots}.
 *
 * <p>Os perfis ficam embutidos no proprio documento (sem colecao separada,
 * ao contrario da antiga tabela {@code tourist_spot_profiles} do MySQL), e
 * {@code location} e um ponto GeoJSON, usado pelo indice {@code 2dsphere}
 * na busca por proximidade.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@Document(collection = "tourist_spots")
public class TouristSpotDocument {

    @Id
    private Long id;

    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private GeoJsonPoint location;
    private String category;
    private String fee;
    private String openingHours;
    private String phone;
    private String website;
    private String wikidata;
    private String wikipedia;
    private String wheelchair;
    private List<String> profiles;

    public static TouristSpotDocument of(Long id, String name, String address, double latitude, double longitude,
                                          String category, String fee, String openingHours, String phone,
                                          String website, String wikidata, String wikipedia, String wheelchair,
                                          List<String> profiles) {
        TouristSpotDocument doc = new TouristSpotDocument();
        doc.id = id;
        doc.name = name;
        doc.address = address;
        doc.latitude = latitude;
        doc.longitude = longitude;
        doc.location = new GeoJsonPoint(longitude, latitude);
        doc.category = category;
        doc.fee = fee;
        doc.openingHours = openingHours;
        doc.phone = phone;
        doc.website = website;
        doc.wikidata = wikidata;
        doc.wikipedia = wikipedia;
        doc.wheelchair = wheelchair;
        doc.profiles = profiles;
        return doc;
    }
}
