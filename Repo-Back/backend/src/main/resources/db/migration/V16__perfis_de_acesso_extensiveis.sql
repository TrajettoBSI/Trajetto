-- =====================================================================
-- V16 - Perfis de acesso extensiveis (OB06.1)
--
-- Ate aqui o perfil de cada usuario era a coluna booleana users.isAdmin:
-- so cabiam dois papeis, e cada regra de autorizacao perguntava "e admin?".
-- Um terceiro papel (um gestor que so ve o painel, por exemplo) exigiria
-- outra coluna e mexer em todas as regras.
--
-- Esta migracao troca a coluna por tres tabelas:
--   * roles             - os perfis (ADMIN, USER, e os que vierem);
--   * permissions       - as acoes protegidas do sistema;
--   * role_permissions  - quais acoes cada perfil pode executar.
-- O backend passa a autorizar pela permissao, e nao pelo nome do perfil.
-- Criar um perfil novo vira inserir linhas nestas tabelas, sem tocar no
-- codigo das regras.
--
-- Migracao dos usuarios: quem tinha isAdmin = 1 vai para ADMIN, quem tinha
-- isAdmin = 0 vai para USER. O ADMIN recebe todas as permissoes que antes
-- eram liberadas pelo isAdmin, entao ninguem ganha nem perde acesso.
-- =====================================================================

CREATE TABLE roles (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    code        VARCHAR(40)  NOT NULL,
    name        VARCHAR(80)  NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT uk_roles_code UNIQUE (code)
);

CREATE TABLE permissions (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    code        VARCHAR(60)  NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT uk_permissions_code UNIQUE (code)
);

CREATE TABLE role_permissions (
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
);

INSERT INTO roles (code, name, description) VALUES
    ('ADMIN', 'Administrador', 'Gerencia usuarios, perfis e acessa o painel gerencial.'),
    ('USER',  'Viajante',      'Usuario do aplicativo: cria e avalia os proprios roteiros.');

-- As quatro acoes que antes exigiam isAdmin = 1.
INSERT INTO permissions (code, description) VALUES
    ('USERS_VIEW',   'Listar e consultar o cadastro de qualquer usuario.'),
    ('USERS_MANAGE', 'Editar e remover o cadastro de qualquer usuario.'),
    ('ROLES_ASSIGN', 'Trocar o perfil de acesso de um usuario.'),
    ('STATS_VIEW',   'Acessar os indicadores do painel gerencial.');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
  FROM roles r
  JOIN permissions p
 WHERE r.code = 'ADMIN';

-- O USER nao recebe permissao nenhuma: o que ele faz (o proprio perfil, os
-- proprios roteiros) exige apenas estar autenticado.

-- ---------------------------------------------------------------------
-- Migracao dos usuarios ja cadastrados
-- ---------------------------------------------------------------------

ALTER TABLE users ADD COLUMN role_id BIGINT NULL;

UPDATE users u
  JOIN roles r ON r.code = CASE WHEN COALESCE(u.isAdmin, 0) = 1 THEN 'ADMIN' ELSE 'USER' END
   SET u.role_id = r.id;

ALTER TABLE users MODIFY role_id BIGINT NOT NULL;

-- RESTRICT: um perfil com usuarios nao pode ser apagado e deixa-los sem acesso.
ALTER TABLE users
    ADD CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT;

CREATE INDEX idx_users_role ON users (role_id);

DROP INDEX idx_users_is_admin ON users;
ALTER TABLE users DROP COLUMN isAdmin;

-- ---------------------------------------------------------------------
-- Cartoes de usuarios do painel
--
-- Mesma procedure da V7, com administradores e clientes contados pelo
-- perfil. Com os dois perfis de hoje os numeros sao os mesmos de antes.
-- ---------------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_stats_user_overview;

CREATE PROCEDURE sp_stats_user_overview(
    IN p_from     DATE,
    IN p_to       DATE,
    IN p_profile  VARCHAR(255),
    IN p_country  VARCHAR(255),
    IN p_category VARCHAR(255))
    READS SQL DATA
    SQL SECURITY INVOKER
    SELECT
        COUNT(*)                                                          AS totalUsers,
        COALESCE(SUM(r.code = 'ADMIN'), 0)                                AS totalAdmins,
        COALESCE(SUM(r.code = 'USER'), 0)                                 AS totalClients,
        COALESCE(SUM(u.is_verified = 1), 0)                               AS verifiedUsers,
        COALESCE(SUM(u.is_verified = 0), 0)                               AS unverifiedUsers,
        ROUND(AVG(CASE
                      WHEN u.birthDate IS NULL THEN NULL
                      ELSE YEAR(CURDATE()) - YEAR(u.birthDate)
                  END))                                                   AS avgAge,
        (SELECT COUNT(*)
           FROM itineraries i
          WHERE (p_from IS NULL OR i.start_date >= p_from)
            AND (p_to   IS NULL OR i.start_date <= p_to)
            AND (p_category IS NULL
                 OR EXISTS (SELECT 1 FROM places rp
                             WHERE rp.itinerary_id = i.id
                               AND COALESCE(NULLIF(TRIM(rp.category), ''), 'Outros') = p_category))
            AND ((p_profile IS NULL AND p_country IS NULL)
                 OR EXISTS (SELECT 1 FROM users ru
                             WHERE ru.code = i.user_id
                               AND (p_profile IS NULL
                                    OR COALESCE(NULLIF(TRIM(ru.travelerProfile), ''), 'Sem perfil') = p_profile)
                               AND (p_country IS NULL OR ru.country = p_country)))) AS totalItineraries
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE (p_profile IS NULL
           OR COALESCE(NULLIF(TRIM(u.travelerProfile), ''), 'Sem perfil') = p_profile)
      AND (p_country IS NULL OR u.country = p_country);
