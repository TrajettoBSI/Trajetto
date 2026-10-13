-- =====================================================================
-- V12 - Locais favoritos por usuario (OB05.1, RF08)
--
-- O catalogo de pontos turisticos mora no MongoDB e nao tem identificador
-- estavel proprio; o app identifica um local pelo mesmo xid que as
-- avaliacoes ja usam ("osm_" + nome normalizado). Por isso o favorito
-- guarda, alem do xid, o recorte do local que a lista exibe (nome,
-- endereco, categoria e coordenadas): a lista de favoritos se monta so com
-- esta tabela, sem depender de uma consulta ao catalogo para cada item.
--
-- Regras garantidas pelo banco:
-- - um usuario favorita um mesmo local uma vez so (uk_favorite_places_user_place);
-- - apagar o usuario apaga os favoritos dele (ON DELETE CASCADE, como a V6
--   fez para roteiros e avaliacoes);
-- - coordenada fora da faixa e recusada, como em places (ck_places_coordenadas).
--
-- idx_favorite_places_user_created atende a listagem, que filtra pelo
-- usuario e ordena do favorito mais recente para o mais antigo.
-- =====================================================================

CREATE TABLE favorite_places (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    xid        VARCHAR(255) NOT NULL,
    name       VARCHAR(255) NOT NULL,
    address    VARCHAR(255),
    category   VARCHAR(255),
    latitude   FLOAT(53)    NOT NULL,
    longitude  FLOAT(53)    NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_favorite_places_user
        FOREIGN KEY (user_id) REFERENCES users (code) ON DELETE CASCADE,
    CONSTRAINT uk_favorite_places_user_place UNIQUE (user_id, xid),
    CONSTRAINT ck_favorite_places_coordenadas CHECK (
        latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180
    )
) ENGINE=InnoDB;

CREATE INDEX idx_favorite_places_user_created ON favorite_places (user_id, created_at);
