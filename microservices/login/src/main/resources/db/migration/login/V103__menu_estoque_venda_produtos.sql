-- V103: Adiciona menu Estoque > Vendas > Venda Produtos e renomeia/move "gestão vendas" para "Venda Produtos"
-- Idempotente: roda após o restore do olimpio.sql a cada start

-- 1) Garante o grupo raiz "Estoque" (se não existir, cria com ícone fa fa-cubes)
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), NULL, 'Estoque', 'Gestão de estoque e vendas de produtos', 'fa fa-cubes', '/view/estoque/estoqueproduto', 'Acesso às funcionalidades de estoque e vendas', 300
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo WHERE lower(rotulo) = 'estoque' AND id_modulo IS NULL
);

-- 2) Cria submenu "Vendas" dentro de "Estoque"
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), pai.id, 'Vendas', 'Vendas de produtos e controle de pendências', 'fa fa-shopping-cart', '/view/estoque/vendaproduto', 'Tela de vendas de produtos e pendências de entrega', 10
FROM public.bas_modulo pai
WHERE lower(pai.rotulo) = 'estoque' AND pai.id_modulo IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_modulo WHERE lower(rotulo) = 'vendas' AND id_modulo = pai.id
  );

-- 3) Cria item "Venda Produtos" dentro de "Estoque > Vendas"
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), vendas.id, 'Venda Produtos', 'Listagem e gestão de vendas de produtos', 'fa fa-shopping-bag', '/view/estoque/vendaproduto', 'Visualizar e gerenciar vendas de produtos e pendências', 1
FROM public.bas_modulo vendas
WHERE lower(vendas.rotulo) = 'vendas' AND vendas.id_modulo IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/estoque/vendaproduto' AND id_modulo = vendas.id
  );

-- 4) Move/renomeia possíveis itens "gestão vendas" ou "gestao vendas" existentes para a nova estrutura
-- Atualiza o rótulo e outcome de módulos que possam ser a antiga "gestão vendas"
UPDATE public.bas_modulo
SET rotulo = 'Venda Produtos',
    outcome = '/view/estoque/vendaproduto',
    icone = 'fa fa-shopping-bag',
    descricao = 'Listagem e gestão de vendas de produtos',
    id_modulo = (
        SELECT vendas.id
        FROM public.bas_modulo vendas
        WHERE lower(vendas.rotulo) = 'vendas' AND vendas.id_modulo IS NOT NULL
        LIMIT 1
    )
WHERE (lower(rotulo) LIKE '%gestão vendas%' OR lower(rotulo) LIKE '%gestao vendas%' OR lower(rotulo) LIKE '%gestão de vendas%')
  AND outcome IS DISTINCT FROM '/view/estoque/vendaproduto';

-- 5) Concede ao perfil Administrador acesso aos novos módulos
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome IN ('/view/estoque/vendaproduto')
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- 6) Ajusta a ordem dos submenus de Estoque (opcional)
UPDATE public.bas_modulo SET ordem = 5 WHERE lower(rotulo) = 'vendas' AND id_modulo IS NOT NULL;
UPDATE public.bas_modulo SET ordem = 10 WHERE outcome = '/view/estoque/estoqueproduto' AND id_modulo IS NOT NULL;
UPDATE public.bas_modulo SET ordem = 20 WHERE outcome = '/view/estoque/controleestoque' AND id_modulo IS NOT NULL;