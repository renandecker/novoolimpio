-- V49: Adiciona módulo "Tipos Relatórios" como pai e "Organograma" como filho
-- Idempotente: pode rodar mais de uma vez sem efeitos colaterais.


DELETE FROM public.bas_modulo WHERE outcome = '/view/relatorios/listOrganograma.xhtml';

-- 2) Cria/atualiza o módulo "Organograma" como filho de "Tipos Relatórios"
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Tipos Relatórios' LIMIT 1),
       'Organograma', 'Cadastro e visualização de organogramas', '🌳', '/view/relatorios/listOrganograma', 'CRUD de organogramas (estrutura organizacional)', 10
WHERE NOT EXISTS (
    SELECT 1 FROM public.bas_modulo WHERE outcome = '/view/relatorios/listOrganograma'
    AND id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Tipos Relatórios' LIMIT 1)
);

-- 3) Opcional: Move módulos de relatório existentes para baixo de "Tipos Relatórios"
-- Tabela
UPDATE public.bas_modulo
SET id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Tipos Relatórios' LIMIT 1)
WHERE outcome = '/view/relatorios/listTabela'
  AND (id_modulo IS NULL OR id_modulo != (SELECT id FROM public.bas_modulo WHERE rotulo = 'Tipos Relatórios' LIMIT 1));

-- Gráfico
UPDATE public.bas_modulo
SET id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Tipos Relatórios' LIMIT 1)
WHERE outcome = '/view/relatorios/listGrafico'
  AND (id_modulo IS NULL OR id_modulo != (SELECT id FROM public.bas_modulo WHERE rotulo = 'Tipos Relatórios' LIMIT 1));

-- Mapa
UPDATE public.bas_modulo
SET id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Tipos Relatórios' LIMIT 1)
WHERE outcome = '/view/relatorios/listMapa'
  AND (id_modulo IS NULL OR id_modulo != (SELECT id FROM public.bas_modulo WHERE rotulo = 'Tipos Relatórios' LIMIT 1));

-- Dashboard
UPDATE public.bas_modulo
SET id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Tipos Relatórios' LIMIT 1)
WHERE outcome = '/view/relatorios/listDashboard'
  AND (id_modulo IS NULL OR id_modulo != (SELECT id FROM public.bas_modulo WHERE rotulo = 'Tipos Relatórios' LIMIT 1));



-- 4) Concede ao perfil Administrador acesso aos novos módulos
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.rotulo IN ('Tipos Relatórios', 'Organograma')
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );


-- Garante permissão de Administrador para o módulo Organograma e Tipos Relatórios
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON lower(m.rotulo) IN ('organograma', 'tipos relatórios', 'tipos relatorios')
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );