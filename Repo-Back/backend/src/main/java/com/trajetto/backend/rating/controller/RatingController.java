package com.trajetto.backend.rating.controller;

import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

import io.swagger.v3.oas.annotations.Parameter;

import io.swagger.v3.oas.annotations.Operation;

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

@Tag(name = "Avaliações")
@Validated
@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @Getter
    @Setter
    @Schema(description = "Nova avaliação de um ponto turístico")
    public static class RatingRequest {

        @Schema(description = "xid do ponto avaliado", example = "osm_colosseo")
        @NotBlank(message = "O local avaliado é obrigatório")
        private String placeId;

        /** Ignorado: o autor é sempre o usuário do token. Mantido por compatibilidade com o aplicativo. */
        @Schema(description = "Ignorado: o autor é sempre o usuário do token", deprecated = true)
        private String userName;

        /** Opcional; quando enviado, precisa ser o usuário do token. */
        @Schema(description = "Opcional; se enviado, precisa ser o usuário do token", example = "2", nullable = true)
        private Long userId;

        @Schema(description = "Nota de 1 a 5", example = "5")
        @Min(value = 1, message = "A nota deve estar entre 1 e 5")
        @Max(value = 5, message = "A nota deve estar entre 1 e 5")
        private int rating;

        @Schema(description = "Comentário de até 500 caracteres", example = "Chegue cedo: às 8h30 a fila ainda é pequena.", nullable = true)
        @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres")
        private String comment;
    }

    @Operation(summary = "Avaliações de um ponto",
            description = "Todas as avaliações feitas pelos usuários para o ponto, com nota e comentário.")
    @ApiResponse(responseCode = "200", description = "Avaliações do ponto")
    @GetMapping("/spot")
    public ResponseEntity<List<RatingModel>> getRatingsBySpot(
            @Parameter(description = "xid do ponto", example = "osm_colosseo") @RequestParam @NotBlank(message = "O identificador do local é obrigatório") String xid
    ) {
        List<RatingModel> ratings = ratingService.getRatingsBySpot(xid);
        return ResponseEntity.ok(ratings);
    }

    @Operation(summary = "Média das avaliações de um ponto",
            description = "Média das notas do ponto; 0 quando ainda não há avaliação.")
    @ApiResponse(responseCode = "200", description = "Média, ex.: 4.7")
    @GetMapping("/spot/average")
    public ResponseEntity<Double> getAverageRating(
            @Parameter(description = "xid do ponto", example = "osm_colosseo") @RequestParam @NotBlank(message = "O identificador do local é obrigatório") String xid
    ) {
        double avg = ratingService.getAverageRating(xid);
        return ResponseEntity.ok(avg);
    }

    @Operation(summary = "Avalia um ponto turístico",
            description = "Registra nota e comentário do usuário do token para o ponto.")
    @ApiResponse(responseCode = "201", description = "Avaliação criada")
    @ApiResponse(responseCode = "403", description = "O userId enviado não é o do token")
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

    @Operation(summary = "Edita uma avaliação própria",
            description = "Nota e comentário vão como parâmetros de consulta. Só o autor pode editar.")
    @ApiResponse(responseCode = "200", description = "Avaliação atualizada")
    @ApiResponse(responseCode = "403", description = "A avaliação é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Avaliação não encontrada")
    @PutMapping("/{id}")
    public ResponseEntity<RatingModel> updateRating(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id da avaliação", example = "31") @PathVariable Long id,
            @Parameter(description = "Opcional; se enviado, precisa ser o usuário do token", example = "2") @RequestParam(required = false) Long userId,
            @Parameter(description = "Nota de 1 a 5", example = "4") @RequestParam
            @Min(value = 1, message = "A nota deve estar entre 1 e 5")
            @Max(value = 5, message = "A nota deve estar entre 1 e 5") int rating,
            @Parameter(description = "Comentário de até 500 caracteres", example = "Vale a visita, mas reserve com antecedência.") @RequestParam(required = false)
            @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres") String comment
    ) {
        RatingModel updated = ratingService.updateRating(id, requireSelf(userToken, userId), rating, comment);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Remove uma avaliação própria",
            description = "Só o autor pode remover.")
    @ApiResponse(responseCode = "204", description = "Avaliação removida")
    @ApiResponse(responseCode = "403", description = "A avaliação é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Avaliação não encontrada")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id da avaliação", example = "31") @PathVariable Long id,
            @Parameter(description = "Opcional; se enviado, precisa ser o usuário do token", example = "2") @RequestParam(required = false) Long userId
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
