package com.trajetto.backend.stats.repository;

import com.trajetto.backend.itinerary.model.PlaceModel;
import com.trajetto.backend.stats.dto.MostVisitedPlaceDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * Indicadores de lugares do painel gerencial.
 *
 * <p>A tabela de lugares e a que mais cresce -- ganha uma linha por parada de
 * cada roteiro gerado --, entao era justamente a pior candidata a ser
 * carregada inteira para contar categoria e repeticao de nome, que era o que
 * o painel fazia.</p>
 *
 * <p>Um local nao tem data nem dono proprios: ele herda os dois do roteiro em
 * que aparece. Por isso o recorte por periodo, perfil e pais chega aqui por
 * uma subconsulta ate {@code itineraries} e {@code users}, enquanto a
 * categoria e comparada na propria linha.</p>
 */
public interface PlaceStatsRepository extends Repository<PlaceModel, Long> {

    /**
     * Lugares por categoria. Sem categoria vira "Outros" na propria
     * consulta, e essa fatia vai para o fim da lista.
     *
     * <p>Nativa pelo mesmo motivo de {@code countByTravelerProfile}: com
     * {@code only_full_group_by} ligado, o MySQL so aceita ordenar pelo
     * apelido da coluna agrupada, e apelido de coluna nao existe em uma
     * projecao JPQL por construtor.</p>
     *
     * <p>O apelido e {@code category_label}, e nao {@code category}: no
     * ORDER BY o MySQL da preferencia a coluna real da tabela quando o nome
     * bate com o apelido, e ai o criterio de ordenacao passaria a olhar
     * {@code places.category} -- nulo justamente nas linhas de "Outros", que
     * subiriam para o topo da lista.</p>
     *
     * <p>Com uma categoria escolhida o grafico fica com uma fatia so, que e o
     * que o filtro pede: e o mesmo numero que os outros blocos passam a
     * contar.</p>
     *
     * <p>Colunas, na ordem: categoria, total.</p>
     */
    @Query(value = """
            SELECT COALESCE(NULLIF(TRIM(p.category), ''), 'Outros') AS category_label,
                   COUNT(*)                                         AS total
            FROM places p
            WHERE """ + StatsRecortes.LOCAL_SQL + """
            GROUP BY category_label
            ORDER BY (category_label = 'Outros') ASC, total DESC
            """, nativeQuery = true)
    List<Object[]> countByCategory(@Param("from") LocalDate from,
                                   @Param("to") LocalDate to,
                                   @Param("profile") String profile,
                                   @Param("country") String country,
                                   @Param("category") String category);

    /**
     * Lugares que mais aparecem dentro dos roteiros do recorte.
     *
     * <p>O recorte dos dez primeiros vai como {@link Pageable}, virando
     * {@code LIMIT} na consulta: o banco descarta o resto em vez de mandar
     * a tabela toda para a aplicacao cortar depois.</p>
     */
    @Query("""
            SELECT new com.trajetto.backend.stats.dto.MostVisitedPlaceDTO(p.name, COUNT(p))
            FROM PlaceModel p
            WHERE p.name IS NOT NULL AND TRIM(p.name) <> ''
              AND """ + StatsRecortes.LOCAL_JPQL + """
            GROUP BY p.name
            ORDER BY COUNT(p) DESC, p.name ASC
            """)
    List<MostVisitedPlaceDTO> findMostVisited(Pageable pageable,
                                              @Param("from") LocalDate from,
                                              @Param("to") LocalDate to,
                                              @Param("profile") String profile,
                                              @Param("country") String country,
                                              @Param("category") String category);

    // ─── Opções dos seletores do filtro ────────────────────────────────────

    /**
     * As categorias de local que existem na base, para o seletor do painel.
     *
     * <p>Devolve o mesmo rotulo que o grafico exibe e que o filtro compara,
     * inclusive "Outros". Sem recorte, pelo mesmo motivo das outras opcoes:
     * a lista precisa continuar completa depois que o usuario escolhe uma.</p>
     */
    @Query(value = """
            SELECT DISTINCT COALESCE(NULLIF(TRIM(p.category), ''), 'Outros') AS category_label
            FROM places p
            ORDER BY (category_label = 'Outros') ASC, category_label ASC
            """, nativeQuery = true)
    List<String> findCategoryOptions();
}
