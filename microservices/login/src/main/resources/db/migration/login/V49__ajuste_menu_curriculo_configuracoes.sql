-- Migracao 49: Ajustes no menu conforme solicitado:
-- 1) Remove itens obsoletos do menu principal e submenus
-- 2) Move "Configuração do Currículo" para "Administração > Configurações"
-- 3) "Experiências Profissionais" ja existe em "Gestão de Currículo" (migracao 0047)

BEGIN;

-- 1) Remove "Atendimento" (id 118, sob Comercial id 31) do menu
-- First remove child modules and their permissions recursively
WITH RECURSIVE child_modules AS (
    SELECT id FROM public.bas_modulo
    WHERE rotulo = 'Atendimento'
      AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Comercial' AND id_modulo IS NULL LIMIT 1)
    UNION ALL
    SELECT m.id FROM public.bas_modulo m
    JOIN child_modules cm ON m.id_modulo = cm.id
)
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (SELECT id FROM child_modules);

WITH RECURSIVE child_modules AS (
    SELECT id FROM public.bas_modulo
    WHERE rotulo = 'Atendimento'
      AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Comercial' AND id_modulo IS NULL LIMIT 1)
    UNION ALL
    SELECT m.id FROM public.bas_modulo m
    JOIN child_modules cm ON m.id_modulo = cm.id
)
DELETE FROM public.bas_modulo
WHERE id IN (SELECT id FROM child_modules);

-- 2) Remove "Formulário de Tipo de Contrato" de "Gestão de Contrato"
DELETE FROM public.bas_perfil_modulo pm
USING public.bas_modulo m
WHERE pm.id_modulo = m.id
  AND m.outcome = '/view/tipoContrato/formTipoContrato';

DELETE FROM public.bas_modulo
WHERE outcome = '/view/tipoContrato/formTipoContrato';

-- 3) Remove "Vagas", "Empresas", "Unidades das Empresas", "Entrevistas", "Campos do Currículo", "Colunas do Currículo" de "Gestão de Currículo"
DELETE FROM public.bas_perfil_modulo pm
USING public.bas_modulo m
WHERE pm.id_modulo = m.id
  AND m.outcome IN (
      '/curriculo/vaga',
      '/curriculo/empresa',
      '/curriculo/empresa-unidade',
      '/curriculo/entrevista',
      '/curriculo/curriculo-campo',
      '/view/curriculo/colunas'
  );

DELETE FROM public.bas_modulo
WHERE outcome IN (
    '/curriculo/vaga',
    '/curriculo/empresa',
    '/curriculo/empresa-unidade',
    '/curriculo/entrevista',
    '/curriculo/curriculo-campo',
    '/view/curriculo/colunas'
);

-- 4) Move "Configuração do Currículo" de "Gestão de Currículo" para "Administração > Configurações"
-- Primeiro remove as permissoes antigas
DELETE FROM public.bas_perfil_modulo pm
USING public.bas_modulo m
WHERE pm.id_modulo = m.id
  AND m.outcome = '/curriculo/configuracao';

-- Atualiza o modulo para ficar sob "Configurações" (id_modulo = 25 = Administração)
UPDATE public.bas_modulo
SET id_modulo = (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Configurações' AND m.id_modulo = 25 LIMIT 1),
    ordem = 101
WHERE outcome = '/curriculo/configuracao';

-- Recria as permissoes para o Admin no novo local
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome = '/curriculo/configuracao'
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 5) Ajusta a ordem dos itens restantes em "Gestão de Currículo" para fechar as lacunas
-- Currículos (1), Formulário de Currículo (2), Experiências Profissionais (3)
UPDATE public.bas_modulo SET ordem = 1 WHERE outcome = '/view/curriculo/listCurriculo';
UPDATE public.bas_modulo SET ordem = 2 WHERE outcome = '/view/curriculo/formCurriculo';
UPDATE public.bas_modulo SET ordem = 3 WHERE outcome = '/curriculo/curriculo-trabalho';

-- 6) Avanca as sequencias
SELECT setval('public.bas_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_modulo), 254), true);
SELECT setval('public.bas_perfil_modulo_id_seq',
              GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.bas_perfil_modulo), 1), true);

COMMIT;