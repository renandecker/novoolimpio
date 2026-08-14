-- V8: Registra o menu do microservico Asaas (bas_modulo) e da acesso ao perfil
-- Administrador. Idempotente (roda depois do restore do olimpio.sql a cada start).

-- 1) Remove eventuais registros anteriores do menu Asaas para evitar duplicidade.
--    Ordem importa (FK bas_modulo_id_modulo_fkey): vinculos de perfil, filhos e por fim o raiz.
DELETE FROM public.bas_perfil_modulo WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE rotulo IN ('Asaas', 'Cobranças Asaas', 'Clientes Asaas', 'Parcelas Asaas', 'Cobranças', 'Clientes', 'Parcelas')
       OR id_modulo IN (SELECT id FROM public.bas_modulo WHERE rotulo = 'Asaas' AND id_modulo IS NULL)
);
DELETE FROM public.bas_modulo WHERE id_modulo IS NOT NULL AND (
    rotulo IN ('Cobranças Asaas', 'Clientes Asaas', 'Parcelas Asaas', 'Cobranças', 'Clientes', 'Parcelas')
    OR id_modulo IN (SELECT id FROM public.bas_modulo WHERE rotulo = 'Asaas' AND id_modulo IS NULL)
);
DELETE FROM public.bas_modulo WHERE rotulo = 'Asaas' AND id_modulo IS NULL;

-- 2) Cria o modulo raiz Asaas.
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), NULL, 'Asaas', 'Integração com a plataforma Asaas', '💰', '/asaas/cobrancas', 'Cobranças, clientes e parcelas sincronizadas com o Asaas.', 300;

-- 3) Cria as telas filhas (Cobranças, Clientes, Parcelas).
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), pai.id, 'Cobranças', 'Cobranças do Asaas', '💰', '/asaas/cobrancas', 'Lista as cobranças criadas no Asaas.', 1
FROM public.bas_modulo pai WHERE pai.rotulo = 'Asaas' AND pai.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE rotulo = 'Cobranças Asaas');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), pai.id, 'Clientes', 'Clientes do Asaas', '👤', '/asaas/clientes', 'Lista os clientes cadastrados no Asaas.', 2
FROM public.bas_modulo pai WHERE pai.rotulo = 'Asaas' AND pai.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE rotulo = 'Clientes Asaas');

INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), pai.id, 'Parcelas', 'Parcelas Asaas locais', '💳', '/asaas/parcelas', 'Parcelas espelhadas do Asaas no banco local (fin_asaas_parcela).', 3
FROM public.bas_modulo pai WHERE pai.rotulo = 'Asaas' AND pai.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE rotulo = 'Parcelas Asaas');

-- 4) Concede ao perfil Administrador acesso aos novos modulos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE lower(p.descricao) = 'administrador'
  AND m.rotulo IN ('Asaas', 'Cobranças Asaas', 'Clientes Asaas', 'Parcelas Asaas')
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
