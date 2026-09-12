-- V80: Move "Meta" e "Indicador" para serem filhos do submenu "Recursos" (sob "Relatórios")

BEGIN;

-- 1) Obtém o ID do menu "Recursos" (filho de "Relatórios")
-- 2) Move "Meta" (que está sob "Call Center") para ser filho de "Recursos"
-- 3) Move "Indicador" (que está sob "Painéis") para ser filho de "Recursos"

DO $$
DECLARE
    v_recursos_id INTEGER;
    v_meta_id INTEGER;
    v_indicador_id INTEGER;
BEGIN
    -- Busca o ID de "Recursos" (filho de Relatórios)
    SELECT id INTO v_recursos_id 
    FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1;
    
    -- Busca o ID do "Meta" (outcome: /view/meta/listMeta.xhtml)
    SELECT id INTO v_meta_id 
    FROM public.bas_modulo 
    WHERE outcome = '/view/meta/listMeta.xhtml' 
    LIMIT 1;
    
    -- Busca o ID do "Indicador" (outcome: /view/indicador/listIndicador)
    SELECT id INTO v_indicador_id 
    FROM public.bas_modulo 
    WHERE outcome = '/view/indicador/listIndicador' 
    LIMIT 1;
    
    -- Move "Meta" para ser filho de "Recursos"
    IF v_recursos_id IS NOT NULL AND v_meta_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_recursos_id,
            ordem = 1
        WHERE id = v_meta_id;
        
        -- Concede acesso ao "Meta" para o perfil Administrador
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_meta_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE lower(p.descricao) = 'administrador'
        AND NOT EXISTS (
            SELECT 1 FROM public.bas_perfil_modulo pm
            WHERE pm.id_perfil = p.id AND pm.id_modulo = v_meta_id
        );
    END IF;
    
    -- Move "Indicador" para ser filho de "Recursos"
    IF v_recursos_id IS NOT NULL AND v_indicador_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_recursos_id,
            ordem = 2
        WHERE id = v_indicador_id;
        
        -- Concede acesso ao "Indicador" para o perfil Administrador
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_indicador_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE lower(p.descricao) = 'administrador'
        AND NOT EXISTS (
            SELECT 1 FROM public.bas_perfil_modulo pm
            WHERE pm.id_perfil = p.id AND pm.id_modulo = v_indicador_id
        );
    END IF;
END $$;

-- 4) Garante que "Meta" não está sob outro menu
UPDATE public.bas_modulo
SET id_modulo = (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
)
WHERE outcome = '/view/meta/listMeta.xhtml'
  AND id_modulo <> (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Recursos' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
);

-- 5) Garante que "Indicador" não está sob outro menu
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