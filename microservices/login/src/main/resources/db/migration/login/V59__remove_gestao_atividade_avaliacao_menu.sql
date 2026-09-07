-- V59: Remove "Gestão de Atividade" e "Gestão de Avaliação" do menu Acadêmico
-- Estes submenus estão vazios (sem itens filhos) e devem ser removidos.

BEGIN;

-- Remove permissões associadas aos módulos
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) IN ('gestão de atividade', 'gestão de avaliação')
);

-- Remove os módulos "Gestão de Atividade" e "Gestão de Avaliação"
DELETE FROM public.bas_modulo
WHERE lower(rotulo) IN ('gestão de atividade', 'gestão de avaliação');

COMMIT;