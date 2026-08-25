-- V48: Ajusta a estrutura do menu Currículo para Currículo Empresa
-- 1. Renomeia o módulo raiz "Currículo" para "Currículo Empresa"
-- 2. Cria submenu "Configurações" sob "Currículo Empresa"
-- 3. Move "Configuração" para dentro de "Configurações" e renomeia para "Configuração de curriculo empresa"

-- 1) Renomeia o módulo raiz
UPDATE public.bas_modulo
SET rotulo = 'Currículo Empresa',
    descricao = 'Vagas, empresas, entrevistas e configurações do módulo de Currículo Empresa'
WHERE lower(rotulo) = 'currículo' AND id_modulo IS NULL;

-- 2) Cria o submenu "Configurações" sob "Currículo Empresa"
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), pai.id, 'Configurações', 'Configurações do módulo Currículo Empresa', '⚙️', NULL, 'Submenu de configurações', 99
FROM public.bas_modulo pai
WHERE lower(pai.rotulo) = 'currículo empresa' AND pai.id_modulo IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_modulo
      WHERE id_modulo = pai.id AND lower(rotulo) = 'configurações'
  );

-- 3) Move "Configuração" para dentro de "Configurações" e renomeia
UPDATE public.bas_modulo
SET id_modulo = (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'configurações' AND id_modulo IS NOT NULL
    LIMIT 1
),
    rotulo = 'Configuração de curriculo empresa',
    descricao = 'Configurações de currículo da empresa',
    ajuda = 'Configuração de currículo para empresas parceiras (cur_configuracao_empresa).',
    ordem = 1
WHERE outcome = '/curriculo/configuracao';

-- 4) Atualiza permissoes do admin para o novo modulo "Configurações"
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.rotulo = 'Configurações' AND m.id_modulo IS NOT NULL
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );