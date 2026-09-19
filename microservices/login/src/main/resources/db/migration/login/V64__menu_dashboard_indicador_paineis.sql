-- V64: Adiciona Dashboard como filho do submenu "Painéis" sob "Relatórios"

BEGIN;

-- 1) Obtém o ID do menu "Painéis" (filho de "Relatórios")
-- 2) Obtém o ID do menu "Dashboard" (já existe, outcome: /view/relatorios/listDashboard)
-- 3) Move Dashboard para ser filho de "Painéis"

DO $$
DECLARE
    v_relatorios_id INTEGER;
    v_paineis_id INTEGER;
    v_dashboard_id INTEGER;
BEGIN
    -- Busca o ID de "Relatórios"
    SELECT id INTO v_relatorios_id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1;
    
    -- Busca o ID de "Painéis" (filho de Relatórios)
    SELECT id INTO v_paineis_id FROM public.bas_modulo WHERE rotulo = 'Painéis' AND id_modulo = v_relatorios_id LIMIT 1;
    
    -- Busca o ID do Dashboard
    SELECT id INTO v_dashboard_id FROM public.bas_modulo WHERE rotulo = 'Dashboard' LIMIT 1;
    
    -- Move Dashboard para ser filho de Painéis
    IF v_paineis_id IS NOT NULL AND v_dashboard_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_paineis_id,
            ordem = 1
        WHERE id = v_dashboard_id;
        
        -- Concede acesso ao Dashboard para o perfil Administrador
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_dashboard_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE upper(trim(p.hierarquia)) = 'ADMIN'
        AND NOT EXISTS (
            SELECT 1 FROM public.bas_perfil_modulo pm
            WHERE pm.id_perfil = p.id AND pm.id_modulo = v_dashboard_id
        );
    END IF;
END $$;

-- 5) Garante que Dashboard não está sob outro menu
UPDATE public.bas_modulo
SET id_modulo = (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Painéis' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
)
WHERE rotulo = 'Dashboard' 
  AND id_modulo <> (
    SELECT id FROM public.bas_modulo 
    WHERE rotulo = 'Painéis' 
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) 
    LIMIT 1
);

COMMIT;