-- V71: Garante o item "Dashboard" dentro de "Painéis" dentro de "Relatórios".
-- Idempotente: pode rodar mais de uma vez (Flyway login + restore docker).
-- Web e mobile consomem o menu via /api/basico/modulo/menu (bas_modulo),
-- então a hierarquia Relatórios > Painéis > Dashboard passa a valer nos dois apps.

BEGIN;

DO $$
DECLARE
    v_relatorios_id INTEGER;
    v_paineis_id INTEGER;
    v_dashboard_id INTEGER;
BEGIN
    -- 1) Localiza "Relatórios" (com ou sem acento)
    SELECT id INTO v_relatorios_id
    FROM public.bas_modulo
    WHERE rotulo IN ('Relatórios', 'Relatorios')
    ORDER BY id
    LIMIT 1;

    IF v_relatorios_id IS NULL THEN
        RAISE NOTICE 'V71: menu Relatórios não encontrado, nada a fazer.';
        RETURN;
    END IF;

    -- 2) Garante o submenu "Painéis" como filho de "Relatórios"
    SELECT id INTO v_paineis_id
    FROM public.bas_modulo
    WHERE rotulo IN ('Painéis', 'Paineis')
      AND id_modulo = v_relatorios_id
    LIMIT 1;

    IF v_paineis_id IS NULL THEN
        INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
        VALUES (nextval('public.bas_modulo_id_seq'), v_relatorios_id, 'Painéis', 'Painéis', 'fa fa-th-large', NULL, NULL, 100)
        RETURNING id INTO v_paineis_id;
    ELSE
        UPDATE public.bas_modulo
        SET rotulo = 'Painéis',
            descricao = 'Painéis',
            icone = COALESCE(icone, 'fa fa-th-large'),
            outcome = NULL,
            id_modulo = v_relatorios_id
        WHERE id = v_paineis_id;
    END IF;

    -- 3) Localiza o "Dashboard" pelo outcome canônico, com fallback por rótulo
    SELECT id INTO v_dashboard_id
    FROM public.bas_modulo
    WHERE outcome = '/view/relatorios/listDashboard'
    ORDER BY id
    LIMIT 1;

    IF v_dashboard_id IS NULL THEN
        SELECT id INTO v_dashboard_id
        FROM public.bas_modulo
        WHERE rotulo = 'Dashboard'
        ORDER BY id
        LIMIT 1;
    END IF;

    -- 4) Cria o Dashboard se não existir, já como filho de "Painéis"
    IF v_dashboard_id IS NULL THEN
        INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
        VALUES (nextval('public.bas_modulo_id_seq'), v_paineis_id, 'Dashboard', 'Dashboard', 'fa fa-th-large', '/view/relatorios/listDashboard', 'Painel de dashboards', 1)
        RETURNING id INTO v_dashboard_id;
    ELSE
        -- Move para dentro de "Painéis" e normaliza outcome/ordem
        UPDATE public.bas_modulo
        SET id_modulo = v_paineis_id,
            rotulo = 'Dashboard',
            outcome = '/view/relatorios/listDashboard',
            ordem = 1
        WHERE id = v_dashboard_id;
    END IF;

    -- 5) Traz qualquer outro "Dashboard" órfão para dentro de "Painéis"
    UPDATE public.bas_modulo
    SET id_modulo = v_paineis_id
    WHERE rotulo = 'Dashboard'
      AND id <> v_dashboard_id
      AND (id_modulo IS NULL OR id_modulo <> v_paineis_id);

    -- 6) Concede acesso a "Painéis" e "Dashboard" para o perfil Administrador
    INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
    SELECT p.id, v_paineis_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
    FROM public.bas_perfil p
    WHERE upper(trim(p.hierarquia)) = 'ADMIN'
    AND NOT EXISTS (
        SELECT 1 FROM public.bas_perfil_modulo pm
        WHERE pm.id_perfil = p.id AND pm.id_modulo = v_paineis_id
    );

    INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
    SELECT p.id, v_dashboard_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
    FROM public.bas_perfil p
    WHERE upper(trim(p.hierarquia)) = 'ADMIN'
    AND NOT EXISTS (
        SELECT 1 FROM public.bas_perfil_modulo pm
        WHERE pm.id_perfil = p.id AND pm.id_modulo = v_dashboard_id
    );
END $$;

COMMIT;
