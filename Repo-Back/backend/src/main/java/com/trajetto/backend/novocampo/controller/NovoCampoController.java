package com.trajetto.backend.novocampo.controller;

import com.trajetto.backend.novocampo.model.NovoCampoModel;
import com.trajetto.backend.novocampo.repository.NovoCampoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Opções do dropdown do cadastro. Público porque a tela de cadastro é aberta antes do login.
 */
@RestController
@RequestMapping("/novo-campo")
@RequiredArgsConstructor
public class NovoCampoController {

    private final NovoCampoRepository novoCampoRepository;

    @GetMapping
    public List<NovoCampoModel> getAll() {
        return novoCampoRepository.findAll(Sort.by("id"));
    }
}
