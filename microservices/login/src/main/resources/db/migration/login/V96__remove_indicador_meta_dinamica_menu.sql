-- V96: Remove o menu "Indicador Meta Dinâmica" (/view/meta/indicadorMetaDinamica).
-- A tela foi descontinuada: o CRUD de com_indicador_meta agora é feito no painel
-- "Metas" do cadastro de Indicador (/view/indicador/formIndicador) e a lista de
-- metas dinâmicas em /view/meta/listMetaDinamica.
-- Origem: docker/postgres/0088__remove_indicador_meta_dinamica_menu.sql
-- Idempotente: pode rodar mais de uma vez (restore docker + Flyway login).

BEGIN;

-- Remove permissões associadas ao módulo
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE outcome = '/view/meta/indicadorMetaDinamica'
);

-- Remove o módulo "Indicador Meta Dinâmica"
DELETE FROM public.bas_modulo
WHERE outcome = '/view/meta/indicadorMetaDinamica';

COMMIT;
