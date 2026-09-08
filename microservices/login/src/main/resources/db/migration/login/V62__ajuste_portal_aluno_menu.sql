-- Ajuste do menu do portal do aluno: substitui qualquer referencia a dashboard por /aluno/portalAluno com o rotulo "Portal Aluno"

UPDATE public.bas_modulo
SET outcome = '/aluno/portalAluno', rotulo = 'Portal Aluno'
WHERE outcome = '/aluno/dashboard' OR outcome = '/portalAluno' OR lower(rotulo) IN ('dashboard', 'dashboard do aluno', 'portal do aluno');

UPDATE public.bas_modulo
SET rotulo = 'Portal Aluno'
WHERE outcome = '/aluno/portalAluno';
