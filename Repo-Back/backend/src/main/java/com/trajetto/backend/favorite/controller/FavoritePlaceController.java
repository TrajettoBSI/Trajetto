package com.trajetto.backend.favorite.controller;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiException;
import com.trajetto.backend.favorite.dto.FavoritePlaceRequestDTO;
import com.trajetto.backend.favorite.dto.FavoritePlaceResponseDTO;
import com.trajetto.backend.favorite.service.FavoritePlaceService;
import com.trajetto.backend.security.UserToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Favoritos")
@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
@SecurityRequirement(name = "AuthServer")
public class FavoritePlaceController {

    private final FavoritePlaceService favoritePlaceService;

    @Operation(summary = "Lista os favoritos",
            description = "Locais favoritos do usuário do token, do mais recente para o mais antigo.")
    @ApiResponse(responseCode = "200", description = "Favoritos do usuário")
    @GetMapping
    public ResponseEntity<List<FavoritePlaceResponseDTO>> list(@AuthenticationPrincipal UserToken userToken) {
        return ResponseEntity.ok(favoritePlaceService.list(requireAuthenticated(userToken).getId()));
    }

    @Operation(summary = "Marca um local como favorito",
            description = "O xid é gerado a partir do nome do local. Marcar de novo o mesmo local não duplica: devolve o favorito existente.")
    @ApiResponse(responseCode = "200", description = "Favorito marcado")
    @PostMapping
    public ResponseEntity<FavoritePlaceResponseDTO> mark(
            @AuthenticationPrincipal UserToken userToken,
            @Valid @RequestBody FavoritePlaceRequestDTO req) {
        return ResponseEntity.ok(favoritePlaceService.mark(requireAuthenticated(userToken).getId(), req));
    }

    @Operation(summary = "Desmarca um favorito",
            description = "Desmarcar um local que não é favorito não falha.")
    @ApiResponse(responseCode = "204", description = "Favorito removido")
    @DeleteMapping("/{xid}")
    public ResponseEntity<Void> unmark(
            @AuthenticationPrincipal UserToken userToken,
            @Parameter(description = "Identificador do local, o mesmo devolvido na listagem", example = "osm_jardim_bot_nico_de_curitiba")
            @PathVariable String xid) {
        favoritePlaceService.unmark(requireAuthenticated(userToken).getId(), xid);
        return ResponseEntity.noContent().build();
    }

    private UserToken requireAuthenticated(UserToken userToken) {
        if (userToken == null) {
            throw new ApiException(ApiErrorCode.UNAUTHENTICATED);
        }
        return userToken;
    }
}
