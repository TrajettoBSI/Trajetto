package com.trajetto.backend.user.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.trajetto.backend.role.model.RoleModel;
import com.trajetto.backend.role.model.Roles;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class UserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code", unique = true, nullable = false)
    @JsonProperty("id")
    private Long id;

    @JsonProperty("first_name")
    @Column(name = "first_name")
    private String firstName;

    @Getter
    @JsonProperty("last_name")
    @Column(name = "last_name")
    private String lastName;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleModel role;

    @Column(name = "travelerProfile")
    private String travelerProfile;

    @Column(name = "birthDate")
    private LocalDate birthDate;

    @Column(name = "telephone")
    private String telephone;

    @Column(name = "email")
    private String email;

    @Column(name = "country")
    private String country;

    @JsonIgnore
    @Column(name = "password")
    private String password;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "verification_code_expires_at")
    private LocalDateTime verificationCodeExpiresAt;

//    @Column(name = "cpf", nullable = false, unique = true)
//    private String cpf;
//
//    @Column(name = "profile_picture_url", length = 512)
//    private String profilePictureUrl;

    /** Código do perfil, exposto no JSON no lugar da entidade. */
    @JsonProperty("role")
    public String getRoleCode() {
        return role != null ? role.getCode() : null;
    }

    /**
     * Mantido para o aplicativo, que ainda decide a área de navegação por este campo. A
     * autorização do backend não o usa: ela olha as permissões do perfil.
     */
    @JsonProperty("isAdmin")
    public boolean getIsAdmin() {
        return role != null && Roles.ADMIN.equals(role.getCode());
    }

    public boolean hasPermission(String permissionCode) {
        return role != null && role.hasPermission(permissionCode);
    }
}
