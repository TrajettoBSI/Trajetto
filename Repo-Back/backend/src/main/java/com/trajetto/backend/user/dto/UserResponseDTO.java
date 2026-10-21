package com.trajetto.backend.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String travelerProfile;
    private LocalDate birthDate;
    private String telephone;
    private String email;
    private String country;
    /** Derivado do perfil; mantido porque o aplicativo navega por ele. */
    private Boolean isAdmin;
    /** Código do perfil de acesso (ADMIN, USER ou outro cadastrado em roles). */
    private String role;
    /** Permissões do perfil, para o aplicativo decidir o que exibir. */
    private List<String> permissions;
//    private String profilePictureUrl;
}