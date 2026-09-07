-- Converge o menu "Acesso do Aluno > Portal do aluno" para o path/nome novos
-- em bancos JA migrados (as migrations V9/V32/V33/V34 foram ajustadas, mas o
-- Flyway nao reexecuta migrations ja aplicadas).
-- Idempotente: pode rodar N vezes; nao toca em outros "Dashboard"
-- (ex.: /view/relatorios/listDashboard.xhtml) nem no modulo Curriculo.

-- 1) Paths antigos do portal -> novo
UPDATE public.bas_modulo
SET outcome = '/aluno/portalAluno'
WHERE outcome IN ('/aluno/dashboard', '/portalAluno');

-- 2) Rotulo antigo da tela do portal -> 'Portal do aluno'
-- (escopo restrito ao outcome do portal para nao afetar outros menus)
UPDATE public.bas_modulo
SET rotulo = 'Portal do aluno'
WHERE outcome = '/aluno/portalAluno'
  AND lower(rotulo) IN ('dashboard', 'dashboard do aluno');

-- 3) Raiz "Aluno": garante outcome do portal quando estiver nulo
UPDATE public.bas_modulo
SET outcome = '/aluno/portalAluno'
WHERE id_modulo IS NULL
  AND lower(rotulo) = 'aluno'
  AND outcome IS NULL;
