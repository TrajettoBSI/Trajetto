package com.trajetto.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Credenciais de login")
public record LoginRequest(

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "Informe um e-mail válido")
        @Schema(description = "E-mail cadastrado", example = "ana.silva@email.com")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Schema(description = "Senha da conta", example = "Trajetto@2026")
        String password
) { }
