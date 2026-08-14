-- V20: Garante que o perfil "admin" tenha acesso integral a TODOS os modulos
-- existentes, inclusive os criados pelas migracoes posteriores a 004.
-- Idempotente (mesmo padrao do 004__admin_acesso_total.sql).

-- 1) Garante a existencia do perfil "admin" com hierarquia ADMIN.
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

-- 2) Concede ao perfil "admin" acesso integral a todos os modulos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE lower(trim(p.descricao)) = 'admin'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 3) Reforca permissao integral nos vinculos ja existentes do perfil "admin".
UPDATE public.bas_perfil_modulo pm
SET novo = TRUE,
    editar = TRUE,
    remover = TRUE,
    relatorio = TRUE
FROM public.bas_perfil p
WHERE pm.id_perfil = p.id
  AND lower(trim(p.descricao)) = 'admin';

-- 4) Garante que o usuario 'admin' esteja vinculado ao perfil "admin".
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
