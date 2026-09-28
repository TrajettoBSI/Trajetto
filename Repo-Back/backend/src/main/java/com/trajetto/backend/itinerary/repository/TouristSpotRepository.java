package com.trajetto.backend.itinerary.repository;

import com.trajetto.backend.itinerary.model.TouristSpotModel;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Consultas sobre o catalogo de pontos turisticos (tabela {@code tourist_spots}, migracao V8).
 *
 * <p>Toda a filtragem do mapa acontece aqui, no banco -- inclusive a de
 * proximidade, que antes era uma formula de Haversine aplicada em Java ponto
 * a ponto sobre a lista inteira carregada em memoria.</p>
 */
public interface TouristSpotRepository extends Repository<TouristSpotModel, Long> {

    /** Uma linha da busca. {@code distanceMeters} e nulo quando nao ha ponto de referencia. */
    interface TouristSpotRow {
        Long getId();
        String getName();
        String getAddress();
        Double getLatitude();
        Double getLongitude();
        String getCategory();
        String getFee();
        String getOpeningHours();
        String getPhone();
        String getWebsite();
        String getWikidata();
        String getWikipedia();
        String getWheelchair();
        /** Perfis do ponto separados por virgula, ou nulo se nao houver nenhum. */
        String getProfiles();
        Double getDistanceMeters();
    }

    /**
     * Busca de pontos do catalogo com filtros opcionais, incluindo proximidade.
     *
     * <p>Todo criterio e guardado por {@code :parametro IS NULL}, o mesmo
     * padrao de {@code StatsRecortes}: sem valor, ele nao filtra nada.</p>
     *
     * <h2>Proximidade</h2>
     * <p>Com um ponto de referencia ({@code lat}, {@code lng}) e um raio em
     * metros, o filtro e feito em dois passos:</p>
     * <ol>
     *   <li>{@code MBRContains} contra o retangulo envolvente de
     *       {@code ST_Buffer(ponto, raio)}. E um predicado de contencao, entao
     *       o otimizador o resolve pelo indice espacial
     *       {@code sx_tourist_spots_location} (plano {@code range}) em vez de
     *       percorrer a tabela;</li>
     *   <li>{@code ST_Distance}, que no SRID 4326 devolve metros sobre o
     *       elipsoide WGS 84, so nos pontos que passaram pelo retangulo, para
     *       descartar os que ficaram nos cantos.</li>
     * </ol>
     * <p>A guarda {@code :lat IS NULL OR ...} nao atrapalha o indice: com o
     * ponto informado ela vira uma constante falsa e o otimizador a elimina
     * antes de escolher o plano.</p>
     *
     * <p>Com ponto de referencia o resultado vem do mais perto para o mais
     * longe; sem ele, na ordem do catalogo.</p>
     *
     * <p>Texto, categoria, entrada e perfil sao comparados pela collation da
     * tabela ({@code utf8mb4_0900_ai_ci}), que ja ignora maiusculas -- o
     * mesmo {@code equalsIgnoreCase} que o filtro em Java fazia.</p>
     */
    @Query(value = """
            SELECT s.id            AS id,
                   s.name          AS name,
                   s.address       AS address,
                   s.latitude      AS latitude,
                   s.longitude     AS longitude,
                   s.category      AS category,
                   s.fee           AS fee,
                   s.opening_hours AS openingHours,
                   s.phone         AS phone,
                   s.website       AS website,
                   s.wikidata      AS wikidata,
                   s.wikipedia     AS wikipedia,
                   s.wheelchair    AS wheelchair,
                   (SELECT GROUP_CONCAT(sp.profile ORDER BY sp.profile SEPARATOR ',')
                    FROM tourist_spot_profiles sp
                    WHERE sp.spot_id = s.id) AS profiles,
                   CASE WHEN :lat IS NULL THEN NULL
                        ELSE ST_Distance(s.location, ST_SRID(POINT(:lng, :lat), 4326))
                   END AS distanceMeters
            FROM tourist_spots s
            WHERE (:search IS NULL
                   OR s.name    LIKE CONCAT('%', :search, '%')
                   OR s.address LIKE CONCAT('%', :search, '%'))
              AND (:category IS NULL OR s.category = :category)
              AND (:fee IS NULL OR s.fee = :fee)
              AND (:onlyWithHours IS NULL OR s.opening_hours IS NOT NULL)
              AND (:profile IS NULL OR EXISTS (
                       SELECT 1 FROM tourist_spot_profiles fp
                       WHERE fp.spot_id = s.id AND fp.profile = :profile))
              AND (:lat IS NULL OR (
                       MBRContains(ST_Buffer(ST_SRID(POINT(:lng, :lat), 4326), :radius), s.location)
                       AND ST_Distance(s.location, ST_SRID(POINT(:lng, :lat), 4326)) <= :radius))
            ORDER BY distanceMeters, s.id
            LIMIT :limit
            """, nativeQuery = true)
    List<TouristSpotRow> search(@Param("search") String search,
                                @Param("category") String category,
                                @Param("fee") String fee,
                                @Param("onlyWithHours") Boolean onlyWithHours,
                                @Param("profile") String profile,
                                @Param("lat") Double lat,
                                @Param("lng") Double lng,
                                @Param("radius") Double radius,
                                @Param("limit") int limit);

    @Query(value = """
            SELECT DISTINCT category FROM tourist_spots
            WHERE category IS NOT NULL
            ORDER BY category
            """, nativeQuery = true)
    List<String> findCategories();

    @Query(value = "SELECT DISTINCT profile FROM tourist_spot_profiles ORDER BY profile", nativeQuery = true)
    List<String> findProfiles();
}
