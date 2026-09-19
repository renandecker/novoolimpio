-- V67__menu_indicador_gauge.sql
-- Adiciona Indicador Gauge (Velocímetro) como filho do submenu "Painéis" sob "Relatórios"

BEGIN;

DO $$
DECLARE
    v_paineis_id INTEGER;
    v_gauge_id INTEGER;
BEGIN
    SELECT id INTO v_paineis_id FROM public.bas_modulo WHERE rotulo = 'Painéis' AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1) LIMIT 1;
    
    SELECT id INTO v_gauge_id FROM public.bas_modulo WHERE rotulo = 'Indicador Gauge' AND id_modulo = v_paineis_id LIMIT 1;
    
    IF v_gauge_id IS NULL AND v_paineis_id IS NOT NULL THEN
        INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
        VALUES (nextval('public.bas_modulo_id_seq'), v_paineis_id, 'Indicador Gauge', 'Indicador Gauge (Velocímetro)', 'fa fa-tachometer', '/view/indicador/listIndicadorGauge', NULL, 2);
        
        SELECT id INTO v_gauge_id FROM public.bas_modulo WHERE rotulo = 'Indicador Gauge' AND id_modulo = v_paineis_id LIMIT 1;
    ELSIF v_gauge_id IS NOT NULL AND v_paineis_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_paineis_id,
            rotulo = 'Indicador Gauge',
            descricao = 'Indicador Gauge (Velocímetro)',
            icone = 'fa fa-tachometer',
            outcome = '/view/indicador/listIndicadorGauge',
            ordem = 2
        WHERE id = v_gauge_id;
    END IF;

    IF v_gauge_id IS NOT NULL THEN
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_gauge_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE upper(trim(p.hierarquia)) = 'ADMIN'
        AND NOT EXISTS (
            SELECT 1 FROM public.bas_perfil_modulo pm
            WHERE pm.id_perfil = p.id AND pm.id_modulo = v_gauge_id
        );
    END IF;
END $$;

COMMIT;
