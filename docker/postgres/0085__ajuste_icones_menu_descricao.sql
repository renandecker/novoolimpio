-- V85: Ajusta icones dos modulos e menus do app React conforme descricao e padrao dos favoritos do sistema
-- Garante que os icones dos modulos utilizem classes Font Awesome validas presentes em bas_icone (estilo 4.x: fa fa-*)

-- Administração -> Cogs / gear
UPDATE public.bas_modulo SET icone = 'fa fa-cogs' WHERE id_modulo IS NULL AND lower(rotulo) = 'administração';

-- Básico -> Database / table / list
UPDATE public.bas_modulo SET icone = 'fa fa-database' WHERE id_modulo IS NULL AND lower(rotulo) = 'básico';

-- Comercial -> Shopping cart
UPDATE public.bas_modulo SET icone = 'fa fa-shopping-cart' WHERE id_modulo IS NULL AND lower(rotulo) = 'comercial';

-- Acadêmico -> Graduation cap
UPDATE public.bas_modulo SET icone = 'fa fa-graduation-cap' WHERE id_modulo IS NULL AND lower(rotulo) = 'acadêmico';

-- Relatórios -> Chart bar
UPDATE public.bas_modulo SET icone = 'fa fa-bar-chart' WHERE id_modulo IS NULL AND lower(rotulo) = 'relatórios';

-- Financeiro -> Money / wallet
UPDATE public.bas_modulo SET icone = 'fa fa-money' WHERE id_modulo IS NULL AND lower(rotulo) = 'financeiro';

-- Estoque -> Boxes / cubes
UPDATE public.bas_modulo SET icone = 'fa fa-cubes' WHERE id_modulo IS NULL AND lower(rotulo) = 'estoque';

-- Professor -> Chalkboard / university
UPDATE public.bas_modulo SET icone = 'fa fa-university' WHERE id_modulo IS NULL AND lower(rotulo) = 'professor';

-- Aluno -> User / graduate
UPDATE public.bas_modulo SET icone = 'fa fa-user' WHERE id_modulo IS NULL AND lower(rotulo) = 'aluno';

-- Agenda / Compromissos -> Calendar
UPDATE public.bas_modulo SET icone = 'fa fa-calendar' WHERE id_modulo IS NULL AND lower(rotulo) = 'agenda';

-- Notificações / Comunicação -> Bell
UPDATE public.bas_modulo SET icone = 'fa fa-bell' WHERE id_modulo IS NULL AND (lower(rotulo) = 'notificações' OR lower(rotulo) = 'comunicação');

-- Configuração / Estrutura / Parâmetros -> Sliders / cogs
UPDATE public.bas_modulo SET icone = 'fa fa-sliders' WHERE lower(rotulo) LIKE '%configura%';
UPDATE public.bas_modulo SET icone = 'fa fa-wrench' WHERE lower(rotulo) LIKE '%estrutura%';
UPDATE public.bas_modulo SET icone = 'fa fa-file-text-o' WHERE lower(rotulo) LIKE '%documento%';
UPDATE public.bas_modulo SET icone = 'fa fa-users' WHERE lower(rotulo) LIKE '%usuário%' OR lower(rotulo) LIKE '%perfil%';
UPDATE public.bas_modulo SET icone = 'fa fa-shield' WHERE lower(rotulo) LIKE '%auditoria%';

-- Submenus comuns
UPDATE public.bas_modulo SET icone = 'fa fa-building' WHERE lower(rotulo) LIKE '%unidade%';
UPDATE public.bas_modulo SET icone = 'fa fa-book' WHERE lower(rotulo) LIKE '%curso%';
UPDATE public.bas_modulo SET icone = 'fa fa-door' WHERE lower(rotulo) LIKE '%sala%';
UPDATE public.bas_modulo SET icone = 'fa fa-graduation-cap' WHERE lower(rotulo) LIKE '%turma%';
UPDATE public.bas_modulo SET icone = 'fa fa-id-card' WHERE lower(rotulo) LIKE '%matricula%' OR lower(rotulo) LIKE '%rematricula%';
UPDATE public.bas_modulo SET icone = 'fa fa-money' WHERE lower(rotulo) LIKE '%cobranca%' OR lower(rotulo) LIKE '%caixa%';
UPDATE public.bas_modulo SET icone = 'fa fa-line-chart' WHERE lower(rotulo) LIKE '%dashboard%' OR lower(rotulo) LIKE '%indicador%';
