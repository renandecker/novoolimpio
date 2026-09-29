-- V93: Tela de notificacoes por perfil (apos restore/ Flyway migrate).
-- Adiciona 3 novos modulos ao menu: Notificacoes do Usuario, Aluno e Professor.
-- Concede acesso ao perfil Administrador.

-- Notificacoes do Usuario (USUARIO + AGENDA)
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Notificacoes' AND m.id_modulo = 25 LIMIT 1),
       'Notificacoes do Usuario',
       'Alteracoes da sua agenda e do seu cadastro (categorias USUARIO e AGENDA)',
       'fa fa-user-bell',
       '/view/configuracao/notificacoes-usuario',
       'Habilita/desabilita canais por tipo: alteracoes da agenda e do cadastro',
       100
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/configuracao/notificacoes-usuario');

-- Notificacoes do Aluno (ALUNO + CONTRATO + TURMA)
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Notificacoes' AND m.id_modulo = 25 LIMIT 1),
       'Notificacoes do Aluno',
       'Contrato (criacao/cancelamento), aula, nota, presenza e registro de aula (categorias ALUNO, CONTRATO, TURMA)',
       'fa fa-graduation-cap',
       '/view/configuracao/notificacoes-aluno',
       'Habilita/desabilita canais por tipo do aluno logado',
       101
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/configuracao/notificacoes-aluno');

-- Notificacoes do Professor (PROFESSOR)
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Notificacoes' AND m.id_modulo = 25 LIMIT 1),
       'Notificacoes do Professor',
       'Perguntas respondidas, turma vinculada e registro do professor (categoria PROFESSOR)',
       'fa fa-chalkboard-teacher',
       '/view/configuracao/notificacoes-professor',
       'Habilita/desabilita canais por tipo do professor logado',
       102
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/configuracao/notificacoes-professor');

-- Concede ao perfil Administrador acesso aos novos modulos
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome IN ('/view/configuracao/notificacoes-usuario', '/view/configuracao/notificacoes-aluno', '/view/configuracao/notificacoes-professor')
WHERE lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );