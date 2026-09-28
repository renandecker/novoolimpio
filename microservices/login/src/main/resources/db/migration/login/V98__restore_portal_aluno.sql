-- V98: Restaura o subitem "Portal Aluno" (tela /aluno/portalAluno) dentro do
-- grupo "Acesso do Aluno".
-- Contexto: a V97 removeu a folha duplicada "Portal Aluno" e o frontend passou a
-- oculta-la; foi solicitado o retorno do item que contem a tela do painel do aluno.
-- Este fix e idempotente e funciona nos dois cenarios:
-- 1) bancos onde a V97 ja executou (recria a folha removida);
-- 2) bancos novos (apenas garante nome, pai e ordem da folha).
-- Estrutura final: "Acesso do Aluno" (grupo expansor) contendo "Portal Aluno"
-- (ordem 1, tela do painel) e os demais subitens.

-- 1) Garante que a folha do painel exista dentro do "Acesso do Aluno".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno' LIMIT 1),
       'Portal Aluno', 'Visão geral do aluno', '📊', '/aluno/portalAluno',
       'Painel do aluno: visão geral das matrículas.', 1
WHERE EXISTS (SELECT 1 FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_modulo m
      WHERE m.outcome = '/aluno/portalAluno'
        AND m.id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno'))
;

-- 2) Se a folha existe mas está fora do grupo (ou com rótulo divergente), corrige.
UPDATE public.bas_modulo folha
SET id_modulo = (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno' LIMIT 1),
    rotulo = 'Portal Aluno',
    ordem = 1
WHERE folha.outcome = '/aluno/portalAluno'
  AND lower(trim(folha.rotulo)) IN ('portal aluno', 'portal do aluno')
  AND EXISTS (SELECT 1 FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
  AND (
       folha.id_modulo IS NULL
       OR folha.id_modulo <> (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno' LIMIT 1)
       OR lower(trim(folha.rotulo)) <> 'portal aluno'
      );

SELECT setval('public.bas_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 1), true);

-- 3) Perfil Aluno: acesso (somente leitura) ao item restaurado.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, FALSE, FALSE, FALSE, FALSE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m
  ON m.outcome = '/aluno/portalAluno'
 AND lower(trim(m.rotulo)) = 'portal aluno'
 AND m.id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
WHERE lower(trim(p.descricao)) = 'aluno'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 4) Perfis de hierarquia ADMIN: acesso integral ao item restaurado.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m
  ON m.outcome = '/aluno/portalAluno'
 AND lower(trim(m.rotulo)) = 'portal aluno'
 AND m.id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
