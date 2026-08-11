-- V12: Remove o modulo "Pagina Inicial" do menu (bas_modulo) e todas as
-- referencias a ele. A pagina inicial agora e fixa no front-end (rota /default),
-- e o registro no banco duplicava o item "Inicio" da barra lateral. Idempotente.

-- 1) Remove as permissoes dos perfis sobre o modulo.
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'pagina inicial' OR id = 24
);

-- 2) Remove os favoritos de perfil que apontem para o modulo.
DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'pagina inicial' OR id = 24
);

-- 3) Remove os favoritos de usuario que apontem para o modulo.
DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'pagina inicial' OR id = 24
);

-- 4) Remove os vinculos de status sobre o modulo.
DELETE FROM public.bas_status_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'pagina inicial' OR id = 24
);

-- 5) Remove modulos filhos que tenham o modulo como pai.
DELETE FROM public.bas_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'pagina inicial' OR id = 24
);

-- 6) Remove o proprio modulo do menu.
DELETE FROM public.bas_modulo
WHERE lower(rotulo) = 'pagina inicial' OR id = 24;
