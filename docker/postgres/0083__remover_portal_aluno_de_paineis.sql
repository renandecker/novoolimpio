-- 0083__remover_portal_aluno_de_paineis.sql
-- Remove o item "Portal Aluno" de dentro de "Painéis" (filho de "Relatórios").
-- Causa raiz: 0063/V58 renomeava todo rotulo 'dashboard' para 'Portal Aluno',
-- atingindo por engano o Dashboard de Relatórios > Painéis.
-- Idempotente: pode rodar mais de uma vez (restore docker + Flyway login V72).
-- NÃO toca no Portal Aluno legítimo de "Acesso do Aluno".
-- Após remover, garante que o "Dashboard" volte a existir dentro de "Painéis".

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
        RAISE NOTICE '0083: menu Relatórios não encontrado, nada a fazer.';
        RETURN;
    END IF;

    -- 2) Localiza "Painéis" como filho de "Relatórios"
    SELECT id INTO v_paineis_id
    FROM public.bas_modulo
    WHERE rotulo IN ('Painéis', 'Paineis')
      AND id_modulo = v_relatorios_id
    LIMIT 1;

    IF v_paineis_id IS NULL THEN
        RAISE NOTICE '0083: submenu Painéis não encontrado, nada a fazer.';
        RETURN;
    END IF;

    -- 3) Remove vínculos de perfil do "Portal Aluno" que está dentro de "Painéis"
    DELETE FROM public.bas_perfil_modulo
    WHERE id_modulo IN (
        SELECT id FROM public.bas_modulo
        WHERE id_modulo = v_paineis_id
          AND (
                outcome = '/aluno/portalAluno'
             OR lower(trim(rotulo)) IN ('portal aluno', 'portal do aluno')
          )
    );

    -- 4) Remove o item "Portal Aluno" de dentro de "Painéis"
    -- (não afeta o Portal Aluno legítimo que fica sob "Acesso do Aluno")
    DELETE FROM public.bas_modulo
    WHERE id_modulo = v_paineis_id
      AND (
            outcome = '/aluno/portalAluno'
         OR lower(trim(rotulo)) IN ('portal aluno', 'portal do aluno')
      );

    -- 5) Garante que o "Dashboard" volte a existir dentro de "Painéis"
    SELECT id INTO v_dashboard_id
    FROM public.bas_modulo
    WHERE outcome = '/view/relatorios/listDashboard'
    ORDER BY id
    LIMIT 1;

    IF v_dashboard_id IS NULL THEN
        SELECT id INTO v_dashboard_id
        FROM public.bas_modulo
        WHERE lower(trim(rotulo)) = 'dashboard'
        ORDER BY id
        LIMIT 1;
    END IF;

    IF v_dashboard_id IS NULL THEN
        INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
        VALUES (nextval('public.bas_modulo_id_seq'), v_paineis_id, 'Dashboard', 'Dashboard', 'fa fa-th-large', '/view/relatorios/listDashboard', 'Painel de dashboards', 1)
        RETURNING id INTO v_dashboard_id;
    ELSE
        UPDATE public.bas_modulo
        SET id_modulo = v_paineis_id,
            rotulo = 'Dashboard',
            descricao = 'Dashboard',
            outcome = '/view/relatorios/listDashboard',
            ordem = 1
        WHERE id = v_dashboard_id;
    END IF;

    -- 6) Concede acesso ao "Dashboard" para o perfil Administrador
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
