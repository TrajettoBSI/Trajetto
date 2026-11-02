package com.trajetto.backend.itinerary.controller;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

import io.swagger.v3.oas.annotations.Parameter;

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
@Tag(name = "Roteiros")
@SecurityRequirement(name = "AuthServer")
@Setter
@Getter
@NoArgsConstructor
@RestController
@RequestMapping(value={"/itinerary"})
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @Operation(summary = "Cria um roteiro de demonstração",
            description = "Monta um roteiro fixo para o usuário, usado em testes do aplicativo, e o devolve como roteiro ativo.")
    @ApiResponse(responseCode = "200", description = "Roteiro de demonstração criado")
    @ApiResponse(responseCode = "403", description = "O userId não é o do token")
    @PostMapping("/mock/{userId}")
    public ResponseEntity<ItineraryResponseDTO> createMock(@AuthenticationPrincipal UserToken userToken,
                                                           @Parameter(description = "Id do usuário; precisa ser o do token", example = "2") @PathVariable Long userId) {
        requireSelf(userToken, userId);
        itineraryService.createItineraryMock(userId);
        return ResponseEntity.ok(itineraryService.getActiveItinerary(userId));
    }

    @Operation(summary = "Roteiro ativo do usuário",
            description = "O roteiro que o aplicativo mostra no mapa. Responde 204 quando o usuário ainda não tem roteiro.")
    @ApiResponse(responseCode = "200", description = "Roteiro ativo")
    @ApiResponse(responseCode = "204", description = "O usuário não tem roteiro ativo")
    @ApiResponse(responseCode = "403", description = "O userId não é o do token")
    @GetMapping("/active/{userId}")
    public ResponseEntity<ItineraryResponseDTO> getActive(@AuthenticationPrincipal UserToken userToken,
                                                          @Parameter(description = "Id do usuário; precisa ser o do token", example = "2") @PathVariable Long userId) {
        requireSelf(userToken, userId);
        ItineraryResponseDTO itinerary = itineraryService.getActiveItinerary(userId);
        if (itinerary == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(itinerary);
    }

    @Operation(summary = "Gera um roteiro personalizado",
            description = "Escolhe os pontos da cidade de acordo com o perfil de viajante do usuário, a popularidade e o ritmo pedido, distribui as visitas pelos dias com horários e refeições, e torna o novo roteiro o ativo. O dono é sempre o usuário do token.")
    @ApiResponse(responseCode = "200", description = "Roteiro gerado")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou cidade não atendida")
    @ApiResponse(responseCode = "403", description = "O userId enviado não é o do token")
    @PostMapping("/generate")
    public ResponseEntity<ItineraryResponseDTO> generate(@AuthenticationPrincipal UserToken userToken,
                                                         @Valid @RequestBody GenerateItineraryRequestDTO req) {
        if (req.getUserId() != null) requireSelf(userToken, req.getUserId());
        req.setUserId(requireAuthenticated(userToken).getId());
        return ResponseEntity.ok(itineraryService.generateItinerary(req));
    }

    @Operation(summary = "Histórico de roteiros",
            description = "Todos os roteiros do usuário, o ativo e os anteriores.")
    @ApiResponse(responseCode = "200", description = "Roteiros do usuário")
    @ApiResponse(responseCode = "403", description = "O userId não é o do token")
    @GetMapping("/all/{userId}")
    public ResponseEntity<List<ItineraryResponseDTO>> getAll(@AuthenticationPrincipal UserToken userToken,
                                                             @Parameter(description = "Id do usuário; precisa ser o do token", example = "2") @PathVariable Long userId) {
        requireSelf(userToken, userId);
        return ResponseEntity.ok(itineraryService.getAllItineraries(userId));
    }

    @Operation(summary = "Torna um roteiro o ativo",
            description = "Reabre um roteiro do histórico; o que estava ativo deixa de estar.")
    @ApiResponse(responseCode = "200", description = "Roteiro ativado")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro não encontrado")
    @PatchMapping("/{itineraryId}/activate/{userId}")
    public ResponseEntity<ItineraryResponseDTO> activate(@AuthenticationPrincipal UserToken userToken,
                                                         @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId, @Parameter(description = "Id do usuário; precisa ser o do token", example = "2") @PathVariable Long userId) {
        requireSelf(userToken, userId);
        return ResponseEntity.ok(itineraryService.activateItinerary(itineraryId, userId));
    }

    @Operation(summary = "Avalia o roteiro",
            description = "Grava nota (1 a 5) e comentário do usuário sobre o roteiro gerado. Nota nula remove a avaliação.")
    @ApiResponse(responseCode = "200", description = "Avaliação gravada")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro não encontrado")
    @PatchMapping("/{itineraryId}/rating")
    public ResponseEntity<ItineraryResponseDTO> updateRating(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId,
            @Valid @RequestBody RatingRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateRating(itineraryId, requireAuthenticated(userToken).getId(), req));
    }

    @Operation(summary = "Define a data do roteiro",
            description = "Grava a data escolhida pelo usuário (AAAA-MM-DD). Data nula remove a escolha.")
    @ApiResponse(responseCode = "200", description = "Data gravada")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro não encontrado")
    @PatchMapping("/{itineraryId}/date")
    public ResponseEntity<ItineraryResponseDTO> updateDate(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId,
            @Valid @RequestBody DateRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateDate(itineraryId, requireAuthenticated(userToken).getId(), req));
    }

    @Operation(summary = "Dá um nome ao roteiro",
            description = "Nome de até 80 caracteres; nome nulo ou em branco volta ao nome genérico.")
    @ApiResponse(responseCode = "200", description = "Nome gravado")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro não encontrado")
    @PatchMapping("/{itineraryId}/name")
    public ResponseEntity<ItineraryResponseDTO> updateName(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId,
            @Valid @RequestBody NameRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateName(itineraryId, requireAuthenticated(userToken).getId(), req));
    }

    @Operation(summary = "Troca uma parada por outro lugar",
            description = "Substitui o lugar da parada, mantendo o dia; o horário pode ser ajustado em estimatedVisitTime. Usado pelo recálculo em tempo real e pelas alternativas próximas.")
    @ApiResponse(responseCode = "200", description = "Parada trocada")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro ou parada não encontrados")
    @PatchMapping("/{itineraryId}/place/{orderIndex}")
    public ResponseEntity<ItineraryResponseDTO> replacePlace(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId,
            @Parameter(description = "Posição da parada no roteiro (orderIndex)", example = "3") @PathVariable Integer orderIndex,
            @Valid @RequestBody PlaceRequestDTO req) {
        return ResponseEntity.ok(itineraryService.replacePlace(itineraryId, orderIndex, requireAuthenticated(userToken).getId(), req));
    }

    @Operation(summary = "Anota uma parada",
            description = "Grava a anotação pessoal do usuário numa parada; texto em branco remove a anotação.")
    @ApiResponse(responseCode = "200", description = "Anotação gravada")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro ou parada não encontrados")
    @PatchMapping("/{itineraryId}/place/{orderIndex}/note")
    public ResponseEntity<ItineraryResponseDTO> updateNote(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId,
            @Parameter(description = "Posição da parada no roteiro (orderIndex)", example = "3") @PathVariable Integer orderIndex,
            @Valid @RequestBody NoteRequestDTO req) {
        return ResponseEntity.ok(itineraryService.updateNote(itineraryId, orderIndex, requireAuthenticated(userToken).getId(), req));
    }

    @Operation(summary = "Inclui um lugar no roteiro",
            description = "Acrescenta um lugar (por exemplo, um favorito) num dia do roteiro. Sem visitDate, entra no primeiro dia; sem horário, 1h30 depois da última parada do dia.")
    @ApiResponse(responseCode = "200", description = "Lugar incluído")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou dia fora do período do roteiro")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro não encontrado")
    @PostMapping("/{itineraryId}/place")
    public ResponseEntity<ItineraryResponseDTO> addPlace(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId,
            @Valid @RequestBody AddPlaceRequestDTO req) {
        return ResponseEntity.ok(itineraryService.addPlace(itineraryId, req, requireAuthenticated(userToken).getId()));
    }

    @Operation(summary = "Remove uma parada do roteiro",
            description = "Tira a parada e devolve o roteiro atualizado.")
    @ApiResponse(responseCode = "200", description = "Parada removida")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro ou parada não encontrados")
    @DeleteMapping("/{itineraryId}/place/{orderIndex}")
    public ResponseEntity<ItineraryResponseDTO> removePlace(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId,
            @Parameter(description = "Posição da parada no roteiro (orderIndex)", example = "3") @PathVariable Integer orderIndex) {
        return ResponseEntity.ok(itineraryService.removePlace(itineraryId, orderIndex, requireAuthenticated(userToken).getId()));
    }

    @Operation(summary = "Muda a ordem de uma parada",
            description = "Troca o horário da parada com a anterior (UP) ou a seguinte (DOWN) do mesmo dia.")
    @ApiResponse(responseCode = "200", description = "Parada movida")
    @ApiResponse(responseCode = "400", description = "Direção inválida, ou a parada já está no início/fim do dia")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro ou parada não encontrados")
    @PatchMapping("/{itineraryId}/place/{orderIndex}/move")
    public ResponseEntity<ItineraryResponseDTO> movePlace(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId,
            @Parameter(description = "Posição da parada no roteiro (orderIndex)", example = "3") @PathVariable Integer orderIndex,
            @Parameter(description = "UP ou DOWN", example = "UP") @RequestParam String direction) {
        return ResponseEntity.ok(itineraryService.movePlace(itineraryId, orderIndex, direction, requireAuthenticated(userToken).getId()));
    }

    @Operation(summary = "Exclui um roteiro",
            description = "Remove o roteiro do histórico do usuário.")
    @ApiResponse(responseCode = "204", description = "Roteiro excluído")
    @ApiResponse(responseCode = "403", description = "O roteiro é de outro usuário")
    @ApiResponse(responseCode = "404", description = "Roteiro não encontrado")
    @DeleteMapping("/{itineraryId}/user/{userId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserToken userToken,
                                       @Parameter(description = "Id do roteiro", example = "15") @PathVariable Long itineraryId, @Parameter(description = "Id do usuário; precisa ser o do token", example = "2") @PathVariable Long userId) {
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
