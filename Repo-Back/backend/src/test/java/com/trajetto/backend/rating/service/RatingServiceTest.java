package com.trajetto.backend.rating.service;

import com.trajetto.backend.itinerary.model.PlaceModel;
import com.trajetto.backend.itinerary.repository.PlaceRepository;
import com.trajetto.backend.rating.model.RatingDocument;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingMongoRepository;
import com.trajetto.backend.rating.repository.RatingRepository;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * O espelho Mongo de uma avaliacao carrega um retrato do momento em que ela
 * foi criada (perfil/pais de quem avaliou, nome/categoria do local avaliado),
 * para o ranking por aggregation nao precisar de join com users/places. Este
 * teste cobre esse retrato -- inclusive os mesmos casos de borda que o
 * ranking em SQL ja tratava (local sem nome cadastrado, perfil/pais em
 * branco) -- e que a escrita chega aos dois bancos.
 */
@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock private RatingRepository ratingRepository;
    @Mock private RatingMongoRepository ratingMongoRepository;
    @Mock private UserRepository userRepository;
    @Mock private PlaceRepository placeRepository;

    private RatingService service() {
        return new RatingService(ratingRepository, ratingMongoRepository, userRepository, placeRepository);
    }

    private static void stubSalvarComId(RatingRepository repo, long id) {
        when(repo.save(any())).thenAnswer(inv -> {
            RatingModel m = inv.getArgument(0);
            m.setId(id);
            return m;
        });
    }

    @Test
    @DisplayName("Avaliação criada leva ao Mongo o retrato do local e de quem avaliou")
    void criarAvaliacao_espelhaNoMongoComRetratoDoMomento() {
        when(ratingRepository.findByTouristSpotXidAndUserId("X1", 7L)).thenReturn(Optional.empty());
        stubSalvarComId(ratingRepository, 99L);

        PlaceModel local = new PlaceModel();
        local.setName("Coliseu");
        local.setCategory("museum");
        when(placeRepository.findFirstByXid("X1")).thenReturn(Optional.of(local));

        UserModel usuario = new UserModel();
        usuario.setTravelerProfile("CULTURAL");
        usuario.setCountry("Brasil");
        when(userRepository.findById(7L)).thenReturn(Optional.of(usuario));

        service().createRating("X1", 7L, "Maria", 5, "Muito bom");

        ArgumentCaptor<RatingDocument> captor = ArgumentCaptor.forClass(RatingDocument.class);
        verify(ratingMongoRepository).save(captor.capture());
        RatingDocument doc = captor.getValue();

        assertEquals("99", doc.getId());
        assertEquals("X1", doc.getTouristSpotXid());
        assertEquals("Coliseu", doc.getTouristSpotName());
        assertEquals("museum", doc.getTouristSpotCategory());
        assertEquals("CULTURAL", doc.getUserProfile());
        assertEquals("Brasil", doc.getUserCountry());
        assertEquals(5, doc.getRating());
        assertEquals("Muito bom", doc.getComment());
    }

    @Test
    @DisplayName("Local sem cadastro em places cai no xid e na categoria 'Outros', como o ranking em SQL já fazia")
    void criarAvaliacao_semLocalCadastradoCaiNoXidEOutros() {
        when(ratingRepository.findByTouristSpotXidAndUserId(any(), anyLong())).thenReturn(Optional.empty());
        stubSalvarComId(ratingRepository, 1L);
        when(placeRepository.findFirstByXid("X9")).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.empty());

        service().createRating("X9", 7L, "Maria", 4, null);

        ArgumentCaptor<RatingDocument> captor = ArgumentCaptor.forClass(RatingDocument.class);
        verify(ratingMongoRepository).save(captor.capture());
        RatingDocument doc = captor.getValue();

        assertEquals("X9", doc.getTouristSpotName());
        assertEquals("Outros", doc.getTouristSpotCategory());
    }

    @Test
    @DisplayName("Perfil/país em branco caem nos mesmos rótulos padrão do filtro ('Sem perfil', nulo)")
    void criarAvaliacao_perfilEPaisEmBrancoUsamFallback() {
        when(ratingRepository.findByTouristSpotXidAndUserId(any(), anyLong())).thenReturn(Optional.empty());
        stubSalvarComId(ratingRepository, 1L);
        when(placeRepository.findFirstByXid(any())).thenReturn(Optional.empty());

        UserModel usuario = new UserModel();
        usuario.setTravelerProfile("   ");
        usuario.setCountry("");
        when(userRepository.findById(7L)).thenReturn(Optional.of(usuario));

        service().createRating("X1", 7L, "Maria", 3, "");

        ArgumentCaptor<RatingDocument> captor = ArgumentCaptor.forClass(RatingDocument.class);
        verify(ratingMongoRepository).save(captor.capture());
        RatingDocument doc = captor.getValue();

        assertEquals("Sem perfil", doc.getUserProfile());
        assertNull(doc.getUserCountry());
        assertNull(doc.getComment());
    }

    @Test
    @DisplayName("Editar avaliação só muda nota/comentário no Mongo — o retrato do momento da criação não se mexe")
    void atualizarAvaliacao_naoMexeNoRetrato() {
        RatingModel existente = new RatingModel();
        existente.setId(5L);
        existente.setUserId(7L);
        existente.setTouristSpotXid("X1");
        existente.setRating(3);
        existente.setComment("ok");
        when(ratingRepository.findById(5L)).thenReturn(Optional.of(existente));
        when(ratingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RatingDocument docExistente = new RatingDocument();
        docExistente.setId("5");
        docExistente.setTouristSpotName("Coliseu");
        docExistente.setUserProfile("CULTURAL");
        docExistente.setRating(3);
        docExistente.setComment("ok");
        when(ratingMongoRepository.findById("5")).thenReturn(Optional.of(docExistente));

        service().updateRating(5L, 7L, 5, "Agora melhor");

        ArgumentCaptor<RatingDocument> captor = ArgumentCaptor.forClass(RatingDocument.class);
        verify(ratingMongoRepository).save(captor.capture());
        RatingDocument salvo = captor.getValue();

        assertEquals(5, salvo.getRating());
        assertEquals("Agora melhor", salvo.getComment());
        assertEquals("Coliseu", salvo.getTouristSpotName());
        assertEquals("CULTURAL", salvo.getUserProfile());
    }

    @Test
    @DisplayName("Apagar avaliação remove dos dois bancos")
    void apagarAvaliacao_removeDosDoisBancos() {
        RatingModel existente = new RatingModel();
        existente.setId(5L);
        existente.setUserId(7L);
        when(ratingRepository.findById(5L)).thenReturn(Optional.of(existente));

        service().deleteRating(5L, 7L);

        verify(ratingRepository).delete(existente);
        verify(ratingMongoRepository).deleteById("5");
    }
}
