package com.trajetto.backend.stats.repository;

/**
 * O recorte do painel gerencial escrito uma vez só, em SQL e em JPQL.
 *
 * <p>Os quatro critérios do filtro — período, perfil de viajante, país e
 * categoria de local — precisam entrar em todas as consultas agregadas do
 * módulo, e precisam entrar do mesmo jeito em todas elas: se o gráfico de
 * países contasse o período de um jeito e os cartões do topo de outro, o
 * painel exibiria dois recortes diferentes lado a lado dizendo que são o
 * mesmo. Cada constante aqui é o pedaço de WHERE que define "esta linha está
 * no recorte", e as consultas apenas o concatenam.</p>
 *
 * <p>Concatenar funciona porque são constantes de compilação: uma anotação
 * {@code @Query} aceita expressão constante, então o texto final é montado
 * pelo compilador e não em tempo de execução.</p>
 *
 * <h2>Como um critério ausente é tratado</h2>
 * <p>Toda condição é guardada por {@code :parametro IS NULL}: sem valor, o
 * critério não filtra nada e a consulta devolve exatamente o que devolvia
 * antes do filtro existir. É o que permite os filtros funcionarem isolados ou
 * combinados sem precisar de uma consulta por combinação.</p>
 *
 * <h2>Por que rótulo e não coluna</h2>
 * <p>Perfil e categoria são comparados pelo mesmo
 * {@code COALESCE(NULLIF(TRIM(...), ''), ...)} que os gráficos usam para
 * agrupar. Assim o que o usuário escolhe na legenda é exatamente o que a
 * consulta procura — inclusive "Sem perfil" e "Outros", que não existem como
 * valor gravado em coluna nenhuma. De quebra, é a expressão dos índices
 * funcionais {@code idx_users_profile_label} e
 * {@code idx_places_category_label} (migrações V6 e V4).</p>
 *
 * <h2>Qual critério alcança qual bloco</h2>
 * <p>Perfil e país são atributos de quem usa a plataforma, então recortam
 * tudo: os próprios usuários, e por tabela de origem os roteiros, os locais e
 * as avaliações — sempre pelo dono do roteiro ou pelo autor da avaliação.</p>
 *
 * <p>Período e categoria recortam o que tem data e o que tem categoria:
 * roteiros (pela data de início), locais (pelo roteiro a que pertencem e pela
 * própria categoria) e avaliações (pela data em que foram feitas e pela
 * categoria do local avaliado). Eles deliberadamente <em>não</em> recortam a
 * população de usuários — a tabela não guarda data de cadastro, e a única
 * leitura possível ("usuário com roteiro no recorte") destruiria justamente o
 * indicador de clientes sem roteiro, que passaria a ser zero por
 * construção.</p>
 *
 * <p>Por isso cada consulta recebe só os critérios que a alcançam, e a
 * assinatura do método diz quais são.</p>
 *
 * <h2>Os apelidos</h2>
 * <p>As subconsultas usam {@code ri}, {@code rp} e {@code ru} (roteiro,
 * parada e usuário "do recorte") justamente para não colidirem com os
 * apelidos das consultas que recebem o fragmento — várias delas já usam
 * {@code i}, {@code p} e {@code u}.</p>
 */
public final class StatsRecortes {

    private StatsRecortes() {
    }

    // ─── Usuários ──────────────────────────────────────────────────────────

    /** Recorte de um usuário, em JPQL. Espera o apelido {@code u} sobre {@code UserModel}. */
    public static final String USUARIO_JPQL = """
            (:profile IS NULL OR COALESCE(NULLIF(TRIM(u.travelerProfile), ''), 'Sem perfil') = :profile)
            AND (:country IS NULL OR u.country = :country)
            """;

    /** Recorte de um usuário, em SQL. Espera o apelido {@code u} sobre {@code users}. */
    public static final String USUARIO_SQL = """
            (:profile IS NULL OR COALESCE(NULLIF(TRIM(u.travelerProfile), ''), 'Sem perfil') = :profile)
            AND (:country IS NULL OR u.country = :country)
            """;

    // ─── Roteiros ──────────────────────────────────────────────────────────

    /**
     * Periodo e categoria de um roteiro, em JPQL, sem tocar em quem o criou.
     * Espera o apelido {@code i} sobre {@code ItineraryModel}.
     *
     * <p>E a metade do recorte de roteiro que serve as consultas em que o
     * usuario ja esta restringido por fora — repetir ali a condicao de perfil
     * e pais so acrescentaria um join para reencontrar o mesmo usuario.</p>
     */
    public static final String ROTEIRO_SEM_USUARIO_JPQL = """
            (:from IS NULL OR i.startDate >= :from)
            AND (:to IS NULL OR i.startDate <= :to)
            AND (:category IS NULL
                 OR EXISTS (SELECT 1 FROM PlaceModel rp
                            WHERE rp.itinerary = i
                              AND COALESCE(NULLIF(TRIM(rp.category), ''), 'Outros') = :category))
            """;

