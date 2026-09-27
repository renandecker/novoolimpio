-- Corrige e completa o menu do portal do aluno ("Acesso do Aluno"):
-- 1) Garante o grupo raiz "Aluno" e o grupo "Acesso do Aluno".
-- 2) Garante as telas Portal, Boletim, Frequencia, Financeiro,
--    Registro de Aulas e Avaliacoes dentro de "Acesso do Aluno".
-- 3) Aponta o outcome do grupo raiz "Aluno" para /aluno/portalAluno.
-- 4) Concede acesso aos perfis Aluno (somente leitura) e hierarquia ADMIN
--    (acesso integral).
-- Idempotente e baseado em rotulo/outcome (nao usa ids fixos, pois o dump
-- de restauracao pode ter espaco de ids diferente).

-- 1) Grupo raiz "Aluno".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), NULL, 'Aluno', 'Módulo de acesso do aluno', '🎓', NULL,
       'Acesso do aluno: portal, boletim, frequência e financeiro.', 6
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo WHERE lower(rotulo) = 'aluno' AND id_modulo IS NULL
);

-- 2) Grupo "Acesso do Aluno" (dentro do raiz "Aluno").
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'aluno' AND m.id_modulo IS NULL LIMIT 1),
       'Acesso do Aluno', 'Portal de acesso do aluno', '🎒', NULL,
       'Tela de acesso do aluno: portal, boletim e frequência.', 1
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo WHERE lower(rotulo) = 'acesso do aluno'
);

-- 3) Telas do portal (cada uma garantida por outcome).
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1),
       'Portal do aluno', 'Visão geral do aluno', '📊', '/aluno/portalAluno', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/portalAluno');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1),
       'Notas', 'Boletim e notas do aluno', '📄', '/aluno/boletim', NULL, 2
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/boletim');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1),
       'Frequência', 'Frequência do aluno', '📅', '/aluno/frequencia', NULL, 3
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/frequencia');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1),
       'Registro de Aulas', 'Registros de aula das turmas do aluno', '📚', '/aluno/aulas', NULL, 5
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/aulas');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1),
       'Avaliações', 'Questionários e avaliações das turmas do aluno', '📝', '/aluno/avaliacoes', NULL, 6
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/avaliacoes');

-- 4) "Financeiro" do aluno dentro de "Acesso do Aluno" (corrige pai nulo/errado).
UPDATE public.bas_modulo
SET id_modulo = (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1)
WHERE lower(rotulo) = 'financeiro'
  AND outcome = '/aluno/financeiro'
  AND (id_modulo IS NULL
       OR id_modulo <> (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1));

-- Garante que todas as telas do portal fiquem dentro de "Acesso do Aluno"
-- (caso tenham sido criadas antes sem pai ou com pai errado).
UPDATE public.bas_modulo
SET id_modulo = (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1)
WHERE outcome IN ('/aluno/portalAluno', '/aluno/boletim', '/aluno/frequencia',
                  '/aluno/financeiro', '/aluno/aulas', '/aluno/avaliacoes')
  AND lower(rotulo) <> 'acesso do aluno'
  AND (id_modulo IS NULL
       OR id_modulo <> (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'acesso do aluno' LIMIT 1));

-- 5) Grupo raiz "Aluno" aponta para o portal do aluno.
UPDATE public.bas_modulo
SET outcome = '/aluno/portalAluno'
WHERE lower(rotulo) = 'aluno'
  AND id_modulo IS NULL
  AND (outcome IS NULL OR outcome = '' OR outcome = '/default');

-- Garante que a sequencia nunca gere um id ja usado.
SELECT setval('public.bas_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 1), true);

-- 6) Perfil "Aluno": garante existencia e vinculo ao grupo raiz.
INSERT INTO public.bas_perfil (id, descricao, hierarquia, id_modulo, exibir_favoritos, ajustar_favoritos, exibir_foto, exibir_senha, exibir_menu, comunicar)
SELECT nextval('public.bas_perfil_id_seq'), 'Aluno', 'OPERACIONAL',
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'aluno' AND m.id_modulo IS NULL LIMIT 1),
       TRUE, TRUE, TRUE, TRUE, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil WHERE lower(descricao) = 'aluno');

UPDATE public.bas_perfil
SET id_modulo = (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'aluno' AND m.id_modulo IS NULL LIMIT 1)
WHERE lower(descricao) = 'aluno';

-- 7) Perfil Aluno: acesso (somente leitura) as telas e aos grupos do portal.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, FALSE, FALSE, FALSE, FALSE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m
  ON m.outcome IN ('/aluno/portalAluno', '/aluno/boletim', '/aluno/frequencia', '/aluno/financeiro',
                   '/aluno/aulas', '/aluno/avaliacoes')
  OR lower(m.rotulo) IN ('acesso do aluno', 'aluno')
WHERE lower(p.descricao) = 'aluno'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 8) Perfis de hierarquia ADMIN: acesso integral as telas e aos grupos do portal.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m
  ON m.outcome IN ('/aluno/portalAluno', '/aluno/boletim', '/aluno/frequencia', '/aluno/financeiro',
                   '/aluno/aulas', '/aluno/avaliacoes')
  OR lower(m.rotulo) IN ('acesso do aluno', 'aluno')
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
