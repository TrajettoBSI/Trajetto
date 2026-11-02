package com.trajetto.backend.user.controller;

import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

import io.swagger.v3.oas.annotations.Operation;

import com.trajetto.backend.user.dto.MessageResponse;
import com.trajetto.backend.user.service.PasswordResetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Senha")
@SecurityRequirements
@RestController
@RequestMapping("/user/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @Operation(summary = "Solicita a redefinição de senha",
            description = "Envia ao e-mail um código de verificação para criar uma nova senha em POST /user/password/reset.")
    @ApiResponse(responseCode = "200", description = "Código enviado")
    @ApiResponse(responseCode = "404", description = "Não há conta com este e-mail")
    @PostMapping("/forgot")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotRequest request) {
        passwordResetService.sendResetCode(request.email());
        return ResponseEntity.ok(new MessageResponse("Código de redefinição enviado para o e-mail informado."));
    }

    @Operation(summary = "Redefine a senha com o código recebido",
            description = "Troca a senha da conta quando o código enviado por POST /user/password/forgot confere e ainda está no prazo.")
    @ApiResponse(responseCode = "200", description = "Senha redefinida")
    @ApiResponse(responseCode = "400", description = "Código inválido ou senha fora das regras")
    @ApiResponse(responseCode = "422", description = "Código já utilizado ou expirado")
    @PostMapping("/reset")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetRequest request) {
        passwordResetService.resetPassword(
                request.email(),
                request.code(),
                request.newPassword()
        );
        return ResponseEntity.ok(new MessageResponse("Senha redefinida com sucesso."));
    }

    @Schema(description = "Pedido de código para redefinir a senha")
    record ForgotRequest(
            @Schema(description = "E-mail da conta", example = "ana.silva@email.com")
            @NotBlank(message = "O e-mail é obrigatório")
            @Email(message = "Informe um e-mail válido")
            String email
    ) {}

    @Schema(description = "Nova senha com o código de verificação")
    record ResetRequest(
            @Schema(description = "E-mail da conta", example = "ana.silva@email.com")
            @NotBlank(message = "O e-mail é obrigatório")
            @Email(message = "Informe um e-mail válido")
            String email,

            @Schema(description = "Código recebido por e-mail", example = "731045")
            @NotBlank(message = "O código de verificação é obrigatório")
            String code,

            @Schema(description = "Nova senha, com no mínimo 8 caracteres", example = "Roteiro#Roma26")
            @NotBlank(message = "A nova senha é obrigatória")
            @Size(min = 8, max = 100, message = "A senha deve ter no mínimo 8 caracteres")
            String newPassword
    ) {}
}
