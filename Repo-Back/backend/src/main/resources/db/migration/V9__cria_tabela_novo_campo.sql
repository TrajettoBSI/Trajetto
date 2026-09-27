-- Tabela de apoio que alimenta o dropdown do cadastro de usuário.
-- Se já existir uma V9 na pasta, renomeie este arquivo para o próximo número livre.

-- TROCAR (opcional): nome da tabela. Se trocar, troque também no ALTER TABLE abaixo
-- e no @Table do NovoCampoModel.java.
CREATE TABLE orcamento (
    id   BIGINT      NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_orcamento_name UNIQUE (name)
) ENGINE=InnoDB;

-- TROCAR: as opções que aparecem no dropdown.
INSERT INTO orcamento (name) VALUES
    ('Economico'),
    ('Moderado'),
    ('Confortavel'),
    ('Luxo');

-- TROCAR (opcional): nome da coluna em users. Se trocar, troque também no
-- @JoinColumn do UserModel.java. Aceita NULL porque as contas já existentes
-- não têm o campo preenchido.
ALTER TABLE users
    ADD COLUMN orcamento_id BIGINT NULL,
    ADD CONSTRAINT fk_users_orcamento FOREIGN KEY (orcamento_id) REFERENCES orcamento (id);
