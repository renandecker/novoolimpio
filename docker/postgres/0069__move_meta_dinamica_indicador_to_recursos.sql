-- V69: Move Meta Dinâmica (/view/meta/listMetaDinamica) and Indicador (/view/indicador/listIndicador)
-- to be children of the "Recursos" submenu (under "Relatórios"), and remove them from their previous locations.

BEGIN;

DO $$
DECLARE
    v_recursos_id INTEGER;
    v_meta_dinamica_id INTEGER;
    v_indicador_id INTEGER;
BEGIN
    -- Busca o ID de "Recursos" (filho de Relatórios)
    SELECT id INTO v_recursos_id 
    FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1;
    
    -- Busca o ID de "Meta Dinâmica" (outcome: /view/meta/listMetaDinamica)
    SELECT id INTO v_meta_dinamica_id 
    FROM public.bas_modulo 
    WHERE outcome = '/view/meta/listMetaDinamica' 
    LIMIT 1;
    
    -- Busca o ID de "Indicador" (outcome: /view/indicador/listIndicador)
    SELECT id INTO v_indicador_id 
    FROM public.bas_modulo 
    WHERE outcome = '/view/indicador/listIndicador' 
    LIMIT 1;
    
    -- Move Meta Dinâmica para ser filha de "Recursos"
    IF v_recursos_id IS NOT NULL AND v_meta_dinamica_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_recursos_id,
            ordem = 3
        WHERE id = v_meta_dinamica_id;
        
        -- Concede acesso ao "Meta Dinâmica" para o perfil Administrador
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_meta_dinamica_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE upper(trim(p.hierarquia)) = 'ADMIN'
        AND NOT EXISTS (
            SELECT 1 FROM public.bas_perfil_modulo pm
            WHERE pm.id_perfil = p.id AND pm.id_modulo = v_meta_dinamica_id
        );
    END IF;
    
    -- Move Indicador para ser filho de "Recursos"
    IF v_recursos_id IS NOT NULL AND v_indicador_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_recursos_id,
            ordem = 4
        WHERE id = v_indicador_id;
        
        -- Concede acesso ao "Indicador" para o perfil Administrador
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_indicador_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE upper(trim(p.hierarquia)) = 'ADMIN'
        AND NOT EXISTS (
            SELECT 1 FROM public.bas_perfil_modulo pm
            WHERE pm.id_perfil = p.id AND pm.id_modulo = v_indicador_id
        );
    END IF;
END $$;

-- Garante que Meta Dinâmica não está sob outro menu
UPDATE public.bas_modulo
SET id_modulo = (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
)
WHERE outcome = '/view/meta/listMetaDinamica'
  AND id_modulo <> (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
);

-- Garante que Indicador não está sob outro menu
UPDATE public.bas_modulo
SET id_modulo = (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
)
WHERE outcome = '/view/indicador/listIndicador'
  AND id_modulo <> (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
);

COMMIT;
