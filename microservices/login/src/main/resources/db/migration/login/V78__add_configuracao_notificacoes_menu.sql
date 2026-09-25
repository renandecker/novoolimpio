-- V78: Adiciona menu "Configuração Notificações" em Administração > Configurações
-- Tela para o usuário configurar quais canais (Push, Telegram, WhatsApp, Email, SMS)
-- deseja receber para cada tipo de notificação (Notas, Presenças, Aulas, Registro aula, Alteração contrato).

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem, fl_ativo)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Configurações' AND m.id_modulo = 25 LIMIT 1),
       'Configuração Notificações',
       'Configuração de canais de notificação por categoria e tipo (Notas, Presenças, Aulas, Registro aula, Alteração contrato)',
       'fa fa-bell',
       '/view/configuracao/notificacoes',
       'Permite ao usuário habilitar/desabilitar canais (Push, Telegram, WhatsApp, Email, SMS) para cada tipo de notificação',
       99,
       true
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE rotulo = 'Configuração Notificações');

-- Concede ao perfil Administrador acesso ao novo módulo
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.rotulo = 'Configuração Notificações'
WHERE lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );