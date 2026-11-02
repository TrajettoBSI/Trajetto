package com.trajetto.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Resposta JSON simples para operações que não devolvem um recurso. */
@Schema(description = "Resposta simples de confirmação")
public record MessageResponse(
        @Schema(description = "Mensagem para o usuário", example = "E-mail verificado com sucesso.") String message) {
}
