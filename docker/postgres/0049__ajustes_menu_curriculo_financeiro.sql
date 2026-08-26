-- V49: Limpa duplicidade de Currículo e ajusta menu de Configuração Financeira

-- 1) Remove duplicidades de "Currículo" / "Currículo Empresa" incorretas ou sem submenus
DELETE FROM public.bas_perfil_modulo WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE (lower(rotulo) LIKE '%currículo%' OR lower(rotulo) LIKE '%curriculo%')
      AND id_modulo IS NULL
      AND rotulo <> 'Currículo Empresa'
);

DELETE FROM public.bas_modulo
WHERE (lower(rotulo) LIKE '%currículo%' OR lower(rotulo) LIKE '%curriculo%')
  AND id_modulo IS NULL
  AND rotulo <> 'Currículo Empresa';

-- 2) Remove duplicatas de "Configuração Financeira" (mesmo outcome), mantendo apenas uma
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE outcome = 'view/configuracaoFinanceira/listConfiguracaoFinanceira'
      AND id NOT IN (
          SELECT min(id) FROM public.bas_modulo
          WHERE outcome = 'view/configuracaoFinanceira/listConfiguracaoFinanceira'
      )
);

DELETE FROM public.bas_modulo
WHERE outcome = 'view/configuracaoFinanceira/listConfiguracaoFinanceira'
  AND id NOT IN (
      SELECT min(id) FROM public.bas_modulo
      WHERE outcome = 'view/configuracaoFinanceira/listConfiguracaoFinanceira'
  );

-- 3) Garante que "Configuração Financeira" esteja corretamente rotulada e sob o submenu "Configurações" (sob Administração, id_modulo = 25)
UPDATE public.bas_modulo
SET rotulo = 'Configuração Financeira',
    icone = '💰',
    id_modulo = COALESCE(
        (SELECT id FROM public.bas_modulo WHERE lower(rotulo) = 'configurações' AND id_modulo = 25 LIMIT 1),
        id_modulo
    )
WHERE outcome = 'view/configuracaoFinanceira/listConfiguracaoFinanceira';
