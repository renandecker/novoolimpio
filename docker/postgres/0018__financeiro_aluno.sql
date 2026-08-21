-- V18: Adiciona ao menu "Acesso do Aluno" o modulo "Financeiro"
-- (tela React /aluno/financeiro) e concede acesso aos perfis Aluno e
-- Administrador. Idempotente.

-- 1) Modulo "Financeiro" dentro do grupo "Acesso do Aluno".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1),
       'Financeiro', 'Parcelas e contratos do aluno', '💰', '/aluno/financeiro', 'Visualiza parcelas e contratos do aluno com detalhes de pagamento e histórico.', 4
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/financeiro');

-- 2) Concede ao perfil Aluno o acesso (somente leitura) ao novo modulo.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, FALSE, FALSE, FALSE, FALSE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome = '/aluno/financeiro'
WHERE lower(p.descricao) = 'aluno'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 3) Concede ao perfil Administrador acesso ao novo modulo.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome = '/aluno/financeiro'
WHERE lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
