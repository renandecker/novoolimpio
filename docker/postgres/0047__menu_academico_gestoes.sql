-- Migracao 47: popula os SubMenus vazios de "Academico" -- Gestao de Avaliacao,
-- Gestao de Contrato, Gestao de Curriculo e Gestao de Atividade -- com as telas
-- React que ja existem no web-react (rotas conferidas em web-react/src/main.tsx),
-- para que fiquem acessiveis pela sidebar.
--
-- Os pais sao localizados por rotulo (nao por id fixo), pois o espaco de ids do
-- dump pode variar entre restauracoes. Cada tela filha e garantida por outcome,
-- entao a migracao e idempotente (roda apos o restore a cada start, mesmo
-- padrao das demais migracoes).
--
-- Aproveita para corrigir as rotas quebradas criadas pela 0027__menu_curriculo.sql
-- (/curriculo/vagas, /curriculo/empresas e /curriculo/entrevistas nao existem no
-- router; as rotas reais sao no singular) movendo essas telas para dentro de
-- "Gestao de Curriculo" e removendo o grupo raiz "Curriculo" que ficar vazio.

-- ---------------------------------------------------------------------------
-- 1) Corrige/move as telas da 0027 para "Gestao de Curriculo" com as rotas reais.
-- ---------------------------------------------------------------------------
UPDATE public.bas_modulo antigo
SET outcome = '/curriculo/vaga',
    id_modulo = (SELECT m.id FROM public.bas_modulo m
                 WHERE lower(m.rotulo) IN ('gestão de curriculo', 'gestão de currículo') LIMIT 1),
    ordem = 6,
    ajuda = 'Vagas cadastradas pelas empresas parceiras (cur_vaga).'
WHERE antigo.outcome = '/curriculo/vagas'
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo outro WHERE outro.outcome = '/curriculo/vaga');

UPDATE public.bas_modulo antigo
SET outcome = '/curriculo/empresa',
    id_modulo = (SELECT m.id FROM public.bas_modulo m
                 WHERE lower(m.rotulo) IN ('gestão de curriculo', 'gestão de currículo') LIMIT 1),
    ordem = 7,
    ajuda = 'Empresas parceiras do modulo de Currículo (cur_empresa).'
WHERE antigo.outcome = '/curriculo/empresas'
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo outro WHERE outro.outcome = '/curriculo/empresa');

UPDATE public.bas_modulo antigo
SET outcome = '/curriculo/entrevista',
    id_modulo = (SELECT m.id FROM public.bas_modulo m
                 WHERE lower(m.rotulo) IN ('gestão de curriculo', 'gestão de currículo') LIMIT 1),
    ordem = 9,
    ajuda = 'Entrevistas entre alunos e empresas (cur_entrevista_vaga_empresa).'
WHERE antigo.outcome = '/curriculo/entrevistas'
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo outro WHERE outro.outcome = '/curriculo/entrevista');

-- Remove sobras das rotas antigas quebradas (ex.: execucao parcial anterior).
DELETE FROM public.bas_perfil_modulo pm
USING public.bas_modulo m
WHERE pm.id_modulo = m.id
  AND m.outcome IN ('/curriculo/vagas', '/curriculo/empresas', '/curriculo/entrevistas');

DELETE FROM public.bas_modulo
WHERE outcome IN ('/curriculo/vagas', '/curriculo/empresas', '/curriculo/entrevistas');

-- Remove o grupo raiz "Currículo" da 0027 se tiver ficado sem filhos.
-- Primeiro derruba as permissoes (bas_perfil_modulo) que apontam para o grupo,
-- inclusive as criadas pelas migracoes de acesso total (0019/0020), que concedem
-- acesso a todo bas_modulo -- senao o DELETE abaixo viola a FK na 2a execucao.
DELETE FROM public.bas_perfil_modulo pm
USING public.bas_modulo pai
WHERE pm.id_modulo = pai.id
  AND lower(pai.rotulo) IN ('currículo', 'curriculo')
  AND pai.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo filho WHERE filho.id_modulo = pai.id);

DELETE FROM public.bas_modulo pai
WHERE lower(pai.rotulo) IN ('currículo', 'curriculo')
  AND pai.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo filho WHERE filho.id_modulo = pai.id);

-- ---------------------------------------------------------------------------
-- 2) Telas de "Gestao de Avaliacao".
-- ---------------------------------------------------------------------------
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'gestão de avaliação' LIMIT 1),
       'Criar Pergunta', 'Cadastro de perguntas de avaliação', '📝', '/view/avaliacao/criar',
       'Criação e listagem de perguntas usadas nas avaliações.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/avaliacao/criar');

