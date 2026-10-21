package com.trajetto.backend.security;

import com.trajetto.backend.user.model.UserModel;
import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Conteúdo do token. Só identifica o usuário: o perfil vai junto apenas como informação para o
 * aplicativo, e a autorização do backend relê o perfil no banco a cada requisição.
 * <p>
 * {@code ignoreUnknown}: tokens emitidos antes da V16 trazem o campo {@code isAdmin}.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserToken implements Serializable {

    @JsonProperty("id")
    private Long id;
    @JsonProperty("name")
    private String name;
    @JsonProperty("role")
    private String role;

    public UserToken() {
        this.id=0L;
        this.name="";
    }

    public UserToken(UserModel user) {
        this.id = user.getId();
        this.name = user.getFirstName()+user.getLastName();
        this.role = user.getRoleCode();
    }

    public UserToken(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getRole() {
        return role;
    }

    public String getName() {
        return name;
    }
}

