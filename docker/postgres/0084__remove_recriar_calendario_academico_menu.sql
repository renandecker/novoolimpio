-- 0084__remove_recriar_calendario_academico_menu.sql
-- Remove "Recriar calendário acadêmico" do menu Acadêmico.
-- Esta tela passa a ser acessada apenas como sub-tela da tela "Turma" (botão "Criar Aula coringa").
-- Idempotente: pode rodar mais de uma vez (restore docker + Flyway login V73).

BEGIN;

-- Remove permissões associadas ao módulo
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'recriar calendário acadêmico'
);

-- Remove o módulo "Recriar calendário acadêmico"
DELETE FROM public.bas_modulo
WHERE lower(rotulo) = 'recriar calendário acadêmico';

COMMIT;