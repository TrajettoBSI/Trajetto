package com.trajetto.backend.stats;

import com.trajetto.backend.support.ApiIntegrationTest;
import com.trajetto.backend.user.model.UserModel;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.DisplayName;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StatsApiIntegrationTest extends ApiIntegrationTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "/stats/filter-options", "/stats/overview", "/stats/countries", "/stats/traveler-profiles",
            "/stats/itineraries-per-user", "/stats/age-groups", "/stats/itinerary-overview",
            "/stats/itineraries-per-month", "/stats/places-by-category", "/stats/top-rated-places",
            "/stats/most-commented-places", "/stats/most-visited-places"
    })
    @DisplayName("Cada indicador do painel responde ao administrador e e negado ao usuario comum")
    void indicadoresDoPainel(String endpoint) throws Exception {
        UserModel admin = usuario(true);
        UserModel comum = usuario(false);

        mvc.perform(comToken(get(endpoint).param("from", "2026-01-01").param("to", "2026-12-31"), admin))
                .andExpect(status().isOk());
        mvc.perform(comToken(get(endpoint), comum)).andExpect(status().isForbidden());
    }
}
