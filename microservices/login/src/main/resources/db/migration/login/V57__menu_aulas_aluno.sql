-- V57: Atualiza o rótulo do menu de "Registro de Aulas" para "Aulas"

BEGIN;

UPDATE public.bas_modulo
SET rotulo = 'Aulas',
    descricao = 'Aulas das turmas do aluno'
WHERE outcome = '/aluno/aulas';

COMMIT;
