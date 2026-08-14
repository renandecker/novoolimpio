-- V19: Garante que o perfil Administrador (hierarquia ADMIN) tenha acesso
-- integral a TODOS os modulos existentes, inclusive os criados pelas
-- migracoes posteriores a 004 (ex.: 0015, 0015_1, 0015_2, 0018).
-- Idempotente (mesmo padrao do 004__admin_acesso_total.sql).

-- 1) Garante a existencia do perfil Administrador.
INSERT INTO public.bas_perfil (id, descricao, hierarquia, id_modulo, exibir_favoritos, ajustar_favoritos, exibir_foto, exibir_senha, exibir_menu, comunicar)
SELECT nextval('public.bas_perfil_id_seq'), 'Administrador', 'ADMIN', NULL, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil WHERE upper(trim(hierarquia)) = 'ADMIN');

-- 2) Concede ao perfil Administrador acesso integral a todos os modulos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 3) Reforca permissao integral nos vinculos ja existentes do Administrador.
UPDATE public.bas_perfil_modulo pm
SET novo = TRUE,
    editar = TRUE,
    remover = TRUE,
    relatorio = TRUE
FROM public.bas_perfil p
WHERE pm.id_perfil = p.id
  AND upper(trim(p.hierarquia)) = 'ADMIN';
