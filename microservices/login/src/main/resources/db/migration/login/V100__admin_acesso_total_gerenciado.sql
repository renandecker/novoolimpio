-- V100__admin_acesso_total_gerenciado.sql
-- Consolida o acesso total do usuario 'admin' em um unico perfil de hierarquia ADMIN.
--
-- Por que esta migracao existe
-- ---------------------------
-- O login service decide as permissoes do usuario em
-- ModulePermissionService.resolve(): se algum perfil vinculado ao usuario tiver
-- hierarquia 'ADMIN' (ModulePermissionService.isAdmin), o servico ignora
-- bas_perfil_modulo e devolve TODOS os modulos de bas_modulo com todas as
-- permissoes (ModulePermissionService.todosOsModulos()). Sem esse vinculo, o
-- admin fica restrito ao que estiver em bas_perfil_modulo e some do menu.
--
-- As migracoes anteriores (V4, V7, V19, V20) faziam esse trabalho de forma
-- parcial: cada uma procurava o perfil por 'descricao' ('admin',
-- 'Administrador') e apenas nos modulos que existiam naquele momento. Modulos
-- criados depois ficavam fora, e 'descricao' pode ter sido editada na tela de
-- perfis. Aqui a busca e pela hierarquia (ADMIN), que e o que o codigo le, e o
-- granted e refeito para a arvore inteira de modulos.
--
-- Schema real (ver V1__base.sql):
--   public.bas_perfil         -> id, descricao, hierarquia, id_modulo,
--                                exibir_favoritos, ajustar_favoritos, exibir_foto,
--                                exibir_senha, exibir_menu, comunicar
--                                (nao possui rotulo nem fl_ativo)
--   public.bas_perfil_modulo  -> id, id_perfil, id_modulo, novo, editar, remover,
--                                relatorio  (UNIQUE (id_perfil, id_modulo))
--   public.bas_usuario        -> id, login, fl_ativo, id_pessoa, ...
--   public.bas_usuario_perfil -> id_usuario, id_perfil (PRIMARY KEY composta)
--   public.bas_login          -> username, password_hash, permissions, active,
--                                id_usuario, created_at, updated_at
--
-- Idempotente: pode rodar quantas vezes quiser, em qualquer estado do banco.

-- ---------------------------------------------------------------------------
-- 0) Limpeza defensiva de vinculos orfaos.
--    bas_perfil_modulo e bas_usuario_perfil guardam apenas ids; linhas que
--    apontam para perfil/modulo/usuario removidos (as remocoes V88-V99 deixam
--    residuos em backups antigos) nao ajudam ninguem e quebram telas de
--    seguranca. O mesmoegiﬁo ja e feito pela V99; aqui e repetido porque este
--    script pode rodar em um banco onde a V99 falhou no meio.
-- ---------------------------------------------------------------------------
DELETE FROM public.bas_perfil_modulo pm
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil p  WHERE p.id = pm.id_perfil)
   OR NOT EXISTS (SELECT 1 FROM public.bas_modulo m  WHERE m.id = pm.id_modulo);

DELETE FROM public.bas_usuario_perfil up
WHERE NOT EXISTS (SELECT 1 FROM public.bas_usuario u WHERE u.id = up.id_usuario)
   OR NOT EXISTS (SELECT 1 FROM public.bas_perfil  p WHERE p.id = up.id_perfil);

-- ---------------------------------------------------------------------------
-- 1) Garante o perfil de hierarquia ADMIN.
--    Ordem de preferencia:
--      a) ja existe um perfil com hierarquia ADMIN  -> reutiliza;
--      b) existe 'admin'/'Administrador' sem hierarquia ADMIN -> promove
--         (promover e melhor do que criar: evita perfis ADMIN duplicados);
--      c) nao existe nenhum dos dois -> cria 'Administrador'.
-- ---------------------------------------------------------------------------
UPDATE public.bas_perfil
SET hierarquia = 'ADMIN'
WHERE id = (
    SELECT p.id
    FROM public.bas_perfil p
    WHERE upper(trim(coalesce(p.hierarquia, ''))) <> 'ADMIN'
      AND lower(trim(coalesce(p.descricao, ''))) IN ('admin', 'administrador')
    ORDER BY p.id
    LIMIT 1
)
AND NOT EXISTS (
    SELECT 1 FROM public.bas_perfil WHERE upper(trim(coalesce(hierarquia, ''))) = 'ADMIN'
);

INSERT INTO public.bas_perfil (id, descricao, hierarquia, id_modulo,
                               exibir_favoritos, ajustar_favoritos, exibir_foto,
                               exibir_senha, exibir_menu, comunicar)
