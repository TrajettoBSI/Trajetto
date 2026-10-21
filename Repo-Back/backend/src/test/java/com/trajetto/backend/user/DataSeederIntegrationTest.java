package com.trajetto.backend.user;

import com.trajetto.backend.itinerary.repository.ItineraryRepository;
import com.trajetto.backend.rating.repository.RatingRepository;
import com.trajetto.backend.role.repository.RoleRepository;
import com.trajetto.backend.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;

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

    @Test
    @DisplayName("A populacao de demonstracao grava os 18 roteiros e as 33 avaliacoes, e nao duplica ao rodar de novo")
    void populaUmaVezSo() {
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
}
