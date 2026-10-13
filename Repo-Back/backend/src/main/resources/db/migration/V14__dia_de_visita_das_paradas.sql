-- =====================================================================
-- V14 - Roteiro de varios dias: o dia de visita de cada parada
--
-- Ate aqui todo roteiro cabia num dia so: start_date e end_date eram
-- sempre iguais, e o horario de cada parada (estimated_visit_time) bastava
-- para ordena-la. Com o usuario escolhendo a data de inicio e quantos dias
-- a viagem tem, cada parada precisa dizer em qual desses dias acontece.
--
-- order_index continua numerando as paradas do roteiro inteiro (0..n-1),
-- entao uk_places_itinerary_order (V4) e o endpoint de troca de parada,
-- que localiza a parada pelo order_index, nao mudam.
--
-- As paradas que ja existem recebem o start_date do proprio roteiro, que
-- era o unico dia que elas podiam ter.
-- =====================================================================

ALTER TABLE places
    ADD COLUMN visit_date DATE NULL;

UPDATE places p
JOIN itineraries i ON i.id = p.itinerary_id
SET p.visit_date = i.start_date
WHERE p.visit_date IS NULL;
