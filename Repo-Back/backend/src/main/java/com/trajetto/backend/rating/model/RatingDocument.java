package com.trajetto.backend.rating.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Espelho, no MongoDB, de uma avaliacao criada em {@link RatingModel} (MySQL).
 *
 * <p>Carrega, denormalizados, o perfil/pais de quem avaliou e o nome/categoria
 * do local avaliado -- um retrato do momento da avaliacao, nao um link que se
 * atualiza sozinho se o usuario mudar de perfil depois. E o que permite ao
 * ranking do painel ser calculado so com aggregation do Mongo, sem join
 * nenhum com as tabelas {@code users}/{@code places} (que continuam no
 * MySQL).</p>
 *
 * <p>O {@code id} e o mesmo id gerado pelo MySQL (como string), para que
 * atualizar/apagar a avaliacao original saiba exatamente qual documento
 * espelhar aqui.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@Document(collection = "ratings")
public class RatingDocument {

    @Id
    private String id;

    private String touristSpotXid;
    private String touristSpotName;
    private String touristSpotCategory;

    private Long userId;
    private String userName;
    private String userProfile;
    private String userCountry;

    private int rating;
    private String comment;
    private Instant createdAt;
}
