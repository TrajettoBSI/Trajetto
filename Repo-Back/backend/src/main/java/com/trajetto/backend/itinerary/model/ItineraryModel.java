package com.trajetto.backend.itinerary.model;

import com.trajetto.backend.user.model.UserModel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "itineraries")
public class ItineraryModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "origin_latitude")
    private Double originLatitude;

    @Column(name = "origin_longitude")
    private Double originLongitude;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserModel user;

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL)
    private List<PlaceModel> places;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "rating_description", columnDefinition = "TEXT")
    private String ratingDescription;

    @Column(name = "date")
    private String date;

    @Column(name = "name", length = 80)
    private String name;

    @Column(name = "city", length = 60)
    private String city;

    @Column(name = "pace", length = 12)
    private String pace;

    /** JSON de {@code TripPreferences}: o que o viajante pediu em texto livre, ja interpretado. */
    @Column(name = "preferences", columnDefinition = "TEXT")
    private String preferences;

    /** Caminho total na ordem gulosa, antes do 2-opt (km em linha reta). */
    @Column(name = "baseline_distance_km")
    private Double baselineDistanceKm;

}
