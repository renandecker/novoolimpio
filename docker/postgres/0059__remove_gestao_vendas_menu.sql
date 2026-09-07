-- V59: Remove "Gestão Vendas" e seus itens filhos do menu Financeiro
-- O submenu "Gestão Vendas" e seus filhos (Venda Produtos, Pendencia Produtos) devem ser removidos.

BEGIN;

-- Remove permissões associadas aos módulos
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'gestão vendas'
       OR lower(outcome) LIKE '%/view/venda/vendaproduto%'
       OR lower(outcome) LIKE '%/view/venda/pendenciaproduto%'
);

-- Remove favoritos de perfil associados
DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'gestão vendas'
       OR lower(outcome) LIKE '%/view/venda/vendaproduto%'
       OR lower(outcome) LIKE '%/view/venda/pendenciaproduto%'
);

-- Remove favoritos de usuário associados
DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'gestão vendas'
       OR lower(outcome) LIKE '%/view/venda/vendaproduto%'
       OR lower(outcome) LIKE '%/view/venda/pendenciaproduto%'
);

-- Remove status associados aos módulos
DELETE FROM public.bas_status_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) = 'gestão vendas'
       OR lower(outcome) LIKE '%/view/venda/vendaproduto%'
       OR lower(outcome) LIKE '%/view/venda/pendenciaproduto%'
);

-- Remove módulos filhos primeiro (Venda Produtos, Pendencia Produtos)
DELETE FROM public.bas_modulo
WHERE lower(outcome) LIKE '%/view/venda/vendaproduto%'
   OR lower(outcome) LIKE '%/view/venda/pendenciaproduto%';

-- Remove o próprio módulo "Gestão Vendas"
DELETE FROM public.bas_modulo
WHERE lower(rotulo) = 'gestão vendas';

COMMIT;