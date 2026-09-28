-- V97: Reorganiza o menu do aluno ("Acesso do Aluno") e adiciona as bibliotecas do aluno.
-- Causa raiz: V58 renomeou TODA linha com outcome '/aluno/portalAluno' para 'Portal Aluno',
-- atingindo tambem o GRUPO "Acesso do Aluno" (que tinha esse outcome desde V9).
-- Resultado: principal "Portal Aluno" com subitem duplicado "Portal Aluno".
-- Este fix e idempotente:
-- 1) Renomeia o grupo (o que tem filhos) de volta para 'Acesso do Aluno' e limpa seu outcome
--    (grupo e apenas expansor; o destino /aluno/portalAluno fica na raiz "Aluno").
-- 2) Remove o subitem duplicado 'Portal Aluno' / 'Portal do aluno' (/aluno/portalAluno),
--    mantendo todos os demais subitens diretamente no "Acesso do Aluno".
-- 3) Cria 'Biblioteca Fisica' (/aluno/biblioteca-fisica) e 'Biblioteca Virtual'
--    (/aluno/biblioteca-virtual) dentro do "Acesso do Aluno".
-- 4) Concede acesso: perfil Aluno (somente leitura) e hierarquia ADMIN (integral).

-- 1) Renomeia o grupo para 'Acesso do Aluno' (o no com filhos entre Aluno/portalAluno).
UPDATE public.bas_modulo grupo
SET rotulo = 'Acesso do Aluno',
    descricao = 'Portal de acesso do aluno',
    outcome = NULL,
    ajuda = 'Telas do aluno: boletim, frequencia, financeiro, aulas, avaliacoes e bibliotecas.'
WHERE grupo.id IN (
    SELECT DISTINCT pai.id
    FROM public.bas_modulo pai
    JOIN public.bas_modulo filho ON filho.id_modulo = pai.id
    WHERE lower(trim(pai.rotulo)) IN ('portal aluno', 'portal do aluno', 'acesso do aluno')
      AND (
            filho.outcome IN ('/aluno/portalAluno', '/aluno/boletim', '/aluno/frequencia',
                              '/aluno/financeiro', '/aluno/aulas', '/aluno/avaliacoes',
                              '/aluno/biblioteca-fisica', '/aluno/biblioteca-virtual')
            OR lower(trim(filho.rotulo)) IN ('portal aluno', 'portal do aluno', 'boletim', 'notas',
                                             'frequencia', 'frequência', 'financeiro',
                                             'registro de aulas', 'avaliacoes', 'avaliações',
                                             'biblioteca fisica', 'biblioteca física',
                                             'biblioteca virtual')
          )
)
AND lower(trim(grupo.rotulo)) IN ('portal aluno', 'portal do aluno');

-- Garante a hierarquia: "Acesso do Aluno" fica sob a raiz "Aluno".
UPDATE public.bas_modulo grupo
SET id_modulo = (SELECT r.id FROM public.bas_modulo r WHERE lower(trim(r.rotulo)) = 'aluno' AND r.id_modulo IS NULL LIMIT 1)
WHERE lower(trim(grupo.rotulo)) = 'acesso do aluno'
  AND EXISTS (SELECT 1 FROM public.bas_modulo r WHERE lower(trim(r.rotulo)) = 'aluno' AND r.id_modulo IS NULL)
  AND (grupo.id_modulo IS NULL
       OR grupo.id_modulo <> (SELECT r.id FROM public.bas_modulo r WHERE lower(trim(r.rotulo)) = 'aluno' AND r.id_modulo IS NULL LIMIT 1));

-- 2) Remove o subitem duplicado 'Portal Aluno' (folha com outcome do dashboard).
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT m.id FROM public.bas_modulo m
    WHERE m.outcome = '/aluno/portalAluno'
      AND lower(trim(m.rotulo)) IN ('portal aluno', 'portal do aluno')
      AND m.id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
);

DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (
    SELECT m.id FROM public.bas_modulo m
    WHERE m.outcome = '/aluno/portalAluno'
      AND lower(trim(m.rotulo)) IN ('portal aluno', 'portal do aluno')
      AND m.id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
);

DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (
    SELECT m.id FROM public.bas_modulo m
    WHERE m.outcome = '/aluno/portalAluno'
      AND lower(trim(m.rotulo)) IN ('portal aluno', 'portal do aluno')
      AND m.id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
);

DELETE FROM public.bas_status_modulo
WHERE id_modulo IN (
    SELECT m.id FROM public.bas_modulo m
    WHERE m.outcome = '/aluno/portalAluno'
      AND lower(trim(m.rotulo)) IN ('portal aluno', 'portal do aluno')
      AND m.id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
);

UPDATE public.bas_perfil p SET id_modulo = NULL
WHERE p.id_modulo IN (
    SELECT m.id FROM public.bas_modulo m
    WHERE m.outcome = '/aluno/portalAluno'
      AND lower(trim(m.rotulo)) IN ('portal aluno', 'portal do aluno')
      AND m.id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
);

DELETE FROM public.bas_modulo
WHERE outcome = '/aluno/portalAluno'
  AND lower(trim(rotulo)) IN ('portal aluno', 'portal do aluno')
  AND id_modulo IN (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno');

-- 2b) Garante que todos os demais subitens fiquem diretamente no "Acesso do Aluno".
UPDATE public.bas_modulo tela
SET id_modulo = (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno' LIMIT 1)
WHERE tela.outcome IN ('/aluno/boletim', '/aluno/frequencia', '/aluno/financeiro',
                       '/aluno/aulas', '/aluno/avaliacoes',
                       '/aluno/biblioteca-fisica', '/aluno/biblioteca-virtual')
  AND lower(trim(tela.rotulo)) NOT IN ('aluno', 'acesso do aluno')
  AND (tela.id_modulo IS NULL
       OR tela.id_modulo <> (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno' LIMIT 1));

-- 2c) A raiz "Aluno" continua apontando para o painel do aluno.
UPDATE public.bas_modulo raiz
SET outcome = '/aluno/portalAluno'
WHERE lower(trim(raiz.rotulo)) = 'aluno'
  AND raiz.id_modulo IS NULL
  AND (raiz.outcome IS NULL OR raiz.outcome = '' OR raiz.outcome = '/default');

-- 3) Cria 'Biblioteca Fisica' dentro do "Acesso do Aluno".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno' LIMIT 1),
       'Biblioteca Fisica', 'Acervo fisico do aluno: reservas, emprestimos, multas e livros disponiveis',
       '📚', '/aluno/biblioteca-fisica',
       'Painel da biblioteca fisica do usuario logado, separado por abas.', 7
WHERE EXISTS (SELECT 1 FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/biblioteca-fisica');

-- 3b) Cria 'Biblioteca Virtual' dentro do "Acesso do Aluno".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT g.id FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno' LIMIT 1),
       'Biblioteca Virtual', 'Livros virtuais dos fornecedores para o aluno',
       '💻', '/aluno/biblioteca-virtual',
       'Painel de acesso aos livros virtuais dos fornecedores para o usuario logado.', 8
WHERE EXISTS (SELECT 1 FROM public.bas_modulo g WHERE lower(trim(g.rotulo)) = 'acesso do aluno')
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/aluno/biblioteca-virtual');

SELECT setval('public.bas_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 1), true);

-- 4) Perfil Aluno: acesso (somente leitura) aos novos itens e aos grupos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, FALSE, FALSE, FALSE, FALSE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m
  ON m.outcome IN ('/aluno/biblioteca-fisica', '/aluno/biblioteca-virtual')
  OR lower(trim(m.rotulo)) IN ('acesso do aluno', 'aluno')
WHERE lower(trim(p.descricao)) = 'aluno'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 4b) Perfis de hierarquia ADMIN: acesso integral aos novos itens e aos grupos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m
  ON m.outcome IN ('/aluno/biblioteca-fisica', '/aluno/biblioteca-virtual')
  OR lower(trim(m.rotulo)) IN ('acesso do aluno', 'aluno')
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
