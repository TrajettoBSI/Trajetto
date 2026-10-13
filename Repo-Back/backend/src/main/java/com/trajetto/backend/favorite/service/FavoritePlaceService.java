package com.trajetto.backend.favorite.service;

import com.trajetto.backend.exception.ResourceNotFoundException;
import com.trajetto.backend.favorite.dto.FavoritePlaceRequestDTO;
import com.trajetto.backend.favorite.dto.FavoritePlaceResponseDTO;
import com.trajetto.backend.favorite.model.FavoritePlaceModel;
import com.trajetto.backend.favorite.repository.FavoritePlaceRepository;
import com.trajetto.backend.itinerary.data.PlaceXid;
import com.trajetto.backend.user.model.UserModel;
import com.trajetto.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoritePlaceService {

    private final FavoritePlaceRepository favoritePlaceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FavoritePlaceResponseDTO> list(Long userId) {
        return favoritePlaceRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(FavoritePlaceResponseDTO::from)
                .toList();
    }

    @Transactional
    public FavoritePlaceResponseDTO mark(Long userId, FavoritePlaceRequestDTO req) {
        String xid = PlaceXid.of(req.getName().trim());
        return favoritePlaceRepository.findByUserIdAndXid(userId, xid)
                .map(FavoritePlaceResponseDTO::from)
                .orElseGet(() -> FavoritePlaceResponseDTO.from(create(userId, xid, req)));
    }

    @Transactional
    public void unmark(Long userId, String xid) {
        favoritePlaceRepository.findByUserIdAndXid(userId, xid)
                .ifPresent(favoritePlaceRepository::delete);
    }

    private FavoritePlaceModel create(Long userId, String xid, FavoritePlaceRequestDTO req) {
        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", userId));

        FavoritePlaceModel favorite = new FavoritePlaceModel();
        favorite.setUser(user);
        favorite.setXid(xid);
        favorite.setName(req.getName().trim());
        favorite.setAddress(blankToNull(req.getAddress()));
        favorite.setCategory(blankToNull(req.getCategory()));
        favorite.setLatitude(req.getLatitude());
        favorite.setLongitude(req.getLongitude());
        favorite.setCreatedAt(LocalDateTime.now());
        return favoritePlaceRepository.save(favorite);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
