package com.trajetto.backend.stats.repository;

import com.trajetto.backend.itinerary.model.ItineraryModel;
import com.trajetto.backend.stats.dto.ItinerariesPerMonthRowDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * Indicadores de roteiros do painel gerencial.
 *
 * <p>Os cartoes do topo deste bloco -- total, duracao media, nota media,
 * avaliados e nao avaliados -- ficam em {@link ItineraryOverviewStatsRepository},
 * que chama a stored procedure {@code sp_stats_itinerary_overview}. Aqui fica
 * o grafico mensal.</p>
 */
public interface ItineraryStatsRepository extends Repository<ItineraryModel, Long> {

    /**
     * Roteiros criados por mes, em ordem cronologica, dentro do recorte.
     *
     * <p>O agrupamento por ano e mes e feito pelo banco; a aplicacao so
     * traduz o par (ano, mes) para o rotulo em portugues que o grafico
     * exibe.</p>
     *
     * <p>Com um periodo escolhido o grafico passa a mostrar so os meses
     * daquele intervalo -- o mesmo WHERE que ja descartava roteiro sem data
     * de inicio passa a descartar tambem o que caiu fora do recorte.</p>
     */
    @Query("""
            SELECT new com.trajetto.backend.stats.dto.ItinerariesPerMonthRowDTO(
                       YEAR(i.startDate), MONTH(i.startDate), COUNT(i))
            FROM ItineraryModel i
            WHERE i.startDate IS NOT NULL
              AND """ + StatsRecortes.ROTEIRO_JPQL + """
            GROUP BY YEAR(i.startDate), MONTH(i.startDate)
            ORDER BY YEAR(i.startDate) ASC, MONTH(i.startDate) ASC
            """)
    List<ItinerariesPerMonthRowDTO> countPerMonth(@Param("from") LocalDate from,
                                                  @Param("to") LocalDate to,
                                                  @Param("profile") String profile,
                                                  @Param("country") String country,
                                                  @Param("category") String category);
}
