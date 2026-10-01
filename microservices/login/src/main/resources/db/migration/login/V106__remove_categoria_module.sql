-- V106: Remove modulo Categoria do sistema
-- Remove referencias ao modulo Categoria das tabelas bas_modulo e bas_perfil_modulo

-- 1) Remove entries do bas_perfil_modulo relacionados ao modulo Categoria
DELETE FROM public.bas_perfil_modulo mm
WHERE mm.id_modulo IN (
    SELECT m.id FROM public.bas_modulo m
    WHERE m.outcome IN ('/view/categoria/listCategoria', '/view/categoria/listCategoria.xhtml')
);

-- 2) Remove o modulo Categoria de bas_modulo
DELETE FROM public.bas_modulo m
WHERE m.outcome IN ('/view/categoria/listCategoria', '/view/categoria/listCategoria.xhtml');

-- 3) Limpeza de duplicatas/com extensoes .xhtml.xhtml caso existam
DELETE FROM public.bas_perfil_modulo mm
WHERE mm.id_modulo IN (
    SELECT m.id FROM public.bas_modulo m
    WHERE m.outcome LIKE '%/view/categoria/listCategoria%'
);

DELETE FROM public.bas_modulo m
WHERE m.outcome LIKE '%/view/categoria/listCategoria%';