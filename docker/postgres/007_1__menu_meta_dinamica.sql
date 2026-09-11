-- V7.1: Adiciona ao menu os modulos "Meta Dinâmica" e "Indicador Meta Dinâmica"
-- (telas React /view/meta/listMetaDinamica e /view/meta/indicadorMetaDinamica)
-- Concede acesso ao perfil Administrador. Idempotente.

BEGIN;

-- 1) Modulo "Meta Dinâmica" dentro do submenu "Call Center".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Call Center' LIMIT 1),
       'Meta Dinâmica', 'Manutenção de Metas Dinâmicas', '🎯', '/view/meta/listMetaDinamica', NULL, 100
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/meta/listMetaDinamica');

-- 2) Modulo "Indicador Meta Dinâmica" dentro do submenu "Gestão" (sob Administração).
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Gestão' AND m.id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Administração' AND id_modulo IS NULL) LIMIT 1),
       'Indicador Meta Dinâmica', 'Indicadores de Metas Dinâmicas', '📊', '/view/meta/indicadorMetaDinamica', NULL, 100
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/meta/indicadorMetaDinamica');

-- 3) Concede ao perfil Administrador acesso aos novos modulos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome IN ('/view/meta/listMetaDinamica', '/view/meta/indicadorMetaDinamica')
WHERE lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

COMMIT;