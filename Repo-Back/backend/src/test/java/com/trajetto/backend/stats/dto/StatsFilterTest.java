package com.trajetto.backend.stats.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * O filtro do painel decide, sozinho, o que conta como "critério escolhido".
 *
 * <p>A distinção importa porque as consultas testam {@code :parametro IS
 * NULL} para saber se aplicam a condição: um valor em branco que chegasse
 * como string vazia viraria um recorte por país igual a "", e o painel
 * voltaria zerado justamente quando o usuário acabou de limpar o seletor.</p>
 */
class StatsFilterTest {

    @Test
    @DisplayName("Texto em branco é o mesmo que critério não escolhido")
    void textoEmBrancoViraNulo() {
        StatsFilter filtro = new StatsFilter(null, null, "", "   ", null);

        assertNull(filtro.profile());
        assertNull(filtro.country());
        assertTrue(filtro.vazio());
    }

    @Test
    @DisplayName("Espaço em volta do valor não muda o valor escolhido")
    void espacoEmVoltaESeparado() {
        StatsFilter filtro = new StatsFilter(null, null, "  Cultural  ", " Brasil", "Museu ");

        assertEquals("Cultural", filtro.profile());
        assertEquals("Brasil", filtro.country());
        assertEquals("Museu", filtro.category());
    }

    @Test
    @DisplayName("Só o período já é um recorte")
    void apenasPeriodoJaERecorte() {
        StatsFilter filtro = new StatsFilter(LocalDate.of(2026, 1, 1), null, null, null, null);

        assertFalse(filtro.vazio());
    }

    @Test
    @DisplayName("Sem nenhum critério, o painel é o de sempre")
    void semRecorte() {
        assertTrue(StatsFilter.SEM_RECORTE.vazio());
    }
}
