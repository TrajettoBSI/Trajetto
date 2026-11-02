-- =====================================================================
-- V18 - Ritmo, preferencias e distancia de referencia do roteiro
--
-- pace:                 ritmo escolhido (INTENSO, EQUILIBRADO, LEVE); usado ao
--                       refazer o roteiro a partir de um pedido em texto livre.
-- preferences:          o que o viajante pediu em texto livre, ja interpretado
--                       (JSON de TripPreferences). Os pedidos se acumulam:
--                       "mais museus" e depois "sem igrejas" vale pelos dois.
-- baseline_distance_km: caminho total do roteiro na ordem gulosa, antes da
--                       melhoria 2-opt; o app mostra quanto a otimizacao poupou.
-- Roteiros antigos ficam com os tres nulos.
-- =====================================================================

ALTER TABLE itineraries
    ADD COLUMN pace VARCHAR(12) NULL,
    ADD COLUMN preferences TEXT NULL,
    ADD COLUMN baseline_distance_km DOUBLE NULL;
