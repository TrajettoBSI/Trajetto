package com.trajetto.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Atualização parcial do próprio perfil: todos os campos são opcionais e apenas os enviados
 * são validados — o valor nulo significa "não alterar".
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Atualização parcial do próprio perfil: envie só os campos que mudam")
public class UserUpdateDTO {

    @Schema(description = "Nome", example = "Ana Julia")
    @Size(min = 2, max = 50, message = "O nome deve ter entre 2 e 50 caracteres")
    private String firstName;

    @Schema(description = "Sobrenome", example = "Silva")
    @Size(min = 2, max = 50, message = "O sobrenome deve ter entre 2 e 50 caracteres")
    private String lastName;

    @Schema(description = "Perfil de viajante", example = "Cultural")
    private String travelerProfile;

    @Schema(description = "Telefone", example = "+55 41 99876-5432")
    @Size(min = 8, max = 20, message = "O telefone deve ter entre 8 e 20 caracteres")
    private String telephone;

    @Schema(description = "País de residência", example = "Portugal")
    @Size(min = 2, max = 60, message = "O país deve ter entre 2 e 60 caracteres")
    private String country;

    @Schema(description = "E-mail", example = "ana.silva@email.com")
    @Email(message = "Informe um e-mail válido")
    private String email;

    @Schema(description = "Data de nascimento", example = "1995-03-15")
    @Past(message = "A data de nascimento deve ser anterior à data atual")
    private LocalDate birthDate;
//    private String profilePicture;
}
