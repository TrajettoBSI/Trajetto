-- =====================================================================
-- V17 - Nome e cidade do roteiro
--
-- name: nome dado pelo usuario; nulo, o app mostra um nome generico
--       ("Roteiro Paris, dia 25/10").
-- city: slug da cidade do catalogo (data/cities.json). Nos roteiros antigos
--       fica nulo e o backend deduz a cidade pelo ponto de partida.
-- =====================================================================

ALTER TABLE itineraries
    ADD COLUMN name VARCHAR(80) NULL,
    ADD COLUMN city VARCHAR(60) NULL;
