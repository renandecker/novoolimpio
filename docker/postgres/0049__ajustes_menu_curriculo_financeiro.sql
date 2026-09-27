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

-- 3) Garante que "Configuração Financeira" esteja corretamente rotulada e sob o submenu "Configurações"
-- (sob "Administração"). O pai e resolvido por rotulo com LIMIT 1, sem depender do id do modulo.
UPDATE public.bas_modulo
SET rotulo = 'Configuração Financeira',
    icone = '💰',
    id_modulo = COALESCE(
        (SELECT c.id
           FROM public.bas_modulo c
          WHERE lower(c.rotulo) = 'configurações'
            AND c.id_modulo = (SELECT p.id FROM public.bas_modulo p WHERE lower(p.rotulo) = 'administração' AND p.id_modulo IS NULL LIMIT 1)
          LIMIT 1),
        id_modulo
    )
WHERE outcome = 'view/configuracaoFinanceira/listConfiguracaoFinanceira';