    /** Recorte de um roteiro, em JPQL. Espera o apelido {@code i} sobre {@code ItineraryModel}. */
    public static final String ROTEIRO_JPQL = ROTEIRO_SEM_USUARIO_JPQL + """
            AND (:profile IS NULL
                 OR COALESCE(NULLIF(TRIM(i.user.travelerProfile), ''), 'Sem perfil') = :profile)
            AND (:country IS NULL OR i.user.country = :country)
            """;

    /**
     * Periodo e categoria de um roteiro, em SQL, sem tocar em quem o criou.
     * Espera o apelido {@code i} sobre {@code itineraries}.
     */
    public static final String ROTEIRO_SEM_USUARIO_SQL = """
            (:from IS NULL OR i.start_date >= :from)
            AND (:to IS NULL OR i.start_date <= :to)
            AND (:category IS NULL
                 OR EXISTS (SELECT 1 FROM places rp
                            WHERE rp.itinerary_id = i.id
                              AND COALESCE(NULLIF(TRIM(rp.category), ''), 'Outros') = :category))
            """;

    /** Recorte de um roteiro, em SQL. Espera o apelido {@code i} sobre {@code itineraries}. */
    public static final String ROTEIRO_SQL = ROTEIRO_SEM_USUARIO_SQL + """
            AND ((:profile IS NULL AND :country IS NULL)
                 OR EXISTS (SELECT 1 FROM users ru
                            WHERE ru.code = i.user_id
                              AND (:profile IS NULL
                                   OR COALESCE(NULLIF(TRIM(ru.travelerProfile), ''), 'Sem perfil') = :profile)
                              AND (:country IS NULL OR ru.country = :country)))
            """;

    // ─── Locais ────────────────────────────────────────────────────────────

    /** Recorte de uma parada, em JPQL. Espera o apelido {@code p} sobre {@code PlaceModel}. */
    public static final String LOCAL_JPQL = """
            (:category IS NULL OR COALESCE(NULLIF(TRIM(p.category), ''), 'Outros') = :category)
            AND ((:from IS NULL AND :to IS NULL AND :profile IS NULL AND :country IS NULL)
                 OR EXISTS (SELECT 1 FROM ItineraryModel ri
                            WHERE ri = p.itinerary
                              AND (:from IS NULL OR ri.startDate >= :from)
                              AND (:to IS NULL OR ri.startDate <= :to)
                              AND (:profile IS NULL
                                   OR COALESCE(NULLIF(TRIM(ri.user.travelerProfile), ''), 'Sem perfil') = :profile)
                              AND (:country IS NULL OR ri.user.country = :country)))
            """;

    /** Recorte de uma parada, em SQL. Espera o apelido {@code p} sobre {@code places}. */
    public static final String LOCAL_SQL = """
            (:category IS NULL OR COALESCE(NULLIF(TRIM(p.category), ''), 'Outros') = :category)
            AND ((:from IS NULL AND :to IS NULL AND :profile IS NULL AND :country IS NULL)
                 OR EXISTS (SELECT 1 FROM itineraries ri
                            JOIN users ru ON ru.code = ri.user_id
                            WHERE ri.id = p.itinerary_id
                              AND (:from IS NULL OR ri.start_date >= :from)
                              AND (:to IS NULL OR ri.start_date <= :to)
                              AND (:profile IS NULL
                                   OR COALESCE(NULLIF(TRIM(ru.travelerProfile), ''), 'Sem perfil') = :profile)
                              AND (:country IS NULL OR ru.country = :country)))
            """;

    // ─── Avaliações ────────────────────────────────────────────────────────

    /**
     * Recorte de uma avaliação, em SQL. Espera o apelido {@code r} sobre
     * {@code RatingModel}.
     *
     * <p>O período olha a data da própria avaliação — avaliação sem data
     * gravada fica de fora assim que um período é escolhido. Perfil e país
     * são os de quem avaliou. A categoria é a do local avaliado, alcançada
     * pelo xid, que é o único vínculo que a avaliação guarda.</p>
     */
    public static final String AVALIACAO_SQL = """
            (:from IS NULL OR (r.createdAt IS NOT NULL AND DATE(r.createdAt) >= :from))
            AND (:to IS NULL OR (r.createdAt IS NOT NULL AND DATE(r.createdAt) <= :to))
            AND ((:profile IS NULL AND :country IS NULL)
                 OR EXISTS (SELECT 1 FROM users ru
                            WHERE ru.code = r.userId
                              AND (:profile IS NULL
                                   OR COALESCE(NULLIF(TRIM(ru.travelerProfile), ''), 'Sem perfil') = :profile)
                              AND (:country IS NULL OR ru.country = :country)))
            AND (:category IS NULL
                 OR EXISTS (SELECT 1 FROM places rp
                            WHERE rp.xid = r.touristSpotXid
                              AND COALESCE(NULLIF(TRIM(rp.category), ''), 'Outros') = :category))
            """;
}
