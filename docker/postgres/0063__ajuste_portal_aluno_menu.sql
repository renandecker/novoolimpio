-- Migração para ajustar o menu do aluno: 
-- Remove referências a /aluno/dashboard e garante que o outcome seja /aluno/portalAluno com o nome "Portal Aluno".

UPDATE public.bas_modulo
SET outcome = '/aluno/portalAluno', rotulo = 'Portal Aluno'
WHERE outcome = '/aluno/dashboard' OR outcome = '/portalAluno' OR lower(rotulo) IN ('dashboard', 'dashboard do aluno', 'portal do aluno');

UPDATE public.bas_modulo
SET rotulo = 'Portal Aluno'
WHERE outcome = '/aluno/portalAluno';
