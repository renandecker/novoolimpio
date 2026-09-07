-- V60: Remove a tela "listConsultor" do módulo Atendimento do consultor
-- A rota /view/consultor/listConsultor foi removida do app React (web-react).
-- Espelho da migração docker/postgres/0060__remove_consultor_list_menu.sql.

BEGIN;

DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%'
);

DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%'
);

DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%'
);

DELETE FROM public.bas_status_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%'
);

DELETE FROM public.bas_modulo
WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%';

COMMIT;