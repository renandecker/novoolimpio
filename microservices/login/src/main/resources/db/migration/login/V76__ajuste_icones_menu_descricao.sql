-- V76__ajuste_icones_menu_descricao.sql
-- Ajusta os ícones do menu no microsserviço de login conforme a descrição e o padrão dos favoritos
-- Usa classes Font Awesome 4.x (fa fa-*) que existem na tabela bas_icone

UPDATE public.bas_modulo SET icone = 'fa fa-cogs' WHERE id_modulo IS NULL AND lower(rotulo) = 'administração';
UPDATE public.bas_modulo SET icone = 'fa fa-database' WHERE id_modulo IS NULL AND lower(rotulo) = 'básico';
UPDATE public.bas_modulo SET icone = 'fa fa-shopping-cart' WHERE id_modulo IS NULL AND lower(rotulo) = 'comercial';
UPDATE public.bas_modulo SET icone = 'fa fa-graduation-cap' WHERE id_modulo IS NULL AND lower(rotulo) = 'acadêmico';
UPDATE public.bas_modulo SET icone = 'fa fa-bar-chart' WHERE id_modulo IS NULL AND lower(rotulo) = 'relatórios';
UPDATE public.bas_modulo SET icone = 'fa fa-money' WHERE id_modulo IS NULL AND lower(rotulo) = 'financeiro';
UPDATE public.bas_modulo SET icone = 'fa fa-cubes' WHERE id_modulo IS NULL AND lower(rotulo) = 'estoque';
UPDATE public.bas_modulo SET icone = 'fa fa-university' WHERE id_modulo IS NULL AND lower(rotulo) = 'professor';
UPDATE public.bas_modulo SET icone = 'fa fa-user' WHERE id_modulo IS NULL AND lower(rotulo) = 'aluno';
UPDATE public.bas_modulo SET icone = 'fa fa-calendar' WHERE id_modulo IS NULL AND lower(rotulo) = 'agenda';
UPDATE public.bas_modulo SET icone = 'fa fa-bell' WHERE id_modulo IS NULL AND (lower(rotulo) = 'notificações' OR lower(rotulo) = 'comunicação');

UPDATE public.bas_modulo SET icone = 'fa fa-sliders' WHERE lower(rotulo) LIKE '%configura%';
UPDATE public.bas_modulo SET icone = 'fa fa-wrench' WHERE lower(rotulo) LIKE '%estrutura%';
UPDATE public.bas_modulo SET icone = 'fa fa-file-text-o' WHERE lower(rotulo) LIKE '%documento%';
UPDATE public.bas_modulo SET icone = 'fa fa-users' WHERE lower(rotulo) LIKE '%usuário%' OR lower(rotulo) LIKE '%perfil%';
UPDATE public.bas_modulo SET icone = 'fa fa-shield' WHERE lower(rotulo) LIKE '%auditoria%';
UPDATE public.bas_modulo SET icone = 'fa fa-building' WHERE lower(rotulo) LIKE '%unidade%';
UPDATE public.bas_modulo SET icone = 'fa fa-book' WHERE lower(rotulo) LIKE '%curso%';
UPDATE public.bas_modulo SET icone = 'fa fa-door' WHERE lower(rotulo) LIKE '%sala%';
UPDATE public.bas_modulo SET icone = 'fa fa-graduation-cap' WHERE lower(rotulo) LIKE '%turma%';
UPDATE public.bas_modulo SET icone = 'fa fa-id-card' WHERE lower(rotulo) LIKE '%matricula%' OR lower(rotulo) LIKE '%rematricula%';
UPDATE public.bas_modulo SET icone = 'fa fa-money' WHERE lower(rotulo) LIKE '%cobranca%' OR lower(rotulo) LIKE '%caixa%';
UPDATE public.bas_modulo SET icone = 'fa fa-line-chart' WHERE lower(rotulo) LIKE '%dashboard%' OR lower(rotulo) LIKE '%indicador%';
