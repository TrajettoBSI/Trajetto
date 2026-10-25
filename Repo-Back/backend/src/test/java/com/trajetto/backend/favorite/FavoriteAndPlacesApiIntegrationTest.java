package com.trajetto.backend.favorite;

import com.trajetto.backend.support.ApiIntegrationTest;
import com.trajetto.backend.user.model.UserModel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FavoriteAndPlacesApiIntegrationTest extends ApiIntegrationTest {

    @Test
    @DisplayName("Favoritos pela API: marcar, listar e desmarcar, sempre do usuario do token")
    void favoritos() throws Exception {
        UserModel user = usuario(false);
        Map<String, Object> coliseu = Map.of("name", "Colosseo", "address", "Piazza del Colosseo",
                "category", "attraction", "latitude", 41.8902, "longitude", 12.4922);

        mvc.perform(json(comToken(post("/favorites"), user), coliseu))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.xid").value("osm_colosseo"));
        mvc.perform(comToken(get("/favorites"), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mvc.perform(comToken(delete("/favorites/osm_colosseo"), user)).andExpect(status().isNoContent());
        mvc.perform(comToken(get("/favorites"), user)).andExpect(jsonPath("$.length()").value(0));

        mvc.perform(get("/favorites")).andExpect(status().isUnauthorized());
        mvc.perform(json(comToken(post("/favorites"), user), Map.of("name", "", "latitude", 200, "longitude", 0)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Catalogo pela API: busca, proximidade, categorias e perfis")
    void catalogo() throws Exception {
        UserModel user = usuario(false);

        mvc.perform(comToken(get("/places").param("search", "Colosseo"), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Colosseo"))
                .andExpect(jsonPath("$[0].xid").value("osm_colosseo"));
        mvc.perform(comToken(get("/places/nearby").param("lat", "41.8986").param("lng", "12.4769")
                        .param("radius", "1200").param("limit", "3").param("category", "cafe"), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].category").value("cafe"));
        mvc.perform(comToken(get("/places/nearby").param("lat", "95").param("lng", "12"), user))
                .andExpect(status().isBadRequest());
        mvc.perform(comToken(get("/places/categories"), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@ == 'museum')]").exists());
        mvc.perform(comToken(get("/places/profiles"), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@ == 'CULTURAL')]").exists());
    }
}
