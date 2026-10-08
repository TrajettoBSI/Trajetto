-- =====================================================================
-- V11 - Remove o catalogo de pontos turisticos do MySQL (migrado para NoSQL)
--
-- Numeracao pula de V8 para V11: V9 e V10 ja estao em uso por outra branch
-- (teste_def, tipo_item) neste mesmo banco local, ver README.md.
--
-- O catalogo de pontos turisticos (antes nas tabelas abaixo, criadas pela
-- V8) passou a morar no MongoDB: colecao "tourist_spots", com os perfis
-- embutidos no proprio documento e indice 2dsphere para a busca por
-- proximidade, no lugar do SPATIAL INDEX sobre a coluna "location".
--
-- TouristSpotCatalogSync e TouristSpotRepository ja nao tocam mais nestas
-- tabelas; elas ficariam paradas e sem dono no banco se nao fossem
-- removidas aqui.
-- =====================================================================

DROP TABLE IF EXISTS tourist_spot_profiles;
DROP TABLE IF EXISTS tourist_spots;
