-- V32: Corrige e completa o menu "Acesso do Aluno":
-- 1) Reposiciona "Financeiro" dentro de "Acesso do Aluno" (estava solto, sem pai).
-- 2) Cria as telas "Registro de Aulas" (/aluno/aulas) e "Avaliações"
--    (/aluno/avaliacoes) dentro de "Acesso do Aluno".
-- 3) Aponta o outcome do grupo raiz "Aluno" para /aluno/dashboard.
-- 4) Concede acesso aos perfis Aluno (somente leitura) e Administrador
--    (hierarquia ADMIN, acesso integral).
-- Idempotente (mesmo padrao de V9/V18/V30).

-- 1) Financeiro dentro de "Acesso do Aluno" (corrige id_modulo nulo/apontando errado).
UPDATE public.bas_modulo
SET id_modulo = (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1)
WHERE lower(rotulo) = 'financeiro'
  AND outcome = '/aluno/financeiro'
  AND (id_modulo IS NULL
       OR id_modulo <> (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1));

-- 2) Grupo raiz "Aluno" aponta para o dashboard do aluno.
UPDATE public.bas_modulo
SET outcome = '/aluno/dashboard'
WHERE lower(rotulo) = 'aluno'
  AND id_modulo IS NULL
  AND (outcome IS NULL OR outcome = '' OR outcome = '/default');

-- 3) Tela "Registro de Aulas" dentro de "Acesso do Aluno".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1),
       'Registro de Aulas', 'Registros de aula das turmas do aluno', '📚', '/aluno/aulas', NULL, 5
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/aulas');

-- 4) Tela "Avaliações" dentro de "Acesso do Aluno".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1),
       'Avaliações', 'Questionários e avaliações das turmas do aluno', '📝', '/aluno/avaliacoes', NULL, 6
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/avaliacoes');

-- Garante que as duas telas novas fiquem dentro de "Acesso do Aluno"
-- (caso tenham sido criadas antes sem pai).
UPDATE public.bas_modulo
SET id_modulo = (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1)
WHERE outcome IN ('/aluno/aulas', '/aluno/avaliacoes')
  AND (id_modulo IS NULL
       OR id_modulo <> (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1));

-- Avanca a sequencia de ids para nao colidir com os modulos criados acima.
SELECT setval('public.bas_modulo_id_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 254), true);

-- 5) Perfil Aluno: acesso (somente leitura) as telas e aos grupos do portal.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, FALSE, FALSE, FALSE, FALSE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m
  ON m.outcome IN ('/aluno/dashboard', '/aluno/boletim', '/aluno/frequencia', '/aluno/financeiro',
                   '/aluno/aulas', '/aluno/avaliacoes')
  OR lower(m.rotulo) IN ('acesso do aluno', 'aluno')
WHERE lower(p.descricao) = 'aluno'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 6) Perfis de hierarquia ADMIN: acesso integral as telas e aos grupos do portal.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m
  ON m.outcome IN ('/aluno/dashboard', '/aluno/boletim', '/aluno/frequencia', '/aluno/financeiro',
                   '/aluno/aulas', '/aluno/avaliacoes')
  OR lower(m.rotulo) IN ('acesso do aluno', 'aluno')
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
