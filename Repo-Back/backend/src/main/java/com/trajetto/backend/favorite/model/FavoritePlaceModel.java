package com.trajetto.backend.favorite.model;

import com.trajetto.backend.user.model.UserModel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Local marcado como favorito por um usuario (migracao V12).
 *
 * <p>Guarda o recorte do local que a lista de favoritos exibe, porque o
 * catalogo fica no MongoDB e nao tem chave estavel; o {@code xid} e o mesmo
 * que roteiros e avaliacoes usam para o local.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "favorite_places")
public class FavoritePlaceModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserModel user;

    @Column(name = "xid", nullable = false)
    private String xid;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address")
    private String address;

    @Column(name = "category")
    private String category;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
