package com.trajetto.backend.rating.controller;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiException;
import com.trajetto.backend.exception.ForbiddenOperationException;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.service.RatingService;
import com.trajetto.backend.security.UserToken;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @Getter
    @Setter
    public static class RatingRequest {

        @NotBlank(message = "O local avaliado é obrigatório")
        private String placeId;

        /** Ignorado: o autor é sempre o usuário do token. Mantido por compatibilidade com o aplicativo. */
        private String userName;

        /** Opcional; quando enviado, precisa ser o usuário do token. */
        private Long userId;

        @Min(value = 1, message = "A nota deve estar entre 1 e 5")
        @Max(value = 5, message = "A nota deve estar entre 1 e 5")
        private int rating;

        @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres")
        private String comment;
    }

    @GetMapping("/spot")
    public ResponseEntity<List<RatingModel>> getRatingsBySpot(
            @RequestParam @NotBlank(message = "O identificador do local é obrigatório") String xid
    ) {
        List<RatingModel> ratings = ratingService.getRatingsBySpot(xid);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/spot/average")
    public ResponseEntity<Double> getAverageRating(
            @RequestParam @NotBlank(message = "O identificador do local é obrigatório") String xid
    ) {
        double avg = ratingService.getAverageRating(xid);
        return ResponseEntity.ok(avg);
    }

    @PostMapping
    public ResponseEntity<RatingModel> createRating(@AuthenticationPrincipal UserToken userToken,
                                                    @Valid @RequestBody RatingRequest request) {
        RatingModel created = ratingService.createRating(
                request.getPlaceId(),
                requireSelf(userToken, request.getUserId()),
                request.getRating(),
                request.getComment()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RatingModel> updateRating(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            @RequestParam
            @Min(value = 1, message = "A nota deve estar entre 1 e 5")
            @Max(value = 5, message = "A nota deve estar entre 1 e 5") int rating,
            @RequestParam(required = false)
            @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres") String comment
    ) {
        RatingModel updated = ratingService.updateRating(id, requireSelf(userToken, userId), rating, comment);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long id,
            @RequestParam(required = false) Long userId
    ) {
        ratingService.deleteRating(id, requireSelf(userToken, userId));
        return ResponseEntity.noContent().build();
    }

    /** Devolve o id do usuário do token; um {@code userId} enviado pelo cliente precisa ser o mesmo. */
    private Long requireSelf(UserToken userToken, Long userId) {
        if (userToken == null) throw new ApiException(ApiErrorCode.UNAUTHENTICATED);
        if (userId != null && !userId.equals(userToken.getId())) {
            throw new ForbiddenOperationException("Você só pode gerenciar as suas próprias avaliações.");
        }
        return userToken.getId();
    }
}
