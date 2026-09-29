-- V78: Tela de notificacoes por perfil (apos restore/ Flyway migrate).
-- Estrutura de menu: Administracao > Notificacoes
-- Cria modulo "Notificacoes" sob Administracao e move os itens de notificacao para baixo.

-- MODULE: Notificacoes (filho de Configurações)
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       25, -- id_modulo = 25 referencia o modulo "Configurações"
       'Notificacoes',
       'Gerenciamento de notificacoes por usuario',
       'fa fa-bell',
       '/view/configuracao/notificacoes', -- outcome raiz para a navegacao
       'Modulo de configuracao de notificacoes',
       100
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE rotulo = 'Notificacoes');

-- CONFIGURACAO NOTIFICACOES (filho de Notific the attending in loop)




-- V78: Adiciona menu "Configuração Notificações" em Administração > Configurações
-- Tela para o usuário configurar quais canais (Push, Telegram, WhatsApp, Email, SMS)
-- deseja receber para cada tipo de notificação (Notas, Presenças, Aulas, Registro aula, Alteração contrato).
-- O pai é resolvido por rotulo com LIMIT 1, sem depender do id do módulo.

-- bas_modulo nao tem coluna fl_ativo (ver V1__base.sql): id, id_modulo, rotulo,
-- descricao, icone, outcome, ajuda, ordem. Inserir fl_ativo abortava o Flyway
-- com "column fl_ativo of relation bas_modulo does not exist".
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT c.id
          FROM public.bas_modulo c
         WHERE c.rotulo = 'Notificacoes'
           AND c.id_modulo = (SELECT p.id FROM public.bas_modulo p WHERE p.rotulo = 'Administração' AND p.id_modulo IS NULL LIMIT 1)
         LIMIT 1),
       'Configuração Notificações',
       'Configuração de canais de notificação por categoria e tipo (Notas, Presenças, Aulas, Registro aula, Alteração contrato)',
       'fa fa-bell',
       '/view/configuracao/notificacoes',
       'Permite ao usuário habilitar/desabilitar canais (Push, Telegram, WhatsApp, Email, SMS) para cada tipo de notificação',
       99
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