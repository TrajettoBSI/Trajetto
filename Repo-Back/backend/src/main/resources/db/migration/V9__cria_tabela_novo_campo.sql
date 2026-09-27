-- Tabela de apoio que alimenta o dropdown do cadastro de usuário.
-- Se já existir uma V9 na pasta, renomeie este arquivo para o próximo número livre.

-- TROCAR (opcional): nome da tabela. Se trocar, troque também no ALTER TABLE abaixo
-- e no @Table do NovoCampoModel.java.
CREATE TABLE companhia (
    id   BIGINT      NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_companhia_name UNIQUE (name)
) ENGINE=InnoDB;

-- TROCAR: as opções que aparecem no dropdown.
INSERT INTO companhia (name) VALUES
    ('Sozinho'),
    ('Casal'),
    ('Família'),
    ('Amigos');

-- TROCAR (opcional): nome da coluna em users. Se trocar, troque também no
-- @JoinColumn do UserModel.java. Aceita NULL porque as contas já existentes
-- não têm o campo preenchido.
ALTER TABLE users
    ADD COLUMN companhia_id BIGINT NULL,
    ADD CONSTRAINT fk_users_companhia FOREIGN KEY (companhia_id) REFERENCES companhia (id);
