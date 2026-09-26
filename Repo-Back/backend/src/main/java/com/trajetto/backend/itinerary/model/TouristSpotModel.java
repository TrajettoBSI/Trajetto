package com.trajetto.backend.itinerary.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

/**
 * Ponto do catalogo curado de Roma, espelhado do GeoJSON no banco (migracao V8).
 *
 * <p>Nao confundir com {@link PlaceModel}: aquela e a parada de um roteiro,
 * esta e o ponto turistico em si, que existe independente de alguem o ter
 * colocado num roteiro.</p>
 *
 * <p>A coluna {@code location} (POINT SRID 4326, com indice espacial) nao e
 * mapeada de proposito: ela e gerada pelo banco a partir de latitude e
 * longitude e so aparece nas consultas nativas de {@code TouristSpotRepository}.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tourist_spots")
public class TouristSpotModel {

    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address")
    private String address;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "category", length = 64)
    private String category;

    @Column(name = "fee", length = 16)
    private String fee;

    @Column(name = "opening_hours", length = 512)
    private String openingHours;

    @Column(name = "phone", length = 64)
    private String phone;

    @Column(name = "website", length = 512)
    private String website;

    @Column(name = "wikidata", length = 32)
    private String wikidata;

    @Column(name = "wikipedia")
    private String wikipedia;

    @Column(name = "wheelchair", length = 16)
    private String wheelchair;

    @ElementCollection
    @CollectionTable(name = "tourist_spot_profiles", joinColumns = @JoinColumn(name = "spot_id"))
    @Column(name = "profile", length = 32, nullable = false)
    private Set<String> profiles = new HashSet<>();
}
