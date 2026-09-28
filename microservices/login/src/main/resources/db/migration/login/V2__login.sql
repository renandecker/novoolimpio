-- Tabela para autenticacao do microsservico de login
CREATE TABLE IF NOT EXISTS bas_login (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120) NOT NULL,
    password_hash VARCHAR(512) NOT NULL,
    permissions VARCHAR(500) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    id_usuario BIGINT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_bas_login_username UNIQUE (username)
);

CREATE INDEX IF NOT EXISTS idx_bas_login_usuario_id ON bas_login (id_usuario);


DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bas_login_id_usuario') THEN
        ALTER TABLE bas_login
            ADD CONSTRAINT fk_bas_login_id_usuario FOREIGN KEY (id_usuario) REFERENCES bas_usuario(id);
    END IF;
END
$DO$;



-- Garante o acesso do administrador e o vinculo com bas_usuario, mesmo quando o
-- registro de 'admin' ja existia em bas_login (ex.: criado pelo endpoint bootstrap).
-- username: admin | senha: admin123 (PBKDF2-HMAC-SHA256, 210000 iteracoes)
INSERT INTO bas_login (username, password_hash, permissions, active, id_usuario, created_at, updated_at)
SELECT 'admin',
       'pbkdf2$210000$FH_ClhgOYJwBOat1GSwabw$6xdztO0zi_QkQaowQgaQehEkXM_g5zLPdMilJHeABaA',
       'READ,CREATE,UPDATE,DELETE,EXECUTE',
       TRUE,
       (SELECT id FROM bas_usuario WHERE lower(login) = 'admin' LIMIT 1),
       NOW(),
       NOW()
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    permissions   = EXCLUDED.permissions,
    active        = TRUE,
    id_usuario    = EXCLUDED.id_usuario,
    updated_at    = NOW();



-- Garante que o login administrativo esteja vinculado ao perfil ADMIN e que
-- esse perfil tenha acesso integral a todos os modulos, inclusive os criados
-- depois das migracoes iniciais.

INSERT INTO public.bas_perfil (id, descricao, hierarquia, id_modulo, exibir_favoritos, ajustar_favoritos, exibir_foto, exibir_senha, exibir_menu, comunicar)
SELECT nextval('public.bas_perfil_id_seq'), 'Administrador', 'ADMIN', NULL, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil WHERE upper(trim(hierarquia)) = 'ADMIN');

INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

UPDATE public.bas_login
SET permissions = 'READ,CREATE,UPDATE,DELETE,EXECUTE',
    active = TRUE,
    id_usuario = COALESCE((SELECT id FROM public.bas_usuario WHERE lower(login) = 'admin' LIMIT 1), id_usuario),
    updated_at = NOW()
WHERE lower(username) = 'admin';

INSERT INTO public.bas_usuario_perfil (id_usuario, id_perfil)
SELECT u.id, p.id
FROM public.bas_usuario u
CROSS JOIN public.bas_perfil p
WHERE lower(u.login) = 'admin'
  AND upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_usuario_perfil up
      WHERE up.id_usuario = u.id AND up.id_perfil = p.id
  );


-- Cria o perfil "admin" e concede acesso completo a todas as telas (bas_modulo).

INSERT INTO public.bas_perfil (
    id, descricao, hierarquia, id_modulo,
    exibir_favoritos, ajustar_favoritos, exibir_foto, exibir_senha, exibir_menu, comunicar
)
SELECT nextval('public.bas_perfil_id_seq'), 'admin', 'ADMIN', NULL,
       TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_perfil WHERE lower(trim(descricao)) = 'admin'
);

UPDATE public.bas_perfil
SET hierarquia = 'ADMIN',
    exibir_favoritos = TRUE,
    ajustar_favoritos = TRUE,
    exibir_foto = TRUE,
    exibir_senha = TRUE,
    exibir_menu = TRUE,
    comunicar = TRUE
WHERE lower(trim(descricao)) = 'admin';

INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE lower(trim(p.descricao)) = 'admin'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

UPDATE public.bas_perfil_modulo pm
SET novo = TRUE,
    editar = TRUE,
    remover = TRUE,
    relatorio = TRUE
FROM public.bas_perfil p
WHERE pm.id_perfil = p.id
  AND lower(trim(p.descricao)) = 'admin';

INSERT INTO public.bas_usuario_perfil (id_usuario, id_perfil)
SELECT u.id, p.id
FROM public.bas_usuario u
CROSS JOIN public.bas_perfil p
WHERE lower(trim(u.login)) = 'admin'
  AND lower(trim(p.descricao)) = 'admin'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_usuario_perfil up
      WHERE up.id_usuario = u.id AND up.id_perfil = p.id
  );
