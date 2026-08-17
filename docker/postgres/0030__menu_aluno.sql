-- V30: Cria o grupo raiz "Aluno" no menu (bas_modulo) e move o grupo existente
-- "Acesso do Aluno" (com suas telas Dashboard, Boletim, Frequência e Financeiro)
-- para dentro dele. Ajusta os vinculos com os perfis (bas_perfil e
-- bas_perfil_modulo): Aluno (somente leitura) e Administrador (acesso integral).
-- Idempotente (mesmo padrao de V9__acesso_aluno.sql / V18__financeiro_aluno.sql).

-- 1) Grupo raiz "Aluno".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), NULL, 'Aluno', 'Módulo de acesso do aluno', '🎓', NULL, 'Acesso do aluno: portal, boletim, frequência e financeiro.', 6
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo
    WHERE lower(rotulo) = 'aluno' AND id_modulo IS NULL
);

-- 2) Move "Acesso do Aluno" para dentro do grupo "Aluno".
UPDATE public.bas_modulo
SET id_modulo = (SELECT id FROM public.bas_modulo WHERE lower(rotulo) = 'aluno' AND id_modulo IS NULL LIMIT 1)
WHERE lower(rotulo) = 'acesso do aluno'
  AND id_modulo IS NULL;

-- 3) Garante o perfil "Aluno" (caso ainda nao exista).
INSERT INTO public.bas_perfil (id, descricao, hierarquia, id_modulo, exibir_favoritos, ajustar_favoritos, exibir_foto, exibir_senha, exibir_menu, comunicar)
SELECT nextval('public.bas_perfil_id_seq'), 'Aluno', 'OPERACIONAL', (SELECT id FROM public.bas_modulo WHERE lower(rotulo) = 'aluno' AND id_modulo IS NULL LIMIT 1), TRUE, TRUE, TRUE, TRUE, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil WHERE lower(descricao) = 'aluno');

-- 4) Aponta o id_modulo do perfil Aluno para o grupo raiz "Aluno".
UPDATE public.bas_perfil
SET id_modulo = (SELECT id FROM public.bas_modulo WHERE lower(rotulo) = 'aluno' AND id_modulo IS NULL LIMIT 1)
WHERE lower(descricao) = 'aluno';

-- 5) Concede ao perfil Aluno o acesso (somente leitura) ao grupo "Aluno".
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, FALSE, FALSE, FALSE, FALSE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON lower(m.rotulo) = 'aluno' AND m.id_modulo IS NULL
WHERE lower(p.descricao) = 'aluno'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 6) Concede ao perfil Administrador o acesso integral ao grupo "Aluno".
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON lower(m.rotulo) = 'aluno' AND m.id_modulo IS NULL
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
