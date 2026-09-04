-- V55: Ajuste do menu Relatórios - Renomeia "Painéis e recursos" para "Recursos",
-- remove Organograma, cria submenu "Painéis" e move Dashboard para lá.

BEGIN;

-- 1) Renomeia "Painéis e recursos" (id 233) para "Recursos"
UPDATE public.bas_modulo
SET rotulo = 'Recursos',
    descricao = 'Recursos'
WHERE id = (SELECT id INTO v_paineis_id FROM public.bas_modulo WHERE rotulo = 'Painéis e recursos' LIMIT 1);

-- 2) Remove Organograma (id 239) e seus filhos recursivamente
CREATE TEMP TABLE to_delete AS
WITH RECURSIVE cte AS (
    SELECT id FROM public.bas_modulo WHERE rotulo = 'Organograma'
    UNION ALL
    SELECT m.id FROM public.bas_modulo m
    JOIN cte d ON m.id_modulo = d.id
)
SELECT id FROM cte;

DELETE FROM public.bas_perfil_modulo WHERE id_modulo IN (SELECT id FROM to_delete);
DELETE FROM public.bas_modulo WHERE id IN (SELECT id FROM to_delete);

-- 3) Cria novo submenu "Painéis" sob "Relatórios" (id 230)
-- Usa próximo ID disponível (maior que 250 baseado no sequence)
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), (SELECT id INTO v_paineis_id FROM public.bas_modulo WHERE rotulo = 'Relatórios' LIMIT 1), 'Painéis', 'Painéis', 'fa fa-th-large', NULL, NULL, 100
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE rotulo = 'Painéis');

-- 4) Move Dashboard (id 240) para ser filho do novo "Painéis"
-- Primeiro pega o ID do novo "Painéis"
DO $$
DECLARE
    v_paineis_id INTEGER;
BEGIN
    SELECT id INTO v_paineis_id FROM public.bas_modulo WHERE rotulo = 'Painéis' LIMIT 1;
    
    IF v_paineis_id IS NOT NULL THEN
        UPDATE public.bas_modulo
        SET id_modulo = v_paineis_id,
            ordem = 1
        WHERE rotulo = 'Dashboard'; -- Dashboard
        
        -- Concede acesso ao perfil Administrador
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, v_paineis_id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE lower(p.descricao) = 'administrador'
        AND NOT EXISTS (
            SELECT 1 FROM public.bas_perfil_modulo pm
            WHERE pm.id_perfil = p.id AND pm.id_modulo = v_paineis_id
        );
        
        -- Concede acesso ao Dashboard para o perfil Administrador
        INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
        SELECT p.id, 240, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
        FROM public.bas_perfil p
        WHERE lower(p.descricao) = 'administrador'
        AND NOT EXISTS (
            SELECT 1 FROM public.bas_perfil_modulo pm
            WHERE pm.id_perfil = p.id AND pm.id_modulo = 240
        );
    END IF;
END $$;

-- 5) Garante que Dashboard não está mais sob "Tipos Relatórios" (id 232) - já não está, mas por segurança
UPDATE public.bas_modulo
SET id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Painéis' LIMIT 1)
WHERE rotulo = 'Dashboard' ;

COMMIT;