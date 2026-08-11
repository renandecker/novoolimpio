-- V11: Corrige o modulo "Gênero" no menu (bas_modulo).
-- O registro que aponta para /view/genero/listGenero.xhtml estava com rotulo "Etnia"
-- e sem modulo pai, fazendo o bas_genero aparecer como "Etnia" no menu/titulo e fora
-- do grupo "Gestão de Pessoas e afins". Idempotente.

UPDATE public.bas_modulo AS m
SET rotulo    = 'Gênero',
    id_modulo = p.id,
    ordem     = 100
FROM public.bas_modulo AS p
WHERE lower(p.rotulo) = 'gestão de pessoas e afins'
  AND p.id_modulo IS NOT NULL
  AND lower(m.outcome) LIKE '/view/genero/listgenero%'
  AND (lower(m.rotulo) <> 'gênero' OR m.id_modulo IS DISTINCT FROM p.id OR m.ordem IS DISTINCT FROM 100);
