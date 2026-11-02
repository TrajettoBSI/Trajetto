package com.trajetto.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Dados públicos do usuário")
public class UserResponseDTO {
    @Schema(description = "Identificador", example = "2")
    private Long id;
    @Schema(description = "Nome", example = "Ana")
    private String firstName;
    @Schema(description = "Sobrenome", example = "Silva")
    private String lastName;
    @Schema(description = "Perfil de viajante", example = "Aventureiro")
    private String travelerProfile;
    @Schema(description = "Data de nascimento", example = "1995-03-15")
    private LocalDate birthDate;
    @Schema(description = "Telefone", example = "+55 41 99876-5432")
    private String telephone;
    @Schema(description = "E-mail", example = "ana.silva@email.com")
    private String email;
    @Schema(description = "País de residência", example = "Brasil")
    private String country;
    /** Derivado do perfil; mantido porque o aplicativo navega por ele. */
    @Schema(description = "Se o perfil de acesso é ADMIN", example = "false")
    private Boolean isAdmin;
    /** Código do perfil de acesso (ADMIN, USER ou outro cadastrado em roles). */
    @Schema(description = "Código do perfil de acesso", example = "USER")
    private String role;
    /** Permissões do perfil, para o aplicativo decidir o que exibir. */
    @Schema(description = "Permissões do perfil de acesso", example = "[]")
    private List<String> permissions;
//    private String profilePictureUrl;
}