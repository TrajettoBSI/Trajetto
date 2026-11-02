package com.trajetto.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Dados de cadastro de usuário.
 * <p>
 * As restrições abaixo são aplicadas no POST /user/create (anotado com {@code @Valid}); as
 * violações são devolvidas no contrato de erro padrão, com a lista de campos em {@code details}.
 */
@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados de cadastro de usuário")
public class UserDTO {
    @Schema(description = "Ignorado no cadastro: o id é gerado pelo banco", accessMode = Schema.AccessMode.READ_ONLY, example = "2")
    private Long id;

    @Schema(description = "Nome", example = "Ana")
    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 2, max = 50, message = "O nome deve ter entre 2 e 50 caracteres")
    private String firstName;

    @Schema(description = "Sobrenome", example = "Silva")
    @NotBlank(message = "O sobrenome é obrigatório")
    @Size(min = 2, max = 50, message = "O sobrenome deve ter entre 2 e 50 caracteres")
    private String lastName;

    @Schema(description = "Perfil de viajante, resultado do teste de perfil", example = "Aventureiro")
    private String travelerProfile;

    @Schema(description = "Data de nascimento", example = "1995-03-15")
    @NotNull(message = "A data de nascimento é obrigatória")
    @Past(message = "A data de nascimento deve ser anterior à data atual")
    private LocalDate birthDate;

    @Schema(description = "Telefone com DDI e DDD", example = "+55 41 99876-5432")
    @NotBlank(message = "O telefone é obrigatório")
    @Size(min = 8, max = 20, message = "O telefone deve ter entre 8 e 20 caracteres")
    private String telephone;

    @Schema(description = "E-mail; recebe o código de verificação", example = "ana.silva@email.com")
    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Informe um e-mail válido")
    private String email;

    @Schema(description = "País de residência", example = "Brasil")
    @NotBlank(message = "O país é obrigatório")
    private String country;

    @Schema(description = "Senha, com no mínimo 8 caracteres", example = "Trajetto@2026", accessMode = Schema.AccessMode.WRITE_ONLY)
    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, max = 100, message = "A senha deve ter no mínimo 8 caracteres")
    private String password;

    // Sem campo de perfil: o cadastro sempre cria um USER, e o perfil só muda por
    // PUT /user/{id}/role, que exige a permissão ROLES_ASSIGN.
//    private String profilePicture;
}
