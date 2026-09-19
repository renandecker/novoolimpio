-- V81: Move "Indicador Meta Dinâmica" (/view/meta/indicadorMetaDinamica) para ser filho do submenu "Recursos" (sob "Relatórios")

BEGIN;

DO $$
DECLARE
    v_recursos_id INTEGER;
    v_indicador_meta_id INTEGER;
BEGIN
    -- Busca o ID de "Recursos" (filho de Relatórios)
    SELECT id INTO v_recursos_id 
    FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1;
    
    -- Busca o ID de "Indicador Meta Dinâmica" (outcome: /view/meta/indicadorMetaDinamica)
    SELECT id INTO v_indicador_meta_id 
    FROM public.bas_modulo 
    WHERE outcome = '/view/meta/indicadorMetaDinamica' 
    LIMIT 1;
    
    -- Move Indicador Meta Dinâmica para ser filho de "Recursos"
    IF v_recursos_id IS NOT NULL AND v_indicador_meta_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_recursos_id,
            ordem = 5
        WHERE id = v_indicador_meta_id;
        
        -- Concede acesso ao "Indicador Meta Dinâmica" para o perfil Administrador
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_indicador_meta_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE upper(trim(p.hierarquia)) = 'ADMIN'
        AND NOT EXISTS (
            SELECT 1 FROM public.bas_perfil_modulo pm
            WHERE pm.id_perfil = p.id AND pm.id_modulo = v_indicador_meta_id
        );
    END IF;
END $$;

-- Garante que Indicador Meta Dinâmica não está sob outro menu
UPDATE public.bas_modulo
SET id_modulo = (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
)
WHERE outcome = '/view/meta/indicadorMetaDinamica'
  AND id_modulo <> (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
);

COMMIT;