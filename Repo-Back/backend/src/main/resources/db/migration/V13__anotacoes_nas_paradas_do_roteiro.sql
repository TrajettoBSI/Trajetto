-- =====================================================================
-- V13 - Anotacoes pessoais nas paradas do roteiro (OB05.3, RF10)
--
-- Cada parada de um roteiro (uma linha de places) passa a guardar a
-- observacao que o usuario registra sobre ela: "comprar ingresso antes",
-- "fecha para almoco", "levar casaco". A anotacao pertence a parada, e
-- nao ao local do catalogo: o mesmo lugar em dois roteiros tem anotacoes
-- independentes, e apagar o roteiro apaga as anotacoes junto (o ON DELETE
-- CASCADE de fk_places_itinerary, da V6).
--
-- NULL quer dizer "sem anotacao"; o limite de 1000 caracteres e o mesmo
-- que a API valida.
-- =====================================================================

ALTER TABLE places
    ADD COLUMN note VARCHAR(1000) NULL;
