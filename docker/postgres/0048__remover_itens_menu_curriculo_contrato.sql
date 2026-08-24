-- Migracao 48: Remove itens de menu obsoletos conforme solicitado.
--
-- Remove do menu e bas_modulo:
--   "Colunas do Contrato"           -> /view/contrato/colunasContrato
--   "Colunas de Matrícula"          -> /view/matricula/colunasContrato
--   "Formulário de Contrato"        -> /view/contrato/formContrato
--   "Colunas da Matriz Curricular"  -> /view/curriculo/colunasMatrizCurricular
--   "Colunas do Requisito de Matriz"-> /view/curriculo/colunasRequisitoMatriz
--
-- Mantem "Formulário de Currículo"  -> /view/curriculo/formCurriculo
--   (ja aponta para a tela de Cadastro/Edição do "Curriculo de Curso" - ViewCurriculoFormCurriculoListScreen)

-- 1) Remove permissoes (bas_perfil_modulo) dos modulos a serem removidos
DELETE FROM public.bas_perfil_modulo pm
USING public.bas_modulo m
WHERE pm.id_modulo = m.id
  AND m.outcome IN (
      '/view/contrato/colunasContrato',
      '/view/matricula/colunasContrato',
      '/view/contrato/formContrato',
      '/view/curriculo/colunasMatrizCurricular',
      '/view/curriculo/colunasRequisitoMatriz'
  );

-- 2) Remove os modulos (bas_modulo) - telas filhas
DELETE FROM public.bas_modulo
WHERE outcome IN (
    '/view/contrato/colunasContrato',
    '/view/matricula/colunasContrato',
    '/view/contrato/formContrato',
    '/view/curriculo/colunasMatrizCurricular',
    '/view/curriculo/colunasRequisitoMatriz'
);

-- 3) Ajusta o "Formulário de Currículo" para garantir que a descricao e ajuda
--    reflitam que e a tela de Cadastro/Edição do "Curriculo de Curso"
UPDATE public.bas_modulo
SET descricao = 'Cadastro e edição de currículos de curso',
    ajuda = 'Formulário wizard para manutenção completa do currículo do curso (dados, matriz curricular, requisitos, unidades, material escolar e documentos).'
WHERE outcome = '/view/curriculo/formCurriculo';

-- 4) Avanca as sequencias para nao colidir com proximos inserts
SELECT setval('public.bas_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 254), true);
SELECT setval('public.bas_perfil_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_perfil_modulo), 1), true);