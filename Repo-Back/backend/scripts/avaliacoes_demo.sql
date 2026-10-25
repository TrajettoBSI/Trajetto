-- =====================================================================
-- Avaliacoes de demonstracao dos pontos turisticos
--
-- Dados ficticios para popular a secao "Em alta" da tela inicial e a
-- tela de detalhe dos lugares. Cria 12 usuarios de demonstracao (senha:
-- senha123) e avalia os 3 pontos mais populares de cada cidade do catalogo.
-- O xid e o mesmo que o backend calcula (PlaceXid.of(nome)).
--
-- Pode rodar mais de uma vez: usuarios e avaliacoes repetidos sao ignorados.
-- As avaliacoes entram so no MySQL; o espelho do Mongo (painel do admin)
-- e gravado apenas pelas avaliacoes feitas pelo aplicativo.
--
-- Gerado a partir de data/cities/*.geojson.
-- =====================================================================

-- Usuarios de demonstracao
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Beatriz', 'Lima', 'demo.avaliacao01@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Brasil', 'CULTURAL', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao01@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Rafael', 'Mendes', 'demo.avaliacao02@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Brasil', 'AVENTUREIRO', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao02@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Camila', 'Rocha', 'demo.avaliacao03@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Portugal', 'RELAXANTE', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao03@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Thiago', 'Barros', 'demo.avaliacao04@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Brasil', 'HISTORICO', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao04@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Juliana', 'Pires', 'demo.avaliacao05@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Brasil', 'GASTRONOMICO', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao05@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Diego', 'Fernandez', 'demo.avaliacao06@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Argentina', 'SOCIAL', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao06@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Larissa', 'Cardoso', 'demo.avaliacao07@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Brasil', 'CULTURAL', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao07@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Mateus', 'Azevedo', 'demo.avaliacao08@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Portugal', 'MOCHILEIRO', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao08@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Valentina', 'Russo', 'demo.avaliacao09@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Italia', 'HISTORICO', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao09@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Gabriel', 'Nunes', 'demo.avaliacao10@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Brasil', 'AVENTUREIRO', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao10@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Helena', 'Duarte', 'demo.avaliacao11@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Brasil', 'RELAXANTE', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao11@trajetto.local');
INSERT INTO users (first_name, last_name, email, password, country, travelerProfile, is_verified, role_id)
SELECT 'Bruno', 'Carvalho', 'demo.avaliacao12@trajetto.local', '$2a$10$e21jgwdZW81SCMsghiIsuuQNpEBABKX.tuCW3XzvVwfDTH1cEIwga', 'Brasil', 'SOCIAL', 1, r.id
  FROM roles r
 WHERE r.code = 'USER' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.avaliacao12@trajetto.local');

-- Avaliacoes: INSERT IGNORE pula quem ja avaliou o lugar (uk_rating_spot_user)
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_parthenon', 5, 'Uma das melhores visitas da viagem.', '2026-10-12 17:48:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- atenas: Parthenon
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_parthenon', 5, 'Imperdivel, vale cada minuto.', '2026-02-15 11:18:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- atenas: Parthenon
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_parthenon', 4, 'Bem organizado e com uma vista linda.', '2026-06-14 13:25:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- atenas: Parthenon
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_parthenon', 5, 'Superou todas as expectativas.', '2026-07-16 18:40:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- atenas: Parthenon
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_acropolis', 5, NULL, '2026-06-12 10:54:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- atenas: Acropolis
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_acropolis', 5, 'Uma das melhores visitas da viagem.', '2026-02-20 16:57:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- atenas: Acropolis
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_acropolis', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-03-05 16:32:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- atenas: Acropolis
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_acropolis', 5, NULL, '2026-07-27 18:16:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- atenas: Acropolis
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_acropolis', 5, 'Uma das melhores visitas da viagem.', '2026-09-24 18:51:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- atenas: Acropolis
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_acropolis', 4, 'Vale a visita, so achei a fila longa.', '2026-01-30 18:56:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- atenas: Acropolis
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_acropolis', 4, 'Bem organizado e com uma vista linda.', '2026-09-02 12:30:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- atenas: Acropolis
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_plato_s_academy_archaeological_site', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-05-13 18:25:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- atenas: Plato's Academy Archaeological Site
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_plato_s_academy_archaeological_site', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-09-18 17:51:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- atenas: Plato's Academy Archaeological Site
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_bas_lica_de_la_sagrada_fam_lia', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-08-27 18:59:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- barcelona: Basílica de la Sagrada Família
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_bas_lica_de_la_sagrada_fam_lia', 4, 'Vale a visita, so achei a fila longa.', '2026-05-18 17:29:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- barcelona: Basílica de la Sagrada Família
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_bas_lica_de_la_sagrada_fam_lia', 5, 'Uma das melhores visitas da viagem.', '2026-08-15 18:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- barcelona: Basílica de la Sagrada Família
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_bas_lica_de_la_sagrada_fam_lia', 3, NULL, '2026-06-16 17:58:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- barcelona: Basílica de la Sagrada Família
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_bas_lica_de_la_sagrada_fam_lia', 3, 'Legal para conhecer uma vez.', '2026-09-25 14:28:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- barcelona: Basílica de la Sagrada Família
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_spotify_camp_nou', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-08-03 12:28:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- barcelona: Spotify Camp Nou
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_spotify_camp_nou', 4, 'Bem organizado e com uma vista linda.', '2026-10-11 11:39:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- barcelona: Spotify Camp Nou
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_spotify_camp_nou', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-01-27 18:17:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- barcelona: Spotify Camp Nou
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_spotify_camp_nou', 5, 'Superou todas as expectativas.', '2026-09-13 12:34:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- barcelona: Spotify Camp Nou
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_spotify_camp_nou', 5, 'Lugar incrivel, voltaria com certeza!', '2026-09-20 14:05:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- barcelona: Spotify Camp Nou
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_parc_g_ell', 5, NULL, '2026-07-16 10:06:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- barcelona: Parc Güell
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_parc_g_ell', 4, NULL, '2026-01-31 15:41:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- barcelona: Parc Güell
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_parc_g_ell', 4, NULL, '2026-01-18 10:32:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- barcelona: Parc Güell
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_parc_g_ell', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-08-23 15:58:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- barcelona: Parc Güell
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_parc_g_ell', 3, 'Bonito, porem muito lotado.', '2026-04-02 12:37:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- barcelona: Parc Güell
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_parc_g_ell', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-06-26 17:38:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- barcelona: Parc Güell
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_parc_g_ell', 4, 'Muito bonito, mas estava bem cheio.', '2026-10-12 16:02:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- barcelona: Parc Güell
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_teatro_col_n', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-01-15 12:41:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- buenos-aires: Teatro Colón
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_teatro_col_n', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-03-16 12:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- buenos-aires: Teatro Colón
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_teatro_col_n', 5, 'Uma das melhores visitas da viagem.', '2026-10-04 16:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- buenos-aires: Teatro Colón
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_teatro_col_n', 4, 'Vale a visita, so achei a fila longa.', '2026-06-30 12:16:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- buenos-aires: Teatro Colón
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_teatro_col_n', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-08-05 14:29:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- buenos-aires: Teatro Colón
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_teatro_col_n', 5, 'Uma das melhores visitas da viagem.', '2026-08-20 11:33:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- buenos-aires: Teatro Colón
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_teatro_col_n', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-02-22 13:14:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- buenos-aires: Teatro Colón
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_congreso_de_la_naci_n_argentina', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-04-08 10:22:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- buenos-aires: Congreso de la Nación Argentina
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_congreso_de_la_naci_n_argentina', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-10-07 13:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- buenos-aires: Congreso de la Nación Argentina
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_palacio_barolo', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-05-20 11:27:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- buenos-aires: Palacio Barolo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_palacio_barolo', 4, 'Muito bonito, mas estava bem cheio.', '2026-07-06 12:41:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- buenos-aires: Palacio Barolo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_palacio_barolo', 3, 'Bonito, porem muito lotado.', '2026-02-06 14:59:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- buenos-aires: Palacio Barolo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_palacio_barolo', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-02-06 10:26:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- buenos-aires: Palacio Barolo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_palacio_barolo', 4, 'Muito bonito, mas estava bem cheio.', '2026-02-03 11:15:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- buenos-aires: Palacio Barolo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_palacio_barolo', 3, 'Interessante, mas esperava mais.', '2026-10-19 19:59:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- buenos-aires: Palacio Barolo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_palacio_barolo', 4, 'Bem organizado e com uma vista linda.', '2026-01-24 16:20:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- buenos-aires: Palacio Barolo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_great_pyramid_of_giza', 3, 'Legal para conhecer uma vez.', '2026-05-13 16:18:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- cairo: Great Pyramid of Giza
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_great_pyramid_of_giza', 4, 'Bem organizado e com uma vista linda.', '2026-01-17 14:44:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- cairo: Great Pyramid of Giza
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_great_pyramid_of_giza', 4, 'Muito bonito, mas estava bem cheio.', '2026-06-06 16:20:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- cairo: Great Pyramid of Giza
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_giza_pyramids', 4, 'Muito bonito, mas estava bem cheio.', '2026-03-29 19:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- cairo: Giza Pyramids
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_giza_pyramids', 3, 'Legal para conhecer uma vez.', '2026-07-05 19:41:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- cairo: Giza Pyramids
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_the_great_sphinx', 3, 'Bonito, porem muito lotado.', '2026-05-07 16:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- cairo: The Great Sphinx
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_the_great_sphinx', 3, 'Interessante, mas esperava mais.', '2026-10-09 10:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- cairo: The Great Sphinx
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_the_great_sphinx', 4, 'Bem organizado e com uma vista linda.', '2026-05-15 12:14:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- cairo: The Great Sphinx
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_the_great_sphinx', 2, 'Fila enorme e pouca coisa para ver.', '2026-08-06 14:20:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- cairo: The Great Sphinx
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_castle_of_good_hope', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-06-16 10:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- cidade-do-cabo: Castle of Good Hope
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_castle_of_good_hope', 4, 'Vale a visita, so achei a fila longa.', '2026-09-02 10:14:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- cidade-do-cabo: Castle of Good Hope
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_castle_of_good_hope', 5, NULL, '2026-07-28 15:50:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- cidade-do-cabo: Castle of Good Hope
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_castle_of_good_hope', 5, 'Superou todas as expectativas.', '2026-06-29 13:23:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- cidade-do-cabo: Castle of Good Hope
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_castle_of_good_hope', 5, 'Uma das melhores visitas da viagem.', '2026-10-12 17:57:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- cidade-do-cabo: Castle of Good Hope
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_castle_of_good_hope', 5, 'Lugar incrivel, voltaria com certeza!', '2026-08-03 12:31:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- cidade-do-cabo: Castle of Good Hope
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_castle_of_good_hope', 4, NULL, '2026-09-29 16:50:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- cidade-do-cabo: Castle of Good Hope
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_national_council_of_provinces', 4, NULL, '2026-01-14 18:13:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- cidade-do-cabo: National Council of Provinces
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_national_council_of_provinces', 5, 'Imperdivel, vale cada minuto.', '2026-07-25 16:34:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- cidade-do-cabo: National Council of Provinces
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_national_council_of_provinces', 5, NULL, '2026-03-26 18:06:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- cidade-do-cabo: National Council of Provinces
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_national_council_of_provinces', 4, 'Bem organizado e com uma vista linda.', '2026-06-24 18:16:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- cidade-do-cabo: National Council of Provinces
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_national_council_of_provinces', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-04-12 12:57:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- cidade-do-cabo: National Council of Provinces
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_national_council_of_provinces', 5, 'Superou todas as expectativas.', '2026-07-06 12:24:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- cidade-do-cabo: National Council of Provinces
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_national_council_of_provinces', 5, NULL, '2026-01-09 19:41:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- cidade-do-cabo: National Council of Provinces
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_lion_s_head', 4, 'Vale a visita, so achei a fila longa.', '2026-03-29 10:56:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- cidade-do-cabo: Lion's Head
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_lion_s_head', 3, 'Legal para conhecer uma vez.', '2026-01-06 15:04:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- cidade-do-cabo: Lion's Head
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_lion_s_head', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-03-24 19:39:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- cidade-do-cabo: Lion's Head
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_lion_s_head', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-09-10 11:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- cidade-do-cabo: Lion's Head
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_lion_s_head', 3, 'Legal para conhecer uma vez.', '2026-06-08 20:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- cidade-do-cabo: Lion's Head
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_las_cuevitas', 4, 'Bem organizado e com uma vista linda.', '2026-06-30 11:04:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- cidade-do-mexico: Las Cuevitas
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_las_cuevitas', 3, NULL, '2026-06-13 14:48:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- cidade-do-mexico: Las Cuevitas
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_las_cuevitas', 4, 'Bem organizado e com uma vista linda.', '2026-09-21 18:21:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- cidade-do-mexico: Las Cuevitas
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_las_cuevitas', 4, NULL, '2026-09-14 16:20:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- cidade-do-mexico: Las Cuevitas
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_las_cuevitas', 4, 'Bem organizado e com uma vista linda.', '2026-04-27 15:48:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- cidade-do-mexico: Las Cuevitas
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_catedral_metropolitana_de_la_ciudad_de_m_xico', 5, 'Lugar incrivel, voltaria com certeza!', '2026-08-13 14:21:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- cidade-do-mexico: Catedral Metropolitana de la Ciudad de México
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_catedral_metropolitana_de_la_ciudad_de_m_xico', 3, 'Bonito, porem muito lotado.', '2026-05-19 12:34:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- cidade-do-mexico: Catedral Metropolitana de la Ciudad de México
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_catedral_metropolitana_de_la_ciudad_de_m_xico', 4, 'Vale a visita, so achei a fila longa.', '2026-10-19 11:17:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- cidade-do-mexico: Catedral Metropolitana de la Ciudad de México
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_catedral_metropolitana_de_la_ciudad_de_m_xico', 4, 'Bem organizado e com uma vista linda.', '2026-07-28 10:35:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- cidade-do-mexico: Catedral Metropolitana de la Ciudad de México
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_catedral_metropolitana_de_la_ciudad_de_m_xico', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-02-22 20:49:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- cidade-do-mexico: Catedral Metropolitana de la Ciudad de México
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_estadio_banorte', 4, 'Bem organizado e com uma vista linda.', '2026-04-03 10:17:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- cidade-do-mexico: Estadio Banorte
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_estadio_banorte', 5, 'Lugar incrivel, voltaria com certeza!', '2026-06-25 19:41:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- cidade-do-mexico: Estadio Banorte
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_estadio_banorte', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-09-05 17:21:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- cidade-do-mexico: Estadio Banorte
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_estadio_banorte', 3, 'Interessante, mas esperava mais.', '2026-03-07 20:54:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- cidade-do-mexico: Estadio Banorte
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_estadio_banorte', 4, 'Vale a visita, so achei a fila longa.', '2026-08-27 18:17:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- cidade-do-mexico: Estadio Banorte
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_estadio_banorte', 5, 'Imperdivel, vale cada minuto.', '2026-10-16 13:34:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- cidade-do-mexico: Estadio Banorte
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_estadio_banorte', 3, NULL, '2026-03-25 15:14:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- cidade-do-mexico: Estadio Banorte
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_jardim_bot_nico_de_curitiba', 4, 'Bem organizado e com uma vista linda.', '2026-09-29 20:37:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- curitiba: Jardim Botânico de Curitiba
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_jardim_bot_nico_de_curitiba', 5, 'Imperdivel, vale cada minuto.', '2026-05-23 16:02:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- curitiba: Jardim Botânico de Curitiba
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_jardim_bot_nico_de_curitiba', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-05-03 17:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- curitiba: Jardim Botânico de Curitiba
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_museu_oscar_niemeyer', 3, 'Bonito, porem muito lotado.', '2026-05-13 10:41:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- curitiba: Museu Oscar Niemeyer
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_museu_oscar_niemeyer', 3, 'Bonito, porem muito lotado.', '2026-07-11 14:53:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- curitiba: Museu Oscar Niemeyer
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_museu_oscar_niemeyer', 3, 'Bonito, porem muito lotado.', '2026-09-24 16:19:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- curitiba: Museu Oscar Niemeyer
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_museu_oscar_niemeyer', 3, 'Bonito, porem muito lotado.', '2026-02-07 20:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- curitiba: Museu Oscar Niemeyer
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm__pera_de_arame', 4, 'Muito bonito, mas estava bem cheio.', '2026-10-19 12:48:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- curitiba: Ópera de Arame
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm__pera_de_arame', 4, NULL, '2026-10-02 18:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- curitiba: Ópera de Arame
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm__pera_de_arame', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-04-24 10:29:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- curitiba: Ópera de Arame
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm__pera_de_arame', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-10-01 12:32:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- curitiba: Ópera de Arame
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm__pera_de_arame', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-09-12 12:35:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- curitiba: Ópera de Arame
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm__pera_de_arame', 4, 'Bem organizado e com uma vista linda.', '2026-10-04 19:46:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- curitiba: Ópera de Arame
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm__pera_de_arame', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-10-14 12:46:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- curitiba: Ópera de Arame
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_burj_khalifa', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-04-06 12:17:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- dubai: Burj Khalifa
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_burj_khalifa', 5, 'Lugar incrivel, voltaria com certeza!', '2026-08-27 12:11:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- dubai: Burj Khalifa
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_burj_khalifa', 4, 'Vale a visita, so achei a fila longa.', '2026-08-04 20:39:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- dubai: Burj Khalifa
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_the_dubai_mall', 3, 'Legal para conhecer uma vez.', '2026-08-01 12:57:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- dubai: The Dubai Mall
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_the_dubai_mall', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-01-25 17:00:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- dubai: The Dubai Mall
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_the_dubai_mall', 3, 'Legal para conhecer uma vez.', '2026-05-16 15:48:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- dubai: The Dubai Mall
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_the_dubai_mall', 3, 'Interessante, mas esperava mais.', '2026-02-20 16:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- dubai: The Dubai Mall
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_the_dubai_mall', 4, 'Vale a visita, so achei a fila longa.', '2026-05-08 13:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- dubai: The Dubai Mall
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_the_dubai_mall', 4, 'Vale a visita, so achei a fila longa.', '2026-10-06 16:46:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- dubai: The Dubai Mall
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_ski_dubai', 3, NULL, '2026-04-23 13:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- dubai: Ski Dubai
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_ski_dubai', 3, 'Legal para conhecer uma vez.', '2026-03-26 11:11:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- dubai: Ski Dubai
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_ski_dubai', 4, 'Vale a visita, so achei a fila longa.', '2026-08-12 10:35:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- dubai: Ski Dubai
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_ski_dubai', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-06-01 15:25:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- dubai: Ski Dubai
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_ski_dubai', 3, 'Bonito, porem muito lotado.', '2026-05-24 15:31:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- dubai: Ski Dubai
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_galleria_degli_uffizi', 5, NULL, '2026-08-26 16:38:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- florenca: Galleria degli Uffizi
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_galleria_degli_uffizi', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-10-18 15:48:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- florenca: Galleria degli Uffizi
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_cattedrale_di_santa_maria_del_fiore', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-01-26 11:33:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- florenca: Cattedrale di Santa Maria del Fiore
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_cattedrale_di_santa_maria_del_fiore', 4, 'Bem organizado e com uma vista linda.', '2026-08-26 19:30:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- florenca: Cattedrale di Santa Maria del Fiore
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_cattedrale_di_santa_maria_del_fiore', 5, 'Superou todas as expectativas.', '2026-03-14 10:06:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- florenca: Cattedrale di Santa Maria del Fiore
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_cattedrale_di_santa_maria_del_fiore', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-05-15 10:02:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- florenca: Cattedrale di Santa Maria del Fiore
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_cattedrale_di_santa_maria_del_fiore', 3, 'Legal para conhecer uma vez.', '2026-03-07 15:45:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- florenca: Cattedrale di Santa Maria del Fiore
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_cattedrale_di_santa_maria_del_fiore', 4, 'Bem organizado e com uma vista linda.', '2026-05-08 15:45:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- florenca: Cattedrale di Santa Maria del Fiore
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_cattedrale_di_santa_maria_del_fiore', 4, 'Bem organizado e com uma vista linda.', '2026-05-07 18:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- florenca: Cattedrale di Santa Maria del Fiore
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_ponte_vecchio', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-09-05 19:24:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- florenca: Ponte Vecchio
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_ponte_vecchio', 4, 'Bem organizado e com uma vista linda.', '2026-04-26 16:46:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- florenca: Ponte Vecchio
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_ponte_vecchio', 3, 'Interessante, mas esperava mais.', '2026-06-04 13:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- florenca: Ponte Vecchio
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_ponte_vecchio', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-08-14 19:01:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- florenca: Ponte Vecchio
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_ponte_vecchio', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-03-31 18:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- florenca: Ponte Vecchio
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_hagia_sophia', 4, 'Muito bonito, mas estava bem cheio.', '2026-02-28 16:25:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- istambul: Hagia Sophia
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_hagia_sophia', 3, 'Interessante, mas esperava mais.', '2026-05-19 12:33:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- istambul: Hagia Sophia
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_hagia_sophia', 4, NULL, '2026-02-17 14:10:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- istambul: Hagia Sophia
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_hagia_sophia', 3, 'Legal para conhecer uma vez.', '2026-10-19 11:57:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- istambul: Hagia Sophia
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_blue_mosque', 4, 'Bem organizado e com uma vista linda.', '2026-01-29 14:05:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- istambul: Blue Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_blue_mosque', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-04-19 10:18:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- istambul: Blue Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_blue_mosque', 5, 'Uma das melhores visitas da viagem.', '2026-05-17 11:56:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- istambul: Blue Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_blue_mosque', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-09-26 19:34:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- istambul: Blue Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_blue_mosque', 4, 'Muito bonito, mas estava bem cheio.', '2026-10-09 15:14:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- istambul: Blue Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_blue_mosque', 5, 'Imperdivel, vale cada minuto.', '2026-05-09 10:00:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- istambul: Blue Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_topkapi_palace', 4, 'Vale a visita, so achei a fila longa.', '2026-09-20 15:25:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- istambul: Topkapi Palace
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_topkapi_palace', 4, NULL, '2026-04-01 17:05:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- istambul: Topkapi Palace
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_topkapi_palace', 3, 'Legal para conhecer uma vez.', '2026-03-12 19:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- istambul: Topkapi Palace
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_topkapi_palace', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-09-04 12:43:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- istambul: Topkapi Palace
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_topkapi_palace', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-03-05 12:00:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- istambul: Topkapi Palace
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_kiyomizu_dera', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-09-24 15:05:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- kyoto: Kiyomizu-dera
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_kiyomizu_dera', 5, 'Superou todas as expectativas.', '2026-05-06 11:24:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- kyoto: Kiyomizu-dera
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_kinkaku_ji', 5, 'Imperdivel, vale cada minuto.', '2026-01-19 15:58:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- kyoto: Kinkaku-ji
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_kinkaku_ji', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-02-23 13:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- kyoto: Kinkaku-ji
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_kinkaku_ji', 5, 'Lugar incrivel, voltaria com certeza!', '2026-09-19 20:30:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- kyoto: Kinkaku-ji
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_kinkaku_ji', 4, 'Muito bonito, mas estava bem cheio.', '2026-10-02 14:09:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- kyoto: Kinkaku-ji
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_mt__hiei', 4, 'Muito bonito, mas estava bem cheio.', '2026-08-20 19:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- kyoto: Mt. Hiei
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_mt__hiei', 3, 'Bonito, porem muito lotado.', '2026-08-20 11:54:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- kyoto: Mt. Hiei
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_mt__hiei', 4, NULL, '2026-08-17 17:46:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- kyoto: Mt. Hiei
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_mt__hiei', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-08-03 17:18:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- kyoto: Mt. Hiei
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_torre_de_bel_m', 3, 'Legal para conhecer uma vez.', '2026-06-04 16:14:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- lisboa: Torre de Belém
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_torre_de_bel_m', 4, 'Muito bonito, mas estava bem cheio.', '2026-05-02 16:08:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- lisboa: Torre de Belém
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_torre_de_bel_m', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-07-26 13:39:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- lisboa: Torre de Belém
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_mosteiro_dos_jer_nimos', 4, NULL, '2026-08-24 13:11:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- lisboa: Mosteiro dos Jerónimos
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_mosteiro_dos_jer_nimos', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-04-15 14:10:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- lisboa: Mosteiro dos Jerónimos
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_mosteiro_dos_jer_nimos', 4, 'Vale a visita, so achei a fila longa.', '2026-08-20 16:40:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- lisboa: Mosteiro dos Jerónimos
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_mosteiro_dos_jer_nimos', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-06-11 10:51:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- lisboa: Mosteiro dos Jerónimos
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_ponte_25_de_abril', 5, NULL, '2026-09-23 14:51:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- lisboa: Ponte 25 de Abril
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_ponte_25_de_abril', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-07-03 16:33:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- lisboa: Ponte 25 de Abril
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_ponte_25_de_abril', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-08-12 16:39:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- lisboa: Ponte 25 de Abril
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_ponte_25_de_abril', 4, NULL, '2026-05-09 18:37:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- lisboa: Ponte 25 de Abril
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_ponte_25_de_abril', 4, 'Muito bonito, mas estava bem cheio.', '2026-02-28 13:13:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- lisboa: Ponte 25 de Abril
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_ponte_25_de_abril', 4, 'Bem organizado e com uma vista linda.', '2026-09-04 12:27:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- lisboa: Ponte 25 de Abril
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_british_museum', 3, NULL, '2026-03-05 13:25:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- londres: British Museum
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_british_museum', 3, 'Bonito, porem muito lotado.', '2026-09-26 20:06:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- londres: British Museum
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_british_museum', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-01-06 11:56:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- londres: British Museum
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_buckingham_palace', 4, 'Vale a visita, so achei a fila longa.', '2026-10-15 17:21:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- londres: Buckingham Palace
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_buckingham_palace', 5, 'Imperdivel, vale cada minuto.', '2026-07-01 13:09:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- londres: Buckingham Palace
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_buckingham_palace', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-02-24 18:50:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- londres: Buckingham Palace
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_buckingham_palace', 5, 'Lugar incrivel, voltaria com certeza!', '2026-02-20 10:43:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- londres: Buckingham Palace
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_westminster_abbey', 4, 'Muito bonito, mas estava bem cheio.', '2026-01-29 16:11:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- londres: Westminster Abbey
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_westminster_abbey', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-10-11 18:15:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- londres: Westminster Abbey
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_westminster_abbey', 4, 'Vale a visita, so achei a fila longa.', '2026-01-10 12:38:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- londres: Westminster Abbey
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_westminster_abbey', 5, 'Superou todas as expectativas.', '2026-08-15 11:44:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- londres: Westminster Abbey
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_westminster_abbey', 4, 'Muito bonito, mas estava bem cheio.', '2026-08-03 20:05:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- londres: Westminster Abbey
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_koutoubia_mosque', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-08-07 14:02:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- marrakech: Koutoubia Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_koutoubia_mosque', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-08-28 14:26:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- marrakech: Koutoubia Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_koutoubia_mosque', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-08-19 12:22:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- marrakech: Koutoubia Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_koutoubia_mosque', 5, 'Superou todas as expectativas.', '2026-06-13 11:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- marrakech: Koutoubia Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_koutoubia_mosque', 5, 'Lugar incrivel, voltaria com certeza!', '2026-06-26 15:46:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- marrakech: Koutoubia Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_koutoubia_mosque', 3, 'Bonito, porem muito lotado.', '2026-08-10 19:29:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- marrakech: Koutoubia Mosque
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_jemaa_el_fna', 5, 'Uma das melhores visitas da viagem.', '2026-07-07 10:48:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- marrakech: Jemaa El-Fna
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_jemaa_el_fna', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-05-13 17:00:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- marrakech: Jemaa El-Fna
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_jemaa_el_fna', 4, 'Muito bonito, mas estava bem cheio.', '2026-01-16 14:34:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- marrakech: Jemaa El-Fna
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_jemaa_el_fna', 5, 'Imperdivel, vale cada minuto.', '2026-06-23 16:16:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- marrakech: Jemaa El-Fna
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_jemaa_el_fna', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-01-06 13:13:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- marrakech: Jemaa El-Fna
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_majorelle_garden', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-10-08 17:06:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- marrakech: Majorelle Garden
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_majorelle_garden', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-02-01 14:08:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- marrakech: Majorelle Garden
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_statue_of_liberty', 5, NULL, '2026-07-22 10:08:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- nova-york: Statue of Liberty
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_statue_of_liberty', 5, NULL, '2026-10-19 10:48:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- nova-york: Statue of Liberty
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_statue_of_liberty', 5, 'Superou todas as expectativas.', '2026-10-17 20:53:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- nova-york: Statue of Liberty
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_statue_of_liberty', 5, 'Imperdivel, vale cada minuto.', '2026-08-05 14:09:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- nova-york: Statue of Liberty
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_statue_of_liberty', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-03-30 19:25:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- nova-york: Statue of Liberty
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_empire_state_building', 4, 'Bem organizado e com uma vista linda.', '2026-08-18 20:40:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- nova-york: Empire State Building
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_empire_state_building', 3, 'Bonito, porem muito lotado.', '2026-02-22 12:27:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- nova-york: Empire State Building
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_the_metropolitan_museum_of_art', 5, 'Chegue cedo para evitar fila, mas vale muito a pena.', '2026-06-05 10:56:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- nova-york: The Metropolitan Museum of Art
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_the_metropolitan_museum_of_art', 4, 'Bem organizado e com uma vista linda.', '2026-02-13 15:25:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- nova-york: The Metropolitan Museum of Art
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_the_metropolitan_museum_of_art', 4, NULL, '2026-01-10 15:36:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- nova-york: The Metropolitan Museum of Art
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_the_metropolitan_museum_of_art', 4, 'Vale a visita, so achei a fila longa.', '2026-04-14 15:16:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- nova-york: The Metropolitan Museum of Art
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_tour_eiffel', 4, 'Bem organizado e com uma vista linda.', '2026-10-17 15:50:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- paris: Tour Eiffel
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_tour_eiffel', 5, 'Lugar incrivel, voltaria com certeza!', '2026-10-14 14:43:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- paris: Tour Eiffel
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_tour_eiffel', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-09-03 15:12:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- paris: Tour Eiffel
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_tour_eiffel', 5, 'Superou todas as expectativas.', '2026-09-04 11:58:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- paris: Tour Eiffel
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_mus_e_du_louvre', 3, NULL, '2026-04-30 14:30:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- paris: Musée du Louvre
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_mus_e_du_louvre', 2, NULL, '2026-03-23 14:29:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- paris: Musée du Louvre
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_mus_e_du_louvre', 3, NULL, '2026-02-26 13:19:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- paris: Musée du Louvre
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_mus_e_du_louvre', 2, 'Fila enorme e pouca coisa para ver.', '2026-02-10 17:20:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- paris: Musée du Louvre
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_mus_e_du_louvre', 3, 'Legal para conhecer uma vez.', '2026-01-29 11:18:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- paris: Musée du Louvre
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_mus_e_du_louvre', 3, 'Interessante, mas esperava mais.', '2026-04-18 18:00:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- paris: Musée du Louvre
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_cath_drale_notre_dame_de_paris', 5, 'Lindo demais, as fotos nao fazem jus.', '2026-08-03 20:21:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- paris: Cathédrale Notre-Dame de Paris
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_cath_drale_notre_dame_de_paris', 5, 'Lugar incrivel, voltaria com certeza!', '2026-01-26 15:53:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- paris: Cathédrale Notre-Dame de Paris
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_cath_drale_notre_dame_de_paris', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-09-12 16:03:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- paris: Cathédrale Notre-Dame de Paris
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_cath_drale_notre_dame_de_paris', 5, NULL, '2026-04-18 18:16:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- paris: Cathédrale Notre-Dame de Paris
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_cristo_redentor', 3, 'Legal para conhecer uma vez.', '2026-01-31 20:38:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- rio-de-janeiro: Cristo Redentor
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_cristo_redentor', 3, 'Legal para conhecer uma vez.', '2026-09-04 16:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- rio-de-janeiro: Cristo Redentor
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_cristo_redentor', 4, NULL, '2026-05-20 11:15:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- rio-de-janeiro: Cristo Redentor
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_cristo_redentor', 4, 'Vale a visita, so achei a fila longa.', '2026-05-27 13:29:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- rio-de-janeiro: Cristo Redentor
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_cristo_redentor', 3, 'Legal para conhecer uma vez.', '2026-10-02 17:22:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- rio-de-janeiro: Cristo Redentor
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_cristo_redentor', 4, 'Vale a visita, so achei a fila longa.', '2026-04-16 19:19:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- rio-de-janeiro: Cristo Redentor
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_cristo_redentor', 4, 'Bem organizado e com uma vista linda.', '2026-05-31 16:52:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- rio-de-janeiro: Cristo Redentor
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_p_o_de_a__car', 4, NULL, '2026-10-10 19:36:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- rio-de-janeiro: Pão de Açúcar
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_p_o_de_a__car', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-05-07 15:35:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- rio-de-janeiro: Pão de Açúcar
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_p_o_de_a__car', 3, NULL, '2026-05-22 12:05:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- rio-de-janeiro: Pão de Açúcar
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_p_o_de_a__car', 4, 'Vale a visita, so achei a fila longa.', '2026-06-12 19:26:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- rio-de-janeiro: Pão de Açúcar
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_p_o_de_a__car', 4, NULL, '2026-01-26 14:54:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- rio-de-janeiro: Pão de Açúcar
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_p_o_de_a__car', 4, 'Muito bonito, mas estava bem cheio.', '2026-05-26 17:21:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- rio-de-janeiro: Pão de Açúcar
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_corcovado', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-08-07 11:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- rio-de-janeiro: Corcovado
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_corcovado', 3, 'Interessante, mas esperava mais.', '2026-09-29 12:15:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- rio-de-janeiro: Corcovado
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_colosseo', 4, NULL, '2026-10-21 14:49:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- roma: Colosseo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_colosseo', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-02-12 18:08:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- roma: Colosseo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_colosseo', 4, NULL, '2026-07-27 10:11:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- roma: Colosseo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_colosseo', 4, NULL, '2026-07-13 16:48:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- roma: Colosseo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_colosseo', 5, 'Experiencia inesquecivel, recomendo muito.', '2026-10-18 10:04:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- roma: Colosseo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_colosseo', 3, NULL, '2026-01-26 20:20:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- roma: Colosseo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_basilica_di_san_pietro', 2, 'Achei caro pelo que oferece.', '2026-08-20 10:12:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- roma: Basilica di San Pietro
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_basilica_di_san_pietro', 4, 'Vale a visita, so achei a fila longa.', '2026-04-27 10:23:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- roma: Basilica di San Pietro
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_basilica_di_san_pietro', 3, 'Interessante, mas esperava mais.', '2026-06-13 18:32:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- roma: Basilica di San Pietro
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_cappella_sistina', 3, NULL, '2026-06-10 16:15:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- roma: Cappella Sistina
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_cappella_sistina', 4, 'Muito bonito, mas estava bem cheio.', '2026-04-10 10:15:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- roma: Cappella Sistina
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Rafael Mendes', 'osm_cappella_sistina', 5, 'Imperdivel, vale cada minuto.', '2026-01-30 14:00:00'
  FROM users u WHERE u.email = 'demo.avaliacao02@trajetto.local';  -- roma: Cappella Sistina
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_cappella_sistina', 4, 'Muito bonito, mas estava bem cheio.', '2026-06-12 12:24:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- roma: Cappella Sistina
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_cappella_sistina', 4, 'Muito bonito, mas estava bem cheio.', '2026-08-13 17:06:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- roma: Cappella Sistina
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_santos_fc_business_center', 3, NULL, '2026-03-16 16:28:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- sao-paulo: Santos FC Business Center
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_santos_fc_business_center', 3, 'Interessante, mas esperava mais.', '2026-03-22 19:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- sao-paulo: Santos FC Business Center
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_santos_fc_business_center', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-09-17 19:46:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- sao-paulo: Santos FC Business Center
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Beatriz Lima', 'osm_santos_fc_business_center', 4, 'Gostei bastante, mas o ingresso e um pouco caro.', '2026-04-01 13:38:00'
  FROM users u WHERE u.email = 'demo.avaliacao01@trajetto.local';  -- sao-paulo: Santos FC Business Center
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_mirante_do_vale', 4, 'Vale a visita, so achei a fila longa.', '2026-09-11 20:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- sao-paulo: Mirante do Vale
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Thiago Barros', 'osm_mirante_do_vale', 3, 'Interessante, mas esperava mais.', '2026-07-12 18:55:00'
  FROM users u WHERE u.email = 'demo.avaliacao04@trajetto.local';  -- sao-paulo: Mirante do Vale
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Gabriel Nunes', 'osm_museu_de_arte_de_s_o_paulo', 4, NULL, '2026-09-12 10:42:00'
  FROM users u WHERE u.email = 'demo.avaliacao10@trajetto.local';  -- sao-paulo: Museu de Arte de São Paulo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_museu_de_arte_de_s_o_paulo', 5, 'Superou todas as expectativas.', '2026-06-14 14:34:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- sao-paulo: Museu de Arte de São Paulo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Helena Duarte', 'osm_museu_de_arte_de_s_o_paulo', 5, 'Uma das melhores visitas da viagem.', '2026-05-02 15:06:00'
  FROM users u WHERE u.email = 'demo.avaliacao11@trajetto.local';  -- sao-paulo: Museu de Arte de São Paulo
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Larissa Cardoso', 'osm_tokyo_skytree', 4, 'Muito bonito, mas estava bem cheio.', '2026-03-16 14:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao07@trajetto.local';  -- toquio: Tokyo Skytree
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_tokyo_skytree', 4, NULL, '2026-03-28 16:16:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- toquio: Tokyo Skytree
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_tokyo_skytree', 4, NULL, '2026-08-01 16:51:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- toquio: Tokyo Skytree
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Diego Fernandez', 'osm_tokyo_skytree', 4, 'Vale a visita, so achei a fila longa.', '2026-01-17 20:54:00'
  FROM users u WHERE u.email = 'demo.avaliacao06@trajetto.local';  -- toquio: Tokyo Skytree
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Mateus Azevedo', 'osm_tokyo_skytree', 5, 'Lugar incrivel, voltaria com certeza!', '2026-01-12 18:46:00'
  FROM users u WHERE u.email = 'demo.avaliacao08@trajetto.local';  -- toquio: Tokyo Skytree
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_tokyo_tower', 3, 'Bonito, porem muito lotado.', '2026-03-15 16:10:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- toquio: Tokyo Tower
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Juliana Pires', 'osm_tokyo_tower', 4, 'Bem organizado e com uma vista linda.', '2026-01-17 20:51:00'
  FROM users u WHERE u.email = 'demo.avaliacao05@trajetto.local';  -- toquio: Tokyo Tower
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Camila Rocha', 'osm_tokyo_tower', 4, 'Otimo lugar, reserve pelo menos duas horas.', '2026-01-27 16:03:00'
  FROM users u WHERE u.email = 'demo.avaliacao03@trajetto.local';  -- toquio: Tokyo Tower
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Valentina Russo', 'osm_tokyo_national_museum', 4, 'Bem organizado e com uma vista linda.', '2026-01-10 14:07:00'
  FROM users u WHERE u.email = 'demo.avaliacao09@trajetto.local';  -- toquio: Tokyo National Museum
INSERT IGNORE INTO RatingModel (userId, user_name, touristSpotXid, rating, comment, createdAt)
SELECT u.code, 'Bruno Carvalho', 'osm_tokyo_national_museum', 3, 'Legal para conhecer uma vez.', '2026-02-01 11:14:00'
  FROM users u WHERE u.email = 'demo.avaliacao12@trajetto.local';  -- toquio: Tokyo National Museum
