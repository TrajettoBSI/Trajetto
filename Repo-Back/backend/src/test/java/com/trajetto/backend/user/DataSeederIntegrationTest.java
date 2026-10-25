package com.trajetto.backend.user;

import com.trajetto.backend.itinerary.data.CityCatalog;
import com.trajetto.backend.itinerary.data.PlaceXid;
import com.trajetto.backend.itinerary.repository.ItineraryRepository;
import com.trajetto.backend.rating.model.RatingModel;
import com.trajetto.backend.rating.repository.RatingRepository;
import com.trajetto.backend.role.repository.RoleRepository;
import com.trajetto.backend.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class DataSeederIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CityCatalog cityCatalog;

    @Test
    @DisplayName("A populacao de demonstracao grava os 18 roteiros e as 33 avaliacoes, e nao duplica ao rodar de novo")
    void populaUmaVezSo() {
        // O seeder so popula banco sem roteiro; a transacao do teste devolve os apagados no fim.
        itineraryRepository.deleteAll();
        DataSeeder seeder = new DataSeeder(userRepository, roleRepository, itineraryRepository, ratingRepository, passwordEncoder);
        long usuariosAntes = userRepository.count();
        long avaliacoesAntes = ratingRepository.count();

        seeder.run();
        long usuariosDepois = userRepository.count();

        assertEquals(18, itineraryRepository.count());
        assertEquals(33, ratingRepository.count() - avaliacoesAntes);
        assertEquals(10, usuariosDepois - usuariosAntes);

        seeder.run();
        assertEquals(18, itineraryRepository.count());
        assertEquals(usuariosDepois, userRepository.count());
    }

    @Test
    @DisplayName("As avaliacoes de demonstracao apontam para lugares do catalogo, com o nome de quem avaliou")
    void avaliacoesDoCatalogo() {
        itineraryRepository.deleteAll();
        long avaliacoesAntes = ratingRepository.count();
        new DataSeeder(userRepository, roleRepository, itineraryRepository, ratingRepository, passwordEncoder).run();

        Set<String> catalogo = cityCatalog.getPlaces().stream().map(p -> PlaceXid.of(p.name())).collect(Collectors.toSet());
        var seed = ratingRepository.findAll().stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .limit(ratingRepository.count() - avaliacoesAntes)
                .toList();
        assertEquals(33, seed.size());
        for (RatingModel rating : seed) {
            assertTrue(catalogo.contains(rating.getTouristSpotXid()), rating.getTouristSpotXid() + " nao esta no catalogo");
            assertTrue(rating.getUserName() != null && !rating.getUserName().isBlank());
        }
    }
}