SELECT nextval('public.bas_perfil_id_seq'), 'Administrador', 'ADMIN', NULL,
       TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_perfil WHERE upper(trim(coalesce(hierarquia, ''))) = 'ADMIN'
);

-- Normaliza as flags de exibicao de todos os perfis ADMIN: sem exibir_menu o
-- menu some na interface mesmo com as permissoes liberadas.
UPDATE public.bas_perfil
SET hierarquia        = 'ADMIN',
    exibir_favoritos  = TRUE,
    ajustar_favoritos = TRUE,
    exibir_foto       = TRUE,
    exibir_senha      = TRUE,
    exibir_menu       = TRUE,
    comunicar         = TRUE
WHERE upper(trim(coalesce(hierarquia, ''))) = 'ADMIN';

-- ---------------------------------------------------------------------------
-- 2) Concede acesso integral a TODOS os modulos de bas_modulo.
--    Cobre os modulos criados por qualquer migracao, passada ou futura, e
--    reforca os vinculos ja existentes (algumas telas gravaram FALSE).
-- ---------------------------------------------------------------------------
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE upper(trim(coalesce(p.hierarquia, ''))) = 'ADMIN'
ON CONFLICT (id_perfil, id_modulo) DO UPDATE
SET novo     = TRUE,
    editar   = TRUE,
    remover  = TRUE,
    relatorio = TRUE;

-- ---------------------------------------------------------------------------
-- 3) Garante o usuario legado 'admin' em bas_usuario.
--    O login service resolve permissoes por id_usuario; sem essa linha o
--    vinculo de perfil nao tem contra o que apontar.
-- ---------------------------------------------------------------------------
INSERT INTO public.bas_usuario (id, login, fl_ativo)
SELECT nextval('public.bas_usuario_id_seq'), 'admin', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_usuario WHERE lower(trim(coalesce(login, ''))) = 'admin'
);

UPDATE public.bas_usuario
SET fl_ativo = TRUE
WHERE lower(trim(coalesce(login, ''))) = 'admin';

-- ---------------------------------------------------------------------------
-- 4) Vincula o usuario 'admin' aos perfis ADMIN.
--    Se o banco tiver mais de um perfil ADMIN (as V4/V19/V20 podem ter criado
--    'admin' e 'Administrador'), o vinculo e feito em todos: o usuario fica
--    administrador de qualquer forma e nenhum perfil fica orfao.
-- ---------------------------------------------------------------------------
INSERT INTO public.bas_usuario_perfil (id_usuario, id_perfil)
SELECT u.id, p.id
FROM public.bas_usuario u
CROSS JOIN public.bas_perfil p
WHERE lower(trim(coalesce(u.login, ''))) = 'admin'
  AND upper(trim(coalesce(p.hierarquia, ''))) = 'ADMIN'
ON CONFLICT (id_usuario, id_perfil) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5) Conta de autenticacao (bas_login).
--    A senha NAO e sobrescrita de proposito: quem ja trocou a senha provisoria
--    por uma definitiva (PBKDF2) continua entrando. A linha so e criada quando
--    nao existe, reaproveitando o mesmo hash padrao da V5.
-- ---------------------------------------------------------------------------
INSERT INTO public.bas_login (username, password_hash, permissions, active, id_usuario, created_at, updated_at)
SELECT 'admin',
       'pbkdf2$210000$FH_ClhgOYJwBOat1GSwabw$6xdztO0zi_QkQaowQgaQehEkXM_g5zLPdMilJHeABaA',
       'READ,CREATE,UPDATE,DELETE,EXECUTE',
       TRUE,
       (SELECT u.id FROM public.bas_usuario u WHERE lower(trim(coalesce(u.login, ''))) = 'admin' LIMIT 1),
       NOW(),
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_login WHERE lower(trim(coalesce(username, ''))) = 'admin'
);

UPDATE public.bas_login
SET permissions = 'READ,CREATE,UPDATE,DELETE,EXECUTE',
    active      = TRUE,
    id_usuario  = (SELECT u.id FROM public.bas_usuario u WHERE lower(trim(coalesce(u.login, ''))) = 'admin' LIMIT 1),
    updated_at  = NOW()
WHERE lower(trim(coalesce(username, ''))) = 'admin';

-- ---------------------------------------------------------------------------
-- 6) Sequences alinhadas com o maior id gravado.
--    As insercoes acima usam nextval() explicito; se um backup veio com
--    sequence defasada em relacao aos ids, o proximo nextval() colide na
--    primary key. O GREATEST(..., 1) evita setval com valor 0.
-- ---------------------------------------------------------------------------
SELECT setval('public.bas_perfil_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_perfil), 1), true);
SELECT setval('public.bas_perfil_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_perfil_modulo), 1), true);
SELECT setval('public.bas_usuario_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_usuario), 1), true);
