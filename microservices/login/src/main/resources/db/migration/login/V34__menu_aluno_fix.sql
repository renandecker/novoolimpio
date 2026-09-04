-- Corrige o menu do portal do aluno apos restores/migracoes concorrentes:
-- 1) Quebra o ciclo na arvore: a raiz "Aluno" nao pode ter pai (estava como
--    filha de "Acesso do Aluno", o que fazia o portal inteiro sumir do menu,
--    pois nenhum no da subarvore ficava acessivel a partir da raiz).
-- 2) Garante "Acesso do Aluno" como filho da raiz "Aluno".
-- 3) Remove telas duplicadas do portal (ex.: legadas 252/253/254 x novas),
--    mantendo uma unica tela por outcome dentro de "Acesso do Aluno".
-- 4) Reposiciona as telas do portal apenas se forem folhas (nunca grupos).
-- 5) Regaranta permissoes: perfil Aluno (leitura) e hierarquia ADMIN (integral).
-- Idempotente e baseado em rotulo/outcome.

-- 1) Quebra o ciclo: raiz "Aluno" volta a nao ter pai.
UPDATE public.bas_modulo raiz
SET id_modulo = NULL
WHERE lower(raiz.rotulo) = 'aluno'
  AND raiz.id_modulo IS NOT NULL
  AND raiz.id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(g.rotulo) = 'acesso do aluno');

-- 2) "Acesso do Aluno" fica diretamente sob a raiz "Aluno".
UPDATE public.bas_modulo grupo
SET id_modulo = (SELECT r.id FROM public.bas_modulo r WHERE lower(r.rotulo) = 'aluno' AND r.id_modulo IS NULL LIMIT 1)
WHERE lower(grupo.rotulo) = 'acesso do aluno'
  AND (grupo.id_modulo IS NULL
       OR grupo.id_modulo <> (SELECT r.id FROM public.bas_modulo r WHERE lower(r.rotulo) = 'aluno' AND r.id_modulo IS NULL LIMIT 1));

-- 3) Remove telas duplicadas do portal (mantem a de maior id por outcome).
CREATE TEMP TABLE tmp_menu_aluno_dupes AS
SELECT m.id
FROM public.bas_modulo m
WHERE lower(m.rotulo) NOT IN ('aluno', 'acesso do aluno')
  AND m.outcome IN ('/aluno/portalAluno', '/aluno/boletim', '/aluno/frequencia',
                    '/aluno/financeiro', '/aluno/aulas', '/aluno/avaliacoes')
  AND EXISTS (
      SELECT 1 FROM public.bas_modulo m2
      WHERE lower(m2.rotulo) NOT IN ('aluno', 'acesso do aluno')
        AND m2.outcome = m.outcome
        AND m2.id > m.id
  );

DELETE FROM public.bas_perfil_modulo pm USING tmp_menu_aluno_dupes d WHERE pm.id_modulo = d.id;
DELETE FROM public.bas_favorito_perfil fp USING tmp_menu_aluno_dupes d WHERE fp.id_modulo = d.id;
DELETE FROM public.bas_favorito_usuario fu USING tmp_menu_aluno_dupes d WHERE fu.id_modulo = d.id;
DELETE FROM public.bas_status_modulo sm USING tmp_menu_aluno_dupes d WHERE sm.id_modulo = d.id;
UPDATE public.bas_perfil p SET id_modulo = NULL FROM tmp_menu_aluno_dupes d WHERE p.id_modulo = d.id;
DELETE FROM public.bas_modulo m USING tmp_menu_aluno_dupes d WHERE m.id = d.id;
DROP TABLE tmp_menu_aluno_dupes;

-- 4) Telas do portal ficam dentro de "Acesso do Aluno" (somente folhas).
UPDATE public.bas_modulo tela
SET id_modulo = (SELECT g.id FROM public.bas_modulo g WHERE lower(g.rotulo) = 'acesso do aluno' LIMIT 1)
WHERE tela.outcome IN ('/aluno/portalAluno', '/aluno/boletim', '/aluno/frequencia',
                       '/aluno/financeiro', '/aluno/aulas', '/aluno/avaliacoes')
  AND lower(tela.rotulo) NOT IN ('aluno', 'acesso do aluno')
  AND (tela.id_modulo IS NULL
       OR tela.id_modulo <> (SELECT g.id FROM public.bas_modulo g WHERE lower(g.rotulo) = 'acesso do aluno' LIMIT 1));

-- 5) Raiz "Aluno" aponta para o portal do aluno.
UPDATE public.bas_modulo raiz
SET outcome = '/aluno/portalAluno'
WHERE lower(raiz.rotulo) = 'aluno'
  AND raiz.id_modulo IS NULL
  AND (raiz.outcome IS NULL OR raiz.outcome = '' OR raiz.outcome = '/default');

-- Avanca a sequencia para nao colidir com ids criados manualmente.
SELECT setval('public.bas_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 254), true);

-- 6) Perfil "Aluno": garante existencia e vinculo ao grupo raiz.
INSERT INTO public.bas_perfil (id, descricao, hierarquia, id_modulo, exibir_favoritos, ajustar_favoritos, exibir_foto, exibir_senha, exibir_menu, comunicar)
SELECT nextval('public.bas_perfil_id_seq'), 'Aluno', 'OPERACIONAL',
       (SELECT r.id FROM public.bas_modulo r WHERE lower(r.rotulo) = 'aluno' AND r.id_modulo IS NULL LIMIT 1),
       TRUE, TRUE, TRUE, TRUE, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil WHERE lower(descricao) = 'aluno');

UPDATE public.bas_perfil p
SET id_modulo = (SELECT r.id FROM public.bas_modulo r WHERE lower(r.rotulo) = 'aluno' AND r.id_modulo IS NULL LIMIT 1)
WHERE lower(p.descricao) = 'aluno'
  AND (p.id_modulo IS NULL
       OR p.id_modulo <> (SELECT r.id FROM public.bas_modulo r WHERE lower(r.rotulo) = 'aluno' AND r.id_modulo IS NULL LIMIT 1));

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
