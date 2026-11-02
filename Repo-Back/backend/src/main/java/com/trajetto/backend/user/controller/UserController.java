package com.trajetto.backend.user.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

import io.swagger.v3.oas.annotations.Parameter;

import io.swagger.v3.oas.annotations.Operation;

import com.trajetto.backend.exception.ApiErrorCode;
import com.trajetto.backend.exception.ApiException;
import com.trajetto.backend.exception.InvalidRequestException;
import com.trajetto.backend.security.UserToken;
import com.trajetto.backend.user.dto.*;
import com.trajetto.backend.user.facade.UserFacade;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de usuário.
 * <p>
 * Nenhum método trata exceções: qualquer falha é lançada e convertida para o contrato JSON
 * padrão pelo {@code GlobalExceptionHandler}.
 */
@Tag(name = "Usuários")
@Setter
@Getter
@NoArgsConstructor
@RestController
@RequestMapping(value={"/user"})
public class UserController {

    private static final Logger logger = LogManager.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private UserFacade userFacade;

    @Operation(summary = "Lista todos os usuários",
            description = "Painel administrativo. Exige a permissão USERS_VIEW.")
    @ApiResponse(responseCode = "200", description = "Usuários cadastrados")
    @ApiResponse(responseCode = "403", description = "Sem a permissão USERS_VIEW")
    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasAuthority('USERS_VIEW')")
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getUsers() {
        return ResponseEntity.ok(userFacade.getAllUsers());
    }

    @Operation(summary = "Consulta um usuário pelo id",
            description = "Painel administrativo. Exige a permissão USERS_VIEW.")
    @ApiResponse(responseCode = "200", description = "Usuário encontrado")
    @ApiResponse(responseCode = "403", description = "Sem a permissão USERS_VIEW")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasAuthority('USERS_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@Parameter(description = "Id do usuário", example = "2") @PathVariable Long id) {
        return ResponseEntity.ok(userFacade.getUserById(id));
    }

