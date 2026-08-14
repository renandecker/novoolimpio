-- V15: Adiciona ao menu os modulos "NAP em lote" e "Cobrança em lote"
-- (telas React /view/nap/listLote e /view/cobranca/listLote) dentro dos
-- submenus "NAP" (137, sob Acadêmico) e "Gestão de Cobrança" (131).
-- Concede acesso ao perfil Administrador. Idempotente.

-- 1) Modulo "NAP em lote" dentro do submenu NAP.
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'NAP' AND m.id_modulo = 49 LIMIT 1),
       'NAP em lote', 'Envio de e-mails e ligações em lote da NAP', '📨', '/view/nap/listLote', NULL, 100
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/nap/listLote');

-- 2) Modulo "Cobrança em lote" dentro do submenu Gestão de Cobrança.
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Gestão de Cobrança' LIMIT 1),
       'Cobrança em lote', 'Envio de e-mails e ligações em lote da Cobrança', '📨', '/view/cobranca/listLote', NULL, 100
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/cobranca/listLote');

-- 3) Concede ao perfil Administrador acesso aos novos modulos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome IN ('/view/nap/listLote', '/view/cobranca/listLote')
WHERE lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
