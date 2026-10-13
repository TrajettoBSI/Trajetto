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
