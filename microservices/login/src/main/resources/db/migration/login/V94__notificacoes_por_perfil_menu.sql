-- V93: Telas de notificacao por perfil (reusam o layout de /view/configuracao/notificacoes).
-- 1) Notificacoes do usuario (USUARIO+AGENDA): alteracoes da agenda e do cadastro.
-- 2) Notificacoes do aluno (ALUNO+CONTRATO+TURMA): criacao/cancelamento contrato, aula, nota, presenca, registro.
-- 3) Notificacoes do professor (PROFESSOR): perguntas respondidas, turma vinculada, registro do professor.

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem, fl_ativo)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Configurações' AND m.id_modulo = 25 LIMIT 1),
       'Notificações do Usuário',
       'Alterações da sua agenda e do seu cadastro (categorias USUARIO e AGENDA)',
       'fa fa-user-bell',
       '/view/configuracao/notificacoes-usuario',
       'Habilita/desabilita canais por tipo: alterações da agenda e do cadastro',
       100,
       true
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/configuracao/notificacoes-usuario');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem, fl_ativo)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Configurações' AND m.id_modulo = 25 LIMIT 1),
       'Notificações do Aluno',
       'Contrato (criação/cancelamento), aula, nota, presença e registro de aula (categorias ALUNO, CONTRATO, TURMA)',
       'fa fa-graduation-cap',
       '/view/configuracao/notificacoes-aluno',
       'Habilita/desabilita canais por tipo do aluno logado',
       101,
       true
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/configuracao/notificacoes-aluno');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem, fl_ativo)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Configurações' AND m.id_modulo = 25 LIMIT 1),
       'Notificações do Professor',
       'Perguntas respondidas, turma vinculada e registro do professor (categoria PROFESSOR)',
       'fa fa-chalkboard-teacher',
       '/view/configuracao/notificacoes-professor',
       'Habilita/desabilita canais por tipo do professor logado',
       102,
       true
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/configuracao/notificacoes-professor');

-- Concede ao perfil Administrador acesso aos novos módulos
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome IN ('/view/configuracao/notificacoes-usuario', '/view/configuracao/notificacoes-aluno', '/view/configuracao/notificacoes-professor')
WHERE lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