    @Operation(summary = "Dados do usuário autenticado",
            description = "Devolve o cadastro do dono do token, com o perfil de acesso e as permissões que o aplicativo usa para decidir o que exibir.")
    @ApiResponse(responseCode = "200", description = "Usuário autenticado")
    @SecurityRequirement(name = "AuthServer")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal UserToken userToken) {
        return ResponseEntity.ok(userFacade.getUserById(requireAuthenticated(userToken).getId()));
    }

    @Operation(summary = "Atualiza o próprio perfil",
            description = "Atualização parcial: só os campos enviados são validados e alterados; os ausentes ficam como estão.")
    @ApiResponse(responseCode = "200", description = "Perfil atualizado")
    @ApiResponse(responseCode = "409", description = "O e-mail informado já pertence a outra conta")
    @SecurityRequirement(name = "AuthServer")
    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateCurrentUser(
            @AuthenticationPrincipal UserToken userToken,
            @Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        UserResponseDTO updatedUser =
                userFacade.updateUserProfile(requireAuthenticated(userToken).getId(), userUpdateDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Cria uma conta",
            description = "Cadastro público. A conta nasce com o perfil USER e um código de verificação é enviado ao e-mail; o login só é liberado depois de POST /user/verify.")
    @ApiResponse(responseCode = "201", description = "Conta criada")
    @ApiResponse(responseCode = "409", description = "Já existe uma conta com este e-mail")
    @ApiResponse(responseCode = "502", description = "Falha ao enviar o e-mail de verificação")
    @SecurityRequirements
    @PermitAll
    @PostMapping("/create")
    public ResponseEntity<List<UserResponseDTO>> createUser(@Valid @RequestBody UserDTO userDTO) {
        UserModel userModel = userFacade.fromDto(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(userFacade.createUser(userModel));
    }

    @Operation(summary = "Edita o cadastro de um usuário",
            description = "Painel administrativo. Exige a permissão USERS_MANAGE.")
    @ApiResponse(responseCode = "200", description = "Usuário atualizado")
    @ApiResponse(responseCode = "403", description = "Sem a permissão USERS_MANAGE")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasAuthority('USERS_MANAGE')")
    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@Parameter(description = "Id do usuário", example = "2") @PathVariable Long id, @RequestBody UserDTO updateModel) {
        if (updateModel == null) {
            throw new InvalidRequestException("Os dados de atualização não foram informados.");
        }

        updateModel.setId(id);
        UserModel model = userFacade.populateUserModel(updateModel);

        return ResponseEntity.ok(userFacade.populateUserResponseDTO(model));
    }

    @Operation(summary = "Remove um usuário",
            description = "Painel administrativo. Exige a permissão USERS_MANAGE.")
    @ApiResponse(responseCode = "204", description = "Usuário removido")
    @ApiResponse(responseCode = "403", description = "Sem a permissão USERS_MANAGE, ou o administrador tentou remover a si mesmo")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    @ApiResponse(responseCode = "422", description = "É o único administrador do sistema")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasAuthority('USERS_MANAGE')")
    @DeleteMapping("/{id}")
    public void deleteUser(@Parameter(description = "Id do usuário", example = "2") @PathVariable Long id) {
        userFacade.deleteUser(id);
    }

    @Operation(summary = "Entra no aplicativo",
            description = "Confere e-mail e senha e devolve o token JWT, válido para as demais chamadas no cabeçalho Authorization: Bearer.")
    @ApiResponse(responseCode = "200", description = "Login realizado")
    @ApiResponse(responseCode = "401", description = "E-mail ou senha inválidos (INVALID_CREDENTIALS)")
    @ApiResponse(responseCode = "422", description = "Conta ainda não verificada")
    @SecurityRequirements
    @PermitAll
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.login(loginRequest.email(), loginRequest.password()));
    }

    @Operation(summary = "Troca o perfil de acesso de um usuário",
            description = "Exige a permissão ROLES_ASSIGN. Aceita {\"role\": \"ADMIN\"} ou o formato antigo {\"isAdmin\": true}; sem corpo, alterna entre ADMIN e USER.")
    @ApiResponse(responseCode = "200", description = "Perfil alterado")
    @ApiResponse(responseCode = "403", description = "Sem a permissão ROLES_ASSIGN, ou o administrador tentou alterar o próprio perfil")
    @ApiResponse(responseCode = "404", description = "Usuário ou perfil não encontrado")
    @ApiResponse(responseCode = "422", description = "É o único administrador do sistema")
    @SecurityRequirement(name = "AuthServer")
    @PreAuthorize("hasAuthority('ROLES_ASSIGN')")
    @PutMapping("/{id}/role")
    public UserResponseDTO updateUserRole(@Parameter(description = "Id do usuário", example = "2") @PathVariable Long id, @RequestBody(required = false) RoleChangeRequest request) {
        return userFacade.updateUserRole(id, request != null ? request.resolveRoleCode() : null);
    }

    @Operation(summary = "Sai do aplicativo",
            description = "O token é stateless: o aplicativo o descarta, e o servidor apenas registra a saída.")
    @ApiResponse(responseCode = "200", description = "Logout registrado")
    @SecurityRequirement(name = "AuthServer")
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@AuthenticationPrincipal UserToken userToken) {
        logger.info("User {} logged out", requireAuthenticated(userToken).getId());
        return ResponseEntity.ok(new MessageResponse("Logout realizado com sucesso."));
    }

    @Operation(summary = "Confirma o e-mail com o código recebido",
            description = "Libera o login da conta criada em POST /user/create.")
    @ApiResponse(responseCode = "200", description = "E-mail verificado")
    @ApiResponse(responseCode = "400", description = "Código inválido ou expirado")
    @SecurityRequirements
    @PermitAll
    @PostMapping("/verify")
    public ResponseEntity<MessageResponse> verifyEmail(
            @Parameter(description = "E-mail cadastrado", example = "ana.silva@email.com") @RequestParam String email,
            @Parameter(description = "Código de 6 dígitos enviado ao e-mail", example = "482913") @RequestParam String code) {
        userService.verifyEmail(email, code);
        return ResponseEntity.ok(new MessageResponse("E-mail verificado com sucesso."));
    }

    @Operation(summary = "Reenvia o código de verificação",
            description = "Gera um novo código e o envia ao e-mail da conta ainda não verificada.")
    @ApiResponse(responseCode = "200", description = "Código reenviado")
    @ApiResponse(responseCode = "404", description = "Não há conta com este e-mail")
    @ApiResponse(responseCode = "409", description = "O e-mail já foi verificado")
    @SecurityRequirements
    @PermitAll
    @PostMapping("/verify/resend")
    public ResponseEntity<MessageResponse> resendVerificationCode(
            @Parameter(description = "E-mail cadastrado", example = "ana.silva@email.com") @RequestParam String email) {
        userService.resendVerificationCode(email);
        return ResponseEntity.ok(new MessageResponse("Enviamos um novo código para o seu e-mail."));
    }

//    @SecurityRequirement(name = "AuthServer")
//    @PostMapping("/me/picture")
//    public ResponseEntity<UserResponseDTO> uploadProfilePicture(
//            @RequestParam("file") MultipartFile file,
//            @AuthenticationPrincipal UserToken userId) {
//        UserResponseDTO updatedUser = userFacade.updateProfilePicture(userId.getId(), file);
//        return ResponseEntity.ok(updatedUser);
//    }

    @Operation(summary = "Verifica se um e-mail já está cadastrado",
            description = "Usado pela tela de cadastro antes de enviar o formulário. Devolve true quando o e-mail já tem conta.")
    @ApiResponse(responseCode = "200", description = "true se o e-mail já existe")
    @SecurityRequirements
    @PermitAll
    @GetMapping("/validateEmail/{email}")
    public Boolean validateEmail(@Parameter(description = "E-mail a verificar", example = "ana.silva@email.com") @PathVariable String email) {
        return userService.existsByEmail(email);
    }

//    @PermitAll
//    @GetMapping("/validateCpf/{cpf}")
//    public Boolean validateCPF(@PathVariable String cpf) {
//        return userService.existsByCPF(cpf);
//    }

    private UserToken requireAuthenticated(UserToken userToken) {
        if (userToken == null) {
            throw new ApiException(ApiErrorCode.UNAUTHENTICATED);
        }
        return userToken;
    }
}
