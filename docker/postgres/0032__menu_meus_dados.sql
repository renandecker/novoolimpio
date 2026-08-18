-- V32: Adiciona o item de menu "Meus dados" dentro do submenu "Dados Pessoais".
-- O outcome /meus-dados aponta para a tela MeusDadosScreen que ja existe no
-- web-react. Idempotente (padrao V27/V30).

-- 1) Localiza o modulo "Dados Pessoais" (qualquer nivel da arvore).
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), dp.id, 'Meus dados', 'Dados pessoais do usuario logado', '👤', '/meus-dados', 'Exibe e permite alterar a foto e os dados pessoais do usuario logado.', 1
FROM public.bas_modulo dp
WHERE lower(dp.rotulo) = 'dados pessoais'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_modulo m
      WHERE m.id_modulo = dp.id
        AND lower(m.rotulo) = 'meus dados'
  )
LIMIT 1;

-- 2) Concede ao perfil Administrador acesso integral ao novo modulo.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON lower(m.rotulo) = 'meus dados' AND m.outcome = '/meus-dados'
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
