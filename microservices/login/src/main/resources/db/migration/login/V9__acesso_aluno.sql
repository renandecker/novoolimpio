-- V9: Cria o menu "Acesso do Aluno" em bas_modulo, o perfil "Aluno" em bas_perfil
-- e vincula o acesso ao usuario admin (bas_usuario_perfil). Idempotente.

-- 1) Modulo raiz "Acesso do Aluno" (grupo do menu).
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT 251, NULL, 'Acesso do Aluno', 'Portal de acesso do aluno', '🎓', '/aluno/portalAluno', 'Tela de acesso do aluno: portal, boletim e frequência.', 5
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo
    WHERE id = 251 OR lower(rotulo) = 'acesso do aluno'
);

-- 2) Telas do acesso do aluno, vinculadas ao modulo raiz.
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT 252, (SELECT id FROM public.bas_modulo WHERE lower(rotulo) = 'acesso do aluno' LIMIT 1), 'Portal do aluno', 'Visão geral do aluno', '📊', '/aluno/portalAluno', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE id = 252);

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT 253, (SELECT id FROM public.bas_modulo WHERE lower(rotulo) = 'acesso do aluno' LIMIT 1), 'Boletim', 'Boletim e notas do aluno', '📄', '/aluno/boletim', NULL, 2
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE id = 253);

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT 254, (SELECT id FROM public.bas_modulo WHERE lower(rotulo) = 'acesso do aluno' LIMIT 1), 'Frequência', 'Frequência do aluno', '📅', '/aluno/frequencia', NULL, 3
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE id = 254);

-- Avanca a sequencia de ids para nao colidir com os modulos criados acima.
SELECT setval('public.bas_modulo_id_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 254), true);

-- 3) Perfil "Aluno" em bas_perfil.
INSERT INTO public.bas_perfil (id, descricao, hierarquia, id_modulo, exibir_favoritos, ajustar_favoritos, exibir_foto, exibir_senha, exibir_menu, comunicar)
SELECT nextval('public.bas_perfil_id_seq'), 'Aluno', 'OPERACIONAL', (SELECT id FROM public.bas_modulo WHERE lower(rotulo) = 'acesso do aluno' LIMIT 1), TRUE, TRUE, TRUE, TRUE, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil WHERE lower(descricao) = 'aluno');

-- 4) Concede ao perfil Aluno o acesso (somente leitura) as telas do aluno.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, FALSE, FALSE, FALSE, FALSE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE lower(p.descricao) = 'aluno'
  AND m.outcome IN ('/aluno/portalAluno', '/aluno/boletim', '/aluno/frequencia')
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 5) Mantem o perfil Administrador com acesso a todos os modulos, incluindo os novos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE lower(p.descricao) = 'administrador'
  AND m.outcome IN ('/aluno/portalAluno', '/aluno/boletim', '/aluno/frequencia')
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 6) Vincula o usuario admin ao perfil Aluno.
INSERT INTO public.bas_usuario_perfil (id_usuario, id_perfil)
SELECT u.id, p.id
FROM public.bas_usuario u
CROSS JOIN public.bas_perfil p
WHERE lower(u.login) = 'admin'
  AND lower(p.descricao) = 'aluno'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_usuario_perfil up
      WHERE up.id_usuario = u.id AND up.id_perfil = p.id
  );
