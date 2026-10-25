package com.trajetto.backend.itinerary.controller;

import com.trajetto.backend.itinerary.dto.AddPlaceRequestDTO;
import com.trajetto.backend.itinerary.dto.DateRequestDTO;
import com.trajetto.backend.itinerary.dto.GenerateItineraryRequestDTO;
import com.trajetto.backend.itinerary.dto.ItineraryResponseDTO;
import com.trajetto.backend.itinerary.dto.NameRequestDTO;
import com.trajetto.backend.itinerary.dto.NoteRequestDTO;
import com.trajetto.backend.itinerary.dto.PlaceRequestDTO;
import com.trajetto.backend.itinerary.dto.RatingRequestDTO;
import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiException;
import com.trajetto.backend.exception.ForbiddenOperationException;
import com.trajetto.backend.itinerary.service.ItineraryService;
import com.trajetto.backend.security.UserToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de roteiro.
 * <p>
 * As falhas (roteiro inexistente, roteiro de outro usuário, dados inválidos) são lançadas pelo
 * service e traduzidas para o contrato JSON padrão pelo {@code GlobalExceptionHandler}.
 * <p>
 * O dono do roteiro é sempre o usuário do token. O {@code userId} que ainda aparece nas rotas
 * é mantido por compatibilidade com o aplicativo e precisa ser o mesmo do token (senão 403).
 */
@Setter
@Getter
@NoArgsConstructor
@RestController
@RequestMapping(value={"/itinerary"})
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @PostMapping("/mock/{userId}")
    public ResponseEntity<ItineraryResponseDTO> createMock(@AuthenticationPrincipal UserToken userToken,
                                                           @PathVariable Long userId) {
        requireSelf(userToken, userId);
        itineraryService.createItineraryMock(userId);
        return ResponseEntity.ok(itineraryService.getActiveItinerary(userId));
    }

    @GetMapping("/active/{userId}")
    public ResponseEntity<ItineraryResponseDTO> getActive(@AuthenticationPrincipal UserToken userToken,
                                                          @PathVariable Long userId) {
        requireSelf(userToken, userId);
        ItineraryResponseDTO itinerary = itineraryService.getActiveItinerary(userId);
        if (itinerary == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(itinerary);
    }

    @PostMapping("/generate")
    public ResponseEntity<ItineraryResponseDTO> generate(@AuthenticationPrincipal UserToken userToken,
                                                         @Valid @RequestBody GenerateItineraryRequestDTO req) {
        if (req.getUserId() != null) requireSelf(userToken, req.getUserId());
        req.setUserId(requireAuthenticated(userToken).getId());
        return ResponseEntity.ok(itineraryService.generateItinerary(req));
    }

    @GetMapping("/all/{userId}")
    public ResponseEntity<List<ItineraryResponseDTO>> getAll(@AuthenticationPrincipal UserToken userToken,
                                                             @PathVariable Long userId) {
        requireSelf(userToken, userId);
        return ResponseEntity.ok(itineraryService.getAllItineraries(userId));
    }

    @PatchMapping("/{itineraryId}/activate/{userId}")
    public ResponseEntity<ItineraryResponseDTO> activate(@AuthenticationPrincipal UserToken userToken,
                                                         @PathVariable Long itineraryId, @PathVariable Long userId) {
        requireSelf(userToken, userId);
        return ResponseEntity.ok(itineraryService.activateItinerary(itineraryId, userId));
    }

    @PatchMapping("/{itineraryId}/rating")
    public ResponseEntity<ItineraryResponseDTO> updateRating(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long itineraryId,
            @Valid @RequestBody RatingRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateRating(itineraryId, requireAuthenticated(userToken).getId(), req));
    }

    @PatchMapping("/{itineraryId}/date")
    public ResponseEntity<ItineraryResponseDTO> updateDate(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long itineraryId,
            @Valid @RequestBody DateRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateDate(itineraryId, requireAuthenticated(userToken).getId(), req));
    }

    @Operation(summary = "Da um nome ao roteiro; nome em branco volta ao nome generico")
    @SecurityRequirement(name = "AuthServer")
    @PatchMapping("/{itineraryId}/name")
    public ResponseEntity<ItineraryResponseDTO> updateName(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long itineraryId,
            @Valid @RequestBody NameRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateName(itineraryId, requireAuthenticated(userToken).getId(), req));
    }

    @PatchMapping("/{itineraryId}/place/{orderIndex}")
    public ResponseEntity<ItineraryResponseDTO> replacePlace(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long itineraryId,
            @PathVariable Integer orderIndex,
            @Valid @RequestBody PlaceRequestDTO req) {
        return ResponseEntity.ok(itineraryService.replacePlace(itineraryId, orderIndex, requireAuthenticated(userToken).getId(), req));
    }

    @Operation(summary = "Grava a anotacao pessoal do usuario numa parada do roteiro; texto em branco remove a anotacao")
    @SecurityRequirement(name = "AuthServer")
    @PatchMapping("/{itineraryId}/place/{orderIndex}/note")
    public ResponseEntity<ItineraryResponseDTO> updateNote(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long itineraryId,
            @PathVariable Integer orderIndex,
            @Valid @RequestBody NoteRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateNote(itineraryId, orderIndex, requireAuthenticated(userToken).getId(), req));
    }

    @Operation(summary = "Inclui um lugar (por exemplo, um favorito) num dia do roteiro")
    @SecurityRequirement(name = "AuthServer")
    @PostMapping("/{itineraryId}/place")
    public ResponseEntity<ItineraryResponseDTO> addPlace(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long itineraryId,
            @Valid @RequestBody AddPlaceRequestDTO req) {
        return ResponseEntity.ok(itineraryService.addPlace(itineraryId, req, requireAuthenticated(userToken).getId()));
    }

    @Operation(summary = "Tira uma parada do roteiro")
    @SecurityRequirement(name = "AuthServer")
    @DeleteMapping("/{itineraryId}/place/{orderIndex}")
    public ResponseEntity<ItineraryResponseDTO> removePlace(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long itineraryId,
            @PathVariable Integer orderIndex) {
        return ResponseEntity.ok(itineraryService.removePlace(itineraryId, orderIndex, requireAuthenticated(userToken).getId()));
    }

    @Operation(summary = "Troca a parada de horario com a anterior (UP) ou a seguinte (DOWN) do mesmo dia")
    @SecurityRequirement(name = "AuthServer")
    @PatchMapping("/{itineraryId}/place/{orderIndex}/move")
    public ResponseEntity<ItineraryResponseDTO> movePlace(
            @AuthenticationPrincipal UserToken userToken,
            @PathVariable Long itineraryId,
            @PathVariable Integer orderIndex,
            @RequestParam String direction) {
        return ResponseEntity.ok(itineraryService.movePlace(itineraryId, orderIndex, direction, requireAuthenticated(userToken).getId()));
    }

    @DeleteMapping("/{itineraryId}/user/{userId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserToken userToken,
                                       @PathVariable Long itineraryId, @PathVariable Long userId) {
        requireSelf(userToken, userId);
        itineraryService.deleteItinerary(itineraryId, userId);
        return ResponseEntity.noContent().build();
    }

    private UserToken requireAuthenticated(UserToken userToken) {
        if (userToken == null) throw new ApiException(ApiErrorCode.UNAUTHENTICATED);
        return userToken;
    }

    private void requireSelf(UserToken userToken, Long userId) {
        if (!requireAuthenticated(userToken).getId().equals(userId)) {
            throw new ForbiddenOperationException("Você só pode acessar os seus próprios roteiros.");
        }
    }
}
