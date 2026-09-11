-- V63: Ajusta estrutura do menu "Minha Conta > Dados Pessoais > Meus dados"
-- Garante hierarquia correta: Minha Conta (raiz) > Dados Pessoais (submenu) > Meus dados (tela)
-- Idempotente.

-- 1) Garante grupo raiz "Minha Conta"
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), NULL, 'Minha Conta', 'Menu da conta do usuário', '👤', NULL, 'Acesso aos dados pessoais e configurações da conta.', 10
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo WHERE lower(rotulo) = 'minha conta' AND id_modulo IS NULL
);

-- 2) Garante submenu "Dados Pessoais" dentro de "Minha Conta"
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'minha conta' AND m.id_modulo IS NULL LIMIT 1),
       'Dados Pessoais', 'Dados pessoais do usuário', '👤', NULL, 'Submenu com dados pessoais e foto do usuário.', 1
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo WHERE lower(rotulo) = 'dados pessoais'
);

-- 3) Garante tela "Meus dados" dentro de "Dados Pessoais"
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'dados pessoais' LIMIT 1),
       'Meus dados', 'Dados pessoais do usuario logado', '👤', '/meus-dados', 'Exibe e permite alterar a foto e os dados pessoais do usuario logado.', 1
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo m
    WHERE lower(m.rotulo) = 'meus dados' AND m.outcome = '/meus-dados'
);

-- 4) Garante ação "Alterar foto" dentro de "Dados Pessoais" (abre modal, não navega)
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'dados pessoais' LIMIT 1),
       'Alterar foto', 'Alterar foto do perfil', '📷', '/meus-dados/foto', 'Abre modal para alterar a foto do perfil.', 2
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo m
    WHERE lower(m.rotulo) = 'alterar foto' AND m.outcome = '/meus-dados/foto'
);

-- 4) Corrige hierarquia caso "Dados Pessoais" ou "Meus dados" estejam órfãos ou com pai errado
UPDATE public.bas_modulo
SET id_modulo = (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'minha conta' AND m.id_modulo IS NULL LIMIT 1)
WHERE lower(rotulo) = 'dados pessoais'
  AND (id_modulo IS NULL OR id_modulo <> (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'minha conta' AND m.id_modulo IS NULL LIMIT 1));

UPDATE public.bas_modulo
SET id_modulo = (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'dados pessoais' LIMIT 1)
WHERE lower(rotulo) = 'meus dados'
  AND outcome = '/meus-dados'
  AND (id_modulo IS NULL OR id_modulo <> (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'dados pessoais' LIMIT 1));

UPDATE public.bas_modulo
SET id_modulo = (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'dados pessoais' LIMIT 1)
WHERE lower(rotulo) = 'alterar foto'
  AND outcome = '/meus-dados/foto'
  AND (id_modulo IS NULL OR id_modulo <> (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'dados pessoais' LIMIT 1));

-- 5) Concede ao perfil Administrador acesso integral aos módulos
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON lower(m.rotulo) IN ('minha conta', 'dados pessoais', 'meus dados', 'alterar foto')
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 6) Concede ao perfil Aluno (se houver) acesso de leitura a "Meus dados" e "Alterar foto"
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, FALSE, FALSE, FALSE, FALSE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON lower(m.rotulo) IN ('meus dados', 'alterar foto')
WHERE lower(p.descricao) = 'aluno'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 7) Avança sequence para não colidir
SELECT setval('public.bas_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 300), true);