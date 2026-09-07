-- 0057__menu_aulas_aluno.sql: Atualiza o rótulo do menu do aluno de "Registro de Aulas" para "Aulas"
UPDATE public.bas_modulo
SET rotulo = 'Aulas',
    descricao = 'Aulas das turmas do aluno'
WHERE outcome = '/aluno/aulas';
