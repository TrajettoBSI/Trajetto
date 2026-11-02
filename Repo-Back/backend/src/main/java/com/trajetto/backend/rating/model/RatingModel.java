package com.trajetto.backend.rating.model;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "Avaliação de um ponto turístico")
@Entity
public class RatingModel {

    @Schema(description = "Identificador", example = "31")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Schema(description = "Nome de quem avaliou", example = "Carlos Ferreira")
    @Column(name = "user_name")
    private String userName;

    @Schema(description = "xid do ponto avaliado", example = "osm_colosseo")
    @Column(nullable = false)
    private String touristSpotXid;

    /**
     * Autor da avaliacao. Guardado como identificador solto, sem associacao
     * mapeada -- por isso o Hibernate nunca criou a chave estrangeira, que a
     * migracao V6 passou a declarar diretamente no esquema.
     */
    @Schema(description = "Id do autor", example = "3")
    @Column(nullable = false)
    private Long userId;

    @Schema(description = "Nota de 1 a 5", example = "5")
    private int rating;

    @Schema(description = "Comentário", example = "Chegue cedo: às 8h30 a fila ainda é pequena.")
    private String comment;

    @Schema(description = "Quando foi feita", example = "2026-10-12T16:20:05")
    private LocalDateTime createdAt;
}
