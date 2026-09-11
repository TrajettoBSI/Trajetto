-- =====================================================================
-- V7 - Os cartoes do painel passam a aceitar o recorte gerencial (OB01.1)
--
-- O painel ganhou quatro filtros -- periodo, perfil de viajante, pais e
-- categoria de local -- e todos precisam ser aplicados dentro da consulta,
-- e nao depois dela. Os graficos sao consultas JPQL/SQL e receberam os
-- criterios como parametro; os cartoes do topo vem destas duas procedures,
-- que nao tinham parametro nenhum.
--
-- Por isso as duas sao recriadas aqui com os cinco parametros do recorte.
-- Criterio nao escolhido chega NULL e a condicao correspondente nao filtra
-- nada: com os cinco nulos, as procedures devolvem exatamente os mesmos
-- numeros das versoes V3 e V5.
--
-- As condicoes sao as mesmas de StatsRecortes, do lado Java, e valem as
-- mesmas decisoes:
--   * perfil e categoria sao comparados pelo rotulo exibido no painel
--     (COALESCE(NULLIF(TRIM(...), ''), ...)), nao pela coluna crua, porque
--     "Sem perfil" e "Outros" nao existem gravados em coluna nenhuma -- e
--     porque e essa a expressao dos indices funcionais das V4 e V6;
--   * periodo e categoria recortam roteiros, nao usuarios: a tabela de
--     usuarios nao tem data de cadastro, e ler "usuario do periodo" como
--     "usuario com roteiro no periodo" zeraria por construcao o indicador de
--     clientes sem roteiro.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Cartoes de usuarios
--
-- A populacao de usuarios responde a perfil e pais. O unico numero deste
-- bloco que conta roteiros -- totalItineraries -- responde aos quatro
-- criterios, porque ai o recorte e sobre o roteiro.
-- ---------------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_stats_user_overview;

CREATE PROCEDURE sp_stats_user_overview(
    IN p_from     DATE,
    IN p_to       DATE,
    IN p_profile  VARCHAR(255),
    IN p_country  VARCHAR(255),
    IN p_category VARCHAR(255))
    READS SQL DATA
    SQL SECURITY INVOKER
    SELECT
        COUNT(*)                                                          AS totalUsers,
        COALESCE(SUM(COALESCE(u.isAdmin, 0) = 1), 0)                      AS totalAdmins,
        COALESCE(SUM(COALESCE(u.isAdmin, 0) = 0), 0)                      AS totalClients,
        COALESCE(SUM(u.is_verified = 1), 0)                               AS verifiedUsers,
        COALESCE(SUM(u.is_verified = 0), 0)                               AS unverifiedUsers,
        ROUND(AVG(CASE
                      WHEN u.birthDate IS NULL THEN NULL
                      ELSE YEAR(CURDATE()) - YEAR(u.birthDate)
                  END))                                                   AS avgAge,
        (SELECT COUNT(*)
           FROM itineraries i
          WHERE (p_from IS NULL OR i.start_date >= p_from)
            AND (p_to   IS NULL OR i.start_date <= p_to)
            AND (p_category IS NULL
                 OR EXISTS (SELECT 1 FROM places rp
                             WHERE rp.itinerary_id = i.id
                               AND COALESCE(NULLIF(TRIM(rp.category), ''), 'Outros') = p_category))
            AND ((p_profile IS NULL AND p_country IS NULL)
                 OR EXISTS (SELECT 1 FROM users ru
                             WHERE ru.code = i.user_id
                               AND (p_profile IS NULL
                                    OR COALESCE(NULLIF(TRIM(ru.travelerProfile), ''), 'Sem perfil') = p_profile)
                               AND (p_country IS NULL OR ru.country = p_country)))) AS totalItineraries
    FROM users u
    WHERE (p_profile IS NULL
           OR COALESCE(NULLIF(TRIM(u.travelerProfile), ''), 'Sem perfil') = p_profile)
      AND (p_country IS NULL OR u.country = p_country);


-- ---------------------------------------------------------------------
-- Cartoes de roteiros
--
-- Aqui os quatro criterios valem para a mesma populacao: o roteiro precisa
-- estar no periodo, ter uma parada da categoria escolhida e pertencer a um
-- usuario do perfil e do pais escolhidos.
-- ---------------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_stats_itinerary_overview;

CREATE PROCEDURE sp_stats_itinerary_overview(
    IN p_from     DATE,
    IN p_to       DATE,
    IN p_profile  VARCHAR(255),
    IN p_country  VARCHAR(255),
    IN p_category VARCHAR(255))
    READS SQL DATA
    SQL SECURITY INVOKER
    SELECT
        COUNT(*)                                                            AS totalItineraries,
        ROUND(AVG(CASE
                      WHEN i.start_date IS NULL OR i.end_date IS NULL THEN NULL
                      ELSE DATEDIFF(i.end_date, i.start_date)
                  END), 1)                                                  AS avgDurationDays,
        ROUND(AVG(i.rating), 1)                                             AS avgRating,
        COALESCE(SUM(i.rating IS NOT NULL), 0)                              AS ratedCount,
        COALESCE(SUM(i.rating IS NULL), 0)                                  AS unratedCount
    FROM itineraries i
    WHERE (p_from IS NULL OR i.start_date >= p_from)
      AND (p_to   IS NULL OR i.start_date <= p_to)
      AND (p_category IS NULL
           OR EXISTS (SELECT 1 FROM places rp
                       WHERE rp.itinerary_id = i.id
                         AND COALESCE(NULLIF(TRIM(rp.category), ''), 'Outros') = p_category))
      AND ((p_profile IS NULL AND p_country IS NULL)
           OR EXISTS (SELECT 1 FROM users ru
                       WHERE ru.code = i.user_id
                         AND (p_profile IS NULL
                              OR COALESCE(NULLIF(TRIM(ru.travelerProfile), ''), 'Sem perfil') = p_profile)
                         AND (p_country IS NULL OR ru.country = p_country)));
