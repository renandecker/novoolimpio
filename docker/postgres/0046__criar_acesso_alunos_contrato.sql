-- V46: Cria acesso no bas_login para alunos que possuem contrato ativo.
--   username = "nome"."ultimo" (primeiro nome + ultimo nome, minusculas, sem acentos/especiais)
--   senha    = admin123 (hash provisorio 'plain$' sera convertido em PBKDF2 no primeiro login)
--   permissao = READ (acesso ao portal do aluno)
--
-- Idempotente: ON CONFLICT (username) apenas reativa e religa a conta.

-- 1) Garante que existe usuario em bas_usuario para cada pessoa com contrato ativo
WITH usuarios_gerados AS (
    SELECT 
        lower(regexp_replace(
            split_part(pf.nome, ' ', 1) || '.' || 
            split_part(pf.nome, ' ', array_length(regexp_split_to_array(pf.nome, '\s+'), 1)),
            '[^a-z0-9.]', '', 'g'
        )) AS login_gerado,
        pf.id_pessoa
    FROM bas_pessoa_fisica pf
    JOIN edc_contrato c ON c.id_pessoa = pf.id_pessoa
    WHERE c.ativo = TRUE
      AND pf.nome IS NOT NULL
      AND pf.nome <> ''
      AND NOT EXISTS (
          SELECT 1 FROM bas_usuario u 
          WHERE u.id_pessoa = pf.id_pessoa
      )
),
logins_unicos AS (
    SELECT DISTINCT ON (login_gerado) login_gerado, id_pessoa
    FROM usuarios_gerados
    WHERE login_gerado IS NOT NULL
      AND login_gerado <> ''
      AND login_gerado <> '.'
      AND NOT EXISTS (SELECT 1 FROM bas_usuario u WHERE u.login = login_gerado)
)
INSERT INTO bas_usuario (login, senha, fl_ativo, id_pessoa, fl_senha_provisoria)
SELECT login_gerado, 'plain$admin123', TRUE, id_pessoa, TRUE
FROM logins_unicos;

-- 2) Cria/atualiza login em bas_login para esses usuarios
WITH logins_distintos AS (
    SELECT DISTINCT ON (lower(u.login)) 
        lower(u.login) AS username,
        u.id AS id_usuario
    FROM bas_usuario u
    JOIN bas_pessoa_fisica pf ON pf.id_pessoa = u.id_pessoa
    JOIN edc_contrato c ON c.id_pessoa = pf.id_pessoa
    WHERE c.ativo = TRUE
      AND u.fl_ativo = TRUE
      AND u.login IS NOT NULL
      AND u.login <> ''
      AND u.login <> '.'
)
INSERT INTO bas_login (username, password_hash, permissions, active, id_usuario, created_at, updated_at)
SELECT 
    username,
    'plain$admin123',
    'READ',
    TRUE,
    id_usuario,
    NOW(),
    NOW()
FROM logins_distintos
ON CONFLICT (username) DO UPDATE SET
    active      = TRUE,
    id_usuario  = EXCLUDED.id_usuario,
    updated_at  = NOW(),
    password_hash = EXCLUDED.password_hash,
    permissions = EXCLUDED.permissions;

-- 3) Vincula o perfil "Aluno" a esses usuarios (se o perfil existir)
WITH perfis_distintos AS (
    SELECT DISTINCT ON (u.id, p.id) 
        u.id AS id_usuario,
        p.id AS id_perfil
    FROM bas_usuario u
    JOIN bas_pessoa_fisica pf ON pf.id_pessoa = u.id_pessoa
    JOIN edc_contrato c ON c.id_pessoa = pf.id_pessoa
    CROSS JOIN bas_perfil p
    WHERE c.ativo = TRUE
      AND u.fl_ativo = TRUE
      AND lower(p.descricao) = 'aluno'
      AND NOT EXISTS (
          SELECT 1 FROM bas_usuario_perfil up
          WHERE up.id_usuario = u.id AND up.id_perfil = p.id
      )
)
INSERT INTO bas_usuario_perfil (id_usuario, id_perfil)
SELECT id_usuario, id_perfil
FROM perfis_distintos;