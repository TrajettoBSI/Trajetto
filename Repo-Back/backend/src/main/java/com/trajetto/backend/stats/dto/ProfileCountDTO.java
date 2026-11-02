package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Usuarios por perfil de viajante. Quem nao respondeu o teste entra como
 * "Sem perfil", rotulo resolvido na propria consulta.
 */
@Schema(description = "Usuários de um perfil de viajante")
public record ProfileCountDTO(@Schema(description = "Perfil; quem não fez o teste entra como Sem perfil", example = "Cultural") String profile, @Schema(description = "Quantidade de usuários", example = "11") long count) {}