-- ---------------------------------------------------------------------------
-- 3) Telas de "Gestao de Contrato".
-- ---------------------------------------------------------------------------
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'gestão de contrato' LIMIT 1),
       'Contratos', 'Listagem de contratos', '📄', '/view/contrato/listContrato',
       'Lista de contratos dos alunos.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/contrato/listContrato');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'gestão de contrato' LIMIT 1),
       'Tipos de Contrato', 'Listagem de tipos de contrato', '📄', '/view/tipoContrato/listTipoContrato',
       'Lista de tipos de contrato.', 2
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/tipoContrato/listTipoContrato');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'gestão de contrato' LIMIT 1),
       'Situações de Contrato', 'Listagem de situações de contrato', '✅', '/view/contratoSituacao/listContratoSituacao',
       'Lista de situações possíveis de um contrato.', 3
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/contratoSituacao/listContratoSituacao');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'gestão de contrato' LIMIT 1),
       'Formulário de Situação de Contrato', 'Cadastro e edição de situações de contrato', '✅', '/view/contratoSituacao/formContratoSituacao',
       'Formulário de manutenção de situações de contrato.', 4
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/contratoSituacao/formContratoSituacao');

-- ---------------------------------------------------------------------------
-- 4) Telas de "Gestao de Curriculo".
-- ---------------------------------------------------------------------------
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) IN ('gestão de curriculo', 'gestão de currículo') LIMIT 1),
       'Currículos', 'Listagem de currículos dos cursos', '🎓', '/view/curriculo/listCurriculo',
       'Lista de currículos cadastrados.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/curriculo/listCurriculo');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) IN ('gestão de curriculo', 'gestão de currículo') LIMIT 1),
       'Formulário de Currículo', 'Cadastro e edição de currículos', '🎓', '/view/curriculo/formCurriculo',
       'Formulário de manutenção de currículos.', 2
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/curriculo/formCurriculo');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) IN ('gestão de curriculo', 'gestão de currículo') LIMIT 1),
       'Colunas do Currículo', 'Configuração das colunas da listagem de currículos', '🧩', '/view/curriculo/colunas',
       'Define as colunas exibidas na listagem de currículos.', 3
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/curriculo/colunas');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) IN ('gestão de curriculo', 'gestão de currículo') LIMIT 1),
       'Experiências Profissionais', 'Experiências profissionais registradas nos currículos', '💼', '/curriculo/curriculo-trabalho',
       'Trabalhos/experiências registradas nos currículos dos alunos.', 4
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/curriculo/curriculo-trabalho');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) IN ('gestão de curriculo', 'gestão de currículo') LIMIT 1),
       'Configuração do Currículo', 'Parâmetros do modulo de Currículo', '⚙️', '/curriculo/configuracao',
       'Configurações gerais do modulo de Currículo.', 5
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/curriculo/configuracao');

-- ---------------------------------------------------------------------------
-- 5) Telas de "Gestao de Atividade".
-- ---------------------------------------------------------------------------
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'gestão de atividade' LIMIT 1),
       'Atividades Complementares', 'Listagem de atividades complementares', '📝', '/view/atividadeComplementar/listAtividadeComplementar',
       'Lista de atividades complementares dos alunos.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/atividadeComplementar/listAtividadeComplementar');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'gestão de atividade' LIMIT 1),
       'Formulário de Atividade Complementar', 'Cadastro e edição de atividades complementares', '📝', '/view/atividadeComplementar/formAtividadeComplementar',
       'Formulário de manutenção de atividades complementares.', 2
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/atividadeComplementar/formAtividadeComplementar');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'gestão de atividade' LIMIT 1),
       'Tipos de Atividade', 'Listagem de tipos de atividade', '📝', '/view/tipoAtividade/listTipoAtividade',
       'Lista de tipos de atividade complementar.', 3
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/tipoAtividade/listTipoAtividade');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE lower(m.rotulo) = 'gestão de atividade' LIMIT 1),
       'Formulário de Tipo de Atividade', 'Cadastro e edição de tipos de atividade', '📝', '/view/tipoAtividade/formTipoAtividade',
       'Formulário de manutenção de tipos de atividade.', 4
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/tipoAtividade/formTipoAtividade');

-- ---------------------------------------------------------------------------
-- 6) Permissoes: perfis de hierarquia ADMIN recebem acesso integral as novas telas
--    (o admin ja enxerga tudo direto de bas_modulo, mas mantemos bas_perfil_modulo
--    consistente com o padrao das demais migracoes).
-- ---------------------------------------------------------------------------
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m
  ON m.outcome IN (
      '/view/avaliacao/criar',
      '/view/contrato/listContrato',
      '/view/tipoContrato/listTipoContrato',
      '/view/contratoSituacao/listContratoSituacao', '/view/contratoSituacao/formContratoSituacao',
      '/view/curriculo/listCurriculo', '/view/curriculo/formCurriculo',
      '/view/curriculo/colunas',
      '/curriculo/curriculo-trabalho',
      '/curriculo/configuracao',
      '/view/atividadeComplementar/listAtividadeComplementar', '/view/atividadeComplementar/formAtividadeComplementar',
      '/view/tipoAtividade/listTipoAtividade', '/view/tipoAtividade/formTipoAtividade'
  )
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- Avanca as sequencias para nao colidir com os registros criados acima.
SELECT setval('public.bas_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 254), true);
SELECT setval('public.bas_perfil_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_perfil_modulo), 1), true);
