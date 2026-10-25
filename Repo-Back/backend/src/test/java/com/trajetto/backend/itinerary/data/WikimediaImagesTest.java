package com.trajetto.backend.itinerary.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WikimediaImagesTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    @DisplayName("A miniatura do Commons usa o MD5 do nome do arquivo, com _ no lugar dos espacos")
    void miniatura() {
        assertEquals("https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg",
                WikimediaImages.thumbUrl("Colosseo 2020.jpg"));
        assertEquals("https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Mapa.svg/960px-Mapa.svg.png",
                WikimediaImages.thumbUrl("Mapa.svg"));
    }

    @Test
    @DisplayName("Entre as fotos do Wikidata vale a preferida; sem foto, nao ha imagem")
    void fotoPreferida() throws Exception {
        String claims = """
                {"claims":{"P18":[
                  {"rank":"normal","mainsnak":{"datavalue":{"value":"Antiga.jpg"}}},
                  {"rank":"preferred","mainsnak":{"datavalue":{"value":"Nova.jpg"}}}]}}""";

        assertEquals(Optional.of("Nova.jpg"), WikimediaImages.fileName(mapper.readTree(claims)));
        assertEquals(Optional.empty(), WikimediaImages.fileName(mapper.readTree("{\"claims\":{}}")));
        assertEquals(Optional.empty(), new WikimediaImages(new RestTemplateBuilder()).imageUrl("nao-e-um-id"));
    }
}
