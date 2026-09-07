-- V60: Remove a tela "listConsultor" do módulo Atendimento do consultor
-- A rota /view/consultor/listConsultor foi removida do app React (web-react).
-- Remove de forma idempotente qualquer menu/permissao/favorito/status que aponte
-- para esta tela (nao existe no dump olimpio.sql; defesa para bases legadas).

BEGIN;

-- Remove permissões associadas ao módulo
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%'
);

-- Remove favoritos de perfil associados
DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%'
);

-- Remove favoritos de usuário associados
DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%'
);

-- Remove status associados ao módulo
DELETE FROM public.bas_status_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%'
);

-- Remove o próprio módulo de listagem de consultores
DELETE FROM public.bas_modulo
WHERE lower(outcome) LIKE '%/view/consultor/listconsultor%';

COMMIT;