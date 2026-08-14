-- V27: Registra o menu do dominio Curriculo/Vagas/Empresas (cur_*, migracao V26) em
-- bas_modulo e da acesso ao perfil Administrador. A V26 criou as tabelas mas nao
-- criou nenhuma tela de menu -- por isso o modulo nunca aparecia, nem para o admin
-- (que enxerga "todos os modulos" a partir de bas_modulo, entao um dominio sem
-- linha nenhuma la simplesmente nao existe no menu de ninguem).
--
-- ATENCAO: confira os valores de "outcome" abaixo contra as rotas reais do
-- web-react antes de subir em producao; foram escolhidos seguindo o padrao dos
-- demais modulos (ex.: /asaas/cobrancas, /aluno/dashboard) mas nao foram
-- validados contra o router do front.
--
-- Idempotente (roda depois do restore do olimpio.sql a cada start, mesmo padrao
-- de V8_1__asaas_menu.sql e V9__acesso_aluno.sql).

-- 1) Modulo raiz "Curriculo" (grupo do menu).
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), NULL, 'Currículo', 'Vagas, empresas e entrevistas do modulo de Curriculo', '🎯', '/curriculo/vagas', 'Gestao de vagas, empresas parceiras e entrevistas.', 310
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo WHERE lower(rotulo) = 'currículo' AND id_modulo IS NULL
);

-- 2) Telas filhas: Vagas, Empresas, Entrevistas.
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), pai.id, 'Vagas', 'Vagas cadastradas', '📋', '/curriculo/vagas', 'Lista e cadastro de vagas (cur_vaga).', 1
FROM public.bas_modulo pai WHERE lower(pai.rotulo) = 'currículo' AND pai.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/curriculo/vagas' AND id_modulo IS NOT NULL);

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), pai.id, 'Empresas', 'Empresas parceiras', '🏢', '/curriculo/empresas', 'Lista e cadastro de empresas (cur_empresa).', 2
FROM public.bas_modulo pai WHERE lower(pai.rotulo) = 'currículo' AND pai.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/curriculo/empresas');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), pai.id, 'Entrevistas', 'Entrevistas agendadas entre aluno e empresa', '🗣️', '/curriculo/entrevistas', 'Acompanhamento de entrevistas (cur_entrevista_vaga_empresa).', 3
FROM public.bas_modulo pai WHERE lower(pai.rotulo) = 'currículo' AND pai.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/curriculo/entrevistas');

-- 3) Concede ao perfil Administrador (qualquer descricao, hierarquia ADMIN) acesso
--    integral aos novos modulos. Nao e estritamente necessario para o admin ver o
--    menu (ModulePermissionService.resolve ja concede "todos os modulos" para
--    quem tem hierarquia ADMIN, direto de bas_modulo), mas mantem bas_perfil_modulo
--    consistente com o restante do sistema e com o padrao das demais migracoes.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome IN ('/curriculo/vagas', '/curriculo/empresas', '/curriculo/entrevistas')
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
