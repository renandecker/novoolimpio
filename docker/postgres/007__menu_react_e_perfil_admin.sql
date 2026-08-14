-- V7: Alinha o menu (bas_modulo) com as telas React e garante o perfil Administrador.
-- O banco e restaurado do backup olimpio.sql a cada start; esta migracao roda logo
-- depois (login roda o Flyway) e e idempotente.

BEGIN;

-- 1) Remove a extensao .xhtml (e duplicidades como .xhtml.xhtml) dos outcomes,
--    pois as rotas do front-end React nao possuem essa extensao.
UPDATE public.bas_modulo
SET outcome = regexp_replace(outcome, '(\.xhtml)+$', '', 'i')
WHERE outcome IS NOT NULL AND outcome LIKE '%.xhtml%';

-- Outcomes sem destino valem a pagina inicial.
UPDATE public.bas_modulo
SET outcome = '/default'
WHERE outcome IS NULL OR outcome = '' OR outcome = '/';

-- 2) Remove o modulo Biblioteca (features descontinuadas) e suas referencias/permissoes.

-- 2.1) Desvincula quaisquer modulos que tenham esses IDs como pai (id_modulo)
UPDATE public.bas_modulo 
SET id_modulo = NULL 
WHERE id_modulo IN (187,188,189,193,194,195,196,207,218,223);

-- 2.2) Remove as permissoes associadas aos modulos na tabela de perfis
DELETE FROM public.bas_perfil_modulo 
WHERE id_modulo IN (187,188,189,193,194,195,196,207,218,223);

-- 2.3) Remove os modulos em ordem (primeiro os filhos da lista, depois os pais)
DELETE FROM public.bas_modulo 
WHERE id IN (187,188,189,193,194,195,196,207,218,223);

-- 3) Garante o perfil Administrador (hierarquia ADMIN).
INSERT INTO public.bas_perfil (id, descricao, hierarquia, id_modulo, exibir_favoritos, ajustar_favoritos, exibir_foto, exibir_senha, exibir_menu, comunicar)
SELECT nextval('public.bas_perfil_id_seq'), 'Administrador', 'ADMIN', NULL, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil WHERE lower(descricao) = 'administrador');

-- 4) Concede ao perfil Administrador acesso a todos os modulos existentes.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 5) Vincula o usuario admin ao perfil Administrador.
INSERT INTO public.bas_usuario_perfil (id_usuario, id_perfil)
SELECT u.id, p.id
FROM public.bas_usuario u
CROSS JOIN public.bas_perfil p
WHERE lower(u.login) = 'admin'
  AND lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_usuario_perfil up
      WHERE up.id_usuario = u.id AND up.id_perfil = p.id
  );

COMMIT;