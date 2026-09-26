-- =====================================================================
-- V8 - Catalogo de pontos turisticos com indice espacial (BE02.4)
--
-- A busca "locais perto de mim" do mapa era feita inteira na aplicacao:
-- o catalogo curado de Roma (data/rome_curated.geojson) ficava numa lista
-- em memoria e o PlacesController calculava a formula de Haversine em Java
-- para cada um dos ~800 pontos, a cada requisicao, so para descartar quase
-- todos logo depois.
--
-- Esta migracao traz o catalogo para o banco e deixa a pergunta com quem
-- sabe responde-la: o MySQL 8 tem tipo geografico, funcoes de distancia
-- sobre o elipsoide e indice espacial (R-tree).
--
--   * location e um POINT no SRID 4326 (WGS 84, o mesmo sistema das
--     coordenadas do GeoJSON e do GPS do celular). Com SRID geografico,
--     ST_Distance devolve metros sobre o elipsoide, e nao graus.
--
--   * location e uma coluna GERADA a partir de latitude/longitude. Quem
--     grava o catalogo escreve so os dois numeros, e o banco garante que o
--     ponto nunca fica diferente deles. O POINT() recebe (longitude,
--     latitude): e a ordem interna do MySQL para o eixo X/Y, independente da
--     ordem latitude-primeiro com que o SRID 4326 e exibido.
--
--   * O indice espacial exige coluna NOT NULL com SRID fixo, e so e usado
--     por predicados de retangulo/contencao (MBRContains, ST_Contains...),
--     nunca por ST_Distance diretamente. Por isso a consulta faz o filtro
--     em dois passos: MBRContains contra o retangulo envolvente de um
--     ST_Buffer do raio -- esse passo usa o indice e descarta quase tudo --
--     e ST_Distance so nos poucos pontos que sobram, para cortar os cantos
--     do retangulo. Buffer e distancia sao ambos calculados no elipsoide,
--     entao nenhum ponto na borda do raio escapa do primeiro passo.
--
-- Os perfis de viajante de cada ponto ficam numa tabela propria, e nao numa
-- coluna com lista separada por virgula, para que o filtro por perfil seja
-- uma comparacao exata apoiada na chave primaria.
--
-- O conteudo das tabelas nao e carregado aqui: o GeoJSON continua sendo a
-- fonte do catalogo e TouristSpotCatalogSync o espelha no banco a cada
-- inicializacao. Assim, editar o arquivo nao exige migracao nova.
-- =====================================================================

CREATE TABLE tourist_spots (
    id            BIGINT        NOT NULL,
    name          VARCHAR(255)  NOT NULL,
    address       VARCHAR(255),
    latitude      DOUBLE        NOT NULL,
    longitude     DOUBLE        NOT NULL,
    location      POINT GENERATED ALWAYS AS (ST_SRID(POINT(longitude, latitude), 4326)) STORED NOT NULL SRID 4326,
    category      VARCHAR(64),
    fee           VARCHAR(16),
    opening_hours VARCHAR(512),
    phone         VARCHAR(64),
    website       VARCHAR(512),
    wikidata      VARCHAR(32),
    wikipedia     VARCHAR(255),
    wheelchair    VARCHAR(16),
    PRIMARY KEY (id),
    CONSTRAINT ck_tourist_spots_coordenadas CHECK (
        latitude  BETWEEN  -90 AND  90 AND
        longitude BETWEEN -180 AND 180),
    SPATIAL INDEX sx_tourist_spots_location (location),
    INDEX idx_tourist_spots_category (category)
) ENGINE=InnoDB;

CREATE TABLE tourist_spot_profiles (
    spot_id BIGINT      NOT NULL,
    profile VARCHAR(32) NOT NULL,
    PRIMARY KEY (spot_id, profile),
    INDEX idx_tourist_spot_profiles_profile (profile),
    CONSTRAINT fk_tourist_spot_profiles_spot FOREIGN KEY (spot_id)
        REFERENCES tourist_spots (id) ON DELETE CASCADE
) ENGINE=InnoDB;
