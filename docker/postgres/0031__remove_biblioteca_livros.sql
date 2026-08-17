-- V31: Remove do menu (bas_modulo) todos os modulos relacionados a "Biblioteca" e
-- "Livros", incluindo o submenu inteiro do grupo "Biblioteca", e todas as
-- referencias no banco: permissoes de perfil (bas_perfil_modulo), favoritos
-- (bas_favorito_perfil/bas_favorito_usuario), status (bas_status_modulo) e o
-- id_modulo padrao dos perfis (bas_perfil). Idempotente.

-- Coleta os ids dos modulos de Biblioteca/Livros (rotulo e/ou outcome) e todos
-- os descendentes do grupo "Biblioteca".
CREATE TEMP TABLE tmp_bib_livros AS
WITH RECURSIVE arvore AS (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) LIKE '%biblioteca%'
       OR lower(rotulo) LIKE '%livro%'
       OR lower(outcome) LIKE '%biblioteca%'
       OR lower(outcome) LIKE '%/livro%'
       OR lower(outcome) LIKE '%/livros%'
    UNION
    SELECT m.id FROM public.bas_modulo m
    JOIN arvore a ON m.id_modulo = a.id
)
SELECT id FROM arvore;

-- 1) Desvincula modulos filhos que apontem para os modulos removidos.
UPDATE public.bas_modulo
SET id_modulo = NULL
WHERE id_modulo IN (SELECT id FROM tmp_bib_livros);

-- 2) Remove as permissoes dos perfis sobre os modulos (bas_perfil_modulo).
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (SELECT id FROM tmp_bib_livros);

-- 3) Remove favoritos e status que apontem para os modulos.
DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (SELECT id FROM tmp_bib_livros);

DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (SELECT id FROM tmp_bib_livros);

DELETE FROM public.bas_status_modulo
WHERE id_modulo IN (SELECT id FROM tmp_bib_livros);

-- 4) Limpa o id_modulo padrao dos perfis (bas_perfil) que aponte para eles.
UPDATE public.bas_perfil
SET id_modulo = NULL
WHERE id_modulo IN (SELECT id FROM tmp_bib_livros);

-- 5) Remove os modulos.
DELETE FROM public.bas_modulo
WHERE id IN (SELECT id FROM tmp_bib_livros);

DROP TABLE tmp_bib_livros;
