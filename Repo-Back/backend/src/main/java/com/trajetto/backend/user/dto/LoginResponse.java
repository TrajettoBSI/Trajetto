package com.trajetto.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resultado do login: o token JWT e os dados do usuário")
public record LoginResponse(
        @Schema(description = "Token JWT para o cabeçalho Authorization: Bearer", example = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJQVUNQUiBBdXRoU2VydmVyIiwic3ViIjoiMiIsImV4cCI6MTc2MjE5MjYwMH0.4qS1n5Vb0kE8l2v6Zt3m9yWcR7pXjHfA1uD0eN6gLsQ")
        String token,
        @Schema(description = "Usuário autenticado")
        UserResponseDTO user
) { }