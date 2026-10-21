package com.trajetto.backend.user.facade.impl;

import com.trajetto.backend.exception.BusinessRuleException;
import com.trajetto.backend.exception.ForbiddenOperationException;
import com.trajetto.backend.exception.ResourceNotFoundException;
import com.trajetto.backend.role.model.Permissions;
import com.trajetto.backend.role.model.Roles;
import com.trajetto.backend.security.UserToken;
import com.trajetto.backend.user.dto.UserDTO;
import com.trajetto.backend.user.dto.UserResponseDTO;
import com.trajetto.backend.user.facade.UserFacade;
import com.trajetto.backend.user.dto.UserUpdateDTO;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
//import com.trajetto.backend.user.service.FirebaseStorageService;
import com.trajetto.backend.user.service.UserService;
import com.trajetto.backend.user.service.impl.DefaultUserService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@Component
public class DefaultUserFacade implements UserFacade {

    //private final FirebaseStorageService firebaseStorageService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public UserModel fromDto(UserDTO source) {
        UserModel target = new UserModel();

        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setTravelerProfile(source.getTravelerProfile());
        target.setBirthDate(source.getBirthDate());
        target.setTelephone(source.getTelephone());
        target.setCountry(source.getCountry());
        target.setEmail(source.getEmail());
        target.setPassword(source.getPassword());

        return target;
    }

    @Override
    public UserModel populateUserModel(UserDTO source) {
        UserModel target = new UserModel();

        target.setId(source.getId());
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setTravelerProfile(source.getTravelerProfile());
        target.setBirthDate(source.getBirthDate( ));
        target.setTelephone(source.getTelephone());
        target.setEmail(source.getEmail());
        target.setCountry(source.getCountry());
        target.setPassword(source.getPassword());
        //target.setProfilePictureUrl(source.getProfilePicture());

        return userService.updateUser(target);
    }

    @Override
    public UserResponseDTO populateUserResponseDTO(UserModel source) {
        if (source == null) {
            return null;
        }

        UserResponseDTO target = new UserResponseDTO();

        target.setId(source.getId());
        target.setTelephone(source.getTelephone());
        target.setFirstName(source.getFirstName());
        target.setTravelerProfile(source.getTravelerProfile());
        target.setLastName(source.getLastName());
        target.setBirthDate(source.getBirthDate());
        target.setCountry(source.getCountry());
        target.setEmail(source.getEmail());
        target.setIsAdmin(source.getIsAdmin());
        target.setRole(source.getRoleCode());
        target.setPermissions(DefaultUserService.permissionCodes(source));
        //target.setProfilePictureUrl(source.getProfilePictureUrl());

        return target;
    }

    @Override
    public void deleteUser(Long id) {
        Long loggedInUserId = getLoggedInUserId();
        if (loggedInUserId.equals(id)) {
            throw new ForbiddenOperationException("Um administrador não pode remover a si mesmo.");
        }

        UserModel userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));

        if (isLastRoleManager(userToDelete)) {
            throw new BusinessRuleException("Não é possível remover o único administrador do sistema.");
        }

        userService.deleteUser(id);
    }

    @Override
    public List<UserResponseDTO> createUser(UserModel userModel) {
//        if (checkIfUserEmailExists(userModel.getEmail())){
//            throw new Exception("User email already being used");
//        }

//        if (checkIfUserCpfExists(userModel.getCpf())){
//            throw new Exception("User cpf already being used");
//        }

        List<UserResponseDTO> response = new ArrayList<>();

        List<UserModel> model = this.userService.createUser(userModel);

        if (!CollectionUtils.isEmpty(model)){
             response.add(populateUserResponseDTO(model.getFirst()));
        }

        return response;
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        List<UserResponseDTO> responseDTOList = new ArrayList<>();

        for (UserModel model : this.userService.getAllUsers()) {
            responseDTOList.add(populateUserResponseDTO(model));
        }

        return responseDTOList;
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        UserModel user = userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));

        return populateUserResponseDTO(user);
    }

    @Override
    public UserResponseDTO updateUserProfile(Long userId, UserUpdateDTO dto) {

        UserModel user = userService.getUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", userId));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getTravelerProfile() != null) user.setTravelerProfile(dto.getTravelerProfile());
        if (dto.getTelephone() != null) user.setTelephone(dto.getTelephone());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getBirthDate() != null) user.setBirthDate(dto.getBirthDate());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());

        UserModel updated = userService.updateUser(user);

        return populateUserResponseDTO(updated);
    }

    @Override
    public UserResponseDTO updateUserRole(Long id, String roleCode) {
        Long loggedInUserId = getLoggedInUserId();
        if (loggedInUserId.equals(id)) {
            throw new ForbiddenOperationException("Um administrador não pode alterar o próprio cargo.");
        }

        UserModel userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));

        if (roleCode == null) {
            roleCode = Roles.ADMIN.equals(userToUpdate.getRoleCode()) ? Roles.USER : Roles.ADMIN;
        }

        if (roleCode.equals(userToUpdate.getRoleCode())) {
            return populateUserResponseDTO(userToUpdate);
        }

        if (isLastRoleManager(userToUpdate)) {
            throw new BusinessRuleException("Não é possível alterar o cargo do único administrador do sistema.");
        }

        return populateUserResponseDTO(userService.updateUserRole(id, roleCode));
    }

    /**
     * O sistema não pode ficar sem ninguém capaz de atribuir perfis: ninguém mais conseguiria
     * promover um administrador. A regra olha a permissão, e não o nome do perfil, para valer
     * também para perfis criados depois.
     */
    private boolean isLastRoleManager(UserModel user) {
        return user.hasPermission(Permissions.ROLES_ASSIGN)
                && userRepository.countByPermission(Permissions.ROLES_ASSIGN) <= 1;
    }

    private Long getLoggedInUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserToken) {
            return ((UserToken) principal).getId();
        }
        return -1L;
    }

//    @Override
//    public UserResponseDTO updateProfilePicture(Long userId, MultipartFile file) {
//        try {
//            List<?> rawUser = userService.getUserById(userId);
//            UserModel user;
//            if (rawUser != null && !rawUser.isEmpty()) {
//                user = (UserModel) rawUser.get(0);
//            } else if (rawUser instanceof UserModel) {
//                user = (UserModel) rawUser;
//            } else {
//                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
//            }
//
//            String imageUrl = firebaseStorageService.uploadImage(file);
//
//            user.setProfilePictureUrl(imageUrl);
//            UserModel updatedUser = userService.updateProfilePicture(user.getId(), imageUrl);
//
//            return modelMapper.map(updatedUser, UserResponseDTO.class);
//        } catch (IOException e) {
//            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao fazer upload da imagem de perfil", e);
//        }
//    }

    //private boolean checkIfUserCpfExists(String cpf) {return userService.existsByCPF(cpf);}
}