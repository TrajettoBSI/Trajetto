-- Tabela de apoio que alimenta o dropdown "Gênero" da tela de cadastro.
CREATE TABLE genders (
    id   BIGINT      NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_genders_name UNIQUE (name)
) ENGINE=InnoDB;

INSERT INTO genders (name) VALUES
    ('Feminino'),
    ('Masculino'),
    ('Não-binário'),
    ('Outro'),
    ('Prefiro não informar');

-- Coluna em users que guarda a opção escolhida. Aceita NULL porque as contas
-- criadas antes desta migração não têm gênero informado.
ALTER TABLE users
    ADD COLUMN gender_id BIGINT NULL,
    ADD CONSTRAINT fk_users_gender FOREIGN KEY (gender_id) REFERENCES genders (id);
