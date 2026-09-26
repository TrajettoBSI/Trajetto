package com.trajetto.backend.gender.controller;

import com.trajetto.backend.gender.model.GenderModel;
import com.trajetto.backend.gender.repository.GenderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Opções do dropdown de gênero. Público porque a tela de cadastro é aberta antes do login.
 */
@RestController
@RequestMapping("/genders")
@RequiredArgsConstructor
public class GenderController {

    private final GenderRepository genderRepository;

    @GetMapping
    public List<GenderModel> getAll() {
        return genderRepository.findAll(Sort.by("id"));
    }
}
