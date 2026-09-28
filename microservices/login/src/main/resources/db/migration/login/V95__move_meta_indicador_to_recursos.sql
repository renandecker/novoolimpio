-- V95: Move "Meta" (/view/meta/listMeta.xhtml) e "Indicador" (/view/indicador/listIndicador)
-- para serem filhos do submenu "Recursos" (sob "Relatórios").
-- Origem: docker/postgres/0080__move_meta_indicador_to_recursos.sql
-- Diferenca em relacao ao V69: o V69 move "Meta Dinâmica" (/view/meta/listMetaDinamica),
-- enquanto esta migracao move a tela "Meta" (/view/meta/listMeta.xhtml), que vivia sob
-- "Call Center". As duas sao telas distintas e convivem sob "Recursos".
-- Idempotente: pode rodar mais de uma vez (restore docker + Flyway login).

BEGIN;

DO $$
DECLARE
    v_recursos_id INTEGER;
    v_meta_id INTEGER;
    v_indicador_id INTEGER;
BEGIN
    -- 1) Busca o ID de "Recursos" (filho de "Relatórios")
    SELECT id INTO v_recursos_id
    FROM public.bas_modulo
    WHERE rotulo = 'Recursos'
      AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1)
    LIMIT 1;

    IF v_recursos_id IS NULL THEN
        RAISE NOTICE 'V95: submenu Recursos não encontrado, nada a fazer.';
        RETURN;
    END IF;

    -- 2) Busca o ID de "Meta" (outcome: /view/meta/listMeta.xhtml)
    SELECT id INTO v_meta_id
    FROM public.bas_modulo
    WHERE outcome = '/view/meta/listMeta.xhtml'
    LIMIT 1;

    -- 3) Busca o ID de "Indicador" (outcome: /view/indicador/listIndicador)
    SELECT id INTO v_indicador_id
    FROM public.bas_modulo
    WHERE outcome = '/view/indicador/listIndicador'
    LIMIT 1;

    -- 4) Move "Meta" para ser filho de "Recursos"
    IF v_meta_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_recursos_id,
            ordem = 1
        WHERE id = v_meta_id;

        -- Concede acesso ao "Meta" para o perfil administrativo
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_meta_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE lower(trim(p.descricao)) IN ('admin', 'administrador')
          AND NOT EXISTS (
              SELECT 1 FROM public.bas_perfil_modulo pm
              WHERE pm.id_perfil = p.id AND pm.id_modulo = v_meta_id
          );
    END IF;

    -- 5) Move "Indicador" para ser filho de "Recursos"
    IF v_indicador_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_recursos_id,
            ordem = 2
        WHERE id = v_indicador_id;

        -- Concede acesso ao "Indicador" para o perfil administrativo
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_indicador_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE lower(trim(p.descricao)) IN ('admin', 'administrador')
          AND NOT EXISTS (
              SELECT 1 FROM public.bas_perfil_modulo pm
              WHERE pm.id_perfil = p.id AND pm.id_modulo = v_indicador_id
          );
    END IF;
END $$;

COMMIT;
