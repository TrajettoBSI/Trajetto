package com.trajetto.backend.rating.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.rating.model.RatingDocument;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingMongoRepository;
import com.trajetto.backend.rating.repository.RatingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingMongoSyncTest {

    private static final CityCatalog CATALOGO = new CityCatalog(new ObjectMapper());

    @Mock private RatingRepository ratingRepository;
    @Mock private RatingMongoRepository ratingMongoRepository;
    @Mock private RatingService ratingService;

    private RatingMongoSync sync() {
        return new RatingMongoSync(ratingRepository, ratingMongoRepository, ratingService, CATALOGO);
    }

    private static RatingModel avaliacao(long id, String xid) {
        RatingModel rating = new RatingModel();
        rating.setId(id);
        rating.setTouristSpotXid(xid);
        return rating;
    }

    private static RatingDocument espelho(String id) {
        RatingDocument doc = new RatingDocument();
        doc.setId(id);
        return doc;
    }

    @Test
    @DisplayName("Copia so as avaliacoes que faltam no Mongo, com o nome e a categoria do catalogo")
    void copiaAsQueFaltam() {
        RatingModel jaEspelhada = avaliacao(1, "osm_colosseo");
        RatingModel coliseu = avaliacao(2, "osm_colosseo");
        RatingModel foraDoCatalogo = avaliacao(3, "osm_lugar_que_nao_existe");
        when(ratingMongoRepository.findAll()).thenReturn(List.of(espelho("1")));
        when(ratingRepository.findAll()).thenReturn(List.of(jaEspelhada, coliseu, foraDoCatalogo));

        sync().sincronizar();

        verify(ratingService, never()).espelharNoMongo(eq(jaEspelhada), any(), any());
        verify(ratingService).espelharNoMongo(eq(coliseu), eq("Colosseo"), anyString());
        verify(ratingService).espelharNoMongo(eq(foraDoCatalogo), isNull(), isNull());
    }

    @Test
    @DisplayName("Com o Mongo fora do ar, o backend sobe mesmo assim")
    void mongoForaDoAr() {
        when(ratingMongoRepository.findAll()).thenThrow(new DataAccessResourceFailureException("sem conexao"));

        sync().sincronizar();

        verify(ratingService, never()).espelharNoMongo(any(), any(), any());
    }
}
