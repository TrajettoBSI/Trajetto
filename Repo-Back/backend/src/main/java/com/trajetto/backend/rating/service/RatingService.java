package com.trajetto.backend.rating.service;

import com.trajetto.backend.exception.ForbiddenOperationException;
import com.trajetto.backend.exception.ResourceConflictException;
import com.trajetto.backend.exception.ResourceNotFoundException;
import com.trajetto.backend.itinerary.model.PlaceModel;
import com.trajetto.backend.itinerary.repository.PlaceRepository;
import com.trajetto.backend.rating.model.RatingDocument;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingMongoRepository;
import com.trajetto.backend.rating.repository.RatingRepository;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    /** Rotulo que o painel usa quando o criterio nao foi preenchido -- mesma convencao da StatsRecortes. */
    private static final String SEM_PERFIL = "Sem perfil";
    private static final String OUTROS = "Outros";

    private final RatingRepository ratingRepository;
    private final RatingMongoRepository ratingMongoRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;

    public List<RatingModel> getRatingsBySpot(String touristSpotXid) {
        return ratingRepository.findByTouristSpotXid(touristSpotXid);
    }

    public double getAverageRating(String touristSpotXid) {
        List<RatingModel> ratings = ratingRepository.findByTouristSpotXid(touristSpotXid);

        return ratings.stream()
                .mapToInt(RatingModel::getRating)
                .average()
                .orElse(0.0);
    }

    public RatingModel createRating(String touristSpotXid, Long userId, String userName, int ratingValue, String comment) {

        ratingRepository.findByTouristSpotXidAndUserId(touristSpotXid, userId)
                .ifPresent(existing -> {
                    throw new ResourceConflictException("Este usuário já avaliou este local.");
                });

        RatingModel rating = new RatingModel();
        rating.setTouristSpotXid(touristSpotXid);
        rating.setUserName(userName);
        rating.setUserId(userId);
        rating.setRating(ratingValue);
        rating.setComment(comment);
        rating.setCreatedAt(LocalDateTime.now());

        RatingModel salvo = ratingRepository.save(rating);
        espelharNoMongo(salvo);
        return salvo;
    }

    public RatingModel updateRating(Long ratingId,
                               Long userId,
                               int newRating,
                               String newComment) {

        RatingModel rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação", ratingId));

        if (!rating.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Esta avaliação pertence a outro usuário.");
        }

        rating.setRating(newRating);
        rating.setComment(newComment);

        RatingModel salvo = ratingRepository.save(rating);

        // So rating/comment mudam -- o retrato de perfil/pais/categoria e do
        // momento em que a avaliacao foi criada, nao se mexe numa edicao.
        ratingMongoRepository.findById(String.valueOf(salvo.getId())).ifPresent(doc -> {
            doc.setRating(salvo.getRating());
            doc.setComment(blankToNull(salvo.getComment()));
            ratingMongoRepository.save(doc);
        });
        return salvo;
    }

    public void deleteRating(Long ratingId, Long userId) {

        RatingModel rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação", ratingId));

        if (!rating.getUserId().equals(userId)) {
            throw new ForbiddenOperationException("Esta avaliação pertence a outro usuário.");
        }

        ratingRepository.delete(rating);
        ratingMongoRepository.deleteById(String.valueOf(ratingId));
    }

    /**
     * Copia para o Mongo o retrato da avaliacao no momento em que ela e
     * criada: perfil/pais de quem avaliou (de {@code users}) e nome/categoria
     * do local avaliado (de {@code places}), os mesmos rotulos que
     * {@code StatsRecortes} usa para filtrar. E essa copia que o ranking por
     * aggregation le depois, sem precisar perguntar a nenhuma das duas
     * tabelas de novo.
     */
    private void espelharNoMongo(RatingModel rating) {
        UserModel usuario = userRepository.findById(rating.getUserId()).orElse(null);
        PlaceModel local = placeRepository.findFirstByXid(rating.getTouristSpotXid()).orElse(null);

        RatingDocument doc = new RatingDocument();
        doc.setId(String.valueOf(rating.getId()));
        doc.setTouristSpotXid(rating.getTouristSpotXid());
        doc.setTouristSpotName(local != null ? local.getName() : rating.getTouristSpotXid());
        doc.setTouristSpotCategory(rotuloOuPadrao(local != null ? local.getCategory() : null, OUTROS));
        doc.setUserId(rating.getUserId());
        doc.setUserName(rating.getUserName());
        doc.setUserProfile(rotuloOuPadrao(usuario != null ? usuario.getTravelerProfile() : null, SEM_PERFIL));
        doc.setUserCountry(usuario != null ? blankToNull(usuario.getCountry()) : null);
        doc.setRating(rating.getRating());
        doc.setComment(blankToNull(rating.getComment()));
        doc.setCreatedAt(rating.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant());

        ratingMongoRepository.save(doc);
    }

    private static String rotuloOuPadrao(String valor, String padrao) {
        return valor == null || valor.isBlank() ? padrao : valor.trim();
    }

    private static String blankToNull(String valor) {
        return valor == null || valor.isBlank() ? null : valor;
    }
}
